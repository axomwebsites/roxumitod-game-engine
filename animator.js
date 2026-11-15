function animdef(node) {
  node.compdata = node.compdata || {};
  var d = node.compdata.animator;
  if (!d) {
    d = node.compdata.animator = {
      current: "idle",
      params: { speed: 0, grounded: true },
      layers: [
        {
          name: "Base Layer",
          weight: 1,
          blend: "Override",
          mask: "",
          states: [
            { name: "idle", sprite: node.sprite || "hero", fps: 6, loop: true, bob: 0.02, tint: "" },
            { name: "run", sprite: node.sprite || "hero", fps: 12, loop: true, bob: 0.07, tint: "" },
            { name: "jump", sprite: node.sprite || "hero", fps: 8, loop: false, bob: 0, tint: "" }
          ],
          transitions: [
            { from: "idle", to: "run", param: "speed", when: "greater", value: 0.2, exit: 0, duration: 0.18 },
            { from: "run", to: "idle", param: "speed", when: "less", value: 0.2, exit: 0, duration: 0.22 },
            { from: "idle", to: "jump", param: "grounded", when: "false", value: 0, exit: 0, duration: 0.1 },
            { from: "run", to: "jump", param: "grounded", when: "false", value: 0, exit: 0, duration: 0.1 },
            { from: "jump", to: "idle", param: "grounded", when: "true", value: 0, exit: 0, duration: 0.12 }
          ],
          tree: { param: "speed", type: "1D", points: [{ at: 0, state: "idle" }, { at: 1, state: "run" }] }
        }
      ]
    };
  }
  return d;
}

function animstate(layer, name) {
  var out = null;
  (layer.states || []).forEach(function (s) {
    if (s.name === name) out = s;
  });
  return out;
}

function animruntime() {
  var rt = [];
  walk(app.scene.objects || [], function (n) {
    if (!hascomp(n, "animator") && !(n.compdata && n.compdata.animator)) return;
    var d = animdef(n);
    rt.push({ node: n, cfg: d, time: 0, next: d.current || (d.layers[0].states[0] || {}).name, fade: 1, weights: {}, clip: d.current || (d.layers[0].states[0] || {}).name });
  });
  return rt;
}

function animparam(d, key) {
  var v = d.params ? d.params[key] : undefined;
  if (v === undefined) return 0;
  return v;
}

function animsetparam(d, key, value) {
  d.params = d.params || {};
  d.params[key] = value;
}

function animpass(t, param, value) {
  var op = t.when || "greater";
  if (op === "greater") return value > (t.value || 0);
  if (op === "less") return value < (t.value || 0);
  if (op === "equals") return Math.abs(value - (t.value || 0)) < 0.001;
  if (op === "true") return !!value;
  if (op === "false") return !value;
  if (op === "trigger") return !!value;
  return false;
}

