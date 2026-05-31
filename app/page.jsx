"use client"
import {useEffect, useMemo, useState} from "react"

const tiers = {free: 0, standard: 35, premium: 50, pro: 100}
const fieldSignals = [
  {label: "Lunar terrain drift", query: "moon terrain lava tube", tone: "Planetary scan", priority: "High"},
  {label: "Urban twin packet", query: "tokyo building city scan", tone: "Structure scan", priority: "Live"},
  {label: "Northern relief layer", query: "canada terrain elevation", tone: "Terrain sweep", priority: "Fresh"},
  {label: "Historic map echo", query: "new york map 3d", tone: "Map signal", priority: "New"},
  {label: "Infrastructure corridor", query: "bridge infrastructure 3d scan", tone: "Asset route", priority: "Watch"}
]

export default function Home(){
 const [wallet,setWallet]=useState("")
 const [tier,setTier]=useState("free")
 const [query,setQuery]=useState("moon terrain lava tube")
 const [result,setResult]=useState(null)
 const [busy,setBusy]=useState(false)
 const [signal,setSignal]=useState(fieldSignals[0])
 const [autoSignals,setAutoSignals]=useState(true)
 const [lastPulse,setLastPulse]=useState("Standing by")
 const [toast,setToast]=useState("DigitalHut signal console armed")

 const tierEntries = useMemo(()=>Object.entries(tiers),[])

 useEffect(()=>{
  if(!autoSignals)return
  let alive = true
  function schedule(){
   const delay = 18000 + Math.floor(Math.random()*24000)
   return setTimeout(()=>{
    if(!alive)return
    const next = fieldSignals[Math.floor(Math.random()*fieldSignals.length)]
    setSignal(next)
    setQuery(next.query)
    setLastPulse(new Date().toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"}))
    setToast(`${next.tone}: ${next.label}`)
    timer = schedule()
   }, delay)
  }
  let timer = schedule()
  return ()=>{alive=false; clearTimeout(timer)}
 },[autoSignals])

 async function connect(){
  const w="0xDEMO"+Math.random().toString(16).slice(2,8)
  setWallet(w)
  setToast("Wallet access synced")
  await fetch("/api/account",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({wallet:w})})
 }

 async function activate(t){
  setTier(t)
  setToast(`${t.toUpperCase()} tier staged`)
  await fetch("/api/set-tier",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({wallet,tier:t})})
 }

 async function scan(customQuery=query){
  const activeQuery = customQuery || signal.query
  setBusy(true)
  setToast("Observatory scan running")
  try{
   const res=await fetch("/api/sketchfab",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:activeQuery})})
   const json=await res.json()
   setResult(json)
   setToast(json.provider==="sketchfab-live"?"Live Sketchfab model acquired":"Fallback observatory signal acquired")
   if(typeof window!=="undefined" && "speechSynthesis" in window){
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(json.ai))
   }
   await fetch("/api/history",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:activeQuery,result:json.result,tier})})
  } finally {
   setBusy(false)
  }
 }

 function voice(){
  const R=window.SpeechRecognition||window.webkitSpeechRecognition
  if(!R)return alert("Voice not supported")
  const rec=new R()
  rec.onresult=e=>setQuery(e.results[0][0].transcript)
  rec.start()
 }

 return <main style={shell}>
  <section style={hero}>
   <div style={heroCopy}>
    <div style={eyebrow}>DigitalHut Observatory</div>
    <h1 style={title}>Live terrain, market, and model intelligence console.</h1>
    <p style={lede}>Search Sketchfab observatory feeds, route discoveries into tiered wallet access, and let timed field signals surface the next scan target while you work.</p>
    <div style={quickActions}>
     <button onClick={()=>scan()} style={primaryBtn}>{busy?"Scanning...":"Run Observatory Scan"}</button>
     <button onClick={voice} style={secondaryBtn}>Voice</button>
     <button onClick={()=>setAutoSignals(v=>!v)} style={secondaryBtn}>{autoSignals?"Pause Signals":"Arm Signals"}</button>
    </div>
   </div>
   <div style={radarPanel}>
    <div style={radarTop}><span>{signal.priority}</span><span>{lastPulse}</span></div>
    <div style={radarGrid}>
     <span style={{...radarDot, left:"18%", top:"34%"}} />
     <span style={{...radarDot, left:"56%", top:"18%", animationDelay:".6s"}} />
     <span style={{...radarDot, left:"72%", top:"66%", animationDelay:"1.2s"}} />
     <div style={radarCore}>{signal.tone}</div>
    </div>
    <h2 style={panelTitle}>{signal.label}</h2>
    <p style={muted}>{toast}</p>
    <button onClick={()=>scan(signal.query)} style={fullBtn}>Run Timed Signal</button>
   </div>
  </section>

  <section style={opsGrid}>
   <div style={panel}>
    <div style={panelHeader}><h2 style={h2}>Wallet Access</h2><span style={pill}>{tier.toUpperCase()}</span></div>
    <button onClick={connect} style={walletBtn}>{wallet?wallet:"Connect Wallet"}</button>
    <div style={tierGrid}>
     {tierEntries.map(([t,p])=><button key={t} onClick={()=>activate(t)} style={tier===t?activeTier:tierBtn}><b>{t.toUpperCase()}</b><span>${p}</span></button>)}
    </div>
   </div>

   <div style={panel}>
    <div style={panelHeader}><h2 style={h2}>Observatory Search</h2><span style={pill}>Sketchfab</span></div>
    <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search terrain, planetary, structures, maps..." style={input}/>
    <div style={quickActions}>
     <button onClick={()=>scan()} style={primaryBtn}>{busy?"Scanning...":"Search"}</button>
     <button onClick={()=>setQuery(signal.query)} style={secondaryBtn}>Use Signal</button>
    </div>
   </div>
  </section>

  {result&&<section style={resultPanel}>
   {result.result.image&&<img src={result.result.image} alt="Sketchfab model preview" style={preview}/>} 
   <div>
    <div style={eyebrow}>{result.provider}</div>
    <h2 style={resultTitle}>{result.result.title}</h2>
    <p style={ledeSmall}>{result.ai}</p>
    <a href={result.result.url} target="_blank" style={linkBtn}>Open Sketchfab feed</a>
   </div>
  </section>}

  <section style={libraryBand}>
   <a href="/library" style={navTile}><span>Library</span><b>GLB discovery routes</b></a>
   <a href="/market-intelligence" style={navTile}><span>Market Intelligence</span><b>Charts and AI scan</b></a>
  </section>
 </main>
}

