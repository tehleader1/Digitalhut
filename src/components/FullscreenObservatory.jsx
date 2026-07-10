import React, {useEffect, useRef, useState} from "react"
import {ConnectButton} from "../wallet"
import {loadModelViewer} from "../lib/modelViewerRuntime"
import "./FullscreenObservatory.css"
import "./FullscreenObservatory.api.css"

const INACTIVITY_MS = 8 * 60 * 1000
const layers = ["Base", "Architect", "Lighting", "Props", "Grid", "Coordinates"]
const accounts = ["guest", "standard", "premium", "pro"]

const stockImages = {
  "Continent": ["photo-1500530855697-b586d89ba3ee", "photo-1486406146926-c627a92ad1ab", "photo-1518005020951-eccb494ad742", "photo-1493246507139-91e8fad9978e"],
  "Planetary": ["photo-1446776811953-b23d57bd21aa", "photo-1454789548928-9efd52dc4031", "photo-1462331940025-496dfbfc7564", "photo-1419242902214-272b3f66ee7a"],
  "Gamer": ["photo-1542751371-adc38448a05e", "photo-1511512578047-dfb367046420", "photo-1550745165-9bc0b252726f", "photo-1493711662062-fa541adb3fc8"],
  "Real Estate": ["photo-1560518883-ce09059eeffa", "photo-1600585154340-be6161a56a0c", "photo-1484154218962-a197022b5858", "photo-1600607687939-ce8a6c25118c"],
  "Workforce": ["photo-1504307651254-35680f356dfd", "photo-1517048676732-d65bc937f952", "photo-1521791136064-7986c2920216", "photo-1581092918056-0c4c3acd3789"],
  "Home Project": ["photo-1513694203232-719a280e022f", "photo-1600585154526-990dced4db0d", "photo-1586023492125-27b2c045efd7", "photo-1505693416388-ac5ce068fe85"],
  "Political": ["photo-1529107386315-e1a2ed48a620", "photo-1464692805480-a69dfaafdb0d", "photo-1523292562811-8fa7962a78c8", "photo-1500534314209-a25ddb2bd429"],
  "Programmer": ["photo-1515879218367-8466d910aaa4", "photo-1555066931-4365d14bab8c", "photo-1516321318423-f06f85e504b3", "photo-1558494949-ef010cbdcc31"],
  "Researcher": ["photo-1532094349884-543bc11b234d", "photo-1507413245164-6160d8298b31", "photo-1581093588401-fbb62a02f120", "photo-1451187580459-43490279c0fa"]
}

