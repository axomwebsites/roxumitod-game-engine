var matlib = {};
var matinstances = {};

function matnew(name, opts) {
  var m = {
    id: newid("mt"),
    name: name || "Material",
    base: "#c8c8c8",
    roughness: 0.55,
    metalness: 0,
    emission: "#000000",
    emissive: 0,
    opacity: 1,
    normal: 0,
    clearcoat: 0,
    subsurface: 0,
    alpha: "opaque",
    twosided: false,
    shader: "",
    uniforms: {},
    params: {},
    textures: {},
    decal: "",
    refraction: 0,
    ior: 1.45,
    parallax: 0,
    vertexcolor: false,
    stencil: 0,
    layer: "default"
  };
  if (opts) for (var k in opts) m[k] = opts[k];
  matlib[m.id] = m;
  matstore();
  return m;
}

function matstore() {
  try {
    localStorage.setItem("roxumitod-materials-v1", JSON.stringify(matlib));
  } catch (e) {}
}

function matload() {
  try {
    var raw = localStorage.getItem("roxumitod-materials-v1");
    if (!raw) return;
    var list = JSON.parse(raw);
    for (var k in list) matlib[k] = list[k];
  } catch (e) {}
  if (!Object.keys(matlib).length) matseed();
}

function matseed() {
  matnew("Concrete", { base: "#b9bdc4", roughness: 0.85, metalness: 0 });
  matnew("Polished metal", { base: "#cfd6de", roughness: 0.15, metalness: 0.95 });
  matnew("Brushed gold", { base: "#e0b64a", roughness: 0.3, metalness: 1, emission: "#3a2a00", emissive: 0.1 });
  matnew("Red plastic", { base: "#d64545", roughness: 0.35, clearcoat: 0.6 });
  matnew("Glass", { base: "#bfe6ff", roughness: 0.05, metalness: 0, opacity: 0.32, alpha: "blend", refraction: 0.7, twosided: true });
  matnew("Emissive strip", { base: "#ffffff", emission: "#5fd0ff", emissive: 2.4 });
  matnew("Fabric", { base: "#7a6ad8", roughness: 0.95, subsurface: 0.15 });
  matnew("Skin", { base: "#e8b48a", roughness: 0.6, subsurface: 0.55 });
  matnew("Water", { base: "#3a86c8", roughness: 0.08, metalness: 0.1, opacity: 0.7, alpha: "blend", refraction: 0.5, twosided: true });
  matnew("Foliage", { base: "#4e9a3f", roughness: 0.9, twosided: true, subsurface: 0.25 });
}

function matbyid(id) {
  return matlib[id] || null;
}

function matsetup(obj, mat) {
  if (!obj || !mat) return;
  obj.matid = mat.id;
  obj.color = mat.base;
  commit("assign material");
  if (typeof gfxreset === "function") gfxreset();
  refreshall();
}

function matassign() {
  var node = selected();
  if (!node) {
    toast("Select an actor first", "warn");
    return;
  }
  matpanel(node);
}

function matcolor(node) {
  var m = node.matid ? matbyid(node.matid) : null;
  return m ? m.base : node.color;
}

function matthree(m) {
  var T = window.THREE;
  if (!T) return null;
  var opts = {
    color: new T.Color(m.base),
    roughness: m.roughness,
    metalness: m.metalness,
    transparent: m.alpha !== "opaque" && m.opacity < 1,
    opacity: m.opacity,
    side: m.twosided ? T.DoubleSide : T.FrontSide
  };
  if (T.MeshStandardMaterial) {
    opts.emissive = new T.Color(m.emission || "#000000");
    opts.emissiveIntensity = m.emissive || 0;
    opts.roughness = m.roughness;
    opts.metalness = m.metalness;
    if (m.clearcoat && T.MeshPhysicalMaterial) {
      var ph = new T.MeshPhysicalMaterial(opts);
      ph.clearcoat = m.clearcoat;
      ph.ior = m.ior || 1.45;
      if (m.refraction) {
        ph.transmission = m.refraction;
        ph.thickness = 0.6;
      }
      return ph;
    }
    return new T.MeshStandardMaterial(opts);
  }
  return new T.MeshLambertMaterial({ color: m.base, transparent: opts.transparent, opacity: opts.opacity, side: opts.side });
}

