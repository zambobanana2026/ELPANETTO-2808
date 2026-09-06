import { useMemo, useState } from "react";
import { CashCountForm } from "../components/CashCountForm";
import { CashCountHistory } from "../components/CashCountHistory";
import { CashEntryForm } from "../components/CashEntryForm";
import { CashLedgerTable } from "../components/CashLedgerTable";
import { StartBalanceInput } from "../components/StartBalanceInput";
import { SummaryBar } from "../components/SummaryBar";
import { computeCashBalanceAsOf, computeCashSummary, sortCashEntriesByDate } from "../lib/cashBalance";
import { loadCashState, saveCashState, type CashPersistedState } from "../lib/cashStorage";
import { todayIso } from "../lib/format";
import type { CashCount, CashEntry } from "../types";

export function BargeldTab() {
  const [initial] = useState(() => loadCashState());
  const [entries, setEntries] = useState<CashEntry[]>(initial.entries);
  const [counts, setCounts] = useState<CashCount[]>(initial.counts);
  const [anfangsbestand, setAnfangsbestand] = useState(initial.anfangsbestand);
  const [startDatum, setStartDatum] = useState(initial.startDatum);
  const [soundEnabled, setSoundEnabled] = useState(initial.soundEnabled);

  const persist = (next: Partial<CashPersistedState>) => {
    saveCashState({
      entries: next.entries ?? entries,
      counts: next.counts ?? counts,
      anfangsbestand: next.anfangsbestand ?? anfangsbestand,
      startDatum: next.startDatum ?? startDatum,
      soundEnabled: next.soundEnabled ?? soundEnabled,
    });
  };

  const handleAddEntry = (input: { datum: string; beschreibung: string; betrag: number }) => {
    const entry: CashEntry = {
      id: crypto.randomUUID(),
      datum: input.datum,
      beschreibung: input.beschreibung,
      betrag: input.betrag,
      erfasstAm: new Date().toISOString(),
      quelle: "manuell",
    };
    const next = [...entries, entry];
    setEntries(next);
    persist({ entries: next });
  };

  const handleSaveCount = (istBestand: number, denominationCounts: Record<string, number>) => {
    const sollBestand = computeCashBalanceAsOf(entries, anfangsbestand, startDatum, todayIso());
    const count: CashCount = {
      id: crypto.randomUUID(),
      datum: todayIso(),
      erfasstAm: new Date().toISOString(),
      sollBestand,
      istBestand,
      differenz: Math.round((istBestand - sollBestand) * 100) / 100,
      denominationCounts,
      ausgeglichen: false,
    };
    const next = [...counts, count];
    setCounts(next);
    persist({ counts: next });
  };

  const handleCreateAdjustment = (differenz: number) => {
    const entry: CashEntry = {
      id: crypto.randomUUID(),
      datum: todayIso(),
      beschreibung: differenz >= 0 ? "Kassensturz-Ausgleich (Überschuss)" : "Kassensturz-Ausgleich (Fehlbetrag)",
      betrag: differenz,
      erfasstAm: new Date().toISOString(),
      quelle: "manuell",
    };
    const nextEntries = [...entries, entry];
    const nextCounts = counts.map((c, i) => (i === counts.length - 1 ? { ...c, ausgeglichen: true } : c));
    setEntries(nextEntries);
    setCounts(nextCounts);
    persist({ entries: nextEntries, counts: nextCounts });
  };

  const handleAnfangsbestandChange = (value: number) => {
    setAnfangsbestand(value);
    persist({ anfangsbestand: value });
  };

  const handleStartDatumChange = (value: string) => {
    setStartDatum(value);
    persist({ startDatum: value });
  };

  const sortedEntries = useMemo(() => sortCashEntriesByDate(entries), [entries]);
  const summary = useMemo(
    () => computeCashSummary(entries, anfangsbestand, startDatum),
    [entries, anfangsbestand, startDatum]
  );
  // Deliberately not memoized on entries/anfangsbestand/startDatum alone: it
  // also depends on "today", which changes independently of those and a
  // stale memo would silently disagree with the fresh value handleSaveCount
  // computes at click time. The underlying calc is a cheap array sum, so
  // recomputing on every render costs nothing.
  const aktuellerSollBestand = computeCashBalanceAsOf(entries, anfangsbestand, startDatum, todayIso());

  return (
    <div className="flex flex-col gap-8 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <StartBalanceInput
          anfangsbestand={anfangsbestand}
          startDatum={startDatum}
          onAnfangsbestandChange={handleAnfangsbestandChange}
          onStartDatumChange={handleStartDatumChange}
        />
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

      <SummaryBar summary={summary} balanceLabel="Aktueller Kassenbestand" />

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">💶 Kassenbuch</h2>
        <CashEntryForm onAdd={handleAddEntry} />
        <CashLedgerTable entries={sortedEntries} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">🧮 Kassensturz</h2>
        <CashCountForm
          sollBestand={aktuellerSollBestand}
          soundEnabled={soundEnabled}
          onSaveCount={handleSaveCount}
          onCreateAdjustment={handleCreateAdjustment}
        />
        <CashCountHistory counts={counts} />
      </section>
    </div>
  );
}
