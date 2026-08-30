# Status — Carmen Next Motor/Config

## P6 Slide 2 — bewusste Abweichung vom Original-Prototyp

Auf Wunsch wurde Slide 2 ("So funktioniert's") geändert: die 4 Schritte stehen
jetzt untereinander (neue, generische Motor-Klasse `.grid1` in `engine.css`)
statt im 2-Spalten-Grid, und jeder Schritt hat mehr Erklärung inklusive eines
durchgängigen Beispiels ("Julia Berger"). Das ist die einzige inhaltliche
Abweichung von `reference/P6_V3.html` — `qa/p6_diff.js` meldet dafür jetzt
absichtlich "1 slides differ" auf Slide 2, alles andere ist weiterhin identisch.
Funktional (`qa/p6_qa.js`) unverändert grün, P2 unberührt.

## P2 — Onboarding-Prozessbundle (neu gebaut, kein Vorgänger-Prototyp)

Anders als P6 gab es für P2 noch keine geprüfte interaktive Fassung —
CLAUDE.md listet P2 als „nur als PDF/Word vorhanden". Dieser Durchgang hat
den Inhalt aus `handoff/source/P2_.../Onboarding-Prozessbundle.pdf` extrahiert
(via `pypdf`, in einem venv wegen eines defekten System-`cryptography`-Pakets)
und daraus die erste interaktive Fassung gebaut — der Motor blieb dabei
**unverändert** (kein einziger Commit an `motor/engine.js`/`.css`), was genau
den in CLAUDE.md geforderten Beweis liefert, dass der Motor produktübergreifend
trägt.

**Struktur:** `content/cards_p2.json` (Radar-Phasen, 4 Meilenstein-Gespräche,
Buddy-Framework, Eskalationsprotokoll, Trennungs-Leitfaden — alles wörtlich
aus dem PDF, nichts erfunden) + `products/p2.config.js` + `products/p2/*.slides.html`
→ `release/P2_Onboarding-Prozessbundle.html` (16 Slides, 46 KB).

**Eigene Design-Entscheidungen** (weil kein Prototyp vorgab, wie es aussehen
soll — bitte gegenprüfen):
- **Neues, drittes Interaktions-Muster:** eine chronologische Meilenstein-Linie
  (Tag 30 → 60 → 90 → 150–170) statt P6s situativer Kartenauswahl. Folgerichtig
  sind die Slides hier *sequentiell verkettet* — jedes „Weiter" führt zur
  nächsten Station — statt wie bei P6 nur über die Übersicht erreichbar zu sein.
- **Ein Slide pro Meilenstein** (nicht 5 Unterseiten wie bei P6): Die
  „Arbeitskarten" im Quellmaterial waren selbst je einseitig, der Inhalt pro
  Meilenstein ist deutlich schlanker als bei P6s Gesprächskarten.
- **Mitarbeiterverwaltung mit Lizenzgrenze (20) übernommen** — Antwort auf
  offene Frage 2 unten: Ja für P2, weil die Begleitung inhärent personenbezogen
  ist (jede neue Mitarbeiterin/jeder neue Mitarbeiter hat eine eigene Probezeit).
- **Team-Bericht zählt nur die 4 Kern-Gespräche** (Tag 30/60/90/150–170), nicht
  Buddy/Eskalation/Trennung — das entspricht der „Gesprächsfolge"-Checkliste
  im Quell-PDF, die genau diese vier als Standardpfad führt; Buddy/Eskalation/
  Trennung sind bedingte Werkzeuge, keine Pflichtstationen.

**QA:** gleicher Playwright-Umfang wie P6 (Mitarbeiter-CRUD, Datentrennung,
Lizenzgrenze, Reload-Persistenz, vollständige Navigation 1–16, Team-Bericht,
Mobile-Ansicht, keine Konsolenfehler) — alle grün. Zusätzlich ein automatisierter
Abgleich jedes wörtlich zu übernehmenden Strings gegen den PDF-Rohtext; dabei
einen echten Tippfehler gefunden und behoben (verschachtelte Anführungszeichen
bei der „Goldenen Abschlussfrage" — falsches Zeichen `„…“` statt `‚…'` für das
innere Zitat, jetzt wie im Original).

---

# Status — P6 Motor/Config-Migration

## Was in diesem Durchgang gebaut wurde

- `motor/engine.css` + `motor/engine.js`: geteiltes, produktunabhängiges
  Design-System und geteilte Logik (Slide-Navigation, localStorage-Store,
  Mitarbeiterverwaltung mit Lizenzgrenze, Feld-Bindung, Auswahl-Toggles,
  Team-Report-Rendering, Modal-Handling). Keine P6-spezifischen Inhalte.
