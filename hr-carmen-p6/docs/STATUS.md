# Status — Carmen Next Motor/Config

## P2 — Umstieg auf den Carmen-Klar-Motor, 48 Slides (v4)

Parallel zu diesem P2-Durchgang ist auf einer anderen Branch
(`claude/hr-p6-app-s38hm7`) ein eigener Motor-Ausbau entstanden und als
`docs/CARMEN_KLAR_STYLEGUIDE.md` dokumentiert worden ("Carmen Klar" —
Design-/Sprachsystem für die ganze P1–P8-Familie). Martin bat darum, P2
selbst auf diesen Motor umzustellen — **ausdrücklich ohne P6-Inhalte zu
importieren**, nur den Motor plus die im Styleguide beschriebenen
Bausteine.

**Vorgehen:** `motor/engine.css`, `motor/engine.js` und den Styleguide
selbst von der anderen Branch per `git checkout <branch> -- <pfade>`
übernommen — P6s Config/Slides/Release blieben unangetastet, das ist
weiterhin der eigene Stand dieser Branch. Vor der Übernahme den CSS-/JS-Diff
geprüft: rein additiv (Farben durch CSS-Variablen ersetzt, die auf dieselben
Werte zeigen; neue Klassen/Funktionen kommen dazu, nichts wurde entfernt
oder umbenannt) — deshalb ohne Risiko für P6 oder den bisherigen P2-Stand.
Nach der Übernahme beide Produkte neu gebaut und geprüft, bevor an P2
weitergearbeitet wurde: `p6_qa.js` grün, `p6_diff.js` weiterhin "NO TEXT
DIFFERENCES", `p2_qa.js` (alter Stand) ebenfalls grün — der Motor-Tausch
allein hat an keinem der beiden Produkte etwas verändert.

**Was aus dem Styleguide für P2 übernommen wurde:**
- **Farbmodell-Umschaltung:** `MotorEngine.createColorThemes(...)` mit
  eigenem `p2_theme_v1`-Speicherschlüssel (unabhängig von P6s
  `p6_theme_v1`), 🎨-Button + Auswahl-Modal am Ende von `outro.slides.html`
  (einmalig, nicht pro Slide).
- **Willkommens-Slide neu aufgebaut** (Slide 1, `textCenter`): Video-
  Platzhalter + Pitch-Bereich (Problem/Lösung) statt der bisherigen reinen
  Feature-Kachel-Liste. Der Pitch-Text ist von Carmen Next verfasst (Werbe-
  copy, nicht aus dem PDF) — die Feature-Kacheln und der Ersteller-Hinweis
  aus der alten Slide 1 sind auf Slide 4 ("Die fünf Module") umgezogen.
  Zweiter Video-Platzhalter auf der Mitarbeitenden-Slide (5), analog P6.
- **Zusammenfassung & PDF pro Mitarbeiter** (neue Slide 47, zwischen Team-
  Bericht und Abschluss): fasst alle bisher dokumentierten Stationen eines
  Mitarbeiters zusammen (4 Meilensteine + Buddy + Eskalation + Trennung),
  zeigt nur tatsächlich ausgefüllte Abschnitte, druckbar. Eigene
  `SECTION_META`-Struktur in `p2.config.js` (parallel zur bestehenden
  `CARD_META` fürs Team-Bericht, die unverändert blieb). Erreichbar über
  Schnellzugriffs-Buttons auf der Mitarbeitenden-Slide und dem Team-Bericht.
- **Kein automatisches Durchrutschen:** Die vier Meilenstein-Follow-ups
  sowie die letzten Seiten von Buddy/Eskalation/Trennung enden jetzt in
  einem Entscheidungsmenü (Kacheln: nächste Station / Zusammenfassung &
  PDF / Mitarbeiterwahl bzw. Übersicht) statt in einem einzelnen "Weiter"-
  Button, der automatisch zur nächsten Station springt.
- **`.headCenter`/`.textCenter`** ersetzen die bisherige eigene
  Zentrierungs-Regel (globales `#app h1,h2{text-align:center}` aus
  `extraCss`) — jetzt wie in P6 pro Slide über eine Klasse gesteuert, für
  Konsistenz in der Produktfamilie.
- **"Als Nächstes"-Hinweis vereinheitlicht:** Frühere eigene Fassung zeigte
  ihn (als eigene CSS-Box) auf 46 von 47 Slides. Auf Styleguide-Konvention
  umgestellt: schlichter rechtsbündiger Text, nur an den großen
  Abschnittswechseln (Übersicht→Tag 30, jedes Meilenstein-Ende, Buddy→
  Eskalation, Eskalation→Trennung, Trennung→Team-Bericht, Team-Bericht→
  Zusammenfassung) — nicht mehr bei jedem einzelnen Klick.

