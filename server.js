import express from "express"
import path from "node:path"
import {fileURLToPath} from "node:url"
import {sendObservatoryPayload, providerHealth} from "./api/_observatory-providers.js"
import {buildGuideSession} from "./src/lib/guidedTourEngine.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()
const port = process.env.PORT || 3000
const distDir = path.join(__dirname, "dist")

app.use(express.json({limit: "1mb"}))

function healthPayload(runtime){
  const providers = providerHealth()
  return {
    ok: true,
    runtime,
    providers,
    detected: providers,
    renderer: {
      mode: "fullscreen-api",
      loadGate: "fps-calibrated",
      idleFadeSeconds: 18,
      containment: "closed-until-clicked",
      hoverPreview: "fullscreen-system-preview"
    },
    guidedTour: {
      active: true,
      stages: ["establish", "inspect", "orbit", "category", "data", "compare", "conclude"]
    }
  }
}

app.get(["/health", "/api/health"], (req, res) => {
  res.status(200).json(healthPayload("digitalhut-node"))
})

app.get(["/api/observatory-feed", "/api/observatory", "/api/sketchfab", "/api/search/sketchfab"], (req, res) => {
  return sendObservatoryPayload(req, res)
})

app.get("/api/guided-tour", (req, res) => {
  const providerMix = String(req.query.providers || req.query.providerMix || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)

  const session = buildGuideSession({
    title: req.query.title,
    category: req.query.category,
    mode: req.query.mode,
    status: req.query.status,
    note: req.query.note,
    tier: req.query.tier,
    providerMix
  })

  res.status(200).json({
    ok: true,
    provider: "digitalhut-guided-tour",
    session,
    contract: {
      containment: "closed-until-clicked",
      hoverPreview: "fullscreen-system-preview",
      stages: session.stages.map((stage) => stage.id)
    }
  })
})

app.use(express.static(distDir))

app.use((req, res) => {
  res.sendFile(path.join(distDir, "index.html"))
})

app.listen(port, () => {
  console.log(`DigitalHut listening on ${port}`)
})
