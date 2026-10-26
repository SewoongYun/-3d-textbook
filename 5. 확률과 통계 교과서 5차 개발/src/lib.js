/* lib.js — 수학 계산, 난수, SVG 도우미 (화면과 무관한 순수 함수) */
var MX = (function () {
  var fact = function (n) { var r = 1; for (var i = 2; i <= n; i++) r *= i; return r; };
  var nPr = function (n, r) { var x = 1; for (var i = 0; i < r; i++) x *= (n - i); return x; };
  var nCr = function (n, r) {
    if (r < 0 || r > n) return 0;
    r = Math.min(r, n - r);
    var x = 1;
    for (var i = 1; i <= r; i++) x = x * (n - r + i) / i;
    return Math.round(x);
  };
  var nHr = function (n, r) { return nCr(n + r - 1, r); };
  var gcd = function (a, b) { return b ? gcd(b, a % b) : Math.abs(a); };
  /* 기약분수 문자열 */
  var frac = function (n, d) {
    var g = gcd(n, d) || 1; n /= g; d /= g;
    return d === 1 ? String(n) : n + '/' + d;
  };
  /* 오차함수 (Abramowitz–Stegun 7.1.26, 오차 1.5e-7) */
  var erf = function (x) {
    var s = x < 0 ? -1 : 1; x = Math.abs(x);
    var t = 1 / (1 + 0.3275911 * x);
    var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return s * y;
  };
  var Phi = function (z) { return 0.5 * (1 + erf(z / Math.SQRT2)); };      /* 표준정규분포의 누적확률 */
  var pdf = function (x, m, s) { return Math.exp(-0.5 * Math.pow((x - m) / s, 2)) / (s * Math.sqrt(2 * Math.PI)); };
  var binom = function (n, p, r) { return nCr(n, r) * Math.pow(p, r) * Math.pow(1 - p, n - r); };
  /* 시작값이 같으면 항상 같은 결과를 내는 난수 (mulberry32) */
  var rng = function (seed) {
    var a = (seed >>> 0) || 1;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  var normal = function (rand) {
    var u = 0, v = 0;
    while (u === 0) u = rand();
    v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  /* 0..n-1 중 r개를 고르는 조합을 모두 (사전식) */
  var combos = function (n, r) {
    var out = [], cur = [];
    (function rec(s) {
      if (cur.length === r) { out.push(cur.slice()); return; }
      for (var i = s; i < n; i++) { cur.push(i); rec(i + 1); cur.pop(); }
    })(0);
    return out;
  };
  var fx = function (x, d) { return Number(x).toFixed(d === undefined ? 4 : d); };
  var clamp = function (x, a, b) { return Math.max(a, Math.min(b, x)); };
  return { fact: fact, nPr: nPr, nCr: nCr, nHr: nHr, gcd: gcd, frac: frac, erf: erf, Phi: Phi, pdf: pdf, binom: binom, rng: rng, normal: normal, combos: combos, fx: fx, clamp: clamp };
})();

/* 색 팔레트 (3D와 2D에서 함께 사용) */
var COL = { red: '#e4572e', blue: '#2e86de', green: '#2bb673', amber: '#f2a516', purple: '#8e5bd9', gray: '#8a8f98', teal: '#17a2b8', pink: '#e0529c', ink: '#2b2a33' };
var PAL = [COL.blue, COL.green, COL.amber, COL.purple, COL.pink, COL.teal, COL.red, COL.gray];

/* SVG 조각 만들기 */
var SV = (function () {
  var f = function (x) { return Math.round(x * 100) / 100; };
  var t = function (x, y, s, o) {
    o = o || {};
    return '<text x="' + f(x) + '" y="' + f(y) + '" font-size="' + (o.size || 12) + '" text-anchor="' + (o.anchor || 'middle') + '" fill="' + (o.fill || 'currentColor') + '"' + (o.weight ? ' font-weight="' + o.weight + '"' : '') + '>' + s + '</text>';
  };
  var c = function (x, y, r, fill, o) {
    o = o || {};
    return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + (fill || 'none') + '" stroke="' + (o.stroke || 'none') + '" stroke-width="' + (o.w || 1) + '"' + (o.op ? ' opacity="' + o.op + '"' : '') + '/>';
  };
  var r = function (x, y, w, h, fill, o) {
    o = o || {};
    return '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(Math.max(h, 0)) + '" rx="' + (o.rx || 0) + '" fill="' + (fill || 'none') + '" stroke="' + (o.stroke || 'none') + '" stroke-width="' + (o.w || 1) + '"' + (o.op ? ' opacity="' + o.op + '"' : '') + '/>';
  };
  var l = function (x1, y1, x2, y2, stroke, w, dash) {
    return '<line x1="' + f(x1) + '" y1="' + f(y1) + '" x2="' + f(x2) + '" y2="' + f(y2) + '" stroke="' + (stroke || 'currentColor') + '" stroke-width="' + (w || 1) + '"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') + '/>';
  };
  var p = function (d, fill, stroke, w, op) {
    return '<path d="' + d + '" fill="' + (fill || 'none') + '" stroke="' + (stroke || 'none') + '" stroke-width="' + (w || 1) + '"' + (op ? ' opacity="' + op + '"' : '') + '/>';
  };
  return { f: f, t: t, c: c, r: r, l: l, p: p };
})();

if (typeof module !== 'undefined') module.exports = { MX: MX, COL: COL, PAL: PAL, SV: SV };
