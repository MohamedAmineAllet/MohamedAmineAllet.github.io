// ============================================================
// js/scene.js
// Two Three.js scenes:
//   Scene       → hero (floating shapes + scroll parallax)
//   SkillsScene → skills section (rotating tori + scroll boost)
// Both read from window.portfolioState set by scroll-fx.js.
// ============================================================


// ── HERO SCENE ───────────────────────────────────────────────

const Scene = (() => {

  const SHAPES_CONFIG = [
    { geo: () => new THREE.IcosahedronGeometry(1.3, 0), color: 0x5eead4, wireframe: true,  opacity: 0.85, pos: [-4.2,  1.6, -2  ] },
    { geo: () => new THREE.OctahedronGeometry(1.1, 0),  color: 0xf2a93b, wireframe: false, opacity: 0.50, pos: [ 4.0,  2.2, -3  ] },
    { geo: () => new THREE.TorusKnotGeometry(0.8, 0.24, 100, 16), color: 0x5eead4, wireframe: true,  opacity: 0.85, pos: [ 3.2, -2.0, -1  ] },
    { geo: () => new THREE.TetrahedronGeometry(1.2, 0), color: 0xe9ecf1, wireframe: false, opacity: 0.50, pos: [-3.6, -2.4, -2.5] },
    { geo: () => new THREE.DodecahedronGeometry(0.95, 0),color: 0xf2a93b, wireframe: true,  opacity: 0.85, pos: [ 0.2,  0.4, -5  ] },
  ];

  const FLOAT_AMP      = 0.3;
  const MOUSE_INFL     = { x: 1.6, y: 1.2 };
  const LERP_SPEED     = 0.04;
  const BASE_CAM_Z     = 13;
  const SCROLL_PARALLAX = 0.0018; // how much shapes drift up per scrolled px
  const SCROLL_ZOOM     = 0.003;  // camera pulls back per scrolled px

  let _scene, _camera, _renderer, _shapes = [];
  let _mouseX = 0, _mouseY = 0, _targetX = 0, _targetY = 0, _canvas;
  const _clock = { start: Date.now(), elapsed: () => (Date.now() - _clock.start) / 1000 };

  function buildScene() {
    _scene  = new THREE.Scene();
    _camera = new THREE.PerspectiveCamera(50, _canvas.clientWidth / _canvas.clientHeight, 0.1, 100);
    _camera.position.z = BASE_CAM_Z;

    _renderer = new THREE.WebGLRenderer({ canvas: _canvas, alpha: true, antialias: true });
    _renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    _renderer.setSize(_canvas.clientWidth, _canvas.clientHeight);

    _scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const d1 = new THREE.DirectionalLight(0x5eead4, 1.1); d1.position.set(5, 5, 6);   _scene.add(d1);
    const d2 = new THREE.DirectionalLight(0xf2a93b, 0.7); d2.position.set(-6, -3, 4); _scene.add(d2);

    SHAPES_CONFIG.forEach((cfg) => {
      const mat = new THREE.MeshStandardMaterial({
        color: cfg.color, wireframe: cfg.wireframe, flatShading: true,
        roughness: 0.4, metalness: 0.2, transparent: true, opacity: cfg.opacity,
      });
      const mesh = new THREE.Mesh(cfg.geo(), mat);
      mesh.position.set(...cfg.pos);
      mesh.userData = {
        rotSpeed:    { x: (Math.random() - 0.5) * 0.006, y: (Math.random() - 0.5) * 0.008, z: (Math.random() - 0.5) * 0.004 },
        floatOffset: Math.random() * Math.PI * 2,
        floatSpeed:  0.4 + Math.random() * 0.4,
        baseY:       cfg.pos[1],
        parallaxFactor: 0.5 + Math.random() * 0.8, // each shape has unique parallax depth
      };
      _scene.add(mesh);
      _shapes.push(mesh);
    });
  }

  function animate() {
    requestAnimationFrame(animate);
    const t       = _clock.elapsed();
    const scrollY = window.portfolioState?.scrollY || 0;

    // Smooth mouse follow
    _targetX += (_mouseX - _targetX) * LERP_SPEED;
    _targetY += (_mouseY - _targetY) * LERP_SPEED;

    _shapes.forEach((mesh) => {
      const ud = mesh.userData;
      // Rotation
      mesh.rotation.x += ud.rotSpeed.x;
      mesh.rotation.y += ud.rotSpeed.y;
      mesh.rotation.z += ud.rotSpeed.z;
      // Float + scroll parallax (shapes rise up as user scrolls)
      const floatY    = Math.sin(t * ud.floatSpeed + ud.floatOffset) * FLOAT_AMP;
      const parallaxY = scrollY * SCROLL_PARALLAX * ud.parallaxFactor;
      mesh.position.y = ud.baseY + floatY + parallaxY;
      // Fade shapes as they leave viewport on scroll
      mesh.material.opacity = Math.max(0, ud.opacity - scrollY * 0.0008) * (ud.wireframe ? 1 : 0.6);
    });

    // Camera: mouse parallax + scroll zoom-out
    _camera.position.x =  _targetX * MOUSE_INFL.x;
    _camera.position.y = -_targetY * MOUSE_INFL.y;
    _camera.position.z =  BASE_CAM_Z + scrollY * SCROLL_ZOOM;
    _camera.lookAt(_scene.position);

    _renderer.render(_scene, _camera);
  }

  function onResize() {
    const w = _canvas.clientWidth, h = _canvas.clientHeight;
    _camera.aspect = w / h;
    _camera.updateProjectionMatrix();
    _renderer.setSize(w, h);
  }

  function init(canvasId = 'hero-canvas') {
    _canvas = document.getElementById(canvasId);
    if (!_canvas) return;
    if (!(_canvas.getContext('webgl') || _canvas.getContext('experimental-webgl'))) return;

    buildScene();
    window.addEventListener('resize', onResize);

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.addEventListener('mousemove', (e) => {
        _mouseX = e.clientX / window.innerWidth  - 0.5;
        _mouseY = e.clientY / window.innerHeight - 0.5;
      });
    }
    animate();
  }

  return { init };
})();


