#!/data/data/com.termux/files/usr/bin/bash
set -e

echo "🏗️ Building DigitalHut Asset Streaming Engine..."

npm install three vite react react-dom @vitejs/plugin-react

mkdir -p src public/assets public/hdr public/textures

cat > src/App.jsx <<'APP'
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { Water } from "three/examples/jsm/objects/Water.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { SSAOPass } from "three/examples/jsm/postprocessing/SSAOPass.js";

const buttons = [
  "Exterior","Bedroom","Living Room","Patio","Plumbing",
  "Office","Meeting","Rooftop","Safe Room","Lobby",
  "Parking","Pool","Zoom +","Zoom -","Rotate"
];

const assetMap = {
  Exterior: "/assets/modern-house.glb",
  Bedroom: "/assets/bedroom.glb",
  "Living Room": "/assets/living-room.glb",
  Patio: "/assets/patio.glb",
  Plumbing: "/assets/plumbing.glb",
  Office: "/assets/office.glb",
  Meeting: "/assets/meeting-room.glb",
  Rooftop: "/assets/rooftop.glb",
  "Safe Room": "/assets/safe-room.glb",
  Lobby: "/assets/lobby.glb",
  Parking: "/assets/parking.glb",
  Pool: "/assets/pool.glb"
};

