import { formatDateDE, formatEuro } from "../lib/format";
import type { CashExpense } from "../types";

interface CashExpenseTableProps {
  expenses: CashExpense[];
}

export function CashExpenseTable({ expenses }: CashExpenseTableProps) {
  if (expenses.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-stone-300 bg-white py-16 text-center text-stone-400">
        Noch keine Barausgaben erfasst.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
      <table className="w-full min-w-[420px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-stone-200 bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
            <th className="px-4 py-3 font-medium">Datum</th>
            <th className="px-4 py-3 font-medium">Kategorie</th>
            <th className="px-4 py-3 font-medium text-right">Betrag</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id} className="border-b border-stone-100 last:border-0">
              <td className="px-4 py-2.5 text-stone-500 tabular-nums">{formatDateDE(expense.datum)}</td>
              <td className="px-4 py-2.5 text-stone-800">{expense.kategorie}</td>
              <td className="px-4 py-2.5 text-right font-medium text-red-600 tabular-nums">
                {formatEuro(-expense.betrag)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
