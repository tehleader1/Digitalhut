import {Link} from "react-router-dom"
import "./AssetLab.css"

export default function UpdatesPage(){
  return <main className="dh-backend-page"><section className="dh-public-asset"><h1>Updates</h1><p>DigitalHut system updates, backend asset queue notes, and release status will live here.</p><Link className="dh-backend-btn" to="/">Main System</Link></section></main>
}
