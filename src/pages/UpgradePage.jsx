import {Link} from "react-router-dom"
import "./AssetLab.css"
import "./UpgradePage.css"

const systemStats = [
  {label:"Live drive", value:"Seagate FireCuda X Vault", detail:"8 TB USB archive and media staging drive"},
  {label:"Workspace", value:"D:\\Digitalhut\\Digitalhut-main", detail:"Production source copy staged on the FireCuda"},
  {label:"Presentation", value:"Video, GLB, podcast, AI analytics", detail:"Built for live observatory demos and asset review"},
  {label:"Deploy mode", value:"Vercel static build", detail:"Large GLB libraries stay API/storage-first for fast production loads"}
]

export default function UpgradePage(){
  return (
    <main className="dh-upgrade-page">
      <section className="dh-upgrade-hero">
        <div>
          <p className="dh-upgrade-kicker">DigitalHut system upgrade</p>
          <h1>FireCuda live presentation stack</h1>
          <p>
            The site is staged for the new computer system with FireCuda-backed
            media organization, live GLB presentation lanes, podcast-ready
            content flow, and moving analytics for the observatory experience.
          </p>
          <div className="dh-upgrade-actions">
            <Link className="dh-upgrade-primary" to="/">Main System</Link>
            <Link className="dh-upgrade-secondary" to="/asset-lab">Asset Lab</Link>
          </div>
        </div>
      </section>

      <section className="dh-upgrade-grid" aria-label="System upgrade status">
        {systemStats.map((item) => (
          <article className="dh-upgrade-card" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <p>{item.detail}</p>
          </article>
        ))}
      </section>
    </main>
  )
}
