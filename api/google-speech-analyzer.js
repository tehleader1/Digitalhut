import {readFile} from "node:fs/promises"
import {createSign} from "node:crypto"

const speechScope = "https://www.googleapis.com/auth/cloud-platform"
const tokenAudience = "https://oauth2.googleapis.com/token"
let cachedAccessToken = null

const stopWords = new Set([
  "about", "above", "after", "again", "against", "also", "analytics", "because", "before", "being", "between",
  "could", "digitalhut", "during", "every", "experience", "expercience", "first", "from", "have", "into",
  "just", "like", "live", "make", "more", "most", "needs", "over", "page", "read", "reader", "really",
  "right", "show", "shows", "still", "system", "that", "their", "there", "these", "they", "this", "through",
  "video", "visual", "what", "when", "where", "which", "while", "with", "would", "youtube"
])

const providerLabel = "Google Speech Analyzer"

function clean(value, max = 500){
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max)
}

function safeNumber(value, fallback = 0){
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function compactTime(seconds){
  const safe = Math.max(0, Math.round(safeNumber(seconds, 0)))
  const minutes = Math.floor(safe / 60)
  const rest = String(safe % 60).padStart(2, "0")
  return `${minutes}:${rest}`
}

function base64Url(value){
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
}

function speechApiKey(){
  return clean(
    process.env.GOOGLE_SPEECH_API_KEY ||
    process.env.GOOGLE_CLOUD_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.YOUTUBE_API_KEY ||
    process.env.GOOGLE_YOUTUBE_API_KEY ||
    "",
    260
  )
}

function serviceAccountConfigured(){
  return Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_APPLICATION_CREDENTIALS)
}

export function googleSpeechConfigured(){
  return Boolean(speechApiKey() || serviceAccountConfigured())
}

function normalizeServiceAccountJson(value){
  const raw = clean(value, 10000)
  if(!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    try {
      return JSON.parse(Buffer.from(raw, "base64").toString("utf8"))
    } catch {
      return null
    }
  }
}

async function readServiceAccount(){
  const inline = normalizeServiceAccountJson(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || "")
  if(inline) return inline

  const credentialsPath = clean(process.env.GOOGLE_APPLICATION_CREDENTIALS || "", 1000)
  if(!credentialsPath) return null
  const fileText = await readFile(credentialsPath, "utf8")
  return JSON.parse(fileText)
}

