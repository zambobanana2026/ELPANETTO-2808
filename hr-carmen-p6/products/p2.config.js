'use strict';
/* ============================================================================
   CARMEN NEXT — products/p2.config.js
   P2 „Onboarding-Prozessbundle" — Produkt-Konfiguration für den Motor.

   Inhalte kommen aus content/cards_p2.json, extrahiert aus dem Original-PDF
   „Onboarding-Prozessbundle.pdf" (reference/p2-source, siehe docs/STATUS.md).

   P2 nutzt ein drittes Interaktions-Muster (weder P1s Wochen-Ampel-Zyklus
   noch P6s situative Kartenauswahl): eine chronologische Meilenstein-Linie
   (Tag 30 → 60 → 90 → 150–170) plus drei begleitende Werkzeuge (Buddy,
   Eskalationsprotokoll, Trennungs-Leitfaden). Die Slides sind sequentiell
   verkettet (jedes "Weiter" führt zur nächsten Station).

   Jede der vier Meilenstein-Stationen sowie Buddy/Eskalation/Trennung sind
   analog zu P6 in 5 Unterseiten aufgeteilt (ein Thema pro Seite). Für die
   4 Meilensteine liefert das Quell-PDF ausschließlich Prozess-/Checklisten-
   Inhalt, keine Gesprächsskripte wie bei P6. Die Seite "Im Gespräch" (3/5)
   je Meilenstein — typische Mitarbeiter-Reaktionen + Vergleichstabelle —
   wurde deshalb, mit Martin abgestimmt, von Carmen Next ergänzt statt aus
   dem Original übernommen (gleicher Sonderfall wie P6-Karte 8 "Lob", siehe
   docs/STATUS.md). Alle übrigen Inhalte (Buddy/Eskalation/Trennung sowie
   die Vorbereitungs-/Vereinbarungs-Seiten der Meilensteine) sind wörtlich
   bzw. sachlich unverändert aus dem PDF.
   ============================================================================ */

const FIRST_MILESTONE_SLIDE = 7;
const SLIDES_PER_MILESTONE = 6;
const BUDDY_FIRST_SLIDE = 31;
const SLIDES_PER_BUDDY = 5;
const ESKALATION_FIRST_SLIDE = 36;
const SLIDES_PER_ESKALATION = 5;
const TRENNUNG_FIRST_SLIDE = 41;
const SLIDES_PER_TRENNUNG = 5;
const TEAMBERICHT_SLIDE = 46;

