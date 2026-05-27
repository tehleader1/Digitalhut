"use client"

import { useEffect, useState } from "react"

const TOKEN="137a2704a95d4051b5ffe795b90d92ce"

const CATEGORIES=[
 "planetary terrain",
 "historic architecture",
 "space station",
 "city environment",
 "museum world",
 "industrial terrain"
]

export default function Home(){

 const [items,setItems]=useState([])
 const [active,setActive]=useState(null)
 const [loading,setLoading]=useState(false)

 async function scan(q){

  setLoading(true)

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
   .filter(x=>x.uid && x.name)
   .slice(0,12)

  setItems(list)

  if(list[0]){
   setActive(list[0])
  }

  setLoading(false)

 }

 useEffect(()=>{
  scan("planetary terrain")
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
  width:100%;
 }

 .hero{
  padding:28px 20px;
  background:#020617;
 }

 h1{
  font-size:58px;
  line-height:.9;
  margin:0 0 20px;
  letter-spacing:-3px;
 }

 p{
  color:#cbd5e1;
  line-height:1.6;
  font-size:19px;
 }

 .categoryBar{
  display:flex;
  gap:12px;
  overflow:auto;
  padding:0 20px 20px;
 }

 .categoryBar button{
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
  font-size:16px;
 }

 .viewer{
  padding:0 20px;
 }

 iframe{
  width:100%;
  height:52vh;
  border:0;
  border-radius:28px;
  background:#000;
 }

 .viewerInfo{
  padding:18px 0 30px;
 }

 .viewerInfo h2{
  font-size:36px;
  margin:0 0 12px;
 }

 .cards{
  display:grid;
  grid-template-columns:1fr;
  gap:20px;
  padding:0 20px 60px;
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
  font-size:28px;
  line-height:1.15;
 }

 .loading{
  padding:20px;
  color:#93c5fd;
 }

 @media(min-width:900px){

  .cards{
   grid-template-columns:
    repeat(3,1fr);
  }

  iframe{
   height:70vh;
  }

  h1{
   font-size:86px;
  }

 }

 `}</style>

 <section className="hero">

  <h1>
   DigitalHut Observatory
  </h1>

  <p>
   AI-native cinematic observatory for
   planetary terrain,
   architecture scanning,
   immersive environments,
   and live Sketchfab exploration.
  </p>

 </section>

 <section className="categoryBar">

  {CATEGORIES.map(x=>

   <button
    key={x}
    onClick={()=>scan(x)}
   >
    {x}
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

  <div className="viewerInfo">

   <h2>{active.name}</h2>

   <p>
    {active.description || "Live observatory signal"}
   </p>

  </div>

 </section>

 }

 {loading&&

  <div className="loading">
   Scanning observatory feeds...
  </div>

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
