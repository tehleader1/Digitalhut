"use client"

import { useEffect, useState } from "react"
import platform from "../../data/platform-libraries.json"

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
   <h1 style={title}>Preloaded markets, environments, structures, and planetary assets.</h1>
   <p style={lede}>The library now keeps stocked shelves for agents: market profiles from Polygon/FMP/Alpha Vantage context, global Cesium-style environments, Sketchfab model searches, structures, and planetary asset feeds.</p>
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

  <Catalog title="Market Profiles" items={platform.marketProfiles} type="market" />
  <Catalog title="Global Environments" items={platform.environmentLibrary} />
  <Catalog title="Structures" items={platform.structureLibrary} />
  <Catalog title="Planetary Assets" items={platform.planetaryAssets} />

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

function Catalog({ title, items, type }) {
 return <section style={catalogBand}>
  <h2 style={sectionTitle}>{title}</h2>
  <div style={grid}>
   {items.map((item)=><article key={item.title} style={card}>
    <span style={pill}>{item.category || "market profile"}</span>
    <h3 style={cardTitle}>{item.title}</h3>
    <p style={copy}>{type === "market" ? item.agentUse : item.query}</p>
    {item.symbols ? <div style={unlockGrid}>{item.symbols.map(symbol=><a key={symbol} href={`/market-intelligence?symbol=${symbol}`} style={miniLink}>{symbol}</a>)}</div> : <a href={`/?query=${encodeURIComponent(item.query)}`} style={open}>Open feed</a>}
   </article>)}
  </div>
 </section>
}

const shell={minHeight:"100vh",padding:28,background:"linear-gradient(135deg,#06111f,#020617 45%,#12231f)",color:"white",fontFamily:"Arial, sans-serif"}
const back={color:"#67e8f9",fontWeight:900,textDecoration:"none"}
const hero={maxWidth:1180,margin:"28px auto 20px"}
const eyebrow={fontSize:12,textTransform:"uppercase",letterSpacing:0,fontWeight:900,color:"#67e8f9"}
const title={fontSize:"clamp(42px,7vw,74px)",lineHeight:.96,margin:"10px 0 16px",letterSpacing:0,maxWidth:980}
const lede={fontSize:18,lineHeight:1.55,color:"#dbeafe",maxWidth:900}
const controls={display:"flex",gap:10,flexWrap:"wrap",marginTop:16}
const select={padding:13,borderRadius:8,border:"1px solid rgba(226,232,240,.24)",background:"#020617",color:"white",fontWeight:900}
const catalogBand={maxWidth:1180,margin:"20px auto"}
const grid={maxWidth:1180,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,240px),1fr))",gap:16}
const card={border:"1px solid rgba(148,163,184,.24)",borderRadius:8,background:"rgba(15,23,42,.72)",padding:18,display:"grid",gap:10,minWidth:0}
const pill={fontSize:12,padding:"7px 10px",borderRadius:999,background:"rgba(103,232,249,.12)",color:"#a5f3fc",fontWeight:900,width:"fit-content",textTransform:"capitalize"}
const cardTitle={fontSize:25,lineHeight:1.08,margin:0,letterSpacing:0,overflowWrap:"anywhere"}
const copy={color:"#cbd5e1",lineHeight:1.5,overflowWrap:"anywhere"}
const open={padding:"11px 12px",borderRadius:8,background:"#14b8a6",color:"#021014",fontWeight:900,textDecoration:"none",textAlign:"center"}
const unlockBand={maxWidth:1180,margin:"20px auto 0",border:"1px solid rgba(148,163,184,.24)",borderRadius:8,background:"rgba(2,6,23,.5)",padding:18}
const sectionTitle={fontSize:28,margin:"0 0 12px",textTransform:"capitalize"}
const unlockGrid={display:"flex",gap:8,flexWrap:"wrap"}
const unlock={padding:"8px 10px",borderRadius:999,background:"rgba(255,255,255,.08)",color:"#e0f2fe",fontWeight:800,fontSize:13}
const miniLink={padding:"8px 10px",borderRadius:999,background:"rgba(20,184,166,.16)",color:"#a7f3d0",fontWeight:900,fontSize:13,textDecoration:"none"}
