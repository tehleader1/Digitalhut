import {Link} from "react-router-dom"
import "./AssetLab.css"

export default function FaqPage(){
  return <main className="dh-backend-page"><section className="dh-public-asset">
    <h1>FAQ</h1>
    <p>DigitalHut presents GLB models with AI narration, guided camera movement, notes, sharing, backend asset preparation, and the Backend Blink talent system.</p>
    <div className="dh-public-grid">
      <article className="dh-public-card">
        <h2>Talent tree secret</h2>
        <p>Tell the AI Director to check a node by name. Example: <b>Stellar Node Progress</b>. DigitalHut will open the Backend Blink System and pulse the exact node progress view.</p>
      </article>
      <article className="dh-public-card">
        <h2>Unlock rules</h2>
        <p>Major nodes require at least 5 active days, 4+ hours per day, renderer proof, notes, voice reactions, backend contribution, public reactions, backlinks, and safe publishing behavior.</p>
      </article>
      <article className="dh-public-card">
        <h2>Node purchases</h2>
        <p>Node purchases fund a one-year experience window such as Stellar, 360 Guru, Genius Real Estate, or Pure Researcher. Checkout must verify wallet, chain, amount, and subscription status before real access is granted.</p>
      </article>
      <article className="dh-public-card">
        <h2>Wellness boundary</h2>
        <p>Reset builds can support creativity and mood through beautiful saved renderer sessions. They are entertainment and wellness support, not medical treatment or crisis care.</p>
      </article>
    </div>
    <Link className="dh-backend-btn" to="/">Main System</Link>
  </section></main>
}
