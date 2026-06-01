const feedMap = {
  "crypto-trader": {
    observatory: { preloadQuery: "wall street new york financial district 3d", category: "financial-district" },
    market: { defaultSymbol: "BTC", symbols: ["BTC", "ETH", "SPY", "NVDA"] },
    premium: { trigger: "market-depth", message: "Unlock full technical history and premium observatory feeds." }
  },
  "stock-trader": {
    observatory: { preloadQuery: "wall street trading floor new york 3d", category: "financial-district" },
    market: { defaultSymbol: "NVDA", symbols: ["NVDA", "AAPL", "TSLA", "SPY"] },
    premium: { trigger: "watchlist-depth", message: "Unlock premium watchlists, deeper signals, and saved scans." }
  },
  "real-estate-scout": {
    observatory: { preloadQuery: "new york city building map 3d", category: "city-structures" },
    market: { defaultSymbol: "SPY", symbols: ["SPY", "AAPL", "NVDA"] },
    premium: { trigger: "region-tracking", message: "Unlock region tracking and premium 3D location scans." }
  },
  "3d-asset-buyer": {
    observatory: { preloadQuery: "downloadable glb city model", category: "glb-assets" },
    market: { defaultSymbol: "BTC", symbols: ["BTC", "ETH"] },
    premium: { trigger: "asset-downloads", message: "Unlock premium GLB downloads and curated observatory libraries." }
  },
  "developer-agent-operator": {
    observatory: { preloadQuery: "infrastructure data center 3d", category: "operations" },
    market: { defaultSymbol: "SPY", symbols: ["SPY", "NVDA"] },
    premium: { trigger: "ops-monitoring", message: "Unlock agent monitoring, provider checks, and operations history." }
  },
  "anonymous-new-user": {
    observatory: { preloadQuery: "moon terrain lava tube", category: "planetary" },
    market: { defaultSymbol: "BTC", symbols: ["BTC", "ETH", "AAPL", "TSLA"] },
    premium: { trigger: "first-scan", message: "Explore market intelligence and observatory feeds, then unlock premium depth." }
  }
}

export function selectFeeds(intent) {
  return feedMap[intent] || feedMap["anonymous-new-user"]
}
