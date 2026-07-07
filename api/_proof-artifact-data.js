export const fullSystemAnchor = "video watching + 3D Model View + podcast/source moments + live analytics in one 2026 dapp observatory"

export const currentFloor = {
  pageViews: 299,
  uniqueVisitors: 107,
  totalEvents: 516,
  glbPreviewPlays: 83,
  podcastInterrupts: 13,
  autoplayStarts: 5,
  searches: 2,
  marketOpens: 5,
  proofRouteOpens: 0,
  sourceBacklinkOpens: 0
}

export const priorityRoutes = [
  {
    route: "/watch/youtube-video-content-radar",
    type: "watch-proof",
    lane: "AI video / podcast / source explainer",
    title: "YouTube Video Content Radar",
    proofAngle: "video topic radar, changing timeline read, source links, podcast interrupt, and GLB model view",
    targetSignals: ["proof_route_open", "backlink_source_open", "glb_preview_play", "podcast_interrupt_start", "search_run"]
  },
  {
    route: "/blog/youtube-video-content-radar",
    type: "blog-proof",
    lane: "AI video / podcast / source explainer",
    title: "YouTube Video Content Radar Blog Proof",
    proofAngle: "readable long-tail context that backs the watch route with crawlable source language",
    targetSignals: ["blog_view", "proof_route_open", "backlink_source_open"]
  },
  {
    route: "/watch/watch-video-with-3d-model-proof",
    type: "watch-proof",
    lane: "full-system entertainment observatory",
    title: "Watch Video With 3D Model Proof",
    proofAngle: "source proof, podcast/source moment, timeline context, GLB scene context, and backlink path",
    targetSignals: ["proof_route_open", "glb_preview_play", "podcast_interrupt_start"]
  },
  {
    route: "/watch/podcast-source-moment-for-viral-video",
    type: "watch-proof",
    lane: "podcast/source moment",
    title: "Podcast Source Moment For Viral Video",
    proofAngle: "audio source proof for a trending video topic inside the DigitalHut watch system",
    targetSignals: ["podcast_interrupt_start", "podcast_source_open", "proof_route_open"]
  },
  {
    route: "/watch/glb-research-assistant",
    type: "watch-proof",
    lane: "3D model evidence",
    title: "GLB Research Assistant",
    proofAngle: "GLB evidence anchor, source summary, timeline, bubble map, and research backlink route",
    targetSignals: ["glb_preview_play", "glb_source_click", "proof_route_open"]
  },
  {
    route: "/watch/looking-for-lunch-visual-observatory",
    type: "watch-proof",
    lane: "mundane-life lunch / food near me",
    title: "Looking For Lunch Visual Observatory",
    proofAngle: "normal-life food intent with video context, local source links, GLB place context, and watch proof",
    targetSignals: ["proof_route_open", "search_run", "backlink_source_open"]
  },
  {
    route: "/watch/calling-an-uber-visual-trip-guide",
    type: "watch-proof",
    lane: "mundane-life rideshare / commute",
    title: "Calling An Uber Visual Trip Guide",
    proofAngle: "pickup context, route timing, source links, timeline proof, and watch route",
    targetSignals: ["proof_route_open", "search_run", "backlink_source_open"]
  }
]

export const measurementEvents = [
  {canonicalEvent: "page_view", aliases: ["blog_view"], purpose: "route visibility and proof-route discovery"},
  {canonicalEvent: "search_run", aliases: ["youtube_search_submit"], purpose: "typed viewer intent and topic discovery"},
  {canonicalEvent: "proof_route_open", aliases: ["watch_route_open", "blog_route_open", "category_proof_open"], purpose: "watch/blog/category proof hit marker"},
  {canonicalEvent: "backlink_source_open", aliases: ["glb_source_click", "podcast_source_open"], purpose: "source/backlink trust hit marker"},
  {canonicalEvent: "glb_preview_play", aliases: ["glb_preview_open", "glb_replica_play"], purpose: "3D Model View proof"},
  {canonicalEvent: "podcast_interrupt_start", aliases: ["podcast_interrupt_play", "viral_podcast_source_start"], purpose: "podcast/source moment proof"},
  {canonicalEvent: "autoplay_start", aliases: ["episode_preview_autoplay_start"], purpose: "full-system presentation flow"},
  {canonicalEvent: "market_view_open", aliases: ["market_panel_open", "ticker_search"], purpose: "market observatory behavior"}
]

export const searchConsoleReceipt = {
  generatedAt: "2026-07-07T17:19:32.114Z",
  mode: "DigitalHut Search Console Sitemap Submission Receipt",
  siteUrl: "https://www.digitalhut.app/",
  sitemapUrl: "https://www.digitalhut.app/sitemap.xml",
  serviceAccountEmail: "digitalhut-observatory-runner@supportrd-auth.iam.gserviceaccount.com",
  api: {
    sites: {ok: true, status: 200},
    sitemapSubmit: {ok: true, status: 204, error: null},
    sitemaps: {ok: true, status: 200},
    finalSearchAnalytics: {ok: true, status: 200},
    freshSearchAnalytics: {ok: true, status: 200}
  },
  sitemap: {
    path: "https://www.digitalhut.app/sitemap.xml",
    lastSubmitted: "2026-07-07T17:19:34.302Z",
    lastDownloaded: "2026-07-07T10:06:49.874Z",
    isPending: true,
    warnings: "0",
    errors: "0"
  },
  searchAnalyticsFinal: {rowCount: 0, totalClicks: 0, totalImpressions: 0, averagePosition: null},
  searchAnalyticsFresh: {rowCount: 0, totalClicks: 0, totalImpressions: 0, averagePosition: null},
  inspections: [
    {url: "https://www.digitalhut.app/", verdict: "PASS", coverageState: "Submitted and indexed", lastCrawlTime: "2026-07-06T20:22:57Z"},
    {url: "https://www.digitalhut.app/watch/home-project-3d-visual-planner", verdict: "NEUTRAL", coverageState: "Discovered - currently not indexed", lastCrawlTime: null},
    {url: "https://www.digitalhut.app/category/mainstream-streaming", verdict: "NEUTRAL", coverageState: "Discovered - currently not indexed", lastCrawlTime: null}
  ],
  rankingTruth: "Search Console has no query rows yet; Google activity is proven by sitemap and URL inspection, not by ranking rows."
}

export function baseArtifact(mode){
  return {
    generatedAt: "2026-07-07T17:45:00.000Z",
    mode,
    canonicalDomain: "https://www.digitalhut.app",
    fullSystemAnchor,
    sitemapUrl: "https://www.digitalhut.app/sitemap.xml",
    liveStatusUrl: "https://www.digitalhut.app/api/insight-map",
    currentFloor,
    guardrail: "Do not claim Google ranking movement unless Search Console rows, impressions, clicks, or average position data exist."
  }
}

export function sendJson(res, payload){
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600")
  res.setHeader("Content-Type", "application/json; charset=utf-8")
  return res.status(200).json(payload)
}