function matcustom(m) {
  var T = window.THREE;
  if (!T || !T.ShaderMaterial || !m.shader) return null;
  var uniforms = {
    time: { value: 0 },
    tint: { value: new T.Color(m.base) },
    scale: { value: m.params.scale || 1 },
    amp: { value: m.params.amp === undefined ? 0.1 : m.params.amp },
    speed: { value: m.params.speed === undefined ? 1 : m.params.speed }
  };
  for (var k in m.uniforms) {
    if (typeof m.uniforms[k] === "number") uniforms[k] = { value: m.uniforms[k] };
  }
  var sm = new T.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: m.shader.indexOf("void main") >= 0 && m.shader.indexOf("gl_Position") >= 0 ? m.shader : shaderdefaultvert(),
    fragmentShader: m.shader.indexOf("gl_FragColor") >= 0 || m.shader.indexOf("gl_FragColor") >= 0 || m.shader.indexOf("main") >= 0 ? m.shader : shaderdefaultfrag(),
    transparent: m.alpha !== "opaque",
    side: m.twosided ? T.DoubleSide : T.FrontSide
  });
  sm.userData.custom = true;
  return sm;
}

function shaderdefaultvert() {
  return "varying vec2 vuv;varying vec3 vnorm;void main(){vuv=uv;vnorm=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}";
}

function shaderdefaultfrag() {
  return "uniform vec3 tint;uniform float time;uniform float amp;uniform float speed;varying vec2 vuv;void main(){float w=sin(vuv.x*40.0+time*speed)*0.5+0.5;vec3 c=tint*(0.75+w*amp*2.0);gl_FragColor=vec4(c,1.0);}";
}

function shadercheck(src) {
  var problems = [];
  if (!src || !src.trim()) return ["shader is empty"];
  if (src.indexOf("void main") < 0) problems.push("missing void main()");
  if (src.indexOf("gl_Position") < 0 && src.indexOf("gl_FragColor") < 0) problems.push("missing output write");
  var braces = 0;
  for (var i = 0; i < src.length; i++) {
    if (src[i] === "{") braces++;
    if (src[i] === "}") braces--;
    if (braces < 0) {
      problems.push("unbalanced braces");
      break;
    }
  }
  if (braces !== 0) problems.push("unbalanced braces");
  if (src.indexOf(";") < 0) problems.push("missing semicolons");
  return problems;
}

