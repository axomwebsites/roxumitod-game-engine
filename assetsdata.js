var kits = [
  {
    id: "proto",
    label: "Prototype Kit",
    kind: "models",
    credit: "Assets by Kenney, free for any game (CC0).",
    items: [
      "Animal bison|animal", "Animal dog|animal", "Animal horse|animal", "Button floor round|button", "Button floor round pressed|button",
      "Button floor square|button", "Button floor square pressed|button", "Coin|coin", "Column low|column", "Column rounded|column",
      "Column rounded top|column", "Column triangle|column", "Column|column", "Crate color|crate", "Crate|crate", "Door garage|door",
      "Door rotate|door", "Door sliding|door", "Door sliding double|door", "Fence|fence", "Fence broken|fence", "Fence high|fence",
      "Flower purple|flower", "Flower red|flower", "Flower yellow|flower", "Grass large|generic", "Grass|generic", "Grass tuft|generic",
      "Ground grass large|generic", "Ground grass|generic", "Ground path|generic", "Ground rock|rock", "Ground|generic", "Lamp|column",
      "Lever|column", "Lever base|generic", "Mushroom large|mushroom", "Mushroom small|mushroom", "Platform|generic", "Rock large|rock",
      "Rock small|rock", "Rock wide|rock", "Sign|panel", "Stairs|generic", "Stairs wide|generic", "Structure|generic", "Switch|button",
      "Tree large|tree", "Tree small|tree", "Tree trunk|tree", "Tree|tree", "Wall corner|generic", "Wall door|generic", "Wall half|generic",
      "Wall|generic", "Window|panel"
    ]
  },
  {
    id: "platformer",
    label: "Platformer Kit",
    kind: "models",
    credit: "Assets by Kenney, free for any game (CC0).",
    items: [
      "Arrow|panel", "Coin|coin", "Crate|crate", "Door|door", "Grass block|generic", "Hazard spikes|generic", "Heart|panel", "Ladder|fence",
      "Platform large|generic", "Platform|generic", "Player|animal", "Sign|panel", "Spring|generic", "Star|panel", "Stone block|generic",
      "Water|generic", "Bridge|fence", "Cloud|generic", "Flag|panel", "Gem|coin"
    ]
  },
  {
    id: "nature",
    label: "Nature Kit",
    kind: "models",
    credit: "Assets by Kenney, free for any game (CC0).",
    items: [
      "Birch tree|tree", "Bush|tree", "Cactus|tree", "Flower|flower", "Grass|generic", "Mushroom|mushroom", "Pine tree|tree",
      "Rock|rock", "Stump|rock", "Tree|tree", "Wheat|flower", "Log|generic", "Pebbles|rock", "Campfire|generic"
    ]
  },
  {
    id: "car",
    label: "Car Kit",
    kind: "models",
    credit: "Assets by Kenney, free for any game (CC0).",
    items: [
      "Car hatchback|car", "Car sedan|car", "Car sport|car", "Car taxi|car", "Car truck|car", "Wheel|coin", "Road straight|road",
      "Road corner|road", "Road crossing|road", "Road light|column", "Road bend|road", "Road end|road"
    ]
  },
  {
    id: "citycom",
    label: "City Kit (Commercial)",
    kind: "models",
    credit: "Assets by Kenney, free for any game (CC0).",
    items: [
      "Building A|building", "Building B|building", "Building C|building", "Building D|building", "Building E|building", "Awning|panel",
      "Bench|generic", "Billboard|panel", "Cafe|building", "Fountain|generic", "Lamppost|column", "Planter|generic", "Shop|building",
      "Sign|panel", "Street lamp|column", "Trash can|generic"
    ]
  },
  {
    id: "citysub",
    label: "City Kit (Suburban)",
    kind: "models",
    credit: "Assets by Kenney, free for any game (CC0).",
    items: [
      "House A|building", "House B|building", "House C|building", "House D|building", "Garage|building", "Hedge|fence",
      "Mailbox|column", "Porch|generic", "Roof|generic", "Shed|building", "Tree|tree", "Fence|fence", "Driveway|road"
    ]
  },
  {
    id: "cityroad",
    label: "City Kit (Roads)",
    kind: "models",
    credit: "Assets by Kenney, free for any game (CC0).",
    items: [
      "Crossroad|road", "Intersection|road", "Road bend|road", "Road end|road", "Road straight|road", "Road tiles|road",
      "Sidewalk|road", "Streetlight|column", "Traffic light|column", "Roundabout|road"
    ]
  },
  {
    id: "uipack",
    label: "UI Pack: RPG Expansion",
    kind: "images",
    credit: "Assets by Kenney, free for any game (CC0).",
    items: [
      "Arrow beige left|arrow|#e8d3a5", "Arrow beige right|arrow|#e8d3a5", "Arrow blue left|arrow|#a8c6e8", "Arrow blue right|arrow|#a8c6e8",
      "Arrow brown left|arrow|#c19a6b", "Arrow brown right|arrow|#c19a6b", "Arrow silver left|arrow|#d7dbe2", "Arrow silver right|arrow|#d7dbe2",
      "Bar back horizontal|bar|#6b7f8e", "Bar back horizontal small|bar|#6b7f8e", "Bar blue horizontal|bar|#5aa9e8", "Bar blue horizontal small|bar|#5aa9e8",
      "Bar green horizontal|bar|#69c07d", "Bar green horizontal small|bar|#69c07d", "Bar red horizontal|bar|#e06c62", "Bar yellow horizontal|bar|#e8c25a",
      "Check beige|icon|#e8d3a5", "Check green|icon|#8ce874", "Cross red|icon|#e06c62", "Circle blue|icon|#5aa9e8"
    ]
  },
  {
    id: "uiborder",
    label: "Fantasy UI Borders",
    kind: "images",
    credit: "Assets by Kenney, free for any game (CC0).",
    items: [
      "Border A|frame|#c9a463", "Border B|frame|#8a5bd6", "Border C|frame|#5aa9e8", "Border D|frame|#e06c62",
      "Panel A|frame|#c9a463", "Panel B|frame|#8a5bd6", "Panel C|frame|#5aa9e8", "Panel D|frame|#69c07d",
      "Ribbon|bar|#c9a463", "Button|frame|#d7dbe2", "Divider|bar|#c9a463", "Frame round|frame|#c9a463"
    ]
  }
];

function kitbyid(id) {
  for (var i = 0; i < kits.length; i++) if (kits[i].id === id) return kits[i];
  return kits[0];
}

function parsekit(kit) {
  if (kit.parsed) return kit.parsed;
  var list = [];
  kit.items.forEach(function (raw) {
    var parts = raw.split("|");
    var item = { n: parts[0], k: parts[1] || "generic", p: parts[2] || null, col: parts[2] || null };
    if (parts[2] && parts[2].charAt(0) === "#") item.col = parts[2];
    if (item.k === "arrow") item.dir = /right/.test(item.n) ? "right" : "left";
    list.push(item);
  });
  kit.parsed = list;
  return list;
}

var thumburlcache = {};

function kitthumburl(item, kit) {
  var key = kit.id + "|" + item.n;
  if (thumburlcache[key]) return thumburlcache[key];
  var url = kit.kind === "images" ? uiitemthumb(item, kit.id).toDataURL("image/png") : kitthumb(item, kit.id).toDataURL("image/png");
  thumburlcache[key] = url;
  return url;
}

var imageresultkit = { count: 0 };

function templateurl(id) {
  return templateart(id).toDataURL("image/png");
}
