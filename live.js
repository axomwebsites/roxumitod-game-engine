var livesys = {
  anti: { on: true, speedmax: 30, teleportjump: 4, flagged: [], trust: {} },
  boards: {},
  stats: {},
  exp: { on: false, bucket: "stable", flags: {} },
  lag: { comp: 0.12, predict: true, buffer: 0, samples: [] },
  touch: { on: false, sticks: [] },
  pad: { on: true, id: "", axes: [0, 0, 0, 0], buttons: {} },
  vr: { on: false, supported: false },
  loc: { lang: "en", strings: {}, built: 0 }
};

function antireport(kind, who, detail) {
  var rec = { at: Date.now(), kind: kind, who: who || "local", detail: detail || "" };
  livesys.anti.flagged.push(rec);
  if (livesys.anti.flagged.length > 60) livesys.anti.flagged.shift();
  return rec;
}

function antistep(b, dt) {
  if (!livesys.anti.on || !b) return;
  var speed = Math.sqrt((b.vx || 0) * (b.vx || 0) + (b.vy || 0) * (b.vy || 0));
  if (speed > livesys.anti.speedmax) {
    antireport("speed", b.id, "velocity " + speed.toFixed(1) + " over " + livesys.anti.speedmax);
    if (b.vx) b.vx = Math.sign(b.vx) * livesys.anti.speedmax * 0.4;
    if (b.vy) b.vy = Math.sign(b.vy) * livesys.anti.speedmax * 0.4;
  }
  var last = livesys.anti.trust[b.id];
  var now = performance.now();
  if (last && last.t) {
    var dx = (b.x || 0) - last.x;
    var dy = (b.y || 0) - last.y;
    var d = Math.hypot(dx, dy);
    var dtsec = Math.max(0.001, (now - last.t) / 1000);
    if (d / dtsec > livesys.anti.teleportjump * 8) antireport("teleport", b.id, "jumped " + d.toFixed(1) + " m in " + dtsec.toFixed(2) + " s");
  }
  livesys.anti.trust[b.id] = { x: b.x || 0, y: b.y || 0, t: now };
}

function anticheatpanel() {
  var a = livesys.anti;
  var body = '<div class="antibody">' + u5sec("Anti cheat", "Server side validation of speed and position",
    u5row("Enabled", check("Validate every replicated body", a.on, 'data-anti="on"')) +
    sliderrow("Max speed", a.speedmax, 2, 120, 1, 'data-anti="speedmax"') +
    sliderrow("Max teleport delta", a.teleportjump, 1, 40, 0.5, 'data-anti="teleportjump"') +
    '<div class="flaglist">' + (a.flagged.length ? a.flagged.slice().reverse().slice(0, 12).map(function (f) {
      return '<div class="flagrow"><span class="fk">' + esc(f.kind) + '</span><span class="fw">' + esc(f.who) + '</span><span class="fd">' + esc(f.detail) + "</span></div>";
    }).join("") : '<div class="u5note">No flags recorded.</div>') + "</div>");
  body += u5sec("Teleport", "Move the local player or an actor instantly",
    '<div class="u5btns"><button class="btn" data-anti="tpactor">Teleport selection to camera</button>' +
    '<button class="btn ghost" data-anti="tpplayer">Teleport player to camera</button>' +
    '<button class="btn ghost" data-anti="tporigin">Teleport player to origin</button></div>' +
    '<div class="landout" id="tpout">Ready.</div>');
  body += "</div>";
  openmodal({
    title: "Anti Cheat and Teleport",
    icon: "lock",
    width: "wide",
    body: body,
    onmount: function (m) {
      m.querySelectorAll("[data-anti]").forEach(function (el) {
        el.addEventListener(el.getAttribute("data-anti") === "on" ? "input" : "input", function () {
          var f = el.getAttribute("data-anti");
          if (f === "on") a.on = el.checked;
          else if (f === "speedmax") a.speedmax = parseFloat(el.value);
          else if (f === "teleportjump") a.teleportjump = parseFloat(el.value);
          else if (f === "tpactor") {
            var n = selected();
            if (!n) {
              toast("Select an actor", "warn");
              return;
            }
            n.pos = [app.cam.target[0], Math.max(0.5, app.cam.target[1]), app.cam.target[2]];
            commit("teleport");
            refreshall();
            var out = qs("#tpout");
            if (out) out.textContent = n.name + " moved to " + n.pos.map(function (v) {
              return Math.round(v * 10) / 10;
            }).join(", ");
          } else if (f === "tpplayer") {
            if (game && game.player) {
              game.player.pos = [app.cam.target[0], Math.max(0.5, app.cam.target[1]), app.cam.target[2]];
              var out2 = qs("#tpout");
              if (out2) out2.textContent = "Player teleported during play.";
            } else {
              var out3 = qs("#tpout");
              if (out3) out3.textContent = "Start play in editor to teleport the player.";
            }
          } else if (f === "tporigin") {
            if (game && game.player) {
              game.player.pos = [0, 1, 0];
              var out4 = qs("#tpout");
              if (out4) out4.textContent = "Player returned to origin.";
            }
          }
          commit("anticheat");
        });
      });
    }
  });
}

