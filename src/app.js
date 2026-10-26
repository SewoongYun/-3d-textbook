/* app.js — 학습 흐름(예측 → 실험 → 덮개 → 도전 → 도장), 유리 패널, 조작 바, 시연, 글 화면 */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var L = LESSONS, MARK = PAGES.MARK;
  var T = null, world = null;

  /* ───────── 저장소 (막혀 있어도 동작) ───────── */
  var store = {
    get: function (k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 저장 불가는 무시 */ } }
  };
  var prefs = store.get('mathbook2.prefs') || {};
  var stamps = store.get('mathbook2.stamps') || {};
  var reduceMotion = false;
  try { reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { /* 무시 */ }
  if (prefs.still === undefined) prefs.still = reduceMotion;
  function save() { store.set('mathbook2.prefs', prefs); }
  /* 화면 방식: 사용자가 고른 적이 있으면 그대로, 아니면 넓은 화면은 책, 좁은 화면은 글 */
  var mode = prefs.mode || (window.innerWidth >= 700 ? 'book' : 'text');
  function isBook() { return mode === 'book' && !!(world && world.ok); }

  /* ───────── 소리 (기본은 꺼짐) ───────── */
  var snd = { ctx: null };
  function actx() {
    if (!snd.ctx) { try { snd.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (snd.ctx.state === 'suspended') snd.ctx.resume();
    return snd.ctx;
  }
  function beep(f, d, type, vol, delay, f2) {
    var c = actx(); if (!c) return; var t = c.currentTime + (delay || 0), o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(vol || 0.12, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + d + 0.03);
  }
  function noise(d, vol, freq, delay) {
    var c = actx(); if (!c) return; var n = Math.floor(c.sampleRate * d), b = c.createBuffer(1, n, c.sampleRate), a = b.getChannelData(0);
    for (var i = 0; i < n; i++) a[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(), t = c.currentTime + (delay || 0);
    s.buffer = b; f.type = 'bandpass'; f.frequency.value = freq; g.gain.value = vol; s.connect(f); f.connect(g); g.connect(c.destination); s.start(t);
  }
  function play(kind) {
    if (!prefs.sound) return;
    if (kind === 'flip') { noise(0.35, 0.45, 2200); noise(0.2, 0.25, 900, 0.25); }
    else if (kind === 'open') { noise(0.5, 0.35, 700); }
    else if (kind === 'flap') { noise(0.3, 0.45, 1500); beep(180, 0.25, 'triangle', 0.08, 0.05, 90); }
    else if (kind === 'stamp') { beep(110, 0.22, 'sine', 0.35, 0, 45); noise(0.06, 0.6, 900); }
    else if (kind === 'ok') { beep(660, 0.14, 'sine', 0.12); beep(880, 0.2, 'sine', 0.12, 0.12); }
    else if (kind === 'no') { beep(240, 0.25, 'triangle', 0.1, 0, 170); }
    else if (kind === 'up') { beep(220, 0.6, 'sine', 0.07, 0, 520); }
  }

  /* ───────── 상태 ───────── */
  var S = { idx: -1, seed: 1, pick: null, started: false, revealed: false, aPick: null, aChecked: false, aOk: false, order: null, aOrder: null, panel: null, tryMin: false, busy: false };
  var cvL = null, cvR = null, toastTimer = null, demo = null;
  function hash(str) { var h = 7; for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0; return h; }
  function shuffled(n, key) { var a = [], i; for (i = 0; i < n; i++) a.push(i); var R = MX.rng(hash(key)); for (i = n - 1; i > 0; i--) { var j = Math.floor(R() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function toast(msg) { var t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove('show'); }, 3200); }
  function cur() { return L[S.idx]; }
  function val() { return +$('#slider').value; }
  function env() { return { seed: S.seed }; }

  /* ───────── 책장 그림 ───────── */
  var svgCache = {};
  function svgImage(d, v, e, cb) {
    var k = d.id + '|' + v + '|' + e.seed; if (svgCache[k]) { if (!svgCache[k].complete) svgCache[k].addEventListener('load', cb); return svgCache[k]; }
    var inner = d.svg(v, e), fit = PAGES.fitSvg(inner);          /* 틀 밖으로 나간 글자까지 들어오게 */
    var img = new Image(), s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + fit.vb + '" width="' + Math.round(fit.w * 2) + '" height="' + Math.round(fit.h * 2) + '" color="#2a2833" font-family="Malgun Gothic, Noto Sans KR, sans-serif">' + inner + '</svg>';
    img.fit = fit; img.onload = cb; img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s); svgCache[k] = img; return img;
  }
  function pageState(i) {
    var d = L[i];
    return { i: i, n: L.length, pick: S.pick, order: S.order, started: S.started, revealed: S.revealed, stamped: !!stamps[d.id], v: S.started ? val() : d.slider.value, env: env() };
  }
  function drawPagesInto(l, r, i) {
    var d = L[i], st = pageState(i);
    var a = PAGES.drawLeft(l, d, st);
    var img = svgImage(d, st.v, st.env, function () { if (r === cvR && S.idx === i && !S.started) { PAGES.drawRight(r, d, pageState(i), img); if (world) world.refresh(r); } });
    var b = PAGES.drawRight(r, d, st, img);
    return { left: a, right: b };           /* 점검용: 글자 배율, 말줄임된 글, 넘침 여부 */
  }
  var pagePending = false;
  function redrawPages() {
    if (!world || S.idx < 0 || !cvL || pagePending) return;
    pagePending = true;
    requestAnimationFrame(function () { pagePending = false; if (S.idx < 0) return; drawPagesInto(cvL, cvR, S.idx); world.refresh(cvL); world.refresh(cvR); });
  }

  /* ───────── 카메라 자세 ───────── */
  function pose(name, keep) {
    if (!world) return;
    var W = world.W, mi = world.modelInfo;
    /* pts: 이 범위(책 전체·모형 등)가 패널을 뺀 빈 화면 안에 다 들어오도록 거리를 맞춤 */
    if (name === 'cover') world.poseTo({ t: [W / 2 - 0.3, 0.5, 0.35], theta: -0.45, phi: 0.95, R: 6.3, pts: 'cover' }, keep);
    else if (name === 'spread') world.poseTo({ t: [0, 0.3, 0.35], theta: 0, phi: 0.74, R: 7.6, pts: 'spread' }, keep);
    else if (name === 'model') world.poseTo({ t: [(mi.center.x + W / 2) / 2, (mi.center.y + world.TOP) / 2, mi.center.z / 2], theta: 0.3, phi: (mi.cam && mi.cam.bookPhi) || 0.98, R: Math.max(4, mi.radius * 1.25), pts: 'modelPage', min: 7 }, keep);   /* bookPhi: 레슨이 원하는 내려다보는 각도 */
    else if (name === 'low') world.poseTo({ t: mi.center, theta: 0.95, phi: 1.3, R: Math.max(3, mi.radius * 0.9), pts: 'model', min: 5 }, keep);
    else if (name === 'top') world.poseTo({ t: mi.center, theta: 0.02, phi: 0.3, R: Math.max(3.4, mi.radius * 1.05), pts: 'model', min: 6 }, keep);
    else if (name === 'flap') world.poseTo({ t: [-W / 2, 0.3, 0.6], theta: 0.05, phi: 0.62, R: 4.6, pts: 'flap', min: 5 }, keep);
  }

  /* ───────── 패널 배치 ───────── */
  var SIDE = { predict: 'pPredict', answer: 'pAnswer', apply: 'pApply', teacher: 'pTeacher' };
  function setPanel(name, focus) {
    S.panel = name;
    if (name && window.innerWidth < 1100) S.tryMin = true;
    layout();
    if (name && focus) { var el = $('#' + SIDE[name]); var f = $('input:not(:disabled), button.btn, .flapHtml', el); if (f && isBook()) f.focus({ preventScroll: true }); }
  }
  function layout() {
    var book = isBook(), narrow = window.innerWidth <= 760;
    document.body.classList.toggle('book', book); document.body.classList.toggle('text', !book); document.body.classList.toggle('still', !!prefs.still);
    $('#cover').classList.toggle('away', S.idx >= 0); $('#lesson').hidden = S.idx < 0;
    Object.keys(SIDE).forEach(function (k) { $('#' + SIDE[k]).classList.toggle('open', book && S.idx >= 0 && S.panel === k); });
    var tr = $('#pTry'), tryVis = S.started && !(narrow && S.panel);
    tr.classList.toggle('open', book && S.idx >= 0 && tryVis); tr.classList.toggle('min', !!S.tryMin);
    $('#btnTryMin').textContent = S.tryMin ? '펼치기' : '접기'; $('#btnTryMin').setAttribute('aria-expanded', String(!S.tryMin));
    /* 글 화면의 잠금 표시 */
    tr.toggleAttribute('data-locked', !S.started);
    $('#pAnswer').toggleAttribute('data-locked', !S.started);
    $('#pApply').toggleAttribute('data-locked', !S.revealed);
    $('#pTeacher').toggleAttribute('data-locked', !S.revealed);
    $('#btnReveal').hidden = S.revealed || !S.started;
    $('#ansNext').hidden = !S.revealed;
    updateBar();
    insets();
  }
  function insets() {
    if (!world) return;
    var w = window.innerWidth, narrow = w <= 760, l = 0, r = 0, b = 86, t = 0;
    var vis = function (el) { return !!el && el.getClientRects().length > 0 && getComputedStyle(el).display !== 'none'; };
    var side = S.panel ? $('#' + SIDE[S.panel]) : (S.idx < 0 ? $('#cover') : null), tr = $('#pTry');
    if (narrow) {
      var sheet = vis(side) ? side : vis(tr) ? tr : null;
      if (sheet) b = Math.max(b, window.innerHeight - sheet.getBoundingClientRect().top + 8);
    } else {
      if (vis(side)) l = side.getBoundingClientRect().right + 12;
      if (vis(tr) && !S.tryMin) r = w - tr.getBoundingClientRect().left + 12;
      else if (vis(tr)) t = tr.getBoundingClientRect().bottom + 8;   /* 접힌 실험 버튼 아래부터 */
    }
    world.setInsets({ l: l, r: r, b: b, t: t });
  }

  /* ───────── 조작 바 ───────── */
  function stepNo() { return S.aOk ? 5 : S.revealed ? (S.aChecked ? 4 : 3) : S.started ? 2 : 1; }
  var STEP_TXT = ['', '예측 — 내 답을 먼저 골라요', '실험 — 슬라이더를 움직이거나 모형을 눌러 보세요', '정답 — 덮개 아래 이유를 확인해요', '도전 — 다른 상황에 적용해 봐요', '완료 — 도장 쾅! 다음 레슨으로 ▶'];
  function setCap(num, txt, n, on) {
    $('#capNum').textContent = num; $('#capTxt').textContent = txt;
    var h = ''; for (var i = 0; i < n; i++) h += '<i' + (i === on ? ' class="on"' : '') + '></i>'; $('#capDots').innerHTML = h;
  }
  function updateBar() {
    if (demo) return;
    if (S.idx < 0) setCap('', '확률과 통계 3D 교과서', 0, 0);
    else { var s = stepNo(); setCap(String(S.idx + 1), cur().title + ' · ' + STEP_TXT[s], 5, s - 1); }
    $('#btnPrev').disabled = S.idx < 0; $('#btnNext').setAttribute('aria-label', S.idx < 0 ? '책 펼치기' : S.idx === L.length - 1 ? '표지로' : '다음 레슨');
    $('#modeTxt').textContent = isBook() ? '글 화면' : '책 화면'; $('#btnMode').setAttribute('aria-label', isBook() ? '글 화면(Text version)으로 바꾸기' : '3D 책 화면으로 바꾸기');
    $('#btnSound').setAttribute('aria-pressed', String(!!prefs.sound)); $('#btnSound').setAttribute('aria-label', prefs.sound ? '소리 끄기' : '소리 켜기');
    $('#sndWave').setAttribute('d', prefs.sound ? 'M16 9c1.5 1.5 1.5 4.5 0 6M18.5 7c3 3 3 7 0 10' : 'M16 9l5 6M21 9l-5 6');
    $('#btnStill').setAttribute('aria-pressed', String(!!prefs.still));
    $('#btnDemo').disabled = S.idx < 0 || !isBook(); $('#btnTeach').disabled = S.idx < 0;
    $$('#steps li').forEach(function (li, k) { var s = stepNo(); li.classList.toggle('on', k + 1 <= s); li.classList.toggle('cur', k + 1 === s); });
  }

  /* ───────── 목차 ───────── */
  function buildToc() {
    var html = '', unit = '';
    L.forEach(function (d, i) {
      if (d.unit !== unit) { if (unit) html += '</ol>'; unit = d.unit; html += '<h3>' + unit + '</h3><ol>'; }
      html += '<li><a href="#/' + d.id + '" data-i="' + i + '"><span class="num">' + (i + 1) + '</span>' + d.title + '<span class="st" ' + (stamps[d.id] ? '' : 'hidden') + ' aria-label="도장 받음">참 잘했어요</span></a></li>';
    });
    $('#tocList').innerHTML = html + '</ol>';
  }
  function markToc() {
    $$('#tocList a').forEach(function (a) {
      var i = +a.getAttribute('data-i'); if (i === S.idx) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
      $('.st', a).hidden = !stamps[L[i].id];
    });
  }
  function toggleToc(open) {
    var t = $('#toc'); if (open === undefined) open = t.hidden; t.hidden = !open; $('#btnToc').setAttribute('aria-expanded', String(open));
    if (open) { var a = $('a[aria-current]', t) || $('a', t); if (a) a.focus(); }
  }

  /* ───────── 레슨 그리기 ───────── */
  function optHtml(name, opts, order) {
    return order.map(function (oi, k) { return '<label class="opt"><input type="radio" name="' + name + '" value="' + oi + '"><span class="mark">' + MARK[k] + '</span><span>' + opts[oi].t + '</span></label>'; }).join('');
  }
  function resetLesson(i) {
    var d = L[i]; stopDemo(true);
    S.idx = i; S.seed = 1; S.pick = null; S.started = false; S.revealed = false; S.aPick = null; S.aChecked = false; S.aOk = false; S.tryMin = false; S.panel = null;
    S.order = shuffled(d.predict.options.length, d.id + 'p'); S.aOrder = shuffled(d.apply.options.length, d.id + 'a');
    $('#unitTag').textContent = d.unit + ' · ' + (i + 1) + '/' + L.length; $('#lTitle').textContent = d.title; $('#lConcept').textContent = d.concept;
    $('#terms').innerHTML = d.terms.map(function (t) { return '<dt>' + t[0] + '</dt><dd>' + t[1] + '</dd>'; }).join('');
    $('#situation').innerHTML = d.situation; $('#predQ').textContent = d.predict.q;
    $('#predOpts').innerHTML = optHtml('pred', d.predict.options, S.order);
    $('#btnStart').disabled = true; $('#startHint').textContent = '답을 하나 고르면 실험을 시작할 수 있어요.';
    $('#answerBox').innerHTML = ''; $('#aQ').textContent = d.apply.q; $('#aOpts').innerHTML = optHtml('app', d.apply.options, S.aOrder); $('#aResult').hidden = true; $('#aResult').innerHTML = ''; $('#btnCheck').disabled = true;
    $('#teacherBox').innerHTML = ''; $('#sourceBox').innerHTML = '';
    var sl = $('#slider'); sl.min = d.slider.min; sl.max = d.slider.max; sl.step = d.slider.step; sl.value = d.slider.value;
    document.title = d.title + ' · 확률과 통계 3D 교과서'; markToc();
  }

  /* 표지 ↔ 레슨, 레슨 ↔ 레슨 이동 */
  function showCover() {
    stopDemo(true); S.idx = -1; S.panel = null; S.started = false; markToc(); document.title = '확률과 통계 3D 교과서';
    if (world) { world.clearModel(); if (world.openAmt > 0) play('open'); world.setOpen(0); pose('cover'); }
    layout(); if (!isBook()) window.scrollTo(0, 0);
  }
  function showLesson(i) {
    var prev = S.idx; resetLesson(i);
    if (!world) { layout(); arrive(); return; }
    var nl = PAGES.make(), nr = PAGES.make(); drawPagesInto(nl, nr, i);
    var ol = cvL, or = cvR; cvL = nl; cvR = nr;
    world.clearModel(); world.setFlap('closed', false); world.resetUser();
    var done = function () { world.showPages(nl, nr); [ol, or].forEach(function (c) { if (c && c.__tex) c.__tex.dispose(); if (c && c.__texM) c.__texM.dispose(); }); S.busy = false; arrive(); };
    S.busy = true; layout();
    if (world.openAmt < 0.99 || prev < 0 || !ol) {
      world.showPages(nl, nr); pose('spread'); play('open'); world.setOpen(1, done);
    } else if (i > prev) {
      world.showPages(ol, nr); play('flip'); world.flip(1, or, nl, done);
    } else {
      world.showPages(nl, or); play('flip'); world.flip(-1, nr, ol, done);
    }
    if (prev >= 0) pose('spread');
  }
  function arrive() {
    if (S.idx < 0) return;
    setPanel('predict'); layout();
    if (!isBook()) window.scrollTo(0, 0);
    $('#lTitle').focus({ preventScroll: true });
  }
  function goLesson(i) { if (i < 0 || i >= L.length) location.hash = '#/'; else location.hash = '#/' + L[i].id; }
  function route() {
    var m = /^#\/(\w+)/.exec(location.hash), i = -1;
    if (m) L.forEach(function (d, k) { if (d.id === m[1]) i = k; });
    if (i < 0) showCover(); else if (i !== S.idx) showLesson(i);
  }

  /* ───────── 실험 ───────── */
  function startExperiment() {
    var d = cur(); if (S.started || S.pick === null) return; S.started = true;
    $$('input[name=pred]').forEach(function (x) { x.disabled = true; });
    $('#btnStart').disabled = true; $('#startHint').textContent = '실험이 열렸어요. 모형이 책장 위로 일어서요!';
    $('#sliderLabel').textContent = d.slider.label;
    $('#legend').innerHTML = (d.legend || []).map(function (q) { return '<span><i style="background:' + q[0] + '"></i>' + q[1] + '</span>'; }).join('');
    $('#omitted').textContent = '생략한 조건: ' + d.omitted; $('#svgFig').setAttribute('aria-label', d.svgAlt);
    var ab = $('#actions'); ab.innerHTML = '';
    (d.actions || []).forEach(function (a) { var b = document.createElement('button'); b.type = 'button'; b.className = 'btn ghost sm'; b.textContent = a.label; b.addEventListener('click', function () { S.seed++; refresh(); }); ab.appendChild(b); });
    if (world) { world.paused = !!prefs.still; world.setModel(d, val(), env(), true); if (world.modelErr) toast('3D 모형을 그리지 못했어요. 오른쪽 계산표와 2D 그림으로 학습할 수 있어요.'); pose('model'); }
    syncPause(); play('up');
    S.panel = null; S.tryMin = false; refresh(true); redrawPages(); layout();
    if (!isBook()) $('#pTry').scrollIntoView({ behavior: prefs.still ? 'auto' : 'smooth', block: 'start' });
  }
  function refresh(skip3d) {
    var d = cur(), v = val(), e = env();
    $('#sliderOut').textContent = d.slider.fmt(v); $('#slider').setAttribute('aria-valuetext', d.slider.fmt(v));
    $('#readout').innerHTML = d.calc(v, e).map(function (r) { return '<tr' + (r[2] ? ' class="em"' : '') + '><th scope="row">' + r[0] + '</th><td>' + r[1] + '</td></tr>'; }).join('');
    var inner = d.svg(v, e); $('#svgFig').innerHTML = inner; $('#svgFig').setAttribute('viewBox', PAGES.fitSvg(inner).vb);
    if (!skip3d && world) world.updateModel(v, e);
    redrawPages();
  }
  function syncPause() { var p = world && world.paused, b = $('#btnPause'); b.setAttribute('aria-pressed', String(!!p)); b.textContent = p ? '▶ 움직임 다시 시작' : '⏸ 움직임 멈춤'; }
  function modelClick() {
    var d = cur(); if (!S.started) return;
    if (d.actions && d.actions.length) { S.seed++; refresh(); toast(d.actions[0].label); return; }
    var sl = $('#slider'), v = val() + d.slider.step; if (v > d.slider.max + 1e-9) v = d.slider.min;
    sl.value = v; refresh(); toast(d.slider.label + ' = ' + d.slider.fmt(val()));
  }

  /* ───────── 정답 덮개 ───────── */
  function reveal() {
    if (S.revealed) { setPanel('answer', true); return; }
    if (!S.started) { toast('먼저 예측을 고르고 실험을 시작해 주세요.'); setPanel('predict', true); return; }
    var d = cur(), opts = d.predict.options, ok = null, i; S.revealed = true;
    for (i = 0; i < opts.length; i++) if (opts[i].ok) ok = i;
    var got = S.pick === ok;
    var html = '<p class="verdict ' + (got ? 'good' : 'bad') + '">' + (got ? '예측이 맞았어요! 🎉' : '예측과 달랐어요. 괜찮아요, 이유를 확인해 봐요.') + ' <span class="sub">내가 고른 답: ' + MARK[S.order.indexOf(S.pick)] + ' ' + opts[S.pick].t + '</span></p>';
    html += '<div class="ans"><h4>정답: ' + MARK[S.order.indexOf(ok)] + ' ' + opts[ok].t + '</h4><p>' + opts[ok].why + '</p></div><h4 class="wrongh">나머지 보기가 틀린 이유</h4><ul class="why">';
    S.order.forEach(function (oi, k) { if (oi !== ok) html += '<li' + (oi === S.pick ? ' class="mine"' : '') + '><b>' + MARK[k] + ' ' + opts[oi].t + '</b><br>' + opts[oi].why + '</li>'; });
    $('#answerBox').innerHTML = html + '</ul>';
    renderNotes(d); redrawPages(); play('flap');
    if (world) { world.setFlap('open', true); pose('flap'); }
    setPanel('answer', true);
    if (!isBook()) $('#pAnswer').scrollIntoView({ behavior: prefs.still ? 'auto' : 'smooth', block: 'start' });
  }
  function renderNotes(d) {
    var t = (typeof TEACH !== 'undefined' && TEACH[d.id]) || { ask: [], simplify: '', misc: '', verify: '', data: '' };
    $('#teacherBox').innerHTML = '<div class="notebox"><h4>수업에서 던질 질문</h4><ul>' + t.ask.map(function (q) { return '<li>' + q + '</li>'; }).join('') + '</ul><h4>모형이 단순화한 부분</h4><p>' + t.simplify + '</p><h4>자주 나오는 오개념</h4><p>' + t.misc + '</p><h4>계산을 확인한 방법</h4><p>' + t.verify + '</p></div>';
    $('#sourceBox').innerHTML = '<table class="srctable"><tbody>' +
      '<tr><th scope="row">교과서 단원</th><td>' + d.source + '</td></tr>' +
      '<tr><th scope="row">핵심 공식·정의</th><td>' + d.concept + '</td></tr>' +
      '<tr><th scope="row">수치의 출처</th><td>' + t.data + '</td></tr>' +
      '<tr><th scope="row">생략·가정한 조건</th><td>' + d.omitted + '</td></tr>' +
      '<tr><th scope="row">기준 교재</th><td>천재교육 「확률과 통계」(류희찬 외) 학생용·교사용 교과서의 용어·공식. 쪽수는 판에 따라 달라 단원 이름으로만 적었습니다.</td></tr>' +
      '<tr><th scope="row">연출 참고</th><td>Techartist의 Every Joule(iamtechartist.com)에서 “책상 위 3D 책, 잉크 모형, 예측·실험·증명, 정답 덮개, 도장”의 아이디어만 참고했습니다. 그 책의 코드·그림·글은 사용하지 않았습니다.</td></tr>' +
      '</tbody></table>';
  }
  function teacherTab(which) {
    var t = which === 's'; $('#tabT').setAttribute('aria-selected', String(!t)); $('#tabS').setAttribute('aria-selected', String(t));
    $('#teacherBox').hidden = t; $('#sourceBox').hidden = !t;
  }
  function openTeacher(which) {
    if (S.idx < 0) return;
    if (!S.revealed && isBook()) { toast('교사용 노트는 정답 덮개를 들춘 뒤에 열려요.'); return; }
    teacherTab(which || 't'); setPanel('teacher', true);
    if (!isBook()) $('#pTeacher').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ───────── 도전 문제 ───────── */
  function checkApply() {
    var d = cur(), opts = d.apply.options, ok = null, i; S.aChecked = true;
    for (i = 0; i < opts.length; i++) if (opts[i].ok) ok = i;
    var got = S.aPick === ok; S.aOk = got;
    var html = '<p class="verdict ' + (got ? 'good' : 'bad') + '">' + (got ? '정답이에요! 책장에 도장을 찍어 드릴게요.' : '아쉬워요. 풀이를 읽고 다시 도전해 보세요.') + '</p>';
    html += '<div class="ans"><h4>정답: ' + MARK[S.aOrder.indexOf(ok)] + ' ' + opts[ok].t + '</h4><p>' + opts[ok].why + '</p></div><h4 class="wrongh">다른 보기가 틀린 이유</h4><ul class="why">';
    S.aOrder.forEach(function (oi, k) { if (oi !== ok) html += '<li' + (oi === S.aPick ? ' class="mine"' : '') + '><b>' + MARK[k] + ' ' + opts[oi].t + '</b><br>' + opts[oi].why + '</li>'; });
    html += '</ul>' + (got ? (S.idx < L.length - 1 ? '<button type="button" class="btn primary" id="btnNextLesson">다음 레슨 ▶</button>' : '') : '<button type="button" class="btn ghost" id="btnRetry">다시 풀기</button>');
    $('#aResult').innerHTML = html; $('#aResult').hidden = false;
    $$('input[name=app]').forEach(function (x) { x.disabled = true; }); $('#btnCheck').disabled = true;
    if (got) {
      var first = !stamps[d.id]; stamps[d.id] = true; store.set('mathbook2.stamps', stamps); markToc(); play('ok');
      if (world) { pose('flap'); world.doStamp(function () { redrawPages(); play('stamp'); }); } else redrawPages();
      if (!first) toast('이미 받은 도장이에요. 다시 맞혔어요!');
    } else play('no');
    layout();
    var nb = $('#btnNextLesson'); if (nb) nb.addEventListener('click', function () { goLesson(S.idx + 1); });
    var rb = $('#btnRetry'); if (rb) rb.addEventListener('click', function () { S.aPick = null; S.aChecked = false; $('#aOpts').innerHTML = optHtml('app', d.apply.options, S.aOrder); $('#aResult').hidden = true; $('#btnCheck').disabled = true; layout(); });
  }

  /* ───────── 시연 (카메라 투어) ───────── */
  function startDemo() {
    if (!isBook() || S.idx < 0) return;
    if (!S.started) { toast('시연은 예측을 고르고 실험을 시작한 뒤에 볼 수 있어요.'); setPanel('predict', true); return; }
    var d = cur(), em = function () { var rows = d.calc(val(), env()), r = rows.filter(function (x) { return x[2]; })[0] || rows[rows.length - 1]; return r[0] + ' = ' + r[1]; };
    var v0 = val(), steps = Math.round((d.slider.max - d.slider.min) / d.slider.step);
    var shots = [
      { dur: 3.2, pose: 'spread', cap: function () { return '펼친 쪽 전체: ' + d.concept; } },
      { dur: 4.6, pose: 'model', cap: function () { return d.slider.label + '을(를) ' + d.slider.fmt(d.slider.min) + '부터 ' + d.slider.fmt(d.slider.max) + '까지 바꿔 봅니다'; },
        run: function (k) { var s = d.slider.min + Math.round(k * steps) * d.slider.step; if (+$('#slider').value !== s) { $('#slider').value = s; refresh(); } } },
      { dur: 3.4, pose: 'low', cap: function () { return '낮은 옆에서: ' + em(); } },
      { dur: 3.2, pose: 'top', cap: function () { return '위에서 보기: ' + d.svgAlt; } },
      { dur: 2.6, pose: 'model', cap: function () { return '이제 직접 슬라이더를 움직이거나 모형을 눌러 보세요'; }, enter: function () { $('#slider').value = v0; refresh(); } }
    ];
    demo = { i: -1, t: 0, shots: shots, paused: false, v0: v0, last: performance.now() };
    $('#btnDemo').setAttribute('aria-pressed', 'true'); $('#btnDemo').setAttribute('aria-label', '시연 멈추기'); $('#icoDemo').innerHTML = '<path d="M7 5h4v14H7zM13 5h4v14h-4z" class="fill"/>';
    S.panel = null; S.tryMin = true; layout(); nextShot(); requestAnimationFrame(demoTick);
  }
  function nextShot() {
    demo.i++; demo.t = 0; if (demo.i >= demo.shots.length) { stopDemo(); return; }
    var sh = demo.shots[demo.i]; if (sh.enter) sh.enter(); pose(sh.pose); setCap('▶', sh.cap(), demo.shots.length, demo.i);
  }
  function demoTick(ts) {
    if (!demo) return; var dt = Math.min((ts - demo.last) / 1000, 0.1); demo.last = ts;
    if (!demo.paused) {
      demo.t += dt; var sh = demo.shots[demo.i]; if (sh.run) sh.run(Math.min(1, demo.t / sh.dur));
      if (demo.t >= sh.dur) nextShot();
    }
    if (demo) requestAnimationFrame(demoTick);
  }
  function stopDemo(silent) {
    if (!demo) return; var v0 = demo.v0; demo = null;
    $('#btnDemo').setAttribute('aria-pressed', 'false'); $('#btnDemo').setAttribute('aria-label', '시연 보기'); $('#icoDemo').innerHTML = '<path d="M8 5l11 7-11 7z" class="fill"/>';
    if (!silent && S.idx >= 0) { $('#slider').value = v0; refresh(); S.tryMin = false; pose('model'); layout(); }
    updateBar();
  }
  function pauseDemo() { if (!demo) return; demo.paused = !demo.paused; toast(demo.paused ? '시연 일시정지 (스페이스로 계속)' : '시연 계속'); }

  /* ───────── 3D 화면 조작 ───────── */
  function bindCanvas() {
    var cv = $('#scene'), drag = null, moved = 0, lastHover = 0;
    cv.addEventListener('pointerdown', function (e) { drag = { x: e.clientX, y: e.clientY }; moved = 0; try { cv.setPointerCapture(e.pointerId); } catch (x) { /* 무시 */ } });
    cv.addEventListener('pointermove', function (e) {
      if (drag) {
        var dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
        if (moved > 6) { cv.classList.add('drag'); world.orbit(-dx * 0.006, -dy * 0.004); }
        return;
      }
      var now = performance.now(); if (now - lastHover < 90) return; lastHover = now;
      var h = world.pick(e.clientX, e.clientY);
      cv.classList.toggle('hot', !!h && (h.kind === 'flap' || (h.kind === 'model' && S.started) || S.idx < 0));
    });
    var up = function (e) {
      cv.classList.remove('drag'); if (!drag) return; drag = null;
      if (moved > 6 || e.type === 'pointercancel') return;
      var h = world.pick(e.clientX, e.clientY);
      if (S.idx < 0) { if (h) goLesson(0); return; }
      if (!h || S.busy) return;
      if (h.kind === 'flap') reveal();
      else if (h.kind === 'model') modelClick();
      else if (h.kind === 'left') { if (!S.started) setPanel('predict', true); else if (S.revealed) setPanel(S.aChecked ? 'apply' : 'answer', true); else { S.tryMin = false; S.panel = null; layout(); } }
      else if (h.kind === 'right' && !S.started) setPanel('predict', true);
    };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('wheel', function (e) { e.preventDefault(); world.orbit(0, 0, e.deltaY > 0 ? 1.1 : 0.9); }, { passive: false });
    cv.addEventListener('dblclick', function () { world.resetUser(); });
    cv.addEventListener('keydown', function (e) {
      var k = e.key, hnd = true;
      if (k === 'ArrowLeft') world.orbit(-0.15, 0); else if (k === 'ArrowRight') world.orbit(0.15, 0);
      else if (k === 'ArrowUp') world.orbit(0, -0.1); else if (k === 'ArrowDown') world.orbit(0, 0.1);
      else if (k === '+' || k === '=') world.orbit(0, 0, 0.85); else if (k === '-' || k === '_') world.orbit(0, 0, 1.18);
      else if (k === 'Home') world.resetUser(); else hnd = false;
      if (hnd) { e.preventDefault(); e.stopPropagation(); }
    });
  }

  /* ───────── 화면 방식·테마 ───────── */
  function setMode(m, user) {
    mode = m; if (user) { prefs.mode = m; save(); }
    if (m === 'book' && !(world && world.ok)) { toast(T ? '이 브라우저에서는 3D를 켤 수 없어 글 화면으로 보여 드려요.' : '3D 라이브러리를 불러오지 못해 글 화면으로 보여 드려요.'); mode = 'text'; }
    if (world) world.active = isBook();
    if (isBook() && world) {
      var st = world.still; world.still = true;
      if (S.idx >= 0) { if (!cvL) { cvL = PAGES.make(); cvR = PAGES.make(); } drawPagesInto(cvL, cvR, S.idx); world.showPages(cvL, cvR); world.setOpen(1); world.setFlap(S.revealed ? 'open' : 'closed', false); if (S.started) world.setModel(cur(), val(), env(), false); else world.clearModel(); pose(S.started ? 'model' : 'spread'); }
      else { world.setOpen(0); pose('cover'); }
      world.snapCam(); world.still = st;
      if (S.idx >= 0 && !S.panel && !S.started) S.panel = 'predict';
    }
    layout();
  }
  function applyTheme() {
    if (prefs.theme) document.documentElement.setAttribute('data-theme', prefs.theme); else document.documentElement.removeAttribute('data-theme');
    if (world) { var dark = prefs.theme ? prefs.theme === 'dark' : (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches); world.setDark(dark); }
  }

  /* ───────── 이벤트 ───────── */
  function bind() {
    document.addEventListener('change', function (e) {
      var n = e.target.name;
      if (n === 'pred') { S.pick = +e.target.value; $('#btnStart').disabled = false; $('#startHint').textContent = '좋아요! 이제 실험을 시작해 보세요.'; redrawPages(); }
      if (n === 'app') { S.aPick = +e.target.value; $('#btnCheck').disabled = false; }
    });
    $('#btnStart').addEventListener('click', startExperiment);
    $('#slider').addEventListener('input', function () { refresh(); });
    $('#btnReset').addEventListener('click', function () {
      var d = cur(); $('#slider').value = d.slider.value; S.seed = 1;
      if (world) { world.paused = !!prefs.still; world.setModel(d, d.slider.value, env(), false); syncPause(); world.resetUser(); pose('model'); }
      refresh(true);
    });
    $('#btnPause').addEventListener('click', function () { if (!world) return; world.paused = !world.paused; syncPause(); });
    $('#btnTryMin').addEventListener('click', function () { S.tryMin = !S.tryMin; if (!S.tryMin && window.innerWidth < 1100) S.panel = null; layout(); });
    $('#btnToFlap').addEventListener('click', reveal);
    $('#btnReveal').addEventListener('click', reveal);
    $('#btnToApply').addEventListener('click', function () { setPanel('apply', true); if (!isBook()) $('#pApply').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    $('#btnCheck').addEventListener('click', checkApply);
    $$('[data-teacher]').forEach(function (b) { b.addEventListener('click', function () { openTeacher(b.getAttribute('data-teacher')); }); });
    $('#tabT').addEventListener('click', function () { teacherTab('t'); });
    $('#tabS').addEventListener('click', function () { teacherTab('s'); });
    $$('[data-close]').forEach(function (b) { b.addEventListener('click', function () { S.panel = null; layout(); if (S.started) pose('model'); }); });
    $('#btnOpen').addEventListener('click', function () { goLesson(0); });
    $('#btnCoverToc').addEventListener('click', function () { toggleToc(true); });
    $('#btnToc').addEventListener('click', function () { toggleToc(); });
    $('#tocClose').addEventListener('click', function () { toggleToc(false); $('#btnToc').focus(); });
    $('#toc').addEventListener('click', function (e) { if (e.target.closest('a')) toggleToc(false); });
    $('#btnPrev').addEventListener('click', function () { if (S.busy) return; goLesson(S.idx - 1); });
    $('#btnNext').addEventListener('click', function () { if (S.busy) return; goLesson(S.idx + 1 >= L.length ? -1 : S.idx + 1); });
    $('#btnDemo').addEventListener('click', function () { if (demo) stopDemo(); else startDemo(); });
    $('#btnSound').addEventListener('click', function () { prefs.sound = !prefs.sound; save(); if (prefs.sound) { actx(); play('ok'); } updateBar(); });
    $('#btnStill').addEventListener('click', function () {
      prefs.still = !prefs.still; save(); if (world) { world.still = prefs.still; world.paused = prefs.still; syncPause(); }
      toast(prefs.still ? '움직임 줄이기: 넘김·회전 효과를 끕니다' : '움직임을 다시 켰어요'); layout();
    });
    $('#btnTheme').addEventListener('click', function () {
      var c = document.documentElement.getAttribute('data-theme'), dark = c ? c === 'dark' : (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
      prefs.theme = dark ? 'light' : 'dark'; save(); applyTheme();
    });
    $('#btnTeach').addEventListener('click', function () { openTeacher('t'); });
    $('#btnMode').addEventListener('click', function () { stopDemo(true); setMode(isBook() ? 'text' : 'book', true); });
    window.addEventListener('hashchange', function () { toggleToc(false); route(); });
    document.addEventListener('keydown', function (e) {
      var tag = (document.activeElement && document.activeElement.tagName) || '', typing = /INPUT|TEXTAREA|SELECT/.test(tag);
      if (e.key === 'Escape') { if (demo) stopDemo(); else if (!$('#toc').hidden) toggleToc(false); else if (S.panel && isBook()) { S.panel = null; layout(); } return; }
      if (e.key === ' ' && demo && !typing && tag !== 'BUTTON') { e.preventDefault(); pauseDemo(); return; }
      if (!isBook() || typing || document.activeElement === $('#scene')) return;
      if (document.activeElement === document.body || document.activeElement === $('#lTitle')) {
        if (e.key === 'ArrowRight' && !S.busy) goLesson(S.idx + 1 >= L.length ? -1 : S.idx + 1);
        if (e.key === 'ArrowLeft' && !S.busy && S.idx >= 0) goLesson(S.idx - 1);
      }
    });
    var rz; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
    if (window.matchMedia) { try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme); } catch (e) { /* 무시 */ } }
  }

  /* ───────── three.js 불러오기 (내 폴더 → 인터넷 순서) ───────── */
  function loadThree(done) {
    var urls = ['lib/three.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'], k = 0;
    if (/[?&]no3d/.test(location.search)) { done(false); return; }   /* 주소 끝에 ?no3d 를 붙이면 3D 없이 글 화면 */
    (function next() {
      if (window.THREE) { done(true); return; }
      if (k >= urls.length) { done(false); return; }
      var s = document.createElement('script'); s.src = urls[k++]; s.onload = function () { done(!!window.THREE); }; s.onerror = function () { next(); };
      document.head.appendChild(s);
    })();
  }

  function init() {
    applyTheme(); buildToc(); bind();
    document.body.classList.add(mode === 'book' ? 'book' : 'text');
    loadThree(function (ok) {
      if (ok) {
        T = window.THREE; INK.init(T);
        try { world = new BookWorld(T, $('#scene')); } catch (e) { world = null; if (window.console) console.error(e); }
        if (world && world.ok) { world.still = !!prefs.still; bindCanvas(); applyTheme(); pose('cover'); world.snapCam(); } else world = null;
      }
      $('#loading').classList.add('done'); setTimeout(function () { $('#loading').hidden = true; }, 700);
      setMode(mode, false); route(); layout();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (world) { world.redrawFixed(); world.redrawTags(); } redrawPages(); });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  /* 점검용: 모든 레슨의 책장을 상태별로 그려 보고 잘림·넘침을 보고 */
  function pageReport() {
    var out = [], l = PAGES.make(), r = PAGES.make(), save = { pick: S.pick, order: S.order, started: S.started, revealed: S.revealed };
    L.forEach(function (d, i) {
      S.order = shuffled(d.predict.options.length, d.id + 'p'); S.pick = S.order[0];
      [[false, false], [true, false], [true, true]].forEach(function (f) {
        S.started = f[0]; S.revealed = f[1];
        [d.slider.min, d.slider.max].forEach(function (v) {
          var st = pageState(i); st.v = v; var a = PAGES.drawLeft(l, d, st), b = PAGES.drawRight(r, d, st, null);
          if (a.trunc.length || b.trunc.length || a.overflow || b.overflow || a.k < 1 || b.k < 1) out.push(d.id + (f[1] ? '/정답' : f[0] ? '/실험' : '/예측') + ' v=' + v + ' 왼쪽K=' + a.k + ' 오른쪽K=' + b.k + (a.overflow || b.overflow ? ' 넘침!' : '') + (a.trunc.concat(b.trunc).length ? ' 말줄임: ' + a.trunc.concat(b.trunc).join(' | ') : ''));
        });
      });
    });
    S.pick = save.pick; S.order = save.order; S.started = save.started; S.revealed = save.revealed;
    return out;
  }
  window.__app = { S: S, L: L, world: function () { return world; }, reveal: reveal, startDemo: startDemo, pageReport: pageReport };
})();
