function startapp() {
  boot();
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", startapp);
else startapp();
