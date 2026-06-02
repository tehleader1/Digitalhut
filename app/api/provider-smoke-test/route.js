import realEstateRegistry from "../../../data/real-estate-source-registry.json"
import { getSourceRegistrySnapshot } from "../../../lib/contentSources/sourceRegistry"
import { testSketchfabModelSource } from "../../../lib/assetIntake/modelSourceAdapters"
import { testCesiumLocationSource } from "../../../lib/locationFeeds/locationSourceAdapters"
import { testAllMarketSources } from "../../../lib/marketProfiles/marketSourceAdapters"

export const dynamic = "force-dynamic"

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get("query") || realEstateRegistry.canonicalTarget.query
  const symbol = searchParams.get("symbol") || realEstateRegistry.canonicalTarget.marketSymbols[0] || "AAPL"
  const locationContext = realEstateRegistry.canonicalTarget.locationContext

  const [sketchfab, marketSources] = await Promise.all([
    testSketchfabModelSource(query),
    testAllMarketSources(symbol)
  ])

  const cesium = testCesiumLocationSource(locationContext)
  const providers = [sketchfab, cesium, ...marketSources]

  return Response.json({
    generatedAt: new Date().toISOString(),
    mode: "provider-smoke-test",
    query,
    symbol,
    summary: {
      total: providers.length,
      live: providers.filter((item) => item.status === "live" || item.status === "configured").length,
      keyPresent: providers.filter((item) => item.keyPresent).length,
      renderable: providers.filter((item) => item.canRender).length
    },
    registry: getSourceRegistrySnapshot(),
    providers
  })
}
