import React from "react"

const feed = [

  {
    title:"Plantain Air Fry Discovery",
    text:
      "Crispy fried plantains in the air fryer. Observatory cooking archive updated.",
    tag:"Cooking"
  },

  {
    title:"Mini Pizza Experiment",
    text:
      "Crystal wants to share the mini pizza with Aaron. Family observatory moment archived.",
    tag:"Family"
  },

  {
    title:"Space Station CD Player",
    text:
      "Studying how objects float in space stations and how astronauts stabilize movement.",
    tag:"Science"
  },

  {
    title:"Moto Rush Santiago 1:52 AM",
    text:
      "Late-night motos racing through Villa Gonzalez, Santiago. Real-world observatory recording.",
    tag:"Lifestyle"
  },

  {
    title:"Cabana Exploration",
    text:
      "Searching for tropical cabanas and nature estates for international observatory experiences.",
    tag:"Travel"
  },

  {
    title:"What Are You Producing?",
    text:
      "Daily creativity check-in. Build, cook, explore, or invent something new.",
    tag:"Creator"
  }

]

export default function LivingObservatoryFeed(){

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
          color:"#a855f7",
          fontWeight:"900",
          letterSpacing:"2px"
        }}
      >
        LIVING OBSERVATORY
      </div>

      <h2
        style={{
          marginTop:"10px"
        }}
      >
        Real Moments • Discoveries • Production
      </h2>

      <p
        style={{
          color:"#94a3b8",
          lineHeight:1.6
        }}
      >
        A living stream of intelligent experiences,
        discoveries,
        food,
        architecture,
        family moments,
        global exploration,
        and observatory creativity.
      </p>

      <div
        style={{
          display:"grid",
          gap:"16px",
          marginTop:"24px"
        }}
      >

        {feed.map((item,index)=>(

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
                color:"#00e5ff",
                fontWeight:"900",
                marginBottom:"10px"
              }}
            >
              {item.tag.toUpperCase()}
            </div>

            <h3>{item.title}</h3>

            <p
              style={{
                color:"#94a3b8",
                lineHeight:1.6
              }}
            >
              {item.text}
            </p>

          </div>

        ))}

      </div>

    </section>

  )

}
