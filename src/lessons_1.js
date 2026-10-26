/* lessons_1.js — Ⅰ. 경우의 수 (5개 레슨) */
var LESSONS = (typeof LESSONS === 'undefined') ? [] : LESSONS;
(function () {
  var fact = MX.fact, nCr = MX.nCr, nHr = MX.nHr, t = SV.t, c = SV.c, r_ = SV.r, l = SV.l;
  var SUP = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
  var sup = function (n) { return String(n).split('').map(function (d) { return SUP[+d]; }).join(''); };
  var SUB = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
  var sub = function (n) { return String(n).split('').map(function (d) { return SUB[+d]; }).join(''); };
  var UNIT = 'Ⅰ. 경우의 수';

  /* ───────── 1. 원순열 ───────── */
  LESSONS.push({
    id: 'circ', unit: UNIT, title: '원순열', concept: '서로 다른 n개를 원형으로 배열하는 원순열의 수는 (n−1)!',
    source: 'Ⅰ. 경우의 수 › 순열과 조합 › 원순열',
    terms: [['순열', '서로 다른 n개에서 r개를 택하여 일렬로 나열하는 것'], ['원순열', '서로 다른 것을 원형으로 배열하는 순열. 회전하여 일치하는 것은 같은 것으로 본다']],
    situation: '가족 4명(A·B·C·D)이 둥근 식탁에 둘러앉습니다. 자리에 번호는 없고, 모두 한 칸씩 옆으로 옮겨 앉아도 <b>누구 옆에 누가 앉았는지</b>는 그대로입니다.',
    predict: {
      q: 'A·B·C·D 4명이 원탁에 앉는 서로 다른 방법은 모두 몇 가지일까요?',
      options: [
        { t: '24가지 (4!)', ok: false, why: '4명을 일렬로 세우면 4!=24가지가 맞지만, 원탁에서는 돌려서 겹치는 배열을 같은 것으로 봅니다. 24가지 안에는 같은 배열이 여러 번 들어 있습니다.' },
        { t: '12가지 (4! ÷ 2)', ok: false, why: '한 배열을 돌려서 얻는 같은 배열은 자리 수만큼, 즉 4개입니다. 나누는 수는 2가 아니라 4입니다.' },
        { t: '6가지 (3!)', ok: true, why: '일렬로 세우는 4!가지를 4개씩 한 묶음(회전으로 겹치는 배열)으로 묶으면 4!÷4=3!=6가지입니다. A의 자리를 고정하고 나머지 3명을 줄 세운다고 생각해도 3!입니다.' },
        { t: '4가지', ok: false, why: '4는 한 배열을 돌려서 만들 수 있는 배열의 개수일 뿐, 서로 다른 배열의 수가 아닙니다.' }
      ]
    },
    slider: { label: '사람 수 n', min: 3, max: 8, step: 1, value: 4, fmt: function (v) { return v + '명'; } },
    calc: function (n) {
      return [
        ['일렬로 세우는 방법 n!', fact(n) + '가지'],
        ['돌려서 같아지는 배열', '한 배열당 ' + n + '개'],
        ['원순열의 수 n!÷n = (n−1)!', fact(n - 1) + '가지', 1]
      ];
    },
    svgAlt: '원탁에 앉은 n명의 그림과 원순열 계산식',
    svg: function (n) {
      var cx = 105, cy = 112, R = 70, s = c(cx, cy, 44, '#e9d8bd', { stroke: '#b99a6b', w: 2 });
      for (var i = 0; i < n; i++) {
        var a = -Math.PI / 2 + 2 * Math.PI * i / n, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
        s += c(x, y, 14, i === 0 ? COL.amber : PAL[i % PAL.length], { stroke: i === 0 ? '#7a5200' : 'none', w: 2 }) + t(x, y + 4, String.fromCharCode(65 + i), { fill: '#fff', weight: 700 });
      }
      s += t(cx, cy + 4, '원탁', { size: 12 });
      s += t(220, 70, '일렬로 세우면 ' + n + '! = ' + fact(n), { anchor: 'start' });
      s += t(220, 98, '돌려서 겹치는 ' + n + '가지가 한 묶음', { anchor: 'start' });
      s += t(220, 132, '원순열 = ' + n + '! ÷ ' + n, { anchor: 'start', weight: 700 });
      s += t(220, 156, '= (' + n + '−1)! = ' + fact(n - 1), { anchor: 'start', weight: 700, fill: COL.green });
      s += t(220, 190, '(금색 A를 고정하고 나머지를 줄 세워도 같은 값)', { anchor: 'start', size: 10 });
      return s;
    },
    omitted: '의자 모양·크기와 앉은 방향(앞을 보는지 등)은 생략했습니다. 거울에 비친 배열은 서로 다른 배열로 셉니다. 자리에 번호가 붙어 있으면 돌려도 달라지므로 원순열이 아니라 n!입니다.',
    legend: [[COL.amber, '고정 기준 A']],
    apply: {
      q: '남학생 3명과 여학생 3명이 원탁에 둘러앉을 때, 남녀가 번갈아 앉는 방법은 모두 몇 가지일까요?',
      options: [
        { t: '6가지', ok: false, why: '여학생 3명을 배열하는 3!만 센 값입니다. 남학생 3명이 원탁에 앉는 방법도 곱해야 합니다.' },
        { t: '12가지', ok: true, why: '남학생 3명이 원탁에 앉는 원순열은 (3−1)!=2가지. 그 사이사이 3개의 자리에 여학생 3명을 앉히는 방법은 3!=6가지. 곱의 법칙으로 2×6=12가지입니다.' },
        { t: '36가지', ok: false, why: '3!×3!입니다. 남학생도 일렬로 센 것인데, 원탁에서는 돌려서 겹치는 3가지씩이 같으므로 남학생은 2가지로 세야 합니다.' },
        { t: '120가지', ok: false, why: '(6−1)!, 즉 6명이 조건 없이 원탁에 앉는 방법입니다. 남녀가 번갈아 앉는다는 조건을 쓰지 않았습니다.' }
      ]
    },
    build3d: function (X) {
      var T = X.T, H = X.H, g = X.g, table = new T.Group(), people = [];
      g.add(table);
      var top = H.cyl(2.0, 2.0, 0.14, '#caa77c'); table.add(top);
      var ped = H.cyl(0.35, 0.55, 1.1, '#a98760'); ped.position.y = -0.62; g.add(ped);
      return {
        cam: { theta: 0.5, phi: 1.05, r: 9.5, t: [0, 0.3, 0] },
        update: function (n) {
          people.forEach(function (p) { table.remove(p); H.free(p); }); people = [];
          for (var i = 0; i < n; i++) {
            var a = 2 * Math.PI * i / n, p = new T.Group();
            var body = H.sph(0.38, i === 0 ? COL.amber : PAL[i % PAL.length]); body.position.y = 0.55; p.add(body);
            var lab = H.label(String.fromCharCode(65 + i), { size: 0.75 }); lab.position.y = 1.3; p.add(lab);
            if (i === 0) { var ring = new T.Mesh(new T.TorusGeometry(0.55, 0.05, 8, 28), H.mat(COL.amber, { emissive: '#7a5200' })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.12; p.add(ring); }
            p.position.set(Math.cos(a) * 2.9, 0.08, Math.sin(a) * 2.9);
            table.add(p); people.push(p);
          }
        },
        tick: function (time) { table.rotation.y = time * 0.4; }
      };
    }
  });

  /* ───────── 2. 중복순열 ───────── */
  LESSONS.push({
    id: 'rep', unit: UNIT, title: '중복순열', concept: '서로 다른 n개에서 중복을 허락하여 r개를 택하는 중복순열의 수 ₙΠᵣ = nʳ',
    source: 'Ⅰ. 경우의 수 › 순열과 조합 › 중복순열',
    terms: [['중복순열', '서로 다른 n개에서 중복을 허락하여 r개를 택하는 순열. 그 수를 기호 ₙΠᵣ로 나타내며 ₙΠᵣ = nʳ']],
    situation: '신호판에 깃발을 꽂는 칸이 r개 있습니다. 깃발은 <b>빨강·파랑·초록</b> 3가지 색이고, 같은 색을 여러 칸에 꽂아도 됩니다.',
    predict: {
      q: '칸이 3개일 때와 4개일 때를 비교합니다. 칸을 한 개 더 늘리면 만들 수 있는 신호의 수는 어떻게 될까요?',
      options: [
        { t: '3가지가 더 늘어난다 (+3)', ok: false, why: '새로 늘린 칸에도 색을 3가지 중에서 고를 수 있습니다. 이 선택이 기존의 모든 신호마다 따로 붙으므로 더하기가 아니라 곱하기입니다.' },
        { t: '4가지가 더 늘어난다 (+4)', ok: false, why: '4는 칸의 수일 뿐 색의 가짓수가 아닙니다. 늘어나는 것은 “색을 고르는 선택”이므로 3과 관계됩니다.' },
        { t: '2배가 된다', ok: false, why: '색이 2가지일 때의 이야기입니다. 이 문제에서는 새 칸에 3가지 색을 고를 수 있습니다.' },
        { t: '3배가 된다', ok: true, why: '기존의 신호 하나하나 뒤에 3가지 색 중 하나를 붙일 수 있으므로 3배가 됩니다. 그래서 r칸이면 3×3×…×3(r번)=3ʳ가지입니다.' }
      ]
    },
    slider: { label: '칸의 수 r', min: 1, max: 6, step: 1, value: 3, fmt: function (v) { return v + '칸'; } },
    calc: function (r) {
      return [['각 칸에서 고르는 색', '3가지'], ['중복순열의 수 ₃Πᵣ = 3ʳ', '3' + sup(r) + ' = ' + Math.pow(3, r) + '가지', 1], ['칸을 1개 늘리면', '×3 → ' + Math.pow(3, r + 1) + '가지']];
    },
    svgAlt: '칸 수에 따라 3의 거듭제곱으로 늘어나는 신호 수 막대 그래프',
    svg: function (r) {
      var s = '', x0 = 36, bw = 28;
      for (var k = 1; k <= 6; k++) {
        var v = Math.pow(3, k), h = v / 729 * 130, x = x0 + (k - 1) * 40;
        s += r_(x, 170 - h, bw, h, k === r ? COL.amber : '#b9c3d6', { stroke: k === r ? '#7a5200' : 'none', w: 2 });
        s += t(x + bw / 2, 164 - h, v, { size: 10, weight: k === r ? 700 : 400 }) + t(x + bw / 2, 186, k + '칸', { size: 10 });
      }
      s += l(30, 170, 290, 170);
      var cell = '';
      for (var i = 0; i < r; i++) { cell += r_(305 + (i % 3) * 36, 40 + Math.floor(i / 3) * 40, 30, 30, '#fff', { stroke: COL.ink, w: 1.5 }) + c(320 + (i % 3) * 36, 55 + Math.floor(i / 3) * 40, 8, [COL.red, COL.blue, COL.green][i % 3]); }
      s += cell + t(350, 140, '3×…×3 (' + r + '번)', { size: 11 }) + t(350, 160, '= 3' + sup(r) + ' = ' + Math.pow(3, r), { weight: 700, fill: COL.green });
      return s;
    },
    omitted: '깃발 모양과 꽂는 방향은 생략했습니다. 칸마다 색을 고를 수 있는 가짓수(3가지)가 항상 같다고 가정합니다. 3D의 노란 선은 가능한 신호 중 하나를 차례로 보여 줍니다.',
    legend: [[COL.red, '빨강'], [COL.blue, '파랑'], [COL.green, '초록'], [COL.amber, '지금 보는 신호']],
    apply: {
      q: '서로 다른 사탕 3개를 4명의 친구에게 나누어 줍니다. 한 사람이 사탕을 여러 개 받아도 될 때, 나누어 주는 방법은 모두 몇 가지일까요?',
      options: [
        { t: '12가지', ok: false, why: '4×3입니다. 사탕이 3개이므로 “누구에게 줄지”를 고르는 일이 3번 있고, 매번 4명 모두 고를 수 있습니다.' },
        { t: '24가지', ok: false, why: '₄P₃입니다. 한 사람이 한 개만 받는 경우(중복 불가)의 수이므로, 한 사람이 여러 개를 받는 경우가 빠졌습니다.' },
        { t: '81가지', ok: false, why: '4ᵃ에서 밑과 지수를 바꾼 3⁴입니다. 사탕 3개 각각이 4명 중 한 명을 고르므로 밑은 4, 지수는 3입니다.' },
        { t: '64가지', ok: true, why: '사탕마다 받을 친구를 4명 중에서 고르는 중복순열입니다. 4×4×4=4³=64가지입니다.' }
      ]
    },
    build3d: function (X) {
      var T = X.T, H = X.H, g = X.g, holder = new T.Group(), st = { r: 3, levels: [], idx: -1 };
      g.add(holder);
      var tr = []; for (var i = 0; i < 7; i++) { var m = H.sph(0.2, COL.amber, { emissive: '#7a5200' }); m.visible = false; g.add(m); tr.push(m); }
      var CC = [COL.red, COL.blue, COL.green];
      function rebuild(r) {
        H.clear(holder); st.r = r; st.levels = [[{ x: 0, y: 0, z: 0, c: -1 }]];
        var total = 1, k, i;
        for (k = 1; k <= r; k++) {
          var cnt = Math.pow(3, k), arr = [];
          for (i = 0; i < cnt; i++) {
            var par = st.levels[k - 1][Math.floor(i / 3)], cc = i % 3;
            arr.push({ x: ((i + 0.5) / cnt - 0.5) * 11, y: 0, z: par.z + (cc - 1) * 1.1 / k, c: cc });
          }
          st.levels.push(arr); total += cnt;
        }
        /* 수형도를 책장 위에 눕힘: 뿌리는 뒤쪽, 단계마다 앞으로 (2차는 공중에 세워져 그림자가 흩어졌음) */
        var rad = r >= 5 ? 0.11 : 0.16, depth = Math.min(1.7, 8 / Math.max(r, 1));
        for (k = 0; k <= r; k++) st.levels[k].forEach(function (n) { n.y = rad; n.z = (k - r / 2) * depth; });
        var geo = new T.SphereGeometry(rad, 10, 8), im = new T.InstancedMesh(geo, H.mat('#ffffff'), total), mtx = new T.Matrix4(), idx = 0, seg = [];
        for (k = 0; k <= r; k++) st.levels[k].forEach(function (n, j) {
          mtx.setPosition(n.x, n.y, n.z); im.setMatrixAt(idx, mtx);
          im.setColorAt(idx, new T.Color(n.c < 0 ? COL.gray : CC[n.c])); idx++;
          if (k > 0) { var p = st.levels[k - 1][Math.floor(j / 3)]; seg.push(p.x, p.y, p.z, n.x, n.y, n.z); }
        });
        holder.add(im);
        if (seg.length) holder.add(H.segs(seg, '#8a8f98'));
        st.idx = -1;
      }
      return {
        cam: { theta: 0.35, phi: 1.2, r: 15, t: [0, 0, 0], bookPhi: 0.62 },
        update: function (r) { rebuild(r); },
        tick: function (time) {
          var cnt = Math.pow(3, st.r), L = Math.floor(time * 1.6) % cnt;
          if (L === st.idx && time > 0) return; st.idx = L;
          for (var k = 0; k < 7; k++) {
            if (k > st.r) { tr[k].visible = false; continue; }
            var n = st.levels[k][Math.floor(L / Math.pow(3, st.r - k))];
            tr[k].visible = true; tr[k].position.set(n.x, 0.2, n.z);
          }
        }
      };
    }
  });

  /* ───────── 3. 같은 것이 있는 순열 ───────── */
  LESSONS.push({
    id: 'dup', unit: UNIT, title: '같은 것이 있는 순열', concept: 'n개 중에서 같은 것이 각각 p개, q개, …, r개씩 있을 때, n개를 일렬로 나열하는 순열의 수는 n!/(p!q!⋯r!)',
    source: 'Ⅰ. 경우의 수 › 순열과 조합 › 같은 것이 있는 순열',
    terms: [['같은 것이 있는 순열', 'n개 중에서 같은 것이 각각 p개, q개, …, r개씩 있을 때, n개를 일렬로 나열하는 순열. 그 수는 n!/(p!q!⋯r!) (단, p+q+⋯+r=n)']],
    situation: '구슬 5개를 일렬로 놓습니다. 그중 <b>k개는 똑같은 빨간 구슬</b>이고, 나머지는 서로 다른 색입니다. 빨간 구슬끼리 자리를 바꿔도 보기에는 달라지지 않습니다.',
    predict: {
      q: '5개가 모두 다르면 5!=120가지입니다. 이 중 3개가 똑같은 빨간 구슬일 때 서로 다른 배열은 몇 가지일까요?',
      options: [
        { t: '120가지 그대로', ok: false, why: '빨간 구슬 3개를 서로 다르게 본 값입니다. 같은 빨간 구슬끼리 바꿔 놓은 배열은 눈으로 구별되지 않습니다.' },
        { t: '40가지 (120 ÷ 3)', ok: false, why: '빨간 구슬 3개를 줄 세우는 방법은 3가지가 아니라 3!=6가지입니다. 나누는 수를 6으로 해야 합니다.' },
        { t: '20가지 (120 ÷ 3!)', ok: true, why: '빨간 구슬 3개를 구별하면 서로 다른 배열 하나가 3!=6개의 구별되는 배열에서 나옵니다. 따라서 120÷6=20가지입니다.' },
        { t: '60가지 (120 ÷ 2)', ok: false, why: '2로 나누는 경우는 같은 구슬이 2개일 때(2!)입니다. 이번에는 3개이므로 3!으로 나눕니다.' }
      ]
    },
    slider: { label: '빨간 구슬의 수 k', min: 1, max: 5, step: 1, value: 3, fmt: function (v) { return v + '개'; } },
    calc: function (k) {
      return [['모두 다르다고 볼 때 5!', '120가지'], ['빨간 구슬끼리 바꾸는 k!', fact(k) + '가지씩 겹침'], ['서로 다른 배열 5! ÷ k!', 120 / fact(k) + '가지', 1]];
    },
    svgAlt: '빨간 구슬 k개와 다른 색 구슬이 일렬로 놓인 그림과 계산식',
    svg: function (k) {
      var s = '', cols = [COL.blue, COL.green, COL.amber, COL.purple, COL.pink];
      for (var i = 0; i < 5; i++) s += c(50 + i * 42, 50, 15, i < k ? COL.red : cols[i - k] || COL.gray, { stroke: '#fff', w: 1.5 });
      s += t(50 + 2 * 42, 85, '빨간 구슬 ' + k + '개 · 나머지 ' + (5 - k) + '개는 모두 다른 색', { size: 11 });
      s += t(30, 130, '5! = 120', { anchor: 'start' }) + t(30, 152, '÷ ' + k + '! = ' + fact(k), { anchor: 'start' });
      s += t(30, 182, '= ' + (120 / fact(k)) + '가지', { anchor: 'start', size: 16, weight: 700, fill: COL.green });
      var h1 = 120 / 120 * 90, h2 = Math.max(120 / fact(k) / 120 * 90, 2);
      s += r_(250, 195 - h1, 40, h1, '#b9c3d6') + r_(320, 195 - h2, 40, h2, COL.teal) + l(240, 195, 380, 195);
      s += t(270, 190 - h1, '120', { size: 10 }) + t(340, 190 - h2, 120 / fact(k), { size: 10, weight: 700 }) + t(270, 212, '모두 다름', { size: 10 }) + t(340, 212, '같은 것 있음', { size: 10 });
      return s;
    },
    omitted: '구슬의 크기·무게는 같고 색만 다르다고 가정했습니다. 3D에서 빨간 구슬끼리 서로 자리를 바꾸며 돌아도 배열은 그대로이므로 새로운 배열로 세지 않습니다.',
    legend: [[COL.red, '같은 빨간 구슬'], ['#b9c3d6', '5! (모두 다를 때)'], [COL.teal, '같은 것이 있을 때']],
    apply: {
      q: 'banana(바나나)의 6개 철자를 모두 사용하여 일렬로 나열하는 경우의 수는 몇 가지일까요? (b 1개, a 3개, n 2개)',
      options: [
        { t: '720가지', ok: false, why: '6!, 곧 6개가 모두 다르다고 본 값입니다. a와 n이 같은 철자인 것을 반영하지 않았습니다.' },
        { t: '360가지', ok: false, why: '6!÷2!입니다. n이 2개인 것만 반영했고, a가 3개인 것(3!)을 나누지 않았습니다.' },
        { t: '120가지', ok: false, why: '6!÷3!입니다. a가 3개인 것만 반영했고, n이 2개인 것(2!)을 나누지 않았습니다.' },
        { t: '60가지', ok: true, why: '같은 것이 있는 순열의 수 6!÷(3!×2!×1!)=720÷12=60가지입니다.' }
      ]
    },
    build3d: function (X) {
      var T = X.T, H = X.H, g = X.g, balls = [], K = 3, bx = [];
      for (var i = 0; i < 5; i++) { var b = H.sph(0.45, COL.red); b.position.set((i - 2) * 1.35, 0.5, 0); g.add(b); balls.push(b); bx.push((i - 2) * 1.35); }
      var floor = H.box(8, 0.1, 2.6, '#d9d2bf'); floor.position.set(0, -0.05, 0); g.add(floor);
      var tall = H.cyl(0.7, 0.7, 3, '#b9c3d6'); tall.position.set(-3.6, 1.5, -3.6); g.add(tall);
      var res = H.cyl(0.7, 0.7, 1, COL.teal); g.add(res);
      var l1 = H.label('120', { size: 0.8 }); l1.position.set(-3.6, 3.6, -3.6); g.add(l1);
      var l2 = H.dyn({ size: 0.8 }); g.add(l2.sprite);
      var cols = [COL.blue, COL.green, COL.amber, COL.purple, COL.pink];
      return {
        cam: { theta: 0.3, phi: 1.05, r: 11, t: [0, 1.2, -1] },
        update: function (k) {
          K = k;
          balls.forEach(function (b, i) { b.material.color.set(i < k ? COL.red : cols[i - k]); });
          var v = 120 / fact(k), h = Math.max(v / 120 * 3, 0.08);
          res.scale.y = h; res.position.set(3.6, h / 2, -3.6);
          l2.sprite.position.set(3.6, h + 0.6, -3.6); l2.set(String(v));
        },
        tick: function (time) {
          balls.forEach(function (b, i) { b.position.x = bx[i]; b.position.z = 0; });
          [[0, 1, 0], [2, 3, 1.7]].forEach(function (p) {
            if (p[1] < K) {
              var th = time * 1.8 + p[2], R = (bx[p[1]] - bx[p[0]]) / 2, cx = (bx[p[0]] + bx[p[1]]) / 2;
              balls[p[0]].position.set(cx - R * Math.cos(th), 0.5, R * 0.7 * Math.sin(th));
              balls[p[1]].position.set(cx + R * Math.cos(th), 0.5, -R * 0.7 * Math.sin(th));
            }
          });
        }
      };
    }
  });

  /* ───────── 4. 중복조합 ───────── */
  LESSONS.push({
    id: 'comb', unit: UNIT, title: '중복조합', concept: '서로 다른 n개에서 중복을 허락하여 r개를 택하는 중복조합의 수 ₙHᵣ = ₙ₊ᵣ₋₁Cᵣ',
    source: 'Ⅰ. 경우의 수 › 순열과 조합 › 중복조합',
    terms: [['조합', '서로 다른 n개에서 순서를 생각하지 않고 r개를 택하는 것'], ['중복조합', '서로 다른 n개에서 중복을 허락하여 r개를 택하는 조합. 그 수를 기호 ₙHᵣ로 나타내며 ₙHᵣ = ₙ₊ᵣ₋₁Cᵣ']],
    situation: '과일 가게에서 <b>사과·배·귤</b> 3종류 중 r개를 고릅니다. 같은 종류를 여러 개 담아도 되고, 담는 순서는 상관없습니다.',
    predict: {
      q: '3종류의 과일에서 3개를 고르는 방법(순서는 생각하지 않고, 같은 종류를 중복하여 골라도 됨)은 모두 몇 가지일까요?',
      options: [
        { t: '27가지 (3³)', ok: false, why: '고르는 순서까지 구별하는 중복순열의 값입니다. 사과·사과·배와 배·사과·사과는 담긴 과일이 같으므로 한 가지입니다.' },
        { t: '1가지 (₃C₃)', ok: false, why: '서로 다른 3개를 모두 고르는 한 가지뿐인 경우입니다. 같은 종류를 중복해서 고르는 경우가 빠졌습니다.' },
        { t: '10가지 (₃H₃)', ok: true, why: '과일 3개와 칸막이 2개를 일렬로 놓는 방법 수와 같습니다. 5칸 중 칸막이 자리 2칸을 고르는 ₅C₂=10가지, 곧 ₃H₃=₅C₃=10입니다.' },
        { t: '6가지 (₃P₃)', ok: false, why: '서로 다른 3개를 일렬로 세우는 순열입니다. 중복도 순서도 이 문제의 조건과 맞지 않습니다.' }
      ]
    },
    slider: { label: '고르는 개수 r', min: 1, max: 6, step: 1, value: 3, fmt: function (v) { return v + '개'; } },
    calc: function (r) {
      return [['공 r개 + 칸막이 2개를 놓는 칸', (r + 2) + '칸'], ['칸막이 자리 고르기 ₍r+2₎C₂', nCr(r + 2, 2) + '가지'], ['중복조합의 수 ₃Hᵣ = ₍₃₊ᵣ₋₁₎Cᵣ', '₃H' + sub(r) + ' = ' + sub(r + 2) + 'C' + sub(r) + ' = ' + nHr(3, r) + '가지', 1]];
    },
    svgAlt: '공과 칸막이를 일렬로 놓는 그림과 중복조합 계산식',
    svg: function (r) {
      var m = r + 2, cs = MX.combos(m, 2), pick = cs[Math.floor(cs.length / 2)], s = '', gi = 0, x;
      for (var i = 0; i < m; i++) {
        x = 40 + i * 40;
        if (pick.indexOf(i) >= 0) { s += r_(x - 3, 50, 6, 36, COL.gray); gi++; }
        else s += c(x, 68, 13, [COL.red, COL.green, COL.amber][gi], { stroke: '#fff', w: 1.5 });
      }
      s += t(40 + (m - 1) * 20, 108, '한 가지 예: 공 ' + r + '개 + 칸막이(|) 2개를 놓은 모양', { size: 11 });
      s += t(40, 148, '₃H' + sub(r) + ' = ' + sub(r + 2) + 'C' + sub(r) + ' = ' + sub(r + 2) + 'C₂', { anchor: 'start', size: 15 });
      s += t(40, 176, '= ' + nHr(3, r) + '가지', { anchor: 'start', size: 16, weight: 700, fill: COL.green });
      s += t(300, 150, '왼쪽: 사과 · 가운데: 배 · 오른쪽: 귤', { size: 10 });
      return s;
    },
    omitted: '각 과일이 충분히 많아 어느 종류든 r개까지 고를 수 있다고 가정했습니다. 3D의 장면은 가능한 담는 방법을 하나씩 차례로 보여 줍니다.',
    legend: [[COL.red, '사과'], [COL.green, '배'], [COL.amber, '귤'], [COL.gray, '칸막이']],
    apply: {
      q: '방정식 x + y + z + w = 3을 만족하는 음이 아닌 정수 x, y, z, w의 순서쌍 (x, y, z, w)는 모두 몇 개일까요?',
      options: [
        { t: '10개', ok: false, why: '₃H₃=₅C₃입니다. 변수를 3개로 본 값인데, 이 방정식에는 변수가 4개(x, y, z, w) 있습니다.' },
        { t: '24개', ok: false, why: '₄P₃입니다. 값을 서로 다르게 고르는 순열이어서, 같은 값을 여러 번 쓰는 해(예: 1, 1, 1, 0)가 빠졌습니다.' },
        { t: '20개', ok: true, why: '서로 다른 4개의 변수 중에서 중복을 허락하여 3개를 택하는 방법과 같습니다. ₄H₃=₆C₃=20개입니다.' },
        { t: '64개', ok: false, why: '4³입니다. 순서를 구별하는 중복순열의 값으로, 합이 3이어야 한다는 조건이 반영되지 않았습니다.' }
      ]
    },
    build3d: function (X) {
      var T = X.T, H = X.H, g = X.g, slots = [], stars = [], bars = [], st = { m: 5, list: [], idx: -1 };
      var CCs = [COL.red, COL.green, COL.amber], binStacks = [];
      /* 공(○)과 칸막이(|)를 늘어놓는 줄: 앞쪽 받침 위 (2차는 바구니 위 공중에 떠 있었음) */
      var RY = -1.3, RZ = 3.3, rail = H.box(8.2, 0.12, 1.0, '#e9e4d8'); rail.position.set(0, RY, RZ); g.add(rail);
      var rl = H.label('공 r개 + 칸막이 2개를 한 줄로', { size: 0.65 }); rl.position.set(0, RY + 1.5, RZ + 0.3); g.add(rl);
      for (var i = 0; i < 8; i++) {
        var s = H.sph(0.34, COL.red); s.visible = false; g.add(s); stars.push(s);
        var b = H.box(0.14, 1.0, 0.4, COL.gray); b.visible = false; g.add(b); bars.push(b);
      }
      ['사과', '배', '귤'].forEach(function (nm, j) {
        var base = H.box(2.0, 0.12, 1.6, '#d9d2bf'); base.position.set((j - 1) * 3.2, -1.3, 0); g.add(base);
        var lb = H.label(nm, { size: 0.8 }); lb.position.set((j - 1) * 3.2, -0.5, 1.0); g.add(lb);
        var arr = []; for (var q = 0; q < 6; q++) { var ball = H.sph(0.3, CCs[j]); ball.visible = false; ball.position.set((j - 1) * 3.2 + (q % 2 ? 0.4 : -0.4), -0.95 + Math.floor(q / 2) * 0.62, 0); g.add(ball); arr.push(ball); }
        binStacks.push(arr);
      });
      function apply() {
        var m = st.m, pick = st.list[st.idx], gi = 0, cnt = [0, 0, 0], si = 0;
        for (var i = 0; i < 8; i++) {
          stars[i].visible = false; bars[i].visible = false;
          if (i >= m) continue;
          var x = (i - (m - 1) / 2) * 0.95;
          if (pick.indexOf(i) >= 0) { bars[i].visible = true; bars[i].position.set(x, RY + 0.06 + 0.5, RZ); gi++; }
          else { stars[i].visible = true; stars[i].position.set(x, RY + 0.06 + 0.34, RZ); stars[i].material.color.set(CCs[gi]); cnt[gi]++; }
        }
        binStacks.forEach(function (arr, j) { arr.forEach(function (b, q) { b.visible = q < cnt[j]; }); });
      }
      return {
        cam: { theta: 0.25, phi: 1.2, r: 12, t: [0, 0.5, 0], bookPhi: 0.85 },
        update: function (r) { st.m = r + 2; st.list = MX.combos(st.m, 2); st.idx = 0; apply(); },
        tick: function (time) {
          var i = Math.floor(time * 1.3) % st.list.length;
          if (i !== st.idx) { st.idx = i; apply(); }
        }
      };
    }
  });

  /* ───────── 5. 이항정리 ───────── */
  LESSONS.push({
    id: 'binom', unit: UNIT, title: '이항정리와 파스칼의 삼각형', concept: '(a+b)ⁿ의 전개식의 계수는 조합의 수 ₙCᵣ',
    source: 'Ⅰ. 경우의 수 › 이항정리',
    terms: [['이항정리', '(a+b)ⁿ = ₙC₀aⁿ + ₙC₁aⁿ⁻¹b + ⋯ + ₙCᵣaⁿ⁻ʳbʳ + ⋯ + ₙCₙbⁿ'], ['이항계수', '이항정리의 전개식에서 각 항의 계수 ₙC₀, ₙC₁, …, ₙCₙ'], ['일반항', '전개식의 각 항 ₙCᵣaⁿ⁻ʳbʳ'], ['파스칼의 삼각형', '이항계수를 삼각형 모양으로 배열한 것. ₙ₋₁Cᵣ₋₁ + ₙ₋₁Cᵣ = ₙCᵣ']],
    situation: '(a+b)⁴ = (a+b)(a+b)(a+b)(a+b)를 전개합니다. 네 개의 괄호에서 <b>a 또는 b 중 하나씩</b> 골라 곱한 것을 모두 더하는 일입니다.',
    predict: {
      q: '(a+b)⁴을 전개했을 때 a²b² 항의 계수는 얼마일까요?',
      options: [
        { t: '4', ok: false, why: '₄C₁=4는 a³b(또는 ab³)의 계수입니다. b를 1개 고르는 방법의 수이지 2개 고르는 방법이 아닙니다.' },
        { t: '8', ok: false, why: '2³이나 2×4처럼 근거 없이 구한 값입니다. a²b²는 4개의 괄호에서 b를 낼 괄호 2개를 고르는 경우의 수로 셉니다.' },
        { t: '6', ok: true, why: '4개의 괄호 중 b를 내는 괄호 2개를 고르면 나머지 2개에서는 a를 냅니다. 그 방법의 수 ₄C₂=6이 a²b²의 계수입니다.' },
        { t: '12', ok: false, why: '₄P₂=12는 순서를 구별하는 순열입니다. 어느 괄호에서 b를 내는지만 중요하고 순서는 상관없으므로 12÷2!=6이 맞습니다.' }
      ]
    },
    slider: { label: '지수 n', min: 1, max: 8, step: 1, value: 4, fmt: function (v) { return 'n = ' + v; } },
    calc: function (n) {
      var row = [], i; for (i = 0; i <= n; i++) row.push(nCr(n, i));
      return [['이항정리', '(a+b)' + sup(n) + ' = Σ ₙCᵣ aⁿ⁻ʳbʳ'], ['이항계수 ₙC₀ ~ ₙCₙ', row.join(', ')], ['계수의 합 = 2ⁿ', row.reduce(function (a, b) { return a + b; }, 0) + ' = 2' + sup(n), 1]];
    },
    svgAlt: '파스칼의 삼각형과 n번째 줄 강조 표시',
    svg: function (n) {
      var s = '';
      for (var i = 0; i <= 8; i++) for (var k = 0; k <= i; k++) {
        var x = 210 + (k - i / 2) * 36, y = 24 + i * 22;
        s += t(x, y, nCr(i, k), { size: i === n ? 14 : 11, weight: i === n ? 700 : 400, fill: i === n ? COL.red : 'currentColor' });
      }
      s += r_(60, 24 + n * 22 - 17, 300, 24, 'none', { stroke: COL.amber, w: 2, rx: 6 });
      return s;
    },
    omitted: 'a, b는 문자 하나씩이며 곱셈의 교환법칙이 성립한다고 가정합니다. 3D는 0~n줄을 납작한 칸으로, n번째 줄의 이항계수를 앞쪽 막대로 보여 줍니다. 막대 높이는 그 줄의 가장 큰 계수를 기준으로 줄여 그렸습니다.',
    legend: [[COL.amber, 'n번째 줄과 막대'], [COL.blue, '더해지는 윗줄 두 수'], [COL.red, '더하는 선']],
    apply: {
      q: '(x+3)⁴의 전개식에서 x²의 계수는 얼마일까요?',
      options: [
        { t: '6', ok: false, why: '₄C₂=6만 구한 값입니다. 상수 3이 곱해지는 횟수(3²)를 곱하지 않았습니다.' },
        { t: '18', ok: false, why: '₄C₂×3입니다. x²항에서는 상수 3이 2번 곱해지므로 3이 아니라 3²=9를 곱해야 합니다.' },
        { t: '54', ok: true, why: '일반항은 ₄Cᵣ x⁴⁻ʳ 3ʳ입니다. x²이려면 r=2이므로 ₄C₂×3²=6×9=54입니다.' },
        { t: '81', ok: false, why: '3⁴=81은 x가 한 번도 없는 상수항(r=4)의 값입니다.' }
      ]
    },
    /* 3D: 0~n줄은 책장 위 납작한 칸(숫자는 칸 윗면에 인쇄), n번째 줄은 노란 칸 + 바로 앞의 막대그래프.
       윗줄 두 칸(파랑)이 아랫칸 하나로 더해지는 선을 차례로 강조해 파스칼 규칙을 보여 줌 */
    build3d: function (X) {
      var T = X.T, H = X.H, g = X.g, N = 8, DX = 1.05, DZ = 0.95, TH = 0.16, Z0 = -4.2, PAPER = '#f4f1ea';
      var tiles = [], decals = [], texCache = {};
      var px = function (n, k) { return (k - n / 2) * DX; }, pz = function (n) { return Z0 + n * DZ; };
      function numTex(v) {
        if (texCache[v]) return texCache[v];
        var cv = document.createElement('canvas'); cv.width = 128; cv.height = 96; var c = cv.getContext('2d'), fs = String(v).length > 1 ? 58 : 66;
        c.fillStyle = '#2a2833'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '700 ' + fs + 'px "Noto Serif KR","Batang",serif'; c.fillText(String(v), 64, 52);
        var tx = new T.CanvasTexture(cv); tx.anisotropy = 4; texCache[v] = tx; return tx;
      }
      for (var n = 0; n <= N; n++) {
        tiles[n] = []; decals[n] = [];
        for (var k = 0; k <= n; k++) {
          var tile = H.box(0.9, TH, 0.8, PAPER); tile.position.set(px(n, k), TH / 2, pz(n)); g.add(tile); tiles[n].push(tile);
          var dec = new T.Mesh(new T.PlaneGeometry(0.76, 0.57), new T.MeshBasicMaterial({ map: numTex(nCr(n, k)), transparent: true, depthWrite: false }));
          dec.rotation.x = -Math.PI / 2; dec.position.set(px(n, k), TH + 0.006, pz(n)); dec.userData.noInk = true; dec.renderOrder = 2; g.add(dec); decals[n].push(dec);
        }
      }
      /* 앞쪽 막대그래프 자리 */
      var ZB = pz(N) + 2.6, base = H.box(N * DX + 1.2, 0.05, 1.05, '#e9e4d8'); base.position.set(0, 0.025, ZB); g.add(base);
      var bars = [], barLabs = [];
      for (var b = 0; b <= N; b++) {
        var bar = H.box(0.78, 1, 0.78, COL.amber, { emissive: '#7a5200' }); g.add(bar); bars.push(bar);
        var dl = H.dyn({ size: 0.5 }); g.add(dl.sprite); barLabs.push(dl);
      }
      var links = new T.Group(); g.add(links);
      var cur = 4, hi = -1, childLines = [];
      function rebuildLinks() {
        H.clear(links); childLines = [];
        var y = TH + 0.02, k, arr;
        for (k = 0; k <= cur; k++) {                 /* 윗줄 두 칸 → 아랫칸 */
          arr = [];
          if (cur >= 1 && k - 1 >= 0) arr.push(px(cur - 1, k - 1), y, pz(cur - 1) + 0.38, px(cur, k), y, pz(cur) - 0.38);
          if (cur >= 1 && k <= cur - 1) arr.push(px(cur - 1, k), y, pz(cur - 1) + 0.38, px(cur, k), y, pz(cur) - 0.38);
          var ln = arr.length ? H.segs(arr, '#8a8478') : null; if (ln) links.add(ln); childLines.push(ln);
        }
        arr = [];                                    /* n번째 줄 칸 → 막대 (점선처럼 짧게 끊어서) */
        for (k = 0; k <= cur; k++) for (var s = 0; s < 6; s += 2) {
          var z1 = pz(cur) + 0.42 + (ZB - 0.42 - pz(cur) - 0.42) * s / 6, z2 = pz(cur) + 0.42 + (ZB - 0.42 - pz(cur) - 0.42) * (s + 1) / 6;
          arr.push(px(cur, k), 0.03, z1, px(cur, k), 0.03, z2);
        }
        links.add(H.segs(arr, '#b08a2a'));
      }
      function highlight() {
        if (cur >= 1) tiles[cur - 1].forEach(function (t, k) { t.material.color.set(k === hi - 1 || k === hi ? COL.blue : PAPER); });
        childLines.forEach(function (ln, k) { if (ln) ln.material.color.set(k === hi ? COL.red : '#8a8478'); });
      }
      function paint() {
        tiles.forEach(function (row, n) {
          row.forEach(function (t, k) { var on = n <= cur; t.visible = on; decals[n][k].visible = on; t.material.color.set(n === cur ? COL.amber : PAPER); });
        });
        var top = nCr(cur, Math.floor(cur / 2));
        bars.forEach(function (bar, k) {
          var on = k <= cur; bar.visible = on; barLabs[k].sprite.visible = on; if (!on) return;
          var v = nCr(cur, k), h = 0.2 + 1.6 * v / top;
          bar.scale.y = h; bar.position.set(px(cur, k), 0.05 + h / 2, ZB); barLabs[k].set(String(v)); barLabs[k].sprite.position.set(px(cur, k), 0.05 + h + 0.4, ZB);
        });
        rebuildLinks(); hi = -1;
      }
      return {
        cam: { theta: 0.0, phi: 0.95, r: 15, t: [0, 1.2, 0], bookPhi: 0.66 },
        update: function (n) { cur = n; paint(); },
        tick: function (time) { var k = Math.floor(time / 1.4) % (cur + 1); if (k !== hi) { hi = k; highlight(); } }
      };
    }
  });
})();
