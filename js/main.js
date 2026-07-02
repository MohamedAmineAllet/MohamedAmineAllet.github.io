// ============================================================
// js/main.js
// Entry point — boots all modules once the DOM is ready.
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  SkillsScene.init();
  Theme.init();   // Apply saved theme (dark / light)
  I18n.init();    // Apply saved language (fr / en)
  Reveal.init();  // Observe scroll-reveal elements
  Scene.init();   // Start Three.js hero scene
});
