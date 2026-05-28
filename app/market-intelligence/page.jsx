"use client"

import {useEffect,useState} from "react"

const DEFAULT="AAPL"

export default function Market(){

 const [query,setQuery]=useState(DEFAULT)

 const [symbol,setSymbol]=useState(DEFAULT)

 const [voice,setVoice]=useState("")

 const [info,setInfo]=useState({
  region:"Loading...",
  industrial:"Loading...",
  housing:"Loading...",
  technicals:"Loading..."
 })

 useEffect(()=>{

  async function load(){

   try{

    const q=symbol.toUpperCase()

    let region=""
    let industrial=""
    let housing=""
    let technicals=""

    if(q.includes("AAPL")){
     region="United States • California • New York • China"
     industrial="Consumer electronics • semiconductors • manufacturing"
     housing="Retail and logistics pressure affecting Walmart, Home Depot, Lowe's, IKEA"
     technicals="MACD bullish • MA20 above MA50 • volume holding"
    }

    else if(q.includes("NVDA")){
     region="United States • Taiwan • China"
     industrial="AI chips • datacenters • semiconductor infrastructure"
     housing="AI infrastructure expansion influencing commercial construction"
     technicals="Gap continuation • strong volume • MA50 support"
    }

    else if(q.includes("BTC")){
     region="Global • United States • UAE • Asia"
     industrial="Mining infrastructure • energy systems • datacenters"
     housing="Crypto wealth flows influencing luxury real estate"
     technicals="Liquidity sweep complete • MA200 support • volatility elevated"
    }

    else if(q.includes("ETH")){
     region="Global • Europe • United States"
     industrial="Layer 2 infrastructure • smart contracts"
     housing="Tech-city growth and developer expansion"
     technicals="Volume spike detected • support holding"
    }

    else{
     region="Global market mapping active"
     industrial="Industrial observatory scanning"
     housing="Housing observatory scanning"
     technicals="Technical observatory calculating"
    }

    setInfo({
     region,
     industrial,
     housing,
     technicals
    })

    setVoice(`
      ${q}.
      Region mapping:
      ${region}.
      Industrial layer:
      ${industrial}.
      Housing intelligence:
      ${housing}.
      Technical observatory:
      ${technicals}.
    `)

   }catch(e){
    console.log(e)
   }

  }

  load()

 },[symbol])

 function speak(){

  speechSynthesis.cancel()

  const u=
   new SpeechSynthesisUtterance(voice)

  u.rate=.93

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
  font-size:clamp(58px,10vw,130px);
  line-height:.9;
  margin:0 0 24px;
 }

 p{
  color:#cbd5e1;
  line-height:1.6;
  font-size:20px;
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
   Real-time observatory trading runtime
   with searchable stock options,
   crypto intelligence,
   mapped locations,
   industrial overlays,
   housing pressure,
   technical observatory systems,
   and AI voice interaction.
  </p>

  <div className="search">

   <input
    value={query}
    onChange={e=>setQuery(e.target.value)}
    placeholder="
     Search:
     AAPL,
     BTC,
     NVDA,
     ETH,
     TSLA,
     SPY,
     AMD
    "
   />

   <button onClick={()=>{
    setSymbol(query)
   }}>
    Run Observatory Signal
   </button>

   <button onClick={speak}>
    Voice Observatory
   </button>

  </div>

 </section>

 <section className="layout">

  <div className="panel">

   <iframe
    src={`https://s.tradingview.com/widgetembed/?symbol=${symbol.toUpperCase()}&interval=60&theme=dark`}
   />

  </div>

  <div className="info">

   <div className="metric">
    <b>{symbol.toUpperCase()}</b>
    <span>Primary Signal</span>
   </div>

   <div className="metric">
    <b>Mapped Locations</b>
    <span>{info.region}</span>
   </div>

   <div className="metric">
    <b>Industrial Layer</b>
    <span>{info.industrial}</span>
   </div>

   <div className="metric">
    <b>Housing Intelligence</b>
    <span>{info.housing}</span>
   </div>

   <div className="metric">
    <b>Technical Observatory</b>
    <span>{info.technicals}</span>
   </div>

  </div>

 </section>

 </main>

 )

}
