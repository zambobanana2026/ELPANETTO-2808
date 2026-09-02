const { chromium } = require('playwright');
const path = require('path');

const FILE_URL = 'file://' + path.resolve(__dirname, '..', 'release', 'P2_Onboarding-Prozessbundle.html');

// Mirrors the slide-numbering constants in products/p2.config.js
const FIRST_MILESTONE_SLIDE = 7;
const SLIDES_PER_MILESTONE = 6; // Vorbereitung / Ziel&Einstieg / Reaktionen / Besser sagen / Vereinbarung / Follow-up
const BUDDY_FIRST_SLIDE = 31;
const ESKALATION_FIRST_SLIDE = 36;
const TRENNUNG_FIRST_SLIDE = 41;
const TEAMBERICHT_SLIDE = 46;
const ZUSAMMENFASSUNG_SLIDE = 47;
const TOTAL_SLIDES = 48;

// Carmen-Klar "kein automatisches Durchrutschen": these slides end in a
// decision-menu (tiles), not a single "Weiter" nav button.
const DECISION_MENU_SLIDES = new Set([
  FIRST_MILESTONE_SLIDE + SLIDES_PER_MILESTONE - 1,       // Tag30 Follow-up (12)
  FIRST_MILESTONE_SLIDE + 2 * SLIDES_PER_MILESTONE - 1,   // Tag60 Follow-up (18)
  FIRST_MILESTONE_SLIDE + 3 * SLIDES_PER_MILESTONE - 1,   // Tag90 Follow-up (24)
  FIRST_MILESTONE_SLIDE + 4 * SLIDES_PER_MILESTONE - 1,   // Tag150 Follow-up (30)
  BUDDY_FIRST_SLIDE + 4,                                  // Buddy 5/5 (35)
  ESKALATION_FIRST_SLIDE + 4,                             // Eskalation 5/5 (40)
  TRENNUNG_FIRST_SLIDE + 4                                // Trennung 5/5 (45)
]);

function ms(milestoneIndex, subIndex) { return FIRST_MILESTONE_SLIDE + milestoneIndex * SLIDES_PER_MILESTONE + subIndex; }

