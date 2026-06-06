"use client"

import DiscoverySnapshotVisual from "./DiscoverySnapshotVisual"
import UnifiedAppShell from "./UnifiedAppShell"
import UniversalFeedVisual from "./UniversalFeedVisual"
import library from "../data/platform-libraries.json"

function cleanSearchQuery(value) {
  return String(value || "")
    .replace(/\b(project\s*)?glb\b/gi, "")
    .replace(/\b3d\s*model\b/gi, "")
    .replace(/\b3d\b/gi, "")
    .replace(/\bobservatory\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()
}

function buildChoiceFeed(choice) {
  const query = cleanSearchQuery(choice.query)
  return {
    id: `model-choice:${query}`,
    title: choice.title,
    category: choice.mood,
    clientType: choice.mood,
    source: "recent-search-example",
    previewImage: choice.previewImage,
    query,
    terrainUrl: query,
    visualDescription: choice.mood,
    agentNarration: `${choice.title}. ${choice.mood}`
  }
}

export default function ModelRotationChooser({ activeFeed, result, busy = false, onSelectFeed }) {
  const choices = library.modelChoices
  const liveUrl = activeFeed?.modelUrl || result?.result?.glbUrl || result?.result?.downloadUrl || ""
  const title = activeFeed?.title || result?.result?.title || choices[0]?.title || "DigitalHut model"
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
  const choiceFeeds = choices.map(buildChoiceFeed)

  const renderer = <section style={styles.wrap} aria-labelledby="model-rotation-title">
    <div style={styles.header}>
      <div>
        <p style={styles.eyebrow}>Fullscreen observatory renderer</p>
        <h2 id="model-rotation-title" style={styles.title}>{title}</h2>
      </div>
      <span style={styles.pill}>{busy ? "scanning" : activeFeed?.category || "model"}</span>
    </div>
    <div style={styles.stageGrid}>
      <div style={styles.primaryStage}>
        <div style={styles.rendererLabel}>Observatory renderer A</div>
        <div style={styles.viewer}><UniversalFeedVisual activeFeed={visualFeed} scope="rotation" /></div>
      </div>
      <div style={styles.sideRail}>
        <div style={styles.secondaryStage}>
          <div style={styles.rendererLabel}>Observatory renderer B</div>
          <DiscoverySnapshotVisual feed={visualFeed} scope="observatory renderer" />
        </div>
        <div style={styles.choices}>
          {choiceFeeds.map((choiceFeed) => {
            const selected = activeFeed?.query === choiceFeed.query || activeFeed?.title === choiceFeed.title
            return <button
              key={choiceFeed.title}
              type="button"
              onPointerEnter={() => onSelectFeed?.(choiceFeed, { speak: false, scan: false })}
              onFocus={() => onSelectFeed?.(choiceFeed, { speak: false, scan: false })}
              onClick={() => onSelectFeed?.(choiceFeed, { speak: true, scan: true })}
              style={selected ? styles.activeChoice : styles.choice}
            >
              <DiscoverySnapshotVisual feed={choiceFeed} scope="recent search preview" compact />
              <b>{choiceFeed.title}</b>
              <span>{choiceFeed.category}</span>
              <small style={styles.queryLine}>Search: {choiceFeed.query}</small>
            </button>
          })}
        </div>
      </div>
    </div>
  </section>

  return (
    <UnifiedAppShell
      activeFeed={visualFeed}
      subscription={{ tier: activeFeed?.subscriptionTier || "free" }}
      libraryFeeds={choiceFeeds}
      onSelectFeed={onSelectFeed}
    >
      {renderer}
    </UnifiedAppShell>
  )
}

const styles = {
  wrap: { width: "100%", margin: 0, padding: 18, border: "1px solid rgba(45,212,191,.28)", borderRadius: 8, background: "linear-gradient(135deg,rgba(2,6,23,.96),rgba(8,47,73,.72))", boxSizing: "border-box" },
  header: { display: "flex", justifyContent: "space-between", gap: 14, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 16 },
  eyebrow: { margin: "0 0 8px", color: "#67e8f9", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0 },
  title: { margin: 0, fontSize: "clamp(26px,4vw,46px)", lineHeight: 1.06, letterSpacing: 0, maxWidth: 980, overflowWrap: "anywhere" },
  pill: { fontSize: 12, padding: "7px 10px", borderRadius: 999, background: "rgba(103,232,249,.12)", color: "#a5f3fc", fontWeight: 900, textTransform: "capitalize" },
  stageGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: 16, alignItems: "stretch" },
  primaryStage: { minWidth: 0, minHeight: "min(72vh,760px)", display: "grid", gridTemplateRows: "auto 1fr", gap: 8 },
  secondaryStage: { minWidth: 0, display: "grid", gap: 8 },
  sideRail: { minWidth: 0, display: "grid", gap: 14, alignContent: "start" },
  rendererLabel: { color: "#a5f3fc", fontSize: 12, fontWeight: 900, textTransform: "uppercase" },
  viewer: { minWidth: 0, minHeight: "min(68vh,720px)", borderRadius: 8, overflow: "hidden", background: "#020617" },
  choices: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,180px),1fr))", gap: 10, alignContent: "start" },
  choice: { minWidth: 0, textAlign: "left", padding: 12, borderRadius: 8, border: "1px solid rgba(148,163,184,.22)", background: "rgba(2,6,23,.42)", color: "white", display: "grid", gap: 7, cursor: "pointer" },
  activeChoice: { minWidth: 0, textAlign: "left", padding: 12, borderRadius: 8, border: "1px solid rgba(45,212,191,.45)", background: "rgba(20,184,166,.14)", color: "white", display: "grid", gap: 7, cursor: "pointer" },
  queryLine: { color: "#bae6fd", fontSize: 11, fontWeight: 900, overflowWrap: "anywhere" }
}
