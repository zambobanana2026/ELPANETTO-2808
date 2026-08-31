'use strict';
/* ============================================================================
   CARMEN NEXT — products/p6.config.js
   P6 „Schwierige Mitarbeitergespräche" — Produkt-Konfiguration für den Motor.

   Inhalte kommen ausschließlich aus content/cards_p6.json (maschinenlesbar,
   echter extrahierter/redigierter Text aus reference/P6_V3.html — siehe
   docs/CARMEN_NEXT_HANDOFF.md für den Kontext zu Gesprächskarte 8 "Lob", die dort
   ergänzt wurde). Slides 1–6 und 47–51 sind Marketing-/Rahmentext ohne
   Karten-Datenbezug und liegen als statische Fragmente in products/p6/.

   P6 nutzt das situative Karten-Auswahl-Muster: 8 Karten × 5 Unterseiten
   (Vorbereitung / Ziel & Einstieg / Im Gespräch / Vereinbarung / Follow-up).
   Storage/Navigation/Mitarbeiterverwaltung kommen komplett aus motor/engine.js.
   ============================================================================ */

const FIRST_CARD_SLIDE = 8;
const SLIDES_PER_CARD = 5;
const SUBTITLES = ['VORBEREITUNG', 'ZIEL &amp; EINSTIEG', 'IM GESPRÄCH', 'VEREINBARUNG', 'FOLLOW-UP'];

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
  });
}
function pad2(n) { return String(n).padStart(2, '0'); }
function ctxbar() { return '<div class="ctxbar">AKTIVER MITARBEITER: <b id="ctxName">— keiner ausgewählt —</b></div>'; }
function navBar(nextLabel) {
  return '<div class="nav"><button class="btn alt homeBtn" onclick="goTo(7)">◂ Übersicht</button>' +
    '<button class="btn alt" onclick="prevSlide()">Zurück</button>' +
    '<button class="btn" onclick="nextSlide()">' + nextLabel + '</button></div>';
}

function slidePrep(card, num) {
  const checksHtml = card.checks.map(function (c, i) {
    return '<div class="choice" data-toggle="k' + card.n + '_chk' + (i + 1) + '" onclick="toggleChoice(this)">' + esc(c) + '</div>';
  }).join('');
  const prepHtml = card.prep.map(function (p, i) {
    return '<div class="weeklyCheckCard"><label>' + esc(p.toUpperCase()) + '</label>' +
      '<textarea data-field="k' + card.n + '_f' + (i + 1) + '" placeholder="Kurz eintragen …"></textarea></div>';
  }).join('');
  return (
    '<section class="slide" data-slide="' + num + '"><div class="brand">P6 / GESPRÄCHSKARTE ' + card.n + ' · 1/5 ' + SUBTITLES[0] + '</div><div class="num">' + pad2(num) + '</div>' + ctxbar() +
    '<h1>' + esc(card.title.toUpperCase()) + '</h1>' +
    '<h2>PASST DIESE GESPRÄCHSKARTE?</h2>' +
    '<div class="checks">' + checksHtml + '</div>' +
    '<div class="note">' + esc(card.hinweis) + '</div>' +
    '<div class="weeklyCheck"><div class="weeklyCheckIntro"><b>5-MINUTEN-VORBEREITUNG.</b></div>' +
    '<div class="weeklyCheckGrid">' + prepHtml + '</div></div>' +
    navBar('Weiter') +
    '</section>'
  );
}

function slideZielEinstieg(card, num) {
  const fragenHtml = card.fragen.map(function (f) { return '<li>„' + esc(f) + '“</li>'; }).join('');
  return (
    '<section class="slide" data-slide="' + num + '"><div class="brand">P6 / GESPRÄCHSKARTE ' + card.n + ' · 2/5 ' + SUBTITLES[1] + '</div><div class="num">' + pad2(num) + '</div>' + ctxbar() +
    '<h1>' + esc(card.title.toUpperCase()) + '</h1>' +
    '<div class="box"><b>MEIN GESPRÄCHSZIEL.</b><p class="lead" style="margin:10px 0 0">„' + esc(card.ziel) + '“</p></div>' +
    '<div class="box"><b>DER ERSTE SATZ.</b><p class="lead" style="margin:10px 0 0">„' + esc(card.satz) + '“</p></div>' +
    '<h2>DIE WICHTIGSTEN FRAGEN.</h2>' +
    '<ol class="qlist">' + fragenHtml + '</ol>' +
    navBar('Weiter') +
    '</section>'
  );
}

