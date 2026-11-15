var eventconds = [
  { key: "collide", label: "collides with hero" },
  { key: "touch", label: "is touched" },
  { key: "click", label: "is clicked" },
  { key: "off", label: "goes off screen" },
  { key: "exists", label: "exists" },
  { key: "timer", label: "timer reaches 10 seconds" }
];

var eventdos = [
  { key: "addscore", label: "Add to Score" },
  { key: "addvar", label: "Add to variable" },
  { key: "setvar", label: "Set variable to" },
  { key: "life", label: "Remove life" },
  { key: "addlife", label: "Add life" },
  { key: "sound", label: "Play sound" },
  { key: "destroy", label: "Destroy it" },
  { key: "spawn", label: "Spawn object" },
  { key: "scene", label: "Go to scene" },
  { key: "win", label: "Win the game" },
  { key: "lose", label: "Lose the game" }
];

var soundnames = ["Coin", "Jump", "Power", "Punch", "Win", "Lose"];

function codetouch() {
  if (typeof schedulecommit === "function") schedulecommit();
}

function acts_toolmarquee() {}

function currenthost() {
  var host = qs("#page" + (app.tab || "").replace(/[^a-z0-9]/gi, ""));
  return host;
}

function currentspriteui() {
  return typeof spstate !== "undefined" && spstate ? spstate : null;
}

function eventobjectlist() {
  var seen = {};
  var out = [];
  walk(app.scene.objects, function (n) {
    if (!n.name || seen[n.name]) return;
    if (n.type === "camera" || n.type === "sun" || n.type === "canvas" || n.type === "label") return;
    seen[n.name] = true;
    out.push(n.name);
  });
  (alltags ? Object.keys(alltags()) : []).forEach(function (t) {
    if (!seen["#" + t]) {
      seen["#" + t] = true;
      out.push("#" + t);
    }
  });
  return out;
}

function condkeyof(text) {
  var t = (text || "").toLowerCase();
  if (t.indexOf("collid") >= 0) return "collide";
  if (t.indexOf("touch") >= 0) return "touch";
  if (t.indexOf("click") >= 0) return "click";
  if (t.indexOf("off screen") >= 0) return "off";
  if (t.indexOf("exist") >= 0) return "exists";
  if (t.indexOf("timer") >= 0) return "timer";
  return "collide";
}

function dokeyof(text) {
  var t = (text || "").toLowerCase();
  if (t.indexOf("add") >= 0 && t.indexOf("life") >= 0) return "addlife";
  if (t.indexOf("remove") >= 0 || (t.indexOf("life") >= 0 && t.indexOf("add") < 0)) return "life";
  if (t.indexOf("set") >= 0 && t.indexOf("variable") >= 0) return "setvar";
  if (t.indexOf("add") >= 0 && t.indexOf("variable") >= 0) return "addvar";
  if (t.indexOf("sound") >= 0) return "sound";
  if (t.indexOf("destroy") >= 0) return "destroy";
  if (t.indexOf("spawn") >= 0) return "spawn";
  if (t.indexOf("scene") >= 0) return "scene";
  if (t.indexOf("lose") >= 0) return "lose";
  if (t.indexOf("win") >= 0) return "win";
  if (t.indexOf("add") >= 0) return "addscore";
  return "addscore";
}

function eventtoform(e) {
  var d = { obj: e.obj || "", cond: condkeyof(e.when), do: dokeyof(e.do), value: 1, target: "Score", sound: "Coin", scene: "", spawn: "", ands: (e.and || []).slice(0) };
  var m = (e.do || "").match(/(\d+)/);
  if (m) d.value = parseInt(m[1], 10);
  m = (e.do || "").match(/play\s+sound\s+(.+)$/i);
  if (m) d.sound = m[1].trim();
  m = (e.do || "").match(/to\s+(.+)$/i);
  if (m && d.do === "addscore") d.target = m[1].trim();
  m = (e.do || "").match(/go\s+to\s+scene\s+(.+)$/i);
  if (m) d.scene = m[1].trim();
  m = (e.do || "").match(/spawn\s+(.+)$/i);
  if (m) d.spawn = m[1].trim();
  return d;
}

function formtoevent(d) {
  var con = eventconds.filter(function (c) {
    return c.key === d.cond;
  })[0] || eventconds[0];
  var when = "When " + (d.obj || "object") + " " + con.label;
  var act = "";
  if (d.do === "addscore") act = "Add " + d.value + " to " + (d.target || "Score");
  else if (d.do === "addvar") act = "Add " + d.value + " to variable " + (d.target || "Score");
  else if (d.do === "setvar") act = "Set variable " + (d.target || "Score") + " to " + d.value;
  else if (d.do === "life") act = "Remove " + d.value + " life";
  else if (d.do === "addlife") act = "Add " + d.value + " life";
  else if (d.do === "sound") act = "Play sound " + (d.sound || "Coin");
  else if (d.do === "destroy") act = "Destroy it";
  else if (d.do === "spawn") act = "Spawn " + (d.spawn || "Coin");
  else if (d.do === "scene") act = "Go to scene " + (d.scene || "");
  else if (d.do === "lose") act = "Lose the game";
  else act = "Win the game";
  return { when: when, do: act, obj: d.obj, and: d.ands.slice(0) };
}

function eventsheetnow() {
  var sheet = null;
  app.project.eventsheets.forEach(function (s) {
    if (s.name === app.scene.eventsheet) sheet = s;
  });
  if (!sheet) {
    sheet = { id: newid("ev"), name: app.scene.eventsheet || "Main events", events: [] };
    app.project.eventsheets.push(sheet);
  }
  if (!sheet.events) sheet.events = [];
  return sheet;
}

