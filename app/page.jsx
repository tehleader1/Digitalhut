"use client"

import {useEffect,useState} from "react"

const TOKEN="137a2704a95d4051b5ffe795b90d92ce"

const good=[
 "environment","terrain","city","architecture",
 "map","landscape","space","planet","coast",
 "forest","building","observatory","museum",
 "historic","industrial","street","structure"
]

function score(x){
 const text=((x.name||"")+" "+(x.description||"")).toLowerCase()
 let s=0
 good.forEach(w=>{if(text.includes(w))s+=8})
 return s
}

function clean(t=""){
 return t
 .replace(/<[^>]*>/g,"")
 .replace(/\s+/g," ")
 .trim()
 .slice(0,240)
}

export default function Home(){

 const[q,setQ]=useState("planetary observatory")
 const[items,setItems]=useState([])
 const[active,setActive]=useState(null)
 const[auto,setAuto]=useState(true)

 async function scan(seed=q){

  const r=await fetch(
   `https://api.sketchfab.com/v3/search?type=models&q=${encodeURIComponent(seed)}&sort_by=-likeCount`,
   {
    headers:{
     Authorization:`Token ${TOKEN}`
    }
   }
  )

  const d=await r.json()

  const list=(d.results||[])
   .sort((a,b)=>score(b)-score(a))
   .slice(0,12)

  setItems(list)

  if(list[0])setActive(list[0])

 }

 useEffect(()=>{
  scan("environment structure map planetary")
 },[])

 useEffect(()=>{

  if(!auto || items.length===0)return

  const i=setInterval(()=>{

   setActive(prev=>{

    const current=
      items.findIndex(x=>x.uid===prev?.uid)

    const next=
      (current+1)%items.length

    return items[next]

   })

  },7000)

  return()=>clearInterval(i)

 },[items,auto])

 return <main>

 <style>{`

 body{
  margin:0;
  background:#020617;
  color:white;
  font-family:Arial,sans-serif;
  overflow:hidden;
 }

 .bg{
  position:fixed;
  inset:0;
  background-image:url(${active?.thumbnails?.images?.at(-1)?.url||""});
  background-size:cover;
  background-position:center;
  filter:blur(18px) brightness(.35);
  transform:scale(1.12);
 }

 .overlay{
  position:fixed;
  inset:0;
  background:
   linear-gradient(
    to bottom,
    rgba(2,6,23,.6),
    rgba(2,6,23,.92)
   );
 }

 main{
  position:relative;
  z-index:2;
  height:100vh;
  overflow:auto;
 }

 .hero{
  margin:28px;
  padding:28px;
  border-radius:34px;
  background:rgba(15,23,42,.65);
  backdrop-filter:blur(24px);
  border:1px solid rgba(148,163,184,.18);
 }

 h1{
  font-size:68px;
  line-height:.92;
  margin:0 0 18px;
  letter-spacing:-3px;
 }

 p{
  color:#cbd5e1;
  line-height:1.6;
  font-size:21px;
 }

 iframe{
  width:100%;
  height:58vh;
  border:0;
  border-radius:28px;
  background:#000;
 }

 .viewer{
  margin:0 28px 28px;
 }

 .cards{
  display:flex;
  gap:18px;
  overflow:auto;
  padding:0 28px 50px;
 }

 .card{
  min-width:290px;
  background:#0f172a;
  border:2px solid transparent;
  border-radius:28px;
  overflow:hidden;
  color:white;
  padding:0;
 }

 .active{
  border:2px solid #2563eb;
  box-shadow:0 0 30px rgba(37,99,235,.4);
 }

 .card img{
  width:100%;
  height:190px;
  object-fit:cover;
 }

 .card b{
  display:block;
  padding:18px;
  font-size:28px;
  line-height:1.15;
 }

 .topbar{
  display:flex;
  gap:10px;
  flex-wrap:wrap;
  margin-top:22px;
 }

 button{
  background:linear-gradient(135deg,#2563eb,#7c3aed);
  color:white;
  border:0;
  border-radius:15px;
  padding:13px 16px;
  font-weight:900;
 }

 textarea{
  width:100%;
  min-height:80px;
  background:#020617;
  color:white;
  border:1px solid #334155;
  border-radius:18px;
  padding:14px;
  font-size:17px;
  margin-top:20px;
 }

 .signal{
  margin-top:18px;
  color:#22c55e;
  font-weight:700;
 }

 @media(max-width:750px){

  h1{
   font-size:52px;
  }

  p{
   font-size:18px;
  }

  iframe{
   height:45vh;
  }

 }

 `}</style>

 <div className="bg"/>
 <div className="overlay"/>

 <section className="hero">

  <h1>
   DigitalHut Observatory
  </h1>

  <p>
   AI-native observatory runtime with BabylonJS,
   Sketchfab discovery, SearchAtlas intelligence,
   environment-fed exploration systems,
   and cinematic 3D world navigation.
  </p>

  <textarea
   value={q}
   onChange={e=>setQ(e.target.value)}
  />

  <div className="topbar">

   <button onClick={()=>scan(q)}>
    Run Observatory Signal
   </button>

   <button onClick={()=>scan("planetary terrain observatory")}>
    Planetary
   </button>

   <button onClick={()=>scan("historic architecture city")}>
    Cities
   </button>

   <button onClick={()=>scan("forest coastline landscape")}>
    Nature
   </button>

   <button onClick={()=>setAuto(!auto)}>
    {auto?"Auto Rotate ON":"Auto Rotate OFF"}
   </button>

  </div>

  <div className="signal">
   Active Signal:
   {" "}
   {active?.name||"loading..."}
  </div>

 </section>

 {active&&<section className="viewer">

  <iframe
   src={`https://sketchfab.com/models/${active.uid}/embed`}
   allow="autoplay; fullscreen; xr-spatial-tracking"
  />

  <p>
   {clean(active.description||"")}
  </p>

 </section>}

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
     src={x.thumbnails?.images?.at(-1)?.url}
    />

    <b>{x.name}</b>

   </button>

  )}

 </section>

 </main>
}
