(function () {
  var T = window.TRIP || {};
  var islands = T.islands || [];
  var others = T.participants || [];
  // Islands and other participants share one list so popups and activity chips can refer to either
  var all = islands.map(function (x) { return Object.assign({ kind: 'island' }, x); })
    .concat(others.map(function (x) { return Object.assign({ kind: 'other' }, x); }));

  var EMPTY = 'އަދި މައުލޫމާތެއް ނެތް';
  var ICON = {
    user: '<svg class="icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"/></svg>',
    phone: '<svg class="icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/></svg>',
    list: '<svg class="icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 10h6M9 14h6M9 18h4"/></svg>',
    team: '<svg class="icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c2 .7 3.2 2.5 3.6 5.2"/></svg>',
    clock: '<svg class="icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    mail: '<svg class="icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    building: '<svg class="icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21V7l8-4 8 4v14"/><path d="M10 10h4M12 8v4"/><path d="M9 21v-5h6v5"/></svg>',
    info: '<svg class="icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>'
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function list(arr) {
    return arr && arr.length
      ? '<ul class="bullets">' + arr.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ul>'
      : '<p class="none">' + EMPTY + '</p>';
  }

  /* ---------- Bottom sheet ---------- */
  var sheet = document.getElementById('sheet');
  var sheetBody = document.getElementById('sheet-body');
  function openSheet(html) {
    sheetBody.innerHTML = html;
    if (sheet.showModal) sheet.showModal(); else sheet.setAttribute('open', '');
  }
  sheet.querySelector('.sheet-close').addEventListener('click', function () { sheet.close(); });
  sheet.addEventListener('click', function (e) { if (e.target === sheet) sheet.close(); });

  /* ---------- Islands ---------- */
  // ރަށުގެ މަޢުލޫމާތު: population boxes, women/men bar, then issues and focus areas as tags
  // ރަށުގެ މަޢުލޫމާތު, in two parts: population (shown first) and social issues (shown after the activities)
  function popHtml(isl) {
    if (isl.kind !== 'island') return '';
    var p = isl.profile || {};
    var h = '<h3>ރަށުގެ އާބާދީ</h3>';
    if (isl.profile_pending) return h + '<p><span class="pending-tag">ރަށުގެ މަޢުލޫމާތު އަދި ނުލިބޭ</span></p>';
    function n(v) { return v === '' || v == null ? '—' : esc(v); }
    var f = +p.female || 0, m = +p.male || 0, fp = f + m ? Math.round(f / (f + m) * 100) : 50;
    h += '<div class="pop">' +
      '<div class="pop-total"><b>' + n(p.total) + '</b><span>ޖުމްލަ އާބާދީ</span></div>' +
      '<div class="pop-cell"><b>' + n(p.female) + '</b><span>އަންހެން</span></div>' +
      '<div class="pop-cell"><b>' + n(p.male) + '</b><span>ފިރިހެން</span></div>' +
      '<div class="pop-cell"><b>' + n(p.students) + '</b><span>ސްކޫލު ދަރިވަރުން</span></div>' +
      '</div>';
    if (f + m) h += '<div class="pop-bar" title="އަންހެން / ފިރިހެން"><i class="f" style="width:' + fp + '%"></i><i class="m" style="width:' + (100 - fp) + '%"></i></div>' +
      '<div class="pop-legend"><span><i class="f"></i>އަންހެން <span dir="ltr">' + fp + '%</span></span><span><i class="m"></i>ފިރިހެން <span dir="ltr">' + (100 - fp) + '%</span></span></div>';
    return h;
  }
  // School sessions form, shown exactly as the school wrote it (English text, left-to-right)
  function schoolHtml(isl) {
    if (isl.kind !== 'island') return '';
    var sc = isl.school;
    var h = '<h3>ސްކޫލު ސެޝަންތައް</h3>';
    if (!sc) return h + '<p><span class="pending-tag">ސްކޫލު ސެޝަންތައް ފޯމު ނުފުރާ</span></p>';
    return h + '<div class="school" dir="ltr">' +
      '<div class="school-name">' + esc(sc.name || '') + '</div>' +
      ((sc.sessions || []).length ? '<div class="tag-list">' + sc.sessions.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div>' : '') +
      (sc.topics ? '<div class="school-topics">' + esc(sc.topics).replace(/\n/g, '<br>') + '</div>' : '') +
      (sc.focal ? '<div class="school-focal">' + ICON.user + '<span>' + esc(sc.focal) + '</span></div>' : '') +
      '</div>';
  }
  function issuesHtml(isl) {
    if (isl.kind !== 'island' || isl.profile_pending) return '';
    var p = isl.profile || {};
    function tags(txt) {
      var parts = String(txt || '').split('،').map(function (x) { return x.trim(); }).filter(Boolean);
      return parts.length ? '<div class="tag-list">' + parts.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div>' : '<p class="none" style="text-align:right;margin:.2rem 0">—</p>';
    }
    return '<h3>އިޖްތިމާޢީ މައްސަލަތައް</h3>' + tags(p.issues) +
      '<div class="prof-row"><div class="prof-label">އިތުރަށް އަލިއަޅުވާލަން ބޭނުންވާ</div>' + tags(p.focus) + '</div>' +
      '<div class="prof-row"><div class="prof-label">ސޯޝަލް މީޑިއަރ އިންފުލުއެންޒަރ</div><div class="prof-val">' + (p.influencer ? esc(p.influencer) : '—') + '</div></div>';
  }
  function islandSheet(i) {
    var isl = all[i];
    var info = isl.info || {};
    var infoKeys = Object.keys(info);
    var h = '<h2>' + (isl.kind === 'island' ? 'ބ. ' : '') + esc(isl.name) + '</h2>';
    h += '<div class="contact-card">';
    h += '<div>' + ICON.user + '<span class="lbl">ފޯކަލް ޕޮއިންޓް</span><strong>' + (isl.focal ? esc(isl.focal) : '—') + '</strong></div>';
    if (isl.title) h += '<div class="contact-title">' + esc(isl.title) + '</div>';
    h += '<div>' + ICON.phone + '<span class="lbl">ނަންބަރު</span>' +
      (isl.phone ? '<a href="tel:' + esc(String(isl.phone).replace(/\s/g, '')) + '" dir="ltr"><strong>' + esc(isl.phone) + '</strong></a>' : '<strong>—</strong>') + '</div>';
    if (isl.focal2 || isl.phone2) {
      h += '<div>' + ICON.user + '<span class="lbl">ފޯކަލް ޕޮއިންޓް 2</span><strong>' + (isl.focal2 ? esc(isl.focal2) : '—') + '</strong></div>';
      if (isl.phone2) h += '<div>' + ICON.phone + '<span class="lbl">ނަންބަރު</span><a href="tel:' + esc(String(isl.phone2).replace(/\s/g, '')) + '" dir="ltr"><strong>' + esc(isl.phone2) + '</strong></a></div>';
    }
    if (isl.email) h += '<div>' + ICON.mail + '<span class="lbl">އީމެއިލް</span><a href="mailto:' + esc(isl.email) + '" dir="ltr"><strong>' + esc(isl.email) + '</strong></a></div>';
    if (isl.kind === 'island') {
      var v = isl.volunteer || {};
      h += '<div class="cc-sep">' + ICON.user + '<span class="lbl">ވޮލަންޓިއަރު</span><strong dir="auto">' + (v.name ? esc(v.name) : 'ނުލިބޭ') + '</strong></div>';
      if (v.phone) h += '<div>' + ICON.phone + '<span class="lbl">ނަންބަރު</span><a href="tel:' + esc(String(v.phone).replace(/\s/g, '')) + '" dir="ltr"><strong>' + esc(v.phone) + '</strong></a></div>';
    }
    h += '</div>';
    if (isl.kind === 'island') h += '<div class="dars-box"><span class="dars-label">ބޮޑު ދަރުސް މައުޟޫޢު</span>' +
      (isl.main_dars ? '<strong>' + esc(isl.main_dars) + '</strong>' : '<span class="dars-none">އަދި ނުނިންމާ</span>') + '</div>';
    h += popHtml(isl);
    h += '<h3>އެދިފައިވާ ހަރަކާތްތައް</h3>' + (isl.pending ? '<p>' + '<span class="pending-tag">ހަރަކާތްތައް އަދި ނުލިބޭ</span>' + '</p>' : list(isl.activities));
    h += issuesHtml(isl);
    h += schoolHtml(isl);

    var team = isl.team || [];
    h += '<h3>ޓީމް</h3>';
    h += team.length
      ? '<ul class="team">' + team.map(function (m) {
          return '<li>' + ICON.user + '<span class="team-name">' + esc(m.name) + '</span>' +
            (m.role ? '<span class="team-role">' + esc(m.role) + '</span>' : '') + '</li>';
        }).join('') + '</ul>'
      : '<p class="none">' + EMPTY + '</p>';

    var sched = isl.schedule || [];
    h += '<h3>ހަރަކާތްތަކުގެ ޝެޑިއުލް</h3>';
    if (sched.length) {
      var days = [], byDay = {};
      sched.forEach(function (s) {
        var d = s.day || '';
        if (!byDay[d]) { byDay[d] = []; days.push(d); }
        byDay[d].push(s);
      });
      h += days.map(function (d) {
        return '<div class="sched-day">' + (d ? '<p class="sched-date">' + esc(d) + '</p>' : '') +
          '<ul class="sched">' + byDay[d].map(function (s) {
            return '<li' + (s.break ? ' class="is-break"' : '') + '><span class="sched-time" dir="ltr">' + esc(s.time || '') + '</span><span>' + esc(s.activity) + (s.by ? '<small class="sched-by">' + esc(s.by) + '</small>' : '') + '</span></li>';
          }).join('') + '</ul></div>';
      }).join('');
    } else {
      h += '<p class="none">' + EMPTY + '</p>';
    }

    h += '<h3>އިތުރު މައުލޫމާތު</h3>';
    h += infoKeys.length
      ? '<dl class="kv">' + infoKeys.map(function (k) { return '<dt>' + esc(k) + '</dt><dd>' + esc(info[k]) + '</dd>'; }).join('') + '</dl>'
      : '<p class="none">' + EMPTY + '</p>';
    openSheet(h);
  }

  var grid = document.getElementById('island-grid');
  var totalActs = 0, totalTeam = 0;
  all.forEach(function (x) { totalActs += (x.activities || []).length; totalTeam += (x.team || []).length; });
  // islands that have / haven't sent a volunteer
  var volHave = islands.filter(function (x) { return hasVol(x); }), volMissing = islands.filter(function (x) { return !hasVol(x); });
  // total population of the islands whose information has come in
  var popKnown = islands.filter(function (x) { return !x.profile_pending && x.profile && +x.profile.total; });
  var popTotal = popKnown.reduce(function (n, x) { return n + (+x.profile.total); }, 0);
  var summary = '<div class="island-summary">' +
    '<div><strong>' + islands.length + '</strong><span>ރަށް</span></div>' +
    '<div><strong>' + totalActs + '</strong><span>ހަރަކާތް</span></div>' +
    '<div class="sum-pop"><strong>' + popTotal.toLocaleString('en-US') + '</strong><span>ޖުމްލަ އާބާދީ</span>' +
      (popKnown.length < islands.length ? '<small><span dir="ltr">' + popKnown.length + '/' + islands.length + '</span> ރަށުގެ</small>' : '') + '</div>' +
    '<div><strong>' + totalTeam + '</strong><span>ޓީމު މެމްބަރުން</span></div>' +
    '<button type="button" class="vol-tile' + (volMissing.length ? ' has-missing' : '') + '" id="vol-btn"><strong><span dir="ltr">' + volHave.length + '/' + islands.length + '</span></strong><span>ވޮލަންޓިއަރުން</span>' +
      (volMissing.length ? '<small>' + volMissing.length + ' ރަށުން ނުލިބޭ</small>' : '') + '</button></div>';

  function stat(icon, n, label) {
    return '<span class="stat' + (n ? '' : ' stat-zero') + '">' + icon + '<b>' + n + '</b> ' + label + '</span>';
  }
  function hasVol(x) { return !!(x.volunteer && String(x.volunteer.name || '').trim()); }
  function card(x, i, num) {
    var island = x.kind === 'island';
    return '<div class="island' + (island ? '' : ' island-other') + '" role="button" tabindex="0" data-i="' + i + '">' +
      '<div class="island-head">' +
        (island ? '<span class="island-num">' + num + '</span><span class="island-atoll">ބ.</span>' : '<span class="head-icon">' + ICON.building + '</span>') +
        '<span class="island-name">' + esc(x.name) + '</span></div>' +
      '<div class="island-body">' +
        '<div class="focal"><span class="avatar">' + (x.focal ? esc(x.focal.charAt(0)) : ICON.user) + '</span>' +
          '<span class="focal-text"><span class="focal-label">ފޯކަލް ޕޮއިންޓް</span><span class="focal-name">' + (x.focal ? esc(x.focal) : '—') + '</span>' +
          (x.title ? '<span class="focal-title">' + esc(x.title) + '</span>' : '') + '</span></div>' +
        (x.phone ? '<a class="call" href="tel:' + esc(String(x.phone).replace(/\s/g, '')) + '">' + ICON.phone + '<span dir="ltr">' + esc(x.phone) + '</span></a>' : '') +
        (x.focal2 ? '<div class="focal focal-2"><span class="avatar">' + esc(x.focal2.charAt(0)) + '</span>' +
          '<span class="focal-text"><span class="focal-label">ފޯކަލް ޕޮއިންޓް 2</span><span class="focal-name">' + esc(x.focal2) + '</span></span></div>' : '') +
        (x.phone2 ? '<a class="call" href="tel:' + esc(String(x.phone2).replace(/\s/g, '')) + '">' + ICON.phone + '<span dir="ltr">' + esc(x.phone2) + '</span></a>' : '') +
        (island ? '<div class="card-vol' + (hasVol(x) ? '' : ' none-yet') + '"><span class="focal-label">ވޮލަންޓިއަރު</span>' +
          (hasVol(x) ? '<span class="cv-name" dir="auto">' + esc(x.volunteer.name) + '</span>' +
            (x.volunteer.phone ? '<a class="cv-phone" href="tel:' + esc(String(x.volunteer.phone).replace(/\s/g, '')) + '" dir="ltr">' + esc(x.volunteer.phone) + '</a>' : '')
            : '<span class="cv-name">ނުލިބޭ</span>') + '</div>' : '') +
      '</div>' +
      '<div class="island-stats">' +
        (x.pending ? '<span class="pending-tag">ހަރަކާތްތައް އަދި ނުލިބޭ</span>' : stat(ICON.list, (x.activities || []).length, 'ހަރަކާތް')) +
        stat(ICON.team, (x.team || []).length, 'މީހުން') +
        stat(ICON.clock, (x.schedule || []).length, 'ޝެޑިއުލް') +
      '</div></div>';
  }

  var html = '';
  var islandList = all.filter(function (x) { return x.kind === 'island'; });
  var missingN = islandList.filter(function (x) { return x.profile_pending || !x.school_form || x.pending || !String(x.main_dars || '').trim(); }).length;
  var bellHtml = '<button type="button" class="upd-btn upd-tile" id="upd-btn">' +
    '<svg class="icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>' +
    '<span>އަޕްޑޭޓްތައް</span>' + (missingN ? '<b class="upd-badge">' + missingN + '</b>' : '') + '</button>';
  if (islands.length) {
    html += summary.replace('<div class="island-summary">', '<div class="island-summary has-bell">' + bellHtml) + '<div class="island-cards">' +
      all.filter(function (x) { return x.kind === 'island'; }).map(function (x, n) { return card(x, n, n + 1); }).join('') + '</div>';
  }
  if (others.length) {
    html += '<h2 class="group-title">އެހެނިހެން ބައިވެރިން</h2><div class="island-cards">' +
      others.map(function (x, n) { return card(all[islands.length + n], islands.length + n); }).join('') + '</div>';
  }
  grid.innerHTML = html || '<p class="none">' + EMPTY + '</p>';
  function volStatusSheet() {
    function chips(list) { return '<div class="chips">' + list.map(function (x) { return '<button class="chip" data-i="' + all.indexOf(x) + '">' + esc(x.name) + '</button>'; }).join('') + '</div>'; }
    var h = '<h2>ވޮލަންޓިއަރުން</h2>';
    h += '<div class="upd-status warn"><div class="upd-status-head"><span>ނުލިބޭ</span><b>' + volMissing.length + ' ރަށް</b></div>' + (volMissing.length ? chips(volMissing) : '<p class="upd-done">✓ ހުރިހާ ރަށަކުން ލިބިއްޖެ</p>') + '</div>';
    h += '<div class="upd-status ok"><div class="upd-status-head"><span>ލިބިފައި</span><b>' + volHave.length + ' ރަށް</b></div>' +
      (volHave.length ? '<div class="vol-got">' + volHave.map(function (x) {
        return '<button class="chip" data-i="' + all.indexOf(x) + '">' + esc(x.name) + '</button><span dir="auto">' + esc(x.volunteer.name) + '</span>' +
          (x.volunteer.phone ? '<a href="tel:' + esc(String(x.volunteer.phone).replace(/\s/g, '')) + '" dir="ltr">' + esc(x.volunteer.phone) + '</a>' : '<span></span>');
      }).join('') + '</div>' : '<p class="none" style="text-align:right">—</p>') + '</div>';
    openSheet(h);
  }
  function updatesSheet() {
    var MON = ['ޖަނަވަރީ', 'ފެބްރުއަރީ', 'މާރިޗު', 'އޭޕްރީލް', 'މެއި', 'ޖޫން', 'ޖުލައި', 'އޮގަސްޓު', 'ސެޕްޓެމްބަރު', 'އޮކްޓޫބަރު', 'ނޮވެންބަރު', 'ޑިސެމްބަރު'];
    function d(iso) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ''); return m ? (+m[3]) + ' ' + MON[+m[2] - 1] + ' ' + m[1] : esc(iso || ''); }
    function chips(list) {
      return '<div class="chips">' + list.map(function (x) { return '<button class="chip" data-i="' + all.indexOf(x) + '">' + esc(x.name) + '</button>'; }).join('') + '</div>';
    }
    function status(title, list, cls) {
      return '<div class="upd-status ' + cls + '"><div class="upd-status-head"><span>' + title + '</span><b>' + list.length + ' ރަށް</b></div>' +
        (list.length ? chips(list) : '<p class="upd-done">✓ ހުރިހާ ރަށެއް ފުރިއްޖެ</p>') + '</div>';
    }
    var ups = (T.island_updates || []).slice().sort(function (a, b) { return (b.date || '') < (a.date || '') ? -1 : 1; });
    var h = '<h2>އަޕްޑޭޓްތައް</h2>';
    h += '<h3>ފަހުގެ އަޕްޑޭޓްތައް</h3>';
    h += ups.length ? '<div class="upd-list">' + ups.map(function (u) {
      var names = (u.islands || []).map(function (n) { return all.filter(function (x) { return x.name === n; })[0]; }).filter(Boolean);
      return '<div class="upd-item"><time>' + d(u.date) + '</time><div class="upd-text">' + esc(u.text || '') +
        (names.length ? ' <span class="upd-count nowrap">· ' + names.length + ' ރަށް</span>' + chips(names) : '') + '</div></div>';
    }).join('') + '</div>' : '<p class="none">' + EMPTY + '</p>';
    h += '<h3>ނުފުރާ ރަށްތައް</h3>';
    h += status('ރަށުގެ މަޢުލޫމާތު ނުފުރާ', islandList.filter(function (x) { return x.profile_pending; }), 'warn');
    h += status('ސްކޫލު ސެޝަންތައް ފޯމު ނުފުރާ', islandList.filter(function (x) { return !x.school_form; }), 'warn');
    h += status('ހަރަކާތްތައް ނުފޮނުވާ', islandList.filter(function (x) { return x.pending; }), 'warn');
    h += status('ވޮލަންޓިއަރު ނުލިބޭ', volMissing, 'warn');
    h += status('ބޮޑު ދަރުސް މައުޟޫޢު ނުލިބޭ', islandList.filter(function (x) { return !String(x.main_dars || '').trim(); }), 'warn');
    openSheet(h);
  }
  sheet.addEventListener('click', function (e) {
    var c = e.target.closest('.upd-status .chip, .upd-item .chip, .vol-got .chip');
    if (c) islandSheet(+c.dataset.i);
  });
  grid.addEventListener('click', function (e) {
    if (e.target.closest('#upd-btn')) { updatesSheet(); return; }
    if (e.target.closest('#vol-btn')) { volStatusSheet(); return; }
    if (e.target.closest('.cv-phone')) return;
    if (e.target.closest('.call')) return;
    var b = e.target.closest('.island');
    if (b) islandSheet(+b.dataset.i);
  });
  grid.addEventListener('keydown', function (e) {
    var b = e.target.closest('.island');
    if (b && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); islandSheet(+b.dataset.i); }
  });

  /* ---------- Org chart: levels of people, top level first ---------- */
  var levels = (T.org || []).filter(function (l) { return (l.people || []).length; });
  var flatRoles = [];
  var org = document.getElementById('org');
  org.innerHTML = levels.length ? '<div class="orgchart">' + levels.map(function (l, li) {
    return (li ? '<div class="org-link" aria-hidden="true"></div>' : '') +
      '<div class="org-level' + (li ? '' : ' org-top') + '" style="--n:' + l.people.length + '">' + l.people.map(function (p) {
        var id = flatRoles.push(p) - 1;
        var resp = p.responsibilities || [];
        return '<div class="org-node" role="button" tabindex="0" data-r="' + id + '">' +
          '<div class="org-band"></div>' +
          '<span class="org-namebox">' + (p.name ? esc(p.name) : '—') + '</span>' +
          (p.role ? '<span class="org-role">' + esc(p.role) + '</span>' : '') +
          (resp.length ? '<ul class="org-preview">' + resp.slice(0, 2).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') +
            (resp.length > 2 ? '<li class="org-more">+ ' + (resp.length - 2) + ' އިތުރު</li>' : '') + '</ul>' : '') +
          '<span class="org-btn">' + ICON.list + 'ޒިންމާތައް' + (resp.length ? ' <b>' + resp.length + '</b>' : '') + '</span>' +
          '</div>';
      }).join('') + '</div>';
  }).join('') + '</div>' : '<p class="none">' + EMPTY + '</p>';
  function roleSheet(id) {
    var r = flatRoles[id];
    openSheet((r.role ? '<p class="sheet-kicker">' + esc(r.role) + '</p>' : '') + '<h2>' + (r.name ? esc(r.name) : '—') + '</h2>' +
      '<h3>ޒިންމާތައް</h3>' + list(r.responsibilities));
  }
  org.addEventListener('click', function (e) {
    var n = e.target.closest('.org-node');
    if (n) roleSheet(+n.dataset.r);
  });
  org.addEventListener('keydown', function (e) {
    var n = e.target.closest('.org-node');
    if (n && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); roleSheet(+n.dataset.r); }
  });

  /* ---------- Activities (grouped across islands) ---------- */
  // Activities with different wording but the same meaning are joined by T.activity_groups
  var groupOf = {};
  (T.activity_groups || []).forEach(function (g) { (g.items || []).forEach(function (t) { groupOf[String(t).trim()] = g.name; }); });
  var acts = {};   // group name -> [{i: participant index, text: original wording}]
  all.forEach(function (isl, i) {
    (isl.activities || []).forEach(function (a) {
      var text = String(a).trim();
      if (!text) return;
      var key = groupOf[text] || text;
      (acts[key] = acts[key] || []).push({ i: i, text: text });
    });
  });
  function uniq(list) { return list.map(function (x) { return x.i; }).filter(function (i, n, arr) { return arr.indexOf(i) === n; }); }
  var actNames = Object.keys(acts).sort(function (a, b) { return uniq(acts[b]).length - uniq(acts[a]).length; });
  var actEl = document.getElementById('activity-list');
  actEl.innerHTML = actNames.length
    ? '<p class="summary">' + actNames.length + ' ހަރަކާތް · ' + all.filter(function (s) { return (s.activities || []).length; }).length + ' ބައިވެރިންގެ ފަރާތުން</p>' +
      '<div class="act-grid">' + actNames.map(function (a, n) {
        var who = uniq(acts[a]);
        return '<div class="act" data-g="' + n + '" role="button" tabindex="0">' +
          '<div class="act-head"><span class="act-name">' + esc(a) + '</span>' +
          '<span class="act-count"><strong>' + who.length + '</strong> ' +
            (who.every(function (i) { return all[i].kind === 'island'; }) ? 'ރަށް' : 'ބައިވެރިން') + '</span></div>' +
          '<div class="chips">' + who.map(function (i) {
            return '<button class="chip" data-i="' + i + '">' + esc(all[i].name) + '</button>';
          }).join('') + '</div></div>';
      }).join('') + '</div>'
    : '<p class="none">އަދި އެއްވެސް ރަށަކުން ހަރަކާތެއް އެދިފައެއް ނުވޭ</p>';
  var pend = all.map(function (x, i) { return x.pending ? i : -1; }).filter(function (i) { return i >= 0; });
  if (pend.length) actEl.innerHTML = '<div class="pending-box"><span>ހަރަކާތްތައް އަދި ނުލިބޭ:</span><div class="chips">' +
    pend.map(function (i) { return '<button class="chip" data-i="' + i + '">' + esc(all[i].name) + '</button>'; }).join('') + '</div></div>' + actEl.innerHTML;

  // Two views: by island (every activity each island and its school asked for) and by activity (grouped)
  (function () {
    var byType = actEl.innerHTML;
    var islOnly = all.filter(function (x) { return x.kind === 'island'; });
    function box(x, n) {
      var acts = x.activities || [], sc = x.school;
      var h = '<div class="ai" role="button" tabindex="0" title="ބޮޑުކޮށް ބަލާ"><div class="ai-head">' + (n ? '<span class="ai-n">' + n + '</span>' : '') +
        '<button class="ai-name" data-i="' + all.indexOf(x) + '">' + (x.kind === 'island' ? 'ބ. ' : '') + esc(x.name) + '</button>' +
        '<span class="ai-count">' + (acts.length + (sc ? (sc.sessions || []).length : 0)) + '</span></div>';
      h += '<div class="ai-sec"><div class="ai-label">ރަށުން އެދިފައިވާ</div>' +
        (x.pending ? '<span class="pending-tag">ހަރަކާތްތައް އަދި ނުލިބޭ</span>'
          : acts.length ? '<ol class="ai-list">' + acts.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ol>' : '<p class="none" style="text-align:right;margin:0">—</p>') + '</div>';
      if (x.kind === 'island') h += '<div class="ai-sec"><div class="ai-label">ސްކޫލުން އެދިފައިވާ</div>' +
        (sc ? '<ol class="ai-list ai-en" dir="ltr">' + (sc.sessions || []).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ol>' +
              (sc.topics ? '<div class="ai-topics" dir="ltr">' + esc(sc.topics).replace(/\n/g, '<br>') + '</div>' : '')
            : '<span class="pending-tag">ސްކޫލު ސެޝަންތައް ފޯމު ނުފުރާ</span>') + '</div>';
      return h + '</div>';
    }
    var byIsland = '<div class="ai-grid">' + islOnly.map(function (x, i) { return box(x, i + 1); }).join('') + '</div>';
    actEl.innerHTML = '<div class="seg" role="tablist"><button type="button" data-v="island" aria-selected="true">ރަށްތަކުގެ ގޮތުން</button>' +
      '<button type="button" data-v="type" aria-selected="false">ހަރަކާތްތަކުގެ ގޮތުން</button></div>' +
      '<div class="act-view" data-view="island">' + byIsland + '</div><div class="act-view" data-view="type" hidden>' + byType + '</div>';
    actEl.querySelector('.seg').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      actEl.querySelectorAll('.seg button').forEach(function (x) { x.setAttribute('aria-selected', x === b); });
      actEl.querySelectorAll('.act-view').forEach(function (v) { v.hidden = v.dataset.view !== b.dataset.v; });
    });
  })();
  /* ---------- PDF download (shared by the activities and schools tabs) ---------- */
  var DL_LABEL = 'PDF ބަލާ';
  function dlButton() {
    var bar = document.createElement('div'); bar.className = 'print-bar';
    bar.innerHTML = '<button type="button" class="print-btn"><svg class="icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 17v3h16v-3"/></svg><span>' + DL_LABEL + '</span></button>';
    return bar;
  }
  function pdfNum(v) { return '<span class="p-num">' + v + '</span>'; }
  function pdfHeader() {
    var title = (document.querySelector('.event h1') || {}).textContent || '';
    var sub = (document.querySelector('.event-sub') || {}).textContent || '';
    var logo = document.querySelector('link[rel="icon"]');
    return '<header class="p-head">' + (logo ? '<img src="' + logo.href + '" alt="">' : '') +
      '<div><h1>' + esc(title).replace(/(\d+)/g, pdfNum('$1')) + '</h1><p>' + esc(sub).replace(/(\d+)/g, pdfNum('$1')) + '</p></div></header>';
  }
  // Show the finished PDF as page images first; download only when asked
  function pdfPreview(pdf, canvas, filename) {
    var pageH = Math.floor(canvas.width * 297 / 210), n = pdf.internal.getNumberOfPages();
    var dlg = document.getElementById('pdf-preview');
    if (!dlg) {
      dlg = document.createElement('dialog'); dlg.id = 'pdf-preview'; dlg.className = 'pdf-preview';
      document.body.appendChild(dlg);
      dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    }
    var bar = '<div class="pv-bar"><span class="pv-title">' + esc(filename.replace(/\.pdf$/, '')) + ' <small dir="ltr">' + n + ' pages</small></span>' +
      '<button type="button" class="btn-dl"><svg class="icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 17v3h16v-3"/></svg>ޑައުންލޯޑް</button>' +
      '<button type="button" class="btn-close" aria-label="ބަންދުކުރޭ">✕</button></div>';
    var pages = '';
    for (var i = 0; i < n; i++) {
      var t = document.createElement('canvas'); t.width = canvas.width; t.height = pageH;
      var g = t.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, t.width, t.height);
      g.drawImage(canvas, 0, i * pageH, canvas.width, pageH, 0, 0, canvas.width, pageH);
      pages += '<img src="' + t.toDataURL('image/jpeg', 0.85) + '" alt="' + (i + 1) + '">';
    }
    dlg.innerHTML = bar + '<div class="pv-pages">' + pages + '</div>';
    dlg.querySelector('.btn-dl').addEventListener('click', function () { pdf.save(filename); });
    dlg.querySelector('.btn-close').addEventListener('click', function () { dlg.close(); });
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    dlg.querySelector('.pv-pages').scrollTop = 0;
  }
  // blocks: html strings in reading order; 'break' starts a new page, 'table' places tableHtml (split across pages if needed)
  function pdfDownload(btn, blocks, tableHtml, filename) {
    var label = btn.querySelector('span'), labelText = label.textContent;
    // The PDF engine loses spaces between right-to-left words, so give every word its own box
    function wordify(root) {
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), nodes = [];
      while (walker.nextNode()) if (/\S\s+\S/.test(walker.currentNode.nodeValue)) nodes.push(walker.currentNode);
      nodes.forEach(function (n) {
        var frag = document.createDocumentFragment();
        n.nodeValue.split(/\s+/).forEach(function (w, i, arr) {
          if (!w) return;
          // right-to-left marks keep brackets and commas on the correct side
          var sp = document.createElement('span'); sp.className = 'w'; sp.textContent = /[ހ-޿]/.test(w) ? '‏' + w + '‏' : w; frag.appendChild(sp);
          if (i < arr.length - 1) frag.appendChild(document.createTextNode(' '));
        });
        n.parentNode.replaceChild(frag, n);
      });
    }

    // Lay the blocks out on A4 pages ourselves, so no island box or table row is ever cut in half
    function buildPages() {
      var meas = document.createElement('div');
      meas.className = 'pdf-doc pdf-measure';
      var mpage = document.createElement('div'); mpage.className = 'p-page';
      meas.appendChild(mpage); document.body.appendChild(meas);
      var nodes = blocks.map(function (b) {
        if (b === 'break') return 'break';
        var d = document.createElement('div'); d.className = 'blk';
        d.innerHTML = b === 'table' ? tableHtml : b;
        if (b === 'table') d.setAttribute('data-split', '1');   // only the big table is split across pages
        mpage.appendChild(d); return d;
      });
      wordify(mpage);
      var cs = getComputedStyle(mpage);
      var avail = mpage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - 4;
      var pages = [[]], used = 0;
      function place(node, h) {
        if (used + h > avail && pages[pages.length - 1].length) { pages.push([]); used = 0; }
        pages[pages.length - 1].push(node); used += h;
      }
      nodes.forEach(function (n) {
        if (n === 'break') { if (pages[pages.length - 1].length) { pages.push([]); used = 0; } return; }
        var table = n.getAttribute('data-split') ? n.querySelector('table') : null;
        if (!table) { place(n, n.offsetHeight); return; }
        // split the table into page-sized pieces, repeating the header row
        var headH = table.tHead.offsetHeight, rows = [].slice.call(table.tBodies[0].rows), chunk = null;
        rows.forEach(function (tr) {
          var h = tr.offsetHeight;
          if (!chunk || used + h > avail) {
            if (chunk && used + h > avail) { pages.push([]); used = 0; }
            var d = document.createElement('div'); d.className = 'blk';
            var t = document.createElement('table'); t.className = 'p-table';
            t.appendChild(table.tHead.cloneNode(true)); t.appendChild(document.createElement('tbody'));
            d.appendChild(t); chunk = t.tBodies[0];
            if (used + headH + h > avail && pages[pages.length - 1].length) { pages.push([]); used = 0; }
            pages[pages.length - 1].push(d); used += headH;
          }
          chunk.appendChild(tr.cloneNode(true)); used += h;
        });
      });
      document.body.removeChild(meas);
      var doc = document.createElement('div'); doc.className = 'pdf-doc';
      pages.forEach(function (list, i) {
        var pg = document.createElement('div'); pg.className = 'p-page';
        list.forEach(function (n) { pg.appendChild(n.cloneNode(true)); });
        var no = document.createElement('div'); no.className = 'p-pageno'; no.textContent = (i + 1) + ' / ' + pages.length;
        pg.appendChild(no); doc.appendChild(pg);
      });
      return doc;
    }

    function save() {
      label.textContent = 'ތައްޔާރުކުރަނީ...'; btn.disabled = true;
      // the PDF engine shifts the page down by the current scroll position, so render from the top
      var sy = window.scrollY;
      document.fonts.ready.then(function () {
        window.scrollTo(0, 0);
        var doc = buildPages();
        return window.html2pdf().set({
          margin: 0,
          filename: filename,
          image: { type: 'jpeg', quality: 0.95 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: [] }
        }).from(doc).toPdf().then(function () { pdfPreview(this.prop.pdf, this.prop.canvas, filename); });
      }).catch(function () { alert('PDF ހެދިއެއް ނުދިޔައީ. އަލުން މަސައްކަތްކުރައްވާ.'); })
        .then(function () { window.scrollTo(0, sy); label.textContent = labelText; btn.disabled = false; });
    }
    if (window.html2pdf) save();
    else {
      label.textContent = 'ތައްޔާރުކުރަނީ...';
      var sc = document.createElement('script');
      sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      sc.onload = save;
      sc.onerror = function () { label.textContent = labelText; alert('PDF ހެދިއެއް ނުދިޔައީ. އިންޓަނެޓް ޗެކްކުރައްވާ.'); };
      document.head.appendChild(sc);
    }
  }

  /* ---------- Print: activities by island, then by activity ---------- */
  var printBtn = dlButton();
  actEl.insertBefore(printBtn, actEl.firstChild);
  printBtn.querySelector('button').addEventListener('click', function () {
    var title = (document.querySelector('.event h1') || {}).textContent || '';
    var sub = (document.querySelector('.event-sub') || {}).textContent || '';
    var logo = document.querySelector('link[rel="icon"]');
    var islandsOnly = all.filter(function (x) { return x.kind === 'island'; });
    var others = all.filter(function (x) { return x.kind !== 'island'; });
    function num(v) { return '<span class="p-num">' + v + '</span>'; }
    function block(x, n) {
      var acts = x.activities || [];
      return '<section class="p-island"><h3>' + (n ? '<span class="p-n">' + n + '</span>' : '') + (x.kind === 'island' ? 'ބ. ' : '') + esc(x.name) +
        (x.focal ? '<small>' + esc(x.focal) + (x.phone ? ' · ' + num(esc(x.phone)) : '') +
          (x.focal2 ? ' / ' + esc(x.focal2) + (x.phone2 ? ' · ' + num(esc(x.phone2)) : '') : '') + '</small>' : '') + '</h3>' +
        (x.pending ? '<p class="p-pending">ހަރަކާތްތައް އަދި ނުލިބޭ</p>'
          : acts.length ? '<div class="p-list">' + acts.map(function (a, k) { return '<div class="p-row"><span class="p-k">' + (k + 1) + '.</span><span>' + esc(a) + '</span></div>'; }).join('') + '</div>' : '<p class="p-pending">—</p>') +
        '</section>';
    }
    var totalActs = all.reduce(function (n, x) { return n + (x.activities || []).length; }, 0);
    // Blocks in reading order. Islands go two to a row; 'break' starts a new page.
    var blocks = [];
    blocks.push('<header class="p-head">' + (logo ? '<img src="' + logo.href + '" alt="">' : '') +
      '<div><h1>' + esc(title).replace(/(\d+)/g, num('$1')) + '</h1><p>' + esc(sub).replace(/(\d+)/g, num('$1')) + '</p></div></header>');
    blocks.push('<h2>' + num('1.') + ' ރަށްތަކުން އެދިފައިވާ ހަރަކާތްތައް</h2><p class="p-sum">' + num(islandsOnly.length) + ' ރަށް · ' + num(totalActs) + ' ހަރަކާތް</p>');
    for (var r = 0; r < islandsOnly.length; r += 2)
      blocks.push('<div class="p-row2">' + block(islandsOnly[r], r + 1) + (islandsOnly[r + 1] ? block(islandsOnly[r + 1], r + 2) : '') + '</div>');
    if (others.length) {
      blocks.push('<h2>އެހެނިހެން ބައިވެރިން</h2>');
      for (var o = 0; o < others.length; o += 2) blocks.push('<div class="p-row2">' + block(others[o]) + (others[o + 1] ? block(others[o + 1]) : '') + '</div>');
    }
    blocks.push('break');
    blocks.push('<h2>' + num('2.') + ' ހަރަކާތްތަކަށް އެދިފައިވާ ރަށްތައް</h2><p class="p-sum">' + num(actNames.length) + ' ހަރަކާތް · ބޮޑު އަދަދަކުން އެދިފައިވާ ހަރަކާތްތައް މަތީގައި</p>');
    blocks.push('table');
    blocks.push('<p class="p-foot">ތައްޔާރުކުރި ތާރީޚު: ' + dvDate(today).replace(/(\d+)/g, num('$1')) + '</p>');
    var tableHtml = '<table class="p-table"><thead><tr><th>#</th><th>ހަރަކާތް</th><th>އަދަދު</th><th>ރަށްތައް</th></tr></thead><tbody>' +
      actNames.map(function (a, i) {
        var who = uniq(acts[a]);
        return '<tr><td>' + (i + 1) + '</td><td>' + esc(a) + '</td><td class="p-c">' + who.length + '</td><td>' +
          who.map(function (k) { return esc(all[k].name); }).join('، ') + '</td></tr>';
      }).join('') + '</tbody></table>';

    pdfDownload(printBtn.querySelector('button'), blocks, tableHtml, (title || 'activities').trim() + ' - ހަރަކާތްތައް.pdf');
  });

  function goToIsland(i) {
    var t = document.querySelector('.tabs [data-tab="islands"]');
    if (t) t.click();
    var card = document.querySelector('#island-grid .island[data-i="' + i + '"]');
    if (!card) return;
    setTimeout(function () {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.add('flash');
      setTimeout(function () { card.classList.remove('flash'); }, 1800);
    }, 50);
  }
  function actSheet(n) {
    var a = actNames[n];
    openSheet('<p class="sheet-kicker">ހަރަކާތް</p><h2>' + esc(a) + '</h2>' +
      '<h3>' + uniq(acts[a]).length + ' ރަށުން ލިޔެފައިވާ ގޮތް</h3><ul class="act-sources">' +
      acts[a].map(function (x) {
        return '<li><button class="chip" data-i="' + x.i + '">' + esc(all[x.i].name) + '</button><span>' + esc(x.text) + '</span></li>';
      }).join('') + '</ul>');
  }
  actEl.addEventListener('click', function (e) {
    var nb = e.target.closest('.ai-name');
    if (nb) { goToIsland(+nb.dataset.i); return; }
    var box = e.target.closest('.ai');
    if (box && !e.target.closest('.chip')) {
      var open = !box.classList.contains('ai-open');
      actEl.querySelectorAll('.ai.ai-open').forEach(function (b) { b.classList.remove('ai-open'); });
      if (open) { box.classList.add('ai-open'); box.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      return;
    }
    var c = e.target.closest('.chip');
    if (c) { islandSheet(+c.dataset.i); return; }
    var g = e.target.closest('.act');
    if (g) actSheet(+g.dataset.g);
  });
  actEl.addEventListener('keydown', function (e) {
    var g = e.target.closest('.act');
    if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); actSheet(+g.dataset.g); }
  });
  // chips inside the popup open that island
  sheet.addEventListener('click', function (e) {
    var c = e.target.closest('.act-sources .chip');
    if (c) islandSheet(+c.dataset.i);
  });

  /* ---------- Facilitators ---------- */
  var F = T.facilitators || {};
  var facGroups = [
    { title: 'ޝައިޚުން', people: F.sheikhs || [] },
    { title: 'އެހެނިހެން', people: F.others || [] }
  ];
  var facAll = [];
  var PIN = '<svg class="icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';
  var WORKSHOP = '<svg class="icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M12 16v4M8 20h8"/></svg>';

  function inMale(p) { return !(p.route || []).length; }
  function routeChain(p) {
    if (inMale(p) && !p.island) return '<span class="route-chip">—</span>';
    if (inMale(p)) return '<span class="route-chip route-male">މާލޭގައި</span>';
    return '<span class="route-chain">' + p.route.map(function (r) { return '<span>' + esc(r) + '</span>'; }).join('<i>←</i>') + '</span>';
  }
  function releaseTag(p) {
    return p.release === 'yes' ? '<span class="rel rel-yes">ރިލީސް ބޭނުން</span>'
      : p.release === 'no' ? '<span class="rel rel-no">ރިލީސް ނުލާ</span>' : '';
  }
  function facCard(p, i) {
    return '<div class="fac" role="button" tabindex="0" data-f="' + i + '">' +
      '<div class="fac-top"><span class="fac-avatar">' + (p.name ? esc(p.name.charAt(0)) : ICON.user) + '</span>' +
        '<div class="fac-id"><span class="fac-name">' + (p.name ? esc(p.name) : '—') + '</span>' +
        (p.island ? '<span class="fac-island">' + PIN + esc(p.island) + '</span>' : '') +
        (p.workplace ? '<span class="fac-island">' + esc(p.workplace) + '</span>' : '') + releaseTag(p) + '</div></div>' +
      '<div class="fac-route"><span class="fac-label">ދަތުރުގެ މަގު</span>' + routeChain(p) + '</div>' +
      (p.phone ? '<a class="call fac-call" href="tel:' + esc(String(p.phone).replace(/\s/g, '')) + '">' + ICON.phone + '<span dir="ltr">' + esc(p.phone) + '</span></a>' : '') +
      '<div class="island-stats">' +
        stat(ICON.list, (p.activities || []).length, 'ހަރަކާތް') +
        stat(WORKSHOP, (p.workshops || []).length, 'ވޯކްޝޮޕް') +
      '</div></div>';
  }
  function facSheet(i) {
    var p = facAll[i];
    var h = '<p class="sheet-kicker">' + esc(p._group) + '</p><h2>' + (p.name ? esc(p.name) : '—') + '</h2>';
    h += '<div class="contact-card">';
    h += '<div>' + PIN + '<span class="lbl">ރަށް</span><strong>' + (p.island ? esc(p.island) : '—') + '</strong></div>';
    if (p.phone) h += '<div>' + ICON.phone + '<span class="lbl">ނަންބަރު</span><a href="tel:' + esc(String(p.phone).replace(/\s/g, '')) + '" dir="ltr"><strong>' + esc(p.phone) + '</strong></a></div>';
    h += '</div>';
    if (p.email) h = h.replace(/<\/div>$/, '') + '<div>' + ICON.mail + '<span class="lbl">އީމެއިލް</span><a href="mailto:' + esc(p.email) + '" dir="ltr"><strong>' + esc(p.email) + '</strong></a></div></div>';
    if (p.workplace) h = h.replace(/<\/div>$/, '') + '<div><span class="lbl">މަސައްކަތްކުރާ ތަން</span><strong>' + esc(p.workplace) + '</strong></div></div>';
    h = h.replace(/<\/div>$/, '') + '<div><span class="lbl">ވަޒީފާއިން ރިލީސް</span><strong>' +
      (p.release === 'yes' ? 'ބޭނުން' : p.release === 'no' ? 'ނުލާ' : '—') + '</strong></div></div>';
    h += '<h3>ދަތުރުގެ މަގު</h3>';
    h += inMale(p) && !p.island ? '<p class="none">' + EMPTY + '</p>' : inMale(p)
      ? '<p><span class="route-chip route-male">މާލޭގައި</span></p>'
      : '<ol class="route-steps">' + p.route.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ol>';
    function tags(arr) {
      return arr && arr.length ? '<div class="tag-list">' + arr.map(function (a) { return '<span>' + esc(a) + '</span>'; }).join('') + '</div>'
        : '<p class="none">' + EMPTY + '</p>';
    }
    h += '<div class="side-by-side">' +
      '<div><h3>ކުރެވޭނެ ހަރަކާތްތައް</h3>' + tags(p.activities) + '</div>' +
      '<div><h3>ވޯކްޝޮޕްތައް</h3>' + tags(p.workshops) + '</div></div>';
    if (p.notes) h += '<h3>ނޯޓު</h3><p class="fac-notes">' + esc(p.notes).replace(/\n/g, '<br>') + '</p>';
    openSheet(h);
  }
  var facEl = document.getElementById('facilitators');
  if (facEl) {
    var relN = facGroups.reduce(function (n, g) { return n + g.people.filter(function (p) { return p.release === 'yes'; }).length; }, 0);
    facEl.innerHTML = (relN ? '<p class="rel-summary"><span class="rel rel-yes">ރިލީސް ބޭނުން</span> ' + relN + ' މީހުން</p>' : '') + facGroups.map(function (g) {
      var cards = g.people.map(function (p) {
        var i = facAll.push(Object.assign({ _group: g.title }, p)) - 1;
        return facCard(p, i);
      }).join('');
      return '<h2 class="group-title">' + g.title + ' <span class="group-count">' + g.people.length + '</span></h2>' +
        (cards ? '<div class="fac-cards">' + cards + '</div>' : '<p class="none">' + EMPTY + '</p>');
    }).join('');
    // Volunteers, below the facilitators
    var vols = T.volunteers || [];
    facEl.insertAdjacentHTML('beforeend', '<h2 class="group-title">ވޮލަންޓިއަރުން <span class="group-count">' + vols.length + '</span></h2>' +
      (vols.length ? '<div class="vol-cards">' + vols.map(function (v, i) {
        return '<div class="vol" role="button" tabindex="0" data-v="' + i + '">' +
          '<span class="vol-avatar">' + (v.name ? esc(v.name.charAt(0)) : ICON.user) + '</span>' +
          '<div class="vol-main"><div class="vol-name">' + (v.name ? esc(v.name) : '—') + '</div>' +
            '<div class="task-meta">' + (v.island ? '<span>' + PIN + esc(v.island) + '</span>' : '') + (v.role ? '<span>' + esc(v.role) + '</span>' : '') + '</div></div>' +
          (v.phone ? '<a class="call" href="tel:' + esc(String(v.phone).replace(/\s/g, '')) + '">' + ICON.phone + '<span dir="ltr">' + esc(v.phone) + '</span></a>' : '') +
          '</div>';
      }).join('') + '</div>' : '<p class="none">' + EMPTY + '</p>'));
    function volSheet(i) {
      var v = vols[i];
      var h = '<p class="sheet-kicker">ވޮލަންޓިއަރު</p><h2>' + (v.name ? esc(v.name) : '—') + '</h2><div class="contact-card">' +
        '<div>' + PIN + '<span class="lbl">ރަށް</span><strong>' + (v.island ? esc(v.island) : '—') + '</strong></div>' +
        (v.phone ? '<div>' + ICON.phone + '<span class="lbl">ނަންބަރު</span><a href="tel:' + esc(String(v.phone).replace(/\s/g, '')) + '" dir="ltr"><strong>' + esc(v.phone) + '</strong></a></div>' : '') +
        (v.email ? '<div>' + ICON.mail + '<span class="lbl">އީމެއިލް</span><a href="mailto:' + esc(v.email) + '" dir="ltr"><strong>' + esc(v.email) + '</strong></a></div>' : '') +
        (v.role ? '<div><span class="lbl">މަސައްކަތް</span><strong>' + esc(v.role) + '</strong></div>' : '') + '</div>';
      if ((v.skills || []).length) h += '<h3>ކުރެވޭނެ ކަންތައް</h3><div class="tag-list">' + v.skills.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div>';
      if (v.notes) h += '<h3>ނޯޓު</h3><p class="fac-notes">' + esc(v.notes).replace(/\n/g, '<br>') + '</p>';
      openSheet(h);
    }
    facEl.addEventListener('click', function (e) {
      if (e.target.closest('.call')) return;
      var vv = e.target.closest('.vol');
      if (vv) { volSheet(+vv.dataset.v); return; }
    });
    facEl.addEventListener('click', function (e) {
      if (e.target.closest('.call')) return;
      var b = e.target.closest('.fac');
      if (b) facSheet(+b.dataset.f);
    });
    facEl.addEventListener('keydown', function (e) {
      var b = e.target.closest('.fac');
      if (b && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); facSheet(+b.dataset.f); }
    });
  }

  /* ---------- Tasks ---------- */
  var MONTHS = ['ޖަނަވަރީ', 'ފެބްރުއަރީ', 'މާރިޗު', 'އޭޕްރީލް', 'މެއި', 'ޖޫން', 'ޖުލައި', 'އޮގަސްޓު', 'ސެޕްޓެމްބަރު', 'އޮކްޓޫބަރު', 'ނޮވެންބަރު', 'ޑިސެމްބަރު'];
  var DAYS = ['އާދިއްތަ', 'ހޯމަ', 'އަންގާރަ', 'ބުދަ', 'ބުރާސްފަތި', 'ހުކުރު', 'ހޮނިހިރު'];
  function dvDay(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
    return m ? DAYS[new Date(+m[1], +m[2] - 1, +m[3]).getDay()] + '، ' : '';
  }
  function dvDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
    return m ? (+m[3]) + ' ' + MONTHS[+m[2] - 1] + ' ' + m[1] : esc(iso || '');
  }
  var today = new Date(); today = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
  var tasksEl = document.getElementById('tasks');
  if (tasksEl) {
    var tasks = (T.tasks || []).map(function (t, i) { return Object.assign({ _i: i }, t); });
    // open tasks first, by due date (no date last); finished tasks at the bottom
    tasks.sort(function (a, b) {
      if (!!a.done !== !!b.done) return a.done ? 1 : -1;
      var ad = a.due || '9999', bd = b.due || '9999';
      return ad < bd ? -1 : ad > bd ? 1 : a._i - b._i;
    });
    var openN = tasks.filter(function (t) { return !t.done; }).length;
    var lateN = tasks.filter(function (t) { return !t.done && t.due && t.due < today; }).length;
    tasksEl.innerHTML = tasks.length
      ? '<div class="island-summary">' +
          '<div><strong>' + openN + '</strong><span>ބާކީ</span></div>' +
          '<div><strong class="' + (lateN ? 'late-n' : '') + '">' + lateN + '</strong><span>ލަސްވެފައި</span></div>' +
          '<div><strong>' + (tasks.length - openN) + '</strong><span>ނިމިފައި</span></div></div>' +
        '<div class="task-list">' + tasks.map(function (t) {
          var late = !t.done && t.due && t.due < today;
          return '<div class="task' + (t.done ? ' is-done' : '') + (late ? ' is-late' : '') + '">' +
            '<span class="task-check">' + (t.done ? '✓' : '') + '</span>' +
            '<div class="task-main"><div class="task-title">' + esc(t.task || '—') + '</div>' +
              '<div class="task-meta">' +
                (t.assignee ? '<span>' + ICON.user + esc(t.assignee) + '</span>' : '') +
                (t.due ? '<span class="task-due">' + ICON.clock + dvDate(t.due) + (t.time ? ' · <span dir="ltr">' + esc(t.time) + '</span>' : '') + (late ? ' · ލަސްވެފައި' : '') + '</span>' : '') +
              '</div>' +
              (t.details ? '<p class="task-details">' + esc(t.details).replace(/\n/g, '<br>') + '</p>' : '') +
            '</div></div>';
        }).join('') + '</div>'
      : '<p class="none">' + EMPTY + '</p>';
  }

  /* ---------- Meetings ---------- */
  // Meeting notes: "1. text" lines become numbered points, "- text" lines sub-points under them
  function notes(txt) {
    var head = [], points = [];
    String(txt).split('\n').forEach(function (line) {
      var l = line.trim(); if (!l) return;
      var num = /^(\d+)\.\s*(.*)$/.exec(l), sub = /^[-–•]\s*(.*)$/.exec(l);
      if (num) points.push({ n: num[1], lines: [num[2]], subs: [] });
      else if (!points.length) head.push(l);
      else if (sub) points[points.length - 1].subs.push(sub[1]);
      else points[points.length - 1].lines.push(l);
    });
    return '<div class="notes">' +
      head.map(function (h) { return '<div class="note-head">' + esc(h) + '</div>'; }).join('') +
      points.map(function (p) {
        return '<div class="note"><span class="note-n">' + esc(p.n) + '</span><div class="note-body">' +
          p.lines.map(function (l) { return '<div>' + esc(l) + '</div>'; }).join('') +
          p.subs.map(function (x) { return '<div class="note-sub">' + esc(x) + '</div>'; }).join('') +
          '</div></div>';
      }).join('') + '</div>';
  }
  var mtEl = document.getElementById('meetings');
  if (mtEl) {
    var members = T.members || [];
    // number meetings in date order (1 = first), list newest first
    var meetings = (T.meetings || []).slice().sort(function (a, b) { return (a.date || '') < (b.date || '') ? -1 : 1; })
      .map(function (m, i) { return Object.assign({ _n: i + 1 }, m); }).reverse();
    var PLACE = '<svg class="icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';
    function when(m) {
      return m.date ? dvDay(m.date) + dvDate(m.date) + (m.time ? ' <span class="nowrap">· <span dir="ltr">' + esc(m.time) + '</span></span>' : '') : (m.time ? '<span dir="ltr">' + esc(m.time) + '</span>' : '');
    }
    function attendance(m) {
      var att = m.attended || [];
      var names = members.concat(att.filter(function (a) { return members.indexOf(a) < 0; }));
      if (m.date && m.date >= today) return '';
      if (!att.length) return '<h3>ހާޒިރީ</h3><p class="att-none">ހާޒިރީ ނަގާފައެއް ނުވޭ</p>';
      var pct = names.length ? Math.round(att.length / names.length * 100) : 0;
      return '<h3>ހާޒިރީ · <span dir="ltr">' + att.length + '/' + names.length + '</span></h3>' +
        '<div class="att-bar"><i style="width:' + pct + '%"></i></div>' +
        '<div class="att-chips" style="margin-top:.5rem">' + names.map(function (n) {
          var here = att.indexOf(n) >= 0;
          return '<span class="att' + (here ? ' here' : '') + '">' + (here ? '✓ ' : '') + esc(n) + '</span>';
        }).join('') + '</div>';
    }
    mtEl.innerHTML = meetings.length ? '<div class="meeting-list">' + meetings.map(function (m, i) {
      var upcoming = m.date && m.date >= today;
      return '<div class="mcard' + (upcoming ? ' is-upcoming' : '') + '" role="button" tabindex="0" data-m="' + i + '">' +
        '<span class="mcard-n">' + m._n + '</span>' +
        '<div class="mcard-info"><div class="mcard-title">ބައްދަލުވުން ' + m._n + (upcoming ? ' <span class="up-tag">ކުރިއަށް</span>' : '') + '</div>' +
          '<div class="task-meta"><span>' + ICON.clock + when(m) + '</span>' +
          (m.place ? '<span>' + PLACE + esc(m.place) + '</span>' : '') + '</div></div>' +
        '<span class="mcard-go">‹</span></div>';
    }).join('') + '</div>' : '<p class="none">' + EMPTY + '</p>';
    function meetingSheet(i) {
      var m = meetings[i];
      openSheet('<p class="sheet-kicker">ބައްދަލުވުން ' + m._n + '</p>' +
        '<h2>' + (m.title ? esc(m.title) : 'ބައްދަލުވުން ' + m._n) + '</h2>' +
        '<div class="task-meta" style="margin-bottom:.6rem"><span>' + ICON.clock + when(m) + '</span>' + (m.place ? '<span>' + PLACE + esc(m.place) + '</span>' : '') + '</div>' +
        (m.details ? notes(m.details) : '<p class="none">' + EMPTY + '</p>') +
        attendance(m));
    }
    mtEl.addEventListener('click', function (e) { var c = e.target.closest('.mcard'); if (c) meetingSheet(+c.dataset.m); });
    mtEl.addEventListener('keydown', function (e) {
      var c = e.target.closest('.mcard');
      if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); meetingSheet(+c.dataset.m); }
    });
  }

  /* ---------- Sponsors + gifts ---------- */
  var spEl = document.getElementById('sponsors');
  if (spEl) {
    var sponsors = T.sponsors || [], gifts = T.gifts || [];
    var GIFT = '<svg class="icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="9" width="17" height="11" rx="1.5"/><path d="M2.5 9h19v-1a1 1 0 0 0-1-1h-17a1 1 0 0 0-1 1zM12 7v13"/><path d="M12 7c-1.5-3-5-3.5-5-1.2C7 7 9.5 7 12 7zm0 0c1.5-3 5-3.5 5-1.2C17 7 14.5 7 12 7z"/></svg>';
    var h = '<h2 class="group-title">ސްޕޮންސަރުން <span class="group-count">' + sponsors.length + '</span></h2>';
    h += sponsors.length ? '<div class="sp-cards">' + sponsors.map(function (s) {
      return '<div class="sp">' +
        '<div class="sp-name">' + esc(s.name || '—') + '</div>' +
        (s.contribution ? '<div class="sp-contrib">' + esc(s.contribution) + '</div>' : '') +
        ((s.contact || s.phone) ? '<div class="sp-contact">' + ICON.user + '<span>' + esc(s.contact || '') + '</span>' +
          (s.phone ? '<a class="call" href="tel:' + esc(String(s.phone).replace(/\s/g, '')) + '">' + ICON.phone + '<span dir="ltr">' + esc(s.phone) + '</span></a>' : '') + '</div>' : '') +
        (s.notes ? '<p class="task-details">' + esc(s.notes).replace(/\n/g, '<br>') + '</p>' : '') +
        '</div>';
    }).join('') + '</div>' : '<p class="none">' + EMPTY + '</p>';
    // gifts split into not-received and received
    function giftCard(g) {
      return '<div class="gift' + (g.received ? ' is-received' : '') + '">' +
        '<span class="task-check">' + (g.received ? '✓' : '') + '</span>' +
        '<span class="gift-icon">' + GIFT + '</span>' +
        '<div class="gift-main"><div class="gift-title">' + esc(g.item || '—') +
          (g.qty ? ' <span class="gift-qty">× ' + esc(g.qty) + '</span>' : '') + '</div>' +
          '<div class="task-meta">' +
            (g.from ? '<span>ސްޕޮންސަރ: ' + esc(g.from) + '</span>' : '<span class="no-sponsor">ސްޕޮންސަރެއް ނުލިބޭ</span>') +
            (g['for'] ? '<span>· ' + esc(g['for']) + '</span>' : '') +
          '</div>' +
          (g.notes ? '<p class="task-details">' + esc(g.notes).replace(/\n/g, '<br>') + '</p>' : '') +
        '</div></div>';
    }
    var giftsOpen = gifts.filter(function (g) { return !g.received; }), giftsDone = gifts.filter(function (g) { return g.received; });
    h += '<h2 class="group-title">ހަދިޔާ</h2>';
    if (!gifts.length) h += '<p class="none">' + EMPTY + '</p>';
    if (giftsOpen.length) h += '<h3 class="gift-group pending">އަދި ނުލިބޭ <span class="group-count">' + giftsOpen.length + '</span></h3><div class="gift-list">' + giftsOpen.map(giftCard).join('') + '</div>';
    if (giftsDone.length) h += '<h3 class="gift-group done">ލިބިފައިވާ <span class="group-count">' + giftsDone.length + '</span></h3><div class="gift-list">' + giftsDone.map(giftCard).join('') + '</div>';
    spEl.innerHTML = h;
  }

  /* ---------- Schools (school sessions form) ---------- */
  var scEl = document.getElementById('schools');
  if (scEl) {
    var schoolIsl = all.filter(function (x) { return x.kind === 'island'; });
    var withForm = schoolIsl.filter(function (x) { return x.school; });
    var without = schoolIsl.filter(function (x) { return !x.school; });
    // how many schools asked for each session (spelling kept exactly as in the form)
    var sess = {};
    withForm.forEach(function (x) { (x.school.sessions || []).forEach(function (s) { (sess[s] = sess[s] || []).push(all.indexOf(x)); }); });
    var sessNames = Object.keys(sess).sort(function (a, b) { return sess[b].length - sess[a].length; });
    var SCHOOL = '<svg class="icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V10l7-4 7 4v11"/><path d="M12 6V2.5l3 1.2-3 1.2"/><path d="M10 21v-4h4v4"/></svg>';
    var h = '<div class="island-summary">' +
      '<div><strong>' + withForm.length + '</strong><span>ފޯމު ފުރާ</span></div>' +
      '<div><strong class="' + (without.length ? 'late-n' : '') + '">' + without.length + '</strong><span>ފޯމު ނުފުރާ</span></div>' +
      '<div><strong>' + sessNames.length + '</strong><span>ސެޝަން</span></div></div>';
    if (without.length) h += '<div class="pending-box"><span>ސްކޫލު ސެޝަންތައް ފޯމު ނުފުރާ:</span><div class="chips">' +
      without.map(function (x) { return '<button class="chip" data-i="' + all.indexOf(x) + '">' + esc(x.name) + '</button>'; }).join('') + '</div></div>';
    if (sessNames.length) {
      h += '<h2 class="group-title">ސެޝަންތަކަށް އެދިފައިވާ ސްކޫލުތައް</h2><div class="sess-list">' + sessNames.map(function (s) {
        var pct = Math.round(sess[s].length / withForm.length * 100);
        return '<div class="sess"><div class="sess-head"><span class="sess-name" dir="ltr">' + esc(s) + '</span><b>' + sess[s].length + '</b></div>' +
          '<div class="att-bar"><i style="width:' + pct + '%"></i></div>' +
          '<div class="chips">' + sess[s].map(function (i) { return '<button class="chip" data-i="' + i + '">' + esc(all[i].name) + '</button>'; }).join('') + '</div></div>';
      }).join('') + '</div>';
    }
    h += '<h2 class="group-title">ސްކޫލުތައް <span class="group-count">' + withForm.length + '</span></h2>';
    h += withForm.length ? '<div class="school-cards">' + withForm.map(function (x) {
      var sc = x.school;
      return '<div class="school-card" role="button" tabindex="0" data-s="' + all.indexOf(x) + '">' +
        '<div class="school-card-head"><span class="school-ico">' + SCHOOL + '</span><div><div class="school-island">ބ. ' + esc(x.name) + '</div>' +
          '<div class="school-name" dir="ltr">' + esc(sc.name || '') + '</div></div></div>' +
        (sc.focal ? '<div class="school-focal" dir="ltr">' + ICON.user + '<span>' + esc(sc.focal) + '</span></div>' : '') +
        '<div class="island-stats"><span class="stat">' + ICON.list + '<b>' + (sc.sessions || []).length + '</b> ސެޝަން</span></div></div>';
    }).join('') + '</div>' : '<p class="none">' + EMPTY + '</p>';
    scEl.innerHTML = h;

    // PDF: each school's requested sessions, then which schools asked for each session
    var scBtn = dlButton();
    scEl.insertBefore(scBtn, scEl.firstChild);
    scBtn.querySelector('button').addEventListener('click', function () {
      var title = (document.querySelector('.event h1') || {}).textContent || '';
      function box(x, n) {
        var sc = x.school;
        return '<section class="p-island"><h3><span class="p-n">' + n + '</span>ބ. ' + esc(x.name) + '</h3>' +
          '<div class="p-ltr" dir="ltr">' +
            '<div class="p-school">' + esc(sc.name || '') + '</div>' +
            '<div class="p-list">' + (sc.sessions || []).map(function (t, k) { return '<div class="p-row"><span class="p-k">' + (k + 1) + '.</span><span>' + esc(t) + '</span></div>'; }).join('') + '</div>' +
            (sc.topics ? '<div class="p-topics">' + esc(sc.topics).replace(/\n/g, '<br>') + '</div>' : '') +
            (sc.focal ? '<div class="p-focal">Focal: ' + esc(sc.focal) + '</div>' : '') +
          '</div></section>';
      }
      var blocks = [pdfHeader()];
      blocks.push('<h2>' + pdfNum('1.') + ' ސްކޫލުތަކުން އެދިފައިވާ ސެޝަންތައް</h2><p class="p-sum">' + pdfNum(withForm.length) + ' ސްކޫލު · ' + pdfNum(sessNames.length) + ' ސެޝަން</p>');
      for (var r = 0; r < withForm.length; r += 2)
        blocks.push('<div class="p-row2">' + box(withForm[r], r + 1) + (withForm[r + 1] ? box(withForm[r + 1], r + 2) : '') + '</div>');
      if (without.length) blocks.push('<p class="p-pending">ސްކޫލު ސެޝަންތައް ފޯމު ނުފުރާ (' + pdfNum(without.length) + '): ' + without.map(function (x) { return esc(x.name); }).join('، ') + '</p>');
      blocks.push('break');
      blocks.push('<h2>' + pdfNum('2.') + ' ސެޝަންތަކަށް އެދިފައިވާ ސްކޫލުތައް</h2><p class="p-sum">' + pdfNum(sessNames.length) + ' ސެޝަން · ބޮޑު އަދަދަކުން އެދިފައިވާ ސެޝަންތައް މަތީގައި</p>');
      blocks.push('table');
      blocks.push('<p class="p-foot">ތައްޔާރުކުރި ތާރީޚު: ' + dvDate(today).replace(/(\d+)/g, pdfNum('$1')) + '</p>');
      var tableHtml = '<table class="p-table"><thead><tr><th>#</th><th>ސެޝަން</th><th>އަދަދު</th><th>ރަށްތައް</th></tr></thead><tbody>' +
        sessNames.map(function (t, i) {
          return '<tr><td>' + (i + 1) + '</td><td class="p-ltr-cell" dir="ltr">' + esc(t) + '</td><td class="p-c">' + sess[t].length + '</td><td>' +
            sess[t].map(function (k) { return esc(all[k].name); }).join('، ') + '</td></tr>';
        }).join('') + '</tbody></table>';
      pdfDownload(scBtn.querySelector('button'), blocks, tableHtml, title.trim() + ' - ސްކޫލު ސެޝަންތައް.pdf');
    });
    function schoolSheet(i) {
      var x = all[i];
      openSheet('<p class="sheet-kicker">ބ. ' + esc(x.name) + '</p><h2>ސްކޫލު ސެޝަންތައް</h2>' + schoolHtml(x).replace('<h3>ސްކޫލު ސެޝަންތައް</h3>', ''));
    }
    scEl.addEventListener('click', function (e) {
      var c = e.target.closest('.chip');
      if (c) { islandSheet(+c.dataset.i); return; }
      var k = e.target.closest('.school-card');
      if (k) schoolSheet(+k.dataset.s);
    });
    scEl.addEventListener('keydown', function (e) {
      var k = e.target.closest('.school-card');
      if (k && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); schoolSheet(+k.dataset.s); }
    });
  }

  /* ---------- People needed per island (PDF, from the islands tab) ---------- */
  (function () {
    var types = T.staff_types || [];
    if (!types.length || !grid) return;
    var typeOf = {};   // item -> type index
    types.forEach(function (t, k) { (t.items || []).forEach(function (it) { if (it.indexOf('topic:') !== 0) typeOf[it] = k; }); });
    var topicRules = [];
    types.forEach(function (t, k) { (t.items || []).forEach(function (it) { if (it.indexOf('topic:') === 0) topicRules.push({ word: it.slice(6).toLowerCase(), k: k }); }); });
    var isl = all.filter(function (x) { return x.kind === 'island'; });

    // for one island: type index -> list of {text, en}
    function needs(x) {
      var out = {};
      function add(k, text, en) { if (k == null) k = -1; out[k] = out[k] || []; if (!out[k].some(function (y) { return y.text === text; })) out[k].push({ text: text, en: en }); }
      (x.activities || []).forEach(function (a) { var t = String(a).trim(), g = groupOf[t] || t; add(typeOf[g], t, false); });
      var sc = x.school;
      if (sc) {
        (sc.sessions || []).forEach(function (s) { add(typeOf[s], s, true); });
        var tp = String(sc.topics || '').toLowerCase();
        topicRules.forEach(function (r) { if (tp.indexOf(r.word.toLowerCase()) >= 0) add(r.k, 'ސްކޫލު ޓޮޕިކް: ' + r.word, false); });
      }
      return out;
    }
    function aboutHtml(t) { return /[A-Za-z]/.test(t) ? '<span class="p-en" dir="ltr">' + esc(t) + '</span>' : esc(t); }
    function itemHtml(y) { return y.en ? '<span class="p-en" dir="ltr">' + esc(y.text) + '</span>' : esc(y.text); }

    var btn = dlButton();
    btn.querySelector('span').textContent = 'ބޭނުންވާ މީހުން (PDF)';
    grid.insertBefore(btn, grid.firstChild);
    btn.querySelector('button').addEventListener('click', function () {
      var title = (document.querySelector('.event h1') || {}).textContent || '';
      var count = types.map(function () { return []; });   // type -> islands needing it
      var blocks = [pdfHeader()];
      blocks.push('<h2>' + pdfNum('1.') + ' ރަށްތަކަށް ބޭނުންވާ މީހުން</h2><p class="p-sum">ކޮންމެ ރަށެއްގެ ހުރިހާ ހަރަކާތެއް (ރަށާއި ސްކޫލު)، ކޮންމެ ހަރަކާތަކަށް ބޭނުންވާ ފަރާތާއެކު. ކޮންމެ ބާވަތަކަށް <b>' + pdfNum('1') + ' މީހާ</b></p>');
      isl.forEach(function (x, n) {
        var nd = needs(x);
        var flags = (x.pending ? '<span class="p-flag">ރަށުގެ ހަރަކާތްތައް ނުލިބޭ</span>' : '') + (!x.school ? '<span class="p-flag">ސްކޫލު ސެޝަންތައް ފޯމު ނުފުރާ</span>' : '');
        var rows = '', k2 = 0, need = [];
        types.forEach(function (t, k) {
          if (!nd[k]) return;
          count[k].push(x.name); need.push(t.role);
          nd[k].forEach(function (y, j) {
            rows += '<tr class="' + (j === 0 ? 'p-first' : '') + '"><td class="p-c">' + (++k2) + '</td><td>' + itemHtml(y) + '</td><td class="p-type">' + esc(t.role) + '</td></tr>';
          });
        });
        (nd[-1] || []).forEach(function (y, j) { rows += '<tr class="' + (j === 0 ? 'p-first' : '') + '"><td class="p-c">' + (++k2) + '</td><td>' + itemHtml(y) + '</td><td class="p-type">—</td></tr>'; });
        var people = need.length;
        blocks.push('<section class="p-staff"><h3><span class="p-n">' + (n + 1) + '</span>ބ. ' + esc(x.name) +
          '<span class="p-people">' + pdfNum(people) + ' މީހުން</span></h3>' + (flags ? '<div class="p-flags">' + flags + '</div>' : '') +
          (rows ? '<table class="p-mini p-acts"><thead><tr><th>#</th><th>ހަރަކާތް</th><th>ބޭނުންވާ ފަރާތް</th></tr></thead><tbody>' + rows + '</tbody></table>' +
                  '<div class="p-need"><b>ބޭނުންވާ މީހުން:</b> ' + need.map(function (r) { return '<span>' + esc(r) + ' ' + pdfNum('1') + '</span>'; }).join('') + '</div>'
                : '<p class="p-pending">އަދި އެއްވެސް ހަރަކާތެއް ނުލިބޭ</p>') + '</section>');
      });
      blocks.push('break');
      var total = count.reduce(function (n, c) { return n + c.length; }, 0);
      blocks.push('<h2>' + pdfNum('2.') + ' ޖުމްލަ ބޭނުންވާ މީހުން</h2><p class="p-sum">ކޮންމެ ރަށަކަށް ވަކި މީހަކު ނަމަ ޖުމްލަ ' + pdfNum(total) + ' މީހުން</p>');
      blocks.push('table');
      var pend = isl.filter(function (x) { return x.pending; }), noSchool = isl.filter(function (x) { return !x.school; });
      if (pend.length) blocks.push('<p class="p-pending">ރަށުގެ ހަރަކާތްތައް ނުލިބޭ (' + pdfNum(pend.length) + '): ' + pend.map(function (x) { return esc(x.name); }).join('، ') + '</p>');
      if (noSchool.length) blocks.push('<p class="p-pending">ސްކޫލު ސެޝަންތައް ފޯމު ނުފުރާ (' + pdfNum(noSchool.length) + '): ' + noSchool.map(function (x) { return esc(x.name); }).join('، ') + '</p>');
      blocks.push('<p class="p-foot">ތައްޔާރުކުރި ތާރީޚު: ' + dvDate(today).replace(/(\d+)/g, pdfNum('$1')) + '</p>');
      var tableHtml = '<table class="p-table"><thead><tr><th>ބޭނުންވާ ފަރާތް</th><th>ރަށް</th><th>ރަށްތައް</th></tr></thead><tbody>' +
        types.map(function (t, k) { return { t: t, k: k }; }).filter(function (o) { return count[o.k].length; })
          .sort(function (a, b) { return count[b.k].length - count[a.k].length; })
          .map(function (o) {
            return '<tr><td class="p-role">' + esc(o.t.role) + (o.t.about ? '<small>' + aboutHtml(o.t.about) + '</small>' : '') + '</td><td class="p-c">' + count[o.k].length + '</td><td>' +
              count[o.k].map(esc).join('، ') + '</td></tr>';
          }).join('') + '</tbody></table>';
      pdfDownload(btn.querySelector('button'), blocks, tableHtml, title.trim() + ' - ބޭނުންވާ މީހުން.pdf');
    });
  })();

  /* ---------- Schedule tab: the trip step by step ---------- */
  (function () {
    var el = document.getElementById('program');
    if (!el) return;
    var stages = T.program || [];
    var isl = all.filter(function (x) { return x.kind === 'island'; });
    var TBC = '<span class="pg-tbc">ތަފްޞީލު ފަހުން</span>';
    // people coming from outside Malé: facilitators whose route ends in Malé
    var F = T.facilitators || {};
    var outside = (F.sheikhs || []).concat(F.others || []).filter(function (p) { return (p.route || []).length; });
    function when(s) {
      var bits = [];
      if (s.date) bits.push(ICON.clock + dvDay(s.date) + dvDate(s.date) + (s.time ? ' <span class="nowrap">· <span dir="ltr">' + esc(s.time) + '</span></span>' : ''));
      else if (s.time) bits.push(ICON.clock + '<span dir="ltr">' + esc(s.time) + '</span>');
      if (s.place) bits.push('<svg class="icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>' + esc(s.place));
      return bits.length ? '<div class="task-meta">' + bits.map(function (b) { return '<span>' + b + '</span>'; }).join('') + '</div>' : '';
    }
    function islandChips(field) {
      return '<div class="chips">' + isl.map(function (x) {
        var n = field === 'schedule' ? (x.schedule || []).length : (x.to_eydhafushi ? 1 : 0);
        return '<button class="chip pg-chip" data-i="' + all.indexOf(x) + '" data-f="' + field + '">' + esc(x.name) +
          (field === 'schedule' && n ? ' <b>' + n + '</b>' : '') + '</button>';
      }).join('') + '</div>';
    }
    el.innerHTML = stages.length ? '<ol class="pg">' + stages.map(function (s, i) {
      var extra = '';
      if (s.key === 'arrive') extra = outside.length ? '<div class="pg-people">' + outside.map(function (p) {
        return '<div><b>' + esc(p.name) + '</b><span>' + esc(p.route.join(' ← ')) + '</span></div>';
      }).join('') + '</div>' : '';
      // going home: the same people, route reversed (Malé → their island)
      if (s.key === 'home') extra = outside.length ? '<div class="pg-people">' + outside.map(function (p) {
        return '<div><b>' + esc(p.name) + '</b><span>' + esc(p.route.slice().reverse().join(' ← ')) + '</span></div>';
      }).join('') + '</div>' : '';
      if (s.key === 'islands') extra = islandChips('schedule');
      if (s.key === 'to_eydh') extra = islandChips('to_eydhafushi');
      // ceremony agenda: time · item · who runs it
      var ag = (s.agenda || []).filter(function (a) { return a.item; });
      if (ag.length) extra += '<ol class="pg-agenda">' + ag.map(function (a) {
        return '<li>' + (a.time ? '<span class="sched-time" dir="ltr">' + esc(a.time) + '</span>' : '<span class="sched-time"></span>') +
          '<span>' + esc(a.item) + (a.by ? '<small class="sched-by">' + esc(a.by) + '</small>' : '') + '</span></li>';
      }).join('') + '</ol>';
      var has = s.date || s.time || s.details || extra;
      return '<li class="pg-step"><span class="pg-n">' + (i + 1) + '</span><div class="pg-card">' +
        '<div class="pg-title">' + esc(s.title || '') + '</div>' + when(s) +
        (s.details ? '<p class="task-details">' + esc(s.details).replace(/\n/g, '<br>') + '</p>' : '') +
        extra + (!s.date && !s.details && !ag.length ? TBC : '') + '</div></li>';
    }).join('') + '</ol>' : '<p class="none">' + EMPTY + '</p>';
    el.addEventListener('click', function (e) {
      var c = e.target.closest('.pg-chip');
      if (!c) return;
      var x = all[+c.dataset.i];
      if (c.dataset.f === 'schedule') {
        var sched = x.schedule || [], days = [], byDay = {};
        sched.forEach(function (s) { var d = s.day || ''; if (!byDay[d]) { byDay[d] = []; days.push(d); } byDay[d].push(s); });
        openSheet('<p class="sheet-kicker">ރަށްރަށުގެ ޝެޑިއުލް</p><h2>ބ. ' + esc(x.name) + '</h2>' +
          (sched.length ? days.map(function (d) {
            return '<div class="sched-day">' + (d ? '<p class="sched-date">' + esc(d) + '</p>' : '') + '<ul class="sched">' + byDay[d].map(function (s) {
              return '<li' + (s.break ? ' class="is-break"' : '') + '><span class="sched-time" dir="ltr">' + esc(s.time || '') + '</span><span>' + esc(s.activity) + (s.by ? '<small class="sched-by">' + esc(s.by) + '</small>' : '') + '</span></li>';
            }).join('') + '</ul></div>';
          }).join('') : '<p class="none">' + EMPTY + '</p>'));
      } else {
        openSheet('<p class="sheet-kicker">އޭދަފުށިއަށް ދަތުރު</p><h2>ބ. ' + esc(x.name) + '</h2>' +
          (x.to_eydhafushi ? '<p class="task-details">' + esc(x.to_eydhafushi).replace(/\n/g, '<br>') + '</p>' : '<p class="none">' + EMPTY + '</p>'));
      }
    });

    // Day by day: every island's sessions for the chosen day
    var dayList = [];
    isl.forEach(function (x) { (x.schedule || []).forEach(function (e) { if (e.day && dayList.indexOf(e.day) < 0) dayList.push(e.day); }); });
    function dayNum(d) { var m = String(d).match(/\d+/); return m ? +m[0] : 99; }
    dayList.sort(function (a, b) { return dayNum(a) - dayNum(b); });
    if (dayList.length) {
      var box = document.createElement('div');
      box.className = 'pg-days';
      box.innerHTML = '<h2 class="group-title">ދުވަހުން ޝެޑިއުލް</h2><div class="seg pg-seg" role="tablist">' + dayList.map(function (d, k) {
        return '<button type="button" data-d="' + k + '" aria-selected="' + (k === 0) + '">' + esc(d) + '</button>';
      }).join('') + '</div><div class="pg-day"></div>';
      el.appendChild(box);
      var dayEl = box.querySelector('.pg-day');
      function showDay(k) {
        var d = dayList[k];
        box.querySelectorAll('.pg-seg button').forEach(function (b) { b.setAttribute('aria-selected', +b.dataset.d === k); });
        dayEl.innerHTML = '<div class="pg-grid">' + isl.map(function (x) {
          var rows = (x.schedule || []).filter(function (e) { return e.day === d; });
          return '<div class="pg-isl"><h3>ބ. ' + esc(x.name) + '</h3>' + (rows.length ? '<ul class="sched">' + rows.map(function (e) {
            return '<li' + (e.break ? ' class="is-break"' : '') + '><span class="sched-time" dir="ltr">' + esc(e.time || '') + '</span><span>' + esc(e.activity) + (e.by ? '<small class="sched-by">' + esc(e.by) + '</small>' : '') + '</span></li>';
          }).join('') + '</ul>' : '<p class="none">—</p>') + '</div>';
        }).join('') + '</div>';
      }
      box.querySelector('.pg-seg').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) showDay(+b.dataset.d); });
      showDay(0);
    }

    // PDF: one page per island — the team first, then its schedule day by day
    var pgBtn = dlButton();
    el.insertBefore(pgBtn, el.firstChild);
    pgBtn.querySelector('button').addEventListener('click', function () {
      var title = (document.querySelector('.event h1') || {}).textContent || '';
      function nums(t) { return esc(t).replace(/(\d+)/g, pdfNum('$1')); }
      // English runs (session names) are kept left-to-right as one unit so their words don't flip
      function txt(t) {
        return esc(t).split(/([A-Za-z][A-Za-z0-9 &'.,\/()\-–]*[A-Za-z0-9)])/).map(function (part, k) {
          return k % 2 ? '<span class="p-en" dir="ltr">' + part + '</span>' : part.replace(/(\d+)/g, pdfNum('$1'));
        }).join('');
      }
      var blocks = [pdfHeader()];
      blocks.push('<h2>ރަށްރަށުގެ ޓީމާއި ޝެޑިއުލް</h2><p class="p-sum">' + pdfNum(isl.length) + ' ރަށް · ' + nums('11 - 14 ނޮވެންބަރު') + '</p>');
      isl.forEach(function (x, n) {
        if (n) blocks.push('break');
        var team = x.team || [], sched = x.schedule || [];
        blocks.push('<section class="p-island p-sched"><h3><span class="p-n">' + (n + 1) + '</span>ބ. ' + esc(x.name) +
          (x.focal ? '<small>ފޯކަލް: ' + esc(x.focal) + (x.phone ? ' · ' + pdfNum(esc(x.phone)) : '') + '</small>' : '') + '</h3>' +
          '<h4>ޓީމު</h4>' + (team.length ? '<div class="p-team">' + team.map(function (m) {
            return '<span><b>' + esc(m.name) + '</b>' + (m.role ? ' · ' + esc(m.role) : '') + '</span>';
          }).join('') + '</div>' : '<p class="p-pending">ޓީމު އަދި ނުނިންމާ</p>') +
          '<h4>ޝެޑިއުލް</h4>' + (sched.length ? '<table class="p-table"><thead><tr><th>ދުވަސް</th><th>ގަޑި</th><th>ހަރަކާތް</th><th>ހިންގާނީ</th></tr></thead><tbody>' +
            sched.map(function (e, k) {
              var first = k === 0 || sched[k - 1].day !== e.day;
              return '<tr class="' + (first ? 'p-first' : '') + (e.break ? ' p-break' : '') + '"><td class="p-day">' + (first ? nums(e.day || '') : '') + '</td><td class="p-c">' + pdfNum(esc(e.time || '')) + '</td><td>' + txt(e.activity || '') + '</td><td class="p-by">' + esc(e.by || '') + '</td></tr>';
            }).join('') + '</tbody></table>' : '<p class="p-pending">ޝެޑިއުލް އަދި ނުލިބޭ</p>') + '</section>');
      });
      blocks.push('<p class="p-foot">ތައްޔާރުކުރި ތާރީޚު: ' + dvDate(today).replace(/(\d+)/g, pdfNum('$1')) + '</p>');
      pdfDownload(pgBtn.querySelector('button'), blocks, '', title.trim() + ' - ޝެޑިއުލް.pdf');
    });
  })();

  /* ---------- Report tab: notes for the after-trip report ---------- */
  (function () {
    var el = document.getElementById('report');
    if (!el) return;
    var improve = (T.report || {}).improve || [];
    var isl = all.filter(function (x) { return x.kind === 'island'; });
    function n(v) { var k = parseInt(String(v == null ? '' : v).replace(/[^0-9]/g, ''), 10); return isNaN(k) ? 0 : k; }
    function rows(list) { return (list || []).filter(function (r) { return String(r.activity || '').trim() && (n(r.male) || n(r.female)); }); }
    function sum(list) { var s = { m: 0, f: 0 }; list.forEach(function (r) { s.m += n(r.male); s.f += n(r.female); }); return s; }
    function add(a, b) { return { m: a.m + b.m, f: a.f + b.f }; }
    function fmt(k) { return '<span dir="ltr">' + k.toLocaleString('en-US') + '</span>'; }
    function split(s) {
      var t = s.m + s.f, pm = t ? Math.round(s.m * 100 / t) : 50;
      return '<div class="rc-split"><span class="boy"><i></i>ފިރިހެން <b>' + fmt(s.m) + '</b></span><span class="girl"><i></i>އަންހެން <b>' + fmt(s.f) + '</b></span></div>' +
        '<div class="rc-bar' + (t ? '' : ' is-empty') + '"><span class="boy" style="width:' + pm + '%"></span><span class="girl" style="width:' + (100 - pm) + '%"></span></div>';
    }
    function card(label, s, cls) {
      return '<div class="rc-card ' + (cls || '') + '"><div class="rc-label">' + label + '</div><div class="rc-total">' + fmt(s.m + s.f) + '</div>' + split(s) + '</div>';
    }
    function table(title, list) {
      if (!list.length) return '';
      var s = sum(list);
      return '<p class="rc-sub">' + title + '</p><table class="rc-table"><thead><tr><th>ހަރަކާތް</th><th class="boy">ފިރިހެން</th><th class="girl">އަންހެން</th><th>ޖުމްލަ</th></tr></thead><tbody>' +
        list.map(function (r) {
          return '<tr><td>' + esc(r.activity) + '</td><td class="boy">' + fmt(n(r.male)) + '</td><td class="girl">' + fmt(n(r.female)) + '</td><td>' + fmt(n(r.male) + n(r.female)) + '</td></tr>';
        }).join('') + '</tbody><tfoot><tr><td>ޖުމްލަ</td><td class="boy">' + fmt(s.m) + '</td><td class="girl">' + fmt(s.f) + '</td><td>' + fmt(s.m + s.f) + '</td></tr></tfoot></table>';
    }
    var tripPub = { m: 0, f: 0 }, tripStu = { m: 0, f: 0 }, done = [], waiting = [];
    isl.forEach(function (x) {
      var a = rows(x.reach), b = rows(x.student_reach);
      if (!a.length && !b.length) { waiting.push(x); return; }
      var sa = sum(a), sb = sum(b);
      tripPub = add(tripPub, sa); tripStu = add(tripStu, sb);
      done.push('<div class="rc-island"><div class="rc-head"><h3>ބ. ' + esc(x.name) + '</h3>' + card('ރަށުގެ ޖުމްލަ', add(sa, sb), 'is-mini') + '</div>' +
        table('ހަރަކާތްތައް (ޢާންމުން)', a) + table('ދަރިވަރުން (ސްކޫލު ސެޝަންތައް)', b) + '</div>');
    });
    var reachHtml = '<h2 class="group-title">ރީޗު</h2>' +
      '<div class="rc-cards">' + card('ޖުމްލަ ރީޗު · ' + isl.length + ' ރަށް', add(tripPub, tripStu), 'is-main') +
      card('ޢާންމުން', tripPub) + card('ދަރިވަރުން', tripStu) + '</div>' +
      '<p class="rc-note">ރީޗު ލިބުނު ރަށް: <b>' + done.length + ' / ' + isl.length + '</b></p>' +
      done.join('') +
      (waiting.length ? '<div class="rc-waiting"><p class="rc-sub">ރީޗު އަދި ނުލިބޭ</p><div class="chips">' + waiting.map(function (x) { return '<span class="chip">' + esc(x.name) + '</span>'; }).join('') + '</div></div>' : '');
    el.innerHTML = reachHtml + '<h2 class="group-title">ރަނގަޅުކުރަން ޖެހޭ <span class="group-count">' + improve.length + '</span></h2>' +
      (improve.length ? '<ol class="rp-list">' + improve.map(function (p, i) {
        return '<li class="rp"><span class="rp-n">' + (i + 1) + '</span><div class="rp-body"><div class="rp-point">' + esc(p.point || '') + '</div>' +
          (p.details ? '<p class="rp-details">' + esc(p.details).replace(/\n/g, '<br>') + '</p>' : '') + '</div></li>';
      }).join('') + '</ol>' : '<p class="none">' + EMPTY + '</p>');
  })();

  /* ---------- Tabs ---------- */
  var tabs = document.querySelectorAll('.tabs [data-tab]');
  var panels = document.querySelectorAll('.panel');
  function show(name) {
    // no tab chosen yet: open the first tab
    if (!document.querySelector('[data-panel="' + name + '"]')) name = tabs[0].dataset.tab;
    tabs.forEach(function (t) { t.setAttribute('aria-selected', t.dataset.tab === name); });
    panels.forEach(function (p) { p.hidden = p.dataset.panel !== name; });
  }
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      history.replaceState(null, '', '#' + t.dataset.tab);
      show(t.dataset.tab);
    });
  });
  show(location.hash.slice(1));
})();
