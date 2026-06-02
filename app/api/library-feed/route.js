import { buildLibraryPulse } from "../../lib/library/libraryPulse"

export const dynamic = "force-dynamic"

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  return Response.json(buildLibraryPulse({
    intent: searchParams.get("intent") || "anonymous-new-user",
    tier: searchParams.get("tier") || "free",
    wallet: searchParams.get("wallet") || "",
    lastQuery: searchParams.get("lastQuery") || "",
    behaviorHint: searchParams.get("behaviorHint") || ""
  }))
}
