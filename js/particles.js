// ============================================================
// js/particles.js
// Ambient star-like dots with mouse attraction + scroll color shift.
//   • ~60 dots, more visible, gently attracted to mouse
//   • Faint connection lines between close dots
//   • Color shifts teal → amber → teal as you scroll down
//   • Scroll speed adds turbulence
//   • Sonar ripples on mouse move
//   • Subtle scan line every ~8s
// ============================================================

const Particles = (() => {

  // Color palette

function getColors() {
  const dark = document.documentElement.getAttribute('data-theme') !== 'light';
  return {
    teal:  dark ? [94, 234, 212] : [10, 100, 60],
    amber: dark ? [242, 169, 59] : [63,  81, 181],
  };
}

  // Dot config
  const COUNT         = 85;
  const BASE_ALPHA    = 0.30;   // base opacity — higher = more visible
  const MOUSE_R       = 170;    // attraction radius
  const MOUSE_F       = 0.014;
  const CONNECT_DIST  = 115;
  const FRICTION      = 0.965;
  const MAX_SPEED     = 1.4;
  const DOT_RADIUS    = 1.6;    // slightly larger dots

  let canvas, ctx, W, H;
  let dots = [], ripples = [];
  let scan;
  let mx = -999, my = -999;
  let lastRx = -999, lastRy = -999, lastRt = 0;
  let frame = 0;

  // ── Color lerp ────────────────────────────────────────────
  function lerp(a, b, t) {
    return [
      Math.round(a[0] + (b[0] - a[0]) * t),
      Math.round(a[1] + (b[1] - a[1]) * t),
      Math.round(a[2] + (b[2] - a[2]) * t),
    ];
  }

 function scrollColor() {
  const { teal, amber } = getColors();
  const total    = Math.max(document.body.scrollHeight - H, 1);
  const progress = window.scrollY / total;
  const ping     = Math.abs((progress * 2) % 2 - 1);
  return lerp(teal, amber, ping);
}

  // ── Dot ───────────────────────────────────────────────────
  class Dot {
    constructor() {
      this.x     = Math.random() * W;
      this.y     = Math.random() * H;
      this.vx    = (Math.random() - 0.5) * 0.18;
      this.vy    = -(0.08 + Math.random() * 0.10);
      this.r     = DOT_RADIUS + Math.random() * 0.9;
      this.base  = BASE_ALPHA * (0.65 + Math.random() * 0.55);
      this.phase = Math.random() * Math.PI * 2;
    }

    update() {
      // Mouse attraction
      const dx = mx - this.x, dy = my - this.y;
      const d  = Math.hypot(dx, dy);
      if (d < MOUSE_R && d > 1) {
        const f = (1 - d / MOUSE_R) * MOUSE_F;
        this.vx += (dx / d) * f;
        this.vy += (dy / d) * f;
      }

      // Scroll turbulence
      const sv = window.portfolioState?.scrollVelocity || 0;
      this.vy += sv * 0.0012;
      this.vx += sv * (Math.random() - 0.5) * 0.0005;

      this.vx *= FRICTION;
      this.vy *= FRICTION;

      const spd = Math.hypot(this.vx, this.vy);
      if (spd > MAX_SPEED) { this.vx = this.vx / spd * MAX_SPEED; this.vy = this.vy / spd * MAX_SPEED; }

      this.x += this.vx;
      this.y += this.vy;

      if (this.x < -8)    this.x = W + 8;
      if (this.x > W + 8) this.x = -8;
      if (this.y < -8)    this.y = H + 8;
      if (this.y > H + 8) this.y = -8;

      // Pulse
      this.alpha = this.base * (0.6 + 0.4 * Math.sin(frame * 0.007 + this.phase));

      // Boost near mouse
      if (d < MOUSE_R) this.alpha = Math.min(0.85, this.alpha + (1 - d / MOUSE_R) * 0.35);
    }

    draw(r, g, b) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${this.alpha})`;
      ctx.fill();
    }
  }

  // ── Connections ────────────────────────────────────────────
  function drawConnections(r, g, b) {
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const a = dots[i], b_ = dots[j];
        const d = Math.hypot(a.x - b_.x, a.y - b_.y);
        if (d > CONNECT_DIST) continue;
        const alpha = (1 - d / CONNECT_DIST) * 0.10;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y); ctx.lineTo(b_.x, b_.y);
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.lineWidth   = 0.5;
        ctx.stroke();
      }
    }
  }

  // ── Ripple ────────────────────────────────────────────────
  class Ripple {
    constructor(x, y) {
      this.x = x; this.y = y;
      this.r = 2; this.maxR = 55 + Math.random() * 30;
      this.done = false;
    }
    update() {
      this.r   += 1.0;
      this.alpha = 0.12 * (1 - this.r / this.maxR);
      if (this.r >= this.maxR) this.done = true;
    }
    draw(r, g, b) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${r},${g},${b},${this.alpha})`;
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
    draw(r, g, b) {
      if (!this.active) return;
      const gr = ctx.createLinearGradient(0, this.y - 12, 0, this.y + 12);
      gr.addColorStop(0,   `rgba(${r},${g},${b},0)`);
      gr.addColorStop(0.5, `rgba(${r},${g},${b},0.04)`);
      gr.addColorStop(1,   `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = gr; ctx.fillRect(0, this.y - 12, W, 24);
    }
  }

  // ── Main loop ─────────────────────────────────────────────
  function draw() {
    requestAnimationFrame(draw);
    ctx.clearRect(0, 0, W, H);
    frame++;

    const [r, g, b] = scrollColor();

    scan.update(); scan.draw(r, g, b);
    drawConnections(r, g, b);
    dots.forEach(d => { d.update(); d.draw(r, g, b); });
    ripples = ripples.filter(rp => { rp.update(); rp.draw(r, g, b); return !rp.done; });

    // Soft aura around cursor
    if (mx > 0) {
      const aura = ctx.createRadialGradient(mx, my, 0, mx, my, 150);
      aura.addColorStop(0,   `rgba(${r},${g},${b},0.045)`);
      aura.addColorStop(1,   `rgba(${r},${g},${b},0)`);
      ctx.beginPath(); ctx.arc(mx, my, 150, 0, Math.PI * 2);
      ctx.fillStyle = aura; ctx.fill();
    }

    // Scroll streaks
    const sv = Math.abs(window.portfolioState?.scrollVelocity || 0);
    if (sv > 0.5) {
      for (let i = 0; i < 2; i++) {
        const y = Math.random() * H;
        ctx.beginPath(); ctx.moveTo(W * 0.1, y); ctx.lineTo(W * 0.9, y);
        ctx.strokeStyle = `rgba(${r},${g},${b},${Math.min(sv * 0.015, 0.05)})`;
        ctx.lineWidth = 0.4; ctx.stroke();
      }
    }
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function init() {
    canvas = document.createElement('canvas');
    canvas.id = 'bg-canvas';
    document.body.insertBefore(canvas, document.body.firstChild);
    ctx = canvas.getContext('2d');
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;

    for (let i = 0; i < COUNT; i++) dots.push(new Dot());
    scan = new ScanLine();

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      const now = Date.now(), d = Math.hypot(e.clientX - lastRx, e.clientY - lastRy);
      if (d > 55 && now - lastRt > 260 && ripples.length < 4) {
        ripples.push(new Ripple(e.clientX, e.clientY));
        lastRx = e.clientX; lastRy = e.clientY; lastRt = now;
      }
    });
    document.addEventListener('mouseleave', () => { mx = -999; my = -999; });

    draw();
  }

  return { init };
})();
