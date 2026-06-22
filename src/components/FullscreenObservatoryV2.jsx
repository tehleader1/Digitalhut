import React, {useEffect, useRef, useState} from "react"
import {ConnectButton} from "../wallet"
import {inferCategoryByVector} from "../lib/assetVectorMath"
import {firecudaAssetsForCategory, firecudaLibraryStatus, firecudaLocalFallbackUrl, firecudaModelPool, firecudaUrl} from "../lib/firecudaLibraryManifest"
import PodcastMatchPanel from "./PodcastMatchPanel"
import "./FullscreenObservatory.css"
import "./FullscreenObservatory.api.css"
import "./FullscreenObservatory.sequence.css"
import "./FullscreenObservatory.mechanic.css"

const INACTIVITY_MS = 8 * 60 * 1000
const AI_WINDOW_MS = 12 * 60 * 60 * 1000
const AI_TIER_LIMITS = {guest: Infinity, standard: Infinity, premium: Infinity, pro: Infinity}
const STORAGE_TIER_LIMITS = {guest: 12, standard: 50, premium: 500, pro: Infinity}
const accounts = ["guest", "standard", "premium", "pro"]
const layers = ["Base", "Architect", "Lighting", "Props", "Grid", "Coordinates"]
const mobilityModes = [
  {id: "Road", query: "live road traffic construction weather vehicle environment"},
  {id: "Air Travel", query: "airport delay visibility diversion public travel environment"},
  {id: "Marine", query: "marine harbor coastal weather travel environment"},
  {id: "Rail", query: "rail station transit delay public feed environment"}
]
const bridgeFlow = ["DigitalHut Presentation", "Mainstream Streaming", "Mobility", "Orbital Compute", "Gamer", "Planetary", "Programmer", "Workforce", "Researcher", "Science", "History", "Businesses", "Real Estate", "Continent", "Political"]
const liveFeedStorageKey = "digitalhut:liveGlbFeed"
const directorChatStorageKey = "digitalhut:directorChatHistory"
const digitalHutBrainMap = {
  mainFrame: "Double 007 Observatory Database",
  foundation: ["Supabase", "Vercel", "GitHub", "Codex", "APIs", "Back End"],
  experience: ["Main Screen Login", "Renderer", "Market Intelligence", "Library", "Quick Panels", "Category Feed", "Description"],
  features3d: ["Orbit Mode", "Layers", "Architect Mode", "Lighting", "Props", "Grid", "Coordinates"],
  physicalAssets: ["Android", "FireCuda", "HP Mini Laptop"],
  dataPolicy: "Physical assets are sensitive. Public data stays translucent, current, and verifiable through live observatory activity.",
  seoCanal: ["current category", "active renderer feed", "provider status", "asset title", "guided tour stage"],
  liveCreatorLayer: ["live GLB room", "creator voice", "contest prompt", "viewer layer hunt", "likes", "shareable replay"],
  assetResolverIdentity: "DigitalHut Category Asset Resolver",
  assetResolverDirective: "Every displayed category starts with an environment read. Search is allowed to take over only when it finds a real environment GLB, map, scene, or verified model source. Individual characters and loose objects are blocked from default presentation.",
  sessions: {
    Gamer: "Update real-life game concepts, inspect new game visuals, and turn models into playable session ideas.",
    "Real Estate": "Use models and housing data for agent-license career work, client scouting, and property decisions.",
    Programmer: "Inspect research data, backend features, API logic, and up-to-date decentralized network ideas.",
    Researcher: "Rotate models, log details, shuffle evidence quickly, and verify information before saving claims.",
    "Mainstream Streaming": "Track 2026 trends, interesting topics, creator clips, funny videos, and stream hooks.",
    Mobility: "Monitor aerospace-style public feeds, routes, orbital access, vehicle environments, weather context, and verified observatory sessions.",
    "Orbital Compute": "Track public orbital compute, satellite internet, free-space optics, advanced solar materials, and source-verified observatory science.",
    Planetary: "Explore structures, environments, places around the world, and planetary-style observation sessions."
  },
  futureBranding: {
    current: "DigitalHut",
    direction: "shorter, stronger probe/search/vision brand for AI observatory sessions",
    candidates: ["Probevision", "ProbeOne", "Probe", "ProbeNet", "VisionProbe"]
  }
}

const stockImages = {
  "Continent": ["photo-1500530855697-b586d89ba3ee", "photo-1486406146926-c627a92ad1ab", "photo-1518005020951-eccb494ad742", "photo-1493246507139-91e8fad9978e"],
  "Planetary": ["photo-1446776811953-b23d57bd21aa", "photo-1454789548928-9efd52dc4031", "photo-1462331940025-496dfbfc7564", "photo-1419242902214-272b3f66ee7a"],
  "Orbital Compute": ["photo-1446776811953-b23d57bd21aa", "photo-1451187580459-43490279c0fa", "photo-1454789548928-9efd52dc4031", "photo-1517976547714-720226b864c1"],
  "Gamer": ["photo-1542751371-adc38448a05e", "photo-1511512578047-dfb367046420", "photo-1550745165-9bc0b252726f", "photo-1493711662062-fa541adb3fc8"],
  "Real Estate": ["photo-1560518883-ce09059eeffa", "photo-1600585154340-be6161a56a0c", "photo-1484154218962-a197022b5858", "photo-1600607687939-ce8a6c25118c"],
  "Workforce": ["photo-1504307651254-35680f356dfd", "photo-1517048676732-d65bc937f952", "photo-1521791136064-7986c2920216", "photo-1581092918056-0c4c3acd3789"],
  "DigitalHut Presentation": ["photo-1497366754035-f200968a6e72", "photo-1515879218367-8466d910aaa4", "photo-1558494949-ef010cbdcc31", "photo-1516321318423-f06f85e504b3"],
  "Political": ["photo-1529107386315-e1a2ed48a620", "photo-1464692805480-a69dfaafdb0d", "photo-1523292562811-8fa7962a78c8", "photo-1500534314209-a25ddb2bd429"],
  "Programmer": ["photo-1515879218367-8466d910aaa4", "photo-1555066931-4365d14bab8c", "photo-1516321318423-f06f85e504b3", "photo-1558494949-ef010cbdcc31"],
  "Mainstream Streaming": ["photo-1611162617474-5b21e879e113", "photo-1557804506-669a67965ba0", "photo-1516321497487-e288fb19713f", "photo-1495020689067-958852a7765e"],
  "Mobility": ["photo-1492144534655-ae79c964c9d7", "photo-1503376780353-7e6692767b70", "photo-1473445361085-b9a07f55608b", "photo-1436491865332-7a61a109cc05"],
  "Researcher": ["photo-1532094349884-543bc11b234d", "photo-1507413245164-6160d8298b31", "photo-1581093588401-fbb62a02f120", "photo-1451187580459-43490279c0fa"],
  "Science": ["photo-1532094349884-543bc11b234d", "photo-1581093588401-fbb62a02f120", "photo-1507413245164-6160d8298b31", "photo-1451187580459-43490279c0fa"],
  "History": ["photo-1461360370896-922624d12aa1", "photo-1500530855697-b586d89ba3ee", "photo-1528181304800-259b08848526", "photo-1518005020951-eccb494ad742"],
  "Businesses": ["photo-1486406146926-c627a92ad1ab", "photo-1504384308090-c894fdcc538d", "photo-1497366754035-f200968a6e72", "photo-1517048676732-d65bc937f952"]
}

