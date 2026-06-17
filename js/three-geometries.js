// Purposeful 3D Scenes — Infrastructure visualization with atmospheric depth
// Each scene communicates real DevOps/SRE competence while looking stunning
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
const GLOW_VERT = `varying vec3 vNormal;varying vec3 vViewPos;
void main(){vNormal=normalize(normalMatrix*normal);vViewPos=-(modelViewMatrix*vec4(position,1.0)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;

const GLOW_FRAG = `precision mediump float;uniform vec3 uColor;uniform float uTime;uniform float uPulse;
varying vec3 vNormal;varying vec3 vViewPos;
void main(){vec3 vd=normalize(vViewPos);float f=pow(1.0-abs(dot(vd,vNormal)),3.0);float p=0.7+0.3*sin(uTime*2.0+uPulse);
vec3 col=uColor*(0.3+0.7*f)*p;gl_FragColor=vec4(col,0.45+0.55*f);}`;

// ─── Particle texture ──────────────────────────────────────────────────────
function particleTex() {
  const c=document.createElement('canvas');c.width=c.height=32;
  const ctx=c.getContext('2d');const g=ctx.createRadialGradient(16,16,0,16,16,16);
  g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(0.3,'rgba(255,255,255,0.8)');g.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=g;ctx.fillRect(0,0,32,32);const t=new THREE.CanvasTexture(c);t.needsUpdate=true;return t;
}

// ─── Ambient Starfield — Atmospheric depth behind purposeful elements ──────
function createStarfield(options = {}) {
  const { count = 300, spread = 20, isMobile = false, gpuTier = 1 } = options;
  const q = getQuality(isMobile, gpuTier);
  const n = Math.round(count * q.countScale);

  const pos = new Float32Array(n * 3);
  const colors = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = spread * (0.3 + 0.7 * Math.random());
    pos[i*3]=r*Math.sin(phi)*Math.cos(theta);
    pos[i*3+1]=r*Math.cos(phi)*0.6; // Flatten vertical
    pos[i*3+2]=r*Math.sin(phi)*Math.sin(theta);
    const mix = Math.random();
    colors[i*3]=mix*1.0;colors[i*3+1]=(1-mix)*0.94;colors[i*3+2]=mix*0.98;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  geo.setAttribute('color',new THREE.BufferAttribute(colors,3));

  const tex = particleTex();
  const mat = new THREE.PointsMaterial({
    size: q.simple?0.08:0.1,vertexColors:true,transparent:true,opacity:0.5,
    blending:THREE.AdditiveBlending,depthWrite:false,map:tex,sizeAttenuation:true
  });
  const pts = new THREE.Points(geo,mat);
  return {
    name:'starfield',object:pts,geo,mat,tex,
    frame(delta){
      pts.rotation.y += delta*0.015;
      pts.rotation.x += delta*0.005;
    },
    animate(){},
    init(manager){this.manager=manager;},
    dispose(){geo.dispose();mat.dispose();tex.dispose();}
  };
}

// ─── Infrastructure Topology Graph — Core services, clean layout ──────────

const TOPO = {
  nodes: [
    { id:'k3s', label:'K3s Cluster', pos:[0,2.5,0], color:[1.0,0.0,0.98] },
    { id:'istio', label:'Istio Mesh', pos:[0,1,2], color:[0.73,0.07,1.0] },
    { id:'meshwatch', label:'MeshWatch', pos:[3,-0.5,1], color:[0.0,0.94,0.98] },
    { id:'prometheus', label:'Prometheus', pos:[4,-2,0], color:[1.0,0.5,0.0] },
    { id:'grafana', label:'Grafana', pos:[-3.5,-1,0.5], color:[0.0,0.8,0.6] },
    { id:'minecraft', label:'Minecraft', pos:[0,-3.5,3], color:[0.0,0.94,0.3] },
    { id:'ollama', label:'Ollama AI', pos:[-2,-3,2.5], color:[1.0,0.8,0.0] }
  ],
  edges: [
    ['k3s','istio'],['istio','meshwatch'],['istio','prometheus'],
    ['meshwatch','prometheus'],['meshwatch','grafana'],['meshwatch','minecraft'],
    ['prometheus','grafana'],['k3s','minecraft'],['k3s','ollama'],
    ['minecraft','ollama']
  ]
};

function createTopologyGraph(options = {}) {
  const { isMobile = false, gpuTier = 1 } = options;
  const q = getQuality(isMobile, gpuTier);
  const group = new THREE.Group();
  const geos=[], mats=[], nodes=[];

  const s = isMobile?0.6:1.0;
  const nr = q.simple?0.25:0.3;

  // Nodes
  for (const n of TOPO.nodes) {
    const [x,y,z]=n.pos.map(v=>v*s);
    const geo = new THREE.IcosahedronGeometry(nr,q.simple?0:1);
    geos.push(geo);
    const unis={uColor:{value:new THREE.Vector3(...n.color)},uTime:{value:0},uPulse:{value:Math.random()*Math.PI*2}};
    const mat=q.simple
      ?new THREE.MeshBasicMaterial({color:new THREE.Color(n.color[0],n.color[1],n.color[2]),transparent:true,opacity:0.7})
      :new THREE.ShaderMaterial({vertexShader:GLOW_VERT,fragmentShader:GLOW_FRAG,uniforms:unis,transparent:true,blending:THREE.AdditiveBlending});
    mats.push(mat);
    const m = new THREE.Mesh(geo,mat);m.position.set(x,y,z);group.add(m);
    nodes.push({mesh:m,unis,basePos:[x,y,z],...n});
  }

  // Edge particles
  const eps=[];const allPos=[];
  const ppe = q.simple?8:16;
  for (const [a,b] of TOPO.edges) {
    const A=TOPO.nodes.find(n=>n.id===a),B=TOPO.nodes.find(n=>n.id===b);
    if(!A||!B)continue;
    const ax=A.pos[0]*s,ay=A.pos[1]*s,az=A.pos[2]*s,bx=B.pos[0]*s,by=B.pos[1]*s,bz=B.pos[2]*s;
    for(let p=0;p<ppe;p++){allPos.push(ax,ay,az);eps.push({from:[ax,ay,az],to:[bx,by,bz],progress:p/ppe,speed:0.2+Math.random()*0.4});}
  }
  const eGeo=new THREE.BufferGeometry();eGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(allPos),3));
  geos.push(eGeo);
  const tex=particleTex();
  const eMat=new THREE.PointsMaterial({size:q.simple?0.06:0.08,transparent:true,opacity:0.6,blending:THREE.AdditiveBlending,depthWrite:false,map:tex,sizeAttenuation:true,color:new THREE.Color(0.0,0.94,0.98)});
  mats.push(eMat);
  group.add(new THREE.Points(eGeo,eMat));

  return {
    name:'topology',object:group,nodes,eps,eGeo,eMat,tex,geos,mats,
    frame(delta){
      for(const n of nodes){if(n.unis)n.unis.uTime.value+=delta;}
      const pos=eGeo.attributes.position.array;
      for(let i=0;i<eps.length;i++){const e=eps[i];e.progress+=e.speed*delta;if(e.progress>1)e.progress-=1;const i3=i*3;pos[i3]=e.from[0]+(e.to[0]-e.from[0])*e.progress;pos[i3+1]=e.from[1]+(e.to[1]-e.from[1])*e.progress;pos[i3+2]=e.from[2]+(e.to[2]-e.from[2])*e.progress;}
      eGeo.attributes.position.needsUpdate=true;
    },
    animate(){},
    init(mgr){this.manager=mgr;},
    dispose(){for(const g of geos)g.dispose();for(const m of mats)m.dispose();if(tex)tex.dispose();}
  };
}

// ─── 3D Metric Gauges — Live data visualization ───────────────────────────

function createMetricGauges(options = {}) {
  const { isMobile = false, gpuTier = 1 } = options;
  const q = getQuality(isMobile, gpuTier);
  const group = new THREE.Group();
  const geos=[], mats=[], gData=[];
  const R=1.8, T=0.25, sp=3.2;
  const gc=[[0.0,0.94,0.98],[0.0,0.94,0.3],[1.0,0.5,0.0],[0.73,0.07,1.0]];

  for(let g=0;g<4;g++){
    const x=(g-1.5)*sp;
    // Track
    const tGeo=new THREE.TorusGeometry(R,T*0.3,8,64,Math.PI*1.5);geos.push(tGeo);
    const tMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.08});mats.push(tMat);
    const track=new THREE.Mesh(tGeo,tMat);track.position.set(x,0,0);group.add(track);
    // Fill — start partially visible
    const initArc=Math.PI*0.3;
    const fGeo=new THREE.TorusGeometry(R,T,8,64,initArc);geos.push(fGeo);
    const unis={uColor:{value:new THREE.Vector3(...gc[g])},uTime:{value:0},uPulse:{value:g*0.7}};
    const fMat=q.simple
      ?new THREE.MeshBasicMaterial({color:new THREE.Color(gc[g][0],gc[g][1],gc[g][2]),transparent:true,opacity:0.8})
      :new THREE.ShaderMaterial({vertexShader:GLOW_VERT,fragmentShader:GLOW_FRAG,uniforms:unis,transparent:true,blending:THREE.AdditiveBlending});
    mats.push(fMat);
    const fill=new THREE.Mesh(fGeo,fMat);fill.position.set(x,0,0);group.add(fill);
    gData.push({track,fill,fGeo,unis,targetValue:25,currentValue:25,maxValue:100});
  }

  return {
    name:'gauges',object:group,gData,geos,mats,
    frame(delta){
      for(const g of this.gData){
        g.currentValue+=(g.targetValue-g.currentValue)*delta*2.5;
        const r=Math.min(g.currentValue/g.maxValue,1);
        g.fGeo.dispose();
        const arc=Math.PI*Math.max(1.5*r,0.05);
        const ng=new THREE.TorusGeometry(R,T,8,64,arc);
        g.fill.geometry=ng;g.fGeo=ng;
        if(g.unis)g.unis.uTime.value+=delta;
      }
    },
    animate(){},
    setData(data){
      if(!data)return;
      const d=this.gData;
      if(d[0])d[0].targetValue=Math.min((data.tps||0)/20*100,100);
      if(d[1])d[1].targetValue=Math.min((data.players||0)/20*100,100);
      if(d[2])d[2].targetValue=Math.min(data.heapPercent||0,100);
      if(d[3])d[3].targetValue=Math.min((data.uptimeHours||0)/720*100,100);
    },
    init(mgr){this.manager=mgr;},
    dispose(){for(const g of geos)g.dispose();for(const m of mats)m.dispose();}
  };
}

// ─── Page-specific scene builders ──────────────────────────────────────────

function buildTerminalScene(manager) {
  const { gpuTier = 1, isMobile } = manager;
  const comps = [];

  // Synthwave grid floor
  const grid = createGrid({ opacity: 0.25, time: 0, isMobile });
  manager.scene.add(grid.object);
  comps.push(grid);

  // Ambient starfield for depth and visual richness
  const stars = createStarfield({ count: 300, spread: 22, gpuTier, isMobile });
  stars.object.position.set(0, -2, -18);
  manager.scene.add(stars.object);
  comps.push(stars);

  // Infrastructure topology — clean 7-node layout
  const topo = createTopologyGraph({ gpuTier, isMobile });
  topo.object.position.set(0, -2, -12);
  manager.scene.add(topo.object);
  comps.push(topo);

  return { name: 'terminal', components: comps };
}

function buildDashboardScene(manager) {
  const { gpuTier = 1, isMobile } = manager;
  const comps = [];

  // Ambient starfield
  const stars = createStarfield({ count: 200, spread: 18, gpuTier, isMobile });
  stars.object.position.set(0, 0, -14);
  manager.scene.add(stars.object);
  comps.push(stars);

  // 3D metric gauges
  const gauges = createMetricGauges({ gpuTier, isMobile });
  gauges.object.position.set(0, 1.5, -10);
  manager.scene.add(gauges.object);
  comps.push(gauges);

  return { name: 'dashboard', components: comps, gauges };
}

export { buildTerminalScene, buildDashboardScene };
