"use client"
import {useEffect, useMemo, useRef, useState} from "react"
import AgentBlogHome from "../components/AgentBlogHome"
import AgentFaqHelper from "../components/AgentFaqHelper"
import ApiVisualShowcase from "../components/ApiVisualShowcase"
import MainBlogFeature from "../components/MainBlogFeature"
import ModelRotationChooser from "../components/ModelRotationChooser"
import {getPersonaFeature, getPersonaMarket, getPersonaSignal} from "../lib/personaFeature"
import {getWalletPermissionState} from "../lib/walletPermissions"

const tiers = {free: 0, standard: 35, premium: 50, pro: 100}

function defaultAdaptiveState(){
 const feature = getPersonaFeature("home-project")
 return {
  intent: feature.intent,
  confidence: .45,
  reason: "Waiting for visitor signal",
  hero: {eyebrow:"DigitalHut Observatory", title:"Adaptive market, model, blog, and agent console.", primaryAction:"Run Observatory Scan"},
  observatory: {preloadQuery:feature.mainGLBSearch, category:feature.observatory?.category || feature.intent},
  market: feature.market,
  premium: {trigger:"first-scan", message:"Explore model libraries and agent research before unlocking premium depth.", active:false}
 }
}

function signalFromAdaptive(state){
 const personaSignal = getPersonaSignal(state.intent)
 return {...personaSignal, tone: `${personaSignal.tone} ${state.reason || ""}`.trim(), priority: personaSignal.priority || "Adaptive"}
}

function feedFromFeature(feature, options={}){
 return normalizeFeed({
  id: `feature:${feature.intent}`,
  intent: feature.intent,
  title: feature.mainFeatureTitle,
  query: feature.mainGLBSearch,
  category: feature.observatory?.category || feature.marketProfile || feature.intent,
  source: "feature",
  marketSymbols: feature.market?.symbols || [],
  agentNarration: `${feature.mainFeatureTitle}. ${feature.blogAngle}`,
  context: feature.contextGLBSearch
 }, options)
}

function normalizeFeed(feed={}, options={}){
 const query = feed.query || feed.mainGLBSearch || feed.title || "home renovation furniture room layout garden project glb"
 const title = feed.title || feed.mainFeatureTitle || query
 return {
  id: feed.id || `${feed.intent || feed.category || "feed"}:${query}`,
  intent: feed.intent || "home-project",
  title,
  query,
  category: feed.category || feed.mood || feed.marketProfile || "observatory",
  source: feed.source || "curated-feed",
  marketSymbols: feed.marketSymbols || feed.market?.symbols || [],
  modelUrl: feed.modelUrl || feed.glbUrl || feed.downloadUrl || "",
  terrainUrl: feed.terrainUrl || "",
  previewImage: feed.previewImage || feed.image || "",
  feedUrl: feed.feedUrl || feed.url || "",
  agentNarration: feed.agentNarration || feed.ai || `${title}. ${query}`,
  context: feed.context || feed.contextGLBSearch || "",
  speakOnSelect: Boolean(options.speak)
 }
}

