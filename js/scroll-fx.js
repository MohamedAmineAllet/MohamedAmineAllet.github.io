// ============================================================
// js/scroll-fx.js
// Scroll progress bar + shared scroll state for 3D scenes.
// Exposes window.portfolioState = { scrollY, scrollVelocity }
// ============================================================

const ScrollFX = (() => {

  // Shared state read by scene.js
  window.portfolioState = { scrollY: 0, scrollVelocity: 0 };

  let lastScrollY = 0;
  let lastTime    = performance.now();
  let ticking     = false;
  let bar;

  function update() {
    const now      = performance.now();
    const scrollY  = window.scrollY;
    const dt       = Math.max(now - lastTime, 1);
    const velocity = (scrollY - lastScrollY) / dt; // px/ms

    window.portfolioState.scrollY        = scrollY;
    window.portfolioState.scrollVelocity = velocity;

    // Progress bar (scaleX from 0→1)
    if (bar) {
      const total    = document.body.scrollHeight - window.innerHeight;
      const progress = total > 0 ? scrollY / total : 0;
      bar.style.transform = `scaleX(${progress})`;
    }

    lastScrollY = scrollY;
    lastTime    = now;
    ticking     = false;
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  function init() {
    bar = document.getElementById('scroll-progress');
    window.addEventListener('scroll', onScroll, { passive: true });

    // Decay velocity each frame so it smoothly returns to 0
    (function decayLoop() {
      requestAnimationFrame(decayLoop);
      window.portfolioState.scrollVelocity *= 0.88;
    })();
  }

  return { init };
})();
