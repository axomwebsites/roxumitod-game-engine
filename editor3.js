acts.launchview = function (el) {
  renderlauncher(el.getAttribute("data-view"));
};
acts.newproject = function (el) {
  createnewproject(el.getAttribute("data-tpl"));
};
acts.openproject = function (el) {
  openprojectbyid(el.getAttribute("data-id"));
};
acts.deleteproject = function (el) {
  var id = el.getAttribute("data-id");
  confirmbox("Delete project", "This removes the project from this browser. Exported copies are not affected.", function () {
    app.projects = app.projects.filter(function (p) {
      return p.id !== id;
    });
    saveprojects();
    renderlauncher("projects");
    toast("Project deleted", "ok");
  });
};
acts.installapp = function () {
  toast("Install: use your browser menu → Install app", "ok");
};
acts.launcherhelp = function () {
  shortcutsmodal();
};
acts.learnfirst = function () {
  openmodal({
    title: "Your first game",
    icon: "playcircle",
    width: "wide",
    body: '<div style="font-size:12.5px;line-height:1.8;color:var(--text-2)"><b>1.</b> Open Templates and pick <b>2D Platform</b>.<br><b>2.</b> Select the <b>Player</b> object in the Objects list.<br><b>3.</b> Use the gizmo to move it above a platform.<br><b>4.</b> Press <span class="kbd">Space</span> to play, arrows to move, space to jump.<br><b>5.</b> Drag a coin onto the player to parent it, then press play again.</div>',
    footer: '<button class="btn primary" data-act="closedocmodal">Got it</button>'
  });
};
acts.learnscore = function () {
  openmodal({
    title: "Keep score and win",
    icon: "star",
    width: "wide",
    body: '<div style="font-size:12.5px;line-height:1.8;color:var(--text-2)">Coins carry the tag <span class="kbd">coin</span>. The <b>Canvas</b> holds <b>ScoreText</b> and <b>LivesBar</b> labels. Open <b>Logic</b> → <b>GameScript</b> and edit <b>score</b>, then watch the HUD update while playing. Reach the flag tagged <span class="kbd">goal</span> to win.</div>',
    footer: '<button class="btn primary" data-act="closedocmodal">Got it</button>'
  });
};
acts.learndocs = function () {
  openmodal({
    title: "Documentation",
    icon: "book",
    width: "wide",
    body: '<div style="font-size:12.5px;line-height:1.8;color:var(--text-2)"><b>Objects</b> live in scenes and can be nested by dragging them in the list.<br><b>Components</b> (sprite, collider, physics, light, sound, text, UI) are added from the inspector.<br><b>Event sheets</b> run the scene each frame; <b>code scripts</b> can override behavior.<br><b>Play</b> runs the game inside the viewport, or choose a resolution from the Play menu.</div>',
    footer: '<button class="btn primary" data-act="closedocmodal">Close</button>'
  });
};
acts.closedocmodal = function () {
  closemodal();
};
acts.gohome = function () {
  gohome();
};
acts.play = function () {
  toggleplay();
};
acts.stopplay = function () {
  stopplay();
};
acts.restartplay = function () {
  restartplay();
};
acts.playmenu = function (el) {
  var r = el.getBoundingClientRect();
  var items = [
    { label: app.play ? "Stop Play In Editor" : "Play In Editor (PIE)", icon: app.play ? "stop" : "play", act: "play", key: "Space" },
    { label: "Restart PIE", icon: "redo", act: "restartplay" },
    { sep: true },
    { label: "Preview resolution…", icon: "monitor", act: "playresmenu" },
    { label: (app.touch ? "Hide" : "Show") + " touch controls", icon: "hand", act: "toggletouch" },
    { sep: true },
    { label: "Host multiplayer session…", icon: "globe", act: "startnet" },
    { label: "Launch standalone game", icon: "maximize", act: "playwindow" }
  ];
  openmenu(items, r.left - 120, r.bottom + 6);
};
acts.playresmenu = function () {
  playresolutionmodal();
};
acts.playwindow = function () {
  var w = window.open("", "_blank");
  if (!w) {
    toast("Allow pop-ups to open the game in a new window", "warn");
    return;
  }
  w.document.write(buildgame());
  w.document.close();
};
acts.undo = function () {
  undostep();
};
acts.redo = function () {
  redostep();
};
acts.history = function () {
  historymodal();
};
acts.saveproject = function () {
  saveprojects();
  toast("Project saved", "ok");
};
acts.saveas = function () {
  promptbox("Save project as", app.project.name, function (v) {
    app.project.name = v;
    app.project.updated = Date.now();
    saveprojects();
    refreshall();
    toast("Saved as " + v, "ok");
  });
};
acts.newprojectmenu = function () {
  gohome();
  renderlauncher("templates");
};
acts.exportproject = function () {
  exportproject();
};
acts.importproject = function () {
  importproject();
};
acts.projectsettings = function () {
  opendoc("settings");
};
acts.scenesettings = function () {
  app.right = "scene";
  renderright();
};
acts.scenemenu = function (el) {
  openscenemenu(el);
};
acts.sheetmenu = function (el) {
  opensheetmenu(el);
};
acts.markstart = function () {
  markstart();
};
acts.docktab = function (el) {
  app.dock = el.getAttribute("data-tab");
  renderdock();
};
acts.righttab = function (el) {
  app.right = el.getAttribute("data-tab");
  renderright();
};
acts.tab = function (el) {
  app.tab = el.getAttribute("data-key");
  renderdoctabs();
  renderdocs(true);
};
acts.closetab = function (el) {
  var key = el.getAttribute("data-key");
  app.opendocs = app.opendocs.filter(function (d) {
    return dockey(d) !== key;
  });
  var pageid = "page" + key.replace(/[^a-z0-9]/gi, "");
  var page = qs("#" + pageid);
  if (page) page.remove();
  if (app.tab === key) app.tab = "scene";
  refreshall();
};
acts.selectnode = function (el) {
  app.selid = el.getAttribute("data-id");
  refreshpickers();
};
acts.togglenode = function (el) {
  var id = el.getAttribute("data-id");
  app.expanded[id] = app.expanded[id] === false;
  renderdock();
};
acts.togglevisible = function (el) {
  var n = findnode(app.scene.objects, el.getAttribute("data-id"));
  if (!n) return;
  n.visible = n.visible === false;
  commit("visibility");
};
acts.togglelock = function (el) {
  var id = el && el.getAttribute ? el.getAttribute("data-id") : null;
  var n = id ? findnode(app.scene.objects, id) : selected();
  if (!n) return;
  n.lock = !n.lock;
  commit("lock");
  refreshall();
  toast((n.lock ? "Locked " : "Unlocked ") + n.name, n.lock ? "warn" : "ok");
};
acts.lockall = function () {
  walk(app.scene.objects, function (n) {
    n.lock = true;
  });
  commit("lock");
  refreshall();
  toast("Every actor locked", "warn");
};
acts.unlockall = function () {
  walk(app.scene.objects, function (n) {
    n.lock = false;
  });
  commit("lock");
  refreshall();
  toast("Every actor unlocked", "ok");
};
acts.objmenu = function (el, ev) {
  var r = el.getBoundingClientRect();
  app.selid = el.getAttribute("data-id");
  refreshpickers();
  openobjectmenu(app.selid, r.left, r.bottom);
};
acts.editsprite = function (el) {
  var n = el.getAttribute("data-id") ? findnode(app.scene.objects, el.getAttribute("data-id")) : selected();
  if (!n) return;
  var info = spriteinfo[n.sprite];
  var data = null;
  if (n.sprite && n.sprite.indexOf("custom:") === 0) data = customasseturl(n.sprite);
  else if (n.sprite) data = artmake(n.sprite).toDataURL();
  openspriteeditor([info ? info.w : 64, info ? info.h : 64], (info ? info.name : "Sprite") + " sprite", data);
};
acts.newsprite = function () {
  opensizemodal();
};
acts.picksprite = function () {
  var n = selected();
  if (n) pickspritemodal(n);
};
acts.picksky = function () {
  openmodal({
    title: "Sky image",
    icon: "image",
    body: '<div class="picklist"><button class="pickitem" data-mact="sky" data-sky="sky"><img src="' + arturln("sky") + '" style="width:44px;height:22px;object-fit:cover;border-radius:3px"><span class="t">SkyMorning</span></button><button class="pickitem" data-mact="sky" data-sky=""><span class="ico">' + ic("x", "ico-sm") + '<span class="t">None</span></button></div>',
    actions: {
      sky: function (m, s, btn) {
        app.scene.env.sky = btn.getAttribute("data-sky");
        closemodal(s);
        touch();
        renderright();
      }
    }
  });
};
acts.removecomponent = function (el) {
  var n = findnode(app.scene.objects, el.getAttribute("data-id"));
  var comp = el.getAttribute("data-comp");
  if (!n) return;
  openmenu([{ label: "Remove " + comp + " component", icon: "trash", act: "docompremove" }], window.innerWidth - 320, 120, {
    onact: function () {
      n.comps = (n.comps || []).filter(function (c) {
        return c !== comp;
      });
      commit("removecomp");
    }
  });
};
acts.resettransform = function () {
  var n = selected();
  if (!n) return;
  n.pos = [0, 0, 0];
  n.rot = [0, 0, 0];
  n.scl = [1, 1, 1];
  commit("reset");
};
acts.renamesel = function () {
  var n = selected();
  if (!n) return;
  promptbox("Rename object", n.name, function (v) {
    n.name = v;
    commit("rename");
  });
};
acts.addtag = function () {
  var n = selected();
  if (!n) {
    toast("Select an object first", "warn");
    return;
  }
  promptbox("Add tag", "", function (v) {
    n.tags = n.tags || [];
    if (n.tags.indexOf(v) < 0) n.tags.push(v);
    commit("tag");
  }, { hint: "Tags group objects for events and collisions." });
};
acts.removetag = function (el) {
  var n = findnode(app.scene.objects, el.getAttribute("data-id"));
  var t = el.getAttribute("data-tag");
  if (!n) return;
  n.tags = (n.tags || []).filter(function (x) {
    return x !== t;
  });
  commit("tag");
};
acts.togglesec = function (el) {
  var id = el.getAttribute("data-sec");
  app.collapsed = app.collapsed || {};
  app.collapsed[id] = !app.collapsed[id];
  renderright();
};
acts.addcomponent = function () {
  openaddcomponent();
};
acts.addbehavior = function () {
  openbehaviormodal();
};
acts.removebehavior = function (el) {
  var n = findnode(app.scene.objects, el.getAttribute("data-id"));
  if (!n) return;
  n.behaviors.splice(+el.getAttribute("data-index"), 1);
  commit("behavior");
};
acts.addvar = function () {
  var n = selected();
  if (!n) return;
  promptbox("Instance variable", "Variable", function (v) {
    n.vars = n.vars || [];
    n.vars.push({ name: v, type: "number", value: 0 });
    commit("var");
  });
};
acts.removevar = function (el) {
  var n = findnode(app.scene.objects, el.getAttribute("data-id"));
  if (!n) return;
  n.vars.splice(+el.getAttribute("data-index"), 1);
  commit("var");
};
acts.addglobal = function () {
  app.project.globals = app.project.globals || [];
  app.project.globals.push({ name: "Variable" + (app.project.globals.length + 1), type: "number", value: 0 });
  touch();
  renderright();
};
acts.removeglobal = function (el) {
  app.project.globals.splice(+el.getAttribute("data-index"), 1);
  touch();
  renderright();
};
acts.addscevar = function () {
  addvariablesce();
};
acts.removescevar = function (el) {
  app.scene.vars.splice(+el.getAttribute("data-index"), 1);
  commit("scevar");
};
acts.addobject = function () {
  openaddobject();
};
acts.addcube = function () {
  var node = basenode("cube", { pos: [app.cam.target[0], Math.max(0.5, app.cam.target[1]), 0] });
  node.name = "Cube";
  addnode(node, null);
};
acts.addcomponentFromMenu = function () {
  openaddcomponent();
};
acts.toolselect = function () {
  app.transformmode = "move";
  renderdock();
};
acts.toolrotate = function () {
  app.transformmode = "rotate";
  renderdock();
};
acts.toolscale = function () {
  app.transformmode = "scale";
  renderdock();
};
acts.focussel = function () {
  focusselected();
};
acts.viewfront = function () {
  setviewmode("front");
};
acts.viewtop = function () {
  setviewmode("top");
};
acts.viewside = function () {
  setviewmode("side");
};
acts.viewpersp = function () {
  setviewmode("persp");
};
acts.cycleview = function () {
  var order = ["persp", "front", "side", "top"];
  var i = order.indexOf(app.cam.mode);
  setviewmode(order[(i + 1) % order.length]);
};
acts.resetcamera = function () {
  app.cam.yaw = 0.42;
  app.cam.pitch = 0.22;
  app.cam.dist = 17.5;
  app.cam.target = [0, 0.2, 0];
  app.cam.mode = "persp";
  updateviewgizmo();
};
acts.togglegrid = function () {
  app.showgrid = !app.showgrid;
  toast("Grid " + (app.showgrid ? "on" : "off"));
};
acts.togglecam = function () {
  app.preview = !app.preview;
  var cam = qs("#campreview");
  if (cam) cam.classList.toggle("hide", !app.preview);
  toast("Camera preview " + (app.preview ? "on" : "off"));
};
acts.togglesun = function () {
  var sun = null;
  (app.scene.objects || []).forEach(function (n) {
    if (n.type === "sun") sun = n;
  });
  if (sun) {
    sun.visible = sun.visible === false;
    commit("sun");
  }
};
acts.filesfilter = function (el) {
  app.filesfilter = el.getAttribute("data-filter");
  renderdock();
};
acts.filesgrid = function () {
  app.filesview = "grid";
  renderdock();
};
acts.fileslist = function () {
  app.filesview = "list";
  renderdock();
};
acts.importfiles = function () {
  var input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.multiple = true;
  input.onchange = function () {
    importfiles(input.files);
  };
  input.click();
};
acts.newasset = function () {
  opennewasset();
};
acts.assetsopen = function () {
  opendoc("assets");
};
acts.soundsopen = function () {
  app.dock = "files";
  app.filesfilter = "sounds";
  renderdock();
};
acts.newfolder = function () {
  promptbox("New folder", "Folder", function (v) {
    app.project.folders = app.project.folders || [];
    app.project.folders.push(v);
    saveprojects();
    refreshall();
    toast("Folder created", "ok");
  });
};
acts.fileopen = function (el) {
  filepreview(el.getAttribute("data-fid"));
};
acts.filesreplace = function (el) {
  var fid = el.getAttribute("data-fid");
  var item = null;
  filelist().forEach(function (f) {
    if (f.fid === fid) item = f;
  });
  var n = selected();
  if (n && item && item.sprite) {
    n.sprite = item.sprite;
    if ((n.comps || []).indexOf("sprite") < 0) n.comps.push("sprite");
    if (n.type !== "sprite") n.type = "sprite";
    closemodal();
    commit("sprite");
    toast("Applied to " + n.name, "ok");
  } else {
    toast("Select a sprite object first", "warn");
  }
};
acts.logichelp = function () {
  openmodal({
    title: "How event sheets work",
    icon: "help",
    width: "wide",
    body: '<div style="font-size:12.5px;line-height:1.8;color:var(--text-2)">An event sheet is a list of <b>When</b> → <b>Do</b> rules. The scene runs one sheet at a time; the <b>This scene runs</b> dropdown chooses which one.<br><br>Use <b>When… (pick an object)</b> to choose a subject such as <b>Player</b> or a tag like <span class="kbd">#hazard</span>, then add a condition and an action. Code scripts can run alongside the sheet for things it cannot express.</div>',
    footer: '<button class="btn primary" data-act="closedocmodal">Got it</button>'
  });
};
acts.newsheet = function () {
  promptbox("New event sheet", "Events " + (app.project.eventsheets.length + 1), function (v) {
    var sh = { id: newid("e"), name: v, scene: app.scene.id, count: 0, events: [] };
    app.project.eventsheets.push(sh);
    app.scene.eventsheet = v;
    saveprojects();
    opendoc("events", sh.id);
  });
};
acts.openevent = function (el) {
  opendoc("events", el.getAttribute("data-id"));
};
acts.openscript = function (el) {
  opendoc("script", el.getAttribute("data-id"));
};
acts.newscript = function () {
  promptbox("New code script", "NewScript", function (v) {
    var s = addscript(v);
    opendoc("script", s.id);
  });
};
acts.sheetkebab = function (el, ev) {
  var id = el.getAttribute("data-id");
  ev.stopPropagation();
  var r = el.getBoundingClientRect();
  openmenu([
    { label: "Open sheet", icon: "events", act: "opensheet" },
    { label: "Rename", icon: "pen", act: "renamesheet" },
    { label: "Duplicate", icon: "duplicate", act: "dupsheet" },
    { sep: true },
    { label: "Delete", icon: "trash", act: "delsheet" }
  ], r.left - 160, r.bottom, {
    onact: function (name) {
      var sh = null;
      app.project.eventsheets.forEach(function (s) {
        if (s.id === id) sh = s;
      });
      if (!sh) return;
      if (name === "opensheet") opendoc("events", id);
      else if (name === "renamesheet") promptbox("Rename event sheet", sh.name, function (v) {
        sh.name = v;
        saveprojects();
        refreshall();
      });
      else if (name === "dupsheet") {
        var copy = deep(sh);
        copy.id = newid("e");
        copy.name = sh.name + " copy";
        app.project.eventsheets.push(copy);
        saveprojects();
        refreshall();
      } else if (name === "delsheet") {
        app.project.eventsheets = app.project.eventsheets.filter(function (s) {
          return s.id !== id;
        });
        saveprojects();
        refreshall();
      }
    }
  });
};
acts.scriptkebab = function (el, ev) {
  var id = el.getAttribute("data-id");
  ev.stopPropagation();
  var r = el.getBoundingClientRect();
  openmenu([
    { label: "Open script", icon: "code", act: "openscript2" },
    { label: "Rename", icon: "pen", act: "renamescript" },
    { sep: true },
    { label: "Delete", icon: "trash", act: "delscript" }
  ], r.left - 160, r.bottom, {
    onact: function (name) {
      var s = null;
      app.project.scripts.forEach(function (x) {
        if (x.id === id) s = x;
      });
      if (!s) return;
      if (name === "openscript2") opendoc("script", id);
      else if (name === "renamescript") promptbox("Rename script", s.name, function (v) {
        s.name = v;
        saveprojects();
        refreshall();
      });
      else if (name === "delscript") {
        app.project.scripts = app.project.scripts.filter(function (x) {
          return x.id !== id;
        });
        saveprojects();
        refreshall();
      }
    }
  });
};
acts.quality = function (el) {
  app.project.graphics.quality = el.getAttribute("data-q");
  app.project.graphics.startquality = app.project.graphics.quality;
  saveprojects();
  renderdocs(true);
  toast("Quality preset: " + app.project.graphics.quality, "ok");
};
acts.qualitycustom = function () {
  toast("Custom quality keeps the current toggles below", "ok");
};
acts.pickicon = function () {
  promptbox("App icon name", app.project.icon === "none" ? "icon" : app.project.icon, function (v) {
    app.project.icon = v;
    saveprojects();
    renderdocs(true);
  });
};
acts.publish = function () {
  var ref = openmodal({
    title: "Publish game",
    icon: "sparkle",
    width: "narrow",
    body: '<div style="font-size:12.5px;color:var(--text-2);line-height:1.7">Building <b>' + esc(app.project.name) + "</b> for the web…</div><div style=\"height:8px;background:#1b1d21;border-radius:4px;margin-top:12px;overflow:hidden\"><div id=\"pubbars\" style=\"height:100%;width:6%;background:#3f6fe0;transition:width .3s\"></div></div>",
    footer: '<button class="btn" data-act="closedocmodal">Cancel</button>'
  });
  var pct = 6;
  var timer = setInterval(function () {
    pct += 8 + Math.random() * 14;
    var bar = qs("#pubbars");
    if (bar) bar.style.width = Math.min(100, pct) + "%";
    if (pct >= 100) {
      clearInterval(timer);
      setTimeout(function () {
        closemodal();
        toast("Build ready · " + app.project.name + " (web)", "ok");
      }, 300);
    }
  }, 260);
};
acts.assetmode = function (el) {
  var mode = el.getAttribute("data-mode");
  app.assetmode = mode;
  app.closedsecs = app.closedsecs || {};
  delete app.closedsecs[mode === "images" ? "assetimages" : "assetmodels"];
  var first = kits.filter(function (k) {
    return k.kind === mode;
  })[0];
  if (first) app[mode === "images" ? "imagekit" : "assetkit"] = first.id;
  renderdocs(true);
};
acts.assetkit = function (el) {
  var field = el.getAttribute("data-field") || "assetkit";
  app[field] = el.getAttribute("data-kit");
  if (field === "imagekit") app.assetmode = "images";
  else app.assetmode = "models";
  renderdocs(true);
};
acts.assetadd = function (el) {
  var kit = kitbyid(el.getAttribute("data-kit"));
  var name = el.getAttribute("data-name");
  var item = null;
  parsekit(kit).forEach(function (it) {
    if (it.n === name) item = it;
  });
  if (!item) return;
  if (kit.kind === "images") {
    var url = uiitemthumb(item, kit.id).toDataURL("image/png");
    var asset = { id: newid("a"), name: item.n, type: "image", data: url, size: fmtkb(databytes(url)) };
    app.project.assets.push(asset);
    saveprojects();
    toast("Added image " + item.n + " to Files", "ok");
    return;
  }
  var spriteMap = {
    coin: "coin",
    heart: "heart",
    tree: "tree",
    rock: "rock",
    mushroom: "mushroom",
    crate: "crate",
    door: "door",
    fence: "fence",
    column: "column"
  };
  var node;
  if (spriteMap[item.k]) {
    node = basenode("sprite", { name: item.n, sprite: spriteMap[item.k], pos: [0, 0.6, 0] });
  } else if (item.k === "car" || item.k === "animal" || item.k === "building" || item.k === "button" || item.k === "panel") {
    node = basenode("cube", { name: item.n, pos: [0, 0.8, 0], scl: [1.1, 1.1, 1.1] });
    node.color = ["#e0a568", "#8ad0f0", "#f09090", "#b9a2ee", "#9fe0b4"][hashof(item.n) % 5];
  } else {
    node = basenode("cube", { name: item.n, pos: [0, 0.5, 0], scl: [1, 0.6, 1] });
    node.color = ["#d6b98c", "#b98d5c", "#aab1bb", "#8ce874"][hashof(item.n) % 4];
  }
  node.pos = [Math.round(app.cam.target[0] * 10) / 10, 0.6, 0];
  node.name = uniqueid(app.scene.objects, node.name);
  app.scene.objects.push(node);
  app.selid = node.id;
  commit("addasset");
  toast("Added " + item.n, "ok");
};
acts.snippets = function () {
  opensnippets();
};
acts.apimenu = function () {
  openapi();
};
acts.eventwhen = function () {
  var sheet = null;
  app.project.eventsheets.forEach(function (s) {
    if (s.name === app.scene.eventsheet) sheet = s;
  });
  if (!sheet) return;
  pickobjectmodal(function (obj) {
    openmenu([
      { head: "Choose a condition" },
      { label: "is touched", icon: "collider", act: "condtouch" },
      { label: "is clicked", icon: "mouse", act: "condclick" },
      { label: "goes off screen", icon: "monitor", act: "condoff" },
      { label: "exists", icon: "check", act: "condexists" }
    ], window.innerWidth / 2 - 100, 200, {
      onact: function (act) {
        var when = "When " + obj + " " + (act === "condclick" ? "is clicked" : act === "condoff" ? "goes off screen" : act === "condexists" ? "exists" : "is touched");
        openmenu([
          { head: "Choose an action" },
          { label: "Add 1 to Score", icon: "star", act: "doadd" },
          { label: "Remove 1 life", icon: "heart", act: "dolife" },
          { label: "Destroy it", icon: "trash", act: "dodestroy" },
          { label: "Play a sound", icon: "sound", act: "dosound" }
        ], window.innerWidth / 2 - 100, 260, {
          onact: function (a) {
            var action = a === "dolife" ? "Remove 1 life" : a === "dodestroy" ? "Destroy it" : a === "dosound" ? "Play sound Coin" : "Add 1 to Score";
            sheet.events = sheet.events || [];
            sheet.events.push({ when: when, do: action, obj: obj });
            sheet.count = sheet.events.length;
            app.docstamp = (app.docstamp || 0) + 1;
            saveprojects();
            renderdocs(true);
            renderdock();
            toast("Event added", "ok");
          }
        });
      }
    });
  });
};
acts.eventdel = function (el) {
  var sheet = null;
  app.project.eventsheets.forEach(function (s) {
    if (s.name === app.scene.eventsheet) sheet = s;
  });
  if (!sheet || !sheet.events) return;
  sheet.events.splice(+el.getAttribute("data-index"), 1);
  sheet.count = sheet.events.length;
  app.docstamp = (app.docstamp || 0) + 1;
  saveprojects();
  renderdocs(true);
  renderdock();
};
acts.eventadd = function () {
  toast("Use “When… (pick an object)” to add an event", "ok");
};
acts.eventundo = function () {
  toast("No event changes to undo", "warn");
};
acts.savesession = function () {
  toast("Restored from history", "ok");
};
acts.objduplicate = function () {
  var n = selected();
  if (n) duplicatenode(n);
};
acts.objdelete = function () {
  var n = selected();
  if (n) deletenode(n);
};
acts.objcopy = function () {
  var n = selected();
  if (n) {
    app.clipboard = JSON.stringify(n);
    toast("Copied " + n.name, "ok");
  }
};
acts.objpaste = function () {
  if (!app.clipboard) return;
  var copy = clonenode(JSON.parse(app.clipboard));
  copy.name = uniqueid(app.scene.objects, copy.name);
  app.scene.objects.push(copy);
  app.selid = copy.id;
  commit("paste");
};
acts.objaddchild = function () {
  var n = selected();
  openaddobject(function (node) {
    if (!node) return;
    (n.children = n.children || []).push(node);
    node.name = uniqueid(app.scene.objects, node.name);
    app.expanded[n.id] = true;
    app.selid = node.id;
    commit("addchild");
  });
};
acts.objdetach = function () {
  var n = selected();
  if (n) reparentnode(n, null);
};
acts.objmoveup = function () {
  var n = selected();
  var pl = n ? parentlistof(n.id) : null;
  if (!pl || pl.index === 0) return;
  pl.list.splice(pl.index, 1);
  pl.list.splice(pl.index - 1, 0, n);
  commit("reorder");
};
acts.objmovedown = function () {
  var n = selected();
  var pl = n ? parentlistof(n.id) : null;
  if (!pl || pl.index >= pl.list.length - 1) return;
  pl.list.splice(pl.index, 1);
  pl.list.splice(pl.index + 1, 0, n);
  commit("reorder");
};
acts.objfocus = function () {
  focusselected();
};
acts.objvisibility = function () {
  var n = selected();
  if (!n) return;
  n.visible = n.visible === false;
  commit("visibility");
};
acts.objrename = function () {
  acts.renamesel();
};
acts.newscene = function () {
  promptbox("New scene", "Scene " + (app.project.scenes.length + 1), function (v) {
    addscene(v);
    refreshall();
  });
};
acts.dupscene = function () {
  duplicatscene();
  refreshall();
};
acts.delscene = function () {
  deletescene();
  refreshall();
};
acts.renamescene = function () {
  promptbox("Rename scene", app.scene.name, function (v) {
    app.scene.name = v;
    sceneofid(app.scene.id).name = v;
    saveprojects();
    refreshall();
  });
};
function sceneofid(id) {
  var out = app.scene;
  app.project.scenes.forEach(function (s) {
    if (s.id === id) out = s;
  });
  return out;
}
acts.shortcuts = function () {
  shortcutsmodal();
};
acts.about = function () {
  aboutmodal();
};
acts.scenesettings = function () {
  app.right = "scene";
  renderright();
};
acts.manage = function () {};
acts.sceneadd = function () {};
acts.docompremove = function () {};

