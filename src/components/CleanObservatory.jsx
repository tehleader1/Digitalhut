import { useState } from "react"
import LiveGlbViewer from "./LiveGlbViewer"
import { getRandomObservatory } from "../lib/observatoryLibrary"

export default function CleanObservatory() {
  const [region, setRegion] = useState("north america")
  const [activeModel, setActiveModel] = useState(null)

  function runScanner() {
    setActiveModel(getRandomObservatory(region))
  }

  const button = {
    background: "#111827",
    color: "#fff",
    border: "1px solid #26334f",
    borderRadius: "999px",
    padding: "9px 13px",
    fontWeight: 800
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "#071018",
      color: "#fff",
      padding: "18px",
      fontFamily: "system-ui, sans-serif"
    }}>
      <header style={{
        display: "flex",
        gap: "10px",
        alignItems: "center",
        flexWrap: "wrap",
        marginBottom: "14px"
      }}>
        <h1 style={{ margin: 0, flex: "1 1 260px", fontSize: "28px" }}>
          DigitalHut Observatory
        </h1>

        <select value={region} onChange={(e) => setRegion(e.target.value)} style={{
          background: "#111827",
          color: "#fff",
          border: "1px solid #26334f",
          borderRadius: "12px",
          padding: "11px"
        }}>
          <option value="north america">North America</option>
          <option value="hollywood">California Hollywood</option>
          <option value="market district">Market District</option>
          <option value="planetary">Planetary</option>
        </select>

        <button onClick={runScanner} style={{
          background: "#06b6d4",
          color: "#001018",
          border: "none",
          borderRadius: "12px",
          padding: "12px 18px",
          fontWeight: 900
        }}>
          Scan
        </button>
      </header>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
        <button style={button}>Voice</button>
        <button style={button}>Feeds</button>
        <button style={button}>Library</button>
        <button style={button}>Save</button>
        <button style={button}>Share</button>
        <button style={button}>Download</button>
      </div>

      <section style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 2fr) minmax(280px, 1fr)",
        gap: "16px"
      }}>
        <LiveGlbViewer model={activeModel} />

        <aside style={{
          background: "linear-gradient(180deg,#111827,#050816)",
          border: "1px solid #1f2937",
          borderRadius: "22px",
          padding: "18px"
        }}>
          <h2 style={{ marginTop: 0 }}>Observatory Feed</h2>
          <p style={{ color: "#94a3b8" }}>
            Renderer-first layout active. Choose a district and press Scan.
          </p>

          <h3>AI Description</h3>
          <p style={{ color: "#94a3b8" }}>
            Base, architect, lighting, props, grid, and coordinates are ready for one smart premium dropdown.
          </p>

          <h3>Next Controls</h3>
          <p style={{ color: "#94a3b8" }}>
            Voice, guided tour, manual mode, back 10s, forward 10s, and switch tour sit as compact renderer controls.
          </p>
        </aside>
      </section>
    </main>
  )
}