export default function App() {
  const mount = useRef(null);
  const runtime = useRef({});
  const [active, setActive] = useState("Exterior");
  const [loadedAsset, setLoadedAsset] = useState("procedural fallback");

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x9fdcff);

    const camera = new THREE.PerspectiveCamera(32, window.innerWidth/window.innerHeight, 0.1, 2000);
    camera.position.set(34, 24, 42);

    const renderer = new THREE.WebGLRenderer({ antialias:true, powerPreference:"high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    mount.current.innerHTML = "";
    mount.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 4, 0);
    controls.minDistance = 6;
    controls.maxDistance = 160;

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const ssao = new SSAOPass(scene, camera, window.innerWidth, window.innerHeight);
    ssao.kernelRadius = 12;
    ssao.minDistance = 0.004;
    ssao.maxDistance = 0.12;
    composer.addPass(ssao);

    composer.addPass(new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.25,
      0.45,
      0.85
    ));

    const hemi = new THREE.HemisphereLight(0xffffff, 0x334155, 2.2);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xffffff, 4.5);
    sun.position.set(50, 70, 40);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048,2048);
    sun.shadow.camera.left = -120;
    sun.shadow.camera.right = 120;
    sun.shadow.camera.top = 120;
    sun.shadow.camera.bottom = -120;
    scene.add(sun);

    const sky = new Sky();
    sky.scale.setScalar(450000);
    scene.add(sky);

    const skyUniforms = sky.material.uniforms;
    skyUniforms.turbidity.value = 7;
    skyUniforms.rayleigh.value = 2.2;
    skyUniforms.mieCoefficient.value = 0.006;
    skyUniforms.mieDirectionalG.value = 0.82;

    const sunPos = new THREE.Vector3();
    sunPos.setFromSphericalCoords(1, THREE.MathUtils.degToRad(72), THREE.MathUtils.degToRad(155));
    skyUniforms.sunPosition.value.copy(sunPos);

    const world = new THREE.Group();
    scene.add(world);

    const loader = new GLTFLoader();
    const textureLoader = new THREE.TextureLoader();

    const mats = {
      grass: new THREE.MeshStandardMaterial({ color:0x3f8f45, roughness:0.85 }),
      road: new THREE.MeshStandardMaterial({ color:0x1f2933, roughness:0.75 }),
      concrete: new THREE.MeshStandardMaterial({ color:0x9ca3af, roughness:0.68 }),
      wood: new THREE.MeshStandardMaterial({ color:0x9a5f2d, roughness:0.5 }),
      glass: new THREE.MeshPhysicalMaterial({ color:0xbbeaff, roughness:0.03, transmission:0.4, transparent:true, opacity:0.52 }),
      wall: new THREE.MeshStandardMaterial({ color:0xf5f0e7, roughness:0.62 }),
      dark: new THREE.MeshStandardMaterial({ color:0x111827, roughness:0.55 }),
      metal: new THREE.MeshStandardMaterial({ color:0x9ca3af, roughness:0.22, metalness:0.8 }),
      neon: new THREE.MeshStandardMaterial({ color:0x38bdf8, emissive:0x0284c7, emissiveIntensity:1.8 })
    };

    function clearWorld() {
      while(world.children.length) {
        const obj = world.children.pop();
        obj.traverse?.((x) => {
          x.geometry?.dispose?.();
          if(Array.isArray(x.material)) x.material.forEach(m=>m.dispose?.());
          else x.material?.dispose?.();
        });
      }
    }

    function mesh(geo, mat, x,y,z) {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x,y,z);
      m.castShadow = true;
      m.receiveShadow = true;
      world.add(m);
      return m;
    }

    function box(x,y,z,w,h,d,mat) {
      return mesh(new THREE.BoxGeometry(w,h,d), mat, x,y,z);
    }

    function cyl(x,y,z,r,h,mat) {
      return mesh(new THREE.CylinderGeometry(r,r,h,36), mat, x,y,z);
    }

    function sphere(x,y,z,r,mat) {
      return mesh(new THREE.SphereGeometry(r,32,32), mat, x,y,z);
    }

    function tree(x,z,s=1) {
      cyl(x,1.2,z,0.25*s,2.4*s,mats.wood);
      const crown = new THREE.Mesh(new THREE.ConeGeometry(1.7*s,4*s,10), new THREE.MeshStandardMaterial({ color:0x15803d, roughness:0.9 }));
      crown.position.set(x,4*s,z);
      crown.castShadow = true;
      crown.receiveShadow = true;
      world.add(crown);
    }

    function person(x,z) {
      cyl(x,1.2,z,0.3,2.1,mats.dark);
      sphere(x,2.55,z,0.38,new THREE.MeshStandardMaterial({ color:0xd6a77a, roughness:0.5 }));
    }

    function car(x,z,color=0xef4444) {
      const carMat = new THREE.MeshStandardMaterial({ color, roughness:0.38, metalness:0.35 });
      box(x,0.65,z,4.8,1.1,2.2,carMat);
      box(x,1.45,z,2.6,0.95,1.7,mats.glass);
      for(const dx of [-1.55,1.55]) for(const dz of [-1.15,1.15]) {
        const wheel = cyl(x+dx,0.32,z+dz,0.42,0.35,mats.dark);
        wheel.rotation.z = Math.PI/2;
      }
    }

    function drone(x,z) {
      const d = box(x,8,z,1.2,0.25,1.2,mats.neon);
      d.userData.drone = true;
      for(const dx of [-1,1]) for(const dz of [-1,1]) box(x+dx,8,z+dz,0.8,0.05,0.8,mats.metal);
    }

    function terrain() {
      const geo = new THREE.PlaneGeometry(220,220,80,80);
      geo.rotateX(-Math.PI/2);
      const pos = geo.attributes.position;
      for(let i=0;i<pos.count;i++){
        const x = pos.getX(i);
        const z = pos.getZ(i);
        const y = Math.sin(x*0.04)*0.45 + Math.cos(z*0.035)*0.35;
        pos.setY(i,y);
      }
      geo.computeVertexNormals();
      const ground = new THREE.Mesh(geo,mats.grass);
      ground.receiveShadow = true;
      world.add(ground);

      box(0,0.03,18,90,0.08,10,mats.road);
      box(-28,0.05,0,8,0.08,70,mats.road);
      box(28,0.05,0,8,0.08,70,mats.road);

      for(let i=-48;i<=48;i+=8) {
        tree(i,-32,0.8 + Math.random()*0.6);
        tree(i,38,0.8 + Math.random()*0.6);
      }
    }

    function water(x,z,w,d) {
      const waterGeometry = new THREE.PlaneGeometry(w,d);
      const normal = textureLoader.load("https://threejs.org/examples/textures/waternormals.jpg", t => {
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
      });

      const pool = new Water(waterGeometry, {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: normal,
        sunDirection: sun.position.clone().normalize(),
        sunColor: 0xffffff,
        waterColor: 0x0ea5e9,
        distortionScale: 2.4,
        fog: scene.fog !== undefined
      });
      pool.rotation.x = -Math.PI/2;
      pool.position.set(x,0.25,z);
      pool.userData.water = true;
      world.add(pool);
    }

    function fallbackHouse(view) {
      terrain();

      if(view === "Exterior") {
        box(0,4,0,18,8,14,mats.wall);
        box(0,9,0,20,1,16,mats.dark);
        box(-4,4,-7.1,4,5,0.25,mats.glass);
        box(5,4,-7.1,5,5,0.25,mats.glass);
        box(0,2.5,7.2,5,5,0.3,mats.wood);
        water(-18,-8,18,10);
        for(let i=0;i<10;i++) car(-36+i*8,20,i%2?0x2563eb:0xef4444);
        for(let i=0;i<9;i++) person(-12+i*3,-14);
        drone(10,-18);
      }

      if(view === "Bedroom") {
        box(0,2,0,16,4,13,mats.wall);
        box(0,1.1,0,7,1.1,5,mats.wood);
        box(0,2,0,7.4,0.5,5.4,mats.glass);
        box(-6,2.2,-4,1,3,1,mats.neon);
        box(5,2,-6.7,5,3,0.2,mats.glass);
        person(5,3);
      }

      if(view === "Living Room") {
        box(0,0.6,0,8,1,3,mats.wood);
        box(-5,0.8,3,5,1.3,2,mats.dark);
        box(5,2.5,-5,7,4,0.2,mats.glass);
        box(0,3,-7,14,6,0.3,mats.wall);
        person(-2,4); person(3,2);
      }

      if(view === "Patio") {
        box(0,0.1,0,24,0.25,14,mats.wood);
        water(-6,0,10,7);
        for(let i=0;i<8;i++) tree(-12+i*4,7,0.8);
        box(6,1,0,7,0.7,3,mats.wood);
        drone(5,-6);
      }

      if(view === "Plumbing") {
        box(0,0.4,0,34,0.8,20,mats.concrete);
        for(let i=-15;i<=15;i+=5){
          const p = cyl(i,2,0,0.28,24,mats.metal);
          p.rotation.x = Math.PI/2;
        }
        for(let z=-10;z<=10;z+=5){
          const p = cyl(0,3,z,0.2,30,mats.neon);
          p.rotation.z = Math.PI/2;
        }
      }

      if(view === "Office" || view === "Meeting") {
        box(0,3,-12,32,6,0.3,mats.glass);
        box(0,0.8,0,14,0.7,4,mats.wood);
        for(let i=0;i<10;i++) person(-12+i*2.7,Math.sin(i)*5);
      }

      if(view === "Rooftop") {
        box(0,0.5,0,42,1,28,mats.concrete);
        box(0,1,-13,38,2,1,mats.glass);
        water(-10,0,12,7);
        for(let i=0;i<12;i++) person(-17+i*3,5+Math.sin(i)*4);
        drone(0,-6);
      }

      if(view === "Safe Room") {
        box(0,3,0,18,6,14,mats.metal);
        box(0,3,-7.1,6,5,0.4,mats.neon);
        box(0,1.4,0,7,2.4,4,mats.dark);
        person(3,2);
      }

      if(view === "Lobby") {
        box(0,3,-10,30,6,0.3,mats.glass);
        box(0,1,2,11,1.4,4,mats.wood);
        for(let i=0;i<12;i++) person(-13+i*2.4,Math.sin(i)*5);
      }

      if(view === "Parking") {
        box(0,0.1,0,80,0.2,50,mats.concrete);
        for(let i=0;i<16;i++) car(-28+(i%8)*8,-10+Math.floor(i/8)*14,i%2?0x2563eb:0xef4444);
        drone(0,12);
      }

      if(view === "Pool") {
        box(0,0.1,0,34,0.2,22,mats.wood);
        water(0,0,22,12);
        for(let i=0;i<10;i++) tree(-15+i*3.5,9,0.7);
        for(let i=0;i<5;i++) person(-8+i*4,7);
      }
    }

    function loadRealAsset(view) {
      clearWorld();
      const url = assetMap[view];

      loader.load(
        url,
        (gltf) => {
          terrain();

          const model = gltf.scene;
          model.position.set(0,0,0);
          model.scale.set(4,4,4);

          model.traverse((obj) => {
            if(obj.isMesh) {
              obj.castShadow = true;
              obj.receiveShadow = true;
              if(obj.material) {
                obj.material.needsUpdate = true;
                if(obj.material.map) obj.material.map.anisotropy = 8;
              }
            }
          });

          world.add(model);

          if(view === "Exterior" || view === "Pool" || view === "Patio") water(-18,-8,18,10);
          for(let i=0;i<8;i++) tree(-34+i*10,32,1);
          for(let i=0;i<6;i++) car(-28+i*9,20);
          for(let i=0;i<8;i++) person(-10+i*3,-10);
          drone(10,-16);

          setLoadedAsset(url);
        },
        undefined,
        () => {
          fallbackHouse(view);
          setLoadedAsset("procedural fallback - add " + url);
        }
      );
    }

    runtime.current = {
      camera,
      controls,
      world,
      loadRealAsset,
      composer,
      renderer
    };

    loadRealAsset("Exterior");

    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      world.children.forEach((o) => {
        if(o.userData.water) o.material.uniforms.time.value += 1/80;
        if(o.userData.drone) {
          o.position.y = 8 + Math.sin(t*2)*0.8;
          o.rotation.y += 0.035;
        }
      });

      controls.update();
      composer.render();
    }

    animate();

    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth/window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth,window.innerHeight);
      composer.setSize(window.innerWidth,window.innerHeight);
    });
  }, []);

  function press(v) {
    const r = runtime.current;

    if(v === "Zoom +") {
      r.camera.position.multiplyScalar(0.82);
      return;
    }

    if(v === "Zoom -") {
      r.camera.position.multiplyScalar(1.18);
      return;
    }

    if(v === "Rotate") {
      r.world.rotation.y += Math.PI / 5;
      return;
    }

    setActive(v);
    r.loadRealAsset(v);
  }

  return (
    <div className="app">
      <div className="hud">
        <h1>DigitalHut Architect Runtime</h1>
        <div className="grid">
          {buttons.map(b => <button key={b} onClick={()=>press(b)}>{b}</button>)}
        </div>
      </div>

      <div ref={mount} className="stage" />

      <div className="panel">
        <b>{active} Live Asset Runtime</b><br/>
        Mode: GLB asset streaming + terrain + water + sky + PBR<br/>
        Loaded: {loadedAsset}<br/>
        If fallback shows, place the matching .glb file inside /public/assets/
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
  background:#020617;
  font-family:Arial,Helvetica,sans-serif;
}

