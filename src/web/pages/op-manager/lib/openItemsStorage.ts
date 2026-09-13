import type { OpenItem } from "../types";

const STORAGE_KEY = "op-manager.offene-posten.v1";

interface OpenItemsPersistedState {
  items: OpenItem[];
  soundEnabled: boolean;
}

// Seed data for a fresh browser/device with nothing in localStorage yet —
// keeps this device's first paint in sync with the artifact's baked-in
// default rather than starting empty.
const DEFAULT_OPEN_ITEMS: OpenItem[] = [
  {
    bereitsBezahlt: 0,
    erfasstAm: "2026-09-07T01:42:27.975918Z",
    gesamtbetrag: 1587,
    glaeubiger: "Klarna/Digistore24",
    iban: "",
    id: "4d12c4ed-aa5f-42be-ae73-725ba7ac72b3",
    istSchneeballZiel: true,
    kategorie: "Online-Shopping",
    monatsrate: 87,
    notiz: "",
    quelle: "import",
    startMonat: "2026-10",
    verwendungszweck: "Klarna Digistore24",
  },
  {
    bereitsBezahlt: 20,
    erfasstAm: "2026-09-07T01:42:27.975918Z",
    gesamtbetrag: 183,
    glaeubiger: "miamono/ARAG",
    iban: "",
    id: "933b22be-5973-433f-9cd0-7680b6dc5fc1",
    istSchneeballZiel: false,
    kategorie: "Versicherung",
    monatsrate: 20,
    notiz: "",
    quelle: "import",
    startMonat: "2026-10",
    verwendungszweck: "miamono ARAG",
  },
  {
    bereitsBezahlt: 20,
    erfasstAm: "2026-09-07T01:42:27.975918Z",
    gesamtbetrag: 65.59,
    glaeubiger: "Telekom/KSP",
    iban: "DE23200700240090263513",
    id: "85589e82-2ae2-43ba-9707-31c0cab5d2ef",
    istSchneeballZiel: false,
    kategorie: "Telekommunikation",
    monatsrate: 20,
    notiz: "",
    quelle: "import",
    startMonat: "2026-10",
    verwendungszweck: "Telekom KSP",
  },
  {
    bereitsBezahlt: 50,
    erfasstAm: "2026-09-07T01:42:27.975918Z",
    gesamtbetrag: 285.4,
    glaeubiger: "Hauptzollamt/TK",
    iban: "DE88480000000480010000",
    id: "a1feff0a-a76a-419a-9cec-127d0bffd7f7",
    istSchneeballZiel: false,
    kategorie: "Finanzamt",
    monatsrate: 25,
    notiz: "",
    quelle: "import",
    startMonat: "2026-10",
    verwendungszweck: "Hauptzollamt TK",
  },
  {
    bereitsBezahlt: 20,
    erfasstAm: "2026-09-07T01:42:27.975918Z",
    gesamtbetrag: 79.89,
    glaeubiger: "solvendi/Buhl",
    iban: "DE55265501051551192840",
    id: "4539ef20-3926-4d40-a5ed-3d87056ec12f",
    istSchneeballZiel: false,
    kategorie: "Software/Abo",
    monatsrate: 20,
    notiz: "",
    quelle: "import",
    startMonat: "2026-10",
    verwendungszweck: "solvendi Buhl",
  },
  {
    bereitsBezahlt: 40,
    erfasstAm: "2026-09-07T01:42:27.975918Z",
    gesamtbetrag: 83.5,
    glaeubiger: "Bußgeld Parken 2. Reihe",
    iban: "DE73700202700020073850",
    id: "61a53391-f8e1-4463-8ef5-fe4391fa70f9",
    istSchneeballZiel: false,
    kategorie: "Bußgeld",
    monatsrate: 20,
    notiz: "",
    quelle: "import",
    startMonat: "2026-09",
    verwendungszweck: "D-8092-102495-26/8",
  },
  {
    bereitsBezahlt: 40,
    erfasstAm: "2026-09-07T01:42:27.975918Z",
    gesamtbetrag: 83.5,
    glaeubiger: "Bußgeld Parken Gehweg",
    iban: "DE73700202700020073850",
    id: "91000b16-3800-477c-890f-dfd364f0c1b5",
    istSchneeballZiel: false,
    kategorie: "Bußgeld",
    monatsrate: 20,
    notiz: "",
    quelle: "import",
    startMonat: "2026-09",
    verwendungszweck: "D-8092-067675-26/4",
  },
  {
    bereitsBezahlt: 40,
    erfasstAm: "2026-09-07T01:42:27.975918Z",
    gesamtbetrag: 52,
    glaeubiger: "Bußgeld Anhänger",
    iban: "DE73700202700020073850",
    id: "439da54a-5889-4412-a92a-20785896f862",
    istSchneeballZiel: false,
    kategorie: "Bußgeld",
    monatsrate: 20,
    notiz: "",
    quelle: "import",
    startMonat: "2026-09",
    verwendungszweck: "D-8098-036492-26/6",
  },
  {
    bereitsBezahlt: 0,
    erfasstAm: "2026-09-07T01:42:27.975918Z",
    gesamtbetrag: 552,
    glaeubiger: "Finanzamt Rosenheim USt",
    iban: "",
    id: "512be914-7c67-4698-a001-c42c378e8203",
    istSchneeballZiel: false,
    kategorie: "Finanzamt",
    monatsrate: 100,
    notiz: "",
    quelle: "import",
    startMonat: "2026-10",
    verwendungszweck: "Finanzamt Rosenheim USt",
  },
  {
    bereitsBezahlt: 40,
    erfasstAm: "2026-09-07T01:42:27.975918Z",
    gesamtbetrag: 81.2,
    glaeubiger: "BID Inkasso/GMX",
    iban: "DE70783200760001420755",
    id: "07fe88bb-4f4d-42ea-bf2a-738d840abd34",
    istSchneeballZiel: false,
    kategorie: "Inkasso",
    monatsrate: 20,
    notiz: "",
    quelle: "import",
    startMonat: "2026-10",
    verwendungszweck: "BID Inkasso GMX",
  },
  {
    bereitsBezahlt: 0,
    erfasstAm: "2026-09-07T01:42:27.975918Z",
    gesamtbetrag: 117,
    glaeubiger: "Sparkassen DirektVers.",
    iban: "",
    id: "fd0b6177-5fd3-438e-a250-f2a6ed9caa8a",
    istSchneeballZiel: false,
    kategorie: "Versicherung",
    monatsrate: 20,
    notiz: "",
    quelle: "import",
    startMonat: "2026-10",
    verwendungszweck: "Sparkassen DirektVers.",
  },
  {
    bereitsBezahlt: 0,
    erfasstAm: "2026-09-07T01:42:27.975918Z",
    gesamtbetrag: 22.7,
    glaeubiger: "Hostinger (Einmalzahlung)",
    iban: "",
    id: "5c9ef36b-5b90-4cf5-9781-8cd1c4b308a7",
    istSchneeballZiel: false,
    kategorie: "Internet/Hosting",
    monatsrate: 22.7,
    notiz: "",
    quelle: "import",
    startMonat: "2026-10",
    verwendungszweck: "Hostinger",
  },
  {
    bereitsBezahlt: 20,
    erfasstAm: "2026-09-07T01:42:27.975918Z",
    gesamtbetrag: 40,
    glaeubiger: "Sparkasse Wasserburg",
    iban: "",
    id: "19151120-bf7a-446d-b083-81fcc7ab783a",
    istSchneeballZiel: false,
    kategorie: "Bank/Kredit",
    monatsrate: 20,
    notiz: "",
    quelle: "import",
    startMonat: "2026-10",
    verwendungszweck: "Sparkasse Wasserburg",
  },
  {
    bereitsBezahlt: 0,
    erfasstAm: "2026-09-07T01:42:27.975918Z",
    gesamtbetrag: 1500,
    glaeubiger: "Ertan",
    iban: "",
    id: "f51007f2-2cfa-41a4-8318-15b1f2d2708e",
    istSchneeballZiel: false,
    kategorie: "Sonstiges",
    monatsrate: 50,
    notiz: "",
    quelle: "import",
    startMonat: "2026-10",
    verwendungszweck: "Ertan",
  },
];

export function loadOpenItemsState(): OpenItemsPersistedState {
  const fallback: OpenItemsPersistedState = { items: DEFAULT_OPEN_ITEMS, soundEnabled: true };

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
