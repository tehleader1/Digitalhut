"use client"

import { useEffect, useRef } from "react"

export default function BabylonObservatory({ modelUrl, title }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    let engine, scene
    let resize

    async function run() {
      const BABYLON = await import("@babylonjs/core")
      await import("@babylonjs/loaders/glTF")

      const canvas = canvasRef.current
      if (!canvas) return

      engine = new BABYLON.Engine(canvas, true)
      scene = new BABYLON.Scene(engine)
      scene.clearColor = new BABYLON.Color4(0.01, 0.03, 0.08, 1)

      const camera = new BABYLON.ArcRotateCamera(
        "orbit",
        Math.PI / 2,
        Math.PI / 2.6,
        5,
        BABYLON.Vector3.Zero(),
        scene
      )
      camera.attachControl(canvas, true)
      camera.wheelPrecision = 45
      camera.lowerRadiusLimit = 1.5
      camera.upperRadiusLimit = 12

      new BABYLON.HemisphericLight("sky", new BABYLON.Vector3(0, 1, 0), scene)
      const glow = new BABYLON.PointLight("glow", new BABYLON.Vector3(2, 3, -3), scene)
      glow.intensity = 1.2

      function addSignalSphere() {
        const sphere = BABYLON.MeshBuilder.CreateSphere("default-observatory", { diameter: 2.2 }, scene)
        const mat = new BABYLON.StandardMaterial("signal-material", scene)
        mat.emissiveColor = new BABYLON.Color3(0.05, 0.7, 1)
        mat.diffuseColor = new BABYLON.Color3(0.1, 0.3, 0.8)
        sphere.material = mat
      }

      if (modelUrl) {
        try {
          await BABYLON.SceneLoader.ImportMeshAsync("", "", modelUrl, scene)
          scene.meshes.forEach((m) => {
            if (m.name !== "orbit") m.scaling.scaleInPlace(1)
          })
        } catch (e) {
          console.error("GLB load failed", e)
          addSignalSphere()
        }
      } else {
        addSignalSphere()
      }

      scene.onBeforeRenderObservable.add(() => {
        camera.alpha += 0.0025
      })

      engine.runRenderLoop(() => scene.render())
      resize = () => engine.resize()
      window.addEventListener("resize", resize)
    }

    run()

    return () => {
      if (resize) window.removeEventListener("resize", resize)
      if (scene) scene.dispose()
      if (engine) engine.dispose()
    }
  }, [modelUrl])

  return (
    <div style={{ border:"1px solid rgba(148,163,184,.3)", borderRadius:18, overflow:"hidden", background:"#020617" }}>
      <div style={{ padding:12, color:"#38bdf8", fontWeight:900 }}>
        Babylon Orbit Observatory {title ? `— ${title}` : ""}
      </div>
      <canvas ref={canvasRef} style={{ width:"100%", height:"420px", display:"block", touchAction:"none" }} />
    </div>
  )
}