async function getAccessToken(){
  if(cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60000){
    return cachedAccessToken.token
  }

  const serviceAccount = await readServiceAccount()
  if(!serviceAccount?.client_email || !serviceAccount?.private_key){
    return ""
  }

  const now = Math.floor(Date.now() / 1000)
  const header = {alg: "RS256", typ: "JWT"}
  const claim = {
    iss: serviceAccount.client_email,
    scope: speechScope,
    aud: tokenAudience,
    exp: now + 3600,
    iat: now
  }

  const unsigned = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(claim))}`
  const signature = createSign("RSA-SHA256").update(unsigned).sign(serviceAccount.private_key, "base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
  const assertion = `${unsigned}.${signature}`
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion
  })

  const response = await fetch(tokenAudience, {
    method: "POST",
    headers: {"Content-Type": "application/x-www-form-urlencoded"},
    body
  })
  const payload = await response.json().catch(() => ({}))
  if(!response.ok || !payload.access_token){
    throw new Error(payload.error_description || payload.error || `Google auth returned ${response.status}`)
  }

  cachedAccessToken = {
    token: payload.access_token,
    expiresAt: Date.now() + Math.max(1, safeNumber(payload.expires_in, 3600) - 90) * 1000
  }
  return cachedAccessToken.token
}

function encodingForMime(mimeType){
  const mime = clean(mimeType, 120).toLowerCase().split(";")[0]
  const match = {
    "audio/webm": "WEBM_OPUS",
    "audio/ogg": "OGG_OPUS",
    "audio/opus": "OGG_OPUS",
    "audio/wav": "LINEAR16",
    "audio/x-wav": "LINEAR16",
    "audio/flac": "FLAC",
    "audio/mpeg": "MP3",
    "audio/mp3": "MP3"
  }
  return match[mime] || ""
}

function sanitizeAudioBase64(value){
  const raw = String(value || "").trim()
  if(!raw) return ""
  const withoutPrefix = raw.includes(",") ? raw.slice(raw.indexOf(",") + 1) : raw
  return withoutPrefix.replace(/\s/g, "")
}

function meaningfulTokens(value){
  return clean(value, 6000)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((token) => token.replace(/^-+|-+$/g, ""))
    .filter((token) => token.length > 2 && !stopWords.has(token) && !/^\d+$/.test(token))
}

function titleCase(value){
  return clean(value, 80)
    .split(/\s+/)
    .map((part) => part ? `${part[0].toUpperCase()}${part.slice(1)}` : "")
    .join(" ")
}

function unique(values, max = 8){
  const seen = new Set()
  const output = []
  for(const value of values){
    const cleanValue = clean(value, 120)
    const key = cleanValue.toLowerCase()
    if(!cleanValue || seen.has(key)) continue
    seen.add(key)
    output.push(cleanValue)
    if(output.length >= max) break
  }
  return output
}

function topEntities(text, metadata){
  const seeded = [
    metadata?.category,
    metadata?.title,
    metadata?.channel,
    metadata?.channelTitle
  ].flatMap((item) => meaningfulTokens(item).slice(0, 4))

  const counts = new Map()
  for(const token of [...seeded, ...meaningfulTokens(text)]){
    counts.set(token, (counts.get(token) || 0) + 1)
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([token]) => titleCase(token))
    .filter(Boolean)
    .slice(0, 10)
}

function sentenceChunks(text, fallbackFocus){
  const chunks = clean(text, 9000)
    .split(/(?<=[.!?])\s+|\n+/)
    .map((item) => clean(item, 220))
    .filter((item) => item.length > 18)

  if(chunks.length) return chunks.slice(0, 9)
  return [
    `${fallbackFocus} is the primary subject being observed.`,
    `DigitalHut is checking source context, useful claims, and visual research paths for ${fallbackFocus}.`,
    `The next pass should connect ${fallbackFocus} to backlinks, models, and timeline evidence.`
  ]
}

function sourceLinkFor(metadata, focus){
  const direct = clean(metadata?.sourceUrl || metadata?.url || metadata?.videoUrl || "", 500)
  if(direct) return direct
  return `https://www.google.com/search?q=${encodeURIComponent(`${focus} research source`)}`
}

