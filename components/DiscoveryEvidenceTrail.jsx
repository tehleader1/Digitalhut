"use client"

function relatedFor(feed = {}) {
  const symbols = feed.marketSymbols || feed.symbols || []
  if (symbols.length) return symbols.slice(0, 4)
  const seed = String(feed.query || feed.title || "observatory discovery").split(/\s+/).filter(Boolean)
  return seed.slice(0, 4).length ? seed.slice(0, 4) : ["snapshot", "library", "runner", "pulse"]
}

export default function DiscoveryEvidenceTrail({ feed = {}, title = "Discovery evidence", compact = false }) {
  const name = feed.title || feed.query || "Active discovery"
  const related = relatedFor(feed)
  const date = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  const status = feed.modelUrl ? "GLB route ready" : feed.previewImage ? "image snapshot ready" : "fallback renderer ready"
  const summary = feed.agentNarration || feed.visualDescription || feed.context || feed.query || "This discovery is being saved as reusable observatory memory."
  const steps = [
    { label: "Discovery", value: name, state: "captured" },
    { label: "Snapshot", value: status, state: "ready" },
    { label: "Library record", value: feed.category || feed.clientType || "observatory", state: "indexed" },
    { label: "Blog draft", value: `${name}: live discovery brief`, state: "drafted" },
    { label: "Runner memory", value: "answer, surfaces, and backend history", state: "recording" },
    { label: "Observatory pulse", value: date, state: "live" }
  ]

  return <section style={compact ? styles.compactWrap : styles.wrap} aria-label={title}>
    <div style={styles.header}>
      <div>
        <p style={styles.eyebrow}>{title}</p>
        <h3 style={compact ? styles.compactTitle : styles.title}>{name}</h3>
      </div>
      <span style={styles.badge}>{status}</span>
    </div>
    <p style={styles.summary}>{summary}</p>
    <div style={compact ? styles.compactGrid : styles.grid}>
      {steps.map((step, index) => <article key={step.label} style={styles.step}>
        <span style={styles.index}>{index + 1}</span>
        <b>{step.label}</b>
        <p>{step.value}</p>
        <small>{step.state}</small>
      </article>)}
    </div>
    <div style={styles.related}>
      <span style={styles.relatedLabel}>Related</span>
      {related.map((item) => <span key={item} style={styles.relatedItem}>{item}</span>)}
    </div>
  </section>
}

const styles = {
  wrap: { minWidth: 0, padding: 18, borderRadius: 8, border: "1px solid rgba(45,212,191,.28)", background: "rgba(8,20,32,.78)", boxSizing: "border-box", display: "grid", gap: 12 },
  compactWrap: { minWidth: 0, padding: 14, borderRadius: 8, border: "1px solid rgba(45,212,191,.2)", background: "rgba(8,20,32,.6)", boxSizing: "border-box", display: "grid", gap: 10 },
  header: { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start", flexWrap: "wrap" },
  eyebrow: { margin: "0 0 6px", color: "#67e8f9", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0 },
  title: { margin: 0, color: "white", fontSize: 28, lineHeight: 1.08, overflowWrap: "anywhere" },
  compactTitle: { margin: 0, color: "white", fontSize: 20, lineHeight: 1.1, overflowWrap: "anywhere" },
  badge: { padding: "7px 10px", borderRadius: 999, background: "rgba(20,184,166,.16)", color: "#a7f3d0", fontSize: 12, fontWeight: 900, textTransform: "capitalize" },
  summary: { margin: 0, color: "#dbeafe", lineHeight: 1.5, overflowWrap: "anywhere" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,150px),1fr))", gap: 9 },
  compactGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,128px),1fr))", gap: 8 },
  step: { minWidth: 0, padding: 11, borderRadius: 8, border: "1px solid rgba(148,163,184,.18)", background: "rgba(2,6,23,.42)", display: "grid", gap: 5, color: "#e0f2fe", lineHeight: 1.35, overflowWrap: "anywhere" },
  index: { width: 24, height: 24, borderRadius: 999, display: "grid", placeItems: "center", background: "#14b8a6", color: "#021014", fontWeight: 900, fontSize: 12 },
  related: { display: "flex", flexWrap: "wrap", gap: 7, alignItems: "center" },
  relatedLabel: { color: "#94a3b8", fontSize: 11, fontWeight: 900, textTransform: "uppercase" },
  relatedItem: { padding: "6px 8px", borderRadius: 999, background: "rgba(56,189,248,.12)", color: "#bae6fd", fontSize: 12, fontWeight: 800, textTransform: "capitalize" }
}
