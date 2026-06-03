"use client"

import { useMemo, useState } from "react"
import BabylonObservatory from "../app/components/BabylonObservatory"
import library from "../data/platform-libraries.json"

export default function ModelRotationChooser({ result, busy = false, onScan }) {
  const choices = library.modelChoices
  const [selected, setSelected] = useState(choices[0])
  const liveUrl = result?.result?.glbUrl || result?.result?.downloadUrl || ""
  const title = useMemo(() => result?.result?.title || selected.title, [result, selected])

  function choose(choice) {
    setSelected(choice)
    onScan?.(choice.query)
  }

  return <section style={styles.wrap} aria-labelledby="model-rotation-title">
    <div style={styles.header}>
      <div>
        <p style={styles.eyebrow}>Rotating model choices</p>
        <h2 id="model-rotation-title" style={styles.title}>Visitors can swap the present model when the view gets stale.</h2>
      </div>
      <span style={styles.pill}>{busy ? "scanning" : selected.mood}</span>
    </div>
    <div style={styles.grid}>
      <div style={styles.viewer}>
        <BabylonObservatory modelUrl={liveUrl} title={title} />
      </div>
      <div style={styles.choices}>
        {choices.map((choice) => <button key={choice.title} type="button" onClick={() => choose(choice)} style={choice.title === selected.title ? styles.activeChoice : styles.choice}>
          <b>{choice.title}</b>
          <span>{choice.mood}</span>
        </button>)}
      </div>
    </div>
  </section>
}

const styles = {
  wrap: { maxWidth: 1180, margin: "22px auto", padding: 20, border: "1px solid rgba(148,163,184,.25)", borderRadius: 8, background: "rgba(15,23,42,.74)", boxSizing: "border-box" },
  header: { display: "flex", justifyContent: "space-between", gap: 14, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 16 },
  eyebrow: { margin: "0 0 8px", color: "#67e8f9", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0 },
  title: { margin: 0, fontSize: "clamp(26px,4vw,42px)", lineHeight: 1.06, letterSpacing: 0, maxWidth: 820 },
  pill: { fontSize: 12, padding: "7px 10px", borderRadius: 999, background: "rgba(103,232,249,.12)", color: "#a5f3fc", fontWeight: 900, textTransform: "capitalize" },
  grid: { display: "grid", gridTemplateColumns: "minmax(0,1.2fr) minmax(260px,.8fr)", gap: 16, alignItems: "stretch" },
  viewer: { minWidth: 0, borderRadius: 8, overflow: "hidden" },
  choices: { display: "grid", gap: 10, alignContent: "start" },
  choice: { minWidth: 0, textAlign: "left", padding: 14, borderRadius: 8, border: "1px solid rgba(148,163,184,.22)", background: "rgba(2,6,23,.42)", color: "white", display: "grid", gap: 5, cursor: "pointer" },
  activeChoice: { minWidth: 0, textAlign: "left", padding: 14, borderRadius: 8, border: "1px solid rgba(45,212,191,.45)", background: "rgba(20,184,166,.14)", color: "white", display: "grid", gap: 5, cursor: "pointer" }
}
