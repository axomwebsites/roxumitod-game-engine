var acts = {};

function boot() {
  gfxlibs();
  app = defaultapp();
  var sess = loadsession();
  if (sess && sess.backend) app.backend = sess.backend;
  var p = null;
  app.projects.forEach(function (pr) {
    if (sess && pr.id === sess.projectid) p = pr;
  });
  if (p) {
    app.project = deep(p);
    var sc = app.project.scenes[0];
    if (sess.sceneid) {
      app.project.scenes.forEach(function (s) {
        if (s.id === sess.sceneid) sc = s;
      });
    }
    app.sceneid = sc.id;
    app.scene = sc;
  } else {
    app.scene = app.project.scenes[0];
    app.sceneid = app.scene.id;
    saveprojects();
  }
  app.selid = null;
  app.opendocs = [{ kind: "scene" }, { kind: "settings" }, { kind: "assets" }];
  app.tab = "scene";
  app.expanded = {};
  app.collapsed = {};
  app.objsearch = "";
  app.filesearch = "";
  app.assetsearch = "";
  buildlauncherstart();
  if (typeof featboot === "function") featboot();
  document.addEventListener("click", onglobalclick);
  document.addEventListener("input", onglobalinput);
  document.addEventListener("change", onglobalinput);
  document.addEventListener("keydown", onkeydown);
  window.addEventListener("resize", function () {
    if (app.screen === "editor") {
      if (qs("#pagescene") && app.tab === "scene") resizestage();
    }
  });
}

function buildlauncherstart() {
  renderlauncher("projects");
}

function openeditor() {
  qs("#launcher").classList.add("hide");
  qs("#editor").classList.remove("hide");
  app.screen = "editor";
  if (!app.shellbuilt) buildshell();
  app.scene = activescene();
  if (typeof guiboot === "function") guiboot();
  if (typeof featboot === "function") featboot();
  gfx.ratio = Math.max(0.5, Math.min(3, (app.project.graphics && app.project.graphics.maxratio) || 1.5));
  app.snapbase = snapshot();
  app.undolist = [];
  app.redolist = [];
  refreshall();
  saveprojects();
  if (typeof autosavestart === "function") autosavestart();
  if (typeof dbginstall === "function") dbginstall();
}

function buildshell() {
  app.shellbuilt = true;
  var el = qs("#editor");
  el.innerHTML = '<header class="bar">' +
    '<button class="iconbtn home" data-act="gohome" title="Projects">' + ic("back") + "</button>" +
    '<nav class="menus">' + ["File", "Edit", "Window", "Tools", "Build", "Select", "Help"].map(function (m, i) {
      return '<button class="menubtn" data-menu="' + m.toLowerCase() + '">' + m + "</button>";
    }).join("") + "</nav>" +
    '<div class="bar-center"><button class="playbtn" id="playbtn" data-act="play" title="Play In Editor (PIE)"><span class="tri">' + ic("play", "ico-sm") + "</span>Play In Editor</button><button class=\"caretbtn\" data-act=\"playmenu\">" + ic("chevd", "ico-xs") + "</button></div>" +
    '<div class="bar-right"><span id="plugbar" class="hide"></span><span id="netbadge" class="netbadge" style="display:none"></span><div class="libpick"><span class="dot"></span><select id="libselect" title="3D library"><option value="three">three.js</option><option value="faoxomjs">faoxomjs</option></select>' + ic("chevd", "ico-xs") + "</div>" +
    '<button class="iconbtn" data-act="history" title="Version history">' + ic("share") + "</button>" +
    '<button class="settingsbtn" data-act="exportmenu" id="exportbtn">' + ic("export") + "Export</button>" +
    '<button class="iconbtn" data-act="undo" title="Undo">' + ic("undo") + "</button>" +
    '<button class="iconbtn" data-act="redo" title="Redo">' + ic("redo") + "</button>" +
    '<button class="settingsbtn" data-act="projectsettings">' + ic("gear") + "Project settings</button></div>" +
    "</header>" +
    '<div class="main">' +
    '<section class="dock left"><div class="tabs3" id="docktabs"></div><div class="dock-body" id="leftbody"></div><span class="panelresize left" data-resize="left"></span></section>' +
    '<section class="center"><div class="doctabs" id="doctabs"></div><div class="docs" id="docs"></div></section>' +
    '<section class="dock right"><div class="segtabs" id="righttabs"></div><div class="dock-body" id="rightbody"></div><span class="panelresize right" data-resize="right"></span></section>' +
    "</div>" +
    '<div id="modalroot"></div>';
  var sel = qs("#libselect");
  sel.value = app.backend;
  sel.addEventListener("change", function () {
    switchlibrary(sel.value);
  });
  qsa(".menubtn").forEach(function (b) {
    b.addEventListener("click", function (ev) {
      ev.stopPropagation();
      openmainmenu(b.getAttribute("data-menu"), b);
    });
  });
  binddockresize();
  if (typeof netaddcss === "function") netaddcss();
  if (typeof plugcss === "function") plugcss();
  if (typeof plugboot === "function") plugboot();
  if (typeof ppmount === "function") ppmount();
  if (typeof fxboot === "function") fxboot();
  if (typeof toolboot === "function") toolboot();
  if (typeof navbind === "function") navbind();
  updatebar();
}

