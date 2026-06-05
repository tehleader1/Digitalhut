"use client"

import { useMemo, useState } from "react"

const starterQuestions = [
  "A client has 12 GLBs and needs to connect their system to digitalhut.app. What code structure should update?",
  "What should update when this active GLB becomes a blog and library snapshot?",
  "Explain this discovery in real-world speech for a client who is excited to see it live.",
  "What is 35 + 50 as a developer tier total?",
  "How should the market renderer preload candlestick charts and technicals for this profile?"
]

export default function DiscoveryRunnerConsole({ activeFeed, result, marketSymbols = [] }) {
  const [question, setQuestion] = useState(starterQuestions[0])
  const [runner, setRunner] = useState(null)
  const [busy, setBusy] = useState(false)

  const snapshot = useMemo(() => ({
    title: activeFeed?.title || result?.result?.title || "Active discovery",
    previewImage: activeFeed?.previewImage || result?.result?.image || "",
    modelUrl: activeFeed?.modelUrl || result?.result?.glbUrl || result?.result?.downloadUrl || "",
    query: activeFeed?.query || "",
    symbols: activeFeed?.marketSymbols?.length ? activeFeed.marketSymbols : marketSymbols
  }), [activeFeed, result, marketSymbols])

  async function ask(nextQuestion = question) {
    const cleanQuestion = String(nextQuestion || "").trim()
    if (!cleanQuestion) return
    setQuestion(cleanQuestion)
    setBusy(true)
    try {
      const res = await fetch("/api/discovery-runner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: cleanQuestion, activeFeed, result, snapshot })
      })
      setRunner(await res.json())
    } finally {
      setBusy(false)
    }
  }

  return <section style={styles.wrap} aria-labelledby="discovery-runner-title">
    <div style={styles.header}>
      <div>
        <p style={styles.eyebrow}>Active discovery runner</p>
        <h2 id="discovery-runner-title" style={styles.title}>Ask real questions. Turn the answer into blog, library, examples, market, and backend activity.</h2>
      </div>
      <span style={styles.pill}>{activeFeed?.category || "activeFeed"}</span>
    </div>

    <div style={styles.grid}>
      <div style={styles.panel}>
        <p style={styles.label}>Real-world question</p>
        <textarea value={question} onChange={(event) => setQuestion(event.target.value)} style={styles.textarea} />
        <div style={styles.actions}>
          <button type="button" onClick={() => ask()} style={styles.primary}>{busy ? "Answering" : "Ask runner"}</button>
          {starterQuestions.map((item) => <button key={item} type="button" onClick={() => ask(item)} style={styles.secondary}>{item}</button>)}
        </div>
      </div>

      <article style={styles.panel}>
        <p style={styles.label}>Snapshot packet</p>
        {snapshot.previewImage ? <img src={snapshot.previewImage} alt="Active discovery snapshot" style={styles.preview} /> : <div style={styles.emptyPreview}>Snapshot waits for active GLB preview</div>}
        <h3 style={styles.cardTitle}>{snapshot.title}</h3>
        <p style={styles.copy}>Model: {snapshot.modelUrl ? "GLB route ready" : "metadata or fallback renderer"}</p>
        <p style={styles.copy}>Symbols: {(snapshot.symbols || []).join(" / ") || "none"}</p>
      </article>
    </div>

    <div style={styles.answerBand}>
      <p style={styles.label}>Runner answer</p>
      <p style={styles.answer}>{runner?.answer || "The runner will classify the question, explain the next system action, and record the event to backend history."}</p>
      <div style={styles.tags}>{(runner?.classifications || ["real-world-speech", "activeFeed", "backend-recording"]).map((tag) => <span key={tag} style={styles.tag}>{tag}</span>)}</div>
    </div>

    <div style={styles.surfaceGrid}>
      {(runner?.surfaces || defaultSurfaces).map((surface) => <article key={surface.name} style={styles.surface}>
        <b>{surface.name}</b>
        <span>{surface.status}</span>
        <p>{surface.action}</p>
      </article>)}
    </div>
  </section>
}

