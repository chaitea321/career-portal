// Floating Wireframe Shapes — Low-poly geometries with custom Fresnel neon glow
// Each shape has independent rotation + floating animation with phase offset
// Mobile-optimized: simpler geometry and materials on low-end devices

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const SHAPE_VERT = `
  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying vec3 vWorldPos;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 viewP = viewMatrix * modelMatrix * vec4(position, 1.0);
    vViewPos = -viewP.xyz;
    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * viewP;
  }
`;

const SHAPE_FRAG = `
  precision mediump float;

  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uHover;
  uniform float uTime;

  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying vec3 vWorldPos;

  void main() {
    vec3 viewDir = normalize(vViewPos);
    float fresnel = 1.0 - abs(dot(viewDir, vNormal));
    fresnel = pow(fresnel, 2.0);

    vec3 baseColor = uColor * (0.3 + 0.7 * fresnel);
    baseColor += uColor * uHover * 0.5;
    float pulse = 1.0 + sin(uTime * 2.0) * 0.05;
    baseColor *= pulse;

    float alpha = (0.4 + 0.6 * fresnel) * uOpacity;
    alpha += uHover * 0.2;

    gl_FragColor = vec4(baseColor, alpha);
  }
`;

const WIREFRAME_FRAG = `
  precision mediump float;

  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uHover;
  uniform float uTime;
  uniform float uWireframeAlpha;

  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying vec3 vWorldPos;

  void main() {
    vec3 viewDir = normalize(vViewPos);
    float fresnel = 1.0 - abs(dot(viewDir, vNormal));
    fresnel = pow(fresnel, 2.0);

    vec3 baseColor = uColor * (uWireframeAlpha * 0.5 + 0.5 * fresnel);
    baseColor += uColor * uHover * 0.6;
    float pulse = 1.0 + sin(uTime * 2.0) * 0.05;
    baseColor *= pulse;

    float alpha = (uWireframeAlpha * 0.3 + 0.7 * fresnel) * uOpacity;
    alpha += uHover * 0.25;

    gl_FragColor = vec4(baseColor, alpha);
  }
`;

// Simpler fragment shader for mobile — no Fresnel, just color + pulse
const MOBILE_FRAG = `
  precision mediump float;

  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uTime;

  void main() {
    float pulse = 1.0 + sin(uTime * 2.0) * 0.05;
    vec3 color = uColor * pulse;
    gl_FragColor = vec4(color, 0.6 * uOpacity);
  }
`;

