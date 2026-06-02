"use client"

import { useEffect, useState } from "react"

const fallback = {
  mode: "guest-favorites",
  favorites: [
    { title: "Wall Street Market Mirror", query: "wall street new york financial district 3d", category: "financial-district" },
    { title: "Ancient Rome Public Walkthrough", query: "ancient rome colosseum 3d", category: "history" },
    { title: "Moon Terrain Research Feed", query: "moon terrain lava tube 3d", category: "planetary" }
  ],
  unlocks: ["save public feeds", "connect wallet", "unlock premium GLB vault"]
}

export default function Library(){
 const [library,setLibrary]=useState(fallback)
 const [tier,setTier]=useState("free")
 const [intent,setIntent]=useState("anonymous-new-user")

 useEffect(()=>{ load() },[tier,intent])

 async function load(){
  const lastQuery = typeof window !== "undefined" ? window.localStorage.getItem("digitalhut:lastObservatoryQuery") || "" : ""
  const params = new URLSearchParams({tier,intent,lastQuery})
  const res=await fetch(`/api/library-feed?${params.toString()}`,{cache:"no-store"})
  setLibrary(await res.json())
 }

 return <main style={shell}>
  <a href="/" style={back}>Back to DigitalHut</a>
  <section style={hero}>
   <div style={eyebrow}>Observatory Library</div>
   <h1 style={title}>Favorite feeds for guests and members.</h1>
   <p style={lede}>The library now reshapes around the current visitor intent, recent DigitalHut searches, wallet mode, and tier. External app history stays opt-in.</p>
   <div style={controls}>
    <select value={intent} onChange={e=>setIntent(e.target.value)} style={select}>
     <option value="anonymous-new-user">Public visitor</option>
     <option value="crypto-trader">Market visitor</option>
     <option value="tourist">Tourist</option>
     <option value="student">Student</option>
     <option value="researcher">Researcher</option>
     <option value="3d-asset-buyer">3D asset buyer</option>
    </select>
    <select value={tier} onChange={e=>setTier(e.target.value)} style={select}>
     <option value="free">Guest</option>
     <option value="premium">Premium</option>
     <option value="pro">Pro</option>
    </select>
   </div>
  </section>

  <section style={grid}>
   {(library.favorites || []).map(feed=><article key={`${feed.title}-${feed.query}`} style={card}>
    <span style={pill}>{feed.category}</span>
    <h2 style={cardTitle}>{feed.title}</h2>
    <p style={copy}>{feed.query}</p>
    <a href={`/?query=${encodeURIComponent(feed.query)}`} style={open}>Open feed</a>
   </article>)}
  </section>

  <section style={unlockBand}>
   <h2 style={sectionTitle}>{library.mode}</h2>
   <div style={unlockGrid}>{(library.unlocks || []).map(item=><span key={item} style={unlock}>{item}</span>)}</div>
   <p style={copy}>{library.privacy}</p>
  </section>
 </main>
}

const shell={minHeight:"100vh",padding:28,background:"linear-gradient(135deg,#06111f,#020617 45%,#12231f)",color:"white",fontFamily:"Arial, sans-serif"}
const back={color:"#67e8f9",fontWeight:900,textDecoration:"none"}
const hero={maxWidth:1180,margin:"28px auto 20px"}
const eyebrow={fontSize:12,textTransform:"uppercase",letterSpacing:0,fontWeight:900,color:"#67e8f9"}
const title={fontSize:"clamp(42px,7vw,74px)",lineHeight:.96,margin:"10px 0 16px",letterSpacing:0,maxWidth:940}
const lede={fontSize:18,lineHeight:1.55,color:"#dbeafe",maxWidth:860}
const controls={display:"flex",gap:10,flexWrap:"wrap",marginTop:16}
const select={padding:13,borderRadius:8,border:"1px solid rgba(226,232,240,.24)",background:"#020617",color:"white",fontWeight:900}
const grid={maxWidth:1180,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:16}
const card={border:"1px solid rgba(148,163,184,.24)",borderRadius:8,background:"rgba(15,23,42,.72)",padding:18,display:"grid",gap:10}
const pill={fontSize:12,padding:"7px 10px",borderRadius:999,background:"rgba(103,232,249,.12)",color:"#a5f3fc",fontWeight:900,width:"fit-content"}
const cardTitle={fontSize:25,lineHeight:1.08,margin:0,letterSpacing:0}
const copy={color:"#cbd5e1",lineHeight:1.5,overflowWrap:"anywhere"}
const open={padding:"11px 12px",borderRadius:8,background:"#14b8a6",color:"#021014",fontWeight:900,textDecoration:"none",textAlign:"center"}
const unlockBand={maxWidth:1180,margin:"20px auto 0",border:"1px solid rgba(148,163,184,.24)",borderRadius:8,background:"rgba(2,6,23,.5)",padding:18}
const sectionTitle={fontSize:28,margin:"0 0 12px",textTransform:"capitalize"}
const unlockGrid={display:"flex",gap:8,flexWrap:"wrap"}
const unlock={padding:"8px 10px",borderRadius:999,background:"rgba(255,255,255,.08)",color:"#e0f2fe",fontWeight:800,fontSize:13}
