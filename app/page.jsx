"use client"

import { useEffect, useRef, useState } from "react"
import * as BABYLON from "@babylonjs/core"
import "@babylonjs/loaders"

const SKETCHFAB_TOKEN =
  "137a2704a95d4051b5ffe795b90d92ce"

export default function Home() {

  const canvasRef = useRef(null)

  const [models,setModels] = useState([])

  useEffect(() => {

    const canvas = canvasRef.current

    const engine = new BABYLON.Engine(canvas, true)

    const scene = new BABYLON.Scene(engine)

    scene.clearColor =
      new BABYLON.Color4(0.01,0.02,0.08,1)

    const camera = new BABYLON.ArcRotateCamera(
      "cam",
      Math.PI / 2,
      Math.PI / 3,
      10,
      BABYLON.Vector3.Zero(),
      scene
    )

    camera.attachControl(canvas, true)

    const light = new BABYLON.HemisphericLight(
      "light",
      new BABYLON.Vector3(0,1,0),
      scene
    )

    light.intensity = 1.5

    const sphere =
      BABYLON.MeshBuilder.CreateSphere(
        "sphere",
        { diameter: 3 },
        scene
      )

    const mat =
      new BABYLON.StandardMaterial("mat",scene)

    mat.emissiveColor =
      new BABYLON.Color3(0,0.7,1)

    sphere.material = mat

    engine.runRenderLoop(() => {
      sphere.rotation.y += 0.003
      scene.render()
    })

    window.addEventListener("resize", () => {
      engine.resize()
    })

    fetch(
      "https://api.sketchfab.com/v3/search?type=models&q=environment",
      {
        headers:{
          Authorization:`Token ${SKETCHFAB_TOKEN}`
        }
      }
    )
    .then(r=>r.json())
    .then(d=>{
      setModels((d.results||[]).slice(0,8))
    })

    return () => {
      engine.dispose()
    }

  }, [])

  return (
    <main
      style={{
        background:"#020617",
        color:"white",
        minHeight:"100vh",
        fontFamily:"Arial"
      }}
    >

      <section
        style={{
          padding:"30px"
        }}
      >

        <h1
          style={{
            fontSize:"58px",
            fontWeight:"900",
            marginBottom:"20px",
            lineHeight:"0.95"
          }}
        >
          DigitalHut Observatory
        </h1>

        <p
          style={{
            color:"#cbd5e1",
            fontSize:"20px",
            lineHeight:"1.6",
            maxWidth:"800px"
          }}
        >
          AI-native observatory infrastructure with BabylonJS runtime,
          live internet-fed environments, SearchAtlas intelligence,
          wallet systems, and Sketchfab discovery.
        </p>

      </section>

      <section
        style={{
          width:"100%",
          height:"420px",
          borderTop:"1px solid #1e293b",
          borderBottom:"1px solid #1e293b"
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width:"100%",
            height:"100%"
          }}
        />
      </section>

      <section
        style={{
          padding:"25px",
          display:"grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(260px,1fr))",
          gap:"22px"
        }}
      >

        {models.map((m)=>(
          <a
            key={m.uid}
            href={m.viewerUrl}
            target="_blank"
            style={{
              background:"#0f172a",
              border:"1px solid #334155",
              borderRadius:"22px",
              overflow:"hidden",
              textDecoration:"none",
              color:"white"
            }}
          >

            <img
              src={m.thumbnails?.images?.[0]?.url}
              style={{
                width:"100%",
                height:"190px",
                objectFit:"cover"
              }}
            />

            <div style={{padding:"18px"}}>

              <h2
                style={{
                  margin:0,
                  fontSize:"28px",
                  lineHeight:"1.2"
                }}
              >
                {m.name}
              </h2>

            </div>

          </a>
        ))}

      </section>

    </main>
  )
}
