const providerChecks = [
  ["vercel", ["VERCEL", "VERCEL_ENV"], "deployment-runtime"],
  ["supabase", ["SUPABASE_URL", "VITE_SUPABASE_URL", "SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY"], "asset-storage-database"],
  ["firecuda-storage", ["SUPABASE_FIRECUDA_ASSET_BASE", "VITE_SUPABASE_FIRECUDA_ASSET_BASE", "SUPABASE_FIRECUDA_AVAILABLE_FILES"], "verified-glb-storage"],
  ["sketchfab", ["SKETCHFAB_API_TOKEN", "SKETCHFAB_ACCESS_TOKEN", "VITE_SKETCHFAB_API_TOKEN", "VITE_SKETCHFAB_ACCESS_TOKEN"], "3d-model-search"],
  ["cesium", ["CESIUM_ION_TOKEN", "VITE_CESIUM_ION_TOKEN"], "maps-terrain-3d"],
  ["alchemy", ["ALCHEMY_API_KEY", "VITE_ALCHEMY_API_KEY", "ALCHEMY_BASE_RPC_URL", "VITE_ALCHEMY_BASE_RPC_URL"], "chain-rpc-verification"],
  ["reown", ["WALLETCONNECT_PROJECT_ID", "VITE_WALLETCONNECT_PROJECT_ID", "REOWN_PROJECT_ID", "VITE_REOWN_PROJECT_ID"], "wallet-connect"],
  ["alpha-vantage", ["ALPHA_VANTAGE_API_KEY", "VITE_ALPHA_VANTAGE_API_KEY"], "market-statistics"],
  ["fmp", ["FMP_API_KEY", "VITE_FMP_API_KEY"], "market-statistics"],
  ["polygon", ["POLYGON_API_KEY", "VITE_POLYGON_API_KEY"], "market-statistics"],
  ["alpaca", ["ALPACA_API_KEY", "ALPACA_SECRET_KEY"], "stock-and-options-print-flow"]
  ,["farcaster", ["FARCASTER_API_KEY", "NEYNAR_API_KEY", "FARCASTER_HUB_URL"], "decentralized-social-distribution"]
  ,["decentralized-streaming", ["LIVEPEER_API_KEY", "THETA_API_KEY", "HLS_STREAM_GATEWAY_URL"], "streaming-network-distribution"]
  ,["liquidity-contracts", ["DIGITALHUT_LIQUIDITY_CONTRACT", "DIGITALHUT_TREASURY_WALLET", "BASE_LIQUIDITY_POOL_ADDRESS"], "smart-contract-liquidity"]
  ,["wiki-editing", ["DIGITALHUT_EDITOR_MODE", "SUPABASE_SERVICE_ROLE_KEY", "DIGITALHUT_CONTENT_REVIEW_KEY"], "community-edit-main-version-control"]
  ,["api-capture", ["SUPABASE_SERVICE_ROLE_KEY", "DIGITALHUT_SUPABASE_SERVICE_ROLE_KEY"], "api-glb-discovery-capture"]
]

const runnerDiscoveries = [
  {id: "renderer-preserved", title: "Renderer Preservation", status: "active", detail: "Vite/Vercel shape, required files, local GLB binary magic, and manifest/API exact-match coverage are runner-checked."},
  {id: "api-first-mode", title: "API-First Feed Mode", status: "active", detail: "FireCuda owner-library assets are explicitly disabled so external API feeds can surface without broken storage GLB URLs taking over."},
  {id: "sketchfab-environments", title: "Sketchfab Environment Lane", status: "active", detail: "The system searches environment, terrain, city, architecture, world, building, and scene terms before using character or loose-object results."},
  {id: "seo-observatory", title: "SEO Observatory Spine", status: "new", detail: "DigitalHut now has 3D observatory, GLB renderer, automatic system presentation, hub, backlink, rating, and upload keyword lanes."},
  {id: "wallet-chain", title: "Wallet Checkout Rail", status: "staged", detail: "Reown connects wallets, Alchemy verifies chain activity, and Supabase is the intended subscription record layer."}
  ,{id: "market-print-feed", title: "Market Print Feed", status: "new", detail: "Ticker search can read stock trade prints and options contract prints across 12h, 6h, 3h, and 1h windows, with inferred pressure labels."}
  ,{id: "farcaster-social", title: "Farcaster Social Lane", status: "staged", detail: "DigitalHut can publish cast-ready 3D observatory cards after a Farcaster/Neynar key is configured."}
  ,{id: "decentralized-streaming", title: "Decentralized Streaming Lane", status: "staged", detail: "Streaming network output is tracked as a runner lane; it needs a Livepeer, Theta, or HLS gateway credential before live posting."}
  ,{id: "liquidity-contracts", title: "Smart Contract Liquidity Lane", status: "requires contract review", detail: "Liquidity-pool automation must be a reviewed contract integration with explicit chain, token, receiver, and transaction verification."}
  ,{id: "wiki-editing", title: "Wiki-Style Developer Edits", status: "staged", detail: "Developer edits should save as proposals while the main DigitalHut version remains protected and reviewable."}
  ,{id: "api-glb-capture", title: "API GLB Capture", status: "new", detail: "Sketchfab/API feed discoveries can be saved into the DigitalHut live feed when Supabase service credentials are configured."}
]

