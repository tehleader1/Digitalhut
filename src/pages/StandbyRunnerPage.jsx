import {useEffect, useMemo, useState} from "react"
import {Link} from "react-router-dom"
import "./TrustPage.css"
import "./InsightsPage.css"
import "./StandbyRunnerPage.css"

const fallbackStatus = {
  generatedAt: "",
  mode: "DigitalHut Backend SEO Standby System",
  limitation: "Standby status is loading from the local system packet.",
  systemLoop: [
    {id: "firecuda", label: "FireCuda", status: "staging-ground", job: "Hold raw keyword maps, system reports, GLB evidence, screenshots, and cycle history."},
    {id: "seo-master-list", label: "SEO Master List", status: "keyword-engine", job: "Turn ideas into ranked long-tail targets, proof pages, blog posts, and category lanes."},
    {id: "supabase", label: "Supabase", status: "memory-and-pixel-store", job: "Store views, searches, GLB plays, podcast interrupts, backlinks, assets, and user signals."},
    {id: "google-cloud", label: "Google Cloud", status: "media-intelligence", job: "Feed YouTube discovery, transcript/metadata analysis, Speech/TTS, and cloud backup."},
    {id: "github", label: "GitHub", status: "source-control", job: "Preserve code, SEO docs, route changes, and rollback points."},
    {id: "vercel", label: "Vercel", status: "public-runtime", job: "Deploy the observatory, APIs, sitemap, proof pages, and public status surfaces."},
    {id: "compare-refine", label: "Compare & Contrast", status: "feedback-loop", job: "Compare page behavior against the master SEO list and improve the winners."},
    {id: "rinse-repeat", label: "Rinse & Repeat", status: "next-cycle", job: "Promote winners, rewrite weak lanes, refresh episodes, and queue the next batch."}
  ],
  taskSplit: {
    simultaneousSupportMode: {
      label: "Simultaneous Support Mode",
      job: "Run the mundane SEO checks beside live engineering so measurements, FireCuda map updates, proof counts, and refinement queues stay ready while advanced code and entertainment-SEO upgrades are being made."
    },
    mundaneBackendLayer: [
      {id: "refresh-seo-packet", task: "Refresh status JSON, docs, sitemap counts, route counts, and readiness markers."},
      {id: "compare-metrics", task: "Compare the master list against page views, GLB plays, podcast starts, blog views, searches, and market opens."},
      {id: "queue-refinement", task: "Turn weak signals into the next SEO cycle queue without manual bookkeeping."},
      {id: "firecuda-map-hygiene", task: "Keep FireCuda staging useful for keyword movement, proof docs, backlinks, and reports."},
      {id: "cloud-space-check", task: "Keep Vercel, Supabase, Google Cloud, and sitemap proof visible with room to breathe."}
    ],
    liveEngineeringLayer: [
      {id: "advanced-code-structure", task: "Upgrade entertainment dapp structure, renderer controls, API lanes, and frontend/backend integration."},
      {id: "seo-entertainment-intertwine", task: "Intertwine SEO into video, GLB, podcast, market, blog, watch, category, and sitemap surfaces."},
      {id: "refinement-judgment", task: "Compare the last master list against measured data and choose what gets promoted, rewritten, or removed."},
      {id: "firecuda-strategy", task: "Use the FireCuda map as the strategic staging ground for latest SEO measurements and proof routes."}
    ]
  },
  mundanePipeline: [
    {id: "firecuda", label: "FireCuda SEO Map", job: "Stage everyday people, international side markets, backlink sources, proof routes, and keyword movement history.", outputs: ["human keyword lanes", "international side markets", "proof route targets"]},
    {id: "seo-master-list", label: "SEO Master List", job: "Turn FireCuda findings into long-tail clusters for episodes, watch routes, blog proof, sponsor moments, and category pages.", outputs: ["ranked phrases", "episode placements", "rewrite queue"]},
    {id: "supabase", label: "Supabase Analytics Memory", job: "Track how people use the observatory and reflect those signals back into the SEO map.", outputs: ["feature events", "human role tags", "usefulness scores"]},
    {id: "google-cloud", label: "Google Cloud Infrastructure", job: "Keep YouTube discovery, metadata, Speech/TTS, cloud backup, quota checks, and developer proof credible.", outputs: ["media packets", "cloud readiness", "developer proof"]},
    {id: "github-vercel", label: "GitHub And Vercel Release Path", job: "Keep code history and public deployment aligned so the live dapp matches the local proof.", outputs: ["source history", "deploy checks", "release notes"]},
    {id: "compare-contrast", label: "Compare And Contrast", job: "Read old and new builds, then decide what is lagging, improving, or ready for the next SEO push.", outputs: ["lag signals", "winner signals", "next FireCuda input"]}
  ],
  fireCudaKeywordMap: [
    {lane: "Everyday Home And Family", roles: ["parent", "home project buyer", "family creator"], internationalMarkets: ["US suburbs", "UK flats", "Canada renovation"], longTailSeeds: ["funny grocery reel visual experience", "home project 3d visual experience before buying"]},
    {lane: "3D Visual Experience And Creator Media", roles: ["creator", "3D artist", "podcast producer"], internationalMarkets: ["TikTok creators", "Instagram Reels", "YouTube Shorts"], longTailSeeds: ["ai guided 3d visual experience for social media reels", "podcast speaker moment visual analytics"]},
    {lane: "Research And Developer Study", roles: ["developer", "researcher", "student"], internationalMarkets: ["US university search", "European labs", "India developer market"], longTailSeeds: ["coral reef study 2026 3d visual experience", "developer dapp observatory backend proof"]}
  ],
  supabaseAnalyticsCoverage: ["page_view", "unique_visitor", "autoplay_start", "youtube_search_submit", "search_intent_chip_select", "quick_panel_select", "glb_preview_open", "glb_preview_collapse", "podcast_interrupt_start", "market_panel_open", "wallet_render_check", "blog_route_open", "backlink_source_open"],
  supabaseMeasurementContract: {
    status: "measurement-ready",
    eventCount: 10,
    statusCounts: {"closed-loop": 10},
    immediateGaps: [],
    events: [
      {canonicalEvent: "page_view", feature: "Page and proof-route visibility", coverageStatus: "closed-loop", seoDecision: "Decides whether a route deserves more internal links, better title copy, or FireCuda hold."},
      {canonicalEvent: "search_run", feature: "Search intent", coverageStatus: "closed-loop", seoDecision: "Promotes exact typed phrases from FireCuda into watch/blog/category proof."},
      {canonicalEvent: "backlink_source_open", feature: "Source and backlink trust", coverageStatus: "closed-loop", seoDecision: "Identifies which source links help the observatory look useful instead of decorative."}
    ]
  },
  seoSubmissionQueueSummary: {
    status: "submission-staged",
    immediateSubmissionCount: 13,
    supportRouteCount: 18,
    fireCudaHeldRankSlots: 2572944,
    queuedCandidates: 180,
    guardrail: "Do not create millions of thin pages. Submit the sitemap and strongest proof routes; materialize rank slots only when Supabase behavior separates real demand.",
    batches: []
  },
  aiSearchDiscoverySummary: {
    read: "A 2026 dapp entertainment observatory that connects video topics, 3D/GLB context, podcast/source moments, market panels, watch proof, blog proof, and long-tail search routes.",
    discoveryRoutes: 60,
    launchRoutes: 24,
    rankedLanes: []
  },
  rankOwnershipSummary: {
    owner: "Digitalhut.app",
    canonicalDomain: "https://www.digitalhut.app",
    totalIndividualRanks: 2572944,
    globalRange: "1-2572944",
    sampleCount: 18,
    sampleRoutes: []
  },
  deployReadinessSummary: {
    status: "hold-build-tooling",
    read: "SEO proof is staged, but local build tooling is missing in this clean folder.",
    checks: [],
    nextAction: "Repair/install local dependencies or rely on Vercel build dependencies before production deployment."
  },
  humanRoleDatabaseMap: [
    {role: "everyday viewer", meaning: "Needs a useful reason to keep watching beyond YouTube.", signals: ["autoplay_start", "quick_panel_select"]},
    {role: "researcher", meaning: "Needs source links, timeline evidence, and readable topic summaries.", signals: ["watch_route_open", "backlink_source_open"]},
    {role: "developer", meaning: "Needs cloud, API, wallet, renderer, and code proof.", signals: ["glb_source_click", "wallet_render_check"]},
    {role: "digital nomad", meaning: "Needs original long-tail topics across travel, work, research, markets, media, and proof pages.", signals: ["category_select", "blog_route_open"]}
  ],
  cloudInfrastructureChecks: [
    {area: "YouTube Data", check: "Verify topic fit before a video becomes featured."},
    {area: "Speech And TTS", check: "Feed content packets into bubble map, timeline, 3D reader, and podcast moments."},
    {area: "Developer Spotlight", check: "Expose renderer, API, sitemap, wallet, and event proof without leaking secrets."}
  ],
  decentralizedDappChecks: [
    "Wallet render path remains visible and testable in the observatory shell.",
    "Supabase holds behavior data without becoming the only proof of product value.",
    "Vercel serves the production dapp, status JSON, sitemap, blog proof, and watch proof."
  ],
  digitalNomadSeoPerspective: {
    thesis: "DigitalHut targets original long-tail searches from real people trying to understand, compare, build, travel, buy, research, or create with visual media.",
    strongestAngle: "A digital nomad SEO map connects everyday searches to video, 3D, podcast, market, research, and source-backed pages.",
    practicalRule: "Every phrase must earn a place in an episode, sponsor stack, timeline, bubble map, 3D panel, blog proof post, watch route, or backlink source."
  },
  overseerCycle: {
    operatingStack: ["FireCuda", "Supabase", "Google Cloud", "Vercel", "Compare & Contrast"],
    signals: {
      productReadiness: "loading",
      pageViews: 225,
      uniqueVisitors: 72,
      searchInteractions: 0,
      autoplayStarts: 1,
      glbPreviewPlays: 62,
      podcastInterrupts: 2,
      marketOpens: 0,
      blogViews: 14,
      sitemapUrls: 0
    },
    priority: {
      lane: "YouTube category and search",
      severity: "high",
      reason: "Search has not proven active user intent yet.",
      nextMove: "Make category and next-episode controls read as the main content radar, then map real searches into FireCuda."
    },
    activeConditions: [
      {id: "search-intent-gap", lane: "YouTube category and search", severity: "high", reason: "Search has not proven active user intent yet.", nextMove: "Map the first real searches back into FireCuda."},
      {id: "market-entry-gap", lane: "Current Market", severity: "high", reason: "Market view is built but not earning opens yet.", nextMove: "Route ticker curiosity into Current Market."}
    ],
    stackReads: [
      {layer: "FireCuda", read: "Queue the next master-list movement from the highest lag signal.", proof: "keyword map, human roles, international side markets"},
      {layer: "Supabase", read: "Capture behavior before rewriting.", proof: "feature events and human-role analytics"},
      {layer: "Google Cloud", read: "Keep media intelligence and fallback readiness credible.", proof: "media analysis packets and cloud readiness"},
      {layer: "Vercel", read: "Deploy only stable batches.", proof: "production route, status JSON, sitemap"},
      {layer: "Compare & Contrast", read: "Compare next metrics against this packet.", proof: "winner signals and lag signals"}
    ],
    overseerRead: "Current overseer call loads from the generated standby packet."
  },
  product: {},
  seoProof: {
    blogProofPosts: 0,
    watchProofRoutes: 0,
    blogRoutes: 0,
    categoryRoutes: 0,
    sitemapUrls: 0,
    systemDocs: []
  },
  compareContrastRefinement: {
    ratios: {
      glbToPageRatio: 0,
      blogToPageRatio: 0,
      podcastToGlbRatio: 0
    },
    actions: [
      {
        id: "loading-refinement",
        lane: "Compare & Contrast",
        signal: "waiting for system packet",
        reading: "Refinement board loads from the generated standby status JSON.",
        action: "Run npm run seo:standby to refresh the next cycle.",
        nextMetric: "standby status generated"
      }
    ]
  },
  operatorPerspective: {
    visitorPerspective: "Visitor perspective loads from the backend SEO status packet.",
    improveNow: ["Refresh the backend SEO packet to calculate the next improvement calls."],
    waitState: "Waiting for backend SEO status.",
    importantMoments: []
  },
  lastKnownMetrics: {
    pageViews: 225,
    uniqueVisitors: 72,
    searchInteractions: 0,
    autoplayStarts: 1,
    glbPreviewPlays: 62,
    podcastInterrupts: 2,
    marketOpens: 0,
    blogViews: 14,
    source: "last-known production metric snapshot; not live-rechecked by backend SEO standby page"
  },
  resumeQueue: []
}

