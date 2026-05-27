"use client"

import { useEffect, useRef, useState } from "react"
import * as BABYLON from "@babylonjs/core"
import "@babylonjs/loaders"

const TOKEN =
  "137a2704a95d4051b5ffe795b90d92ce"

export default function Home() {

  const canvasRef = useRef(null)

  const sceneRef = useRef(null)

  const engineRef = useRef(null)

  const [models,setModels] = useState([])

  const [active,setActive] = useState(null)

  async function loadEnvironment(model){

    const scene = sceneRef.current

    scene.meshes.slice().forEach(m=>{
      if(
        m.name !== "cameraCollider" &&
        m.name !== "ground"
      ){
        m.dispose()
      }
    })

    try{

      if(model.isDownloadable){

        await BABYLON.SceneLoader.ImportMeshAsync(
          "",
          `https://api.sketchfab.com/v3/models/${model.uid}/download`,
          "",
          scene
        )

      }else{

        const box =
          BABYLON.MeshBuilder.CreateBox(
            "fallback",
            {size:4},
            scene
          )

        const mat =
          new BABYLON.StandardMaterial(
            "mat",
            scene
          )

        mat.diffuseTexture =
          new BABYLON.Texture(
            model.thumbnails?.images?.[0]?.url,
            scene
          )

        mat.emissiveColor =
          new BABYLON.Color3(0,0.7,1)

        box.material = mat

      }

    }catch(e){

      console.log(e)

      const sphere =
        BABYLON.MeshBuilder.CreateSphere(
          "sphere",
          {diameter:4},
          scene
        )

      const mat =
        new BABYLON.StandardMaterial(
          "mat",
          scene
        )

      mat.emissiveColor =
        new BABYLON.Color3(0,0.7,1)

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
        "camera",
        Math.PI/2,
        Math.PI/3,
        10,
        BABYLON.Vector3.Zero(),
        scene
      )

    camera.attachControl(canvas,true)

    camera.wheelDeltaPercentage = 0.01

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
        (d.results||[])
        .filter(x=>x.name)
        .slice(0,10)

      setModels(list)

      if(list[0]){

        setActive(list[0])

        loadEnvironment(list[0])

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
          right:20,
          zIndex:20,
          backdropFilter:"blur(20px)",
          background:"rgba(2,6,23,.72)",
          border:"1px solid #334155",
          borderRadius:"28px",
          padding:"28px"
        }}
      >

        <h1
          style={{
            fontSize:"58px",
            lineHeight:"0.92",
            marginBottom:"20px",
            fontWeight:"900"
          }}
        >
          DigitalHut Observatory
        </h1>

        <p
          style={{
            color:"#cbd5e1",
            lineHeight:"1.6",
            fontSize:"20px"
          }}
        >
          Live BabylonJS observatory runtime with real
          environment loading, Sketchfab discovery,
          SearchAtlas intelligence, and AI-native
          exploration systems.
        </p>

      </div>

      <div
        style={{
          position:"absolute",
          bottom:0,
          left:0,
          right:0,
          display:"flex",
          overflowX:"auto",
          gap:"18px",
          padding:"20px",
          zIndex:30,
          background:
            "linear-gradient(to top,#020617,transparent)"
        }}
      >

        {models.map((m)=>(

          <button
            key={m.uid}
            onClick={()=>{
              setActive(m)
              loadEnvironment(m)
            }}
            style={{
              minWidth:"240px",
              background:
                active?.uid===m.uid
                ? "#2563eb"
                : "#0f172a",
              border:"1px solid #334155",
              borderRadius:"22px",
              overflow:"hidden",
              padding:0,
              color:"white"
            }}
          >

            <img
              src={
                m.thumbnails?.images?.[0]?.url
              }
              style={{
                width:"100%",
                height:"150px",
                objectFit:"cover"
              }}
            />

            <div
              style={{
                padding:"18px",
                textAlign:"left",
                fontWeight:"700",
                fontSize:"22px"
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
