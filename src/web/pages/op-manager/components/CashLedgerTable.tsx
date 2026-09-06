import { formatDateDE, formatSignedAmount } from "../lib/format";
import type { CashEntry } from "../types";

interface CashLedgerTableProps {
  entries: CashEntry[];
}

export function CashLedgerTable({ entries }: CashLedgerTableProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-stone-300 bg-white py-16 text-center text-stone-400">
        Noch keine Kassenbuch-Einträge erfasst.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
      <table className="w-full min-w-[480px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-stone-200 bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
            <th className="px-4 py-3 font-medium">Datum</th>
            <th className="px-4 py-3 font-medium">Beschreibung</th>
            <th className="px-4 py-3 font-medium text-right">Betrag</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b border-stone-100 last:border-0">
              <td className="px-4 py-2.5 text-stone-500 tabular-nums">{formatDateDE(entry.datum)}</td>
              <td className="px-4 py-2.5 text-stone-800">{entry.beschreibung}</td>
              <td
                className={`px-4 py-2.5 text-right font-medium tabular-nums ${
                  entry.betrag >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatSignedAmount(entry.betrag)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