const seoOpportunities = [
  "2026 3D renderer observatory AI system",
  "automatic GLB autoplay presentation",
  "state of the art 3D imagery for research communities",
  "public feed to 3D asset presentation",
  "planetary views and orbital compute explainers",
  "researcher hub evidence notes and environment scans",
  "gamer hub 360 environment asset discovery",
  "programmer hub API renderer testing",
  "international real estate GLB walkthroughs",
  "ratings, reviews, comments, backlinks, and GLB upload loops"
]

function configured(keys){
  return keys.filter((key) => Boolean(process.env[key]))
}

function stackStatus(){
  const providers = providerChecks.map(([id, keys, role]) => {
    const configuredKeys = configured(keys)
    return {id, role, configured: configuredKeys.length > 0, configuredKeys}
  })
  const configuredCount = providers.filter((item) => item.configured).length
  return {
    providers,
    configuredCount,
    totalProviders: providers.length,
    liveScore: Math.round((configuredCount / providers.length) * 100)
  }
}

function currentMode(){
  const firecudaEnabled = process.env.ENABLE_FIRECUDA_ASSETS === "true"
  const supabaseReady = Boolean(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL)
  const sketchfabReady = Boolean(process.env.SKETCHFAB_ACCESS_TOKEN || process.env.SKETCHFAB_API_TOKEN || process.env.VITE_SKETCHFAB_ACCESS_TOKEN || process.env.VITE_SKETCHFAB_API_TOKEN)
  return {
    app: "DigitalHut 2026 3D renderer observatory AI system",
    deployment: process.env.VERCEL_ENV || "unknown",
    rendererMode: firecudaEnabled ? "hybrid-firecuda-api" : "api-first-preserved",
    firecuda: firecudaEnabled ? "enabled" : "disabled-api-first",
    supabase: supabaseReady ? "configured" : "not-configured",
    sketchfab: sketchfabReady ? "authenticated" : "public-search",
    payments: process.env.VITE_DIGITALHUT_PAYMENT_ETH_AMOUNT || process.env.DIGITALHUT_PAYMENT_ETH_AMOUNT ? "base-eth-checkout-configured" : "wallet-connect-staged"
  }
}

export default function handler(req, res){
  const stack = stackStatus()
  const payload = {
    generatedAt: new Date().toISOString(),
    status: currentMode(),
    stack,
    runnerDiscoveries,
    seoOpportunities,
    scorecard: {
      stackPower: stack.liveScore,
      seoPower: 72,
      rendererPower: process.env.ENABLE_FIRECUDA_ASSETS === "true" ? 86 : 68,
      communityPower: 24,
      paymentPower: stack.providers.find((item) => item.id === "reown")?.configured && stack.providers.find((item) => item.id === "alchemy")?.configured ? 55 : 30
    },
    nextMeasurements: [
      "real asset play events",
      "real GLB render-complete events",
      "Supabase-backed ratings and comments",
      "external backlink confirmations",
      "Search Console impressions and clicks",
      "node unlock progress by account",
      "payment verification receipts",
      "Farcaster casts created",
      "decentralized stream sessions",
      "community edit proposals",
      "API discoveries captured into Supabase"
    ]
  }
  res.setHeader("Cache-Control", "no-store")
  return res.status(200).json(payload)
}
