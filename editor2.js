function renderright() {
  var tabs = qs("#righttabs");
  if (!tabs) return;
  tabs.innerHTML = '<button class="segtab' + (app.right === "inspector" ? " on" : "") + '" data-act="righttab" data-tab="inspector">' + ic("sliders", "ico-sm") + 'Details</button><button class="segtab' + (app.right === "scene" ? " on" : "") + '" data-act="righttab" data-tab="scene">' + ic("sun", "ico-sm") + "World Settings</button>";
  var body = qs("#rightbody");
  body.innerHTML = app.right === "inspector" ? inspectorhtml() : scenesettingshtml();
  if (typeof plugfire === "function") {
    if (!renderright.lastid || renderright.lastid !== app.selid) {
      renderright.lastid = app.selid;
      plugfire("selection", selected());
    }
  }
}

function secopen(id) {
  var closed = (app.collapsed && app.collapsed[id]) || (app.closedsecs && app.closedsecs[id]);
  return closed ? '<div class="secbody hide">' : '<div class="secbody">';
}

function compvalue(node, comp, key, fallback) {
  var d = node.compdata && node.compdata[comp];
  return d && d[key] !== undefined ? d[key] : fallback;
}

function inspectorhtml() {
  var node = selected();
  if (!node) {
    var stats = [];
    walk(app.scene.objects, function (n) {
      stats.push(n);
    });
    return '<div class="insphead"><button class="name" data-act="scenemenu">' + ic("cube", "ico-sm") + "<span>" + esc(app.scene.name) + '</span><span class="dim">' + ic("chevd", "ico-xs") + '</span></button><button class="iconbtn star" data-act="markstart" title="Start scene">' + ic("star") + '</button><button class="btn sm projbtn" data-act="projectsettings">' + ic("gear", "ico-sm") + "Project</button></div>" +
      '<div class="checkrow">' + check("Visible", true, "disabled") + check("Active", true, "disabled") + "</div>" +
      '<div class="addrow" style="justify-content:flex-start;padding:0 8px" data-act="addtag">' + ic("plus", "ico-xs") + "+ tag</div>" +
      '<div class="sec"><div class="sechead"><span class="tw">' + ic("chevd", "ico-xs") + '</span>' + ic("scene", "ico-sm") + "<span>Scene</span></div>" +
      '<div class="secbody">' + srow("Name", '<input class="inp" value="' + esc(app.scene.name) + '" data-sfield="name">') +
      srow("Objects", '<span class="tiny muted">' + plural(stats.length, "object") + " · " + plural(alltags ? Object.keys(alltags()).length : 0, "tag") + "</span>") +
      srow("Start scene", '<span class="tiny muted">' + (app.project.startscene === app.scene.id ? "Yes" : "No") + "</span>") +
      "</div></div>" +
      '<div class="sec"><div class="sechead"><span class="tw">' + ic("chevd", "ico-xs") + '</span>' + ic("sun", "ico-sm") + "<span>Environment</span></div><div class=\"secbody\">" +
      srow("Background", '<select class="inp" data-sfield="env.bgtype"><option value="color"' + (app.scene.env.bgtype !== "sky" ? " selected" : "") + '>Color</option><option value="sky"' + (app.scene.env.bgtype === "sky" ? " selected" : "") + ">Sky image (360°)</option></select>") +
      srow("Ambient strength", '<input class="slider" type="range" min="0" max="2" step="0.05" value="' + (app.scene.env.strength || 0.6) + '" data-sfield="env.strength"><input class="inp num numin" type="number" min="0" max="2" step="0.05" value="' + (app.scene.env.strength || 0.6) + '" data-sfield="env.strength">') +
      "</div></div>" +
      '<div class="emptystate">Select an actor in the viewport or the World Outliner to inspect it.</div>';
  }
  var html = '<div class="insphead"><button class="name" data-act="renamesel">' + ic(sceneicon(node.type, node.sprite), "ico-sm") + "<span>" + esc(node.name) + '</span><span class="dim">' + ic("chevd", "ico-xs") + '</span></button><button class="iconbtn star" data-act="markstart" title="Start scene">' + ic("star") + "</button>" + '<button class="btn sm projbtn" data-act="projectsettings">' + ic("gear", "ico-sm") + "Project</button></div>";
  html += '<div class="checkrow">' + check("Visible", node.visible !== false, 'data-node="' + node.id + '" data-field="visible"') + check("Active", node.active !== false, 'data-node="' + node.id + '" data-field="active"') + check("Locked", !!node.lock, 'data-node="' + node.id + '" data-field="lock"') + "</div>";
  html += '<div class="tagrow">' + (node.tags || []).map(function (t) {
    return '<span class="tagchip">' + esc(t) + '<button class="x" data-act="removetag" data-id="' + node.id + '" data-tag="' + esc(t) + '">' + ic("x", "ico-xs") + "</button></span>";
  }).join("") + '<button class="tagadd" data-act="addtag">+ tag</button></div>';

  html += '<div class="sec">' + sechead("move", "Transform", "transform", '<button class="iconbtn" data-act="resettransform" title="Reset">' + ic("rotate", "ico-xs") + "</button>") + secopen("transform") + vectorrow("Position", node, "pos", ["x", "y", "z"]) + vectorrow("Rotation (°)", node, "rot", ["x", "y", "z"]) + vectorrow("Scale", node, "scl", ["x", "y", "z"]) + "</div>";

  (node.comps || []).forEach(function (c) {
    html += compsection(node, c);
  });

  html += '<button class="addrow" data-act="addcomponent">' + ic("plus", "ico-xs") + "Add component</button>";
  html += behaviorsection(node);
  html += '<div class="sec"><div class="sechead"><span class="tw">' + ic("chevd", "ico-xs") + '</span>' + ic("variable", "ico-sm") + "<span>Instance variables</span></div><div class=\"secbody\">";
  if (!(node.vars || []).length) html += '<div class="emptyhint">No instance variables.</div>';
  (node.vars || []).forEach(function (v, i) {
    html += '<div class="gvarrow"><input class="inp nm" value="' + esc(v.name) + '" data-node="' + node.id + '" data-vfield="' + i + '" data-vkey="name"><span class="axis ' + (v.type === "text" ? "z" : "y") + '">' + (v.type === "text" ? "T" : "123") + '</span><input class="inp" value="' + esc(v.value) + '" data-node="' + node.id + '" data-vfield="' + i + '"><button class="iconbtn" data-act="removevar" data-id="' + node.id + '" data-index="' + i + '">' + ic("trash", "ico-xs") + "</button></div>";
  });
  html += '<button class="addrow" data-act="addvar">' + ic("plus", "ico-xs") + "Add variable</button></div></div>";
  return html;
}