**`extraCss` (P2-eigen, nicht Teil des Motors) reduziert** auf das, was
wirklich P2-spezifisch bleibt: Kopfzeilen-Gewicht/-Schatten für mehr
"Tiefe" und den Box-Schatten für die Karten — beides aus einer früheren
Runde, unverändert übernommen.

**Neue Gesamtlänge:** 48 Slides (vorher 47) — die neue Zusammenfassung-
Slide kommt dazu, alles andere bleibt an seiner Position.

**QA:** `qa/p2_qa.js` erweitert um: Video-Platzhalter auf der Willkommens-
Slide, Farbmodell-Wechsel (Hintergrund-Repaint + Persistenz nach Reload),
Zusammenfassung zeigt nur die Daten des aktiven Mitarbeiters (keine
Vermischung), Entscheidungsmenüs statt Einzel-Weiter-Button an den
7 betroffenen Stellen, Druckausgabe zeigt genau eine sichtbare Slide (nicht
alle gestapelt). Die sequentielle Navigationsprüfung folgt jetzt an den
7 Entscheidungsmenü-Slides der ersten Kachel statt eines "Weiter"-Buttons.
Alle Checks grün, 0 Konsolen-/Seitenfehler. `p6_qa.js`/`p6_diff.js`
weiterhin grün bzw. "NO TEXT DIFFERENCES" — P6 durch diesen ganzen
Durchgang kein einziges Mal angefasst.

---

## P2 — Verständlichkeits-Durchgang: erklärte Boxen, Feld-Hinweise, 47 Slides (v3)

Martin fand nach der v2-Fassung (43 Slides, 5 Unterseiten je Station) einzelne
Abschnitte immer noch zu knapp/abgehakt für ein 49€-Produkt — im direkten
Review von Tag 30, Seite für Seite. Dieser Durchgang macht die Fassung
durchgängig verständlicher, ohne den Stoff zu ändern:

- **"Phase" → "Gesprächsphase"** in den Meilenstein-Labels (Vorbereitung),
  wo es um die aktuelle 30/60/90/150-Etappe des Gesprächs ging, nicht um die
  Übersichts-Phasen (die behalten "Phase", weil dort korrekt).
- **Jede vorher stichwortartige Box bekommt eine erklärende Einleitung**,
  bevor der eigentliche Wert kommt (Fokus-Box, Buddy-Taktung-Box,
  Checklisten-Intro, Bewertungsbereiche-Intro bei Tag 90) — Prinzip: erst
  sagen, was das ist und wofür es gut ist, dann den Wert selbst.
- **Jedes Eingabefeld** (alle Produkte-weiten `weeklyCheckCard`-Felder) kann
  jetzt eine eigene Hinweiszeile tragen (`fieldsGrid()` akzeptiert optional
  ein 4. Array-Element je Feld); **jeder Checklisten-Punkt** kann ebenso eine
  Hinweiszeile tragen (`checksList()` akzeptiert `[label, hint]` statt nur
  `label`) — beides rückwärtskompatibel, wirkt sich nicht auf P6 aus, das
  weiterhin nur reine Strings übergibt. Durchgängig befüllt für alle 4
  Meilensteine + Buddy + Eskalation + Trennung, außer bei den drei
  Abschluss-Checklisten (Buddy-Checkliste, Eskalations-Checkliste,
  Trennungs-Checkliste) — die fassen bereits erklärten Stoff zusammen, dort
  reicht ein Intro-Satz statt 10–13 Einzel-Hinweisen.
- **"Im Gespräch" (3/5) in zwei eigene Seiten gesplittet**: "Typische
  Reaktionen" (nur die Q&A-Blöcke) und "Besser sagen" (nur die
  Vergleichstabelle) — vorher beides auf einer Seite. Grund: eine Seite pro
  Thema statt zwei Themen auf einer Seite; eine Seite pro einzelner Reaktion
  wäre zu dünn geworden (kurz erwogen, verworfen). Damit wächst jeder
  Meilenstein von 5 auf **6 Unterseiten** (Vorbereitung / Ziel & Einstieg /
  Typische Reaktionen / Besser sagen / Vereinbarung / Follow-up).