function animstep(dt) {
  if (!app.scene) return;
  walk(app.scene.objects || [], function (n) {
    var d = n.compdata && n.compdata.animator;
    if (!d) return;
    d.rt = d.rt || { time: 0, fade: 0, from: d.current || "idle" };
    d.rt.time += dt;
    (d.layers || []).forEach(function (layer) {
      if (!layer.states || !layer.states.length) return;
      var cur = animstate(layer, d.current) || layer.states[0];
      (layer.transitions || []).forEach(function (t) {
        if (t.from !== cur.name) return;
        var val = animparam(d, t.param);
        if (!animpass(t, t.param, val)) return;
        var exit = parseFloat(t.exit) || 0;
        if (exit > 0) {
          var st = animstate(layer, cur.name);
          var dur = 1 / Math.max(1, parseFloat(st && st.fps) || 8);
          if (d.rt.time < exit * dur) return;
        }
        var target = animstate(layer, t.to);
        if (!target) return;
        d.rt.from = cur.name;
        d.rt.fade = Math.max(0.05, parseFloat(t.duration) || 0.18);
        d.rt.blend = 0;
        d.current = t.to;
        d.rt.time = 0;
      });
      var weight = Math.max(0, Math.min(1, parseFloat(layer.weight) || 1));
      var tree = layer.tree;
      var clipname = d.current;
      var blendv = 0;
      if (tree && tree.points && tree.points.length) {
        var pv = animparam(d, tree.param);
        var pts = tree.points.slice().sort(function (a, b) {
          return a.at - b.at;
        });
        if (pv <= pts[0].at) clipname = pts[0].state;
        else if (pv >= pts[pts.length - 1].at) clipname = pts[pts.length - 1].state;
        else {
          for (var i = 0; i < pts.length - 1; i++) {
            if (pv >= pts[i].at && pv <= pts[i + 1].at) {
              clipname = pts[i].state;
              var span = Math.max(0.0001, pts[i + 1].at - pts[i].at);
              blendv = (pv - pts[i].at) / span;
            }
          }
        }
      }
      var clip = animstate(layer, clipname) || cur;
      var fromclip = animstate(layer, d.rt.from) || clip;
      var fps = Math.max(1, parseFloat(clip.fps) || 8);
      var frame = Math.floor(d.rt.time * fps);
      var fromframe = Math.floor(d.rt.time * Math.max(1, parseFloat(fromclip.fps) || 8));
      if (clip.loop === false && frame > 6) frame = 6;
      var alpha = 1;
      if (d.rt.fade > 0) {
        d.rt.blend = Math.min(1, (d.rt.blend || 0) + dt / d.rt.fade);
        alpha = d.rt.blend;
        if (d.rt.blend >= 1) d.rt.fade = 0;
      }
      var bob = (clip.bob || 0) * Math.sin(frame * 1.2);
      if (layer.blend === "Additive") bob *= 1.6;
      var over = gameover || null;
      if (over) {
        over[n.id] = over[n.id] || {};
        over[n.id].sprite = d.rt.fade > 0 && alpha < 0.5 ? fromclip.sprite : clip.sprite;
        over[n.id].boby = bob;
        if (d.rt.fade > 0) over[n.id].opacity = 0.35 + 0.65 * alpha;
        else if (over[n.id].opacity !== undefined && over[n.id].opacity < 1) delete over[n.id].opacity;
      }
      over = null;
      animstep.last = animstep.last || {};
      animstep.last[n.id] = { state: clip.name, frame: frame, weight: weight * (blendv ? 1 - blendv : 1), layer: layer.name };
      if (!d.current && clip) d.current = clip.name;
    });
  });
}

function animlayerhtml(d, li) {
  var layer = d.layers[li];
  var out = '<div class="sec"><div class="sechead"><span class="tw">' + ic("chevd", "ico-xs") + "</span>" + ic("layers", "ico-sm") + "<span>" + esc(layer.name) + "</span></div><div class=\"secbody\">";
  out += '<div class="frow"><div class="flabel">Weight</div><div class="fctrl"><input class="inp num" type="number" min="0" max="1" step="0.05" value="' + layer.weight + '" data-akey="weight" data-li="' + li + '"></div></div>';
  out += '<div class="frow"><div class="flabel">Blending</div><div class="fctrl"><select class="inp" data-akey="blend" data-li="' + li + '">' + ["Override", "Additive"].map(function (b) {
    return "<option" + (layer.blend === b ? " selected" : "") + ">" + b + "</option>";
  }).join("") + "</select></div></div>";
  out += '<div class="frow"><div class="flabel">Avatar mask</div><div class="fctrl"><input class="inp" value="' + esc(layer.mask || "") + '" data-akey="mask" data-li="' + li + '" placeholder="whole sprite"></div></div>';
  out += '<div class="pickgroup">States</div>';
  (layer.states || []).forEach(function (s, si) {
    out += '<div class="gvarrow"><input class="inp nm" value="' + esc(s.name) + '" data-skey="name" data-li="' + li + '" data-si="' + si + '"><select class="inp" data-skey="sprite" data-li="' + li + '" data-si="' + si + '">' + Object.keys(spriteinfo).map(function (k) {
      return "<option" + (s.sprite === k ? " selected" : "") + ">" + k + "</option>";
    }).join("") + '</select><input class="inp num" style="width:52px" type="number" value="' + (s.fps || 8) + '" data-skey="fps" data-li="' + li + '" data-si="' + si + '"><button class="iconbtn" data-act="animdelstate" data-li="' + li + '" data-si="' + si + '">' + ic("trash", "ico-xs") + "</button></div>";
  });
  out += '<button class="addrow" data-act="animaddstate" data-li="' + li + '">' + ic("plus", "ico-xs") + "Add state</button>";
  out += '<div class="pickgroup">Transitions</div>';
  (layer.transitions || []).forEach(function (t, ti) {
    out += '<div class="gvarrow"><select class="inp" data-tkey="from" data-li="' + li + '" data-ti="' + ti + '">' + (layer.states || []).map(function (s) {
      return "<option" + (t.from === s.name ? " selected" : "") + ">" + s.name + "</option>";
    }).join("") + '</select><select class="inp" data-tkey="to" data-li="' + li + '" data-ti="' + ti + '">' + (layer.states || []).map(function (s) {
      return "<option" + (t.to === s.name ? " selected" : "") + ">" + s.name + "</option>";
    }).join("") + '</select><select class="inp" data-tkey="when" data-li="' + li + '" data-ti="' + ti + '">' + ["greater", "less", "equals", "true", "false"].map(function (w) {
      return "<option" + (t.when === w ? " selected" : "") + ">" + w + "</option>";
    }).join("") + '</select><input class="inp" value="' + esc(t.param) + '" data-tkey="param" data-li="' + li + '" data-ti="' + ti + '"><input class="inp num" style="width:52px" type="number" step="0.05" value="' + (t.value || 0) + '" data-tkey="value" data-li="' + li + '" data-ti="' + ti + '"><input class="inp num" style="width:52px" type="number" step="0.05" value="' + (t.duration || 0.2) + '" data-tkey="duration" data-li="' + li + '" data-ti="' + ti + '"><button class="iconbtn" data-act="animdeltrans" data-li="' + li + '" data-ti="' + ti + '">' + ic("trash", "ico-xs") + "</button></div>";
  });
  out += '<button class="addrow" data-act="animaddtrans" data-li="' + li + '">' + ic("plus", "ico-xs") + "Add transition</button>";
  var tree = layer.tree || { param: "speed", points: [] };
  out += '<div class="pickgroup">Blend tree (1D)</div>';
  out += '<div class="frow"><div class="flabel">Parameter</div><div class="fctrl"><input class="inp" value="' + esc(tree.param || "") + '" data-treekey="param" data-li="' + li + '"></div></div>';
  (tree.points || []).forEach(function (p, pi) {
    out += '<div class="gvarrow"><span class="axis y">at</span><input class="inp num" type="number" step="0.1" value="' + p.at + '" data-pointkey="at" data-li="' + li + '" data-pi="' + pi + '"><select class="inp" data-pointkey="state" data-li="' + li + '" data-pi="' + pi + '">' + (layer.states || []).map(function (s) {
      return "<option" + (p.state === s.name ? " selected" : "") + ">" + s.name + "</option>";
    }).join("") + "</select><button class=\"iconbtn\" data-act=\"animdelpoint\" data-li=\"" + li + '" data-pi="' + pi + '">' + ic("trash", "ico-xs") + "</button></div>";
  });
  out += '<button class="addrow" data-act="animaddpoint" data-li="' + li + '">' + ic("plus", "ico-xs") + "Add point</button>";
  out += "</div></div>";
  return out;
}

