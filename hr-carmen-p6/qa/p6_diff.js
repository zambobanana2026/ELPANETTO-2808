const { chromium } = require('playwright');
const path = require('path');

const ORIG = 'file://' + path.resolve(__dirname, '..', 'reference', 'P6_V3.html');
const NEW = 'file://' + path.resolve(__dirname, '..', 'release', 'P6_Schwierige_Mitarbeitergespraeche.html');

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(async () => chromium.launch());
  const page = await browser.newPage();

  async function extractAll(url) {
    await page.goto(url);
    return page.evaluate(() => {
      const out = {};
      document.querySelectorAll('.slide').forEach(s => {
        // normalize: strip whitespace runs, ignore data-field current value (empty anyway)
        out[s.dataset.slide] = s.innerText.replace(/\s+/g, '');
      });
      return out;
    });
  }

  const orig = await extractAll(ORIG);
  const neu = await extractAll(NEW);

  const allSlides = new Set([...Object.keys(orig), ...Object.keys(neu)]);
  let diffCount = 0;
  [...allSlides].map(Number).sort((a, b) => a - b).forEach(n => {
    const o = orig[n] || '<<MISSING IN ORIGINAL>>';
    const nn = neu[n] || '<<MISSING IN NEW BUILD>>';
    if (o !== nn) {
      diffCount++;
      console.log('=== DIFF on slide ' + n + ' ===');
      console.log('ORIG: ' + o.slice(0, 400));
      console.log('NEW : ' + nn.slice(0, 400));
      console.log();
    }
  });
  console.log(diffCount === 0 ? 'NO TEXT DIFFERENCES ACROSS ALL SLIDES' : (diffCount + ' slides differ'));
  await browser.close();
  process.exit(diffCount === 0 ? 0 : 1);
})();
