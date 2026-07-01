// ============================================================
// js/scene.js
// Three.js hero background — floating 3-D geometric shapes.
// Depends on: three.js (loaded before this script)
// ============================================================

const Scene = (() => {

  // --- Config -----------------------------------------------
  const SHAPES_CONFIG = [
    { geo: () => new THREE.IcosahedronGeometry(1.3, 0), color: 0x5eead4, wireframe: true,  opacity: 0.85, pos: [-4.2,  1.6, -2  ] },
    { geo: () => new THREE.OctahedronGeometry(1.1, 0),  color: 0xf2a93b, wireframe: false, opacity: 0.50, pos: [ 4.0,  2.2, -3  ] },
    { geo: () => new THREE.TorusKnotGeometry(0.8, 0.24, 100, 16), color: 0x5eead4, wireframe: true, opacity: 0.85, pos: [ 3.2, -2.0, -1  ] },
    { geo: () => new THREE.TetrahedronGeometry(1.2, 0), color: 0xe9ecf1, wireframe: false, opacity: 0.50, pos: [-3.6, -2.4, -2.5] },
    { geo: () => new THREE.DodecahedronGeometry(0.95, 0),color: 0xf2a93b, wireframe: true, opacity: 0.85, pos: [ 0.2,  0.4, -5  ] },
  ];

  const FLOAT_AMPLITUDE = 0.3;
  const MOUSE_INFLUENCE = { x: 1.6, y: 1.2 };
  const LERP_SPEED      = 0.04;
  const CAM_Z           = 13;

  // --- State ------------------------------------------------
  let _scene, _camera, _renderer;
  let _shapes   = [];
  let _mouseX   = 0, _mouseY   = 0;
  let _targetX  = 0, _targetY  = 0;
  let _canvas;
  const _clock  = { start: Date.now(), elapsed: () => (Date.now() - _clock.start) / 1000 };

  // --- Setup ------------------------------------------------
  function buildScene() {
    _scene  = new THREE.Scene();
    _camera = new THREE.PerspectiveCamera(50, _canvas.clientWidth / _canvas.clientHeight, 0.1, 100);
    _camera.position.z = CAM_Z;

    _renderer = new THREE.WebGLRenderer({ canvas: _canvas, alpha: true, antialias: true });
    _renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    _renderer.setSize(_canvas.clientWidth, _canvas.clientHeight);

    // Lighting
    _scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const d1 = new THREE.DirectionalLight(0x5eead4, 1.1);
    d1.position.set(5, 5, 6);
    _scene.add(d1);
    const d2 = new THREE.DirectionalLight(0xf2a93b, 0.7);
    d2.position.set(-6, -3, 4);
    _scene.add(d2);

    // Shapes
    SHAPES_CONFIG.forEach((cfg) => {
      const mat = new THREE.MeshStandardMaterial({
        color:       cfg.color,
        wireframe:   cfg.wireframe,
        flatShading: true,
        roughness:   0.4,
        metalness:   0.2,
        transparent: true,
        opacity:     cfg.opacity,
      });
      const mesh = new THREE.Mesh(cfg.geo(), mat);
      mesh.position.set(...cfg.pos);
      mesh.userData = {
        rotSpeed:    { x: (Math.random() - 0.5) * 0.006, y: (Math.random() - 0.5) * 0.008, z: (Math.random() - 0.5) * 0.004 },
        floatOffset: Math.random() * Math.PI * 2,
        floatSpeed:  0.4 + Math.random() * 0.4,
        baseY:       cfg.pos[1],
      };
      _scene.add(mesh);
      _shapes.push(mesh);
    });
  }

  // --- Loop -------------------------------------------------
  function animate() {
    requestAnimationFrame(animate);
    const t = _clock.elapsed();

    // Smooth mouse follow
    _targetX += (_mouseX - _targetX) * LERP_SPEED;
    _targetY += (_mouseY - _targetY) * LERP_SPEED;

    // Float + rotate each shape
    _shapes.forEach((mesh) => {
      const ud = mesh.userData;
      mesh.rotation.x += ud.rotSpeed.x;
      mesh.rotation.y += ud.rotSpeed.y;
      mesh.rotation.z += ud.rotSpeed.z;
      mesh.position.y = ud.baseY + Math.sin(t * ud.floatSpeed + ud.floatOffset) * FLOAT_AMPLITUDE;
    });

    _camera.position.x  =  _targetX * MOUSE_INFLUENCE.x;
    _camera.position.y  = -_targetY * MOUSE_INFLUENCE.y;
    _camera.lookAt(_scene.position);

    _renderer.render(_scene, _camera);
  }

  // --- Events -----------------------------------------------
  function onResize() {
    const w = _canvas.clientWidth, h = _canvas.clientHeight;
    _camera.aspect = w / h;
    _camera.updateProjectionMatrix();
    _renderer.setSize(w, h);
  }

  function onMouseMove(e) {
    _mouseX = e.clientX / window.innerWidth  - 0.5;
    _mouseY = e.clientY / window.innerHeight - 0.5;
  }

  // --- Public API -------------------------------------------
  function init(canvasId = "hero-canvas") {
    _canvas = document.getElementById(canvasId);
    if (!_canvas) return;

    const hasWebGL =
      _canvas.getContext("webgl") || _canvas.getContext("experimental-webgl");
    if (!hasWebGL) return;

    buildScene();
    window.addEventListener("resize", onResize);

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.addEventListener("mousemove", onMouseMove);
    }

    animate();
  }

  return { init };
})();
