"use client"

import {useEffect,useState} from "react"

const TOKEN="137a2704a95d4051b5ffe795b90d92ce"

const QUERIES=[
 "planetary terrain observatory",
 "historic architecture city",
 "forest coastline environment",
 "futuristic megastructure",
 "museum cultural environment",
 "space station planet",
 "industrial architecture"
]

export default function Home(){

 const[items,setItems]=useState([])
 const[active,setActive]=useState(null)
 const[auto,setAuto]=useState(true)

 async function scan(query){

  const r=await fetch(
   `https://api.sketchfab.com/v3/search?type=models&q=${encodeURIComponent(query)}&sort_by=-likeCount`,
   {
    headers:{
     Authorization:`Token ${TOKEN}`
    }
   }
  )

  const d=await r.json()

  const list=(d.results||[])
   .filter(x=>x.uid && x.name)
   .slice(0,14)

  setItems(list)

  if(list[0]){
   setActive(list[0])
  }

 }

 useEffect(()=>{
  scan("planetary observatory")
 },[])

 useEffect(()=>{

  if(!auto || items.length===0)return

  const i=setInterval(()=>{

   setActive(prev=>{

    const current=
      items.findIndex(
       x=>x.uid===prev?.uid
      )

    return items[
      (current+1)%items.length
    ]

   })

  },10000)

  return()=>clearInterval(i)

 },[items,auto])

 return <main>

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

 .viewerWrap{
  position:relative;
  width:100%;
  height:72vh;
  background:#000;
  overflow:hidden;
 }

 iframe{
  width:100%;
  height:100%;
  border:0;
 }

 .hud{
  position:absolute;
  top:20px;
  left:20px;
  right:20px;

  background:
   linear-gradient(
    145deg,
    rgba(15,23,42,.82),
    rgba(2,6,23,.92)
   );

  backdrop-filter:blur(22px);

  border:1px solid rgba(148,163,184,.18);

  border-radius:30px;

  padding:28px;

  max-width:720px;
 }

 h1{
  font-size:72px;
  line-height:.9;
  margin:0 0 20px;
  letter-spacing:-4px;
 }

 p{
  color:#cbd5e1;
  line-height:1.6;
  font-size:20px;
 }

 .controls{
  display:flex;
  flex-wrap:wrap;
  gap:10px;
  margin-top:22px;
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
  padding:13px 16px;
  font-weight:900;
 }

 .signal{
  margin-top:18px;
  color:#22c55e;
  font-weight:700;
 }

 .cards{
  display:flex;
  overflow:auto;
  gap:18px;
  padding:24px;
  background:#020617;
 }

 .card{
  min-width:300px;
  background:#0f172a;
  border:2px solid transparent;
  border-radius:28px;
  overflow:hidden;
  color:white;
  padding:0;
 }

 .active{
  border:2px solid #2563eb;
  box-shadow:0 0 30px rgba(37,99,235,.45);
 }

 .card img{
  width:100%;
  height:190px;
  object-fit:cover;
 }

 .card b{
  display:block;
  padding:20px;
  font-size:28px;
  line-height:1.15;
 }

 @media(max-width:760px){

  h1{
   font-size:50px;
  }

  p{
   font-size:18px;
  }

  .viewerWrap{
   height:56vh;
  }

 }

 `}</style>

 <section className="viewerWrap">

  {active&&

   <iframe
    src={
      `https://sketchfab.com/models/${active.uid}/embed?autostart=1&ui_infos=0`
    }
    allow="
      autoplay;
      fullscreen;
      xr-spatial-tracking
    "
    allowFullScreen
   />

  }

  <div className="hud">

   <h1>
    DigitalHut Observatory
   </h1>

   <p>
    AI-native cinematic observatory runtime with
    live Sketchfab world exploration,
    SearchAtlas OTTO intelligence,
    planetary environment discovery,
    architecture scanning,
    and immersive research systems.
   </p>

   <div className="controls">

    {QUERIES.map(q=>

      <button
       key={q}
       onClick={()=>scan(q)}
      >
       {q}
      </button>

    )}

    <button
      onClick={()=>setAuto(!auto)}
    >
      {auto
        ? "Auto Rotate ON"
        : "Auto Rotate OFF"
      }
    </button>

   </div>

   <div className="signal">
    Active Signal:
    {" "}
    {active?.name||"loading..."}
   </div>

  </div>

 </section>

 <section className="cards">

  {items.map(x=>

   <button
    key={x.uid}
    className={
      x.uid===active?.uid
      ? "card active"
      : "card"
    }
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
}
