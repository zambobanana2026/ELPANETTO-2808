const { chromium } = require('playwright');
const path = require('path');

const FILE_URL = 'file://' + path.resolve(__dirname, '..', 'release', 'P2_Onboarding-Prozessbundle.html');

function assert(cond, msg) {
  if (!cond) throw new Error('FAIL: ' + msg);
  console.log('OK: ' + msg);
}

(async () => {
  const browser = await chromium.launch();
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

  async function addEmployee(name, position, abteilung) {
    await page.click('button:has-text("MITARBEITER HINZUFÜGEN")');
    await page.fill('#empNameInput', name);
    if (position) await page.fill('#empPositionInput', position);
    if (abteilung) await page.fill('#empAbteilungInput', abteilung);
    await page.click('.dialog button:has-text("Hinzufügen")');
  }

  // ---- Full sequential navigation 1 -> 16 ----
  for (let n = 1; n <= 16; n++) {
    const activeSlide = await page.locator('.slide.active').getAttribute('data-slide');
    assert(activeSlide === String(n), 'sequential nav at slide ' + n + ' matches (got ' + activeSlide + ')');
    if (n < 16) await page.click('.slide.active .nav button.btn:not(.alt)');
  }
  await page.click('.slide.active .nav .homeBtn'); // "Von vorn"
  assert((await page.locator('.slide.active').getAttribute('data-slide')) === '1', '"Von vorn" returns to slide 1');

  // ---- Employees + data separation ----
  await page.evaluate(() => window.goTo(5));
  await addEmployee('Anna Testperson', 'Teamleitung Vertrieb', 'Vertrieb');
  await addEmployee('Ben Testperson');
  assert((await page.locator('#empCount').textContent()) === '2', 'employee count = 2');
  assert(await page.locator('.tile.activeEmp b').textContent() === 'Ben Testperson', 'last-added employee is active');
  assert((await page.locator('.tile:has-text("Anna Testperson") .tileSubtitle').textContent()) === 'Teamleitung Vertrieb — Vertrieb', 'Anna tile shows position — Abteilung');
  assert((await page.locator('.tile:has-text("Ben Testperson") .tileSubtitle').count()) === 0, 'Ben tile has no subtitle (fields left blank)');

  await page.evaluate(() => window.goTo(7)); // Tag 30 card
  await page.fill('textarea[data-field="m1_dok"]', 'Ben-Notiz');
  await page.evaluate(() => window.goTo(5));
  await page.click('.tile:has-text("Anna Testperson")');
  await page.evaluate(() => window.goTo(7));
  const annaValue = await page.inputValue('textarea[data-field="m1_dok"]');
  assert(annaValue === '', 'field empty for Anna (no leak from Ben): got "' + annaValue + '"');
  await page.fill('textarea[data-field="m1_dok"]', 'Anna-Notiz');
  await page.evaluate(() => window.goTo(5));
  await page.click('.tile:has-text("Ben Testperson")');
  await page.evaluate(() => window.goTo(7));
  const benValue = await page.inputValue('textarea[data-field="m1_dok"]');
  assert(benValue === 'Ben-Notiz', 'Ben field restored correctly: got "' + benValue + '"');

  // ---- License limit ----
  await page.evaluate(() => window.goTo(5));
  for (let i = 3; i <= 20; i++) await addEmployee('MA ' + i);
  assert((await page.locator('#empCount').textContent()) === '20', 'employee count capped at 20');
  await page.click('button:has-text("MITARBEITER HINZUFÜGEN")');
  assert(await page.locator('#empLimitNote').isVisible(), 'license-limit note visible for 21st employee');
  assert(!(await page.locator('#empModal').evaluate(el => el.classList.contains('open'))), 'modal blocked for 21st employee');

  // ---- Choice toggles across all three checklist areas (Buddy, Eskalation, Trennung) ----
  await page.evaluate(() => window.goTo(11));
  await page.click('.choice[data-toggle="buddy_chk1"]');
  assert(await page.locator('.choice[data-toggle="buddy_chk1"]').evaluate(el => el.classList.contains('on')), 'buddy choice toggled on');
  await page.evaluate(() => window.goTo(12));
  assert((await page.locator('.slide.active .checks .choice').count()) === 10, 'escalation slide 12 has 10 step-checks');
  await page.click('.choice[data-toggle="esk_step1"]');
  await page.evaluate(() => window.goTo(14));
  assert((await page.locator('.slide.active .checks .choice').count()) === 7, 'Trennung slide has 7 checks');

  // ---- Milestone 3 (Tag 90) structured fields ----
  await page.evaluate(() => window.goTo(9));
  assert((await page.locator('.slide.active textarea[data-field]').count()) === 7, 'Tag 90 card has 7 fields (Fach/Selbst/Teamfit/Kultur/Perspektive/Teilnehmer/Next)');
  await page.fill('textarea[data-field="m3_perspektive"]', 'positiv');

  // ---- Reload persistence ----
  await page.reload();
  assert((await page.locator('#empCount').textContent()) === '20', 'employees persisted after reload');
  await page.evaluate(() => window.goTo(5));
  assert((await page.locator('.tile:has-text("Anna Testperson") .tileSubtitle').textContent()) === 'Teamleitung Vertrieb — Vertrieb', 'position/Abteilung persisted after reload');
  await page.evaluate(() => window.goTo(9));
  const perspVal = await page.inputValue('textarea[data-field="m3_perspektive"]');
  assert(perspVal === 'positiv', 'Tag90 field persisted after reload: got "' + perspVal + '"');
  await page.evaluate(() => window.goTo(12));
  assert(await page.locator('.choice[data-toggle="esk_step1"]').evaluate(el => el.classList.contains('on')), 'escalation choice persisted after reload');

  // ---- Team report ----
  await page.evaluate(() => window.goTo(15));
  const teamRows = await page.locator('#teamTableBody tr').count();
  assert(teamRows >= 1, 'team report has rows: ' + teamRows);
  const cntMA = await page.locator('#cntTeamMA').textContent();
  assert(Number(cntMA) === 20, 'team report employee count = 20: got ' + cntMA);

  // ---- Legal disclaimers present ----
  await page.evaluate(() => window.goTo(3));
  assert((await page.locator('.slide.active .note').textContent()).includes('keine individuelle Rechtsberatung'), 'general legal disclaimer on slide 3');
  await page.evaluate(() => window.goTo(14));
  const trText = await page.locator('.slide.active').innerText();
  assert(trText.includes('§ 622 Abs. 3 BGB'), 'BGB reference present on Trennung slide');
  assert(trText.includes('ersetzen keine individuelle Rechtsberatung'), 'general disclaimer repeated on Trennung slide');

  // ---- Color theme picker ----
  await page.click('.themeTrigger');
  assert(await page.locator('#themeModal').evaluate(el => el.classList.contains('open')), 'theme modal opens');
  assert((await page.locator('.themeSwatch').count()) === 10, 'exactly 10 theme swatches rendered');
  const defaultCi = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--ci').trim());
  await page.locator('.themeSwatch').nth(2).click();
  const pickedCi = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--ci').trim());
  assert(pickedCi !== defaultCi, 'picking a swatch changes --ci: ' + defaultCi + ' -> ' + pickedCi);
  await page.click('.dialog button:has-text("Schließen")');
  await page.reload();
  const reloadedCi = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--ci').trim());
  assert(reloadedCi === pickedCi, 'theme choice persists after reload: ' + reloadedCi);

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
