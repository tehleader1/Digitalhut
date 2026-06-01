"use client"
import {useEffect, useMemo, useState} from "react"
import BabylonObservatory from "./components/BabylonObservatory"

const tiers = {free: 0, standard: 35, premium: 50, pro: 100}
const measurements = [
  ["Observatory", 82],
  ["Market", 74],
  ["Agents", 97],
  ["Wallet", 72],
  ["Library", 84],
  ["Launch", 84]
]
const fieldSignals = [
  {label:"Lunar terrain drift", query:"moon terrain lava tube", tone:"Planetary scan", priority:"High"},
  {label:"Urban twin packet", query:"tokyo building city scan", tone:"Structure scan", priority:"Live"},
  {label:"Northern relief layer", query:"canada terrain elevation", tone:"Terrain sweep", priority:"Fresh"},
  {label:"Historic map echo", query:"new york map 3d", tone:"Map signal", priority:"New"},
  {label:"Infrastructure corridor", query:"bridge infrastructure 3d scan", tone:"Asset route", priority:"Watch"}
]

export default function Home(){
 const [wallet,setWallet]=useState("")
 const [tier,setTier]=useState("free")
 const [currency,setCurrency]=useState("ETH")
 const [query,setQuery]=useState("moon terrain lava tube")
 const [result,setResult]=useState(null)
 const [busy,setBusy]=useState(false)
 const [signal,setSignal]=useState(fieldSignals[0])
 const [health,setHealth]=useState(null)
 const [subscription,setSubscription]=useState(null)
 const [toast,setToast]=useState("Operational maturity console ready")
 const tierEntries = useMemo(()=>Object.entries(tiers),[])

 useEffect(()=>{ refreshHealth() },[])
 useEffect(()=>{
  const timer=setInterval(()=>{
   const next=fieldSignals[Math.floor(Math.random()*fieldSignals.length)]
   setSignal(next)
   setQuery(next.query)
  },30000)
  return ()=>clearInterval(timer)
 },[])

 async function refreshHealth(){
  const res=await fetch("/health",{cache:"no-store"})
  setHealth(await res.json())
 }

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

 async function subscribe(t=tier){
  const amount=tiers[t] || 0
  const res=await fetch("/api/subscription",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({wallet,tier:t,currency,amount})})
  const json=await res.json()
  setSubscription(json.subscription)
  setToast(json.subscription?.payment_wallet?"Crypto payment route ready":"Payment wallet not configured in Render")
 }

 async function scan(customQuery=query){
  const activeQuery=customQuery || signal.query
  setBusy(true)
  setToast("Observatory scan running")
  try{
   const res=await fetch("/api/sketchfab",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:activeQuery})})
   const json=await res.json()
   setResult(json)
   const live=json.provider==="sketchfab-live"
   setToast(live?"Live Sketchfab GLB route acquired":"Feed found, GLB renderer using diagnostic/fallback mode")
   if(typeof window!=="undefined" && "speechSynthesis" in window){
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(`${json.ai} Current tier is ${tier}.`))
   }
   await fetch("/api/history",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:activeQuery,result:json.result,tier,provider:json.provider})})
  } finally { setBusy(false) }
 }

 async function requestDownload(){
  if(!result)return
  const res=await fetch("/api/download",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({wallet,tier,asset:result.result?.glbUrl || result.result?.downloadUrl || result.result?.url,modelUid:result.result?.uid})})
  const json=await res.json()
  setToast(json.message)
 }

 function voice(){
  const R=window.SpeechRecognition||window.webkitSpeechRecognition
  if(!R)return alert("Voice not supported")
  const rec=new R(); rec.onresult=e=>setQuery(e.results[0][0].transcript); rec.start()
 }

 const providers=health?.providers || {}
 const paymentWallet=providers.paymentWallet || subscription?.payment_wallet || "0x3121FbFB683B9147913f336b05eF419b875a7590"
 const glbStatus=result?.result?.glbUrl?"live GLB":"feed route only"

 return <main style={shell}>
  <section style={hero}>
   <div>
    <div style={eyebrow}>DigitalHut Production Console</div>
    <h1 style={title}>Operational observatory, market, wallet, and render readiness.</h1>
    <p style={lede}>FireCuda measurements are now reflected in the customer frontend: provider health, launch scores, feed routes, wallet tiering, crypto subscription destination, and renderer diagnostics.</p>
    <div style={actions}>
     <button onClick={()=>scan()} style={primary}>{busy?"Scanning":"Run Observatory Scan"}</button>
     <button onClick={voice} style={secondary}>Voice</button>
     <a href="/market-intelligence" style={linkBtn}>Market Intelligence</a>
    </div>
   </div>
   <div style={opsPanel}>
    <div style={panelHeader}><h2 style={h2}>Render Provider Health</h2><span style={pill}>{health?.status || "checking"}</span></div>
    <Status label="Supabase" on={providers.supabase}/>
    <Status label="Sketchfab" on={providers.sketchfab}/>
    <Status label="Alpaca" on={providers.alpaca}/>
    <Status label="Payment Wallet" on={providers.paymentWalletConfigured}/>
    <button onClick={refreshHealth} style={smallBtn}>Refresh health</button>
   </div>
  </section>

  <section style={scoreGrid}>
   {measurements.map(([label,value])=><div key={label} style={scoreCard}><span>{label} Score</span><b>{value}</b></div>)}
   <div style={scoreCard}><span>Trend</span><b style={{fontSize:28}}>Improving</b></div>
  </section>

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
   </div>

   <div style={panel}>
    <div style={panelHeader}><h2 style={h2}>Observatory Search</h2><span style={pill}>{glbStatus}</span></div>
    <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search terrain, planetary, structures, maps..." style={input}/>
    <div style={actions}><button onClick={()=>scan()} style={primary}>{busy?"Scanning":"Search"}</button><button onClick={()=>setQuery(signal.query)} style={secondary}>Use Signal</button></div>
    <p style={muted}>{toast}</p>
   </div>
  </section>

  {result&&<section style={renderGrid}>
   <BabylonObservatory modelUrl={result.result?.glbUrl || result.result?.downloadUrl} title={result.result?.title}/>
   <div style={panel}>
    <div style={eyebrow}>{result.provider}</div>
    <h2 style={resultTitle}>{result.result?.title}</h2>
    {result.result?.image&&<img src={result.result.image} alt="Sketchfab model preview" style={preview}/>} 
    <p style={muted}>{result.ai}</p>
    <p style={mono}>Download status: {result.result?.downloadStatus || "not requested"}</p>
    <div style={actions}><a href={result.result?.url} target="_blank" style={linkBtn}>Open feed</a><button onClick={requestDownload} style={secondary}>Authorize GLB Download</button></div>
   </div>
  </section>}

  <section style={libraryBand}>
   <a href="/library" style={navTile}><span>Library</span><b>GLB discovery routes</b></a>
   <a href="/market-intelligence" style={navTile}><span>Market</span><b>Live chart diagnostics</b></a>
  </section>
 </main>
}

