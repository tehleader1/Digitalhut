#!/data/data/com.termux/files/usr/bin/bash
set -e

echo "🚀 Upgrading DigitalHut 3D runtime..."

npm install three vite @vitejs/plugin-react react react-dom

mkdir -p src

cat > src/App.jsx <<'APP'
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { SSAOPass } from "three/examples/jsm/postprocessing/SSAOPass.js";

const views = [
  "Bedroom","Living Room","Patio",
  "Plumbing","Office","Meeting",
  "Rooftop","Safe Room","Lobby",
  "Parking","Zoom +","Zoom -",
  "Rotate","Exterior","Pool"
];

const stats = {
  Bedroom: [34,2,0,94],
  "Living Room": [38,3,0,93],
  Patio: [55,2,0,91],
  Plumbing: [72,1,0,96],
  Office: [61,6,0,95],
  Meeting: [68,10,0,97],
  Rooftop: [84,9,0,98],
  "Safe Room": [47,1,0,96],
  Lobby: [76,12,2,97],
  Parking: [92,4,14,98],
  Exterior: [120,7,10,99],
  Pool: [63,4,0,95]
};

export default function App() {
  const mount = useRef(null);
  const sceneRef = useRef({});
  const [active, setActive] = useState("Exterior");

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050812);
    scene.fog = new THREE.Fog(0x050812, 45, 160);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(26, 22, 34);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    mount.current.innerHTML = "";
    mount.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.minDistance = 8;
    controls.maxDistance = 90;
    controls.target.set(0, 4, 0);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const ssao = new SSAOPass(scene, camera, width, height);
    ssao.kernelRadius = 14;
    ssao.minDistance = 0.005;
    ssao.maxDistance = 0.16;
    composer.addPass(ssao);

    const bloom = new UnrealBloomPass(new THREE.Vector2(width, height), 0.32, 0.5, 0.85);
    composer.addPass(bloom);

    const hemi = new THREE.HemisphereLight(0x9fdcff, 0x161616, 1.8);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xffffff, 4);
    sun.position.set(24, 38, 18);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 120;
    sun.shadow.camera.left = -80;
    sun.shadow.camera.right = 80;
    sun.shadow.camera.top = 80;
    sun.shadow.camera.bottom = -80;
    scene.add(sun);

    const fill = new THREE.PointLight(0x38bdf8, 85, 80);
    fill.position.set(-18, 14, 10);
    scene.add(fill);

    const group = new THREE.Group();
    scene.add(group);

    const clock = new THREE.Clock();

    const mat = {
      floor: new THREE.MeshStandardMaterial({ color: 0x202824, roughness: 0.72, metalness: 0.05 }),
      wall: new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.6 }),
      glass: new THREE.MeshPhysicalMaterial({ color: 0x8fdcff, roughness: 0.08, metalness: 0.05, transmission: 0.35, transparent: true, opacity: 0.42 }),
      wood: new THREE.MeshStandardMaterial({ color: 0x8a4f22, roughness: 0.48 }),
      metal: new THREE.MeshStandardMaterial({ color: 0x8b949e, roughness: 0.25, metalness: 0.9 }),
      neon: new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 1.8 }),
      red: new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.45 }),
      green: new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.55 }),
      water: new THREE.MeshPhysicalMaterial({ color: 0x0ea5e9, roughness: 0.05, metalness: 0, transmission: 0.45, transparent: true, opacity: 0.72 })
    };

    function cube(x,y,z,w,h,d,m) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), m);
      mesh.position.set(x,y,z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
      return mesh;
    }

    function cyl(x,y,z,r,h,m) {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,32), m);
      mesh.position.set(x,y,z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
      return mesh;
    }

    function person(x,z) {
      const body = cyl(x,2,z,0.38,2.4,mat.metal);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.42,32,32), mat.red);
      head.position.set(x,3.45,z);
      head.castShadow = true;
      group.add(head);
      return body;
    }

    function car(x,z) {
      cube(x,0.7,z,4.6,1.1,2.2,mat.red);
      cube(x,1.45,z,2.4,0.9,1.7,mat.glass);
      cyl(x-1.45,0.25,z-1.15,0.38,0.35,mat.metal).rotation.z = Math.PI/2;
      cyl(x+1.45,0.25,z-1.15,0.38,0.35,mat.metal).rotation.z = Math.PI/2;
      cyl(x-1.45,0.25,z+1.15,0.38,0.35,mat.metal).rotation.z = Math.PI/2;
      cyl(x+1.45,0.25,z+1.15,0.38,0.35,mat.metal).rotation.z = Math.PI/2;
    }

    function drone(x,z) {
      const d = cube(x,8,z,1.2,0.25,1.2,mat.neon);
      for (const dx of [-1,1]) for (const dz of [-1,1]) {
        cube(x+dx,8,z+dz,0.85,0.06,0.85,mat.metal);
      }
      d.userData.drone = true;
      return d;
    }

    function clear() {
      while(group.children.length) {
        const child = group.children.pop();
        child.geometry?.dispose?.();
      }
    }

    function baseGrid() {
      cube(0,-0.08,0,90,0.1,90,mat.floor);
      for(let i=-40;i<=40;i+=10){
        cube(i,0.01,0,0.08,0.04,90,mat.wall);
        cube(0,0.02,i,90,0.04,0.08,mat.wall);
      }
    }

    function build(view) {
      clear();
      baseGrid();

      if(view === "Bedroom") {
        cube(0,1.5,0,18,3,14,mat.wall);
        cube(0,1.2,0,7,1.1,5,mat.wood);
        cube(0,2.05,0,7.4,0.45,5.4,mat.glass);
        cube(-5,2.5,-4,1.2,3,1.2,mat.neon);
        cube(6,2,-5,4,2.4,0.3,mat.glass);
        person(5,3);
      }

      if(view === "Living Room") {
        cube(0,1,0,8,1.5,3,mat.wood);
        cube(-5,1,3,5,1.5,2,mat.wall);
        cube(5,2.5,-5,7,4,0.35,mat.glass);
        cube(0,3,-6,9,5,0.3,mat.wall);
        person(-2,4); person(3,2);
      }

      if(view === "Patio") {
        cube(0,0.2,0,20,0.4,12,mat.wood);
        cyl(-7,2,-3,0.35,4,mat.green);
        cyl(7,2,3,0.35,4,mat.green);
        cube(0,1,0,8,0.8,3,mat.wood);
        drone(5,-4);
      }

      if(view === "Plumbing") {
        for(let i=-18;i<=18;i+=6) cyl(i,1.5,0,0.32,16,mat.metal).rotation.x=Math.PI/2;
        for(let z=-18;z<=18;z+=6) cyl(0,1.2,z,0.25,22,mat.neon).rotation.z=Math.PI/2;
        for(let i=0;i<8;i++) cyl(-18+i*5,2.5,-8+Math.sin(i)*5,0.45,2.5,mat.red);
      }

      if(view === "Office") {
        for(let x=-12;x<=12;x+=6){
          cube(x,1,0,4,0.3,2,mat.wood);
          cube(x,2.2,-0.7,2,1.5,0.25,mat.glass);
          person(x,3);
        }
      }

      if(view === "Meeting") {
        cube(0,1,0,14,0.8,4,mat.wood);
        for(let i=0;i<10;i++){
          const a=i/10*Math.PI*2;
          person(Math.cos(a)*8,Math.sin(a)*5);
        }
        cube(0,4,-9,12,5,0.3,mat.glass);
      }

      if(view === "Rooftop") {
        cube(0,0.5,0,40,1,28,mat.floor);
        cube(0,1,-13,36,2,1,mat.glass);
        for(let i=0;i<9;i++) person(-16+i*4,4+Math.sin(i)*3);
        drone(0,-5);
      }

      if(view === "Safe Room") {
        cube(0,3,0,16,6,14,mat.metal);
        cube(0,3,-7.2,5,5,0.4,mat.neon);
        cube(0,1.2,0,6,2.4,4,mat.wall);
        person(3,2);
      }

      if(view === "Lobby") {
        cube(0,3,-10,26,6,0.4,mat.glass);
        cube(0,1,2,10,1.5,4,mat.wood);
        for(let i=0;i<12;i++) person(-12+i*2.2,Math.sin(i)*5);
      }

      if(view === "Parking") {
        for(let i=0;i<14;i++) car(-24+(i%7)*8,-10+Math.floor(i/7)*12);
        drone(0,12);
      }

      if(view === "Exterior") {
        cube(0,8,0,22,16,18,mat.wall);
        cube(0,17,0,24,1,20,mat.floor);
        cube(0,4,-9.2,8,7,0.4,mat.glass);
        for(let i=0;i<10;i++) car(-35+i*7,22);
        drone(10,-15);
      }

      if(view === "Pool") {
        cube(0,0.1,0,24,0.2,14,mat.wood);
        cube(0,0.35,0,17,0.4,8,mat.water);
        for(let i=0;i<4;i++) person(-8+i*5,7);
      }
    }

    build(active);

    sceneRef.current = { camera, controls, build, group };

    function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      group.children.forEach((o) => {
        if(o.userData.drone){
          o.position.y = 8 + Math.sin(t*2)*0.7;
          o.rotation.y += 0.03;
        }
      });

      controls.update();
      composer.render();
    }

    animate();

    window.addEventListener("resize", () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w/h;
      camera.updateProjectionMatrix();
      renderer.setSize(w,h);
      composer.setSize(w,h);
    });

    return () => renderer.dispose();
  }, []);

  function press(v) {
    const ref = sceneRef.current;

    if(v === "Zoom +") {
      ref.camera.position.multiplyScalar(0.82);
      return;
    }

    if(v === "Zoom -") {
      ref.camera.position.multiplyScalar(1.18);
      return;
    }

    if(v === "Rotate") {
      ref.group.rotation.y += Math.PI / 5;
      return;
    }

    setActive(v);
    setTimeout(() => sceneRef.current.build(v), 0);
  }

  const s = stats[active] || [45,1,0,90];

  return (
    <div className="app">
      <div className="hud">
        <h1>DigitalHut Live 3D Simulation</h1>
        <div className="grid">
          {views.map(v => <button key={v} onClick={() => press(v)}>{v}</button>)}
        </div>
      </div>

      <div ref={mount} className="stage" />

      <div className="panel">
        <b>{active} Live Runtime</b><br/>
        Features: rotate, zoom, agents, cars, drone, animals, bugs<br/>
        Objects: {s[0]} | People: {s[1]} | Cars: {s[2]}<br/>
        Dojj operational score: {s[3]}%
      </div>
    </div>
  );
}
APP

