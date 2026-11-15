var guielements = { frame: 1, label: 1, button: 1, image: 1, bar: 1, slider: 1, joystick: 1 };
var guiscreens = { screengui: 1, canvas: 1 };

function guielement(n) {
  return !!(n && guielements[n.type]);
}

function guiscreen(n) {
  return !!(n && guiscreens[n.type]);
}

function guiphys(n) {
  if (!n) return false;
  if (n.physical) return true;
  var pl = parentlistof(n.id);
  while (pl && pl.parent) {
    if (guiscreen(pl.parent) && pl.parent.physical) return true;
    pl = parentlistof(pl.parent.id);
  }
  return false;
}

function guiparentof(n) {
  var pl = parentlistof(n.id);
  while (pl && pl.parent) {
    if (guiscreen(pl.parent)) return pl.parent;
    pl = parentlistof(pl.parent.id);
  }
  return null;
}

function guilist() {
  var out = [];
  walk(app.scene.objects || [], function (n) {
    if (guiscreen(n)) out.push(n);
  });
  return out;
}

function guichildren(screen) {
  var out = [];
  walk(screen.children || [], function (n) {
    if (guielement(n)) out.push(n);
  });
  return out;
}

function guiall() {
  var out = [];
  walk(app.scene.objects || [], function (n) {
    if (guielement(n)) out.push(n);
  });
  return out;
}

function guiensure() {
  var list = guilist();
  if (list.length) return list[0];
  var g = basenode("screengui", { name: "ScreenGui", pos: [0, 0, 0] });
  g.compdata = g.compdata || {};
  g.compdata.ui = { scalemode: "Scale with screen size", refw: 740, refh: 360, sort: 0 };
  g.children = [];
  app.scene.objects.push(g);
  return g;
}

function guimeta(type) {
  var meta = {
    screengui: { label: "ScreenGui", icon: "layers", group: "gui" },
    frame: { label: "Frame", icon: "square", group: "gui" },
    image: { label: "Image", icon: "image", group: "gui" }
  };
  return meta[type] || null;
}

function guidefault(node) {
  node.compdata = node.compdata || {};
  var d = node.compdata.ui = node.compdata.ui || {};
  if (d.anchor === undefined) d.anchor = "Center";
  if (d.x === undefined) d.x = 0;
  if (d.y === undefined) d.y = 0;
  if (d.w === undefined) d.w = node.type === "joystick" ? 130 : node.type === "label" ? 200 : 200;
  if (d.h === undefined) d.h = node.type === "joystick" ? 130 : 48;
  if (d.color === undefined) d.color = node.type === "frame" ? "#1f2430" : "#2f6fd0";
  if (d.textcolor === undefined) d.textcolor = "#ffffff";
  if (d.fontsize === undefined) d.fontsize = node.type === "label" ? 24 : 18;
  if (d.radius === undefined) d.radius = 8;
  if (d.value === undefined) d.value = 0.6;
  if (node.type === "label" && !node.text) node.text = "Label";
  if (node.type === "button" && !node.text) node.text = "Button";
  return d;
}

function guinew(kind, screen) {
  if (kind === "screengui") {
    var g = basenode("screengui", { name: "ScreenGui", pos: [0, 0, 0] });
    guidefault(g);
    g.compdata.ui.scalemode = "Scale with screen size";
    g.children = [];
    app.scene.objects.push(g);
    app.selid = g.id;
    commit("add screengui");
    return g;
  }
  var host = screen || (guiscreen(selected()) ? selected() : guiparentof(selected() || {}) || guiensure());
  var node = basenode(kind, { pos: [0, 0, 0] });
  node.name = {
    frame: "Frame",
    label: "Label",
    button: "Button",
    image: "Image",
    bar: "Bar",
    slider: "Slider",
    joystick: "Joystick"
  }[kind] || kind;
  if (kind === "image") node.sprite = "coin";
  guidefault(node);
  var d = node.compdata.ui;
  d.anchor = kind === "joystick" ? "Bottom left" : kind === "bar" ? "Top right" : kind === "slider" ? "Bottom center" : "Center";
  var slot = (host.children || []).length;
  d.x = kind === "joystick" ? 90 : 0;
  d.y = kind === "bar" ? -30 : kind === "slider" ? -60 : Math.round((slot - 1) * 62);
  if (kind === "bar" || kind === "slider") d.w = 220;
  if (kind === "joystick") d.w = 130;
  node.comps = ["ui"];
  host.children = host.children || [];
  node.name = uniqueid(app.scene.objects, node.name);
  host.children.push(node);
  app.expanded = app.expanded || {};
  app.expanded[host.id] = true;
  app.selid = node.id;
  app.selids = [node.id];
  commit("add gui");
  toast(host.name + " / " + node.name + " added", "ok");
  refreshall();
  return node;
}

