import React, {useEffect, useMemo, useRef, useState} from "react"
import "@google/model-viewer"
import {ConnectButton} from "../wallet"
import "./FullscreenObservatory.css"

const INACTIVITY_MS = 8 * 60 * 1000
const layers = ["Base", "Architect", "Lighting", "Props", "Grid", "Coordinates"]
const accounts = ["guest", "standard", "premium", "pro"]

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
    ["Cape Town South Africa", "Global civic terrain and coastline study.", "/glbs/cape_town_-_south_africa.glb"],
    ["Caribbean Colonial Zone", "History, tourism, and public cultural exploration.", "/glbs/tourist_colonial_zone_dominican_republic.glb"],
    ["California Hollywood", "Culture, tourism, and city landmark context.", "/glbs/hollywood_sign_los_angeles_ca_usa.glb"],
    ["European Buildings", "Architecture and old-city structure set.", "/glbs/european_buildings_asset_pack_3.glb"]
  ],
  "Planetary": [
    ["International Space Station", "Orbital research feed for space and engineering.", "/glbs/international_space_station.glb"],
    ["Moon Observatory", "Planetary science and lunar study mode.", "/glbs/moon.glb"],
    ["Europe Heightmap", "Large terrain review for planetary-style elevation.", "/glbs/europe_with_4k_heightmap.glb"],
    ["Orbital City Grid", "Synthetic orbit and infrastructure planner.", "/glbs/city_pack_7.glb"]
  ],
  "Gamer": [
    ["City Pack Prototype", "Game-ready city block and navigation prototype.", "/glbs/city_pack_7.glb"],
    ["Animated Environment", "Playable scene and environment tour context.", "/glbs/tourist_colonial_zone_dominican_republic.glb"],
    ["Mission Hub", "Prototype hub for characters, quests, and props.", "/glbs/european_buildings_asset_pack_3.glb"],
    ["Orbit Arena", "Synthetic arena flow for gameplay testing.", "/glbs/moon.glb"]
  ],
  "Real Estate": [
    ["Surfside Florida", "Beachfront property, terrain, and climate inspection.", "/glbs/surfside_florida_usa_beachfront_properties.glb"],
    ["Wall Street New York", "Financial district, city structure, and market context.", "/glbs/new_york_city._manhattan.glb"],
    ["Morgantown West Virginia", "Residential terrain and local development scan.", "/glbs/morgantown_west_virginia_usa_x2.glb"],
    ["Vancouver Canada", "Urban development and civic context.", "/glbs/dtes_vancouver_canada.glb"]
  ],
  "Workforce": [
    ["Training Yard", "Operations, workforce routing, and team walk-through.", "/glbs/city_pack_7.glb"],
    ["Jobsite Structure", "Inspection, safety, and workflow planning.", "/glbs/european_buildings_asset_pack_3.glb"],
    ["Civic Operations", "Public service logistics and infrastructure mode.", "/glbs/new_york_city._manhattan.glb"],
    ["Coastal Response", "Weather, access, and emergency planning.", "/glbs/surfside_florida_usa_beachfront_properties.glb"]
  ],
  "Home Project": [
    ["Home Build Sketch", "Personal project, room flow, and repair planning.", "/glbs/european_buildings_asset_pack_3.glb"],
    ["Neighborhood Context", "Home area, local terrain, and property context.", "/glbs/morgantown_west_virginia_usa_x2.glb"],
    ["Interior Props", "Props, furniture, and home concept testing.", "/glbs/city_pack_7.glb"],
    ["Coastal Home", "Beachfront home and environmental review.", "/glbs/surfside_florida_usa_beachfront_properties.glb"]
  ],
  "Political": [
    ["Civic District", "Public works, governance, and city policy context.", "/glbs/new_york_city._manhattan.glb"],
    ["Global Region", "Maps, boundaries, and public planning review.", "/glbs/europe_with_4k_heightmap.glb"],
    ["Historical Zone", "Culture, tourism, and public memory space.", "/glbs/tourist_colonial_zone_dominican_republic.glb"],
    ["Infrastructure View", "Civic assets and transport context.", "/glbs/dtes_vancouver_canada.glb"]
  ],
  "Programmer": [
    ["Developer Scene", "Prototype scene for APIs, agents, and runtime logic.", "/glbs/city_pack_7.glb"],
    ["Renderer Stress Test", "GLB load state, layers, and camera behavior.", "/glbs/international_space_station.glb"],
    ["Data Twin", "Structured city data and observatory state testing.", "/glbs/new_york_city._manhattan.glb"],
    ["Tool Builder", "Developer inspection and extension planning.", "/glbs/european_buildings_asset_pack_3.glb"]
  ],
  "Researcher": [
    ["Research Archive", "Evidence review, source context, and annotation mode.", "/glbs/europe_with_4k_heightmap.glb"],
    ["Scientific Orbit", "Researcher lens for space and engineering details.", "/glbs/international_space_station.glb"],
    ["Field Study", "Terrain, site notes, and comparative observation.", "/glbs/cape_town_-_south_africa.glb"],
    ["AI Analysis Room", "Researcher plus AI review for experimental insight.", "/glbs/city_pack_7.glb"]
  ]
}

