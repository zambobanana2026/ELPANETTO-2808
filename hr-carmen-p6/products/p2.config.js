'use strict';
/* ============================================================================
   CARMEN NEXT — products/p2.config.js
   P2 „Onboarding-Prozessbundle" — Produkt-Konfiguration für den Motor.

   Inhalte kommen ausschließlich aus content/cards_p2.json, extrahiert aus
   dem Original-PDF „Onboarding-Prozessbundle.pdf" (handoff/source, siehe
   docs/CARMEN_NEXT_HANDOFF.md). Anders als P6 gab es für P2 noch KEINEN
   geprüften Interaktions-Prototyp — dies ist die erste interaktive Fassung.
   Design-Entscheidungen, die dabei getroffen wurden, stehen in docs/STATUS.md.

   P2 nutzt ein drittes Interaktions-Muster (weder P1s Wochen-Ampel-Zyklus
   noch P6s situative Kartenauswahl): eine chronologische Meilenstein-Linie
   (Tag 30 → 60 → 90 → 150–170) plus drei begleitende Werkzeuge (Buddy,
   Eskalationsprotokoll, Trennungs-Leitfaden). Deshalb sind die Slides —
   anders als bei P6 — sequentiell verkettet (jedes "Weiter" führt zur
   nächsten Station), nicht nur über die Übersicht erreichbar.
   ============================================================================ */

const FIRST_MILESTONE_SLIDE = 7;
const BUDDY_SLIDE = 11;
const ESKALATION_SLIDE_1 = 12;
const ESKALATION_SLIDE_2 = 13;
const TRENNUNG_SLIDE = 14;
const TEAMBERICHT_SLIDE = 15;

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
  });
}
function pad2(n) { return String(n).padStart(2, '0'); }
function ctxbar() { return '<div class="ctxbar">AKTIVER MITARBEITER: <b id="ctxName">— keiner ausgewählt —</b></div>'; }
function navBar(nextLabel) {
  return '<div class="nav"><button class="btn alt homeBtn" onclick="goTo(6)">◂ Übersicht</button>' +
    '<button class="btn alt" onclick="prevSlide()">Zurück</button>' +
    '<button class="btn" onclick="nextSlide()">' + nextLabel + '</button></div>';
}
function fieldsGrid(prefix, fields) {
  return '<div class="weeklyCheckGrid">' + fields.map(function (f) {
    return '<div class="weeklyCheckCard"><label>' + esc(f[0]) + '</label>' +
      '<textarea data-field="' + prefix + '_' + f[1] + '" placeholder="' + esc(f[2]) + '"></textarea></div>';
  }).join('') + '</div>';
}
function checksList(prefix, items) {
  return '<div class="checks">' + items.map(function (c, i) {
    return '<div class="choice" data-toggle="' + prefix + (i + 1) + '" onclick="toggleChoice(this)">' + esc(c) + '</div>';
  }).join('') + '</div>';
}

function slideOverview(data) {
  const phaseTiles = data.phases.map(function (p) {
    const targetSlide = FIRST_MILESTONE_SLIDE + p.n - 1;
    return '<div class="tile" style="cursor:pointer" onclick="goTo(' + targetSlide + ')">' +
      '<b>' + esc(p.zeitraum) + ' — ' + esc(p.phase.toUpperCase()) + '</b>' +
      '<small>' + esc(p.fokus) + '<br><b style="color:var(--ci)">Meilenstein:</b> ' + esc(p.meilenstein) + '</small></div>';
  }).join('');
  const toolTiles = [
    ['KMU-BUDDY-FRAMEWORK', 'Kultureller Wegweiser für die ersten vier bis sechs Wochen.', BUDDY_SLIDE],
    ['WENN ES HAKT — ESKALATIONSPROTOKOLL', 'Bei sichtbarer Leistungslücke: 14-Tage-Eskalationsprotokoll.', ESKALATION_SLIDE_1],
    ['TRENNUNGS-LEITFADEN', '10-Minuten-Protokoll für den Fall einer Trennung.', TRENNUNG_SLIDE]
  ].map(function (t) {
    return '<div class="tile" style="cursor:pointer" onclick="goTo(' + t[2] + ')"><b>' + t[0] + '</b><small>' + t[1] + '</small></div>';
  }).join('');
  return (
    '<section class="slide" data-slide="6"><div class="brand">P2 / ÜBERSICHT</div><div class="num">06</div>' +
    '<h1>IHR<br>PROBEZEIT-RADAR.</h1>' +
    '<p class="lead">Tag 1 → Tag 30 → Tag 60 → Tag 90 → Tag 150–170 → Ende der Probezeit. Klicken Sie eine Phase oder ein Werkzeug an, oder gehen Sie der Reihe nach vor.</p>' +
    '<div class="grid">' + phaseTiles + '</div>' +
    '<h2>WEITERE WERKZEUGE.</h2>' +
    '<div class="grid">' + toolTiles + '</div>' +
    navBar('Weiter') +
    '</section>'
  );
}

