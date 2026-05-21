import React from "react"

export default function RealObservatoryHero(){

  return(

    <section
      style={{
        position:"relative",
        minHeight:"100vh",
        overflow:"hidden",
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        textAlign:"center",
        color:"white"
      }}
    >

      <img
        src="https://upload.wikimedia.org/wikipedia/commons/6/6d/Griffith_Observatory_%2811851997813%29.jpg"
        alt="Griffith Observatory"
        style={{
          position:"absolute",
          inset:0,
          width:"100%",
          height:"100%",
          objectFit:"cover",
          filter:"brightness(0.45)"
        }}
      />

      <div
        style={{
          position:"absolute",
          inset:0,
          background:
            "linear-gradient(180deg,rgba(5,8,22,0.2),rgba(5,8,22,0.95))"
        }}
      />

      <div
        style={{
          position:"relative",
          zIndex:2,
          maxWidth:"900px",
          padding:"20px"
        }}
      >

        <div
          style={{
            color:"#00e5ff",
            fontWeight:"900",
            letterSpacing:"4px",
            marginBottom:"20px"
          }}
        >
          DIGITALHUT OBSERVATORY
        </div>

        <h1
          style={{
            fontSize:"clamp(42px,8vw,90px)",
            lineHeight:1,
            marginBottom:"24px"
          }}
        >
          Human-Centered
          <br />
          Observatory Intelligence
        </h1>

        <p
          style={{
            color:"#cbd5e1",
            lineHeight:1.8,
            fontSize:"18px",
            maxWidth:"760px",
            margin:"0 auto"
          }}
        >
          Explore real observatories,
          environmental discoveries,
          architecture,
          science,
          global signals,
          and AI-assisted observatory analysis through a calm free-roam discovery system.
        </p>

        <div
          style={{
            marginTop:"30px",
            display:"flex",
            justifyContent:"center",
            gap:"16px",
            flexWrap:"wrap"
          }}
        >

          <a
            href="/scanner"
            style={{
              background:"#7c3aed",
              padding:"18px 28px",
              borderRadius:"16px",
              color:"white",
              textDecoration:"none",
              fontWeight:"900"
            }}
          >
            Open Observatory Scanner
          </a>

          <a
            href="/scanner"
            style={{
              background:"rgba(255,255,255,0.08)",
              border:"1px solid rgba(255,255,255,0.15)",
              padding:"18px 28px",
              borderRadius:"16px",
              color:"white",
              textDecoration:"none",
              fontWeight:"900"
            }}
          >
            Upgrade Observatory Access
          </a>

        </div>

      </div>

    </section>

  )

}
