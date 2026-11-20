/* 사용: node test.js — 공식으로 계산한 값을 직접 세어 본(전수 조사) 값과 비교합니다.
   7차: 원순열 삭제, 모든 문제 숫자 변경, 모비율의 추정 추가. 정답 보기의 글이 직접 센 값과 같은지도 확인합니다. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ctx = vm.createContext({ console, Math, Object, Array, String, Number, JSON });
['lib.js', 'math.js', 'lessons_1.js', 'lessons_2.js', 'lessons_3.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(__dirname, 'src', f), 'utf8'), ctx, { filename: f }));
const L = vm.runInContext('LESSONS', ctx), MX = vm.runInContext('MX', ctx);
let fail = 0, pass = 0;
const ok = (c, msg) => { if (c) pass++; else { fail++; console.log('  ✗ 실패:', msg); } };
const near = (a, b, e, msg) => ok(Math.abs(a - b) <= e, msg + ' (' + a + ' vs ' + b + ')');
const by = id => L.find(d => d.id === id);
const rows = (id, v, seed) => by(id).calc(v, { seed: seed || 1 });
const cell = (id, v, label, seed) => { const r = rows(id, v, seed).find(x => x[0].includes(label)); return r ? r[1] : undefined; };
const okText = (id, kind) => by(id)[kind].options.find(o => o.ok).t;   /* 정답 보기의 글 */
const ans = (id, kind, want, how) => ok(okText(id, kind) === want, id + ' ' + kind + ' 정답 보기 "' + okText(id, kind) + '" / 직접 계산 ' + want + (how ? ' (' + how + ')' : ''));

/* 1) 모든 슬라이더 값에서 오류·NaN 없는지 */
L.forEach(d => {
  for (let v = d.slider.min; v <= d.slider.max; v += d.slider.step) for (let s = 1; s <= 3; s++) {
    const env = { seed: s };
    let c, g; try { c = d.calc(v, env); g = d.svg(v, env); d.slider.fmt(v); } catch (e) { ok(false, d.id + ' v=' + v + ' 오류 ' + e.message); continue; }
    const text = JSON.stringify(c) + g;
    ok(!/NaN|undefined|Infinity/.test(text), d.id + ' v=' + v + ' 에 NaN/undefined 포함');
  }
  ok(d.predict.options.filter(o => o.ok).length === 1, d.id + ' 예측 보기의 정답이 1개가 아님');
  ok(d.apply.options.filter(o => o.ok).length === 1, d.id + ' 적용 보기의 정답이 1개가 아님');
  ok(d.predict.options.length === 4 && d.apply.options.length === 4, d.id + ' 보기가 4개가 아님');
  ok(d.slider.value >= d.slider.min && d.slider.value <= d.slider.max, d.id + ' 기본값이 범위 밖');
  ok(typeof d.build3d === 'function', d.id + ' build3d 없음');
});
console.log('레슨 수:', L.length);

