import { DEFAULT_CASH_CATEGORIES } from "./constants";
import type { CashExpense } from "../types";

const STORAGE_KEY = "op-manager.bargeld.v2";

interface CashPersistedState {
  expenses: CashExpense[];
  categories: string[];
  soundEnabled: boolean;
  // Manual adjustment on top of the Kontoauszug-derived Bar-Abhebungen total
  // — for a withdrawal the bank CSV never reported (or reported late).
  barabhebungenKorrektur: number;
}

export function loadCashState(): CashPersistedState {
  const fallback: CashPersistedState = {
    expenses: [],
    categories: [...DEFAULT_CASH_CATEGORIES],
    soundEnabled: true,
    barabhebungenKorrektur: 0,
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<CashPersistedState>;
    return {
      expenses: Array.isArray(parsed.expenses) ? parsed.expenses : fallback.expenses,
      categories:
        Array.isArray(parsed.categories) && parsed.categories.length > 0
          ? parsed.categories
          : fallback.categories,
      soundEnabled: typeof parsed.soundEnabled === "boolean" ? parsed.soundEnabled : fallback.soundEnabled,
      barabhebungenKorrektur:
        typeof parsed.barabhebungenKorrektur === "number" ? parsed.barabhebungenKorrektur : fallback.barabhebungenKorrektur,
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
