"use client"

import {useEffect,useState} from "react"

const TOKEN="137a2704a95d4051b5ffe795b90d92ce"

const LIBRARIES=[
 ["Terrain","terrain landscape environment"],
 ["Planetary","planet observatory terrain"],
 ["Geographical","geography earth terrain"],
 ["Structures","architecture building city"],
 ["Infrastructure","industrial infrastructure"],
 ["Maps","map terrain city"],
 ["Observatory Market Intelligence","market intelligence trading observatory"],
 ["Observatory Market Intelligence","market intelligence trading observatory"]
]

const GOOD=[
 "environment",
 "terrain",
 "architecture",
 "planet",
 "map",
 "city",
 "building",
 "industrial",
 "landscape",
 "observatory",
 "museum",
 "infrastructure",
 "coast",
 "forest",
 "mountain",
 "space",
 "geography"
]

const BAD=[
 "character",
 "avatar",
 "human",
 "anime",
 "weapon",
 "soldier",
 "monster",
 "creature",
 "cartoon",
 "girl",
 "boy"
]

function score(x){

 const t=(
  (x.name||"")+" "+
  (x.description||"")+" "+
  (x.categories||[])
   .map(c=>c.name)
   .join(" ")
 ).toLowerCase()

 let s=0

 GOOD.forEach(w=>{
  if(t.includes(w)) s+=8
 })

 BAD.forEach(w=>{
  if(t.includes(w)) s-=100
 })

 return s
}

export default function Home(){

 const [items,setItems]=useState([])
 const [active,setActive]=useState(null)

 async function scan(q){

  const r=await fetch(
   `https://api.sketchfab.com/v3/search?type=models&q=${encodeURIComponent(q)}&sort_by=-likeCount`,
   {
    headers:{
     Authorization:`Token ${TOKEN}`
    }
   }
  )

  const d=await r.json()

  const list=(d.results||[])
   .filter(x=>score(x)>0)
   .slice(0,12)

  setItems(list)

  if(list[0]){
   setActive(list[0])
  }

 }

 useEffect(()=>{
  scan("terrain environment architecture")
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

 .wrap{
  max-width:1400px;
  margin:auto;
  padding:24px;
 }

 h1{
  font-size:clamp(60px,11vw,140px);
  line-height:.88;
  letter-spacing:-5px;
  margin:0 0 24px;
 }

 p{
  color:#cbd5e1;
  line-height:1.6;
  font-size:22px;
 }

 .hero{
  background:
   linear-gradient(
    145deg,
    rgba(15,23,42,.96),
    rgba(2,6,23,.99)
   );

  border:1px solid #334155;

  border-radius:36px;

  padding:34px;

  margin-bottom:24px;
 }

 .viewer{
  border-radius:36px;
  overflow:hidden;
  border:1px solid #334155;
  margin-bottom:28px;
 }

 iframe{
  width:100%;
  height:68vh;
  border:0;
  background:black;
 }

 .libs{
  display:grid;
  grid-template-columns:
   repeat(auto-fit,minmax(240px,1fr));

  gap:18px;

  margin-bottom:28px;
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

  border-radius:22px;

  padding:18px;

  font-weight:900;

  font-size:17px;
 }

 .cards{
  display:grid;

  grid-template-columns:
   repeat(auto-fit,minmax(280px,1fr));

  gap:20px;
 }

 .card{
  background:#0f172a;

  border:1px solid #334155;

  border-radius:30px;

  overflow:hidden;

  padding:0;

  text-align:left;
 }

 .card img{
  width:100%;
  height:230px;
  object-fit:cover;
 }

 .card b{
  display:block;
  padding:18px;
  font-size:28px;
 }

 .marketBox{
  background:#111827;
  border:1px solid #334155;
  border-radius:30px;
  padding:30px;
 }

 .marketBox h2{
  font-size:44px;
  margin-top:0;
 }

 .marketGrid{
  display:grid;
  grid-template-columns:
   repeat(auto-fit,minmax(220px,1fr));
  gap:16px;
 }

 .metric{
  background:#020617;
  border:1px solid #334155;
  border-radius:22px;
  padding:18px;
 }

 .metric b{
  display:block;
  font-size:34px;
  margin-bottom:10px;
 }

 `}</style>

 <div className="wrap">

  <section className="hero">

   <h1>
    DigitalHut
    <br/>
    Observatory
   </h1>

   <p>
    AI-native observatory runtime for
    terrain exploration,
    planetary systems,
    geographical intelligence,
    structures,
    infrastructure overlays,
    industrial environments,
    and immersive 360 discovery.
   </p>

  </section>

  <section className="libs">

   {LIBRARIES.map(([name,q])=>

    <button
     key={name}
     onClick={()=>{

      if(name==="Observatory Market Intelligence"){
       window.location.href="/market-intelligence"
       return
      }

      scan(q)

     }}
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

 </div>

 </main>

 )

}