const MILESTONE_SUBTITLES = ['VORBEREITUNG', 'ZIEL & EINSTIEG', 'TYPISCHE REAKTIONEN', 'BESSER SAGEN', 'VEREINBARUNG', 'FOLLOW-UP'];
const BUDDY_SUBTITLES = ['ROLLE', 'DAUER & TAKTUNG', 'AUFGABEN', 'GRENZEN & TABUS', 'ARBEITSVORLAGE'];
const ESKALATION_SUBTITLES = ['WANN GREIFT DAS?', 'SCHRITT 1 · FAKTENABGLEICH', 'ZWISCHENZIEL', 'SCHRITT 2 · LERNKURVE', 'SCHRITT 3 · ENTSCHEIDUNG'];
const TRENNUNG_SUBTITLES = ['LEITPLANKE', 'SCHRITT 1', 'SCHRITT 2', 'SCHRITT 3', 'PROTOKOLL'];

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
  });
}
function pad2(n) { return String(n).padStart(2, '0'); }
function milestoneHeadline(m) {
  const parts = m.title.split(' – ');
  if (parts.length < 2) return esc(m.title.toUpperCase());
  const tagPart = parts[0];
  const namePart = parts.slice(1).join(' – ');
  return esc(tagPart.toUpperCase()) + '.<br>GESPRÄCHSPHASE „' + esc(namePart.toUpperCase()) + '“.';
}
function ctxbar() { return '<div class="ctxbar">AKTIVER MITARBEITER: <b id="ctxName">— keiner ausgewählt —</b></div>'; }
function navBar(nextLabel) {
  return '<div class="nav"><button class="btn alt homeBtn" onclick="goTo(6)">◂ Übersicht</button>' +
    '<button class="btn alt" onclick="prevSlide()">Zurück</button>' +
    '<button class="btn" onclick="nextSlide()">' + nextLabel + '</button></div>';
}
function fieldsGrid(prefix, fields) {
  return '<div class="weeklyCheckGrid">' + fields.map(function (f) {
    const hint = f[3] ? '<span style="display:block;font-weight:400;font-size:13px;color:var(--ci);margin:-4px 0 8px">' + esc(f[3]) + '</span>' : '';
    return '<div class="weeklyCheckCard"><label>' + esc(f[0]) + '</label>' + hint +
      '<textarea data-field="' + prefix + '_' + f[1] + '" placeholder="' + esc(f[2]) + '"></textarea></div>';
  }).join('') + '</div>';
}
function checksList(prefix, items) {
  return '<div class="checks">' + items.map(function (c, i) {
    const label = Array.isArray(c) ? c[0] : c;
    const hint = Array.isArray(c) ? c[1] : null;
    const hintHtml = hint ? '<span style="display:block;font-weight:400;font-size:13px;color:var(--ci);margin-top:4px">' + esc(hint) + '</span>' : '';
    return '<div class="choice" data-toggle="' + prefix + (i + 1) + '" onclick="toggleChoice(this)">' + esc(label) + hintHtml + '</div>';
  }).join('') + '</div>';
}
function pickFields(fields, ids) {
  return fields.filter(function (f) { return ids.indexOf(f[1]) !== -1; });
}
function omitFields(fields, ids) {
  return fields.filter(function (f) { return ids.indexOf(f[1]) === -1; });
}

/* ----------------------------------------------------------------------
   ÜBERSICHT (Slide 6)
   ---------------------------------------------------------------------- */
function slideOverview(data) {
  const phaseTiles = data.phases.map(function (p) {
    const targetSlide = FIRST_MILESTONE_SLIDE + (p.n - 1) * SLIDES_PER_MILESTONE;
    return '<div class="tile" style="cursor:pointer" onclick="goTo(' + targetSlide + ')">' +
      '<b>' + esc(p.zeitraum) + ' — ' + esc(p.phase.toUpperCase()) + '</b>' +
      '<small>' + esc(p.fokus) + '<br><b style="color:var(--ci)">Meilenstein:</b> ' + esc(p.meilenstein) + '</small></div>';
  }).join('');
  const toolTiles = [
    ['KMU-BUDDY-FRAMEWORK', 'Kultureller Wegweiser für die ersten vier bis sechs Wochen.', BUDDY_FIRST_SLIDE],
    ['WENN ES HAKT — ESKALATIONSPROTOKOLL', 'Bei sichtbarer Leistungslücke: 14-Tage-Eskalationsprotokoll.', ESKALATION_FIRST_SLIDE],
    ['TRENNUNGS-LEITFADEN', '10-Minuten-Protokoll für den Fall einer Trennung.', TRENNUNG_FIRST_SLIDE]
  ].map(function (t) {
    return '<div class="tile" style="cursor:pointer" onclick="goTo(' + t[2] + ')"><b>' + t[0] + '</b><small>' + t[1] + '</small></div>';
  }).join('');
  return (
    '<section class="slide" data-slide="6"><div class="brand">P2 / ÜBERSICHT</div><div class="num">06</div>' +
    '<h1>IHR<br>PROBEZEIT-RADAR.</h1>' +
    '<p class="lead">Tag 1 → Tag 30 → Tag 60 → Tag 90 → Tag 150–170 → Ende der Probezeit. Klicken Sie eine Phase oder ein Werkzeug an, oder gehen Sie der Reihe nach vor. Jede Station ist in kurze Unterseiten aufgeteilt.</p>' +
    '<div class="grid">' + phaseTiles + '</div>' +
    '<h2>WEITERE WERKZEUGE.</h2>' +
    '<div class="grid">' + toolTiles + '</div>' +
    navBar('Weiter') +
    '</section>'
  );
}

