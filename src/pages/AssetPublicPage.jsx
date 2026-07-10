import {Link, useParams} from "react-router-dom"
import {useEffect} from "react"
import {loadModelViewer} from "../lib/modelViewerRuntime"
import "./AssetLab.css"

const storageKey = "digitalhut:assetLab"

function readAssets(){
  try {
    const items = JSON.parse(window.localStorage.getItem(storageKey) || "[]")
    return Array.isArray(items) ? items : []
  } catch {
    return []
  }
}

export default function AssetPublicPage(){
  const {slug} = useParams()
  const lookupSlug = slug?.startsWith("asset_") ? slug : `asset_${slug}`
  const asset = readAssets().find((item) => item.slug === lookupSlug || item.slug === slug) || readAssets()[0]

  useEffect(() => {
    loadModelViewer()
  }, [])

  if(!asset){
    return <main className="dh-backend-page"><section className="dh-public-asset"><h1>Asset not published yet</h1><p>This DigitalHut model link is waiting for backend publishing.</p><Link className="dh-backend-btn" to="/asset-lab">Open Asset Lab</Link></section></main>
  }

  return <main className="dh-backend-page">
    <section className="dh-public-asset">
      <Link className="dh-backend-btn" to="/asset-lab">DigitalHut Asset Lab</Link>
      <h1>{asset.name}</h1>
      <p>{asset.description}</p>
      <div className="dh-public-grid">
        <div className="dh-public-card">
          <model-viewer className="dh-asset-viewer public" src={asset.url} camera-controls auto-rotate auto-rotate-delay="400" rotation-per-second="8deg" camera-orbit="35deg 60deg auto" field-of-view="34deg" exposure="1" reveal="auto" />
        </div>
        <div className="dh-public-card">
          <h2>AI Spoken Demo</h2>
          <div className="dh-public-meta">
            <span>{asset.dialogue?.[0]}</span>
            <span>{asset.dialogue?.[1]}</span>
            <span>{asset.dialogue?.[2]}</span>
            <span>Current public mode: AI speaks and presents this one model. Full editable demo creation is coming soon.</span>
            {asset.sponsor?.name && <span>Sponsored by {asset.sponsor.name}: {asset.sponsor.placement}</span>}
            <b>{asset.status}</b>
            <small>{asset.type} / {asset.source}</small>
          </div>
        </div>
      </div>
    </section>
  </main>
}
