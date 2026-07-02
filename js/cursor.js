// ============================================================
// js/cursor.js
// Custom cursor (dot + trailing ring) + magnetic buttons.
// Skipped on touch devices automatically.
// ============================================================

const Cursor = (() => {

  // ── State ─────────────────────────────────────────────────
  let mx = -200, my = -200; // mouse position
  let rx = -200, ry = -200; // ring lerped position
  let hovering = false;
  let dot, ring;

  // ── DOM ───────────────────────────────────────────────────
  function createElements() {
    dot = document.createElement('div');
    dot.id = 'cursor-dot';

    ring = document.createElement('div');
    ring.id = 'cursor-ring';

    document.body.append(dot, ring);
    document.body.classList.add('custom-cursor');
  }

  // ── Mouse tracking ────────────────────────────────────────
  function onMouseMove(e) {
    mx = e.clientX;
    my = e.clientY;

    // Dot follows instantly
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
  }

  // ── Magnetic buttons ──────────────────────────────────────
  // Buttons gently pull toward the cursor when nearby
  const MAGNETIC_THRESHOLD = 110;
  const MAGNETIC_FACTOR    = 0.38;
  let magneticEls = [];

  function updateMagnetic() {
    magneticEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = mx - cx;
      const dy = my - cy;
      const dist = Math.hypot(dx, dy);

      if (dist < MAGNETIC_THRESHOLD) {
        const pull = (1 - dist / MAGNETIC_THRESHOLD) * MAGNETIC_FACTOR;
        el.style.transform = `translate(${dx * pull}px, ${dy * pull}px)`;
      } else {
        el.style.transform = '';
      }
    });
  }

  // ── Animation loop ────────────────────────────────────────
  function loop() {
    requestAnimationFrame(loop);

    // Smooth ring chase
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;

    const scale = hovering ? 1.7 : 1;
    ring.style.transform =
      `translate(${rx}px, ${ry}px) translate(-50%, -50%) scale(${scale})`;

    updateMagnetic();
  }

  // ── Hover states ──────────────────────────────────────────
  function bindHoverTargets() {
    document.querySelectorAll('a, button, .skill-icon-card, .project-card').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        hovering = true;
        dot.classList.add('hovered');
        ring.classList.add('hovered');
      });
      el.addEventListener('mouseleave', () => {
        hovering = false;
        dot.classList.remove('hovered');
        ring.classList.remove('hovered');
      });
    });
  }

  // ── Public API ────────────────────────────────────────────
  function init() {
    // Skip on touch / pointer-coarse devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    createElements();
    magneticEls = [...document.querySelectorAll('.btn')];

    document.addEventListener('mousemove', onMouseMove);
    bindHoverTargets();
    loop();
  }

  return { init };
})();
