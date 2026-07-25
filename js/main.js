// ============================================================
// js/main.js
// Entry point — boots all modules once the DOM is ready.
// Load order: ScrollFX first (sets up portfolioState before
// scenes try to read it), then everything else.
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  if(typeof ScrollFX != undefined) ScrollFX.init();     // Scroll progress bar + portfolioState
  if (typeof Theme != undefined) Theme.init();        // Dark / light theme
    
  if (typeof I18n != undefined) I18n.init();         // Language switching (fr / en)

  
  if (typeof Reveal != undefined) Reveal.init();       // Scroll-reveal entrance animations

  
  if (typeof Scene != undefined) Scene.init();        // Hero Three.js scene

  
  if (typeof Particles != undefined) Particles.init();    // Full-page particle network

  
  if (typeof SkillsScene != undefined) SkillsScene.init();  // Skills section Three.js background

  
  if (typeof Cursor != undefined) Cursor.init();       // Custom cursor + magnetic buttons (desktop only)

  
  if (typeof Typewriter != undefined) Typewriter.init();
});
