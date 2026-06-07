import React, {useEffect, useMemo, useRef, useState} from "react"
import "@google/model-viewer"
import {ConnectButton} from "../wallet"

const INACTIVITY_MS = 8 * 60 * 1000
const layers = ["Base", "Architect", "Lighting", "Props", "Grid", "Coordinates"]
const accounts = ["guest", "standard", "premium", "pro"]

const feeds = [
  ["Wall Street New York", "Structure", "/glbs/new_york_city._manhattan.glb", "Financial district, city structure, and market-context observatory."],
  ["California Hollywood", "Continent", "/glbs/hollywood_sign_los_angeles_ca_usa.glb", "Public culture signal with city terrain and tourism context."],
  ["International Space Station", "Planetary", "/glbs/international_space_station.glb", "Orbital research feed for space, engineering, and education."],
  ["Surfside Florida", "Structure", "/glbs/surfside_florida_usa_beachfront_properties.glb", "Coastal structure, real estate, terrain, and climate inspection."],
  ["Cape Town South Africa", "Continent", "/glbs/cape_town_-_south_africa.glb", "Civic geography, terrain contrast, and global travel feed."],
  ["Moon Observatory", "Planetary", "/glbs/moon.glb", "Planetary science, classroom, research, and exploration mode."],
  ["Caribbean Colonial Zone", "Animated Environment", "/glbs/tourist_colonial_zone_dominican_republic.glb", "Tourism, history, culture, and guided public exploration."],
  ["City Pack Prototype", "Animated Character", "/glbs/city_pack_7.glb", "Prototype city kit for builders, developers, AIs, and experiments."]
].map(([title, region, model, note]) => ({title, region, model, note}))

function freshEntry(){
  if(typeof window === "undefined") return false
  const last = Number(window.localStorage.getItem("digitalhut:lastAccountEntry") || 0)
  return last > 0 && Date.now() - last < INACTIVITY_MS
}

