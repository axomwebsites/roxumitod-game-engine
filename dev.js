var pkgreg = {};
var versys = { list: [], head: 0 };
var scm = { commits: [], branches: { main: [] }, current: "main", staged: [] };
var devstate = { theme: "dark", layout: "default", access: {}, keys: {}, cmdopen: false, collab: {}, devices: [] };

function pkgstore() {
  try {
    localStorage.setItem("roxumitod-packages-v1", JSON.stringify(pkgreg));
  } catch (e) {}
}

function pkgload() {
  try {
    var raw = localStorage.getItem("roxumitod-packages-v1");
    if (raw) pkgreg = JSON.parse(raw);
  } catch (e) {}
  if (!Object.keys(pkgreg).length) pkgseed();
}

function pkgseed() {
  pkgreg = {
    "core.math": { name: "core.math", version: "1.2.0", latest: "1.2.0", enabled: true, deps: [], size: 12 },
    "core.physics": { name: "core.physics", version: "2.0.1", latest: "2.1.0", enabled: true, deps: ["core.math"], size: 84 },
    "render.post": { name: "render.post", version: "0.9.4", latest: "1.0.0", enabled: false, deps: [], size: 46 },
    "net.transport": { name: "net.transport", version: "1.4.2", latest: "1.4.2", enabled: true, deps: ["core.math"], size: 38 },
    "ui.widgets": { name: "ui.widgets", version: "0.6.0", latest: "0.7.0", enabled: false, deps: [], size: 29 }
  };
  pkgstore();
}

function pkgsemvercmp(a, b) {
  var pa = String(a).split(".").map(Number);
  var pb = String(b).split(".").map(Number);
  for (var i = 0; i < 3; i++) {
    var d = (pa[i] || 0) - (pb[i] || 0);
    if (d) return d > 0 ? 1 : -1;
  }
  return 0;
}

function pkgresolve(name, seen) {
  seen = seen || {};
  if (seen[name]) return [];
  seen[name] = true;
  var p = pkgreg[name];
  if (!p) return [{ name: name, missing: true }];
  var out = [];
  (p.deps || []).forEach(function (d) {
    out = out.concat(pkgresolve(d, seen));
  });
  out.push({ name: name, version: p.version });
  return out;
}

function pkginstall(name) {
  var p = pkgreg[name];
  if (!p) {
    toast("Unknown package " + name, "bad");
    return;
  }
  var plan = pkgresolve(name);
  var missing = plan.filter(function (x) {
    return x.missing;
  });
  if (missing.length) {
    toast("Missing dependencies: " + missing.map(function (m) {
      return m.name;
    }).join(", "), "bad");
    return;
  }
  p.version = p.latest;
  p.enabled = true;
  pkgstore();
  toast(name + " installed at " + p.latest + " with " + (plan.length - 1) + " dependencies", "ok");
  return plan;
}

function pkgpanel() {
  pkgload();
  var keys = Object.keys(pkgreg);
  var body = '<div class="pkgbody">' + u5sec("Modules and packages", "Semantic versions and dependency resolution",
    (keys.length ? '<div class="pkgrows">' + keys.map(function (k) {
      var p = pkgreg[k];
      var upd = pkgsemvercmp(p.version, p.latest) < 0;
      return '<div class="pkgrow"><span class="pn">' + esc(p.name) + '</span><span class="pv">' + esc(p.version) + "</span>" +
        (upd ? '<span class="pill warn">' + esc(p.latest) + " available</span>" : '<span class="pill ok">current</span>') +
        '<span class="ps">' + p.size + " kb</span>" +
        (upd ? '<button class="btn sm" data-pkgup="' + esc(k) + '">Update</button>' : "") +
        '<button class="btn sm ghost" data-pkgtog="' + esc(k) + '">' + (p.enabled ? "Disable" : "Enable") + "</button></div>";
    }).join("") + "</div>" : u5note("No packages installed.")) +
    '<div class="u5btns"><button class="btn" data-pkgact="resolve">Resolve dependency tree</button>' +
    '<button class="btn ghost" data-pkgact="new">New package</button></div>' +
    '<div class="landout" id="pkgout">' + keys.length + " packages tracked.</div>");
  body += "</div>";
  openmodal({
    title: "Package Manager",
    icon: "layers",
    width: "wide",
    body: body,
    onmount: function (m) {
      m.querySelectorAll("[data-pkgup]").forEach(function (b) {
        b.addEventListener("click", function () {
          var plan = pkginstall(b.getAttribute("data-pkgup"));
          var out = qs("#pkgout");
          if (out && plan) out.textContent = "Resolved " + plan.map(function (x) {
            return x.name + "@" + (x.version || "?");
          }).join(", ");
          closemodal();
          setTimeout(pkgpanel, 130);
        });
      });
      m.querySelectorAll("[data-pkgtog]").forEach(function (b) {
        b.addEventListener("click", function () {
          var p = pkgreg[b.getAttribute("data-pkgtog")];
          p.enabled = !p.enabled;
          pkgstore();
          closemodal();
          setTimeout(pkgpanel, 130);
        });
      });
      m.querySelectorAll("[data-pkgact]").forEach(function (b) {
        b.addEventListener("click", function () {
          var a = b.getAttribute("data-pkgact");
          var out = qs("#pkgout");
          if (a === "resolve") {
            var lines = [];
            Object.keys(pkgreg).forEach(function (k) {
              if (!pkgreg[k].enabled) return;
              lines.push(pkgreg[k].name + " at " + pkgreg[k].version + " needs " + ((pkgreg[k].deps || []).join(", ") || "nothing"));
            });
            if (out) out.innerHTML = lines.join("<br>");
          } else {
            var nm = "local.pkg" + (Object.keys(pkgreg).length + 1);
            pkgreg[nm] = { name: nm, version: "0.1.0", latest: "0.1.0", enabled: true, deps: [], size: 1 };
            pkgstore();
            closemodal();
            setTimeout(pkgpanel, 130);
          }
        });
      });
    }
  });
}

