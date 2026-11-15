function m4() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

function m4mul(a, b) {
  var o = new Array(16);
  for (var c = 0; c < 4; c++) {
    for (var r = 0; r < 4; r++) {
      o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    }
  }
  return o;
}

function m4trans(x, y, z) {
  var m = m4();
  m[12] = x;
  m[13] = y;
  m[14] = z;
  return m;
}

function m4scale(x, y, z) {
  var m = m4();
  m[0] = x;
  m[5] = y;
  m[10] = z;
  return m;
}

function d2r(d) {
  return d * Math.PI / 180;
}

function m4rotx(d) {
  var m = m4();
  var c = Math.cos(d2r(d));
  var s = Math.sin(d2r(d));
  m[5] = c;
  m[6] = s;
  m[9] = -s;
  m[10] = c;
  return m;
}

function m4roty(d) {
  var m = m4();
  var c = Math.cos(d2r(d));
  var s = Math.sin(d2r(d));
  m[0] = c;
  m[2] = -s;
  m[8] = s;
  m[10] = c;
  return m;
}

function m4rotz(d) {
  var m = m4();
  var c = Math.cos(d2r(d));
  var s = Math.sin(d2r(d));
  m[0] = c;
  m[1] = s;
  m[4] = -s;
  m[5] = c;
  return m;
}

function m4compose(pos, rot, scl) {
  var r = m4mul(m4mul(m4rotx(rot[0] || 0), m4roty(rot[1] || 0)), m4rotz(rot[2] || 0));
  var m = m4();
  m[0] = r[0] * scl[0];
  m[1] = r[1] * scl[0];
  m[2] = r[2] * scl[0];
  m[4] = r[4] * scl[1];
  m[5] = r[5] * scl[1];
  m[6] = r[6] * scl[1];
  m[8] = r[8] * scl[2];
  m[9] = r[9] * scl[2];
  m[10] = r[10] * scl[2];
  m[12] = pos[0];
  m[13] = pos[1];
  m[14] = pos[2];
  return m;
}

function m4persp(fov, aspect, near, far) {
  var f = 1 / Math.tan(d2r(fov) / 2);
  var m = new Array(16).fill(0);
  m[0] = f / aspect;
  m[5] = f;
  m[10] = (far + near) / (near - far);
  m[11] = -1;
  m[14] = 2 * far * near / (near - far);
  return m;
}

function m4ortho(l, r, b, t, n, f) {
  var m = m4();
  m[0] = 2 / (r - l);
  m[5] = 2 / (t - b);
  m[10] = -2 / (f - n);
  m[12] = -(r + l) / (r - l);
  m[13] = -(t + b) / (t - b);
  m[14] = -(f + n) / (f - n);
  return m;
}

function vnorm(v) {
  var l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}

