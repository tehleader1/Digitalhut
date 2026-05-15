import React,{useEffect,useRef,useState} from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import "./style.css";

const catalog={

"Africa Genesis Estate":{
rarity:"Legendary",
type:"NFT Home",
mint:"Mint Ready",
compat:"360 Compatible",
tag:"African inspired luxury NFT estate ecosystem.",
shop:"https://shop.supportrd.com/products/african-inspired-1-story-home",
views:{
Exterior:"/assets/genesis/africa/exterior.glb",
Patio:"/assets/genesis/africa/patio.glb",
Village:"/assets/genesis/africa/village.glb"
}
},

"Thailand Genesis Estate":{
rarity:"Epic",
type:"NFT Home",
mint:"Mint Ready",
compat:"360 Compatible",
tag:"Traditional Thai NFT architecture collection.",
shop:"https://shop.supportrd.com/products/thailand-bungalow",
views:{
Exterior:"/assets/genesis/thailand/exterior.glb",
Patio:"/assets/genesis/thailand/patio.glb",
Village:"/assets/genesis/thailand/village.glb"
}
},

"North Carolina Estate":{
rarity:"Rare",
type:"NFT Home",
mint:"Genesis Collection",
compat:"360 Compatible",
tag:"North Carolina inspired modern estate collection.",
shop:"https://shop.supportrd.com/products/north-carolina-1-story-home",
views:{
Exterior:"/assets/genesis/northcarolina/exterior.glb"
}
},

"Florida Beach Pad":{
rarity:"Epic",
type:"NFT Home",
mint:"Mint Ready",
compat:"360 Compatible",
tag:"Florida luxury NFT gaming and kitchen property.",
shop:"https://shop.supportrd.com/products/florida-beach-pad",
views:{
Exterior:"/assets/genesis/florida/exterior.glb"
}
},

"Canada Cabin Retreat":{
rarity:"Rare",
type:"NFT Cabin",
mint:"Genesis Collection",
compat:"360 Compatible",
tag:"Remote Canadian NFT cabin retreat.",
shop:"https://shop.supportrd.com/products/canada-cabin-mountain-home-01",
views:{
Exterior:"/assets/genesis/canada/exterior.glb"
}
},

"India / Indonesia Estate":{
rarity:"Epic",
type:"NFT Home",
mint:"Mint Ready",
compat:"360 Compatible",
tag:"Traditional Asian architecture NFT property.",
shop:"https://shop.supportrd.com/products/india-2-story-home",
views:{
Exterior:"/assets/genesis/india/exterior.glb"
}
}


,
"Japanese Tatami Estate":{
rarity:"Epic",
type:"NFT Home",
mint:"Mint Ready",
compat:"360 Compatible",
tag:"Traditional Japanese tatami NFT property.",
shop:"https://shop.supportrd.com/products/japan-2-story-home",
views:{
Exterior:"/assets/japan/japanese_tatami_room.glb"
}
},

"Japanese Luxury Interior":{
rarity:"Legendary",
type:"NFT Home",
mint:"Mint Ready",
compat:"360 Compatible",
tag:"Luxury Japanese NFT interior experience.",
shop:"https://shop.supportrd.com/products/japan-2-story-home",
views:{
Exterior:"/assets/japan/japanese_style_interior.glb"
}
},

"Japanese Residential Estate":{
rarity:"Rare",
type:"NFT Home",
mint:"Genesis Collection",
compat:"360 Compatible",
tag:"Modern Japanese residential NFT property.",
shop:"https://shop.supportrd.com/products/japan-2-story-home",
views:{
Exterior:"/assets/japan/japanese_residential_home_03.glb"
}
}

};


