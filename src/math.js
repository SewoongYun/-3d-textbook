/* math.js — 수식 표시 공통 도우미 (8차)
   · 분수: 글 속의 a/b(공백 없이 붙은 것)를 찾아 세로 분수(분자 위·분모 아래)로 그림
           예) 1/6, (r−1)/(r+4) → 분자 r−1·분모 r+4 (묶음 괄호는 뺌), P(A∩B)/P(A), σ/√n, n!/(p!q!⋯r!)
           띄어 쓴 “3.5 / 1.708”처럼 앞뒤에 공백이 있는 / 는 분수가 아님
   · 화면 낭독: 위첨자·아래첨자·분수·조합 기호를 “3의 세제곱”, “6분의 1”, “5개 중 2개를 택하는 조합의 수”처럼 읽히게
   책장(캔버스)은 pages.js, 패널(HTML)은 html(), 2D 그림(SVG)은 svgText()를 씀 */
var MATH = (function () {
  var SUBC = '₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎ₐₑₒₓₕₖₗₘₙₚₛₜᵢⱼᵣᵤᵥ', SUBN = '0123456789+−=()aeoxhklmnpstijruv';
  var SUPC = '⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿⁱʳᶜˣᵏᵃᵇ', SUPN = '0123456789+−=()nircxkab';
  var HAT = '̂', BAR = '̄';

  /* 분수의 분자·분모가 될 수 있는 글자: 영문·숫자·소수점·!·그리스 문자·첨자·⋯·모자(̂)·막대(̄) */
  function atomCh(ch) { return !!ch && (/[0-9A-Za-z.!σπμ⋯]/.test(ch) || SUBC.indexOf(ch) >= 0 || SUPC.indexOf(ch) >= 0 || ch === HAT || ch === BAR); }
  function matchBack(s, i) { var dep = 0; for (var j = i; j >= 0; j--) { if (s[j] === ')') dep++; else if (s[j] === '(') { dep--; if (dep === 0) return j; } } return -1; }
  function matchFwd(s, i) { var dep = 0; for (var j = i; j < s.length; j++) { if (s[j] === '(') dep++; else if (s[j] === ')') { dep--; if (dep === 0) return j; } } return -1; }

  /* 분자: / 바로 앞 덩어리 → {start, text} */
  function numerator(s, i) {
    var j = i - 1, start, txt;
    if (s[j] === ')') {
      var o = matchBack(s, j); if (o < 0) return null;
      var k = o; while (k > 0 && /[A-Za-zσ]/.test(s[k - 1])) k--;      /* P(A∩B), n(A)처럼 이름이 붙은 괄호는 그대로 */
      if (k < o) { start = k; txt = s.slice(k, j + 1); } else { start = o; txt = s.slice(o + 1, j); }   /* 묶음 괄호는 뺌 */
    } else {
      var k2 = i; while (k2 > 0 && atomCh(s[k2 - 1])) k2--;
      if (k2 === i) return null;
      if (k2 > 0 && s[k2 - 1] === '√') k2--;
      start = k2; txt = s.slice(k2, i);
    }
    return txt ? { start: start, text: txt } : null;
  }
  /* 분모: / 바로 뒤 덩어리 → {end(다음 글자 위치), text} */
  function denominator(s, i) {
    var j = i + 1, end, txt, root = '';
    if (s[j] === '√') { root = '√'; j++; }
    if (s[j] === '(') {
      var c = matchFwd(s, j); if (c < 0) return null;
      txt = root ? '√' + s.slice(j, c + 1) : s.slice(j + 1, c); end = c + 1;     /* √(…)는 괄호를 남기고, 묶음 괄호는 뺌 */
    } else {
      var k = j; while (k < s.length && atomCh(s[k])) k++;
      if (k === j) return null;
      if (s[k] === '(' && /[A-Za-z]$/.test(s.slice(j, k))) { var c2 = matchFwd(s, k); if (c2 > 0) k = c2 + 1; }   /* n(S), P(A) */
      txt = root + s.slice(j, k); end = k;
    }
    return txt ? { end: end, text: txt } : null;
  }
  /* 글 → [{t:'s', s:글}, {t:'f', n:분자, d:분모}, …] */
  function segments(s) {
    s = String(s); var out = [], last = 0;
    for (var i = 1; i < s.length - 1; i++) {
      if (s[i] !== '/' || /\s/.test(s[i - 1]) || /\s/.test(s[i + 1]) || s[i - 1] === '<' || s[i + 1] === '>') continue;
      var n = numerator(s, i), d = n && denominator(s, i);
      if (!n || !d || n.start < last) continue;
      if (n.start > last) out.push({ t: 's', s: s.slice(last, n.start) });
      out.push({ t: 'f', n: n.text, d: d.text });
      last = d.end; i = d.end - 1;
    }
    if (last < s.length) out.push({ t: 's', s: s.slice(last) });
    return out;
  }
  function hasFrac(s) { return segments(s).some(function (g) { return g.t === 'f'; }); }

  /* ── 화면 낭독용 문장 ── */
  var mapCh = function (str, from, to) { return str.split('').map(function (ch) { return to[from.indexOf(ch)]; }).join(''); };
  var reSub = new RegExp('[' + SUBC + ']+', 'g'), reSup = new RegExp('[' + SUPC + ']+', 'g');
  var reComb = new RegExp('([' + SUBC + ']+)([CPΠH])([' + SUBC + ']+)', 'g');
  var COMB = { C: '조합', P: '순열', 'Π': '중복순열', H: '중복조합' };
  function power(m) { return m === 'c' ? '의 여사건' : m === '2' ? '의 제곱' : m === '3' ? '의 세제곱' : m === '4' ? '의 네제곱' : '의 ' + m + '제곱'; }
  function combRead(a, k, b) { return mapCh(a, SUBC, SUBN) + '개 중 ' + mapCh(b, SUBC, SUBN) + '개를 택하는 ' + COMB[k] + '의 수'; }
  function readPart(s) {
    return String(s).replace(reComb, function (m, a, k, b) { return ' ' + combRead(a, k, b) + ' '; })
      .replace(/([A-Za-z])̂/g, '$1 햇').replace(/([A-Za-z])̄/g, '$1 바')
      .replace(reSup, function (m) { return power(mapCh(m, SUPC, SUPN)); })
      .replace(reSub, function (m) { return ' ' + mapCh(m, SUBC, SUBN); })
      .replace(/√/g, '루트 ');
  }
  /* 분수까지 포함한 전체 읽기 */
  function read(s) {
    return segments(s).map(function (g) { return g.t === 's' ? readPart(g.s) : ' ' + readPart(g.d) + '분의 ' + readPart(g.n) + ' '; }).join('').replace(/\s+/g, ' ');
  }

  /* ── HTML: 보이는 수식은 aria-hidden, 낭독용 글은 .sr (화면에는 안 보임) ── */
  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  /* “기호 ₙΠᵣ로 나타내며”처럼 기호 이름을 말할 때는 뜻풀이 대신 “n 파이 r”로 읽음 */
  var SYM = { C: '씨', P: '피', 'Π': '파이', H: '에이치' };
  var reSym = new RegExp('기호 ([' + SUBC + ']+)([CPΠH])([' + SUBC + ']+)', 'g');
  function subsup(s) {
    return String(s)
      .replace(reSym, function (m, a, k, b) { return '기호 <span aria-hidden="true"><sub>' + mapCh(a, SUBC, SUBN) + '</sub>' + k + '<sub>' + mapCh(b, SUBC, SUBN) + '</sub></span><span class="sr">' + mapCh(a, SUBC, SUBN) + ' ' + SYM[k] + ' ' + mapCh(b, SUBC, SUBN) + '</span>'; })
      .replace(reComb, function (m, a, k, b) { return '<span aria-hidden="true"><sub>' + mapCh(a, SUBC, SUBN) + '</sub>' + k + '<sub>' + mapCh(b, SUBC, SUBN) + '</sub></span><span class="sr">' + combRead(a, k, b) + '</span>'; })
      .replace(/([A-Za-z])([̂̄])/g, function (m, a, k) { return '<span aria-hidden="true">' + m + '</span><span class="sr">' + a + (k === HAT ? ' 햇' : ' 바') + '</span>'; })
      .replace(reSup, function (m) { var t = mapCh(m, SUPC, SUPN); return '<sup aria-hidden="true">' + t + '</sup><span class="sr">' + power(t) + '</span>'; })
      .replace(reSub, function (m) { var t = mapCh(m, SUBC, SUBN); return '<sub aria-hidden="true">' + t + '</sub><span class="sr"> ' + t + '</span>'; });
  }
  function fracHtml(n, d) {
    var vis = function (t) { return subsup(t).replace(/<span class="sr">[^<]*<\/span>/g, ''); };
    return '<span class="frac" aria-hidden="true"><span class="fn">' + vis(n) + '</span><span class="fd">' + vis(d) + '</span></span><span class="sr">' + esc(read(n + '/' + d)).trim() + '</span>';
  }
  /* 태그는 그대로 두고 글 부분만 바꿈 */
  function html(s) {
    return String(s).split(/(<[^>]+>)/).map(function (p) {
      if (!p || p[0] === '<') return p;
      return segments(p).map(function (g) { return g.t === 's' ? subsup(g.s) : fracHtml(g.n, g.d); }).join('');
    }).join('');
  }

  /* ── SVG: 분수가 있는 글은 조각마다 위치를 계산해 그림 (글자 폭은 어림값) ── */
  function chW(ch) {
    if (/[ㄱ-힝]/.test(ch)) return 1.0;
    if (SUBC.indexOf(ch) >= 0 || SUPC.indexOf(ch) >= 0) return 0.42;
    if (ch === ' ') return 0.3;
    if (/[0-9]/.test(ch)) return 0.56;
    if (/[.,!·:]/.test(ch)) return 0.3;
    if (/[A-Z]/.test(ch)) return 0.66;
    return 0.58;
  }
  function textW(t, size) { return String(t).split('').reduce(function (a, ch) { return a + chW(ch); }, 0) * size; }
  var r2 = function (x) { return Math.round(x * 100) / 100; };
  function svgText(x, y, s, o) {
    o = o || {}; var size = o.size || 12, fs = size * 0.78, segs = segments(s), parts = [], W = 0;
    segs.forEach(function (g) {
      if (g.t === 's') { var w = textW(g.s, size); parts.push({ g: g, w: w }); W += w; }
      else { var wf = Math.max(textW(g.n, fs), textW(g.d, fs)) + size * 0.3; parts.push({ g: g, w: wf }); W += wf; }
    });
    var x0 = o.anchor === 'start' ? x : o.anchor === 'end' ? x - W : x - W / 2, out = '', fill = o.fill || 'currentColor', wt = o.weight ? ' font-weight="' + o.weight + '"' : '';
    parts.forEach(function (p) {
      if (p.g.t === 's') { out += '<text x="' + r2(x0) + '" y="' + r2(y) + '" font-size="' + size + '" text-anchor="start" fill="' + fill + '"' + wt + ' xml:space="preserve">' + p.g.s + '</text>'; }
      else {
        var cx = x0 + p.w / 2;
        out += '<text x="' + r2(cx) + '" y="' + r2(y - size * 0.5) + '" font-size="' + r2(fs) + '" text-anchor="middle" fill="' + fill + '"' + wt + '>' + p.g.n + '</text>';
        out += '<line x1="' + r2(x0 + size * 0.1) + '" y1="' + r2(y - size * 0.36) + '" x2="' + r2(x0 + p.w - size * 0.1) + '" y2="' + r2(y - size * 0.36) + '" stroke="' + fill + '" stroke-width="' + r2(Math.max(0.8, size * 0.07)) + '"/>';
        out += '<text x="' + r2(cx) + '" y="' + r2(y + size * 0.36) + '" font-size="' + r2(fs) + '" text-anchor="middle" fill="' + fill + '"' + wt + '>' + p.g.d + '</text>';
      }
      x0 += p.w;
    });
    return out;
  }

  return { segments: segments, hasFrac: hasFrac, read: read, html: html, svgText: svgText, SUBC: SUBC, SUBN: SUBN, SUPC: SUPC, SUPN: SUPN };
})();
if (typeof module !== 'undefined') module.exports = { MATH: MATH };
