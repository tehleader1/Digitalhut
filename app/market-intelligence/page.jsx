"use client"
import {useState} from "react"
export default function Market(){
 const [q,setQ]=useState("BTC")
 const [r,setR]=useState(null)
 async function scan(){
  const res=await fetch("/api/market",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:q})})
  setR(await res.json())
  speechSynthesis?.speak(new SpeechSynthesisUtterance("Market scan ready for "+q))
 }
 function voice(){
  const R=window.SpeechRecognition||window.webkitSpeechRecognition
  if(!R)return alert("Voice not supported")
  const rec=new R(); rec.onresult=e=>setQ(e.results[0][0].transcript); rec.start()
 }
 return <main style={{padding:24}}>
  <a href="/" style={{color:"#8b5cf6"}}>← Home</a>
  <h1>Observatory Market Intelligence</h1>
  <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Stock, option, crypto..." style={input}/>
  <button onClick={scan} style={btn}>Search Market</button>
  <button onClick={voice} style={btn}>Voice Search</button>
  {r&&<section style={card}>
   <h2>{r.symbol}</h2>
   <div style={{display:"flex",alignItems:"end",gap:6,height:140}}>
    {r.candles.map((v,i)=><div key={i} style={{width:20,height:v*4,background:"#22c55e"}} />)}
   </div>
   <p>{r.ai}</p>
  </section>}
 </main>
}
const input={width:"100%",padding:16,borderRadius:14,margin:"12px 0",fontSize:18}
const btn={padding:"14px 18px",borderRadius:14,margin:6,background:"#7c3aed",color:"white",border:0,fontWeight:800}
const card={marginTop:20,padding:24,border:"1px solid #334155",borderRadius:22,background:"#0f172a"}
