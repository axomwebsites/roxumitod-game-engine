var featlist = [];

function featadd(id, name, group, open, note) {
  featlist.push({ id: id, name: name, group: group, open: open, note: note || "" });
}

function featbuild() {
  if (featlist.length) return featlist;
  featadd("skin", "Skeletal mesh rendering", "Rendering", skinpanel, "Bone hierarchy, CPU skinning and LOD chain.");
  featadd("mat", "Advanced material system", "Rendering", function () {
    matpanel(selected());
  }, "PBR inputs, clearcoat, subsurface, refraction and instances.");
  featadd("shader", "Shader authoring", "Rendering", function () {
    matpanel(selected());
  }, "GLSL editor with a syntax gate and live uniforms.");
  featadd("decal", "Projected decals", "Rendering", r2panel, "Decals placed by viewport ray cast.");
  featadd("ssr", "Screen space reflections", "Rendering", r2panel, "Depth silhouette trace blended by roughness.");
  featadd("rt", "Hardware ray tracing", "Rendering", r2panel, "Software path tracer for stills, ray traced shadows live.");
  featadd("upscale", "TAA, TSR, DLSS, FSR, XeSS", "Rendering", r2panel, "Temporal jitter plus five upscaler presets.");
  featadd("lightmap", "Lightmaps and virtual textures", "Rendering", r2panel, "Per face irradiance bake and texel density analysis.");
  featadd("lod", "HLOD and LOD", "Rendering", r2panel, "Automatic LOD chains and merged clusters.");
  featadd("post", "Post material domain and stencil", "Rendering", r2panel, "Stencil masked post materials.");
  featadd("lens", "Lens and camera effects", "Rendering", r2panel, "Flares, dirt, distortion, bokeh and blades.");
  featadd("volumetric", "Volumetric lighting", "Rendering", r2panel, "Ray marched light shafts with step control.");
  featadd("refract", "Translucency and refraction", "Rendering", r2panel, "Refractive surface distortion pass.");
  featadd("groom", "Cloth, hair, fur and eyes", "Rendering", hairlabpanel, "Mass spring cloth, shells and parallax eyes.");
  featadd("csg", "CSG solid modelling", "World", meshpanel, "Union, subtract, intersect and exclusive or.");
  featadd("meshedit", "Mesh editing and sculpting", "World", meshpanel, "Subdivide, bevel, weld, flip and four brushes.");
  featadd("landlayer", "Landscape material layers", "World", landpaintpanel, "Weighted layers painted into the terrain.");
  featadd("spline", "Landscape splines and roads", "World", function () {
    splinenew();
    toast("Spline actor added, edit points in the Details panel", "ok");
  }, "Catmull Rom spline with a road ribbon.");
  featadd("foliage", "Instanced foliage", "World", foliagepanel, "Seeded scattering with terrain conforming.");
  featadd("wpd", "World partition", "World", partitionpanel, "Grid cells with a stream radius.");
  featadd("levelinst", "Level instances", "World", levelinstpanel, "Nest another level as an instance.");
  featadd("procmesh", "Procedural mesh from script", "World", procmeshpanel, "Script builds vertex and index arrays.");
  featadd("terrainfid", "Terrain collision fidelity", "World", function () {
    terraincollisiontest();
  }, "Bilinear sampling beats nearest cell by a measured margin.");
  featadd("skinan", "Skeletal animation editor", "Animation", skinpanel, "Clips, keys, playback and montage slots.");
  featadd("blendspace", "Blend spaces and montages", "Animation", skinpanel, "One dimensional blend space with montage slot.");
  featadd("bones", "Skeletal and bone control", "Animation", skinpanel, "Per bone rotation limits and poses.");
  featadd("rig", "Control rig", "Animation", rigpanel, "Two bone IK with pole vector.");
  featadd("ragdoll", "Ragdoll", "Animation", rigpanel, "Bone particles with distance constraints.");
  featadd("notify", "Animation events and root motion", "Animation", animnotifypanel, "Notifies fire into the event bus.");
  featadd("facial", "Facial and morph animation", "Animation", facialpanel, "Morph weights with blink and talk drives.");
  featadd("joints", "Joints and constraints", "Physics", jointpanel, "Hinge, ball, spring, distance and fixed.");
  featadd("vehicle", "Vehicle physics", "Physics", vehiclepanel, "Suspension, engine curve and steering.");
  featadd("character", "Character controller", "Physics", charpanel, "Capsule with step, slope and ground snap.");
  featadd("collision", "Collision filtering", "Physics", collisionpanel, "Eight layer interaction matrix.");
  featadd("ccd", "Continuous collision", "Physics", ccdpanel, "Swept contact before the move commits.");
  featadd("fields", "Fields and forces", "Physics", fieldpanel, "Radial, vortex, wind, drag and noise.");
  featadd("destruction", "Destruction depth", "Physics", destructionpanel, "Recursive fracture down to five levels.");
  featadd("soft", "Cloth and soft body", "Physics", destructionpanel, "Mass spring lattice over mesh vertices.");
  featadd("fluid", "Fluid and buoyancy", "Physics", destructionpanel, "Particle fluid with volume buoyancy.");
  featadd("vfx", "Node graph VFX", "Effects", vfxgraphpanel, "Emitter, force, colour and collision modules.");
  featadd("gpu", "GPU simulation", "Effects", gpusimpanal, "Typed array compute with one batched draw.");
  featadd("audio", "Audio node graph", "Audio", audiopanel, "Oscillator, filter, gain, spatial and reverb.");
  featadd("spatial", "Audio spatialisation", "Audio", audiopanel, "Panner with three distance models.");
  featadd("voice", "Voice chat", "Audio", voicepanel, "Microphone capture through the peer session.");
  featadd("music", "Music systems", "Audio", musicpanel, "Step sequencer with stingers and layers.");
  featadd("vis", "Visual scripting", "Logic", vispanel, "Event, branch and action nodes compiling to script.");
  featadd("lang", "Deep language depth", "Logic", scriptpanel, "Full JavaScript with classes, async and closures.");
  featadd("types", "Type checking and linting", "Logic", scriptpanel, "Flow type inference and a lint pass.");
  featadd("hotreload", "Hot reload", "Logic", scriptpanel, "Recompiles and restarts on save.");
  featadd("debug", "Debugging", "Logic", dbgpanel, "Breakpoints, stepping and an output log.");
  featadd("prof", "Profiling depth", "Logic", profpanel, "Per script cost with an engine budget.");
  featadd("pkg", "Module and package system", "Pipeline", pkgpanel, "Semantic versions and dependency resolution.");
  featadd("multi", "Realtime multi user editing", "Pipeline", function () {
    netpanel();
  }, "Presence, selection and actor ops over PeerJS.");
  featadd("ver", "Version history and rollback", "Pipeline", verpanel, "Snapshots with diff and restore.");
  featadd("scm", "Source control", "Pipeline", scmpanel, "Local commit graph with branches.");
  featadd("market", "Asset toolbox and marketplace", "Pipeline", marketpanel, "Packs install sample actors.");
  featadd("device", "Device emulator", "Pipeline", devicepanel, "Resolution, pixel ratio and safe area.");
  featadd("playtest", "Multi client play test", "Pipeline", playtestpanel, "Several clients against one session.");
  featadd("cmd", "Command bar and output", "Pipeline", cmdpanel, "Every panel reachable by name.");
  featadd("dock", "Dock layout and themes", "Editor", dockpanel, "Four layouts and five palettes.");
  featadd("keys", "Keybind editor", "Editor", keybindpanel, "Remap nine core shortcuts.");
  featadd("crash", "Crash recovery", "Editor", crashpanel, "Drafts survive an unclean exit.");
  featadd("access", "Accessibility", "Editor", accesspanel, "Contrast, text scale, motion and focus.");
  featadd("anticheat", "Anti cheat", "Live", anticheatpanel, "Speed and teleport validation.");
  featadd("teleport", "Teleport", "Live", anticheatpanel, "Move the player or an actor instantly.");
  featadd("boards", "Leaderboards and stats", "Live", boardpanel, "Persistent boards and counters.");
  featadd("ops", "Experiments and ops", "Live", labpanel, "Bucket flags and remote config.");
  featadd("lag", "Lag compensation and prediction", "Live", lagpanel, "Server rewind buffer with prediction.");
  featadd("touch", "Touch controls", "Input", inputpanel, "On screen sticks and buttons.");
  featadd("pad", "Gamepad support", "Input", inputpanel, "Standard mapping polling.");
  featadd("vr", "VR", "Input", inputpanel, "WebXR immersive session when present.");
  featadd("loc", "Localisation pipeline", "Input", locpanel, "String tables across five locales.");
  featadd("tex", "Texture import and compression", "Assets", texpanel, "BC1, BC7 and half resolution.");
  featadd("animimport", "Animation import", "Assets", animimportpanel, "glTF joints and samplers.");
  featadd("audioimport", "Audio import and streaming", "Assets", audioimportpanel, "Buffered or streamed playback.");
  featadd("deps", "Asset dependency tracking", "Assets", depspanel, "Reference graph with orphan detection.");
  featadd("paint", "Texture painting", "Assets", paintpanel, "Brush, erase, blur and fill.");
  return featlist;
}

