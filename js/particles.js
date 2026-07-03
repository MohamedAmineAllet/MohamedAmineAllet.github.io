// ============================================================
// js/particles.js
// Full-page fixed particle network in background.
// - Particles drift and connect with lines when close
// - Mouse attracts particles gently within a radius
// - Scroll speed adds turbulence
// - Color shifts gradually from teal → amber as you scroll
// ============================================================

const Particles = (() => {

  // ── Config ────────────────────────────────────────────────
  const COUNT       = 85;
  const MAX_DIST    = 135;   // max px for connecting lines
  const MOUSE_R     = 180;   // mouse attraction radius
  const MOUSE_F     = 0.016; // mouse force strength
  const FRICTION    = 0.965;
  const BASE_SPEED  = 0.35;

  // Colors: teal → amber (scroll lerp)
  const C_TEAL  = [94,  234, 212];
  const C_AMBER = [242, 169, 59 ];

  // ── State ─────────────────────────────────────────────────
  let canvas, ctx;
  let W = window.innerWidth;
  let H = window.innerHeight;
  let mouseX = -999, mouseY = -999;
  let particles = [];

  // ── Particle class ────────────────────────────────────────
  class Particle {
    constructor() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * BASE_SPEED;
      this.vy = (Math.random() - 0.5) * BASE_SPEED;
      this.r  = 1.4 + Math.random() * 1.6;
      this.baseAlpha = 0.25 + Math.random() * 0.35;
    }

    update() {
      // Mouse gentle attraction
      const dx   = mouseX - this.x;
      const dy   = mouseY - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist < MOUSE_R && dist > 1) {
        const f = (1 - dist / MOUSE_R) * MOUSE_F;
        this.vx += (dx / dist) * f;
        this.vy += (dy / dist) * f;
      }

      // Scroll turbulence — fast scroll pushes particles
      const vel = window.portfolioState?.scrollVelocity || 0;
      this.vy += vel * 0.0025;
      this.vx += vel * (Math.random() - 0.5) * 0.001;

      // Friction
      this.vx *= FRICTION;
      this.vy *= FRICTION;

      // Clamp speed
      const speed = Math.hypot(this.vx, this.vy);
      if (speed > 2.5) { this.vx = (this.vx / speed) * 2.5; this.vy = (this.vy / speed) * 2.5; }

      this.x += this.vx;
      this.y += this.vy;

      // Wrap around viewport edges (soft)
      if (this.x < -30)    this.x = W + 30;
      if (this.x > W + 30) this.x = -30;
      if (this.y < -30)    this.y = H + 30;
      if (this.y > H + 30) this.y = -30;
    }
  }

  // ── Color lerp helper ─────────────────────────────────────
  function lerpColor(a, b, t) {
    return [
      Math.round(a[0] + (b[0] - a[0]) * t),
      Math.round(a[1] + (b[1] - a[1]) * t),
      Math.round(a[2] + (b[2] - a[2]) * t),
    ];
  }

  // ── Main draw loop ────────────────────────────────────────
  function draw() {
    requestAnimationFrame(draw);
    ctx.clearRect(0, 0, W, H);

    // Color based on scroll progress (0 = teal, 1 = amber, back to teal)
    const total    = Math.max(document.body.scrollHeight - H, 1);
    const progress = window.scrollY / total;
    // Ping-pong: teal → amber → teal
    const pingpong = Math.abs((progress * 2) % 2 - 1);
    const [r, g, b] = lerpColor(C_TEAL, C_AMBER, pingpong);

    // Draw connections first (behind particles)
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const q    = particles[j];
        const dx   = p.x - q.x;
        const dy   = p.y - q.y;
        const dist = Math.hypot(dx, dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.14;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx.lineWidth   = 0.75;
          ctx.stroke();
        }
      }
    }

    // Draw + update particles
    particles.forEach((p) => {
      p.update();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${p.baseAlpha})`;
      ctx.fill();
    });
  }

  // ── Resize ────────────────────────────────────────────────
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  // ── Public API ────────────────────────────────────────────
  function init() {
    canvas = document.createElement('canvas');
    canvas.id = 'bg-canvas';
    document.body.insertBefore(canvas, document.body.firstChild);
    ctx = canvas.getContext('2d');

    resize();
    window.addEventListener('resize', resize);

    // Spread particles across viewport
    for (let i = 0; i < COUNT; i++) {
      particles.push(new Particle());
    }

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Hide mouse on leave
    document.addEventListener('mouseleave', () => { mouseX = -999; mouseY = -999; });

    draw();
  }

  return { init };
})();