function stockUrl(category, index = 0){
  const pool = stockImages[category] || stockImages.Continent
  const id = pool[index % pool.length]
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=82`
}

function relatedGlb(category, index = 0){
  const pool = firecudaModelPool(category)
  return pool.length ? pool[index % pool.length] : ""
}

function isStorageLibrarySource(item = {}){
  const source = `${item.apiSource || ""} ${item.apiStatus || ""} ${item.modelUrl || ""} ${item.viewerUrl || ""}`.toLowerCase()
  return source.includes("firecuda") || source.includes("supabase") || source.includes("owner-library") || source.includes("storage")
}

function attachRendererModel(item, category, term, index){
  if(item.embedUrl && item.apiSource){
    return {
      ...item,
      modelUrl: "",
      viewerUrl: item.viewerUrl || item.embedUrl || item.modelUrl || "",
      sourceModelUrl: item.modelUrl || "",
      sourceEmbedUrl: item.embedUrl || "",
      renderPriority: 130,
      apiStatus: item.apiStatus || "api-embed-renderer",
      note: `${item.note || `Live API result for ${term || category}.`} DigitalHut is rendering the provider viewer first so fresh API feeds surface before owner-library storage backups.`
    }
  }
  if(isDirectRenderableModel(item.modelUrl) && isStorageLibrarySource(item)){
    return {
      ...item,
      modelUrl: "",
      viewerUrl: item.viewerUrl || item.modelUrl || "",
      sourceModelUrl: item.modelUrl || "",
      sourceEmbedUrl: item.embedUrl || "",
      renderPriority: 34,
      apiStatus: item.apiStatus || "storage-glb-needs-verification",
      note: `${item.note || `Owner-library result for ${term || category}.`} This storage GLB is held behind verification so a broken Supabase/Vercel object cannot block live API results.`
    }
  }
  if(isDirectRenderableModel(item.modelUrl) && isEnvironmentFeed(item)){
    return {
      ...item,
      renderPriority: item.apiSource === "FireCuda personal GLB library" ? 62 : 128,
      apiStatus: item.apiStatus || "direct-api-model"
    }
  }
  const sourceViewerUrl = item.viewerUrl || item.embedUrl || item.modelUrl || ""
  const bridgeModelUrl = relatedGlb(category, index)
  if(item.apiSource && bridgeModelUrl){
    return {
      ...item,
      embedUrl: "",
      modelUrl: bridgeModelUrl,
      viewerUrl: sourceViewerUrl,
      sourceModelUrl: item.modelUrl || "",
      sourceEmbedUrl: item.embedUrl || "",
      renderPriority: 88,
      apiStatus: "live-api-spotlight-glb",
      apiSource: `${item.apiSource} + DigitalHut verified GLB`,
      note: `${item.note || `Live API result for ${term || category}.`} DigitalHut attached the closest verified environment GLB so the feed can render immediately while the exact source asset is checked.`
    }
  }
  return {
    ...item,
    embedUrl: "",
    modelUrl: "",
    viewerUrl: sourceViewerUrl,
    sourceModelUrl: item.modelUrl || "",
    sourceEmbedUrl: item.embedUrl || "",
    renderPriority: 0,
    apiStatus: "verified-glb-required",
    note: `${item.note || `Live API result for ${term || category}.`} A direct licensed, owner-uploaded, API, Vercel, or FireCuda environment GLB is required before this experience can enter the renderer.`
  }
}

function isDirectRenderableModel(value){
  return Boolean(value && /\.(glb|gltf)(\?|#|$)/i.test(value))
}

function isEnvironmentFeed(item = {}){
  const tags = Array.isArray(item.tags) ? item.tags.map((tag) => typeof tag === "string" ? tag : tag?.name || "").join(" ") : ""
  const value = `${item.title || ""} ${item.note || ""} ${item.query || ""} ${tags}`.toLowerCase()
  const environmentSignals = ["environment", "scene", "terrain", "city", "village", "house", "property", "architecture", "building", "district", "map", "world", "landscape", "continent", "country", "coast", "station", "base", "planet", "planetary system", "observatory", "facility", "route", "zone"]
  const singleObjectSignals = ["character", "avatar", "robot", "helmet", "person", "statue", "weapon", "single object", "figurine"]
  if(singleObjectSignals.some((signal) => value.includes(signal)) && !environmentSignals.some((signal) => value.includes(signal))) return false
  return environmentSignals.some((signal) => value.includes(signal))
}

function isLikelyBrokenStorageUrl(value){
  const source = String(value || "").trim()
  if(!source) return false
  const lower = source.toLowerCase()
  if(lower.includes("xxxxx") || lower.includes("your-store") || lower.includes("store-id")) return true
  try {
    const url = new URL(source, typeof window !== "undefined" ? window.location.href : "https://digitalhut.app")
    const host = url.hostname.toLowerCase()
    const allowVercelBlob = import.meta.env?.VITE_ALLOW_VERCEL_BLOB_FIRECUDA === "true"
    if(host.includes("vercel-storage.com") && !allowVercelBlob) return true
    if(host === "public.blob.vercel-storage.com") return true
    if(host.endsWith(".public.blob.vercel-storage.com")){
      const storeId = host.replace(".public.blob.vercel-storage.com", "")
      return storeId.length < 6
    }
  } catch {
    return false
  }
  return false
}

function bestRenderableModelUrl(feed = {}){
  const candidates = [
    feed.modelUrl,
    feed.model_url,
    feed.glbUrl,
    feed.glb_url,
    feed.gltfUrl,
    feed.gltf_url,
    feed.convertedGlbUrl,
    feed.converted_glb_url,
    feed.optimizedGlbUrl,
    feed.optimized_glb_url,
    feed.sourceModelUrl,
    feed.statsModelUrl,
    feed.downloadUrl,
    feed.download_url,
    relatedGlb(feed.category || "", 0)
  ].map(cleanUrl).filter(Boolean)
  return candidates.find((candidate) => isDirectRenderableModel(candidate) && !isLikelyBrokenStorageUrl(candidate)) || ""
}

function sortRendererFeeds(items){
  return [...items].sort((a, b) => {
    const scoreA = a.renderPriority ?? (isDirectRenderableModel(a.modelUrl) ? 70 : 10)
    const scoreB = b.renderPriority ?? (isDirectRenderableModel(b.modelUrl) ? 70 : 10)
    return scoreB - scoreA
  })
}

const apiSpotlightIdeas = {
  "Mainstream Streaming": ["2026 launch culture watch", "global food market reel", "immersive city nightlife trend", "creator podcast stage", "public festival visual report"],
  Planetary: ["orbital compute watch", "satellite internet relay", "solar absorption research", "space station sector", "planetary surface observatory"],
  Gamer: ["open world 360 arena", "retro online world showcase", "VR fantasy hub", "metaverse city build", "game environment boss zone"],
  "Real Estate": ["international waterfront property", "Japan compact apartment market", "Fiji bungalow study", "New York city housing view", "Brazil coastal real estate"],
  Researcher: ["South America science field study", "Asia research environment", "weather visibility experiment", "museum science report", "lab-to-terrain observatory"],
  Programmer: ["backend GLB conversion worker", "AI renderer command center", "developer observatory dashboard", "decentralized storage node", "API production monitor"],
  Science: ["perovskite solar cell study", "free space optical internet", "climate visibility report", "bio-research safety observatory", "extreme environment experiment"],
  Continent: ["Africa city terrain read", "Asia coastline environment", "Europe heightmap study", "South America research route", "Australia split point environment"],
  History: ["ancient city reconstruction", "museum archive walk", "heritage structure scan", "historic market district", "old village environment"],
  Businesses: ["global commerce district", "sponsor presentation lobby", "AI production company feed", "premium creator showcase", "international project monitor"]
}

function apiSpotlightSeeds(category, term = "", randomize = false){
  const meta = metaFor(category)
  const ideas = apiSpotlightIdeas[category] || apiSpotlightIdeas["Mainstream Streaming"]
  const start = randomize ? Math.floor(Math.random() * ideas.length) : 0
  return ideas.map((_, offset) => {
    const index = (start + offset) % ideas.length
    const idea = ideas[index]
    const modelUrl = relatedGlb(category, index)
    return {
      id: `spotlight:${category}:${index}`,
      title: idea.replace(/\b\w/g, (letter) => letter.toUpperCase()),
      note: `Fresh DigitalHut API spotlight for ${term || category}. This lane is designed to attach live API context to a verified environment GLB so the renderer stays active while exact source assets are checked.`,
      query: `${idea} ${term || category} 3d environment`,
      category,
      icon: meta.icon,
      accent: meta.accent,
      context: meta.context,
      thumbnail: stockUrl(category, index),
      modelUrl,
      viewerUrl: "",
      apiSource: "DigitalHut API spotlight + verified GLB",
      apiStatus: modelUrl ? "live-api-spotlight-glb" : "api-spotlight-needs-glb",
      renderPriority: modelUrl ? 92 : 12,
      providerMix: ["DigitalHut API spotlight", "FireCuda/Supabase GLB bridge"],
      tags: ["api-spotlight", "environment", category.toLowerCase()]
    }
  }).filter((item) => item.modelUrl)
}

function firecudaSeedFeeds(category){
  const meta = metaFor(category)
  return firecudaAssetsForCategory(category).map((asset, index) => ({
    id: `firecuda:${category}:${asset.id}`,
    title: asset.title,
    note: `FireCuda personal GLB library asset for ${category}. This model is preloaded into the main DigitalHut renderer so the category opens directly into a real 3D scene.`,
    query: `${asset.title} ${asset.tags.join(" ")} 3d`,
    category,
    icon: meta.icon,
    accent: meta.accent,
    context: meta.context,
    thumbnail: asset.thumbnail || stockUrl(category, index),
    modelUrl: firecudaUrl(asset.file),
    viewerUrl: "",
    apiSource: "FireCuda personal GLB library",
    apiStatus: "preloaded-firecuda-model",
    renderPriority: 62,
    providerMix: ["FireCuda", "DigitalHut library"],
    tags: asset.tags
  }))
}

function environmentLabel(feed = {}){
  const text = `${feed.title || ""} ${feed.query || ""} ${feed.note || ""} ${feed.category || ""}`.toLowerCase()
  if(text.includes("spongebob") || text.includes("underwater") || text.includes("ocean")) return "Undersea Media Environment"
  if(text.includes("japan") || text.includes("tokyo")) return "Japan Environment Read"
  if(text.includes("food") || text.includes("market")) return "Local Food Market Environment"
  if(text.includes("real estate") || text.includes("housing") || text.includes("apartment") || text.includes("bedroom")) return "Housing Environment Read"
  if(text.includes("airport") || text.includes("flight")) return "Airport Environment Read"
  if(text.includes("orlando") || text.includes("traffic") || text.includes("road")) return "City Traffic Environment"
  if(text.includes("science") || text.includes("experiment") || text.includes("research")) return "Research Environment Read"
  if(text.includes("game") || text.includes("arena") || text.includes("boss") || text.includes("level")) return "Game World Environment"
  if(text.includes("construction") || text.includes("workforce") || text.includes("project")) return "Project Site Environment"
  if(text.includes("planet") || text.includes("mars") || text.includes("saturn") || text.includes("space")) return "Observatory Environment"
  return `${feed.category || "DigitalHut"} Environment Read`
}

function environmentClass(feed = {}){
  const label = environmentLabel(feed).toLowerCase()
  if(label.includes("undersea")) return "undersea"
  if(label.includes("japan")) return "japan"
  if(label.includes("market")) return "market"
  if(label.includes("housing")) return "housing"
  if(label.includes("airport")) return "airport"
  if(label.includes("traffic")) return "traffic"
  if(label.includes("research")) return "research"
  if(label.includes("game")) return "game"
  if(label.includes("project")) return "project"
  if(label.includes("observatory")) return "observatory"
  return "general"
}

function pausedEmbedUrl(value){
  if(!value) return ""
  return value
    .replace("autostart=1", "autostart=0")
    .replace("autospin=.15", "autospin=0")
}

function readStorage(key, fallback = ""){
  if(typeof window === "undefined") return fallback
  return window.localStorage.getItem(key) || fallback
}

function hasFreshEntry(){
  if(typeof window === "undefined") return false
  const last = Number(readStorage("digitalhut:lastAccountEntry", "0"))
  return last > 0 && Date.now() - last < INACTIVITY_MS
}

function preloadImages(urls){
  if(typeof window === "undefined") return Promise.resolve()
  const unique = [...new Set(urls.filter(Boolean))].slice(0, 4)
  return Promise.all(unique.map((src) => new Promise((resolve) => {
    const image = new Image()
    const done = () => resolve()
    image.onload = done
    image.onerror = done
    image.src = src
  })))
}

function preloadModels(urls, limit = 3){
  if(typeof document === "undefined") return
  const unique = [...new Set(urls.filter(Boolean))].slice(0, limit)
  unique.forEach((href) => {
    if(document.querySelector(`link[data-dh-model-preload="${href}"]`)) return
    const link = document.createElement("link")
    link.rel = "preload"
    link.as = "fetch"
    link.href = href
    link.crossOrigin = "anonymous"
    link.setAttribute("data-dh-model-preload", href)
    document.head.appendChild(link)
  })
}

function observatoryRecord({category, stage, sceneFeed, mode, tier, loading}){
  return {
    mainFrame: digitalHutBrainMap.mainFrame,
    category,
    stage: stage.label,
    mode,
    tier,
    title: sceneFeed.title,
    provider: sceneFeed.apiSource || sceneFeed.apiStatus || "seed",
    status: loading ? "verifying" : sceneFeed.apiStatus || "ready",
    physicalAssets: digitalHutBrainMap.physicalAssets,
    seoCanal: digitalHutBrainMap.seoCanal,
    assetResolver: digitalHutBrainMap.assetResolverIdentity,
    assetDirective: digitalHutBrainMap.assetResolverDirective,
    verifiedAt: new Date().toISOString()
  }
}

const categories = [
  ["DigitalHut Presentation", "DP", "#facc15", "default GLB editing workspace, presentation files, live model search, and advanced creator tools"],
  ["Mobility", "AO", "#22d3ee", "aerospace-style public feeds, route awareness, orbital access, vehicle environments, and verified observatory context"],
  ["Continent", "CO", "#67e8f9", "global terrain, travel, culture, and education"],
  ["Planetary", "PL", "#a78bfa", "structures, environments, and places around the world or off-world"],
  ["Orbital Compute", "OC", "#38bdf8", "orbital compute, laser links, satellite internet, space power, and verified observatory science technology"],
  ["Gamer", "GM", "#22c55e", "real-life game updates, new game visuals, level ideas, and play-session scouting"],
  ["Real Estate", "RE", "#2dd4bf", "international housing options, market pressure, property models, rental demand, travel access, and agent-ready scouting"],
  ["Workforce", "WF", "#fb7185", "jobsites, training, operations, and safety walkthroughs"],
  ["Political", "PO", "#f97316", "civic geography, public works, maps, and policy spaces"],
  ["Programmer", "PR", "#38bdf8", "research data, backend features, decentralized networks, APIs, and prototype logic"],
  ["Mainstream Streaming", "MS", "#f43f5e", "2026 trends, interesting topics, creator clips, funny videos, and stream-ready discussion"],
  ["Researcher", "RS", "#c084fc", "research notes, model rotation, detail logging, fast shuffling, verification, and AI analysis"],
  ["Science", "SC", "#60a5fa", "science experiments, voyages, labs, field studies, and evidence environments"],
  ["History", "HI", "#d6a85d", "historic districts, culture, timelines, ruins, archives, and public memory"],
  ["Businesses", "BU", "#22c55e", "business districts, storefronts, offices, market movement, and sponsor environments"]
].map(([id, icon, accent, context]) => ({id, icon, accent, context}))

const blinkQuickNodes = [
  {id: "stellar", title: "Stellar", category: "Planetary", minimumDays: 5, paid: "$250/year or $20/month", detail: "Cosmic, orbital compute, planetary GLB feeds"},
  {id: "real-estate-genius", title: "Genius Real Estate", category: "Real Estate", minimumDays: 5, paid: "$250/year or $20/month", detail: "International housing and market presentation feeds"},
  {id: "pro-gamer", title: "Pro Gamer", category: "Gamer", minimumDays: 5, paid: "$250/year or $20/month", detail: "Game-world, 360 visuals, and creator-safe feeds"}
]

const lobbyCategories = ["Mainstream Streaming", "Planetary", "Gamer", "Real Estate", "Researcher", "Programmer"]

const seedQueries = {
  "DigitalHut Presentation": ["editable glb presentation stage", "custom glb feature file overlay", "digitalhut model editing workspace", "presentation feature mode 3d"],
  "Mobility": ["live road travel conditions vehicle environment", "airport travel delay public feed 3d", "marine harbor travel conditions environment", "rail transit disruption public feed"],
  "Continent": ["japan urban environment read", "cape town coastal environment read", "amazon river environment read", "europe old city environment read"],
  "Planetary": ["international space station 3d model", "moon surface observatory 3d", "mars terrain 3d", "orbital city grid 3d"],
  "Orbital Compute": ["starcloud orbital compute public tracker", "free space optical communications satellite laser", "perovskite solar cell space power observatory", "starlink satellite internet edge compute"],
  "Gamer": ["open world game environment read", "animated boss room environment read", "mission hub game environment read", "sci fi arena environment read"],
  "Real Estate": ["international coastal housing market 3d", "global smart apartment housing data 3d", "tourist city rental pressure map 3d", "middle class international housing options 3d"],
  "Workforce": ["construction jobsite structure 3d", "warehouse training safety 3d", "city infrastructure operations 3d", "coastal response emergency planning 3d"],
  "Political": ["civic district public works 3d", "government building city 3d", "historical public square 3d", "infrastructure civic assets 3d"],
  "Programmer": ["developer api data center 3d", "renderer stress test 3d model", "city data twin 3d", "tool builder 3d interface"],
  "Mainstream Streaming": ["spongebob underwater media environment read", "viral creator studio environment read", "streaming trend room environment read", "social media trend environment read"],
  "Researcher": ["research archive 3d visualization", "scientific orbit research 3d", "field study terrain 3d", "ai analysis room 3d"],
  "Science": ["south america science voyage environment", "public health field lab environment", "weather experiment observatory", "environmental monitoring station"],
  "History": ["historic district environment read", "ancient city public memory", "museum archive environment", "heritage travel route"],
  "Businesses": ["business district sponsor environment", "local storefront market environment", "office tower data environment", "commerce route environment"]
}

const featuredFeeds = {
  "DigitalHut Presentation": [
    ["Editable GLB presentation stage", "Default creator view for choosing a GLB, opening editing controls, and staging the model for a live presentation.", "editable glb presentation stage"],
    ["Presentation feature mode", "Second-click advanced mode for adding overlays, special files, model notes, audio cues, and share packaging.", "presentation featured mode glb editor"],
    ["Custom GLB search bay", "Dedicated GLB search space for finding the model you want to edit before going live.", "custom glb search edit model"],
    ["DigitalHut sponsor package", "Backlink, title, sponsor line, contest prompt, and share metadata for the selected presentation.", "digitalhut sponsor presentation package"]
  ],
  "Mobility": [
    ["Road conditions and route context", "Public road, traffic, construction, weather, and route-awareness feed for drivers and passengers.", "live road traffic construction weather vehicle environment"],
    ["Airport and air travel status", "Public airport delay, visibility, diversion, terminal, and traveler-assistance context without acting as flight instrumentation.", "airport delay visibility diversion public travel feed"],
    ["Marine and harbor travel watch", "Public harbor, boating, coastal weather, access, and marina information presented as an environment read.", "marine harbor coastal weather travel environment"],
    ["Rail and transit movement", "Public rail, station, delay, construction, and regional transit information with a related environment model.", "rail station transit delay public feed"]
  ],
  "Real Estate": [
    ["International coastal housing options", "Compare coastal housing pressure across tourism markets, insurance risk, rental demand, and relocation value.", "international coastal housing market 3d"],
    ["Global smart apartment housing data", "A city-apartment housing lane for international renters, remote workers, middle-class buyers, and agent-ready walkthroughs.", "global smart apartment housing data 3d"],
    ["Tourist city rental pressure map", "Shows how tourism, hotels, airport access, and short-term rental pressure affect real housing decisions.", "tourist city rental pressure map 3d"],
    ["Fiji island family immersion", "Own a two-acre Fiji island section as a full environment: family, friends, coastline, local life, access, and what the place feels like.", "fiji island real estate environment read"],
    ["Texas Plano New Masjid Housing", "Plano housing environment around community access, local roads, nearby services, family living, and a new masjid housing context.", "texas plano masjid housing environment read"]
  ],
  "Gamer": [
    ["Zenith VR MMO world watch", "Official-link discovery for Zenith's open-world VR MMO. DigitalHut may attach an authorized trailer or licensed or user-owned environment GLB, but it does not copy the proprietary game world.", "zenith vr mmo open world environment", "https://zenithmmo.com/", "official-link-only"],
    ["Roblox immersive world discovery", "A discovery lane for public Roblox experiences and creator-authorized exports. Whole Roblox games are not converted into GLB packages.", "roblox immersive vr world environment", "https://www.roblox.com/", "official-link-only"],
    ["Vendetta Online galaxy watch", "Active 3D space-combat MMO discovery using the official game page and a separately licensed space environment GLB when available.", "vendetta online galaxy space vr environment", "https://www.vendetta-online.com/", "official-link-only"],
    ["OrbusVR archive world", "Historical VRMMO archive lane. The official OrbusVR site says the service has ended, so DigitalHut labels this as archival rather than live.", "orbusvr archive vr mmo environment", "https://orbusvr.com/", "archive-link-only"],
    ["Ilysia VR world watch", "Immersive VR-world discovery record awaiting a verified official source and a licensed environment GLB.", "ilysia vr mmo world environment", "", "verification-required"],
    ["Oasis and Lost Tower discovery request", "A verification lane for the exact title and rights holder before any trailer, artwork, or GLB is attached.", "oasis vr lost tower online environment", "", "verification-required"]
  ],
  "Planetary": [
    ["Saturn ring mission zone", "Planetary zone for orbit, scale, shadow, and ring observation.", "saturn rings mission 3d model"],
    ["Green-season waterfall zone", "Waterfall environment view for a slow nature pass and seasonal color story.", "green season waterfall terrain 3d"],
    ["Mars ridge survey zone", "Terrain zone for rocks, route planning, and research hazards.", "mars ridge terrain 3d model"],
    ["Starlink mothership hub", "Planetary tech environment around a Starlink-style hub, orbit routes, launch context, and related aerospace preview.", "elon musk starlink mothership hub environment read"]
  ],
  "Orbital Compute": [
    ["Starcloud orbital compute tracker", "Public-source orbital data-center lane: launch milestones, partner claims, energy plan, thermal risk, and confirmed/proposed/speculative status.", "starcloud orbital compute public tracker", "https://www.starcloud.com/", "public-source-tracker"],
    ["Free-space optical laser internet", "Laser-link lane for fiber-to-free-space handoff, satellite-to-ground path, weather sensitivity, alignment, bandwidth, and latency.", "free space optical communications satellite laser", "https://www.transcelestial.com/", "public-source-tracker"],
    ["Perovskite solar absorption lab", "Advanced materials lane for chemical ink, vacuum crystallization, absorption layers, stability, moisture protection, and space-power relevance.", "perovskite solar cell crystallized ink vacuum absorption", "", "research-tracker"],
    ["Starlink orbital access", "Satellite internet context for DigitalHut: latency, upload reliability, weather, placement, and backend GLB workflow improvements.", "starlink satellite internet edge compute", "https://www.starlink.com/", "public-source-tracker"]
  ],
  "Workforce": [
    ["London bridge construction project", "Public construction and workforce training view with an attached GLB.", "london bridge construction project 3d"],
    ["State road expansion project", "State infrastructure project for lane planning, safety, and public works.", "state road expansion government project 3d"],
    ["Water treatment upgrade project", "Government utility project for operations, workforce routing, and audit notes.", "water treatment plant upgrade 3d"],
    ["Airport terminal workforce project", "Large-site workforce model for crew movement, security, and public access.", "airport terminal construction project 3d"]
  ],
  "Mainstream Streaming": [
    ["2026 Launch to the Moon", "All-access production lane for launch structures, mission terrain, crowd energy, and orbital scale. Renderer opens only with a verified space environment GLB.", "2026 launch to the moon immersive environment"],
    ["Frontier AI: ChatGPT and Claude pushing limits", "Fast technology culture feed around AI systems, production studios, data centers, creators, and the human decisions around them.", "2026 frontier ai production environment"],
    ["Rap and global music culture watch", "High-energy music discovery lane for authorized performances, artist links, venue environments, and city culture. DigitalHut does not copy protected recordings.", "2026 rap global music venue culture environment"],
    ["Saturn Ring Immersion", "Deep planetary pass through ring scale, light, shadow, orbital routes, and observatory context.", "saturn rings immersive observatory environment"],
    ["Jungles of India", "Dense terrain, canopy, river, wildlife-access, weather, and research-route environment presentation.", "india jungle immersive terrain environment"],
    ["Great Wall of China expedition", "Architecture, mountain terrain, route, history, and large-scale travel environment.", "great wall of china immersive terrain environment"],
    ["Fiji bungalow real estate", "Coastal housing, access, island services, weather, and family-stay context in an international property environment.", "fiji bungalow real estate immersive environment"],
    ["Japan local ramen street", "Street-level food culture, storefronts, transit, lighting, and local neighborhood movement.", "japan local ramen shop street environment"],
    ["California Hollywood Sign", "Hillside terrain, city scale, tourism routes, film culture, and viewpoint access.", "california hollywood sign city environment"],
    ["New York Central Park and Bronx Zoo", "A city-nature production lane for trails, park scale, animal habitats, surrounding neighborhoods, and visitor access.", "new york central park bronx zoo environment"],
    ["Iceland scenery", "Volcanic terrain, waterfalls, roads, weather, and remote travel access in a cinematic environment.", "iceland scenery immersive terrain environment"],
    ["Siberia living", "Cold-climate settlements, terrain, transport, housing, and everyday regional context.", "siberia living winter settlement environment"]
  ],
  "Researcher": [
    ["New germ microscope environment", "Research find lane for a serious lab, evidence, and observation environment read.", "new germ found microscope research environment"],
    ["Dinosaur fossil fracture scan", "Fossil session for broken areas, age clues, and careful analysis.", "dinosaur fossil fracture 3d scan"],
    ["Ocean microplastic research project", "Actual research-project style card with a related model for presentation.", "ocean microplastic research project 3d"],
    ["South America science voyage", "Science experiment and voyage environment: closest Brazil or South America city context, research source link, terrain, route, and observation notes.", "south america science voyage brazil city environment read"]
  ],
  "Science": [
    ["South America science voyage", "Science experiment and voyage environment with Brazil/South America city context, terrain, route, and evidence notes.", "south america science voyage environment"],
    ["Public health field lab", "A field-lab environment for public health data, contact tracing, clinics, uncertainty, and response timing.", "public health field lab environment"],
    ["Weather experiment observatory", "A weather-data environment with storm bands, sensors, route risk, airport pressure, and public safety notes.", "weather experiment observatory environment"],
    ["Environmental monitoring station", "Air, water, sensor, and satellite observation environment with confidence layers and public guidance.", "environmental monitoring station environment"],
    ["Research lab evidence room", "Indoor lab and evidence environment for comparing claims, sources, and next observations.", "research lab evidence room environment"]
  ],
  "History": [
    ["Historic district environment", "A district-level history read with buildings, streets, access, public memory, and timeline context.", "historic district environment read"],
    ["Ancient city public memory", "Historic city environment for routes, ruins, old public spaces, and cultural pressure.", "ancient city public memory environment"],
    ["Museum archive environment", "Archive and exhibit environment for artifacts, source notes, and public learning.", "museum archive environment"],
    ["Heritage travel route", "Travel and culture environment with landmarks, routes, and local historical notes.", "heritage travel route environment"],
    ["Old civic plaza", "Public-history environment around a civic plaza, monuments, routes, and community memory.", "old civic plaza environment"]
  ],
  "Businesses": [
    ["Business district sponsor environment", "Office, sponsor, storefront, and city movement environment for public business viewing.", "business district sponsor environment"],
    ["Local storefront market", "Street-level business environment for food, local commerce, foot traffic, and customer flow.", "local storefront market environment"],
    ["Office tower data environment", "Business intelligence environment with office blocks, data routes, service lanes, and sponsor surfaces.", "office tower data environment"],
    ["Commerce route environment", "Route and logistics environment for local business movement, deliveries, and customer access.", "commerce route environment"],
    ["Startup showcase environment", "Presentation space for startup demos, sponsor attachments, and shareable backlinks.", "startup showcase environment"]
  ],
  "Programmer": [
    ["New AI model production stack", "Developer movie beat: an AI model discovery moves into production company workflow.", "new AI model production code feature"],
    ["Decentralized render network", "Backend and decentralized network visual as an environment of nodes, routes, providers, and system pressure.", "decentralized render network environment"],
    ["API data observatory room", "Provider payload, fallback, and monitoring room for debugging.", "api data observatory room 3d"],
    ["Search classifier engine", "Programmer card for category routing and query intent testing.", "search classifier engine 3d"]
  ],
  "Continent": [
    ["Japan environment read", "Global place moment focused on streets, buildings, routes, culture, and public scene context.", "japan urban environment read"],
    ["Cape Town coastal terrain", "Coastline, elevation, and route readout for continent mode.", "cape town coastal terrain 3d"],
    ["Amazon river research route", "Environment route that can bridge to researcher and planetary modes.", "amazon river terrain 3d"],
    ["Alps village winter pass", "Travel and terrain environment session with routes, buildings, access, and weather context.", "alps village winter environment"]
  ],
  "Political": [
    ["Civic plaza public works", "Public space and policy environment read with access, routes, structures, and public pressure.", "civic plaza public works environment"],
    ["Transit station funding map", "Infrastructure policy card for access, routes, and funding tradeoffs.", "transit station infrastructure 3d"],
    ["Government building access plan", "Civic access and security walkthrough.", "government building access 3d"],
    ["Bridge repair public notice", "Public works bridge repair lane that can bridge to workforce.", "bridge repair public works 3d"]
  ]
}

const guidedTours = {
  "DigitalHut Presentation": [["Select GLB", "GL", "Choose the editable model and keep it open in the main renderer."], ["Edit Files", "EF", "Add overlays, notes, audio cues, attachments, and special files for the presentation."], ["Feature Mode", "FM", "Stage the model as a polished live feature with backlink, sponsor line, and creator controls."], ["Publish", "PB", "Package the GLB presentation for sharing, saving, and future realtime feed posting."]],
  "Mobility": [["Surroundings", "SR", "Read the public route, weather, access, congestion, and environment context around the current aerospace display."], ["Session Notes", "SN", "Keep visible observations, service records, source notes, and questions organized without inventing sensor readings."], ["Live Feed", "LF", "Present related public pictures, reports, podcasts, and GLB environments in a controlled sequence."], ["Assistance", "AS", "Pause the presentation, preserve the current record, and surface qualified support options selected by the user."]],
  "Continent": [["Terrain", "TR", "Read elevation, coastline, streets, routes, and what the region teaches."], ["Culture", "CU", "Explain landmarks, public memory, travel value, and culture."], ["Route", "RT", "Move through access points and nearby context."], ["Compare", "CP", "Compare this place against similar regions."]],
  "Planetary": [["Orbit", "OR", "Start from orbit, scale, lighting, and mission frame."], ["Surface", "SF", "Inspect terrain, hazards, and research targets."], ["Mission", "MS", "Narrate objectives and next observation."], ["Research", "RS", "Name evidence, uncertainty, and open questions."]],
  "Orbital Compute": [["Orbit", "OR", "Read satellite and orbital infrastructure."], ["Signal", "SG", "Compare laser, fiber, radio, ground station, weather, and latency limits."], ["Power", "PW", "Track solar absorption, thermal load, and material stability."], ["Verify", "VF", "Label confirmed, proposed, speculative, and source-needed claims."]],
  "Gamer": [["Spawn", "SP", "Read spawn, sightlines, paths, and first player decision."], ["Mechanics", "MC", "Explain loops, hazards, rewards, and interaction zones."], ["Assets", "AS", "Inspect modular value and prototype readiness."], ["Quest", "QS", "Turn the scene into a playable quest route."]],
  "Real Estate": [["International", "IN", "Compare country, city, travel access, buyer path, and housing option type."], ["Market", "MK", "Read affordability, rental pressure, tourism pressure, demand signals, and comparable regions."], ["Risk", "RK", "Call out weather, insurance, title, liquidity, maintenance, and local verification questions."], ["Agent View", "AV", "Turn the scene into an agent-ready explanation for buyers, renters, or relocation clients."]],
  "Workforce": [["Safety", "SF", "Walk hazards, access, staging, and worker awareness."], ["Training", "TR", "Teach the scene as a new-worker module."], ["Ops", "OP", "Explain routing, resources, crew flow, and bottlenecks."], ["Audit", "AU", "Record what is live, what needs verification, and what changed."]],
  "Political": [["Civic", "CV", "Read public access, service zones, and community value."], ["Policy", "PY", "Explain infrastructure choices, funding, and tradeoffs."], ["Public", "PB", "Narrate so normal visitors understand the space."], ["Map", "MP", "Use boundaries, routes, population pressure, and comparison."]],
  "Programmer": [["API", "AP", "Inspect provider source, payload shape, and fallback state."], ["Runtime", "RT", "Narrate renderer state, wallet state, and asset load path."], ["Agent", "AG", "Explain monitoring, SEO, GLB testing, and FireCuda ops."], ["Debug", "DB", "State what is live, fallback, blocked, and how to verify."]],
  "Mainstream Streaming": [["Trend", "TR", "Frame why this topic, clip, or visual could hold attention in 2026."], ["Hook", "HK", "Name the funny, surprising, useful, or visual moment to lead with."], ["Audience", "AU", "Explain who would watch, share, remix, or react to it."], ["Next Clip", "NC", "Move to a related model or visual so the stream keeps momentum."]],
  "Researcher": [["Evidence", "EV", "Review source quality, uncertainty, and strongest supportable claim."], ["Sources", "SO", "Name APIs, missing data, and verification path."], ["Compare", "CP", "Compare against related scenes and datasets."], ["Hypothesis", "HY", "Build a testable hypothesis and next observation."]],
  "Science": [["Experiment", "EX", "Open the experiment environment and identify what is being measured."], ["Voyage", "VY", "Read the field route, terrain, local city context, and observation path."], ["Evidence", "EV", "Separate confirmed evidence from uncertain data."], ["Publish", "PB", "Prepare the science report for backend SEO publishing."]],
  "History": [["District", "DS", "Read the historic district, roads, buildings, and public memory."], ["Timeline", "TL", "Explain the time period and what changed in the place."], ["Culture", "CU", "Name cultural signals and public learning value."], ["Route", "RT", "Move through the heritage route like a 3D story."]],
  "Businesses": [["District", "BD", "Read the business district environment and sponsor surfaces."], ["Traffic", "TR", "Explain customer movement, storefront access, and commerce flow."], ["Sponsor", "SP", "Attach sponsor/backlink language without taking over the content."], ["Publish", "PB", "Package the business report for sharing and SEO indexing."]]
}

const stages = [
  {id: "Model", label: "Current GLB", kind: "current", orbit: "25deg 62deg auto", fov: "34deg"},
  {id: "Angle", label: "Angle Pass", kind: "angle", orbit: "70deg 68deg auto", fov: "27deg"},
  {id: "Similar", label: "Similar GLB", kind: "similar", orbit: "-35deg 64deg auto", fov: "38deg"},
  {id: "Stats", label: "Statistics GLB", kind: "stats", orbit: "35deg 58deg auto", fov: "31deg"}
]

function metaFor(category){
  return categories.find((item) => item.id === category) || categories[0]
}

function toursFor(category){
  return (guidedTours[category] || guidedTours.Continent).map(([id, icon, prompt]) => ({id, icon, prompt}))
}

function seedFeeds(category){
  const meta = metaFor(category)
  const firecudaFeeds = firecudaSeedFeeds(category)
  const featured = featuredFeeds[category]
  if(featured?.length) {
    const expanded = [...featured]
    const queries = seedQueries[category] || seedQueries.Continent
    while(expanded.length < 5){
      const index = expanded.length
      const query = queries[index % queries.length]
      expanded.push([`${category} live 3D model ${index + 1}`, `${category} default live model with a real renderer asset attached before search takes over.`, query])
    }
    const featuredSeeds = expanded.map(([title, note, query, viewerUrl = "", rightsStatus = "curated-discovery"], index) => ({
      id: `featured:${category}:${index}:${query}`,
      title,
      note,
      query,
      category,
      icon: meta.icon,
      accent: meta.accent,
      context: meta.context,
      thumbnail: stockUrl(category, index),
      modelUrl: relatedGlb(category, index),
      viewerUrl,
      apiSource: "DigitalHut featured reel",
      apiStatus: relatedGlb(category, index) ? "verified-backup-glb" : "verified-glb-required",
      rightsStatus,
      productionStyle: "all-access immersive environment"
    }))
    return [...firecudaFeeds, ...featuredSeeds].slice(0, 10)
  }
  const querySeeds = (seedQueries[category] || seedQueries.Continent).map((query, index) => ({
    id: `seed:${category}:${index}:${query}`,
    title: query.replace(/\b3d\b/gi, "").replace(/\s+/g, " ").trim(),
    note: `API seed for ${meta.context}.`,
    query,
    category,
    icon: meta.icon,
    accent: meta.accent,
    context: meta.context,
    thumbnail: stockUrl(category, index),
    modelUrl: relatedGlb(category, index),
    apiStatus: "environment-read-ready"
  }))
  return [...firecudaFeeds, ...querySeeds].slice(0, 10)
}

function cleanUrl(value){
  if(!value || typeof value !== "string") return ""
  const normalized = value.startsWith("//") ? `https:${value}` : value
  return isLikelyBrokenStorageUrl(normalized) ? "" : normalized
}

function payloadItems(payload){
  const pools = [payload?.assets, payload?.results, payload?.items, payload?.models, payload?.feed, payload?.data]
  for(const pool of pools){
    if(Array.isArray(pool)) return pool
    if(Array.isArray(pool?.results)) return pool.results
    if(Array.isArray(pool?.items)) return pool.items
  }
  return []
}

function firstThumbnail(item){
  const images = item?.thumbnails?.images || item?.thumbnail?.images || item?.images || []
  if(Array.isArray(images) && images.length){
    const best = [...images].sort((a, b) => (b.width || 0) - (a.width || 0))[0]
    return cleanUrl(best?.url || best?.src)
  }
  return cleanUrl(item?.thumbnailUrl || item?.thumbnail_url || item?.thumbnail || item?.image || item?.poster || item?.cover)
}

function normalizeAsset(item, category, index, source, term){
  const meta = metaFor(category)
  const uid = item?.uid || item?.modelUid || item?.model_uid || item?.model?.uid || ""
  const embedUrl = cleanUrl(item?.embedUrl || item?.embed_url || item?.viewerEmbedUrl || item?.viewer_embed_url || item?.embed?.url || item?.urls?.embed || (uid ? `https://sketchfab.com/models/${uid}/embed?autostart=1&autospin=.15&ui_theme=dark&ui_infos=0&ui_watermark=0` : ""))
  const rawModelUrl = cleanUrl(item?.modelUrl || item?.model_url || item?.glbUrl || item?.glb_url || item?.gltfUrl || item?.gltf_url || item?.downloadUrl || item?.download_url)
  const viewerUrl = cleanUrl(item?.viewerUrl || item?.viewer_url || item?.url || item?.urls?.viewer || item?.webUrl || item?.web_url)
  const title = item?.title || item?.name || item?.displayName || `${category} API feed ${index + 1}`
  return {
    id: `api:${source}:${category}:${uid || index}:${title}`,
    title,
    note: item?.note || item?.description || item?.summary || `Live API result for ${term || category}.`,
    query: term || title,
    category,
    icon: meta.icon,
    accent: meta.accent,
    context: meta.context,
    thumbnail: firstThumbnail(item) || stockUrl(category, index),
    embedUrl,
    modelUrl: rawModelUrl,
    viewerUrl,
    apiSource: item?.apiSource || source,
    apiStatus: item?.apiStatus || (embedUrl || rawModelUrl ? "direct-api-model" : "api-record-no-model"),
    providerMix: item?.providerMix || item?.providers || [source],
    tags: Array.isArray(item?.tags) ? item.tags : [],
    market: item?.market,
    cesium: item?.cesium
  }
}

