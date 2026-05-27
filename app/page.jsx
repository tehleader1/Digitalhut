"use client"

import { useEffect, useRef, useState } from "react"
import * as BABYLON from "@babylonjs/core"
import "@babylonjs/loaders"

const TOKEN =
  "137a2704a95d4051b5ffe795b90d92ce"

export default function Home() {

  const canvasRef = useRef(null)

  const engineRef = useRef(null)

  const sceneRef = useRef(null)

  const cameraRef = useRef(null)

  const [models,setModels] = useState([])

  const [active,setActive] = useState(null)

  async function loadEnvironment(url){

    const scene = sceneRef.current

    scene.meshes
      .filter(m=>m.name !== "ground")
      .forEach(m=>m.dispose())

    try{

      await BABYLON.SceneLoader.ImportMeshAsync(
        "",
        url,
        "",
        scene
      )

    }catch(e){

      const sphere =
        BABYLON.MeshBuilder.CreateSphere(
          "fallback",
          {diameter:4},
          scene
        )

      const mat =
        new BABYLON.StandardMaterial("mat",scene)

      mat.emissiveColor =
        new BABYLON.Color3(
          Math.random(),
          0.7,
          1
        )

      sphere.material = mat
    }
  }

  useEffect(()=>{

    const canvas = canvasRef.current

    const engine =
      new BABYLON.Engine(canvas,true)

    engineRef.current = engine

    const scene =
      new BABYLON.Scene(engine)

    scene.clearColor =
      new BABYLON.Color4(0.01,0.02,0.08,1)

    sceneRef.current = scene

    const camera =
      new BABYLON.ArcRotateCamera(
        "cam",
        Math.PI/2,
        Math.PI/3,
        18,
        BABYLON.Vector3.Zero(),
        scene
      )

    camera.attachControl(canvas,true)

    camera.wheelDeltaPercentage = 0.01

    cameraRef.current = camera

    const light =
      new BABYLON.HemisphericLight(
        "light",
        new BABYLON.Vector3(0,1,0),
        scene
      )

    light.intensity = 1.5

    const ground =
      BABYLON.MeshBuilder.CreateGround(
        "ground",
        {width:100,height:100},
        scene
      )

    const gmat =
      new BABYLON.StandardMaterial(
        "gmat",
        scene
      )

    gmat.emissiveColor =
      new BABYLON.Color3(0.02,0.02,0.05)

    ground.material = gmat

    engine.runRenderLoop(()=>{
      scene.render()
    })

    window.addEventListener("resize",()=>{
      engine.resize()
    })

    fetch(
      "https://api.sketchfab.com/v3/search?type=models&q=environment"
      ,
      {
        headers:{
          Authorization:`Token ${TOKEN}`
        }
      }
    )
    .then(r=>r.json())
    .then(d=>{

      const list =
        (d.results||[]).slice(0,12)

      setModels(list)

      if(list[0]){

        setActive(list[0])

        loadEnvironment(
          list[0].embedUrl
        )
      }
    })

    return ()=>{
      engine.dispose()
    }

  },[])

  return (

    <main
      style={{
        width:"100vw",
        height:"100vh",
        overflow:"hidden",
        background:"#020617",
        color:"white",
        position:"relative",
        fontFamily:"Arial"
      }}
    >

      <canvas
        ref={canvasRef}
        style={{
          width:"100%",
          height:"100%"
        }}
      />

      <div
        style={{
          position:"absolute",
          top:20,
          left:20,
          zIndex:10,
          maxWidth:"500px",
          backdropFilter:"blur(12px)",
          background:"rgba(2,6,23,.7)",
          border:"1px solid #334155",
          borderRadius:"24px",
          padding:"24px"
        }}
      >

        <h1
          style={{
            fontSize:"52px",
            lineHeight:"0.95",
            marginBottom:"20px"
          }}
        >
          DigitalHut Observatory
        </h1>

        <p
          style={{
            color:"#cbd5e1",
            lineHeight:"1.6",
            fontSize:"18px"
          }}
        >
          AI-native observatory runtime with BabylonJS,
          Sketchfab discovery, SearchAtlas intelligence,
          and environment-fed exploration systems.
        </p>

      </div>

      <div
        style={{
          position:"absolute",
          bottom:0,
          left:0,
          right:0,
          zIndex:20,
          display:"flex",
          gap:"16px",
          overflowX:"auto",
          padding:"20px",
          background:
            "linear-gradient(to top,#020617,transparent)"
        }}
      >

        {models.map((m)=>(

          <button
            key={m.uid}
            onClick={()=>{
              setActive(m)
              loadEnvironment(m.embedUrl)
            }}
            style={{
              minWidth:"240px",
              background:
                active?.uid===m.uid
                ? "#2563eb"
                : "#0f172a",
              border:"1px solid #334155",
              borderRadius:"20px",
              overflow:"hidden",
              color:"white",
              padding:0
            }}
          >

            <img
              src={
                m.thumbnails?.images?.[0]?.url
              }
              style={{
                width:"100%",
                height:"140px",
                objectFit:"cover"
              }}
            />

            <div
              style={{
                padding:"14px",
                textAlign:"left",
                fontWeight:"700"
              }}
            >
              {m.name}
            </div>

          </button>

        ))}

      </div>

    </main>

  )
}
