import { runProviderSmokeTest } from "../../lib/contentSources/providerSmokeTest"

export const dynamic = "force-dynamic"

export default async function ProviderSmokeTestPage() {
  const smoke = await runProviderSmokeTest()

  return <main style={styles.shell}>
    <section style={styles.header}>
      <p style={styles.eyebrow}>Real Content Intake Layer</p>
      <h1 style={styles.title}>Provider Smoke Test</h1>
      <p style={styles.lede}>Testing Sketchfab, Cesium, Polygon, Alpha Vantage, and FMP with visible model, location, quote, and company profile surfaces.</p>
    </section>

    <section style={styles.summary}>
      <Summary label="Providers" value={smoke.summary?.total || 0}/>
      <Summary label="Live/configured" value={smoke.summary?.live || 0}/>
      <Summary label="Keys present" value={smoke.summary?.keyPresent || 0}/>
      <Summary label="Renderable" value={smoke.summary?.renderable || 0}/>
    </section>

    <section style={styles.intentPanel}>
      <p style={styles.intentLabel}>Active intake target</p>
      <h2 style={styles.intentTitle}>{smoke.query}</h2>
      <p style={styles.meta}>Market symbol: {smoke.symbol}</p>
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
  const good = provider.status === "live" || provider.status === "configured" || provider.status === "metadata-only"
  return <article style={{...styles.card, borderLeftColor: good ? "#14b8a6" : "#facc15"}}>
    <div style={styles.cardTop}>
      <span style={styles.provider}>{provider.provider}</span>
      <span style={{...styles.pill, background: good ? "rgba(20,184,166,.18)" : "rgba(250,204,21,.16)"}}>{provider.status}</span>
    </div>
    <h2 style={styles.cardTitle}>{provider.sampleTitle || provider.category}</h2>
    <p style={styles.meta}>Category: {provider.category}</p>
    <p style={styles.meta}>Key present: {provider.keyPresent ? "yes" : "no"}</p>
    <p style={styles.meta}>Can render: {provider.canRender ? "yes" : "no"}</p>

    <ProviderVisual provider={provider}/>

    {provider.samplePageUrl ? <a href={provider.samplePageUrl} style={styles.link}>Open source page</a> : null}
    {provider.sampleModelUrl ? <p style={styles.mono}>Downloadable GLB URL ready</p> : null}
    {provider.market ? <pre style={styles.pre}>{JSON.stringify(provider.market, null, 2)}</pre> : null}
    {provider.fallbackReason ? <p style={styles.warning}>{provider.fallbackReason}</p> : null}
  </article>
}

function ProviderVisual({ provider }) {
  if (provider.sampleEmbedUrl) {
    return <div style={styles.visualBlock}>
      <iframe
        src={provider.sampleEmbedUrl}
        title={`${provider.provider} embedded model`}
        style={styles.embed}
        allow="autoplay; fullscreen; xr-spatial-tracking"
        allowFullScreen
      />
      {provider.author ? <p style={styles.caption}>Model source: {provider.author}</p> : null}
    </div>
  }

  if (provider.visualType === "location-context" && provider.visual) {
    return <LocationVisual visual={provider.visual}/>
  }

  if (provider.visualType === "quote-card" && provider.visual) {
    return <QuoteVisual visual={provider.visual}/>
  }

  if (provider.visualType === "company-profile-card" && provider.visual) {
    return <CompanyProfileVisual visual={provider.visual} image={provider.sampleImage}/>
  }

  if (provider.sampleImage) {
    return <img src={provider.sampleImage} alt={`${provider.provider} preview`} style={styles.image}/>
  }

  return <div style={styles.placeholderVisual}>
    <span>{provider.visualType || "waiting-for-provider-visual"}</span>
  </div>
}

function LocationVisual({ visual }) {
  return <div style={styles.mapPanel}>
    <div style={styles.mapCanvas}>
      <span style={styles.mapGridLineA}/>
      <span style={styles.mapGridLineB}/>
      <span style={styles.mapDot}/>
      <span style={styles.mapRing}/>
    </div>
    <div style={styles.visualGrid}>
      <VisualMetric label="Location" value={visual.label}/>
      <VisualMetric label="Latitude" value={Number(visual.latitude).toFixed(4)}/>
      <VisualMetric label="Longitude" value={Number(visual.longitude).toFixed(4)}/>
      <VisualMetric label="Radius" value={`${visual.radiusMeters}m`}/>
    </div>
    <p style={styles.caption}>{visual.context}</p>
  </div>
}