acts.closesec = function (el) {
  var id = el.getAttribute("data-sec");
  app.closedsecs = app.closedsecs || {};
  app.closedsecs[id] = true;
  app.collapsed = app.collapsed || {};
  app.collapsed[id] = true;
  app.docstamp = (app.docstamp || 0) + 1;
  refreshall();
};

acts.opensec = function (el) {
  var id = el.getAttribute("data-sec");
  app.closedsecs = app.closedsecs || {};
  delete app.closedsecs[id];
  app.collapsed = app.collapsed || {};
  delete app.collapsed[id];
  app.docstamp = (app.docstamp || 0) + 1;
  refreshall();
};

acts.openallsecs = function () {
  app.closedsecs = {};
  app.collapsed = {};
  app.docstamp = (app.docstamp || 0) + 1;
  refreshall();
  toast("All sections restored", "ok");
};

acts.panel = function (which) {
  if (which === "sky") skypanel();
  else if (which === "land") terpanel();
  else if (which === "pcg") pcgpanel();
  else if (which === "layer") layerpanel();
  else if (which === "cine") cinepanel();
  else if (which === "keys") keyspanel();
};

function keyspanel() {
  var groups = [
    ["Viewport navigation", [
      ["Right mouse drag", "Look around (freelook)"],
      ["Right mouse + W A S D", "Fly through the level"],
      ["Right mouse + Q / E", "Fly down / up"],
      ["Shift (while flying)", "4x camera speed"],
      ["Ctrl + mouse wheel", "Camera speed 0.5 - 80 m/s"],
      ["Middle mouse drag", "Pan the camera"],
      ["Mouse wheel", "Dolly / zoom"],
      ["Alt + G", "Perspective view"],
      ["Alt + H", "Front view"],
      ["Alt + J", "Top view"],
      ["Alt + K", "Side view"],
      ["F", "Focus selected actor"],
      ["F11", "Immersive fullscreen"],
      ["Shift + G", "Game view (hide editor overlays)"],
      ["Shift + P", "Pilot selected actor"],
      ["End", "Drop selection to floor"],
      ["Ctrl + H", "Hide selection"],
      ["Ctrl + Shift + H", "Show all actors"],
      ["1 - 9", "Jump to camera bookmark"],
      ["Ctrl + 1 - 9", "Save camera bookmark"]
    ]],
    ["Transform and selection", [
      ["W / E / R", "Move / rotate / scale tool"],
      ["Gizmo arrow drag", "Move along an axis"],
      ["Gizmo plane drag", "Move on a plane"],
      ["Ring drag", "Rotate around an axis"],
      ["Spin ring drag", "Rotate around Z, 15 degree steps"],
      ["Box corner drag", "Scale from a corner, Ctrl keeps ratio"],
      ["Box edge drag", "Scale one axis"],
      ["Shift while dragging", "Uniform scale / max angle snap"],
      ["Alt while dragging", "Anchor opposite edge / 1 degree steps"],
      ["Marquee drag", "Box select"],
      ["Shift + click", "Add to selection"]
    ]],
    ["Editor shortcuts", [
      ["Space", "Play in editor / stop"],
      ["Delete", "Delete selected actor"],
      ["F2", "Rename actor"],
      ["Ctrl + Z / Ctrl + Y", "Undo / redo"],
      ["Ctrl + S", "Save level"],
      ["Ctrl + D", "Duplicate actor"],
      ["Ctrl + C / Ctrl + V", "Copy / paste actor"]
    ]],
    ["Lock and visibility", [
      ["Eye button", "Toggle visibility in the outliner"],
      ["Lock button", "Lock actor so it cannot be picked or moved"],
      ["Locked checkbox", "Same toggle in the Details panel"],
      ["Tools > Lock all", "Lock every actor"]
    ]]
  ];
  var body = '<div class="u5keys">';
  groups.forEach(function (g) {
    body += '<div class="u5keygroup"><div class="u5keyhead">' + esc(g[0]) + "</div>";
    g[1].forEach(function (row) {
      body += '<div class="u5keyrow"><span class="u5key">' + esc(row[0]) + "</span><span class=\"u5kdesc\">" + esc(row[1]) + "</span></div>";
    });
    body += "</div>";
  });
  body += "</div>";
  openmodal({
    title: "Controls & Shortcuts - Roxumitod Game Engine",
    icon: "keyboard",
    width: "wide",
    body: body,
    footer: '<button class="btn" data-mact="close">Close</button>'
  });
}

acts.guiservice = function () {
  guiservicepanel();
};

acts.guifocus = function () {
  var list = guilist();
  if (!list.length) {
    toast("No ScreenGui in this scene, adding one", "ok");
    guinew("screengui");
    return;
  }
  guiservicepanel();
};
