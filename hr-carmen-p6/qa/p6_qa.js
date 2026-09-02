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
  assert((await page.locator('.slide.active').getAttribute('data-slide')) === '1', 'starts on slide 1 (Willkommen)');

  // ---- Gesprächs-Zusammenfassung: empty state (no employee selected yet) ----
  await page.evaluate(() => window.goTo(52));
  assert((await page.locator('.slide.active .summaryEmpty').count()) === 1, 'summary shows empty-state box when no employee is active');
  assert((await page.locator('.slide.active .summaryCard').count()) === 0, 'summary shows no cards when no employee is active');
  await page.evaluate(() => window.goTo(1));

  // Navigate slides 1 -> 8 (intro: Willkommen, Für wen, Hero, So funktioniert's, System,
  // Mitarbeiter, So geht's weiter, Übersicht)
  for (let i = 0; i < 7; i++) {
    await page.click('.slide.active .nav button.btn:not(.alt)');
  }
  assert((await page.locator('.slide.active').getAttribute('data-slide')) === '8', 'reached slide 8 (overview) after 7 clicks');
  await page.click('.slide.active .nav button.btn.alt:has-text("Zurück")');
  assert((await page.locator('.slide.active').getAttribute('data-slide')) === '7', 'back-nav works, on slide 7 (so geht\'s weiter)');
  await page.click('.slide.active .nav button.btn.alt:has-text("Zurück")');
  assert((await page.locator('.slide.active').getAttribute('data-slide')) === '6', 'back-nav works again, on slide 6 (employees)');

  // ---- Employee CRUD + license limit ----
  async function addEmployee(name, position, abteilung) {
    await page.click('button:has-text("MITARBEITER HINZUFÜGEN")');
    await page.fill('#empNameInput', name);
    if (position) await page.fill('#empPositionInput', position);
    if (abteilung) await page.fill('#empAbteilungInput', abteilung);
    await page.click('.dialog button:has-text("Hinzufügen")');
  }
  await addEmployee('Anna Testperson', 'Teamleitung Vertrieb', 'Vertrieb Nord');
  await addEmployee('Ben Testperson');
  assert((await page.locator('#empCount').textContent()) === '2', 'employee count = 2 after adding two');
  assert(await page.locator('.tile.activeEmp b').textContent() === 'Ben Testperson', 'last-added employee is active');
  assert((await page.locator('.tile:has-text("Anna Testperson") .tileSubtitle').textContent()) === 'Teamleitung Vertrieb — Vertrieb Nord', 'Anna tile shows position — Abteilung');
  assert((await page.locator('.tile:has-text("Ben Testperson") .tileSubtitle').count()) === 0, 'Ben tile has no subtitle (fields left blank)');

  // Data separation: fill a field for Ben on card 1 prep slide, switch to Anna, verify empty, switch back verify persisted
  await page.click('.tile:has-text("Anna Testperson")');
  assert(await page.locator('.tile.activeEmp b').textContent() === 'Anna Testperson', 'can switch active employee by click');

  // jump straight to card 1 prep slide (slide 9) via goTo
  await page.evaluate(() => window.goTo(9));
  assert((await page.locator('.slide.active').getAttribute('data-slide')) === '9', 'card 1 slide 9 reached via goTo');

  await page.fill('textarea[data-field="k1_f1"]', 'Anna-Notiz');
  await page.evaluate(() => window.goTo(6)); // employees
  await page.click('.tile:has-text("Ben Testperson")');
  await page.evaluate(() => window.goTo(9));
  const benValue = await page.inputValue('textarea[data-field="k1_f1"]');
  assert(benValue === '', 'field is empty for Ben (data not leaked from Anna): got "' + benValue + '"');
  await page.fill('textarea[data-field="k1_f1"]', 'Ben-Notiz');
  await page.evaluate(() => window.goTo(6));
  await page.click('.tile:has-text("Anna Testperson")');
  await page.evaluate(() => window.goTo(9));
  const annaValue = await page.inputValue('textarea[data-field="k1_f1"]');
  assert(annaValue === 'Anna-Notiz', 'Anna field restored correctly after switching back: got "' + annaValue + '"');

  // Choice toggle persistence
  await page.click('.choice[data-toggle="k1_chk1"]');
  assert(await page.locator('.choice[data-toggle="k1_chk1"]').evaluate(el => el.classList.contains('on')), 'choice toggled on');

  // ---- License limit: add up to 20 total, then verify 21st blocked ----
  await page.evaluate(() => window.goTo(6)); // employees
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
  await page.evaluate(() => window.goTo(6));
  await addEmployee('PersistCheck');
  await page.evaluate(() => window.goTo(9));
  await page.fill('textarea[data-field="k1_f1"]', 'Reload-Test-Wert');
  await page.reload();
  assert((await page.locator('#empCount').textContent()) !== null, 'page reloaded');
  const empCountAfterReload = await page.locator('#empCount').textContent();
  assert(empCountAfterReload === '1', 'employee persisted after reload: count=' + empCountAfterReload);
  await page.evaluate(() => window.goTo(6));
  await page.click('.tile:has-text("PersistCheck")');
  await page.evaluate(() => window.goTo(9));
  const reloadedValue = await page.inputValue('textarea[data-field="k1_f1"]');
  assert(reloadedValue === 'Reload-Test-Wert', 'field value persisted after reload: got "' + reloadedValue + '"');

  // ---- Full navigation, verify last-card forwarding ----
  // Slides 1-8 are sequential via "Weiter" (Willkommen, Für wen, Hero, So funktioniert's,
  // System, Mitarbeiter, So geht's weiter, Übersicht). Slide 8's "Weiter zur Bibliothek" is
  // an intentional skip straight to slide 49 (the overview is entered via its 8 card tiles,
  // not sequential "Weiter"). Slides 9-54 are sequential.
  await page.goto(FILE_URL);
  const expectedBrand = { 2: 'FÜR WEN', 3: 'GESPRÄCHS-TOOLBOX', 4: "SO FUNKTIONIERT'S", 7: "SO GEHT'S WEITER" };
  for (let n = 1; n <= 8; n++) {
    const activeSlide = await page.locator('.slide.active').getAttribute('data-slide');
    assert(activeSlide === String(n), 'sequential nav at slide ' + n + ' matches (got ' + activeSlide + ')');
    if (expectedBrand[n]) {
      const brandText = await page.locator('.slide.active .brand').textContent();
      assert(brandText.includes(expectedBrand[n]), 'slide ' + n + ' has expected content after reorder: ' + brandText);
    }
    if (n < 8) await page.click('.slide.active .nav button.btn:not(.alt)');
  }
  // Follow-up (5/5) slides end each card without an auto-advance "Weiter" button —
  // the user chooses explicitly (Zusammenfassung/PDF, Mitarbeiterwahl, Bibliothek, or
  // Übersicht/Zurück) instead of being carried straight into the next Gesprächskarte.
  const followUpSlides = new Set([13, 18, 23, 28, 33, 38, 43, 48]);
  await page.evaluate(() => window.goTo(9));
  for (let n = 9; n <= 54; n++) {
    const activeSlide = await page.locator('.slide.active').getAttribute('data-slide');
    assert(activeSlide === String(n), 'sequential nav at slide ' + n + ' matches (got ' + activeSlide + ')');
    if (n < 54) {
      if (followUpSlides.has(n)) {
        assert((await page.locator('.slide.active .nav button.btn:not(.alt)').count()) === 0, 'follow-up slide ' + n + ' has no auto-advance "Weiter" button');
        assert((await page.locator('.slide.active .tile:has-text("ZUSAMMENFASSUNG")').count()) === 1, 'follow-up slide ' + n + ' offers a Zusammenfassung-Kachel');
        assert((await page.locator('.slide.active .tile:has-text("MITARBEITERWAHL")').count()) === 1, 'follow-up slide ' + n + ' offers a Mitarbeiterwahl-Kachel');
        assert((await page.locator('.slide.active .tile:has-text("BIBLIOTHEK")').count()) === 1, 'follow-up slide ' + n + ' offers a Bibliothek-Kachel');
        await page.evaluate((next) => window.goTo(next), n + 1);
      } else {
        await page.click('.slide.active .nav button.btn:not(.alt)');
      }
    }
  }
  // last slide has no next button (just <span></span>), verify homeBtn "Von vorn" works
  await page.click('.slide.active .nav .homeBtn');
  assert((await page.locator('.slide.active').getAttribute('data-slide')) === '1', '"Von vorn" returns to slide 1');

  // ---- Follow-up end-of-card options actually navigate correctly (card 1, slide 13) ----
  await page.evaluate(() => window.goTo(13));
  await page.click('.slide.active .tile:has-text("ZUSAMMENFASSUNG")');
  assert((await page.locator('.slide.active').getAttribute('data-slide')) === '52', '"Zusammenfassung & PDF"-Kachel navigiert zur Zusammenfassungs-Slide (52)');

  await page.evaluate(() => window.goTo(13));
  await page.click('.slide.active .tile:has-text("MITARBEITERWAHL")');
  assert((await page.locator('.slide.active').getAttribute('data-slide')) === '6', '"Zur Mitarbeiterwahl"-Kachel navigiert zur Mitarbeiter-Slide (6)');

  await page.evaluate(() => window.goTo(13));
  await page.click('.slide.active .tile:has-text("BIBLIOTHEK")');
  assert((await page.locator('.slide.active').getAttribute('data-slide')) === '49', '"Zur Formulierungs-Bibliothek"-Kachel navigiert zu Slide 49');

  await page.evaluate(() => window.goTo(13));
  await page.click('.slide.active .nav .homeBtn');
  assert((await page.locator('.slide.active').getAttribute('data-slide')) === '8', 'Follow-up-Slide: "◂ Übersicht" führt weiterhin zur Kartenübersicht (8)');

  await page.evaluate(() => window.goTo(13));
  await page.click('.slide.active .nav button.btn.alt:has-text("Zurück")');
  assert((await page.locator('.slide.active').getAttribute('data-slide')) === '12', 'Follow-up-Slide: "Zurück" führt weiterhin zur Vereinbarung-Slide (12)');

  // ---- Team report slide populates ----
  await page.evaluate(() => window.goTo(6));
  await addEmployee('ReportPerson');
  await page.evaluate(() => window.goTo(9));
  await page.fill('textarea[data-field="k1_f1"]', 'x');
  await page.evaluate(() => window.goTo(12)); // Vereinbarung sub-slide holds k1_massnahme
  await page.fill('textarea[data-field="k1_massnahme"]', 'y');
  await page.evaluate(() => window.goTo(51));
  const teamRows = await page.locator('#teamTableBody tr').count();
  assert(teamRows >= 1, 'team report table has rows: ' + teamRows);
  const cntMA = await page.locator('#cntTeamMA').textContent();
  assert(Number(cntMA) >= 1, 'team report employee count > 0: ' + cntMA);

  // ---- Gesprächs-Zusammenfassung shows the just-entered data for the active employee ----
  // ReportPerson (added above) is the active employee at this point, with k1_f1="x" and
  // k1_massnahme="y" — exactly one documented Gesprächskarte, nothing else.
  await page.click('.slide.active button:has-text("Einzel-Zusammenfassung")');
  assert((await page.locator('.slide.active').getAttribute('data-slide')) === '52', 'Team-Bericht link navigates to the summary slide (52)');
  const summaryMetaText = await page.locator('.slide.active .summaryMeta').textContent();
  assert(summaryMetaText.includes('ReportPerson'), 'summary header shows the active employee\'s name: ' + summaryMetaText);
  assert((await page.locator('.slide.active .summaryCard').count()) === 1, 'summary shows exactly one documented Gesprächskarte');
  const summaryCardText = await page.locator('.slide.active .summaryCard').first().textContent();
  assert(summaryCardText.includes('GESPRÄCHSKARTE 1'), 'summary card is labelled with the correct Gesprächskarte: ' + summaryCardText);
  assert(summaryCardText.includes('VORBEREITUNG') && summaryCardText.includes('x'), 'summary shows the entered Vorbereitung value');
  assert(summaryCardText.includes('VEREINBARUNG') && summaryCardText.includes('y'), 'summary shows the entered Vereinbarung value');
  assert((await page.locator('.slide.active .pdfBtn').count()) === 1, 'summary slide has an "Als PDF drucken" button');

  // ---- Print output shows only the active slide, not the whole 54-slide product ----
  await page.emulateMedia({ media: 'print' });
  const printVisible = await page.$$eval('.slide', els => els.filter(el => getComputedStyle(el).display !== 'none').length);
  assert(printVisible === 1, 'print media shows exactly one slide (the active one), not the whole product: ' + printVisible);
  const pdfBtnVisible = await page.$$eval('.pdfBtn', els => els.some(el => getComputedStyle(el).display !== 'none'));
  assert(!pdfBtnVisible, '"Als PDF drucken" button itself is hidden in the printed output');
  await page.emulateMedia({ media: 'screen' });

  // ---- rechtlicher Hinweis legal disclaimer present (slide 2, "Für wen") ----
  await page.evaluate(() => window.goTo(2));
  const legalText = await page.locator('.slide.active .note').textContent();
  assert(legalText.includes('keine individuelle Rechtsberatung'), 'legal disclaimer present on slide 2');

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

  // ---- Heading + subheading centered (.headCenter) on a regular slide ----
  await page.evaluate(() => window.goTo(3));
  const h1Align = await page.locator('.slide.active h1').evaluate(el => getComputedStyle(el).textAlign);
  const leadAlign = await page.locator('.slide.active .lead').first().evaluate(el => getComputedStyle(el).textAlign);
  assert(h1Align === 'center', 'heading is centered on slide 3 (headCenter): got ' + h1Align);
  assert(leadAlign === 'center', 'subheading (.lead) is centered on slide 3 (headCenter): got ' + leadAlign);

  // ---- "So geht's weiter" bridge slide (7, between Mitarbeiter and Übersicht) ----
  await page.evaluate(() => window.goTo(7));
  assert(await page.locator('.slide.active .videoPlaceholder').count() === 1, 'bridge slide 7 has a video placeholder');
  const bridgeH1Align = await page.locator('.slide.active h1').evaluate(el => getComputedStyle(el).textAlign);
  assert(bridgeH1Align === 'center', 'bridge slide 7 heading is centered: got ' + bridgeH1Align);

  // ---- Welcome slide content (video placeholder, problem/solution tiles) ----
  await page.evaluate(() => window.goTo(1));
  assert(await page.locator('.slide.active .videoPlaceholder').count() === 1, 'welcome slide has a 9:16 video placeholder');
  assert((await page.locator('.slide.active .tile:has-text("DAS PROBLEM.")').count()) === 1, 'welcome slide has a "Das Problem" tile');
  assert((await page.locator('.slide.active .tile:has-text("DIE LÖSUNG.")').count()) === 1, 'welcome slide has a "Die Lösung" tile');

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
