const receipt = {
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
  searchAnalyticsFinal: {
    rowCount: 0,
    totalClicks: 0,
    totalImpressions: 0,
    averagePosition: null
  },
  searchAnalyticsFresh: {
    rowCount: 0,
    totalClicks: 0,
    totalImpressions: 0,
    averagePosition: null
  },
  inspections: [
    {
      url: "https://www.digitalhut.app/",
      verdict: "PASS",
      coverageState: "Submitted and indexed",
      robotsTxtState: "ALLOWED",
      indexingState: "INDEXING_ALLOWED",
      lastCrawlTime: "2026-07-06T20:22:57Z",
      pageFetchState: "SUCCESSFUL"
    },
    {
      url: "https://www.digitalhut.app/watch/home-project-3d-visual-planner",
      verdict: "NEUTRAL",
      coverageState: "Discovered - currently not indexed",
      lastCrawlTime: null
    },
    {
      url: "https://www.digitalhut.app/category/mainstream-streaming",
      verdict: "NEUTRAL",
      coverageState: "Discovered - currently not indexed",
      lastCrawlTime: null
    }
  ],
  rankingTruth: "Search Console has no query rows yet; Google activity is proven by sitemap and URL inspection, not by ranking rows.",
  nextAction: "Wait for Search Console to download the expanded sitemap, then compare query/page rows against Supabase proof/source and GLB/podcast behavior."
}

export default function handler(req, res){
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600")
  res.setHeader("Content-Type", "application/json; charset=utf-8")
  return res.status(200).json(receipt)
}
