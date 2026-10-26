/* ink.js — 잉크 펜화 느낌의 3D 재질과 레슨용 3D 도우미
   · 채도가 낮은 색 → 흰 종이에 펜으로 그린 모형(어두운 쪽은 빗금)
   · 채도가 높은 색 → 빛나는 색(확률·개수 같은 '양'을 나타내는 부분)
   THREE를 불러온 뒤 INK.init(THREE)를 먼저 호출합니다. */
var INK = (function () {
  var T = null, U = null, EDGE = null, HULL = null;

  var FRAG = [
    '{',
    '  vec3 base = diffuseColor.rgb;',
    '  float mx = max(base.r, max(base.g, base.b)), mn = min(base.r, min(base.g, base.b));',
    '  float sat = mx - mn;',
    '  float bl = max(dot(base, vec3(0.299, 0.587, 0.114)), 0.05);',
    '  float lit = clamp(dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114)) / bl, 0.0, 1.4);',
    '  vec2 fc = gl_FragCoord.xy / uPx;',
    '  float d1 = abs(fract((fc.x + fc.y) / 5.0) - 0.5);',
    '  float d2 = abs(fract((fc.x - fc.y) / 6.5) - 0.5);',
    '  float h1 = (1.0 - smoothstep(0.07, 0.19, d1)) * smoothstep(0.92, 0.6, lit);',
    '  float h2 = (1.0 - smoothstep(0.07, 0.19, d2)) * smoothstep(0.58, 0.32, lit);',
    '  float glow = smoothstep(0.30, 0.42, sat) * step(0.3, mx);',
    '  vec3 paper = uPaper * mix(0.84, 1.0, clamp(lit, 0.0, 1.0)) * mix(0.8, 1.0, smoothstep(0.1, 0.75, bl));',
    '  vec3 inked = mix(paper, uInk, max(h1, h2) * 0.5);',
    '  vec3 liquid = base * (0.7 + 0.3 * clamp(lit, 0.0, 1.0)) + base * 0.3 + emissive * 0.4;',
    '  gl_FragColor.rgb = mix(inked, liquid, glow);',
    '}'
  ].join('\n');

  var HULL_V = [
    'uniform float uW;',
    'void main() {',
    '  vec4 p = vec4(position, 1.0);',
    '  vec3 n = normal;',
    '  #ifdef USE_INSTANCING',
    '    p = instanceMatrix * p;',
    '    n = mat3(instanceMatrix) * n;',
    '  #endif',
    '  vec4 mv = modelViewMatrix * p;',
    '  vec3 vn = normalize(normalMatrix * n);',
    '  mv.xyz += vn * uW * max(-mv.z, 1.0);',
    '  gl_Position = projectionMatrix * mv;',
    '}'
  ].join('\n');
  var HULL_F = 'uniform vec3 uC; void main() { gl_FragColor = vec4(uC, 1.0); }';

  function init(three) {
    T = three;
    U = { px: { value: Math.min(window.devicePixelRatio || 1, 2) }, paper: { value: new T.Color('#fbf9f3') }, ink: { value: new T.Color('#2a2833') } };
    EDGE = new T.LineBasicMaterial({ color: '#2a2833', transparent: true, opacity: 0.8 });
    HULL = new T.ShaderMaterial({ uniforms: { uW: { value: 0.0011 }, uC: { value: new T.Color('#2a2833') } }, vertexShader: HULL_V, fragmentShader: HULL_F, side: T.BackSide });
    EDGE.userData.shared = HULL.userData.shared = true;
  }
  function patch(sh) {
    sh.uniforms.uPx = U.px; sh.uniforms.uPaper = U.paper; sh.uniforms.uInk = U.ink;
    sh.fragmentShader = 'uniform float uPx;\nuniform vec3 uPaper;\nuniform vec3 uInk;\n' + sh.fragmentShader.replace('#include <dithering_fragment>', FRAG + '\n#include <dithering_fragment>');
  }
  function key() { return 'ink1'; }

  /* 잉크 재질: 레슨 코드의 H.mat(색, 옵션)과 같은 모양으로 씁니다 */
  function mat(c, o) {
    o = o || {};
    var m = new T.MeshLambertMaterial({ color: c });
    if (o.emissive) m.emissive = new T.Color(o.emissive);
    if (o.transparent) m.transparent = true;
    if (o.opacity !== undefined) { m.opacity = o.opacity; if (o.opacity < 1) m.transparent = true; }
    if (o.side !== undefined) m.side = o.side;
    if (o.vertexColors) m.vertexColors = true;
    m.onBeforeCompile = patch; m.customProgramCacheKey = key;
    return m;
  }

  /* 새로 생긴 메시마다 윤곽선(뒷면 껍질)과 모서리 선을 붙입니다 */
  function noRay() { }
  function inkify(root) {
    root.traverse(function (m) {
      if (!m.isMesh || m.userData.ink) return;
      m.userData.ink = 1;
      if (m.userData.noInk) return;
      m.castShadow = true; m.receiveShadow = true;
      var mt = m.material, ghost = mt && mt.transparent && mt.opacity < 0.6;
      /* 여러 개를 한 번에 그리는 작은 물체(InstancedMesh)는 윤곽 껍질을 빼야 검게 뭉개지지 않음 */
      if (!ghost && !m.isInstancedMesh) {
        var hull = new T.Mesh(m.geometry, HULL);
        hull.userData.ink = 1; hull.castShadow = false; hull.raycast = noRay; hull.frustumCulled = m.frustumCulled;
        m.add(hull);
      }
      if (!m.isInstancedMesh && m.geometry && m.geometry.attributes.position && m.geometry.attributes.position.count < 8000) {
        var e = new T.LineSegments(new T.EdgesGeometry(m.geometry, 32), EDGE); e.userData.ink = 1; e.raycast = noRay; m.add(e);
      }
    });
  }

  /* 손글씨 꼬리표 (모형 위 라벨) */
  var HAND = '"Nanum Pen Script","Segoe Print","Comic Sans MS",cursive';
  function drawTag(cv, text, o) {
    var c = cv.getContext('2d'); c.clearRect(0, 0, cv.width, cv.height);
    var fs = 76; c.font = fs + 'px ' + HAND;
    var w = c.measureText(text).width; if (w > 210) { fs = Math.floor(fs * 210 / w); c.font = fs + 'px ' + HAND; w = c.measureText(text).width; }
    var bw = Math.max(70, w + 34), bh = 84, x = 128 - bw / 2, y = 64 - bh / 2;
    c.fillStyle = 'rgba(255,253,246,0.94)'; c.strokeStyle = '#2a2833'; c.lineWidth = 3;
    c.beginPath(); if (c.roundRect) c.roundRect(x, y, bw, bh, 8); else c.rect(x, y, bw, bh); c.fill(); c.stroke();
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = (o && o.color) || '#2a2833'; c.fillText(text, 128, 68);
  }

  /* 레슨의 build3d(X)에 넘기는 도우미 H */
  function makeH() {
    var cache = {}, H = {};
    H.mat = mat;
    H.box = function (w, h, d, c, o) { return new T.Mesh(new T.BoxGeometry(w, h, d), mat(c, o)); };
    H.sph = function (r, c, o) { return new T.Mesh(new T.SphereGeometry(r, 24, 16), mat(c, o)); };
    H.cyl = function (rt, rb, h, c, o) { return new T.Mesh(new T.CylinderGeometry(rt, rb, h, 32), mat(c, o)); };
    H.cone = function (r, h, c, o) { return new T.Mesh(new T.ConeGeometry(r, h, 32), mat(c, o)); };
    H.segs = function (arr, color) { var g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(arr, 3)); return new T.LineSegments(g, new T.LineBasicMaterial({ color: color || '#2a2833' })); };
    H.label = function (text, o) {
      o = o || {}; var k = text + '|' + (o.color || ''), tex = cache[k];
      if (!tex) { var cv = document.createElement('canvas'); cv.width = 256; cv.height = 128; drawTag(cv, text, o); tex = new T.CanvasTexture(cv); tex.userData = { cached: true }; cache[k] = tex; }
      var sp = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false })), s = o.size || 0.6;
      sp.scale.set(s * 2, s, 1); sp.renderOrder = 5; return sp;
    };
    H.dyn = function (o) {
      o = o || {}; var cv = document.createElement('canvas'); cv.width = 256; cv.height = 128;
      var tex = new T.CanvasTexture(cv), sp = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false })), s = o.size || 0.6, last = null;
      sp.scale.set(s * 2, s, 1); sp.renderOrder = 5;
      return { sprite: sp, set: function (text) { if (text === last) return; last = text; drawTag(cv, text, o); tex.needsUpdate = true; } };
    };
    H.free = function (obj) {
      obj.traverse(function (n) {
        if (n.geometry) n.geometry.dispose();
        var m = n.material; if (m && !(m.userData && m.userData.shared)) { if (m.map && !(m.map.userData && m.map.userData.cached)) m.map.dispose(); m.dispose(); }
      });
    };
    H.clear = function (g) { while (g.children.length) { var ch = g.children[0]; g.remove(ch); H.free(ch); } };
    H.redrawTags = function () { /* 글꼴을 늦게 받았을 때 꼬리표 다시 그리기 */
      Object.keys(cache).forEach(function (k) { var p = k.split('|'); drawTag(cache[k].image, p[0], { color: p[1] || null }); cache[k].needsUpdate = true; });
    };
    return H;
  }

  function setPx(px) { if (U) U.px.value = px; }
  return { init: init, mat: mat, inkify: inkify, makeH: makeH, setPx: setPx, HAND: HAND };
})();
