import type { AccountSummary } from "../types";

interface SummaryBarProps {
  summary: AccountSummary;
}

function formatEuro(value: number): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value);
}

export function SummaryBar({ summary }: SummaryBarProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Gesamteinnahmen</p>
        <p className="mt-1 text-xl font-semibold text-green-600 tabular-nums">{formatEuro(summary.gesamtEinnahmen)}</p>
      </div>
      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Gesamtausgaben</p>
        <p className="mt-1 text-xl font-semibold text-red-600 tabular-nums">{formatEuro(summary.gesamtAusgaben)}</p>
      </div>
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-indigo-500">Aktueller Kontostand</p>
        <p className="mt-1 text-xl font-semibold text-indigo-700 tabular-nums">
          {formatEuro(summary.aktuellerKontostand)}
        </p>
      </div>
    </div>
  );
}
