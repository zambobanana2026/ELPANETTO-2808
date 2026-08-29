# Carmen Next — HR-Produktwelt für KMU

## Kontext (bitte vollständig lesen, bevor du loslegst)

Martin baut für seine Schwester **Carmen Gruse-Lategahn** (HR-Generalistin, 18 Jahre Praxiserfahrung) eine digitale
Produktwelt: interaktive HTML-Tools für Führungskräfte in deutschen KMU (5–50 Mitarbeitende, meist ohne eigene
HR-Abteilung). Carmen wird ab 1.1.2027 arbeitssuchend und soll sich damit ein Online-Einkommen aufbauen
(Verkauf über eine Landingpage, Bewerbung über Instagram/LinkedIn, Auslieferung als herunterladbare
Einzeldatei-HTML-Produkte, z. B. über Digistore24).

Die Produktfamilie heißt **P1–P8**:

| # | Titel | Thema | Status |
|---|---|---|---|
| P1 | Onboarding-Startpaket (Beispiel: Bankkaufmann/-frau) | 4-Wochen-Onboarding mit Kompetenz-Ampel | **Fertig, ist die CI-/UX-Referenz** |
| P2 | Onboarding-Prozessbundle | Tag 1–180, Probezeit, 30-60-90 | Nur als PDF/Word vorhanden, noch nicht interaktiv gebaut |
| P3 | Onboarding Mini-Kurs / „Neue Mitarbeitende richtig führen" | — | Nur als PDF/Word vorhanden |
| P4 | Onboarding → Leistung | — | Nur als PDF/Word vorhanden |
| P5 | Mitarbeiterentwicklung als Führungssystem | — | Nur als PDF/Word vorhanden |
| P6 | Schwierige Mitarbeitergespräche | 8 Gesprächskarten-Toolbox | **Prototyp fertig (V3, 51 Slides), siehe unten** |
| P7 | Vereinbaren. Nachhalten. Entscheiden. | Fallmanagement | Existiert bereits als **eigene** Full-Stack-Web-App (React, nicht Teil dieses Motors) |
| P8 | Krankmeldungs- & Fehlzeiten-Management | — | Nur als PDF/Word vorhanden |

## Die zentrale Architektur-Entscheidung

P1 (die Referenzdatei, liegt bei als `reference/P1_Bankwesen_V1.html`) ist selbst schon nach einem
**Motor + Config**-Prinzip gebaut: Ein wiederverwendbarer "Motor" (Navigation, Speicherung, Bewertungslogik,
CSS-Designsystem) plus ein austauschbarer `JOB_CONFIG`-Block mit den eigentlichen Inhalten. Für andere
Berufe wird laut Kommentar im Code **nur** der Config-Block ausgetauscht — der Motor bleibt gleich.

**Deine Aufgabe:** Dieses Prinzip sauber auf die ganze Produktfamilie ausweiten, statt (wie bisher im Chat
notgedrungen passiert) für jedes Produkt eine komplette, in sich geschlossene ~2000-Zeilen-HTML-Datei von
Grund auf neu zu bauen und Code zu duplizieren.

Empfohlene Struktur:
```
/motor/
  engine.css       -- geteiltes Design-System (Farben, Typografie, Karten, Buttons, responsive Regeln)
  engine.js         -- geteilte Logik: Slide-Navigation, localStorage, Mitarbeiterverwaltung, Report-Generierung
/products/
  p1.config.js      -- P1-Inhalte (Wochen-/Kompetenz-Struktur)
  p6.config.js       -- P6-Inhalte (Situations-/Karten-Struktur, siehe cards_p6.json)
  ...
/build/
  build.js          -- fügt motor + config zu einer einzigen, autarken HTML-Datei pro Produkt zusammen
                        (Endprodukt MUSS eine einzelne HTML-Datei ohne externe Abhängigkeiten sein —
                        Käufer laden eine Datei herunter und öffnen sie offline im Browser)
/dist/
  P1_....html, P6_....html   -- fertige Auslieferungsdateien
```

Wichtig: **P1 und P6 haben unterschiedliche Interaktions-Muster** (P1 = wochenbasierter Ampel-Zyklus,
P6 = situative Karten-Auswahl). Der Motor muss beide Muster unterstützen können, oder zumindest so
modular sein, dass beide Muster ihre eigene Navigationslogik einklinken können, ohne CSS/Storage/
Mitarbeiterverwaltung zu duplizieren.

## Bereits etablierte, bewährte Patterns (bitte übernehmen)

- **CI/Design-Tokens** (aus P1, exakt beibehalten):
  `--ink:#252525; --paper:#f6f4f0; --line:#d9d5cf; --mint:#8fe3cf; --ci:#7f7a74; --green:#16a36a; --orange:#ef9b28; --red:#df4545`
  Schrift: Arial/Helvetica, große fette Headlines mit negativem Letter-Spacing, mintgrüne Seitenzahl oben rechts
  (`.num`), dünne graue Brand-Zeile oben links (`.brand`).
- **Mitarbeiterverwaltung mit Lizenzgrenze:** `const P_LICENSE = { maxEmployees: 20 };` — eine einzige Zahl,
  die für andere Preistarife ausgetauscht wird (nicht mehr Logik ändern). P6 nutzt das bereits: Mitarbeitende
  anlegen (Modal), per Klick als "aktiv" markieren, Felder werden pro Mitarbeiter-ID in einem
  `byEmployee[employeeId].fields[fieldId]`-Objekt in localStorage gespeichert, damit Daten verschiedener
  Personen sich nicht vermischen.
