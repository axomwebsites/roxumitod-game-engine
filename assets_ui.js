var modellib = [
  {
    key: "tree",
    label: "Tree",
    icon: "tree",
    build: function () {
      var root = basenode("empty", { name: "Tree", pos: [0, 0, 0] });
      var trunk = basenode("cylinder", { name: "Trunk", pos: [0, 0.5, 0], scl: [0.22, 1, 0.22] });
      trunk.color = "#a9713f";
      var c1 = basenode("cone", { name: "Crown", pos: [0, 1.5, 0], scl: [1.15, 1.05, 1.15] });
      c1.color = "#5cc446";
      var c2 = basenode("cone", { name: "Crown top", pos: [0, 2.15, 0], scl: [0.8, 0.8, 0.8] });
      c2.color = "#8ce874";
      root.children = [trunk, c1, c2];
      return root;
    }
  },
  {
    key: "rock",
    label: "Rock",
    icon: "rock",
    build: function () {
      var root = basenode("empty", { name: "Rock", pos: [0, 0, 0] });
      var a = basenode("sphere", { name: "Rock body", pos: [0, 0.32, 0], scl: [1.05, 0.68, 0.95] });
      a.color = "#9aa1ac";
      var b = basenode("sphere", { name: "Rock chip", pos: [0.42, 0.5, 0.16], scl: [0.45, 0.4, 0.45] });
      b.color = "#b4bac4";
      root.children = [a, b];
      return root;
    }
  },
  {
    key: "mushroom",
    label: "Mushroom",
    icon: "rock",
    build: function () {
      var root = basenode("empty", { name: "Mushroom", pos: [0, 0, 0] });
      var stem = basenode("cylinder", { name: "Stem", pos: [0, 0.3, 0], scl: [0.22, 0.6, 0.22] });
      stem.color = "#f4e3c5";
      var cap = basenode("sphere", { name: "Cap", pos: [0, 0.62, 0], scl: [0.62, 0.36, 0.62] });
      cap.color = "#e8503a";
      root.children = [stem, cap];
      return root;
    }
  },
  {
    key: "column",
    label: "Column",
    icon: "column",
    build: function () {
      var root = basenode("empty", { name: "Column", pos: [0, 0, 0] });
      var base = basenode("box", { name: "Base", pos: [0, 0.1, 0], scl: [0.75, 0.2, 0.75] });
      base.color = "#c8ccd4";
      var shaft = basenode("cylinder", { name: "Shaft", pos: [0, 1.05, 0], scl: [0.46, 1.9, 0.46] });
      shaft.color = "#d9dde4";
      var cap = basenode("box", { name: "Capital", pos: [0, 2.1, 0], scl: [0.72, 0.22, 0.72] });
      cap.color = "#c8ccd4";
      root.children = [base, shaft, cap];
      return root;
    }
  },
  {
    key: "crate",
    label: "Crate",
    icon: "crate",
    build: function () {
      var root = basenode("empty", { name: "Crate", pos: [0, 0, 0] });
      var body = basenode("box", { name: "Body", pos: [0, 0.5, 0], scl: [1, 1, 1] });
      body.color = "#b98247";
      var bar1 = basenode("box", { name: "Brace", pos: [0, 0.5, 0.505], scl: [1.02, 0.14, 0.06] });
      bar1.color = "#8a5a2f";
      var bar2 = basenode("box", { name: "Brace top", pos: [0, 0.94, 0.505], scl: [1.02, 0.12, 0.06] });
      bar2.color = "#8a5a2f";
      root.children = [body, bar1, bar2];
      return root;
    }
  },
  {
    key: "fence",
    label: "Fence",
    icon: "fence",
    build: function () {
      var root = basenode("empty", { name: "Fence", pos: [0, 0, 0] });
      var rail = basenode("box", { name: "Rail", pos: [0, 0.72, 0], scl: [2.2, 0.12, 0.1] });
      rail.color = "#b5753f";
      var rail2 = basenode("box", { name: "Rail low", pos: [0, 0.36, 0], scl: [2.2, 0.12, 0.1] });
      rail2.color = "#b5753f";
      var kids = [rail, rail2];
      [-1, -0.35, 0.35, 1].forEach(function (x, i) {
        var post = basenode("box", { name: "Post " + (i + 1), pos: [x, 0.55, 0], scl: [0.14, 1.1, 0.14] });
        post.color = "#8a5a2f";
        kids.push(post);
      });
      root.children = kids;
      return root;
    }
  },
  {
    key: "door",
    label: "Door",
    icon: "door",
    build: function () {
      var root = basenode("empty", { name: "Door", pos: [0, 0, 0] });
      var frame = basenode("box", { name: "Frame", pos: [0, 1.1, 0], scl: [1.3, 2.2, 0.24] });
      frame.color = "#9aa1ac";
      var panel = basenode("box", { name: "Panel", pos: [0, 1.05, 0.1], scl: [1.05, 1.95, 0.1] });
      panel.color = "#8a5a3a";
      var knob = basenode("sphere", { name: "Knob", pos: [0.38, 1.02, 0.18], scl: [0.14, 0.14, 0.14] });
      knob.color = "#f7c948";
      root.children = [frame, panel, knob];
      return root;
    }
  },
  {
    key: "lamp",
    label: "Street lamp",
    icon: "light",
    build: function () {
      var root = basenode("empty", { name: "Lamp", pos: [0, 0, 0] });
      var pole = basenode("cylinder", { name: "Pole", pos: [0, 1.4, 0], scl: [0.12, 2.8, 0.12] });
      pole.color = "#4b5058";
      var head = basenode("sphere", { name: "Light", pos: [0, 2.85, 0], scl: [0.4, 0.4, 0.4] });
      head.color = "#ffe38a";
      root.children = [pole, head];
      return root;
    }
  },
  {
    key: "house",
    label: "House",
    icon: "building",
    build: function () {
      var root = basenode("empty", { name: "House", pos: [0, 0, 0] });
      var walls = basenode("box", { name: "Walls", pos: [0, 1, 0], scl: [2.6, 2, 2.2] });
      walls.color = "#f2e2c4";
      var roof = basenode("cone", { name: "Roof", pos: [0, 2.5, 0], scl: [2.2, 1, 2.2] });
      roof.color = "#c1573f";
      var door = basenode("box", { name: "Door", pos: [0, 0.55, 1.13], scl: [0.6, 1.1, 0.1] });
      door.color = "#8a5a3a";
      root.children = [walls, roof, door];
      return root;
    }
  },
  {
    key: "car",
    label: "Car",
    icon: "car",
    build: function () {
      var root = basenode("empty", { name: "Car", pos: [0, 0, 0] });
      var body = basenode("box", { name: "Body", pos: [0, 0.42, 0], scl: [2.2, 0.5, 1] });
      body.color = "#d9584b";
      var cabin = basenode("box", { name: "Cabin", pos: [-0.1, 0.82, 0], scl: [1.15, 0.42, 0.9] });
      cabin.color = "#8ad0f0";
      var kids = [body, cabin];
      [[-0.72, 0.5], [0.72, 0.5], [-0.72, -0.5], [0.72, -0.5]].forEach(function (p, i) {
        var w = basenode("cylinder", { name: "Wheel " + (i + 1), pos: [p[0], 0.2, p[1]], rot: [90, 0, 0], scl: [0.4, 0.18, 0.4] });
        w.color = "#2b2f36";
        kids.push(w);
      });
      root.children = kids;
      return root;
    }
  },
  {
    key: "flag",
    label: "Flag pole",
    icon: "flag",
    build: function () {
      var root = basenode("empty", { name: "Flag pole", pos: [0, 0, 0] });
      var pole = basenode("cylinder", { name: "Pole", pos: [0, 1.2, 0], scl: [0.09, 2.4, 0.09] });
      pole.color = "#c98a52";
      var cloth = basenode("box", { name: "Cloth", pos: [0.55, 2.05, 0], scl: [1, 0.62, 0.05] });
      cloth.color = "#e8503a";
      root.children = [pole, cloth];
      return root;
    }
  },
  {
    key: "coin",
    label: "Coin stack",
    icon: "coin",
    build: function () {
      var root = basenode("empty", { name: "Coin stack", pos: [0, 0, 0] });
      var kids = [];
      [0, 0.16, 0.32].forEach(function (y, i) {
        var c = basenode("cylinder", { name: "Coin " + (i + 1), pos: [0, 0.1 + y, 0], scl: [0.62, 0.14, 0.62] });
        c.color = "#f7c948";
        kids.push(c);
      });
      root.children = kids;
      return root;
    }
  },
  {
    key: "heart",
    label: "Heart pickup",
    icon: "heart",
    build: function () {
      var root = basenode("empty", { name: "Heart pickup", pos: [0, 0, 0] });
      var a = basenode("sphere", { name: "Lobe left", pos: [-0.22, 0.72, 0], scl: [0.55, 0.55, 0.5] });
      a.color = "#e8503a";
      var b = basenode("sphere", { name: "Lobe right", pos: [0.22, 0.72, 0], scl: [0.55, 0.55, 0.5] });
      b.color = "#e8503a";
      var c = basenode("cone", { name: "Point", pos: [0, 0.32, 0], rot: [180, 0, 0], scl: [0.62, 0.7, 0.55] });
      c.color = "#d13b2e";
      root.children = [a, b, c];
      return root;
    }
  },
  {
    key: "spring",
    label: "Spring",
    icon: "curve",
    build: function () {
      var root = basenode("empty", { name: "Spring", pos: [0, 0, 0] });
      var kids = [];
      [0.12, 0.3, 0.48].forEach(function (y, i) {
        var r = basenode("box", { name: "Coil " + (i + 1), pos: [0, y, 0], scl: [0.6, 0.08, 0.6] });
        r.color = "#9aa1ac";
        kids.push(r);
      });
      var top = basenode("box", { name: "Top", pos: [0, 0.62, 0], scl: [0.72, 0.12, 0.72] });
      top.color = "#e8503a";
      kids.push(top);
      root.children = kids;
      return root;
    }
  },
  {
    key: "hills",
    label: "Terrain hills",
    icon: "hills",
    build: function () {
      var root = basenode("terrain", { name: "Terrain", pos: [0, 0, 0] });
      return root;
    }
  }
];

