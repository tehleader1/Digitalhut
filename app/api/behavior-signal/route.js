import { buildBehaviorSignal } from "../../lib/signals/behaviorSignals"

export const dynamic = "force-dynamic"

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  return Response.json(buildBehaviorSignal({
    query: searchParams.get("query") || "",
    source: searchParams.get("source") || "",
    referrer: searchParams.get("referrer") || "",
    intent: searchParams.get("intent") || "anonymous-new-user"
  }))
}

export async function POST(req) {
  const body = await req.json()
  return Response.json(buildBehaviorSignal({
    query: body.query || "",
    importedText: body.importedText || "",
    source: body.source || "manual-import",
    intent: body.intent || "anonymous-new-user"
  }))
}
