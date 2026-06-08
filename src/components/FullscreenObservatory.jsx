import React, {useEffect, useMemo, useRef, useState} from "react"
import "@google/model-viewer"
import {ConnectButton} from "../wallet"

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

function RendererVisual({feed, layer, guided}){
  const bars = Array.from({length: 18})
  return <div style={{...s.renderVisual, background: `radial-gradient(circle at 38% 38%,${feed.accent}28,transparent 28%),linear-gradient(135deg,#040814,#0b1222 48%,#050816)`}}>
    <model-viewer src={feed.model} camera-controls auto-rotate={guided ? "" : undefined} autoplay shadow-intensity="1" exposure={layer === "Lighting" ? "1.35" : "1"} style={s.glbLayer} />
    <div style={{...s.orbit, borderColor: `${feed.accent}88`, animation: guided ? "dhDrift 18s linear infinite" : "none"}} />
    <div style={{...s.orbitTwo, borderColor: `${feed.accent}55`, animation: guided ? "dhDrift 11s linear infinite reverse" : "none"}} />
    <div style={s.sweep} />
    <div style={s.skyline}>{bars.map((_, index) => <span key={index} style={{height: `${22 + ((index * 19) % 58)}%`, background: index % 3 === 0 ? feed.accent : "rgba(219,234,254,.58)"}} />)}</div>
    <div style={layer === "Grid" || layer === "Coordinates" ? s.visualGrid : s.hidden} />
    <div style={s.coreGlow} />
    <div style={s.visualLabel}>{feed.category}</div>
  </div>
}

