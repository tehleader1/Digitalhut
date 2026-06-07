import React, {useEffect, useMemo, useRef, useState} from "react"
import "@google/model-viewer"
import {ConnectButton} from "../wallet"

const INACTIVITY_MS = 8 * 60 * 1000
const layerOptions = ["Base", "Architect", "Lighting", "Props", "Grid", "Coordinates"]
const accountTiers = ["guest", "standard", "premium", "pro"]

const feeds = [
  {
    title: "Wall Street New York",
    region: "Structure",
    model: "/glbs/new_york_city._manhattan.glb",
    accent: "#67e8f9",
    note: "Financial district, city structure, market-context observatory."
  },
  {
    title: "California Hollywood",
    region: "Continent",
    model: "/glbs/hollywood_sign_los_angeles_ca_usa.glb",
    accent: "#facc15",
    note: "Public culture signal with city terrain and tourism context."
  },
  {
    title: "International Space Station",
    region: "Planetary",
    model: "/glbs/international_space_station.glb",
    accent: "#a78bfa",
    note: "Orbital research feed for space, engineering, and education."
  },
  {
    title: "Surfside Florida",
    region: "Structure",
    model: "/glbs/surfside_florida_usa_beachfront_properties.glb",
    accent: "#2dd4bf",
    note: "Coastal structure, real estate, terrain, and climate inspection."
  },
  {
    title: "Cape Town South Africa",
    region: "Continent",
    model: "/glbs/cape_town_-_south_africa.glb",
    accent: "#fb7185",
    note: "Civic geography, terrain contrast, and global travel feed."
  },
  {
    title: "Moon Observatory",
    region: "Planetary",
    model: "/glbs/moon.glb",
    accent: "#cbd5e1",
    note: "Planetary science, classroom, research, and exploration mode."
  },
  {
    title: "Caribbean Colonial Zone",
    region: "Animated Environment",
    model: "/glbs/tourist_colonial_zone_dominican_republic.glb",
    accent: "#38bdf8",
    note: "Tourism, history, culture, and guided public exploration."
  },
  {
    title: "City Pack Prototype",
    region: "Animated Character",
    model: "/glbs/city_pack_7.glb",
    accent: "#22c55e",
    note: "Prototype city kit for builders, developers, AIs, and experiments."
  }
]

function storedEntryIsFresh(){
  if(typeof window === "undefined") return false
  const last = Number(window.localStorage.getItem("digitalhut:lastAccountEntry") || 0)
  return last > 0 && Date.now() - last < INACTIVITY_MS
}

