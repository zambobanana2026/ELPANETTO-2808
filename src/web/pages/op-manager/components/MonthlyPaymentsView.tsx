import { computeMonthlyPayments, type MonthlyPayment } from "../lib/openItems";
import { formatEuro } from "../lib/format";
import type { OpenItem, Transaction } from "../types";

const MONAT_LABELS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

function formatMonat(monat: string): string {
  const [y, m] = monat.split("-").map(Number);
  return `${MONAT_LABELS[m - 1]} ${y}`;
}

// Shows, per calendar month, every payment the app recognized (via the
// Kontoauszug-Abgleich) as going toward an offenen Posten — answers "habe
// ich in diesem Monat etwas bezahlt?" at a glance.
export function MonthlyPaymentsView({ items, transactions }: { items: OpenItem[]; transactions: Transaction[] }) {
  const payments = computeMonthlyPayments(items, transactions);

  if (payments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-stone-300 bg-white py-16 text-center text-stone-400">
        Noch keine per Kontoauszug erkannten Zahlungen auf offene Posten.
        <br />
        Sobald ein Posten automatisch synchron gestellt ist (🔁), erscheinen hier die erkannten Monatszahlungen.
      </div>
    );
  }

  const byMonth = new Map<string, MonthlyPayment[]>();
  for (const p of payments) {
    if (!byMonth.has(p.monat)) byMonth.set(p.monat, []);
    byMonth.get(p.monat)!.push(p);
  }
  const months = [...byMonth.keys()].sort().reverse();

  return (
    <div className="flex flex-col gap-4">
      {months.map((monat) => {
        const rows = [...byMonth.get(monat)!].sort((a, b) => b.datum.localeCompare(a.datum));
        const total = rows.reduce((sum, r) => sum + r.betrag, 0);
        return (
          <div key={monat} className="rounded-xl border border-stone-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between border-b border-stone-100 pb-2">
              <h3 className="text-sm font-semibold text-stone-700">{formatMonat(monat)}</h3>
              <span className="text-sm font-semibold tabular-nums text-stone-800">{formatEuro(total)}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {rows.map((r, i) => (
                <div key={i} className="flex items-center justify-between text-sm text-stone-600">
                  <span className="truncate pr-2">{r.glaeubiger}</span>
                  <span className="shrink-0 tabular-nums">{formatEuro(r.betrag)}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
