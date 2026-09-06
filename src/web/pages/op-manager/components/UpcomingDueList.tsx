import { deriveDisplayStatus, STATUS_LABELS, STATUS_STYLES } from "../lib/openItems";
import { formatDateDE, formatEuro } from "../lib/format";
import type { OpenItem } from "../types";

interface UpcomingDueListProps {
  items: OpenItem[];
}

export function UpcomingDueList({ items }: UpcomingDueListProps) {
  const unpaid = items.filter((item) => item.status !== "bezahlt").slice(0, 5);

  if (unpaid.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-stone-300 bg-white py-10 text-center text-stone-400">
        Keine offenen Fälligkeiten. 🎉
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
      <table className="w-full min-w-[420px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-stone-200 bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
            <th className="px-4 py-3 font-medium">Gläubiger</th>
            <th className="px-4 py-3 font-medium text-right">Betrag</th>
            <th className="px-4 py-3 font-medium text-right">Fällig am</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {unpaid.map((item) => {
            const status = deriveDisplayStatus(item);
            return (
              <tr key={item.id} className="border-b border-stone-100 last:border-0">
                <td className="px-4 py-2.5 text-stone-800">{item.glaeubiger}</td>
                <td className="px-4 py-2.5 text-right font-medium text-stone-800 tabular-nums">
                  {formatEuro(item.betrag)}
                </td>
                <td className="px-4 py-2.5 text-right text-stone-500 tabular-nums">
                  {formatDateDE(item.faelligkeitsdatum)}
                </td>
                <td className="px-4 py-2.5">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}>
                    {STATUS_LABELS[status]}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