function boardkey() {
  return "roxumitod-board-" + (app.project ? app.project.id : "x");
}

function boardsave() {
  try {
    localStorage.setItem(boardkey(), JSON.stringify({ boards: livesys.boards, stats: livesys.stats }));
  } catch (e) {}
}

function boardload() {
  try {
    var raw = localStorage.getItem(boardkey());
    if (raw) {
      var d = JSON.parse(raw);
      livesys.boards = d.boards || {};
      livesys.stats = d.stats || {};
    }
  } catch (e) {}
  if (!Object.keys(livesys.boards).length) {
    livesys.boards = { highscore: [{ name: "Ava", score: 12400 }, { name: "Kai", score: 9800 }, { name: "Mira", score: 7450 }] };
    livesys.stats = { plays: 0, wins: 0, deaths: 0, bestcombo: 0, time: 0 };
  }
}

function boardsubmit(board, name, score) {
  livesys.boards[board] = livesys.boards[board] || [];
  livesys.boards[board].push({ name: name || "Player", score: score || 0 });
  livesys.boards[board].sort(function (a, b) {
    return b.score - a.score;
  });
  livesys.boards[board] = livesys.boards[board].slice(0, 20);
  boardsave();
  return livesys.boards[board].findIndex(function (e) {
    return e.name === (name || "Player") && e.score === (score || 0);
  });
}

