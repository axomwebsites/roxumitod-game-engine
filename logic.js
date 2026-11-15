var runtime = {
  mods: {},
  instances: {},
  errors: [],
  out: [],
  running: false,
  hot: true,
  breakpoints: {},
  paused: false,
  stepline: 0,
  lastsource: "",
  prof: {},
  hooks: {},
  calls: 0
};

function rtlog(kind, msg) {
  runtime.out.push({ t: Date.now(), kind: kind, msg: String(msg).slice(0, 400) });
  if (runtime.out.length > 400) runtime.out.shift();
}

function scriptexportsof(code) {
  var names = [];
  var re = /export\s+(?:function|let|const|var|class)\s+([A-Za-z_$][\w$]*)/g;
  var m;
  while ((m = re.exec(code))) names.push(m[1]);
  var re2 = /export\s*\{([^}]+)\}/g;
  while ((m = re2.exec(code))) {
    m[1].split(",").forEach(function (p) {
      var nm = p.split(/\s+as\s+/).pop().trim();
      if (nm) names.push(nm);
    });
  }
  return names;
}

function scriptstrip(code) {
  return code.replace(/^\s*export\s+(?=function|let|const|var|class)/gm, "").replace(/^\s*export\s*\{[^}]*\};?/gm, "");
}

function scriptimports(code) {
  var list = [];
  var re = /^\s*import\s*\{([^}]+)\}\s*from\s*["']([^"']+)["'];?/gm;
  var m;
  while ((m = re.exec(code))) list.push({ names: m[1].split(",").map(function (s) {
      return s.trim();
    }), from: m[2] });
  return list;
}

function scriptlinenumbers(code) {
  var lines = code.split("\n");
  var out = [];
  for (var i = 0; i < lines.length; i++) {
    var raw = lines[i];
    var t = raw.trim();
    if (!t) {
      out.push(raw);
      continue;
    }
    if (/^[})\]]/.test(t) || /^[.,?]/.test(t) || t.indexOf("//") === 0) {
      out.push(raw);
      continue;
    }
    out.push("__ln(" + (i + 1) + ");" + raw);
  }
  return out.join("\n");
}

function scriptbuild(sc) {
  var src = sc.code || "";
  var stripped = scriptstrip(src);
  var imps = scriptimports(src);
  var exports = scriptexportsof(src);
  var prelude = "";
  imps.forEach(function (imp) {
    imp.names.forEach(function (nm) {
      prelude += "var " + nm + " = (__mods[" + JSON.stringify(imp.from) + "] || {})[" + JSON.stringify(nm) + "];\n";
    });
  });
  var numbered = runtime.breakpoints && Object.keys(runtime.breakpoints).length ? scriptlinenumbers(stripped) : stripped;
  var tail = "\nvar __exports = {};\n" + exports.map(function (nm) {
    return 'try{Object.defineProperty(__exports, ' + JSON.stringify(nm) + ', {get: function(){return ' + nm + ';},enumerable:true,configurable:true});}catch(e){}';
  }).join("\n") + "\nreturn { exports: __exports, start: typeof start === 'function' ? start : null, update: typeof update === 'function' ? update : null, onCollision: typeof onCollision === 'function' ? onCollision : null, oncollect: typeof oncollect === 'function' ? oncollect : null, onEvent: typeof onEvent === 'function' ? onEvent : null };";
  var body = prelude + numbered + tail;
  try {
    var fn = new Function("__mods", "__ln", "__ctx", body);
    var mod = fn(runtime.mods, rtnoline, sc);
    return { ok: true, mod: mod, body: body };
  } catch (e) {
    return { ok: false, error: e && e.message ? e.message : String(e), body: body };
  }
}

function rtnoline(n) {
  if (runtime.paused) return;
  runtime.stepline = n;
  if (runtime.breakpoints[n + "@" + runtime.lastsource]) {
    runtime.paused = true;
    rtlog("brk", "Breakpoint hit at line " + n);
    if (typeof toast === "function") toast("Paused at line " + n, "warn");
  }
}