function featgroups() {
  var out = [];
  featbuild().forEach(function (f) {
    if (out.indexOf(f.group) < 0) out.push(f.group);
  });
  return out;
}

function feathub() {
  var list = featbuild();
  var body = '<div class="featbody">';
  body += '<div class="searchbox big">' + ic("search", "ico-sm") + '<input id="featsearch" data-autofocus placeholder="Search ' + list.length + ' features"></div>';
  body += '<div class="featcount"><b>' + list.length + "</b> features wired into the editor</div>";
  body += '<div class="featlist" id="featlist">';
  featgroups().forEach(function (g) {
    body += '<div class="featgroup"><div class="fgh">' + esc(g) + "</div>";
    list.filter(function (f) {
      return f.group === g;
    }).forEach(function (f) {
      body += '<button class="featrow" data-feat="' + esc(f.id) + '"><span class="fdot"></span><span class="fname">' + esc(f.name) + "</span><span class=\"fnote\">" + esc(f.note) + "</span></button>";
    });
    body += "</div>";
  });
  body += "</div></div>";
  var ref = openmodal({
    title: "Feature Hub",
    icon: "grid",
    width: "wide",
    body: body,
    onmount: function (m) {
      var s = m.querySelector("#featsearch");
      s.addEventListener("input", function () {
        var q = s.value.toLowerCase();
        m.querySelectorAll("[data-feat]").forEach(function (b) {
          b.style.display = b.textContent.toLowerCase().indexOf(q) >= 0 ? "" : "none";
        });
      });
      m.addEventListener("click", function (ev) {
        var b = ev.target.closest("[data-feat]");
        if (!b) return;
        var id = b.getAttribute("data-feat");
        closemodal(ref.scrim);
        setTimeout(function () {
          featopen(id);
        }, 70);
      });
    }
  });
  return ref;
}