function modellibfind(key) {
  var out = null;
  modellib.forEach(function (m) {
    if (m.key === key) out = m;
  });
  return out;
}

function addmodel(key) {
  var m = modellibfind(key);
  if (!m) return;
  var node = m.build();
  node.pos = [Math.round(app.cam.target[0] * 10) / 10, 0, 0];
  node.name = uniqueid(app.scene.objects, node.name);
  app.scene.objects.push(node);
  app.selid = node.id;
  app.selids = [node.id];
  commit("model");
  toast("Added " + node.name, "ok");
}

function makeasset(kind, name, extra) {
  var store = assetstore(kind);
  var item = { id: newid("a"), name: name || assetlabel(kind), type: kind };
  Object.keys(extra || {}).forEach(function (k) {
    item[k] = extra[k];
  });
  store.push(item);
  app.project[kind + "s"] = store;
  commit("asset");
  opendoc(kind, item.id);
  return item;
}

function assetlabel(kind) {
  var labels = { mat: "Material", shader: "Shader", anim: "Animator", timeline: "Timeline", loc: "Localization", services: "Services", table: "Data table", sheet: "Sprite sheet" };
  return labels[kind] || "Asset";
}

function assetkeyof(kind) {
  var map = { mat: "mats", shader: "shaders", anim: "anims", timeline: "timelines", loc: "locs", services: "services", table: "tables", sheet: "sheets" };
  return map[kind] || kind + "s";
}