function stockUrl(category, index = 0){
  const pool = stockImages[category] || stockImages.Continent
  const id = pool[index % pool.length]
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=82`
}

const categories = [
  {id: "Continent", icon: "CO", accent: "#67e8f9", context: "global terrain, travel, culture, and education"},
  {id: "Planetary", icon: "PL", accent: "#a78bfa", context: "space, science, orbit, and planetary research"},
  {id: "Gamer", icon: "GM", accent: "#22c55e", context: "interactive worlds, character movement, and gameplay prototypes"},
  {id: "Real Estate", icon: "RE", accent: "#2dd4bf", context: "property, city blocks, structures, and development scouting"},
  {id: "Workforce", icon: "WF", accent: "#fb7185", context: "jobsites, training, operations, and safety walkthroughs"},
  {id: "Home Project", icon: "HP", accent: "#facc15", context: "personal builds, interiors, repairs, and home planning"},
  {id: "Political", icon: "PO", accent: "#f97316", context: "civic geography, public works, maps, and policy spaces"},
  {id: "Programmer", icon: "PR", accent: "#38bdf8", context: "developer inspection, APIs, agents, and prototype logic"},
  {id: "Researcher", icon: "RS", accent: "#c084fc", context: "research notes, evidence review, archives, and AI analysis"}
]

const feedBank = {
  "Continent": [
    ["Cape Town South Africa", "Global civic terrain and coastline study.", "cape town south africa 3d city terrain"],
    ["Caribbean Colonial Zone", "History, tourism, and public cultural exploration.", "caribbean colonial zone historic 3d"],
    ["California Hollywood", "Culture, tourism, and city landmark context.", "hollywood sign los angeles 3d landmark"],
    ["European Buildings", "Architecture and old-city structure set.", "european buildings old city architecture 3d"]
  ],
  "Planetary": [
    ["International Space Station", "Orbital research feed for space and engineering.", "international space station 3d model"],
    ["Moon Observatory", "Planetary science and lunar study mode.", "moon surface observatory 3d"],
    ["Europe Heightmap", "Large terrain review for planetary-style elevation.", "europe heightmap terrain 3d"],
    ["Orbital City Grid", "Synthetic orbit and infrastructure planner.", "orbital city grid 3d"]
  ],
  "Gamer": [
    ["City Pack Prototype", "Game-ready city block and navigation prototype.", "game city pack prototype 3d"],
    ["Animated Environment", "Playable scene and environment tour context.", "animated environment game scene 3d"],
    ["Mission Hub", "Prototype hub for characters, quests, and props.", "mission hub game prototype 3d"],
    ["Orbit Arena", "Synthetic arena flow for gameplay testing.", "orbit arena game 3d"]
  ],
  "Real Estate": [
    ["Surfside Florida", "Beachfront property, terrain, and climate inspection.", "surfside florida beachfront properties 3d"],
    ["Wall Street New York", "Financial district, city structure, and market context.", "wall street new york financial district 3d"],
    ["Morgantown West Virginia", "Residential terrain and local development scan.", "morgantown west virginia residential terrain 3d"],
    ["Vancouver Canada", "Urban development and civic context.", "vancouver canada downtown eastside 3d"]
  ],
  "Workforce": [
    ["Training Yard", "Operations, workforce routing, and team walk-through.", "workforce training yard 3d"],
    ["Jobsite Structure", "Inspection, safety, and workflow planning.", "construction jobsite structure 3d"],
    ["Civic Operations", "Public service logistics and infrastructure mode.", "civic operations city infrastructure 3d"],
    ["Coastal Response", "Weather, access, and emergency planning.", "coastal response emergency planning 3d"]
  ],
  "Home Project": [
    ["Home Build Sketch", "Personal project, room flow, and repair planning.", "home build sketch 3d"],
    ["Neighborhood Context", "Home area, local terrain, and property context.", "neighborhood context home terrain 3d"],
    ["Interior Props", "Props, furniture, and home concept testing.", "interior props home project 3d"],
    ["Coastal Home", "Beachfront home and environmental review.", "coastal home beachfront 3d"]
  ],
  "Political": [
    ["Civic District", "Public works, governance, and city policy context.", "civic district public works 3d"],
    ["Global Region", "Maps, boundaries, and public planning review.", "global region political map 3d"],
    ["Historical Zone", "Culture, tourism, and public memory space.", "historical zone public memory 3d"],
    ["Infrastructure View", "Civic assets and transport context.", "infrastructure civic assets 3d"]
  ],
  "Programmer": [
    ["Developer Scene", "Prototype scene for APIs, agents, and runtime logic.", "developer scene api prototype 3d"],
    ["Renderer Stress Test", "GLB load state, layers, and camera behavior.", "renderer stress test 3d model"],
    ["Data Twin", "Structured city data and observatory state testing.", "city data twin 3d"],
    ["Tool Builder", "Developer inspection and extension planning.", "tool builder 3d interface"]
  ],
  "Researcher": [
    ["Research Archive", "Evidence review, source context, and annotation mode.", "research archive 3d visualization"],
    ["Scientific Orbit", "Researcher lens for space and engineering details.", "scientific orbit research 3d"],
    ["Field Study", "Terrain, site notes, and comparative observation.", "field study terrain 3d"],
    ["AI Analysis Room", "Researcher plus AI review for experimental insight.", "ai analysis room 3d"]
  ]
}

const categoryGuidedTours = {
  "Continent": [
    {id: "Terrain", icon: "TR", prompt: "Guide the terrain first: elevation, coastline, road flow, neighborhoods, and what the visitor can learn by orbiting the scene."},
    {id: "Culture", icon: "CU", prompt: "Narrate the cultural layer: landmarks, public spaces, historical signals, tourism value, and education use cases."},
    {id: "Route", icon: "RT", prompt: "Move like a travel and logistics scout: entry points, walkable paths, nearby context, and how the place connects to the larger region."},
    {id: "Compare", icon: "CP", prompt: "Compare this region against similar global places and explain why the feed matters inside the Observatory."}
  ],
  "Planetary": [
    {id: "Orbit", icon: "OR", prompt: "Start from orbit: scale, trajectory, lighting, station keeping, and planetary perspective."},
    {id: "Surface", icon: "SF", prompt: "Drop into surface inspection: terrain shape, research targets, hazards, and science questions."},
    {id: "Mission", icon: "MS", prompt: "Narrate like a mission controller: objective, asset purpose, constraints, and next observation point."},
    {id: "Research", icon: "RS", prompt: "Use a researcher lens: evidence, data gaps, open questions, and why this object deserves more study."}
  ],
  "Gamer": [
    {id: "Spawn", icon: "SP", prompt: "Introduce the playable spawn: sightlines, movement paths, objectives, cover, scale, and first player decision."},
    {id: "Mechanics", icon: "MC", prompt: "Explain possible mechanics: interaction zones, loops, hazards, rewards, physics, and animation opportunities."},
    {id: "Assets", icon: "AS", prompt: "Inspect the asset pack: modular pieces, reuse value, performance risk, and prototype readiness."},
    {id: "Quest", icon: "QS", prompt: "Turn the scene into a quest pitch with route, goal, tension, and discovery moments."}
  ],
  "Real Estate": [
    {id: "Property", icon: "PR", prompt: "Tour like a property scout: location, access, structure, terrain, nearby value, and development potential."},
    {id: "Block", icon: "BK", prompt: "Read the block: roads, neighbors, foot traffic, zoning feel, and real-world demand signals."},
    {id: "Risk", icon: "RK", prompt: "Call out risk: weather, slope, infrastructure, liquidity, maintenance, and inspection questions."},
    {id: "Market", icon: "MK", prompt: "Blend market context with the 3D site: financial district signals, trend pressure, and premium-user decision points."}
  ],
  "Workforce": [
    {id: "Safety", icon: "SF", prompt: "Guide a safety walk: access, hazard zones, traffic flow, staging areas, and worker awareness."},
    {id: "Training", icon: "TR", prompt: "Narrate as a training module: what a new worker should notice first, second, and before leaving the scene."},
    {id: "Ops", icon: "OP", prompt: "Explain operations: routing, resource placement, crew movement, bottlenecks, and handoff points."},
    {id: "Audit", icon: "AU", prompt: "Audit the jobsite like a supervisor: what is working, what needs verification, and what to record."}
  ],
  "Home Project": [
    {id: "Plan", icon: "PL", prompt: "Help the homeowner plan: layout, measurements, needed materials, access, and the next practical step."},
    {id: "Repair", icon: "RP", prompt: "Narrate a repair inspection: likely issue zones, sequence, tools, caution points, and before-after value."},
    {id: "Design", icon: "DS", prompt: "Guide a design pass: style, placement, lighting, props, and how the project should feel when finished."},
    {id: "Budget", icon: "BG", prompt: "Explain cost awareness: scope creep, premium choices, practical substitutions, and what to verify before buying."}
  ],
  "Political": [
    {id: "Civic", icon: "CV", prompt: "Read the civic space: public access, service zones, community value, and governance context."},
    {id: "Policy", icon: "PY", prompt: "Explain policy impact: infrastructure choices, funding visibility, public benefit, and planning tradeoffs."},
    {id: "Public", icon: "PB", prompt: "Narrate for the public: what normal visitors should understand without technical background."},
    {id: "Map", icon: "MP", prompt: "Use map intelligence: boundaries, routes, population pressure, and regional comparison."}
  ],
  "Programmer": [
    {id: "API", icon: "AP", prompt: "Inspect the API layer: provider source, payload shape, fallback state, latency, and what data is driving the renderer."},
    {id: "Runtime", icon: "RT", prompt: "Narrate the runtime: renderer state, user mode, asset load path, wallet state, and what should update next."},
    {id: "Agent", icon: "AG", prompt: "Explain agent opportunities: monitoring, SEO, GLB testing, market overlays, and FireCuda operations."},
    {id: "Debug", icon: "DB", prompt: "Run a builder debug tour: what is live, what is fallback, what is blocked, and how to verify it."}
  ],
  "Researcher": [
    {id: "Evidence", icon: "EV", prompt: "Review evidence: source quality, scene context, uncertainty, and the strongest claim the feed can support."},
    {id: "Sources", icon: "SO", prompt: "Narrate source work: APIs used, missing data, verification path, and what should be cited."},
    {id: "Compare", icon: "CP", prompt: "Compare against similar feeds and explain what changes when the category, market, or map layer changes."},
    {id: "Hypothesis", icon: "HY", prompt: "Build a research hypothesis from the scene, then name the next observation that would confirm or reject it."}
  ]
}

function metaFor(category){
  return categories.find((item) => item.id === category) || categories[0]
}

function toursFor(category){
  return categoryGuidedTours[category] || categoryGuidedTours.Continent
}

function makeFeeds(category){
  const meta = metaFor(category)
  return (feedBank[category] || feedBank.Continent).map(([title, note, query], index) => ({
    id: `seed:${category}:${index}:${title}`,
    title,
    note,
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
  if(value.startsWith("//")) return `https:${value}`
  return value
}

function firstThumbnail(item){
  const images = item?.thumbnails?.images || item?.thumbnail?.images || item?.images || []
  if(Array.isArray(images) && images.length){
    const image = [...images].sort((a, b) => (b.width || 0) - (a.width || 0))[0]
    return cleanUrl(image?.url || image?.src)
  }
  return cleanUrl(item?.thumbnailUrl || item?.thumbnail_url || item?.thumbnail || item?.image || item?.poster || item?.cover)
}

function payloadItems(payload){
  const candidates = [payload?.assets, payload?.results, payload?.items, payload?.models, payload?.feed, payload?.data]
  for(const candidate of candidates){
    if(Array.isArray(candidate)) return candidate
    if(Array.isArray(candidate?.results)) return candidate.results
    if(Array.isArray(candidate?.items)) return candidate.items
  }
  if(payload?.uid || payload?.id || payload?.title || payload?.name) return [payload]
  return []
}

function normalizeAsset(item, category, index, source, term){
  const meta = metaFor(category)
  const uid = item?.uid || item?.modelUid || item?.model_uid || item?.model?.uid || ""
  const embedUrl = cleanUrl(item?.embedUrl || item?.embed_url || item?.viewerEmbedUrl || item?.viewer_embed_url || item?.embed?.url || item?.urls?.embed || (uid ? `https://sketchfab.com/models/${uid}/embed` : ""))
  const modelUrl = cleanUrl(item?.modelUrl || item?.model_url || item?.glbUrl || item?.glb_url || item?.gltfUrl || item?.gltf_url || item?.downloadUrl || item?.download_url)
  const viewerUrl = cleanUrl(item?.viewerUrl || item?.viewer_url || item?.url || item?.urls?.viewer || item?.webUrl || item?.web_url)
  const thumbnail = firstThumbnail(item) || stockUrl(category, index)
  const title = item?.title || item?.name || item?.displayName || `${category} API feed ${index + 1}`
  const note = item?.note || item?.description || item?.summary || `Live API result for ${term || category}.`

  return {
    id: `api:${source}:${category}:${uid || index}:${title}`,
    title,
    note,
    query: term || title,
    category,
    icon: meta.icon,
    accent: meta.accent,
    context: meta.context,
    thumbnail,
    embedUrl,
    modelUrl,
    viewerUrl,
    providerMix: item?.providerMix || item?.providers || [source],
    apiSource: item?.apiSource || source,
    apiStatus: item?.apiStatus || (embedUrl || modelUrl || thumbnail ? "connected" : "metadata")
  }
}