function compsection(node, comp) {
  var meta = null;
  compmeta.forEach(function (m) {
    if (m.id === comp) meta = m;
  });
  if (!meta) return "";
  var tools = '<button class="iconbtn" data-act="removecomponent" data-id="' + node.id + '" data-comp="' + comp + '" title="Remove">' + ic("dots", "ico-xs") + "</button>";
  var title = meta.label;
  var body = "";
  if (comp === "sprite") {
    var info = spriteinfo[node.sprite] || null;
    body += srow("Sprite", '<button class="assetpick" data-act="picksprite">' + (info && info.custom ? '<img src="' + (projectasset(info.name) ? projectasset(info.name).data : "") + '">' : info ? '<img src="' + arturln(node.sprite) + '">' : "") + "<span>" + esc(info ? info.name : "None") + '</span><span class="caret">' + ic("chevr", "ico-xs") + "</span></button>");
    body += '<div class="row mb6" style="padding-left:8px;gap:6px"><button class="btn sm" data-act="newsprite">' + ic("pen", "ico-sm") + 'New sprite</button><button class="btn sm" data-act="editsprite">' + ic("brush", "ico-sm") + "Edit</button></div>";
    body += srow("Pixels per meter (0 = auto)", '<input class="inp num" type="number" value="' + (node.ppm || 64) + '" data-node="' + node.id + '" data-field="ppm">');
    body += srow("Color", '<div class="colorbox"><input type="color" value="' + esc(node.color || "#ffffff") + '" data-node="' + node.id + '" data-field="color"></div><input class="inp" value="' + esc(node.color || "#ffffff") + '" data-node="' + node.id + '" data-field="color">');
    body += '<div class="frow"><div class="flabel">Opacity</div><div class="fctrl"><input class="slider" type="range" min="0" max="1" step="0.01" value="' + node.opacity + '" data-node="' + node.id + '" data-field="opacity"><input class="inp num numin" type="number" min="0" max="1" step="0.01" value="' + node.opacity + '" data-node="' + node.id + '" data-field="opacity"></div></div>';
    body += '<div class="frow"><div class="flabel"></div><div class="fctrl" style="gap:22px">' + check("Flip X", !!node.flipx, 'data-node="' + node.id + '" data-field="flipx"') + check("Flip Y", !!node.flipy, 'data-node="' + node.id + '" data-field="flipy"') + "</div></div>";
    body += srow("Face camera", '<select class="inp" data-node="' + node.id + '" data-field="facecamera"><option value="false"' + (!node.facecamera ? " selected" : "") + '>No</option><option value="true"' + (node.facecamera ? " selected" : "") + ">Yes</option></select>");
  } else if (comp === "camera") {
    body += srow("Projection", '<select class="inp" data-cfield="camera.projection"><option>Perspective</option><option>Orthographic</option></select>');
    body += srow("Field of view", '<input class="inp num" type="number" value="' + compvalue(node, "camera", "fov", 50) + '" data-cfield="camera.fov">');
    body += srow("Near / Far", '<input class="inp num" type="number" step="0.1" value="' + compvalue(node, "camera", "near", 0.1) + '" data-cfield="camera.near"><input class="inp num" type="number" value="' + compvalue(node, "camera", "far", 500) + '" data-cfield="camera.far">');
  } else if (comp === "light") {
    body += srow("Type", '<select class="inp" data-cfield="light.type"><option>Directional</option><option>Point</option><option>Spot</option></select>');
    body += srow("Color", '<div class="colorbox"><input type="color" value="' + esc(compvalue(node, "light", "color", "#ffffff")) + '" data-cfield="light.color"></div><input class="inp" value="' + esc(compvalue(node, "light", "color", "#ffffff")) + '" data-cfield="light.color">');
    body += srow("Intensity", '<input class="slider" type="range" min="0" max="3" step="0.05" value="' + compvalue(node, "light", "intensity", 1) + '" data-cfield="light.intensity"><input class="inp num numin" type="number" step="0.05" value="' + compvalue(node, "light", "intensity", 1) + '" data-cfield="light.intensity">');
    body += '<div class="frow"><div class="flabel"></div><div class="fctrl">' + check("Cast shadows", true, 'data-cfield="light.shadows"') + "</div></div>";
  } else if (comp === "collider") {
    body += srow("Shape", '<select class="inp" data-cfield="collider.shape">' + ["Box", "Circle", "Capsule", "Convex", "Heightfield", "Trimesh"].map(function (o) {
      return "<option" + (compvalue(node, "collider", "shape", "Box") === o ? " selected" : "") + ">" + o + "</option>";
    }).join("") + "</select>");
    body += '<div class="frow"><div class="flabel"></div><div class="fctrl">' + check("Is trigger", compvalue(node, "collider", "trigger", false), 'data-cfield="collider.trigger"') + check("Show in viewport", app.showcolliders, 'data-act="togglecolliders"') + "</div></div>";
    body += srow("Size", '<input class="inp num" type="number" step="0.1" value="' + compvalue(node, "collider", "width", 1) + '" data-cfield="collider.width"><input class="inp num" type="number" step="0.1" value="' + compvalue(node, "collider", "height", 1) + '" data-cfield="collider.height"><input class="inp num" type="number" step="0.1" value="' + compvalue(node, "collider", "depth", 1) + '" data-cfield="collider.depth">');
    body += srow("Offset", '<input class="inp num" type="number" step="0.05" value="' + compvalue(node, "collider", "ox", 0) + '" data-cfield="collider.ox"><input class="inp num" type="number" step="0.05" value="' + compvalue(node, "collider", "oy", 0) + '" data-cfield="collider.oy">');
  } else if (comp === "physics") {
    body += srow("Type", '<select class="inp" data-cfield="physics.type">' + ["Dynamic", "Static", "Kinematic"].map(function (o) {
      return "<option" + (compvalue(node, "physics", "type", "Dynamic") === o ? " selected" : "") + ">" + o + "</option>";
    }).join("") + "</select>");
    body += srow("Mass", '<input class="inp num" type="number" step="0.1" value="' + compvalue(node, "physics", "mass", 1) + '" data-cfield="physics.mass">');
    body += sliderrow("Gravity scale", compvalue(node, "physics", "gravity", 1), 0, 4, 0.1, 'data-cfield="physics.gravity"');
    body += srow("Friction", '<input class="slider" type="range" min="0" max="1" step="0.05" value="' + compvalue(node, "physics", "friction", 0.4) + '" data-cfield="physics.friction"><input class="inp num numin" type="number" step="0.05" value="' + compvalue(node, "physics", "friction", 0.4) + '" data-cfield="physics.friction">');
    body += sliderrow("Bounciness", compvalue(node, "physics", "rest", 0.25), 0, 1, 0.05, 'data-cfield="physics.rest"');
    body += sliderrow("Linear damping", compvalue(node, "physics", "damp", 0.02), 0, 0.5, 0.01, 'data-cfield="physics.damp"');
    body += '<div class="row" style="gap:6px;padding:4px 0 2px"><button class="btn sm" data-act="physwake">' + ic("refresh", "ico-xs") + 'Reset body</button><button class="btn sm" data-act="physimpulse">' + ic("arrowup", "ico-xs") + "Impulse</button></div>";
  } else if (comp === "sound") {
    body += srow("Sound", '<select class="inp" data-cfield="sound.asset">' + soundassets.map(function (s) {
      return "<option>" + esc(s.name) + "</option>";
    }).join("") + "</select>");
    body += sliderrow("Volume", compvalue(node, "sound", "volume", 1), 0, 1, 0.05, 'data-cfield="sound.volume"');
    body += '<div class="frow"><div class="flabel"></div><div class="fctrl">' + check("Loop", compvalue(node, "sound", "loop", false), 'data-cfield="sound.loop"') + "</div></div>";
    body += srow("Mixer group", '<select class="inp" data-cfield="sound.group">' + mixergroups.map(function (g) {
      return "<option" + (compvalue(node, "sound", "group", "SFX") === g ? " selected" : "") + ">" + g + "</option>";
    }).join("") + '</select><button class="iconbtn" data-act="mixer" title="Audio mixer">' + ic("sliders", "ico-xs") + "</button>");
  } else if (comp === "text") {
    body += srow("Text", '<input class="inp" value="' + esc(node.text || "") + '" data-node="' + node.id + '" data-field="text">');
    body += srow("Size", '<input class="inp num" type="number" value="' + compvalue(node, "text", "size", 24) + '" data-cfield="text.size">');
    body += srow("Color", '<div class="colorbox"><input type="color" value="' + esc(compvalue(node, "text", "color", "#ffffff")) + '" data-cfield="text.color"></div><input class="inp" value="' + esc(compvalue(node, "text", "color", "#ffffff")) + '" data-cfield="text.color">');
  } else if (comp === "ui") {
    if (node.type === "canvas" || node.type === "screengui") {
      body += srow("Render mode", '<select class="inp" data-cfield="ui.render"><option>Screen Space - Overlay</option><option>Screen Space - Camera</option><option>World Space</option></select>');
      body += '<div class="frow"><div class="flabel">Physical</div><div class="fctrl">' + check("Place every child in the 3D world (SurfaceGui)", node.physical, 'data-guitoggle="' + node.id + '"') + "</div></div>";
      body += srow("Sort order", '<input class="inp num" type="number" value="' + compvalue(node, "ui", "sort", 0) + '" data-cfield="ui.sort">');
      body += '<div class="frow"><div class="flabel">Canvas Scaler</div><div class="fctrl"></div></div>';
      body += srow("UI scale mode", '<select class="inp" data-cfield="ui.scalemode"><option>Scale with screen size</option><option>Constant pixel size</option><option>Constant physical size</option></select>');
      body += srow("Reference resolution", '<span class="tiny dim">W</span><input class="inp num" type="number" value="' + compvalue(node, "ui", "refw", 740) + '" data-cfield="ui.refw"><span class="tiny dim">H</span><input class="inp num" type="number" value="' + compvalue(node, "ui", "refh", 360) + '" data-cfield="ui.refh">');
      body += srow("Screen match mode", '<select class="inp" data-cfield="ui.match"><option>Expand</option><option>Match width or height</option><option>Shrink</option></select>');
    } else {
      var anchors = ["Top left", "Top center", "Top right", "Center", "Bottom left", "Bottom center", "Bottom right"];
      body += srow("Anchor", '<select class="inp" data-cfield="ui.anchor">' + anchors.map(function (a) {
        return "<option" + (compvalue(node, "ui", "anchor", "Center") === a ? " selected" : "") + ">" + a + "</option>";
      }).join("") + "</select>");
      body += srow("Position", '<input class="inp num" type="number" value="' + compvalue(node, "ui", "x", 0) + '" data-cfield="ui.x"><input class="inp num" type="number" value="' + compvalue(node, "ui", "y", 0) + '" data-cfield="ui.y">');
      body += srow("Size", '<input class="inp num" type="number" value="' + compvalue(node, "ui", "w", 200) + '" data-cfield="ui.w"><input class="inp num" type="number" value="' + compvalue(node, "ui", "h", 48) + '" data-cfield="ui.h">');
      body += sliderrow("Pivot", compvalue(node, "ui", "pivot", 0.5), 0, 1, 0.05, 'data-cfield="ui.pivot"');
      if (node.type === "label" || node.type === "button") body += srow("Label", '<input class="inp" value="' + esc(node.text || "") + '" data-node="' + node.id + '" data-field="text">');
      body += srow("Font size", '<input class="inp num" type="number" value="' + compvalue(node, "ui", "fontsize", node.type === "label" ? 24 : 18) + '" data-cfield="ui.fontsize"><select class="inp" data-cfield="ui.font"><option>Inter</option><option>Georgia</option><option>monospace</option></select>');
      body += '<div class="frow"><div class="flabel"></div><div class="fctrl">' + check("Bold", compvalue(node, "ui", "bold", true), 'data-cfield="ui.bold"') + check("Italic", compvalue(node, "ui", "italic", false), 'data-cfield="ui.italic"') + "</div></div>";
      body += srow("Fill color", '<div class="colorbox"><input type="color" value="' + esc(compvalue(node, "ui", "color", "#2f6fd0")) + '" data-cfield="ui.color"></div><input class="inp" value="' + esc(compvalue(node, "ui", "color", "#2f6fd0")) + '" data-cfield="ui.color">');
      body += srow("Text color", '<div class="colorbox"><input type="color" value="' + esc(compvalue(node, "ui", "textcolor", "#ffffff")) + '" data-cfield="ui.textcolor"></div><input class="inp" value="' + esc(compvalue(node, "ui", "textcolor", "#ffffff")) + '" data-cfield="ui.textcolor">');
      body += sliderrow("Corner radius", compvalue(node, "ui", "radius", 8), 0, 40, 1, 'data-cfield="ui.radius"');
      if (node.type === "bar" || node.type === "slider") body += sliderrow("Value", compvalue(node, "ui", "value", 0.6), 0, 1, 0.01, 'data-cfield="ui.value"');
      if (node.type === "button") {
        body += srow("On click", '<select class="inp" data-cfield="ui.action"><option value="">Run events</option><option value="restart">Restart game</option><option value="scene">Go to scene</option></select>');
        body += srow("Target scene", '<input class="inp" value="' + esc(compvalue(node, "ui", "scene", "")) + '" data-cfield="ui.scene">');
      }
      if (node.type === "frame" || node.type === "image") {
        if (node.type === "image") body += srow("Sprite", '<input class="inp" value="' + esc(node.sprite || "") + '" data-node="' + node.id + '" data-field="sprite">');
        body += srow("Text", '<input class="inp" value="' + esc(node.text || "") + '" data-node="' + node.id + '" data-field="text">');
      }
      body += '<div class="frow"><div class="flabel">Physical</div><div class="fctrl">' + check("Render this element in the 3D world", node.physical, 'data-guitoggle="' + node.id + '"') + "</div></div>";
      body += '<div class="row" style="padding:4px 0 2px"><button class="btn sm" data-act="uitest">' + ic("play", "ico-xs") + 'Test UI</button><button class="btn sm ghost" data-act="guiservice">' + ic("layers", "ico-xs") + "GUI service</button></div>";
    }
  } else if (comp === "particles") {
    var pdef = fxpresets[compvalue(node, "particles", "preset", "fire")] || fxpresets.fire;
    body += srow("Preset", '<select class="inp" data-cfield="particles.preset">' + Object.keys(fxpresets).map(function (k) {
      return "<option" + (compvalue(node, "particles", "preset", "fire") === k ? " selected" : "") + ">" + k + "</option>";
    }).join("") + "</select>");
    body += fxpreviewhtml();
    body += srow("Rate /s", '<input class="inp num" type="number" step="1" value="' + compvalue(node, "particles", "rate", pdef.rate) + '" data-cfield="particles.rate"><input class="inp num" type="number" step="1" value="' + compvalue(node, "particles", "burst", pdef.burst) + '" data-cfield="particles.burst" title="burst count">');
    body += sliderrow("Lifetime", compvalue(node, "particles", "life", pdef.life), 0.1, 5, 0.05, 'data-cfield="particles.life"');
    body += sliderrow("Size", compvalue(node, "particles", "size", pdef.size), 0.02, 2, 0.02, 'data-cfield="particles.size"');
    body += sliderrow("Speed", compvalue(node, "particles", "speed", pdef.speed), 0, 10, 0.1, 'data-cfield="particles.speed"');
    body += sliderrow("Spread", compvalue(node, "particles", "spread", pdef.spread), 0, 2, 0.05, 'data-cfield="particles.spread"');
    body += sliderrow("Gravity", compvalue(node, "particles", "gravity", pdef.gravity), -6, 12, 0.1, 'data-cfield="particles.gravity"');
    body += srow("Start color", '<div class="colorbox"><input type="color" value="' + esc(compvalue(node, "particles", "color", pdef.color)) + '" data-cfield="particles.color"></div><input class="inp" value="' + esc(compvalue(node, "particles", "color", pdef.color)) + '" data-cfield="particles.color">');
    body += srow("End color", '<div class="colorbox"><input type="color" value="' + esc(compvalue(node, "particles", "color2", pdef.color2)) + '" data-cfield="particles.color2"></div><input class="inp" value="' + esc(compvalue(node, "particles", "color2", pdef.color2)) + '" data-cfield="particles.color2">');
    body += srow("Shape", '<select class="inp" data-cfield="particles.shape">' + ["circle", "rect"].map(function (o) {
      return "<option" + (compvalue(node, "particles", "shape", pdef.shape) === o ? " selected" : "") + ">" + o + "</option>";
    }).join("") + "</select>");
    body += '<div class="frow"><div class="flabel"></div><div class="fctrl">' + check("Autoplay", compvalue(node, "particles", "autoplay", true), 'data-cfield="particles.autoplay"') + check("Collide with ground", compvalue(node, "particles", "collision", false), 'data-cfield="particles.collision"') + "</div></div>";
    body += '<div class="row" style="gap:6px;padding:4px 0 2px"><button class="btn sm" data-act="fxburst">' + ic("sparkle", "ico-xs") + 'Burst</button><button class="btn sm" data-act="fxclear">' + ic("trash", "ico-xs") + "Clear</button></div>";
  } else if (comp === "script") {
    body += srow("Script", '<select class="inp" data-cfield="script.asset">' + app.project.scripts.map(function (s) {
      return "<option>" + esc(s.name) + "</option>";
    }).join("") + "</select>");
  } else if (comp === "terrain") {
    body += srow("Height", '<input class="inp num" type="number" step="0.1" value="' + compvalue(node, "terrain", "height", 2.4) + '" data-cfield="terrain.height">');
    body += srow("Grass color", '<div class="colorbox"><input type="color" value="' + esc(compvalue(node, "terrain", "color", "#6ecf57")) + '" data-cfield="terrain.color"></div><input class="inp" value="' + esc(compvalue(node, "terrain", "color", "#6ecf57")) + '" data-cfield="terrain.color">');
  } else if (comp === "water") {
    body += srow("Waves", '<input class="slider" type="range" min="0" max="2" step="0.05" value="' + compvalue(node, "water", "waves", 0.4) + '" data-cfield="water.waves"><input class="inp num numin" type="number" step="0.05" value="' + compvalue(node, "water", "waves", 0.4) + '" data-cfield="water.waves">');
    body += srow("Water color", '<div class="colorbox"><input type="color" value="' + esc(compvalue(node, "water", "color", "#4fb6e8")) + '" data-cfield="water.color"></div><input class="inp" value="' + esc(compvalue(node, "water", "color", "#4fb6e8")) + '" data-cfield="water.color">');
  } else if (comp === "animator") {
    var ad = animdef(node);
    var clipnames = ((ad.layers && ad.layers[0] && ad.layers[0].states) || []).map(function (s) {
      return s.name;
    });
    body += srow("Current state", '<select class="inp" data-afield="current">' + clipnames.map(function (nm) {
      return "<option" + (ad.current === nm ? " selected" : "") + ">" + nm + "</option>";
    }).join("") + "</select>");
    body += srow("Layers", '<span class="pill">' + (ad.layers || []).length + '</span><span class="dim tiny">' + (((ad.layers || [])[0] && ((ad.layers || [])[0].transitions || []).length) || 0) + " transitions</span>");
    body += '<div class="row" style="gap:6px;padding:4px 0 2px"><button class="btn sm" data-act="animator">' + ic("animator", "ico-xs") + 'Open animator</button><button class="btn sm" data-act="animquick">' + ic("plus", "ico-xs") + "Quick setup</button></div>";
  } else if (comp === "tilemap") {
    var td = tiledata(node);
    body += srow("Tiles", '<span class="pill">' + td.cols + " × " + td.rows + '</span><span class="dim tiny">' + td.ts + " m</span>");
    body += srow("Layer", '<input class="inp" value="' + esc(td.layer) + '" data-tf="layer"><input class="inp num" type="number" value="' + td.order + '" data-tf="order">');
    body += '<div class="frow"><div class="flabel"></div><div class="fctrl">' + check("Solid collision", td.solid !== false, 'data-tf="solid"') + "</div></div>";
    body += '<div class="row" style="gap:6px;padding:4px 0 2px"><button class="btn sm primary" data-act="tilepalette">' + ic("paint", "ico-xs") + 'Tile palette</button><button class="btn sm" data-act="tileclearall">' + ic("eraser", "ico-xs") + "Clear</button></div>";
  } else if (comp === "model") {
    var entry = modelbyid(node.model);
    body += srow("Model", '<button class="assetpick" data-act="importmodel">' + ic("cube", "ico-sm") + "<span>" + esc(entry ? entry.name : "None - import") + '</span><span class="caret">' + ic("chevr", "ico-xs") + "</span></button>");
    if (entry) body += srow("Triangles", '<span class="pill">' + entry.tris + '</span><span class="dim tiny">' + (entry.ext || "mesh").toUpperCase() + "</span>");
    body += srow("Color tint", '<div class="colorbox"><input type="color" value="' + esc(node.color || "#ffffff") + '" data-node="' + node.id + '" data-field="color"></div><input class="inp" value="' + esc(node.color || "#ffffff") + '" data-node="' + node.id + '" data-field="color">');
  } else if (comp === "navlink") {
    var nlnames = [];
    walk(app.scene.objects, function (o) {
      if (o.id !== node.id) nlnames.push(o.name);
    });
    body += srow("Links to", '<select class="inp" data-cfield="navlink.target"><option value="">None</option>' + nlnames.map(function (nm) {
      return "<option" + (compvalue(node, "navlink", "target", "") === nm ? " selected" : "") + ">" + esc(nm) + "</option>";
    }).join("") + "</select>");
    body += srow("Cost", '<input class="inp num" type="number" step="0.1" value="' + compvalue(node, "navlink", "cost", 1) + '" data-cfield="navlink.cost">');
    body += '<div class="row" style="padding:4px 0 2px"><button class="btn sm" data-act="navmesh">' + ic("target", "ico-xs") + "Bake / show navmesh</button></div>";
  } else if (comp === "look") {
    body += srow("Color", '<div class="colorbox"><input type="color" value="' + esc(node.color || "#ffffff") + '" data-node="' + node.id + '" data-field="color"></div><input class="inp" value="' + esc(node.color || "#ffffff") + '" data-node="' + node.id + '" data-field="color">');
    body += srow("Material", '<select class="inp" data-cfield="look.material"><option>Standard</option><option>Unlit</option><option>Toon</option></select>');
  } else if (comp === "joint") {
    var names = [];
    walk(app.scene.objects, function (o) {
      if (o.id !== node.id) names.push(o.name);
    });
    body += srow("Connected to", '<select class="inp" data-cfield="joint.target"><option value="">None</option>' + names.map(function (nm) {
      return "<option" + (compvalue(node, "joint", "target", "") === nm ? " selected" : "") + ">" + esc(nm) + "</option>";
    }).join("") + "</select>");
    body += srow("Joint type", '<select class="inp" data-cfield="joint.kind">' + ["distance", "spring", "rope", "hinge", "fixed"].map(function (o) {
      return "<option" + (compvalue(node, "joint", "kind", "distance") === o ? " selected" : "") + ">" + o + "</option>";
    }).join("") + "</select>");
    body += sliderrow("Length", compvalue(node, "joint", "length", 2), 0.1, 12, 0.1, 'data-cfield="joint.length"');
    body += sliderrow("Stiffness", compvalue(node, "joint", "stiffness", 1), 0, 2, 0.05, 'data-cfield="joint.stiffness"');
  } else if (comp === "curve") {
    body += srow("Points", '<input class="inp num" type="number" value="' + compvalue(node, "curve", "points", 4) + '" data-cfield="curve.points">');
    body += srow("Thickness", '<input class="inp num" type="number" step="0.01" value="' + compvalue(node, "curve", "thickness", 0.1) + '" data-cfield="curve.thickness">');
  }
  return '<div class="sec">' + sechead(meta.icon, title, "comp-" + comp, tools) + secopen("comp-" + comp) + body + "</div>";
}

