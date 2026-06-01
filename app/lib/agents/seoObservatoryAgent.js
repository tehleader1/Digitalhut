import { buildDailyBriefing } from "../blog/dailyPosts"

export function buildSeoObservatoryPlan(input = {}) {
  const briefing = buildDailyBriefing({ intent: input.intent || "public-observatory" })
  const featured = briefing.featured

  return {
    generatedAt: new Date().toISOString(),
    agent: "seo-observatory-newsdesk",
    mission: "Blend public 3D discovery, market context, wallet social signals, and prototype-grade GLB viewing into one observatory experience.",
    featuredPost: {
      headline: featured.headline,
      seoTitle: featured.seoTitle,
      seoDescription: featured.seoDescription,
      observatoryQuery: featured.observatoryQuery,
      keywords: [...featured.tags, ...briefing.seo.keywords]
    },
    collectionTasks: [
      {
        lane: "glb-quality",
        action: "Collect candidate GLB URLs, save size/hash metadata, and flag oversized or missing model files for FireCuda review.",
        output: "DigitalHut/glb-cache"
      },
      {
        lane: "market-universe",
        action: "Collect S&P 500, NASDAQ, and NYSE stock profile scenarios for broad market search coverage.",
        output: "DigitalHut/marketplace-exports"
      },
      {
        lane: "public-newsdesk",
        action: "Feature one observatory daily post on the homepage and archive the full post list on /blog.",
        output: "/api/blog/daily"
      },
      {
        lane: "wallet-social",
        action: "Convert masked wallet and visitor intent into public context signals without exposing secrets.",
        output: "/api/wallet-feed"
      }
    ],
    editorialTone: "BBC/CNN/ABC public access energy: useful headline, clear feed, visual proof, and open entry for casual visitors.",
    qualityBar: [
      "Every model should have a reason to orbit.",
      "Every market profile should state trend, risk, invalidation, and scenario targets.",
      "Every adaptive entry should feel like one observatory experience, not a stack of disconnected widgets."
    ]
  }
}
