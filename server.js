import express from "express"
import path from "node:path"
import {fileURLToPath} from "node:url"
import dotenv from "dotenv"
import googleSpeechAnalyzer, {googleSpeechConfigured} from "./api/google-speech-analyzer.js"
import googleTextToSpeech, {googleTextToSpeechConfigured} from "./api/google-text-to-speech.js"
import digitalhutCapture from "./api/digitalhut-capture.js"
import insightMap from "./api/insight-map.js"
import marketFlow from "./api/market-flow.js"
import optionsFlow from "./api/options-flow.js"
import observatoryFeed from "./api/observatory-feed.js"
import podcastSearch from "./api/podcast-search.js"
import providerStatus from "./api/provider-status.js"
import sketchfab from "./api/sketchfab.js"
import youtubeSearch from "./api/youtube-search.js"
import {buildGuideSession} from "./src/lib/guidedTourEngine.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({path: path.join(__dirname, ".env.local")})
dotenv.config({path: path.join(__dirname, ".env")})
const app = express()
const port = process.env.PORT || 3000
const host = process.env.HOST || "0.0.0.0"
const distDir = path.join(__dirname, "dist")

app.use(express.json({limit: "15mb"}))

function healthPayload(runtime){
  const providers = [
    {id: "observatory-feed", configured: true, role: "3d-model-search"},
    {id: "youtube", configured: Boolean(process.env.YOUTUBE_API_KEY || process.env.GOOGLE_YOUTUBE_API_KEY), role: "video-story-search"},
    {id: "google-speech", configured: googleSpeechConfigured(), role: "spoken-content-analyzer"},
    {id: "google-text-to-speech", configured: googleTextToSpeechConfigured(), role: "podcast-voice-synthesis"},
    {id: "google-service-account", configured: Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_APPLICATION_CREDENTIALS), role: "cloud-worker-identity"},
    {id: "firecuda-local", configured: true, role: "local-build-server"}
  ]
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

app.get("/api/provider-status", (req, res) => {
  return providerStatus(req, res)
})

app.all("/api/insight-map", (req, res) => {
  return insightMap(req, res)
})

app.all(["/api/digitalhut-capture", "/api/cloud-capture"], (req, res) => {
  return digitalhutCapture(req, res)
})

app.get(["/api/observatory-feed", "/api/observatory"], (req, res) => {
  return observatoryFeed(req, res)
})

app.get(["/api/sketchfab", "/api/search/sketchfab"], (req, res) => {
  return sketchfab(req, res)
})

app.get(["/api/youtube-search", "/api/search/youtube"], (req, res) => {
  return youtubeSearch(req, res)
})

app.get("/api/market-flow", (req, res) => {
  return marketFlow(req, res)
})

app.get("/api/options-flow", (req, res) => {
  return optionsFlow(req, res)
})

app.get(["/api/podcast-search", "/api/search/podcast"], (req, res) => {
  return podcastSearch(req, res)
})

app.post(["/api/google-speech-analyzer", "/api/content-analyzer/google-speech"], (req, res) => {
  return googleSpeechAnalyzer(req, res)
})

app.post(["/api/google-text-to-speech", "/api/content-voice/google-tts"], (req, res) => {
  return googleTextToSpeech(req, res)
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

app.listen(port, host, () => {
  console.log(`DigitalHut listening on ${host}:${port}`)
})