function evtform(d) {
  var objs = eventobjectlist();
  var vars = ["Score"].concat((app.project.globals || []).map(function (g) {
    return g.name;
  }));
  var scenes = app.project.scenes.map(function (s) {
    return s.name;
  });
  var html = '<div class="evtform">';
  html += '<div class="frow"><div class="flabel">Object</div><div class="fctrl"><select class="inp" data-ef="obj">' + objs.map(function (o) {
    return '<option value="' + esc(o) + '"' + (d.obj === o ? " selected" : "") + ">" + esc(o) + "</option>";
  }).join("") + "</select></div></div>";
  html += '<div class="frow"><div class="flabel">Condition</div><div class="fctrl"><select class="inp" data-ef="cond">' + eventconds.map(function (c) {
    return '<option value="' + c.key + '"' + (d.cond === c.key ? " selected" : "") + ">When it " + esc(c.label) + "</option>";
  }).join("") + "</select></div></div>";
  html += '<div class="frow"><div class="flabel">Also true</div><div class="fctrl"><div class="andlist">' + (d.ands.length ? d.ands.map(function (a, i) {
    return '<span class="pill andpill">' + esc(a) + '<button class="iconbtn" data-andel="' + i + '">' + ic("x", "ico-xs") + "</button></span>";
  }).join("") : '<span class="tiny dim">No extra conditions</span>') + "</div></div></div>";
  html += '<div class="frow"><div class="flabel">Add condition</div><div class="fctrl"><select class="inp" data-eaddand><option value="">Choose…</option>' +
    '<option value="score">Score is at least 5</option><option value="scorel">Score below 3</option><option value="lives">Lives at most 1</option></select></div></div>';
  html += '<div class="setsep"></div>';
  html += '<div class="frow"><div class="flabel">Action</div><div class="fctrl"><select class="inp" data-ef="do">' + eventdos.map(function (a) {
    return '<option value="' + a.key + '"' + (d.do === a.key ? " selected" : "") + ">" + esc(a.label) + "</option>";
  }).join("") + "</select></div></div>";
  if (d.do === "addscore" || d.do === "addvar" || d.do === "setvar" || d.do === "life" || d.do === "addlife") {
    html += '<div class="frow"><div class="flabel">Amount</div><div class="fctrl"><input class="inp num" type="number" min="0" max="999" value="' + d.value + '" data-ef="value"></div></div>';
  }
  if (d.do === "addscore" || d.do === "addvar" || d.do === "setvar") {
    html += '<div class="frow"><div class="flabel">Variable</div><div class="fctrl"><select class="inp" data-ef="target">' + vars.map(function (v) {
      return '<option value="' + esc(v) + '"' + (d.target === v ? " selected" : "") + ">" + esc(v) + "</option>";
    }).join("") + "</select></div></div>";
  }
  if (d.do === "sound") {
    html += '<div class="frow"><div class="flabel">Sound</div><div class="fctrl"><select class="inp" data-ef="sound">' + soundnames.map(function (s) {
      return '<option value="' + s + '"' + (d.sound === s ? " selected" : "") + ">" + s + "</option>";
    }).join("") + "</select></div></div>";
  }
  if (d.do === "scene") {
    html += '<div class="frow"><div class="flabel">Scene</div><div class="fctrl"><select class="inp" data-ef="scene">' + scenes.map(function (s) {
      return '<option value="' + esc(s) + '"' + (d.scene === s ? " selected" : "") + ">" + esc(s) + "</option>";
    }).join("") + "</select></div></div>";
  }
  if (d.do === "spawn") {
    html += '<div class="frow"><div class="flabel">Spawn</div><div class="fctrl"><select class="inp" data-ef="spawn">' + objs.map(function (o) {
      return '<option value="' + esc(o) + '"' + (d.spawn === o ? " selected" : "") + ">" + esc(o) + "</option>";
    }).join("") + "</select></div></div>";
  }
  var preview = formtoevent(d);
  html += '<div class="evtpreview">' + ic("events", "ico-sm") + "<div><div><b>When</b> " + esc(preview.when.replace(/^When\s+/, "")) + (d.ands.length ? " <span class=\"pill andpill\">and " + d.ands.length + " more</span>" : "") + "</div><div><b>Do</b> " + esc(preview.do) + "</div></div></div>";
  html += "</div>";
  return html;
}

function openeventedit(index) {
  var sheet = eventsheetnow();
  var existing = index >= 0 ? sheet.events[index] : null;
  var draft = existing ? eventtoform(existing) : { obj: eventobjectlist()[0] || "", cond: "collide", do: "addscore", value: 1, target: "Score", sound: "Coin", scene: app.project.scenes[0] ? app.project.scenes[0].name : "", spawn: "Coin", ands: [] };
  var ref = openmodal({
    title: existing ? "Edit event" : "New event",
    icon: "events",
    width: "wide",
    body: '<div id="evtformhost">' + evtform(draft) + "</div>",
    footer: '<button class="btn" data-mact="cancel">Cancel</button>' + (existing ? '<button class="btn danger" data-mact="remove">Delete</button>' : "") + '<button class="btn primary" data-mact="save">Save event</button>',
    onmount: function (modal, scrim) {
      function rerender() {
        var host = modal.querySelector("#evtformhost");
        if (host) host.innerHTML = evtform(draft);
      }
      modal.addEventListener("change", function (ev) {
        var el = ev.target;
        if (el.hasAttribute("data-ef")) {
          var f = el.getAttribute("data-ef");
          draft[f] = el.type === "number" ? parseFloat(el.value) || 0 : el.value;
          rerender();
        } else if (el.hasAttribute("data-eaddand")) {
          var key = el.value;
          if (key === "score") draft.ands.push("Score is at least 5");
          if (key === "scorel") draft.ands.push("Score below 3");
          if (key === "lives") draft.ands.push("Lives at most 1");
          rerender();
        }
      });
      modal.addEventListener("click", function (ev) {
        var b = ev.target.closest("[data-andel]");
        if (!b) return;
        draft.ands.splice(+b.getAttribute("data-andel"), 1);
        rerender();
      });
      scrim.addEventListener("mact", function () {});
    },
    actions: {
      cancel: function (m, s) {
        closemodal(s);
      },
      remove: function (m, s) {
        sheet.events.splice(index, 1);
        sheet.count = sheet.events.length;
        closemodal(s);
        eventschanged();
      },
      save: function (m, s) {
        var val = formtoevent(draft);
        if (index >= 0) sheet.events[index] = val;
        else sheet.events.unshift(val);
        sheet.count = sheet.events.length;
        closemodal(s);
        eventschanged();
      }
    }
  });
}

function eventschanged() {
  app.docstamp = (app.docstamp || 0) + 1;
  saveprojects();
  commit("event");
  renderdocs(true);
  renderdock();
  toast("Event sheet updated", "ok");
}