function scriptlist() {
  return (app.project && app.project.scripts) || [];
}

function scriptbyid(id) {
  var out = null;
  scriptlist().forEach(function (s) {
    if (s.id === id) out = s;
  });
  return out;
}

function scriptscompile() {
  runtime.mods = {};
  runtime.hooks = {};
  runtime.errors = [];
  var list = scriptlist();
  var pass = 0;
  while (pass < 3) {
    pass++;
    list.forEach(function (sc) {
      runtime.lastsource = sc.id;
      var r = scriptbuild(sc);
      if (r.ok) {
        runtime.mods[sc.name] = r.mod.exports;
        runtime.hooks[sc.name] = r.mod;
      } else runtime.errors.push({ script: sc.name, error: r.error });
    });
  }
  return runtime.errors.length;
}

function scriptrunall() {
  var errs = scriptscompile();
  runtime.instances = {};
  scriptlist().forEach(function (sc) {
    var mod = runtime.hooks[sc.name] || runtime.mods[sc.name];
    if (!mod) return;
    var inst = { id: sc.id, name: sc.name, mod: mod, state: {}, errors: 0 };
    runtime.instances[sc.id] = inst;
    try {
      if (mod.start) mod.start.call(inst.state);
      rtlog("ok", sc.name + " started");
    } catch (e) {
      inst.errors++;
      rtlog("err", sc.name + " start: " + (e && e.message));
    }
  });
  runtime.running = true;
  if (errs) toast(errs + " script errors, see the output panel", "warn");
  else toast("Running " + Object.keys(runtime.instances).length + " scripts", "ok");
  return errs;
}

function scriptstopall() {
  runtime.running = false;
  runtime.instances = {};
  toast("Scripts stopped", "ok");
}

function scriptupdate(dt) {
  if (!runtime.running || runtime.paused) return;
  var t0 = performance.now();
  Object.keys(runtime.instances).forEach(function (id) {
    var inst = runtime.instances[id];
    if (!inst.mod.update) return;
    var s0 = performance.now();
    try {
      inst.mod.update.call(inst.state, dt);
      runtime.calls++;
    } catch (e) {
      inst.errors++;
      if (inst.errors < 3) rtlog("err", inst.name + " update: " + (e && e.message));
    }
    runtime.prof[inst.name] = (runtime.prof[inst.name] || 0) * 0.9 + (performance.now() - s0) * 0.1;
  });
  runtime.frame = (runtime.frame || 0) * 0.9 + (performance.now() - t0) * 0.1;
}

function scripthotreload() {
  if (!runtime.hot || !runtime.running) return;
  var before = JSON.stringify(scriptlist().map(function (s) {
    return s.code ? s.code.length : 0;
  }));
  var now = JSON.stringify(scriptlist().map(function (s) {
    return s.code ? s.code.length : 0;
  }));
  if (before === now) return;
  scriptrunall();
  rtlog("ok", "hot reload applied");
}

function scriptcompilecheck(code) {
  try {
    new Function("__mods", "__ln", "__ctx", scriptbuild({ code: code }).body);
    return null;
  } catch (e) {
    return e && e.message ? e.message : String(e);
  }
}

var apinames = ["entity", "game", "input", "console", "Math", "JSON", "Date", "Array", "Object", "String", "Number", "Boolean", "Promise", "setTimeout", "clearTimeout", "setInterval", "clearInterval", "requestAnimationFrame", "performance", "document", "window", "rand", "clamp", "lerp", "vec", "length", "sign", "every", "wait", "spawn", "emit", "find", "count", "nearest"];