function vcross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function vsub(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function vdot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function m4lookat(eye, target, up) {
  var z = vnorm(vsub(eye, target));
  var x = vnorm(vcross(up || [0, 1, 0], z));
  var y = vcross(z, x);
  var m = m4();
  m[0] = x[0];
  m[1] = y[0];
  m[2] = z[0];
  m[4] = x[1];
  m[5] = y[1];
  m[6] = z[1];
  m[8] = x[2];
  m[9] = y[2];
  m[10] = z[2];
  m[12] = -vdot(x, eye);
  m[13] = -vdot(y, eye);
  m[14] = -vdot(z, eye);
  return m;
}

function cameramatrices(cam, w, h) {
  var proj = cam.ortho ? m4ortho(-cam.halfw, cam.halfw, -cam.halfw * h / w, cam.halfw * h / w, 0.1, 500) : m4persp(cam.fov || 45, w / Math.max(1, h), 0.1, 500);
  var view = m4lookat(cam.eye, cam.target, [0, 1, 0]);
  return { proj: proj, view: view, vp: m4mul(proj, view) };
}

function m4point(m, p) {
  var x = p[0], y = p[1], z = p[2];
  return [
    m[0] * x + m[4] * y + m[8] * z + m[12],
    m[1] * x + m[5] * y + m[9] * z + m[13],
    m[2] * x + m[6] * y + m[10] * z + m[14],
    m[3] * x + m[7] * y + m[11] * z + m[15]
  ];
}

function projectpoint(vp, p, w, h) {
  var c = m4point(vp, p);
  if (c[3] <= 0.0001) return null;
  return [(c[0] / c[3] * 0.5 + 0.5) * w, (0.5 - c[1] / c[3] * 0.5) * h, c[2] / c[3]];
}

function m4decompose(m) {
  var sx = Math.hypot(m[0], m[1], m[2]);
  var sy = Math.hypot(m[4], m[5], m[6]);
  var sz = Math.hypot(m[8], m[9], m[10]);
  var det = m[0] * (m[5] * m[10] - m[6] * m[9]) - m[4] * (m[1] * m[10] - m[2] * m[9]) + m[8] * (m[1] * m[6] - m[2] * m[5]);
  if (det < 0) sx = -sx;
  var rm = [
    m[0] / sx, m[1] / sx, m[2] / sx,
    m[4] / sy, m[5] / sy, m[6] / sy,
    m[8] / sz, m[9] / sz, m[10] / sz
  ];
  var tr = rm[0] + rm[4] + rm[8];
  var qw, qx, qy, qz;
  if (tr > 0) {
    var s = Math.sqrt(tr + 1) * 2;
    qw = 0.25 * s;
    qx = (rm[7] - rm[5]) / s;
    qy = (rm[2] - rm[6]) / s;
    qz = (rm[3] - rm[1]) / s;
  } else if (rm[0] > rm[4] && rm[0] > rm[8]) {
    var s1 = Math.sqrt(1 + rm[0] - rm[4] - rm[8]) * 2;
    qw = (rm[7] - rm[5]) / s1;
    qx = 0.25 * s1;
    qy = (rm[1] + rm[3]) / s1;
    qz = (rm[2] + rm[6]) / s1;
  } else if (rm[4] > rm[8]) {
    var s2 = Math.sqrt(1 + rm[4] - rm[0] - rm[8]) * 2;
    qw = (rm[2] - rm[6]) / s2;
    qx = (rm[1] + rm[3]) / s2;
    qy = 0.25 * s2;
    qz = (rm[5] + rm[7]) / s2;
  } else {
    var s3 = Math.sqrt(1 + rm[8] - rm[0] - rm[4]) * 2;
    qw = (rm[3] - rm[1]) / s3;
    qx = (rm[2] + rm[6]) / s3;
    qy = (rm[5] + rm[7]) / s3;
    qz = 0.25 * s3;
  }
  return { pos: [m[12], m[13], m[14]], scale: [sx, sy, sz], quat: [qx, qy, qz, qw] };
}

function rayfromscreen(cam, sx, sy, w, h) {
  var forward = vnorm(vsub(cam.target, cam.eye));
  var right = vnorm(vcross(forward, [0, 1, 0]));
  var up = vcross(right, forward);
  var t = Math.tan(d2r(cam.fov || 45) / 2);
  var ndx = (sx / w) * 2 - 1;
  var ndy = 1 - (sy / h) * 2;
  var dir = vnorm([
    forward[0] + right[0] * ndx * t * (w / h) + up[0] * ndy * t,
    forward[1] + right[1] * ndx * t * (w / h) + up[1] * ndy * t,
    forward[2] + right[2] * ndx * t * (w / h) + up[2] * ndy * t
  ]);
  return { origin: cam.eye.slice(), dir: dir };
}

function raybox(ro, rd, min, max) {
  var tmin = -Infinity;
  var tmax = Infinity;
  for (var i = 0; i < 3; i++) {
    if (Math.abs(rd[i]) < 1e-8) {
      if (ro[i] < min[i] || ro[i] > max[i]) return null;
    } else {
      var t1 = (min[i] - ro[i]) / rd[i];
      var t2 = (max[i] - ro[i]) / rd[i];
      if (t1 > t2) {
        var tt = t1;
        t1 = t2;
        t2 = tt;
      }
      if (t1 > tmin) tmin = t1;
      if (t2 < tmax) tmax = t2;
      if (tmin > tmax) return null;
    }
  }
  if (tmax < 0) return null;
  return tmin >= 0 ? tmin : tmax;
}

function boxcorners(min, max) {
  var out = [];
  for (var i = 0; i < 8; i++) {
    out.push([i & 1 ? max[0] : min[0], i & 2 ? max[1] : min[1], i & 4 ? max[2] : min[2]]);
  }
  return out;
}

function matrixbounds(m, ext) {
  var min = [Infinity, Infinity, Infinity];
  var max = [-Infinity, -Infinity, -Infinity];
  for (var i = 0; i < 8; i++) {
    var p = m4point(m, [(i & 1 ? 1 : -1) * ext[0], (i & 2 ? 1 : -1) * ext[1], (i & 4 ? 1 : -1) * ext[2]]);
    for (var k = 0; k < 3; k++) {
      if (p[k] < min[k]) min[k] = p[k];
      if (p[k] > max[k]) max[k] = p[k];
    }
  }
  return { min: min, max: max };
}

var gfx = {
  backend: "three",
  libs: { three: null, faoxomjs: null },
  smooth: true,
  ratio: 1.5
};

function gfxlibs() {
  gfx.libs.three = window.THREE || null;
  gfx.libs.faoxomjs = window.FaoxomJs || null;
}

function gfxboot() {
  gfxlibs();
  if (view && view.canvas && view.main && view.main.kind === "none" && (window.THREE || window.FaoxomJs)) {
    view.main = makeview(view.canvas);
    if (view.previewcanvas) view.preview = makeview(view.previewcanvas);
    if (typeof resizestage === "function") resizestage();
  }
  if (typeof refreshall === "function") refreshall();
}

function makiname() {
  return "view" + Math.floor(Math.random() * 1000000);
}

function makeview(canvas) {
  if (gfx.backend === "faoxomjs" && window.FaoxomJs) return makefaoxview(canvas);
  if (window.THREE) return makethreeview(canvas);
  return makeemptyview(canvas);
}

function makeemptyview(canvas) {
  var v = {};
  v.kind = "none";
  v.canvas = canvas;
  v.error = "no 3d library available";
  v.resize = function () {};
  v.render = function () {
    var g = canvas.getContext("2d");
    if (g) {
      g.fillStyle = "#c5e4ff";
      g.fillRect(0, 0, canvas.width, canvas.height);
    }
  };
  v.dispose = function () {};
  return v;
}


function viewportw(v) {
  return Math.max(1, v.w || (v.canvas && v.canvas.width) || 1);
}

function viewporth(v) {
  return Math.max(1, v.h || (v.canvas && v.canvas.height) || 1);
}

function makethreepost(v) {
  var T = window.THREE;
  var post = { active: true };
  post.rt = new T.WebGLRenderTarget(2, 2, { minFilter: T.LinearFilter, magFilter: T.LinearFilter, depthBuffer: true, stencilBuffer: false });
  post.rta = new T.WebGLRenderTarget(2, 2, { minFilter: T.LinearFilter, magFilter: T.LinearFilter, depthBuffer: false });
  post.rtb = new T.WebGLRenderTarget(2, 2, { minFilter: T.LinearFilter, magFilter: T.LinearFilter, depthBuffer: false });
  post.rt.texture.encoding = T.LinearEncoding;
  post.rta.texture.encoding = T.LinearEncoding;
  post.rtb.texture.encoding = T.LinearEncoding;
  post.cam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  post.scene = new T.Scene();
  var vert = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy * 2.0, 0.0, 1.0); }";
  post.bright = new T.ShaderMaterial({
    uniforms: { tScene: { value: null }, uThresh: { value: 0.9 } },
    vertexShader: vert,
    fragmentShader: "precision highp float; uniform sampler2D tScene; uniform float uThresh; varying vec2 vUv; void main(){ vec3 c = texture2D(tScene, vUv).rgb; float l = dot(c, vec3(0.299, 0.587, 0.114)); float k = max(0.0, l - uThresh) / max(0.0001, 1.0 - uThresh); gl_FragColor = vec4(c * k, 1.0); }"
  });
  post.blur = new T.ShaderMaterial({
    uniforms: { tMap: { value: null }, uDir: { value: new T.Vector2(1, 0) } },
    vertexShader: vert,
    fragmentShader: "precision highp float; uniform sampler2D tMap; uniform vec2 uDir; varying vec2 vUv; void main(){ vec3 sum = vec3(0.0); sum += texture2D(tMap, vUv - uDir * 4.0).rgb * 0.051; sum += texture2D(tMap, vUv - uDir * 3.0).rgb * 0.0918; sum += texture2D(tMap, vUv - uDir * 2.0).rgb * 0.12245; sum += texture2D(tMap, vUv - uDir).rgb * 0.1531; sum += texture2D(tMap, vUv).rgb * 0.1633; sum += texture2D(tMap, vUv + uDir).rgb * 0.1531; sum += texture2D(tMap, vUv + uDir * 2.0).rgb * 0.12245; sum += texture2D(tMap, vUv + uDir * 3.0).rgb * 0.0918; sum += texture2D(tMap, vUv + uDir * 4.0).rgb * 0.051; gl_FragColor = vec4(sum, 1.0); }"
  });
  post.comp = new T.ShaderMaterial({
    uniforms: {
      tScene: { value: null },
      tBloom: { value: null },
      uRes: { value: new T.Vector2(1, 1) },
      uBloom: { value: 0 },
      uDof: { value: 0 },
      uAo: { value: 0 },
      uFxaa: { value: 0 },
      uGrade: { value: 0 },
      uSat: { value: 1 }
    },
    vertexShader: vert,
    fragmentShader: [
      "precision highp float;",
      "uniform sampler2D tScene; uniform sampler2D tBloom;",
      "uniform vec2 uRes; uniform float uBloom; uniform float uDof; uniform float uAo; uniform float uFxaa; uniform float uGrade; uniform float uSat;",
      "varying vec2 vUv;",
      "float luma(vec3 c){ return dot(c, vec3(0.299, 0.587, 0.114)); }",
      "void main(){",
      "  vec2 px = 1.0 / uRes;",
      "  vec3 c = texture2D(tScene, vUv).rgb;",
      "  if (uFxaa > 0.5) {",
      "    float lm = luma(c);",
      "    float ln = luma(texture2D(tScene, vUv + vec2(0.0, -px.y)).rgb);",
      "    float ls = luma(texture2D(tScene, vUv + vec2(0.0, px.y)).rgb);",
      "    float le = luma(texture2D(tScene, vUv + vec2(px.x, 0.0)).rgb);",
      "    float lw = luma(texture2D(tScene, vUv + vec2(-px.x, 0.0)).rgb);",
      "    float edge = abs(ln + ls + le + lw - 4.0 * lm);",
      "    if (edge > 0.06) {",
      "      vec3 blur = (texture2D(tScene, vUv + vec2(px.x, 0.0)).rgb + texture2D(tScene, vUv - vec2(px.x, 0.0)).rgb + texture2D(tScene, vUv + vec2(0.0, px.y)).rgb + texture2D(tScene, vUv - vec2(0.0, px.y)).rgb) * 0.25;",
      "      c = mix(c, blur, clamp(edge * 2.4, 0.0, 0.65));",
      "    }",
      "  }",
      "  if (uDof > 0.01) {",
      "    vec2 d = vUv - 0.5;",
      "    float rad = length(d) * 2.0;",
      "    float k = clamp((rad - 0.35) * 1.6, 0.0, 1.0) * uDof;",
      "    vec3 blur = vec3(0.0);",
      "    blur += texture2D(tScene, vUv + d * 0.018).rgb;",
      "    blur += texture2D(tScene, vUv - d * 0.018).rgb;",
      "    blur += texture2D(tScene, vUv + vec2(d.y, -d.x) * 0.014).rgb;",
      "    blur += texture2D(tScene, vUv - vec2(d.y, -d.x) * 0.014).rgb;",
      "    c = mix(c, blur * 0.25, k);",
      "  }",
      "  if (uAo > 0.01) {",
      "    float l = luma(c);",
      "    float ln = luma(texture2D(tScene, vUv + vec2(0.0, -px.y * 3.0)).rgb);",
      "    float ls = luma(texture2D(tScene, vUv + vec2(0.0, px.y * 3.0)).rgb);",
      "    float le = luma(texture2D(tScene, vUv + vec2(px.x * 3.0, 0.0)).rgb);",
      "    float lw = luma(texture2D(tScene, vUv - vec2(px.x * 3.0, 0.0)).rgb);",
      "    float occ = clamp((l - (ln + ls + le + lw) * 0.25) * 3.5, 0.0, 1.0);",
      "    c *= 1.0 - occ * 0.45 * uAo;",
      "  }",
      "  c += texture2D(tBloom, vUv).rgb * uBloom;",
      "  if (uGrade > 0.5) {",
      "    float g = luma(c);",
      "    c = mix(vec3(g), c, uSat);",
      "  }",
      "  gl_FragColor = vec4(c, 1.0);",
      "}"
    ].join("\n")
  });
  post.quad = new T.Mesh(new T.PlaneGeometry(1, 1), post.comp);
  post.quad.frustumCulled = false;
  post.scene.add(post.quad);
  post.quadbright = new T.Mesh(new T.PlaneGeometry(1, 1), post.bright);
  post.quadbright.frustumCulled = false;
  post.blurry = new T.Mesh(new T.PlaneGeometry(1, 1), post.blur);
  post.blurry.frustumCulled = false;
  post.pass = function (mat, target) {
    post.quad.material = mat;
    v.renderer.setRenderTarget(target || null);
    v.renderer.render(post.scene, post.cam);
  };
  post.render = function (renderer, scene, cam, w, h) {
    var g = gfx.opts || {};
    var bw = Math.max(2, Math.round(w / 4));
    var bh = Math.max(2, Math.round(h / 4));
    if (post.rt.width !== w || post.rt.height !== h) {
      post.rt.setSize(w, h);
      post.rta.setSize(bw, bh);
      post.rtb.setSize(bw, bh);
    }
    var oldenc = renderer.outputEncoding;
    renderer.setRenderTarget(post.rt);
    renderer.clear();
    renderer.render(scene, cam);
    renderer.outputEncoding = T.LinearEncoding;
    var bloom = g.bloom ? 0.42 : 0;
    if (bloom > 0) {
      post.quad.material = post.bright;
      post.bright.uniforms.tScene.value = post.rt.texture;
      renderer.setRenderTarget(post.rta);
      renderer.render(post.scene, post.cam);
      post.blur.uniforms.tMap.value = post.rta.texture;
      post.blur.uniforms.uDir.value.set(1 / bw, 0);
      post.quad.material = post.blur;
      renderer.setRenderTarget(post.rtb);
      renderer.render(post.scene, post.cam);
      post.blur.uniforms.tMap.value = post.rtb.texture;
      post.blur.uniforms.uDir.value.set(0, 1 / bh);
      renderer.setRenderTarget(post.rta);
      renderer.render(post.scene, post.cam);
    }
    post.comp.uniforms.tScene.value = post.rt.texture;
    post.comp.uniforms.tBloom.value = post.rta.texture;
    post.comp.uniforms.uRes.value.set(w, h);
    post.comp.uniforms.uBloom.value = bloom;
    post.comp.uniforms.uDof.value = g.dof ? 1 : 0;
    post.comp.uniforms.uAo.value = g.ao ? 1 : 0;
    post.comp.uniforms.uFxaa.value = g.fxaa ? 1 : 0;
    post.comp.uniforms.uGrade.value = 0;
    post.quad.material = post.comp;
    renderer.setRenderTarget(null);
    renderer.render(post.scene, post.cam);
    renderer.outputEncoding = oldenc;
  };
  return post;
}