function slideImGespraech(card, num) {
  const qaHtml = card.reaktionen.map(function (pair) {
    return '<div class="qa"><b>„' + esc(pair[0]) + '“</b><p>' + esc(pair[1]) + '</p></div>';
  }).join('');
  const compareHtml = card.compare.map(function (pair) {
    return '<div class="compareRow"><div class="no">„' + esc(pair[0]) + '“</div><div class="yes">„' + esc(pair[1]) + '“</div></div>';
  }).join('');
  return (
    '<section class="slide" data-slide="' + num + '"><div class="brand">P6 / GESPRÄCHSKARTE ' + card.n + ' · 3/5 ' + SUBTITLES[2] + '</div><div class="num">' + pad2(num) + '</div>' + ctxbar() +
    '<h1>' + esc(card.title.toUpperCase()) + '</h1>' +
    '<h2>TYPISCHE REAKTIONEN — UND MEINE ANTWORT.</h2>' +
    qaHtml +
    '<h2>SAG DAS NICHT — SAG LIEBER DAS.</h2>' +
    '<div class="compareHead"><span>Nicht sagen</span><span>Besser sagen</span></div>' +
    compareHtml +
    '<div class="box"><b>MINI-BEISPIEL AUS DER PRAXIS.</b>' +
    '<p style="margin:10px 0 4px"><b>Situation:</b> ' + esc(card.beispiel.sit) + '</p>' +
    '<p style="margin:4px 0"><span style="color:var(--red);font-weight:800">Nicht:</span> „' + esc(card.beispiel.nicht) + '“</p>' +
    '<p style="margin:4px 0 0"><span style="color:var(--green);font-weight:800">Besser:</span> „' + esc(card.beispiel.besser) + '“</p></div>' +
    navBar('Weiter') +
    '</section>'
  );
}

function slideVereinbarung(card, num) {
  const fields = [
    ['MASSNAHME', 'massnahme', 'Was wird konkret vereinbart? …'],
    ['VERANTWORTLICH &amp; TERMIN', 'verantw', 'Wer setzt es bis wann um? …'],
    ['WORAN ERKENNEN WIR ERFOLG?', 'erf', 'Beobachtbares Kriterium …'],
    ['WELCHE UNTERSTÜTZUNG IST VEREINBART?', 'unt', 'Unterstützung eintragen …'],
    ['WAS TUN WIR, WENN EIN HINDERNIS AUFTRITT?', 'hindernis', 'Plan B …'],
    ['ZUSAMMENFASSUNG, DIE BEIDE SEITEN VERSTANDEN HABEN', 'zsf', 'In eigenen Worten zusammengefasst …']
  ];
  const fieldsHtml = fields.map(function (f) {
    return '<div class="weeklyCheckCard"><label>' + f[0] + '</label>' +
      '<textarea data-field="k' + card.n + '_' + f[1] + '" placeholder="' + f[2] + '"></textarea></div>';
  }).join('');
  return (
    '<section class="slide" data-slide="' + num + '"><div class="brand">P6 / GESPRÄCHSKARTE ' + card.n + ' · 4/5 ' + SUBTITLES[3] + '</div><div class="num">' + pad2(num) + '</div>' + ctxbar() +
    '<h1>' + esc(card.title.toUpperCase()) + '</h1>' +
    '<p class="lead">Nach Carmens Vorlage „Maßnahmenvereinbarung“.</p>' +
    '<div class="weeklyCheck"><div class="weeklyCheckIntro"><b>MASSNAHMENVEREINBARUNG.</b></div>' +
    '<div class="weeklyCheckGrid">' + fieldsHtml + '</div></div>' +
    navBar('Weiter') +
    '</section>'
  );
}

