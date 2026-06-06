"use client"

import BabylonObservatory from "../app/components/BabylonObservatory"
import { resolveActiveFeedVisual } from "../lib/domain/visualResolver"

export default function UniversalFeedVisual({ activeFeed, scope = "hero" }) {
  const visual = resolveActiveFeedVisual(activeFeed, { scope })

  if (visual.kind === "model") {
    return <div style={styles.wrap}>
      <BabylonObservatory modelUrl={visual.src} title={visual.title} />
      <VisualBadge visual={visual} />
    </div>
  }

  if (visual.kind === "image") {
    return <div style={styles.wrap}>
      <img src={visual.src} alt={visual.title} style={styles.image} />
      <VisualBadge visual={visual} />
    </div>
  }

  if (visual.kind === "market") {
    return <div style={{...styles.synthetic, background: marketBackground(visual.accent)}}>
      <VisualBadge visual={visual} />
      <div style={styles.marketGrid}>
        {visual.symbols.map((symbol, index) => <div key={symbol} style={styles.marketTile}>
          <span style={styles.symbol}>{symbol}</span>
          <div style={styles.sparkBars}>
            {[0, 1, 2, 3, 4].map((bar) => <i key={bar} style={{...styles.sparkBar, height: 16 + ((index + bar) % 5) * 12, background: visual.accent}} />)}
          </div>
        </div>)}
      </div>
      <p style={styles.caption}>Market symbols are the visual source for this active feed.</p>
    </div>
  }

  if (visual.kind === "terrain") {
    return <div style={{...styles.synthetic, background: terrainBackground(visual.accent)}}>
      <VisualBadge visual={visual} />
      <div style={styles.terrainFrame}>
        <div style={styles.horizon} />
        <div style={styles.gridPlane} />
        <div style={{...styles.orbit, borderColor: visual.accent}} />
      </div>
      <h2 style={styles.syntheticTitle}>{visual.title}</h2>
      <p style={styles.caption}>{visual.query}</p>
    </div>
  }

  return <div style={{...styles.synthetic, background: fallbackBackground(visual.accent)}}>
    <VisualBadge visual={visual} />
    <div style={{...styles.clientMark, borderColor: visual.accent, color: visual.accent}}>{String(visual.clientType || "DH").slice(0, 2).toUpperCase()}</div>
    <h2 style={styles.syntheticTitle}>{visual.label}</h2>
    <p style={styles.caption}>{visual.detail}</p>
  </div>
}

function VisualBadge({ visual }) {
  return <div style={styles.badge}>
    <span>{visual.source}</span>
    <b>{visual.label}</b>
  </div>
}

function marketBackground(accent) {
  return `linear-gradient(135deg, rgba(2,6,23,.98), rgba(15,23,42,.92)), radial-gradient(circle at 20% 20%, ${accent}55, transparent 42%)`
}

function terrainBackground(accent) {
  return `radial-gradient(circle at 30% 18%, ${accent}44, transparent 35%), linear-gradient(145deg, #051923, #020617 58%, #0f172a)`
}

function fallbackBackground(accent) {
  return `radial-gradient(circle at center, ${accent}38, transparent 36%), linear-gradient(145deg, #020617, #111827)`
}

const styles = {
  wrap: { position: "relative", minWidth: 0, width: "100%", height: "100%", minHeight: 0, display: "grid" },
  image: { width: "100%", height: "100%", minHeight: 0, objectFit: "cover", display: "block", background: "#020617" },
  badge: { position: "absolute", left: 14, top: 14, zIndex: 2, padding: "9px 11px", borderRadius: 8, border: "1px solid rgba(226,232,240,.22)", background: "rgba(2,6,23,.72)", color: "white", display: "grid", gap: 3, backdropFilter: "blur(8px)", maxWidth: "calc(100% - 28px)" },
  synthetic: { position: "relative", width: "100%", height: "100%", minHeight: 0, padding: 20, borderRadius: 8, overflow: "hidden", display: "grid", alignContent: "end", gap: 12, boxSizing: "border-box" },
  marketGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(96px,1fr))", gap: 12, marginTop: 58 },
  marketTile: { minHeight: 132, padding: 12, borderRadius: 8, border: "1px solid rgba(226,232,240,.16)", background: "rgba(2,6,23,.58)", display: "grid", alignContent: "space-between", gap: 16 },
  symbol: { fontSize: 24, fontWeight: 900, color: "white" },
  sparkBars: { height: 70, display: "flex", alignItems: "end", gap: 6 },
  sparkBar: { width: "100%", borderRadius: "5px 5px 0 0", opacity: .86 },
  terrainFrame: { position: "absolute", inset: 0, opacity: .84, overflow: "hidden" },
  horizon: { position: "absolute", left: 0, right: 0, top: "42%", height: 1, background: "rgba(226,232,240,.32)" },
  gridPlane: { position: "absolute", left: "-20%", right: "-20%", bottom: "-8%", height: "52%", backgroundImage: "linear-gradient(rgba(103,232,249,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(103,232,249,.18) 1px, transparent 1px)", backgroundSize: "44px 30px", transform: "perspective(420px) rotateX(62deg)", transformOrigin: "50% 100%" },
  orbit: { position: "absolute", width: 180, height: 180, border: "2px solid", borderRadius: "50%", left: "calc(50% - 90px)", top: "calc(34% - 90px)", boxShadow: "0 0 40px rgba(103,232,249,.18)" },
  clientMark: { width: 120, height: 120, borderRadius: 8, border: "2px solid", display: "grid", placeItems: "center", fontSize: 44, fontWeight: 900, background: "rgba(2,6,23,.5)", marginTop: 70 },
  syntheticTitle: { margin: 0, fontSize: "clamp(28px,5vw,52px)", lineHeight: 1, color: "white", overflowWrap: "anywhere", position: "relative", zIndex: 1 },
  caption: { margin: 0, color: "#dbeafe", fontSize: 16, lineHeight: 1.5, overflowWrap: "anywhere", position: "relative", zIndex: 1 }
}
