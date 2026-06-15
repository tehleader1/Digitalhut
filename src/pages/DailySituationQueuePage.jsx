import {useEffect, useMemo, useState} from "react"
import {Link} from "react-router-dom"
import "@google/model-viewer"
import {
  createDiscoveryQueue,
  discoveryCategories,
  discoveryTabs
} from "../lib/dailySituationDiscovery"
import "./AssetLab.css"

const queueKey = "digitalhut:dailySituationQueue:v3"
const archiveKey = "digitalhut:dailySituationArchive"
const assetKey = "digitalhut:assetLab"
const accessKey = "digitalhut:dailySituationAccess"
const passcode = "!1DigitalHut71!"

function readQueue(){
  try {
    const stored = JSON.parse(window.localStorage.getItem(queueKey) || "[]")
    return Array.isArray(stored) && stored.length ? stored : createDiscoveryQueue()
  } catch {
    return createDiscoveryQueue()
  }
}

function writeQueue(items){
  window.localStorage.setItem(queueKey, JSON.stringify(items))
}

function makeAssetFromCandidate(candidate){
  const slug = `asset_${candidate.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`
  const modelUrl = candidate.relatedAsset?.url || ""
  return {
    id: `daily-render-${candidate.id}`,
    slug,
    name: candidate.title,
    type: candidate.relatedAsset?.fileType || "Generated GLB plan",
    sourceType: "daily-situation-report",
    source: "DigitalHut Daily Situation Discovery",
    url: modelUrl,
    convertedUrl: modelUrl,
    convertedGlbUrl: modelUrl,
    optimizedGlbUrl: modelUrl,
    oldFileUrl: candidate.relatedAsset?.previewThumbnail || "",
    description: `${candidate.problem}\n\nWhy it matters: ${candidate.whyItMatters}`,
    status: "Selected for 3D report render",
    progress: 100,
    visibility: "Private until published",
    zoomRate: 1,
    likes: 0,
    shares: 0,
    comments: [`Daily discovery note: ${candidate.category}. ${candidate.relatedAsset?.reasonMatched || "Generated scene plan attached."}`],
    dialogue: [candidate.voiceDraft],
    metadata: {
      location: candidate.location,
      category: candidate.category,
      confidence: candidate.confidence,
      renderIdea: candidate.renderIdea,
      solutions: candidate.solutions,
      sources: candidate.sourceNotes,
      assetMatch: candidate.relatedAsset,
      generatedScene: !modelUrl,
      generatedSceneType: candidate.glbSceneType
    },
    createdAt: new Date().toISOString()
  }
}

function saveAssetForCandidate(candidate, patch = {}){
  const asset = {...makeAssetFromCandidate(candidate), ...patch}
  const currentAssets = JSON.parse(window.localStorage.getItem(assetKey) || "[]")
  window.localStorage.setItem(assetKey, JSON.stringify([asset, ...currentAssets.filter((item) => item.slug !== asset.slug)].slice(0, 60)))
  return asset
}

function sceneClass(candidate){
  const text = `${candidate?.glbSceneType || ""} ${candidate?.category || ""} ${candidate?.title || ""}`.toLowerCase()
  if(text.includes("airport")) return "airport"
  if(text.includes("weather") || text.includes("storm") || text.includes("forecast")) return "weather"
  if(text.includes("website") || text.includes("scam") || text.includes("complaint")) return "website"
  if(text.includes("health") || text.includes("contact") || text.includes("outbreak")) return "health"
  if(text.includes("environment") || text.includes("sensor") || text.includes("pollution")) return "environment"
  if(text.includes("workforce") || text.includes("construction") || text.includes("project")) return "workforce"
  return "map"
}

function GeneratedSituationScene({candidate}){
  return <div className={`dh-generated-situation-scene ${sceneClass(candidate)}`}>
    <div className="dh-situation-sky" />
    <div className="dh-situation-grid" />
    <div className="dh-situation-primary"><b>{candidate.location}</b><span>{candidate.glbSceneType}</span></div>
    <div className="dh-situation-path"><i />{candidate.category}</div>
    <div className="dh-situation-marker one" />
    <div className="dh-situation-marker two" />
    <div className="dh-situation-marker three" />
    <div className="dh-situation-card"><b>{candidate.title}</b><span>{candidate.renderIdea}</span></div>
    <div className="dh-situation-card secondary"><b>Safety / Solution</b><span>{candidate.solutions?.[0] || "Verify before publishing"}</span></div>
  </div>
}