/* 2) 직접 세어 보기 */
const perms = a => a.length <= 1 ? [a] : a.flatMap((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map(p => [x, ...p]));
ok(!by('circ'), '원순열 레슨은 2022 개정 교육과정에 따라 빠져야 함');
// 중복순열
for (let r = 1; r <= 6; r++) ok(cell('rep', r, '중복순열의 수').includes('= ' + 3 ** r + '가지'), 'rep r=' + r);
{ let c = 0; for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) for (let d = 0; d < 3; d++) for (let e = 0; e < 3; e++) c++; ans('rep', 'apply', c + '가지', '엽서 4장·우체통 3개'); }
ans('rep', 'predict', '3배가 된다');
// 같은 것이 있는 순열
for (let k = 1; k <= 5; k++) {
  const base = []; for (let i = 0; i < 5; i++) base.push(i < k ? 'R' : 'x' + i);
  const n = new Set(perms(base).map(p => p.join())).size;
  ok(cell('dup', k, '서로 다른 배열') === n + '가지', 'dup k=' + k + ' 표시 ' + cell('dup', k, '서로 다른 배열') + ' / 직접 ' + n);
}
ans('dup', 'apply', new Set(perms('112234'.split('')).map(p => p.join(''))).size + '가지', '카드 1,1,2,2,3,4');
{ const n = new Set(perms(['R', 'R', 'R', 'x', 'y']).map(p => p.join())).size; ans('dup', 'predict', n + '가지 (120 ÷ 3!)'); }
// 중복조합
for (let r = 1; r <= 6; r++) {
  let c = 0; for (let a = 0; a <= r; a++) for (let b = 0; a + b <= r; b++) c++;
  ok(cell('comb', r, '중복조합의 수').endsWith('= ' + c + '가지'), 'comb r=' + r + ' 표시 ' + cell('comb', r, '중복조합의 수') + ' / 직접 ' + c);
}
{ let c = 0, pos = 0; for (let x = 0; x <= 6; x++) for (let y = 0; x + y <= 6; y++) { c++; if (x > 0 && y > 0 && 6 - x - y > 0) pos++; } ans('comb', 'apply', c + '개', 'x+y+z=6'); ok(pos === 10, '양의 정수 해 10 (오답 보기 설명)'); }
{ let c = 0; for (let a = 0; a <= 3; a++) for (let b = 0; a + b <= 3; b++) c++; ans('comb', 'predict', c + '가지 (₃H₃)'); }
// 이항정리: 다항식 곱으로 계수 확인
for (let n = 1; n <= 8; n++) {
  let poly = [1]; for (let i = 0; i < n; i++) { const nx = Array(poly.length + 1).fill(0); poly.forEach((c, k) => { nx[k] += c; nx[k + 1] += c; }); poly = nx; }
  ok(cell('binom', n, '이항계수') === poly.join(', '), 'binom n=' + n + ' ' + cell('binom', n, '이항계수'));
  ok(cell('binom', n, '계수의 합').startsWith(poly.reduce((a, b) => a + b) + ' ='), 'binom 합 n=' + n);
}
{ let poly = [1]; for (let i = 0; i < 5; i++) { const nx = Array(poly.length + 1).fill(0); poly.forEach((c, k) => { nx[k] += c * 2; nx[k + 1] += c; }); poly = nx; } ans('binom', 'apply', String(poly[3]), '(x+2)⁵의 x³ 계수'); }
{ let poly = [1]; for (let i = 0; i < 5; i++) { const nx = Array(poly.length + 1).fill(0); poly.forEach((c, k) => { nx[k] += c; nx[k + 1] += c; }); poly = nx; } ans('binom', 'predict', String(poly[2]), '(a+b)⁵의 a³b² 계수'); }
// 통계적 확률: 같은 시작값으로 상대도수 직접 계산
{ const f = (seed, n) => { const R = MX.rng(seed * 1013 + 17); let six = 0; for (let i = 0; i < n; i++) if (1 + Math.floor(R() * 6) === 6) six++; return six; };
  const NS = [10, 30, 100, 300, 1000, 3000, 10000];
  NS.forEach((n, i) => { const six = f(1, n); ok(cell('stat', i, '상대도수') === (six / n).toFixed(4), 'stat n=' + n + ' 표시 ' + cell('stat', i, '상대도수') + ' / 직접 ' + (six / n).toFixed(4)); });
  near(f(1, 10000) / 10000, 1 / 6, 0.01, 'stat 10000번 상대도수가 1/6 근처'); }