function makethreeview(canvas) {
  var T = window.THREE;
  var v = {};
  v.kind = "three";
  v.canvas = canvas;
  v.error = null;
  v.ratio = 1;
  v.meshes = {};
  v.mats = {};
  v.textures = {};
  v.geos = {};
  v.renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  v.renderer.outputEncoding = T.sRGBEncoding;
  v.renderer.shadowMap.enabled = false;
  v.renderer.shadowMap.type = T.PCFSoftShadowMap;
  v.camera2 = new T.OrthographicCamera(-10, 10, 10, -10, 0.1, 800);
  v.post = makethreepost(v);
  v.renderer.setClearColor(0xc5e4ff, 1);
  v.scene = new T.Scene();
  v.camera = new T.PerspectiveCamera(45, 1, 0.1, 800);
  v.ambient = new T.AmbientLight(0xffffff, 0.62);
  v.scene.add(v.ambient);
  v.sun = new T.DirectionalLight(0xffffff, 0.95);
  v.sun.position.set(-5, 12, 7);
  v.sun.castShadow = false;
  v.sun.shadow.mapSize.width = 1024;
  v.sun.shadow.mapSize.height = 1024;
  v.sun.shadow.camera.left = -16;
  v.sun.shadow.camera.right = 16;
  v.sun.shadow.camera.top = 16;
  v.sun.shadow.camera.bottom = -16;
  v.sun.shadow.camera.near = 1;
  v.sun.shadow.camera.far = 60;
  v.sun.shadow.bias = -0.0015;
  v.scene.add(v.sun);
  v.gridtex = makethreetexture(v, artmake("grid"));
  v.gridtex.wrapS = T.RepeatWrapping;
  v.gridtex.wrapT = T.RepeatWrapping;
  v.gridtex.repeat.set(400, 400);
  v.gridmat = new T.MeshBasicMaterial({ map: v.gridtex, depthWrite: false });
  v.gridmesh = new T.Mesh(new T.PlaneGeometry(360, 360), v.gridmat);
  v.gridmesh.rotation.x = -Math.PI / 2;
  v.gridmesh.position.y = -0.001;
  v.scene.add(v.gridmesh);

  v.geos.box = new T.BoxGeometry(1, 1, 1);
  v.geos.plane = new T.PlaneGeometry(1, 1);
  v.geos.quad = new T.PlaneGeometry(1, 1);
  v.geos.sphere = new T.SphereGeometry(0.5, 24, 16);
  v.geos.cylinder = new T.CylinderGeometry(0.5, 0.5, 1, 24);
  v.geos.cone = new T.ConeGeometry(0.5, 1, 24);
  v.geos.torus = new T.TorusGeometry(0.4, 0.16, 12, 28);
  v.geos.capsule = T.CapsuleGeometry ? new T.CapsuleGeometry(0.35, 0.5, 8, 16) : new T.CylinderGeometry(0.35, 0.35, 1, 20);

  v.resize = function (w, h) {
    var pr = Math.min(window.devicePixelRatio || 1, gfx.ratio || 1);
    v.w = w;
    v.h = h;
    v.renderer.setPixelRatio(pr);
    v.renderer.setSize(w, h, false);
    v.camera.aspect = w / Math.max(1, h);
    v.camera.updateProjectionMatrix();
  };

  v.render = function (items, cam, env) {
    if (!v.post && typeof makethreepost === "function") v.post = makethreepost(v);
    var gopt = gfx.opts || {};
    if (v.post) v.post.active = !!(gopt.bloom || gopt.dof || gopt.ao || gopt.fxaa);
    v.renderer.setClearColor(env.bg || "#c5e4ff", 1);
    v.gridmesh.visible = env.grid !== false;
    v.gridmesh.position.y = env.gridy === undefined ? -0.001 : env.gridy;
    v.ambient.color.set(env.ambient || "#ffffff");
    v.ambient.intensity = env.strength === undefined ? 0.62 : env.strength;
    v.sun.color.set(env.suncolor || "#ffffff");
    v.sun.intensity = env.sunintensity === undefined ? 0.95 : env.sunintensity;
    var activecam = v.camera;
    if (cam.ortho) {
      activecam = v.camera2;
      var halfw = cam.halfw || 6;
      var halfh = halfw * v.h / Math.max(1, v.w);
      activecam.left = -halfw;
      activecam.right = halfw;
      activecam.top = halfh;
      activecam.bottom = -halfh;
      activecam.near = 0.1;
      activecam.far = 800;
    } else {
      activecam.fov = cam.fov || 45;
      activecam.near = 0.1;
      activecam.far = 800;
    }
    activecam.updateProjectionMatrix();
    activecam.position.set(cam.eye[0], cam.eye[1], cam.eye[2]);
    activecam.up.set(0, 1, 0);
    activecam.lookAt(cam.target[0], cam.target[1], cam.target[2]);
    v.activecam = activecam;
    var gfxopt = gfx.opts || {};
    v.renderer.shadowMap.enabled = !!gfxopt.shadows;
    if (gfxopt.shadows) {
      var smap = Math.min(4096, Math.max(256, gfxopt.shadowsize || 1024));
      if (v.sun.shadow.mapSize.width !== smap) {
        v.sun.shadow.mapSize.width = smap;
        v.sun.shadow.mapSize.height = smap;
        if (v.sun.shadow.map) {
          v.sun.shadow.map.dispose();
          v.sun.shadow.map = null;
        }
      }
      v.sun.castShadow = true;
      v.scene.traverse(function (obj) {
        if (obj.isMesh && obj !== v.gridmesh) {
          obj.castShadow = true;
          obj.receiveShadow = true;
        }
      });
    }
    v.renderer.toneMapping = gfxopt.tonemap === "aces" ? T.ACESFilmicToneMapping : gfxopt.tonemap === "reinhard" ? T.ReinhardToneMapping : T.NoToneMapping;
    v.renderer.toneMappingExposure = 1;
    var seen = {};
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      seen[it.id] = true;
      var rec = v.meshes[it.id];
      var matkey = itemkey(it);
      if (!rec || rec.kind !== it.kind || rec.matkey !== matkey || rec.geokey !== (it.geokey || "")) {
        if (rec) {
          v.scene.remove(rec.mesh);
          if (rec.mesh.material) {
            if (Array.isArray(rec.mesh.material)) rec.mesh.material.forEach(function (mm) { mm.dispose(); });
            else rec.mesh.material.dispose();
          }
        }
        var mats = makethreemats(v, it);
        var geo3 = v.geos[it.kind] || v.geos.box;
        if (it.geokey && it.geo) geo3 = customgeo(v, it);
        var mesh = new T.Mesh(geo3, mats);
        mesh.matrixAutoUpdate = false;
        mesh.frustumCulled = false;
        v.scene.add(mesh);
        rec = v.meshes[it.id] = { mesh: mesh, kind: it.kind, matkey: matkey, geokey: it.geokey || "" };
      }
      var mm = new T.Matrix4();
      mm.fromArray(it.matrix);
      rec.mesh.matrix.copy(mm);
      rec.mesh.matrixWorldNeedsUpdate = true;
      rec.mesh.visible = it.visible !== false;
      if (gfxopt.shadows && rec.mesh !== v.gridmesh) {
        rec.mesh.castShadow = it.kind !== "plane";
        rec.mesh.receiveShadow = true;
      }
    }
    for (var key in v.meshes) {
      if (!seen[key]) {
        var old = v.meshes[key];
        v.scene.remove(old.mesh);
        delete v.meshes[key];
      }
    }
    if (typeof view5sync === "function") view5sync(v, items, cam, env);
    if (v.post && v.post.active) v.post.render(v.renderer, v.scene, v.activecam || v.camera, viewportw(v), viewporth(v));
    else {
      v.renderer.setRenderTarget(null);
      v.renderer.render(v.scene, v.activecam || v.camera);
    }
  };

  v.dispose = function () {
    for (var k in v.meshes) v.scene.remove(v.meshes[k].mesh);
    v.meshes = {};
    v.renderer.dispose();
  };
  return v;
}

