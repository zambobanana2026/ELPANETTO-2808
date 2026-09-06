import { formatEuro } from "../lib/format";
import type { OverviewSummary } from "../lib/overview";

interface OverviewSummaryCardsProps {
  summary: OverviewSummary;
}

export function OverviewSummaryCards({ summary }: OverviewSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-indigo-500">Gesamtguthaben</p>
        <p className="mt-1 text-xl font-semibold text-indigo-700 tabular-nums">{formatEuro(summary.gesamtGuthaben)}</p>
        <p className="mt-1 text-xs text-indigo-400">Konto + Kasse</p>
      </div>
      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Offene Verbindlichkeiten</p>
        <p className="mt-1 text-xl font-semibold text-amber-600 tabular-nums">
          {formatEuro(summary.offeneVerbindlichkeitenSumme)}
        </p>
        <p className="mt-1 text-xs text-stone-400">{summary.anzahlOffenePosten} Posten offen</p>
      </div>
      <div
        className={`rounded-xl border p-4 ${
          summary.ueberfaelligSumme > 0 ? "border-red-200 bg-red-50" : "border-stone-200 bg-white"
        }`}
      >
        <p
          className={`text-xs font-medium uppercase tracking-wide ${
            summary.ueberfaelligSumme > 0 ? "text-red-500" : "text-stone-500"
          }`}
        >
          Davon überfällig
        </p>
        <p
          className={`mt-1 text-xl font-semibold tabular-nums ${
            summary.ueberfaelligSumme > 0 ? "text-red-700" : "text-stone-700"
          }`}
        >
          {formatEuro(summary.ueberfaelligSumme)}
        </p>
      </div>
    </div>
  );
}
