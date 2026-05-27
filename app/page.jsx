"use client"

export default function Home() {
  return (
    <main style={{
      minHeight:"100vh",
      background:"#020617",
      color:"white",
      padding:"40px",
      fontFamily:"Arial"
    }}>
      <h1 style={{
        fontSize:"64px",
        fontWeight:"900",
        marginBottom:"20px"
      }}>
        DigitalHut Observatory
      </h1>

      <p style={{
        fontSize:"22px",
        maxWidth:"800px",
        lineHeight:"1.6",
        color:"#cbd5e1"
      }}>
        AI-native observatory infrastructure for live 3D exploration,
        behavior intelligence, wallet access, BabylonJS environments,
        voice-guided discovery, and internet-fed research systems.
      </p>

      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",
        gap:"20px",
        marginTop:"50px"
      }}>
        {[
          "3D Observatory",
          "Behavior Intelligence",
          "Wallet Access",
          "Voice AI",
          "BabylonJS Runtime",
          "Research Feed"
        ].map((x)=>(
          <div key={x} style={{
            background:"#111827",
            border:"1px solid #334155",
            borderRadius:"20px",
            padding:"25px"
          }}>
            <h2>{x}</h2>
          </div>
        ))}
      </div>
    </main>
  )
}