function customgeo(v, it) {
  v.customgeos = v.customgeos || {};
  var key = it.geokey;
  if (v.customgeos[key]) return v.customgeos[key];
  var nkeys = Object.keys(v.customgeos).length;
  if (nkeys > 400) {
    for (var ck in v.customgeos) {
      var og = v.customgeos[ck];
      if (og && typeof og.dispose === "function") og.dispose();
    }
    v.customgeos = {};
  }
  var part = it.geo;
  var pos = new Float32Array(part.pos);
  var idx = new Uint32Array(part.idx);
  var geo = null;
  var cols = part.col && part.col.length ? new Float32Array(part.col) : null;
  if (v.kind === "three" && window.THREE) {
    var T = window.THREE;
    geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.BufferAttribute(pos, 3));
    if (cols) geo.setAttribute("color", new T.BufferAttribute(cols, 3));
    geo.setIndex(new T.BufferAttribute(idx, 1));
    geo.computeVertexNormals();
  } else if (window.FaoxomJs) {
    var F = window.FaoxomJs;
    geo = new F.Geometry();
    geo.setAttribute("position", pos, 3);
    if (cols) geo.setAttribute("color", cols, 3);
    geo.setIndex(idx);
    geo.computeVertexNormals();
  }
  v.customgeos[key] = geo;
  return geo;
}

