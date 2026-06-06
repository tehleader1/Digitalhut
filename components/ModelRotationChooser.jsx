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
    source: "renderer-quick-option",
    previewImage: choice.previewImage,
    query,
    terrainUrl: query,
    visualDescription: choice.mood,
    agentNarration: `${choice.title}. ${choice.mood}`
  }
}

export default function ModelRotationChooser({ activeFeed, result, busy = false, onSelectFeed, subscription, onWallet }) {
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
      <div style={styles.titleBlock}>
        <p style={styles.eyebrow}>Active renderer</p>
        <h2 id="model-rotation-title" style={styles.title}>{title}</h2>
      </div>
      <span style={styles.pill}>{busy ? "scanning" : activeFeed?.category || "model"}</span>
    </div>
    <div style={styles.stageGrid}>
      <div style={styles.primaryStage}>
        <div style={styles.viewer}><UniversalFeedVisual activeFeed={visualFeed} scope="rotation" /></div>
      </div>
      <div style={styles.quickRail} aria-label="Renderer quick options">
        <div style={styles.quickPreview}>
          <DiscoverySnapshotVisual feed={visualFeed} scope="active preview" compact />
        </div>
        <div style={styles.quickHeading}>Quick options</div>
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
              <b>{choiceFeed.title}</b>
              <span>{choiceFeed.category}</span>
            </button>
          })}
        </div>
      </div>
    </div>
  </section>

  return (
    <UnifiedAppShell
      activeFeed={visualFeed}
      subscription={subscription || { tier: activeFeed?.subscriptionTier || "free" }}
      libraryFeeds={choiceFeeds}
      onSelectFeed={onSelectFeed}
      onWallet={onWallet}
    >
      {renderer}
    </UnifiedAppShell>
  )
}

const styles = {
  wrap: { width: "100%", height: "100%", minHeight: 0, margin: 0, padding: 10, border: "1px solid rgba(45,212,191,.24)", borderRadius: 8, background: "linear-gradient(135deg,rgba(2,6,23,.96),rgba(8,47,73,.7))", boxSizing: "border-box", display: "grid", gridTemplateRows: "auto minmax(0,1fr)", gap: 8, overflow: "hidden" },
  header: { display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", minHeight: 34 },
  titleBlock: { minWidth: 0, display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" },
  eyebrow: { margin: 0, color: "#67e8f9", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0, whiteSpace: "nowrap" },
  title: { margin: 0, fontSize: "clamp(20px,2.6vw,34px)", lineHeight: 1.02, letterSpacing: 0, maxWidth: 980, overflowWrap: "anywhere" },
  pill: { fontSize: 11, padding: "6px 9px", borderRadius: 999, background: "rgba(103,232,249,.12)", color: "#a5f3fc", fontWeight: 900, textTransform: "capitalize", whiteSpace: "nowrap" },
  stageGrid: { minHeight: 0, height: "100%", display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(176px,230px)", gap: 10, alignItems: "stretch", overflow: "hidden" },
  primaryStage: { minWidth: 0, minHeight: 0, height: "100%", overflow: "hidden" },
  viewer: { minWidth: 0, minHeight: 0, height: "100%", borderRadius: 8, overflow: "hidden", background: "#020617" },
  quickRail: { minWidth: 0, maxHeight: "100%", display: "grid", gridTemplateRows: "auto auto minmax(0,1fr)", gap: 8, alignContent: "start", overflow: "hidden" },
  quickPreview: { minHeight: 92, borderRadius: 8, overflow: "hidden", border: "1px solid rgba(148,163,184,.2)", background: "rgba(2,6,23,.45)" },
  quickHeading: { color: "#a5f3fc", fontSize: 12, fontWeight: 900, textTransform: "uppercase" },
  choices: { minHeight: 0, overflow: "auto", display: "grid", gap: 7, alignContent: "start" },
  choice: { minWidth: 0, textAlign: "left", padding: 9, borderRadius: 8, border: "1px solid rgba(148,163,184,.2)", background: "rgba(2,6,23,.36)", color: "white", display: "grid", gap: 4, cursor: "pointer" },
  activeChoice: { minWidth: 0, textAlign: "left", padding: 9, borderRadius: 8, border: "1px solid rgba(45,212,191,.5)", background: "rgba(20,184,166,.16)", color: "white", display: "grid", gap: 4, cursor: "pointer" }
}
