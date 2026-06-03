"use client"

import { buildPersonaFeatureHref, listPersonaFeatures } from "../lib/personaFeature"
import library from "../data/platform-libraries.json"

export default function AgentBlogHome({ activeIntent, activeFeed, onSelectFeed }) {
  const features = listPersonaFeatures()
  const active = features.find((feature) => feature.intent === activeIntent) || features[0]

  return <section style={styles.wrap} aria-labelledby="agent-blog-home-title">
    <div style={styles.header}>
      <div>
        <p style={styles.eyebrow}>Agent blog home</p>
        <h2 id="agent-blog-home-title" style={styles.title}>Agents combine API results into the main feature feed.</h2>
      </div>
      <span style={styles.pill}>{activeFeed?.title || active?.label || "Adaptive"}</span>
    </div>
    <div style={styles.featureGrid}>
      {features.slice(0, 6).map((feature) => {
        const selected = activeFeed?.intent === feature.intent || feature.intent === activeIntent
        return <article key={feature.intent} style={selected ? styles.activeCard : styles.card}>
          <p style={styles.cardEyebrow}>{feature.label}</p>
          <h3 style={styles.cardTitle}>{feature.mainFeatureTitle}</h3>
          <p style={styles.text}>{feature.blogAngle}</p>
          <div style={styles.meta}>{feature.market?.symbols?.slice(0, 4).map((symbol) => <span key={symbol} style={styles.tag}>{symbol}</span>)}</div>
          <div style={styles.actions}>
            <button type="button" onClick={() => onSelectFeed?.(feature)} style={styles.primary}>Use feed</button>
            <a href={buildPersonaFeatureHref(feature.intent)} style={styles.secondary}>Read brief</a>
          </div>
        </article>
      })}
    </div>
    <div style={styles.marketStrip}>
      {library.marketProfiles.map((profile) => <div key={profile.title} style={styles.profile}>
        <b>{profile.title}</b>
        <span>{profile.symbols.join(" / ")}</span>
        <p>{profile.agentUse}</p>
      </div>)}
    </div>
  </section>
}

const styles = {
  wrap: { maxWidth: 1180, margin: "22px auto", padding: 20, border: "1px solid rgba(148,163,184,.25)", borderRadius: 8, background: "rgba(15,23,42,.74)", boxSizing: "border-box" },
  header: { display: "flex", justifyContent: "space-between", gap: 14, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 16 },
  eyebrow: { margin: "0 0 8px", color: "#67e8f9", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0 },
  title: { margin: 0, fontSize: "clamp(26px,4vw,42px)", lineHeight: 1.06, letterSpacing: 0, maxWidth: 820 },
  pill: { fontSize: 12, padding: "7px 10px", borderRadius: 999, background: "rgba(103,232,249,.12)", color: "#a5f3fc", fontWeight: 900, maxWidth: 420, overflowWrap: "anywhere" },
  featureGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: 14 },
  card: { minWidth: 0, padding: 16, border: "1px solid rgba(148,163,184,.22)", borderRadius: 8, background: "rgba(2,6,23,.42)", display: "grid", gap: 10 },
  activeCard: { minWidth: 0, padding: 16, border: "1px solid rgba(45,212,191,.45)", borderRadius: 8, background: "rgba(20,184,166,.13)", display: "grid", gap: 10 },
  cardEyebrow: { margin: 0, color: "#a5f3fc", fontSize: 12, fontWeight: 900, textTransform: "uppercase" },
  cardTitle: { margin: 0, fontSize: 22, lineHeight: 1.12, overflowWrap: "anywhere" },
  text: { margin: 0, color: "#cbd5e1", lineHeight: 1.5, overflowWrap: "anywhere" },
  meta: { display: "flex", flexWrap: "wrap", gap: 7 },
  tag: { padding: "6px 8px", borderRadius: 999, background: "rgba(56,189,248,.12)", color: "#bae6fd", fontSize: 11, fontWeight: 800 },
  actions: { display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" },
  primary: { padding: "11px 12px", borderRadius: 8, background: "#14b8a6", color: "#021014", border: 0, fontWeight: 900, cursor: "pointer" },
  secondary: { padding: "10px 12px", borderRadius: 8, background: "rgba(226,232,240,.1)", color: "white", border: "1px solid rgba(226,232,240,.24)", fontWeight: 800, textDecoration: "none" },
  marketStrip: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))", gap: 10, marginTop: 14 },
  profile: { minWidth: 0, padding: 12, border: "1px solid rgba(148,163,184,.18)", borderRadius: 8, background: "rgba(255,255,255,.05)", display: "grid", gap: 5, color: "#dbeafe", lineHeight: 1.35 }
}
