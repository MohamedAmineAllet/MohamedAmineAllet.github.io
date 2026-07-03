// ============================================================
// js/bg-scene.js
// Single fixed canvas behind the entire page.
// Each section gets its own 3D background elements that
// fade in/out based on scroll position.
//
//  About    → wireframe icosahedron + octahedron
//  Skills   → 5 rotating tori rings (replaces #skills-canvas)
//  Projects → floating particle constellation
//  Contact  → pulsing sonar rings
// ============================================================

const BgScene = (() => {

  // ── Config ────────────────────────────────────────────────
  const MAX_OPACITY = {
    global:   0.05,   // ambient particle field, always visible
    about:    0.14,
    skills:   0.18,
    projects: 0.13,
    contact:  0.28,
  };

  // ── State ─────────────────────────────────────────────────
  let _scene, _camera, _renderer, _canvas;
  let _sections = {};
  let _groups   = {};   // { about: [], skills: [], projects: [], contact: [], global: [] }

  // ── Visibility helper ─────────────────────────────────────
  // Returns 0→1 based on how centred the section is in the viewport
  function getVis(sectionId) {
    const el = _sections[sectionId];
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const vh   = window.innerHeight;
    const vc   = vh / 2;
    const sc   = rect.top + rect.height / 2;
    const span = vc + rect.height / 2;
    return Math.max(0, 1 - Math.abs(sc - vc) / span);
  }

  // ── Builders ──────────────────────────────────────────────

  function buildGlobal() {
    // 50 tiny ambient dots always present across the whole page
    const count = 50;
    const positions = new Float32Array(count * 3);
    const phases    = [];
    for (let i = 0; i < count; i++) {
      positions[i*3]   = (Math.random() - 0.5) * 22;
      positions[i*3+1] = (Math.random() - 0.5) * 14;
      positions[i*3+2] = (Math.random() - 0.5) * 4 - 4;
      phases.push({
        sx: Math.random() * 0.4 + 0.1,
        sy: Math.random() * 0.4 + 0.1,
        px: Math.random() * Math.PI * 2,
        py: Math.random() * Math.PI * 2,
        ax: Math.random() * 0.8 + 0.2,
        ay: Math.random() * 0.8 + 0.2,
        bx: positions[i*3],
        by: positions[i*3+1],
      });
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xe9ecf1, size: 0.04,
      transparent: true, opacity: MAX_OPACITY.global,
    });
    const pts = new THREE.Points(geo, mat);
    pts.userData = { phases };
    _scene.add(pts);
    _groups.global.push(pts);
  }

  function buildAbout() {
    // Large wireframe icosahedron — right side
    const mat1 = new THREE.MeshBasicMaterial({
      color: 0x5eead4, wireframe: true, transparent: true, opacity: 0,
    });
    const ico = new THREE.Mesh(new THREE.IcosahedronGeometry(4.5, 1), mat1);
    ico.position.set(7, 0.5, -10);
    ico.userData = { ry: 0.003, rx: 0.0015 };
    _scene.add(ico);
    _groups.about.push(ico);

    // Smaller octahedron — left side
    const mat2 = new THREE.MeshBasicMaterial({
      color: 0xf2a93b, wireframe: true, transparent: true, opacity: 0,
    });
    const oct = new THREE.Mesh(new THREE.OctahedronGeometry(2.8, 0), mat2);
    oct.position.set(-7.5, -1.5, -8);
    oct.userData = { ry: -0.004, rx: 0.002 };
    _scene.add(oct);
    _groups.about.push(oct);
  }

  function buildSkills() {
    // 5 tori rings at different sizes & tilts
    const RINGS = [
      { r: 3.2, t: 0.06, c: 0x5eead4, rx:  0.4, rz:  0.2, vy:  0.003, vx:  0.001 },
      { r: 4.8, t: 0.05, c: 0xf2a93b, rx:  1.1, rz: -0.5, vy: -0.002, vx:  0.0015 },
      { r: 2.4, t: 0.07, c: 0x5eead4, rx: -0.8, rz:  0.9, vy:  0.004, vx: -0.002 },
      { r: 6.0, t: 0.04, c: 0xe9ecf1, rx:  0.2, rz:  1.2, vy:  0.0015,vx:  0.001 },
      { r: 1.6, t: 0.08, c: 0xf2a93b, rx:  1.5, rz: -1.0, vy: -0.005, vx:  0.003 },
    ];
    RINGS.forEach((cfg) => {
      const mat = new THREE.MeshStandardMaterial({
        color: cfg.c, roughness: 0.5, metalness: 0.3,
        transparent: true, opacity: 0,
      });
      const mesh = new THREE.Mesh(new THREE.TorusGeometry(cfg.r, cfg.t, 16, 120), mat);
      mesh.rotation.x = cfg.rx;
      mesh.rotation.z = cfg.rz;
      mesh.userData   = { vy: cfg.vy, vx: cfg.vx };
      _scene.add(mesh);
      _groups.skills.push(mesh);
    });
  }

  function buildProjects() {
    // Constellation: 150 floating dots
    const count  = 150;
    const pos    = new Float32Array(count * 3);
    const phases = [];
    for (let i = 0; i < count; i++) {
      const bx = (Math.random() - 0.5) * 22;
      const by = (Math.random() - 0.5) * 14;
      const bz = (Math.random() - 0.5) * 4 - 3;
      pos[i*3]   = bx;
      pos[i*3+1] = by;
      pos[i*3+2] = bz;
      phases.push({
        bx, by,
        sx: Math.random() * 0.3 + 0.05,
        sy: Math.random() * 0.3 + 0.05,
        px: Math.random() * Math.PI * 2,
        py: Math.random() * Math.PI * 2,
        ax: Math.random() * 0.5 + 0.1,
        ay: Math.random() * 0.5 + 0.1,
      });
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x5eead4, size: 0.07,
      transparent: true, opacity: 0,
    });
    const pts = new THREE.Points(geo, mat);
    pts.userData = { phases };
    _scene.add(pts);
    _groups.projects.push(pts);

    // Thin connecting lines between nearby particles (static, just visual)
    const linePositions = [];
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = pos[i*3] - pos[j*3];
        const dy = pos[i*3+1] - pos[j*3+1];
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 3.5) {
          linePositions.push(pos[i*3], pos[i*3+1], pos[i*3+2]);
          linePositions.push(pos[j*3], pos[j*3+1], pos[j*3+2]);
        }
      }
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x5eead4, transparent: true, opacity: 0,
    });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    _scene.add(lines);
    _groups.projects.push(lines);
  }

  function buildContact() {
    // 4 concentric pulsing sonar rings
    for (let i = 0; i < 4; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0x5eead4, transparent: true, opacity: 0,
      });
      const mesh = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.015, 8, 80), mat);
      mesh.rotation.x   = Math.PI / 2;
      mesh.userData     = { phase: (i / 4) * Math.PI * 2, baseScale: 1 + i * 0.3 };
      _scene.add(mesh);
      _groups.contact.push(mesh);
    }
  }

  // ── Animation loop ────────────────────────────────────────
  function animate() {
    requestAnimationFrame(animate);
    const t   = performance.now() / 1000;
    const vis = {
      about:    getVis('about'),
      skills:   getVis('skills'),
      projects: getVis('projects'),
      contact:  getVis('contact'),
    };
    const scrollVel = window.portfolioState?.scrollVelocity || 0;

    // ── Global ambient dots (always moving, constant opacity)
    _groups.global.forEach((pts) => {
      const pos    = pts.geometry.attributes.position;
      const phases = pts.userData.phases;
      for (let i = 0; i < phases.length; i++) {
        const p = phases[i];
        pos.array[i*3]   = p.bx + Math.sin(t * p.sx + p.px) * p.ax;
        pos.array[i*3+1] = p.by + Math.cos(t * p.sy + p.py) * p.ay;
      }
      pos.needsUpdate = true;
    });

    // ── About shapes
    _groups.about.forEach((mesh) => {
      mesh.material.opacity = vis.about * MAX_OPACITY.about;
      mesh.rotation.y += mesh.userData.ry;
      mesh.rotation.x += mesh.userData.rx;
    });

    // ── Skills rings
    const boost = Math.abs(scrollVel) * 0.25;
    _groups.skills.forEach((ring) => {
      ring.material.opacity = vis.skills * MAX_OPACITY.skills;
      const dir = ring.userData.vy > 0 ? 1 : -1;
      ring.rotation.y += ring.userData.vy + dir * boost * 0.003;
      ring.rotation.x += ring.userData.vx;
    });

    // ── Projects constellation
    _groups.projects.forEach((obj, idx) => {
      if (idx === 0) {
        // Dots — animate positions with sin/cos
        obj.material.opacity = vis.projects * MAX_OPACITY.projects;
        const pos    = obj.geometry.attributes.position;
        const phases = obj.userData.phases;
        for (let i = 0; i < phases.length; i++) {
          const p = phases[i];
          pos.array[i*3]   = p.bx + Math.sin(t * p.sx + p.px) * p.ax;
          pos.array[i*3+1] = p.by + Math.cos(t * p.sy + p.py) * p.ay;
        }
        pos.needsUpdate = true;
      } else {
        // Lines — same opacity but dimmer
        obj.material.opacity = vis.projects * MAX_OPACITY.projects * 0.3;
      }
    });

    // ── Contact sonar rings (pulse outward + fade)
    _groups.contact.forEach((ring) => {
      const phase   = ring.userData.phase;
      const pulse   = ((t * 0.4 + phase / (Math.PI * 2)) % 1); // 0→1 cycle
      const scale   = ring.userData.baseScale + pulse * 6;
      ring.scale.setScalar(scale);
      ring.material.opacity = vis.contact * MAX_OPACITY.contact * (1 - pulse) * (1 - pulse);
    });

    _renderer.render(_scene, _camera);
  }

  // ── Resize ────────────────────────────────────────────────
  function onResize() {
    const w = _canvas.clientWidth, h = _canvas.clientHeight;
    _camera.aspect = w / h;
    _camera.updateProjectionMatrix();
    _renderer.setSize(w, h);
  }

  // ── Public API ────────────────────────────────────────────
  function init(canvasId = 'bg-canvas') {
    _canvas = document.getElementById(canvasId);
    if (!_canvas) return;
    if (!(_canvas.getContext('webgl') || _canvas.getContext('experimental-webgl'))) return;

    _sections = {
      about:    document.getElementById('about'),
      skills:   document.getElementById('skills'),
      projects: document.getElementById('projects'),
      contact:  document.getElementById('contact'),
    };

    _groups = { about: [], skills: [], projects: [], contact: [], global: [] };

    _scene  = new THREE.Scene();
    _camera = new THREE.PerspectiveCamera(60, _canvas.clientWidth / _canvas.clientHeight, 0.1, 100);
    _camera.position.z = 10;

    _renderer = new THREE.WebGLRenderer({ canvas: _canvas, alpha: true, antialias: true });
    _renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    _renderer.setSize(_canvas.clientWidth, _canvas.clientHeight);

    // Lights for tori (need standard mat)
    _scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const dl = new THREE.DirectionalLight(0x5eead4, 0.9);
    dl.position.set(4, 6, 5);
    _scene.add(dl);

    buildGlobal();
    buildAbout();
    buildSkills();
    buildProjects();
    buildContact();

    window.addEventListener('resize', onResize);

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      animate();
    }
  }

  return { init };
})();