function itemkey(it) {
  return [it.kind, it.texid || "", it.color || "", it.opacity === undefined ? 1 : it.opacity, it.unlit ? 1 : 0, it.double ? 1 : 0, it.sidecolor || "", it.faces || "", it.vcolor ? 1 : 0].join("|");
}

function makethreetexture(v, canvas) {
  var T = window.THREE;
  var tex = new T.CanvasTexture(canvas);
  tex.magFilter = T.NearestFilter;
  tex.minFilter = T.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.encoding = T.sRGBEncoding;
  return tex;
}

function makethreemats(v, it) {
  var T = window.THREE;
  var op = it.opacity === undefined ? 1 : it.opacity;
  function gettex() {
    var key = it.texid || "none";
    var canvas = it.texture || it.tex;
    if (!v.textures[key] || (canvas && v.textures[key].userData.ver !== canvas.artversion)) {
      var tex = makethreetexture(v, canvas || artmake("crate"));
      tex.userData.ver = canvas ? canvas.artversion : 0;
      v.textures[key] = tex;
    }
    return v.textures[key];
  }
  function mkmaterial(color, map, side) {
    var cls = it.unlit ? T.MeshBasicMaterial : T.MeshLambertMaterial;
    var opts = { color: color, transparent: op < 1 || !!it.blend, opacity: op, side: side || (it.double ? T.DoubleSide : T.FrontSide) };
    if (it.vcolor) opts.vertexColors = true;
    if (map) opts.map = gettex();
    if (map && !op) opts.alphaTest = 0.04;
    if (map) opts.alphaTest = 0.04;
    if (it.unlit) opts.depthWrite = true;
    return new cls(opts);
  }
  if (it.faces === "sprite" && it.texture) {
    var sidecol = new T.Color(it.sidecolor || "#c8794a");
    var front = mkmaterial("#ffffff", true);
    var side = new T.MeshLambertMaterial({ color: sidecol });
    var top = new T.MeshLambertMaterial({ color: sidecol.clone().multiplyScalar(1.12) });
    var bottom = new T.MeshLambertMaterial({ color: sidecol.clone().multiplyScalar(0.8) });
    return [side, side, top, bottom, front, front];
  }
  return mkmaterial(it.color || "#ffffff", !!it.texture);
}