function assetstore(kind) {
  var key = assetkeyof(kind);
  if (!app.project[key]) app.project[key] = [];
  return app.project[key];
}

function assetfind(kind, id) {
  var out = null;
  assetstore(kind).forEach(function (a) {
    if (a.id === id) out = a;
  });
  return out;
}

function schedulecommit() {
  if (schedulecommit.timer) clearTimeout(schedulecommit.timer);
  schedulecommit.timer = setTimeout(function () {
    schedulecommit.timer = null;
    commit("edit");
  }, 900);
}

function materialfor(node) {
  if (!node || !node.mat) return null;
  return assetfind("mat", node.mat);
}

function sheetsprite(sheet, frame) {
  if (!sheet || !sheet.data) return null;
  var key = "sheet:" + sheet.id + ":" + (frame || 0);
  if (customart[key]) return customart[key];
  var c = cvw(2, 2);
  customart[key] = c;
  var img = new Image();
  img.onload = function () {
    var cols = Math.max(1, sheet.cols || 1);
    var rows = Math.max(1, sheet.rows || 1);
    var fw = Math.floor(img.width / cols);
    var fh = Math.floor(img.height / rows);
    var f = frame || 0;
    var fx = (f % cols) * fw;
    var fy = Math.floor(f / cols) * fh;
    c.width = Math.max(1, fw);
    c.height = Math.max(1, fh);
    var g = cx2(c);
    g.clearRect(0, 0, c.width, c.height);
    g.drawImage(img, fx, fy, fw, fh, 0, 0, fw, fh);
    c.artversion = (c.artversion || 0) + 1;
  };
  img.src = sheet.data;
  return c;
}

function animofframe(node, time) {
  var anim = node && node.anim ? assetfind("anim", node.anim) : null;
  if (!anim || !anim.frames || !anim.frames.length) return null;
  var fps = anim.fps || 8;
  var idx = Math.floor(time * fps) % anim.frames.length;
  return anim.frames[idx];
}

function buildassetpage(host, kind, id) {
  var item = assetfind(kind, id);
  if (!item) {
    host.innerHTML = '<div class="emptystate">This asset is missing.</div>';
    return;
  }
  var inner = "";
  if (kind === "mat") inner = materialpage(item);
  else if (kind === "shader") inner = shaderpage(item);
  else if (kind === "anim") inner = animatorpage(item);
  else if (kind === "timeline") inner = timelinepage(item);
  else if (kind === "loc") inner = locpage(item);
  else if (kind === "services") inner = servicespage(item);
  else if (kind === "table") inner = tablepage(item);
  else if (kind === "sheet") inner = sheetpage(item);
  host.innerHTML = '<div class="codetabsbar"><div class="crumb">' + ic(kind === "shader" ? "shader" : kind === "anim" ? "animator" : kind === "timeline" ? "timeline" : kind === "loc" ? "globe" : kind === "services" ? "services" : kind === "table" ? "table" : kind === "sheet" ? "grid" : "material", "ico-sm") + '<span class="semibold">' + esc(item.name) + '</span><span class="pill">' + esc(assetlabel(kind)) + '</span></div><div style="margin-left:auto"><button class="btn sm" data-act="assetrename" data-kind="' + kind + '" data-id="' + item.id + '">' + ic("pen", "ico-sm") + 'Rename</button></div></div><div class="docscroll">' + inner + "</div>";
  bindassetpage(host, kind, item);
}

