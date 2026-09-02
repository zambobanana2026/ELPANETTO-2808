/* ============================================================================
   CARMEN NEXT — MOTOR / engine.js
   Geteilte Logik für die gesamte P1–P8 Produktfamilie: Slide-Navigation,
   localStorage, Mitarbeiterverwaltung mit Lizenzgrenze, Feld-Bindung,
   Auswahl-Toggles, Team-Report-Rendering, Modal-Handling.

   Enthält KEINE Produktinhalte. Produktinhalte kommen aus products/*.config.js
   und werden von build/build.js zu einer einzelnen HTML-Datei zusammengefügt.

   Bekannter Bug (siehe CLAUDE.md): beim dynamischen Erzeugen von onclick="..."
   Attributen NICHT mit \' escapen. Stattdessen HTML-Entities nutzen
   (&quot;...&quot;) — siehe renderGrid() unten.
   ============================================================================ */
(function (global) {
  'use strict';

  function escapeHtml(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ---------------------------------------------------------------------
  // Storage: ein generischer localStorage-Store pro Produkt.
  // ---------------------------------------------------------------------
  function createStore(key, defaultDataFn) {
    function load() {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return defaultDataFn();
        return Object.assign(defaultDataFn(), JSON.parse(raw));
      } catch (e) {
        return defaultDataFn();
      }
    }
    const store = { data: load() };
    store.save = function () {
      try { localStorage.setItem(key, JSON.stringify(store.data)); } catch (e) { /* storage unavailable */ }
    };
    store.reload = function () { store.data = load(); };
    return store;
  }

  // ---------------------------------------------------------------------
  // Slide-Navigation: funktioniert für jedes Interaktionsmuster
  // (wochenbasierter Zyklus wie P1, situative Karten-Auswahl wie P6),
  // solange Slides als <section class="slide" data-slide="N"> vorliegen.
  // ---------------------------------------------------------------------
  function createNav() {
    const SLIDES = Array.from(document.querySelectorAll('.slide'));
    let current = SLIDES.findIndex(function (s) { return s.classList.contains('active'); });
    if (current < 0) current = 0;
    const enterHooks = {};

    function show(i) {
      if (i < 0 || i >= SLIDES.length) return;
      if (SLIDES[current]) SLIDES[current].classList.remove('active');
      current = i;
      SLIDES[current].classList.add('active');
      window.scrollTo({ top: 0, behavior: 'instant' });
      const num = SLIDES[current].dataset.slide;
      if (enterHooks[num]) enterHooks[num]();
    }
    function goTo(n) { show(n - 1); }
    function next() { show(current + 1); }
    function prev() { show(current - 1); }
    function onEnter(slideNumber, fn) { enterHooks[String(slideNumber)] = fn; }

    return {
      goTo: goTo,
      next: next,
      prev: prev,
      onEnter: onEnter,
      get current() { return current + 1; },
      get length() { return SLIDES.length; }
    };
  }

  // ---------------------------------------------------------------------
  // Mitarbeiterverwaltung mit Lizenzgrenze.
  // Felder werden pro Mitarbeiter-ID in store.data.byEmployee[id].fields
  // gespeichert, damit Daten verschiedener Personen sich nicht vermischen.
  // ---------------------------------------------------------------------
  function createEmployeeManager(opts) {
    const store = opts.store;
    const license = opts.license || { maxEmployees: 20 };
    const D = store.data;
    if (!D.employees) D.employees = {};
    if (!D.employeeOrder) D.employeeOrder = [];
    if (!D.byEmployee) D.byEmployee = {};
    if (D.activeEmployeeId === undefined) D.activeEmployeeId = null;

    function bucketFor(id) {
      const key = id || '__unassigned__';
      if (!D.byEmployee[key]) D.byEmployee[key] = { fields: {} };
      if (!D.byEmployee[key].fields) D.byEmployee[key].fields = {};
      return D.byEmployee[key];
    }
    function currentBucket() { return bucketFor(D.activeEmployeeId); }
    function newId() { return 'emp_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

    function isFull() { return D.employeeOrder.length >= license.maxEmployees; }

    function add(name, extra) {
      name = (name || '').trim();
      if (!name) return null;
      if (isFull()) return null;
      const id = newId();
      D.employees[id] = Object.assign({ id: id, name: name }, extra || {});
      D.employeeOrder.push(id);
      D.activeEmployeeId = id;
      store.save();
      render();
      opts.onChange && opts.onChange();
      return id;
    }
    function remove(id) {
      D.employeeOrder = D.employeeOrder.filter(function (e) { return e !== id; });
      delete D.employees[id];
      if (D.activeEmployeeId === id) D.activeEmployeeId = null;
      store.save();
      render();
      opts.onChange && opts.onChange();
    }
    function setActive(id) {
      D.activeEmployeeId = id;
      store.save();
      render();
      opts.onChange && opts.onChange();
    }

    function render() {
      const grid = opts.gridSelector && document.querySelector(opts.gridSelector);
      if (grid) {
        grid.innerHTML = '';
        D.employeeOrder.forEach(function (id) {
          const emp = D.employees[id];
          if (!emp) return;
          const div = document.createElement('div');
          div.className = 'tile' + (D.activeEmployeeId === id ? ' activeEmp' : '');
          div.style.cursor = 'pointer';
          div.onclick = function () { setActive(id); };
          const small = opts.tileLabel ? opts.tileLabel(bucketFor(id)) : '';
          const subtitle = opts.tileSubtitle ? opts.tileSubtitle(emp) : '';
          const removeFn = opts.removeFnName || 'removeEmployee';
          div.innerHTML =
            '<span class="rm" onclick="' + removeFn + '(&quot;' + id + '&quot;, event)">entfernen</span>' +
            '<b>' + escapeHtml(emp.name) + '</b>' +
            (subtitle ? '<small class="tileSubtitle">' + escapeHtml(subtitle) + '</small>' : '') +
            (small ? '<small>' + escapeHtml(small) + '</small>' : '');
          grid.appendChild(div);
        });
      }
      const countEl = opts.countSelector && document.querySelector(opts.countSelector);
      if (countEl) countEl.textContent = D.employeeOrder.length;
      const limitNote = opts.limitNoteSelector && document.querySelector(opts.limitNoteSelector);
      if (limitNote) limitNote.style.display = isFull() ? 'block' : 'none';
      updateContextbars();
    }
    function updateContextbars() {
      if (!opts.ctxNameSelector) return;
      const name = D.activeEmployeeId ? (D.employees[D.activeEmployeeId] || {}).name : null;
      document.querySelectorAll(opts.ctxNameSelector).forEach(function (el) {
        el.textContent = name || '— keiner ausgewählt —';
      });
    }

    function removeWithConfirm(id, ev) {
      if (ev) ev.stopPropagation();
      if (!global.confirm('Mitarbeiter wirklich entfernen? Die Dokumentation bleibt gespeichert, ist aber keiner Person mehr zugeordnet.')) return;
      remove(id);
    }

    return {
      get data() { return D; },
      bucketFor: bucketFor,
      currentBucket: currentBucket,
      add: add,
      remove: removeWithConfirm,
      removeSilently: remove,
      setActive: setActive,
      isFull: isFull,
      render: render,
      updateContextbars: updateContextbars
    };
  }

  // ---------------------------------------------------------------------
  // Feld-Bindung: <textarea data-field="..."> wird automatisch im Bucket
  // des aktiven Mitarbeiters gespeichert/wiederhergestellt.
  // ---------------------------------------------------------------------
  function bindFields(store, manager) {
    document.querySelectorAll('textarea[data-field]').forEach(function (el) {
      el.addEventListener('input', function () {
        manager.currentBucket().fields[el.dataset.field] = el.value;
        store.save();
      });
    });
  }
  function restoreFields(manager) {
    const b = manager.currentBucket();
    document.querySelectorAll('textarea[data-field]').forEach(function (el) {
      el.value = b.fields[el.dataset.field] || '';
    });
  }

  // ---------------------------------------------------------------------
  // Auswahl-Toggles: <div data-toggle="key" onclick="Motor.choices.toggle(this)">
  // ---------------------------------------------------------------------
  function createChoices(store) {
    const D = store.data;
    if (!D.choices) D.choices = {};
    function bindAll() {
      document.querySelectorAll('[data-toggle]').forEach(function (el) {
        const key = el.dataset.toggle;
        if (D.choices[key]) el.classList.add('on');
      });
    }
    function toggle(el) {
      const key = el.dataset.toggle;
      el.classList.toggle('on');
      D.choices[key] = el.classList.contains('on');
      store.save();
    }
    return { bindAll: bindAll, toggle: toggle };
  }

  // ---------------------------------------------------------------------
  // Farbmodelle: jedes Modell ist ein vollständig abgestimmtes Set aus
  // neun Tokens (Seiten-Hintergrund, Papier/Slide, Fläche/Karten, Text,
  // gedämpfter Text, Rahmen, Marke/Buttons, Akzent, Seitenzahl-Akzent) —
  // nicht nur ein einzelner Akzent. So bleibt Kontrast innerhalb eines
  // Modells garantiert, auch beim dunklen "Anthrazit"-Modell. Die
  // Ampelfarben (--green/--orange/--red) bleiben absichtlich über alle
  // Modelle hinweg fest, damit "Erfolg/Warnung/Fehler" nie mit der Marke
  // kippt. Persistiert die Wahl in localStorage wie Mitarbeiterdaten.
  // ---------------------------------------------------------------------
  const THEME_KEYS = ['pagebg', 'paper', 'surface', 'ink', 'muted', 'line', 'ci', 'mint', 'num'];
  const DEFAULT_THEMES = [
    { id: 'salbei', name: 'Salbei (Standard)', pagebg: '#ebe8e3', paper: '#f6f4f0', surface: '#ffffff', ink: '#252525', muted: '#777672', line: '#d9d5cf', ci: '#7f7a74', mint: '#8fe3cf', num: '#55cdb2' },
    { id: 'ozean', name: 'Ozean', pagebg: '#e3ebf1', paper: '#eef4f9', surface: '#ffffff', ink: '#252525', muted: '#5b7185', line: '#c9d9e6', ci: '#3867b0', mint: '#a8d4ef', num: '#3d84c9' },
    { id: 'bordeaux', name: 'Bordeaux', pagebg: '#f1e5e3', paper: '#faf1ef', surface: '#ffffff', ink: '#252525', muted: '#8a6a66', line: '#e6d1cd', ci: '#7a3b3b', mint: '#e8b8b8', num: '#c2605f' },
    { id: 'wald', name: 'Waldgrün', pagebg: '#e5ece7', paper: '#f0f6f2', surface: '#ffffff', ink: '#252525', muted: '#5f7a68', line: '#cfe0d5', ci: '#2f6b4f', mint: '#b3e8cb', num: '#3f9c6d' },
    { id: 'terrakotta', name: 'Terrakotta', pagebg: '#f1e8de', paper: '#faf2e9', surface: '#ffffff', ink: '#252525', muted: '#8a6a4c', line: '#e6d3ba', ci: '#a2542f', mint: '#f0c9a3', num: '#c46f3c' },
    { id: 'graphit', name: 'Graphit', pagebg: '#e6e8eb', paper: '#f1f2f4', surface: '#ffffff', ink: '#252525', muted: '#5c6472', line: '#d4d8de', ci: '#4a5568', mint: '#b8cbe0', num: '#5c7290' },
    { id: 'aubergine', name: 'Aubergine', pagebg: '#ece5ee', paper: '#f6f0f8', surface: '#ffffff', ink: '#252525', muted: '#7a6a82', line: '#ddd0e3', ci: '#5b3a6b', mint: '#d3b8e8', num: '#8354a0' },
    { id: 'senf', name: 'Senfgelb', pagebg: '#efe9db', paper: '#f8f3e6', surface: '#ffffff', ink: '#252525', muted: '#8a7a45', line: '#e3d8b0', ci: '#8a6d1f', mint: '#f0dfa8', num: '#b5911f' },
    { id: 'petrol', name: 'Petrol', pagebg: '#e2ecea', paper: '#edf5f3', surface: '#ffffff', ink: '#252525', muted: '#4e7371', line: '#c7ddd9', ci: '#1d6b6b', mint: '#a8e3da', num: '#28918f' },
    { id: 'anthrazit', name: 'Anthrazit (Dunkel)', pagebg: '#181818', paper: '#222222', surface: '#2b2b2b', ink: '#f0efec', muted: '#a19a90', line: '#3a3a3a', ci: '#6b6560', mint: '#c9c2b8', num: '#c9c2b8' }
  ];

  function createColorThemes(themes, storageKey) {
    const KEY = storageKey || 'carmen_theme_v1';
    const list = themes || DEFAULT_THEMES;
    function find(id) {
      let t = null;
      for (let i = 0; i < list.length; i++) { if (list[i].id === id) t = list[i]; }
      return t || list[0];
    }
    function apply(id) {
      const t = find(id);
      const root = document.documentElement.style;
      THEME_KEYS.forEach(function (k) { root.setProperty('--' + k, t[k]); });
      try { localStorage.setItem(KEY, t.id); } catch (e) { /* storage unavailable */ }
    }
    function current() {
      try { return localStorage.getItem(KEY) || list[0].id; } catch (e) { return list[0].id; }
    }
    function init() { apply(current()); }
    function renderSwatches(selector) {
      const el = document.querySelector(selector);
      if (!el) return;
      el.innerHTML = '';
      const active = current();
      list.forEach(function (t) {
        const btn = document.createElement('div');
        btn.className = 'themeSwatch' + (t.id === active ? ' active' : '');
        btn.title = t.name;
        btn.style.background = 'linear-gradient(135deg, ' + t.paper + ' 50%, ' + t.ci + ' 50%)';
        btn.onclick = function () { apply(t.id); renderSwatches(selector); };
        el.appendChild(btn);
      });
    }
    return { apply: apply, current: current, init: init, renderSwatches: renderSwatches, themes: list };
  }

  // ---------------------------------------------------------------------
  // Team-Report: iteriert alle Mitarbeitenden, lässt das Produkt pro Person
  // eine Tabellenzeile + Zählwerte berechnen (rowFn), summiert automatisch.
  // Der letzte Eintrag in totalsSelectors bekommt immer die Mitarbeiterzahl.
  // ---------------------------------------------------------------------
  function renderTeamReport(cfg) {
    const manager = cfg.manager;
    const D = manager.data;
    const rows = [];
    const sums = [];
    D.employeeOrder.forEach(function (id) {
      const emp = D.employees[id];
      if (!emp) return;
      const bucket = manager.bucketFor(id);
      const r = cfg.rowFn(emp, bucket);
      rows.push(r.html);
      if (r.counts) r.counts.forEach(function (v, i) { sums[i] = (sums[i] || 0) + v; });
    });
    const tbody = cfg.tbodySelector && document.querySelector(cfg.tbodySelector);
    if (tbody) tbody.innerHTML = rows.join('') || (cfg.emptyHtml || '');
    if (cfg.totalsSelectors) {
      cfg.totalsSelectors.forEach(function (sel, i) {
        const el = sel && document.querySelector(sel);
        if (!el) return;
        el.textContent = (i < sums.length) ? sums[i] : D.employeeOrder.length;
      });
    }
  }

  // ---------------------------------------------------------------------
  // Modal-Handling (generisch, per id).
  // ---------------------------------------------------------------------
  function openModal(id) { const el = document.getElementById(id); if (el) el.classList.add('open'); }
  function closeModal(id) { const el = document.getElementById(id); if (el) el.classList.remove('open'); }

  global.MotorEngine = {
    escapeHtml: escapeHtml,
    createStore: createStore,
    createNav: createNav,
    createEmployeeManager: createEmployeeManager,
    bindFields: bindFields,
    restoreFields: restoreFields,
    createChoices: createChoices,
    createColorThemes: createColorThemes,
    DEFAULT_THEMES: DEFAULT_THEMES,
    renderTeamReport: renderTeamReport,
    openModal: openModal,
    closeModal: closeModal
  };
})(window);
