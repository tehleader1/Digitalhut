"use client"
import {useEffect, useMemo, useState} from "react"
import DiscoverySnapshotVisual from "../../components/DiscoverySnapshotVisual"
import UniversalFeedVisual from "../../components/UniversalFeedVisual"
import platform from "../../data/platform-libraries.json"
import {getPersonaFeature, getPersonaMarket, normalizeIntent} from "../../lib/personaFeature"
import {enrichActiveFeed} from "../../lib/domain/visualTranscript"

function buildMarketProfile({entry, adaptive, symbol, selectedProfile}){
 const intent = normalizeIntent(entry || adaptive?.intent || "anonymous-new-user")
 const feature = getPersonaFeature(intent)
 const personaMarket = getPersonaMarket(intent) || {}
 const adaptiveMarket = adaptive?.market || {}
 const profile = selectedProfile || platform.marketProfiles?.[0] || {}
 const symbols = profile.symbols?.length ? profile.symbols : adaptiveMarket.symbols?.length ? adaptiveMarket.symbols : personaMarket.symbols || ["BTC","ETH","AAPL","TSLA"]
 const defaultSymbol = symbol || profile.defaultSymbol || adaptiveMarket.defaultSymbol || personaMarket.defaultSymbol || symbols[0] || "BTC"
 return {
  intent,
  title: profile.title || personaMarket.title || feature.marketProfile || `${feature.mainFeatureTitle} market desk`,
  symbols,
  defaultSymbol,
  visualIdentity: profile.visualIdentity || "market visual identity",
  observation: profile.agentUse || adaptive?.reason || feature.blogAngle,
  clientType: feature.clientType || intent,
  category: adaptive?.observatory?.category || feature.observatory?.category || "market-intelligence",
  observatoryQuery: adaptive?.observatory?.preloadQuery || feature.mainGLBSearch,
  narration: `${profile.title || feature.mainFeatureTitle}. ${profile.agentUse || feature.blogAngle}`,
  tierPrompt: adaptive?.premium?.message || "Unlock deeper market history, saved feeds, and project guidance."
 }
}

