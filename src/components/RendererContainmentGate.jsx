import React, {useLayoutEffect} from "react"
import "./FullscreenObservatory.containment.css"

function assetNodes(renderer){
  return Array.from(renderer.querySelectorAll(".dh-api-frame, .dh-model"))
}

function rememberSource(node){
  const current = node.getAttribute("src") || node.dataset.dhSrc || ""
  if(current && current !== "about:blank") node.dataset.dhSrc = current
  return node.dataset.dhSrc || ""
}

function closeAssets(renderer){
  renderer.classList.remove("live-open")
  assetNodes(renderer).forEach((node) => {
    rememberSource(node)
    node.removeAttribute("src")
    node.setAttribute("aria-hidden", "true")
  })
}

function openAssets(renderer){
  assetNodes(renderer).forEach((node) => {
    const src = rememberSource(node)
    if(src && !node.getAttribute("src")) node.setAttribute("src", src)
    node.removeAttribute("aria-hidden")
  })
  renderer.classList.add("live-open")
}

function ensureLiveControls(renderer){
  const firstSource = assetNodes(renderer).map(rememberSource).find(Boolean) || ""

  if(renderer.dataset.liveSource !== firstSource){
    renderer.dataset.liveSource = firstSource
    closeAssets(renderer)
  }

  if(!renderer.classList.contains("live-open")) closeAssets(renderer)
  if(renderer.querySelector(".dh-live-toggle")) return

  const open = document.createElement("button")
  open.type = "button"
  open.className = "dh-live-toggle"
  open.innerHTML = "<b>Open live view</b><span>controlled asset</span>"
  open.addEventListener("click", (event) => {
    event.preventDefault()
    event.stopPropagation()
    openAssets(renderer)
  })

  const close = document.createElement("button")
  close.type = "button"
  close.className = "dh-live-close"
  close.textContent = "Close live view"
  close.addEventListener("click", (event) => {
    event.preventDefault()
    event.stopPropagation()
    closeAssets(renderer)
  })

  renderer.append(open, close)
}

export default function RendererContainmentGate({children}){
  useLayoutEffect(() => {
    if(typeof document === "undefined") return undefined

    function wireRenderers(){
      document.querySelectorAll(".dh-renderer.has-api").forEach(ensureLiveControls)
    }

    wireRenderers()
    const observer = new MutationObserver(wireRenderers)
    observer.observe(document.body, {childList: true, subtree: true, attributes: true, attributeFilter: ["src", "class"]})

    function closeWithEscape(event){
      if(event.key !== "Escape") return
      document.querySelectorAll(".dh-renderer.live-open").forEach(closeAssets)
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
