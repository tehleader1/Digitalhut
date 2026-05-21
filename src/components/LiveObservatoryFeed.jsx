import React from "react"

export default function LiveObservatoryFeed(){

  const observatories = [

    {
      name:"Canada Observatory",
      region:"Canada"
    },

    {
      name:"Tokyo Skyline",
      region:"Japan"
    },

    {
      name:"Swiss Alps Observatory",
      region:"Switzerland"
    },

    {
      name:"Dominican Cabana",
      region:"Dominican Republic"
    }

  ]

  return(

    <section
      style={{
        margin:"20px",
        padding:"28px",
        borderRadius:"28px",
        background:
          "linear-gradient(180deg,#111827,#050816)",
        border:"1px solid #26334f",
        color:"white"
      }}
    >

      <div
        style={{
          color:"#00e5ff",
          fontWeight:"900",
          letterSpacing:"2px"
        }}
      >
        GLOBAL OBSERVATORIES
      </div>

      <h2
        style={{
          marginTop:"10px"
        }}
      >
        Recommended Discovery Signals
      </h2>

      <div
        style={{
          display:"grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
          gap:"16px",
          marginTop:"22px"
        }}
      >

        {observatories.map((item,index)=>(

          <div
            key={index}
            style={{
              background:"#0b1020",
              border:"1px solid #26334f",
              borderRadius:"20px",
              padding:"20px"
            }}
          >

            <div
              style={{
                color:"#a855f7",
                fontWeight:"900"
              }}
            >
              {item.region}
            </div>

            <h3>
              {item.name}
            </h3>

            <p
              style={{
                color:"#94a3b8"
              }}
            >
              Observatory signal active.
            </p>

          </div>

        ))}

      </div>

    </section>

  )

}