function MiniVisual({feed, active}){
  return <div style={{...s.miniVisual, borderColor: active ? feed.accent : "rgba(226,232,240,.16)"}}>
    <div style={{...s.miniOrb, background: `${feed.accent}55`}} />
    <div style={s.miniBars}>{[0,1,2,3,4].map((item) => <span key={item} style={{height: `${28 + item * 11}%`, background: item === 2 ? feed.accent : "rgba(219,234,254,.52)"}} />)}</div>
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
    setActive(nextIndex)
    setPlaying(true)
    const nextFeed = categoryFeeds[nextIndex]
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

  return <main onPointerMove={wake} onPointerDown={wake} style={s.page}>
    <style>{"@keyframes dhLoad{0%{transform:translateX(-80%);opacity:.35}55%{opacity:1}100%{transform:translateX(180%);opacity:.25}}@keyframes dhDrift{to{transform:rotate(360deg)}}@keyframes dhSweep{0%,100%{opacity:.12;transform:translateX(-24%) rotate(14deg)}50%{opacity:.62;transform:translateX(24%) rotate(14deg)}}"}</style>
    <section style={s.stage}>
      <RendererVisual feed={feed} layer={layer} guided={guided} />
      <div style={s.vignette} />
      <div style={layer === "Grid" || layer === "Coordinates" ? s.grid : s.hidden} />
      <div style={layer === "Architect" ? s.architect : s.hidden}><b>Architect Layer</b><span>builders / developers / researchers / AIs / experimental</span></div>
      <div style={layer === "Props" ? s.props : s.hidden}>Props layer active</div>

      <div style={{...s.top, opacity: awake ? 1 : 0.08}}>
        <div style={s.search}>
          <input value={query} onChange={(event) => setQuery(event.target.value)} onFocus={wake} placeholder="Search GLB or guided tour..." style={s.input} />
          <button onClick={() => setSearchMode("regular")} style={searchMode === "regular" ? s.modeActive : s.modeButton}>Regular GLB</button>
          <button onClick={() => setSearchMode("premium")} style={searchMode === "premium" ? s.modeActive : s.modeButton}>Premium Tour</button>
          <button onClick={runSearch} style={s.hot}>Search</button>
          <button onClick={voice} style={s.hot}>Voice</button>
        </div>
        <button onClick={() => setEntryOpen(true)} style={s.account}>{username || "Choose account"} / {tier}</button>
      </div>

      <div style={{...s.categoryDock, opacity: awake ? 1 : 0.18}}>
        {categories.map((item) => <button key={item.id} onClick={() => selectCategory(item.id)} style={item.id === category ? {...s.categoryCard, borderColor: item.accent, background: `${item.accent}22`} : s.categoryCard}>
          <span style={{...s.categoryIcon, background: `${item.accent}30`, color: item.accent}}>{item.icon}</span>
          <small>{item.id}</small>
        </button>)}
      </div>

      <aside style={{...s.quickRail, opacity: awake ? 1 : 0.2}}>
        <div style={s.quickSection}>
          <div style={s.railHead}><span>Guided Tour</span><b>{tour}</b></div>
          <div style={s.quickRow}>{guidedTours.map((item) => <button key={item.id} onClick={() => chooseTour(item)} style={item.id === tour ? s.activeTourCard : s.tourCard}>
            <span>{item.icon}</span><small>{item.id}</small>
          </button>)}</div>
        </div>
        <div style={s.quickSection}>
          <div style={s.railHead}><span>Regular Feed</span><b>{category}</b></div>
          <div style={s.feedRow}>{categoryFeeds.map((item) => <button key={item.id} onClick={() => chooseFeed(item)} style={item.id === feed.id ? s.activeFeedCard : s.feedCard}>
            <MiniVisual feed={item} active={item.id === feed.id} />
            <div style={s.cardText}><b>{item.title}</b><small>{item.category}</small></div>
          </button>)}</div>
        </div>
      </aside>

      <div style={{...s.info, opacity: awake ? 1 : 0.16}}><p style={s.eyebrow}>Renderer State</p><h1 style={s.title}>{feed.title}</h1><p style={s.note}>{searchMode === "premium" ? `AI guided: ${tour}. ` : "Regular GLB mode. "}{feed.note}</p><div style={s.stateBadges}><span>{category}</span><span>{searchMode}</span><span>Researcher ready</span></div></div>

      <div style={{...s.media, opacity: awake ? 1 : 0.12}}>
        <button onClick={() => setPlaying((value) => !value)} style={s.mediaBtn}>{playing ? "Pause" : "Resume"}</button>
        <button onClick={() => step(-1)} style={s.mediaBtn}>Back 10s</button>
        <button onClick={() => step(1)} style={s.mediaBtn}>Forward 10s</button>
        <button onClick={() => chooseTour(guidedTours[(guidedTours.findIndex((item) => item.id === tour) + 1) % guidedTours.length])} style={s.mediaBtn}>Switch Tour</button>
      </div>

      <div style={{...s.utility, opacity: awake ? 1 : 0.1}}>{["Save", "Share", "Embed", "Download", "Comment", "Related"].map((label) => <button key={label} onClick={() => action(label)} style={s.tiny}>{label}</button>)}</div>

      <div style={{...s.layerDock, opacity: awake ? 1 : 0.12}}>
        <button onClick={() => paid ? setLayerOpen((value) => !value) : setEntryOpen(true)} style={paid ? s.layerBtn : s.locked}>{paid ? `Smart Layers: ${layer}` : "Smart Layers: Premium / Pro"}</button>
        {layerOpen && paid && <div style={s.layerMenu}>{layers.map((item) => <button key={item} onClick={() => {setLayer(item); setLayerOpen(false); wake()}} style={item === layer ? s.layerActive : s.layerOption}>{item}</button>)}</div>}
      </div>
    </section>

    {entryOpen && <section style={s.entry}>
      <div style={s.entryPanel}>
        {entryLoading ? <><div style={s.logo}>DigitalHut</div><div style={s.load}><span style={s.loadFill} /></div><p style={s.entryText}>Loading your observatory system</p></> : <>
          <p style={s.eyebrow}>Choose profile</p><h2 style={s.welcome}>Welcome!</h2>
          <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Username Account" style={s.entryInput} />
          <div style={s.accountGrid}>{accounts.map((item) => <button key={item} onClick={() => enter(item)} style={tier === item ? s.accountActive : s.accountChoice}>{item.toUpperCase()}</button>)}</div>
          <div style={s.wallet}><ConnectButton /></div>
          <p style={s.entrySmall}>Ambient loader starts when you enter. The profile gate returns after about 8 minutes away.</p>
        </>}
      </div>
    </section>}
  </main>
}