async function fetchWithTimeout(endpoint, options = {}, timeoutMs = 1800){
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs)
  try{
    return await fetch(endpoint, {...options, signal: controller.signal})
  } finally {
    window.clearTimeout(timeout)
  }
}

async function resolveApiFeeds(category, term){
  const query = encodeURIComponent(term || category)
  const encodedCategory = encodeURIComponent(category)
  const endpoints = [
    [`sketchfab`, `/api/sketchfab?category=${encodedCategory}&query=${query}`],
    [`observatory`, `/api/observatory?category=${encodedCategory}&query=${query}`],
    [`observatory-feed`, `/api/observatory-feed?category=${encodedCategory}&query=${query}`]
  ]

  const attempts = await Promise.allSettled(endpoints.map(async ([source, endpoint]) => {
    const response = await fetchWithTimeout(endpoint, {headers: {Accept: "application/json"}})
    if(!response.ok) return []
    const payload = await response.json()
    return payloadItems(payload).map((item, index) => normalizeAsset(item, category, index, source, term))
  }))
  const termTokens = String(term || category).toLowerCase().split(/[^a-z0-9]+/).filter((item) => item.length > 2)
  const seen = new Set()
  const items = attempts
    .filter((attempt) => attempt.status === "fulfilled")
    .flatMap((attempt) => attempt.value)
    .filter((item) => {
      const key = item.modelUrl || item.embedUrl || item.viewerUrl || item.title
      if(!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
    .map((item) => {
      const haystack = `${item.title || ""} ${item.note || ""} ${item.query || ""} ${item.apiSource || ""}`.toLowerCase()
      const tokenScore = termTokens.reduce((score, token) => score + (haystack.includes(token) ? 4 : 0), 0)
      const source = String(item.apiSource || "").toLowerCase()
      const directScore = item.embedUrl ? 76 : item.viewerUrl ? 34 : item.modelUrl ? (isStorageLibrarySource(item) ? 4 : 68) : 0
      const sourceScore = source.includes("sketchfab") ? 44 : source.includes("observatory") ? 18 : source.includes("firecuda") || source.includes("supabase") ? -24 : 6
      return {...item, matchScore: directScore + sourceScore + tokenScore}
    })
    .sort((a, b) => b.matchScore - a.matchScore)
  return items.slice(0, 16)
}

function speak(text){
  if(typeof window === "undefined" || !("speechSynthesis" in window)) return
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.rate = 0.94
  utter.pitch = 0.92
  window.speechSynthesis.speak(utter)
}

function announceOpen3dModel(feed){
  playSessionSound(feed.category || "System", "open")
  speak(`Open 3D Model View. Attaching the AI to ${feed.title}.`)
}

function speechEngine(){
  if(typeof window === "undefined") return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

function categoryFromCommand(text){
  const value = text.toLowerCase()
  const matches = [
    ["Mainstream Streaming", ["spongebob", "viral", "stream", "streaming", "trend", "funny video", "creator", "cat video", "youtube", "tiktok", "meme"]],
    ["Gamer", ["link", "zelda", "game", "gamer", "gaming", "level", "character", "avatar", "cool game", "boss", "quest"]],
    ["Orbital Compute", ["orbital compute", "starcloud", "star cloud", "starlink", "satellite internet", "laser internet", "free space optical", "transcelestial", "perovskite", "space solar", "orbital data"]],
    ["Mobility", ["aerospace", "aviation", "avionics", "auto mechanic", "mechanic mode", "vehicle", "car", "truck", "motorcycle", "road trip", "traffic condition", "airport delay", "flight delay", "air travel", "boat", "marine", "harbor", "rail", "train", "transit"]],
    ["Workforce", ["construction", "bridge", "london bridge", "state project", "government project", "workforce", "jobsite", "training", "public works", "road", "airport", "terminal"]],
    ["Science", ["science", "experiment", "voyage", "field study", "public health", "weather experiment", "environmental monitoring", "south america", "brazil"]],
    ["History", ["history", "historic", "ancient", "museum", "heritage", "old city", "archive", "timeline"]],
    ["Businesses", ["business", "businesses", "sponsor", "storefront", "office", "commerce", "startup", "market district"]],
    ["Researcher", ["new germ", "germ", "research", "researcher", "fossil", "dinosaur", "history", "experiment", "analysis", "verify", "artifact", "lab", "microscope"]],
    ["Programmer", ["programmer", "code", "backend", "decentralized", "api", "network", "database", "ai model", "production company", "developer"]],
    ["Real Estate", ["real estate", "housing", "house", "property", "agent", "north carolina", "middle class", "neighborhood", "rent", "mortgage"]],
    ["Planetary", ["space", "planet", "planetary", "saturn", "mars", "moon", "orbit", "canada", "mountain", "environment", "place", "waterfall", "waterfalls"]],
    ["DigitalHut Presentation", ["digitalhut presentation", "presentation featured", "featured mode", "edit glb", "editable glb", "custom glb", "glb editor", "presentation mode"]],
    ["Political", ["political", "civic", "policy", "government", "public notice", "election"]],
    ["Continent", ["continent", "country", "world", "travel"]]
  ]
  const keywordMatch = matches.find(([, aliases]) => aliases.some((alias) => value.includes(alias)))?.[0]
  if(keywordMatch) return keywordMatch
  return inferCategoryByVector(value, categories)
}

function queryFromCommand(text, fallback){
  const value = text.toLowerCase()
  if(value.includes("spongebob")) return "spongebob style underwater environment viral 3d preview"
  if(value.includes("link")) return "link fantasy adventure game environment 3d preview"
  if(value.includes("london bridge")) return "london bridge construction workforce project 3d model"
  if(value.includes("new germ") || value.includes("germ")) return "new germ microscope research discovery 3d model"
  if(value.includes("canada")) return "canada landscape city terrain 3d model"
  if(value.includes("saturn")) return "saturn planet rings 3d model"
  if(value.includes("starcloud") || value.includes("orbital compute")) return "starcloud orbital compute public tracker"
  if(value.includes("starlink")) return "starlink satellite internet edge compute"
  if(value.includes("transcelestial") || value.includes("laser internet") || value.includes("free space optical")) return "free space optical communications satellite laser"
  if(value.includes("perovskite")) return "perovskite solar cell crystallized ink vacuum absorption"
  if(value.includes("waterfall")) return "green season waterfall terrain 3d model"
  if(value.includes("game character")) return "2026 game world environment read"
  if(value.includes("north carolina")) return "north carolina middle class real estate housing 3d model"
  if(value.includes("cat")) return "funny cat video viral 2026 visual"
  if(value.includes("fossil")) return "fossil artifact dinosaur bone 3d model"
  if(value.includes("housing")) return "housing market property 3d model"
  if(value.includes("decentralized")) return "decentralized network data center 3d model"
  if(value.includes("funny")) return "funny creator video studio 2026 trend visual"
  if(value.includes("ai model")) return "new AI model production code feature 3d"
  if(value.includes("vehicle") || value.includes("mechanic") || value.includes("car") || value.includes("truck")) return "vehicle road conditions maintenance environment 3d"
  if(value.includes("airport delay") || value.includes("flight delay") || value.includes("air travel")) return "airport travel delay public environment 3d"
  if(value.includes("boat") || value.includes("marine") || value.includes("harbor")) return "marine harbor travel conditions environment 3d"
  if(value.includes("rail") || value.includes("train") || value.includes("transit")) return "rail transit station public feed 3d"
  const cleaned = text.replace(/\b(open|show me|find|search|run|command|look up|category|please|digitalhut|ai|preview|next|model|guided tour|tour)\b/gi, " ").replace(/\s+/g, " ").trim()
  if(cleaned.length > 2) return `${cleaned} 3d model visual`
  return fallback
}

function topicInsight({category, query, feed, stage}){
  const subject = query.replace(/\b3d model visual\b/i, "").replace(/\b3d model\b/i, "").trim() || feed.title
  const source = feed.apiSource || feed.apiStatus || "observatory feed"
  if(category === "Planetary") return `I read ${subject} as a place or environment session. I would start wide, then rotate into the structure, terrain, scale, and visible landmarks. Source status is ${source}.`
  if(category === "Gamer") return `${subject} fits the Gamer lane. I am reading it as a playable environment: spawn space, routes, lighting, world mood, hazards, and what a player would do first. Source status is ${source}.`
  if(category === "Real Estate") return `${subject} fits the international Real Estate lane. I am checking country and city signal, housing affordability, rental pressure, insurance or travel risk, neighborhood context, and what an agent or buyer should verify before trusting the opportunity. Source status is ${source}.`
  if(category === "Programmer") return `${subject} fits Programmer mode. I am checking data shape, backend use, provider reliability, decentralized network relevance, and what can be logged or automated. Source status is ${source}.`
  if(category === "Researcher") return `${subject} fits Researcher mode. I am checking evidence, age or history clues, broken areas, visible details, and what still needs verification. Source status is ${source}.`
  if(category === "Mainstream Streaming") return `${subject} fits Mainstream Streaming. I am looking for the hook, what makes it funny or shareable, why it could trend in 2026, and what clip should come next. Source status is ${source}.`
  if(category === "Orbital Compute") return `${subject} fits Orbital Compute. I am reading public orbital infrastructure, signal path, power requirements, weather limits, launch or deployment status, and what still needs source verification. Source status is ${source}.`
  if(category === "Mobility") return `${subject} fits the Aerospace Display. I am reading public travel conditions, route context, visible infrastructure details, weather, access, and session notes. This is advisory media, not a certified instrument or control system. Source status is ${source}.`
  return `${subject} is loaded in ${category}. I am checking the current model, the stage ${stage.label}, and what related model should come next.`
}

function modelDataReadout({feed, category, stage}){
  const provider = feed.apiSource || feed.apiStatus || "observatory feed"
  const modelLink = feed.modelUrl || feed.viewerUrl || feed.embedUrl || ""
  const session = metaFor(category).context
  return {
    provider,
    modelLink,
    lines: [
      `I am reading ${feed.title}.`,
      `Category is ${category}, stage is ${stage.label}.`,
      `Source status is ${provider}.`,
      `Session context: ${session}`,
      `Visible note: ${feed.note || "no extra note attached yet"}`,
      modelLink ? "A verified environment model or viewer link is attached to this record." : "The provider did not expose a direct environment GLB yet, so I am rendering the environment read from the scene data."
    ]
  }
}

function feedbackPrompt({category, feed}){
  if(category === "Researcher") return `Did you see the details on ${feed.title} clearly, or should I rotate and compare another source?`
  if(category === "Programmer") return "Should I inspect the backend/API relevance, or bridge this into researcher verification?"
  if(category === "Workforce") return "Should I turn this into training, safety, or project workflow notes?"
  if(category === "Planetary") return "Did you see the structure yet, or should I bridge from this view into developer and research mode?"
  if(category === "Orbital Compute") return "Should I keep tracking orbital compute, compare signal paths, or bridge this into planetary research?"
  if(category === "Mainstream Streaming") return "Should I keep this moving like a stream and load the next trend?"
  if(category === "Mobility") return "Should I hold this aerospace display, open the next public feed, or save a session note?"
  return `Did you see the model yet, or should I open a related view?`
}

function streamReadout({category, query, feed, stage}){
  const readout = modelDataReadout({feed, category, stage})
  return `${movieBeat({category, feed, stage})} ${topicInsight({category, query, feed, stage})} ${readout.lines.slice(2).join(" ")} ${feedbackPrompt({category, feed})}`
}

function movieBeat({category, feed, stage}){
  const title = feed.title
  if(category === "Mainstream Streaming"){
    const lower = `${title} ${feed.note || ""}`.toLowerCase()
    if(lower.includes("spongebob")) return `HA HA HA, I love SpongeBob. Viral trend: funny Patrick interaction. I am putting the undersea environment next to the best 3D preview so the joke has a place to live.`
    if(lower.includes("water balloon")) return `Nice viral trend: a water balloon popped and splashed someone. HA HA, now I am reading the scene around it so the viewer sees the setup, splash area, and reaction space.`
    return `Ten minutes into the live feed: featuring ${title}. I am opening the environment around the topic so the post is not just a loose object or thumbnail. Sound cue: fun stream bounce, then a clean pause for the visual.`
  }
  if(category === "DigitalHut Presentation"){
    return `DigitalHut Presentation is the creator workspace. ${title} stays in the renderer while the editor searches, attaches files, and prepares Presentation Featured Mode.`
  }
  if(category === "Gamer"){
    return `Now switching to Gamer. ${title} is on screen; I am reading the world space, effects, level path, and the part viewers would want to play.`
  }
  if(category === "Planetary"){
    return `Now switching GLBs to Planetary. Take your time with ${title}; I will slow the camera and let the environment carry the scene.`
  }
  if(category === "Orbital Compute"){
    return `Orbital Compute reel is live. ${title} is being read as public space infrastructure: orbit path, signal route, power layer, thermal risk, and verification status.`
  }
  if(category === "Programmer"){
    return `Next reel: Programmer. ${title} is the production-stack moment; I am checking the code, data, backend, and what makes it useful.`
  }
  if(category === "Researcher"){
    return `Researcher mode is serious now. ${title} needs evidence, source caution, and a slow ${stage.label} before I make a claim.`
  }
  if(category === "Workforce"){
    return `Workforce bridge is live. ${title} becomes a project walkthrough: crews, public access, safety, and what has to be verified.`
  }
  if(category === "Real Estate"){
    return `International Real Estate reel is live. ${title} is presented like an observatory housing report: location, market pressure, affordability, travel access, rental demand, and what buyers or agents should verify next.`
  }
  if(category === "Mobility"){
    return `Aerospace Display is live. ${title} stays centered while I present public travel context, visible environment details, and source notes without inventing sensor readings.`
  }
  return `Next live reel: ${category}. ${title} is attached to an environment read so the show stays visual and grounded.`
}

function shouldTreatAsSearch(text){
  const lower = text.toLowerCase()
  if(lower.includes("save") || lower.includes("download note") || lower.includes("guided") || lower.includes("tour") || lower.includes("rotate") || lower.includes("camera") || lower.includes("tell me more") || lower.includes("history") || lower.includes("facts") || lower.includes("preview next") || lower.includes("next model") || lower.includes("deep research") || lower.includes("new trend") || lower.includes("jump category") || lower.includes("bridge")) return false
  return true
}

function talentNodeFromCommand(text){
  const value = String(text || "").toLowerCase()
  const nodes = [
    ["stellar", ["stellar", "interstellar", "cosmic"]],
    ["researcher", ["pure researcher", "researcher", "research authority", "research"]],
    ["avionics", ["amazing avionics", "avionics", "aerospace"]],
    ["world-cup", ["world cup", "global event"]],
    ["real-estate-genius", ["genius real estate", "real estate genius", "property node"]],
    ["guru-360", ["360 guru", "360", "orbit node"]],
    ["exotic-environment", ["exotic environment", "environment node", "mood reset"]],
    ["audience-magnet", ["audience magnet", "views", "reactions"]],
    ["backend-builder", ["backend builder", "backend node"]],
    ["mainstream-pulse", ["mainstream pulse", "viral node"]]
  ]
  return nodes.find(([, aliases]) => aliases.some((alias) => value.includes(alias)))?.[0] || "stellar"
}

function isNoteCommand(text){
  const lower = text.toLowerCase()
  return lower.includes("take note") || lower.includes("write note") || lower.includes("add note") || lower.includes("note this")
}

function readAiUsage(tier){
  const key = `digitalhut:aiUsage:${tier}`
  const fallback = {startedAt: Date.now(), usedMs: 0}
  try{
    const saved = JSON.parse(window.localStorage.getItem(key) || "null")
    if(!saved || Date.now() - saved.startedAt > AI_WINDOW_MS) return fallback
    return saved
  } catch {
    return fallback
  }
}

function writeAiUsage(tier, usage){
  window.localStorage.setItem(`digitalhut:aiUsage:${tier}`, JSON.stringify(usage))
}

function readLiveFeed(){
  if(typeof window === "undefined") return []
  try{
    const saved = JSON.parse(window.localStorage.getItem(liveFeedStorageKey) || "[]")
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

function writeLiveFeed(items){
  window.localStorage.setItem(liveFeedStorageKey, JSON.stringify(items.slice(0, 24)))
}

function readDirectorChat(){
  if(typeof window === "undefined") return []
  try{
    const saved = JSON.parse(window.localStorage.getItem(directorChatStorageKey) || "[]")
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

function writeDirectorChat(items){
  if(typeof window === "undefined") return
  window.localStorage.setItem(directorChatStorageKey, JSON.stringify(items.slice(0, 40)))
}

function viralShareTitle(feed){
  return `Live 3D Project: ${feed.title}`
}

function viralShareText({feed, hostLine, contestPrompt}){
  return `${hostLine}\n\n${contestPrompt}\n\nFeatured on digitalhut.app`
}

function liveMetricsFor(category, index = 0){
  const base = category === "Mainstream Streaming" ? 23800 : category === "Gamer" ? 18400 : category === "Real Estate" ? 9200 : category === "Researcher" ? 7600 : 11200
  return {
    minute: "10:00",
    views: base + index * 1200,
    likes: Math.round((base + index * 1200) * .052),
    comments: Math.round((base + index * 1200) * .008)
  }
}

async function publishLiveFeedPost(post){
  const url = import.meta.env?.VITE_SUPABASE_URL
  const key = import.meta.env?.VITE_SUPABASE_ANON_KEY
  if(!url || !key) return {synced: false, reason: "Supabase env not configured"}
  try{
    const {createClient} = await import("@supabase/supabase-js")
    const supabase = createClient(url, key)
    const {error} = await supabase.from("digitalhut_live_feed").insert(post)
    if(error) throw error
    return {synced: true}
  } catch (error) {
    return {synced: false, reason: error.message}
  }
}

function guideLine({category, stage, feed, tour, expanded = false}){
  const base = `${stage.label}. ${feed.title}.`
  const session = metaFor(category).context
  if(stage.kind === "current") return expanded ? `${base} I am staying with the contained model for this ${session} session and checking the main shape, source, and viewing angle.` : `${base} First I hold on the model for the ${category} session.`
  if(stage.kind === "angle") return expanded ? `${base} Now I rotate the view slowly and look for layout, access, scale, and visible risk.` : `${base} Next angle, slow pass.`
  if(stage.kind === "similar") return expanded ? `${base} I compare this against a nearby or similar feed before making a stronger claim.` : `${base} Similar model comparison.`
  if(stage.kind === "stats") return expanded ? `${base} I move into market, provider, and verification context for ${category}. ${tour.prompt}` : `${base} Statistics and verification.`
  return expanded ? `${base} ${tour.prompt}` : base
}

function extendedGuideLine({category, stage, feed, tour, depth}){
  const session = metaFor(category).context
  if(depth <= 0) return guideLine({category, stage, feed, tour, expanded: true})
  if(depth === 1) return `${feed.title}. I am staying on this model a little longer and checking source, visual evidence, and what matters for ${session}.`
  return `${feed.title}. I have enough on this view. Next I need room to load a related model so the presentation can compare instead of overthinking one asset.`
}

function followUpNotes({category, stage, feed, tour}){
  const source = feed.apiSource || feed.apiStatus || "provider"
  const session = metaFor(category).context
  const notes = [
    `Verify ${feed.title} against the ${source} record.`,
    `Save this ${category} view if it supports ${session}.`,
    `Ask one follow-up: ${tour.prompt}`
  ]
  if(stage.kind === "angle") notes[0] = "Check the model from one more angle before explaining value."
  if(stage.kind === "similar") notes[1] = "Compare this asset against the next related feed before downloading."
  if(stage.kind === "stats") notes[2] = "Use market intelligence only after provider and asset status are clear."
  return notes
}

function playLoaderTone(){
  playSessionSound("System", "login")
}

function audioContext(){
  if(typeof window === "undefined") return null
  const Audio = window.AudioContext || window.webkitAudioContext
  if(!Audio) return null
  if(!window.__digitalhutAudio) window.__digitalhutAudio = new Audio()
  const ctx = window.__digitalhutAudio
  if(ctx.state === "suspended") ctx.resume().catch(() => null)
  return ctx
}

function tone(ctx, freq, start, duration, type = "sine", volume = .04){
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + .02)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(gain).connect(ctx.destination)
  osc.start(start)
  osc.stop(start + duration + .02)
}

function noise(ctx, start, duration, volume = .03, frequency = 260){
  const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration))
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for(let index = 0; index < bufferSize; index += 1) data[index] = Math.random() * 2 - 1
  const source = ctx.createBufferSource()
  const filter = ctx.createBiquadFilter()
  const gain = ctx.createGain()
  filter.type = "lowpass"
  filter.frequency.setValueAtTime(frequency, start)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + .04)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  source.buffer = buffer
  source.connect(filter).connect(gain).connect(ctx.destination)
  source.start(start)
  source.stop(start + duration + .02)
}

function playSessionSound(category, event = "open"){
  const ctx = audioContext()
  if(!ctx) return
  const now = ctx.currentTime + .01
  const fun = category === "Gamer" || category === "Mainstream Streaming"
  const serious = category === "Researcher" || category === "Fossils" || category === "Political"
  const professional = category === "Real Estate" || category === "Programmer" || category === "Workforce"
  if(event === "stop"){
    tone(ctx, 320, now, .16, "sine", .025)
    tone(ctx, 180, now + .11, .22, "sine", .02)
    return
  }
  if(fun){
    tone(ctx, 520, now, .11, "triangle", .035)
    tone(ctx, 780, now + .09, .12, "triangle", .035)
    tone(ctx, 1040, now + .19, .16, "sine", .025)
    if(event === "bridge") noise(ctx, now + .06, .2, .012, 1800)
    return
  }
  if(serious){
    tone(ctx, event === "bridge" ? 72 : 88, now, .5, "sawtooth", .035)
    tone(ctx, 148, now + .08, .42, "sine", .025)
    noise(ctx, now + .12, .45, .028, 180)
    return
  }
  if(professional){
    tone(ctx, 220, now, .18, "sine", .025)
    tone(ctx, event === "bridge" ? 440 : 330, now + .13, .2, "triangle", .022)
    return
  }
  tone(ctx, 280, now, .18, "sine", .025)
  tone(ctx, 560, now + .12, .2, "triangle", .02)
}

function createStatsFeed(feed, category, tour){
  const meta = metaFor(category)
  const marketLine = feed.market?.summary || feed.note || "Provider statistics and comparison layer."
  const cesiumLine = feed.cesium?.summary || "Geospatial context layer ready."
  return {
    ...feed,
    id: `stats:${feed.id}:${tour.id}`,
    title: `${feed.title} statistics model`,
    note: `${marketLine} ${cesiumLine}`,
    category,
    icon: "ST",
    accent: meta.accent,
    embedUrl: feed.statsEmbedUrl || "",
    modelUrl: feed.statsModelUrl || "",
    apiStatus: "statistics"
  }
}

function SceneObject({feed, compact = false}){
  const blocks = compact ? [0, 1, 2, 3] : [0, 1, 2, 3, 4, 5, 6]
  return <div className={`dh-scene-object ${compact ? "compact" : ""}`} style={{"--accent": feed.accent}}>
    <div className="dh-scene-halo" />
    <div className="dh-scene-disc" />
    <div className="dh-scene-blocks">{blocks.map((_, index) => <span key={index} style={{height: `${compact ? 28 + index * 9 : 52 + ((index * 23) % 90)}%`}} />)}</div>
    <div className="dh-scene-base" />
    <div className="dh-scene-code">{feed.icon}</div>
  </div>
}

function MiniVisual({feed, active}){
  return <div className={`dh-mini-visual ${feed.thumbnail ? "has-thumb" : ""} ${active ? "active" : ""}`} style={{"--accent": feed.accent, borderColor: active ? feed.accent : undefined}}>
    {feed.thumbnail && <img className="dh-mini-thumb" src={feed.thumbnail} alt="" loading="lazy" />}
    <SceneObject feed={feed} compact />
    <div className="dh-mini-scan" />
  </div>
}

function TourVisual({item, active, accent, image}){
  return <div className="dh-tour-visual" style={{"--accent": accent, borderColor: active ? accent : undefined}}>
    <img src={image} alt="" loading="lazy" />
    <span /><span /><b>{item.icon}</b>
  </div>
}

function visualKeyFor(feed, stage){
  return `${feed?.id || feed?.title || "feed"}:${feed?.embedUrl || feed?.viewerUrl || feed?.modelUrl || ""}:${stage?.id || stage?.label || "stage"}`
}

function splitModelUrl(src){
  try {
    const url = new URL(src, window.location.href)
    const filename = `${url.pathname.split("/").pop() || ""}${url.search || ""}`
    return {
      rootUrl: url.href.slice(0, Math.max(0, url.href.length - filename.length)),
      sceneFilename: filename || url.href
    }
  } catch {
    const index = String(src || "").lastIndexOf("/")
    return index >= 0
      ? {rootUrl: src.slice(0, index + 1), sceneFilename: src.slice(index + 1)}
      : {rootUrl: "", sceneFilename: src}
  }
}

function hasWebGlSupport(){
  if(typeof document === "undefined") return false
  const canvas = document.createElement("canvas")
  try {
    return Boolean(
      canvas.getContext("webgl2", {failIfMajorPerformanceCaveat: false}) ||
      canvas.getContext("webgl", {failIfMajorPerformanceCaveat: false}) ||
      canvas.getContext("experimental-webgl", {failIfMajorPerformanceCaveat: false})
    )
  } catch {
    return false
  }
}

function isWebGlError(error){
  const message = String(error?.message || error || "").toLowerCase()
  return message.includes("webgl") || message.includes("context") || message.includes("gpu")
}

function createBabylonEngine(Engine, canvas){
  const lowPowerOptions = {
    adaptToDeviceRatio: false,
    antialias: false,
    audioEngine: false,
    doNotHandleContextLost: false,
    failIfMajorPerformanceCaveat: false,
    limitDeviceRatio: 1.25,
    powerPreference: "default",
    preserveDrawingBuffer: false,
    stencil: false
  }
  try {
    return new Engine(canvas, false, lowPowerOptions)
  } catch (firstError) {
    try {
      return new Engine(canvas, false, {...lowPowerOptions, disableWebGL2Support: true})
    } catch {
      throw firstError
    }
  }
}

function BabylonGlbStage({src, title, guided, stage, visualKey, onReady, onError}){
  const canvasRef = useRef(null)

  useEffect(() => {
    if(!src || !canvasRef.current) return undefined
    let disposed = false
    let engine
    let scene
    let resizeHandler
    let spinObserver
    let visibilityHandler
    let renderFrame

    async function loadBabylon(){
      try {
        const [
          {Engine},
          {Scene},
          {ArcRotateCamera},
          {Vector3},
          {Color4},
          {HemisphericLight},
          {DirectionalLight},
          {SceneLoader}
        ] = await Promise.all([
          import("@babylonjs/core/Engines/engine.js"),
          import("@babylonjs/core/scene.js"),
          import("@babylonjs/core/Cameras/arcRotateCamera.js"),
          import("@babylonjs/core/Maths/math.vector.js"),
          import("@babylonjs/core/Maths/math.color.js"),
          import("@babylonjs/core/Lights/hemisphericLight.js"),
          import("@babylonjs/core/Lights/directionalLight.js"),
          import("@babylonjs/core/Loading/sceneLoader.js")
        ])
        await import("@babylonjs/loaders/glTF/glTFFileLoader.js")
        await import("@babylonjs/loaders/glTF/2.0/glTFLoader.js")
        if(disposed || !canvasRef.current) return
        if(!hasWebGlSupport()){
          const error = new Error("WebGL is disabled or unavailable in this browser/device")
          error.digitalhutCode = "webgl-unavailable"
          throw error
        }
        engine = createBabylonEngine(Engine, canvasRef.current)
        scene = new Scene(engine)
        scene.clearColor = new Color4(0, 0, 0, 0)
        const camera = new ArcRotateCamera("dh-camera", Math.PI / 2, Math.PI / 2.35, 4, Vector3.Zero(), scene)
        camera.attachControl(canvasRef.current, true)
        camera.wheelDeltaPercentage = 0.012
        camera.pinchDeltaPercentage = 0.01
        camera.angularSensibilityX = 650
        camera.angularSensibilityY = 650
        new HemisphericLight("dh-hemi", new Vector3(0, 1, 0), scene).intensity = 0.95
        const key = new DirectionalLight("dh-key", new Vector3(-0.4, -1, -0.35), scene)
        key.intensity = 0.7

        const {rootUrl, sceneFilename} = splitModelUrl(src)
        const result = await SceneLoader.ImportMeshAsync("", rootUrl, sceneFilename, scene)
        if(disposed) return
        const renderable = scene.meshes.filter((mesh) => mesh.isEnabled() && typeof mesh.getTotalVertices === "function" && mesh.getTotalVertices() > 0)
        if(!renderable.length) throw new Error("GLB loaded without visible meshes")
        const bounds = scene.getWorldExtends((mesh) => renderable.includes(mesh))
        const center = bounds.min.add(bounds.max).scale(0.5)
        const size = bounds.max.subtract(bounds.min)
        const maxDim = Math.max(size.x, size.y, size.z, 0.1)
        camera.setTarget(center)
        camera.radius = maxDim * 2.05
        camera.lowerRadiusLimit = maxDim * 0.38
        camera.upperRadiusLimit = maxDim * 6
        camera.minZ = Math.max(maxDim / 120, 0.01)
        camera.maxZ = maxDim * 120
        if(stage?.kind === "angle") camera.beta = Math.PI / 2.55
        if(stage?.kind === "similar") camera.alpha += 0.55
        if(guided) {
          spinObserver = scene.onBeforeRenderObservable.add(() => {
            camera.alpha += (engine.getDeltaTime() / 1000) * (stage?.kind === "angle" ? 0.28 : 0.12)
          })
        }
        renderFrame = () => scene?.render()
        if(!document.hidden) engine.runRenderLoop(renderFrame)
        visibilityHandler = () => {
          if(!engine || !renderFrame) return
          if(document.hidden) engine.stopRenderLoop(renderFrame)
          else engine.runRenderLoop(renderFrame)
        }
        document.addEventListener("visibilitychange", visibilityHandler)
        resizeHandler = () => engine?.resize()
        window.addEventListener("resize", resizeHandler)
        window.setTimeout(() => {
          if(!disposed){
            engine?.resize()
            onReady?.(visualKey)
          }
        }, 120)
      } catch (error) {
        if(!disposed) onError?.(error)
      }
    }

    loadBabylon()

    return () => {
      disposed = true
      if(resizeHandler) window.removeEventListener("resize", resizeHandler)
      if(visibilityHandler) document.removeEventListener("visibilitychange", visibilityHandler)
      if(engine && renderFrame) engine.stopRenderLoop(renderFrame)
      if(scene && spinObserver) scene.onBeforeRenderObservable.remove(spinObserver)
      scene?.dispose()
      engine?.dispose()
    }
  }, [src, guided, stage?.kind, visualKey])

  return <canvas ref={canvasRef} className="dh-model dh-babylon-canvas" aria-label={`3D renderer for ${title}`} />
}

function RendererVisual({feed, stage, guided, loading, layer, renderLive, modelOpen, onOpenModel, onNext, onPlayMore, onVisualPending, onVisualReady, onDirectorUpdate, guideText, followUps}){
  const resolvedModelUrl = bestRenderableModelUrl(feed)
  const [renderModelUrl, setRenderModelUrl] = useState(() => resolvedModelUrl)
  const hasEmbed = Boolean(feed.embedUrl)
  const hasModel = Boolean(renderModelUrl)
  const isStats = stage.kind === "stats"
  const [modelReady, setModelReady] = useState(false)
  const [modelLoaded, setModelLoaded] = useState(false)
  const [modelError, setModelError] = useState("")
  const [imageReady, setImageReady] = useState(false)
  const [guideDismissed, setGuideDismissed] = useState(false)
  const decorationActive = false
  const stars = decorationActive ? Array.from({length: 10}) : []
  const skyline = decorationActive ? Array.from({length: 8}) : []
  const canShowContainment = renderLive && !isStats
  const rendererOpen = canShowContainment && modelOpen
  const liveOpen = rendererOpen && (hasEmbed || hasModel)
  const rendererUnavailable = rendererOpen && !hasEmbed && !hasModel
  const visualKey = visualKeyFor(feed, stage)
  const isPersonalLibraryModel = renderModelUrl?.includes("/firecuda-library/") || renderModelUrl?.includes("supabase.co") || renderModelUrl?.includes("vercel-storage.com")
  const modelErrorText = String(modelError || "")
  const webGlBlocked = modelErrorText.toLowerCase().includes("webgl")
  const canOpenModelLink = Boolean(renderModelUrl && !isLikelyBrokenStorageUrl(renderModelUrl))

  useEffect(() => {
    setRenderModelUrl(resolvedModelUrl)
  }, [resolvedModelUrl, visualKey])

  useEffect(() => {
    setModelReady(false)
    setModelLoaded(false)
    setModelError("")
    if(!rendererOpen || isStats) return
    onVisualPending?.(visualKey)
    onDirectorUpdate?.({phase: hasEmbed ? "Loading API preview" : "Loading Babylon GLB", detail: feed.title, status: hasEmbed ? "Opening original provider Play Preview" : "Waiting for renderer asset"})
    if(rendererUnavailable){
      const detail = {title: feed.title, reason: "No verified API, Vercel, or FireCuda environment GLB registered for this feed."}
      onDirectorUpdate?.({phase: "Renderer asset missing", detail: feed.title, status: detail.reason})
      return undefined
    }
    if(!liveOpen || hasEmbed || !hasModel) return undefined
    const waiting = window.setTimeout(() => {
      onDirectorUpdate?.({phase: "Still loading Babylon GLB", detail: feed.title, status: isPersonalLibraryModel ? "Large uploaded model still importing" : "Renderer still importing the verified GLB"})
    }, isPersonalLibraryModel ? 18000 : 9000)
    return () => {
      window.clearTimeout(waiting)
    }
  }, [rendererOpen, liveOpen, rendererUnavailable, hasModel, hasEmbed, isStats, feed.title, visualKey, isPersonalLibraryModel])

  function markBabylonReady(key){
    setModelReady(true)
    setModelLoaded(true)
    setModelError("")
    onDirectorUpdate?.({phase: "Ready to present", detail: feed.title, status: "Babylon GLB loaded and camera fitted"})
    onVisualReady?.(key)
  }

  function markBabylonError(error){
    const reason = error?.message || "Babylon could not import this GLB"
    const isWebGlFailure = error?.digitalhutCode === "webgl-unavailable" || isWebGlError(error)
    if(isWebGlFailure){
      setModelReady(false)
      setModelLoaded(true)
      setModelError("WebGL is unavailable in this browser/device. Enable browser hardware acceleration or use a browser/device with WebGL to render GLB models.")
      onDirectorUpdate?.({phase: "WebGL unavailable", detail: feed.title, status: "The GLB URL can be valid, but this browser cannot start the renderer."})
      onVisualReady?.(visualKey)
      return
    }
    const localFirecudaFallback = firecudaLocalFallbackUrl(renderModelUrl)
    if(localFirecudaFallback && renderModelUrl !== localFirecudaFallback){
      setModelReady(false)
      setModelLoaded(false)
      setModelError("")
      setRenderModelUrl(localFirecudaFallback)
      onDirectorUpdate?.({phase: "Loading local FireCuda GLB", detail: feed.title, status: "External GLB URL failed; switching to bundled deployed copy"})
      return
    }
    setModelReady(false)
    setModelLoaded(true)
    setModelError(reason)
    onDirectorUpdate?.({phase: "Babylon GLB failed", detail: feed.title, status: isPersonalLibraryModel ? "Verify Supabase public URL, CORS, filename, and GLB content type" : reason})
  }

  useEffect(() => {
    setImageReady(false)
  }, [feed.thumbnail])

  useEffect(() => {
    setGuideDismissed(false)
  }, [visualKey])

  return <div className={`dh-renderer ${guided ? "guided" : ""} ${canShowContainment ? "has-api" : ""} ${rendererOpen ? "model-mode" : ""} ${liveOpen ? "live-open" : ""} ${rendererUnavailable ? "renderer-unavailable" : ""} stage-${stage.kind}`} style={{"--accent": feed.accent}}>
    {feed.thumbnail && <img className={`dh-renderer-stock ${imageReady ? "is-ready" : ""}`} src={feed.thumbnail} alt="" loading="lazy" decoding="async" onLoad={() => setImageReady(true)} />}
    {decorationActive && <div className="dh-motion-sky" />}
    {decorationActive && <div className="dh-stars">{stars.map((_, index) => <span key={index} style={{left: `${4 + (index * 43) % 91}%`, top: `${7 + (index * 31) % 78}%`}} />)}</div>}
    {decorationActive && <SceneObject feed={feed} />}
    {canShowContainment && !liveOpen && !rendererUnavailable && <button className={`dh-api-system-preview ${feed.thumbnail ? "api-preview-ready" : ""} ${modelOpen ? "is-resolving" : ""}`} style={feed.thumbnail ? {"--api-preview-url": `url("${feed.thumbnail}")`} : undefined} onClick={onOpenModel}>
      <span>{modelOpen || loading ? "Preparing renderer" : "Renderer ready"}</span><b>{feed.title}</b><em className="dh-open-containment">{modelOpen || loading ? "Rendering" : "Play Preview"}</em>
    </button>}
    {liveOpen && hasEmbed && <iframe className="dh-api-frame" title={feed.title} src={pausedEmbedUrl(feed.embedUrl)} allow="fullscreen; xr-spatial-tracking" loading="lazy" allowFullScreen onLoad={() => onVisualReady?.(visualKey)} />}
    {liveOpen && !hasEmbed && hasModel && <div className="dh-model-shell">
      {!modelLoaded && <div className="dh-model-loader"><b>Loading Babylon GLB Renderer</b><span>{feed.title}</span></div>}
      {modelError && <div className={`dh-model-loader error ${webGlBlocked ? "webgl-error" : ""}`}><b>{webGlBlocked ? "WebGL renderer unavailable" : "Renderer needs a valid GLB URL"}</b><span>{modelError}</span>{webGlBlocked && canOpenModelLink && <a href={renderModelUrl} target="_blank" rel="noreferrer">Open GLB file</a>}</div>}
      <BabylonGlbStage key={renderModelUrl} src={renderModelUrl} title={feed.title} guided={guided} stage={stage} visualKey={visualKey} onReady={markBabylonReady} onError={markBabylonError} />
    </div>}
    {rendererUnavailable && <section className="dh-model-shell dh-renderer-recovery" aria-label="Renderer recovery required">
      <div className="dh-model-loader error">
        <b>Guardian reload required</b>
        <span>No verified environment GLB registered. Synthetic block-model fallback is disabled.</span>
        <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("digitalhut:guardian-render-failure", {detail: {title: feed.title, reason: "No verified API, Vercel, or FireCuda environment GLB registered for this feed."}}))}>Open Guardian</button>
      </div>
    </section>}
    {canShowContainment && modelOpen && !guideDismissed && !liveOpen && !rendererUnavailable && <div className="dh-contained-guide">
      <button className="dh-guide-close" type="button" aria-label="Close presentation card" onClick={() => setGuideDismissed(true)}>X</button>
      <span>{guideText}</span>
      <button type="button" onClick={() => {setGuideDismissed(true); onOpenModel?.()}}>Open Renderer</button>
      <button type="button" onClick={onNext}>Next</button>
      <button type="button" onClick={onPlayMore}>Play More</button>
    </div>}
    {canShowContainment && modelOpen && <div className="dh-followup-notes">
      <div><b>Suggested Follow-Up</b></div>
      {followUps.map((item) => <span key={item}>{item}</span>)}
    </div>}
    {isStats && <div className="dh-stat-model"><b>{feed.title}</b><span>{feed.market?.symbol || feed.providerMix?.join(" + ") || "data"}</span><p>{feed.note}</p></div>}
    {decorationActive && <div className="dh-orbit" />}
    {decorationActive && <div className="dh-orbit-two" />}
    {decorationActive && <div className="dh-sweep" />}
    {decorationActive && <div className="dh-skyline">{skyline.map((_, index) => <span key={index} style={{height: `${26 + ((index * 19) % 64)}%`}} />)}</div>}
    {(layer === "Grid" || layer === "Coordinates") && <div className="dh-visual-grid" />}
    {decorationActive && <div className="dh-core-glow" />}
    <div className="dh-visual-label">{feed.category}</div>
    <div className="dh-model-status ready">{loading ? "API resolving" : stage.label}</div>
  </div>
}

export default function FullscreenObservatoryV2(){
  const [category, setCategory] = useState("Mainstream Streaming")
  const [feeds, setFeeds] = useState(() => seedFeeds("Mainstream Streaming"))
  const [statsFeeds, setStatsFeeds] = useState([])
  const [active, setActive] = useState(0)
  const [query, setQuery] = useState("2026 viral 3d streaming feed")
  const [mode, setMode] = useState("regular")
  const [tour, setTour] = useState(toursFor("Mainstream Streaming")[0].id)
  const [stageIndex, setStageIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [tier, setTier] = useState(() => readStorage("digitalhut:tier", "guest"))
  const [username, setUsername] = useState(() => readStorage("digitalhut:username", ""))
  const [entryOpen, setEntryOpen] = useState(false)
  const [entryLoading, setEntryLoading] = useState(false)
  const [awake, setAwake] = useState(true)
  const [playing, setPlaying] = useState(true)
  const [layer, setLayer] = useState("Base")
  const [layerOpen, setLayerOpen] = useState(false)
  const [modelOpen, setModelOpen] = useState(false)
  const [guideDepth, setGuideDepth] = useState(0)
  const [aiOpen, setAiOpen] = useState(false)
  const [aiListening, setAiListening] = useState(false)
  const [aiCommand, setAiCommand] = useState("")
  const [notesOpen, setNotesOpen] = useState(false)
  const [smartNote, setSmartNote] = useState("")
  const [downloadUrl, setDownloadUrl] = useState("")
  const [noteFormat, setNoteFormat] = useState({font: "Arial", size: "14", spacing: "1.45", color: "#0f172a"})
  const [autoPresent, setAutoPresent] = useState(false)
  const [demoMode, setDemoMode] = useState("")
  const [aiUsage, setAiUsage] = useState(() => readAiUsage(readStorage("digitalhut:tier", "guest")))
  const [liveStageOpen, setLiveStageOpen] = useState(false)
  const [hostLine, setHostLine] = useState("Hey live 3D GLB presentation, what's up. Featuring DigitalHut. Give me some likes and find a new layer in my GLB.")
  const [contestPrompt, setContestPrompt] = useState("Contest: find a hidden layer in this GLB and post what you noticed.")
  const [livePosts, setLivePosts] = useState(() => readLiveFeed())
  const [liveSyncStatus, setLiveSyncStatus] = useState("Local live stage ready")
  const [presentationFeatureOpen, setPresentationFeatureOpen] = useState(false)
  const [presentationSearch, setPresentationSearch] = useState("editable glb presentation stage")
  const [presentationFileNote, setPresentationFileNote] = useState("")
  const [presentationEdits, setPresentationEdits] = useState([])
  const [presentationSpeed, setPresentationSpeed] = useState(1)
  const [visualReadyKey, setVisualReadyKey] = useState("")
  const [directorStatus, setDirectorStatus] = useState({phase: "Finding model", detail: "Preparing DigitalHut renderer", status: "Idle"})
  const [directorChat, setDirectorChat] = useState(() => readDirectorChat())
  const [directorInput, setDirectorInput] = useState("")
  const [faqOpen, setFaqOpen] = useState(false)
  const [mainLobbyOpen, setMainLobbyOpen] = useState(true)
  const [lobbyActiveIndex, setLobbyActiveIndex] = useState(0)
  const [apiCategoryFeeds, setApiCategoryFeeds] = useState([])
  const [showcaseAuto, setShowcaseAuto] = useState(false)
  const [interactionPulse, setInteractionPulse] = useState(false)
  const [mechanicMode, setMechanicMode] = useState(true)
  const [mobilityMode, setMobilityMode] = useState("Road")
  const [assistanceOpen, setAssistanceOpen] = useState(false)
  const [runtimeState, setRuntimeState] = useState(() => ({
    online: typeof navigator === "undefined" ? true : navigator.onLine,
    visible: typeof document === "undefined" ? true : !document.hidden,
    connection: typeof navigator === "undefined" ? "unknown" : navigator.connection?.effectiveType || "standard"
  }))
  const hideTimer = useRef(null)
  const pulseTimer = useRef(null)
  const requestRef = useRef(0)
  const recognitionRef = useRef(null)
  const autoStartedRef = useRef(null)
  const initialFeedLoadedRef = useRef(false)
  const autoStepRef = useRef(0)
  const pendingSpeechRef = useRef(null)
  const pendingSpeechTimer = useRef(null)
  const preMechanicCategoryRef = useRef("Mainstream Streaming")
  const mechanicMotionFrameRef = useRef(null)

  const activeTours = toursFor(category)
  const activeTour = activeTours.find((item) => item.id === tour) || activeTours[0]
  const stage = stages[stageIndex]
  const feed = feeds[active] || feeds[0] || seedFeeds(category)[0]
  const similarFeed = feeds[(active + 1) % Math.max(feeds.length, 1)] || feed
  const statsFeed = statsFeeds[0] || createStatsFeed(feed, category, activeTour)
  const sceneFeed = stage.kind === "similar" ? similarFeed : stage.kind === "stats" ? statsFeed : feed
  const paid = ["premium", "pro"].includes(tier)
  const guided = mode === "premium" && playing
  const aiLimit = AI_TIER_LIMITS[tier] ?? AI_TIER_LIMITS.guest
  const aiRemainingMs = aiLimit === Infinity ? Infinity : Math.max(0, aiLimit - aiUsage.usedMs)
  const currentGuideLine = guideDepth > 0 ? extendedGuideLine({category, stage, feed: sceneFeed, tour: activeTour, depth: guideDepth - 1}) : guideLine({category, stage, feed: sceneFeed, tour: activeTour})
  const currentFollowUps = followUpNotes({category, stage, feed: sceneFeed, tour: activeTour})
  const aiDock = presentationFeatureOpen ? "notes" : notesOpen ? "notes" : aiOpen ? "command" : modelOpen ? `stage-${stage.kind}` : guided ? "guided" : "idle"
  const liveModelLink = sceneFeed.modelUrl || sceneFeed.viewerUrl || sceneFeed.embedUrl || window.location.href
  const sceneVisualKey = visualKeyFor(sceneFeed, stage)
  const activeApiFeeds = apiCategoryFeeds.filter((item) => item.category === category)
  const quickDisplayFeeds = sortRendererFeeds([...activeApiFeeds, ...feeds]).slice(0, 5)
  const lobbyFeedPool = sortRendererFeeds([...apiCategoryFeeds, ...feeds])
  const lobbyFeeds = lobbyCategories.map((item) => {
    const existing = lobbyFeedPool.find((feedItem) => feedItem.category === item && bestRenderableModelUrl(feedItem))
    return existing || apiSpotlightSeeds(item)[0] || seedFeeds(item).find((feedItem) => bestRenderableModelUrl(feedItem)) || seedFeeds(item)[0]
  }).filter(Boolean)
  const lobbyDisplayFeeds = sortRendererFeeds([...lobbyFeedPool, ...lobbyFeeds])
    .filter((item, index, list) => item && list.findIndex((candidate) => candidate.id === item.id || candidate.title === item.title) === index)
    .slice(0, 14)
  const lobbyActiveFeed = lobbyDisplayFeeds[lobbyActiveIndex % Math.max(lobbyDisplayFeeds.length, 1)] || lobbyFeeds[0] || sceneFeed
  const blinkNodesWithApi = blinkQuickNodes.map((item) => {
    const nodeCategory = item.category
    const apiFeed = apiCategoryFeeds.find((feedItem) => feedItem.category === nodeCategory)
    const nodeFeeds = apiCategoryFeeds.filter((feedItem) => feedItem.category === nodeCategory)
    const categorySessions = feeds.filter((feedItem) => feedItem.category === nodeCategory).length
    const learnedSignals = Math.min(100, (nodeFeeds.length * 14) + (categorySessions * 6) + (category === nodeCategory ? 12 : 0))
    const paidUnlock = tier === "premium" || tier === "pro"
    const earnedUnlock = learnedSignals >= 100
    const evidence = item.id === "real-estate-genius"
      ? "Learns from 5+ days of real estate searches, Europe sector shuffles, million-dollar agency finds, Georgia/Michigan opportunities, notes, and quality feed reactions."
      : item.id === "stellar"
        ? "Learns from 5+ days of planetary searches, orbital compute feeds, saved space GLBs, notes, and autoplay reactions."
        : "Learns from 5+ days of game-world searches, environment GLBs, creator-safe sources, notes, and viewer reactions."
    const reward = item.id === "real-estate-genius"
      ? "Unlocks smart global real estate autoplay with higher-quality international opportunities."
      : item.id === "stellar"
        ? "Unlocks advanced planetary autoplay with stronger cosmic, orbital, and observatory feeds."
        : "Unlocks advanced gaming autoplay with stronger 360 game-world and creator-safe feeds."
    const recommendation = item.id === "real-estate-genius"
      ? `Genius Real Estate progress: ${Math.max(30, Math.min(85, learnedSignals))}%. Recent quality signals can include New Jersey millionaire feeds, Georgia/Michigan agencies, and Europe sector searches. Recommended next scan: New Mexico and fresh Sketchfab property uploads.`
      : item.id === "stellar"
        ? `Stellar progress: ${learnedSignals}%. Recommended next scan: orbital compute, StarCloud-style infrastructure, satellite laser links, and planetary power research.`
        : `Pro Gamer progress: ${learnedSignals}%. Recommended next scan: immersive 360 game worlds, VR hub environments, and creator-safe game feeds.`
    return {...item, apiFeed, learnedSignals, paidUnlock, earnedUnlock, locked: !paidUnlock && !earnedUnlock, evidence, reward, recommendation}
  })
  const stageDelay = Math.round((stage.kind === "stats" ? 26000 : 18000) / presentationSpeed)
  const autoDelay = Math.round(22000 / presentationSpeed)
  const assetLibraryStatus = firecudaLibraryStatus()
  const runtimePaused = !runtimeState.online || !runtimeState.visible
  const mechanicRuntimeStatus = !runtimeState.online ? "Offline" : !runtimeState.visible ? "Paused" : loading ? "Loading" : autoPresent ? "Auto Play" : "Ready"

  useEffect(() => {
    if(!mainLobbyOpen || lobbyDisplayFeeds.length < 2) return undefined
    const timer = window.setInterval(() => {
      setLobbyActiveIndex((current) => (current + 1) % lobbyDisplayFeeds.length)
    }, 9000)
    return () => window.clearInterval(timer)
  }, [mainLobbyOpen, lobbyDisplayFeeds.length])

  useEffect(() => {
    if(!mainLobbyOpen && !category) return undefined
    let cancelled = false
    async function hydrateCategoryApis(){
      const targetCategories = Array.from(new Set([category, ...lobbyCategories]))
      const batches = await Promise.all(targetCategories.map(async (nextCategory) => {
        const seed = seedFeeds(nextCategory)[0]
        const term = seed?.query || nextCategory
        const apiResults = (await resolveApiFeeds(nextCategory, term))
          .map((item, index) => attachRendererModel(item, nextCategory, term, index))
        const spotlightResults = apiSpotlightSeeds(nextCategory, term, true)
        return sortRendererFeeds([...apiResults, ...spotlightResults]).slice(0, 8)
      }))
      if(cancelled) return
      const nextFeeds = sortRendererFeeds(batches.flat()).slice(0, 36)
      setApiCategoryFeeds(nextFeeds)
      try {
        window.localStorage.setItem("digitalhut:nodeApiFeeds", JSON.stringify(nextFeeds.slice(0, 12).map((item) => ({
          id: item.id,
          title: item.title,
          category: item.category,
          apiSource: item.apiSource,
          apiStatus: item.apiStatus,
          thumbnail: item.thumbnail
        }))))
      } catch {}
    }
    hydrateCategoryApis()
    return () => {
      cancelled = true
    }
  }, [mainLobbyOpen, category])

  function recordDirectorMessage(role, text, status = directorStatus.phase){
    const message = {
      id: `director-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      role,
      text,
      status,
      title: sceneFeed.title,
      category,
      createdAt: new Date().toISOString()
    }
    setDirectorChat((current) => {
      const next = [message, ...current].slice(0, 40)
      writeDirectorChat(next)
      return next
    })
    return message
  }

  function clearDirectorChat(){
    setDirectorChat([])
    writeDirectorChat([])
  }

  function submitDirectorCommand(value = directorInput){
    const text = String(value || "").trim()
    if(!text) return
    setDirectorInput("")
    runAiCommand(text)
  }

  useEffect(() => {
    window.digitalHutBrainMap = digitalHutBrainMap
  }, [])

  useEffect(() => {
    const connection = navigator.connection
    const updateRuntime = () => {
      setRuntimeState({
        online: navigator.onLine,
        visible: !document.hidden,
        connection: connection?.effectiveType || "standard",
        saveData: Boolean(connection?.saveData)
      })
    }
    updateRuntime()
    window.addEventListener("online", updateRuntime)
    window.addEventListener("offline", updateRuntime)
    document.addEventListener("visibilitychange", updateRuntime)
    connection?.addEventListener?.("change", updateRuntime)
    return () => {
      window.removeEventListener("online", updateRuntime)
      window.removeEventListener("offline", updateRuntime)
      document.removeEventListener("visibilitychange", updateRuntime)
      connection?.removeEventListener?.("change", updateRuntime)
    }
  }, [])

  useEffect(() => {
    const record = observatoryRecord({category, stage, sceneFeed, mode, tier, loading})
    window.digitalHutObservatoryRecord = record
    document.title = `DigitalHut Observatory - ${record.category} - ${record.title}`
    let meta = document.querySelector('meta[name="description"]')
    if(!meta){
      meta = document.createElement("meta")
      meta.setAttribute("name", "description")
      document.head.appendChild(meta)
    }
    meta.setAttribute("content", `Real observatory activity: ${record.category} ${record.stage}. ${record.title}. Status: ${record.status}.`)
  }, [category, stage.label, sceneFeed.id, sceneFeed.title, sceneFeed.apiStatus, sceneFeed.apiSource, mode, tier, loading])

  useEffect(() => {
    setAiUsage(readAiUsage(tier))
  }, [tier])

  useEffect(() => {
    const seeds = seedFeeds(category)
    const urls = [
      ...seeds.map((item) => item.thumbnail),
      ...toursFor(category).map((_, index) => stockUrl(category, index))
    ]
    preloadImages(urls)
    preloadModels(seeds.map((item) => item.modelUrl), 1)
  }, [category, mechanicMode])

  useEffect(() => {
    if(!guided || entryOpen || !modelOpen) return
    const timer = window.setInterval(() => {
      if(sceneVisualKey !== visualReadyKey){
        setDirectorStatus({phase: "Waiting for GLB", detail: sceneFeed.title, status: "Holding camera until model is ready"})
        return
      }
      setStageIndex((current) => (current + 1) % stages.length)
    }, stageDelay)
    return () => window.clearInterval(timer)
  }, [guided, entryOpen, stageDelay, modelOpen, sceneVisualKey, visualReadyKey, sceneFeed.title])

  useEffect(() => {
    if(!guided || stage.kind !== "stats") return
    loadStatsModel()
  }, [guided, stage.kind, category, active, tour])

  useEffect(() => {
    if(entryOpen || initialFeedLoadedRef.current) return
    initialFeedLoadedRef.current = true
    const seed = seedFeeds(category)[0]
    loadFeeds(category, seed.query || query, {silent: true, keepOpen: true})
  }, [entryOpen])

  useEffect(() => {
    if(!autoPresent || runtimePaused) return
    const limit = showcaseAuto ? Infinity : AI_TIER_LIMITS[tier] ?? AI_TIER_LIMITS.guest
    if(limit !== Infinity && aiUsage.usedMs >= limit){
      setAutoPresent(false)
      setPlaying(false)
      speak("AI presentation time is used for this 12 hour window. Upgrade tier or wait for the next window.")
      return
    }
    autoStartedRef.current = Date.now()
    const timer = window.setInterval(() => {
      if(limit !== Infinity){
        const usage = readAiUsage(tier)
        const delta = Date.now() - (autoStartedRef.current || Date.now())
        autoStartedRef.current = Date.now()
        const nextUsage = {...usage, usedMs: usage.usedMs + delta}
        writeAiUsage(tier, nextUsage)
        setAiUsage(nextUsage)
        if(nextUsage.usedMs >= limit){
          setAutoPresent(false)
          setPlaying(false)
          speak("AI presentation limit reached for this 12 hour window.")
          return
        }
      }
      setModelOpen(true)
      setPlaying(true)
      if(sceneVisualKey !== visualReadyKey){
        setDirectorStatus({phase: "Waiting for GLB", detail: sceneFeed.title, status: "Auto demo paused until current model is ready"})
        return
      }
      autoStepRef.current += 1
      const nextStageIndex = (stageIndex + 1) % stages.length
      const nextStage = stages[nextStageIndex]
      const completedModelCycle = nextStageIndex === 0
      if(demoMode === "all" && completedModelCycle && autoStepRef.current % (stages.length * 2) === 0){
        playSessionSound(category, "bridge")
        recordDirectorMessage("ai", "Completed the current model cycle. Bridging to the next category with the renderer open.", "Auto bridge")
        bridgeNextCategory("I found a new trend bridge")
        return
      }
      const nextActive = completedModelCycle ? (active + 1) % Math.max(feeds.length, 1) : active
      const nextFeed = feeds[nextActive] || sceneFeed
      playSessionSound(category, nextStage.kind === "angle" ? "rotate" : "open")
      setStageIndex(nextStageIndex)
      if(completedModelCycle && feeds.length > 1) setActive(nextActive)
      recordDirectorMessage("ai", completedModelCycle ? `Finished this model sequence. Opening ${nextFeed.title}.` : `Continuing ${sceneFeed.title}: ${nextStage.label}.`, "Auto progression")
      speakAfterVisual(`${guideLine({category, stage: nextStage, feed: nextFeed, tour: activeTour, expanded: true})} ${feedbackPrompt({category, feed: nextFeed})}`, visualKeyFor(nextFeed, nextStage))
    }, autoDelay)
    return () => {
      window.clearInterval(timer)
      if(limit !== Infinity && autoStartedRef.current){
        const usage = readAiUsage(tier)
        const nextUsage = {...usage, usedMs: usage.usedMs + (Date.now() - autoStartedRef.current)}
        writeAiUsage(tier, nextUsage)
        setAiUsage(nextUsage)
      }
      autoStartedRef.current = null
    }
  }, [autoPresent, runtimePaused, demoMode, tier, category, active, stageIndex, sceneFeed.id, sceneFeed.title, sceneVisualKey, visualReadyKey, feeds, autoDelay, showcaseAuto])

  useEffect(() => {
    const pending = pendingSpeechRef.current
    if(!pending || pending.key !== visualReadyKey) return
    window.clearTimeout(pendingSpeechTimer.current)
    pendingSpeechTimer.current = window.setTimeout(() => {
      speak(pending.text)
      pendingSpeechRef.current = null
    }, pending.delay)
  }, [visualReadyKey])

  function markVisualPending(key){
    setVisualReadyKey((current) => current === key ? "" : current)
    setDirectorStatus({phase: "Loading GLB", detail: sceneFeed.title, status: "Waiting for renderer asset"})
  }

  function markVisualReady(key){
    setVisualReadyKey(key)
    setDirectorStatus({phase: "Ready to present", detail: sceneFeed.title, status: "Model loaded; AI can continue"})
  }

  function speakAfterVisual(text, key = sceneVisualKey, delay = Math.round(900 / presentationSpeed)){
    window.clearTimeout(pendingSpeechTimer.current)
    pendingSpeechRef.current = {key, text, delay}
    if(visualReadyKey === key){
      pendingSpeechTimer.current = window.setTimeout(() => {
        speak(text)
        pendingSpeechRef.current = null
      }, delay)
      return
    }
    pendingSpeechTimer.current = window.setTimeout(() => {
      if(pendingSpeechRef.current?.key === key){
        speak(text)
        pendingSpeechRef.current = null
      }
    }, Math.max(3200, Math.round(5200 / presentationSpeed)))
  }

  function wake(){
    setAwake(true)
    window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => setAwake(false), 2800)
  }

  function handleObservatoryPointer(event){
    wake()
    if(event.pointerType === "touch") return
    const node = event.currentTarget
    const width = Math.max(node.clientWidth, 1)
    const height = Math.max(node.clientHeight, 1)
    const x = Math.max(-1, Math.min(1, (event.clientX / width) * 2 - 1))
    const y = Math.max(-1, Math.min(1, (event.clientY / height) * 2 - 1))
    window.cancelAnimationFrame(mechanicMotionFrameRef.current)
    mechanicMotionFrameRef.current = window.requestAnimationFrame(() => {
      node.style.setProperty("--cockpit-render-x", `${(x * 12).toFixed(2)}px`)
      node.style.setProperty("--cockpit-render-y", `${(y * 8).toFixed(2)}px`)
      node.style.setProperty("--cockpit-rail-x", `${(x * 16).toFixed(2)}px`)
      node.style.setProperty("--cockpit-rail-y", `${(y * 3).toFixed(2)}px`)
      node.style.setProperty("--cockpit-control-x", `${(x * 3).toFixed(2)}px`)
      node.style.setProperty("--cockpit-control-y", `${(y * 14).toFixed(2)}px`)
      node.style.setProperty("--cockpit-status-y", `${(y * -5).toFixed(2)}px`)
    })
  }

  function centerCockpitMotion(event){
    const node = event.currentTarget
    window.cancelAnimationFrame(mechanicMotionFrameRef.current)
    mechanicMotionFrameRef.current = window.requestAnimationFrame(() => {
      for(const name of ["--cockpit-render-x", "--cockpit-render-y", "--cockpit-rail-x", "--cockpit-rail-y", "--cockpit-control-x", "--cockpit-control-y", "--cockpit-status-y"]){
        node.style.setProperty(name, "0px")
      }
    })
  }

  function triggerSystemPulse(event){
    const target = event.target
    if(!target?.closest || !target.closest("button, .dh-mini-visual, .dh-model-shell, .dh-main-lobby-grid article")) return
    window.clearTimeout(pulseTimer.current)
    setInteractionPulse(true)
    pulseTimer.current = window.setTimeout(() => setInteractionPulse(false), 720)
  }

  async function loadFeeds(nextCategory, term, options = {}){
    const id = requestRef.current + 1
    requestRef.current = id
    const seeds = seedFeeds(nextCategory).map((item, index) => attachRendererModel(item, nextCategory, term, index))
    setLoading(true)
    setActive(0)
    setModelOpen(Boolean(options.keepOpen))
    setGuideDepth(0)
    preloadImages(seeds.map((item) => item.thumbnail))
    preloadModels(seeds.map((item) => item.modelUrl), 1)
    if(requestRef.current !== id) return seeds
    setFeeds(seeds)
    const results = (await resolveApiFeeds(nextCategory, term)).map((item, index) => attachRendererModel(item, nextCategory, term, index))
    if(requestRef.current !== id) return seeds
    const seedTitles = new Set(results.map((item) => item.title))
    const seedModels = seeds.filter((seed) => !seedTitles.has(seed.title))
    const directResults = results.filter((item) => item.renderPriority >= 70)
    const fallbackResults = results.filter((item) => item.renderPriority < 70)
    const spotlightResults = apiSpotlightSeeds(nextCategory, term, true)
    const next = sortRendererFeeds([...directResults, ...spotlightResults, ...seedModels, ...fallbackResults]).slice(0, 14)
    preloadImages(next.map((item) => item.thumbnail))
    preloadModels(next.map((item) => item.modelUrl), 1)
    if(requestRef.current !== id) return next
    window.requestAnimationFrame(() => {
      setFeeds(next)
      setLoading(false)
    })
    if(!options.silent) {
      const line = `${results.length ? "Live provider models connected" : "API preview mode"}. ${next[0]?.title || nextCategory}.`
      if(options.keepOpen) speakAfterVisual(line, visualKeyFor(next[0] || seeds[0], stages[0]))
      else speak(line)
    }
    return next
  }

  function speakModelReadout(targetFeed = sceneFeed, targetCategory = category, targetStage = stage){
    const readout = modelDataReadout({feed: targetFeed, category: targetCategory, stage: targetStage})
    playSessionSound(targetCategory, "open")
    speakAfterVisual(`${readout.lines.join(" ")} ${feedbackPrompt({category: targetCategory, feed: targetFeed})}`, visualKeyFor(targetFeed, targetStage))
  }

  async function bridgeNextCategory(prefix = "I found a new trend"){
    const currentIndex = bridgeFlow.indexOf(category)
    const targetCategory = bridgeFlow[(currentIndex >= 0 ? currentIndex + 1 : 0) % bridgeFlow.length]
    const bridgeSeed = seedFeeds(targetCategory)[0]
    const term = bridgeSeed?.query || `${targetCategory} live 3d featured reel`
    const firstTour = toursFor(targetCategory)[0]
    setCategory(targetCategory)
    setTour(firstTour.id)
    setStageIndex(0)
    setStatsFeeds([])
    setGuideDepth(0)
    setModelOpen(true)
    setQuery(term)
    playSessionSound(targetCategory, "bridge")
    announceOpen3dModel({title: term})
    const next = await loadFeeds(targetCategory, term, {silent: true, keepOpen: true})
    const loaded = next[0] || seedFeeds(targetCategory)[0]
    setActive(0)
    setModelOpen(true)
    speakAfterVisual(`${prefix}: ${targetCategory}. ${streamReadout({category: targetCategory, query: term, feed: loaded, stage: stages[0]})}`, visualKeyFor(loaded, stages[0]))
  }

  async function loadStatsModel(){
    const results = await resolveApiFeeds(category, `${category} statistics data visualization 3d ${feed.query || feed.title}`)
    setStatsFeeds(results.length ? results.map((item) => ({...item, icon: "ST", apiStatus: "statistics"})) : [])
  }

  function enter(nextTier){
    setTier(nextTier)
    setEntryLoading(true)
    playLoaderTone()
    window.setTimeout(() => {
      window.localStorage.setItem("digitalhut:lastAccountEntry", String(Date.now()))
      window.localStorage.setItem("digitalhut:tier", nextTier)
      window.localStorage.setItem("digitalhut:username", username || "Guest")
      setEntryLoading(false)
      setEntryOpen(false)
      wake()
    }, 120)
  }

  function selectCategory(nextCategory){
    playSessionSound(nextCategory, "open")
    setDemoMode("")
    setAutoPresent(false)
    setPlaying(false)
    setCategory(nextCategory)
    setTour(toursFor(nextCategory)[0].id)
    setStageIndex(0)
    setStatsFeeds([])
    setModelOpen(true)
    setGuideDepth(0)
    const seed = seedFeeds(nextCategory)[0]
    setQuery(seed.query)
    loadFeeds(nextCategory, seed.query, {silent: true, keepOpen: true})
    speak(`DigitalHut set to ${nextCategory}. The aerospace renderer stays open while the next verified GLB prepares.`)
    wake()
  }

  function startDemoMode(kind){
    const limit = AI_TIER_LIMITS[tier] ?? AI_TIER_LIMITS.guest
    const usage = readAiUsage(tier)
    if(limit !== Infinity && usage.usedMs >= limit){
      setAiUsage(usage)
      speak("This tier has used its AI presentation time for the 12 hour window.")
      return
    }
    const isSameActive = autoPresent && demoMode === kind
    if(isSameActive){
      setAutoPresent(false)
      setShowcaseAuto(false)
      setDemoMode("")
      setPlaying(false)
      playSessionSound(category, "stop")
      speak("Auto demo stopped.")
      return
    }
    autoStepRef.current = 0
    setShowcaseAuto(false)
    setDemoMode(kind)
    setAutoPresent(true)
    setMode("premium")
    setPlaying(true)
    setModelOpen(true)
    playSessionSound(category, "open")
    speak(kind === "all" ? "All Category Auto Demo is on. I will move through every category like a full presentation." : `Current Category Auto Demo is on. I will stay inside ${category} and keep the topic focused.`)
  }

  async function openContainedModel(){
    announceOpen3dModel(sceneFeed)
    setModelOpen(true)
    wake()
    if(sceneFeed.embedUrl || sceneFeed.modelUrl || loading){
      speakModelReadout(sceneFeed, category, stage)
      return
    }
    const next = await loadFeeds(category, sceneFeed.query || query, {silent: true, keepOpen: true})
    const loaded = next[0] || sceneFeed
    setModelOpen(true)
    speakModelReadout(loaded, category, stage)
  }

  async function refreshLiveRenderer(){
    setLoading(true)
    setModelOpen(true)
    setStageIndex(0)
    setGuideDepth(0)
    playSessionSound(category, "bridge")
    speak("Refreshing the live renderer. I will rebuild the feed and use the newest real model or scene preview instead of a stale fallback.")
    const next = await loadFeeds(category, sceneFeed.query || query, {silent: true, keepOpen: true})
    const loaded = next[0] || seedFeeds(category)[0] || sceneFeed
    setActive(0)
    setModelOpen(true)
    speakAfterVisual(`Live renderer refreshed for ${loaded.title}. ${streamReadout({category, query: loaded.query || query, feed: loaded, stage: stages[0]})}`, visualKeyFor(loaded, stages[0]))
  }

  async function chooseTour(item){
    setTour(item.id)
    setMode("premium")
    setStageIndex(0)
    setPlaying(true)
    announceOpen3dModel(sceneFeed)
    setModelOpen(true)
    setGuideDepth(0)
    if(!sceneFeed.embedUrl && !sceneFeed.modelUrl && !loading) {
      loadFeeds(category, sceneFeed.query || query, {silent: true, keepOpen: true}).then(() => setModelOpen(true))
    }
    speakAfterVisual(`${guideLine({category, stage: stages[0], feed: sceneFeed, tour: item})} ${feedbackPrompt({category, feed: sceneFeed})}`, visualKeyFor(sceneFeed, stages[0]), 1200)
    wake()
  }

  function chooseFeed(item){
    const index = feeds.findIndex((candidate) => candidate.id === item.id)
    if(index >= 0) setActive(index)
    setQuery(item.query || item.title)
    setStageIndex(0)
    setModelOpen(true)
    setGuideDepth(0)
    speakAfterVisual(`Loaded ${item.title}. The renderer stays live for this asset.`, visualKeyFor(item, stages[0]), 600)
    wake()
  }

  function openLobbyFeed(item){
    const nextCategory = item.category || category
    const categoryFeeds = sortRendererFeeds([item, ...apiCategoryFeeds.filter((candidate) => candidate.category === nextCategory), ...seedFeeds(nextCategory)])
      .filter((candidate, index, list) => candidate && list.findIndex((entry) => entry.id === candidate.id || entry.title === candidate.title) === index)
      .slice(0, 14)
    const selectedIndex = categoryFeeds.findIndex((candidate) => candidate.id === item.id)
    const lobbyIndex = lobbyDisplayFeeds.findIndex((candidate) => candidate.id === item.id)
    if(lobbyIndex >= 0) setLobbyActiveIndex(lobbyIndex)
    setMainLobbyOpen(false)
    setCategory(nextCategory)
    setTour(toursFor(nextCategory)[0].id)
    setFeeds(categoryFeeds)
    setActive(selectedIndex >= 0 ? selectedIndex : 0)
    setQuery(item.query || item.title)
    setStageIndex(0)
    setGuideDepth(0)
    setModelOpen(true)
    speakAfterVisual(`Main Lobby loaded ${item.title}. DigitalHut will present the GLB and match a podcast voice when available.`, visualKeyFor(item, stages[0]), 700)
    wake()
  }

  function previewLobbyFeed(item){
    const lobbyIndex = lobbyDisplayFeeds.findIndex((candidate) => candidate.id === item.id)
    if(lobbyIndex >= 0) setLobbyActiveIndex(lobbyIndex)
    setQuery(item.query || item.title)
    setStageIndex(0)
    setGuideDepth(0)
    recordDirectorMessage("ai", `Main Lobby previewing ${item.title}. Use Enter Renderer when you want to open the full 3D display.`, "Main Lobby")
    speakAfterVisual(`Main Lobby preview. ${item.title}. Explore the category, nodes, autoplay showcase, or enter the renderer when ready.`, visualKeyFor(item, stages[0]), 500)
    wake()
  }

  async function runSearch(){
    const targetCategory = categoryFromCommand(query) || category
    const nextQuery = queryFromCommand(query, query)
    if(targetCategory !== category){
      setCategory(targetCategory)
      setTour(toursFor(targetCategory)[0].id)
    }
    setPlaying(true)
    setStageIndex(0)
    setStatsFeeds([])
    setModelOpen(true)
    setGuideDepth(0)
    setQuery(nextQuery)
    announceOpen3dModel({title: nextQuery, category: targetCategory})
    await loadFeeds(targetCategory, nextQuery, {keepOpen: true})
    setModelOpen(true)
    speak(`${mode === "premium" ? "Premium guide ready" : "Regular API feed ready"}. The DigitalHut renderer is live for this asset.`)
    wake()
  }

  function nextStage(){
    playSessionSound(category, "rotate")
    setStageIndex((current) => (current + 1) % stages.length)
    setGuideDepth(0)
    const next = stages[(stageIndex + 1) % stages.length]
    speakAfterVisual(`${guideLine({category, stage: next, feed: sceneFeed, tour: activeTour})} ${feedbackPrompt({category, feed: sceneFeed})}`, visualKeyFor(sceneFeed, next), Math.round(1400 / presentationSpeed))
    wake()
  }

  function previousFeed(){
    playSessionSound(category, "open")
    const nextItem = feeds[(active - 1 + feeds.length) % feeds.length] || sceneFeed
    setActive((value) => (value - 1 + feeds.length) % feeds.length)
    setStageIndex(0)
    setModelOpen(true)
    setGuideDepth(0)
    speakAfterVisual(`Moving back to ${nextItem.title}. The renderer stays live while the asset changes.`, visualKeyFor(nextItem, stages[0]))
    wake()
  }

  function nextFeed(){
    playSessionSound(category, "open")
    const nextItem = feeds[(active + 1) % feeds.length] || sceneFeed
    setActive((value) => (value + 1) % feeds.length)
    setStageIndex(0)
    setModelOpen(true)
    setGuideDepth(0)
    speakAfterVisual(`Opening ${nextItem.title}. The renderer stays live while the asset changes.`, visualKeyFor(nextItem, stages[0]))
    wake()
  }

  function toggleAutoPresent(){
    const limit = AI_TIER_LIMITS[tier] ?? AI_TIER_LIMITS.guest
    const usage = readAiUsage(tier)
    if(limit !== Infinity && usage.usedMs >= limit){
      setAiUsage(usage)
      speak("This tier has used its AI presentation time for the 12 hour window.")
      return
    }
    const next = !autoPresent
    setShowcaseAuto(false)
    setAutoPresent(next)
    setDemoMode(next ? "all" : "")
    setMode("premium")
    setPlaying(next)
    setModelOpen(next || modelOpen)
    if(next) autoStepRef.current = 0
    playSessionSound(category, next ? "open" : "stop")
    speak(next ? "Auto presentation is on. I will keep presenting, ask for feedback, and bridge into related categories until you tell me to stop." : "Auto presentation stopped.")
  }

  function playMore(){
    playSessionSound(category, guideDepth >= 2 ? "bridge" : "open")
    setModelOpen(true)
    setPlaying(false)
    if(guideDepth >= 2 && feeds.length > 1){
      setActive((current) => (current + 1) % feeds.length)
      setStageIndex(2)
      setGuideDepth(0)
      speakAfterVisual(`Loading a related model for the presentation. ${feedbackPrompt({category, feed: sceneFeed})}`, visualKeyFor(feeds[(active + 1) % feeds.length] || sceneFeed, stages[2]))
    } else {
      const nextDepth = guideDepth + 1
      setGuideDepth(nextDepth)
      speakAfterVisual(`${extendedGuideLine({category, stage, feed: sceneFeed, tour: activeTour, depth: nextDepth - 1})} ${modelDataReadout({feed: sceneFeed, category, stage}).lines.slice(2, 5).join(" ")} ${feedbackPrompt({category, feed: sceneFeed})}`, sceneVisualKey)
    }
    wake()
  }

  function lastFindRecord(note = smartNote){
    const modelLink = sceneFeed.modelUrl || sceneFeed.viewerUrl || sceneFeed.embedUrl || ""
    const text = note || `${sceneFeed.title}: ${currentGuideLine}\n\nFollow-up:\n- ${currentFollowUps.join("\n- ")}`
    return {
      createdAt: new Date().toISOString(),
      category,
      stage: stage.label,
      title: sceneFeed.title,
      note: text,
      modelLink,
      software: {
        app: "DigitalHut Observatory",
        renderer: sceneFeed.embedUrl ? "Sketchfab embed" : sceneFeed.modelUrl ? "Babylon GLB" : "stock/API preview",
        provider: sceneFeed.apiSource || sceneFeed.apiStatus || "observatory feed",
        supportedActions: ["view", "rotate", "guided tour", "save note", "share", "download record", "open model link"]
      },
      followUps: currentFollowUps
    }
  }

  async function saveSmartNote(note = smartNote){
    const baseRecord = lastFindRecord(note)
    const text = baseRecord.note
    const record = {
      ...lastFindRecord(text),
      noteFormat
    }
    const blob = new Blob([JSON.stringify(record, null, 2)], {type: "application/json"})
    const url = URL.createObjectURL(blob)
    setDownloadUrl(url)
    setSmartNote(text)
    window.localStorage.setItem("digitalhut:lastRecordedFind", JSON.stringify(record))
    return url
  }

  async function runAiCommand(command){
    const text = String(command || "").trim()
    if(!text) return
    setAiCommand(text)
    setAiOpen(false)
    wake()
    recordDirectorMessage("user", text, "Command")
    const lower = text.toLowerCase()
    const nextCategory = categoryFromCommand(text)
    const nextQuery = queryFromCommand(text, query)
    if(lower.includes("open main lobby") || lower.includes("main lobby") || lower.includes("show lobby")){
      setMainLobbyOpen(true)
      setModelOpen(false)
      recordDirectorMessage("ai", "Opening Main Lobby with GLB and podcast combination feeds.", "Main Lobby")
      speak("Opening Main Lobby. Pick a feed lane and I will load the matching GLB presentation.")
      return
    }
    if(lower.includes("close main lobby") || lower.includes("close lobby")){
      setMainLobbyOpen(false)
      recordDirectorMessage("ai", "Closing Main Lobby and returning to the current renderer.", "Main Lobby")
      return
    }
    if(lower.includes("show quick options") || lower.includes("quick options") || lower.includes("quick displays")){
      setMainLobbyOpen(false)
      recordDirectorMessage("ai", `Quick displays are active for ${category}. Choose any panel item to switch GLBs.`, "Quick displays")
      speak(`Quick displays are active for ${category}. Choose any panel item to switch the GLB presentation.`)
      return
    }
    if(lower.includes("open backend editor") || lower.includes("backend editor") || lower.includes("open asset lab") || lower.includes("unlock owner backend")){
      recordDirectorMessage("ai", "Opening the protected backend editor for asset conversion, GLB records, and Blink System work.", "Backend editor")
      speak("Opening backend editor.")
      window.location.href = "/asset-lab"
      return
    }
    if(lower.includes("custom feed") || lower.includes("custom node") || lower.includes("personalized feed") || lower.includes("stellar feed") || lower.includes("genius real estate") || lower.includes("pro gamer")){
      recordDirectorMessage("ai", "Opening the Backend Blink preview for coming soon personalized feed nodes.", "Custom feed nodes")
      speak("Opening custom feed nodes. Search and presentations stay active now. Personalized Stellar, Genius Real Estate, Pro Gamer, Pure Researcher, and Mainstream Pulse feeds are staged as coming soon.")
      window.location.href = "/asset-lab?tab=blink"
      return
    }
    if(lower.includes("open library") || lower.includes("asset library") || lower.includes("show library")){
      setAiOpen(true)
      setModelOpen(true)
      recordDirectorMessage("ai", `${assetLibraryStatus.mode === "uploaded-personal-library" ? "Supabase library connected" : "Local render library"}: ${assetLibraryStatus.availableCount} of ${assetLibraryStatus.totalCount} GLBs available.`, "Library")
      speak(`Opening library status. ${assetLibraryStatus.availableCount} of ${assetLibraryStatus.totalCount} GLBs are available for this renderer lane.`)
      return
    }
    if(lower.includes("previous display") || lower.includes("previous model") || lower.includes("back display")){
      recordDirectorMessage("ai", "Moving to the previous display and keeping Play Preview attached.", "Previous display")
      previousFeed()
      return
    }
    if(lower.includes("next display") || lower.includes("next model") || lower.includes("preview next") || lower.includes("show me next")){
      recordDirectorMessage("ai", "Opening the next display and waiting for the renderer before narration continues.", "Next display")
      nextFeed()
      return
    }
    if(lower.includes("open 3d") || lower.includes("open renderer") || lower.includes("play preview") || lower.includes("open current display")){
      setModelOpen(true)
      recordDirectorMessage("ai", `Opening Play Preview for ${sceneFeed.title}.`, "Play Preview")
      speak(`Open 3D model view. Loading ${sceneFeed.title}.`)
      return
    }
    if(lower.includes("download current 3d display") || lower.includes("download current display") || lower.includes("download current 3d")){
      const target = bestRenderableModelUrl(sceneFeed) || sceneFeed.viewerUrl || sceneFeed.embedUrl || ""
      setNotesOpen(true)
      await saveSmartNote()
      recordDirectorMessage("ai", target ? "Saved the current display note and opened the current 3D display link." : "Saved the current display note; no direct GLB URL is exposed.", "Download display")
      if(target) window.open(target, "_blank")
      else speak("I saved the current display note. This feed does not expose a direct GLB link yet.")
      return
    }
    if(lower.includes("talent tree") || lower.includes("node progress") || lower.includes("stellar node")){
      const node = talentNodeFromCommand(text)
      window.localStorage.setItem("digitalhut:blinkPulse", node)
      recordDirectorMessage("ai", `Opening the DigitalHut Backend Blink System and pulsing ${node.replace(/-/g, " ")} progress.`, "Talent tree")
      speak(`Opening node progress. I am pulsing your ${node.replace(/-/g, " ")} progress so you can see what is completed, pending, and what grind unlocks next.`)
      window.location.href = `/asset-lab?tab=blink&node=${encodeURIComponent(node)}`
      return
    }
    if(lower.includes("stop")){
      setAutoPresent(false)
      setPlaying(false)
      recordDirectorMessage("ai", "Stopping the AI presentation and keeping the current renderer available.", "Stopped")
      speak("Stopping AI presentation.")
      return
    }
    if(lower.includes("auto mode") || lower.includes("keep presenting") || lower.includes("play feed")){
      recordDirectorMessage("ai", lower.includes("current") || lower.includes("stay on topic") ? "Starting Current Category Auto Demo." : "Starting All Category Auto Demo.", "Auto demo")
      startDemoMode(lower.includes("current") || lower.includes("stay on topic") ? "current" : "all")
      return
    }
    if(lower.includes("go live") || lower.includes("live glb") || lower.includes("start live") || lower.includes("broadcast")){
      setLiveStageOpen(true)
      setModelOpen(true)
      playSessionSound(category, "bridge")
      recordDirectorMessage("ai", `Live GLB stage is ready for ${sceneFeed.title}.`, "Live stage")
      speak(`Live GLB stage is ready for ${sceneFeed.title}. Speak your host line, add a contest prompt, then post the live model.`)
      return
    }
    if(lower.includes("new trend") || lower.includes("jump category") || lower.includes("bridge")){
      recordDirectorMessage("ai", "Looking for the next category bridge and keeping the aerospace renderer live.", "Bridge")
      await bridgeNextCategory("I found a new trend")
      return
    }
    if(lower.includes("read data") || lower.includes("what do you see") || lower.includes("did you see the model") || lower.includes("current model")){
      recordDirectorMessage("ai", `Reading the current model: ${sceneFeed.title}.`, "Model readout")
      speakModelReadout()
      return
    }
    if(lower.includes("deep research")){
      setModelOpen(true)
      setNotesOpen(true)
      if(tier !== "pro"){
        recordDirectorMessage("ai", "Deep research is gated to Pro. I opened notes and kept the current model ready.", "Tier gate")
        speak(`Deep research is a Pro operating mode. I can still read this model, rotate it, save the find, and bridge categories on ${tier}. ${feedbackPrompt({category, feed: sceneFeed})}`)
        return
      }
      await saveSmartNote(`${sceneFeed.title}\n\n${modelDataReadout({feed: sceneFeed, category, stage}).lines.join("\n")}`)
      recordDirectorMessage("ai", "Pro deep research saved the current readout and kept the renderer open.", "Deep research")
      speak(`Pro deep research is active. I saved the current readout, I am keeping the model open, and I can bridge into a related source next. ${feedbackPrompt({category, feed: sceneFeed})}`)
      return
    }
    if(lower.includes("guided") || lower.includes("tour")){
      recordDirectorMessage("ai", `Starting the guided tour for ${sceneFeed.title}.`, "Guided tour")
      chooseTour(activeTour)
      return
    }
    if(lower.includes("rotate") || lower.includes("camera")){
      recordDirectorMessage("ai", "Rotating the camera stage on the open model.", "Camera")
      nextStage()
      return
    }
    if(lower.includes("tell me more") || lower.includes("history") || lower.includes("experience") || lower.includes("facts")){
      recordDirectorMessage("ai", `Expanding the readout for ${sceneFeed.title}.`, "More detail")
      playMore()
      return
    }
    if(lower.includes("download glb") || lower.includes("download model")){
      const target = sceneFeed.modelUrl || sceneFeed.viewerUrl || sceneFeed.embedUrl || ""
      setNotesOpen(true)
      await saveSmartNote()
      recordDirectorMessage("ai", target ? "Saved the note and opened the direct model link." : "Saved the note; this feed does not expose a direct GLB link.", "Saved")
      if(target) window.open(target, "_blank")
      else speak("I saved the find. This feed does not expose a direct GLB link yet, so I attached the available model record.")
      return
    }
    if(lower.includes("save my last recorded find") || lower.includes("save last recorded find") || lower.includes("download note")){
      setNotesOpen(true)
      await saveSmartNote()
      recordDirectorMessage("ai", "Saved the last recorded find into Smart Notes.", "Saved note")
      return
    }
    if(isNoteCommand(text)){
      setSmartNote((current) => [current, text].filter(Boolean).join("\n"))
      setNotesOpen(true)
      recordDirectorMessage("ai", "Added that text to Smart Notes without taking over the presentation.", "Note added")
      return
    }
    if(shouldTreatAsSearch(text)){
      const targetCategory = nextCategory || category
      setCategory(targetCategory)
      setTour(toursFor(targetCategory)[0].id)
      setStageIndex(0)
      setStatsFeeds([])
      setGuideDepth(0)
      setModelOpen(true)
      recordDirectorMessage("ai", `Searching ${nextQuery} in ${targetCategory}. I will prepare the asset while the renderer stays live.`, "Search")
      setQuery(nextQuery)
      announceOpen3dModel({title: nextQuery})
      await loadFeeds(targetCategory, nextQuery, {silent: true, keepOpen: true})
      setActive(0)
      setStageIndex(0)
      setModelOpen(true)
      speak(`Search ready in ${targetCategory}. The GLB renderer is active now.`)
    }
  }

  function startVoiceCommand(){
    const Engine = speechEngine()
    setAiOpen(false)
    if(!Engine){
      speak("Voice input is not available in this browser. Type your command instead.")
      return
    }
    const recognition = new Engine()
    recognition.lang = "en-US"
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onstart = () => setAiListening(true)
    recognition.onend = () => setAiListening(false)
    recognition.onerror = () => {
      setAiListening(false)
      speak("I could not hear that. You can type the command instead.")
    }
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || ""
      setAiCommand(transcript)
      runAiCommand(transcript)
    }
    recognitionRef.current = recognition
    recognition.start()
  }

  function startHostVoice(){
    const Engine = speechEngine()
    setLiveStageOpen(true)
    if(!Engine){
      speak("Host voice capture is not available in this browser. Type your live line instead.")
      return
    }
    const recognition = new Engine()
    recognition.lang = "en-US"
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onstart = () => setAiListening(true)
    recognition.onend = () => setAiListening(false)
    recognition.onerror = () => {
      setAiListening(false)
      speak("I could not capture the host line. Type it in the live stage box.")
    }
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || ""
      setHostLine(transcript)
      playSessionSound(category, "open")
    }
    recognitionRef.current = recognition
    recognition.start()
  }

  async function createLivePost(){
    setModelOpen(true)
    const metrics = liveMetricsFor(category, livePosts.length)
    const post = {
      id: `live-${Date.now()}`,
      created_at: new Date().toISOString(),
      creator: "digitalhut.app",
      share_title: viralShareTitle(sceneFeed),
      sponsor_line: "Featured on digitalhut.app",
      category,
      title: sceneFeed.title,
      host_line: hostLine,
      contest_prompt: contestPrompt,
      model_link: liveModelLink,
      model_source: sceneFeed.apiSource || sceneFeed.apiStatus || "observatory feed",
      views: metrics.views,
      likes: metrics.likes,
      comments: metrics.comments,
      minute: metrics.minute,
      layer: layer,
      replay_note: currentGuideLine
    }
    const nextPosts = [post, ...livePosts].slice(0, 24)
    setLivePosts(nextPosts)
    writeLiveFeed(nextPosts)
    setLiveSyncStatus("Saving live post...")
    const result = await publishLiveFeedPost(post)
    setLiveSyncStatus(result.synced ? "Synced to Supabase live feed" : `Saved locally. ${result.reason}`)
    playSessionSound(category, "bridge")
    speak(`Live viral 3D project created for ${sceneFeed.title}. DigitalHut stays as the sponsor line.`)
  }

  async function runPresentationSearch(){
    setCategory("DigitalHut Presentation")
    setTour(toursFor("DigitalHut Presentation")[0].id)
    setStageIndex(0)
    setModelOpen(true)
    setQuery(presentationSearch)
    announceOpen3dModel({title: presentationSearch, category: "DigitalHut Presentation"})
    const next = await loadFeeds("DigitalHut Presentation", presentationSearch, {silent: true, keepOpen: true})
    setActive(0)
    setModelOpen(true)
    const loaded = next[0] || seedFeeds("DigitalHut Presentation")[0]
    speakAfterVisual(`Presentation Featured Mode found ${loaded.title}. The model is open for editing. Add overlays, files, notes, audio cues, or share packaging.`, visualKeyFor(loaded, stages[0]))
  }

  function addPresentationEdit(kind){
    const edit = {
      id: `edit-${Date.now()}`,
      kind,
      title: sceneFeed.title,
      modelLink: sceneFeed.modelUrl || sceneFeed.viewerUrl || sceneFeed.embedUrl || "",
      note: presentationFileNote || `${kind} change for ${sceneFeed.title}`,
      createdAt: new Date().toISOString()
    }
    setPresentationEdits((current) => [edit, ...current].slice(0, 8))
    setPresentationFileNote("")
    playSessionSound("DigitalHut Presentation", "open")
    speak(`${kind} edit added to ${sceneFeed.title}.`)
  }

  async function copyBacklink(){
    const text = `${viralShareTitle(sceneFeed)}\n${liveModelLink}\n${viralShareText({feed: sceneFeed, hostLine, contestPrompt})}`
    await navigator.clipboard?.writeText(text).catch(() => null)
    setLiveSyncStatus("Backlink copy ready")
    playSessionSound("Mainstream Streaming", "open")
  }

  function likeLivePost(id){
    const nextPosts = livePosts.map((post) => post.id === id ? {...post, likes: (post.likes || 0) + 1} : post)
    setLivePosts(nextPosts)
    writeLiveFeed(nextPosts)
    playSessionSound("Mainstream Streaming", "open")
  }

  async function toggleMechanicMode(){
    if(mechanicMode){
      setMechanicMode(false)
      setAssistanceOpen(false)
      setAutoPresent(false)
      setDemoMode("")
      setPlaying(false)
      const returnCategory = preMechanicCategoryRef.current || "Mainstream Streaming"
      setCategory(returnCategory)
      setTour(toursFor(returnCategory)[0].id)
      setStageIndex(0)
      setGuideDepth(0)
      const seed = seedFeeds(returnCategory)[0]
      setQuery(seed.query)
      await loadFeeds(returnCategory, seed.query, {silent: true, keepOpen: true})
      setModelOpen(true)
      speak("Aerospace display remains active. Returning to the main DigitalHut observatory.")
      return
    }
    preMechanicCategoryRef.current = category
    const selectedMode = mobilityModes[0]
    setMechanicMode(true)
    setAssistanceOpen(false)
    setMobilityMode(selectedMode.id)
    setCategory("Mobility")
    setTour(toursFor("Mobility")[0].id)
    setMode("premium")
    setStageIndex(0)
    setGuideDepth(0)
    setQuery(selectedMode.query)
    const next = await loadFeeds("Mobility", selectedMode.query, {silent: true, keepOpen: true})
    const loaded = next[0] || seedFeeds("Mobility")[0]
    setActive(0)
    setModelOpen(true)
    speakAfterVisual(`Aerospace observatory display ready. ${loaded.title}. Public source and verified GLB awareness only.`, visualKeyFor(loaded, stages[0]))
  }

  async function chooseMobilityMode(item){
    setMobilityMode(item.id)
    setAssistanceOpen(false)
    setCategory("Mobility")
    setTour(toursFor("Mobility")[0].id)
    setStageIndex(0)
    setGuideDepth(0)
    setQuery(item.query)
    const next = await loadFeeds("Mobility", item.query, {silent: true, keepOpen: true})
    const loaded = next[0] || seedFeeds("Mobility")[0]
    setActive(0)
    setModelOpen(true)
    speakAfterVisual(`${item.id} travel feed ready. ${loaded.title}.`, visualKeyFor(loaded, stages[0]))
  }

  function toggleMechanicAuto(){
    if(runtimePaused){
      speak(runtimeState.online ? "Auto Play is paused while this page is in the background." : "Auto Play is paused because the system is offline.")
      return
    }
    if(mainLobbyOpen){
      const next = !autoPresent
      setShowcaseAuto(next)
      setAutoPresent(next)
      setPlaying(next)
      setDemoMode(next ? "lobby" : "")
      recordDirectorMessage("ai", next ? "Main Lobby showcase autoplay started." : "Main Lobby showcase autoplay paused.", "Main Lobby")
      speak(next ? "Main Lobby autoplay started. I will rotate fresh category and API highlights without opening the full renderer." : "Main Lobby autoplay paused.")
      wake()
      return
    }
    startDemoMode("current")
  }

  function openTravelAssistance(){
    setAutoPresent(false)
    setDemoMode("")
    setPlaying(false)
    setAssistanceOpen(true)
    recordDirectorMessage("ai", "Travel assistance opened. Presentation paused and the current model remains available.", "Assistance")
  }

  function action(label){
    const target = sceneFeed.modelUrl || sceneFeed.embedUrl || sceneFeed.viewerUrl || ""
    if(label === "Save") {
      window.localStorage.setItem("digitalhut:savedFeed", JSON.stringify(sceneFeed))
      const currentAssets = JSON.parse(window.localStorage.getItem("digitalhut:assetLab") || "[]")
      const slug = `asset_${(sceneFeed.title || "digitalhut-model").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`
      const assetRecord = {
        id: `main-${sceneFeed.id || Date.now()}`,
        slug,
        name: sceneFeed.title,
        type: sceneFeed.modelUrl ? "GLB" : sceneFeed.embedUrl ? "Embed" : "Research Source",
        source: sceneFeed.apiSource || sceneFeed.apiStatus || category,
        url: sceneFeed.modelUrl || sceneFeed.embedUrl || sceneFeed.viewerUrl || "",
        oldFileUrl: sceneFeed.thumbnail || "",
        convertedUrl: sceneFeed.modelUrl || sceneFeed.embedUrl || sceneFeed.viewerUrl || "",
        description: sceneFeed.note || currentGuideLine,
        status: "Saved from main renderer",
        progress: 100,
        visibility: "Private until published",
        zoomRate: presentationSpeed,
        likes: 0,
        shares: 0,
        comments: ["Saved from the DigitalHut main renderer."],
        dialogue: [`Open 3D model view. ${sceneFeed.title} is ready.`, currentGuideLine],
        createdAt: new Date().toISOString()
      }
      const storageLimit = STORAGE_TIER_LIMITS[tier] ?? STORAGE_TIER_LIMITS.guest
      const nextAssets = [assetRecord, ...currentAssets.filter((item) => item.slug !== slug)].slice(0, storageLimit === Infinity ? undefined : storageLimit)
      window.localStorage.setItem("digitalhut:assetLab", JSON.stringify(nextAssets))
      speak(`${sceneFeed.title} saved. ${storageLimit === Infinity ? "Your tier has unlimited saved asset history." : `Your ${tier} tier keeps the latest ${storageLimit} saved assets.`}`)
    }
    if(label === "Share" && navigator.share) navigator.share({title: viralShareTitle(sceneFeed), text: viralShareText({feed: sceneFeed, hostLine, contestPrompt}), url: sceneFeed.viewerUrl || window.location.href}).catch(() => null)
    if(label === "Embed" && navigator.clipboard) navigator.clipboard.writeText(sceneFeed.embedUrl ? `<iframe src="${sceneFeed.embedUrl}"></iframe>` : window.location.href).catch(() => null)
    if(label === "Download") target && paid ? window.open(target, "_blank") : setEntryOpen(true)
    if(label === "Related") setActive((current) => (current + 1) % feeds.length)
    if(label === "Refresh") refreshLiveRenderer()
    if(label === "FAQ") window.location.href = "/faq"
    if(label === "Live") setLiveStageOpen((value) => !value)
    if(label === "Backend") window.location.href = "/asset-lab"
    wake()
  }

  return <main className={`dh-observatory low-power aerospace-display ${loading ? "is-loading" : "is-ready"} ${interactionPulse ? "system-pulse" : ""} ${mainLobbyOpen ? "main-lobby-active" : ""} ${entryOpen ? "entry-open" : "entry-complete"} mechanic-mode`} data-main-frame={digitalHutBrainMap.mainFrame} data-observatory-category={category} data-observatory-status={loading ? "verifying" : sceneFeed.apiStatus || "ready"} data-physical-assets="sensitive" onPointerMove={handleObservatoryPointer} onPointerLeave={centerCockpitMotion} onPointerDown={(event) => {wake(); triggerSystemPulse(event)}} onClickCapture={triggerSystemPulse}>
    <section className="dh-stage">
      <RendererVisual feed={sceneFeed} stage={stage} guided={guided} loading={loading} layer={layer} renderLive={!entryOpen} modelOpen={modelOpen} onOpenModel={openContainedModel} onNext={nextStage} onPlayMore={playMore} onVisualPending={markVisualPending} onVisualReady={markVisualReady} onDirectorUpdate={setDirectorStatus} guideText={currentGuideLine} followUps={currentFollowUps} />
      <div className="dh-vignette" />
      {layer === "Architect" && <div className="dh-architect"><b>Architect Layer</b><span>builders / developers / researchers / AIs / experimental</span></div>}
      <>
        <div className="dh-cockpit-frame" aria-hidden="true"><span>DigitalHut Observatory</span><b>Verified GLB / public feeds / source status</b></div>
        <nav className="dh-mechanic-categories" aria-label="DigitalHut categories">
          {categories.map((item) => <button key={item.id} className={item.id === category ? "active" : ""} type="button" onClick={() => selectCategory(item.id)}><span>{item.icon}</span><b>{item.id}</b></button>)}
        </nav>

        <form className="dh-mechanic-search" onSubmit={(event) => {event.preventDefault(); runSearch()}}>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search any GLB, feed, place, game, research, house project..." />
          <button type="submit">Search</button>
          <button type="button" onClick={() => setMainLobbyOpen(true)}>Main Lobby</button>
        </form>

        <aside className="dh-mechanic-controls" aria-label="DigitalHut observatory playback controls">
          <button className={`primary ${autoPresent ? "active" : ""}`} type="button" onClick={toggleMechanicAuto}><span>{autoPresent ? "Pause" : "Play"}</span><b>{autoPresent ? "Pause Feed" : "Auto Play Feed"}</b></button>
          <button type="button" onClick={previousFeed}><span>Previous</span><b>Previous Model</b></button>
          <button type="button" onClick={nextFeed}><span>Next</span><b>Next Model</b></button>
          <button type="button" onClick={openContainedModel}><span>Preview</span><b>Play 3D Preview</b></button>
          <button type="button" onClick={() => setMainLobbyOpen(true)}><span>Lobby</span><b>Main Lobby</b></button>
        </aside>

        {!mainLobbyOpen && <aside className="dh-mechanic-status" aria-label="DigitalHut observatory status">
          <header><span>DigitalHut Display</span><b>{mechanicRuntimeStatus}</b></header>
          <div className="dh-mechanic-readouts">
            <section><span>View mode</span><b>{category}</b></section>
            <section><span>Network</span><b>{runtimeState.online ? `${runtimeState.connection}${runtimeState.saveData ? " / saver" : ""}` : "Offline"}</b></section>
            <section><span>Renderer</span><b>{sceneVisualKey === visualReadyKey ? "Ready" : loading ? "Loading" : "Standby"}</b></section>
            <section><span>Presentation</span><b>{runtimePaused ? "Paused" : autoPresent ? "Auto Play" : "Manual"}</b></section>
          </div>
          <div className="dh-mechanic-current">
            <span>Current public feed</span>
            <b>{sceneFeed.title}</b>
            <small>{sceneFeed.apiSource || sceneFeed.apiStatus || "DigitalHut feed"}</small>
          </div>
          <p>Single renderer. DigitalHut detects the device context automatically and keeps the experience focused on searchable GLB presentations, podcasts, feeds, and backend-ready assets.</p>
          <div className="dh-mechanic-quick-panel">
            <div className="dh-mechanic-panel-head"><span>Quick Displays</span><b>{loading ? "API" : "Ready"}</b></div>
            {quickDisplayFeeds.map((item) => <button key={item.id} className={item.id === feed.id ? "active" : ""} type="button" onClick={() => {chooseFeed(item); setModelOpen(true)}}>
              <MiniVisual feed={item} active={item.id === feed.id} />
              <span><b>{item.title}</b><small>{item.apiSource || item.apiStatus || item.category}</small></span>
            </button>)}
          </div>
          <div className="dh-blink-mini-panel">
            <div className="dh-mechanic-panel-head"><span>Blink Nodes</span><b>Preview</b></div>
            {blinkNodesWithApi.map((item) => <button key={item.id} className={item.locked ? "locked" : "unlocked"} type="button" onClick={() => {
              window.localStorage.setItem("digitalhut:blinkPulse", item.id)
              window.localStorage.setItem("digitalhut:blinkNodeStatus", JSON.stringify({id: item.id, title: item.title, locked: item.locked, learnedSignals: item.learnedSignals, paidUnlock: item.paidUnlock, earnedUnlock: item.earnedUnlock, apiFeed: item.apiFeed?.title || ""}))
              if(item.locked){
                window.location.href = `/asset-lab?tab=blink&node=${encodeURIComponent(item.id)}`
                return
              }
              selectCategory(item.category)
              setAutoPresent(true)
              setPlaying(true)
              setModelOpen(true)
              speak(`Starting ${item.title} Blink autoplay. DigitalHut is using learned ${item.category} feeds and API signals for a stronger presentation lane.`)
            }}>
              <b>{item.title}</b><small>{item.locked ? `Locked. ${item.recommendation}` : `Unlocked. ${item.reward}`}</small>
            </button>)}
          </div>
          <div className="dh-mechanic-status-actions">
            <button type="button" onClick={() => setNotesOpen(true)}>Session Notes</button>
            <button type="button" onClick={refreshLiveRenderer}>Refresh Feed</button>
            <button type="button" onClick={() => window.location.href = "/asset-lab?tab=blink"}>Custom Nodes</button>
            <button type="button" onClick={() => window.location.href = "/asset-lab"}>Backend</button>
          </div>
        </aside>}

        {assistanceOpen && <section className="dh-travel-assistance" aria-label="DigitalHut assistance">
          <div>
            <header><span>DigitalHut Assistance</span><button type="button" onClick={() => setAssistanceOpen(false)}>Close</button></header>
            <h2>Presentation paused</h2>
            <p>This is a media and research display. Use official sources and qualified support before making real-world operational or safety decisions.</p>
            <div className="dh-assistance-grid">
              <section><b>1</b><span>Stop the presentation and assess the real surroundings.</span></section>
              <section><b>2</b><span>Use official procedures, public-source records, or trained staff when a real-world decision matters.</span></section>
              <section><b>3</b><span>Record visible observations and the current public feed in Session Notes.</span></section>
              <section><b>4</b><span>Contact qualified assistance before resuming travel when safety is uncertain.</span></section>
            </div>
            <div className="dh-assistance-actions">
              <button type="button" onClick={() => {setNotesOpen(true); setAssistanceOpen(false)}}>Open Session Notes</button>
              <button type="button" onClick={() => setAssistanceOpen(false)}>Return to Feed</button>
            </div>
          </div>
        </section>}
      </>
      {mainLobbyOpen && <section className="dh-main-lobby" aria-label="DigitalHut Main Lobby">
        <div>
          <header>
            <div><span>Main Lobby</span><h2>DigitalHut Observatory Showcase</h2></div>
            <button type="button" onClick={() => openLobbyFeed(lobbyActiveFeed)}>Enter Renderer</button>
          </header>
          <section className="dh-main-lobby-stage">
            <div className="dh-main-lobby-screen">
              <MiniVisual feed={lobbyActiveFeed} active />
              <div className="dh-main-lobby-scanline" />
            </div>
            <div className="dh-main-lobby-copy">
              <span>{lobbyActiveFeed.category || "DigitalHut"}</span>
              <h3>{lobbyActiveFeed.title}</h3>
              <small className="dh-main-lobby-source">{lobbyActiveFeed.apiSource || lobbyActiveFeed.apiStatus || "DigitalHut feed"}</small>
              <p>Welcome to DigitalHut. Explore categories, System Nodes, AutoPlay Showcase, and search any observatory experience. You can run commands such as open planetary category, next model, open backend, or start autoplay.</p>
              <div>
                <button type="button" onClick={() => previewLobbyFeed(lobbyActiveFeed)}>Preview Highlight</button>
                <button type="button" onClick={() => {window.location.href = "/asset-lab?tab=blink"}}>System Nodes</button>
                <button type="button" onClick={() => {setShowcaseAuto(true); setDemoMode("lobby"); setAutoPresent(true); setPlaying(true); setModelOpen(false); speak("Welcome to DigitalHut. Explore the categories, nodes, autoplay showcase, and search any observatory experience. Have fun. You can run commands like open planetary category or next model.")}}>Auto Play</button>
              </div>
            </div>
          </section>
          <div className="dh-main-lobby-grid">
            {lobbyDisplayFeeds.map((item, index) => <article key={item.id} className={item.id === lobbyActiveFeed.id ? "active" : ""}>
              <MiniVisual feed={item} active={item.id === sceneFeed.id} />
              <div><span>{item.category}</span><b>{item.title}</b><small>{item.apiSource || item.apiStatus || "DigitalHut feed"}</small></div>
              <button type="button" onClick={() => setLobbyActiveIndex(index)}>Highlight</button>
              <button type="button" onClick={() => previewLobbyFeed(item)}>Play Preview</button>
            </article>)}
          </div>
        </div>
      </section>}
      {modelOpen && !entryOpen && <PodcastMatchPanel feed={sceneFeed} compact={mechanicMode} />}

      <div className="dh-top" style={{opacity: awake ? 1 : 0.08}}>
        <div className="dh-search">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search observatory APIs..." />
          <button className={`dh-btn mode ${mode === "regular" ? "active" : ""}`} onClick={() => setMode("regular")}>Regular API</button>
          <button className={`dh-btn mode ${mode === "premium" ? "active" : ""}`} onClick={() => setMode("premium")}>Premium Tour</button>
          <button className="dh-btn hot" onClick={runSearch}>Search</button>
          <button className="dh-btn hot" onClick={() => speak(`${category} ${activeTour.id}. ${activeTour.prompt}`)}>Voice</button>
        </div>
        <div className="dh-account-cluster">
          <button className="dh-btn dh-backend-top" onClick={() => window.location.href = "/asset-lab"}>Backend</button>
          <button className="dh-btn dh-account" onClick={() => setEntryOpen(true)}>{username || "Choose account"} / {tier}</button>
        </div>
      </div>

      <div className="dh-category-dock" style={{opacity: awake ? 1 : 0.18}}>
        {categories.map((item, index) => <button key={item.id} className={`dh-category-card ${item.id === category ? "active" : ""}`} style={{"--accent": item.accent}} onClick={() => selectCategory(item.id)}>
          <span className="dh-category-icon"><img src={stockUrl(item.id, index)} alt="" loading="lazy" /><i /></span><small>{item.id}</small>
        </button>)}
      </div>

      <aside className="dh-quick-rail" style={{opacity: awake ? 1 : 0.2}}>
        {category === "DigitalHut Presentation" && <div className="dh-quick-section dh-presentation-entry">
          <div className="dh-rail-head"><span>DigitalHut Presentation</span><b>Advanced</b></div>
          <button className="dh-btn hot" type="button" onClick={() => {setPresentationFeatureOpen(true); setModelOpen(true); playSessionSound("DigitalHut Presentation", "bridge"); speak("Presentation Featured Mode is open. Search a GLB, attach files, add overlays, and package the model.")}}>Presentation Featured Mode</button>
        </div>}
        <div className="dh-quick-section">
          <div className="dh-rail-head"><span>{category} Tour</span><b>{stage.label}</b></div>
          <div className="dh-tour-grid">{activeTours.map((item, index) => <button key={item.id} className={`dh-btn dh-tour-card ${item.id === tour ? "active" : ""}`} onClick={() => chooseTour(item)}>
            <TourVisual item={item} active={item.id === tour} accent={sceneFeed.accent} image={stockUrl(category, index)} /><small>{item.id}</small>
          </button>)}</div>
        </div>
        <div className="dh-quick-section">
          <div className="dh-rail-head"><span>Regular Feed</span><b>{loading ? "API" : category}</b></div>
          <div className="dh-feed-grid">{feeds.slice(0, 4).map((item) => <button key={item.id} className={`dh-feed-card ${item.id === feed.id ? "active" : ""}`} onClick={() => chooseFeed(item)}>
            <MiniVisual feed={item} active={item.id === feed.id} /><div className="dh-card-text"><b>{item.title}</b><small>{item.apiSource || item.category}</small></div>
          </button>)}</div>
        </div>
      </aside>

      <div className="dh-info" style={{opacity: awake ? 1 : 0.16}}>
        <p className="dh-eyebrow">Guided Sequence</p>
        <h1 className="dh-title">{sceneFeed.title}</h1>
        <p className="dh-note">{mode === "premium" ? `${stage.label}: ${activeTour.prompt} ` : "Regular API feed. "}{sceneFeed.note}</p>
        <div className="dh-stage-strip">{stages.map((item, index) => <button key={item.id} className={`dh-stage-pill ${index === stageIndex ? "active" : ""}`} onClick={() => setStageIndex(index)}>{item.label}</button>)}</div>
        <div className="dh-state-badges"><span>{category}</span><span>{mode}</span><span>{sceneFeed.apiStatus || "api"}</span><span>{activeTour.icon}</span></div>
      </div>

      <div className="dh-media" style={{opacity: awake ? 1 : 0.12}}>
        <button className={`dh-btn ${demoMode === "all" ? "active" : ""}`} onClick={() => startDemoMode("all")}>{demoMode === "all" ? "Stop All Demo" : "All Category Demo"}</button>
        <button className={`dh-btn ${demoMode === "current" ? "active" : ""}`} onClick={() => startDemoMode("current")}>{demoMode === "current" ? "Stop Current Demo" : "Current Category Demo"}</button>
        <button className="dh-btn" onClick={previousFeed}>Back Model</button>
        <button className="dh-btn" onClick={nextFeed}>Next Model</button>
        <button className="dh-btn" onClick={nextStage}>Rotate</button>
        <label className="dh-speed-control"><span>Speed</span><select value={presentationSpeed} onChange={(event) => setPresentationSpeed(Number(event.target.value))}><option value="0.75">Slow</option><option value="1">Normal</option><option value="1.35">Fast</option><option value="1.75">Sprint</option></select></label>
        <button className="dh-btn" onClick={() => speak(tier === "pro" ? "Pro research, backend control, and long history are unlimited." : "Free AutoPlay viewing is unlimited. Higher tiers expand saved history, backend controls, node power, and deep research.")}>{tier === "pro" ? "Pro Unlimited" : "Free AutoPlay"}</button>
      </div>

      <div className="dh-utility" style={{opacity: awake ? 1 : 0.1}}>{["Save", "Share", "Live", "Embed", "Download", "Related", "Refresh", "FAQ"].map((label) => <button key={label} className="dh-btn" onClick={() => action(label)}>{label}</button>)}</div>

      <div className="dh-layer-dock" style={{opacity: awake ? 1 : 0.12}}>
        <button className={`dh-btn ${paid ? "" : "locked"}`} onClick={() => paid ? setLayerOpen((value) => !value) : setEntryOpen(true)}>{paid ? `Smart Layers: ${layer}` : "Smart Layers: Premium / Pro"}</button>
        {layerOpen && paid && <div className="dh-layer-menu">{layers.map((item) => <button key={item} className={`dh-btn ${item === layer ? "active" : ""}`} onClick={() => {setLayer(item); setLayerOpen(false)}}>{item}</button>)}</div>}
      </div>

      <button className={`dh-ai-space ${aiListening ? "listening" : ""} dock-${aiDock}`} type="button" onClick={startVoiceCommand}>
        <span>DigitalHut AI</span><b>{aiListening ? "Listening" : "Interact"}</b>
      </button>
      <div className="dh-director-panel">
        <div className="dh-director-head"><b>AI Director</b><span>{tier.toUpperCase()}</span></div>
        <div className="dh-director-status">
          <strong>{directorStatus.phase}</strong>
          <p>{directorStatus.detail}</p>
          <small>{directorStatus.status}</small>
          <small className="dh-director-asset-source">{assetLibraryStatus.mode === "uploaded-personal-library" ? "Supabase library connected" : "Local render library"}: {assetLibraryStatus.availableCount}/{assetLibraryStatus.totalCount} GLBs</small>
        </div>
        <ol>
          {["Finding model", "Loading GLB", "Preparing camera", "Reading metadata", "Ready to present"].map((item) => <li key={item} className={directorStatus.phase === item || (directorStatus.phase.includes("Ready") && item === "Ready to present") ? "active" : ""}>{item}</li>)}
        </ol>
        <div className="dh-director-chat">
          <div className="dh-director-history">
            {(directorChat.length ? directorChat : [{id: "seed", role: "ai", text: `Renderer attached to ${sceneFeed.title}. Type next model, rotate, guided tour, current category auto mode, or search a topic.`, status: "Ready"}]).slice(0, 5).map((item) => <div key={item.id} className={`dh-director-message ${item.role === "user" ? "from-user" : "from-ai"}`}>
              <b>{item.role === "user" ? "You" : "DigitalHut AI"}</b>
              <span>{item.text}</span>
              <small>{item.status}</small>
            </div>)}
          </div>
          <div className="dh-director-command">
            <input value={directorInput} onChange={(event) => setDirectorInput(event.target.value)} onKeyDown={(event) => {if(event.key === "Enter") submitDirectorCommand()}} placeholder="Tell AI: open Science, rotate, next model..." />
            <button type="button" onClick={() => submitDirectorCommand()}>Run</button>
            <button type="button" onClick={startVoiceCommand}>{aiListening ? "Listening" : "Voice"}</button>
          </div>
          <div className="dh-director-tools">
            <button type="button" onClick={() => startDemoMode("current")}>Current Auto</button>
            <button type="button" onClick={() => startDemoMode("all")}>All Auto</button>
            <button type="button" onClick={clearDirectorChat}>Clear</button>
          </div>
        </div>
      </div>
      {aiOpen && <div className="dh-ai-command">
        <div><b>DigitalHut AI</b><button type="button" onClick={() => setAiOpen(false)}>Close</button></div>
        <input value={aiCommand} onChange={(event) => setAiCommand(event.target.value)} onKeyDown={(event) => {if(event.key === "Enter") runAiCommand(aiCommand)}} placeholder="Ask: Canada, Saturn, funny cat video, NC real estate, rotate, tell me more" />
        <div className="dh-ai-actions">
          <button type="button" onClick={() => runAiCommand(aiCommand)}>Run</button>
          <button type="button" onClick={startVoiceCommand}>{aiListening ? "Listening" : "Voice"}</button>
          <button type="button" onClick={() => setNotesOpen((value) => !value)}>Smart Notes</button>
        </div>
      </div>}

      {liveStageOpen && <div className="dh-live-stage">
        <div><b>Live GLB Stage</b><button type="button" onClick={() => setLiveStageOpen(false)}>Close</button></div>
        <a className="dh-big-share-link" href={liveModelLink} target="_blank" rel="noreferrer">{viralShareTitle(sceneFeed)}<span>{liveModelLink}</span><small>Featured on digitalhut.app</small></a>
        <div className="dh-live-metrics">
          <span>10:00 live</span><b>{liveMetricsFor(category).views.toLocaleString()} views</b><b>{liveMetricsFor(category).likes.toLocaleString()} likes</b><b>{liveMetricsFor(category).comments.toLocaleString()} comments</b>
        </div>
        <label>Host line</label>
        <textarea value={hostLine} onChange={(event) => setHostLine(event.target.value)} />
        <label>Contest / viewer prompt</label>
        <input value={contestPrompt} onChange={(event) => setContestPrompt(event.target.value)} />
        <div className="dh-live-model"><b>{sceneFeed.title}</b><span>{liveModelLink}</span><small>{liveSyncStatus}</small></div>
        <div className="dh-ai-actions">
          <button type="button" onClick={startHostVoice}>{aiListening ? "Listening" : "Speak Host Line"}</button>
          <button type="button" onClick={createLivePost}>Post Live GLB</button>
          <button type="button" onClick={copyBacklink}>Copy Backlink</button>
          <button type="button" onClick={() => navigator.share?.({title: viralShareTitle(sceneFeed), text: viralShareText({feed: sceneFeed, hostLine, contestPrompt}), url: liveModelLink}).catch(() => null)}>Share</button>
        </div>
        <div className="dh-live-feed">
          {livePosts.slice(0, 3).map((post) => <article key={post.id}>
            <b>{post.share_title || viralShareTitle(post)}</b>
            <div className="dh-live-metrics compact"><span>{post.minute || "10:00"} live</span><b>{(post.views || 0).toLocaleString()} views</b><b>{(post.comments || 0).toLocaleString()} comments</b></div>
            <p>{post.host_line}</p>
            <small>{post.contest_prompt}</small>
            <small>{post.sponsor_line || "Featured on digitalhut.app"}</small>
            <div><button type="button" onClick={() => likeLivePost(post.id)}>Like {post.likes || 0}</button><a href={post.model_link} target="_blank" rel="noreferrer">Open</a></div>
          </article>)}
        </div>
      </div>}

      {presentationFeatureOpen && <div className="dh-presentation-feature">
        <div><b>Presentation Featured Mode</b><button type="button" onClick={() => setPresentationFeatureOpen(false)}>Close</button></div>
        <label>Dedicated GLB search</label>
        <div className="dh-presentation-search">
          <input value={presentationSearch} onChange={(event) => setPresentationSearch(event.target.value)} onKeyDown={(event) => {if(event.key === "Enter") runPresentationSearch()}} />
          <button type="button" onClick={runPresentationSearch}>Find GLB</button>
        </div>
        <div className="dh-live-model"><b>{sceneFeed.title}</b><span>{sceneFeed.modelUrl || sceneFeed.viewerUrl || sceneFeed.embedUrl || "Environment read attached by DigitalHut"}</span><small>{layer} layer / {stage.label}</small></div>
        <label>Special file / edit instruction</label>
        <textarea value={presentationFileNote} onChange={(event) => setPresentationFileNote(event.target.value)} placeholder="Example: add intro audio, attach brand overlay, expand model note, add sponsor card, add contest prompt..." />
        <div className="dh-ai-actions">
          <button type="button" onClick={() => addPresentationEdit("Overlay")}>Add Overlay</button>
          <button type="button" onClick={() => addPresentationEdit("Special File")}>Attach File Note</button>
          <button type="button" onClick={() => addPresentationEdit("Audio Cue")}>Add Audio Cue</button>
          <button type="button" onClick={() => {setLiveStageOpen(true); setPresentationFeatureOpen(false)}}>Send To Live</button>
        </div>
        <div className="dh-presentation-edits">
          {presentationEdits.map((edit) => <article key={edit.id}><b>{edit.kind}</b><span>{edit.note}</span><small>{edit.title}</small></article>)}
        </div>
      </div>}

      {notesOpen && <div className="dh-smart-notes">
        <div><b>Smart Note / Chat Record</b><button type="button" onClick={() => setNotesOpen(false)}>Close</button></div>
        <div className="dh-note-tools">
          <select value={noteFormat.font} onChange={(event) => setNoteFormat((current) => ({...current, font: event.target.value}))}><option>Arial</option><option>Georgia</option><option>Courier New</option></select>
          <select value={noteFormat.size} onChange={(event) => setNoteFormat((current) => ({...current, size: event.target.value}))}><option value="13">13</option><option value="14">14</option><option value="16">16</option><option value="18">18</option></select>
          <select value={noteFormat.spacing} onChange={(event) => setNoteFormat((current) => ({...current, spacing: event.target.value}))}><option value="1.25">Tight</option><option value="1.45">Normal</option><option value="1.7">Open</option></select>
          <input type="color" value={noteFormat.color} onChange={(event) => setNoteFormat((current) => ({...current, color: event.target.value}))} />
          <button type="button" onClick={() => setSmartNote((current) => `${current}\n- `)}>Bullets</button>
        </div>
        <textarea style={{fontFamily: noteFormat.font, fontSize: `${noteFormat.size}px`, lineHeight: noteFormat.spacing, color: noteFormat.color}} value={smartNote} onChange={(event) => setSmartNote(event.target.value)} placeholder="Your research notes stay here until you explicitly save or download them." />
        <div className="dh-note-attachment"><b>Attached Model</b><span>{sceneFeed.title}</span><small>{sceneFeed.modelUrl || sceneFeed.viewerUrl || sceneFeed.embedUrl || "Provider model link not exposed yet"}</small></div>
        <div className="dh-ai-actions">
          <button type="button" onClick={() => saveSmartNote()}>Save Last Find</button>
          <button type="button" onClick={() => navigator.share?.({title: sceneFeed.title, text: smartNote || currentGuideLine}).catch(() => null)}>Share</button>
          {(sceneFeed.modelUrl || sceneFeed.viewerUrl || sceneFeed.embedUrl) && <a href={sceneFeed.modelUrl || sceneFeed.viewerUrl || sceneFeed.embedUrl} target="_blank" rel="noreferrer">Open Model Link</a>}
          {downloadUrl && <a href={downloadUrl} download={`digitalhut-${category}-${Date.now()}.json`}>Download</a>}
        </div>
      </div>}
    </section>

    <button className="dh-system-faq-button" type="button" onClick={() => setFaqOpen((value) => !value)} aria-expanded={faqOpen} aria-label="Open DigitalHut system FAQ">?</button>
    {faqOpen && <aside className="dh-system-faq-panel" aria-label="DigitalHut quick FAQ">
      <header><span>DigitalHut FAQ</span><button type="button" onClick={() => setFaqOpen(false)}>Close</button></header>
      <section><b>Backend Editor</b><p>Upload or register GLBs, edit names/descriptions, review conversion status, attach metadata, prepare sponsor lanes, and later build protected presentation edits.</p></section>
      <section><b>Blink Nodes</b><p>Nodes are learned specialty algorithms. Paid access or 5+ days of real activity can unlock stronger autoplay lanes built from searches, notes, reactions, API discoveries, and saved GLBs.</p></section>
      <section><b>AutoPlay Showcase</b><p>AutoPlay opens the renderer, waits for assets, speaks in stages, rotates through related feeds, and can bridge categories while keeping the presentation moving.</p></section>
      <section><b>Growing In The System</b><p>Search real topics, play GLBs, save notes, react with voice/text, publish useful links, and add verified models to storage. Better history plus higher tier plus unlocked nodes improves feed quality.</p></section>
      <a href="/faq">Open full FAQ</a>
    </aside>}

    <nav className="dh-system-footer" aria-label="Important DigitalHut pages">
      <a href="/about">About Us</a>
      <a href="/privacy">Privacy</a>
      <a href="/contact">Contact</a>
      <a href="/guardian">Guardian</a>
      <a href="/faq">FAQ</a>
    </nav>

    {entryOpen && <section className="dh-entry"><div className="dh-entry-panel">{entryLoading ? <><div className="dh-logo">DigitalHut</div><div className="dh-load"><span /></div><p>Loading your observatory system</p></> : <><p className="dh-eyebrow">Choose profile</p><h2 className="dh-welcome">Welcome!</h2><input className="dh-entry-input" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Username Account" /><div className="dh-account-grid">{accounts.map((item) => <button key={item} className={`dh-btn ${tier === item ? "active" : ""}`} onClick={() => enter(item)}>{item.toUpperCase()}</button>)}</div><div className="dh-wallet"><ConnectButton /></div><p className="dh-entry-small">Guest and wallet-connected users get unlimited viewing and AutoPlay. Paid tiers expand saved history, storage, backend controls, nodes, and deep research.</p></>}</div></section>}
  </main>
}
