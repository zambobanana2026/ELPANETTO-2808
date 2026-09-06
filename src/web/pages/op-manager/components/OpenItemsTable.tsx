import { deriveDisplayStatus, type DisplayStatus } from "../lib/openItems";
import { formatDateDE, formatEuro } from "../lib/format";
import type { OpenItem } from "../types";

interface OpenItemsTableProps {
  items: OpenItem[];
  onMarkPaid: (id: string) => void;
  onUnmarkPaid: (id: string) => void;
}

const STATUS_STYLES: Record<DisplayStatus, string> = {
  offen: "bg-amber-50 text-amber-700 border border-amber-200",
  ueberfaellig: "bg-red-50 text-red-700 border border-red-200",
  bezahlt: "bg-green-50 text-green-700 border border-green-200",
};

const STATUS_LABELS: Record<DisplayStatus, string> = {
  offen: "Offen",
  ueberfaellig: "⚠ Überfällig",
  bezahlt: "✓ Bezahlt",
};

export function OpenItemsTable({ items, onMarkPaid, onUnmarkPaid }: OpenItemsTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-stone-300 bg-white py-16 text-center text-stone-400">
        Noch keine offenen Posten erfasst.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
      <table className="w-full min-w-[760px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-stone-200 bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
            <th className="px-4 py-3 font-medium">Gläubiger</th>
            <th className="px-4 py-3 font-medium">Verwendungszweck</th>
            <th className="px-4 py-3 font-medium">Rechnungsnr.</th>
            <th className="px-4 py-3 font-medium text-right">Betrag</th>
            <th className="px-4 py-3 font-medium text-right">Fällig am</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium text-right">Aktion</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const status = deriveDisplayStatus(item);
            return (
              <tr key={item.id} className="border-b border-stone-100 last:border-0">
                <td className="px-4 py-2.5 text-stone-800">
                  {item.glaeubiger}
                  {item.notiz && (
                    <span title={item.notiz} className="ml-1.5 cursor-help text-stone-400">
                      📝
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-stone-600">{item.verwendungszweck}</td>
                <td className="px-4 py-2.5 text-stone-500">{item.rechnungsnummer || "–"}</td>
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
                <td className="px-4 py-2.5 text-right">
                  {status === "bezahlt" ? (
                    <button
                      onClick={() => onUnmarkPaid(item.id)}
                      className="text-xs font-medium text-stone-400 hover:text-stone-600"
                    >
                      Rückgängig
                    </button>
                  ) : (
                    <button
                      onClick={() => onMarkPaid(item.id)}
                      className="rounded-md border border-green-300 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-100"
                    >
                      Als bezahlt markieren
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