function featopen(id) {
  var f = null;
  featbuild().forEach(function (x) {
    if (x.id === id) f = x;
  });
  if (!f) {
    toast("Unknown feature " + id, "warn");
    return false;
  }
  try {
    f.open();
    return true;
  } catch (e) {
    toast("Could not open " + f.name + ": " + (e && e.message), "bad");
    return false;
  }
}

function feattest() {
  var list = featbuild();
  var fails = [];
  list.forEach(function (f) {
    try {
      f.open();
    } catch (e) {
      fails.push(f.id + ": " + (e && e.message));
    } finally {
      closemodal();
    }
  });
  return { total: list.length, fails: fails };
}

function xtick(dt, t, playing) {
  if (dt > 0.1) dt = 0.1;
  if (!app.project) return;
  if (!playing && app.screen !== "editor") return;
  if (typeof physxtick === "function") physxtick(dt);
  if (typeof vfxgraphtick === "function") vfxgraphtick(dt);
  if (typeof gpusimstep === "function") gpusimstep(dt);
  if (typeof musictick === "function") musictick();
  if (typeof padpoll === "function") padpoll();
  if (typeof logictick === "function") logictick(dt);
  if (typeof worldtick === "function" && app.camstate) worldtick(app.camstate.eye);
  walk(app.scene.objects || [], function (n) {
    if (n.type === "skinned" && typeof sksystick === "function") sksystick(n, dt, t);
    if (n.cloth && typeof clothstep === "function") clothstep(n, dt);
    if (n.vehicle && playing && typeof vehiclestep === "function") vehiclestep(n, dt, {
      forward: !!(game && game.keys && (game.keys.ArrowUp || game.keys.KeyW)),
      back: !!(game && game.keys && (game.keys.ArrowDown || game.keys.KeyS)),
      left: !!(game && game.keys && (game.keys.ArrowLeft || game.keys.KeyA)),
      right: !!(game && game.keys && (game.keys.ArrowRight || game.keys.KeyD)),
      brake: !!(game && game.keys && game.keys.ShiftLeft)
    });
    if (n.charsys && playing && typeof charstep === "function") charstep(n, dt, {
      forward: !!(game && game.keys && (game.keys.ArrowUp || game.keys.KeyW)),
      back: !!(game && game.keys && (game.keys.ArrowDown || game.keys.KeyS)),
      left: !!(game && game.keys && (game.keys.ArrowLeft || game.keys.KeyA)),
      right: !!(game && game.keys && (game.keys.ArrowRight || game.keys.KeyD)),
      jump: !!(game && game.keys && game.keys.Space)
    });
  });
  if (typeof antistep === "function" && phys.bodies) {
    phys.bodies.forEach(function (b) {
      if (b.node) antistep({ id: b.node.id, x: b.node.pos[0], y: b.node.pos[1], vx: b.vel ? b.vel[0] : 0, vy: b.vel ? b.vel[1] : 0 }, dt);
    });
  }
}

