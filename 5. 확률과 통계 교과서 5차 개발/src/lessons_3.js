/* lessons_3.js — Ⅲ. 통계 (5개 레슨) */
var LESSONS = (typeof LESSONS === 'undefined') ? [] : LESSONS;
(function () {
  var nCr = MX.nCr, t = SV.t, c = SV.c, r_ = SV.r, l = SV.l, p_ = SV.p, fx = MX.fx, Phi = MX.Phi, clamp = MX.clamp;
  var UNIT = 'Ⅲ. 통계';

  /* ───────── 11. 이산확률변수의 기댓값 ───────── */
  function d11(a) { return { xs: [1, 2, a], ps: [1 / 2, 1 / 3, 1 / 6] }; }
  function stats11(a) {
    var E = (7 + a) / 6, E2 = (11 + a * a) / 6, V = E2 - E * E;
    return { E: E, E2: E2, V: V, s: Math.sqrt(V), simple: (3 + a) / 3 };
  }
  LESSONS.push({
    id: 'expect', unit: UNIT, title: '이산확률변수의 기댓값', concept: 'E(X) = x₁p₁ + x₂p₂ + … + xₙpₙ',
    source: '교과서 Ⅲ-2 이산확률변수의 기댓값과 표준편차',
    terms: [['확률변수 X', '시행의 결과에 따라 값이 정해지는 변수'], ['이산확률변수', '값을 하나씩 셀 수 있는 확률변수'], ['기댓값(평균) E(X)', '시행을 아주 많이 되풀이할 때 X가 가질 것으로 기대되는 평균값'], ['분산 V(X)', '값이 평균에서 흩어진 정도. V(X)=E(X²)−{E(X)}²']],
    situation: '뽑기 게임에서 점수 X가 <b>1점(확률 1/2), 2점(확률 1/3), a점(확률 1/6)</b>으로 나옵니다(가상의 게임). 게임을 아주 많이 되풀이했을 때 한 번당 평균 점수는 얼마일까요?',
    predict: {
      q: 'a=10일 때 한 번당 평균 점수 E(X)는 얼마일까요?',
      options: [
        { t: '(1+2+10)÷3 = 13/3 ≈ 4.33점', ok: false, why: '세 값을 단순히 평균 낸 것입니다. 1점은 절반이나 나오는데 10점은 6번에 한 번뿐이므로, 값마다 나올 확률(가중치)을 곱해야 합니다.' },
        { t: '1점 (가장 자주 나오는 값)', ok: false, why: '가장 자주 나오는 값은 최빈값이며 기댓값(평균)과 다릅니다. 2점, 10점도 나오므로 평균은 1점보다 큽니다.' },
        { t: '17/6 ≈ 2.83점', ok: true, why: 'E(X)=1×1/2+2×1/3+10×1/6=3/6+4/6+10/6=17/6입니다. 3D 시소에서 균형을 이루는 받침점의 위치가 곧 기댓값입니다.' },
        { t: '10점 (가장 큰 값)', ok: false, why: '10점은 가장 큰 값이지만 확률이 작습니다. 기댓값은 가장 작은 값과 가장 큰 값 사이의 값입니다.' }
      ]
    },
    slider: { label: '가장 높은 점수 a', min: 3, max: 15, step: 1, value: 10, fmt: function (v) { return v + '점'; } },
    calc: function (a) {
      var s = stats11(a);
      return [['E(X) = 1·½ + 2·⅓ + a·⅙', MX.frac(7 + a, 6) + ' ≈ ' + fx(s.E, 3), 1], ['(참고) 확률을 무시한 단순 평균', fx(s.simple, 3)], ['E(X²) = 1²·½ + 2²·⅓ + a²·⅙', MX.frac(11 + a * a, 6) + ' ≈ ' + fx(s.E2, 3)], ['V(X) = E(X²) − {E(X)}²', MX.frac(5 * a * a - 14 * a + 17, 36) + ' ≈ ' + fx(s.V, 3)], ['표준편차 σ(X) = √V(X)', fx(s.s, 3)]];
    },
    svgAlt: '점수 1, 2, a의 확률 막대와 평균 위치를 나타낸 수직선',
    svg: function (a) {
      var s = '', d = d11(a), st = stats11(a), X = function (u) { return 30 + u * 23; }, base = 150;
      s += l(24, base, 390, base);
      for (var i = 0; i <= 15; i++) s += l(X(i), base, X(i), base + 4) + (i % 3 === 0 ? t(X(i), base + 16, i, { size: 10 }) : '');
      d.xs.forEach(function (x, k) { var h = d.ps[k] * 170; s += r_(X(x) - 9, base - h, 18, h, [COL.blue, COL.green, COL.red][k]) + t(X(x), base - h - 5, MX.frac(Math.round(d.ps[k] * 6), 6), { size: 11 }); });
      s += p_('M' + X(st.E) + ',' + (base + 4) + ' l-9,18 l18,0 z', COL.amber, '#7a5200', 1.5) + t(X(st.E), base + 38, 'E(X) = ' + fx(st.E, 2), { weight: 700 });
      s += l(X(st.simple), 22, X(st.simple), base, COL.red, 1.5, '4 3') + t(X(st.simple), 16, '단순 평균 ' + fx(st.simple, 2), { size: 10, fill: COL.red });
      return s;
    },
    omitted: '게임 참가비·세금 등은 생략했습니다. 기댓값은 “아주 많이 되풀이했을 때”의 평균이며, 한 번의 결과가 기댓값과 같다는 뜻은 아닙니다. 3D 시소의 막대 높이는 확률에 비례합니다.',
    legend: [[COL.blue, '1점'], [COL.green, '2점'], [COL.red, 'a점'], [COL.amber, '받침점']],
    apply: {
      q: '확률변수 X의 평균이 5, 분산이 4일 때, 확률변수 Y = 3X − 2의 분산 V(Y)는 얼마일까요?',
      options: [
        { t: '10', ok: false, why: '3×4−2입니다. 분산에는 상수항(−2)이 영향을 주지 않고, 곱해지는 수도 제곱으로 들어갑니다.' },
        { t: '12', ok: false, why: '3×4입니다. 분산은 값이 흩어진 정도를 “제곱”으로 잰 것이어서 3이 아니라 3²을 곱합니다.' },
        { t: '13', ok: false, why: '이것은 평균 E(Y)=3×5−2=13입니다. 분산을 묻는 문제이므로 다른 공식을 씁니다.' },
        { t: '36', ok: true, why: 'V(aX+b)=a²V(X)입니다. V(3X−2)=3²×4=36(표준편차는 3×2=6)입니다.' }
      ]
    },
    build3d: function (X) {
      var T = X.T, H = X.H, g = X.g, sx = 0.62, off = -5, A = 10, st = stats11(10);
      var beam = new T.Group(); g.add(beam);
      var bm = H.box(16 * sx + 0.8, 0.22, 1.5, '#cfa96a'); beam.add(bm);
      var ws = [], wl = [], cols = [COL.blue, COL.green, COL.red];
      for (var i = 0; i < 3; i++) { var w = H.box(0.7, 1, 0.9, cols[i]); beam.add(w); ws.push(w); var d = H.dyn({ size: 0.7 }); beam.add(d.sprite); wl.push(d); }
      var cone = H.cone(0.75, 1.5, COL.amber, { emissive: '#7a5200' }); cone.position.y = -0.95; g.add(cone);
      var post = H.box(0.08, 3, 0.08, COL.red); g.add(post);
      var pl = H.label('단순 평균', { size: 0.7 }); g.add(pl);
      var el = H.label('E(X)', { size: 0.8 }); g.add(el);
      var floor = H.box(12, 0.1, 2.2, '#d9d2bf'); floor.position.y = -1.75; g.add(floor);
      function W(u) { return off + u * sx; }
      function layout(pivotU) {
        var pw = W(pivotU), ang = -clamp((st.E - pivotU) * 0.12, -0.45, 0.45), xs = [1, 2, A], ps = [1 / 2, 1 / 3, 1 / 6];
        beam.position.set(pw, 0, 0); beam.rotation.z = ang; bm.position.x = W(8) - pw;
        for (var i = 0; i < 3; i++) {
          var h = ps[i] * 4.2 + 0.05; ws[i].scale.y = h; ws[i].position.set(W(xs[i]) - pw, 0.11 + h / 2, 0);
          wl[i].sprite.position.set(W(xs[i]) - pw, 0.11 + h + 0.6, 0); wl[i].set(xs[i] + '점');
        }
        cone.position.x = pw; el.position.set(pw, -2.5, 0.8);
      }
      return {
        cam: { theta: 0.1, phi: 1.25, r: 17, t: [0, 0.8, 0] },
        update: function (a) {
          A = a; st = stats11(a);
          post.position.set(W(st.simple), -0.2, 0.9); pl.position.set(W(st.simple), 1.7, 0.9);
          layout(st.E);
        },
        tick: function (time) { var u = 0.5 + 0.5 * Math.cos(time * 0.7), s = u * u * (3 - 2 * u); layout(st.simple + (st.E - st.simple) * s); }
      };
    }
  });

  /* ───────── 12. 이항분포 ───────── */
  LESSONS.push({
    id: 'bin', unit: UNIT, title: '이항분포', concept: 'X ~ B(n, p)이면 E(X)=np, V(X)=np(1−p)',
    source: '교과서 Ⅲ-3 이항분포',
    terms: [['이항분포 B(n, p)', '성공 확률이 p인 독립시행을 n번 할 때 성공 횟수 X의 확률분포'], ['E(X)=np', '평균은 (시행 횟수)×(성공 확률)'], ['V(X)=npq', 'q=1−p']],
    situation: '갈톤 보드(못 판)에서 구슬이 못에 부딪힐 때마다 <b>오른쪽으로 갈 확률이 p</b>, 왼쪽은 1−p입니다. 못 10단을 지나 오른쪽으로 간 횟수 X(0~10)에 해당하는 칸에 구슬이 모입니다. 즉 X는 이항분포 B(10, p)를 따릅니다.',
    predict: {
      q: '오른쪽으로 갈 확률이 p=0.7일 때, 구슬이 가장 많이 모이는 칸은 어디일까요? (칸 번호는 오른쪽으로 간 횟수 0~10)',
      options: [
        { t: '5번 칸', ok: false, why: '5번 칸은 p=0.5일 때 가장 많이 모이는 칸입니다. 오른쪽으로 갈 확률이 더 크므로 분포가 오른쪽으로 치우칩니다.' },
        { t: '3번 칸', ok: false, why: '3번 칸은 p=0.3일 때의 중심입니다. 왼쪽과 오른쪽을 반대로 생각했습니다.' },
        { t: '7번 칸', ok: true, why: '평균 E(X)=np=10×0.7=7이고, 이때 확률 P(X=7)이 가장 큽니다. 분포는 7번 칸을 중심으로 한 종 모양입니다.' },
        { t: '모든 칸에 고르게', ok: false, why: '매번 같은 확률로 독립적으로 갈라지는 경우, 중심 근처의 칸에 집중되고 양 끝으로 갈수록 매우 드물어집니다.' }
      ]
    },
    slider: { label: '오른쪽으로 갈 확률 p', min: 1, max: 9, step: 1, value: 5, fmt: function (v) { return 'p = ' + (v / 10).toFixed(1); } },
    needsSeed: true,
    calc: function (v) {
      var p = v / 10, n = 10, mode = 0, best = -1, k;
      for (k = 0; k <= n; k++) { var pr = MX.binom(n, p, k); if (pr > best + 1e-12) { best = pr; mode = k; } }
      return [['확률변수 X의 분포', 'B(10, ' + p.toFixed(1) + ')'], ['평균 E(X) = np', fx(n * p, 2), 1], ['분산 V(X) = np(1−p)', fx(n * p * (1 - p), 2)], ['표준편차 σ(X)', fx(Math.sqrt(n * p * (1 - p)), 3)], ['가장 확률이 큰 칸 (그때 확률)', mode + '번 칸 (' + fx(best, 4) + ')']];
    },
    svgAlt: '이항분포 B(10, p)의 확률 막대 그래프와 평균 위치',
    svg: function (v) {
      var p = v / 10, s = '', base = 175, sc = 380;
      s += l(24, base, 396, base);
      for (var k = 0; k <= 10; k++) {
        var P = MX.binom(10, p, k), h = P * sc, x = 34 + k * 33;
        s += r_(x, base - h, 24, h, '#4f8fdc') + t(x + 12, base + 15, k, { size: 11 });
        if (P > 0.02) s += t(x + 12, base - h - 4, fx(P, 2), { size: 9 });
      }
      var mx = 34 + 10 * p * 33 + 12;
      s += l(mx, 25, mx, base, COL.red, 2, '4 3') + t(mx, 18, 'E(X) = np = ' + fx(10 * p, 1), { fill: COL.red, weight: 700, size: 11 });
      return s;
    },
    omitted: '못 사이의 충돌·마찰·구슬 크기는 생략하고 매 단 독립시행으로 가정했습니다. 3D의 구슬은 컴퓨터가 정한 난수로 떨어지며, 칸의 높이는 (칸에 모인 구슬 수)÷(전체 구슬 수)인 상대도수입니다. 노란 윤곽은 이론값 P(X=k)입니다.',
    actions: [{ label: '구슬 다시 떨어뜨리기', seedStep: true }],
    legend: [['#4f8fdc', '실제로 모인 비율(상대도수)'], [COL.amber, '이론값 P(X=k)']],
    apply: {
      q: '어느 선수가 서브를 한 번 할 때 득점할 확률이 0.2이고, 서브를 100번 한다고 합니다. 득점 횟수 X의 표준편차 σ(X)는 얼마일까요?',
      options: [
        { t: '4', ok: true, why: 'X는 B(100, 0.2)를 따릅니다. V(X)=100×0.2×0.8=16이므로 σ(X)=√16=4입니다.' },
        { t: '16', ok: false, why: '이것은 분산 V(X)입니다. 표준편차는 분산의 양의 제곱근이므로 √16=4입니다.' },
        { t: '20', ok: false, why: '이것은 평균 E(X)=np=100×0.2입니다. 표준편차는 흩어진 정도를 나타내는 다른 값입니다.' },
        { t: '80', ok: false, why: '100×0.8입니다. 1−p의 값 0.8을 np에 곱해 버렸습니다. 분산은 n·p·(1−p)로 세 수를 모두 곱합니다.' }
      ]
    },
    build3d: function (X) {
      var T = X.T, H = X.H, g = X.g, N = 10, DY = 0.8, DX = 0.4, p = 0.5, rs = MX.rng(1), counts = [], total = 0, spawnT = 0;
      var pegs = new T.InstancedMesh(new T.SphereGeometry(0.09, 10, 8), H.mat('#6b7280'), 55), m4 = new T.Matrix4(), q = 0;
      for (var i = 0; i < N; i++) for (var j = 0; j <= i; j++) { m4.setPosition((2 * j - i) * DX, 9 - i * DY, 0); pegs.setMatrixAt(q++, m4); }
      g.add(pegs);
      var floor = H.box(10.5, 0.1, 1.2, '#d9d2bf'); floor.position.y = -0.05; g.add(floor);
      var bars = [], theo = [], cur = [];
      var edge = new T.EdgesGeometry(new T.BoxGeometry(1, 1, 1));
      for (var k = 0; k <= N; k++) {
        var b = H.box(0.7, 1, 0.7, '#4f8fdc'); b.position.set((k - 5) * 0.8, 0.5, 0); g.add(b); bars.push(b); cur.push(0);
        var e = new T.LineSegments(edge, new T.LineBasicMaterial({ color: COL.amber })); g.add(e); theo.push(e);
        var kl = H.label(String(k), { size: 0.6 }); kl.position.set((k - 5) * 0.8, -0.55, 0.4); g.add(kl);
      }
      var cl = H.dyn({ size: 0.8 }); cl.sprite.position.set(0, 10.8, 0); g.add(cl.sprite);
      var balls = [], POOL = 36;
      for (var z = 0; z < POOL; z++) { var bl = H.sph(0.16, COL.red); bl.visible = false; g.add(bl); balls.push({ m: bl, age: 0, path: null, on: false }); }
      var FREQ = 12;
      function reset(env) {
        rs = MX.rng(env.seed * 97 + 13); total = 0; spawnT = 0;
        for (var k = 0; k <= N; k++) { counts[k] = 0; }
        balls.forEach(function (b) { b.on = false; b.m.visible = false; });
        cl.set('구슬 0개');
      }
      function xs(path, s) { var sum = 0; for (var i = 0; i < s; i++) sum += path[i] ? 1 : -1; return sum * DX; }
      return {
        cam: { theta: 0.0, phi: 1.3, r: 19.5, t: [0, 5.2, 0] },
        update: function (v, env) {
          p = v / 10; reset(env);
          for (var k = 0; k <= N; k++) { var h = Math.max(MX.binom(N, p, k) * FREQ, 0.03); theo[k].scale.set(0.75, h, 0.75); theo[k].position.set((k - 5) * 0.8, h / 2, 0); }
        },
        tick: function (time, dt) {
          if (dt > 0 && total < 1200) {
            spawnT += dt;
            while (spawnT > 0.13) {
              spawnT -= 0.13;
              var fb = null; for (var i = 0; i < POOL; i++) if (!balls[i].on) { fb = balls[i]; break; }
              if (!fb) break;
              fb.on = true; fb.age = 0; fb.path = []; for (var s = 0; s < N; s++) fb.path.push(rs() < p); fb.m.visible = true;
            }
          }
          balls.forEach(function (b) {
            if (!b.on) return;
            b.age += dt; var u = b.age / 2.0 * N, i = Math.min(Math.floor(u), N - 1), f = Math.min(u - i, 1), e = f * f * (3 - 2 * f);
            if (u >= N) { var kk = 0; b.path.forEach(function (r) { if (r) kk++; }); counts[kk]++; total++; b.on = false; b.m.visible = false; if (total % 3 === 0) cl.set('구슬 ' + total + '개'); return; }
            var x0 = xs(b.path, i), x1 = xs(b.path, i + 1), y0 = i === 0 ? 9.7 : 9 - i * DY + 0.18, y1 = i + 1 >= N ? 1.2 : 9 - (i + 1) * DY + 0.18;
            b.m.position.set(x0 + (x1 - x0) * e, y0 + (y1 - y0) * f + 0.12 * Math.sin(Math.PI * f), 0.05);
          });
          var k2 = dt > 0 ? 1 - Math.exp(-dt * 8) : 1;
          for (var k = 0; k <= N; k++) {
            var target = total ? counts[k] / total * FREQ : 0; cur[k] += (target - cur[k]) * k2;
            var h = Math.max(cur[k], 0.02); bars[k].scale.y = h; bars[k].position.y = h / 2;
          }
        }
      };
    }
  });

  /* ───────── 13. 정규분포 ───────── */
  var M13 = 60;
  function bandX(m, s) { return [[-9, -3, '#c9cdd4'], [-3, -2, COL.amber], [-2, -1, COL.green], [-1, 1, COL.blue], [1, 2, COL.green], [2, 3, COL.amber], [3, 9, '#c9cdd4']].map(function (b) { return [m + b[0] * s, m + b[1] * s, b[2]]; }); }
  LESSONS.push({
    id: 'norm', unit: UNIT, title: '정규분포', concept: '확률변수 X가 N(m, σ²)을 따를 때 Z = (X−m)/σ는 N(0, 1)을 따른다',
    source: '교과서 Ⅲ-4 정규분포',
    terms: [['확률밀도함수', '곡선과 x축 사이의 넓이가 확률이 되는 함수 f(x)'], ['정규분포 N(m, σ²)', '평균 m, 표준편차 σ인 종 모양 분포'], ['표준정규분포 N(0, 1)', '평균 0, 표준편차 1인 정규분포. Z=(X−m)/σ로 바꿔서 확률을 구함']],
    situation: '전교생의 수학 점수 X(가상의 자료)가 평균 m=60점, 표준편차 σ점인 정규분포 N(60, σ²)을 따른다고 합시다. 종 모양 곡선과 x축 사이의 <b>넓이가 확률</b>입니다. 슬라이더로 σ를 바꿔 모양을 관찰하세요.',
    predict: {
      q: '표준편차 σ를 5에서 10으로 두 배로 키우면, 곡선과 x축 사이의 전체 넓이는 어떻게 될까요?',
      options: [
        { t: '2배로 커진다', ok: false, why: '곡선이 옆으로 넓게 퍼지지만 그만큼 낮아집니다. 넓이가 커지는 것이 아닙니다.' },
        { t: '절반으로 줄어든다', ok: false, why: '곡선이 낮아져도 양옆으로 퍼진 만큼 넓이가 보충됩니다. 줄어들지 않습니다.' },
        { t: '곡선이 높아지므로 더 커진다', ok: false, why: 'σ가 커지면 곡선은 높아지는 것이 아니라 낮아지면서 양쪽으로 퍼집니다(σ가 작아지면 높고 뾰족해짐).' },
        { t: '그대로 1이다', ok: true, why: '곡선과 x축 사이의 전체 넓이는 확률의 총합이므로 σ에 관계없이 항상 1입니다. σ가 커지면 낮아지고 넓어져서 넓이가 보존됩니다.' }
      ]
    },
    slider: { label: '표준편차 σ', min: 5, max: 15, step: 1, value: 5, fmt: function (v) { return 'σ = ' + v + '점'; } },
    calc: function (s) {
      var z = 10 / s;
      return [['정규분포', 'N(60, ' + s + '²)'], ['곡선의 최고 높이 f(m) = 1/(σ√2π)', fx(MX.pdf(60, 60, s), 4)], ['곡선과 x축 사이의 전체 넓이', '1 (σ에 관계없이)', 1], ['P(m−σ ≤ X ≤ m+σ)', fx(Phi(1) - Phi(-1), 4)], ['P(m−2σ ≤ X ≤ m+2σ)', fx(Phi(2) - Phi(-2), 4)], ['P(X ≥ 70) = P(Z ≥ ' + fx(z, 2) + ')', fx(1 - Phi(z), 4)]];
    },
    svgAlt: '평균 60, 표준편차 σ인 정규분포 곡선과 ±1σ, ±2σ, ±3σ 구간',
    svg: function (s) {
      var m = M13, X = function (x) { return 30 + (x - 20) / 80 * 360; }, Y = function (y) { return 190 - y * 1800; }, out = '';
      bandX(m, s).forEach(function (b) {
        var x1 = Math.max(b[0], 20), x2 = Math.min(b[1], 100); if (x2 <= x1) return;
        var d = 'M' + X(x1) + ',190', n = 30;
        for (var i = 0; i <= n; i++) { var x = x1 + (x2 - x1) * i / n; d += ' L' + X(x) + ',' + Y(MX.pdf(x, m, s)); }
        d += ' L' + X(x2) + ',190 Z'; out += p_(d, b[2], 'none', 0, 0.85);
      });
      out += l(26, 190, 394, 190);
      [-2, -1, 0, 1, 2].forEach(function (k) { var x = m + k * s; if (x >= 20 && x <= 100) out += l(X(x), 190, X(x), 195) + t(X(x), 208, x, { size: 10 }); });
      out += t(210, 18, 'N(60, ' + s + '²)  ·  m=60 에서 가장 높다', { weight: 700 });
      return out;
    },
    omitted: '실제 점수는 0~100점의 정수이므로 정규분포는 근삿값입니다. 곡선은 양쪽 끝이 x축에 한없이 가까워지지만 닿지는 않습니다(그림은 20~100점만 표시). 표준정규분포표(소수 넷째 자리)로 구한 값은 0.3413×2=0.6826처럼 계산값 0.6827과 반올림 차이가 날 수 있습니다.',
    legend: [[COL.blue, 'm ± σ (약 68%)'], [COL.green, 'σ ~ 2σ'], [COL.amber, '2σ ~ 3σ'], [COL.red, 'X ≥ 70']],
    apply: {
      q: '확률변수 X가 정규분포 N(60, 4²)을 따를 때, P(56 ≤ X ≤ 68)은 얼마일까요? (P(0≤Z≤1)=0.3413, P(0≤Z≤2)=0.4772)',
      options: [
        { t: '0.6826', ok: false, why: '이것은 P(−1 ≤ Z ≤ 1)입니다. 68은 평균에서 +2σ(8점) 위이므로 오른쪽 끝이 Z=2가 되어야 합니다.' },
        { t: '0.8185', ok: true, why: 'Z=(X−60)/4로 바꾸면 56→−1, 68→2입니다. P(−1≤Z≤2)=P(0≤Z≤1)+P(0≤Z≤2)=0.3413+0.4772=0.8185입니다.' },
        { t: '0.9544', ok: false, why: '이것은 P(−2 ≤ Z ≤ 2), 즉 평균 양쪽 2σ 구간입니다. 56은 평균에서 1σ 아래에 있으므로 구간이 대칭이 아닙니다.' },
        { t: '0.8413', ok: false, why: '0.5+0.3413=P(Z≤1)입니다. 구간의 한쪽 끝(Z=2)까지 고려하지 않았습니다.' }
      ]
    },
    build3d: function (X) {
      var T = X.T, H = X.H, g = X.g, holder = new T.Group(), SCX = 0.2, SCY = 60, labs = [];
      g.add(holder);
      var floor = H.box(12.6, 0.1, 2.5, '#d9d2bf'); floor.position.y = -0.05; g.add(floor);
      for (var i = 0; i < 7; i++) { var d = H.dyn({ size: 0.7 }); g.add(d.sprite); labs.push(d); }
      function shape(x1, x2, s, m) {
        var sh = new T.Shape(), n = 40, i;
        sh.moveTo((x1 - 60) * SCX, 0);
        for (i = 0; i <= n; i++) { var x = x1 + (x2 - x1) * i / n; sh.lineTo((x - 60) * SCX, MX.pdf(x, m, s) * SCY); }
        sh.lineTo((x2 - 60) * SCX, 0); sh.closePath(); return sh;
      }
      return {
        cam: { theta: 0.3, phi: 1.2, r: 15, t: [0, 1.9, 0] },
        update: function (s) {
          H.clear(holder);
          bandX(M13, s).forEach(function (b) {
            var x1 = Math.max(b[0], 30), x2 = Math.min(b[1], 90); if (x2 <= x1) return;
            var geo = new T.ExtrudeGeometry(shape(x1, x2, s, M13), { depth: 0.9, bevelEnabled: false }), mesh = new T.Mesh(geo, H.mat(b[2])); mesh.position.z = -0.45; holder.add(mesh);
          });
          var x1 = 70, x2 = 90, geo2 = new T.ExtrudeGeometry(shape(x1, x2, s, M13), { depth: 0.25, bevelEnabled: false }), m2 = new T.Mesh(geo2, H.mat(COL.red, { transparent: true, opacity: 0.8, emissive: '#5a1a08' })); m2.position.z = 0.5; holder.add(m2);
          [-3, -2, -1, 0, 1, 2, 3].forEach(function (k, i) {
            var x = M13 + k * s, lb = labs[i]; if (x < 30 || x > 90) { lb.sprite.visible = false; return; }
            lb.sprite.visible = true; lb.sprite.position.set((x - 60) * SCX, -0.65, 0.8); lb.set(String(x));
          });
        }
      };
    }
  });

  /* ───────── 14. 표본평균의 분포 ───────── */
  var simCache = {};
  function sim14(seed, n) {
    var key = seed + '|' + n; if (simCache[key]) return simCache[key];
    var R = MX.rng(seed * 31 + 5), bins = []; for (var i = 0; i < 21; i++) bins.push(0);
    var sum = 0, sum2 = 0, T = 2000;
    for (var s = 0; s < T; s++) {
      var tot = 0; for (var j = 0; j < n; j++) tot += 1 + Math.floor(R() * 6);
      var mean = tot / n; sum += mean; sum2 += mean * mean;
      bins[clamp(Math.round((mean - 1) / 0.25), 0, 20)]++;
    }
    var mu = sum / T, sd = Math.sqrt(sum2 / T - mu * mu);
    simCache[key] = { bins: bins, mean: mu, sd: sd, T: T };
    return simCache[key];
  }
  var SIG14 = Math.sqrt(35 / 12);
  LESSONS.push({
    id: 'xbar', unit: UNIT, title: '표본평균의 분포', concept: 'E(X̄)=m, σ(X̄)=σ/√n',
    source: '교과서 Ⅲ-5 모집단과 표본 (표본평균의 분포)',
    terms: [['모집단', '조사하려는 전체 대상'], ['표본', '모집단에서 뽑은 일부'], ['표본평균 X̄', '표본의 평균. 표본을 뽑을 때마다 달라지는 확률변수'], ['임의추출', '모집단의 각 대상이 같은 가능성으로 뽑히게 하는 추출']],
    situation: '공정한 주사위를 한 번 던져 나온 눈이 모집단의 값입니다(모평균 m=3.5, 모표준편차 σ=√(35/12)≈1.708). 주사위를 <b>n번 던져 눈의 평균(표본평균 X̄)</b>을 구하는 일을 2000번 되풀이하면, X̄의 값들은 어떤 모양으로 흩어질까요?',
    predict: {
      q: '던지는 횟수(표본의 크기)를 n=1에서 n=25로 늘리면, 표본평균 X̄의 값들이 흩어진 정도(표준편차)는 어떻게 될까요?',
      options: [
        { t: '그대로이다', ok: false, why: '표본이 클수록 우연히 큰 눈이나 작은 눈이 평균에서 서로 상쇄되어 X̄가 모평균 근처에 더 잘 모입니다.' },
        { t: '5배로 커진다', ok: false, why: '반대 방향입니다. 표본이 커질수록 X̄는 더 안정적으로 모평균 근처에 모입니다.' },
        { t: '1/25로 줄어든다', ok: false, why: '표준편차는 n이 아니라 √n에 반비례합니다. n=25이면 √25=5이므로 1/5입니다.' },
        { t: '1/5로 줄어든다', ok: true, why: 'σ(X̄)=σ/√n입니다. n이 1에서 25로 늘면 √n이 1에서 5로 늘어 표준편차는 1/5이 됩니다.' }
      ]
    },
    slider: { label: '표본의 크기 n (던지는 횟수)', min: 1, max: 30, step: 1, value: 1, fmt: function (v) { return 'n = ' + v; } },
    needsSeed: true,
    calc: function (n, env) {
      var s = sim14(env.seed, n);
      return [['모평균 m / 모표준편차 σ', '3.5 / ' + fx(SIG14, 3)], ['E(X̄) = m', '3.5'], ['σ(X̄) = σ/√n', fx(SIG14 / Math.sqrt(n), 3), 1], ['모의실험(2000번)의 X̄ 평균', fx(s.mean, 3)], ['모의실험(2000번)의 X̄ 표준편차', fx(s.sd, 3)]];
    },
    svgAlt: '주사위 n번 평균의 모의실험 히스토그램과 정규분포 곡선',
    svg: function (n, env) {
      var s = sim14(env.seed, n), out = '', base = 178, X = function (x) { return 30 + (x - 0.875) / 5.25 * 360; }, scale = 150, i;
      for (i = 0; i <= 20; i++) { var dens = s.bins[i] / (s.T * 0.25), h = dens * scale; out += r_(X(1 + i * 0.25 - 0.125), base - h, 360 / 21 - 1, h, '#4f8fdc'); }
      var pts = [], sd = SIG14 / Math.sqrt(n); for (i = 0; i <= 120; i++) { var x = 0.875 + 5.25 * i / 120; pts.push(X(x) + ',' + (base - MX.pdf(x, 3.5, sd) * scale)); }
      out += '<polyline points="' + pts.join(' ') + '" fill="none" stroke="' + COL.amber + '" stroke-width="2.5"/>';
      out += l(26, base, 394, base);
      for (i = 1; i <= 6; i++) out += t(X(i), base + 15, i, { size: 10 });
      out += t(210, 16, 'n = ' + n + ' · 표본평균 X̄의 분포 (주황: N(3.5, σ²/n))', { size: 11, weight: 700 });
      return out;
    },
    omitted: '2000번의 모의실험은 표본평균의 분포를 근사한 것입니다(같은 시작값이면 같은 결과). 주사위는 공정하고 던질 때마다 서로 영향을 주지 않는 것으로 가정합니다. 막대의 넓이는 상대도수에 맞춰 그렸습니다(높이=밀도).',
    actions: [{ label: '2000번 다시 해 보기', seedStep: true }],
    legend: [['#4f8fdc', '모의실험 X̄의 분포'], [COL.amber, '이론 곡선 N(3.5, σ²/n)'], [COL.gray, '모집단(주사위 한 번)']],
    apply: {
      q: '모집단이 정규분포 N(50, 10²)을 따른다. 크기가 25인 표본을 임의추출할 때, 표본평균 X̄가 52 이상일 확률은 얼마일까요? (P(0≤Z≤1)=0.3413)',
      options: [
        { t: '0.4207', ok: false, why: '표준편차를 σ=10 그대로 써서 Z=(52−50)/10=0.2로 계산한 값입니다. 표본평균의 표준편차는 σ/√n=10/5=2입니다.' },
        { t: '0.3413', ok: false, why: 'P(0≤Z≤1)입니다. 52 이상이면 평균 위쪽 전체(0.5)에서 이 값을 빼야 합니다.' },
        { t: '0.1587', ok: true, why: 'X̄는 N(50, 2²)을 따르므로 Z=(X̄−50)/2입니다. P(X̄≥52)=P(Z≥1)=0.5−0.3413=0.1587입니다.' },
        { t: '0.8413', ok: false, why: '이것은 P(Z≤1)=P(X̄≤52)입니다. 문제는 “52 이상”을 묻고 있습니다.' }
      ]
    },
    build3d: function (X) {
      var T = X.T, H = X.H, g = X.g, bars = [], cur = [], tgt = [], SC = 3.2;
      /* 뒤: X̄의 분포(빛나는 파랑 막대 + 주황 이론 곡선), 앞: 모집단(주사위 한 번 — 1~6이 똑같이 1/6)의 낮은 블록.
         2차는 모집단 블록이 막대 뒤에 있어 가려지고 섞여 보였음 */
      var floor = H.box(11.5, 0.1, 1.6, '#e9e4d8'); floor.position.set(0, -0.05, 0); g.add(floor);
      for (var i = 0; i < 21; i++) { var b = H.box(0.46, 1, 0.8, '#4f8fdc'); b.position.set((i - 10) * 0.52, 0.5, 0); g.add(b); bars.push(b); cur.push(0); tgt.push(0); }
      var pfloor = H.box(11.5, 0.08, 1.4, '#e9e4d8'); pfloor.position.set(0, -0.04, 2.4); g.add(pfloor);
      for (var k = 1; k <= 6; k++) {
        var lb = H.label(String(k), { size: 0.6 }); lb.position.set(((k - 1) * 4 - 10) * 0.52, 0.85, 3.2); g.add(lb);
        var pb = H.box(1.2, 0.45, 0.9, '#b8b4ac'); pb.position.set(((k - 1) * 4 - 10) * 0.52, 0.225, 2.4); g.add(pb);
      }
      var pl = H.label('모집단: 주사위 한 번(1~6 각 1/6)', { size: 0.7 }); pl.position.set(0, 1.5, 3.2); g.add(pl);
      var curve = new T.Line(new T.BufferGeometry(), new T.LineBasicMaterial({ color: COL.amber })); g.add(curve);
      return {
        cam: { theta: 0.3, phi: 1.2, r: 15, t: [0, 1.3, -0.5], bookPhi: 0.9 },
        update: function (n, env) {
          var s = sim14(env.seed, n), pts = [], i;
          for (i = 0; i <= 20; i++) tgt[i] = s.bins[i] / (s.T * 0.25) * SC;
          var sd = SIG14 / Math.sqrt(n);
          for (i = 0; i <= 120; i++) { var x = 0.875 + 5.25 * i / 120; pts.push(new T.Vector3((x - 3.5) / 0.25 * 0.52, MX.pdf(x, 3.5, sd) * SC + 0.05, 0.5)); }
          curve.geometry.setFromPoints(pts);
        },
        tick: function (time, dt) {
          var k = dt > 0 ? 1 - Math.exp(-dt * 6) : 1;
          for (var i = 0; i <= 20; i++) { cur[i] += (tgt[i] - cur[i]) * k; var h = Math.max(cur[i], 0.02); bars[i].scale.y = h; bars[i].position.y = h / 2; }
        }
      };
    }
  });

  /* ───────── 15. 모평균의 추정 ───────── */
  function z15(seed) { var R = MX.rng(seed * 53 + 11), a = []; for (var i = 0; i < 100; i++) a.push(MX.normal(R)); return a; }
  LESSONS.push({
    id: 'ci', unit: UNIT, title: '모평균의 추정과 신뢰구간', concept: '신뢰도 95%: x̄ − 1.96·σ/√n ≤ m ≤ x̄ + 1.96·σ/√n',
    source: '교과서 Ⅲ-6 모평균의 추정',
    terms: [['모평균 m', '모집단의 평균. 보통 알 수 없어서 추정한다'], ['추정', '표본으로 모집단의 값을 어림잡는 일'], ['신뢰구간', '모평균을 포함할 것으로 기대하는 구간'], ['신뢰도 95%', '표본을 여러 번 뽑아 구간을 만들면 그중 약 95%가 모평균을 포함한다는 뜻']],
    situation: '모표준편차가 σ=10인 정규분포 모집단에서 크기 n의 표본을 뽑아 표본평균 x̄를 구하고, 모평균 m의 신뢰도 95% 신뢰구간 <b>x̄ ± 1.96·σ/√n</b>을 만듭니다. 이 일을 100번 되풀이한 결과가 3D에 줄지어 있습니다. (실제 모평균은 50이지만, 연구자는 모른다고 가정합니다.)',
    predict: {
      q: '표본의 크기를 n=25에서 n=100으로 4배로 늘리면, 신뢰도 95% 신뢰구간의 길이는 어떻게 될까요?',
      options: [
        { t: '4배로 길어진다', ok: false, why: '표본이 클수록 정보가 많아 구간은 짧아집니다. 길이는 σ/√n에 비례합니다.' },
        { t: '2배로 길어진다', ok: false, why: '방향이 반대입니다. n이 커지면 √n이 커져 구간의 길이 2×1.96σ/√n은 짧아집니다.' },
        { t: '절반으로 짧아진다', ok: true, why: '길이 2×1.96×σ/√n에서 n이 4배가 되면 √n은 2배가 되어 길이는 1/2이 됩니다. (n=25: 7.84, n=100: 3.92)' },
        { t: '1/4로 짧아진다', ok: false, why: '길이는 n이 아니라 √n에 반비례합니다. n이 4배이면 √n은 2배이므로 1/2입니다.' }
      ]
    },
    slider: { label: '표본의 크기 n', min: 4, max: 100, step: 1, value: 25, fmt: function (v) { return 'n = ' + v; } },
    needsSeed: true,
    calc: function (n, env) {
      var z = z15(env.seed), miss = z.filter(function (q) { return Math.abs(q) > 1.96; }).length, half = 1.96 * 10 / Math.sqrt(n);
      return [['x̄의 표준편차 σ/√n', fx(10 / Math.sqrt(n), 3)], ['구간의 길이 2×1.96×σ/√n', fx(2 * half, 3), 1], ['100개 중 모평균 m=50을 포함한 구간', (100 - miss) + '개'], ['포함하지 않은 구간(빨강)', miss + '개']];
    },
    svgAlt: '표본마다 만든 신뢰구간 100개와 모평균을 나타내는 세로선',
    svg: function (n, env) {
      var z = z15(env.seed), half = 1.96 * 10 / Math.sqrt(n), X = function (x) { return 30 + (x - 30) / 40 * 360; }, s = '';
      z.forEach(function (q, i) {
        var xb = 50 + 10 * q / Math.sqrt(n), ok = Math.abs(xb - 50) <= half, y = 22 + i * 1.75;
        var a = clamp(xb - half, 30, 70), b = clamp(xb + half, 30, 70);
        s += l(X(a), y, X(b), y, ok ? COL.teal : COL.red, 1.3);
      });
      s += l(X(50), 14, X(50), 202, COL.amber, 2) + t(X(50), 12, '모평균 m = 50', { size: 10, weight: 700 });
      return s;
    },
    omitted: '실제로는 모평균을 모르고 구간 하나만 얻습니다. 신뢰도 95%는 “이 구간이 95% 확률로 m을 포함한다”가 아니라, 여러 번 구했을 때 약 95%의 구간이 m을 포함한다는 뜻입니다. 모집단이 정규분포이고 모표준편차를 아는 경우입니다. 표본 100개는 컴퓨터 난수입니다.',
    actions: [{ label: '새 표본 100개 뽑기', seedStep: true }],
    legend: [[COL.teal, 'm을 포함한 구간'], [COL.red, 'm을 포함하지 않은 구간'], [COL.amber, '모평균 m']],
    apply: {
      q: '모표준편차가 6인 정규분포를 따르는 모집단에서 크기가 36인 표본을 임의추출하여 구한 표본평균이 70이었습니다. 모평균 m의 신뢰도 95% 신뢰구간은 어느 것일까요? (1.96 사용)',
      options: [
        { t: '58.24 ≤ m ≤ 81.76', ok: false, why: '표준편차 6을 그대로 써서 70±1.96×6을 구한 것입니다. 표본평균의 표준편차 σ/√n=6/6=1을 써야 합니다.' },
        { t: '67.42 ≤ m ≤ 72.58', ok: false, why: '신뢰도 99%에 쓰는 2.58을 곱한 값(70±2.58×1)입니다. 95%에서는 1.96을 씁니다.' },
        { t: '69.67 ≤ m ≤ 70.33', ok: false, why: 'σ/√n 대신 σ/n=6/36을 쓴 값입니다. 표본의 크기에는 제곱근을 씌워야 합니다.' },
        { t: '68.04 ≤ m ≤ 71.96', ok: true, why: 'σ/√n=6/√36=1이므로 70−1.96×1 ≤ m ≤ 70+1.96×1, 곧 68.04 ≤ m ≤ 71.96입니다.' }
      ]
    },
    /* 3D: 교과서 그림처럼 구간 100개를 책장 위에 눕혀 앞뒤로 줄 세우고, 모평균은 가운데에 세운 얇은 벽, 앞에는 눈금자 */
    build3d: function (X) {
      var T = X.T, H = X.H, g = X.g, bars = [], SC = 0.26, DZ = 0.088, Z0 = -4.4, Z = z15(1), ZE = Z0 + 99 * DZ;
      var sheet = H.box(40 * SC + 0.6, 0.03, ZE - Z0 + 0.6, '#f1ece0'); sheet.position.set(0, 0.015, (Z0 + ZE) / 2); g.add(sheet);
      for (var i = 0; i < 100; i++) { var b = H.box(1, 0.05, 0.062, COL.teal); b.position.set(0, 0.07, Z0 + i * DZ); g.add(b); bars.push(b); }
      var wall = H.box(0.05, 0.75, ZE - Z0 + 0.5, COL.amber, { transparent: true, opacity: 0.55 }); wall.position.set(0, 0.4, (Z0 + ZE) / 2); g.add(wall);
      var ml = H.label('모평균 m = 50', { size: 0.7 }); ml.position.set(0, 1.15, Z0 - 0.4); g.add(ml);
      var ruler = H.box(40 * SC + 0.4, 0.05, 0.3, '#e3dccb'); ruler.position.set(0, 0.025, ZE + 0.75); g.add(ruler);
      [30, 40, 50, 60, 70].forEach(function (v) {
        var tk = H.box(0.03, 0.12, 0.3, '#2a2833'); tk.position.set((v - 50) * SC, 0.08, ZE + 0.75); g.add(tk);
        var lb = H.label(String(v), { size: 0.5 }); lb.position.set((v - 50) * SC, 0.5, ZE + 0.95); g.add(lb);
      });
      return {
        cam: { theta: 0.2, phi: 1.0, r: 14, t: [0, 0.5, 0], bookPhi: 0.66 },
        update: function (n, env) {
          Z = z15(env.seed); var half = 1.96 * 10 / Math.sqrt(n);
          bars.forEach(function (b, i) {
            var xb = 50 + 10 * Z[i] / Math.sqrt(n), ok = Math.abs(xb - 50) <= half;
            var a = clamp(xb - half, 30, 70), c = clamp(xb + half, 30, 70);         /* 눈금자 밖은 잘라서 그림(2D와 같음) */
            b.scale.x = Math.max((c - a) * SC, 0.04); b.position.x = ((a + c) / 2 - 50) * SC;
            b.position.y = ok ? 0.07 : 0.15; b.material.color.set(ok ? COL.teal : COL.red);   /* 빗나간 구간은 살짝 띄워 눈에 띄게 */
          });
        }
      };
    }
  });
})();