function slideMilestone(m, num) {
  const fokusBox = m.fokus ? '<div class="box"><b>FOKUS.</b><p class="lead" style="margin:10px 0 0">' + esc(m.fokus) + '</p></div>' : '';
  const frageBox = m.frage ? '<div class="box"><b>' + esc((m.frageLabel || 'FRAGE').toUpperCase()) + '.</b><p class="lead" style="margin:10px 0 0">„' + esc(m.frage) + '“</p></div>' : '';
  const zweckBox = m.zweck ? '<div class="box"><b>ZWECK.</b><p class="lead" style="margin:10px 0 0">' + esc(m.zweck) + '</p></div>' : '';
  return (
    '<section class="slide" data-slide="' + num + '"><div class="brand">P2 / ' + esc(m.zeitpunkt) + ' · GESPRÄCH ' + m.n + '/4</div><div class="num">' + pad2(num) + '</div>' + ctxbar() +
    '<h1>' + esc(m.title.toUpperCase()) + '</h1>' +
    fokusBox + frageBox + zweckBox +
    '<div class="box"><b>MEIN GESPRÄCHSZIEL.</b><p class="lead" style="margin:10px 0 0">„' + esc(m.ziel) + '“</p></div>' +
    '<div class="weeklyCheck"><div class="weeklyCheckIntro"><b>ARBEITSFELDER.</b></div>' + fieldsGrid('m' + m.n, m.fields) + '</div>' +
    navBar('Weiter') +
    '</section>'
  );
}

function slideBuddy(b) {
  const taktungHtml = b.taktung.map(function (t) { return t[0] + ': ' + t[1]; }).join(' · ');
  return (
    '<section class="slide" data-slide="' + BUDDY_SLIDE + '"><div class="brand">P2 / BUDDY-FRAMEWORK</div><div class="num">' + pad2(BUDDY_SLIDE) + '</div>' + ctxbar() +
    '<h1>KMU-BUDDY-<br>FRAMEWORK.</h1>' +
    '<div class="box"><b>ROLLE DES BUDDYS.</b><p class="lead" style="margin:10px 0 0">' + esc(b.rolle) + '</p></div>' +
    '<div class="box"><b>DAUER &amp; TAKTUNG.</b><p style="margin:10px 0 0">' + esc(b.dauer) + ' — ' + esc(taktungHtml) + '</p></div>' +
    '<h2>AUFGABEN &amp; GRENZEN.</h2>' +
    checksList('buddy_chk', b.checks) +
    '<div class="weeklyCheck"><div class="weeklyCheckIntro"><b>ARBEITSFELDER.</b></div>' + fieldsGrid('buddy', b.fields) + '</div>' +
    navBar('Weiter') +
    '</section>'
  );
}

function slideEskalation1(e) {
  return (
    '<section class="slide" data-slide="' + ESKALATION_SLIDE_1 + '"><div class="brand">P2 / ESKALATIONSPROTOKOLL · 1/2 ABLAUF</div><div class="num">' + pad2(ESKALATION_SLIDE_1) + '</div>' + ctxbar() +
    '<h1>WENN ES HAKT.<br>14-TAGE-ESKALATIONSPROTOKOLL.</h1>' +
    '<p class="lead">' + esc(e.intro) + '</p>' +
    '<div class="note"><b>GRUNDSATZ.</b><br>„' + esc(e.grundsatz) + '“<br><br><b>SCHLÜSSELFRAGE.</b><br>„' + esc(e.schluesselfrage) + '“</div>' +
    '<h2>DIE 10 SCHRITTE.</h2>' +
    checksList('esk_step', e.steps) +
    navBar('Weiter') +
    '</section>'
  );
}

