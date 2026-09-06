import { useMemo, useState } from "react";
import { CsvImporter } from "../components/CsvImporter";
import { StartBalanceInput } from "../components/StartBalanceInput";
import { SummaryBar } from "../components/SummaryBar";
import { TransactionTable } from "../components/TransactionTable";
import { computeSummary, sortByDateAscending } from "../lib/balance";
import type { ParsedRow } from "../lib/csvParser";
import { mergeNewRows } from "../lib/duplicateDetection";
import { applyKnownGlaeubigerNames } from "../lib/glaeubigerNames";
import { loadState, saveState } from "../lib/storage";
import type { ImportResult, Transaction } from "../types";

export function KontoauszugTab() {
  const [initial] = useState(() => loadState());
  const [transactions, setTransactions] = useState<Transaction[]>(initial.transactions);
  const [anfangsbestand, setAnfangsbestand] = useState(initial.anfangsbestand);
  const [startDatum, setStartDatum] = useState(initial.startDatum);
  const [soundEnabled, setSoundEnabled] = useState(initial.soundEnabled);
  const [ibanNamen, setIbanNamen] = useState<Record<string, string>>(initial.ibanNamen);

  const persist = (next: Partial<ReturnType<typeof loadState>>) => {
    saveState({
      transactions: next.transactions ?? transactions,
      anfangsbestand: next.anfangsbestand ?? anfangsbestand,
      startDatum: next.startDatum ?? startDatum,
      soundEnabled: next.soundEnabled ?? soundEnabled,
      ibanNamen: next.ibanNamen ?? ibanNamen,
    });
  };

  const handleFileParsed = (rows: ParsedRow[]): ImportResult => {
    const existingFingerprintCounts = new Map<string, number>();
    for (const tx of transactions) {
      existingFingerprintCounts.set(tx.fingerprint, (existingFingerprintCounts.get(tx.fingerprint) ?? 0) + 1);
    }
    const result = mergeNewRows(rows, existingFingerprintCounts);
    if (result.added.length > 0) {
      const next = applyKnownGlaeubigerNames([...transactions, ...result.added], ibanNamen);
      setTransactions(next);
      persist({ transactions: next });
    }
    return result;
  };

  const handleToggleBarAbhebung = (id: string) => {
    const next = transactions.map((tx) => (tx.id === id ? { ...tx, istBarAbhebung: !tx.istBarAbhebung } : tx));
    setTransactions(next);
    persist({ transactions: next });
  };

  const handleSetGlaeubigerName = (id: string, iban: string, name: string) => {
    // With a known IBAN, remember the name for every transaction from that
    // account (past and future); without one, just fix this single row.
    if (iban) {
      const nextIbanNamen = { ...ibanNamen, [iban]: name };
      const next = applyKnownGlaeubigerNames(transactions, nextIbanNamen);
      setIbanNamen(nextIbanNamen);
      setTransactions(next);
      persist({ ibanNamen: nextIbanNamen, transactions: next });
    } else {
      const next = transactions.map((tx) => (tx.id === id ? { ...tx, glaeubiger: name } : tx));
      setTransactions(next);
      persist({ transactions: next });
    }
  };

  const handleAnfangsbestandChange = (value: number) => {
    setAnfangsbestand(value);
    persist({ anfangsbestand: value });
  };

  const handleStartDatumChange = (value: string) => {
    setStartDatum(value);
    persist({ startDatum: value });
  };

  const sortedTransactions = useMemo(() => sortByDateAscending(transactions), [transactions]);
  const summary = useMemo(
    () => computeSummary(transactions, anfangsbestand, startDatum),
    [transactions, anfangsbestand, startDatum]
  );

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
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

      <CsvImporter onFileParsed={handleFileParsed} soundEnabled={soundEnabled} />

      <TransactionTable
        transactions={sortedTransactions}
        onToggleBarAbhebung={handleToggleBarAbhebung}
        onSetGlaeubigerName={handleSetGlaeubigerName}
      />

      <SummaryBar summary={summary} />
    </div>
  );
}