const shell={minHeight:"100vh",padding:"28px",background:"radial-gradient(circle at top left,#12343b 0,#020617 34%,#07111f 100%)",color:"white",fontFamily:"Arial, sans-serif"}
const hero={maxWidth:1180,margin:"0 auto",display:"grid",gridTemplateColumns:"minmax(0,1.1fr) minmax(320px,.72fr)",gap:22,alignItems:"stretch"}
const heroCopy={padding:"42px 0",display:"flex",flexDirection:"column",justifyContent:"center"}
const eyebrow={fontSize:12,textTransform:"uppercase",letterSpacing:0,fontWeight:800,color:"#67e8f9",marginBottom:10}
const title={fontSize:"clamp(42px,7vw,82px)",lineHeight:.96,letterSpacing:0,margin:"0 0 18px",maxWidth:780}
const lede={fontSize:19,lineHeight:1.55,color:"#d8e4ee",maxWidth:700,margin:"0 0 24px"}
const ledeSmall={fontSize:16,lineHeight:1.55,color:"#d8e4ee",margin:"0 0 18px"}
const quickActions={display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}
const primaryBtn={padding:"14px 18px",borderRadius:8,background:"#14b8a6",color:"#021014",border:0,fontWeight:900,cursor:"pointer"}
const secondaryBtn={padding:"14px 18px",borderRadius:8,background:"rgba(226,232,240,.1)",color:"white",border:"1px solid rgba(226,232,240,.24)",fontWeight:800,cursor:"pointer"}
const radarPanel={border:"1px solid rgba(148,163,184,.28)",borderRadius:8,background:"rgba(8,20,32,.82)",padding:18,boxShadow:"0 24px 80px rgba(0,0,0,.3)"}
const radarTop={display:"flex",justifyContent:"space-between",fontSize:12,color:"#cbd5e1",fontWeight:800,textTransform:"uppercase"}
const radarGrid={position:"relative",height:270,margin:"18px 0",border:"1px solid rgba(103,232,249,.25)",borderRadius:8,background:"linear-gradient(90deg,rgba(103,232,249,.08) 1px,transparent 1px),linear-gradient(rgba(103,232,249,.08) 1px,transparent 1px)",backgroundSize:"34px 34px",overflow:"hidden"}
const radarCore={position:"absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)",width:130,height:130,borderRadius:"50%",display:"grid",placeItems:"center",textAlign:"center",padding:14,border:"1px solid #22d3ee",background:"rgba(20,184,166,.16)",fontWeight:900,color:"#e0faff"}
const radarDot={position:"absolute",width:12,height:12,borderRadius:"50%",background:"#facc15",boxShadow:"0 0 22px #facc15",animation:"pulse 2.8s infinite"}
const panelTitle={fontSize:24,margin:"0 0 8px"}
const muted={color:"#b6c3d1",lineHeight:1.5,minHeight:44}
const fullBtn={width:"100%",padding:"14px 16px",borderRadius:8,border:0,background:"#facc15",color:"#111827",fontWeight:900,cursor:"pointer"}
const opsGrid={maxWidth:1180,margin:"22px auto",display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:18}
const panel={padding:20,border:"1px solid rgba(148,163,184,.25)",borderRadius:8,background:"rgba(15,23,42,.74)"}
const panelHeader={display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",marginBottom:14}
const h2={fontSize:22,margin:0}
const pill={fontSize:12,padding:"7px 10px",borderRadius:999,background:"rgba(103,232,249,.12)",color:"#a5f3fc",fontWeight:900}
const walletBtn={width:"100%",padding:"16px",borderRadius:8,border:"1px solid rgba(226,232,240,.22)",background:"#172554",color:"white",fontWeight:900,marginBottom:14,cursor:"pointer"}
const tierGrid={display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:8}
const tierBtn={minHeight:72,borderRadius:8,border:"1px solid rgba(226,232,240,.18)",background:"rgba(2,6,23,.55)",color:"white",display:"grid",gap:4,placeItems:"center",cursor:"pointer"}
const activeTier={...tierBtn,border:"1px solid #facc15",background:"rgba(250,204,21,.14)"}
const input={width:"100%",boxSizing:"border-box",padding:16,borderRadius:8,margin:"2px 0 14px",fontSize:18,border:"1px solid rgba(226,232,240,.22)",background:"#020617",color:"white"}
const resultPanel={maxWidth:1180,margin:"22px auto",display:"grid",gridTemplateColumns:"minmax(260px,.45fr) 1fr",gap:20,padding:20,border:"1px solid rgba(148,163,184,.25)",borderRadius:8,background:"rgba(4,12,22,.82)"}
const preview={width:"100%",aspectRatio:"16 / 10",objectFit:"cover",borderRadius:8,background:"#0f172a"}
const resultTitle={fontSize:34,margin:"0 0 12px"}
const linkBtn={display:"inline-block",padding:"13px 16px",borderRadius:8,background:"#38bdf8",color:"#06111a",fontWeight:900,textDecoration:"none"}
const libraryBand={maxWidth:1180,margin:"22px auto 0",display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:18}
const navTile={padding:22,borderRadius:8,border:"1px solid rgba(148,163,184,.25)",background:"rgba(226,232,240,.08)",color:"white",textDecoration:"none",display:"grid",gap:8}