function binddockresize() {
  qsa(".panelresize").forEach(function (grip) {
    grip.addEventListener("pointerdown", function (ev) {
      ev.preventDefault();
      var side = grip.getAttribute("data-resize");
      var main = qs(".main");
      var start = ev.clientX;
      var cols = getComputedStyle(main).gridTemplateColumns.split(" ").map(parseFloat);
      var startw = side === "left" ? cols[0] : cols[2];
      grip.setPointerCapture(ev.pointerId);
      function move(e2) {
        var d = (e2.clientX - start) * (side === "left" ? 1 : -1);
        var width = Math.max(210, Math.min(520, startw + d));
        if (side === "left") main.style.gridTemplateColumns = width + "px minmax(0,1fr) " + cols[2] + "px";
        else main.style.gridTemplateColumns = cols[0] + "px minmax(0,1fr) " + width + "px";
        if (app.tab === "scene") resizestage();
      }
      function up() {
        grip.removeEventListener("pointermove", move);
        grip.removeEventListener("pointerup", up);
        if (app.tab === "scene") resizestage();
      }
      grip.addEventListener("pointermove", move);
      grip.addEventListener("pointerup", up);
    });
  });
}

function updatebar() {
  var sel = qs("#libselect");
  if (sel) sel.value = app.backend;
  var pb = qs("#playbtn");
  if (pb && !app.play) pb.innerHTML = '<span class="tri">' + ic("play", "ico-sm") + "</span>Play In Editor";
}

function refreshall() {
  if (!app || app.screen !== "editor") return;
  renderdock();
  renderright();
  renderdoctabs();
  renderdocs();
  updatebar();
}

function refreshpickers() {
  if (!app || app.screen !== "editor") return;
  renderdock();
  renderright();
}

function activesceneobjects() {
  return app.scene.objects;
}

function renderdock() {
  var tabs = qs("#docktabs");
  if (!tabs) return;
  var defs = [
    { id: "objects", label: "Outliner", icon: "cube" },
    { id: "files", label: "Content", icon: "folder" },
    { id: "logic", label: "Blueprint", icon: "events" }
  ];
  tabs.innerHTML = defs.map(function (d) {
    return '<button class="tab3' + (app.dock === d.id ? " on" : "") + '" data-act="docktab" data-tab="' + d.id + '">' + ic(d.icon, "ico-sm") + d.label + "</button>";
  }).join("");
  var body = qs("#leftbody");
  if (app.dock === "objects") body.innerHTML = objectshtml();
  else if (app.dock === "files") body.innerHTML = fileshtml();
  else body.innerHTML = logichtml();
  binddock();
}

function binddock() {
  var search = qs("#objsearch");
  if (search) {
    search.addEventListener("input", function () {
      app.objsearch = search.value;
      var list = qs("#objlist");
      if (list) list.innerHTML = objectrowshtml(app.scene.objects, 0);
      bindobjdrag();
    });
  }
  var fsearch = qs("#filesearch");
  if (fsearch) {
    fsearch.addEventListener("input", function () {
      app.filesearch = fsearch.value;
      var grid = qs("#filegrid");
      if (grid) grid.outerHTML = '<div id="filegrid">' + filecardshtml() + "</div>";
    });
  }
  qsa('[data-ctx="file"]').forEach(function (el) {
    el.addEventListener("contextmenu", function (ev) {
      ev.preventDefault();
      openfilemenu(el.getAttribute("data-fid"), ev.clientX, ev.clientY);
    });
  });
  bindobjdrag();
}

function sceneicon(type, sprite) {
  if (type === "camera") return "camera";
  if (type === "sun") return "sun";
  if (type === "canvas") return "monitor";
  if (type === "label") return "text";
  if (type === "empty") return "empty";
  if (type === "terrain") return "hills";
  if (type === "water") return "water";
  if (type === "text3d") return "text";
  if (type === "curve") return "curve";
  if (type === "sprite") {
    if (sprite === "hero") return "human";
    if (sprite === "coin") return "coin";
    if (sprite === "heart") return "heart";
    if (sprite === "flag") return "flag";
    if (sprite === "slime") return "sphere";
    if (sprite === "tiles") return "grid";
    if (sprite === "nearhills" || sprite === "farhills") return "hills";
    if (sprite === "spikes") return "warning";
    return "sprite";
  }
  return nodemeta[type] ? nodemeta[type].icon : "cube";
}

function objectshtml() {
  var sc = app.scene;
  return '<div class="panelbar"><button class="scenepick" data-act="scenemenu">' + ic("cube", "ico-sm") + "<span>" + esc(sc.name) + '</span><span class="caret">' + ic("chevd", "ico-xs") + "</span></button><button class=\"btn primary right\" data-act=\"addobject\">" + ic("plus", "ico-sm") + "Add</button></div>" +
    '<div class="searchbox mb8">' + ic("search", "ico-sm") + '<input id="objsearch" placeholder="Search actors..." value="' + esc(app.objsearch) + '"></div>' +
    '<div class="objlist" id="objlist">' + objectrowshtml(sc.objects, 0) + "</div>";
}

