import RunnerStatusAliveLayer from "../components/RunnerStatusAliveLayer"

async function getRunnerStatus() {
  const now = new Date()
  const nextHour = new Date(now)
  nextHour.setHours(now.getHours() + 1, 0, 0, 0)
  const isoNow = now.toISOString()
  const isoNext = nextHour.toISOString()

  return {
    generatedAt: isoNow,
    system: {
      label: "DigitalHut Autonomous Surface",
      status: "alive",
      lastHourlyUpdate: isoNow,
      nextHourlyUpdate: isoNext,
      auditWindow: "between-hour",
      activeRunners: 4,
      fallbacks: 2,
      warnings: 3
    },
    runners: [
      {
        id: "glb-observatory",
        label: "GLB Observatory Runner",
        domain: "observatory",
        status: "live",
        phase: "orbit-ready",
        source: "vault-sketchfab-fallback",
        lastRun: isoNow,
        nextRun: isoNext,
        audit: "watch",
        tierGate: "pro",
        message: "Orbit preview is active. Download remains tier-gated until wallet permission is confirmed.",
        metrics: {assetsFound: 12, itemsUpdated: 4, fallbacks: 1}
      },
      {
        id: "market-profile",
        label: "Market Profile Runner",
        domain: "market",
        status: "degraded",
        phase: "fallback-candles",
        source: "alpaca-premium-fallback",
        lastRun: isoNow,
        nextRun: isoNext,
        audit: "watch",
        tierGate: "premium",
        message: "BTC/USD technical scan is visible with fallback candles until live Alpaca candles confirm.",
        metrics: {symbolsQueued: 6, profilesUpdated: 1, fallbacks: 1},
        market: {
          symbol: "BTC/USD",
          bias: "bullish",
          confidence: 72,
          volume: "confirming",
          gap: "none",
          movingAverages: "watching",
          support: "mapped",
          resistance: "mapped"
        }
      },
      {
        id: "seo-feature",
        label: "SEO Blog Feature Runner",
        domain: "blog",
        status: "queued",
        phase: "feature-rotation",
        source: "firecuda-d-drive",
        lastRun: isoNow,
        nextRun: isoNext,
        audit: "pending",
        tierGate: "none",
        message: "Homepage feature rail is ready for image, video, or 3D render rotation.",
        metrics: {featuresQueued: 5, postsPrepared: 2, backlinksChecked: 0}
      },
      {
        id: "wallet-account",
        label: "Wallet and Account Runner",
        domain: "wallet",
        status: "live",
        phase: "tier-gate-active",
        source: "wallet-session",
        lastRun: isoNow,
        nextRun: isoNext,
        audit: "pass",
        tierGate: "free",
        message: "Wallet state is visible. GLB downloads should remain locked until Standard, Pro, or Premium is active.",
        metrics: {walletsDetected: 1, permissionsGranted: 0, upgradeOptions: 3}
      }
    ]
  }
}

export default async function RunnerStatusPage() {
  const status = await getRunnerStatus()

  return <main style={styles.shell}>
    <section style={styles.intro}>
      <p style={styles.eyebrow}>Day-start audit/update combo</p>
      <h1 style={styles.title}>Runner Status + Alive State Layer</h1>
      <p style={styles.lede}>Hourly runners, between-hour audits, fallback visibility, wallet tier gates, market scan states, SEO feature rotation, and GLB Observatory readiness now have one shared surface.</p>
    </section>
    <RunnerStatusAliveLayer initialStatus={status}/>
  </main>
}

const styles = {
  shell: {
    minHeight: "100vh",
    padding: "28px 16px",
    background: "radial-gradient(circle at top left,#12343b 0,#020617 35%,#07111f 100%)",
    color: "white",
    fontFamily: "Arial, sans-serif"
  },
  intro: {
    width: "min(100%, 1180px)",
    margin: "0 auto 18px"
  },
  eyebrow: {
    margin: "0 0 8px",
    color: "#67e8f9",
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  title: {
    margin: "0 0 12px",
    fontSize: "clamp(40px,7vw,74px)",
    lineHeight: .96,
    letterSpacing: 0
  },
  lede: {
    maxWidth: 780,
    margin: 0,
    color: "#d8e4ee",
    fontSize: 18,
    lineHeight: 1.55
  }
}