function createShape(geomType, options = {}) {
  const {
    size = 1,
    color = [0.0, 0.94, 0.98],
    wireframe = true,
    position = [0, 0, 0],
    rotationSpeed = [0.2, 0.3, 0.1],
    floatAmplitude = 0.5,
    phase = 0,
    interactive = false,
    time = 0,
    simple = false // Mobile simplification flag
  } = options;

  let geometry;
  switch (geomType) {
    case 'icosahedron':
      geometry = new THREE.IcosahedronGeometry(size, simple ? 0 : 1);
      break;
    case 'octahedron':
      geometry = new THREE.OctahedronGeometry(size, 0);
      break;
    case 'torusKnot':
      // On mobile, use fewer segments
      geometry = new THREE.TorusKnotGeometry(size * 0.8, size * 0.25, simple ? 24 : 48, simple ? 4 : 8, 2, 3);
      break;
    default:
      geometry = new THREE.IcosahedronGeometry(size, simple ? 0 : 1);
  }

  const uniforms = {
    uColor: { value: new THREE.Vector3(...color) },
    uOpacity: { value: simple ? 0.5 : 0.6 },
    uHover: { value: 0 },
    uTime: { value: time },
    uWireframeAlpha: { value: wireframe ? 0.5 : 1.0 }
  };

  let material;
  if (simple) {
    // Mobile: use basic material without expensive Fresnel shader
    material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(...color),
      transparent: true,
      opacity: 0.5,
      wireframe: wireframe,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
  } else {
    // Desktop: full custom shader with Fresnel glow
    material = new THREE.ShaderMaterial({
      vertexShader: SHAPE_VERT,
      fragmentShader: wireframe ? WIREFRAME_FRAG : SHAPE_FRAG,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      wireframe: wireframe
    });
  }

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.userData.interactive = interactive;
  mesh.userData.baseScale = size;
  mesh.userData.phase = phase;
  mesh.userData.rotationSpeed = rotationSpeed;
  mesh.userData.floatAmplitude = simple ? floatAmplitude * 0.6 : floatAmplitude;
  mesh.userData.simple = simple;

  return {
    name: 'shape',
    object: mesh,
    uniforms,
    frame(delta) {
      if (uniforms.uTime) uniforms.uTime.value += delta;
    },
    animate(delta) {
      const t = performance.now() / 1000;
      const p = mesh.userData.phase;

      // Rotation
      mesh.rotation.x += mesh.userData.rotationSpeed[0] * delta;
      mesh.rotation.y += mesh.userData.rotationSpeed[1] * delta;
      mesh.rotation.z += mesh.userData.rotationSpeed[2] * delta;

      // Floating motion
      mesh.position.y = position[1] + Math.sin(t * 0.5 + p) * mesh.userData.floatAmplitude;
    },
    init() {},
    dispose() {
      geometry.dispose();
      material.dispose();
    }
  };
}

function createShapes(options = {}) {
  const {
    count = 3,
    gpuTier = 1,
    time = 0,
    isMobile = false
  } = options;

  const shapes = [];
  const geometries = ['icosahedron', 'octahedron', 'torusKnot'];
  const colors = [
    [1.0, 0.0, 0.98],
    [0.73, 0.07, 1.0],
    [0.0, 0.94, 0.98]
  ];

  // Mobile: fewer shapes, simpler geometry
  let actualCount;
  if (gpuTier >= 2) {
    actualCount = Math.min(count, 5);
  } else if (gpuTier === 1 || isMobile) {
    actualCount = Math.min(count, 3);
  } else {
    // gpuTier 0 — just 1 or 2 shapes
    actualCount = Math.min(count, 2);
  }

  const simple = gpuTier < 1 || isMobile;
  // Use reduced size on mobile so shapes fit on small screens
  const sizeMultiplier = isMobile ? 0.6 : 1.0;

  for (let i = 0; i < actualCount; i++) {
    const geomType = geometries[i % geometries.length];
    const color = colors[i % colors.length];
    // No interaction on mobile (no hover/click on touch devices)
    const interactive = i === 0 && gpuTier >= 2 && !isMobile;

    const shape = createShape(geomType, {
      size: (0.8 + Math.random() * 1.2) * sizeMultiplier,
      color,
      wireframe: true,
      position: [
        (Math.random() - 0.5) * (isMobile ? 20 : 40),
        2 + Math.random() * (isMobile ? 4 : 8),
        isMobile ? -8 - Math.random() * 15 : -10 - Math.random() * 30
      ],
      rotationSpeed: [
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.2
      ],
      floatAmplitude: 0.3 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      interactive,
      time,
      simple
    });

    shapes.push(shape);
  }

  return {
    name: 'shapes',
    components: shapes,
    objects: shapes.map(s => s.object),
    frame(delta) {
      for (const s of shapes) {
        s.frame(delta);
      }
    },
    animate(delta) {
      for (const s of shapes) {
        s.animate(delta);
      }
    },
    init(manager) {
      for (const s of shapes) {
        manager?.scene?.add(s.object);
      }
    },
    dispose() {
      for (const s of shapes) {
        s.dispose();
      }
    }
  };
}

export default createShapes;
export { createShape, createShapes, SHAPE_VERT, SHAPE_FRAG, WIREFRAME_FRAG };
