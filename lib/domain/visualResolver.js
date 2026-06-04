const clientFallbacks = {
  market: { label: "Market intelligence", accent: "#14b8a6", detail: "Symbol movement and live/fallback market context." },
  "market-user": { label: "Market intelligence", accent: "#14b8a6", detail: "Symbol movement and live/fallback market context." },
  "crypto-trader": { label: "Crypto market orbit", accent: "#22c55e", detail: "Crypto structure, liquidity, and watchlist movement." },
  "stock-trader": { label: "Equity market orbit", accent: "#38bdf8", detail: "Equity symbols, company context, and signal structure." },
  gamer: { label: "Game world preview", accent: "#a78bfa", detail: "Playable worlds, arenas, and downloadable asset context." },
  "real-estate-scout": { label: "Property visual scout", accent: "#facc15", detail: "Homes, neighborhoods, terrain, and property planning context." },
  student: { label: "Study visual explainer", accent: "#60a5fa", detail: "Learning models, study context, and guided discovery." },
  workforce: { label: "Business workflow visual", accent: "#fb7185", detail: "Facilities, workflow, training, and operations context." },
  tourist: { label: "Travel route visual", accent: "#2dd4bf", detail: "Destinations, landmarks, routes, and trip memory." },
  history: { label: "History scene visual", accent: "#eab308", detail: "Historic places, artifacts, and public walk context." },
  construction: { label: "Construction planning visual", accent: "#f97316", detail: "Build sites, structures, terrain, and project planning." },
  researcher: { label: "Research terrain visual", accent: "#67e8f9", detail: "Environment, geography, data, and terrain comparisons." },
  "space-terrain": { label: "Space and terrain visual", accent: "#818cf8", detail: "Planetary terrain, maps, surfaces, and observatory scans." },
  "3d-asset-buyer": { label: "3D asset visual", accent: "#c084fc", detail: "Downloadable GLB assets and creator-ready model context." },
  default: { label: "DigitalHut observatory visual", accent: "#67e8f9", detail: "Adaptive feed context, model discovery, and visual intelligence." }
}

function clean(value) {
  return String(value || "").trim()
}

function asSymbols(value) {
  return Array.isArray(value) ? value.filter(Boolean).map((symbol) => String(symbol).toUpperCase()) : []
}

function fallbackFor(feed = {}) {
  const key = clean(feed.clientType || feed.intent || feed.category || "default").toLowerCase()
  return clientFallbacks[key] || clientFallbacks[feed.category] || clientFallbacks.default
}

export function resolveActiveFeedVisual(feed = {}) {
  const title = clean(feed.title) || "DigitalHut active feed"
  const category = clean(feed.category) || "observatory"
  const clientType = clean(feed.clientType || feed.intent || category) || "default"
  const symbols = asSymbols(feed.marketSymbols)

  if (clean(feed.modelUrl)) {
    return {
      kind: "model",
      source: "modelUrl",
      label: "Live 3D model",
      title,
      category,
      src: clean(feed.modelUrl),
      transcript: `Resolved ${title} to live modelUrl.`
    }
  }

  if (clean(feed.previewImage)) {
    return {
      kind: "image",
      source: "previewImage",
      label: "Preview image",
      title,
      category,
      src: clean(feed.previewImage),
      transcript: `Resolved ${title} to previewImage.`
    }
  }

  if (clean(feed.terrainUrl)) {
    return {
      kind: "terrain",
      source: "terrainUrl",
      label: "Terrain/context visual",
      title,
      category,
      query: clean(feed.terrainUrl),
      accent: fallbackFor(feed).accent,
      transcript: `Resolved ${title} to terrainUrl context ${feed.terrainUrl}.`
    }
  }

  if (symbols.length) {
    return {
      kind: "market",
      source: "marketSymbols",
      label: "Market symbol visual",
      title,
      category,
      symbols,
      accent: fallbackFor(feed).accent,
      transcript: `Resolved ${title} to market symbols ${symbols.join(", ")}.`
    }
  }

  const fallback = fallbackFor(feed)
  return {
    kind: "client-fallback",
    source: "clientType",
    label: fallback.label,
    title,
    category,
    clientType,
    accent: fallback.accent,
    detail: fallback.detail,
    transcript: `Resolved ${title} to ${fallback.label} from clientType ${clientType}.`
  }
}

export function enrichFeedWithResolvedVisual(feed = {}) {
  const resolvedVisual = resolveActiveFeedVisual(feed)
  return {
    ...feed,
    resolvedVisual,
    visualDescription: feed.visualDescription || resolvedVisual.transcript
  }
}