export default function Home(){
 const initialFeature = useMemo(()=>getPersonaFeature("home-project"),[])
 const [wallet,setWallet]=useState("")
 const [tier,setTier]=useState("free")
 const [currency,setCurrency]=useState("ETH")
 const [query,setQuery]=useState(initialFeature.mainGLBSearch)
 const [result,setResult]=useState(null)
 const [busy,setBusy]=useState(false)
 const [signal,setSignal]=useState(getPersonaSignal("home-project"))
 const [health,setHealth]=useState(null)
 const [subscription,setSubscription]=useState(null)
 const [adaptive,setAdaptive]=useState(defaultAdaptiveState())
 const [activeFeed,setActiveFeed]=useState(()=>feedFromFeature(initialFeature))
 const [toast,setToast]=useState("Agent workspace ready")
 const spokenFeedRef = useRef("")
 const tierEntries = useMemo(()=>Object.entries(tiers),[])
 const personaFeature = useMemo(()=>getPersonaFeature(activeFeed.intent || adaptive.intent),[activeFeed.intent,adaptive.intent])
 const personaMarket = useMemo(()=>getPersonaMarket(activeFeed.intent || adaptive.intent),[activeFeed.intent,adaptive.intent])
 const walletPermission = useMemo(()=>getWalletPermissionState({wallet,tier,requiredTier:personaFeature.downloadTier,action:personaFeature.walletAction}),[wallet,tier,personaFeature])
 const marketSymbols = activeFeed.marketSymbols?.length ? activeFeed.marketSymbols : personaMarket?.symbols || adaptive?.market?.symbols || ["BTC","ETH","AAPL","TSLA"]
 const defaultMarketSymbol = marketSymbols[0] || "BTC"
 const providers = health?.providers || {}
 const paymentWallet = providers.paymentWallet || subscription?.payment_wallet || "0x3121FbFB683B9147913f336b05eF419b875a7590"
 const marketHref = `/market-intelligence?symbol=${encodeURIComponent(defaultMarketSymbol)}&entry=${encodeURIComponent(activeFeed.intent || adaptive.intent)}`

 useEffect(()=>{ refreshHealth(); refreshAdaptive() },[])
 useEffect(()=>{
  const timer=setInterval(()=>{
   const next = signalFromAdaptive(adaptive)
   setSignal(next)
   setQuery(activeFeed.query || next.query)
  },30000)
  return ()=>clearInterval(timer)
 },[adaptive, activeFeed.query])
 useEffect(()=>{
  if(!activeFeed?.speakOnSelect || !activeFeed.agentNarration || spokenFeedRef.current===activeFeed.id) return
  spokenFeedRef.current = activeFeed.id
  speak(activeFeed.agentNarration)
 },[activeFeed])

 function speak(text){
  if(typeof window==="undefined" || !("speechSynthesis" in window)) return
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text))
 }

 function selectFeed(feed, options={speak:true, scan:true}){
  const nextFeed = feed.mainFeatureTitle ? feedFromFeature(feed,{speak:options.speak}) : normalizeFeed(feed,{speak:options.speak})
  setActiveFeed(nextFeed)
  setQuery(nextFeed.query)
  setToast(`Active feed: ${nextFeed.title}`)
  if(options.scan) scan(nextFeed)
 }

 async function refreshHealth(){
  const res=await fetch("/health",{cache:"no-store"})
  setHealth(await res.json())
 }

 async function refreshAdaptive(overrides={}){
  if(typeof window === "undefined") return
  const params = new URLSearchParams(window.location.search)
  const savedMarket = window.localStorage.getItem("digitalhut:lastMarketSymbol") || ""
  const savedObservatory = window.localStorage.getItem("digitalhut:lastObservatoryQuery") || ""
  if(savedMarket && !params.get("query") && !params.get("symbol")) params.set("lastMarketSymbol", savedMarket)
  if(savedObservatory && !params.get("lastObservatoryQuery")) params.set("lastObservatoryQuery", savedObservatory)
  if(wallet || overrides.wallet) params.set("wallet", overrides.wallet || wallet)
  if(tier || overrides.tier) params.set("tier", overrides.tier || tier)
  const res=await fetch(`/api/adaptive-home?${params.toString()}`,{cache:"no-store"})
  const state=await res.json()
  const nextSignal=signalFromAdaptive(state)
  setAdaptive(state)
  setSignal(nextSignal)
  setToast(`Adaptive entry loaded: ${state.intent}. ${state.premium?.message || ""}`)
 }

 async function connect(){
  const w="0xDEMO"+Math.random().toString(16).slice(2,8)
  setWallet(w)
  setToast("Wallet access synced")
  await fetch("/api/account",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({wallet:w})})
  await refreshAdaptive({wallet:w})
 }

 async function activate(t){
  setTier(t)
  setToast(`${t.toUpperCase()} tier staged`)
  await fetch("/api/set-tier",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({wallet,tier:t})})
  await refreshAdaptive({tier:t})
 }

 async function subscribe(t=tier){
  const amount=tiers[t] || 0
  const res=await fetch("/api/subscription",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({wallet,tier:t,currency,amount})})
  const json=await res.json()
  setSubscription(json.subscription)
  setToast(json.subscription?.payment_wallet?"Crypto payment route ready":"Payment wallet not configured in Render")
 }

 async function scan(feedOrQuery=activeFeed){
  const requestedFeed = typeof feedOrQuery === "string" ? normalizeFeed({title:feedOrQuery,query:feedOrQuery,intent:activeFeed.intent},{speak:false}) : normalizeFeed(feedOrQuery,{speak:false})
  setBusy(true)
  setToast("Observatory scan running")
  try{
   if(typeof window!=="undefined") window.localStorage.setItem("digitalhut:lastObservatoryQuery", requestedFeed.query)
   const res=await fetch("/api/sketchfab",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:requestedFeed.query})})
   const json=await res.json()
   const model = json.result || {}
   const nextFeed = normalizeFeed({
    ...requestedFeed,
    id: `scan:${model.uid || requestedFeed.query}`,
    title: model.title || requestedFeed.title,
    source: json.provider,
    modelUrl: model.glbUrl || model.downloadUrl || requestedFeed.modelUrl,
    previewImage: model.image || requestedFeed.previewImage,
    feedUrl: model.url || requestedFeed.feedUrl,
    agentNarration: `${model.title || requestedFeed.title}. ${json.ai || requestedFeed.agentNarration}`
   }, {speak:true})
   setResult(json)
   setActiveFeed(nextFeed)
   setQuery(nextFeed.query)
   setToast(json.provider==="sketchfab-live"?"Live model route acquired":"Model feed found; renderer using metadata or fallback mode")
   await fetch("/api/history",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:nextFeed.query,result:model,tier,provider:json.provider})})
   await refreshAdaptive({tier})
  } finally { setBusy(false) }
 }

 async function requestDownload(){
  if(!result){ setToast(walletPermission.message); return }
  const res=await fetch("/api/download",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({wallet,tier,asset:activeFeed.modelUrl || activeFeed.feedUrl,modelUid:result.result?.uid})})
  const json=await res.json()
  setToast(json.message)
 }

 function voice(){
  const R=window.SpeechRecognition||window.webkitSpeechRecognition
  if(!R)return alert("Voice not supported")
  const rec=new R(); rec.onresult=e=>setQuery(e.results[0][0].transcript); rec.start()
 }

 return <main style={shell}>
  <section style={hero}>
   <div style={heroCopy}>
    <div style={eyebrow}>{adaptive.hero?.eyebrow || "DigitalHut"}</div>
    <h1 style={title}>{activeFeed.title || adaptive.hero?.title}</h1>
    <p style={lede}>{activeFeed.agentNarration}</p>
    <div style={actions}>
     <button onClick={()=>scan(activeFeed)} style={primary}>{busy?"Scanning":adaptive.hero?.primaryAction || "Run Observatory Scan"}</button>
     <button onClick={voice} style={secondary}>Voice</button>
     <a href={marketHref} style={linkBtn}>Market Intelligence</a>
     <a href="/library" style={secondary}>Library</a>
    </div>
   </div>
  </section>

  <MainBlogFeature feature={personaFeature} permission={walletPermission} busy={busy} onSelectFeed={selectFeed}/>
  <ApiVisualShowcase/>
  <AgentBlogHome activeIntent={activeFeed.intent} activeFeed={activeFeed} onSelectFeed={selectFeed}/>
  <ModelRotationChooser activeFeed={activeFeed} result={result} busy={busy} onSelectFeed={selectFeed}/>

  <section style={mainGrid}>
   <div style={panel}>
    <div style={panelHeader}><h2 style={h2}>Wallet And Subscription</h2><span style={pill}>{tier.toUpperCase()}</span></div>
    <button onClick={connect} style={walletBtn}>{wallet || "Connect Wallet"}</button>
    <div style={tierGrid}>{tierEntries.map(([t,p])=><button key={t} onClick={()=>activate(t)} style={tier===t?activeTier:tierBtn}><b>{t.toUpperCase()}</b><span>${p}</span></button>)}</div>
    <div style={payRow}>
     <select value={currency} onChange={e=>setCurrency(e.target.value)} style={select}><option>ETH</option><option>USDC</option><option>MATIC</option><option>BNB</option></select>
     <button onClick={()=>subscribe(tier)} style={primary}>Stage Crypto Payment</button>
    </div>
    <p style={mono}>Wallet: {paymentWallet}</p>
    <p style={muted}>{walletPermission.message}</p>
   </div>

   <div style={panel}>
    <div style={panelHeader}><h2 style={h2}>Active Feed Search</h2><span style={pill}>{activeFeed.category}</span></div>
    <p style={muted}>{activeFeed.context || signal.tone}</p>
    <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search terrain, markets, structures, maps..." style={input}/>
    <div style={actions}><button onClick={()=>selectFeed({...activeFeed,query,title:query},{speak:true,scan:true})} style={primary}>{busy?"Scanning":"Search"}</button><button onClick={()=>selectFeed(feedFromFeature(personaFeature),{speak:true,scan:true})} style={secondary}>Use Feature</button></div>
    <p style={muted}>{toast}</p>
   </div>
  </section>

  <section style={mainGrid}>
   <div style={panel}>
    <div style={eyebrow}>{activeFeed.source}</div>
    <h2 style={resultTitle}>{activeFeed.title}</h2>
    {activeFeed.previewImage&&<img src={activeFeed.previewImage} alt="Active feed preview" style={preview}/>} 
    <p style={muted}>{activeFeed.agentNarration}</p>
    <div style={actions}>{activeFeed.feedUrl&&<a href={activeFeed.feedUrl} target="_blank" style={linkBtn}>Open feed</a>}<button onClick={requestDownload} style={secondary}>Authorize Download</button></div>
   </div>
   <div style={panel}>
    <div style={eyebrow}>Active feed rule</div>
    <h2 style={resultTitle}>Voice follows the selected feed</h2>
    <p style={muted}>The visual, title, selected card, query, market link, and narration now read from one activeFeed object.</p>
    <p style={mono}>Voice source: activeFeed.agentNarration</p>
   </div>
  </section>

  <AgentFaqHelper intent={activeFeed.intent} health={health}/>

  <section style={libraryBand}>
   <a href="/library" style={navTile}><span>Library</span><b>Market profiles, global environments, structures, and planetary assets</b></a>
   <a href={marketHref} style={navTile}><span>Market</span><b>{marketSymbols.join(" / ")}</b></a>
  </section>
 </main>
}