function objectrowshtml(list, depth) {
  var q = (app.objsearch || "").toLowerCase();
  var html = "";
  for (var i = 0; i < list.length; i++) {
    var n = list[i];
    var childmatch = false;
    if (q && n.children) {
      walk(n.children, function (c) {
        if (c.name.toLowerCase().indexOf(q) >= 0) childmatch = true;
      });
    }
    if (q && n.name.toLowerCase().indexOf(q) < 0 && !childmatch) continue;
    var issel = app.selid === n.id;
    var isopen = app.expanded[n.id] !== false;
    var haskids = n.children && n.children.length;
    html += '<div class="objrow' + (issel ? " on" : "") + (n.lock ? " lockrow" : "") + '" data-act="selectnode" data-id="' + n.id + '" data-ctx="obj" draggable="true">' +
      '<span class="twist" data-act="togglenode" data-id="' + n.id + '">' + (haskids ? ic(isopen ? "chevd" : "chevr", "ico-xs") : "") + "</span>" +
      '<span class="typeico">' + ic(sceneicon(n.type, n.sprite), "ico-sm") + "</span>" +
      '<span class="name">' + esc(n.name) + "</span>" +
      (issel && n.type === "sprite" ? '<span class="editlink" data-act="editsprite" data-id="' + n.id + '">Edit &gt;</span>' : "") +
      '<button class="lockbtn' + (n.lock ? " on" : "") + '" data-act="togglelock" data-id="' + n.id + '" title="' + (n.lock ? "Unlock actor" : "Lock actor") + '">' + ic(n.lock ? "lock" : "unlock", "ico-sm") + "</button>" +
      '<button class="eye' + (n.visible === false ? " off" : "") + '" data-act="togglevisible" data-id="' + n.id + '" title="Visible">' + ic(n.visible === false ? "eyeoff" : "eye", "ico-sm") + "</button>" +
      '<button class="kebab" data-act="objmenu" data-id="' + n.id + '" title="More">' + ic("dots", "ico-sm") + "</button>" +
      "</div>";
    if (haskids && (isopen || q)) html += '<div class="objchildren">' + objectrowshtml(n.children, depth + 1) + "</div>";
  }
  return html;
}

function fileshtml() {
  var filters = [{ id: "all", label: "All" }, { id: "prefabs", label: "Prefabs" }, { id: "models", label: "Models" }, { id: "images", label: "Images" }, { id: "sounds", label: "Sounds" }];
  var html = '<div class="segrow mb8" style="flex-wrap:wrap">' + filters.map(function (f) {
    return '<button class="segbtn' + (app.filesfilter === f.id ? " on" : "") + '" data-act="filesfilter" data-filter="' + f.id + '">' + f.label + "</button>";
  }).join("") + "</div>";
  html += '<div class="row mb8"><button class="btn" data-act="importfiles">' + ic("import", "ico-sm") + 'Import</button><button class="btn" data-act="newasset">' + ic("plus", "ico-sm") + 'New</button><button class="btn" data-act="assetsopen">' + ic("cube", "ico-sm") + 'Assets</button><button class="btn" data-act="soundsopen">' + ic("sound", "ico-sm") + "Sounds</button></div>";
  html += '<div class="row mb6"><div class="searchbox grow">' + ic("search", "ico-sm") + '<input id="filesearch" placeholder="Search assets..." value="' + esc(app.filesearch) + '"></div><button class="iconbtn' + (app.filesview === "grid" ? " on" : "") + '" data-act="filesgrid">' + ic("grid", "ico-sm") + '</button><button class="iconbtn' + (app.filesview === "list" ? " on" : "") + '" data-act="fileslist">' + ic("list", "ico-sm") + '</button><button class="iconbtn" data-act="newfolder">' + ic("folderplus", "ico-sm") + "</button></div>";
  html += sechead2("folder", "Content", "filescontent");
  if (!(app.closedsecs && app.closedsecs.filescontent)) html += '<div id="filegrid">' + filecardshtml() + "</div>";
  return html;
}

var arturlcache = {};

function arturln(name) {
  if (!arturlcache[name]) arturlcache[name] = artmake(name).toDataURL("image/png");
  return arturlcache[name];
}

