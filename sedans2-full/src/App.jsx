import { useEffect, useRef } from "react"
import * as BABYLON from "@babylonjs/core"
import "@babylonjs/loaders/glTF"

export default function App(){

  const canvasRef = useRef(null)

  useEffect(()=>{

    const canvas = canvasRef.current

    if(!canvas){
      alert("Canvas missing")
      return
    }

    const engine =
      new BABYLON.Engine(
        canvas,
        true
      )

    const scene =
      new BABYLON.Scene(engine)

    scene.clearColor =
      new BABYLON.Color4(
        0,
        0,
        0,
        1
      )

    const camera =
      new BABYLON.ArcRotateCamera(
        "camera",
        Math.PI / 2,
        Math.PI / 2.5,
        12,
        new BABYLON.Vector3(0,1,0),
        scene
      )

    camera.attachControl(
      canvas,
      true
    )

    const light1 =
      new BABYLON.HemisphericLight(
        "light1",
        new BABYLON.Vector3(0,1,0),
        scene
      )

    light1.intensity = 1.5

    const light2 =
      new BABYLON.PointLight(
        "light2",
        new BABYLON.Vector3(0,10,-10),
        scene
      )

    light2.intensity = 1

    BABYLON.SceneLoader.Append(
      "https://models.babylonjs.com/",
      "BoomBox.glb",
      scene,
      ()=>{
        console.log("GLB LOADED SUCCESS")
      },
      null,
      (scene,message)=>{
        console.log(message)
        alert("GLB FAILED")
      }
    )

    engine.runRenderLoop(()=>{
      scene.render()
    })

    window.addEventListener(
      "resize",
      ()=>{
        engine.resize()
      }
    )

    return ()=>{
      engine.dispose()
    }

  },[])

  return (
    <div
      style={{
        width:"100vw",
        height:"100vh",
        overflow:"hidden",
        background:"black"
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width:"100%",
          height:"100%"
        }}
      />
    </div>
  )
}
