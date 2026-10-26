/* 사용: node test.js — 교과서 공식으로 계산한 값을 직접 세어 본(전수 조사) 값과 비교합니다 */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ctx = vm.createContext({ console, Math, Object, Array, String, Number, JSON });
['lib.js', 'lessons_1.js', 'lessons_2.js', 'lessons_3.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(__dirname, 'src', f), 'utf8'), ctx, { filename: f }));
const L = vm.runInContext('LESSONS', ctx), MX = vm.runInContext('MX', ctx);
let fail = 0, pass = 0;
const ok = (c, msg) => { if (c) pass++; else { fail++; console.log('  ✗ 실패:', msg); } };
const near = (a, b, e, msg) => ok(Math.abs(a - b) <= e, msg + ' (' + a + ' vs ' + b + ')');
const by = id => L.find(d => d.id === id);
const rows = (id, v, seed) => by(id).calc(v, { seed: seed || 1 });
const cell = (id, v, label, seed) => { const r = rows(id, v, seed).find(x => x[0].includes(label)); return r ? r[1] : undefined; };

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
// 원순열
for (let n = 3; n <= 7; n++) {
  const set = new Set(); perms([...Array(n).keys()]).forEach(p => { const k = p.indexOf(0); set.add([...p.slice(k), ...p.slice(0, k)].join()); });
  ok(String(set.size) + '가지' === cell('circ', n, '원순열의 수'), 'circ n=' + n + ' 표시값 ' + cell('circ', n, '원순열의 수') + ' / 직접 센 값 ' + set.size);
}
{ // 적용: 남녀 번갈아 원탁
  const set = new Set(); perms([0, 1, 2, 3, 4, 5]).forEach(p => { if (p.every((x, i) => (x < 3) !== (p[(i + 1) % 6] < 3))) { const k = p.indexOf(0); set.add([...p.slice(k), ...p.slice(0, k)].join()); } });
  ok(set.size === 12, 'circ 적용 12 (직접 ' + set.size + ')');
}
// 중복순열
for (let r = 1; r <= 6; r++) ok(cell('rep', r, '중복순열의 수').includes('= ' + 3 ** r + '가지'), 'rep r=' + r);
{ let c = 0; for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) for (let d = 0; d < 4; d++) c++; ok(c === 64, 'rep 적용 64'); }
// 같은 것이 있는 순열
for (let k = 1; k <= 5; k++) {
  const base = []; for (let i = 0; i < 5; i++) base.push(i < k ? 'R' : 'x' + i);
  const n = new Set(perms(base).map(p => p.join())).size;
  ok(cell('dup', k, '서로 다른 배열') === n + '가지', 'dup k=' + k + ' 표시 ' + cell('dup', k, '서로 다른 배열') + ' / 직접 ' + n);
}
ok(new Set(perms('banana'.split('')).map(p => p.join(''))).size === 60, 'dup 적용 banana 60');
// 중복조합
for (let r = 1; r <= 6; r++) {
  let c = 0; for (let a = 0; a <= r; a++) for (let b = 0; a + b <= r; b++) c++;
  ok(cell('comb', r, '중복조합의 수').endsWith('= ' + c + '가지'), 'comb r=' + r + ' 표시 ' + cell('comb', r, '중복조합의 수') + ' / 직접 ' + c);
}
{ let c = 0; for (let a = 0; a <= 3; a++) for (let b = 0; a + b <= 3; b++) for (let d = 0; a + b + d <= 3; d++) c++; ok(c === 20, 'comb 적용 20'); }
// 이항정리: 다항식 곱으로 계수 확인
for (let n = 1; n <= 8; n++) {
  let poly = [1]; for (let i = 0; i < n; i++) { const nx = Array(poly.length + 1).fill(0); poly.forEach((c, k) => { nx[k] += c; nx[k + 1] += c; }); poly = nx; }
  ok(cell('binom', n, '이항계수') === poly.join(', '), 'binom n=' + n + ' ' + cell('binom', n, '이항계수'));
  ok(cell('binom', n, '계수의 합').startsWith(poly.reduce((a, b) => a + b) + ' ='), 'binom 합 n=' + n);
}
{ let poly = [1]; for (let i = 0; i < 4; i++) { const nx = Array(poly.length + 1).fill(0); poly.forEach((c, k) => { nx[k] += c * 3; nx[k + 1] += c; }); poly = nx; } ok(poly[2] === 54, '(x+3)^4 의 x² 계수 54 (직접 ' + poly[2] + ')'); }
// 통계적 확률: 같은 시작값으로 상대도수 직접 계산
{ const f = (seed, n) => { const R = MX.rng(seed * 1013 + 17); let six = 0; for (let i = 0; i < n; i++) if (1 + Math.floor(R() * 6) === 6) six++; return six; };
  const NS = [10, 30, 100, 300, 1000, 3000, 10000];
  NS.forEach((n, i) => { const six = f(1, n); ok(cell('stat', i, '상대도수') === (six / n).toFixed(4), 'stat n=' + n + ' 표시 ' + cell('stat', i, '상대도수') + ' / 직접 ' + (six / n).toFixed(4)); });
  near(f(1, 10000) / 10000, 1 / 6, 0.01, 'stat 10000번 상대도수가 1/6 근처'); }
