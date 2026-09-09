import { computeRestbetrag, deriveItemStatus, STATUS_LABELS, STATUS_STYLES } from "../lib/openItems";
import { formatEuro } from "../lib/format";
import type { OpenItem } from "../types";

interface UpcomingDueListProps {
  items: OpenItem[];
}

export function UpcomingDueList({ items }: UpcomingDueListProps) {
  const active = [...items]
    .filter((item) => deriveItemStatus(item) === "aktiv")
    .sort((a, b) => (b.istSchneeballZiel ? 1 : 0) - (a.istSchneeballZiel ? 1 : 0) || computeRestbetrag(b) - computeRestbetrag(a))
    .slice(0, 5);

  if (active.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-stone-300 bg-white py-10 text-center text-stone-400">
        Keine offenen Verbindlichkeiten. 🎉
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
      <table className="w-full min-w-[420px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-stone-200 bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
            <th className="px-4 py-3 font-medium">Gläubiger</th>
            <th className="px-4 py-3 font-medium text-right">Restbetrag</th>
            <th className="px-4 py-3 font-medium text-right">Monatsrate</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {active.map((item) => (
            <tr key={item.id} className="border-b border-stone-100 last:border-0">
              <td className="px-4 py-2.5 text-stone-800">
                {item.istSchneeballZiel && "🎯 "}
                {item.glaeubiger}
              </td>
              <td className="px-4 py-2.5 text-right font-medium text-stone-800 tabular-nums">
                {formatEuro(computeRestbetrag(item))}
              </td>
              <td className="px-4 py-2.5 text-right text-stone-500 tabular-nums">{formatEuro(item.monatsrate)}</td>
              <td className="px-4 py-2.5">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES.aktiv}`}>
                  {STATUS_LABELS.aktiv}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