function slideFollowUp(card, num, isLast) {
  const fields = [
    ['WAS WURDE UMGESETZT? WAS HAT SICH VERBESSERT?', 'fu1', 'Stand seit dem Gespräch …'],
    ['WAS IST NOCH OFFEN? WELCHE HINDERNISSE BESTEHEN?', 'fu2', 'Offene Punkte …'],
    ['WELCHE UNTERSTÜTZUNG WIRD JETZT BENÖTIGT? NÄCHSTER SCHRITT?', 'fu3', 'Nächster Schritt …'],
    ['WANN PRÜFEN WIR ERNEUT?', 'fu4', 'Termin für die nächste Prüfung …']
  ];
  const fieldsHtml = fields.map(function (f) {
    return '<div class="weeklyCheckCard"><label>' + f[0] + '</label>' +
      '<textarea data-field="k' + card.n + '_' + f[1] + '" placeholder="' + f[2] + '"></textarea></div>';
  }).join('');
  const rechtshinweis = card.rechtshinweis
    ? '<div class="note" style="border-left-color:var(--red)"><b>RECHTLICHER HINWEIS.</b><br>' + esc(card.rechtshinweis) + '</div>'
    : '';
  return (
    '<section class="slide" data-slide="' + num + '"><div class="brand">P6 / GESPRÄCHSKARTE ' + card.n + ' · 5/5 ' + SUBTITLES[4] + '</div><div class="num">' + pad2(num) + '</div>' + ctxbar() +
    '<h1>' + esc(card.title.toUpperCase()) + '</h1>' +
    '<p class="lead">Nach Carmens Vorlage „Follow-up“ — für den vereinbarten Prüftermin.</p>' +
    '<div class="weeklyCheck"><div class="weeklyCheckIntro"><b>FOLLOW-UP-PRÜFUNG.</b></div>' +
    '<div class="weeklyCheckGrid">' + fieldsHtml + '</div></div>' +
    '<div class="note" style="border-left-color:#c99a2e"><b>ACHTUNG.</b><br>' + esc(card.achtung) + '</div>' +
    rechtshinweis +
    navBar(isLast ? 'Weiter zur Bibliothek' : 'Nächste Gesprächskarte') +
    '</section>'
  );
}

function buildCardSlides(cards) {
  const out = [];
  cards.forEach(function (card, i) {
    const base = FIRST_CARD_SLIDE + i * SLIDES_PER_CARD;
    const isLast = i === cards.length - 1;
    out.push(slidePrep(card, base));
    out.push(slideZielEinstieg(card, base + 1));
    out.push(slideImGespraech(card, base + 2));
    out.push(slideVereinbarung(card, base + 3));
    out.push(slideFollowUp(card, base + 4, isLast));
  });
  return out.join('\n');
}

// Field-id groups needed by the team report (mirrors the original V3 prototype).
function cardFieldMeta(cards) {
  return cards.map(function (card) {
    const prepFieldIds = card.prep.map(function (_, i) { return 'k' + card.n + '_f' + (i + 1); });
    return { n: card.n, title: card.title, prepFieldIds: prepFieldIds, docFieldId: 'k' + card.n + '_massnahme' };
  });
}

