// ============================================================
// js/particles.js
// Subtle ambient atmosphere:
//   • ~55 soft dots that gently drift toward the mouse
//   • Very faint connecting lines between close dots
//   • Sonar ripples when mouse moves
//   • Scroll streaks on fast scroll
//   • Periodic scan line
// ============================================================

const Particles = (() => {

  const T = { r: 94, g: 234, b: 212 }; // teal

  const COUNT          = 55;
  const MOUSE_RADIUS   = 160;  // px — attraction zone
  const MOUSE_FORCE    = 0.012; // how strongly dots pull toward cursor
  const CONNECT_DIST   = 110;  // px — max distance to draw a line
  const FRICTION       = 0.96;
  const MAX_SPEED      = 1.2;

  let canvas, ctx, W, H;
  let dots    = [];
  let ripples = [];
  let scan;
  let mx = -999, my = -999;
  let lastRippleX = -999, lastRippleY = -999, lastRippleT = 0;
  let frame = 0;

  // ── Dot ───────────────────────────────────────────────────
  class Dot {
    constructor(randomY = false) {
      this.x     = Math.random() * W;
      this.y     = randomY ? Math.random() * H : H + 5;
      this.vx    = (Math.random() - 0.5) * 0.18;
      this.vy    = -(0.06 + Math.random() * 0.08); // slow upward drift
      this.r     = 1.2 + Math.random() * 1.2;
      this.base  = 0.12 + Math.random() * 0.10;    // base opacity
      this.phase = Math.random() * Math.PI * 2;
    }

    update() {
      // Pull toward mouse when within radius
      const dx = mx - this.x, dy = my - this.y;
      const d  = Math.hypot(dx, dy);
      if (d < MOUSE_RADIUS && d > 1) {
        const f = (1 - d / MOUSE_RADIUS) * MOUSE_FORCE;
        this.vx += (dx / d) * f;
        this.vy += (dy / d) * f;
      }

      // Scroll pushes dots downward briefly
      const sv = window.portfolioState?.scrollVelocity || 0;
      this.vy += sv * 0.001;

      // Clamp speed + friction
      this.vx *= FRICTION; this.vy *= FRICTION;
      const spd = Math.hypot(this.vx, this.vy);
      if (spd > MAX_SPEED) { this.vx = this.vx / spd * MAX_SPEED; this.vy = this.vy / spd * MAX_SPEED; }

      this.x += this.vx; this.y += this.vy;

      // Wrap edges
      if (this.x < -8)    this.x = W + 8;
      if (this.x > W + 8) this.x = -8;
      if (this.y < -8)    this.y = H + 8;
      if (this.y > H + 8) this.y = -8;

      // Gentle pulse opacity
      this.alpha = this.base * (0.6 + 0.4 * Math.sin(frame * 0.008 + this.phase));

      // Boost opacity when near mouse
      if (d < MOUSE_RADIUS) this.alpha = Math.min(0.5, this.alpha + (1 - d / MOUSE_RADIUS) * 0.25);
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${T.r},${T.g},${T.b},${this.alpha})`;
      ctx.fill();
    }
  }

  // ── Faint lines between close dots ────────────────────────
  function drawConnections() {
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const a = dots[i], b = dots[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d > CONNECT_DIST) continue;
        const alpha = (1 - d / CONNECT_DIST) * 0.07; // very faint
        ctx.beginPath();
        ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(${T.r},${T.g},${T.b},${alpha})`;
        ctx.lineWidth   = 0.5;
        ctx.stroke();
      }
    }
  }

  // ── Ripple (sonar ping on mouse move) ─────────────────────
  class Ripple {
    constructor(x, y) {
      this.x = x; this.y = y;
      this.r = 2; this.maxR = 50 + Math.random() * 30;
      this.done = false;
    }
    update() {
      this.r   += 1.0;
      this.alpha = 0.10 * (1 - this.r / this.maxR);
      if (this.r >= this.maxR) this.done = true;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${T.r},${T.g},${T.b},${this.alpha})`;
      ctx.lineWidth   = 0.6;
      ctx.stroke();
    }
  }

  // ── Scan line ─────────────────────────────────────────────
  class ScanLine {
    constructor() { this.y = -10; this.active = false; this.timer = 0; this.next = 480; }
    update() {
      this.timer++;
      if (!this.active && this.timer >= this.next) { this.active = true; this.y = -10; this.timer = 0; }
      if (this.active) { this.y += 2.2; if (this.y > H + 10) { this.active = false; this.next = 420 + Math.random() * 200; } }
    }
    draw() {
      if (!this.active) return;
      const g = ctx.createLinearGradient(0, this.y - 12, 0, this.y + 12);
      g.addColorStop(0,   `rgba(${T.r},${T.g},${T.b},0)`);
      g.addColorStop(0.5, `rgba(${T.r},${T.g},${T.b},0.03)`);
      g.addColorStop(1,   `rgba(${T.r},${T.g},${T.b},0)`);
      ctx.fillStyle = g; ctx.fillRect(0, this.y - 12, W, 24);
    }
  }

  // ── Main loop ─────────────────────────────────────────────
  function draw() {
    requestAnimationFrame(draw);
    ctx.clearRect(0, 0, W, H);
    frame++;

    scan.update(); scan.draw();
    drawConnections();
    dots.forEach(d => { d.update(); d.draw(); });
    ripples = ripples.filter(r => { r.update(); r.draw(); return !r.done; });

    // Soft mouse aura
    if (mx > 0) {
      const aura = ctx.createRadialGradient(mx, my, 0, mx, my, 140);
      aura.addColorStop(0,   `rgba(${T.r},${T.g},${T.b},0.035)`);
      aura.addColorStop(1,   `rgba(${T.r},${T.g},${T.b},0)`);
      ctx.beginPath(); ctx.arc(mx, my, 140, 0, Math.PI * 2);
      ctx.fillStyle = aura; ctx.fill();
    }

    // Scroll streaks
    const sv = Math.abs(window.portfolioState?.scrollVelocity || 0);
    if (sv > 0.5) {
      for (let i = 0; i < 2; i++) {
        const y = Math.random() * H;
        ctx.beginPath(); ctx.moveTo(W * 0.1, y); ctx.lineTo(W * 0.9, y);
        ctx.strokeStyle = `rgba(${T.r},${T.g},${T.b},${Math.min(sv * 0.015, 0.04)})`;
        ctx.lineWidth = 0.4; ctx.stroke();
      }
    }
  }

  // ── Resize ────────────────────────────────────────────────
  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }

  // ── Init ──────────────────────────────────────────────────
  function init() {
    canvas = document.createElement('canvas');
    canvas.id = 'bg-canvas';
    document.body.insertBefore(canvas, document.body.firstChild);
    ctx = canvas.getContext('2d');
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;

    for (let i = 0; i < COUNT; i++) dots.push(new Dot(true));
    scan = new ScanLine();

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      const now = Date.now(), d = Math.hypot(e.clientX - lastRippleX, e.clientY - lastRippleY);
      if (d > 55 && now - lastRippleT > 280 && ripples.length < 3) {
        ripples.push(new Ripple(e.clientX, e.clientY));
        lastRippleX = e.clientX; lastRippleY = e.clientY; lastRippleT = now;
      }
    });
    document.addEventListener('mouseleave', () => { mx = -999; my = -999; });

    draw();
  }

  return { init };
})();
