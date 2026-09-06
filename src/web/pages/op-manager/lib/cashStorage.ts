import { todayIso } from "./format";
import type { CashCount, CashEntry } from "../types";

const STORAGE_KEY = "op-manager.bargeld.v1";

interface CashPersistedState {
  entries: CashEntry[];
  anfangsbestand: number;
  startDatum: string;
  counts: CashCount[];
  soundEnabled: boolean;
}

export function loadCashState(): CashPersistedState {
  const fallback: CashPersistedState = {
    entries: [],
    anfangsbestand: 80,
    startDatum: todayIso(),
    counts: [],
    soundEnabled: true,
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<CashPersistedState>;
    return {
      entries: Array.isArray(parsed.entries) ? parsed.entries : fallback.entries,
      anfangsbestand: typeof parsed.anfangsbestand === "number" ? parsed.anfangsbestand : fallback.anfangsbestand,
      startDatum: typeof parsed.startDatum === "string" ? parsed.startDatum : fallback.startDatum,
      counts: Array.isArray(parsed.counts) ? parsed.counts : fallback.counts,
      soundEnabled: typeof parsed.soundEnabled === "boolean" ? parsed.soundEnabled : fallback.soundEnabled,
    };
  } catch {
    return fallback;
  }
}

export function saveCashState(state: CashPersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable (e.g. private mode) — silently skip persistence
  }
}

export type { CashPersistedState };
