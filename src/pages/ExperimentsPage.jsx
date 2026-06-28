import {useMemo, useState} from "react"
import {Link} from "react-router-dom"
import "./TrustPage.css"
import "./ExperimentsPage.css"

const modelTracks = [
  {
    id: "seo-engine",
    label: "SEO Observatory Engine",
    status: "active",
    risk: "low",
    summary: "Turns verified GLB assets, blogs, ratings, backlinks, and category pages into long-term search surface.",
    revenue: "organic traffic, sponsors, affiliate links, asset pages",
    signals: ["blog releases", "indexed asset pages", "backlinks", "ratings", "search clicks"],
    nextAction: "Publish verified renderable assets with source labels, reviews, and category backlinks."
  },
  {
    id: "contract-redlining",
    label: "Contract Redlining Lab",
    status: "private-beta",
    risk: "medium",
    summary: "Helps compare asset licensing, sponsor terms, creator commission language, and subscription clauses.",
    revenue: "creator onboarding, sponsor deals, safer licensing workflow",
    signals: ["contracts reviewed", "risk notes", "license clarity", "creator acceptance"],
    nextAction: "Keep this as review assistance only; require human/legal review before signing."
  },
  {
    id: "subscriptions",
    label: "Subscription Access",
    status: "active",
    risk: "low",
    summary: "Standard, Premium, and Pro access for history, AI detail depth, backend tools, nodes, and downloads.",
    revenue: "monthly/yearly paid tiers",
    signals: ["wallet connects", "tier clicks", "checkout starts", "confirmed receipts"],
    nextAction: "Test wallet flow with low-value transactions and store verified subscription records."
  },
  {
    id: "commission-assets",
    label: "Commissioned Real-World GLB Assets",
    status: "active",
    risk: "medium",
    summary: "Pays creators or field teams for real places, scans, drone captures, research models, and commercial scenes.",
    revenue: "asset licensing, sponsor campaigns, premium downloads, local business demos",
    signals: ["asset quality", "render success", "views", "downloads", "creator payout margin"],
    nextAction: "Track cost per usable GLB and revenue per asset page before scaling payouts."
  },
  {
    id: "sponsor-lanes",
    label: "Sponsor Lanes",
    status: "active",
    risk: "low",
    summary: "Brands sponsor categories, reports, asset pages, research feeds, or real-world presentation missions.",
    revenue: "sponsor placements, featured category campaigns, local business showcases",
    signals: ["sponsor interest", "clicks", "asset views", "lead forms", "category retention"],
    nextAction: "Offer sponsor attachment on verified high-quality assets only."
  },
  {
    id: "database-intelligence",
    label: "Database Intelligence",
    status: "active",
    risk: "low",
    summary: "Supabase/FireCuda records what assets load, fail, get rated, get shared, and create backlinks.",
    revenue: "better recommendations, retention, creator analytics, premium insights",
    signals: ["load success", "failed URLs", "ratings", "reviews", "repeat category use"],
    nextAction: "Make source-level tracking visible on every asset and feed."
  },
  {
    id: "cloud-rendering",
    label: "Cloud Rendering / Conversion",
    status: "research",
    risk: "medium",
    summary: "Paid backend conversion and optimization of OBJ, FBX, STL, scans, images, and raw GLB into web-ready GLB.",
    revenue: "conversion fees, backend editor access, Pro workflow",
    signals: ["uploads", "conversion success", "queue completion", "thumbnail generation"],
    nextAction: "Use backend workers and storage queues, not visitor devices."
  },
  {
    id: "mining-research",
    label: "Mining / Compute Research",
    status: "restricted-research",
    risk: "high",
    summary: "Explores whether compute contribution, render credits, or third-party cloud-mining economics fit DigitalHut.",
    revenue: "only if explicit opt-in, legally reviewed, and economically useful",
    signals: ["opt-in consent", "compute cost", "user trust", "lag impact", "legal review"],
    nextAction: "Do not mine in browser. Model it as opt-in credits or separate provider research only."
  }
]

