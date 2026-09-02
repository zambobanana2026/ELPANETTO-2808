# Carmen Next — HR-Produktwelt (Motor + Config)

Digitale HR-Toolbox-Produkte für Carmen Gruse-Lategahn (siehe `docs/CARMEN_NEXT_HANDOFF.md`
für den vollständigen Kontext). Diese Ausbaustufe enthält die **Motor + Config**
Architektur sowie **P6 „Schwierige Mitarbeitergespräche"** (migrierter Prototyp)
und **P2 „Onboarding-Prozessbundle"** (neu gebaut aus dem Quell-PDF) als zwei
vollständige Produkte — der zweite Aufbau, ohne jede Änderung am Motor, ist der
Beweis, dass die Architektur produktübergreifend trägt.

## Struktur

```
motor/            Geteiltes Design-System (engine.css) + Logik (engine.js):
                   Slide-Navigation, localStorage, Mitarbeiterverwaltung mit
                   Lizenzgrenze, Feld-Bindung, Auswahl-Toggles, Team-Report.
                   Enthält KEINE Produktinhalte. Für P2 unverändert wiederverwendet.

products/
  p6.config.js     P6-Inhalte + produktspezifische Verdrahtung (Karten-Slides
                   werden aus content/cards_p6.json generiert).
  p6/
    intro.slides.html   Statischer Marketing-/Rahmentext, Slides 1–6.
    outro.slides.html   Statischer Rahmentext, Slides 47–51 + Mitarbeiter-Modal.
  p2.config.js     P2-Inhalte + produktspezifische Verdrahtung (Radar-Übersicht,
                   Meilenstein-Karten, Buddy/Eskalation/Trennung werden aus
                   content/cards_p2.json generiert).
  p2/
    intro.slides.html   Statischer Marketing-/Rahmentext, Slides 1–5.
    outro.slides.html   Statischer Rahmentext, Slide 16 + Mitarbeiter-Modal.

content/
  cards_p6.json    Maschinenlesbare Karteninhalte (8 Karten × Vorbereitung,
                    Ziel, Fragen, Reaktionen, Vergleiche, Beispiel, Achtung,
                    optionaler Rechtshinweis). Einzige Quelle der Wahrheit für
                    die 40 generierten Karten-Slides.
  cards_p2.json    Maschinenlesbare Inhalte, extrahiert aus dem Original-PDF:
                    Radar-Phasen, 4 Meilenstein-Gespräche, Buddy-Framework,
                    Eskalationsprotokoll, Trennungs-Leitfaden.

build/
  build.js         Node-Script (keine Dependencies), fügt motor + products/*
                    zu einer einzelnen autarken HTML-Datei pro Produkt zusammen.

release/
  P6_Schwierige_Mitarbeitergespraeche.html   Fertige Auslieferungsdatei P6.
  P2_Onboarding-Prozessbundle.html           Fertige Auslieferungsdatei P2.

reference/         Unveränderte Referenzdateien aus dem Handoff (P1 = CI-/UX-
                    Referenz, P6_V3 = geprüfter Funktions-Prototyp vor der
                    P6-Migration). Nicht Teil der Produkte, nur zum Abgleich.
```

## Build

```bash
node build/build.js p6   # → release/P6_Schwierige_Mitarbeitergespraeche.html
node build/build.js p2   # → release/P2_Onboarding-Prozessbundle.html
```

Das Ergebnis ist jeweils eine einzelne HTML-Datei ohne externe Abhängigkeiten —
Käufer laden sie herunter und öffnen sie offline im Browser.

## QA

Beide Auslieferungsdateien wurden mit Playwright getestet (siehe `docs/STATUS.md`
für das vollständige Protokoll je Produkt): mehrere Mitarbeitende, Datentrennung
pro Person, Lizenzgrenze (20), Reload-Persistenz, vollständige Navigation durch
alle Slides, mobile Ansicht (390×844, fixe Navigation), keine Konsolenfehler.
Für P6 zusätzlich ein automatisierter 1:1-Textvergleich gegen `reference/P6_V3.html`;
für P2 ein automatisierter Abgleich jedes wörtlich zu übernehmenden Strings gegen
den extrahierten PDF-Rohtext (kein Prototyp vorhanden, da P2 hier erstmals gebaut wurde).

## Status & offene Entscheidungen

Siehe `docs/STATUS.md`. P3–P5, P7, P8 sind **nicht** Teil dieser Durchgänge —
CLAUDE.md verlangt ausdrücklich, Reihenfolge und Umfang für diese Produkte
zuerst mit Martin zu klären.