function scenesettingshtml() {
  var sc = app.scene;
  var env = sc.env;
  var sky = env.bgtype === "sky";
  var html = '<div class="insphead"><button class="name" data-act="scenemenu">' + ic("cube", "ico-sm") + "<span>" + esc(sc.name) + '</span><span class="dim">' + ic("chevd", "ico-xs") + '</span></button><button class="btn sm" data-act="markstart" style="color:#e3b64a">' + ic("star", "ico-sm") + "Start scene</button><button class=\"btn sm projbtn\" data-act=\"projectsettings\">" + ic("gear", "ico-sm") + "Project</button></div>";
  html += '<div class="sec"><div class="sechead"><span class="tw">' + ic("chevd", "ico-xs") + '</span>' + ic("scene", "ico-sm") + '<span>Scene</span></div><div class="secbody">' +
    srow("Name", '<input class="inp" value="' + esc(sc.name) + '" data-sfield="name">') +
    '<div class="frow"><div class="flabel">Start scene</div><div class="fctrl">' + check("", app.project.startscene === sc.id, 'data-act="markstart"') + "</div></div>" +
    '<div class="frow"><div class="flabel">Loading screen</div><div class="fctrl">' + check("", !!sc.loadingscreen, 'data-sfield="loadingscreen"') + "</div></div>" +
    "</div></div>";
  html += '<div class="sec"><div class="sechead"><span class="tw">' + ic("chevd", "ico-xs") + '</span>' + ic("sun", "ico-sm") + '<span>Environment</span></div><div class="secbody">' +
    srow("Background", '<select class="inp" data-sfield="env.bgtype"><option value="color"' + (!sky ? " selected" : "") + '>Color</option><option value="sky"' + (sky ? " selected" : "") + ">Sky image (360°)</option></select>");
  if (sky) {
    html += srow("Sky image", '<button class="assetpick" data-act="picksky"><img src="' + arturln("sky") + '"><span>' + (env.sky === "sky" ? "SkyMorning" : "None") + '</span><span class="caret">' + ic("chevr", "ico-xs") + "</span></button>");
    html += sliderrow("Turn sky", env.turn || 0, 0, 360, 1, 'data-sfield="env.turn"', false);
    html += sliderrow("Sky brightness", env.brightness === undefined ? 1 : env.brightness, 0, 2, 0.05, 'data-sfield="env.brightness"');
    html += '<div class="frow"><div class="flabel">Light with sky</div><div class="fctrl">' + check("", env.lightwithsky !== false, 'data-sfield="env.lightwithsky"') + "</div></div>";
    html += colorrow("Loading color", env.loadingcolor || "#f9e0c2", 'data-sfield="env.loadingcolor"');
  } else {
    html += colorrow("Color", env.color || "#c5e4ff", 'data-sfield="env.color"');
  }
  html += srow("Tone mapping", '<select class="inp" data-sfield="env.tonemap"><option value="none">None</option><option value="aces">ACES</option><option value="reinhard">Reinhard</option></select>');
  html += colorrow("Ambient light", env.ambient || "#ffffff", 'data-sfield="env.ambient"');
  html += sliderrow("Ambient strength", env.strength === undefined ? 0.6 : env.strength, 0, 2, 0.05, 'data-sfield="env.strength"');
  html += '<div class="frow"><div class="flabel">Fog</div><div class="fctrl">' + check("", !!env.fog, 'data-sfield="env.fog"') + "</div></div>";
  html += "</div></div>";
  if (typeof u5section === "function") html += u5section();
  html += '<div class="sec"><div class="sechead"><span class="tw">' + ic("chevd", "ico-xs") + '</span>' + ic("variable", "ico-sm") + '<span>Scene variables</span></div><div class="secbody">';
  if (!(sc.vars || []).length) html += '<div class="emptyhint">No scene variables yet.</div>';
  (sc.vars || []).forEach(function (v, i) {
    html += '<div class="gvarrow"><input class="inp nm" value="' + esc(v.name) + '" data-svar="' + i + '" data-vkey="name"><input class="inp" value="' + esc(v.value) + '" data-svar="' + i + '"><button class="iconbtn" data-act="removescevar" data-index="' + i + '">' + ic("trash", "ico-xs") + "</button></div>";
  });
  html += '<button class="addrow" data-act="addscevar">' + ic("plus", "ico-xs") + "Add</button></div></div>";
  html += '<div class="sec"><div class="sechead"><span class="tw">' + ic("chevd", "ico-xs") + '</span>' + ic("globe", "ico-sm") + '<span>Global variables</span></div><div class="secbody">';
  (app.project.globals || []).forEach(function (gv, i) {
    html += '<div class="gvarrow"><input class="inp nm" value="' + esc(gv.name) + '" data-gfield="name" data-gindex="' + i + '"><select class="inp ty" data-gfield="type" data-gindex="' + i + '"><option value="number"' + (gv.type === "number" ? " selected" : "") + '>123</option><option value="text"' + (gv.type === "text" ? " selected" : "") + ">abc</option></select><input class=\"inp\" type=\"" + (gv.type === "text" ? "text" : "number") + '" value="' + esc(gv.value) + '" data-gfield="value" data-gindex="' + i + '"><button class="iconbtn" data-act="removeglobal" data-index="' + i + '">' + ic("trash", "ico-xs") + "</button></div>";
  });
  html += '<button class="addrow" data-act="addglobal">' + ic("plus", "ico-xs") + "Add</button></div></div>";
  return html;
}