// 덧셈정리: 100칸을 직접 표시해서 세기
for (let x = 15; x <= 50; x += 5) {
  let u = 0, a = 0, b = 0; for (let i = 0; i < 100; i++) { const A = i < 65, B = i >= 65 - x && i < 115 - x; if (A || B) u++; if (A) a++; if (B) b++; }
  ok(a === 65 && b === 50, 'add 칸 수 A 65, B 50');
  ok(cell('add', x, 'P(A∪B)') === (u / 100).toFixed(2), 'add x=' + x + ' ' + cell('add', x, 'P(A∪B)') + ' / ' + u / 100);
}
// 생일: 365 일 모두 같은 가능성 → 직접 곱으로 계산, 교과서 값 0.5686…
{ const P = k => { let p = 1; for (let i = 0; i < k; i++) p *= (365 - i) / 365; return 1 - p; };
  near(P(30), 0.7063, 0.0001, '생일 k=30'); near(P(23), 0.5073, 0.0001, '생일 k=23'); near(P(57), 0.99, 0.001, '생일 k=57 약 99%');
  ok(cell('comp', 30, '생일이 같은 학생이 있을 확률') === P(30).toFixed(4), 'comp 표시값 ' + cell('comp', 30, '생일이 같은 학생이 있을 확률')); ans('comp', 'predict', '약 ' + Math.round(P(30) * 100) + '%'); }
{ let c = 0; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) for (let d = 1; d <= 6; d++) if (a === 1 || b === 1 || d === 1) c++; ans('comp', 'apply', c + '/216', '주사위 3번에 1이 적어도 한 번'); }
// 조건부확률: 순서쌍을 모두 세기
for (let r = 1; r <= 8; r++) {
  const balls = []; for (let i = 0; i < r + 5; i++) balls.push(i < r ? 'R' : 'B');
  let a = 0, ab = 0; balls.forEach((x, i) => balls.forEach((y, j) => { if (i !== j && x === 'R') { a++; if (y === 'R') ab++; } }));
  const v = cell('cond', r, 'P(B|A)'); const want = (r - 1) + '/' + (r + 4);
  ok(v.startsWith(want) && Math.abs(ab / a - (r - 1) / (r + 4)) < 1e-12, 'cond r=' + r + ' ' + v + ' / 직접 ' + ab + '/' + a);
}
{ const balls = ['W', 'W', 'W', 'W', 'W', 'B', 'B', 'B', 'B']; let n = 0, k = 0; balls.forEach((x, i) => balls.forEach((y, j) => { if (i !== j) { n++; if (x === 'B' && y === 'B') k++; } })); ok(k * 6 === n, 'cond 적용 1/6 (직접 ' + k + '/' + n + ')'); ans('cond', 'apply', '1/6'); }
{ const balls = ['R', 'R', 'R', 'B', 'B', 'B', 'B', 'B']; let a = 0, ab = 0; balls.forEach((x, i) => balls.forEach((y, j) => { if (i !== j && x === 'R') { a++; if (y === 'R') ab++; } })); ok(ab * 7 === a * 2, 'cond 예측 2/7'); ans('cond', 'predict', '2/7'); }
// 독립시행: 2^6 가지 수열의 확률을 모두 더하기
for (let r = 0; r <= 6; r++) {
  let sum = 0; for (let m = 0; m < 64; m++) { let ones = 0; for (let b = 0; b < 6; b++) if (m >> b & 1) ones++; if (ones === r) sum += Math.pow(1 / 4, ones) * Math.pow(3 / 4, 6 - ones); }
  const v = cell('indep', r, 'P(X=r)'); near(parseFloat(v.split('≈')[1]), sum, 0.00006, 'indep r=' + r + ' ' + v + ' / 직접 ' + sum.toFixed(5));
}
{ let s = 0, best = 0, bi = 0; for (let r = 0; r <= 6; r++) { const p = MX.binom(6, 1 / 4, r); s += p; if (p > best) { best = p; bi = r; } } near(s, 1, 1e-12, 'indep 합 1'); ans('indep', 'predict', bi + '번'); }
{ let c = 0, n = 0; const f = [1, 2, 3, 4, 5, 6]; f.forEach(a => f.forEach(b => f.forEach(d => f.forEach(e => { n++; if ([a, b, d, e].filter(x => x % 3 === 0).length === 2) c++; })))); ok(c * 27 === n * 8, 'indep 적용 8/27 (직접 ' + c + '/' + n + ')'); ans('indep', 'apply', '8/27'); }
// 기댓값: 정의대로 직접 계산
for (let a = 3; a <= 15; a++) {
  const xs = [1, 2, a], ps = [1 / 2, 1 / 3, 1 / 6]; const E = xs.reduce((s, x, i) => s + x * ps[i], 0), E2 = xs.reduce((s, x, i) => s + x * x * ps[i], 0), V = E2 - E * E;
  ok(cell('expect', a, 'E(X) =').includes('≈ ' + E.toFixed(3)), 'expect E a=' + a); ok(cell('expect', a, 'V(X)').includes('≈ ' + V.toFixed(3)), 'expect V a=' + a + ' ' + cell('expect', a, 'V(X)') + ' / ' + V.toFixed(3));
}
near((7 + 10) / 6, 17 / 6, 1e-12, 'expect a=10 → 17/6');
{ const xs = [4 - Math.sqrt(3), 4 + Math.sqrt(3)], ps = [0.5, 0.5]; /* 평균 4, 분산 3인 확률변수로 V(4X−1) 확인 */ const E = xs.reduce((s, v, i) => s + v * ps[i], 0), VX = xs.reduce((s, v, i) => s + (v - E) ** 2 * ps[i], 0), VY = xs.reduce((s, v, i) => s + (4 * v - 1 - (4 * E - 1)) ** 2 * ps[i], 0); near(E, 4, 1e-12, '평균 4'); near(VX, 3, 1e-12, '분산 3'); near(VY, 48, 1e-9, 'V(4X−1)=48'); ans('expect', 'apply', '48'); }
ans('expect', 'predict', '17/6 ≈ 2.83점');
// 이항분포
for (let v = 1; v <= 9; v++) { const p = v / 10; let s = 0, m = 0; for (let k = 0; k <= 10; k++) { const q = MX.binom(10, p, k); s += q; m += k * q; } near(s, 1, 1e-9, 'bin 합 p=' + p); near(m, 10 * p, 1e-9, 'bin 평균 np p=' + p); ok(cell('bin', v, '평균') === (10 * p).toFixed(2), 'bin 표시 평균'); }
ok(cell('bin', 7, '가장 확률이 큰 칸').startsWith('7번 칸'), 'bin p=0.7 최빈 칸 7: ' + cell('bin', 7, '가장 확률이 큰 칸'));
{ const n = 150, p = 0.6; near(Math.sqrt(n * p * (1 - p)), 6, 1e-9, 'bin 적용 σ=6'); ans('bin', 'apply', '6'); ans('bin', 'predict', '7번 칸'); }
// 정규분포: 표준정규분포표 값과 비교
near(MX.Phi(1) - 0.5, 0.3413, 0.00005, 'Φ(1)-0.5=0.3413'); near(MX.Phi(2) - 0.5, 0.4772, 0.00005, 'Φ(2)-0.5=0.4772'); near(MX.Phi(1.5) - 0.5, 0.4332, 0.00005, 'Φ(1.5)-0.5=0.4332'); near(MX.Phi(1.96) - MX.Phi(-1.96), 0.95, 0.0001, 'P(|Z|≤1.96)=0.95'); near(MX.Phi(2.58) - MX.Phi(-2.58), 0.99, 0.0005, 'P(|Z|≤2.58)≈0.99 (2.58은 반올림한 값)');
near(MX.Phi((82 - 72) / 5) - MX.Phi((67 - 72) / 5), 0.8186, 0.0001, '정규 적용 P(67≤X≤82) 직접 계산'); near(0.3413 + 0.4772, 0.8185, 1e-12, '정규 적용: 0.3413+0.4772'); ans('norm', 'apply', '0.8185');
near(1 - MX.Phi((84 - 80) / (12 / Math.sqrt(36))), 0.0228, 0.0001, 'xbar 적용 P(X̄≥84) 직접 계산'); ans('xbar', 'apply', '0.0228'); ans('norm', 'predict', '그대로 1이다');
for (let s = 5; s <= 15; s++) { let a = 0; for (let i = 0; i <= 80000; i++) { const x = 20 + 80 * i / 80000; a += MX.pdf(x, 60, s) * 80 / 80000; } if (s <= 13) near(a, 1, 0.003, 'norm σ=' + s + ' 곡선 아래 넓이 1'); }
ok(cell('norm', 10, 'P(X ≥ 70)').length > 0 && cell('norm', 10, 'P(X ≥ 70)') === (1 - MX.Phi(1)).toFixed(4), 'norm σ=10 P(X≥70)=' + cell('norm', 10, 'P(X ≥ 70)'));
// 표본평균: 모의실험이 이론값 σ/√n 에 가까운지
{ const sig = Math.sqrt(35 / 12); [1, 4, 9, 25].forEach(n => { const sd = parseFloat(cell('xbar', n, '모의실험(2000번)의 X̄ 표준편차')), mean = parseFloat(cell('xbar', n, '모의실험(2000번)의 X̄ 평균')); near(sd, sig / Math.sqrt(n), 0.04 * Math.max(1, 3 / Math.sqrt(n)) * 0.5 + 0.03, 'xbar 표준편차 n=' + n); near(mean, 3.5, 0.08, 'xbar 평균 n=' + n); });
  near(sig / Math.sqrt(25), sig / 5, 1e-12, '1/5로 줄어듦'); }
