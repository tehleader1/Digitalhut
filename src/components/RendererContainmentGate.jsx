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
  renderer.dataset.containmentOpen = "false"
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
  renderer.dataset.containmentOpen = "true"
  renderer.classList.add("live-open")
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
    preview.innerHTML = "<span>API system view</span><b>Feed loaded</b><button class=\"dh-open-containment\" type=\"button\">Open Containment</button>"
    renderer.append(preview)
  }

  const open = preview.querySelector(".dh-open-containment")
  if(open && !open.dataset.bound){
    open.dataset.bound = "true"
    open.addEventListener("click", (event) => {
      event.preventDefault()
      event.stopPropagation()
      openAssets(renderer)
    })
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
  const source = assetNodes(renderer).map(rememberSource).find(Boolean) || renderer.dataset.liveSource || ""
  if(source && renderer.dataset.liveSource !== source){
    renderer.dataset.liveSource = source
    closeAssets(renderer)
  }

  if(!renderer.classList.contains("live-open")) closeAssets(renderer)
  ensureSystemPreview(renderer)
}

function openFirstRenderer(){
  const renderer = document.querySelector(".dh-renderer.has-api")
  if(renderer) openAssets(renderer)
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
      document.querySelectorAll(".dh-renderer.has-api").forEach(closeAssets)
    }

    function openFromGuide(){
      openFirstRenderer()
    }

    document.addEventListener("keydown", closeWithEscape)
    window.addEventListener("digitalhut:open-containment", openFromGuide)

    return () => {
      observer.disconnect()
      document.removeEventListener("keydown", closeWithEscape)
      window.removeEventListener("digitalhut:open-containment", openFromGuide)
      document.querySelectorAll(".dh-api-system-preview, .dh-live-toggle, .dh-live-close").forEach((node) => node.remove())
    }
  }, [])

  return children
}