function matpanel(node) {
  matload();
  var cur = node && node.matid ? matbyid(node.matid) : null;
  if (!cur) cur = matbyid(Object.keys(matlib)[0]);
  var list = Object.keys(matlib).map(function (k) {
    return matlib[k];
  });
  var body = '<div class="matbody">';
  body += u5sec("Material Library", "Physical based materials, instances and shader authoring",
    '<div class="u5btns"><button class="btn" data-matact="new">' + ic("plus", "ico-sm") + " New material</button>" +
    (node ? '<button class="btn ghost" data-matact="assign">' + ic("component", "ico-sm") + " Assign to selection</button>" : "") +
    '<button class="btn ghost" data-matact="clear">Clear on selection</button></div>' +
    '<div class="matgrid">' + list.map(function (m) {
      return '<button class="matcard' + (cur && m.id === cur.id ? " on" : "") + '" data-matpick="' + m.id + '"><span class="swatch" style="background:' + esc(m.base) + '"></span><span class="mn">' + esc(m.name) + '</span><span class="mm">R' + m.roughness.toFixed(2) + " M" + m.metalness.toFixed(2) + "</span></button>";
    }).join("") + "</div>");
  if (cur) {
    body += u5sec("Material Instance", esc(cur.name),
      u5row("Base color", '<input class="inp swatch" type="color" value="' + esc(cur.base) + '" data-matfield="base">') +
      sliderrow("Roughness", cur.roughness, 0, 1, 0.01, 'data-matfield="roughness"') +
      sliderrow("Metalness", cur.metalness, 0, 1, 0.01, 'data-matfield="metalness"') +
      sliderrow("Opacity", cur.opacity, 0, 1, 0.01, 'data-matfield="opacity"') +
      sliderrow("Clearcoat", cur.clearcoat || 0, 0, 1, 0.01, 'data-matfield="clearcoat"') +
      sliderrow("Subsurface", cur.subsurface || 0, 0, 1, 0.01, 'data-matfield="subsurface"') +
      sliderrow("Normal strength", cur.normal || 0, 0, 2, 0.01, 'data-matfield="normal"') +
      sliderrow("Refraction", cur.refraction || 0, 0, 1, 0.01, 'data-matfield="refraction"') +
      sliderrow("Index of refraction", cur.ior || 1.45, 1, 2.5, 0.01, 'data-matfield="ior"') +
      u5row("Emission color", '<input class="inp swatch" type="color" value="' + esc(cur.emission || "#000000") + '" data-matfield="emission">') +
      sliderrow("Emission strength", cur.emissive || 0, 0, 4, 0.05, 'data-matfield="emissive"') +
      u5row("Blend mode", '<select class="inp" data-matfield="alpha"><option value="opaque"' + (cur.alpha === "opaque" ? " selected" : "") + '>Opaque</option><option value="masked"' + (cur.alpha === "masked" ? " selected" : "") + '>Masked</option><option value="blend"' + (cur.alpha === "blend" ? " selected" : "") + '>Translucent</option></select>') +
      u5row("Two sided", check("Render back faces", cur.twosided, 'data-matfield="twosided"')) +
      u5row("Post stencil", '<input class="inp num" type="number" min="0" max="255" value="' + (cur.stencil || 0) + '" data-matfield="stencil">') +
      u5row("Decal", '<input class="inp" value="' + esc(cur.decal || "") + '" data-matfield="decal" placeholder="sprite name for projected decal">') +
      sliderrow("Parallax depth", cur.parallax || 0, 0, 0.2, 0.005, 'data-matfield="parallax"'));
    body += u5sec("Shader Authoring", "Write GLSL for this material and check it before it compiles",
      '<textarea class="shaderedit" id="shadersrc" spellcheck="false">' + esc(cur.shader || shaderdefaultfrag()) + "</textarea>" +
      '<div class="u5btns"><button class="btn" data-matact="compile">' + ic("play", "ico-sm") + " Compile and apply</button>" +
      '<button class="btn ghost" data-matact="reset">Reset to default</button>' +
      '<button class="btn ghost" data-matact="check">Check syntax</button></div>' +
      '<div class="shaderout" id="shaderout">Ready.</div>' +
      '<div class="u5note">Uniforms available: time, tint, scale, amp, speed. Vertex varyings: vuv, vnorm. Fragment output: gl_FragColor.</div>');
  }
  body += "</div>";
  openmodal({
    title: "Material Editor",
    icon: "sphere",
    width: "wide",
    body: body,
    onmount: function (m) {
      m.querySelectorAll("[data-matpick]").forEach(function (b) {
        b.addEventListener("click", function () {
          var id = b.getAttribute("data-matpick");
          if (node) {
            node.matid = id;
            node.color = matbyid(id).base;
            commit("material");
            refreshall();
          }
          closemodal();
          setTimeout(function () {
            matpanel(selected());
          }, 120);
        });
      });
      m.querySelectorAll("[data-matact]").forEach(function (b) {
        b.addEventListener("click", function () {
          var a = b.getAttribute("data-matact");
          if (a === "new") {
            var nm = matnew("Material " + (Object.keys(matlib).length + 1), {});
            closemodal();
            setTimeout(function () {
              matpanel(selected());
            }, 120);
            void nm;
          } else if (a === "assign" && node && cur) {
            node.matid = cur.id;
            node.color = cur.base;
            commit("material");
            refreshall();
            toast(cur.name + " assigned to " + node.name, "ok");
          } else if (a === "clear" && node) {
            delete node.matid;
            node.color = "#c8c8c8";
            commit("material");
            refreshall();
          } else if (a === "compile") {
            var src = qs("#shadersrc").value;
            var probs = shadercheck(src);
            var out = qs("#shaderout");
            if (probs.length) {
              out.textContent = "Errors: " + probs.join(", ");
              out.className = "shaderout bad";
            } else {
              cur.shader = src;
              matstore();
              out.textContent = "Compiled. Applied to every actor using " + cur.name + ".";
              out.className = "shaderout ok";
              commit("shader");
              refreshall();
            }
          } else if (a === "reset") {
            qs("#shadersrc").value = shaderdefaultfrag();
          } else if (a === "check") {
            var pr = shadercheck(qs("#shadersrc").value);
            var o2 = qs("#shaderout");
            o2.textContent = pr.length ? "Errors: " + pr.join(", ") : "No problems found.";
            o2.className = "shaderout " + (pr.length ? "bad" : "ok");
          }
        });
      });
      m.querySelectorAll("[data-matfield]").forEach(function (inp) {
        inp.addEventListener("input", function () {
          var f = inp.getAttribute("data-matfield");
          var v = inp.type === "checkbox" ? inp.checked : inp.type === "range" || inp.type === "number" ? parseFloat(inp.value) : inp.value;
          if (v === "" && inp.type === "number") v = 0;
          cur[f] = v;
          matstore();
          if (node && node.matid === cur.id && f === "base") node.color = v;
          commit("material");
          if (typeof gfxreset === "function") gfxreset();
        });
      });
    }
  });
}

