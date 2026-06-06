"use client"

import { useMemo, useState } from "react"
import DiscoverySnapshotVisual from "./DiscoverySnapshotVisual"
import UnifiedAppShell from "./UnifiedAppShell"
import UniversalFeedVisual from "./UniversalFeedVisual"
import library from "../data/platform-libraries.json"

const tourCategories = ["Continent", "Planetary", "Structure", "Animated Character", "Animated Environment"]
const layerOptions = ["Base", "Architect", "Lighting", "Props", "Grid", "Coordinates"]
const orbitModes = ["Manual", "Guided", "Ambient"]

function cleanSearchQuery(value) {
  return String(value || "")
    .replace(/\b(project\s*)?glb\b/gi, "")
    .replace(/\b3d\s*model\b/gi, "")
    .replace(/\b3d\b/gi, "")
    .replace(/\bobservatory\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()
}

function categoryForChoice(choice) {
  const text = `${choice.title || ""} ${choice.query || ""} ${choice.mood || ""}`.toLowerCase()
  if (/mars|moon|planet|space|lunar|solar|terrain/.test(text)) return "Planetary"
  if (/character|avatar|person|human|animated/.test(text)) return "Animated Character"
  if (/environment|forest|room|scene|world|landscape|garden/.test(text)) return "Animated Environment"
  if (/building|house|tower|street|bridge|city|structure|wall|architecture/.test(text)) return "Structure"
  return "Continent"
}

function buildChoiceFeed(choice) {
  const query = cleanSearchQuery(choice.query)
  const tourCategory = categoryForChoice(choice)
  return {
    id: `model-choice:${query}`,
    title: choice.title,
    category: choice.mood,
    tourCategory,
    clientType: choice.mood,
    source: "renderer-quick-option",
    previewImage: choice.previewImage,
    query,
    terrainUrl: query,
    visualDescription: choice.mood,
    agentNarration: `${choice.title}. ${choice.mood}`
  }
}

export default function ModelRotationChooser({ activeFeed, result, busy = false, onSelectFeed, subscription, onWallet }) {
  const [selectedCategory, setSelectedCategory] = useState("Structure")
  const [visibleCount, setVisibleCount] = useState(4)
  const [activeLayer, setActiveLayer] = useState("Base")
  const [orbitMode, setOrbitMode] = useState("Guided")
  const [guidePosition, setGuidePosition] = useState(36)
  const choices = library.modelChoices
  const liveUrl = activeFeed?.modelUrl || result?.result?.glbUrl || result?.result?.downloadUrl || ""
  const title = activeFeed?.title || result?.result?.title || choices[0]?.title || "DigitalHut model"
  const tier = subscription?.tier || activeFeed?.subscriptionTier || "free"
  const canDownloadGlb = ["premium", "pro"].includes(String(tier).toLowerCase())
  const visualFeed = {
    ...activeFeed,
    title,
    category: activeFeed?.category || choices[0]?.mood || "model-choice",
    clientType: activeFeed?.intent || activeFeed?.category || "3d-asset-buyer",
    visualMode: liveUrl ? "model" : activeFeed?.visualMode || "auto",
    modelUrl: liveUrl,
    previewImage: activeFeed?.previewImage || result?.result?.image || choices[0]?.previewImage || "",
    terrainUrl: activeFeed?.terrainUrl || activeFeed?.query || choices[0]?.query || "",
    query: activeFeed?.query || choices[0]?.query || "",
    marketSymbols: activeFeed?.marketSymbols || [],
    sourceApi: liveUrl ? "sketchfab-live" : activeFeed?.source || "model-choice",
    agentNarration: activeFeed?.agentNarration || title,
    visualDescription: activeFeed?.visualDescription || activeFeed?.context || "Active observatory renderer memory"
  }
  const choiceFeeds = useMemo(() => choices.map(buildChoiceFeed), [choices])
  const categoryFeeds = choiceFeeds.filter((feed) => feed.tourCategory === selectedCategory)
  const guidedFeeds = (categoryFeeds.length ? categoryFeeds : choiceFeeds).slice(0, visibleCount)

  function chooseCategory(category) {
    setSelectedCategory(category)
    setVisibleCount(4)
  }

  const renderer = <section style={styles.wrap} aria-labelledby="model-rotation-title">
    <div style={styles.header}>
      <div style={styles.titleBlock}>
        <p style={styles.eyebrow}>Active renderer</p>
        <h2 id="model-rotation-title" style={styles.title}>{title}</h2>
      </div>
      <div style={styles.statusPills}>
        <span style={styles.pill}>{busy ? "scanning" : liveUrl ? "live glb" : "preview"}</span>
        <span style={styles.pill}>{activeLayer}</span>
        <span style={styles.pill}>{orbitMode}</span>
      </div>
    </div>

    <div style={styles.stageGrid}>
      <div style={styles.primaryStage}>
        <div style={styles.viewer}>
          <UniversalFeedVisual activeFeed={visualFeed} scope="rotation" />
          <RendererHud activeLayer={activeLayer} orbitMode={orbitMode} guidePosition={guidePosition} />
        </div>
        <RendererControls
          guidePosition={guidePosition}
          setGuidePosition={setGuidePosition}
          activeLayer={activeLayer}
          setActiveLayer={setActiveLayer}
          orbitMode={orbitMode}
          setOrbitMode={setOrbitMode}
          canDownloadGlb={canDownloadGlb}
          liveUrl={liveUrl}
        />
      </div>

      <div style={styles.quickRail} aria-label="Featured guided tour options">
        <div style={styles.categoryTabs}>
          {tourCategories.map((category) => <button key={category} type="button" onClick={() => chooseCategory(category)} style={selectedCategory === category ? styles.activeTab : styles.tab}>{category}</button>)}
        </div>
        <div style={styles.quickHeading}>Featured guided tour</div>
        <div style={styles.choices}>
          {guidedFeeds.map((choiceFeed) => {
            const selected = activeFeed?.query === choiceFeed.query || activeFeed?.title === choiceFeed.title
            return <button
              key={`${choiceFeed.tourCategory}:${choiceFeed.title}`}
              type="button"
              onPointerEnter={() => onSelectFeed?.(choiceFeed, { speak: false, scan: false })}
              onFocus={() => onSelectFeed?.(choiceFeed, { speak: false, scan: false })}
              onClick={() => onSelectFeed?.(choiceFeed, { speak: true, scan: true })}
              style={selected ? styles.activeChoice : styles.choice}
            >
              <b>{choiceFeed.title}</b>
              <span>{choiceFeed.tourCategory}</span>
            </button>
          })}
        </div>
        <button type="button" onClick={() => setVisibleCount((count) => count + 4)} style={styles.loadMore}>Load 4 More</button>
      </div>
    </div>
  </section>

  return (
    <UnifiedAppShell
      activeFeed={visualFeed}
      subscription={subscription || { tier }}
      libraryFeeds={choiceFeeds}
      onSelectFeed={onSelectFeed}
      onWallet={onWallet}
    >
      {renderer}
    </UnifiedAppShell>
  )
}

function RendererControls({ guidePosition, setGuidePosition, activeLayer, setActiveLayer, orbitMode, setOrbitMode, canDownloadGlb, liveUrl }) {
  return <div style={styles.controlDeck}>
    <label style={styles.sliderWrap}>
      <span>Guided tour</span>
      <input type="range" min="0" max="100" value={guidePosition} onChange={(event) => setGuidePosition(event.target.value)} style={styles.slider} />
    </label>
    <div style={styles.modeRow}>
      {orbitModes.map((mode) => <button key={mode} type="button" onClick={() => setOrbitMode(mode)} style={orbitMode === mode ? styles.activeControl : styles.control}>{mode}</button>)}
    </div>
    <div style={styles.layerRow}>
      {layerOptions.map((layer) => <button key={layer} type="button" onClick={() => setActiveLayer(layer)} style={activeLayer === layer ? styles.activeControl : styles.control}>{layer}</button>)}
    </div>
    <a href={canDownloadGlb && liveUrl ? liveUrl : undefined} download style={canDownloadGlb && liveUrl ? styles.downloadReady : styles.downloadLocked}>{canDownloadGlb ? "Download GLB" : "Premium GLB"}</a>
  </div>
}

function RendererHud({ activeLayer, orbitMode, guidePosition }) {
  return <div style={styles.hud}>
    <div style={styles.compass}>N</div>
    <div style={styles.coordinates}>X:{guidePosition} / Y:{100 - Number(guidePosition || 0)} / Z:{activeLayer === "Architect" ? "AXON" : "ORBIT"}</div>
    <div style={styles.gridHud}>Grid: on / Compass: on / Orbit: {orbitMode}</div>
    {activeLayer === "Architect" && <div style={styles.architectNote}>Architect Layer: builder structure, developer inspection, researcher mapping, AI analysis, experimental mode.</div>}
    {activeLayer === "Lighting" && <div style={styles.architectNote}>Lighting Layer: exposure, shadows, material read, presentation mode.</div>}
    {activeLayer === "Props" && <div style={styles.architectNote}>Props Layer: scene objects, scale references, interactive staging.</div>}
  </div>
}

const styles = {
  wrap: { width: "100%", height: "100%", minHeight: 0, margin: 0, padding: 10, border: "1px solid rgba(45,212,191,.24)", borderRadius: 8, background: "linear-gradient(135deg,rgba(2,6,23,.96),rgba(8,47,73,.7))", boxSizing: "border-box", display: "grid", gridTemplateRows: "auto minmax(0,1fr)", gap: 8, overflow: "hidden" },
  header: { display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", minHeight: 34 },
  titleBlock: { minWidth: 0, display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" },
  eyebrow: { margin: 0, color: "#67e8f9", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0, whiteSpace: "nowrap" },
  title: { margin: 0, fontSize: "clamp(20px,2.6vw,34px)", lineHeight: 1.02, letterSpacing: 0, maxWidth: 980, overflowWrap: "anywhere" },
  statusPills: { display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" },
  pill: { fontSize: 11, padding: "6px 9px", borderRadius: 999, background: "rgba(103,232,249,.12)", color: "#a5f3fc", fontWeight: 900, textTransform: "capitalize", whiteSpace: "nowrap" },
  stageGrid: { minHeight: 0, height: "100%", display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(178px,244px)", gap: 10, alignItems: "stretch", overflow: "hidden" },
  primaryStage: { minWidth: 0, minHeight: 0, height: "100%", display: "grid", gridTemplateRows: "minmax(0,1fr) auto", gap: 8, overflow: "hidden" },
  viewer: { position: "relative", minWidth: 0, minHeight: 0, height: "100%", borderRadius: 8, overflow: "hidden", background: "#020617" },
  quickRail: { minWidth: 0, maxHeight: "100%", display: "grid", gridTemplateRows: "auto auto minmax(0,1fr) auto", gap: 8, alignContent: "start", overflow: "hidden" },
  categoryTabs: { display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 6 },
  tab: { minHeight: 34, borderRadius: 8, border: "1px solid rgba(148,163,184,.2)", background: "rgba(2,6,23,.36)", color: "white", fontSize: 11, fontWeight: 900, cursor: "pointer" },
  activeTab: { minHeight: 34, borderRadius: 8, border: "1px solid rgba(45,212,191,.52)", background: "rgba(20,184,166,.18)", color: "white", fontSize: 11, fontWeight: 900, cursor: "pointer" },
  quickHeading: { color: "#a5f3fc", fontSize: 12, fontWeight: 900, textTransform: "uppercase" },
  choices: { minHeight: 0, overflow: "auto", display: "grid", gap: 7, alignContent: "start" },
  choice: { minWidth: 0, textAlign: "left", padding: 9, borderRadius: 8, border: "1px solid rgba(148,163,184,.2)", background: "rgba(2,6,23,.36)", color: "white", display: "grid", gap: 4, cursor: "pointer" },
  activeChoice: { minWidth: 0, textAlign: "left", padding: 9, borderRadius: 8, border: "1px solid rgba(45,212,191,.5)", background: "rgba(20,184,166,.16)", color: "white", display: "grid", gap: 4, cursor: "pointer" },
  loadMore: { padding: "10px 11px", borderRadius: 8, border: "1px solid rgba(226,232,240,.22)", background: "rgba(226,232,240,.08)", color: "white", fontWeight: 900, cursor: "pointer" },
  controlDeck: { display: "grid", gridTemplateColumns: "minmax(180px,1fr) auto auto auto", gap: 8, alignItems: "center", padding: 8, border: "1px solid rgba(148,163,184,.2)", borderRadius: 8, background: "rgba(2,6,23,.58)", overflow: "hidden" },
  sliderWrap: { display: "grid", gap: 4, color: "#dbeafe", fontSize: 12, fontWeight: 900 },
  slider: { width: "100%" },
  modeRow: { display: "flex", gap: 5, flexWrap: "wrap" },
  layerRow: { display: "flex", gap: 5, flexWrap: "wrap" },
  control: { padding: "8px 9px", borderRadius: 8, border: "1px solid rgba(148,163,184,.2)", background: "rgba(15,23,42,.72)", color: "white", fontSize: 11, fontWeight: 900, cursor: "pointer" },
  activeControl: { padding: "8px 9px", borderRadius: 8, border: "1px solid rgba(45,212,191,.5)", background: "rgba(20,184,166,.18)", color: "white", fontSize: 11, fontWeight: 900, cursor: "pointer" },
  downloadReady: { padding: "9px 10px", borderRadius: 8, background: "#facc15", color: "#1f1300", fontSize: 12, fontWeight: 900, textDecoration: "none", whiteSpace: "nowrap" },
  downloadLocked: { padding: "9px 10px", borderRadius: 8, background: "rgba(250,204,21,.12)", color: "#fde68a", border: "1px solid rgba(250,204,21,.24)", fontSize: 12, fontWeight: 900, textDecoration: "none", whiteSpace: "nowrap" },
  hud: { pointerEvents: "none", position: "absolute", inset: 0, zIndex: 3, color: "#dff8ff", fontSize: 12, fontWeight: 900 },
  compass: { position: "absolute", top: 12, right: 12, width: 42, height: 42, borderRadius: "50%", border: "1px solid rgba(103,232,249,.45)", background: "rgba(2,6,23,.58)", display: "grid", placeItems: "center" },
  coordinates: { position: "absolute", left: 12, bottom: 12, padding: "8px 10px", borderRadius: 8, background: "rgba(2,6,23,.62)", border: "1px solid rgba(103,232,249,.22)" },
  gridHud: { position: "absolute", right: 12, bottom: 12, padding: "8px 10px", borderRadius: 8, background: "rgba(2,6,23,.62)", border: "1px solid rgba(103,232,249,.22)" },
  architectNote: { position: "absolute", left: 12, top: 58, maxWidth: 420, padding: "8px 10px", borderRadius: 8, background: "rgba(2,6,23,.7)", border: "1px solid rgba(250,204,21,.28)", color: "#fde68a" }
}