async function fetchWithTimeout(endpoint, options = {}, timeoutMs = 3600){
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs)
  try{
    return await fetch(endpoint, {...options, signal: controller.signal})
  } finally {
    window.clearTimeout(timeout)
  }
}

async function resolveApiFeeds(category, term){
  if(typeof window === "undefined") return []
  const query = encodeURIComponent(term || category)
  const encodedCategory = encodeURIComponent(category)
  const endpoints = [
    [`observatory-feed`, `/api/observatory-feed?category=${encodedCategory}&query=${query}`],
    [`sketchfab`, `/api/sketchfab?query=${query}&category=${encodedCategory}`],
    [`sketchfab-search`, `/api/search/sketchfab?query=${query}&category=${encodedCategory}`],
    [`observatory`, `/api/observatory?category=${encodedCategory}&query=${query}`]
  ]

  for(const [source, endpoint] of endpoints){
    try{
      const response = await fetchWithTimeout(endpoint, {headers: {Accept: "application/json"}})
      if(!response.ok) continue
      const payload = await response.json()
      const items = payloadItems(payload)
      const feeds = items.map((item, index) => normalizeAsset(item, category, index, source, term)).filter((item) => item.embedUrl || item.modelUrl || item.thumbnail || item.viewerUrl || item.apiStatus)
      if(feeds.length) return feeds.slice(0, 8)
    } catch {
      continue
    }
  }
  return []
}

