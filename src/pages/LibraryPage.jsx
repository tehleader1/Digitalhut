import {Link} from "react-router-dom"
import "./AssetLab.css"

export default function LibraryPage(){
  return <main className="dh-backend-page">
    <section className="dh-public-asset">
      <h1>Profile Library</h1>
      <p>Saved DigitalHut assets, comments, descriptions, source types, and share links are managed in Asset Lab.</p>
      <div className="dh-backend-nav"><Link to="/asset-lab">Open Asset Lab</Link><Link to="/">Main System</Link></div>
    </section>
  </main>
}