function guitogglephysical(node) {
  if (!node) return;
  node.physical = !node.physical;
  if (node.physical) {
    if (!node.pos || (node.pos[0] === 0 && node.pos[1] === 0 && node.pos[2] === 0)) node.pos = [app.cam.target[0], 1.2, 0];
  } else {
    node.pos = [0, 0, 0];
  }
  commit("gui physical");
  refreshall();
  toast(node.name + (node.physical ? " is now physical (in world)" : " is now on screen"), "ok");
}

var guiphyscache = {};

function guidrawphysicalcanvas(node) {
  var d = guidefault(node);
  var w = Math.max(32, Math.round(uivalue(node, "w", 200)));
  var h = Math.max(24, Math.round(uivalue(node, "h", 48)));
  if (node.type === "joystick") w = h = Math.round(uivalue(node, "w", 130));
  var ver = [node.type, w, h, d.color, d.textcolor, d.value, d.radius, node.text, node.sprite, d.fontsize, d.bold].join("|");
  var hit = guiphyscache[node.id];
  if (hit && hit.ver === ver) return hit.canvas;
  var c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  var g = c.getContext("2d");
  var radius = Math.max(0, Math.min(h / 2, uivalue(node, "radius", 8)));
  function rr(x, y, ww, hh, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + ww, y, x + ww, y + hh, r);
    g.arcTo(x + ww, y + hh, x, y + hh, r);
    g.arcTo(x, y + hh, x, y, r);
    g.arcTo(x, y, x + ww, y, r);
    g.closePath();
  }
  if (node.type === "image") {
    try {
      g.drawImage(artmake(node.sprite || "coin"), 0, 0, w, h);
    } catch (e) {}
  } else if (node.type === "joystick") {
    g.fillStyle = "rgba(20,26,36,.4)";
    g.beginPath();
    g.arc(w / 2, h / 2, w / 2 - 2, 0, 6.2832);
    g.fill();
    g.fillStyle = d.color || "#2f6fd0";
    g.beginPath();
    g.arc(w / 2, h / 2, w / 4, 0, 6.2832);
    g.fill();
  } else {
    g.fillStyle = d.color || "#2f6fd0";
    rr(0, 0, w, h, radius);
    g.fill();
    if (node.type === "bar") {
      g.fillStyle = "rgba(0,0,0,.35)";
      rr(0, 0, w, h, radius);
      g.fill();
      g.fillStyle = d.color || "#37c46f";
      rr(0, 0, Math.max(2, w * uivalue(node, "value", 0.6)), h, radius);
      g.fill();
    }
    if (node.type === "slider") {
      g.fillStyle = "rgba(0,0,0,.3)";
      rr(0, h * 0.3, w, h * 0.4, h * 0.2);
      g.fill();
      var v = uivalue(node, "value", 0.5);
      g.fillStyle = d.color || "#5b8def";
      rr(0, h * 0.3, Math.max(h * 0.4, w * v), h * 0.4, h * 0.2);
      g.fill();
      g.fillStyle = "#ffffff";
      g.beginPath();
      g.arc(w * v, h / 2, h * 0.3, 0, 6.2832);
      g.fill();
    }
    var txt = node.type === "frame" ? "" : (node.text || "");
    if (txt) {
      g.fillStyle = d.textcolor || "#ffffff";
      g.font = (d.bold === false ? "" : "700 ") + Math.round(uivalue(node, "fontsize", 18)) + "px Inter, system-ui, sans-serif";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(txt, w / 2, h / 2 + 1);
    }
  }
  c.artversion = ver;
  node.guiver = ver;
  guiphyscache[node.id] = { ver: ver, canvas: c };
  return c;
}

