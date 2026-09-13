import { GlaeubigerCell } from "./GlaeubigerCell";
import { isInterneBewegung } from "../lib/balance";
import { formatDateDE, formatSignedAmount } from "../lib/format";
import type { Transaction } from "../types";

interface TransactionTableProps {
  transactions: Transaction[];
  onToggleBarAbhebung: (id: string) => void;
  onSetGlaeubigerName: (id: string, iban: string, name: string) => void;
}

export function TransactionTable({ transactions, onToggleBarAbhebung, onSetGlaeubigerName }: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-stone-300 bg-white py-16 text-center text-stone-400">
        Noch keine Buchungen importiert.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-stone-200 bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
            <th className="px-4 py-3 font-medium">Gläubiger</th>
            <th className="px-4 py-3 font-medium">Verwendungszweck</th>
            <th className="px-4 py-3 font-medium text-right">Betrag</th>
            <th className="px-4 py-3 font-medium text-right">Datum</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => {
            // Any negative amount can be marked as a Bar-Abhebung — a real
            // cash withdrawal often carries the merchant's own text (e.g.
            // "Bargeld ROSSMANN 3404"), not the generic Geldtransit label.
            const isBarAbhebungCandidate = tx.betrag < 0;
            const isInterne = isInterneBewegung(tx);
            return (
              <tr key={tx.id} className="border-b border-stone-100 last:border-0">
                <td className="px-4 py-2.5">
                  <GlaeubigerCell tx={tx} onSetName={onSetGlaeubigerName} />
                </td>
                <td className="px-4 py-2.5 text-stone-600">
                  {tx.verwendungszweck}
                  {isBarAbhebungCandidate && (
                    <button
                      type="button"
                      onClick={() => onToggleBarAbhebung(tx.id)}
                      title={
                        tx.istBarAbhebung
                          ? "Als Bar-Abhebung markiert — fließt in den Bargeld-Tab ein. Klicken zum Entfernen."
                          : "Als Bar-Abhebung markieren (Betrag fließt in den Bargeld-Tab ein)"
                      }
                      className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs transition-colors ${
                        tx.istBarAbhebung
                          ? "bg-emerald-100 text-emerald-700"
                          : "text-stone-400 hover:bg-stone-100 hover:text-stone-600"
                      }`}
                    >
                      💵{tx.istBarAbhebung ? " ✓" : ""}
                    </button>
                  )}
                </td>
                <td
                  className={`px-4 py-2.5 text-right font-medium tabular-nums ${
                    isInterne ? "text-stone-400" : tx.betrag >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatSignedAmount(tx.betrag)}
                </td>
                <td className="px-4 py-2.5 text-right text-stone-500 tabular-nums">{formatDateDE(tx.datum)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
