import { useEffect, useRef } from "react"
import * as BABYLON from "@babylonjs/core"
import "@babylonjs/loaders/glTF"

function BabylonScene(){

  const canvasRef = useRef(null)

  useEffect(()=>{

    const canvas = canvasRef.current

    const engine =
      new BABYLON.Engine(canvas,true)

    const scene =
      new BABYLON.Scene(engine)

    scene.clearColor =
      new BABYLON.Color4(0,0,0,1)

    const camera =
      new BABYLON.ArcRotateCamera(
        "camera",
        Math.PI/2,
        Math.PI/2.5,
        8,
        BABYLON.Vector3.Zero(),
        scene
      )

    camera.attachControl(canvas,true)

    new BABYLON.HemisphericLight(
      "light",
      new BABYLON.Vector3(1,1,0),
      scene
    )

    BABYLON.SceneLoader.Append(
      "https://models.babylonjs.com/",
      "BoomBox.glb",
      scene
    )

    engine.runRenderLoop(()=>{
      scene.render()
    })

    return ()=>{
      engine.dispose()
    }

  },[])

  return(
    <canvas
      ref={canvasRef}
      style={{
        width:"100%",
        height:"500px",
        borderRadius:"20px",
        background:"black"
      }}
    />
  )
}

export default function App(){

  function speak(){

    const msg =
      new SpeechSynthesisUtterance(
        "Bismillah. Islamic observatory online."
      )

    speechSynthesis.speak(msg)
  }

  return(

    <main
      style={{
        minHeight:"100vh",
        background:"#020617",
        color:"white",
        padding:"20px",
        fontFamily:"Arial"
      }}
    >

      <h1
        style={{
          fontSize:"56px"
        }}
      >
        Islamic AI Observatory
      </h1>

      <button
        onClick={speak}
        style={{
          padding:"18px",
          background:"purple",
          color:"white",
          border:"none",
          borderRadius:"14px",
          marginBottom:"20px"
        }}
      >
        Run Observatory Signal
      </button>

      <BabylonScene />

    </main>
  )
}
