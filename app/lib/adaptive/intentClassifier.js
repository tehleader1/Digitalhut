const cryptoTerms = ["BTC", "ETH", "SOL", "DOGE", "CRYPTO", "DEFI", "WALLET"]
const stockTerms = ["AAPL", "TSLA", "NVDA", "SPY", "STOCK", "EQUITY", "MARKET"]
const realEstateTerms = ["TERRAIN", "MAP", "PROPERTY", "CITY", "BUILDING", "REAL ESTATE", "ROUTE", "DIRECTIONS", "NEAR ME"]
const assetTerms = ["GLB", "MODEL", "ASSET", "SKETCHFAB", "3D"]
const operatorTerms = ["PROVIDER", "RENDER", "AGENT", "HEALTH", "DEPLOY"]
const touristTerms = ["UBER", "TRIP", "HOTEL", "AIRPORT", "TOUR", "VACATION", "ITALY", "ROME", "PARIS", "FLORIDA", "CARIBBEAN", "JAPAN"]
const studentTerms = ["YOUTUBE", "VIDEO", "DOCUMENTARY", "SCHOOL", "PROJECT", "STUDENT", "HISTORY", "SCIENCE", "TUTORIAL"]
const researcherTerms = ["RESEARCH", "STUDY", "PAPER", "DATA", "ENVIRONMENT", "GEOGRAPHY", "CLIMATE"]

function hasAny(text, terms) {
  return terms.some(term => text.includes(term))
}

export function classifyIntent(input = {}) {
  const text = [
    input.query,
    input.entry,
    input.lastMarketSymbol,
    input.lastObservatoryQuery,
    input.behaviorHint,
    input.importedSignal,
    input.wallet ? "wallet" : ""
  ]
    .filter(Boolean)
    .join(" ")
    .toUpperCase()

  if (hasAny(text, cryptoTerms)) return { intent: "crypto-trader", confidence: 0.82, reason: "Crypto or wallet signal detected" }
  if (hasAny(text, stockTerms)) return { intent: "stock-trader", confidence: 0.78, reason: "Stock or market symbol detected" }
  if (hasAny(text, touristTerms)) return { intent: "tourist", confidence: 0.76, reason: "Travel, trip, or destination signal detected" }
  if (hasAny(text, studentTerms)) return { intent: "student", confidence: 0.74, reason: "Education, video, or school project signal detected" }
  if (hasAny(text, researcherTerms)) return { intent: "researcher", confidence: 0.73, reason: "Research or data signal detected" }
  if (hasAny(text, realEstateTerms)) return { intent: "real-estate-scout", confidence: 0.72, reason: "Terrain, map, city, or building signal detected" }
  if (hasAny(text, assetTerms)) return { intent: "3d-asset-buyer", confidence: 0.7, reason: "3D asset or Sketchfab signal detected" }
  if (hasAny(text, operatorTerms)) return { intent: "developer-agent-operator", confidence: 0.68, reason: "Provider, render, or agent signal detected" }

  return { intent: "anonymous-new-user", confidence: 0.45, reason: "No strong intent signal detected yet" }
}