function filelist() {
  var out = [];
  var prefabs = [
    { name: "Hero prefab", sprite: "hero" },
    { name: "Slime prefab", sprite: "slime" },
    { name: "Coin prefab", sprite: "coin" },
    { name: "Spikes prefab", sprite: "spikes" },
    { name: "Platform prefab", sprite: "tiles" },
    { name: "Flag prefab", sprite: "flag" }
  ];
  prefabs.forEach(function (p, i) {
    out.push({ fid: "pfb:" + p.sprite, name: p.name, kind: "prefab", url: arturln(p.sprite), sprite: p.sprite, size: fmtkb(databytes(arturln(p.sprite))) });
  });
  var models = [
    { name: "Ground block", color: "#c8794a" },
    { name: "Stone block", color: "#8e95a0" },
    { name: "Crate", color: "#a9713f" },
    { name: "Column", color: "#c8ccd4" },
    { name: "Tree", color: "#3f9c3a" },
    { name: "Water", color: "#4fb6e8" }
  ];
  models.forEach(function (m) {
    out.push({ fid: "mdl:" + m.name, name: m.name, kind: "model", size: "1.2 KB" });
  });
  imageassets.forEach(function (a) {
    var url = arturln(a.sprite);
    out.push({ fid: "img:" + a.id, name: a.name, kind: "image", url: url, bytes: databytes(url), sprite: a.sprite });
  });
  (app.project.assets || []).forEach(function (a) {
    if (a.type === "image") out.push({ fid: "cus:" + a.id, name: a.name, kind: "image", url: a.data, bytes: databytes(a.data), sprite: "custom:" + a.id, custom: true });
  });
  soundassets.forEach(function (s) {
    out.push({ fid: "snd:" + s.id, name: s.name, kind: "sound", size: s.size, freq: s.freq });
  });
  (app.project.assets || []).forEach(function (a) {
    if (a.type !== "image") out.push({ fid: "cus:" + a.id, name: a.name, kind: a.type || "file", size: a.size || "1.0 KB" });
  });
  [["mat", "material"], ["shader", "shader"], ["anim", "animator"], ["timeline", "timeline"], ["loc", "localization"], ["services", "services"], ["table", "table"], ["sheet", "sheet"]].forEach(function (p) {
    var store = typeof assetkeyof === "function" ? app.project[assetkeyof(p[0])] || [] : [];
    store.forEach(function (a) {
      out.push({ fid: "ass:" + p[0] + ":" + a.id, name: a.name, kind: p[1], size: "asset" });
    });
  });
  var q = (app.filesearch || "").toLowerCase();
  if (q) out = out.filter(function (f) {
    return f.name.toLowerCase().indexOf(q) >= 0;
  });
  if (app.filesfilter === "images") out = out.filter(function (f) {
    return f.kind === "image";
  });
  if (app.filesfilter === "sounds") out = out.filter(function (f) {
    return f.kind === "sound";
  });
  if (app.filesfilter === "prefabs") out = out.filter(function (f) {
    return f.kind === "prefab";
  });
  if (app.filesfilter === "models") out = out.filter(function (f) {
    return f.kind === "model";
  });
  return out;
}

function filecardshtml() {
  var items = filelist();
  if (!items.length) return '<div class="emptystate">No files match this filter.</div>';
  if (app.filesview === "list") {
    return items.map(function (f) {
      return '<div class="listrow" data-act="fileopen" data-fid="' + esc(f.fid) + '" data-ctx="file">' + (f.url ? '<img src="' + f.url + '" style="width:16px;height:16px;object-fit:contain;image-rendering:pixelated">' : ic(f.kind === "sound" ? "sound" : f.kind === "prefab" ? "component" : f.kind === "model" ? "cube" : "file", "ico-sm")) + '<span class="grow nowrap">' + esc(f.name) + "</span><span class=\"tiny dim\">" + esc(f.size || fmtkb(f.bytes)) + "</span></div>";
    }).join("");
  }
  return '<div class="filegrid">' + items.map(function (f) {
    return '<button class="filecard" data-act="fileopen" data-fid="' + esc(f.fid) + '" data-ctx="file">' +
      '<span class="filethumb">' + (f.url ? '<img src="' + f.url + '" alt="">' : '<span class="snd">' + ic(f.kind === "sound" ? "sound" : f.kind === "prefab" ? "component" : f.kind === "model" ? "cube" : "file") + "</span>") + "</span>" +
      '<span class="filename">' + esc(f.name) + "</span>" +
      '<span class="filesize">' + esc(f.size || fmtkb(f.bytes)) + "</span></button>";
  }).join("") + "</div>";
}

function logichtml() {
  var sel = app.scene.eventsheet || "Main events";
  var sheets = app.project.eventsheets;
  var html = '<div class="helpbanner" data-act="logichelp">' + ic("help", "ico-sm") + '<span class="grow">How event sheets work -</span></div>';
  html += '<div class="fieldlabel">This scene runs</div>';
  html += '<button class="dropbtn" data-act="sheetmenu"><span id="thisname">' + esc(sel) + '</span><span class="caret">' + ic("chevd", "ico-xs") + "</span></button>";
  html += sechead2("events", "Event sheets", "blueprintevents", '<button class="btn sm" data-act="newsheet">' + ic("plus", "ico-xs") + "New</button>");
  if (!(app.closedsecs && app.closedsecs.blueprintevents)) sheets.forEach(function (sh) {
    html += '<div class="sheetrow" data-act="openevent" data-id="' + sh.id + '">' + ic("events", "ico-sm") + '<span class="grow"><div class="t">' + esc(sh.name) + '</div><div class="s">' + plural(sh.count || 0, "event") + " · used by " + (sh.scene ? scenename(sh.scene) : "Loading") + '</div></span><span class="kebab" data-act="sheetkebab" data-id="' + sh.id + '">' + ic("dots", "ico-sm") + "</span></div>";
  });
  html += sechead2("code", "Code scripts", "blueprintscripts", '<button class="btn sm" data-act="newscript">' + ic("plus", "ico-xs") + "New</button>");
  if (!(app.closedsecs && app.closedsecs.blueprintscripts)) {
    if (!app.project.scripts.length) html += '<div class="tiny dim">No code scripts yet.</div>';
    app.project.scripts.forEach(function (s) {
      html += '<div class="sheetrow" data-act="openscript" data-id="' + s.id + '">' + ic(s.kind === "Library" ? "layers" : s.kind === "Scene script" ? "script" : "code", "ico-sm") + '<span class="grow"><div class="t">' + esc(s.name) + '</div><div class="s">' + esc(s.kind) + '</div></span><span class="kebab" data-act="scriptkebab" data-id="' + s.id + '">' + ic("dots", "ico-sm") + "</span></div>";
    });
  }
  return html;
}

function scenename(id) {
  var out = "";
  app.project.scenes.forEach(function (s) {
    if (s.id === id) out = s.name;
  });
  return out;
}

