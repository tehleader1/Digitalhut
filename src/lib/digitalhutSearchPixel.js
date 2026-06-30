const pixelEndpoint = "/api/insight-map"
const sessionKey = "digitalhut_pixel_session_id"
const visitorKey = "digitalhut_pixel_visitor_id"

function randomId(prefix){
  const cryptoValue = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
  return `${prefix}_${cryptoValue}`
}

function storageId(key, prefix, storage = sessionStorage){
  try {
    const existing = storage.getItem(key)
    if(existing) return existing
    const value = randomId(prefix)
    storage.setItem(key, value)
    return value
  } catch {
    return randomId(prefix)
  }
}

function currentContext(extra = {}){
  const path = `${location.pathname}${location.search}${location.hash}`
  const blogMatch = location.pathname.match(/^\/blog\/([^/]+)/)
  return {
    sessionId: storageId(sessionKey, "dh_s", sessionStorage),
    visitorId: storageId(visitorKey, "dh_v", localStorage),
    path,
    referrer: document.referrer || "",
    title: document.title || "",
    search: location.search || "",
    blogSlug: blogMatch ? decodeURIComponent(blogMatch[1]) : location.pathname === "/blog" ? "blog-index" : "",
    ...extra
  }
}

function inferKeywordHint(text){
  const value = String(text || "").toLowerCase()
  const map = [
    ["real estate", "3D real estate walkthrough"],
    ["house", "real estate house model"],
    ["bedroom", "2 bedroom house model"],
    ["game", "3D game model"],
    ["gamer", "gamer 3D model"],
    ["research", "3D research data presentation"],
    ["science", "3D research visualization"],
    ["wallet", "wallet connected 3D platform"],
    ["premium", "premium AI presentation"],
    ["node", "DigitalHut node progression"],
    ["observatory", "AI 3D observatory"],
    ["glb", "automatic GLB presentation"],
    ["3d", "3D experience"]
  ]
  return map.find(([needle]) => value.includes(needle))?.[1] || ""
}

function sendPixel(eventName, data = {}){
  const body = {
    eventName,
    ...currentContext(data),
    keywordHint: data.keywordHint || inferKeywordHint(`${data.label || ""} ${data.path || ""} ${data.category || ""}`),
    metadata: {
      viewport: `${innerWidth}x${innerHeight}`,
      language: navigator.language || "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
      ...data.metadata
    }
  }
  const json = JSON.stringify(body)
  if(navigator.sendBeacon){
    const blob = new Blob([json], {type: "application/json"})
    if(navigator.sendBeacon(pixelEndpoint, blob)) return
  }
  fetch(pixelEndpoint, {
    method: "POST",
    headers: {"content-type": "application/json"},
    body: json,
    keepalive: true
  }).catch(() => {})
}

function trackPageView(reason = "route"){
  sendPixel(location.pathname.startsWith("/blog") ? "blog_view" : "page_view", {metadata: {reason}})
}

function classifyClick(target){
  const element = target.closest?.("a,button,[role='button'],input[type='submit'],input[type='button']")
  if(!element) return null
  const label = (element.getAttribute("aria-label") || element.textContent || element.value || "").replace(/\s+/g, " ").trim().slice(0, 160)
  const href = element.href || element.getAttribute("href") || ""
  const thumbnailIntent = element.dataset?.dhThumbnailRender || element.closest?.("[data-dh-thumbnail-render]")?.dataset?.dhThumbnailRender
  const category = element.dataset?.dhCategory || element.closest?.("[data-dh-category]")?.dataset?.dhCategory || ""
  const assetId = element.dataset?.dhAssetId || element.closest?.("[data-dh-asset-id]")?.dataset?.dhAssetId || ""
  const lower = `${label} ${href}`.toLowerCase()
  let eventName = "ui_click"
  if(thumbnailIntent) eventName = "thumbnail_render_click"
  if(lower.includes("play") || lower.includes("preview")) eventName = "glb_preview_play"
  if(lower.includes("download")) eventName = "download_click"
  if(lower.includes("share")) eventName = "share_click"
  if(lower.includes("wallet") || lower.includes("connect")) eventName = "wallet_connect_click"
  if(lower.includes("standard") || lower.includes("premium") || lower.includes("pro")) eventName = "tier_click"
  if(lower.includes("node") || lower.includes("stellar") || lower.includes("genius")) eventName = "node_click"
  if(thumbnailIntent && (lower.includes("play") || lower.includes("preview"))) eventName = "thumbnail_render_click"
  return {eventName, label, href, thumbnailIntent, category, assetId}
}

function installClickTracking(){
  document.addEventListener("click", (event) => {
    const click = classifyClick(event.target)
    if(!click) return
    sendPixel(click.eventName, {
      category: click.category,
      assetId: click.assetId,
      metadata: {label: click.label, href: click.href, thumbnailIntent: click.thumbnailIntent || ""}
    })
  }, {capture: true})
}

function installSearchTracking(){
  document.addEventListener("change", (event) => {
    const input = event.target
    if(!input || !["INPUT", "TEXTAREA", "SELECT"].includes(input.tagName)) return
    const value = String(input.value || "").trim()
    const label = String(input.name || input.id || input.placeholder || "").toLowerCase()
    if(value.length < 2) return
    if(label.includes("search") || label.includes("query") || input.type === "search"){
      sendPixel("search_run", {
        keywordHint: inferKeywordHint(value),
        metadata: {queryLength: value.length}
      })
    }
  }, {capture: true})
}

function installRouteTracking(){
  const originalPush = history.pushState
  const originalReplace = history.replaceState
  history.pushState = function pushState(...args){
    const result = originalPush.apply(this, args)
    queueMicrotask(() => trackPageView("pushState"))
    return result
  }
  history.replaceState = function replaceState(...args){
    const result = originalReplace.apply(this, args)
    queueMicrotask(() => trackPageView("replaceState"))
    return result
  }
  addEventListener("popstate", () => trackPageView("popstate"))
}

export function installDigitalHutSearchPixel(){
  if(typeof window === "undefined" || window.__digitalhutSearchPixelInstalled) return
  window.__digitalhutSearchPixelInstalled = true
  window.digitalhutPixel = {
    track: sendPixel,
    page: trackPageView
  }
  installRouteTracking()
  installClickTracking()
  installSearchTracking()
  trackPageView("initial")
}
