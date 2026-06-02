import { runProviderSmokeTest } from "../../lib/contentSources/providerSmokeTest"

export const dynamic = "force-dynamic"

export default async function ProviderSmokeTestPage() {
  const smoke = await runProviderSmokeTest()

  return <main style={styles.shell}>
    <section style={styles.header}>
      <p style={styles.eyebrow}>Real Content Intake Layer</p>
      <h1 style={styles.title}>Provider Smoke Test</h1>
      <p style={styles.lede}>Testing Sketchfab, Cesium, Polygon, Alpha Vantage, and FMP before wiring real content deeper into the homepage.</p>
    </section>

    <section style={styles.summary}>
      <Summary label="Providers" value={smoke.summary?.total || 0}/>
      <Summary label="Live/configured" value={smoke.summary?.live || 0}/>
      <Summary label="Keys present" value={smoke.summary?.keyPresent || 0}/>
      <Summary label="Renderable" value={smoke.summary?.renderable || 0}/>
    </section>

    <section style={styles.grid}>
      {(smoke.providers || []).map((provider) => <ProviderCard key={provider.provider} provider={provider}/>) }
    </section>
  </main>
}

function Summary({ label, value }) {
  return <div style={styles.summaryCard}><b>{value}</b><span>{label}</span></div>
}

function ProviderCard({ provider }) {
  const good = provider.status === "live" || provider.status === "configured"
  return <article style={{...styles.card, borderLeftColor: good ? "#14b8a6" : "#facc15"}}>
    <div style={styles.cardTop}>
      <span style={styles.provider}>{provider.provider}</span>
      <span style={{...styles.pill, background: good ? "rgba(20,184,166,.18)" : "rgba(250,204,21,.16)"}}>{provider.status}</span>
    </div>
    <h2 style={styles.cardTitle}>{provider.sampleTitle || provider.category}</h2>
    <p style={styles.meta}>Category: {provider.category}</p>
    <p style={styles.meta}>Key present: {provider.keyPresent ? "yes" : "no"}</p>
    <p style={styles.meta}>Can render: {provider.canRender ? "yes" : "no"}</p>
    {provider.sampleImage ? <img src={provider.sampleImage} alt={`${provider.provider} preview`} style={styles.image}/> : null}
    {provider.samplePageUrl ? <a href={provider.samplePageUrl} style={styles.link}>Open source page</a> : null}
    {provider.sampleModelUrl ? <p style={styles.mono}>Model URL ready</p> : null}
    {provider.market ? <pre style={styles.pre}>{JSON.stringify(provider.market, null, 2)}</pre> : null}
    {provider.fallbackReason ? <p style={styles.warning}>{provider.fallbackReason}</p> : null}
  </article>
}

const styles = {
  shell: { minHeight: "100vh", padding: "28px 16px", background: "radial-gradient(circle at top left,#12343b 0,#020617 35%,#07111f 100%)", color: "white", fontFamily: "Arial, sans-serif", overflowX: "hidden" },
  header: { width: "min(100%,1180px)", margin: "0 auto 18px" },
  eyebrow: { margin: "0 0 8px", color: "#67e8f9", fontSize: 12, fontWeight: 900, letterSpacing: 0, textTransform: "uppercase" },
  title: { margin: "0 0 12px", fontSize: "clamp(40px,7vw,78px)", lineHeight: .96, letterSpacing: 0 },
  lede: { maxWidth: 760, color: "#d8e4ee", fontSize: 18, lineHeight: 1.55 },
  summary: { width: "min(100%,1180px)", margin: "0 auto 18px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10 },
  summaryCard: { padding: 14, border: "1px solid rgba(148,163,184,.25)", borderRadius: 8, background: "rgba(15,23,42,.74)", display: "grid", gap: 4 },
  grid: { width: "min(100%,1180px)", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", gap: 14 },
  card: { minWidth: 0, padding: 16, border: "1px solid rgba(148,163,184,.25)", borderLeft: "4px solid #14b8a6", borderRadius: 8, background: "rgba(15,23,42,.78)", overflowWrap: "anywhere" },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 10 },
  provider: { color: "#67e8f9", fontWeight: 900, textTransform: "uppercase", fontSize: 12 },
  pill: { padding: "6px 9px", borderRadius: 999, color: "#f7fbff", fontSize: 12, fontWeight: 900 },
  cardTitle: { margin: "0 0 10px", fontSize: 22, lineHeight: 1.15 },
  meta: { margin: "0 0 6px", color: "#cbd5e1", lineHeight: 1.4 },
  image: { width: "100%", aspectRatio: "16 / 9", objectFit: "cover", borderRadius: 8, margin: "10px 0", background: "#020617" },
  link: { display: "inline-block", marginTop: 8, color: "#a5f3fc", fontWeight: 900 },
  mono: { fontFamily: "monospace", color: "#a7f3d0", fontSize: 13 },
  pre: { maxHeight: 220, overflow: "auto", padding: 12, borderRadius: 8, background: "rgba(2,6,23,.55)", color: "#d8e4ee", fontSize: 12 },
  warning: { color: "#facc15", lineHeight: 1.4, marginBottom: 0 }
}