function freshEntry(){
  if(typeof window === "undefined") return false
  const last = Number(window.localStorage.getItem("digitalhut:lastAccountEntry") || 0)
  return last > 0 && Date.now() - last < INACTIVITY_MS
}

function playLoaderTone(){
  try{
    const Audio = window.AudioContext || window.webkitAudioContext
    if(!Audio) return
    const ctx = new Audio()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.setValueAtTime(146.83, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 1.1)
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.045, ctx.currentTime + 0.18)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.25)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 1.3)
    window.setTimeout(() => ctx.close().catch(() => null), 1500)
  } catch {
    return
  }
}

function speak(text){
  if(typeof window === "undefined" || !("speechSynthesis" in window)) return
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.rate = 0.94
  utter.pitch = 0.92
  window.speechSynthesis.speak(utter)
}

function SceneObject({feed, compact = false}){
  const blocks = compact ? [0, 1, 2, 3] : [0, 1, 2, 3, 4, 5, 6]
  return <div className={`dh-scene-object ${compact ? "compact" : ""}`} style={{"--accent": feed.accent}}>
    <div className="dh-scene-halo" />
    <div className="dh-scene-disc" />
    <div className="dh-scene-blocks">{blocks.map((_, index) => <span key={index} style={{height: `${compact ? 28 + index * 9 : 52 + ((index * 23) % 90)}%`, transform: `translateY(${index % 2 ? 5 : -6}px)`}} />)}</div>
    <div className="dh-scene-base" />
    <div className="dh-scene-code">{feed.icon}</div>
  </div>
}

