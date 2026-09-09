import { formatEuro } from "../lib/format";
import type { OpenItemsSummary as OpenItemsSummaryType } from "../types";

interface OpenItemsSummaryProps {
  summary: OpenItemsSummaryType;
}

export function OpenItemsSummary({ summary }: OpenItemsSummaryProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Aktive Posten</p>
        <p className="mt-1 text-xl font-semibold text-stone-700 tabular-nums">{summary.anzahlAktiv}</p>
      </div>
      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Restsumme offen</p>
        <p className="mt-1 text-xl font-semibold text-amber-600 tabular-nums">{formatEuro(summary.summeRest)}</p>
      </div>
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-indigo-500">Monatliche Raten gesamt</p>
        <p className="mt-1 text-xl font-semibold text-indigo-700 tabular-nums">{formatEuro(summary.summeMonatsrate)}</p>
      </div>
    </div>
  );
}
