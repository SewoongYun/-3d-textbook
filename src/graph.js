/* ════════ 9차: 개념 연결 지도 ════════
   레슨(큰 점)과 여러 레슨이 함께 쓰는 개념(작은 점)을 선으로 이은 그래프.
   점에 올리면 이웃만 밝게, 레슨 점을 누르면 그 레슨으로 들어간다. 점은 끌어 옮길 수 있다. */
var GRAPH = (function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var SHORT = { binom: '이항정리', stat: '통계적·수학적 확률', add: '덧셈정리', comp: '여사건', indep: '독립시행', expect: '기댓값', xbar: '표본평균', ci: '모평균 추정', prop: '모비율 추정' };

  /* 레슨 밖의 공통 개념: [id, 이름, 뜻, 공통수학1에서 배움] */
  var CONCEPTS = [
    ['c_mul', '곱의 법칙', '사건 A가 일어나는 경우의 수가 m이고, 그 각각에 대하여 사건 B가 일어나는 경우의 수가 n이면, 두 사건 A, B가 잇달아 일어나는 경우의 수는 m×n', 1],
    ['c_perm', '순열 ₙPᵣ', '서로 다른 n개에서 r개를 택하여 일렬로 나열하는 것. ₙPᵣ = n!/(n−r)! (단, 0≤r≤n)', 1],
    ['c_comb', '조합 ₙCᵣ', '서로 다른 n개에서 순서를 생각하지 않고 r개를 택하는 것. ₙCᵣ = n!/(r!(n−r)!) (단, 0≤r≤n)', 1],
    ['c_space', '표본공간', '어떤 시행에서 일어날 수 있는 모든 결과의 집합 S'],
    ['c_excl', '배반사건', 'A∩B=∅, 곧 동시에 일어나지 않는 두 사건 A, B'],
    ['c_trial', '독립시행', '같은 시행을 반복할 때 각 시행의 결과가 다른 시행의 결과에 영향을 주지 않는 시행'],
    ['c_lln', '큰 수의 법칙', '시행 횟수 n을 충분히 크게 하면 상대도수 X/n이 확률 p에 가까울 확률이 1에 가까워진다'],
    ['c_rv', '확률변수', '어떤 시행에서 표본공간의 각 원소에 하나의 실수를 대응시키는 것'],
    ['c_std', '표준화', 'X가 정규분포 N(m, σ²)을 따를 때 Z=(X−m)/σ는 표준정규분포 N(0, 1)을 따른다'],
    ['c_sample', '모집단과 표본', '조사 대상 전체가 모집단, 조사하려고 모집단에서 임의추출한 일부가 표본'],
    ['c_conf', '신뢰도 95%', '같은 방법으로 신뢰구간을 여러 번 만들면 그중 약 95%가 모평균(모비율)을 포함한다는 뜻']
  ];

  /* 연결: [점 a, 점 b, 어떻게 이어지는지] */
  var EDGES = [
    ['c_mul', 'rep', '자리마다 n가지씩 r번 곱하면 nʳ'],
    ['c_mul', 'c_perm', '곱의 법칙으로 ₙPᵣ = n(n−1)(n−2)⋯(n−r+1)'],
    ['c_perm', 'rep', '순열에서 같은 것을 여러 번 택해도 되게 한 것'],
    ['c_perm', 'dup', '순열에서 같은 것끼리 바꾼 배열을 하나로 센다'],
    ['c_comb', 'dup', '같은 것이 놓일 자리를 조합으로 골라도 센다'],
    ['c_comb', 'comb', '중복조합의 수 ₙHᵣ = ₙ₊ᵣ₋₁Cᵣ'],
    ['dup', 'comb', '공과 칸막이를 나열하는 같은 것이 있는 순열로 중복조합을 센다'],
    ['c_comb', 'binom', '이항계수가 곧 조합의 수 ₙCᵣ'],
    ['c_comb', 'indep', 'n번 중 r번 일어나는 순서의 수가 ₙCᵣ'],
    ['binom', 'bin', 'P(X=r) = ₙCᵣpʳqⁿ⁻ʳ은 (q+p)ⁿ의 전개식의 항'],
    ['c_space', 'stat', '수학적 확률 P(A) = n(A)/n(S)'],
    ['c_space', 'add', '사건 A∪B, A∩B는 표본공간의 부분집합'],
    ['c_space', 'cond', '조건부확률은 표본공간을 사건 A로 줄여 본 확률'],
    ['c_excl', 'add', '배반사건이면 P(A∪B) = P(A) + P(B)'],
    ['c_excl', 'comp', 'A와 Aᶜ은 서로 배반사건'],
    ['add', 'comp', '덧셈정리로 P(A) + P(Aᶜ) = P(S) = 1'],
    ['cond', 'indep', '두 사건이 독립이면 P(B|A) = P(B)'],
    ['c_trial', 'indep', '독립시행의 확률 ₙCᵣpʳ(1−p)ⁿ⁻ʳ'],
    ['c_trial', 'bin', '독립시행에서 사건이 일어나는 횟수의 확률분포'],
    ['indep', 'bin', '독립시행의 확률이 곧 이항분포의 확률'],
    ['c_lln', 'stat', '시행을 많이 하면 상대도수가 수학적 확률에 가까워진다'],
    ['c_lln', 'bin', 'B(n, p)에서 n이 커지면 X/n이 p에 가까워진다'],
    ['c_rv', 'expect', '확률변수의 평균이 기댓값 E(X)'],
    ['c_rv', 'bin', '성공 횟수 X는 이산확률변수'],
    ['c_rv', 'norm', '정규분포를 따르는 X는 연속확률변수'],
    ['c_rv', 'xbar', '표본평균 X̄도 표본에 따라 달라지는 확률변수'],
    ['expect', 'bin', '이항분포의 평균 E(X) = np, 분산 V(X) = npq'],
    ['expect', 'xbar', 'E(X̄) = m, V(X̄) = σ²/n'],
    ['bin', 'norm', 'n이 충분히 크면 B(n, p)는 근사적으로 N(np, npq)'],
    ['norm', 'xbar', '모집단이 정규분포이면 X̄도 정규분포, n이 크면 근사적으로 정규분포'],
    ['norm', 'prop', 'n이 크면 p̂는 근사적으로 N(p, pq/n)'],
    ['c_std', 'norm', 'Z = (X−m)/σ로 바꿔 표준정규분포표를 쓴다'],
    ['c_std', 'ci', '1.96은 P(−1.96 ≤ Z ≤ 1.96) ≈ 0.95에서 나온다'],
    ['c_std', 'prop', '모비율의 신뢰구간에도 같은 1.96을 쓴다'],
    ['c_sample', 'xbar', '표본에서 구한 평균이 표본평균 X̄'],
    ['c_sample', 'ci', '표본평균으로 모평균을 추정한다'],
    ['c_sample', 'prop', '표본비율로 모비율을 추정한다'],
    ['xbar', 'ci', 'σ(X̄) = σ/√n이 신뢰구간의 폭을 정한다'],
    ['ci', 'prop', '같은 꼴: 추정값 ± 1.96 × (표준편차)'],
    ['c_conf', 'ci', '신뢰구간 100개 중 약 95개가 모평균을 포함'],
    ['c_conf', 'prop', '신뢰구간 100개 중 약 95개가 모비율을 포함']
  ];

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function mh(s) { return typeof MATH !== 'undefined' ? MATH.html(s) : esc(s); }
  function rd(s) { return typeof MATH !== 'undefined' ? MATH.read(s) : s; }
  function unitNo(u) { return Math.max(0, ['Ⅰ', 'Ⅱ', 'Ⅲ'].indexOf(String(u).charAt(0))); }

  function data(L) {
    var nodes = [], idx = {};
    L.forEach(function (d, i) { idx[d.id] = nodes.length; nodes.push({ id: d.id, kind: 'lesson', i: i, unit: d.unit, u: unitNo(d.unit), label: SHORT[d.id] || d.title, title: d.title, text: d.concept, nb: [] }); });
    CONCEPTS.forEach(function (c) { idx[c[0]] = nodes.length; nodes.push({ id: c[0], kind: 'concept', label: c[1], title: c[1], text: c[2], pre: !!c[3], nb: [] }); });
    var edges = EDGES.filter(function (e) { return idx[e[0]] !== undefined && idx[e[1]] !== undefined; }).map(function (e) {
      var a = nodes[idx[e[0]]], b = nodes[idx[e[1]]], ed = { a: a, b: b, why: e[2] };
      a.nb.push({ n: b, why: e[2] }); b.nb.push({ n: a, why: e[2] }); return ed;
    });
    nodes.forEach(function (n) {        /* 개념 점의 단원 위치 = 이웃 레슨 단원의 평균 */
      if (n.kind === 'concept') { var s = 0, k = 0; n.nb.forEach(function (m) { if (m.n.kind === 'lesson') { s += m.n.u; k++; } }); n.u = k ? s / k : 1; }
      n.r = n.kind === 'lesson' ? 10 + 2.2 * Math.sqrt(n.nb.length) : 5 + 0.9 * n.nb.length;
    });
    return { nodes: nodes, edges: edges, idx: idx };
  }

  /* 힘으로 펼치기(Fruchterman–Reingold) + 단원 순서(Ⅰ→Ⅱ→Ⅲ)로 당기는 힘 */
  function step(G, W, H, port, alpha) {
    var N = G.nodes, k = Math.sqrt(W * H / N.length) * 0.62, i, j;
    N.forEach(function (n) { n.dx = 0; n.dy = 0; });
    for (i = 0; i < N.length; i++) for (j = i + 1; j < N.length; j++) {
      var a = N[i], b = N[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy) || 0.01, f = k * k / d;
      a.dx += dx / d * f; a.dy += dy / d * f; b.dx -= dx / d * f; b.dy -= dy / d * f;
    }
    G.edges.forEach(function (e) {
      var dx = e.a.x - e.b.x, dy = e.a.y - e.b.y, d = Math.sqrt(dx * dx + dy * dy) || 0.01, f = d * d / k;
      e.a.dx -= dx / d * f; e.a.dy -= dy / d * f; e.b.dx += dx / d * f; e.b.dy += dy / d * f;
    });
    var temp = Math.max(W, H) * 0.06 * alpha + 0.5;
    N.forEach(function (n) {
      var t = (n.u + 0.5) / 3, ax = port ? W / 2 : W * t, ay = port ? H * t : H / 2;
      n.dx += (ax - n.x) * (port ? 0.5 : 1.4); n.dy += (ay - n.y) * (port ? 1.4 : 0.5);
      if (n.fixed) return;
      var d = Math.sqrt(n.dx * n.dx + n.dy * n.dy) || 1, m = Math.min(d, temp);
      n.x += n.dx / d * m; n.y += n.dy / d * m;
    });
  }
  function layout(G, W, H) {
    var port = H > W * 1.1, s = 7;
    function rnd() { s = (s * 16807) % 2147483647; return s / 2147483647; }
    G.nodes.forEach(function (n) {
      var t = (n.u + 0.5) / 3;
      n.x = port ? W * (0.2 + 0.6 * rnd()) : W * t + (rnd() - 0.5) * W * 0.2;
      n.y = port ? H * t + (rnd() - 0.5) * H * 0.2 : H * (0.2 + 0.6 * rnd());
    });
    for (var it = 0; it < 450; it++) step(G, W, H, port, 1 - it / 450);
    return port;
  }

  /* 이름표끼리 겹치지 않게 살짝 밀어내기 (점+이름표를 한 상자로 보고) */
  function declutter(N, W, H, mx) {
    N.forEach(function (n) { n.bw = Math.max(2 * n.r, n.label.length * (n.kind === 'lesson' ? 14 : 12)) + 6; n.bh = 2 * n.r + 20; });
    for (var it = 0; it < 120; it++) {
      var moved = false;
      for (var i = 0; i < N.length; i++) for (var j = i + 1; j < N.length; j++) {
        var a = N[i], b = N[j], dx = b.x - a.x, dy = b.y - a.y, ox = (a.bw + b.bw) / 2 - Math.abs(dx), oy = (a.bh + b.bh) / 2 - Math.abs(dy);
        if (ox <= 0 || oy <= 0) continue;
        moved = true;
        if (ox < oy) { var sx = (dx < 0 ? -1 : 1) * (ox / 2 + 0.5); a.x -= sx; b.x += sx; } else { var sy = (dy < 0 ? -1 : 1) * (oy / 2 + 0.5); a.y -= sy; b.y += sy; }
      }
      N.forEach(function (n) { n.x = Math.max(n.bw / 2 + 4, Math.min(W - n.bw / 2 - 4, n.x)); n.y = Math.max(n.r + 6, Math.min(H - n.bh + n.r, n.y)); });
      if (!moved) break;
    }
  }

  function el(tag, attrs) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }

  var cur = null;   /* 지금 그려진 지도 (다시 열 때 정리용) */
  function mount(svg, info, opt) {
    if (cur && cur.stop) cur.stop();
    var L = opt.lessons, G = data(L), W = Math.max(300, svg.clientWidth || 800), H = Math.max(300, svg.clientHeight || 520);
    var port = layout(G, W, H), pinned = null, raf = 0, still = !!opt.still;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    /* 화면에 맞게: 점 위치를 틀 안으로 늘이거나 줄여서 글자는 제 크기로 */
    var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, mx = Math.min(80, W * 0.12);
    G.nodes.forEach(function (n) { x0 = Math.min(x0, n.x); x1 = Math.max(x1, n.x); y0 = Math.min(y0, n.y); y1 = Math.max(y1, n.y); });
    G.nodes.forEach(function (n) { n.x = mx + (n.x - x0) / ((x1 - x0) || 1) * (W - 2 * mx); n.y = 30 + (n.y - y0) / ((y1 - y0) || 1) * (H - 70); });
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    declutter(G.nodes, W, H, mx);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    var gE = el('g', { 'class': 'gedges', 'aria-hidden': 'true' }), gN = el('g', { 'class': 'gnodes' });
    svg.appendChild(gE); svg.appendChild(gN);
    G.edges.forEach(function (e) { e.el = el('line', { 'class': 'ge' + (e.a.kind === 'lesson' && e.b.kind === 'lesson' ? ' ll' : '') }); gE.appendChild(e.el); });
    G.nodes.forEach(function (n) {
      var lesson = n.kind === 'lesson', g = el('g', { 'class': 'gn ' + (lesson ? 'lesson u' + n.u : 'concept'), tabindex: '0', role: lesson ? 'link' : 'button' });
      g.setAttribute('aria-label', rd(lesson ? (n.i + 1) + '. ' + n.title + ' 레슨으로 들어가기. 연결 ' + n.nb.length + '개' : '개념 ' + n.title + '. 연결된 레슨 보기'));
      if (lesson && n.i === opt.current) g.classList.add('cur');
      if (lesson && opt.stamps && opt.stamps[n.id]) g.classList.add('done');
      g.appendChild(el('circle', { r: n.r + 4, 'class': 'ring' }));
      g.appendChild(el('circle', { r: n.r, 'class': 'dot' }));
      var t = el('text', { y: n.r + 15, 'text-anchor': 'middle', 'class': 'gl' }); t.textContent = n.label; g.appendChild(t);
      n.el = g; gN.appendChild(g);
    });
    function draw() {
      G.edges.forEach(function (e) { e.el.setAttribute('x1', e.a.x.toFixed(1)); e.el.setAttribute('y1', e.a.y.toFixed(1)); e.el.setAttribute('x2', e.b.x.toFixed(1)); e.el.setAttribute('y2', e.b.y.toFixed(1)); });
      G.nodes.forEach(function (n) { n.el.setAttribute('transform', 'translate(' + n.x.toFixed(1) + ',' + n.y.toFixed(1) + ')'); });
    }
    draw();

    /* 밝히기와 설명 */
    var HELP = '<p class="small">점에 마우스를 올리거나 Tab으로 고르면 이어진 개념이 밝아집니다. <b>큰 점(레슨)</b>을 누르면 그 레슨으로 들어가고, <b>작은 점(공통 개념)</b>을 누르면 그 개념을 쓰는 레슨이 보입니다. 점은 끌어서 옮길 수 있어요.</p>';
    function infoHtml(n) {
      var lesson = n.kind === 'lesson', h = '<p class="kicker">' + (lesson ? esc(n.unit) + ' · 레슨 ' + (n.i + 1) : '공통 개념' + (n.pre ? ' · 공통수학1에서 배움' : '')) + '</p>';
      h += '<h3>' + mh(n.title) + '</h3><p>' + mh(n.text) + '</p><p class="small"><b>이어진 점</b></p><ul class="gnb">';
      n.nb.forEach(function (m) {
        var name = m.n.kind === 'lesson' ? '<button type="button" class="glink" data-go="' + m.n.i + '">' + mh(m.n.title) + '</button>' : '<b>' + mh(m.n.title) + '</b>';
        h += '<li>' + name + ' — ' + mh(m.why) + '</li>';
      });
      h += '</ul>';
      if (lesson) h += '<button type="button" class="btn primary sm" data-go="' + n.i + '">이 레슨으로 들어가기 ▶</button>';
      return h;
    }
    function light(n) {
      svg.classList.toggle('hl', !!n);
      G.nodes.forEach(function (m) { m.el.classList.remove('me', 'nb'); });
      G.edges.forEach(function (e) { e.el.classList.toggle('on', !!n && (e.a === n || e.b === n)); });
      if (n) { n.el.classList.add('me'); n.nb.forEach(function (m) { m.n.el.classList.add('nb'); }); }
      info.innerHTML = n ? infoHtml(n) : HELP;
    }
    light(null);
    function activate(n) {
      if (n.kind === 'lesson') { opt.onGo(n.i); return; }
      pinned = pinned === n ? null : n; light(pinned);
    }

    /* 끌기 · 누르기 */
    var drag = null;
    function pt(e) { var p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); }
    function nodeOf(t) { var g = t.closest && t.closest('.gn'); if (!g) return null; for (var i = 0; i < G.nodes.length; i++) if (G.nodes[i].el === g) return G.nodes[i]; return null; }
    function settle(frames) {
      if (still) { draw(); return; }
      cancelAnimationFrame(raf); var f = 0;
      (function loop() { step(G, W, H, port, 0.12); draw(); if (++f < frames || drag) raf = requestAnimationFrame(loop); })();
    }
    function down(e) {
      var n = nodeOf(e.target); if (!n) return;
      var p = pt(e); drag = { n: n, ox: n.x - p.x, oy: n.y - p.y, sx: e.clientX, sy: e.clientY, moved: false };
      n.fixed = true; e.preventDefault();
    }
    function move(e) {
      if (!drag) { var h = nodeOf(e.target); if (e.pointerType === 'mouse') light(h || pinned); return; }
      if (!drag.moved && Math.abs(e.clientX - drag.sx) + Math.abs(e.clientY - drag.sy) < 5) return;
      if (!drag.moved) { drag.moved = true; settle(1); }
      var p = pt(e); drag.n.x = p.x + drag.ox; drag.n.y = p.y + drag.oy; if (still) draw();
    }
    function up(e) {
      if (!drag) return;
      var d = drag; drag = null; d.n.fixed = false;
      if (!d.moved) activate(d.n); else settle(40);
    }
    function key(e) {
      var n = nodeOf(e.target); if (!n) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(n); }
    }
    function focus(e) { var n = nodeOf(e.target); if (n) light(n); }
    function bg(e) { if (!nodeOf(e.target) && !drag) { pinned = null; light(null); } }
    function leave() { if (!drag) light(pinned); }
    function go(e) { var b = e.target.closest('[data-go]'); if (b) opt.onGo(+b.getAttribute('data-go')); }
    svg.addEventListener('pointerdown', down); svg.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    svg.addEventListener('keydown', key); svg.addEventListener('focusin', focus); svg.addEventListener('click', bg); svg.addEventListener('pointerleave', leave);
    info.addEventListener('click', go);
    cur = {
      G: G, stop: function () {
        cancelAnimationFrame(raf);
        svg.removeEventListener('pointerdown', down); svg.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
        svg.removeEventListener('keydown', key); svg.removeEventListener('focusin', focus); svg.removeEventListener('click', bg); svg.removeEventListener('pointerleave', leave);
        info.removeEventListener('click', go);
      }
    };
    return cur;
  }

  /* 화면 낭독·글 화면용 목록 */
  function listHtml(L) {
    var G = data(L), h = '', unit = '';
    G.nodes.forEach(function (n) {
      if (n.kind !== 'lesson') return;
      if (n.unit !== unit) { if (unit) h += '</ul>'; unit = n.unit; h += '<h4>' + esc(unit) + '</h4><ul>'; }
      h += '<li><a href="#/' + n.id + '">' + (n.i + 1) + '. ' + mh(n.title) + '</a> — ' + n.nb.map(function (m) { return mh(m.n.title); }).join(', ') + '</li>';
    });
    h += '</ul><h4>공통 개념</h4><ul>';
    G.nodes.forEach(function (n) { if (n.kind === 'concept') h += '<li><b>' + mh(n.title) + '</b>' + (n.pre ? ' (공통수학1)' : '') + ': ' + mh(n.text) + ' — 쓰는 레슨: ' + n.nb.map(function (m) { return mh(m.n.title); }).join(', ') + '</li>'; });
    return h + '</ul>';
  }

  return { data: data, mount: mount, listHtml: listHtml, CONCEPTS: CONCEPTS, EDGES: EDGES, current: function () { return cur; } };
})();
