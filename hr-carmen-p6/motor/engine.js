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

    function add(name) {
      name = (name || '').trim();
      if (!name) return null;
      if (isFull()) return null;
      const id = newId();
      D.employees[id] = { id: id, name: name };
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
          const removeFn = opts.removeFnName || 'removeEmployee';
          div.innerHTML =
            '<span class="rm" onclick="' + removeFn + '(&quot;' + id + '&quot;, event)">entfernen</span>' +
            '<b>' + escapeHtml(emp.name) + '</b>' +
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
    renderTeamReport: renderTeamReport,
    openModal: openModal,
    closeModal: closeModal
  };
})(window);
