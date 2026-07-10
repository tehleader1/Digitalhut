import {readFile} from "node:fs/promises"
import {createSign} from "node:crypto"

const ttsScope = "https://www.googleapis.com/auth/cloud-platform"
const tokenAudience = "https://oauth2.googleapis.com/token"
let cachedAccessToken = null

function clean(value, max = 500){
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max)
}

function safeNumber(value, fallback = 0){
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function base64Url(value){
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
}

function googleApiKey(){
  return clean(
    process.env.GOOGLE_TEXT_TO_SPEECH_API_KEY ||
    process.env.GOOGLE_TTS_API_KEY ||
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

export function googleTextToSpeechConfigured(){
  return Boolean(googleApiKey() || serviceAccountConfigured())
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
    scope: ttsScope,
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

async function synthesizeSpeech({text, languageCode, voiceName, speakingRate, pitch}){
  const apiKey = googleApiKey()
  const headers = {"Content-Type": "application/json"}
  let url = "https://texttospeech.googleapis.com/v1/text:synthesize"
  if(apiKey){
    url = `${url}?key=${encodeURIComponent(apiKey)}`
  } else {
    const token = await getAccessToken()
    if(!token) throw new Error("Google Text-to-Speech is not configured. Add YOUTUBE_API_KEY, GOOGLE_CLOUD_API_KEY, or service account credentials.")
    headers.Authorization = `Bearer ${token}`
  }

  const safeText = clean(text, 4500)
  if(!safeText) throw new Error("Text-to-Speech needs text to synthesize.")

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      input: {text: safeText},
      voice: {
        languageCode: clean(languageCode || process.env.GOOGLE_TTS_LANGUAGE || "en-US", 24),
        name: clean(voiceName || process.env.GOOGLE_TTS_VOICE || "en-US-Neural2-J", 80)
      },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: Math.min(1.35, Math.max(0.75, safeNumber(speakingRate, 1))),
        pitch: Math.min(8, Math.max(-8, safeNumber(pitch, 0)))
      }
    })
  })
  const payload = await response.json().catch(() => ({}))
  if(!response.ok){
    const message = payload?.error?.message || `Google Text-to-Speech returned ${response.status}`
    throw new Error(message)
  }
  return payload.audioContent || ""
}

export default async function handler(req, res){
  if(req.method !== "POST") return res.status(405).json({error: "Method not allowed"})

  try {
    const audioContent = await synthesizeSpeech({
      text: req.body?.text || req.body?.script || req.body?.spokenMoment || "",
      languageCode: req.body?.languageCode,
      voiceName: req.body?.voiceName,
      speakingRate: req.body?.speakingRate,
      pitch: req.body?.pitch
    })
    return res.status(200).json({
      ok: true,
      configured: googleTextToSpeechConfigured(),
      provider: "Google Text-to-Speech",
      audioEncoding: "MP3",
      audioContent
    })
  } catch (error) {
    return res.status(502).json({
      ok: false,
      configured: googleTextToSpeechConfigured(),
      provider: "Google Text-to-Speech",
      error: error?.message || "Google Text-to-Speech unavailable"
    })
  }
}
