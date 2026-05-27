"use client"

import { useEffect, useRef } from "react"
import * as BABYLON from "@babylonjs/core"
import "@babylonjs/loaders"

export default function Home() {
  const canvasRef = useRef(null)

  useEffect(() => {
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

    material.emissiveColor = new BABYLON.Color3(0,0.6,1)

    sphere.material = material

    engine.runRenderLoop(() => {
      sphere.rotation.y += 0.003
      scene.render()
    })

    window.addEventListener("resize", () => {
      engine.resize()
    })

    return () => {
      engine.dispose()
    }
  }, [])

  return (
    <main
      style={{
        width:"100vw",
        height:"100vh",
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
          AI-native 3D observatory infrastructure with BabylonJS runtime,
          wallet intelligence, internet-fed exploration, and live research systems.
        </p>
      </div>

      <canvas
        ref={canvasRef}
        style={{
          width:"100%",
          height:"100%"
        }}
      />
    </main>
  )
}