function featboot() {
  featbuild();
  if (typeof r2boot === "function") r2boot();
  if (typeof nodesboot === "function") nodesboot();
  if (typeof devboot === "function") devboot();
  if (typeof liveboot === "function") liveboot();
  if (typeof ioboot === "function") ioboot();
  if (typeof worldsetup === "function") worldsetup();
}

function featactor(type) {
  var made = null;
  if (type === "skinned") made = skinmeshnew("human");
  else if (type === "landscape") made = landnew();
  else if (type === "foliage") made = foliagenew();
  else if (type === "spline") made = splinenew();
  else if (type === "procmesh") made = procmeshnew();
  else if (type === "mesh") made = meshfromshape("box");
  else if (type === "levelinstance") {
    levelinstancenew();
    return true;
  } else if (type === "clustercell") {
    var c = basenode("empty", { name: "World partition cell", pos: [app.cam.target[0], 0, app.cam.target[2]] });
    c.cellgrid = [32, 0, 32];
    addnode(c, null);
    toast("Cell marker added, build the partition grid to fill it", "ok");
    return true;
  }
  if (!made) return false;
  var t = app.cam.target;
  made.pos = [Math.round(t[0] * 10) / 10, Math.max(0, Math.round(t[1] * 10) / 10), Math.round(t[2] * 10) / 10];
  app.selid = made.id;
  app.selids = [made.id];
  commit("add " + type);
  refreshall();
  return true;
}

acts.feat = function () {
  feathub();
};

acts.featpanel = function (id) {
  featopen(id);
};

acts.featrun = function (id) {
  featopen(id);
};

acts.cmdbar = function () {
  cmdpanel();
};
