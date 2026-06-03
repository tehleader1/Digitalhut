"use client"

import library from "../data/platform-libraries.json"

function providerState(provider, healthProviders = {}) {
  const key = provider.name.toLowerCase()
  if (key.includes("sketchfab")) return healthProviders.sketchfab ? "live" : "fallback"
  if (key.includes("alpaca")) return healthProviders.alpaca ? "live" : "fallback"
  if (key.includes("supabase")) return healthProviders.supabase ? "live" : "local memory"
  if (key.includes("payment")) return healthProviders.paymentWalletConfigured || healthProviders.payment ? "ready" : "configure"
  return "check"
}

export default function ApiProviderShowcase({ health }) {
  const providers = health?.providers || {}

  return <section style={styles.wrap} aria-labelledby="api-provider-title">
    <div style={styles.header}>
      <div>
        <p style={styles.eyebrow}>API websites</p>
        <h2 id="api-provider-title" style={styles.title}>Live provider map for agents, blogs, models, and wallets.</h2>
      </div>
      <span style={styles.pill}>{health?.status || "checking"}</span>
    </div>
    <div style={styles.grid}>
      {library.providerSites.map((provider) => {
        const state = providerState(provider, providers)
        const live = ["live", "ready"].includes(state)
        return <article key={provider.name} style={styles.card}>
          <div style={styles.cardTop}>
            <h3 style={styles.cardTitle}>{provider.name}</h3>
            <b style={live ? styles.good : styles.warn}>{state}</b>
          </div>
          <p style={styles.text}>{provider.role}</p>
          <a href={provider.url} target="_blank" style={styles.link}>{provider.url.replace("https://", "")}</a>
          <div style={styles.tags}>{provider.envKeys.slice(0, 3).map((key) => <span key={key} style={styles.tag}>{key}</span>)}</div>
        </article>
      })}
    </div>
  </section>
}

const styles = {
  wrap: { maxWidth: 1180, margin: "22px auto", padding: 20, border: "1px solid rgba(148,163,184,.25)", borderRadius: 8, background: "rgba(15,23,42,.74)", boxSizing: "border-box" },
  header: { display: "flex", justifyContent: "space-between", gap: 14, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 16 },
  eyebrow: { margin: "0 0 8px", color: "#67e8f9", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0 },
  title: { margin: 0, fontSize: "clamp(26px,4vw,42px)", lineHeight: 1.06, letterSpacing: 0, maxWidth: 820 },
  pill: { fontSize: 12, padding: "7px 10px", borderRadius: 999, background: "rgba(103,232,249,.12)", color: "#a5f3fc", fontWeight: 900 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: 14 },
  card: { minWidth: 0, padding: 16, border: "1px solid rgba(148,163,184,.22)", borderRadius: 8, background: "rgba(2,6,23,.42)", display: "grid", gap: 10 },
  cardTop: { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" },
  cardTitle: { margin: 0, fontSize: 22, lineHeight: 1.12 },
  good: { color: "#86efac", textTransform: "uppercase", fontSize: 12 },
  warn: { color: "#facc15", textTransform: "uppercase", fontSize: 12 },
  text: { margin: 0, color: "#cbd5e1", lineHeight: 1.5, overflowWrap: "anywhere" },
  link: { color: "#a5f3fc", fontWeight: 900, overflowWrap: "anywhere" },
  tags: { display: "flex", flexWrap: "wrap", gap: 7 },
  tag: { padding: "6px 8px", borderRadius: 999, background: "rgba(56,189,248,.12)", color: "#bae6fd", fontSize: 11, fontWeight: 800 }
}