function assetrow(label, ctrl) {
  return '<div class="setrow"><div class="setlabel">' + esc(label) + '</div><div class="setctrl">' + ctrl + '</div></div>';
}
function materialpage(item) {
  if (item.color === undefined) item.color = "#ffffff";
  if (item.opacity === undefined) item.opacity = 1;
  if (item.metal === undefined) item.metal = 0;
  if (item.rough === undefined) item.rough = 0.6;
  var targets = [];
  walk(app.scene.objects, function (n) {
    if (n.type !== "canvas" && n.type !== "label" && n.type !== "empty") targets.push(n);
  });
  return '<div class="settingswrap"><div class="setsec"><div class="sethead">' + ic("material", "ico-sm") + '<span>Material</span></div><div class="setbody">' +
    assetrow("Color", '<div class="colorbox"><input type="color" value="' + esc(item.color) + '" data-afield="color"></div><input class="inp" value="' + esc(item.color) + '" data-afield="color">') +
    assetrow("Opacity", '<input class="slider" type="range" min="0" max="1" step="0.01" value="' + item.opacity + '" data-afield="opacity"><input class="inp num numin" type="number" min="0" max="1" step="0.01" value="' + item.opacity + '" data-afield="opacity">') +
    assetrow("Metalness", '<input class="slider" type="range" min="0" max="1" step="0.01" value="' + item.metal + '" data-afield="metal"><input class="inp num numin" type="number" min="0" max="1" step="0.01" value="' + item.metal + '" data-afield="metal">') +
    assetrow("Roughness", '<input class="slider" type="range" min="0" max="1" step="0.01" value="' + item.rough + '" data-afield="rough"><input class="inp num numin" type="number" min="0" max="1" step="0.01" value="' + item.rough + '" data-afield="rough">') +
    assetrow("Unlit", check("", !!item.unlit, 'data-afield="unlit"')) +
    assetrow("Double sided", check("", item.double !== false, 'data-afield="double"')) +
    assetrow("Texture", '<select class="inp" data-afield="tex"><option value="">None</option>' + spriteassets().map(function (s) {
      return '<option value="' + s.key + '"' + (item.tex === s.key ? " selected" : "") + ">" + esc(s.name) + "</option>";
    }).join("") + "</select>") +
    "</div></div>" +
    '<div class="setsec"><div class="sethead">' + ic("cube", "ico-sm") + '<span>Assign to object</span></div><div class="setbody">' +
    assetrow("Object", '<select class="inp" data-matassign>' + targets.map(function (n) {
      return '<option value="' + n.id + '">' + esc(n.name) + "</option>";
    }).join("") + '</select><button class="btn sm" data-act="assignmat" data-id="' + item.id + '" style="margin-left:6px">Apply</button>') +
    "</div></div></div>";
}

function shaderpage(item) {
  if (!item.vert) item.vert = "attribute vec3 position;\nvoid main(){ gl_Position = vec4(position, 1.0); }";
  if (!item.frag) item.frag = "precision highp float;\nuniform float uTime;\nvoid main(){\n  vec2 p = gl_FragCoord.xy / 220.0;\n  float w = 0.5 + 0.5 * sin(p.x * 8.0 + uTime);\n  gl_FragColor = vec4(p.y, w, 1.0 - p.y, 1.0);\n}";
  return '<div class="settingswrap"><div class="setsec"><div class="sethead">' + ic("shader", "ico-sm") + '<span>Shader (GLSL)</span><span class="pill" style="margin-left:auto">live preview</span></div><div class="setbody">' +
    '<div style="display:grid;grid-template-columns:1fr 240px;gap:12px;padding:10px">' +
    '<div><div class="fieldlabel">Fragment</div><textarea class="shadercode" data-afield="frag" spellcheck="false" style="height:150px;width:100%;resize:vertical">' + esc(item.frag) + "</textarea>" +
    '<div class="fieldlabel" style="margin-top:8px">Vertex</div><textarea class="shadercode" data-afield="vert" spellcheck="false" style="height:80px;width:100%;resize:vertical">' + esc(item.vert) + "</textarea></div>" +
    '<div><div class="fieldlabel">Preview</div><canvas id="shaderpreview" width="220" height="220" style="width:220px;height:220px;border-radius:6px;background:#101216"></canvas><div class="tiny dim" id="shadererr" style="margin-top:6px;max-width:220px"></div></div></div>' +
    "</div></div></div>";
}

