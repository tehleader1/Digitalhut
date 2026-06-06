"use client"

import {useRef, useState} from "react"
import DiscoveryEvidenceTrail from "../../components/DiscoveryEvidenceTrail"
import DiscoverySnapshotVisual from "../../components/DiscoverySnapshotVisual"
import UniversalFeedVisual from "../../components/UniversalFeedVisual"

const lanes = [
 {title:"Client Multi-GLB Intake",query:"client warehouse training",category:"workforce",clientType:"12 GLB client",marketSymbols:["SPY","AMZN"],previewImage:"https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",agentNarration:"A client has twelve GLBs. DigitalHut should normalize the files into activeFeed objects, render previews, store snapshots, and distribute each discovery to the library, blog, examples, and history."},
 {title:"Alaska Igloo Prototype",query:"alaska igloo",category:"global environment",clientType:"observatory visual",marketSymbols:["HD","LOW"],previewImage:"https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80",agentNarration:"New discovery detected: Alaska igloo. This should become a reusable visual object with a renderer snapshot, library card, example preview, blog draft, and recent activity record."},
 {title:"Canada Mountains Prototype",query:"canada mountains",category:"travel and geography",clientType:"terrain renderer",marketSymbols:["SPY","AMZN"],previewImage:"https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",agentNarration:"Canada mountains should search as plain words, render as a real-world environment, and feed the observatory without project suffixes."},
 {title:"NVDA Market Prototype",query:"NVDA Nvidia",category:"market",clientType:"market renderer",marketSymbols:["NVDA","AAPL","SPY"],previewImage:"https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=1200&q=80",agentNarration:"Market renderer should preload symbol plus company name, candles, technicals, provider status, and a fallback visual until live bars confirm."},
 {title:"Fiji Bungalow Prototype",query:"fiji bungalow",category:"real estate environment",clientType:"library card",marketSymbols:["HD","LOW"],previewImage:"https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80",agentNarration:"Fiji bungalow should prove the library can show real-world image cards before the user opens a renderer or snapshot."}
]

function feed(item){
 return {
  id:`prototype:${item.query}`,
  source:"special-prototype-center",
  terrainUrl:"",
  visualMode:item.category==="market"?"market":"auto",
  surfaces:["observatory renderer","market renderer","main blog feature","library card","live examples","runner history"],
  ...item
 }
}

export default function PrototypeCenter(){
 const [active,setActive]=useState(()=>feed(lanes[0]))
 const rendererRef=useRef(null)
 function choose(item){
  const next=feed(item)
  setActive(next)
  if(typeof window!=="undefined") {
   window.localStorage.setItem("digitalhut:lastObservatoryQuery", next.query)
   setTimeout(()=>rendererRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),40)
  }
 }
 const marketHref=`/market-intelligence?symbol=${encodeURIComponent(active.marketSymbols?.[0] || "NVDA")}#market-renderer`
 const observatoryHref=`/?query=${encodeURIComponent(active.query)}#observatory-renderer`

 return <main style={shell}>
  <section style={hero}>
   <div>
    <p style={eyebrow}>Special Prototype Center</p>
    <h1 style={title}>{active.title}</h1>
    <p style={lede}>{active.agentNarration}</p>
    <div style={actions}>
     <a href={observatoryHref} style={primary}>Open Observatory</a>
     <a href={marketHref} style={secondary}>Open Market</a>
     <a href="/library" style={secondary}>Open Library</a>
    </div>
   </div>
   <DiscoverySnapshotVisual feed={active} scope="prototype packet"/>
  </section>

  <section id="prototype-renderer" ref={rendererRef} style={renderer}>
   <UniversalFeedVisual activeFeed={active} scope="prototype-center"/>
  </section>

  <section style={grid}>
   {lanes.map((item)=><button key={item.query} onClick={()=>choose(item)} style={active.query===item.query?activeCard:card}>
    <DiscoverySnapshotVisual feed={feed(item)} compact scope="prototype"/>
    <span style={cardTitle}>{item.title}</span>
    <small style={muted}>{item.query}</small>
   </button>)}
  </section>

  <section style={gridTwo}>
   <DiscoveryEvidenceTrail feed={active} title="Runner handoff packet"/>
   <article style={panel}>
    <p style={eyebrow}>Distribution target</p>
    <h2 style={h2}>Every prototype leaves evidence</h2>
    <p style={muted}>Snapshot capture should feed the main blog feature, library visual, examples preview, observatory renderer, market renderer when symbols exist, quick recent activity, SEO brief, and backend runner history.</p>
    <div style={chips}>{active.surfaces.map((item)=><span key={item} style={chip}>{item}</span>)}</div>
   </article>
  </section>
 </main>
}

const shell={minHeight:"100vh",padding:28,background:"radial-gradient(circle at top left,#0f766e 0,#020617 32%,#08111f 100%)",color:"white",fontFamily:"Arial, sans-serif",overflowX:"hidden"}
const hero={maxWidth:1180,margin:"0 auto 18px",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,340px),1fr))",gap:18,alignItems:"stretch"}
const eyebrow={margin:"0 0 8px",fontSize:12,textTransform:"uppercase",letterSpacing:0,fontWeight:900,color:"#67e8f9"}
const title={fontSize:"clamp(38px,7vw,74px)",lineHeight:.96,letterSpacing:0,margin:"0 0 14px",overflowWrap:"anywhere"}
const lede={fontSize:18,lineHeight:1.55,color:"#dbeafe",maxWidth:760}
const actions={display:"flex",gap:10,flexWrap:"wrap"}
const primary={padding:"14px 18px",borderRadius:8,background:"#14b8a6",color:"#021014",fontWeight:900,textDecoration:"none",border:0}
const secondary={padding:"14px 18px",borderRadius:8,background:"rgba(226,232,240,.1)",color:"white",border:"1px solid rgba(226,232,240,.24)",fontWeight:900,textDecoration:"none"}
const renderer={maxWidth:1180,margin:"0 auto 18px",minHeight:420,borderRadius:8,overflow:"hidden",border:"1px solid rgba(45,212,191,.3)",background:"rgba(2,6,23,.76)"}
const grid={maxWidth:1180,margin:"0 auto 18px",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,210px),1fr))",gap:12}
const card={minWidth:0,textAlign:"left",borderRadius:8,border:"1px solid rgba(148,163,184,.24)",background:"rgba(15,23,42,.72)",color:"white",padding:10,cursor:"pointer",display:"grid",gap:9}
const activeCard={...card,border:"1px solid #14b8a6",boxShadow:"0 0 0 1px rgba(20,184,166,.25)"}
const cardTitle={fontWeight:900,fontSize:15,overflowWrap:"anywhere"}
const muted={color:"#cbd5e1",lineHeight:1.45,overflowWrap:"anywhere"}
const gridTwo={maxWidth:1180,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,330px),1fr))",gap:18}
const panel={minWidth:0,padding:18,borderRadius:8,border:"1px solid rgba(148,163,184,.24)",background:"rgba(15,23,42,.72)"}
const h2={fontSize:28,margin:"0 0 10px",overflowWrap:"anywhere"}
const chips={display:"flex",gap:8,flexWrap:"wrap",marginTop:14}
const chip={padding:"8px 10px",borderRadius:999,background:"rgba(56,189,248,.13)",color:"#bae6fd",fontWeight:900,fontSize:12}