function bindobjdrag() {
  var rows = qsa('.objrow[draggable="true"]');
  rows.forEach(function (row) {
    row.addEventListener("dragstart", function (ev) {
      app.dragnode = row.getAttribute("data-id");
      ev.dataTransfer.effectAllowed = "move";
      try {
        ev.dataTransfer.setData("text/plain", row.getAttribute("data-id"));
      } catch (e) {}
    });
    row.addEventListener("dragover", function (ev) {
      ev.preventDefault();
      row.classList.add("dropin");
    });
    row.addEventListener("dragleave", function () {
      row.classList.remove("dropin");
    });
    row.addEventListener("drop", function (ev) {
      ev.preventDefault();
      row.classList.remove("dropin");
      var srcid = app.dragnode;
      var targetid = row.getAttribute("data-id");
      if (!srcid || srcid === targetid) return;
      var src = findnode(app.scene.objects, srcid);
      var tgt = findnode(app.scene.objects, targetid);
      if (!src || !tgt) return;
      reparentnode(src, tgt);
      app.expanded[tgt.id] = true;
    });
    row.addEventListener("contextmenu", function (ev) {
      ev.preventDefault();
      app.selid = row.getAttribute("data-id");
      refreshpickers();
      openobjectmenu(app.selid, ev.clientX, ev.clientY);
    });
  });
  var list = qs("#objlist");
  if (list) {
    list.addEventListener("dragover", function (ev) {
      ev.preventDefault();
    });
    list.addEventListener("drop", function (ev) {
      if (ev.target.closest(".objrow")) return;
      var srcid = app.dragnode;
      var src = findnode(app.scene.objects, srcid);
      if (!src) return;
      reparentnode(src, null);
    });
  }
}

function switchlibrary(name) {
  app.backend = name;
  gfx.backend = name;
  gfxlibs();
  var label = name === "faoxomjs" ? "faoxomjs 0.2.0" : "three.js r149";
  if (name === "faoxomjs" && !window.FaoxomJs) {
    toast("faoxomjs could not load, staying on three.js", "err");
    app.backend = "three";
    qs("#libselect").value = "three";
    return;
  }
  if (view.canvas) {
    var nc = document.createElement("canvas");
    nc.id = "maincanvas";
    view.canvas.parentElement.replaceChild(nc, view.canvas);
    view.canvas = nc;
    var pc = document.createElement("canvas");
    pc.id = "previewcanvas";
    view.previewcanvas.parentElement.replaceChild(pc, view.previewcanvas);
    view.previewcanvas = pc;
    view.main = makeview(view.canvas);
    view.preview = makeview(view.previewcanvas);
    resizestage();
  }
  savesession();
  toast("Rendering with " + label, "ok");
}

function gohome() {
  if (app.play) stopplay();
  qs("#editor").classList.add("hide");
  var l = qs("#launcher");
  l.classList.remove("hide");
  app.screen = "launcher";
  renderlauncher("projects");
}

function onglobalclick(ev) {
  var el = ev.target.closest("[data-act]");
  if (!el) return;
  var name = el.getAttribute("data-act");
  if (!name) return;
  var fn = acts[name];
  if (!fn && name.indexOf(":") > 0) {
    var base = name.split(":")[0];
    if (typeof acts[base] === "function") {
      ev.preventDefault();
      ev.stopPropagation();
      acts[base](name.slice(base.length + 1), ev);
      return;
    }
  }
  if (fn) {
    ev.preventDefault();
    ev.stopPropagation();
    fn(el, ev);
  }
}

var editingfield = null;

function onglobalinput(ev) {
  var el = ev.target;
  if (el.hasAttribute && el.hasAttribute("data-node") && el.hasAttribute("data-field")) {
    var node = findnode(app.scene.objects, el.getAttribute("data-node"));
    if (!node) return;
    applynodefield(node, el.getAttribute("data-field"), el, false);
  } else if (el.hasAttribute && el.hasAttribute("data-cfield")) {
    var n2 = el.getAttribute("data-node") ? findnode(app.scene.objects, el.getAttribute("data-node")) : selected();
    if (!n2) return;
    var path = el.getAttribute("data-cfield").split(".");
    n2.compdata = n2.compdata || {};
    n2.compdata[path[0]] = n2.compdata[path[0]] || {};
    var v = el.type === "checkbox" ? el.checked : el.type === "number" || el.type === "range" ? parseFloat(el.value) : el.value;
    n2.compdata[path[0]][path[1]] = v;
    touch();
  } else if (el.hasAttribute && el.hasAttribute("data-vfield")) {
    var n3 = findnode(app.scene.objects, el.getAttribute("data-node"));
    var idx = +el.getAttribute("data-vfield");
    if (n3 && n3.vars[idx]) {
      n3.vars[idx][el.getAttribute("data-vkey") || "value"] = el.type === "number" ? parseFloat(el.value) : el.value;
      touch();
    }
  } else if (el.hasAttribute && el.hasAttribute("data-sfield")) {
    setpath(app.scene, el.getAttribute("data-sfield"), el);
  } else if (el.hasAttribute && el.hasAttribute("data-pfield")) {
    setpath(app.project, el.getAttribute("data-pfield"), el);
  } else if (el.hasAttribute && el.hasAttribute("data-gfield")) {
    var gi = +el.getAttribute("data-gindex");
    if (app.project.globals[gi]) {
      var key = el.getAttribute("data-gfield");
      app.project.globals[gi][key] = key === "value" ? (el.type === "number" ? parseFloat(el.value) : el.value) : el.value;
      touch();
    }
  }
  if (el.type === "range") {
    var sib = el.parentElement.querySelector('input[type="number"]');
    if (sib) sib.value = el.value;
  } else if (el.type === "number") {
    var sib2 = el.parentElement.querySelector('input[type="range"]');
    if (sib2) sib2.value = el.value;
  }
}

