import React, {useEffect, useState} from "react"
import "./PremiumLoadGate.css"
import "./FullscreenObservatory.timing.css"

const LOAD_INTERVAL_MS = 8 * 60 * 1000

function hasRecentRendererEntry(){
  try{
    const accountEntry = Number(window.localStorage.getItem("digitalhut:lastAccountEntry") || 0)
    const rendererEntry = Number(window.localStorage.getItem("digitalhut:lastRendererPreflight") || 0)
    const last = Math.max(accountEntry, rendererEntry)
    return last > 0 && Date.now() - last < LOAD_INTERVAL_MS
  } catch {
    return false
  }
}

function calibrateFps(duration = 1200, onProgress = () => {}){
  return new Promise((resolve) => {
    if(typeof window === "undefined" || !window.requestAnimationFrame){
      resolve(30)
      return
    }

    let frames = 0
    const start = performance.now()

    function frame(now){
      frames += 1
      const elapsed = now - start
      onProgress(Math.min(96, Math.round((elapsed / duration) * 100)))
      if(elapsed < duration){
        window.requestAnimationFrame(frame)
        return
      }
      resolve(Math.round((frames * 1000) / Math.max(elapsed, 1)))
    }

    window.requestAnimationFrame(frame)
  })
}

function qualityForFps(fps){
  if(fps >= 55) return "Pro high motion"
  if(fps >= 38) return "Premium balanced"
  return "Safe motion"
}

export default function PremiumLoadGate({children}){
  const [ready, setReady] = useState(() => typeof window === "undefined" ? true : hasRecentRendererEntry())
  const [progress, setProgress] = useState(ready ? 100 : 4)
  const [fps, setFps] = useState(0)
  const [phase, setPhase] = useState("Preparing renderer")

  useEffect(() => {
    if(ready) return undefined
    let cancelled = false

    async function run(){
      setPhase("Loading observatory APIs")
      setProgress(12)
      await new Promise((resolve) => window.setTimeout(resolve, 260))
      if(cancelled) return

      setPhase("Calibrating motion and FPS")
      const measured = await calibrateFps(1200, setProgress)
      if(cancelled) return

      setFps(measured)
      const quality = qualityForFps(measured)
      setPhase(`${quality} renderer ready`)
      setProgress(100)

      try{
        window.localStorage.setItem("digitalhut:lastRendererPreflight", String(Date.now()))
        window.localStorage.setItem("digitalhut:fps", String(measured))
        window.localStorage.setItem("digitalhut:rendererQuality", quality)
      } catch {
        // Local storage can be blocked in private browser modes.
      }

      window.setTimeout(() => {
        if(!cancelled) setReady(true)
      }, 420)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [ready])

  if(ready) return children

  return <section className="dh-preflight" role="status" aria-live="polite">
    <div className="dh-preflight-orb" />
    <div className="dh-preflight-panel">
      <p>DigitalHut Observatory</p>
      <h1>Entering the system</h1>
      <div className="dh-preflight-bar"><span style={{width: `${progress}%`}} /></div>
      <div className="dh-preflight-readout">
        <b>{phase}</b>
        <small>{fps ? `${fps} FPS measured` : "measuring display"}</small>
      </div>
    </div>
  </section>
}
