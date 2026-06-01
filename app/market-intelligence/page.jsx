"use client"
import {useEffect, useState} from "react"

export default function Market(){
 const [q,setQ]=useState("BTC")
 const [r,setR]=useState(null)
 const [health,setHealth]=useState(null)
 const [busy,setBusy]=useState(false)

 useEffect(()=>{ refreshHealth() },[])

 async function refreshHealth(){
  const res=await fetch("/health",{cache:"no-store"})
  setHealth(await res.json())
 }

 async function scan(){
  setBusy(true)
  const res=await fetch("/api/market",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:q})})
  const json=await res.json()
  setR(json)
  setBusy(false)
  if(typeof window!=="undefined" && "speechSynthesis" in window){
   window.speechSynthesis.cancel()
   window.speechSynthesis.speak(new SpeechSynthesisUtterance(json.ai))
  }
 }

 function voice(){
  const R=window.SpeechRecognition||window.webkitSpeechRecognition
  if(!R)return alert("Voice not supported")
  const rec=new R(); rec.onresult=e=>setQ(e.results[0][0].transcript); rec.start()
 }

 const alpacaLive = Boolean(health?.providers?.alpaca)
 const provider = r?.provider || (alpacaLive?"alpaca-ready":"awaiting-live-candles")

 return <main style={shell}>
  <a href="/" style={back}>Back to DigitalHut</a>
  <section style={hero}>
   <div>
    <div style={eyebrow}>Market Intelligence</div>
    <h1 style={title}>Live market renderer and signal desk.</h1>
    <p style={lede}>Alpaca data feeds, timed candles, voice analysis, and provider diagnostics are surfaced here so Render problems are visible instead of hidden.</p>
   </div>
   <div style={statusPanel}>
    <div style={statusRow}><span>Render health</span><b>{health?.status || "checking"}</b></div>
    <div style={statusRow}><span>Alpaca env</span><b style={alpacaLive?good:warn}>{alpacaLive?"connected":"missing"}</b></div>
    <div style={statusRow}><span>Provider</span><b>{provider}</b></div>
    <button onClick={refreshHealth} style={smallBtn}>Refresh status</button>
   </div>
  </section>

  <section style={desk}>
   <div style={searchRow}>
    <input value={q} onChange={e=>setQ(e.target.value)} placeholder="BTC, ETH, AAPL, TSLA..." style={input}/>
    <button onClick={scan} style={primary}>{busy?"Scanning":"Search Market"}</button>
    <button onClick={voice} style={secondary}>Voice</button>
   </div>
   <div style={chartCard}>
    <div style={chartHeader}>
     <div><span style={eyebrow}>{r?.provider || "standby"}</span><h2 style={symbol}>{r?.symbol || q.toUpperCase()}</h2></div>
     <div style={price}>{r?.price || "Waiting for scan"}</div>
    </div>
    <div style={bars}>
     {(r?.candles || [12,15,13,18,17,22,20,26,24,29]).map((v,i)=><div key={i} style={{...bar,height:Math.max(18,v*4)}} />)}
    </div>
    <p style={analysis}>{r?.ai || "Run a scan to verify whether Render is receiving live Alpaca candles or falling back."}</p>
   </div>
  </section>
 </main>
}

const shell={minHeight:"100vh",padding:28,background:"linear-gradient(135deg,#051923,#020617 45%,#111827)",color:"white",fontFamily:"Arial, sans-serif"}
const back={color:"#67e8f9",fontWeight:800,textDecoration:"none"}
const hero={maxWidth:1120,margin:"24px auto",display:"grid",gridTemplateColumns:"1fr 360px",gap:18,alignItems:"stretch"}
const eyebrow={fontSize:12,textTransform:"uppercase",letterSpacing:0,fontWeight:900,color:"#67e8f9"}
const title={fontSize:"clamp(42px,7vw,76px)",lineHeight:.95,margin:"8px 0 16px",letterSpacing:0}
const lede={fontSize:18,lineHeight:1.55,color:"#dbeafe",maxWidth:760}
const statusPanel={border:"1px solid rgba(148,163,184,.28)",borderRadius:8,background:"rgba(15,23,42,.76)",padding:18,display:"grid",gap:12}
const statusRow={display:"flex",justifyContent:"space-between",gap:14,borderBottom:"1px solid rgba(148,163,184,.16)",paddingBottom:10}
const good={color:"#86efac"}
const warn={color:"#facc15"}
const smallBtn={padding:"12px 14px",borderRadius:8,border:0,background:"#0ea5e9",color:"#03121d",fontWeight:900,cursor:"pointer"}
const desk={maxWidth:1120,margin:"0 auto",display:"grid",gap:18}
const searchRow={display:"grid",gridTemplateColumns:"1fr auto auto",gap:10}
const input={padding:16,borderRadius:8,border:"1px solid rgba(148,163,184,.34)",background:"#020617",color:"white",fontSize:18}
const primary={padding:"14px 18px",borderRadius:8,border:0,background:"#14b8a6",fontWeight:900,cursor:"pointer"}
const secondary={padding:"14px 18px",borderRadius:8,border:"1px solid rgba(148,163,184,.34)",background:"rgba(148,163,184,.12)",color:"white",fontWeight:900,cursor:"pointer"}
const chartCard={border:"1px solid rgba(148,163,184,.28)",borderRadius:8,background:"rgba(3,7,18,.74)",padding:22}
const chartHeader={display:"flex",justifyContent:"space-between",gap:18,alignItems:"start"}
const symbol={fontSize:44,margin:"4px 0 0"}
const price={fontSize:24,fontWeight:900,color:"#bbf7d0"}
const bars={height:220,display:"flex",alignItems:"end",gap:10,padding:"18px 0",borderBottom:"1px solid rgba(148,163,184,.2)"}
const bar={width:30,background:"linear-gradient(#86efac,#22c55e)",borderRadius:"6px 6px 0 0",boxShadow:"0 0 18px rgba(34,197,94,.25)"}
const analysis={fontSize:17,lineHeight:1.55,color:"#dbeafe"}