/* ----------------------------------------------------------------------
   MEILENSTEINE — 5 Unterseiten je Gespräch (Tag 30 / 60 / 90 / 150–170)
   ---------------------------------------------------------------------- */
function milestoneBrand(m, i) {
  return 'P2 / ' + esc(m.zeitpunkt) + ' · GESPRÄCH ' + m.n + '/4 · ' + (i + 1) + '/6 ' + MILESTONE_SUBTITLES[i];
}

function slideMilestoneVorbereitung(m, num, phase) {
  const buddyTaktung = phase ? phase.buddyTaktung : '';
  const buddyBox = (m.n < 4 && buddyTaktung)
    ? '<div class="box"><b>WIE OFT TRIFFT DER BUDDY DEIN NEUES TEAMMITGLIED GERADE?</b><p style="margin:10px 0 0">Ein Buddy ist eine erfahrene Kollegin oder ein erfahrener Kollege, die/der deinem neuen Teammitglied beim Einleben hilft — nicht du selbst. In dieser Gesprächsphase gilt: ' + esc(buddyTaktung) + '</p></div>'
    : '';
  const fokusBox = m.fokus ? '<div class="box"><b>WORUM GEHT ES IN DIESER GESPRÄCHSPHASE?</b><p class="lead" style="margin:10px 0 0">Jedes Gespräch hat einen roten Faden — das Thema, um das sich an diesem Tag alles dreht. Bei diesem Gespräch ist das: ' + esc(m.fokus) + ' Was du dafür genau fragst und worauf du achtest, steht auf den nächsten Seiten.</p></div>' : '';
  const teilnehmerFields = pickFields(m.fields, ['teilnehmer']);
  const zeitraum = phase ? phase.zeitraum : '';
  return (
    '<section class="slide" data-slide="' + num + '"><div class="brand">' + milestoneBrand(m, 0) + '</div><div class="num">' + pad2(num) + '</div>' + ctxbar() +
    '<h1>' + milestoneHeadline(m) + '</h1>' +
    fokusBox + buddyBox +
    '<h2>IST DIESE GESPRÄCHSPHASE ABGESCHLOSSEN?</h2>' +
    '<p class="lead">Diese Liste zeigt, was in ' + esc(zeitraum || 'dieser Zeit') + ' eigentlich passiert sein sollte. Geh sie vor dem Gespräch kurz durch: Was passt schon? Was fehlt noch? Ein offener Punkt ist kein Problem — er wird einfach zum Thema im Gespräch.</p>' +
    checksList('m' + m.n + '_chk', m.checks) +
    '<div class="weeklyCheck"><div class="weeklyCheckIntro"><b>WER NIMMT AM GESPRÄCH TEIL?</b></div>' + fieldsGrid('m' + m.n, teilnehmerFields) + '</div>' +
    navBar('Weiter') +
    '</section>'
  );
}

function slideMilestoneZielEinstieg(m, num) {
  const frageBox = m.frage ? '<div class="box"><b>' + esc((m.frageLabel || 'FRAGE').toUpperCase()) + '.</b><p class="lead" style="margin:10px 0 0">„' + esc(m.frage) + '“</p></div>' : '';
  const zweckBox = m.zweck ? '<div class="box"><b>WOZU DIENT DIESE FRAGE?</b><p class="lead" style="margin:10px 0 0">' + esc(m.zweck) + '</p></div>' : '';
  const bereicheBox = m.bewertungsbereiche
    ? '<h2>DAS WIRD HEUTE BEWERTET.</h2><p class="lead">Diese vier Bereiche schaut ihr euch heute gemeinsam an. Was du dazu genau notierst, steht auf der Vereinbarungs-Seite.</p><ul class="qlist">' + m.bewertungsbereiche.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul>'
    : '';
  return (
    '<section class="slide" data-slide="' + num + '"><div class="brand">' + milestoneBrand(m, 1) + '</div><div class="num">' + pad2(num) + '</div>' + ctxbar() +
    '<h1>' + milestoneHeadline(m) + '</h1>' +
    '<div class="box"><b>DARUM GEHT ES MIR IN DIESEM GESPRÄCH.</b><p class="lead" style="margin:10px 0 0">„' + esc(m.ziel) + '“</p></div>' +
    frageBox + zweckBox + bereicheBox +
    navBar('Weiter') +
    '</section>'
  );
}

