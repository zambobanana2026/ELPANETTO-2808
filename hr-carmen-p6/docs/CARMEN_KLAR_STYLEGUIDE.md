# Carmen Klar — Design- und Sprachsystem für die P1–P8 Produktfamilie

**Was ist "Carmen Klar"?** Der Name für das Layout- und Sprach-System, das in P6
(Schwierige Mitarbeitergespräche) entstanden ist und für alle Carmen-Next-Produkte
(P1–P8) übernommen werden soll. Knüpft bewusst an das produktinterne
Carmen-KLAR-System (Klären · Leitplanken setzen · Ansprechen · Reaktion auffangen) an —
"klar" beschreibt gleichzeitig die Marke und das, was das Design leisten soll:
unmissverständlich, aufgeräumt, ohne Ablenkung.

**Wie benutzt man diesen Namen in einem neuen Chat?** Der Name allein reicht nicht —
eine neue Session kennt ihn nicht, wenn sie dieses Dokument nicht sehen kann. Also:
Repo (mindestens `motor/` + dieses Dokument) an die Session anhängen und sagen
*"Baue P3 im Carmen-Klar-Stil, siehe docs/CARMEN_KLAR_STYLEGUIDE.md"*.

---

## 1. Architektur: Motor + Config

Carmen Klar ist keine reine CSS-Bibliothek, sondern untrennbar mit der
**Motor + Config**-Architektur verbunden:

```
/motor/
  engine.css   -- dieses gesamte Design-System (Tokens, Klassen, responsive Regeln)
  engine.js    -- geteilte Logik: Navigation, localStorage, Entity-Verwaltung,
                  Farbmodell-Umschaltung, Report-/Zusammenfassungs-Rendering
/products/
  pN.config.js       -- Produkt-Inhalte + produktspezifisches JS (Slide-Templates)
  pN/intro.slides.html, pN/outro.slides.html  -- statische Rahmen-Slides
/content/
  cards_pN.json      -- maschinenlesbare Inhalte (bei Karten-Produkten)
/build/build.js       -- fügt motor + config zu einer einzigen autarken HTML-Datei
```

**Regel:** `motor/engine.css` und `motor/engine.js` sind produktübergreifend und
bleiben unverändert, wenn man ein neues Produkt baut — nur der jeweilige
`products/pN.config.js`-Block liefert Inhalte. Neue, generische Bausteine (neue
CSS-Klassen, neue Motor-Funktionen) dürfen ergänzt werden, wenn sie wirklich
wiederverwendbar sind — aber niemals produktspezifisch in den Motor schreiben.

Jedes Endprodukt ist eine **einzelne, autarke HTML-Datei ohne externe
Abhängigkeiten** — Käufer laden eine Datei herunter und öffnen sie offline.

---

## 2. Design-Tokens (`:root` in engine.css)

Neun CSS-Custom-Properties tragen jedes Farbmodell — nie Farben hart codieren,
immer `var(--token)` verwenden:

| Token | Bedeutung |
|---|---|
| `--ink` | Haupttextfarbe |
| `--paper` | Hintergrund der `.slide` |
| `--pagebg` | Hintergrund der Seite außerhalb der Slide |
| `--surface` | Hintergrund von Kacheln/Karten/Boxen |
| `--muted` | Gedämpfter Text (Beschriftungen, Meta-Infos) |
| `--line` | Rahmenfarbe |
| `--ci` | Marken-/Akzentfarbe (Buttons, Icons, Zahlen-Kreise) |
| `--mint` | Zweiter Akzent (z. B. `.note`-Randfarbe) |
| `--num` | Farbe der Seitenzahl oben rechts |

Fest, **niemals** vom Farbmodell abhängig: `--green` (Erfolg), `--orange`
(Warnung), `--red` (Fehler/Wichtiger Hinweis) — Ampelfarben bleiben über alle
Farbmodelle hinweg gleich, damit "Erfolg/Warnung/Fehler" nie mit der Marke kippt.

**Farbmodell-Picker:** `MotorEngine.createColorThemes(DEFAULT_THEMES, storageKey)`
— 10 fertige, vollständig abgestimmte Paletten (9 hell + 1 dunkel), jederzeit
wechselbar über einen 🎨-Button unten links, persistiert in localStorage pro
Produkt. Jedes Produkt bindet das identisch ein, nur der `storageKey` ist
produktspezifisch (z. B. `p6_theme_v1`), damit eine Wahl in einem Produkt nicht
die in einem anderen überschreibt.