acts.animator = function () {
  var node = selected();
  if (!node) {
    toast("Select a sprite to animate", "warn");
    return;
  }
  if (!hascomp(node, "animator")) node.comps.push("animator");
  var d = animdef(node);
  var body = '<div class="pickgroup">Parameters</div><div class="row" style="gap:6px;flex-wrap:wrap;padding:0 0 10px">';
  Object.keys(d.params || {}).forEach(function (k) {
    var v = d.params[k];
    body += '<label class="pill">' + esc(k) + ' <input class="inp" style="width:64px;margin-left:6px" value="' + esc(v) + '" data-pkey="' + esc(k) + '"></label>';
  });
  body += '<button class="btn sm" data-act="animaddparam">' + ic("plus", "ico-xs") + "Parameter</button></div>";
  (d.layers || []).forEach(function (layer, li) {
    body += animlayerhtml(d, li);
  });
  body += '<div class="hintline">The animator drives the sprite from parameters. States crossfade using each transition duration.</div>';
  openmodal({
    title: "Animator · " + node.name,
    icon: "animator",
    width: "wide",
    body: body,
    footer: '<button class="btn" data-mact="cancel">Close</button><button class="btn primary" data-mact="save">Save</button>',
    onmount: function (modal, scrim) {
      modal.addEventListener("change", function (ev) {
        var el = ev.target;
        var cl = el.classList.contains("inp") ? el : null;
        if (!cl) return;
        function val() {
          return el.type === "number" ? parseFloat(el.value) || 0 : el.value;
        }
        if (el.hasAttribute("data-pkey")) {
          var k = el.getAttribute("data-pkey");
          var raw = el.value;
          d.params[k] = raw === "true" ? true : raw === "false" ? false : isNaN(parseFloat(raw)) ? raw : parseFloat(raw);
          return;
        }
        if (el.hasAttribute("data-akey")) {
          var layer = d.layers[+el.getAttribute("data-li")];
          layer[el.getAttribute("data-akey")] = val();
          return;
        }
        if (el.hasAttribute("data-skey")) {
          var lay = d.layers[+el.getAttribute("data-li")];
          var st = lay.states[+el.getAttribute("data-si")];
          st[el.getAttribute("data-skey")] = val();
          return;
        }
        if (el.hasAttribute("data-tkey")) {
          var tl = d.layers[+el.getAttribute("data-li")];
          var tr = tl.transitions[+el.getAttribute("data-ti")];
          tr[el.getAttribute("data-tkey")] = val();
          return;
        }
        if (el.hasAttribute("data-treekey")) {
          var tl2 = d.layers[+el.getAttribute("data-li")];
          tl2.tree = tl2.tree || { points: [] };
          tl2.tree[el.getAttribute("data-treekey")] = val();
          return;
        }
        if (el.hasAttribute("data-pointkey")) {
          var tl3 = d.layers[+el.getAttribute("data-li")];
          var pt = tl3.tree.points[+el.getAttribute("data-pi")];
          pt[el.getAttribute("data-pointkey")] = val();
        }
      });
    },
    actions: {
      cancel: function (m, s) {
        closemodal(s);
      },
      save: function (m, s) {
        closemodal(s);
        commit("animator");
        toast("Animator saved", "ok");
      }
    }
  });
};