function slideMilestoneReaktionen(m, num) {
  const qaHtml = m.reaktionen.map(function (pair) {
    return '<div class="qa"><b>„' + esc(pair[0]) + '“</b><p>' + esc(pair[1]) + '</p></div>';
  }).join('');
  return (
    '<section class="slide" data-slide="' + num + '"><div class="brand">' + milestoneBrand(m, 2) + '</div><div class="num">' + pad2(num) + '</div>' + ctxbar() +
    '<h1>' + milestoneHeadline(m) + '</h1>' +
    '<h2>WAS DIE NEUE PERSON SAGEN KÖNNTE — UND WIE DU ANTWORTEST.</h2>' +
    qaHtml +
    navBar('Weiter') +
    '</section>'
  );
}

function slideMilestoneBesserSagen(m, num) {
  const compareHtml = m.compare.map(function (pair) {
    return '<div class="compareRow"><div class="no">„' + esc(pair[0]) + '“</div><div class="yes">„' + esc(pair[1]) + '“</div></div>';
  }).join('');
  return (
    '<section class="slide" data-slide="' + num + '"><div class="brand">' + milestoneBrand(m, 3) + '</div><div class="num">' + pad2(num) + '</div>' + ctxbar() +
    '<h1>' + milestoneHeadline(m) + '</h1>' +
    '<h2>SAG DAS NICHT — SAG LIEBER DAS.</h2>' +
    '<p class="lead">Manche Sätze klingen schnell falsch, auch wenn sie nicht böse gemeint sind. Hier siehst du bessere Alternativen.</p>' +
    '<div class="compareHead"><span>Nicht sagen</span><span>Besser sagen</span></div>' +
    compareHtml +
    navBar('Weiter') +
    '</section>'
  );
}

function slideMilestoneVereinbarung(m, num) {
  const restFields = omitFields(m.fields, ['teilnehmer']);
  return (
    '<section class="slide" data-slide="' + num + '"><div class="brand">' + milestoneBrand(m, 4) + '</div><div class="num">' + pad2(num) + '</div>' + ctxbar() +
    '<h1>' + milestoneHeadline(m) + '</h1>' +
    '<p class="lead">Trage hier fest, was ihr im Gespräch besprochen und vereinbart habt — nach Carmens Gesprächsvorlage.</p>' +
    '<div class="weeklyCheck"><div class="weeklyCheckIntro"><b>WAS WURDE BESPROCHEN UND VEREINBART?</b></div>' + fieldsGrid('m' + m.n, restFields) + '</div>' +
    navBar('Weiter') +
    '</section>'
  );
}

function slideMilestoneFollowUp(m, num, nextPhase, isLast) {
  const nextBox = nextPhase
    ? '<div class="box"><b>WAS ALS NÄCHSTES ANSTEHT.</b><p class="lead" style="margin:10px 0 0"><b>' + esc(nextPhase.zeitraum) + ' — ' + esc(nextPhase.phase.toUpperCase()) + '.</b><br>' + esc(nextPhase.fokus) + '</p></div>'
    : '<div class="box"><b>ENDE DER PROBEZEIT.</b><p class="lead" style="margin:10px 0 0">Mit diesem Gespräch endet der Entscheidungs-Korridor. Einmal bauen. Immer wieder nutzen — für die nächste neue Mitarbeiterin oder den nächsten neuen Mitarbeiter.</p></div>';
  return (
    '<section class="slide" data-slide="' + num + '"><div class="brand">' + milestoneBrand(m, 5) + '</div><div class="num">' + pad2(num) + '</div>' + ctxbar() +
    '<h1>' + milestoneHeadline(m) + '</h1>' +
    '<h2>HAKE AB: IST DIESES GESPRÄCH ERLEDIGT?</h2>' +
    checksList('m' + m.n + '_gf', m.gespraechsfolge) +
    nextBox +
    navBar(isLast ? 'Weiter zum Buddy-Framework' : 'Nächste Station') +
    '</section>'
  );
}

