import {Link} from "react-router-dom"
import "./AssetLab.css"

export default function InsightsPage(){
  return <main className="dh-backend-page"><section className="dh-public-asset"><h1>Insights</h1><p>Analytics, A/B testing, SEO asset signals, and model engagement readouts are reserved for the backend dashboard.</p><Link className="dh-backend-btn" to="/asset-lab">Open Asset Lab</Link></section></main>
}
