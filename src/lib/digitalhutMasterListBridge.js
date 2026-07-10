export const digitalhutMasterListBridge = {
  id: "digitalhut-200m-seo-master-list",
  lane: "DigitalHut 200M SEO Master List",
  universe: 200572944,
  publicSitemapWindow: 50000,
  proofRoute: "/system-proof",
  keywordCoverageRoute: "/master-keyword-coverage",
  sourceBridgePath: "/source-bridge#digitalhut-200m-seo-master-list",
  sourceBridgeJsonPath: "/digitalhut-proof-source-conversion-bridge.json#digitalhut-200m-seo-master-list",
  proofLabel: "200M Proof",
  sourceLabel: "Source Bridge",
  proofKeywordHint: "DigitalHut 200M SEO Master List system proof",
  sourceKeywordHint: "DigitalHut 200M SEO Master List source bridge",
  measurementSignals: [
    "page view",
    "unique visitor",
    "master keyword door event",
    "GLB Model View open",
    "podcast/source interrupt",
    "autoplay start",
    "search intent",
    "market open",
    "proof route open",
    "source/backlink open",
    "Search Console query row"
  ],
  dappProofEngine: [
    "video watching/session flow",
    "3D Model View and GLB interaction",
    "podcast/source moment",
    "live analytics",
    "search and category routing",
    "Supabase behavior telemetry",
    "sitemap and Search Console proof"
  ]
}

export function digitalhutMasterListUrl(path){
  if(typeof window === "undefined") return `https://www.digitalhut.app${path}`
  return `${window.location.origin}${path}`
}

export function digitalhutSourceBridgePath(params = {}, anchor){
  const [path, hash = ""] = digitalhutMasterListBridge.sourceBridgePath.split("#")
  const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")).toString()
  const bridgeAnchor = anchor || hash
  return `${path}${query ? `?${query}` : ""}${bridgeAnchor ? `#${bridgeAnchor}` : ""}`
}

export function masterListBridgePixel(eventSource, extra = {}){
  return {
    category: extra.category || digitalhutMasterListBridge.lane,
    keywordHint: extra.keywordHint || digitalhutMasterListBridge.proofKeywordHint,
    metadata: {
      source: eventSource,
      measurableFacet: digitalhutMasterListBridge.lane,
      universe: digitalhutMasterListBridge.universe,
      publicSitemapWindow: digitalhutMasterListBridge.publicSitemapWindow,
      ...extra.metadata
    }
  }
}
