import React, {useEffect, useRef, useState} from "react"
import {ConnectButton} from "../wallet"
import "./FullscreenObservatory.css"
import "./FullscreenObservatory.api.css"
import "./FullscreenObservatory.sequence.css"

const INACTIVITY_MS = 8 * 60 * 1000
const accounts = ["guest", "standard", "premium", "pro"]
const layers = ["Base", "Architect", "Lighting", "Props", "Grid", "Coordinates"]
const digitalHutBrainMap = {
  mainFrame: "Double 007 Observatory Database",
  foundation: ["Supabase", "Vercel", "GitHub", "Codex", "APIs", "Back End"],
  experience: ["Main Screen Login", "Renderer", "Market Intelligence", "Library", "Quick Panels", "Category Feed", "Description"],
  features3d: ["Orbit Mode", "Layers", "Architect Mode", "Lighting", "Props", "Grid", "Coordinates"],
  physicalAssets: ["Android", "FireCuda", "HP Mini Laptop"],
  dataPolicy: "Physical assets are sensitive. Public data stays translucent, current, and verifiable through live observatory activity.",
  seoCanal: ["current category", "active renderer feed", "provider status", "asset title", "guided tour stage"],
  sessions: {
    Gamer: "Update real-life game concepts, inspect new game visuals, and turn models into playable session ideas.",
    "Real Estate": "Use models and housing data for agent-license career work, client scouting, and property decisions.",
    Programmer: "Inspect research data, backend features, API logic, and up-to-date decentralized network ideas.",
    Researcher: "Rotate models, log details, shuffle evidence quickly, and verify information before saving claims.",
    "Mainstream Streaming": "Track 2026 trends, interesting topics, creator clips, funny videos, and stream hooks.",
    Planetary: "Explore structures, environments, places around the world, and planetary-style observation sessions."
  },
  futureBranding: {
    current: "DigitalHut",
    direction: "shorter, stronger probe/search/vision brand for AI observatory sessions",
    candidates: ["Probevision", "ProbeOne", "Probe", "ProbeNet", "VisionProbe"]
  }
}

const stockImages = {
  "Continent": ["photo-1500530855697-b586d89ba3ee", "photo-1486406146926-c627a92ad1ab", "photo-1518005020951-eccb494ad742", "photo-1493246507139-91e8fad9978e"],
  "Planetary": ["photo-1446776811953-b23d57bd21aa", "photo-1454789548928-9efd52dc4031", "photo-1462331940025-496dfbfc7564", "photo-1419242902214-272b3f66ee7a"],
  "Gamer": ["photo-1542751371-adc38448a05e", "photo-1511512578047-dfb367046420", "photo-1550745165-9bc0b252726f", "photo-1493711662062-fa541adb3fc8"],
  "Real Estate": ["photo-1560518883-ce09059eeffa", "photo-1600585154340-be6161a56a0c", "photo-1484154218962-a197022b5858", "photo-1600607687939-ce8a6c25118c"],
  "Workforce": ["photo-1504307651254-35680f356dfd", "photo-1517048676732-d65bc937f952", "photo-1521791136064-7986c2920216", "photo-1581092918056-0c4c3acd3789"],
  "Home Project": ["photo-1513694203232-719a280e022f", "photo-1600585154526-990dced4db0d", "photo-1586023492125-27b2c045efd7", "photo-1505693416388-ac5ce068fe85"],
  "Political": ["photo-1529107386315-e1a2ed48a620", "photo-1464692805480-a69dfaafdb0d", "photo-1523292562811-8fa7962a78c8", "photo-1500534314209-a25ddb2bd429"],
  "Programmer": ["photo-1515879218367-8466d910aaa4", "photo-1555066931-4365d14bab8c", "photo-1516321318423-f06f85e504b3", "photo-1558494949-ef010cbdcc31"],
  "Mainstream Streaming": ["photo-1611162617474-5b21e879e113", "photo-1557804506-669a67965ba0", "photo-1516321497487-e288fb19713f", "photo-1495020689067-958852a7765e"],
  "Researcher": ["photo-1532094349884-543bc11b234d", "photo-1507413245164-6160d8298b31", "photo-1581093588401-fbb62a02f120", "photo-1451187580459-43490279c0fa"]
}

