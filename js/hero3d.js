// Lente 3D del hero: se construye por código (sin modelos externos) y se desarma con el scroll.
import * as THREE from '../vendor/three.module.min.js';

const TAU = Math.PI * 2;
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };

/* Tubo torneado con bisel: ro radio exterior, ri interior, h alto. */
function tube(ro, ri, h, b = 0.018, seg = 96, phiStart = 0, phiLength = TAU) {
  const y = h / 2;
  const pts = [[ri, -y], [ro - b, -y], [ro, -y + b], [ro, y - b], [ro - b, y], [ri, y], [ri, -y]]
    .map(([x, yy]) => new THREE.Vector2(x, yy));
  return new THREE.LatheGeometry(pts, seg, phiStart, phiLength);
}

function ringTextTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 1024;
  const g = c.getContext('2d');
  g.fillStyle = '#0d0e0e';
  g.fillRect(0, 0, 1024, 1024);
  g.fillStyle = '#e9e9e6';
  g.font = '500 30px Switzer, Helvetica, Arial, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const text = 'ASISTEC EOS   ·   50 mm  1:1.4   ·   QUITO  ECUADOR   ·   Ø 58 mm   ·   ';
  const r = 478;
  const stepA = TAU / text.length;
  [...text].forEach((ch, i) => {
    const a = i * stepA - Math.PI / 2;
    g.save();
    g.translate(512 + Math.cos(a) * r, 512 + Math.sin(a) * r);
    g.rotate(a + Math.PI / 2);
    g.fillText(ch, 0, 0);
    g.restore();
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function scaleTexture() {
  const c = document.createElement('canvas');
  c.width = 2048; c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#111212';
  g.fillRect(0, 0, c.width, c.height);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const m = ['0.45', '0.6', '0.8', '1', '1.5', '3', '10', '∞'];
  const ft = ['1.5', '2', '2.5', '3', '5', '10', '30', '∞'];
  for (let rep = 0; rep < 2; rep++) {
    m.forEach((v, i) => {
      const x = rep * 1024 + 70 + i * 122;
      g.font = '500 34px Switzer, Helvetica, Arial, sans-serif';
      g.fillStyle = '#f5a623';
      g.fillText(ft[i], x, 40);
      g.fillStyle = '#e6e4dd';
      g.fillText(v, x, 92);
    });
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/* Entorno de estudio: cajas de luz que se reflejan en el metal y el vidrio. */
function studioEnv(renderer) {
  const s = new THREE.Scene();
  s.add(new THREE.Mesh(new THREE.BoxGeometry(40, 40, 40), new THREE.MeshBasicMaterial({ color: 0x030303, side: THREE.BackSide })));
  const panel = (w, h, pos, col, k) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k), side: THREE.DoubleSide }));
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    s.add(m);
  };
  panel(14, 8, [0, 12, 4], 0xffffff, 7);
  panel(3, 14, [-12, 2, 6], 0xdfeeff, 9);
  panel(3, 14, [12, 1, -4], 0xffffff, 10);
  panel(6, 4, [9, -6, 9], 0xf5a623, 5);
  panel(10, 3, [-4, -9, -10], 0xffffff, 4);
  panel(8, 8, [0, 2, 14], 0xffffff, 1.2);
  const pm = new THREE.PMREMGenerator(renderer);
  const tex = pm.fromScene(s, 0.03).texture;
  pm.dispose();
  return tex;
}

