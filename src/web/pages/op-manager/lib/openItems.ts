import { todayIso } from "./format";
import type { OpenItem, OpenItemsSummary } from "../types";

// "Überfällig" is never stored — it's derived from today's date each time,
// so an item doesn't need to be re-saved just because a day passed.
export type DisplayStatus = "offen" | "ueberfaellig" | "bezahlt";

export function deriveDisplayStatus(item: OpenItem, asOfDatum: string = todayIso()): DisplayStatus {
  if (item.status === "bezahlt") return "bezahlt";
  return item.faelligkeitsdatum < asOfDatum ? "ueberfaellig" : "offen";
}

export function computeOpenItemsSummary(items: OpenItem[], asOfDatum: string = todayIso()): OpenItemsSummary {
  let anzahlOffen = 0;
  let summeOffen = 0;
  let summeUeberfaellig = 0;

  for (const item of items) {
    const status = deriveDisplayStatus(item, asOfDatum);
    if (status === "bezahlt") continue;
    anzahlOffen++;
    summeOffen += item.betrag;
    if (status === "ueberfaellig") summeUeberfaellig += item.betrag;
  }

  return { anzahlOffen, summeOffen, summeUeberfaellig };
}

export const STATUS_STYLES: Record<DisplayStatus, string> = {
  offen: "bg-amber-50 text-amber-700 border border-amber-200",
  ueberfaellig: "bg-red-50 text-red-700 border border-red-200",
  bezahlt: "bg-green-50 text-green-700 border border-green-200",
};

export const STATUS_LABELS: Record<DisplayStatus, string> = {
  offen: "Offen",
  ueberfaellig: "⚠ Überfällig",
  bezahlt: "✓ Bezahlt",
};

export function sortOpenItems(items: OpenItem[]): OpenItem[] {
  return [...items].sort((a, b) => {
    const aPaid = a.status === "bezahlt";
    const bPaid = b.status === "bezahlt";
    if (aPaid !== bPaid) return aPaid ? 1 : -1; // unpaid items first
    if (aPaid && bPaid) return (b.bezahltAm ?? "").localeCompare(a.bezahltAm ?? ""); // most recently paid first
    return a.faelligkeitsdatum.localeCompare(b.faelligkeitsdatum); // soonest due first
  });
}