- **Kein Preis im Code.** Preise sind eine Landingpage-Entscheidung, nicht Teil des Produkts.
- **Slide-Granularität:** Nicht alles auf eine Slide packen. P1 splittet z. B. jede Woche in Phase/Bewertung/
  Auswertung. P6 splittet jede Gesprächskarte in 5 Unterseiten (Vorbereitung / Ziel & Einstieg / Im Gespräch /
  Vereinbarung / Follow-up). Lieber mehr, kurze Slides als wenige, vollgestopfte.
- **Rechtlicher Hinweis:** Jedes Produkt braucht einen sichtbaren Hinweis, dass es keine individuelle
  Rechtsberatung ersetzt (siehe P6 Slide 3 als Vorlage).
- **Bekannter Bug, den du vermeiden solltest:** Beim dynamischen Erzeugen von `onclick="..."`-Attributen in
  JS-Strings NICHT mit `\'` escapen (führt in Bash-Heredocs/verschachtelten Strings leicht zu doppeltem
  Escaping und bricht das Script). Stattdessen HTML-Entities nutzen: `onclick="removeEmployee(&quot;`+id+`&quot;, event)"`.
- **Mobile:** Fixe Navigation unten (`position:fixed`), dafür `.slide { padding-bottom: 110px }` und
  `.nav { background: var(--paper) }` (nicht transparent, sonst Bleed-Through-Effekt).
- **Print/PDF-Export:** einfacher `window.print()`-Button plus `@media print`-Regel, die alle Slides
  sichtbar macht und Navigation/Zahlen ausblendet.

## P6 — bereits fertiger Prototyp (als Referenz UND als Ziel-Output)

`reference/P6_V3.html` ist die aktuell beste Version (51 Slides, 8 Gesprächskarten inkl. einer von mir
neu geschriebenen Karte 8 "Lob und Anerkennung" — im Original fehlte dieses Thema komplett). Die
strukturierten Karten-Inhalte liegen zusätzlich maschinenlesbar bei: `content/cards_p6.json`
(Felder: title, checks, hinweis, prep, ziel, satz, fragen, reaktionen, compare, beispiel, achtung,
rechtshinweis — je Karte).

**Migrations-Aufgabe für P6:** Diesen Prototyp in die Motor/Config-Architektur überführen, ohne
Funktionalität zu verlieren. Vorher/Nachher mit Playwright testen (siehe unten).

## Inhalts-Rohdaten für P2–P5, P8

Liegen als ZIPs bei unter `source/` (Originalnamen beibehalten). Enthalten PDFs (Haupt-Dokument,
Schnellstart, Gesprächskarten/Arbeitsvorlagen, Nutzungshinweise) und teils Word-Dateien. Diese sind
**noch nicht extrahiert** — das ist ein anstehender Arbeitsschritt pro Produkt, analog zum P6-Vorgehen:
`pdftotext` je Datei, Inhalte in eine strukturierte JSON überführen, dann gegen den Motor mappen.

**Wichtig bei der Inhaltsübernahme:** Immer den echten, extrahierten Text verwenden, nichts erfinden.
Bei P6 wurde zusätzlich eine Lücke gefunden (Thema "Lob" fehlte im Original) und von mir ergänzt — das ist
ein Sonderfall, in solchen Fällen transparent machen, was ergänzt statt extrahiert wurde.

## P7 — Sonderfall

P7 ("Vereinbaren. Nachhalten. Entscheiden.") existiert bereits als eigene Full-Stack-Web-App
(liegt bei unter `source/P7.../p7-app/`, gebaut mit einem Manus-Template, React + Backend + DB).
Das ist **kein** Kandidat für den statischen HTML-Motor. Zwei denkbare Optionen, mit Martin klären:
(a) nur CSS/Farben angleichen, Architektur separat lassen, oder (b) langfristig auch auf den
Motor migrieren. Nicht eigenmächtig entscheiden.

Achtung: P7 speichert echte Mitarbeiter-Falldaten → DSGVO-Relevanz (Hosting, AVV, TOMs). Das ist
ein rechtliches Thema, kein Code-Thema — nicht versuchen, das selbst zu lösen, nur im Hinterkopf behalten
und bei Bedarf ansprechen.

## Offene Entscheidungen / bitte mit Martin klären, nicht annehmen

1. Reihenfolge: Erst P6 auf die neue Architektur migrieren (Beweis, dass der Motor funktioniert),
   dann P2–P5 und P8 neu bauen? Oder anders herum?
2. Sollen P2–P5/P8 auch eine Mitarbeiterverwaltung mit Lizenzgrenze bekommen (wie P6), oder macht das
   nur bei P6 Sinn?
3. Build-Tooling: reines Node-Script ohne Framework reicht vermutlich (Motor ist bewusst
   abhängigkeitsfrei/vanilla JS gehalten, damit die Endprodukte als Einzeldatei ohne Build-Schritt beim
   Käufer funktionieren) — aber das ist Martins Entscheidung, falls er Präferenzen hat.

## Qualitätssicherung

Jede fertige Produkt-HTML sollte vor Übergabe an Martin mit Playwright getestet werden:
- Mehrere Mitarbeitende anlegen, Felder befüllen, Datentrennung prüfen
- Lizenzgrenze (20) korrekt durchsetzen
- Reload → Daten bleiben erhalten (localStorage)
- Navigation zwischen allen Slides funktioniert, letzte Slide einer Sektion leitet korrekt weiter
- Mobile-Ansicht (390×844) prüfen, besonders die fixe Navigation
- Konsole/Page-Errors müssen leer sein