function matquickapply() {
  var node = selected();
  if (!node) {
    toast("Select an actor", "warn");
    return;
  }
  var ids = Object.keys(matlib);
  if (!ids.length) {
    matseed();
    ids = Object.keys(matlib);
  }
  node.matid = ids[0];
  node.color = matlib[ids[0]].base;
  commit("material");
  toast(matlilbname(ids[0]) + " applied", "ok");
  refreshall();
}

function matlilbname(id) {
  var m = matbyid(id);
  return m ? m.name : id;
}

function matgrid() {
  var body = '<div class="matbody">' + u5sec("Materials", "Pick a material to paint onto the selection",
    '<div class="matgrid">' + Object.keys(matlib).map(function (k) {
      var m = matlib[k];
      return '<button class="matcard" data-matpick="' + m.id + '"><span class="swatch" style="background:' + esc(m.base) + '"></span><span class="mn">' + esc(m.name) + '</span><span class="mm">R' + m.roughness.toFixed(2) + " M" + m.metalness.toFixed(2) + "</span></button>";
    }).join("") + "</div>") + "</div>";
  openmodal({
    title: "Material Browser",
    icon: "sphere",
    width: "wide",
    body: body,
    onmount: function (m) {
      m.querySelectorAll("[data-matpick]").forEach(function (b) {
        b.addEventListener("click", function () {
          var n = selected();
          var mat = matbyid(b.getAttribute("data-matpick"));
          if (!n || !mat) return;
          n.matid = mat.id;
          n.color = mat.base;
          commit("material");
          refreshall();
          toast(mat.name + " applied to " + n.name, "ok");
        });
      });
    }
  });
}

function mattick(t) {
  var v = view.main;
  if (!v || !v.scene) return;
  v.scene.traverse(function (o) {
    if (o.material && o.material.userData && o.material.userData.custom) {
      if (o.material.uniforms && o.material.uniforms.time) o.material.uniforms.time.value = t;
    }
  });
}

function matforitem(it, node) {
  if (!node || !node.matid) return null;
  var m = matbyid(node.matid);
  if (!m) return null;
  if (m.shader) return matcustom(m);
  return matthree(m);
}

function matboot() {
  matload();
  if (!Object.keys(matlib).length) matseed();
}
