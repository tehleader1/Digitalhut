import {mkdir, writeFile} from "node:fs/promises"
import path from "node:path"
import {fileURLToPath} from "node:url"
import {originalLongTailKeywordsFor, seoMarketGearMap} from "../src/lib/seoContentEngine.js"

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const firecudaRoot = process.env.DIGITALHUT_FIRECUDA_AGENT_ROOT || "D:\\DigitalHutAgent"
const localQueueRoot = path.join(repoRoot, "docs", "digitalhut-firecuda-local-queue")
const cycleId = "cycle-002"
const generatedAt = new Date().toISOString()

const systems = [
  {
    id: "hp-i7-control-room",
    label: "New HP i7 Control Room",
    role: "local build runner",
    status: "active",
    seoUse: "Runs batched keyword, build, verification, and local presentation checks before deploy."
  },
  {
    id: "firecuda-8tb-staging",
    label: "FireCuda 8TB Staging Ground",
    role: "private evidence room",
    status: "active",
    seoUse: "Stores master keyword lists, original captures, GLB evidence, thumbnails, backlink tests, reports, and rinse-repeat history."
  },
  {
    id: "google-cloud",
    label: "Google Cloud Service Account",
    role: "cloud worker identity",
    status: "connected",
    seoUse: "Powers YouTube/Speech/TTS/cloud-worker expansion and future backup jobs without exposing private keys."
  },
  {
    id: "google-youtube",
    label: "Google YouTube API",
    role: "episode source discovery",
    status: "connected",
    seoUse: "Turns category searches into video episodes, source context, quick panels, and keyword-backed presentation moments."
  },
  {
    id: "google-speech",
    label: "Google Speech Analyzer",
    role: "spoken content analyzer",
    status: "connected",
    seoUse: "Converts provided audio/text/metadata into bubble map, timeline, 3D object, backlink, and multi-display data."
  },
  {
    id: "google-tts",
    label: "Google Text-to-Speech",
    role: "podcast voice lane",
    status: "configured",
    seoUse: "Creates podcast/speaker moments that can interrupt the episode and package important source reads."
  },
  {
    id: "supabase",
    label: "Supabase",
    role: "database, storage, pixel, capture",
    status: "connected",
    seoUse: "Stores analytics, page views, GLB plays, live feed records, backlink captures, and future user/tier data."
  },
  {
    id: "vercel",
    label: "Vercel",
    role: "public app and API server",
    status: "connected",
    seoUse: "Deploys the public DigitalHut observatory, SEO metadata, API routes, and category pages."
  },
  {
    id: "github",
    label: "GitHub",
    role: "source control",
    status: "active",
    seoUse: "Preserves each code/content cycle so SEO changes can be reviewed, deployed, and rolled forward."
  },
  {
    id: "glb-renderer",
    label: "GLB Renderer",
    role: "3D proof engine",
    status: "working",
    seoUse: "Turns keywords into visible proof: model previews, expanded play views, environment evidence, and backlinkable assets."
  },
  {
    id: "podcast-renderer",
    label: "Podcast Renderer",
    role: "special source moment",
    status: "working",
    seoUse: "Adds speaker/pulsing moments for important context, sponsor inserts, and source-backed summaries."
  },
  {
    id: "smart-category-view",
    label: "Smart Category View",
    role: "episode control and quick panels",
    status: "working",
    seoUse: "Keeps users inside a lane while next episode, quick panel, and keyword injections remain category-consistent."
  },
  {
    id: "wallet-dapp",
    label: "Wallet DApp Rail",
    role: "payment and account direction",
    status: "preferred",
    seoUse: "Keeps the revenue path decentralized while the SEO system builds trust, utility, and saved episode value."
  }
]

