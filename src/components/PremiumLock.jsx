import React from "react"

export default function PremiumLock(){

  return(

    <section
      style={{
        margin:"20px",
        display:"grid",
        gridTemplateColumns:
          "repeat(auto-fit,minmax(220px,1fr))",
        gap:"14px"
      }}
    >

      {[
        "AI Discover Mode",
        "Pro Observatory",
        "Historical Deep Scan"
      ].map((item)=>(

        <div
          key={item}
          style={{
            background:
              "linear-gradient(180deg,#111827,#050816)",
            border:"1px solid #7c3aed",
            borderRadius:"22px",
            padding:"22px",
            color:"white"
          }}
        >

          <div
            style={{
              color:"#a855f7",
              fontWeight:"900",
              marginBottom:"10px"
            }}
          >
            🔒 PREMIUM
          </div>

          <h3>{item}</h3>

          <p style={{color:"#94a3b8"}}>
            Unlocks at launch with wallet +
            observatory subscription.
          </p>

        </div>

      ))}

    </section>

  )

}
