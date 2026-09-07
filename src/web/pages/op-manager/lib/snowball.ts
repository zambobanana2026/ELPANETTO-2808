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
  debtFreeMonthIndex: number | null;
  debtFreeDate: string | null;
  hitCap: boolean;
}

const MAX_MONTHS = 1200; // 100-year safety cap against a runaway loop

// Debt-snowball payoff simulation. Pays every active item's own Monatsrate
// each month; whenever an item is fully paid off, its Monatsrate joins a
// shared pool that tops up the CURRENT priority target's payment from the
// following month on — so the freed-up money keeps accelerating the payoff
// instead of just disappearing. No interest is modeled (none exists in
// this data), so a payment always reduces the remaining balance 1:1.
//
// Priority order: Klarna first, Ertan second (explicit choice), then every
// other still-open item by current Restbetrag, largest first.
export function computeSnowballPlan(items: OpenItem[], today: Date): SnowballPlan {
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

  let extraPool = 0;
  for (const i of alreadyDone) extraPool += i.monatsrate;

  let targetPtr = 0;
  while (targetPtr < priorityOrder.length && balances[priorityOrder[targetPtr].id] <= 0) targetPtr++;

  const payoffMonth: Record<string, number> = {};
  const activeIds = new Set(active.map((i) => i.id));
  let month = 0;

  while (activeIds.size > 0 && month < MAX_MONTHS) {
    month++;
    const currentTargetId = targetPtr < priorityOrder.length ? priorityOrder[targetPtr].id : null;
    const justPaidOff: OpenItem[] = [];
    for (const id of activeIds) {
      const item = items.find((i) => i.id === id)!;
      const payment = item.monatsrate + (id === currentTargetId ? extraPool : 0);
      balances[id] = Math.max(0, balances[id] - payment);
      if (balances[id] <= 0) {
        payoffMonth[id] = month;
        justPaidOff.push(item);
      }
    }
    for (const item of justPaidOff) {
      activeIds.delete(item.id);
      extraPool += item.monatsrate;
    }
    while (targetPtr < priorityOrder.length && balances[priorityOrder[targetPtr].id] <= 0) targetPtr++;
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
    debtFreeMonthIndex,
    debtFreeDate: debtFreeMonthIndex ? formatYearMonth(addMonths(nextMonthYM, debtFreeMonthIndex - 1)) : null,
    hitCap,
  };
}
