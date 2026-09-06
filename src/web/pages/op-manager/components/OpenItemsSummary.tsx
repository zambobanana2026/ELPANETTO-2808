import { formatEuro } from "../lib/format";
import type { OpenItemsSummary as OpenItemsSummaryType } from "../types";

interface OpenItemsSummaryProps {
  summary: OpenItemsSummaryType;
}

export function OpenItemsSummary({ summary }: OpenItemsSummaryProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Offene Posten</p>
        <p className="mt-1 text-xl font-semibold text-stone-700 tabular-nums">{summary.anzahlOffen}</p>
      </div>
      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Summe offen</p>
        <p className="mt-1 text-xl font-semibold text-amber-600 tabular-nums">{formatEuro(summary.summeOffen)}</p>
      </div>
      <div
        className={`rounded-xl border p-4 ${
          summary.summeUeberfaellig > 0 ? "border-red-200 bg-red-50" : "border-stone-200 bg-white"
        }`}
      >
        <p
          className={`text-xs font-medium uppercase tracking-wide ${
            summary.summeUeberfaellig > 0 ? "text-red-500" : "text-stone-500"
          }`}
        >
          Davon überfällig
        </p>
        <p
          className={`mt-1 text-xl font-semibold tabular-nums ${
            summary.summeUeberfaellig > 0 ? "text-red-700" : "text-stone-700"
          }`}
        >
          {formatEuro(summary.summeUeberfaellig)}
        </p>
      </div>
    </div>
  );
}