export default function Market(){
 const [q,setQ]=useState("BTC")
 const [r,setR]=useState(null)
 const [health,setHealth]=useState(null)
 const [adaptive,setAdaptive]=useState(null)
 const [entry,setEntry]=useState("anonymous-new-user")
 const [busy,setBusy]=useState(false)
 const [toast,setToast]=useState("Loading active market feed")
 const [selectedProfile,setSelectedProfile]=useState(platform.marketProfiles?.[0])

 const activeProfile = useMemo(()=>buildMarketProfile({entry, adaptive, symbol:q, selectedProfile}),[entry, adaptive, q, selectedProfile])
 const alpacaLive = Boolean(health?.providers?.alpaca)
 const provider = r?.provider || (alpacaLive?"market-api-ready":"awaiting-live-candles")
 const activeFeed = useMemo(()=>enrichActiveFeed({
  id: `market:${activeProfile.intent}:${activeProfile.defaultSymbol}`,
  title: activeProfile.title,
  category: "market",
  clientType: "market",
  visualMode: "market",
  marketSymbols: activeProfile.symbols,
  sourceApi: r?.provider || "market-api",
  agentNarration: r?.ai || activeProfile.narration,
  observation: activeProfile.observation,
  visualDescription: activeProfile.visualIdentity,
  confidence: adaptive?.confidence || .45,
  walletTierRequired: adaptive?.premium?.active ? "premium" : "free"
 }),[activeProfile, r, adaptive])

 useEffect(()=>{ bootActiveFeed() },[])
 useEffect(()=>{ if(adaptive && q) scan(q, {silent:true}) },[adaptive])

 async function bootActiveFeed(){
  await refreshHealth()
  if(typeof window === "undefined") return
  const params = new URLSearchParams(window.location.search)
  const symbol = (params.get("symbol") || params.get("query") || window.localStorage.getItem("digitalhut:lastMarketSymbol") || "BTC").toUpperCase()
  const nextEntry = params.get("entry") || "anonymous-new-user"
  setEntry(nextEntry)
  setQ(symbol)
  const adaptiveParams = new URLSearchParams()
  adaptiveParams.set("symbol", symbol)
  adaptiveParams.set("entry", nextEntry)
  adaptiveParams.set("lastMarketSymbol", symbol)
  const res=await fetch(`/api/adaptive-home?${adaptiveParams.toString()}`,{cache:"no-store"})
  const state=await res.json()
  setAdaptive(state)
  setToast(`Active feed loaded: ${state.intent}. Market APIs are attached to ${symbol}.`)
 }

 async function refreshHealth(){
  const res=await fetch("/health",{cache:"no-store"})
  const json=await res.json()
  setHealth(json)
  return json
 }

 async function scan(symbol=q, options={}){
  const nextSymbol = String(symbol || activeProfile.defaultSymbol || "BTC").trim().toUpperCase()
  setBusy(true)
  try{
   if(typeof window!=="undefined") window.localStorage.setItem("digitalhut:lastMarketSymbol", nextSymbol)
   const res=await fetch("/api/market",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:nextSymbol, activeFeed})})
   const json=await res.json()
   setR(json)
   setQ(json.symbol || nextSymbol)
   setToast(`${json.symbol || nextSymbol} profile updated from ${json.provider}.`)
   if(!options.silent) speak(json.ai)
  } finally { setBusy(false) }
 }

 function chooseProfile(profile){
  setSelectedProfile(profile)
  const nextSymbol = profile.defaultSymbol || profile.symbols?.[0] || q
  setQ(nextSymbol)
  scan(nextSymbol)
 }

 function speak(text){
  if(typeof window!=="undefined" && "speechSynthesis" in window){
   window.speechSynthesis.cancel()
   window.speechSynthesis.speak(new SpeechSynthesisUtterance(text))
  }
 }

 function voice(){
  const R=window.SpeechRecognition||window.webkitSpeechRecognition
  if(!R)return alert("Voice not supported")
  const rec=new R(); rec.onresult=e=>{const text=e.results[0][0].transcript; setQ(text); scan(text)}; rec.start()
 }

 return <main style={shell}>
  <a href="/" style={back}>Back to DigitalHut</a>
  <section style={hero}>
   <div style={visualPanel}>
    <DiscoverySnapshotVisual feed={activeFeed} scope="market profile" />
    <div style={rendererInset}><UniversalFeedVisual activeFeed={activeFeed} scope="market"/></div>
   </div>
   <div>
    <div style={eyebrow}>Active Market Feed</div>
    <h1 style={title}>{activeProfile.title}</h1>
    <p style={lede}>{activeFeed.agentNarration}</p>
    <p style={identity}>{activeProfile.visualIdentity}</p>
    <div style={symbolGrid}>{activeProfile.symbols.map(symbol=><button key={symbol} onClick={()=>scan(symbol)} style={symbol===q?activeSymbol:symbolBtn}>{symbol}</button>)}</div>
   </div>
   <div style={statusPanel}>
    <div style={statusRow}><span>Active intent</span><b>{activeFeed.clientType}</b></div>
    <div style={statusRow}><span>Render health</span><b>{health?.status || "checking"}</b></div>
    <div style={statusRow}><span>Market API</span><b style={alpacaLive?good:warn}>{provider}</b></div>
    <div style={statusRow}><span>Confidence</span><b>{Math.round((activeFeed.confidence || .45)*100)}%</b></div>
    <button onClick={refreshHealth} style={smallBtn}>Refresh status</button>
   </div>
  </section>

  <section style={profileDeck}>
   {platform.marketProfiles.map(profile=>{
    const feed = { title: profile.title, category: "market", visualMode: "market", marketSymbols: profile.symbols, visualDescription: profile.visualIdentity, agentNarration: profile.agentUse }
    return <button key={profile.title} onClick={()=>chooseProfile(profile)} style={profile.title===selectedProfile?.title?activeProfileCard:profileChoice}>
     <DiscoverySnapshotVisual feed={feed} scope="market profile card" compact />
     <b>{profile.title}</b>
     <span>{profile.visualIdentity}</span>
     <small>{profile.symbols.join(" / ")}</small>
    </button>
   })}
  </section>

  <section style={desk}>
   <div style={searchRow}>
    <input value={q} onChange={e=>setQ(e.target.value)} placeholder="BTC, ETH, AAPL, TSLA..." style={input}/>
    <button onClick={()=>scan()} style={primary}>{busy?"Scanning":"Search Market"}</button>
    <button onClick={voice} style={secondary}>Voice</button>
   </div>

   <div style={profileGrid}>
    <div style={profileCard}>
     <div style={eyebrow}>Market Profile</div>
     <DiscoverySnapshotVisual feed={activeFeed} scope="market profile preview" compact />
     <h2 style={profileTitle}>{activeFeed.title}</h2>
     <p style={analysis}>{activeFeed.observation}</p>
     <p style={mono}>Observatory context: {activeProfile.observatoryQuery}</p>
     <p style={mono}>Symbols: {activeFeed.marketSymbols.join(" / ")}</p>
     <p style={analysis}>{activeProfile.tierPrompt}</p>
    </div>

    <div style={chartCard}>
     <div style={chartHeader}>
      <div><span style={eyebrow}>{r?.provider || "standby"}</span><h2 style={symbol}>{r?.symbol || q.toUpperCase()}</h2></div>
      <div style={price}>{r?.price || "Waiting for scan"}</div>
     </div>
     <div style={bars}>
      {(r?.candles || [12,15,13,18,17,22,20,26,24,29]).map((v,i)=><div key={i} style={{...bar,height:Math.max(18,v*4)}} />)}
     </div>
     <p style={analysis}>{r?.ai || "Run a scan to let the active feed call the market API and confirm live or fallback candles."}</p>
     <p style={mono}>{r?.technicals?.summary || toast}</p>
    </div>
   </div>
  </section>
 </main>
}

