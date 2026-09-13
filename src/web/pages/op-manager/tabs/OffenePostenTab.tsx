import { useEffect, useMemo, useState } from "react";
import { MonthlyPaymentsView } from "../components/MonthlyPaymentsView";
import { OpenItemForm } from "../components/OpenItemForm";
import { OpenItemsSummary } from "../components/OpenItemsSummary";
import { OpenItemsTable } from "../components/OpenItemsTable";
import { computeMatchingPaymentSum, computeOpenItemsSummary, findMatchingTransaction, sortOpenItems } from "../lib/openItems";
import { loadOpenItemsState, saveOpenItemsState, type OpenItemsPersistedState } from "../lib/openItemsStorage";
import { loadState as loadKontoauszugState } from "../lib/storage";
import { playSuccessChime } from "../lib/sound";
import type { OpenItem, Transaction } from "../types";

export function OffenePostenTab() {
  const [initial] = useState(() => loadOpenItemsState());
  const [items, setItems] = useState<OpenItem[]>(initial.items);
  const [soundEnabled, setSoundEnabled] = useState(initial.soundEnabled);
  const [view, setView] = useState<"liste" | "monate">("liste");
  // Read-only reference to the Kontoauszug transactions, used only to
  // suggest a matching Verwendungszweck below — never written back to.
  const [kontoauszugTransactions] = useState<Transaction[]>(() => loadKontoauszugState().transactions);

  const persist = (next: Partial<OpenItemsPersistedState>) => {
    saveOpenItemsState({
      items: next.items ?? items,
      soundEnabled: next.soundEnabled ?? soundEnabled,
    });
  };

  const handleAdd = (input: {
    glaeubiger: string;
    kategorie: string;
    verwendungszweck: string;
    iban: string;
    gesamtbetrag: number;
    monatsrate: number;
    bereitsBezahlt: number;
    startMonat: string;
    istSchneeballZiel: boolean;
    notiz: string;
  }) => {
    const item: OpenItem = {
      id: crypto.randomUUID(),
      ...input,
      erfasstAm: new Date().toISOString(),
      quelle: "manuell",
    };
    const next = [...items, item];
    setItems(next);
    persist({ items: next });
  };

  const handleUpdateField = <K extends keyof OpenItem>(id: string, field: K, value: OpenItem[K]) => {
    const next = items.map((item) => (item.id === id ? { ...item, [field]: value } : item));
    setItems(next);
    persist({ items: next });
  };

  const handleMarkPaidOff = (id: string) => {
    const next = items.map((item) => (item.id === id ? { ...item, bereitsBezahlt: item.gesamtbetrag } : item));
    setItems(next);
    persist({ items: next });
    if (soundEnabled) playSuccessChime();
  };

  const handleDelete = (id: string) => {
    const next = items.filter((item) => item.id !== id);
    setItems(next);
    persist({ items: next });
  };

  // A manual edit always wins over the remembered Kontoauszug-sync — it
  // turns auto-sync off for this item so the correction sticks.
  const handleVerwendungszweckEdit = (id: string, value: string) => {
    const next = items.map((item) =>
      item.id === id ? { ...item, verwendungszweck: value, autoSyncVerwendungszweck: false } : item
    );
    setItems(next);
    persist({ items: next });
  };

  // Accepting a suggestion updates the text AND remembers the choice for
  // this Gläubiger, so every future Kontoauszug import re-syncs it
  // automatically without asking again.
  const handleAcceptMatch = (id: string, verwendungszweck: string) => {
    const next = items.map((item) =>
      item.id === id ? { ...item, verwendungszweck, autoSyncVerwendungszweck: true } : item
    );
    setItems(next);
    persist({ items: next });
  };

  const handleSetAutoSync = (id: string, enabled: boolean) => {
    const next = items.map((item) => (item.id === id ? { ...item, autoSyncVerwendungszweck: enabled } : item));
    setItems(next);
    persist({ items: next });
  };

  // A manual edit always wins over the remembered Kontoauszug-sync — it
  // turns auto-sync off for this item so the correction sticks.
  const handleBereitsBezahltEdit = (id: string, value: number) => {
    const next = items.map((item) =>
      item.id === id ? { ...item, bereitsBezahlt: value, autoSyncBereitsBezahlt: false } : item
    );
    setItems(next);
    persist({ items: next });
  };

  // Accepting a suggestion remembers whatever was already entered as
  // bereitsBezahlt (e.g. amounts paid before Kontoauszug tracking started)
  // as a fixed historical baseline, then adds the matched Kontoauszug sum
  // on top — never replacing it. From then on every future Kontoauszug
  // import keeps re-syncing (baseline + freshly summed payments)
  // automatically without asking again or losing the baseline.
  const handleAcceptPaymentMatch = (id: string, amount: number) => {
    const next = items.map((item) =>
      item.id === id
        ? { ...item, historischBezahlt: item.bereitsBezahlt, bereitsBezahlt: item.bereitsBezahlt + amount, autoSyncBereitsBezahlt: true }
        : item
    );
    setItems(next);
    persist({ items: next });
  };

  const handleSetPaymentAutoSync = (id: string, enabled: boolean) => {
    const next = items.map((item) => (item.id === id ? { ...item, autoSyncBereitsBezahlt: enabled } : item));
    setItems(next);
    persist({ items: next });
  };

  const sortedItems = useMemo(() => sortOpenItems(items), [items]);
  const summary = useMemo(() => computeOpenItemsSummary(items), [items]);
  const matchesById = useMemo(() => {
    const map: Record<string, Transaction> = {};
    for (const item of items) {
      const match = findMatchingTransaction(item, kontoauszugTransactions);
      if (match) map[item.id] = match;
    }
    return map;
  }, [items, kontoauszugTransactions]);
  const paymentSumsById = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of items) {
      map[item.id] = computeMatchingPaymentSum(item, kontoauszugTransactions);
    }
    return map;
  }, [items, kontoauszugTransactions]);

  // Items the user has explicitly confirmed ("übernehmen") stay in sync
  // with the Kontoauszug automatically from then on — every newly imported
  // statement is compared and, if the matched Verwendungszweck or the
  // summed payments changed, applied without requiring another click.
  useEffect(() => {
    const next = items.map((item) => {
      let updated = item;
      if (item.autoSyncVerwendungszweck) {
        const match = matchesById[item.id];
        if (
          match?.verwendungszweck &&
          match.verwendungszweck.trim().toLowerCase() !== (updated.verwendungszweck || "").trim().toLowerCase()
        ) {
          updated = { ...updated, verwendungszweck: match.verwendungszweck };
        }
      }
      if (item.autoSyncBereitsBezahlt) {
        const paymentSum = paymentSumsById[item.id];
        const target = (updated.historischBezahlt || 0) + (paymentSum || 0);
        if (paymentSum != null && Math.abs(target - updated.bereitsBezahlt) >= 0.005) {
          updated = { ...updated, bereitsBezahlt: target };
        }
      }
      return updated;
    });
    if (next.some((item, i) => item !== items[i])) {
      setItems(next);
      persist({ items: next });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, matchesById, paymentSumsById]);

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">📋 Offene Verbindlichkeiten</h2>
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

      <OpenItemForm onAdd={handleAdd} />

      <OpenItemsSummary summary={summary} />

      <div className="flex gap-2 border-b border-stone-200">
        <button
          type="button"
          onClick={() => setView("liste")}
          className={`px-3 py-2 text-sm font-medium ${view === "liste" ? "border-b-2 border-indigo-600 text-indigo-700" : "text-stone-400 hover:text-stone-600"}`}
        >
          Liste
        </button>
        <button
          type="button"
          onClick={() => setView("monate")}
          className={`px-3 py-2 text-sm font-medium ${view === "monate" ? "border-b-2 border-indigo-600 text-indigo-700" : "text-stone-400 hover:text-stone-600"}`}
        >
          📅 Nach Monat
        </button>
      </div>

      {view === "liste" ? (
        <OpenItemsTable
          items={sortedItems}
          matchesById={matchesById}
          paymentSumsById={paymentSumsById}
          onUpdateField={handleUpdateField}
          onVerwendungszweckEdit={handleVerwendungszweckEdit}
          onAcceptMatch={handleAcceptMatch}
          onSetAutoSync={handleSetAutoSync}
          onBereitsBezahltEdit={handleBereitsBezahltEdit}
          onAcceptPaymentMatch={handleAcceptPaymentMatch}
          onSetPaymentAutoSync={handleSetPaymentAutoSync}
          onMarkPaidOff={handleMarkPaidOff}
          onDelete={handleDelete}
        />
      ) : (
        <MonthlyPaymentsView items={items} transactions={kontoauszugTransactions} />
      )}
    </div>
  );
}
