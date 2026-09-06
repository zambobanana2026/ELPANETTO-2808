import { looksLikeIban } from "./csvParser";
import type { Transaction } from "../types";

// True when a transaction has no real counterparty name to show — either
// the bank never reported one, or it reported only the counterparty's IBAN
// (common for transfers between the user's own accounts).
export function isGlaeubigerPlaceholder(tx: Transaction): boolean {
  const name = tx.glaeubiger.trim();
  if (name.length === 0) return true;
  if (name === "Unbekannt") return true; // legacy fallback from before this field could be left blank
  if (tx.iban && name === tx.iban) return true;
  return looksLikeIban(name);
}

// Applies every learned IBAN -> name mapping across the given transactions,
// overwriting any placeholder (or previously different) name for a matching
// IBAN. Called both right after a CSV import (to name newly-added rows
// whose IBAN is already known) and right after the user names a new IBAN
// (to retroactively fix every past transaction from that same account).
export function applyKnownGlaeubigerNames(
  transactions: Transaction[],
  ibanNamen: Record<string, string>
): Transaction[] {
  return transactions.map((tx) => {
    const known = tx.iban ? ibanNamen[tx.iban] : undefined;
    if (!known || tx.glaeubiger === known) return tx;
    return { ...tx, glaeubiger: known };
  });
}