const guidedTours = [
  {id: "Overview", icon: "OV", prompt: "Start with the big picture and explain what the visitor is seeing."},
  {id: "Structure", icon: "ST", prompt: "Explain structure, layers, scale, and inspection points."},
  {id: "Researcher", icon: "RS", prompt: "Narrate as a researcher reviewing evidence, context, and open questions."},
  {id: "Free Use", icon: "FU", prompt: "Explain practical public use cases without assuming a paid workflow."}
]

function makeFeeds(category){
  const meta = categories.find((item) => item.id === category) || categories[0]
  return (feedBank[category] || feedBank.Continent).map(([title, note, model], index) => ({
    id: `${category}:${index}:${title}`,
    title,
    note,
    model,
    category,
    icon: meta.icon,
    accent: meta.accent,
    context: meta.context
  }))
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

function RendererVisual({feed, layer, guided}){
  const [modelReady, setModelReady] = useState(false)
  const modelRef = useRef(null)
  const stars = Array.from({length: 24})
  const skyline = Array.from({length: 18})

  useEffect(() => {
    setModelReady(false)
    const model = modelRef.current
    if(!model) return
    const ready = () => setModelReady(true)
    const failed = () => setModelReady(false)
    model.addEventListener("load", ready)
    model.addEventListener("error", failed)
    return () => {
      model.removeEventListener("load", ready)
      model.removeEventListener("error", failed)
    }
  }, [feed.model])

  return <div className={`dh-renderer ${guided ? "guided" : ""}`} style={{"--accent": feed.accent}}>
    <div className="dh-motion-sky" />
    <div className="dh-stars">{stars.map((_, index) => <span key={index} style={{left: `${4 + (index * 43) % 91}%`, top: `${7 + (index * 31) % 78}%`}} />)}</div>
    <SceneObject feed={feed} />
    <model-viewer
      ref={modelRef}
      class={modelReady ? "dh-model is-ready" : "dh-model"}
      src={feed.model}
      camera-controls="true"
      auto-rotate={guided ? "true" : undefined}
      autoplay="true"
      shadow-intensity="1"
      exposure={layer === "Lighting" ? "1.45" : "1"}
    />
    <div className="dh-orbit" />
    <div className="dh-orbit-two" />
    <div className="dh-sweep" />
    <div className="dh-skyline">{skyline.map((_, index) => <span key={index} style={{height: `${26 + ((index * 19) % 64)}%`}} />)}</div>
    {(layer === "Grid" || layer === "Coordinates") && <div className="dh-visual-grid" />}
    <div className="dh-core-glow" />
    <div className="dh-visual-label">{feed.category}</div>
    <div className={`dh-model-status ${modelReady ? "ready" : ""}`}>{modelReady ? "GLB active" : "Live preview active"}</div>
  </div>
}

function MiniVisual({feed, active}){
  return <div className={`dh-mini-visual ${active ? "active" : ""}`} style={{"--accent": feed.accent, borderColor: active ? feed.accent : undefined}}>
    <SceneObject feed={feed} compact />
    <div className="dh-mini-scan" />
  </div>
}

export default function FullscreenObservatory(){
  const [category, setCategory] = useState("Continent")
  const [active, setActive] = useState(0)
  const [query, setQuery] = useState("wall street new york")
  const [searchMode, setSearchMode] = useState("regular")
  const [tour, setTour] = useState("Overview")
  const [tier, setTier] = useState("guest")
  const [username, setUsername] = useState("")
  const [entryOpen, setEntryOpen] = useState(true)
  const [entryLoading, setEntryLoading] = useState(false)
  const [awake, setAwake] = useState(true)
  const [playing, setPlaying] = useState(true)
  const [layer, setLayer] = useState("Base")
  const [layerOpen, setLayerOpen] = useState(false)
  const hideTimer = useRef(null)

  const categoryFeeds = useMemo(() => makeFeeds(category), [category])
  const feed = categoryFeeds[active] || categoryFeeds[0]
  const paid = ["premium", "pro"].includes(tier)
  const guided = searchMode === "premium" && playing

  useEffect(() => {
    if(typeof window === "undefined") return
    setTier(window.localStorage.getItem("digitalhut:tier") || "guest")
    setUsername(window.localStorage.getItem("digitalhut:username") || "")
    setEntryOpen(!freshEntry())
  }, [])

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
    setActive(0)
    setTour("Overview")
    const meta = categories.find((item) => item.id === nextCategory)
    setQuery(nextCategory)
    setPlaying(true)
    wake()
    speak(`DigitalHut library set to ${nextCategory}. Renderer context reset for ${meta?.context || "observatory exploration"}.`)
  }

  function chooseFeed(item){
    const index = categoryFeeds.findIndex((candidate) => candidate.id === item.id)
    if(index >= 0) setActive(index)
    setQuery(item.title)
    wake()
    speak(`${searchMode === "premium" ? "Premium guided tour" : "Regular GLB mode"}. ${item.title}. ${item.note}`)
  }

  function chooseTour(item){
    setTour(item.id)
    setSearchMode("premium")
    setPlaying(true)
    wake()
    speak(`Premium guided tour. ${item.id}. ${item.prompt} Category context: ${category}. Project context: ${feed.note}`)
  }

  function runSearch(){
    const term = query.toLowerCase()
    const found = categoryFeeds.findIndex((item) => `${item.title} ${item.note} ${item.category}`.toLowerCase().includes(term))
    const nextIndex = found >= 0 ? found : 0
    const nextFeed = categoryFeeds[nextIndex]
    setActive(nextIndex)
    setPlaying(true)
    if(searchMode === "premium"){
      speak(`Premium guided tour started for ${nextFeed.title}. I am orbiting the scene and narrating ${category} context, researcher details, and free-use possibilities.`)
    } else {
      speak(`Regular GLB mode loading ${nextFeed.title}. Displaying the asset and keeping the renderer ready for exploration.`)
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
    if(label === "Save") window.localStorage.setItem("digitalhut:savedFeed", JSON.stringify(feed))
    if(label === "Share" && navigator.share) navigator.share({title: feed.title, text: feed.note, url: window.location.href}).catch(() => null)
    if(label === "Embed" && navigator.clipboard) navigator.clipboard.writeText(`<iframe src="${window.location.origin}/viewer.html?model=${feed.model}"></iframe>`).catch(() => null)
    if(label === "Download") paid ? window.open(feed.model, "_blank") : setEntryOpen(true)
    if(label === "Related") setActive((current) => (current + 1) % categoryFeeds.length)
    wake()
  }

  return <main className="dh-observatory" onPointerMove={wake} onPointerDown={wake}>
    <section className="dh-stage">
      <RendererVisual feed={feed} layer={layer} guided={guided} />
      <div className="dh-vignette" />
      {(layer === "Grid" || layer === "Coordinates") && <div className="dh-grid-layer" />}
      {layer === "Architect" && <div className="dh-architect"><b>Architect Layer</b><span>builders / developers / researchers / AIs / experimental</span></div>}
      {layer === "Props" && <div className="dh-props">Props layer active</div>}

      <div className="dh-top" style={{opacity: awake ? 1 : 0.08}}>
        <div className="dh-search">
          <input value={query} onChange={(event) => setQuery(event.target.value)} onFocus={wake} placeholder="Search GLB or guided tour..." />
          <button className={`dh-btn mode ${searchMode === "regular" ? "active" : ""}`} onClick={() => setSearchMode("regular")}>Regular GLB</button>
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
          <div className="dh-rail-head"><span>Guided Tour</span><b>{tour}</b></div>
          <div className="dh-tour-grid">{guidedTours.map((item) => <button key={item.id} className={`dh-btn dh-tour-card ${item.id === tour ? "active" : ""}`} onClick={() => chooseTour(item)}>
            <TourVisual item={item} active={item.id === tour} accent={feed.accent} />
            <small>{item.id}</small>
          </button>)}</div>
        </div>
        <div className="dh-quick-section">
          <div className="dh-rail-head"><span>Regular Feed</span><b>{category}</b></div>
          <div className="dh-feed-grid">{categoryFeeds.map((item) => <button key={item.id} className={`dh-feed-card ${item.id === feed.id ? "active" : ""}`} onClick={() => chooseFeed(item)}>
            <MiniVisual feed={item} active={item.id === feed.id} />
            <div className="dh-card-text"><b>{item.title}</b><small>{item.category}</small></div>
          </button>)}</div>
        </div>
      </aside>

      <div className="dh-info" style={{opacity: awake ? 1 : 0.16}}>
        <p className="dh-eyebrow">Renderer State</p>
        <h1 className="dh-title">{feed.title}</h1>
        <p className="dh-note">{searchMode === "premium" ? `AI guided: ${tour}. ` : "Regular GLB mode. "}{feed.note}</p>
        <div className="dh-state-badges"><span>{category}</span><span>{searchMode}</span><span>Researcher ready</span></div>
      </div>

      <div className="dh-media" style={{opacity: awake ? 1 : 0.12}}>
        <button className="dh-btn" onClick={() => setPlaying((value) => !value)}>{playing ? "Pause" : "Resume"}</button>
        <button className="dh-btn" onClick={() => step(-1)}>Back 10s</button>
        <button className="dh-btn" onClick={() => step(1)}>Forward 10s</button>
        <button className="dh-btn" onClick={() => chooseTour(guidedTours[(guidedTours.findIndex((item) => item.id === tour) + 1) % guidedTours.length])}>Switch Tour</button>
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
