export const dynamic = "force-dynamic"

const now = new Date()
const nextHour = new Date(now)
nextHour.setHours(now.getHours() + 1, 0, 0, 0)

function iso(value) {
  return value.toISOString()
}

export async function GET() {
  const payload = {
    generatedAt: iso(now),
    system: {
      label: "DigitalHut Autonomous Surface",
      status: "alive",
      lastHourlyUpdate: iso(now),
      nextHourlyUpdate: iso(nextHour),
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
        lastRun: iso(now),
        nextRun: iso(nextHour),
        audit: "watch",
        tierGate: "pro",
        message: "Orbit preview is active. Download remains tier-gated until wallet permission is confirmed.",
        metrics: { assetsFound: 12, itemsUpdated: 4, fallbacks: 1 }
      },
      {
        id: "market-profile",
        label: "Market Profile Runner",
        domain: "market",
        status: "degraded",
        phase: "fallback-candles",
        source: "alpaca-premium-fallback",
        lastRun: iso(now),
        nextRun: iso(nextHour),
        audit: "watch",
        tierGate: "premium",
        message: "BTC/USD technical scan is visible with fallback candles until live Alpaca candles confirm.",
        metrics: { symbolsQueued: 6, profilesUpdated: 1, fallbacks: 1 },
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
        lastRun: iso(now),
        nextRun: iso(nextHour),
        audit: "pending",
        tierGate: "none",
        message: "Homepage feature rail is ready for image, video, or 3D render rotation.",
        metrics: { featuresQueued: 5, postsPrepared: 2, backlinksChecked: 0 }
      },
      {
        id: "wallet-account",
        label: "Wallet and Account Runner",
        domain: "wallet",
        status: "live",
        phase: "tier-gate-active",
        source: "wallet-session",
        lastRun: iso(now),
        nextRun: iso(nextHour),
        audit: "pass",
        tierGate: "free",
        message: "Wallet state is visible. GLB downloads should remain locked until Standard, Pro, or Premium is active.",
        metrics: { walletsDetected: 1, permissionsGranted: 0, upgradeOptions: 3 }
      }
    ]
  }

  return Response.json(payload)
}
