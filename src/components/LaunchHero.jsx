import React, { useEffect, useState } from "react"

const launchDate =
  new Date("2026-05-30T12:00:00")

export default function LaunchHero(){

  const [timeLeft,setTimeLeft] =
    useState({})

  useEffect(()=>{

    const timer =
      setInterval(()=>{

        const now =
          new Date()

        const diff =
          launchDate - now

        setTimeLeft({

          days:
            Math.max(
              0,
              Math.floor(
                diff/(1000*60*60*24)
              )
            ),

          hours:
            Math.max(
              0,
              Math.floor(
                (diff/(1000*60*60))%24
              )
            ),

          minutes:
            Math.max(
              0,
              Math.floor(
                (diff/(1000*60))%60
              )
            ),

          seconds:
            Math.max(
              0,
              Math.floor(
                (diff/1000)%60
              )
            )

        })

      },1000)

    return ()=>clearInterval(timer)

  },[])

  return(

    <section
      style={{
        margin:"20px",
        padding:"28px",
        borderRadius:"28px",
        background:
          "linear-gradient(180deg,#111827,#050816)",
        border:"1px solid #7c3aed",
        color:"white",
        overflow:"hidden",
        position:"relative"
      }}
    >

      <div
        style={{
          position:"absolute",
          inset:0,
          opacity:0.08,
          background:
            "radial-gradient(circle at top,#a855f7,transparent)"
        }}
      />

      <div style={{position:"relative"}}>

        <div
          style={{
            color:"#a855f7",
            fontWeight:"900",
            letterSpacing:"2px"
          }}
        >
          DIGITALHUT AI OBSERVATORY
        </div>

        <h1
          style={{
            fontSize:"44px",
            margin:"10px 0"
          }}
        >
          Launch Sequence Active
        </h1>

        <p
          style={{
            color:"#cbd5e1",
            maxWidth:"700px",
            lineHeight:1.6
          }}
        >
          AI-powered architecture observatory,
          GLB intelligence engine,
          decentralized subscriptions,
          NFT sponsor access,
          and discover mode launch.
        </p>

        <div
          style={{
            display:"grid",
            gridTemplateColumns:
              "repeat(4,1fr)",
            gap:"12px",
            marginTop:"24px"
          }}
        >

          {["days","hours","minutes","seconds"]
            .map((k)=>(

            <div
              key={k}
              style={{
                background:"#050816",
                padding:"18px",
                borderRadius:"18px",
                textAlign:"center",
                border:"1px solid #26334f"
              }}
            >

              <div
                style={{
                  fontSize:"34px",
                  fontWeight:"900",
                  color:"#00e5ff"
                }}
              >
                {timeLeft[k] || 0}
              </div>

              <small>
                {k.toUpperCase()}
              </small>

            </div>

          ))}

        </div>

        <div
          style={{
            marginTop:"24px",
            display:"flex",
            gap:"12px",
            flexWrap:"wrap"
          }}
        >

          <div style={status}>
            Frontend Online
          </div>

          <div style={status}>
            Backend Online
          </div>

          <div style={status}>
            Time Capsule Active
          </div>

          <div style={status}>
            Discover Mode Pending
          </div>

        </div>

      </div>

    </section>

  )

}

const status = {
  background:"#0b1020",
  border:"1px solid #26334f",
  borderRadius:"999px",
  padding:"10px 16px",
  color:"#22c55e",
  fontWeight:"bold"
}
