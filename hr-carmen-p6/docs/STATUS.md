# Status — Carmen Next Motor/Config

## P2 — Slide-Reihenfolge angepasst + alle Überschriften/Unterüberschriften zentriert (v5)

Zwei Änderungen auf Wunsch:

1. **Slide-Reihenfolge:** „FÜR WEN" (vorher Slide 4) steht jetzt direkt nach
   der Willkommens-Slide auf Slide 2. Der Hero („INTEGRATION & PROBEZEIT.")
   und „SO FUNKTIONIERT'S" rutschen dafür von 2/3 auf 3/4 — reine
   Positionstausch, Slides 5 (System) und 6 (Mitarbeiter) unverändert.
   Gesamtzahl bleibt bei 44 Slides.
2. **Jede Überschrift + ihre Unterüberschrift zentriert, produktweit:**
   Neue, generische Motor-Regel in `motor/engine.css`:
   `#app[data-product="p2"] h1` sowie `#app[data-product="p2"] h1 + .lead`
   (nur `.lead`-Elemente, die **direkt** auf ein `h1` folgen — also echte
   Unterüberschriften). Dafür bekommt `#app` in `build/build.js` jetzt
   generisch `data-product="<id>"` (z. B. `p2`/`p6`) — eine reine
   Infrastruktur-Erweiterung ohne Effekt, solange keine CSS-Regel darauf
   reagiert.

   Bewusst **nicht** per Klasse à la `.textCenter` gelöst (das würde auch
   Grids/Boxen/Kacheln zentrieren) und bewusst **nicht** jedes `.lead`
   überall zentriert: Auf den funktionalen Slides (Meilensteine, Buddy,
   Eskalation, Trennung) taucht `.lead` auch verschachtelt in `.box`-Kästen
   auf (z. B. das zitierte Gesprächsziel) — genau diese bleiben unangetastet
   links, weil sie kein direktes Geschwisterelement von `h1` sind. Nur die
   Überschrift selbst und ein echtes „subheading" direkt darunter zentrieren
   sich; Checklisten, Textfelder, Tabellen und Kacheln bleiben unverändert
   linksbündig nutzbar.

   Betrifft ausschließlich P2 (`[data-product="p2"]`-Selektor) — P6 bekommt
   zwar ebenfalls das neue `data-product`-Attribut (harmlos, da keine
   passende CSS-Regel dafür existiert), bleibt aber optisch unverändert.

`qa/p2_qa.js` erweitert: neue Assertions für die verschobene Slide-
Reihenfolge, für zentrierte Hero-Überschrift/-Unterüberschrift, für
zentrierte Überschrift auf einer funktionalen Slide ohne dass die
Checkliste mitzentriert wird, und dass ein `.lead` innerhalb einer `.box`
explizit **nicht** zentriert wird — alle grün. `qa/p6_qa.js` (93 Checks)
und `qa/p6_diff.js` unverändert grün bzw. identisch zum Stand davor.

---

## P2 — Willkommens-Slide auf das gemeinsame P6-Template umgestellt (v4)

Parallel zu dieser P2-Fassung wurde auf `claude/hr-p6-app-s38hm7` unabhängig
eine eigene Willkommens-Slide für P6 gebaut — mit eigenen, saubereren
Motor-Klassen (`.textCenter`, `.videoPlaceholder`/`.playIcon`,
`.pitchSection`/`.pitchHook`/`.pitchTile`). Martin hat den P6-Screenshot als
verbindliche Vorlage für **Design/Aufbau** vorgegeben (nicht Inhalt). Dieser
Durchgang:

1. Hat die inzwischen divergierten Motor-Änderungen beider Branches gemerged
   (P6 hatte in der Zwischenzeit eigene `.videoPlaceholder`/`.wave`-Klassen
   sowie eine eigene Willkommens-Slide bekommen — P6 ist jetzt 52 statt 51
   Slides).
2. Hat P2s zuvor selbst gebaute, abweichende `.videoPlaceholder`/
   `.videoPlaceholderInner`/`.videoPlaceholderIcon`-Klassen aus
   `motor/engine.css` **entfernt** (waren nach dem Merge doppelt vorhanden,
   Selektor-Kollision mit P6s Version) und durch die eine gemeinsame,
   kanonische Version ersetzt — jetzt nutzen P2 und P6 exakt dieselben
   Motor-Klassen für dieses Muster, keine Duplikate mehr.
3. Hat P2s Willkommens-Slide inhaltlich unverändert gelassen (Hook-Satz,
   Problem-/Lösung-Text bleiben P2-spezifisch), aber strukturell auf das
   P6-Muster umgestellt: `.textCenter` auf der Section statt Inline-Styles,
   `.pitchSection` als umschließender Kasten um Hook + zwei `.pitchTile`-
   Kacheln ("DAS PROBLEM." / "DIE LÖSUNG." — mit Labels, wie bei P6, anders
   als die vorherige P2-Zwischenfassung ohne Labels), Video-Platzhalter mit
   rundem `.playIcon` statt eigenem Icon-Stil, Button-Beschriftung "Weiter"
   statt "Los geht's" (Konsistenz mit P6).

`qa/p2_qa.js` entsprechend angepasst (prüft jetzt `.textCenter`,
`.pitchSection`, `.pitchHook`, 2× `.pitchTile`, `.playIcon`) — alle Checks
grün. `qa/p6_qa.js` (93 Checks) und `qa/p6_diff.js` weiterhin grün bzw.
erwartungsgemäß (P6 hat jetzt 52 statt 51 Slides, Diff zeigt entsprechend
mehr Abweichungen zur alten Referenz — dokumentiert bereits im P6-Eintrag
weiter unten als neuer Normalzustand).

---

## P2 — Neue Willkommens-Slide vor Slide 1 (v3)

Auf Wunsch eine neue Slide 1 „WILLKOMMEN" vor die bisherige erste Slide gesetzt
— alle 43 folgenden Slides rücken um eins nach hinten (Produkt hat jetzt 44
Slides statt 43). Aufbau der neuen Slide: Willkommenstext, darunter ein
Video-Platzhalter im Format 9:16 (gestrichelter Rahmen, Play-Icon, Hinweistext
„VIDEO FOLGT" — kein echtes eingebettetes Video, weil das Endprodukt laut
CLAUDE.md eine einzelne Offline-HTML-Datei ohne externe Abhängigkeiten bleiben
muss; Carmen fügt ihr eigenes Video später selbst ein), darunter drei Kacheln
Hook/Problem/Lösung als kurze Produkt-Einordnung.

**Kein echtes GIF eingebaut** (angeboten, aber bewusst anders gelöst): ein
extern geladenes GIF wäre eine externe Abhängigkeit und hätte den
Offline-Anspruch des Produkts verletzt. Stattdessen ein rein CSS-basiertes,
selbst gebautes Wink-Icon (👋 mit `@keyframes wave`-Animation) für die lockere
Note — kein zusätzliches Asset, keine Abhängigkeit.

**Motor nur generisch erweitert:** `motor/engine.css` bekam die neuen,
produktunabhängigen Klassen `.videoPlaceholder`/`.videoPlaceholderInner`/
`.videoPlaceholderIcon` sowie `.wave`/`@keyframes wave` rein additiv dazu
(nichts Bestehendes verändert) — damit könnte z. B. auch P6 später eine
eigene Willkommens-Slide im gleichen Stil bekommen. `qa/p6_qa.js` und
`qa/p6_diff.js` bleiben unverändert grün, da P6 diese neuen Klassen nicht
nutzt.

**Slide-Nummern verschoben:** `FIRST_MILESTONE_SLIDE` 7→8,
`BUDDY_FIRST_SLIDE` 27→28, `ESKALATION_FIRST_SLIDE` 32→33,
`TRENNUNG_FIRST_SLIDE` 37→38, `TEAMBERICHT_SLIDE` 42→43, Outro-Slide 43→44.
`qa/p2_qa.js` komplett auf die neue Nummerierung angepasst plus neue
Assertions für die Willkommens-Slide (Video-Platzhalter, drei Hook/Problem/
Lösung-Kacheln) — alle grün.

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

## P6 — Willkommens-Slide: Pitch-Bereich dominanter, gesamte Slide zentriert

Feedback zur neuen Slide 1: der Hook-Satz und die beiden Kacheln
("DAS PROBLEM." / "DIE LÖSUNG.") sollten deutlich mehr Gewicht bekommen,
und der gesamte Slide-Text sollte zentriert sein statt linksbündig.

Umgesetzt in `motor/engine.css` (generisch, für alle Produkte nutzbar):
- `.textCenter` — zentriert Überschrift, Lead-Text, Grids/Boxen und deren
  Inhalte; auf die `<section class="slide">` von Slide 1 gesetzt.
- `.pitchSection` — neuer umschließender Kasten (eigener Hintergrund-Ton,
  Rahmen, großzügiges Padding) um Hook-Satz + Problem/Lösung-Kacheln, damit
  dieser Block sich sichtbar vom Rest der Slide absetzt.
- `.pitchTile` — Kacheln jetzt mit weißer Fläche, farbigem Top-Rahmen,
  leichtem Schatten und größerer Überschrift (23px, in Akzentfarbe) statt
  der neutralen Standard-`.tile`-Optik.

Nur Slide 1 in `products/p6/intro.slides.html` nutzt die neuen Klassen;
P2 und die übrigen P6-Slides sind unverändert. `qa/p6_qa.js` (93 Checks)
und `qa/p2_qa.js` laufen weiterhin vollständig grün, 0 Konsolen-/Seitenfehler.

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

---

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
