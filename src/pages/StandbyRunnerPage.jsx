import {useEffect} from "react"
import {Link} from "react-router-dom"
import "./StandbyRunnerPage.css"

export default function StandbyRunnerPage(){
  useEffect(() => {
    const previousTitle = document.title
    document.title = "DigitalHut Productions"
    return () => { document.title = previousTitle }
  }, [])

  return <main className="dh-production-standby" aria-label="DigitalHut Productions standby screen">
    <div className="dh-production-stars" aria-hidden="true" />
    <div className="dh-production-orbit orbit-one" aria-hidden="true" />
    <div className="dh-production-orbit orbit-two" aria-hidden="true" />
    <div className="dh-production-glow" aria-hidden="true" />

    <section className="dh-production-title-card">
      <span className="dh-production-mark" aria-hidden="true">DH</span>
      <p>Real-time multimedia AI observatory</p>
      <h1>DigitalHut<br /><strong>Productions</strong></h1>
      <div className="dh-production-signal" aria-label="Presentation ready">
        <i aria-hidden="true" />
        <span>Presentation ready</span>
      </div>
      <nav aria-label="Standby actions">
        <Link to="/">Enter DigitalHut</Link>
        <Link to="/updates">Latest productions</Link>
      </nav>
    </section>

    <footer>
      <span>Video</span><b aria-hidden="true">•</b><span>3D</span><b aria-hidden="true">•</b><span>Voice</span><b aria-hidden="true">•</b><span>Live intelligence</span>
    </footer>
  </main>
}