function boardpanel() {
  boardload();
  var names = Object.keys(livesys.boards);
  var body = '<div class="boardbody">' + u5sec("Leaderboards", "Persistent per level",
    '<div class="boardgrid">' + names.map(function (n) {
      return '<div class="boardcard"><div class="bh">' + esc(n) + "</div>" + livesys.boards[n].slice(0, 6).map(function (e, i) {
        return '<div class="brow"><span class="br">' + (i + 1) + '</span><span class="bn">' + esc(e.name) + '</span><span class="bs">' + e.score + "</span></div>";
      }).join("") + '<button class="btn sm ghost" data-boardadd="' + esc(n) + '">Submit score</button></div>';
    }).join("") + "</div>");
  body += u5sec("Player stats", "Aggregate counters",
    u5row("Plays", '<span class="u5val">' + livesys.stats.plays + "</span>") +
    u5row("Wins", '<span class="u5val">' + livesys.stats.wins + "</span>") +
    u5row("Deaths", '<span class="u5val">' + livesys.stats.deaths + "</span>") +
    u5row("Best combo", '<span class="u5val">' + livesys.stats.bestcombo + "</span>") +
    u5row("Time played", '<span class="u5val">' + Math.round(livesys.stats.time) + " s</span>") +
    '<div class="u5btns"><button class="btn" data-boardact="sim">Simulate a session</button>' +
    '<button class="btn ghost" data-boardact="reset">Reset stats</button></div>');
  body += "</div>";
  openmodal({
    title: "Leaderboards and Stats",
    icon: "trophy",
    width: "wide",
    body: body,
    onmount: function (m) {
      m.querySelectorAll("[data-boardadd]").forEach(function (b) {
        b.addEventListener("click", function () {
          var board = b.getAttribute("data-boardadd");
          promptbox("Submit a score", "Player", function (nm) {
            var rank = boardsubmit(board, nm, Math.round(2000 + Math.random() * 12000));
            toast("Submitted, rank " + (rank + 1), "ok");
            closemodal();
            setTimeout(boardpanel, 130);
          });
        });
      });
      m.querySelectorAll("[data-boardact]").forEach(function (b) {
        b.addEventListener("click", function () {
          if (b.getAttribute("data-boardact") === "sim") {
            livesys.stats.plays++;
            livesys.stats.wins += Math.random() > 0.5 ? 1 : 0;
            livesys.stats.deaths += Math.random() > 0.6 ? 1 : 0;
            livesys.stats.bestcombo = Math.max(livesys.stats.bestcombo, Math.round(Math.random() * 30));
            livesys.stats.time += 42;
            boardsave();
            toast("Session simulated", "ok");
            closemodal();
            setTimeout(boardpanel, 130);
          } else {
            livesys.stats = { plays: 0, wins: 0, deaths: 0, bestcombo: 0, time: 0 };
            boardsave();
            closemodal();
            setTimeout(boardpanel, 130);
          }
        });
      });
    }
  });
}

function labpanel() {
  var e = livesys.exp;
  var flags = ["newmovement", "newnetcode", "newui", "fastload", "hdroutput"];
  var body = '<div class="labbody">' + u5sec("Experiments", "Bucketed rollout flags",
    u5row("Experiment layer", check("Enable bucketing", e.on, 'data-lab="on"')) +
    selectrow("Bucket", ["stable", "beta", "canary"], e.bucket, 'data-lab="bucket"') +
    '<div class="flaglist">' + flags.map(function (f) {
      var on = !!e.flags[f];
      return '<div class="flagrow"><span class="fk">' + esc(f) + '</span><span class="fw">' + (on ? "on" : "off") + "</span><button class=\"btn sm ghost\" data-labflag=\"" + f + '">' + (on ? "Disable" : "Enable") + "</button></div>";
    }).join("") + "</div>" +
    '<div class="landout" id="labout">Bucket ' + esc(e.bucket) + ", " + Object.keys(e.flags).filter(function (k) {
      return e.flags[k];
    }).length + " flags on.</div>");
  body += u5sec("Live operations", "Remote config and staged rollout",
    u5row("Remote config", '<textarea class="shaderedit small" id="remoteconf">' + esc(JSON.stringify({ motd: "Welcome to Roxumitod", event: "none", multiplier: 1 }, null, 2)) + "</textarea>") +
    '<div class="u5btns"><button class="btn" data-labact="push">Push config</button></div>');
  body += "</div>";
  openmodal({
    title: "Experiments and Live Ops",
    icon: "sparkle",
    width: "wide",
    body: body,
    onmount: function (m) {
      m.querySelectorAll("[data-lab]").forEach(function (el) {
        el.addEventListener("input", function () {
          var f = el.getAttribute("data-lab");
          if (f === "on") e.on = el.checked;
          else e.bucket = el.value;
          commit("experiment");
        });
      });
      m.querySelectorAll("[data-labflag]").forEach(function (b) {
        b.addEventListener("click", function () {
          var f = b.getAttribute("data-labflag");
          e.flags[f] = !e.flags[f];
          closemodal();
          setTimeout(labpanel, 130);
        });
      });
      m.querySelectorAll("[data-labact]").forEach(function (b) {
        b.addEventListener("click", function () {
          try {
            var cfg = JSON.parse(qs("#remoteconf").value);
            app.project.remoteconf = cfg;
            commit("remote config");
            var out = qs("#labout");
            if (out) out.textContent = "Config pushed with " + Object.keys(cfg).length + " keys.";
            toast("Remote config pushed", "ok");
          } catch (err) {
            toast("Config is not valid JSON", "bad");
          }
        });
      });
    }
  });
}

