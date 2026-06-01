import { loadUniverse, listUniverseSources } from "../../lib/market/universeSources"
import { buildStockProfiles } from "../../lib/market/stockProfiles"

export const dynamic = "force-dynamic"

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const universe = searchParams.get("universe") || "sp500"
  const limit = Number(searchParams.get("limit") || "50")
  const includeProfiles = searchParams.get("profiles") !== "false"
  const loaded = await loadUniverse(universe, { limit })
  const profiles = includeProfiles ? buildStockProfiles(loaded.symbols, { dataMode: loaded.sourceStatus }) : []

  return Response.json({
    generatedAt: new Date().toISOString(),
    purpose: "DigitalHut 2026 stock profile collection test",
    universe: loaded.universe,
    label: loaded.label,
    sourceStatus: loaded.sourceStatus,
    count: loaded.count,
    totalAvailable: loaded.totalAvailable || loaded.count,
    sources: loaded.sources || listUniverseSources(),
    profiles,
    riskNote: "Profiles are scenario analytics and technical structure reads. Live provider confirmation is required before any trading decision."
  })
}