const shell={minHeight:"100vh",padding:28,background:"linear-gradient(135deg,#051923,#020617 45%,#111827)",color:"white",fontFamily:"Arial, sans-serif"}
const back={color:"#67e8f9",fontWeight:800,textDecoration:"none"}
const hero={maxWidth:1120,margin:"24px auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,280px),1fr))",gap:18,alignItems:"stretch"}
const visualPanel={minWidth:0,borderRadius:8,overflow:"hidden",border:"1px solid rgba(148,163,184,.28)",background:"#020617",display:"grid",gap:8,padding:8}
const rendererInset={minHeight:240,borderRadius:8,overflow:"hidden"}
const eyebrow={fontSize:12,textTransform:"uppercase",letterSpacing:0,fontWeight:900,color:"#67e8f9"}
const title={fontSize:"clamp(38px,6vw,72px)",lineHeight:.98,margin:"8px 0 16px",letterSpacing:0,overflowWrap:"anywhere"}
const lede={fontSize:18,lineHeight:1.55,color:"#dbeafe",maxWidth:760}
const identity={color:"#a7f3d0",fontWeight:900,lineHeight:1.4,overflowWrap:"anywhere"}
const statusPanel={border:"1px solid rgba(148,163,184,.28)",borderRadius:8,background:"rgba(15,23,42,.76)",padding:18,display:"grid",gap:12}
const statusRow={display:"flex",justifyContent:"space-between",gap:14,borderBottom:"1px solid rgba(148,163,184,.16)",paddingBottom:10,overflowWrap:"anywhere"}
const good={color:"#86efac"}
const warn={color:"#facc15"}
const smallBtn={padding:"12px 14px",borderRadius:8,border:0,background:"#0ea5e9",color:"#03121d",fontWeight:900,cursor:"pointer"}
const profileDeck={maxWidth:1120,margin:"0 auto 18px",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,220px),1fr))",gap:12}
const profileChoice={textAlign:"left",padding:14,borderRadius:8,border:"1px solid rgba(148,163,184,.28)",background:"rgba(15,23,42,.72)",color:"white",display:"grid",gap:7,cursor:"pointer"}
const activeProfileCard={...profileChoice,border:"1px solid rgba(20,184,166,.7)",background:"rgba(20,184,166,.14)"}
const desk={maxWidth:1120,margin:"0 auto",display:"grid",gap:18}
const searchRow={display:"grid",gridTemplateColumns:"minmax(0,1fr) auto auto",gap:10}
const input={padding:16,borderRadius:8,border:"1px solid rgba(148,163,184,.34)",background:"#020617",color:"white",fontSize:18,minWidth:0}
const primary={padding:"14px 18px",borderRadius:8,border:0,background:"#14b8a6",fontWeight:900,cursor:"pointer"}
const secondary={padding:"14px 18px",borderRadius:8,border:"1px solid rgba(148,163,184,.34)",background:"rgba(148,163,184,.12)",color:"white",fontWeight:900,cursor:"pointer"}
const symbolGrid={display:"flex",gap:10,flexWrap:"wrap",marginTop:18}
const symbolBtn={padding:"12px 15px",borderRadius:8,border:"1px solid rgba(148,163,184,.34)",background:"rgba(148,163,184,.12)",color:"white",fontWeight:900,cursor:"pointer"}
const activeSymbol={...symbolBtn,background:"#14b8a6",color:"#021014",border:"1px solid #5eead4"}
const profileGrid={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,320px),1fr))",gap:18}
const profileCard={border:"1px solid rgba(148,163,184,.28)",borderRadius:8,background:"rgba(15,23,42,.76)",padding:22,display:"grid",gap:10}
const chartCard={border:"1px solid rgba(148,163,184,.28)",borderRadius:8,background:"rgba(3,7,18,.74)",padding:22}
const chartHeader={display:"flex",justifyContent:"space-between",gap:18,alignItems:"start",flexWrap:"wrap"}
const symbol={fontSize:44,margin:"4px 0 0"}
const price={fontSize:24,fontWeight:900,color:"#bbf7d0"}
const bars={height:220,display:"flex",alignItems:"end",gap:10,padding:"18px 0",borderBottom:"1px solid rgba(148,163,184,.2)",overflow:"hidden"}
const bar={width:30,background:"linear-gradient(#86efac,#22c55e)",borderRadius:"6px 6px 0 0",boxShadow:"0 0 18px rgba(34,197,94,.25)"}
const profileTitle={fontSize:28,margin:"8px 0 12px",overflowWrap:"anywhere"}
const analysis={fontSize:17,lineHeight:1.55,color:"#dbeafe",overflowWrap:"anywhere"}
const mono={fontFamily:"monospace",fontSize:13,color:"#cbd5e1",overflowWrap:"anywhere"}
