"use client"

import { useEffect, useState } from "react"

const fallback = {
  section: "Observatory Daily",
  headline: "DigitalHut Observatory Daily Is Loading",
  deck: "The public 3D newsdesk is preparing the featured model, market context, and wallet-aware entry signal.",
  observatoryQuery: "wall street new york financial district 3d",
  marketSymbols: ["BTC", "ETH", "SPY", "NVDA"],
  tags: ["observatory", "public-feed", "3d"]
}

export default function FeaturedDailyPost({ intent = "public-observatory" }) {
  const [post, setPost] = useState(fallback)
  const [meta, setMeta] = useState(null)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const res = await fetch(`/api/blog/daily?intent=${encodeURIComponent(intent)}`, { cache: "no-store" })
        const json = await res.json()
        if (!active) return
        setPost(json.featured || fallback)
        setMeta(json)
      } catch {
        if (active) setPost(fallback)
      }
    }
    load()
    return () => { active = false }
  }, [intent])

  return (
    <section style={wrap} aria-label="DigitalHut featured daily post">
      <div style={rail}>
        <span style={label}>{post.section}</span>
        <span style={liveDot}>Daily</span>
      </div>
      <div style={body}>
        <div>
          <h2 style={headline}>{post.headline}</h2>
          <p style={deck}>{post.deck}</p>
          <div style={tagRow}>{(post.tags || []).map(tagName => <span key={tagName} style={tagPill}>{tagName}</span>)}</div>
        </div>
        <div style={sideBox}>
          <span style={sideLabel}>3D preload</span>
          <b style={query}>{post.observatoryQuery}</b>
          <span style={sideLabel}>Market context</span>
          <b style={symbols}>{(post.marketSymbols || []).join(" / ")}</b>
          <a href="/blog" style={readLink}>Open Daily</a>
        </div>
      </div>
      <p style={metaLine}>{meta?.cadence || "daily-0600-observatory-newsdesk"}</p>
    </section>
  )
}

const wrap = { maxWidth: 1180, margin: "22px auto", border: "1px solid rgba(251,191,36,.38)", borderRadius: 8, background: "linear-gradient(135deg,rgba(251,191,36,.16),rgba(15,23,42,.88) 46%,rgba(20,184,166,.12))", color: "white", overflow: "hidden" }
const rail = { display: "flex", justifyContent: "space-between", gap: 12, padding: "12px 16px", borderBottom: "1px solid rgba(251,191,36,.2)", background: "rgba(2,6,23,.36)" }
const label = { fontSize: 12, textTransform: "uppercase", letterSpacing: 0, fontWeight: 900, color: "#fde68a" }
const liveDot = { fontSize: 12, fontWeight: 900, color: "#99f6e4" }
const body = { display: "grid", gridTemplateColumns: "minmax(0,1fr) 300px", gap: 18, padding: 18, alignItems: "stretch" }
const headline = { margin: "0 0 10px", fontSize: 30, lineHeight: 1.05, letterSpacing: 0 }
const deck = { margin: 0, color: "#dbeafe", lineHeight: 1.5, fontSize: 16 }
const tagRow = { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }
const tagPill = { padding: "7px 9px", borderRadius: 999, background: "rgba(255,255,255,.09)", color: "#e0f2fe", fontSize: 12, fontWeight: 800 }
const sideBox = { border: "1px solid rgba(148,163,184,.24)", borderRadius: 8, background: "rgba(2,6,23,.42)", padding: 14, display: "grid", gap: 8 }
const sideLabel = { fontSize: 11, textTransform: "uppercase", letterSpacing: 0, color: "#93c5fd", fontWeight: 900 }
const query = { color: "#fef3c7", overflowWrap: "anywhere" }
const symbols = { color: "#a7f3d0" }
const readLink = { marginTop: 6, padding: "11px 12px", borderRadius: 8, background: "#fbbf24", color: "#1f1300", textDecoration: "none", textAlign: "center", fontWeight: 900 }
const metaLine = { margin: 0, padding: "0 18px 16px", color: "#cbd5e1", fontSize: 12 }
