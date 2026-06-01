import { buildLiveObservatoryPulse, listLiveFeedDeck } from "../../lib/observatory/liveFeedEngine"

export const dynamic = "force-dynamic"

function metric(searchParams, name) {
  const value = Number(searchParams.get(name) || 0)
  return Number.isFinite(value) ? value : 0
}

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const pulse = buildLiveObservatoryPulse({
    intent: searchParams.get("intent") || "anonymous-new-user",
    tier: searchParams.get("tier") || "free",
    wallet: searchParams.get("wallet") || "",
    referrer: searchParams.get("referrer") || "",
    behaviorHint: searchParams.get("behaviorHint") || "",
    orbitSeconds: metric(searchParams, "orbitSeconds"),
    interactionCount: metric(searchParams, "interactionCount"),
    idleSeconds: metric(searchParams, "idleSeconds"),
    replayCount: metric(searchParams, "replayCount"),
    savedCount: metric(searchParams, "savedCount")
  })

  return Response.json({
    pulse,
    deckSize: listLiveFeedDeck().length,
    mode: "engagement-aware-live-observatory-pulse"
  })
}