// 신뢰구간: 길이 = 2×1.96×σ/√n, 포함 비율 ≈ 95
{ near(parseFloat(cell('ci', 25, '구간의 길이')), 7.84, 1e-9, 'ci n=25 길이 7.84'); near(parseFloat(cell('ci', 100, '구간의 길이')), 3.92, 1e-9, 'ci n=100 길이 3.92');
  let tot = 0, runs = 40; for (let s = 1; s <= runs; s++) tot += parseInt(cell('ci', 25, '모평균 m=50을 포함한 구간', s)); near(tot / runs, 95, 1.5, 'ci 평균 포함 개수 ≈ 95 (' + tot / runs + ')');
  const lo = 125 - 1.96 * 8 / Math.sqrt(64), hi = 125 + 1.96 * 8 / Math.sqrt(64); ans('ci', 'apply', lo.toFixed(2) + ' ≤ m ≤ ' + hi.toFixed(2)); }
// 모비율의 추정 (7차 추가)
{ ok(!!by('prop'), '모비율의 추정 레슨이 있어야 함');
  const ph = 360 / 600, se = Math.sqrt(ph * (1 - ph) / 600); near(se, 0.02, 1e-12, 'prop 적용 √(p̂q̂/n)=0.02');
  ans('prop', 'apply', (ph - 1.96 * se).toFixed(4) + ' ≤ p ≤ ' + (ph + 1.96 * se).toFixed(4));
  const se2 = Math.sqrt(0.36 * 0.64 / 100); ok((0.36 - 1.96 * se2).toFixed(3) === '0.266' && (0.36 + 1.96 * se2).toFixed(3) === '0.454', 'prop 예측 구간 0.266~0.454');
  for (const n of [100, 400]) { let tot = 0, runs = 40; for (let s = 1; s <= runs; s++) tot += parseInt(cell('prop', n, '모비율 p=0.4를 포함한 구간', s)); near(tot / runs, 95, 2, 'prop n=' + n + ' 평균 포함 개수 ≈ 95 (' + tot / runs + ')'); }
  const l100 = parseFloat(cell('prop', 100, '구간의 길이')), l400 = parseFloat(cell('prop', 400, '구간의 길이')); near(l100 / l400, 2, 0.1, 'prop n을 4배 → 길이 약 1/2 (' + (l100 / l400).toFixed(3) + ')'); }

