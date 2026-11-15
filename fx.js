var fxpresets = {
  fire: { rate: 46, burst: 12, life: 0.85, size: 0.26, speed: 1.5, spread: 0.3, gravity: -2.2, color: "#ff8a1f", color2: "#ffe066", shape: "circle", glow: true },
  smoke: { rate: 16, burst: 6, life: 2.2, size: 0.42, speed: 0.7, spread: 0.55, gravity: -0.35, color: "#6b7078", color2: "#c9ced6", shape: "circle", glow: false },
  dust: { rate: 20, burst: 8, life: 0.7, size: 0.18, speed: 1.1, spread: 1.1, gravity: 0.6, color: "#cdb891", color2: "#8f8062", shape: "circle", glow: false },
  confetti: { rate: 30, burst: 40, life: 2.4, size: 0.16, speed: 3.4, spread: 1.2, gravity: 2.4, color: "#ff5d8f", color2: "#54d2ff", shape: "rect", glow: false },
  explosion: { rate: 0, burst: 46, life: 0.9, size: 0.3, speed: 5.4, spread: 1, gravity: 1.2, color: "#ffcc33", color2: "#ff3b1f", shape: "circle", glow: true },
  splash: { rate: 24, burst: 16, life: 0.8, size: 0.16, speed: 2.6, spread: 0.9, gravity: 3.4, color: "#9fdcff", color2: "#4fb6e8", shape: "circle", glow: false },
  rain: { rate: 60, burst: 0, life: 1.1, size: 0.1, speed: 0.5, spread: 2.6, gravity: 9, color: "#a9c9e8", color2: "#6f97b8", shape: "rect", glow: false, streak: true },
  sparkles: { rate: 18, burst: 14, life: 1.2, size: 0.14, speed: 1.6, spread: 0.8, gravity: 0.2, color: "#fff1a8", color2: "#8ef2ff", shape: "circle", glow: true }
};

var fx = { list: [], emitters: [], total: 0, seed: 1 };

function fxrand() {
  fx.seed = (fx.seed * 1103515245 + 12345) & 0x7fffffff;
  return fx.seed / 0x7fffffff;
}

function fxconfig(node) {
  var d = (node.compdata && node.compdata.particles) || {};
  var preset = fxpresets[d.preset] || fxpresets.fire;
  function num(key, fallback) {
    var v = d[key];
    if (v === undefined || v === null || v === "") return fallback;
    var n = parseFloat(v);
    return isNaN(n) ? fallback : n;
  }
  return {
    preset: d.preset || "fire",
    rate: num("rate", preset.rate),
    burst: num("burst", preset.burst),
    life: num("life", preset.life),
    size: num("size", preset.size),
    speed: num("speed", preset.speed),
    spread: num("spread", preset.spread),
    gravity: num("gravity", preset.gravity),
    color: d.color || preset.color,
    color2: d.color2 || preset.color2,
    shape: d.shape || preset.shape,
    glow: d.glow === undefined ? preset.glow : !!d.glow,
    streak: !!preset.streak,
    offset: [num("ox", 0), num("oy", 0.2), num("oz", 0)],
    collision: !!d.collision,
    playon: d.playon || "start",
    autoplay: d.autoplay !== false
  };
}

function fxreset() {
  fx.list = [];
  fx.emitters = [];
  fx.total = 0;
  if (!app.scene) return;
  walk(app.scene.objects, function (n) {
    if (!hascomp(n, "particles")) return;
    fx.emitters.push({ node: n, cfg: fxconfig(n), acc: 0, burst: 0, on: true, slow: 0 });
  });
}

function fxmake(em) {
  var cfg = em.cfg;
  var p = {
    x: em.node.pos[0] + cfg.offset[0],
    y: em.node.pos[1] + cfg.offset[1],
    z: em.node.pos[2] + cfg.offset[2],
    vx: 0,
    vy: 0,
    vz: 0,
    life: cfg.life,
    max: cfg.life,
    size: cfg.size,
    color: cfg.color,
    rot: fxrand() * 6.28
  };
  var sp = cfg.speed * (0.45 + fxrand());
  var a = fxrand() * 6.283;
  var up = (fxrand() - 0.15) * cfg.spread;
  p.vx = Math.cos(a) * sp * cfg.spread;
  p.vz = Math.sin(a) * sp * cfg.spread * 0.55;
  p.vy = sp * (0.7 + up);
  if (cfg.shape === "rect" && !cfg.streak) {
    p.vx = (fxrand() - 0.5) * cfg.speed * 2;
    p.vy = cfg.speed * (0.9 + fxrand());
    p.vz = (fxrand() - 0.5) * cfg.speed;
  }
  if (cfg.streak) {
    p.vx = (fxrand() - 0.5) * 1.2;
    p.vy = -cfg.gravity;
    p.vz = (fxrand() - 0.5) * 1.2;
  }
  p.mix = fxrand();
  if (fx.total < 900) {
    fx.list.push(p);
    fx.total++;
  }
}