function animatorpage(item) {
  if (!item.frames) item.frames = ["hero"];
  if (!item.fps) item.fps = 8;
  var options = spriteassets().map(function (s) {
    return '<option value="' + s.key + '">' + esc(s.name) + "</option>";
  }).join("");
  return '<div class="settingswrap"><div class="setsec"><div class="sethead">' + ic("animator", "ico-sm") + '<span>Animator controller</span></div><div class="setbody">' +
    assetrow("Frames per second", '<input class="inp num" type="number" min="1" max="60" value="' + item.fps + '" data-afield="fps">') +
    assetrow("Add frame", '<select class="inp" data-animframe>' + options + '</select><button class="btn sm" data-act="animaddframe" data-id="' + item.id + '" style="margin-left:6px">' + ic("plus", "ico-sm") + 'Add</button>') +
    "</div></div>" +
    '<div class="setsec"><div class="sethead">' + ic("grid", "ico-sm") + '<span>Frames</span><span class="pill" style="margin-left:auto">' + item.frames.length + '</span></div><div class="setbody"><div class="assetgrid" style="max-height:none">' + item.frames.map(function (f, i) {
      var url = f.indexOf("custom:") === 0 ? customasseturl(f) : arturln(f);
      return '<div class="acard"><span class="thumb"><img src="' + url + '" style="width:100%;height:100%;object-fit:contain;image-rendering:pixelated"></span><span class="nm">' + (i + 1) + ". " + esc((spriteinfo[f] || { name: f }).name) + '</span><button class="iconbtn" data-act="animdelframe" data-id="' + item.id + '" data-index="' + i + '">' + ic("trash", "ico-xs") + "</button></div>";
    }).join("") + "</div></div></div>" +
    '<div class="setsec"><div class="sethead">' + ic("cube", "ico-sm") + '<span>Assign to object</span></div><div class="setbody">' +
    assetrow("Object", '<select class="inp" data-animassign>' + objectoptions() + '</select><button class="btn sm" data-act="assignanim" data-id="' + item.id + '" style="margin-left:6px">Apply</button>') +
    "</div></div></div>";
}

function objectoptions() {
  var out = [];
  walk(app.scene.objects, function (n) {
    if (n.type === "sprite" || n.type === "box") out.push(n);
  });
  return out.map(function (n) {
    return '<option value="' + n.id + '">' + esc(n.name) + "</option>";
  }).join("");
}