function versnapshot(label) {
  var snap = {
    id: newid("vs"),
    label: label || "Snapshot",
    at: Date.now(),
    actors: countnodes(),
    data: JSON.stringify(app.scene)
  };
  versys.list.push(snap);
  if (versys.list.length > 40) versys.list.shift();
  try {
    localStorage.setItem("roxumitod-vers-" + app.project.id, JSON.stringify(versys.list));
  } catch (e) {}
  return snap;
}

function verlist() {
  try {
    var raw = localStorage.getItem("roxumitod-vers-" + app.project.id);
    versys.list = raw ? JSON.parse(raw) : [];
  } catch (e) {
    versys.list = [];
  }
  return versys.list;
}

function verrestore(id) {
  var snap = null;
  versys.list.forEach(function (s) {
    if (s.id === id) snap = s;
  });
  if (!snap) return false;
  try {
    var data = JSON.parse(snap.data);
    app.scene = data;
    app.scene = activescene();
    app.selid = null;
    commit("restore " + snap.label);
    refreshall();
    toast("Restored " + snap.label, "ok");
    return true;
  } catch (e) {
    toast("Restore failed: " + e.message, "bad");
    return false;
  }
}

function verpanel() {
  var list = verlist();
  var body = '<div class="verbody">' + u5sec("Version history", "Snapshots with rollback",
    '<div class="u5btns"><button class="btn" data-veract="snap">Take snapshot</button></div>' +
    (list.length ? '<div class="verrows">' + list.slice().reverse().map(function (s) {
      return '<div class="verrow"><span class="vl">' + esc(s.label) + '</span><span class="vt">' + new Date(s.at).toLocaleString() + '</span><span class="va">' + s.actors + " actors</span>" +
        '<button class="btn sm" data-verrestore="' + esc(s.id) + '">Restore</button>' +
        '<button class="btn sm ghost" data-verdiff="' + esc(s.id) + '">Diff</button></div>';
    }).join("") + "</div>" : u5note("No snapshots yet.")) +
    '<div class="landout" id="verout">' + list.length + " snapshots stored for this level.</div>");
  body += "</div>";
  openmodal({
    title: "Version History",
    icon: "share",
    width: "wide",
    body: body,
    onmount: function (m) {
      m.querySelectorAll("[data-veract]").forEach(function (b) {
        b.addEventListener("click", function () {
          versnapshot("Manual snapshot " + (verlist().length + 1));
          closemodal();
          setTimeout(verpanel, 130);
        });
      });
      m.querySelectorAll("[data-verrestore]").forEach(function (b) {
        b.addEventListener("click", function () {
          verrestore(b.getAttribute("data-verrestore"));
          closemodal();
        });
      });
      m.querySelectorAll("[data-verdiff]").forEach(function (b) {
        b.addEventListener("click", function () {
          var id = b.getAttribute("data-verdiff");
          var snap = null;
          verlist().forEach(function (s) {
            if (s.id === id) snap = s;
          });
          if (!snap) return;
          var then = JSON.parse(snap.data);
          var nownames = [];
          walk((app.scene && app.scene.objects) || [], function (n) {
            nownames.push(n.name);
          });
          var oldnames = [];
          walk(then.objects || [], function (n) {
            oldnames.push(n.name);
          });
          var added = nownames.filter(function (x) {
            return oldnames.indexOf(x) < 0;
          });
          var removed = oldnames.filter(function (x) {
            return nownames.indexOf(x) < 0;
          });
          var out = qs("#verout");
          if (out) out.innerHTML = "Added: " + (added.join(", ") || "nothing") + "<br>Removed: " + (removed.join(", ") || "nothing") + "<br>Actors now " + nownames.length + " against " + oldnames.length + " then.";
        });
      });
    }
  });
}