export default function FullscreenObservatory(){
  const [activeIndex, setActiveIndex] = useState(0)
  const [query, setQuery] = useState("wall street new york")
  const [tier, setTier] = useState("guest")
  const [username, setUsername] = useState("")
  const [entryOpen, setEntryOpen] = useState(true)
  const [entryLoading, setEntryLoading] = useState(false)
  const [uiAwake, setUiAwake] = useState(true)
  const [manualMode, setManualMode] = useState(false)
  const [playing, setPlaying] = useState(true)
  const [tourOffset, setTourOffset] = useState(0)
  const [layerOpen, setLayerOpen] = useState(false)
  const [activeLayer, setActiveLayer] = useState("Base")
  const stageRef = useRef(null)
  const hideTimer = useRef(null)

  const activeFeed = feeds[activeIndex] || feeds[0]
  const isPaid = ["premium", "pro"].includes(tier)
  const shownFeeds = useMemo(() => {
    const doubled = [...feeds, ...feeds]
    return doubled.slice(tourOffset, tourOffset + 4)
  }, [tourOffset])

  useEffect(() => {
    if(typeof window === "undefined") return
    const storedTier = window.localStorage.getItem("digitalhut:tier")
    const storedName = window.localStorage.getItem("digitalhut:username")
    if(storedTier) setTier(storedTier)
    if(storedName) setUsername(storedName)
    setEntryOpen(!storedEntryIsFresh())
  }, [])

  useEffect(() => {
    if(entryOpen || manualMode || !playing) return
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % feeds.length)
    }, uiAwake ? 11000 : 16000)
    return () => window.clearInterval(timer)
  }, [entryOpen, manualMode, playing, uiAwake])

  function wakeChrome(){
    setUiAwake(true)
    window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => setUiAwake(false), 2400)
  }

  function enterAccount(nextTier = tier){
    setTier(nextTier)
    setEntryLoading(true)
    window.setTimeout(() => {
      window.localStorage.setItem("digitalhut:lastAccountEntry", String(Date.now()))
      window.localStorage.setItem("digitalhut:tier", nextTier)
      window.localStorage.setItem("digitalhut:username", username || "Guest")
      setEntryLoading(false)
      setEntryOpen(false)
      wakeChrome()
    }, 1050)
  }

  function chooseFeed(feed){
    const nextIndex = feeds.findIndex((item) => item.title === feed.title)
    if(nextIndex >= 0) setActiveIndex(nextIndex)
    setQuery(feed.title)
    setManualMode(true)
    wakeChrome()
  }

  function scan(){
    const term = query.toLowerCase()
    const found = feeds.findIndex((feed) => `${feed.title} ${feed.region} ${feed.note}`.toLowerCase().includes(term))
    setActiveIndex(found >= 0 ? found : (activeIndex + 1) % feeds.length)
    setManualMode(true)
    wakeChrome()
  }

  function voice(){
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if(!Recognition) return
    const recorder = new Recognition()
    recorder.onresult = (event) => setQuery(event.results[0][0].transcript)
    recorder.start()
    wakeChrome()
  }

  function shiftTour(amount){
    setTourOffset((current) => (current + amount + feeds.length) % feeds.length)
    wakeChrome()
  }

  function mediaStep(amount){
    setActiveIndex((current) => (current + amount + feeds.length) % feeds.length)
    setManualMode(true)
    wakeChrome()
  }

  function compactAction(label){
    if(label === "Share" && navigator.share){
      navigator.share({title: activeFeed.title, text: activeFeed.note, url: window.location.href}).catch(() => null)
    }
    if(label === "Embed" && navigator.clipboard){
      navigator.clipboard.writeText(`<iframe src="${window.location.origin}/viewer.html?model=${activeFeed.model}"></iframe>`).catch(() => null)
    }
    if(label === "Related") shiftTour(4)
    wakeChrome()
  }

  return <main ref={stageRef} onPointerMove={wakeChrome} onPointerDown={wakeChrome} style={styles.page}>
    <section style={styles.stage}>
      <model-viewer
        key={`${activeFeed.model}:${playing}:${activeLayer}`}
        src={activeFeed.model}
        camera-controls
        auto-rotate={playing && !manualMode ? "" : undefined}
        autoplay
        shadow-intensity="1"
        exposure={activeLayer === "Lighting" ? "1.35" : "1"}
        style={styles.viewer}
      />

      <div style={styles.vignette} />
      <div style={activeLayer === "Grid" || activeLayer === "Coordinates" ? styles.gridOverlay : styles.hidden} />
      <div style={activeLayer === "Architect" ? styles.architectOverlay : styles.hidden}>
        <span>Architect Layer</span>
        <small>builders / developers / researchers / AIs / experimental</small>
      </div>
      <div style={activeLayer === "Props" ? styles.propsOverlay : styles.hidden}>Props layer active</div>

      <div style={{...styles.topChrome, opacity: uiAwake ? 1 : 0.08}}>
        <div style={styles.searchBar}>
          <input value={query} onChange={(event) => setQuery(event.target.value)} onFocus={wakeChrome} placeholder="Search observatory feed..." style={styles.searchInput} />
          <button onClick={scan} style={styles.hotButton}>Scan</button>
          <button onClick={voice} style={styles.hotButton}>Voice</button>
          <a href="/library" style={styles.hotLink}>Feed</a>
          <a href="/insights" style={styles.hotLink}>Market</a>
        </div>
        <button onClick={() => setEntryOpen(true)} style={styles.accountButton}>{username || "Choose account"} / {tier}</button>
      </div>

      <aside style={{...styles.libraryRail, opacity: uiAwake ? 1 : 0.18}}>
        <div style={styles.railHead}>
          <span>Library</span>
          <button onClick={() => shiftTour(4)} style={styles.smallGhost}>Load 4</button>
        </div>
        {shownFeeds.map((feed) => <button key={`${feed.title}:${tourOffset}`} onPointerEnter={() => chooseFeed(feed)} onFocus={() => chooseFeed(feed)} onClick={() => chooseFeed(feed)} style={feed.title === activeFeed.title ? styles.activeFeedCard : styles.feedCard}>
          <div style={styles.cardVisual}>
            <model-viewer src={feed.model} auto-rotate interaction-prompt="none" camera-orbit="0deg 70deg 3m" style={styles.cardViewer} />
          </div>
          <div style={styles.cardText}>
            <b>{feed.title}</b>
            <small>{feed.region}</small>
          </div>
        </button>)}
      </aside>

      <div style={{...styles.bottomInfo, opacity: uiAwake ? 1 : 0.16}}>
        <p style={styles.eyebrow}>Active feed</p>
        <h1 style={styles.title}>{activeFeed.title}</h1>
        <p style={styles.note}>{activeFeed.note}</p>
      </div>

      <div style={{...styles.mediaControls, opacity: uiAwake ? 1 : 0.12}}>
        <button onClick={() => setPlaying((value) => !value)} style={styles.mediaButton}>{playing ? "Pause" : "Resume"}</button>
        <button onClick={() => mediaStep(-1)} style={styles.mediaButton}>Back 10s</button>
        <button onClick={() => mediaStep(1)} style={styles.mediaButton}>Forward 10s</button>
        <button onClick={() => shiftTour(4)} style={styles.mediaButton}>Switch Tour</button>
        <button onClick={() => setManualMode((value) => !value)} style={manualMode ? styles.activeMediaButton : styles.mediaButton}>{manualMode ? "Manual On" : "Manual Mode"}</button>
      </div>

      <div style={{...styles.utilityStrip, opacity: uiAwake ? 1 : 0.1}}>
        {["Save", "Share", "Embed", "Download", "Comment", "Related"].map((label) => <button key={label} onClick={() => compactAction(label)} style={styles.tinyAction}>{label}</button>)}
      </div>

      <div style={{...styles.layerDock, opacity: uiAwake ? 1 : 0.12}}>
        <button onClick={() => isPaid ? setLayerOpen((value) => !value) : setEntryOpen(true)} style={isPaid ? styles.layerButton : styles.lockedLayerButton}>
          {isPaid ? `Smart Layers: ${activeLayer}` : "Smart Layers: Premium / Pro"}
        </button>
        {layerOpen && isPaid && <div style={styles.layerMenu}>
          {layerOptions.map((layer) => <button key={layer} onClick={() => { setActiveLayer(layer); setLayerOpen(false); wakeChrome() }} style={layer === activeLayer ? styles.activeLayerOption : styles.layerOption}>{layer}</button>)}
        </div>}
      </div>
    </section>

    {entryOpen && <section style={styles.entryOverlay}>
      <div style={styles.entryPanel}>
        {entryLoading ? <>
          <div style={styles.entryLogo}>DigitalHut</div>
          <div style={styles.loadLine}><span style={styles.loadLineFill} /></div>
          <p style={styles.entryText}>Loading your observatory system</p>
        </> : <>
          <p style={styles.eyebrow}>Choose account</p>
          <h2 style={styles.welcome}>Welcome!</h2>
          <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Username Account" style={styles.entryInput} />
          <div style={styles.accountGrid}>
            {accountTiers.map((nextTier) => <button key={nextTier} onClick={() => enterAccount(nextTier)} style={tier === nextTier ? styles.activeAccount : styles.accountChoice}>{nextTier.toUpperCase()}</button>)}
          </div>
          <div style={styles.walletSlot}><ConnectButton /></div>
          <p style={styles.entrySmall}>This entry returns after about 8 minutes away, so the app feels like you are entering the system again.</p>
        </>}
      </div>
    </section>}
  </main>
}