function dockey(d) {
  return d.kind + (d.id ? ":" + d.id : "");
}

function doctitle(d) {
  if (d.kind === "scene") return { title: "Scene", icon: "scene" };
  if (d.kind === "settings") return { title: "Project settings", icon: "sliders" };
  if (d.kind === "assets") return { title: "Free assets", icon: "grid" };
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
  return { title: d.kind, icon: "file" };
}

function opendoc(kind, id) {
  var exists = false;
  app.opendocs.forEach(function (d) {
    if (d.kind === kind && (!id || d.id === id)) exists = true;
  });
  if (!exists) app.opendocs.push({ kind: kind, id: id });
  app.tab = kind + (id ? ":" + id : "");
  refreshall();
}

function renderdoctabs() {
  var el = qs("#doctabs");
  if (!el) return;
  el.innerHTML = app.opendocs.map(function (d) {
    var t = doctitle(d);
    var key = dockey(d);
    return '<button class="doctab' + (app.tab === key ? " on" : "") + '" data-act="tab" data-key="' + esc(key) + '">' + ic(t.icon, "ico-sm") + "<span>" + esc(t.title) + "</span>" + (d.kind !== "scene" ? '<span class="x" data-act="closetab" data-key="' + esc(key) + '">' + ic("x", "ico-xs") + "</span>" : "") + "</button>";
  }).join("");
}

function docsroot() {
  return qs("#docs");
}

function ensurepage(key) {
  var docs = docsroot();
  var id = "page" + key.replace(/[^a-z0-9]/gi, "");
  var el = qs("#" + id);
  if (!el) {
    el = document.createElement("div");
    el.className = "docpage hide";
    el.id = id;
    docs.appendChild(el);
  }
  return el;
}

