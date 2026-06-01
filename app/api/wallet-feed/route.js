import { buildHomepageState } from "../../lib/adaptive/homepageState"
import { buildDailyBriefing } from "../../lib/blog/dailyPosts"

export const dynamic = "force-dynamic"

function maskWallet(wallet = "") {
  if (!wallet) return "public-visitor"
  if (wallet.length < 12) return wallet
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
}

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const wallet = searchParams.get("wallet") || ""
  const query = searchParams.get("query") || ""
  const tier = searchParams.get("tier") || "free"
  const adaptive = buildHomepageState({ wallet, query, tier })
  const briefing = buildDailyBriefing({ intent: adaptive.intent })

  return Response.json({
    generatedAt: new Date().toISOString(),
    wallet: maskWallet(wallet),
    tier,
    intent: adaptive.intent,
    confidence: adaptive.confidence,
    publicSignal: {
      label: `${adaptive.intent.replaceAll("-", " ")} pulse`,
      observatoryQuery: adaptive.observatory.preloadQuery,
      marketSymbols: adaptive.market.symbols,
      featuredPost: briefing.featured.headline
    },
    privacy: "Wallet feed is masked and designed for public social context without exposing private keys or secrets."
  })
}
