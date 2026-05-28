"use client"

export default function Home(){

 return (

  <div style={{

   width:"100vw",
   minHeight:"100vh",

   background:"#020617",

   color:"white",

   fontFamily:"Arial",

   overflowX:"hidden"

  }}>

   <section style={{

    padding:"40px 24px",

    maxWidth:"1400px",

    margin:"auto"

   }}>

    <h1 style={{

     fontSize:"clamp(64px,12vw,140px)",

     lineHeight:".88",

     margin:"0 0 24px",

     letterSpacing:"-5px",

     fontWeight:"900"

    }}>
     DigitalHut
     <br/>
     Observatory
    </h1>

    <p style={{

     fontSize:"clamp(20px,3vw,34px)",

     color:"#cbd5e1",

     lineHeight:"1.5",

     maxWidth:"1100px"

    }}>
     Full cinematic observatory runtime with
     live 3D environment exploration,
     planetary scanning,
     architecture discovery,
     immersive research systems,
     and SearchAtlas intelligence.
    </p>

   </section>

   <section style={{

    width:"100%",

    height:"78vh",

    padding:"0 24px 30px",

    boxSizing:"border-box"

   }}>

    <div style={{

     width:"100%",

     height:"100%",

     borderRadius:"36px",

     overflow:"hidden",

     background:"#000",

     border:"1px solid #334155"

    }}>

     <iframe
      src="https://sketchfab.com/models/7w7pAfrCfjovwykkEeRFLGw5SXS/embed?autostart=1&ui_infos=0"
      style={{

       width:"100%",

       height:"100%",

       border:"0"

      }}
      allow="autoplay; fullscreen; xr-spatial-tracking"
      allowFullScreen
     />

    </div>

   </section>

   <section style={{

    display:"grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(320px,1fr))",

    gap:"24px",

    padding:"0 24px 80px"

   }}>

    {[
      "Planetary Terrain",
      "Historic Architecture",
      "Industrial Worlds",
      "Museum Environments",
      "Coastline Systems",
      "Space Observatories"
    ].map(x=>

      <div
       key={x}
       style={{

        background:"#0f172a",

        border:"1px solid #334155",

        borderRadius:"30px",

        padding:"34px",

        minHeight:"180px"

       }}
      >

       <h2 style={{

        fontSize:"38px",

        margin:0

       }}>
        {x}
       </h2>

      </div>

    )}

   </section>

  </div>

 )

}
