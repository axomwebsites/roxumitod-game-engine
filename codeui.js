var codekeywords = ["function", "let", "const", "var", "return", "if", "else", "for", "while", "export", "import", "from", "new", "this", "class", "true", "false", "null", "undefined", "switch", "case", "break", "continue", "await", "async", "try", "catch"];

function escapehtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function highlightcode(src) {
  var tokenre = new RegExp("(\"[^\"\\n]*\"|'[^'\\n]*'|`[^`]*`)|(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)|(\\b\\d+(?:\\.\\d+)?\\b)|\\b(" + codekeywords.join("|") + ")\\b|\\b([A-Za-z_$][\\w$]*)\\s*(?=\\()", "g");
  var out = "";
  var last = 0;
  var m;
  while ((m = tokenre.exec(src))) {
    out += escapehtml(src.slice(last, m.index));
    if (m[1]) out += '<span class="tok-str">' + escapehtml(m[1]) + "</span>";
    else if (m[2]) out += '<span class="tok-com">' + escapehtml(m[2]) + "</span>";
    else if (m[3]) out += '<span class="tok-num">' + escapehtml(m[3]) + "</span>";
    else if (m[4]) out += '<span class="tok-key">' + escapehtml(m[4]) + "</span>";
    else if (m[5]) out += '<span class="tok-fn">' + escapehtml(m[5]) + "</span>";
    last = tokenre.lastIndex;
  }
  out += escapehtml(src.slice(last));
  return out;
}

function synccode(host) {
  var scriptid = host.getAttribute("data-script");
  var sc = null;
  app.project.scripts.forEach(function (s) {
    if (s.id === scriptid) sc = s;
  });
  if (!sc) return;
  var pre = host.querySelector(".codehigh");
  var ta = host.querySelector(".codearea");
  var gut = host.querySelector(".gutter");
  var val = ta.value;
  pre.innerHTML = highlightcode(val) + "\n";
  var lines = val.split("\n").length;
  var nums = [];
  for (var i = 1; i <= lines; i++) nums.push(i);
  gut.textContent = nums.join("\n");
  sc.code = val;
  if (typeof codetouch === "function") codetouch(scriptid);
  pre.scrollTop = ta.scrollTop;
  pre.scrollLeft = ta.scrollLeft;
  gut.scrollTop = ta.scrollTop;
}

function buildcodepage(host, script) {
  host.innerHTML = '<div class="codetabsbar"><div class="crumb">' + ic("script", "ico-sm") + '<span class="dim">Scripts</span>' + ic("chevr", "ico-xs") + '<span class="crumbname">' + esc(script.name) + '</span><span class="pill">' + esc(script.kind) + '</span></div><button class="btn sm" data-act="snippets">' + ic("sparkle", "ico-sm") + 'Snippets</button><button class="btn sm" data-act="apimenu">' + ic("book", "ico-sm") + 'API</button></div>' +
    '<div class="editorwrap"><div class="gutter"></div><div class="codewrap"><pre class="codehigh"></pre><textarea class="codearea" spellcheck="false"></textarea></div></div>' +
    '<div class="codefoot">' + ["-&gt;", "(", ")", "[", "]", "{", "}", ";", "=", "\"", "'", "&lt;", "&gt;", "/", "{ }", "( )", "[ ]", ".", "!", "&amp;", "|"].map(function (k) {
      return '<button class="k" data-insert="' + esc(k) + '">' + k + "</button>";
    }).join('<span class="gap"></span>') + "</div>";
  host.setAttribute("data-script", script.id);
  var ta = host.querySelector(".codearea");
  ta.value = script.code || "";
  ta.addEventListener("input", function () {
    synccode(host);
  });
  ta.addEventListener("scroll", function () {
    var pre = host.querySelector(".codehigh");
    var gut = host.querySelector(".gutter");
    pre.scrollTop = ta.scrollTop;
    pre.scrollLeft = ta.scrollLeft;
    gut.scrollTop = ta.scrollTop;
  });
  ta.addEventListener("keydown", function (ev) {
    if (ev.key === "Tab") {
      ev.preventDefault();
      var start = ta.selectionStart;
      var end = ta.selectionEnd;
      ta.value = ta.value.slice(0, start) + "  " + ta.value.slice(end);
      ta.selectionStart = ta.selectionEnd = start + 2;
      synccode(host);
    }
  });
  host.querySelectorAll("[data-insert]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var txt = btn.getAttribute("data-insert").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&");
      var start = ta.selectionStart;
      var end = ta.selectionEnd;
      ta.value = ta.value.slice(0, start) + txt + ta.value.slice(end);
      ta.focus();
      ta.selectionStart = ta.selectionEnd = start + txt.length;
      synccode(host);
    });
  });
  synccode(host);
}

var snippetlist = [
  { label: "Function", code: "function name() {\n  \n}\n" },
  { label: "If statement", code: "if (condition) {\n  \n}\n" },
  { label: "For loop", code: "for (let i = 0; i < count; i++) {\n  \n}\n" },
  { label: "Log to console", code: "console.log(value);\n" },
  { label: "Find object", code: "let entity = game.find(\"Player\");\n" },
  { label: "Play sound", code: "game.play(\"Coin\");\n" },
  { label: "Set UI text", code: "game.setui(\"ScoreText\", \"Score: \" + score);\n" },
  { label: "On collision", code: "function onCollision(other, collision) {\n  \n}\n" }
];

var apilist = [
  { label: "entity.position", code: "entity.position" },
  { label: "entity.rotation", code: "entity.rotation" },
  { label: "entity.scale", code: "entity.scale" },
  { label: "entity.visible", code: "entity.visible" },
  { label: "entity.destroy()", code: "entity.destroy()" },
  { label: "game.find(name)", code: "game.find(\"\")" },
  { label: "game.spawn(name, x, y)", code: "game.spawn(\"Coin\", 0, 0)" },
  { label: "game.setui(name, text)", code: "game.setui(\"ScoreText\", \"\")" },
  { label: "game.score", code: "game.score" },
  { label: "input.pressed(key)", code: "input.pressed(\"Space\")" },
  { label: "input.axis(x, y)", code: "input.axis(\"ArrowLeft\", \"ArrowRight\")" },
  { label: "helpers.clamp(v, min, max)", code: "helpers.clamp(value, 0, 1)" }
];

function opensnippets() {
  openmenu(snippetlist.map(function (s) {
    return { label: s.label, icon: "code", act: "insertsnippet:" + encodeURIComponent(s.code) };
  }), window.innerWidth / 2, 120, { onact: function (name) { insertsnippet(decodeURIComponent(name.split(":")[1])); } });
}

function openapi() {
  openmenu(apilist.map(function (s) {
    return { label: s.label, icon: "book", act: "insertapi:" + encodeURIComponent(s.code) };
  }), window.innerWidth / 2, 120, { onact: function (name) { insertsnippet(decodeURIComponent(name.split(":")[1])); } });
}

function insertsnippet(text) {
  var ta = qs("#docs .docpage:not(.hide) .codearea");
  if (!ta) return;
  var start = ta.selectionStart;
  var end = ta.selectionEnd;
  ta.value = ta.value.slice(0, start) + text + ta.value.slice(end);
  ta.focus();
  ta.selectionStart = ta.selectionEnd = start + text.length;
  synccode(ta.closest(".docpage"));
}
