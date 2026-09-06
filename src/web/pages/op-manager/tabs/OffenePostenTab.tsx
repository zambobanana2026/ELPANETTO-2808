import { useMemo, useState } from "react";
import { OpenItemForm } from "../components/OpenItemForm";
import { OpenItemsSummary } from "../components/OpenItemsSummary";
import { OpenItemsTable } from "../components/OpenItemsTable";
import { todayIso } from "../lib/format";
import { computeOpenItemsSummary, sortOpenItems } from "../lib/openItems";
import { loadOpenItemsState, saveOpenItemsState, type OpenItemsPersistedState } from "../lib/openItemsStorage";
import { playSuccessChime } from "../lib/sound";
import type { OpenItem } from "../types";

export function OffenePostenTab() {
  const [initial] = useState(() => loadOpenItemsState());
  const [items, setItems] = useState<OpenItem[]>(initial.items);
  const [soundEnabled, setSoundEnabled] = useState(initial.soundEnabled);

  const persist = (next: Partial<OpenItemsPersistedState>) => {
    saveOpenItemsState({
      items: next.items ?? items,
      soundEnabled: next.soundEnabled ?? soundEnabled,
    });
  };

  const handleAdd = (input: {
    glaeubiger: string;
    rechnungsnummer: string;
    verwendungszweck: string;
    betrag: number;
    rechnungsdatum: string;
    faelligkeitsdatum: string;
    notiz: string;
  }) => {
    const item: OpenItem = {
      id: crypto.randomUUID(),
      ...input,
      status: "offen",
      bezahltAm: null,
      erfasstAm: new Date().toISOString(),
      quelle: "manuell",
    };
    const next = [...items, item];
    setItems(next);
    persist({ items: next });
  };

  const handleMarkPaid = (id: string) => {
    const next = items.map((item) =>
      item.id === id ? { ...item, status: "bezahlt" as const, bezahltAm: todayIso() } : item
    );
    setItems(next);
    persist({ items: next });
    if (soundEnabled) playSuccessChime();
  };

  const handleUnmarkPaid = (id: string) => {
    const next = items.map((item) =>
      item.id === id ? { ...item, status: "offen" as const, bezahltAm: null } : item
    );
    setItems(next);
    persist({ items: next });
  };

  const sortedItems = useMemo(() => sortOpenItems(items), [items]);
  const summary = useMemo(() => computeOpenItemsSummary(items), [items]);

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

      <OpenItemsTable items={sortedItems} onMarkPaid={handleMarkPaid} onUnmarkPaid={handleUnmarkPaid} />
    </div>
  );
}
