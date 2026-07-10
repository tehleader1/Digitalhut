import React, {useEffect, useRef, useState} from "react"
import {ConnectButton} from "../wallet"
import {useAccount, useSendTransaction, useWaitForTransactionReceipt} from "wagmi"
import {parseEther} from "viem"
import {inferCategoryByVector} from "../lib/assetVectorMath"
import {firecudaAssetsForCategory, firecudaLibraryStatus, firecudaLocalFallbackUrl, firecudaModelPool, firecudaUrl} from "../lib/firecudaLibraryManifest"
import {loadModelViewer} from "../lib/modelViewerRuntime"
import {originalLongTailKeywordsFor, seoBacklinkBrief, seoNarrationLine, seoRevenueFrameFor, seoRunnerProofPosts, seoUsefulnessLaneFor} from "../lib/seoContentEngine"
import {digitalhutMasterListBridge, digitalhutSourceBridgePath, masterListBridgePixel} from "../lib/digitalhutMasterListBridge"
import {applySystemPerformanceProfile, getSystemPerformanceProfile} from "../lib/systemPerformanceProfile"
import PodcastMatchPanel from "./PodcastMatchPanel"
import "./FullscreenObservatory.css"
import "./FullscreenObservatory.api.css"
import "./FullscreenObservatory.sequence.css"
import "./FullscreenObservatory.mechanic.css"

const INACTIVITY_MS = 8 * 60 * 1000
const AI_WINDOW_MS = 12 * 60 * 60 * 1000
const DEMO_WELCOME_RESET_MS = 90 * 60 * 1000
const PRESENTATION_IDLE_MS = 14000
const PREVIEW_COMMENTARY_MS = 10000
const demoWelcomeStorageKey = "digitalhut:lastAutoDemoWelcomeAt"
const assetReviewStorageKey = "digitalhut:assetReviews"
const DIGITALHUT_MAIN_WALLET = "0x3121FbFB683B9147913f336b05eF419b875a7590"
const DIGITALHUT_BASE_ETH_RECEIVER = import.meta.env?.VITE_DIGITALHUT_ETH_BASE_RECEIVER || import.meta.env?.VITE_DIGITALHUT_PAYMENT_RECEIVER || DIGITALHUT_MAIN_WALLET
const DIGITALHUT_BASE_USDC_RECEIVER = import.meta.env?.VITE_DIGITALHUT_USDC_BASE_RECEIVER || ""
const DIGITALHUT_BASE_ETH_AMOUNT = import.meta.env?.VITE_DIGITALHUT_PAYMENT_ETH_AMOUNT || ""
const AI_TIER_LIMITS = {guest: Infinity, standard: Infinity, premium: Infinity, pro: Infinity}
const STORAGE_TIER_LIMITS = {guest: 12, standard: 50, premium: 500, pro: Infinity}
const PRESENTATION_NARRATOR_ENABLED = false
const accounts = ["guest", "standard", "premium", "pro"]
const layers = ["Base", "Architect", "Lighting", "Props", "Grid", "Coordinates"]
const mobilityModes = [
  {id: "Road", query: "live road traffic construction weather vehicle environment"},
  {id: "Air Travel", query: "airport delay visibility diversion public travel environment"},
  {id: "Marine", query: "marine harbor coastal weather travel environment"},
  {id: "Rail", query: "rail station transit delay public feed environment"}
]
const documentaryTimeline = [
  {at: 0, id: "opening", label: "Opening", stage: 0, feedOffset: 0, cue: "open", media: "DigitalHut intro sound"},
  {at: 14, id: "preview", label: "GLB Preview", stage: 0, feedOffset: 0, cue: "rotate", media: "Renderer preview play"},
  {at: 30, id: "source", label: "Source Pull", stage: 1, feedOffset: 0, cue: "bridge", media: "Thumbnail and source cross-reference"},
  {at: 46, id: "detail", label: "Angle Detail", stage: 2, feedOffset: 0, cue: "rotate", media: "Camera angle and environment pass"},
  {at: 64, id: "podcast", label: "Podcast Clip", stage: 3, feedOffset: 0, cue: "bridge", media: "Podcast/audio bridge"},
  {at: 82, id: "video", label: "Video Bridge", stage: 1, feedOffset: 1, cue: "open", media: "Video/source media bridge"},
  {at: 100, id: "next", label: "Next Model", stage: 0, feedOffset: 1, cue: "open", media: "Next GLB chapter"}
]
const bridgeFlow = ["DigitalHut Presentation", "Mainstream Streaming", "Mobility", "Orbital Compute", "Gamer", "Planetary", "Programmer", "Workforce", "Researcher", "Science", "History", "Businesses", "Real Estate", "Continent", "Political"]
const liveFeedStorageKey = "digitalhut:liveGlbFeed"
const directorChatStorageKey = "digitalhut:directorChatHistory"
const customContentAnalyzerStorageKey = "digitalhut:customContentAnalyzer"
const youtubeQuotaCooldownStorageKey = "digitalhut:youtubeQuotaCooldownUntil"
const youtubeQuotaCooldownMs = 6 * 60 * 60 * 1000

function proofSlug(value = ""){
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "digitalhut"
}

function proofPostForLiveLane({category = "", feed, query = "", keywords = []} = {}){
  const categorySlug = proofSlug(category)
  const haystack = `${category} ${feed?.title || ""} ${query} ${keywords.join(" ")}`.toLowerCase()
  return seoRunnerProofPosts.find((post) => proofSlug(post.category) === categorySlug && (post.keywords || []).some((keyword) => haystack.includes(String(keyword).toLowerCase().split(" ").slice(0, 2).join(" "))))
    || seoRunnerProofPosts.find((post) => proofSlug(post.category) === categorySlug)
    || seoRunnerProofPosts.find((post) => (post.keywords || []).some((keyword) => haystack.includes(String(keyword).toLowerCase().split(" ").slice(0, 2).join(" "))))
    || seoRunnerProofPosts[0]
}

function platformCadenceFor({category, episodePreviews = [], youtubeSearch = {}, youtubeStory = {}, contentAnalyzer = {}, proofPost = {}, proofLinks = [], presentationLive = false, autoPresent = false, podcastFeatureOpen = false, currentMarketActive = false, runtimeState = {}, activeStock = {}} = {}){
  const liveApi = String(youtubeSearch?.status || "").includes("api-live") || episodePreviews.some((item) => item.contentFit === "api matched")
  const quotaProtected = Boolean(youtubeSearch?.quotaProtected) || String(youtubeSearch?.status || "").toLowerCase().includes("quota")
  const videoCount = Math.max(episodePreviews.length, Number(youtubeStory?.videoCount) || 0)
  const analyzerStatus = contentAnalyzer?.analysis ? "topic packet live" : contentAnalyzer?.configured === false ? "metadata fallback" : contentAnalyzer?.status || "metadata read"
  const pace = !runtimeState.online ? "offline hold"
    : runtimeState.visible === false ? "background hold"
      : podcastFeatureOpen ? "podcast interrupt"
        : currentMarketActive ? "market sync"
          : autoPresent && presentationLive ? "live shuffle"
            : "category lock"
  const queueMode = liveApi ? "api fresh"
    : quotaProtected ? "quota-safe cache"
      : videoCount ? "storyboard cache"
        : "seed queue"
  const proofTarget = proofPost?.keywords?.[0] || proofPost?.title || category
  const stockLabel = activeStock?.symbol ? `${activeStock.symbol} market lane` : "market lane standby"
  const lanes = [
    {id: "queue", label: "Queue", value: `${videoCount || episodePreviews.length || 0} picks`, detail: `${queueMode} / ${category}`},
    {id: "proof", label: "Proof", value: proofTarget, detail: proofLinks.map((item) => item.label).join(" + ") || "category/watch/blog"},
    {id: "timing", label: "Timing", value: pace, detail: presentationLive ? "video, GLB, podcast, proof stay paced" : "waits for play"},
    {id: "analyzer", label: "Analyzer", value: analyzerStatus, detail: youtubeStory?.primaryVideo?.channelTitle || youtubeStory?.provider || "source metadata"},
    {id: "market", label: "Market", value: currentMarketActive ? stockLabel : "compact teaser", detail: currentMarketActive ? "chart, video, podcast, GLB" : "routes only when clicked"}
  ]
  return {
    mode: queueMode,
    pace,
    liveApi,
    quotaProtected,
    lanes
  }
}

function searchIntentSuggestionsFor({category, proofPost = {}, liveLongTailKeywords = [], quickMarketOptionPicks = [], activeStock = {}, youtubeStory = {}, feed = {}} = {}){
  const marketSymbol = activeStock?.symbol || quickMarketOptionPicks?.[0]?.symbol || ""
  const candidates = [
    proofPost?.keywords?.[0],
    liveLongTailKeywords?.[0],
    youtubeStory?.contentRadar?.primary ? `${youtubeStory.contentRadar.primary} visual research` : "",
    feed?.title ? `${feed.title} 3D source map` : "",
    category ? `${category} 2026 visual experience` : "",
    marketSymbol ? `${marketSymbol} market video observatory` : ""
  ].filter(Boolean)
  return Array.from(new Set(candidates.map((item) => String(item).trim()).filter(Boolean))).slice(0, 4)
}

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

function timelineChapterFor(progress){
  const value = Number(progress) || 0
  return [...documentaryTimeline].reverse().find((chapter) => value >= chapter.at) || documentaryTimeline[0]
}

function documentaryTitle(category, tier = "guest"){
  const titleMap = {
    Gamer: "3D MMO RPG Gamer Presentation",
    Planetary: "Exotic Environment Observatory Documentary",
    "Orbital Compute": "Orbital Internet And Space Infrastructure Feature",
    Researcher: "Researcher Evidence And Environment Presentation",
    Science: "Science Field Study 3D Documentary",
    Programmer: "Developer Renderer And API Systems Presentation",
    "Real Estate": "Real Estate 3D Opportunity Walkthrough",
    "Mainstream Streaming": "Mainstream 3D Culture Feed Episode",
    Businesses: "Business District 3D Market Feature",
    History: "Historical Environment 3D Documentary"
  }
  const base = titleMap[category] || `${category} DigitalHut Presentation`
  return tier === "pro" ? `${base} - Pro Source Cut` : tier === "premium" ? `${base} - Premium Cut` : base
}

function chapterCaption({chapter, category, feed, tier, source}){
  const title = feed?.title || "current 3D asset"
  const provider = source || feed?.apiSource || feed?.apiStatus || "DigitalHut source stack"
  const detail = tier === "pro"
    ? "Pro view tracks source quality, download path, backlink value, and node progress."
    : tier === "premium"
      ? "Premium view compares category context, source confidence, and related node value."
      : "Free view keeps the visual sequence open and easy to follow."
  if(chapter.id === "opening") return `DigitalHut episode opens with an original intro sound and ${title} as the first rendered scene.`
  if(chapter.id === "preview") return `GLB preview play: ${title} becomes the active renderer scene while the soundtrack and UI pulse confirm playback.`
  if(chapter.id === "source") return `Source pull: ${provider}. The episode cross-references thumbnail, category, model source, and public feed context.`
  if(chapter.id === "detail") return `Angle detail: checking camera movement, scale, surface, category fit, and presentation value. ${detail}`
  if(chapter.id === "podcast") return `Podcast bridge: short clips, artwork, and sound effects add context while the GLB remains the main visual.`
  if(chapter.id === "video") return `Video bridge: source video or external media supports the next scene instead of replacing the renderer.`
  return `Next model: closing this chapter and moving the series toward another related GLB.`
}

const verifiedLocalGlbFallbacks = {
  "DigitalHut Presentation": ["/models/environments/presentation-stage.glb", "/models/environments/mainstream-feed.glb", "/models/environments/business-district.glb"],
  Mobility: ["/models/environments/airport-delay.glb", "/models/environments/orlando-traffic.glb", "/models/environments/public-works.glb"],
  Continent: ["/models/environments/continent-city.glb", "/models/environments/history-district.glb", "/models/environments/business-district.glb"],
  Planetary: ["/models/environments/planetary-hub.glb", "/models/environments/research-lab.glb", "/models/environments/science-voyage.glb"],
  "Orbital Compute": ["/models/environments/planetary-hub.glb", "/models/environments/presentation-stage.glb", "/models/environments/research-lab.glb"],
  Gamer: ["/models/environments/gaming-world.glb", "/models/environments/mainstream-feed.glb", "/models/environments/presentation-stage.glb"],
  "Real Estate": ["/models/environments/real-estate-island.glb", "/models/environments/business-district.glb", "/models/environments/continent-city.glb"],
  Workforce: ["/models/environments/workforce-site.glb", "/models/environments/public-works.glb", "/models/environments/business-district.glb"],
  Political: ["/models/environments/public-works.glb", "/models/environments/continent-city.glb", "/models/environments/history-district.glb"],
  Programmer: ["/models/environments/presentation-stage.glb", "/models/environments/research-lab.glb", "/models/environments/business-district.glb"],
  "Mainstream Streaming": ["/models/environments/mainstream-feed.glb", "/models/environments/undersea-media.glb", "/models/environments/presentation-stage.glb"],
  Researcher: ["/models/environments/research-lab.glb", "/models/environments/science-voyage.glb", "/models/environments/planetary-hub.glb"],
  Science: ["/models/environments/science-voyage.glb", "/models/environments/research-lab.glb", "/models/environments/undersea-media.glb"],
  History: ["/models/environments/history-district.glb", "/models/environments/continent-city.glb", "/models/environments/public-works.glb"],
  Businesses: ["/models/environments/business-district.glb", "/models/environments/mainstream-feed.glb", "/models/environments/presentation-stage.glb"]
}

function verifiedLocalGlbFor(category, index = 0){
  const pool = verifiedLocalGlbFallbacks[category] || verifiedLocalGlbFallbacks["DigitalHut Presentation"]
  return pool[index % pool.length]
}

function relatedGlb(category, index = 0){
  const pool = firecudaModelPool(category)
  return pool.length ? pool[index % pool.length] : verifiedLocalGlbFor(category, index)
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
  return candidates.find((candidate) => isDirectRenderableModel(candidate) && !String(candidate).startsWith("/models/") && !isLikelyBrokenStorageUrl(candidate)) || ""
}

function exactRenderableModelUrl(feed = {}){
  const candidates = [
    feed.sourceModelUrl,
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
    feed.statsModelUrl,
    feed.downloadUrl,
    feed.download_url
  ].map(cleanUrl).filter(Boolean)
  return candidates.find((candidate) => isDirectRenderableModel(candidate) && !isLikelyBrokenStorageUrl(candidate)) || ""
}

function providerEmbedUrl(feed = {}){
  return cleanUrl(feed.sourceEmbedUrl || feed.embedUrl || feed.embed_url || feed.viewerEmbedUrl || feed.viewer_embed_url || "")
}

function verifiedBackupModelUrl(feed = {}, category = "", index = 0){
  return cleanUrl(feed.fallbackModelUrl || relatedGlb(feed.category || category || "", index))
}

function sortRendererFeeds(items){
  return [...items].sort((a, b) => {
    const scoreA = a.renderPriority ?? (isDirectRenderableModel(a.modelUrl) ? 70 : 10)
    const scoreB = b.renderPriority ?? (isDirectRenderableModel(b.modelUrl) ? 70 : 10)
    return scoreB - scoreA
  })
}

function hashFreshSeed(value){
  const source = String(value || "")
  let hash = 2166136261
  for(let index = 0; index < source.length; index += 1){
    hash ^= source.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash >>> 0)
}

function freshOffsetFor(length, seed, key = ""){
  if(!length) return 0
  return (hashFreshSeed(`${seed || 0}:${key}`) % length + length) % length
}

function rotateFreshList(items, seed, key = ""){
  const list = Array.isArray(items) ? items.filter(Boolean) : []
  if(list.length <= 1) return list
  const offset = freshOffsetFor(list.length, seed, key)
  return [...list.slice(offset), ...list.slice(0, offset)]
}

function sessionFreshnessSeed(){
  const randomPart = typeof crypto !== "undefined" && crypto.getRandomValues
    ? crypto.getRandomValues(new Uint32Array(1))[0]
    : Math.floor(Math.random() * 1000000)
  return Math.abs(Math.floor(Date.now() + randomPart))
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

function autoplayEmbedUrl(value){
  const source = cleanUrl(value)
  if(!source) return ""
  try {
    const url = new URL(source, typeof window !== "undefined" ? window.location.href : "https://digitalhut.app")
    if(url.hostname.includes("sketchfab.com")){
      url.searchParams.set("autostart", "1")
      url.searchParams.set("autospin", ".18")
      url.searchParams.set("ui_theme", "dark")
      url.searchParams.set("ui_infos", "0")
      url.searchParams.set("ui_watermark", "0")
      return url.toString()
    }
  } catch {}
  return source
    .replace("autostart=0", "autostart=1")
    .replace("autospin=0", "autospin=.18")
}

function readStorage(key, fallback = ""){
  if(typeof window === "undefined") return fallback
  return window.localStorage.getItem(key) || fallback
}

function writeStorage(key, value){
  if(typeof window === "undefined") return
  window.localStorage.setItem(key, value)
}

function youtubeQuotaCooldownRemaining(){
  const until = Number(readStorage(youtubeQuotaCooldownStorageKey, "0") || 0)
  return Math.max(0, until - Date.now())
}

function rememberYoutubeQuotaCooldown(retryAfterMs = youtubeQuotaCooldownMs){
  const boundedMs = Math.max(15 * 60 * 1000, Math.min(youtubeQuotaCooldownMs, Number(retryAfterMs) || youtubeQuotaCooldownMs))
  writeStorage(youtubeQuotaCooldownStorageKey, String(Date.now() + boundedMs))
}

function safeAssetSlug(value){
  return String(value || "digitalhut-asset")
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72) || "digitalhut-asset"
}

function assetReviewKey(feed){
  return safeAssetSlug(feed?.id || feed?.title || feed?.modelUrl || feed?.viewerUrl || feed?.embedUrl)
}

function readAssetReviews(){
  if(typeof window === "undefined") return {}
  try {
    return JSON.parse(window.localStorage.getItem(assetReviewStorageKey) || "{}")
  } catch {
    return {}
  }
}

function writeAssetReviews(reviews){
  if(typeof window === "undefined") return
  window.localStorage.setItem(assetReviewStorageKey, JSON.stringify(reviews))
}

function backlinkForFeed(feed){
  const origin = typeof window === "undefined" ? "https://www.digitalhut.app" : window.location.origin
  return `${origin}/asset/${assetReviewKey(feed)}`
}

function cleanSpeechText(text){
  return String(text || "")
    .replace(/https?:\/\/\S+/g, "source link attached")
    .replace(/[A-Z]:\\[^\s]+/g, "local asset path")
    .replace(/\/[\w./-]+\.(glb|bin|jpg|png|webp|mp4)/gi, "asset file")
    .replace(/\s+/g, " ")
    .trim()
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

const currentMarketStocks = [
  {symbol: "NVDA", company: "NVIDIA", exchange: "NASDAQ", lane: "AI chips", aliases: ["nvidia", "gpu", "graphics card", "ai chip"], video: "NVIDIA stock AI data center market analysis 2026", podcast: "NVIDIA AI chip market podcast interview", glb: "AI data center stock exchange 3D environment"},
  {symbol: "TSLA", company: "Tesla", exchange: "NASDAQ", lane: "EV robotics", aliases: ["tesla", "electric vehicle", "elon"], video: "Tesla stock EV robotics market analysis 2026", podcast: "Tesla EV robotics market podcast", glb: "electric vehicle factory stock market 3D environment"},
  {symbol: "AAPL", company: "Apple", exchange: "NASDAQ", lane: "consumer tech", aliases: ["apple", "iphone", "vision pro"], video: "Apple stock product ecosystem market analysis 2026", podcast: "Apple consumer technology market podcast", glb: "consumer technology retail stock market 3D environment"},
  {symbol: "MSFT", company: "Microsoft", exchange: "NASDAQ", lane: "cloud AI", aliases: ["microsoft", "azure", "copilot"], video: "Microsoft stock cloud AI market analysis 2026", podcast: "Microsoft cloud AI market podcast", glb: "cloud server campus stock market 3D environment"},
  {symbol: "AMD", company: "AMD", exchange: "NASDAQ", lane: "semiconductors", aliases: ["amd", "ryzen", "radeon"], video: "AMD stock semiconductor GPU market analysis 2026", podcast: "AMD semiconductor market podcast", glb: "semiconductor lab stock market 3D environment"},
  {symbol: "AMZN", company: "Amazon", exchange: "NASDAQ", lane: "commerce cloud", aliases: ["amazon", "aws", "ecommerce"], video: "Amazon stock AWS commerce market analysis 2026", podcast: "Amazon AWS commerce market podcast", glb: "warehouse cloud logistics stock market 3D environment"},
  {symbol: "META", company: "Meta", exchange: "NASDAQ", lane: "social AI", aliases: ["meta", "facebook", "instagram", "reels"], video: "Meta stock social media AI market analysis 2026", podcast: "Meta social media AI market podcast", glb: "social media data hub stock market 3D environment"},
  {symbol: "GOOGL", company: "Alphabet", exchange: "NASDAQ", lane: "search cloud", aliases: ["google", "alphabet", "youtube", "gemini"], video: "Alphabet Google YouTube AI stock market analysis 2026", podcast: "Google AI search cloud market podcast", glb: "search engine cloud campus stock market 3D environment"},
  {symbol: "AVGO", company: "Broadcom", exchange: "NASDAQ", lane: "network chips", aliases: ["broadcom", "avgo", "network chip"], video: "Broadcom stock AI networking chip market analysis 2026", podcast: "Broadcom networking chips market podcast", glb: "network chip data center stock market 3D environment"},
  {symbol: "NFLX", company: "Netflix", exchange: "NASDAQ", lane: "streaming media", aliases: ["netflix", "streaming", "media"], video: "Netflix stock streaming ads market analysis 2026", podcast: "Netflix streaming media market podcast", glb: "streaming studio stock market 3D environment"}
]

function resolveCurrentMarketStock(value){
  const source = String(value || "").trim()
  const direct = tickerFromSearch(source)
  const lower = compactTopic(source).toLowerCase()
  const bySymbol = direct ? currentMarketStocks.find((item) => item.symbol === direct) : null
  if(bySymbol) return bySymbol
  const byText = currentMarketStocks.find((item) => {
    const pool = [item.symbol, item.company, item.lane, ...(item.aliases || [])].map((entry) => String(entry).toLowerCase())
    return pool.some((entry) => entry && (lower === entry || lower.includes(entry)))
  })
  if(byText) return byText
  return direct ? {symbol: direct, company: direct, exchange: "NASDAQ", lane: "custom ticker", aliases: [direct], video: `${direct} stock market analysis 2026`, podcast: `${direct} stock market podcast`, glb: "stock exchange data center 3D environment"} : null
}

function marketStockFor(value){
  return resolveCurrentMarketStock(value) || currentMarketStocks[0]
}

function currentMarketVideoPhraseFor(stock){
  return compactTopic(stock?.video || `${stock?.company || stock?.symbol || "stock"} market analysis 2026`)
}

function currentMarketPodcastPhraseFor(stock){
  return compactTopic(stock?.podcast || `${stock?.company || stock?.symbol || "stock"} market podcast interview`)
}

function currentMarketGlbPhraseFor(stock){
  return compactTopic(stock?.glb || `${stock?.company || stock?.symbol || "stock"} exchange data center 3D environment`)
}

function tradingViewWidgetUrl(stock){
  const symbol = `${stock?.exchange || "NASDAQ"}:${stock?.symbol || "NVDA"}`
  const params = new URLSearchParams({
    symbol,
    interval: "15",
    range: "1D",
    hidetoptoolbar: "0",
    symboledit: "1",
    saveimage: "0",
    toolbarbg: "rgba(15,23,42,1)",
    theme: "dark",
    style: "1",
    timezone: "America/New_York",
    locale: "en"
  })
  return `https://s.tradingview.com/widgetembed/?${params.toString()}`
}

function decorateCurrentMarketFeed(feed, stock, payload = {}, optionsPayload = null){
  const activeStock = marketStockFor(stock?.symbol || stock?.company || feed?.market?.symbol || payload?.symbol)
  const chartUrl = tradingViewWidgetUrl(activeStock)
  const videoPhrase = currentMarketVideoPhraseFor(activeStock)
  const podcastPhrase = currentMarketPodcastPhraseFor(activeStock)
  const glbPhrase = currentMarketGlbPhraseFor(activeStock)
  const existingMarket = feed?.market || {}
  return {
    ...feed,
    title: `${activeStock.symbol} ${activeStock.company} Current Market Observatory`,
    note: `${feed?.note || `${activeStock.symbol} market data is loading.`} DigitalHut connects a TradingView chart, company video radar, market podcast, and stock-environment GLB to the same presentation lane.`,
    query: videoPhrase,
    category: "Businesses",
    icon: "CM",
    accent: "#bef264",
    context: `Current Market: ${activeStock.company} / ${activeStock.exchange} / ${activeStock.lane}`,
    thumbnail: stockUrl("Businesses", 1),
    modelUrl: feed?.modelUrl || relatedGlb("Businesses", 0),
    apiStatus: payload?.configured === false ? "market-provider-waiting" : "current-market-live",
    apiSource: payload?.source || feed?.apiSource || "Alpha/FMP/Polygon market data",
    market: {
      ...existingMarket,
      symbol: activeStock.symbol,
      stockName: activeStock.company,
      exchange: activeStock.exchange,
      lane: activeStock.lane,
      chartUrl,
      videoPhrase,
      podcastPhrase,
      glbPhrase,
      top10: currentMarketStocks.map((item) => ({symbol: item.symbol, company: item.company, lane: item.lane})),
      optionsSummary: existingMarket.optionsSummary || optionsPayload?.summary || "",
      sourceProvider: payload?.source || feed?.apiSource || ""
    },
    providerMix: Array.from(new Set([...(feed?.providerMix || []), "TradingView chart", "YouTube company video", "market podcast", "Sketchfab/Cesium GLB"])),
    tags: Array.from(new Set([...(feed?.tags || []), "current market", "stock", "chart", activeStock.symbol, activeStock.company]))
  }
}

function currentMarketHighlightsFor({feed, stock, youtubeStory, podcastClip, glbFeed, providerLine, progress = 0, clock = 0}){
  const activeStock = marketStockFor(stock?.symbol || feed?.market?.symbol || feed?.title)
  const market = feed?.market || {}
  const windows = Array.isArray(market.windows) ? market.windows : []
  const latest = [...windows].reverse().find((item) => Number(item.tradeCount || item.printCount || 0) > 0) || windows[0] || {}
  const largest = latest?.largestPrints?.[0]
  const topBuy = latest?.biggestInferredBuys?.[0]
  const topSell = latest?.biggestInferredSells?.[0]
  const tradeCount = Number(latest.tradeCount || latest.printCount || 0)
  const volume = Number(latest.totalVolume || 0)
  const notional = Number(latest.totalNotional || 0)
  const pressure = latest.pressure || market.pressure || "market read building"
  const totalLine = notional ? `$${Math.round(notional).toLocaleString()} notional` : volume ? `${volume.toLocaleString()} shares` : market.notional || "waiting for provider print"
  const provider = market.sourceProvider || feed?.apiSource || providerLine || "market provider"
  const chartStatus = market.chartUrl ? "TradingView chart attached" : "chart loading"
  const strengthBase = Math.max(18, Math.min(96, Math.round(Number(progress) || 0)))
  return [
    {
      id: "quote",
      label: `${activeStock.symbol} market transcript`,
      value: activeStock.company,
      detail: `${activeStock.exchange} / ${activeStock.lane} / ${provider}`,
      tone: "market",
      fill: Math.max(42, strengthBase)
    },
    {
      id: "pressure",
      label: "Pressure read",
      value: pressure,
      detail: `${tradeCount.toLocaleString()} prints / ${totalLine}`,
      tone: pressure.toLowerCase().includes("sell") ? "sell" : pressure.toLowerCase().includes("buy") ? "buy" : "market",
      fill: Math.max(36, Math.min(99, tradeCount ? 58 + (tradeCount % 38) : strengthBase))
    },
    {
      id: "largest",
      label: "Largest visible print",
      value: largest ? `${Number(largest.size || 0).toLocaleString()} @ $${largest.price}` : "print forming",
      detail: largest ? `${activeStock.symbol} largest trade window` : "waiting for quote window detail",
      tone: "chart",
      fill: largest ? 88 : Math.max(24, strengthBase - 12)
    },
    {
      id: "buy-sell",
      label: "Buy / sell contrast",
      value: topBuy ? `Buy ${Number(topBuy.size || 0).toLocaleString()}` : topSell ? `Sell ${Number(topSell.size || 0).toLocaleString()}` : "contrast building",
      detail: topSell ? `Sell side ${Number(topSell.size || 0).toLocaleString()} @ $${topSell.price}` : "sell pressure pending",
      tone: "flow",
      fill: topBuy || topSell ? 82 : Math.max(28, strengthBase - 8)
    },
    {
      id: "chart",
      label: "Chart renderer",
      value: chartStatus,
      detail: `${activeStock.symbol} 1D / 15m stock view`,
      tone: "chart",
      fill: market.chartUrl ? 92 : Math.max(26, strengthBase)
    },
    {
      id: "video",
      label: "Connected video radar",
      value: youtubeStory?.primaryVideo?.title || youtubeStory?.topic || currentMarketVideoPhraseFor(activeStock),
      detail: youtubeStory?.primaryVideo?.channelTitle || "YouTube company lane",
      tone: "video",
      fill: youtubeStory?.primaryVideo ? 86 : Math.max(28, strengthBase - 4)
    },
    {
      id: "podcast",
      label: "Connected podcast",
      value: podcastClip?.title || currentMarketPodcastPhraseFor(activeStock),
      detail: podcastClip?.channel || "market podcast lane",
      tone: "podcast",
      fill: podcastClip?.title ? 78 : Math.max(22, strengthBase - 16)
    },
    {
      id: "glb",
      label: "Stock environment GLB",
      value: glbFeed?.title || currentMarketGlbPhraseFor(activeStock),
      detail: glbFeed?.apiSource || "Sketchfab/Cesium/verified DigitalHut environment",
      tone: "glb",
      fill: glbFeed?.modelUrl || glbFeed?.embedUrl ? 90 : Math.max(30, strengthBase - 10)
    }
  ].map((item, index) => ({
    ...item,
    order: index,
    pulse: Math.round(((Number(clock) || 0) + index * 13) % 100)
  }))
}

function marketDirectionFor(candidate = {}, index = 0){
  const value = `${candidate.directionalPressure || ""} ${candidate.side || ""} ${candidate.contract || ""}`.toLowerCase()
  if(/bear|put|sell|ask/.test(value)) return "bearish"
  if(/bull|call|buy|bid/.test(value)) return "bullish"
  return index % 2 ? "bearish" : "bullish"
}

function quickMarketOptionPicksFor({feed, stock, freshSeed = 0}){
  const activeStock = marketStockFor(stock?.symbol || feed?.market?.symbol || feed?.title)
  const windows = Array.isArray(feed?.market?.optionsWindows) ? feed.market.optionsWindows : []
  const candidates = windows.flatMap((windowItem) => [
    ...(windowItem.largestPrints || []),
    ...(windowItem.randomBigBuys || []),
    ...(windowItem.randomBigSells || [])
  ])
    .filter((item) => item?.contract)
    .map((item, index) => ({
      id: `${item.contract}-${index}`,
      symbol: activeStock.symbol,
      company: activeStock.company,
      contract: item.contract,
      direction: marketDirectionFor(item, index),
      value: item.premium ? `$${Math.round(item.premium).toLocaleString()} premium` : `${Number(item.size || 0).toLocaleString()} contracts`,
      detail: `${item.directionalPressure || item.side || "option pressure"} / ${item.price ? `$${item.price}` : "price waiting"}`,
      raw: item,
      live: true
    }))
    .sort((a, b) => (Number(b.raw?.premium || 0) + Number(b.raw?.size || 0)) - (Number(a.raw?.premium || 0) + Number(a.raw?.size || 0)))
    .slice(0, 3)
  if(candidates.length) return candidates
  return rotateFreshList(currentMarketStocks, freshSeed, `${activeStock.symbol}:quick-option-fallback`)
    .slice(0, 3)
    .map((item, index) => ({
      id: `quick-market-${item.symbol}`,
      symbol: item.symbol,
      company: item.company,
      contract: `${item.symbol} volume radar`,
      direction: marketDirectionFor({contract: index % 2 ? "PUT" : "CALL"}, index),
      value: item.lane,
      detail: "Click to open Market view and load live stock/option context",
      raw: null,
      live: false
    }))
}

const blinkQuickNodes = [
  {id: "stellar", title: "Stellar", category: "Planetary", minimumDays: 5, paid: "$250/year or $20/month", detail: "Cosmic, orbital compute, planetary GLB feeds"},
  {id: "real-estate-genius", title: "Genius Real Estate", category: "Real Estate", minimumDays: 5, paid: "$250/year or $20/month", detail: "International housing and market presentation feeds"},
  {id: "pro-gamer", title: "Pro Gamer", category: "Gamer", minimumDays: 5, paid: "$250/year or $20/month", detail: "Game-world, 360 visuals, and creator-safe feeds"}
]

const purchaseOptionsBase = [
  {id: "tier-standard", type: "tier", title: "Standard", price: "$12/month", unlock: "Longer saved history, core AI Director controls, category growth tracking"},
  {id: "tier-premium", type: "tier", title: "Premium", price: "$25/month", unlock: "Premium AI detail, stronger session memory, node progress visibility"},
  {id: "tier-pro", type: "tier", title: "Pro", price: "$60/month", unlock: "Deep research, expanded backend controls, unlimited AI presentation power"},
  {id: "treasury-support", type: "support", title: "Support DigitalHut", price: "open amount", unlock: "General treasury support for renderer uptime, SEO tests, and FireCuda asset work"},
  {id: "sponsor-lane", type: "sponsor", title: "Sponsor Lane", price: "quoted", unlock: "Attach a subtle sponsor line, backlink, contest prompt, or category feature to a verified presentation"},
  {id: "asset-commission", type: "commission", title: "Commission 3D Asset", price: "quoted", unlock: "Fund a real-world environment capture, GLB cleanup, thumbnail, and DigitalHut asset page"},
  {id: "conversion-credit", type: "conversion", title: "Conversion Credit", price: "quoted", unlock: "Backend conversion, optimization, thumbnail generation, and metadata preparation"},
  {id: "research-report", type: "report", title: "Paid Observatory Report", price: "quoted", unlock: "Custom 3D report lane for real estate, science, travel, market, or public-situation research"},
  {id: "asset-license", type: "license", title: "Asset License", price: "quoted", unlock: "License or promote a verified DigitalHut GLB, thumbnail, backlink, or presentation package"},
  ...blinkQuickNodes.map((item) => ({
    id: `node-${item.id}`,
    type: "node",
    title: item.title,
    price: item.paid,
    unlock: item.detail,
    category: item.category
  }))
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

function tickerFromSearch(text){
  const value = String(text || "").trim().toUpperCase()
  const cleaned = value.replace(/^\$|NYSE:|NASDAQ:|S&P500:|SP500:/gi, "").trim()
  const direct = cleaned.match(/^[A-Z]{1,5}$/)
  if(direct) return direct[0]
  const tagged = value.match(/\b(?:NYSE|NASDAQ|S&P500|SP500|TICKER|STOCK)\s*[: ]\s*([A-Z]{1,5})\b/)
  if(tagged) return tagged[1]
  const dollar = value.match(/\$([A-Z]{1,5})\b/)
  return dollar ? dollar[1] : ""
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

function marketFlowFeed(payload, optionsPayload = null){
  const symbol = payload?.symbol || "MARKET"
  const latest = [...(payload?.windows || [])].reverse().find((item) => item.tradeCount > 0) || payload?.windows?.[0]
  const largest = latest?.largestPrints?.[0]
  const biggestBuy = latest?.biggestInferredBuys?.[0]
  const biggestSell = latest?.biggestInferredSells?.[0]
  const latestOptions = [...(optionsPayload?.windows || [])].reverse().find((item) => item.printCount > 0) || optionsPayload?.windows?.[0]
  const optionCandidate = latestOptions?.largestPrints?.[0] || latestOptions?.randomBigBuys?.[0] || latestOptions?.randomBigSells?.[0] || null
  const pressure = latest?.pressure || "market-flow-pending"
  const notional = latest?.totalNotional ? `$${Math.round(latest.totalNotional).toLocaleString()}` : "notional pending"
  return {
    id: `market-flow:${symbol}:${payload?.checkedAt || Date.now()}`,
    title: `${symbol} Market Flow Insight`,
    note: payload?.configured === false
      ? payload.message
      : `${payload?.summary || `${symbol} market-flow window loaded.`} ${optionsPayload?.summary || ""} Largest print: ${largest ? `${largest.size.toLocaleString()} shares at $${largest.price}` : "pending"}. Biggest inferred buy: ${biggestBuy ? `${biggestBuy.size.toLocaleString()} shares` : "pending"}. Biggest inferred sell: ${biggestSell ? `${biggestSell.size.toLocaleString()} shares` : "pending"}.`,
    query: symbol,
    category: "Businesses",
    icon: "MF",
    accent: "#22c55e",
    context: "NYSE, Nasdaq, S&P 500 ticker trade-flow intelligence",
    thumbnail: stockUrl("Businesses", 1),
    embedUrl: "",
    modelUrl: relatedGlb("Businesses", 0),
    viewerUrl: "",
    apiSource: payload?.source || "Alpaca Market Data API",
    apiStatus: payload?.configured === false ? "alpaca-not-configured" : "trade-flow-insight",
    market: {
      symbol,
      summary: payload?.summary || "",
      pressure,
      notional,
      windows: payload?.windows || [],
      optionsWindows: optionsPayload?.windows || [],
      optionsSummary: optionsPayload?.summary || "",
      optionCandidate,
      selectedContract: optionsPayload?.selectedContract || optionCandidate?.contract || "",
      disclaimer: payload?.disclaimer || "Buy/sell pressure is inferred. Public data does not identify individual traders."
    },
    providerMix: ["Alpaca", "DigitalHut market-flow"],
    tags: ["stock", "ticker", "NYSE", "Nasdaq", "S&P500", "market flow", symbol]
  }
}

function optionCandidateFromFeed(feed = {}){
  const windows = feed.market?.optionsWindows || []
  const candidates = windows.flatMap((item) => [
    ...(item.largestPrints || []),
    ...(item.randomBigBuys || []),
    ...(item.randomBigSells || [])
  ]).filter((item) => item?.contract)
  return candidates.sort((a, b) => (b.premium || 0) - (a.premium || 0))[0] || feed.market?.optionCandidate || null
}

async function resolveMarketFlow(symbol){
  const [stockResult, optionsResult] = await Promise.allSettled([
    fetchWithTimeout(`/api/market-flow?symbol=${encodeURIComponent(symbol)}`, {headers: {Accept: "application/json"}}, 7000),
    fetchWithTimeout(`/api/options-flow?symbol=${encodeURIComponent(symbol)}`, {headers: {Accept: "application/json"}}, 9000)
  ])
  if(stockResult.status !== "fulfilled" || !stockResult.value.ok) throw new Error(`Market flow returned ${stockResult.status === "fulfilled" ? stockResult.value.status : "network-error"}`)
  const payload = await stockResult.value.json()
  let optionsPayload = null
  if(optionsResult.status === "fulfilled" && optionsResult.value.ok){
    optionsPayload = await optionsResult.value.json()
  }
  return {payload, optionsPayload, feed: marketFlowFeed(payload, optionsPayload)}
}

async function resolveOptionContractFlow(symbol, contract){
  const response = await fetchWithTimeout(`/api/options-flow?symbol=${encodeURIComponent(symbol)}&contract=${encodeURIComponent(contract)}`, {headers: {Accept: "application/json"}}, 9000)
  if(!response.ok) throw new Error(`Options contract flow returned ${response.status}`)
  return await response.json()
}

function speak(text){
  if(!PRESENTATION_NARRATOR_ENABLED) return
  if(typeof window === "undefined" || !("speechSynthesis" in window)) return
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(cleanSpeechText(text))
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
  if(tickerFromSearch(text)) return "Businesses"
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
  const ticker = tickerFromSearch(text)
  if(ticker) return ticker
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

function concisePresentationLine({feed, category, stage}){
  const source = feed.apiSource || feed.apiStatus || "DigitalHut source"
  const stageLine = stage?.label ? `I am using the ${stage.label} view.` : "I am holding the main view."
  return `${feed.title} is active in ${category}. ${stageLine} Source status is ${source}. I will keep this moving if the renderer idles.`
}

function tierAssetDescription({feed, category, stage, tier = "guest", nodeTitle = ""}){
  const source = feed.apiSource || feed.apiStatus || "DigitalHut source"
  const available = feed.modelUrl || feed.viewerUrl || feed.embedUrl ? "available for preview" : "waiting for a verified renderer link"
  const worldHint = feed.location || feed.region || feed.country || (category === "Real Estate" ? "the selected housing market" : category === "Planetary" ? "the observatory sector" : "this category lane")
  const nodeLine = nodeTitle || (category === "Gamer" ? "Pro Gamer Node" : category === "Real Estate" ? "Genius Real Estate Node" : category === "Planetary" || category === "Orbital Compute" ? "Stellar Node" : "DigitalHut category progress")
  if(category === "Researcher"){
    if(tier === "pro") return `Researcher Pro read: ${feed.title} is ${available}. I am checking visible structure, source status, evidence clues, and angle details. Tell me what details you need and I will format them into the Researcher note panel.`
    if(tier === "premium") return `Researcher Premium read: ${feed.title} is ${available}. I am identifying what the researcher may be looking at: shape, surface clues, environment context, and source confidence. What detail should I focus on?`
    return `Researcher Standard read: this is ${feed.title}. It exists in the feed so you can inspect the asset, ask what it represents, and save basic notes.`
  }
  if(tier === "pro"){
    return `Pro read: ${feed.title} is ${available}. I am reading close detail in ${stage.label}, checking download and preview value, and this session can earn stronger points toward ${nodeLine} if viewers rate, review, save, or backlink the asset. Source: ${source}.`
  }
  if(tier === "premium"){
    return `Premium read: ${feed.title} is ${available} in ${worldHint}. It connects to ${nodeLine}, so strong viewing, notes, ratings, and category shuffling can improve that node path. Source: ${source}.`
  }
  return `Standard read: this is ${feed.title}. It exists because DigitalHut found it as a playable observatory asset for ${category}. Source: ${source}.`
}

function assetIdentificationWorkflow({feed, category, tier}){
  const proLine = tier === "pro"
    ? "Your Pro lane can save a deeper research note, prepare database metadata, track download status, and score the asset toward the matching node."
    : "Upgrade to Pro when you want database-ready metadata, download checks, source verification, and higher node scoring."
  const premiumLine = tier === "premium" || tier === "pro"
    ? "Premium identification is active: I can describe the asset, category, likely world context, node connection, and researcher questions."
    : "Premium is the first tier for stronger identification: asset description, world context, node connection, and guided questions."
  return `Best workflow for ${feed.title}: first identify what the asset represents, then tag category ${category}, source, preview type, download availability, location or world context, and node relevance. ${premiumLine} ${proLine}`
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
  const base = seoNarrationLine({category, feed, stageLabel: stage.label})
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
  return <div className={`dh-mini-visual ${feed.thumbnail ? "has-thumb" : ""} ${active ? "active" : ""}`} style={{"--accent": feed.accent, borderColor: active ? feed.accent : undefined}} data-dh-thumbnail-render="quick-feed-thumbnail" data-dh-category={feed.category || feed.type || ""} data-dh-asset-id={feed.id || feed.title || ""}>
    {feed.thumbnail && <img className="dh-mini-thumb" src={feed.thumbnail} alt={`${feed.title || "DigitalHut"} thumbnail preview for a 3D render`} loading="lazy" />}
    <SceneObject feed={feed} compact />
    <div className="dh-mini-scan" />
  </div>
}

function GlbModelPreview({feed = {}, modelUrl = "", active = false, title = "DigitalHut GLB preview"}){
  const fallbackSource = relatedGlb(feed.category || feed.type || "DigitalHut Presentation", 0) || verifiedLocalGlbFor("DigitalHut Presentation", 0)
  const source = cleanUrl(modelUrl || bestRenderableModelUrl(feed) || fallbackSource)
  return <div className={`dh-glb-model-preview ${source ? "has-model" : "no-model"} ${active ? "active" : ""}`} style={{"--accent": feed.accent || "#67e8f9"}} data-dh-glb-preview={source || "fallback-scene-object"}>
    {source ? <model-viewer
      src={source}
      alt={title}
      auto-rotate="true"
      camera-controls="true"
      interaction-prompt="none"
      loading="lazy"
      reveal="auto"
      exposure="1"
      shadow-intensity=".7"
      camera-orbit="35deg 62deg 2.8m"
    /> : <model-viewer
      src={verifiedLocalGlbFor("DigitalHut Presentation", 0)}
      alt={`${title} verified local GLB fallback`}
      auto-rotate="true"
      camera-controls="true"
      interaction-prompt="none"
      loading="lazy"
      reveal="auto"
      exposure="1"
      shadow-intensity=".7"
      camera-orbit="35deg 62deg 2.8m"
    />}
    <span aria-hidden="true" />
  </div>
}

function analyticsToneHex(tone = "source"){
  const palette = {
    episode: "#67e8f9",
    views: "#bef264",
    link: "#facc15",
    source: "#38bdf8",
    sponsor: "#f59e0b",
    podcast: "#a78bfa",
    objects: "#34d399",
    time: "#e0f2fe"
  }
  return palette[tone] || palette.source
}

function smoothProducerStep(value){
  const clamped = Math.max(0, Math.min(1, value))
  return clamped * clamped * (3 - 2 * clamped)
}

function BabylonAnalyticsEngine({mode = "map", nodes = [], progress = 0, active = false, title = "DigitalHut analytics renderer"}){
  const canvasRef = useRef(null)
  const latestRef = useRef({nodes, progress, active})

  useEffect(() => {
    latestRef.current = {nodes, progress, active}
  }, [nodes, progress, active])

  useEffect(() => {
    if(!canvasRef.current) return undefined
    let disposed = false
    let engine
    let scene
    let resizeHandler
    let renderFrame

    async function loadAnalyticsScene(){
      try {
        if(!hasWebGlSupport()) return
        const [
          {Engine},
          {Scene},
          {ArcRotateCamera},
          {Vector3},
          {Color3, Color4},
          {HemisphericLight},
          {MeshBuilder},
          {StandardMaterial}
        ] = await Promise.all([
          import("@babylonjs/core/Engines/engine.js"),
          import("@babylonjs/core/scene.js"),
          import("@babylonjs/core/Cameras/arcRotateCamera.js"),
          import("@babylonjs/core/Maths/math.vector.js"),
          import("@babylonjs/core/Maths/math.color.js"),
          import("@babylonjs/core/Lights/hemisphericLight.js"),
          import("@babylonjs/core/Meshes/meshBuilder.js"),
          import("@babylonjs/core/Materials/standardMaterial.js")
        ])
        if(disposed || !canvasRef.current) return
        engine = createBabylonEngine(Engine, canvasRef.current)
        scene = new Scene(engine)
        scene.clearColor = new Color4(0, 0, 0, 0)
        const camera = new ArcRotateCamera(`dh-analytics-camera-${mode}`, Math.PI / 2, Math.PI / 2.7, mode === "timeline" ? 7.2 : 6.4, Vector3.Zero(), scene)
        camera.inputs.clear()
        new HemisphericLight(`dh-analytics-light-${mode}`, new Vector3(0, 1, 0), scene).intensity = .95
        const centerMaterial = new StandardMaterial(`dh-analytics-center-mat-${mode}`, scene)
        centerMaterial.diffuseColor = Color3.FromHexString("#facc15")
        centerMaterial.emissiveColor = Color3.FromHexString("#facc15").scale(.32)
        centerMaterial.alpha = .78
        const center = MeshBuilder.CreateSphere(`dh-analytics-center-${mode}`, {diameter: .34, segments: 16}, scene)
        center.material = centerMaterial
        const nodeSlots = Array.from({length: 8}, (_, index) => {
          const material = new StandardMaterial(`dh-analytics-node-mat-${mode}-${index}`, scene)
          material.diffuseColor = Color3.FromHexString("#67e8f9")
          material.emissiveColor = Color3.FromHexString("#67e8f9").scale(.24)
          material.alpha = 0
          const mesh = mode === "timeline"
            ? MeshBuilder.CreateBox(`dh-analytics-node-${mode}-${index}`, {width: .58, height: .2, depth: .58}, scene)
            : MeshBuilder.CreateSphere(`dh-analytics-node-${mode}-${index}`, {diameter: .38, segments: 14}, scene)
          mesh.material = material
          const line = MeshBuilder.CreateLines(`dh-analytics-link-${mode}-${index}`, {points: [Vector3.Zero(), Vector3.Zero()], updatable: true}, scene)
          line.color = Color3.FromHexString("#67e8f9")
          mesh.isVisible = false
          line.isVisible = false
          return {mesh, material, line}
        })
        const bars = Array.from({length: 5}, (_, index) => {
          const material = new StandardMaterial(`dh-analytics-bar-mat-${mode}-${index}`, scene)
          material.diffuseColor = Color3.FromHexString("#bef264")
          material.emissiveColor = Color3.FromHexString("#bef264").scale(.2)
          material.alpha = .65
          const bar = MeshBuilder.CreateBox(`dh-analytics-bar-${mode}-${index}`, {width: 1, height: .08, depth: .12}, scene)
          bar.material = material
          bar.position = new Vector3(-2.4 + index * 1.2, -1.55, mode === "timeline" ? -.55 : 1.05)
          return {bar, material}
        })

        function nodePosition(item, index, count){
          if(mode === "timeline"){
            const total = Math.max(1, count - 1)
            return new Vector3(-3 + (index / total) * 6, -.45 + ((Number(item?.fill) || 0) / 100) * .5, 0)
          }
          if(item && Number.isFinite(Number(item.x)) && Number.isFinite(Number(item.y))){
            return new Vector3((Number(item.x) - 50) / 14, ((Number(item.fill) || 0) - 50) / 150, (50 - Number(item.y)) / 14)
          }
          const angle = (index / Math.max(1, count)) * Math.PI * 2 + (mode === "objects" ? .5 : 0)
          const radius = mode === "objects" ? 1.75 : 2.05
          return new Vector3(Math.cos(angle) * radius, ((Number(item?.fill) || 0) - 50) / 130, Math.sin(angle) * radius)
        }

        renderFrame = () => {
          const now = performance.now() / 1000
          const latest = latestRef.current
          const incomingNodes = (latest.nodes || []).slice(0, nodeSlots.length)
          const cycleOffset = mode === "objects" ? 0 : mode === "map" ? .09 : .17
          const phase = ((now / 19) + cycleOffset) % 1
          const resetFade = phase > .82 ? Math.max(0, (1 - phase) / .18) : 1
          const globalBuild = latest.active ? Math.max(.08, Math.min(1, Number(latest.progress || 0) / 100)) : .12
          center.scaling.x = .75 + Math.sin(now * 1.7) * .08
          center.scaling.y = center.scaling.x
          center.scaling.z = center.scaling.x
          centerMaterial.alpha = latest.active ? .55 + resetFade * .35 : .2
          nodeSlots.forEach((slot, index) => {
            const item = incomingNodes[index]
            const start = index * .055
            const local = smoothProducerStep((phase - start) / .18)
            const amount = item ? Math.max(0, Math.min(1, local * resetFade * globalBuild)) : 0
            const visible = amount > .025
            slot.mesh.isVisible = visible
            slot.line.isVisible = visible
            if(!visible) return
            const position = nodePosition(item, index, incomingNodes.length || 1)
            const color = Color3.FromHexString(analyticsToneHex(item?.tone))
            const fill = Math.max(12, Math.min(100, Number(item?.fill) || 42))
            slot.mesh.position.x = position.x
            slot.mesh.position.y = position.y + Math.sin(now * 1.35 + index) * .04
            slot.mesh.position.z = position.z
            const scale = (.22 + fill / 170) * (.55 + amount * .65)
            slot.mesh.scaling.x = mode === "timeline" ? scale * 1.35 : scale
            slot.mesh.scaling.y = scale
            slot.mesh.scaling.z = scale
            slot.material.diffuseColor = color
            slot.material.emissiveColor = color.scale(.24 + amount * .28)
            slot.material.alpha = .18 + amount * .72
            slot.line = MeshBuilder.CreateLines(`dh-analytics-link-${mode}-${index}-update`, {points: [Vector3.Zero(), slot.mesh.position.clone()], instance: slot.line})
            slot.line.color = color
            slot.line.alpha = .12 + amount * .4
          })
          bars.forEach((slot, index) => {
            const item = incomingNodes[index]
            const fill = Math.max(0.05, Math.min(1, (Number(item?.fill) || Number(latest.progress) || 35) / 100))
            const amount = Math.max(.08, resetFade * globalBuild)
            slot.bar.isVisible = Boolean(item)
            slot.bar.scaling.x = fill * 1.1 * amount
            slot.bar.scaling.y = .8 + amount * .5
            slot.material.diffuseColor = Color3.FromHexString(analyticsToneHex(item?.tone))
            slot.material.emissiveColor = slot.material.diffuseColor.scale(.18)
            slot.material.alpha = .2 + amount * .55
          })
          scene?.render()
        }
        engine.runRenderLoop(renderFrame)
        resizeHandler = () => engine?.resize()
        window.addEventListener("resize", resizeHandler)
      } catch {
        scene?.dispose()
        engine?.dispose()
      }
    }

    loadAnalyticsScene()
    return () => {
      disposed = true
      if(resizeHandler) window.removeEventListener("resize", resizeHandler)
      if(engine && renderFrame) engine.stopRenderLoop(renderFrame)
      scene?.dispose()
      engine?.dispose()
    }
  }, [mode])

  return <canvas ref={canvasRef} className={`dh-babylon-analytics-engine mode-${mode}`} aria-label={title} />
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

function streamAnalyticsFor({category, chapter, feed, progress, visualReady, livePosts, speed}){
  const metrics = liveMetricsFor(category, livePosts.length + Math.floor((Number(progress) || 0) / 12))
  const chapterWeight = chapter.id === "podcast" ? 1.22 : chapter.id === "video" ? 1.18 : chapter.id === "preview" ? 1.15 : 1
  const pace = Math.max(1, Number(speed) || 1) * chapterWeight
  return {
    metrics,
    pace,
    renderState: visualReady ? "GLB synced" : "GLB buffering",
    videoState: chapter.id === "video" ? "video bridge live" : chapter.id === "preview" ? "preview stream" : "visual stream",
    podcastState: chapter.id === "podcast" ? "podcast special moment" : "podcast matched",
    sourceState: feed?.apiSource || feed?.apiStatus || "DigitalHut source",
    title: feed?.title || "DigitalHut scene"
  }
}

function compactTopic(value){
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/[^\w\s'-]/g, "")
    .trim()
}

function titleCaseWords(value){
  return String(value || "")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.length <= 3 && word === word.toUpperCase() ? word : word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function topicKeywordTokens(value, limit = 5){
  const stopWords = new Set(["the", "and", "for", "with", "from", "this", "that", "into", "about", "what", "watching", "video", "youtube", "digitalhut", "visual", "experience", "2026", "best", "new", "top"])
  const tokens = compactTopic(value)
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.replace(/^['-]+|['-]+$/g, ""))
    .filter((token) => token.length > 2 && !stopWords.has(token))
  return [...new Set(tokens)].slice(0, limit)
}

function extractRankSignals(value){
  const text = String(value || "")
  const lower = text.toLowerCase()
  const topMatch = lower.match(/\btop\s+(\d{1,3})\b/)
  const focusMatches = [...lower.matchAll(/\b(?:rank|spot|place|number|no|#|top)\s*\.?\s*(\d{1,3})\b/g)]
    .map((match) => Number(match[1]))
    .filter((number) => Number.isFinite(number) && number > 0)
  const allNumbers = [...lower.matchAll(/\b(\d{1,3})(?:st|nd|rd|th)?\b/g)]
    .map((match) => Number(match[1]))
    .filter((number) => Number.isFinite(number) && number > 0)
  const topCount = topMatch ? Number(topMatch[1]) : 0
  const focusRank = focusMatches.find((number) => number !== topCount) || allNumbers.find((number) => number !== topCount) || 0
  return {
    topCount,
    focusRank,
    label: topCount ? `Top ${topCount}${focusRank ? ` / focus #${focusRank}` : ""}` : focusRank ? `Focus #${focusRank}` : "No rank detected"
  }
}

function sourceConfidenceFromTokens(sourceTitle, tokens){
  const lower = String(sourceTitle || "").toLowerCase()
  const matches = tokens.filter((token) => lower.includes(token)).length
  return Math.max(34, Math.min(96, Math.round((matches / Math.max(1, tokens.length)) * 78 + 18)))
}

function compactEvidenceValue(value, fallback = "waiting"){
  const text = compactTopic(value || fallback)
  return text.length > 78 ? `${text.slice(0, 75)}...` : text
}

function structuredIntelMapFor({story, category, feed, meaning, backlinkRadar, glbDock, progress, confidence, sceneLightPulse}){
  const sourceTitle = story?.primaryVideo?.title || ""
  const requestedTopic = compactTopic(story?.topic || feed?.query || feed?.title || category || "DigitalHut observatory")
  const rawTitle = compactTopic(`${requestedTopic} ${sourceTitle || ""}`) || "DigitalHut observatory"
  const lower = rawTitle.toLowerCase()
  const tokens = topicKeywordTokens(`${requestedTopic} ${sourceTitle} ${story?.searchPhrase || ""}`, 8)
  const rankSignals = extractRankSignals(`${requestedTopic} ${sourceTitle} ${story?.searchPhrase || ""}`)
  const brands = ["asus", "nvidia", "amd", "intel", "msi", "gigabyte", "sapphire", "evga", "zotac", "pny", "asrock", "powercolor", "apple", "samsung", "sony", "tesla", "ford", "toyota"]
  const detectedBrand = brands.find((brand) => lower.includes(brand))
  const brandName = detectedBrand ? detectedBrand.toUpperCase() : titleCaseWords(tokens[0] || category || "Topic")
  const isGpu = /graphics card|gpu|rtx|radeon|geforce|asus|nvidia|amd/.test(lower)
  const isRealEstate = /real estate|house|housing|property|listing|agency|resort|vacation|home/.test(lower) || category === "Real Estate"
  const isStudy = /study|research|coral|climate|traffic|planet|animal|extinction|science|data/.test(lower) || category === "Researcher" || category === "Science"
  const sourceHost = story?.primaryVideo?.channelTitle || backlinkRadar?.links?.[0]?.label || "YouTube/search source"
  const glbTitle = glbDock?.[0]?.feed?.title || feed?.title || `${rawTitle} 3D context`
  const sourceMatch = sourceConfidenceFromTokens(`${sourceTitle} ${sourceHost}`, tokens)
  const viewsLine = story?.primaryVideo?.viewCount ? `${Number(story.primaryVideo.viewCount).toLocaleString()} views` : "view count waiting"
  const videoTitles = (story?.videos || []).slice(0, 3).map((video, index) => ({
    id: `clip-${index}`,
    label: `clip ${index + 1}`,
    value: compactEvidenceValue(video.title || `${requestedTopic} result`),
    note: compactEvidenceValue(video.channelTitle || "channel waiting", "channel waiting")
  }))
  const sourceEvidence = [
    {id: "request", label: "Detected Ask", value: compactEvidenceValue(requestedTopic), note: "from search/topic input"},
    {id: "source", label: "Primary Source", value: compactEvidenceValue(sourceTitle || `${requestedTopic} search`), note: sourceHost},
    {id: "rank", label: "Rank Pattern", value: rankSignals.label, note: rankSignals.topCount || rankSignals.focusRank ? "number extracted from title/search" : "no list/rank phrase found"},
    {id: "counts", label: "Public Signals", value: viewsLine, note: story?.apiStatus || "YouTube status waiting"},
    ...videoTitles
  ].slice(0, 7)
  let headline = `${titleCaseWords(rawTitle)} Read`
  let status = `Reading ${titleCaseWords(requestedTopic)} from title, source, ranking words, entities, and current episode stage.`
  let nodes = [
    {id: "input", x: 13, y: 19, code: "input.parse", label: "Topic Parser", value: titleCaseWords(tokens.slice(0, 2).join(" ") || requestedTopic), detail: `Input terms: ${tokens.slice(0, 5).join(", ") || requestedTopic}`, tone: "video", fill: Math.max(28, Math.round(progress || 0))},
    {id: "source", x: 44, y: 16, code: "source.match", label: "Source Match", value: `${sourceMatch}%`, detail: sourceTitle || `${requestedTopic} search results waiting`, tone: "source", fill: sourceMatch},
    {id: "entity", x: 76, y: 19, code: "entity.lock", label: "Entity Lock", value: brandName, detail: detectedBrand ? `${brandName} detected directly in the title/search.` : "No brand lock yet; reading topic tokens.", tone: "ai", fill: detectedBrand ? 86 : 58},
    {id: "rank", x: 79, y: 68, code: "rank.logic", label: "Rank/List Logic", value: rankSignals.label, detail: rankSignals.topCount ? `List has a top-${rankSignals.topCount} structure${rankSignals.focusRank ? ` with #${rankSignals.focusRank} focus.` : "."}` : "No numbered ranking detected yet.", tone: "glb", fill: rankSignals.topCount ? 88 : 42},
    {id: "verify", x: 43, y: 78, code: "verify.queue", label: "Verification Queue", value: "facts separated", detail: "The map marks extracted title/source data separately from inferred watch notes.", tone: "podcast", fill: confidence},
    {id: "model", x: 16, y: 69, code: "glb.support", label: "3D Support", value: "context model", detail: glbTitle, tone: "glb", fill: glbDock?.[0]?.active ? 82 : 60}
  ]
  let bars = [
    {id: "source-match", label: "title match", value: sourceMatch},
    {id: "confidence", label: "read build", value: confidence},
    {id: "motion", label: "episode", value: Math.max(22, Math.round(progress || 0))},
    {id: "source", label: "backlinks", value: backlinkRadar?.lanes?.find((lane) => lane.id === "seo")?.strength || 62}
  ]
  let comparisonRows = [
    {id: "subject", left: "subject", center: titleCaseWords(tokens.slice(0, 3).join(" ") || requestedTopic), right: "from title/search"},
    {id: "source", left: "source", center: sourceHost, right: `${sourceMatch}% title match`},
    {id: "visual", left: "visual", center: meaning?.label || "live read", right: meaning?.videoCue || "frame cue"},
    {id: "model", left: "3D", center: compactEvidenceValue(glbTitle), right: glbDock?.[0]?.active ? "attached" : "support lane"}
  ]
  let entities = [
    {id: "topic", label: "topic", value: titleCaseWords(tokens[0] || requestedTopic)},
    {id: "category", label: "category", value: category},
    {id: "source", label: "source", value: sourceHost},
    {id: "rank", label: "rank", value: rankSignals.label}
  ]

  if(isGpu){
    headline = `${brandName} Graphics Card Observatory`
    status = `${rankSignals.label}: separating source title, brand/entity, list position, spec categories, and viewer fit.`
    nodes = [
      {id: "video", x: 13, y: 16, code: "video.source", label: "Video Source", value: `${sourceMatch}%`, detail: sourceTitle || `${requestedTopic} search`, tone: "video", fill: sourceMatch},
      {id: "ranking", x: 43, y: 14, code: "rank.grid", label: "Ranking Grid", value: rankSignals.label, detail: rankSignals.topCount ? `Build ${rankSignals.topCount} slots and track ${rankSignals.focusRank ? `slot #${rankSignals.focusRank}` : "the active slot"}.` : "Waiting for a top-list phrase.", tone: "ai", fill: rankSignals.topCount ? 90 : 48},
      {id: "brand", x: 76, y: 18, code: "brand.entity", label: `${brandName} Entity`, value: detectedBrand ? "detected" : "inferred", detail: detectedBrand ? `${brandName} appears in the video/search language.` : "Brand is not explicit; using topic tokens.", tone: "glb", fill: detectedBrand ? 86 : 58},
      {id: "specs", x: 82, y: 64, code: "spec.matrix", label: "Spec Matrix", value: "VRAM / power / heat", detail: "Specs are categories to watch for; exact values require the video/source to state them.", tone: "source", fill: 82},
      {id: "fit", x: 48, y: 81, code: "viewer.fit", label: "Viewer Fit", value: "gamer / creator", detail: "Map checks whether the card is for FPS gaming, 3D work, streaming, or budget value.", tone: "podcast", fill: Math.max(42, Math.round((progress || 0) * .8))},
      {id: "proof", x: 16, y: 67, code: "proof.wall", label: "Proof Wall", value: "no fake specs", detail: "Only title/channel/counts are confirmed. Model names and benchmarks stay pending until sourced.", tone: "source", fill: 76}
    ]
    bars = [
      {id: "ranking", label: "rank grid", value: rankSignals.topCount ? 90 : 44},
      {id: "brand", label: brandName.slice(0, 8), value: detectedBrand ? 86 : 58},
      {id: "specs", label: "specs", value: 82},
      {id: "source", label: "source", value: sourceMatch},
      {id: "viewer", label: "fit", value: Math.max(35, Math.round(progress || 0))}
    ]
    comparisonRows = [
      {id: "rank", left: "ranking", center: rankSignals.label, right: rankSignals.topCount ? "extracted" : "waiting"},
      {id: "brand", left: "brand", center: brandName, right: detectedBrand ? "source term" : "inferred"},
      {id: "vram", left: "VRAM", center: "memory capacity lane", right: "needs video/source"},
      {id: "power", left: "power", center: "watts/PSU lane", right: "needs spec source"},
      {id: "thermal", left: "thermal", center: "cooling/noise lane", right: "needs review data"},
      {id: "fit", left: "viewer", center: "gamer / creator / budget", right: "analysis lane"}
    ]
    entities = [
      {id: "domain", label: "domain", value: "graphics cards"},
      {id: "brand", label: "brand", value: brandName},
      {id: "rank", label: "rank", value: rankSignals.label},
      {id: "metrics", label: "metrics", value: "VRAM / watts / heat"},
      {id: "viewer", label: "viewer", value: "gamer creator"}
    ]
  } else if(isRealEstate){
    headline = "Real Estate Visual Observatory"
    status = "Reading location, property model, buyer intent, agency proof, and market context."
    nodes[1] = {...nodes[1], code: "property.model", label: "Property Model", value: "3D listing", detail: "Layout, location, price pressure, travel access, and agency trust are grouped."}
    nodes[3] = {...nodes[3], code: "tour.context", label: "Tour Context", value: "walkthrough", detail: glbTitle}
  } else if(isStudy){
    headline = "Research Study Visual Map"
    status = "Reading evidence, study year, subject, public data, and what still needs verification."
    nodes[1] = {...nodes[1], code: "study.subject", label: "Study Subject", value: titleCaseWords(tokens.slice(0, 2).join(" ") || "Research"), detail: "The map separates observed media from verified study context."}
    nodes[2] = {...nodes[2], code: "evidence.lane", label: "Evidence Lane", value: "verify", detail: "Source proof is kept separate from visual interpretation."}
  }

  const loops = [
    {id: "parse", label: "parse", value: tokens.slice(0, 3).join(" / ") || requestedTopic},
    {id: "source", label: "source", value: sourceHost},
    {id: "rank", label: "structure", value: rankSignals.label},
    {id: "verify", label: "verify", value: "confirmed data vs inferred lanes"},
    {id: "model", label: "3D support", value: compactEvidenceValue(glbTitle)}
  ]
  const layers = [
    {id: "source", label: "Source Evidence", value: `${sourceMatch}%`},
    {id: "meaning", label: "Meaning Grid", value: `${confidence}%`},
    {id: "domain", label: "Domain Model", value: isGpu ? "GPU" : isRealEstate ? "Real Estate" : isStudy ? "Study" : category},
    {id: "light", label: "Visual Light", value: `${Math.round((sceneLightPulse || .5) * 100)}%`}
  ]
  return {headline, status, nodes, bars, loops, layers, evidenceRows: sourceEvidence, comparisonRows, entities}
}

function deterministicIndex(value, length){
  const text = String(value || "DigitalHut")
  const total = [...text].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return length ? total % length : 0
}

function episodeNameFor({category, topic, feed}){
  const pools = {
    Gamer: ["Server Build Heat Check", "Top Build War Room", "Patch Day Visual Run", "Boss Room Experience", "New Meta Observatory"],
    "Mainstream Streaming": ["Viral Clip Observatory", "Real Life Reel Route", "Trend Cutscene Report", "Social Feed Story Build", "Public Reaction Watch"],
    Researcher: ["Case Study Visual Engine", "Evidence Room 2026", "Research Signal Story", "Study Clip Observatory", "Data-To-Scene Report"],
    Science: ["Field Study Visual Engine", "Lab Clip Observatory", "Experiment Story Report", "Science Scene Breakdown", "Public Data Watch"],
    "Real Estate": ["Open House Observatory", "Agency Model Cut", "Listing Story Experience", "Housing Data Walkthrough", "Property Clip Report"],
    Programmer: ["Code Build Observatory", "Developer Episode Stack", "API-To-Renderer Cut", "Build Log Visual Run", "DApp Structure Story"],
    Planetary: ["Planetary Visual Report", "Orbit Story Experience", "Space Signal Cut", "Observatory Sector Episode", "Cosmic Data Walkthrough"],
    "Orbital Compute": ["Orbital Compute Cut", "Satellite Signal Story", "Space Internet Visual Report", "Infrastructure Orbit Run", "Compute Observatory Episode"],
    Businesses: ["Business Reel Observatory", "Sponsor Cutscene Report", "Storefront Visual Run", "Market District Episode", "Customer Flow Story"]
  }
  const pool = pools[category] || ["DigitalHut Observatory Experience", "Visual Story Run", "AI Guided Episode", "Search-To-Scene Report", "Live Feed Story"]
  const base = pool[deterministicIndex(`${category}:${topic}:${feed?.title || ""}`, pool.length)]
  return `${base}: ${compactTopic(topic || feed?.title || category)}`
}

const blockedYoutubeEmbedIds = new Set(["BTeoO9IFbB4"])

function youtubeVideoIdFor(video){
  return String(video?.videoId || video?.id || "").trim()
}

function isPlayableYoutubeVideo(video){
  const text = `${video?.title || ""} ${video?.description || ""}`.toLowerCase()
  const videoId = youtubeVideoIdFor(video)
  if(blockedYoutubeEmbedIds.has(videoId)) return false
  if(video?.embeddable === false) return false
  if(video?.privacyStatus && video.privacyStatus !== "public") return false
  if(video?.uploadStatus && video.uploadStatus !== "processed") return false
  if(video?.regionBlockedUS || video?.regionAllowedUS === false) return false
  if(text.includes("#shorts") || /\bshorts?\b/.test(text)) return false
  if(video?.liveBroadcastContent && video.liveBroadcastContent !== "none") return false
  if(video?.durationSeconds && video.durationSeconds < 60) return false
  return Boolean(video?.embedUrl || video?.videoId || video?.id)
}

function youtubeDirectEmbed(videoId){
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?rel=0`
}

function youtubeFallbackVideoFor(category){
  const fallbackByCategory = {
    "Planetary": "M7lc1UVf-VE",
    "Orbital Compute": "M7lc1UVf-VE",
    "Researcher": "M7lc1UVf-VE",
    "DigitalHut Presentation": "M7lc1UVf-VE"
  }
  return fallbackByCategory[category] || "M7lc1UVf-VE"
}

function trustedYoutubeEmbedUrl(video, category){
  const videoId = youtubeVideoIdFor(video)
  const fallback = youtubeDirectEmbed(youtubeFallbackVideoFor(category))
  if(!videoId || blockedYoutubeEmbedIds.has(videoId)) return fallback
  return video.embedUrl || youtubeDirectEmbed(videoId)
}

const seededYoutubePanelIds = ["M7lc1UVf-VE", "aqz-KE-bpKQ", "YE7VzlLtp-4", "dQw4w9WgXcQ"]

const seededYoutubePanelTopics = {
  "DigitalHut Presentation": ["DigitalHut observatory AI analytics presentation", "live GLB video podcast renderer workflow", "dapp video analytics visual system", "AI observatory product demo"],
  Mobility: ["airport travel delay visual observatory", "live traffic route analytics map", "harbor weather logistics visual report", "rail transit disruption data story"],
  Continent: ["global city culture visual experience", "coastal travel documentary data map", "amazon river study visual story", "europe old city history tour"],
  Planetary: ["NASA space exploration visual report", "moon surface observatory walkthrough", "mars terrain research visual experience", "orbital city data visualization"],
  "Orbital Compute": ["satellite internet orbital compute report", "space laser communication visual study", "edge compute infrastructure observatory", "space power technology breakdown"],
  Gamer: ["top gaming build visual experience", "new game update graphics showcase", "server build ranking observatory", "game world environment analysis"],
  "Real Estate": ["2026 real estate virtual tour model", "housing market 3D property walkthrough", "luxury resort property visual experience", "smart apartment listing analytics"],
  Workforce: ["construction jobsite safety visual report", "warehouse training workflow analysis", "city infrastructure operations story", "emergency response planning visualization"],
  Political: ["civic district public works visual report", "government building city map analysis", "policy impact local infrastructure story", "public square history civic tour"],
  Programmer: ["AI coding workflow visual breakdown", "developer API backend observatory", "DApp structure code analytics", "software build system data story"],
  "Mainstream Streaming": ["funny grocery reel analytics story", "viral social media reel observatory", "family vlog visual experience", "creator clip trend breakdown"],
  Researcher: ["coral reef study 2026 visual data", "animal extinction research visual report", "climate control study data story", "traffic study analytics visualization"],
  Science: ["science experiment visual breakdown", "field study data observatory", "lab research story visualization", "planetary science public data report"],
  History: ["ancient city timeline visual tour", "historic district archive walkthrough", "culture history documentary map", "ruins research visual experience"],
  Businesses: ["small business customer flow visual report", "sponsor stack market analytics", "storefront growth video breakdown", "local market trend observatory"]
}

function seededYoutubePanelVideosFor(category, topic = "", limit = 4, freshSeed = 0){
  const activeCategory = category || "Mainstream Streaming"
  const topicText = compactTopic(topic || activeCategory)
  const topicPool = seededYoutubePanelTopics[activeCategory] || seededYoutubePanelTopics["Mainstream Streaming"]
  const titles = rotateFreshList([topicText, ...topicPool], freshSeed, `${activeCategory}:${topicText}:videos`)
    .map((item) => compactTopic(item))
    .filter(Boolean)
    .filter((item, index, list) => list.findIndex((candidate) => candidate.toLowerCase() === item.toLowerCase()) === index)
    .slice(0, limit)
  const offset = freshOffsetFor(seededYoutubePanelIds.length, freshSeed || deterministicIndex(activeCategory, 100000), `${activeCategory}:${topicText}:youtube-id`)
  return titles.map((title, index) => {
    const videoId = seededYoutubePanelIds[(offset + index) % seededYoutubePanelIds.length]
    return {
      id: `seeded-youtube-${activeCategory}-${index}-${videoId}`,
      videoId,
      embedUrl: youtubeDirectEmbed(videoId),
      title,
      description: `${activeCategory} prefilled YouTube panel for DigitalHut Observatory content radar.`,
      channelTitle: "DigitalHut seeded YouTube panel",
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      thumbnails: {
        medium: {url: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`},
        high: {url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
      },
      embeddable: true,
      privacyStatus: "public",
      uploadStatus: "processed",
      liveBroadcastContent: "none",
      durationSeconds: 180,
      viewCount: 26000 + deterministicIndex(`${activeCategory}:${title}`, 240000),
      likeCount: 900 + deterministicIndex(`${title}:${activeCategory}`, 16000),
      publishedAt: "2026-01-01T00:00:00.000Z",
      apiStatus: "prefilled-youtube-panel",
      contentFit: "quota-safe storyboard",
      fitDetail: `${activeCategory} topic panel waiting for live YouTube API confirmation`
    }
  })
}

const contentRadarStopWords = new Set(["about", "after", "again", "also", "best", "from", "have", "into", "just", "like", "more", "most", "that", "the", "their", "then", "this", "with", "what", "when", "where", "which", "while", "will", "your", "you", "youtube", "video", "visual", "experience", "digitalhut", "official", "live", "full", "new", "top", "2026"])

function titleCaseRadarToken(value){
  return String(value || "").replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()).trim()
}

function youtubeContentRadarFor({video, topic, category, feed, searchPhrase, keywords = []}){
  const raw = [
    video?.title,
    video?.channelTitle,
    video?.description,
    feed?.title,
    topic,
    category,
    ...keywords
  ].filter(Boolean).join(" ")
  const tokenMatches = raw.toLowerCase().match(/[a-z0-9][a-z0-9+#.-]{2,}/g) || []
  const ranked = tokenMatches.reduce((map, token, index) => {
    const clean = token.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, "")
    if(clean.length < 3 || contentRadarStopWords.has(clean)) return map
    const current = map.get(clean) || {token: clean, count: 0, first: index}
    current.count += 1
    map.set(clean, current)
    return map
  }, new Map())
  const entities = [...ranked.values()]
    .sort((a, b) => b.count - a.count || a.first - b.first)
    .slice(0, 7)
    .map((item) => titleCaseRadarToken(item.token))
  const primary = entities[0] || compactTopic(video?.title || topic || category)
  const channel = video?.channelTitle || category
  const viewCount = Number(video?.viewCount || 0)
  const likeCount = Number(video?.likeCount || 0)
  const commentCount = Number(video?.commentCount || 0)
  return {
    primary,
    entities,
    channel,
    title: video?.title || searchPhrase,
    status: video ? "video topic locked" : "search topic fallback",
    focus: [primary, ...entities.slice(1, 3)].filter(Boolean).join(" / "),
    subjectLine: `${primary} from ${channel}`,
    signalLine: entities.slice(0, 4).join(" + ") || searchPhrase,
    metricLine: viewCount ? `${viewCount.toLocaleString()} views` : "metadata pending",
    engagementLine: likeCount || commentCount ? `${likeCount.toLocaleString()} likes / ${commentCount.toLocaleString()} comments` : "engagement pending"
  }
}

function usefulVideoReadFor({story, contentRadar, category, feed, seconds = 0, progress = 0, meaning, structuredIntelMap, backlinkRadar, confidence = 0, sourcePreviewHost = ""}){
  const video = story?.primaryVideo || {}
  const title = compactEvidenceValue(contentRadar?.title || video.title || story?.topic || feed?.title || category || "DigitalHut video", "DigitalHut video")
  const channel = compactEvidenceValue(contentRadar?.channel || video.channelTitle || story?.provider || "YouTube source", "YouTube source")
  const sourceText = `${title} ${channel} ${video.description || ""} ${story?.searchPhrase || ""} ${feed?.title || ""}`
  const entities = Array.isArray(contentRadar?.entities) && contentRadar.entities.length
    ? contentRadar.entities
    : topicKeywordTokens(sourceText, 7).map(titleCaseRadarToken)
  const rankSignals = extractRankSignals(sourceText)
  const segmentIndex = Math.max(0, Math.floor(Number(seconds || 0) / 18)) % 5
  const focus = compactEvidenceValue(entities[segmentIndex % Math.max(1, entities.length)] || contentRadar?.primary || story?.topic || category || "topic", "topic")
  const phaseLabels = ["Hook", "Context", "Evidence", "Comparison", "Action"]
  const phase = phaseLabels[segmentIndex] || "Read"
  const hasDescription = Boolean(video.description)
  const hasMetrics = Boolean(Number(video.viewCount || 0) || Number(video.likeCount || 0) || Number(video.commentCount || 0))
  const backlink = backlinkRadar?.links?.[segmentIndex % Math.max(1, backlinkRadar?.links?.length || 1)] || backlinkRadar?.links?.[0]
  const backlinkHost = (() => {
    try {
      return new URL(backlink?.url || "").hostname.replace(/^www\./, "")
    } catch {
      return sourcePreviewHost || "source lane"
    }
  })()
  const metricLine = contentRadar?.metricLine || (video.viewCount ? `${Number(video.viewCount).toLocaleString()} views` : "view count waiting")
  const engagementLine = contentRadar?.engagementLine || (video.likeCount ? `${Number(video.likeCount).toLocaleString()} likes` : "engagement waiting")
  const spokenSourceLine = hasDescription ? "semantic read: metadata now, spoken-audio analyzer plugs in next" : "semantic read: source metadata now, spoken-audio lane pending"
  const categoryUses = {
    Gamer: `Useful read: track the build, ranking, specs, creator claim, and next comparison for ${focus}.`,
    "Real Estate": `Useful read: turn the video into listing proof, buyer questions, location signals, and agency backlinks for ${focus}.`,
    Researcher: `Useful read: separate claim, evidence, method, source, and missing citation for ${focus}.`,
    Science: `Useful read: separate claim, evidence, method, source, and missing citation for ${focus}.`,
    Programmer: `Useful read: turn the video into architecture notes, dependencies, API terms, and implementation questions for ${focus}.`,
    Businesses: `Useful read: connect the video topic to sponsor fit, customer intent, source proof, and backlink action for ${focus}.`,
    "Mainstream Streaming": `Useful read: identify the subject, creator signal, trend angle, shareability, and sponsor/backlink fit for ${focus}.`
  }
  const currentRead = rankSignals.topCount
    ? `${phase} read at ${Math.round(seconds)}s: ${rankSignals.label} structure detected, watching ${focus} inside ${title}.`
    : `${phase} read at ${Math.round(seconds)}s: following ${focus} inside ${title}.`
  const confirmed = [
    `Title: ${title}`,
    `Source: ${channel}`,
    hasMetrics ? `${metricLine} / ${engagementLine}` : "public metrics pending"
  ]
  const inferred = [
    meaning?.label ? `Scene role: ${meaning.label}` : `Category: ${category}`,
    entities.length ? `Entities: ${entities.slice(0, 4).join(", ")}` : "entities building",
    backlink ? `Backlink route: ${backlink.title || backlinkHost}` : "backlink route building"
  ]
  const nextQuestion = rankSignals.topCount
    ? `Verify why ${focus} belongs in ${rankSignals.label.toLowerCase()} and what source proves it.`
    : `What claim about ${focus} should the viewer verify next?`
  return {
    productLine: "2026 Dapp Entertainment Observatory Research Hub",
    title,
    channel,
    focus,
    phase,
    entities,
    metricLine,
    engagementLine,
    currentRead,
    sourceBasis: hasDescription
      ? "basis: platform title, source, description, search result, public metrics, backlinks"
      : "basis: platform title, source, search result, public metrics, backlinks",
    confidenceLabel: confidence >= 78 ? "strong content lock" : confidence >= 58 ? "building context" : "needs audio source",
    confidence: Math.max(0, Math.min(100, Math.round(confidence || 0))),
    spokenSourceLine,
    confirmed,
    inferred,
    researchUse: categoryUses[category] || `Useful read: convert ${focus} into claims, sources, related links, and next viewer actions.`,
    nextQuestion,
    developerView: `Developer view: route ${focus} into map nodes, timeline events, GLB context, source proof, and reusable episode data.`,
    threeDPrompt: `3D object reader: build a visual model around ${focus}, ${entities.slice(1, 3).join(", ") || channel}, and the current ${phase.toLowerCase()} moment.`,
    backlinkTitle: backlink?.title || backlinkHost,
    backlinkUrl: backlink?.url || story?.searchUrl || "#",
    backlinkSignal: backlink?.signal || "related source lane",
    status: contentRadar?.status || story?.apiStatus || "content radar building",
    structuredStatus: structuredIntelMap?.status || "structured map building",
    progress: Math.max(0, Math.min(100, Math.round(progress || 0)))
  }
}

function analyzerUsefulReadFor(fallbackRead, contentAnalyzer){
  const analysis = contentAnalyzer?.analysis
  if(!analysis?.focus) return fallbackRead
  const backlinks = Array.isArray(analysis.backlinks) ? analysis.backlinks : []
  const objects = Array.isArray(analysis.threeDObjects) ? analysis.threeDObjects : []
  const entities = Array.isArray(analysis.entities) && analysis.entities.length ? analysis.entities : fallbackRead.entities
  const primaryBacklink = backlinks[0] || {}
  const primaryObject = objects[0] || {}
  const configured = Boolean(contentAnalyzer?.configured)
  const analyzerMode = contentAnalyzer?.mode || "metadata-only"
  const analyzerStatus = contentAnalyzer?.status || "content-analyzer-ready"
  return {
    ...fallbackRead,
    focus: compactEvidenceValue(analysis.focus, fallbackRead.focus),
    channel: compactEvidenceValue(analysis.channel, fallbackRead.channel),
    entities,
    currentRead: compactEvidenceValue(analysis.currentRead, fallbackRead.currentRead),
    sourceBasis: `basis: ${analysis.sourceBasis || fallbackRead.sourceBasis}`,
    confidenceLabel: analysis.confidenceLabel || fallbackRead.confidenceLabel,
    spokenSourceLine: configured
      ? `Google Speech lane ready / ${analyzerMode}`
      : `Google Speech key pending / ${analyzerMode} analyzer live`,
    researchUse: compactEvidenceValue(analysis.researchUse, fallbackRead.researchUse),
    nextQuestion: compactEvidenceValue(analysis.nextQuestion, fallbackRead.nextQuestion),
    developerView: compactEvidenceValue(analysis.developerView, fallbackRead.developerView),
    threeDPrompt: compactEvidenceValue(primaryObject.prompt, fallbackRead.threeDPrompt),
    backlinkTitle: compactEvidenceValue(primaryBacklink.label, fallbackRead.backlinkTitle),
    backlinkUrl: cleanUrl(primaryBacklink.url || fallbackRead.backlinkUrl || "#"),
    backlinkSignal: `${analyzerStatus} / ${analysis.sourceBasis || fallbackRead.backlinkSignal}`,
    status: analyzerStatus,
    structuredStatus: `backend analyzer: ${contentAnalyzer?.provider || "DigitalHut Content Analyzer"}`
  }
}

function podcastSearchPhraseFor({story, contentRadar, category}){
  const subject = compactTopic(contentRadar?.primary || story?.requestedTopic || story?.topic || category || "DigitalHut")
  const channelText = String(contentRadar?.channel || "")
  const channelLooksSeeded = /digitalhut|seeded|youtube panel|prefilled/i.test(channelText)
  const channel = channelText && channelText !== category && !channelLooksSeeded ? channelText : ""
  return compactTopic(`${subject} ${channel} podcast interview discussion episode`)
}

function podcastEpisodeCandidatesFor(podcastSearch){
  const episodes = Array.isArray(podcastSearch?.episodes) ? podcastSearch.episodes.filter((item) => item?.audioUrl || item?.pageUrl) : []
  return episodes
}

function podcastClipForStory({podcastSearch, youtubeStory, contentRadar, category, index = 0, freshSeed = 0}){
  const clips = rotateFreshList(podcastEpisodeCandidatesFor(podcastSearch), freshSeed, `${category}:${youtubeStory?.searchPhrase || ""}:podcasts`)
  const selectedIndex = clips.length ? ((Math.round(Number(index) || 0) % clips.length) + clips.length) % clips.length : 0
  const clip = clips[selectedIndex]
  const phrase = podcastSearch?.query || podcastSearchPhraseFor({story: youtubeStory, contentRadar, category})
  const podcastSearchUrl = `https://podcasts.apple.com/us/search?term=${encodeURIComponent(phrase)}`
  if(!clip){
    return {
      title: `${contentRadar?.primary || youtubeStory?.topic || category} podcast clip`,
      channel: "Apple Podcasts source match",
      status: podcastSearch?.status || "podcast-search-waiting",
      searchUrl: podcastSearchUrl,
      embedUrl: "",
      videoId: "",
      audioUrl: "",
      artwork: "",
      pageUrl: podcastSearchUrl,
      slot: "matching",
      provider: podcastSearch?.provider || "Apple Podcasts Search API",
      sourceType: "podcastSearch",
      isLivePodcast: false
    }
  }
  if(clip.audioUrl || clip.pageUrl){
    return {
      title: clip.title || phrase,
      channel: clip.show || clip.author || contentRadar?.channel || "Podcast source",
      status: podcastSearch?.status || "live-podcast-episode-ready",
      searchUrl: clip.pageUrl || podcastSearchUrl,
      embedUrl: "",
      videoId: "",
      audioUrl: clip.audioUrl || "",
      artwork: clip.artwork || "",
      pageUrl: clip.pageUrl || "",
      slot: `${selectedIndex + 1}/${clips.length}`,
      views: 0,
      likes: 0,
      description: clip.description || "",
      provider: podcastSearch?.provider || clip.source || "Apple Podcasts Search API",
      sourceType: "podcastEpisode",
      isLivePodcast: true,
      publishedAt: clip.publishedAt || "",
      durationMs: Number(clip.durationMs || 0)
    }
  }
  return {
    title: clip.title || phrase,
    channel: clip.show || clip.author || contentRadar?.channel || "Podcast source",
    status: "podcast-source-needs-audio",
    searchUrl: clip.pageUrl || podcastSearchUrl,
    embedUrl: "",
    videoId: "",
    audioUrl: "",
    artwork: clip.artwork || "",
    pageUrl: clip.pageUrl || podcastSearchUrl,
    slot: `${selectedIndex + 1}/${clips.length}`,
    views: 0,
    likes: 0,
    description: clip.description || "Podcast source matched without embeddable publisher audio.",
    provider: podcastSearch?.provider || clip.source || "Apple Podcasts Search API",
    sourceType: "podcastEpisode",
    isLivePodcast: true
  }
}

function applePodcastPayloadFor(payload, term){
  const cleanPodcastText = (value, max = 180) => compactTopic(value).slice(0, max)
  const episodes = (Array.isArray(payload?.results) ? payload.results : []).map((item) => ({
    id: String(item.episodeGuid || item.trackId || item.episodeUrl || item.trackViewUrl || ""),
    title: cleanPodcastText(item.trackName || item.episodeName || "Podcast episode"),
    show: cleanPodcastText(item.collectionName || item.artistName || "Podcast"),
    author: cleanPodcastText(item.artistName || item.collectionName || "Podcast publisher"),
    description: cleanPodcastText(item.description || item.shortDescription || "", 420),
    artwork: item.artworkUrl600 || item.artworkUrl100 || "",
    audioUrl: String(item.episodeUrl || item.previewUrl || "").replace(/^http:/i, "https:"),
    pageUrl: item.trackViewUrl || item.collectionViewUrl || "",
    publishedAt: item.releaseDate || "",
    durationMs: Number(item.trackTimeMillis || 0),
    source: "Apple Podcasts Search API"
  })).filter((item) => item.id && (item.audioUrl || item.pageUrl)).slice(0, 3)
  return {
    query: term,
    provider: "Apple Podcasts Search API",
    fetchedAt: new Date().toISOString(),
    episodes
  }
}

async function fetchApplePodcastFallback(term){
  const params = new URLSearchParams({
    term,
    media: "podcast",
    entity: "podcastEpisode",
    limit: "5",
    country: "US",
    explicit: "No"
  })
  const response = await fetchWithTimeout(`https://itunes.apple.com/search?${params.toString()}`, {headers: {Accept: "application/json"}}, 9000)
  if(!response.ok) throw new Error(`Apple podcast search returned ${response.status}`)
  const payload = await response.json()
  return applePodcastPayloadFor(payload, term)
}

async function fetchApplePodcastFallbackSeries(terms = []){
  const cleanTerms = Array.from(new Set(terms.map((term) => compactTopic(term)).filter(Boolean)))
  let lastError = null
  for(const term of cleanTerms){
    try {
      const payload = await fetchApplePodcastFallback(term)
      if(Array.isArray(payload.episodes) && payload.episodes.length) return payload
      lastError = new Error(`No podcast episodes for ${term}`)
    } catch (error) {
      lastError = error
    }
  }
  throw lastError || new Error("Podcast search unavailable")
}

function podcastFallbackTermsFor({term, category, story, contentRadar} = {}){
  const subject = compactTopic(contentRadar?.primary || story?.requestedTopic || story?.topic || category || "DigitalHut")
  const categoryVoice = {
    "Mainstream Streaming": "TED Talks Daily culture podcast",
    Gamer: "gaming creator podcast",
    Planetary: "StarTalk science podcast",
    "Orbital Compute": "space technology podcast",
    Science: "science research podcast",
    Researcher: "university research podcast",
    Programmer: "technology developer podcast",
    Businesses: "business market podcast",
    "Real Estate": "real estate investing podcast",
    Continent: "travel culture podcast"
  }[category] || "TED Talks Daily podcast"
  return [
    term,
    `${subject} podcast`,
    `${subject} interview`,
    `${subject} discussion`,
    categoryVoice,
    `${category || "DigitalHut"} podcast episode`
  ]
}

function youtubeStoryFor({query, category, feed, chapter, progress, streamAnalytics, liveLongTailKeywords, youtubeSearch, videoIndex = 0, freshSeed = 0}){
  const topic = compactTopic(query || feed?.query || feed?.title || category || "DigitalHut observatory")
  const searchPhrase = `${topic} ${category} 2026 visual experience`
  const encoded = encodeURIComponent(searchPhrase)
  const rawVideos = rotateFreshList(Array.isArray(youtubeSearch?.videos) ? youtubeSearch.videos : [], freshSeed, `${category}:${topic}:youtube-story`)
  const playableVideos = rawVideos.filter(isPlayableYoutubeVideo)
  const videos = playableVideos.length ? playableVideos : rawVideos.filter((video) => {
    const videoId = youtubeVideoIdFor(video)
    return videoId && !blockedYoutubeEmbedIds.has(videoId) && Boolean(video?.embedUrl || video?.videoId || video?.id)
  })
  const selectedVideoIndex = videos.length ? ((Math.round(Number(videoIndex) || 0) % videos.length) + videos.length) % videos.length : 0
  const primaryVideo = videos[selectedVideoIndex]
  const embedUrl = trustedYoutubeEmbedUrl(primaryVideo, category)
  const searchUrl = `https://www.youtube.com/results?search_query=${encoded}`
  const contentRadar = youtubeContentRadarFor({video: primaryVideo, topic, category, feed, searchPhrase, keywords: liveLongTailKeywords})
  const episodeName = episodeNameFor({category, topic: contentRadar.primary || topic, feed})
  const isPodcastMoment = chapter.id === "podcast"
  const isVideoMoment = chapter.id === "video" || chapter.id === "preview"
  const baseKeywords = liveLongTailKeywords.length ? liveLongTailKeywords : [searchPhrase, `${topic} YouTube story`, `${topic} 3D visual experience`]
  const clips = [
    {id: "intro", label: "Intro", title: `${topic} cold open`, status: chapter.id === "opening" ? "live" : "queued", detail: "hook, title card, topic setup"},
    {id: "clip-a", label: "Clip 01", title: primaryVideo?.title || baseKeywords[0] || searchPhrase, status: isVideoMoment ? "analyzing" : "ready", detail: primaryVideo?.channelTitle || "primary YouTube API lane"},
    {id: "clip-b", label: "Clip 02", title: videos[(selectedVideoIndex + 1) % Math.max(1, videos.length)]?.title || baseKeywords[1] || `${topic} reaction`, status: progress > 30 ? "matched" : "queued", detail: videos[(selectedVideoIndex + 1) % Math.max(1, videos.length)]?.channelTitle || "supporting moment and cutaway"},
    {id: "clip-c", label: "Clip 03", title: videos[(selectedVideoIndex + 2) % Math.max(1, videos.length)]?.title || baseKeywords[2] || `${topic} context`, status: progress > 70 ? "next" : "queued", detail: videos[(selectedVideoIndex + 2) % Math.max(1, videos.length)]?.channelTitle || "context clip and next scene"}
  ]
  const cutscenes = [
    {id: "intro", label: "Intro", time: "00:00", status: chapter.id === "opening" ? "active" : "ready"},
    {id: "ad-a", label: "Ad Cutscene", time: "00:18", status: progress >= 18 ? "tracked" : "queued"},
    {id: "glb", label: "3D/GLB Bridge", time: "00:32", status: feed?.modelUrl || feed?.embedUrl ? "renderer linked" : "model search"},
    {id: "podcast", label: "Podcast Insert", time: "01:04", status: isPodcastMoment ? "speaker pulsing" : "voice ready"},
    {id: "ad-b", label: "Ad Return", time: "01:22", status: chapter.id === "video" ? "video cut live" : "queued"},
    {id: "outro", label: "Conclusion", time: "01:40", status: progress > 92 ? "closing" : "next"}
  ]
  const narration = chapter.id === "opening"
    ? `Opening ${episodeName}. DigitalHut is searching video context, preparing the GLB bridge, and setting the first story hook.`
    : chapter.id === "preview"
      ? `Preview stream is reading the first clip lane while the 3D renderer prepares the subject scene.`
      : chapter.id === "source"
        ? `Source pull is comparing YouTube search intent, public feed context, GLB availability, and share value.`
        : chapter.id === "detail"
          ? `Angle detail is narrating what matters in the subject before the ad cutscene and podcast insert.`
          : chapter.id === "podcast"
            ? `Podcast insert is live. The speaker icon pulses while the voice explains the important moment.`
            : chapter.id === "video"
              ? `Video bridge is live. DigitalHut is stitching the clip story into analytics, cutscenes, and the GLB renderer.`
              : `Conclusion is packaging the topic into the next episode, keyword lane, and shareable observatory record.`
  return {
    topic: contentRadar.primary || topic,
    requestedTopic: topic,
    searchPhrase,
    embedUrl,
    searchUrl,
    episodeName,
    videos,
    primaryVideo,
    selectedVideoIndex,
    videoCount: videos.length,
    contentRadar,
    clips,
    cutscenes,
    narration,
    apiStatus: youtubeSearch?.status || (youtubeSearch?.configured ? "youtube-api-live" : "youtube-api-waiting"),
    provider: youtubeSearch?.provider || "YouTube search renderer",
    adTracker: primaryVideo
      ? `${(primaryVideo.viewCount || streamAnalytics.metrics.views).toLocaleString()} views / ${(primaryVideo.likeCount || streamAnalytics.metrics.likes).toLocaleString()} likes / ${(primaryVideo.commentCount || streamAnalytics.metrics.comments).toLocaleString()} comments`
      : `${streamAnalytics.metrics.views.toLocaleString()} views / ${streamAnalytics.metrics.likes.toLocaleString()} likes / ${streamAnalytics.metrics.comments.toLocaleString()} comments`
  }
}

function youtubeSignalFieldFor({story, chapter, progress, streamAnalytics, observatoryAnalysis, liveLongTailKeywords, clock = 0}){
  const numericProgress = Number(progress) || 0
  const inAdReset = chapter.id === "source" || (numericProgress >= 18 && numericProgress < 31) || (numericProgress >= 82 && numericProgress < 95)
  const isPodcastMoment = chapter.id === "podcast"
  const beat = `${Math.max(.62, 2.2 - Math.min(1.8, Number(streamAnalytics.pace) || 1) * .72).toFixed(2)}s`
  const packetHeat = Math.max(38, Math.min(100, observatoryAnalysis?.overall || 64))
  const keyword = liveLongTailKeywords?.[0] || story.searchPhrase
  const movingPackets = [
    {id: "intent", side: "top", label: "Search Intent", value: story.topic, heat: packetHeat},
    {id: "video", side: "right", label: "Video Pulse", value: streamAnalytics.videoState, heat: packetHeat + 4},
    {id: "ad", side: "bottom", label: "Ad Gate", value: inAdReset ? "resetting analytics" : "tracking next cutscene", heat: inAdReset ? 100 : 62},
    {id: "glb", side: "left", label: "GLB Renderer", value: streamAnalytics.renderState, heat: packetHeat - 2},
    {id: "voice", side: "right", label: "Podcast Insert", value: streamAnalytics.podcastState, heat: isPodcastMoment ? 100 : 68},
    {id: "seo", side: "bottom", label: "Keyword Lane", value: keyword, heat: packetHeat}
  ].map((packet, index) => {
    const motion = (Number(clock) || 0) + index * 9
    return {
      ...packet,
      shift: Math.round(Math.sin(motion / 3.2) * (8 + index)),
      drift: Math.round(Math.cos(motion / 3.8) * (5 + index)),
      delay: `${(index * -.14).toFixed(2)}s`
    }
  })
  return {
    beat,
    mode: inAdReset ? "ad-reset" : isPodcastMoment ? "podcast-signal" : "live-signal",
    resetLabel: inAdReset ? "Ad reset: counters restart, story memory continues" : isPodcastMoment ? "Podcast moment: voice pulse is live" : "Live sync: video, GLB, search, voice",
    packets: movingPackets
  }
}

function youtubeGlbDockFor({category, feed, feeds, active, stage, progress, freshSeed = 0}){
  const feedPool = [feed, ...rotateFreshList(feeds || [], freshSeed, `${category}:${feed?.title || ""}:glb-dock`)].filter(Boolean)
  const seen = new Set()
  const dock = []
  feedPool.forEach((item, index) => {
    if(dock.length >= 3) return
    const modelUrl = bestRenderableModelUrl(item) || relatedGlb(category, index)
    const id = `${item.id || item.title || index}:${modelUrl || item.viewerUrl || item.embedUrl || ""}`
    if(seen.has(id)) return
    seen.add(id)
    dock.push({
      id,
      label: dock.length === 0 ? "Live GLB" : `Corner GLB ${dock.length + 1}`,
      status: dock.length === 0 ? `${stage.label} active` : Number(progress) > 35 + dock.length * 18 ? "queued into story" : "standing by",
      active: item.id === feed?.id || dock.length === 0,
      modelUrl,
      feed: {
        ...item,
        id: item.id || `youtube-glb-dock-${dock.length}`,
        category: item.category || category,
        modelUrl: modelUrl || item.modelUrl || "",
        thumbnail: item.thumbnail || stockUrl(category, dock.length),
        accent: item.accent || metaFor(category).accent
      }
    })
  })
  while(dock.length < 3){
    const index = dock.length
    const fallbackModel = relatedGlb(category, active + index)
    const fallbackFeed = {
      id: `youtube-glb-fallback-${category}-${index}`,
      title: `${category} visual model ${index + 1}`,
      category,
      modelUrl: fallbackModel,
      thumbnail: stockUrl(category, index),
      accent: metaFor(category).accent,
      apiSource: "DigitalHut verified GLB lane",
      note: "Fallback model slot keeps the live story dock filled while search finds stronger source assets."
    }
    dock.push({
      id: fallbackFeed.id,
      label: index === 0 ? "Live GLB" : `Corner GLB ${index + 1}`,
      status: index === 0 ? `${stage.label} active` : "standing by",
      active: index === 0,
      modelUrl: fallbackModel,
      feed: fallbackFeed
    })
  }
  return dock.slice(0, 3)
}

function contentBacklinkRadarFor({story, category, feed, glbDock, liveLongTailKeywords, progress, clock}){
  const topic = compactTopic(story?.topic || feed?.title || category || "DigitalHut observatory")
  const encodedTopic = encodeURIComponent(`${topic} ${category} 2026 visual experience`)
  const keyword = liveLongTailKeywords?.[Math.abs(Number(clock) || 0) % Math.max(1, liveLongTailKeywords.length)] || story?.searchPhrase || topic
  const modelSource = feed?.viewerUrl || feed?.modelUrl || glbDock?.[0]?.modelUrl || ""
  const pulse = Math.round((Number(progress) || 0) + ((Number(clock) || 0) % 9))
  const lanes = [
    {id: "video", label: "Video Renderer", status: story?.primaryVideo?.title || `${topic} clip context`, strength: Math.max(48, Math.min(100, pulse + 16)), detail: story?.primaryVideo?.channelTitle || "YouTube source scan"},
    {id: "podcast", label: "Podcast Renderer", status: `important moment: ${keyword}`, strength: Math.max(42, Math.min(100, pulse + 8)), detail: "voice insert, chapter summary, ad reset memory"},
    {id: "glb", label: "3D Renderer", status: glbDock?.[0]?.feed?.title || feed?.title || "GLB subject scan", strength: Math.max(50, Math.min(100, pulse + 12)), detail: modelSource ? "model source attached" : "model source search lane"},
    {id: "seo", label: "Backlink Engine", status: keyword, strength: Math.max(45, Math.min(100, pulse + 5)), detail: "website, backlink, long-tail lane"}
  ]
  const links = [
    {
      id: "video-source",
      label: "Video Source",
      title: story?.primaryVideo?.title || `${topic} YouTube search`,
      url: story?.primaryVideo?.url || story?.searchUrl || `https://www.youtube.com/results?search_query=${encodedTopic}`,
      signal: story?.primaryVideo ? "primary clip backlink" : "search result backlink"
    },
    {
      id: "website-source",
      label: "Website Lane",
      title: `${topic} websites and references`,
      url: `https://www.google.com/search?q=${encodedTopic}%20websites%20references`,
      signal: "website pickup"
    },
    {
      id: "podcast-source",
      label: "Podcast Lane",
      title: `${topic} podcast discussion`,
      url: `https://www.google.com/search?q=${encodedTopic}%20podcast%20discussion`,
      signal: "voice moment backlink"
    },
    {
      id: "model-source",
      label: "3D/GLB Lane",
      title: glbDock?.[0]?.feed?.title || `${topic} 3D model`,
      url: modelSource || `https://www.google.com/search?q=${encodedTopic}%203d%20model%20glb`,
      signal: modelSource ? "renderer source backlink" : "3D model search"
    },
    {
      id: "market-source",
      label: "Market Lane",
      title: `${keyword} demand scan`,
      url: `https://www.google.com/search?q=${encodeURIComponent(keyword)}%20trend%20market%20data`,
      signal: "long-tail market pickup"
    }
  ]
  return {
    focus: `${topic} / ${category}`,
    pulse,
    lanes,
    links
  }
}

function liveMeaningFor({story, category, feed, glbDock, liveLongTailKeywords, progress, seconds, clock}){
  const topic = compactTopic(story?.primaryVideo?.title || story?.topic || feed?.title || category || "DigitalHut visual experience")
  const keyword = liveLongTailKeywords?.[(Number(clock) || 0) % Math.max(1, liveLongTailKeywords.length)] || story?.searchPhrase || topic
  const second = Math.max(0, Math.round(Number(seconds) || 0))
  const normalized = ((Number(progress) || 0) + ((Number(clock) || 0) % 6)) % 100
  const segments = [
    {
      id: "hook",
      until: 15,
      label: "Hook Pickup",
      caption: `Opening read on ${topic}. DigitalHut is finding what the video is about before it builds the episode.`,
      videoCue: "subject lock",
      podcastCue: "voice intro armed",
      glbCue: "3D preview warming",
      backlinkCue: "search source opening"
    },
    {
      id: "context",
      until: 32,
      label: "Context Scan",
      caption: `The live system is matching video context to ${category} intent and audience language.`,
      videoCue: "context frames moving",
      podcastCue: "narration summary",
      glbCue: "scene angle match",
      backlinkCue: "website references"
    },
    {
      id: "three-d",
      until: 52,
      label: "3D Meaning Bridge",
      caption: `${glbDock?.[0]?.feed?.title || feed?.title || "The 3D renderer"} is being tied to the same subject so the model fits the video moment.`,
      videoCue: "visual proof",
      podcastCue: "host explains 3D link",
      glbCue: "GLB subject active",
      backlinkCue: "model source backlink"
    },
    {
      id: "podcast",
      until: 68,
      label: "Podcast Important Moment",
      caption: `Voice layer is turning the moment into a short explanation: ${keyword}.`,
      videoCue: "moment highlight",
      podcastCue: "speaker pulse live",
      glbCue: "supporting model angle",
      backlinkCue: "podcast/source lane"
    },
    {
      id: "sponsored",
      until: 82,
      label: "Sponsored Moment",
      caption: `DigitalHut is matching the live clip to a sponsor-ready point, website lane, backlink, and callout package.`,
      videoCue: "sponsor cue detected",
      podcastCue: "ad voice ready",
      glbCue: "branded 3D scene forming",
      backlinkCue: "sponsor backlink build"
    },
    {
      id: "backlinks",
      until: 92,
      label: "Website / Backlink Match",
      caption: `DigitalHut is attaching websites, search lanes, and backlinks that make sense for this clip.`,
      videoCue: "source verification",
      podcastCue: "reference callout",
      glbCue: "asset citation",
      backlinkCue: "backlinks updating"
    },
    {
      id: "conclusion",
      until: 101,
      label: "Conclusion Package",
      caption: `The system is packaging the video, podcast note, 3D renderer, and backlinks into a reusable episode memory.`,
      videoCue: "closing clip",
      podcastCue: "summary voice",
      glbCue: "final model frame",
      backlinkCue: "episode backlink set"
    }
  ]
  const segment = segments.find((item) => normalized < item.until) || segments[segments.length - 1]
  return {
    ...segment,
    second,
    progress: Math.round(normalized),
    tags: [segment.videoCue, segment.podcastCue, segment.glbCue, segment.backlinkCue]
  }
}

function episodeVisualFor({meaning, observatoryAnalysis, backlinkRadar, progress}){
  const laneMap = new Map((observatoryAnalysis?.lanes || []).map((lane) => [lane.id, lane]))
  const backlinkStrength = backlinkRadar?.lanes?.find((lane) => lane.id === "seo")?.strength || 62
  const buildProgress = Math.max(0, Math.min(100, Number(progress) || 0))
  const revealPlan = {
    hook: {lanes: ["video"], rows: ["video"], links: 1, activeLane: "video"},
    context: {lanes: ["video", "seo"], rows: ["video", "backlink"], links: 2, activeLane: "video"},
    "three-d": {lanes: ["video", "glb"], rows: ["video", "glb"], links: 3, activeLane: "glb"},
    podcast: {lanes: ["video", "podcast", "glb"], rows: ["video", "podcast", "glb"], links: 4, activeLane: "podcast"},
    sponsored: {lanes: ["video", "podcast", "glb", "seo"], rows: ["video", "podcast", "glb", "backlink"], links: 5, activeLane: "seo"},
    backlinks: {lanes: ["video", "podcast", "glb", "seo"], rows: ["video", "podcast", "glb", "backlink"], links: 5, activeLane: "seo"},
    conclusion: {lanes: ["video", "podcast", "glb", "seo"], rows: ["video", "podcast", "glb", "backlink"], links: 5, activeLane: "video"}
  }
  const reveal = revealPlan[meaning.id] || revealPlan.hook
  const graph = [
    {id: "video", label: "Video", value: laneMap.get("video")?.value || 58, status: meaning.videoCue},
    {id: "podcast", label: "Podcast", value: laneMap.get("podcast")?.value || 54, status: meaning.podcastCue},
    {id: "glb", label: "3D", value: laneMap.get("glb")?.value || 60, status: meaning.glbCue},
    {id: "backlink", label: "Links", value: backlinkStrength, status: meaning.backlinkCue}
  ].map((item, index) => {
    const reveal = Math.max(6, Math.min(item.value, Math.round(buildProgress * (0.7 + index * .12))))
    return {
      ...item,
      value: reveal,
      targetValue: item.value,
      status: buildProgress > index * 18 ? item.status : "rendering signal"
    }
  })
  const funnel = [
    {id: "hook", label: "Hook"},
    {id: "context", label: "Context"},
    {id: "three-d", label: "3D"},
    {id: "podcast", label: "Podcast"},
    {id: "sponsored", label: "Sponsor"},
    {id: "backlinks", label: "Links"},
    {id: "conclusion", label: "Close"}
  ]
  const activeIndex = Math.max(0, funnel.findIndex((item) => item.id === meaning.id))
  const rowStateFor = (id) => {
    if (!reveal.rows.includes(id)) return "queued"
    if (id === reveal.activeLane || (id === "backlink" && reveal.activeLane === "seo")) return "active"
    return "building"
  }
  return {
    graph,
    funnel: funnel.map((item, index) => ({...item, active: item.id === meaning.id, complete: index < activeIndex})),
    rows: graph.map((item) => ({...item, revealState: rowStateFor(item.id), note: item.value >= 78 ? "hot" : item.value >= 62 ? "building" : "scanning"})),
    reveal,
    activeIndex,
    orbit: Math.round(Number(progress) || 0)
  }
}

function matrixConstructionCellsFor({meaning, story, category, constructionProgress, sceneShiftIndex, adResetWindow, podcastMomentActive, glbSmartExpanded}){
  const progress = Math.max(0, Math.min(100, Number(constructionProgress) || 0))
  const mode = adResetWindow ? "ad" : podcastMomentActive ? "podcast" : glbSmartExpanded ? "glb" : "scene"
  const visualFamilies = ["bars", "funnel", "table", "orbit", "source", "cube"]
  const visualFamily = adResetWindow
    ? "reset"
    : podcastMomentActive
      ? "pulse"
      : glbSmartExpanded
        ? "cube"
        : visualFamilies[Math.abs(Number(sceneShiftIndex) || 0) % visualFamilies.length]
  const topic = compactTopic(story?.topic || category || "DigitalHut")
  const source = story?.primaryVideo?.channelTitle || story?.provider || "source"
  const cells = [
    ["FRAME", topic, "video"],
    ["CUT", `scene-${sceneShiftIndex + 1}`, "video"],
    ["PIXEL", `${Math.round(progress)}% build`, "video"],
    ["AD", adResetWindow ? "reset gate" : "standby", "ad"],
    ["VOICE", podcastMomentActive ? "guest live" : meaning.podcastCue, "podcast"],
    ["GLB", glbSmartExpanded ? "expanded" : meaning.glbCue, "glb"],
    ["DATA", meaning.videoCue, "data"],
    ["LINK", meaning.backlinkCue, "link"],
    ["SOURCE", source, "source"],
    ["INTENT", category, "intent"],
    ["MOMENT", meaning.label, "moment"],
    ["SYNC", `t-${meaning.second}s`, "sync"]
  ]
  return {
    mode,
    visualFamily,
    cells: cells.map(([label, value, type], index) => {
      const threshold = 5 + index * 7
      const visible = progress >= Math.max(0, threshold - 8)
      const fill = visible ? Math.max(4, Math.min(100, progress - index * 5 + 10)) : 0
      const state = progress >= threshold + 12 ? "live" : progress >= threshold ? "building" : "queued"
      return {
        id: `${label}-${index}`,
        label,
        value,
        type,
        state,
        fill,
        order: index,
        visible
      }
    })
  }
}

function projectDraftPath(d, height = 24){
  const tokens = String(d || "").match(/[A-Za-z]|-?\d+(?:\.\d+)?/g) || []
  let command = ""
  let numberIndex = 0
  const mapY = (value) => String(Math.max(2, Math.min(height - 2, Math.round((Number(value) / 100) * (height - 4) + 2))))
  return tokens.map((token) => {
    if(/^[A-Za-z]$/.test(token)){
      command = token.toUpperCase()
      numberIndex = 0
      return token
    }
    const isY = command === "V" || (["M", "L", "C", "S", "Q", "T"].includes(command) && numberIndex % 2 === 1)
    numberIndex += 1
    return isY ? mapY(token) : token
  }).join(" ")
}

function digitalhutEpisodePreviewsFor({category, query, feed, youtubeStory, youtubeSearch, freshSeed = 0}){
  const activeTopic = compactTopic(query || feed?.query || feed?.title || category || "DigitalHut observatory")
  const videos = rotateFreshList(Array.isArray(youtubeSearch?.videos) ? youtubeSearch.videos.filter(isPlayableYoutubeVideo) : [], freshSeed, `${category}:${activeTopic}:episode-videos`)
  const seededVideos = seededYoutubePanelVideosFor(category, activeTopic, 5, freshSeed)
  const seeds = rotateFreshList(seedFeeds(category), freshSeed, `${category}:${activeTopic}:episode-seeds`).slice(0, 5)
  const liveApiMatched = youtubeSearch?.status?.includes("api-live") && videos.some((video) => video?.source === "YouTube Data API v3")
  const quotaStoryboard = youtubeSearch?.quotaProtected || youtubeSearch?.status?.includes("quota")
  const sourceVideos = [...videos, ...seededVideos]
    .filter((item, index, list) => list.findIndex((candidate) => youtubeVideoIdFor(candidate) === youtubeVideoIdFor(item) || candidate.title === item.title) === index)
    .slice(0, 5)
  const previewVideos = sourceVideos.map((video, index) => ({
    id: video.videoId || video.id || `youtube-${index}`,
    videoId: youtubeVideoIdFor(video),
    embedUrl: trustedYoutubeEmbedUrl(video, category),
    channelTitle: video.channelTitle || "DigitalHut YouTube source",
    description: video.description || "",
    category,
    title: video.title || `${activeTopic} DigitalHut episode`,
    detail: video.channelTitle || "Prefilled YouTube source",
    query: video.title || activeTopic,
    thumbnail: video.thumbnail || video.thumbnails?.high?.url || video.thumbnails?.medium?.url || stockUrl(category, index),
    source: liveApiMatched && video.source === "YouTube Data API v3" ? "YouTube API matched" : quotaStoryboard ? "Quota-safe storyboard" : "Category storyboard",
    contentFit: liveApiMatched && video.source === "YouTube Data API v3" ? "api matched" : quotaStoryboard ? "quota-safe storyboard" : "category storyboard",
    fitDetail: liveApiMatched && video.source === "YouTube Data API v3"
      ? "Live API title/channel metadata is driving this pick."
      : quotaStoryboard
        ? "Quota is protected; DigitalHut keeps the category topic map alive without spending another search."
        : "DigitalHut is using a category topic storyboard until a live API match is available.",
    live: index === 0
  }))
  const fallback = seeds.map((item, index) => ({
    id: item.id || `seed-${category}-${index}`,
    category,
    title: item.title || `${activeTopic} DigitalHut episode ${index + 1}`,
    detail: item.apiSource || item.apiStatus || "DigitalHut featured category episode",
    query: item.query || `${item.title || activeTopic} ${category} video observatory`,
    thumbnail: item.thumbnail || stockUrl(category, index),
    source: "Featured preload",
    contentFit: "category seed",
    fitDetail: "FireCuda category seed for the observatory radar and proof route.",
    live: previewVideos.length === 0 && index === 0
  }))
  const merged = [...previewVideos, ...fallback].filter((item, index, list) => list.findIndex((candidate) => candidate.title === item.title) === index)
  const cadenceSlots = ["live edge", "next cache", "proof branch", "source check", "fallback hold"]
  return merged.slice(0, 5).map((item, index) => ({
    ...item,
    episodeName: episodeNameFor({category: item.category, topic: item.query, feed}),
    order: index + 1,
    cadenceSlot: cadenceSlots[index] || "queued",
    cadenceDetail: index === 0 ? "current playable lane" : index === 1 ? "same-category next episode" : index === 2 ? "proof route support" : index === 3 ? "source/backlink support" : "fresh fallback",
    status: index === 0 ? "live human pick" : index === 1 ? "next cut" : "queued"
  }))
}

function observatoryAnalyzerFor({category, chapter, feed, progress, visualReady, livePosts, speed, runtimeState, performanceProfile, streamAnalytics, layer, stage, liveSyncStatus, clock = 0}){
  const numericProgress = Number(progress) || 0
  const liveDepth = livePosts.length
  const source = `${feed?.apiSource || feed?.apiStatus || ""}`.toLowerCase()
  const hasLiveSource = Boolean(feed?.modelUrl || feed?.embedUrl || feed?.viewerUrl)
  const sourceBoost = source.includes("firecuda") || source.includes("supabase") || source.includes("api") ? 9 : 3
  const speedBoost = Math.min(16, Math.round((Number(speed) || 1) * 8))
  const runtimeBoost = runtimeState.online && runtimeState.visible ? 12 : runtimeState.online ? 5 : 0
  const renderScore = Math.max(36, Math.min(100, 54 + (visualReady ? 24 : 8) + sourceBoost + speedBoost))
  const videoScore = Math.max(38, Math.min(100, 58 + (chapter.id === "video" ? 26 : chapter.id === "preview" ? 17 : 9) + runtimeBoost))
  const podcastScore = Math.max(40, Math.min(100, 55 + (chapter.id === "podcast" ? 32 : 12) + Math.min(10, liveDepth * 2)))
  const motionBoost = Math.round((Math.sin((Number(clock) || 0) / 4) + 1) * 5)
  const streamScore = Math.max(44, Math.min(100, 60 + Math.round(streamAnalytics.pace * 10) + Math.min(10, liveDepth * 2) + motionBoost))
  const glbScore = Math.max(42, Math.min(100, 52 + (hasLiveSource ? 18 : 5) + (visualReady ? 15 : 0) + (layer === "Lighting" || layer === "Coordinates" ? 8 : 4)))
  const overall = Math.round((renderScore + videoScore + podcastScore + streamScore + glbScore) / 5)
  const guestMoment = chapter.id === "podcast"
  const flags = [
    guestMoment ? "special guest podcast pulse" : "podcast voice matched",
    visualReady ? "renderer frame locked" : "renderer warming up",
    chapter.id === "video" ? "video bridge is leading" : "video bridge standby",
    `${stage.label} layer read`,
    liveSyncStatus || "local live stage ready",
    performanceProfile.label || "system profile"
  ]
  return {
    overall,
    phase: guestMoment ? "Guest podcast moment" : chapter.id === "video" ? "Video bridge analysis" : visualReady ? "Live render analysis" : "Renderer preflight",
    pulse: guestMoment ? `speaker pulse ${String((Number(clock) || 0) % 100).padStart(2, "0")}` : visualReady ? `sync pulse ${String((Number(clock) || 0) % 100).padStart(2, "0")}` : `buffer pulse ${String((Number(clock) || 0) % 100).padStart(2, "0")}`,
    categoryLabel: category,
    title: feed?.title || "DigitalHut scene",
    lanes: [
      {id: "video", label: "Video", value: videoScore, status: chapter.id === "video" ? "bridge live" : "sync ready"},
      {id: "glb", label: "3D/GLB", value: glbScore, status: visualReady ? "frame locked" : "loading"},
      {id: "render", label: "Render", value: renderScore, status: streamAnalytics.renderState},
      {id: "podcast", label: "Guest", value: podcastScore, status: guestMoment ? "special moment" : "matched"},
      {id: "stream", label: "Live Pace", value: streamScore, status: `${streamAnalytics.pace.toFixed(2)}x`}
    ],
    flags
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

function RendererVisual({feed, stage, guided, loading, layer, renderLive, modelOpen, onOpenModel, onNext, onPlayMore, onVisualPending, onVisualReady, onDirectorUpdate, onMarketOptionSelect, guideText, followUps}){
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
  const isBundledLocalModel = Boolean(renderModelUrl && String(renderModelUrl).startsWith("/models/"))
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
    onDirectorUpdate?.({
      phase: hasEmbed ? "Loading API preview" : isBundledLocalModel ? "Preparing local GLB" : "Loading Babylon GLB",
      detail: feed.title,
      status: hasEmbed
        ? "Opening original provider Play Preview"
        : isBundledLocalModel
          ? "Verified bundled GLB found; fitting camera and reading metadata"
          : "Waiting for renderer asset"
    })
    if(rendererUnavailable){
      const detail = {title: feed.title, reason: "No verified API, Vercel, or FireCuda environment GLB registered for this feed."}
      onDirectorUpdate?.({phase: "Renderer asset missing", detail: feed.title, status: detail.reason})
      return undefined
    }
    if(!liveOpen || hasEmbed || !hasModel) return undefined
    const waiting = window.setTimeout(() => {
      onDirectorUpdate?.({
        phase: isBundledLocalModel ? "Preparing local GLB" : "Still loading Babylon GLB",
        detail: feed.title,
        status: isBundledLocalModel
          ? "Verified local GLB is staged; camera fit is still completing"
          : isPersonalLibraryModel
            ? "Large uploaded model still importing"
            : "Remote verified GLB is still importing"
      })
    }, isPersonalLibraryModel ? 18000 : isBundledLocalModel ? 14000 : 9000)
    return () => {
      window.clearTimeout(waiting)
    }
  }, [rendererOpen, liveOpen, rendererUnavailable, hasModel, hasEmbed, isStats, feed.title, visualKey, isBundledLocalModel, isPersonalLibraryModel])

  function markBabylonReady(key){
    setModelReady(true)
    setModelLoaded(true)
    setModelError("")
    onDirectorUpdate?.({phase: "Ready to present", detail: feed.title, status: isBundledLocalModel ? "Verified local GLB loaded and camera fitted" : "Babylon GLB loaded and camera fitted"})
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
    {feed.thumbnail && <img className={`dh-renderer-stock ${imageReady ? "is-ready" : ""}`} src={feed.thumbnail} alt={`${feed.title} thumbnail preview for DigitalHut 3D render`} loading="lazy" decoding="async" onLoad={() => setImageReady(true)} data-dh-thumbnail-render="main-renderer-thumbnail" data-dh-category={feed.category || feed.type || ""} data-dh-asset-id={feed.id || feed.title || ""} />}
    {(loading || (rendererOpen && !modelLoaded && !hasEmbed)) && <div className="dh-ai-load-indicator" aria-live="polite"><span /><b>AI searching renderer</b><small>{feed.title}</small></div>}
    {decorationActive && <div className="dh-motion-sky" />}
    {decorationActive && <div className="dh-stars">{stars.map((_, index) => <span key={index} style={{left: `${4 + (index * 43) % 91}%`, top: `${7 + (index * 31) % 78}%`}} />)}</div>}
    {decorationActive && <SceneObject feed={feed} />}
    {canShowContainment && !liveOpen && !rendererUnavailable && <button className={`dh-api-system-preview ${feed.thumbnail ? "api-preview-ready" : ""} ${modelOpen ? "is-resolving" : ""}`} style={feed.thumbnail ? {"--api-preview-url": `url("${feed.thumbnail}")`} : undefined} onClick={onOpenModel} data-dh-thumbnail-render="play-preview-thumbnail-to-render" data-dh-category={feed.category || feed.type || ""} data-dh-asset-id={feed.id || feed.title || ""} aria-label={`Play Preview: open ${feed.title} 3D render from thumbnail`}>
      <span>{modelOpen || loading ? "Preparing renderer" : "Renderer ready"}</span><b>{feed.title}</b><em className="dh-open-containment">{modelOpen || loading ? "Rendering" : "Play Preview"}</em>
    </button>}
    {liveOpen && hasEmbed && <iframe className="dh-api-frame" title={feed.title} src={pausedEmbedUrl(feed.embedUrl)} allow="fullscreen; xr-spatial-tracking" loading="lazy" allowFullScreen onLoad={() => onVisualReady?.(visualKey)} />}
    {liveOpen && !hasEmbed && hasModel && <div className="dh-model-shell">
      {!modelLoaded && <div className="dh-model-loader"><b>Loading Babylon GLB Renderer</b><span>{feed.title}</span><button type="button" onClick={onOpenModel}>Open 3D Model View</button></div>}
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
    {isStats && <div className="dh-stat-model"><b>{feed.title}</b><span>{feed.market?.symbol || feed.providerMix?.join(" + ") || "data"}</span><p>{feed.note}</p>
      {Array.isArray(feed.market?.windows) && feed.market.windows.length > 0 && <div className="dh-market-flow-grid">
        {feed.market.windows.map((windowItem) => {
          const topBuy = windowItem.biggestInferredBuys?.[0]
          const topSell = windowItem.biggestInferredSells?.[0]
          const topPrint = windowItem.largestPrints?.[0]
          return <section key={windowItem.id}>
            <strong>{windowItem.id}</strong>
            <small>{windowItem.pressure}</small>
            <span>{windowItem.tradeCount.toLocaleString()} prints / {windowItem.totalVolume.toLocaleString()} shares</span>
            <span>{`Total ${Math.round(windowItem.totalNotional).toLocaleString()} USD`}</span>
            <em>{topPrint ? `Largest: ${topPrint.size.toLocaleString()} @ $${topPrint.price}` : "Largest: pending"}</em>
            <em>{topBuy ? `Buy pressure: ${topBuy.size.toLocaleString()} @ $${topBuy.price}` : "Buy pressure: pending"}</em>
            <em>{topSell ? `Sell pressure: ${topSell.size.toLocaleString()} @ $${topSell.price}` : "Sell pressure: pending"}</em>
          </section>
        })}
      </div>}
      {Array.isArray(feed.market?.optionsWindows) && feed.market.optionsWindows.length > 0 && <div className="dh-options-print-feed">
        <header><strong>Options Market Print Feed</strong><small>{feed.market.optionsSummary || "Random large buy/sell pressure candidates"}</small></header>
        <div className="dh-market-flow-grid">
          {feed.market.optionsWindows.map((windowItem) => {
            const randomBuy = windowItem.randomBigBuys?.[0]
            const randomSell = windowItem.randomBigSells?.[0]
            const largest = windowItem.largestPrints?.[0]
            return <section key={`options-${windowItem.id}`}>
              <strong>{windowItem.id} options</strong>
              <small>{windowItem.pressure}</small>
              <span>{windowItem.printCount.toLocaleString()} prints / ${Math.round(windowItem.totalPremium).toLocaleString()} premium</span>
              <em>{largest ? `Largest: ${largest.contract} ${largest.size.toLocaleString()} @ $${largest.price}` : "Largest: pending"}</em>
              <em>{randomBuy ? `Random big buy: ${randomBuy.contract} $${Math.round(randomBuy.premium).toLocaleString()} ${randomBuy.directionalPressure}` : "Random big buy: pending"}</em>
              <em>{randomSell ? `Random big sell: ${randomSell.contract} $${Math.round(randomSell.premium).toLocaleString()} ${randomSell.directionalPressure}` : "Random big sell: pending"}</em>
              {largest?.contract && <button type="button" onClick={() => onMarketOptionSelect?.(largest)}>Run Option</button>}
            </section>
          })}
        </div>
      </div>}
      {feed.market?.disclaimer && <small className="dh-market-flow-disclaimer">{feed.market.disclaimer}</small>}
    </div>}
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
  const [modelOpen, setModelOpen] = useState(true)
  const [guideDepth, setGuideDepth] = useState(0)
  const [aiOpen, setAiOpen] = useState(false)
  const [aiListening, setAiListening] = useState(false)
  const [aiCommand, setAiCommand] = useState("")
  const [notesOpen, setNotesOpen] = useState(false)
  const [smartNote, setSmartNote] = useState("")
  const [downloadUrl, setDownloadUrl] = useState("")
  const [noteFormat, setNoteFormat] = useState({font: "Arial", size: "14", spacing: "1.45", color: "#0f172a"})
  const [autoPresent, setAutoPresent] = useState(false)
  useEffect(() => {
    loadModelViewer()
    setAutoPresent(false)
    setPlaying(false)
  }, [])
  const [demoMode, setDemoMode] = useState("current")
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
  const [presentationProgress, setPresentationProgress] = useState(0)
  const [analyticsClock, setAnalyticsClock] = useState(0)
  const [observatoryBuildSeed, setObservatoryBuildSeed] = useState(0)
  const [youtubeSeekAnchor, setYoutubeSeekAnchor] = useState(0)
  const [visualReadyKey, setVisualReadyKey] = useState("")
  const [directorStatus, setDirectorStatus] = useState({phase: "Finding model", detail: "Preparing DigitalHut renderer", status: "Idle"})
  const [directorChat, setDirectorChat] = useState(() => readDirectorChat())
  const [directorInput, setDirectorInput] = useState("")
  const [faqOpen, setFaqOpen] = useState(false)
  const [mainLobbyOpen, setMainLobbyOpen] = useState(false)
  const [lobbyActiveIndex, setLobbyActiveIndex] = useState(0)
  const [apiCategoryFeeds, setApiCategoryFeeds] = useState([])
  const [apiProviderStatus, setApiProviderStatus] = useState({status: [], checkedAt: ""})
  const [showcaseAuto, setShowcaseAuto] = useState(false)
  const [interactionPulse, setInteractionPulse] = useState(false)
  const [reviewDraft, setReviewDraft] = useState("")
  const [reviewNonce, setReviewNonce] = useState(0)
  const [purchaseOpen, setPurchaseOpen] = useState(false)
  const [displayCollapsed, setDisplayCollapsed] = useState(false)
  const [selectedOptionPrint, setSelectedOptionPrint] = useState(null)
  const [selectedPurchaseIds, setSelectedPurchaseIds] = useState(["tier-premium"])
  const [mechanicMode, setMechanicMode] = useState(false)
  const [mobilityMode, setMobilityMode] = useState("Road")
  const [assistanceOpen, setAssistanceOpen] = useState(false)
  const [glbDockExpanded, setGlbDockExpanded] = useState(false)
  const [glbPlayViewOpen, setGlbPlayViewOpen] = useState(false)
  const [selectedGlbPlayAsset, setSelectedGlbPlayAsset] = useState(null)
  const [directorPanelOpen, setDirectorPanelOpen] = useState(false)
  const [categoryPanelOpen, setCategoryPanelOpen] = useState(false)
  const [currentMarketOpen, setCurrentMarketOpen] = useState(false)
  const [currentMarketInput, setCurrentMarketInput] = useState("NVDA")
  const [podcastFeatureOpen, setPodcastFeatureOpen] = useState(false)
  const [youtubeVideoIndex, setYoutubeVideoIndex] = useState(0)
  const [youtubeSearch, setYoutubeSearch] = useState({status: "waiting", configured: false, provider: "YouTube Data API v3", videos: []})
  const [podcastClipIndex, setPodcastClipIndex] = useState(0)
  const [podcastSearch, setPodcastSearch] = useState({status: "waiting", configured: false, provider: "Apple Podcasts Search API", episodes: [], videos: []})
  const [contentAnalyzer, setContentAnalyzer] = useState({status: "waiting", configured: false, provider: "DigitalHut Content Analyzer", mode: "metadata-only", analysis: null})
  const [freshnessSeed] = useState(() => sessionFreshnessSeed())
  const [performanceProfile] = useState(() => getSystemPerformanceProfile())
  const [runtimeState, setRuntimeState] = useState(() => ({
    online: typeof navigator === "undefined" ? true : navigator.onLine,
    visible: typeof document === "undefined" ? true : !document.hidden,
    connection: typeof navigator === "undefined" ? "unknown" : navigator.connection?.effectiveType || "standard"
  }))
  const hideTimer = useRef(null)
  const pulseTimer = useRef(null)
  const idleModelTimer = useRef(null)
  const podcastAudioRef = useRef(null)
  const requestRef = useRef(0)
  const recognitionRef = useRef(null)
  const autoStartedRef = useRef(null)
  const initialFeedLoadedRef = useRef(false)
  const autoStepRef = useRef(0)
  const pendingSpeechRef = useRef(null)
  const pendingSpeechTimer = useRef(null)
  const presentationIdleTimer = useRef(null)
  const previewCommentaryTimer = useRef(null)
  const preMechanicCategoryRef = useRef("Mainstream Streaming")
  const mechanicMotionFrameRef = useRef(null)
  const {address: connectedWallet, isConnected} = useAccount()
  const {sendTransaction, data: paymentHash, isPending: paymentPending, error: paymentError} = useSendTransaction()
  const {isSuccess: paymentConfirmed} = useWaitForTransactionReceipt({hash: paymentHash})

  const activeTours = toursFor(category)
  const activeTour = activeTours.find((item) => item.id === tour) || activeTours[0]
  const stage = stages[stageIndex]
  const feed = feeds[active] || feeds[0] || rotateFreshList(seedFeeds(category), freshnessSeed, `${category}:active-feed-fallback`)[0]
  const similarFeed = feeds[(active + 1) % Math.max(feeds.length, 1)] || feed
  const statsFeed = statsFeeds[0] || createStatsFeed(feed, category, activeTour)
  const sceneFeed = stage.kind === "similar" ? similarFeed : stage.kind === "stats" ? statsFeed : feed
  const paid = ["premium", "pro"].includes(tier)
  const guided = mode === "premium" && playing
  const aiLimit = AI_TIER_LIMITS[tier] ?? AI_TIER_LIMITS.guest
  const aiRemainingMs = aiLimit === Infinity ? Infinity : Math.max(0, aiLimit - aiUsage.usedMs)
  const currentGuideLine = guideDepth > 0 ? extendedGuideLine({category, stage, feed: sceneFeed, tour: activeTour, depth: guideDepth - 1}) : guideLine({category, stage, feed: sceneFeed, tour: activeTour})
  const currentFollowUps = followUpNotes({category, stage, feed: sceneFeed, tour: activeTour})
  const presentationChapter = timelineChapterFor(presentationProgress)
  const presentationCaption = chapterCaption({chapter: presentationChapter, category, feed: sceneFeed, tier, source: sceneFeed.apiSource || sceneFeed.apiStatus})
  const aiDock = presentationFeatureOpen ? "notes" : notesOpen ? "notes" : aiOpen ? "command" : modelOpen ? `stage-${stage.kind}` : guided ? "guided" : "idle"
  const liveModelLink = sceneFeed.modelUrl || sceneFeed.viewerUrl || sceneFeed.embedUrl || window.location.href
  const sceneVisualKey = visualKeyFor(sceneFeed, stage)
  const autoDelay = Math.round(22000 / presentationSpeed)
  const runtimePaused = !runtimeState.online || !runtimeState.visible
  const glbPresentationActive = modelOpen && playing
  const presentationLive = (autoPresent || podcastFeatureOpen || glbPresentationActive) && !runtimePaused
  const livePulseOffset = presentationLive ? Math.sin((Number(analyticsClock) || 0) / 16) * 1.4 : 0
  const liveAnalyticsProgress = presentationLive
    ? Math.max(0, Math.min(100, presentationProgress + livePulseOffset))
    : presentationProgress
  const observatoryConstructionClock = presentationLive ? Math.max(0, Number(analyticsClock) - Number(observatoryBuildSeed)) : 0
  const adResetWindow = presentationChapter.id === "source" || (liveAnalyticsProgress >= 18 && liveAnalyticsProgress < 31) || (liveAnalyticsProgress >= 82 && liveAnalyticsProgress < 95)
  const constructionCycleLength = adResetWindow ? 190 : 640
  const observatoryCycleClock = presentationLive ? observatoryConstructionClock % constructionCycleLength : 0
  const observatoryConstructionProgress = presentationLive
    ? Math.round((observatoryCycleClock / constructionCycleLength) * (adResetWindow ? 34 : 100))
    : 0
  const streamAnalytics = streamAnalyticsFor({category, chapter: presentationChapter, feed: sceneFeed, progress: liveAnalyticsProgress, visualReady: sceneVisualKey === visualReadyKey, livePosts, speed: presentationSpeed})
  const seoRevenueFrame = seoRevenueFrameFor({category, feed: sceneFeed, chapter: presentationChapter})
  const liveLongTailKeywords = originalLongTailKeywordsFor({
    topic: sceneFeed.title || query || category,
    market: category,
    platform: presentationChapter.id === "video" ? "TikTok" : presentationChapter.id === "podcast" ? "Instagram" : "",
    year: "2026",
    audience: category === "Gamer" ? "Gamer" : category === "Real Estate" ? "Client" : category === "Researcher" ? "Researcher" : ""
  }).slice(0, 10)
  const youtubeStory = youtubeStoryFor({query, category, feed: sceneFeed, chapter: presentationChapter, progress: liveAnalyticsProgress, streamAnalytics, liveLongTailKeywords, youtubeSearch, videoIndex: youtubeVideoIndex, freshSeed: freshnessSeed})
  const contentRadar = youtubeStory.contentRadar || {}
  const podcastClip = podcastClipForStory({podcastSearch, youtubeStory, contentRadar, category, index: podcastClipIndex, freshSeed: freshnessSeed})
  const observatoryAnalysis = observatoryAnalyzerFor({
    category,
    chapter: presentationChapter,
    feed: sceneFeed,
    progress: liveAnalyticsProgress,
    visualReady: sceneVisualKey === visualReadyKey,
    livePosts,
    speed: presentationSpeed,
    runtimeState,
    performanceProfile,
    streamAnalytics,
    layer,
    stage,
    liveSyncStatus,
    clock: analyticsClock
  })
  const youtubeSignalField = youtubeSignalFieldFor({story: youtubeStory, chapter: presentationChapter, progress: liveAnalyticsProgress, streamAnalytics, observatoryAnalysis, liveLongTailKeywords, clock: analyticsClock})
  const youtubeGlbDock = youtubeGlbDockFor({category, feed: sceneFeed, feeds, active, stage, progress: liveAnalyticsProgress, freshSeed: freshnessSeed})
  const backlinkRadar = contentBacklinkRadarFor({story: youtubeStory, category, feed: sceneFeed, glbDock: youtubeGlbDock, liveLongTailKeywords, progress: observatoryConstructionProgress, clock: analyticsClock})
  const youtubeSeekSeconds = Math.max(0, Math.round((Number(presentationProgress) || 0) * 1.2))
  const analyzerTimeBucket = Math.floor(youtubeSeekSeconds / 18)
  const analyzerSourceId = youtubeVideoIdFor(youtubeStory.primaryVideo) || youtubeStory.primaryVideo?.id || youtubeStory.searchPhrase || sceneFeed.title
  const liveMeaning = liveMeaningFor({story: youtubeStory, category, feed: sceneFeed, glbDock: youtubeGlbDock, liveLongTailKeywords, progress: observatoryConstructionProgress, seconds: Math.round(observatoryConstructionProgress * 1.2), clock: analyticsClock})
  const episodeVisual = episodeVisualFor({meaning: liveMeaning, observatoryAnalysis, backlinkRadar, progress: observatoryConstructionProgress})
  const episodePreviews = digitalhutEpisodePreviewsFor({category, query, feed: sceneFeed, youtubeStory, youtubeSearch, freshSeed: freshnessSeed})
  const activeProofPost = proofPostForLiveLane({category, feed: sceneFeed, query: youtubeStory.searchPhrase || query, keywords: liveLongTailKeywords})
  const activeProofLane = seoUsefulnessLaneFor(activeProofPost || {category, title: sceneFeed.title, keywords: liveLongTailKeywords})
  const activeCategoryProofRoute = `/category/${proofSlug(activeProofPost?.category || category)}`
  const activeWatchProofRoute = activeProofPost?.watchPageRoute || `/watch/${proofSlug(activeProofPost?.slug || sceneFeed.title || category)}`
  const activeBlogProofRoute = `/blog/${activeProofPost?.slug || proofSlug(sceneFeed.title || category)}`
  const proofIntentLinks = [
    {id: "category-proof", label: "Category Proof", value: activeProofPost?.category || category, url: activeCategoryProofRoute},
    {id: "watch-proof", label: "Watch Proof", value: activeProofPost?.keywords?.[0] || liveLongTailKeywords[0] || sceneFeed.title, url: activeWatchProofRoute},
    {id: "blog-proof", label: "Blog Proof", value: activeProofPost?.proofFocus || activeProofLane.observatoryPlacement, url: activeBlogProofRoute}
  ]
  const proofSourceBridgeLinks = [
    {
      id: "system-proof",
      label: digitalhutMasterListBridge.proofLabel,
      value: "System proof",
      eventName: "proof_route_open",
      url: digitalhutMasterListBridge.proofRoute,
      keywordHint: digitalhutMasterListBridge.proofKeywordHint
    },
    {
      id: "source-bridge",
      label: digitalhutMasterListBridge.sourceLabel,
      value: "Source trail",
      eventName: "backlink_source_open",
      url: digitalhutSourceBridgePath({
        lane: category,
        proof: activeProofPost?.slug || proofSlug(sceneFeed.title || category),
        source: "live-content-radar"
      }),
      keywordHint: digitalhutMasterListBridge.sourceKeywordHint
    }
  ]
  const featuredEpisodeCategories = [category, ...lobbyCategories.filter((item) => item !== category)].slice(0, 6)
  const gateFor = (threshold) => !presentationLive || runtimePaused
    ? "queued"
    : observatoryConstructionProgress >= threshold
      ? "live"
      : observatoryConstructionProgress >= Math.max(0, threshold - 12)
        ? "building"
        : "queued"
  const podcastMomentActive = presentationLive && (liveMeaning.id === "podcast" || podcastFeatureOpen)
  const glbSmartExpanded = presentationLive && (liveMeaning.id === "three-d" || (observatoryConstructionProgress >= 32 && observatoryConstructionProgress < 58))
  const sceneShiftIndex = Math.floor((youtubeSeekSeconds + Math.floor((Number(analyticsClock) || 0) / 5)) / 12) % 8
  const designJumpIndex = presentationLive
    ? (sceneShiftIndex + Math.floor(observatoryCycleClock / (adResetWindow ? 18 : 44))) % 12
    : sceneShiftIndex
  const matrixConstruction = matrixConstructionCellsFor({meaning: liveMeaning, story: youtubeStory, category, constructionProgress: observatoryConstructionProgress, sceneShiftIndex: designJumpIndex, adResetWindow, podcastMomentActive, glbSmartExpanded})
  const analyticsStarted = presentationLive
  const observatoryBuildCycle = analyticsStarted ? Math.floor(observatoryConstructionClock / constructionCycleLength) : 0
  const metricBuildBeat = analyticsStarted ? Math.floor(observatoryCycleClock / 22) : 0
  const analyticsCells = analyticsStarted ? matrixConstruction.cells.filter((cell) => cell.visible) : []
  const sourcePreviewSlot = Math.floor(observatoryCycleClock / 72) % Math.max(1, backlinkRadar.links.length)
  const sourcePreview = backlinkRadar.links[sourcePreviewSlot] || backlinkRadar.links[0]
  const sourcePreviewLive = analyticsStarted && Boolean(sourcePreview) && observatoryConstructionProgress >= 24 && ((observatoryCycleClock % 144) >= 48 && (observatoryCycleClock % 144) <= 96 || liveMeaning.id === "backlinks")
  const sourcePreviewHost = (() => {
    try {
      return new URL(sourcePreview?.url || "").hostname.replace(/^www\./, "")
    } catch {
      return "source preview"
    }
  })()
  const storyHeroImages = [
    youtubeStory.primaryVideo?.thumbnail,
    youtubeStory.primaryVideo?.thumbnails?.maxres?.url,
    youtubeStory.primaryVideo?.thumbnails?.high?.url,
    youtubeStory.primaryVideo?.thumbnails?.medium?.url,
    youtubeStory.thumbnail,
    ...episodePreviews.map((item) => item.thumbnail),
    sceneFeed.thumbnail,
    stockUrl(category, sceneShiftIndex),
    stockUrl(liveMeaning.id, sceneShiftIndex)
  ].filter(Boolean)
  const storyHeroIndex = analyticsStarted
    ? (sceneShiftIndex + episodeVisual.activeIndex + (adResetWindow ? 1 : 0) + (podcastMomentActive ? 2 : 0) + (sourcePreviewLive ? 3 : 0)) % Math.max(1, storyHeroImages.length)
    : 0
  const storyHeroImage = String(storyHeroImages[storyHeroIndex] || stockUrl(category, 0)).replace(/"/g, "%22")
  const constructionDetailRatio = Math.pow(Math.max(0, Math.min(1, observatoryConstructionProgress / 100)), 1.65)
  const statResolveRatio = Math.pow(Math.max(0, Math.min(1, observatoryConstructionProgress / 100)), .72)
  const lightText = `${youtubeStory.topic || ""} ${youtubeStory.episodeName || ""} ${youtubeStory.searchPhrase || ""} ${sceneFeed.title || ""} ${category || ""}`.toLowerCase()
  const lightBase = /sun|day|outside|outdoor|sky|beach|ocean|coral|resort|vacation|real estate|house|home|field|city|launch|moon|planet|space|travel|bright|street|tour/i.test(lightText)
    ? .82
    : /night|dark|underground|indoor|inside|lab|code|server|archive/i.test(lightText)
      ? .42
      : .6
  const sceneLightPulse = analyticsStarted
    ? Math.max(.22, Math.min(1, lightBase + Math.sin((Number(analyticsClock) || 0) * .42 + storyHeroIndex) * .16 + (adResetWindow ? -.18 : 0) + (podcastMomentActive ? .12 : 0)))
    : .16
  const sceneMotionTempo = Math.max(.72, Math.min(1.9, Number(streamAnalytics.pace || 1) + (matrixConstruction.mode === "ad" ? .22 : 0) + (glbSmartExpanded ? .16 : 0) + (sceneLightPulse > .74 ? .12 : 0)))
  const analysisConfidence = Math.max(36, Math.min(99, Math.round((Number(observatoryAnalysis.score || observatoryAnalysis.confidence || streamAnalytics.score || 64) * .72) + (observatoryConstructionProgress * .28))))
  const structuredIntelMap = structuredIntelMapFor({story: youtubeStory, category, feed: sceneFeed, meaning: liveMeaning, backlinkRadar, glbDock: youtubeGlbDock, progress: liveAnalyticsProgress, confidence: analysisConfidence, sceneLightPulse})
  const structuredNodeBuildCount = analyticsStarted ? Math.max(1, Math.min(structuredIntelMap.nodes.length, Math.floor(Math.max(0, observatoryConstructionProgress - 3) / 12) + 1)) : 0
  const visibleStructuredNodes = structuredIntelMap.nodes.slice(0, structuredNodeBuildCount)
  const visibleStructuredBars = analyticsStarted ? structuredIntelMap.bars.slice(0, Math.max(1, Math.min(structuredIntelMap.bars.length, Math.floor(Math.max(0, observatoryConstructionProgress - 12) / 14) + 1))) : []
  const visibleStructuredLoops = analyticsStarted ? structuredIntelMap.loops.slice(0, Math.max(1, Math.min(structuredIntelMap.loops.length, Math.floor(Math.max(0, observatoryConstructionProgress - 20) / 16) + 1))) : []
  const visibleStructuredLayers = analyticsStarted ? structuredIntelMap.layers.slice(0, Math.max(1, Math.min(structuredIntelMap.layers.length, Math.floor(Math.max(0, observatoryConstructionProgress - 8) / 18) + 1))) : []
  const visibleEvidenceRows = analyticsStarted ? structuredIntelMap.evidenceRows.slice(0, Math.max(1, Math.min(structuredIntelMap.evidenceRows.length, Math.floor(Math.max(0, observatoryConstructionProgress - 10) / 10) + 1))) : []
  const visibleComparisonRows = analyticsStarted ? structuredIntelMap.comparisonRows.slice(0, Math.max(1, Math.min(structuredIntelMap.comparisonRows.length, Math.floor(Math.max(0, observatoryConstructionProgress - 16) / 12) + 1))) : []
  const visibleEntityTags = analyticsStarted ? structuredIntelMap.entities.slice(0, Math.max(1, Math.min(structuredIntelMap.entities.length, Math.floor(Math.max(0, observatoryConstructionProgress - 5) / 12) + 1))) : []
  const structuredReadIndex = analyticsStarted && visibleStructuredNodes.length ? Math.floor((observatoryCycleClock / 18) % visibleStructuredNodes.length) : 0
  const structuredActiveNode = visibleStructuredNodes[structuredReadIndex] || visibleStructuredNodes[0] || structuredIntelMap.nodes[0]
  const structuredSystemRead = structuredActiveNode ? `${structuredActiveNode.label}: ${structuredActiveNode.detail}` : structuredIntelMap.status
  const baseVideoRead = usefulVideoReadFor({
    story: youtubeStory,
    contentRadar,
    category,
    feed: sceneFeed,
    seconds: youtubeSeekSeconds,
    progress: liveAnalyticsProgress,
    meaning: liveMeaning,
    structuredIntelMap,
    backlinkRadar,
    confidence: analysisConfidence,
    sourcePreviewHost
  })
  const usefulVideoRead = analyzerUsefulReadFor(baseVideoRead, contentAnalyzer)
  const smartGlbSlot = youtubeGlbDock.find((slot) => slot.active) || youtubeGlbDock[0]
  const smartGlbResearchFeed = smartGlbSlot?.feed || sceneFeed
  const smartGlbResearchEmbedUrl = providerEmbedUrl(smartGlbResearchFeed)
  const smartGlbResearchDirectModelUrl = exactRenderableModelUrl(smartGlbResearchFeed)
  const smartGlbResearchModelUrl = cleanUrl(smartGlbResearchDirectModelUrl || smartGlbSlot?.modelUrl || relatedGlb(smartGlbResearchFeed?.category || category, 0))
  const activeGlbPlayFeed = selectedGlbPlayAsset?.feed || smartGlbResearchFeed
  const activeGlbPlayLabel = selectedGlbPlayAsset?.label || "Research GLB"
  const activeGlbPlayEmbedUrl = autoplayEmbedUrl(selectedGlbPlayAsset?.embedUrl || providerEmbedUrl(activeGlbPlayFeed))
  const activeGlbPlayModelUrl = cleanUrl(selectedGlbPlayAsset?.modelUrl || exactRenderableModelUrl(activeGlbPlayFeed))
  const activeGlbBackupModelUrl = !activeGlbPlayEmbedUrl && !activeGlbPlayModelUrl ? cleanUrl(selectedGlbPlayAsset?.fallbackModelUrl || verifiedBackupModelUrl(activeGlbPlayFeed, category, active)) : ""
  const activeGlbPlaySourceLabel = activeGlbPlayEmbedUrl
    ? "Live provider viewer"
    : activeGlbPlayModelUrl
      ? "Direct API GLB"
      : activeGlbBackupModelUrl
        ? "Verified backup GLB"
        : "Waiting for API GLB"
  const youtubeSourceMode = youtubeSearch?.quotaProtected
    ? "Quota-safe storyboard"
    : youtubeSearch?.status?.includes("api-live")
      ? "YouTube API matched"
      : youtubeSearch?.status?.includes("loading")
        ? "YouTube loading"
        : "Category storyboard"
  const podcastSourceMode = podcastClip?.isLivePodcast
    ? "Live podcast"
    : podcastSearch?.status?.includes("podcast-api-live")
      ? "Podcast API live"
      : podcastSearch?.status?.includes("fallback")
        ? "Podcast source retry"
        : "Podcast matching"
  const podcastClipReady = Boolean(podcastClip?.audioUrl || podcastClip?.embedUrl || podcastClip?.pageUrl)
  const providerStatusItems = Array.isArray(apiProviderStatus.status) ? apiProviderStatus.status : []
  const providerStatusById = new Map(providerStatusItems.map((item) => [item.id, item]))
  const providerConfigured = (id) => Boolean(providerStatusById.get(id)?.configured)
  const glbProviderStack = [
    {id: "sketchfab", label: "Sketchfab", role: "general GLBs", configured: providerConfigured("sketchfab")},
    {id: "cesium", label: "Cesium", role: "3D terrain", configured: providerConfigured("cesium")}
  ]
  const marketProviderStack = [
    {id: "alpha-vantage", label: "Alpha", role: "quote/stat", configured: providerConfigured("alpha-vantage")},
    {id: "fmp", label: "FMP", role: "market feed", configured: providerConfigured("fmp")},
    {id: "polygon", label: "Polygon", role: "ticker feed", configured: providerConfigured("polygon")}
  ]
  const activeMarketProviderCount = marketProviderStack.filter((item) => item.configured).length
  const apiProviderLine = `${glbProviderStack.filter((item) => item.configured).length}/${glbProviderStack.length} GLB APIs, ${activeMarketProviderCount}/${marketProviderStack.length} market APIs`
  const activeCurrentMarketStock = marketStockFor(sceneFeed.market?.symbol || currentMarketInput || query)
  const currentMarketActive = currentMarketOpen || Boolean(sceneFeed.market?.chartUrl) || sceneFeed.apiStatus === "current-market-live" || sceneFeed.tags?.includes?.("current market")
  const currentMarketHighlights = currentMarketHighlightsFor({
    feed: sceneFeed,
    stock: activeCurrentMarketStock,
    youtubeStory,
    podcastClip,
    glbFeed: smartGlbResearchFeed,
    providerLine: apiProviderLine,
    progress: observatoryConstructionProgress,
    clock: analyticsClock
  })
  const visibleCurrentMarketHighlights = currentMarketActive
    ? currentMarketHighlights.slice(0, Math.max(1, Math.min(currentMarketHighlights.length, Math.floor(Math.max(0, observatoryConstructionProgress - 4) / 10) + 1)))
    : []
  const quickMarketOptionPicks = quickMarketOptionPicksFor({feed: sceneFeed, stock: activeCurrentMarketStock, freshSeed: freshnessSeed})
  const platformCadence = platformCadenceFor({
    category,
    episodePreviews,
    youtubeSearch,
    youtubeStory,
    contentAnalyzer,
    proofPost: activeProofPost,
    proofLinks: proofIntentLinks,
    presentationLive,
    autoPresent,
    podcastFeatureOpen,
    currentMarketActive,
    runtimeState,
    activeStock: activeCurrentMarketStock
  })
  const searchIntentSuggestions = searchIntentSuggestionsFor({
    category,
    proofPost: activeProofPost,
    liveLongTailKeywords,
    quickMarketOptionPicks,
    activeStock: activeCurrentMarketStock,
    youtubeStory,
    feed: sceneFeed
  })
  const intelligentStoryStats = [
    {id: "scene", code: "video.scene", label: liveMeaning.label, value: `${Math.round(liveAnalyticsProgress)}%`, detail: liveMeaning.videoCue, fill: Math.max(12, Math.round(liveAnalyticsProgress)), tone: "video"},
    {id: "light", code: "visual.light", label: sceneLightPulse > .72 ? "bright / open" : sceneLightPulse < .45 ? "low light / tight" : "mixed light", value: `${Math.round(sceneLightPulse * 100)}%`, detail: sceneLightPulse > .72 ? "display lights up with the scene" : "contrast tracking", fill: Math.round(sceneLightPulse * 100), tone: "light"},
    {id: "source", code: "source.match", label: sourcePreviewHost, value: sourcePreviewLive ? "live" : `${Math.max(1, backlinkRadar.links.length)} refs`, detail: sourcePreview?.signal || "website lane waiting", fill: sourcePreviewLive ? 92 : Math.max(34, Math.min(88, backlinkRadar.links.length * 18)), tone: "source"},
    {id: "glb", code: "glb.depth", label: glbSmartExpanded ? "3D expanded" : "3D preview", value: `${Math.round(58 + statResolveRatio * 36)}%`, detail: youtubeGlbDock?.[0]?.feed?.title || liveMeaning.glbCue, fill: Math.round(58 + statResolveRatio * 36), tone: "glb"},
    {id: "podcast", code: "voice.moment", label: podcastMomentActive ? "guest moment" : "standby", value: podcastMomentActive ? "pulse" : `${Math.round(statResolveRatio * 100)}%`, detail: liveMeaning.podcastCue, fill: podcastMomentActive ? 96 : Math.round(statResolveRatio * 78), tone: "podcast"},
    {id: "confidence", code: "ai.read", label: "story confidence", value: `${analysisConfidence}%`, detail: youtubeSignalField.mode || matrixConstruction.mode, fill: analysisConfidence, tone: "ai"}
  ]
  const visibleStoryStats = analyticsStarted ? intelligentStoryStats.slice(0, Math.max(1, Math.min(intelligentStoryStats.length, Math.floor(Math.max(0, observatoryConstructionProgress - 8) / 16) + 1))) : []
  const timelineBuildCount = analyticsStarted ? Math.max(0, Math.min(episodeVisual.funnel.length, Math.ceil(Math.max(0, constructionDetailRatio - .04) * episodeVisual.funnel.length))) : 0
  const visibleTimelineNodes = episodeVisual.funnel.slice(0, timelineBuildCount)
  const reactiveMapPoints = [
    {id: "scene", x: 23, y: 31, layer: "media", ...intelligentStoryStats[0]},
    {id: "light", x: 75, y: 28, layer: "environment", ...intelligentStoryStats[1]},
    {id: "source", x: 18, y: 68, layer: "references", ...intelligentStoryStats[2]},
    {id: "glb", x: 80, y: 68, layer: "render", ...intelligentStoryStats[3]},
    {id: "podcast", x: 50, y: 83, layer: "moment", ...intelligentStoryStats[4]},
    {id: "confidence", x: 50, y: 17, layer: "ai", ...intelligentStoryStats[5]}
  ]
  const visibleReactiveMapPoints = analyticsStarted ? reactiveMapPoints.slice(0, Math.max(1, Math.min(reactiveMapPoints.length, Math.floor(Math.max(0, observatoryConstructionProgress - 6) / 17) + 1))) : []
  const treeRebuildPhase = analyticsStarted ? Math.floor(observatoryConstructionProgress / 50) : 0
  const treeBuildProgress = analyticsStarted ? Math.round(observatoryConstructionProgress % 50) : 0
  const treeResetActive = analyticsStarted && (observatoryConstructionProgress >= 48 && observatoryConstructionProgress < 56)
  const stageTreeRoot = {x: 58, y: 31}
  const stageTreeTrunkPath = `M41 24 C47 10 55 16 ${stageTreeRoot.x} ${stageTreeRoot.y} C69 44 76 52 75 62 C68 80 55 88 43 92`
  const stageBranchPath = (node) => `M${stageTreeRoot.x} ${stageTreeRoot.y} C${stageTreeRoot.x + (node.x - stageTreeRoot.x) * .28} ${stageTreeRoot.y + (node.y - stageTreeRoot.y) * .1} ${node.x - (node.x - stageTreeRoot.x) * .22} ${node.y - (node.y - stageTreeRoot.y) * .13} ${node.x} ${node.y}`
  const stageSourceBranchPath = (index) => `M75 62 C${79 + index * 2.6} ${67 + index * 3.6} ${85 - index * 2} ${75 + index * 4.5} ${88 - index * 7} ${87 - index * 2.4}`
  const stageTreeNodes = [
    {id: "video", x: 41, y: 24, code: "video.pickup", label: liveMeaning.videoCue, value: `${Math.round(liveAnalyticsProgress)}%`, fill: Math.max(18, Math.round(liveAnalyticsProgress)), tone: "video", route: "frames routed"},
    {id: "top-seed", x: 50, y: 8, code: "logic.seed", label: treeRebuildPhase % 2 ? "new data rebuild" : "story structure", value: `${treeBuildProgress}%`, fill: Math.max(12, treeBuildProgress * 2), tone: "ai", route: "chapter logic"},
    {id: "map", x: 58, y: 31, code: "system.map", label: liveMeaning.label, value: matrixConstruction.mode, fill: analysisConfidence, tone: "ai", route: "meaning core"},
    {id: "glb", x: 86, y: 12, code: "glb.corner", label: glbSmartExpanded ? "expanding model tree" : "model branch waiting", value: `${Math.round(58 + statResolveRatio * 36)}%`, fill: Math.round(58 + statResolveRatio * 36), tone: "glb", route: "3d attached"},
    {id: "source", x: 75, y: 62, code: "web.preview", label: sourcePreviewHost, value: sourcePreviewLive ? "linked" : `${Math.max(1, backlinkRadar.links.length)} refs`, fill: sourcePreviewLive ? 94 : Math.max(28, Math.min(82, backlinkRadar.links.length * 18)), tone: "source", route: "proof branch"},
    {id: "podcast", x: 89, y: 81, code: "guest.pulse", label: podcastMomentActive ? "speaker encompassed" : "speaker waiting", value: podcastMomentActive ? "pulse" : `${Math.round(statResolveRatio * 100)}%`, fill: podcastMomentActive ? 98 : Math.round(statResolveRatio * 78), tone: "podcast", route: "moment socket"},
    {id: "floor", x: 43, y: 92, code: "timeline.root", label: "bottom data roots", value: `${visibleTimelineNodes.length} nodes`, fill: Math.max(16, visibleTimelineNodes.length * 18), tone: "source", route: "episode roots"}
  ]
  const visibleStageTreeNodes = analyticsStarted ? stageTreeNodes.slice(0, Math.max(1, Math.min(stageTreeNodes.length, Math.floor(Math.max(0, treeBuildProgress - 2) / 8) + 1))) : []
  const visibleTreeSourceLinks = analyticsStarted && treeBuildProgress >= 24 ? backlinkRadar.links.slice(0, Math.max(1, Math.min(3, Math.floor((treeBuildProgress - 18) / 9)))) : []
  const visualBuildCount = analyticsStarted ? Math.max(0, Math.min(analyticsCells.length, Math.ceil(constructionDetailRatio * analyticsCells.length))) : 0
  const visualBuildCells = analyticsCells.slice(0, visualBuildCount)
  const constellationBuildCount = analyticsStarted ? Math.max(0, Math.min(youtubeSignalField.packets.length, Math.ceil(Math.max(0, constructionDetailRatio - .08) * youtubeSignalField.packets.length))) : 0
  const constellationPackets = youtubeSignalField.packets.slice(0, constellationBuildCount)
  const popoutBuildCount = analyticsStarted ? Math.max(0, Math.min(episodeVisual.graph.length, Math.ceil(Math.max(0, constructionDetailRatio - .18) * episodeVisual.graph.length))) : 0
  const popoutGraphItems = episodeVisual.graph.slice(0, popoutBuildCount)
  const sourceNodeBuildCount = analyticsStarted && observatoryConstructionProgress >= 52 ? Math.max(1, Math.min(3, Math.ceil((observatoryConstructionProgress - 50) / 22))) : 0
  const visibleSourceNodes = backlinkRadar.links.slice(0, sourceNodeBuildCount)
  const analyticsBacklinkUrl = backlinkForFeed(sceneFeed)
  const activeObjectBacklinkUrl = backlinkForFeed(youtubeGlbDock?.[0]?.feed || sceneFeed)
  const observatoryCommandCards = [
    {
      id: "episode",
      label: "Episode",
      value: youtubeStory.episodeName,
      detail: `${liveMeaning.label} / ${Math.round(liveAnalyticsProgress)}%`,
      fill: Math.max(12, Math.round(liveAnalyticsProgress)),
      tone: "episode"
    },
    {
      id: "views",
      label: "Page Views",
      value: streamAnalytics.metrics.views.toLocaleString(),
      detail: `${streamAnalytics.metrics.likes.toLocaleString()} likes / ${streamAnalytics.metrics.comments.toLocaleString()} comments`,
      fill: Math.max(28, Math.min(100, Math.round(44 + streamAnalytics.pace * 22))),
      tone: "views",
      url: analyticsBacklinkUrl
    },
    {
      id: "backlinks",
      label: "Backlinks",
      value: `${backlinkRadar.links.length} active`,
      detail: backlinkRadar.focus,
      fill: Math.max(32, Math.min(100, backlinkRadar.links.length * 18 + observatoryConstructionProgress / 2)),
      tone: "link"
    },
    {
      id: "source",
      label: "Website Link",
      value: sourcePreviewHost,
      detail: sourcePreview?.signal || "source lane armed",
      fill: sourcePreviewLive ? 96 : Math.max(30, Math.min(82, backlinkRadar.links.length * 16)),
      tone: "source",
      url: sourcePreview?.url || youtubeStory.searchUrl
    },
    {
      id: "sponsor",
      label: "Sponsored Stack",
      value: adResetWindow || liveMeaning.id === "sponsored" ? "live reset" : "armed",
      detail: youtubeStory.adTracker,
      fill: adResetWindow || liveMeaning.id === "sponsored" ? 96 : Math.max(36, Math.round(statResolveRatio * 74)),
      tone: "sponsor"
    },
    {
      id: "podcast",
      label: "Auto Podcast",
      value: podcastMomentActive ? "speaker live" : "switch ready",
      detail: liveMeaning.podcastCue,
      fill: podcastMomentActive ? 98 : Math.max(34, Math.round(statResolveRatio * 80)),
      tone: "podcast"
    }
  ]
  const commandCardCount = analyticsStarted ? Math.max(1, Math.min(observatoryCommandCards.length, Math.floor(Math.max(0, observatoryConstructionProgress - 4) / 12) + 1)) : 0
  const visibleCommandCards = observatoryCommandCards.slice(0, commandCardCount)
  const visibleCommandLinks = analyticsStarted && commandCardCount >= 3
    ? backlinkRadar.links.slice(0, Math.max(1, Math.min(3, Math.floor(Math.max(0, observatoryConstructionProgress - 26) / 18) + 1)))
    : []
  const radarEntities = Array.isArray(contentRadar.entities) ? contentRadar.entities : []
  const radarPrimary = usefulVideoRead.focus || contentRadar.primary || youtubeStory.topic || category
  const radarSecondary = radarEntities[1] || usefulVideoRead.channel || contentRadar.channel || sourcePreviewHost
  const radarTertiary = radarEntities[2] || usefulVideoRead.phase || liveMeaning.label
  const semanticAnalyzerSource = usefulVideoRead.confidenceLabel
  const semanticAnalyzerAction = usefulVideoRead.researchUse
  const selectedVideoSlot = youtubeStory.videoCount ? `${(youtubeStory.selectedVideoIndex || 0) + 1}/${youtubeStory.videoCount}` : "1/1"
  const analyzerMultiDisplayFeed = Array.isArray(contentAnalyzer?.analysis?.multiDisplayFeed)
    ? contentAnalyzer.analysis.multiDisplayFeed.slice(0, 5).map((item, index) => ({
      id: `analyzer-display-${index}`,
      label: `${item.display || `Display ${index + 1}`} Display`,
      value: item.signal || usefulVideoRead.focus,
      detail: item.status || contentAnalyzer.status || usefulVideoRead.currentRead,
      tone: ["video", "ai", "glb", "podcast", "source"][index % 5],
      url: index === 4 ? usefulVideoRead.backlinkUrl : ""
    }))
    : []
  const multiDisplayFeed = analyzerMultiDisplayFeed.length ? analyzerMultiDisplayFeed : [
    {id: "video", label: "Video Display", value: usefulVideoRead.title, detail: `${selectedVideoSlot} / ${usefulVideoRead.channel}`, tone: "video"},
    {id: "analyzer", label: "Analyzer Display", value: usefulVideoRead.focus, detail: usefulVideoRead.currentRead, tone: "ai"},
    {id: "glb", label: "3D Display", value: youtubeGlbDock?.[0]?.feed?.title || usefulVideoRead.focus, detail: usefulVideoRead.threeDPrompt, tone: "glb"},
    {id: "podcast", label: "Podcast Display", value: podcastClip.title || "podcast cue waiting", detail: podcastClip.channel || liveMeaning.podcastCue, tone: "podcast"},
    {id: "source", label: "Source Display", value: usefulVideoRead.backlinkTitle || sourcePreviewHost, detail: usefulVideoRead.backlinkSignal || backlinkRadar.focus, tone: "source", url: usefulVideoRead.backlinkUrl}
  ]
  const sponsorVeinNodes = [
    {
      id: "bubble",
      x: 50,
      y: 15,
      label: "Bubble Map",
      value: `${backlinkRadar.lanes.length} live lanes`,
      detail: `${radarPrimary} / ${sourcePreviewHost}`,
      fill: analysisConfidence,
      tone: "bubble"
    },
    {
      id: "objects",
      x: 14,
      y: 40,
      label: "3D Objects",
      value: `${youtubeGlbDock.length} GLB feeds`,
      detail: `${youtubeGlbDock?.[0]?.feed?.title || liveMeaning.glbCue} / ${backlinkRadar.links.length} refs`,
      fill: Math.round(58 + statResolveRatio * 36),
      tone: "objects"
    },
    {
      id: "source",
      x: 87,
      y: 36,
      label: "Website / Backlinks",
      value: sourcePreviewHost,
      detail: sourcePreview?.signal || `${backlinkRadar.links.length} source lanes`,
      fill: sourcePreviewLive ? 96 : Math.max(34, Math.min(86, backlinkRadar.links.length * 16)),
      tone: "source",
      url: sourcePreview?.url || youtubeStory.searchUrl
    },
    {
      id: "time",
      x: 48,
      y: 88,
      label: "Timeline Analytics",
      value: `${youtubeSeekSeconds}s`,
      detail: `${youtubeStory.episodeName} / ${liveMeaning.label}`,
      fill: Math.max(12, Math.round(liveAnalyticsProgress)),
      tone: "time"
    },
    {
      id: "podcast",
      x: 88,
      y: 72,
      label: "Podcast Switch",
      value: podcastMomentActive ? "speaker live" : "armed",
      detail: liveMeaning.podcastCue,
      fill: podcastMomentActive ? 98 : Math.max(36, Math.round(statResolveRatio * 80)),
      tone: "podcast",
      url: analyticsBacklinkUrl
    }
  ]
  const sponsorVeinCount = analyticsStarted
    ? Math.max(1, Math.min(sponsorVeinNodes.length, Math.floor(Math.max(0, observatoryConstructionProgress - 6) / 13) + 1))
    : 0
  const visibleSponsorVeinNodes = sponsorVeinNodes.slice(0, sponsorVeinCount)
  const sponsorVeinPath = (node) => `M50 48 C${50 + (node.x - 50) * .1} ${48 + (node.y - 48) * .24} ${node.x - (node.x - 50) * .28} ${node.y - (node.y - 48) * .18} ${node.x} ${node.y}`
  const keyFindTimelineItems = [
    {
      id: "hook",
      marker: "00s",
      label: "Hook Topic",
      value: radarPrimary,
      detail: usefulVideoRead.currentRead || contentRadar.title || youtubeStory.episodeName,
      fill: Math.max(14, Math.round(liveAnalyticsProgress)),
      tone: "episode",
      url: analyticsBacklinkUrl
    },
    {
      id: "subject",
      marker: `${youtubeSeekSeconds}s`,
      label: "Content Meaning",
      value: radarSecondary,
      detail: semanticAnalyzerAction || contentRadar.signalLine || liveMeaning.videoCue,
      fill: Math.max(28, Math.min(100, Math.round(44 + streamAnalytics.pace * 22))),
      tone: "ai"
    },
    {
      id: "proof",
      marker: "SRC",
      label: "Source Proof",
      value: sourcePreviewHost,
      detail: sourcePreview?.signal || backlinkRadar.focus,
      fill: Math.max(34, Math.min(100, backlinkRadar.links.length * 18 + observatoryConstructionProgress / 2)),
      tone: "source",
      url: sourcePreview?.url || youtubeStory.searchUrl
    },
    {
      id: "handoff",
      marker: "3D",
      label: "3D Meaning Handoff",
      value: usefulVideoRead.focus,
      detail: `Build visual context for ${liveMeaning.glbCue}`,
      fill: Math.round(58 + statResolveRatio * 36),
      tone: "objects",
      url: activeObjectBacklinkUrl
    },
    {
      id: "slot",
      marker: "VID",
      label: "Video Slot",
      value: selectedVideoSlot,
      detail: contentRadar.channel || youtubeStory.provider,
      fill: sourcePreviewLive ? 96 : Math.max(32, Math.min(82, backlinkRadar.links.length * 16)),
      tone: "source",
      url: youtubeStory.searchUrl
    },
    {
      id: "podcast",
      marker: "MIC",
      label: "Podcast Moment",
      value: podcastMomentActive ? "speaker live" : "switch ready",
      detail: `${radarTertiary} / ${liveMeaning.podcastCue}`,
      fill: podcastMomentActive ? 98 : Math.max(36, Math.round(statResolveRatio * 80)),
      tone: "podcast"
    }
  ]
  const analyzerTimelineItems = Array.isArray(contentAnalyzer?.analysis?.timeline)
    ? contentAnalyzer.analysis.timeline.slice(0, 7).map((item, index) => ({
      id: item.id || `analyzer-moment-${index}`,
      marker: item.at || `${index * 18}s`,
      label: item.label || `Analyzer Moment ${index + 1}`,
      value: item.entity || usefulVideoRead.entities?.[index] || usefulVideoRead.focus,
      detail: item.summary || usefulVideoRead.currentRead,
      fill: Math.max(16, Math.min(100, Math.round(observatoryConstructionProgress + index * 7))),
      tone: index === 2 ? "objects" : index % 3 === 0 ? "episode" : index % 3 === 1 ? "ai" : "source",
      url: item.backlink || usefulVideoRead.backlinkUrl
    }))
    : []
  const timelineAnalyticsItems = analyzerTimelineItems.length ? analyzerTimelineItems : keyFindTimelineItems
  const visibleKeyFindTimeline = analyticsStarted
    ? timelineAnalyticsItems.slice(0, Math.max(1, Math.min(timelineAnalyticsItems.length, Math.floor(Math.max(0, observatoryConstructionProgress - 10) / 11) + 1)))
    : []
  const analyzerObjectReads = Array.isArray(contentAnalyzer?.analysis?.threeDObjects) ? contentAnalyzer.analysis.threeDObjects : []
  const selfCreatingObjectCards = youtubeGlbDock.slice(0, 3).map((slot, index) => ({
    id: slot.id || `object-${index}`,
    label: slot.active ? "Auto GLB Replica" : slot.label || `Replica ${index + 1}`,
    title: analyzerObjectReads[index]?.label || slot.feed?.title || `${usefulVideoRead.focus} 3D research model`,
    status: analyzerObjectReads[index]?.status || (slot.active ? "semantic Play Preview ready" : "meaning replica building"),
    sourceTitle: analyzerObjectReads[index]?.modelQuery || usefulVideoRead.currentRead || contentRadar.subjectLine || youtubeStory.primaryVideo?.title || youtubeStory.searchPhrase || sceneFeed.title,
    reader: analyzerObjectReads[index]?.prompt || (index === 0 ? usefulVideoRead.threeDPrompt : `${usefulVideoRead.focus} object lane ${index + 1}: ${usefulVideoRead.entities?.[index] || liveMeaning.glbCue}`),
    videoFact: `${usefulVideoRead.channel} / ${usefulVideoRead.metricLine}`,
    fill: slot.active ? 96 : Math.max(38, Math.min(92, Math.round(42 + statResolveRatio * 48 + index * 7))),
    feed: slot.feed,
    tone: "objects",
    url: analyzerObjectReads[index]?.backlink || backlinkForFeed(slot.feed || sceneFeed)
  }))
  const analyzerBubbleLayout = [
    {x: 38, y: 12},
    {x: 15, y: 36},
    {x: 83, y: 18},
    {x: 52, y: 53},
    {x: 78, y: 82},
    {x: 24, y: 78}
  ]
  const analyzerBubbleNodes = Array.isArray(contentAnalyzer?.analysis?.bubbleMap)
    ? contentAnalyzer.analysis.bubbleMap.slice(0, 6).map((node, index) => {
      const layout = analyzerBubbleLayout[index % analyzerBubbleLayout.length]
      const tone = node.kind === "3d" ? "objects" : node.kind === "backlink" ? "link" : node.kind === "source" ? "source" : node.kind === "episode" ? "episode" : "ai"
      return {
        id: node.id || `analyzer-node-${index}`,
        x: layout.x,
        y: layout.y,
        label: node.label || node.kind || `Analyzer ${index + 1}`,
        value: node.value || usefulVideoRead.focus,
        detail: Array.isArray(node.connectsTo) && node.connectsTo.length ? `connected to ${node.connectsTo.slice(0, 3).join(", ")}` : usefulVideoRead.currentRead,
        fill: Math.max(22, Math.min(100, Math.round((Number(node.weight) || .65) * 100 + statResolveRatio * 12))),
        tone,
        url: node.kind === "backlink" ? cleanUrl(node.value) : usefulVideoRead.backlinkUrl
      }
    })
    : []
  const fallbackBubbleMapNodes = [
    {id: "episode", x: 38, y: 12, label: "Episode Radar", value: youtubeStory.episodeName, detail: usefulVideoRead.currentRead || contentRadar.focus || liveMeaning.label, fill: Math.max(18, Math.round(liveAnalyticsProgress)), tone: "episode", url: analyticsBacklinkUrl},
    {id: "views", x: 15, y: 36, label: "Page Views", value: contentRadar.metricLine || streamAnalytics.metrics.views.toLocaleString(), detail: contentRadar.engagementLine || `${streamAnalytics.metrics.likes.toLocaleString()} likes`, fill: Math.max(34, Math.min(100, Math.round(44 + streamAnalytics.pace * 22))), tone: "views", url: analyticsBacklinkUrl},
    {id: "backlinks", x: 83, y: 18, label: "Backlinks", value: `${backlinkRadar.links.length} lanes`, detail: backlinkRadar.focus, fill: Math.max(34, Math.min(100, backlinkRadar.links.length * 18 + observatoryConstructionProgress / 2)), tone: "link", url: analyticsBacklinkUrl},
    {id: "sponsor", x: 52, y: 53, label: "Featured Sponsor Stack", value: adResetWindow || liveMeaning.id === "sponsored" ? "live reset" : "armed", detail: `${semanticAnalyzerSource} / sponsor feed`, fill: adResetWindow || liveMeaning.id === "sponsored" ? 96 : Math.max(42, Math.round(statResolveRatio * 82)), tone: "sponsor", url: analyticsBacklinkUrl},
    {id: "source", x: 78, y: 82, label: "Website Link", value: sourcePreviewHost, detail: sourcePreview?.signal || "source lane armed", fill: sourcePreviewLive ? 96 : Math.max(32, Math.min(82, backlinkRadar.links.length * 16)), tone: "source", url: sourcePreview?.url || youtubeStory.searchUrl},
    {id: "podcast", x: 24, y: 78, label: "Podcast Switch", value: podcastMomentActive ? "speaker live" : "armed", detail: liveMeaning.podcastCue, fill: podcastMomentActive ? 98 : Math.max(36, Math.round(statResolveRatio * 80)), tone: "podcast", url: analyticsBacklinkUrl}
  ]
  const fixedBubbleMapNodes = analyzerBubbleNodes.length ? analyzerBubbleNodes : fallbackBubbleMapNodes
  const upperBubbleLayout = [
    {x: 9, y: 31},
    {x: 24, y: 9},
    {x: 42, y: 27},
    {x: 61, y: 8},
    {x: 79, y: 31},
    {x: 92, y: 15}
  ]
  const upperVideoBubbleNodes = fixedBubbleMapNodes.map((node, index) => ({
    ...node,
    upperX: upperBubbleLayout[index % upperBubbleLayout.length].x,
    upperY: upperBubbleLayout[index % upperBubbleLayout.length].y
  }))
  const upperVideoBubbleRoutes = upperVideoBubbleNodes.flatMap((node, index) => {
    const previous = upperVideoBubbleNodes[(index + upperVideoBubbleNodes.length - 1) % upperVideoBubbleNodes.length] || node
    return [
      {id: `core-${node.id}`, tone: node.tone, d: `M50 38 C${48 + (node.upperX - 50) * .22} 27 ${node.upperX - (node.upperX - 50) * .15} ${node.upperY + 8} ${node.upperX} ${node.upperY}`},
      {id: `mesh-${previous.id}-${node.id}`, tone: node.tone, d: `M${previous.upperX} ${previous.upperY} C${previous.upperX + (node.upperX - previous.upperX) * .38} ${previous.upperY - 14} ${node.upperX - (node.upperX - previous.upperX) * .26} ${node.upperY + 14} ${node.upperX} ${node.upperY}`}
    ]
  })
  const fixedTimelineFinds = timelineAnalyticsItems
  const sponsorAuthorityPartners = [
    {id: "vercel", label: "Vercel", mark: "V", detail: "deploy"},
    {id: "supabase", label: "Supabase", mark: "S", detail: "data"},
    {id: "codex", label: "Codex", mark: "C", detail: "builder"},
    {id: "firecuda", label: "FireCuda", mark: "F", detail: "8TB"},
    {id: "github", label: "GitHub", mark: "GH", detail: "source"}
  ]
  const upperConstructionPieces = Array.from({length: 18}, (_, index) => ({
    id: `upper-piece-${index}`,
    label: ["GLB", "WEB", "MIC", "LINK", "VIEW", "SEO"][index % 6],
    x: 5 + ((index * 19) % 88),
    y: 5 + ((index * 13) % 42),
    tone: ["glb", "source", "podcast", "link", "views", "episode"][index % 6],
    shape: ["prism", "orbit", "ribbon", "helix", "lens", "stack"][index % 6]
  }))
  const crossAnalyticFlights = fixedTimelineFinds.slice(0, 7).map((item, index) => ({
    ...item,
    y: 14 + ((index * 17) % 68),
    span: 72 + ((index * 19) % 32),
    shape: ["orbit", "prism", "helix", "ribbon", "lens", "stack", "node"][index % 7]
  }))
  const artistDraftPathFamilies = [
    [
      {id: "curve-a", d: "M6 72 C18 42 34 44 46 21 C58 0 76 10 92 30", kind: "curve"},
      {id: "turn-a", d: "M10 18 H28 V40 H52 L65 27 H88", kind: "turn"},
      {id: "arc-a", d: "M18 86 C33 64 51 72 61 48 C69 29 79 22 94 18", kind: "curve"},
      {id: "route-a", d: "M8 51 H23 L33 35 H54 L66 49 H92", kind: "turn"},
      {id: "orbit-a", d: "M25 29 C42 7 75 18 80 45 C85 73 55 91 30 77 C10 66 9 43 25 29", kind: "orbit"},
      {id: "fold-a", d: "M11 91 L23 68 L42 76 L57 51 L77 59 L91 35", kind: "fold"},
      {id: "curve-b", d: "M5 35 C22 18 36 59 51 38 C62 23 71 29 93 8", kind: "curve"},
      {id: "turn-b", d: "M12 11 V26 H35 V48 H58 V70 H87", kind: "turn"},
      {id: "arc-b", d: "M16 62 C32 45 43 96 63 75 C75 62 78 42 93 43", kind: "curve"},
      {id: "fold-b", d: "M6 79 L22 57 L38 61 L49 31 L73 35 L94 12", kind: "fold"},
      {id: "orbit-b", d: "M34 18 C55 1 88 19 89 49 C90 78 59 96 34 82 C10 69 10 38 34 18", kind: "orbit"},
      {id: "route-b", d: "M9 43 H25 L32 54 H48 L55 67 H73 L91 82", kind: "turn"}
    ],
    [
      {id: "spire-a", d: "M7 88 C16 71 18 42 34 34 C48 27 45 7 58 8 C73 10 70 39 91 45", kind: "curve"},
      {id: "facet-a", d: "M12 62 L27 40 L42 50 L57 22 L79 31 L92 12", kind: "fold"},
      {id: "loop-a", d: "M18 29 C32 6 67 11 76 35 C86 62 59 86 31 78 C7 72 3 44 18 29", kind: "orbit"},
      {id: "cut-a", d: "M8 17 H22 L31 30 H48 L58 18 H78 L91 34", kind: "turn"},
      {id: "wave-a", d: "M5 75 C18 48 34 92 49 61 C61 36 77 53 95 23", kind: "curve"},
      {id: "mesh-a", d: "M16 91 L29 72 L47 80 L54 55 L71 63 L88 38", kind: "fold"},
      {id: "ribbon-a", d: "M9 43 C25 18 42 39 50 20 C61 -5 78 9 94 26", kind: "curve"},
      {id: "step-a", d: "M13 9 V22 H29 V36 H46 V50 H64 V64 H88", kind: "turn"},
      {id: "shell-a", d: "M28 18 C48 4 78 20 82 48 C86 80 47 95 24 76 C5 61 8 32 28 18", kind: "orbit"},
      {id: "ridge-a", d: "M6 82 L24 59 L38 66 L51 36 L72 43 L94 18", kind: "fold"},
      {id: "route-c", d: "M10 53 H24 L37 42 H52 L64 31 H83 L94 20", kind: "turn"},
      {id: "sweep-a", d: "M4 24 C25 9 30 75 49 48 C62 28 72 37 96 9", kind: "curve"}
    ],
    [
      {id: "helix-a", d: "M9 82 C25 62 17 34 38 25 C59 17 53 62 76 52 C91 45 87 24 96 14", kind: "curve"},
      {id: "tower-a", d: "M16 88 V69 H27 V47 H40 V28 H55 V10 H75", kind: "turn"},
      {id: "galaxy-a", d: "M31 25 C49 4 84 17 84 48 C84 78 50 92 28 75 C9 60 11 39 31 25", kind: "orbit"},
      {id: "plane-a", d: "M7 66 L24 48 L43 57 L58 31 L78 42 L94 21", kind: "fold"},
      {id: "draft-a", d: "M4 42 C21 19 40 57 54 32 C65 13 76 24 97 7", kind: "curve"},
      {id: "circuit-a", d: "M12 13 H30 V27 H45 L56 41 H72 V58 H89", kind: "turn"},
      {id: "lens-a", d: "M20 52 C31 22 70 12 86 36 C101 60 69 91 35 78 C12 69 10 43 20 52", kind: "orbit"},
      {id: "fold-c", d: "M6 90 L21 67 L37 72 L50 48 L70 55 L92 29", kind: "fold"},
      {id: "wake-a", d: "M8 30 C20 59 36 1 50 28 C60 48 72 43 92 68", kind: "curve"},
      {id: "frame-a", d: "M14 76 H29 L39 60 H54 L63 45 H80 L92 30", kind: "turn"},
      {id: "orbit-c", d: "M37 15 C56 -1 87 19 88 48 C89 76 58 96 34 83 C12 71 12 34 37 15", kind: "orbit"},
      {id: "terrain-a", d: "M5 80 L19 55 L36 64 L48 39 L65 47 L78 25 L94 34", kind: "fold"}
    ]
  ]
  const artistDraftPaths = artistDraftPathFamilies[Math.abs(designJumpIndex) % artistDraftPathFamilies.length]
  const artistDraftCount = analyticsStarted ? Math.max(0, Math.min(artistDraftPaths.length, Math.ceil(constructionDetailRatio * artistDraftPaths.length))) : 0
  const visibleArtistDraftPaths = artistDraftPaths.slice(0, artistDraftCount)
  const analyticsGate = {
    lens: analyticsStarted ? gateFor(5) : "queued",
    episode: analyticsStarted ? gateFor(14) : "queued",
    clips: "live",
    cutscenes: analyticsStarted ? gateFor(adResetWindow ? 8 : 38) : "queued",
    metrics: analyticsStarted ? gateFor(50) : "queued",
    backlinks: analyticsStarted ? gateFor(62) : "queued",
    previewQueue: analyticsStarted ? gateFor(10) : "queued",
    podcast: podcastMomentActive ? "live" : "waiting"
  }
  const visibleClipCount = analyticsStarted ? Math.max(1, Math.min(youtubeStory.clips.length, Math.ceil(observatoryConstructionProgress / 25))) : 0
  const visibleCutsceneCount = analyticsStarted ? Math.max(1, Math.min(youtubeStory.cutscenes.length, Math.ceil(observatoryConstructionProgress / 17))) : 0
  const writeLimit = analyticsStarted ? Math.max(4, Math.min(liveMeaning.caption.length, 4 + Math.floor(observatoryCycleClock * .28))) : 0
  const liveWritingText = liveMeaning.caption.slice(0, writeLimit)
  const youtubeShouldPlay = autoPresent && !podcastFeatureOpen
  const youtubePlayerUrl = `${youtubeStory.embedUrl}&start=${youtubeSeekAnchor}&autoplay=${youtubeShouldPlay ? 1 : 0}&mute=0&controls=0&disablekb=1&playsinline=1&modestbranding=1&enablejsapi=1`
  const activeApiFeeds = apiCategoryFeeds.filter((item) => item.category === category)
  const quickDisplayFeeds = sortRendererFeeds([...activeApiFeeds, ...feeds]).slice(0, 5)
  const lobbyFeedPool = sortRendererFeeds([...apiCategoryFeeds, ...feeds])
  const lobbyFeeds = lobbyCategories.map((item) => {
    const existing = lobbyFeedPool.find((feedItem) => feedItem.category === item && bestRenderableModelUrl(feedItem))
    const rotatedSeeds = rotateFreshList(seedFeeds(item), freshnessSeed, `${item}:lobby-seeds`)
    return existing || rotateFreshList(apiSpotlightSeeds(item), freshnessSeed, `${item}:lobby-spotlight`)[0] || rotatedSeeds.find((feedItem) => bestRenderableModelUrl(feedItem)) || rotatedSeeds[0]
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
  const assetLibraryStatus = firecudaLibraryStatus()
  const mechanicRuntimeStatus = !runtimeState.online ? "Offline" : !runtimeState.visible ? "Paused" : loading ? "Loading" : autoPresent ? "Auto Play" : "Ready"
  const directorBusy = /finding|loading|waiting|preparing|searching|advancing|idle/i.test(directorStatus.phase)
  const activeDirectorModelUrl = bestRenderableModelUrl(sceneFeed) || relatedGlb(category, active)
  const activeDirectorModelIsLocal = Boolean(activeDirectorModelUrl && String(activeDirectorModelUrl).startsWith("/models/"))
  const bundledDirectorGlbCount = Array.from(new Set(Object.values(verifiedLocalGlbFallbacks).flat())).length
  const directorAssetSourceSummary = activeDirectorModelIsLocal
    ? `Verified local GLB: ${activeDirectorModelUrl.replace("/models/environments/", "")} (${bundledDirectorGlbCount} bundled)`
    : assetLibraryStatus.mode === "uploaded-personal-library"
      ? `Supabase library connected: ${assetLibraryStatus.availableCount}/${assetLibraryStatus.totalCount} uploaded GLBs`
      : `Verified fallback library ready: ${bundledDirectorGlbCount} bundled GLBs`
  const directorPhaseLower = String(directorStatus.phase || "").toLowerCase()
  const directorStepIsActive = (item) => {
    if(directorStatus.phase === item) return true
    if(directorPhaseLower.includes("ready") && item === "Ready to present") return true
    if(directorPhaseLower.includes("local glb") && (item === "Loading GLB" || item === "Preparing camera")) return true
    if(directorPhaseLower.includes("api preview") && item === "Loading GLB") return true
    if(directorPhaseLower.includes("metadata") && item === "Reading metadata") return true
    return false
  }
  const assetReviews = readAssetReviews()
  const currentReviewKey = assetReviewKey(sceneFeed)
  const currentReview = assetReviews[currentReviewKey] || {rating: 0, review: "", backlink: backlinkForFeed(sceneFeed), count: 0}
  const selectedPurchaseOptions = purchaseOptionsBase.filter((item) => selectedPurchaseIds.includes(item.id))
  const selectedPurchaseLabel = selectedPurchaseOptions.map((item) => item.title).join(" + ") || "Choose package"
  const observatoryClassName = [
    "dh-observatory",
    performanceProfile.className,
    "aerospace-display",
    loading ? "is-loading" : "is-ready",
    interactionPulse ? "system-pulse" : "",
    directorBusy ? "ai-operating" : "",
    mainLobbyOpen ? "main-lobby-active" : "",
    entryOpen ? "entry-open" : "entry-complete",
    mechanicMode ? "mechanic-mode" : ""
  ].filter(Boolean).join(" ")

  useEffect(() => {
    applySystemPerformanceProfile(performanceProfile)
  }, [performanceProfile])

  useEffect(() => {
    if(typeof window === "undefined") return undefined
    const media = window.matchMedia("(max-width: 760px)")
    const syncDisplay = () => setDisplayCollapsed(media.matches)
    syncDisplay()
    media.addEventListener?.("change", syncDisplay)
    return () => media.removeEventListener?.("change", syncDisplay)
  }, [])

  useEffect(() => {
    if(typeof window === "undefined") return undefined
    if(window.innerWidth <= 760 && (modelOpen || sceneVisualKey === visualReadyKey)) setDisplayCollapsed(true)
  }, [modelOpen, sceneVisualKey, visualReadyKey])

  useEffect(() => {
    if(typeof window === "undefined") return undefined
    let cancelled = false
    async function hydrateProviderStatus(){
      try {
        const response = await fetchWithTimeout("/api/provider-status", {headers: {Accept: "application/json"}}, 2600)
        if(!response.ok) throw new Error(`provider status ${response.status}`)
        const payload = await response.json()
        if(cancelled) return
        setApiProviderStatus({
          status: Array.isArray(payload.status) ? payload.status : [],
          checkedAt: new Date().toISOString()
        })
      } catch {
        if(!cancelled) setApiProviderStatus((current) => ({...current, checkedAt: current.checkedAt || ""}))
      }
    }
    hydrateProviderStatus()
    const timer = window.setInterval(hydrateProviderStatus, 75000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    if(!paymentConfirmed || !paymentHash) return
    const entitlement = {
      wallet: connectedWallet,
      receiver: DIGITALHUT_BASE_ETH_RECEIVER,
      txHash: paymentHash,
      selected: selectedPurchaseOptions,
      status: "confirmed-local",
      chain: "base",
      createdAt: new Date().toISOString()
    }
    writeStorage("digitalhut:paymentEntitlement", JSON.stringify(entitlement))
    recordDirectorMessage("ai", `Wallet payment confirmed. DigitalHut recorded ${selectedPurchaseLabel} with transaction ${paymentHash.slice(0, 10)}...`, "Wallet checkout")
    setDirectorStatus({phase: "Payment confirmed", detail: selectedPurchaseLabel, status: "Local entitlement recorded. Backend verification should mirror this to Supabase."})
  }, [paymentConfirmed, paymentHash])

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
        const seed = rotateFreshList(seedFeeds(nextCategory), freshnessSeed, `${nextCategory}:category-api-seed`)[0]
        const term = seed?.query || nextCategory
        const apiResults = rotateFreshList(await resolveApiFeeds(nextCategory, term), freshnessSeed, `${nextCategory}:${term}:category-api-glbs`)
          .map((item, index) => attachRendererModel(item, nextCategory, term, index))
        const spotlightResults = rotateFreshList(apiSpotlightSeeds(nextCategory, term, true), freshnessSeed, `${nextCategory}:${term}:category-spotlight-glbs`)
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
  }, [mainLobbyOpen, category, freshnessSeed])

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
    return () => {
      window.clearTimeout(hideTimer.current)
      window.clearTimeout(idleModelTimer.current)
    }
  }, [])

  useEffect(() => {
    armIdleModelTimer()
    return () => window.clearTimeout(idleModelTimer.current)
  }, [entryOpen, podcastFeatureOpen, glbPlayViewOpen, autoPresent, playing, sceneFeed.id, sceneFeed.title, sceneFeed.modelUrl, sceneFeed.embedUrl, sceneFeed.sourceEmbedUrl, category, active])

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
    const homepageDescription = `DigitalHut is a 2026 dapp entertainment observatory, a digital hut for video watching, 3D Model View, podcast/source moments, live analytics, GLB rendering, and useful research proof routes. Current lane: ${record.category} ${record.stage}. ${record.title}. Status: ${record.status}.`
    let meta = document.querySelector('meta[name="description"]')
    if(!meta){
      meta = document.createElement("meta")
      meta.setAttribute("name", "description")
      document.head.appendChild(meta)
    }
    meta.setAttribute("content", homepageDescription)
    let keywords = document.querySelector('meta[name="keywords"]')
    if(!keywords){
      keywords = document.createElement("meta")
      keywords.setAttribute("name", "keywords")
      document.head.appendChild(keywords)
    }
    keywords.setAttribute("content", "DigitalHut, digital hut, cyber hut, 2026 dapp entertainment observatory, video watching, 3D Model View, podcast source moments, live analytics, GLB renderer, Search Console proof routes")
    let canonical = document.querySelector('link[rel="canonical"]')
    if(!canonical){
      canonical = document.createElement("link")
      canonical.rel = "canonical"
      document.head.appendChild(canonical)
    }
    canonical.href = "https://www.digitalhut.app/"
  }, [category, stage.label, sceneFeed.id, sceneFeed.title, sceneFeed.apiStatus, sceneFeed.apiSource, mode, tier, loading])

  useEffect(() => {
    setAiUsage(readAiUsage(tier))
  }, [tier])

  useEffect(() => {
    const seeds = rotateFreshList(seedFeeds(category), freshnessSeed, `${category}:preload-glbs`)
    const urls = [
      ...seeds.map((item) => item.thumbnail),
      ...toursFor(category).map((_, index) => stockUrl(category, index))
    ]
    preloadImages(urls)
    preloadModels(seeds.map((item) => item.modelUrl), 1)
  }, [category, mechanicMode, freshnessSeed])

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
    const seed = rotateFreshList(seedFeeds(category), freshnessSeed, `${category}:initial-feed`)[0]
    loadFeeds(category, seed.query || query, {silent: true, keepOpen: true})
  }, [entryOpen, category, query, freshnessSeed])

  useEffect(() => {
    if(entryOpen) return undefined
    let cancelled = false
    const term = compactTopic(`${sceneFeed.title || query || category} ${category} 2026 visual experience`)
    const fallbackVideos = seededYoutubePanelVideosFor(category, term, 4, freshnessSeed)
    const quotaCooldownRemainingMs = youtubeQuotaCooldownRemaining()
    setYoutubeVideoIndex(0)
    if(quotaCooldownRemainingMs > 0){
      setYoutubeSearch({
        status: "youtube-quota-protected-prefilled",
        configured: true,
        provider: "DigitalHut seeded panel / YouTube quota protected",
        query: term,
        videos: fallbackVideos,
        analytics: {retryAfterMs: quotaCooldownRemainingMs},
        quotaProtected: true,
        error: "YouTube quota cooldown active locally; category-locked panels are filling the episode queue.",
        fetchedAt: new Date().toISOString()
      })
      return () => {
        cancelled = true
      }
    }
    setYoutubeSearch((current) => ({...current, status: "loading-youtube-api", query: term}))
    fetchWithTimeout(`/api/youtube-search?query=${encodeURIComponent(term)}&category=${encodeURIComponent(category)}&limit=4`, {headers: {Accept: "application/json"}}, 9000)
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}))
        if(cancelled) return
        const apiVideos = rotateFreshList(Array.isArray(payload.videos) ? payload.videos.filter(isPlayableYoutubeVideo) : [], freshnessSeed, `${category}:${term}:youtube-api`)
        const quotaProtected = payload.status === "youtube-quota-cooldown" || payload.quotaProtected
        if(quotaProtected) rememberYoutubeQuotaCooldown(payload.retryAfterMs)
        setYoutubeSearch({
          status: apiVideos.length ? (payload.status || (payload.ok ? "youtube-api-live" : "youtube-api-waiting")) : quotaProtected ? "youtube-quota-protected-prefilled" : "youtube-prefilled-category-panels",
          configured: Boolean(payload.configured),
          provider: apiVideos.length ? (payload.provider || "YouTube Data API v3") : quotaProtected ? "DigitalHut seeded panel / YouTube quota protected" : "DigitalHut seeded YouTube panel",
          query: payload.query || term,
          videos: apiVideos.length ? apiVideos : fallbackVideos,
          analytics: payload.analytics || {},
          quotaProtected,
          error: payload.error || "",
          fetchedAt: payload.fetchedAt || new Date().toISOString()
        })
      })
      .catch((error) => {
        if(cancelled) return
        setYoutubeSearch((current) => ({
          ...current,
          status: "youtube-prefilled-category-panels",
          provider: "DigitalHut seeded YouTube panel",
          query: term,
          videos: seededYoutubePanelVideosFor(category, term, 4, freshnessSeed),
          error: error?.message || "youtube-api-error",
          fetchedAt: new Date().toISOString()
        }))
      })
    return () => {
      cancelled = true
    }
  }, [entryOpen, category, sceneFeed.title, query, freshnessSeed])

  useEffect(() => {
    if(entryOpen) return undefined
    let cancelled = false
    const term = podcastSearchPhraseFor({story: youtubeStory, contentRadar, category})
    setPodcastClipIndex(0)
    setPodcastSearch((current) => ({...current, status: "loading-podcast-clip", query: term}))
    const fallbackPodcastTerms = podcastFallbackTermsFor({term, category, story: youtubeStory, contentRadar})
    const resolvePodcastPayload = (payload) => Array.isArray(payload?.episodes) && payload.episodes.length
      ? payload
      : fetchApplePodcastFallbackSeries(fallbackPodcastTerms)
    fetchWithTimeout(`/api/podcast-search?query=${encodeURIComponent(term)}&category=${encodeURIComponent(category)}`, {headers: {Accept: "application/json"}}, 9000)
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}))
        const resolvedPayload = await resolvePodcastPayload(payload).catch((error) => ({
          query: term,
          provider: "Apple Podcasts Search API",
          episodes: [],
          error: error?.message || "Podcast search unavailable",
          fetchedAt: new Date().toISOString()
        }))
        if(cancelled) return
        const liveEpisodes = Array.isArray(resolvedPayload.episodes) ? resolvedPayload.episodes : []
        setPodcastSearch({
          status: liveEpisodes.length ? "podcast-api-live" : resolvedPayload.error ? "podcast-api-waiting" : "podcast-api-empty",
          configured: true,
          provider: resolvedPayload.provider || "Apple Podcasts Search API",
          query: resolvedPayload.query || term,
          episodes: liveEpisodes,
          videos: [],
          analytics: resolvedPayload.analytics || {},
          fetchedAt: resolvedPayload.fetchedAt || new Date().toISOString()
        })
      })
      .catch(async (error) => {
        const resolvedPayload = await fetchApplePodcastFallbackSeries(fallbackPodcastTerms).catch((fallbackError) => ({
          query: term,
          provider: "Apple Podcasts Search API",
          episodes: [],
          error: fallbackError?.message || error?.message || "Podcast search unavailable",
          fetchedAt: new Date().toISOString()
        }))
        if(cancelled) return
        const liveEpisodes = Array.isArray(resolvedPayload.episodes) ? resolvedPayload.episodes : []
        setPodcastSearch({
          status: liveEpisodes.length ? "podcast-api-live" : resolvedPayload.error || "podcast-api-error",
          configured: true,
          provider: resolvedPayload.provider || "Apple Podcasts Search API",
          query: resolvedPayload.query || term,
          episodes: liveEpisodes,
          videos: [],
          analytics: resolvedPayload.analytics || {},
          fetchedAt: resolvedPayload.fetchedAt || new Date().toISOString()
        })
      })
    return () => {
      cancelled = true
    }
  }, [entryOpen, category, youtubeStory.primaryVideo?.videoId, youtubeStory.searchPhrase])

  useEffect(() => {
    if(entryOpen) return undefined
    let cancelled = false
    const video = youtubeStory.primaryVideo || {}
    const metadata = {
      title: video.title || youtubeStory.topic || sceneFeed.title || query,
      channel: video.channelTitle || contentRadar.channel || youtubeStory.provider || "DigitalHut source",
      category,
      description: video.description || contentRadar.signalLine || youtubeStory.searchPhrase || sceneFeed.note || "",
      videoId: youtubeVideoIdFor(video),
      sourceUrl: video.url || youtubeStory.searchUrl || ""
    }
    setContentAnalyzer((current) => ({
      ...current,
      status: "analyzing-content",
      provider: current.provider || "DigitalHut Content Analyzer",
      query: metadata.title
    }))
    fetchWithTimeout("/api/google-speech-analyzer", {
      method: "POST",
      headers: {"Content-Type": "application/json", Accept: "application/json"},
      body: JSON.stringify({
        metadata,
        seconds: youtubeSeekSeconds
      })
    }, 9000)
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}))
        if(cancelled) return
        setContentAnalyzer({
          ok: Boolean(payload.ok),
          configured: Boolean(payload.configured),
          provider: payload.provider || "DigitalHut Content Analyzer",
          mode: payload.mode || "metadata-only",
          status: payload.status || (payload.ok ? "content-analyzer-live" : "content-analyzer-fallback"),
          analysis: payload.analysis || null,
          fetchedAt: payload.fetchedAt || new Date().toISOString(),
          error: payload.error || ""
        })
        if(payload.analysis) setObservatoryBuildSeed(Date.now())
      })
      .catch((error) => {
        if(cancelled) return
        setContentAnalyzer((current) => ({
          ...current,
          status: "content-analyzer-local-fallback",
          error: error?.message || "content analyzer unavailable",
          fetchedAt: new Date().toISOString()
        }))
      })
    return () => {
      cancelled = true
    }
  }, [entryOpen, category, analyzerSourceId, analyzerTimeBucket])

  useEffect(() => {
    if(!presentationLive || runtimePaused) return undefined
    let frame = 0
    let lastTime = window.performance.now()
    let lastClockTime = 0
    const progressPerMs = 100 / Math.max(22000, documentaryTimeline.length * autoDelay)
    const tick = (now) => {
      const elapsed = Math.max(0, Math.min(500, now - lastTime))
      lastTime = now
      if(autoPresent && elapsed){
        setPresentationProgress((current) => {
          const next = current + elapsed * progressPerMs * Math.max(1, Number(presentationSpeed) || 1)
          return next >= 100 ? next - 100 : next
        })
      }
      if(now - lastClockTime > 90){
        lastClockTime = now
        setAnalyticsClock((current) => (current + 1) % 100000)
      }
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [presentationLive, autoPresent, runtimePaused, presentationSpeed, autoDelay])

  useEffect(() => {
    if(!podcastFeatureOpen || runtimePaused) return undefined
    const timer = window.setTimeout(() => {
      closePodcastFeatureInterrupt(true)
    }, Math.max(15000, Math.round(22000 / Math.max(1, Number(presentationSpeed) || 1))))
    return () => window.clearTimeout(timer)
  }, [podcastFeatureOpen, runtimePaused, presentationSpeed])

  useEffect(() => {
    const podcastAudio = podcastAudioRef.current
    if(!podcastAudio) return
    podcastAudio.muted = false
    podcastAudio.volume = 1
    if(podcastFeatureOpen && podcastClip.audioUrl) {
      if(podcastAudio.src !== podcastClip.audioUrl) podcastAudio.src = podcastClip.audioUrl
      podcastAudio.load?.()
      const timer = window.setTimeout(() => {
        podcastAudio.play().catch(() => {
          setDirectorStatus({phase: "Podcast ready", detail: podcastClip.title || youtubeStory.episodeName, status: "Podcast source is loaded. Press play inside the podcast panel if the browser blocked autoplay."})
        })
      }, 80)
      return () => window.clearTimeout(timer)
    }
    podcastAudio.pause()
  }, [podcastFeatureOpen, podcastClip.audioUrl, podcastClip.title, youtubeStory.episodeName])

  useEffect(() => {
    if(!autoPresent || runtimePaused) return
    autoStartedRef.current = Date.now()
    const timer = window.setInterval(() => {
      setModelOpen(true)
      setPlaying(true)
      if(sceneVisualKey !== visualReadyKey){
        setDirectorStatus({phase: "Waiting for GLB", detail: sceneFeed.title, status: "Auto demo is watching the renderer. If it idles, I will advance to the next usable feed."})
        return
      }
      autoStepRef.current += 1
      const chapterIndex = documentaryTimeline.findIndex((item) => item.id === presentationChapter.id)
      const nextChapter = documentaryTimeline[(chapterIndex + 1) % documentaryTimeline.length] || documentaryTimeline[0]
      const completedModelCycle = nextChapter.id === "opening"
      if(demoMode === "all" && completedModelCycle && autoStepRef.current % (documentaryTimeline.length * 2) === 0){
        playSessionSound(category, "bridge")
        recordDirectorMessage("ai", "Completed the current model cycle. Bridging to the next category with the renderer open.", "Auto bridge")
        bridgeNextCategory("I found a new trend bridge")
        return
      }
      const shouldShiftFeed = completedModelCycle || nextChapter.feedOffset > presentationChapter.feedOffset
      const nextActive = shouldShiftFeed && feeds.length > 1 ? (active + 1) % feeds.length : active
      const nextFeed = feeds[nextActive] || sceneFeed
      const nextStageIndex = Math.min(nextChapter.stage, stages.length - 1)
      const nextStage = stages[nextStageIndex]
      playSessionSound(category, nextChapter.cue)
      setPresentationProgress(nextChapter.at)
      setYoutubeSeekAnchor(Math.max(0, Math.round((Number(nextChapter.at) || 0) * 1.2)))
      setStageIndex(nextStageIndex)
      if(nextActive !== active) setActive(nextActive)
      const caption = chapterCaption({chapter: nextChapter, category, feed: nextFeed, tier, source: nextFeed.apiSource || nextFeed.apiStatus})
      setDirectorStatus({phase: nextChapter.label, detail: nextFeed.title, status: `${nextChapter.media}. ${caption}`})
      recordDirectorMessage("ai", `${nextChapter.media}: ${caption}`, "Episode progression")
    }, autoDelay)
    return () => {
      window.clearInterval(timer)
      autoStartedRef.current = null
    }
  }, [autoPresent, runtimePaused, demoMode, tier, category, active, sceneFeed.id, sceneFeed.title, sceneVisualKey, visualReadyKey, feeds, autoDelay, presentationChapter.id, presentationChapter.feedOffset, activeTour])

  useEffect(() => {
    window.clearTimeout(presentationIdleTimer.current)
    if(!autoPresent || runtimePaused || !modelOpen || sceneVisualKey === visualReadyKey) return undefined
    presentationIdleTimer.current = window.setTimeout(() => {
      const nextIndex = feeds.length > 1 ? (active + 1) % feeds.length : active
      const nextItem = feeds[nextIndex] || sceneFeed
      setDirectorStatus({phase: "Advancing idle renderer", detail: nextItem.title, status: "Preview stayed idle too long. DigitalHut is moving the presentation forward."})
      recordDirectorMessage("ai", `Renderer stayed idle, so I am advancing to ${nextItem.title} and keeping the presentation moving.`, "Auto recovery")
      setInteractionPulse(true)
      window.clearTimeout(pulseTimer.current)
      pulseTimer.current = window.setTimeout(() => setInteractionPulse(false), 900)
      if(feeds.length > 1){
        setActive(nextIndex)
        setStageIndex(0)
        setGuideDepth(0)
        setModelOpen(true)
        speakAfterVisual(`Renderer idle recovery. ${concisePresentationLine({feed: nextItem, category: nextItem.category || category, stage: stages[0]})}`, visualKeyFor(nextItem, stages[0]), 700)
        return
      }
      loadFeeds(category, sceneFeed.query || query, {silent: true, keepOpen: true}).then((next) => {
        const loaded = next[0] || sceneFeed
        setActive(0)
        setModelOpen(true)
        speakAfterVisual(`Renderer idle recovery. I found a fresh option. ${concisePresentationLine({feed: loaded, category, stage: stages[0]})}`, visualKeyFor(loaded, stages[0]), 700)
      })
    }, PRESENTATION_IDLE_MS)
    return () => window.clearTimeout(presentationIdleTimer.current)
  }, [autoPresent, runtimePaused, modelOpen, sceneVisualKey, visualReadyKey, active, feeds, sceneFeed, category, query])

  useEffect(() => {
    const pending = pendingSpeechRef.current
    if(!pending || pending.key !== visualReadyKey) return
    window.clearTimeout(pendingSpeechTimer.current)
    pendingSpeechTimer.current = window.setTimeout(() => {
      speak(pending.text)
      pendingSpeechRef.current = null
    }, pending.delay)
  }, [visualReadyKey])

  useEffect(() => {
    setReviewDraft(currentReview.review || "")
  }, [currentReviewKey])

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

  function openIdleModelView(){
    setAwake(false)
    setGlbDockExpanded(false)
    setGlbPlayViewOpen(false)
    setSelectedGlbPlayAsset(null)
    setModelOpen(false)
    setDirectorStatus({
      phase: "3D Model View waiting",
      detail: sceneFeed.title,
      status: "Timeout no longer opens a paused GLB. Press 3D Model View when you want the live renderer."
    })
  }

  function armIdleModelTimer(){
    window.clearTimeout(idleModelTimer.current)
    if(entryOpen || podcastFeatureOpen || glbPlayViewOpen || autoPresent || playing) return
    idleModelTimer.current = window.setTimeout(openIdleModelView, 5000)
  }

  function wake(){
    setAwake(true)
    window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => {
      if(!autoPresent && !playing && !podcastFeatureOpen && !glbPlayViewOpen) {
        openIdleModelView()
        return
      }
      setAwake(false)
    }, 2800)
    armIdleModelTimer()
  }

  function saveAssetReview(rating){
    const reviews = readAssetReviews()
    const backlink = backlinkForFeed(sceneFeed)
    const previous = reviews[currentReviewKey] || {}
    const nextReview = {
      ...previous,
      rating,
      review: reviewDraft.trim(),
      title: sceneFeed.title,
      category,
      backlink,
      source: sceneFeed.apiSource || sceneFeed.apiStatus || "DigitalHut",
      updatedAt: new Date().toISOString(),
      count: (previous.count || 0) + 1
    }
    const nextReviews = {...reviews, [currentReviewKey]: nextReview}
    writeAssetReviews(nextReviews)
    setReviewNonce((value) => value + 1)
    recordDirectorMessage("user", `${rating}/5 stars for ${sceneFeed.title}${reviewDraft.trim() ? `: ${reviewDraft.trim()}` : ""}`, "GLB review")
    recordDirectorMessage("ai", `Review saved. ${seoBacklinkBrief({category, feed: sceneFeed})}`, "SEO signal")
    setDirectorStatus({phase: "Review saved", detail: sceneFeed.title, status: "Category popularity, SEO credibility, backlink quality, and renderer signal updated locally."})
    setInteractionPulse(true)
    window.clearTimeout(pulseTimer.current)
    pulseTimer.current = window.setTimeout(() => setInteractionPulse(false), 900)
  }

  async function copyAssetBacklink(){
    const link = currentReview.backlink || backlinkForFeed(sceneFeed)
    await navigator.clipboard?.writeText(link).catch(() => null)
    recordDirectorMessage("ai", `Backlink ready for ${sceneFeed.title}.`, "Backlink")
    setDirectorStatus({phase: "Backlink ready", detail: sceneFeed.title, status: link})
    setInteractionPulse(true)
    window.clearTimeout(pulseTimer.current)
    pulseTimer.current = window.setTimeout(() => setInteractionPulse(false), 900)
  }

  function togglePurchaseOption(id){
    setSelectedPurchaseIds((current) => {
      if(current.includes(id)) return current.filter((item) => item !== id)
      const option = purchaseOptionsBase.find((item) => item.id === id)
      if(option?.type === "tier"){
        return [...current.filter((item) => !item.startsWith("tier-")), id]
      }
      return [...current, id]
    })
  }

  async function prepareWalletPurchase(){
    const payload = {
      wallet: DIGITALHUT_MAIN_WALLET,
      baseEthReceiver: DIGITALHUT_BASE_ETH_RECEIVER,
      baseUsdcReceiver: DIGITALHUT_BASE_USDC_RECEIVER,
      baseEthAmount: DIGITALHUT_BASE_ETH_AMOUNT,
      selected: selectedPurchaseOptions,
      category,
      currentAsset: sceneFeed.title,
      createdAt: new Date().toISOString()
    }
    writeStorage("digitalhut:pendingPurchase", JSON.stringify(payload))
    await navigator.clipboard?.writeText(`${selectedPurchaseLabel}\nDigitalHut wallet: ${DIGITALHUT_MAIN_WALLET}`).catch(() => null)
    recordDirectorMessage("ai", `Purchase package prepared: ${selectedPurchaseLabel}. Wallet destination copied for checkout verification.`, "Wallet package")
    setDirectorStatus({phase: "Wallet package ready", detail: selectedPurchaseLabel, status: `Destination: ${DIGITALHUT_MAIN_WALLET}`})
    setInteractionPulse(true)
    window.clearTimeout(pulseTimer.current)
    pulseTimer.current = window.setTimeout(() => setInteractionPulse(false), 900)
  }

  function startBaseEthCheckout(){
    if(!isConnected){
      setPurchaseOpen(true)
      recordDirectorMessage("ai", "Connect wallet first, then DigitalHut can open the Base ETH checkout request.", "Wallet checkout")
      setDirectorStatus({phase: "Wallet required", detail: selectedPurchaseLabel, status: "Connect wallet before sending a transaction."})
      return
    }
    if(!DIGITALHUT_BASE_ETH_AMOUNT){
      recordDirectorMessage("ai", "Base ETH checkout is staged, but VITE_DIGITALHUT_PAYMENT_ETH_AMOUNT is not configured yet.", "Wallet checkout")
      setDirectorStatus({phase: "Checkout staged", detail: selectedPurchaseLabel, status: "Set VITE_DIGITALHUT_PAYMENT_ETH_AMOUNT before live payment requests."})
      return
    }
    sendTransaction({
      to: DIGITALHUT_BASE_ETH_RECEIVER,
      value: parseEther(DIGITALHUT_BASE_ETH_AMOUNT)
    })
    recordDirectorMessage("ai", `Wallet checkout requested for ${selectedPurchaseLabel}. Confirm only if the domain, chain, receiver, and amount are correct.`, "Wallet checkout")
    setDirectorStatus({phase: "Wallet confirmation", detail: selectedPurchaseLabel, status: `Receiver: ${DIGITALHUT_BASE_ETH_RECEIVER}`})
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
    const seeds = rotateFreshList(seedFeeds(nextCategory), freshnessSeed, `${nextCategory}:${term}:seed-glbs`).map((item, index) => attachRendererModel(item, nextCategory, term, index))
    setLoading(true)
    setActive(0)
    setModelOpen(Boolean(options.keepOpen))
    setGuideDepth(0)
    preloadImages(seeds.map((item) => item.thumbnail))
    preloadModels(seeds.map((item) => item.modelUrl), 1)
    if(requestRef.current !== id) return seeds
    setFeeds(seeds)
    const results = rotateFreshList(await resolveApiFeeds(nextCategory, term), freshnessSeed, `${nextCategory}:${term}:api-glbs`).map((item, index) => attachRendererModel(item, nextCategory, term, index))
    if(requestRef.current !== id) return seeds
    const seedTitles = new Set(results.map((item) => item.title))
    const seedModels = seeds.filter((seed) => !seedTitles.has(seed.title))
    const directResults = results.filter((item) => item.renderPriority >= 70)
    const fallbackResults = results.filter((item) => item.renderPriority < 70)
    const spotlightResults = rotateFreshList(apiSpotlightSeeds(nextCategory, term, true), freshnessSeed, `${nextCategory}:${term}:spotlight-glbs`)
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
    const bridgeSeed = rotateFreshList(seedFeeds(targetCategory), freshnessSeed, `${targetCategory}:bridge-seed`)[0]
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
    const loaded = next[0] || rotateFreshList(seedFeeds(targetCategory), freshnessSeed, `${targetCategory}:bridge-loaded`)[0]
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
    setCategoryPanelOpen(false)
    setCategory(nextCategory)
    setTour(toursFor(nextCategory)[0].id)
    setStageIndex(0)
    setStatsFeeds([])
    setModelOpen(true)
    setGuideDepth(0)
    const seed = rotateFreshList(seedFeeds(nextCategory), freshnessSeed, `${nextCategory}:select-category`)[0]
    setQuery(seed.query)
    loadFeeds(nextCategory, seed.query, {silent: true, keepOpen: true})
    speak(`DigitalHut set to ${nextCategory}. The aerospace renderer stays open while the next verified GLB prepares.`)
    wake()
  }

  function shouldUseFullDemoWelcome(){
    if(typeof window === "undefined") return true
    const last = Number(window.localStorage.getItem(demoWelcomeStorageKey) || 0)
    const now = Date.now()
    if(!last || now - last > DEMO_WELCOME_RESET_MS){
      window.localStorage.setItem(demoWelcomeStorageKey, String(now))
      return true
    }
    return false
  }

  function nodeSearchTerm(item){
    if(item?.id === "real-estate-genius") return "middle class international real estate housing opportunities booming market 3d environment"
    if(item?.id === "stellar") return "stellar planetary orbital compute cosmic observatory space station 3d environment"
    if(item?.id === "pro-gamer") return "immersive game world 360 vr environment creator safe 3d"
    return `${item?.title || category} ${item?.category || category} 3d environment`
  }

  function presentationIntro({kind, node, targetCategory, targetFeed, fullWelcome}){
    if(node){
      if(node.id === "real-estate-genius"){
        return fullWelcome
          ? `Welcome to ${node.title} Node. Today in real estate housing we will be looking at middle class options that have been booming, then I will attach related 3D environments and keep searching for stronger real estate GLB presentations. First option: ${targetFeed.title}.`
          : `Resuming ${node.title} Node. I am continuing the real estate housing presentation with ${targetFeed.title}, then I will look for related property and market environments.`
      }
      if(node.id === "stellar"){
        return fullWelcome
          ? `Welcome to ${node.title} Node. Today we are looking at planetary, orbital compute, and cosmic observatory feeds. I will open ${targetFeed.title}, then rotate into related space and science environments.`
          : `Resuming ${node.title} Node with ${targetFeed.title}. I will keep the planetary presentation moving through related orbital environments.`
      }
      if(node.id === "pro-gamer"){
        return fullWelcome
          ? `Welcome to ${node.title} Node. Today we are looking at immersive game-world environments and creator-safe 360 feeds. First I will present ${targetFeed.title}, then search for related playable worlds.`
          : `Resuming ${node.title} Node with ${targetFeed.title}. I will continue looking for related game environments.`
      }
      return fullWelcome ? `Welcome to ${node.title} Node. I will present ${targetFeed.title} and search related GLB environments.` : `Resuming ${node.title} Node with ${targetFeed.title}.`
    }
    return fullWelcome
      ? `Welcome to DigitalHut. This automatic 3D autoplay system is opening ${targetFeed.title} from ${targetCategory}. I will present the GLB renderer, 3D asset source, public feed signal, and related observatory API previews.`
      : kind === "all"
        ? `Resuming All Category Auto Demo with ${targetFeed.title}. I will continue rotating through categories without restarting the welcome.`
        : `Resuming Current Category Auto Demo in ${targetCategory} with ${targetFeed.title}. I will stay on topic and continue the presentation.`
  }

  async function launchPresentationDemo({kind = "current", node = null} = {}){
    if(node?.locked){
      setEntryOpen(true)
      setDirectorStatus({phase: "Node episode locked", detail: node.title, status: "Category episodes are free. Paid or earned Blink Nodes unlock specialized episodes."})
      recordDirectorMessage("ai", `${node.title} is a paid or earned node episode. Category episodes remain free.`, "Node access")
      playSessionSound(category, "stop")
      return
    }
    const targetCategory = node?.category || category
    const seed = rotateFreshList(seedFeeds(targetCategory), freshnessSeed, `${targetCategory}:episode-preview`)[0]
    const term = node ? nodeSearchTerm(node) : (sceneFeed.query || query || seed?.query || `${targetCategory} 3d environment`)
    autoStepRef.current = 0
    setShowcaseAuto(false)
    setDemoMode(node ? `node:${node.id}` : kind)
    setAutoPresent(true)
    setMode("premium")
    setPlaying(true)
    setModelOpen(true)
    setObservatoryBuildSeed(analyticsClock)
    setCategory(targetCategory)
    setTour(toursFor(targetCategory)[0].id)
    setStageIndex(0)
    setPresentationProgress(0)
    setYoutubeSeekAnchor(0)
    setStatsFeeds([])
    setGuideDepth(0)
    setQuery(term)
    playSessionSound(targetCategory, node ? "bridge" : "open")
    const next = await loadFeeds(targetCategory, term, {silent: true, keepOpen: true})
    const loaded = next[0] || seed || sceneFeed
    setActive(0)
    setModelOpen(true)
    const fullWelcome = shouldUseFullDemoWelcome()
    const line = presentationIntro({kind, node, targetCategory, targetFeed: loaded, fullWelcome})
    recordDirectorMessage("ai", line, node ? `${node.title} Node` : "Auto Demo")
    setDirectorStatus({phase: node ? `${node.title} episode` : "Category episode", detail: loaded.title, status: node ? "Paid node episode started. GLBs, podcast clips, video bridges, and sound effects will build the episode." : "Free category episode started. GLBs, podcast clips, video bridges, and sound effects will build the episode."})
    speakAfterVisual(line, visualKeyFor(loaded, stages[0]), 500)
    wake()
  }

  function startDemoMode(kind){
    const isSameActive = autoPresent && demoMode === kind
    if(isSameActive){
      setAutoPresent(false)
      setShowcaseAuto(false)
      setDemoMode("")
      setPlaying(false)
      playSessionSound(category, "stop")
      setDirectorStatus({phase: "Episode paused", detail: sceneFeed.title, status: "Category episodes are free to replay. Paid nodes unlock specialized episode lanes."})
      return
    }
    autoStepRef.current = 0
    launchPresentationDemo({kind})
  }

  async function openContainedModel(){
    trackObservatoryPixel("glb_preview_play", {
      assetId: sceneFeed?.id || "",
      keywordHint: sceneFeed?.title || query,
      metadata: {control: "3d-model-view", source: sceneFeed?.apiSource || sceneFeed?.apiStatus || ""}
    })
    announceOpen3dModel(sceneFeed)
    setSelectedGlbPlayAsset({
      feed: sceneFeed,
      label: "Current GLB",
      modelUrl: exactRenderableModelUrl(sceneFeed),
      embedUrl: providerEmbedUrl(sceneFeed),
      fallbackModelUrl: verifiedBackupModelUrl(sceneFeed, category, active)
    })
    setModelOpen(true)
    setGlbDockExpanded(false)
    setGlbPlayViewOpen(true)
    setPlaying(true)
    setDirectorStatus({phase: "Rendering GLB preview", detail: sceneFeed.title, status: "Opening the Babylon/GLB play preview as the episode analytics continue moving."})
    setInteractionPulse(true)
    window.clearTimeout(pulseTimer.current)
    pulseTimer.current = window.setTimeout(() => setInteractionPulse(false), 900)
    window.clearTimeout(previewCommentaryTimer.current)
    previewCommentaryTimer.current = window.setTimeout(() => {
      const angleStage = stages[1]
      setStageIndex(1)
      setPresentationProgress(46)
      setDirectorStatus({phase: "Angle pass", detail: sceneFeed.title, status: "Rotating camera and syncing this asset into the episode timeline."})
      const line = tierAssetDescription({feed: sceneFeed, category, stage: angleStage, tier})
      recordDirectorMessage("ai", line, "Preview angle pass")
      speakAfterVisual(line, visualKeyFor(sceneFeed, angleStage), 250)
      window.setTimeout(() => {
        if(autoPresent) return
        const next = stages[2]
        setStageIndex(2)
        recordDirectorMessage("ai", `Angle pass complete. Moving to the related asset lane for ${sceneFeed.title}.`, "Preview progression")
        speakAfterVisual(`Angle pass complete. I am moving to the related asset lane so the presentation continues normally.`, visualKeyFor(sceneFeed, next), 300)
      }, Math.max(5200, Math.round(7200 / presentationSpeed)))
    }, PREVIEW_COMMENTARY_MS)
    wake()
    if(sceneFeed.embedUrl || sceneFeed.modelUrl || loading){
      recordDirectorMessage("ai", `Preview opened for ${sceneFeed.title}. DigitalHut is waiting for the visual cue before moving to angle detail, podcast bridge, or next model.`, "Play Preview")
      return
    }
    const next = await loadFeeds(category, sceneFeed.query || query, {silent: true, keepOpen: true})
    const loaded = next[0] || sceneFeed
    setModelOpen(true)
    recordDirectorMessage("ai", `Preview opened for ${loaded.title}. DigitalHut is waiting for the visual cue before moving to angle detail, podcast bridge, or next model.`, "Play Preview")
  }

  function minimizeGlbRenderer(event){
    event?.preventDefault?.()
    event?.stopPropagation?.()
    window.clearTimeout(idleModelTimer.current)
    setGlbPlayViewOpen(false)
    setGlbDockExpanded(false)
    setModelOpen(false)
    setDirectorStatus({phase: "GLB Renderer minimized", detail: sceneFeed.title, status: "3D Model View is closed. Press 3D Model View to reopen the live renderer."})
  }

  function trackObservatoryPixel(eventName, data = {}){
    try {
      window.digitalhutPixel?.track?.(eventName, {
        category: data.category || category,
        assetId: data.assetId || sceneFeed?.id || "",
        keywordHint: data.keywordHint || query || sceneFeed?.title || category,
        metadata: {
          episode: youtubeStory?.episodeName || "",
          videoTitle: youtubeStory?.videoTitle || "",
          feedTitle: sceneFeed?.title || "",
          presentationProgress,
          autoPresent,
          podcastFeatureOpen,
          glbPlayViewOpen,
          ...data.metadata
        }
      })
    } catch {
      // Analytics should never interrupt playback or rendering.
    }
  }

  async function refreshLiveRenderer(){
    setLoading(true)
    setModelOpen(true)
    setStageIndex(0)
    setGuideDepth(0)
    playSessionSound(category, "bridge")
    speak("Refreshing the live renderer. I will rebuild the feed and use the newest real model or scene preview instead of a stale fallback.")
    const next = await loadFeeds(category, sceneFeed.query || query, {silent: true, keepOpen: true})
    const loaded = next[0] || rotateFreshList(seedFeeds(category), freshnessSeed, `${category}:refresh-loaded`)[0] || sceneFeed
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
    if(index >= 0) {
      setActive(index)
    } else if(item?.id || item?.title) {
      setFeeds((current) => {
        const next = [item, ...current.filter((candidate) => candidate.id !== item.id && candidate.title !== item.title)]
        return next.slice(0, 14)
      })
      setActive(0)
    }
    if(item?.category && item.category !== category) {
      setCategory(item.category)
      setTour(toursFor(item.category)[0].id)
    }
    setQuery(item.query || item.title)
    setStageIndex(0)
    setPresentationProgress(0)
    setYoutubeSeekAnchor(0)
    setObservatoryBuildSeed(analyticsClock)
    setSelectedGlbPlayAsset(null)
    setModelOpen(true)
    setGuideDepth(0)
    speakAfterVisual(`Loaded ${item.title}. The renderer stays live for this asset.`, visualKeyFor(item, stages[0]), 600)
    wake()
  }

  async function openDigitalhutEpisodePreview(preview, targetCategory = preview?.category || category){
    trackObservatoryPixel("episode_preview_autoplay_start", {
      category: targetCategory,
      keywordHint: preview?.title || preview?.query || targetCategory,
      metadata: {control: "quick-panel-preview", videoId: preview?.videoId || "", cadenceSlot: preview?.cadenceSlot || "", cadenceDetail: preview?.cadenceDetail || ""}
    })
    const seed = rotateFreshList(seedFeeds(targetCategory), freshnessSeed, `${targetCategory}:dropdown-category`)[0]
    const term = preview?.query || seed?.query || `${targetCategory} DigitalHut observatory episode`
    const previewVideoId = preview?.videoId || ""
    const previewVideo = previewVideoId ? {
      id: previewVideoId,
      videoId: previewVideoId,
      embedUrl: preview?.embedUrl || youtubeDirectEmbed(previewVideoId),
      title: preview?.title || preview?.episodeName || term,
      description: preview?.description || `${targetCategory} selected quick panel for DigitalHut Observatory.`,
      channelTitle: preview?.channelTitle || preview?.detail || "DigitalHut quick YouTube panel",
      thumbnail: preview?.thumbnail || `https://i.ytimg.com/vi/${previewVideoId}/hqdefault.jpg`,
      thumbnails: {
        medium: {url: preview?.thumbnail || `https://i.ytimg.com/vi/${previewVideoId}/mqdefault.jpg`},
        high: {url: preview?.thumbnail || `https://i.ytimg.com/vi/${previewVideoId}/hqdefault.jpg`}
      },
      embeddable: true,
      privacyStatus: "public",
      uploadStatus: "processed",
      liveBroadcastContent: "none",
      durationSeconds: 180,
      apiStatus: "human-selected-youtube-panel",
      contentFit: preview?.contentFit || "human selected",
      fitDetail: preview?.fitDetail || "Viewer selected from the category-locked quick panel."
    } : null
    setCategory(targetCategory)
    setTour(toursFor(targetCategory)[0].id)
    setStageIndex(0)
    setStatsFeeds([])
    setGuideDepth(0)
    setQuery(term)
    if(previewVideo){
      const backupVideos = seededYoutubePanelVideosFor(targetCategory, term, 4, freshnessSeed).filter((video) => youtubeVideoIdFor(video) !== previewVideoId)
      setYoutubeVideoIndex(0)
      setYoutubeSearch({
        status: "human-selected-youtube-panel",
        configured: true,
        provider: preview?.contentFit === "api matched" ? "DigitalHut quick panel / YouTube API matched" : "DigitalHut quick panel / category storyboard",
        query: term,
        videos: [previewVideo, ...backupVideos].slice(0, 4),
        analytics: {contentFit: preview?.contentFit || "human selected", fitDetail: preview?.fitDetail || ""},
        fetchedAt: new Date().toISOString()
      })
    }
    setPresentationProgress(0)
    setYoutubeSeekAnchor(0)
    setObservatoryBuildSeed(analyticsClock)
    setAutoPresent(true)
    setDemoMode("current")
    setMode("premium")
    setPlaying(true)
    setModelOpen(true)
    setGlbDockExpanded(false)
    playSessionSound(targetCategory, "open")
    const next = await loadFeeds(targetCategory, term, {silent: true, keepOpen: true})
    const loaded = next[0] || seed || sceneFeed
    setActive(0)
    setDirectorStatus({
      phase: "Human-picked episode",
      detail: preview?.title || loaded.title,
      status: "DigitalHut is rebuilding video, podcast, 3D preview, and analytics from the first live cue."
    })
    speakAfterVisual(`DigitalHut episode selected. ${preview?.title || loaded.title}. The Observatory is rebuilding the analytics live from the video, podcast, and 3D preview.`, visualKeyFor(loaded, stages[0]), 500)
    wake()
  }

  function chooseCategoryFromDropdown(targetCategory){
    if(!targetCategory || targetCategory === category) return
    trackObservatoryPixel("category_lane_select", {
      category: targetCategory,
      keywordHint: targetCategory,
      metadata: {fromCategory: category, control: "category-dropdown"}
    })
    setCategoryPanelOpen(false)
    const seed = rotateFreshList(seedFeeds(targetCategory), freshnessSeed, `${targetCategory}:dropdown-seed`)[0]
    const quickVideo = seededYoutubePanelVideosFor(targetCategory, seed?.query || `${targetCategory} DigitalHut video observatory`, 1, freshnessSeed)[0]
    openDigitalhutEpisodePreview({
      category: targetCategory,
      title: quickVideo?.title || `${targetCategory} DigitalHut Episode`,
      query: quickVideo?.title || seed?.query || `${targetCategory} DigitalHut video observatory`,
      thumbnail: quickVideo?.thumbnail || seed?.thumbnail || stockUrl(targetCategory, 0),
      videoId: quickVideo?.videoId,
      embedUrl: quickVideo?.embedUrl,
      channelTitle: quickVideo?.channelTitle
    }, targetCategory)
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

  async function runCurrentMarket(value = currentMarketInput, control = "current-market"){
    const stock = marketStockFor(value)
    trackObservatoryPixel("ticker_search", {
      category: "Businesses",
      keywordHint: `${stock.symbol} ${stock.company} market observatory`,
      search: stock.symbol,
      metadata: {
        symbol: stock.symbol,
        company: stock.company,
        lane: stock.lane,
        control
      }
    })
    trackObservatoryPixel("market_view_open", {
      category: "Businesses",
      keywordHint: `${stock.symbol} ${stock.company}`,
      metadata: {symbol: stock.symbol, company: stock.company, lane: stock.lane, control}
    })
    const videoPhrase = currentMarketVideoPhraseFor(stock)
    const glbPhrase = currentMarketGlbPhraseFor(stock)
    setCurrentMarketOpen(true)
    setCurrentMarketInput(stock.symbol)
    setLoading(true)
    setCategory("Businesses")
    setTour(toursFor("Businesses")[0].id)
    setPlaying(true)
    setAutoPresent(true)
    setDemoMode("current")
    setMode("premium")
    setStageIndex(stages.findIndex((item) => item.kind === "stats"))
    setStatsFeeds([])
    setModelOpen(true)
    setGuideDepth(0)
    setQuery(videoPhrase)
    setYoutubeVideoIndex(0)
    setPodcastClipIndex(0)
    setPresentationProgress(0)
    setYoutubeSeekAnchor(0)
    setObservatoryBuildSeed(analyticsClock)
    setDirectorStatus({phase: "Current Market", detail: `${stock.symbol} ${stock.company}`, status: "Building stock chart, market transcript, video radar, podcast lane, and GLB environment."})
    recordDirectorMessage("user", `Current Market ${stock.symbol}`, "Current Market")
    setYoutubeSearch({
      status: "current-market-video-panels",
      configured: true,
      provider: "DigitalHut Current Market video lane",
      query: videoPhrase,
      videos: seededYoutubePanelVideosFor("Businesses", videoPhrase, 4, freshnessSeed),
      analytics: {},
      fetchedAt: new Date().toISOString()
    })
    setPodcastSearch((current) => ({
      ...current,
      status: "loading-current-market-podcast",
      query: currentMarketPodcastPhraseFor(stock)
    }))
    try {
      const [{payload, optionsPayload, feed: rawMarketFeed}, glbResults] = await Promise.all([
        resolveMarketFlow(stock.symbol),
        resolveApiFeeds("Businesses", glbPhrase).then((items) => items.map((item, index) => attachRendererModel(item, "Businesses", glbPhrase, index))).catch(() => [])
      ])
      const sortedGlbs = rotateFreshList(sortRendererFeeds(glbResults), freshnessSeed, `current-market:${stock.symbol}:glbs`)
      const primaryGlb = sortedGlbs.find((item) => bestRenderableModelUrl(item)) || sortedGlbs[0]
      const marketFeed = decorateCurrentMarketFeed({
        ...rawMarketFeed,
        modelUrl: primaryGlb?.modelUrl || rawMarketFeed.modelUrl,
        viewerUrl: primaryGlb?.viewerUrl || rawMarketFeed.viewerUrl,
        embedUrl: primaryGlb?.embedUrl || rawMarketFeed.embedUrl,
        thumbnail: primaryGlb?.thumbnail || rawMarketFeed.thumbnail,
        relatedGlbTitle: primaryGlb?.title
      }, stock, payload, optionsPayload)
      const nextFeeds = sortRendererFeeds([
        marketFeed,
        ...sortedGlbs,
        ...apiCategoryFeeds.filter((item) => item.category === "Businesses"),
        ...rotateFreshList(seedFeeds("Businesses"), freshnessSeed, `current-market:${stock.symbol}:business-seeds`)
      ]).filter((item, index, list) => item && list.findIndex((entry) => entry.id === item.id || entry.title === item.title) === index).slice(0, 14)
      setFeeds(nextFeeds)
      setStatsFeeds([marketFeed])
      setActive(0)
      setLoading(false)
      const status = payload.configured === false ? payload.message : payload.summary
      setDirectorStatus({phase: "Current Market ready", detail: `${stock.symbol} ${stock.company}`, status})
      recordDirectorMessage("ai", `Current Market ready for ${stock.symbol}. ${status || "Chart, transcript highlights, video, podcast, and GLB lanes are connected."}`, "Current Market")
      speakAfterVisual(`Current Market ready for ${stock.symbol}. DigitalHut is building market highlights, chart, video, podcast, and GLB environment together.`, visualKeyFor(marketFeed, stages[0]), 500)
    } catch (error) {
      const message = error?.message || "Unable to load current market"
      const fallbackFeed = decorateCurrentMarketFeed(marketFlowFeed({
        symbol: stock.symbol,
        configured: false,
        message,
        windows: [],
        source: "Current Market fallback"
      }), stock, {symbol: stock.symbol, configured: false, message, source: "Current Market fallback"})
      setFeeds([fallbackFeed, ...rotateFreshList(seedFeeds("Businesses"), freshnessSeed, `current-market:${stock.symbol}:fallback-seeds`)].slice(0, 12))
      setStatsFeeds([fallbackFeed])
      setActive(0)
      setLoading(false)
      setDirectorStatus({phase: "Current Market waiting", detail: `${stock.symbol} ${stock.company}`, status: message})
      recordDirectorMessage("ai", `Current Market waiting for ${stock.symbol}. ${message}`, "Current Market")
    }
    wake()
  }

  function openMarketQuickPick(pick){
    if(!pick) return
    trackObservatoryPixel("ticker_search", {
      category: "Businesses",
      keywordHint: `${pick.symbol || activeCurrentMarketStock.symbol} ${pick.contract || "market option pulse"}`,
      search: pick.symbol || activeCurrentMarketStock.symbol,
      metadata: {
        symbol: pick.symbol || activeCurrentMarketStock.symbol,
        contract: pick.contract || "",
        direction: pick.direction || "",
        control: "quick-market-option-pulse",
        live: Boolean(pick.live)
      }
    })
    setCurrentMarketOpen(true)
    setCurrentMarketInput(pick.symbol || activeCurrentMarketStock.symbol)
    if(pick.raw?.contract && currentMarketActive){
      runSelectedOptionPrint(pick.raw)
      return
    }
    runCurrentMarket(pick.symbol || activeCurrentMarketStock.symbol, "quick-market-option-pulse")
  }

  async function runSearch(searchOverride = ""){
    const searchValue = String(typeof searchOverride === "string" && searchOverride ? searchOverride : query || "").trim()
    if(!searchValue) return
    trackObservatoryPixel("search_run", {
      keywordHint: searchValue,
      metadata: {queryLength: searchValue.length, reason: searchOverride ? "intent-radar-search" : "observatory-command-search"}
    })
    const currentMarketMatch = resolveCurrentMarketStock(searchValue)
    if(currentMarketMatch){
      await runCurrentMarket(currentMarketMatch.symbol)
      return
    }
    const ticker = tickerFromSearch(searchValue)
    if(ticker){
      setLoading(true)
      setCategory("Businesses")
      setTour(toursFor("Businesses")[0].id)
      setPlaying(true)
      setStageIndex(stages.findIndex((item) => item.kind === "stats"))
      setStatsFeeds([])
      setModelOpen(true)
      setGuideDepth(0)
      setQuery(ticker)
      setDirectorStatus({phase: "Market flow", detail: ticker, status: "Loading Alpaca trade windows: 12h, 6h, 3h, 1h"})
      recordDirectorMessage("user", `Search ticker ${ticker}`, "Market flow")
      try {
        const {payload, feed: marketFeed} = await resolveMarketFlow(ticker)
        const nextFeeds = sortRendererFeeds([marketFeed, ...apiCategoryFeeds.filter((item) => item.category === "Businesses"), ...rotateFreshList(seedFeeds("Businesses"), freshnessSeed, `ticker:${ticker}:business-seeds`)]).slice(0, 12)
        setFeeds(nextFeeds)
        setStatsFeeds([marketFeed])
        setActive(0)
        setLoading(false)
        const status = payload.configured === false ? payload.message : payload.summary
        setDirectorStatus({phase: "Market flow ready", detail: ticker, status})
        recordDirectorMessage("ai", status, "Alpaca market flow")
        speak(`Market flow ready for ${ticker}. ${status}`)
      } catch (error) {
        const message = error?.message || "Unable to load market flow"
        setLoading(false)
        setDirectorStatus({phase: "Market flow unavailable", detail: ticker, status: message})
        recordDirectorMessage("ai", `Market flow unavailable for ${ticker}. ${message}`, "Alpaca market flow")
        speak(`Market flow unavailable for ${ticker}. Check Alpaca API keys and market data permissions.`)
      }
      wake()
      return
    }
    const targetCategory = categoryFromCommand(searchValue) || category
    const nextQuery = queryFromCommand(searchValue, searchValue)
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

  function runSearchIntentChip(term){
    const nextTerm = String(term || "").trim()
    if(!nextTerm) return
    trackObservatoryPixel("search_intent_chip_select", {
      category,
      keywordHint: nextTerm,
      metadata: {
        source: "top-search-intent-radar",
        currentEpisode: youtubeStory?.episodeName || sceneFeed?.title || category,
        platformPace: platformCadence?.pace || "category lock"
      }
    })
    setQuery(nextTerm)
    runSearch(nextTerm)
  }

  async function runSelectedOptionPrint(print = null){
    const candidate = print || optionCandidateFromFeed(sceneFeed)
    const symbol = sceneFeed.market?.symbol || tickerFromSearch(query)
    if(!candidate?.contract || !symbol){
      recordDirectorMessage("ai", "I do not have a highlighted option print yet. Search a ticker first, then say there it is when the unusual print is visible.", "Options Market Print Feed")
      speak("I do not have a highlighted option print yet. Search a ticker first, then say there it is when the unusual option print is visible.")
      return
    }
    trackObservatoryPixel("ticker_search", {
      category: "Businesses",
      keywordHint: `${symbol} ${candidate.contract} selected option print`,
      search: symbol,
      metadata: {
        symbol,
        contract: candidate.contract,
        premium: Number(candidate.premium || 0),
        direction: candidate.directionalPressure || candidate.side || "",
        control: "selected-option-print"
      }
    })
    setSelectedOptionPrint(candidate)
    setLoading(true)
    setStageIndex(stages.findIndex((item) => item.kind === "stats"))
    setModelOpen(true)
    setDirectorStatus({phase: "Running selected option", detail: candidate.contract, status: "Loading focused Alpaca option contract prints"})
    recordDirectorMessage("user", `There it is: ${candidate.contract}`, "Options Market Print Feed")
    try {
      const optionsPayload = await resolveOptionContractFlow(symbol, candidate.contract)
      const baseMarket = sceneFeed.market || {}
      const focusedFeed = {
        ...sceneFeed,
        id: `selected-option:${candidate.contract}:${Date.now()}`,
        title: `${symbol} Selected Option Print`,
        note: `${optionsPayload.summary || `Focused option flow loaded for ${candidate.contract}.`} Selected print premium was about $${Math.round(candidate.premium || 0).toLocaleString()} with ${candidate.directionalPressure || candidate.side || "pressure pending"}.`,
        apiStatus: "selected-options-print-flow",
        market: {
          ...baseMarket,
          symbol,
          optionsWindows: optionsPayload.windows || [],
          optionsSummary: optionsPayload.summary || "",
          selectedContract: candidate.contract,
          optionCandidate: candidate,
          disclaimer: optionsPayload.disclaimer || baseMarket.disclaimer
        }
      }
      setFeeds((current) => sortRendererFeeds([focusedFeed, ...current]).slice(0, 12))
      setStatsFeeds([focusedFeed])
      setActive(0)
      setLoading(false)
      setDirectorStatus({phase: "Selected option ready", detail: candidate.contract, status: optionsPayload.summary || "Focused contract flow loaded"})
      recordDirectorMessage("ai", focusedFeed.note, "Selected option")
      speak(`Selected option ready. ${focusedFeed.note}`)
    } catch (error) {
      const message = error?.message || "Unable to run selected option"
      setLoading(false)
      setDirectorStatus({phase: "Selected option unavailable", detail: candidate.contract, status: message})
      recordDirectorMessage("ai", `Selected option unavailable for ${candidate.contract}. ${message}`, "Selected option")
      speak(`Selected option unavailable. Check Alpaca options market data permissions.`)
    }
  }

  function nextStage(){
    playSessionSound(category, "rotate")
    const nextIndex = (stageIndex + 1) % stages.length
    setStageIndex(nextIndex)
    const nextProgress = Math.min(100, presentationProgress + 16)
    setPresentationProgress(nextProgress)
    setYoutubeSeekAnchor(Math.max(0, Math.round(nextProgress * 1.2)))
    setGuideDepth(0)
    const next = stages[nextIndex]
    speakAfterVisual(`${guideLine({category, stage: next, feed: sceneFeed, tour: activeTour})} ${feedbackPrompt({category, feed: sceneFeed})}`, visualKeyFor(sceneFeed, next), Math.round(1400 / presentationSpeed))
    wake()
  }

  function rotateObservatorySet(direction = 1){
    trackObservatoryPixel("autoplay_episode_shift", {
      keywordHint: sceneFeed?.title || query,
      metadata: {direction: direction < 0 ? "previous" : "next", control: "episode-transport"}
    })
    playSessionSound(category, "open")
    const pool = feeds.length ? feeds : rotateFreshList(seedFeeds(category), freshnessSeed, `${category}:rotate-set`)
    const count = Math.max(1, pool.length)
    const nextIndex = ((active + direction) % count + count) % count
    const nextItem = pool[nextIndex] || sceneFeed
    if(feeds.length) setActive(nextIndex)
    const videoCount = Math.max(1, youtubeStory.videoCount || youtubeSearch.videos?.length || 1)
    setYoutubeVideoIndex((value) => {
      if(videoCount <= 1) return 0
      const randomStep = 1 + Math.floor(Math.random() * (videoCount - 1))
      const signedStep = direction < 0 ? -randomStep : randomStep
      return ((value + signedStep) % videoCount + videoCount) % videoCount
    })
    setPodcastClipIndex((value) => {
      const podcastCount = Math.max(1, podcastEpisodeCandidatesFor(podcastSearch).length)
      if(podcastCount <= 1) return 0
      return (value + 1 + Math.floor(Math.random() * (podcastCount - 1))) % podcastCount
    })
    setStageIndex(0)
    setPresentationProgress(0)
    setYoutubeSeekAnchor(0)
    setObservatoryBuildSeed(analyticsClock)
    setPodcastFeatureOpen(false)
    setAutoPresent(true)
    setShowcaseAuto(false)
    setDemoMode("current")
    setPlaying(true)
    setGlbDockExpanded(true)
    setModelOpen(true)
    setGuideDepth(0)
    const directionLabel = direction < 0 ? "Previous" : "Next"
    setDirectorStatus({phase: `${directionLabel} Episode`, detail: nextItem.title, status: "DigitalHut is jumping to a random same-category YouTube episode, refreshing the GLB preview, and matching a related podcast clip."})
    speakAfterVisual(`${directionLabel} same-category episode. The YouTube renderer, GLB play preview, podcast clip, and content radar are rebuilding from the selected video metadata.`, visualKeyFor(nextItem, stages[0]), 500)
    wake()
  }

  function previousFeed(){
    rotateObservatorySet(-1)
  }

  function nextFeed(){
    rotateObservatorySet(1)
  }

  function scrubPresentation(value){
    const progress = Math.max(0, Math.min(100, Number(value) || 0))
    trackObservatoryPixel("timeline_scrub", {
      keywordHint: sceneFeed?.title || query,
      metadata: {progress, control: "presentation-slider"}
    })
    const chapter = timelineChapterFor(progress)
    const targetStage = Math.min(chapter.stage, stages.length - 1)
    const targetFeedIndex = feeds.length > 1 && chapter.feedOffset ? (active + chapter.feedOffset) % feeds.length : active
    const targetFeed = feeds[targetFeedIndex] || sceneFeed
    setPresentationProgress(progress)
    setYoutubeSeekAnchor(Math.max(0, Math.round(progress * 1.2)))
    setObservatoryBuildSeed(analyticsClock)
    setStageIndex(targetStage)
    if(targetFeedIndex !== active) setActive(targetFeedIndex)
    setModelOpen(true)
    setPlaying(true)
    setPodcastFeatureOpen(false)
    setGuideDepth(0)
    playSessionSound(category, chapter.cue)
    const caption = chapterCaption({chapter, category, feed: targetFeed, tier, source: targetFeed.apiSource || targetFeed.apiStatus})
    setDirectorStatus({phase: chapter.label, detail: targetFeed.title, status: caption})
    recordDirectorMessage("ai", caption, "Timeline presentation")
    wake()
  }

  function openPodcastFeatureInterrupt(){
    trackObservatoryPixel("podcast_interrupt_play", {
      keywordHint: podcastClip?.title || youtubeStory?.episodeName || sceneFeed?.title,
      metadata: {
        podcastTitle: podcastClip?.title || "",
        episode: youtubeStory?.episodeName || "",
        control: "podcast-feature",
        sourceType: podcastClip?.sourceType || "",
        hasPublisherAudio: Boolean(podcastClip?.audioUrl),
        sourceUrl: podcastClip?.pageUrl || podcastClip?.searchUrl || ""
      }
    })
    const podcastProgress = 64
    const chapter = timelineChapterFor(podcastProgress)
    const targetStage = Math.min(chapter.stage, stages.length - 1)
    setPresentationProgress(podcastProgress)
    setYoutubeSeekAnchor(Math.max(0, Math.round(podcastProgress * 1.2)))
    setObservatoryBuildSeed(analyticsClock)
    setStageIndex(targetStage)
    setModelOpen(true)
    setGlbDockExpanded(true)
    setPlaying(true)
    setAutoPresent(false)
    setShowcaseAuto(false)
    setDemoMode("podcast-feature")
    setPodcastFeatureOpen(true)
    setGuideDepth(0)
    const podcastAudio = podcastAudioRef.current
    if(podcastAudio && podcastClip.audioUrl){
      podcastAudio.muted = false
      podcastAudio.volume = 1
      if(podcastAudio.src !== podcastClip.audioUrl) podcastAudio.src = podcastClip.audioUrl
      podcastAudio.currentTime = 0
      podcastAudio.load?.()
      podcastAudio.play().catch(() => {
        window.setTimeout(() => podcastAudio.play().catch(() => null), 120)
      })
    }
    playSessionSound(category, "bridge")
    const caption = podcastClip.audioUrl
      ? `Podcast featuring interrupt: YouTube is paused while ${podcastClip.title || "the related podcast clip"} plays with the speaker moment, source links, GLB replica, and timeline analytics.`
      : `Podcast featuring source hold: YouTube is paused while DigitalHut keeps the matched podcast source, GLB replica, and timeline analytics active without replacing it with another video.`
    setDirectorStatus({phase: "Podcast Featuring", detail: youtubeStory.episodeName, status: caption})
    recordDirectorMessage("ai", caption, "Podcast interrupt")
    speak(`Podcast featuring. ${podcastClip.title || contentRadar.subjectLine || liveMeaning.podcastCue}. Source radar is live.`)
    wake()
  }

  function closePodcastFeatureInterrupt(resume = false){
    trackObservatoryPixel("podcast_interrupt_end", {
      keywordHint: podcastClip?.title || youtubeStory?.episodeName || sceneFeed?.title,
      metadata: {
        podcastTitle: podcastClip?.title || "",
        episode: youtubeStory?.episodeName || "",
        resumedYoutube: Boolean(resume),
        sourceType: podcastClip?.sourceType || "",
        hasPublisherAudio: Boolean(podcastClip?.audioUrl)
      }
    })
    setPodcastFeatureOpen(false)
    podcastAudioRef.current?.pause()
    if(resume){
      setAutoPresent(true)
      setPlaying(true)
      setObservatoryBuildSeed(analyticsClock)
      setDirectorStatus({phase: "YouTube story resumed", detail: sceneFeed.title, status: "Podcast feature closed. The YouTube renderer, GLB replica, and analytics timeline are moving together again."})
    } else if(!autoPresent){
      setPlaying(false)
    }
  }

  function trackPodcastSourceOpen(){
    trackObservatoryPixel("podcast_source_open", {
      keywordHint: podcastClip?.title || youtubeStory?.episodeName || sceneFeed?.title,
      metadata: {
        podcastTitle: podcastClip?.title || "",
        episode: youtubeStory?.episodeName || "",
        sourceUrl: podcastClip?.pageUrl || podcastClip?.searchUrl || "",
        provider: podcastClip?.provider || "",
        hasPublisherAudio: Boolean(podcastClip?.audioUrl)
      }
    })
  }

  function openAutoProducedGlbReplica(item){
    const targetFeed = item?.feed || sceneFeed
    trackObservatoryPixel("glb_replica_play", {
      assetId: targetFeed?.id || "",
      keywordHint: targetFeed?.title || query,
      metadata: {title: targetFeed?.title || "", control: "auto-produced-glb-replica"}
    })
    chooseFeed(targetFeed)
    setSelectedGlbPlayAsset({
      feed: targetFeed,
      label: item?.label || "Auto GLB replica",
      modelUrl: cleanUrl(exactRenderableModelUrl(targetFeed) || item?.directModelUrl || ""),
      embedUrl: cleanUrl(item?.embedUrl || providerEmbedUrl(targetFeed)),
      fallbackModelUrl: cleanUrl(item?.fallbackModelUrl || item?.modelUrl || verifiedBackupModelUrl(targetFeed, category, 0))
    })
    setStageIndex(0)
    setPresentationProgress((value) => Math.max(14, Number(value) || 0))
    setYoutubeSeekAnchor((value) => Math.max(0, Number(value) || 0))
    setAutoPresent(true)
    setShowcaseAuto(false)
    setDemoMode("current")
    setModelOpen(true)
    setGlbDockExpanded(false)
    setGlbPlayViewOpen(true)
    setPlaying(true)
    setGuideDepth(0)
    setDirectorStatus({phase: "Auto GLB replica playing", detail: targetFeed.title, status: "The 3D Play Preview is opening with the YouTube story, podcast radar, and analytics system."})
    recordDirectorMessage("ai", `${targetFeed.title} is playing as the auto-produced GLB replica for the current YouTube search story.`, "GLB replica")
    wake()
  }

  function skipPresentation(delta){
    scrubPresentation(presentationProgress + delta)
  }

  function toggleMoviePlayback(){
    if(autoPresent){
      trackObservatoryPixel("autoplay_pause", {
        keywordHint: sceneFeed?.title || query,
        metadata: {control: "system-play-pause", progress: presentationProgress}
      })
      setAutoPresent(false)
      setShowcaseAuto(false)
      setDemoMode("")
      setPlaying(false)
      setPodcastFeatureOpen(false)
      playSessionSound(category, "stop")
      setDirectorStatus({phase: "Episode paused", detail: sceneFeed.title, status: "Timeline paused. Scrub, skip, or press play to continue the media sequence."})
      return
    }
    trackObservatoryPixel("autoplay_start", {
      keywordHint: sceneFeed?.title || query,
      metadata: {control: "system-play-pause", progress: presentationProgress}
    })
    setPodcastFeatureOpen(false)
    startDemoMode("current")
  }

  function toggleAutoPresent(){
    const next = !autoPresent
    trackObservatoryPixel(next ? "autoplay_start" : "autoplay_pause", {
      keywordHint: sceneFeed?.title || query,
      metadata: {control: "auto-present-toggle", progress: presentationProgress}
    })
    setShowcaseAuto(false)
    setAutoPresent(next)
    setPodcastFeatureOpen(false)
    setDemoMode(next ? "all" : "")
    setMode("premium")
    setPlaying(next)
    setModelOpen(next || modelOpen)
    if(next) {
      autoStepRef.current = 0
      setPresentationProgress(0)
      setYoutubeSeekAnchor(0)
      setObservatoryBuildSeed(analyticsClock)
    }
    playSessionSound(category, next ? "open" : "stop")
    setDirectorStatus({phase: next ? "Episode autoplay" : "Episode paused", detail: sceneFeed.title, status: next ? "Category episode is free. The timeline will rotate GLBs, media bridges, podcast clips, and sound effects." : "Episode stopped."})
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
    if(lower.includes("there it is") || lower.includes("run the stock option") || lower.includes("run option") || lower.includes("lock option")){
      runSelectedOptionPrint()
      return
    }
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
      openContainedModel()
      recordDirectorMessage("ai", `Opening Play Preview for ${sceneFeed.title}.`, "Play Preview")
      return
    }
    if(lower.includes("identify") || lower.includes("upload to database") || lower.includes("database upload") || lower.includes("what should i purchase") || lower.includes("what do i have to purchase")){
      setModelOpen(true)
      setNotesOpen(category === "Researcher" || lower.includes("researcher") || lower.includes("database"))
      const line = assetIdentificationWorkflow({feed: sceneFeed, category, tier})
      recordDirectorMessage("ai", line, "Asset identification")
      speak(line)
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
      const line = tierAssetDescription({feed: sceneFeed, category, stage, tier})
      recordDirectorMessage("ai", line, "Model readout")
      speak(line)
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
    const loaded = next[0] || rotateFreshList(seedFeeds("DigitalHut Presentation"), freshnessSeed, "presentation-search-loaded")[0]
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
      const seed = rotateFreshList(seedFeeds(returnCategory), freshnessSeed, `${returnCategory}:return-from-mechanic`)[0]
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
    const loaded = next[0] || rotateFreshList(seedFeeds("Mobility"), freshnessSeed, "mobility-mode-loaded")[0]
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
    const loaded = next[0] || rotateFreshList(seedFeeds("Mobility"), freshnessSeed, `${item.id}:mobility-loaded`)[0]
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

  return <main className={observatoryClassName} data-main-frame={digitalHutBrainMap.mainFrame} data-observatory-category={category} data-observatory-status={loading ? "verifying" : sceneFeed.apiStatus || "ready"} data-physical-assets="sensitive" data-performance-profile={performanceProfile.id} data-performance-reason={performanceProfile.reason} onPointerMove={handleObservatoryPointer} onPointerLeave={centerCockpitMotion} onPointerDown={(event) => {wake(); triggerSystemPulse(event)}} onClickCapture={triggerSystemPulse}>
    <section className="dh-stage">
      <RendererVisual feed={sceneFeed} stage={stage} guided={guided} loading={loading} layer={layer} renderLive={!entryOpen} modelOpen={modelOpen} onOpenModel={openContainedModel} onNext={nextStage} onPlayMore={playMore} onVisualPending={markVisualPending} onVisualReady={markVisualReady} onDirectorUpdate={setDirectorStatus} onMarketOptionSelect={runSelectedOptionPrint} guideText={currentGuideLine} followUps={currentFollowUps} />
      <div className="dh-vignette" />
      {layer === "Architect" && <div className="dh-architect"><b>Architect Layer</b><span>builders / developers / researchers / AIs / experimental</span></div>}
      <>
        <aside className={`dh-wallet-package ${purchaseOpen ? "open" : ""}`} aria-label="DigitalHut wallet purchase package">
          <button className="dh-wallet-package-toggle" type="button" onClick={() => setPurchaseOpen((value) => !value)}>
            <span>Treasury / Packages</span><b>{selectedPurchaseLabel}</b>
          </button>
          {purchaseOpen && <div className="dh-wallet-package-menu">
            <div className="dh-wallet-connect-row"><ConnectButton /></div>
            <small>Main wallet</small>
            <code>{DIGITALHUT_MAIN_WALLET}</code>
            <small>Subscriptions are one route only. Sponsors, commissions, reports, conversion credits, licenses, support, tiers, and nodes can all prepare a verified treasury package.</small>
            <div className="dh-wallet-options">
              {purchaseOptionsBase.map((item) => <button key={item.id} type="button" className={selectedPurchaseIds.includes(item.id) ? "selected" : ""} onClick={() => togglePurchaseOption(item.id)}>
                <span>{item.type}</span><b>{item.title}</b><small>{item.price}</small><em>{item.unlock}</em>
              </button>)}
            </div>
            <button className="dh-wallet-prepare" type="button" onClick={prepareWalletPurchase}>Prepare Package</button>
            <button className="dh-wallet-prepare" type="button" onClick={startBaseEthCheckout} disabled={paymentPending}>{paymentPending ? "Waiting For Wallet" : "Pay With Base ETH"}</button>
            <small>{DIGITALHUT_BASE_ETH_AMOUNT ? `Base ETH amount: ${DIGITALHUT_BASE_ETH_AMOUNT}` : "Base ETH amount env not set. Package preparation is active; live payment request is staged."}</small>
            {DIGITALHUT_BASE_USDC_RECEIVER && <small>USDC Base receiver staged. Token checkout verification comes next.</small>}
            {paymentHash && <small>Tx: {paymentHash}</small>}
            {paymentError && <small>Wallet error: {paymentError.message}</small>}
          </div>}
        </aside>
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

        {false && !mainLobbyOpen && <aside className={`dh-mechanic-status ${displayCollapsed ? "collapsed" : ""}`} aria-label="DigitalHut observatory status">
          <header>
            <span>DigitalHut Display</span>
            <b>{mechanicRuntimeStatus}</b>
            <button className="dh-display-collapse" type="button" onClick={() => setDisplayCollapsed((value) => !value)}>{displayCollapsed ? "Open" : "Collapse"}</button>
          </header>
          <div className="dh-display-body">
          <div className="dh-mechanic-readouts">
            <section><span>View mode</span><b>{category}</b></section>
            <section><span>Network</span><b>{runtimeState.online ? `${runtimeState.connection}${runtimeState.saveData ? " / saver" : ""}` : "Offline"}</b></section>
            <section><span>Renderer</span><b>{sceneVisualKey === visualReadyKey ? "Ready" : loading ? "Loading" : "Standby"}</b></section>
            <section><span>System</span><b>{performanceProfile.label}</b></section>
            <section><span>Presentation</span><b>{runtimePaused ? "Paused" : autoPresent ? "Auto Play" : "Manual"}</b></section>
          </div>
          <div className="dh-ai-operator-readout">
            <span>{directorStatus.phase}</span>
            <b>{directorStatus.detail}</b>
            <small>{directorStatus.status}</small>
          </div>
          <div className="dh-mechanic-current">
            <span>Current public feed</span>
            <b>{sceneFeed.title}</b>
            <small>{sceneFeed.apiSource || sceneFeed.apiStatus || "DigitalHut feed"}</small>
          </div>
          <div className="dh-glb-review-panel">
            <div className="dh-mechanic-panel-head"><span>GLB Rating</span><b>{currentReview.rating ? `${currentReview.rating}/5` : "New"}</b></div>
            <div className="dh-star-row" aria-label="Rate current GLB">
              {[1,2,3,4,5].map((rating) => <button key={rating} type="button" className={rating <= (currentReview.rating || 0) ? "filled" : ""} onClick={() => saveAssetReview(rating)}>{rating <= (currentReview.rating || 0) ? "★" : "☆"}</button>)}
            </div>
            <textarea value={reviewDraft} onChange={(event) => setReviewDraft(event.target.value)} placeholder="Leave a short review. What made this GLB worth watching?" />
            <div className="dh-review-actions">
              <button type="button" onClick={() => saveAssetReview(currentReview.rating || 5)}>Save Review</button>
              <button type="button" onClick={copyAssetBacklink}>Copy Backlink</button>
            </div>
            <small>{currentReview.backlink || backlinkForFeed(sceneFeed)}</small>
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
              launchPresentationDemo({kind: "current", node: item})
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
      {modelOpen && !entryOpen && !analyticsStarted && <PodcastMatchPanel feed={sceneFeed} compact={mechanicMode} specialMoment={presentationChapter.id === "podcast"} />}

      <div className="dh-top" style={{opacity: awake ? 1 : 0.08}}>
        <div className="dh-search">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search observatory APIs..." />
          <button className={`dh-btn mode ${mode === "regular" ? "active" : ""}`} onClick={() => setMode("regular")}>Regular API</button>
          <button className={`dh-btn mode ${mode === "premium" ? "active" : ""}`} onClick={() => setMode("premium")}>Premium Tour</button>
          <button className="dh-btn hot" onClick={() => runSearch()}>Search</button>
          <button className="dh-btn hot" onClick={() => speak(`${category} ${activeTour.id}. ${activeTour.prompt}`)}>Voice</button>
        </div>
        <div className="dh-search-intent-radar" aria-label="DigitalHut content intent radar">
          <b>Intent Radar</b>
          {searchIntentSuggestions.map((term) => <button key={term} type="button" onClick={() => runSearchIntentChip(term)}>{term}</button>)}
        </div>
        <div className="dh-account-cluster">
          <button className="dh-btn dh-backend-top" onClick={() => window.location.href = "/asset-lab"}>Backend</button>
          <button className="dh-btn dh-account" onClick={() => setEntryOpen(true)}>{username || "Choose account"} / {tier}</button>
        </div>
      </div>

      <div className={`dh-category-dock ${categoryPanelOpen ? "open" : "collapsed"}`} style={{opacity: awake ? 1 : 0.18}}>
        <button className="dh-category-dock-toggle" type="button" style={{"--accent": metaFor(category).accent}} onClick={() => setCategoryPanelOpen((value) => !value)} aria-expanded={categoryPanelOpen}>
          <span className="dh-category-icon"><img src={stockUrl(category, 0)} alt="" loading="lazy" /><i /></span>
          <b>{category}</b>
          <small>{categoryPanelOpen ? "Close" : "Lanes"}</small>
        </button>
        <a className="dh-category-proof-chip" href={activeCategoryProofRoute} onClick={() => trackObservatoryPixel("category_proof_open", {category, keywordHint: activeProofPost?.keywords?.[0] || category, metadata: {source: "category-lock"}})}>
          <span>Proof</span>
          <b>{activeProofLane.audience}</b>
        </a>
        <button className={`dh-current-market-trigger ${currentMarketActive ? "active" : ""}`} type="button" onClick={() => runCurrentMarket(currentMarketInput || activeCurrentMarketStock.symbol, "category-lock-market-trigger")}>
          <span>CURRENT MARKET</span>
          <b>{activeCurrentMarketStock.symbol}</b>
        </button>
        {categoryPanelOpen && <div className="dh-category-panel-grid" aria-label="DigitalHut category lanes">
          {categories.map((item, index) => <button key={item.id} className={`dh-category-card ${item.id === category ? "active" : ""}`} style={{"--accent": item.accent}} onClick={() => selectCategory(item.id)}>
            <span className="dh-category-icon"><img src={stockUrl(item.id, index)} alt="" loading="lazy" /><i /></span><small>{item.id}</small>
          </button>)}
        </div>}
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

      <div className="dh-media dh-movie-controls" style={{opacity: awake || autoPresent ? 1 : 0.42}}>
        <div className="dh-movie-head">
          <span>{documentaryTitle(category, tier)}</span>
          <b>{presentationChapter.label}</b>
          <strong className="dh-live-build-stamp">Live Build: YouTube Signals / 3 GLB Dock</strong>
        </div>
        <div className="dh-movie-buttons">
          <button className="dh-btn" onClick={previousFeed}>Previous Set</button>
          <button className={`dh-btn ${autoPresent ? "active" : ""}`} onClick={toggleMoviePlayback}>{autoPresent ? "Pause Episode" : "Play Episode"}</button>
          <button className="dh-btn" onClick={nextFeed}>Next Set</button>
          <button className="dh-btn" onClick={() => skipPresentation(-16)}>Back 15s</button>
          <button className="dh-btn" onClick={() => skipPresentation(18)}>Skip 15s</button>
          <button className="dh-btn" onClick={() => scrubPresentation(64)}>Podcast Clip</button>
          <button className={`dh-btn ${demoMode === "all" ? "active" : ""}`} onClick={() => startDemoMode("all")}>Shuffle Series</button>
        </div>
        <label className="dh-movie-slider" aria-label="DigitalHut episode timeline">
          <input type="range" min="0" max="100" step="1" value={presentationProgress} onChange={(event) => scrubPresentation(event.target.value)} />
          <span>{Math.round(presentationProgress)}%</span>
        </label>
        <div className="dh-movie-ticks">
          {documentaryTimeline.map((item) => <button key={item.id} type="button" className={presentationChapter.id === item.id ? "active" : ""} onClick={() => scrubPresentation(item.at)}>{item.label}</button>)}
        </div>
        <p className="dh-movie-caption">{presentationChapter.media}: {presentationCaption}</p>
        <section className={`dh-youtube-story-renderer meaning-${liveMeaning.id} matrix-${matrixConstruction.mode} visual-${matrixConstruction.visualFamily} ${presentationChapter.id === "podcast" ? "podcast-pulse" : ""} ${podcastFeatureOpen ? "podcast-feature-open" : ""} ${analyticsStarted ? "is-constructing" : "is-awaiting-build"} ${adResetWindow ? "ad-cycle-reset" : ""}`} style={{"--signal-beat": youtubeSignalField.beat, "--stream-pace": streamAnalytics.pace, "--scene-tempo": sceneMotionTempo, "--scene-light": sceneLightPulse, "--stat-resolve": `${Math.round(statResolveRatio * 100)}%`, "--motion-progress": `${Math.round(liveAnalyticsProgress)}%`, "--construction-progress": `${Math.round(observatoryConstructionProgress)}%`, "--scene-shift": sceneShiftIndex, "--analytics-clock": analyticsClock, "--story-hero-image": `url("${storyHeroImage}")`, "--story-hero-shift": storyHeroIndex, "--story-hero-opacity": analyticsStarted ? String(.2 + sceneLightPulse * .28) : ".12"}}>
          <header>
            <div>
              <span>DigitalHut Observatory Experience</span>
              <b>{youtubeStory.episodeName}</b>
            </div>
            <a href={youtubeStory.searchUrl} target="_blank" rel="noreferrer">Open YouTube Search</a>
          </header>
          <div className={`dh-digitalhut-presents ${analyticsStarted ? "is-building" : "is-waiting"}`} aria-label="DigitalHut Presents system state">
            <span>DigitalHut Presents</span>
            <b>{analyticsStarted ? "Creating Observatory Experience" : "System waiting for Play"}</b>
            <i aria-hidden="true" />
          </div>
          {analyticsStarted && <div className="dh-construction-status">
            <span>{adResetWindow ? "Ad Reset / Rebuilding" : "Constructing Live Analytics"}</span>
            <b>{liveMeaning.label}</b>
            <strong>{Math.round(observatoryConstructionProgress)}%</strong>
          </div>}
          {analyticsStarted && <div className={`dh-top-design-renderer mode-${matrixConstruction.mode} visual-${matrixConstruction.visualFamily}`} aria-label="DigitalHut top design renderer constructing live">
            <svg className="dh-top-design-draft" viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true">
              {visibleArtistDraftPaths.slice(0, 6).map((path, index) => <path key={`top-draft-${path.id}`} className={`kind-${path.kind}`} d={projectDraftPath(path.d, 24)} pathLength="1" style={{"--draft-order": index}} />)}
            </svg>
            <div className="dh-top-design-pieces" aria-hidden="true">
              {visualBuildCells.slice(0, 5).map((cell) => <span key={`top-design-${cell.id}`} className={`${cell.state} type-${cell.type}`} style={{"--design-fill": `${cell.fill}%`, "--design-order": cell.order}}>
                <i />
                <em />
              </span>)}
            </div>
            <div className="dh-readable-stat-row" aria-label="Readable story statistics">
              {visibleStoryStats.slice(0, 3).map((stat, index) => <span key={`top-stat-${stat.id}`} className={`tone-${stat.tone}`} style={{"--stat-fill": `${stat.fill}%`, "--stat-order": index}}>
                <code>{stat.code}</code>
                <b>{stat.value}</b>
                <small>{stat.label}</small>
              </span>)}
            </div>
          </div>}
          <a className={`dh-source-preview-card dh-build-module ${sourcePreviewLive ? "live" : "queued"}`} href={sourcePreview?.url || youtubeStory.searchUrl} target="_blank" rel="noreferrer" aria-label="Occasional website source preview">
            <span>Website Source Preview</span>
            <b>{sourcePreview?.title || youtubeStory.searchPhrase}</b>
            <small>{sourcePreviewHost} / {sourcePreview?.signal || "live reference"}</small>
            <i aria-hidden="true"><em /><em /><em /></i>
          </a>
          <section className={`dh-current-market-feed dh-build-module ${currentMarketActive ? "market-view" : "regular-pulse"} ${analyticsStarted ? "is-constructing" : "is-waiting"}`} aria-label="DigitalHut Current Market feed">
            <header>
              <div>
                <span>{currentMarketActive ? "Current Market View" : "Market Pulse"}</span>
                <b>{activeCurrentMarketStock.symbol} {activeCurrentMarketStock.company}</b>
                <small>{currentMarketActive ? "stock data / video / podcast / GLB" : "quick 3 option pressure lanes"}</small>
              </div>
              {currentMarketActive ? <form onSubmit={(event) => {event.preventDefault(); runCurrentMarket(currentMarketInput, "market-view-ticker-form")}}>
                <input value={currentMarketInput} onChange={(event) => setCurrentMarketInput(event.target.value.toUpperCase())} placeholder="Ticker or company" />
                <button type="submit">Market</button>
              </form> : <button className="dh-market-mini-open" type="button" onClick={() => runCurrentMarket(activeCurrentMarketStock.symbol, "regular-feed-market-mini-open")}>Open Market</button>}
            </header>
            {currentMarketActive && <div className="dh-current-market-top10" aria-label="Top 10 current market stocks">
              {currentMarketStocks.map((item) => <button key={item.symbol} type="button" className={item.symbol === activeCurrentMarketStock.symbol ? "active" : ""} onClick={() => runCurrentMarket(item.symbol, "market-top10-stock-button")}>
                <b>{item.symbol}</b>
                <span>{item.company}</span>
              </button>)}
            </div>}
            <div className={`dh-market-option-pulse ${currentMarketActive ? "full" : "compact"}`} aria-label="Top 3 stock option pressure reads">
              {quickMarketOptionPicks.map((item, index) => <button key={item.id} type="button" className={`${item.direction} ${item.live ? "live" : "queued"}`} style={{"--option-order": index}} onClick={() => openMarketQuickPick(item)}>
                <span>{item.direction}</span>
                <b>{item.symbol}</b>
                <small>{item.contract}</small>
                <em>{item.value}</em>
              </button>)}
            </div>
            {currentMarketActive && <div className="dh-market-view-body">
              {sceneFeed.market?.chartUrl && <iframe className="dh-market-chart-frame" title={`${activeCurrentMarketStock.symbol} TradingView chart`} src={sceneFeed.market.chartUrl} loading="lazy" />}
              <div className="dh-market-transcript-build" aria-label="Constructing market data transcript">
                {visibleCurrentMarketHighlights.map((item, index) => <article key={item.id} className={`tone-${item.tone}`} style={{"--highlight-fill": `${item.fill}%`, "--highlight-order": index, "--highlight-pulse": `${item.pulse}%`}}>
                  <span>{item.label}</span>
                  <b>{item.value}</b>
                  <small>{item.detail}</small>
                  <i aria-hidden="true" />
                </article>)}
              </div>
            </div>}
          </section>
          <div className="dh-youtube-story-grid">
            {analyticsStarted && <div className={`dh-stage-reaction-tree phase-${treeRebuildPhase % 2} ${treeResetActive ? "is-rebuilding" : ""}`} style={{"--tree-build": `${treeBuildProgress}%`, "--tree-phase": treeRebuildPhase, "--tree-root-x": `${stageTreeRoot.x}%`, "--tree-root-y": `${stageTreeRoot.y}%`}} aria-label="Complete DigitalHut connected media system tree">
              <svg className="dh-stage-tree-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <path className="dh-stage-trunk" d={stageTreeTrunkPath} pathLength="1" />
                {visibleStageTreeNodes.map((node, index) => {
                  const routePath = stageBranchPath(node)
                  return <g key={`stage-branch-${node.id}`} className={`dh-stage-route tone-${node.tone}`} style={{"--branch-order": index, "--branch-fill": `${node.fill}%`}}>
                    <path d={routePath} pathLength="1" />
                    <circle className="dh-stage-tree-packet" r=".78">
                      <animateMotion dur={`${Math.max(4.4, 8.6 / sceneMotionTempo).toFixed(2)}s`} repeatCount="indefinite" path={routePath} />
                    </circle>
                  </g>
                })}
                {visibleTreeSourceLinks.map((link, index) => {
                  const routePath = stageSourceBranchPath(index)
                  return <g key={`stage-source-branch-${link.url}-${index}`} className="dh-stage-route tone-source source-link" style={{"--branch-order": index + visibleStageTreeNodes.length}}>
                    <path d={routePath} pathLength="1" />
                    <circle className="dh-stage-tree-packet" r=".74">
                      <animateMotion dur={`${Math.max(4.8, 9.2 / sceneMotionTempo).toFixed(2)}s`} repeatCount="indefinite" path={routePath} />
                    </circle>
                  </g>
                })}
              </svg>
              <div className="dh-stage-tree-core" style={{"--core-fill": `${analysisConfidence}%`}}>
                <code>DigitalHut.system()</code>
                <b>{treeResetActive ? "rebuilding" : liveMeaning.label}</b>
                <span>{treeBuildProgress}% branch load</span>
              </div>
              {visibleStageTreeNodes.map((node, index) => <article key={`stage-node-${node.id}`} className={`dh-stage-tree-node node-${node.id} tone-${node.tone}`} style={{"--node-x": `${node.x}%`, "--node-y": `${node.y}%`, "--node-fill": `${node.fill}%`, "--node-order": index}}>
                <code>{node.code}</code>
                <b>{node.value}</b>
                <span>{node.label}</span>
                <small>{node.route}</small>
                <i aria-hidden="true" />
              </article>)}
              <div className="dh-stage-tree-source-links">
                {visibleTreeSourceLinks.map((link, index) => <a key={`tree-link-${link.url}-${index}`} href={link.url} target="_blank" rel="noreferrer" style={{"--source-order": index}}>
                  <code>source.link</code>
                  <b>{link.title}</b>
                  <span>{link.signal}</span>
                </a>)}
              </div>
            </div>}
            <div className={`dh-youtube-stage ${youtubeSignalField.mode}`}>
              {youtubeSignalField.packets.map((packet) => <span key={packet.id} className={`dh-video-signal signal-${packet.side}`} style={{"--heat": `${packet.heat}%`, "--signal-x": `${packet.shift}px`, "--signal-y": `${packet.drift}px`, "--signal-delay": packet.delay}}>
                <b>{packet.label}</b>
                <small>{packet.value}</small>
              </span>)}
              <div className={`dh-video-system-shell mode-${matrixConstruction.mode} visual-${matrixConstruction.visualFamily} ${analyticsStarted ? "is-building" : "is-waiting"}`} aria-label="DigitalHut analytics system surrounding the video renderer">
                <div className={`dh-video-creative-layer visual-${matrixConstruction.visualFamily}`} aria-hidden="true">
                  {analyticsCells.slice(0, 10).map((cell) => <span key={`creative-${cell.id}`} className={`${cell.state} type-${cell.type}`} style={{"--creative-fill": `${cell.fill}%`, "--creative-order": cell.order}}>
                    <em />
                    <i />
                  </span>)}
                </div>
                <div className="dh-video-side-screen rail-top" aria-label="Top content analyzer above YouTube video">
                  <div className="dh-video-top-content-reader">
                    <span>DigitalHut Content Analyzer</span>
                    <b>{usefulVideoRead.title}</b>
                    <small>{usefulVideoRead.channel} / {usefulVideoRead.metricLine} / {usefulVideoRead.engagementLine}</small>
                    <em>{usefulVideoRead.entities.slice(0, 5).join(" / ") || usefulVideoRead.focus}</em>
                  </div>
                  <svg className="dh-side-screen-draft" viewBox="0 0 100 22" preserveAspectRatio="none">
                    {visibleArtistDraftPaths.slice(0, 5).map((path, index) => <path key={`side-screen-${path.id}`} className={`kind-${path.kind}`} d={projectDraftPath(path.d, 22)} pathLength="1" style={{"--draft-order": index}} />)}
                  </svg>
                  {visualBuildCells.slice(0, 4).map((cell) => <span key={`side-design-${cell.id}`} className={`${cell.state} type-${cell.type}`} style={{"--design-fill": `${cell.fill}%`, "--design-order": cell.order}}>
                    <i />
                    <em />
                  </span>)}
                  <div className="dh-side-stat-readout" aria-hidden="true">
                    {visibleStoryStats.slice(0, 2).map((stat, index) => <b key={`side-stat-${stat.id}`} className={`tone-${stat.tone}`} style={{"--stat-fill": `${stat.fill}%`, "--stat-order": index}}>
                      <code>{stat.code}</code>
                      <span>{stat.value}</span>
                    </b>)}
                  </div>
                </div>
                <div className="dh-video-rail rail-left" aria-hidden="true">
                  {analyticsCells.slice(0, 5).map((cell) => <i key={`left-${cell.id}`} className={cell.state} style={{"--rail-fill": `${cell.fill}%`, "--rail-order": cell.order}} />)}
                </div>
                {analyticsStarted && <div className="dh-video-upper-bubble-system" aria-hidden="true">
                  <svg viewBox="0 0 100 44" preserveAspectRatio="none">
                    {upperVideoBubbleRoutes.map((route, index) => <path key={`video-upper-route-${route.id}`} className={`tone-${route.tone}`} d={route.d} pathLength="1" style={{"--route-order": index}} />)}
                  </svg>
                  <strong className="dh-video-upper-core">Content Radar</strong>
                  {upperVideoBubbleNodes.map((node, index) => <span key={`video-upper-node-${node.id}`} className={`tone-${node.tone}`} style={{"--upper-x": `${node.upperX}%`, "--upper-y": `${node.upperY}%`, "--upper-order": index}}>
                    <b>{node.label}</b>
                    <small>{node.value}</small>
                  </span>)}
                </div>}
                <div className="dh-youtube-frame" aria-label="Locked YouTube renderer controlled by DigitalHut system controls">
                  <iframe key={`${youtubeStory.searchPhrase}-${youtubeStory.selectedVideoIndex || 0}-${youtubeSeekAnchor}-${youtubeShouldPlay ? "play" : "pause"}`} title={`YouTube search renderer for ${youtubeStory.topic}`} src={youtubePlayerUrl} loading="lazy" tabIndex="-1" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                  <div className="dh-video-click-lock" aria-hidden="true"><span>DigitalHut controls only</span></div>
                </div>
                <div className="dh-video-research-readout" aria-label="Current useful video content read">
                  <span>{usefulVideoRead.productLine}</span>
                  <b>{usefulVideoRead.currentRead}</b>
                  <small>{usefulVideoRead.sourceBasis}</small>
                </div>
                <div className="dh-video-rail rail-right" aria-hidden="true">
                  {analyticsCells.slice(5, 10).map((cell) => <i key={`right-${cell.id}`} className={cell.state} style={{"--rail-fill": `${cell.fill}%`, "--rail-order": cell.order}} />)}
                </div>
                <div className="dh-video-rail rail-bottom" aria-hidden="true">
                  {analyticsCells.slice(6, 12).map((cell) => <i key={`bottom-${cell.id}`} className={cell.state} style={{"--rail-fill": `${cell.fill}%`, "--rail-order": cell.order}} />)}
                </div>
                </div>
              {analyticsStarted && <div className="dh-upper-construction-layer" aria-hidden="true">
                {upperConstructionPieces.map((piece, index) => <span key={piece.id} className={`tone-${piece.tone} shape-${piece.shape}`} style={{"--piece-x": `${piece.x}%`, "--piece-y": `${piece.y}%`, "--piece-order": index}}>
                  <i />
                  <em />
                  <strong />
                  <b>{piece.label}</b>
                </span>)}
              </div>}
              {analyticsStarted && <div className="dh-cross-analytic-fliers" aria-hidden="true">
                {crossAnalyticFlights.map((flight, index) => <span key={`flight-${flight.id}`} className={`tone-${flight.tone} shape-${flight.shape}`} style={{"--flight-y": `${flight.y}%`, "--flight-span": `${flight.span}%`, "--flight-order": index}}>
                  <i />
                  <em />
                  <strong />
                  <b>{flight.marker}</b>
                </span>)}
              </div>}
              <section className="dh-self-creating-objects-zone" style={{"--metric-beat": metricBuildBeat}} aria-label="Self creating 3D objects analytics">
                <BabylonAnalyticsEngine mode="objects" nodes={selfCreatingObjectCards} progress={observatoryConstructionProgress} active={analyticsStarted} title="Babylon self creating 3D object analytics" />
                <header>
                  <span>Self Creating 3D Objects</span>
                  <b>{streamAnalytics.renderState}</b>
                  <small>{backlinkRadar.links.length} refs / {Math.round(58 + statResolveRatio * 36)}% object lock</small>
                  <div className="dh-object-system-reader">
                    <code>3D Object Reader</code>
                    <strong>{usefulVideoRead.threeDPrompt}</strong>
                    <small>{usefulVideoRead.developerView}</small>
                  </div>
                </header>
                <div className="dh-object-construction-field" aria-hidden="true">
                  {selfCreatingObjectCards.map((item, index) => <span key={`object-field-${observatoryBuildCycle}-${item.id}`} className={`object-${index}`} style={{"--object-fill": `${item.fill}%`, "--object-order": index}}>
                    <i />
                    <em />
                  </span>)}
                </div>
                <div className="dh-object-card-stack">
                  {selfCreatingObjectCards.map((item, index) => <article key={`object-card-${observatoryBuildCycle}-${item.id}`} className={index === 0 ? "active" : ""} style={{"--object-fill": `${item.fill}%`, "--object-order": index}}>
                    <MiniVisual feed={item.feed} active={index === 0} />
                    <div>
                      <span>{item.label}</span>
                      <b>{item.title}</b>
                      <small>{item.status} / {item.fill}%</small>
                      <small>{item.sourceTitle}</small>
                      <p className="dh-object-reader-line">{item.reader}</p>
                      <small>{item.videoFact}</small>
                    </div>
                    <a className="dh-object-backlink" href={item.url} target="_blank" rel="noreferrer">asset backlink</a>
                    <button className="dh-object-open-panel" type="button" onClick={() => openAutoProducedGlbReplica(item)}>open replica panel</button>
                    <i aria-hidden="true" />
                  </article>)}
                </div>
              </section>
              <section className="dh-prefilled-bubble-map-zone" style={{"--metric-beat": metricBuildBeat}} aria-label="Bubble map analytics with episode, views, backlinks, source links, sponsor stack, and podcast switch">
                <BabylonAnalyticsEngine mode="map" nodes={fixedBubbleMapNodes} progress={observatoryConstructionProgress} active={analyticsStarted} title="Babylon branching backlink bubble map" />
                <svg className="dh-prefilled-bubble-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  {fixedBubbleMapNodes.map((node, index) => <path key={`bubble-line-${observatoryBuildCycle}-${node.id}`} className={`tone-${node.tone}`} d={`M50 52 C${50 + (node.x - 50) * .18} ${52 + (node.y - 52) * .12} ${node.x - (node.x - 50) * .2} ${node.y - (node.y - 52) * .16} ${node.x} ${node.y}`} pathLength="1" style={{"--bubble-order": index, "--bubble-fill": `${node.fill}%`}} />)}
                </svg>
                <div className="dh-bubble-map-core" style={{"--bubble-core": `${analysisConfidence}%`}}>
                  <code>Mapping Feed</code>
                  <b>Featured Sponsor Stack</b>
                  <span>{analysisConfidence}% / {liveMeaning.label}</span>
                </div>
                <div className="dh-content-radar-readout is-useful" aria-label="Useful YouTube content radar">
                  <span>{usefulVideoRead.phase} Read / Video {selectedVideoSlot}</span>
                  <b>{usefulVideoRead.focus}</b>
                  <small>{usefulVideoRead.currentRead}</small>
                  <em>{usefulVideoRead.researchUse}</em>
                  <strong>{usefulVideoRead.nextQuestion}</strong>
                  <div className="dh-content-proof-grid" aria-label="Content proof lanes">
                    <article>
                      <code>confirmed</code>
                      {usefulVideoRead.confirmed.slice(0, 3).map((item) => <span key={`confirmed-${item}`}>{item}</span>)}
                    </article>
                    <article>
                      <code>inferred</code>
                      {usefulVideoRead.inferred.slice(0, 3).map((item) => <span key={`inferred-${item}`}>{item}</span>)}
                    </article>
                    <article>
                      <code>{usefulVideoRead.confidenceLabel}</code>
                      <span>{usefulVideoRead.spokenSourceLine}</span>
                      <span>{usefulVideoRead.structuredStatus}</span>
                    </article>
                  </div>
                  <a className="dh-content-source-chip" href={usefulVideoRead.backlinkUrl} target="_blank" rel="noreferrer" onClick={() => trackObservatoryPixel("backlink_source_open", {category, keywordHint: usefulVideoRead.backlinkTitle || backlinkRadar.focus, metadata: {source: "content-radar-readout", url: usefulVideoRead.backlinkUrl, signal: usefulVideoRead.backlinkSignal}})}>
                    <code>backlink</code>
                    <b>{usefulVideoRead.backlinkTitle}</b>
                    <span>{usefulVideoRead.backlinkSignal}</span>
                  </a>
                  <div className="dh-content-proof-bridge" aria-label="DigitalHut proof and source conversion bridge">
                    {proofSourceBridgeLinks.map((item) => <a key={`content-proof-${item.id}`} href={item.url} onClick={() => trackObservatoryPixel(item.eventName, masterListBridgePixel("content-radar-proof-bridge", {category, keywordHint: item.keywordHint, metadata: {route: item.url, bridgeId: item.id, proofRoute: activeWatchProofRoute}}))}>
                      <code>{item.label}</code>
                      <b>{item.value}</b>
                    </a>)}
                  </div>
                </div>
                {fixedBubbleMapNodes.map((node, index) => node.url
                  ? <a key={`bubble-node-${observatoryBuildCycle}-${node.id}`} className={`dh-bubble-map-node node-${node.id} tone-${node.tone}`} href={node.url} target="_blank" rel="noreferrer" style={{"--bubble-x": `${node.x}%`, "--bubble-y": `${node.y}%`, "--bubble-order": index, "--bubble-fill": `${Math.round(node.fill)}%`}}>
                    <span>{node.label}</span>
                    <b>{node.value}</b>
                    <small>{node.detail}</small>
                    <i aria-hidden="true" />
                  </a>
                  : <article key={`bubble-node-${observatoryBuildCycle}-${node.id}`} className={`dh-bubble-map-node node-${node.id} tone-${node.tone}`} style={{"--bubble-x": `${node.x}%`, "--bubble-y": `${node.y}%`, "--bubble-order": index, "--bubble-fill": `${Math.round(node.fill)}%`}}>
                    <span>{node.label}</span>
                    <b>{node.value}</b>
                    <small>{node.detail}</small>
                    <i aria-hidden="true" />
                  </article>
                )}
              </section>
              <section className="dh-timeline-creation-zone" style={{"--metric-beat": metricBuildBeat}} aria-label="Timeline analytics creation separate from the video slider">
                <BabylonAnalyticsEngine mode="timeline" nodes={fixedTimelineFinds} progress={observatoryConstructionProgress} active={analyticsStarted} title="Babylon timeline backlink analytics" />
                <header>
                  <span>Timeline Analytics Creation</span>
                  <b>{youtubeSeekSeconds}s / {liveMeaning.label}</b>
                  <small>separate from video slider</small>
                </header>
                <div className="dh-timeline-find-track">
                  {fixedTimelineFinds.map((item, index) => item.url
                    ? <a key={`timeline-fixed-${item.id}`} className={`tone-${item.tone}`} href={item.url} target="_blank" rel="noreferrer" style={{"--find-order": index, "--find-fill": `${Math.round(item.fill)}%`}}>
                      <code>{item.marker}</code>
                      <span>{item.label}</span>
                      <b>{item.value}</b>
                      <small>{item.detail}</small>
                      <i aria-hidden="true" />
                    </a>
                    : <article key={`timeline-fixed-${item.id}`} className={`tone-${item.tone}`} style={{"--find-order": index, "--find-fill": `${Math.round(item.fill)}%`}}>
                      <code>{item.marker}</code>
                      <span>{item.label}</span>
                      <b>{item.value}</b>
                      <small>{item.detail}</small>
                      <i aria-hidden="true" />
                    </article>
                  )}
                </div>
              </section>
              <svg key={`authority-veins-${observatoryBuildCycle}`} className={`dh-authority-vein-network ${analyticsStarted ? "is-building" : "is-waiting"}`} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                {[
                  {id: "bubble", d: "M88 46 C82 34 76 29 70 30"},
                  {id: "objects", d: "M88 46 C68 21 33 18 12 26"},
                  {id: "timeline", d: "M88 46 C75 70 56 84 38 87"},
                  {id: "engine", d: "M88 46 C76 49 60 47 47 44"}
                ].map((route, index) => <g key={`authority-route-${route.id}`} className={`route-${route.id}`} style={{"--route-order": index}}>
                  <path d={route.d} pathLength="1" />
                  <circle r="1.05" className="dh-authority-packet">
                    <animateMotion dur={`${Math.max(2.4, 5.4 / sceneMotionTempo + index * .22).toFixed(2)}s`} repeatCount="indefinite" path={route.d} />
                  </circle>
                </g>)}
              </svg>
              <section key={`sponsor-authority-${observatoryBuildCycle}`} className={`dh-sponsored-authority-stack ${adResetWindow || liveMeaning.id === "sponsored" ? "is-hot" : ""}`} aria-label="Sponsored stack feeding the analytics engine">
                <header>
                  <span>Sponsored Stack</span>
                  <b>{adResetWindow || liveMeaning.id === "sponsored" ? "Live authority feed" : "Authority feed armed"}</b>
                  <small>{youtubeStory.adTracker}</small>
                </header>
                <div className="dh-sponsor-logo-shift" aria-label="Vercel Supabase Codex FireCuda GitHub feed">
                  {sponsorAuthorityPartners.map((partner, index) => <span key={partner.id} className={`partner-${partner.id}`} style={{"--partner-order": index}}>
                    <i>{partner.mark}</i>
                    <b>{partner.label}</b>
                    <small>{partner.detail}</small>
                  </span>)}
                </div>
                <div className="dh-sponsor-engine-bars">
                  {[
                    {id: "deploy", label: "deploy pulse", value: sourcePreviewLive ? 96 : 74},
                    {id: "data", label: "data sync", value: analysisConfidence},
                    {id: "revenue", label: "revenue stack", value: adResetWindow || liveMeaning.id === "sponsored" ? 98 : Math.max(42, Math.round(statResolveRatio * 86))}
                  ].map((item, index) => <span key={`sponsor-engine-${item.id}`} style={{"--engine-fill": `${item.value}%`, "--engine-order": index}}>
                    <b>{item.label}</b>
                    <i aria-hidden="true" />
                  </span>)}
                </div>
              </section>
              <section key={`podcast-renderer-${observatoryBuildCycle}`} className={`dh-podcast-renderer-zone ${podcastMomentActive ? "is-live" : ""}`} aria-label="Podcast renderer">
                <span className="dh-podcast-speaker-visual"><i /><em /><strong /></span>
                <div>
                  <span>Podcast Renderer</span>
                  <b>{podcastMomentActive ? "speaker pulse live" : "moment armed"}</b>
                  <small>{liveMeaning.podcastCue} / {sourcePreviewHost}</small>
                </div>
              </section>
              {analyticsStarted && <div className={`dh-command-intel-map mode-${matrixConstruction.mode} ${podcastMomentActive ? "podcast-live" : ""} ${adResetWindow ? "sponsor-live" : ""}`} style={{"--intel-progress": `${Math.round(observatoryConstructionProgress)}%`, "--stream-pace": streamAnalytics.pace}} aria-label="DigitalHut connected analytics command map">
                <svg className="dh-command-route-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  <path id="dh-command-route-episode" d="M14 18 C30 8 43 19 50 39 C58 62 76 66 88 83" pathLength="1" />
                  <path id="dh-command-route-source" d="M17 70 C32 57 38 50 50 48 C62 45 70 31 87 20" pathLength="1" />
                  <path id="dh-command-route-stack" d="M27 86 C40 74 50 68 56 55 C62 41 68 38 78 35" pathLength="1" />
                  <path id="dh-command-route-podcast" d="M12 43 C28 50 39 55 50 51 C66 44 73 59 87 73" pathLength="1" />
                  <circle r="1.4" className="packet packet-a"><animateMotion dur={`${Math.max(3.6, 7.2 / sceneMotionTempo).toFixed(2)}s`} repeatCount="indefinite" path="M14 18 C30 8 43 19 50 39 C58 62 76 66 88 83" /></circle>
                  <circle r="1.1" className="packet packet-b"><animateMotion dur={`${Math.max(4.1, 8.4 / sceneMotionTempo).toFixed(2)}s`} repeatCount="indefinite" path="M17 70 C32 57 38 50 50 48 C62 45 70 31 87 20" /></circle>
                  <circle r="1.2" className="packet packet-c"><animateMotion dur={`${Math.max(4.4, 8.8 / sceneMotionTempo).toFixed(2)}s`} repeatCount="indefinite" path="M12 43 C28 50 39 55 50 51 C66 44 73 59 87 73" /></circle>
                </svg>
                <div className="dh-command-hub dh-sponsor-stack-controller" style={{"--hub-fill": `${analysisConfidence}%`}}>
                  <header>
                    <code>Sponsored Stack</code>
                    <b>{adResetWindow || liveMeaning.id === "sponsored" ? "controlling live reset" : "controlling ai view"}</b>
                    <span>{analysisConfidence}% lock / {liveMeaning.label}</span>
                  </header>
                  <div className="dh-sponsor-feed-stack" aria-label="Sponsored stack controlling the three analytics feeds">
                    {[
                      {id: "video", label: "Video Analytics", value: streamAnalytics.videoState, metric: `${streamAnalytics.metrics.views.toLocaleString()} views`, fill: Math.max(34, Math.min(100, Math.round(46 + streamAnalytics.pace * 22)))},
                      {id: "glb", label: "GLB Analytics", value: streamAnalytics.renderState, metric: youtubeGlbDock?.[0]?.feed?.title || liveMeaning.glbCue, fill: Math.round(58 + statResolveRatio * 36)},
                      {id: "podcast", label: "Podcast / Source", value: podcastMomentActive ? "speaker pulse live" : streamAnalytics.podcastState, metric: `${backlinkRadar.links.length} backlinks / ${sourcePreviewHost}`, fill: podcastMomentActive ? 98 : Math.max(36, Math.round(statResolveRatio * 82))}
                    ].map((lane, index) => <span key={`sponsor-feed-${lane.id}`} className={`feed-${lane.id}`} style={{"--feed-fill": `${lane.fill}%`, "--feed-order": index}}>
                      <b>{lane.label}</b>
                      <small>{lane.value}</small>
                      <em>{lane.metric}</em>
                      <i aria-hidden="true" />
                    </span>)}
                  </div>
                </div>
                {visibleSponsorVeinNodes.length > 0 && <div className="dh-featured-sponsor-vein" aria-label="Featured sponsor stack vein feeding bubble map, 3D objects, source links, podcast, and time">
                  <svg className="dh-sponsor-vein-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                    {visibleSponsorVeinNodes.map((node, index) => {
                      const path = sponsorVeinPath(node)
                      return <g key={`sponsor-vein-${node.id}`} className={`route-${node.id} tone-${node.tone}`} style={{"--vein-order": index, "--vein-fill": `${node.fill}%`}}>
                        <path d={path} pathLength="1" />
                        <circle r="1.12" className="dh-vein-packet">
                          <animateMotion dur={`${Math.max(3.2, 6.8 / sceneMotionTempo + index * .32).toFixed(2)}s`} repeatCount="indefinite" path={path} />
                        </circle>
                      </g>
                    })}
                  </svg>
                  {visibleSponsorVeinNodes.map((node, index) => node.url
                    ? <a key={`sponsor-node-${node.id}`} className={`dh-sponsor-vein-node node-${node.id} tone-${node.tone}`} href={node.url} target="_blank" rel="noreferrer" style={{"--vein-x": `${node.x}%`, "--vein-y": `${node.y}%`, "--vein-order": index, "--vein-fill": `${Math.round(node.fill)}%`}}>
                      <span>{node.label}</span>
                      <b>{node.value}</b>
                      <small>{node.detail}</small>
                      <i aria-hidden="true" />
                    </a>
                    : <article key={`sponsor-node-${node.id}`} className={`dh-sponsor-vein-node node-${node.id} tone-${node.tone}`} style={{"--vein-x": `${node.x}%`, "--vein-y": `${node.y}%`, "--vein-order": index, "--vein-fill": `${Math.round(node.fill)}%`}}>
                      <span>{node.label}</span>
                      <b>{node.value}</b>
                      <small>{node.detail}</small>
                      <i aria-hidden="true" />
                    </article>
                  )}
                  {visibleKeyFindTimeline.length > 0 && <div className="dh-key-find-timeline" aria-label="Timeline analytics key finds separate from video slider">
                    {visibleKeyFindTimeline.map((item, index) => item.url
                      ? <a key={`key-find-${item.id}`} className={`tone-${item.tone}`} href={item.url} target="_blank" rel="noreferrer" style={{"--find-order": index, "--find-fill": `${Math.round(item.fill)}%`}}>
                        <code>{item.marker}</code>
                        <span>{item.label}</span>
                        <b>{item.value}</b>
                        <small>{item.detail}</small>
                        <i aria-hidden="true" />
                      </a>
                      : <article key={`key-find-${item.id}`} className={`tone-${item.tone}`} style={{"--find-order": index, "--find-fill": `${Math.round(item.fill)}%`}}>
                        <code>{item.marker}</code>
                        <span>{item.label}</span>
                        <b>{item.value}</b>
                        <small>{item.detail}</small>
                        <i aria-hidden="true" />
                      </article>
                    )}
                  </div>}
                </div>}
                {visibleCommandCards.map((card, index) => card.url
                  ? <a key={card.id} className={`dh-command-card node-${card.id} tone-${card.tone}`} href={card.url} target="_blank" rel="noreferrer" style={{"--card-order": index, "--card-fill": `${Math.round(card.fill)}%`}}>
                    <span>{card.label}</span>
                    <b>{card.value}</b>
                    <small>{card.detail}</small>
                    <i aria-hidden="true" />
                  </a>
                  : <article key={card.id} className={`dh-command-card node-${card.id} tone-${card.tone}`} style={{"--card-order": index, "--card-fill": `${Math.round(card.fill)}%`}}>
                    <span>{card.label}</span>
                    <b>{card.value}</b>
                    <small>{card.detail}</small>
                    <i aria-hidden="true" />
                  </article>
                )}
                {visibleCommandLinks.length > 0 && <div className="dh-command-link-stack" aria-label="Live website and backlink links">
                  {visibleCommandLinks.map((link, index) => <a key={`command-link-${link.id}-${index}`} href={link.url} target="_blank" rel="noreferrer" style={{"--link-order": index}}>
                    <span>{link.label}</span>
                    <b>{link.title}</b>
                    <small>{link.signal}</small>
                  </a>)}
                </div>}
              </div>}
              <div className={`dh-observatory-visual-lab dh-build-module ${analyticsGate.episode} visual-${matrixConstruction.visualFamily}`} style={{"--visual-build": `${Math.round(observatoryConstructionProgress)}%`}} aria-label="Live constructed Observatory visual lab">
                <svg className="dh-artist-drafting-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  {visibleArtistDraftPaths.map((path, index) => <path key={`draft-${path.id}`} className={`kind-${path.kind}`} d={path.d} pathLength="1" style={{"--draft-order": index}} />)}
                  {visualBuildCells.slice(0, 6).map((cell, index) => <g key={`draft-plate-${cell.id}`} className={`dh-draft-plate ${cell.state}`} transform={`translate(${13 + ((index * 15 + sceneShiftIndex * 3) % 70)} ${18 + ((index * 19 + sceneShiftIndex * 5) % 58)})`} style={{"--draft-order": index, "--plate-fill": `${cell.fill}%`}}>
                    <polygon points="0,9 15,0 30,8 15,17" />
                    <polyline points="4,9 15,4 26,9 15,14 4,9" />
                    <circle cx="15" cy="9" r="2.2" />
                  </g>)}
                </svg>
                <div className="dh-reactive-system-map dh-structured-intel-map" style={{"--read-x": `${structuredActiveNode?.x || 50}%`, "--read-y": `${structuredActiveNode?.y || 50}%`, "--read-step": structuredReadIndex}} aria-label="DigitalHut media reaction map">
                  <svg className="dh-reactive-branch-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                    {visibleStructuredLayers.map((layer, index) => <rect key={`intel-layer-${layer.id}`} className={`dh-intel-map-field field-${layer.id} ${index <= structuredReadIndex ? "is-read" : ""}`} x={12 + index * 7} y={10 + index * 8} width={76 - index * 10} height={72 - index * 8} rx="6" pathLength="1" style={{"--field-order": index}} />)}
                    <circle className="dh-map-layer layer-one" cx="50" cy="50" r="14" pathLength="1" />
                    <circle className="dh-map-layer layer-two" cx="50" cy="50" r="25" pathLength="1" />
                    <circle className="dh-map-layer layer-three" cx="50" cy="50" r="36" pathLength="1" />
                    {visibleStructuredLoops.map((loop, index) => <ellipse key={`intel-loop-${loop.id}`} className={`dh-intel-map-loop ${index === structuredReadIndex % Math.max(1, visibleStructuredLoops.length) ? "is-reading" : ""}`} cx="50" cy="50" rx={24 + index * 7} ry={12 + index * 5} pathLength="1" style={{"--loop-order": index}} />)}
                    {visibleStructuredNodes.map((node, index) => <path key={`intel-route-${node.id}`} className={`dh-intel-map-route tone-${node.tone} ${index === structuredReadIndex ? "is-reading" : index < structuredReadIndex ? "was-read" : "is-waiting"}`} d={`M50 50 C${50 + (node.x - 50) * .18} ${50 + (node.y - 50) * .1} ${node.x - (node.x - 50) * .18} ${node.y - (node.y - 50) * .1} ${node.x} ${node.y}`} pathLength="1" style={{"--branch-order": index, "--branch-fill": `${node.fill}%`}} />)}
                  </svg>
                  <div className="dh-reactive-map-core" style={{"--core-fill": `${analysisConfidence}%`}}>
                    <code>DigitalHut.produceRead()</code>
                    <b>{structuredIntelMap.headline}</b>
                    <span>{structuredIntelMap.status}</span>
                    <small>{structuredSystemRead}</small>
                  </div>
                  <span className="dh-intel-read-head" aria-hidden="true" />
                  <div className="dh-intel-entity-ribbon" aria-label="Detected entities and lanes">
                    {visibleEntityTags.map((entity, index) => <span key={`entity-${entity.id}`} style={{"--entity-order": index}}>
                      <b>{entity.label}</b>
                      <i>{entity.value}</i>
                    </span>)}
                  </div>
                  {visibleStructuredNodes.map((node, index) => <article key={`structured-node-${node.id}`} className={`dh-structured-map-node tone-${node.tone} ${index === structuredReadIndex ? "is-reading" : index < structuredReadIndex ? "was-read" : "is-waiting"}`} style={{"--node-x": `${node.x}%`, "--node-y": `${node.y}%`, "--node-fill": `${node.fill}%`, "--node-order": index}}>
                    <code>{node.code}</code>
                    <b>{node.value}</b>
                    <span>{node.label}</span>
                    <small>{node.detail}</small>
                    <i aria-hidden="true" />
                  </article>)}
                  <div className="dh-intel-evidence-table" aria-label="Source evidence table">
                    <header>
                      <b>Source Evidence</b>
                      <span>confirmed vs inferred</span>
                    </header>
                    {visibleEvidenceRows.map((row, index) => <article key={`evidence-${row.id}`} style={{"--row-order": index}}>
                      <code>{row.label}</code>
                      <b>{row.value}</b>
                      <span>{row.note}</span>
                    </article>)}
                  </div>
                  <div className="dh-intel-comparison-matrix" aria-label="Analysis comparison matrix">
                    <header>
                      <b>Analysis Matrix</b>
                      <span>{structuredIntelMap.headline}</span>
                    </header>
                    {visibleComparisonRows.map((row, index) => <article key={`compare-${row.id}`} style={{"--row-order": index}}>
                      <code>{row.left}</code>
                      <b>{row.center}</b>
                      <span>{row.right}</span>
                    </article>)}
                  </div>
                  <div className="dh-structured-map-bars" aria-label="Readable map statistics">
                    {visibleStructuredBars.map((bar, index) => <span key={`structured-bar-${bar.id}`} style={{"--bar-fill": `${bar.value}%`, "--bar-order": index}}>
                      <b>{bar.label}</b>
                      <i>{bar.value}%</i>
                      <em />
                    </span>)}
                  </div>
                  <div className="dh-structured-map-loops" aria-label="Current video explanation loops">
                    {visibleStructuredLoops.map((loop, index) => <small key={`structured-loop-${loop.id}`} className={index === structuredReadIndex % Math.max(1, visibleStructuredLoops.length) ? "is-reading" : ""} style={{"--loop-order": index}}>
                      <b>{loop.label}</b>
                      <span>{loop.value}</span>
                    </small>)}
                  </div>
                </div>
                <div className="dh-visual-stat-stack" aria-label="Intelligent story statistics">
                  {visibleStoryStats.slice(0, 5).map((stat, index) => <article key={`visual-stat-${stat.id}`} className={`tone-${stat.tone}`} style={{"--stat-fill": `${stat.fill}%`, "--stat-order": index}}>
                    <header>
                      <code>{stat.code}</code>
                      <b>{stat.value}</b>
                    </header>
                    <span>{stat.label}</span>
                    <small>{stat.detail}</small>
                    <i aria-hidden="true" />
                  </article>)}
                </div>
                  <div className="dh-layered-map-3d" aria-hidden="true">
                  {visualBuildCells.slice(0, 7).map((cell) => <span key={`map-${cell.id}`} className={`${cell.state} type-${cell.type}`} style={{"--map-fill": `${cell.fill}%`, "--map-order": cell.order}}>
                    <i />
                    <em />
                  </span>)}
                </div>
                <div className="dh-data-constellation" aria-label="Realtime video data constellation">
                  {constellationPackets.slice(0, 6).map((packet, index) => <span key={`star-${packet.id}`} className={`signal-${packet.side}`} style={{"--star-heat": `${packet.heat}%`, "--star-order": index, "--star-x": `${20 + ((index * 17 + sceneShiftIndex * 9) % 64)}%`, "--star-y": `${18 + ((index * 23 + sceneShiftIndex * 11) % 62)}%`}}>
                    <i />
                    <b>{packet.label}</b>
                  </span>)}
                </div>
                <div className="dh-popout-analytics-map" aria-label="Realtime popout digital analytics mapping">
                  {popoutGraphItems.map((item, index) => <span key={`popout-${item.id}`} className={item.id === episodeVisual.reveal.activeLane || (item.id === "backlink" && episodeVisual.reveal.activeLane === "seo") ? "hot" : "building"} style={{"--popout-fill": `${item.value}%`, "--popout-order": index}}>
                    <b>{item.label}</b>
                    <i>{item.value}</i>
                    <em />
                  </span>)}
                </div>
              </div>
              <div className={`dh-bottom-construction-floor dh-build-module ${analyticsGate.previewQueue} visual-${matrixConstruction.visualFamily}`} style={{"--floor-build": `${Math.round(observatoryConstructionProgress)}%`}} aria-label="Bottom constructed timeline, node map, and source floor">
                <div className="dh-node-timeline" aria-label="Live episode timeline nodes">
                  {visibleTimelineNodes.map((item, index) => <span key={`timeline-${item.id}`} className={item.active ? "active" : item.complete ? "complete" : "queued"} style={{"--node-order": index}}>
                    <i />
                    <b>{item.label}</b>
                  </span>)}
                </div>
                <div className="dh-bottom-layered-map" aria-hidden="true">
                  {visualBuildCells.slice(0, 10).map((cell) => <span key={`floor-${cell.id}`} className={`${cell.state} type-${cell.type}`} style={{"--floor-fill": `${cell.fill}%`, "--floor-order": cell.order}} />)}
                </div>
                <div className="dh-source-node-strip" aria-label="Constructed website and backlink source nodes">
                  {visibleSourceNodes.map((link, index) => <a key={`${link.url}-${index}`} href={link.url} target="_blank" rel="noreferrer" style={{"--source-order": index}}>
                    <span>{link.signal}</span>
                    <b>{link.title}</b>
                  </a>)}
                </div>
              </div>
              <div className={`dh-live-meaning-lens dh-build-module ${analyticsGate.lens} meaning-${liveMeaning.id}`}>
                <header>
                  <span>{liveMeaning.second}s</span>
                  <b>{liveMeaning.label}</b>
                  <strong>{liveMeaning.progress}%</strong>
                </header>
                <p>{liveWritingText}<i /></p>
                <div>
                  {liveMeaning.tags.map((tag) => <small key={tag}>{tag}</small>)}
                </div>
              </div>
              <div className={`dh-live-episode-visual dh-build-module ${analyticsGate.episode}`} aria-label="Live episode graph, funnel, and 3D position">
                <div className="dh-episode-orbit" style={{"--orbit-progress": `${episodeVisual.orbit}%`}}>
                  <i />
                  <span />
                  <b>{liveMeaning.label}</b>
                </div>
                <div className={`dh-self-building-hologram moment-${liveMeaning.id}`} style={{"--build-progress": `${liveMeaning.progress}%`, "--build-scale": (0.35 + liveMeaning.progress / 140).toFixed(2)}}>
                  <strong>{liveMeaning.id === "sponsored" ? "Sponsored Moment" : "Self Building"}</strong>
                  <div className="dh-hologram-core"><i /><span /><em /></div>
                  <div className="dh-hologram-blocks">
                    {episodeVisual.funnel.map((item, index) => <small key={item.id} className={item.active ? "active" : item.complete ? "complete" : ""} style={{"--block-index": index}}>{item.label}</small>)}
                  </div>
                </div>
                <div className="dh-episode-graph">
                  {episodeVisual.graph.map((item) => <span key={item.id} style={{"--bar": `${item.value}%`}}><b>{item.label}</b><i /></span>)}
                </div>
                <div className="dh-episode-funnel">
                  {episodeVisual.funnel.map((item) => <span key={item.id} className={item.active ? "active" : item.complete ? "complete" : ""}>{item.label}</span>)}
                </div>
              </div>
              <div className={`dh-youtube-signal-caption dh-build-module ${analyticsGate.metrics}`}>
                <b>{youtubeSignalField.resetLabel}</b>
                <small>{liveMeaning.videoCue} / {liveMeaning.podcastCue} / {liveMeaning.glbCue} / {liveMeaning.backlinkCue}</small>
              </div>
                <div className={`dh-corner-glb-dock ${glbDockExpanded ? "expanded" : "collapsed"} ${glbDockExpanded && glbSmartExpanded ? "smart-expanded" : ""}`}>
                  <header>
                    <div><span>3D GLB Corner Renderer</span><b>{glbDockExpanded ? glbSmartExpanded ? "Intelligent expansion" : "Expanded renderer" : "Collapsed corner dock"}</b></div>
                    <button type="button" onClick={() => setGlbDockExpanded((value) => !value)}>{glbDockExpanded ? "- Minimize" : "Expand"}</button>
                  </header>
                  <div className="dh-glb-api-market-strip" aria-label="GLB and market provider status">
                    <section>
                      <span>GLB APIs</span>
                      <b>{apiProviderLine}</b>
                      <div>
                        {glbProviderStack.map((item) => <em key={item.id} className={item.configured ? "live" : "waiting"}>{item.label}</em>)}
                      </div>
                    </section>
                    <section>
                      <span>Market Data</span>
                      <b>{sceneFeed.market?.symbol || tickerFromSearch(query) || "ticker-ready"}</b>
                      <div>
                        {marketProviderStack.map((item) => <em key={item.id} className={item.configured ? "live" : "waiting"}>{item.label}</em>)}
                      </div>
                    </section>
                  </div>
                  <button
                    type="button"
                    className="dh-glb-proof-preview"
                    onClick={() => openAutoProducedGlbReplica({
                      feed: smartGlbResearchFeed,
                      label: "Research GLB",
                      directModelUrl: smartGlbResearchDirectModelUrl,
                      embedUrl: smartGlbResearchEmbedUrl,
                      fallbackModelUrl: smartGlbResearchModelUrl
                    })}
                    aria-label={`Open expanded GLB play view for ${smartGlbResearchFeed.title}`}
                  >
                    <span className="dh-glb-proof-stage">
                      {smartGlbResearchEmbedUrl ? <iframe
                        title={`Compact API GLB provider preview for ${smartGlbResearchFeed.title}`}
                        src={autoplayEmbedUrl(smartGlbResearchEmbedUrl)}
                        loading="lazy"
                        allow="autoplay; fullscreen; xr-spatial-tracking"
                        allowFullScreen
                      /> : smartGlbResearchModelUrl || relatedGlb(smartGlbResearchFeed.category || category, 0) ? <model-viewer
                        key={`proof-glb-${smartGlbResearchModelUrl || relatedGlb(smartGlbResearchFeed.category || category, 0)}`}
                        src={smartGlbResearchModelUrl || relatedGlb(smartGlbResearchFeed.category || category, 0)}
                        alt={`Compact GLB proof preview for ${smartGlbResearchFeed.title}`}
                        auto-rotate="true"
                        interaction-prompt="none"
                        loading="lazy"
                        reveal="auto"
                        exposure="1.05"
                        shadow-intensity=".78"
                        camera-orbit="32deg 62deg 3m"
                      /> : <SceneObject feed={smartGlbResearchFeed} compact />}
                    </span>
                    <span className="dh-glb-proof-copy">
                      <b>{smartGlbResearchFeed.title}</b>
                      <small>{usefulVideoRead.threeDPrompt}</small>
                      <em>Click for expanded research view</em>
                    </span>
                  </button>
                  {glbDockExpanded && <section className="dh-smart-glb-research-view" aria-label="Smart GLB researcher detail view">
                    <div className="dh-smart-glb-stage">
                      {smartGlbResearchEmbedUrl ? <iframe
                        title={`Smart API 3D provider preview for ${smartGlbResearchFeed.title}`}
                        src={autoplayEmbedUrl(smartGlbResearchEmbedUrl)}
                        loading="lazy"
                        allow="autoplay; fullscreen; xr-spatial-tracking"
                        allowFullScreen
                      /> : smartGlbResearchModelUrl || relatedGlb(smartGlbResearchFeed.category || category, 0) ? <model-viewer
                        key={`smart-glb-${smartGlbResearchModelUrl || relatedGlb(smartGlbResearchFeed.category || category, 0)}`}
                        src={smartGlbResearchModelUrl || relatedGlb(smartGlbResearchFeed.category || category, 0)}
                        alt={`Smart 3D GLB research preview for ${smartGlbResearchFeed.title}`}
                        auto-rotate="true"
                        camera-controls="true"
                        interaction-prompt="none"
                        loading="lazy"
                        reveal="auto"
                        exposure="1"
                        shadow-intensity=".85"
                        camera-orbit="35deg 62deg 3m"
                      /> : <SceneObject feed={smartGlbResearchFeed} compact />}
                    </div>
                    <div className="dh-smart-glb-read">
                      <span>Extra Researcher Detail</span>
                      <b>{smartGlbResearchFeed.title}</b>
                      <small>{usefulVideoRead.threeDPrompt}</small>
                      <em>{usefulVideoRead.developerView}</em>
                      <a href={backlinkForFeed(smartGlbResearchFeed)} target="_blank" rel="noreferrer">open model/source</a>
                    </div>
                  </section>}
                  <div className="dh-corner-glb-grid">
                    {youtubeGlbDock.map((slot) => <button key={slot.id} type="button" className={slot.active ? "active" : ""} onClick={() => openAutoProducedGlbReplica({
                      feed: slot.feed,
                      label: slot.label,
                      directModelUrl: exactRenderableModelUrl(slot.feed),
                      embedUrl: providerEmbedUrl(slot.feed),
                      fallbackModelUrl: slot.modelUrl
                    })}>
                      <GlbModelPreview feed={slot.feed} modelUrl={slot.modelUrl} active={slot.active} title={`${slot.label}: ${slot.feed.title}`} />
                    <span><b>{slot.label}</b><small>{slot.feed.title}</small><em>{slot.status}</em></span>
                  </button>)}
                </div>
              </div>
              {glbPlayViewOpen && <section className="dh-glb-play-view" aria-label="Expanded GLB play preview">
                <button className="dh-glb-play-collapse" type="button" onPointerDown={minimizeGlbRenderer} onClick={minimizeGlbRenderer} aria-label="Collapse 3D Model View">Collapse</button>
                <div className="dh-glb-play-shell">
                  <header>
                    <div>
                      <span>3D Model View / {activeGlbPlayLabel}</span>
                      <b>{activeGlbPlayFeed.title}</b>
                      <small>{activeGlbPlaySourceLabel} / {usefulVideoRead.threeDPrompt}</small>
                    </div>
                    <button className="dh-glb-play-header-collapse" type="button" onPointerDown={minimizeGlbRenderer} onClick={minimizeGlbRenderer} aria-label="Collapse 3D Model View">Collapse 3D View</button>
                  </header>
                  <div className="dh-glb-play-stage">
                    {activeGlbPlayEmbedUrl ? <iframe
                      title={`Live API model view for ${activeGlbPlayFeed.title}`}
                      src={activeGlbPlayEmbedUrl}
                      loading="eager"
                      allow="autoplay; fullscreen; xr-spatial-tracking"
                      allowFullScreen
                    /> : activeGlbPlayModelUrl ? <model-viewer
                      key={`foreground-glb-${activeGlbPlayModelUrl}`}
                      src={activeGlbPlayModelUrl}
                      alt={`Expanded GLB play preview for ${activeGlbPlayFeed.title}`}
                      auto-rotate="true"
                      camera-controls="true"
                      interaction-prompt="none"
                      loading="eager"
                      reveal="auto"
                      exposure="1.08"
                      shadow-intensity=".9"
                      camera-orbit="35deg 62deg 3.2m"
                    /> : activeGlbBackupModelUrl ? <model-viewer
                      key={`foreground-backup-glb-${activeGlbBackupModelUrl}`}
                      src={activeGlbBackupModelUrl}
                      alt={`Verified backup GLB play preview for ${activeGlbPlayFeed.title}`}
                      auto-rotate="true"
                      camera-controls="true"
                      interaction-prompt="none"
                      loading="eager"
                      reveal="auto"
                      exposure="1.08"
                      shadow-intensity=".9"
                      camera-orbit="35deg 62deg 3.2m"
                    /> : <div className="dh-glb-play-pending"><b>GLB source search active</b><span>DigitalHut is waiting for a verified renderable GLB before opening the play view.</span></div>}
                  </div>
                  <footer>
                    <span>{activeGlbPlaySourceLabel} / {contentAnalyzer?.status || usefulVideoRead.confidenceLabel}</span>
                    <div className="dh-glb-play-footer-actions">
                      <button type="button" onPointerDown={minimizeGlbRenderer} onClick={minimizeGlbRenderer}>Collapse</button>
                      <a href={backlinkForFeed(activeGlbPlayFeed)} target="_blank" rel="noreferrer">open source</a>
                    </div>
                  </footer>
                </div>
              </section>}
            </div>
            <div className="dh-observatory-transport" aria-label="DigitalHut locked video and presentation controls">
              <label className="dh-category-drop-list">
                <span>Category Lane</span>
                <b>{category}</b>
                <select value={category} onChange={(event) => chooseCategoryFromDropdown(event.target.value)} aria-label="Choose DigitalHut episode category lane">
                  {categories.map((item) => <option key={item.id} value={item.id}>{item.id}</option>)}
                </select>
                <em>Next episode stays in this lane</em>
              </label>
              <button type="button" className={autoPresent ? "active" : ""} onClick={toggleMoviePlayback}>{autoPresent ? "Pause System" : "Play System"}</button>
              <button type="button" onClick={() => skipPresentation(-16)}>Back Video</button>
              <button type="button" onClick={previousFeed}>Previous Episode</button>
              <button type="button" onClick={nextFeed}>Next Episode</button>
              <button type="button" className={glbPlayViewOpen ? "active" : modelOpen && playing ? "active" : ""} onClick={glbPlayViewOpen ? minimizeGlbRenderer : openContainedModel}>{glbPlayViewOpen ? "Close 3D View" : "3D Model View"}</button>
              <button type="button" className={podcastFeatureOpen ? "active" : ""} onClick={openPodcastFeatureInterrupt}>Podcast Clip</button>
              <button type="button" onClick={() => scrubPresentation(76)}>Sponsor Stack</button>
              <button type="button" onClick={() => setGlbDockExpanded((value) => !value)}>{glbDockExpanded ? "Collapse GLBs" : "Expand 3 GLBs"}</button>
              <div className="dh-proof-bridge-controls" aria-label="DigitalHut 200M proof and source bridge">
                <a href={digitalhutMasterListBridge.proofRoute} onClick={() => trackObservatoryPixel("proof_route_open", masterListBridgePixel("transport-proof-bridge", {category, metadata: {route: digitalhutMasterListBridge.proofRoute}}))}>{digitalhutMasterListBridge.proofLabel}</a>
                <a href={digitalhutMasterListBridge.sourceBridgePath} onClick={() => trackObservatoryPixel("backlink_source_open", masterListBridgePixel("transport-proof-bridge", {category, keywordHint: digitalhutMasterListBridge.sourceKeywordHint, metadata: {route: digitalhutMasterListBridge.sourceBridgePath}}))}>{digitalhutMasterListBridge.sourceLabel}</a>
              </div>
              <label>
                <span>{youtubeSeekSeconds}s / {Math.round(presentationProgress)}%</span>
                <input type="range" min="0" max="100" step="1" value={presentationProgress} onChange={(event) => scrubPresentation(event.target.value)} />
              </label>
            </div>
            <div className={`dh-story-control dh-build-module ${analyticsGate.clips}`}>
              <div className={`dh-special-guest-signal ${analyticsGate.podcast} ${podcastMomentActive ? "playing" : ""}`} aria-label="Special guest podcast visual moment">
                <span className="dh-podcast-speaker-visual"><i /><em /><strong /></span>
                <div>
                  <span>Special Guest Moment</span>
                  <b>{podcastClip.isLivePodcast ? "Live podcast episode ready" : podcastClipReady ? "Podcast episode ready" : podcastMomentActive ? "Podcast speaker pulsing" : "Podcast signal loading"}</b>
                  <small>{podcastClipReady ? `${podcastClip.channel}: ${podcastClip.title}` : liveMeaning.podcastCue}</small>
                </div>
              </div>
              <div className="dh-story-clips">
                {youtubeStory.clips.slice(0, visibleClipCount).map((clip) => <article key={clip.id} className={clip.status}>
                  <span>{clip.label}</span>
                  <b>{clip.title}</b>
                  <small>{clip.detail} / {clip.status}</small>
                </article>)}
              </div>
            </div>
          </div>
          <aside className={`dh-podcast-feature-popup ${podcastFeatureOpen ? "is-open" : "is-closed"}`} role="dialog" aria-label="Podcast featuring popup" aria-hidden={!podcastFeatureOpen}>
            <button className="dh-podcast-feature-close" type="button" onClick={() => closePodcastFeatureInterrupt(false)} aria-label="Close podcast feature">Close</button>
            <div className="dh-podcast-feature-speaker">
              <span className="dh-podcast-speaker-visual"><i /><em /><strong /></span>
              <div className="dh-podcast-person-card">
                <strong>{String(podcastClip.channel || contentRadar.channel || "PC").slice(0, 2).toUpperCase()}</strong>
                <b>{podcastClip.channel || contentRadar.channel || "Podcast Speaker"}</b>
                <small>{podcastClip.isLivePodcast ? "live podcast episode" : podcastMomentActive ? "speaking now" : "speaker loading"}</small>
              </div>
            </div>
            <div className="dh-podcast-feature-copy">
              <span>{podcastClip.provider || "Podcast feature"}</span>
              <b>{podcastClip.title || contentRadar.subjectLine || liveMeaning.podcastCue}</b>
              <p>{podcastClip.channel || "Related podcast source"} is matched from the current episode radar. {podcastClip.audioUrl ? "The publisher audio clip plays while the speaker/source moment is active." : "Open the official podcast source while DigitalHut holds the speaker/source moment active."} Then DigitalHut returns to the YouTube story.</p>
            </div>
            {podcastClip.audioUrl && <div className="dh-podcast-audio-clip">
              {podcastClip.artwork && <img src={podcastClip.artwork} alt="" loading="lazy" />}
              <div>
                <span>{podcastClip.provider || "Apple Podcasts"}</span>
                <b>{podcastClip.channel || "Related podcast source"}</b>
                <small>{podcastClip.description || "Related audio clip matched from the current episode radar."}</small>
                <audio ref={podcastAudioRef} controls preload="auto" src={podcastClip.audioUrl} onCanPlay={(event) => {
                  event.currentTarget.muted = false
                  event.currentTarget.volume = 1
                  if(!podcastFeatureOpen) event.currentTarget.pause()
                }} />
              </div>
            </div>}
            {!podcastClip.audioUrl && <div className="dh-podcast-source-hold" role="status">
              {podcastClip.artwork && <img src={podcastClip.artwork} alt="" loading="lazy" />}
              <div>
                <span>{podcastClip.provider || "Apple Podcasts Search API"}</span>
                <b>Podcast source moment is holding</b>
                <small>{podcastClip.status === "podcast-api-empty" ? "No publisher audio clip matched yet. DigitalHut keeps YouTube paused and opens only a podcast/source route." : "Waiting for publisher audio. No YouTube fallback is allowed in this lane."}</small>
              </div>
              {podcastClip.pageUrl && <a href={podcastClip.pageUrl} target="_blank" rel="noreferrer" onClick={trackPodcastSourceOpen}>Open Podcast Source</a>}
            </div>}
            <div className="dh-podcast-feature-lanes">
              {[
                {id: "video", label: "YouTube", value: "interrupted"},
                {id: "glb", label: "GLB Replica", value: youtubeGlbDock?.[0]?.feed?.title || liveMeaning.glbCue},
                {id: "source", label: "Podcast Source", value: podcastClip.channel || "Apple Podcasts"},
                {id: "time", label: podcastClip.isLivePodcast ? "Live Episode" : "Clip Slot", value: podcastClip.slot || "matching"}
              ].map((lane, index) => <span key={`podcast-feature-${lane.id}`} className={`lane-${lane.id}`} style={{"--lane-order": index}}>
                <small>{lane.label}</small>
                <b>{lane.value}</b>
              </span>)}
            </div>
            <button className="dh-podcast-feature-resume" type="button" onClick={() => closePodcastFeatureInterrupt(true)}>Resume YouTube Story</button>
          </aside>
          <div className={`dh-cutscene-tracker dh-build-module ${analyticsGate.cutscenes}`}>
            {youtubeStory.cutscenes.slice(0, visibleCutsceneCount).map((cutscene) => <article key={cutscene.id} className={cutscene.status.includes("active") || cutscene.status.includes("live") || cutscene.status.includes("pulsing") ? "active" : ""}>
              <span>{cutscene.time}</span>
              <b>{cutscene.label}</b>
              <small>{cutscene.status}</small>
            </article>)}
          </div>
          <div className={`dh-story-analytics dh-build-module ${analyticsGate.metrics}`}>
            <span>Video</span><b>{youtubeSourceMode}</b><span>GLB</span><b>{activeGlbPlaySourceLabel}</b><span>Podcast</span><b>{podcastSourceMode}</b><span>Analyzer</span><b>{semanticAnalyzerSource}</b>
          </div>
          <div className={`dh-multi-display-feed dh-build-module ${analyticsGate.metrics}`} aria-label="DigitalHut multi-display feed">
            <header>
              <span>Multi-Display Feed</span>
              <b>{usefulVideoRead.productLine}</b>
            </header>
            <div>
              {multiDisplayFeed.map((display) => display.url
                ? <a key={`display-${display.id}`} className={`tone-${display.tone}`} href={display.url} target="_blank" rel="noreferrer" onClick={() => trackObservatoryPixel("backlink_source_open", {category, keywordHint: display.value || display.label, metadata: {source: "multi-display-feed", displayId: display.id, url: display.url, detail: display.detail}})}>
                  <small>{display.label}</small>
                  <b>{display.value}</b>
                  <span>{display.detail}</span>
                </a>
                : <article key={`display-${display.id}`} className={`tone-${display.tone}`}>
                  <small>{display.label}</small>
                  <b>{display.value}</b>
                  <span>{display.detail}</span>
                </article>
              )}
            </div>
          </div>
            <aside className={`dh-episode-preview-dock dh-build-module ${analyticsGate.previewQueue}`} aria-label="DigitalHut category-locked YouTube episode queue">
              <header>
                <span>Category Locked</span>
                <b>{category}</b>
                <strong>{youtubeSearch?.quotaProtected ? "Quota Protected" : `${episodePreviews.length} Video Picks`}</strong>
              </header>
              <label className="dh-category-dock-select">
                <span>Switch category</span>
                <select value={category} onChange={(event) => chooseCategoryFromDropdown(event.target.value)}>
                  {categories.map((item) => <option key={item.id} value={item.id}>{item.id}</option>)}
                </select>
              </label>
              <details className="dh-category-smart-switch">
                <summary>
                  <span>{category}</span>
                  <small>Next Episode stays in this category and rotates the picks below</small>
                </summary>
                <div className="dh-category-smart-menu">
                {featuredEpisodeCategories.map((item) => {
                  const seed = rotateFreshList(seedFeeds(item), freshnessSeed, `${item}:smart-switch-seed`)[0]
                  const quickVideo = seededYoutubePanelVideosFor(item, seed?.query || `${item} DigitalHut video observatory`, 1, freshnessSeed)[0]
                  return <button key={item} type="button" className={item === category ? "active" : ""} data-youtube-video-id={quickVideo?.videoId || ""} onClick={() => openDigitalhutEpisodePreview({
                  category: item,
                  title: quickVideo?.title || `${item} DigitalHut Episode`,
                  query: quickVideo?.title || seed?.query || `${item} DigitalHut video observatory`,
                  thumbnail: quickVideo?.thumbnail || seed?.thumbnail || stockUrl(item, 0),
                  videoId: quickVideo?.videoId,
                  embedUrl: quickVideo?.embedUrl,
                  channelTitle: quickVideo?.channelTitle
                }, item)}>
                    <span>{item}</span>
                    <small>{item === category ? "locked now" : "switch lane"}</small>
                  </button>
                })}
                </div>
              </details>
              <div className="dh-episode-preview-help">Quick Panel: these are the next YouTube videos inside {category}</div>
              <div className="dh-platform-cadence-rail" aria-label="DigitalHut platform timing and queue state">
                <header>
                  <span>Platform Cadence</span>
                  <b>{platformCadence.pace}</b>
                  <strong>{platformCadence.mode}</strong>
                </header>
                <div>
                  {platformCadence.lanes.map((lane) => <button key={lane.id} type="button" onClick={() => trackObservatoryPixel("platform_cadence_read", {category, keywordHint: lane.value, metadata: {lane: lane.id, pace: platformCadence.pace, mode: platformCadence.mode}})}>
                    <span>{lane.label}</span>
                    <b>{lane.value}</b>
                    <small>{lane.detail}</small>
                  </button>)}
                </div>
              </div>
              <div className="dh-episode-proof-rail" aria-label="DigitalHut proof routes for the locked category">
                {proofIntentLinks.map((item) => <a key={item.id} href={item.url} onClick={() => trackObservatoryPixel("proof_route_open", {category, keywordHint: item.value, metadata: {source: "episode-preview-dock", route: item.id}})}>
                  <span>{item.label}</span>
                  <b>{item.value}</b>
                </a>)}
              </div>
              <div className="dh-episode-preview-grid">
                  {episodePreviews.map((preview) => <button key={preview.id} type="button" className={preview.live ? "live" : ""} data-youtube-video-id={preview.videoId || ""} data-fit={preview.contentFit || preview.source || "category"} data-cadence={preview.cadenceSlot || ""} title={preview.fitDetail || preview.source} onClick={() => openDigitalhutEpisodePreview(preview, preview.category)}>
                  <img src={preview.thumbnail} alt="" loading="lazy" />
                  <span>Episode {preview.order}</span>
                  <b>{preview.episodeName}</b>
                  <small>{preview.status} / {preview.cadenceSlot} / {preview.contentFit || preview.source}</small>
                </button>)}
              </div>
            </aside>
          <div className={`dh-backlink-radar dh-build-module ${analyticsGate.backlinks}`} aria-label="Live content pickup radar and backlink lanes">
            <header>
              <span>Content Pickup Radar</span>
              <b>{backlinkRadar.focus}</b>
              <strong>{backlinkRadar.pulse}%</strong>
            </header>
            <div className="dh-pickup-lanes">
              {backlinkRadar.lanes.map((lane, index) => {
                const laneState = !episodeVisual.reveal.lanes.includes(lane.id) ? "queued" : lane.id === episodeVisual.reveal.activeLane ? "active" : "building"
                return <article key={lane.id} className={`pickup-${lane.id} ${laneState}`} style={{"--pickup-strength": `${lane.strength}%`, "--reveal-order": index}}>
                  <span>{lane.label}</span>
                  <b>{laneState === "queued" ? "constructing signal" : lane.status}</b>
                  <small>{laneState === "queued" ? "waiting for the live cue" : lane.detail}</small>
                </article>
              })}
            </div>
            <div className="dh-episode-table">
              {episodeVisual.rows.map((row, index) => <article key={row.id} className={row.revealState} style={{"--reveal-order": index}}>
                <span>{row.label}</span>
                <b>{row.revealState === "queued" ? "waiting cue" : row.status}</b>
                <small>{row.revealState === "queued" ? "not built yet" : row.note}</small>
                <strong>{row.revealState === "queued" ? "--" : `${row.value}%`}</strong>
              </article>)}
            </div>
            <div className="dh-backlink-grid">
              {backlinkRadar.links.slice(0, episodeVisual.reveal.links).map((link, index) => <a key={link.id} href={link.url} target="_blank" rel="noreferrer" style={{"--reveal-order": index}} onClick={() => trackObservatoryPixel("backlink_source_open", {category, keywordHint: link.title || link.label || backlinkRadar.focus, metadata: {source: "backlink-radar", linkId: link.id, url: link.url, signal: link.signal}})}>
                <span>{link.label}</span>
                <b>{link.title}</b>
                <small>{link.signal}</small>
              </a>)}
            </div>
          </div>
        </section>
        <section className={`dh-main-live-analyzer ${presentationChapter.id === "podcast" ? "guest-moment" : ""}`} style={{"--stream-pace": streamAnalytics.pace, "--motion-progress": `${Math.round(liveAnalyticsProgress)}%`}}>
          <header>
            <span>Live Video / GLB / Podcast Analytics</span>
            <b>{observatoryAnalysis.phase}</b>
            <strong>{observatoryAnalysis.overall}%</strong>
          </header>
          <div className="dh-main-analyzer-lanes">
            {observatoryAnalysis.lanes.map((lane) => <article key={lane.id} className={`lane-${lane.id}`}>
              <span>{lane.label}</span>
              <b>{lane.status}</b>
              <small>{lane.value}%</small>
            </article>)}
          </div>
          <div className="dh-main-analyzer-stream" style={{"--stream-pace": streamAnalytics.pace}}>
            {[0,1].map((loop) => <div key={loop} aria-hidden={loop === 1}>
              <span>{streamAnalytics.videoState}</span>
              <b>{streamAnalytics.renderState}</b>
              <span>{streamAnalytics.podcastState}</span>
              <b>{streamAnalytics.metrics.views.toLocaleString()} views</b>
              <span>{seoRevenueFrame.primaryKeyword}</span>
              {liveLongTailKeywords.slice(0, 4).map((keyword) => <b key={`${loop}-${keyword}`}>{keyword}</b>)}
            </div>)}
          </div>
        </section>
      </div>

      <div className="dh-utility" style={{opacity: awake ? 1 : 0.1}}>{["Save", "Share", "Live", "Embed", "Download", "Related", "Refresh", "FAQ"].map((label) => <button key={label} className="dh-btn" onClick={() => action(label)}>{label}</button>)}</div>

      <div className="dh-layer-dock" style={{opacity: awake ? 1 : 0.12}}>
        <button className={`dh-btn ${paid ? "" : "locked"}`} onClick={() => paid ? setLayerOpen((value) => !value) : setEntryOpen(true)}>{paid ? `Smart Layers: ${layer}` : "Smart Layers: Premium / Pro"}</button>
        {layerOpen && paid && <div className="dh-layer-menu">{layers.map((item) => <button key={item} className={`dh-btn ${item === layer ? "active" : ""}`} onClick={() => {setLayer(item); setLayerOpen(false)}}>{item}</button>)}</div>}
      </div>

      <button className={`dh-ai-space ${aiListening ? "listening" : ""} dock-${aiDock}`} type="button" onClick={startVoiceCommand}>
        <span>DigitalHut AI</span><b>{aiListening ? "Listening" : "Interact"}</b>
      </button>
      <div className={`dh-director-panel ${directorPanelOpen ? "open" : "collapsed"}`} data-dh-director>
        <button className="dh-director-mini-toggle" type="button" onClick={() => setDirectorPanelOpen((value) => !value)} aria-expanded={directorPanelOpen}>
          <span>AI Director</span>
          <b>{directorStatus.phase}</b>
          <small>{directorPanelOpen ? "Collapse" : directorStatus.detail}</small>
        </button>
        {directorPanelOpen && <div className="dh-director-expanded">
          <div className="dh-director-head"><b>AI Director</b><span>{tier.toUpperCase()}</span></div>
          <div className="dh-director-status">
            <strong>{directorStatus.phase}</strong>
            <p>{directorStatus.detail}</p>
            <small>{directorStatus.status}</small>
            <small className="dh-director-asset-source">{directorAssetSourceSummary}</small>
          </div>
          <ol>
            {["Finding model", "Loading GLB", "Preparing camera", "Reading metadata", "Ready to present"].map((item) => <li key={item} className={directorStepIsActive(item) ? "active" : ""}>{item}</li>)}
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
        </div>}
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
        <section className={`dh-ai-observatory-analyzer ${presentationChapter.id === "podcast" ? "guest-moment" : ""}`} aria-label="AI observatory analyzer">
          <header>
            <div>
              <span>AI Observatory Analyzer</span>
              <b>{observatoryAnalysis.phase}</b>
            </div>
            <strong>{observatoryAnalysis.overall}%</strong>
          </header>
          <div className="dh-analyzer-core">
            <div className="dh-analyzer-orbit" style={{"--analysis-score": `${observatoryAnalysis.overall}%`}}>
              <i />
              <b>{observatoryAnalysis.pulse}</b>
              <span>{observatoryAnalysis.categoryLabel}</span>
            </div>
            <div className="dh-analyzer-lanes">
              {observatoryAnalysis.lanes.map((lane) => <article key={lane.id} className={`lane-${lane.id}`}>
                <div><b>{lane.label}</b><span>{lane.status}</span></div>
                <meter min="0" max="100" value={lane.value}>{lane.value}</meter>
                <small>{lane.value}% sync</small>
              </article>)}
            </div>
          </div>
          <div className="dh-analyzer-ribbon">
            {[0,1].map((loop) => <div key={loop} aria-hidden={loop === 1}>
              {observatoryAnalysis.flags.map((flag) => <span key={`${loop}-${flag}`}>{flag}</span>)}
            </div>)}
          </div>
          <small>{observatoryAnalysis.title}</small>
        </section>
        <section className="dh-seo-revenue-map" aria-label="SEO revenue map">
          <header>
            <span>FireCuda SEO Runner</span>
            <b>{seoRevenueFrame.label}</b>
          </header>
          <div className="dh-seo-revenue-grid">
            <article><span>Episode</span><b>{seoRevenueFrame.episodeLine}</b></article>
            <article><span>Ad Point</span><b>{seoRevenueFrame.adLine}</b></article>
            <article><span>Conclusion</span><b>{seoRevenueFrame.conclusionLine}</b></article>
          </div>
          <div className="dh-seo-keyword-strip">
            {[0,1].map((loop) => <div key={loop} aria-hidden={loop === 1}>
              {[...seoRevenueFrame.keywords, ...liveLongTailKeywords].map((keyword) => <span key={`${loop}-${keyword}`}>{keyword}</span>)}
            </div>)}
          </div>
        </section>
        <div className={`dh-stream-analytics ${presentationChapter.id === "podcast" ? "podcast-moment" : ""}`} style={{"--stream-pace": streamAnalytics.pace}}>
          <div className="dh-stream-lane">
            {[0,1].map((loop) => <div className="dh-stream-track" key={loop} aria-hidden={loop === 1}>
              <span>{presentationChapter.label}</span>
              <b>{streamAnalytics.renderState}</b>
              <span>{streamAnalytics.videoState}</span>
              <b>{streamAnalytics.metrics.views.toLocaleString()} views</b>
              <span>{streamAnalytics.metrics.likes.toLocaleString()} likes</span>
              <b>{streamAnalytics.metrics.comments.toLocaleString()} comments</b>
              <span>{streamAnalytics.podcastState}</span>
              <b>{streamAnalytics.sourceState}</b>
              <span>{streamAnalytics.title}</span>
            </div>)}
          </div>
          <small>Analytics, video bridge, GLB render state, and podcast cue are moving together at live-stream pace.</small>
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
        {category === "Researcher" && <section className="dh-research-note-brief">
          <b>Researcher Identification Panel</b>
          <span>{tierAssetDescription({feed: sceneFeed, category, stage, tier})}</span>
          <small>Use this panel to identify visible details, source confidence, questions, and database metadata before saving.</small>
        </section>}
        <div className="dh-note-tools">
          <select value={noteFormat.font} onChange={(event) => setNoteFormat((current) => ({...current, font: event.target.value}))}><option>Arial</option><option>Georgia</option><option>Courier New</option></select>
          <select value={noteFormat.size} onChange={(event) => setNoteFormat((current) => ({...current, size: event.target.value}))}><option value="13">13</option><option value="14">14</option><option value="16">16</option><option value="18">18</option></select>
          <select value={noteFormat.spacing} onChange={(event) => setNoteFormat((current) => ({...current, spacing: event.target.value}))}><option value="1.25">Tight</option><option value="1.45">Normal</option><option value="1.7">Open</option></select>
          <input type="color" value={noteFormat.color} onChange={(event) => setNoteFormat((current) => ({...current, color: event.target.value}))} />
          <button type="button" onClick={() => setSmartNote((current) => `${current}\n- `)}>Bullets</button>
          {category === "Researcher" && <button type="button" onClick={() => setSmartNote((current) => `${current}\n\nResearcher Asset ID\nAsset: ${sceneFeed.title}\nCategory: ${category}\nTier: ${tier}\nVisible details:\n- \nSource confidence:\n- ${sceneFeed.apiSource || sceneFeed.apiStatus || "DigitalHut source"}\nQuestions:\n- What exact detail needs verification?\nDatabase tags:\n- \nDownload/backlink:\n- ${backlinkForFeed(sceneFeed)}\n`)}>Research Format</button>}
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
      <a href="/system-proof">System Proof</a>
      <a href="/master-keyword-coverage">Keyword Map</a>
      <a href="/watch/full-view-episode-alternative">Watch Proof</a>
      <a href="/about">About Us</a>
      <a href="/blog">Blog</a>
      <a href="/standby">Standby</a>
      <a href="/markets">Markets</a>
      <a href="/privacy">Privacy</a>
      <a href="/contact">Contact</a>
      <a href="/guardian">Guardian</a>
      <a href="/faq">FAQ</a>
    </nav>

    {entryOpen && <section className="dh-entry"><div className="dh-entry-panel">{entryLoading ? <><div className="dh-logo">DigitalHut</div><div className="dh-load"><span /></div><p>Loading your observatory system</p></> : <><p className="dh-eyebrow">Choose profile</p><h2 className="dh-welcome">Welcome!</h2><input className="dh-entry-input" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Username Account" /><div className="dh-account-grid">{accounts.map((item) => <button key={item} className={`dh-btn ${tier === item ? "active" : ""}`} onClick={() => enter(item)}>{item.toUpperCase()}</button>)}</div><div className="dh-wallet"><ConnectButton /></div><p className="dh-entry-small">Guest and wallet-connected users get unlimited viewing and AutoPlay. Paid tiers expand saved history, storage, backend controls, nodes, and deep research.</p></>}</div></section>}
  </main>
}