function TourVisual({item, active, accent}){
  return <div className="dh-tour-visual" style={{"--accent": accent, borderColor: active ? accent : undefined}}>
    <span />
    <span />
    <b>{item.icon}</b>
  </div>
}

function RendererVisual({feed, layer, guided, loading}){
  const [modelReady, setModelReady] = useState(false)
  const modelRef = useRef(null)
  const stars = Array.from({length: 24})
  const skyline = Array.from({length: 18})
  const hasEmbed = Boolean(feed.embedUrl)
  const hasModel = Boolean(feed.modelUrl)
  const hasApi = hasEmbed || hasModel
  const status = loading ? "API resolving" : hasEmbed ? "API viewer active" : modelReady ? "API model active" : hasApi ? "API model loading" : "API preview active"

  useEffect(() => {
    setModelReady(false)
    const model = modelRef.current
    if(!model || !hasModel) return
    const ready = () => setModelReady(true)
    const failed = () => setModelReady(false)
    model.addEventListener("load", ready)
    model.addEventListener("error", failed)
    return () => {
      model.removeEventListener("load", ready)
      model.removeEventListener("error", failed)
    }
  }, [feed.modelUrl, hasModel])

  return <div className={`dh-renderer ${guided ? "guided" : ""} ${hasApi ? "has-api" : ""}`} style={{"--accent": feed.accent}}>
    {feed.thumbnail && <img className="dh-renderer-stock" src={feed.thumbnail} alt="" loading="eager" />}
    <div className="dh-motion-sky" />
    <div className="dh-stars">{stars.map((_, index) => <span key={index} style={{left: `${4 + (index * 43) % 91}%`, top: `${7 + (index * 31) % 78}%`}} />)}</div>
    <SceneObject feed={feed} />
    {hasEmbed && <iframe className="dh-api-frame" title={feed.title} src={feed.embedUrl} allow="autoplay; fullscreen; xr-spatial-tracking" allowFullScreen />}
    {!hasEmbed && hasModel && <model-viewer ref={modelRef} className={modelReady ? "dh-model is-ready" : "dh-model"} src={feed.modelUrl} camera-controls="true" auto-rotate={guided ? "true" : undefined} autoplay="true" shadow-intensity="1" exposure={layer === "Lighting" ? "1.45" : "1"} />}
    <div className="dh-orbit" />
    <div className="dh-orbit-two" />
    <div className="dh-sweep" />
    <div className="dh-skyline">{skyline.map((_, index) => <span key={index} style={{height: `${26 + ((index * 19) % 64)}%`}} />)}</div>
    {(layer === "Grid" || layer === "Coordinates") && <div className="dh-visual-grid" />}
    <div className="dh-core-glow" />
    <div className="dh-visual-label">{feed.category}</div>
    <div className={`dh-model-status ${hasApi || modelReady ? "ready" : ""}`}>{status}</div>
    {loading && <div className="dh-api-loading">Searching live observatory APIs</div>}
  </div>
}