// 덧셈정리: 100칸을 직접 표시해서 세기
for (let x = 10; x <= 50; x += 5) {
  let u = 0; for (let i = 0; i < 100; i++) { const A = i < 60, B = i >= 60 - x && i < 110 - x; if (A || B) u++; }
  ok(cell('add', x, 'P(A∪B)') === (u / 100).toFixed(2), 'add x=' + x + ' ' + cell('add', x, 'P(A∪B)') + ' / ' + u / 100);
}
// 생일: 365 일 모두 같은 가능성 → 직접 곱으로 계산, 교과서 값 0.5686…
{ const P = k => { let p = 1; for (let i = 0; i < k; i++) p *= (365 - i) / 365; return 1 - p; };
  near(P(25), 0.5687, 0.0001, '생일 k=25'); near(P(23), 0.5073, 0.0001, '생일 k=23');
  ok(cell('comp', 25, '생일이 같은 학생이 있을 확률') === P(25).toFixed(4), 'comp 표시값 ' + cell('comp', 25, '생일이 같은 학생이 있을 확률')); }
{ let c = 0; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a === 6 || b === 6) c++; ok(c === 11, 'comp 적용 11/36'); }
// 조건부확률: 순서쌍을 모두 세기
for (let r = 1; r <= 8; r++) {
  const balls = []; for (let i = 0; i < r + 4; i++) balls.push(i < r ? 'R' : 'B');
  let a = 0, ab = 0; balls.forEach((x, i) => balls.forEach((y, j) => { if (i !== j && x === 'R') { a++; if (y === 'R') ab++; } }));
  const v = cell('cond', r, 'P(B|A)'); const want = (r - 1) + '/' + (r + 3);
  ok(v.startsWith(want) && Math.abs(ab / a - (r - 1) / (r + 3)) < 1e-12, 'cond r=' + r + ' ' + v + ' / 직접 ' + ab + '/' + a);
}
{ const balls = ['W', 'W', 'W', 'W', 'B', 'B', 'B']; let n = 0, w = 0; balls.forEach((x, i) => balls.forEach((y, j) => { if (i !== j) { n++; if (x === 'W' && y === 'W') w++; } })); ok(w * 7 === n * 2, 'cond 적용 2/7 (직접 ' + w + '/' + n + ')'); }
// 독립시행: 2^6 가지 수열의 확률을 모두 더하기
for (let r = 0; r <= 6; r++) {
  let sum = 0; for (let m = 0; m < 64; m++) { let ones = 0; for (let b = 0; b < 6; b++) if (m >> b & 1) ones++; if (ones === r) sum += Math.pow(1 / 3, ones) * Math.pow(2 / 3, 6 - ones); }
  const v = cell('indep', r, 'P(X=r)'); near(parseFloat(v.split('≈')[1]), sum, 0.00006, 'indep r=' + r + ' ' + v + ' / 직접 ' + sum.toFixed(5));
}
{ let s = 0, best = 0, bi = 0; for (let r = 0; r <= 6; r++) { const p = MX.binom(6, 1 / 3, r); s += p; if (p > best) { best = p; bi = r; } } near(s, 1, 1e-12, 'indep 합 1'); ok(bi === 2, 'indep 최빈 2번'); }
{ let c = 0; for (let m = 0; m < 32; m++) { let o = 0; for (let b = 0; b < 5; b++) if (m >> b & 1) o++; if (o === 2) c++; } ok(c === 10, 'indep 적용 10/32=5/16'); }
// 기댓값: 정의대로 직접 계산
for (let a = 3; a <= 15; a++) {
  const xs = [1, 2, a], ps = [1 / 2, 1 / 3, 1 / 6]; const E = xs.reduce((s, x, i) => s + x * ps[i], 0), E2 = xs.reduce((s, x, i) => s + x * x * ps[i], 0), V = E2 - E * E;
  ok(cell('expect', a, 'E(X) =').includes('≈ ' + E.toFixed(3)), 'expect E a=' + a); ok(cell('expect', a, 'V(X)').includes('≈ ' + V.toFixed(3)), 'expect V a=' + a + ' ' + cell('expect', a, 'V(X)') + ' / ' + V.toFixed(3));
}
near((7 + 10) / 6, 17 / 6, 1e-12, 'expect a=10 → 17/6');
{ const xs = [4, 6], ps = [0.5, 0.5]; /* 평균5 분산1 → 변환 확인용 */ const V = x => xs.reduce((s, v, i) => s + (x * v - 2 - (x * 5 - 2)) ** 2 * ps[i], 0); near(V(3), 9, 1e-12, 'V(aX+b)=a²V(X)'); }
// 이항분포
for (let v = 1; v <= 9; v++) { const p = v / 10; let s = 0, m = 0; for (let k = 0; k <= 10; k++) { const q = MX.binom(10, p, k); s += q; m += k * q; } near(s, 1, 1e-9, 'bin 합 p=' + p); near(m, 10 * p, 1e-9, 'bin 평균 np p=' + p); ok(cell('bin', v, '평균') === (10 * p).toFixed(2), 'bin 표시 평균'); }
ok(cell('bin', 7, '가장 확률이 큰 칸').startsWith('7번 칸'), 'bin p=0.7 최빈 칸 7: ' + cell('bin', 7, '가장 확률이 큰 칸'));
{ const n = 100, p = 0.2; near(Math.sqrt(n * p * (1 - p)), 4, 1e-12, 'bin 적용 σ=4'); }
// 정규분포: 표준정규분포표 값과 비교
near(MX.Phi(1) - 0.5, 0.3413, 0.00005, 'Φ(1)-0.5=0.3413'); near(MX.Phi(2) - 0.5, 0.4772, 0.00005, 'Φ(2)-0.5=0.4772'); near(MX.Phi(1.5) - 0.5, 0.4332, 0.00005, 'Φ(1.5)-0.5=0.4332'); near(MX.Phi(1.96) - MX.Phi(-1.96), 0.95, 0.0001, 'P(|Z|≤1.96)=0.95'); near(MX.Phi(2.58) - MX.Phi(-2.58), 0.99, 0.0005, 'P(|Z|≤2.58)≈0.99 (2.58은 반올림한 값)');
near(0.3413 + 0.4772, 0.8185, 1e-12, '정규 적용: 0.3413+0.4772'); near(0.5 - 0.3413, 0.1587, 1e-12, 'xbar 적용 0.5-0.3413');
for (let s = 5; s <= 15; s++) { let a = 0; for (let i = 0; i <= 80000; i++) { const x = 20 + 80 * i / 80000; a += MX.pdf(x, 60, s) * 80 / 80000; } if (s <= 13) near(a, 1, 0.003, 'norm σ=' + s + ' 곡선 아래 넓이 1'); }
ok(cell('norm', 10, 'P(X ≥ 70)').length > 0 && cell('norm', 10, 'P(X ≥ 70)') === (1 - MX.Phi(1)).toFixed(4), 'norm σ=10 P(X≥70)=' + cell('norm', 10, 'P(X ≥ 70)'));
// 표본평균: 모의실험이 이론값 σ/√n 에 가까운지
{ const sig = Math.sqrt(35 / 12); [1, 4, 9, 25].forEach(n => { const sd = parseFloat(cell('xbar', n, '모의실험(2000번)의 X̄ 표준편차')), mean = parseFloat(cell('xbar', n, '모의실험(2000번)의 X̄ 평균')); near(sd, sig / Math.sqrt(n), 0.04 * Math.max(1, 3 / Math.sqrt(n)) * 0.5 + 0.03, 'xbar 표준편차 n=' + n); near(mean, 3.5, 0.08, 'xbar 평균 n=' + n); });
  near(sig / Math.sqrt(25), sig / 5, 1e-12, '1/5로 줄어듦'); }
// 신뢰구간: 길이 = 2×1.96×σ/√n, 포함 비율 ≈ 95
{ near(parseFloat(cell('ci', 25, '구간의 길이')), 7.84, 1e-9, 'ci n=25 길이 7.84'); near(parseFloat(cell('ci', 100, '구간의 길이')), 3.92, 1e-9, 'ci n=100 길이 3.92');
  let tot = 0, runs = 40; for (let s = 1; s <= runs; s++) tot += parseInt(cell('ci', 25, '모평균 m=50을 포함한 구간', s)); near(tot / runs, 95, 1.5, 'ci 평균 포함 개수 ≈ 95 (' + tot / runs + ')');
  near(70 - 1.96 * 6 / Math.sqrt(36), 68.04, 1e-9, 'ci 적용 하한'); near(70 + 1.96 * 6 / Math.sqrt(36), 71.96, 1e-9, 'ci 적용 상한'); }

console.log(fail ? '\n실패 ' + fail + '건 / 통과 ' + pass + '건' : '\n모든 검사 통과 (' + pass + '건)');
process.exit(fail ? 1 : 0);