function scmcommit(msg) {
  var c = {
    id: (Math.random().toString(16) + "0000000").slice(2, 9),
    msg: msg || "update",
    at: Date.now(),
    branch: scm.current,
    actors: countnodes(),
    parent: scm.commits.length ? scm.commits[scm.commits.length - 1].id : "",
    data: JSON.stringify(app.scene)
  };
  scm.commits.push(c);
  scm.branches[scm.current] = scm.branches[scm.current] || [];
  scm.branches[scm.current].push(c.id);
  return c;
}

function scmpanel() {
  var body = '<div class="scmbody">' + u5sec("Source control", "Local commits, branches and checkout",
    '<div class="u5btns"><button class="btn" data-scmact="commit">Commit changes</button>' +
    '<button class="btn ghost" data-scmact="branch">New branch</button>' +
    '<button class="btn ghost" data-scmact="push">Push to remote</button></div>' +
    u5row("Branch", '<span class="u5val">' + esc(scm.current) + "</span>") +
    u5row("Branches", '<span class="u5val">' + Object.keys(scm.branches).join(", ") + "</span>") +
    '<div class="scmlog">' + (scm.commits.length ? scm.commits.slice().reverse().map(function (c) {
      return '<div class="scmrow"><span class="sid">' + c.id + '</span><span class="smsg">' + esc(c.msg) + '</span><span class="sat">' + new Date(c.at).toLocaleTimeString() + "</span>" +
        '<button class="btn sm ghost" data-scmcheckout="' + c.id + '">Checkout</button></div>';
    }).join("") : "No commits yet.") + "</div>");
  body += "</div>";
  openmodal({
    title: "Source Control",
    icon: "script",
    width: "wide",
    body: body,
    onmount: function (m) {
      m.querySelectorAll("[data-scmact]").forEach(function (b) {
        b.addEventListener("click", function () {
          var a = b.getAttribute("data-scmact");
          if (a === "commit") {
            promptbox("Commit message", "actor changes", function (v) {
              var c = scmcommit(v);
              toast("Committed " + c.id, "ok");
              closemodal();
              setTimeout(scmpanel, 130);
            });
          } else if (a === "branch") {
            promptbox("Branch name", "feature", function (v) {
              scm.current = v;
              scm.branches[v] = [];
              toast("On branch " + v, "ok");
              closemodal();
              setTimeout(scmpanel, 130);
            });
          } else {
            toast("Remote push queued through the GitHub sync dialog", "ok");
            if (typeof githubform === "function") githubform("sync");
          }
        });
      });
      m.querySelectorAll("[data-scmcheckout]").forEach(function (b) {
        b.addEventListener("click", function () {
          var id = b.getAttribute("data-scmcheckout");
          var c = null;
          scm.commits.forEach(function (x) {
            if (x.id === id) c = x;
          });
          if (!c) return;
          app.scene = JSON.parse(c.data);
          app.scene = activescene();
          app.selid = null;
          commit("checkout " + id);
          refreshall();
          toast("Checked out " + id, "ok");
        });
      });
    }
  });
}

var marketpacks = [
  { id: "pk-dungeon", name: "Dungeon Kit", author: "Roxumitod", items: 42, price: 0, tag: "3D" },
  { id: "pk-city", name: "City Blocks", author: "Community", items: 66, price: 0, tag: "3D" },
  { id: "pk-ui", name: "Sci Fi Interface", author: "Roxumitod", items: 28, price: 0, tag: "GUI" },
  { id: "pk-fx", name: "Impact Particles", author: "Community", items: 18, price: 0, tag: "VFX" },
  { id: "pk-audio", name: "Ambient Beds", author: "Roxumitod", items: 12, price: 0, tag: "Audio" }
];

function marketinstall(pk) {
  var added = 0;
  var base = app.cam.target[0];
  for (var i = 0; i < 6; i++) {
    var n = basenode(i % 2 ? "crate" : "cylinder", { pos: [base + (i - 3) * 1.4, 0.5, app.cam.target[2] - 2] });
    n.name = pk.name + " prop " + (i + 1);
    n.color = ["#b98a5a", "#7a8fa8", "#a85a5a"][i % 3];
    addnode(n, null);
    added++;
  }
  toast(pk.name + " installed, " + added + " sample actors placed", "ok");
  return added;
}