export function initLens(canvas, { getProgress, reduced, onReady }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.environment = studioEnv(renderer);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
  camera.position.set(0, 0, 10);
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(-4, 6, 8);
  scene.add(key);

  const M = {
    metal: new THREE.MeshStandardMaterial({ color: 0x1b1c1c, metalness: 0.9, roughness: 0.36 }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x0e0e0e, metalness: 0, roughness: 0.82 }),
    chrome: new THREE.MeshStandardMaterial({ color: 0xcdd0cf, metalness: 1, roughness: 0.2 }),
    accent: new THREE.MeshStandardMaterial({ color: 0xf5a623, metalness: 0.35, roughness: 0.4, emissive: 0xf5a623, emissiveIntensity: 0.22 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xd8b25a, metalness: 1, roughness: 0.3 }),
    blade: new THREE.MeshStandardMaterial({ color: 0x343636, metalness: 0.95, roughness: 0.42, side: THREE.DoubleSide }),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0x0a1613, metalness: 0, roughness: 0.03, clearcoat: 1, clearcoatRoughness: 0.02,
      iridescence: 1, iridescenceIOR: 1.6, iridescenceThicknessRange: [180, 520],
      transparent: true, opacity: 0.72, envMapIntensity: 1.9,
    }),
  };

  const rig = new THREE.Group();
  const lens = new THREE.Group();
  lens.rotation.x = Math.PI / 2; // eje óptico hacia la cámara
  rig.add(lens);
  scene.add(rig);

  const parts = [];
  const part = (y, spread) => {
    const g = new THREE.Group();
    lens.add(g);
    parts.push({ g, y, spread });
    return g;
  };
  const mesh = (geo, mat, y = 0) => { const m = new THREE.Mesh(geo, mat); m.position.y = y; return m; };
  const cap = (r, R) => {
    const th = Math.asin(r / R);
    const m = new THREE.Mesh(new THREE.SphereGeometry(R, 64, 24, 0, TAU, 0, th), M.glass);
    m.position.y = -R * Math.cos(th);
    return m;
  };

  // 1 · Aro frontal con el nombre
  const front = part(0.96, 3.0);
  front.add(mesh(tube(1.0, 0.93, 0.26), M.metal));
  front.add(mesh(tube(1.014, 0.985, 0.034, 0.006), M.accent, -0.15));
  const nameRing = new THREE.Mesh(new THREE.RingGeometry(0.8, 0.935, 128), new THREE.MeshStandardMaterial({ map: ringTextTexture(), metalness: 0.4, roughness: 0.55 }));
  nameRing.rotation.x = -Math.PI / 2;
  nameRing.position.y = 0.05;
  front.add(nameRing);

  // 2 · Elemento frontal
  const g1 = part(0.8, 2.05);
  g1.add(cap(0.8, 1.45));
  g1.add(mesh(tube(0.84, 0.79, 0.07, 0.01), M.metal, -0.02));

  // 3 · Anillo de enfoque
  const focus = part(0.48, 1.1);
  focus.add(mesh(tube(1.06, 0.9, 0.64), M.rubber));
  const ribs = new THREE.InstancedMesh(new THREE.BoxGeometry(0.036, 0.54, 0.034), M.rubber, 84);
  const d = new THREE.Object3D();
  for (let i = 0; i < 84; i++) {
    const a = (i / 84) * TAU;
    d.position.set(Math.cos(a) * 1.066, 0, Math.sin(a) * 1.066);
    d.rotation.y = -a + Math.PI / 2;
    d.updateMatrix();
    ribs.setMatrixAt(i, d.matrix);
  }
  focus.add(ribs);

  // 4 · Barril con la escala de distancias (pies en ámbar, metros en blanco)
  const scale = part(0.0, 0.2);
  scale.add(mesh(tube(1.0, 0.88, 0.32), M.metal));
  const band = new THREE.Mesh(new THREE.CylinderGeometry(1.003, 1.003, 0.26, 128, 1, true), new THREE.MeshStandardMaterial({ map: scaleTexture(), metalness: 0.5, roughness: 0.5 }));
  scale.add(band);

  // 5 · Diafragma
  const iris = part(-0.1, -0.8);
  iris.add(mesh(tube(0.87, 0.66, 0.05, 0.01), M.metal));
  const N = 8, K = 8, R = 0.7;
  const blades = [];
  for (let i = 0; i < N; i++) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array((K + 2) * 3), 3));
    const mid = ((i + 0.5) / N) * TAU;
    const n = new THREE.Vector3(0.16 * Math.cos(mid), 1, 0.16 * Math.sin(mid)).normalize();
    const normals = new Float32Array((K + 2) * 3);
    for (let k = 0; k < K + 2; k++) normals.set([n.x, n.y, n.z], k * 3);
    geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    const idx = [];
    for (let k = 1; k <= K; k++) idx.push(0, k, k + 1);
    geo.setIndex(idx);
    const m = new THREE.Mesh(geo, M.blade);
    m.position.y = (i - N / 2) * 0.003;
    iris.add(m);
    blades.push(geo);
  }
  function setAperture(a) {
    const twist = a * 1.6;
    blades.forEach((geo, i) => {
      const p = geo.attributes.position;
      const t0 = (i / N) * TAU + twist, t1 = ((i + 1) / N) * TAU + twist;
      p.setXYZ(0, Math.cos(t0) * a, 0, Math.sin(t0) * a);
      p.setXYZ(1, Math.cos(t1) * a, 0, Math.sin(t1) * a);
      for (let k = 0; k < K; k++) {
        const t = lerp(t1 + 0.55, t0 - 0.12, k / (K - 1));
        p.setXYZ(k + 2, Math.cos(t) * R, 0, Math.sin(t) * R);
      }
      p.needsUpdate = true;
    });
  }
  setAperture(0.34);

  // 6 · Barril trasero
  const rear = part(-0.47, -1.55);
  rear.add(mesh(tube(0.95, 0.72, 0.52), M.metal));
  rear.add(mesh(tube(0.962, 0.93, 0.05, 0.008), M.chrome, 0.12));

  // 7 · Grupo óptico trasero
  const g2 = part(-0.62, -2.3);
  g2.add(cap(0.56, 0.9));
  g2.add(mesh(tube(0.62, 0.55, 0.12, 0.01), M.metal, -0.05));

  // 8 · Montura de bayoneta con contactos
  const mount = part(-0.8, -3.0);
  mount.add(mesh(tube(0.82, 0.62, 0.12), M.chrome));
  for (let i = 0; i < 3; i++) mount.add(mesh(tube(0.9, 0.8, 0.045, 0.008, 20, (i / 3) * TAU, 0.72), M.chrome, -0.05));
  for (let i = 0; i < 8; i++) {
    const a = 0.3 + i * 0.11;
    const c = mesh(new THREE.BoxGeometry(0.05, 0.02, 0.07), M.gold, 0.066);
    c.position.x = Math.cos(a) * 0.69;
    c.position.z = Math.sin(a) * 0.69;
    c.rotation.y = -a;
    mount.add(c);
  }

  /* --- Encuadre según el formato de pantalla --- */
  let portrait = false;
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    portrait = w / h < 0.9;
    draw();
  }

  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  addEventListener('pointermove', (e) => {
    pointer.x = (e.clientX / innerWidth) * 2 - 1;
    pointer.y = (e.clientY / innerHeight) * 2 - 1;
  }, { passive: true });

  let p = getProgress();
  let t = 0;
  function draw() {
    const e = smooth(0.06, 0.5, p) * (1 - smooth(0.74, 0.97, p)); // se abre y vuelve a armarse
    const halfW = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z * camera.aspect;

    parts.forEach(({ g, y, spread }) => { g.position.y = y + spread * e; });
    lens.rotation.y = t * 0.12 + p * 2.2;

    if (portrait) {
      rig.rotation.set(lerp(0.2, -Math.PI / 2 + 0.42, e) + pointer.sy * 0.08, lerp(-0.5, -0.3, e) + pointer.sx * 0.12, 0);
      rig.scale.setScalar(lerp(0.74, 0.38, e));
      rig.position.set(lerp(0.15, 0, e), lerp(-1.25, -1.1, e), 0);
    } else {
      rig.rotation.set(lerp(0.16, 0.22, e) + pointer.sy * 0.08, lerp(-0.62, -Math.PI / 2 + 0.28, e) + pointer.sx * 0.14, 0);
      const fit = Math.min(0.95, (halfW * 2 * 0.64) / 7.9);
      rig.scale.setScalar(lerp(1.2, fit, e));
      rig.position.set(lerp(halfW * 0.38, halfW * 0.3, e), lerp(-0.75, -0.55, e), 0);
    }
    setAperture(reduced ? 0.34 : 0.3 + 0.16 * Math.sin(t * 0.7));
    renderer.render(scene, camera);
  }

  let visible = true;
  let raf = 0;
  let last = performance.now();
  function frame(now) {
    raf = 0;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    t += dt;
    p = lerp(p, getProgress(), 1 - Math.pow(0.001, dt));
    pointer.sx = lerp(pointer.sx, pointer.x, 0.06);
    pointer.sy = lerp(pointer.sy, pointer.y, 0.06);
    draw();
    if (visible && !document.hidden) raf = requestAnimationFrame(frame);
  }
  const wake = () => { if (!raf && visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } };

  if (reduced) {
    const still = () => { p = getProgress(); draw(); };
    addEventListener('scroll', still, { passive: true });
  } else {
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; wake(); }).observe(canvas);
    document.addEventListener('visibilitychange', wake);
  }
  addEventListener('resize', resize);
  resize();
  wake();
  onReady?.();
}
