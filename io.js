var iosys = {
  textures: [],
  clips: [],
  audio: [],
  deps: null,
  paint: null,
  stream: { on: false, loaded: {}, total: 0 }
};

function iokb(n) {
  return n > 1048576 ? (n / 1048576).toFixed(2) + " MB" : n > 1024 ? (n / 1024).toFixed(1) + " KB" : n + " B";
}

function teximport(file) {
  return new Promise(function (resolve) {
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var c = document.createElement("canvas");
        c.width = img.width;
        c.height = img.height;
        var g = c.getContext("2d");
        g.drawImage(img, 0, 0);
        var rec = {
          name: file.name.replace(/\.[^.]+$/, ""),
          w: img.width,
          h: img.height,
          bytes: file.size || 0,
          mips: Math.max(1, Math.floor(Math.log2(Math.max(img.width, img.height))) + 1),
          format: "rgba",
          canvas: c,
          data: c.toDataURL("image/png")
        };
        iosys.textures.push(rec);
        resolve(rec);
      };
      img.onerror = function () {
        resolve(null);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function texcompress(rec, mode) {
  if (!rec || !rec.canvas) return null;
  var t0 = performance.now();
  var c = document.createElement("canvas");
  var step = mode === "half" ? 2 : 1;
  c.width = Math.max(1, Math.round(rec.w / step));
  c.height = Math.max(1, Math.round(rec.h / step));
  var g = c.getContext("2d");
  g.imageSmoothingEnabled = true;
  g.drawImage(rec.canvas, 0, 0, c.width, c.height);
  var alpha = false;
  var data = g.getImageData(0, 0, c.width, c.height).data;
  for (var i = 3; i < data.length; i += 4) {
    if (data[i] < 255) {
      alpha = true;
      break;
    }
  }
  if (mode === "bc1" && alpha) {
    for (var j = 3; j < data.length; j += 4) data[j] = 255;
    g.putImageData(new ImageData(data, c.width, c.height), 0, 0);
  }
  var out = c.toDataURL(mode === "auto" || mode === "bc1" || mode === "bc7" ? "image/png" : "image/jpeg", 0.82);
  rec.compressed = { mode: mode, bytes: Math.round(out.length * 0.75), ms: Math.round(performance.now() - t0), w: c.width, h: c.height, alpha: alpha };
  return rec.compressed;
}

function texpanel() {
  var list = iosys.textures;
  var body = '<div class="iobody">' + u5sec("Texture import", "Drop in images then compress them for the platform",
    '<label class="filebtn"><input type="file" id="texfile" accept="image/*" multiple hidden>' + ic("upload", "ico-sm") + " Choose images</label>" +
    (list.length ? '<div class="texgrid">' + list.map(function (t, i) {
      return '<div class="texcard"><div class="texthumb" style="background-image:url(' + t.data + ')"></div><div class="texmeta"><b>' + esc(t.name) + "</b><span>" + t.w + " x " + t.h + ", " + iokb(t.bytes) + "</span>" +
        (t.compressed ? '<span class="pill ok">' + t.compressed.mode + " " + iokb(t.compressed.bytes) + "</span>" : "") + "</div>" +
        '<div class="texacts"><button class="btn sm" data-texmode="bc1|' + i + '">BC1</button>' +
        '<button class="btn sm ghost" data-texmode="bc7|' + i + '">BC7</button>' +
        '<button class="btn sm ghost" data-texmode="half|' + i + '">Half</button>' +
        '<button class="btn sm ghost" data-texuse="' + i + '">Use</button></div></div>';
    }).join("") + "</div>" : u5note("No textures imported yet.")) +
    '<div class="landout" id="texout">' + list.length + " textures staged.</div>");
  body += "</div>";
  openmodal({
    title: "Texture Import and Compression",
    icon: "image",
    width: "wide",
    body: body,
    onmount: function (m) {
      var inp = m.querySelector("#texfile");
      if (inp) {
        inp.addEventListener("change", function () {
          var files = inp.files;
          var pending = files.length;
          Array.prototype.forEach.call(files, function (f) {
            teximport(f).then(function () {
              pending--;
              if (pending <= 0) {
                closemodal();
                setTimeout(texpanel, 130);
              }
            });
          });
        });
      }
      m.querySelectorAll("[data-texmode]").forEach(function (b) {
        b.addEventListener("click", function () {
          var parts = b.getAttribute("data-texmode").split("|");
          var rec = iosys.textures[parseInt(parts[1], 10)];
          var res = texcompress(rec, parts[0]);
          var out = qs("#texout");
          if (out && res) out.textContent = parts[0] + " compressed " + rec.name + " from " + iokb(rec.bytes) + " to " + iokb(res.bytes) + " in " + res.ms + " ms.";
          closemodal();
          setTimeout(texpanel, 130);
        });
      });
      m.querySelectorAll("[data-texuse]").forEach(function (b) {
        b.addEventListener("click", function () {
          var rec = iosys.textures[parseInt(b.getAttribute("data-texuse"), 10)];
          var a = addcustomsprite(rec.name, rec.data);
          toast(rec.name + " added as a sprite asset", "ok");
          void a;
          closemodal();
        });
      });
    }
  });
}

function animimportjson(json) {
  var out = { bones: [], clips: [] };
  if (!json) return out;
  if (json.nodes && json.skins) {
    var res = skinimportgltf(json);
    out.bones = res.bones;
    out.clips = res.clips;
  }
  return out;
}

function animimportpanel() {
  var body = '<div class="iobody">' + u5sec("Animation import", "glTF animation channels onto a new skeletal actor",
    '<label class="filebtn"><input type="file" id="animfile" accept=".gltf,.json" hidden>' + ic("upload", "ico-sm") + " Choose a glTF file</label>" +
    '<div class="landout" id="animout">' + iosys.clips.length + " clips imported.</div>" +
    u5note("Joint nodes become bones, samplers become key tracks, and the first clip plays on the new actor."));
  body += "</div>";
  openmodal({
    title: "Animation Import",
    icon: "animator",
    body: body,
    onmount: function (m) {
      var inp = m.querySelector("#animfile");
      inp.addEventListener("change", function () {
        var f = inp.files[0];
        if (!f) return;
        var fr = new FileReader();
        fr.onload = function () {
          var json = null;
          try {
            json = JSON.parse(fr.result);
          } catch (e) {
            toast("That file is not valid glTF JSON", "bad");
            return;
          }
          var res = animimportjson(json);
          iosys.clips = iosys.clips.concat(res.clips);
          var n = skinmeshnew("human");
          var s = skindef(n);
          if (res.bones.length) s.bones = res.bones;
          res.clips.forEach(function (c) {
            s.clips[c.name] = c;
          });
          if (res.clips.length) s.current = res.clips[0].name;
          skingenmesh(n);
          commit("anim import");
          refreshall();
          var out = qs("#animout");
          if (out) out.textContent = "Imported " + res.bones.length + " bones and " + res.clips.length + " clips from " + f.name + ".";
          toast("Animation imported", "ok");
        };
        fr.readAsText(f);
      });
    }
  });
}

function audioimportfile(file) {
  return new Promise(function (resolve) {
    var reader = new FileReader();
    reader.onload = function () {
      var rec = { name: file.name, bytes: file.size || 0, data: reader.result, stream: false, dur: 0 };
      var au = new Audio(reader.result);
      au.addEventListener("loadedmetadata", function () {
        rec.dur = au.duration;
        iosys.audio.push(rec);
        resolve(rec);
      });
      au.addEventListener("error", function () {
        iosys.audio.push(rec);
        resolve(rec);
      });
    };
    reader.readAsDataURL(file);
  });
}

function audioimportpanel() {
  var body = '<div class="iobody">' + u5sec("Audio import and streaming", "Load once or stream progressively",
    '<label class="filebtn"><input type="file" id="audiofile" accept="audio/*" hidden>' + ic("upload", "ico-sm") + " Choose audio</label>" +
    (iosys.audio.length ? '<div class="aurows">' + iosys.audio.map(function (a, i) {
      return '<div class="aurow"><span class="an">' + esc(a.name) + '</span><span class="ad">' + (a.dur ? a.dur.toFixed(2) + " s" : "unknown") + '</span><span class="ab">' + iokb(a.bytes) + "</span>" +
        '<button class="btn sm" data-austream="' + i + '">' + (a.stream ? "Streaming" : "Stream") + "</button>" +
        '<button class="btn sm ghost" data-auplay="' + i + '">Play</button></div>';
    }).join("") + "</div>" : u5note("No audio imported yet.")) +
    '<div class="landout" id="auout">' + iosys.audio.length + " clips staged.</div>");
  body += "</div>";
  openmodal({
    title: "Audio Import and Streaming",
    icon: "sound",
    width: "wide",
    body: body,
    onmount: function (m) {
      m.querySelector("#audiofile").addEventListener("change", function (ev) {
        var f = ev.target.files[0];
        if (!f) return;
        audioimportfile(f).then(function (rec) {
          var out = qs("#auout");
          if (out) out.textContent = "Imported " + rec.name + ", " + iokb(rec.bytes) + ".";
          closemodal();
          setTimeout(audioimportpanel, 130);
        });
      });
      m.querySelectorAll("[data-austream]").forEach(function (b) {
        b.addEventListener("click", function () {
          var rec = iosys.audio[parseInt(b.getAttribute("data-austream"), 10)];
          rec.stream = !rec.stream;
          rec.mode = rec.stream ? "range requests" : "buffer";
          toast(rec.name + " now " + (rec.stream ? "streaming" : "buffered"), "ok");
          closemodal();
          setTimeout(audioimportpanel, 130);
        });
      });
      m.querySelectorAll("[data-auplay]").forEach(function (b) {
        b.addEventListener("click", function () {
          var rec = iosys.audio[parseInt(b.getAttribute("data-auplay"), 10)];
          var au = new Audio(rec.data);
          au.play().catch(function () {
            toast("Click again to allow playback", "warn");
          });
        });
      });
    }
  });
}

function depgraph() {
  var nodes = [];
  var edges = [];
  walk((app.scene && app.scene.objects) || [], function (n) {
    nodes.push({ id: n.id, label: n.name, kind: n.type });
    if (n.sprite) edges.push([n.id, "spr:" + n.sprite]);
    if (n.matid) edges.push([n.id, "mat:" + n.matid]);
    if (n.assetid) edges.push([n.id, "ast:" + n.assetid]);
    if (n.levelid) edges.push([n.id, "lvl:" + n.levelid]);
  });
  (app.project.assets || []).forEach(function (a) {
    nodes.push({ id: "ast:" + a.id, label: a.name, kind: "asset" });
  });
  Object.keys(matlib || {}).forEach(function (k) {
    nodes.push({ id: "mat:" + k, label: matlib[k].name, kind: "material" });
  });
  Object.keys(spriteinfo || {}).forEach(function (k) {
    if (spriteinfo[k].custom) nodes.push({ id: "spr:" + k, label: spriteinfo[k].name, kind: "sprite" });
  });
  (app.project.scripts || []).forEach(function (s) {
    nodes.push({ id: "scr:" + s.id, label: s.name, kind: "script" });
  });
  var used = {};
  edges.forEach(function (e) {
    used[e[1]] = (used[e[1]] || 0) + 1;
  });
  var orphans = nodes.filter(function (n) {
    return !used[n.id] && (n.kind === "asset" || n.kind === "material" || n.kind === "sprite" || n.kind === "script");
  });
  iosys.deps = { nodes: nodes, edges: edges, orphans: orphans };
  return iosys.deps;
}

function depspanel() {
  var d = depgraph();
  var body = '<div class="depbody">' + u5sec("Asset dependency graph", "What uses what across the level",
    u5row("Nodes", '<span class="u5val">' + d.nodes.length + "</span>") +
    u5row("Links", '<span class="u5val">' + d.edges.length + "</span>") +
    u5row("Unused", '<span class="u5val">' + d.orphans.length + "</span>") +
    '<div class="depgrid">' + d.nodes.slice(0, 60).map(function (n) {
      var refs = d.edges.filter(function (e) {
        return e[1] === n.id;
      }).length;
      return '<div class="depchip ' + esc(n.kind) + '"><b>' + esc(n.label) + "</b><span>" + esc(n.kind) + "</span><i>" + refs + "</i></div>";
    }).join("") + "</div>" +
    (d.orphans.length ? '<div class="u5note">Unused: ' + d.orphans.map(function (o) {
      return o.label;
    }).join(", ") + "</div>" : ""));
  body += "</div>";
  openmodal({
    title: "Asset Dependencies",
    icon: "network",
    width: "wide",
    body: body
  });
}

function paintnew() {
  var c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  var g = c.getContext("2d");
  g.fillStyle = "#6a8fb8";
  g.fillRect(0, 0, 256, 256);
  for (var i = 0; i < 220; i++) {
    g.fillStyle = "rgba(" + Math.floor(120 + Math.random() * 120) + "," + Math.floor(120 + Math.random() * 120) + "," + Math.floor(120 + Math.random() * 120) + ",.25)";
    g.fillRect(Math.random() * 256, Math.random() * 256, 6, 6);
  }
  iosys.paint = { canvas: c, ctx: g, color: "#e8c07a", size: 14, mode: "brush", layers: [{ name: "Base", visible: true }], active: 0 };
  return iosys.paint;
}

function paintpanel() {
  if (!iosys.paint) paintnew();
  var p = iosys.paint;
  var body = '<div class="paintbody">' + u5sec("Texture painting", "Paint directly onto a texture and assign it to the selection",
    '<div class="paintwrap"><canvas id="paintcanvas" width="256" height="256" class="paintcanvas"></canvas></div>' +
    u5row("Colour", '<input class="inp swatch" type="color" value="' + esc(p.color) + '" data-paint="color">') +
    sliderrow("Brush size", p.size, 1, 60, 1, 'data-paint="size"') +
    selectrow("Mode", ["brush", "erase", "blur", "fill"], p.mode, 'data-paint="mode"') +
    u5row("Layers", '<span class="u5val">' + p.layers.map(function (l) {
      return l.name;
    }).join(", ") + "</span>") +
    '<div class="u5btns"><button class="btn" data-paintact="addlayer">Add layer</button>' +
    '<button class="btn ghost" data-paintact="apply">Apply to selection</button>' +
    '<button class="btn ghost" data-paintact="clear">Clear</button></div>' +
    '<div class="landout" id="paintout">Paint with the pointer, then apply.</div>');
  body += "</div>";
  openmodal({
    title: "Texture Painting",
    icon: "brush",
    body: body,
    onmount: function (m) {
      var cv = m.querySelector("#paintcanvas");
      var g = cv.getContext("2d");
      g.drawImage(p.canvas, 0, 0);
      var down = false;
      function paintat(ev) {
        var r = cv.getBoundingClientRect();
        var x = (ev.clientX - r.left) / r.width * 256;
        var y = (ev.clientY - r.top) / r.height * 256;
        g.save();
        if (p.mode === "erase") {
          g.globalCompositeOperation = "destination-out";
          g.fillStyle = "rgba(0,0,0,1)";
        } else if (p.mode === "blur") {
          g.globalAlpha = 0.2;
          g.fillStyle = "rgba(255,255,255,.4)";
        } else {
          g.fillStyle = p.color;
        }
        g.beginPath();
        g.arc(x, y, p.size / 2, 0, 6.283);
        g.fill();
        g.restore();
        p.canvas.getContext("2d").drawImage(cv, 0, 0);
      }
      cv.addEventListener("pointerdown", function (ev) {
        down = true;
        if (p.mode === "fill") {
          g.fillStyle = p.color;
          g.fillRect(0, 0, 256, 256);
          p.canvas.getContext("2d").drawImage(cv, 0, 0);
          return;
        }
        paintat(ev);
      });
      cv.addEventListener("pointermove", function (ev) {
        if (down) paintat(ev);
      });
      window.addEventListener("pointerup", function () {
        down = false;
      });
      m.querySelectorAll("[data-paint]").forEach(function (el) {
        el.addEventListener("input", function () {
          var f = el.getAttribute("data-paint");
          p[f] = f === "size" ? parseFloat(el.value) : el.value;
        });
      });
      m.querySelectorAll("[data-paintact]").forEach(function (b) {
        b.addEventListener("click", function () {
          var a = b.getAttribute("data-paintact");
          if (a === "addlayer") {
            p.layers.push({ name: "Layer " + (p.layers.length + 1), visible: true });
            var out = qs("#paintout");
            if (out) out.textContent = p.layers.length + " layers.";
          } else if (a === "apply") {
            var n = selected();
            var data = p.canvas.toDataURL("image/png");
            var a2 = addcustomsprite("Painted" + Date.now().toString().slice(-4), data);
            if (n && n.type === "sprite") {
              n.sprite = "custom:" + a2.id;
            } else if (n) {
              n.sprite = "custom:" + a2.id;
              n.type = "sprite";
            }
            commit("paint apply");
            refreshall();
            var out2 = qs("#paintout");
            if (out2) out2.textContent = "Texture assigned to " + (n ? n.name : "the asset library") + ".";
            toast("Painted texture applied", "ok");
          } else {
            g.clearRect(0, 0, 256, 256);
            p.canvas.getContext("2d").clearRect(0, 0, 256, 256);
          }
        });
      });
    }
  });
}

function hairlabpanel() {
  var body = '<div class="hairbody">' + u5sec("Cloth, hair, fur and eyes", "Strand, shell and cloth solvers",
    '<div class="u5btns"><button class="btn" data-hairact="cloth">Add cloth</button>' +
    '<button class="btn ghost" data-hairact="hair">Add groom hair</button>' +
    '<button class="btn ghost" data-hairact="fur">Add fur shell</button>' +
    '<button class="btn ghost" data-hairact="eye">Add eye</button></div>' +
    '<div class="landout">Cloth simulates with a mass spring grid pinned at the top edge. Fur renders as stacked shells. Eyes use a parallax iris.</div>');
  body += u5sec("Solver settings", "Iterations and damping",
    sliderrow("Cloth damping", 0.96, 0.5, 1, 0.01, 'data-clothdamp="damp"') +
    sliderrow("Cloth wind", 0.4, 0, 3, 0.05, 'data-clothdamp="wind"') +
    sliderrow("Fur shells", 6, 1, 24, 1, 'data-clothdamp="shells"') +
    sliderrow("Strand count", 220, 20, 2000, 10, 'data-clothdamp="strands"'));
  body += "</div>";
  openmodal({
    title: "Cloth, Hair, Fur and Eyes",
    icon: "human",
    width: "wide",
    body: body,
    onmount: function (m) {
      m.querySelectorAll("[data-hairact]").forEach(function (b) {
        b.addEventListener("click", function () {
          var a = b.getAttribute("data-hairact");
          if (a === "cloth") clothnew();
          else if (a === "hair") hairnew();
          else if (a === "fur") furnew();
          else eyesnew();
        });
      });
      m.querySelectorAll("[data-clothdamp]").forEach(function (el) {
        el.addEventListener("input", function () {
          var f = el.getAttribute("data-clothdamp");
          var v = parseFloat(el.value);
          walk(app.scene.objects, function (n) {
            if (n.cloth && (f === "damp" || f === "wind")) n.cloth[f] = v;
            if (n.fur && f === "shells") n.fur.shells = v;
            if (n.hair && f === "strands") n.hair.strands = v;
          });
          commit("hair");
        });
      });
    }
  });
}

function ioboot() {
  iosys.stream.total = 0;
}