function fxtick(dt, playing) {
  if (!fx.emitters.length) fxreset();
  var count = 0;
  fx.emitters.forEach(function (em) {
    if (!em.on) return;
    var cfg = em.cfg;
    if (!app.play && em.node.id !== (app.selid || "")) {
      em.slow += dt;
      if (em.slow < 0.12) return;
      dt = em.slow;
      em.slow = 0;
    }
    if (cfg.rate > 0) {
      em.acc += dt * cfg.rate;
      while (em.acc >= 1) {
        em.acc -= 1;
        fxmake(em);
        count++;
        if (count > 60) break;
      }
    }
    if (em.burst > 0) {
      var n = Math.min(80, Math.round(em.burst));
      for (var i = 0; i < n; i++) fxmake(em);
      em.burst = 0;
    }
  });
  for (var i = fx.list.length - 1; i >= 0; i--) {
    var p = fx.list[i];
    p.life -= dt;
    if (p.life <= 0) {
      fx.list.splice(i, 1);
      fx.total = Math.max(0, fx.total - 1);
      continue;
    }
    p.vy -= p.gravity * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.z += p.vz * dt;
    p.rot += dt * 2.4;
    if (p.y < -2.9 && p.vy < 0) {
      p.y = -2.9;
      p.vy *= -0.32;
      p.vx *= 0.7;
      p.vz *= 0.7;
    }
  }
}

function fxtrigger(id, preset) {
  var hit = false;
  fx.emitters.forEach(function (em) {
    if (id && em.node.id !== id) return;
    if (preset && em.cfg.preset !== preset) return;
    em.burst = Math.max(em.burst, em.cfg.burst || 14);
    hit = true;
  });
  return hit;
}

function fxburst(pos, preset, game) {
  var cfg = fxpresets[preset] || fxpresets.explosion;
  var em = { node: { pos: pos, id: "fx" }, cfg: fxconfig({ compdata: { particles: { preset: preset } } }), acc: 0, burst: cfg.burst || 20, on: true, slow: 0 };
  fx.emitters.push(em);
  setTimeout(function () {
    em.on = false;
    var i = fx.emitters.indexOf(em);
    if (i >= 0) fx.emitters.splice(i, 1);
  }, 260);
  fxmake(em);
}

function fxnum(hex) {
  var h = String(hex || "#ffffff").replace("#", "");
  if (h.length === 3) h = h.charAt(0) + h.charAt(0) + h.charAt(1) + h.charAt(1) + h.charAt(2) + h.charAt(2);
  var n = parseInt(h, 16);
  return isNaN(n) ? [255, 255, 255] : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function fxdraw(g, cs, w, h) {
  if (!g || !fx.list.length) return;
  var m = cameramatrices(cs, w, h);
  var buf = [];
  for (var i = 0; i < fx.list.length; i++) {
    var p = fx.list[i];
    var pr = projectpoint(m.vp, [p.x, p.y, p.z], w, h);
    if (!pr) continue;
    buf.push([pr[0], pr[1], p]);
  }
  buf.sort(function (a, b) {
    return a[2].z - b[2].z;
  });
  for (var k = 0; k < buf.length; k++) {
    var q = buf[k];
    var pt = q[2];
    var fade = Math.max(0, Math.min(1, pt.life / pt.max));
    var col = fxnum(pt.color);
    var col2 = fxnum(pt.color2 || pt.color);
    var r = Math.max(1, pt.size * 90 * (0.6 + fade * 0.6));
    g.globalAlpha = pt.streak ? 0.5 * fade : 0.9 * fade;
    var cc = pt.mix > 0.5 ? col : col2;
    g.fillStyle = "rgb(" + cc[0] + "," + cc[1] + "," + cc[2] + ")";
    if (pt.shape === "rect") {
      g.save();
      g.translate(q[0], q[1]);
      g.rotate(pt.rot);
      g.fillRect(-r * 0.4, -r * 0.7, r * 0.8, pt.streak ? r * 1.9 : r * 1.4);
      g.restore();
    } else {
      g.beginPath();
      g.arc(q[0], q[1], r, 0, 6.283);
      g.fill();
    }
  }
  g.globalAlpha = 1;
}

function fxspawnmenu() {
  var items = [{ head: "Particle presets" }];
  Object.keys(fxpresets).forEach(function (key) {
    items.push({ label: key.charAt(0).toUpperCase() + key.slice(1), icon: "sparkle", act: "usefx:" + key });
  });
  openmenu(items, window.innerWidth / 2 - 120, 170, {
    onact: function (name) {
      var key = name.split(":")[1];
      var node = selected();
      if (!node || !key) return;
      node.compdata = node.compdata || {};
      node.compdata.particles = { preset: key };
      if (!hascomp(node, "particles")) node.comps.push("particles");
      fxreset();
      commit("particles");
      toast("Particles set to " + key, "ok");
    }
  });
}

function fxpreviewhtml() {
  var out = '<div class="row" style="gap:4px;flex-wrap:wrap;padding:2px 0 8px">';
  Object.keys(fxpresets).forEach(function (key) {
    out += '<button class="btn sm" data-act="usefx" data-key="' + key + '">' + ic("sparkle", "ico-xs") + esc(key) + "</button>";
  });
  out += "</div>";
  return out;
}

acts.usefx = function (el) {
  var node = selected();
  var key = el.getAttribute("data-key");
  if (!node || !key) return;
  node.compdata = node.compdata || {};
  node.compdata.particles = node.compdata.particles || {};
  node.compdata.particles.preset = key;
  if (!hascomp(node, "particles")) node.comps.push("particles");
  fxreset();
  commit("particles");
};
