/* lessons_2.js — Ⅱ. 확률 (5개 레슨) */
var LESSONS = (typeof LESSONS === 'undefined') ? [] : LESSONS;
(function () {
  var nCr = MX.nCr, t = SV.t, c = SV.c, r_ = SV.r, l = SV.l, p_ = SV.p, fx = MX.fx;
  var UNIT = 'Ⅱ. 확률';

  /* ── 모의실험 도우미 (같은 시작값이면 같은 결과) ── */
  var rollCache = {};
  function rolls(seed) {
    if (!rollCache[seed]) { var R = MX.rng(seed * 1013 + 17), a = []; for (var i = 0; i < 10000; i++) a.push(1 + Math.floor(R() * 6)); rollCache[seed] = a; }
    return rollCache[seed];
  }
  var NS = [10, 30, 100, 300, 1000, 3000, 10000];
  function faceCounts(seed, n) { var a = rolls(seed), cnt = [0, 0, 0, 0, 0, 0]; for (var i = 0; i < n; i++) cnt[a[i] - 1]++; return cnt; }
  /* 생일: P(적어도 두 명의 생일이 같다) = 1 − 365Pk/365^k */
  function noMatch(k) { var p = 1; for (var i = 0; i < k; i++) p *= (365 - i) / 365; return p; }
  function bdays(seed) { var R = MX.rng(seed * 7 + 3), a = []; for (var i = 0; i < 60; i++) a.push(Math.floor(R() * 365)); return a; }
  /* 벤 다이어그램 칸 분류 (0 둘 다 아님, 1 독서만, 2 봉사만, 3 둘 다) */
  function vennCls(x) { var a = []; for (var i = 0; i < 100; i++) { var inA = i < 65, inB = i >= 65 - x && i < 115 - x; a.push(inA && inB ? 3 : inA ? 1 : inB ? 2 : 0); } return a; }
  var VCOL = ['#c9cdd4', COL.blue, COL.green, COL.purple];

  /* ───────── 5. 통계적 확률 ───────── */
  LESSONS.push({
    id: 'stat', unit: UNIT, title: '통계적 확률과 수학적 확률', concept: '시행 횟수가 커질수록 상대도수가 일정한 값에 가까워진다',
    source: 'Ⅱ. 확률 › 확률의 개념과 활용 › 수학적 확률과 통계적 확률',
    terms: [['시행', '같은 조건에서 반복할 수 있고, 그 결과가 우연에 의하여 결정되는 실험이나 관찰'], ['표본공간·근원사건', '어떤 시행에서 일어날 수 있는 모든 결과의 집합이 표본공간 S, 한 개의 원소로 이루어진 사건이 근원사건'], ['수학적 확률', '표본공간 S의 각 근원사건이 일어날 가능성이 모두 같을 때, 사건 A가 일어날 확률 P(A) = n(A)/n(S)'], ['통계적 확률', '같은 시행을 n번 반복할 때 사건 A가 일어난 횟수를 rₙ이라 하면, n이 충분히 클 때 상대도수 rₙ/n이 가까워지는 일정한 값']],
    situation: '공정한 주사위를 던져 <b>6의 눈</b>이 나온 비율(상대도수)을 기록합니다. 던진 횟수가 많아지면 이 비율은 어떻게 변할까요? (3D는 컴퓨터로 대신 던진 모의실험입니다.)',
    predict: {
      q: '던지는 횟수를 10번에서 10000번까지 늘리면, 6의 눈이 나온 상대도수는 어떻게 될까요?',
      options: [
        { t: '횟수와 상관없이 항상 정확히 1/6 ≈ 0.167이다', ok: false, why: '1/6은 수학적 확률(이론값)입니다. 실제로 던지면 적은 횟수에서는 상대도수가 이론값과 꽤 다르게 나옵니다.' },
        { t: '횟수가 커질수록 1/6 근처에 모이는 경향이 있다', ok: true, why: '시행 횟수가 커질수록 상대도수는 일정한 값(여기서는 1/6)에 가까워지는 경향이 있습니다. 이 값을 통계적 확률이라 합니다. 횟수가 작을 때는 많이 흔들립니다.' },
        { t: '횟수가 커질수록 1/6에서 점점 멀어진다', ok: false, why: '반대입니다. 횟수가 늘수록 우연한 치우침이 서로 상쇄되어 1/6 근처로 모입니다.' },
        { t: '6이 덜 나왔으면 다음에는 6이 더 잘 나오게 되어 균형이 맞춰진다', ok: false, why: '주사위는 이전 결과를 기억하지 못합니다. 각 시행은 서로 영향을 주지 않고, 많이 던질수록 “비율”이 가까워질 뿐 “횟수의 차이”가 메워지는 것은 아닙니다.' }
      ]
    },
    slider: { label: '던진 횟수 n', min: 0, max: 6, step: 1, value: 0, fmt: function (v) { return NS[v] + '번'; } },
    needsSeed: true,
    calc: function (idx, env) {
      var n = NS[idx], cnt = faceCounts(env.seed, n), six = cnt[5], rel = six / n;
      return [['시행 횟수 n', n + '번'], ['6의 눈이 나온 횟수 rₙ', six + '번'], ['상대도수 rₙ/n', fx(rel, 4), 1], ['수학적 확률 1/6', fx(1 / 6, 4)], ['차이 |rₙ/n − 1/6|', fx(Math.abs(rel - 1 / 6), 4)]];
    },
    svgAlt: '주사위 눈 6개의 상대도수 막대 그래프와 1/6 기준선',
    svg: function (idx, env) {
      var n = NS[idx], cnt = faceCounts(env.seed, n), s = '', base = 180, sc = 330, i;
      s += l(30, base, 340, base);
      for (i = 0; i < 6; i++) {
        var f = cnt[i] / n, h = f * sc, x = 48 + i * 48;
        s += r_(x, base - h, 32, h, i === 5 ? COL.red : '#4f8fdc') + t(x + 16, base - h - 5, fx(f, 3), { size: 10 }) + t(x + 16, base + 16, (i + 1) + '의 눈', { size: 10 });
      }
      s += l(30, base - sc / 6, 340, base - sc / 6, COL.amber, 2, '5 4') + t(345, base - sc / 6 + 4, '1/6', { anchor: 'start', size: 11, fill: COL.amber });
      s += t(190, 18, n + '번 던진 결과', { weight: 700 });
      return s;
    },
    omitted: '컴퓨터 난수로 던진 모의실험입니다(같은 시작값이면 같은 결과). 실제 주사위의 모서리 닳음이나 던지는 방법의 치우침은 생략하고 공정한 주사위로 가정합니다.',
    actions: [{ label: '다시 던지기', seedStep: true }],
    legend: [[COL.red, '6의 눈'], ['#4f8fdc', '다른 눈'], [COL.amber, '수학적 확률 1/6']],
    apply: {
      q: '(가상의 상황) 병뚜껑을 800번 던졌더니 안쪽 면이 위로 향한 경우가 296번이었습니다. 이때 “안쪽 면이 위로 향할 통계적 확률”로 가장 알맞은 값은 무엇일까요?',
      options: [
        { t: '1/2', ok: false, why: '병뚜껑은 앞뒤 모양이 달라 두 경우가 일어날 가능성이 같다고 기대하기 어렵습니다. 그래서 수학적 확률(경우의 수의 비) 대신, 실제로 던진 결과의 상대도수를 사용합니다.' },
        { t: '0.37', ok: true, why: '상대도수 296/800=0.37입니다. 시행 횟수 800이 충분히 크다고 보고 이 값을 통계적 확률로 생각합니다.' },
        { t: '0.63', ok: false, why: '이것은 안쪽 면이 위로 향하지 않은 경우의 상대도수 504/800, 곧 여사건의 상대도수입니다.' },
        { t: '296', ok: false, why: '296은 사건이 일어난 횟수이고, 확률은 횟수를 전체 시행 횟수로 나눈 값입니다.' }
      ]
    },
    build3d: function (X) {
      var T = X.T, H = X.H, g = X.g, bars = [], labs = [], tgt = [0, 0, 0, 0, 0, 0];
      var floor = H.box(9, 0.1, 2, '#d9d2bf'); floor.position.y = -0.05; g.add(floor);
      for (var i = 0; i < 6; i++) {
        var b = H.box(0.95, 1, 1, i === 5 ? COL.red : '#4f8fdc'); b.position.set((i - 2.5) * 1.35, 0.5, 0); g.add(b); bars.push(b);
        var fl = H.label(String(i + 1), { size: 0.8 }); fl.position.set((i - 2.5) * 1.35, -0.7, 0.4); g.add(fl);
        var d = H.dyn({ size: 0.7 }); g.add(d.sprite); labs.push(d);
      }
      var plane = H.box(8.6, 0.04, 1.5, COL.amber, { transparent: true, opacity: 0.45 }); plane.position.set(0, 10 / 6, 0); g.add(plane);
      var pl = H.label('수학적 확률 1/6', { size: 0.8 }); pl.position.set(-2.8, 10 / 6 + 1.9, 0.8); g.add(pl);
      var cur = [0, 0, 0, 0, 0, 0];
      return {
        cam: { theta: 0.2, phi: 1.0, r: 12.5, t: [0, 1.4, 0] },
        update: function (idx, env) {
          var n = NS[idx], cnt = faceCounts(env.seed, n);
          for (var i = 0; i < 6; i++) { tgt[i] = 10 * cnt[i] / n; labs[i].set(fx(cnt[i] / n, 3)); }
        },
        tick: function (time, dt) {
          var k = dt > 0 ? 1 - Math.exp(-dt * 6) : 1;
          for (var i = 0; i < 6; i++) {
            cur[i] += (tgt[i] - cur[i]) * k; var h = Math.max(cur[i], 0.02);
            bars[i].scale.y = h; bars[i].position.y = h / 2; labs[i].sprite.position.set((i - 2.5) * 1.35, h + 0.55, 0);
          }
        }
      };
    }
  });

  /* ───────── 6. 확률의 덧셈정리 ───────── */
  LESSONS.push({
    id: 'add', unit: UNIT, title: '확률의 덧셈정리', concept: 'P(A∪B) = P(A) + P(B) − P(A∩B)',
    source: 'Ⅱ. 확률 › 확률의 개념과 활용 › 확률의 덧셈정리',
    terms: [['사건 A∪B', '사건 A 또는 사건 B가 일어나는 사건'], ['사건 A∩B', '사건 A와 사건 B가 동시에 일어나는 사건'], ['배반사건', 'A∩B=∅, 곧 동시에 일어나지 않는 두 사건. 이때 P(A∪B) = P(A) + P(B)'], ['표본공간', '어떤 시행에서 일어날 수 있는 모든 결과의 집합']],
    situation: '학생 100명 중에서 한 명을 임의로 뽑습니다(가상의 조사). <b>독서 프로그램에 참여한 학생 65명(A)</b>, <b>봉사 프로그램에 참여한 학생 50명(B)</b>이고, 둘 다 참여한 학생 수는 아직 모릅니다.',
    predict: {
      q: '뽑힌 학생이 독서 또는 봉사 프로그램에 참여했을 확률 P(A∪B)는 얼마일까요?',
      options: [
        { t: '0.65 + 0.5 = 1.15', ok: false, why: '확률은 1을 넘을 수 없습니다. 두 프로그램에 모두 참여한 학생을 두 번 센 결과입니다.' },
        { t: '0.65 × 0.5 = 0.325', ok: false, why: '곱 P(A)P(B)는 두 사건이 서로 독립일 때 “동시에” 일어날 확률 P(A∩B)를 구하는 계산입니다. “또는”의 확률에는 맞지 않습니다.' },
        { t: '0.65 (큰 쪽의 확률)', ok: false, why: 'B에만 참여한 학생(A에 속하지 않는 학생)이 있을 수 있으므로 P(A∪B)는 P(A)보다 같거나 큽니다. 큰 쪽만 취하면 B에만 참여한 학생이 빠집니다.' },
        { t: '겹치는 학생 수를 알아야 정해진다 (0.65 + 0.5 − P(A∩B))', ok: true, why: 'n(A∪B)=n(A)+n(B)−n(A∩B)입니다. 겹치는 학생 수에 따라 값이 달라지므로, 슬라이더로 겹침을 바꾸며 확인해 보세요.' }
      ]
    },
    slider: { label: '둘 다 참여한 학생 수 n(A∩B)', min: 15, max: 50, step: 1, value: 35, fmt: function (v) { return v + '명'; } },
    calc: function (x) {
      var u = 115 - x;
      return [['n(A) + n(B)', '65 + 50 = 115명'], ['겹친 학생 n(A∩B)', x + '명'], ['n(A∪B) = n(A)+n(B)−n(A∩B)', u + '명'], ['P(A∪B) = ' + u + '/100', fx(u / 100, 2), 1]];
    },
    svgAlt: '학생 100명을 칸으로 나타낸 그림. 독서 프로그램만, 봉사 프로그램만, 둘 다, 둘 다 아닌 학생이 색으로 구분됨',
    svg: function (x) {
      var cls = vennCls(x), s = '';
      for (var i = 0; i < 100; i++) s += r_(30 + (i % 10) * 17, 24 + Math.floor(i / 10) * 17, 15, 15, VCOL[cls[i]], { rx: 3 });
      s += t(250, 60, '독서 A: 65명', { anchor: 'start', fill: COL.blue, weight: 700 }) + t(250, 82, '봉사 B: 50명', { anchor: 'start', fill: COL.green, weight: 700 });
      s += t(250, 104, '둘 다 A∩B: ' + x + '명', { anchor: 'start', fill: COL.purple, weight: 700 });
      s += t(250, 140, 'A 또는 B: 115 − ' + x + ' = ' + (115 - x) + '명', { anchor: 'start' });
      s += t(250, 164, 'P(A∪B) = ' + fx((115 - x) / 100, 2), { anchor: 'start', size: 15, weight: 700 });
      return s;
    },
    omitted: '학생 한 명을 뽑는 모든 경우가 같은 가능성이라고 가정했습니다(수학적 확률). 100명을 10×10 칸으로 단순하게 나타냈고, 칸의 위치에는 의미가 없습니다.',
    legend: [[COL.blue, '독서만'], [COL.green, '봉사만'], [COL.purple, '둘 다'], ['#c9cdd4', '둘 다 아님']],
    apply: {
      q: 'P(A)=2/5, P(B)=1/2, P(A∩B)=1/5일 때, P(A∪B)의 값은 얼마일까요?',
      options: [
        { t: '9/10', ok: false, why: '2/5+1/2만 더한 값입니다. 겹치는 부분 P(A∩B)=1/5을 한 번 빼야 합니다.' },
        { t: '1/5', ok: false, why: '이것은 P(A∩B)의 값입니다. 사건 A∪B의 확률은 이보다 큽니다.' },
        { t: '7/10', ok: true, why: 'P(A∪B)=P(A)+P(B)−P(A∩B)=2/5+1/2−1/5=4/10+5/10−2/10=7/10입니다.' },
        { t: '3/10', ok: false, why: '1/2−1/5처럼 일부만 계산한 값입니다. 세 값을 모두 사용한 덧셈정리의 결과가 아닙니다.' }
      ]
    },
    build3d: function (X) {
      var T = X.T, H = X.H, g = X.g, tiles = [];
      for (var i = 0; i < 100; i++) {
        var b = H.box(0.88, 0.25, 0.88, '#c9cdd4'); b.position.set((i % 10 - 4.5) * 1.0, 0, (Math.floor(i / 10) - 4.5) * 1.0); g.add(b); tiles.push(b);
      }
      var cls = vennCls(35);
      return {
        cam: { theta: 0.5, phi: 0.95, r: 21, t: [0, 0, 0] },
        update: function (x) {
          cls = vennCls(x);
          tiles.forEach(function (b, i) { b.material.color.set(VCOL[cls[i]]); b.userData.up = cls[i] > 0; });
        },
        tick: function (time) {
          tiles.forEach(function (b, i) { var u = b.userData.up; b.position.y = u ? 0.25 + 0.12 * Math.sin(time * 2 + i * 0.4) : 0; });
        }
      };
    }
  });

  /* ───────── 7. 여사건의 확률 (생일 문제) ───────── */
  LESSONS.push({
    id: 'comp', unit: UNIT, title: '여사건의 확률', concept: 'P(Aᶜ) = 1 − P(A) 로 “적어도 하나”의 확률 구하기',
    source: 'Ⅱ. 확률 › 확률의 개념과 활용 › 여사건의 확률',
    terms: [['여사건 Aᶜ', '사건 A가 일어나지 않는 사건'], ['여사건의 확률', 'P(Aᶜ) = 1 − P(A)'], ['적어도 하나', '“하나 이상”이라는 뜻. 여사건(하나도 없다)의 확률을 이용하면 편하다']],
    situation: '반 학생 k명 중에 <b>생일이 같은 학생이 있을 확률</b>을 구합니다(사건 A: 생일이 같은 두 학생이 적어도 한 쌍 있다). 1년은 365일로 보고, 태어난 날은 모두 같은 가능성이라고 가정합니다.',
    predict: {
      q: '학생이 30명일 때, 생일이 같은 두 학생이 적어도 한 쌍 있을 확률은 얼마쯤일까요?',
      options: [
        { t: '약 8% (30/365)', ok: false, why: '30/365는 “내 생일과 같은 사람이 있을 확률”과 비슷한 감각입니다. 여기서는 30명 중 아무 두 명이나 짝지을 수 있어 짝의 수가 ₃₀C₂=435쌍으로 많습니다.' },
        { t: '약 30%', ok: false, why: '직관으로 잡은 값입니다. 모두 다를 확률 ₃₆₅P₃₀/365³⁰을 계산하면 약 0.29이므로 같은 쌍이 있을 확률은 0.5보다 훨씬 큽니다.' },
        { t: '약 71%', ok: true, why: '여사건(30명의 생일이 모두 다르다)의 확률은 ₃₆₅P₃₀/365³⁰≈0.2937입니다. 따라서 1−0.2937≈0.71입니다.' },
        { t: '약 99%', ok: false, why: '99%는 약 57명쯤 되어야 나오는 값입니다. 30명에서는 아직 그 정도로 크지 않습니다.' }
      ]
    },
    slider: { label: '학생 수 k', min: 2, max: 60, step: 1, value: 30, fmt: function (v) { return v + '명'; } },
    needsSeed: true,
    calc: function (k) {
      var nm = noMatch(k);
      return [['전체 경우의 수 365ᵏ', '365' + String(k).split('').map(function (d) { return '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]; }).join('')], ['모두 다른 경우 P(Aᶜ) = ₃₆₅Pₖ/365ᵏ', fx(nm, 4)], ['생일이 같은 학생이 있을 확률 P(A) = 1 − P(Aᶜ)', fx(1 - nm, 4), 1]];
    },
    svgAlt: '학생 수에 따라 생일이 같은 학생이 있을 확률이 커지는 곡선',
    svg: function (k) {
      var s = '', x0 = 40, y0 = 190, W = 330, Hh = 160, pts = [], i;
      s += l(x0, y0, x0 + W, y0) + l(x0, y0, x0, y0 - Hh);
      for (i = 2; i <= 60; i++) pts.push((x0 + (i - 2) / 58 * W) + ',' + (y0 - (1 - noMatch(i)) * Hh));
      s += '<polyline points="' + pts.join(' ') + '" fill="none" stroke="' + COL.teal + '" stroke-width="2.5"/>';
      s += l(x0, y0 - Hh / 2, x0 + W, y0 - Hh / 2, COL.amber, 1, '4 4') + t(x0 - 6, y0 - Hh / 2 + 4, '0.5', { anchor: 'end', size: 10 }) + t(x0 - 6, y0 - Hh + 4, '1', { anchor: 'end', size: 10 }) + t(x0 - 6, y0 + 4, '0', { anchor: 'end', size: 10 });
      var px = x0 + (k - 2) / 58 * W, py = y0 - (1 - noMatch(k)) * Hh;
      s += c(px, py, 6, COL.red, { stroke: '#fff', w: 2 }) + t(px, py - 12, fx(1 - noMatch(k), 2), { weight: 700, fill: COL.red });
      s += t(x0 + W / 2, y0 + 20, '학생 수 k (2~60명)', { size: 11 });
      return s;
    },
    omitted: '2월 29일, 쌍둥이, 계절에 따른 출생 차이는 생략하고 365일이 모두 같은 가능성이라 가정했습니다. 3D의 핀은 컴퓨터가 한 번 뽑아 본 예일 뿐이며, 확률은 오른쪽 계산식으로 구한 값입니다.',
    actions: [{ label: '생일 다시 뽑기', seedStep: true }],
    legend: [[COL.amber, '생일이 하나인 날'], [COL.red, '같은 생일이 겹친 날'], [COL.teal, '확률 막대']],
    apply: {
      q: '주사위 한 개를 3번 던질 때, 1의 눈이 적어도 한 번 나올 확률은 얼마일까요?',
      options: [
        { t: '1/2', ok: false, why: '1/6+1/6+1/6입니다. 1의 눈이 두 번 이상 나오는 경우를 여러 번 센 값이어서, 이렇게 더하면 안 됩니다.' },
        { t: '125/216', ok: false, why: '이것은 “세 번 모두 1이 아닐 확률” (5/6)³=125/216, 곧 여사건의 확률입니다. 구하는 확률은 1에서 이 값을 빼야 합니다.' },
        { t: '91/216', ok: true, why: '여사건(세 번 모두 1이 아니다)의 확률은 (5/6)³=125/216이므로, 구하는 확률은 1−125/216=91/216입니다.' },
        { t: '1/216', ok: false, why: '(1/6)³, 곧 세 번 모두 1의 눈이 나올 확률입니다. “적어도 한 번”은 한 번, 두 번, 세 번 나오는 경우를 모두 포함합니다.' }
      ]
    },
    build3d: function (X) {
      var T = X.T, H = X.H, g = X.g, COLS = 20, cnt = 365;
      var im = new T.InstancedMesh(new T.BoxGeometry(0.52, 0.12, 0.52), H.mat('#ffffff'), cnt), m4 = new T.Matrix4();
      for (var i = 0; i < cnt; i++) { m4.setPosition((i % COLS - 9.5) * 0.6, 0, (Math.floor(i / COLS) - 9) * 0.6); im.setMatrixAt(i, m4); im.setColorAt(i, new T.Color('#c9cdd4')); }
      g.add(im);
      var pins = []; for (var j = 0; j < 60; j++) { var cn = new T.Mesh(new T.ConeGeometry(0.22, 0.9, 16), H.mat(COL.amber)); cn.visible = false; g.add(cn); pins.push(cn); }
      var gb = H.cyl(0.45, 0.45, 4, '#d9d2bf', { transparent: true, opacity: 0.5 }); gb.position.set(8, 2, 0); g.add(gb);
      var gf = H.cyl(0.4, 0.4, 1, COL.teal); g.add(gf);
      var gl = H.dyn({ size: 0.9 }); g.add(gl.sprite);
      var half = H.box(1.1, 0.05, 1.1, COL.amber); half.position.set(8, 2, 0); g.add(half);
      var hl = H.label('0.5', { size: 0.6 }); hl.position.set(9.4, 2, 0); g.add(hl);
      var col = new T.Color();
      return {
        cam: { theta: 0.45, phi: 1.0, r: 25, t: [3, 0.5, 0], bookPhi: 0.8 },
        update: function (k, env) {
          var days = bdays(env.seed).slice(0, k), count = {};
          days.forEach(function (d) { count[d] = (count[d] || 0) + 1; });
          for (var i = 0; i < cnt; i++) { col.set(count[i] > 1 ? COL.red : count[i] === 1 ? COL.amber : '#c9cdd4'); im.setColorAt(i, col); }
          im.instanceColor.needsUpdate = true;
          pins.forEach(function (p, j) {
            if (j < k) { var d = days[j]; p.visible = true; p.material.color.set(count[d] > 1 ? COL.red : COL.amber); p.position.set((d % COLS - 9.5) * 0.6 + (j % 3 - 1) * 0.12, 0.5, (Math.floor(d / COLS) - 9) * 0.6); }
            else p.visible = false;
          });
          var P = 1 - noMatch(k), h = Math.max(P * 4, 0.02);
          gf.scale.y = h; gf.position.set(8, h / 2, 0); gl.sprite.position.set(8, 4.8, 0); gl.set('P ≈ ' + fx(P, 2));
        }
      };
    }
  });

  /* ───────── 8. 조건부확률 ───────── */
  LESSONS.push({
    id: 'cond', unit: UNIT, title: '조건부확률', concept: 'P(B|A) = P(A∩B)/P(A) (단, P(A)>0)',
    source: 'Ⅱ. 확률 › 조건부확률 › 조건부확률',
    terms: [['조건부확률 P(B|A)', '사건 A가 일어났을 때 사건 B가 일어날 확률. P(B|A) = P(A∩B)/P(A) (단, P(A)>0)'], ['확률의 곱셈정리', 'P(A∩B) = P(A)P(B|A) (단, P(A)>0)'], ['비복원추출', '꺼낸 것을 다시 넣지 않고 다음 것을 꺼내는 추출']],
    situation: '주머니에 <b>빨간 공 r개와 파란 공 5개</b>가 들어 있습니다. 공을 한 개씩 차례로 꺼내고, 꺼낸 공은 다시 넣지 않습니다. 첫 번째로 빨간 공을 꺼냈다는 것을 알고 있습니다. (사건 A: 첫 번째에 빨간 공, 사건 B: 두 번째에 빨간 공)',
    predict: {
      q: '빨간 공이 3개(r=3)일 때, 첫 번째에 빨간 공이 나온 것을 알고 있다면 두 번째도 빨간 공일 확률은 얼마일까요?',
      options: [
        { t: '3/8 (처음 빨간 공이 나올 확률과 같다)', ok: false, why: '3/8은 아무 정보가 없을 때 첫 번째가 빨간 공일 확률입니다. 한 개를 이미 꺼냈으므로 주머니 속 공의 수가 달라졌습니다.' },
        { t: '2/8 = 1/4', ok: false, why: '빨간 공은 2개로 줄었지만 전체 공의 수도 8개에서 7개로 줄었습니다. 분모를 그대로 8로 두면 안 됩니다.' },
        { t: '3/7', ok: false, why: '전체는 7개로 맞게 줄였지만 빨간 공은 3개가 아니라 2개 남았습니다.' },
        { t: '2/7', ok: true, why: '첫 번째가 빨간 공이었다는 조건으로 표본공간이 “빨간 공 2개 + 파란 공 5개, 모두 7개”로 줄어듭니다. P(B|A)=2/7입니다.' }
      ]
    },
    slider: { label: '빨간 공의 수 r', min: 1, max: 8, step: 1, value: 3, fmt: function (v) { return v + '개'; } },
    calc: function (r) {
      var T = r + 5, pa = MX.frac(r, T), pab = MX.frac(r * (r - 1), T * (T - 1)), pba = (r - 1) + '/' + (T - 1);
      return [['전체 공 r + 5', T + '개'], ['P(A) = r/(r+5) (첫째가 빨강)', pa], ['P(A∩B) (둘 다 빨강)', pab], ['P(B|A) = P(A∩B)/P(A) = (r−1)/(r+4)', pba + ' ≈ ' + fx((r - 1) / (T - 1), 4), 1]];
    },
    svgAlt: '첫째와 둘째 공을 꺼낼 때의 확률을 나타낸 수형도',
    svg: function (r) {
      var T = r + 5, s = '';
      s += l(60, 110, 160, 60, COL.ink, 1.5) + l(60, 110, 160, 160, COL.ink, 1.5);
      s += c(60, 110, 6, COL.ink) + c(160, 60, 9, COL.red) + c(160, 160, 9, COL.blue);
      s += t(95, 74, '첫째 빨강 ' + r + '/' + T, { size: 11, anchor: 'middle' }) + t(95, 156, '파랑 5/' + T, { size: 11 });
      s += l(160, 60, 280, 30, COL.ink, 1.5) + l(160, 60, 280, 90, COL.ink, 1.5);
      s += c(280, 30, 9, COL.red) + c(280, 90, 9, COL.blue);
      s += t(300, 34, '둘째 빨강 ' + (r - 1) + '/' + (T - 1), { anchor: 'start', size: 11, weight: 700, fill: COL.red }) + t(300, 94, '둘째 파랑 5/' + (T - 1), { anchor: 'start', size: 11 });
      s += t(215, 188, '첫째가 빨강일 때 둘째가 빨강일 확률 P(B|A) = ' + (r - 1) + '/' + (T - 1), { size: 12, weight: 700, fill: COL.green });
      return s;
    },
    omitted: '모든 공이 같은 가능성으로 뽑히고 크기·무게는 같다고 가정했습니다. 3D에서 꺼낸 공은 주머니 밖에 두며 다시 넣지 않습니다. 금빛 테두리는 둘째로 뽑아야 할 빨간 공입니다.',
    legend: [[COL.red, '빨간 공'], [COL.blue, '파란 공'], [COL.amber, '남은 빨간 공']],
    apply: {
      q: '흰 공 5개와 검은 공 4개가 들어 있는 주머니에서 공을 한 개씩 두 번 꺼냅니다(꺼낸 공은 다시 넣지 않음). 두 공이 모두 검은 공일 확률은 얼마일까요?',
      options: [
        { t: '16/81', ok: false, why: '(4/9)×(4/9)입니다. 꺼낸 공을 다시 넣는 경우(복원추출)의 계산이며, 이 문제는 다시 넣지 않습니다.' },
        { t: '4/9', ok: false, why: '첫 번째가 검은 공일 확률 P(A)만 구한 값입니다. 두 번째도 검은 공이어야 하므로 P(B|A)를 곱해야 합니다.' },
        { t: '3/8', ok: false, why: '첫째가 검은 공일 때 둘째도 검은 공일 조건부확률 P(B|A)만 구한 값입니다. 첫째가 검은 공일 확률 4/9도 곱해야 합니다.' },
        { t: '1/6', ok: true, why: '사건 A를 “첫째가 검은 공”, 사건 B를 “둘째가 검은 공”이라 하면, 곱셈정리 P(A∩B)=P(A)P(B|A)=4/9×3/8=12/72=1/6입니다.' }
      ]
    },
    build3d: function (X) {
      var T = X.T, H = X.H, g = X.g, bag = new T.Mesh(new T.CylinderGeometry(1.7, 1.45, 3.4, 28, 1, true), H.mat('#9aa3b3', { transparent: true, opacity: 0.2, side: T.DoubleSide }));
      bag.position.set(-2, 1.7, 0); g.add(bag);
      var floor = H.cyl(1.45, 1.45, 0.08, '#9aa3b3'); floor.position.set(-2, 0, 0); g.add(floor);
      var balls = [], rings = [], R = 3;
      for (var i = 0; i < 13; i++) {
        var b = H.sph(0.42, COL.red); b.visible = false; g.add(b); balls.push(b);
        var rg = new T.Mesh(new T.TorusGeometry(0.55, 0.05, 8, 24), H.mat(COL.amber, { emissive: '#7a5200' })); rg.visible = false; g.add(rg); rings.push(rg);
      }
      var bars = [H.box(1, 1, 1, '#b9c3d6'), H.box(1, 1, 1, COL.green)];
      bars[0].position.x = 3.6; bars[1].position.x = 5.2; bars.forEach(function (b) { g.add(b); });
      var bl = [H.dyn({ size: 0.7 }), H.dyn({ size: 0.7 })];
      g.add(bl[0].sprite); g.add(bl[1].sprite);
      var l1 = H.label('처음', { size: 0.7 }); l1.position.set(3.6, -0.6, 0); g.add(l1);
      var l2 = H.label('P(B|A)', { size: 0.7 }); l2.position.set(5.2, -0.6, 0); g.add(l2);
      var fl = H.label('꺼낸 공', { size: 0.7 }); fl.position.set(1.7, 4.5, 0); g.add(fl);
      return {
        cam: { theta: 0.3, phi: 1.15, r: 14, t: [1.5, 1.8, 0] },
        update: function (r) {
          R = r; var Tn = r + 5;
          for (var j = 0; j < 13; j++) {
            var b = balls[j], rg = rings[j];
            b.visible = j < Tn; rg.visible = false;
            if (j >= Tn) continue;
            b.material.color.set(j < r ? COL.red : COL.blue);
            if (j === 0) b.position.set(1.7, 3.6, 0);
            else { var q = j - 1; b.position.set(-2 + ((q % 2) - 0.5) * 1.15, 0.55 + Math.floor(q / 4) * 0.8, (Math.floor((q % 4) / 2) - 0.5) * 1.15); }
            if (j >= 1 && j < r) { rg.visible = true; rg.position.copy(b.position); rg.rotation.x = Math.PI / 2; }
          }
          var p0 = r / Tn, p1 = (r - 1) / (Tn - 1);
          bars[0].scale.set(1, Math.max(p0 * 4, 0.02), 1); bars[0].position.y = Math.max(p0 * 4, 0.02) / 2; bl[0].sprite.position.set(3.6, p0 * 4 + 0.6, 0); bl[0].set(r + '/' + Tn);
          bars[1].scale.set(1, Math.max(p1 * 4, 0.02), 1); bars[1].position.y = Math.max(p1 * 4, 0.02) / 2; bl[1].sprite.position.set(5.2, p1 * 4 + 0.6, 0); bl[1].set((r - 1) + '/' + (Tn - 1));
        },
        tick: function (time) { balls[0].position.y = 3.6 + 0.15 * Math.sin(time * 2.5); rings.forEach(function (rg) { if (rg.visible) rg.scale.setScalar(1 + 0.08 * Math.sin(time * 4)); }); }
      };
    }
  });

  /* ───────── 9. 독립시행의 확률 ───────── */
  LESSONS.push({
    id: 'indep', unit: UNIT, title: '독립시행의 확률', concept: '한 번에 사건 A가 일어날 확률이 p일 때, n번의 독립시행에서 A가 r번 일어날 확률은 ₙCᵣ pʳ (1−p)ⁿ⁻ʳ',
    source: 'Ⅱ. 확률 › 조건부확률 › 사건의 독립과 종속 (독립시행의 확률)',
    terms: [['독립', '두 사건 A, B에서 한 사건이 일어나는 것이 다른 사건이 일어날 확률에 영향을 주지 않을 때. P(B|A) = P(B), 곧 P(A∩B) = P(A)P(B) (단, P(A)>0)'], ['종속', '두 사건 A, B가 서로 독립이 아닐 때'], ['독립시행', '동전이나 주사위를 반복하여 던지는 것처럼, 같은 시행을 반복할 때 각 시행의 결과가 다른 시행의 결과에 영향을 주지 않는 시행']],
    situation: '양궁 선수가 화살 한 발을 쏘아 10점에 맞힐 확률이 <b>1/4</b>이라고 합니다(가상의 값). 매번 앞의 결과와 상관없이 쏘는 독립시행으로 보고, <b>6발</b> 쏩니다.',
    predict: {
      q: '6발을 쏠 때, 10점에 맞힌 횟수 중 확률이 가장 큰 것은 몇 번일까요?',
      options: [
        { t: '0번', ok: false, why: '0번은 모두 빗나갈 확률 (3/4)⁶=729/4096≈0.178입니다. 1번 맞힐 확률(1458/4096)보다 작습니다.' },
        { t: '1번', ok: true, why: '₆C₁(1/4)(3/4)⁵=1458/4096≈0.356으로 가장 큽니다. 평균은 6×1/4=1.5번이고, 그 근처인 1번이 가장 흔합니다.' },
        { t: '2번', ok: false, why: '₆C₂(1/4)²(3/4)⁴=1215/4096≈0.297입니다. 평균 1.5번에 가깝지만 1번(≈0.356)보다 작습니다.' },
        { t: '3번', ok: false, why: '“반반이니까 3번”은 성공 확률이 1/2일 때의 생각입니다. 1/4이므로 3번 맞힐 확률은 540/4096≈0.132로 작습니다.' }
      ]
    },
    slider: { label: '성공 횟수 r', min: 0, max: 6, step: 1, value: 0, fmt: function (v) { return v + '번'; } },
    calc: function (r) {
      var C = nCr(6, r), num = C * Math.pow(3, 6 - r);
      return [['성공 r번의 순서 배열 ₆Cᵣ', C + '가지'], ['한 가지 배열의 확률 (1/4)ʳ(3/4)⁶⁻ʳ', Math.pow(3, 6 - r) + '/4096'], ['P(X=r) = ₆Cᵣ(1/4)ʳ(3/4)⁶⁻ʳ', MX.frac(num, 4096) + ' ≈ ' + fx(num / 4096, 4), 1]];
    },
    svgAlt: '성공 횟수 0~6번의 확률을 나타낸 막대 그래프',
    svg: function (r) {
      var s = '', base = 180, sc = 400;
      s += l(30, base, 390, base);
      for (var k = 0; k <= 6; k++) {
        var P = nCr(6, k) * Math.pow(3, 6 - k) / 4096, h = P * sc * 0.92, x = 48 + k * 49;
        s += r_(x, base - h, 34, h, k === r ? COL.amber : '#4f8fdc', { stroke: k === r ? '#7a5200' : 'none', w: 2 }) + t(x + 17, base - h - 5, fx(P, 3), { size: 10, weight: k === r ? 700 : 400 }) + t(x + 17, base + 16, k + '번', { size: 11 });
      }
      s += t(210, 22, '6발 쏘았을 때 10점 횟수별 확률', { weight: 700 });
      return s;
    },
    omitted: '10점에 맞힐 확률이 매번 1/4로 같고 서로 영향을 주지 않는다고 가정했습니다. 피로·긴장·연습 효과는 생략했습니다. 3D의 공은 성공(금색)·실패(회색)가 나올 수 있는 배열을 하나씩 보여 줍니다.',
    legend: [[COL.amber, '성공'], [COL.gray, '실패'], ['#4f8fdc', '막대: 성공 횟수별 확률']],
    apply: {
      q: '주사위 한 개를 4번 던질 때, 3의 배수의 눈이 정확히 2번 나올 확률은 얼마일까요?',
      options: [
        { t: '4/81', ok: false, why: '3의 배수가 나오는 한 가지 순서(예: ○○××)의 확률 (1/3)²(2/3)²입니다. 2번이 나올 수 있는 순서는 ₄C₂=6가지입니다.' },
        { t: '1/2', ok: false, why: '“4번 중 2번이니 비율 1/2”인 것과 “정확히 2번 나올 확률”은 다릅니다. 한 번에 3의 배수가 나올 확률은 2/6=1/3입니다.' },
        { t: '8/27', ok: true, why: '한 번에 3의 배수(3, 6)가 나올 확률은 1/3이므로 ₄C₂(1/3)²(2/3)²=6×4/81=24/81=8/27입니다.' },
        { t: '2/3', ok: false, why: '₄C₂(1/3)²=6/9입니다. 나머지 2번은 3의 배수가 아니어야 하므로 (2/3)²도 곱해야 합니다.' }
      ]
    },
    build3d: function (X) {
      var T = X.T, H = X.H, g = X.g, tri = [], bars = [], st = { r: 0, list: [[]], idx: -1 };
      var floor = H.box(10, 0.1, 2.4, '#d9d2bf'); floor.position.set(0, -0.05, 0); g.add(floor);
      /* 6번의 시행 공은 앞쪽 받침 위에 놓음 (2차는 막대 위 공중에 떠 있었음) */
      var tray = H.box(8.4, 0.12, 1.3, '#e9e4d8'); tray.position.set(0, -0.06, 2.6); g.add(tray);
      var tl = H.label('6발 (노랑 = 10점)', { size: 0.7 }); tl.position.set(0, 1.5, 2.6); g.add(tl);
      for (var i = 0; i < 6; i++) { var b = H.sph(0.4, COL.gray); b.position.set((i - 2.5) * 1.3, 0.46, 2.6); g.add(b); tri.push(b); }
      for (var k = 0; k <= 6; k++) {
        var P = nCr(6, k) * Math.pow(3, 6 - k) / 4096, h = Math.max(P * 8.3, 0.05), bar = H.box(0.9, h, 0.9, '#4f8fdc');
        bar.position.set((k - 3) * 1.3, h / 2, 0); g.add(bar); bars.push(bar);
        var lb = H.label(String(k), { size: 0.7 }); lb.position.set((k - 3) * 1.3, -0.7, 0.4); g.add(lb);
      }
      var dl = H.dyn({ size: 0.8 }); g.add(dl.sprite);
      function apply() {
        var pick = st.list[st.idx];
        tri.forEach(function (b, i) { var ok = pick.indexOf(i) >= 0; b.material.color.set(ok ? COL.amber : COL.gray); b.material.emissive.set(ok ? '#7a5200' : '#000000'); b.scale.setScalar(ok ? 1.15 : 0.8); b.position.y = 0.4 * b.scale.y + 0.02; });
      }
      return {
        cam: { theta: 0.2, phi: 1.2, r: 15, t: [0, 2.8, 0], bookPhi: 0.85 },
        update: function (r) {
          st.r = r; st.list = MX.combos(6, r); st.idx = 0; apply();
          bars.forEach(function (b, k) { b.material.color.set(k === r ? COL.amber : '#4f8fdc'); });
          var P = nCr(6, r) * Math.pow(3, 6 - r) / 4096, h = Math.max(P * 8.3, 0.05);
          dl.sprite.position.set((r - 3) * 1.3, h + 0.7, 0); dl.set(MX.frac(nCr(6, r) * Math.pow(3, 6 - r), 4096));
        },
        tick: function (time) { var i = Math.floor(time * 1.2) % st.list.length; if (i !== st.idx) { st.idx = i; apply(); } }
      };
    }
  });
})();
