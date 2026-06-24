const lanes = [
  {
    id: "farcaster",
    name: "Farcaster decentralized social",
    required: ["NEYNAR_API_KEY or FARCASTER_API_KEY"],
    output: "cast-ready DigitalHut 3D report cards with asset URL, title, backlink, and preview"
  },
  {
    id: "developer-cloud",
    name: "Developer cloud infrastructure",
    required: ["VERCEL_ENV", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
    output: "developer backend pages, asset records, proposal records, and API capture"
  },
  {
    id: "decentralized-streaming",
    name: "Decentralized streaming networks",
    required: ["LIVEPEER_API_KEY or THETA_API_KEY or HLS_STREAM_GATEWAY_URL"],
    output: "streamable 3D observatory segments and podcast/showcase clips"
  },
  {
    id: "smart-contract-liquidity",
    name: "Smart contract liquidity",
    required: ["DIGITALHUT_TREASURY_WALLET", "DIGITALHUT_LIQUIDITY_CONTRACT", "BASE_LIQUIDITY_POOL_ADDRESS"],
    output: "reviewed transaction route for subscriptions, nodes, and liquidity reporting"
  },
  {
    id: "wiki-style-edits",
    name: "Wiki-style developer edits",
    required: ["SUPABASE_SERVICE_ROLE_KEY", "DIGITALHUT_CONTENT_REVIEW_KEY"],
    output: "editable proposals while main DigitalHut production copy remains protected"
  },
  {
    id: "api-glb-capture",
    name: "API GLB discovery capture",
    required: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
    output: "saved API discoveries in digitalhut_live_feed for SEO, ratings, backlinks, and later conversion"
  }
]

const aliases = {
  "NEYNAR_API_KEY or FARCASTER_API_KEY": ["NEYNAR_API_KEY", "FARCASTER_API_KEY"],
  "LIVEPEER_API_KEY or THETA_API_KEY or HLS_STREAM_GATEWAY_URL": ["LIVEPEER_API_KEY", "THETA_API_KEY", "HLS_STREAM_GATEWAY_URL"]
}

function present(requirement){
  const options = aliases[requirement] || [requirement]
  return options.some((key) => Boolean(process.env[key]))
}

console.log("DigitalHut progression runners")
for(const lane of lanes){
  const missing = lane.required.filter((item) => !present(item))
  const status = missing.length ? "STAGED" : "READY"
  console.log(`${status} ${lane.id} - ${lane.name}`)
  console.log(`  output: ${lane.output}`)
  if(missing.length) console.log(`  missing: ${missing.join(", ")}`)
}
