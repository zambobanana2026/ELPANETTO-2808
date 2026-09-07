import { useMemo, useState } from "react";
import { formatEuro } from "../lib/format";
import { computeMinBudget, computeSnowballPlan } from "../lib/snowball";
import { loadOpenItemsState } from "../lib/openItemsStorage";

export function SchuldenabbauTab() {
  // Read-only snapshot of Offene Posten, same pattern as Übersicht.
  const [openItemsState] = useState(() => loadOpenItemsState());
  const [budgetInput, setBudgetInput] = useState(() => String(computeMinBudget(openItemsState.items)));
  const parsedBudget = parseFloat(budgetInput.replace(",", "."));
  const customBudget = Number.isFinite(parsedBudget) ? parsedBudget : null;
  const plan = useMemo(
    () => computeSnowballPlan(openItemsState.items, new Date(), customBudget),
    [openItemsState, customBudget]
  );
  const budgetWasRaised = customBudget != null && customBudget < plan.minBudget;

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">🎯 Schuldenabbau-Plan (Schneeball-Methode)</h2>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs font-semibold text-stone-500">
          Monatliches Budget für Schuldenabbau
          <input
            type="text"
            inputMode="decimal"
            value={budgetInput}
            onChange={(e) => setBudgetInput(e.target.value)}
            className="w-40 rounded-lg border border-stone-200 bg-transparent px-3 py-2 text-sm font-mono tabular-nums focus:border-indigo-500 focus:outline-none"
          />
        </label>
        <button
          type="button"
          onClick={() => setBudgetInput(String(plan.minBudget))}
          className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-500 hover:bg-stone-50"
        >
          Zurück auf Minimum ({formatEuro(plan.minBudget)})
        </button>
      </div>
      {budgetWasRaised && (
        <p className="text-xs text-amber-600">
          Deine Eingabe liegt unter der Summe der Mindestraten ({formatEuro(plan.minBudget)}) — es wird trotzdem
          mindestens dieser Betrag angesetzt.
        </p>
      )}

      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5">
        {plan.hitCap ? (
          <p className="text-sm font-semibold text-red-600">
            Mit diesem Budget ist kein Schuldenfrei-Datum innerhalb von 100 Jahren berechenbar — bitte Budget oder
            Beträge prüfen.
          </p>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">Voraussichtlich schuldenfrei ab</p>
            <p className="mt-1 text-2xl font-extrabold text-indigo-700">{plan.debtFreeDate}</p>
            <p className="mt-1 text-xs text-indigo-400">
              in {Math.floor((plan.debtFreeMonthIndex ?? 0) / 12)} Jahr
              {Math.floor((plan.debtFreeMonthIndex ?? 0) / 12) === 1 ? "" : "en"} und{" "}
              {(plan.debtFreeMonthIndex ?? 0) % 12} Monat{(plan.debtFreeMonthIndex ?? 0) % 12 === 1 ? "" : "en"} ab heute
            </p>
          </>
        )}
      </div>

      <p className="text-xs text-stone-400">
        Du zahlst jeden Monat fest {formatEuro(plan.budget)} für deine offenen Posten — egal wie viele davon schon
        abbezahlt sind. Jeder offene Posten bekommt zuerst seine eigene Monatsrate; alles, was danach vom Budget
        übrig ist (egal ob durch längst abbezahlte Posten, Sondertilgungen oder weil ein Posten genau in diesem
        Monat fertig wird), fließt sofort in den aktuellen Schneeball-Ziel-Posten. Reihenfolge: 🎯 1. Klarna, 🎯 2.
        Ertan, danach automatisch nach größtem Restbetrag.
      </p>

      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
              <th className="px-3 py-3 font-medium">Priorität</th>
              <th className="px-3 py-3 font-medium">Gläubiger</th>
              <th className="px-3 py-3 font-medium text-right">Restbetrag heute</th>
              <th className="px-3 py-3 font-medium text-right">Monatsrate</th>
              <th className="px-3 py-3 font-medium">Voraussichtlich abbezahlt</th>
            </tr>
          </thead>
          <tbody>
            {plan.rows.map((row) => (
              <tr key={row.item.id} className="border-b border-stone-100 last:border-0">
                <td className="px-3 py-2.5 font-mono tabular-nums">
                  {row.prioritaet === null ? "✓" : row.prioritaet <= 2 ? `🎯 ${row.prioritaet}` : row.prioritaet}
                </td>
                <td className="px-3 py-2.5 text-stone-800">{row.item.glaeubiger}</td>
                <td
                  className={`px-3 py-2.5 text-right font-mono tabular-nums ${
                    row.restbetragHeute > 0 ? "text-stone-800" : "text-green-600"
                  }`}
                >
                  {formatEuro(row.restbetragHeute)}
                </td>
                <td className="px-3 py-2.5 text-right font-mono tabular-nums text-stone-500">{formatEuro(row.monatsrate)}</td>
                <td className={`px-3 py-2.5 ${row.payoffMonthIndex === 0 ? "text-green-600" : "text-stone-800"}`}>
                  {row.payoffDate}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