acts.eventedit = function (el) {
  openeventedit(+el.getAttribute("data-index"));
};

acts.eventdup = function (el) {
  var sheet = eventsheetnow();
  var i = +el.getAttribute("data-index");
  var copy = JSON.parse(JSON.stringify(sheet.events[i]));
  sheet.events.splice(i, 0, copy);
  sheet.count = sheet.events.length;
  eventschanged();
};

acts.eventadd = function () {
  openeventedit(-1);
};

acts.eventundo = function () {
  undostep();
};

acts.toolmarquee = function () {
  app.transformmode = "marquee";
  toast("Marquee select: drag a box in the viewport", "ok");
  renderdock();
};

acts.toggleortho = function () {
  app.cam.ortho = !app.cam.ortho;
  if (app.cam.ortho) {
    app.cam.mode = "front";
    app.cam.halfw = app.cam.dist * 0.42;
    toast("2D orthographic view", "ok");
  } else {
    app.cam.mode = "persp";
    toast("3D perspective view", "ok");
  }
  commit("cam");
  renderdock();
};

acts.toggletouch = function () {
  app.touch = !app.touch;
  if (game) buildtouch();
  toast(app.touch ? "Touch controls on" : "Touch controls off", "ok");
};

function condpass(e) {
  if (!e.and || !e.and.length) return true;
  return e.and.every(function (t) {
    var m = t.match(/score\s+is\s+at\s+least\s+(-?\d+)/i);
    if (m) return !!game && game.score >= +m[1];
    m = t.match(/score\s+below\s+(-?\d+)/i);
    if (m) return !!game && game.score < +m[1];
    m = t.match(/lives\s+at\s+most\s+(\d+)/i);
    if (m) return !!game && game.lives <= +m[1];
    return true;
  });
}

function buildtouch() {
  var ui = qs("#playui");
  if (!ui) return;
  var old = qs("#playtouch");
  if (old) old.remove();
  if (!app.touch && !("ontouchstart" in window)) return;
  var pad = document.createElement("div");
  pad.id = "playtouch";
  pad.innerHTML = '<div class="touchpad"><button class="tbtn" data-tkey="ArrowLeft">' + ic("chevl") + '</button><button class="tbtn" data-tkey="ArrowRight">' + ic("chevr") + '</button></div><div class="touchjump"><button class="tbtn jump" data-tkey="Space">' + ic("arrowup") + "</button></div>";
  ui.appendChild(pad);
  pad.querySelectorAll("[data-tkey]").forEach(function (b) {
    var key = b.getAttribute("data-tkey");
    function on(ev) {
      ev.preventDefault();
      if (!game) return;
      game.keys[key] = true;
      b.classList.add("on");
    }
    function off(ev) {
      ev.preventDefault();
      if (!game) return;
      game.keys[key] = false;
      b.classList.remove("on");
    }
    b.addEventListener("pointerdown", on);
    b.addEventListener("pointerup", off);
    b.addEventListener("pointercancel", off);
    b.addEventListener("pointerleave", off);
  });
}

function acts_publishbuild(onbuild) {}

function b64utf8(str) {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch (err) {
    return "";
  }
}

function gamenameclean(name) {
  return (name || "game").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "game";
}