function makefaoxview(canvas) {
  var F = window.FaoxomJs;
  var v = {};
  v.kind = "faoxomjs";
  v.canvas = canvas;
  v.error = null;
  v.meshes = {};
  v.geos = {};
  v.mats = {};
  v.textures = {};
  try {
    v.renderer = new F.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false, append: false, autoBatch: false, pixelRatio: Math.min(window.devicePixelRatio || 1, gfx.ratio || 1) });
  } catch (e) {
    v.error = String(e && e.message || e);
    return makeemptyview(canvas);
  }
  v.renderer.setClearColor(0xc5e4ff, 1);
  v.scene = new F.Scene();
  v.camera = new F.PerspectiveCamera(45, 1, 0.1, 800);
  v.camera2 = new F.OrthographicCamera(-10, 10, 10, -10, 0.1, 800);
  v.post = null;
  v.postbuild = function () {
    if (v.post || !F.PostProcessingComposer) return;
    try {
      v.post = new F.PostProcessingComposer(v.renderer);
    } catch (e) {
      v.post = null;
    }
  };
  v.ambient = new F.AmbientLight(0xffffff, 0.62);
  v.scene.add(v.ambient);
  v.sun = new F.DirectionalLight(0xffffff, 1.1);
  v.sun.position.set(-5, 12, 7);
  v.scene.add(v.sun);
  v.geos.box = new F.BoxGeometry(1, 1, 1);
  v.geos.plane = new F.PlaneGeometry(1, 1);
  v.geos.quad = new F.PlaneGeometry(1, 1);
  v.geos.sphere = new F.SphereGeometry(0.5, 22, 14);
  v.geos.cylinder = new F.CylinderGeometry(0.5, 0.5, 1, 22);
  v.geos.cone = new F.ConeGeometry(0.5, 1, 22);
  v.geos.torus = new F.TorusGeometry(0.4, 0.16, 10, 24);
  v.geos.grid = new F.PlaneGeometry(36, 36);
  var gridtex = new F.Texture(artmake("gridbaked"), { minFilter: "nearest", magFilter: "nearest", flipY: false, wrapS: "clamp", wrapT: "clamp" });
  v.gridmat = new F.BasicMaterial({ map: gridtex, side: "double" });
  v.gridmesh = new F.Mesh(v.geos.grid, v.gridmat);
  v.gridmesh.position.y = -0.001;
  v.gridmesh.rotation.x = -Math.PI / 2;
  v.scene.add(v.gridmesh);

  v.resize = function (w, h) {
    var pr = Math.min(window.devicePixelRatio || 1, gfx.ratio || 1);
    v.w = w;
    v.h = h;
    v.renderer.pixelRatio = pr;
    v.renderer.setSize(w, h, false);
    v.camera.aspect = w / Math.max(1, h);
    v.camera.updateProjectionMatrix();
  };

  v.render = function (items, cam, env) {
    v.postbuild();
    var gopt = gfx.opts || {};
    if (v.post) {
      v.post.enabled = !!(gopt.bloom || gopt.fxaa || gopt.ao);
      var want = (gopt.bloom ? 1 : 0) + (gopt.fxaa ? 1 : 0) + (gopt.ao ? 1 : 0);
      if (v.post.passes.length !== want) {
        v.post.passes = [];
        if (gopt.bloom) v.post.addPass(new F.BloomPass({ threshold: 0.72, strength: 0.6 }));
        if (gopt.ao) v.post.addPass(new F.SSAOPass({ radius: 2, strength: 1 }));
        if (gopt.fxaa) v.post.addPass(new F.FXAAPass());
      }
    }
    if (v.renderer) {
      v.renderer.toneMapping = gopt.tonemap === "aces" ? 2 : gopt.tonemap === "reinhard" ? 1 : 0;
      v.renderer.shadowMap.enabled = !!gopt.shadows;
      if (v.renderer.shadowMap) {
        v.renderer.shadowMap.size = Math.min(4096, Math.max(256, gopt.shadowsize || 1024));
        v.sun.castShadow = !!gopt.shadows;
      }
    }
    v.renderer.setClearColor(faoxcolor(env.bg || "#c5e4ff"), 1);
    if (v.scene) v.scene.background = null;
    v.gridmesh.visible = env.grid !== false;
    v.gridmesh.position.set(Math.round(cam.target[0] / 5) * 5, env.gridy === undefined ? -0.001 : env.gridy, Math.round(cam.target[2] / 5) * 5);
    v.gridmesh.updateMatrixWorld(true);
    v.ambient.color.set(faoxcolor(env.ambient || "#ffffff"));
    v.ambient.intensity = env.strength === undefined ? 0.62 : env.strength;
    v.sun.intensity = env.sunintensity === undefined ? 1.1 : env.sunintensity;
    var fcam = v.camera;
    if (cam.ortho) {
      fcam = v.camera2;
      var fhw = cam.halfw || 6;
      var fhh = fhw * (v.h || 1) / Math.max(1, v.w || 1);
      fcam.left = -fhw;
      fcam.right = fhw;
      fcam.top = fhh;
      fcam.bottom = -fhh;
    } else {
      fcam.fov = cam.fov || 45;
      fcam.aspect = (v.canvas.width || 1) / (v.canvas.height || 1);
    }
    fcam.near = 0.1;
    fcam.far = 800;
    fcam.updateProjectionMatrix();
    fcam.position.set(cam.eye[0], cam.eye[1], cam.eye[2]);
    fcam.lookAt(new F.Vector3(cam.target[0], cam.target[1], cam.target[2]));
    v.fcam = fcam;
    var seen = {};
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      seen[it.id] = true;
      var key = itemkey(it);
      var rec = v.meshes[it.id];
      if (!rec || rec.matkey !== key || rec.kind !== it.kind || rec.geokey !== (it.geokey || "")) {
        if (rec) v.scene.remove(rec.mesh);
        var mat = makefaoxmat(v, it);
        var geof = v.geos[it.kind] || v.geos.box;
        if (it.geokey && it.geo) geof = customgeo(v, it);
        var mesh = new F.Mesh(geof, mat);
        v.scene.add(mesh);
        rec = v.meshes[it.id] = { mesh: mesh, matkey: key, kind: it.kind, geokey: it.geokey || "" };
      }
      var d = m4decompose(it.matrix);
      rec.mesh.position.set(d.pos[0], d.pos[1], d.pos[2]);
      rec.mesh.quaternion.set(d.quat[0], d.quat[1], d.quat[2], d.quat[3]);
      rec.mesh.scale.set(Math.abs(d.scale[0]) || 0.0001, Math.abs(d.scale[1]) || 0.0001, Math.abs(d.scale[2]) || 0.0001);
      rec.mesh.visible = it.visible !== false;
      rec.mesh.updateMatrixWorld(true);
    }
    for (var k in v.meshes) {
      if (!seen[k]) {
        v.scene.remove(v.meshes[k].mesh);
        delete v.meshes[k];
      }
    }
    if (typeof view5sync === "function") view5sync(v, items, cam, env);
    if (v.post && v.post.active) v.post.render(v.renderer, v.scene, v.activecam || v.camera, viewportw(v), viewporth(v));
    else {
      v.renderer.setRenderTarget(null);
      v.renderer.render(v.scene, v.activecam || v.camera);
    }
  };

  v.dispose = function () {
    for (var k in v.meshes) v.scene.remove(v.meshes[k].mesh);
    v.meshes = {};
  };
  return v;
}

