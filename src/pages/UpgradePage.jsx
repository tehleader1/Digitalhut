import React from "react"

const tiers = [

  {
    title:"Standard",
    price:"$35",
    desc:"Extended observatory access."
  },

  {
    title:"Premium",
    price:"$50",
    desc:"Premium observatory intelligence."
  },

  {
    title:"Pro",
    price:"$100",
    desc:"Builder and API observatory systems."
  }

]

export default function UpgradePage(){

  return(

    <main style={{
      background:"#050816",
      minHeight:"100vh",
      color:"white",
      padding:"20px",
      fontFamily:"Arial,sans-serif"
    }}>

      <h1>
        Observatory Access
      </h1>

      <div style={{
        display:"grid",
        gridTemplateColumns:
          "repeat(auto-fit,minmax(260px,1fr))",
        gap:"18px",
        marginTop:"30px"
      }}>

        {tiers.map((tier)=>(

          <div
            key={tier.title}
            style={{
              background:
                "linear-gradient(180deg,#111827,#050816)",
              border:"1px solid #26334f",
              borderRadius:"20px",
              padding:"24px"
            }}
          >

            <div style={{
              color:"#00e5ff",
              fontWeight:"900"
            }}>
              {tier.title}
            </div>

            <div style={{
              fontSize:"42px",
              fontWeight:"900",
              marginTop:"10px"
            }}>
              {tier.price}
            </div>

            <p style={{
              color:"#94a3b8"
            }}>
              {tier.desc}
            </p>

            <button style={{
              width:"100%",
              marginTop:"18px",
              padding:"16px",
              borderRadius:"14px",
              background:"#7c3aed",
              color:"white",
              border:"none",
              fontWeight:"900"
            }}>
              Upgrade
            </button>

          </div>

        ))}

      </div>

    </main>

  )

}