function buildgame() {
  var used = {};
  var objs = [];
  walk(app.scene.objects, function (n) {
    if (n.type === "camera" || n.type === "sun" || n.type === "canvas" || n.type === "label" || n.type === "empty") return;
    var size = nodesize(n);
    var src = "";
    if (n.type === "sprite" && n.sprite) {
      src = n.sprite.indexOf("custom:") === 0 ? customasseturl(n.sprite) : arturln(n.sprite);
      used[n.sprite] = src;
    }
    objs.push({
      n: n.name,
      t: n.type,
      s: n.sprite || "",
      p: n.pos,
      q: n.rot || [0, 0, 0],
      z: n.scl,
      c: n.color || "#c8ccd4",
      o: n.opacity === undefined ? 1 : n.opacity,
      w: size[0],
      h: size[1],
      d: size[2],
      b: (n.behaviors || []).map(function (b) {
        return { speed: b.speed === undefined ? 1 : b.speed, range: b.range === undefined ? 1.5 : b.range };
      })
    });
  });
  var sheet = null;
  app.project.eventsheets.forEach(function (s) {
    if (s.name === app.scene.eventsheet) sheet = s;
  });
  var data = {
    name: app.project.name,
    sky: (app.scene.env && app.scene.env.color) || "#c5e4ff",
    ground: (app.scene.env && app.scene.env.bgtype) || "color",
    cam: { yaw: app.cam.yaw, pitch: app.cam.pitch, dist: app.cam.dist, target: app.cam.target.slice(0), fov: app.cam.fov || 38, ortho: !!app.cam.ortho, halfw: app.cam.halfw || app.cam.dist * 0.42 },
    objects: objs,
    sprites: used,
    events: sheet ? sheet.events || [] : [],
    gravity: (app.project.graphics && app.project.graphics.gravity) || 23,
    start: app.project.name,
    lives: 3
  };
  var json = JSON.stringify(data);
  var rt = [
    "(function(){",
    "var D = window.__level;",
    "var cv = document.getElementById('c');",
    "var ctx = cv.getContext('2d');",
    "var W = 800, H = 600, DPR = 1;",
    "var imgs = {};",
    "for (var k in D.sprites) { var im = new Image(); im.src = D.sprites[k]; imgs[k] = im; }",
    "function fit(){ DPR = Math.min(2, window.devicePixelRatio || 1); W = cv.clientWidth || window.innerWidth; H = cv.clientHeight || window.innerHeight; cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); ctx.setTransform(DPR, 0, 0, DPR, 0, 0); }",
    "window.addEventListener('resize', fit);",
    "fit();",
    "var C = D.cam;",
    "var tanh = Math.tan((C.fov * Math.PI / 180) / 2);",
    "function sub(a,b){return [a[0]-b[0],a[1]-b[1],a[2]-b[2]];}",
    "function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}",
    "function norm(a){var l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l];}",
    "function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}",
    "var cp = Math.cos(C.pitch);",
    "var eye = [C.target[0] + Math.sin(C.yaw) * cp * C.dist, C.target[1] + Math.sin(C.pitch) * C.dist, C.target[2] + Math.cos(C.yaw) * cp * C.dist];",
    "var fwd = norm(sub(C.target, eye));",
    "var right = norm(cross(fwd, [0,1,0]));",
    "var up = cross(right, fwd);",
    "function view(p){ var d = sub(p, eye); return [dot(d,right), dot(d,up), dot(d,fwd)]; }",
    "function proj(p){ var v = view(p); if (v[2] < 0.05) return null; if (C.ortho) { var hw = C.halfw; return { x: (v[0]/hw*0.5+0.5)*W, y: (0.5 - v[1]/hw*0.5*W/H)*H, z: v[2], s: W/(2*hw) }; } var f = (H/2)/tanh; return { x: (v[0]/(v[2]*tanh*(W/H))*0.5+0.5)*W, y: (0.5 - v[1]/(v[2]*tanh)*0.5)*H, z: v[2], s: f/v[2] }; }",
    "var hero = null, coins = [], hearts = [], hazards = [], plats = [], goal = null, decor = [];",
    "var movers = [];",
    "D.objects.forEach(function(o){",
    "  if (o.s === 'hero') hero = o;",
    "  else if (o.s === 'coin') coins.push(o);",
    "  else if (o.s === 'heart') hearts.push(o);",
    "  else if (o.s === 'spikes' || o.s === 'slime' || o.n.toLowerCase().indexOf('enemy') >= 0) hazards.push(o);",
    "  else if (o.n.toLowerCase().indexOf('goal') >= 0 || o.s === 'flag') goal = o;",
    "  else if (o.t === 'box' || o.t === 'cube' || o.t === 'plane' || o.t === 'terrain') plats.push(o);",
    "  else decor.push(o);",
    "  if (o.b && o.b.length) movers.push({ o: o, base: o.p.slice(0), t: Math.random() * 6 });",
    "});",
    "var g = { x: hero ? hero.p[0] : 0, y: hero ? hero.p[1] : 1, vy: 0, face: 1, ground: false, score: 0, lives: D.lives, status: 'play', time: 0, got: {}, inv: 0, start: [hero ? hero.p[0] : 0, hero ? hero.p[1] : 1] };",
    "var hw = hero ? hero.w / 2 : 0.3, hh = hero ? hero.h / 2 : 0.45;",
    "var keys = {};",
    "window.addEventListener('keydown', function(e){ keys[e.code] = true; if (e.code === 'Space') e.preventDefault(); if (e.code === 'KeyR') restart(); });",
    "window.addEventListener('keyup', function(e){ keys[e.code] = false; });",
    "function restart(){ g.x = g.start[0]; g.y = g.start[1]; g.vy = 0; g.score = 0; g.lives = D.lives; g.status = 'play'; g.got = {}; g.inv = 0; msg(''); hud(); }",
    "function msg(t){ var el = document.getElementById('msg'); el.innerHTML = t; el.style.display = t ? 'block' : 'none'; }",
    "function hud(){ document.getElementById('score').textContent = 'Score: ' + g.score; var l = ''; for (var i = 0; i < g.lives; i++) l += '<span class=hp></span>'; document.getElementById('lives').innerHTML = l; }",
    "function act(text){",
    "  var m = text.match(/add\\s+(\\d+)\\s+to\\s+(.+)$/i);",
    "  if (m) { g.score += parseInt(m[1], 10); hud(); return; }",
    "  m = text.match(/remove\\s+(\\d+)\\s+life/i);",
    "  if (m) { g.lives = Math.max(0, g.lives - parseInt(m[1], 10)); hud(); if (!g.lives) { g.status = 'lost'; msg('Game over<br><small>Press R to restart</small>'); } return; }",
    "  m = text.match(/add\\s+(\\d+)\\s+life/i);",
    "  if (m) { g.lives = Math.min(9, g.lives + parseInt(m[1], 10)); hud(); return; }",
    "  if (/destroy/i.test(text)) return;",
    "  m = text.match(/go\\s+to\\s+scene\\s+(.+)$/i);",
    "  if (m) { msg('Scene ' + m[1] + '<br><small>Press R to restart</small>'); return; }",
    "  if (/win/i.test(text)) { g.status = 'won'; msg('You win!<br><small>Score ' + g.score + ' · press R to restart</small>'); return; }",
    "  if (/lose/i.test(text)) { g.status = 'lost'; msg('Game over<br><small>Press R to restart</small>'); }",
    "}",
    "function fire(kind, node){",
    "  D.events.forEach(function(e){",
    "    if (e.and && e.and.length) { var ok = e.and.every(function(t){ var m = t.match(/lives\\s+at\\s+most\\s+(\\d+)/i); if (m) return g.lives <= +m[1]; m = t.match(/score\\s+is\\s+at\\s+least\\s+(\\d+)/i); if (m) return g.score >= +m[1]; m = t.match(/score\\s+below\\s+(\\d+)/i); if (m) return g.score < +m[1]; return true; }); if (!ok) return; }",
    "    var ob = e.obj || '';",
    "    if (kind === 'coin' && /coin/i.test(ob)) act(e.do);",
    "    else if (kind === 'hazard' && /hazard|enemy|spike|slime/i.test(ob)) act(e.do);",
    "    else if (kind === 'heart' && /heart/i.test(ob)) act(e.do);",
    "    else if (kind === 'goal' && /goal|flag/i.test(ob)) act(e.do);",
    "  });",
    "}",
    "function boxfaces(o){",
    "  var w = o.w/2, h = o.h/2, d = o.d/2;",
    "  var ry = (o.q[1] || 0) * Math.PI / 180;",
    "  var c = Math.cos(ry), s = Math.sin(ry);",
    "  var pts = [];",
    "  [[-w,-h,-d],[w,-h,-d],[w,h,-d],[-w,h,-d],[-w,-h,d],[w,-h,d],[w,h,d],[-w,h,d]].forEach(function(p){",
    "    var x = p[0]*c + p[2]*s; var z = -p[0]*s + p[2]*c;",
    "    pts.push(proj([o.p[0]+x, o.p[1]+p[1], o.p[2]+z]));",
    "  });",
    "  return pts;",
    "}",
    "function shade(hex, k){",
    "  if (!hex || hex.charAt(0) !== '#') return '#c8ccd4';",
    "  var n = parseInt(hex.slice(1), 16);",
    "  var r = Math.min(255, ((n >> 16) & 255) * k), gg = Math.min(255, ((n >> 8) & 255) * k), b = Math.min(255, (n & 255) * k);",
    "  return 'rgb(' + Math.round(r) + ',' + Math.round(gg) + ',' + Math.round(b) + ')';",
    "}",
    "function poly(pts, fill){ if (pts.some(function(p){ return !p; })) return; ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y); for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); }",
    "function tick(dt){",
    "  g.time += dt;",
    "  g.inv = Math.max(0, g.inv - dt);",
    "  movers.forEach(function(m){ m.t += dt; var b = m.o.b[0] || { speed: 1, range: 1.5 }; m.o.p[0] = m.base[0] + Math.sin(m.t * (b.speed || 1)) * (b.range || 1.5); });",
    "  if (g.status !== 'play') return;",
    "  var left = keys.ArrowLeft || keys.KeyA, right = keys.ArrowRight || keys.KeyD, jump = keys.Space || keys.ArrowUp || keys.KeyW;",
    "  var speed = 5.4;",
    "  g.x += ((right ? 1 : 0) - (left ? 1 : 0)) * speed * dt;",
    "  if (right) g.face = 1; if (left) g.face = -1;",
    "  g.x = Math.max(-9.5, Math.min(9.5, g.x));",
    "  if (jump && g.ground) { g.vy = 9.4; g.ground = false; }",
    "  g.vy -= D.gravity * dt;",
    "  g.y += g.vy * dt;",
    "  g.ground = false;",
    "  plats.forEach(function(o){",
    "    var top = o.p[1] + o.h/2, half = o.w/2;",
    "    if (g.x + hw > o.p[0] - half && g.x - hw < o.p[0] + half) {",
    "      if (g.vy <= 0 && g.y - hh <= top + 0.12 && g.y - hh > top - 0.9) { g.y = top + hh; g.vy = 0; g.ground = true; }",
    "    }",
    "  });",
    "  if (g.y < -8) { g.y = 6; g.vy = 0; }",
    "  coins.forEach(function(o){",
    "    if (g.got[o.n]) return;",
    "    if (Math.hypot(o.p[0]-g.x, o.p[1]-(g.y+0.1)) < 0.72) { g.got[o.n] = 1; fire('coin', o); }",
    "  });",
    "  hearts.forEach(function(o){",
    "    if (g.got[o.n]) return;",
    "    if (Math.hypot(o.p[0]-g.x, o.p[1]-g.y) < 0.7) { g.got[o.n] = 1; g.lives = Math.min(9, g.lives+1); hud(); fire('heart', o); }",
    "  });",
    "  if (g.inv <= 0) hazards.forEach(function(o){",
    "    if (Math.abs(o.p[0]-g.x) < o.w*0.35 + hw && Math.abs(o.p[1]-g.y) < o.h*0.4 + hh*0.8) {",
    "      var before = g.lives;",
    "      fire('hazard', o);",
    "      g.inv = 1.2;",
    "      if (g.lives === before) { g.lives--; hud(); }",
    "      if (!g.lives) { g.status = 'lost'; msg('Game over<br><small>Press R to restart</small>'); }",
    "    }",
"  });",
    "  if (goal && Math.abs(goal.p[0]-g.x) < goal.w*0.5 + hw && Math.abs(goal.p[1]-g.y) < goal.h*0.6 + hh) {",
    "    fire('goal', goal);",
    "    if (g.status === 'play') { g.status = 'won'; msg('You win!<br><small>Score ' + g.score + ' · press R to restart</small>'); }",
    "  }",
    "}",
    "function drawbg(){",
    "  var grad = ctx.createLinearGradient(0, 0, 0, H);",
    "  grad.addColorStop(0, D.sky);",
    "  grad.addColorStop(1, '#ffffff');",
    "  ctx.fillStyle = grad;",
    "  ctx.fillRect(0, 0, W, H);",
    "}",
    "function drawobj(o){",
    "  if (o.t === 'sprite') {",
    "    var p = proj([o.p[0], o.p[1], o.p[2]]);",
    "    if (!p || !imgs[o.s] || !imgs[o.s].complete) return;",
    "    var w = o.w * p.s, h = o.h * p.s;",
    "    ctx.globalAlpha = o.o;",
    "    if (o.s === 'coin') { ctx.save(); ctx.translate(p.x, p.y); ctx.scale(Math.abs(Math.cos(g.time*4))*0.85+0.15, 1); ctx.drawImage(imgs[o.s], -w/2, -h/2, w, h); ctx.restore(); }",
    "    else if (o.s === 'hero') { ctx.save(); ctx.translate(p.x, p.y); ctx.scale(g.face, 1); ctx.drawImage(imgs[o.s], -w/2, -h/2, w, h); ctx.restore(); }",
    "    else ctx.drawImage(imgs[o.s], p.x - w/2, p.y - h/2, w, h);",
    "    ctx.globalAlpha = 1;",
    "    return;",
    "  }",
    "  var pts = boxfaces(o);",
    "  poly([pts[4], pts[5], pts[6], pts[7]], shade(o.c, 1.08));",
    "  poly([pts[0], pts[1], pts[5], pts[4]], shade(o.c, 0.62));",
    "  poly([pts[1], pts[2], pts[6], pts[5]], shade(o.c, 0.82));",
    "}",
    "var last = 0;",
    "function frame(t){",
    "  var dt = Math.min(0.05, (t - last) / 1000 || 0.016);",
    "  last = t;",
    "  tick(dt);",
    "  drawbg();",
    "  var list = decor.concat(plats).concat(coins).concat(hearts).concat(hazards);",
    "  if (goal) list.push(goal);",
    "  list.push({ t: 'sprite', s: 'hero', p: [g.x, g.y, hero ? hero.p[2] : 0.8], w: hero ? hero.w : 1, h: hero ? hero.h : 1, o: g.inv > 0 && Math.floor(g.time * 14) % 2 ? 0.45 : 1, q: [0,0,0] });",
    "  list.forEach(function(o){ var v = view([o.p[0], o.p[1], o.p[2]]); o.__z = v[2]; });",
    "  list.sort(function(a, b){ return b.__z - a.__z; });",
    "  list.forEach(drawobj);",
    "  requestAnimationFrame(frame);",
    "}",
    "hud();",
    "msg('');",
    "requestAnimationFrame(frame);",
    "})();"
  ].join("\n");
  var css = [
    "html,body{margin:0;height:100%;overflow:hidden;background:" + (app.scene.env && app.scene.env.color ? app.scene.env.color : "#c5e4ff") + ";font-family:system-ui,-apple-system,'Segoe UI',sans-serif;touch-action:none}",
    "#c{display:block;width:100vw;height:100vh}",
    "#hud{position:fixed;left:18px;top:14px;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.45);pointer-events:none}",
    "#score{font-weight:800;font-size:24px;letter-spacing:.3px}",
    "#lives{display:flex;gap:5px;margin-top:6px}",
    ".hp{width:20px;height:20px;display:block;background:#e8503a;border-radius:3px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)}",
    "#msg{position:fixed;inset:0;display:none;align-items:center;justify-content:center;text-align:center;color:#fff;font-weight:800;font-size:44px;text-shadow:0 6px 24px rgba(0,0,0,.5);background:rgba(12,14,18,.42);pointer-events:none;padding:24px}",
    "#msg small{font-size:17px;font-weight:600;opacity:.9}",
    "#pad{position:fixed;left:0;right:0;bottom:0;display:flex;justify-content:space-between;padding:18px 22px;pointer-events:none}",
    "#pad button{pointer-events:auto;width:62px;height:62px;border-radius:50%;border:0;background:rgba(255,255,255,.32);backdrop-filter:blur(6px);color:#fff;font-size:24px;font-weight:800;margin-left:10px}",
    "#pad button:active{background:rgba(255,255,255,.55)}",
    "@media (hover:hover) and (pointer:fine){#pad{display:none}}"
  ].join("");
  var pad = '<div id="pad"><div><button data-k="ArrowLeft">&#8592;</button><button data-k="ArrowRight">&#8594;</button></div><div><button data-k="Space">&#9650;</button></div></div>';
  var html = "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no\"><title>" + esc(data.name) + "</title><style>" + css + "</style></head><body><canvas id=\"c\"></canvas><div id=\"hud\"><div id=\"score\">Score: 0</div><div id=\"lives\"></div></div><div id=\"msg\"></div>" + pad + "<script>window.__level=" + json + ";<\/script><script>" + rt + "<\/script><script>(function(){var k={};document.querySelectorAll('#pad button').forEach(function(b){var c=b.getAttribute('data-k');function on(e){e.preventDefault();window.dispatchEvent(new KeyboardEvent('keydown',{code:c}));b.classList.add('on');}function off(e){e.preventDefault();window.dispatchEvent(new KeyboardEvent('keyup',{code:c}));b.classList.remove('on');}b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('pointerleave',off);});})();<\/script></body></html>";
  return html;
}