function setpath(obj, path, el) {
  var parts = path.split(".");
  var cur = obj;
  for (var i = 0; i < parts.length - 1; i++) {
    cur[parts[i]] = cur[parts[i]] || {};
    cur = cur[parts[i]];
  }
  var last = parts[parts.length - 1];
  var val = el.type === "checkbox" ? el.checked : el.type === "number" || el.type === "range" ? parseFloat(el.value) : el.value;
  cur[last] = val;
  touch();
}

function touch() {
  app.dirty = true;
  saveprojects();
}

function applynodefield(node, field, el, rerender) {
  var val = el.type === "checkbox" ? el.checked : el.value;
  if (field === "name") {
    node.name = val || node.name;
    renderdock();
    renderdoctabs();
  } else if (/^(pos|rot|scl)\.\d$/.test(field)) {
    var p = field.split(".");
    node[p[0]][+p[1]] = parseFloat(val) || 0;
  } else if (field === "color") {
    node.color = val;
    var sib = el.parentElement.querySelector(".swatch");
    if (sib && el.type === "color") sib.style.background = val;
    var twin = el.parentElement.querySelector('input[type="color"]');
    if (twin && el.type !== "color") twin.value = val;
  } else if (field === "opacity") {
    node.opacity = Math.max(0, Math.min(1, parseFloat(val)));
  } else if (field === "ppm") {
    node.ppm = Math.max(1, parseFloat(val) || 64);
  } else if (field === "text") {
    node.text = val;
  } else if (field === "visible" || field === "active" || field === "lock" || field === "flipx" || field === "flipy" || field === "facecamera") {
    node[field] = el.type === "checkbox" ? el.checked : val === "true" || val === "Yes";
  } else if (field === "parent") {
  }
  touch();
  if (field === "name") view.lastnamesel = true;
}

function onkeydown(ev) {
  if (app.screen !== "editor") return;
  if (app.play) {
    if (ev.key === "Escape") stopplay();
    return;
  }
  var tag = (ev.target.tagName || "").toLowerCase();
  var typing = tag === "input" || tag === "textarea" || tag === "select" || ev.target.isContentEditable;
  if (ev.key === "Escape") {
    if (qs("#spriteed")) {
      qs("#spriteed").remove();
      spstate = null;
      return;
    }
    if (closestmodal()) {
      closemodal();
      return;
    }
    if (app.play) stopplay();
    closemenu();
    return;
  }
  if (qs("#spriteed") || closestmodal()) return;
  if (typing) return;
  if (typeof plugkey === "function" && plugkey(ev)) {
    ev.preventDefault();
    return;
  }
  if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "z") {
    ev.preventDefault();
    if (ev.shiftKey) redostep();
    else undostep();
    return;
  }
  if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "y") {
    ev.preventDefault();
    redostep();
    return;
  }
  if ((ev.ctrlKey || ev.metaKey) && ev.shiftKey && ev.key.toLowerCase() === "f") {
    ev.preventDefault();
    if (typeof feathub === "function") feathub();
    return;
  }
  if ((ev.ctrlKey || ev.metaKey) && ev.shiftKey && ev.key.toLowerCase() === "p") {
    ev.preventDefault();
    if (typeof cmdpanel === "function") cmdpanel();
    return;
  }
  if ((ev.ctrlKey || ev.metaKey) && !ev.shiftKey && ev.key.toLowerCase() === "k") {
    ev.preventDefault();
    if (typeof cmdpanel === "function") cmdpanel();
    return;
  }
  if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "s") {
    ev.preventDefault();
    saveprojects();
    toast("Project saved", "ok");
    return;
  }
  if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "d") {
    ev.preventDefault();
    var n = selected();
    if (n) duplicatenode(n);
    return;
  }
  if (ev.key === "Delete" || ev.key === "Backspace") {
    var sn = selected();
    if (sn) {
      ev.preventDefault();
      deletenode(sn);
    }
    return;
  }
  if (ev.key === "f" || ev.key === "F") focusselected();
  if (ev.key === "w" || ev.key === "W") settool("move");
  if (ev.key === "e" || ev.key === "E") settool("rotate");
  if (ev.key === "r" || ev.key === "R") settool("scale");
  if (ev.key === "g" || ev.key === "G") {
    app.showgrid = !app.showgrid;
    toast("Grid " + (app.showgrid ? "on" : "off"));
  }
  if (ev.key === " ") {
    ev.preventDefault();
    if (app.play) stopplay();
    else startplay();
  }
  if (ev.key === "F2") {
    var sn2 = selected();
    if (sn2) promptbox("Rename object", sn2.name, function (v) {
      sn2.name = v;
      commit("rename");
    });
  }
}

function settool(mode) {
  app.transformmode = mode;
  renderdock();
}