// ── SKILLS BACKGROUND SCENE ───────────────────────────────────

const SkillsScene = (() => {

  const RINGS = [
    { r: 3.2, t: 0.06, color: 0x5eead4, rx:  0.4, rz:  0.2,  vy:  0.003,  vx:  0.001  },
    { r: 4.8, t: 0.05, color: 0xf2a93b, rx:  1.1, rz: -0.5,  vy: -0.002,  vx:  0.0015 },
    { r: 2.4, t: 0.07, color: 0x5eead4, rx: -0.8, rz:  0.9,  vy:  0.004,  vx: -0.002  },
    { r: 6.0, t: 0.04, color: 0xe9ecf1, rx:  0.2, rz:  1.2,  vy:  0.0015, vx:  0.001  },
    { r: 1.6, t: 0.08, color: 0xf2a93b, rx:  1.5, rz: -1.0,  vy: -0.005,  vx:  0.003  },
  ];

  let _scene, _camera, _renderer, _rings = [], _canvas;
  let _mouseX = 0, _targetX = 0;

  function buildScene() {
    _scene  = new THREE.Scene();
    _camera = new THREE.PerspectiveCamera(55, _canvas.clientWidth / _canvas.clientHeight, 0.1, 100);
    _camera.position.z = 10;

    _renderer = new THREE.WebGLRenderer({ canvas: _canvas, alpha: true, antialias: true });
    _renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    _renderer.setSize(_canvas.clientWidth, _canvas.clientHeight);

    _scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const dl = new THREE.DirectionalLight(0x5eead4, 0.9); dl.position.set(4, 6, 5); _scene.add(dl);

    RINGS.forEach((cfg) => {
      const mat = new THREE.MeshStandardMaterial({
        color: cfg.color, roughness: 0.5, metalness: 0.3,
        transparent: true, opacity: 0.5,
      });
      const mesh = new THREE.Mesh(new THREE.TorusGeometry(cfg.r, cfg.t, 16, 120), mat);
      mesh.rotation.x = cfg.rx;
      mesh.rotation.z = cfg.rz;
      mesh.userData   = { vy: cfg.vy, vx: cfg.vx };
      _scene.add(mesh);
      _rings.push(mesh);
    });
  }

  function animate() {
    requestAnimationFrame(animate);
    _targetX += (_mouseX - _targetX) * 0.02;

    // Scroll velocity boosts ring speed
    const scrollVel = window.portfolioState?.scrollVelocity || 0;
    const boost     = Math.abs(scrollVel) * 0.25;

    _rings.forEach((ring) => {
      const dir = ring.userData.vy > 0 ? 1 : -1;
      ring.rotation.y += ring.userData.vy + dir * boost * 0.003;
      ring.rotation.x += ring.userData.vx;
    });

    _camera.position.x = _targetX * 0.8;
    _camera.lookAt(_scene.position);
    _renderer.render(_scene, _camera);
  }

  function onResize() {
    const w = _canvas.clientWidth, h = _canvas.clientHeight;
    _camera.aspect = w / h;
    _camera.updateProjectionMatrix();
    _renderer.setSize(w, h);
  }

  function init(canvasId = 'skills-canvas') {
    _canvas = document.getElementById(canvasId);
    if (!_canvas) return;
    if (!(_canvas.getContext('webgl') || _canvas.getContext('experimental-webgl'))) return;

    buildScene();
    window.addEventListener('resize', onResize);

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.addEventListener('mousemove', (e) => {
        _mouseX = e.clientX / window.innerWidth - 0.5;
      });
    }
    animate();
  }

  return { init };
})();
