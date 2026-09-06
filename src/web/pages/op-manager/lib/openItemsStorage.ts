import type { OpenItem } from "../types";

const STORAGE_KEY = "op-manager.offene-posten.v1";

interface OpenItemsPersistedState {
  items: OpenItem[];
  soundEnabled: boolean;
}

export function loadOpenItemsState(): OpenItemsPersistedState {
  const fallback: OpenItemsPersistedState = { items: [], soundEnabled: true };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<OpenItemsPersistedState>;
    return {
      items: Array.isArray(parsed.items) ? parsed.items : fallback.items,
      soundEnabled: typeof parsed.soundEnabled === "boolean" ? parsed.soundEnabled : fallback.soundEnabled,
    };
  } catch {
    return fallback;
  }
}

export function saveOpenItemsState(state: OpenItemsPersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable (e.g. private mode) — silently skip persistence
  }
}

export type { OpenItemsPersistedState };
