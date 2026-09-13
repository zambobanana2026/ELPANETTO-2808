import { useState } from "react";
import { formatEuro } from "../lib/format";
import type { CategoryTotal } from "../types";

interface CategoryBarChartProps {
  totals: CategoryTotal[];
}

export function CategoryBarChart({ totals }: CategoryBarChartProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  if (totals.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-stone-300 bg-white py-10 text-center text-stone-400">
        Noch keine Ausgaben zum Anzeigen.
      </div>
    );
  }

  const max = Math.max(...totals.map((t) => t.summe));

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-4">
      {totals.map((t) => {
        const widthPct = max > 0 ? (t.summe / max) * 100 : 0;
        return (
          <div key={t.kategorie} className="flex items-center gap-3">
            <span className="w-28 shrink-0 truncate text-sm text-stone-600" title={t.kategorie}>
              {t.kategorie}
            </span>
            <div
              className="relative h-4 flex-1 rounded-md bg-stone-100"
              onMouseEnter={() => setHovered(t.kategorie)}
              onMouseLeave={() => setHovered((h) => (h === t.kategorie ? null : h))}
            >
              <div
                className="h-4 rounded-r-full bg-indigo-600 transition-[width] duration-300"
                style={{ width: `${widthPct}%` }}
              />
              {hovered === t.kategorie && (
                <div className="absolute -top-8 left-0 z-10 rounded-md bg-stone-900 px-2 py-1 text-xs font-medium text-white shadow-md">
                  {t.kategorie}: {formatEuro(t.summe)}
                </div>
              )}
            </div>
            <span className="w-20 shrink-0 text-right text-sm font-medium tabular-nums text-stone-700">
              {formatEuro(t.summe)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
