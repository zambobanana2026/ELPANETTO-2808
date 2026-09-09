import { useEffect, useMemo, useState } from "react";
import { OpenItemForm } from "../components/OpenItemForm";
import { OpenItemsSummary } from "../components/OpenItemsSummary";
import { OpenItemsTable } from "../components/OpenItemsTable";
import { computeOpenItemsSummary, findMatchingTransaction, sortOpenItems } from "../lib/openItems";
import { loadOpenItemsState, saveOpenItemsState, type OpenItemsPersistedState } from "../lib/openItemsStorage";
import { loadState as loadKontoauszugState } from "../lib/storage";
import { playSuccessChime } from "../lib/sound";
import type { OpenItem, Transaction } from "../types";

export function OffenePostenTab() {
  const [initial] = useState(() => loadOpenItemsState());
  const [items, setItems] = useState<OpenItem[]>(initial.items);
  const [soundEnabled, setSoundEnabled] = useState(initial.soundEnabled);
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

  // Items the user has explicitly confirmed ("übernehmen") stay in sync
  // with the Kontoauszug automatically from then on — every newly imported
  // statement is compared and, if the matched Verwendungszweck changed,
  // applied without requiring another click.
  useEffect(() => {
    const next = items.map((item) => {
      if (!item.autoSyncVerwendungszweck) return item;
      const match = matchesById[item.id];
      if (!match?.verwendungszweck) return item;
      if (match.verwendungszweck.trim().toLowerCase() === (item.verwendungszweck || "").trim().toLowerCase()) return item;
      return { ...item, verwendungszweck: match.verwendungszweck };
    });
    if (next.some((item, i) => item !== items[i])) {
      setItems(next);
      persist({ items: next });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, matchesById]);

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

      <OpenItemsTable
        items={sortedItems}
        matchesById={matchesById}
        onUpdateField={handleUpdateField}
        onVerwendungszweckEdit={handleVerwendungszweckEdit}
        onAcceptMatch={handleAcceptMatch}
        onSetAutoSync={handleSetAutoSync}
        onMarkPaidOff={handleMarkPaidOff}
        onDelete={handleDelete}
      />
    </div>
  );
}
