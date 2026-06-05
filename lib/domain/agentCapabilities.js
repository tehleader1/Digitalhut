export function getDigitalHutAgentManifest() {
  return {
    name: "DigitalHut",
    version: "2026.06.05-agent-layer-1",
    type: "feed-driven-observatory-platform",
    humanReadable: true,
    agentReadable: true,
    summary: "DigitalHut lets humans and AI agents search 3D models, inspect market intelligence, read active blog/FAQ context, and purchase wallet-gated access through one activeFeed system.",
    operatingModel: [
      "activeFeed",
      "visualResolver",
      "voice",
      "faq",
      "blog",
      "wallet",
      "permissions"
    ],
    capabilities: [
      { id: "observatory.search", label: "Search and render observatory models", endpoint: "/api/sketchfab", method: "POST", requiresTier: "free" },
      { id: "market.profile", label: "Inspect live or fallback market profile data", endpoint: "/api/market", method: "POST", requiresTier: "free" },
      { id: "library.catalog", label: "Read active library catalog lanes", endpoint: "/api/library-feed", method: "GET", requiresTier: "free" },
      { id: "wallet.permissions", label: "Check wallet tier and action permissions", endpoint: "/api/account", method: "GET/POST", requiresTier: "free" },
      { id: "subscription.intent", label: "Create fast wallet payment/subscription intent", endpoint: "/api/subscription", method: "POST", requiresTier: "free" },
      { id: "history.receipt", label: "Persist feed, payment, and action history", endpoint: "/api/history", method: "POST", requiresTier: "free" }
    ],
    pricing: [
      { tier: "free", usd: 0, purpose: "public browsing, search, basic feed context" },
      { tier: "standard", usd: 35, purpose: "saved feeds and stronger public workflow" },
      { tier: "premium", usd: 50, purpose: "deeper library/model permissions and premium workflows" },
      { tier: "pro", usd: 100, purpose: "advanced agent/business depth and priority workflows" }
    ],
    safeActions: [
      "read capability manifest",
      "read public library lanes",
      "compare market symbols",
      "request observatory search",
      "check wallet permission state",
      "create subscription intent",
      "request receipt/history write"
    ],
    trustSignals: [
      "provider health available at /health",
      "wallet destination returned by subscription intent",
      "permissions separated by wallet and tier",
      "market provider diagnostics included in responses",
      "Sketchfab result relevance score included in responses"
    ],
    agentOwnerQuestions: [
      "What can DigitalHut do for my owner?",
      "What does each tier unlock?",
      "Which wallet receives payment?",
      "Which APIs produced this answer?",
      "Can this action be performed safely?",
      "Where is the receipt or history entry?"
    ],
    contact: {
      supportPath: "/agent",
      humanPath: "/",
      marketPath: "/market-intelligence",
      libraryPath: "/library"
    }
  }
}
