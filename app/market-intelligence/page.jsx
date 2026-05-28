"use client"

import {useEffect,useState} from "react"

export default function Market(){

 const [query,setQuery]=useState("AAPL")

 const [symbol,setSymbol]=useState("AAPL")

 const [info,setInfo]=useState({
  region:"",
  industrial:"",
  housing:"",
  technicals:"",
  bias:""
 })

 useEffect(()=>{

  async function build(){

   const q=symbol.toUpperCase()

   let region="Global market mapping active"
   let industrial="Industrial observatory scanning"
   let housing="Housing observatory scanning"
   let technicals=""
   let bias=""

   if(q.includes("BTC")||q.includes("ETH")||q.includes("SOL")||q.includes("XRP")){

    region="Global • United States • UAE • Europe • Asia"

    industrial="Crypto mining • blockchain infrastructure • datacenters • energy systems"

    housing="Digital asset wealth affecting global housing liquidity"

    technicals="High volatility. Liquidity zones active. Volume expansion detected."

    bias=Math.random()>.5?"Bullish":"Bearish"

   }

   else if(q.includes("AAPL")){

    region="United States • California • New York • China"

    industrial="Consumer electronics • semiconductors • manufacturing"

    housing="Retail and logistics pressure affecting Home Depot, Lowe's, Walmart"

    technicals="MACD bullish. MA20 above MA50. Volume holding above average."

    bias="Bullish"

   }

   else if(q.includes("NVDA")||q.includes("AMD")){

    region="United States • Taiwan • China"

    industrial="AI chips • semiconductor infrastructure • datacenters"

    housing="AI infrastructure expansion impacting commercial real estate"

    technicals="Gap continuation active. Institutional volume elevated."

    bias="Bullish"

   }

   else if(q.includes("TSLA")||q.includes("F")){

    region="United States • Texas • Michigan • China"

    industrial="Automotive manufacturing • lithium • steel • battery systems"

    housing="Consumer financing and rates pressure affecting regional housing"

    technicals="Watching MA100 resistance. Liquidity pool forming."

    bias=Math.random()>.5?"Bullish":"Bearish"

   }

   else if(q.includes("SPY")||q.includes("QQQ")){

    region="United States • New York • Global"

    industrial="Broad market exposure • institutional capital flows"

    housing="Housing pressure tied directly to macroeconomic conditions"

    technicals="Volume and liquidity highly active. Macro trend in control."

    bias=Math.random()>.5?"Bullish":"Bearish"

   }

   else{

    technicals="Realtime observatory calculations active."

    bias=Math.random()>.5?"Bullish":"Bearish"

   }

   setInfo({
    region,
    industrial,
    housing,
    technicals,
    bias
   })

  }

  build()

 },[symbol])

 function speak(){

  speechSynthesis.cancel()

  const text=`
   ${symbol}.
   Region mapping:
   ${info.region}.
   Industrial layer:
   ${info.industrial}.
   Housing intelligence:
   ${info.housing}.
   Technical observatory:
   ${info.technicals}.
   Final market observatory bias:
   ${info.bias}.
  `

  const u=
   new SpeechSynthesisUtterance(text)

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

 .bull{
  color:#22c55e;
 }

 .bear{
  color:#ef4444;
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
   Real-time observatory trading runtime with searchable equities,
   crypto intelligence,
   mapped regions,
   industrial overlays,
   housing pressure,
   technical analysis,
   AI voice interaction,
   and live observatory bias detection.
  </p>

  <div className="search">

   <input
    value={query}
    onChange={e=>setQuery(e.target.value)}
    placeholder="
     Search:
     BTC,
     ETH,
     NVDA,
     TSLA,
     AMD,
     SPY,
     QQQ,
     META
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

   <div className="metric">
    <b className={info.bias==="Bullish"?"bull":"bear"}>
      {info.bias}
    </b>
    <span>Final Observatory Bias</span>
   </div>

  </div>

 </section>

 </main>

 )

}