function buildMilestoneSlides(data) {
  const out = [];
  data.milestones.forEach(function (m, i) {
    const base = FIRST_MILESTONE_SLIDE + i * SLIDES_PER_MILESTONE;
    const phase = data.phases[i] || null;
    const nextPhase = data.phases[i + 1] || null;
    const isLast = i === data.milestones.length - 1;
    out.push(slideMilestoneVorbereitung(m, base, phase));
    out.push(slideMilestoneZielEinstieg(m, base + 1));
    out.push(slideMilestoneReaktionen(m, base + 2));
    out.push(slideMilestoneBesserSagen(m, base + 3));
    out.push(slideMilestoneVereinbarung(m, base + 4));
    out.push(slideMilestoneFollowUp(m, base + 5, nextPhase, isLast));
  });
  return out.join('\n');
}

/* ----------------------------------------------------------------------
   BUDDY-FRAMEWORK — 5 Unterseiten
   ---------------------------------------------------------------------- */
function buddyBrand(i) { return 'P2 / BUDDY-FRAMEWORK · ' + (i + 1) + '/5 ' + BUDDY_SUBTITLES[i]; }

function buildBuddySlides(b) {
  const s1 = BUDDY_FIRST_SLIDE, s2 = s1 + 1, s3 = s1 + 2, s4 = s1 + 3, s5 = s1 + 4;
  const taktungHtml = b.taktung.map(function (t) { return '<div class="qa"><b>' + esc(t[0]) + '</b><p>' + esc(t[1]) + '</p></div>'; }).join('');
  return [
    '<section class="slide" data-slide="' + s1 + '"><div class="brand">' + buddyBrand(0) + '</div><div class="num">' + pad2(s1) + '</div>' + ctxbar() +
    '<h1>BUDDY-FRAMEWORK.<br>WER IST DER BUDDY?</h1>' +
    '<div class="box"><b>ROLLE DES BUDDYS.</b><p class="lead" style="margin:10px 0 0">' + esc(b.rolle) + '</p></div>' +
    navBar('Weiter') + '</section>',

    '<section class="slide" data-slide="' + s2 + '"><div class="brand">' + buddyBrand(1) + '</div><div class="num">' + pad2(s2) + '</div>' + ctxbar() +
    '<h1>BUDDY-FRAMEWORK.<br>WIE LANGE UND WIE OFT?</h1>' +
    '<div class="box"><b>WIE LANGE BEGLEITET DER BUDDY?</b><p style="margin:10px 0 0">Die Rolle ist bewusst zeitlich begrenzt — danach soll die neue Person allein zurechtkommen. Dauer: ' + esc(b.dauer) + '</p></div>' +
    '<h2>TAKTUNG.</h2>' +
    '<p class="lead">Auch wie oft ihr euch trefft, nimmt mit der Zeit ab:</p>' +
    taktungHtml +
    navBar('Weiter') + '</section>',

    '<section class="slide" data-slide="' + s3 + '"><div class="brand">' + buddyBrand(2) + '</div><div class="num">' + pad2(s3) + '</div>' + ctxbar() +
    '<h1>BUDDY-FRAMEWORK.<br>WAS DARF DER BUDDY TUN?</h1>' +
    '<p class="lead">Das ist die Aufgabe des Buddys — nicht mehr und nicht weniger:</p>' +
    '<h2>DER BUDDY DARF.</h2>' +
    checksList('buddy_auf', b.aufgaben) +
    navBar('Weiter') + '</section>',

    '<section class="slide" data-slide="' + s4 + '"><div class="brand">' + buddyBrand(3) + '</div><div class="num">' + pad2(s4) + '</div>' + ctxbar() +
    '<h1>BUDDY-FRAMEWORK.<br>WAS DER BUDDY NICHT DARF.</h1>' +
    '<p class="lead">Damit für alle klar bleibt, wer wofür zuständig ist — der Buddy ersetzt weder dich noch HR:</p>' +
    '<div class="note" style="border-left-color:var(--red)"><b>STRIKTE GRENZEN UND TABUS.</b><br>' + b.tabus.map(esc).join('<br>') + '</div>' +
    navBar('Weiter') + '</section>',

    '<section class="slide" data-slide="' + s5 + '"><div class="brand">' + buddyBrand(4) + '</div><div class="num">' + pad2(s5) + '</div>' + ctxbar() +
    '<h1>BUDDY-FRAMEWORK.<br>CHECKLISTE &amp; ARBEITSVORLAGE.</h1>' +
    '<h2>BUDDY-CHECKLISTE.</h2>' +
    '<p class="lead">Das fasst die letzten vier Seiten als Checkliste zusammen — häkel ab, was schon passt.</p>' +
    checksList('buddy_chk', b.checkliste) +
    '<div class="weeklyCheck"><div class="weeklyCheckIntro"><b>ARBEITSVORLAGE.</b></div>' + fieldsGrid('buddy', b.fields) + '</div>' +
    navBar('Weiter zum Eskalationsprotokoll') + '</section>'
  ].join('\n');
}

