const dailyBeats = [
  {
    slug: "wall-street-orbit",
    section: "Markets",
    headline: "Wall Street Orbit Opens The Public Observatory Desk",
    deck: "A finance visitor gets a market-aware entry point, a Wall Street 3D preload, and a clean path into deeper technical reads.",
    observatoryQuery: "wall street new york financial district 3d",
    symbols: ["BTC", "ETH", "SPY", "NVDA"],
    tags: ["market-intelligence", "wall-street", "3d-feed"]
  },
  {
    slug: "firecuda-glb-lab",
    section: "Observatory Lab",
    headline: "FireCuda GLB Lab Starts Testing Large Model Quality",
    deck: "DigitalHut now treats 3D models like production assets: collected, measured, hashed, and prepared for prototype-grade orbit viewing.",
    observatoryQuery: "downloadable glb city model",
    symbols: ["AAPL", "TSLA", "NVDA", "SPY"],
    tags: ["firecuda", "glb", "asset-quality"]
  },
  {
    slug: "public-3d-market",
    section: "Public Feed",
    headline: "The Public 3D Market Gets A Newsdesk Layer",
    deck: "The homepage can now lead with a featured observatory post, making the site feel more like a live public broadcast than a static app shell.",
    observatoryQuery: "global city landmark 3d scan",
    symbols: ["BTC", "ETH", "AAPL", "SPY"],
    tags: ["public-gallery", "seo", "observatory"]
  },
  {
    slug: "wallet-social-signal",
    section: "Wallet Feed",
    headline: "Wallet Signals Become A Lightweight Social Context Layer",
    deck: "Wallet tier, market interest, and observatory searches now have a path into adaptive social signals without exposing private user data.",
    observatoryQuery: "trading floor data visualization 3d",
    symbols: ["BTC", "ETH", "SOL", "NVDA"],
    tags: ["wallet", "social-feed", "adaptive"]
  }
]

function dayNumber(date = new Date()) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 1)
  const today = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  return Math.floor((today - start) / 86400000)
}

function postForBeat(beat, index, date) {
  const isoDate = date.toISOString().slice(0, 10)
  return {
    id: `${isoDate}-${beat.slug}`,
    slug: beat.slug,
    section: beat.section,
    headline: beat.headline,
    deck: beat.deck,
    publishedAt: `${isoDate}T06:00:00.000Z`,
    observatoryQuery: beat.observatoryQuery,
    marketSymbols: beat.symbols,
    tags: beat.tags,
    seoTitle: `${beat.headline} | DigitalHut Observatory Daily`,
    seoDescription: beat.deck,
    readingMinutes: 3 + (index % 3),
    publicMode: true,
    orbitMode: "prototype-view",
    contentBlocks: [
      `DigitalHut is publishing this as a public observatory note so visitors can enter through news, markets, or 3D discovery without friction.`,
      `The featured 3D feed for this note is ${beat.observatoryQuery}. It is designed to open into an orbiting prototype view when a usable model is found.`,
      `The market context for this post tracks ${beat.symbols.join(", ")} as scenario symbols for broader technical intelligence coverage.`
    ]
  }
}

export function buildDailyBriefing(input = {}) {
  const date = input.date instanceof Date ? input.date : new Date()
  const offset = dayNumber(date)
  const rotated = dailyBeats.map((_, i) => dailyBeats[(offset + i) % dailyBeats.length])
  const posts = rotated.map((beat, index) => postForBeat(beat, index, date))
  const intent = input.intent || "public-observatory"

  return {
    generatedAt: date.toISOString(),
    cadence: "daily-0600-observatory-newsdesk",
    intent,
    source: "digitalhut-daily-briefing-engine",
    featured: posts[0],
    posts,
    seo: {
      publicationTone: "public-newsdesk",
      audience: ["3d-model-viewers", "market-watchers", "wallet-users", "public-gallery-visitors"],
      keywords: ["DigitalHut", "3D observatory", "GLB viewer", "market intelligence", "wallet feed", "public 3D models"]
    }
  }
}

export function listDailyBeats() {
  return dailyBeats
}
