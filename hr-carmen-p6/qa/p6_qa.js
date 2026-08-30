const { chromium } = require('playwright');
const path = require('path');

const FILE_URL = 'file://' + path.resolve(__dirname, '..', 'release', 'P6_Schwierige_Mitarbeitergespraeche.html');

function assert(cond, msg) {
  if (!cond) throw new Error('FAIL: ' + msg);
  console.log('OK: ' + msg);
}

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium/chrome-linux/chrome' }).catch(async () => chromium.launch());
  const consoleErrors = [];
  const pageErrors = [];

  // ---- Desktop pass ----
  let context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  let page = await context.newPage();
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => pageErrors.push(String(err)));
  page.on('dialog', async dialog => { await dialog.accept(); });

  await page.goto(FILE_URL);
  assert(await page.locator('.slide.active').count() === 1, 'exactly one active slide on load');
  assert((await page.locator('.slide.active').getAttribute('data-slide')) === '1', 'starts on slide 1');

  // Navigate slides 1 -> 6 (intro) to reach employee slide
  for (let i = 0; i < 5; i++) {
    await page.click('.slide.active .nav button.btn:not(.alt)');
  }
  assert((await page.locator('.slide.active').getAttribute('data-slide')) === '6', 'reached slide 6 (overview) after 5 clicks');
  await page.click('.slide.active .nav button.btn.alt:has-text("Zurück")');
  assert((await page.locator('.slide.active').getAttribute('data-slide')) === '5', 'back-nav works, on slide 5 (employees)');

  // ---- Employee CRUD + license limit ----
  async function addEmployee(name) {
    await page.click('button:has-text("MITARBEITER HINZUFÜGEN")');
    await page.fill('#empNameInput', name);
    await page.click('.dialog button:has-text("Hinzufügen")');
  }
  await addEmployee('Anna Testperson');
  await addEmployee('Ben Testperson');
  assert((await page.locator('#empCount').textContent()) === '2', 'employee count = 2 after adding two');
  assert(await page.locator('.tile.activeEmp b').textContent() === 'Ben Testperson', 'last-added employee is active');

  // Data separation: fill a field for Ben on card 1 prep slide, switch to Anna, verify empty, switch back verify persisted
  await page.click('.tile:has-text("Anna Testperson")');
  assert(await page.locator('.tile.activeEmp b').textContent() === 'Anna Testperson', 'can switch active employee by click');

  // jump straight to card 1 prep slide (slide 7) via goTo
  await page.evaluate(() => window.goTo(7));
  assert((await page.locator('.slide.active').getAttribute('data-slide')) === '7', 'card 1 slide 7 reached via goTo');

  await page.fill('textarea[data-field="k1_f1"]', 'Anna-Notiz');
  await page.evaluate(() => window.goTo(5)); // employees
  await page.click('.tile:has-text("Ben Testperson")');
  await page.evaluate(() => window.goTo(7));
  const benValue = await page.inputValue('textarea[data-field="k1_f1"]');
  assert(benValue === '', 'field is empty for Ben (data not leaked from Anna): got "' + benValue + '"');
  await page.fill('textarea[data-field="k1_f1"]', 'Ben-Notiz');
  await page.evaluate(() => window.goTo(5));
  await page.click('.tile:has-text("Anna Testperson")');
  await page.evaluate(() => window.goTo(7));
  const annaValue = await page.inputValue('textarea[data-field="k1_f1"]');
  assert(annaValue === 'Anna-Notiz', 'Anna field restored correctly after switching back: got "' + annaValue + '"');

  // Choice toggle persistence
  await page.click('.choice[data-toggle="k1_chk1"]');
  assert(await page.locator('.choice[data-toggle="k1_chk1"]').evaluate(el => el.classList.contains('on')), 'choice toggled on');

  // ---- License limit: add up to 20 total, then verify 21st blocked ----
  await page.evaluate(() => window.goTo(5)); // employees
  for (let i = 3; i <= 20; i++) {
    await addEmployee('MA ' + i);
  }
  assert((await page.locator('#empCount').textContent()) === '20', 'employee count capped display = 20');
  await page.click('button:has-text("MITARBEITER HINZUFÜGEN")');
  const limitVisible = await page.locator('#empLimitNote').isVisible();
  assert(limitVisible, 'license-limit note visible when trying to add 21st employee');
  const modalOpen = await page.locator('#empModal').evaluate(el => el.classList.contains('open'));
  assert(!modalOpen, 'modal did not open for 21st employee (blocked before opening)');

  // remove one employee, verify count decreases and confirm dialog handled
  await page.click('.tile:has-text("MA 20") .rm');
  assert((await page.locator('#empCount').textContent()) === '19', 'employee count = 19 after removal');

  await context.close();

  // ---- Reload persistence (new context sharing storage via same file:// origin is per-context in Chromium for file://,
  //      so we reuse the SAME context/page for reload to properly test localStorage persistence) ----
  context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  page = await context.newPage();
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => pageErrors.push(String(err)));
  page.on('dialog', async dialog => { await dialog.accept(); });
  await page.goto(FILE_URL);
  await page.evaluate(() => window.goTo(5));
  await addEmployee('PersistCheck');
  await page.evaluate(() => window.goTo(7));
  await page.fill('textarea[data-field="k1_f1"]', 'Reload-Test-Wert');
  await page.reload();
  assert((await page.locator('#empCount').textContent()) !== null, 'page reloaded');
  const empCountAfterReload = await page.locator('#empCount').textContent();
  assert(empCountAfterReload === '1', 'employee persisted after reload: count=' + empCountAfterReload);
  await page.evaluate(() => window.goTo(5));
  await page.click('.tile:has-text("PersistCheck")');
  await page.evaluate(() => window.goTo(7));
  const reloadedValue = await page.inputValue('textarea[data-field="k1_f1"]');
  assert(reloadedValue === 'Reload-Test-Wert', 'field value persisted after reload: got "' + reloadedValue + '"');

  // ---- Full navigation, verify last-card forwarding ----
  // Slides 1-6 are sequential via "Weiter". Slide 6's "Weiter zur Bibliothek" is an
  // intentional skip straight to slide 47 (matches the original prototype: the overview
  // is entered via its 8 card tiles, not sequential "Weiter"). Slides 7-51 are sequential.
  await page.goto(FILE_URL);
  for (let n = 1; n <= 6; n++) {
    const activeSlide = await page.locator('.slide.active').getAttribute('data-slide');
    assert(activeSlide === String(n), 'sequential nav at slide ' + n + ' matches (got ' + activeSlide + ')');
    if (n < 6) await page.click('.slide.active .nav button.btn:not(.alt)');
  }
  await page.evaluate(() => window.goTo(7));
  for (let n = 7; n <= 51; n++) {
    const activeSlide = await page.locator('.slide.active').getAttribute('data-slide');
    assert(activeSlide === String(n), 'sequential nav at slide ' + n + ' matches (got ' + activeSlide + ')');
    if (n < 51) {
      const nextBtn = page.locator('.slide.active .nav button.btn:not(.alt)');
      await nextBtn.click();
    }
  }
  // last slide has no next button (just <span></span>), verify homeBtn "Von vorn" works
  await page.click('.slide.active .nav .homeBtn');
  assert((await page.locator('.slide.active').getAttribute('data-slide')) === '1', '"Von vorn" returns to slide 1');

  // Verify card-8 (last card) follow-up slide (46) says "Weiter zur Bibliothek" and slide47 is Bibliothek
  await page.evaluate(() => window.goTo(46));
  const lastCardBtnText = await page.locator('.slide.active .nav button.btn:not(.alt)').textContent();
  assert(lastCardBtnText.includes('Bibliothek'), 'card 8 follow-up next-button says "Weiter zur Bibliothek": got "' + lastCardBtnText + '"');
  await page.click('.slide.active .nav button.btn:not(.alt)');
  assert((await page.locator('.slide.active').getAttribute('data-slide')) === '47', 'card 8 forwards correctly to slide 47 (Bibliothek)');

  // Verify card 1 (non-last) follow-up slide (11) says "Nächste Gesprächskarte" and forwards to slide 12
  await page.evaluate(() => window.goTo(11));
  const firstCardBtnText = await page.locator('.slide.active .nav button.btn:not(.alt)').textContent();
  assert(firstCardBtnText.includes('Nächste Gesprächskarte'), 'card 1 follow-up next-button says "Nächste Gesprächskarte": got "' + firstCardBtnText + '"');
  await page.click('.slide.active .nav button.btn:not(.alt)');
  assert((await page.locator('.slide.active').getAttribute('data-slide')) === '12', 'card 1 forwards correctly to slide 12 (card 2)');

  // ---- Team report slide populates ----
  await page.evaluate(() => window.goTo(5));
  await addEmployee('ReportPerson');
  await page.evaluate(() => window.goTo(7));
  await page.fill('textarea[data-field="k1_f1"]', 'x');
  await page.evaluate(() => window.goTo(10)); // Vereinbarung sub-slide holds k1_massnahme
  await page.fill('textarea[data-field="k1_massnahme"]', 'y');
  await page.evaluate(() => window.goTo(49));
  const teamRows = await page.locator('#teamTableBody tr').count();
  assert(teamRows >= 1, 'team report table has rows: ' + teamRows);
  const cntMA = await page.locator('#cntTeamMA').textContent();
  assert(Number(cntMA) >= 1, 'team report employee count > 0: ' + cntMA);

  // ---- rechtlicher Hinweis legal disclaimer present (slide 3) ----
  await page.evaluate(() => window.goTo(3));
  const legalText = await page.locator('.slide.active .note').textContent();
  assert(legalText.includes('keine individuelle Rechtsberatung'), 'legal disclaimer present on slide 3');

  // ---- Color theme picker ----
  await page.click('.themeTrigger');
  assert(await page.locator('#themeModal').evaluate(el => el.classList.contains('open')), 'theme modal opens');
  assert((await page.locator('.themeSwatch').count()) === 10, 'exactly 10 theme swatches rendered');
  const getVars = () => page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return { ci: cs.getPropertyValue('--ci').trim(), pagebg: cs.getPropertyValue('--pagebg').trim(), paper: cs.getPropertyValue('--paper').trim(), surface: cs.getPropertyValue('--surface').trim(), ink: cs.getPropertyValue('--ink').trim() };
  });
  const before = await getVars();
  await page.locator('.themeSwatch').nth(2).click(); // pick 3rd preset (Bordeaux)
  const after = await getVars();
  assert(after.ci !== before.ci, 'picking a swatch changes --ci: ' + before.ci + ' -> ' + after.ci);
  assert(after.pagebg !== before.pagebg, 'picking a swatch changes --pagebg (page background): ' + before.pagebg + ' -> ' + after.pagebg);
  assert(after.paper !== before.paper, 'picking a swatch changes --paper (slide background): ' + before.paper + ' -> ' + after.paper);
  const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  assert(bodyBg !== 'rgb(235, 232, 227)', 'body background actually repaints on screen: ' + bodyBg);
  await page.click('.dialog button:has-text("Schließen")');
  assert(!(await page.locator('#themeModal').evaluate(el => el.classList.contains('open'))), 'theme modal closes');
  await page.reload();
  const reloaded = await getVars();
  assert(reloaded.ci === after.ci && reloaded.pagebg === after.pagebg, 'theme choice (incl. background) persists after reload: ' + JSON.stringify(reloaded));

  // Dark preset (Anthrazit, last swatch): verify ink flips light-on-dark, not just accent
  await page.click('.themeTrigger');
  await page.locator('.themeSwatch').nth(9).click();
  const dark = await getVars();
  assert(dark.pagebg === '#181818', 'dark preset sets a genuinely dark page background: ' + dark.pagebg);
  assert(dark.ink === '#f0efec', 'dark preset flips text to a light color for contrast: ' + dark.ink);
  await page.click('.dialog button:has-text("Schließen")');
  // reset to default for the rest of the run
  await page.click('.themeTrigger');
  await page.locator('.themeSwatch').nth(0).click();
  await page.click('.dialog button:has-text("Schließen")');

  // ---- Mobile viewport ----
  await context.close();
  context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  page = await context.newPage();
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => pageErrors.push(String(err)));
  await page.goto(FILE_URL);
  const navBox = await page.locator('.slide.active .nav').boundingBox();
  const viewportH = 844;
  assert(navBox && navBox.y + navBox.height >= viewportH - 5, 'mobile nav is pinned near bottom (fixed): y+h=' + (navBox.y + navBox.height));
  const navBg = await page.locator('.slide.active .nav').evaluate(el => getComputedStyle(el).backgroundColor);
  assert(navBg !== 'rgba(0, 0, 0, 0)' && navBg !== 'transparent', 'mobile nav has non-transparent background (no bleed-through): ' + navBg);

  await context.close();

  console.log('\n=== console errors:', consoleErrors.length);
  consoleErrors.forEach(e => console.log('  console.error:', e));
  console.log('=== page errors:', pageErrors.length);
  pageErrors.forEach(e => console.log('  pageerror:', e));

  await browser.close();

  if (consoleErrors.length || pageErrors.length) {
    console.log('\nFAILED: console/page errors present');
    process.exit(1);
  }
  console.log('\nALL CHECKS PASSED');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