const realLifeScenarios=[
{
title:"Real Estate Model",
img:"https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80",
scenario:"A builder or realtor can use DigitalHut to show a 3D home before the buyer ever walks inside. This helps sell vision, upgrades, layouts, and lifestyle faster.",
buy:"https://shop.supportrd.com/products/japan-2-story-home",
source:"Real estate market + buyer visualization trends"
},
{
title:"Workforce Blueprint",
img:"https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=80",
scenario:"A company can map offices, plumbing routes, safe rooms, training areas, parking, and work zones so teams understand the job before arriving.",
buy:"https://shop.supportrd.com/products/japan-2-story-home",
source:"Workforce training + digital twin planning"
},
{
title:"School Project",
img:"https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80",
scenario:"Students can turn architecture, geography, history, business, and STEM projects into interactive 3D worlds instead of flat slides.",
buy:"https://shop.supportrd.com/products/japan-2-story-home",
source:"Education technology + project-based learning"
},
{
title:"Video Game",
img:"https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80",
scenario:"Game creators can use DigitalHut environments as concept maps, playable rooms, NFT worlds, or early-stage game level previews.",
buy:"https://shop.supportrd.com/products/japan-2-story-home",
source:"Gaming, metaverse, and interactive media"
},
{
title:"Housing Market Analysis",
img:"https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=900&q=80",
scenario:"Investors can compare houses, neighborhoods, renovation ideas, and buyer appeal visually before spending money on the wrong property.",
buy:"https://shop.supportrd.com/products/japan-2-story-home",
source:"Housing market research + investor planning"
},
{
title:"NFT Decentralized Project",
img:"https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&w=900&q=80",
scenario:"DigitalHut can help creators build NFT property collections with real utility: rooms, access, community, training, memberships, and digital ownership.",
buy:"https://shop.supportrd.com/products/japan-2-story-home",
source:"NFT digital property + decentralized communities"
}
];
\nexport default function App(){

const mount=useRef(null);
const first=Object.keys(catalog)[0];

const [product,setProduct]=useState(first);
const [view,setView]=useState("Exterior");
const [loaded,setLoaded]=useState("Ready");

useEffect(()=>{

const scene=new THREE.Scene();
scene.background=new THREE.Color(0xdbeafe);

const camera=new THREE.PerspectiveCamera(
55,
window.innerWidth/window.innerHeight,
0.1,
10000
);

camera.position.set(0,10,70);

const renderer=new THREE.WebGLRenderer({
antialias:true
});

renderer.setSize(window.innerWidth,window.innerHeight);

renderer.outputColorSpace=THREE.SRGBColorSpace;

mount.current.innerHTML="";
mount.current.appendChild(renderer.domElement);

const controls=new OrbitControls(camera,renderer.domElement);

controls.enableDamping=true;
controls.autoRotate=true;
controls.autoRotateSpeed=.24;

scene.add(new THREE.HemisphereLight(0xffffff,0x334455,4));

const sun=new THREE.DirectionalLight(0xffffff,5);
sun.position.set(20,40,20);
scene.add(sun);

const loader=new GLTFLoader();

let current=null;

function clear(){
 if(!current)return;
 scene.remove(current);
 current.traverse(o=>{
  o.geometry?.dispose?.();
  if(Array.isArray(o.material))o.material.forEach(m=>m.dispose?.());
  else o.material?.dispose?.();
 });
 current=null;
}

function load(prod,viewName){

clear();

const path=catalog[prod].views[viewName];

setLoaded("Loading "+prod+" · "+viewName);

loader.load(path,gltf=>{

current=gltf.scene;

current.scale.setScalar(12);

current.traverse(o=>{
 if(o.isMesh){
  o.castShadow=true;
  o.receiveShadow=true;
 }
});

scene.add(current);

camera.position.set(0,10,70);

controls.target.set(0,2,0);

controls.update();

setLoaded("Loaded "+prod+" · "+viewName);

},undefined,()=>setLoaded("Missing asset"));
}

window.loadGenesis=load;

load(first,"Exterior");

function animate(){
 requestAnimationFrame(animate);
 controls.update();
 renderer.render(scene,camera);
}
animate();

addEventListener("resize",()=>{
 camera.aspect=window.innerWidth/window.innerHeight;
 camera.updateProjectionMatrix();
 renderer.setSize(window.innerWidth,window.innerHeight);
});

},[]);

function chooseProduct(name){
 setProduct(name);
 setView("Exterior");
 window.loadGenesis(name,"Exterior");
}

function chooseView(name){
 setView(name);
 window.loadGenesis(product,name);
}

const p=catalog[product];

return(
<div className="site">

<section className="hero">
<div>
<div className="badge">DigitalHut Genesis Estates</div>
<h1>Minted NFT Architecture Collections + Custom Digital Homes</h1>
<p>Interactive 3D NFT-ready architecture collections for gaming, real estate concepts, decentralized projects, metaverse environments and blueprint-backed digital property systems.</p>
</div>
</section>



<section className="realLifeScenario" id="real-life-scenario">
<h2>Real Life Scenario</h2>
<p className="scenarioIntro">
DigitalHut is built to help people make more money, improve their life, and bring communities together through real projects, real models, and digital property systems.
</p>

<div className="scenarioGrid">
{realLifeScenarios.map((s,i)=>(
<div className="scenarioCard" key={s.title}>
<img src={s.img} alt={s.title}/>
<div className="scenarioBody">
<div className="scenarioBadge">Fresh Scenario #{i+1}</div>
<h3>{s.title}</h3>
<p>{s.scenario}</p>
<small>{s.source}</small>
<a href={s.buy} target="_blank" rel="noreferrer">Buy Example House Model</a>
</div>
</div>
))}
</div>
</section>
\n<section className="collections">

<h2>Genesis NFT Collections</h2>

<div className="collectionGrid">

{Object.keys(catalog).map(name=>{

const item=catalog[name];

const icon=
item.type.includes("Business")
?"🏢"
:item.type.includes("Studio")
?"🎮"
:"🏠";

return(

<div className="collectionCard" key={name}>

<div className="preview">
{icon}
</div>

<div className="cardBody">

<div className="rarity">
{item.rarity}
</div>

<h3>{name}</h3>

<p>
{item.tag}
</p>

<button onClick={()=>{
document.getElementById("sim")
.scrollIntoView({behavior:"smooth"});
chooseProduct(name);
}}>
Enter Experience
</button>

</div>

</div>

);

})}

</div>

</section>

<section id="sim" className="simWrap">

<aside className="catalogRail">

<h2>Genesis Collections</h2>

{Object.keys(catalog).map(name=>(
<button key={name} onClick={()=>chooseProduct(name)} className={name===product?"active":""}>
{name}
</button>
))}

</aside>

<div className="mainSim">

<div className="viewTabs">
{Object.keys(p.views).map(v=>(
<button key={v} onClick={()=>chooseView(v)} className={v===view?"active":""}>
{v}
</button>
))}
</div>

<div ref={mount} className="viewerBox"/>

<div className="infoCard">
<h3>{product}</h3>
<b>{p.rarity} · {p.type}</b>
<p>{p.tag}</p>

<div className="labels">
<span>{p.mint}</span>
<span>{p.compat}</span>
</div>

<p>{loaded}</p>

<a href={p.shop} target="_blank">
Open Shopify Product
</a>

</div>

</div>

</section>

<section className="services">

<div>
<h3>Custom Digital Homes</h3>
<p>Luxury NFT-ready digital homes for gaming, metaverse and real estate showcase systems.</p>
</div>

<div>
<h3>Minted NFT Collections</h3>
<p>Genesis rarity architecture collections designed for future marketplace expansion.</p>
</div>

<div>
<h3>Blueprint Backed Designs</h3>
<p>35+ year plumbing-backed blueprint and installation concept integration.</p>
</div>

<div>
<h3>360 / VR Ready</h3>
<p>Roadmap toward 360 property viewing and VR-compatible digital architecture systems.</p>
</div>

</section>

</div>
);
}