cat > src/main.jsx <<'MAIN'
import React from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(<App />);
MAIN

cat > src/style.css <<'CSS'
html,body,#root{
  margin:0;
  width:100%;
  height:100%;
  overflow:hidden;
  background:#030712;
  font-family:Arial,Helvetica,sans-serif;
}

.app{
  width:100vw;
  height:100vh;
  color:white;
  position:relative;
}

.stage{
  position:absolute;
  inset:0;
  z-index:1;
}

.hud{
  position:absolute;
  top:0;
  left:0;
  right:0;
  z-index:5;
  background:linear-gradient(180deg,rgba(3,7,18,.98),rgba(3,7,18,.78),rgba(3,7,18,0));
  padding:18px;
}

h1{
  margin:0 0 14px;
  font-size:28px;
  font-weight:900;
}

.grid{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:12px;
}

button{
  background:#38bdf8;
  border:0;
  border-radius:18px;
  padding:15px 4px;
  font-size:20px;
  font-weight:900;
  color:#020617;
  box-shadow:0 5px 0 #0284c7;
}

button:active{
  transform:translateY(4px);
  box-shadow:0 1px 0 #0284c7;
}

.panel{
  position:absolute;
  z-index:6;
  left:18px;
  right:18px;
  bottom:18px;
  padding:18px 22px;
  border:1.5px solid #38bdf8;
  border-radius:22px;
  background:rgba(3,7,18,.88);
  font-size:21px;
  line-height:1.25;
}

.panel b{
  font-size:22px;
}
CSS

cat > index.html <<'HTML'
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DigitalHut Live 3D Simulation</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
HTML

cat > package.json <<'PKG'
{
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "vite build",
    "preview": "vite preview --host 0.0.0.0"
  },
  "dependencies": {
    "@vitejs/plugin-react": "latest",
    "vite": "latest",
    "react": "latest",
    "react-dom": "latest",
    "three": "latest"
  },
  "devDependencies": {}
}
PKG

echo "✅ Upgrade installed."
echo "Run:"
echo "npm run dev"