acts.animaddstate = function (el) {
  var node = selected();
  if (!node) return;
  var d = animdef(node);
  var layer = d.layers[+el.getAttribute("data-li")];
  layer.states.push({ name: "state" + (layer.states.length + 1), sprite: node.sprite || "hero", fps: 8, loop: true, bob: 0.03 });
  commit("animstate");
  acts.animator();
};
acts.animdelstate = function (el) {
  var node = selected();
  if (!node) return;
  var d = animdef(node);
  var layer = d.layers[+el.getAttribute("data-li")];
  layer.states.splice(+el.getAttribute("data-si"), 1);
  commit("animstate");
  acts.animator();
};
acts.animaddtrans = function (el) {
  var node = selected();
  if (!node) return;
  var d = animdef(node);
  var layer = d.layers[+el.getAttribute("data-li")];
  var a = layer.states[0] ? layer.states[0].name : "idle";
  var b = layer.states[1] ? layer.states[1].name : a;
  layer.transitions.push({ from: a, to: b, param: "speed", when: "greater", value: 0.2, exit: 0, duration: 0.2 });
  commit("animtrans");
  acts.animator();
};
acts.animdeltrans = function (el) {
  var node = selected();
  if (!node) return;
  var d = animdef(node);
  var layer = d.layers[+el.getAttribute("data-li")];
  layer.transitions.splice(+el.getAttribute("data-ti"), 1);
  commit("animtrans");
  acts.animator();
};
acts.animaddpoint = function (el) {
  var node = selected();
  if (!node) return;
  var d = animdef(node);
  var layer = d.layers[+el.getAttribute("data-li")];
  layer.tree = layer.tree || { param: "speed", points: [] };
  var last = layer.tree.points[layer.tree.points.length - 1];
  layer.tree.points.push({ at: last ? last.at + 1 : 0, state: layer.states[0] ? layer.states[0].name : "idle" });
  commit("animtree");
  acts.animator();
};
acts.animdelpoint = function (el) {
  var node = selected();
  if (!node) return;
  var d = animdef(node);
  var layer = d.layers[+el.getAttribute("data-li")];
  layer.tree.points.splice(+el.getAttribute("data-pi"), 1);
  commit("animtree");
  acts.animator();
};
acts.animaddparam = function () {
  var node = selected();
  if (!node) return;
  var d = animdef(node);
  promptbox("Animator parameter", "speed", function (name) {
    d.params[name] = 0;
    commit("animparam");
    acts.animator();
  });
};

function animsyncparams() {
  if (!game) return;
  walk(app.scene.objects || [], function (n) {
    var d = n.compdata && n.compdata.animator;
    if (!d) return;
    if (d.params && d.params.speed !== undefined) d.params.speed = Math.abs((game.hero && game.hero.id === n.id ? (game.x - (game.lastx || game.x)) / 0.016 : 0) || (game.hero && game.hero.id === n.id ? (game.keys.KeyA || game.keys.KeyD || game.keys.ArrowLeft || game.keys.ArrowRight ? 1 : 0) : 0));
    if (d.params && d.params.grounded !== undefined) d.params.grounded = !!(game.hero && game.hero.id === n.id ? game.onground : true);
  });
  game.lastx = game.x;
}