const initScript = function (cards) {
  const meta = cardFieldMeta(cards);
  return (
    'const CARD_META = ' + JSON.stringify(meta) + ';\n' +
    'const store = MotorEngine.createStore("p6_data_v2", function(){ return { employees:{}, employeeOrder:[], activeEmployeeId:null, byEmployee:{}, choices:{} }; });\n' +
    'const manager = MotorEngine.createEmployeeManager({\n' +
    '  store: store,\n' +
    '  license: { maxEmployees: 20 },\n' +
    '  gridSelector: "#empGrid",\n' +
    '  countSelector: "#empCount",\n' +
    '  limitNoteSelector: "#empLimitNote",\n' +
    '  ctxNameSelector: "#ctxName",\n' +
    '  removeFnName: "removeEmployee",\n' +
    '  onChange: function(){ restoreFieldsForActive(); },\n' +
    '  tileLabel: function(bucket){\n' +
    '    let docCount = 0;\n' +
    '    CARD_META.forEach(function(c){ if((bucket.fields[c.docFieldId]||"").trim()) docCount++; });\n' +
    '    return docCount + " von " + CARD_META.length + " Gespräche dokumentiert";\n' +
    '  }\n' +
    '});\n' +
    'const choices = MotorEngine.createChoices(store);\n' +
    'const theme = MotorEngine.createColorThemes(MotorEngine.DEFAULT_THEMES, "p6_theme_v1");\n' +
    'const nav = MotorEngine.createNav();\n' +
    '\n' +
    'function openThemeModal(){ theme.renderSwatches("#themeSwatches"); MotorEngine.openModal("themeModal"); }\n' +
    'function closeThemeModal(){ MotorEngine.closeModal("themeModal"); }\n' +
    'function goTo(n){ nav.goTo(n); }\n' +
    'function nextSlide(){ nav.next(); }\n' +
    'function prevSlide(){ nav.prev(); }\n' +
    'function toggleChoice(el){ choices.toggle(el); }\n' +
    'function openEmpModal(){\n' +
    '  if(manager.isFull()){ const note=document.getElementById("empLimitNote"); if(note) note.style.display="block"; return; }\n' +
    '  document.getElementById("empNameInput").value = "";\n' +
    '  MotorEngine.openModal("empModal");\n' +
    '  document.getElementById("empNameInput").focus();\n' +
    '}\n' +
    'function closeEmpModal(){ MotorEngine.closeModal("empModal"); }\n' +
    'function confirmAddEmployee(){\n' +
    '  const name = document.getElementById("empNameInput").value;\n' +
    '  const id = manager.add(name);\n' +
    '  if(id){ closeEmpModal(); }\n' +
    '  else if((name||"").trim()){ closeEmpModal(); const note=document.getElementById("empLimitNote"); if(note) note.style.display="block"; }\n' +
    '}\n' +
    'function removeEmployee(id, ev){ manager.remove(id, ev); }\n' +
    'function restoreFieldsForActive(){ MotorEngine.restoreFields(manager); }\n' +
    '\n' +
    'nav.onEnter(50, function(){\n' +
    '  MotorEngine.renderTeamReport({\n' +
    '    manager: manager,\n' +
    '    tbodySelector: "#teamTableBody",\n' +
    '    emptyHtml: \'<tr><td colspan="3" style="color:#999">Noch keine Mitarbeitenden angelegt.</td></tr>\',\n' +
    '    totalsSelectors: ["#cntTeamVorbereitet", "#cntTeamDokumentiert", "#cntTeamMA"],\n' +
    '    rowFn: function(emp, bucket){\n' +
    '      let prep = 0, doc = 0;\n' +
    '      CARD_META.forEach(function(c){\n' +
    '        const prepFilled = c.prepFieldIds.some(function(f){ return (bucket.fields[f]||"").trim().length>0; });\n' +
    '        const docFilled = (bucket.fields[c.docFieldId]||"").trim().length>0;\n' +
    '        if(prepFilled) prep++;\n' +
    '        if(docFilled) doc++;\n' +
    '      });\n' +
    '      return {\n' +
    '        html: "<tr><td>" + MotorEngine.escapeHtml(emp.name) + "</td><td>" + prep + " / " + CARD_META.length + "</td><td>" + doc + " / " + CARD_META.length + "</td></tr>",\n' +
    '        counts: [prep, doc]\n' +
    '      };\n' +
    '    }\n' +
    '  });\n' +
    '});\n' +
    '\n' +
    'document.addEventListener("DOMContentLoaded", function(){\n' +
    '  theme.init();\n' +
    '  manager.render();\n' +
    '  choices.bindAll();\n' +
    '  MotorEngine.bindFields(store, manager);\n' +
    '  restoreFieldsForActive();\n' +
    '});\n'
  );
};

module.exports = {
  id: 'p6',
  title: 'P6 – Schwierige Mitarbeitergespräche',
  outputFile: 'P6_Schwierige_Mitarbeitergespraeche.html',
  cardsFile: '../content/cards_p6.json',
  introFile: './p6/intro.slides.html',
  outroFile: './p6/outro.slides.html',
  buildCardSlides: buildCardSlides,
  initScript: initScript
};
