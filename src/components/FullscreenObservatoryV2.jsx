Exit code: 0
Wall time: 1.3 seconds
Total output lines: 8523
Output:
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react"
import {ConnectButton} from "../wallet"
import {useAccount, useSendTransaction, useWaitForTransactionReceipt} from "wagmi"
import {parseEther} from "viem"
import {inferCategoryByVector} from "../lib/assetVectorMath"
import {firecudaAssetsForCategory, firecudaLibraryStatus, firecudaLocalFallbackUrl, firecudaModelPool, firecudaUrl} from "../lib/firecudaLibraryManifest"
import {loadModelViewer} from "../lib/modelViewerRuntime"
import {originalLongTailKeywordsFor, seoBacklinkBrief, seoNarrationLine, seoRevenueFrameFor, seoRunnerProofPosts, seoUsefulnessLaneFor} from "../lib/seoContentEngine"
import {digitalhutMasterListBridge, digitalhutSourceBridgePath, masterListBridgePixel} from "../lib/digitalhutMasterListBridge"
import {applySystemPerformanceProfile, getSystemPerformanceProfile} from "../lib/systemPerformanceProfile"
import {interpretServerEntitlement} from "../lib/serverEntitlementContract"
import PodcastMatchPanel from "./PodcastMatchPanel"
import SocialPressureDrawer from "./SocialPressureDrawer"
import WeatherTimeGauge from "./WeatherTimeGauge"
import SemanticAnalyticsPanel from "./SemanticAnalyticsPanel"
import AiReactionLayer from "./AiReactionLayer"
import AccountSubscriptionPanel from "./AccountSubscriptionPanel"
import {supabase} from "../lib/supabaseClient"
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
     …121140 tokens truncated…ose</button></div>
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

    {entryOpen && <section className="dh-entry dh-subscription-entry"><div className="dh-entry-panel dh-subscription-screen">
      <button className="dh-subscription-close" type="button" onClick={() => setEntryOpen(false)}>Close</button>
      {entryLoading ? <><div className="dh-logo">DigitalHut</div><div className="dh-load"><span /></div><p>Loading your account system</p></> : <>
        <p className="dh-eyebrow">DigitalHut account</p><h2 className="dh-welcome">{accountView === "profile" ? "Your profile." : "Choose how you explore."}</h2><p className="dh-subscription-lead">{accountView === "profile" ? "Manage your account, subscription, and saved preferences." : "One observatory, with more saved context and research depth at each level."}</p>
        {accountView === "profile" && <div className="dh-profile-window">
          <section><span>Name</span><h3>{username || "DigitalHut member"}</h3><small>{accountSession?.user?.email || "Sign in to manage your full profile"}</small></section>
          <section><span>Current subscription</span><h3>{paid ? `${tier[0].toUpperCase()}${tier.slice(1)}` : "Guest"}</h3><small>{visibleStructuredNodes.length} current system nodes</small></section>
          {accountSession && <div className="dh-profile-details">
            <label>Name<input value={username} onChange={(event) => setUsername(event.target.value)} /></label>
            <label>Email<input value={accountSession.user.email || ""} readOnly /></label>
            <label>Address<input value={profileAddress} onChange={(event) => setProfileAddress(event.target.value)} autoComplete="street-address" placeholder="Optional billing address" /></label>
            <label>Preferred payment<select value={preferredPayment} onChange={(event) => setPreferredPayment(event.target.value)}><option>PayPal</option><option>Connected wallet</option></select></label>
            <button type="button" onClick={saveProfile}>Save profile</button>
            <label>New password<input type="password" value={profilePassword} onChange={(event) => setProfilePassword(event.target.value)} minLength="8" autoComplete="new-password" placeholder="8+ characters" /></label>
            <button type="button" onClick={changeProfilePassword}>Change password</button>
            <button type="button" onClick={() => setAccountView("upgrade")}>View or upgrade subscription</button>
            <button type="button" onClick={signOutAccount}>Sign out</button>
            <p role="status">{profileStatus}</p>
          </div>}
        </div>}
        {accountView === "upgrade" && <>
        <div className="dh-subscription-summary">
          <section><span>My DigitalHut Account</span><h3>Personal details</h3><p>Keep these details with your service account and payment receipt.</p><div className="dh-personal-fields"><label>Account holder<input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Display name" /></label><label>Email address<input value={accountSession?.user?.email || "Sign in from the left account panel"} readOnly /></label><button type="button" onClick={() => {window.localStorage.setItem("digitalhut:displayName", username); if(accountSession) supabase.auth.updateUser({data:{display_name:username}}).catch(() => null)}}>Save account details</button></div></section>
          <section><span>Current subscription</span><h3>{paid ? `${tier[0].toUpperCase()}${tier.slice(1)} active` : "No active subscription"}</h3><p>{entitlementDecision?.threePlan?.message || "Choose a service below to start. A subscription opens here only after the payment provider and entitlement server confirm it."}</p>{accountSession && <button type="button" onClick={signOutAccount}>Sign out</button>}</section>
        </div>
        <div className="dh-payment-rails"><span>DigitalHut sponsored payment rails</span><b>Provider confirmation required</b></div>
        <div className="dh-tier-cards">{[
          {id:"standard",price:"$12/month",tag:"",copy:"Longer saved history, core AI Director controls, category growth tracking",eligibility:"DigitalHut account required; individual use.",terms:"Recurring monthly PayPal subscription. Cancel in PayPal; access starts only after DigitalHut verifies an ACTIVE provider receipt.",features:["Full video observatory","Interactive 3D model view","Podcast source moments","Core session controls"]},
          {id:"premium",price:"$25/month",tag:"Most complete",copy:"Premium AI detail, stronger session memory, node progress visibility",eligibility:"DigitalHut account required; creator or researcher use.",terms:"Recurring monthly PayPal subscription. Cancel in PayPal; access starts only after DigitalHut verifies an ACTIVE provider receipt.",features:["Full video observatory","Interactive 3D model view","Podcast source moments","Extended session memory"]},
          {id:"pro",price:"$60/month",tag:"",copy:"Deep research, expanded backend controls, unlimited AI presentation power",eligibility:"DigitalHut account required; advanced individual use.",terms:"Recurring monthly PayPal subscription. Cancel in PayPal; access starts only after DigitalHut verifies an ACTIVE provider receipt.",features:["Full video observatory","Interactive 3D model view","Podcast source moments","Deep research access"]}
        ].map((plan) => {
          const tierId = `tier-${plan.id}`
          const selected = selectedPaypalTier?.id === tierId
          return <article key={plan.id} className={`${plan.id === "premium" ? "featured" : ""} ${selected ? "selected" : ""}`}>{plan.tag && <em>{plan.tag}</em>}<h3>{plan.id[0].toUpperCase()+plan.id.slice(1)}</h3><strong>{plan.price}</strong><p>{plan.copy}</p><ul>{plan.features.map((feature) => <li key={feature}>+ {feature}</li>)}</ul><small><b>Eligibility:</b> {plan.eligibility}</small><small><b>Terms:</b> {plan.terms}</small><button type="button" aria-pressed={selected} onClick={() => setSelectedPurchaseIds([tierId])}>{selected ? `${plan.id[0].toUpperCase()+plan.id.slice(1)} selected for PayPal` : `Select ${plan.id[0].toUpperCase()+plan.id.slice(1)} for PayPal`}</button></article>
        })}</div>
        <section className="dh-subscription-paypal" aria-label="Official PayPal subscription checkout">
          <div><span>Secure recurring checkout</span><b>{selectedPaypalTier?.title || "Choose a tier"} · {selectedPaypalTier?.price || ""}</b></div>
          <p>{!accountSession ? "Sign in before opening PayPal so the verified subscription can be bound to your DigitalHut account." : (["error", "verifying", "verified"].includes(paypalCheckout.status) ? paypalCheckout.message : paypalCheckout.planMessage || paypalCheckout.message) || "Checking secure PayPal checkout availability."}</p>
          <div ref={paypalButtonHostRef} className="dh-paypal-button-host" aria-live="polite" />
          {paypalCheckout.status === "error" && <button type="button" onClick={() => setPaypalCheckout((current) => ({...current, status:"ready"}))}>Retry PayPal checkout</button>}
        </section>
        {!accountSession && <p className="dh-entry-small">Use Google or email in the familiar sign-in panel on the left, or choose a tier to open the signup and purchase combination. Paid access is never activated without a finalized provider receipt.</p>}
        </>}
      </>}
    </div></section>}
  </main>
}