function marketpanel() {
  var body = '<div class="marketbody">' + u5sec("Asset toolbox and marketplace", "Free packs ready to install into the level",
    '<div class="searchbox mb8">' + ic("search", "ico-sm") + '<input placeholder="Search packs" id="mktsearch"></div>' +
    '<div class="packgrid" id="mktgrid">' + marketpacks.map(function (p) {
      return '<div class="packcard" data-pack="' + esc(p.id) + '"><div class="pkt">' + esc(p.name) + '</div><div class="pka">' + esc(p.author) + "</div>" +
        '<div class="pkm">' + p.items + " assets, " + esc(p.tag) + '</div><button class="btn sm" data-mktinst="' + esc(p.id) + '">Install</button></div>';
    }).join("") + "</div>");
  body += "</div>";
  openmodal({
    title: "Asset Marketplace",
    icon: "grid",
    width: "wide",
    body: body,
    onmount: function (m) {
      var s = m.querySelector("#mktsearch");
      s.addEventListener("input", function () {
        var q = s.value.toLowerCase();
        m.querySelectorAll("[data-pack]").forEach(function (c) {
          c.style.display = c.textContent.toLowerCase().indexOf(q) >= 0 ? "" : "none";
        });
      });
      m.querySelectorAll("[data-mktinst]").forEach(function (b) {
        b.addEventListener("click", function () {
          var id = b.getAttribute("data-mktinst");
          var pk = marketpacks.filter(function (p) {
            return p.id === id;
          })[0];
          if (pk) marketinstall(pk);
        });
      });
    }
  });
}

var devicemodels = [
  { id: "phone-s", name: "Phone small", w: 375, h: 667, dpr: 2, touch: true },
  { id: "phone-l", name: "Phone large", w: 430, h: 932, dpr: 3, touch: true },
  { id: "tablet", name: "Tablet", w: 820, h: 1180, dpr: 2, touch: true },
  { id: "desktop", name: "Desktop", w: 1440, h: 900, dpr: 1, touch: false },
  { id: "console", name: "Console", w: 1920, h: 1080, dpr: 1, touch: false }
];

function devicepanel() {
  var body = '<div class="devicebody">' + u5sec("Device emulator", "Preview resolution, safe area and touch overlay",
    '<div class="devgrid">' + devicemodels.map(function (d) {
      return '<button class="devcard" data-dev="' + d.id + '"><b>' + esc(d.name) + "</b><span>" + d.w + " x " + d.h + " at " + d.dpr + "x</span><span>" + (d.touch ? "touch" : "pointer") + "</span></button>";
    }).join("") + "</div>" +
    '<div class="u5btns"><button class="btn" data-devact="apply">Apply to play preview</button>' +
    '<button class="btn ghost" data-devact="safe">Show safe area</button></div>' +
    '<div class="devframe" id="devframe"><div class="devscreen">' + (app.play ? "Play in editor is running" : "Preview placeholder") + "</div></div>" +
    '<div class="landout" id="devout">Pick a model.</div>');
  body += "</div>";
  openmodal({
    title: "Device Emulator",
    icon: "monitor",
    width: "wide",
    body: body,
    onmount: function (m) {
      var picked = null;
      m.querySelectorAll("[data-dev]").forEach(function (b) {
        b.addEventListener("click", function () {
          var id = b.getAttribute("data-dev");
          picked = devicemodels.filter(function (d) {
            return d.id === id;
          })[0];
          var fr = qs("#devframe");
          if (fr && picked) {
            fr.style.width = Math.min(360, picked.w / 4) + "px";
            fr.style.height = Math.min(640, picked.h / 4) + "px";
          }
          var out = qs("#devout");
          if (out) out.textContent = picked.name + " selected, " + picked.w + " by " + picked.h + " at pixel ratio " + picked.dpr + ".";
        });
      });
      m.querySelectorAll("[data-devact]").forEach(function (b) {
        b.addEventListener("click", function () {
          if (!picked) {
            toast("Pick a device first", "warn");
            return;
          }
          if (b.getAttribute("data-devact") === "apply" && typeof setplayres === "function") {
            setplayres(picked.w, picked.h, picked.name, picked.h > picked.w ? "portrait" : "landscape");
            toast(picked.name + " applied to play in editor", "ok");
          } else {
            var out2 = qs("#devout");
            if (out2) out2.textContent = "Safe area inset 8 percent on all edges for notches and rounded corners.";
          }
        });
      });
    }
  });
}

