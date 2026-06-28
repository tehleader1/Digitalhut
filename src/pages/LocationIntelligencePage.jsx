import {useMemo, useState} from "react"
import {Link} from "react-router-dom"
import "./TrustPage.css"
import "./LocationIntelligencePage.css"

const providers = [
  {
    name: "Google Photorealistic 3D Tiles",
    role: "Populated city/location mesh",
    fit: "Best first choice when a location has high-quality real-world 3D coverage.",
    source: "Google Maps Platform Map Tiles API"
  },
  {
    name: "Cesium ion",
    role: "3D globe, terrain, buildings, tiling, streaming",
    fit: "Best system backbone for global geospatial scenes and owner-uploaded 3D data.",
    source: "Cesium ion / CesiumJS"
  },
  {
    name: "OpenStreetMap / Overture",
    role: "Roads, buildings, places, map structure",
    fit: "Best open context layer when photorealistic 3D is missing.",
    source: "OSM / Overture open map data"
  },
  {
    name: "DigitalHut Capture Library",
    role: "Owner-created exotic environments",
    fit: "Best source for real local places, villages, docks, farms, trails, and Dominican Republic scenes.",
    source: "FireCuda / Supabase / field capture"
  }
]

const captureTypes = [
  "street walkaround",
  "dock/marina orbit",
  "village block pass",
  "farm perimeter pass",
  "market/street food pass",
  "mountain/terrain sweep",
  "jungle trail scan",
  "interior room scan",
  "building facade scan",
  "research site scan"
]

function cleanLocation(value){
  return String(value || "").trim() || "Santiago, Dominican Republic"
}

function missionFor(location){
  const target = cleanLocation(location)
  return [
    {
      step: "Locate",
      text: `Search ${target} through map/geocode providers and choose the closest available 3D/terrain context.`
    },
    {
      step: "Match",
      text: "Try photorealistic 3D tiles first, then terrain/buildings, then owner GLB assets, then simplified generated scene."
    },
    {
      step: "Render",
      text: "Open the closest scene in Play Preview, label source confidence, and avoid fake fallback models."
    },
    {
      step: "Guide",
      text: "AI explains what the user is seeing, what is missing, and what field capture would improve the scene."
    },
    {
      step: "Capture",
      text: "If the public layer is weak, create a local DigitalHut capture mission with camera, phone, drone, or 360 photos."
    },
    {
      step: "Publish",
      text: "Turn the verified location into an SEO asset page with source, preview, rating, notes, and backlinks."
    }
  ]
}

export default function LocationIntelligencePage(){
  const [location, setLocation] = useState("Santiago, Dominican Republic")
  const mission = useMemo(() => missionFor(location), [location])

  return <main className="dh-trust-page dh-location-page">
    <header className="dh-trust-nav">
      <Link to="/">DigitalHut</Link>
      <nav>
        <Link to="/locations">Locations</Link>
        <Link to="/experiments">Experiments</Link>
        <Link to="/markets">Markets</Link>
        <Link to="/insights">Insights</Link>
      </nav>
    </header>

    <section className="dh-trust-intro dh-location-hero">
      <span>DigitalHut Real World Location Intelligence</span>
      <h1>Map Any Location, Find The Closest 3D Scene, Then Build What Is Missing</h1>
      <p>DigitalHut should act like an observatory for real places: find the best available globe/map/3D source, render the closest environment, guide the user through what they are seeing, then create a capture mission when public 3D coverage is not enough.</p>
    </section>

    <section className="dh-location-control">
      <label>
        Location To Render
        <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Santiago, Dominican Republic" />
      </label>
      <div>
        <b>{cleanLocation(location)}</b>
        <span>{"Render path: 3D tiles -> terrain/buildings -> owner GLB -> capture mission"}</span>
      </div>
    </section>

    <section className="dh-location-grid">
      <article className="dh-location-panel">
        <h2>Provider Stack</h2>
        {providers.map((provider) => (
          <section key={provider.name}>
            <b>{provider.name}</b>
            <span>{provider.role}</span>
            <p>{provider.fit}</p>
            <em>{provider.source}</em>
          </section>
        ))}
      </article>

      <article className="dh-location-panel">
        <h2>DigitalHut Mission Path</h2>
        {mission.map((item) => (
          <section key={item.step}>
            <b>{item.step}</b>
            <p>{item.text}</p>
          </section>
        ))}
      </article>
    </section>

    <section className="dh-capture-strip">
      <header>
        <span>Owner Capture Queue</span>
        <b>More real-world exotic environments</b>
      </header>
      <div>
        {captureTypes.map((item) => <button key={item} type="button">{item}</button>)}
      </div>
    </section>

    <section className="dh-location-policy">
      <h2>Rendering Rule</h2>
      <p>The system should not pretend every place already has a perfect GLB. It should show source confidence, use the closest available geospatial scene, and create a field capture task when DigitalHut can improve the real-world visual.</p>
    </section>
  </main>
}
