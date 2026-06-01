import { buildLiveObservatoryPulse, listLiveFeedDeck } from "../../lib/observatory/liveFeedEngine"

export const dynamic = "force-dynamic"

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const pulse = buildLiveObservatoryPulse({
    intent: searchParams.get("intent") || "anonymous-new-user",
    tier: searchParams.get("tier") || "free",
    wallet: searchParams.get("wallet") || "",
    referrer: searchParams.get("referrer") || "",
    behaviorHint: searchParams.get("behaviorHint") || ""
  })

  return Response.json({
    pulse,
    deckSize: listLiveFeedDeck().length,
    mode: "sixteen-second-live-observatory-pulse"
  })
}