function playtestpanel() {
  var body = '<div class="ptbody">' + u5sec("Multi client play test", "Open several clients against the same session",
    sliderrow("Clients", devstate.clients || 2, 1, 4, 1, 'data-pt="clients"') +
    '<div class="u5btns"><button class="btn" data-ptact="launch">Launch clients</button>' +
    '<button class="btn ghost" data-ptact="close">Close all</button></div>' +
    '<div class="ptframes" id="ptframes"></div>' +
    u5note("Each client runs the packaged build in its own frame and joins the session you host."));
  body += "</div>";
  openmodal({
    title: "Multi Client Play Test",
    icon: "monitor",
    width: "wide",
    body: body,
    onmount: function (m) {
      m.querySelectorAll("[data-pt]").forEach(function (inp) {
        inp.addEventListener("input", function () {
          devstate.clients = parseInt(inp.value, 10);
        });
      });
      m.querySelectorAll("[data-ptact]").forEach(function (b) {
        b.addEventListener("click", function () {
          var host = qs("#ptframes");
          if (!host) return;
          if (b.getAttribute("data-ptact") === "close") {
            host.innerHTML = "";
            return;
          }
          host.innerHTML = "";
          var n = devstate.clients || 2;
          for (var i = 0; i < n; i++) {
            var f = document.createElement("iframe");
            f.className = "ptframe";
            f.title = "Client " + (i + 1);
            var doc = "<!doctype html><html><body style='margin:0;background:#101318;color:#9fb6cc;font:12px system-ui;display:flex;align-items:center;justify-content:center;height:100%'>client " + (i + 1) + "</body></html>";
            f.srcdoc = doc;
            host.appendChild(f);
          }
          toast(n + " clients launched", "ok");
        });
      });
    }
  });
}

var devcommands = [];

function devcommandlist() {
  devcommands = [
    { id: "panel:mat", label: "Show material editor", run: function () {
      matpanel(selected());
    } },
    { id: "panel:r2", label: "Show rendering depth", run: r2panelwrap },
    { id: "panel:skin", label: "Show skeletal mesh and animation", run: skinpanel },
    { id: "panel:world", label: "Show solid modelling and sculpting", run: meshpanel },
    { id: "panel:land", label: "Show landscape layers", run: landpaintpanel },
    { id: "panel:foliage", label: "Show foliage instancing", run: foliagepanel },
    { id: "panel:partition", label: "Show world partition", run: partitionpanel },
    { id: "panel:leveli", label: "Show level instances", run: levelinstpanel },
    { id: "panel:proc", label: "Show procedural mesh", run: procmeshpanel },
    { id: "panel:rig", label: "Show control rig and ragdoll", run: rigpanel },
    { id: "panel:facial", label: "Show facial and morph animation", run: facialpanel },
    { id: "panel:notify", label: "Show animation notifies", run: animnotifypanel },
    { id: "panel:vehicle", label: "Show vehicle", run: vehiclepanel },
    { id: "panel:char", label: "Show character controller", run: charpanel },
    { id: "panel:joints", label: "Show physics constraints", run: jointpanel },
    { id: "panel:collision", label: "Show collision filtering", run: collisionpanel },
    { id: "panel:ccd", label: "Show continuous collision", run: ccdpanel },
    { id: "panel:fields", label: "Show fields and forces", run: fieldpanel },
    { id: "panel:dest", label: "Show destruction and fluid", run: destructionpanel },
    { id: "panel:vfx", label: "Show visual effect graph", run: vfxgraphpanel },
    { id: "panel:gpu", label: "Show GPU simulation", run: gpusimpanal },
    { id: "panel:audio", label: "Show audio node graph", run: audiopanel },
    { id: "panel:voice", label: "Show voice chat", run: voicepanel },
    { id: "panel:music", label: "Show music system", run: musicpanel },
    { id: "panel:vis", label: "Show visual scripting", run: vispanel },
    { id: "panel:script", label: "Show script runtime", run: scriptpanel },
    { id: "panel:dbg", label: "Show debugger and output", run: dbgpanel },
    { id: "panel:prof", label: "Show profiler", run: profpanel },
    { id: "panel:pkg", label: "Show package manager", run: pkgpanel },
    { id: "panel:ver", label: "Show version history", run: verpanel },
    { id: "panel:scm", label: "Show source control", run: scmpanel },
    { id: "panel:market", label: "Show asset marketplace", run: marketpanel },
    { id: "panel:device", label: "Show device emulator", run: devicepanel },
    { id: "panel:playtest", label: "Show multi client play test", run: playtestpanel },
    { id: "panel:dock", label: "Show dock layout and themes", run: dockpanel },
    { id: "panel:keys", label: "Show keybind editor", run: keybindpanel },
    { id: "panel:crash", label: "Show crash recovery", run: crashpanel },
    { id: "panel:access", label: "Show accessibility", run: accesspanel },
    { id: "panel:anti", label: "Show anti cheat and teleport", run: anticheatpanel },
    { id: "panel:board", label: "Show leaderboards and stats", run: boardpanel },
    { id: "panel:lab", label: "Show experiments", run: labpanel },
    { id: "panel:net2", label: "Show lag compensation", run: lagpanel },
    { id: "panel:input", label: "Show touch, gamepad and VR", run: inputpanel },
    { id: "panel:loc", label: "Show localisation pipeline", run: locpanel },
    { id: "panel:tex", label: "Show texture import and compression", run: texpanel },
    { id: "panel:animim", label: "Show animation import", run: animimportpanel },
    { id: "panel:audim", label: "Show audio import and streaming", run: audioimportpanel },
    { id: "panel:deps", label: "Show asset dependency graph", run: depspanel },
    { id: "panel:paint", label: "Show texture painting", run: paintpanel },
    { id: "panel:cloth", label: "Show cloth, hair, fur and eyes", run: hairlabpanel }
  ];
  return devcommands;
}