function timelinepage(item) {
  if (!item.tracks) item.tracks = [];
  if (!item.length) item.length = 4;
  var rows = item.tracks.map(function (t, ti) {
    var keys = t.keys.map(function (k, ki) {
      return '<div class="gvarrow"><span class="pill">' + k.time.toFixed(1) + 's</span>' +
        '<input class="inp num" type="number" step="0.1" value="' + k.x + '" data-tk="x" data-ti="' + ti + '" data-ki="' + ki + '">' +
        '<input class="inp num" type="number" step="0.1" value="' + k.y + '" data-tk="y" data-ti="' + ti + '" data-ki="' + ki + '">' +
        '<input class="inp num" type="number" step="0.1" value="' + k.z + '" data-tk="z" data-ti="' + ti + '" data-ki="' + ki + '">' +
        '<button class="iconbtn" data-act="keydel" data-id="' + item.id + '" data-ti="' + ti + '" data-ki="' + ki + '">' + ic("x", "ico-xs") + '</button></div>';
    }).join("");
    return '<div class="setsec"><div class="sethead">' + ic("move", "ico-sm") + '<span>' + esc(t.name) + '</span>' +
      '<button class="iconbtn" style="margin-left:auto" data-act="trackdel" data-id="' + item.id + '" data-index="' + ti + '">' + ic("trash", "ico-xs") + '</button></div>' +
      '<div class="setbody">' + keys + '<button class="addrow" data-act="keyadd" data-id="' + item.id + '" data-ti="' + ti + '">' + ic("plus", "ico-xs") + 'Add key</button></div></div>';
  }).join("");
  return '<div class="settingswrap"><div class="setsec"><div class="sethead">' + ic("timeline", "ico-sm") + '<span>Timeline (cutscene)</span></div><div class="setbody">' +
    assetrow("Length (seconds)", '<input class="inp num" type="number" min="0.5" max="60" step="0.5" value="' + item.length + '" data-afield="length">') +
    assetrow("Add track", '<select class="inp" data-trackobj>' + objectoptions() + '</select><button class="btn sm" data-act="trackadd" data-id="' + item.id + '" style="margin-left:6px">' + ic("plus", "ico-sm") + 'Add</button>') +
    assetrow("Preview", '<button class="btn" data-act="timelineplay" data-id="' + item.id + '">' + ic("play", "ico-sm") + 'Play timeline</button>') +
    '</div></div>' + rows + '</div>';
}
function locpage(item) {
  if (!item.langs) item.langs = [{ code: "en", name: "English" }];
  if (!item.keys) item.keys = [{ key: "title", values: { en: "My game" } }];
  var langs = item.langs.map(function (l, i) {
    return '<div class="gvarrow"><input class="inp nm" value="' + esc(l.code) + '" data-lang="code" data-li="' + i + '">' +
      '<input class="inp" value="' + esc(l.name) + '" data-lang="name" data-li="' + i + '">' +
      '<button class="iconbtn" data-act="langdel" data-id="' + item.id + '" data-index="' + i + '">' + ic("trash", "ico-xs") + '</button></div>';
  }).join("");
  var keys = item.keys.map(function (k, ki) {
    var inp = item.langs.map(function (l) {
      return '<input class="inp" style="width:120px;margin-right:4px" placeholder="' + esc(l.code) + '" value="' + esc((k.values && k.values[l.code]) || "") + '" data-lkey="' + ki + '" data-lcode="' + esc(l.code) + '">';
    }).join("");
    return '<div class="setrow"><div class="setlabel">' + esc(k.key) + '</div><div class="setctrl">' + inp +
      '<button class="iconbtn" data-act="locdel" data-id="' + item.id + '" data-index="' + ki + '">' + ic("trash", "ico-xs") + '</button></div></div>';
  }).join("");
  return '<div class="settingswrap"><div class="setsec"><div class="sethead">' + ic("globe", "ico-sm") + '<span>Languages</span></div><div class="setbody">' + langs +
    '<button class="addrow" data-act="langadd" data-id="' + item.id + '">' + ic("plus", "ico-xs") + 'Add language</button></div></div>' +
    '<div class="setsec"><div class="sethead">' + ic("text", "ico-sm") + '<span>Texts</span></div><div class="setbody">' + keys +
    '<button class="addrow" data-act="locadd" data-id="' + item.id + '">' + ic("plus", "ico-xs") + 'Add text key</button></div></div></div>';
}
function servicespage(item) {
  if (!item.flags) item.flags = { achievements: true, ads: false, purchases: false, cloud: false };
  if (!item.achievements) item.achievements = [{ name: "First coin", done: false }, { name: "Reach the flag", done: false }];
  var rows = [["achievements", "Achievements"], ["ads", "Ads"], ["purchases", "In-app purchases"], ["cloud", "Cloud saves"]];
  var flags = rows.map(function (r) {
    return assetrow(r[1], check("", !!item.flags[r[0]], 'data-sflag="' + r[0] + '"'));
  }).join("");
  var achs = item.achievements.map(function (a, i) {
    return '<div class="gvarrow"><input class="inp nm" value="' + esc(a.name) + '" data-ach="name" data-ai="' + i + '">' +
      '<label class="check" style="margin-left:8px"><input type="checkbox" ' + (a.done ? "checked" : "") + ' data-ach="done" data-ai="' + i + '"><span class="box">' + ic("check", "ico-xs") + '</span>Done</label>' +
      '<button class="iconbtn" data-act="achdel" data-id="' + item.id + '" data-index="' + i + '">' + ic("trash", "ico-xs") + '</button></div>';
  }).join("");
  return '<div class="settingswrap"><div class="setsec"><div class="sethead">' + ic("services", "ico-sm") + '<span>Services</span></div><div class="setbody">' + flags + '</div></div>' +
    '<div class="setsec"><div class="sethead">' + ic("trophy", "ico-sm") + '<span>Achievements</span></div><div class="setbody">' + achs +
    '<button class="addrow" data-act="achadd" data-id="' + item.id + '">' + ic("plus", "ico-xs") + 'Add achievement</button></div></div></div>';
}
function tablepage(item) {
  if (!item.cols) item.cols = ["Name", "Value"];
  if (!item.rows) item.rows = [["Coin", "1"], ["Heart", "5"]];
  var head = item.cols.map(function (c, ci) {
    return '<input class="inp nm" value="' + esc(c) + '" data-tcol="' + ci + '">';
  }).join("");
  var body = item.rows.map(function (r, ri) {
    var cells = item.cols.map(function (c, ci) {
      return '<input class="inp" value="' + esc(r[ci] === undefined ? "" : r[ci]) + '" data-trow="' + ri + '" data-tcell="' + ci + '">';
    }).join("");
    return '<div class="gvarrow">' + cells + '<button class="iconbtn" data-act="tablerowdel" data-id="' + item.id + '" data-index="' + ri + '">' + ic("trash", "ico-xs") + '</button></div>';
  }).join("");
  return '<div class="settingswrap"><div class="setsec"><div class="sethead">' + ic("table", "ico-sm") + '<span>Data table</span>' +
    '<button class="iconbtn" style="margin-left:auto" data-act="tablecoladd" data-id="' + item.id + '">' + ic("plus", "ico-xs") + '</button></div><div class="setbody">' +
    '<div class="gvarrow" style="font-weight:600">' + head + '<span style="width:26px"></span></div>' + body +
    '<button class="addrow" data-act="tablerowadd" data-id="' + item.id + '">' + ic("plus", "ico-xs") + 'Add row</button></div></div></div>';
}
function sheetpage(item) {
  return '<div class="settingswrap"><div class="setsec"><div class="sethead">' + ic("grid", "ico-sm") + '<span>Sprite sheet</span></div><div class="setbody">' +
    assetrow("Image", '<button class="btn" data-act="sheetpick" data-id="' + item.id + '">' + ic("image", "ico-sm") + 'Choose image</button><span class="tiny dim" style="margin-left:8px">' + (item.data ? "loaded" : "no image") + '</span>') +
    assetrow("Columns", '<input class="inp num" type="number" min="1" max="32" value="' + (item.cols2 || 4) + '" data-afield="cols2">') +
    assetrow("Rows", '<input class="inp num" type="number" min="1" max="32" value="' + (item.rows2 || 4) + '" data-afield="rows2">') +
    '</div></div><div class="setsec"><div class="sethead">' + ic("grid", "ico-sm") + '<span>Frames</span>' +
    '<button class="btn sm" style="margin-left:auto" data-act="sheetframes" data-id="' + item.id + '">' + ic("redo", "ico-sm") + 'Slice</button></div>' +
    '<div class="setbody"><div class="assetgrid" id="sheetframes">' + sheetframehtml(item) + '</div></div></div></div>';
}
function sheetframehtml(item) {
  if (!item.data) return '<div class="emptyhint">Pick an image to slice.</div>';
  var cols = Math.max(1, item.cols2 || 4);
  var rows = Math.max(1, item.rows2 || 4);
  var total = Math.min(64, cols * rows);
  var out = "";
  for (var i = 0; i < total; i++) {
    out += '<div class="acard"><span class="thumb"><img src="' + item.data + '" style="width:100%;height:100%;object-fit:cover;object-position:' + (cols === 1 ? 0 : (i % cols) / (cols - 1) * 100) + "% " + (rows === 1 ? 0 : Math.floor(i / cols) / (rows - 1) * 100) + '%;image-rendering:pixelated"></span><span class="nm">' + (i + 1) + "</span></div>";
  }
  return out;
}