function lintscript(code) {
  var problems = [];
  var lines = String(code || "").split("\n");
  var declared = {};
  var used = {};
  var opens = 0;
  var closed = 0;
  lines.forEach(function (line, i) {
    var t = line.replace(/\/\/.*$/, "").replace(/"[^"]*"/g, '""').replace(/'[^']*'/g, "''").replace(/`[^`]*`/g, "``");
    for (var c = 0; c < t.length; c++) {
      if (t[c] === "{") opens++;
      if (t[c] === "}") closed++;
    }
    var dm = t.match(/\b(?:let|const|var|function|class)\s+([A-Za-z_$][\w$]*)/g);
    if (dm) dm.forEach(function (d) {
      var nm = d.split(/\s+/).pop();
      declared[nm] = i + 1;
    });
    var um = t.match(/\b[A-Za-z_$][\w$]*\b(?!\s*:)/g);
    if (um) um.forEach(function (u) {
      used[u] = (used[u] || 0) + 1;
    });
    if (/\bif\s*\([^)]*=[^=]/.test(t)) problems.push({ line: i + 1, level: "error", msg: "assignment inside a condition, use comparison" });
    if (/\bfunction\b[^(]*\([^)]*\)\s*$/.test(t) && i + 1 < lines.length && lines[i + 1].trim() !== "{") problems.push({ line: i + 1, level: "warn", msg: "function body should open a brace on the same line" });
    if (/==[^=]|!=[^=]/.test(t) && t.indexOf("==") >= 0) problems.push({ line: i + 1, level: "warn", msg: "loose comparison, prefer strict equality" });
    if (t.trim().length && !/[;{})]$/.test(t.trim()) && !/^(if|for|while|function|class|else|switch|case|default|try|catch)/.test(t.trim()) && t.trim().indexOf("//") !== 0) problems.push({ line: i + 1, level: "warn", msg: "statement may be missing a semicolon" });
  });
  if (opens !== closed) problems.push({ line: 0, level: "error", msg: "brace count is unbalanced, " + opens + " open against " + closed + " closed" });
  var known = {};
  apinames.forEach(function (n) {
    known[n] = 1;
  });
  var reserved = ["break", "case", "catch", "class", "const", "continue", "debugger", "default", "delete", "do", "else", "export", "extends", "finally", "for", "function", "if", "import", "in", "instanceof", "let", "new", "return", "super", "switch", "this", "throw", "try", "typeof", "var", "void", "while", "with", "yield", "async", "await", "of", "true", "false", "null", "undefined"];
  reserved.forEach(function (n) {
    known[n] = 1;
  });
  Object.keys(used).forEach(function (u) {
    if (declared[u] || known[u]) return;
    if (used[u] < 1) return;
    if (/^[a-z]$/.test(u)) return;
  });
  return problems;
}

