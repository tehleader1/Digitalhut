"use client"
import {useState} from "react"

export default function Market(){
  const [q,setQ]=useState("")
  const [out,setOut]=useState("Search stocks, options, crypto, market signals, or ticker symbols.")
  function speak(t){speechSynthesis.speak(new SpeechSynthesisUtterance(t))}
  function search(x=q){
    const text=`Observatory Market Intelligence AI: ${x || "market"} signal loaded. Showing stock/crypto search, option interest, volatility, trend detail, and subscription-grade market response.`
    setOut(text); speak(text)
  }
  function voice(){
    const R=window.SpeechRecognition||window.webkitSpeechRecognition
    if(!R) return alert("Voice not supported.")
    const r=new R()
    r.onresult=e=>{const text=e.results[0][0].transcript; setQ(text); search(text)}
    r.start()
  }
  return <main style={{background:"#050816",color:"white",minHeight:"100vh",padding:"30px",fontFamily:"Arial"}}>
    <a href="/" style={btn}>Back to Observatory</a>
    <section style={card}>
      <h1>Observatory Intelligence Market</h1>
      <p>Stock, option, crypto, AI market detail response and voice search.</p>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search AAPL options, TSLA, BTC, ETH, SPY..." style={input}/>
      <button style={btn} onClick={()=>search()}>Market Search</button>
      <button style={btn} onClick={voice}>Voice Market Search</button>
      <div style={result}>{out}</div>
    </section>
  </main>
}
const card={background:"#111827",border:"1px solid #26334f",borderRadius:"28px",padding:"28px",margin:"22px 0"}
const btn={display:"inline-block",background:"#6d3df2",color:"white",padding:"14px 22px",borderRadius:"18px",border:"0",fontWeight:"900",margin:"8px",textDecoration:"none"}
const input={width:"100%",background:"#050816",color:"white",border:"1px solid #26334f",borderRadius:"18px",padding:"16px",fontSize:"18px"}
const result={background:"#050816",padding:"18px",borderRadius:"18px",marginTop:"15px"}