function slideEskalation2(e) {
  return (
    '<section class="slide" data-slide="' + ESKALATION_SLIDE_2 + '"><div class="brand">P2 / ESKALATIONSPROTOKOLL · 2/2 DOKUMENTATION</div><div class="num">' + pad2(ESKALATION_SLIDE_2) + '</div>' + ctxbar() +
    '<h1>WENN ES HAKT.<br>14-TAGE-ESKALATIONSPROTOKOLL.</h1>' +
    '<div class="weeklyCheck"><div class="weeklyCheckIntro"><b>DOKUMENTATION.</b></div>' + fieldsGrid('esk', e.fields) + '</div>' +
    '<div class="note" style="border-left-color:#c99a2e"><b>ACHTUNG.</b><br>Kein Vorwurf und keine emotionalen Phrasen. ' + esc(e.rechtshinweis) + '</div>' +
    navBar('Weiter') +
    '</section>'
  );
}

function slideTrennung(t, rechtlicherHinweisAllgemein) {
  const ablaufHtml = t.ablauf.map(function (a) {
    let inner = '<b>' + esc(a.titel) + '</b>';
    if (a.hinweis) inner += '<p>' + esc(a.hinweis) + '</p>';
    if (a.formulierung) inner += '<p>„' + esc(a.formulierung) + '“</p>';
    if (a.punkte) inner += '<ul class="qlist">' + a.punkte.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>';
    return '<div class="qa">' + inner + '</div>';
  }).join('');
  return (
    '<section class="slide" data-slide="' + TRENNUNG_SLIDE + '"><div class="brand">P2 / TRENNUNGS-LEITFADEN</div><div class="num">' + pad2(TRENNUNG_SLIDE) + '</div>' + ctxbar() +
    '<h1>TRENNUNGS-LEITFADEN.<br>10-MINUTEN-PROTOKOLL.</h1>' +
    '<div class="note" style="border-left-color:var(--red)"><b>RECHTLICHE LEITPLANKE.</b><br>' + esc(t.rechtlicheLeitplanke) + '</div>' +
    '<div class="box"><b>VIER-AUGEN-PRINZIP.</b><p style="margin:10px 0 0">' + esc(t.vierAugen) + '</p></div>' +
    '<div class="box"><b>GESPRÄCHSDAUER.</b><p style="margin:10px 0 0">' + esc(t.dauer) + '</p></div>' +
    '<h2>ABLAUF.</h2>' +
    ablaufHtml +
    checksList('tr_chk', t.checks) +
    '<div class="weeklyCheck"><div class="weeklyCheckIntro"><b>ARBEITSFELDER.</b></div>' + fieldsGrid('tr', t.fields) + '</div>' +
    '<div class="note" style="border-left-color:var(--red)"><b>RECHTLICHER HINWEIS.</b><br>' + esc(rechtlicherHinweisAllgemein) + '</div>' +
    navBar('Weiter') +
    '</section>'
  );
}

function slideTeamBericht() {
  return (
    '<section class="slide" data-slide="' + TEAMBERICHT_SLIDE + '"><div class="brand">P2 / TEAM-BERICHT</div><div class="num">' + pad2(TEAMBERICHT_SLIDE) + '</div>' +
    '<h1>IHR TEAM.<br>AUF EINEN BLICK.</h1>' +
    '<p class="lead">Übersicht über alle angelegten Mitarbeitenden und den Stand ihrer vier Kernkonversationen (Tag 30, 60, 90, 150–170).</p>' +
    '<div class="bigCounts">' +
    '<div><strong id="cntTeamVorbereitet">0</strong><small>GESPRÄCHE VORBEREITET</small></div>' +
    '<div><strong id="cntTeamDokumentiert">0</strong><small>GESPRÄCHE DOKUMENTIERT</small></div>' +
    '<div><strong id="cntTeamMA">0</strong><small>MITARBEITENDE ANGELEGT</small></div>' +
    '</div>' +
    '<table class="teamTable"><thead><tr><th>MITARBEITER</th><th>VORBEREITET</th><th>DOKUMENTIERT</th></tr></thead><tbody id="teamTableBody"></tbody></table>' +
    '<button class="pdfBtn" onclick="window.print()">🖨 ALS PDF DRUCKEN</button>' +
    navBar('Weiter') +
    '</section>'
  );
}

