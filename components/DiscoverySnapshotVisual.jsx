"use client"

const categoryThemes = {
  market: { accent: "#22c55e", bg: "linear-gradient(135deg,#052e16,#0f172a 45%,#064e3b)", label: "market profile" },
  residential: { accent: "#f59e0b", bg: "linear-gradient(135deg,#422006,#111827 45%,#78350f)", label: "home project" },
  "home-project": { accent: "#f59e0b", bg: "linear-gradient(135deg,#422006,#111827 45%,#78350f)", label: "home project" },
  "global environment": { accent: "#38bdf8", bg: "linear-gradient(135deg,#082f49,#0f172a 45%,#164e63)", label: "global environment" },
  "market environment": { accent: "#22c55e", bg: "linear-gradient(135deg,#052e16,#0f172a 45%,#172554)", label: "market district" },
  "global city": { accent: "#60a5fa", bg: "linear-gradient(135deg,#172554,#0f172a 45%,#1e3a8a)", label: "city discovery" },
  "historical environment": { accent: "#f97316", bg: "linear-gradient(135deg,#431407,#111827 45%,#7c2d12)", label: "history scene" },
  "travel and geography": { accent: "#2dd4bf", bg: "linear-gradient(135deg,#134e4a,#0f172a 45%,#0f766e)", label: "travel map" },
  "real estate environment": { accent: "#facc15", bg: "linear-gradient(135deg,#713f12,#111827 45%,#854d0e)", label: "real estate" },
  workforce: { accent: "#a78bfa", bg: "linear-gradient(135deg,#312e81,#111827 45%,#581c87)", label: "workforce" },
  civic: { accent: "#93c5fd", bg: "linear-gradient(135deg,#1e3a8a,#111827 45%,#334155)", label: "civic" },
  "game asset": { accent: "#fb7185", bg: "linear-gradient(135deg,#881337,#111827 45%,#4c1d95)", label: "game world" },
  lunar: { accent: "#cbd5e1", bg: "linear-gradient(135deg,#334155,#020617 45%,#64748b)", label: "lunar terrain" },
  mars: { accent: "#fb923c", bg: "linear-gradient(135deg,#7c2d12,#111827 45%,#991b1b)", label: "mars terrain" },
  earth: { accent: "#34d399", bg: "linear-gradient(135deg,#064e3b,#0f172a 45%,#1d4ed8)", label: "earth atlas" },
  observatory: { accent: "#67e8f9", bg: "linear-gradient(135deg,#0e7490,#020617 45%,#155e75)", label: "observatory" }
}

function themeFor(feed = {}) {
  const key = String(feed.category || feed.clientType || feed.intent || "observatory").toLowerCase()
  return categoryThemes[key] || categoryThemes[feed.category] || categoryThemes[feed.clientType] || categoryThemes.observatory
}

function barsFor(feed = {}) {
  const seed = String(feed.title || feed.query || feed.category || "DigitalHut")
  return Array.from({ length: 9 }, (_, index) => {
    const code = seed.charCodeAt(index % seed.length) || 68
    return 20 + ((code + index * 13) % 70)
  })
}

export default function DiscoverySnapshotVisual({ feed = {}, title, subtitle, scope = "snapshot", compact = false }) {
  const theme = themeFor(feed)
  const preview = feed.snapshotUrl || feed.previewImage || feed.image || ""
  const symbols = feed.marketSymbols || feed.symbols || []
  const label = feed.visualMode === "market" || feed.category === "market" ? "live market snapshot" : theme.label
  const displayTitle = title || feed.title || "Active discovery"
  const displaySubtitle = subtitle || feed.visualDescription || feed.agentNarration || feed.query || "Reusable observatory visual"

  if (preview) {
    return <figure style={compact ? styles.compactFigure : styles.figure}>
      <img src={preview} alt={`${displayTitle} snapshot`} style={styles.image} />
      <figcaption style={styles.caption}><b>{displayTitle}</b><span>{label}</span></figcaption>
    </figure>
  }

  return <div style={{...(compact ? styles.compactFallback : styles.fallback), background: theme.bg}}>
    <div style={styles.topline}>
      <span style={{...styles.dot, background: theme.accent}} />
      <span style={styles.scope}>{scope}</span>
    </div>
    <div style={styles.orbit}>
      <div style={{...styles.core, borderColor: theme.accent, boxShadow: `0 0 38px ${theme.accent}55`}}>
        <span style={{...styles.coreMark, background: theme.accent}}>{String(displayTitle).slice(0, 2).toUpperCase()}</span>
      </div>
      <div style={{...styles.ring, borderColor: `${theme.accent}66`}} />
      <div style={{...styles.ringTwo, borderColor: `${theme.accent}44`}} />
    </div>
    <div style={styles.copy}>
      <p style={{...styles.label, color: theme.accent}}>{label}</p>
      <h3 style={compact ? styles.compactTitle : styles.title}>{displayTitle}</h3>
      <p style={styles.subtitle}>{displaySubtitle}</p>
      {symbols.length ? <div style={styles.symbols}>{symbols.slice(0, 5).map((symbol) => <span key={symbol} style={styles.symbol}>{symbol}</span>)}</div> : null}
    </div>
    <div style={styles.bars}>{barsFor(feed).map((height, index) => <span key={index} style={{...styles.bar, height, background: theme.accent}} />)}</div>
  </div>
}

