"use client"

import { useEffect, useState } from "react"

export default function SystemIntroOverlay({ activeFeed, onComplete }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      onComplete?.()
    }, 2600)

    return () => clearTimeout(timer)
  }, [onComplete])

  if (!visible) return null

  return (
    <div style={styles.wrap}>
      <div style={styles.panel}>
        <p style={styles.eyebrow}>Entering DigitalHut Observatory</p>
        <h1 style={styles.title}>{activeFeed?.title || "Live Discovery System"}</h1>
        <div style={styles.grid}>
          <span style={styles.ready}>Renderer ready</span>
          <span style={styles.ready}>Library ready</span>
          <span style={styles.ready}>Voice ready</span>
          <span style={styles.ready}>Runner ready</span>
        </div>
        <p style={styles.note}>Your active feed is loading into the observatory stage.</p>
      </div>
    </div>
  )
}

const styles = {
  wrap: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background: "radial-gradient(circle at center, rgba(15,23,42,.92), rgba(2,6,23,.98))",
    display: "grid",
    placeItems: "center",
    color: "white"
  },
  panel: {
    width: "min(680px,92vw)",
    padding: 28,
    borderRadius: 8,
    border: "1px solid rgba(103,232,249,.35)",
    background: "rgba(15,23,42,.72)",
    boxShadow: "0 0 60px rgba(34,211,238,.18)",
    textAlign: "center"
  },
  eyebrow: { color: "#67e8f9", fontWeight: 900, textTransform: "uppercase", fontSize: 12, letterSpacing: 0 },
  title: { fontSize: "clamp(28px,6vw,58px)", margin: "10px 0", letterSpacing: 0, overflowWrap: "anywhere" },
  grid: { display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10, marginTop: 20 },
  ready: { padding: 10, borderRadius: 8, background: "rgba(103,232,249,.1)", color: "#cffafe", fontWeight: 900 },
  note: { color: "#cbd5e1", marginTop: 18 }
}