- `products/p6.config.js` + `products/p6/*.slides.html`: P6-Inhalte. Die 40
  Karten-Slides (8 Karten × 5 Unterseiten) werden zur Build-Zeit aus
  `content/cards_p6.json` generiert statt von Hand geschrieben. Die 11
  Rahmen-Slides (Intro/Outro, reiner Marketingtext ohne Kartenbezug) liegen
  als statische HTML-Fragmente vor, 1:1 aus `reference/P6_V3.html` übernommen.
- `build/build.js`: reines Node-Script ohne Dependencies, fügt beides zu
  `release/P6_Schwierige_Mitarbeitergespraeche.html` zusammen (116 KB, eine
  Datei, keine externen Abhängigkeiten).

## QA-Ergebnis

Playwright-Testlauf (Chromium, headless) deckt die Checkliste aus
`CARMEN_NEXT_HANDOFF.md` ab:

- Mehrere Mitarbeitende anlegen, Felder befüllen, Datentrennung geprüft
  (inkl. eines dabei gefundenen und behobenen Bugs, siehe unten)
- Lizenzgrenze (20) korrekt durchgesetzt (Modal öffnet nicht, Hinweis erscheint)
- Mitarbeiter entfernen (inkl. Bestätigungsdialog)
- Reload → Mitarbeitende und Feldwerte bleiben erhalten (localStorage)
- Navigation durch alle 51 Slides funktioniert; Karte 8 (letzte Karte) leitet
  korrekt zur Bibliothek weiter, Karten 1–7 zur jeweils nächsten Karte
- Team-Bericht-Slide summiert korrekt
- Rechtlicher Hinweis auf Slide 3 vorhanden
- Mobile-Ansicht (390×844): fixe Navigation unten, kein Bleed-Through
- Konsole/Page-Errors: keine

Zusätzlich: automatisierter Text-Vergleich jeder der 51 Slides zwischen
`release/P6_Schwierige_Mitarbeitergespraeche.html` und `reference/P6_V3.html`
— keine inhaltlichen Abweichungen gefunden.

**Bug gefunden und behoben:** In der ersten Motor-Fassung wurde beim
Wechseln des aktiven Mitarbeiters per Klick auf eine Mitarbeiter-Kachel
(`manager.setActive`) das Wiederherstellen der Feldwerte (`restoreFieldsForActive`)
nicht ausgelöst — nur Anlegen/Entfernen riefen es explizit auf. Dadurch blieb
kurzzeitig der Feldinhalt der vorherigen Person sichtbar, bis man die Karte
verließ und erneut betrat. Behoben über einen zentralen `onChange`-Hook im
Employee-Manager, der bei jeder Zustandsänderung (add/remove/setActive)
greift. Der Playwright-Test, der das aufgedeckt hat, ist in der QA-Checkliste
oben enthalten ("Datentrennung geprüft").

## Bewusst nicht entschieden (siehe CLAUDE.md „Offene Entscheidungen")

Diese beiden Durchgänge decken **P6 und P2** ab. Nicht angefasst bzw. nicht entschieden:

1. Reihenfolge/Umfang für P3–P5 und P8 (noch nicht extrahiert, liegen als
   Roh-PDFs/Word-Dateien unter `handoff/source/` im ursprünglichen Zip vor,
   nicht in dieses Repo übernommen). P2 wurde zuerst gebaut, weil es in der
   CLAUDE.md-Tabelle direkt nach P6 als nächstes Produkt geführt wird.
2. ~~Ob P2–P5/P8 ebenfalls eine Mitarbeiterverwaltung mit Lizenzgrenze
   bekommen sollen.~~ Für P2 entschieden (ja, siehe oben) — für P3–P5/P8
   weiterhin offen, da deren Inhalt noch nicht gesichtet wurde.
3. Ob/wie P1 selbst auf den Motor migriert wird (P1 hat zusätzliche,
   deutlich umfangreichere Logik — Wochen-/Ampel-Zyklus, CI-Farbwahl pro
   Mitarbeiter/Job, Kompetenz-Timeline, Report mit Print/E-Mail-Export —,
   die der Motor aktuell bewusst *nicht* nachbildet, um den Umfang dieser
   Migration nicht zu sprengen). `motor/engine.js` ist so geschnitten
   (Store/Nav/Employees/Fields/Choices/TeamReport als unabhängige Bausteine),
   dass P1 später darauf aufsetzen könnte, ohne dass P6 etwas davon mitbekommt.
4. P7 (eigene React-Full-Stack-App) — laut CLAUDE.md ausdrücklich kein
   Kandidat für diesen Motor, nicht angefasst.

Preis-Entscheidungen sind wie vorgegeben nicht Teil des Codes.