/* ----------------------------------------------------------------------
   14-TAGE-ESKALATIONSPROTOKOLL — 5 Unterseiten
   ---------------------------------------------------------------------- */
function eskBrand(i) { return 'P2 / ESKALATIONSPROTOKOLL · ' + (i + 1) + '/5 ' + ESKALATION_SUBTITLES[i]; }

function buildEskalationSlides(e) {
  const s1 = ESKALATION_FIRST_SLIDE, s2 = s1 + 1, s3 = s1 + 2, s4 = s1 + 3, s5 = s1 + 4;
  const stepOverview = '<div class="grid"><div class="tile"><b>SCHRITT 1</b><small>' + esc(e.schritt1.titel) + ' (Tag 1–14)</small></div>' +
    '<div class="tile"><b>SCHRITT 2</b><small>' + esc(e.schritt2.titel) + '</small></div>' +
    '<div class="tile"><b>SCHRITT 3</b><small>' + esc(e.schritt3.titel) + '</small></div></div>';
  return [
    '<section class="slide" data-slide="' + s1 + '"><div class="brand">' + eskBrand(0) + '</div><div class="num">' + pad2(s1) + '</div>' + ctxbar() +
    '<h1>WENN ES HAKT.<br>14-TAGE-ESKALATIONSPROTOKOLL.</h1>' +
    '<p class="lead">' + esc(e.intro) + '</p>' +
    '<div class="note"><b>GRUNDSATZ.</b><br>„' + esc(e.grundsatz) + '“</div>' +
    '<h2>DIE DREI SCHRITTE.</h2>' + stepOverview +
    navBar('Weiter') + '</section>',

    '<section class="slide" data-slide="' + s2 + '"><div class="brand">' + eskBrand(1) + '</div><div class="num">' + pad2(s2) + '</div>' + ctxbar() +
    '<h1>SCHRITT 1.<br>' + esc(e.schritt1.titel.toUpperCase()) + '.</h1>' +
    '<p class="lead">' + esc(e.schritt1.text) + '</p>' +
    '<div class="weeklyCheck"><div class="weeklyCheckIntro"><b>DOKUMENTATION.</b></div>' + fieldsGrid('esk', pickFields(e.fields, ['luecke', 'fakten'])) + '</div>' +
    navBar('Weiter') + '</section>',

    '<section class="slide" data-slide="' + s3 + '"><div class="brand">' + eskBrand(2) + '</div><div class="num">' + pad2(s3) + '</div>' + ctxbar() +
    '<h1>ZWISCHENZIEL &amp;<br>SCHLÜSSELFRAGE.</h1>' +
    '<div class="note"><b>SCHLÜSSELFRAGE.</b><br>„' + esc(e.schluesselfrage) + '“</div>' +
    '<div class="weeklyCheck"><div class="weeklyCheckIntro"><b>DOKUMENTATION.</b></div>' + fieldsGrid('esk', pickFields(e.fields, ['abgleich', 'zwischenziel', 'antwort'])) + '</div>' +
    navBar('Weiter') + '</section>',

    '<section class="slide" data-slide="' + s4 + '"><div class="brand">' + eskBrand(3) + '</div><div class="num">' + pad2(s4) + '</div>' + ctxbar() +
    '<h1>SCHRITT 2.<br>' + esc(e.schritt2.titel.toUpperCase()) + '.</h1>' +
    '<p class="lead">' + esc(e.schritt2.text) + '</p>' +
    '<h2>SICHTBARE VERBESSERUNG INNERHALB VON 14 TAGEN?</h2>' +
    '<div class="checks">' +
    '<div class="choice" data-toggle="esk_verb_ja" onclick="toggleYesNo(this, \'esk_verb_nein\')">Ja</div>' +
    '<div class="choice" data-toggle="esk_verb_nein" onclick="toggleYesNo(this, \'esk_verb_ja\')">Nein</div>' +
    '</div>' +
    '<div class="weeklyCheck"><div class="weeklyCheckIntro"><b>DOKUMENTATION.</b></div>' + fieldsGrid('esk', pickFields(e.fields, ['lernkurve'])) + '</div>' +
    navBar('Weiter') + '</section>',

    '<section class="slide" data-slide="' + s5 + '"><div class="brand">' + eskBrand(4) + '</div><div class="num">' + pad2(s5) + '</div>' + ctxbar() +
    '<h1>SCHRITT 3.<br>' + esc(e.schritt3.titel.toUpperCase()) + '.</h1>' +
    '<p class="lead">' + esc(e.schritt3.text) + '</p>' +
    '<div class="note" style="border-left-color:#c99a2e"><b>ACHTUNG.</b><br>' + esc(e.schritt3.rechtshinweis) + '</div>' +
    '<div class="weeklyCheck"><div class="weeklyCheckIntro"><b>DOKUMENTATION.</b></div>' + fieldsGrid('esk', pickFields(e.fields, ['entscheidung'])) + '</div>' +
    '<h2>CHECKLISTE.</h2>' +
    '<p class="lead">Das fasst das ganze Eskalationsprotokoll zusammen — geh es kurz durch, bevor du weitermachst.</p>' +
    checksList('esk_chk', e.checkliste) +
    navBar('Weiter zum Trennungsleitfaden') + '</section>'
  ].join('\n');
}