// 8차: 분수 찾기와 낭독 표현 (math.js)
{ const MATH = vm.runInContext('MATH', ctx), seg = s => MATH.segments(s).map(g => g.t === 's' ? g.s : '[' + g.n + '|' + g.d + ']').join('');
  [['1/6은', '[1|6]은'], ['(r−1)/(r+4)', '[r−1|r+4]'], ['P(A∩B)/P(A)', '[P(A∩B)|P(A)]'], ['σ/√n', '[σ|√n]'], ['n!/(p!q!⋯r!)', '[n!|p!q!⋯r!]'], ['√((0.6×0.4)/600)', '√([0.6×0.4|600])'], ['3.5 / 1.708', '3.5 / 1.708'], ['n(A)/n(S)', '[n(A)|n(S)]']]
    .forEach(c => ok(seg(c[0]) === c[1], '분수 찾기 ' + c[0] + ' → ' + seg(c[0])));
  [['3³', '3의 세제곱'], ['₅C₂', '5개 중 2개를 택하는 조합의 수'], ['1/6', '6분의 1'], ['ₙHᵣ', 'n개 중 r개를 택하는 중복조합의 수'], ['P(Aᶜ)', 'P(A의 여사건)'], ['p̂', 'p 햇']]
    .forEach(c => ok(MATH.read(c[0]).replace(/\s+/g, ' ').trim() === c[1], '낭독 ' + c[0] + ' → ' + MATH.read(c[0]).trim()));
  /* 화면에 보이는 모든 글에서 분수로 잘못 잡힌 것(분자·분모에 한글)이 없는지 */
  L.forEach(d => { [d.concept, d.situation, d.predict.q, d.apply.q, ...d.terms.flat(), ...d.predict.options.flatMap(o => [o.t, o.why]), ...d.apply.options.flatMap(o => [o.t, o.why])].forEach(s => MATH.segments(s).forEach(g => { if (g.t === 'f') ok(!/[가-힣\s]/.test(g.n + g.d), d.id + ' 분수 조각 이상: ' + g.n + '/' + g.d); })); }); }