function Status({label,on}){return <div style={statusRow}><span>{label}</span><b style={on?good:warn}>{on?"live":"check"}</b></div>}

const shell={minHeight:"100vh",padding:28,background:"radial-gradient(circle at top left,#12343b 0,#020617 35%,#07111f 100%)",color:"white",fontFamily:"Arial, sans-serif"}
const hero={maxWidth:1180,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 360px",gap:20,alignItems:"stretch"}
const eyebrow={fontSize:12,textTransform:"uppercase",letterSpacing:0,fontWeight:900,color:"#67e8f9"}
const title={fontSize:"clamp(42px,7vw,78px)",lineHeight:.96,letterSpacing:0,margin:"10px 0 18px",maxWidth:840}
const lede={fontSize:18,lineHeight:1.55,color:"#d8e4ee",maxWidth:760}
const actions={display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}
const primary={padding:"14px 18px",borderRadius:8,background:"#14b8a6",color:"#021014",border:0,fontWeight:900,cursor:"pointer"}
const secondary={padding:"14px 18px",borderRadius:8,background:"rgba(226,232,240,.1)",color:"white",border:"1px solid rgba(226,232,240,.24)",fontWeight:800,cursor:"pointer",textDecoration:"none"}
const linkBtn={display:"inline-block",padding:"13px 16px",borderRadius:8,background:"#38bdf8",color:"#06111a",fontWeight:900,textDecoration:"none"}
const opsPanel={border:"1px solid rgba(148,163,184,.28)",borderRadius:8,background:"rgba(8,20,32,.82)",padding:18,display:"grid",gap:12}
const panelHeader={display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",marginBottom:10}
const h2={fontSize:22,margin:0}
const pill={fontSize:12,padding:"7px 10px",borderRadius:999,background:"rgba(103,232,249,.12)",color:"#a5f3fc",fontWeight:900}
const statusRow={display:"flex",justifyContent:"space-between",gap:14,borderBottom:"1px solid rgba(148,163,184,.16)",paddingBottom:8}
const good={color:"#86efac"}
const warn={color:"#facc15"}
const smallBtn={padding:"12px 14px",borderRadius:8,border:0,background:"#0ea5e9",color:"#03121d",fontWeight:900,cursor:"pointer"}
const scoreGrid={maxWidth:1180,margin:"22px auto",display:"grid",gridTemplateColumns:"repeat(7,minmax(120px,1fr))",gap:10}
const scoreCard={padding:16,border:"1px solid rgba(148,163,184,.25)",borderRadius:8,background:"rgba(15,23,42,.7)",display:"grid",gap:8}
const mainGrid={maxWidth:1180,margin:"22px auto",display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:18}
const panel={padding:20,border:"1px solid rgba(148,163,184,.25)",borderRadius:8,background:"rgba(15,23,42,.74)"}
const walletBtn={width:"100%",padding:16,borderRadius:8,border:"1px solid rgba(226,232,240,.22)",background:"#172554",color:"white",fontWeight:900,marginBottom:14,cursor:"pointer"}
const tierGrid={display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:8}
const tierBtn={minHeight:72,borderRadius:8,border:"1px solid rgba(226,232,240,.18)",background:"rgba(2,6,23,.55)",color:"white",display:"grid",gap:4,placeItems:"center",cursor:"pointer"}
const activeTier={...tierBtn,border:"1px solid #facc15",background:"rgba(250,204,21,.14)"}
const payRow={display:"grid",gridTemplateColumns:"120px 1fr",gap:10,marginTop:14}
const select={padding:13,borderRadius:8,border:"1px solid rgba(226,232,240,.24)",background:"#020617",color:"white",fontWeight:900}
const mono={fontFamily:"monospace",fontSize:13,color:"#cbd5e1",overflowWrap:"anywhere"}
const input={width:"100%",boxSizing:"border-box",padding:16,borderRadius:8,margin:"2px 0 14px",fontSize:18,border:"1px solid rgba(226,232,240,.22)",background:"#020617",color:"white"}
const muted={color:"#cbd5e1",lineHeight:1.5}
const renderGrid={maxWidth:1180,margin:"22px auto",display:"grid",gridTemplateColumns:"1.1fr .9fr",gap:18}
const resultTitle={fontSize:30,margin:"8px 0 12px"}
const preview={width:"100%",aspectRatio:"16 / 9",objectFit:"cover",borderRadius:8,background:"#0f172a",marginBottom:12}
const libraryBand={maxWidth:1180,margin:"22px auto 0",display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:18}
const navTile={padding:22,borderRadius:8,border:"1px solid rgba(148,163,184,.25)",background:"rgba(226,232,240,.08)",color:"white",textDecoration:"none",display:"grid",gap:8}
