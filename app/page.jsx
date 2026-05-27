"use client"

import { useEffect, useRef, useState } from "react"
import * as BABYLON from "@babylonjs/core"
import "@babylonjs/loaders"

const SKETCHFAB_TOKEN = "137a2704a95d4051b5ffe795b90d92ce"

export default function Home() {
  const canvasRef = useRef(null)
  const [models,setModels] = useState([])

  useEffect(() => {

    // SEARCHATLAS OTTO PIXEL
    const script = document.createElement("script")
    script.setAttribute("nowprocket","")
    script.setAttribute("nitro-exclude","")
    script.src =
      "https://dashboard.searchatlas.com/scripts/dynamic_optimization.js"

    script.dataset.uuid =
      "fb51dd0f-e06f-457d-b7e5-952e02bdda6a"

    script.id = "sa-dynamic-optimization-loader"

    document.head.appendChild(script)

    // BABYLON ENGINE
    const canvas = canvasRef.current

    const engine = new BABYLON.Engine(canvas, true)

    const scene = new BABYLON.Scene(engine)

    scene.clearColor = new BABYLON.Color4(0.01,0.02,0.08,1)

    const camera = new BABYLON.ArcRotateCamera(
      "cam",
      Math.PI / 2,
      Math.PI / 3,
      12,
      BABYLON.Vector3.Zero(),
      scene
    )

    camera.attachControl(canvas, true)

    const light = new BABYLON.HemisphericLight(
      "light",
      new BABYLON.Vector3(0,1,0),
      scene
    )

    light.intensity = 1.4

    const sphere = BABYLON.MeshBuilder.CreateSphere(
      "sphere",
      { diameter: 3 },
      scene
    )

    const material = new BABYLON.StandardMaterial("mat", scene)

    material.emissiveColor = new BABYLON.Color3(0,0.7,1)

    sphere.material = material

    engine.runRenderLoop(() => {
      sphere.rotation.y += 0.003
      scene.render()
    })

    window.addEventListener("resize", () => {
      engine.resize()
    })

    // LIVE SKETCHFAB FEED
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
      setModels((d.results||[]).slice(0,6))
    })

    return () => {
      engine.dispose()
    }

  }, [])

  return (
    <main
      style={{
        width:"100vw",
        minHeight:"100vh",
        overflow:"hidden",
        background:"#020617",
        color:"white"
      }}
    >
      <div
        style={{
          position:"absolute",
          zIndex:10,
          top:30,
          left:30,
          maxWidth:"520px"
        }}
      >
        <h1
          style={{
            fontSize:"64px",
            fontWeight:"900",
            marginBottom:"20px"
          }}
        >
          DigitalHut Observatory
        </h1>

        <p
          style={{
            fontSize:"22px",
            lineHeight:"1.5",
            color:"#cbd5e1"
          }}
        >
          AI-native 3D observatory infrastructure with live internet-fed
          environments, SearchAtlas intelligence, BabylonJS runtime,
          and Sketchfab discovery systems.
        </p>
      </div>

      <canvas
        ref={canvasRef}
        style={{
          width:"100%",
          height:"100vh"
        }}
      />

      <div
        style={{
          position:"absolute",
          bottom:20,
          left:20,
          right:20,
          display:"grid",
          gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",
          gap:"16px",
          zIndex:10
        }}
      >
        {models.map((m)=>(
          <a
            key={m.uid}
            href={m.viewerUrl}
            target="_blank"
            style={{
              background:"#111827",
              border:"1px solid #334155",
              borderRadius:"16px",
              overflow:"hidden",
              color:"white",
              textDecoration:"none"
            }}
          >
            <img
              src={m.thumbnails?.images?.[0]?.url}
              style={{
                width:"100%",
                height:"120px",
                objectFit:"cover"
              }}
            />

            <div style={{padding:"12px"}}>
              <b>{m.name}</b>
            </div>
          </a>
        ))}
      </div>
    </main>
  )
}
