import {Link} from "react-router-dom"
import "../pages/AssetLab.css"

export default function ObservatoryScanner(){
  return <main className="dh-backend-page"><section className="dh-public-asset"><h1>Observatory Scanner</h1><p>The scanner lane is staged for backend verification, SEO asset checks, and live GLB readiness scans.</p><Link className="dh-backend-btn" to="/asset-lab">Open Asset Lab</Link></section></main>
}