function bindassetpage(host, kind, item) {
  host.addEventListener("input", function (ev) {
    var el = ev.target;
    if (el.hasAttribute("data-afield")) {
      var f = el.getAttribute("data-afield");
      if (f === "cols2" || f === "rows2") item[f] = Math.max(1, parseInt(el.value, 10) || 1);
      else if (el.type === "checkbox") item[f] = el.checked;
      else if (el.type === "number" || el.type === "range") item[f] = parseFloat(el.value);
      else item[f] = el.value;
      schedulecommit();
      if (kind === "shader") schedulepreview();
      if (kind === "anim" || kind === "mat") refreshall();
    } else if (el.hasAttribute("data-sflag")) {
      item.flags[el.getAttribute("data-sflag")] = el.checked;
      schedulecommit();
    } else if (el.hasAttribute("data-lang")) {
      var li = +el.getAttribute("data-li");
      item.langs[li][el.getAttribute("data-lang")] = el.value;
      schedulecommit();
    } else if (el.hasAttribute("data-lkey")) {
      var ki = +el.getAttribute("data-lkey");
      var code = el.getAttribute("data-lcode");
      item.keys[ki].values = item.keys[ki].values || {};
      item.keys[ki].values[code] = el.value;
      schedulecommit();
    } else if (el.hasAttribute("data-ach")) {
      var ai = +el.getAttribute("data-ai");
      var key = el.getAttribute("data-ach");
      item.achievements[ai][key] = key === "done" ? el.checked : el.value;
      schedulecommit();
    } else if (el.hasAttribute("data-tcol")) {
      item.cols[+el.getAttribute("data-tcol")] = el.value;
      schedulecommit();
    } else if (el.hasAttribute("data-trow")) {
      var ri = +el.getAttribute("data-trow");
      item.rows[ri][+el.getAttribute("data-tcell")] = el.value;
      schedulecommit();
    } else if (el.hasAttribute("data-tk")) {
      var ti = +el.getAttribute("data-ti");
      var kix = +el.getAttribute("data-ki");
      item.tracks[ti].keys[kix][el.getAttribute("data-tk")] = parseFloat(el.value) || 0;
      schedulecommit();
    }
  });
  if (kind === "shader") {
    schedulepreview();
  }
}

var previewraf = null;

