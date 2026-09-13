import { GELDTRANSIT_LABEL } from "./constants";
import type { OpenItem, OpenItemStatus, OpenItemsSummary, Transaction } from "../types";

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

// Loose text match used to link an Offene-Posten item to a Kontoauszug
// transaction: lowercased, umlauts folded, punctuation stripped, so
// "Klarna/Digistore24" and "KLARNA*DIGISTORE24 DE" line up.
export function normalizeForMatch(s: string): string {
  const umlauts: Record<string, string> = { ä: "ae", ö: "oe", ü: "ue", ß: "ss" };
  return (s || "")
    .toLowerCase()
    .replace(/[äöüß]/g, (c) => umlauts[c])
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// A Gläubiger name is sometimes stored as "A/B" when two possible payees
// apply (e.g. "Klarna/Digistore24") — split on / and , so either half can
// match on its own.
function glaeubigerNameCandidates(glaeubiger: string): string[] {
  return (glaeubiger || "")
    .split(/[/,]/)
    .map(normalizeForMatch)
    .filter((s) => s.length >= 3);
}

// Every Kontoauszug transaction that plausibly belongs to this Offene-
// Posten item, matching on Verwendungszweck text or Gläubiger name
// (either direction, substring).
function findAllMatchingTransactions(item: OpenItem, transactions: Transaction[]): Transaction[] {
  const glCandidates = glaeubigerNameCandidates(item.glaeubiger);
  const itemVz = normalizeForMatch(item.verwendungszweck);
  return transactions.filter((tx) => {
    const txGl = normalizeForMatch(tx.glaeubiger);
    const txVz = normalizeForMatch(tx.verwendungszweck);
    const glMatch = glCandidates.some((c) => (txGl && txGl.includes(c)) || (txVz && txVz.includes(c)));
    const vzMatch = itemVz.length >= 3 && Boolean(txVz) && (txVz.includes(itemVz) || itemVz.includes(txVz));
    return glMatch || vzMatch;
  });
}

// Finds the Kontoauszug transaction that best explains an Offene-Posten
// item's Verwendungszweck. Picks the most recent match when several fit.
export function findMatchingTransaction(item: OpenItem, transactions: Transaction[]): Transaction | null {
  const matches = findAllMatchingTransactions(item, transactions);
  let best: Transaction | null = null;
  for (const tx of matches) {
    if (!best || tx.datum > best.datum) best = tx;
  }
  return best;
}

// Every Kontoauszug row that counts as an actual payment toward this item —
// excludes Geldtransit (internal money movement, not a real payment) and
// Bar-Abhebung-marked rows (cash withdrawals, not a payment to this
// specific creditor). Exposed so the monthly payments view can show which
// of these happened in which month.
export function getMatchingPaymentTransactions(item: OpenItem, transactions: Transaction[]): Transaction[] {
  return findAllMatchingTransactions(item, transactions).filter(
    (tx) => tx.betrag < 0 && tx.verwendungszweck !== GELDTRANSIT_LABEL && !tx.istBarAbhebung
  );
}

// Sums every matching payment to suggest as "Bereits bezahlt". Several
// matches (e.g. monthly installments already visible in the Kontoauszug)
// are added together.
export function computeMatchingPaymentSum(item: OpenItem, transactions: Transaction[]): number {
  const sum = getMatchingPaymentTransactions(item, transactions).reduce((acc, tx) => acc + Math.abs(tx.betrag), 0);
  return Math.round(sum * 100) / 100;
}

export interface MonthlyPayment {
  monat: string; // "YYYY-MM"
  glaeubiger: string;
  betrag: number;
  datum: string;
}

// Every Kontoauszug-matched payment across all open items, for a month-by-
// month view of what got paid when (answers "was habe ich in einem Monat
// bezahlt?").
export function computeMonthlyPayments(items: OpenItem[], transactions: Transaction[]): MonthlyPayment[] {
  const result: MonthlyPayment[] = [];
  for (const item of items) {
    for (const tx of getMatchingPaymentTransactions(item, transactions)) {
      result.push({ monat: tx.datum.slice(0, 7), glaeubiger: item.glaeubiger, betrag: Math.abs(tx.betrag), datum: tx.datum });
    }
  }
  return result;
}
