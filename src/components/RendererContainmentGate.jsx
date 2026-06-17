import React, {useLayoutEffect} from "react"
import "./FullscreenObservatory.containment.css"

const ACCESS_WINDOW_MS = 4200

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

function previewDetailsFrom(node){
  if(!node) return {src: "", title: ""}
  const image = node.querySelector?.(".dh-mini-thumb, img")
  const title = node.dataset?.previewTitle || node.querySelector?.("b")?.textContent || node.querySelector?.("small")?.textContent || node.textContent || ""
  return {
    src: node.dataset?.preview || image?.currentSrc || image?.getAttribute?.("src") || "",
    title: title.replace(/\s+/g, " ").trim()
  }
}

function previewSource(renderer){
  const stage = stageFor(renderer)
  const selectors = [
    ".dh-feed-card.active",
    ".dh-tour-card.active",
    ".dh-category-card.active",
    ".dh-feed-card",
    ".dh-tour-card",
    ".dh-category-card"
  ]

  for(const selector of selectors){
    const details = previewDetailsFrom(stage.querySelector(selector))
    if(details.src) return details
  }

  const activeThumb = stage.querySelector(".dh-feed-card.active .dh-mini-thumb")
  const firstThumb = stage.querySelector(".dh-mini-thumb")
  const image = activeThumb || firstThumb
  return {src: image?.currentSrc || image?.getAttribute("src") || "", title: "Feed loaded"}
}

function setSystemPreview(renderer, details = {}, force = false){
  const preview = renderer.querySelector(".dh-api-system-preview")
  if(!preview) return

  const src = details.src || ""
  const label = preview.querySelector("b")
  if(label && details.title) label.textContent = details.title

  if(src){
    preview.style.setProperty("--api-preview-url", `url("${src}")`)
    preview.classList.add("api-preview-ready")
  } else {
    preview.style.removeProperty("--api-preview-url")
    preview.classList.remove("api-preview-ready")
  }

  preview.classList.toggle("preview-peek", Boolean(force))
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
      requestRendererAccess()
    })
  }

  setSystemPreview(renderer, previewSource(renderer))
}

function accessIntentActive(){
  return Date.now() < Number(window.__digitalhutContainmentIntentUntil || 0)
}

function requestRendererAccess(){
  window.__digitalhutContainmentIntentUntil = Date.now() + ACCESS_WINDOW_MS
  ;[50, 220, 850, 1800].forEach((delay) => window.setTimeout(openFirstRenderer, delay))
}

function stabilizeRenderer(renderer){
  const source = assetNodes(renderer).map(rememberSource).find(Boolean) || renderer.dataset.liveSource || ""
  if(source && renderer.dataset.liveSource !== source){
    renderer.dataset.liveSource = source
  }

  if(source){
    openAssets(renderer)
    renderer.querySelectorAll(".dh-api-system-preview.preview-peek").forEach((node) => node.classList.remove("preview-peek"))
    return
  }

  if(renderer.classList.contains("data-open")){
    renderer.querySelectorAll(".dh-api-system-preview").forEach((node) => node.remove())
    return
  }

  ensureSystemPreview(renderer)
}

function openFirstRenderer(){
  const renderer = document.querySelector(".dh-renderer.has-api.live-open") || document.querySelector(".dh-stage .dh-renderer.has-api") || document.querySelector(".dh-renderer.has-api")
  if(renderer) openAssets(renderer)
}

function previewFirstRenderer(details, force = false){
  const renderer = document.querySelector(".dh-stage .dh-renderer.has-api") || document.querySelector(".dh-renderer.has-api")
  if(renderer) setSystemPreview(renderer, details, force)
}

export default function RendererContainmentGate({children}){
  useLayoutEffect(() => {
    if(typeof document === "undefined") return undefined

    function wireRenderers(){
      document.querySelectorAll(".dh-renderer.has-api").forEach(stabilizeRenderer)
      if(accessIntentActive()) openFirstRenderer()
    }

    wireRenderers()
    const observer = new MutationObserver(wireRenderers)
    observer.observe(document.body, {childList: true, subtree: true, attributes: true, attributeFilter: ["src", "class", "data-preview"]})

    function closeWithEscape(event){
      if(event.key !== "Escape") return
      window.__digitalhutContainmentIntentUntil = 0
      document.querySelectorAll(".dh-api-system-preview.preview-peek").forEach((node) => node.classList.remove("preview-peek"))
    }

    function openFromGuide(){
      requestRendererAccess()
    }

    function previewFromUi(event){
      if(event.detail?.clearFull){
        document.querySelectorAll(".dh-api-system-preview.preview-peek").forEach((node) => node.classList.remove("preview-peek"))
        return
      }
      previewFirstRenderer(event.detail || {}, Boolean(event.detail?.full))
    }

    function clickForContainment(event){
      const card = event.target.closest?.(".dh-feed-card, .dh-tour-card, .dh-category-card, .dh-stage-pill, .dh-open-containment")
      const button = event.target.closest?.("button")
      const label = button?.textContent?.replace(/\s+/g, " ").trim() || ""
      const modeButton = /premium tour|regular api|next stage|open containment/i.test(label)
      if(!card && !modeButton) return

      const details = previewDetailsFrom(card || button)
      if(details.src) previewFirstRenderer(details, true)
      requestRendererAccess()
    }

    document.addEventListener("keydown", closeWithEscape)
    document.addEventListener("click", clickForContainment, true)
    window.addEventListener("digitalhut:open-containment", openFromGuide)
    window.addEventListener("digitalhut:preview-containment", previewFromUi)

    return () => {
      observer.disconnect()
      document.removeEventListener("keydown", closeWithEscape)
      document.removeEventListener("click", clickForContainment, true)
      window.removeEventListener("digitalhut:open-containment", openFromGuide)
      window.removeEventListener("digitalhut:preview-containment", previewFromUi)
      document.querySelectorAll(".dh-api-system-preview, .dh-live-toggle, .dh-live-close").forEach((node) => node.remove())
    }
  }, [])

  return children
}