const topicSeeds = [
  {topic: "home project", market: "home improvement", category: "Mainstream Streaming", audience: "homeowners", platform: "YouTube Shorts", location: "Texas"},
  {topic: "grocery shopping", market: "family shopping", category: "Mainstream Streaming", audience: "moms", platform: "TikTok", location: "Midwest"},
  {topic: "gaming build", market: "gaming server", category: "Gamer", audience: "gamers", platform: "YouTube", location: "online server"},
  {topic: "real estate agency", market: "housing model", category: "Real Estate", audience: "buyers", platform: "Instagram", location: "Florida"},
  {topic: "vacation resort", market: "travel planning", category: "Continent", audience: "families", platform: "YouTube Shorts", location: "Caribbean"},
  {topic: "coral reef", market: "science study", category: "Researcher", audience: "researchers", platform: "YouTube", location: "Caribbean"},
  {topic: "animal extinction", market: "environmental research", category: "Researcher", audience: "students", platform: "YouTube", location: "Africa"},
  {topic: "climate control", market: "public study", category: "Science", audience: "researchers", platform: "YouTube", location: "Europe"},
  {topic: "traffic study", market: "city planning", category: "Mobility", audience: "city planners", platform: "YouTube", location: "New York"},
  {topic: "AI technology", market: "business technology", category: "Programmer", audience: "developers", platform: "YouTube", location: "California"},
  {topic: "planetary research", market: "space science", category: "Planetary", audience: "students", platform: "YouTube", location: "global"},
  {topic: "developer dapp", market: "backend analytics", category: "Programmer", audience: "developers", platform: "GitHub", location: "global"},
  {topic: "coding episode", market: "software education", category: "Programmer", audience: "new developers", platform: "YouTube", location: "United States"},
  {topic: "local restaurant remodel", market: "small business", category: "Businesses", audience: "restaurant owners", platform: "Instagram", location: "South"},
  {topic: "barber shop reel", market: "local business", category: "Businesses", audience: "barbers", platform: "TikTok", location: "Atlanta"},
  {topic: "roof repair", market: "contractor service", category: "Mainstream Streaming", audience: "homeowners", platform: "Google", location: "Midwest"},
  {topic: "landscaping before and after", market: "local service", category: "Mainstream Streaming", audience: "homeowners", platform: "Instagram", location: "California"},
  {topic: "family travel", market: "family vacation", category: "Continent", audience: "families", platform: "YouTube Shorts", location: "Florida"},
  {topic: "university research", market: "education", category: "Researcher", audience: "students", platform: "Google", location: "East Coast"},
  {topic: "business automation", market: "AI business", category: "Businesses", audience: "small business owners", platform: "YouTube", location: "United States"},
  {topic: "smart home", market: "home technology", category: "Mainstream Streaming", audience: "homeowners", platform: "TikTok", location: "Texas"},
  {topic: "drone real estate", market: "property marketing", category: "Real Estate", audience: "agents", platform: "Instagram", location: "Florida"},
  {topic: "Google Cloud speech", market: "developer infrastructure", category: "Programmer", audience: "developers", platform: "Google", location: "global"},
  {topic: "Supabase backend", market: "dapp backend", category: "Programmer", audience: "builders", platform: "GitHub", location: "global"},
  {topic: "FireCuda backup", market: "creator storage", category: "DigitalHut Presentation", audience: "creators", platform: "YouTube", location: "home studio"},
  {topic: "GLB renderer", market: "3D presentation", category: "DigitalHut Presentation", audience: "creators", platform: "Google", location: "global"}
]

const marketRegions = [
  {id: "us-west", label: "U.S. West Coast", language: "English", angles: ["California creator tools", "Los Angeles real estate", "Bay Area AI builders"]},
  {id: "us-east", label: "U.S. East Coast", language: "English", angles: ["New York 3D city visualization", "New Jersey property walkthroughs", "East Coast university research"]},
  {id: "us-south", label: "U.S. South", language: "English", angles: ["Texas real estate 3D walkthrough", "Florida family travel 3D preview", "Atlanta local business reels"]},
  {id: "us-midwest", label: "U.S. Midwest", language: "English", angles: ["Midwest school 3D learning", "family shopping visual guide", "home project visual planner"]},
  {id: "china", label: "China Plain-English Export Lane", language: "English + future localization", angles: ["3D product visualization", "tourism preview", "research visualization"]},
  {id: "europe", label: "Europe", language: "English + local variants", angles: ["climate research 3D visual", "city tourism 3D walkthrough", "heritage site 3D preview"]},
  {id: "middle-east", label: "Middle East", language: "English + local variants", angles: ["resort 3D preview", "real estate virtual model", "smart city visualization"]},
  {id: "africa", label: "Africa", language: "English + local variants", angles: ["wildlife study 3D visual", "tourism map preview", "city infrastructure report"]},
  {id: "latin-america", label: "Latin America", language: "English + Spanish/Portuguese future localization", angles: ["resort preview", "city tourism", "real estate 3D walkthrough"]},
  {id: "caribbean", label: "Caribbean / Island Tourism", language: "English", angles: ["vacation resort 3D preview", "coral reef visual study", "family travel route"]}
]

function slugify(value){
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90)
}

function unique(values, max = values.length){
  const seen = new Set()
  const output = []
  for(const value of values){
    const clean = String(value || "").replace(/\s+/g, " ").trim()
    const key = clean.toLowerCase()
    if(!clean || seen.has(key)) continue
    seen.add(key)
    output.push(clean)
    if(output.length >= max) break
  }
  return output
}

function csvCell(value){
  return `"${String(value ?? "").replace(/"/g, '""')}"`
}

function mdCell(value){
  return String(value ?? "").replace(/\|/g, "/").replace(/\n/g, " ").trim()
}

function writeCsv(records){
  const headers = [
    "id",
    "primaryKeyword",
    "category",
    "market",
    "audience",
    "location",
    "priority",
    "episodeTitle",
    "adPoint",
    "conclusion",
    "visualAsset",
    "glbPrompt",
    "podcastMoment",
    "internalBacklink",
    "pixelGoal"
  ]
  const rows = records.map((record) => headers.map((header) => csvCell(record[header])).join(","))
  return [headers.join(","), ...rows].join("\n")
}

function writeTightCsv(records){
  const headers = [
    "rank",
    "score",
    "primaryKeyword",
    "category",
    "publishLane",
    "watchPageRoute",
    "visualProofModule",
    "helpfulContentAngle",
    "sourceEvidenceRule",
    "sponsorBacklinkPlan"
  ]
  const rows = records.map((record, index) => headers.map((header) => csvCell(header === "rank" ? index + 1 : record[header])).join(","))
  return [headers.join(","), ...rows].join("\n")
}

