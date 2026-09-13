import { computeRestbetrag, normalizeForMatch } from "./openItems";
import type { OpenItem } from "../types";

interface YearMonth {
  year: number;
  month: number; // 1-12
}

function addMonths({ year, month }: YearMonth, n: number): YearMonth {
  const total = year * 12 + (month - 1) + n;
  return { year: Math.floor(total / 12), month: (total % 12) + 1 };
}

const MONAT_NAMEN = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

function formatYearMonth({ year, month }: YearMonth): string {
  return `${MONAT_NAMEN[month - 1]} ${year}`;
}

export interface SnowballRow {
  item: OpenItem;
  prioritaet: number | null; // null = already paid off before the plan starts
  restbetragHeute: number;
  monatsrate: number;
  payoffMonthIndex: number | null; // 0 = already done, null = uncomputable
  payoffDate: string | null;
}

export interface SnowballPlan {
  rows: SnowballRow[];
  budget: number;
  minBudget: number;
  debtFreeMonthIndex: number | null;
  debtFreeDate: string | null;
  hitCap: boolean;
}

const MAX_MONTHS = 1200; // 100-year safety cap against a runaway loop

export function computeMinBudget(items: OpenItem[]): number {
  return Math.round(items.reduce((sum, i) => sum + i.monatsrate, 0) * 100) / 100;
}

// Debt-snowball payoff simulation, fixed total monthly budget: the sum of
// every item's own Monatsrate (today's total) keeps being paid in full
// every month, no matter how many items are already paid off. Each month,
// every still-open item first gets its own Monatsrate; whatever's left
// over from that (both money freed by already-finished items AND any
// leftover from an item finishing early within the SAME month) cascades
// immediately down the priority order — so the full budget is always put
// to work in the month it's freed, never held back to the next one. No
// interest is modeled (none exists in this data), so a payment always
// reduces the remaining balance 1:1.
//
// customBudget lets the user commit to paying more than the sum of the
// minimum Monatsraten each month (e.g. regular Sondertilgungen). It's
// clamped to never go below that sum — you can't pay less than what's
// already owed in minimums.
//
// Priority order: Klarna first, Ertan second (explicit choice), then every
// other still-open item by current Restbetrag, largest first.
export function computeSnowballPlan(items: OpenItem[], today: Date, customBudget?: number | null): SnowballPlan {
  const active = items.filter((i) => computeRestbetrag(i) > 0);
  const alreadyDone = items.filter((i) => computeRestbetrag(i) <= 0);

  const findByName = (needle: string) => active.find((i) => normalizeForMatch(i.glaeubiger).includes(needle));
  const explicitTargets = [findByName("klarna"), findByName("ertan")].filter((i): i is OpenItem => Boolean(i));
  const rest = active
    .filter((i) => !explicitTargets.includes(i))
    .sort((a, b) => computeRestbetrag(b) - computeRestbetrag(a));
  const priorityOrder = [...explicitTargets, ...rest];

  const balances: Record<string, number> = {};
  for (const i of items) balances[i.id] = computeRestbetrag(i);

  const minBudget = computeMinBudget(items);
  const budget = customBudget != null ? Math.max(minBudget, Math.round(customBudget * 100) / 100) : minBudget;

  const payoffMonth: Record<string, number> = {};
  const activeIds = new Set(active.map((i) => i.id));
  let month = 0;

  while (activeIds.size > 0 && month < MAX_MONTHS) {
    month++;
    let pool = budget;
    for (const id of activeIds) {
      const item = items.find((i) => i.id === id)!;
      const pay = Math.min(item.monatsrate, balances[id]);
      balances[id] -= pay;
      pool -= pay;
    }
    for (const t of priorityOrder) {
      if (pool <= 0) break;
      if (balances[t.id] <= 0) continue;
      const pay = Math.min(pool, balances[t.id]);
      balances[t.id] -= pay;
      pool -= pay;
    }
    for (const id of Array.from(activeIds)) {
      if (balances[id] <= 0) {
        payoffMonth[id] = month;
        activeIds.delete(id);
      }
    }
  }

  const hitCap = month >= MAX_MONTHS && activeIds.size > 0;
  const debtFreeMonthIndex = hitCap ? null : month;
  const baseYM: YearMonth = { year: today.getFullYear(), month: today.getMonth() + 1 };
  const nextMonthYM = addMonths(baseYM, 1);

  const rows: SnowballRow[] = priorityOrder.map((item, idx) => {
    const mi = payoffMonth[item.id];
    return {
      item,
      prioritaet: idx + 1,
      restbetragHeute: computeRestbetrag(item),
      monatsrate: item.monatsrate,
      payoffMonthIndex: mi ?? null,
      payoffDate: mi ? formatYearMonth(addMonths(nextMonthYM, mi - 1)) : null,
    };
  });
  for (const item of alreadyDone) {
    rows.push({
      item,
      prioritaet: null,
      restbetragHeute: 0,
      monatsrate: item.monatsrate,
      payoffMonthIndex: 0,
      payoffDate: "bereits abbezahlt",
    });
  }

  return {
    rows,
    budget,
    minBudget,
    debtFreeMonthIndex,
    debtFreeDate: debtFreeMonthIndex ? formatYearMonth(addMonths(nextMonthYM, debtFreeMonthIndex - 1)) : null,
    hitCap,
  };
}