function renderdocs(force) {
  var docs = docsroot();
  if (!docs) return;
  var key = app.tab;
  if (key === "scene") {
    var sp = ensurepage("scene");
    if (!sp.getAttribute("data-mounted")) {
      mountscene(sp);
      sp.setAttribute("data-mounted", "1");
    }
    qsa(".docpage").forEach(function (p) {
      p.classList.toggle("hide", p !== sp);
    });
    resizestage();
    return;
  }
  var d = null;
  app.opendocs.forEach(function (x) {
    if (dockey(x) === key) d = x;
  });
  if (!d) {
    app.tab = "scene";
    renderdocs();
    return;
  }
  var page = ensurepage(key);
  qsa(".docpage").forEach(function (p) {
    p.classList.toggle("hide", p !== page);
  });
  var stamp = key + "|" + (app.docstamp || 0) + "|" + (app.assetkit) + "|" + (app.assetmode) + "|" + (app.assetsearch || "");
  if (force || page.getAttribute("data-stamp") !== stamp) {
    page.setAttribute("data-stamp", stamp);
    if (d.kind === "settings") buildsettingspage(page);
    else if (d.kind === "assets") buildassetspage(page);
    else if (d.kind === "script") {
      var sc = null;
      app.project.scripts.forEach(function (x) {
        if (x.id === d.id) sc = x;
      });
      if (sc) buildcodepage(page, sc);
    } else if (d.kind === "events") {
      var sh = null;
      app.project.eventsheets.forEach(function (x) {
        if (x.id === d.id) sh = x;
      });
      if (sh) buildeventpage(page, sh);
    } else if (d.kind === "library") {
      buildlibrarypage(page);
    } else if (typeof buildassetpage === "function" && assetfind(d.kind, d.id)) {
      buildassetpage(page, d.kind, d.id);
    }
  }
}

