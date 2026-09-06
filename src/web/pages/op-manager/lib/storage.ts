import { buildFingerprint } from "./duplicateDetection";
import type { Transaction } from "../types";

const STORAGE_KEY = "op-manager.kontoauszug.v1";

interface PersistedState {
  transactions: Transaction[];
  anfangsbestand: number;
  startDatum: string;
  soundEnabled: boolean;
  // Learned IBAN -> Gläubiger name, keyed by IBAN. Filled in whenever the
  // user names a counterparty the bank only reported by IBAN, then applied
  // to every transaction (past and future) for that IBAN.
  ibanNamen: Record<string, string>;
}

export function defaultStartDatum(): string {
  const year = new Date().getFullYear();
  return `${year}-08-27`;
}

export function loadState(): PersistedState {
  const fallback: PersistedState = {
    transactions: [],
    anfangsbestand: 0,
    startDatum: defaultStartDatum(),
    soundEnabled: true,
    ibanNamen: {},
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    const transactions = Array.isArray(parsed.transactions) ? parsed.transactions : fallback.transactions;
    return {
      // Re-derive every fingerprint from the transaction's own stable fields
      // on each load, so a past change to the fingerprint formula (it used
      // to include the editable Gläubiger name) can't leave already-stored
      // transactions stuck with a stale value that no longer matches what a
      // fresh CSV import computes — that mismatch is what let a duplicate
      // import through undetected.
      transactions: transactions.map((tx) => ({ ...tx, fingerprint: buildFingerprint(tx) })),
      anfangsbestand: typeof parsed.anfangsbestand === "number" ? parsed.anfangsbestand : fallback.anfangsbestand,
      startDatum: typeof parsed.startDatum === "string" ? parsed.startDatum : fallback.startDatum,
      soundEnabled: typeof parsed.soundEnabled === "boolean" ? parsed.soundEnabled : fallback.soundEnabled,
      ibanNamen:
        parsed.ibanNamen && typeof parsed.ibanNamen === "object" ? parsed.ibanNamen : fallback.ibanNamen,
    };
  } catch {
    return fallback;
  }
}

export function saveState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable (e.g. private mode) — silently skip persistence
  }
}

export type { PersistedState };
