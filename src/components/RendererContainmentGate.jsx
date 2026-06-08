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

function stageFor(renderer){
  return renderer.closest(".dh-stage") || renderer.parentElement || document
}

function previewSource(renderer){
  const stage = stageFor(renderer)
  const activeThumb = stage.querySelector(".dh-feed-card.active .dh-mini-thumb")
  const firstThumb = stage.querySelector(".dh-mini-thumb")
  const image = activeThumb || firstThumb
  return image?.currentSrc || image?.getAttribute("src") || ""
}

function ensureSystemPreview(renderer){
  renderer.classList.add("api-system-view")
  renderer.querySelectorAll(".dh-live-toggle, .dh-live-close").forEach((node) => node.remove())

  let preview = renderer.querySelector(".dh-api-system-preview")
  if(!preview){
    preview = document.createElement("div")
    preview.className = "dh-api-system-preview"
    preview.innerHTML = "<span>API system view</span><b>Feed loaded</b>"
    renderer.append(preview)
  }

  const src = previewSource(renderer)
  if(src){
    preview.style.setProperty("--api-preview-url", `url("${src}")`)
    preview.classList.add("api-preview-ready")
  } else {
    preview.style.removeProperty("--api-preview-url")
    preview.classList.remove("api-preview-ready")
  }
}

function stabilizeRenderer(renderer){
  closeAssets(renderer)
  ensureSystemPreview(renderer)
}

export default function RendererContainmentGate({children}){
  useLayoutEffect(() => {
    if(typeof document === "undefined") return undefined

    function wireRenderers(){
      document.querySelectorAll(".dh-renderer.has-api").forEach(stabilizeRenderer)
    }

    wireRenderers()
    const observer = new MutationObserver(wireRenderers)
    observer.observe(document.body, {childList: true, subtree: true, attributes: true, attributeFilter: ["src", "class"]})

    function closeWithEscape(event){
      if(event.key !== "Escape") return
      document.querySelectorAll(".dh-renderer.has-api").forEach(stabilizeRenderer)
    }

    document.addEventListener("keydown", closeWithEscape)

    return () => {
      observer.disconnect()
      document.removeEventListener("keydown", closeWithEscape)
      document.querySelectorAll(".dh-api-system-preview, .dh-live-toggle, .dh-live-close").forEach((node) => node.remove())
    }
  }, [])

  return children
}
