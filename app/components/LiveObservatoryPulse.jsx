"use client"

import { useEffect, useRef, useState } from "react"

const defaultPulse = {
  label: "DigitalHut public observatory is warming up",
  query: "wall street new york financial district 3d",
  category: "public-live",
  priority: "public-live",
  sourceMix: ["public-3d", "maps", "research"],
  intervalMs: 24000,
  tempo: "public-browse",
  engagementScore: 0,
  reason: "Waiting for orbit engagement."
}

export default function LiveObservatoryPulse({ intent = "anonymous-new-user", tier = "free", wallet = "", onUseFeed }) {
  const [pulse, setPulse] = useState(defaultPulse)
  const [metrics, setMetrics] = useState({ orbitSeconds: 0, interactionCount: 0, idleSeconds: 0, replayCount: 0, savedCount: 0 })
  const [savedFeeds, setSavedFeeds] = useState([])
  const lastInteractionRef = useRef(Date.now())
  const timerRef = useRef(null)

  useEffect(() => {
    const ticker = setInterval(() => {
      setMetrics(current => ({
        ...current,
        orbitSeconds: current.orbitSeconds + 1,
        idleSeconds: Math.floor((Date.now() - lastInteractionRef.current) / 1000)
      }))
    }, 1000)
    return () => clearInterval(ticker)
  }, [])

  useEffect(() => {
    function interact() {
      lastInteractionRef.current = Date.now()
      setMetrics(current => ({ ...current, interactionCount: current.interactionCount + 1, idleSeconds: 0 }))
    }
    window.addEventListener("pointermove", interact, { passive: true })
    window.addEventListener("wheel", interact, { passive: true })
    window.addEventListener("keydown", interact)
    return () => {
      window.removeEventListener("pointermove", interact)
      window.removeEventListener("wheel", interact)
      window.removeEventListener("keydown", interact)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function loadPulse() {
      const params = new URLSearchParams({
        intent,
        tier,
        wallet,
        orbitSeconds: String(metrics.orbitSeconds),
        interactionCount: String(metrics.interactionCount),
        idleSeconds: String(metrics.idleSeconds),
        replayCount: String(metrics.replayCount),
        savedCount: String(metrics.savedCount)
      })
      const res = await fetch(`/api/observatory-feed?${params.toString()}`, { cache: "no-store" })
      const json = await res.json()
      if (!cancelled) setPulse(json.pulse || defaultPulse)
    }

    loadPulse()
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(loadPulse, pulse.intervalMs || 24000)

    return () => {
      cancelled = true
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [intent, tier, wallet, metrics.orbitSeconds, metrics.interactionCount, metrics.idleSeconds, metrics.replayCount, metrics.savedCount, pulse.intervalMs])

  function useFeed() {
    setMetrics(current => ({ ...current, replayCount: current.replayCount + 1 }))
    if (typeof onUseFeed === "function") onUseFeed(pulse.query)
  }

  function saveFeed() {
    setSavedFeeds(current => [{ query: pulse.query, label: pulse.label, savedAt: new Date().toISOString() }, ...current].slice(0, 8))
    setMetrics(current => ({ ...current, savedCount: current.savedCount + 1 }))
  }

  return (
    <section style={wrap} aria-label="Live observatory pulse">
      <div style={topRow}>
        <span style={eyebrow}>Live Observatory Pulse</span>
        <span style={tempo}>{pulse.tempo}</span>
      </div>
      <div style={grid}>
        <div>
          <h2 style={headline}>{pulse.label}</h2>
          <p style={copy}>{pulse.reason}</p>
          <div style={chips}>{(pulse.sourceMix || []).map(source => <span key={source} style={chip}>{source}</span>)}</div>
        </div>
        <div style={panel}>
          <Info label="Next rhythm" value={`${Math.round((pulse.intervalMs || 24000) / 1000)}s`} />
          <Info label="Engagement" value={String(pulse.engagementScore || 0)} />
          <Info label="Category" value={pulse.category} />
          <button onClick={useFeed} style={primary}>Use Feed</button>
          <button onClick={saveFeed} style={secondary}>Save Pulse</button>
        </div>
      </div>
      {savedFeeds.length > 0 && <p style={savedLine}>Saved this visit: {savedFeeds.map(feed => feed.query).join(" | ")}</p>}
    </section>
  )
}

function Info({ label, value }) {
  return <div style={info}><span>{label}</span><b>{value}</b></div>
}

const wrap = { maxWidth: 1180, margin: "22px auto", border: "1px solid rgba(45,212,191,.34)", borderRadius: 8, background: "linear-gradient(135deg,rgba(20,184,166,.18),rgba(15,23,42,.86) 48%,rgba(59,130,246,.14))", color: "white", padding: 18 }
const topRow = { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 10 }
const eyebrow = { fontSize: 12, textTransform: "uppercase", letterSpacing: 0, fontWeight: 900, color: "#99f6e4" }
const tempo = { fontSize: 12, fontWeight: 900, padding: "7px 10px", borderRadius: 999, background: "rgba(20,184,166,.16)", color: "#ccfbf1" }
const grid = { display: "grid", gridTemplateColumns: "minmax(0,1fr) 270px", gap: 16, alignItems: "stretch" }
const headline = { fontSize: 30, lineHeight: 1.08, margin: "0 0 10px", letterSpacing: 0 }
const copy = { color: "#dbeafe", lineHeight: 1.5, margin: 0 }
const chips = { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }
const chip = { padding: "7px 9px", borderRadius: 999, background: "rgba(255,255,255,.09)", color: "#e0f2fe", fontSize: 12, fontWeight: 800 }
const panel = { border: "1px solid rgba(148,163,184,.24)", borderRadius: 8, padding: 12, background: "rgba(2,6,23,.38)", display: "grid", gap: 8 }
const info = { display: "flex", justifyContent: "space-between", gap: 10, color: "#cbd5e1", fontSize: 13 }
const primary = { padding: "11px 12px", borderRadius: 8, border: 0, background: "#14b8a6", color: "#021014", fontWeight: 900, cursor: "pointer" }
const secondary = { padding: "11px 12px", borderRadius: 8, border: "1px solid rgba(226,232,240,.22)", background: "rgba(255,255,255,.08)", color: "white", fontWeight: 900, cursor: "pointer" }
const savedLine = { margin: "12px 0 0", color: "#a7f3d0", fontSize: 13, overflowWrap: "anywhere" }
