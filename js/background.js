// ============================================================
// js/background.js
// Fixed full-page canvas behind all content.
// Each section gets its own 3D background element that fades
// in as you scroll into it and fades out as you leave.
//
//  about    → large wireframe icosahedron (right side)
//  skills   → 5 rotating tori rings (replaces skills-canvas)
//  projects → wireframe octahedron + floating tetrahedra (left)
//  contact  → slow-pulsing torus knot (center)
// ============================================================

const BackgroundScene = (() => {

  let _scene, _camera, _renderer, _canvas;
  let _mouseX = 0, _targetX = 0;
  const _clock = { start: Date.now(), elapsed: () => (Date.now() - _clock.start) / 1000 };

  // How much of a section is currently visible (0 → 1)
  function getProgress(id) {
    const el = document.getElementById(id);
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const vh   = window.innerHeight;
    if (rect.bottom < 0 || rect.top > vh) return 0;
    const visible = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
    return Math.min(1, visible / Math.min(rect.height, vh));
  }

  // ── Material helpers ──────────────────────────────────────
  function wireMat(color) {
    return new THREE.MeshStandardMaterial({
      color, wireframe: true, transparent: true, opacity: 0,
      roughness: 0.4, metalness: 0.2,
    });
  }
  function solidMat(color) {
    return new THREE.MeshStandardMaterial({
      color, wireframe: false, transparent: true, opacity: 0,
      roughness: 0.5, metalness: 0.3,
    });
  }

  // ── Section builders ──────────────────────────────────────

  // ABOUT — large icosahedron, right side, teal
  function buildAbout() {
    const mat  = wireMat(0x5eead4);
    const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(3.4, 1), mat);
    mesh.position.set(5.5, 0.5, -5);
    _scene.add(mesh);

    return (t, p) => {
      mesh.rotation.y = t * 0.10;
      mesh.rotation.x = t * 0.06;
      mat.opacity = p * 0.14;
    };
  }

  // SKILLS — 5 tori rings (replaces old skills-canvas)
  function buildSkills() {
    const RINGS = [
      { r: 3.2, t: .06, c: 0x5eead4, rx:  0.4, rz:  0.2,  vy:  .003,  vx:  .001  },
      { r: 4.8, t: .05, c: 0xf2a93b, rx:  1.1, rz: -0.5,  vy: -.002,  vx:  .0015 },
      { r: 2.4, t: .07, c: 0x5eead4, rx: -0.8, rz:  0.9,  vy:  .004,  vx: -.002  },
      { r: 6.0, t: .04, c: 0xe9ecf1, rx:  0.2, rz:  1.2,  vy:  .0015, vx:  .001  },
      { r: 1.6, t: .08, c: 0xf2a93b, rx:  1.5, rz: -1.0,  vy: -.005,  vx:  .003  },
    ];
    const meshes = RINGS.map(cfg => {
      const mat  = solidMat(cfg.c);
      const mesh = new THREE.Mesh(new THREE.TorusGeometry(cfg.r, cfg.t, 16, 120), mat);
      mesh.rotation.x = cfg.rx;
      mesh.rotation.z = cfg.rz;
      mesh.userData   = { vy: cfg.vy, vx: cfg.vx, mat };
      _scene.add(mesh);
      return mesh;
    });

    return (t, p) => {
      const boost = Math.abs(window.portfolioState?.scrollVelocity || 0) * 0.003;
      meshes.forEach(m => {
        const dir = m.userData.vy > 0 ? 1 : -1;
        m.rotation.y += m.userData.vy + dir * boost;
        m.rotation.x += m.userData.vx;
        m.userData.mat.opacity = p * 0.5;
      });
    };
  }

  // PROJECTS — octahedron left + scattered tetrahedra
  function buildProjects() {
    const matOct = wireMat(0xf2a93b);
    const oct    = new THREE.Mesh(new THREE.OctahedronGeometry(3.0, 0), matOct);
    oct.position.set(-5.5, 0.5, -5);
    _scene.add(oct);

    const tetraData = [
      { pos: [-2.2,  2.0, -2], rs: { x: .009, y: .012 } },
      { pos: [ 2.8, -1.8, -3], rs: { x: .007, y: .010 } },
      { pos: [-0.8, -2.5, -2], rs: { x: .011, y: .008 } },
    ];
    const tetras = tetraData.map(d => {
      const mat  = wireMat(0x5eead4);
      const mesh = new THREE.Mesh(new THREE.TetrahedronGeometry(0.65, 0), mat);
      mesh.position.set(...d.pos);
      mesh.userData = { rs: d.rs, mat };
      _scene.add(mesh);
      return mesh;
    });

    return (t, p) => {
      oct.rotation.y  = t * 0.09;
      oct.rotation.x  = t * 0.05;
      matOct.opacity  = p * 0.13;

      tetras.forEach(m => {
        m.rotation.x += m.userData.rs.x;
        m.rotation.y += m.userData.rs.y;
        m.userData.mat.opacity = p * 0.20;
      });
    };
  }

  // CONTACT — slow pulsing torus knot, centre
  function buildContact() {
    const mat  = wireMat(0x5eead4);
    const mesh = new THREE.Mesh(new THREE.TorusKnotGeometry(2.6, 0.42, 120, 20), mat);
    _scene.add(mesh);

    return (t, p) => {
      mesh.rotation.y = t * 0.07;
      mesh.rotation.x = t * 0.11;
      const pulse = 1 + Math.sin(t * 1.4) * 0.035;
      mesh.scale.setScalar(pulse);
      mat.opacity = p * 0.17;
    };
  }

  // ── Scene setup ───────────────────────────────────────────
  function buildScene() {
    _scene  = new THREE.Scene();
    _camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 100);
    _camera.position.z = 12;

    _renderer = new THREE.WebGLRenderer({ canvas: _canvas, alpha: true, antialias: true });
    _renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    _renderer.setSize(window.innerWidth, window.innerHeight);

    _scene.add(new THREE.AmbientLight(0xffffff, 0.45));
    const d1 = new THREE.DirectionalLight(0x5eead4, 1.0); d1.position.set(5, 5, 6);  _scene.add(d1);
    const d2 = new THREE.DirectionalLight(0xf2a93b, 0.6); d2.position.set(-5,-4, 4); _scene.add(d2);
  }

  // ── Animate ───────────────────────────────────────────────
  function init(canvasId = 'bg-canvas') {
    _canvas = document.getElementById(canvasId);
    if (!_canvas) return;
    if (!(_canvas.getContext('webgl') || _canvas.getContext('experimental-webgl'))) return;

    buildScene();

    // Build each section's background — returns a tick(t, progress) fn
    const ticks = {
      about:    buildAbout(),
      skills:   buildSkills(),
      projects: buildProjects(),
      contact:  buildContact(),
    };

    window.addEventListener('resize', () => {
      _camera.aspect = window.innerWidth / window.innerHeight;
      _camera.updateProjectionMatrix();
      _renderer.setSize(window.innerWidth, window.innerHeight);
    });

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.addEventListener('mousemove', (e) => {
        _mouseX = e.clientX / window.innerWidth - 0.5;
      });
    }

    (function loop() {
      requestAnimationFrame(loop);
      const t = _clock.elapsed();

      // Gentle camera drift with mouse
      _targetX += (_mouseX - _targetX) * 0.025;
      _camera.position.x = _targetX * 1.2;
      _camera.lookAt(_scene.position);

      // Tick each section background
      for (const [id, tick] of Object.entries(ticks)) {
        tick(t, getProgress(id));
      }

      _renderer.render(_scene, _camera);
    })();
  }

  return { init };
})();