function QuoteVisual({ visual }) {
  const positive = visual.tone !== "bearish"
  const width = Math.min(100, Math.max(16, Math.abs(Number(visual.changePercent) || Number(visual.change) || 12)))
  return <div style={styles.quotePanel}>
    <div style={styles.quoteTop}>
      <span style={styles.quoteSymbol}>{visual.symbol}</span>
      <span style={{...styles.tone, color: positive ? "#86efac" : "#fca5a5"}}>{visual.tone}</span>
    </div>
    <p style={styles.visualTitle}>{visual.label}</p>
    <p style={styles.price}>{visual.price === null ? "price pending" : visual.price}</p>
    <div style={styles.meter}><span style={{...styles.meterFill, width: `${width}%`, background: positive ? "#14b8a6" : "#f43f5e"}}/></div>
    <p style={styles.caption}>Change: {visual.change === null ? "pending" : visual.change} {visual.changePercent ? `(${visual.changePercent}%)` : ""}</p>
  </div>
}

function CompanyProfileVisual({ visual, image }) {
  return <div style={styles.companyPanel}>
    <div style={styles.companyTop}>
      {image ? <img src={image} alt={`${visual.symbol} logo`} style={styles.logo}/> : <span style={styles.logoFallback}>{visual.symbol?.slice(0, 2)}</span>}
      <div>
        <p style={styles.visualTitle}>{visual.label}</p>
        <p style={styles.caption}>{visual.symbol}</p>
      </div>
    </div>
    <div style={styles.visualGrid}>
      <VisualMetric label="Market" value={visual.market || "profile"}/>
      <VisualMetric label="Exchange" value={visual.exchange || "pending"}/>
      <VisualMetric label="Type" value={visual.type || "equity"}/>
      <VisualMetric label="Currency" value={visual.currency || "USD"}/>
    </div>
    {visual.price !== null && visual.price !== undefined ? <p style={styles.price}>{visual.price}</p> : null}
  </div>
}

function VisualMetric({ label, value }) {
  return <div style={styles.metric}>
    <span>{label}</span>
    <b>{value}</b>
  </div>
}