const glass = "rgba(2,6,23,.54)"
const line = "rgba(226,232,240,.16)"

const styles = {
  page: {height: "100dvh", minHeight: "100vh", width: "100%", overflow: "hidden", background: "#000", color: "white", fontFamily: "Arial,sans-serif"},
  stage: {position: "relative", width: "100%", height: "100%", overflow: "hidden", background: "#000"},
  viewer: {position: "absolute", inset: 0, width: "100%", height: "100%", background: "#000"},
  vignette: {position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(circle at 42% 42%,transparent 0,rgba(0,0,0,.05) 42%,rgba(0,0,0,.72) 100%),linear-gradient(90deg,rgba(0,0,0,.62),transparent 20%,transparent 70%,rgba(0,0,0,.72))"},
  hidden: {display: "none"},
  gridOverlay: {position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(103,232,249,.16) 1px,transparent 1px),linear-gradient(90deg,rgba(103,232,249,.16) 1px,transparent 1px)", backgroundSize: "52px 52px", mixBlendMode: "screen", opacity: .55},
  architectOverlay: {position: "absolute", left: 22, top: 88, display: "grid", gap: 4, padding: "10px 12px", border: `1px solid ${line}`, borderRadius: 8, background: "rgba(8,13,24,.72)", backdropFilter: "blur(10px)", fontWeight: 900},
  propsOverlay: {position: "absolute", right: 344, top: 86, padding: "9px 11px", borderRadius: 8, border: `1px solid ${line}`, background: "rgba(250,204,21,.16)", color: "#fef3c7", fontWeight: 900},
  topChrome: {position: "absolute", top: 14, left: 14, right: 14, display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", transition: "opacity .22s ease", pointerEvents: "auto"},
  searchBar: {display: "flex", gap: 7, alignItems: "center", maxWidth: "min(760px,64vw)", padding: 6, borderRadius: 8, background: glass, border: `1px solid ${line}`, backdropFilter: "blur(12px)"},
  searchInput: {width: "min(330px,32vw)", minWidth: 120, padding: "10px 12px", borderRadius: 7, border: `1px solid ${line}`, background: "rgba(0,0,0,.46)", color: "white", fontWeight: 800, outline: "none"},
  hotButton: {padding: "10px 11px", borderRadius: 7, border: `1px solid ${line}`, background: "rgba(103,232,249,.16)", color: "#e0faff", fontWeight: 900, cursor: "pointer"},
  hotLink: {padding: "10px 11px", borderRadius: 7, border: `1px solid ${line}`, background: "rgba(255,255,255,.08)", color: "white", fontWeight: 900, textDecoration: "none"},
  accountButton: {padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(250,204,21,.36)", background: "rgba(113,63,18,.62)", color: "#fef3c7", fontWeight: 900, cursor: "pointer", textTransform: "capitalize"},
  libraryRail: {position: "absolute", top: 76, right: 14, bottom: 88, width: "min(330px,27vw)", minWidth: 250, display: "grid", gridTemplateRows: "auto repeat(4,minmax(0,1fr))", gap: 9, padding: 10, borderRadius: 8, border: `1px solid ${line}`, background: "rgba(2,6,23,.46)", backdropFilter: "blur(14px)", transition: "opacity .22s ease"},
  railHead: {display: "flex", justifyContent: "space-between", alignItems: "center", color: "#cffafe", fontWeight: 900, textTransform: "uppercase", fontSize: 12},
  smallGhost: {border: `1px solid ${line}`, background: "rgba(255,255,255,.08)", color: "white", borderRadius: 7, padding: "7px 9px", fontWeight: 900, cursor: "pointer"},
  feedCard: {minHeight: 0, display: "grid", gridTemplateColumns: "92px minmax(0,1fr)", gap: 9, alignItems: "stretch", padding: 7, borderRadius: 8, border: `1px solid ${line}`, background: "rgba(15,23,42,.62)", color: "white", textAlign: "left", cursor: "pointer", overflow: "hidden"},
  activeFeedCard: {minHeight: 0, display: "grid", gridTemplateColumns: "92px minmax(0,1fr)", gap: 9, alignItems: "stretch", padding: 7, borderRadius: 8, border: "1px solid rgba(103,232,249,.66)", background: "rgba(8,145,178,.24)", color: "white", textAlign: "left", cursor: "pointer", overflow: "hidden", boxShadow: "0 0 28px rgba(103,232,249,.16)"},
  cardVisual: {borderRadius: 7, overflow: "hidden", background: "#020617", minHeight: 74},
  cardViewer: {width: "100%", height: "100%", minHeight: 74, background: "#020617"},
  cardText: {display: "grid", gap: 5, alignContent: "center", minWidth: 0},
  bottomInfo: {position: "absolute", left: 22, bottom: 98, width: "min(620px,48vw)", display: "grid", gap: 7, transition: "opacity .22s ease"},
  eyebrow: {margin: 0, color: "#67e8f9", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0},
  title: {margin: 0, fontSize: "clamp(34px,6vw,78px)", lineHeight: .92, letterSpacing: 0, textShadow: "0 12px 40px rgba(0,0,0,.9)", overflowWrap: "anywhere"},
  note: {margin: 0, maxWidth: 560, color: "#dbeafe", fontSize: 15, lineHeight: 1.45, textShadow: "0 8px 24px rgba(0,0,0,.85)"},
  mediaControls: {position: "absolute", left: "50%", bottom: 18, transform: "translateX(-50%)", display: "flex", gap: 7, padding: 7, borderRadius: 8, border: `1px solid ${line}`, background: glass, backdropFilter: "blur(14px)", transition: "opacity .22s ease"},
  mediaButton: {padding: "10px 12px", borderRadius: 7, border: `1px solid ${line}`, background: "rgba(255,255,255,.08)", color: "white", fontWeight: 900, cursor: "pointer", whiteSpace: "nowrap"},
  activeMediaButton: {padding: "10px 12px", borderRadius: 7, border: "1px solid rgba(20,184,166,.6)", background: "rgba(20,184,166,.22)", color: "#dffdf8", fontWeight: 900, cursor: "pointer", whiteSpace: "nowrap"},
  utilityStrip: {position: "absolute", right: 14, bottom: 18, display: "flex", gap: 5, padding: 6, borderRadius: 8, border: `1px solid ${line}`, background: glass, backdropFilter: "blur(14px)", transition: "opacity .22s ease"},
  tinyAction: {fontSize: 11, padding: "8px 8px", borderRadius: 7, border: `1px solid ${line}`, background: "rgba(255,255,255,.07)", color: "#e2e8f0", fontWeight: 900, cursor: "pointer"},
  layerDock: {position: "absolute", left: 22, top: 76, transition: "opacity .22s ease"},
  layerButton: {padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(20,184,166,.44)", background: "rgba(20,184,166,.16)", color: "#dffdf8", fontWeight: 900, cursor: "pointer"},
  lockedLayerButton: {padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(250,204,21,.36)", background: "rgba(113,63,18,.62)", color: "#fef3c7", fontWeight: 900, cursor: "pointer"},
  layerMenu: {marginTop: 8, display: "grid", gap: 5, minWidth: 190, padding: 8, borderRadius: 8, border: `1px solid ${line}`, background: "rgba(2,6,23,.88)", backdropFilter: "blur(14px)"},
  layerOption: {padding: "9px 10px", borderRadius: 7, border: `1px solid ${line}`, background: "rgba(255,255,255,.06)", color: "white", fontWeight: 900, cursor: "pointer", textAlign: "left"},
  activeLayerOption: {padding: "9px 10px", borderRadius: 7, border: "1px solid rgba(103,232,249,.56)", background: "rgba(103,232,249,.16)", color: "white", fontWeight: 900, cursor: "pointer", textAlign: "left"},
  entryOverlay: {position: "fixed", inset: 0, zIndex: 50, display: "grid", placeItems: "center", padding: 18, background: "radial-gradient(circle at 50% 40%,rgba(229,9,20,.20),rgba(0,0,0,.92) 58%,#000 100%)", backdropFilter: "blur(12px)"},
  entryPanel: {width: "min(520px,92vw)", display: "grid", gap: 14, padding: 24, borderRadius: 8, border: `1px solid ${line}`, background: "rgba(2,6,23,.72)", boxShadow: "0 30px 90px rgba(0,0,0,.7)", textAlign: "center"},
  entryLogo: {fontSize: "clamp(38px,8vw,66px)", fontWeight: 900, letterSpacing: 0},
  loadLine: {height: 3, borderRadius: 999, overflow: "hidden", background: "rgba(255,255,255,.14)"},
  loadLineFill: {display: "block", width: "42%", height: "100%", borderRadius: 999, background: "#e50914", animation: "dhLoad 1.05s ease-in-out infinite"},
  entryText: {margin: 0, color: "#f8fafc", fontWeight: 900},
  welcome: {margin: 0, fontSize: "clamp(36px,7vw,60px)", lineHeight: 1, letterSpacing: 0},
  entryInput: {width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 8, border: `1px solid ${line}`, background: "rgba(0,0,0,.44)", color: "white", fontWeight: 900, outline: "none"},
  accountGrid: {display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 8},
  accountChoice: {minHeight: 48, borderRadius: 8, border: `1px solid ${line}`, background: "rgba(255,255,255,.07)", color: "white", fontWeight: 900, cursor: "pointer"},
  activeAccount: {minHeight: 48, borderRadius: 8, border: "1px solid rgba(103,232,249,.66)", background: "rgba(103,232,249,.16)", color: "white", fontWeight: 900, cursor: "pointer"},
  walletSlot: {display: "grid", justifyContent: "center"},
  entrySmall: {margin: 0, color: "#94a3b8", fontSize: 13, lineHeight: 1.45}
}

const styleTag = document.createElement("style")
styleTag.textContent = "@keyframes dhLoad{0%{transform:translateX(-80%);opacity:.35}55%{opacity:1}100%{transform:translateX(180%);opacity:.25}}@media(max-width:900px){.digitalhut-mobile-placeholder{display:block}}"
if(typeof document !== "undefined" && !document.querySelector("style[data-digitalhut-fullscreen]")){
  styleTag.setAttribute("data-digitalhut-fullscreen", "true")
  document.head.appendChild(styleTag)
}