function MiniVisual({feed, active}){
  return <div className={`dh-mini-visual ${feed.thumbnail ? "has-thumb" : ""} ${active ? "active" : ""}`} style={{"--accent": feed.accent, borderColor: active ? feed.accent : undefined}}>
    {feed.thumbnail && <img className="dh-mini-thumb" src={feed.thumbnail} alt="" loading="lazy" />}
    <SceneObject feed={feed} compact />
    <div className="dh-mini-scan" />
  </div>
}

export default function FullscreenObservatory(){
  const [category, setCategory] = useState("Continent")
  const [active, setActive] = useState(0)
  const [query, setQuery] = useState("wall street new york")
  const [searchMode, setSearchMode] = useState("regular")
  const [tour, setTour] = useState(toursFor("Continent")[0].id)
  const [tier, setTier] = useState("guest")
  const [username, setUsername] = useState("")
  const [entryOpen, setEntryOpen] = useState(true)
  const [entryLoading, setEntryLoading] = useState(false)
  const [awake, setAwake] = useState(true)
  const [playing, setPlaying] = useState(true)
  const [layer, setLayer] = useState("Base")
  const [layerOpen, setLayerOpen] = useState(false)
  const [feeds, setFeeds] = useState(() => makeFeeds("Continent"))
  const [apiLoading, setApiLoading] = useState(false)
  const hideTimer = useRef(null)
  const requestRef = useRef(0)

  const activeTours = toursFor(category)
  const activeTour = activeTours.find((item) => item.id === tour) || activeTours[0]
  const categoryFeeds = feeds.length ? feeds : makeFeeds(category)
  const feed = categoryFeeds[active] || categoryFeeds[0]
  const paid = ["premium", "pro"].includes(tier)
  const guided = searchMode === "premium" && playing

  useEffect(() => {
    if(typeof window === "undefined") return
    loadModelViewer()
    setTier(window.localStorage.getItem("digitalhut:tier") || "guest")
    setUsername(window.localStorage.getItem("digitalhut:username") || "")
    setEntryOpen(!freshEntry())
  }, [])

  useEffect(() => {
    loadApiFeeds(category, category, {silent: true})
  }, [category])

  useEffect(() => {
    if(entryOpen || !playing || searchMode !== "premium") return
    const timer = window.setInterval(() => setActive((current) => (current + 1) % categoryFeeds.length), awake ? 12000 : 17000)
    return () => window.clearInterval(timer)
  }, [entryOpen, playing, searchMode, awake, categoryFeeds.length])

  function wake(){
    setAwake(true)
    window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => setAwake(false), 2600)
  }

  async function loadApiFeeds(nextCategory, term, options = {}){
    const id = requestRef.current + 1
    requestRef.current = id
    const seed = makeFeeds(nextCategory)
    setFeeds(seed)
    setActive(0)
    setApiLoading(true)
    const apiResults = await resolveApiFeeds(nextCategory, term)
    if(requestRef.current !== id) return seed
    const nextFeeds = apiResults.length ? apiResults : seed
    setFeeds(nextFeeds)
    setActive(0)
    setApiLoading(false)
    if(!options.silent){
      const mode = apiResults.length ? "Live API feed connected" : "API metadata preview active"
      speak(`${mode}. ${nextFeeds[0]?.title || nextCategory}.`)
    }
    return nextFeeds
  }

  function enter(nextTier = tier){
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
    }, 1150)
  }

  function selectCategory(nextCategory){
    setCategory(nextCategory)
    setTour(toursFor(nextCategory)[0].id)
    const meta = metaFor(nextCategory)
    setQuery(nextCategory)
    setPlaying(true)
    wake()
    speak(`DigitalHut library set to ${nextCategory}. Guided tours now match ${meta.context}.`)
  }

  function chooseFeed(item){
    const index = categoryFeeds.findIndex((candidate) => candidate.id === item.id)
    if(index >= 0) setActive(index)
    setQuery(item.query || item.title)
    wake()
    speak(`${searchMode === "premium" ? "Premium guided tour" : "Regular API feed"}. ${item.title}. ${item.note}`)
  }

  function chooseTour(item){
    setTour(item.id)
    setSearchMode("premium")
    setPlaying(true)
    wake()
    speak(`Premium ${category} guided tour. ${item.id}. ${item.prompt} Current feed: ${feed.title}. ${feed.note}`)
  }

  async function runSearch(){
    setPlaying(true)
    const nextFeeds = await loadApiFeeds(category, query)
    const nextFeed = nextFeeds[0] || feed
    if(searchMode === "premium"){
      speak(`Premium ${category} guided tour started for ${nextFeed.title}. ${activeTour.prompt}`)
    } else {
      speak(`Regular API feed loading ${nextFeed.title}. Displaying provider assets and keeping the renderer ready for exploration.`)
    }
    wake()
  }

  function voice(){
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if(!Recognition) return
    const recorder = new Recognition()
    recorder.onresult = (event) => setQuery(event.results[0][0].transcript)
    recorder.start()
    wake()
  }

  function step(amount){
    setActive((current) => (current + amount + categoryFeeds.length) % categoryFeeds.length)
    wake()
  }

  function action(label){
    const target = feed.modelUrl || feed.embedUrl || feed.viewerUrl || ""
    if(label === "Save") window.localStorage.setItem("digitalhut:savedFeed", JSON.stringify(feed))
    if(label === "Share" && navigator.share) navigator.share({title: feed.title, text: feed.note, url: feed.viewerUrl || window.location.href}).catch(() => null)
    if(label === "Embed" && navigator.clipboard) navigator.clipboard.writeText(feed.embedUrl ? `<iframe src="${feed.embedUrl}"></iframe>` : window.location.href).catch(() => null)
    if(label === "Download") target && paid ? window.open(target, "_blank") : setEntryOpen(true)
    if(label === "Related") setActive((current) => (current + 1) % categoryFeeds.length)
    wake()
  }

  return <main className="dh-observatory" onPointerMove={wake} onPointerDown={wake}>
    <section className="dh-stage">
      <RendererVisual feed={feed} layer={layer} guided={guided} loading={apiLoading} />
      <div className="dh-vignette" />
      {(layer === "Grid" || layer === "Coordinates") && <div className="dh-grid-layer" />}
      {layer === "Architect" && <div className="dh-architect"><b>Architect Layer</b><span>builders / developers / researchers / AIs / experimental</span></div>}
      {layer === "Props" && <div className="dh-props">Props layer active</div>}

      <div className="dh-top" style={{opacity: awake ? 1 : 0.08}}>
        <div className="dh-search">
          <input value={query} onChange={(event) => setQuery(event.target.value)} onFocus={wake} placeholder="Search observatory APIs..." />
          <button className={`dh-btn mode ${searchMode === "regular" ? "active" : ""}`} onClick={() => setSearchMode("regular")}>Regular API</button>
          <button className={`dh-btn mode ${searchMode === "premium" ? "active" : ""}`} onClick={() => setSearchMode("premium")}>Premium Tour</button>
          <button className="dh-btn hot" onClick={runSearch}>Search</button>
          <button className="dh-btn hot" onClick={voice}>Voice</button>
        </div>
        <button className="dh-btn dh-account" onClick={() => setEntryOpen(true)}>{username || "Choose account"} / {tier}</button>
      </div>

      <div className="dh-category-dock" style={{opacity: awake ? 1 : 0.18}}>
        {categories.map((item) => <button key={item.id} className={`dh-category-card ${item.id === category ? "active" : ""}`} style={{"--accent": item.accent}} onClick={() => selectCategory(item.id)}>
          <span className="dh-category-icon">{item.icon}</span>
          <small>{item.id}</small>
        </button>)}
      </div>

      <aside className="dh-quick-rail" style={{opacity: awake ? 1 : 0.2}}>
        <div className="dh-quick-section">
          <div className="dh-rail-head"><span>{category} Tour</span><b>{tour}</b></div>
          <div className="dh-tour-grid">{activeTours.map((item) => <button key={item.id} className={`dh-btn dh-tour-card ${item.id === tour ? "active" : ""}`} onClick={() => chooseTour(item)}>
            <TourVisual item={item} active={item.id === tour} accent={feed.accent} />
            <small>{item.id}</small>
          </button>)}</div>
        </div>
        <div className="dh-quick-section">
          <div className="dh-rail-head"><span>Regular Feed</span><b>{apiLoading ? "API" : category}</b></div>
          <div className="dh-feed-grid">{categoryFeeds.slice(0, 4).map((item) => <button key={item.id} className={`dh-feed-card ${item.id === feed.id ? "active" : ""}`} onClick={() => chooseFeed(item)}>
            <MiniVisual feed={item} active={item.id === feed.id} />
            <div className="dh-card-text"><b>{item.title}</b><small>{item.apiSource || item.category}</small></div>
          </button>)}</div>
        </div>
      </aside>

      <div className="dh-info" style={{opacity: awake ? 1 : 0.16}}>
        <p className="dh-eyebrow">Renderer State</p>
        <h1 className="dh-title">{feed.title}</h1>
        <p className="dh-note">{searchMode === "premium" ? `AI guided ${category}: ${tour}. ` : "Regular API feed. "}{feed.note}</p>
        <div className="dh-state-badges"><span>{category}</span><span>{searchMode}</span><span>{feed.apiStatus || "api"}</span><span>{activeTour.icon}</span><span>Researcher ready</span></div>
      </div>

      <div className="dh-media" style={{opacity: awake ? 1 : 0.12}}>
        <button className="dh-btn" onClick={() => setPlaying((value) => !value)}>{playing ? "Pause" : "Resume"}</button>
        <button className="dh-btn" onClick={() => step(-1)}>Back 10s</button>
        <button className="dh-btn" onClick={() => step(1)}>Forward 10s</button>
        <button className="dh-btn" onClick={() => chooseTour(activeTours[(activeTours.findIndex((item) => item.id === tour) + 1) % activeTours.length])}>Switch Tour</button>
      </div>

      <div className="dh-utility" style={{opacity: awake ? 1 : 0.1}}>{["Save", "Share", "Embed", "Download", "Comment", "Related"].map((label) => <button key={label} className="dh-btn" onClick={() => action(label)}>{label}</button>)}</div>

      <div className="dh-layer-dock" style={{opacity: awake ? 1 : 0.12}}>
        <button className={`dh-btn ${paid ? "" : "locked"}`} onClick={() => paid ? setLayerOpen((value) => !value) : setEntryOpen(true)}>{paid ? `Smart Layers: ${layer}` : "Smart Layers: Premium / Pro"}</button>
        {layerOpen && paid && <div className="dh-layer-menu">{layers.map((item) => <button key={item} className={`dh-btn ${item === layer ? "active" : ""}`} onClick={() => {setLayer(item); setLayerOpen(false); wake()}}>{item}</button>)}</div>}
      </div>
    </section>

    {entryOpen && <section className="dh-entry">
      <div className="dh-entry-panel">
        {entryLoading ? <>
          <div className="dh-logo">DigitalHut</div>
          <div className="dh-load"><span /></div>
          <p className="dh-entry-text">Loading your observatory system</p>
        </> : <>
          <p className="dh-eyebrow">Choose profile</p>
          <h2 className="dh-welcome">Welcome!</h2>
          <input className="dh-entry-input" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Username Account" />
          <div className="dh-account-grid">{accounts.map((item) => <button key={item} className={`dh-btn ${tier === item ? "active" : ""}`} onClick={() => enter(item)}>{item.toUpperCase()}</button>)}</div>
          <div className="dh-wallet"><ConnectButton /></div>
          <p className="dh-entry-small">Ambient loader starts when you enter. The profile gate returns after about 8 minutes away.</p>
        </>}
      </div>
    </section>}
  </main>
}