const defaultSignals = {
  attention: 68,
  trust: 55,
  revenue: 44,
  compliance: 72,
  rendererFit: 81
}

function riskPenalty(risk){
  if(risk === "high") return 35
  if(risk === "medium") return 14
  return 3
}

function statusBoost(status){
  if(status === "active") return 12
  if(status === "private-beta") return 5
  if(status === "research") return 0
  return -8
}

function scoreTrack(track, signals){
  const base = (
    signals.attention * 0.22 +
    signals.trust * 0.22 +
    signals.revenue * 0.2 +
    signals.compliance * 0.18 +
    signals.rendererFit * 0.18
  )
  const score = Math.max(0, Math.min(100, Math.round(base + statusBoost(track.status) - riskPenalty(track.risk))))
  return score
}

function scoreLabel(score){
  if(score >= 76) return "Surface Now"
  if(score >= 55) return "Keep Testing"
  if(score >= 35) return "Private Lab"
  return "Hold"
}

export default function ExperimentsPage(){
  const [signals, setSignals] = useState(defaultSignals)
  const scoredTracks = useMemo(() => (
    modelTracks
      .map((track) => ({...track, score: scoreTrack(track, signals)}))
      .sort((a, b) => b.score - a.score)
  ), [signals])
  const winner = scoredTracks[0]

  function updateSignal(key, value){
    setSignals((current) => ({...current, [key]: Number(value)}))
  }

  return <main className="dh-trust-page dh-experiment-page">
    <header className="dh-trust-nav">
      <Link to="/">DigitalHut</Link>
      <nav>
        <Link to="/experiments">Experiments</Link>
        <Link to="/locations">Locations</Link>
        <Link to="/markets">Markets</Link>
        <Link to="/insights">Insights</Link>
        <Link to="/blog">Blog</Link>
      </nav>
    </header>

    <section className="dh-trust-intro dh-experiment-hero">
      <span>DigitalHut Model Observatory</span>
      <h1>Run Every Business Model As A Measured Track</h1>
      <p>DigitalHut should define itself through the observatory experience. This page compares SEO, redlining assistance, subscriptions, commissioned GLB assets, sponsor lanes, database intelligence, cloud rendering, and mining research without forcing the company into one bottleneck too early.</p>
    </section>

    <section className="dh-experiment-winner">
      <div>
        <span>Current Best Fit</span>
        <h2>{winner.label}</h2>
        <p>{winner.summary}</p>
      </div>
      <strong>{winner.score}/100</strong>
    </section>

    <section className="dh-experiment-controls" aria-label="Experiment scoring inputs">
      {Object.entries(signals).map(([key, value]) => (
        <label key={key}>
          <span>{key.replace(/[A-Z]/g, (letter) => ` ${letter}`).trim()}</span>
          <input type="range" min="0" max="100" value={value} onChange={(event) => updateSignal(key, event.target.value)} />
          <b>{value}</b>
        </label>
      ))}
    </section>

    <section className="dh-experiment-grid">
      {scoredTracks.map((track) => (
        <article key={track.id} className={`dh-experiment-card risk-${track.risk}`}>
          <header>
            <div>
              <span>{track.status}</span>
              <h2>{track.label}</h2>
            </div>
            <strong>{track.score}</strong>
          </header>
          <p>{track.summary}</p>
          <dl>
            <dt>Revenue Path</dt>
            <dd>{track.revenue}</dd>
            <dt>Signals Watched</dt>
            <dd>{track.signals.join(" / ")}</dd>
            <dt>Next Action</dt>
            <dd>{track.nextAction}</dd>
          </dl>
          <footer>{scoreLabel(track.score)}</footer>
        </article>
      ))}
    </section>

    <section className="dh-experiment-policy">
      <h2>Mining Boundary</h2>
      <p>DigitalHut must not silently mine through visitor browsers or devices. Any compute or mining-adjacent experiment must be explicit opt-in, disclosed, rate-limited, legally reviewed, and separated from the public renderer so the site remains fast and trustworthy.</p>
    </section>
  </main>
}
