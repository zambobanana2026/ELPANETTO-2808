#!/usr/bin/env node
'use strict';
/* ============================================================================
   CARMEN NEXT — build/build.js
   Fügt motor/ + products/<id>.config.js zu einer einzigen, autarken
   HTML-Datei pro Produkt zusammen (release/*.html). Keine externen
   Abhängigkeiten zur Laufzeit — Käufer laden eine Datei herunter und öffnen
   sie offline im Browser.

   Aufruf: node build/build.js [productId]   (Standard: p6)
   ============================================================================ */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const productId = process.argv[2] || 'p6';

function buildProduct(id) {
  const config = require(path.join(ROOT, 'products', id + '.config.js'));

  const engineCss = fs.readFileSync(path.join(ROOT, 'motor', 'engine.css'), 'utf8');
  const engineJs = fs.readFileSync(path.join(ROOT, 'motor', 'engine.js'), 'utf8');
  const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'products', config.cardsFile), 'utf8'));
  const introHtml = fs.readFileSync(path.join(ROOT, 'products', config.introFile), 'utf8');
  const outroHtml = fs.readFileSync(path.join(ROOT, 'products', config.outroFile), 'utf8');
  const cardSlidesHtml = config.buildCardSlides(cards);
  const initScript = config.initScript(cards);

  const html =
    '<!doctype html>\n' +
    '<html lang="de">\n' +
    '<head>\n' +
    '<meta charset="utf-8">\n' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">\n' +
    '<title>' + config.title + '</title>\n' +
    '<style>\n' + engineCss + '\n</style>\n' +
    '</head>\n' +
    '<body><div id="app">\n\n' +
    introHtml.trim() + '\n' +
    cardSlidesHtml + '\n' +
    outroHtml.trim() + '\n' +
    '\n</div>\n\n' +
    '<script>\n' + engineJs + '\n' + initScript + '\n</script>\n\n' +
    '</html>\n';

  // The first slide must start active — the intro fragment's slide 1 already
  // carries class="slide active".
  fs.mkdirSync(path.join(ROOT, 'release'), { recursive: true });
  const outPath = path.join(ROOT, 'release', config.outputFile);
  fs.writeFileSync(outPath, html, 'utf8');
  console.log('Built ' + outPath + ' (' + (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1) + ' KB)');
  return outPath;
}

if (require.main === module) {
  buildProduct(productId);
}

module.exports = { buildProduct };
