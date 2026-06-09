import "./ObservatoryFallback.css"

const categories = [
  ["Researcher", "Scientific assets"],
  ["Programmer", "Code + systems"],
  ["Stock Market", "Market observatory"],
  ["Real Estate", "Property models"],
  ["Workforce", "Professional projects"],
  ["Microscope", "Cells + materials"],
  ["Planetary", "Space + terrain"],
  ["Culture", "Global context"]
]

const thumbnails = [
  ["Main Preview", "Renderer fallback ready"],
  ["Brain", "AI analysis layer"],
  ["Category Asset", "Library visual"],
  ["Guided Model", "Camera path ready"]
]

const guided = ["Orbit", "Inspect", "Microscope", "Measure", "Explain"]
const feeds = ["Research", "Market", "Assets", "Recent", "Library"]

export default function ObservatoryFallback({ children }) {
  return (
    <div className="dh-app">
      <header className="dh-topbar">
        <div className="dh-brand">DigitalHut Observatory</div>
        <input className="dh-search" placeholder="Search asset, project, ticker, region, GLB..." />
      </header>

      <main className="dh-main">
        <section className="dh-render">
          {children}
          <div className="dh-brain">
            <div className="dh-brain-card">
              <div className="dh-orb" />
              <h1>Observatory Brain Loading</h1>
              <p>Renderer, thumbnails, category assets, and AI analysis are being prepared.</p>
            </div>
          </div>
        </section>

        <aside className="dh-panel">
          <h2>Library Assets</h2>
          <div className="dh-cats">
            {categories.map(([name, note]) => (
              <button className="dh-cat" key={name}>
                {name}
                <small>{note}</small>
              </button>
            ))}
          </div>

          <h2 style={{marginTop:18}}>Preview Thumbnails</h2>
          <div className="dh-thumbs">
            {thumbnails.map(([name, note]) => (
              <div className="dh-thumb" key={name}>
                <div className="dh-thumb-img" />
                <div>{name}<small>{note}</small></div>
              </div>
            ))}
          </div>
        </aside>
      </main>

      <footer className="dh-bottom">
        <div className="dh-row">
          {guided.map((x, i) => <button className={i===0 ? "dh-pill active" : "dh-pill"} key={x}>{x}</button>)}
        </div>
        <div className="dh-row">
          {feeds.map((x, i) => <button className={i===0 ? "dh-pill active" : "dh-pill"} key={x}>{x}</button>)}
        </div>
      </footer>
    </div>
  )
}
