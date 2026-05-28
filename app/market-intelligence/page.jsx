"use client"

export default function Market(){

 return (

 <main style={{
  minHeight:"100vh",
  background:"#020617",
  color:"white",
  padding:"24px",
  fontFamily:"Arial"
 }}>

  <h1 style={{
   fontSize:"clamp(54px,9vw,120px)",
   lineHeight:".9"
  }}>
   Observatory
   <br/>
   Market Intelligence
  </h1>

  <p style={{
   color:"#cbd5e1",
   fontSize:"22px",
   lineHeight:"1.6",
   maxWidth:"1100px"
  }}>
   Smart-screen observatory trading runtime with searchable stock options,
   crypto intelligence,
   technical overlays,
   touch drawing,
   support/resistance,
   liquidity pools,
   MACD,
   moving averages,
   and infrastructure-linked market mapping.
  </p>

  <div style={{
   background:"#0f172a",
   border:"1px solid #334155",
   borderRadius:"32px",
   overflow:"hidden",
   marginTop:"30px"
  }}>

   <iframe
    src="https://s.tradingview.com/widgetembed/?symbol=AAPL&interval=60&theme=dark"
    style={{
     width:"100%",
     height:"75vh",
     border:"0"
    }}
   />

  </div>

 </main>

 )

}
