import React,{
  useEffect,
  useState
} from "react"

const planetaryRegions = [

  "north america",
  "south america",
  "europe",
  "caribbean",
  "asia",
  "africa",
  "oceania",
  "outerspace"

]

export default function LibraryPage(){

  const [library,setLibrary] =
    useState({})

  useEffect(()=>{

    fetch(
      "http://localhost:8787/api/library"
    )

      .then((r)=>r.json())

      .then((json)=>{

        setLibrary(
          json.grouped || {}
        )

      })

  },[])

  return(

    <main
      style={{
        background:"#050816",
        minHeight:"100vh",
        color:"white",
        padding:"20px",
        fontFamily:"Arial,sans-serif"
      }}
    >

      <div
        style={{
          color:"#00e5ff",
          fontWeight:"900",
          letterSpacing:"3px"
        }}
      >
        DIGITALHUT PLANETARY ARCHIVE
      </div>

      <h1
        style={{
          marginTop:"10px"
        }}
      >
        Global Observatory Network
      </h1>

      <p
        style={{
          color:"#94a3b8",
          lineHeight:1.8,
          maxWidth:"900px"
        }}
      >
        Explore evolving planetary observatories,
        environmental structures,
        terrain systems,
        scientific regions,
        global architecture,
        and premium observatory discovery feeds.
      </p>

      <section
        style={{
          marginTop:"34px",
          display:"grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(260px,1fr))",
          gap:"18px"
        }}
      >

        {planetaryRegions.map((region)=>(

          <RegionCard
            key={region}
            title={region}
          />

        ))}

      </section>

      {Object.entries(library).map(([category,items])=>(

        <section
          key={category}
          style={{
            marginTop:"50px"
          }}
        >

          <div
            style={{
              display:"flex",
              alignItems:"center",
              justifyContent:"space-between"
            }}
          >

            <h2
              style={{
                color:"#00e5ff",
                textTransform:"capitalize"
              }}
            >
              {category}
            </h2>

            <div
              style={{
                color:"#94a3b8"
              }}
            >
              {items.length}
              {" "}
              observatory signals
            </div>

          </div>

          <div
            style={{
              display:"grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(260px,1fr))",
              gap:"18px",
              marginTop:"18px"
            }}
          >

            {items.map((item,index)=>(

              <ObservatoryCard
                key={item.id || index}
                item={item}
              />

            ))}

          </div>

        </section>

      ))}

    </main>

  )

}

function RegionCard({ title }){

  return(

    <div
      style={{
        background:
          "linear-gradient(180deg,#111827,#050816)",
        border:"1px solid #26334f",
        borderRadius:"24px",
        padding:"24px"
      }}
    >

      <div
        style={{
          color:"#00e5ff",
          fontWeight:"900",
          textTransform:"capitalize"
        }}
      >
        {title}
      </div>

      <p
        style={{
          color:"#94a3b8",
          marginTop:"12px",
          lineHeight:1.6
        }}
      >
        Planetary observatory region with evolving environmental discovery signals.
      </p>

      <a
        href={`/scanner?signal=${encodeURIComponent(title)}`}
        style={{
          display:"inline-block",
          marginTop:"18px",
          background:"#7c3aed",
          padding:"14px 18px",
          borderRadius:"14px",
          color:"white",
          textDecoration:"none",
          fontWeight:"900"
        }}
      >
        Explore Region
      </a>

    </div>

  )

}

function ObservatoryCard({ item }){

  return(

    <div
      style={{
        background:
          "linear-gradient(180deg,#111827,#050816)",
        border:"1px solid #26334f",
        borderRadius:"24px",
        overflow:"hidden"
      }}
    >

      <div
        style={{
          height:"180px",
          background:
            "linear-gradient(135deg,#0f172a,#111827)",
          display:"flex",
          alignItems:"center",
          justifyContent:"center",
          fontSize:"42px"
        }}
      >
        🌍
      </div>

      <div
        style={{
          padding:"20px"
        }}
      >

        <div
          style={{
            color:"#00e5ff",
            fontWeight:"900"
          }}
        >
          {item.title}
        </div>

        <p
          style={{
            color:"#94a3b8",
            marginTop:"10px",
            lineHeight:1.6
          }}
        >
          Verified observatory environment signal from the planetary archive.
        </p>

        <div
          style={{
            marginTop:"14px",
            display:"flex",
            justifyContent:"space-between",
            alignItems:"center"
          }}
        >

          <div
            style={{
              color:"#22c55e",
              fontWeight:"900"
            }}
          >
            VERIFIED
          </div>

          <a
            href={`/scanner?signal=${encodeURIComponent(item.title)}`}
            style={{
              background:"#7c3aed",
              padding:"12px 16px",
              borderRadius:"12px",
              color:"white",
              textDecoration:"none",
              fontWeight:"900"
            }}
          >
            Open
          </a>

        </div>

      </div>

    </div>

  )

}
