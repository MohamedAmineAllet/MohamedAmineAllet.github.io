// ============================================================
// js/main.js
// Entry point — boots all modules once the DOM is ready.
// Load order: ScrollFX first (sets up portfolioState before
// scenes try to read it), then everything else.
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  ScrollFX.init();     // Scroll progress bar + portfolioState
  Theme.init();        // Dark / light theme
  I18n.init();         // Language switching (fr / en)
  Reveal.init();       // Scroll-reveal entrance animations
  Scene.init();        // Hero Three.js scene
  Particles.init();    // Full-page particle network
  SkillsScene.init();  // Skills section Three.js background
  Cursor.init();       // Custom cursor + magnetic buttons (desktop only)
});
