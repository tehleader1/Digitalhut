import React,{
  useEffect,
  useState
} from "react"

export default function InsightsPage(){

  const [insights,setInsights] =
    useState(null)

  useEffect(()=>{

    fetch(
      "http://localhost:8787/api/insights"
    )

      .then((r)=>r.json())

      .then((json)=>{

        setInsights(
          json.insights
        )

      })

  },[])

  if(!insights){

    return(

      <main style={{
        background:"#050816",
        minHeight:"100vh",
        color:"white",
        padding:"20px"
      }}>
        Loading Observatory Insights...
      </main>

    )

  }

  return(

    <main style={{
      background:"#050816",
      minHeight:"100vh",
      color:"white",
      padding:"20px",
      fontFamily:"Arial,sans-serif"
    }}>

      <div style={{
        color:"#00e5ff",
        fontWeight:"900",
        letterSpacing:"2px"
      }}>
        DIGITALHUT TIME OBSERVER
      </div>

      <h1>
        Observatory Behavioral Intelligence
      </h1>

      <Section
        title="Top Observatory Searches"
        items={insights.topSearches}
      />

      <Section
        title="Top Observatory Categories"
        items={insights.topCategories}
      />

      <Section
        title="Peak Observatory Hours"
        items={insights.activeHours}
      />

      <Section
        title="Exploration Paths"
        items={insights.paths}
      />

    </main>

  )

}

function Section({ title,items }){

  return(

    <section style={{
      marginTop:"34px"
    }}>

      <h2 style={{
        color:"#00e5ff"
      }}>
        {title}
      </h2>

      <div style={{
        display:"grid",
        gap:"14px",
        marginTop:"18px"
      }}>

        {items.map((item,index)=>(

          <div
            key={index}
            style={{
              background:
                "linear-gradient(180deg,#111827,#050816)",
              border:"1px solid #26334f",
              borderRadius:"18px",
              padding:"18px"
            }}
          >

            <div style={{
              fontWeight:"900"
            }}>
              {item[0]}
            </div>

            <div style={{
              color:"#94a3b8",
              marginTop:"8px"
            }}>
              Observatory activity:
              {" "}
              {item[1]}
            </div>

          </div>

        ))}

      </div>

    </section>

  )

}
