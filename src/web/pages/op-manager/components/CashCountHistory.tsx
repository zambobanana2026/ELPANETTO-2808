import { formatDateDE, formatEuro } from "../lib/format";
import type { CashCount } from "../types";

interface CashCountHistoryProps {
  counts: CashCount[];
}

const EPSILON = 0.005;

export function CashCountHistory({ counts }: CashCountHistoryProps) {
  if (counts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-stone-300 bg-white py-10 text-center text-stone-400">
        Noch keine Kassenstürze durchgeführt.
      </div>
    );
  }

  const sorted = [...counts].sort((a, b) => b.erfasstAm.localeCompare(a.erfasstAm));

  return (
    <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
      <table className="w-full min-w-[520px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-stone-200 bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
            <th className="px-4 py-3 font-medium">Datum</th>
            <th className="px-4 py-3 font-medium text-right">Soll</th>
            <th className="px-4 py-3 font-medium text-right">Ist</th>
            <th className="px-4 py-3 font-medium text-right">Differenz</th>
            <th className="px-4 py-3 font-medium text-right">Ausgeglichen</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((count) => (
            <tr key={count.id} className="border-b border-stone-100 last:border-0">
              <td className="px-4 py-2.5 text-stone-500 tabular-nums">{formatDateDE(count.datum)}</td>
              <td className="px-4 py-2.5 text-right text-stone-700 tabular-nums">{formatEuro(count.sollBestand)}</td>
              <td className="px-4 py-2.5 text-right text-stone-700 tabular-nums">{formatEuro(count.istBestand)}</td>
              <td
                className={`px-4 py-2.5 text-right font-medium tabular-nums ${
                  Math.abs(count.differenz) < EPSILON ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatEuro(count.differenz)}
              </td>
              <td className="px-4 py-2.5 text-right text-stone-500">{count.ausgeglichen ? "✓" : "–"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