function guiphystick(node) {
  if (!guiphys(node)) return;
  var key = "guiphy" + node.id;
  var c = guidrawphysicalcanvas(node);
  var T = window.THREE;
  if (!T) return;
  var tex = null;
  if (node.type === "image") tex = artmake(node.sprite || "coin");
  return { canvas: c, sig: c.artversion, key: key };
}

function guieditordraw(g) {
  if (!g || !view.stage) return;
  var w = view.w;
  var h = view.h;
  g.save();
  guilist().forEach(function (sc) {
    if (sc.visible === false || sc.physical) return;
    var d = sc.compdata && sc.compdata.ui ? sc.compdata.ui : {};
    g.setLineDash([5, 4]);
    g.lineWidth = 1;
    g.strokeStyle = "rgba(120,170,255,.45)";
    g.strokeRect(6, 6, w - 12, h - 12);
    g.setLineDash([]);
    if (app.showguiframe !== false) {
      var tag = sc.name + (d.refw ? "  " + d.refw + " x " + d.refh : "") + (sc.physical ? "  physical" : "");
      g.font = "600 10px Inter, system-ui, sans-serif";
      g.textAlign = "left";
      g.textBaseline = "top";
      var tw = g.measureText(tag).width + 16;
      var y0 = 26;
      g.fillStyle = "rgba(20,32,48,.72)";
      g.fillRect(10, y0, tw, 18);
      g.fillStyle = "rgba(150,195,255,.95)";
      g.fillText(tag, 18, y0 + 4);
    }
  });
  if (typeof uidraw === "function") uidraw(g, w, h);
  var sel = selected();
  if (sel && guiscreen(sel) && !sel.physical) {
    g.strokeStyle = "rgba(120,220,255,.9)";
    g.lineWidth = 2;
    g.strokeRect(3, 3, w - 6, h - 6);
  }
  var el = guiall().filter(function (n) {
    return n.id === app.selid;
  })[0];
  if (el && !guiphys(el)) {
    var ref = (typeof uistate !== "undefined" && uistate.ref) || uirefsize();
    var s = (typeof uistate !== "undefined" && uistate.scale) || 1;
    var r = uirect(el, w, h, s, ref);
    g.strokeStyle = "#63e0ff";
    g.lineWidth = 1.6;
    g.strokeRect(r.x - 1, r.y - 1, r.w + 2, r.h + 2);
    g.fillStyle = "rgba(99,224,255,.12)";
    g.fillRect(r.x, r.y, r.w, r.h);
    g.fillStyle = "#63e0ff";
    g.font = "600 10px Inter, system-ui, sans-serif";
    g.textAlign = "left";
    g.textBaseline = "bottom";
    g.fillText(el.name, r.x, r.y - 3);
    [[r.x, r.y], [r.x + r.w, r.y], [r.x, r.y + r.h], [r.x + r.w, r.y + r.h]].forEach(function (pt) {
      g.fillStyle = "#ffffff";
      g.fillRect(pt[0] - 2.5, pt[1] - 2.5, 5, 5);
    });
  }
  g.restore();
}

function guihitat(x, y) {
  var w = view.w;
  var h = view.h;
  var ref = (typeof uistate !== "undefined" && uistate.ref) || uirefsize();
  var s = (typeof uistate !== "undefined" && uistate.scale) || 1;
  var found = null;
  guiall().forEach(function (n) {
    if (guiphys(n) || n.visible === false) return;
    var r = uirect(n, w, h, s, ref);
    if (x >= r.x - 2 && x <= r.x + r.w + 2 && y >= r.y - 2 && y <= r.y + r.h + 2) found = { node: n, rect: r };
  });
  return found;
}