function scoreRecord(record, index){
  const phrase = record.primaryKeyword.toLowerCase()
  let score = 42
  if(record.priority === "high") score += 24
  if(phrase.includes("3d")) score += 10
  if(phrase.includes("visual")) score += 8
  if(phrase.includes("experience") || phrase.includes("expercience")) score += 7
  if(phrase.includes("research") || phrase.includes("study") || phrase.includes("data")) score += 9
  if(phrase.includes("near me") || phrase.includes("agency") || phrase.includes("planner")) score += 6
  if(phrase.includes("2026")) score += 5
  if(record.category === "Researcher" || record.category === "Programmer") score += 7
  if(record.category === "Real Estate" || record.category === "Businesses") score += 6
  if(record.category === "Mainstream Streaming" && /reel|grocery|home|family|social/.test(phrase)) score += 6
  if(index < 24) score += Math.max(0, 8 - Math.floor(index / 4))
  if(phrase.length > 72) score -= 4
  return Math.max(0, Math.min(100, score))
}

function intentFamily(record){
  const phrase = record.primaryKeyword.toLowerCase()
  if(/research|study|data|coral|climate|traffic|extinction|planetary/.test(phrase)) return "research proof"
  if(/real estate|housing|agency|property|walkthrough|neighborhood/.test(phrase)) return "client preview"
  if(/gamer|gaming|server|build|game/.test(phrase)) return "entertainment proof"
  if(/reel|tiktok|instagram|shorts|family|grocery/.test(phrase)) return "social discovery"
  if(/developer|api|backend|dapp|glb|webgl/.test(phrase)) return "builder proof"
  return "daily visual search"
}

