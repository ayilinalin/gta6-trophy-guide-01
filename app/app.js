// GTA VI trophy guide + tracker: offline, localStorage only, no network at runtime.
// Data: app/data/trophies.json (55 official trophies with our own guides + cited sources).
(function () {
  'use strict';

  var KEY = 'gta6-trophy-guide-v1';
  var DEMO_EARNED = [2, 3, 4, 8, 15, 16, 19, 20, 21, 32, 33, 42, 44]; // 13 trophies, for ?demo=1
  var params = new URLSearchParams(window.location.search);
  var listEl = document.getElementById('trophy-list');
  var metaEl = document.getElementById('list-meta');
  var emptyEl = document.getElementById('empty-state');
  var searchEl = document.getElementById('search');
  var spoilerEl = document.getElementById('spoiler');
  var detailEl = document.getElementById('detail');

  var trophies = [];
  var byId = {};
  var earned = new Set();
  var filter = 'all';
  var query = '';

  function loadSaved() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return false;
      var data = JSON.parse(raw);
      if (Array.isArray(data)) { earned = new Set(data.filter(isKnownId)); return true; }
      if (data && Array.isArray(data.earned)) { earned = new Set(data.earned.filter(isKnownId)); return true; }
    } catch (e) { /* corrupted save: start fresh */ }
    return false;
  }

  function isKnownId(id) { return Object.prototype.hasOwnProperty.call(byId, id); }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify({ game: 'Grand Theft Auto VI', earned: Array.from(earned).sort(function (a, b) { return a - b; }) })); } catch (e) { /* storage unavailable */ }
  }

  function gradeLabel(t) { return t.grade.charAt(0).toUpperCase() + t.grade.slice(1); }

  function stageLabel(stage) {
    return { 1: 'Stage 1 · Story', 2: 'Stage 2 · Collectibles', 3: 'Stage 3 · Activities', 4: 'Stage 4 · Cleanup' }[stage] || ('Stage ' + stage);
  }

  function isSpoiled(t) {
    return spoilerEl.checked && t.kind === 'story' && !earned.has(t.id);
  }

  function badge(text, cls) {
    var s = document.createElement('span');
    s.className = 'badge' + (cls ? ' ' + cls : '');
    s.textContent = text;
    return s;
  }

  function matches(t) {
    if (filter === 'story' && t.kind !== 'story') return false;
    if (filter === 'missable' && !t.missable) return false;
    if (filter === 'collectibles' && t.kind !== 'collectibles') return false;
    if (filter === 'activities' && t.kind !== 'activities') return false;
    if (filter === 'online') return false; // GTA VI has no online trophies
    if (filter === 'earned' && !earned.has(t.id)) return false;
    if (filter === 'todo' && earned.has(t.id)) return false;
    if (query) {
      var hay = (t.name + ' ' + t.description + ' ' + t.guide).toLowerCase();
      if (hay.indexOf(query) === -1) return false;
    }
    return true;
  }

  function renderProgress() {
    var n = earned.size;
    var total = trophies.length;
    var pct = total ? Math.round((n / total) * 100) : 0;
    document.getElementById('earned-count').textContent = n + ' / ' + total;
    document.getElementById('earned-pct').textContent = pct + '%';
    document.getElementById('progress-fill').style.width = pct + '%';
    document.getElementById('progress-note').textContent = n === total
      ? 'Platinum earned — Vice Got a Price! You are a Leonida Legend.'
      : n === 0
        ? 'Earn every other trophy to unlock the platinum.'
        : (total - n) + ' trophies left until the platinum.';
    [1, 2, 3, 4].forEach(function (stage) {
      var done = trophies.filter(function (t) { return t.stage === stage && earned.has(t.id); }).length;
      var all = trophies.filter(function (t) { return t.stage === stage; }).length;
      var el = document.querySelector('[data-stage-count="' + stage + '"]');
      if (el) el.textContent = '(' + done + '/' + all + ' earned)';
    });
  }

  function renderList() {
    listEl.replaceChildren();
    var shown = 0;
    trophies.forEach(function (t) {
      if (!matches(t)) return;
      shown++;
      var li = document.createElement('li');
      li.className = 'trophy grade-' + t.grade + (earned.has(t.id) ? ' earned' : '') + (isSpoiled(t) ? ' spoiled' : '');
      li.dataset.id = t.id;

      var box = document.createElement('input');
      box.type = 'checkbox';
      box.checked = earned.has(t.id);
      box.setAttribute('aria-label', 'Mark ' + t.name + ' as earned');
      box.addEventListener('change', function (ev) {
        ev.stopPropagation();
        toggleEarned(t.id, box.checked);
      });

      var body = document.createElement('div');
      body.className = 'trophy-body';
      var name = document.createElement('div');
      name.className = 'trophy-name';
      var dot = document.createElement('span');
      dot.className = 'grade-dot';
      dot.setAttribute('aria-hidden', 'true');
      name.appendChild(dot);
      name.appendChild(document.createTextNode(t.name));
      var desc = document.createElement('div');
      desc.className = 'trophy-desc';
      desc.textContent = t.description;
      var badges = document.createElement('div');
      badges.className = 'badges';
      badges.appendChild(badge(gradeLabel(t), 'grade-' + t.grade));
      if (t.kind !== 'platinum') badges.appendChild(badge(t.kind.charAt(0).toUpperCase() + t.kind.slice(1)));
      badges.appendChild(badge(stageLabel(t.stage), 'stage'));
      if (t.hidden) badges.appendChild(badge('Hidden on PS5', 'hidden'));
      if (t.missable) badges.appendChild(badge('⚠ Missable', 'missable'));
      var guide = document.createElement('p');
      guide.className = 'trophy-guide';
      guide.textContent = t.guide;
      body.appendChild(name);
      body.appendChild(desc);
      body.appendChild(badges);
      body.appendChild(guide);

      li.appendChild(box);
      li.appendChild(body);
      li.addEventListener('click', function () { openDetail(t.id); });
      listEl.appendChild(li);
    });
    emptyEl.hidden = shown !== 0;
    metaEl.textContent = shown === trophies.length
      ? 'Showing all 55 trophies — 1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden on PlayStation until earned.'
      : 'Showing ' + shown + ' of ' + trophies.length + ' trophies.';
    renderProgress();
  }

  function toggleEarned(id, on) {
    if (on) earned.add(id); else earned.delete(id);
    save();
    renderList();
    if (!detailEl.hidden) {
      var current = document.getElementById('detail-earned');
      if (current) current.checked = earned.has(id);
    }
  }

  function openDetail(id) {
    var t = byId[id];
    if (!t) return;
    document.getElementById('detail-grade').textContent = gradeLabel(t) + ' trophy' + (t.hidden ? ' · hidden on PS5 until earned' : '');
    document.getElementById('detail-name').textContent = t.name;
    document.getElementById('detail-desc').textContent = t.description;
    var badges = document.getElementById('detail-badges');
    badges.replaceChildren();
    badges.appendChild(badge(t.kind === 'platinum' ? 'Platinum' : t.kind.charAt(0).toUpperCase() + t.kind.slice(1)));
    badges.appendChild(badge(stageLabel(t.stage), 'stage'));
    if (t.hidden) badges.appendChild(badge('Hidden on PS5', 'hidden'));
    if (t.missable) badges.appendChild(badge('⚠ Missable', 'missable'));
    document.getElementById('detail-guide').textContent = t.guide;
    var miss = document.getElementById('detail-missable');
    if (t.missable && t.missable_reason) {
      miss.hidden = false;
      miss.textContent = 'Missable: ' + t.missable_reason;
    } else {
      miss.hidden = true;
      miss.textContent = '';
    }
    var srcs = document.getElementById('detail-sources');
    srcs.replaceChildren();
    (t.sources || []).forEach(function (s) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = s.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = s.name;
      li.appendChild(a);
      srcs.appendChild(li);
    });
    var check = document.getElementById('detail-earned');
    check.checked = earned.has(t.id);
    check.onchange = function () { toggleEarned(t.id, check.checked); };
    detailEl.hidden = false;
    detailEl.scrollIntoView({ behavior: 'auto', block: 'start' });
  }

  function setFilter(next) {
    filter = next;
    document.querySelectorAll('#filters button').forEach(function (b) {
      b.classList.toggle('active', b.dataset.filter === next);
    });
    renderList();
  }

  document.getElementById('filters').addEventListener('click', function (ev) {
    var btn = ev.target.closest('button[data-filter]');
    if (btn) setFilter(btn.dataset.filter);
  });
  searchEl.addEventListener('input', function () {
    query = searchEl.value.trim().toLowerCase();
    renderList();
  });
  spoilerEl.addEventListener('change', renderList);
  document.getElementById('detail-close').addEventListener('click', function () {
    detailEl.hidden = true;
  });

  document.getElementById('export-btn').addEventListener('click', function () {
    var payload = { game: 'Grand Theft Auto VI', platform: 'PlayStation 5', exportedAt: new Date().toISOString(), earned: Array.from(earned).sort(function (a, b) { return a - b; }) };
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    a.download = 'gta6-trophy-progress.json';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });
  document.getElementById('import-btn').addEventListener('click', function () {
    document.getElementById('import-file').click();
  });
  document.getElementById('import-file').addEventListener('change', function (ev) {
    var file = ev.target.files && ev.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        var ids = Array.isArray(data) ? data : data.earned;
        if (!Array.isArray(ids)) throw new Error('no earned list');
        var valid = ids.map(Number).filter(function (id) { return isKnownId(id); });
        earned = new Set(valid);
        save();
        renderList();
      } catch (e) {
        window.alert('That file is not a valid trophy-progress export.');
      }
      ev.target.value = '';
    };
    reader.readAsText(file);
  });
  document.getElementById('reset-btn').addEventListener('click', function () {
    if (!window.confirm('Clear all earned trophies?')) return;
    earned = new Set();
    save();
    renderList();
  });

  fetch('data/trophies.json')
    .then(function (res) { if (!res.ok) throw new Error('trophies.json failed: ' + res.status); return res.json(); })
    .then(function (doc) {
      trophies = doc.trophies || [];
      trophies.forEach(function (t) { byId[t.id] = t; });
      var hadSave = loadSaved();
      if (!hadSave && params.get('demo') === '1') {
        earned = new Set(DEMO_EARNED.filter(isKnownId));
        save();
      }
      if (params.get('filter')) setFilter(params.get('filter'));
      if (params.get('spoiler') === '1') spoilerEl.checked = true;
      renderList();
      if (params.get('trophy')) openDetail(Number(params.get('trophy')));
      if (params.get('view') === 'roadmap') {
        document.getElementById('roadmap').scrollIntoView({ behavior: 'auto', block: 'start' });
      }
      if (params.get('scroll') === 'list') {
        listEl.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
    })
    .catch(function (err) {
      metaEl.textContent = 'Could not load the trophy list. Open this page from the app folder so data/trophies.json loads.';
      if (window.console) console.error(err);
    });
})();
