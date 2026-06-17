// Purposeful 3D Scenes — Infrastructure visualization, not decoration
// Each scene communicates actual DevOps/SRE competence
// Mobile-optimized: reduced complexity, merged geometries

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import createGrid from './three-grid.js';

// ─── Quality helper ────────────────────────────────────────────────────────
function getQuality(isMobile, gpuTier) {
  if (isMobile) return { simple: true, countScale: 0.5, merged: true };
  if (gpuTier >= 2) return { simple: false, countScale: 2.0, merged: false };
  if (gpuTier >= 1) return { simple: false, countScale: 1.5, merged: false };
  return { simple: true, countScale: 0.75, merged: true };
}

// ─── Shared shaders ────────────────────────────────────────────────────────
const GLOW_VERT = `
  varying vec3 vNormal;
  varying vec3 vViewPos;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vViewPos = -(modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const GLOW_FRAG = `
  precision mediump float;
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uPulse;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  void main() {
    vec3 viewDir = normalize(vViewPos);
    float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 3.0);
    float pulse = 0.7 + 0.3 * sin(uTime * 2.0 + uPulse);
    vec3 col = uColor * (0.3 + 0.7 * fresnel) * pulse;
    float alpha = 0.45 + 0.55 * fresnel;
    gl_FragColor = vec4(col, alpha);
  }