- **Neue zweizeilige Meilenstein-Überschrift**: "TAG 30." / "GESPRÄCHSPHASE
  „CHECK-IN“." statt der bisherigen 1:1-Wiederholung der Brotkrümel-Zeile
  ("TAG 30 – CHECK-IN"). Automatisch für alle 4 Meilensteine aus dem
  vorhandenen Titel abgeleitet (`milestoneHeadline()`, Split am " – " statt
  am bloßen Gedankenstrich — wichtig, weil "Tag 150–170" selbst einen
  Gedankenstrich ohne Leerzeichen enthält). Bei Tag 150–170 entsteht dadurch
  eine leichte Dopplung ("Gesprächsphase „Probezeit-Abschlussgespräch"")),
  weil der Name selbst schon "-gespräch" enthält — mit Martin abgesprochen,
  bewusst so belassen.
- **Buddy-Framework bekommt eine eigene Überschrift pro Unterseite** (z. B.
  "BUDDY-FRAMEWORK. WER IST DER BUDDY?") statt der bisherigen 5-fach
  identischen "KMU-BUDDY-FRAMEWORK." — zieht damit mit Eskalationsprotokoll
  und Trennungs-Leitfaden gleich, die schon vorher pro Seite unterschiedliche
  Überschriften hatten.
- **Trennungs-Leitfaden, Schritt 3 "Sachlicher Übergang"**: war eine
  statische Aufzählung (4 Punkte, nicht anklickbar) — jetzt eine anklickbare
  Checkliste wie der Rest des Produkts, weil die vier Punkte tatsächlich
  während des Gesprächs abgehakt werden sollen.
- **Ein echter Bug gefunden und behoben**: Die Buddy-Taktung-Box auf der
  Vorbereitungs-Seite (Tag 30/60/90) las `m.buddyTaktung` — dieses Feld gibt
  es auf dem Meilenstein-Objekt gar nicht, der Wert liegt auf
  `data.phases[i]`. Die Box war dadurch in der v2-Fassung leer (unbemerkt,
  weil ohne Erklärtext kaum auffiel). Jetzt wird die passende Phase an die
  Slide-Funktion durchgereicht.

**Struktur-Entscheidung Buddy/Eskalation/Trennung (mein Vorschlag, mit
Martin abgestimmt):** Die bestehende 5-Unterseiten-Aufteilung je Werkzeug
bleibt, weil der Stoff sich schon vorher sauber in 5 Stationen trennte
(Buddy: Rolle/Dauer/Aufgaben/Grenzen/Vorlage; Eskalation und Trennung:
ihre eigenen Schritt-Folgen). Keine neue Struktur nötig — "vollwertige
Station" wurde stattdessen durch den gleichen Erklär-Durchgang wie bei den
Meilensteinen erreicht, nicht durch ein anderes Slide-Muster.

**Neue Gesamtlänge:** 47 Slides (vorher 43): 4 Meilensteine × 6 (+4) +
Buddy/Eskalation/Trennung × 5 (unverändert) + Übersicht/Team-Bericht/
Intro/Outro (unverändert).

**Alle neuen Erklärungen und Feld-Hinweise sind von Carmen Next verfasst,
nicht aus dem PDF übernommen** — gleicher Umgang wie beim "Lob"-Sonderfall
bei P6 und den "Reaktionen"/"Besser sagen"-Inhalten aus v2: inhaltlich
sachlich an das jeweilige Thema angelehnt, aber zusätzlich, nicht aus dem
Fachwissen-Archiv extrahiert. Im ausgelieferten Produkt nicht gekennzeichnet
(würde eher verunsichern), hier dokumentiert.

**Motor:** `motor/engine.js`/`.css` weiterhin komplett unverändert (Diff
gegen den Stand vor diesem Durchgang: keine Änderung). P6 bleibt davon
unberührt — `qa/p6_qa.js` grün, `qa/p6_diff.js` weiterhin "NO TEXT
DIFFERENCES ACROSS ALL SLIDES".

**QA:** `qa/p2_qa.js` komplett auf 47 Slides umgestellt (Slide-Nummern über
dieselben Formeln wie in `products/p2.config.js` hergeleitet, nicht mehr
hart codiert) und um neue Assertions erweitert: Meilenstein-Überschrift
nennt die Gesprächsphase, Feld- und Checklisten-Hinweise sind vorhanden,
"Typische Reaktionen"/"Besser sagen" sind sauber getrennt (keine Vermischung
der beiden vorherigen Inhalte), Buddy-Überschriften unterscheiden sich pro
Unterseite, Trennungs-Schritt-3-Liste ist jetzt anklickbar. Alle Checks
grün, keine Konsolen-/Seitenfehler.

---

## P2 — Onboarding-Prozessbundle, Ausbau auf 5 Unterseiten je Station (v2)

Martin fand die erste P2-Fassung (16 Slides, 1 Slide je Meilenstein) zu dünn
für ein 49€-Produkt. Dieser Durchgang baut sie auf **43 Slides** aus: Jede der
4 Meilenstein-Stationen (Tag 30/60/90/150–170) sowie Buddy-Framework,
Eskalationsprotokoll und Trennungs-Leitfaden bekommen je **5 Unterseiten**,
analog zu P6s Muster (ein Thema pro Seite, kurz und klar statt vollgestopft).
Motor (`motor/engine.js`/`.css`) blieb dabei erneut **unverändert** — nur ein
kleiner, generischer Helfer (`toggleYesNo`) kam lokal in `p2.config.js` dazu,
für das Ja/Nein-Feld der Lernkurven-Prüfung; er nutzt ausschließlich die
bereits vorhandene generische Choice-Toggle-Logik des Motors.

**Wie die 5 Unterseiten gefüllt sind:**
- **Buddy-Framework, Eskalationsprotokoll, Trennungs-Leitfaden:** vollständig
  aus dem PDF (Rolle/Dauer/Aufgaben/Grenzen/Checkliste bzw. die 3 Eskalations-
  Schritte + Checkliste bzw. die 3 Trennungs-Schritte + Checkliste). Keine
  Zeile erfunden — nur sauberer auf 5 Seiten verteilt statt wie vorher auf
  1–2 Seiten zusammengedrängt. Neu ins JSON übernommen (vorher nicht
  extrahiert): die vollständige Buddy-Checkliste (13 Punkte, PDF-Abschnitt
  10.2), die vollständige Eskalations-Checkliste (10 Punkte, Abschnitt 10.3)
  und das Ja/Nein-Feld „Sichtbare Verbesserung innerhalb von 14 Tagen"
  (Abschnitt 12, Arbeitsvorlage).
- **Die 4 Meilenstein-Gespräche:** Vorbereitung (Kontext + Checkliste je
  Phase aus dem Probezeit-Radar, Abschnitt 10.1), Ziel & Einstieg (Frage/
  Zweck/Ziel, bei Tag 90 zusätzlich die vier Bewertungsbereiche), **Im
  Gespräch**, Vereinbarung/Dokumentation (die Original-Arbeitsfelder) und
  Follow-up (Gesprächsfolge-Haken aus Abschnitt 10.4 + Vorschau auf die
  nächste Phase).

**Transparente Lücke — mit Martin geklärt, nicht eigenmächtig entschieden:**
Anders als P6 ist das P2-Quell-PDF ein reines Prozess-/Checklisten-Dokument
ohne Gesprächsskripte. Für die Seite „Im Gespräch" (typische Mitarbeiter-
Reaktionen + „Nicht sagen/besser sagen"-Vergleichstabelle je Meilenstein)
gab das PDF keinen Stoff her. Auf Nachfrage hat Martin sich für die Option
entschieden, die auch beim P6-Sonderfall Karte 8 „Lob und Anerkennung" schon
angewendet wurde: Diese vier Seiten (eine je Meilenstein) hat Carmen Next
selbst geschrieben, passend zum jeweiligen Gesprächsthema und in Carmens
sachlichem Ton, aber **nicht** aus dem Original-Fachwissen-Archiv extrahiert.
Wie bei „Lob" ist das im ausgelieferten Produkt nicht sichtbar gekennzeichnet
(würde bei einem verkauften Produkt eher verunsichern), sondern hier
dokumentiert: betroffen sind ausschließlich `reaktionen` und `compare` in
`content/cards_p2.json` für alle vier Meilensteine (Tag 30/60/90/150–170).
Alle anderen neuen Inhalte in dieser Fassung sind wörtlich bzw. sachlich
unverändert aus dem PDF.

**localStorage-Version angehoben:** `p2_data_v1` → `p2_data_v2`, weil sich
Feld-IDs und Slide-Nummern strukturell geändert haben (analog zu P6s eigenem
`p6_data_v2`) — alte gespeicherte Testdaten aus der v1-Fassung werden beim
nächsten Laden verworfen, das betrifft aber nur lokale Entwicklungsstände,
nicht ausgelieferte Käuferdaten (Produkt war noch nicht im Verkauf).

**QA:** `qa/p2_qa.js` komplett erweitert (43 statt 16 Slides sequentiell
geprüft, neue Assertions für Checklisten-Längen je Station, Reaktionen/
Vergleichstabelle, Ja/Nein-Exklusivität, Follow-up-Vorschau der nächsten
Phase, Übersicht-Verlinkung auf die richtige erste Unterseite) — alle grün.
`qa/p6_qa.js` und `qa/p6_diff.js` bleiben unverändert grün (P6 wurde nicht
angefasst, siehe Diff-Ergebnis „NO TEXT DIFFERENCES ACROSS ALL SLIDES").
Nebenbei in beiden P6-QA-Skripten sowie `p2_qa.js` den Playwright-
`executablePath` an den in dieser Umgebung tatsächlich vorhandenen Chromium-
Pfad (`/opt/pw-browsers/chromium`) angepasst — reine Tooling-Korrektur ohne
Auswirkung auf die Produkte selbst.

---

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