function assert(cond, msg) {
  if (!cond) throw new Error('FAIL: ' + msg);
  console.log('OK: ' + msg);
}

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(async () => chromium.launch());
  const consoleErrors = [];
  const pageErrors = [];

  let context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  let page = await context.newPage();
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => pageErrors.push(String(err)));
  page.on('dialog', async dialog => { await dialog.accept(); });

  await page.goto(FILE_URL);
  assert(await page.locator('.slide.active').count() === 1, 'exactly one active slide on load');
  assert((await page.locator('.slide.active').getAttribute('data-slide')) === '1', 'starts on slide 1');
  assert((await page.locator('.slide').count()) === TOTAL_SLIDES, 'exactly ' + TOTAL_SLIDES + ' slides in DOM');

  async function addEmployee(name, position, abteilung) {
    await page.click('button:has-text("MITARBEITER HINZUFÜGEN")');
    await page.fill('#empNameInput', name);
    if (position) await page.fill('#empPositionInput', position);
    if (abteilung) await page.fill('#empAbteilungInput', abteilung);
    await page.click('.dialog button:has-text("Hinzufügen")');
  }

  // ---- Welcome slide: video placeholder + pitch ----
  assert((await page.locator('.slide.active .videoPlaceholder').count()) === 1, 'welcome slide has a video placeholder');
  assert((await page.locator('.slide.active .pitchTile').count()) === 2, 'welcome slide has problem + solution pitch tiles');

  // ---- Full sequential navigation 1 -> TOTAL_SLIDES, following decision menus where present ----
  for (let n = 1; n <= TOTAL_SLIDES; n++) {
    const activeSlide = await page.locator('.slide.active').getAttribute('data-slide');
    assert(activeSlide === String(n), 'sequential nav at slide ' + n + ' matches (got ' + activeSlide + ')');
    if (n < TOTAL_SLIDES) {
      if (DECISION_MENU_SLIDES.has(n)) {
        await page.click('.slide.active .grid.grid1 .tile >> nth=0');
      } else {
        await page.click('.slide.active .nav button.btn:not(.alt)');
      }
    }
  }
  await page.click('.slide.active .nav .homeBtn'); // "Von vorn"
  assert((await page.locator('.slide.active').getAttribute('data-slide')) === '1', '"Von vorn" returns to slide 1');

  // ---- Übersicht tile links jump to correct first-subpage slides ----
  await page.evaluate(() => window.goTo(6));
  assert((await page.locator('.slide.active .tile').count()) === 7, 'overview has 4 phase tiles + 3 tool tiles');
  await page.evaluate(() => window.goTo(6));
  await page.click('.slide.active .grid .tile >> nth=0');
  assert((await page.locator('.slide.active').getAttribute('data-slide')) === String(ms(0, 0)), 'phase tile 1 jumps to Tag 30 Vorbereitung');

  // ---- Milestone headline: "TAG X." / "GESPRÄCHSPHASE „NAME"." ----
  const tag30H1 = await page.locator('.slide.active h1').innerText();
  assert(tag30H1.includes('TAG 30') && tag30H1.includes('GESPRÄCHSPHASE') && tag30H1.includes('CHECK-IN'), 'Tag30 headline names the phase: got "' + tag30H1.replace(/\n/g, ' / ') + '"');

  // ---- Employees + data separation ----
  await page.evaluate(() => window.goTo(5));
  await addEmployee('Anna Testperson', 'Teamleitung Vertrieb', 'Vertrieb');
  await addEmployee('Ben Testperson');
  assert((await page.locator('#empCount').textContent()) === '2', 'employee count = 2');
  assert(await page.locator('.tile.activeEmp b').textContent() === 'Ben Testperson', 'last-added employee is active');
  assert((await page.locator('.tile:has-text("Anna Testperson") .tileSubtitle').textContent()) === 'Teamleitung Vertrieb — Vertrieb', 'Anna tile shows position — Abteilung');
  assert((await page.locator('.tile:has-text("Ben Testperson") .tileSubtitle').count()) === 0, 'Ben tile has no subtitle (fields left blank)');

  // Tag 30 Vorbereitung holds the "teilnehmer" field, with its explanatory hint; Vereinbarung holds dok/next
  await page.evaluate((n) => window.goTo(n), ms(0, 0));
  assert((await page.locator('.slide.active textarea[data-field]').count()) === 1, 'Tag30 Vorbereitung slide has exactly 1 field (Teilnehmer)');
  assert((await page.locator('.slide.active .weeklyCheckCard span').first().textContent()).length > 0, 'Tag30 Teilnehmer field carries an explanatory hint');
  await page.evaluate((n) => window.goTo(n), ms(0, 4)); // Vereinbarung
  await page.fill('textarea[data-field="m1_dok"]', 'Ben-Notiz');
  await page.evaluate(() => window.goTo(5));
  await page.click('.tile:has-text("Anna Testperson")');
  await page.evaluate((n) => window.goTo(n), ms(0, 4));
  const annaValue = await page.inputValue('textarea[data-field="m1_dok"]');
  assert(annaValue === '', 'field empty for Anna (no leak from Ben): got "' + annaValue + '"');
  await page.fill('textarea[data-field="m1_dok"]', 'Anna-Notiz');
  await page.evaluate(() => window.goTo(5));
  await page.click('.tile:has-text("Ben Testperson")');
  await page.evaluate((n) => window.goTo(n), ms(0, 4));
  const benValue = await page.inputValue('textarea[data-field="m1_dok"]');
  assert(benValue === 'Ben-Notiz', 'Ben field restored correctly: got "' + benValue + '"');

  // ---- License limit ----
  await page.evaluate(() => window.goTo(5));
  for (let i = 3; i <= 20; i++) await addEmployee('MA ' + i);
  assert((await page.locator('#empCount').textContent()) === '20', 'employee count capped at 20');
  await page.click('button:has-text("MITARBEITER HINZUFÜGEN")');
  assert(await page.locator('#empLimitNote').isVisible(), 'license-limit note visible for 21st employee');
  assert(!(await page.locator('#empModal').evaluate(el => el.classList.contains('open'))), 'modal blocked for 21st employee');

  // ---- "Typische Reaktionen" (3/6) and "Besser sagen" (4/6) are separate slides ----
  await page.evaluate((n) => window.goTo(n), ms(0, 2)); // Tag30 Reaktionen
  assert((await page.locator('.slide.active .qa').count()) === 4, 'Tag30 "Typische Reaktionen" has 4 reaction Q&A blocks');
  assert((await page.locator('.slide.active .compareRow').count()) === 0, 'Tag30 "Typische Reaktionen" carries no compare rows (clean split)');
  await page.evaluate((n) => window.goTo(n), ms(0, 3)); // Tag30 Besser sagen
  assert((await page.locator('.slide.active .compareRow').count()) === 3, 'Tag30 "Besser sagen" has 3 compare rows');
  assert((await page.locator('.slide.active .qa').count()) === 0, 'Tag30 "Besser sagen" carries no reaction blocks (clean split)');

  // ---- Milestone checklist items carry explanatory hints (Tag30 Vorbereitung) ----
  await page.evaluate((n) => window.goTo(n), ms(0, 0));
  const checkHintCount = await page.locator('.slide.active .choice span').count();
  assert(checkHintCount === 3, 'Tag30 Vorbereitung: all 3 checklist items carry a hint span');

  // ---- Milestone 3 (Tag 90) structured fields + Bewertungsbereiche ----
  await page.evaluate((n) => window.goTo(n), ms(2, 1)); // Tag90 Ziel & Einstieg
  assert((await page.locator('.slide.active .qlist li').count()) === 4, 'Tag90 Ziel&Einstieg lists 4 Bewertungsbereiche');
  await page.evaluate((n) => window.goTo(n), ms(2, 4)); // Tag90 Vereinbarung
  assert((await page.locator('.slide.active textarea[data-field]').count()) === 6, 'Tag90 Vereinbarung has 6 fields (Fach/Selbst/Teamfit/Kultur/Perspektive/Next)');
  assert((await page.locator('.slide.active .weeklyCheckCard span').count()) === 6, 'Tag90 Vereinbarung: all 6 fields carry a hint');
  // Pin a known active employee first - later blocks (Zusammenfassung) switch
  // the active employee, and this field is per-employee data.
  await page.evaluate(() => window.goTo(5));
  await page.click('.tile:has-text("MA 20")');
  await page.evaluate((n) => window.goTo(n), ms(2, 4));
  await page.fill('textarea[data-field="m3_perspektive"]', 'positiv');

  // ---- Milestone Follow-up: no auto-advance, decision menu instead ----
  await page.evaluate((n) => window.goTo(n), ms(0, 5)); // Tag30 Follow-up
  assert((await page.locator('.slide.active').innerText()).includes('ANWENDEN & BEITRAGEN'), 'Tag30 follow-up previews next phase (Anwenden & Beitragen)');
  assert((await page.locator('.slide.active .nav button.btn:not(.alt)').count()) === 0, 'Tag30 follow-up has no single "Weiter" button (decision menu instead)');
  assert((await page.locator('.slide.active .grid.grid1 .tile').count()) === 3, 'Tag30 follow-up offers 3 decision-menu tiles');
  await page.evaluate((n) => window.goTo(n), ms(3, 5)); // Tag150 Follow-up, last milestone
  assert((await page.locator('.slide.active').innerText()).includes('ENDE DER PROBEZEIT'), 'Tag150 follow-up shows closing note (no next phase)');
  const tag150Tile = await page.locator('.slide.active .grid.grid1 .tile').first().innerText();
  assert(tag150Tile.toUpperCase().includes('BUDDY-FRAMEWORK'), 'Tag150 follow-up decision menu points to Buddy-Framework: got "' + tag150Tile.replace(/\n/g, ' ') + '"');

  // ---- Buddy-Framework (5 subpages, own headline per subpage, decision menu at the end) ----
  await page.evaluate((n) => window.goTo(n), BUDDY_FIRST_SLIDE);
  const buddyH1_1 = await page.locator('.slide.active h1').innerText();
  assert((await page.locator('.slide.active').innerText()).includes('ROLLE DES BUDDYS'), 'Buddy slide 1/5 shows Rolle');
  await page.evaluate((n) => window.goTo(n), BUDDY_FIRST_SLIDE + 1);
  const buddyH1_2 = await page.locator('.slide.active h1').innerText();
  assert(buddyH1_1 !== buddyH1_2, 'Buddy headline differs per subpage: "' + buddyH1_1.replace(/\n/g, ' ') + '" vs "' + buddyH1_2.replace(/\n/g, ' ') + '"');
  await page.evaluate((n) => window.goTo(n), BUDDY_FIRST_SLIDE + 2);
  assert((await page.locator('.slide.active .checks .choice').count()) === 5, 'Buddy slide 3/5 (Aufgaben) has 5 checks');
  await page.evaluate((n) => window.goTo(n), BUDDY_FIRST_SLIDE + 3);
  assert((await page.locator('.slide.active').innerText()).includes('STRIKTE GRENZEN'), 'Buddy slide 4/5 shows Grenzen & Tabus');
  await page.evaluate((n) => window.goTo(n), BUDDY_FIRST_SLIDE + 4);
  assert((await page.locator('.slide.active .checks .choice').count()) === 13, 'Buddy checklist slide has 13 checks');
  assert((await page.locator('.slide.active .weeklyCheckCard span').count()) === 2, 'Buddy Arbeitsvorlage: both fields carry a hint');
  assert((await page.locator('.slide.active .nav button.btn:not(.alt)').count()) === 0, 'Buddy last slide has no single "Weiter" button (decision menu instead)');
  await page.click('.choice[data-toggle="buddy_chk1"]');
  assert(await page.locator('.choice[data-toggle="buddy_chk1"]').evaluate(el => el.classList.contains('on')), 'buddy choice toggled on');

  // ---- Eskalationsprotokoll (5 subpages) ----
  await page.evaluate((n) => window.goTo(n), ESKALATION_FIRST_SLIDE);
  assert((await page.locator('.slide.active .tile').count()) === 3, 'Eskalation overview shows 3-step overview');
  await page.evaluate((n) => window.goTo(n), ESKALATION_FIRST_SLIDE + 1); // Schritt 1, Faktenabgleich
  assert((await page.locator('.slide.active .weeklyCheckCard span').count()) === 2, 'Eskalation Schritt 1: both fields carry a hint');
  await page.evaluate((n) => window.goTo(n), ESKALATION_FIRST_SLIDE + 3); // Schritt 2 / Lernkurve, ja/nein toggle
  await page.click('.choice[data-toggle="esk_verb_ja"]');
  assert(await page.locator('.choice[data-toggle="esk_verb_ja"]').evaluate(el => el.classList.contains('on')), 'esk ja toggled on');
  await page.click('.choice[data-toggle="esk_verb_nein"]');
  assert(await page.locator('.choice[data-toggle="esk_verb_nein"]').evaluate(el => el.classList.contains('on')), 'esk nein toggled on');
  assert(!(await page.locator('.choice[data-toggle="esk_verb_ja"]').evaluate(el => el.classList.contains('on'))), 'esk ja/nein are mutually exclusive (ja turned off when nein selected)');
  await page.evaluate((n) => window.goTo(n), ESKALATION_FIRST_SLIDE + 4); // Schritt 3 + Checkliste
  assert((await page.locator('.slide.active .checks .choice').count()) === 10, 'Eskalation final slide has 10-item checklist');
  assert((await page.locator('.slide.active .nav button.btn:not(.alt)').count()) === 0, 'Eskalation last slide has no single "Weiter" button (decision menu instead)');

  // ---- Trennungs-Leitfaden (5 subpages) ----
  await page.evaluate((n) => window.goTo(n), TRENNUNG_FIRST_SLIDE + 3); // "3. Sachlicher Übergang" - now a clickable checklist
  assert((await page.locator('.slide.active .checks .choice').count()) === 4, 'Trennung "Sachlicher Übergang" is a 4-item clickable checklist');
  await page.evaluate((n) => window.goTo(n), TRENNUNG_FIRST_SLIDE + 4);
  assert((await page.locator('.slide.active .checks .choice').count()) === 7, 'Trennung protocol slide has 7 checks');
  const trText = await page.locator('.slide.active').innerText();
  assert(trText.includes('ersetzen keine individuelle Rechtsberatung'), 'general disclaimer repeated on Trennung final slide');
  assert((await page.locator('.slide.active .weeklyCheckCard span').count()) === 1, 'Trennung Protokoll field carries a hint');
  assert((await page.locator('.slide.active .nav button.btn:not(.alt)').count()) === 0, 'Trennung last slide has no single "Weiter" button (decision menu instead)');
  await page.evaluate((n) => window.goTo(n), TRENNUNG_FIRST_SLIDE);
  assert((await page.locator('.slide.active').innerText()).includes('§ 622 Abs. 3 BGB'), 'BGB reference present on Trennung leitplanke slide');

  // ---- Farbmodell-Umschaltung: switching repaints the page and persists ----
  await page.evaluate((n) => window.goTo(n), 1);
  const bgBefore = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.click('.themeTrigger');
  await page.waitForTimeout(50);
  assert((await page.locator('.themeSwatch').count()) === 10, 'theme modal offers 10 color models');
  await page.locator('.themeSwatch').nth(1).click(); // "Ozean"
  await page.waitForTimeout(50);
  const bgAfter = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  assert(bgBefore !== bgAfter, 'switching color model repaints the page background: ' + bgBefore + ' -> ' + bgAfter);
  await page.click('button:has-text("Schließen")');

  // ---- Zusammenfassung & PDF: only filled sections show, per active employee ----
  await page.evaluate(() => window.goTo(5));
  await page.click('.tile:has-text("Anna Testperson")');
  await page.evaluate((n) => window.goTo(n), ZUSAMMENFASSUNG_SLIDE);
  const summaryAnna = await page.locator('#summaryOutput').innerText();
  assert(summaryAnna.includes('Anna-Notiz'), 'Zusammenfassung shows Anna\'s own Tag30-Dokumentation entry');
  assert(!summaryAnna.includes('positiv'), 'Zusammenfassung does not leak Ben/other-employee data (Anna never filled Tag90)');
  await page.evaluate(() => window.goTo(5));
  await page.click('.tile:has-text("Ben Testperson")');
  await page.evaluate((n) => window.goTo(n), ZUSAMMENFASSUNG_SLIDE);
  const summaryBen = await page.locator('#summaryOutput').innerText();
  assert(summaryBen.includes('Ben-Notiz'), 'Zusammenfassung shows Ben\'s own Tag30-Dokumentation entry');
  assert(!summaryBen.includes('Anna-Notiz'), 'Zusammenfassung does not leak Anna\'s data into Ben\'s summary');

  // ---- Reload persistence (includes the just-picked color theme) ----
  await page.reload();
  assert((await page.locator('#empCount').textContent()) === '20', 'employees persisted after reload');
  await page.evaluate(() => window.goTo(5));
  assert((await page.locator('.tile:has-text("Anna Testperson") .tileSubtitle').textContent()) === 'Teamleitung Vertrieb — Vertrieb', 'position/Abteilung persisted after reload');
  await page.click('.tile:has-text("MA 20")'); // re-select the employee this field was filled for
  await page.evaluate((n) => window.goTo(n), ms(2, 4));
  const perspVal = await page.inputValue('textarea[data-field="m3_perspektive"]');
  assert(perspVal === 'positiv', 'Tag90 field persisted after reload: got "' + perspVal + '"');
  await page.evaluate((n) => window.goTo(n), BUDDY_FIRST_SLIDE + 4);
  assert(await page.locator('.choice[data-toggle="buddy_chk1"]').evaluate(el => el.classList.contains('on')), 'buddy checklist choice persisted after reload');
  await page.evaluate((n) => window.goTo(n), ESKALATION_FIRST_SLIDE + 3);
  assert(await page.locator('.choice[data-toggle="esk_verb_nein"]').evaluate(el => el.classList.contains('on')), 'escalation ja/nein choice persisted after reload');
  const bgAfterReload = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  assert(bgAfterReload === bgAfter, 'color theme choice persisted after reload');

  // ---- Team report ----
  await page.evaluate((n) => window.goTo(n), TEAMBERICHT_SLIDE);
  const teamRows = await page.locator('#teamTableBody tr').count();
  assert(teamRows >= 1, 'team report has rows: ' + teamRows);
  const cntMA = await page.locator('#cntTeamMA').textContent();
  assert(Number(cntMA) === 20, 'team report employee count = 20: got ' + cntMA);

  // ---- Legal disclaimers present ----
  await page.evaluate(() => window.goTo(3));
  assert((await page.locator('.slide.active .note').textContent()).includes('keine individuelle Rechtsberatung'), 'general legal disclaimer on slide 3');

  // ---- Print output: exactly one visible slide (Carmen-Klar regression: used to print all slides stacked) ----
  await page.evaluate((n) => window.goTo(n), ZUSAMMENFASSUNG_SLIDE);
  await page.emulateMedia({ media: 'print' });
  const visibleSlidesInPrint = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.slide')).filter(function (el) {
      return getComputedStyle(el).display !== 'none';
    }).length;
  });
  assert(visibleSlidesInPrint === 1, 'print media shows exactly one slide, not all stacked: got ' + visibleSlidesInPrint);
  await page.emulateMedia({ media: 'screen' });

  await context.close();

  // ---- Mobile viewport ----
  context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  page = await context.newPage();
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => pageErrors.push(String(err)));
  await page.goto(FILE_URL);
  const navBox = await page.locator('.slide.active .nav').boundingBox();
  assert(navBox && navBox.y + navBox.height >= 844 - 5, 'mobile nav pinned near bottom');
  const navBg = await page.locator('.slide.active .nav').evaluate(el => getComputedStyle(el).backgroundColor);
  assert(navBg !== 'rgba(0, 0, 0, 0)', 'mobile nav has solid background: ' + navBg);
  await context.close();

  console.log('\n=== console errors:', consoleErrors.length);
  consoleErrors.forEach(e => console.log('  console.error:', e));
  console.log('=== page errors:', pageErrors.length);
  pageErrors.forEach(e => console.log('  pageerror:', e));

  await browser.close();
  if (consoleErrors.length || pageErrors.length) { console.log('\nFAILED'); process.exit(1); }
  console.log('\nALL CHECKS PASSED');
})().catch(err => { console.error(err); process.exit(1); });