function downloadgame() {
  var html = buildgame();
  var blob = new Blob([html], { type: "text/html" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = gamenameclean(app.project.name) + ".html";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(function () {
    URL.revokeObjectURL(url);
  }, 4000);
  toast("Downloaded " + a.download + " · open it in any browser", "ok");
}

acts.publish = function () {
  var size = 0;
  var html = "";
  try {
    html = buildgame();
    size = Math.round(html.length / 1024);
  } catch (err) {
    toast("Build failed: " + err.message, "bad");
    return;
  }
  var ref = openmodal({
    title: "Publish game",
    icon: "sparkle",
    width: "narrow",
    body: '<div style="font-size:12.5px;color:var(--text-2);line-height:1.7">' + ic("check", "ico-sm") + " <b>" + esc(app.project.name) + "</b> is ready to build for the web.</div>" +
      '<div class="setsec" style="margin-top:12px"><div class="sethead">' + ic("file", "ico-sm") + '<span>Build output</span></div><div class="setbody">' +
      '<div class="setrow"><div class="setlabel">Single HTML file</div><div class="setctrl"><span class="pill">' + size + ' KB</span></div></div>' +
      '<div class="setrow"><div class="setlabel">Scenes</div><div class="setctrl"><span class="pill">' + app.project.scenes.length + "</span></div></div>" +
      '<div class="setrow"><div class="setlabel">Events</div><div class="setctrl"><span class="pill">' + (eventsheetnow().events || []).length + "</span></div></div>" +
      '<div class="setrow"><div class="setlabel">Sprites</div><div class="setctrl"><span class="pill">' + Object.keys(spriteinfo).length + "</span></div></div>" +
      "</div></div>" +
      '<div class="setsec"><div class="sethead">' + ic("globe", "ico-sm") + '<span>Options</span></div><div class="setbody">' +
      '<div class="setrow"><div class="setlabel">Touch controls</div><div class="setctrl">' + check("", true, "checked") + "</div></div>" +
      '<div class="setrow"><div class="setlabel">Game name</div><div class="setctrl"><input class="inp" value="' + esc(app.project.name) + '" data-buildname></div></div>' +
      "</div></div>" +
      '<div class="tiny dim" style="margin-top:10px">The build is fully offline: it embeds every sprite, the level, the physics and the event sheet in one file.</div>',
    footer: '<button class="btn" data-mact="close">Close</button><button class="btn primary" data-mact="build">' + ic("download", "ico-sm") + "Download build</button>",
    actions: {
      close: function (m, s) {
        closemodal(s);
      },
      build: function (m, s) {
        var inp = m.querySelector("[data-buildname]");
        if (inp && inp.value.trim()) app.project.name = inp.value.trim();
        closemodal(s);
        downloadgame();
      }
    }
  });
};

acts.assetrename = function (el) {
  var kind = el.getAttribute("data-kind");
  var id = el.getAttribute("data-id");
  var item = assetfind(kind, id);
  if (!item) return;
  promptbox("Rename", item.name, function (v) {
    item.name = v;
    commit("rename");
    renderdocs(true);
    renderdock();
    toast("Renamed", "ok");
  });
};

acts.assignmat = function (el) {
  assignmaterial(el.getAttribute("data-id"));
};

acts.assignanim = function (el) {
  assignanim(el.getAttribute("data-id"));
};

acts.animaddframe = function (el) {
  var item = assetfind("anim", el.getAttribute("data-id"));
  var sel = qs("[data-animframe]");
  if (!item || !sel) return;
  item.frames.push(sel.value);
  commit("anim");
  renderdocs(true);
};

acts.animdelframe = function (el) {
  var item = assetfind("anim", el.getAttribute("data-id"));
  if (!item) return;
  item.frames.splice(+el.getAttribute("data-index"), 1);
  commit("anim");
  renderdocs(true);
};

acts.timelineplay = function (el) {
  playtimeline(el.getAttribute("data-id"));
};

acts.trackadd = function (el) {
  var item = assetfind("timeline", el.getAttribute("data-id"));
  var sel = qs("[data-trackobj]");
  if (!item || !sel) return;
  var node = findnode(app.scene.objects, sel.value);
  if (!node) return;
  item.tracks.push({ id: node.id, name: node.name, keys: [{ time: 0, x: node.pos[0], y: node.pos[1], z: node.pos[2] }, { time: 1, x: node.pos[0] + 2, y: node.pos[1], z: node.pos[2] }] });
  commit("track");
  renderdocs(true);
};

acts.trackdel = function (el) {
  var item = assetfind("timeline", el.getAttribute("data-id"));
  if (!item) return;
  item.tracks.splice(+el.getAttribute("data-index"), 1);
  commit("track");
  renderdocs(true);
};

acts.keyadd = function (el) {
  var item = assetfind("timeline", el.getAttribute("data-id"));
  if (!item) return;
  var t = item.tracks[+el.getAttribute("data-ti")];
  var last = t.keys[t.keys.length - 1] || { time: 0, x: 0, y: 0, z: 0 };
  t.keys.push({ time: Math.round((last.time + 1) * 10) / 10, x: last.x, y: last.y, z: last.z });
  commit("key");
  renderdocs(true);
};

acts.keydel = function (el) {
  var item = assetfind("timeline", el.getAttribute("data-id"));
  if (!item) return;
  var t = item.tracks[+el.getAttribute("data-ti")];
  t.keys.splice(+el.getAttribute("data-ki"), 1);
  commit("key");
  renderdocs(true);
};

acts.langadd = function (el) {
  var item = assetfind("loc", el.getAttribute("data-id"));
  if (!item) return;
  promptbox("Language code", "fr", function (v) {
    item.langs.push({ code: v.toLowerCase(), name: v.toUpperCase() });
    commit("lang");
    renderdocs(true);
  });
};

acts.langdel = function (el) {
  var item = assetfind("loc", el.getAttribute("data-id"));
  if (!item || item.langs.length < 2) return;
  item.langs.splice(+el.getAttribute("data-index"), 1);
  commit("lang");
  renderdocs(true);
};

acts.locadd = function (el) {
  var item = assetfind("loc", el.getAttribute("data-id"));
  if (!item) return;
  promptbox("Text key", "subtitle", function (v) {
    item.keys.push({ key: v, values: {} });
    commit("loc");
    renderdocs(true);
  });
};

acts.locdel = function (el) {
  var item = assetfind("loc", el.getAttribute("data-id"));
  if (!item) return;
  item.keys.splice(+el.getAttribute("data-index"), 1);
  commit("loc");
  renderdocs(true);
};

acts.achadd = function (el) {
  var item = assetfind("services", el.getAttribute("data-id"));
  if (!item) return;
  promptbox("Achievement", "Finish level 1", function (v) {
    item.achievements.push({ name: v, done: false });
    commit("ach");
    renderdocs(true);
  });
};

acts.achdel = function (el) {
  var item = assetfind("services", el.getAttribute("data-id"));
  if (!item) return;
  item.achievements.splice(+el.getAttribute("data-index"), 1);
  commit("ach");
  renderdocs(true);
};

acts.tablecoladd = function (el) {
  var item = assetfind("table", el.getAttribute("data-id"));
  if (!item) return;
  item.cols.push("Column " + (item.cols.length + 1));
  item.rows.forEach(function (r) {
    r.push("");
  });
  commit("table");
  renderdocs(true);
};

acts.tablerowadd = function (el) {
  var item = assetfind("table", el.getAttribute("data-id"));
  if (!item) return;
  item.rows.push(item.cols.map(function () {
    return "";
  }));
  commit("table");
  renderdocs(true);
};

acts.tablerowdel = function (el) {
  var item = assetfind("table", el.getAttribute("data-id"));
  if (!item) return;
  item.rows.splice(+el.getAttribute("data-index"), 1);
  commit("table");
  renderdocs(true);
};

acts.sheetpick = function (el) {
  var item = assetfind("sheet", el.getAttribute("data-id"));
  if (!item) return;
  var input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = function () {
    var f = input.files && input.files[0];
    if (!f) return;
    var fr = new FileReader();
    fr.onload = function () {
      item.data = fr.result;
      item.name = f.name.replace(/\.[a-z0-9]+$/i, "");
      commit("sheet");
      renderdocs(true);
      toast("Sprite sheet loaded", "ok");
    };
    fr.readAsDataURL(f);
  };
  input.click();
};

acts.sheetframes = function (el) {
  var item = assetfind("sheet", el.getAttribute("data-id"));
  if (!item) return;
  var host = qs("#sheetframes");
  if (host) host.innerHTML = sheetframehtml(item);
  commit("sheet");
};

acts.modellib = function () {
  openmenu(modellib.map(function (m) {
    return { label: m.label, icon: m.icon, act: "addmodel:" + m.key };
  }), window.innerWidth / 2 - 120, 140, {
    onact: function (name) {
      addmodel(name.split(":")[1]);
    }
  });
};

acts.addmodel = function (el) {
  addmodel(el.getAttribute("data-key"));
};

function buildlibrarypage(host) {
  host.innerHTML = '<div class="codetabsbar"><div class="crumb">' + ic("cube", "ico-sm") + '<span class="semibold">Model library</span><span class="pill">' + modellib.length + " models</span></div></div>" +
    '<div class="docscroll"><div class="assetgrid" style="padding:14px">' + modellib.map(function (m) {
      return '<button class="acard" data-act="addmodel" data-key="' + m.key + '"><span class="thumb">' + ic(m.icon, "ico-xl") + '</span><span class="nm">' + esc(m.label) + "</span></button>";
    }).join("") + "</div></div>";
}

function openaddobject(cb) {
  app.addobjcb = cb || null;
  var groups = [
    { head: "Shapes", items: ["cube", "sphere", "plane", "capsule", "cylinder", "cone", "torus"] },
    { head: "Objects", items: ["empty", "terrain", "water", "curve", "text3d", "camera", "tilemap", "model"] },
    { head: "UI", items: ["canvas", "label", "button", "slider", "bar", "joystick"] },
    { head: "Models", items: modellib.map(function (m) {
      return "model:" + m.key;
    }) },
    { head: "Sprites", items: spriteassets().map(function (s) {
      return "sprite:" + s.key;
    }) }
  ];
  if (typeof addgroups === "function") {
    var extra = addgroups();
    for (var gi = 0; gi < extra.length; gi++) groups.push(extra[gi]);
  }
  var body = '<div class="searchbox mb8">' + ic("search", "ico-sm") + '<input data-autofocus placeholder="Search..."></div><div class="picklist" id="addlist">';
  groups.forEach(function (g) {
    body += '<div class="pickgroup">' + g.head + "</div>";
    g.items.forEach(function (it) {
      var label;
      var icon;
      if (it.indexOf("sprite:") === 0) {
        var key = it.slice(7);
        label = spriteinfo[key].name;
        icon = sceneicon("sprite", key);
      } else if (it.indexOf("model:") === 0) {
        var m = modellibfind(it.slice(6));
        label = m ? m.label : it;
        icon = m ? m.icon : "cube";
      } else {
        label = nodemeta[it].label;
        icon = nodemeta[it].icon;
      }
      body += '<button class="pickitem" data-addtype="' + esc(it) + '"><span class="ico">' + ic(icon, "ico-sm") + '</span><span class="t">' + esc(label) + "</span></button>";
    });
  });
  body += "</div>";
  var ref = openmodal({
    title: "Add object",
    icon: "plus",
    body: body,
    onmount: function (modal) {
      var search = modal.querySelector("input");
      search.addEventListener("input", function () {
        var q = search.value.toLowerCase();
        modal.querySelectorAll("[data-addtype]").forEach(function (b) {
          b.style.display = b.textContent.toLowerCase().indexOf(q) >= 0 ? "" : "none";
        });
      });
      modal.addEventListener("click", function (ev) {
        var b = ev.target.closest("[data-addtype]");
        if (!b) return;
        var type = b.getAttribute("data-addtype");
        closemodal(ref.scrim);
        if (type.indexOf("model:") === 0) {
          var m = modellibfind(type.slice(6));
          if (!m) return;
          var made = m.build();
          made.name = uniqueid(app.scene.objects, made.name);
          var t0 = app.cam.target;
          made.pos = [Math.round(t0[0] * 10) / 10, Math.max(0, Math.round(t0[1] * 10) / 10), 0];
          if (app.addobjcb) {
            var cbm = app.addobjcb;
            app.addobjcb = null;
            cbm(made);
          } else {
            app.scene.objects.push(made);
            app.selid = made.id;
            app.selids = [made.id];
            commit("addmodel");
          }
          return;
        }
        var node;
        if (typeof featactor === "function" && featactor(type)) return;
        if (type.indexOf("sprite:") === 0) {
          var sp = type.slice(7);
          node = basenode("sprite", { name: spriteinfo[sp].name, sprite: sp, pos: [0, 0.2, 0] });
        } else {
          node = basenode(type, { pos: [0, 1, 0] });
        }
        var target = app.cam.target;
        node.pos = [Math.round(target[0] * 10) / 10, Math.max(0.4, Math.round(target[1] * 10) / 10), 0];
        if (app.addobjcb) {
          var cb2 = app.addobjcb;
          app.addobjcb = null;
          cb2(node);
        } else {
          app.scene.objects.push(node);
          node.name = uniqueid(app.scene.objects, node.name);
          app.selid = node.id;
          app.selids = [node.id];
          commit("add");
        }
      });
    }
  });
}

function doctitle(d) {
  if (d.kind === "scene") return { title: "Scene", icon: "scene" };
  if (d.kind === "settings") return { title: "Project settings", icon: "sliders" };
  if (d.kind === "assets") return { title: "Free assets", icon: "grid" };
  if (d.kind === "library") return { title: "Model library", icon: "cube" };
  if (d.kind === "script") {
    var s = null;
    app.project.scripts.forEach(function (x) {
      if (x.id === d.id) s = x;
    });
    return { title: s ? s.name : "Script", icon: "script" };
  }
  if (d.kind === "events") {
    var e = null;
    app.project.eventsheets.forEach(function (x) {
      if (x.id === d.id) e = x;
    });
    return { title: e ? e.name : "Events", icon: "events" };
  }
  var kinds = { mat: ["material", "material"], shader: ["shader", "shader"], anim: ["animator", "animator"], timeline: ["timeline", "timeline"], loc: ["globe", "loc"], services: ["services", "services"], table: ["table", "table"], sheet: ["grid", "sheet"] };
  if (kinds[d.kind]) {
    var it = assetfind(d.kind, d.id);
    return { title: it ? it.name : kinds[d.kind][1], icon: kinds[d.kind][0] };
  }
  return { title: d.kind, icon: "file" };
}

acts.opendoc = function (el) {
  opendoc(el.getAttribute("data-kind"), el.getAttribute("data-id"));
};

acts.newmodeldoc = function () {
  opendoc("library", null);
};

function addassetactions() {
  var map = {
    openmat: "mat",
    openshader: "shader",
    openanim: "anim",
    opentimeline: "timeline",
    openloc: "loc",
    openservices: "services",
    opentable: "table",
    opensheet: "sheet"
  };
  Object.keys(map).forEach(function (k) {
    acts[k] = function (el) {
      var id = el.getAttribute("data-id");
      var store = assetstore(map[k]);
      if (!id || !assetfind(map[k], id)) {
        if (store.length) id = store[0].id;
        else id = makeasset(map[k], assetlabel(map[k])).id;
      }
      opendoc(map[k], id);
    };
  });
}

addassetactions();

acts.fileopen = function (el) {
  var fid = el.getAttribute("data-fid") || "";
  if (fid.indexOf("ass:") === 0) {
    var parts = fid.split(":");
    opendoc(parts[1], parts[2]);
    return;
  }
  filepreview(fid);
};

acts.openlibrary = function () {
  opendoc("library", null);
};
