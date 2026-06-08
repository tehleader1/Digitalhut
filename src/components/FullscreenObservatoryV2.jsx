import React, {useEffect, useRef, useState} from "react"
import "@google/model-viewer"
import {ConnectButton} from "../wallet"
import "./FullscreenObservatory.css"
import "./FullscreenObservatory.api.css"
import "./FullscreenObservatory.sequence.css"

const INACTIVITY_MS = 8 * 60 * 1000
const accounts = ["guest", "standard", "premium", "pro"]
const layers = ["Base", "Architect", "Lighting", "Props", "Grid", "Coordinates"]

const categories = [
  ["Continent", "CO", "#67e8f9", "global terrain, travel, culture, and education"],
  ["Planetary", "PL", "#a78bfa", "space, science, orbit, and planetary research"],
  ["Gamer", "GM", "#22c55e", "interactive worlds, character movement, and gameplay prototypes"],
  ["Real Estate", "RE", "#2dd4bf", "property, city blocks, structures, and development scouting"],
  ["Workforce", "WF", "#fb7185", "jobsites, training, operations, and safety walkthroughs"],
  ["Home Project", "HP", "#facc15", "personal builds, interiors, repairs, and home planning"],
  ["Political", "PO", "#f97316", "civic geography, public works, maps, and policy spaces"],
  ["Programmer", "PR", "#38bdf8", "developer inspection, APIs, agents, and prototype logic"],
  ["Researcher", "RS", "#c084fc", "research notes, evidence review, archives, and AI analysis"]
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
    thumbnail: firstThumbnail(item),
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
      const response = await fetch(endpoint, {headers: {Accept: "application/json"}})
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

function freshEntry(){
  const last = Number(window.localStorage.getItem("digitalhut:lastAccountEntry") || 0)
  return last > 0 && Date.now() - last < INACTIVITY_MS
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

function TourVisual({item, active, accent}){
  return <div className="dh-tour-visual" style={{"--accent": accent, borderColor: active ? accent : undefined}}><span /><span /><b>{item.icon}</b></div>
}

function RendererVisual({feed, stage, guided, loading, layer}){
  const [modelReady, setModelReady] = useState(false)
  const modelRef = useRef(null)
  const hasEmbed = Boolean(feed.embedUrl)
  const hasModel = Boolean(feed.modelUrl)
  const isStats = stage.kind === "stats"
  const stars = Array.from({length: 24})
  const skyline = Array.from({length: 18})

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

  return <div className={`dh-renderer ${guided ? "guided" : ""} ${(hasEmbed || hasModel) && !isStats ? "has-api" : ""} stage-${stage.kind}`} style={{"--accent": feed.accent}}>
    <div className="dh-motion-sky" />
    <div className="dh-stars">{stars.map((_, index) => <span key={index} style={{left: `${4 + (index * 43) % 91}%`, top: `${7 + (index * 31) % 78}%`}} />)}</div>
    <SceneObject feed={feed} />
    {hasEmbed && !isStats && <iframe className="dh-api-frame" title={feed.title} src={feed.embedUrl} allow="autoplay; fullscreen; xr-spatial-tracking" allowFullScreen />}
    {!hasEmbed && hasModel && !isStats && <model-viewer ref={modelRef} className={modelReady ? "dh-model is-ready" : "dh-model"} src={feed.modelUrl} camera-controls="true" camera-orbit={stage.orbit} auto-rotate={guided ? "true" : undefined} autoplay="true" exposure={layer === "Lighting" ? "1.45" : "1"} shadow-intensity="1" />}
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
  const [tier, setTier] = useState("guest")
  const [username, setUsername] = useState("")
  const [entryOpen, setEntryOpen] = useState(true)
  const [entryLoading, setEntryLoading] = useState(false)
  const [awake, setAwake] = useState(true)
  const [playing, setPlaying] = useState(true)
  const [layer, setLayer] = useState("Base")
  const [layerOpen, setLayerOpen] = useState(false)
  const hideTimer = useRef(null)
  const requestRef = useRef(0)

  const activeTours = toursFor(category)
  const activeTour = activeTours.find((item) => item.id === tour) || activeTours[0]
  const stage = stages[stageIndex]
  const feed = feeds[active] || feeds[0] || seedFeeds(category)[0]
  const similarFeed = feeds[(active + 1) % Math.max(feeds.length, 1)] || feed
  const statsFeed = statsFeeds[0] || createStatsFeed(feed, category, activeTour)
  const sceneFeed = stage.kind === "similar" ? similarFeed : stage.kind === "stats" ? statsFeed : feed
  const paid = ["premium", "pro"].includes(tier)
  const guided = mode === "premium" && playing

  useEffect(() => {
    setTier(window.localStorage.getItem("digitalhut:tier") || "guest")
    setUsername(window.localStorage.getItem("digitalhut:username") || "")
    setEntryOpen(!freshEntry())
    loadFeeds("Real Estate", "modern house real estate 3d", {silent: true})
  }, [])

  useEffect(() => {
    if(!guided || entryOpen) return
    const timer = window.setInterval(() => setStageIndex((current) => (current + 1) % stages.length), stage.kind === "stats" ? 9000 : 6500)
    return () => window.clearInterval(timer)
  }, [guided, entryOpen, stage.kind])

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
    setLoading(true)
    setFeeds(seedFeeds(nextCategory))
    setActive(0)
    const results = await resolveApiFeeds(nextCategory, term)
    if(requestRef.current !== id) return seedFeeds(nextCategory)
    const next = results.length ? results : seedFeeds(nextCategory)
    setFeeds(next)
    setLoading(false)
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
    }, 1100)
  }

  function selectCategory(nextCategory){
    setCategory(nextCategory)
    setTour(toursFor(nextCategory)[0].id)
    setStageIndex(0)
    setStatsFeeds([])
    const seed = seedFeeds(nextCategory)[0]
    setQuery(seed.query)
    loadFeeds(nextCategory, seed.query, {silent: true})
    speak(`DigitalHut set to ${nextCategory}. Premium tour will move from current model, to angle pass, to similar model, then statistics model.`)
    wake()
  }

  function chooseTour(item){
    setTour(item.id)
    setMode("premium")
    setStageIndex(0)
    setPlaying(true)
    speak(`Starting ${category} ${item.id} guided sequence. Current model first. Then I rotate the camera, choose a similar model, and move into statistics.`)
    wake()
  }

  function chooseFeed(item){
    const index = feeds.findIndex((candidate) => candidate.id === item.id)
    if(index >= 0) setActive(index)
    setQuery(item.query || item.title)
    setStageIndex(0)
    speak(`Loaded ${item.title}. ${mode === "premium" ? "Guided sequence ready." : "Regular API mode."}`)
    wake()
  }

  async function runSearch(){
    setPlaying(true)
    setStageIndex(0)
    const next = await loadFeeds(category, query)
    const first = next[0] || feed
    if(mode === "premium") speak(`Premium guided tour started for ${first.title}. ${activeTour.prompt}`)
    else speak(`Regular API feed loading ${first.title}.`)
    wake()
  }

  function nextStage(){
    setStageIndex((current) => (current + 1) % stages.length)
    const next = stages[(stageIndex + 1) % stages.length]
    speak(`${next.label}. ${next.kind === "stats" ? "Moving into statistics and provider data." : next.kind === "similar" ? "Choosing a similar model next to compare." : next.kind === "angle" ? "Rotating the model for another angle." : "Returning to the current model."}`)
    wake()
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

  return <main className="dh-observatory" onPointerMove={wake} onPointerDown={wake}>
    <section className="dh-stage">
      <RendererVisual feed={sceneFeed} stage={stage} guided={guided} loading={loading} layer={layer} />
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
        {categories.map((item) => <button key={item.id} className={`dh-category-card ${item.id === category ? "active" : ""}`} style={{"--accent": item.accent}} onClick={() => selectCategory(item.id)}>
          <span className="dh-category-icon">{item.icon}</span><small>{item.id}</small>
        </button>)}
      </div>

      <aside className="dh-quick-rail" style={{opacity: awake ? 1 : 0.2}}>
        <div className="dh-quick-section">
          <div className="dh-rail-head"><span>{category} Tour</span><b>{stage.label}</b></div>
          <div className="dh-tour-grid">{activeTours.map((item) => <button key={item.id} className={`dh-btn dh-tour-card ${item.id === tour ? "active" : ""}`} onClick={() => chooseTour(item)}>
            <TourVisual item={item} active={item.id === tour} accent={sceneFeed.accent} /><small>{item.id}</small>
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
    </section>

    {entryOpen && <section className="dh-entry"><div className="dh-entry-panel">{entryLoading ? <><div className="dh-logo">DigitalHut</div><div className="dh-load"><span /></div><p>Loading your observatory system</p></> : <><p className="dh-eyebrow">Choose profile</p><h2 className="dh-welcome">Welcome!</h2><input className="dh-entry-input" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Username Account" /><div className="dh-account-grid">{accounts.map((item) => <button key={item} className={`dh-btn ${tier === item ? "active" : ""}`} onClick={() => enter(item)}>{item.toUpperCase()}</button>)}</div><div className="dh-wallet"><ConnectButton /></div><p className="dh-entry-small">Premium starts guided model sequences. Regular users can still search and inspect API feeds.</p></>}</div></section>}
  </main>
}