function openobjectmenu(id, x, y) {
  var node = findnode(app.scene.objects, id);
  if (!node) return;
  var items = [
    { head: node.name },
    { label: "Rename", icon: "pen", act: "objrename" },
    { label: "Duplicate", icon: "duplicate", act: "objduplicate", key: "Ctrl+D" },
    { label: "Copy", icon: "copy", act: "objcopy" },
    { label: "Paste", icon: "file", act: "objpaste" },
    { sep: true },
    { label: "Add child object…", icon: "plus", act: "objaddchild" },
    { label: "Detach from parent", icon: "undo", act: "objdetach" },
    { label: "Move up", icon: "arrowup", act: "objmoveup" },
    { label: "Move down", icon: "arrowdown", act: "objmovedown" },
    { sep: true },
    { label: "Focus", icon: "target", act: "objfocus", key: "F" },
    { label: node.visible === false ? "Show" : "Hide", icon: node.visible === false ? "eye" : "eyeoff", act: "objvisibility" },
    { sep: true },
    { label: "Delete", icon: "trash", act: "objdelete", key: "Del" }
  ];
  openmenu(items, x, y, {
    onact: function (name) {
      var n = selected();
      if (!n) return;
      if (name === "objrename") promptbox("Rename object", n.name, function (v) {
        n.name = v;
        commit("rename");
      });
      else if (name === "objduplicate") duplicatenode(n);
      else if (name === "objcopy") {
        app.clipboard = JSON.stringify(n);
        toast("Copied " + n.name);
      } else if (name === "objpaste") {
        if (!app.clipboard) return;
        var copy = clonenode(JSON.parse(app.clipboard));
        copy.name = uniqueid(app.scene.objects, copy.name);
        var pl = parentlistof(n.id);
        if (pl) pl.list.splice(pl.index + 1, 0, copy);
        else app.scene.objects.push(copy);
        app.selid = copy.id;
        commit("paste");
      } else if (name === "objaddchild") {
        openaddobject(copy => {
          if (copy) {
            copy.pos = [0, 0.6, 0];
            (n.children = n.children || []).push(copy);
            app.expanded[n.id] = true;
            app.selid = copy.id;
            commit("addchild");
          }
        });
      } else if (name === "objdetach") reparentnode(n, null);
      else if (name === "objmoveup" || name === "objmovedown") {
        var pl2 = parentlistof(n.id);
        if (!pl2) return;
        var ni = pl2.index + (name === "objmoveup" ? -1 : 1);
        if (ni < 0 || ni >= pl2.list.length) return;
        pl2.list.splice(pl2.index, 1);
        pl2.list.splice(ni, 0, n);
        commit("reorder");
      } else if (name === "objfocus") focusselected();
      else if (name === "objvisibility") {
        n.visible = n.visible === false;
        commit("visibility");
      } else if (name === "objdelete") deletenode(n);
    }
  });
}