const styles = {
  figure: { position: "relative", width: "100%", height: "100%", minHeight: 220, margin: 0, borderRadius: 8, overflow: "hidden", background: "#020617" },
  compactFigure: { position: "relative", width: "100%", minHeight: 150, aspectRatio: "16 / 10", margin: 0, borderRadius: 8, overflow: "hidden", background: "#020617" },
  image: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  caption: { position: "absolute", left: 10, right: 10, bottom: 10, display: "flex", gap: 8, justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", padding: 10, borderRadius: 8, color: "white", background: "rgba(2,6,23,.72)", fontSize: 12, overflowWrap: "anywhere" },
  fallback: { position: "relative", minHeight: 260, height: "100%", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(148,163,184,.24)", padding: 16, boxSizing: "border-box", display: "grid", alignContent: "space-between", gap: 12 },
  compactFallback: { position: "relative", minHeight: 160, borderRadius: 8, overflow: "hidden", border: "1px solid rgba(148,163,184,.24)", padding: 12, boxSizing: "border-box", display: "grid", alignContent: "space-between", gap: 8 },
  topline: { display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between", color: "#e2e8f0", fontSize: 11, fontWeight: 900, textTransform: "uppercase" },
  dot: { width: 9, height: 9, borderRadius: 999, display: "inline-block", marginRight: "auto" },
  scope: { color: "#cbd5e1" },
  orbit: { position: "absolute", inset: "16% 8% auto auto", width: 132, height: 132, pointerEvents: "none" },
  core: { position: "absolute", inset: 28, border: "2px solid", borderRadius: 999, display: "grid", placeItems: "center", background: "rgba(2,6,23,.45)" },
  coreMark: { width: 44, height: 44, borderRadius: 999, display: "grid", placeItems: "center", color: "#021014", fontWeight: 900, fontSize: 15 },
  ring: { position: "absolute", inset: 6, border: "1px solid", borderRadius: 999 },
  ringTwo: { position: "absolute", inset: 0, border: "1px dashed", borderRadius: 999, transform: "rotate(-18deg)" },
  copy: { position: "relative", zIndex: 1, maxWidth: 360, minWidth: 0 },
  label: { margin: "0 0 6px", fontSize: 11, fontWeight: 900, textTransform: "uppercase" },
  title: { margin: 0, color: "white", fontSize: 28, lineHeight: 1.05, overflowWrap: "anywhere" },
  compactTitle: { margin: 0, color: "white", fontSize: 20, lineHeight: 1.08, overflowWrap: "anywhere" },
  subtitle: { margin: "8px 0 0", color: "#dbeafe", lineHeight: 1.35, fontSize: 13, overflowWrap: "anywhere" },
  symbols: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 },
  symbol: { padding: "5px 7px", borderRadius: 999, background: "rgba(255,255,255,.12)", color: "#f8fafc", fontSize: 11, fontWeight: 900 },
  bars: { display: "flex", alignItems: "end", gap: 5, height: 78, opacity: .72, position: "relative", zIndex: 1 },
  bar: { width: 10, borderRadius: "5px 5px 0 0", opacity: .8 }
}
