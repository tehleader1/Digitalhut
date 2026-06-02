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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

export function computeEngagementInterval(input = {}) {
  const orbitSeconds = Number(input.orbitSeconds || 0)
  const interactionCount = Number(input.interactionCount || 0)
  const idleSeconds = Number(input.idleSeconds || 0)
  const replayCount = Number(input.replayCount || 0)
  const savedCount = Number(input.savedCount || 0)
  const premium = input.tier === "premium" || input.tier === "pro"
  const engagementScore = clamp(
    Math.round(orbitSeconds / 12) + interactionCount * 2 + replayCount * 4 + savedCount * 5 - Math.round(idleSeconds / 18),
    0,
    40
  )

  if (idleSeconds >= 75) return { intervalMs: 36000, engagementScore, tempo: "idle-slow" }
  if (engagementScore >= 24) return { intervalMs: premium ? 9000 : 11000, engagementScore, tempo: "deep-orbit-fast" }
  if (engagementScore >= 12) return { intervalMs: premium ? 12000 : 14000, engagementScore, tempo: "active-orbit" }
  if (engagementScore >= 5) return { intervalMs: 18000, engagementScore, tempo: "warming-up" }
  return { intervalMs: 24000, engagementScore, tempo: "public-browse" }
}

function pulseSeed(input = {}) {
  const interval = computeEngagementInterval(input).intervalMs
  const tick = Math.floor(Date.now() / interval)
  const text = [input.intent, input.tier, input.wallet, input.referrer, input.behaviorHint, input.engagementScore].filter(Boolean).join("|")
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
  const tempo = computeEngagementInterval(input)
  const feed = pickFeed({ ...input, engagementScore: tempo.engagementScore })
  const boost = behaviorBoost(input)
  const premium = input.tier === "premium" || input.tier === "pro"
  const walletActive = Boolean(input.wallet && !String(input.wallet).startsWith("0xDEMO"))

  return {
    generatedAt: new Date().toISOString(),
    intervalMs: tempo.intervalMs,
    tempo: tempo.tempo,
    engagementScore: tempo.engagementScore,
    pulseId: `${feed.id}-${Math.floor(Date.now() / tempo.intervalMs)}`,
    label: feed.headline,
    query: feed.query,
    category: feed.category,
    priority: boost ? "personalized" : premium ? "member-live" : "public-live",
    sourceMix: feed.sourceMix,
    intent: input.intent || "anonymous-new-user",
    walletMode: walletActive ? "wallet-aware" : "guest-aware",
    membershipMode: premium ? "premium" : "public",
    reason: boost
      ? `Feed selected from ${boost} plus DigitalHut orbit behavior.`
      : `Feed selected from observatory orbit engagement. Tempo: ${tempo.tempo}.`,
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
