# Status — Carmen Next Motor/Config

## P6 — neue Willkommens-Slide (jetzt Slide 1, alles rückt um 1 nach hinten)

Neue erste Slide vor dem bisherigen Hero: Begrüßungstext, 9:16-Video-
Platzhalter (`.videoPlaceholder`, neue generische Motor-Klasse — noch kein
echtes Video, klar als Platzhalter markiert mit "[hier kommt dein Video]"),
darunter eine kurze Hook/Problem/Lösung-Beschreibung als zwei Kacheln
("DAS PROBLEM." / "DIE LÖSUNG."). Statt eines externen GIFs (würde die
Ein-Datei-ohne-externe-Abhängigkeiten-Anforderung brechen) eine kleine
CSS-Wink-Animation (`.wave`, 👋-Emoji) als augenzwinkernder Ersatz.

**Alle Slide-Nummern haben sich dadurch um 1 verschoben** — P6 hat jetzt
52 statt 51 Slides. Betroffen: `FIRST_CARD_SLIDE` in `products/p6.config.js`
(7→8), die zentrale `navBar()`-Funktion (Übersicht-Button `goTo(6)`→`goTo(7)`,
gilt für alle 40 generierten Karten-Slides auf einen Schlag), der
Team-Bericht-Hook (`nav.onEnter(49,...)`→`nav.onEnter(50,...)`), sowie in
`products/p6/intro.slides.html` und `outro.slides.html` alle `data-slide`-
Werte, `.num`-Anzeigen und die 8 fest verdrahteten `goTo()`-Ziele der
Karten-Übersicht-Kacheln. `qa/p6_qa.js` komplett auf die neue Nummerierung
angepasst (52 Slides, alle Ziel-Slides +1) — 93 Checks, alle grün. P2
unberührt (eigene Datei, eigene Nummerierung, nicht betroffen).

## Farbmodelle — neue, generische Motor-Funktion (P6 + P2)

Auf Wunsch jederzeit wechselbare Farbschemata: ein kleiner Kreis-Button
(🎨) fixiert oben links, auf jeder Slide sichtbar (liegt außerhalb der
`.slide`-Sections, damit er die Navigation übersteht), öffnet ein Modal mit
10 fertigen Farbmodellen. Implementiert in `motor/engine.js`
(`createColorThemes` + `DEFAULT_THEMES`) und `motor/engine.css`
(`.themeTrigger`, `.themeSwatches`, `.themeSwatch`) — beide Produkte binden
es in ihrem `initScript` identisch ein, nur der localStorage-Key ist
produktspezifisch (`p6_theme_v1` / `p2_theme_v1`), damit eine Wahl in P6
nicht die in P2 überschreibt.

**Erste Fassung war unvollständig** — überschrieb nur `--ci`/`--mint`
(Marke/Akzent), ließ Hintergrund und Text absichtlich fest, um Kontrast
nicht zu riskieren. Martin hat als Referenz sein eigenes "OP Manager"-Tool
gezeigt: dort ist jedes Farbmodell ein vollständig abgestimmtes Set aus
sechs Kanälen (bg/surface/text/accent/border/muted), inklusive eines echten
Dark-Themes — das war der eigentliche Maßstab. Zweite Fassung jetzt danach
gebaut: neun Tokens pro Modell (`pagebg`, `paper`, `surface`, `ink`,
`muted`, `line`, `ci`, `mint`, `num`), alle als **zusammengehöriges Set**
pro Modell gewählt (nicht einzeln überschrieben), damit Kontrast innerhalb
eines Modells garantiert bleibt. Dafür mussten alle fest verdrahteten
`white`/`#fff`/`#777`-Stellen in `engine.css` auf die neuen Tokens
(`--surface`, `--muted`) umgestellt werden (Karten, Textareas, Inputs,
Dialoge, Team-Tabelle, Formulierungs-Boxen usw.) — betrifft nur P6 und P2,
da beide denselben Motor teilen.

9 der 10 Modelle sind helle Varianten (nur `pagebg`/`paper`/`muted`/`line`/
`ci`/`mint`/`num` wandern mit dem Farbton, `ink`/`surface` bleiben gleich).
Das zehnte ("Anthrazit (Dunkel)") ist ein echtes dunkles Theme —
`ink` kippt dort zusätzlich auf hell, `surface` auf dunkel, damit der
Kontrast stimmt.

