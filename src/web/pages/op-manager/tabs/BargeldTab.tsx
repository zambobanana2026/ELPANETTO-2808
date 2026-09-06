import { useMemo, useRef, useState } from "react";
import { BarabhebungenKorrekturInput } from "../components/BarabhebungenKorrekturInput";
import { CashExpenseForm } from "../components/CashExpenseForm";
import { CashExpenseTable } from "../components/CashExpenseTable";
import { CategoryBarChart } from "../components/CategoryBarChart";
import { SummaryTiles } from "../components/SummaryTiles";
import {
  computeBarabhebungenTotal,
  computeCashBalance,
  computeExpensesByCategory,
  computeTotalExpenses,
  sortExpensesByDate,
} from "../lib/cashBalance";
import { loadCashState, saveCashState, type CashPersistedState } from "../lib/cashStorage";
import { formatEuro } from "../lib/format";
import { playCashRegisterChime } from "../lib/sound";
import { loadState } from "../lib/storage";
import type { CashExpense } from "../types";

export function BargeldTab() {
  // Read-only snapshot of Kontoauszug's transactions — this tab derives its
  // balance from bank withdrawals marked there, but owns no part of that
  // tab's data or state management (stays independently editable).
  const [kontoauszugState] = useState(() => loadState());
  const [initial] = useState(() => loadCashState());
  const [expenses, setExpenses] = useState<CashExpense[]>(initial.expenses);
  const [categories, setCategories] = useState<string[]>(initial.categories);
  const [soundEnabled, setSoundEnabled] = useState(initial.soundEnabled);
  const [barabhebungenKorrektur, setBarabhebungenKorrektur] = useState(initial.barabhebungenKorrektur);
  const [justAdded, setJustAdded] = useState(false);
  const justAddedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persist = (next: Partial<CashPersistedState>) => {
    saveCashState({
      expenses: next.expenses ?? expenses,
      categories: next.categories ?? categories,
      soundEnabled: next.soundEnabled ?? soundEnabled,
      barabhebungenKorrektur: next.barabhebungenKorrektur ?? barabhebungenKorrektur,
    });
  };

  const handleAddExpense = (input: { datum: string; betrag: number; kategorie: string }) => {
    const expense: CashExpense = {
      id: crypto.randomUUID(),
      datum: input.datum,
      betrag: input.betrag,
      kategorie: input.kategorie,
      erfasstAm: new Date().toISOString(),
    };
    const next = [...expenses, expense];
    setExpenses(next);
    persist({ expenses: next });

    if (soundEnabled) playCashRegisterChime();
    setJustAdded(true);
    // Cancel any still-pending hide from a rapid previous add, so this
    // banner gets its own full 900ms instead of being cut short by it.
    if (justAddedTimeoutRef.current) clearTimeout(justAddedTimeoutRef.current);
    justAddedTimeoutRef.current = setTimeout(() => setJustAdded(false), 900);
  };

  const handleAddCategory = (kategorie: string) => {
    if (categories.includes(kategorie)) return;
    const next = [...categories, kategorie];
    setCategories(next);
    persist({ categories: next });
  };

  const handleDeleteCategory = (kategorie: string) => {
    if (categories.length <= 1) return;
    const next = categories.filter((c) => c !== kategorie);
    setCategories(next);
    persist({ categories: next });
  };

  const barabhebungenAbgeleitet = useMemo(
    () => computeBarabhebungenTotal(kontoauszugState.transactions),
    [kontoauszugState]
  );
  const barabhebungenTotal = Math.round((barabhebungenAbgeleitet + barabhebungenKorrektur) * 100) / 100;
  const sortedExpenses = useMemo(() => sortExpensesByDate(expenses), [expenses]);
  const totalExpenses = useMemo(() => computeTotalExpenses(expenses), [expenses]);
  const cashBalance = useMemo(() => computeCashBalance(barabhebungenTotal, expenses), [barabhebungenTotal, expenses]);
  const expensesByCategory = useMemo(() => computeExpensesByCategory(expenses), [expenses]);

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">💶 Bargeld</h2>
        <label className="flex items-center gap-2 text-sm text-stone-500">
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => {
              setSoundEnabled(e.target.checked);
              persist({ soundEnabled: e.target.checked });
            }}
            className="h-4 w-4 rounded border-stone-300 text-indigo-600 focus:ring-indigo-500"
          />
          🔊 Sound-Effekte
        </label>
      </div>

      <SummaryTiles
        tiles={[
          {
            label: "Bar-Abhebungen gesamt",
            value: formatEuro(barabhebungenTotal),
            color: "text-stone-700",
            sub: `Aus Kontoauszug ${formatEuro(barabhebungenAbgeleitet)}${
              barabhebungenKorrektur !== 0 ? ` + Korrektur ${formatEuro(barabhebungenKorrektur)}` : ""
            }`,
          },
          { label: "Ausgegeben", value: formatEuro(totalExpenses), color: "text-red-600" },
          {
            label: "Verbleibender Bargeldbestand",
            value: formatEuro(cashBalance),
            color: "text-indigo-700",
            highlight: true,
          },
        ]}
      />

      <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-3">
        <span className="text-xs text-stone-400">Fehlt eine Abhebung in der CSV? Hier korrigieren:</span>
        <BarabhebungenKorrekturInput
          korrektur={barabhebungenKorrektur}
          onChange={(v) => {
            setBarabhebungenKorrektur(v);
            persist({ barabhebungenKorrektur: v });
          }}
        />
      </div>

      {barabhebungenTotal === 0 && (
        <p className="text-sm text-stone-500">
          Noch keine Bar-Abhebungen markiert. Geh in den Kontoauszug-Tab und markiere eine Buchung mit 💵, oder trage
          die Abhebung oben als Korrektur ein.
        </p>
      )}

      <CashExpenseForm
        categories={categories}
        onAdd={handleAddExpense}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      {justAdded && (
        <div className="animate-op-feedback-in rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
          💸 Ausgabe eingetragen!
        </div>
      )}

      <CashExpenseTable expenses={sortedExpenses} />

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
          Ausgaben nach Kategorie
        </h3>
        <CategoryBarChart totals={expensesByCategory} />
      </div>

      <style>{`
        @keyframes op-feedback-in {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-op-feedback-in { animation: op-feedback-in 0.35s ease-out; }
      `}</style>
    </div>
  );
}
