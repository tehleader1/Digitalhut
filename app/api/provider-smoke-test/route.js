import { runProviderSmokeTest } from "../../../lib/contentSources/providerSmokeTest"

export const dynamic = "force-dynamic"

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const smoke = await runProviderSmokeTest({
    query: searchParams.get("query") || "",
    symbol: searchParams.get("symbol") || ""
  })

  return Response.json(smoke)
}