function stockUrl(category, index = 0){
  const pool = stockImages[category] || stockImages.Continent
  const id = pool[index % pool.length]
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=82`
}

function pausedEmbedUrl(value){
  if(!value) return ""
  return value
    .replace("autostart=1", "autostart=0")
    .replace("autospin=.15", "autospin=0")
}

function readStorage(key, fallback = ""){
  if(typeof window === "undefined") return fallback
  return window.localStorage.getItem(key) || fallback
}

function hasFreshEntry(){
  if(typeof window === "undefined") return false
  const last = Number(readStorage("digitalhut:lastAccountEntry", "0"))
  return last > 0 && Date.now() - last < INACTIVITY_MS
}

function preloadImages(urls){
  if(typeof window === "undefined") return Promise.resolve()
  const unique = [...new Set(urls.filter(Boolean))]
  return Promise.all(unique.map((src) => new Promise((resolve) => {
    const image = new Image()
    const done = () => resolve()
    image.onload = done
    image.onerror = done
    image.src = src
  })))
}

function observatoryRecord({category, stage, sceneFeed, mode, tier, loading}){
  return {
    mainFrame: digitalHutBrainMap.mainFrame,
    category,
    stage: stage.label,
    mode,
    tier,
    title: sceneFeed.title,
    provider: sceneFeed.apiSource || sceneFeed.apiStatus || "seed",
    status: loading ? "verifying" : sceneFeed.apiStatus || "ready",
    physicalAssets: digitalHutBrainMap.physicalAssets,
    seoCanal: digitalHutBrainMap.seoCanal,
    verifiedAt: new Date().toISOString()
  }
}

const categories = [
  ["Continent", "CO", "#67e8f9", "global terrain, travel, culture, and education"],
  ["Planetary", "PL", "#a78bfa", "structures, environments, and places around the world or off-world"],
  ["Gamer", "GM", "#22c55e", "real-life game updates, new game visuals, level ideas, and play-session scouting"],
  ["Real Estate", "RE", "#2dd4bf", "agent-license career sessions, property models, housing data, and client-ready scouting"],
  ["Workforce", "WF", "#fb7185", "jobsites, training, operations, and safety walkthroughs"],
  ["Home Project", "HP", "#facc15", "personal builds, interiors, repairs, and home planning"],
  ["Political", "PO", "#f97316", "civic geography, public works, maps, and policy spaces"],
  ["Programmer", "PR", "#38bdf8", "research data, backend features, decentralized networks, APIs, and prototype logic"],
  ["Mainstream Streaming", "MS", "#f43f5e", "2026 trends, interesting topics, creator clips, funny videos, and stream-ready discussion"],
  ["Researcher", "RS", "#c084fc", "research notes, model rotation, detail logging, fast shuffling, verification, and AI analysis"]
].map(([id, icon, accent, context]) => ({id, icon, accent, context}))

const seedQueries = {
  "Continent": ["cape town south africa 3d city terrain", "caribbean colonial zone historic 3d", "hollywood sign los angeles 3d", "european buildings old city architecture 3d"],
  "Planetary": ["international space station 3d model", "moon surface observatory 3d", "mars terrain 3d", "orbital city grid 3d"],
  "Gamer": ["game city pack prototype 3d", "animated environment game scene 3d", "mission hub game prototype 3d", "sci fi arena 3d"],
  "Real Estate": ["modern house real estate 3d", "wall street new york financial district 3d", "residential neighborhood terrain 3d", "apartment building architecture 3d"],
  "Workforce": ["construction jobsite structure 3d", "warehouse training safety 3d", "city infrastructure operations 3d", "coastal response emergency planning 3d"],
  "Home Project": ["home build sketch 3d", "interior design room 3d", "home repair tools 3d", "coastal home beachfront 3d"],
  "Political": ["civic district public works 3d", "government building city 3d", "historical public square 3d", "infrastructure civic assets 3d"],
  "Programmer": ["developer api data center 3d", "renderer stress test 3d model", "city data twin 3d", "tool builder 3d interface"],
  "Mainstream Streaming": ["2026 viral video studio set", "funny creator clip environment", "streaming trend room visual", "social media trend visualization"],
  "Researcher": ["research archive 3d visualization", "scientific orbit research 3d", "field study terrain 3d", "ai analysis room 3d"]
}

const guidedTours = {
  "Continent": [["Terrain", "TR", "Read elevation, coastline, streets, routes, and what the region teaches."], ["Culture", "CU", "Explain landmarks, public memory, travel value, and culture."], ["Route", "RT", "Move through access points and nearby context."], ["Compare", "CP", "Compare this place against similar regions."]],
  "Planetary": [["Orbit", "OR", "Start from orbit, scale, lighting, and mission frame."], ["Surface", "SF", "Inspect terrain, hazards, and research targets."], ["Mission", "MS", "Narrate objectives and next observation."], ["Research", "RS", "Name evidence, uncertainty, and open questions."]],
  "Gamer": [["Spawn", "SP", "Read spawn, sightlines, paths, and first player decision."], ["Mechanics", "MC", "Explain loops, hazards, rewards, and interaction zones."], ["Assets", "AS", "Inspect modular value and prototype readiness."], ["Quest", "QS", "Turn the scene into a playable quest route."]],
  "Real Estate": [["Property", "PR", "Explain the house or site model, layout, access, value, and development potential."], ["Block", "BK", "Read nearby streets, neighbors, demand signals, and zoning feel."], ["Risk", "RK", "Call out weather, slope, maintenance, liquidity, and inspection questions."], ["Market", "MK", "Move into statistics: price context, market pressure, comparable assets, and premium decision points."]],
  "Workforce": [["Safety", "SF", "Walk hazards, access, staging, and worker awareness."], ["Training", "TR", "Teach the scene as a new-worker module."], ["Ops", "OP", "Explain routing, resources, crew flow, and bottlenecks."], ["Audit", "AU", "Record what is live, what needs verification, and what changed."]],
  "Home Project": [["Plan", "PL", "Plan layout, measurements, materials, and next step."], ["Repair", "RP", "Inspect issue zones, sequence, tools, and cautions."], ["Design", "DS", "Guide style, lighting, props, and finished feel."], ["Budget", "BG", "Explain cost, substitutions, scope creep, and buying checks."]],
  "Political": [["Civic", "CV", "Read public access, service zones, and community value."], ["Policy", "PY", "Explain infrastructure choices, funding, and tradeoffs."], ["Public", "PB", "Narrate so normal visitors understand the space."], ["Map", "MP", "Use boundaries, routes, population pressure, and comparison."]],
  "Programmer": [["API", "AP", "Inspect provider source, payload shape, and fallback state."], ["Runtime", "RT", "Narrate renderer state, wallet state, and asset load path."], ["Agent", "AG", "Explain monitoring, SEO, GLB testing, and FireCuda ops."], ["Debug", "DB", "State what is live, fallback, blocked, and how to verify."]],
  "Mainstream Streaming": [["Trend", "TR", "Frame why this topic, clip, or visual could hold attention in 2026."], ["Hook", "HK", "Name the funny, surprising, useful, or visual moment to lead with."], ["Audience", "AU", "Explain who would watch, share, remix, or react to it."], ["Next Clip", "NC", "Move to a related model or visual so the stream keeps momentum."]],
  "Researcher": [["Evidence", "EV", "Review source quality, uncertainty, and strongest supportable claim."], ["Sources", "SO", "Name APIs, missing data, and verification path."], ["Compare", "CP", "Compare against related scenes and datasets."], ["Hypothesis", "HY", "Build a testable hypothesis and next observation."]]
}

const stages = [
  {id: "Model", label: "Current GLB", kind: "current", orbit: "25deg 62deg auto"},
  {id: "Angle", label: "Angle Pass", kind: "angle", orbit: "70deg 68deg auto"},
  {id: "Similar", label: "Similar GLB", kind: "similar", orbit: "-35deg 64deg auto"},
  {id: "Stats", label: "Statistics GLB", kind: "stats", orbit: "35deg 58deg auto"}
]

function metaFor(category){
  return categories.find((item) => item.id === category) || categories[0]
}

function toursFor(category){
  return (guidedTours[category] || guidedTours.Continent).map(([id, icon, prompt]) => ({id, icon, prompt}))
}

function seedFeeds(category){
  const meta = metaFor(category)
  return (seedQueries[category] || seedQueries.Continent).map((query, index) => ({
    id: `seed:${category}:${index}:${query}`,
    title: query.replace(/\b3d\b/gi, "").replace(/\s+/g, " ").trim(),
    note: `API seed for ${meta.context}.`,
    query,
    category,
    icon: meta.icon,
    accent: meta.accent,
    context: meta.context,
    thumbnail: stockUrl(category, index),
    apiStatus: "seed"
  }))
}

function cleanUrl(value){
  if(!value || typeof value !== "string") return ""
  return value.startsWith("//") ? `https:${value}` : value
}

function payloadItems(payload){
  const pools = [payload?.assets, payload?.results, payload?.items, payload?.models, payload?.feed, payload?.data]
  for(const pool of pools){
    if(Array.isArray(pool)) return pool
    if(Array.isArray(pool?.results)) return pool.results
    if(Array.isArray(pool?.items)) return pool.items
  }
  return []
}

function firstThumbnail(item){
  const images = item?.thumbnails?.images || item?.thumbnail?.images || item?.images || []
  if(Array.isArray(images) && images.length){
    const best = [...images].sort((a, b) => (b.width || 0) - (a.width || 0))[0]
    return cleanUrl(best?.url || best?.src)
  }
  return cleanUrl(item?.thumbnailUrl || item?.thumbnail_url || item?.thumbnail || item?.image || item?.poster || item?.cover)
}

function normalizeAsset(item, category, index, source, term){
  const meta = metaFor(category)
  const uid = item?.uid || item?.modelUid || item?.model_uid || item?.model?.uid || ""
  const embedUrl = cleanUrl(item?.embedUrl || item?.embed_url || item?.viewerEmbedUrl || item?.viewer_embed_url || item?.embed?.url || item?.urls?.embed || (uid ? `https://sketchfab.com/models/${uid}/embed?autostart=1&autospin=.15&ui_theme=dark&ui_infos=0&ui_watermark=0` : ""))
  const modelUrl = cleanUrl(item?.modelUrl || item?.model_url || item?.glbUrl || item?.glb_url || item?.gltfUrl || item?.gltf_url || item?.downloadUrl || item?.download_url)
  const viewerUrl = cleanUrl(item?.viewerUrl || item?.viewer_url || item?.url || item?.urls?.viewer || item?.webUrl || item?.web_url)
  const title = item?.title || item?.name || item?.displayName || `${category} API feed ${index + 1}`
  return {
    id: `api:${source}:${category}:${uid || index}:${title}`,
    title,
    note: item?.note || item?.description || item?.summary || `Live API result for ${term || category}.`,
    query: term || title,
    category,
    icon: meta.icon,
    accent: meta.accent,
    context: meta.context,
    thumbnail: firstThumbnail(item) || stockUrl(category, index),
    embedUrl,
    modelUrl,
    viewerUrl,
    apiSource: item?.apiSource || source,
    apiStatus: item?.apiStatus || (embedUrl || modelUrl ? "model-connected" : "metadata"),
    providerMix: item?.providerMix || item?.providers || [source],
    market: item?.market,
    cesium: item?.cesium
  }
}