export default function DailySituationQueuePage(){
  const [items, setItems] = useState(readQueue)
  const [tab, setTab] = useState("Morning Live Report")
  const [activeId, setActiveId] = useState(items[0]?.id || "")
  const [code, setCode] = useState("")
  const [unlocked, setUnlocked] = useState(() => window.localStorage.getItem(accessKey) === "yes")
  const active = items.find((item) => item.id === activeId) || items[0]

  useEffect(() => writeQueue(items), [items])

  const visible = useMemo(() => {
    if(tab === "Morning Live Report") return items.filter((item) => item.tags?.includes("morning") || item.category === "International Incidents").slice(0, 4)
    if(tab === "Suggested Today") return items.filter((item) => !["Published", "Archived"].includes(item.status))
    if(tab === "High Priority") return items.filter((item) => item.priority === "High Priority" || item.confidence >= 80)
    if(tab === "International Incidents") return items.filter((item) => ["International Incidents", "Researcher Science", "Weather", "Scams", "Overpromising Websites"].includes(item.category) || item.location.toLowerCase().includes("international"))
    if(tab === "Researcher Science") return items.filter((item) => item.category === "Researcher Science")
    if(tab === "Overpromising Websites") return items.filter((item) => item.category === "Overpromising Websites")
    if(tab === "Selected for Render") return items.filter((item) => item.status === "Selected for Render")
    if(tab === "Published") return items.filter((item) => item.status === "Published")
    if(tab === "Archived") return items.filter((item) => item.status === "Archived")
    if(tab === "Scientific/Workforce") return items.filter((item) => ["Scientific/Workforce", "Workforce", "Researcher"].includes(item.category))
    return items.filter((item) => item.category === tab)
  }, [items, tab])

  function updateCandidate(id, patch){
    setItems((current) => current.map((item) => item.id === id ? {...item, ...patch} : item))
  }

  function refreshDiscovery(){
    ["digitalhut:dailySituationQueue", "digitalhut:dailySituationQueue:v2", "digitalhut:dailySituationQueue:v3"].forEach((key) => window.localStorage.removeItem(key))
    const next = createDiscoveryQueue()
    setItems(next)
    setActiveId(next[0]?.id || "")
    setTab("Morning Live Report")
  }

  function refreshActiveRenderer(){
    const refreshed = createDiscoveryQueue()
    const current = refreshed.find((item) => item.id === active?.id) || refreshed.find((item) => item.title === active?.title) || refreshed[0]
    setItems(refreshed)
    setActiveId(current?.id || "")
  }

  function renderThis(candidate){
    const asset = saveAssetForCandidate(candidate)
    updateCandidate(candidate.id, {status: "Selected for Render", selectedAssetId: asset.id, publicAssetSlug: asset.slug, renderedModelUrl: asset.url})
  }

  function publish(candidate){
    const asset = saveAssetForCandidate(candidate, {status: "Published 3D report", visibility: "Share link live"})
    const published = {...candidate, status: "Published", publishedAt: new Date().toISOString(), selectedAssetId: asset.id, publicAssetSlug: asset.slug, renderedModelUrl: asset.url}
    updateCandidate(candidate.id, published)
    const archive = JSON.parse(window.localStorage.getItem(archiveKey) || "[]")
    window.localStorage.setItem(archiveKey, JSON.stringify([published, ...archive].slice(0, 100)))
  }

  function unlock(){
    if(code !== passcode){
      setCode("")
      return
    }
    window.localStorage.setItem(accessKey, "yes")
    setUnlocked(true)
  }

  if(!unlocked){
    return <main className="dh-backend-page">
      <section className="dh-public-asset dh-owner-gate">
        <p>Exclusive DigitalHut Backend</p>
        <h1>Daily Situation Discovery</h1>
        <p>This private backend controls international real-world incidents, weather issues, scammy or overpromising websites, and tourist congestion reports before they become public 3D stories.</p>
        <div className="dh-backend-panel">
          <label>Passcode<input value={code} onChange={(event) => setCode(event.target.value)} onKeyDown={(event) => {if(event.key === "Enter") unlock()}} placeholder="Enter backend passcode" /></label>
          <button className="dh-backend-btn hot" type="button" onClick={unlock}>Unlock Daily Backend</button>
        </div>
        <Link className="dh-backend-btn" to="/">Return to Main System</Link>
      </section>
    </main>
  }

  return <main className="dh-backend-page">
    <header className="dh-backend-header">
      <div>
        <p>Exclusive DigitalHut Intelligence Backend</p>
        <h1>Daily International Real-World Reports</h1>
        <p>Private queue for morning international reports, real-world incidents, weather issues, scammy or overpromising websites, tourist congestion, and researcher science scenarios. Each candidate attempts to attach a usable 3D/GLB asset before Anthony chooses what becomes public.</p>
      </div>
      <nav className="dh-backend-nav">
        <Link to="/">Main System</Link>
        <Link to="/asset-lab">Asset Lab</Link>
        <button className="dh-backend-btn hot" type="button" onClick={refreshDiscovery}>Run Discovery</button>
      </nav>
    </header>

    <section className="dh-system-map">
      {discoveryCategories.map((item) => <span key={item}>{item}</span>)}
    </section>

    <div className="dh-backend-tabs">
      {discoveryTabs.map((item) => <button key={item} className={tab === item ? "active" : ""} type="button" onClick={() => setTab(item)}>{item}</button>)}
    </div>

    <section className="dh-backend-grid daily">
      <div className="dh-backend-panel dh-profile-list">
        <h2>{tab}</h2>
        {visible.map((item) => <button key={item.id} className={`dh-library-card ${item.id === active?.id ? "active" : ""}`} type="button" onClick={() => setActiveId(item.id)}>
          <b>{item.title}</b>
          <span>{item.location} / {item.category}</span>
          <small>{item.confidence}% confidence / {item.assetMatchStatus}</small>
        </button>)}
      </div>

      <div className="dh-backend-panel">
        <h2>Candidate Report Card</h2>
        {active && <>
          <div className="dh-report-card">
            <b>{active.title}</b>
            <span>{active.problem}</span>
            <span><strong>Location:</strong> {active.location}</span>
            <span><strong>Why it matters:</strong> {active.whyItMatters}</span>
            <span><strong>Render idea:</strong> {active.renderIdea}</span>
            <span><strong>Suggested GLB scene:</strong> {active.glbSceneType}</span>
            <span><strong>Solutions:</strong> {active.solutions.join(" / ")}</span>
            <span><strong>Sources:</strong> {active.sourceNotes.join(" / ")}</span>
            <span><strong>Developer note:</strong> This is an editor/researcher/publisher decision. Render only if it helps people understand the situation faster.</span>
          </div>
          <div className="dh-asset-actions">
            <button type="button" onClick={() => renderThis(active)}>Render This</button>
            <button type="button" onClick={() => updateCandidate(active.id, {status: "Saved for Later"})}>Save for Later</button>
            <button type="button" onClick={() => updateCandidate(active.id, {status: "Archived"})}>Ignore</button>
            <button type="button" onClick={() => updateCandidate(active.id, {status: "Needs Verification"})}>Needs Verification</button>
            <button type="button" onClick={() => updateCandidate(active.id, {voiceDraft: `${active.voiceDraft} DigitalHut AI will keep the report practical and safety-first.`})}>Generate Voice</button>
            <button type="button" onClick={() => publish(active)}>Publish Report</button>
            <button type="button" onClick={refreshActiveRenderer}>Refresh Live Renderer</button>
          </div>
        </>}
      </div>

      <div className="dh-backend-panel">
        <h2>Complete Live Report Renderer</h2>
        {active?.relatedAsset && <>
          <div className="dh-situation-renderer">
            {active.relatedAsset.url ? <model-viewer src={active.relatedAsset.url} poster={active.relatedAsset.previewThumbnail || ""} camera-controls auto-rotate auto-rotate-delay="400" rotation-per-second="8deg" camera-orbit="35deg 60deg auto" field-of-view="34deg" exposure="1" reveal="auto" /> : <GeneratedSituationScene candidate={active} />}
          </div>
          {active.relatedAsset.previewThumbnail && <img className="dh-match-thumb" src={active.relatedAsset.previewThumbnail} alt="" />}
          <div className="dh-report-card">
            <b>{active.relatedAsset.closestGlb}</b>
            <span><strong>Asset ID:</strong> {active.relatedAsset.assetId || "new-scene-plan"}</span>
            <span><strong>File type:</strong> {active.relatedAsset.fileType}</span>
            <span><strong>Match confidence:</strong> {active.relatedAsset.matchConfidence}%</span>
            <span><strong>Reason matched:</strong> {active.relatedAsset.reasonMatched}</span>
            <span><strong>Freshness:</strong> {active.relatedAsset.freshness}</span>
            <span><strong>Status:</strong> {active.assetMatchStatus}</span>
            {active.publicAssetSlug && <span><strong>Public preview:</strong> <Link to={`/${active.publicAssetSlug}`}>/{active.publicAssetSlug}</Link></span>}
            <span><strong>Current GLB:</strong> {active.renderedModelUrl || active.relatedAsset.url || "Generated situation scene"}</span>
          </div>
          <div className="dh-asset-actions">
            <button type="button" onClick={() => renderThis(active)}>Use This Asset</button>
            <button type="button" onClick={() => updateCandidate(active.id, {assetMatchStatus: "Choose another asset"})}>Choose Another</button>
            <button type="button" onClick={() => updateCandidate(active.id, {assetMatchStatus: "Generate new scene"})}>Generate New</button>
            <button type="button" onClick={refreshActiveRenderer}>Refresh Live Renderer</button>
          </div>
        </>}
        <h2>AI Voice Draft</h2>
        <p>{active?.voiceDraft}</p>
      </div>
    </section>
  </main>
}