// 9차: 개념 연결 지도 (graph.js) — 모든 점이 실제 레슨·개념이고, 지도가 한 덩어리로 이어지는지
{ vm.runInContext(fs.readFileSync(path.join(__dirname, 'src', 'graph.js'), 'utf8'), ctx, { filename: 'graph.js' });
  const GR = vm.runInContext('GRAPH', ctx), ids = new Set(L.map(d => d.id).concat(GR.CONCEPTS.map(c => c[0])));
  GR.EDGES.forEach(e => ok(ids.has(e[0]) && ids.has(e[1]) && e[0] !== e[1] && e[2], '연결 ' + e[0] + '–' + e[1] + ' 이름·설명'));
  const keys = GR.EDGES.map(e => [e[0], e[1]].sort().join('|')); ok(new Set(keys).size === keys.length, '연결 중복 없음');
  const G = GR.data(L); ok(G.edges.length === GR.EDGES.length, '연결 수 ' + G.edges.length);
  G.nodes.forEach(n => ok(n.nb.length >= (n.kind === 'lesson' ? 1 : 2), n.id + ' 이웃 ' + n.nb.length + '개'));
  G.nodes.filter(n => n.kind === 'concept').forEach(n => ok(n.nb.some(m => m.n.kind === 'lesson'), n.id + ' 레슨과 이어짐'));
  const seen = new Set([G.nodes[0]]), q = [G.nodes[0]]; while (q.length) q.shift().nb.forEach(m => { if (!seen.has(m.n)) { seen.add(m.n); q.push(m.n); } });
  ok(seen.size === G.nodes.length, '지도가 한 덩어리 (' + seen.size + '/' + G.nodes.length + ')'); }

console.log(fail ? '\n실패 ' + fail + '건 / 통과 ' + pass + '건' : '\n모든 검사 통과 (' + pass + '건)');
process.exit(fail ? 1 : 0);
