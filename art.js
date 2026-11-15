var artcache = {};

function cvw(w, h) {
  var c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function cx2(c) {
  return c.getContext("2d");
}

function rct(g, x, y, w, h, col) {
  g.fillStyle = col;
  g.fillRect(x, y, w, h);
}

function ell(g, x, y, rx, ry, col) {
  g.fillStyle = col;
  g.beginPath();
  g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  g.fill();
}

function hashof(s) {
  var h = 2166136261;
  for (var i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed) {
  var s = seed || 1;
  return function () {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

function turtxt(g, s) {
  g.fillStyle = "#4fae42";
  for (var i = 0; i < 26; i++) {
    var x = 2 + ((i * 37) % 60);
    var y = 18 + ((i * 19) % 44);
    if (i % 3 === 0) rct(g, x, y, 2, 4, "#4d9c3c");
    else rct(g, x, y, 3, 2, "#d1915e");
  }
}

function brickrows(g, x, y, w, h, base, mortar, hi) {
  rct(g, x, y, w, h, base);
  var row = 8;
  for (var r = 0; r * row < h; r++) {
    var yy = y + r * row;
    rct(g, x, yy, w, 1, mortar);
    var off = r % 2 ? 10 : 0;
    for (var bx = -10; bx < w; bx += 20) {
      rct(g, x + bx + off, yy, 1, row, mortar);
    }
    for (var k = 0; k < 5; k++) rct(g, x + 3 + ((k * 13 + r * 7) % (w - 6)), yy + 3, 2, 2, hi);
  }
}

function arthills(w, h, palette) {
  var c = cvw(w, h);
  var g = cx2(c);
  function crest(x, off, amp) {
    var t = x / w;
    return h - 26 - Math.sin(t * Math.PI * 2 + off) * amp - Math.sin(t * Math.PI * 4.5 + off * 1.7) * amp * 0.28;
  }
  function mound(off, amp, base, crestcol, rim) {
    var grd = g.createLinearGradient(0, h - 26 - amp * 1.4, 0, h);
    grd.addColorStop(0, crestcol);
    grd.addColorStop(0.55, base);
    grd.addColorStop(1, palette[4]);
    g.beginPath();
    g.moveTo(0, h);
    for (var x = 0; x <= w; x += 3) g.lineTo(x, crest(x, off, amp));
    g.lineTo(w, h);
    g.closePath();
    g.fillStyle = grd;
    g.fill();
    g.strokeStyle = rim;
    g.lineWidth = 2;
    g.beginPath();
    for (var x2 = 0; x2 <= w; x2 += 3) {
      var y2 = crest(x2, off, amp);
      if (x2 === 0) g.moveTo(x2, y2);
      else g.lineTo(x2, y2);
    }
    g.stroke();
    var tuft = rng(Math.round(off * 97 + amp));
    for (var t = 0; t < w / 14; t++) {
      var tx = tuft() * w;
      var ty = crest(tx, off, amp) + 3 + tuft() * 6;
      rct(g, Math.round(tx), Math.round(ty), 1, 2, palette[5]);
    }
  }
  rct(g, 0, h - 26, w, 26, palette[4]);
  mound(1.9, 12, palette[2], palette[3], palette[4]);
  mound(0.35, 17, palette[0], palette[1], palette[4]);
  var rand = rng(11);
  for (var i = 0; i < w / 12; i++) {
    var x = Math.floor(rand() * w);
    var y = Math.floor(h - 30 + rand() * 22);
    rct(g, x, y, 2, 1, palette[4]);
  }
  return c;
}
function artmake(name) {
  if (artcache[name]) return artcache[name];
  var c = null;
  if (name === "tiles") {
    c = cvw(64, 64);
    var g = cx2(c);
    rct(g, 0, 0, 64, 64, "#c8794a");
    brickrows(g, 0, 14, 64, 50, "#c8794a", "#a4552f", "#dd9059");
    rct(g, 0, 0, 64, 15, "#6ecf57");
    rct(g, 0, 0, 64, 3, "#8ce874");
    rct(g, 0, 14, 64, 4, "#4f9e3e");
    rectgrass(g, 0, 2, 64, 10);
  } else if (name === "grass") {
    c = cvw(64, 64);
    var g2 = cx2(c);
    rct(g2, 0, 0, 64, 64, "#66c94f");
    rectgrass(g2, 0, 0, 64, 64);
  } else if (name === "nearhills") {
    c = arthills(256, 128, ["#4fbf49", "#7edb62", "#8fdd7c", "#a9e89a", "#3f9c3a", "#bff0a9"]);
  } else if (name === "farhills") {
    c = arthills(256, 128, ["#a5e39a", "#c3efb9", "#c3edbb", "#d9f4d2", "#8fce8b", "#e6f8e0"]);
  } else if (name === "hero") {
    c = cvw(64, 64);
    var g3 = cx2(c);
    ell(g3, 32, 26, 21, 19, "#f7e2bd");
    g3.fillStyle = "#f0c98d";
    g3.beginPath();
    g3.arc(32, 24, 21, Math.PI, Math.PI * 2);
    g3.fill();
    ell(g3, 22, 12, 3, 1.6, "#fff6df");
    ell(g3, 31, 8, 2.6, 1.4, "#fff6df");
    ell(g3, 41, 13, 3, 1.6, "#fff6df");
    ell(g3, 24, 28, 5.4, 6, "#ffffff");
    ell(g3, 40, 28, 5.4, 6, "#ffffff");
    ell(g3, 25, 29, 2.8, 3.4, "#2b2b33");
    ell(g3, 39, 29, 2.8, 3.4, "#2b2b33");
    ell(g3, 26, 27.6, 1, 1.2, "#ffffff");
    ell(g3, 40, 27.6, 1, 1.2, "#ffffff");
    ell(g3, 16, 33, 3.4, 2.2, "#f6b1a4");
    ell(g3, 48, 33, 3.4, 2.2, "#f6b1a4");
    g3.strokeStyle = "#8a5d3b";
    g3.lineWidth = 1.6;
    g3.beginPath();
    g3.arc(32, 36, 4.2, 0.25, Math.PI - 0.25);
    g3.stroke();
    rct(g3, 14, 43, 36, 5, "#6fca4e");
    for (var i = 0; i < 7; i++) ell(g3, 15 + i * 5.4, 45, 3.4, 2.6, i % 2 ? "#8ade67" : "#5cb643");
    rct(g3, 16, 47, 32, 4, "#b4613a");
    rct(g3, 16, 50, 32, 3, "#8f4527");
    rct(g3, 15, 52, 34, 5, "#e0a566");
    ell(g3, 13, 46, 2.6, 3.4, "#f7e2bd");
    ell(g3, 51, 46, 2.6, 3.4, "#f7e2bd");
    rct(g3, 22, 57, 6, 4, "#8a5d3b");
    rct(g3, 36, 57, 6, 4, "#8a5d3b");
  } else if (name === "slime") {
    c = cvw(64, 64);
    var g4 = cx2(c);
    g4.fillStyle = "#a86fd6";
    g4.beginPath();
    g4.moveTo(8, 52);
    g4.quadraticCurveTo(6, 26, 32, 24);
    g4.quadraticCurveTo(58, 26, 56, 52);
    g4.quadraticCurveTo(32, 60, 8, 52);
    g4.fill();
    g4.fillStyle = "#c79aee";
    g4.beginPath();
    g4.moveTo(14, 46);
    g4.quadraticCurveTo(14, 30, 30, 27);
    g4.quadraticCurveTo(22, 40, 14, 46);
    g4.fill();
    ell(g4, 24, 40, 4.6, 5, "#fff");
    ell(g4, 40, 40, 4.6, 5, "#fff");
    ell(g4, 25, 41, 2.2, 2.8, "#2a2633");
    ell(g4, 39, 41, 2.2, 2.8, "#2a2633");
    ell(g4, 20, 47, 3, 1.8, "#e79bd2");
    ell(g4, 44, 47, 3, 1.8, "#e79bd2");
    g4.strokeStyle = "#5c3579";
    g4.lineWidth = 1.6;
    g4.beginPath();
    g4.arc(32, 46, 4, 0.3, Math.PI - 0.3);
    g4.stroke();
    rct(g4, 25, 16, 14, 4, "#f7c948");
    rct(g4, 27, 11, 3, 5, "#f7c948");
    rct(g4, 32, 9, 3, 7, "#f7c948");
    rct(g4, 37, 11, 3, 5, "#f7c948");
    ell(g4, 32, 9, 1.6, 1.6, "#ffe38a");
  } else if (name === "coin") {
    c = cvw(64, 64);
    var g5 = cx2(c);
    function hex(g, cx, cy, r, fill) {
      g.beginPath();
      for (var i = 0; i < 6; i++) {
        var a = Math.PI / 6 + i * Math.PI / 3;
        var x = cx + Math.cos(a) * r;
        var y = cy + Math.sin(a) * r;
        if (i === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.closePath();
      g.fillStyle = fill;
      g.fill();
    }
    hex(g5, 32, 32, 26, "#a9741c");
    hex(g5, 32, 30, 24, "#f7c948");
    hex(g5, 32, 29, 18, "#e3ad2f");
    hex(g5, 32, 28, 15, "#fbd873");
    hex(g5, 32, 27, 8, "#f0bb3c");
    g5.strokeStyle = "#fff2b8";
    g5.lineWidth = 2;
    g5.beginPath();
    g5.moveTo(22, 17);
    g5.lineTo(30, 13);
    g5.stroke();
  } else if (name === "heart") {
    c = cvw(64, 64);
    var g6 = cx2(c);
    function heartpath(g, s) {
      g.beginPath();
      g.moveTo(32, 54);
      g.bezierCurveTo(6, 38, 8, 18, 20, 14);
      g.bezierCurveTo(27, 12, 32, 18, 32, 22);
      g.bezierCurveTo(32, 18, 37, 12, 44, 14);
      g.bezierCurveTo(56, 18, 58, 38, 32, 54);
      g.closePath();
    }
    heartpath(g6);
    g6.fillStyle = "#b5322a";
    g6.fill();
    g6.save();
    g6.translate(0, -2.5);
    heartpath(g6);
    g6.fillStyle = "#e8503a";
    g6.fill();
    g6.restore();
    ell(g6, 23, 24, 4, 3, "#ff9a86");
    ell(g6, 27, 20, 2.4, 1.8, "#ffb9a9");
  } else if (name === "flag") {
    c = cvw(64, 64);
    var g7 = cx2(c);
    rct(g7, 13, 6, 5, 54, "#c98a52");
    rct(g7, 13, 6, 2, 54, "#e0a66c");
    ell(g7, 15.5, 5, 4, 3.4, "#f7c948");
    g7.fillStyle = "#e8503a";
    g7.beginPath();
    g7.moveTo(18, 9);
    g7.quadraticCurveTo(34, 4, 52, 10);
    g7.lineTo(52, 30);
    g7.quadraticCurveTo(34, 25, 18, 30);
    g7.closePath();
    g7.fill();
    g7.fillStyle = "#c93c2c";
    g7.beginPath();
    g7.moveTo(18, 20);
    g7.quadraticCurveTo(34, 15, 52, 21);
    g7.lineTo(52, 27);
    g7.quadraticCurveTo(34, 22, 18, 27);
    g7.closePath();
    g7.fill();
    rct(g7, 8, 58, 16, 4, "#b5753f");
  } else if (name === "spikes") {
    c = cvw(64, 64);
    var g8 = cx2(c);
    rct(g8, 4, 52, 56, 8, "#5a5f68");
    for (var s = 0; s < 4; s++) {
      var x = 6 + s * 14;
      g8.beginPath();
      g8.moveTo(x, 52);
      g8.lineTo(x + 7, 22);
      g8.lineTo(x + 14, 52);
      g8.closePath();
      var grd = g8.createLinearGradient(x, 22, x + 14, 52);
      grd.addColorStop(0, "#e6e9ef");
      grd.addColorStop(0.5, "#b9bec7");
      grd.addColorStop(1, "#7c818b");
      g8.fillStyle = grd;
      g8.fill();
    }
  } else if (name === "cloud") {
    c = cvw(256, 96);
    var g9 = cx2(c);
    var r2 = rng(11);
    for (var i = 0; i < 14; i++) {
      var x = 16 + r2() * 224;
      var y = 40 + r2() * 26;
      var rx = 22 + r2() * 26;
      var grd2 = g9.createRadialGradient(x, y, 2, x, y, rx);
      grd2.addColorStop(0, "rgba(255,255,255,0.95)");
      grd2.addColorStop(1, "rgba(255,255,255,0)");
      g9.fillStyle = grd2;
      g9.beginPath();
      g9.ellipse(x, y, rx, rx * 0.55, 0, 0, Math.PI * 2);
      g9.fill();
    }
  } else if (name === "gridbaked") {
    c = cvw(512, 512);
    var gb = cx2(c);
    rct(gb, 0, 0, 512, 512, "#e8f4fc");
    for (var gv = 0; gv <= 16; gv++) {
      rct(gb, 0, Math.min(511, gv * 32), 512, 1, "#cfe6f6");
      rct(gb, Math.min(511, gv * 32), 0, 1, 512, "#cfe6f6");
    }
  } else if (name === "grid") {
    c = cvw(128, 128);
    var g10 = cx2(c);
    rct(g10, 0, 0, 128, 128, "#e8f4fc");
    rct(g10, 0, 0, 128, 2, "#cfe6f6");
    rct(g10, 0, 0, 2, 128, "#cfe6f6");
  } else if (name === "sky") {
    c = cvw(512, 256);
    var g11 = cx2(c);
    var sg = g11.createLinearGradient(0, 0, 0, 256);
    sg.addColorStop(0, "#9fd0f8");
    sg.addColorStop(1, "#e8f6ff");
    g11.fillStyle = sg;
    g11.fillRect(0, 0, 512, 256);
    var cloud = artmake("cloud");
    g11.globalAlpha = 0.9;
    g11.drawImage(cloud, 20, 60, 240, 90);
    g11.drawImage(cloud, 260, 30, 220, 82);
    g11.globalAlpha = 1;
  } else if (name === "water") {
    c = cvw(64, 64);
    var g12 = cx2(c);
    rct(g12, 0, 0, 64, 64, "#4fb6e8");
    for (var w2 = 0; w2 < 6; w2++) {
      rct(g12, 0, w2 * 11, 64, 2, "#7ad0f4");
      rct(g12, 0, w2 * 11 + 5, 64, 1, "#3d9fd0");
    }
  } else if (name === "crate") {
    c = cvw(64, 64);
    var g13 = cx2(c);
    rct(g13, 0, 0, 64, 64, "#c98a52");
    rct(g13, 3, 3, 58, 58, "#e0a568");
    rct(g13, 0, 0, 64, 6, "#a9713f");
    rct(g13, 0, 58, 64, 6, "#a9713f");
    rct(g13, 0, 0, 6, 64, "#a9713f");
    rct(g13, 58, 0, 6, 64, "#a9713f");
    g13.strokeStyle = "#a9713f";
    g13.lineWidth = 4;
    g13.beginPath();
    g13.moveTo(8, 8);
    g13.lineTo(56, 56);
    g13.moveTo(56, 8);
    g13.lineTo(8, 56);
    g13.stroke();
  } else if (name === "tree") {
    c = cvw(64, 64);
    var g14 = cx2(c);
    rct(g14, 28, 38, 8, 22, "#a9713f");
    ell(g14, 32, 28, 20, 17, "#3f9c3a");
    ell(g14, 22, 32, 12, 10, "#4fbf49");
    ell(g14, 42, 30, 12, 10, "#4fbf49");
    ell(g14, 30, 20, 12, 9, "#6ecf57");
    ell(g14, 27, 24, 4, 3, "#8ce874");
  } else if (name === "rock") {
    c = cvw(64, 64);
    var g15 = cx2(c);
    g15.beginPath();
    g15.moveTo(10, 50);
    g15.lineTo(16, 26);
    g15.lineTo(34, 16);
    g15.lineTo(52, 28);
    g15.lineTo(54, 50);
    g15.closePath();
    g15.fillStyle = "#8e95a0";
    g15.fill();
    g15.beginPath();
    g15.moveTo(16, 26);
    g15.lineTo(34, 16);
    g15.lineTo(38, 34);
    g15.lineTo(24, 42);
    g15.closePath();
    g15.fillStyle = "#b8bfc9";
    g15.fill();
  } else if (name === "mushroom") {
    c = cvw(64, 64);
    var g16 = cx2(c);
    rct(g16, 26, 34, 12, 22, "#f4e3c5");
    g16.beginPath();
    g16.moveTo(8, 36);
    g16.quadraticCurveTo(32, 4, 56, 36);
    g16.closePath();
    g16.fillStyle = "#e8503a";
    g16.fill();
    ell(g16, 24, 24, 4, 3, "#ffe9e2");
    ell(g16, 38, 27, 3, 2.4, "#ffe9e2");
  } else if (name === "logo") {
    c = cvw(96, 96);
    var g17 = cx2(c);
    function face(pts, col) {
      g17.beginPath();
      g17.moveTo(pts[0], pts[1]);
      for (var i = 2; i < pts.length; i += 2) g17.lineTo(pts[i], pts[i + 1]);
      g17.closePath();
      g17.fillStyle = col;
      g17.fill();
    }
    face([48, 12, 84, 30, 48, 48, 12, 30], "#ffd166");
    face([12, 30, 48, 48, 48, 84, 12, 66], "#3f6fe0");
    face([84, 30, 84, 66, 48, 84, 48, 48], "#8a5bd6");
    face([48, 12, 84, 30, 84, 36, 48, 18], "#ffb020");
    face([18, 40, 44, 53, 44, 58, 18, 45], "#66d38a");
    g17.strokeStyle = "rgba(255,255,255,.9)";
    g17.lineWidth = 3.4;
    g17.lineCap = "round";
    g17.beginPath();
    g17.moveTo(36, 52);
    g17.lineTo(30, 58);
    g17.lineTo(36, 64);
    g17.moveTo(46, 52);
    g17.lineTo(52, 58);
    g17.lineTo(46, 64);
    g17.stroke();
  } else if (name === "column") {
    c = cvw(64, 64);
    var g18 = cx2(c);
    rct(g18, 20, 12, 24, 46, "#c9ccd4");
    rct(g18, 16, 8, 32, 6, "#e2e5ea");
    rct(g18, 16, 54, 32, 6, "#a9adb6");
    rct(g18, 22, 16, 4, 36, "#e2e5ea");
  } else if (name === "door") {
    c = cvw(64, 64);
    var g19 = cx2(c);
    rct(g19, 12, 8, 40, 52, "#8a5a3a");
    rct(g19, 16, 12, 32, 44, "#b5753f");
    rct(g19, 18, 14, 28, 18, "#c98a52");
    rct(g19, 18, 34, 28, 18, "#c98a52");
    ell(g19, 44, 34, 2.4, 2.4, "#f7c948");
  } else if (name === "fence") {
    c = cvw(64, 64);
    var g20 = cx2(c);
    rct(g20, 6, 22, 52, 6, "#c98a52");
    rct(g20, 6, 38, 52, 6, "#c98a52");
    [10, 26, 42, 56].forEach(function (x) {
      rct(g20, x, 16, 6, 40, "#b5753f");
      g20.beginPath();
      g20.moveTo(x, 16);
      g20.lineTo(x + 3, 10);
      g20.lineTo(x + 6, 16);
      g20.closePath();
      g20.fillStyle = "#b5753f";
      g20.fill();
    });
  }
  if (!c) {
    c = cvw(64, 64);
    var gg = cx2(c);
    rct(gg, 6, 6, 52, 52, "#7f8794");
  }
  artcache[name] = c;
  return c;
}

function rectgrass(g, x, y, w, h) {
  var rand = rng(w * 31 + h * 7);
  for (var i = 0; i < w * h / 5; i++) {
    var px = x + Math.floor(rand() * w);
    var py = y + Math.floor(rand() * h);
    rct(g, px, py, 1 + Math.floor(rand() * 2), 1 + Math.floor(rand() * 3), rand() > 0.45 ? "#7fdd63" : "#4fae42");
  }
}

var textcache = {};

function textcanvas(text, color, size) {
  var key = text + "|" + color + "|" + size;
  if (textcache[key]) return textcache[key];
  var pad = 10;
  var c = cvw(512, 128);
  var g = cx2(c);
  g.font = "700 " + (size || 54) + "px Inter, Segoe UI, sans-serif";
  g.textBaseline = "middle";
  g.textAlign = "left";
  var w = Math.ceil(g.measureText(text).width) + pad * 2;
  var cc = cvw(Math.max(32, w), 128);
  var g2 = cx2(cc);
  g2.font = g.font;
  g2.textBaseline = "middle";
  g2.fillStyle = color || "#ffffff";
  g2.fillText(text, pad, 64);
  textcache[key] = cc;
  return cc;
}

var customart = {};

function customcanvas(key, dataurl) {
  if (customart[key]) return customart[key];
  var c = cvw(128, 128);
  var g = cx2(c);
  g.fillStyle = "rgba(0,0,0,0)";
  g.fillRect(0, 0, 128, 128);
  customart[key] = c;
  var img = new Image();
  img.onload = function () {
    c.width = img.width;
    c.height = img.height;
    var g2 = cx2(c);
    g2.clearRect(0, 0, c.width, c.height);
    g2.drawImage(img, 0, 0);
    c.artversion = (c.artversion || 0) + 1;
  };
  img.src = dataurl;
  return c;
}

function texturecanvas(key, project) {
  if (key && key.indexOf("custom:") === 0) {
    var aid = key.slice(7);
    var asset = null;
    if (project && project.assets) {
      for (var i = 0; i < project.assets.length; i++) if (project.assets[i].id === aid) asset = project.assets[i];
    }
    if (asset && asset.data) return customcanvas(key, asset.data);
    return artmake("crate");
  }
  if (key === "text") return artmake("crate");
  return artmake(key);
}

function arturl(key) {
  return artmake(key).toDataURL("image/png");
}

function artdarken(hex, k) {
  if (!hex || hex.charAt(0) !== "#") return hex;
  var n = parseInt(hex.slice(1), 16);
  var r = Math.max(0, Math.min(255, Math.round(((n >> 16) & 255) * k)));
  var g = Math.max(0, Math.min(255, Math.round(((n >> 8) & 255) * k)));
  var b = Math.max(0, Math.min(255, Math.round((n & 255) * k)));
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function artmix(hex, mix, k) {
  if (!hex || hex.charAt(0) !== "#") return hex;
  if (!mix || mix.charAt(0) !== "#") return hex;
  var a = parseInt(hex.slice(1), 16);
  var b = parseInt(mix.slice(1), 16);
  var r = Math.round(((a >> 16) & 255) * (1 - k) + ((b >> 16) & 255) * k);
  var g = Math.round(((a >> 8) & 255) * (1 - k) + ((b >> 8) & 255) * k);
  var bl = Math.round((a & 255) * (1 - k) + (b & 255) * k);
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1);
}

var isoview = {};

function isoproj(x, y, z, s, ox, oy) {
  return [ox + (x - z) * 0.866 * s, oy + (x + z) * 0.5 * s - y * s];
}

function isopoly(g, pts, fill, stroke) {
  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  for (var i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.closePath();
  g.fillStyle = fill;
  g.fill();
  if (stroke) {
    g.strokeStyle = stroke;
    g.lineWidth = 1;
    g.stroke();
  }
}

function isobox(g, x, y, z, w, h, d, pal, s, ox, oy) {
  var a = isoproj(x, y + h, z, s, ox, oy);
  var b = isoproj(x + w, y + h, z, s, ox, oy);
  var c = isoproj(x + w, y + h, z + d, s, ox, oy);
  var e = isoproj(x, y + h, z + d, s, ox, oy);
  var a2 = isoproj(x, y, z, s, ox, oy);
  var b2 = isoproj(x + w, y, z, s, ox, oy);
  var c2 = isoproj(x + w, y, z + d, s, ox, oy);
  var e2 = isoproj(x, y, z + d, s, ox, oy);
  isopoly(g, [a, b, c, e], pal[0], pal[3]);
  isopoly(g, [e, c, c2, e2], pal[2], pal[3]);
  isopoly(g, [a, e, e2, a2], pal[1], pal[3]);
  isopoly(g, [b, b2, c2, c], artdarken(pal[2], 0.72), pal[3]);
}

function isocyl(g, x, y, z, r, h, pal, s, ox, oy) {
  var top = isoproj(x, y + h, z, s, ox, oy);
  var side = isoproj(x, y, z, s, ox, oy);
  g.fillStyle = pal[1];
  g.beginPath();
  g.moveTo(top[0] - r * s * 0.9, top[1]);
  g.lineTo(top[0] - r * s * 0.9, top[1] + h * s);
  g.ellipse(top[0], top[1] + h * s, r * s * 0.9, r * s * 0.45, 0, Math.PI, 0, true);
  g.lineTo(top[0] + r * s * 0.9, top[1]);
  g.closePath();
  g.fill();
  g.fillStyle = pal[0];
  g.beginPath();
  g.ellipse(top[0], top[1], r * s * 0.9, r * s * 0.45, 0, 0, Math.PI * 2);
  g.fill();
}

var kitpalettes = {
  proto: ["#d6b98c", "#b98d5c", "#9a6f42", "rgba(0,0,0,.16)", "#8c99a6"],
  grass: ["#8ce874", "#5cc446", "#3f9c3a", "rgba(0,0,0,.18)", "#c8794a"],
  wood: ["#e0a568", "#c98a52", "#a9713f", "rgba(0,0,0,.18)", "#7d5b3c"],
  stone: ["#cfd5dd", "#aab1bb", "#8b929c", "rgba(0,0,0,.18)", "#6d747e"],
  car: ["#7fb6e8", "#5a92c9", "#4879a8", "rgba(0,0,0,.18)", "#2e343c"],
  city: ["#e8ddd0", "#d0c2b0", "#b3a390", "rgba(0,0,0,.16)", "#8e8272"],
  ui: ["#f3cf8f", "#c9a463", "#a5844b", "rgba(0,0,0,.16)", "#7d6338"],
  nature: ["#8ce874", "#5cc446", "#3f9c3a", "rgba(0,0,0,.18)", "#8a5a3a"]
};

function kitseedpal(seed, base) {
  var pal = (kitpalettes[base] || kitpalettes.proto).slice(0);
  var r = rng(seed);
  var hues = [["#f0b46a", "#d39450", "#b0763a"], ["#8ad0f0", "#5aa9d1", "#4088ab"], ["#f09090", "#d16a6a", "#aa4c4c"], ["#b9a2ee", "#9678d1", "#7759ab"], ["#f0d46a", "#d1b350", "#ab8e3a"], ["#9fe0b4", "#6ec08a", "#4f9a68"]];
  var pick = hues[Math.floor(r() * hues.length)];
  pal[0] = pick[0];
  pal[1] = pick[1];
  pal[2] = pick[2];
  return pal;
}

function kitthumb(item, kitid) {
  var key = "kit|" + kitid + "|" + item.n;
  if (artcache[key]) return artcache[key];
  var c = cvw(150, 130);
  var g = cx2(c);
  var seed = hashof(item.n + kitid);
  var r = rng(seed);
  var base = kitpalettes[item.p] ? item.p : (kitid === "nature" ? "nature" : kitid === "city" ? "city" : kitid === "car" ? "car" : "proto");
  var pal = kitseedpal(seed, base);
  var s = 33;
  var ox = 75;
  var oy = 104;
  var kind = item.k;
  function shadow(rad) {
    g.fillStyle = "rgba(0,0,0,.13)";
    g.beginPath();
    g.ellipse(ox, oy + 8, rad, rad * 0.42, 0, 0, Math.PI * 2);
    g.fill();
  }
  if (kind === "animal") {
    shadow(30);
    isobox(g, -0.6, 0.5, -0.3, 1.2, 0.8, 0.6, pal, s, ox, oy);
    isobox(g, 0.55, 0.75, -0.2, 0.55, 0.6, 0.45, pal, s, ox, oy);
    isobox(g, 0.55, 1.35, -0.2, 0.08, 0.3, 0.08, pal, s, ox, oy);
    isobox(g, -0.5, 0, -0.2, 0.18, 0.55, 0.18, pal, s, ox, oy);
    isobox(g, 0.2, 0, -0.2, 0.18, 0.55, 0.18, pal, s, ox, oy);
  } else if (kind === "button") {
    shadow(26);
    isobox(g, -0.8, 0, -0.8, 1.6, 0.22, 1.6, pal, s, ox, oy);
    isobox(g, -0.55, 0.22, -0.55, 1.1, 0.18, 1.1, ["#f09090", "#d16a6a", "#aa4c4c", "rgba(0,0,0,.15)"], s, ox, oy);
  } else if (kind === "coin") {
    shadow(18);
    isocyl(g, 0, 0, 0, 0.55, 0.18, ["#fbd873", "#e3ad2f", "#b8831f", "rgba(0,0,0,.2)"], s, ox, oy);
  } else if (kind === "column") {
    shadow(20);
    isobox(g, -0.42, 0, -0.42, 0.84, 2.4, 0.84, kitpalettes.stone, s, ox, oy);
    isobox(g, -0.55, 2.4, -0.55, 1.1, 0.2, 1.1, kitpalettes.stone, s, ox, oy);
  } else if (kind === "crate") {
    shadow(26);
    isobox(g, -0.75, 0, -0.75, 1.5, 1.5, 1.5, pal, s, ox, oy);
    isobox(g, -0.75, 1.5, -0.75, 1.5, 0.12, 0.12, kitpalettes.wood, s, ox, oy);
  } else if (kind === "door") {
    shadow(24);
    isobox(g, -0.8, 0, -0.15, 1.6, 2.2, 0.3, pal, s, ox, oy);
    isobox(g, -0.6, 0.2, -0.2, 1.2, 1.8, 0.3, kitpalettes.wood, s, ox, oy);
  } else if (kind === "fence") {
    shadow(30);
    isobox(g, -1.2, 0, -0.08, 2.4, 0.16, 0.16, kitpalettes.wood, s, ox, oy);
    isobox(g, -1.2, 0.6, -0.08, 2.4, 0.16, 0.16, kitpalettes.wood, s, ox, oy);
    for (var f = -1.2; f <= 1.1; f += 0.75) isobox(g, f, 0, -0.08, 0.14, 1.2, 0.14, kitpalettes.wood, s, ox, oy);
  } else if (kind === "tree") {
    shadow(26);
    isobox(g, -0.16, 0, -0.16, 0.32, 1.1, 0.32, ["#c98a52", "#a9713f", "#8a5a3a", "rgba(0,0,0,.18)"], s, ox, oy);
    isobox(g, -0.8, 1.0, -0.8, 1.6, 1.0, 1.6, ["#8ce874", "#5cc446", "#3f9c3a", "rgba(0,0,0,.16)"], s, ox, oy);
    isobox(g, -0.55, 1.9, -0.55, 1.1, 0.6, 1.1, ["#a3f088", "#6ecf57", "#4fae42", "rgba(0,0,0,.12)"], s, ox, oy);
  } else if (kind === "rock") {
    shadow(24);
    isobox(g, -0.7, 0, -0.6, 1.4, 0.6, 1.2, kitpalettes.stone, s, ox, oy);
    isobox(g, -0.4, 0.6, -0.35, 0.8, 0.5, 0.7, kitpalettes.stone, s, ox, oy);
  } else if (kind === "mushroom") {
    shadow(20);
    isocyl(g, 0, 0, 0, 0.3, 0.8, ["#f4e3c5", "#e2cfae", "#c4b092", "rgba(0,0,0,.15)"], s, ox, oy);
    isocyl(g, 0, 0.8, 0, 0.8, 0.3, ["#e8503a", "#c93c2c", "#a52f22", "rgba(0,0,0,.15)"], s, ox, oy);
  } else if (kind === "flower") {
    shadow(16);
    isobox(g, -0.05, 0, -0.05, 0.1, 0.9, 0.1, ["#5cc446", "#3f9c3a", "#2f7a2c", "rgba(0,0,0,.1)"], s, ox, oy);
    isobox(g, -0.25, 0.9, -0.25, 0.5, 0.2, 0.5, pal, s, ox, oy);
  } else if (kind === "building") {
    shadow(28);
    var hgt = 1.8 + r() * 1.6;
    isobox(g, -0.8, 0, -0.8, 1.6, hgt, 1.6, pal, s, ox, oy);
    var rows = Math.floor(hgt / 0.5);
    for (var wy = 0; wy < rows; wy++) {
      g.fillStyle = "rgba(40,60,80,.5)";
      var p = isoproj(-0.35, 0.45 + wy * 0.5, 0.82, s, ox, oy);
      g.fillRect(p[0] - 6, p[1] - 3, 12, 6);
      var p2 = isoproj(0.45, 0.45 + wy * 0.5, 0.82, s, ox, oy);
      g.fillRect(p2[0] - 6, p2[1] - 3, 12, 6);
    }
  } else if (kind === "car") {
    shadow(32);
    isobox(g, -1.1, 0.12, -0.5, 2.2, 0.42, 1.0, pal, s, ox, oy);
    isobox(g, -0.6, 0.54, -0.45, 1.2, 0.42, 0.9, pal, s, ox, oy);
    isobox(g, -1.0, 0, -0.55, 0.32, 0.3, 1.1, ["#333", "#222", "#111", "rgba(0,0,0,.2)"], s, ox, oy);
    isobox(g, 0.7, 0, -0.55, 0.32, 0.3, 1.1, ["#333", "#222", "#111", "rgba(0,0,0,.2)"], s, ox, oy);
  } else if (kind === "road") {
    shadow(34);
    isobox(g, -1.4, 0, -0.9, 2.8, 0.12, 1.8, ["#8b929c", "#767d87", "#60666f", "rgba(0,0,0,.12)"], s, ox, oy);
    for (var rd = -1.2; rd < 1.3; rd += 0.6) isobox(g, rd, 0.12, -0.06, 0.3, 0.02, 0.12, ["#f0e6c8", "#ddd", "#ccc", "rgba(0,0,0,0)"], s, ox, oy);
  } else if (kind === "panel") {
    shadow(28);
    isobox(g, -0.9, 0, -0.1, 1.8, 1.3, 0.2, pal, s, ox, oy);
    isobox(g, -0.7, 0.2, -0.2, 1.4, 0.9, 0.22, kitpalettes.ui, s, ox, oy);
  } else {
    shadow(26);
    isobox(g, -0.75, 0, -0.75, 1.5, 0.2, 1.5, pal, s, ox, oy);
    isobox(g, -0.5, 0.2, -0.5, 1.0, 0.8, 1.0, pal, s, ox, oy);
  }
  artcache[key] = c;
  return c;
}

function uiitemthumb(item, pack) {
  var key = "ui|" + pack + "|" + item.n;
  if (artcache[key]) return artcache[key];
  var c = cvw(150, 120);
  var g = cx2(c);
  var pal = item.col || "#f3cf8f";
  var kind = item.k;
  function roundrect(x, y, w, h, r2, fill, stroke) {
    g.beginPath();
    g.moveTo(x + r2, y);
    g.arcTo(x + w, y, x + w, y + h, r2);
    g.arcTo(x + w, y + h, x, y + h, r2);
    g.arcTo(x, y + h, x, y, r2);
    g.arcTo(x, y, x + w, y, r2);
    g.closePath();
    g.fillStyle = fill;
    g.fill();
    if (stroke) {
      g.strokeStyle = stroke;
      g.lineWidth = 2;
      g.stroke();
    }
  }
  if (kind === "arrow") {
    g.beginPath();
    var dir = item.dir || "left";
    var cx0 = 75;
    var cy0 = 60;
    var sgn = dir === "left" ? -1 : 1;
    g.moveTo(cx0 + sgn * 34, cy0);
    g.lineTo(cx0 + sgn * 4, cy0 - 30);
    g.lineTo(cx0 + sgn * 4, cy0 - 12);
    g.lineTo(cx0 - sgn * 34, cy0 - 12);
    g.lineTo(cx0 - sgn * 34, cy0 + 12);
    g.lineTo(cx0 + sgn * 4, cy0 + 12);
    g.lineTo(cx0 + sgn * 4, cy0 + 30);
    g.closePath();
    var grd = g.createLinearGradient(0, 20, 0, 100);
    grd.addColorStop(0, item.col2 || "#ffffff");
    grd.addColorStop(1, pal);
    g.fillStyle = grd;
    g.fill();
    g.strokeStyle = "rgba(0,0,0,.18)";
    g.lineWidth = 2;
    g.stroke();
  } else if (kind === "bar") {
    roundrect(14, 34, 122, 52, 12, pal, "rgba(0,0,0,.25)");
    roundrect(20, 40, 110, 40, 10, artdarken(pal, 0.82));
    roundrect(26, 46, 70, 28, 8, artdarken(pal, 0.55));
  } else if (kind === "icon") {
    roundrect(50, 30, 50, 50, 10, pal, "rgba(0,0,0,.2)");
  } else if (kind === "frame") {
    roundrect(22, 20, 106, 80, 12, artmix(pal, "#ffffff", 0.55), pal);
    roundrect(30, 28, 90, 64, 9, artdarken(pal, 0.48));
    roundrect(32, 30, 86, 60, 8, "#2e3238");
  } else {
    roundrect(18, 22, 114, 76, 10, "#d9d9df", "rgba(0,0,0,.2)");
    for (var i = 0; i < 8; i++) {
      g.fillStyle = "rgba(0,0,0,.14)";
      g.fillRect(22 + i * 14, 24, 8, 72);
    }
  }
  artcache[key] = c;
  return c;
}

function templateart(id) {
  var key = "tpl|" + id;
  if (artcache[key]) return artcache[key];
  var c = cvw(480, 270);
  var g = cx2(c);
  var sky = g.createLinearGradient(0, 0, 0, 270);
  sky.addColorStop(0, "#bfe0fb");
  sky.addColorStop(1, "#dcf0ff");
  g.fillStyle = sky;
  g.fillRect(0, 0, 480, 270);
  function ground(col, top, horizon) {
    g.fillStyle = col;
    g.beginPath();
    g.moveTo(0, horizon);
    g.lineTo(480, horizon);
    g.lineTo(480, 270);
    g.lineTo(0, 270);
    g.closePath();
    g.fill();
    g.fillStyle = top;
    g.fillRect(0, horizon, 480, 12);
  }
  function box2(x, y, w, h, col, top) {
    g.fillStyle = col;
    g.fillRect(x, y, w, h);
    g.fillStyle = top || col;
    g.fillRect(x, y, w, Math.max(3, h * 0.18));
  }
  function groundgrid(horizon, col) {
    g.strokeStyle = col;
    g.lineWidth = 1;
    for (var i = 0; i <= 12; i++) {
      g.beginPath();
      g.moveTo(i * 40, horizon);
      g.lineTo(i * 90 - 240, 270);
      g.stroke();
    }
    for (var j = 1; j < 8; j++) {
      var y = horizon + Math.pow(j / 8, 2) * (270 - horizon);
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(480, y);
      g.stroke();
    }
  }
  if (id === "empty") {
    ground("#9adf8e", "#7ed36f", 168);
    groundgrid(168, "rgba(80,160,90,.35)");
  } else if (id === "physics") {
    ground("#b6e3f7", "#9ed3ee", 172);
    groundgrid(172, "rgba(120,180,210,.35)");
    var cols = ["#f08a5d", "#f7c948", "#7ed36f", "#7fa8e8"];
    for (var i = 0; i < 4; i++) box2(150 + i * 44, 120 + (i % 2) * 10, 34, 34, cols[i]);
    g.fillStyle = "#e8eef6";
    g.beginPath();
    g.arc(300, 130, 22, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "rgba(0,0,0,.14)";
    g.beginPath();
    g.ellipse(300, 205, 30, 10, 0, 0, Math.PI * 2);
    g.fill();
  } else if (id === "rollaball") {
    ground("#b7e6f8", "#a2d8ef", 168);
    groundgrid(168, "rgba(120,180,210,.3)");
    for (var k = 0; k < 6; k++) {
      g.fillStyle = "#f7c948";
      g.beginPath();
      g.ellipse(150 + k * 34, 200 - (k % 3) * 26, 13, 6, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#e3ad2f";
      g.fillRect(144 + k * 34, 198 - (k % 3) * 26, 26, 3);
    }
    g.fillStyle = "#5aa9d1";
    g.beginPath();
    g.arc(260, 208, 20, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "rgba(255,255,255,.45)";
    g.beginPath();
    g.arc(253, 200, 7, 0, Math.PI * 2);
    g.fill();
  } else if (id === "platform3d") {
    ground("#9fe0b4", "#83d39b", 174);
    g.fillStyle = "rgba(255,255,255,.35)";
    g.beginPath();
    g.moveTo(80, 150);
    g.lineTo(150, 120);
    g.lineTo(220, 150);
    g.lineTo(150, 176);
    g.closePath();
    g.fill();
    box2(120, 178, 60, 26, "#8a5bd6", "#a97ff0");
    g.fillStyle = "#f7e2bd";
    g.beginPath();
    g.arc(150, 168, 13, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#2b2b33";
    g.fillRect(142, 164, 4, 5);
    g.fillRect(154, 164, 4, 5);
    var tree = artmake("tree");
    g.drawImage(tree, 330, 120, 54, 54);
    g.drawImage(tree, 400, 140, 42, 42);
  } else if (id === "platform2d") {
    g.fillStyle = "#c5e4ff";
    g.fillRect(0, 0, 480, 270);
    var hills = artmake("nearhills");
    g.drawImage(hills, -20, 120, 300, 150);
    g.drawImage(hills, 210, 130, 300, 140);
    g.drawImage(artmake("farhills"), -30, 108, 300, 140);
    g.drawImage(artmake("farhills"), 220, 116, 300, 130);
    g.drawImage(artmake("tiles"), 20, 190, 190, 80);
    g.drawImage(artmake("tiles"), 290, 200, 170, 70);
    g.drawImage(artmake("tiles"), 240, 168, 90, 42);
    g.drawImage(artmake("hero"), 96, 152, 34, 34);
    g.drawImage(artmake("coin"), 216, 136, 20, 20);
    g.drawImage(artmake("slime"), 300, 172, 26, 26);
    g.drawImage(artmake("flag"), 414, 148, 26, 26);
    g.drawImage(artmake("heart"), 150, 168, 16, 16);
  } else if (id === "runner") {
    g.fillStyle = "#a8dcc8";
    g.fillRect(0, 0, 480, 130);
    g.fillStyle = "#7cc7a8";
    g.beginPath();
    g.moveTo(170, 130);
    g.lineTo(310, 130);
    g.lineTo(480, 270);
    g.lineTo(0, 270);
    g.fill();
    g.strokeStyle = "rgba(255,255,255,.65)";
    g.lineWidth = 5;
    g.beginPath();
    g.moveTo(240, 130);
    g.lineTo(140, 270);
    g.moveTo(240, 130);
    g.lineTo(340, 270);
    g.stroke();
    g.strokeStyle = "rgba(255,255,255,.35)";
    g.lineWidth = 3;
    for (var r = 0; r < 5; r++) {
      g.beginPath();
      g.moveTo(240 - r * 8, 150 + r * 24);
      g.lineTo(240 + r * 8, 150 + r * 24);
      g.stroke();
    }
    var hero = artmake("hero");
    g.drawImage(hero, 212, 150, 34, 34);
    var crate = artmake("crate");
    g.drawImage(crate, 160, 120, 26, 26);
    g.drawImage(crate, 300, 108, 22, 22);
    var tree = artmake("tree");
    g.drawImage(tree, 40, 70, 70, 70);
    g.drawImage(tree, 380, 80, 62, 62);
  } else if (id === "arena") {
    g.fillStyle = "#2e3542";
    g.fillRect(0, 0, 480, 270);
    g.fillStyle = "#38424f";
    g.beginPath();
    g.moveTo(0, 120);
    g.lineTo(480, 120);
    g.lineTo(480, 270);
    g.lineTo(0, 270);
    g.fill();
    g.strokeStyle = "rgba(180,205,230,.28)";
    for (var i = 0; i < 10; i++) {
      g.beginPath();
      g.moveTo(i * 48, 120);
      g.lineTo(i * 96 - 240, 270);
      g.stroke();
    }
    for (var j = 0; j < 7; j++) {
      g.beginPath();
      g.moveTo(0, 128 + j * j * 3.4);
      g.lineTo(480, 128 + j * j * 3.4);
      g.stroke();
    }
    g.fillStyle = "#f0f4fa";
    g.beginPath();
    g.arc(240, 200, 18, 0, Math.PI * 2);
    g.fill();
    var slime = artmake("slime");
    g.drawImage(slime, 120, 96, 34, 34);
    g.drawImage(slime, 320, 80, 30, 30);
    g.drawImage(slime, 380, 140, 26, 26);
  } else if (id === "hill") {
    g.fillStyle = "#a8dfae";
    g.fillRect(0, 0, 480, 270);
    var hills2 = artmake("nearhills");
    g.drawImage(hills2, -10, 100, 300, 160);
    g.drawImage(hills2, 200, 118, 300, 150);
    g.fillStyle = "#7fc9e8";
    g.beginPath();
    g.ellipse(250, 235, 90, 26, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#f7e2bd";
    g.beginPath();
    g.arc(250, 205, 16, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#f7c948";
    g.fillRect(240, 150, 8, 8);
    g.fillRect(290, 172, 8, 8);
    var tree2 = artmake("tree");
    g.drawImage(tree2, 60, 120, 80, 80);
    g.drawImage(tree2, 360, 108, 70, 70);
  } else if (id === "space") {
    g.fillStyle = "#141a2b";
    g.fillRect(0, 0, 480, 270);
    var r3 = rng(5);
    for (var s2 = 0; s2 < 90; s2++) {
      g.fillStyle = "rgba(255,255,255," + (0.25 + r3() * 0.7) + ")";
      g.fillRect(r3() * 480, r3() * 270, 1.6, 1.6);
    }
    g.fillStyle = "#7fb6e8";
    g.beginPath();
    g.moveTo(240, 220);
    g.lineTo(256, 240);
    g.lineTo(224, 240);
    g.closePath();
    g.fill();
    g.fillStyle = "#dfe9f7";
    g.fillRect(236, 240, 8, 10);
    g.fillStyle = "#d16a6a";
    g.beginPath();
    g.arc(240, 244, 8, 0, Math.PI * 2);
    g.fill();
    for (var e = 0; e < 4; e++) {
      g.fillStyle = "#8ad0f0";
      g.beginPath();
      g.arc(80 + e * 100, 70 + (e % 2) * 30, 9, 0, Math.PI * 2);
      g.fill();
    }
  } else if (id === "tilemap2d") {
    var sky2 = g.createLinearGradient(0, 0, 0, 270);
    sky2.addColorStop(0, "#9ed2f7");
    sky2.addColorStop(1, "#d7efff");
    g.fillStyle = sky2;
    g.fillRect(0, 0, 480, 270);
    for (var tc = 0; tc < 12; tc++) {
      box2(tc * 40, 196, 40, 30, "#c08a54", "#67c95c");
      box2(tc * 40, 226, 40, 34, "#a8763f", "#c08a54");
    }
    for (var tc2 = 0; tc2 < 4; tc2++) box2(120 + tc2 * 40, 156, 40, 40, "#c25c46", "#67c95c");
    for (var tc3 = 0; tc3 < 3; tc3++) box2(300 + tc3 * 40, 116, 40, 80, "#8f949c", "#b6bcc6");
    g.drawImage(artmake("coin"), 150, 118, 26, 26);
    g.drawImage(artmake("coin"), 190, 118, 26, 26);
    g.drawImage(artmake("coin"), 310, 78, 26, 26);
    g.drawImage(artmake("hero"), 40, 156, 42, 42);
    g.drawImage(artmake("flag"), 410, 96, 40, 40);
  } else if (id === "uikit") {
    g.fillStyle = "#1a2433";
    g.fillRect(0, 0, 480, 270);
    g.fillStyle = "#243349";
    g.fillRect(60, 34, 360, 202);
    g.fillStyle = "#ffffff";
    g.font = "700 22px Inter, sans-serif";
    g.fillText("Roxumitod Game Engine", 108, 76);
    g.fillStyle = "#2f6fd0";
    g.fillRect(160, 96, 160, 34);
    g.fillStyle = "#ffffff";
    g.font = "600 15px Inter, sans-serif";
    g.fillText("Start game", 210, 118);
    g.fillStyle = "#39465c";
    g.fillRect(140, 146, 200, 8);
    g.fillStyle = "#5b8def";
    g.fillRect(140, 146, 140, 8);
    g.beginPath();
    g.arc(280, 150, 9, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#2a3446";
    g.fillRect(300, 168, 100, 14);
    g.fillStyle = "#37c46f";
    g.fillRect(300, 168, 80, 14);
    g.strokeStyle = "#5b8def";
    g.lineWidth = 3;
    g.beginPath();
    g.arc(102, 196, 22, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = "#5b8def";
    g.beginPath();
    g.arc(102, 196, 9, 0, Math.PI * 2);
    g.fill();
  } else if (id === "fxlab") {
    g.fillStyle = "#0e1522";
    g.fillRect(0, 0, 480, 270);
    g.fillStyle = "#2c3a46";
    g.fillRect(0, 214, 480, 56);
    var fr = rng(9);
    for (var fc = 0; fc < 26; fc++) {
      g.fillStyle = "rgba(255," + Math.round(120 + fr() * 90) + ",40,0.85)";
      g.beginPath();
      g.arc(96 + fr() * 40, 200 - fc * 4.4, 5 + fr() * 7, 0, Math.PI * 2);
      g.fill();
    }
    for (var sc = 0; sc < 16; sc++) {
      g.fillStyle = "rgba(190,200,215," + (0.18 + fr() * 0.3) + ")";
      g.beginPath();
      g.arc(206 + fr() * 40, 205 - sc * 7, 8 + fr() * 10, 0, Math.PI * 2);
      g.fill();
    }
    var cols = ["#ff5f6d", "#ffc371", "#5ee7df", "#8e7cff"];
    for (var cc = 0; cc < 22; cc++) {
      g.fillStyle = cols[cc % 4];
      g.save();
      g.translate(330 + fr() * 90, 60 + fr() * 120);
      g.rotate(fr() * 3);
      g.fillRect(-4, -2, 8, 4);
      g.restore();
    }
  } else if (id === "navdemo") {
    g.fillStyle = "#c9d9e6";
    g.fillRect(0, 0, 480, 270);
    g.fillStyle = "#9aa2ad";
    g.fillRect(20, 20, 440, 230);
    g.fillStyle = "#8f97a3";
    var walls = [[70, 60, 60, 26], [200, 40, 26, 110], [300, 96, 26, 120], [360, 40, 60, 24]];
    walls.forEach(function (w) {
      g.fillRect(w[0], w[1], w[2], w[3]);
    });
    g.fillStyle = "rgba(90,200,255,0.22)";
    for (var nx = 0; nx < 11; nx++) {
      for (var ny = 0; ny < 6; ny++) {
        var ok = true;
        walls.forEach(function (w) {
          if (30 + nx * 40 > w[0] - 14 && 30 + nx * 40 < w[0] + w[2] + 14 && 40 + ny * 40 > w[1] - 14 && 40 + ny * 40 < w[1] + w[3] + 14) ok = false;
        });
        if (ok) g.fillRect(30 + nx * 40, 40 + ny * 40, 12, 12);
      }
    }
    g.drawImage(artmake("hero"), 44, 200, 34, 34);
    g.drawImage(artmake("slime"), 380, 180, 30, 30);
  } else if (id === "ragdolldemo") {
    g.fillStyle = "#28313d";
    g.fillRect(0, 0, 480, 270);
    g.fillStyle = "#3a4553";
    g.fillRect(0, 206, 480, 64);
    g.fillStyle = "#7f8794";
    g.fillRect(0, 206, 480, 8);
    g.fillStyle = "#b9c1cc";
    g.fillRect(150, 176, 46, 26);
    g.fillStyle = "#c9d0da";
    g.fillRect(196, 150, 40, 22);
    g.fillStyle = "#a9b2bd";
    g.fillRect(236, 176, 30, 18);
    g.fillStyle = "#d16a6a";
    g.beginPath();
    g.arc(330, 186, 14, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#e2b33f";
    g.beginPath();
    g.arc(372, 176, 11, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#5aa9e6";
    g.beginPath();
    g.arc(404, 168, 9, 0, Math.PI * 2);
    g.fill();
  } else if (id === "kart") {
    ground("#9ab7a1", "#8aab92", 150);
    g.fillStyle = "#6b7a70";
    g.beginPath();
    g.moveTo(200, 150);
    g.lineTo(280, 150);
    g.lineTo(420, 270);
    g.lineTo(60, 270);
    g.fill();
    g.strokeStyle = "#e8e8e8";
    g.setLineDash([14, 16]);
    g.beginPath();
    g.moveTo(240, 160);
    g.lineTo(240, 270);
    g.stroke();
    g.setLineDash([]);
    g.fillStyle = "#d16a6a";
    g.beginPath();
    g.ellipse(240, 210, 26, 12, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#2b2b33";
    g.fillRect(226, 206, 28, 4);
    var tree3 = artmake("tree");
    g.drawImage(tree3, 60, 80, 70, 70);
    g.drawImage(tree3, 360, 92, 60, 60);
  } else {
    ground("#addcc0", "#96d0ab", 170);
    var tree4 = artmake("tree");
    for (var t = 0; t < 4; t++) g.drawImage(tree4, 60 + t * 100, 96 + (t % 2) * 20, 56, 56);
    g.drawImage(artmake("crate"), 200, 160, 36, 36);
  }
  artcache[key] = c;
  return c;
}