.app{
  width:100vw;
  height:100vh;
  position:relative;
  color:white;
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
  z-index:10;
  padding:18px;
  background:linear-gradient(180deg,rgba(2,6,23,.96),rgba(2,6,23,.72),rgba(2,6,23,0));
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
  border:0;
  border-radius:18px;
  background:#38bdf8;
  color:#020617;
  padding:14px 4px;
  font-size:19px;
  font-weight:900;
  box-shadow:0 5px 0 #0284c7;
}

button:active{
  transform:translateY(4px);
  box-shadow:0 1px 0 #0284c7;
}

.panel{
  position:absolute;
  left:18px;
  right:18px;
  bottom:18px;
  z-index:20;
  padding:18px 20px;
  border:1.5px solid #38bdf8;
  border-radius:22px;
  background:rgba(2,6,23,.86);
  font-size:18px;
  line-height:1.3;
}

.panel b{
  font-size:21px;
}
CSS

cat > index.html <<'HTML'
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DigitalHut Architect Runtime</title>
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

echo "✅ Phase 2 engine installed."
echo ""
echo "IMPORTANT:"
echo "Put real .glb files inside public/assets using these exact names:"
echo ""
echo "modern-house.glb"
echo "bedroom.glb"
echo "living-room.glb"
echo "patio.glb"
echo "plumbing.glb"
echo "office.glb"
echo "meeting-room.glb"
echo "rooftop.glb"
echo "safe-room.glb"
echo "lobby.glb"
echo "parking.glb"
echo "pool.glb"
echo ""
echo "Then run:"
echo "npm run dev"