---

## 3. Sprache & Anrede

- **Durchgängig Du**, nicht Sie — auf jeder Slide: Fließtext, Fragen, Hinweise,
  Buttons, Checklisten, Überschriften.
- **Ausnahme:** Dialog-Beispiele innerhalb von Gesprächskarten/Szenarien, in
  denen eine Figur eine andere Figur anspricht (z. B. Führungskraft → Mitarbeiter),
  bleiben so, wie das Beispiel es vorsieht — auch wenn eine Figur darin "Sie"
  sagt (z. B. eine Mitarbeiter-Replik). Das ist Zitat, keine App-Anrede.
- Instruktionen als Imperativ oder Aussage in Du-Form ("Wähle die Karte, die am
  konkretesten passt." / "Du legst „Julia Berger" an und wählst sie als aktive
  Person aus.").
- Ton: sachlich, professionell, locker — keine Ausrufezeichen-Häufung, keine
  übertriebene Motivations-Sprache.

---

## 4. Layout-Bausteine

### Slide-Grundgerüst
```html
<section class="slide[ active][ headCenter|textCenter]" data-slide="N">
  <div class="brand">P6 / KONTEXT</div><div class="num">01</div>
  <h1>ÜBERSCHRIFT.</h1>
  <p class="lead">Unterüberschrift/Erklärung.</p>
  ...Inhalt...
  <div class="nav">...</div>
</section>
```
- `.num` ist die zweistellige Seitenzahl oben rechts (`pad2(n)`), `.brand` die
  kleine Kontext-Zeile oben links (`PRODUKT / ABSCHNITT`).
- `.headCenter` zentriert nur `<h1>` + die direkt folgende `.lead` (Standard für
  die meisten Slides). `.textCenter` zentriert die **ganze** Slide inklusive
  Grids/Boxen (nur für besonders werbliche Slides wie die Willkommens-Slide).

### Kacheln & Grids
- `.grid` + `.grid1` (1 Spalte) oder `.grid4` (4 Spalten) für Kachel-Layouts.
- `.tile` — Standard-Kachel (Titel fett, Beschreibung in `<small>`, optional
  `style="cursor:pointer" onclick="..."` für klickbare Auswahl-Kacheln).
- `.pitchSection` + `.pitchTile` + `.pitchHook` — dominantere Variante für
  Problem/Lösung-Pitches (dickerer Rand, Schatten, größere Kachel-Überschrift).
- `.box` — schmalere Variante für einzelne Info-Blöcke (Zitate, Zusammenfassungen).
- `.note` — linksbündiger Farbbalken für Hinweise; `border-left-color:var(--red)`
  für rechtliche/wichtige Hinweise überschreiben.

### Video-Platzhalter
```html
<div class="videoPlaceholder"><div class="playIcon">▶</div><b>LABEL</b>
<small>Format 9:16<br>[hier kommt dein Video]</small></div>
```
Immer 9:16, immer mit `[hier kommt dein Video]` als expliziter Platzhalter-Text
(nie ein echtes externes Video einbetten — verletzt die
Ein-Datei-ohne-Abhängigkeiten-Regel). Ein kurzer erklärender Satz direkt davor,
was das Video behandeln wird.

### "Als Nächstes"-Übergänge
An großen Abschnittswechseln (nicht bei jedem einzelnen Klick) ein kurzer,
rechtsbündiger Hinweis direkt vor der `.nav`-Zeile, als Inline-Style (bewusst
keine eigene Motor-Klasse, damit produktspezifische Übergänge nicht in die
gemeinsame CSS-Datei wandern):
```html
<p style="margin:18px 0 0;font-size:12px;color:var(--muted);text-align:right">Als Nächstes: du legst deinen ersten Mitarbeiter an.</p>
```

### Vorbereitungs-Felder mit Beispiel-Platzhaltern
Textareas für eigene Notizen bekommen **konkrete, zum Szenario passende
Beispiele** als Platzhalter statt generischer Hinweise wie "Kurz eintragen …" —
beantwortet direkt die Frage/Unterüberschrift darüber:
```html
<textarea data-field="..." placeholder="z. B. Die Übergabe wurde in den letzten zwei Fällen nicht dokumentiert."></textarea>
```

### Navigation
`.nav` ist immer `display:flex;justify-content:space-between` mit bis zu drei
Elementen: `.homeBtn` (links, `.btn.alt`, führt zur jeweiligen Übersicht/Auswahl-
Slide), "Zurück" (Mitte, `.btn.alt`, `prevSlide()`), "Weiter"/Aktion (rechts,
`.btn`). Leere Positionen mit `<span></span>` auffüllen, damit das Flex-Layout
stabil bleibt. Auf Mobile wird `.nav` `position:fixed` am unteren Bildschirmrand.

### Kein automatisches Durchrutschen nach abgeschlossenen Einheiten
Sobald eine in sich geschlossene Einheit (z. B. eine Gesprächskarte) bearbeitet
wurde, **nicht** automatisch zur nächsten gleichartigen Einheit weiterleiten.
Stattdessen am Ende explizit **entscheiden lassen**, wie es weitergeht — als
Kachel-Menü, nicht als einzelner "Weiter"-Button:
```html
<div class="note"><b>[EINHEIT] DOKUMENTIERT.</b><br>Wie geht es jetzt weiter?</div>
<div class="grid grid1">
  <div class="tile" style="cursor:pointer" onclick="goTo(N)"><b>📄 ZUSAMMENFASSUNG &amp; PDF</b><small>...</small></div>
  <div class="tile" style="cursor:pointer" onclick="goTo(N)"><b>👤 ...</b><small>...</small></div>
  <div class="tile" style="cursor:pointer" onclick="goTo(N)"><b>📚 ...</b><small>...</small></div>
</div>
<div class="nav"><button class="btn alt homeBtn" onclick="goTo(N)">◂ Übersicht</button><button class="btn alt" onclick="prevSlide()">Zurück</button><span></span></div>
```

### Zusammenfassung & PDF
Für jede Entität (z. B. Mitarbeiter) eine eigene "Zusammenfassung"-Slide, die
alle bisher erfassten Daten Schritt für Schritt, professionell formatiert
zeigt (`.summaryMeta`, `.summaryCard`, `.summaryCardHead`, `.summaryCardNum`,
`.summarySection`, `.summaryField`) — nur ausgefüllte Abschnitte, leerer Zustand
mit `.summaryEmpty` statt einer leeren Seite. Ein `🖨 ALS PDF DRUCKEN`-Button
(`.pdfBtn`, `onclick="window.print()"`) nutzt den Browser-Druckdialog.
**Wichtig:** `@media print` zeigt ausschließlich `.slide.active`, nie alle
Slides gestapelt — sonst druckt der Button das ganze Produkt statt der
gewünschten Seite.

### Entity-Verwaltung (z. B. Mitarbeitende)
`MotorEngine.createEmployeeManager({...})` — generische CRUD-Verwaltung mit
Lizenzgrenze, `tileLabel`/`tileSubtitle` für individuelle Kachel-Beschriftung
(z. B. Position — Abteilung), `onChange`-Hook zum Zurücksetzen gebundener
Formularfelder beim Personenwechsel. Daten werden pro Entität isoliert
gespeichert (`store.data.byEmployee[id].fields`), damit sich Notizen
verschiedener Personen nie vermischen.

---

## 5. QA-Erwartung

Jede inhaltliche oder strukturelle Änderung bekommt eine Playwright-Regression
(`qa/pN_qa.js`): Navigation, Datenisolation zwischen Entitäten, Lizenzgrenze,
Reload-Persistenz, Farbmodell-Wechsel (inkl. Hintergrund-Repaint), Druckausgabe
(genau eine sichtbare Slide), Mobile-Viewport-Check. 0 Konsolen-/Seitenfehler
ist Pflicht, nicht optional.

---

## 6. Checkliste: neues Produkt im Carmen-Klar-Stil bauen

1. `products/pN.config.js` + `products/pN/{intro,outro}.slides.html` +
   `content/cards_pN.json` (falls Karten-Produkt) nach dem P6-Muster anlegen.
2. `motor/engine.css`/`engine.js` **nicht verändern**, außer eine neue Klasse
   ist wirklich für alle Produkte sinnvoll — dann additiv ergänzen, nie
   bestehende Regeln umbauen (P2 nicht durch P-N-Arbeit beeinflussen).
3. Willkommens-Slide mit Video-Platzhalter + Problem/Lösung-Pitch, durchgängig
   Du, zentrierte Überschriften.
4. Farbmodell-Picker, Entity-Verwaltung, Zusammenfassung/PDF, "Als
   Nächstes"-Übergänge an den großen Abschnittswechseln übernehmen.
5. `qa/pN_qa.js` von einem bestehenden Produkt ableiten, alle Checks grün vor
   dem Push.
