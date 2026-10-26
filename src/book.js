/* book.js — 책상 위의 3D 책: 표지 열기, 책장 넘기기, 덮개, 도장, 모형 세우기, 카메라 */
function BookWorld(T, canvas) {
  var self = this;
  var W = 7, D = 9.6, CT = 0.1, PB = 0.42, TOP = CT + PB, CW = W + 0.2, CD = D + 0.34;
  this.W = W; this.D = D; this.TOP = TOP;
  this.ok = false; this.active = true; this.paused = false; this.still = false;

  try { this.r = new T.WebGLRenderer({ canvas: canvas, antialias: true }); } catch (e) { return; }
  var r = this.r; r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  r.shadowMap.enabled = true; r.shadowMap.type = T.PCFSoftShadowMap;
  var scene = this.scene = new T.Scene();
  var cam = this.cam = new T.PerspectiveCamera(34, 1, 0.1, 200);
  var maxAniso = r.capabilities.getMaxAnisotropy ? r.capabilities.getMaxAnisotropy() : 1;

  /* ── 빛: 창가에서 들어오는 오후 햇빛 ── */
  var hemi = new T.HemisphereLight(0xfff8ee, 0xb7ae9c, 0.62); scene.add(hemi);
  var sun = new T.DirectionalLight(0xfff0d8, 0.78); sun.position.set(-9, 16, -7); sun.target.position.set(1, 0, 0.5);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.02;
  var sc = sun.shadow.camera; sc.left = -16; sc.right = 16; sc.top = 16; sc.bottom = -16; sc.near = 1; sc.far = 50;
  scene.add(sun); scene.add(sun.target);

  /* ── 책상과 깔개 ── */
  function woodTex() {
    var cv = document.createElement('canvas'); cv.width = 1024; cv.height = 1024; var c = cv.getContext('2d'), R = MX.rng(3);
    c.fillStyle = '#e4d7c0'; c.fillRect(0, 0, 1024, 1024);
    for (var i = 0; i < 260; i++) { var y = R() * 1024; c.strokeStyle = 'rgba(150,115,70,' + (0.04 + R() * 0.08) + ')'; c.lineWidth = 1 + R() * 3; c.beginPath(); c.moveTo(0, y); for (var x = 0; x <= 1024; x += 64) c.lineTo(x, y + Math.sin(x / 140 + i) * 6 * R()); c.stroke(); }
    for (var k = 1; k < 4; k++) { c.fillStyle = 'rgba(120,90,50,0.18)'; c.fillRect(0, k * 256 - 2, 1024, 3); }
    var t = new T.CanvasTexture(cv); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(4, 4); t.anisotropy = maxAniso; return t;
  }
  function matTex() {
    var cv = document.createElement('canvas'); cv.width = 1024; cv.height = 700; var c = cv.getContext('2d');
    c.fillStyle = '#93aaa3'; c.fillRect(0, 0, 1024, 700);
    c.strokeStyle = 'rgba(255,255,255,0.12)'; c.lineWidth = 1; for (var x = 0; x < 1024; x += 32) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 700); c.stroke(); } for (var y = 0; y < 700; y += 32) { c.beginPath(); c.moveTo(0, y); c.lineTo(1024, y); c.stroke(); }
    var t = new T.CanvasTexture(cv); t.anisotropy = maxAniso; return t;
  }
  var deskMat = new T.MeshLambertMaterial({ map: woodTex() });
  var desk = new T.Mesh(new T.PlaneGeometry(90, 90), deskMat); desk.rotation.x = -Math.PI / 2; desk.receiveShadow = true; scene.add(desk);
  var matMesh = new T.Mesh(new T.PlaneGeometry(24, 16.4), new T.MeshLambertMaterial({ map: matTex() })); matMesh.rotation.x = -Math.PI / 2; matMesh.position.set(0.4, 0.008, 0.6); matMesh.receiveShadow = true; scene.add(matMesh);
  scene.background = new T.Color('#cfc6b6'); scene.fog = new T.Fog(0xcfc6b6, 26, 60);

  /* ── 책 ── */
  var book = this.book = new T.Group(); book.rotation.y = -0.025; book.position.set(0, 0.012, 0); scene.add(book);
  var coverMat = new T.MeshLambertMaterial({ color: '#d39a1a' }), coverIn = new T.MeshLambertMaterial({ color: '#efe6cf' });
  function edgeTex() {
    var cv = document.createElement('canvas'); cv.width = 64; cv.height = 256; var c = cv.getContext('2d'); c.fillStyle = '#f4efe2'; c.fillRect(0, 0, 64, 256);
    for (var y = 0; y < 256; y += 3) { c.fillStyle = 'rgba(120,100,70,' + (0.08 + Math.random() * 0.1) + ')'; c.fillRect(0, y, 64, 1); }
    var t = new T.CanvasTexture(cv); return t;
  }
  var edgeMat = new T.MeshLambertMaterial({ map: edgeTex() }), blockTop = new T.MeshLambertMaterial({ color: '#f6f1e4' });
  function block() { var m = new T.Mesh(new T.BoxGeometry(W - 0.04, PB, D), [edgeMat, edgeMat, blockTop, blockTop, edgeMat, edgeMat]); m.castShadow = true; m.receiveShadow = true; return m; }
  function board() { var m = new T.Mesh(new T.BoxGeometry(CW, CT, CD), [coverMat, coverMat, coverIn, coverMat, coverMat, coverMat]); m.castShadow = true; m.receiveShadow = true; return m; }
  /* 오른쪽(뒤표지 + 책장 묶음) */
  var back = board(); back.position.set(CW / 2, CT / 2, 0); book.add(back);
  var rb = block(); rb.position.set(W / 2 + 0.02, CT + PB / 2 - 0.002, 0); book.add(rb);
  /* 책등: 닫혔을 때만 보이는 반원통 */
  var spineGeo = new T.CylinderGeometry(TOP, TOP, CD, 24, 1, true, Math.PI, Math.PI); spineGeo.rotateX(Math.PI / 2);
  var spine = new T.Mesh(spineGeo, new T.MeshLambertMaterial({ color: '#c38d14', side: T.DoubleSide })); spine.position.set(0, TOP, 0); spine.castShadow = true; book.add(spine);
  /* 쪽 면: 제본선에서 부드럽게 솟아오르는 곡면.
     (2차는 제본 쪽이 아래로 꺼져서 종이 묶음 윗면에 가려졌음 → 항상 묶음보다 위에 있게) */
  var PAGE_Y = 0.075;
  function pageY(dist) { return PAGE_Y * (1 - Math.exp(-dist / 0.55)) + 0.012 * Math.sin(Math.PI * Math.min(1, dist / W)); }
  function pageGeo(side) {
    var g = new T.PlaneGeometry(W, D, 40, 1); g.rotateX(-Math.PI / 2);
    var p = g.attributes.position;
    for (var i = 0; i < p.count; i++) { var x = p.getX(i), dist = side === 'R' ? x + W / 2 : W / 2 - x; p.setY(i, pageY(dist)); }
    g.computeVertexNormals(); return g;
  }
  var pageMatL = new T.MeshLambertMaterial({ color: 0xffffff }), pageMatR = new T.MeshLambertMaterial({ color: 0xffffff });
  var pageR = new T.Mesh(pageGeo('R'), pageMatR); pageR.position.set(W / 2, TOP + 0.003, 0); pageR.receiveShadow = true; book.add(pageR);
  /* 왼쪽 잎(앞표지 + 왼쪽 책장): 제본선을 축으로 돌며 열고 닫힘 */
  var leaf = this.leaf = new T.Group(); leaf.position.set(0, TOP, 0); book.add(leaf);
  var lb = block(); lb.position.set(-W / 2 - 0.02, -PB / 2 + 0.002, 0); leaf.add(lb);
  var front = board(); front.position.set(-CW / 2, -PB - CT / 2, 0); leaf.add(front);
  var pageL = new T.Mesh(pageGeo('L'), pageMatL); pageL.position.set(-W / 2, 0.003, 0); pageL.receiveShadow = true; leaf.add(pageL);
  var coverCv = document.createElement('canvas'); PAGES.drawCover(coverCv);
  var coverTex = new T.CanvasTexture(coverCv); coverTex.anisotropy = maxAniso;
  var coverFace = new T.Mesh(new T.PlaneGeometry(CW - 0.06, CD - 0.06), new T.MeshLambertMaterial({ map: coverTex }));
  coverFace.geometry.rotateX(Math.PI / 2); coverFace.geometry.rotateY(Math.PI); coverFace.position.set(-CW / 2, -PB - CT - 0.004, 0); leaf.add(coverFace);
  /* 가름끈 */
  var ribbon = new T.Mesh(new T.BoxGeometry(0.2, 0.012, 1.6), new T.MeshLambertMaterial({ color: '#2b3f6b' })); ribbon.position.set(0.32, TOP + 0.02, D / 2 + 0.2); ribbon.rotation.x = 0.28; ribbon.castShadow = true; book.add(ribbon);

  /* ── 덮개 (왼쪽 쪽 아래) ── */
  var F = PAGES.FLAP, sx = W / PAGES.PW, sz = D / PAGES.PH;
  var fw = F.w * sx, fh = F.h * sz;
  var flapCv = document.createElement('canvas'); flapCv.width = 900; flapCv.height = 200;
  function drawFlap() {
    var c = flapCv.getContext('2d'); c.textAlign = 'left'; c.fillStyle = '#f1e6cd'; c.fillRect(0, 0, 900, 200);
    var g = c.createLinearGradient(0, 0, 0, 30); g.addColorStop(0, 'rgba(120,90,40,0.25)'); g.addColorStop(1, 'rgba(120,90,40,0)'); c.fillStyle = g; c.fillRect(0, 0, 900, 30);
    c.strokeStyle = 'rgba(42,40,51,0.4)'; c.setLineDash([6, 6]); c.beginPath(); c.moveTo(0, 6); c.lineTo(900, 6); c.stroke(); c.setLineDash([]);
    c.fillStyle = '#b8432f'; c.font = '700 22px ' + PAGES.SANS; c.fillText('정답과 이유', 30, 62);
    c.fillStyle = '#2a2833'; c.font = '700 40px ' + PAGES.SERIF; c.fillText('덮개를 들춰 정답 보기', 30, 116);
    c.fillStyle = '#6f6a62'; c.font = '500 22px ' + PAGES.SANS; c.fillText('예측을 고르고 실험해 본 뒤에 눌러 보세요.', 30, 160);
    c.fillStyle = '#2d5fa8'; c.font = '44px ' + PAGES.HAND; c.textAlign = 'right'; c.fillText('들춰 보기 ↗', 870, 150);
  }
  drawFlap();
  this.flapTex = new T.CanvasTexture(flapCv); this.flapTex.anisotropy = maxAniso;
  /* 글꼴을 늦게 받았을 때 표지·덮개 다시 그리기 */
  this.redrawFixed = function () { drawFlap(); self.flapTex.needsUpdate = true; PAGES.drawCover(coverCv); coverTex.needsUpdate = true; };
  var flap = this.flap = new T.Group();
  var flapGeo = new T.PlaneGeometry(fw, fh); flapGeo.rotateX(-Math.PI / 2); flapGeo.translate(0, 0, -fh / 2);   /* 경첩 = 덮개 아래쪽 가장자리 */
  var flapFront = new T.Mesh(flapGeo, new T.MeshLambertMaterial({ map: this.flapTex })); flapFront.castShadow = true; flapFront.receiveShadow = true;
  var flapBack = new T.Mesh(flapGeo, new T.MeshLambertMaterial({ color: '#e9dcbe', side: T.BackSide }));
  flap.add(flapFront); flap.add(flapBack);
  flap.position.set(-W + (F.x + F.w / 2) * sx, PAGE_Y + 0.03, -D / 2 + (F.y + F.h) * sz); leaf.add(flap);
  flapFront.userData.pick = 'flap'; flapBack.userData.pick = 'flap';

  /* ── 도장 ── */
  var stamp = new T.Group(); stamp.visible = false; scene.add(stamp);
  var sh1 = new T.Mesh(new T.CylinderGeometry(0.2, 0.26, 0.9, 24), INK.mat('#c9a77a')); sh1.position.y = 0.75; stamp.add(sh1);
  var sh2 = new T.Mesh(new T.SphereGeometry(0.3, 20, 14), INK.mat('#c9a77a')); sh2.position.y = 1.25; stamp.add(sh2);
  var sh3 = new T.Mesh(new T.CylinderGeometry(0.55, 0.55, 0.22, 32), INK.mat('#b8432f')); sh3.position.y = 0.16; stamp.add(sh3);
  INK.inkify(stamp);

  /* ── 넘어가는 책장 ── */
  var NS = 36, flipGeo = new T.BufferGeometry(), fpos = new Float32Array((NS + 1) * 2 * 3), fuv = new Float32Array((NS + 1) * 2 * 2), fidx = [];
  for (var i = 0; i <= NS; i++) { fuv[i * 4] = i / NS; fuv[i * 4 + 1] = 1; fuv[i * 4 + 2] = i / NS; fuv[i * 4 + 3] = 0; if (i < NS) { var a = i * 2; fidx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
  flipGeo.setAttribute('position', new T.BufferAttribute(fpos, 3)); flipGeo.setAttribute('uv', new T.BufferAttribute(fuv, 2)); flipGeo.setIndex(fidx);
  var flipFrontMat = new T.MeshLambertMaterial({ side: T.FrontSide }), flipBackMat = new T.MeshLambertMaterial({ side: T.BackSide });
  var flipper = new T.Group(); flipper.position.set(0, TOP + PAGE_Y + 0.03, 0); flipper.visible = false; book.add(flipper);
  var flipF = new T.Mesh(flipGeo, flipFrontMat), flipB = new T.Mesh(flipGeo, flipBackMat); flipF.castShadow = true; flipper.add(flipF); flipper.add(flipB);
  function setFlip(t) {
    var k = 0.55, x = 0, y = 0, seg = W / NS;
    for (var i = 0; i <= NS; i++) {
      var s = i / NS, u = MX.clamp(t * (1 + k) - k * s, 0, 1), a = Math.PI * (u * u * (3 - 2 * u));
      fpos[i * 6] = x; fpos[i * 6 + 1] = y; fpos[i * 6 + 2] = -D / 2; fpos[i * 6 + 3] = x; fpos[i * 6 + 4] = y; fpos[i * 6 + 5] = D / 2;
      x += seg * Math.cos(a); y += seg * Math.sin(a) * 1.0;
    }
    flipGeo.attributes.position.needsUpdate = true; flipGeo.computeVertexNormals(); flipGeo.computeBoundingSphere();
  }

  /* ── 텍스처 ── */
  function texOf(cv, mirror) {
    var k = mirror ? '__texM' : '__tex';
    if (!cv[k]) { var t = new T.CanvasTexture(cv); t.anisotropy = maxAniso; if (mirror) { t.wrapS = T.RepeatWrapping; t.repeat.x = -1; t.offset.x = 1; } cv[k] = t; }
    return cv[k];
  }
  this.texOf = texOf;
  this.showPages = function (cvL, cvR) {
    if (cvL) { pageMatL.map = texOf(cvL); pageMatL.needsUpdate = true; }
    if (cvR) { pageMatR.map = texOf(cvR); pageMatR.needsUpdate = true; }
  };
  this.refresh = function (cv) { if (cv.__tex) cv.__tex.needsUpdate = true; if (cv.__texM) cv.__texM.needsUpdate = true; };

  /* ── 애니메이션 ── */
  var tweens = [];
  function tween(dur, fn, done) {
    if (self.still || !self.active || dur <= 0) { fn(1); if (done) done(); return; }
    tweens.push({ t: 0, dur: dur, fn: fn, done: done }); fn(0);
  }
  this.tween = tween;
  function ease(k) { return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }

  /* 표지 열기(1)·닫기(0) */
  this.openAmt = 0;
  this.setOpen = function (target, done) {
    var from = self.openAmt;
    tween(1.3 * Math.abs(target - from), function (k) { self.openAmt = from + (target - from) * ease(k); leaf.rotation.z = -Math.PI * (1 - self.openAmt); spine.visible = self.openAmt < 0.6; }, done);
  };
  leaf.rotation.z = -Math.PI;

  /* 책장 넘기기: dir>0 앞으로(오른쪽→왼쪽) */
  this.flipping = false;
  this.flip = function (dir, front, backCv, done) {
    flipFrontMat.map = texOf(front); flipBackMat.map = texOf(backCv, true); flipFrontMat.needsUpdate = flipBackMat.needsUpdate = true;
    if (self.still || !self.active) { if (done) done(); return; }
    self.flipping = true; flipper.visible = true;
    tween(0.95, function (k) { setFlip(dir > 0 ? ease(k) : 1 - ease(k)); }, function () {
      self.flipping = false; if (done) done();
      /* 새 쪽이 한 번 그려진 뒤에 넘긴 장을 치워야 이전 쪽이 번쩍이지 않음 */
      setTimeout(function () { if (!self.flipping) flipper.visible = false; }, 120);
    });
  };

  /* 덮개 */
  this.flapState = 'closed';
  this.setFlap = function (state, animate) {
    /* 들추면 앞쪽(책장 아래 가장자리)으로 접혀 넘어가 글을 가리지 않음 */
    var to = state === 'open' ? 2.95 : 0, from = flap.rotation.x; self.flapState = state; flap.visible = state !== 'hidden';
    if (!animate) { flap.rotation.x = to; return; }
    tween(0.9, function (k) { flap.rotation.x = from + (to - from) * ease(k); });
  };

  /* 도장: 내려와 찍고(onHit) 올라가 사라짐 */
  this.doStamp = function (onHit, done) {
    var px = -W + PAGES.STAMP.x * sx, pz = -D / 2 + (PAGES.STAMP.y + 40) * sz, base = new T.Vector3(px, TOP + PAGE_Y + 0.03, pz);
    book.updateMatrixWorld(true); book.localToWorld(base);
    if (self.still || !self.active) { if (onHit) onHit(); if (done) done(); return; }
    stamp.visible = true; stamp.position.copy(base); stamp.rotation.y = 0.3;
    tween(0.45, function (k) { stamp.position.y = base.y + 3.2 * (1 - k * k); }, function () {
      if (onHit) onHit();
      tween(0.25, function (k) { stamp.position.y = base.y - 0.03 * Math.sin(k * Math.PI); }, function () {
        tween(0.6, function (k) { stamp.position.y = base.y + 3.5 * ease(k); }, function () { stamp.visible = false; if (done) done(); });
      });
    });
  };

  /* ── 레슨 모형 ── */
  var modelRoot = new T.Group(); modelRoot.position.set(W / 2, TOP + PAGE_Y, 0.25); book.add(modelRoot);
  var model = null, obj = null, H = null, mscale = 1, rise = 1, time = 0;
  this.modelErr = false;
  this.modelInfo = { center: new T.Vector3(W / 2, TOP + 1.5, 0), radius: 3 };
  this.clearModel = function () { if (model) { modelRoot.remove(model); H.free(model); } model = null; obj = null; };
  this.setModel = function (def, v, env, withRise) {
    self.clearModel(); H = INK.makeH(); model = new T.Group(); modelRoot.add(model); self.modelErr = false; time = 0;
    var inner = new T.Group(); model.add(inner);
    try {
      obj = def.build3d({ T: T, H: H, g: inner });
      if (obj.update) obj.update(def.slider.max, env);
      INK.inkify(inner);
      modelRoot.remove(model); model.updateMatrixWorld(true);          /* 부모 없이 재야 모형 자체의 크기가 나옴 */
      var box = new T.Box3().setFromObject(inner), size = new T.Vector3(), c = new T.Vector3(); box.getSize(size); box.getCenter(c);
      mscale = Math.min(5.6 / Math.max(size.x, 0.1), 6.4 / Math.max(size.z, 0.1), 5.4 / Math.max(size.y, 0.1), 1.6);
      inner.position.set(-c.x, -box.min.y + 0.02, -c.z);
      model.scale.setScalar(mscale); modelRoot.add(model);
      if (obj.update) obj.update(v, env);
      INK.inkify(inner); boostTags(inner);
      var wc = new T.Vector3(0, size.y * mscale / 2, 0); modelRoot.updateMatrixWorld(true); modelRoot.localToWorld(wc);
      self.modelInfo = { center: wc, radius: Math.max(2.6, 0.55 * Math.sqrt(size.x * size.x + size.y * size.y + size.z * size.z) * mscale), cam: obj.cam };
      measureModel();
    } catch (e) { self.modelErr = true; if (window.console) console.error('3D 구성 오류', e); }
    rise = withRise && !self.still ? 0 : 1; if (rise < 1) model.scale.set(mscale, mscale * 0.02, mscale);
  };
  /* 모형을 줄였을 때 꼬리표 글자가 너무 작아지지 않게 */
  function boostTags(root) {
    var k = MX.clamp(0.8 / mscale, 1, 1.8);
    root.traverse(function (n) { if (n.isSprite && !n.userData.boost) { n.userData.boost = 1; n.scale.multiplyScalar(k); } });
  }
  this.updateModel = function (v, env) {
    if (!obj || !obj.update) return;
    try { obj.update(v, env); INK.inkify(model); boostTags(model); if (rise >= 1) measureModel(); } catch (e) { self.modelErr = true; if (window.console) console.error('3D 갱신 오류', e); }
  };
  /* 카메라 맞춤에 쓰는 모형의 실제 범위(꼬리표 포함, 약간 여유) */
  var modelBox = null;
  function measureModel() {
    if (!model) { modelBox = null; return; }
    book.updateMatrixWorld(true);
    modelBox = new T.Box3().setFromObject(model);
    if (modelBox.isEmpty()) modelBox = null; else { modelBox.expandByScalar(0.3); modelBox.getCenter(self.modelInfo.center); }
  }
  this.resetTime = function () { time = 0; };
  this.redrawTags = function () { if (H) H.redrawTags(); };

  /* ── 카메라 ── */
  var cur = { t: new T.Vector3(0, 0.6, 0.6), theta: 0, phi: 0.75, r: 22 }, goal = { t: new T.Vector3(0, 0.6, 0.6), theta: 0, phi: 0.75, R: 8 }, user = { dt: 0, dp: 0, z: 1, px: 0, pz: 0 };   /* px·pz: 두 손가락으로 옮긴 만큼(책상 위 좌표) */
  var gT = new T.Vector3();
  var ins = { l: 0, r: 0, b: 70, t: 0 }, vo = { x: 0, y: 0 }, snap = true;
  this.setInsets = function (o) { ins = o; };
  function fitR(R) {
    var w = canvas.clientWidth || 1, h = canvas.clientHeight || 1, fw = Math.max(200, w - ins.l - ins.r), fh = Math.max(200, h - ins.b - ins.t);
    var tv = Math.tan(cam.fov * Math.PI / 360), th = tv * fw / h, tvf = tv * fh / h;
    return R / Math.sin(Math.atan(Math.min(th, tvf)));
  }
  /* 맞춰 보일 점들 (책 좌표의 상자 → 세계 좌표 모서리 8개) */
  function corners(x0, x1, y0, y1, z0, z1, local) {
    var out = [];
    [x0, x1].forEach(function (x) { [y0, y1].forEach(function (y) { [z0, z1].forEach(function (z) { var p = new T.Vector3(x, y, z); if (local) local.localToWorld(p); out.push(p); }); }); });
    return out;
  }
  function ptsFor(key) {
    book.updateMatrixWorld(true);
    if (key === 'spread') return corners(-CW, CW, 0, TOP + 0.1, -CD / 2, CD / 2 + 0.7, book);
    if (key === 'cover') return corners(-TOP, CW, 0, PB + CT + TOP, -CD / 2, CD / 2 + 0.7, book);
    if (key === 'flap') return corners(-CW, 0, 0, TOP + 0.3, -CD / 2, CD / 2 + 0.7, book);   /* 왼쪽 쪽 전체 + 접힌 덮개 */
    var mb = modelBox ? corners(modelBox.min.x, modelBox.max.x, modelBox.min.y, modelBox.max.y, modelBox.min.z, modelBox.max.z, null) : null;
    if (key === 'model') return mb;
    /* 모형 + 모형이 서 있는 오른쪽 책장 전체 */
    if (key === 'modelPage') return corners(0, CW, 0, TOP + 0.1, -CD / 2, CD / 2, book).concat(mb || []);
    return null;
  }
  /* 모든 점이 패널을 뺀 빈 화면 안(여백 포함)에 들어오는 가장 가까운 거리 */
  var vA = new T.Vector3(), vR = new T.Vector3(), vU = new T.Vector3(), vF = new T.Vector3(), vP = new T.Vector3(), UP = new T.Vector3(0, 1, 0);
  function fitPts(pts, t, theta, phi) {
    var w = canvas.clientWidth || 1, h = canvas.clientHeight || 1, m = Math.min(28, w * 0.03);
    var hw = Math.max(80, (w - ins.l - ins.r) / 2 - m), hh = Math.max(80, (h - ins.b - ins.t) / 2 - m), F = (h / 2) / Math.tan(cam.fov * Math.PI / 360);
    var sp = Math.sin(phi); vA.set(sp * Math.sin(theta), Math.cos(phi), sp * Math.cos(theta));
    vF.copy(vA).negate(); vR.crossVectors(vF, UP).normalize(); vU.crossVectors(vR, vF);
    function ok(r) {
      for (var i = 0; i < pts.length; i++) {
        vP.copy(pts[i]).sub(t).addScaledVector(vA, -r);           /* 카메라에서 점까지 */
        var z = vP.dot(vF); if (z < 0.2) return false;
        if (Math.abs(vP.dot(vR) / z) * F > hw || Math.abs(vP.dot(vU) / z) * F > hh) return false;
      }
      return true;
    }
    var lo = 1, hi = 150; if (!ok(hi)) return hi;
    for (var k = 0; k < 22; k++) { var mid = (lo + hi) / 2; if (ok(mid)) hi = mid; else lo = mid; }
    return hi;
  }
  /* p: {t:[x,y,z] 또는 Vector3, theta, phi, R(대략 크기), pts('spread'|'cover'|'flap'|'model': 이 범위가 다 보이게)} */
  this.poseTo = function (p, keepUser) {
    goal.t.copy(p.t.isVector3 ? p.t : new T.Vector3(p.t[0], p.t[1], p.t[2])); goal.theta = p.theta; goal.phi = p.phi; goal.R = p.R; goal.pts = p.pts || null; goal.min = p.min || 0;
    if (!keepUser) { user.dt = 0; user.dp = 0; user.z = 1; user.px = 0; user.pz = 0; }
    if (self.still) snap = true;
  };
  /* 6차: 휴대폰에서 글자를 읽을 만큼 가까이 갈 수 있게 최소 배율을 0.35 → 0.15 */
  this.orbit = function (dt, dp, dz) { user.dt += dt; user.dp = MX.clamp(user.dp + dp, -0.6, 0.5); if (dz) user.z = MX.clamp(user.z * dz, 0.15, 2.2); if (self.still) snap = true; };
  this.resetUser = function () { user.dt = 0; user.dp = 0; user.z = 1; user.px = 0; user.pz = 0; if (self.still) snap = true; };
  /* 화면에서 손가락이 움직인 픽셀만큼 보는 곳을 책상 위에서 옮김 (내용이 손가락을 따라오게) */
  this.pan = function (dxPx, dyPx) {
    var h = canvas.clientHeight || 1, k = cur.r * 2 * Math.tan(cam.fov * Math.PI / 360) / h, th = cur.theta, sy = 1 / Math.max(0.35, Math.cos(cur.phi));
    var rx = Math.cos(th), rz = -Math.sin(th), fx = -Math.sin(th), fz = -Math.cos(th);   /* 오른쪽, 앞(멀어지는 쪽) */
    user.px = MX.clamp(user.px + (-dxPx * rx + dyPx * sy * fx) * k, -9, 9);
    user.pz = MX.clamp(user.pz + (-dxPx * rz + dyPx * sy * fz) * k, -7, 7);
    if (self.still) snap = true;
  };
  this.zoomLevel = function () { return user.z; };
  this.snapCam = function () { snap = true; };

  /* ── 고르기(클릭) ── */
  var ray = new T.Raycaster(), ndc = new T.Vector2();
  this.pick = function (cx, cy) {
    var rc = canvas.getBoundingClientRect(); ndc.set((cx - rc.left) / rc.width * 2 - 1, -(cy - rc.top) / rc.height * 2 + 1);
    ray.setFromCamera(ndc, cam);
    var targets = [flapFront, flapBack, pageL, pageR]; if (model) targets.push(model);
    var hit = ray.intersectObjects(targets, true).filter(function (h) { return h.object.visible && !(h.object.material && h.object.material.colorWrite === false); })[0];
    if (!hit) return null;
    var o = hit.object;
    if (o.userData.pick === 'flap') return flap.visible ? { kind: 'flap' } : null;
    if (o === pageL) return { kind: 'left', u: hit.uv.x, v: 1 - hit.uv.y };
    if (o === pageR) return { kind: 'right', u: hit.uv.x, v: 1 - hit.uv.y };
    return { kind: 'model' };
  };

  /* ── 크기·테마 ── */
  this.resize = function () {
    var w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return;
    r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); INK.setPx(r.getPixelRatio());
  };
  this.setDark = function (dark) {
    var bg = dark ? 0x2a2a30 : 0xcfc6b6; scene.background.setHex(bg); scene.fog.color.setHex(bg);
    deskMat.color.setHex(dark ? 0x77706a : 0xffffff); hemi.intensity = dark ? 0.42 : 0.62; sun.intensity = dark ? 0.62 : 0.78; sun.color.setHex(dark ? 0xffd9a8 : 0xfff0d8);
  };

  /* ── 매 프레임 ── */
  var last = 0;
  function frame(ts) {
    requestAnimationFrame(frame);
    var raw = Math.max(0, (ts - last) / 1000) || 0, dt = Math.min(raw, 0.05); last = ts;
    if (!self.active || document.hidden) return;
    /* 넘김·열기 효과는 느린 컴퓨터에서도 제시간에 끝나도록 더 큰 간격 허용 */
    var tdt = Math.min(raw, 0.2);
    for (var i = tweens.length - 1; i >= 0; i--) {
      var tw = tweens[i]; tw.t += tdt; var k = Math.min(1, tw.t / tw.dur); tw.fn(k);
      if (k >= 1) { tweens.splice(i, 1); if (tw.done) tw.done(); }
    }
    if (model && rise < 1) {
      rise = Math.min(1, rise + dt / 1.1); var u = rise - 1, kk = 1 + 2.6 * u * u * u + 1.6 * u * u;
      model.scale.set(mscale, mscale * Math.max(0.02, kk), mscale);
    }
    var eff = self.paused ? 0 : dt; time += eff;
    if (obj && obj.tick && !self.modelErr) { try { obj.tick(time, eff); } catch (e) { self.modelErr = true; if (window.console) console.error('3D 동작 오류', e); } }
    /* 카메라: 목표 쪽으로 부드럽게 */
    var gth = goal.theta + user.dt, gph = MX.clamp(goal.phi + user.dp, 0.18, 1.45), pts = goal.pts ? ptsFor(goal.pts) : null;
    var gr = (pts ? Math.max(goal.min, fitPts(pts, goal.t, gth, gph)) : fitR(goal.R)) * user.z;
    var a = snap ? 1 : 1 - Math.exp(-dt * 3.2); snap = false;
    gT.set(goal.t.x + user.px, goal.t.y, goal.t.z + user.pz); cur.t.lerp(gT, a); cur.theta += (gth - cur.theta) * a; cur.phi += (gph - cur.phi) * a; cur.r += (gr - cur.r) * a;
    var sp = Math.sin(cur.phi);
    cam.position.set(cur.t.x + cur.r * sp * Math.sin(cur.theta), cur.t.y + cur.r * Math.cos(cur.phi), cur.t.z + cur.r * sp * Math.cos(cur.theta));
    cam.lookAt(cur.t);
    var w = canvas.clientWidth || 1, h = canvas.clientHeight || 1, tx = -(ins.l - ins.r) / 2, ty = (ins.b - ins.t) / 2;
    vo.x += (tx - vo.x) * (self.still ? 1 : 1 - Math.exp(-dt * 5)); vo.y += (ty - vo.y) * (self.still ? 1 : 1 - Math.exp(-dt * 5));
    cam.setViewOffset(w, h, vo.x, vo.y, w, h);
    r.render(scene, cam);
  }
  this.resize(); this.ok = true;
  if (window.ResizeObserver) new ResizeObserver(function () { self.resize(); }).observe(canvas);
  window.addEventListener('resize', function () { self.resize(); });
  requestAnimationFrame(frame);
}