const styles = {
  shell: { minHeight: "100vh", padding: "28px 16px", background: "radial-gradient(circle at top left,#12343b 0,#020617 35%,#07111f 100%)", color: "white", fontFamily: "Arial, sans-serif", overflowX: "hidden" },
  header: { width: "min(100%,1180px)", margin: "0 auto 18px" },
  eyebrow: { margin: "0 0 8px", color: "#67e8f9", fontSize: 12, fontWeight: 900, letterSpacing: 0, textTransform: "uppercase" },
  title: { margin: "0 0 12px", fontSize: "clamp(40px,7vw,78px)", lineHeight: .96, letterSpacing: 0 },
  lede: { maxWidth: 760, color: "#d8e4ee", fontSize: 18, lineHeight: 1.55 },
  summary: { width: "min(100%,1180px)", margin: "0 auto 18px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10 },
  summaryCard: { padding: 14, border: "1px solid rgba(148,163,184,.25)", borderRadius: 8, background: "rgba(15,23,42,.74)", display: "grid", gap: 4 },
  intentPanel: { width: "min(100%,1180px)", margin: "0 auto 18px", padding: 16, border: "1px solid rgba(103,232,249,.28)", borderRadius: 8, background: "rgba(8,47,73,.46)" },
  intentLabel: { margin: "0 0 6px", color: "#67e8f9", fontSize: 12, fontWeight: 900, textTransform: "uppercase" },
  intentTitle: { margin: 0, fontSize: 24, lineHeight: 1.2 },
  grid: { width: "min(100%,1180px)", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))", gap: 14 },
  card: { minWidth: 0, padding: 16, border: "1px solid rgba(148,163,184,.25)", borderLeft: "4px solid #14b8a6", borderRadius: 8, background: "rgba(15,23,42,.78)", overflowWrap: "anywhere" },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 10 },
  provider: { color: "#67e8f9", fontWeight: 900, textTransform: "uppercase", fontSize: 12 },
  pill: { padding: "6px 9px", borderRadius: 999, color: "#f7fbff", fontSize: 12, fontWeight: 900 },
  cardTitle: { margin: "0 0 10px", fontSize: 22, lineHeight: 1.15 },
  meta: { margin: "0 0 6px", color: "#cbd5e1", lineHeight: 1.4 },
  visualBlock: { margin: "12px 0" },
  embed: { width: "100%", aspectRatio: "16 / 9", border: 0, borderRadius: 8, background: "#020617" },
  image: { width: "100%", aspectRatio: "16 / 9", objectFit: "cover", borderRadius: 8, margin: "10px 0", background: "#020617" },
  mapPanel: { margin: "12px 0", padding: 12, borderRadius: 8, border: "1px solid rgba(103,232,249,.25)", background: "rgba(8,47,73,.42)" },
  mapCanvas: { position: "relative", height: 190, overflow: "hidden", borderRadius: 8, background: "linear-gradient(135deg,rgba(20,184,166,.18),rgba(37,99,235,.2)), repeating-linear-gradient(90deg,rgba(255,255,255,.08) 0 1px,transparent 1px 34px), repeating-linear-gradient(0deg,rgba(255,255,255,.08) 0 1px,transparent 1px 34px)" },
  mapGridLineA: { position: "absolute", left: "12%", right: "8%", top: "45%", height: 2, background: "rgba(255,255,255,.34)", transform: "rotate(-12deg)" },
  mapGridLineB: { position: "absolute", top: "10%", bottom: "12%", left: "54%", width: 2, background: "rgba(255,255,255,.28)", transform: "rotate(18deg)" },
  mapDot: { position: "absolute", left: "49%", top: "42%", width: 14, height: 14, borderRadius: 999, background: "#67e8f9", boxShadow: "0 0 34px rgba(103,232,249,.9)" },
  mapRing: { position: "absolute", left: "39%", top: "30%", width: 96, height: 96, borderRadius: 999, border: "1px solid rgba(103,232,249,.55)" },
  visualGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 8, marginTop: 10 },
  metric: { minWidth: 0, padding: 10, borderRadius: 8, background: "rgba(2,6,23,.42)", display: "grid", gap: 4 },
  quotePanel: { margin: "12px 0", padding: 14, borderRadius: 8, border: "1px solid rgba(20,184,166,.24)", background: "rgba(6,78,59,.24)" },
  quoteTop: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 },
  quoteSymbol: { fontSize: 30, fontWeight: 900 },
  tone: { fontSize: 13, fontWeight: 900, textTransform: "uppercase" },
  visualTitle: { margin: "0 0 6px", fontWeight: 900, lineHeight: 1.25 },
  price: { margin: "8px 0", fontSize: 32, fontWeight: 900, lineHeight: 1 },
  meter: { height: 10, borderRadius: 999, background: "rgba(255,255,255,.12)", overflow: "hidden" },
  meterFill: { display: "block", height: "100%", borderRadius: 999 },
  companyPanel: { margin: "12px 0", padding: 14, borderRadius: 8, border: "1px solid rgba(148,163,184,.24)", background: "rgba(30,41,59,.5)" },
  companyTop: { display: "flex", gap: 12, alignItems: "center" },
  logo: { width: 52, height: 52, objectFit: "contain", borderRadius: 8, background: "white", padding: 6 },
  logoFallback: { width: 52, height: 52, borderRadius: 8, display: "grid", placeItems: "center", background: "rgba(103,232,249,.16)", color: "#67e8f9", fontWeight: 900 },
  placeholderVisual: { minHeight: 140, margin: "12px 0", borderRadius: 8, border: "1px dashed rgba(148,163,184,.38)", display: "grid", placeItems: "center", color: "#cbd5e1", background: "rgba(2,6,23,.34)" },
  caption: { margin: "8px 0 0", color: "#cbd5e1", fontSize: 13, lineHeight: 1.4 },
  link: { display: "inline-block", marginTop: 8, color: "#a5f3fc", fontWeight: 900 },
  mono: { fontFamily: "monospace", color: "#a7f3d0", fontSize: 13 },
  pre: { maxHeight: 220, overflow: "auto", padding: 12, borderRadius: 8, background: "rgba(2,6,23,.55)", color: "#d8e4ee", fontSize: 12 },
  warning: { color: "#facc15", lineHeight: 1.4, marginBottom: 0 }
}
