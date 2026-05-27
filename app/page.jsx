"use client"

import {useEffect,useState} from "react"

const TOKEN="137a2704a95d4051b5ffe795b90d92ce"

export default function Home(){
 const [q,setQ]=useState("structure environment map planetary")
 const [items,setItems]=useState([])
 const [active,setActive]=useState(null)

 async function scan(seed=q){
  const r=await fetch(
   `https://api.sketchfab.com/v3/search?type=models&q=${encodeURIComponent(seed+" structure environment map terrain planet architecture")}&sort_by=-likeCount`,
   {headers:{Authorization:`Token ${TOKEN}`}}
  )
  const d=await r.json()
  const list=(d.results||[]).slice(0,12)
  setItems(list)
  setActive(list[0]||null)
 }

 useEffect(()=>{scan()},[])

 return <main>
  <style>{`
   body{margin:0;background:#020617;color:white;font-family:Arial,sans-serif}
   main{max-width:1100px;margin:auto;padding:18px}
   .hero,.viewer{background:#0f172a;border:1px solid #334155;border-radius:28px;padding:22px;margin:18px 0}
   h1{font-size:52px;line-height:.95;margin:0 0 16px}
   p{color:#cbd5e1;font-size:18px;line-height:1.5}
   textarea{width:100%;min-height:80px;background:#020617;color:white;border:1px solid #334155;border-radius:16px;padding:14px;font-size:16px}
   button{background:#2563eb;color:white;border:0;border-radius:14px;padding:12px 15px;font-weight:900;margin:6px}
   iframe{width:100%;height:560px;border:0;border-radius:22px;background:#000}
   .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px}
   .card{background:#111827;border:1px solid #334155;border-radius:22px;overflow:hidden;text-align:left;padding:0}
   .card img{width:100%;height:160px;object-fit:cover}
   .card b{display:block;color:white;padding:14px;font-size:20px}
   @media(max-width:750px){h1{font-size:40px}iframe{height:430px}}
  `}</style>

  <section className="hero">
   <h1>DigitalHut Observatory</h1>
   <p>Live Sketchfab 3D observatory for structures, environments, maps, terrain, and planetary worlds.</p>
   <textarea value={q} onChange={e=>setQ(e.target.value)} />
   <button onClick={()=>scan(q)}>Run Observatory Search</button>
   <button onClick={()=>scan("planetary terrain map")}>Planetary</button>
   <button onClick={()=>scan("city architecture structure")}>Structures</button>
  </section>

  {active&&<section className="viewer">
   <h2>{active.name}</h2>
   <iframe
    src={`https://sketchfab.com/models/${active.uid}/embed?autostart=1&ui_infos=0&ui_controls=1`}
    allow="autoplay; fullscreen; xr-spatial-tracking"
    allowFullScreen
   />
  </section>}

  <section className="cards">
   {items.map(x=><button className="card" key={x.uid} onClick={()=>setActive(x)}>
    <img src={x.thumbnails?.images?.at(-1)?.url}/>
    <b>{x.name}</b>
   </button>)}
  </section>
 </main>
}
