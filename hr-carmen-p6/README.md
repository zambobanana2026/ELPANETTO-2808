# Carmen Next — HR-Produktwelt (Motor + Config)

Digitale HR-Toolbox-Produkte für Carmen Gruse-Lategahn (siehe `docs/CARMEN_NEXT_HANDOFF.md`
für den vollständigen Kontext). Diese erste Ausbaustufe enthält die **Motor + Config**
Architektur und **P6 „Schwierige Mitarbeitergespräche"** als vollständig migriertes Produkt.

## Struktur

```
motor/            Geteiltes Design-System (engine.css) + Logik (engine.js):
                   Slide-Navigation, localStorage, Mitarbeiterverwaltung mit
                   Lizenzgrenze, Feld-Bindung, Auswahl-Toggles, Team-Report.
                   Enthält KEINE Produktinhalte.

products/
  p6.config.js     P6-Inhalte + produktspezifische Verdrahtung (Karten-Slides
                   werden aus content/cards_p6.json generiert).
  p6/
    intro.slides.html   Statischer Marketing-/Rahmentext, Slides 1–6.
    outro.slides.html   Statischer Rahmentext, Slides 47–51 + Mitarbeiter-Modal.

content/
  cards_p6.json    Maschinenlesbare Karteninhalte (8 Karten × Vorbereitung,
                    Ziel, Fragen, Reaktionen, Vergleiche, Beispiel, Achtung,
                    optionaler Rechtshinweis). Einzige Quelle der Wahrheit für
                    die 40 generierten Karten-Slides.

build/
  build.js         Node-Script (keine Dependencies), fügt motor + products/*
                    zu einer einzelnen autarken HTML-Datei zusammen.

release/
  P6_Schwierige_Mitarbeitergespraeche.html   Fertige Auslieferungsdatei.

reference/         Unveränderte Referenzdateien aus dem Handoff (P1 = CI-/UX-
                    Referenz, P6_V3 = geprüfter Funktions-Prototyp vor der
                    Migration). Nicht Teil des Produkts, nur zum Abgleich.
```

## Build

```bash
node build/build.js p6
# → release/P6_Schwierige_Mitarbeitergespraeche.html
```

Das Ergebnis ist eine einzelne HTML-Datei ohne externe Abhängigkeiten — Käufer
laden sie herunter und öffnen sie offline im Browser.

## QA

`release/P6_Schwierige_Mitarbeitergespraeche.html` wurde mit Playwright getestet
(siehe `docs/STATUS.md` für das Protokoll): mehrere Mitarbeitende, Datentrennung
pro Person, Lizenzgrenze (20), Reload-Persistenz, vollständige Navigation durch
alle 51 Slides, mobile Ansicht (390×844, fixe Navigation), keine Konsolenfehler.
Zusätzlich wurde der sichtbare Text jeder Slide automatisiert 1:1 gegen
`reference/P6_V3.html` verglichen — keine inhaltlichen Abweichungen.

## Status & offene Entscheidungen

Siehe `docs/STATUS.md`. P2–P5, P7, P8 sind **nicht** Teil dieser Migration —
CLAUDE.md verlangt ausdrücklich, Reihenfolge und Umfang für diese Produkte
zuerst mit Martin zu klären.