function dedupeKey(record){
  return record.primaryKeyword
    .toLowerCase()
    .replace(/\b2026\b/g, "")
    .replace(/\b(ai|3d|visual|experience|expercience|virtual|model|guide|planner|presentation|data|study|top|best|new|the|of|on)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function enrichForPublishing(record, index){
  const score = scoreRecord(record, index)
  const intent = intentFamily(record)
  const slug = slugify(record.primaryKeyword)
  const publishLane = score >= 88 ? "week-001 publish" : score >= 76 ? "proof module build" : score >= 64 ? "backlink test" : "reserve"
  const visualProofModule = intent === "research proof"
    ? "bubble map + source evidence table + GLB study model"
    : intent === "client preview"
      ? "3D property/client preview + backlink source card"
      : intent === "entertainment proof"
        ? "GLB play preview + category quick panel + timeline"
        : intent === "builder proof"
          ? "developer system map + renderer status + API source link"
          : "video radar + GLB proof dock + shareable backlink"
  return {
    ...record,
    score,
    intent,
    publishLane,
    watchPageRoute: `/watch/${slug}`,
    blogRoute: `/blog/${slug}`,
    helpfulContentAngle: `Show who needs ${record.primaryKeyword}, how DigitalHut produced the visual read, and why the 3D/podcast/source view is useful.`,
    sourceEvidenceRule: "Separate confirmed metadata, inferred video context, source links, and sponsor/backlink routes so the page reads as useful evidence.",
    visualProofModule,
    sponsorBacklinkPlan: `Use ${record.internalBacklink} as the internal route, then test ${record.backlinkTargets[0]} and ${record.backlinkTargets[1]} for source quality.`,
    glbProofUpgrade: "Compact GLB proof dock opens an expanded model play view while analytics keep running.",
    noFillerRule: "Visible text must explain the current episode, source value, GLB proof, backlink route, or podcast/sponsor moment."
  }
}

function buildTightenedStack(records){
  const categoryCounts = new Map()
  const seen = new Set()
  const tightened = []
  const ranked = records
    .map((record, index) => enrichForPublishing(record, index))
    .sort((a, b) => b.score - a.score || a.primaryKeyword.localeCompare(b.primaryKeyword))

  for(const record of ranked){
    const key = dedupeKey(record)
    const categoryCount = categoryCounts.get(record.category) || 0
    if(seen.has(key) && record.publishLane !== "week-001 publish") continue
    if(categoryCount >= 10 && record.publishLane !== "week-001 publish") continue
    seen.add(key)
    categoryCounts.set(record.category, categoryCount + 1)
    tightened.push(record)
  }

  const week001 = tightened.filter((record) => record.publishLane === "week-001 publish").slice(0, 18)
  const proofModules = tightened.filter((record) => record.publishLane === "proof module build").slice(0, 32)
  const backlinkTests = tightened.filter((record) => record.publishLane === "backlink test").slice(0, 30)
  return {
    cycleId,
    generatedAt,
    noFillerRule: "Every visible element must serve video understanding, GLB proof, source evidence, sponsor/backlink revenue, category navigation, or pixel learning.",
    week001,
    proofModules,
    backlinkTests,
    tightenedRecords: tightened.slice(0, 140)
  }
}

function visualProofLedger(tightStack){
  return {
    cycleId,
    generatedAt,
    currentUpgrade: "GLB proof dock + category command lane",
    status: "patched-and-build-passed",
    purpose: "Make the GLB renderer feel like a real proof module that supports SEO, source trust, and paid researcher value.",
    shippedChanges: [
      "Permanent compact GLB proof preview in the corner dock",
      "Click opens expanded GLB play view with higher foreground priority",
      "Copy now frames GLB as source-backed researcher detail instead of a loading tile",
      "Category control now reads as a locked episode lane and tells users next episode stays in the selected category"
    ],
    nextVisualTouches: [
      "Bubble map nodes prioritize source evidence, page views, backlinks, and episode title",
      "Timeline labels use fewer words and stronger current-video meaning",
      "Podcast panel becomes a source interruption with clearer return-to-video behavior"
    ],
    seoConnection: tightStack.week001.slice(0, 8).map((record) => ({
      keyword: record.primaryKeyword,
      route: record.watchPageRoute,
      proof: record.visualProofModule,
      backlink: record.internalBacklink
    }))
  }
}

function makeRecord(seed, keyword, index, gear){
  const priority = index < 3 ? "high" : index < 8 ? "build" : "reserve"
  const primaryKeyword = keyword
  const slug = slugify(primaryKeyword)
  const year = "2026"
  const supportingKeywords = unique([
    ...originalLongTailKeywordsFor({
      topic: seed.topic,
      market: seed.market,
      platform: seed.platform,
      year,
      location: seed.location,
      audience: seed.audience
    }),
    ...(gear?.supportingKeywords || [])
  ], 9).filter((item) => item.toLowerCase() !== primaryKeyword.toLowerCase())

  return {
    id: `dh-${cycleId}-${slug}-${index + 1}`,
    cycleId,
    generatedAt,
    sourceSystem: "DigitalHut FireCuda SEO Runner 5.5 high-capacity profile",
    topic: seed.topic,
    market: seed.market,
    category: seed.category,
    audience: seed.audience,
    platform: seed.platform,
    location: seed.location,
    primaryKeyword,
    supportingKeywords,
    priority,
    episodeTitle: `${primaryKeyword} | DigitalHut Observatory Experience`,
    episodeUse: gear?.episodeHook || `Build a live observatory episode that turns ${seed.topic} into video, analytics, source links, and 3D proof.`,
    adPoint: gear?.adPoint || `Sponsor lane: ${seed.market}, local services, creator tools, related websites, and premium visual reports.`,
    conclusion: gear?.conclusion || `DigitalHut turns ${seed.topic} into a useful visual system people can inspect, save, share, and revisit.`,
    visualAsset: `${slug}-digitalhut-visual-preview`,
    thumbnailName: `${slug}-digitalhut-3d-observatory-preview.webp`,
    thumbnailAlt: `DigitalHut ${primaryKeyword} 3D observatory preview with video, analytics, GLB, and source links`,
    glbPrompt: `Create or select a GLB environment that visually explains ${primaryKeyword} for ${seed.audience}.`,
    podcastMoment: `Podcast insert explains why ${primaryKeyword} matters and points to the strongest source/backlink lane.`,
    internalBacklink: `/blog/${slug}`,
    backlinkTargets: [
      `https://www.google.com/search?q=${encodeURIComponent(`${primaryKeyword} source`)}`,
      `https://www.google.com/search?q=${encodeURIComponent(`${primaryKeyword} 2026 data`)}`,
      `https://www.google.com/search?q=${encodeURIComponent(`${seed.topic} visual guide`)}`      
    ],
    pixelGoal: "page_view -> blog_view -> thumbnail_render_click -> glb_preview_play -> share_or_wallet_interest",
    injectInto: ["episode title", "quick panel", "bubble map", "timeline", "3D object label", "podcast moment", "sponsored stack", "blog metadata"],
    status: "staged-firecuda"
  }
}

function buildMasterRecords(){
  const records = []
  const seenPrimaryKeywords = new Set()
  for(const seed of topicSeeds){
    const gear = seoMarketGearMap.find((item) => item.category === seed.category) || seoMarketGearMap.find((item) => item.id === "3d-experience")
    const keywords = unique([
      ...(gear ? [gear.primaryKeyword, ...gear.supportingKeywords] : []),
      ...originalLongTailKeywordsFor({
        topic: seed.topic,
        market: seed.market,
        platform: seed.platform,
        year: "2026",
        location: seed.location,
        audience: seed.audience
      })
    ], 18)
    let acceptedIndex = 0
    for(const keyword of keywords){
      const key = keyword.toLowerCase()
      if(seenPrimaryKeywords.has(key)) continue
      seenPrimaryKeywords.add(key)
      records.push(makeRecord(seed, keyword, acceptedIndex, gear))
      acceptedIndex += 1
    }
  }
  return records
}

function buildRegionalMap(masterRecords){
  return marketRegions.map((region) => {
    const records = topicSeeds.slice(0, 12).flatMap((seed) => {
      return region.angles.slice(0, 2).map((angle) => ({
        id: `dh-${cycleId}-${region.id}-${slugify(seed.topic)}-${slugify(angle)}`,
        region: region.label,
        languagePlan: region.language,
        topic: seed.topic,
        category: seed.category,
        searchPhrase: `${region.label} ${angle} ${seed.topic} 3D visual experience`,
        visualThumbnail: `${slugify(region.label)}-${slugify(seed.topic)}-visual-preview.webp`,
        glbRenderIdea: `Match ${seed.topic} to a ${region.label} visual environment or evidence model.`,
        blogAngle: `Explain ${seed.topic} through ${region.label} context with a DigitalHut 3D observatory preview.`,
        backlinkCommunityAngle: `Source links, local directories, creator communities, research pages, and destination/business references.`
      }))
    })
    return {
      id: region.id,
      label: region.label,
      languagePlan: region.language,
      angles: region.angles,
      keywordCount: records.length,
      sampleKeywords: records.slice(0, 8).map((item) => item.searchPhrase),
      records
    }
  })
}

function blogProofPostFor(record, index){
  const slug = slugify(record.primaryKeyword)
  const proofFocus = record.intent === "research proof"
    ? "source evidence, study summary, bubble map, timeline, and GLB research preview"
    : record.intent === "client preview"
      ? "client-ready 3D preview, property/source card, backlink route, and saved episode proof"
      : record.intent === "builder proof"
        ? "developer architecture, API/source status, GLB renderer proof, and backend route"
        : "video radar, GLB proof dock, timeline, podcast/source moment, and shareable backlink"
  const featuredSlot = index < 4 ? "homepage featured proof" : index < 8 ? "category featured proof" : "long-tail proof library"
  return {
    rank: index + 1,
    score: record.score,
    keyword: record.primaryKeyword,
    slug,
    title: `${record.primaryKeyword}: DigitalHut Observatory Proof`,
    metaTitle: `${record.primaryKeyword} | DigitalHut 3D Observatory`,
    metaDescription: `A DigitalHut proof page for ${record.primaryKeyword}: video context, GLB preview, timeline, source links, and useful long-tail research.`,
    category: record.category,
    intent: record.intent,
    featuredSlot,
    route: `/blog/${slug}`,
    watchPageRoute: record.watchPageRoute,
    canonicalRoute: `/blog/${slug}`,
    heroProof: proofFocus,
    displayProof: [
      "current episode title and selected category lane",
      "GLB proof dock with expanded play view",
      "bubble map showing source evidence and backlink value",
      "timeline showing key finds without duplicate filler metrics",
      "podcast/source moment when the episode needs extra context",
      "clear internal link back to the watch page and category lane"
    ],
    outline: [
      `What ${record.primaryKeyword} means in plain language`,
      "What DigitalHut can confirm from metadata/source context",
      "What the GLB preview adds that a normal video page does not",
      "Useful links, backlink targets, and next research questions",
      "Why this belongs in the DigitalHut Observatory Experience"
    ],
    structuredDataPlan: ["Article", "BreadcrumbList", "VideoObject when a stable watch page is available", "ImageObject for proof thumbnail"],
    longTailPlacementPitch: `Pitch this as a useful visual proof page for people searching "${record.primaryKeyword}", not as generic AI content.`,
    internalLinks: [
      record.watchPageRoute,
      record.internalBacklink,
      `/category/${slugify(record.category)}`,
      "/insights",
      "/asset-lab"
    ],
    sourceEvidenceRule: record.sourceEvidenceRule,
    noFillerRule: record.noFillerRule
  }
}

function buildRankedBlogProofSystem(tightStack){
  const featuredPosts = tightStack.week001.map(blogProofPostFor)
  const clusterMap = featuredPosts.reduce((map, post) => {
    const list = map.get(post.category) || []
    list.push(post)
    map.set(post.category, list)
    return map
  }, new Map())
  const categoryClusters = Array.from(clusterMap).map(([category, posts]) => ({
    category,
    featuredPostCount: posts.length,
    leadKeyword: posts[0]?.keyword || "",
    route: `/category/${slugify(category)}`,
    proofModules: unique(posts.flatMap((post) => post.displayProof), 8),
    posts: posts.map((post) => ({rank: post.rank, keyword: post.keyword, route: post.route, score: post.score}))
  }))
  const longTailWebsiteTargets = featuredPosts.slice(0, 12).map((post) => ({
    keyword: post.keyword,
    postRoute: post.route,
    targetQuery: `"${post.keyword}" "3D" "visual"`,
    placementLane: post.intent === "builder proof"
      ? "developer blogs, dapp directories, GitHub discussions, WebGL/GLB communities"
      : post.intent === "research proof"
        ? "research explainers, study resource pages, university/community posts, visual data newsletters"
        : post.intent === "client preview"
          ? "local business blogs, real estate resource pages, agency websites, destination guides"
          : "creator blogs, social video resources, family/lifestyle explainers, niche forum answers",
    backlinkRule: "Only place links where the DigitalHut proof page adds useful context; avoid thin directory spam.",
    anchorTextOptions: unique([
      post.keyword,
      `${post.keyword} 3D observatory`,
      `${post.keyword} visual proof`,
      `${post.category} DigitalHut proof page`
    ], 4)
  }))
  return {
    cycleId,
    generatedAt,
    purpose: "Ranked blog proof system for DigitalHut: blog posts act as public display proof for long-tail keywords, source evidence, GLB renderer value, and category watch pages.",
    noFillerRule: tightStack.noFillerRule,
    featuredPosts,
    categoryClusters,
    longTailWebsiteTargets,
    publishingRules: [
      "Each blog post must answer who it helps, how the proof was built, and why the observatory view is useful.",
      "Each post links to the matching watch page, category lane, GLB proof, and source/backlink evidence.",
      "Use unique titles, descriptions, routes, thumbnails, and proof summaries to reduce duplicate-content risk.",
      "Only pursue featured placements where the post genuinely helps that website's audience."
    ]
  }
}

function markdownRankedBlogProofSystem(blogSystem){
  const featuredRows = blogSystem.featuredPosts.map((post) => `| ${post.rank} | ${mdCell(post.keyword)} | ${post.score} | ${mdCell(post.featuredSlot)} | ${mdCell(post.route)} | ${mdCell(post.heroProof)} |`).join("\n")
  const clusterRows = blogSystem.categoryClusters.map((cluster) => `| ${mdCell(cluster.category)} | ${cluster.featuredPostCount} | ${mdCell(cluster.leadKeyword)} | ${mdCell(cluster.route)} |`).join("\n")
  const placementRows = blogSystem.longTailWebsiteTargets.map((target, index) => `| ${index + 1} | ${mdCell(target.keyword)} | ${mdCell(target.targetQuery)} | ${mdCell(target.placementLane)} | ${mdCell(target.anchorTextOptions.join(" / "))} |`).join("\n")
  return `# DigitalHut Ranked Blog Proof System Cycle 002

Date: ${generatedAt}

Purpose: the blog is the public display proof. Each post supports a long-tail keyword with a visible episode, GLB proof preview, source evidence, timeline/bubble map context, and a clean backlink route.

## Featured Blog Proof Posts

| Rank | Keyword | Score | Featured slot | Route | Proof focus |
| --- | --- | ---: | --- | --- | --- |
${featuredRows}

## Category Proof Clusters

| Category | Featured posts | Lead keyword | Category route |
| --- | ---: | --- | --- |
${clusterRows}

## Long-Tail Website Placement Lanes

| # | Keyword | Target query | Placement lane | Anchor options |
| --- | --- | --- | --- | --- |
${placementRows}

## Publishing Rules

${blogSystem.publishingRules.map((rule, index) => `${index + 1}. ${rule}`).join("\n")}
`
}

function buildEpisodeInjection(records){
  return records
    .filter((record) => record.priority === "high")
    .slice(0, 42)
    .map((record) => ({
      keyword: record.primaryKeyword,
      category: record.category,
      episode: record.episodeTitle,
      intro: `DigitalHut presents ${record.primaryKeyword} as a live observatory experience.`,
      adCutscene: record.adPoint,
      analyticsMoment: `Bubble map connects ${record.topic}, ${record.market}, source links, GLB preview, and ${record.audience} intent.`,
      podcastMoment: record.podcastMoment,
      glbMoment: record.glbPrompt,
      watchPageRoute: record.watchPageRoute || `/watch/${slugify(record.primaryKeyword)}`,
      noFillerRule: record.noFillerRule || "Every visible panel must explain episode value, source evidence, GLB proof, backlink route, or sponsor/podcast context.",
      conclusion: record.conclusion,
      pixelGoal: record.pixelGoal
    }))
}

function markdownPublishingStack(tightStack, ledger){
  const weekRows = tightStack.week001.map((record, index) => `| ${index + 1} | ${mdCell(record.primaryKeyword)} | ${record.score} | ${mdCell(record.category)} | ${mdCell(record.watchPageRoute)} | ${mdCell(record.visualProofModule)} |`).join("\n")
  const proofRows = tightStack.proofModules.slice(0, 16).map((record, index) => `| ${index + 1} | ${mdCell(record.primaryKeyword)} | ${record.score} | ${mdCell(record.intent)} | ${mdCell(record.helpfulContentAngle)} |`).join("\n")
  const nextRows = ledger.nextVisualTouches.map((item, index) => `${index + 1}. ${item}`).join("\n")
  return `# DigitalHut Tightened Publishing Stack Cycle 002

Date: ${generatedAt}

Purpose: turn the FireCuda master list into useful public pages and visible proof modules. This is the anti-filler list: every phrase needs a watch page, GLB proof, source/backlink path, and pixel goal.

## Week 001 Publish Targets

| # | Keyword | Score | Category | Watch page | Visual proof |
| --- | --- | ---: | --- | --- | --- |
${weekRows}

## Proof Modules Next

| # | Keyword | Score | Intent | Helpful content angle |
| --- | --- | ---: | --- | --- |
${proofRows}

## Visual Proof Ledger

- Current upgrade: ${ledger.currentUpgrade}
- Status: ${ledger.status}
- Purpose: ${ledger.purpose}

## Next Small UI / SEO Touches

${nextRows}
`
}

function markdownReport({records, regionalMap, episodeInjection}){
  const top = records.filter((record) => record.priority === "high").slice(0, 24)
  const systemLines = systems.map((system) => `| ${mdCell(system.label)} | ${mdCell(system.role)} | ${mdCell(system.status)} | ${mdCell(system.seoUse)} |`).join("\n")
  const topLines = top.map((record, index) => `| ${index + 1} | ${mdCell(record.primaryKeyword)} | ${mdCell(record.category)} | ${mdCell(record.episodeTitle)} | ${mdCell(record.pixelGoal)} |`).join("\n")
  const regionLines = regionalMap.map((region) => `| ${mdCell(region.label)} | ${mdCell(region.languagePlan)} | ${region.keywordCount} | ${mdCell(region.sampleKeywords.slice(0, 2).join(" / "))} |`).join("\n")
  return `# DigitalHut Manual Runner Cycle 002

Date: ${generatedAt}

Status: active FireCuda SEO runner cycle.

Runner profile: 5.5 high-capacity manual AI operating mode. FireCuda is the staging ground; Vercel, Supabase, Google Cloud, YouTube, Speech, TTS, GLB renderer, podcast renderer, smart category panels, and wallet/dapp rails are the connected public system.

## Output Summary

- Master keyword records: ${records.length}
- High-priority records: ${records.filter((record) => record.priority === "high").length}
- Regional/off-tier market maps: ${regionalMap.length}
- Episode injection packages: ${episodeInjection.length}
- FireCuda root: \`${firecudaRoot}\`

## System Map

| System | Role | Status | SEO Use |
| --- | --- | --- | --- |
${systemLines}

## Priority Keywords

| # | Primary keyword | Category | Episode title | Pixel goal |
| --- | --- | --- | --- | --- |
${topLines}

## Regional Market Map

| Region | Language plan | Records | Sample lanes |
| --- | --- | ---: | --- |
${regionLines}

## Injection Rule

Every winning keyword is staged for:

1. Episode title.
2. Quick panel/category lane.
3. Bubble map node.
4. Timeline moment.
5. 3D object label/prompt.
6. Podcast insert.
7. Sponsored stack/backlink preview.
8. Blog metadata and thumbnail alt text.
9. Pixel goal.

## Next Runner Cycle

1. Rebuild and verify local.
2. Deploy DigitalHut.
3. Confirm /api/provider-status, /api/insight-map, YouTube, GLB, podcast, and category panel.
4. Pick the first 7 high-priority keywords as Week 001 publishing targets.
5. Use FireCuda to preserve each thumbnail, GLB path, blog draft, backlink test, pixel result, and winning phrase.
6. Repeat with real user behavior from Supabase analytics.
`
}

async function ensureRunnerFolders(root){
  const folders = [
    "00-control-room",
    "01-original-captures\\phone-s25-fe",
    "01-original-captures\\drone-future",
    "02-optimized-glbs\\ready-for-web",
    "02-optimized-glbs\\needs-compression",
    "03-thumbnails-google-images\\ready",
    "03-thumbnails-google-images\\needs-alt-text",
    "04-seo-keyword-map\\longtail-foundation",
    "04-seo-keyword-map\\off-tier-markets\\china",
    "04-seo-keyword-map\\off-tier-markets\\europe",
    "04-seo-keyword-map\\off-tier-markets\\middle-east",
    "04-seo-keyword-map\\off-tier-markets\\africa",
    "04-seo-keyword-map\\off-tier-markets\\latin-america",
    "04-seo-keyword-map\\off-tier-markets\\caribbean",
    "05-blog-week-runs\\week-001",
    "05-blog-week-runs\\featured-proof-posts",
    "05-blog-week-runs\\long-tail-placement-lanes",
    "06-backlink-tests\\pending",
    "06-backlink-tests\\verified",
    "07-render-tests\\passed",
    "07-render-tests\\failed",
    "08-pixel-and-analytics\\instant-6h-12h-24h-7d",
    "09-winning-assets",
    "10-manual-runner-reports",
    "11-visual-upgrade-ledger"
  ]
  await Promise.all(folders.map((folder) => mkdir(path.join(root, folder), {recursive: true})))
}

async function resolveRunnerStorage(){
  try {
    await ensureRunnerFolders(firecudaRoot)
    return {root: firecudaRoot, mode: "firecuda-mirror"}
  } catch(error) {
    await ensureRunnerFolders(localQueueRoot)
    return {
      root: localQueueRoot,
      mode: "system-drive-local-queue",
      reason: String(error?.message || error)
    }
  }
}

async function main(){
  const storage = await resolveRunnerStorage()
  const runnerRoot = storage.root

  const records = buildMasterRecords()
  const regionalMap = buildRegionalMap(records)
  const tightStack = buildTightenedStack(records)
  const proofLedger = visualProofLedger(tightStack)
  const blogProofSystem = buildRankedBlogProofSystem(tightStack)
  const episodeInjection = buildEpisodeInjection(tightStack.tightenedRecords)
  const backlinkTargets = records.slice(0, 80).map((record) => ({
    id: record.id,
    primaryKeyword: record.primaryKeyword,
    category: record.category,
    targets: record.backlinkTargets,
    internalBacklink: record.internalBacklink,
    status: "pending-source-quality-check"
  }))
  const pixelTargets = records.slice(0, 80).map((record) => ({
    id: record.id,
    primaryKeyword: record.primaryKeyword,
    route: record.internalBacklink,
    expectedPath: record.pixelGoal,
    checkWindows: ["instant", "6h", "12h", "24h", "7d"],
    status: "waiting-for-live-traffic"
  }))
  const systemMap = {cycleId, generatedAt, firecudaRoot, runnerRoot, storage, repoRoot, systems}
  const report = markdownReport({records, regionalMap, episodeInjection})
  const publishingReport = markdownPublishingStack(tightStack, proofLedger)
  const blogProofReport = markdownRankedBlogProofSystem(blogProofSystem)

  const longtailRoot = path.join(runnerRoot, "04-seo-keyword-map", "longtail-foundation")
  const blogRoot = path.join(runnerRoot, "05-blog-week-runs")
  await writeFile(path.join(runnerRoot, "00-control-room", "system-map-cycle-002.json"), JSON.stringify(systemMap, null, 2))
  await writeFile(path.join(longtailRoot, "master-keyword-cycle-002.json"), JSON.stringify(records, null, 2))
  await writeFile(path.join(longtailRoot, "master-keyword-cycle-002.csv"), writeCsv(records))
  await writeFile(path.join(longtailRoot, "master-keyword-tightened-cycle-002.json"), JSON.stringify(tightStack, null, 2))
  await writeFile(path.join(longtailRoot, "master-keyword-tightened-cycle-002.csv"), writeTightCsv(tightStack.tightenedRecords))
  await writeFile(path.join(longtailRoot, "week-001-publishing-stack-cycle-002.json"), JSON.stringify(tightStack.week001, null, 2))
  await writeFile(path.join(longtailRoot, "week-001-publishing-stack-cycle-002.md"), publishingReport)
  await writeFile(path.join(blogRoot, "week-001", "ranked-blog-proof-system-cycle-002.json"), JSON.stringify(blogProofSystem, null, 2))
  await writeFile(path.join(blogRoot, "week-001", "ranked-blog-proof-system-cycle-002.md"), blogProofReport)
  await writeFile(path.join(blogRoot, "featured-proof-posts", "featured-blog-posts-cycle-002.json"), JSON.stringify(blogProofSystem.featuredPosts, null, 2))
  await writeFile(path.join(blogRoot, "long-tail-placement-lanes", "long-tail-website-targets-cycle-002.json"), JSON.stringify(blogProofSystem.longTailWebsiteTargets, null, 2))
  await writeFile(path.join(longtailRoot, "episode-injection-cycle-002.json"), JSON.stringify(episodeInjection, null, 2))
  await writeFile(path.join(longtailRoot, "episode-injection-cycle-002.md"), report)
  await writeFile(path.join(runnerRoot, "04-seo-keyword-map", "off-tier-markets", "regional-market-cycle-002.json"), JSON.stringify(regionalMap, null, 2))
  await writeFile(path.join(runnerRoot, "06-backlink-tests", "pending", "backlink-targets-cycle-002.json"), JSON.stringify(backlinkTargets, null, 2))
  await writeFile(path.join(runnerRoot, "08-pixel-and-analytics", "instant-6h-12h-24h-7d", "pixel-targets-cycle-002.json"), JSON.stringify(pixelTargets, null, 2))
  await writeFile(path.join(runnerRoot, "11-visual-upgrade-ledger", "glb-proof-dock-cycle-002.json"), JSON.stringify(proofLedger, null, 2))
  await writeFile(path.join(runnerRoot, "11-visual-upgrade-ledger", "glb-proof-dock-cycle-002.md"), publishingReport)
  await writeFile(path.join(runnerRoot, "10-manual-runner-reports", "cycle-002-report.md"), report)
  await writeFile(path.join(repoRoot, "docs", "digitalhut-manual-runner-cycle-002.md"), report)
  await writeFile(path.join(repoRoot, "docs", "digitalhut-tightened-publishing-stack-cycle-002.md"), publishingReport)
  await writeFile(path.join(repoRoot, "docs", "digitalhut-ranked-blog-proof-system-cycle-002.md"), blogProofReport)

  const summary = {
    ok: true,
    cycleId,
    generatedAt,
    firecudaRoot,
    runnerRoot,
    storage,
    recordCount: records.length,
    highPriorityCount: records.filter((record) => record.priority === "high").length,
    tightenedRecordCount: tightStack.tightenedRecords.length,
    week001PublishTargets: tightStack.week001.length,
    proofModuleTargets: tightStack.proofModules.length,
    featuredBlogProofPosts: blogProofSystem.featuredPosts.length,
    longTailWebsiteTargets: blogProofSystem.longTailWebsiteTargets.length,
    regionalMaps: regionalMap.length,
    episodeInjectionCount: episodeInjection.length,
    noFillerRule: tightStack.noFillerRule,
    visualUpgrade: proofLedger.currentUpgrade,
    topKeywords: tightStack.week001.slice(0, 12).map((record) => record.primaryKeyword),
    files: {
      systemMap: path.join(runnerRoot, "00-control-room", "system-map-cycle-002.json"),
      masterJson: path.join(longtailRoot, "master-keyword-cycle-002.json"),
      masterCsv: path.join(longtailRoot, "master-keyword-cycle-002.csv"),
      tightenedJson: path.join(longtailRoot, "master-keyword-tightened-cycle-002.json"),
      week001: path.join(longtailRoot, "week-001-publishing-stack-cycle-002.md"),
      blogProofSystem: path.join(blogRoot, "week-001", "ranked-blog-proof-system-cycle-002.md"),
      featuredBlogPosts: path.join(blogRoot, "featured-proof-posts", "featured-blog-posts-cycle-002.json"),
      longTailWebsiteTargets: path.join(blogRoot, "long-tail-placement-lanes", "long-tail-website-targets-cycle-002.json"),
      injection: path.join(longtailRoot, "episode-injection-cycle-002.json"),
      visualLedger: path.join(runnerRoot, "11-visual-upgrade-ledger", "glb-proof-dock-cycle-002.md"),
      report: path.join(runnerRoot, "10-manual-runner-reports", "cycle-002-report.md"),
      repoReport: path.join(repoRoot, "docs", "digitalhut-manual-runner-cycle-002.md"),
      repoPublishingReport: path.join(repoRoot, "docs", "digitalhut-tightened-publishing-stack-cycle-002.md"),
      repoBlogProofReport: path.join(repoRoot, "docs", "digitalhut-ranked-blog-proof-system-cycle-002.md")
    }
  }

  console.log(JSON.stringify(summary, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
