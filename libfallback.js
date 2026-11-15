var libretry = 0;
function libmissing() {
  return !(window.THREE && window.THREE.WebGLRenderer) || !(window.FaoxomJs && window.FaoxomJs.WebGLRenderer);
}
function libload(src, kind, done) {
  var tag = document.createElement("script");
  tag.src = src;
  if (kind === "module") tag.type = "module";
  tag.onload = function () {
    done(true);
  };
  tag.onerror = function () {
    done(false);
  };
  document.head.appendChild(tag);
}
function libtick() {
  if (!libmissing()) {
    if (typeof gfxboot === "function") gfxboot();
    return;
  }
  if (libretry > 24) {
    if (typeof toast === "function") toast("3D libraries could not be reached", "warn");
    if (typeof gfxboot === "function") gfxboot();
    return;
  }
  libretry++;
  setTimeout(libtick, 250);
}
setTimeout(function () {
  if (!(window.THREE && window.THREE.WebGLRenderer)) libload("vendor/three.min.js", "", function () {});
  if (!(window.FaoxomJs && window.FaoxomJs.WebGLRenderer)) libload("vendor/faoxomjs.js", "", function () {});
  libtick();
}, 1200);