function buildAnalysis({text, metadata = {}, seconds = 0, mode = "metadata-only"}){
  const basisText = clean([
    metadata.title,
    metadata.channel || metadata.channelTitle,
    metadata.description,
    metadata.category,
    text
  ].filter(Boolean).join(". "), 10000)

  const entities = topEntities(basisText, metadata)
  const title = clean(metadata.title || "", 180)
  const channel = clean(metadata.channel || metadata.channelTitle || "source channel", 100)
  const category = clean(metadata.category || "DigitalHut Observatory", 100)
  const focus = title || entities.slice(0, 4).join(" / ") || category
  const sourceUrl = sourceLinkFor(metadata, focus)
  const chunks = sentenceChunks(text || metadata.description || focus, focus)
  const startSeconds = safeNumber(seconds, 0)
  const primary = entities[0] || titleCase(category)
  const secondary = entities[1] || "Source"
  const tertiary = entities[2] || "Evidence"

  const bubbleMap = [
    {
      id: "episode",
      kind: "episode",
      label: clean(focus, 76),
      value: "Episode subject",
      weight: 1,
      connectsTo: ["source", "claim", "model"]
    },
    {
      id: "source",
      kind: "source",
      label: clean(channel, 64),
      value: mode === "google-speech" ? "spoken audio analyzed" : "metadata and provided text analyzed",
      weight: 0.88,
      connectsTo: ["claim", "backlink"]
    },
    {
      id: "claim",
      kind: "claim",
      label: primary,
      value: clean(chunks[0], 140),
      weight: 0.82,
      connectsTo: ["timeline", "proof"]
    },
    {
      id: "proof",
      kind: "proof",
      label: secondary,
      value: clean(chunks[1] || `Research checkpoint for ${secondary}`, 140),
      weight: 0.76,
      connectsTo: ["timeline", "backlink"]
    },
    {
      id: "model",
      kind: "3d",
      label: `${tertiary} 3D layer`,
      value: `Generate a layered research model showing ${tertiary} connected to ${primary}.`,
      weight: 0.8,
      connectsTo: ["episode", "backlink"]
    },
    {
      id: "backlink",
      kind: "backlink",
      label: "source preview",
      value: sourceUrl,
      weight: 0.72,
      connectsTo: ["source", "model"]
    }
  ]

  const timeline = chunks.slice(0, 7).map((chunk, index) => ({
    id: `moment-${index + 1}`,
    at: compactTime(startSeconds + (index * 18)),
    label: index === 0 ? "Opening read" : index === 1 ? "Evidence branch" : index === 2 ? "3D handoff" : `Signal ${index + 1}`,
    summary: clean(chunk, 160),
    entity: entities[index % Math.max(entities.length, 1)] || primary,
    backlink: index % 2 === 0 ? sourceUrl : `https://www.google.com/search?q=${encodeURIComponent(`${entities[index] || focus} ${category}`)}`
  }))

  const threeDObjects = unique([primary, secondary, tertiary, ...entities], 5).map((entity, index) => ({
    id: `object-${index + 1}`,
    label: `${entity} research object`,
    status: index === 0 ? "primary rendered preview" : "supporting rendered layer",
    modelQuery: `${entity} 3d model ${category}`,
    prompt: `Build a clean 3D observatory layer for ${entity}, with branches back to ${primary}, source evidence, and timeline moments.`,
    backlink: `https://www.google.com/search?q=${encodeURIComponent(`${entity} 3d research model`)}`
  }))

  return {
    focus: clean(focus, 180),
    category,
    channel,
    entities,
    sourceBasis: mode === "google-speech" ? "Google Speech-to-Text audio analysis" : mode === "provided-text" ? "provided spoken-source text" : "video metadata and source context",
    confidenceLabel: mode === "google-speech" ? "spoken-source" : mode === "provided-text" ? "provided-source" : "metadata-only",
    currentRead: clean(chunks[0], 180),
    researchUse: `This read feeds the bubble map, timeline, 3D renderer, and backlink stack for ${clean(focus, 90)}.`,
    developerView: `DigitalHut analyzer mode: ${mode}; entities: ${entities.slice(0, 5).join(", ") || "pending"}.`,
    nextQuestion: `What should the next source confirm about ${primary}?`,
    backlinks: [
      {label: "Primary source", url: sourceUrl},
      {label: `${primary} research`, url: `https://www.google.com/search?q=${encodeURIComponent(`${primary} research 2026`)}`},
      {label: `${category} market angle`, url: `https://www.google.com/search?q=${encodeURIComponent(`${category} ${primary} analysis`)}`}
    ],
    bubbleMap,
    timeline,
    threeDObjects,
    multiDisplayFeed: [
      {display: "Video", signal: clean(focus, 90), status: "subject lock"},
      {display: "Bubble Map", signal: `${bubbleMap.length} linked nodes`, status: "constructing branches"},
      {display: "Timeline", signal: `${timeline.length} moments`, status: "syncing to playback"},
      {display: "3D", signal: threeDObjects[0]?.label || "model prompt", status: "render prompt ready"},
      {display: "Backlinks", signal: `${primary} source preview`, status: "source branch ready"}
    ]
  }
}