function guibind() {
  var stage = qs("#stage");
  if (!stage || stage.dataset.guibound) return;
  stage.dataset.guibound = "1";
  var drag = null;
  stage.addEventListener("pointerdown", function (ev) {
    if (app.play || ev.button !== 0) return;
    if (ev.target && ev.target.closest && ev.target.closest("button, input, select, .viewtools, .playui")) return;
    var r = stage.getBoundingClientRect();
    var hit = guihitat(ev.clientX - r.left, ev.clientY - r.top);
    if (!hit) return;
    app.selid = hit.node.id;
    app.selids = [hit.node.id];
    app.transformmode = "move";
    if (hit.node.lock) {
      refreshpickers();
      toast(hit.node.name + " is locked, unlock it first", "warn");
      ev.stopPropagation();
      ev.preventDefault();
      return;
    }
    var d = guidefault(hit.node);
    drag = { node: hit.node, sx: ev.clientX, sy: ev.clientY, ox: uivalue(hit.node, "x", 0), oy: uivalue(hit.node, "y", 0), snap: snapshot() };
    refreshpickers();
    renderright();
    stage.setPointerCapture(ev.pointerId);
    ev.stopPropagation();
    ev.preventDefault();
  }, true);
  stage.addEventListener("pointermove", function (ev) {
    if (!drag) return;
    var s = (typeof uistate !== "undefined" && uistate.scale) || 1;
    var d = guidefault(drag.node);
    var dx = (ev.clientX - drag.sx) / Math.max(0.2, s);
    var dy = (ev.clientY - drag.sy) / Math.max(0.2, s);
    d.x = Math.round((drag.ox + dx) * 2) / 2;
    d.y = Math.round((drag.oy + dy) * 2) / 2;
    app.dirty = true;
    ev.stopPropagation();
  }, true);
  stage.addEventListener("pointerup", function () {
    if (!drag) return;
    app.undolist.push(drag.snap);
    if (app.undolist.length > 60) app.undolist.shift();
    app.redolist = [];
    drag = null;
    commit("move gui");
    refreshall();
  }, true);
}

function guirig() {
  var sc = guiensure();
  var kids = guichildren(sc);
  if (!kids.length) {
    guinew("label", sc);
    guinew("button", sc);
    return;
  }
  kids.forEach(function (n, i) {
    var d = guidefault(n);
    d.y = -100 + i * 70;
  });
  commit("layout gui");
  refreshall();
}