function openmainmenu(which, btn) {
  var r = btn.getBoundingClientRect();
  var x = r.left;
  var y = r.bottom + 4;
  var defs = {
    file: [
      { label: "New level", icon: "plus", act: "newprojectmenu" },
      { label: "Open level…", icon: "folder", act: "gohome" },
      { sep: true },
      { label: "Save current level", icon: "save", act: "saveproject", key: "Ctrl+S" },
      { label: "Save as…", icon: "download", act: "saveas" },
      { sep: true },
      { label: "Import level…", icon: "upload", act: "importproject" },
      { label: "Package game (HTML)", icon: "export", act: "exporthtml" },
      { label: "Package for itch.io", icon: "globe", act: "exportitch" },
      { label: "Package Android (APK)", icon: "services", act: "exportapk" },
      { label: "Backup level (.ugm)", icon: "save", act: "exportbackup" },
      { label: "Export as folder (.zip)", icon: "folder", act: "exportfolder" },
      { sep: true },
      { label: "GitHub import…", icon: "upload", act: "githubimport" },
      { label: "GitHub sync…", icon: "refresh", act: "githubsync" },
      { sep: true },
      { label: "Close level", icon: "x", act: "gohome" }
    ],
    edit: [
      { label: "Undo", icon: "undo", act: "undo", key: "Ctrl+Z" },
      { label: "Redo", icon: "redo", act: "redo", key: "Ctrl+Shift+Z" },
      { sep: true },
      { label: "Duplicate actor", icon: "duplicate", act: "objduplicate", key: "Ctrl+D" },
      { label: "Delete actor", icon: "trash", act: "objdelete", key: "Del" },
      { label: "Rename actor", icon: "pen", act: "objrename", key: "F2" },
      { sep: true },
      { label: "Project settings", icon: "gear", act: "projectsettings" }
    ],
    window: [
      { label: "World Outliner", icon: "cube", act: "showoutliner" },
      { label: "Content Browser", icon: "folder", act: "showcontent" },
      { label: "Blueprint Editor", icon: "events", act: "showblueprint" },
      { label: "Details", icon: "sliders", act: "showdetails" },
      { label: "World Settings", icon: "sun", act: "showsettings" },
      { sep: true },
      { head: "Tools" },
      { label: "Rendering - Lumen, Nanite, VSM", icon: "settings", act: "ue5panel:rendering" },
      { label: "World Partition", icon: "grid", act: "ue5panel:world" },
      { label: "Sequencer", icon: "film", act: "ue5panel:sequencer" },
      { label: "Niagara", icon: "sparkle", act: "ue5panel:niagara" },
      { label: "MetaSounds", icon: "music", act: "ue5panel:sound" },
      { label: "Chaos - Physics & Destruction", icon: "box", act: "ue5panel:chaos" },
      { label: "Control Rig", icon: "target", act: "ue5panel:rig" },
      { label: "Online Subsystem - Multiplayer", icon: "globe", act: "ue5panel:net" },
      { sep: true },
      { label: "Engine stats", icon: "table", act: "ue5panel:stats" },
      { label: "Event debugger", icon: "events", act: "dbgtoggle", key: "Ctrl+Shift+D" },
      { label: "Audio mixer", icon: "sliders", act: "mixer" },
      { sep: true },
      { label: "Feature hub", icon: "grid", act: "feat", key: "Ctrl+Shift+F" },
      { label: "Command bar", icon: "search", act: "cmdbar", key: "Ctrl+Shift+P" }
    ],
    tools: [
      { label: "Add actor…", icon: "plus", act: "addobject" },
      { label: "Add tilemap", icon: "grid", act: "addtilemap" },
      { label: "Import 3D model…", icon: "import", act: "importmodel" },
      { label: "Add model…", icon: "cube", act: "modellib" },
      { label: "Content library", icon: "grid", act: "openlibrary" },
      { label: "Add component…", icon: "component", act: "addcomponent" },
      { label: "Navmesh…", icon: "target", act: "navmesh" },
      { sep: true },
      { label: "Fracture selected actor", icon: "layers", act: "fracture" },
      { label: "Control Rig - IK", icon: "target", act: "ue5panel:rig" },
      { label: "MetaSounds", icon: "music", act: "uesound" },
      { sep: true },
      { label: "Plugins…", icon: "layers", act: "plugins" },
      { label: "Plugin API reference", icon: "book", act: "plugdocs" },
      { sep: true },
      { label: "Lock all actors", icon: "lock", act: "lockall" },
      { label: "Unlock all actors", icon: "unlock", act: "unlockall" },
      { sep: true },
      { sep: true },
      { label: "GUI service - ScreenGui", icon: "layers", act: "guiservice", key: "" },
      { label: "Sky atmosphere, fog & post process", icon: "sun", act: "panel:sky" },
      { label: "Landscape & foliage mode", icon: "hills", act: "panel:land" },
      { label: "PCG - procedural content", icon: "sparkle", act: "panel:pcg" },
      { label: "Data layers, prefabs & LOD", icon: "layers", act: "panel:layer" },
      { label: "Cinematics - cine camera & render queue", icon: "film", act: "panel:cine" },
      { label: "Controls & shortcuts", icon: "keyboard", act: "panel:keys" },
      { sep: true },
      { label: "Feature hub", icon: "grid", act: "feat" },
      { label: "Command bar", icon: "search", act: "cmdbar" },
      { sep: true },
      { label: "Focus selection", icon: "target", act: "objfocus", key: "F" },
      { label: "Marquee select", icon: "marquee", act: "toolmarquee" }
    ],
    build: [
      { label: app.play ? "Stop Play In Editor" : "Play In Editor (PIE)", icon: app.play ? "stop" : "play", act: "play", key: "Space" },
      { label: "Restart PIE", icon: "redo", act: "restartplay" },
      { label: "Play in new window", icon: "maximize", act: "playwindow" },
      { label: "Play resolution…", icon: "monitor", act: "playresmenu" },
      { sep: true },
      { label: "Host multiplayer session…", icon: "globe", act: "startnet" },
      { label: "Package game (HTML)", icon: "export", act: "exporthtml" },
      { label: "Package for itch.io", icon: "globe", act: "exportitch" },
      { sep: true },
      { label: "Build lighting (preview)", icon: "sun", act: "ue5panel:rendering" }
    ],
    select: [
      { label: "Focus selection", icon: "target", act: "objfocus", key: "F" },
      { label: "Select parent", icon: "up", act: "objparent" },
      { sep: true },
      { label: "Show colliders", icon: "collider", act: "togglecolliders" },
      { label: "Show navmesh", icon: "target", act: "togglenavoverlay" },
      { label: "Toggle grid", icon: "grid", act: "togglegrid", key: "G" },
      { sep: true },
      { label: "Reset camera", icon: "camera", act: "resetcamera" },
      { label: "2D / orthographic view", icon: "camera2d", act: "toggleortho" },
      { label: "Perspective", icon: "cubeoutline", act: "viewpersp" },
      { label: "Top", icon: "grid", act: "viewtop" },
      { label: "Front", icon: "plane", act: "viewfront" },
      { label: "Side", icon: "layers", act: "viewside" }
    ],
    help: [
      { label: "Documentation", icon: "book", act: "ue5docs" },
      { label: "Keyboard shortcuts", icon: "key", act: "shortcuts" },
      { label: "Engine stats", icon: "table", act: "ue5panel:stats" },
      { sep: true },
      { label: "About Roxumitod Game Engine", icon: "info", act: "about" }
    ]
  };
  var items = (defs[which] || []).slice(0);
  if (typeof plugmenuitems === "function") {
    var extra = plugmenuitems(which);
    if (extra.length) {
      items.push({ sep: true });
      items.push({ head: "Plugins" });
      extra.forEach(function (it) {
        items.push(it);
      });
    }
  }
  openmenu(items, x, y);
}