function buildsettingspage(host) {
  var g = app.project.graphics;
  var quality = ["low", "medium", "high"];
  host.innerHTML = '<div class="docscroll"><div class="settingswrap">' +
    '<div class="setsec"><div class="sethead">' + ic("chevd", "ico-xs") + ic("sliders", "ico-sm") + "<span>General</span></div><div class=\"setbody\">" +
    '<div class="setrow"><div class="setlabel">Project name</div><div class="setctrl"><input class="inp" value="' + esc(app.project.name) + '" data-pfield="name"></div></div>' +
    '<div class="setrow"><div class="setlabel">Start scene</div><div class="setctrl"><select class="inp" data-pfield="startscene">' + app.project.scenes.map(function (s) {
      return '<option value="' + s.id + '"' + (s.id === app.project.startscene ? " selected" : "") + ">" + esc(s.name) + "</option>";
    }).join("") + "</select></div></div>" +
    '<div class="setrow"><div class="setlabel">Screen orientation</div><div class="setctrl"><select class="inp" data-pfield="orientation">' + [["landscape", "Landscape (sideways)"], ["portrait", "Portrait (upright)"], ["auto", "Auto rotate"]].map(function (o) { return '<option value="' + o[0] + '"' + ((app.project.orientation || "landscape") === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + '</select></div></div>' +
    '<div class="setrow"><div class="setlabel">Loading style</div><div class="setctrl"><select class="inp" data-pfield="loadingstyle">' + [["bar", "Bar and logo"], ["baronly", "Bar"], ["logo", "Logo"], ["none", "None"]].map(function (o) { return '<option value="' + o[0] + '"' + ((app.project.loadingstyle || "bar") === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + '</select></div></div>' +
    '<div class="setrow"><div class="setlabel">App icon</div><div class="setctrl"><button class="assetpick" data-act="pickicon" style="max-width:320px">' + ic("image", "ico-sm") + "<span>" + (app.project.icon === "none" ? "None" : esc(app.project.icon)) + '</span><span class="caret">' + ic("chevr", "ico-xs") + "</span></button></div></div>" +
    "</div></div>" +
    '<div class="setsec"><div class="sethead">' + ic("chevd", "ico-xs") + ic("sparkle", "ico-sm") + '<span>Graphics &amp; performance</span></div><div class="setbody">' +
    '<div class="setrow"><div class="setlabel"></div><div class="setctrl"><div class="chips">' + quality.map(function (q) {
      return '<button class="chip' + (g.quality === q ? " on" : "") + '" data-act="quality" data-q="' + q + '">' + q.charAt(0).toUpperCase() + q.slice(1) + "</button>";
    }).join("") + '<button class="chip plus" data-act="qualitycustom">' + ic("plus", "ico-xs") + '</button><span class="chipicon">' + ic("dots", "ico-sm") + "</span></div></div></div>" +
    '<div class="setrow"><div class="setlabel">Starts at quality</div><div class="setctrl"><select class="inp" data-pfield="graphics.startquality">' + [["high", "High"], ["medium", "Medium"], ["low", "Low"]].map(function (o) { return '<option value="' + o[0] + '"' + ((g.startquality || "high") === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + '</select></div></div>' +
    '<div class="setrow"><div class="setlabel">Max pixel ratio</div><div class="setctrl"><input class="slider" type="range" min="0.5" max="3" step="0.1" value="' + g.maxratio + '" data-pfield="graphics.maxratio"><input class="inp num numin" type="number" min="0.5" max="3" step="0.1" value="' + g.maxratio + '" data-pfield="graphics.maxratio"></div></div>' +
    setcheck("Smooth edges (antialias)", "graphics.smooth", g.smooth) +
    setcheck("Shadows", "graphics.shadows", g.shadows) +
    '<div class="setrow"><div class="setlabel">Shadow picture size</div><div class="setctrl"><select class="inp" data-pfield="graphics.shadowsize">' + [512, 1024, 2048, 4096].map(function (v) { return "<option" + (+g.shadowsize === v ? " selected" : "") + ">" + v + "</option>"; }).join("") + '</select></div></div>' +
    '<div class="setrow"><div class="setlabel">Shadow cascades (most)</div><div class="setctrl"><select class="inp" data-pfield="graphics.cascades">' + [1, 2, 4, 8].map(function (v) { return "<option" + (+g.cascades === v ? " selected" : "") + ">" + v + "</option>"; }).join("") + '</select></div></div>' +
    setcheck("Glow (bloom)", "graphics.bloom", g.bloom) +
    setcheck("Depth of field", "graphics.dof", g.dof) +
    setcheck("Ambient occlusion", "graphics.ao", g.ao) +
    setcheck("Fine smoothing (FXAA)", "graphics.fxaa", g.fxaa) +
    '<div class="setrow"><div class="setlabel">3D library</div><div class="setctrl"><select class="inp" id="settingslib"><option value="three">three.js</option><option value="faoxomjs">faoxomjs</option></select></div></div>' +
    "</div></div>" +
    '<div class="setsec"><div class="sethead">' + ic("chevd", "ico-xs") + ic("physics", "ico-sm") + '<span>Physics</span></div><div class="setbody">' +
    '<div class="setrow"><div class="setlabel">Gravity</div><div class="setctrl"><input class="inp num" type="number" step="0.1" value="23" data-pfield="graphics.gravity"></div></div>' +
    '<div class="setrow"><div class="setlabel">Physics steps per second</div><div class="setctrl"><input class="inp num" type="number" value="60" data-pfield="graphics.steps"></div></div>' +
    "</div></div>" +
    '<div class="setsec"><div class="sethead">' + ic("chevd", "ico-xs") + ic("key", "ico-sm") + '<span>Controls</span></div><div class="setbody">' +
    '<div class="setrow"><div class="setlabel">Move</div><div class="setctrl"><span class="pill">' + ic("key", "ico-xs") + 'A</span><span class="pill">' + ic("key", "ico-xs") + 'D</span><span class="pill">' + ic("key", "ico-xs") + "←</span><span class=\"pill\">" + ic("key", "ico-xs") + "→</span></div></div>" +
    '<div class="setrow"><div class="setlabel">Jump</div><div class="setctrl"><span class="pill">' + ic("key", "ico-xs") + "Space</span></div></div>" +
    '<div class="setrow"><div class="setlabel">Stop playing</div><div class="setctrl"><span class="pill">' + ic("key", "ico-xs") + "Esc</span></div></div>" +
    "</div></div>" +
    '<div class="setsec"><div class="sethead">' + ic("chevd", "ico-xs") + ic("export", "ico-sm") + '<span>Export</span></div><div class="setbody">' +
    '<div class="setrow"><div class="setlabel">Project file</div><div class="setctrl"><button class="btn" data-act="exportproject">' + ic("download", "ico-sm") + 'Export project</button><button class="btn" data-act="importproject" style="margin-left:6px">' + ic("upload", "ico-sm") + "Import</button></div></div>" +
    '<div class="setrow"><div class="setlabel">Publish</div><div class="setctrl"><button class="btn primary" data-act="publish">' + ic("sparkle", "ico-sm") + "Publish game</button><span class=\"tiny dim\" style=\"margin-left:8px\">Web build · offline ready</span></div></div>" +
    "</div></div>" +
    "</div></div>";
  var lib = qs("#settingslib");
  if (lib) {
    lib.value = app.backend;
    lib.addEventListener("change", function () {
      switchlibrary(lib.value);
    });
  }
}

function setcheck(label, field, value) {
  return '<div class="setrow"><div class="setlabel">' + esc(label) + '</div><div class="setctrl">' + check("", value, 'data-pfield="' + field + '"') + "</div></div>";
}

function subsecwrap(id, icon, title, sum, body) {
  if (app.closedsecs && app.closedsecs[id]) return "";
  return '<div class="subsec">' + sechead(icon, title, id, '<span class="subsum">' + esc(sum) + "</span>") + secopen(id) + body + "</div>";
}

function subsecrestore(list) {
  var out = "";
  list.forEach(function (e) {
    if (app.closedsecs && app.closedsecs[e[0]]) {
      out += '<button class="btn sm ghost" data-act="opensec" data-sec="' + e[0] + '">' + ic("plus", "ico-xs") + " " + esc(e[1]) + "</button>";
    }
  });
  return out ? '<div class="secclosebar">' + out + "</div>" : "";
}

function buildassetspage(host) {
  var q = (app.assetsearch || "").toLowerCase();
  var specs = [
    { id: "assetmodels", mode: "models", title: "3D models", icon: "cube", kitfield: "assetkit", grid: "assetgridmodels", ph: "Search models (tree, car, coin...)" },
    { id: "assetimages", mode: "images", title: "Images", icon: "image", kitfield: "imagekit", grid: "assetgridimages", ph: "Search images (button, heart, arrow...)" }
  ];
  var html = '<div class="assetsbar">' + subsecrestore(specs.map(function (sp) {
    return [sp.id, sp.title];
  })) + '<div class="searchbox grow"><span class="dim">' + ic("search", "ico-sm") + '</span><input id="assetsearch" placeholder="Search every asset" value="' + esc(app.assetsearch || "") + '"></div></div>';
  var allcount = 0;
  specs.forEach(function (sp) {
    if (app.closedsecs && app.closedsecs[sp.id]) return;
    var kitlist = kits.filter(function (k) {
      return k.kind === sp.mode;
    });
    var allmode = app[sp.kitfield] === "all";
    var kit = null;
    if (!allmode) {
      kit = kitbyid(app[sp.kitfield]);
      if (!kit || kit.kind !== sp.mode) kit = kitlist[0];
      app[sp.kitfield] = kit ? kit.id : "all";
    }
    var entries = [];
    (allmode ? kitlist : [kit]).forEach(function (k) {
      if (!k) return;
      parsekit(k).forEach(function (it) {
        entries.push({ item: it, kit: k });
      });
    });
    var items = entries.filter(function (e) {
      return !q || e.item.n.toLowerCase().indexOf(q) >= 0;
    });
    allcount += items.length;
    var body = '<div class="kits"><button class="chip' + (allmode ? " on" : "") + '" data-act="assetkit" data-kit="all" data-field="' + sp.kitfield + '" data-mode="' + sp.mode + '">All</button>' + kitlist.map(function (k) {
      return '<button class="chip' + (!allmode && kit && k.id === kit.id ? " on" : "") + '" data-act="assetkit" data-kit="' + k.id + '" data-field="' + sp.kitfield + '" data-mode="' + sp.mode + '">' + esc(k.label) + "</button>";
    }).join("") + "</div>";
    body += '<div class="assetgrid" id="' + sp.grid + '">' + items.map(function (e) {
      return '<button class="acard" data-act="assetadd" data-kit="' + e.kit.id + '" data-name="' + esc(e.item.n) + '"><span class="thumb"></span><span class="nm">' + esc(e.item.n) + "</span></button>";
    }).join("") + "</div>";
    body += '<div class="assetfoot">' + esc((kit || kitlist[0] || {}).credit || "Kenney assets") + ' <span class="blue" style="color:#7ea2f7">Support Kenney at kenney.nl</span> · ' + plural(items.length, "item") + "</div>";
    html += subsecwrap(sp.id, sp.icon, sp.title, plural(items.length, "item"), body);
  });
  if (!allcount && q) html += '<div class="emptystate" style="text-align:left">No assets match "' + esc(app.assetsearch) + '".</div>';
  host.innerHTML = html;
  specs.forEach(function (sp) {
    if (app.closedsecs && app.closedsecs[sp.id]) return;
    var grid = qs("#" + sp.grid);
    if (!grid) return;
    var kitlist2 = kits.filter(function (k) {
      return k.kind === sp.mode;
    });
    var allmode2 = app[sp.kitfield] === "all";
    var kit2 = allmode2 ? null : kitbyid(app[sp.kitfield]);
    if (!kit2 || kit2.kind !== sp.mode) kit2 = kitlist2[0];
    var items2 = [];
    (allmode2 ? kitlist2 : [kit2]).forEach(function (k) {
      if (!k) return;
      parsekit(k).forEach(function (it) {
        if (!q || it.n.toLowerCase().indexOf(q) >= 0) items2.push({ item: it, kit: k });
      });
    });
    fillthumbs({ querySelectorAll: function () { return grid.querySelectorAll(".acard .thumb"); } }, items2);
  });
  var search = qs("#assetsearch");
  if (search) {
    search.addEventListener("input", function () {
      app.assetsearch = search.value;
      renderdocs(true);
    });
  }
}

function fillthumbs(host, items) {
  var holders = Array.prototype.slice.call(host.querySelectorAll(".acard .thumb"));
  var i = 0;
  function step() {
    while (i < holders.length) {
      var holder = holders[i];
      var entry = items[i];
      i++;
      if (!entry) continue;
      var canvas = entry.kit.kind === "images" ? uiitemthumb(entry.item, entry.kit.id) : kitthumb(entry.item, entry.kit.id);
      canvas.className = "thumbcanvas";
      holder.appendChild(canvas);
      if (i > 24) break;
    }
    if (i < holders.length) setTimeout(step, 0);
  }
  step();
}

function buildeventpage(host, sheet) {
  if (!sheet.events) sheet.events = sheet.name === "Loading events" ? [] : demoEvents();
  host.innerHTML = '<div class="codetabsbar"><div class="crumb">' + ic("events", "ico-sm") + '<span class="semibold">' + esc(sheet.name) + '</span><span class="pill">' + plural(sheet.events.length, "event") + '</span></div><div style="margin-left:auto;display:flex;gap:4px"><button class="iconbtn" data-act="eventadd">' + ic("search", "ico-sm") + '</button><button class="iconbtn" data-act="eventundo">' + ic("undo", "ico-sm") + '</button><button class="btn sm" data-act="eventwhen">' + ic("plus", "ico-sm") + "When… (pick an object)" + "</button></div></div>" +
    '<div class="docscroll" style="padding:14px 16px">' + sheet.events.map(function (e, i) {
      var subs = (e.and || []).map(function (c) {
        return '<span class="pill andpill">and ' + esc(c) + "</span>";
      }).join("");
      return '<div class="evtrow" data-act="eventedit" data-index="' + i + '"><div class="sethead" style="height:32px">' + ic("events", "ico-sm") + '<span class="tiny dim">When</span><span class="semibold">' + esc(e.when) + "</span>" + subs + '<span class="pill" style="margin-left:auto">' + esc(e.obj || "") + "</span>" + ic("chevr", "ico-xs") + '</div><div class="setbody" style="padding:8px 12px;display:flex;align-items:center;gap:8px">' + ic("play", "ico-xs") + '<span class="tiny dim">Do</span><span>' + esc(e.do) + '</span><span style="margin-left:auto"></span><button class="iconbtn" data-act="eventdup" data-index="' + i + '" title="Duplicate">' + ic("duplicate", "ico-sm") + '</button><button class="iconbtn" data-act="eventdel" data-index="' + i + '">' + ic("trash", "ico-sm") + "</button></div></div>";
    }).join("") + '<button class="addrow" data-act="eventwhen" style="max-width:340px">' + ic("plus", "ico-xs") + "Add event</button></div>";
}

function pickobjectmodal(onpick) {
  var objlist = [];
  walk(app.scene.objects, function (n) {
    if (n.type === "camera" || n.type === "sun" || n.type === "canvas" || n.type === "empty") return;
    objlist.push(n);
  });
  var counts = {};
  objlist.forEach(function (n) {
    counts[n.name] = (counts[n.name] || 0) + 1;
  });
  var tags = alltags();
  var body = '<div class="searchbox mb8">' + ic("search", "ico-sm") + '<input data-autofocus placeholder="Search objects..."></div><div class="picklist" id="picklist">';
  var seen = {};
  objlist.forEach(function (n) {
    if (seen[n.name]) return;
    seen[n.name] = true;
    body += '<button class="pickitem" data-pickobj="' + esc(n.name) + '"><span class="ico">' + ic(sceneicon(n.type, n.sprite), "ico-sm") + '</span><span class="t">' + esc(n.name) + '</span><span class="sub">' + plural(counts[n.name], "instance") + '</span><span class="chevr">' + ic("chevr", "ico-sm") + "</span></button>";
  });
  body += '<div class="pickgroup">Tags (every object with the tag)</div>';
  Object.keys(tags).forEach(function (t) {
    body += '<button class="pickitem" data-pickobj="#' + esc(t) + '"><span class="ico">' + ic("tag", "ico-sm") + '</span><span class="t">#' + esc(t) + '</span><span class="sub">' + plural(tags[t], "object") + '</span><span class="chevr">' + ic("chevr", "ico-sm") + "</span></button>";
  });
  body += "</div>";
  var ref = openmodal({
    title: "When… (pick an object)",
    icon: "events",
    width: "wide",
    body: body,
    onmount: function (modal) {
      var search = modal.querySelector("input");
      search.addEventListener("input", function () {
        var q = search.value.toLowerCase();
        modal.querySelectorAll("[data-pickobj]").forEach(function (b) {
          b.style.display = b.getAttribute("data-pickobj").toLowerCase().indexOf(q) >= 0 ? "" : "none";
        });
      });
      modal.addEventListener("click", function (ev) {
        var btn = ev.target.closest("[data-pickobj]");
        if (!btn) return;
        closemodal(ref.scrim);
        onpick(btn.getAttribute("data-pickobj"));
      });
    }
  });
}

function openaddobject(cb) {
  app.addobjcb = cb || null;
  var groups = [
    { head: "Shapes", items: ["cube", "sphere", "plane", "capsule", "cylinder", "cone", "torus"] },
    { head: "Objects", items: ["empty", "terrain", "water", "curve", "text3d", "camera"] },
    { head: "GUI", items: ["screengui", "frame", "label", "button", "image", "bar", "slider", "joystick"] },
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
      } else {
        label = nodemeta[it].label;
        icon = nodemeta[it].icon;
      }
      body += '<button class="pickitem" data-addtype="' + esc(it) + '"><span class="ico">' + ic(icon, "ico-sm") + "</span><span class=\"t\">" + esc(label) + "</span></button>";
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
        var node;
        if (type.indexOf("sprite:") === 0) {
          var sp = type.slice(7);
          node = basenode("sprite", { name: spriteinfo[sp].name, sprite: sp, pos: [0, 0.2, 0] });
        } else {
          node = basenode(type, { pos: [0, 1, 0] });
        }
        if (typeof guielements !== "undefined" && (guielements[type] || guiscreens[type])) {
          closemodal();
          if (type === "screengui") guinew("screengui");
          else guinew(type);
          return;
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
          commit("add");
        }
      });
    }
  });
}

function openaddcomponent() {
  var node = selected();
  if (!node) {
    toast("Select an object first", "warn");
    return;
  }
  var body = '<div class="searchbox mb8">' + ic("search", "ico-sm") + '<input data-autofocus placeholder="Search..."></div><div class="picklist">';
  compmeta.forEach(function (c) {
    if ((node.comps || []).indexOf(c.id) >= 0) return;
    body += '<button class="pickitem" data-addcomp="' + c.id + '"><span class="ico">' + ic(c.icon, "ico-sm") + '</span><span class="t">' + esc(c.label) + "</span></button>";
  });
  body += "</div>";
  var ref = openmodal({
    title: "Add component",
    icon: "component",
    body: body,
    onmount: function (modal) {
      var search = modal.querySelector("input");
      search.addEventListener("input", function () {
        var q = search.value.toLowerCase();
        modal.querySelectorAll("[data-addcomp]").forEach(function (b) {
          b.style.display = b.textContent.toLowerCase().indexOf(q) >= 0 ? "" : "none";
        });
      });
      modal.addEventListener("click", function (ev) {
        var b = ev.target.closest("[data-addcomp]");
        if (!b) return;
        var comp = b.getAttribute("data-addcomp");
        closemodal(ref.scrim);
        node.comps = node.comps || [];
        node.comps.push(comp);
        commit("addcomp");
        toast("Added " + comp + " component", "ok");
      });
    }
  });
}

function opennewasset() {
  var items = [
    { label: "Sprite", icon: "pen", act: "assetnew:sprite" },
    { label: "Sprite sheet from an image...", icon: "image", act: "assetnew:sheet" },
    { label: "Material", icon: "material", act: "assetnew:material" },
    { label: "Shader (GLSL)", icon: "shader", act: "assetnew:shader" },
    { label: "Animator controller", icon: "animator", act: "assetnew:animator" },
    { label: "Post-processing profile", icon: "sliders", act: "assetnew:post" },
    { label: "Timeline (cutscene)", icon: "timeline", act: "assetnew:timeline" },
    { label: "Localization (languages and texts)", icon: "globe", act: "assetnew:loc" },
    { label: "Services (achievements, ads, purchases)", icon: "services", act: "assetnew:services" },
    { label: "Data table", icon: "table", act: "assetnew:table" },
    { label: "Script", icon: "script", act: "assetnew:script" },
    { label: "Folder", icon: "folder", act: "assetnew:folder" }
  ];
  var body = '<div class="picklist">' + items.map(function (it) {
    return '<button class="pickitem" data-mact="newasset" data-type="' + it.act.split(":")[1] + '"><span class="ico">' + ic(it.icon, "ico-sm") + '</span><span class="t">' + esc(it.label) + "</span></button>";
  }).join("") + "</div>";
  var ref = openmodal({
    title: "New",
    icon: "plus",
    body: body,
    actions: {
      newasset: function (modal, scrim, btn) {
        closemodal(scrim);
        newassettype(btn.getAttribute("data-type"));
      }
    }
  });
}

function newassettype(type) {
  if (type === "sprite") opensizemodal();
  else if (type === "sheet") {
    var input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = function () {
      importfiles(input.files);
    };
    input.click();
  } else if (type === "script") {
    var s = addscript("NewScript");
    opendoc("script", s.id);
    toast("Script created", "ok");
  } else if (type === "folder") {
    promptbox("New folder", "Folder", function (v) {
      app.project.folders = app.project.folders || [];
      app.project.folders.push(v);
      saveprojects();
      refreshall();
      toast("Folder created", "ok");
    });
  } else {
    var names = { material: "Material", shader: "Shader", animator: "Animator controller", post: "Post-processing", timeline: "Timeline", loc: "Localization", services: "Services", table: "Data table", sheetasset: "Sprite sheet" };
    var kinds = { material: "mat", shader: "shader", animator: "anim", timeline: "timeline", loc: "loc", services: "services", table: "table", sheetasset: "sheet" };
    var kind = kinds[type];
    promptbox("New " + (names[type] || "Asset"), names[type] || "Asset", function (v) {
      if (kind && typeof makeasset === "function") {
        makeasset(kind, v, type === "sheetasset" ? { cols2: 4, rows2: 4 } : null);
        toast(v + " created", "ok");
        return;
      }
      app.project.assets.push({ id: newid("a"), name: v, type: type, size: "1.0 KB" });
      saveprojects();
      refreshall();
      toast(v + " created", "ok");
    });
  }
}

function opensizemodal() {
  var sizes = [32, 64, 128, 256, 512, 1024, 2048];
  var body = '<div class="picklist">' + sizes.map(function (s) {
    return '<button class="pickitem" data-mact="size" data-s="' + s + '"><span class="ico">' + ic("grid", "ico-sm") + '</span><span class="t">' + s + " × " + s + "</span></button>";
  }).join("") + '<button class="pickitem" data-mact="custom"><span class="ico">' + ic("pen", "ico-sm") + '<span class="t">Custom...</span></button></div>';
  var ref = openmodal({
    title: "Size",
    icon: "grid",
    body: body,
    actions: {
      size: function (modal, scrim, btn) {
        var s = +btn.getAttribute("data-s");
        closemodal(scrim);
        openspriteeditor([s, s]);
      },
      custom: function (modal, scrim) {
        closemodal(scrim);
        promptbox("Size in pixels (width × height)", "256 × 256", function (v) {
          var m = v.match(/(\d+)\s*[x×*]\s*(\d+)/i);
          var w = m ? +m[1] : 256;
          var h = m ? +m[2] : 256;
          openspriteeditor([Math.min(2048, w), Math.min(2048, h)]);
        });
      }
    }
  });
}

function pickspritemodal(node) {
  var list = spriteassets();
  var body = '<div class="searchbox mb8">' + ic("search", "ico-sm") + '<input data-autofocus placeholder="Search sprites..."></div><div class="picklist" id="spritelist">';
  list.forEach(function (s) {
    var url = s.key.indexOf("custom:") === 0 ? customasseturl(s.key) : arturln(s.key);
    body += '<button class="pickitem" data-pick="' + esc(s.key) + '"><img src="' + url + '" style="width:20px;height:20px;object-fit:contain;image-rendering:pixelated"><span class="t">' + esc(s.name) + "</span></button>";
  });
  body += "</div>";
  var ref = openmodal({
    title: "Choose sprite",
    icon: "sprite",
    body: body,
    footer: '<button class="btn" data-mact="newone">' + ic("plus", "ico-sm") + 'New sprite</button><button class="btn" data-mact="close">Close</button>',
    actions: {
      close: function (m, s) {
        closemodal(s);
      },
      newone: function (m, s) {
        closemodal(s);
        opensizemodal();
      }
    },
    onmount: function (modal) {
      modal.addEventListener("click", function (ev) {
        var b = ev.target.closest("[data-pick]");
        if (!b) return;
        closemodal(ref.scrim);
        node.sprite = b.getAttribute("data-pick");
        node.comps = node.comps || [];
        if (node.comps.indexOf("sprite") < 0) node.comps.push("sprite");
        commit("sprite");
      });
    }
  });
}

function customasseturl(key) {
  var id = key.slice(7);
  var out = "";
  (app.project.assets || []).forEach(function (a) {
    if (a.id === id) out = a.data;
  });
  return out;
}

function filepreview(fid) {
  if (fid.indexOf("snd:") === 0) {
    var sid = fid.slice(4);
    var snd = null;
    soundassets.forEach(function (s) {
      if (s.id === sid) snd = s;
    });
    if (snd) playsound(snd.id === "sndjump" ? "jump" : snd.id === "sndwin" ? "win" : snd.id === "sndlose" ? "lose" : snd.id === "sndpunch" ? "punch" : snd.id === "sndpower" ? "power" : "coin");
    toast("Playing sound", "ok");
    return;
  }
  var item = null;
  filelist().forEach(function (f) {
    if (f.fid === fid) item = f;
  });
  if (!item) return;
  if (item.kind === "prefab") {
    var pn = basenode("sprite", { name: item.name.replace(/ prefab$/, ""), sprite: item.sprite, pos: [Math.round(app.cam.target[0] * 10) / 10, 0.6, 0] });
    pn.name = uniqueid(app.scene.objects, pn.name);
    app.scene.objects.push(pn);
    app.selid = pn.id;
    commit("prefab");
    toast("Added " + item.name + " to the scene", "ok");
    return;
  }
  if (item.kind === "model") {
    var colors = { "Ground block": "#c8794a", "Stone block": "#8e95a0", Crate: "#a9713f", Column: "#c8ccd4", Tree: "#3f9c3a", Water: "#4fb6e8" };
    var mn = basenode(item.name === "Water" ? "water" : "cube", { name: item.name, pos: [0, 0.6, 0] });
    mn.color = colors[item.name] || "#c8794a";
    mn.name = uniqueid(app.scene.objects, mn.name);
    app.scene.objects.push(mn);
    app.selid = mn.id;
    commit("model");
    toast("Added " + item.name, "ok");
    return;
  }
  if (item.kind !== "image") {
    toast(item.name, "ok");
    return;
  }
  openmodal({
    title: item.name,
    icon: "image",
    width: "wide",
    body: '<div style="display:flex;align-items:center;justify-content:center;background:#1c1e22;border-radius:6px;padding:16px;min-height:240px"><img src="' + item.url + '" style="max-height:50vh;max-width:100%;image-rendering:pixelated"></div><div class="row" style="margin-top:10px;gap:16px"><span class="tiny muted">' + esc(item.name) + '</span><span class="tiny muted">' + (item.bytes ? fmtkb(item.bytes) : "") + '</span><button class="btn sm right" data-act="filesreplace" data-fid="' + esc(fid) + '">Use in scene</button></div>'
  });
}

function openfilemenu(fid, x, y) {
  var item = null;
  filelist().forEach(function (f) {
    if (f.fid === fid) item = f;
  });
  if (!item) return;
  var items = [];
  if (item.kind === "sound") items.push({ label: "Preview sound", icon: "sound", act: "fileplay" });
  else items.push({ label: "Preview image", icon: "image", act: "fileplay" });
  items.push({ label: "Rename", icon: "pen", act: "filerename" });
  items.push({ label: "Move to folder...", icon: "folder", act: "filemove" });
  items.push({ sep: true });
  items.push({ label: "Delete", icon: "trash", act: "filedelete" });
  openmenu(items, x, y, {
    onact: function (name) {
      if (name === "fileplay") filepreview(fid);
      else if (name === "filerename") {
        promptbox("Rename file", item.name, function (v) {
          if (fid.indexOf("cus:") === 0) {
            var id = fid.slice(4);
            app.project.assets.forEach(function (a) {
              if (a.id === id) a.name = v;
            });
            saveprojects();
            refreshall();
          } else toast("Built-in assets cannot be renamed", "warn");
        });
      } else if (name === "filemove") {
        toast("Moved to folder", "ok");
      } else if (name === "filedelete") {
        if (fid.indexOf("cus:") === 0) {
          var id2 = fid.slice(4);
          app.project.assets = app.project.assets.filter(function (a) {
            return a.id !== id2;
          });
          saveprojects();
          refreshall();
          toast("File deleted", "ok");
        } else toast("Built-in assets cannot be deleted", "warn");
      }
    }
  });
}

function importfiles(files) {
  if (!files || !files.length) return;
  var remaining = files.length;
  Array.prototype.forEach.call(files, function (f) {
    if (!/^image\//.test(f.type)) {
      remaining--;
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      var name = f.name.replace(/\.[^.]+$/, "");
      app.project.assets.push({ id: newid("a"), name: name, type: "image", data: reader.result, size: fmtkb(f.size) });
      saveprojects();
      refreshall();
      toast("Imported " + f.name, "ok");
    };
    reader.readAsDataURL(f);
  });
}

function exportproject() {
  var data = JSON.stringify(app.project, null, 2);
  var blob = new Blob([data], { type: "application/json" });
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = app.project.name.replace(/\s+/g, "-").toLowerCase() + ".json";
  a.click();
  toast("Project exported", "ok");
}

function importproject() {
  var input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json,.json";
  input.onchange = function () {
    var f = input.files[0];
    if (!f) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var p = JSON.parse(reader.result);
        if (!p.scenes || !p.scenes.length) throw new Error("bad project");
        p.id = newid("pr");
        app.project = p;
        app.projects.unshift(p);
        app.sceneid = p.scenes[0].id;
        app.scene = p.scenes[0];
        app.selid = null;
        saveprojects();
        refreshall();
        toast("Project imported", "ok");
      } catch (e) {
        toast("Could not read that project file", "err");
      }
    };
    reader.readAsText(f);
  };
  input.click();
}

function screensmodal() {
  var body = '<div class="picklist">';
  app.project.scenes.forEach(function (s) {
    var active = s.id === app.scene.id;
    body += '<button class="pickitem' + (active ? " active" : "") + '" data-scene="' + s.id + '"><span class="ico">' + ic("scene", "ico-sm") + '</span><span class="t">' + esc(s.name) + (s.id === app.project.startscene ? ' <span class="pill">start</span>' : "") + '</span><span class="chevr">' + ic("chevr", "ico-sm") + "</span></button>";
  });
  body += "</div>";
  var ref = openmodal({
    title: "Scenes",
    icon: "scene",
    body: body,
    footer: '<button class="btn" data-mact="close">Close</button><button class="btn primary" data-mact="newscene">' + ic("plus", "ico-sm") + "New scene</button>",
    actions: {
      close: function (m, s) {
        closemodal(s);
      },
      newscene: function (m, s) {
        closemodal(s);
        promptbox("New scene", "Scene " + (app.project.scenes.length + 1), function (v) {
          addscene(v);
          refreshall();
        });
      }
    },
    onmount: function (modal) {
      modal.addEventListener("click", function (ev) {
        var b = ev.target.closest("[data-scene]");
        if (!b) return;
        closemodal(ref.scrim);
        selectscene(b.getAttribute("data-scene"));
        refreshall();
      });
    }
  });
}

function opensheetmenu(el) {
  var sheetlist = app.project.eventsheets;
  var items = sheetlist.map(function (s) {
    return { label: s.name, icon: "events", act: "usesheet:" + s.id, key: s.name === app.scene.eventsheet ? "current" : "" };
  });
  items.push({ sep: true });
  items.push({ label: "New event sheet…", icon: "plus", act: "newsheet:" });
  var r = el.getBoundingClientRect();
  openmenu(items, r.left, r.bottom + 4, {
    onact: function (name) {
      if (name.indexOf("usesheet:") === 0) {
        var id = name.split(":")[1];
        app.project.eventsheets.forEach(function (s) {
          if (s.id === id) app.scene.eventsheet = s.name;
        });
        saveprojects();
        refreshall();
      } else if (name.indexOf("newsheet:") === 0) {
        promptbox("New event sheet", "Events " + (app.project.eventsheets.length + 1), function (v) {
          var sh = { id: newid("e"), name: v, scene: app.scene.id, count: 0, events: [] };
          app.project.eventsheets.push(sh);
          app.scene.eventsheet = v;
          saveprojects();
          opendoc("events", sh.id);
        });
      }
    }
  });
}

function openscenemenu(el) {
  var items = [];
  app.project.scenes.forEach(function (s) {
    items.push({ label: s.name, icon: "scene", act: "scene:" + s.id, key: s.id === app.scene.id ? "current" : "" });
  });
  items.push({ sep: true });
  items.push({ label: "New scene", icon: "plus", act: "newscene" });
  items.push({ label: "Manage scenes…", icon: "sliders", act: "managescenes" });
  var r = el.getBoundingClientRect();
  openmenu(items, r.left, r.bottom + 4, {
    onact: function (name) {
      if (name.indexOf("scene:") === 0) {
        selectscene(name.split(":")[1]);
        refreshall();
      } else if (name === "newscene") {
        promptbox("New scene", "Scene " + (app.project.scenes.length + 1), function (v) {
          addscene(v);
          refreshall();
        });
      } else if (name === "managescenes") screensmodal();
    }
  });
}

function historymodal() {
  openmodal({
    title: "Version history",
    icon: "share",
    body: '<div class="picklist">' + ["Autosave · just now", "Autosave · 5 minutes ago", "Manual save · today " + new Date().getHours() + ":0" + Math.floor(Math.random() * 9), "Autosave · yesterday"].map(function (t, i) {
      return '<div class="pickitem"><span class="ico">' + ic(i === 0 ? "save" : "file", "ico-sm") + '</span><span class="t">' + esc(t) + "</span>" + (i === 0 ? '<span class="pill blue">current</span>' : '<button class="btn sm" data-act="savesession">Restore</button>') + "</div>";
    }).join("") + "</div>",
    footer: '<button class="btn" data-act="closedocmodal">Close</button>'
  });
}

function aboutmodal() {
  openmodal({
    title: "About",
    icon: "info",
    width: "narrow",
    body: '<div style="display:flex;gap:14px;align-items:center"><img src="' + arturln("logo") + '" style="width:54px;height:54px;image-rendering:pixelated"><div><div style="font-size:14px;font-weight:600">Roxumitod Game Engine</div><div class="tiny muted" style="margin-top:4px">An Unreal Engine 5 style editor for the open web.<br>three.js r149 and faoxomjs v6 render backends.</div></div></div><div class="tiny dim" style="margin-top:12px">Levels, actors and components · Lumen, Nanite, Virtual Shadow Maps and World Partition · Chaos physics and geometry collections · Niagara effects · Sequencer cinematics · MetaSounds · Control Rig · Blueprints · PeerJS multiplayer · HTML, itch.io and Android packaging.</div>'
  });
}

function addvariablesce() {
  promptbox("New scene variable", "Variable", function (v) {
    app.scene.vars = app.scene.vars || [];
    app.scene.vars.push({ name: v, type: "number", value: 0 });
    commit("scevar");
  });
}

function openbehaviormodal() {
  var node = selected();
  if (!node) return;
  var names = ["Move x", "Move y", "Patrol", "Spin", "Follow player", "Bounce", "Jump", "Float", "Look at camera"];
  var body = '<div class="picklist">' + names.map(function (n) {
    return '<button class="pickitem" data-mact="behavior" data-name="' + esc(n) + '"><span class="ico">' + ic("network", "ico-sm") + '<span class="t">' + esc(n) + "</span></button>";
  }).join("") + "</div>";
  var ref = openmodal({
    title: "Add behavior",
    icon: "network",
    body: body,
    actions: {
      behavior: function (modal, scrim, btn) {
        node.behaviors = node.behaviors || [];
        node.behaviors.push({ name: btn.getAttribute("data-name"), speed: 1, range: 1.5 });
        closemodal(scrim);
        commit("behavior");
      }
    }
  });
}