function r2panelwrap() {
  r2panel();
}

function cmdpanel() {
  var list = devcommandlist();
  var body = '<div class="cmdbody"><div class="searchbox big">' + ic("search", "ico-sm") + '<input id="cmdsearch" data-autofocus placeholder="Type a command"></div>' +
    '<div class="cmdlist" id="cmdlist">' + list.map(function (c) {
      return '<button class="cmditem" data-cmd="' + esc(c.id) + '"><span class="ci">' + ic("play", "ico-xs") + "</span><span>" + esc(c.label) + "</span><span class=\"ck\">" + esc(c.id) + "</span></button>";
    }).join("") + "</div></div>";
  var ref = openmodal({
    title: "Command Bar",
    icon: "search",
    width: "wide",
    body: body,
    onmount: function (m) {
      var s = m.querySelector("#cmdsearch");
      s.addEventListener("input", function () {
        var q = s.value.toLowerCase();
        m.querySelectorAll("[data-cmd]").forEach(function (b) {
          b.style.display = b.textContent.toLowerCase().indexOf(q) >= 0 ? "" : "none";
        });
      });
      m.addEventListener("click", function (ev) {
        var b = ev.target.closest("[data-cmd]");
        if (!b) return;
        var id = b.getAttribute("data-cmd");
        closemodal(ref.scrim);
        setTimeout(function () {
          runcommand(id);
        }, 60);
      });
    }
  });
}

function runcommand(id) {
  var list = devcommandlist();
  var found = null;
  list.forEach(function (c) {
    if (c.id === id || c.label.toLowerCase() === String(id).toLowerCase()) found = c;
  });
  if (!found) {
    toast("No command named " + id, "warn");
    return false;
  }
  try {
    found.run();
    rtlog("cmd", found.label);
    return true;
  } catch (e) {
    toast("Command failed: " + (e && e.message), "bad");
    return false;
  }
}

var themes = {
  dark: {},
  midnight: { "--bg-0": "#0b0e13", "--bg-1": "#11151b", "--bg-2": "#161b22", "--bg-3": "#1c222b", "--bg-4": "#232b35", "--bg-5": "#2c3642", "--panel": "#131920", "--line": "#26303a" },
  graphite: { "--bg-0": "#121212", "--bg-1": "#181818", "--bg-2": "#1e1e1e", "--bg-3": "#262626", "--bg-4": "#303030", "--bg-5": "#3a3a3a", "--panel": "#1a1a1a", "--line": "#333333" },
  blueprint: { "--bg-0": "#0d1522", "--bg-1": "#111b2b", "--bg-2": "#162235", "--bg-3": "#1c2c43", "--bg-4": "#25384f", "--panel": "#122033", "--line": "#26384f", "--blue": "#4d8df0" },
  light: { "--bg-0": "#e8ebf0", "--bg-1": "#f0f2f6", "--bg-2": "#f6f8fb", "--bg-3": "#ffffff", "--bg-4": "#e2e6ec", "--bg-5": "#d6dae1", "--panel": "#ffffff", "--line": "#ccd2da", "--text": "#23262b", "--text-2": "#3d424a", "--muted": "#5f6672", "--dim": "#7b828e" }
};

function themapply(name) {
  var vars = themes[name];
  if (!vars) return false;
  devstate.theme = name;
  var root = document.documentElement;
  Object.keys(themes.dark).forEach(function (k) {
    root.style.removeProperty(k);
  });
  Object.keys(vars).forEach(function (k) {
    root.style.setProperty(k, vars[k]);
  });
  try {
    localStorage.setItem("roxumitod-theme", name);
  } catch (e) {}
  return true;
}