/* ----------------------------------------------------------------------
   TRENNUNGS-LEITFADEN — 5 Unterseiten
   ---------------------------------------------------------------------- */
function trBrand(i) { return 'P2 / TRENNUNGS-LEITFADEN · ' + (i + 1) + '/5 ' + TRENNUNG_SUBTITLES[i]; }

function buildTrennungSlides(t, rechtlicherHinweisAllgemein) {
  const s1 = TRENNUNG_FIRST_SLIDE, s2 = s1 + 1, s3 = s1 + 2, s4 = s1 + 3, s5 = s1 + 4;
  const a1 = t.ablauf[0], a2 = t.ablauf[1], a3 = t.ablauf[2];
  return [
    '<section class="slide" data-slide="' + s1 + '"><div class="brand">' + trBrand(0) + '</div><div class="num">' + pad2(s1) + '</div>' + ctxbar() +
    '<h1>TRENNUNGS-LEITFADEN.<br>10-MINUTEN-PROTOKOLL.</h1>' +
    '<div class="note" style="border-left-color:var(--red)"><b>RECHTLICHE LEITPLANKE.</b><br>' + esc(t.rechtlicheLeitplanke) + '</div>' +
    '<div class="box"><b>VIER-AUGEN-PRINZIP.</b><p style="margin:10px 0 0">' + esc(t.vierAugen) + '</p></div>' +
    '<div class="box"><b>GESPRÄCHSDAUER.</b><p style="margin:10px 0 0">Kurz und klar halten — lange Erklärungen verunsichern in dieser Situation nur. ' + esc(t.dauer) + '</p></div>' +
    navBar('Weiter') + '</section>',

    '<section class="slide" data-slide="' + s2 + '"><div class="brand">' + trBrand(1) + '</div><div class="num">' + pad2(s2) + '</div>' + ctxbar() +
    '<h1>' + esc(a1.titel.toUpperCase()) + '.</h1>' +
    '<p class="lead">So beginnst du das Gespräch — wortwörtlich:</p>' +
    '<div class="box"><b>FESTE FORMULIERUNG.</b><p class="lead" style="margin:10px 0 0">„' + esc(a1.formulierung) + '“</p></div>' +
    navBar('Weiter') + '</section>',

    '<section class="slide" data-slide="' + s3 + '"><div class="brand">' + trBrand(2) + '</div><div class="num">' + pad2(s3) + '</div>' + ctxbar() +
    '<h1>' + esc(a2.titel.toUpperCase()) + '.</h1>' +
    '<p class="lead">' + esc(a2.hinweis) + '</p>' +
    '<div class="box"><b>FESTE FORMULIERUNG.</b><p class="lead" style="margin:10px 0 0">„' + esc(a2.formulierung) + '“</p></div>' +
    navBar('Weiter') + '</section>',

    '<section class="slide" data-slide="' + s4 + '"><div class="brand">' + trBrand(3) + '</div><div class="num">' + pad2(s4) + '</div>' + ctxbar() +
    '<h1>' + esc(a3.titel.toUpperCase()) + '.</h1>' +
    '<p class="lead">Das sind die praktischen Punkte, die direkt im Anschluss an die Ansage erledigt werden — häkel ab, was schon geklärt ist:</p>' +
    checksList('tr_ablauf', a3.punkte) +
    navBar('Weiter') + '</section>',

    '<section class="slide" data-slide="' + s5 + '"><div class="brand">' + trBrand(4) + '</div><div class="num">' + pad2(s5) + '</div>' + ctxbar() +
    '<h1>PROTOKOLL &amp;<br>CHECKLISTE.</h1>' +
    '<p class="lead">Das fasst den ganzen Trennungs-Leitfaden zusammen — geh es kurz durch, bevor du das Gespräch führst.</p>' +
    checksList('tr_chk', t.checks) +
    '<div class="weeklyCheck"><div class="weeklyCheckIntro"><b>ARBEITSFELDER.</b></div>' + fieldsGrid('tr', t.fields) + '</div>' +
    '<div class="note" style="border-left-color:var(--red)"><b>RECHTLICHER HINWEIS.</b><br>' + esc(rechtlicherHinweisAllgemein) + '</div>' +
    navBar('Weiter zum Team-Bericht') + '</section>'
  ].join('\n');
}

