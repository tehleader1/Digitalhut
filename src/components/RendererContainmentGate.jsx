import React, {useEffect} from "react"
import "./FullscreenObservatory.containment.css"

function ensureLiveControls(renderer){
  const frame = renderer.querySelector(".dh-api-frame")
  const src = frame?.getAttribute("src") || ""

  if(renderer.dataset.liveSource !== src){
    renderer.dataset.liveSource = src
    renderer.classList.remove("live-open")
  }

  if(renderer.querySelector(".dh-live-toggle")) return

  const open = document.createElement("button")
  open.type = "button"
  open.className = "dh-live-toggle"
  open.innerHTML = "<b>Open live view</b><span>contained renderer</span>"
  open.addEventListener("click", (event) => {
    event.preventDefault()
    event.stopPropagation()
    renderer.classList.add("live-open")
  })

  const close = document.createElement("button")
  close.type = "button"
  close.className = "dh-live-close"
  close.textContent = "Close live view"
  close.addEventListener("click", (event) => {
    event.preventDefault()
    event.stopPropagation()
    renderer.classList.remove("live-open")
  })

  renderer.append(open, close)
}

export default function RendererContainmentGate({children}){
  useEffect(() => {
    if(typeof document === "undefined") return undefined

    function wireRenderers(){
      document.querySelectorAll(".dh-renderer.has-api").forEach(ensureLiveControls)
    }

    wireRenderers()
    const observer = new MutationObserver(wireRenderers)
    observer.observe(document.body, {childList: true, subtree: true})

    function closeWithEscape(event){
      if(event.key !== "Escape") return
      document.querySelectorAll(".dh-renderer.live-open").forEach((renderer) => renderer.classList.remove("live-open"))
    }

    document.addEventListener("keydown", closeWithEscape)

    return () => {
      observer.disconnect()
      document.removeEventListener("keydown", closeWithEscape)
      document.querySelectorAll(".dh-live-toggle, .dh-live-close").forEach((node) => node.remove())
    }
  }, [])

  return children
}