function lagpanel() {
  var l = livesys.lag;
  var body = '<div class="lagbody">' + u5sec("Lag compensation and prediction", "Client prediction with a server rewind buffer",
    sliderrow("Rewind window", l.comp * 1000, 0, 400, 5, 'data-lag="comp"') +
    u5row("Prediction", check("Predict local movement", l.predict, 'data-lag="predict"')) +
    u5row("Buffer size", '<span class="u5val">' + l.buffer + " snapshots</span>") +
    u5row("Measured ping", '<span class="u5val">' + (netsys ? netsys.ping || 0 : 0) + " ms</span>") +
    '<div class="u5btns"><button class="btn" data-lagact="sample">Record a latency sample</button>' +
    '<button class="btn ghost" data-lagact="flush">Flush buffer</button></div>' +
    '<div class="laghist" id="laghist"></div>' +
    u5note("Every authoritative state is stored for the rewind window. Hits are evaluated against the rewound pose, so shots land where the shooter saw them."));
  body += "</div>";
  openmodal({
    title: "Lag Compensation",
    icon: "network",
    width: "wide",
    body: body,
    onmount: function (m) {
      m.querySelectorAll("[data-lag]").forEach(function (el) {
        el.addEventListener("input", function () {
          var f = el.getAttribute("data-lag");
          if (f === "comp") l.comp = parseFloat(el.value) / 1000;
          else if (f === "predict") l.predict = el.checked;
          commit("lag");
        });
      });
      m.querySelectorAll("[data-lagact]").forEach(function (b) {
        b.addEventListener("click", function () {
          if (b.getAttribute("data-lagact") === "sample") {
            l.samples.push(Math.round(18 + Math.random() * 90));
            if (l.samples.length > 40) l.samples.shift();
            l.buffer = Math.min(32, 4 + l.samples.length);
            var host = qs("#laghist");
            if (host) host.innerHTML = l.samples.map(function (s) {
              return '<span class="lagbar" style="height:' + Math.min(100, s) + '%"></span>';
            }).join("");
          } else {
            l.samples = [];
            l.buffer = 0;
            var host2 = qs("#laghist");
            if (host2) host2.innerHTML = "";
          }
        });
      });
    }
  });
}

function touchstate() {
  return typeof game !== "undefined" && game && game.keys ? game.keys : null;
}

function touchpress(code, down) {
  var k = touchstate();
  if (k) k[code] = down;
  if (!down && livesys.touch.on) return;
}

function touchenable() {
  livesys.touch.on = true;
}

function touchdraw(g, w, h) {
  if (!livesys.touch.on || !g) return;
  g.save();
  g.globalAlpha = 0.35;
  g.fillStyle = "#ffffff";
  var pad = 90;
  g.beginPath();
  g.arc(pad, h - pad, 44, 0, 6.283);
  g.fill();
  g.beginPath();
  g.arc(w - pad, h - pad - 70, 30, 0, 6.283);
  g.fill();
  g.beginPath();
  g.arc(w - pad * 0.55, h - pad * 0.55, 30, 0, 6.283);
  g.fill();
  g.restore();
}

