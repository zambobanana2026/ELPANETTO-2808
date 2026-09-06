import type { Transaction } from "../types";

const STORAGE_KEY = "op-manager.kontoauszug.v1";

interface PersistedState {
  transactions: Transaction[];
  anfangsbestand: number;
  startDatum: string;
  soundEnabled: boolean;
}

export function defaultStartDatum(): string {
  const year = new Date().getFullYear();
  return `${year}-08-27`;
}

export function loadState(): PersistedState {
  const fallback: PersistedState = {
    transactions: [],
    anfangsbestand: 80,
    startDatum: defaultStartDatum(),
    soundEnabled: true,
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : fallback.transactions,
      anfangsbestand: typeof parsed.anfangsbestand === "number" ? parsed.anfangsbestand : fallback.anfangsbestand,
      startDatum: typeof parsed.startDatum === "string" ? parsed.startDatum : fallback.startDatum,
      soundEnabled: typeof parsed.soundEnabled === "boolean" ? parsed.soundEnabled : fallback.soundEnabled,
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