function schedulepreview() {
  if (previewraf) cancelAnimationFrame(previewraf);
  previewraf = requestAnimationFrame(function () {
    previewraf = null;
    shaderpreview();
  });
}

function shaderpreview() {
  var cv = qs("#shaderpreview");
  if (!cv) return;
  var page = cv.closest(".docpage");
  if (!page) return;
  var frag = page.querySelector('[data-afield="frag"]');
  var vert = page.querySelector('[data-afield="vert"]');
  var err = qs("#shadererr");
  var gl = cv.getContext("webgl");
  if (!gl) return;
  if (!gl.__loop) {
    gl.__loop = true;
    var t0 = performance.now();
    function frame() {
      if (!document.body.contains(cv)) {
        gl.__loop = false;
        return;
      }
      var p = cv.closest(".docpage");
      var f = p && p.querySelector('[data-afield="frag"]');
      var v = p && p.querySelector('[data-afield="vert"]');
      if (f && v) drawshaderframe(gl, cv, v.value, f.value, (performance.now() - t0) / 1000);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if (err) err.textContent = gl.__err || "";
}

function drawshaderframe(gl, cv, vertsrc, fragsrc, time) {
  function compile(type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      gl.__err = (gl.getShaderInfoLog(sh) || "shader error").split("\n")[0].slice(0, 90);
      return null;
    }
    return sh;
  }
  var key = vertsrc + "||" + fragsrc;
  if (gl.__key !== key) {
    gl.__key = key;
    var vs = compile(gl.VERTEX_SHADER, vertsrc);
    var fs = compile(gl.FRAGMENT_SHADER, fragsrc);
    if (!vs || !fs) return;
    var pr = gl.createProgram();
    gl.attachShader(pr, vs);
    gl.attachShader(pr, fs);
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) {
      gl.__err = "link error";
      return;
    }
    gl.__prog = pr;
    gl.__utime = gl.getUniformLocation(pr, "uTime");
    gl.__err = "";
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), gl.STATIC_DRAW);
    gl.__buf = buf;
  }
  if (!gl.__prog) return;
  gl.viewport(0, 0, cv.width, cv.height);
  gl.clearColor(0.06, 0.07, 0.08, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(gl.__prog);
  var loc = gl.getAttribLocation(gl.__prog, "position");
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.__buf);
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
  if (gl.__utime) gl.uniform1f(gl.__utime, time);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function assignmaterial(id) {
  var item = assetfind("mat", id);
  var sel = qs("[data-matassign]");
  if (!item || !sel) return;
  var node = findnode(app.scene.objects, sel.value);
  if (!node) return;
  node.mat = item.id;
  node.color = item.color;
  node.opacity = item.opacity;
  commit("assignmat");
  toast("Material applied to " + node.name, "ok");
}

function assignanim(id) {
  var item = assetfind("anim", id);
  var sel = qs("[data-animassign]");
  if (!item || !sel) return;
  var node = findnode(app.scene.objects, sel.value);
  if (!node) return;
  node.anim = item.id;
  if (item.frames.length) node.sprite = item.frames[0];
  commit("assignanim");
  toast("Animator applied to " + node.name, "ok");
}

function playtimeline(id) {
  var item = assetfind("timeline", id);
  if (!item || !item.tracks.length) {
    toast("Add a track first", "warn");
    return;
  }
  var starts = item.tracks.map(function (t) {
    var n = findnode(app.scene.objects, t.id);
    return n ? n.pos.slice() : [0, 0, 0];
  });
  var t0 = performance.now();
  app.timelineplay = true;
  function frame() {
    var el = (performance.now() - t0) / 1000;
    if (el > item.length || qs("#page" + ("timeline" + id))) {
    }
    item.tracks.forEach(function (t, ti) {
      var n = findnode(app.scene.objects, t.id);
      if (!n || !t.keys.length) return;
      var keys = t.keys.slice().sort(function (a, b) {
        return a.time - b.time;
      });
      var prev = keys[0];
      var next = keys[keys.length - 1];
      for (var i = 0; i < keys.length; i++) {
        if (keys[i].time <= el) {
          prev = keys[i];
          next = keys[i + 1] || keys[i];
        }
      }
      var span = Math.max(0.001, next.time - prev.time);
      var k = Math.min(1, Math.max(0, (el - prev.time) / span));
      n.pos[0] = prev.x + (next.x - prev.x) * k;
      n.pos[1] = prev.y + (next.y - prev.y) * k;
      n.pos[2] = prev.z + (next.z - prev.z) * k;
    });
    if (el < item.length) {
      requestAnimationFrame(frame);
    } else {
      item.tracks.forEach(function (t, ti) {
        var n = findnode(app.scene.objects, t.id);
        if (n && starts[ti]) n.pos = starts[ti].slice();
      });
      app.timelineplay = false;
      touch();
    }
  }
  requestAnimationFrame(frame);
  toast("Playing timeline " + item.name, "ok");
}