`;

// ─── Particle texture ──────────────────────────────────────────────────────
function createParticleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 32; canvas.height = 32;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.3, 'rgba(255,255,255,0.8)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// ─── Infrastructure Topology Graph — Service mesh visualization ────────────

// Static topology: Eugene's actual k3s cluster services
const INFRA_TOPOLOGY = {
  nodes: [
    { id: 'k3s-master', label: 'K3s Master', type: 'control', pos: [0, 3, 0], color: [1.0, 0.0, 0.98] },
    { id: 'k3s-node1', label: 'K3s Node 1', type: 'worker', pos: [5, 0, -2], color: [0.73, 0.07, 1.0] },
    { id: 'k3s-node2', label: 'K3s Node 2', type: 'worker', pos: [-4, -1, -3], color: [0.73, 0.07, 1.0] },
    { id: 'meshwatch', label: 'MeshWatch', type: 'service', pos: [0, 1.5, 4], color: [0.0, 0.94, 0.98] },
    { id: 'prometheus', label: 'Prometheus', type: 'service', pos: [3, 0, 2], color: [1.0, 0.5, 0.0] },
    { id: 'grafana', label: 'Grafana', type: 'service', pos: [-3, 0.5, 3], color: [0.0, 0.8, 0.6] },
    { id: 'loki', label: 'Loki', type: 'service', pos: [4, -2, 1], color: [0.2, 0.9, 0.3] },
    { id: 'tempo', label: 'Tempo', type: 'service', pos: [-5, -1, 1.5], color: [0.8, 0.2, 0.8] },
    { id: 'istio', label: 'Istio Mesh', type: 'infra', pos: [0, 2, 0], color: [0.73, 0.07, 1.0] },
    { id: 'minecraft', label: 'Minecraft', type: 'service', pos: [0, -3, 5], color: [0.0, 0.94, 0.3] },
    { id: 'ollama', label: 'Ollama AI', type: 'service', pos: [-2, -3, 3], color: [1.0, 0.8, 0.0] }
  ],
  edges: [
    ['k3s-master', 'k3s-node1'], ['k3s-master', 'k3s-node2'],
    ['k3s-node1', 'meshwatch'], ['k3s-node2', 'meshwatch'],
    ['istio', 'k3s-master'], ['istio', 'k3s-node1'], ['istio', 'k3s-node2'],
    ['meshwatch', 'prometheus'], ['meshwatch', 'grafana'], ['meshwatch', 'istio'],
    ['prometheus', 'grafana'], ['prometheus', 'loki'], ['prometheus', 'tempo'],
    ['k3s-node1', 'minecraft'], ['k3s-node2', 'ollama'],
    ['minecraft', 'meshwatch'], ['ollama', 'meshwatch']
  ]
};

function createTopologyGraph(options = {}) {
  const { isMobile = false, gpuTier = 1 } = options;
  const q = getQuality(isMobile, gpuTier);

  const group = new THREE.Group();
  const subGeometries = [];
  const subMaterials = [];
  const nodeObjects = [];

  // Scale the topology down on mobile
  const scale = isMobile ? 0.6 : 1.0;
  const nodeRadius = q.simple ? 0.25 : 0.35;

  // Create nodes
  for (const node of INFRA_TOPOLOGY.nodes) {
    const [x, y, z] = node.pos.map(v => v * scale);
    const geo = new THREE.IcosahedronGeometry(nodeRadius, q.simple ? 0 : 1);
    subGeometries.push(geo);

    const uniforms = {
      uColor: { value: new THREE.Vector3(...node.color) },
      uTime: { value: 0 },
      uPulse: { value: Math.random() * Math.PI * 2 }
    };
    const mat = q.simple
      ? new THREE.MeshBasicMaterial({
        color: new THREE.Color(node.color[0], node.color[1], node.color[2]),
        transparent: true, opacity: 0.7
      })
      : new THREE.ShaderMaterial({
        vertexShader: GLOW_VERT, fragmentShader: GLOW_FRAG,
        uniforms, transparent: true, blending: THREE.AdditiveBlending
      });
    subMaterials.push(mat);

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    group.add(mesh);
    nodeObjects.push({ mesh, uniforms, basePos: [x, y, z], ...node });
  }

  // Create edges as particle streams
  const edgeParticles = [];
  const allEdgePositions = [];
  const particlesPerEdge = q.simple ? 6 : 12;

  for (const [fromId, toId] of INFRA_TOPOLOGY.edges) {
    const from = INFRA_TOPOLOGY.nodes.find(n => n.id === fromId);
    const to = INFRA_TOPOLOGY.nodes.find(n => n.id === toId);
    if (!from || !to) continue;

    const fx = from.pos[0] * scale, fy = from.pos[1] * scale, fz = from.pos[2] * scale;
    const tx = to.pos[0] * scale, ty = to.pos[1] * scale, tz = to.pos[2] * scale;

    for (let p = 0; p < particlesPerEdge; p++) {
      allEdgePositions.push(fx, fy, fz);
      edgeParticles.push({
        from: [fx, fy, fz], to: [tx, ty, tz],
        progress: p / particlesPerEdge,
        speed: 0.3 + Math.random() * 0.5,
        color: from.color
      });
    }
  }

  const edgeGeo = new THREE.BufferGeometry();
  const edgePositionsArr = new Float32Array(allEdgePositions);
  edgeGeo.setAttribute('position', new THREE.BufferAttribute(edgePositionsArr, 3));
  subGeometries.push(edgeGeo);

  const tex = createParticleTexture();
  const edgeMat = new THREE.PointsMaterial({
    size: q.simple ? 0.08 : 0.1,
    transparent: true, opacity: 0.7,
    blending: THREE.AdditiveBlending, depthWrite: false,
    map: tex, sizeAttenuation: true, color: new THREE.Color(0.0, 0.94, 0.98)
  });
  subMaterials.push(edgeMat);

  const edgePoints = new THREE.Points(edgeGeo, edgeMat);
  group.add(edgePoints);

  return {
    name: 'topology', object: group, nodeObjects, edgeParticles, edgeGeo, edgeMat,
    frame(delta) {
      // Update node glow pulses
      for (const node of nodeObjects) {
        if (node.uniforms) node.uniforms.uTime.value += delta;
      }

      // Animate edge particles along their paths
      const pos = edgeGeo.attributes.position.array;
      for (let i = 0; i < edgeParticles.length; i++) {
        const ep = edgeParticles[i];
        ep.progress += ep.speed * delta;
        if (ep.progress > 1) ep.progress -= 1;
        const i3 = i * 3;
        pos[i3]     = ep.from[0] + (ep.to[0] - ep.from[0]) * ep.progress;
        pos[i3 + 1] = ep.from[1] + (ep.to[1] - ep.from[1]) * ep.progress;
        pos[i3 + 2] = ep.from[2] + (ep.to[2] - ep.from[2]) * ep.progress;
      }
      edgeGeo.attributes.position.needsUpdate = true;
    },
    animate() {},
    init(manager) {
      this.manager = manager;
    },
    dispose() {
      for (const g of subGeometries) g.dispose();
      for (const m of subMaterials) m.dispose();
      if (tex) tex.dispose();
    }
  };
}

// ─── 3D Metric Gauges — Dashboard data visualization ─────────────────────

function createMetricGauges(options = {}) {
  const { isMobile = false, gpuTier = 1 } = options;
  const q = getQuality(isMobile, gpuTier);

  const group = new THREE.Group();
  const subGeometries = [];
  const subMaterials = [];
  const gaugeData = []; // { mesh, targetValue, currentValue, ... }

  const gaugeRadius = 2.0;
  const gaugeThickness = 0.3;
  const gaugeCount = 4;
  const spacing = 3.5;

  const gaugeColors = [
    [0.0, 0.94, 0.98],  // TPS: cyan
    [0.0, 0.94, 0.3],   // Players: green
    [1.0, 0.5, 0.0],    // Heap: orange
    [0.73, 0.07, 1.0]   // Uptime: purple
  ];

  const gaugeLabels = ['TPS', 'Players', 'Heap %', 'Uptime'];

  for (let g = 0; g < gaugeCount; g++) {
    const x = (g - (gaugeCount - 1) / 2) * spacing;

    // Track ring (background)
    const trackGeo = new THREE.TorusGeometry(gaugeRadius, gaugeThickness * 0.3, 8, 64, Math.PI * 1.5);
    subGeometries.push(trackGeo);
    const trackMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(1, 1, 1), transparent: true, opacity: 0.1
    });
    subMaterials.push(trackMat);
    const track = new THREE.Mesh(trackGeo, trackMat);
    track.position.set(x, 0, 0);
    group.add(track);

    // Fill arc — starts empty, grows with data
    const fillGeo = new THREE.TorusGeometry(gaugeRadius, gaugeThickness, 8, 64, Math.PI * 0.01);
    subGeometries.push(fillGeo);
    const uniforms = {
      uColor: { value: new THREE.Vector3(...gaugeColors[g]) },
      uTime: { value: 0 },
      uPulse: { value: g * 0.5 }
    };
    const fillMat = q.simple
      ? new THREE.MeshBasicMaterial({
        color: new THREE.Color(gaugeColors[g][0], gaugeColors[g][1], gaugeColors[g][2]),
        transparent: true, opacity: 0.8
      })
      : new THREE.ShaderMaterial({
        vertexShader: GLOW_VERT, fragmentShader: GLOW_FRAG, uniforms,
        transparent: true, blending: THREE.AdditiveBlending
      });
    subMaterials.push(fillMat);
    const fill = new THREE.Mesh(fillGeo, fillMat);
    fill.position.set(x, 0, 0);
    group.add(fill);

    gaugeData.push({
      label: gaugeLabels[g],
      track, fill, fillGeo, uniforms,
      targetValue: 0, currentValue: 0, maxValue: 100,
      position: [x, 0, 0]
    });
  }

  return {
    name: 'gauges', object: group, gaugeData, subGeometries, subMaterials,
    frame(delta) {
      for (const gauge of this.gaugeData) {
        // Smoothly animate fill toward target
        gauge.currentValue += (gauge.targetValue - gauge.currentValue) * delta * 2;
        const ratio = Math.min(gauge.currentValue / gauge.maxValue, 1);

        // Rebuild the torus geometry to reflect the fill ratio
        gauge.fillGeo.dispose();
        const arc = Math.PI * 1.5 * ratio;
        const newGeo = new THREE.TorusGeometry(gaugeRadius, gaugeThickness, 8, 64, Math.max(arc, 0.01));
        gauge.fill.geometry = newGeo;
        gauge.fillGeo = newGeo;

        if (gauge.uniforms) gauge.uniforms.uTime.value += delta;
      }
    },
    animate() {},
    /**
     * Update gauge targets from live data.
     * @param {{ tps: number, players: number, heapPercent: number, uptimeHours: number }} data
     */
    setData(data) {
      if (!data) return;
      const g = this.gaugeData;
      if (g[0]) g[0].targetValue = Math.min((data.tps || 0) / 20 * 100, 100);
      if (g[1]) g[1].targetValue = Math.min((data.players || 0) / 20 * 100, 100);
      if (g[2]) g[2].targetValue = Math.min(data.heapPercent || 0, 100);
      if (g[3]) g[3].targetValue = Math.min((data.uptimeHours || 0) / 720 * 100, 100);
    },
    init(manager) { this.manager = manager; },
    dispose() {
      for (const g of this.subGeometries) g.dispose();
      for (const m of this.subMaterials) m.dispose();
    }
  };
}

// ─── Page-specific scene builders ──────────────────────────────────────────

function buildTerminalScene(manager) {
  const components = [];
  const { gpuTier = 1, isMobile } = manager;

  // Synthwave grid floor — signature element, keeps the synthwave identity
  const grid = createGrid({ opacity: 0.25, time: 0, isMobile });
  manager.scene.add(grid.object);
  components.push(grid);

  // Infrastructure topology graph — the "wow" element
  const topology = createTopologyGraph({ gpuTier, isMobile });
  topology.object.position.set(0, -3, -14);
  manager.scene.add(topology.object);
  components.push(topology);

  return { name: 'terminal', components, objects: [grid.object, topology.object] };
}

function buildDashboardScene(manager) {
  const components = [];
  const { gpuTier = 1, isMobile } = manager;

  // 3D metric gauges
  const gauges = createMetricGauges({ gpuTier, isMobile });
  gauges.object.position.set(0, 1, -10);
  manager.scene.add(gauges.object);
  components.push(gauges);

  return { name: 'dashboard', components, objects: [gauges.object], gauges };
}

export {
  createTopologyGraph, createMetricGauges,
  buildTerminalScene, buildDashboardScene
};
