"use client"

import {useState} from "react"

const DATA={

 AAPL:{
  symbol:"AAPL",
  company:"Apple",
  region:"United States • California • New York • China",
  industrial:"Consumer electronics, semiconductors, manufacturing",
  housing:"Retail pressure impacts Walmart, Home Depot, Lowe's, IKEA logistics demand",
  technicals:"MACD bullish. MA20 above MA50. Volume holding above average.",
  chart:"AAPL"
 },

 BTC:{
  symbol:"BTCUSD",
  company:"Bitcoin",
  region:"Global • United States • UAE • Asia",
  industrial:"Mining infrastructure, energy systems, datacenter growth",
  housing:"Crypto wealth affecting luxury housing flows",
  technicals:"Liquidity sweep complete. MA200 support holding.",
  chart:"BTCUSD"
 },

 NVDA:{
  symbol:"NVDA",
  company:"NVIDIA",
  region:"United States • Taiwan • China",
  industrial:"AI chips, datacenter infrastructure",
  housing:"AI expansion impacting commercial construction demand",
  technicals:"Gap up continuation. High institutional volume.",
  chart:"NVDA"
 }

}

export default function Market(){

 const [query,setQuery]=useState("AAPL")

 const current=
  DATA[
   query.toUpperCase()
  ] || DATA.AAPL

 function speak(){

  speechSynthesis.cancel()

  const text=`
   ${current.company}.
   Region mapping:
   ${current.region}.
   Industrial layer:
   ${current.industrial}.
   Housing intelligence:
   ${current.housing}.
   Technical observatory:
   ${current.technicals}
  `

  const u=
   new SpeechSynthesisUtterance(text)

  u.rate=.94

  speechSynthesis.speak(u)

 }

 return (

 <main style={{
  minHeight:"100vh",
  background:"#020617",
  color:"white",
  padding:"24px",
  fontFamily:"Arial"
 }}>

 <style>{`

 h1{
  font-size:clamp(54px,10vw,120px);
  line-height:.9;
  margin:0 0 24px;
 }

 p{
  color:#cbd5e1;
  font-size:20px;
  line-height:1.6;
 }

 .hero{
  background:#0f172a;
  border:1px solid #334155;
  border-radius:34px;
  padding:30px;
  margin-bottom:24px;
 }

 .search{
  display:flex;
  gap:12px;
  flex-wrap:wrap;
  margin-top:20px;
 }

 input{
  flex:1;
  min-width:220px;
  background:#020617;
  color:white;
  border:1px solid #334155;
  border-radius:18px;
  padding:16px;
  font-size:18px;
 }

 button{
  background:
   linear-gradient(
    135deg,
    #2563eb,
    #7c3aed
   );

  color:white;
  border:0;
  border-radius:18px;
  padding:16px 20px;
  font-weight:900;
 }

 .layout{
  display:grid;
  grid-template-columns:1.4fr .8fr;
  gap:22px;
 }

 .panel{
  background:#0f172a;
  border:1px solid #334155;
  border-radius:30px;
  overflow:hidden;
 }

 iframe{
  width:100%;
  height:76vh;
  border:0;
 }

 .info{
  padding:24px;
 }

 .metric{
  background:#020617;
  border:1px solid #334155;
  border-radius:22px;
  padding:18px;
  margin-bottom:16px;
 }

 .metric b{
  display:block;
  font-size:30px;
  margin-bottom:10px;
 }

 @media(max-width:900px){

  .layout{
   grid-template-columns:1fr;
  }

 }

 `}</style>

 <section className="hero">

  <h1>
   Observatory
   <br/>
   Market Intelligence
  </h1>

  <p>
   Smart-screen observatory trading runtime with searchable stocks,
   crypto intelligence,
   technical overlays,
   mapped regions,
   industrial analysis,
   housing pressure,
   liquidity pools,
   MACD,
   moving averages,
   and AI voice observatory interaction.
  </p>

  <div className="search">

   <input
    value={query}
    onChange={e=>setQuery(e.target.value)}
    placeholder="Search AAPL, BTC, NVDA..."
   />

   <button onClick={speak}>
    Voice Observatory
   </button>

  </div>

 </section>

 <section className="layout">

  <div className="panel">

   <iframe
    src={`https://s.tradingview.com/widgetembed/?symbol=${current.chart}&interval=60&theme=dark`}
   />

  </div>

  <div className="info">

   <div className="metric">
    <b>{current.company}</b>
    <span>{current.symbol}</span>
   </div>

   <div className="metric">
    <b>Mapped Locations</b>
    <span>{current.region}</span>
   </div>

   <div className="metric">
    <b>Industrial Layer</b>
    <span>{current.industrial}</span>
   </div>

   <div className="metric">
    <b>Housing Intelligence</b>
    <span>{current.housing}</span>
   </div>

   <div className="metric">
    <b>Technical Observatory</b>
    <span>{current.technicals}</span>
   </div>

  </div>

 </section>

 </main>

 )

}
