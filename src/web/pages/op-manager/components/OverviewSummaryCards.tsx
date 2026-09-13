import { formatEuro } from "../lib/format";
import type { AccountSummary } from "../types";
import type { OverviewSummary } from "../lib/overview";

interface OverviewSummaryCardsProps {
  summary: OverviewSummary;
  kontoauszugSummary: AccountSummary;
  bargeldBestand: number;
}

export function OverviewSummaryCards({ summary, kontoauszugSummary, bargeldBestand }: OverviewSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-indigo-500">Gesamtguthaben</p>
        <p className="mt-1 text-xl font-semibold text-indigo-700 tabular-nums">{formatEuro(summary.gesamtGuthaben)}</p>
        <p className="mt-1 text-xs text-indigo-400">
          Konto {formatEuro(kontoauszugSummary.aktuellerKontostand)} (davon Anfangsbestand{" "}
          {formatEuro(kontoauszugSummary.anfangsbestand)}) + Kasse {formatEuro(bargeldBestand)}
        </p>
      </div>
      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Offene Verbindlichkeiten</p>
        <p className="mt-1 text-xl font-semibold text-amber-600 tabular-nums">
          {formatEuro(summary.offeneVerbindlichkeitenSumme)}
        </p>
        <p className="mt-1 text-xs text-stone-400">{summary.anzahlOffenePosten} Posten aktiv</p>
      </div>
      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Monatliche Raten gesamt</p>
        <p className="mt-1 text-xl font-semibold text-stone-700 tabular-nums">{formatEuro(summary.monatsrateSumme)}</p>
      </div>
    </div>
  );
}
