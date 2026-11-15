var launchview = "templates";

function renderlauncher(kind) {
  launchview = kind || launchview || "templates";
  var el = qs("#launcher");
  if (!el) return;
  var navs = [
    { id: "projects", label: "Projects", icon: "folder" },
    { id: "templates", label: "Templates", icon: "grid" },
    { id: "learn", label: "Learn", icon: "trophy" }
  ];
  var html = '<aside class="launchside"><div class="brand"><span class="t">Roxumitod Game Engine</span><span class="s" style="display:block;font-size:11px;opacity:.55;margin-top:2px">Unreal-style editor · v5 feature set</span></div>';
  navs.forEach(function (n) {
    html += '<button class="navitem' + (launchview === n.id ? " on" : "") + '" data-act="launchview" data-view="' + n.id + '">' + ic(n.icon) + "<span>" + n.label + "</span></button>";
  });
  html += '<div class="bottom"><button class="navitem" data-act="installapp">' + ic("download") + "<span>Install app</span></button><button class=\"navitem\" data-act=\"launcherhelp\">" + ic("help") + "<span>Help</span></button></div></aside>";
  html += '<main class="launchmain">';
  if (launchview === "templates") {
    html += "<h1>New project</h1>";
    html += '<div class="tgrid">';
    templates.forEach(function (t) {
      html += '<button class="tcard" data-act="newproject" data-tpl="' + t.id + '"><img class="shot" src="' + templateurl(t.id) + '" alt=""><span class="meta"><div class="name">' + esc(t.name) + '</div><div class="desc">' + esc(t.desc) + "</div></span></button>";
    });
    html += "</div>";
  } else if (launchview === "projects") {
    html += '<div class="projectsrow"><h1 style="margin:0">Projects</h1><button class="btn primary" data-act="launchview" data-view="templates" style="margin-left:auto">' + ic("plus", "ico-sm") + "New project</button></div>";
    if (!app.projects.length) {
      html += '<div class="emptystate" style="text-align:left">No projects yet. Open Templates to create your first project.</div>';
    } else {
      html += '<div class="tgrid">';
      app.projects.forEach(function (p) {
        var tpl = templateor(p.template);
        var dt = new Date(p.updated || p.created || Date.now());
        html += '<div class="tcard" style="cursor:default"><button data-act="openproject" data-id="' + esc(p.id) + '" style="display:block;width:100%;text-align:left"><img class="shot" src="' + templateurl(tpl.id) + '" alt=""><span class="meta"><div class="name">' + esc(p.name) + '</div><div class="desc">' + plural(p.scenes ? p.scenes.length : 1, "scene") + " · edited " + esc(dt.toLocaleDateString()) + "</div></span></button>" +
          '<div class="row" style="padding:0 13px 12px;gap:6px"><button class="btn sm" data-act="openproject" data-id="' + esc(p.id) + '">Open</button><button class="btn sm ghost right" data-act="deleteproject" data-id="' + esc(p.id) + '" title="Delete">' + ic("trash", "ico-sm") + "</button></div></div>";
      });
      html += "</div>";
    }
  } else {
    html += "<h1>Learn</h1>";
    var cards = [
      { t: "Your first game", icon: "playcircle", act: "learnfirst" },
      { t: "Keep score and win", icon: "star", act: "learnscore" },
      { t: "Documentation", icon: "book", act: "learndocs" }
    ];
    cards.forEach(function (c) {
      html += '<button class="learncard" data-act="' + c.act + '"><span class="circle">' + ic(c.icon) + '</span><span class="t">' + esc(c.t) + '</span><span class="chevr">' + ic(c.act === "learndocs" ? "chevr" : "play", "ico-sm") + "</span></button>";
    });
  }
  html += "</main>";
  el.innerHTML = html;
  el.classList.remove("hide");
}

function openprojectbyid(id) {
  var key = String(id);
  var found = null;
  for (var i = 0; i < app.projects.length; i++) {
    if (String(app.projects[i].id) === key) {
      found = app.projects[i];
      break;
    }
  }
  if (!found) {
    toast("That project is no longer in this browser", "err");
    renderlauncher("projects");
    return;
  }
  var existing = deep(found);
  if (!existing.scenes || !existing.scenes.length) existing.scenes = [emptyscene("Main")];
  var start = null;
  existing.scenes.forEach(function (s) {
    if (String(s.id) === String(existing.startscene)) start = s;
  });
  if (!start) start = existing.scenes[0];
  app.project = existing;
  app.sceneid = start.id;
  app.scene = start;
  app.selid = null;
  app.selids = [];
  app.undolist = [];
  app.redolist = [];
  app.closedsecs = {};
  openeditor();
  savesession();
}


function createnewproject(tplid) {
  var p = makeproject(tplid);
  app.project = p;
  app.projects.unshift(p);
  app.sceneid = p.scenes[0].id;
  app.scene = p.scenes[0];
  app.selid = null;
  app.undolist = [];
  app.redolist = [];
  saveprojects();
  openeditor();
  toast("Created " + p.name, "ok");
}
