/* pages.js — 책장에 인쇄된 그림(캔버스): 왼쪽 쪽(글·예측·덮개 자리), 오른쪽 쪽(도면), 표지 */
var PAGES = (function () {
  var PW = 1050, PH = 1440;                       /* 한 쪽의 픽셀 크기 (책장 7 × 9.6 비율) */
  var SERIF = '"Noto Serif KR","Nanum Myeongjo","Batang","AppleMyungjo",serif';
  var SANS = '"Noto Sans KR","Malgun Gothic","Apple SD Gothic Neo",sans-serif';
  var HAND = '"Nanum Pen Script","Segoe Print","Comic Sans MS",cursive';
  var INKC = '#2a2833', RED = '#b8432f', BLUE = '#2d5fa8', GRAY = '#6f6a62';
  var MARK = ['①', '②', '③', '④'];
  /* 덮개와 도장 자리 (왼쪽 쪽 캔버스 좌표) */
  var FLAP = { x: 96, y: 1150, w: 860, h: 190 };
  var STAMP = { x: 820, y: 1110 };

  var noiseCv = null;
  function noise() {
    if (noiseCv) return noiseCv;
    noiseCv = document.createElement('canvas'); noiseCv.width = noiseCv.height = 256;
    var c = noiseCv.getContext('2d'), im = c.createImageData(256, 256), R = MX.rng(42);
    for (var i = 0; i < im.data.length; i += 4) { var v = 235 + R() * 20; im.data[i] = v; im.data[i + 1] = v - 3; im.data[i + 2] = v - 10; im.data[i + 3] = 26; }
    c.putImageData(im, 0, 0); return noiseCv;
  }
  function make() { var cv = document.createElement('canvas'); cv.width = PW; cv.height = PH; return cv; }
  function copy(src) { var cv = make(); cv.getContext('2d').drawImage(src, 0, 0); return cv; }

  function paper(c, side) {
    c.fillStyle = '#fbf8f0'; c.fillRect(0, 0, PW, PH);
    c.fillStyle = c.createPattern(noise(), 'repeat'); c.fillRect(0, 0, PW, PH);
    /* 제본 쪽 그늘 */
    var g = side === 'L' ? c.createLinearGradient(PW, 0, PW - 150, 0) : c.createLinearGradient(0, 0, 150, 0);
    g.addColorStop(0, 'rgba(90,70,40,0.22)'); g.addColorStop(1, 'rgba(90,70,40,0)'); c.fillStyle = g; c.fillRect(0, 0, PW, PH);
  }

  /* ── 글자 배치 (굵게 <b> 지원, 한글은 글자 단위 줄바꿈) ── */
  function decode(s) { return s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"'); }
  function chars(html) {
    var out = [], b = false;
    String(html).replace(/<br\s*\/?>/gi, '\n').split(/(<[^>]+>)/).forEach(function (p) {
      if (/^<b>$/i.test(p) || /^<strong>$/i.test(p)) b = true;
      else if (/^<\/b>$/i.test(p) || /^<\/strong>$/i.test(p)) b = false;
      else if (/^</.test(p)) { /* 다른 태그는 버림 */ }
      else decode(p).split('').forEach(function (ch) { out.push({ ch: ch, b: b }); });
    });
    return out;
  }
  function plain(html) { return chars(html).map(function (x) { return x.ch; }).join(''); }
  /* 쪽 전체 글자 배율: 내용이 넘치면 쪽을 다시 그리며 조금씩 줄임 */
  var K = 1, trunc = [];
  function fz(n) { return Math.round(n * K); }
  /* o: {size, min(줄 수가 넘치면 이 크기까지 줄임), font, color, lh, bold, weight, max(최대 줄 수), tag} → 마지막 y 반환
     3차: 말줄임(…)은 글자를 최소 크기까지 줄여도 안 들어갈 때만 쓰고, 그 경우 trunc 에 기록 */
  function layout(c, cs, w, size, o) {
    var font = o.font || SERIF, fN = (o.weight || 400) + ' ' + size + 'px ' + font, fB = '700 ' + size + 'px ' + font, wcache = {};
    function cw(ch, b) { var k = (b ? 'b' : 'n') + ch; if (wcache[k] === undefined) { c.font = b || o.bold ? fB : fN; wcache[k] = c.measureText(ch).width; } return wcache[k]; }
    var lines = [], line = [], width = 0, lastSpace = -1;
    cs.forEach(function (x) {
      if (x.ch === '\n') { lines.push(line); line = []; width = 0; lastSpace = -1; return; }
      var ww = cw(x.ch, x.b);
      if (width + ww > w && line.length) {
        if (lastSpace > 0 && lastSpace > line.length - 14) { var rest = line.slice(lastSpace + 1); lines.push(line.slice(0, lastSpace)); line = rest; }
        else { lines.push(line); line = []; }
        width = line.reduce(function (s, q) { return s + cw(q.ch, q.b); }, 0); lastSpace = -1;
        if (x.ch === ' ' && !line.length) return;
      }
      if (x.ch === ' ') lastSpace = line.length;
      line.push(x); width += ww;
    });
    if (line.length) lines.push(line);
    return { lines: lines, cw: cw, fN: fN, fB: fB };
  }
  function para(c, html, x, y, w, o) {
    o = o || {}; var base = fz(o.size || 26), min = Math.min(base, fz(o.min || o.size || 26)), size = base, cs = chars(html), L;
    for (; ; size--) { L = layout(c, cs, w, size, o); if (!o.max || L.lines.length <= o.max || size <= min) break; }
    var lines = L.lines, cw = L.cw, lh = Math.round((o.lh ? fz(o.lh) : base * 1.55) * size / base);
    if (o.max && lines.length > o.max) {
      trunc.push((o.tag || '글') + ': ' + plain(html).slice(0, 40));
      lines = lines.slice(0, o.max); var l = lines[o.max - 1]; while (l.length && l.reduce(function (s, q) { return s + cw(q.ch, q.b); }, 0) > w - cw('…')) l.pop(); l.push({ ch: '…', b: false });
    }
    c.fillStyle = o.color || INKC; c.textBaseline = 'alphabetic'; c.textAlign = 'left';
    lines.forEach(function (ln, k) {
      var xx = x, yy = y + k * lh + size;
      ln.forEach(function (q) { c.font = q.b || o.bold ? L.fB : L.fN; c.fillText(q.ch, xx, yy); xx += cw(q.ch, q.b); });
    });
    return y + lines.length * lh;
  }
  function text(c, s, x, y, font, color, align) { c.font = font; c.fillStyle = color || INKC; c.textAlign = align || 'left'; c.textBaseline = 'alphabetic'; c.fillText(s, x, y); }
  /* 한 줄 글: maxW 를 넘으면 글자 크기를 줄여서 맞춤 */
  function fitText(c, s, x, y, maxW, size, pre, font, color, align) {
    size = fz(size); c.font = pre + ' ' + size + 'px ' + font;
    var tw = c.measureText(s).width; if (tw > maxW) { size = Math.max(10, Math.floor(size * maxW / tw)); }
    text(c, s, x, y, pre + ' ' + size + 'px ' + font, color, align); return size;
  }
  function rrect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  /* 손으로 그린 듯 흔들리는 선 */
  function wobble(c, pts, seed) {
    var R = MX.rng(seed || 7); c.beginPath();
    pts.forEach(function (p, i) { var x = p[0] + (R() - 0.5) * 3, y = p[1] + (R() - 0.5) * 3; if (i) c.lineTo(x, y); else c.moveTo(x, y); }); c.stroke();
  }
  function handCircle(c, x, y, rx, ry, color, seed) {
    var pts = [], R = MX.rng(seed || 3); for (var i = 0; i <= 40; i++) { var a = -0.4 + i / 40 * Math.PI * 2.15, k = 1 + (R() - 0.5) * 0.06; pts.push([x + Math.cos(a) * rx * k, y + Math.sin(a) * ry * k]); }
    c.strokeStyle = color; c.lineWidth = 4; c.lineCap = 'round'; wobble(c, pts, seed);
  }
  function seal(c, x, y, r, rot) {          /* 붉은 도장 자국 */
    c.save(); c.translate(x, y); c.rotate(rot || -0.2); c.globalAlpha = 0.86;
    c.strokeStyle = RED; c.fillStyle = RED; c.lineWidth = 7; c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 2.5; c.beginPath(); c.arc(0, 0, r - 12, 0, Math.PI * 2); c.stroke();
    c.textAlign = 'center'; c.font = '900 ' + Math.round(r * 0.5) + 'px ' + SERIF; c.fillText('확통', 0, -r * 0.08);
    c.font = '700 ' + Math.round(r * 0.26) + 'px ' + SANS; c.fillText('참 잘했어요', 0, r * 0.4);
    /* 잉크가 덜 묻은 자리 */
    c.globalCompositeOperation = 'destination-out'; var R = MX.rng(9);
    for (var i = 0; i < 40; i++) { c.globalAlpha = 0.25 + R() * 0.4; c.beginPath(); c.arc((R() - 0.5) * r * 2, (R() - 0.5) * r * 2, 2 + R() * 6, 0, 7); c.fill(); }
    c.restore();
  }

  /* ── 왼쪽 쪽 ── st: {i, n, pick, order, started, revealed, stamped, v, env}
     3차: 내용이 덮개 자리까지 넘치면 글자 배율 K 를 조금씩 줄여 다시 그림 → 빠지거나 잘리는 줄이 없게 */
  function drawLeft(cv, d, st) {
    var k = 1, end;
    for (; ;) { K = k; trunc = []; end = leftPass(cv, d, st); if (end <= FLAP.y - 14 || k <= 0.7) break; k = Math.round((k - 0.05) * 100) / 100; }
    var out = { k: K, trunc: trunc.slice(), overflow: end > FLAP.y - 14 }; K = 1; return out;
  }
  function leftPass(cv, d, st) {
    var c = cv.getContext('2d'), L = 104, R = PW - 96, w = R - L, y;
    paper(c, 'L');
    text(c, d.unit, L, 78, '500 22px ' + SANS, GRAY);
    text(c, '레슨 ' + (st.i + 1) + ' / ' + st.n, R, 78, '500 22px ' + SANS, GRAY, 'right');
    c.strokeStyle = 'rgba(42,40,51,0.25)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(L, 96); c.lineTo(R, 96); c.stroke();
    fitText(c, d.title, L, 96 + fz(78), w, 64, '900', SERIF, INKC);
    y = para(c, d.concept, L, 96 + fz(94), w, { size: 25, min: 19, color: GRAY, max: 2, tag: '개념' });

    /* 핵심 식 상자 (슬라이더와 함께 바뀜): 왼쪽 식, 오른쪽 값 — 서로 겹치지 않게 폭을 나눔 */
    var rows = d.calc(st.v, st.env), em = rows.filter(function (r) { return r[2]; })[0] || rows[rows.length - 1];
    y += fz(16); var bh = fz(116), valW = w * 0.34, labW = w - valW - 50;
    c.fillStyle = 'rgba(242,234,214,0.75)'; rrect(c, L, y, w, bh, 12); c.fill(); c.strokeStyle = 'rgba(42,40,51,0.5)'; c.lineWidth = 2; c.stroke();
    text(c, '핵심 식', L + 22, y + fz(34), '700 ' + fz(20) + 'px ' + SANS, RED);
    para(c, em[0], L + 22, y + fz(40), labW, { size: 26, min: 17, weight: 700, max: 2, lh: 32, tag: '핵심 식' });
    fitText(c, String(em[1]), R - 22, y + bh * 0.66, valW, 34, '700', SERIF, BLUE, 'right');
    y += bh;
    /* 여백의 손글씨 메모: 쪽 안쪽에 오른쪽 맞춤 */
    var memo = d.slider.label.split(' ').pop() + ' = ' + d.slider.fmt(st.v) + '  →  ' + em[1];
    c.save(); c.translate(R - 8, y + fz(40)); c.rotate(-0.035); fitText(c, memo, 0, 0, w * 0.75, 36, '', HAND, BLUE, 'right'); c.restore();
    y += fz(56);

    /* 상황 */
    y = para(c, d.situation, L, y, w, { size: 26, min: 19, max: 6, lh: 40, tag: '상황' }) + fz(12);

    /* 용어 */
    text(c, '용어', L, y + fz(22), '700 ' + fz(20) + 'px ' + SANS, RED); y += fz(30);
    d.terms.slice(0, 3).forEach(function (t) { y = para(c, '<b>' + t[0] + '</b>  ' + t[1], L, y, w, { size: 21, min: 16, font: SANS, max: 2, lh: 30, color: '#3c3a44', tag: '용어' }); });
    y += fz(14);

    /* 예측 */
    text(c, '예측', L, y + fz(22), '700 ' + fz(20) + 'px ' + SANS, RED); y += fz(28);
    y = para(c, d.predict.q, L, y, w, { size: 25, min: 18, weight: 700, max: 3, lh: 35, tag: '예측 질문' }) + fz(6);
    var okIdx = -1; d.predict.options.forEach(function (o, k) { if (o.ok) okIdx = k; });
    st.order.forEach(function (oi, k) {
      var bs = fz(22), bx = L + 4, by = y + fz(8);
      c.strokeStyle = INKC; c.lineWidth = 2; c.strokeRect(bx, by, bs, bs);
      var y2 = para(c, MARK[k] + ' ' + plain(d.predict.options[oi].t), L + 40, y, w - 40 - (st.revealed ? 80 : 0), { size: 23, min: 16, max: 2, lh: 33, tag: '보기' });
      if (st.pick === oi) { c.save(); c.translate(bx + 2, by + bs + 4); text(c, '✓', 0, 0, fz(56) + 'px ' + HAND, BLUE); c.restore(); }
      if (st.revealed && oi === okIdx) { handCircle(c, L + 56, y + fz(20), 26, 22, RED, 11); text(c, '정답!', R - 4, y + fz(28), fz(38) + 'px ' + HAND, RED, 'right'); }
      y = Math.max(y2, y + fz(36)) + fz(3);
    });
    var end = y;

    /* 덮개 자리: 들추기 전에는 비워 둠(덮개가 덮음), 들춘 뒤에 정답 인쇄 */
    var kk = K; K = 1;
    if (st.revealed && okIdx >= 0) {
      c.fillStyle = 'rgba(255,252,243,0.92)'; rrect(c, FLAP.x, FLAP.y, FLAP.w, FLAP.h, 10); c.fill();
      c.setLineDash([8, 7]); c.strokeStyle = 'rgba(42,40,51,0.45)'; c.lineWidth = 2; c.stroke(); c.setLineDash([]);
      text(c, '정답', FLAP.x + 22, FLAP.y + 38, '700 20px ' + SANS, RED);
      para(c, MARK[st.order.indexOf(okIdx)] + ' ' + d.predict.options[okIdx].t, FLAP.x + 80, FLAP.y + 12, FLAP.w - 250, { size: 25, min: 17, weight: 700, max: 1, tag: '정답' });
      para(c, d.predict.options[okIdx].why, FLAP.x + 22, FLAP.y + 54, FLAP.w - 180, { size: 20, min: 15, font: SANS, max: 4, lh: 30, color: '#3c3a44', tag: '정답 이유' });
    } else {
      c.setLineDash([8, 7]); c.strokeStyle = 'rgba(42,40,51,0.25)'; c.lineWidth = 2; rrect(c, FLAP.x, FLAP.y, FLAP.w, FLAP.h, 10); c.stroke(); c.setLineDash([]);
    }
    if (st.stamped) seal(c, STAMP.x, STAMP.y + 40, 70, -0.22);
    text(c, String(st.i * 2 + 2), L, PH - 44, '500 22px ' + SERIF, GRAY);
    K = kk;
    return end;
  }

  /* ── 오른쪽 쪽 ── img: 레슨 2D 그림(SVG를 그린 이미지, img.fit = 실제 그림 범위) */
  function drawRight(cv, d, st, img) {
    var k = 1, end;
    for (; ;) { K = k; trunc = []; end = rightPass(cv, d, st, img); if (end <= PH - 70 || k <= 0.7) break; k = Math.round((k - 0.05) * 100) / 100; }
    var out = { k: K, trunc: trunc.slice(), overflow: end > PH - 70 }; K = 1; return out;
  }
  function rightPass(cv, d, st, img) {
    var c = cv.getContext('2d'), L = 96, R = PW - 104, w = R - L;
    paper(c, 'R');
    text(c, '확률과 통계 3D 교과서', R, 78, '500 22px ' + SANS, GRAY, 'right');
    c.strokeStyle = 'rgba(42,40,51,0.25)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(L, 96); c.lineTo(R, 96); c.stroke();
    /* 모형이 서는 자리: 연필 격자 */
    var cx = (L + R) / 2, cy = 620;
    c.save(); c.strokeStyle = 'rgba(42,40,51,' + (st.started ? 0.12 : 0.08) + ')'; c.lineWidth = 1;
    for (var gx = -360; gx <= 360; gx += 45) { c.beginPath(); c.moveTo(cx + gx, cy - 420); c.lineTo(cx + gx, cy + 400); c.stroke(); }
    for (var gy = -420; gy <= 400; gy += 45) { c.beginPath(); c.moveTo(cx - 360, cy + gy); c.lineTo(cx + 360, cy + gy); c.stroke(); }
    c.restore();
    if (!st.started) {
      if (img && img.complete && img.naturalWidth) {
        /* 그림 전체(글자 포함)가 들어오도록 비율을 지켜 맞춤 */
        var fw = (img.fit && img.fit.w) || 420, fh = (img.fit && img.fit.h) || 220, s = Math.min(w / fw, 560 / fh), iw = fw * s, ih = fh * s;
        c.globalAlpha = 0.75; c.drawImage(img, cx - iw / 2, cy - 70 - ih / 2, iw, ih); c.globalAlpha = 1;
      }
      c.save(); c.translate(cx, cy + 300); c.rotate(-0.03); fitText(c, '예측을 고르면 이 그림이 책장 위로 일어서요 ↑', 0, 0, w, 40, '', HAND, BLUE, 'center'); c.restore();
    }
    /* 그림 설명과 범례 */
    var y = 1080;
    text(c, '그림 ' + (st.i + 1) + '.', L, y + fz(22), '700 ' + fz(22) + 'px ' + SERIF, INKC);
    y = para(c, d.svgAlt, L + fz(82), y - 2, w - fz(82), { size: 22, min: 16, max: 2, lh: 32, color: '#3c3a44', tag: '그림 설명' }) + fz(4);
    var hint = d.actions && d.actions.length ? '모형을 누르면 「' + d.actions[0].label + '」' : '모형을 누르면 ' + d.slider.label + '이(가) 하나씩 바뀌어요';
    y = para(c, hint, L, y, w, { size: 24, min: 17, weight: 700, max: 2, lh: 34, tag: '안내' }) + fz(8);
    /* 범례: 줄이 넘치면 다음 줄로 */
    var lx = L, fs = fz(21), rowH = fz(34); c.font = '500 ' + fs + 'px ' + SANS;
    (d.legend || []).forEach(function (q) {
      var iw2 = 28 + c.measureText(q[1]).width + 20;
      if (lx > L && lx + iw2 > R) { lx = L; y += rowH; }
      c.fillStyle = q[0]; c.beginPath(); c.arc(lx + 10, y + fs * 0.62, fs * 0.45, 0, 7); c.fill();
      text(c, q[1], lx + 28, y + fs, '500 ' + fs + 'px ' + SANS, '#3c3a44'); c.font = '500 ' + fs + 'px ' + SANS; lx += iw2;
    });
    if ((d.legend || []).length) y += rowH + fz(6);
    y = para(c, '생략한 조건: ' + d.omitted, L, y, w, { size: 19, min: 15, font: SANS, max: 5, lh: 28, color: GRAY, tag: '생략한 조건' });
    var kk = K; K = 1; text(c, String(st.i * 2 + 3), R, PH - 44, '500 22px ' + SERIF, GRAY, 'right'); K = kk;
    return y;
  }

  /* SVG 그림의 실제 범위(틀 밖으로 나간 글자 포함)를 재서 viewBox 를 넓힘 → 잘리지 않게 */
  var measSvg = null;
  function fitSvg(inner) {
    var x0 = 0, y0 = 0, x1 = 420, y1 = 220, b = null;
    try {
      if (!measSvg) {
        measSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        measSvg.setAttribute('width', '420'); measSvg.setAttribute('height', '220'); measSvg.setAttribute('aria-hidden', 'true');
        measSvg.style.cssText = 'position:absolute;left:-10000px;top:0;visibility:hidden;font-family:"Malgun Gothic","Noto Sans KR",sans-serif';
        document.body.appendChild(measSvg);
      }
      measSvg.innerHTML = '<g>' + inner + '</g>'; b = measSvg.firstChild.getBBox();
    } catch (e) { b = null; }
    if (b && (b.width || b.height)) { x0 = Math.min(0, b.x - 6); y0 = Math.min(0, b.y - 6); x1 = Math.max(420, b.x + b.width + 6); y1 = Math.max(220, b.y + b.height + 6); }
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0, vb: [x0, y0, x1 - x0, y1 - y0].map(function (n) { return Math.round(n * 10) / 10; }).join(' ') };
  }

  /* ── 표지 바깥면 ── */
  function drawCover(cv) {
    cv.width = 1100; cv.height = 1500; var c = cv.getContext('2d'), W = cv.width, H = cv.height;
    c.fillStyle = '#d9a01d'; c.fillRect(0, 0, W, H);
    var R = MX.rng(5); for (var i = 0; i < 9000; i++) { c.fillStyle = 'rgba(120,70,0,' + (R() * 0.06) + ')'; c.fillRect(R() * W, R() * H, 2, 2); }
    c.strokeStyle = 'rgba(110,62,0,0.65)'; c.lineWidth = 4; c.strokeRect(46, 46, W - 92, H - 92); c.lineWidth = 1.5; c.strokeRect(62, 62, W - 124, H - 124);
    text(c, '확률과 통계', W / 2, 250, '900 120px ' + SERIF, '#5a3500', 'center');
    text(c, '3D 교과서 · 예측하고 실험하고 증명하기', W / 2, 322, '500 40px ' + SERIF, '#6b4300', 'center');
    /* 붙인 그림 종이 */
    var px = 230, py = 430, pw = 640, ph = 700;
    c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(px + 10, py + 12, pw, ph);
    c.fillStyle = '#fbf7ec'; c.fillRect(px, py, pw, ph); c.strokeStyle = 'rgba(90,60,10,0.5)'; c.lineWidth = 2; c.strokeRect(px, py, pw, ph);
    /* 잉크 그림: 정규분포 곡선 아래 막대 + 주사위 */
    var bx = px + 70, by = py + 560, bw = pw - 140;
    c.strokeStyle = INKC; c.lineWidth = 3; c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + bw, by); c.stroke();
    for (var k = 0; k < 11; k++) {
      var t = (k - 5) / 2, hgt = 380 * Math.exp(-t * t / 2), x = bx + 12 + k * (bw - 24) / 11, ww = (bw - 24) / 11 - 8;
      c.fillStyle = k === 5 || k === 6 ? 'rgba(142,91,217,0.85)' : 'rgba(46,134,222,' + (0.25 + 0.5 * hgt / 380) + ')';
      c.fillRect(x, by - hgt, ww, hgt); c.lineWidth = 2; c.strokeRect(x, by - hgt, ww, hgt);
    }
    c.lineWidth = 4; c.beginPath(); for (var j = 0; j <= 100; j++) { var u = j / 100, tt = (u - 0.5) * 5.5, yy = by - 400 * Math.exp(-tt * tt / 2); if (j) c.lineTo(bx + u * bw, yy); else c.moveTo(bx + u * bw, yy); } c.stroke();
    c.save(); c.translate(px + 520, py + 130); c.rotate(0.25); c.fillStyle = '#fff'; c.lineWidth = 3; c.fillRect(-45, -45, 90, 90); c.strokeRect(-45, -45, 90, 90);
    c.fillStyle = INKC; [[-22, -22], [22, 22], [0, 0], [22, -22], [-22, 22]].forEach(function (p) { c.beginPath(); c.arc(p[0], p[1], 8, 0, 7); c.fill(); }); c.restore();
    text(c, 'N(m, σ²)', px + 90, py + 110, '44px ' + HAND, BLUE);
    text(c, '고등학교 · 확률과 통계 · 레슨 15', W / 2, H - 150, '500 34px ' + SANS, '#5a3500', 'center');
  }

  /* 쪽 캔버스 좌표 → 책장 위치(0~1) */
  return { PW: PW, PH: PH, FLAP: FLAP, STAMP: STAMP, make: make, copy: copy, drawLeft: drawLeft, drawRight: drawRight, fitSvg: fitSvg, drawCover: drawCover, plain: plain, MARK: MARK, HAND: HAND, SERIF: SERIF, SANS: SANS };
})();