export default function FullscreenObservatory(){
  const [active, setActive] = useState(0)
  const [query, setQuery] = useState("wall street new york")
  const [tier, setTier] = useState("guest")
  const [username, setUsername] = useState("")
  const [entryOpen, setEntryOpen] = useState(true)
  const [entryLoading, setEntryLoading] = useState(false)
  const [awake, setAwake] = useState(true)
  const [manual, setManual] = useState(false)
  const [playing, setPlaying] = useState(true)
  const [offset, setOffset] = useState(0)
  const [layer, setLayer] = useState("Base")
  const [layerOpen, setLayerOpen] = useState(false)
  const hideTimer = useRef(null)

  const feed = feeds[active] || feeds[0]
  const paid = ["premium", "pro"].includes(tier)
  const railFeeds = useMemo(() => [...feeds, ...feeds].slice(offset, offset + 4), [offset])

  useEffect(() => {
    if(typeof window === "undefined") return
    setTier(window.localStorage.getItem("digitalhut:tier") || "guest")
    setUsername(window.localStorage.getItem("digitalhut:username") || "")
    setEntryOpen(!freshEntry())
  }, [])

  useEffect(() => {
    if(entryOpen || manual || !playing) return
    const timer = window.setInterval(() => setActive((current) => (current + 1) % feeds.length), awake ? 11000 : 16000)
    return () => window.clearInterval(timer)
  }, [entryOpen, manual, playing, awake])

  function wake(){
    setAwake(true)
    window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => setAwake(false), 2400)
  }

  function enter(nextTier = tier){
    setTier(nextTier)
    setEntryLoading(true)
    window.setTimeout(() => {
      window.localStorage.setItem("digitalhut:lastAccountEntry", String(Date.now()))
      window.localStorage.setItem("digitalhut:tier", nextTier)
      window.localStorage.setItem("digitalhut:username", username || "Guest")
      setEntryLoading(false)
      setEntryOpen(false)
      wake()
    }, 1050)
  }

  function choose(item){
    const index = feeds.findIndex((candidate) => candidate.title === item.title)
    if(index >= 0) setActive(index)
    setQuery(item.title)
    setManual(true)
    wake()
  }

  function scan(){
    const term = query.toLowerCase()
    const found = feeds.findIndex((item) => `${item.title} ${item.region} ${item.note}`.toLowerCase().includes(term))
    setActive(found >= 0 ? found : (active + 1) % feeds.length)
    setManual(true)
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

  function shift(amount){
    setOffset((current) => (current + amount + feeds.length) % feeds.length)
    wake()
  }

  function step(amount){
    setActive((current) => (current + amount + feeds.length) % feeds.length)
    setManual(true)
    wake()
  }

  function action(label){
    if(label === "Save") window.localStorage.setItem("digitalhut:savedFeed", JSON.stringify(feed))
    if(label === "Share" && navigator.share) navigator.share({title: feed.title, text: feed.note, url: window.location.href}).catch(() => null)
    if(label === "Embed" && navigator.clipboard) navigator.clipboard.writeText(`<iframe src="${window.location.origin}/viewer.html?model=${feed.model}"></iframe>`).catch(() => null)
    if(label === "Download") paid ? window.open(feed.model, "_blank") : setEntryOpen(true)
    if(label === "Related") shift(4)
    wake()
  }

  return <main onPointerMove={wake} onPointerDown={wake} style={s.page}>
    <style>{"@keyframes dhLoad{0%{transform:translateX(-80%);opacity:.35}55%{opacity:1}100%{transform:translateX(180%);opacity:.25}}"}</style>
    <section style={s.stage}>
      <model-viewer key={`${feed.model}:${playing}:${layer}`} src={feed.model} camera-controls auto-rotate={playing && !manual ? "" : undefined} autoplay shadow-intensity="1" exposure={layer === "Lighting" ? "1.35" : "1"} style={s.viewer} />
      <div style={s.vignette} />
      <div style={layer === "Grid" || layer === "Coordinates" ? s.grid : s.hidden} />
      <div style={layer === "Architect" ? s.architect : s.hidden}><b>Architect Layer</b><span>builders / developers / researchers / AIs / experimental</span></div>
      <div style={layer === "Props" ? s.props : s.hidden}>Props layer active</div>

      <div style={{...s.top, opacity: awake ? 1 : 0.08}}>
        <div style={s.search}>
          <input value={query} onChange={(event) => setQuery(event.target.value)} onFocus={wake} placeholder="Search observatory feed..." style={s.input} />
          <button onClick={scan} style={s.hot}>Scan</button>
          <button onClick={voice} style={s.hot}>Voice</button>
          <a href="/library" style={s.link}>Feed</a>
          <a href="/insights" style={s.link}>Market</a>
        </div>
        <button onClick={() => setEntryOpen(true)} style={s.account}>{username || "Choose account"} / {tier}</button>
      </div>

      <aside style={{...s.rail, opacity: awake ? 1 : 0.18}}>
        <div style={s.railHead}><span>Library</span><button onClick={() => shift(4)} style={s.small}>Load 4</button></div>
        {railFeeds.map((item) => <button key={`${item.title}:${offset}`} onPointerEnter={() => choose(item)} onFocus={() => choose(item)} onClick={() => choose(item)} style={item.title === feed.title ? s.activeCard : s.card}>
          <div style={s.visual}><model-viewer src={item.model} auto-rotate interaction-prompt="none" camera-orbit="0deg 70deg 3m" style={s.cardViewer} /></div>
          <div style={s.cardText}><b>{item.title}</b><small>{item.region}</small></div>
        </button>)}
      </aside>

      <div style={{...s.info, opacity: awake ? 1 : 0.16}}><p style={s.eyebrow}>Active feed</p><h1 style={s.title}>{feed.title}</h1><p style={s.note}>{feed.note}</p></div>

      <div style={{...s.media, opacity: awake ? 1 : 0.12}}>
        <button onClick={() => setPlaying((value) => !value)} style={s.mediaBtn}>{playing ? "Pause" : "Resume"}</button>
        <button onClick={() => step(-1)} style={s.mediaBtn}>Back 10s</button>
        <button onClick={() => step(1)} style={s.mediaBtn}>Forward 10s</button>
        <button onClick={() => shift(4)} style={s.mediaBtn}>Switch Tour</button>
        <button onClick={() => setManual((value) => !value)} style={manual ? s.mediaActive : s.mediaBtn}>{manual ? "Manual On" : "Manual Mode"}</button>
      </div>

      <div style={{...s.utility, opacity: awake ? 1 : 0.1}}>{["Save", "Share", "Embed", "Download", "Comment", "Related"].map((label) => <button key={label} onClick={() => action(label)} style={s.tiny}>{label}</button>)}</div>

      <div style={{...s.layerDock, opacity: awake ? 1 : 0.12}}>
        <button onClick={() => paid ? setLayerOpen((value) => !value) : setEntryOpen(true)} style={paid ? s.layerBtn : s.locked}> {paid ? `Smart Layers: ${layer}` : "Smart Layers: Premium / Pro"}</button>
        {layerOpen && paid && <div style={s.layerMenu}>{layers.map((item) => <button key={item} onClick={() => {setLayer(item); setLayerOpen(false); wake()}} style={item === layer ? s.layerActive : s.layerOption}>{item}</button>)}</div>}
      </div>
    </section>

    {entryOpen && <section style={s.entry}>
      <div style={s.entryPanel}>
        {entryLoading ? <><div style={s.logo}>DigitalHut</div><div style={s.load}><span style={s.loadFill} /></div><p style={s.entryText}>Loading your observatory system</p></> : <>
          <p style={s.eyebrow}>Choose account</p><h2 style={s.welcome}>Welcome!</h2>
          <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Username Account" style={s.entryInput} />
          <div style={s.accountGrid}>{accounts.map((item) => <button key={item} onClick={() => enter(item)} style={tier === item ? s.accountActive : s.accountChoice}>{item.toUpperCase()}</button>)}</div>
          <div style={s.wallet}><ConnectButton /></div>
          <p style={s.entrySmall}>This entry returns after about 8 minutes away, so the app feels like you are entering the system again.</p>
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
  viewer: {position: "absolute", inset: 0, width: "100%", height: "100%", background: "#000"},
  vignette: {position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(circle at 42% 42%,transparent 0,rgba(0,0,0,.05) 42%,rgba(0,0,0,.72) 100%),linear-gradient(90deg,rgba(0,0,0,.62),transparent 20%,transparent 70%,rgba(0,0,0,.72))"},
  hidden: {display: "none"},
  grid: {position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(103,232,249,.16) 1px,transparent 1px),linear-gradient(90deg,rgba(103,232,249,.16) 1px,transparent 1px)", backgroundSize: "52px 52px", mixBlendMode: "screen", opacity: .55},
  architect: {position: "absolute", left: 22, top: 88, display: "grid", gap: 4, padding: "10px 12px", border: `1px solid ${line}`, borderRadius: 8, background: "rgba(8,13,24,.72)", backdropFilter: "blur(10px)"},
  props: {position: "absolute", right: 344, top: 86, padding: "9px 11px", borderRadius: 8, border: `1px solid ${line}`, background: "rgba(250,204,21,.16)", color: "#fef3c7", fontWeight: 900},
  top: {position: "absolute", top: 14, left: 14, right: 14, display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", transition: "opacity .22s ease"},
  search: {display: "flex", gap: 7, alignItems: "center", maxWidth: "min(760px,64vw)", padding: 6, borderRadius: 8, background: glass, border: `1px solid ${line}`, backdropFilter: "blur(12px)"},
  input: {width: "min(330px,32vw)", minWidth: 120, padding: "10px 12px", borderRadius: 7, border: `1px solid ${line}`, background: "rgba(0,0,0,.46)", color: "white", fontWeight: 800, outline: "none"},
  hot: {...button, padding: "10px 11px", background: "rgba(103,232,249,.16)", color: "#e0faff"},
  link: {...button, padding: "10px 11px", background: "rgba(255,255,255,.08)", textDecoration: "none"},
  account: {...button, padding: "10px 12px", border: "1px solid rgba(250,204,21,.36)", background: "rgba(113,63,18,.62)", color: "#fef3c7", textTransform: "capitalize"},
  rail: {position: "absolute", top: 76, right: 14, bottom: 88, width: "min(330px,27vw)", minWidth: 250, display: "grid", gridTemplateRows: "auto repeat(4,minmax(0,1fr))", gap: 9, padding: 10, borderRadius: 8, border: `1px solid ${line}`, background: "rgba(2,6,23,.46)", backdropFilter: "blur(14px)", transition: "opacity .22s ease"},
  railHead: {display: "flex", justifyContent: "space-between", alignItems: "center", color: "#cffafe", fontWeight: 900, textTransform: "uppercase", fontSize: 12},
  small: {...button, padding: "7px 9px", background: "rgba(255,255,255,.08)"},
  card: {display: "grid", gridTemplateColumns: "92px minmax(0,1fr)", gap: 9, padding: 7, borderRadius: 8, border: `1px solid ${line}`, background: "rgba(15,23,42,.62)", color: "white", textAlign: "left", cursor: "pointer", overflow: "hidden"},
  activeCard: {display: "grid", gridTemplateColumns: "92px minmax(0,1fr)", gap: 9, padding: 7, borderRadius: 8, border: "1px solid rgba(103,232,249,.66)", background: "rgba(8,145,178,.24)", color: "white", textAlign: "left", cursor: "pointer", overflow: "hidden", boxShadow: "0 0 28px rgba(103,232,249,.16)"},
  visual: {borderRadius: 7, overflow: "hidden", background: "#020617", minHeight: 74},
  cardViewer: {width: "100%", height: "100%", minHeight: 74, background: "#020617"},
  cardText: {display: "grid", gap: 5, alignContent: "center", minWidth: 0},
  info: {position: "absolute", left: 22, bottom: 98, width: "min(620px,48vw)", display: "grid", gap: 7, transition: "opacity .22s ease"},
  eyebrow: {margin: 0, color: "#67e8f9", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0},
  title: {margin: 0, fontSize: "clamp(34px,6vw,78px)", lineHeight: .92, letterSpacing: 0, textShadow: "0 12px 40px rgba(0,0,0,.9)", overflowWrap: "anywhere"},
  note: {margin: 0, maxWidth: 560, color: "#dbeafe", fontSize: 15, lineHeight: 1.45, textShadow: "0 8px 24px rgba(0,0,0,.85)"},
  media: {position: "absolute", left: "50%", bottom: 18, transform: "translateX(-50%)", display: "flex", gap: 7, padding: 7, borderRadius: 8, border: `1px solid ${line}`, background: glass, backdropFilter: "blur(14px)", transition: "opacity .22s ease"},
  mediaBtn: {...button, padding: "10px 12px", background: "rgba(255,255,255,.08)", whiteSpace: "nowrap"},
  mediaActive: {...button, padding: "10px 12px", border: "1px solid rgba(20,184,166,.6)", background: "rgba(20,184,166,.22)", color: "#dffdf8", whiteSpace: "nowrap"},
  utility: {position: "absolute", right: 14, bottom: 18, display: "flex", gap: 5, padding: 6, borderRadius: 8, border: `1px solid ${line}`, background: glass, backdropFilter: "blur(14px)", transition: "opacity .22s ease"},
  tiny: {...button, fontSize: 11, padding: "8px 8px", background: "rgba(255,255,255,.07)", color: "#e2e8f0"},
  layerDock: {position: "absolute", left: 22, top: 76, transition: "opacity .22s ease"},
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