function guiservicepanel() {
  var list = guilist();
  var body = '<div class="guiserv">';
  body += '<div class="u5note">ScreenGui draws on the screen, exactly like Roblox Studio. Every element inside it stays on screen in the editor and in play. Tick Physical to place the same element in the 3D world instead (SurfaceGui style).</div>';
  list.forEach(function (sc, si) {
    var kids = guichildren(sc);
    body += '<div class="subsec"><div class="sechead"><span class="ico">' + ic("layers", "ico-sm") + '</span><span>' + esc(sc.name) + '</span><span class="tools"><span class="pill">' + plural(kids.length, "element") + (sc.physical ? " · physical" : " · screen") + "</span></span></div>";
    body += '<div class="secbody">';
    body += '<div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:8px">';
    body += '<button class="btn sm" data-guiadd="label" data-guiscreen="' + sc.id + '">' + ic("text", "ico-xs") + " Label</button>";
    body += '<button class="btn sm" data-guiadd="button" data-guiscreen="' + sc.id + '">' + ic("square", "ico-xs") + " Button</button>";
    body += '<button class="btn sm" data-guiadd="frame" data-guiscreen="' + sc.id + '">' + ic("square", "ico-xs") + " Frame</button>";
    body += '<button class="btn sm" data-guiadd="image" data-guiscreen="' + sc.id + '">' + ic("image", "ico-xs") + " Image</button>";
    body += '<button class="btn sm" data-guiadd="bar" data-guiscreen="' + sc.id + '">' + ic("sliders", "ico-xs") + " Bar</button>";
    body += '<button class="btn sm" data-guiadd="slider" data-guiscreen="' + sc.id + '">' + ic("sliders", "ico-xs") + " Slider</button>";
    body += '<button class="btn sm" data-guiadd="joystick" data-guiscreen="' + sc.id + '">' + ic("target", "ico-xs") + " Joystick</button>";
    body += "</div>";
    if (!kids.length) body += '<div class="tiny dim">No elements yet. Add one above.</div>';
    kids.forEach(function (n) {
      var d = guidefault(n);
      body += '<div class="guirow' + (app.selid === n.id ? " on" : "") + '">';
      body += '<span class="gico">' + ic(n.type === "image" ? "image" : n.type === "label" ? "text" : n.type === "frame" ? "square" : "sliders", "ico-sm") + "</span>";
      body += '<button class="gname" data-act="selectnode" data-id="' + n.id + '">' + esc(n.name) + "</button>";
      body += '<span class="gmeta">' + esc(d.anchor || "Center") + " · " + Math.round(uivalue(n, "w", 200)) + "x" + Math.round(uivalue(n, "h", 48)) + "</span>";
      body += '<button class="btn sm ghost' + (n.physical ? " on" : "") + '" data-guiphys="' + n.id + '" title="Render in the 3D world">' + (n.physical ? "Physical" : "Screen") + "</button>";
      body += '<button class="iconbtn" data-guidel="' + n.id + '" title="Delete">' + ic("trash", "ico-xs") + "</button>";
      body += "</div>";
    });
    body += '<div class="row" style="gap:6px;margin-top:8px"><button class="btn sm ghost" data-guisel="' + sc.id + '">Select ScreenGui</button><button class="btn sm ghost" data-guiphys="' + sc.id + '">' + (sc.physical ? "Make screen" : "Make physical") + '</button><button class="btn sm ghost" data-guidel="' + sc.id + '">Delete ScreenGui</button></div>';
    body += "</div></div>";
  });
  body += '<div class="u5btns"><button class="btn" data-guiadd="screengui">' + ic("plus", "ico-sm") + " New ScreenGui</button>" +
    '<button class="btn ghost" data-guirig="1">Arrange test layout</button></div>';
  body += "</div>";
  openmodal({
    title: "GUI Service",
    icon: "layers",
    width: "wide",
    body: body,
    onmount: function (m) {
      m.querySelectorAll("[data-guiadd]").forEach(function (b) {
        b.addEventListener("click", function () {
          var kind = b.getAttribute("data-guiadd");
          var sid = b.getAttribute("data-guiscreen");
          var screen = sid ? findnode(app.scene.objects, sid) : null;
          guinew(kind, screen);
          closemodal();
          setTimeout(guiservicepanel, 120);
        });
      });
      m.querySelectorAll("[data-guiphys]").forEach(function (b) {
        b.addEventListener("click", function () {
          var n = findnode(app.scene.objects, b.getAttribute("data-guiphys"));
          guitogglephysical(n);
          closemodal();
          setTimeout(guiservicepanel, 120);
        });
      });
      m.querySelectorAll("[data-guidel]").forEach(function (b) {
        b.addEventListener("click", function () {
          var n = findnode(app.scene.objects, b.getAttribute("data-guidel"));
          if (n) deletenode(n);
          closemodal();
          setTimeout(guiservicepanel, 120);
        });
      });
      m.querySelectorAll("[data-guisel]").forEach(function (b) {
        b.addEventListener("click", function () {
          app.selid = b.getAttribute("data-guisel");
          app.selids = [app.selid];
          refreshall();
        });
      });
      var rig = m.querySelector("[data-guirig]");
      if (rig) rig.addEventListener("click", function () {
        guirig();
        closemodal();
        setTimeout(guiservicepanel, 120);
      });
    }
  });
}

function guiboot() {
  if (!app.scene) return;
  var list = guilist();
  var stray = [];
  walk(app.scene.objects, function (n) {
    if (guielement(n) && !guiparentof(n)) stray.push(n);
  });
  if (!list.length && !stray.length) return;
  var host = list.length ? list[0] : guiensure();
  stray.forEach(function (n) {
    var pl = parentlistof(n.id);
    if (!pl) return;
    pl.list.splice(pl.index, 1);
    host.children = host.children || [];
    host.children.push(n);
  });
}

function guitick() {
  var stage = qs("#stage");
  if (!stage) return;
  if (!stage.dataset.guibound) guibind();
}

document.addEventListener("change", function (ev) {
  var el = ev.target && ev.target.closest ? ev.target.closest("[data-guitoggle]") : null;
  if (!el) return;
  var n = findnode(app.scene.objects, el.getAttribute("data-guitoggle"));
  if (!n) return;
  n.physical = !!el.checked;
  if (n.physical) {
    if (!n.pos || (n.pos[0] === 0 && n.pos[1] === 0 && n.pos[2] === 0)) {
      n.pos = [Math.round(app.cam.target[0] * 10) / 10, 1.2, 0];
      n.rot = [0, 0, 0];
    }
  } else {
    n.pos = [0, 0, 0];
  }
  commit("gui physical");
  refreshall();
});

document.addEventListener("click", function (ev) {
  var el = ev.target && ev.target.closest ? ev.target.closest("[data-act='guiservice']") : null;
  if (!el) return;
  ev.preventDefault();
  ev.stopPropagation();
  guiservicepanel();
}, true);
