import LiveGlbViewer from "./LiveGlbViewer";
import "@google/model-viewer";
import { getRandomObservatory } from "../observatoryLibrary";
import React,{
  useState,
  useEffect
} from "react"

import "@google/model-viewer"

export default function ObservatoryScanner(){

  const [query,setQuery] =
    useState("")

  const [tier,setTier] =
    useState("free")

  
const [signal,setSignal] = useState("")
const [alternatives,setAlternatives] = useState([])
const [insights,setInsights] = useState(null)
const [activeModel,setActiveModel] = useState(null)

function speak(text){

function loadObservatory(region){

  const selected = getRandomObservatory(region)

  if(!selected){
    return
  }

  console.log("ACTIVE MODEL", selected)
  setActiveModel(selected)
}


    if(!window.speechSynthesis)
      return

    window.speechSynthesis.cancel()

    const utter =
      new SpeechSynthesisUtterance(text)

    utter.rate = 0.95

    window.speechSynthesis.speak(utter)

  }

  async function loadInsights(){

    try{

      const res =
        await fetch(
          "http://localhost:8787/api/insights"
        )

      const json =
        await res.json()

      setInsights(
        json.insights
      )

    }
    catch(err){

      console.log(err)

    }

  }

  async function runSignal(forceQuery){

    const activeQuery =
      forceQuery || query

    const res =
      await fetch(
        "http://localhost:8787/api/discovery-feed",
        {
          method:"POST",
          headers:{
            "Content-Type":
              "application/json"
          },
          body:JSON.stringify({
            query:activeQuery,
            tier
          })
        }
      )

    const json =
      await res.json()

    if(!json.found){

      setSignal(null)

      setAlternatives([])

      speak(json.voice)

      return

    }

    setSignal(json.strongest)

    setAlternatives(
      json.alternatives || []
    )

    speak(
      json.strongest?.description ||
      json.voice
    )

    loadInsights()

    setTimeout(()=>{

      loadInsights()

    },500)

  }

  useEffect(()=>{

    loadInsights()

    const params =
      new URLSearchParams(
        window.location.search
      )

    const signal =
      params.get("signal")

    if(signal){

      setQuery(signal)

      runSignal(signal)

    }

  },[])

  function switchSignal(item){

    try{

      window.speechSynthesis.cancel()

      setTimeout(()=>{

        setSignal(item)

        setTimeout(()=>{

          speak(
            item.description ||
            `${item.title} loaded.`
          )

        },400)

      },150)

    }
    catch(err){

      console.log(err)

    }

  }

  return(

    <main
      style={{
        background:"#050816",
        minHeight:"100vh",
        color:"white",
        fontFamily:"Arial,sans-serif",
        padding:"20px"
      }}
    >

      <section
        style={{
          background:
            "linear-gradient(180deg,#111827,#050816)",
          border:"1px solid #26334f",
          borderRadius:"28px",
          padding:"28px"
        }}
      >

        <div
          style={{
            color:"#00e5ff",
            fontWeight:"900",
            letterSpacing:"2px"
          }}
        >
          DIGITALHUT OBSERVATORY ENGINE
        </div>

        <h1>
          Planetary Observatory Discovery
        </h1>

        <textarea
          value={query}
          onChange={(e)=>
            setQuery(e.target.value)
          }
          placeholder="Search observatory signals..."
          style={{
            width:"100%",
            minHeight:"120px",
            marginTop:"20px",
            background:"#0b1020",
            border:"1px solid #26334f",
            borderRadius:"14px",
            padding:"14px",
            color:"white"
          }}
        />

        <select
          value={tier}
          onChange={(e)=>
            setTier(e.target.value)
          }
          style={{
            width:"100%",
            marginTop:"18px",
            background:"#0b1020",
            border:"1px solid #26334f",
            borderRadius:"14px",
            padding:"14px",
            color:"white"
          }}
        >

          <option value="free">
            Free
          </option>

          <option value="standard">
            Standard
          </option>

          <option value="premium">
            Premium
          </option>

          <option value="pro">
            Pro
          </option>

        </select>

        <button
            onClick={()=>{
              loadObservatory(signal)
              runSignal()
            }}
            style={{
            width:"100%",
            marginTop:"18px",
            background:"#7c3aed",
            border:"none",
            borderRadius:"14px",
            padding:"18px",
            color:"white",
            fontWeight:"900"
          }}
        >
          Run Observatory Signal
        </button>

      </section>

      <section
        style={{
          marginTop:"24px",
          display:"grid",
          gridTemplateColumns:
            "2fr 1fr",
          gap:"20px"
        }}
      >

        <div
          style={{
            background:"#000",
            borderRadius:"28px",
            overflow:"hidden",
            border:"1px solid #26334f"
          }}
        >

          {signal ? (

            <model-viewer
              key={signal.id}
              src={signal.glb}
              camera-controls
              shadow-intensity="1"
              exposure="1"
              style={{
                width:"100%",
                height:"520px",
                background:"#000"
              }}
            />

          ) : (

            <div
              style={{
                height:"520px",
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
                color:"#94a3b8",
                fontSize:"22px"
              }}
            >
              No Observatory Signal Loaded
            </div>

          )}

        </div>

        <aside
          style={{
            background:
              "linear-gradient(180deg,#111827,#050816)",
            border:"1px solid #26334f",
            borderRadius:"28px",
            padding:"24px"
          }}
        >

          <div
            style={{
              color:"#00e5ff",
              fontWeight:"900",
              letterSpacing:"2px"
            }}
          >
            TIME OBSERVER
          </div>

          <h2>
            Observatory Pulse
          </h2>

          {insights && (

            <>

              <PulseSection
                title="Trending Searches"
                items={insights.topSearches}
              />

              <PulseSection
                title="Active Categories"
                items={insights.topCategories}
              />

              <PulseSection
                title="Peak Observatory Hours"
                items={insights.activeHours}
              />

            </>

          )}

        </aside>

      </section>

      

<LiveGlbViewer model={activeModel} />

{signal && (

        <section
          style={{
            marginTop:"24px",
            background:
              "linear-gradient(180deg,#111827,#050816)",
            border:"1px solid #22c55e",
            borderRadius:"28px",
            padding:"28px"
          }}
        >

          <div
            style={{
              color:"#22c55e",
              fontWeight:"900"
            }}
          >
            AI DESCRIPTION MODE ACTIVE
          </div>

          <h2>
            {signal.title}
          </h2>

          <p
            style={{
              color:"#94a3b8",
              lineHeight:1.9,
              whiteSpace:"pre-line"
            }}
          >
            {signal.description}
          </p>

          
{activeModel && (

<section
  style={{
    marginTop:"24px",
    border:"1px solid #26334f",
    borderRadius:"28px",
    overflow:"hidden",
    background:"#050816"
  }}
>

  <model-viewer
    src={activeModel}
    auto-rotate
    camera-controls
    autoplay
    shadow-intensity="1"
    style={{
      width:"100%",
      height:"520px",
      background:"#000"
    }}
  ></model-viewer>

</section>

)}

{alternatives.length > 0 && (

            <>

              <h3
                style={{
                  marginTop:"24px"
                }}
              >
                Nearby Observatory Signals
              </h3>

              <div
                style={{
                  display:"flex",
                  gap:"12px",
                  flexWrap:"wrap",
                  marginTop:"14px"
                }}
              >

                {alternatives.map((item)=>(

                  <button
                    key={item.id}
                    onClick={()=>{
              loadObservatory(signal)
              switchSignal(item)
            }}
                    style={{
                      background:"#0b1020",
                      border:"1px solid #26334f",
                      borderRadius:"14px",
                      padding:"14px",
                      color:"white"
                    }}
                  >
                    {item.title}
                  </button>

                ))}

              </div>

            </>

          )}

        </section>

      )}

    </main>

  )

}

function PulseSection({ title,items }){

  if(!items?.length)
    return null

  return(

    <section
      style={{
        marginTop:"24px"
      }}
    >

      <div
        style={{
          color:"#22c55e",
          fontWeight:"900"
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop:"12px",
          display:"grid",
          gap:"10px"
        }}
      >

        {items.map((item,index)=>(

          <div
            key={index}
            style={{
              background:"#0b1020",
              border:"1px solid #26334f",
              borderRadius:"14px",
              padding:"12px"
            }}
          >

            <div
              style={{
                fontWeight:"900"
              }}
            >
              {item[0]}
            </div>

            <div
              style={{
                color:"#94a3b8",
                marginTop:"6px"
              }}
            >
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
