const connectors = [
  {
    id: "google-maps",
    label: "Google Maps Timeline Import",
    status: "opt-in-required",
    signalType: "location-history",
    examples: ["recent city", "landmark search", "route pattern"]
  },
  {
    id: "uber-trips",
    label: "Uber Trip Import",
    status: "opt-in-required",
    signalType: "movement-history",
    examples: ["airport arrival", "downtown ride", "hotel district"]
  },
  {
    id: "youtube-watch",
    label: "YouTube Watch/Search Import",
    status: "opt-in-required",
    signalType: "video-research",
    examples: ["history video", "travel vlog", "market education"]
  },
  {
    id: "social-trends",
    label: "Public Social Trend Feed",
    status: "public-or-opt-in",
    signalType: "trend-interest",
    examples: ["city trend", "market topic", "landmark trend"]
  }
]

function normalize(value = "") {
  return String(value).toLowerCase()
}

export function buildBehaviorSignal(input = {}) {
  const text = normalize([input.query, input.importedText, input.referrer, input.source].filter(Boolean).join(" "))
  const signals = []

  if (text.includes("uber") || text.includes("airport") || text.includes("trip") || text.includes("hotel")) {
    signals.push({ source: "uber-trips", intent: "tourist", feedHint: "recent travel destination 3d map" })
  }
  if (text.includes("maps") || text.includes("route") || text.includes("directions") || text.includes("near me")) {
    signals.push({ source: "google-maps", intent: "real-estate-scout", feedHint: "city map infrastructure 3d" })
  }
  if (text.includes("youtube") || text.includes("video") || text.includes("documentary") || text.includes("tutorial")) {
    signals.push({ source: "youtube-watch", intent: "student", feedHint: "educational historical site 3d" })
  }
  if (text.includes("trend") || text.includes("viral") || text.includes("social")) {
    signals.push({ source: "social-trends", intent: "anonymous-new-user", feedHint: "public trending landmark 3d" })
  }

  const primary = signals[0] || { source: "digitalhut-session", intent: input.intent || "anonymous-new-user", feedHint: input.query || "public observatory 3d" }

  return {
    generatedAt: new Date().toISOString(),
    primary,
    signals,
    connectors,
    policy: "External app data must come from explicit OAuth, export upload, or user-entered context. No silent scraping."
  }
}