function faoxcolor(hex) {
  if (typeof hex === "number") return hex;
  var h = String(hex || "#ffffff").replace("#", "");
  if (h.length === 3) h = h.charAt(0) + h.charAt(0) + h.charAt(1) + h.charAt(1) + h.charAt(2) + h.charAt(2);
  var n = parseInt(h, 16);
  return isNaN(n) ? 0xffffff : n;
}

function makefaoxmat(v, it) {
  var F = window.FaoxomJs;
  var op = it.opacity === undefined ? 1 : it.opacity;
  var cls = it.unlit ? F.BasicMaterial : F.StandardMaterial;
  var opts = {
    color: faoxcolor(it.color),
    transparent: op < 1,
    opacity: op,
    side: it.double || it.faces === "sprite" ? "double" : "front"
  };
  if (it.vcolor) opts.vertexColors = true;
  if (it.texture) {
    var key = it.texid || "none";
    var canvas = it.texture || it.tex || artmake("crate");
    if (!v.textures[key] || v.textures[key].userData.ver !== canvas.artversion) {
      var tex = new F.Texture(canvas, { magFilter: "nearest", minFilter: "nearest", wrapS: "clamp", wrapT: "clamp", flipY: false });
      tex.magFilter = "nearest";
      tex.minFilter = "nearest";
      tex.userData = { ver: canvas.artversion };
      v.textures[key] = tex;
    }
    opts.map = v.textures[key];
    opts.diffuseMap = v.textures[key];
    opts.alphaTest = 0.04;
  }
  if (!it.unlit) {
    opts.roughness = 1;
    opts.metalness = 0;
  }
  return new cls(opts);
}
