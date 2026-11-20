/* keys.js — 레슨별 "핵심 식"
   f  : n, r 같은 미지수로 쓴 일반식 (교과서 기호)
   ex : 지금 슬라이더 값을 대입한 예시 (책장·패널에서 파란색으로 표시)
   첨자는 유니코드 아래·위 첨자 글자로 적고, 화면에서는 작게 내려·올려 그림 */
var KEYS = (function () {
  var SUB = '₀₁₂₃₄₅₆₇₈₉', SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  var sub = function (n) { return String(n).split('').map(function (d) { return SUB[+d]; }).join(''); };
  var sup = function (n) { return String(n).split('').map(function (d) { return SUP[+d]; }).join(''); };
  var nCr = MX.nCr, fact = MX.fact;
  var val = function (d, v, env, k) { return String(d.calc(v, env)[k][1]); };
  var num = function (s) { var m = String(s).match(/-?\d+(\.\d+)?/); return m ? m[0] : s; };
  return {
    rep: { f: 'ₙΠᵣ = nʳ', ex: function (d, r) { return '₃Π' + sub(r) + ' = 3' + sup(r) + ' = ' + Math.pow(3, r); } },
    dup: { f: 'n!/(p!q!⋯r!)  (단, p+q+⋯+r = n)', ex: function (d, k) { return '5!/' + k + '! = ' + fact(5) / fact(k); } },
    comb: { f: 'ₙHᵣ = ₙ₊ᵣ₋₁Cᵣ', ex: function (d, r) { return '₃H' + sub(r) + ' = ' + sub(r + 2) + 'C' + sub(r) + ' = ' + nCr(r + 2, r); } },
    binom: { f: 'ₙC₀ + ₙC₁ + ⋯ + ₙCₙ = 2ⁿ', ex: function (d, n) { return sub(n) + 'C₀ + ' + sub(n) + 'C₁ + ⋯ + ' + sub(n) + 'C' + sub(n) + ' = ' + Math.pow(2, n) + ' = 2' + sup(n); } },
    stat: { f: '상대도수 rₙ/n → 통계적 확률 (n이 충분히 클 때)', ex: function (d, v, env) { return num(val(d, v, env, 1)) + '/' + num(val(d, v, env, 0)) + ' = ' + val(d, v, env, 2); } },
    add: { f: 'P(A∪B) = P(A) + P(B) − P(A∩B)', ex: function (d, v) { return '65/100 + 50/100 − ' + v + '/100 = ' + (115 - v) + '/100'; } },
    comp: { f: 'P(A) = 1 − P(Aᶜ)', ex: function (d, v, env) { return '1 − ' + val(d, v, env, 1) + ' = ' + val(d, v, env, 2); } },
    cond: { f: 'P(B|A) = P(A∩B)/P(A)  (단, P(A)>0)', ex: function (d, v, env) { return '(' + val(d, v, env, 2) + ') ÷ (' + val(d, v, env, 1) + ') = ' + val(d, v, env, 3); } },
    indep: { f: 'P(X=r) = ₙCᵣ pʳ qⁿ⁻ʳ  (q = 1−p)', ex: function (d, r, env) { return '₆C' + sub(r) + '(1/4)' + sup(r) + '(3/4)' + sup(6 - r) + ' = ' + val(d, r, env, 2).replace(/ ≈.*/, ''); } },
    expect: { f: 'E(X) = x₁p₁ + x₂p₂ + ⋯ + xₙpₙ', ex: function (d, a, env) { return '1×1/2 + 2×1/3 + ' + a + '×1/6 = ' + val(d, a, env, 0); } },
    bin: { f: 'E(X) = np,  V(X) = npq', ex: function (d, v, env) {
      var m = val(d, v, env, 0).match(/B\((\d+), ([\d.]+)\)/); if (!m) return val(d, v, env, 1);
      var n = +m[1], p = +m[2], q = Math.round((1 - p) * 100) / 100;
      return 'E(X) = ' + n + '×' + p + ' = ' + MX.fx(n * p, 2) + ',  V(X) = ' + n + '×' + p + '×' + q + ' = ' + MX.fx(n * p * q, 2);
    } },
    norm: { f: 'Z = (X − m)/σ', ex: function (d, s) { return 'Z = (70 − 60)/' + s + ' = ' + MX.fx(10 / s, 2); } },
    xbar: { f: 'E(X̄) = m,  σ(X̄) = σ/√n', ex: function (d, n, env) { return 'σ(X̄) = 1.708/√' + n + ' = ' + val(d, n, env, 2); } },
    ci: { f: 'x̄ − 1.96·σ/√n ≤ m ≤ x̄ + 1.96·σ/√n', ex: function (d, n, env) { return '구간의 길이 2×1.96×10/√' + n + ' = ' + val(d, n, env, 1); } },
    prop: { f: 'p̂ − 1.96√(p̂q̂/n) ≤ p ≤ p̂ + 1.96√(p̂q̂/n)', ex: function (d, n, env) { return 'p=0.4이면 구간의 길이 ≈ 2×1.96×√((0.4×0.6)/' + n + ') = ' + MX.fx(2 * 1.96 * Math.sqrt(0.24 / n), 4); } }
  };
})();
if (typeof module !== 'undefined') module.exports = { KEYS: KEYS };
