import {seoEntryTrailForEvent, seoSearchClaimForQuery} from "./seoSearchClaimEngine"
import {digitalhutMasterListBridge} from "./digitalhutMasterListBridge"
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

function defaultCategoryForEvent(eventName, data = {}){
  const explicit = data.category || data.lane || data.metadata?.lane || ""
  if(explicit) return explicit
  const pathname = typeof location !== "undefined" ? location.pathname : ""
  if(pathname === "/" || pathname === digitalhutMasterListBridge.proofRoute || pathname === digitalhutMasterListBridge.keywordCoverageRoute) return digitalhutMasterListBridge.lane
  if(["page_view", "proof_route_open", "backlink_source_open", "watch_route_open", "blog_route_open", "category_proof_open", "zone_checkpoint_open"].includes(eventName)) return digitalhutMasterListBridge.lane
  return ""
}

function sendPixel(eventName, data = {}){
  const category = defaultCategoryForEvent(eventName, data)
  const pixelData = {...data, category}
  const searchClaimText = data.search || data.query || data.keywordHint || data.label || ""
  const path = `${location.pathname}${location.search}${location.hash}`
  const entryTrail = seoEntryTrailForEvent(eventName, {
    ...pixelData,
    path,
    referrer: document.referrer || "",
    title: document.title || ""
  })
  const seoClaim = eventName === "search_run"
    ? seoSearchClaimForQuery(searchClaimText, {category, path: location.pathname})
    : entryTrail.backlinkTrail
      ? {
        lane: entryTrail.backlinkTrail.lane,
        rankOwnershipMode: entryTrail.backlinkTrail.mode,
        rankUrl: entryTrail.backlinkTrail.rankUrl,
        measurementSignals: entryTrail.backlinkTrail.measurementSignals
      }
      : null
  const body = {
    eventName,
    ...currentContext(pixelData),
    keywordHint: data.keywordHint || inferKeywordHint(`${data.label || ""} ${data.path || ""} ${category}`),
    seoClaim,
    entryTrail,
    metadata: {
      viewport: `${innerWidth}x${innerHeight}`,
      language: navigator.language || "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
      seoClaim,
      entryTrail,
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

const searchEventCache = new Map()

function isSearchInput(input){
  if(!input || !["INPUT", "TEXTAREA", "SELECT"].includes(input.tagName)) return false
  const label = String([
    input.name,
    input.id,
    input.placeholder,
    input.getAttribute("aria-label"),
    input.closest("form")?.getAttribute("aria-label")
  ].filter(Boolean).join(" ")).toLowerCase()
  return input.type === "search" || label.includes("search") || label.includes("query") || label.includes("command")
}

function trackSearchInput(input, reason){
  if(!isSearchInput(input)) return
  const value = String(input.value || "").trim()
  if(value.length < 2) return
  const key = `${location.pathname}|${reason}|${value.toLowerCase()}`
  const now = Date.now()
  if(now - (searchEventCache.get(key) || 0) < 8000) return
  searchEventCache.set(key, now)
  sendPixel("search_run", {
    search: value,
    keywordHint: value,
    metadata: {queryLength: value.length, reason}
  })
}

function routeProofEventForPath(pathname){
  if(pathname === digitalhutMasterListBridge.proofRoute || pathname === digitalhutMasterListBridge.keywordCoverageRoute || pathname === "/source-bridge") return "proof_route_open"
  if(/^\/watch\/[^/]+/.test(pathname)) return "watch_route_open"
  if(/^\/zone\/[^/]+/.test(pathname)) return "zone_checkpoint_open"
  if(/^\/category\/[^/]+/.test(pathname)) return "category_proof_open"
  if(/^\/blog\/[^/]+/.test(pathname)) return "blog_route_open"
  return ""
}

function routeSlugForPath(pathname){
  if(pathname === digitalhutMasterListBridge.proofRoute) return digitalhutMasterListBridge.id
  if(pathname === digitalhutMasterListBridge.keywordCoverageRoute) return "digitalhut-master-keyword-coverage"
  if(pathname === "/source-bridge") return "digitalhut-200m-source-bridge"
  const match = pathname.match(/^\/(?:watch|category|blog|zone)\/([^/]+)/)
  return match ? decodeURIComponent(match[1]) : ""
}

function masterKeywordParams(){
  const params = new URLSearchParams(location.search || "")
  const lane = params.get("dh_lane") || ""
  const globalRank = params.get("dh_global_rank") || ""
  const rank = params.get("dh_rank") || ""
  const query = params.get("dh_query") || ""
  return {
    lane,
    globalRank,
    rank,
    query,
    isMasterKeywordDoor: Boolean(lane || globalRank || query)
  }
}

function masterListTrailForPath(pathname, masterKeyword = {}){
  const slug = routeSlugForPath(pathname)
  const title = typeof document !== "undefined" ? document.title || "" : ""
  return {
    lane: masterKeyword.lane || digitalhutMasterListBridge.lane,
    globalRank: masterKeyword.globalRank || "",
    rank: masterKeyword.rank || "",
    query: masterKeyword.query || inferKeywordHint(`${slug} ${title}`) || "DigitalHut full entertainment dapp observatory",
    source: masterKeyword.isMasterKeywordDoor ? "url-master-keyword-params" : "site-wide-master-list-entry",
    proofRoute: digitalhutMasterListBridge.proofRoute,
    sourceBridgePath: digitalhutMasterListBridge.sourceBridgePath,
    measurableFacet: digitalhutMasterListBridge.lane,
    universe: digitalhutMasterListBridge.universe,
    publicSitemapWindow: digitalhutMasterListBridge.publicSitemapWindow
  }
}

function linkContext(href){
  if(!href) return {path: "", isExternal: false}
  try {
    const url = new URL(href, location.origin)
    return {
      path: url.pathname,
      isExternal: url.origin !== location.origin
    }
  } catch {
    return {path: "", isExternal: false}
  }
}

function trackPageView(reason = "route"){
  const pathname = location.pathname
  const masterKeyword = masterKeywordParams()
  const masterListTrail = masterListTrailForPath(pathname, masterKeyword)
  sendPixel(pathname.startsWith("/blog") ? "blog_view" : "page_view", {
    keywordHint: masterListTrail.query,
    category: masterListTrail.lane,
    metadata: {
      reason,
      masterKeyword: masterListTrail,
      masterListTrail
    }
  })
  const proofEvent = routeProofEventForPath(pathname)
  if(proofEvent){
    sendPixel(proofEvent, {
      keywordHint: masterListTrail.query,
      category: masterListTrail.lane,
      metadata: {
        reason,
        routeSlug: routeSlugForPath(pathname),
        routePath: pathname,
        masterKeyword: masterListTrail,
        masterListTrail
      }
    })
  }
}

function classifyClick(target){
  const element = target.closest?.("a,button,[role='button'],input[type='submit'],input[type='button']")
  if(!element) return null
  const label = (element.getAttribute("aria-label") || element.textContent || element.value || "").replace(/\s+/g, " ").trim().slice(0, 160)
  const href = element.href || element.getAttribute("href") || ""
  const thumbnailIntent = element.dataset?.dhThumbnailRender || element.closest?.("[data-dh-thumbnail-render]")?.dataset?.dhThumbnailRender
  const category = element.dataset?.dhCategory || element.closest?.("[data-dh-category]")?.dataset?.dhCategory || ""
  const assetId = element.dataset?.dhAssetId || element.closest?.("[data-dh-asset-id]")?.dataset?.dhAssetId || ""
  const isPodcastControl = Boolean(element.closest?.(".dh-podcast-panel"))
  const link = linkContext(href)
  const lower = `${label} ${href}`.toLowerCase()
  const proofEvent = routeProofEventForPath(link.path)
  const sourceIntent = link.isExternal || lower.includes("source") || lower.includes("backlink") || lower.includes("citation")
  const glbSourceIntent = lower.includes("sketchfab") || lower.includes(".glb") || lower.includes("3d model source")
  const genericPreviewIntent = lower.includes("play") || lower.includes("preview")
  let eventName = "ui_click"
  if(thumbnailIntent) eventName = "thumbnail_render_click"
  if(genericPreviewIntent && !isPodcastControl && !proofEvent && !sourceIntent) eventName = "glb_preview_play"
  if(lower.includes("download") && !sourceIntent) eventName = "download_click"
  if(lower.includes("share") && !sourceIntent) eventName = "share_click"
  if(proofEvent) eventName = proofEvent
  if(sourceIntent) eventName = "backlink_source_open"
  if(lower.includes("podcast") && sourceIntent) eventName = "podcast_source_open"
  if(glbSourceIntent) eventName = "glb_source_click"
  if(isPodcastControl && (lower.includes("play") || lower.includes("stop") || lower.includes("special moment"))) eventName = "podcast_interrupt_start"
  if(!sourceIntent && !proofEvent && (lower.includes("wallet") || lower.includes("connect"))) eventName = "wallet_connect_click"
  if(!sourceIntent && !proofEvent && (lower.includes("standard") || lower.includes("premium") || lower.includes("pro"))) eventName = "tier_click"
  if(!sourceIntent && !proofEvent && (lower.includes("node") || lower.includes("stellar") || lower.includes("genius"))) eventName = "node_click"
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
    trackSearchInput(input, "change")
  }, {capture: true})
  document.addEventListener("keydown", (event) => {
    if(event.key !== "Enter") return
    trackSearchInput(event.target, "enter")
  }, {capture: true})
  document.addEventListener("submit", (event) => {
    const form = event.target
    const input = form?.querySelector?.("input,textarea,select")
    trackSearchInput(input, "submit")
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






