"use client"
import {useState} from "react"
const tiers={free:0,standard:35,premium:50,pro:100}
export default function Home(){
 const [wallet,setWallet]=useState("")
 const [tier,setTier]=useState("free")
 const [query,setQuery]=useState("")
 const [result,setResult]=useState(null)
 async function connect(){ const w="0xDEMO"+Math.random().toString(16).slice(2,8); setWallet(w); await fetch("/api/account",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({wallet:w})})}
 async function activate(t){setTier(t); await fetch("/api/set-tier",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({wallet,tier:t})})}
 async function scan(){
  const res=await fetch("/api/sketchfab",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query})})
  const json=await res.json(); setResult(json)
  speechSynthesis?.speak(new SpeechSynthesisUtterance(json.ai))
  await fetch("/api/history",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query,result:json.result,tier})})
 }
 function voice(){
  const R=window.SpeechRecognition||window.webkitSpeechRecognition
  if(!R)return alert("Voice not supported")
  const rec=new R(); rec.onresult=e=>setQuery(e.results[0][0].transcript); rec.start()
 }
 return <main style={{padding:24,maxWidth:980,margin:"auto"}}>
  <h1 style={{fontSize:52}}>DigitalHut Observatory</h1>
  <p>Babylon + Sketchfab observatory feed, wallet tiers, voice search, AI response, library, and market intelligence.</p>
  <section style={card}>
   <h2>Wallet Access</h2>
   <button onClick={connect} style={btn}>{wallet?wallet:"Connect Wallet"}</button>
   <p>Current tier: <b>{tier.toUpperCase()}</b></p>
   {Object.entries(tiers).map(([t,p])=><button key={t} onClick={()=>activate(t)} style={btn}>{t.toUpperCase()} ${p}</button>)}
  </section>
  <section style={card}>
   <h2>Observatory Search</h2>
   <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search terrain, planetary, geographical, structures, maps..." style={input}/>
   <button onClick={scan} style={btn}>Search Observatory</button>
   <button onClick={voice} style={btn}>Voice Search</button>
   {result&&<div style={card}><h3>{result.result.title}</h3><p>{result.ai}</p><a href={result.result.url} target="_blank" style={{color:"#38bdf8"}}>Open Sketchfab feed</a></div>}
  </section>
  <section style={card}>
   <h2>Library</h2>
   <a href="/library" style={btn}>Open Library</a>
   <a href="/market-intelligence" style={btn}>Observatory Market Intelligence</a>
  </section>
 </main>
}
const card={margin:"20px 0",padding:24,border:"1px solid #334155",borderRadius:24,background:"#0f172a"}
const input={width:"100%",padding:16,borderRadius:14,margin:"12px 0",fontSize:18}
const btn={display:"inline-block",padding:"14px 18px",borderRadius:14,margin:6,background:"#7c3aed",color:"white",border:0,fontWeight:800,textDecoration:"none"}