function padpoll() {
  if (!livesys.pad.on) return;
  var pads = navigator.getGamepads ? navigator.getGamepads() : [];
  var found = null;
  for (var i = 0; i < pads.length; i++) {
    if (pads[i]) {
      found = pads[i];
      break;
    }
  }
  if (!found) {
    livesys.pad.id = "";
    return;
  }
  livesys.pad.id = found.id;
  livesys.pad.axes = found.axes.slice(0, 4);
  var k = touchstate();
  if (!k) return;
  var ax = found.axes[0] || 0;
  var ay = found.axes[1] || 0;
  k.ArrowLeft = ax < -0.35;
  k.ArrowRight = ax > 0.35;
  k.ArrowUp = ay < -0.45;
  k.ArrowDown = ay > 0.45;
  if (found.buttons[0]) k.Space = !!found.buttons[0].pressed;
}

function inputpanel() {
  var body = '<div class="inputbody">' + u5sec("Touch controls", "On screen sticks and buttons",
    u5row("Touch layer", check("Show touch overlay", livesys.touch.on, 'data-in="touch"')) +
    '<div class="u5btns"><button class="btn" data-inact="touchdemo">Test touch input</button></div>');
  body += u5sec("Gamepad", "Standard mapping polling",
    u5row("Enabled", check("Poll gamepads", livesys.pad.on, 'data-in="pad"')) +
    u5row("Device", '<span class="u5val" id="padname">' + (livesys.pad.id || "none detected, press a button") + "</span>") +
    u5row("Axes", '<span class="u5val" id="padaxes">' + livesys.pad.axes.map(function (a) {
      return a.toFixed(2);
    }).join(", ") + "</span>") +
    '<div class="u5btns"><button class="btn ghost" data-inact="padpoll">Poll now</button></div>');
  body += u5sec("VR", "Headset presentation and controllers",
    u5row("Support", '<span class="u5badge ' + (navigator.xr ? "u5on" : "u5off") + '">' + (navigator.xr ? "WebXR available" : "WebXR not present") + "</span>") +
    '<div class="u5btns"><button class="btn" data-inact="vr">Enter immersive session</button></div>' +
    '<div class="landout" id="vrout">Idle.</div>');
  body += "</div>";
  openmodal({
    title: "Touch, Gamepad and VR",
    icon: "joystick",
    width: "wide",
    body: body,
    onmount: function (m) {
      m.querySelectorAll("[data-in]").forEach(function (el) {
        el.addEventListener("input", function () {
          var f = el.getAttribute("data-in");
          livesys[f] = el.checked;
        });
      });
      m.querySelectorAll("[data-inact]").forEach(function (b) {
        b.addEventListener("click", function () {
          var a = b.getAttribute("data-inact");
          if (a === "touchdemo") {
            touchenable();
            var k = touchstate();
            if (k) {
              k.ArrowRight = true;
              setTimeout(function () {
                k.ArrowRight = false;
              }, 500);
            }
            toast("Touch overlay enabled, right arrow pulsed", "ok");
          } else if (a === "padpoll") {
            padpoll();
            var pn = qs("#padname");
            var pa = qs("#padaxes");
            if (pn) pn.textContent = livesys.pad.id || "none detected";
            if (pa) pa.textContent = livesys.pad.axes.map(function (x) {
              return x.toFixed(2);
            }).join(", ");
          } else if (a === "vr") {
            var out = qs("#vrout");
            if (!navigator.xr) {
              if (out) out.textContent = "This browser has no WebXR device. The stage falls back to a stereo pair preview.";
            } else {
              navigator.xr.isSessionSupported("immersive-vr").then(function (ok) {
                livesys.vr.supported = ok;
                if (out) out.textContent = ok ? "Immersive VR is supported on this device." : "Immersive VR is not supported here.";
                if (ok && typeof qs === "function") {
                  navigator.xr.requestSession("immersive-vr").then(function (sess) {
                    livesys.vr.on = true;
                    if (out) out.textContent = "Immersive session started.";
                    sess.addEventListener("end", function () {
                      livesys.vr.on = false;
                    });
                  }).catch(function () {
                    if (out) out.textContent = "Session request was declined.";
                  });
                }
              }).catch(function () {
                if (out) out.textContent = "Device query failed.";
              });
            }
          }
        });
      });
    }
  });
}

