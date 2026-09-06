import type { Transaction } from "../types";

interface TransactionTableProps {
  transactions: Transaction[];
}

function formatAmount(value: number): string {
  const formatted = new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    Math.abs(value)
  );
  return `${value >= 0 ? "+" : "-"}${formatted} €`;
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return iso;
  return `${day}.${month}.${year}`;
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-stone-300 bg-white py-16 text-center text-stone-400">
        Noch keine Buchungen importiert.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-stone-200 bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
            <th className="px-4 py-3 font-medium">Gläubiger</th>
            <th className="px-4 py-3 font-medium">Verwendungszweck</th>
            <th className="px-4 py-3 font-medium text-right">Betrag</th>
            <th className="px-4 py-3 font-medium text-right">Datum</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id} className="border-b border-stone-100 last:border-0">
              <td className="px-4 py-2.5 text-stone-800">{tx.glaeubiger}</td>
              <td className="px-4 py-2.5 text-stone-600">{tx.verwendungszweck}</td>
              <td
                className={`px-4 py-2.5 text-right font-medium tabular-nums ${
                  tx.betrag >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatAmount(tx.betrag)}
              </td>
              <td className="px-4 py-2.5 text-right text-stone-500 tabular-nums">{formatDate(tx.datum)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