/* ----------------------------------------------------------------------
   TEAM-BERICHT
   ---------------------------------------------------------------------- */
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
  return [
    slideOverview(data),
    buildMilestoneSlides(data),
    buildBuddySlides(data.buddy),
    buildEskalationSlides(data.eskalation),
    buildTrennungSlides(data.trennung, data.rechtlicherHinweisAllgemein),
    slideTeamBericht()
  ].join('\n');
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
    'const store = MotorEngine.createStore("p2_data_v2", function(){ return { employees:{}, employeeOrder:[], activeEmployeeId:null, byEmployee:{}, choices:{} }; });\n' +
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
    'const nav = MotorEngine.createNav();\n' +
    '\n' +
    'function goTo(n){ nav.goTo(n); }\n' +
    'function nextSlide(){ nav.next(); }\n' +
    'function prevSlide(){ nav.prev(); }\n' +
    'function toggleChoice(el){ choices.toggle(el); }\n' +
    'function toggleYesNo(el, otherKey){\n' +
    '  const wasOn = el.classList.contains("on");\n' +
    '  choices.toggle(el);\n' +
    '  if(!wasOn){\n' +
    '    const other = document.querySelector(\'[data-toggle="\'+otherKey+\'"]\');\n' +
    '    if(other && other.classList.contains("on")){ choices.toggle(other); }\n' +
    '  }\n' +
    '}\n' +
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
