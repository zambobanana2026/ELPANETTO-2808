import type { OpenItem, OpenItemStatus, OpenItemsSummary } from "../types";

// Remaining balance on a debt/installment item. Never negative — paying
// more than the total simply zeroes it out rather than going negative.
export function computeRestbetrag(item: OpenItem): number {
  return Math.max(0, Math.round((item.gesamtbetrag - item.bereitsBezahlt) * 100) / 100);
}

// A debt is "erledigt" once fully paid off (restbetrag reaches 0) —
// derived from the numbers rather than a separately-tracked status flag,
// so it can never drift out of sync with an edit to Gesamtbetrag/Bereits
// bezahlt.
export function deriveItemStatus(item: OpenItem): OpenItemStatus {
  return computeRestbetrag(item) <= 0 ? "erledigt" : "aktiv";
}

export function computeOpenItemsSummary(items: OpenItem[]): OpenItemsSummary {
  let anzahlAktiv = 0;
  let summeRest = 0;
  let summeMonatsrate = 0;

  for (const item of items) {
    const restbetrag = computeRestbetrag(item);
    if (restbetrag <= 0) continue;
    anzahlAktiv++;
    summeRest += restbetrag;
    summeMonatsrate += item.monatsrate;
  }

  return {
    anzahlAktiv,
    summeRest: Math.round(summeRest * 100) / 100,
    summeMonatsrate: Math.round(summeMonatsrate * 100) / 100,
  };
}

export const STATUS_STYLES: Record<OpenItemStatus, string> = {
  aktiv: "bg-amber-50 text-amber-700 border border-amber-200",
  erledigt: "bg-green-50 text-green-700 border border-green-200",
};

export const STATUS_LABELS: Record<OpenItemStatus, string> = {
  aktiv: "Aktiv",
  erledigt: "✓ Erledigt",
};

export function sortOpenItems(items: OpenItem[]): OpenItem[] {
  return [...items].sort((a, b) => {
    const aPaid = deriveItemStatus(a) === "erledigt";
    const bPaid = deriveItemStatus(b) === "erledigt";
    if (aPaid !== bPaid) return aPaid ? 1 : -1; // active items first
    if (Boolean(b.istSchneeballZiel) !== Boolean(a.istSchneeballZiel)) {
      return b.istSchneeballZiel ? 1 : -1; // snowball target first among active
    }
    return computeRestbetrag(b) - computeRestbetrag(a); // largest remaining balance first
  });
}