function buildCardSlides(data) {
  const out = [slideOverview(data)];
  data.milestones.forEach(function (m, i) {
    out.push(slideMilestone(m, FIRST_MILESTONE_SLIDE + i));
  });
  out.push(slideBuddy(data.buddy));
  out.push(slideEskalation1(data.eskalation));
  out.push(slideEskalation2(data.eskalation));
  out.push(slideTrennung(data.trennung, data.rechtlicherHinweisAllgemein));
  out.push(slideTeamBericht());
  return out.join('\n');
}

function cardFieldMeta(data) {
  return data.milestones.map(function (m) {
    const prepFieldIds = m.fields.map(function (f) { return 'm' + m.n + '_' + f[1]; });
    return { n: m.n, title: m.title, prepFieldIds: prepFieldIds, docFieldId: 'm' + m.n + '_' + m.docFieldId };
  });
}

const initScript = function (data) {
  const meta = cardFieldMeta(data);
  return (
    'const CARD_META = ' + JSON.stringify(meta) + ';\n' +
    'const store = MotorEngine.createStore("p2_data_v1", function(){ return { employees:{}, employeeOrder:[], activeEmployeeId:null, byEmployee:{}, choices:{} }; });\n' +
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
    '    return docCount + " von " + CARD_META.length + " Kernkonversationen dokumentiert";\n' +
    '  },\n' +
    '  tileSubtitle: function(emp){\n' +
    '    return [emp.position, emp.abteilung].filter(function(v){ return (v||"").trim(); }).join(" — ");\n' +
    '  }\n' +
    '});\n' +
    'const choices = MotorEngine.createChoices(store);\n' +
    'const theme = MotorEngine.createColorThemes(MotorEngine.DEFAULT_THEMES, "p2_theme_v1");\n' +
    'const nav = MotorEngine.createNav();\n' +
    '\n' +
    'function goTo(n){ nav.goTo(n); }\n' +
    'function nextSlide(){ nav.next(); }\n' +
    'function prevSlide(){ nav.prev(); }\n' +
    'function toggleChoice(el){ choices.toggle(el); }\n' +
    'function openThemeModal(){ theme.renderSwatches("#themeSwatches"); MotorEngine.openModal("themeModal"); }\n' +
    'function closeThemeModal(){ MotorEngine.closeModal("themeModal"); }\n' +
    'function openEmpModal(){\n' +
    '  if(manager.isFull()){ const note=document.getElementById("empLimitNote"); if(note) note.style.display="block"; return; }\n' +
    '  document.getElementById("empNameInput").value = "";\n' +
    '  document.getElementById("empPositionInput").value = "";\n' +
    '  document.getElementById("empAbteilungInput").value = "";\n' +
    '  MotorEngine.openModal("empModal");\n' +
    '  document.getElementById("empNameInput").focus();\n' +
    '}\n' +
    'function closeEmpModal(){ MotorEngine.closeModal("empModal"); }\n' +
    'function confirmAddEmployee(){\n' +
    '  const name = document.getElementById("empNameInput").value;\n' +
    '  const position = document.getElementById("empPositionInput").value.trim();\n' +
    '  const abteilung = document.getElementById("empAbteilungInput").value.trim();\n' +
    '  const id = manager.add(name, { position: position, abteilung: abteilung });\n' +
    '  if(id){ closeEmpModal(); }\n' +
    '  else if((name||"").trim()){ closeEmpModal(); const note=document.getElementById("empLimitNote"); if(note) note.style.display="block"; }\n' +
    '}\n' +
    'function removeEmployee(id, ev){ manager.remove(id, ev); }\n' +
    'function restoreFieldsForActive(){ MotorEngine.restoreFields(manager); }\n' +
    '\n' +
    'nav.onEnter(' + TEAMBERICHT_SLIDE + ', function(){\n' +
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
  id: 'p2',
  title: 'P2 – Onboarding-Prozessbundle',
  outputFile: 'P2_Onboarding-Prozessbundle.html',
  cardsFile: '../content/cards_p2.json',
  introFile: './p2/intro.slides.html',
  outroFile: './p2/outro.slides.html',
  buildCardSlides: buildCardSlides,
  initScript: initScript
};
