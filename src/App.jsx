import { useEffect, useRef, useState } from "react"

import {
  Engine,
  Scene,
  ArcRotateCamera,
  HemisphericLight,
  Vector3,
  SceneLoader,
  Color4
} from "@babylonjs/core"

import "@babylonjs/loaders/glTF"

import {
  getRandomSignal,
  getSignalsByRegion
} from "./observatoryMeta"

const SKETCHFAB_TOKEN =
  "137a2704a95d4051b5ffe795b90d92ce"

export default function App(){

  const canvasRef = useRef(null)

  const [region,setRegion] =
    useState("north america")

  const [signal,setSignal] =
    useState(null)

  const [nearby,setNearby] =
    useState([])

  const [stats,setStats] =
    useState("Awaiting observatory signal")

  const [internetSignals,setInternetSignals] =
    useState([])

  function speak(text){

    speechSynthesis.cancel()

    const voice =
      new SpeechSynthesisUtterance(text)

    voice.rate = 0.93
    voice.pitch = 1
    voice.volume = 1

    speechSynthesis.speak(voice)

  }

  function startVoiceSearch(){

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition

    if(!SpeechRecognition){

      alert(
        "Speech recognition unsupported"
      )

      return

    }

    const recognition =
      new SpeechRecognition()

    recognition.lang = "en-US"

    recognition.onresult = async (event)=>{

      const text =
        event.results[0][0].transcript

      setRegion(text)

      await runScanner(text)

    }

    recognition.start()

  }

  async function fetchSketchfabSignals(query){

    try{

      const response =
        await fetch(
          `https://api.sketchfab.com/v3/search?type=models&downloadable=true&q=${encodeURIComponent(query)}`,
          {
            headers:{
              Authorization:
                `Token ${SKETCHFAB_TOKEN}`
            }
          }
        )

      const data =
        await response.json()

      const results =
        (data.results || [])
          .slice(0,8)
          .map(item=>({

            title:item.name,

            description:
              item.description ||
              "Internet observatory signal",

            lighting:"internet adaptive lighting",

            camera:"dynamic orbit",

            retention:
              Math.floor(
                5000 +
                Math.random() * 6000
              ),

            interestDropMs:
              Math.floor(
                3000 +
                Math.random() * 5000
              ),

            density:"dynamic",

            mood:"internet-fed",

            motion:"cinematic orbit",

            hallucinationRisk:
              "internet-check",

            model:
              localFallback[
                index %
                localFallback.length
              ]?.model

          }))

      setInternetSignals(results)

      return results

    }catch(err){

      console.log(err)

      return []

    }

  }

  useEffect(()=>{

    if(!canvasRef.current || !signal){
      return
    }

    const canvas = canvasRef.current

    const engine =
      new Engine(canvas, true)

    const scene =
      new Scene(engine)

    scene.clearColor =
      new Color4(
        0.01,
        0.01,
        0.03,
        1
      )

    const camera =
      new ArcRotateCamera(
        "camera",
        Math.PI / 2,
        Math.PI / 2.4,
        18,
        Vector3.Zero(),
        scene
      )

    camera.useAutoRotationBehavior = true

    camera.attachControl(canvas, true)

    new HemisphericLight(
      "light",
      new Vector3(1,1,0),
      scene
    )

    SceneLoader.Append(
      "",
      signal.model,
      scene,
      ()=>{

        setStats(
`
Lighting:
${signal.lighting}

Camera:
${signal.camera}

Retention:
${signal.retention}ms

Interest Drop:
${signal.interestDropMs}ms

Density:
${signal.density}

Mood:
${signal.mood}

Motion:
${signal.motion}

Hallucination Risk:
${signal.hallucinationRisk}
`
        )

        speak(
`
Observatory signal detected.

${signal.title}

${signal.description}

Lighting profile:
${signal.lighting}

Camera profile:
${signal.camera}
`
        )

        engine.runRenderLoop(()=>{
          scene.render()
        })

      }
    )

    window.addEventListener(
      "resize",
      ()=>{
        engine.resize()
      }
    )

    return ()=>{
      scene.dispose()
      engine.dispose()
    }

  },[signal])

  async function runScanner(
    overrideRegion
  ){

    const activeRegion =
      overrideRegion || region

    const localSignals =
      getSignalsByRegion(
        activeRegion
      )

    const internet =
      await fetchSketchfabSignals(
        activeRegion
      )

    const allSignals = [
      ...localSignals,
      ...internet
    ]

    if(!allSignals.length){

      speak(
        "No observatory signals found"
      )

      return

    }

    const selected =
      allSignals[
        Math.floor(
          Math.random() *
          allSignals.length
        )
      ]

    setSignal(selected)

    setNearby(

      allSignals
        .filter(
          item =>
            item.title !==
            selected.title
        )
        .sort(
          ()=>Math.random()-0.5
        )
        .slice(0,3)

    )

  }

  return (

    <main
      style={{
        background:"#020617",
        minHeight:"100vh",
        padding:"24px",
        color:"white",
        fontFamily:"sans-serif"
      }}
    >

      <h1
        style={{
          fontSize:"42px",
          fontWeight:"900"
        }}
      >
        Sedans 2.0 Observatory Runtime
      </h1>

      <textarea
        value={region}
        onChange={(e)=>
          setRegion(e.target.value)
        }
        style={{
          width:"100%",
          minHeight:"120px",
          marginTop:"20px",
          background:"#0f172a",
          color:"white",
          border:"1px solid #334155",
          borderRadius:"18px",
          padding:"18px"
        }}
      />

      <button
        onClick={()=>
          runScanner()
        }
        style={{
          width:"100%",
          marginTop:"20px",
          background:"#2563eb",
          border:"none",
          color:"white",
          padding:"18px",
          borderRadius:"18px",
          fontWeight:"900",
          fontSize:"18px"
        }}
      >
        RUN OBSERVATORY SIGNAL
      </button>

      <button
        onClick={()=>
          startVoiceSearch()
        }
        style={{
          width:"100%",
          marginTop:"12px",
          background:"#7c3aed",
          border:"none",
          color:"white",
          padding:"18px",
          borderRadius:"18px",
          fontWeight:"900",
          fontSize:"18px"
        }}
      >
        SPEAK OBSERVATORY SEARCH
      </button>

      <canvas
        ref={canvasRef}
        style={{
          width:"100%",
          height:"520px",
          marginTop:"28px",
          borderRadius:"28px",
          background:"#000"
        }}
      />

      {signal && (

        <section
          style={{
            marginTop:"28px",
            background:"#111827",
            border:"1px solid #26334f",
            borderRadius:"22px",
            padding:"22px"
          }}
        >

          <h2>
            {signal.title}
          </h2>

          <p
            style={{
              color:"#94a3b8",
              lineHeight:1.8
            }}
          >
            {signal.description}
          </p>

          <pre
            style={{
              marginTop:"18px",
              color:"#22c55e",
              whiteSpace:"pre-wrap"
            }}
          >
            {stats}
          </pre>

        </section>

      )}

      {nearby.length > 0 && (

        <section
          style={{
            marginTop:"28px"
          }}
        >

          <h2>
            Nearby Observatory Signals
          </h2>

          <div
            style={{
              display:"grid",
              gap:"14px",
              marginTop:"14px"
            }}
          >

            {nearby.map((item,index)=>(

              <button
                key={index}
                onClick={()=>{
                  setSignal(item)

                  speak(
                    `
                    Switching to
                    ${item.title}
                    `
                  )
                }}
                style={{
                  background:"#111827",
                  border:"1px solid #334155",
                  borderRadius:"18px",
                  padding:"18px",
                  color:"white",
                  textAlign:"left"
                }}
              >

                <div
                  style={{
                    fontWeight:"900",
                    fontSize:"18px"
                  }}
                >
                  {item.title}
                </div>

                <div
                  style={{
                    marginTop:"8px",
                    color:"#94a3b8"
                  }}
                >
                  {item.description}
                </div>

              </button>

            ))}

          </div>

        </section>

      )}

    </main>

  )

}
