"use client"

import { buildPersonaFeatureHref, listPersonaFeatures } from "../lib/personaFeature"
import library from "../data/platform-libraries.json"
import DiscoverySnapshotVisual from "./DiscoverySnapshotVisual"

const liveExampleQueries = {
  "home-project": {
    title: "Alaska igloo",
    query: "alaska igloo",
    visualDescription: "snow shelter and cold-weather project planning",
    previewImage: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80"
  },
  "real-estate-scout": {
    title: "Canada mountains",
    query: "canada mountains",
    visualDescription: "Canadian mountain property and location preview",
    previewImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80"
  },
  gamer: {
    title: "Japanese game arena",
    query: "japanese game arena",
    visualDescription: "game-ready creator scene with Japanese visual identity",
    previewImage: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1200&q=80"
  },
  student: {
    title: "India market",
    query: "india market",
    visualDescription: "real-world study example with market and location context",
    previewImage: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80"
  },
  workforce: {
    title: "Warehouse training",
    query: "warehouse training",
    visualDescription: "training lane for equipment, workflow, safety, and operations",
    previewImage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80"
  },
  political: {
    title: "Washington civic district",
    query: "washington civic district",
    visualDescription: "public buildings, civic map context, and policy discovery surface",
    previewImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80"
  },
  "market-user": {
    title: "NVIDIA",
    query: "nvidia",
    visualDescription: "equity profile with company ticker and technical context",
    previewImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80"
  }
}

function marketProfileForFeature(feature) {
  const symbols = feature?.market?.symbols || []
  return library.marketProfiles.find((profile) => profile.symbols?.some((symbol) => symbols.includes(symbol))) || library.marketProfiles[0]
}

function cleanSearchQuery(value) {
  return String(value || "")
    .replace(/\b(project\s*)?glb\b/gi, "")
    .replace(/\b3d\s*model\b/gi, "")
    .replace(/\b3d\b/gi, "")
    .replace(/\bobservatory\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()
}

function exampleFeedFor(feature) {
  const marketProfile = marketProfileForFeature(feature)
  const liveExample = liveExampleQueries[feature.intent] || library.environmentLibrary?.[0] || {}
  const query = cleanSearchQuery(liveExample.query || feature.contextGLBSearch || feature.mainFeatureTitle || marketProfile.marketModelQuery)
  return {
    id: `live-example:${feature.intent}:${query}`,
    title: liveExample.title || feature.mainFeatureTitle,
    category: feature.observatory?.category || feature.marketProfile || feature.intent,
    clientType: feature.intent,
    intent: feature.intent,
    source: "live-example-feed",
    query,
    terrainUrl: query,
    previewImage: liveExample.previewImage || marketProfile.previewImage,
    marketSymbols: feature.market?.symbols || marketProfile.symbols || [],
    agentNarration: `${liveExample.title || feature.mainFeatureTitle}. ${feature.blogAngle}`,
    visualDescription: liveExample.visualDescription || query
  }
}

export default function AgentBlogHome({ activeIntent, activeFeed, onSelectFeed }) {
  const features = listPersonaFeatures()
  const active = features.find((feature) => feature.intent === activeIntent) || features[0]

  return <section style={styles.wrap} aria-labelledby="agent-blog-home-title">
    <div style={styles.header}>
      <div>
        <p style={styles.eyebrow}>Live examples</p>
        <h2 id="agent-blog-home-title" style={styles.title}>Examples render as visual feeds before they call live search.</h2>
      </div>
      <span style={styles.pill}>{activeFeed?.title || active?.label || "Adaptive"}</span>
    </div>
    <div style={styles.featureGrid}>
      {features.slice(0, 6).map((feature) => {
        const featureFeed = exampleFeedFor(feature)
        const selected = activeFeed?.id === featureFeed.id || activeFeed?.query === featureFeed.query || activeFeed?.intent === feature.intent || feature.intent === activeIntent
        return <article key={feature.intent} style={selected ? styles.activeCard : styles.card}>
          <DiscoverySnapshotVisual feed={featureFeed} scope="real world example" compact />
          <p style={styles.cardEyebrow}>{feature.label}</p>
          <h3 style={styles.cardTitle}>{featureFeed.title}</h3>
          <p style={styles.text}>{feature.blogAngle}</p>
          <p style={styles.queryLine}>Search: {featureFeed.query}</p>
          <div style={styles.meta}>{featureFeed.marketSymbols.slice(0, 4).map((symbol) => <span key={symbol} style={styles.tag}>{symbol}</span>)}</div>
          <div style={styles.actions}>
            <button type="button" onClick={() => onSelectFeed?.(featureFeed, { speak: true, scan: true })} style={styles.primary}>Register example</button>
            <button type="button" onClick={() => onSelectFeed?.(featureFeed, { speak: true, scan: true })} style={styles.secondaryBtn}>Search live</button>
            <a href={buildPersonaFeatureHref(feature.intent)} style={styles.secondary}>Read brief</a>
          </div>
        </article>
      })}
    </div>
    <div style={styles.marketStrip}>
      {library.marketProfiles.map((profile) => {
        const query = cleanSearchQuery(profile.marketModelQuery)
        const marketFeed = {
          id: `market-example:${profile.defaultSymbol || profile.title}:${query}`,
          title: profile.title,
          category: "market",
          visualMode: "market",
          source: "market-example-feed",
          previewImage: profile.previewImage,
          query,
          terrainUrl: query,
          marketSymbols: profile.symbols,
          agentNarration: profile.agentUse,
          visualDescription: profile.visualIdentity
        }
        return <div key={profile.title} style={styles.profile}>
          <DiscoverySnapshotVisual feed={marketFeed} scope="market profile" compact />
          <b>{profile.title}</b>
          <span>{profile.symbols.join(" / ")}</span>
          <p>{profile.agentUse}</p>
        </div>
      })}
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
  queryLine: { margin: 0, color: "#bae6fd", fontSize: 12, fontWeight: 900, lineHeight: 1.35, overflowWrap: "anywhere" },
  meta: { display: "flex", flexWrap: "wrap", gap: 7 },
  tag: { padding: "6px 8px", borderRadius: 999, background: "rgba(56,189,248,.12)", color: "#bae6fd", fontSize: 11, fontWeight: 800 },
  actions: { display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" },
  primary: { padding: "11px 12px", borderRadius: 8, background: "#14b8a6", color: "#021014", border: 0, fontWeight: 900, cursor: "pointer" },
  secondaryBtn: { padding: "10px 12px", borderRadius: 8, background: "rgba(56,189,248,.12)", color: "#bae6fd", border: "1px solid rgba(56,189,248,.24)", fontWeight: 900, cursor: "pointer" },
  secondary: { padding: "10px 12px", borderRadius: 8, background: "rgba(226,232,240,.1)", color: "white", border: "1px solid rgba(226,232,240,.24)", fontWeight: 800, textDecoration: "none" },
  marketStrip: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))", gap: 10, marginTop: 14 },
  profile: { minWidth: 0, padding: 12, border: "1px solid rgba(148,163,184,.18)", borderRadius: 8, background: "rgba(255,255,255,.05)", display: "grid", gap: 8, color: "#dbeafe", lineHeight: 1.35 }
}
