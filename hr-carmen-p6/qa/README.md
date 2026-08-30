# QA-Skripte

Playwright-Tests gegen die gebauten `release/*.html`-Dateien. Vor dem Ausführen
`node build/build.js <id>` laufen lassen, damit `release/` aktuell ist.

```bash
node qa/p6_qa.js     # P6: Mitarbeiter-CRUD, Datentrennung, Lizenzgrenze, Reload,
                      # Navigation über alle 51 Slides, Team-Bericht, Mobile
node qa/p6_diff.js   # P6: automatisierter Textvergleich jeder Slide gegen
                      # reference/P6_V3.html (muss "NO TEXT DIFFERENCES" melden)
node qa/p2_qa.js      # P2: dasselbe Testschema wie p6_qa.js, für 43 Slides
```

Falls `playwright` nicht als lokales Modul auflösbar ist (z. B. weil nur
global installiert), mit `NODE_PATH` auf den globalen node_modules-Pfad
zeigen, z. B.:

```bash
NODE_PATH=/opt/node22/lib/node_modules node qa/p6_qa.js
```

Für ein neues Produkt (P3 etc.) `qa/p2_qa.js` als Vorlage kopieren und die
slide-/feld-spezifischen Selektoren anpassen — die Grundstruktur (Employee-CRUD,
Lizenzgrenze, Reload, sequentielle/Card-Navigation, Team-Bericht, Mobile,
Konsolenfehler) bleibt über alle Produkte gleich, weil sie den Motor testet.
