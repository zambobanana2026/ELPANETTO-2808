const { chromium } = require('playwright');
const path = require('path');

const FILE_URL = 'file://' + path.resolve(__dirname, '..', 'release', 'P2_Onboarding-Prozessbundle.html');
const TOTAL_SLIDES = 44;

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

  // ---- Welcome slide (1/44): brand, video placeholder, pitch section (shared P6 template) ----
  assert((await page.locator('.slide.active .brand').textContent()) === 'P2 / WILLKOMMEN', 'slide 1 is the Willkommen slide');
  assert((await page.locator('.slide.active').evaluate(el => el.classList.contains('textCenter'))), 'slide 1 uses the shared .textCenter class');
  assert((await page.locator('.slide.active .videoPlaceholder').count()) === 1, 'slide 1 has a video placeholder (9:16)');
  assert((await page.locator('.slide.active .videoPlaceholder .playIcon').count()) === 1, 'video placeholder has the shared play icon');
  assert((await page.locator('.slide.active').evaluate(el => getComputedStyle(el).textAlign)) === 'center', 'slide 1 text is centered');
  assert((await page.locator('.slide.active .pitchSection').count()) === 1, 'slide 1 has the shared pitch section');
  assert((await page.locator('.slide.active .pitchHook').count()) === 1, 'slide 1 has a pitch hook sentence');
  assert((await page.locator('.slide.active .pitchTile').count()) === 2, 'slide 1 has 2 pitch tiles (Problem/Lösung)');
  const welcomeText = await page.locator('.slide.active').innerText();
  assert(welcomeText.includes('180 Tage') && welcomeText.includes('DAS PROBLEM') && welcomeText.includes('DIE LÖSUNG'), 'slide 1 covers Hook, Problem, Lösung via the shared pitch template');

  // ---- Slide reorder: "Für wen" is now slide 2, hero moved to slide 3 ----
  await page.evaluate(() => window.goTo(2));
  assert((await page.locator('.slide.active .brand').textContent()) === 'P2 / FÜR WEN', '"Für wen" is now slide 2');
  await page.evaluate(() => window.goTo(3));
  assert((await page.locator('.slide.active .brand').textContent()) === 'P2 / ONBOARDING-PROZESSBUNDLE', 'hero slide moved to slide 3');

  // ---- Every heading + its adjacent subheading is centered (data-product="p2" scoped), without disrupting functional content ----
  assert((await page.locator('#app').getAttribute('data-product')) === 'p2', 'app root carries data-product="p2"');
  await page.evaluate(() => window.goTo(3));
  assert((await page.locator('.slide.active h1').evaluate(el => getComputedStyle(el).textAlign)) === 'center', 'hero h1 is centered');
  assert((await page.locator('.slide.active .lead').first().evaluate(el => getComputedStyle(el).textAlign)) === 'center', 'hero subheading (.lead directly after h1) is centered');
  await page.evaluate(() => window.goTo(8)); // Tag30 Vorbereitung (functional slide, h1 has no adjacent .lead)
  assert((await page.locator('.slide.active h1').evaluate(el => getComputedStyle(el).textAlign)) === 'center', 'functional-slide h1 is centered too');
  assert((await page.locator('.slide.active .checks').evaluate(el => getComputedStyle(el).textAlign)) !== 'center', 'checklist below the heading stays left-aligned, not swept into centering');
  await page.evaluate(() => window.goTo(19)); // Tag90 Ziel & Einstieg (has a .lead nested inside a .box, not adjacent to h1)
  assert((await page.locator('.slide.active .box .lead').evaluate(el => getComputedStyle(el).textAlign)) !== 'center', '.lead nested inside a .box (quoted goal text) is NOT swept into centering, only true h1-adjacent subheadings are');
  await page.evaluate(() => window.goTo(1));

  async function addEmployee(name, position, abteilung) {
    await page.click('button:has-text("MITARBEITER HINZUFÜGEN")');
    await page.fill('#empNameInput', name);
    if (position) await page.fill('#empPositionInput', position);
    if (abteilung) await page.fill('#empAbteilungInput', abteilung);
    await page.click('.dialog button:has-text("Hinzufügen")');
  }

  // ---- Full sequential navigation 1 -> TOTAL_SLIDES ----
  for (let n = 1; n <= TOTAL_SLIDES; n++) {
    const activeSlide = await page.locator('.slide.active').getAttribute('data-slide');
    assert(activeSlide === String(n), 'sequential nav at slide ' + n + ' matches (got ' + activeSlide + ')');
    if (n < TOTAL_SLIDES) await page.click('.slide.active .nav button.btn:not(.alt)');
  }
  await page.click('.slide.active .nav .homeBtn'); // "Von vorn"
  assert((await page.locator('.slide.active').getAttribute('data-slide')) === '1', '"Von vorn" returns to slide 1');

  // ---- Übersicht tile links jump to correct first-subpage slides ----
  await page.evaluate(() => window.goTo(7));
  assert((await page.locator('.slide.active .tile').count()) === 7, 'overview has 4 phase tiles + 3 tool tiles');
  await page.evaluate(() => window.goTo(7));
  await page.click('.slide.active .grid .tile >> nth=0');
  assert((await page.locator('.slide.active').getAttribute('data-slide')) === '8', 'phase tile 1 jumps to slide 8 (Tag 30 Vorbereitung)');

  // ---- Employees + data separation ----
  await page.evaluate(() => window.goTo(6));
  await addEmployee('Anna Testperson', 'Teamleitung Vertrieb', 'Vertrieb');
  await addEmployee('Ben Testperson');
  assert((await page.locator('#empCount').textContent()) === '2', 'employee count = 2');
  assert(await page.locator('.tile.activeEmp b').textContent() === 'Ben Testperson', 'last-added employee is active');
  assert((await page.locator('.tile:has-text("Anna Testperson") .tileSubtitle').textContent()) === 'Teamleitung Vertrieb — Vertrieb', 'Anna tile shows position — Abteilung');
  assert((await page.locator('.tile:has-text("Ben Testperson") .tileSubtitle').count()) === 0, 'Ben tile has no subtitle (fields left blank)');

  // Tag 30 Vorbereitung (slide 8) holds the "teilnehmer" field; Vereinbarung (slide 11) holds dok/next
  await page.evaluate(() => window.goTo(8));
  assert((await page.locator('.slide.active textarea[data-field]').count()) === 1, 'Tag30 Vorbereitung slide has exactly 1 field (Teilnehmer)');
  await page.evaluate(() => window.goTo(11));
  await page.fill('textarea[data-field="m1_dok"]', 'Ben-Notiz');
  await page.evaluate(() => window.goTo(6));
  await page.click('.tile:has-text("Anna Testperson")');
  await page.evaluate(() => window.goTo(11));
  const annaValue = await page.inputValue('textarea[data-field="m1_dok"]');
  assert(annaValue === '', 'field empty for Anna (no leak from Ben): got "' + annaValue + '"');
  await page.fill('textarea[data-field="m1_dok"]', 'Anna-Notiz');
  await page.evaluate(() => window.goTo(6));
  await page.click('.tile:has-text("Ben Testperson")');
  await page.evaluate(() => window.goTo(11));
  const benValue = await page.inputValue('textarea[data-field="m1_dok"]');
  assert(benValue === 'Ben-Notiz', 'Ben field restored correctly: got "' + benValue + '"');

  // ---- License limit ----
  await page.evaluate(() => window.goTo(6));
  for (let i = 3; i <= 20; i++) await addEmployee('MA ' + i);
  assert((await page.locator('#empCount').textContent()) === '20', 'employee count capped at 20');
  await page.click('button:has-text("MITARBEITER HINZUFÜGEN")');
  assert(await page.locator('#empLimitNote').isVisible(), 'license-limit note visible for 21st employee');
  assert(!(await page.locator('#empModal').evaluate(el => el.classList.contains('open'))), 'modal blocked for 21st employee');

  // ---- Milestone "Im Gespräch" (3/5) pages carry reactions + compare table ----
  await page.evaluate(() => window.goTo(10)); // Tag30 slide 3/5
  assert((await page.locator('.slide.active .qa').count()) === 4, 'Tag30 "Im Gespräch" has 4 reaction Q&A blocks');
  assert((await page.locator('.slide.active .compareRow').count()) === 3, 'Tag30 "Im Gespräch" has 3 compare rows');

  // ---- Milestone 3 (Tag 90) structured fields + Bewertungsbereiche ----
  await page.evaluate(() => window.goTo(19)); // Tag90 base 18 -> +1 Ziel&Einstieg
  assert((await page.locator('.slide.active .qlist li').count()) === 4, 'Tag90 Ziel&Einstieg lists 4 Bewertungsbereiche');
  await page.evaluate(() => window.goTo(21)); // Tag90 Vereinbarung (base 18 + 3)
  assert((await page.locator('.slide.active textarea[data-field]').count()) === 6, 'Tag90 Vereinbarung has 6 fields (Fach/Selbst/Teamfit/Kultur/Perspektive/Next)');
  await page.fill('textarea[data-field="m3_perspektive"]', 'positiv');

  // ---- Milestone Follow-up (5/5) shows next-phase preview / closing note ----
  await page.evaluate(() => window.goTo(12)); // Tag30 Follow-up (base8+4)
  assert((await page.locator('.slide.active').innerText()).includes('ANWENDEN & BEITRAGEN'), 'Tag30 follow-up previews next phase (Anwenden & Beitragen)');
  await page.evaluate(() => window.goTo(27)); // Tag150 Follow-up (base23+4), last milestone
  assert((await page.locator('.slide.active').innerText()).includes('ENDE DER PROBEZEIT'), 'Tag150 follow-up shows closing note (no next phase)');
  const tag150NextBtn = await page.locator('.slide.active .nav button.btn:not(.alt)').textContent();
  assert(tag150NextBtn.includes('Buddy-Framework'), 'Tag150 follow-up next-button correctly announces Buddy-Framework: got "' + tag150NextBtn + '"');

  // ---- Buddy-Framework (5 subpages, slides 28-32) ----
  await page.evaluate(() => window.goTo(28));
  assert((await page.locator('.slide.active').innerText()).includes('ROLLE DES BUDDYS'), 'Buddy slide 1/5 shows Rolle');
  await page.evaluate(() => window.goTo(30));
  assert((await page.locator('.slide.active .checks .choice').count()) === 5, 'Buddy slide 3/5 (Aufgaben) has 5 checks');
  await page.evaluate(() => window.goTo(31));
  assert((await page.locator('.slide.active').innerText()).includes('STRIKTE GRENZEN'), 'Buddy slide 4/5 shows Grenzen & Tabus');
  await page.evaluate(() => window.goTo(32));
  assert((await page.locator('.slide.active .checks .choice').count()) === 13, 'Buddy checklist slide has 13 checks');
  await page.click('.choice[data-toggle="buddy_chk1"]');
  assert(await page.locator('.choice[data-toggle="buddy_chk1"]').evaluate(el => el.classList.contains('on')), 'buddy choice toggled on');

  // ---- Eskalationsprotokoll (5 subpages, slides 33-37) ----
  await page.evaluate(() => window.goTo(33));
  assert((await page.locator('.slide.active .tile').count()) === 3, 'Eskalation overview shows 3-step overview');
  await page.evaluate(() => window.goTo(36)); // Schritt 2 / Lernkurve, ja/nein toggle
  await page.click('.choice[data-toggle="esk_verb_ja"]');
  assert(await page.locator('.choice[data-toggle="esk_verb_ja"]').evaluate(el => el.classList.contains('on')), 'esk ja toggled on');
  await page.click('.choice[data-toggle="esk_verb_nein"]');
  assert(await page.locator('.choice[data-toggle="esk_verb_nein"]').evaluate(el => el.classList.contains('on')), 'esk nein toggled on');
  assert(!(await page.locator('.choice[data-toggle="esk_verb_ja"]').evaluate(el => el.classList.contains('on'))), 'esk ja/nein are mutually exclusive (ja turned off when nein selected)');
  await page.evaluate(() => window.goTo(37)); // Schritt 3 + Checkliste
  assert((await page.locator('.slide.active .checks .choice').count()) === 10, 'Eskalation final slide has 10-item checklist');

  // ---- Trennungs-Leitfaden (5 subpages, slides 38-42) ----
  await page.evaluate(() => window.goTo(42));
  assert((await page.locator('.slide.active .checks .choice').count()) === 7, 'Trennung protocol slide has 7 checks');
  const trText = await page.locator('.slide.active').innerText();
  assert(trText.includes('ersetzen keine individuelle Rechtsberatung'), 'general disclaimer repeated on Trennung final slide');
  await page.evaluate(() => window.goTo(38));
  assert((await page.locator('.slide.active').innerText()).includes('§ 622 Abs. 3 BGB'), 'BGB reference present on Trennung leitplanke slide');

  // ---- Reload persistence ----
  await page.reload();
  assert((await page.locator('#empCount').textContent()) === '20', 'employees persisted after reload');
  await page.evaluate(() => window.goTo(6));
  assert((await page.locator('.tile:has-text("Anna Testperson") .tileSubtitle').textContent()) === 'Teamleitung Vertrieb — Vertrieb', 'position/Abteilung persisted after reload');
  await page.evaluate(() => window.goTo(21));
  const perspVal = await page.inputValue('textarea[data-field="m3_perspektive"]');
  assert(perspVal === 'positiv', 'Tag90 field persisted after reload: got "' + perspVal + '"');
  await page.evaluate(() => window.goTo(32));
  assert(await page.locator('.choice[data-toggle="buddy_chk1"]').evaluate(el => el.classList.contains('on')), 'buddy checklist choice persisted after reload');
  await page.evaluate(() => window.goTo(36));
  assert(await page.locator('.choice[data-toggle="esk_verb_nein"]').evaluate(el => el.classList.contains('on')), 'escalation ja/nein choice persisted after reload');

  // ---- Team report ----
  await page.evaluate(() => window.goTo(43));
  const teamRows = await page.locator('#teamTableBody tr').count();
  assert(teamRows >= 1, 'team report has rows: ' + teamRows);
  const cntMA = await page.locator('#cntTeamMA').textContent();
  assert(Number(cntMA) === 20, 'team report employee count = 20: got ' + cntMA);

  // ---- Legal disclaimers present ----
  await page.evaluate(() => window.goTo(2));
  assert((await page.locator('.slide.active .note').textContent()).includes('keine individuelle Rechtsberatung'), 'general legal disclaimer on slide 2 (Für wen)');

  // ---- Color theme picker ----
  await page.click('.themeTrigger');
  assert(await page.locator('#themeModal').evaluate(el => el.classList.contains('open')), 'theme modal opens');
  assert((await page.locator('.themeSwatch').count()) === 10, 'exactly 10 theme swatches rendered');
  const getVars = () => page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return { ci: cs.getPropertyValue('--ci').trim(), pagebg: cs.getPropertyValue('--pagebg').trim(), paper: cs.getPropertyValue('--paper').trim() };
  });
  const before = await getVars();
  await page.locator('.themeSwatch').nth(2).click();
  const after = await getVars();
  assert(after.ci !== before.ci, 'picking a swatch changes --ci: ' + before.ci + ' -> ' + after.ci);
  assert(after.pagebg !== before.pagebg, 'picking a swatch changes --pagebg (page background): ' + before.pagebg + ' -> ' + after.pagebg);
  const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  assert(bodyBg !== 'rgb(235, 232, 227)', 'body background actually repaints on screen: ' + bodyBg);
  await page.click('.dialog button:has-text("Schließen")');
  await page.reload();
  const reloaded = await getVars();
  assert(reloaded.ci === after.ci && reloaded.pagebg === after.pagebg, 'theme choice (incl. background) persists after reload: ' + JSON.stringify(reloaded));

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
