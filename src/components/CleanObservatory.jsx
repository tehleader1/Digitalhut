import { useEffect, useState } from "react"
import LiveGlbViewer from "./LiveGlbViewer"
import { getRandomObservatory } from "../lib/observatoryLibrary"

export default function CleanObservatory() {
  const [region, setRegion] = useState("north america")
  const [activeModel, setActiveModel] = useState(null)
  const [showIntro, setShowIntro] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)

  function scan(nextRegion = region) {
    const model = getRandomObservatory(nextRegion)
    setActiveModel(model)
  }

  useEffect(() => {
    const lastVisit = Number(localStorage.getItem("dh-last-renderer-visit") || 0)
    const stale = Date.now() - lastVisit > 5 * 60 * 1000

    scan(region)

    if (stale) {
      setShowIntro(true)
      const timer = setTimeout(() => {
        setShowIntro(false)
        localStorage.setItem("dh-last-renderer-visit", String(Date.now()))
      }, 1800)
      return () => clearTimeout(timer)
    }

    setShowIntro(false)
  }, [])

  function selectRegion(nextRegion) {
    setRegion(nextRegion)
    scan(nextRegion)
    setDrawerOpen(false)
  }

  return (
    <main className="dh-shell">
      <style>{`
        html, body, #root {
          margin: 0;
          width: 100%;
          min-height: 100%;
          background: #020617;
          overflow-x: hidden;
        }

        .dh-shell {
          position: relative;
          width: 100vw;
          min-height: 100vh;
          background: #020617;
          color: white;
          font-family: system-ui, sans-serif;
          overflow: hidden;
        }

        .dh-renderer-wrap {
          position: fixed;
          inset: 0;
          z-index: 1;
          background: #000;
        }

        .dh-renderer-frame,
        .dh-renderer-empty {
          width: 100vw;
          height: 100vh;
          min-height: 100vh;
          border: none;
          border-radius: 0;
          background: #000;
        }

        .dh-renderer-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          font-size: 18px;
        }

        .dh-top-chip {
          position: fixed;
          top: 12px;
          left: 12px;
          right: 12px;
          z-index: 5;
          display: flex;
          align-items: center;
          gap: 10px;
          pointer-events: none;
        }

        .dh-brand {
          pointer-events: auto;
          padding: 10px 14px;
          border-radius: 999px;
          background: rgba(2, 6, 23, .58);
          border: 1px solid rgba(45, 212, 191, .25);
          backdrop-filter: blur(14px);
          font-weight: 900;
          box-shadow: 0 14px 40px rgba(0,0,0,.35);
        }

        .dh-mode {
          pointer-events: auto;
          margin-left: auto;
          padding: 10px 14px;
          border-radius: 999px;
          background: rgba(6, 182, 212, .16);
          border: 1px solid rgba(103, 232, 249, .25);
          color: #a5f3fc;
          font-weight: 800;
        }

        .dh-bottom-controls {
          position: fixed;
          left: 12px;
          right: 12px;
          bottom: 14px;
          z-index: 6;
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 10px;
          border-radius: 22px;
          background: rgba(2, 6, 23, .62);
          border: 1px solid rgba(148, 163, 184, .20);
          backdrop-filter: blur(16px);
          box-shadow: 0 20px 60px rgba(0,0,0,.45);
        }

        .dh-btn {
          border: 1px solid rgba(148, 163, 184, .25);
          background: rgba(15, 23, 42, .84);
          color: white;
          border-radius: 999px;
          padding: 10px 14px;
          font-weight: 900;
          white-space: nowrap;
        }

        .dh-btn.primary {
          background: #14b8a6;
          color: #001018;
          border-color: #2dd4bf;
        }

        .dh-floating-menu {
          position: fixed;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 7;
          width: 58px;
          height: 58px;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, .3);
          background: rgba(2, 6, 23, .78);
          color: white;
          font-size: 25px;
          font-weight: 900;
          box-shadow: 0 18px 55px rgba(0,0,0,.48);
        }

        .dh-drawer {
          position: fixed;
          right: 12px;
          top: 82px;
          width: min(340px, calc(100vw - 24px));
          z-index: 8;
          padding: 16px;
          border-radius: 24px;
          background: rgba(2, 6, 23, .88);
          border: 1px solid rgba(45, 212, 191, .25);
          backdrop-filter: blur(18px);
          box-shadow: 0 20px 80px rgba(0,0,0,.6);
        }

        .dh-drawer h2 {
          margin: 0 0 12px;
          font-size: 20px;
        }

        .dh-grid {
          display: grid;
          gap: 8px;
        }

        .dh-intro {
          position: fixed;
          inset: 0;
          z-index: 30;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(circle at center, rgba(20,184,166,.22), transparent 35%),
            #020617;
          animation: dhFade 1.8s ease forwards;
        }

        .dh-card {
          width: min(360px, 88vw);
          padding: 24px;
          border-radius: 28px;
          background: rgba(15, 23, 42, .78);
          border: 1px solid rgba(45, 212, 191, .35);
          text-align: center;
          box-shadow: 0 30px 100px rgba(0,0,0,.58);
        }

        .dh-avatar {
          width: 78px;
          height: 78px;
          margin: 0 auto 14px;
          border-radius: 50%;
          background: linear-gradient(135deg,#14b8a6,#38bdf8);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #001018;
          font-size: 34px;
          font-weight: 1000;
        }

        .dh-card h1 {
          margin: 0;
          font-size: 26px;
        }

        .dh-card p {
          color: #cbd5e1;
          line-height: 1.5;
        }

        @keyframes dhFade {
          0% { opacity: 1; transform: scale(1); }
          70% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; pointer-events: none; transform: scale(1.04); }
        }

        @media (max-width: 720px) {
          .dh-brand {
            font-size: 14px;
          }

          .dh-mode {
            font-size: 13px;
          }

          .dh-bottom-controls {
            bottom: 8px;
            left: 8px;
            right: 8px;
          }
        }
      `}</style>

      {showIntro && (
        <section className="dh-intro">
          <div className="dh-card">
            <div className="dh-avatar">A</div>
            <h1>Account Ready</h1>
            <p>Loading your renderer profile and opening the DigitalHut main scene.</p>
          </div>
        </section>
      )}

      <section className="dh-renderer-wrap">
        <LiveGlbViewer model={activeModel} />
      </section>

      <div className="dh-top-chip">
        <div className="dh-brand">DigitalHut Renderer</div>
        <div className="dh-mode">{region}</div>
      </div>

      <button className="dh-floating-menu" onClick={() => setDrawerOpen(!drawerOpen)}>
        ☰
      </button>

      {drawerOpen && (
        <aside className="dh-drawer">
          <h2>Smart Controls</h2>
          <div className="dh-grid">
            <button className="dh-btn primary" onClick={() => selectRegion("north america")}>North America</button>
            <button className="dh-btn" onClick={() => selectRegion("hollywood")}>California Hollywood</button>
            <button className="dh-btn" onClick={() => selectRegion("market district")}>Market District</button>
            <button className="dh-btn" onClick={() => selectRegion("planetary")}>Planetary</button>
            <button className="dh-btn">Premium: Base / Architect / Lighting / Props / Grid</button>
            <button className="dh-btn">Library beside Main Feed</button>
          </div>
        </aside>
      )}

      <nav className="dh-bottom-controls">
        <button className="dh-btn primary" onClick={() => scan(region)}>Scan</button>
        <button className="dh-btn">Voice</button>
        <button className="dh-btn">Feeds</button>
        <button className="dh-btn">Save</button>
        <button className="dh-btn">Share</button>
        <button className="dh-btn">Download</button>
        <button className="dh-btn">Manual</button>
        <button className="dh-btn">Guided</button>
      </nav>
    </main>
  )
}
