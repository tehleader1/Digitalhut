"use client"

import {useEffect,useState} from "react"

const TOKEN="137a2704a95d4051b5ffe795b90d92ce"

const CATEGORIES=[
 "planetary terrain observatory",
 "historic architecture city",
 "forest coastline environment",
 "space station planet",
 "industrial architecture",
 "museum cultural environment"
]

export default function Home(){

 const[items,setItems]=useState([])
 const[active,setActive]=useState(null)
 const[loading,setLoading]=useState(false)

 async function scan(query){

  setLoading(true)

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
   .slice(0,16)

  setItems(list)

  if(list[0]){
   setActive(list[0])
  }

  setLoading(false)

 }

 useEffect(()=>{
  scan("planetary observatory")
 },[])

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

 nav{
  position:sticky;
  top:0;
  z-index:50;

  display:flex;
  justify-content:space-between;
  align-items:center;

  padding:18px 24px;

  background:rgba(2,6,23,.82);
  backdrop-filter:blur(18px);

  border-bottom:1px solid #1e293b;
 }

 nav b{
  font-size:26px;
 }

 nav button{
  background:linear-gradient(
   135deg,
   #2563eb,
   #7c3aed
  );
  border:0;
  color:white;
  padding:12px 16px;
  border-radius:14px;
  font-weight:900;
 }

 .hero{
  padding:70px 24px 40px;
  max-width:1200px;
  margin:auto;
 }

 h1{
  font-size:82px;
  line-height:.9;
  margin:0 0 24px;
  letter-spacing:-4px;
 }

 .hero p{
  font-size:24px;
  line-height:1.6;
  color:#cbd5e1;
  max-width:900px;
 }

 .categories{
  display:flex;
  gap:12px;
  overflow:auto;
  padding:0 24px 24px;
 }

 .categories button{
  white-space:nowrap;

  background:#0f172a;
  border:1px solid #334155;

  color:white;

  padding:14px 18px;

  border-radius:18px;

  font-weight:700;
 }

 .viewerSection{
  padding:0 24px;
 }

 .viewerCard{
  background:#000;
  border-radius:34px;
  overflow:hidden;
  border:1px solid #334155;
 }

 iframe{
  width:100%;
  height:72vh;
  border:0;
 }

 .viewerInfo{
  padding:24px;
  background:#0f172a;
 }

 .viewerInfo h2{
  margin:0 0 12px;
  font-size:38px;
 }

 .viewerInfo p{
  color:#cbd5e1;
  line-height:1.6;
 }

 .cards{
  display:grid;
  grid-template-columns:
   repeat(auto-fit,minmax(280px,1fr));

  gap:20px;

  padding:30px 24px 70px;
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

 .card:hover{
  transform:translateY(-4px);
 }

 .card img{
  width:100%;
  height:210px;
  object-fit:cover;
 }

 .card b{
  display:block;
  padding:20px;
  font-size:28px;
  line-height:1.15;
 }

 .loading{
  padding:40px;
  text-align:center;
  color:#93c5fd;
 }

 @media(max-width:760px){

  h1{
   font-size:54px;
  }

  .hero p{
   font-size:18px;
  }

  iframe{
   height:52vh;
  }

 }

 `}</style>

 <nav>

  <b>DigitalHut Observatory</b>

  <button>
   SearchAtlas OTTO Active
  </button>

 </nav>

 <section className="hero">

  <h1>
   Explore Live 3D Worlds
  </h1>

  <p>
   AI-native observatory infrastructure for
   immersive environment discovery,
   planetary exploration,
   architecture scanning,
   and internet-fed 3D research systems.
  </p>

 </section>

 <section className="categories">

  {CATEGORIES.map(q=>

   <button
    key={q}
    onClick={()=>scan(q)}
   >
    {q}
   </button>

  )}

 </section>

 <section className="viewerSection">

  {active&&

   <div className="viewerCard">

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

    <div className="viewerInfo">

     <h2>{active.name}</h2>

     <p>
      {active.description || "Live observatory signal."}
     </p>

    </div>

   </div>

  }

 </section>

 {loading&&

  <div className="loading">
   Scanning live observatory feeds...
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
}