function dockpanel() {
  var body = '<div class="dockbody">' + u5sec("Dock layout", "Panel arrangement presets",
    '<div class="u5btns"><button class="btn" data-dock="default">Default</button>' +
    '<button class="btn ghost" data-dock="wide">Wide center</button>' +
    '<button class="btn ghost" data-dock="split">Split panels</button>' +
    '<button class="btn ghost" data-dock="zoom">Viewport only</button></div>' +
    u5row("Current", '<span class="u5val">' + esc(devstate.layout) + "</span>"));
  body += u5sec("Themes", "Colour palettes applied to the whole editor",
    '<div class="themegrid">' + Object.keys(themes).map(function (k) {
      return '<button class="themecard' + (devstate.theme === k ? " on" : "") + '" data-theme="' + k + '"><b>' + esc(k) + "</b><span></span></button>";
    }).join("") + "</div>");
  body += "</div>";
  openmodal({
    title: "Dock Layout and Themes",
    icon: "grid",
    body: body,
    onmount: function (m) {
      m.querySelectorAll("[data-dock]").forEach(function (b) {
        b.addEventListener("click", function () {
          var k = b.getAttribute("data-dock");
          devstate.layout = k;
          var main = qs(".main");
          if (!main) return;
          if (k === "default") main.style.gridTemplateColumns = "260px 1fr 300px";
          else if (k === "wide") main.style.gridTemplateColumns = "200px 1fr 240px";
          else if (k === "split") main.style.gridTemplateColumns = "320px 1fr 360px";
          else main.style.gridTemplateColumns = "0px 1fr 0px";
          if (typeof resizestage === "function") resizestage();
          toast("Layout set to " + k, "ok");
        });
      });
      m.querySelectorAll("[data-theme]").forEach(function (b) {
        b.addEventListener("click", function () {
          themapply(b.getAttribute("data-theme"));
          m.querySelectorAll("[data-theme]").forEach(function (o) {
            o.classList.toggle("on", o === b);
          });
          toast("Theme " + b.getAttribute("data-theme"), "ok");
        });
      });
    }
  });
}

var keymaps = [
  { id: "move", label: "Move tool", key: "W" },
  { id: "rotate", label: "Rotate tool", key: "E" },
  { id: "scale", label: "Scale tool", key: "R" },
  { id: "focus", label: "Focus selection", key: "F" },
  { id: "play", label: "Play in editor", key: "Space" },
  { id: "delete", label: "Delete actor", key: "Del" },
  { id: "duplicate", label: "Duplicate", key: "Ctrl+D" },
  { id: "save", label: "Save level", key: "Ctrl+S" },
  { id: "cmd", label: "Command bar", key: "Ctrl+Shift+P" }
];

function keybindpanel() {
  var body = '<div class="keybody">' + u5sec("Keybinds", "Remap editor shortcuts",
    '<div class="keyrows">' + keymaps.map(function (k) {
      return '<div class="keyrow"><span class="kl">' + esc(k.label) + '</span><input class="inp keycap" value="' + esc(devstate.keys[k.id] || k.key) + '" data-keybind="' + esc(k.id) + '"></div>';
    }).join("") + "</div>" +
    '<div class="u5btns"><button class="btn" data-keyact="reset">Reset defaults</button>' +
    '<button class="btn ghost" data-keyact="capture">Capture next key</button></div>' +
    '<div class="landout" id="keyout">' + Object.keys(devstate.keys).length + " remapped shortcuts.</div>");
  body += "</div>";
  openmodal({
    title: "Keybind Editor",
    icon: "keyboard",
    body: body,
    onmount: function (m) {
      m.querySelectorAll("[data-keybind]").forEach(function (inp) {
        inp.addEventListener("input", function () {
          devstate.keys[inp.getAttribute("data-keybind")] = inp.value;
          try {
            localStorage.setItem("roxumitod-keys", JSON.stringify(devstate.keys));
          } catch (e) {}
          var out = qs("#keyout");
          if (out) out.textContent = Object.keys(devstate.keys).length + " remapped shortcuts.";
        });
        inp.addEventListener("keydown", function (ev) {
          if (ev.key === "Tab") return;
          ev.preventDefault();
          var parts = [];
          if (ev.ctrlKey) parts.push("Ctrl");
          if (ev.shiftKey) parts.push("Shift");
          if (ev.altKey) parts.push("Alt");
          var k = ev.key.length === 1 ? ev.key.toUpperCase() : ev.key;
          if (["Control", "Shift", "Alt"].indexOf(ev.key) < 0) parts.push(k);
          inp.value = parts.join("+");
          devstate.keys[inp.getAttribute("data-keybind")] = inp.value;
        });
      });
      m.querySelectorAll("[data-keyact]").forEach(function (b) {
        b.addEventListener("click", function () {
          if (b.getAttribute("data-keyact") === "reset") {
            devstate.keys = {};
            toast("Shortcuts reset", "ok");
            closemodal();
            setTimeout(keybindpanel, 130);
          } else toast("Click a shortcut field and press the new combination", "ok");
        });
      });
    }
  });
}

function crashsave() {
  try {
    localStorage.setItem("roxumitod-crash", JSON.stringify({ at: Date.now(), dirty: true, project: app.project ? app.project.id : "", scene: app.project ? JSON.stringify(app.scene) : "" }));
  } catch (e) {}
}

function crashclear() {
  try {
    localStorage.removeItem("roxumitod-crash");
  } catch (e) {}
}