const glass = "rgba(2,6,23,.54)"
const line = "rgba(226,232,240,.16)"
const button = {borderRadius: 7, border: `1px solid ${line}`, color: "white", fontWeight: 900, cursor: "pointer"}

const s = {
  page: {height: "100dvh", minHeight: "100vh", width: "100%", overflow: "hidden", background: "#000", color: "white", fontFamily: "Arial,sans-serif"},
  stage: {position: "relative", width: "100%", height: "100%", overflow: "hidden", background: "#000"},
  renderVisual: {position: "absolute", inset: 0, overflow: "hidden"},
  glbLayer: {position: "absolute", inset: 0, width: "100%", height: "100%", background: "transparent", opacity: .72},
  orbit: {position: "absolute", width: "min(78vw,900px)", aspectRatio: "1", border: "1px solid", borderRadius: "50%", left: "18%", top: "-14%", opacity: .78},
  orbitTwo: {position: "absolute", width: "min(46vw,540px)", aspectRatio: "1", border: "2px solid", borderRadius: "50%", right: "17%", top: "18%", opacity: .64},
  sweep: {position: "absolute", width: "140%", height: "18%", left: "-20%", top: "38%", background: "linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent)", filter: "blur(14px)", animation: "dhSweep 8s ease-in-out infinite"},
  skyline: {position: "absolute", left: "11%", right: "34%", bottom: "8%", height: "42%", display: "flex", alignItems: "end", gap: 9, transform: "perspective(720px) rotateX(48deg)", transformOrigin: "50% 100%", opacity: .82},
  visualGrid: {position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(103,232,249,.13) 1px,transparent 1px),linear-gradient(90deg,rgba(103,232,249,.13) 1px,transparent 1px)", backgroundSize: "54px 54px", mixBlendMode: "screen"},
  coreGlow: {position: "absolute", width: "28vw", height: "28vw", borderRadius: "50%", left: "30%", top: "28%", background: "radial-gradient(circle,rgba(255,255,255,.22),transparent 62%)", filter: "blur(4px)"},
  visualLabel: {position: "absolute", left: 24, top: 88, color: "rgba(255,255,255,.20)", fontSize: "clamp(42px,9vw,140px)", fontWeight: 900, lineHeight: .9, textTransform: "uppercase"},
  vignette: {position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(circle at 42% 42%,transparent 0,rgba(0,0,0,.05) 42%,rgba(0,0,0,.72) 100%),linear-gradient(90deg,rgba(0,0,0,.62),transparent 20%,transparent 70%,rgba(0,0,0,.72))"},
  hidden: {display: "none"},
  grid: {position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(103,232,249,.16) 1px,transparent 1px),linear-gradient(90deg,rgba(103,232,249,.16) 1px,transparent 1px)", backgroundSize: "52px 52px", mixBlendMode: "screen", opacity: .55},
  architect: {position: "absolute", left: 22, top: 106, display: "grid", gap: 4, padding: "10px 12px", border: `1px solid ${line}`, borderRadius: 8, background: "rgba(8,13,24,.72)", backdropFilter: "blur(10px)"},
  props: {position: "absolute", right: 344, top: 106, padding: "9px 11px", borderRadius: 8, border: `1px solid ${line}`, background: "rgba(250,204,21,.16)", color: "#fef3c7", fontWeight: 900},
  top: {position: "absolute", top: 14, left: 14, right: 14, display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", transition: "opacity .22s ease"},
  search: {display: "flex", gap: 7, alignItems: "center", maxWidth: "min(880px,72vw)", padding: 6, borderRadius: 8, background: glass, border: `1px solid ${line}`, backdropFilter: "blur(12px)"},
  input: {width: "min(300px,28vw)", minWidth: 120, padding: "10px 12px", borderRadius: 7, border: `1px solid ${line}`, background: "rgba(0,0,0,.46)", color: "white", fontWeight: 800, outline: "none"},
  hot: {...button, padding: "10px 11px", background: "rgba(103,232,249,.16)", color: "#e0faff"},
  modeButton: {...button, padding: "10px 11px", background: "rgba(255,255,255,.07)", color: "#dbeafe"},
  modeActive: {...button, padding: "10px 11px", border: "1px solid rgba(103,232,249,.56)", background: "rgba(103,232,249,.18)", color: "#ecfeff"},
  account: {...button, padding: "10px 12px", border: "1px solid rgba(250,204,21,.36)", background: "rgba(113,63,18,.62)", color: "#fef3c7", textTransform: "capitalize"},
  categoryDock: {position: "absolute", left: 14, top: 82, bottom: 92, width: 106, display: "grid", gap: 7, alignContent: "start", padding: 7, borderRadius: 8, border: `1px solid ${line}`, background: "rgba(2,6,23,.42)", backdropFilter: "blur(12px)", transition: "opacity .22s ease", overflow: "hidden"},
  categoryCard: {display: "grid", gridTemplateColumns: "32px minmax(0,1fr)", gap: 6, alignItems: "center", minHeight: 38, padding: 5, borderRadius: 8, border: `1px solid ${line}`, background: "rgba(255,255,255,.05)", color: "white", cursor: "pointer", textAlign: "left", fontWeight: 900},
  categoryIcon: {width: 30, height: 30, borderRadius: 7, display: "grid", placeItems: "center", fontSize: 11, fontWeight: 900},
  quickRail: {position: "absolute", top: 82, right: 14, bottom: 82, width: "min(420px,32vw)", display: "grid", gridTemplateRows: "minmax(0,1fr) minmax(0,1.25fr)", gap: 10, transition: "opacity .22s ease"},
  quickSection: {minHeight: 0, display: "grid", gridTemplateRows: "auto minmax(0,1fr)", gap: 8, padding: 10, borderRadius: 8, border: `1px solid ${line}`, background: "rgba(2,6,23,.46)", backdropFilter: "blur(14px)"},
  railHead: {display: "flex", justifyContent: "space-between", alignItems: "center", color: "#cffafe", fontWeight: 900, textTransform: "uppercase", fontSize: 12},
  quickRow: {display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 8},
  tourCard: {...button, display: "grid", gap: 5, placeItems: "center", padding: 9, background: "rgba(255,255,255,.06)"},
  activeTourCard: {...button, display: "grid", gap: 5, placeItems: "center", padding: 9, border: "1px solid rgba(103,232,249,.6)", background: "rgba(103,232,249,.16)"},
  feedRow: {minHeight: 0, display: "grid", gridTemplateRows: "repeat(4,minmax(0,1fr))", gap: 8},
  feedCard: {display: "grid", gridTemplateColumns: "86px minmax(0,1fr)", gap: 8, padding: 7, borderRadius: 8, border: `1px solid ${line}`, background: "rgba(15,23,42,.62)", color: "white", textAlign: "left", cursor: "pointer", overflow: "hidden"},
  activeFeedCard: {display: "grid", gridTemplateColumns: "86px minmax(0,1fr)", gap: 8, padding: 7, borderRadius: 8, border: "1px solid rgba(103,232,249,.66)", background: "rgba(8,145,178,.24)", color: "white", textAlign: "left", cursor: "pointer", overflow: "hidden", boxShadow: "0 0 28px rgba(103,232,249,.16)"},
  miniVisual: {position: "relative", borderRadius: 7, overflow: "hidden", minHeight: 66, border: "1px solid", background: "linear-gradient(135deg,#020617,#0f172a)"},
  miniOrb: {position: "absolute", width: 52, height: 52, borderRadius: "50%", left: 15, top: 8, filter: "blur(2px)"},
  miniBars: {position: "absolute", left: 8, right: 8, bottom: 8, height: 34, display: "flex", alignItems: "end", gap: 4},
  cardText: {display: "grid", gap: 5, alignContent: "center", minWidth: 0},
  info: {position: "absolute", left: 132, bottom: 96, width: "min(620px,46vw)", display: "grid", gap: 7, transition: "opacity .22s ease"},
  eyebrow: {margin: 0, color: "#67e8f9", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0},
  title: {margin: 0, fontSize: "clamp(34px,6vw,78px)", lineHeight: .92, letterSpacing: 0, textShadow: "0 12px 40px rgba(0,0,0,.9)", overflowWrap: "anywhere"},
  note: {margin: 0, maxWidth: 560, color: "#dbeafe", fontSize: 15, lineHeight: 1.45, textShadow: "0 8px 24px rgba(0,0,0,.85)"},
  stateBadges: {display: "flex", gap: 7, flexWrap: "wrap"},
  media: {position: "absolute", left: "50%", bottom: 18, transform: "translateX(-50%)", display: "flex", gap: 7, padding: 7, borderRadius: 8, border: `1px solid ${line}`, background: glass, backdropFilter: "blur(14px)", transition: "opacity .22s ease"},
  mediaBtn: {...button, padding: "10px 12px", background: "rgba(255,255,255,.08)", whiteSpace: "nowrap"},
  utility: {position: "absolute", right: 14, bottom: 18, display: "flex", gap: 5, padding: 6, borderRadius: 8, border: `1px solid ${line}`, background: glass, backdropFilter: "blur(14px)", transition: "opacity .22s ease"},
  tiny: {...button, fontSize: 11, padding: "8px 8px", background: "rgba(255,255,255,.07)", color: "#e2e8f0"},
  layerDock: {position: "absolute", left: 132, top: 82, transition: "opacity .22s ease"},
  layerBtn: {...button, padding: "10px 12px", border: "1px solid rgba(20,184,166,.44)", background: "rgba(20,184,166,.16)", color: "#dffdf8"},
  locked: {...button, padding: "10px 12px", border: "1px solid rgba(250,204,21,.36)", background: "rgba(113,63,18,.62)", color: "#fef3c7"},
  layerMenu: {marginTop: 8, display: "grid", gap: 5, minWidth: 190, padding: 8, borderRadius: 8, border: `1px solid ${line}`, background: "rgba(2,6,23,.88)", backdropFilter: "blur(14px)"},
  layerOption: {...button, padding: "9px 10px", background: "rgba(255,255,255,.06)", textAlign: "left"},
  layerActive: {...button, padding: "9px 10px", border: "1px solid rgba(103,232,249,.56)", background: "rgba(103,232,249,.16)", textAlign: "left"},
  entry: {position: "fixed", inset: 0, zIndex: 50, display: "grid", placeItems: "center", padding: 18, background: "radial-gradient(circle at 50% 40%,rgba(229,9,20,.20),rgba(0,0,0,.92) 58%,#000 100%)", backdropFilter: "blur(12px)"},
  entryPanel: {width: "min(520px,92vw)", display: "grid", gap: 14, padding: 24, borderRadius: 8, border: `1px solid ${line}`, background: "rgba(2,6,23,.72)", boxShadow: "0 30px 90px rgba(0,0,0,.7)", textAlign: "center"},
  logo: {fontSize: "clamp(38px,8vw,66px)", fontWeight: 900},
  load: {height: 3, borderRadius: 999, overflow: "hidden", background: "rgba(255,255,255,.14)"},
  loadFill: {display: "block", width: "42%", height: "100%", borderRadius: 999, background: "#e50914", animation: "dhLoad 1.05s ease-in-out infinite"},
  entryText: {margin: 0, color: "#f8fafc", fontWeight: 900},
  welcome: {margin: 0, fontSize: "clamp(36px,7vw,60px)", lineHeight: 1},
  entryInput: {width: "100%", padding: "13px 14px", borderRadius: 8, border: `1px solid ${line}`, background: "rgba(0,0,0,.44)", color: "white", fontWeight: 900, outline: "none"},
  accountGrid: {display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 8},
  accountChoice: {...button, minHeight: 48, background: "rgba(255,255,255,.07)"},
  accountActive: {...button, minHeight: 48, border: "1px solid rgba(103,232,249,.66)", background: "rgba(103,232,249,.16)"},
  wallet: {display: "grid", justifyContent: "center"},
  entrySmall: {margin: 0, color: "#94a3b8", fontSize: 13, lineHeight: 1.45}
}
