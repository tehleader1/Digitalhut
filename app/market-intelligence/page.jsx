"use client"

import {useEffect,useState} from "react"

export default function Market(){

 const [query,setQuery]=useState("AAPL")

 const [symbol,setSymbol]=useState("AAPL")

 const [info,setInfo]=useState({
  company:"",
  exchange:"",
  industry:"",
  country:"",
  ipo:"",
  marketCap:"",
  weburl:"",
  technicals:"",
  bias:"",
  price:"",
  industrial:"",
  housing:"",
  mapped:""
 })

 async function loadSymbol(sym){

  try{

   const key=
    process.env
    .NEXT_PUBLIC_FINNHUB_KEY

   const upper=sym.toUpperCase()

   const profile=await fetch(
    `https://finnhub.io/api/v1/stock/profile2?symbol=${upper}&token=${key}`
   ).then(r=>r.json())

   const quote=await fetch(
    `https://finnhub.io/api/v1/quote?symbol=${upper}&token=${key}`
   ).then(r=>r.json())

   let bias="Neutral"

   if(quote.c>quote.pc){
    bias="Bullish"
   }

   if(quote.c<quote.pc){
    bias="Bearish"
   }

   const industry=
    profile.finnhubIndustry ||
    "Unknown Industry"

   const country=
    profile.country ||
    "Global"

   const exchange=
    profile.exchange ||
    "Unknown Exchange"

   const mapped=
    `
    ${country}
    •
    ${exchange}
    •
    ${industry}
    `

   const industrial=
    `
    ${industry}
    infrastructure,
    supply chains,
    industrial systems,
    sector expansion
    `

   const housing=
    `
    ${country}
    economic pressure,
    regional housing influence,
    infrastructure demand,
    commercial development
    `

   const technicals=
    `
    Current:
    ${quote.c || "?"}

    High:
    ${quote.h || "?"}

    Low:
    ${quote.l || "?"}

    Previous Close:
    ${quote.pc || "?"}
    `

   setInfo({

    company:
     profile.name || upper,

    exchange,

    industry,

    country,

    ipo:
     profile.ipo || "Unknown",

    marketCap:
     profile.marketCapitalization || "Unknown",

    weburl:
     profile.weburl || "",

    technicals,

    bias,

    price:
     quote.c || "?",

    industrial,

    housing,

    mapped

   })

  }catch(e){

   console.log(e)

  }

 }

 useEffect(()=>{
  loadSymbol(symbol)
 },[symbol])

 function speak(){

  speechSynthesis.cancel()

  const text=`
   ${info.company}.

   Observatory mapping:
   ${info.mapped}.

   Industrial layer:
   ${info.industrial}.

   Housing intelligence:
   ${info.housing}.

   Technical observatory:
   ${info.technicals}.

   Final observatory bias:
   ${info.bias}.
  `

  const u=
   new SpeechSynthesisUtterance(text)

  u.rate=.92

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
   Live observatory runtime for
   NASDAQ,
   NYSE,
   S&P500,
   crypto,
   industrial mapping,
   housing intelligence,
   technical observatory analysis,
   and AI voice interaction.
  </p>

  <div className="search">

   <input
    value={query}
    onChange={e=>setQuery(e.target.value)}
    placeholder="
     Search:
     MMAT,
     TSLA,
     NVDA,
     AMD,
     BTC,
     ETH,
     SPY
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
    <b>{info.company}</b>
    <span>{symbol.toUpperCase()}</span>
   </div>

   <div className="metric">
    <b>Mapped Locations</b>
    <span>{info.mapped}</span>
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
    <b>Market Cap</b>
    <span>{info.marketCap}</span>
   </div>

   <div className="metric">
    <b>Technical Observatory</b>
    <span>{info.technicals}</span>
   </div>

   <div className="metric">
    <b className={
      info.bias==="Bullish"
      ?"bull"
      :"bear"
    }>
      {info.bias}
    </b>

    <span>Final Observatory Bias</span>

   </div>

  </div>

 </section>

 </main>

 )

}