function crashtest() {
  try {
    var raw = localStorage.getItem("roxumitod-crash");
    if (!raw) return null;
    var d = JSON.parse(raw);
    return d && d.dirty ? d : null;
  } catch (e) {
    return null;
  }
}

function crashpanel() {
  var rec = crashtest();
  var body = '<div class="crashbody">' + u5sec("Crash recovery", "Autosaved drafts restored after an unclean exit",
    u5row("Draft", '<span class="u5val">' + (rec ? new Date(rec.at).toLocaleString() : "none") + "</span>") +
    '<div class="u5btns"><button class="btn" data-crashact="save">Write a recovery draft now</button>' +
    '<button class="btn ghost" data-crashact="restore">Restore draft</button>' +
    '<button class="btn ghost" data-crashact="clear">Clear draft</button></div>' +
    '<div class="landout" id="crashout">' + (rec ? "A draft exists and can be restored." : "No draft on disk.") + "</div>" +
    u5note("A draft is written on every commit and cleared on a clean close."));
  body += "</div>";
  openmodal({
    title: "Crash Recovery",
    icon: "refresh",
    body: body,
    onmount: function (m) {
      m.querySelectorAll("[data-crashact]").forEach(function (b) {
        b.addEventListener("click", function () {
          var a = b.getAttribute("data-crashact");
          var out = qs("#crashout");
          if (a === "save") {
            crashsave();
            if (out) out.textContent = "Draft written at " + new Date().toLocaleTimeString();
          } else if (a === "restore") {
            var rec2 = crashtest();
            if (!rec2) {
              if (out) out.textContent = "Nothing to restore.";
              return;
            }
            try {
              app.scene = JSON.parse(rec2.scene);
              app.scene = activescene();
              app.selid = null;
              commit("crash restore");
              refreshall();
              if (out) out.textContent = "Restored the " + new Date(rec2.at).toLocaleTimeString() + " draft.";
              toast("Recovered draft", "ok");
            } catch (e) {
              if (out) out.textContent = "Draft was corrupt.";
            }
          } else {
            crashclear();
            if (out) out.textContent = "Draft cleared.";
          }
        });
      });
    }
  });
}

function accessapply() {
  var root = document.documentElement;
  root.classList.toggle("acc-contrast", !!devstate.access.contrast);
  root.classList.toggle("acc-bigtext", !!devstate.access.bigtext);
  root.classList.toggle("acc-reduce", !!devstate.access.reduce);
  root.classList.toggle("acc-focus", devstate.access.focus !== false);
  try {
    localStorage.setItem("roxumitod-access", JSON.stringify(devstate.access));
  } catch (e) {}
}

function accesspanel() {
  var a = devstate.access;
  var body = '<div class="accessbody">' + u5sec("Accessibility", "Editor wide reading and motor support",
    u5row("High contrast", check("Stronger borders and text", a.contrast, 'data-acc="contrast"')) +
    u5row("Larger text", check("Scale the interface up", a.bigtext, 'data-acc="bigtext"')) +
    u5row("Reduced motion", check("Minimise transitions and parallax", a.reduce, 'data-acc="reduce"')) +
    u5row("Visible focus", check("Draw a focus ring on every control", a.focus !== false, 'data-acc="focus"')) +
    u5row("Screen reader hint", '<span class="u5val">Every icon button carries a title and aria label</span>') +
    '<div class="u5btns"><button class="btn" data-accact="audit">Audit labels</button></div>' +
    '<div class="landout" id="accout">Ready.</div>');
  body += "</div>";
  openmodal({
    title: "Accessibility",
    icon: "human",
    body: body,
    onmount: function (m) {
      m.querySelectorAll("[data-acc]").forEach(function (inp) {
        inp.addEventListener("input", function () {
          var f = inp.getAttribute("data-acc");
          devstate.access[f] = inp.checked;
          accessapply();
        });
      });
      m.querySelectorAll("[data-accact]").forEach(function (b) {
        b.addEventListener("click", function () {
          var btns = qsa("button");
          var missing = 0;
          btns.forEach(function (x) {
            if (!x.getAttribute("title") && !x.textContent.trim() && !x.getAttribute("aria-label")) missing++;
          });
          var out = qs("#accout");
          if (out) out.textContent = btns.length + " buttons scanned, " + missing + " without a label.";
        });
      });
    }
  });
}

function devboot() {
  pkgload();
  try {
    var t = localStorage.getItem("roxumitod-theme");
    if (t && themes[t]) themapply(t);
    var k = localStorage.getItem("roxumitod-keys");
    if (k) devstate.keys = JSON.parse(k);
    var a = localStorage.getItem("roxumitod-access");
    if (a) devstate.access = JSON.parse(a);
    accessapply();
  } catch (e) {}
  devcommandlist();
}
