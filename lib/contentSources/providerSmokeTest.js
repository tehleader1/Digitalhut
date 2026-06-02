import realEstateRegistry from "../../data/real-estate-source-registry.json"
import { getSourceRegistrySnapshot } from "./sourceRegistry"
import { testSketchfabModelSource } from "../assetIntake/modelSourceAdapters"
import { testCesiumLocationSource } from "../locationFeeds/locationSourceAdapters"
import { testAllMarketSources } from "../marketProfiles/marketSourceAdapters"

export async function runProviderSmokeTest({ query, symbol } = {}) {
  const activeQuery = query || realEstateRegistry.canonicalTarget.query
  const activeSymbol = symbol || realEstateRegistry.canonicalTarget.marketSymbols[0] || "AAPL"
  const locationContext = realEstateRegistry.canonicalTarget.locationContext

  const [sketchfab, marketSources] = await Promise.all([
    testSketchfabModelSource(activeQuery),
    testAllMarketSources(activeSymbol)
  ])

  const cesium = testCesiumLocationSource(locationContext)
  const providers = [sketchfab, cesium, ...marketSources]

  return {
    generatedAt: new Date().toISOString(),
    mode: "provider-smoke-test",
    query: activeQuery,
    symbol: activeSymbol,
    summary: {
      total: providers.length,
      live: providers.filter((item) => item.status === "live" || item.status === "configured").length,
      keyPresent: providers.filter((item) => item.keyPresent).length,
      renderable: providers.filter((item) => item.canRender).length
    },
    registry: getSourceRegistrySnapshot(),
    providers
  }
}