**Bewusst weiterhin fest über alle Modelle:** die Ampelfarben
`--green`/`--orange`/`--red` (Erfolg/Warnung/Fehler darf nicht mit der
Marke kippen), der helle Grün-Ton hinter angehakten Checkboxen
(`.choice.on`, fest an `--green` gekoppelt statt an ein Farbmodell), und
der rote PDF-Druck-Button (`.pdfBtn`, eigenständige feste Aktionsfarbe,
kein Marken-Token). Print-Ausgabe (`@media print`) bleibt immer reines
Weiß, unabhängig vom gewählten Bildschirm-Theme — für den PDF-Export
gewollt.

Wahl wird wie Mitarbeiterdaten in localStorage gespeichert und übersteht
Reload — inklusive der Hintergrundfarbe, nicht nur des Akzents.

## P6 Slides 2, 4 & 6 — bewusste Abweichung vom Original-Prototyp

Auf Wunsch wurden drei Übersichts-Slides umgebaut:

- **Slide 2** ("So funktioniert's"): die 4 Schritte stehen jetzt untereinander
  (neue, generische Motor-Klasse `.grid1` in `engine.css`, analog zum
  bestehenden `.grid4`) statt im 2-Spalten-Grid, jeder Schritt mit mehr
  Erklärung inklusive eines durchgängigen Beispiels ("Julia Berger").
- **Slide 4** ("Das Carmen-KLAR-System"): K/L/A/R ebenfalls untereinander,
  jeder Buchstabe mit Beispiel im selben "Julia"-Faden wie Slide 2 (K bezieht
  sich inhaltlich auf dasselbe Leistungs-Beispiel, R paraphrasiert die echte
  erste Reaktion aus Karte 1 in `content/cards_p6.json`). Der Abschluss-Kasten
  ("+ Abschluss und Follow-up") hat ebenfalls ein Beispiel bekommen.
- **Slide 6** ("Welches Gespräch steht an?"): die 8 Karten-Kacheln ebenfalls
  untereinander, jede mit einem echten Beispiel aus `content/cards_p6.json`
  (Situation + „Nicht sagen"/„Besser sagen"-Kontrast der jeweiligen Karte,
  wörtlich aus den bereits vorhandenen `beispiel`-Feldern übernommen, nichts
  neu erfunden).

Zusätzlich Slides 47 (Formulierungs-Bibliothek) und 48 (Notfallkarte) auf
`.grid1` umgestellt (nur Layout, kein Textinhalt geändert — beide hatten
bereits je zwei Beispielsätze pro Box). Bewusst **nicht** angefasst: Slide 1
(Hero) bleibt mehrspaltig, weil es eine Marketing-Kachelreihe und keine
Schritt-für-Schritt-Erklärung ist; die 40 Karten-Slides (7–46) folgen bereits
dem "eine Sache pro Slide, mit echtem Beispiel"-Prinzip in ihrem eigenen
etablierten Format (Vorbereitung/Ziel/Reaktionen/Vereinbarung/Follow-up) und
wurden daher nicht in das Slide-2/4/6-Muster gepresst.

## P6 — "Karte" → "Gesprächskarte"

Auf Wunsch umbenannt: überall, wo bisher "KARTE 1" / "Karte 1" für eine der
8 Situationskarten stand (Marken-Zeile jeder Karten-Unterseite, Überschrift
"PASST DIESE KARTE?", die 8 Kacheln auf Slide 6, der "Nächste Karte"-Button),
steht jetzt "GESPRÄCHSKARTE"/"Gesprächskarte" — durchgesetzt in
`products/p6.config.js` (generierte Karten-Slides) und
`products/p6/intro.slides.html` (Slide 2 und 6). "NOTFALLKARTE" (Slide 48,
anderes Konzept) bleibt unverändert. P2 nicht betroffen — dort gibt es keine
"Karte 1/2/3"-Nummerierung, das war nur ein P6-Begriff.

Damit weicht jetzt ein Großteil der Slides (43 von 51) inhaltlich von
`reference/P6_V3.html` ab — `qa/p6_diff.js` zeigt das erwartungsgemäß an.
Das ist ab jetzt der Normalfall: sobald P6 über den migrierten Ausgangsstand
hinaus weiterentwickelt wird, wächst diese Zahl mit jeder gewollten
Änderung. `qa/p6_diff.js` bleibt trotzdem nützlich als Stichprobe, ob eine
Änderung nur dort auftaucht, wo sie hingehört (und nicht versehentlich noch
woanders) — nicht mehr als Nachweis "nichts hat sich verändert". Funktional
(`qa/p6_qa.js`) weiterhin grün, P2 unberührt.

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
