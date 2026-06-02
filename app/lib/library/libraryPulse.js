const guestFavorites = [
  { title: "Wall Street Market Mirror", query: "wall street new york financial district 3d", category: "financial-district", audience: "market" },
  { title: "Ancient Rome Public Walkthrough", query: "ancient rome colosseum 3d", category: "history", audience: "tourist" },
  { title: "Florida Coastline Map", query: "florida coastline map 3d", category: "travel-map", audience: "tourist" },
  { title: "Moon Terrain Research Feed", query: "moon terrain lava tube 3d", category: "planetary", audience: "research" },
  { title: "Tokyo Infrastructure Orbit", query: "tokyo building city infrastructure 3d", category: "city-structures", audience: "real-estate" }
]

const premiumFavorites = [
  { title: "GLB Prototype Vault", query: "downloadable glb city model", category: "glb-assets", audience: "asset-buyer" },
  { title: "NYSE Market District Overlay", query: "new york stock exchange building 3d", category: "market-city", audience: "market" },
  { title: "Global Landmark Research Stack", query: "global landmark historical site 3d", category: "research", audience: "research" },
  { title: "Urban Development Scout Feed", query: "city infrastructure development 3d map", category: "real-estate", audience: "real-estate" }
]

function rankFeeds(feeds, input = {}) {
  const text = [input.intent, input.lastQuery, input.behaviorHint, input.tier].filter(Boolean).join(" ").toLowerCase()
  return feeds
    .map(feed => ({
      ...feed,
      score: [feed.title, feed.query, feed.category, feed.audience].join(" ").toLowerCase().split(" ")
        .reduce((score, word) => score + (word && text.includes(word) ? 1 : 0), 0)
    }))
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
}

export function buildLibraryPulse(input = {}) {
  const premium = input.tier === "premium" || input.tier === "pro"
  const base = premium ? [...premiumFavorites, ...guestFavorites] : guestFavorites
  const ranked = rankFeeds(base, input)
  const favorites = ranked.slice(0, premium ? 8 : 5)

  return {
    generatedAt: new Date().toISOString(),
    mode: premium ? "member-favorites" : "guest-favorites",
    intent: input.intent || "anonymous-new-user",
    walletMode: input.wallet ? "wallet-aware" : "guest-aware",
    favorites,
    unlocks: premium
      ? ["FireCuda GLB archive", "premium prototype feeds", "saved orbit history"]
      : ["save public feeds", "connect wallet", "unlock premium GLB vault"],
    privacy: "Guest favorites use current DigitalHut session signals. External app activity requires explicit opt-in import."
  }
}