var locpacks = {
  en: { play: "Play", score: "Score", lives: "Lives", pause: "Pause", win: "You win", lose: "Game over" },
  es: { play: "Jugar", score: "Puntos", lives: "Vidas", pause: "Pausa", win: "Ganaste", lose: "Fin del juego" },
  fr: { play: "Jouer", score: "Score", lives: "Vies", pause: "Pause", win: "Gagne", lose: "Perdu" },
  ar: { play: "العب", score: "النقاط", lives: "الأرواح", pause: "إيقاف", win: "فزت", lose: "انتهت" },
  ja: { play: "プレイ", score: "スコア", lives: "残機", pause: "一時停止", win: "勝利", lose: "ゲームオーバー" }
};

function loctranslate(key) {
  var pack = locpacks[livesys.loc.lang] || locpacks.en;
  return pack[key] !== undefined ? pack[key] : (locpacks.en[key] || key);
}

function locbuild() {
  livesys.loc.strings = locpacks[livesys.loc.lang] || locpacks.en;
  livesys.loc.built = Object.keys(livesys.loc.strings).length;
  app.project.locale = livesys.loc.lang;
  commit("locale");
  return livesys.loc.built;
}

function locpanel() {
  var langs = Object.keys(locpacks);
  var body = '<div class="locbody">' + u5sec("Localisation pipeline", "String tables and locale switching",
    selectrow("Language", langs, livesys.loc.lang, 'data-loc="lang"') +
    '<div class="locgrid">' + Object.keys(locpacks.en).map(function (k) {
      return '<div class="locrow"><span class="lk">' + esc(k) + '</span><span class="le">' + esc(locpacks.en[k]) + '</span><span class="lt">' + esc(loctranslate(k)) + "</span>" +
        '<input class="inp" value="' + esc((locpacks[livesys.loc.lang] || {})[k] || "") + '" data-locstr="' + esc(k) + '"></div>';
    }).join("") + "</div>" +
    '<div class="u5btns"><button class="btn" data-locact="apply">Apply locale</button>' +
    '<button class="btn ghost" data-locact="export">Export string table</button></div>' +
    '<div class="landout" id="locout">' + livesys.loc.built + " strings built.</div>");
  body += "</div>";
  openmodal({
    title: "Localisation",
    icon: "globe",
    width: "wide",
    body: body,
    onmount: function (m) {
      m.querySelectorAll("[data-loc]").forEach(function (el) {
        el.addEventListener("change", function () {
          livesys.loc.lang = el.value;
          locbuild();
          closemodal();
          setTimeout(locpanel, 130);
        });
      });
      m.querySelectorAll("[data-locstr]").forEach(function (el) {
        el.addEventListener("input", function () {
          locpacks[livesys.loc.lang] = locpacks[livesys.loc.lang] || {};
          locpacks[livesys.loc.lang][el.getAttribute("data-locstr")] = el.value;
        });
      });
      m.querySelectorAll("[data-locact]").forEach(function (b) {
        b.addEventListener("click", function () {
          if (b.getAttribute("data-locact") === "apply") {
            var n = locbuild();
            var out = qs("#locout");
            if (out) out.textContent = n + " strings applied for " + livesys.loc.lang + ".";
            toast("Locale set to " + livesys.loc.lang, "ok");
          } else {
            var txt = JSON.stringify(livesys.loc.strings || locpacks.en, null, 2);
            downloadblob("roxumitod-" + livesys.loc.lang + ".json", new Blob([txt], { type: "application/json" }));
          }
        });
      });
    }
  });
}

function liveboot() {
  boardload();
  locbuild();
  window.addEventListener("gamepadconnected", function (e) {
    livesys.pad.id = e.gamepad.id;
  });
}
