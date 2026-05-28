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

 const [query,setQuery]=useState(
  "terrain environment architecture"
 )

 async function scan(q){

  setQuery(q)

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
  scan(query)
 },[])

 function speak(){

  if(!active)return

  speechSynthesis.cancel()

  const text=`

   Observatory signal detected.

   ${active.name}.

   Environment layer:
   ${
    active.categories
    ?.map(c=>c.name)
    ?.join(", ")
    || "environment"
   }.

   Featured architect or uploader:
   ${
    active.user?.displayName
    || active.user?.username
    || "Unknown"
   }.

   Observatory routing:
   terrain,
   geographical,
   structural,
   environmental mapping active.

   Description:
   ${
    active.description
    ?.replace(/<[^>]*>/g,"")
    ?.slice(0,400)
    || "No description available."
   }

  `

  const u=
   new SpeechSynthesisUtterance(text)

  u.rate=.92

  speechSynthesis.speak(u)

 }

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

 .search{
  display:flex;
  gap:12px;
  flex-wrap:wrap;
  margin-top:24px;
 }

 input{
  flex:1;
  min-width:220px;
  background:#020617;
  color:white;
  border:1px solid #334155;
  border-radius:18px;
  padding:16px;
  font-size:18px;
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

 .info{
  background:#0f172a;
  border:1px solid #334155;
  border-radius:28px;
  padding:24px;
  margin-bottom:28px;
 }

 .info h2{
  margin-top:0;
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
    Terrain,
    planetary,
    geographical,
    structure,
    environmental,
    architectural,
    and infrastructure observatory runtime
    powered by live Sketchfab discovery,
    observatory voice intelligence,
    SearchAtlas systems,
    wallet access,
    and immersive 360 exploration.
   </p>

   <div className="search">

    <input
     value={query}
     onChange={e=>setQuery(e.target.value)}
     placeholder="
      Search:
      terrain,
      architecture,
      planet,
      geography,
      city,
      observatory
     "
    />

    <button onClick={()=>{
      scan(query)
    }}>
      Run Observatory Signal
    </button>

    <button onClick={speak}>
      Voice Observatory
    </button>

   </div>

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

   <section className="info">

    <h2>{active.name}</h2>

    <p>
     <b>Environment:</b>
     {" "}
     {
      active.categories
      ?.map(c=>c.name)
      ?.join(", ")
     }
    </p>

    <p>
     <b>Architect / Uploader:</b>
     {" "}
     {
      active.user?.displayName
      || active.user?.username
      || "Unknown"
     }
    </p>

    <p>
     <b>Observatory Routing:</b>
     {" "}
     terrain,
     geography,
     environment,
     infrastructure,
     structural intelligence
    </p>

    <p>
     <b>Description:</b>
     {" "}
     {
      active.description
      ?.replace(/<[^>]*>/g,"")
      ?.slice(0,500)
      || "No description available."
     }
    </p>

   </section>

  }

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
