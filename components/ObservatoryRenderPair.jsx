"use client"

import BabylonObservatory from "../app/components/BabylonObservatory"

export default function ObservatoryRenderPair({ feature, result, busy = false, onScan, onDownload }) {
  if (!feature) return null
  const liveModelUrl = result?.result?.glbUrl || result?.result?.downloadUrl
  const liveTitle = result?.result?.title || feature.mainFeatureTitle

  return <section style={styles.wrap} aria-labelledby="observatory-render-pair-title">
    <div style={styles.header}>
      <div>
        <p style={styles.eyebrow}>Two-render observatory</p>
        <h2 id="observatory-render-pair-title" style={styles.title}>{feature.primaryRenderRole}</h2>
      </div>
      <span style={styles.pill}>{feature.contextRenderRole}</span>
    </div>

    <div style={styles.grid}>
      <article style={styles.renderCard}>
        <div style={styles.renderFrame}>
          <BabylonObservatory modelUrl={liveModelUrl} title={liveTitle}/>
        </div>
        <h3 style={styles.cardTitle}>{liveTitle}</h3>
        <p style={styles.text}>{feature.mainGLBSearch}</p>
        <div style={styles.actions}>
          <button type="button" onClick={() => onScan?.(feature.mainGLBSearch)} style={styles.primary}>{busy ? "Scanning" : "Scan main GLB"}</button>
          <button type="button" onClick={onDownload} style={styles.secondary}>Authorize download</button>
        </div>
      </article>

      <article style={styles.renderCard}>
        <div style={styles.contextBlock}>
          <span style={styles.contextLabel}>{feature.observatory?.contextLabel || "Context render"}</span>
          <b style={styles.contextTitle}>{feature.contextRenderRole}</b>
        </div>
        <h3 style={styles.cardTitle}>{feature.observatory?.primaryLabel || feature.label}</h3>
        <p style={styles.text}>{feature.contextGLBSearch}</p>
        <div style={styles.actions}>
          <button type="button" onClick={() => onScan?.(feature.contextGLBSearch)} style={styles.secondary}>Scan context</button>
        </div>
      </article>
    </div>
  </section>
}

const styles = {
  wrap: { maxWidth: 1180, margin: "22px auto", padding: 20, border: "1px solid rgba(148,163,184,.25)", borderRadius: 8, background: "rgba(15,23,42,.74)", boxSizing: "border-box" },
  header: { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 16 },
  eyebrow: { margin: "0 0 8px", color: "#67e8f9", fontSize: 12, fontWeight: 900, letterSpacing: 0, textTransform: "uppercase" },
  title: { margin: 0, fontSize: "clamp(26px,4vw,42px)", lineHeight: 1.05, letterSpacing: 0 },
  pill: { fontSize: 12, padding: "7px 10px", borderRadius: 999, background: "rgba(103,232,249,.12)", color: "#a5f3fc", fontWeight: 900 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 18 },
  renderCard: { minWidth: 0, padding: 16, border: "1px solid rgba(148,163,184,.22)", borderRadius: 8, background: "rgba(2,6,23,.35)" },
  renderFrame: { minHeight: 320, borderRadius: 8, overflow: "hidden", background: "#020617", marginBottom: 14 },
  contextBlock: { minHeight: 320, borderRadius: 8, padding: 18, display: "grid", alignContent: "center", gap: 10, background: "linear-gradient(145deg,rgba(20,184,166,.22),rgba(56,189,248,.08))", border: "1px solid rgba(103,232,249,.22)", marginBottom: 14 },
  contextLabel: { color: "#a5f3fc", fontSize: 12, fontWeight: 900, textTransform: "uppercase" },
  contextTitle: { color: "white", fontSize: "clamp(24px,4vw,38px)", lineHeight: 1.05 },
  cardTitle: { margin: "0 0 10px", fontSize: 22, lineHeight: 1.15 },
  text: { margin: "0 0 14px", color: "#cbd5e1", lineHeight: 1.5, overflowWrap: "anywhere" },
  actions: { display: "flex", flexWrap: "wrap", gap: 10 },
  primary: { padding: "14px 18px", borderRadius: 8, background: "#14b8a6", color: "#021014", border: 0, fontWeight: 900, cursor: "pointer" },
  secondary: { padding: "14px 18px", borderRadius: 8, background: "rgba(226,232,240,.1)", color: "white", border: "1px solid rgba(226,232,240,.24)", fontWeight: 800, cursor: "pointer" }
}