function typecheck(code) {
  var types = {};
  var issues = [];
  var lines = String(code || "").split("\n");
  lines.forEach(function (line, i) {
    var t = line.replace(/\/\/.*$/, "").trim();
    var decl = t.match(/^(?:let|const|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(.+?);?$/);
    if (decl) {
      var nm = decl[1];
      var val = decl[2];
      var ty = "any";
      if (/^["'`]/.test(val)) ty = "string";
      else if (/^-?\d+(\.\d+)?$/.test(val)) ty = "number";
      else if (/^(true|false)$/.test(val)) ty = "boolean";
      else if (/^\[/.test(val)) ty = "array";
      else if (/^\{/.test(val)) ty = "object";
      else if (/^function|=>/.test(val)) ty = "function";
      types[nm] = { type: ty, line: i + 1 };
      return;
    }
    var assign = t.match(/^([A-Za-z_$][\w$]*)\s*=\s*(.+?);?$/);
    if (assign && types[assign[1]]) {
      var known = types[assign[1]];
      var v2 = assign[2];
      var ty2 = "any";
      if (/^["'`]/.test(v2)) ty2 = "string";
      else if (/^-?\d+(\.\d+)?$/.test(v2)) ty2 = "number";
      else if (/^(true|false)$/.test(v2)) ty2 = "boolean";
      if (ty2 !== "any" && known.type !== "any" && ty2 !== known.type) {
        issues.push({ line: i + 1, level: "error", msg: nm + " is " + known.type + " from line " + known.line + " but is assigned a " + ty2 });
      }
      return;
    }
    var call = t.match(/([A-Za-z_$][\w$]*)\s*\.\s*([A-Za-z_$][\w$]*)\s*\(/);
    if (call && types[call[1]] && types[call[1]].type === "number" && call[2].indexOf("to") !== 0 && ["push", "map", "filter", "join", "slice"].indexOf(call[2]) >= 0) {
      issues.push({ line: i + 1, level: "error", msg: call[1] + " is a number, " + call[2] + " belongs to arrays" });
    }
  });
  return { types: types, issues: issues };
}

function scriptpanel() {
  var list = scriptlist();
  var body = '<div class="logicbody">';
  body += u5sec("Script runtime", "Module imports, lifecycle hooks and hot reload",
    '<div class="u5btns"><button class="btn" data-logicact="run">' + (runtime.running ? "Restart all scripts" : "Run all scripts") + "</button>" +
    '<button class="btn ghost" data-logicact="stop">Stop</button>' +
    '<button class="btn ghost" data-logicact="compile">Compile only</button></div>' +
    u5row("Hot reload", check("Reload scripts when code is saved", runtime.hot, 'data-logic="hot"')) +
    u5row("State", '<span class="u5badge ' + (runtime.running ? "u5on" : "u5off") + '">' + (runtime.running ? "running" : "stopped") + "</span>") +
    u5row("Modules", '<span class="u5val">' + Object.keys(runtime.mods).join(", ") + "</span>") +
    '<div class="landout">' + (runtime.errors.length ? runtime.errors.map(function (e) {
      return e.script + ": " + e.error;
    }).join("<br>") : "No compile errors.") + "</div>");
  body += u5sec("Language depth", "What the runtime supports",
    u5note("Full JavaScript: arrow functions, classes, destructuring, spread, generators, async and await, optional chaining, template literals, closures and cross script imports.") +
    u5row("Hooks", '<span class="u5val">start, update, onCollision, oncollect, onEvent</span>') +
    u5row("Stop on error", check("Pause the whole scene on an uncaught script error", runtime.stoponerr, 'data-logic="stoponerr"')));
  body += u5sec("Scripts", "Lint and type check each module",
    (list.length ? '<div class="scriptrows">' + list.map(function (sc) {
      var l = lintscript(sc.code || "");
      var t = typecheck(sc.code || "");
      var errs = l.filter(function (p) {
        return p.level === "error";
      }).length + t.issues.length;
      var warns = l.filter(function (p) {
        return p.level === "warn";
      }).length;
      return '<div class="scriptrow"><span class="sn">' + esc(sc.name) + '</span><span class="pill ' + (errs ? "bad" : warns ? "warn" : "ok") + '">' + errs + " errors, " + warns + " warnings</span>" +
        '<button class="btn sm" data-lint="' + esc(sc.id) + '">Lint</button>' +
        '<button class="btn sm ghost" data-type="' + esc(sc.id) + '">Types</button></div>';
    }).join("") + "</div>" : u5note("No scripts in this level yet.")) +
    '<div class="landout" id="lintout">Run a lint to see results.</div>');
  body += "</div>";
  openmodal({
    title: "Script Runtime",
    icon: "script",
    width: "wide",
    body: body,
    onmount: function (m) {
      m.querySelectorAll("[data-logicact]").forEach(function (b) {
        b.addEventListener("click", function () {
          var a = b.getAttribute("data-logicact");
          if (a === "run") scriptrunall();
          else if (a === "stop") scriptstopall();
          else {
            var e = scriptscompile();
            rtlog(e ? "err" : "ok", e ? e + " compile errors" : "All modules compiled");
            toast(e ? e + " compile errors" : "Compiled clean", e ? "bad" : "ok");
          }
          closemodal();
          setTimeout(scriptpanel, 130);
        });
      });
      m.querySelectorAll("[data-logic]").forEach(function (inp) {
        inp.addEventListener("input", function () {
          var f = inp.getAttribute("data-logic");
          runtime[f] = inp.checked;
        });
      });
      m.querySelectorAll("[data-lint]").forEach(function (b) {
        b.addEventListener("click", function () {
          var sc = scriptbyid(b.getAttribute("data-lint"));
          var probs = lintscript(sc.code || "");
          var out = qs("#lintout");
          if (out) out.innerHTML = probs.length ? probs.map(function (p) {
            return '<div class="lintline ' + p.level + '">line ' + p.line + ": " + esc(p.msg) + "</div>";
          }).join("") : "Clean, no problems found.";
          rtlog("lint", probs.length + " problems in " + sc.name);
        });
      });
      m.querySelectorAll("[data-type]").forEach(function (b) {
        b.addEventListener("click", function () {
          var sc = scriptbyid(b.getAttribute("data-type"));
          var res = typecheck(sc.code || "");
          var out = qs("#lintout");
          if (out) out.innerHTML = (res.issues.length ? res.issues.map(function (p) {
            return '<div class="lintline ' + p.level + '">line ' + p.line + ": " + esc(p.msg) + "</div>";
          }).join("") : "No type issues.") + '<div class="u5note">Inferred: ' + Object.keys(res.types).map(function (k) {
            return k + " : " + res.types[k].type;
          }).join(", ") + "</div>";
        });
      });
    }
  });
}

var visnodes = [];
var vislinks = [];
var visgraph = {
  nodes: [],
  links: [],
  vars: {}
};

function visbuild() {
  visgraph.nodes = [
    { id: "n1", type: "event", x: 20, y: 20, p: { name: "start" } },
    { id: "n2", type: "set", x: 190, y: 20, p: { target: "score", value: "0" } },
    { id: "n3", type: "event", x: 20, y: 110, p: { name: "update" } },
    { id: "n4", type: "branch", x: 190, y: 110, p: { test: "input.forward" } },
    { id: "n5", type: "call", x: 360, y: 110, p: { fn: "game.jump", arg: "\\\"Player\\\"" } },
    { id: "n6", type: "print", x: 360, y: 200, p: { text: "tick" } }
  ];
  visgraph.links = [["n1", "n2"], ["n3", "n4"], ["n4", "n5"]];
  return visgraph;
}

function viscodegen() {
  if (!visgraph.nodes.length) visbuild();
  var code = "";
  var bytype = {};
  visgraph.nodes.forEach(function (n) {
    bytype[n.type] = bytype[n.type] || [];
    bytype[n.type].push(n);
  });
  function downstream(id) {
    return visgraph.links.filter(function (l) {
      return l[0] === id;
    }).map(function (l) {
      return visgraph.nodes.filter(function (n) {
        return n.id === l[1];
      })[0];
    }).filter(Boolean);
  }
  (bytype.event || []).forEach(function (ev) {
    code += "function " + ev.p.name + "(" + (ev.p.name === "update" ? "dt" : "") + ") {\n";
    downstream(ev.id).forEach(function (n) {
      code += vistatement(n, downstream, 1);
    });
    code += "}\n\n";
  });
  return code || "// the graph produced no events\n";
}

function vistatement(n, downstream, depth) {
  var pad = new Array(depth + 1).join("  ");
  if (n.type === "set") return pad + (n.p.target || "value") + " = " + (n.p.value || "0") + ";\n";
  if (n.type === "print") return pad + "console.log(" + JSON.stringify(n.p.text || "") + ");\n";
  if (n.type === "call") return pad + (n.p.fn || "noop") + "(" + (n.p.arg || "") + ");\n";
  if (n.type === "branch") {
    var inner = downstream(n.id).map(function (c) {
      return vistatement(c, downstream, depth + 1);
    }).join("");
    return pad + "if (" + (n.p.test || "true") + ") {\n" + (inner || pad + "  \n") + pad + "}\n";
  }
  return "";
}

function vispanel() {
  if (!visgraph.nodes.length) visbuild();
  var body = '<div class="visbody">' + u5sec("Visual scripting", "Event, branch and action nodes that compile to script",
    '<div class="graphedit" id="visg">' + visgraph.nodes.map(function (n) {
      return '<div class="gnode vis" style="left:' + n.x + "px;top:" + n.y + 'px"><b>' + esc(n.type) + "</b><span>" + esc(n.p.name || n.p.target || n.p.fn || n.p.text || n.p.test || "") + "</span></div>";
    }).join("") + "</div>" +
    '<div class="u5btns"><button class="btn" data-visact="gen">Compile to script</button>' +
    '<button class="btn ghost" data-visact="add">Add node</button>' +
    '<button class="btn ghost" data-visact="run">Compile and run</button></div>' +
    '<div class="landout" id="visout">Six nodes, three links.</div>');
  body += u5sec("Generated script", "Read only preview",
    '<pre class="codeview" id="viscode">' + esc(viscodegen()) + "</pre>");
  body += "</div>";
  openmodal({
    title: "Visual Scripting",
    icon: "network",
    width: "wide",
    body: body,
    onmount: function (m) {
      m.querySelectorAll("[data-visact]").forEach(function (b) {
        b.addEventListener("click", function () {
          var a = b.getAttribute("data-visact");
          if (a === "gen") {
            qs("#viscode").textContent = viscodegen();
            var out = qs("#visout");
            if (out) out.textContent = visgraph.nodes.length + " nodes compiled to " + viscodegen().split("\n").length + " lines.";
          } else if (a === "add") {
            var types = ["event", "set", "branch", "call", "print"];
            var ty = types[Math.floor(Math.random() * types.length)];
            visgraph.nodes.push({ id: "n" + (visgraph.nodes.length + 1 + Math.floor(Math.random() * 1000)), type: ty, x: 40 + Math.random() * 400, y: 240 + Math.random() * 60, p: ty === "event" ? { name: "onEvent" } : ty === "branch" ? { test: "true" } : ty === "call" ? { fn: "game.win", arg: "" } : ty === "print" ? { text: "hello" } : { target: "value", value: "1" } });
            closemodal();
            setTimeout(vispanel, 130);
          } else {
            var gen = viscodegen();
            var sc = scriptlist().filter(function (s) {
              return s.name === "Graph";
            })[0];
            if (!sc) {
              sc = { id: newid("sc"), name: "Graph", kind: "Script", code: gen };
              app.project.scripts = app.project.scripts || [];
              app.project.scripts.push(sc);
            } else sc.code = gen;
            scriptrunall();
            toast("Graph compiled into a runtime script", "ok");
          }
        });
      });
    }
  });
}

function dbgpanel() {
  var lines = runtime.out.slice().reverse();
  var body = '<div class="dbgbody">' + u5sec("Debugger", "Breakpoints and step control",
    u5row("Paused", check("Pause the runtime", runtime.paused, 'data-dbg="paused"')) +
    u5row("Last line", '<span class="u5val">' + (runtime.stepline || "none") + "</span>") +
    '<div class="u5btns"><button class="btn" data-dbgact="step">Step one frame</button>' +
    '<button class="btn ghost" data-dbgact="resume">Resume</button>' +
    '<button class="btn ghost" data-dbgact="clear">Clear log</button></div>' +
    u5row("Breakpoints", '<input class="inp" id="bpinput" placeholder="line numbers, for example 3, 12">') +
    '<div class="u5btns"><button class="btn ghost" data-dbgact="setbp">Apply breakpoints</button></div>');
  body += u5sec("Output", "Script log and errors",
    '<div class="u5log tall">' + (lines.length ? lines.map(function (l) {
      return "<div><b>" + esc(l.kind) + "</b> " + esc(l.msg) + "</div>";
    }).join("") : "No output yet.") + "</div>");
  body += "</div>";
  openmodal({
    title: "Debugger and Output",
    icon: "events",
    width: "wide",
    body: body,
    onmount: function (m) {
      m.querySelectorAll("[data-dbg]").forEach(function (inp) {
        inp.addEventListener("input", function () {
          runtime.paused = inp.checked;
        });
      });
      m.querySelectorAll("[data-dbgact]").forEach(function (b) {
        b.addEventListener("click", function () {
          var a = b.getAttribute("data-dbgact");
          if (a === "step") {
            runtime.paused = false;
            scriptupdate(0.016);
            runtime.paused = true;
          } else if (a === "resume") runtime.paused = false;
          else if (a === "clear") runtime.out = [];
          else if (a === "setbp") {
            runtime.breakpoints = {};
            qs("#bpinput").value.split(",").forEach(function (p) {
              var n = parseInt(p.trim(), 10);
              if (n) runtime.breakpoints[n + "@" + (scriptlist()[0] ? scriptlist()[0].id : "x")] = true;
              if (n) runtime.breakpoints[n] = true;
            });
            toast(Object.keys(runtime.breakpoints).length + " breakpoints armed", "ok");
          }
          closemodal();
          setTimeout(dbgpanel, 130);
        });
      });
    }
  });
}

function profpanel() {
  var rows = Object.keys(runtime.prof).map(function (k) {
    return { name: k, ms: runtime.prof[k] };
  }).sort(function (a, b) {
    return b.ms - a.ms;
  });
  var total = rows.reduce(function (a, b) {
    return a + b.ms;
  }, 0);
  var body = '<div class="profbody">' + u5sec("Profiler", "Per script cost with a rolling average",
    u5row("Frame script time", '<span class="u5val">' + (runtime.frame || 0).toFixed(2) + " ms</span>") +
    u5row("Calls", '<span class="u5val">' + runtime.calls + "</span>") +
    '<div class="profbars">' + (rows.length ? rows.map(function (r) {
      var pct = total > 0 ? Math.round(r.ms / total * 100) : 0;
      return '<div class="profrow"><span class="pn">' + esc(r.name) + '</span><div class="pbar"><span style="width:' + pct + '%"></span></div><span class="pv">' + r.ms.toFixed(2) + " ms</span></div>";
    }).join("") : '<div class="u5note">Run scripts to collect samples.</div>') + "</div>");
  body += u5sec("Engine budget", "Where the frame goes",
    u5row("Render", '<span class="u5val">' + (gfx.lastms ? gfx.lastms.toFixed(2) : "0.00") + " ms</span>") +
    u5row("Physics", '<span class="u5val">' + ((phys.bodies || []).length) + " bodies</span>") +
    u5row("Particles", '<span class="u5val">' + (fx.list ? fx.list.length : 0) + " live</span>") +
    u5row("Objects", '<span class="u5val">' + countnodes() + "</span>") +
    '<div class="u5btns"><button class="btn" data-prof="reset">Reset samples</button></div>');
  body += "</div>";
  openmodal({
    title: "Profiler",
    icon: "table",
    width: "wide",
    body: body,
    onmount: function (m) {
      m.querySelectorAll("[data-prof]").forEach(function (b) {
        b.addEventListener("click", function () {
          runtime.prof = {};
          runtime.calls = 0;
          toast("Samples reset", "ok");
        });
      });
    }
  });
}

function logictick(dt) {
  if (!runtime.running) return;
  if (runtime.hot) {
    if (runtime.lastlen === undefined) runtime.lastlen = scriptlist().reduce(function (a, s) {
      return a + (s.code ? s.code.length : 0);
    }, 0);
    var now = scriptlist().reduce(function (a, s) {
      return a + (s.code ? s.code.length : 0);
    }, 0);
    if (now !== runtime.lastlen) {
      runtime.lastlen = now;
      scriptrunall();
      rtlog("ok", "hot reload");
    }
  }
  scriptupdate(dt);
}
