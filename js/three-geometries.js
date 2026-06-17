// Purposeful 3D Scene — Terminal infrastructure visualization
// Single scene only: topology graph + ambient starfield (no grid)

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// ─── Quality helper ────────────────────────────────────────────────────────
function getQuality(isMobile, gpuTier) {
  if (isMobile) return { simple: true, countScale: 0.5, merged: true };
  if (gpuTier >= 2) return { simple: false, countScale: 2.0, merged: false };
  if (gpuTier >= 1) return { simple: false, countScale: 1.5, merged: false };
  return { simple: true, countScale: 0.75, merged: true };
}

// ─── Shared shaders (minified) ─────────────────────────────────────────────
const GLOW_VERT = `varying vec3 vNormal;varying vec3 vViewPos;
void main(){vNormal=normalize(normalMatrix*normal);vViewPos=-(modelViewMatrix*vec4(position,1.0)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;

const GLOW_FRAG = `precision mediump float;uniform vec3 uColor;uniform float uTime;uniform float uPulse;
varying vec3 vNormal;varying vec3 vViewPos;
void main(){vec3 vd=normalize(vViewPos);float f=pow(1.0-abs(dot(vd,vNormal)),3.0);float p=0.7+0.3*sin(uTime*2.0+uPulse);
vec3 col=uColor*(0.3+0.7*f)*p;gl_FragColor=vec4(col,0.45+0.55*f);}`;

// ─── Particle texture ──────────────────────────────────────────────────────
function particleTex() {
  const c = document.createElement('canvas'); c.width = c.height = 32;
  const ctx = c.getContext('2d'); const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.3, 'rgba(255,255,255,0.8)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 32, 32);
  const t = new THREE.CanvasTexture(c); t.needsUpdate = true; return t;
}

// ─── Ambient Starfield ─────────────────────────────────────────────────────
function createStarfield(options = {}) {
  const { count = 350, spread = 20, isMobile = false, gpuTier = 1 } = options;
  const q = getQuality(isMobile, gpuTier);
  const n = Math.round(count * q.countScale);

  const pos = new Float32Array(n * 3);
  const colors = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = spread * (0.3 + 0.7 * Math.random());
    pos[i*3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i*3+1] = r * Math.cos(phi) * 0.6;
    pos[i*3+2] = r * Math.sin(phi) * Math.sin(theta);
    const mix = Math.random();
    colors[i*3] = mix * 1.0; colors[i*3+1] = (1 - mix) * 0.94; colors[i*3+2] = mix * 0.98;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const tex = particleTex();
  const mat = new THREE.PointsMaterial({
    size: q.simple ? 0.08 : 0.1, vertexColors: true, transparent: true, opacity: 0.55,
    blending: THREE.AdditiveBlending, depthWrite: false, map: tex, sizeAttenuation: true
  });
  const pts = new THREE.Points(geo, mat);
  return {
    name: 'starfield', object: pts, geo, mat, tex,
    frame(delta) { pts.rotation.y += delta * 0.015; pts.rotation.x += delta * 0.005; },
    animate() {},
    init(manager) { this.manager = manager; },
    dispose() { geo.dispose(); mat.dispose(); tex.dispose(); }
  };
}

// ─── Infrastructure Topology Graph ─────────────────────────────────────────
const TOPO = {
  nodes: [
    { id: 'k3s', label: 'K3s Cluster', pos: [0, 2.5, 0], color: [1.0, 0.0, 0.98] },
    { id: 'istio', label: 'Istio Mesh', pos: [0, 1, 2], color: [0.73, 0.07, 1.0] },
    { id: 'meshwatch', label: 'MeshWatch', pos: [3, -0.5, 1], color: [0.0, 0.94, 0.98] },
    { id: 'prometheus', label: 'Prometheus', pos: [4, -2, 0], color: [1.0, 0.5, 0.0] },
    { id: 'grafana', label: 'Grafana', pos: [-3.5, -1, 0.5], color: [0.0, 0.8, 0.6] },
    { id: 'minecraft', label: 'Minecraft', pos: [0, -3.5, 3], color: [0.0, 0.94, 0.3] },
    { id: 'ollama', label: 'Ollama AI', pos: [-2, -3, 2.5], color: [1.0, 0.8, 0.0] }
  ],
  edges: [
    ['k3s', 'istio'], ['istio', 'meshwatch'], ['istio', 'prometheus'],
    ['meshwatch', 'prometheus'], ['meshwatch', 'grafana'], ['meshwatch', 'minecraft'],
    ['prometheus', 'grafana'], ['k3s', 'minecraft'], ['k3s', 'ollama'], ['minecraft', 'ollama']
  ]
};

function createTopologyGraph(options = {}) {
  const { isMobile = false, gpuTier = 1 } = options;
  const q = getQuality(isMobile, gpuTier);
  const group = new THREE.Group();
  const geos = [], mats = [], nodes = [];
  const s = isMobile ? 0.6 : 1.0;
  const nr = q.simple ? 0.25 : 0.3;

  for (const n of TOPO.nodes) {
    const [x, y, z] = n.pos.map(v => v * s);
    const geo = new THREE.IcosahedronGeometry(nr, q.simple ? 0 : 1);
    geos.push(geo);
    const unis = { uColor: { value: new THREE.Vector3(...n.color) }, uTime: { value: 0 }, uPulse: { value: Math.random() * Math.PI * 2 } };
    const mat = q.simple
      ? new THREE.MeshBasicMaterial({ color: new THREE.Color(n.color[0], n.color[1], n.color[2]), transparent: true, opacity: 0.7 })
      : new THREE.ShaderMaterial({ vertexShader: GLOW_VERT, fragmentShader: GLOW_FRAG, uniforms: unis, transparent: true, blending: THREE.AdditiveBlending });
    mats.push(mat);
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); group.add(m);
    nodes.push({ mesh: m, unis, basePos: [x, y, z], ...n });
  }

  const eps = []; const allPos = [];
  const ppe = q.simple ? 8 : 16;
  for (const [a, b] of TOPO.edges) {
    const A = TOPO.nodes.find(n => n.id === a), B = TOPO.nodes.find(n => n.id === b);
    if (!A || !B) continue;
    const ax = A.pos[0] * s, ay = A.pos[1] * s, az = A.pos[2] * s;
    const bx = B.pos[0] * s, by = B.pos[1] * s, bz = B.pos[2] * s;
    for (let p = 0; p < ppe; p++) { allPos.push(ax, ay, az); eps.push({ from: [ax, ay, az], to: [bx, by, bz], progress: p / ppe, speed: 0.2 + Math.random() * 0.4 }); }
  }
  const eGeo = new THREE.BufferGeometry();
  eGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(allPos), 3));
  geos.push(eGeo);
  const tex = particleTex();
  const eMat = new THREE.PointsMaterial({
    size: q.simple ? 0.06 : 0.08, transparent: true, opacity: 0.6,
    blending: THREE.AdditiveBlending, depthWrite: false, map: tex, sizeAttenuation: true, color: new THREE.Color(0.0, 0.94, 0.98)
  });
  mats.push(eMat);
  group.add(new THREE.Points(eGeo, eMat));

  return {
    name: 'topology', object: group, nodes, eps, eGeo, eMat, tex, geos, mats,
    frame(delta) {
      for (const n of nodes) { if (n.unis) n.unis.uTime.value += delta; }
      const pos = eGeo.attributes.position.array;
      for (let i = 0; i < eps.length; i++) {
        const e = eps[i]; e.progress += e.speed * delta; if (e.progress > 1) e.progress -= 1;
        const i3 = i * 3;
        pos[i3] = e.from[0] + (e.to[0] - e.from[0]) * e.progress;
        pos[i3 + 1] = e.from[1] + (e.to[1] - e.from[1]) * e.progress;
        pos[i3 + 2] = e.from[2] + (e.to[2] - e.from[2]) * e.progress;
      }
      eGeo.attributes.position.needsUpdate = true;
    },
    animate() {},
    init(manager) { this.manager = manager; },
    dispose() { for (const g of geos) g.dispose(); for (const m of mats) m.dispose(); if (tex) tex.dispose(); }
  };
}

// ─── Page-specific scene builder (terminal only) ───────────────────────────

function buildTerminalScene(manager) {
  const { gpuTier = 1, isMobile } = manager;
  const comps = [];

  const stars = createStarfield({ count: 350, spread: 20, gpuTier, isMobile });
  stars.object.position.set(0, 0, -18);
  manager.scene.add(stars.object);
  comps.push(stars);

  const topo = createTopologyGraph({ gpuTier, isMobile });
  topo.object.position.set(0, -1.5, -12);
  manager.scene.add(topo.object);
  comps.push(topo);

  return { name: 'terminal', components: comps };
}

export { buildTerminalScene };
