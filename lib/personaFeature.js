import manifest from "../data/persona-feature-manifest.json"

const intentAliases = {
  "crypto-trader": "market-user",
  trader: "market-user",
  market: "market-user",
  "real-estate": "real-estate-scout",
  "real-estate-agent": "real-estate-scout",
  realtor: "real-estate-scout",
  gaming: "gamer",
  learner: "student",
  education: "student",
  worker: "workforce",
  job: "workforce",
  civic: "political",
  politics: "political",
  household: "home-project",
  "anonymous-new-user": "home-project"
}

export function listPersonaFeatures() {
  return manifest.personas
}

export function normalizeIntent(intent) {
  const raw = String(intent || manifest.defaultIntent).toLowerCase().trim()
  return intentAliases[raw] || raw || manifest.defaultIntent
}

export function getPersonaFeature(intent) {
  const normalized = normalizeIntent(intent)
  return manifest.personas.find((item) => item.intent === normalized) ||
    manifest.personas.find((item) => item.intent === manifest.defaultIntent) ||
    manifest.personas[0]
}

export function getPersonaSignal(intent) {
  const feature = getPersonaFeature(intent)
  return {
    label: feature.mainFeatureTitle,
    query: feature.mainGLBSearch,
    tone: feature.blogAngle,
    priority: feature.runnerPriority === "high" ? "High" : "Adaptive"
  }
}

export function getPersonaMarket(intent) {
  return getPersonaFeature(intent).market
}

export function getPersonaObservatory(intent) {
  const feature = getPersonaFeature(intent)
  return {
    preloadQuery: feature.mainGLBSearch,
    contextQuery: feature.contextGLBSearch,
    category: feature.observatory?.category || feature.intent,
    primaryLabel: feature.observatory?.primaryLabel || feature.primaryRenderRole,
    contextLabel: feature.observatory?.contextLabel || feature.contextRenderRole
  }
}

export function getPersonaInternalLinks(intent) {
  return getPersonaFeature(intent).internalLinks || []
}

export function buildFeatureSlug(value) {
  return String(value || "feature")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function buildPersonaFeatureHref(intent) {
  const feature = getPersonaFeature(intent)
  return `/blog/${buildFeatureSlug(feature.mainFeatureTitle)}`
}
