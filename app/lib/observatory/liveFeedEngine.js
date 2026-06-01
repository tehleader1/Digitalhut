const feedDeck = [
  {
    id: "wall-street-pulse",
    category: "financial-district",
    query: "wall street new york financial district 3d",
    headline: "Wall Street market terrain is rotating into view",
    intent: ["crypto-trader", "stock-trader"],
    sourceMix: ["market", "city", "public-3d"]
  },
  {
    id: "ancient-rome-walkthrough",
    category: "history",
    query: "ancient rome colosseum 3d",
    headline: "Ancient Rome opens as a public history observatory",
    intent: ["tourist", "student", "anonymous-new-user"],
    sourceMix: ["history", "education", "public-3d"]
  },
  {
    id: "tokyo-infrastructure-scan",
    category: "city-structures",
    query: "tokyo building city infrastructure 3d",
    headline: "Tokyo infrastructure scan is ready for orbit",
    intent: ["real-estate-scout", "developer-agent-operator"],
    sourceMix: ["city", "infrastructure", "maps"]
  },
  {
    id: "planetary-lava-tube",
    category: "planetary",
    query: "moon terrain lava tube 3d",
    headline: "Planetary terrain feed is refreshing",
    intent: ["researcher", "student", "anonymous-new-user"],
    sourceMix: ["planet", "research", "terrain"]
  },
  {
    id: "florida-coastline-feed",
    category: "travel-map",
    query: "florida coastline map 3d",
    headline: "Florida coastline travel map is surfacing",
    intent: ["tourist", "real-estate-scout"],
    sourceMix: ["travel", "maps", "terrain"]
  },
  {
    id: "caribbean-public-gallery",
    category: "travel-gallery",
    query: "caribbean island terrain 3d",
    headline: "Caribbean public gallery is entering the feed",
    intent: ["tourist", "anonymous-new-user"],
    sourceMix: ["travel", "terrain", "public-3d"]
  },
  {
    id: "glb-asset-market",
    category: "glb-assets",
    query: "downloadable glb city model",
    headline: "GLB asset market is being sampled",
    intent: ["3d-asset-buyer", "developer-agent-operator"],
    sourceMix: ["glb", "prototype", "library"]
  },
  {
    id: "egypt-historical-sites",
    category: "history",
    query: "egypt historical sites pyramid 3d",
    headline: "Egypt historical observatory is rising in the public feed",
    intent: ["tourist", "student", "researcher"],
    sourceMix: ["history", "travel", "education"]
  }
]

const intentAliases = {
  "crypto-trader": ["crypto-trader", "stock-trader"],
  "stock-trader": ["stock-trader", "crypto-trader"],
  "real-estate-scout": ["real-estate-scout", "tourist"],
  "3d-asset-buyer": ["3d-asset-buyer", "developer-agent-operator"],
  "developer-agent-operator": ["developer-agent-operator", "3d-asset-buyer"],
  "anonymous-new-user": ["anonymous-new-user", "tourist", "student"],
  tourist: ["tourist", "anonymous-new-user"],
  student: ["student", "researcher"],
  researcher: ["researcher", "student"]
}

function pulseSeed(input = {}) {
  const tick = Math.floor(Date.now() / 16000)
  const text = [input.intent, input.tier, input.wallet, input.referrer, input.behaviorHint].filter(Boolean).join("|")
  const hash = text.split("").reduce((total, char, index) => total + char.charCodeAt(0) * (index + 3), 19)
  return tick + hash
}

function pickFeed(input = {}) {
  const intent = input.intent || "anonymous-new-user"
  const wanted = intentAliases[intent] || [intent, "anonymous-new-user"]
  const pool = feedDeck.filter(feed => feed.intent.some(item => wanted.includes(item)))
  const candidates = pool.length ? pool : feedDeck
  return candidates[pulseSeed(input) % candidates.length]
}

function behaviorBoost(input = {}) {
  const hint = String(input.behaviorHint || "").toLowerCase()
  if (!hint) return null
  if (hint.includes("youtube") || hint.includes("video")) return "video research signal"
  if (hint.includes("maps") || hint.includes("trip") || hint.includes("uber")) return "location movement signal"
  if (hint.includes("social") || hint.includes("trend")) return "public social trend signal"
  return "visitor behavior signal"
}

export function buildLiveObservatoryPulse(input = {}) {
  const feed = pickFeed(input)
  const boost = behaviorBoost(input)
  const premium = input.tier === "premium" || input.tier === "pro"
  const walletActive = Boolean(input.wallet && !String(input.wallet).startsWith("0xDEMO"))

  return {
    generatedAt: new Date().toISOString(),
    intervalMs: 16000,
    pulseId: `${feed.id}-${Math.floor(Date.now() / 16000)}`,
    label: feed.headline,
    query: feed.query,
    category: feed.category,
    priority: boost ? "personalized" : premium ? "member-live" : "public-live",
    sourceMix: feed.sourceMix,
    intent: input.intent || "anonymous-new-user",
    walletMode: walletActive ? "wallet-aware" : "guest-aware",
    membershipMode: premium ? "premium" : "public",
    reason: boost
      ? `Feed selected from ${boost} plus DigitalHut activity.`
      : "Feed selected from public observatory rotation and current intent.",
    actions: [
      { label: "Open observatory", query: feed.query },
      { label: "Save to library", action: "favorite-feed" },
      { label: "Refresh pulse", action: "next-live-feed" }
    ],
    privacy: "External activity sources require explicit opt-in or import. DigitalHut does not silently read Uber, Maps, YouTube, or social accounts."
  }
}

export function listLiveFeedDeck() {
  return feedDeck
}