const nftRooms = [
  {
    name: "Japanese Tatami NFT Room",
    model: "/assets/japan/japanese_tatami_room.glb",
    price: "2.5 ETH"
  },
  {
    name: "Japanese Residential Estate",
    model: "/assets/japan/japanese_residential_home_01.glb",
    price: "4 ETH"
  },
  {
    name: "Luxury Japanese Interior",
    model: "/assets/japan/japanese_style_interior.glb",
    price: "3.2 ETH"
  },
  {
    name: "Aomori Falls NFT Experience",
    model: "/assets/japan/choshi-otaki_falls_oirase_valley_aomori.glb",
    price: "6 ETH"
  }
]


const japanRooms = [
  {
    id: "japan-tatami",
    name: "Japanese Tatami NFT Room",
    model: "/assets/japan/japanese_tatami_room.glb",
    category: "nft"
  },
  {
    id: "japan-home",
    name: "Japanese Residential Home",
    model: "/assets/japan/japanese_home_room..glb",
    category: "nft"
  },
  {
    id: "japan-luxury",
    name: "Luxury Japanese Interior",
    model: "/assets/japan/japanese_style_interior.glb",
    category: "nft"
  },
  {
    id: "japan-estate",
    name: "Japanese Estate",
    model: "/assets/japan/japanese_residential_home_03.glb",
    category: "nft"
  }
];

console.log("Japanese NFT rooms loaded", japanRooms);