async function fetchWithTimeout(endpoint, options = {}, timeoutMs = 3200){
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs)
  try{
    return await fetch(endpoint, {...options, signal: controller.signal})
  } finally {
    window.clearTimeout(timeout)
  }
}

async function resolveApiFeeds(category, term){
  const query = encodeURIComponent(term || category)
  const encodedCategory = encodeURIComponent(category)
  const endpoints = [
    [`observatory-feed`, `/api/observatory-feed?category=${encodedCategory}&query=${query}`],
    [`sketchfab`, `/api/sketchfab?category=${encodedCategory}&query=${query}`],
    [`observatory`, `/api/observatory?category=${encodedCategory}&query=${query}`]
  ]

  for(const [source, endpoint] of endpoints){
    try{
      const response = await fetchWithTimeout(endpoint, {headers: {Accept: "application/json"}})
      if(!response.ok) continue
      const payload = await response.json()
      const feeds = payloadItems(payload).map((item, index) => normalizeAsset(item, category, index, source, term))
      if(feeds.length) return feeds.slice(0, 8)
    } catch {
      continue
    }
  }
  return []
}

function speak(text){
  if(typeof window === "undefined" || !("speechSynthesis" in window)) return
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.rate = 0.94
  utter.pitch = 0.92
  window.speechSynthesis.speak(utter)
}

function announceOpen3dModel(feed){
  speak(`Open 3D Model View. Attaching the AI to ${feed.title}.`)
}

