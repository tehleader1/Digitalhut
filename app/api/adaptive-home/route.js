import { buildHomepageState } from "../../lib/adaptive/homepageState"

export const dynamic = "force-dynamic"

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const state = buildHomepageState({
    wallet: searchParams.get("wallet") || "",
    tier: searchParams.get("tier") || "free",
    query: searchParams.get("query") || searchParams.get("symbol") || "",
    entry: searchParams.get("entry") || "",
    lastMarketSymbol: searchParams.get("lastMarketSymbol") || "",
    lastObservatoryQuery: searchParams.get("lastObservatoryQuery") || ""
  })

  return Response.json(state)
}