async function googleRecognize({audioBase64, mimeType, sampleRateHertz, languageCode}){
  const encoding = encodingForMime(mimeType)
  if(!encoding){
    throw new Error("Unsupported audio format. Use audio/webm, audio/ogg, audio/wav, audio/mpeg, audio/mp3, or audio/flac.")
  }

  const apiKey = speechApiKey()
  const headers = {"Content-Type": "application/json"}
  let url = "https://speech.googleapis.com/v1/speech:recognize"
  if(apiKey){
    url = `${url}?key=${encodeURIComponent(apiKey)}`
  } else {
    const token = await getAccessToken()
    if(!token) throw new Error("Google Speech is not configured. Add GOOGLE_SPEECH_API_KEY or service account credentials.")
    headers.Authorization = `Bearer ${token}`
  }

  const config = {
    encoding,
    languageCode: clean(languageCode || process.env.GOOGLE_SPEECH_LANGUAGE || "en-US", 24),
    enableAutomaticPunctuation: true,
    model: "video"
  }
  const safeRate = safeNumber(sampleRateHertz, 0)
  if(safeRate) config.sampleRateHertz = safeRate
  if(!safeRate && (encoding === "WEBM_OPUS" || encoding === "OGG_OPUS")) config.sampleRateHertz = 48000

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      config,
      audio: {content: audioBase64}
    })
  })
  const payload = await response.json().catch(() => ({}))
  if(!response.ok){
    const message = payload?.error?.message || `Google Speech returned ${response.status}`
    throw new Error(message)
  }

  const transcript = (payload.results || [])
    .map((result) => result?.alternatives?.[0]?.transcript)
    .filter(Boolean)
    .join(" ")

  return clean(transcript, 9000)
}

export default async function handler(req, res){
  if(req.method !== "POST") return res.status(405).json({error: "Method not allowed"})

  const metadata = req.body?.metadata || {}
  const providedTranscript = clean(req.body?.transcript || req.body?.spokenText || "", 9000)
  const audioBase64 = sanitizeAudioBase64(req.body?.audioBase64 || req.body?.audio || "")
  const mimeType = clean(req.body?.mimeType || req.body?.contentType || "audio/webm", 100)
  const seconds = safeNumber(req.body?.seconds || req.body?.currentTime, 0)
  const configured = googleSpeechConfigured()
  const fetchedAt = new Date().toISOString()

  try {
    let transcript = providedTranscript
    let mode = transcript ? "provided-text" : "metadata-only"
    let status = transcript ? "provided-text-analyzed" : "metadata-context-analyzed"

    if(audioBase64){
      if(!configured){
        status = "google-speech-not-configured"
      } else {
        transcript = await googleRecognize({
          audioBase64,
          mimeType,
          sampleRateHertz: req.body?.sampleRateHertz,
          languageCode: req.body?.languageCode
        })
        mode = "google-speech"
        status = transcript ? "google-speech-analyzed" : "google-speech-empty"
      }
    }

    const analysis = buildAnalysis({text: transcript, metadata, seconds, mode})
    return res.status(200).json({
      ok: true,
      configured,
      provider: providerLabel,
      mode,
      status,
      fetchedAt,
      transcriptPreview: clean(transcript, 600),
      analysis,
      contract: {
        bubbleMap: "analysis.bubbleMap",
        timeline: "analysis.timeline",
        threeDObjects: "analysis.threeDObjects",
        multiDisplayFeed: "analysis.multiDisplayFeed"
      }
    })
  } catch (error) {
    const fallbackText = providedTranscript || clean([metadata.title, metadata.description, metadata.category].filter(Boolean).join(". "), 4000)
    return res.status(502).json({
      ok: false,
      configured,
      provider: providerLabel,
      mode: audioBase64 ? "google-speech" : providedTranscript ? "provided-text" : "metadata-only",
      status: "google-speech-unavailable",
      fetchedAt,
      error: error?.message || "Google Speech analyzer unavailable",
      analysis: buildAnalysis({text: fallbackText, metadata, seconds, mode: providedTranscript ? "provided-text" : "metadata-only"})
    })
  }
}