function speechEngine(){
  if(typeof window === "undefined") return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

function categoryFromCommand(text){
  const value = text.toLowerCase()
  const matches = [
    ["Planetary", ["space", "planet", "planetary", "saturn", "mars", "moon", "orbit", "canada", "mountain", "environment", "place"]],
    ["Gamer", ["game", "gamer", "gaming", "level", "character", "avatar", "cool game"]],
    ["Real Estate", ["real estate", "housing", "house", "property", "agent", "north carolina", "middle class", "neighborhood"]],
    ["Programmer", ["programmer", "code", "backend", "decentralized", "api", "network", "database"]],
    ["Researcher", ["research", "researcher", "fossil", "history", "experiment", "analysis", "verify", "artifact"]],
    ["Mainstream Streaming", ["stream", "streaming", "trend", "funny video", "creator", "cat video", "viral"]],
    ["Workforce", ["workforce", "jobsite", "training"]],
    ["Home Project", ["home project", "repair", "interior"]],
    ["Political", ["political", "civic", "government"]],
    ["Continent", ["continent", "country", "world", "travel"]]
  ]
  return matches.find(([, aliases]) => aliases.some((alias) => value.includes(alias)))?.[0] || ""
}

function queryFromCommand(text, fallback){
  const value = text.toLowerCase()
  const cleaned = text.replace(/\b(open|show me|find|search|category|please|digitalhut|ai|preview|next|model|guided tour|tour)\b/gi, " ").replace(/\s+/g, " ").trim()
  if(cleaned.length > 2) return `${cleaned} 3d model visual`
  if(value.includes("canada")) return "canada landscape city terrain 3d model"
  if(value.includes("saturn")) return "saturn planet rings 3d model"
  if(value.includes("game character")) return "2026 cool game character 3d model"
  if(value.includes("north carolina")) return "north carolina middle class real estate housing 3d model"
  if(value.includes("cat")) return "funny cat video viral 2026 visual"
  if(value.includes("fossil")) return "fossil artifact dinosaur bone 3d model"
  if(value.includes("housing")) return "housing market property 3d model"
  if(value.includes("decentralized")) return "decentralized network data center 3d model"
  if(value.includes("funny")) return "funny creator video studio 2026 trend visual"
  return fallback
}

function topicInsight({category, query, feed, stage}){
  const subject = query.replace(/\b3d model visual\b/i, "").replace(/\b3d model\b/i, "").trim() || feed.title
  const source = feed.apiSource || feed.apiStatus || "observatory feed"
  if(category === "Planetary") return `I read ${subject} as a place or environment session. I would start wide, then rotate into the structure, terrain, scale, and visible landmarks. Source status is ${source}.`
  if(category === "Gamer") return `${subject} fits the Gamer lane. I am looking for silhouette, character readability, animation potential, world fit, and whether it could inspire a playable update. Source status is ${source}.`
  if(category === "Real Estate") return `${subject} fits Real Estate. I am checking location signal, property class, neighborhood context, middle-market usefulness, and what an agent could explain to a client. Source status is ${source}.`
  if(category === "Programmer") return `${subject} fits Programmer mode. I am checking data shape, backend use, provider reliability, decentralized network relevance, and what can be logged or automated. Source status is ${source}.`
  if(category === "Researcher") return `${subject} fits Researcher mode. I am checking evidence, age or history clues, broken areas, visible details, and what still needs verification. Source status is ${source}.`
  if(category === "Mainstream Streaming") return `${subject} fits Mainstream Streaming. I am looking for the hook, what makes it funny or shareable, why it could trend in 2026, and what clip should come next. Source status is ${source}.`
  return `${subject} is loaded in ${category}. I am checking the current model, the stage ${stage.label}, and what related model should come next.`
}

function shouldTreatAsSearch(text){
  const lower = text.toLowerCase()
  if(lower.includes("save") || lower.includes("download note") || lower.includes("guided") || lower.includes("tour") || lower.includes("rotate") || lower.includes("camera") || lower.includes("tell me more") || lower.includes("history") || lower.includes("facts") || lower.includes("preview next") || lower.includes("next model")) return false
  return true
}

function isNoteCommand(text){
  const lower = text.toLowerCase()
  return lower.includes("take note") || lower.includes("write note") || lower.includes("add note") || lower.includes("note this")
}

function guideLine({category, stage, feed, tour, expanded = false}){
  const base = `${stage.label}. ${feed.title}.`
  const session = metaFor(category).context
  if(stage.kind === "current") return expanded ? `${base} I am staying with the contained model for this ${session} session and checking the main shape, source, and viewing angle.` : `${base} First I hold on the model for the ${category} session.`
  if(stage.kind === "angle") return expanded ? `${base} Now I rotate the view slowly and look for layout, access, scale, and visible risk.` : `${base} Next angle, slow pass.`
  if(stage.kind === "similar") return expanded ? `${base} I compare this against a nearby or similar feed before making a stronger claim.` : `${base} Similar model comparison.`
  if(stage.kind === "stats") return expanded ? `${base} I move into market, provider, and verification context for ${category}. ${tour.prompt}` : `${base} Statistics and verification.`
  return expanded ? `${base} ${tour.prompt}` : base
}

function extendedGuideLine({category, stage, feed, tour, depth}){
  const session = metaFor(category).context
  if(depth <= 0) return guideLine({category, stage, feed, tour, expanded: true})
  if(depth === 1) return `${feed.title}. I am staying on this model a little longer and checking source, visual evidence, and what matters for ${session}.`
  return `${feed.title}. I have enough on this view. Next I need room to load a related model so the presentation can compare instead of overthinking one asset.`
}

function followUpNotes({category, stage, feed, tour}){
  const source = feed.apiSource || feed.apiStatus || "provider"
  const session = metaFor(category).context
  const notes = [
    `Verify ${feed.title} against the ${source} record.`,
    `Save this ${category} view if it supports ${session}.`,
    `Ask one follow-up: ${tour.prompt}`
  ]
  if(stage.kind === "angle") notes[0] = "Check the model from one more angle before explaining value."
  if(stage.kind === "similar") notes[1] = "Compare this asset against the next related feed before downloading."
  if(stage.kind === "stats") notes[2] = "Use market intelligence only after provider and asset status are clear."
  return notes
}

function playLoaderTone(){
  return
}

function createStatsFeed(feed, category, tour){
  const meta = metaFor(category)
  const marketLine = feed.market?.summary || feed.note || "Provider statistics and comparison layer."
  const cesiumLine = feed.cesium?.summary || "Geospatial context layer ready."
  return {
    ...feed,
    id: `stats:${feed.id}:${tour.id}`,
    title: `${feed.title} statistics model`,
    note: `${marketLine} ${cesiumLine}`,
    category,
    icon: "ST",
    accent: meta.accent,
    embedUrl: feed.statsEmbedUrl || "",
    modelUrl: feed.statsModelUrl || "",
    apiStatus: "statistics"
  }
}

function SceneObject({feed, compact = false}){
  const blocks = compact ? [0, 1, 2, 3] : [0, 1, 2, 3, 4, 5, 6]
  return <div className={`dh-scene-object ${compact ? "compact" : ""}`} style={{"--accent": feed.accent}}>
    <div className="dh-scene-halo" />
    <div className="dh-scene-disc" />
    <div className="dh-scene-blocks">{blocks.map((_, index) => <span key={index} style={{height: `${compact ? 28 + index * 9 : 52 + ((index * 23) % 90)}%`}} />)}</div>
    <div className="dh-scene-base" />
    <div className="dh-scene-code">{feed.icon}</div>
  </div>
}

function MiniVisual({feed, active}){
  return <div className={`dh-mini-visual ${feed.thumbnail ? "has-thumb" : ""} ${active ? "active" : ""}`} style={{"--accent": feed.accent, borderColor: active ? feed.accent : undefined}}>
    {feed.thumbnail && <img className="dh-mini-thumb" src={feed.thumbnail} alt="" loading="lazy" />}
    <SceneObject feed={feed} compact />
    <div className="dh-mini-scan" />
  </div>
}

function TourVisual({item, active, accent, image}){
  return <div className="dh-tour-visual" style={{"--accent": accent, borderColor: active ? accent : undefined}}>
    <img src={image} alt="" loading="lazy" />
    <span /><span /><b>{item.icon}</b>
  </div>
}

function RendererVisual({feed, stage, guided, loading, layer, renderLive, modelOpen, onOpenModel, onNext, onPlayMore, guideText, followUps}){
  const hasEmbed = Boolean(feed.embedUrl)
  const hasModel = Boolean(feed.modelUrl)
  const isStats = stage.kind === "stats"
  const [modelReady, setModelReady] = useState(false)
  const [imageReady, setImageReady] = useState(false)
  const stars = Array.from({length: 24})
  const skyline = Array.from({length: 18})
  const canShowContainment = renderLive && !isStats
  const liveOpen = canShowContainment && modelOpen && (hasEmbed || hasModel)

  useEffect(() => {
    setModelReady(false)
    if(!liveOpen || !hasModel || hasEmbed || isStats) return
    let cancelled = false
    import("@google/model-viewer").then(() => {
      if(!cancelled) setModelReady(true)
    }).catch(() => null)
    return () => {
      cancelled = true
    }
  }, [liveOpen, hasModel, hasEmbed, isStats, feed.modelUrl])

  useEffect(() => {
    setImageReady(false)
  }, [feed.thumbnail])

  return <div className={`dh-renderer ${guided ? "guided" : ""} ${canShowContainment ? "has-api" : ""} ${liveOpen ? "live-open" : ""} stage-${stage.kind}`} style={{"--accent": feed.accent}}>
    {feed.thumbnail && <img className={`dh-renderer-stock ${imageReady ? "is-ready" : ""}`} src={feed.thumbnail} alt="" loading="eager" onLoad={() => setImageReady(true)} />}
    <div className="dh-motion-sky" />
    <div className="dh-stars">{stars.map((_, index) => <span key={index} style={{left: `${4 + (index * 43) % 91}%`, top: `${7 + (index * 31) % 78}%`}} />)}</div>
    <SceneObject feed={feed} />
    {canShowContainment && !liveOpen && <button className={`dh-api-system-preview ${feed.thumbnail ? "api-preview-ready" : ""} ${modelOpen ? "is-resolving" : ""}`} style={feed.thumbnail ? {"--api-preview-url": `url("${feed.thumbnail}")`} : undefined} onClick={onOpenModel}>
      <span>{modelOpen || loading ? "Resolving provider model" : "Paused contained model"}</span><b>{feed.title}</b><em className="dh-open-containment">{modelOpen || loading ? "Scanning APIs" : "Activate Model"}</em>
    </button>}
    {liveOpen && hasEmbed && <iframe className="dh-api-frame" title={feed.title} src={pausedEmbedUrl(feed.embedUrl)} allow="fullscreen; xr-spatial-tracking" loading="lazy" allowFullScreen />}
    {liveOpen && !hasEmbed && hasModel && modelReady && <model-viewer className="dh-model is-ready" src={feed.modelUrl} poster={feed.thumbnail || ""} camera-controls camera-orbit={stage.orbit} exposure="1.1" shadow-intensity=".65" />}
    {canShowContainment && modelOpen && <div className="dh-contained-guide">
      <span>{guideText}</span>
      <button type="button" onClick={onNext}>Next</button>
      <button type="button" onClick={onPlayMore}>Play More</button>
    </div>}
    {canShowContainment && modelOpen && <div className="dh-followup-notes">
      <div><b>Suggested Follow-Up</b></div>
      {followUps.map((item) => <span key={item}>{item}</span>)}
    </div>}
    {isStats && <div className="dh-stat-model"><b>{feed.title}</b><span>{feed.market?.symbol || feed.providerMix?.join(" + ") || "data"}</span><p>{feed.note}</p></div>}
    <div className="dh-orbit" />
    <div className="dh-orbit-two" />
    <div className="dh-sweep" />
    <div className="dh-skyline">{skyline.map((_, index) => <span key={index} style={{height: `${26 + ((index * 19) % 64)}%`}} />)}</div>
    {(layer === "Grid" || layer === "Coordinates") && <div className="dh-visual-grid" />}
    <div className="dh-core-glow" />
    <div className="dh-visual-label">{feed.category}</div>
    <div className="dh-model-status ready">{loading ? "API resolving" : stage.label}</div>
  </div>
}

export default function FullscreenObservatoryV2(){
  const [category, setCategory] = useState("Real Estate")
  const [feeds, setFeeds] = useState(() => seedFeeds("Real Estate"))
  const [statsFeeds, setStatsFeeds] = useState([])
  const [active, setActive] = useState(0)
  const [query, setQuery] = useState("modern house real estate 3d")
  const [mode, setMode] = useState("regular")
  const [tour, setTour] = useState(toursFor("Real Estate")[0].id)
  const [stageIndex, setStageIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [tier, setTier] = useState(() => readStorage("digitalhut:tier", "guest"))
  const [username, setUsername] = useState(() => readStorage("digitalhut:username", ""))
  const [entryOpen, setEntryOpen] = useState(() => !hasFreshEntry())
  const [entryLoading, setEntryLoading] = useState(false)
  const [awake, setAwake] = useState(true)
  const [playing, setPlaying] = useState(true)
  const [layer, setLayer] = useState("Base")
  const [layerOpen, setLayerOpen] = useState(false)
  const [modelOpen, setModelOpen] = useState(false)
  const [guideDepth, setGuideDepth] = useState(0)
  const [aiOpen, setAiOpen] = useState(false)
  const [aiListening, setAiListening] = useState(false)
  const [aiCommand, setAiCommand] = useState("")
  const [notesOpen, setNotesOpen] = useState(false)
  const [smartNote, setSmartNote] = useState("")
  const [downloadUrl, setDownloadUrl] = useState("")
  const [noteFormat, setNoteFormat] = useState({font: "Arial", size: "14", spacing: "1.45", color: "#0f172a"})
  const hideTimer = useRef(null)
  const requestRef = useRef(0)
  const recognitionRef = useRef(null)

  const activeTours = toursFor(category)
  const activeTour = activeTours.find((item) => item.id === tour) || activeTours[0]
  const stage = stages[stageIndex]
  const feed = feeds[active] || feeds[0] || seedFeeds(category)[0]
  const similarFeed = feeds[(active + 1) % Math.max(feeds.length, 1)] || feed
  const statsFeed = statsFeeds[0] || createStatsFeed(feed, category, activeTour)
  const sceneFeed = stage.kind === "similar" ? similarFeed : stage.kind === "stats" ? statsFeed : feed
  const paid = ["premium", "pro"].includes(tier)
  const guided = mode === "premium" && playing
  const currentGuideLine = guideDepth > 0 ? extendedGuideLine({category, stage, feed: sceneFeed, tour: activeTour, depth: guideDepth - 1}) : guideLine({category, stage, feed: sceneFeed, tour: activeTour})
  const currentFollowUps = followUpNotes({category, stage, feed: sceneFeed, tour: activeTour})
  const aiDock = notesOpen ? "notes" : aiOpen ? "command" : modelOpen ? `stage-${stage.kind}` : guided ? "guided" : "idle"

  useEffect(() => {
    window.digitalHutBrainMap = digitalHutBrainMap
  }, [])

  useEffect(() => {
    const record = observatoryRecord({category, stage, sceneFeed, mode, tier, loading})
    window.digitalHutObservatoryRecord = record
    document.title = `DigitalHut Observatory - ${record.category} - ${record.title}`
    let meta = document.querySelector('meta[name="description"]')
    if(!meta){
      meta = document.createElement("meta")
      meta.setAttribute("name", "description")
      document.head.appendChild(meta)
    }
    meta.setAttribute("content", `Real observatory activity: ${record.category} ${record.stage}. ${record.title}. Status: ${record.status}.`)
  }, [category, stage.label, sceneFeed.id, sceneFeed.title, sceneFeed.apiStatus, sceneFeed.apiSource, mode, tier, loading])

  useEffect(() => {
    const urls = [
      ...seedFeeds(category).map((item) => item.thumbnail),
      ...toursFor(category).map((_, index) => stockUrl(category, index))
    ]
    preloadImages(urls)
  }, [category])

  useEffect(() => {
    if(!guided || entryOpen || !modelOpen) return
    const timer = window.setInterval(() => {
      setStageIndex((current) => (current + 1) % stages.length)
    }, stage.kind === "stats" ? 26000 : 18000)
    return () => window.clearInterval(timer)
  }, [guided, entryOpen, stage.kind, modelOpen])

  useEffect(() => {
    if(!guided || stage.kind !== "stats") return
    loadStatsModel()
  }, [guided, stage.kind, category, active, tour])

  function wake(){
    setAwake(true)
    window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => setAwake(false), 2800)
  }

  async function loadFeeds(nextCategory, term, options = {}){
    const id = requestRef.current + 1
    requestRef.current = id
    const seeds = seedFeeds(nextCategory)
    setLoading(true)
    setActive(0)
    if(!options.keepOpen) setModelOpen(false)
    setGuideDepth(0)
    await preloadImages(seeds.map((item) => item.thumbnail))
    if(requestRef.current !== id) return seeds
    setFeeds(seeds)
    const results = await resolveApiFeeds(nextCategory, term)
    if(requestRef.current !== id) return seeds
    const next = results.length ? results : seeds
    await preloadImages(next.map((item) => item.thumbnail))
    if(requestRef.current !== id) return next
    window.requestAnimationFrame(() => {
      setFeeds(next)
      setLoading(false)
    })
    if(!options.silent) speak(`${results.length ? "Live provider models connected" : "API preview mode"}. ${next[0]?.title || nextCategory}.`)
    return next
  }

  async function loadStatsModel(){
    const results = await resolveApiFeeds(category, `${category} statistics data visualization 3d ${feed.query || feed.title}`)
    setStatsFeeds(results.length ? results.map((item) => ({...item, icon: "ST", apiStatus: "statistics"})) : [])
  }

  function enter(nextTier){
    setTier(nextTier)
    setEntryLoading(true)
    playLoaderTone()
    window.setTimeout(() => {
      window.localStorage.setItem("digitalhut:lastAccountEntry", String(Date.now()))
      window.localStorage.setItem("digitalhut:tier", nextTier)
      window.localStorage.setItem("digitalhut:username", username || "Guest")
      setEntryLoading(false)
      setEntryOpen(false)
      wake()
    }, 120)
  }

  function selectCategory(nextCategory){
    setCategory(nextCategory)
    setTour(toursFor(nextCategory)[0].id)
    setStageIndex(0)
    setStatsFeeds([])
    setModelOpen(false)
    setGuideDepth(0)
    const seed = seedFeeds(nextCategory)[0]
    setQuery(seed.query)
    loadFeeds(nextCategory, seed.query, {silent: true})
    speak(`DigitalHut set to ${nextCategory}. I will hold the model first.`)
    wake()
  }

  async function openContainedModel(){
    announceOpen3dModel(sceneFeed)
    setModelOpen(true)
    wake()
    if(sceneFeed.embedUrl || sceneFeed.modelUrl || loading) return
    await loadFeeds(category, sceneFeed.query || query, {silent: true, keepOpen: true})
    setModelOpen(true)
  }

  async function chooseTour(item){
    setTour(item.id)
    setMode("premium")
    setStageIndex(0)
    setPlaying(true)
    announceOpen3dModel(sceneFeed)
    setModelOpen(true)
    setGuideDepth(0)
    if(!sceneFeed.embedUrl && !sceneFeed.modelUrl && !loading) {
      loadFeeds(category, sceneFeed.query || query, {silent: true, keepOpen: true}).then(() => setModelOpen(true))
    }
    window.setTimeout(() => speak(guideLine({category, stage: stages[0], feed: sceneFeed, tour: item})), 2600)
    wake()
  }

  function chooseFeed(item){
    const index = feeds.findIndex((candidate) => candidate.id === item.id)
    if(index >= 0) setActive(index)
    setQuery(item.query || item.title)
    setStageIndex(0)
    setModelOpen(false)
    setGuideDepth(0)
    speak(`Loaded ${item.title}. Containment is paused until you open it.`)
    wake()
  }

  async function runSearch(){
    setPlaying(true)
    setStageIndex(0)
    setModelOpen(false)
    setGuideDepth(0)
    const next = await loadFeeds(category, query)
    const first = next[0] || feed
    if(mode === "premium") speak(`Premium guide ready for ${first.title}. Open the contained model when ready.`)
    else speak(`Regular API feed loading ${first.title}.`)
    wake()
  }

  function nextStage(){
    setStageIndex((current) => (current + 1) % stages.length)
    setGuideDepth(0)
    const next = stages[(stageIndex + 1) % stages.length]
    speak(guideLine({category, stage: next, feed: sceneFeed, tour: activeTour}))
    wake()
  }

  function playMore(){
    setModelOpen(true)
    setPlaying(false)
    if(guideDepth >= 2 && feeds.length > 1){
      setActive((current) => (current + 1) % feeds.length)
      setStageIndex(2)
      setGuideDepth(0)
      speak(`Loading a related model for the presentation. I will compare it slowly before saying more.`)
    } else {
      const nextDepth = guideDepth + 1
      setGuideDepth(nextDepth)
      speak(extendedGuideLine({category, stage, feed: sceneFeed, tour: activeTour, depth: nextDepth - 1}))
    }
    wake()
  }

  function lastFindRecord(note = smartNote){
    const modelLink = sceneFeed.modelUrl || sceneFeed.viewerUrl || sceneFeed.embedUrl || ""
    const text = note || `${sceneFeed.title}: ${currentGuideLine}\n\nFollow-up:\n- ${currentFollowUps.join("\n- ")}`
    return {
      createdAt: new Date().toISOString(),
      category,
      stage: stage.label,
      title: sceneFeed.title,
      note: text,
      modelLink,
      software: {
        app: "DigitalHut Observatory",
        renderer: sceneFeed.embedUrl ? "Sketchfab embed" : sceneFeed.modelUrl ? "model-viewer GLB" : "stock/API preview",
        provider: sceneFeed.apiSource || sceneFeed.apiStatus || "observatory feed",
        supportedActions: ["view", "rotate", "guided tour", "save note", "share", "download record", "open model link"]
      },
      followUps: currentFollowUps
    }
  }

  async function saveSmartNote(note = smartNote){
    const baseRecord = lastFindRecord(note)
    const text = baseRecord.note
    const record = {
      ...lastFindRecord(text),
      noteFormat
    }
    const blob = new Blob([JSON.stringify(record, null, 2)], {type: "application/json"})
    const url = URL.createObjectURL(blob)
    setDownloadUrl(url)
    setSmartNote(text)
    window.localStorage.setItem("digitalhut:lastRecordedFind", JSON.stringify(record))
    return url
  }

  async function runAiCommand(command){
    const text = command.trim()
    if(!text) return
    setAiCommand(text)
    setAiOpen(true)
    wake()
    const lower = text.toLowerCase()
    const nextCategory = categoryFromCommand(text)
    const nextQuery = queryFromCommand(text, query)
    if(lower.includes("preview next") || lower.includes("next model") || lower.includes("show me next")){
      setActive((current) => (current + 1) % feeds.length)
      setStageIndex(2)
      setModelOpen(true)
      setGuideDepth(0)
      speak("Previewing the next related model. I will hold here so you can take notes.")
      return
    }
    if(lower.includes("guided") || lower.includes("tour")){
      chooseTour(activeTour)
      return
    }
    if(lower.includes("rotate") || lower.includes("camera")){
      nextStage()
      speak("Rotating the camera a little more for detail analysis.")
      return
    }
    if(lower.includes("tell me more") || lower.includes("history") || lower.includes("experience") || lower.includes("facts")){
      playMore()
      return
    }
    if(lower.includes("download glb") || lower.includes("download model")){
      const target = sceneFeed.modelUrl || sceneFeed.viewerUrl || sceneFeed.embedUrl || ""
      setNotesOpen(true)
      await saveSmartNote()
      if(target) window.open(target, "_blank")
      else speak("I saved the find. This feed does not expose a direct GLB link yet, so I attached the available model record.")
      return
    }
    if(lower.includes("save my last recorded find") || lower.includes("save last recorded find") || lower.includes("download note")){
      setNotesOpen(true)
      await saveSmartNote()
      return
    }
    if(isNoteCommand(text)){
      setSmartNote((current) => [current, text].filter(Boolean).join("\n"))
      setNotesOpen(true)
      return
    }
    if(shouldTreatAsSearch(text)){
      const targetCategory = nextCategory || category
      setCategory(targetCategory)
      setTour(toursFor(targetCategory)[0].id)
      setStageIndex(0)
      setStatsFeeds([])
      setGuideDepth(0)
      setModelOpen(true)
      setQuery(nextQuery)
      announceOpen3dModel({title: nextQuery})
      const next = await loadFeeds(targetCategory, nextQuery, {silent: true, keepOpen: true})
      const loaded = next[0] || sceneFeed
      setModelOpen(true)
      speak(topicInsight({category: targetCategory, query: nextQuery, feed: loaded, stage}))
    }
  }

  function startVoiceCommand(){
    const Engine = speechEngine()
    setAiOpen(true)
    if(!Engine){
      speak("Voice input is not available in this browser. Type your command instead.")
      return
    }
    const recognition = new Engine()
    recognition.lang = "en-US"
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onstart = () => setAiListening(true)
    recognition.onend = () => setAiListening(false)
    recognition.onerror = () => {
      setAiListening(false)
      speak("I could not hear that. You can type the command instead.")
    }
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || ""
      setAiCommand(transcript)
      runAiCommand(transcript)
    }
    recognitionRef.current = recognition
    recognition.start()
  }

  function action(label){
    const target = sceneFeed.modelUrl || sceneFeed.embedUrl || sceneFeed.viewerUrl || ""
    if(label === "Save") window.localStorage.setItem("digitalhut:savedFeed", JSON.stringify(sceneFeed))
    if(label === "Share" && navigator.share) navigator.share({title: sceneFeed.title, text: sceneFeed.note, url: sceneFeed.viewerUrl || window.location.href}).catch(() => null)
    if(label === "Embed" && navigator.clipboard) navigator.clipboard.writeText(sceneFeed.embedUrl ? `<iframe src="${sceneFeed.embedUrl}"></iframe>` : window.location.href).catch(() => null)
    if(label === "Download") target && paid ? window.open(target, "_blank") : setEntryOpen(true)
    if(label === "Related") setActive((current) => (current + 1) % feeds.length)
    if(label === "FAQ") window.location.href = "/faq"
    wake()
  }

  return <main className={`dh-observatory ${loading ? "is-loading" : "is-ready"} ${entryOpen ? "entry-open" : "entry-complete"}`} data-main-frame={digitalHutBrainMap.mainFrame} data-observatory-category={category} data-observatory-status={loading ? "verifying" : sceneFeed.apiStatus || "ready"} data-physical-assets="sensitive" onPointerMove={wake} onPointerDown={wake}>
    <section className="dh-stage">
      <RendererVisual feed={sceneFeed} stage={stage} guided={guided} loading={loading} layer={layer} renderLive={!entryOpen} modelOpen={modelOpen} onOpenModel={openContainedModel} onNext={nextStage} onPlayMore={playMore} guideText={currentGuideLine} followUps={currentFollowUps} />
      <div className="dh-vignette" />
      {layer === "Architect" && <div className="dh-architect"><b>Architect Layer</b><span>builders / developers / researchers / AIs / experimental</span></div>}

      <div className="dh-top" style={{opacity: awake ? 1 : 0.08}}>
        <div className="dh-search">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search observatory APIs..." />
          <button className={`dh-btn mode ${mode === "regular" ? "active" : ""}`} onClick={() => setMode("regular")}>Regular API</button>
          <button className={`dh-btn mode ${mode === "premium" ? "active" : ""}`} onClick={() => setMode("premium")}>Premium Tour</button>
          <button className="dh-btn hot" onClick={runSearch}>Search</button>
          <button className="dh-btn hot" onClick={() => speak(`${category} ${activeTour.id}. ${activeTour.prompt}`)}>Voice</button>
        </div>
        <button className="dh-btn dh-account" onClick={() => setEntryOpen(true)}>{username || "Choose account"} / {tier}</button>
      </div>

      <div className="dh-category-dock" style={{opacity: awake ? 1 : 0.18}}>
        {categories.map((item, index) => <button key={item.id} className={`dh-category-card ${item.id === category ? "active" : ""}`} style={{"--accent": item.accent}} onClick={() => selectCategory(item.id)}>
          <span className="dh-category-icon"><img src={stockUrl(item.id, index)} alt="" loading="lazy" /><i /></span><small>{item.id}</small>
        </button>)}
      </div>

      <aside className="dh-quick-rail" style={{opacity: awake ? 1 : 0.2}}>
        <div className="dh-quick-section">
          <div className="dh-rail-head"><span>{category} Tour</span><b>{stage.label}</b></div>
          <div className="dh-tour-grid">{activeTours.map((item, index) => <button key={item.id} className={`dh-btn dh-tour-card ${item.id === tour ? "active" : ""}`} onClick={() => chooseTour(item)}>
            <TourVisual item={item} active={item.id === tour} accent={sceneFeed.accent} image={stockUrl(category, index)} /><small>{item.id}</small>
          </button>)}</div>
        </div>
        <div className="dh-quick-section">
          <div className="dh-rail-head"><span>Regular Feed</span><b>{loading ? "API" : category}</b></div>
          <div className="dh-feed-grid">{feeds.slice(0, 4).map((item) => <button key={item.id} className={`dh-feed-card ${item.id === feed.id ? "active" : ""}`} onClick={() => chooseFeed(item)}>
            <MiniVisual feed={item} active={item.id === feed.id} /><div className="dh-card-text"><b>{item.title}</b><small>{item.apiSource || item.category}</small></div>
          </button>)}</div>
        </div>
      </aside>

      <div className="dh-info" style={{opacity: awake ? 1 : 0.16}}>
        <p className="dh-eyebrow">Guided Sequence</p>
        <h1 className="dh-title">{sceneFeed.title}</h1>
        <p className="dh-note">{mode === "premium" ? `${stage.label}: ${activeTour.prompt} ` : "Regular API feed. "}{sceneFeed.note}</p>
        <div className="dh-stage-strip">{stages.map((item, index) => <button key={item.id} className={`dh-stage-pill ${index === stageIndex ? "active" : ""}`} onClick={() => setStageIndex(index)}>{item.label}</button>)}</div>
        <div className="dh-state-badges"><span>{category}</span><span>{mode}</span><span>{sceneFeed.apiStatus || "api"}</span><span>{activeTour.icon}</span></div>
      </div>

      <div className="dh-media" style={{opacity: awake ? 1 : 0.12}}>
        <button className="dh-btn" onClick={() => setPlaying((value) => !value)}>{playing ? "Pause" : "Resume"}</button>
        <button className="dh-btn" onClick={() => setActive((value) => (value - 1 + feeds.length) % feeds.length)}>Back 10s</button>
        <button className="dh-btn" onClick={() => setActive((value) => (value + 1) % feeds.length)}>Forward 10s</button>
        <button className="dh-btn" onClick={nextStage}>Next Stage</button>
      </div>

      <div className="dh-utility" style={{opacity: awake ? 1 : 0.1}}>{["Save", "Share", "Embed", "Download", "Related", "FAQ"].map((label) => <button key={label} className="dh-btn" onClick={() => action(label)}>{label}</button>)}</div>

      <div className="dh-layer-dock" style={{opacity: awake ? 1 : 0.12}}>
        <button className={`dh-btn ${paid ? "" : "locked"}`} onClick={() => paid ? setLayerOpen((value) => !value) : setEntryOpen(true)}>{paid ? `Smart Layers: ${layer}` : "Smart Layers: Premium / Pro"}</button>
        {layerOpen && paid && <div className="dh-layer-menu">{layers.map((item) => <button key={item} className={`dh-btn ${item === layer ? "active" : ""}`} onClick={() => {setLayer(item); setLayerOpen(false)}}>{item}</button>)}</div>}
      </div>

      <button className={`dh-ai-space ${aiListening ? "listening" : ""} dock-${aiDock}`} type="button" onClick={startVoiceCommand}>
        <span>DigitalHut AI</span><b>{aiListening ? "Listening" : "Interact"}</b>
      </button>
      {aiOpen && <div className="dh-ai-command">
        <div><b>DigitalHut AI</b><button type="button" onClick={() => setAiOpen(false)}>Close</button></div>
        <input value={aiCommand} onChange={(event) => setAiCommand(event.target.value)} onKeyDown={(event) => {if(event.key === "Enter") runAiCommand(aiCommand)}} placeholder="Ask: Canada, Saturn, funny cat video, NC real estate, rotate, tell me more" />
        <div className="dh-ai-actions">
          <button type="button" onClick={() => runAiCommand(aiCommand)}>Run</button>
          <button type="button" onClick={startVoiceCommand}>{aiListening ? "Listening" : "Voice"}</button>
          <button type="button" onClick={() => setNotesOpen((value) => !value)}>Smart Notes</button>
        </div>
      </div>}

      {notesOpen && <div className="dh-smart-notes">
        <div><b>Smart Note / Chat Record</b><button type="button" onClick={() => setNotesOpen(false)}>Close</button></div>
        <div className="dh-note-tools">
          <select value={noteFormat.font} onChange={(event) => setNoteFormat((current) => ({...current, font: event.target.value}))}><option>Arial</option><option>Georgia</option><option>Courier New</option></select>
          <select value={noteFormat.size} onChange={(event) => setNoteFormat((current) => ({...current, size: event.target.value}))}><option value="13">13</option><option value="14">14</option><option value="16">16</option><option value="18">18</option></select>
          <select value={noteFormat.spacing} onChange={(event) => setNoteFormat((current) => ({...current, spacing: event.target.value}))}><option value="1.25">Tight</option><option value="1.45">Normal</option><option value="1.7">Open</option></select>
          <input type="color" value={noteFormat.color} onChange={(event) => setNoteFormat((current) => ({...current, color: event.target.value}))} />
          <button type="button" onClick={() => setSmartNote((current) => `${current}\n- `)}>Bullets</button>
        </div>
        <textarea style={{fontFamily: noteFormat.font, fontSize: `${noteFormat.size}px`, lineHeight: noteFormat.spacing, color: noteFormat.color}} value={smartNote} onChange={(event) => setSmartNote(event.target.value)} placeholder="Your research notes stay here until you explicitly save or download them." />
        <div className="dh-note-attachment"><b>Attached Model</b><span>{sceneFeed.title}</span><small>{sceneFeed.modelUrl || sceneFeed.viewerUrl || sceneFeed.embedUrl || "Provider model link not exposed yet"}</small></div>
        <div className="dh-ai-actions">
          <button type="button" onClick={() => saveSmartNote()}>Save Last Find</button>
          <button type="button" onClick={() => navigator.share?.({title: sceneFeed.title, text: smartNote || currentGuideLine}).catch(() => null)}>Share</button>
          {(sceneFeed.modelUrl || sceneFeed.viewerUrl || sceneFeed.embedUrl) && <a href={sceneFeed.modelUrl || sceneFeed.viewerUrl || sceneFeed.embedUrl} target="_blank" rel="noreferrer">Open Model Link</a>}
          {downloadUrl && <a href={downloadUrl} download={`digitalhut-${category}-${Date.now()}.json`}>Download</a>}
        </div>
      </div>}
    </section>

    {entryOpen && <section className="dh-entry"><div className="dh-entry-panel">{entryLoading ? <><div className="dh-logo">DigitalHut</div><div className="dh-load"><span /></div><p>Loading your observatory system</p></> : <><p className="dh-eyebrow">Choose profile</p><h2 className="dh-welcome">Welcome!</h2><input className="dh-entry-input" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Username Account" /><div className="dh-account-grid">{accounts.map((item) => <button key={item} className={`dh-btn ${tier === item ? "active" : ""}`} onClick={() => enter(item)}>{item.toUpperCase()}</button>)}</div><div className="dh-wallet"><ConnectButton /></div><p className="dh-entry-small">Premium starts guided model sequences. Regular users can still search and inspect API feeds.</p></>}</div></section>}
  </main>
}