function upsertJsonLd(id, payload){
  let script = document.getElementById(id)
  if(!script){
    script = document.createElement("script")
    script.id = id
    script.type = "application/ld+json"
    document.head.appendChild(script)
  }
  script.textContent = JSON.stringify(payload)
}

function statusClass(value){
  return String(value || "").toLowerCase().includes("ready") || String(value || "").toLowerCase().includes("registered") ? "ready" : "waiting"
}

const productLabelMap = {
  podcastClickSystem: "Podcast click system",
  liveProofRouteRail: "Live proof route rail",
  platformCadenceRail: "Platform cadence rail",
  platformCadenceSeoProof: "Platform cadence SEO proof",
  searchIntentRadar: "Search intent radar",
  searchIntentSeoProof: "Search intent SEO proof"
}

function productLabel(key){
  return productLabelMap[key] || key.replace(/([A-Z])/g, " $1").trim()
}

export default function StandbyRunnerPage(){
  const [status, setStatus] = useState(fallbackStatus)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    fetch("/digitalhut-standby-status.json", {headers: {Accept: "application/json"}})
      .then((response) => {
        if(!response.ok) throw new Error("Standby status packet is not deployed yet.")
        return response.json()
      })
      .then((payload) => {
        if(!cancelled) setStatus({...fallbackStatus, ...payload})
      })
      .catch((nextError) => {
        if(!cancelled) setError(nextError.message || "Unable to load standby packet")
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const title = "DigitalHut Backend SEO Standby System | Babylon Content Mover"
    const description = "Public proof page for the DigitalHut backend SEO system: Babylon renderer readiness, SEO proof counts, last-known analytics, and the next content refinement cycle."
    document.title = title
    let meta = document.querySelector('meta[name="description"]')
    if(!meta){
      meta = document.createElement("meta")
      meta.name = "description"
      document.head.appendChild(meta)
    }
    meta.content = description
    let canonical = document.querySelector('link[rel="canonical"]')
    if(!canonical){
      canonical = document.createElement("link")
      canonical.rel = "canonical"
      document.head.appendChild(canonical)
    }
    canonical.href = "https://www.digitalhut.app/standby"
    upsertJsonLd("dh-standby-runner-jsonld", {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      name: title,
      description,
      url: canonical.href,
      about: [
        "DigitalHut backend SEO system",
        "FireCuda SEO mapping",
        "SEO Master List",
        "Supabase analytics",
        "Google Cloud media intelligence",
        "GitHub source control",
        "Vercel deployment",
        "Compare and contrast refinement",
        "GLB renderer proof",
        "podcast controls",
        "sitemap metadata",
        "backend SEO content mover"
      ],
      dateModified: status.generatedAt || new Date().toISOString()
    })
  }, [status.generatedAt])

  const productEntries = useMemo(() => Object.entries(status.product || {}), [status.product])
  const metrics = status.lastKnownMetrics || fallbackStatus.lastKnownMetrics
  const proof = status.seoProof || fallbackStatus.seoProof
  const refinement = status.compareContrastRefinement || fallbackStatus.compareContrastRefinement
  const taskSplit = status.taskSplit || fallbackStatus.taskSplit
  const operatorPerspective = status.operatorPerspective || fallbackStatus.operatorPerspective
  const mundanePipeline = status.mundanePipeline || fallbackStatus.mundanePipeline
  const fireCudaKeywordMap = status.fireCudaKeywordMap || fallbackStatus.fireCudaKeywordMap
  const supabaseAnalyticsCoverage = status.supabaseAnalyticsCoverage || fallbackStatus.supabaseAnalyticsCoverage
  const supabaseMeasurementContract = status.supabaseMeasurementContract || fallbackStatus.supabaseMeasurementContract
  const seoSubmissionQueueSummary = status.seoSubmissionQueueSummary || fallbackStatus.seoSubmissionQueueSummary
  const aiSearchDiscoverySummary = status.aiSearchDiscoverySummary || fallbackStatus.aiSearchDiscoverySummary
  const rankOwnershipSummary = status.rankOwnershipSummary || fallbackStatus.rankOwnershipSummary
  const deployReadinessSummary = status.deployReadinessSummary || fallbackStatus.deployReadinessSummary
  const humanRoleDatabaseMap = status.humanRoleDatabaseMap || fallbackStatus.humanRoleDatabaseMap
  const cloudInfrastructureChecks = status.cloudInfrastructureChecks || fallbackStatus.cloudInfrastructureChecks
  const decentralizedDappChecks = status.decentralizedDappChecks || fallbackStatus.decentralizedDappChecks
  const digitalNomadSeoPerspective = status.digitalNomadSeoPerspective || fallbackStatus.digitalNomadSeoPerspective
  const overseerCycle = status.overseerCycle || fallbackStatus.overseerCycle

  return <main className="dh-trust-page dh-insights-page dh-standby-page">
    <header className="dh-trust-nav">
      <Link to="/">DigitalHut</Link>
      <nav>
        <Link to="/standby">Standby</Link>
        <Link to="/insights">Insights</Link>
        <Link to="/blog">Blog</Link>
        <Link to="/markets">Markets</Link>
        <Link to="/asset-lab">Backend</Link>
      </nav>
    </header>

    <section className="dh-trust-intro dh-standby-hero">
      <span>DigitalHut Backend SEO System</span>
      <h1>Babylon SEO Content Mover For The Observatory Dapp</h1>
      <p>This page proves what the backend SEO system keeps moving while live engineering handles higher-level work: Babylon renderer readiness, SEO proof counts, last-known page metrics, and the next pure SEO refinement cycle.</p>
      <div className="dh-standby-actions">
        <Link to="/">Open Observatory</Link>
        <Link to="/insights">Open Metrics</Link>
        <a href="/digitalhut-standby-status.json">Status JSON</a>
      </div>
    </section>

    {error && <section className="dh-insight-alert">Standby packet: {error}</section>}

    <section className="dh-standby-system-card">
      <div>
        <span>Mode</span>
        <h2>{status.mode}</h2>
        <p>{status.limitation}</p>
      </div>
      <div>
        <span>Generated</span>
        <b>{status.generatedAt || "waiting for system packet"}</b>
        <small>Run locally with npm run seo:standby</small>
      </div>
    </section>

    <section className="dh-standby-task-split" aria-label="DigitalHut backend task split">
      <header>
        <span>Task Split</span>
        <h2>Mundane SEO System Work Versus Live Engineering Work</h2>
      </header>
      <aside>
        <b>{taskSplit.simultaneousSupportMode?.label || "Simultaneous Support Mode"}</b>
        <p>{taskSplit.simultaneousSupportMode?.job}</p>
      </aside>
      <div>
        <article>
          <span>Backend SEO System Handles</span>
          <h3>Mundane Repeatable Work</h3>
          {(taskSplit.mundaneBackendLayer || []).map((item) => <section key={item.id}>
            <b>{item.id}</b>
            <p>{item.task}</p>
          </section>)}
        </article>
        <article>
          <span>Live Engineering Handles</span>
          <h3>Advanced DigitalHut Upgrades</h3>
          {(taskSplit.liveEngineeringLayer || []).map((item) => <section key={item.id}>
            <b>{item.id}</b>
            <p>{item.task}</p>
          </section>)}
        </article>
      </div>
    </section>

    <section className="dh-standby-loop" aria-label="DigitalHut professional system loop">
      <header>
        <span>Professional System Loop</span>
        <h2>FireCuda To Vercel, Then Refine And Repeat</h2>
      </header>
      <div>
        {(status.systemLoop || fallbackStatus.systemLoop).map((step, index) => <article key={step.id}>
          <small>{String(index + 1).padStart(2, "0")}</small>
          <span>{step.status}</span>
          <b>{step.label}</b>
          <p>{step.job}</p>
        </article>)}
      </div>
    </section>

    <section className="dh-standby-mundane-pipeline" aria-label="DigitalHut mundane SEO pipeline">
      <header>
        <span>Mundane Backend System</span>
        <h2>FireCuda To Supabase To Google Cloud To Vercel</h2>
      </header>
      <div>
        {mundanePipeline.map((step, index) => <article key={step.id}>
          <small>{String(index + 1).padStart(2, "0")}</small>
          <b>{step.label}</b>
          <p>{step.job}</p>
          <ul>
            {(step.outputs || []).map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>)}
      </div>
    </section>

    <section className="dh-standby-firecuda-map" aria-label="DigitalHut FireCuda keyword map">
      <header>
        <span>FireCuda SEO Map</span>
        <h2>Everyday People, International Side Markets, Original Long-Tail Lanes</h2>
      </header>
      <div>
        {fireCudaKeywordMap.map((lane) => <article key={lane.lane}>
          <b>{lane.lane}</b>
          <p><span>Roles</span> {(lane.roles || []).join(" / ")}</p>
          <p><span>Markets</span> {(lane.internationalMarkets || []).join(" / ")}</p>
          <ul>
            {(lane.longTailSeeds || []).map((seed) => <li key={seed}>{seed}</li>)}
          </ul>
        </article>)}
      </div>
    </section>

    <section className="dh-standby-data-cloud" aria-label="DigitalHut Supabase Google Cloud and dapp readiness">
      <article>
        <span>Supabase Event Coverage</span>
        <h2>Feature Tracking For Useful Behavior</h2>
        <div className="dh-standby-event-cloud">
          {supabaseAnalyticsCoverage.map((eventName) => <b key={eventName}>{eventName}</b>)}
        </div>
      </article>
      <article>
        <span>Human Role Database</span>
        <h2>How The Data Gets Read Like People</h2>
        {(humanRoleDatabaseMap || []).map((item) => <section key={item.role}>
          <b>{item.role}</b>
          <p>{item.meaning}</p>
          <small>{(item.signals || []).join(" / ")}</small>
        </section>)}
      </article>
      <article>
        <span>Google Cloud / Dapp Readiness</span>
        <h2>Infrastructure Proof</h2>
        {(cloudInfrastructureChecks || []).map((item) => <section key={item.area}>
          <b>{item.area}</b>
          <p>{item.check}</p>
        </section>)}
        <ul>
          {(decentralizedDappChecks || []).map((item) => <li key={item}>{item}</li>)}
        </ul>
      </article>
    </section>

    <section className="dh-standby-proof-engine" aria-label="DigitalHut SEO proof engine summaries">
      <article>
        <span>Supabase Measurement Contract</span>
        <h2>{supabaseMeasurementContract.status}</h2>
        <p>{supabaseMeasurementContract.eventCount} event groups / {(supabaseMeasurementContract.statusCounts && Object.entries(supabaseMeasurementContract.statusCounts).map(([key, value]) => `${value} ${key}`).join(", ")) || "waiting for counts"}</p>
        <div className="dh-standby-proof-chips">
          {(supabaseMeasurementContract.events || []).slice(0, 8).map((event) => <b key={event.canonicalEvent}>{event.canonicalEvent}: {event.coverageStatus}</b>)}
        </div>
        {(supabaseMeasurementContract.immediateGaps || []).length ? <small>{supabaseMeasurementContract.immediateGaps.length} measurement gaps remain.</small> : <small>Core behavior loop is closed.</small>}
      </article>
      <article>
        <span>SEO Submission Queue</span>
        <h2>{seoSubmissionQueueSummary.status}</h2>
        <p>{seoSubmissionQueueSummary.immediateSubmissionCount} immediate routes / {seoSubmissionQueueSummary.supportRouteCount} support routes / {Number(seoSubmissionQueueSummary.fireCudaHeldRankSlots || 0).toLocaleString()} FireCuda-held rank slots.</p>
        <div className="dh-standby-proof-chips">
          {(seoSubmissionQueueSummary.batches || []).map((batch) => <b key={batch.id}>{batch.id}: {batch.routeCount} routes</b>)}
        </div>
        <small>{seoSubmissionQueueSummary.guardrail}</small>
      </article>
      <article>
        <span>AI/Search Discovery</span>
        <h2>{aiSearchDiscoverySummary.discoveryRoutes} discovery routes</h2>
        <p>{aiSearchDiscoverySummary.read}</p>
        <div className="dh-standby-proof-chips">
          {(aiSearchDiscoverySummary.rankedLanes || []).slice(0, 6).map((lane) => <b key={lane.lane}>{lane.lane}: {lane.stage}</b>)}
        </div>
        <small>{aiSearchDiscoverySummary.launchRoutes} launch routes are staged for crawl proof.</small>
      </article>
      <article>
        <span>Rank Ownership</span>
        <h2>{Number(rankOwnershipSummary.totalIndividualRanks || 0).toLocaleString()} slots</h2>
        <p>{rankOwnershipSummary.owner} owns the deterministic range {rankOwnershipSummary.globalRange} on {rankOwnershipSummary.canonicalDomain}.</p>
        <div className="dh-standby-proof-chips">
          {(rankOwnershipSummary.sampleRoutes || []).slice(0, 4).map((sample) => <b key={`${sample.globalRankId}-${sample.sampleType}`}>{sample.globalRankId}: {sample.lane}</b>)}
        </div>
        <small>{rankOwnershipSummary.sampleCount} materialized proof samples.</small>
      </article>
      <article className={`readiness-${String(deployReadinessSummary.status || "").replace(/[^a-z0-9-]/gi, "").toLowerCase()}`}>
        <span>Deploy Readiness</span>
        <h2>{deployReadinessSummary.status}</h2>
        <p>{deployReadinessSummary.read}</p>
        <div className="dh-standby-proof-chips">
          {(deployReadinessSummary.checks || []).map((check) => <b key={check.id}>{check.id}: {check.status}</b>)}
        </div>
        <small>{deployReadinessSummary.nextAction}</small>
      </article>
    </section>

    <section className="dh-standby-nomad-perspective" aria-label="DigitalHut digital nomad SEO perspective">
      <span>Compare & Contrast Master Perspective</span>
      <h2>Original Long-Tail SEO For A Real Digital Nomad Dapp</h2>
      <p>{digitalNomadSeoPerspective.thesis}</p>
      <p>{digitalNomadSeoPerspective.strongestAngle}</p>
      <b>{digitalNomadSeoPerspective.practicalRule}</b>
    </section>

    <section className="dh-standby-overseer-cycle" aria-label="DigitalHut stack overseer cycle">
      <header>
        <span>Overseer Stack Cycle</span>
        <h2>{(overseerCycle.operatingStack || []).join(" > ")}</h2>
      </header>
      <article className="dh-standby-overseer-call">
        <span>{overseerCycle.priority?.severity || "priority"}</span>
        <b>{overseerCycle.priority?.lane || "Compare & Contrast"}</b>
        <p>{overseerCycle.overseerRead || overseerCycle.priority?.reason}</p>
        <small>{overseerCycle.priority?.nextMove}</small>
      </article>
      <div className="dh-standby-overseer-grid">
        {(overseerCycle.stackReads || []).map((item) => <article key={item.layer}>
          <span>{item.layer}</span>
          <p>{item.read}</p>
          <small>{item.proof}</small>
        </article>)}
      </div>
      <div className="dh-standby-overseer-conditions">
        {(overseerCycle.activeConditions || []).map((item) => <article key={item.id || item.lane} className={`severity-${String(item.severity || "medium").toLowerCase()}`}>
          <span>{item.severity}</span>
          <b>{item.lane}</b>
          <p>{item.reason}</p>
          <small>{item.nextMove}</small>
        </article>)}
      </div>
    </section>

    <section className="dh-standby-grid" aria-label="DigitalHut standby product readiness">
      {productEntries.map(([key, value]) => <article key={key} className={statusClass(value)}>
        <span>{productLabel(key)}</span>
        <b>{value}</b>
      </article>)}
    </section>

    <section className="dh-standby-proof">
      <article>
        <h2>SEO Proof Counts</h2>
        {[
          ["Blog/watch proof posts", proof.blogProofPosts],
          ["Watch routes", proof.watchProofRoutes],
          ["Blog routes", proof.blogRoutes],
          ["Category routes", proof.categoryRoutes],
          ["Sitemap URLs", proof.sitemapUrls]
        ].map(([label, value]) => <div className="dh-insight-kv" key={label}><span>{label}</span><b>{value}</b></div>)}
      </article>
      <article>
        <h2>Last-Known Metrics</h2>
        {[
          ["Page views", metrics.pageViews],
          ["Unique visitors", metrics.uniqueVisitors],
          ["Search interactions", metrics.searchInteractions],
          ["Autoplay starts", metrics.autoplayStarts],
          ["GLB plays", metrics.glbPreviewPlays],
          ["Podcast interrupts", metrics.podcastInterrupts],
          ["Market opens", metrics.marketOpens],
          ["Blog views", metrics.blogViews]
        ].map(([label, value]) => <div className="dh-insight-kv" key={label}><span>{label}</span><b>{value}</b></div>)}
        <p>{metrics.source}</p>
      </article>
    </section>

    <section className="dh-standby-refinement" aria-label="DigitalHut compare and contrast refinement board">
      <header>
        <span>Compare & Contrast Refinement</span>
        <h2>What The System Queues Next</h2>
      </header>
      <div className="dh-standby-ratio-grid">
        {[
          ["GLB/Page", refinement.ratios?.glbToPageRatio],
          ["Blog/Page", refinement.ratios?.blogToPageRatio],
          ["Podcast/GLB", refinement.ratios?.podcastToGlbRatio]
        ].map(([label, value]) => <article key={label}>
          <span>{label}</span>
          <b>{value ?? 0}</b>
        </article>)}
      </div>
      <div className="dh-standby-refinement-grid">
        {(refinement.actions || []).map((item) => <article key={item.id}>
          <span>{item.lane}</span>
          <b>{item.signal}</b>
          <p>{item.reading}</p>
          <strong>{item.action}</strong>
          <small>{item.nextMetric}</small>
        </article>)}
      </div>
    </section>

    <section className="dh-standby-perspective" aria-label="DigitalHut operator perspective">
      <header>
        <span>Operator Perspective</span>
        <h2>What People Are Seeing And When To Wait</h2>
      </header>
      <article className="dh-standby-perspective-main">
        <span>Visitor View</span>
        <p>{operatorPerspective.visitorPerspective}</p>
        <b>{operatorPerspective.waitState}</b>
      </article>
      <div className="dh-standby-perspective-grid">
        <article>
          <span>Improve Now</span>
          {(operatorPerspective.improveNow || []).map((item) => <p key={item}>{item}</p>)}
        </article>
        <article>
          <span>Important Moments</span>
          {(operatorPerspective.importantMoments || []).map((item) => <section key={item.id}>
            <b>{item.condition}</b>
            <p>{item.meaning}</p>
            <small>{item.jumpAction}</small>
          </section>)}
        </article>
      </div>
    </section>

    <section className="dh-standby-queue">
      <header>
        <span>SEO Cycle Queue</span>
        <h2>Next DigitalHut Content Movement Cycle</h2>
      </header>
      {(status.resumeQueue || []).map((item) => <article key={item.id} className={`priority-${String(item.priority || "medium").toLowerCase()}`}>
        <span>{item.priority} / {item.target}</span>
        <b>{item.id}</b>
        <p>{item.detail}</p>
        <small>{item.status}</small>
      </article>)}
    </section>
  </main>
}
