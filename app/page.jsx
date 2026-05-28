"use client"

import {useEffect,useRef,useState} from "react"

const SKETCHFAB_TOKEN="137a2704a95d4051b5ffe795b90d92ce"

const CATS=[
 ["Market Intelligence","financial trading floor futuristic"],
 ["Planetary","planet observatory terrain"],
 ["Infrastructure","industrial architecture structure"],
 ["Housing","modern housing city environment"],
 ["Geographical","terrain map environment"],
 ["Industrial Metals","industrial refinery mining"]
]

export default function Home(){

 const canvasRef=useRef(null)

 const [items,setItems]=useState([])
 const [active,setActive]=useState(null)
 const [market,setMarket]=useState({
  symbol:"AAPL",
  price:"LIVE",
  region:"United States / California / New York",
  sector:"Technology"
 })

 async function scan(q){

  const r=await fetch(
   `https://api.sketchfab.com/v3/search?type=models&q=${encodeURIComponent(q)}&sort_by=-likeCount`,
   {
    headers:{
     Authorization:`Token ${SKETCHFAB_TOKEN}`
    }
   }
  )

  const d=await r.json()

  const list=(d.results||[])
   .filter(x=>x.uid&&x.name)
   .slice(0,12)

  setItems(list)

  if(list[0]){
   setActive(list[0])
  }

 }

 useEffect(()=>{

  scan("futuristic trading floor")

  async function startBabylon(){

   const BABYLON=await import("@babylonjs/core")

   const canvas=canvasRef.current

   const engine=new BABYLON.Engine(canvas,true)

   const scene=new BABYLON.Scene(engine)

   scene.clearColor=
    new BABYLON.Color4(
      0.01,
      0.02,
      0.08,
      1
    )

   const camera=
    new BABYLON.ArcRotateCamera(
      "cam",
      Math.PI/2,
      Math.PI/2.3,
      8,
      BABYLON.Vector3.Zero(),
      scene
    )

   camera.attachControl(canvas,true)

   const light=
    new BABYLON.HemisphericLight(
      "light",
      new BABYLON.Vector3(0,1,0),
      scene
    )

   const sphere=
    BABYLON.MeshBuilder.CreateSphere(
      "orb",
      {
       diameter:2.6
      },
      scene
    )

   const mat=
    new BABYLON.StandardMaterial(
      "mat",
      scene
    )

   mat.emissiveColor=
    new BABYLON.Color3(
      0.1,
      0.6,
      1
    )

   sphere.material=mat

   engine.runRenderLoop(()=>{
    sphere.rotation.y+=0.004
    sphere.rotation.x+=0.001
    scene.render()
   })

   window.addEventListener(
    "resize",
    ()=>engine.resize()
   )

  }

  startBabylon()

 },[])

 return (

 <main>

 <style>{`

 body{
  margin:0;
  background:#020617;
  color:white;
  font-family:Arial,sans-serif;
 }

 main{
  min-height:100vh;
 }

 .hero{
  padding:40px 24px;
 }

 h1{
  font-size:clamp(
   58px,
   11vw,
   140px
  );

  line-height:.88;

  margin:0 0 20px;

  letter-spacing:-5px;
 }

 p{
  color:#cbd5e1;
  line-height:1.6;
  font-size:20px;
 }

 .market{
  background:
   linear-gradient(
    145deg,
    rgba(15,23,42,.95),
    rgba(2,6,23,.98)
   );

  border:1px solid #334155;

  border-radius:28px;

  padding:24px;

  margin-top:30px;
 }

 .market h2{
  margin:0 0 12px;
 }

 .marketGrid{
  display:grid;

  grid-template-columns:
   repeat(auto-fit,minmax(220px,1fr));

  gap:16px;
 }

 .metric{
  background:#0f172a;
  border:1px solid #334155;
  border-radius:20px;
  padding:18px;
 }

 .metric b{
  display:block;
  font-size:28px;
  margin-bottom:8px;
 }

 .canvasWrap{
  padding:0 24px 30px;
 }

 canvas{
  width:100%;
  height:58vh;
  border-radius:30px;
  border:1px solid #334155;
  display:block;
 }

 .cats{
  display:flex;
  overflow:auto;
  gap:12px;
  padding:0 24px 24px;
 }

 .cats button{
  white-space:nowrap;
 }

 button{
  background:
   linear-gradient(
    135deg,
    #2563eb,
    #7c3aed
   );

  color:white;

  border:0;

  border-radius:16px;

  padding:14px 18px;

  font-weight:900;
 }

 .viewer{
  padding:0 24px 24px;
 }

 iframe{
  width:100%;
  height:60vh;
  border:0;
  border-radius:28px;
  background:#000;
 }

 .cards{
  display:grid;

  grid-template-columns:
   repeat(auto-fit,minmax(280px,1fr));

  gap:20px;

  padding:0 24px 60px;
 }

 .card{
  background:#0f172a;

  border:1px solid #334155;

  border-radius:28px;

  overflow:hidden;

  color:white;

  padding:0;

  text-align:left;
 }

 .card img{
  width:100%;
  height:220px;
  object-fit:cover;
 }

 .card b{
  display:block;
  padding:18px;
  font-size:26px;
 }

 `}</style>

 <section className="hero">

  <h1>
   Observatory
   <br/>
   Market Intelligence
  </h1>

  <p>
   Real-time AI-native observatory runtime
   combining holographic trading systems,
   planetary infrastructure intelligence,
   housing market observatory analysis,
   industrial metals mapping,
   architectural overlays,
   and immersive 360 presence.
  </p>

  <div className="market">

   <h2>Live Observatory Signal</h2>

   <div className="marketGrid">

    <div className="metric">
     <b>{market.symbol}</b>
     <span>Primary Signal</span>
    </div>

    <div className="metric">
     <b>{market.region}</b>
     <span>Mapped Region</span>
    </div>

    <div className="metric">
     <b>{market.sector}</b>
     <span>Economic Sector</span>
    </div>

    <div className="metric">
     <b>Volume Spike</b>
     <span>Realtime Detection</span>
    </div>

    <div className="metric">
     <b>MACD + MA</b>
     <span>Technical Observatory</span>
    </div>

    <div className="metric">
     <b>Housing Pressure</b>
     <span>Infrastructure Mapping</span>
    </div>

   </div>

  </div>

 </section>

 <section className="canvasWrap">

  <canvas ref={canvasRef}/>

 </section>

 <section className="cats">

  {CATS.map(([name,q])=>

   <button
    key={name}
    onClick={()=>scan(q)}
   >
    {name}
   </button>

  )}

 </section>

 {active&&

 <section className="viewer">

  <iframe
   src={`https://sketchfab.com/models/${active.uid}/embed?autostart=1&ui_infos=0`}
   allow="
    autoplay;
    fullscreen;
    xr-spatial-tracking
   "
   allowFullScreen
  />

 </section>

 }

 <section className="cards">

  {items.map(x=>

   <button
    key={x.uid}
    className="card"
    onClick={()=>setActive(x)}
   >

    <img
      src={
       x.thumbnails?.images?.at(-1)?.url
      }
    />

    <b>{x.name}</b>

   </button>

  )}

 </section>

 </main>

 )

}