const defaultSurfaces = [
  { name: "main blog feature", status: "waiting for runner", action: "Use the active snapshot as the blog visual." },
  { name: "library", status: "waiting for runner", action: "Save the discovery under the matching lane." },
  { name: "examples", status: "waiting for runner", action: "Create a client-facing integration example." },
  { name: "observatory renderer", status: "active", action: "Keep renderer output tied to activeFeed." },
  { name: "quick recent activity", status: "recording-ready", action: "Show the latest question and answer." },
  { name: "market profile", status: "available", action: "Preload candles and technicals when symbols are active." }
]

const styles = {
  wrap: { maxWidth: 1180, margin: "22px auto", padding: 20, border: "1px solid rgba(148,163,184,.25)", borderRadius: 8, background: "rgba(15,23,42,.74)", boxSizing: "border-box" },
  header: { display: "flex", justifyContent: "space-between", gap: 14, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 16 },
  eyebrow: { margin: "0 0 8px", color: "#67e8f9", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0 },
  title: { margin: 0, fontSize: "clamp(26px,4vw,42px)", lineHeight: 1.06, letterSpacing: 0, maxWidth: 850, overflowWrap: "anywhere" },
  pill: { fontSize: 12, padding: "7px 10px", borderRadius: 999, background: "rgba(103,232,249,.12)", color: "#a5f3fc", fontWeight: 900, textTransform: "capitalize" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: 16 },
  panel: { minWidth: 0, padding: 16, border: "1px solid rgba(148,163,184,.22)", borderRadius: 8, background: "rgba(2,6,23,.42)" },
  label: { margin: "0 0 8px", color: "#a5f3fc", fontSize: 12, fontWeight: 900, textTransform: "uppercase" },
  textarea: { width: "100%", minHeight: 126, boxSizing: "border-box", padding: 14, borderRadius: 8, border: "1px solid rgba(226,232,240,.24)", background: "#020617", color: "white", fontSize: 16, lineHeight: 1.45, resize: "vertical" },
  actions: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 },
  primary: { padding: "12px 14px", borderRadius: 8, border: 0, background: "#14b8a6", color: "#021014", fontWeight: 900, cursor: "pointer" },
  secondary: { padding: "10px 11px", borderRadius: 8, border: "1px solid rgba(148,163,184,.24)", background: "rgba(226,232,240,.08)", color: "white", fontWeight: 800, cursor: "pointer", maxWidth: 230, textAlign: "left" },
  preview: { width: "100%", aspectRatio: "16 / 9", objectFit: "cover", borderRadius: 8, background: "#0f172a", marginBottom: 12 },
  emptyPreview: { minHeight: 180, borderRadius: 8, background: "linear-gradient(135deg,#0f172a,#111827)", display: "grid", placeItems: "center", color: "#cbd5e1", fontWeight: 900, textAlign: "center", padding: 16, boxSizing: "border-box", marginBottom: 12 },
  cardTitle: { margin: "0 0 8px", fontSize: 23, lineHeight: 1.15, overflowWrap: "anywhere" },
  copy: { color: "#cbd5e1", lineHeight: 1.45, overflowWrap: "anywhere" },
  answerBand: { marginTop: 16, padding: 16, borderRadius: 8, border: "1px solid rgba(103,232,249,.24)", background: "rgba(8,20,32,.82)" },
  answer: { margin: 0, color: "#dbeafe", fontSize: 17, lineHeight: 1.6, overflowWrap: "anywhere" },
  tags: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 },
  tag: { padding: "6px 8px", borderRadius: 999, background: "rgba(56,189,248,.12)", color: "#bae6fd", fontSize: 11, fontWeight: 800 },
  surfaceGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))", gap: 10, marginTop: 16 },
  surface: { minWidth: 0, padding: 13, borderRadius: 8, border: "1px solid rgba(148,163,184,.2)", background: "rgba(255,255,255,.05)", display: "grid", gap: 5, color: "#dbeafe", lineHeight: 1.4, overflowWrap: "anywhere" }
}