const shell={minHeight:"100vh",padding:28,background:"radial-gradient(circle at top left,#12343b 0,#020617 35%,#07111f 100%)",color:"white",fontFamily:"Arial, sans-serif",overflowX:"hidden"}
const hero={maxWidth:1180,margin:"0 auto",display:"block"}
const heroCopy={minWidth:0,maxWidth:900}
const eyebrow={fontSize:12,textTransform:"uppercase",letterSpacing:0,fontWeight:900,color:"#67e8f9"}
const title={fontSize:"clamp(40px,7vw,78px)",lineHeight:.96,letterSpacing:0,margin:"10px 0 18px",maxWidth:900,overflowWrap:"anywhere"}
const lede={fontSize:18,lineHeight:1.55,color:"#d8e4ee",maxWidth:760}
const actions={display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}
const primary={padding:"14px 18px",borderRadius:8,background:"#14b8a6",color:"#021014",border:0,fontWeight:900,cursor:"pointer"}
const secondary={padding:"14px 18px",borderRadius:8,background:"rgba(226,232,240,.1)",color:"white",border:"1px solid rgba(226,232,240,.24)",fontWeight:800,cursor:"pointer",textDecoration:"none"}
const linkBtn={display:"inline-block",padding:"13px 16px",borderRadius:8,background:"#38bdf8",color:"#06111a",fontWeight:900,textDecoration:"none"}
const panelHeader={display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",marginBottom:10,flexWrap:"wrap"}
const h2={fontSize:22,margin:0}
const pill={fontSize:12,padding:"7px 10px",borderRadius:999,background:"rgba(103,232,249,.12)",color:"#a5f3fc",fontWeight:900}
const mainGrid={maxWidth:1180,margin:"22px auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,300px),1fr))",gap:18}
const panel={minWidth:0,padding:20,border:"1px solid rgba(148,163,184,.25)",borderRadius:8,background:"rgba(15,23,42,.74)"}
const walletBtn={width:"100%",padding:16,borderRadius:8,border:"1px solid rgba(226,232,240,.22)",background:"#172554",color:"white",fontWeight:900,marginBottom:14,cursor:"pointer",overflowWrap:"anywhere"}
const tierGrid={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(92px,1fr))",gap:8}
const tierBtn={minHeight:72,borderRadius:8,border:"1px solid rgba(226,232,240,.18)",background:"rgba(2,6,23,.55)",color:"white",display:"grid",gap:4,placeItems:"center",cursor:"pointer"}
const activeTier={...tierBtn,border:"1px solid #facc15",background:"rgba(250,204,21,.14)"}
const payRow={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:10,marginTop:14}
const select={padding:13,borderRadius:8,border:"1px solid rgba(226,232,240,.24)",background:"#020617",color:"white",fontWeight:900}
const mono={fontFamily:"monospace",fontSize:13,color:"#cbd5e1",overflowWrap:"anywhere"}
const input={width:"100%",boxSizing:"border-box",padding:16,borderRadius:8,margin:"2px 0 14px",fontSize:18,border:"1px solid rgba(226,232,240,.22)",background:"#020617",color:"white"}
const muted={color:"#cbd5e1",lineHeight:1.5,overflowWrap:"anywhere"}
const resultTitle={fontSize:26,margin:"8px 0 12px",overflowWrap:"anywhere"}
const preview={width:"100%",aspectRatio:"16 / 9",objectFit:"cover",borderRadius:8,background:"#0f172a",marginBottom:12}
const libraryBand={maxWidth:1180,margin:"22px auto 0",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,260px),1fr))",gap:18}
const navTile={minWidth:0,padding:22,borderRadius:8,border:"1px solid rgba(148,163,184,.25)",background:"rgba(226,232,240,.08)",color:"white",textDecoration:"none",display:"grid",gap:8,overflowWrap:"anywhere"}
