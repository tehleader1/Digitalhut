"use client"

import DiscoverySnapshotVisual from "./DiscoverySnapshotVisual"
import UniversalFeedVisual from "./UniversalFeedVisual"
import library from "../data/platform-libraries.json"

export default function ModelRotationChooser({ activeFeed, result, busy = false, onSelectFeed }) {
  const choices = library.modelChoices
  const liveUrl = activeFeed?.modelUrl || result?.result?.glbUrl || result?.result?.downloadUrl || ""
  const title = activeFeed?.title || result?.result?.title || choices[0]?.title || "DigitalHut model"
  const visualFeed = {
    title,
    category: activeFeed?.category || choices[0]?.mood || "model-choice",
    clientType: activeFeed?.intent || activeFeed?.category || "3d-asset-buyer",
    visualMode: liveUrl ? "model" : "auto",
    modelUrl: liveUrl,
    previewImage: activeFeed?.previewImage || result?.result?.image || "",
    terrainUrl: activeFeed?.terrainUrl || activeFeed?.query || choices[0]?.query || "",
    query: activeFeed?.query || choices[0]?.query || "",
    marketSymbols: activeFeed?.marketSymbols || [],
    sourceApi: liveUrl ? "sketchfab-live" : activeFeed?.source || "model-choice",
    agentNarration: activeFeed?.agentNarration || title,
    visualDescription: activeFeed?.visualDescription || activeFeed?.context || "Active observatory renderer memory"
  }

  return <section style={styles.wrap} aria-labelledby="model-rotation-title">
    <div style={styles.header}>
      <div>
        <p style={styles.eyebrow}>Active visual feed</p>
        <h2 id="model-rotation-title" style={styles.title}>{title}</h2>
      </div>
      <span style={styles.pill}>{busy ? "scanning" : activeFeed?.category || "model"}</span>
    </div>
    <div style={styles.grid}>
      <div style={styles.rendererStack}>
        <div style={styles.rendererLabel}>Observatory renderer A</div>
        <div style={styles.viewer}><UniversalFeedVisual activeFeed={visualFeed} scope="rotation" /></div>
      </div>
      <div style={styles.rendererStack}>
        <div style={styles.rendererLabel}>Observatory renderer B</div>
        <DiscoverySnapshotVisual feed={visualFeed} scope="observatory renderer" />
      </div>
      <div style={styles.choices}>
        {choices.map((choice) => {
          const selected = activeFeed?.query === choice.query || activeFeed?.title === choice.title
          const choiceFeed = { title: choice.title, category: choice.mood, clientType: choice.mood, query: choice.query, terrainUrl: choice.query, visualDescription: choice.mood }
          return <button key={choice.title} type="button" onClick={() => onSelectFeed?.(choice)} style={selected ? styles.activeChoice : styles.choice}>
            <DiscoverySnapshotVisual feed={choiceFeed} scope="recent search preview" compact />
            <b>{choice.title}</b>
            <span>{choice.mood}</span>
          </button>
        })}
      </div>
    </div>
  </section>
}

const styles = {
  wrap: { maxWidth: 1180, margin: "22px auto", padding: 20, border: "1px solid rgba(148,163,184,.25)", borderRadius: 8, background: "rgba(15,23,42,.74)", boxSizing: "border-box" },
  header: { display: "flex", justifyContent: "space-between", gap: 14, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 16 },
  eyebrow: { margin: "0 0 8px", color: "#67e8f9", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0 },
  title: { margin: 0, fontSize: "clamp(26px,4vw,42px)", lineHeight: 1.06, letterSpacing: 0, maxWidth: 820, overflowWrap: "anywhere" },
  pill: { fontSize: 12, padding: "7px 10px", borderRadius: 999, background: "rgba(103,232,249,.12)", color: "#a5f3fc", fontWeight: 900, textTransform: "capitalize" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: 16, alignItems: "stretch" },
  rendererStack: { minWidth: 0, display: "grid", gap: 8, alignContent: "stretch" },
  rendererLabel: { color: "#a5f3fc", fontSize: 12, fontWeight: 900, textTransform: "uppercase" },
  viewer: { minWidth: 0, minHeight: 280, borderRadius: 8, overflow: "hidden" },
  choices: { display: "grid", gap: 10, alignContent: "start" },
  choice: { minWidth: 0, textAlign: "left", padding: 14, borderRadius: 8, border: "1px solid rgba(148,163,184,.22)", background: "rgba(2,6,23,.42)", color: "white", display: "grid", gap: 7, cursor: "pointer" },
  activeChoice: { minWidth: 0, textAlign: "left", padding: 14, borderRadius: 8, border: "1px solid rgba(45,212,191,.45)", background: "rgba(20,184,166,.14)", color: "white", display: "grid", gap: 7, cursor: "pointer" }
}
