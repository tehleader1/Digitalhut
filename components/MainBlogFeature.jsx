"use client"

import { buildPersonaFeatureHref } from "../lib/personaFeature"
import UniversalFeedVisual from "./UniversalFeedVisual"

export default function MainBlogFeature({ feature, permission, busy = false, onScan }) {
  if (!feature) return null
  const href = buildPersonaFeatureHref(feature.intent)
  const activeFeed = {
    title: feature.mainFeatureTitle,
    category: feature.observatory?.category || feature.marketProfile || feature.intent,
    clientType: feature.intent,
    terrainUrl: feature.mainGLBSearch,
    marketSymbols: feature.market?.symbols || [],
    sourceApi: "persona-feature",
    agentNarration: feature.blogAngle,
    walletTierRequired: feature.downloadTier
  }

  return <section style={styles.wrap} aria-labelledby="main-blog-feature-title">
    <div style={styles.visual}>
      <UniversalFeedVisual activeFeed={activeFeed} />
    </div>

    <div style={styles.copy}>
      <p style={styles.eyebrow}>{feature.label} main feature</p>
      <h2 id="main-blog-feature-title" style={styles.title}>{feature.mainFeatureTitle}</h2>
      <p style={styles.lede}>{feature.blogAngle}</p>
      <div style={styles.metaGrid}>
        <Meta label="Main GLB" value={feature.mainGLBSearch}/>
        <Meta label="Download tier" value={feature.downloadTier}/>
        <Meta label="Wallet action" value={feature.walletAction}/>
        <Meta label="Runner priority" value={feature.runnerPriority}/>
      </div>
      <div style={styles.actions}>
        <button type="button" onClick={() => onScan?.(feature.mainGLBSearch)} style={styles.primary}>{busy ? "Scanning" : "Run feature scan"}</button>
        <a href={href} style={styles.secondary}>Open feature brief</a>
      </div>
    </div>

    <aside style={styles.panel}>
      <p style={styles.panelLabel}>SEO feature packet</p>
      <h3 style={styles.panelTitle}>{feature.seoTitle}</h3>
      <p style={styles.panelText}>{feature.seoDescription}</p>
      <div style={styles.tags}>{feature.seoKeywords?.slice(0, 5).map((keyword) => <span key={keyword} style={styles.tag}>{keyword}</span>)}</div>
      {permission ? <p style={styles.permission}>{permission.message}</p> : null}
    </aside>
  </section>
}

function Meta({ label, value }) {
  return <div style={styles.metaItem}>
    <span style={styles.metaLabel}>{label}</span>
    <b style={styles.metaValue}>{value}</b>
  </div>
}

const styles = {
  wrap: {
    maxWidth: 1180,
    margin: "22px auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))",
    gap: 18,
    padding: 20,
    border: "1px solid rgba(148,163,184,.25)",
    borderRadius: 8,
    background: "rgba(15,23,42,.78)",
    boxSizing: "border-box"
  },
  visual: { minWidth: 0, minHeight: 420, borderRadius: 8, overflow: "hidden" },
  copy: { minWidth: 0 },
  eyebrow: { margin: "0 0 8px", color: "#67e8f9", fontSize: 12, fontWeight: 900, letterSpacing: 0, textTransform: "uppercase" },
  title: { margin: "0 0 12px", fontSize: "clamp(28px,5vw,50px)", lineHeight: 1.02, letterSpacing: 0 },
  lede: { margin: "0 0 16px", color: "#d8e4ee", fontSize: 17, lineHeight: 1.55 },
  metaGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10, marginBottom: 16 },
  metaItem: { minWidth: 0, padding: 12, border: "1px solid rgba(148,163,184,.2)", borderRadius: 8, background: "rgba(2,6,23,.35)" },
  metaLabel: { display: "block", color: "#a7b6cc", fontSize: 12, marginBottom: 4 },
  metaValue: { display: "block", color: "white", overflowWrap: "anywhere", fontSize: 13, textTransform: "capitalize" },
  actions: { display: "flex", gap: 10, flexWrap: "wrap" },
  primary: { padding: "14px 18px", borderRadius: 8, background: "#14b8a6", color: "#021014", border: 0, fontWeight: 900, cursor: "pointer" },
  secondary: { display: "inline-block", padding: "13px 16px", borderRadius: 8, background: "rgba(226,232,240,.1)", color: "white", border: "1px solid rgba(226,232,240,.24)", fontWeight: 800, textDecoration: "none" },
  panel: { minWidth: 0, padding: 16, border: "1px solid rgba(103,232,249,.24)", borderRadius: 8, background: "rgba(8,20,32,.82)" },
  panelLabel: { margin: "0 0 8px", color: "#a5f3fc", fontSize: 12, fontWeight: 900, textTransform: "uppercase" },
  panelTitle: { margin: "0 0 10px", fontSize: 22, lineHeight: 1.15 },
  panelText: { margin: "0 0 12px", color: "#cbd5e1", lineHeight: 1.5 },
  tags: { display: "flex", gap: 8, flexWrap: "wrap" },
  tag: { padding: "6px 9px", borderRadius: 999, background: "rgba(56,189,248,.14)", color: "#bae6fd", fontSize: 12, fontWeight: 800 },
  permission: { margin: "14px 0 0", color: "#facc15", lineHeight: 1.4, fontSize: 13 }
}
