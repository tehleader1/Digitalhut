import express from "express"
import path from "node:path"
import {fileURLToPath} from "node:url"
import {sendObservatoryPayload, providerHealth} from "./api/_observatory-providers.js"

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
      idleFadeSeconds: 18
    }
  }
}

app.get(["/health", "/api/health"], (req, res) => {
  res.status(200).json(healthPayload("digitalhut-node"))
})

app.get(["/api/observatory-feed", "/api/observatory", "/api/sketchfab", "/api/search/sketchfab"], (req, res) => {
  return sendObservatoryPayload(req, res)
})

app.use(express.static(distDir))

app.use((req, res) => {
  res.sendFile(path.join(distDir, "index.html"))
})

app.listen(port, () => {
  console.log(`DigitalHut listening on ${port}`)
})
