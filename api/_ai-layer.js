import crypto from "node:crypto"
import net from "node:net"

const CANONICAL_SUPABASE_URL = "https://fzloxqgzihxiqqrlmyoz.supabase.co"
const TWO_HOURS_MS = 2 * 60 * 60 * 1000
const LIVE_WINDOW_MS = 40 * 60 * 1000
const MAX_FREE_LIVE_REACTIONS = 3
const ALLOWED_EVENTS = new Set([
  "subject_changed",
  "video_changed",
  "podcast_changed",
  "market_signal_changed",
  "glb_changed",
  "evidence_conflict",
  "important_moment",
  "provider_failed"
])
const PROVIDERS = new Set(["google-gemini", "openai", "anthropic", "microsoft-foundry", "openclaw"])
const MAX_REQUEST_BYTES = 20 * 1024
const DEFAULT_CREDIT_PACKS = {
  starter:{
    label:"4-hour mixed-session estimate",
    usdCents:2000,
    milliCredits:48000,
    estimatedHours:4,
    estimatedLiveReactions:48,
    savingsPercent:0
  },
  builder:{
    label:"9-hour mixed-session estimate",
    usdCents:4000,
    milliCredits:108000,
    estimatedHours:9,
    estimatedLiveReactions:108,
    savingsPercent:13
  },
  studio:{
    label:"21-hour mixed-session estimate",
    usdCents:8000,
    milliCredits:252000,
    estimatedHours:21,
    estimatedLiveReactions:252,
    savingsPercent:31
  }
}
const ACTION_LIMITS = {
  react:{limit:36, windowSeconds:60},
  "connect-provider":{limit:6, windowSeconds:15 * 60},
  "disconnect-provider":{limit:10, windowSeconds:15 * 60},
  "create-credit-order":{limit:8, windowSeconds:15 * 60},
  "capture-credit-order":{limit:12, windowSeconds:15 * 60}
}

function envValue(name){
  return String(process.env[name] || "").replace(/^['"]|['"]$/g, "").trim()
}

function supabaseConfig(){
  const configuredUrl = envValue("SUPABASE_URL") || envValue("VITE_SUPABASE_URL")
  const url = configuredUrl.includes("fzloxqgzihxiqqrlmyoz.supabase.co")
    ? configuredUrl.replace(/\/+$/, "")
    : CANONICAL_SUPABASE_URL
  const serviceKey = envValue("DIGITALHUT_SUPABASE_SERVICE_ROLE_KEY")
    || envValue("SUPABASE_SERVICE_ROLE_KEY")
    || envValue("SUPABASE_SECRET_KEY")
  const publishableKey = envValue("SUPABASE_PUBLISHABLE_KEY")
    || envValue("VITE_SUPABASE_ANON_KEY")
    || envValue("SUPABASE_ANON_KEY")
  return {url, serviceKey, publishableKey}
}

function bearerToken(req){
  const value = String(req.headers?.authorization || "")
  return value.toLowerCase().startsWith("bearer ") ? value.slice(7).trim() : ""
}

async function authenticatedUser(req){
  if(Object.prototype.hasOwnProperty.call(req, "_digitalhutAiUser")) return req._digitalhutAiUser
  const token = bearerToken(req)
  const {url, publishableKey} = supabaseConfig()
  if(!token || !publishableKey){
    req._digitalhutAiUser = null
    return null
  }
  try {
    const response = await fetch(`${url}/auth/v1/user`, {
      headers:{apikey:publishableKey, authorization:`Bearer ${token}`},
      signal:AbortSignal.timeout(6000)
    })
    if(!response.ok){
      req._digitalhutAiUser = null
      return null
    }
    const user = await response.json()
    req._digitalhutAiUser = user?.id ? user : null
    return req._digitalhutAiUser
  } catch {
    req._digitalhutAiUser = null
    return null
  }
}

function serverHeaders(extra = {}){
  const {serviceKey} = supabaseConfig()
  return {
    apikey:serviceKey,
    authorization:`Bearer ${serviceKey}`,
    "content-type":"application/json",
    ...extra
  }
}

async function supabaseRest(path, options = {}){
  const {url, serviceKey} = supabaseConfig()
  if(!serviceKey) return {ok:false, status:503, body:null, reason:"supabase-server-not-configured"}
  try {
    const response = await fetch(`${url}/rest/v1/${path}`, {
      ...options,
      headers:serverHeaders(options.headers),
      signal:AbortSignal.timeout(8000)
    })
    const text = await response.text()
    let body = null
    try { body = text ? JSON.parse(text) : null } catch { body = text }
    return {ok:response.ok, status:response.status, body, reason:response.ok ? "" : "supabase-request-failed"}
  } catch { return {ok:false, status:503, body:null, reason:"supabase-request-failed"} }
}

async function supabaseRpc(name, payload){
  return supabaseRest(`rpc/${encodeURIComponent(name)}`, {
    method:"POST",
    headers:{Prefer:"return=representation"},
    body:JSON.stringify(payload || {})
  })
}

function safeText(value, max = 300){
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max)
}

function safeEvidence(payload){
  const evidence = payload?.evidence || {}
  return {
    subject:safeText(evidence.subject, 180),
    videoTitle:safeText(evidence.videoTitle, 220),
    channel:safeText(evidence.channel, 140),
    podcastTitle:safeText(evidence.podcastTitle, 220),
    marketSymbol:safeText(evidence.marketSymbol, 12).toUpperCase(),
    marketSummary:safeText(evidence.marketSummary, 300),
    glbTitle:safeText(evidence.glbTitle, 180),
    visibleAnalytics:safeText(evidence.visibleAnalytics, 360),
    sources:Array.isArray(evidence.sources)
      ? evidence.sources.slice(0, 5).map((source) => ({
        label:safeText(source?.label, 100),
        url:/^https:\/\//i.test(String(source?.url || "")) ? String(source.url).slice(0, 500) : ""
      }))
      : []
  }
}

function requestIp(req){
  return String(req.headers?.["x-forwarded-for"] || req.socket?.remoteAddress || "unknown")
    .split(",")[0]
    .trim()
}

function hmacSecret(){
  return envValue("DIGITALHUT_AI_TRIAL_HMAC_SECRET")
}

function trialKeyHash(req, userId){
  const secret = hmacSecret()
  if(!secret) return ""
  const userAgent = safeText(req.headers?.["user-agent"], 240)
  const material = userId ? `user:${userId}` : `guest:${requestIp(req)}|${userAgent}`
  return crypto.createHmac("sha256", secret).update(material).digest("hex")
}

function rateLimitIdentity(req, userId, action){
  const secret = hmacSecret()
  if(!secret) return ""
  const userAgent = safeText(req.headers?.["user-agent"], 240)
  const identity = userId ? `user:${userId}` : `guest:${requestIp(req)}|${userAgent}`
  return crypto.createHmac("sha256", secret).update(`${action}|${identity}`).digest("hex")
}

async function takeRateLimit(req, userId, action){
  const policy = ACTION_LIMITS[action]
  if(!policy) return {ok:false, reason:"unsupported-ai-action"}
  const identity = rateLimitIdentity(req, userId, action)
  if(!identity) return {ok:false, reason:"ai-request-signing-not-configured"}
  const result = await supabaseRpc("digitalhut_ai_take_rate_limit", {
    p_identity_hash:identity,
    p_action:action,
    p_limit:policy.limit,
    p_window_seconds:policy.windowSeconds
  })
  const allowed = result.body === true || (Array.isArray(result.body) && result.body[0] === true)
  return result.ok
    ? {ok:allowed, reason:allowed ? "" : "rate-limit-exceeded"}
    : {ok:false, reason:"rate-limit-unavailable"}
}

function eventWindow(startedAt, now){
  const elapsed = now - new Date(startedAt).getTime()
  if(elapsed < 0 || elapsed >= TWO_HOURS_MS) return 0
  return Math.min(3, Math.floor(elapsed / LIVE_WINDOW_MS) + 1)
}

function windowThresholdMs(trialKey, windowNumber){
  const digest = crypto.createHash("sha256").update(`${trialKey}:${windowNumber}`).digest()
  const jitter = digest.readUInt16BE(0) / 65535
  const floor = (windowNumber - 1) * LIVE_WINDOW_MS
  return floor + (8 * 60 * 1000) + Math.round(jitter * 20 * 60 * 1000)
}

async function loadOrCreateTrial(req, sessionId, userId){
  const trialKey = trialKeyHash(req, userId)
  if(!trialKey) return {ok:false, reason:"trial-signing-not-configured"}
  const encodedKey = encodeURIComponent(trialKey)
  const existing = await supabaseRest(
    `digitalhut_ai_trial_sessions?trial_key_hash=eq.${encodedKey}&select=*`,
    {method:"GET"}
  )
  if(existing.ok && Array.isArray(existing.body) && existing.body[0]) return {ok:true, trialKey, row:existing.body[0]}
  const startedAt = new Date()
  const expiresAt = new Date(startedAt.getTime() + TWO_HOURS_MS)
  const created = await supabaseRest("digitalhut_ai_trial_sessions", {
    method:"POST",
    headers:{Prefer:"return=representation,resolution=merge-duplicates"},
    body:JSON.stringify({
      trial_key_hash:trialKey,
      session_id:sessionId,
      started_at:startedAt.toISOString(),
      expires_at:expiresAt.toISOString()
    })
  })
  const row = Array.isArray(created.body) ? created.body[0] : null
  return row ? {ok:true, trialKey, row} : {ok:false, reason:created.reason || "trial-session-create-failed"}
}

async function eligibleTrialWindow(req, sessionId, eventId, sourceEvent, userId){
  if(!ALLOWED_EVENTS.has(sourceEvent)) return {eligible:false, reason:"event-not-eligible"}
  const trial = await loadOrCreateTrial(req, sessionId, userId)
  if(!trial.ok) return {eligible:false, reason:trial.reason}
  const now = Date.now()
  const currentWindow = eventWindow(trial.row.started_at, now)
  if(!currentWindow) return {eligible:false, reason:"trial-window-expired"}
  const usedWindows = Array.isArray(trial.row.live_windows_used)
    ? trial.row.live_windows_used.map(Number)
    : []
  if(Number(trial.row.live_reactions_used || 0) >= MAX_FREE_LIVE_REACTIONS) return {eligible:false, reason:"trial-live-limit-reached"}
  if(usedWindows.includes(currentWindow)) return {eligible:false, reason:"trial-window-already-used"}
  const elapsed = now - new Date(trial.row.started_at).getTime()
  if(elapsed < windowThresholdMs(trial.trialKey, currentWindow)) return {eligible:false, reason:"trial-live-moment-not-ready"}
  return {
    eligible:true,
    window:currentWindow,
    trial,
    usedWindows,
    eventId
  }
}

async function commitTrialWindow(candidate){
  if(!candidate?.eligible) return {eligible:false, reason:"trial-not-eligible"}
  const {trial, window, usedWindows, eventId} = candidate
  const nextWindows = [...usedWindows, window].sort()
  const updated = await supabaseRest(
    `digitalhut_ai_trial_sessions?id=eq.${encodeURIComponent(trial.row.id)}&live_reactions_used=eq.${Number(trial.row.live_reactions_used || 0)}`,
    {
      method:"PATCH",
      headers:{Prefer:"return=representation"},
      body:JSON.stringify({
        live_reactions_used:Number(trial.row.live_reactions_used || 0) + 1,
        live_windows_used:nextWindows,
        last_live_reaction_at:new Date().toISOString(),
        updated_at:new Date().toISOString()
      })
    }
  )
  if(!updated.ok || !Array.isArray(updated.body) || !updated.body[0]) return {eligible:false, reason:"trial-window-race-lost"}
  return {
    eligible:true,
    window,
    used:Number(updated.body[0].live_reactions_used || 0),
    remaining:MAX_FREE_LIVE_REACTIONS - Number(updated.body[0].live_reactions_used || 0),
    eventId
  }
}

const CURATED_PACKS = {
  "google-gemini":[
    "The video, analytics, and source trail are describing the same subject from different angles.",
    "Google Search moved from links toward AI Mode; DigitalHut is keeping the source links visible.",
    "The visual evidence just changed. The next useful question is whether the narration changed with it.",
    "A multimodal system should compare what was said, shown, measured, and sourced before it reacts."
  ],
  openai:[
    "The subject changed. DigitalHut is rebuilding the evidence scene before drawing a conclusion.",
    "Long-running agent work raised the bar; this moment still needs its own receipts.",
    "One difficult transition is manageable. Several synchronized providers make it an engineering problem.",
    "The analytics moved before the narration caught up. That is worth verifying."
  ],
  anthropic:[
    "The conclusion sounds strong; the source boundary should be equally strong.",
    "A memorable provider interruption is a reminder that evidence should survive interruptions too.",
    "A careful reading separates what the speaker claimed from what the current data demonstrates.",
    "The new subject deserves context, not just a faster summary."
  ],
  "microsoft-foundry":[
    "The system changed subjects. It looks like you are analyzing something complicated.",
    "From Clippy to Copilot, the interface changed; the useful test is whether the evidence improved.",
    "This evidence could become a document, spreadsheet, presentation, and, somehow, a meeting.",
    "Copilot can act in a browser, but supervision remains part of the design.",
    "The useful next step is connecting this moment to an operational decision."
  ],
  openclaw:[
    "The subject changed; the autonomous workflow should verify its permissions before reorganizing Tuesday.",
    "Automation is useful when permissions arrive before enthusiasm.",
    "The provider shifted. OpenClaw would repair the workflow, then mention the four notifications it found.",
    "Autonomy needs receipts, boundaries, and a very visible stop control."
  ]
}

function curatedReaction(profile, eventId, subject){
  const pack = CURATED_PACKS[profile] || CURATED_PACKS["google-gemini"]
  const digest = crypto.createHash("sha256").update(`${profile}:${eventId}:${subject}`).digest()
  return pack[digest[0] % pack.length]
}

async function geminiReaction(evidence, sourceEvent){
  const apiKey = envValue("GEMINI_API_KEY") || envValue("GOOGLE_GEMINI_API_KEY")
  const model = envValue("GEMINI_REACTION_MODEL") || "gemini-2.5-flash-lite"
  if(!apiKey) return {ok:false, reason:"gemini-free-api-not-configured"}
  const prompt = [
    "You are the concise live Gemini reaction layer inside DigitalHut.",
    "Write one original reaction bubble of 12 to 38 words.",
    "React only to the supplied public evidence. Do not claim private knowledge.",
    "Be insightful; occasional dry humor is allowed when naturally appropriate, but do not label or select a tone.",
    "Do not mention being a chatbot. Do not give financial advice. Do not use markdown.",
    `Event: ${sourceEvent}`,
    `Evidence: ${JSON.stringify(evidence)}`
  ].join("\n")
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method:"POST",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({
          contents:[{role:"user", parts:[{text:prompt}]}],
          generationConfig:{temperature:0.75, maxOutputTokens:90}
        }),
        signal:AbortSignal.timeout(12000)
      }
    )
    const payload = await response.json().catch(() => ({}))
    const text = safeText(payload?.candidates?.[0]?.content?.parts?.map((part) => part.text).join(" "), 320)
    if(!response.ok || !text) return {ok:false, reason:response.status === 429 ? "gemini-free-quota-exhausted" : `gemini-request-${response.status}`}
    return {
      ok:true,
      provider:"google-gemini",
      model,
      text,
      inputTokens:Number(payload?.usageMetadata?.promptTokenCount || 0),
      outputTokens:Number(payload?.usageMetadata?.candidatesTokenCount || 0)
    }
  } catch { return {ok:false, reason:"gemini-request-failed"} }
}

function responseHash(text){
  return crypto.createHash("sha256").update(text).digest("hex")
}

async function recordReaction({
  userId,
  sessionId,
  eventId,
  mode,
  provider,
  model,
  evidence,
  sourceEvent,
  liveWindow,
  text,
  inputTokens,
  outputTokens,
  providerCostUsdMicros,
  creditLedgerEntryId,
  metadata
}){
  return supabaseRest("digitalhut_ai_reaction_receipts", {
    method:"POST",
    headers:{Prefer:"return=representation,resolution=ignore-duplicates"},
    body:JSON.stringify({
      user_id:userId || null,
      session_id:sessionId,
      event_id:eventId,
      mode,
      provider,
      model:model || null,
      subject_key:safeText(evidence.subject || evidence.videoTitle || "digitalhut", 180),
      reaction_key:mode === "curated" ? responseHash(text).slice(0, 24) : null,
      source_event:sourceEvent,
      live_window:liveWindow || null,
      provider_input_tokens:inputTokens || 0,
      provider_output_tokens:outputTokens || 0,
      provider_cost_usd_micros:Number(providerCostUsdMicros || 0),
      credit_ledger_entry_id:creditLedgerEntryId || null,
      response_hash:responseHash(text),
      metadata:metadata || {}
    })
  })
}

function encryptionKey(){
  const raw = envValue("AI_CONNECTION_ENCRYPTION_KEY")
  if(!raw) return null
  if(/^[a-f0-9]{64}$/i.test(raw)) return Buffer.from(raw, "hex")
  try {
    const decoded = Buffer.from(raw, "base64")
    return decoded.length === 32 ? decoded : crypto.createHash("sha256").update(raw).digest()
  } catch { return crypto.createHash("sha256").update(raw).digest() }
}

function credentialAad(userId, provider, keyVersion = 1){
  return Buffer.from(`digitalhut-ai-credential|${userId}|${provider}|v${keyVersion}`, "utf8")
}

function encryptCredential(value, userId, provider, keyVersion = 1){
  const key = encryptionKey()
  if(!key) throw new Error("connection-encryption-not-configured")
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv)
  cipher.setAAD(credentialAad(userId, provider, keyVersion))
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()])
  return {
    credential_ciphertext:encrypted.toString("base64"),
    credential_iv:iv.toString("base64"),
    credential_tag:cipher.getAuthTag().toString("base64"),
    credential_key_version:keyVersion
  }
}

function decryptCredential(row){
  const key = encryptionKey()
  if(!key) throw new Error("connection-encryption-not-configured")
  const keyVersion = Number(row.credential_key_version || 1)
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(row.credential_iv, "base64"))
  decipher.setAAD(credentialAad(row.user_id, row.provider, keyVersion))
  decipher.setAuthTag(Buffer.from(row.credential_tag, "base64"))
  return Buffer.concat([
    decipher.update(Buffer.from(row.credential_ciphertext, "base64")),
    decipher.final()
  ]).toString("utf8")
}

const AZURE_AI_HOSTS = [
  /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.services\.ai\.azure\.com$/i,
  /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.openai\.azure\.com$/i,
  /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.cognitiveservices\.azure\.com$/i
]

function normalizeFoundryConfig(project, deploymentValue = ""){
  let source = project
  let deployment = deploymentValue
  if(typeof project === "string" && project.trim().startsWith("{")){
    try {
      const parsed = JSON.parse(project)
      source = parsed?.endpoint || ""
      deployment = deployment || parsed?.deployment || ""
    } catch { return null }
  } else if(project && typeof project === "object"){
    source = project.endpoint || ""
    deployment = deployment || project.deployment || ""
  }
  try {
    const url = new URL(String(source || ""))
    const hostname = url.hostname.toLowerCase()
    if(
      url.protocol !== "https:"
      || (url.port && url.port !== "443")
      || url.username
      || url.password
      || url.search
      || url.hash
      || (url.pathname && url.pathname !== "/")
      || net.isIP(hostname)
      || hostname === "localhost"
      || hostname.endsWith(".local")
      || !AZURE_AI_HOSTS.some((pattern) => pattern.test(hostname))
    ) return null
    const normalizedDeployment = safeText(deployment, 100)
    if(!/^[a-z0-9][a-z0-9._-]{0,99}$/i.test(normalizedDeployment)) return null
    return {
      endpoint:url.origin,
      hostname,
      deployment:normalizedDeployment,
      kind:hostname.endsWith(".openai.azure.com") ? "azure-openai" : "azure-ai"
    }
  } catch { return null }
}

function foundryModelsUrl(config){
  return config.kind === "azure-openai"
    ? `${config.endpoint}/openai/models?api-version=2024-10-21`
    : `${config.endpoint}/models?api-version=2024-05-01-preview`
}

function foundryChatUrl(config){
  return config.kind === "azure-openai"
    ? `${config.endpoint}/openai/deployments/${encodeURIComponent(config.deployment)}/chat/completions?api-version=2024-10-21`
    : `${config.endpoint}/models/chat/completions?api-version=2024-05-01-preview`
}

async function validateProviderCredential(provider, credential, project, deployment){
  try {
    if(provider === "google-gemini"){
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(credential)}`, {signal:AbortSignal.timeout(8000)})
      return response.ok
    }
    if(provider === "openai"){
      const response = await fetch("https://api.openai.com/v1/models", {headers:{authorization:`Bearer ${credential}`}, signal:AbortSignal.timeout(8000)})
      return response.ok
    }
    if(provider === "anthropic"){
      const response = await fetch("https://api.anthropic.com/v1/models", {headers:{"x-api-key":credential, "anthropic-version":"2023-06-01"}, signal:AbortSignal.timeout(8000)})
      return response.ok
    }
    if(provider === "microsoft-foundry"){
      const config = normalizeFoundryConfig(project, deployment)
      if(!config) return false
      const response = await fetch(foundryModelsUrl(config), {
        headers:{"api-key":credential},
        redirect:"error",
        signal:AbortSignal.timeout(8000)
      })
      return response.ok
    }
    return false
  } catch { return false }
}

async function connectedReaction(provider, credential, project, evidence, sourceEvent){
  const prompt = [
    "Write one original DigitalHut reaction bubble of 12 to 38 words.",
    "Use only the public evidence below. Be concise, factual, and naturally witty only when the moment warrants it.",
    "Do not use markdown or describe yourself as a chatbot.",
    `Event: ${sourceEvent}`,
    `Evidence: ${JSON.stringify(evidence)}`
  ].join("\n")
  try {
    let response
    let model
    if(provider === "google-gemini"){
      model = envValue("GEMINI_CONNECTED_MODEL") || "gemini-2.5-flash-lite"
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(credential)}`, {
        method:"POST", headers:{"content-type":"application/json"},
        body:JSON.stringify({contents:[{role:"user",parts:[{text:prompt}]}],generationConfig:{maxOutputTokens:90,temperature:0.75}}),
        signal:AbortSignal.timeout(12000)
      })
      const data = await response.json().catch(() => ({}))
      const text = safeText(data?.candidates?.[0]?.content?.parts?.map((part) => part.text).join(" "), 320)
      return response.ok && text ? {ok:true, text, model, inputTokens:Number(data?.usageMetadata?.promptTokenCount || 0), outputTokens:Number(data?.usageMetadata?.candidatesTokenCount || 0)} : {ok:false}
    }
    if(provider === "openai"){
      model = envValue("OPENAI_REACTION_MODEL") || "gpt-5-mini"
      response = await fetch("https://api.openai.com/v1/responses", {
        method:"POST", headers:{authorization:`Bearer ${credential}`,"content-type":"application/json"},
        body:JSON.stringify({model,input:prompt,max_output_tokens:90}),
        signal:AbortSignal.timeout(12000)
      })
      const data = await response.json().catch(() => ({}))
      const text = safeText(data?.output_text || data?.output?.flatMap((item) => item.content || []).map((part) => part.text).join(" "), 320)
      return response.ok && text ? {ok:true, text, model, inputTokens:Number(data?.usage?.input_tokens || 0), outputTokens:Number(data?.usage?.output_tokens || 0)} : {ok:false}
    }
    if(provider === "anthropic"){
      model = envValue("ANTHROPIC_REACTION_MODEL") || "claude-3-5-haiku-latest"
      response = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"x-api-key":credential,"anthropic-version":"2023-06-01","content-type":"application/json"},
        body:JSON.stringify({model,max_tokens:90,messages:[{role:"user",content:prompt}]}),
        signal:AbortSignal.timeout(12000)
      })
      const data = await response.json().catch(() => ({}))
      const text = safeText(data?.content?.map((part) => part.text).join(" "), 320)
      return response.ok && text ? {ok:true, text, model, inputTokens:Number(data?.usage?.input_tokens || 0), outputTokens:Number(data?.usage?.output_tokens || 0)} : {ok:false}
    }
    if(provider === "microsoft-foundry"){
      const config = normalizeFoundryConfig(project)
      if(!config) return {ok:false, reason:"foundry-endpoint-invalid"}
      model = config.deployment
      response = await fetch(foundryChatUrl(config), {
        method:"POST", headers:{"api-key":credential,"content-type":"application/json"},
        body:JSON.stringify({
          ...(config.kind === "azure-ai" ? {model:config.deployment} : {}),
          messages:[{role:"user",content:prompt}],
          max_tokens:90,
          temperature:0.75
        }),
        redirect:"error",
        signal:AbortSignal.timeout(12000)
      })
      const data = await response.json().catch(() => ({}))
      const text = safeText(data?.choices?.[0]?.message?.content, 320)
      return response.ok && text ? {ok:true, text, model, inputTokens:Number(data?.usage?.prompt_tokens || 0), outputTokens:Number(data?.usage?.completion_tokens || 0)} : {ok:false}
    }
    return {ok:false}
  } catch { return {ok:false} }
}

async function activeConnection(userId, provider){
  if(!userId) return null
  const result = await supabaseRest(
    `digitalhut_ai_provider_connections?user_id=eq.${encodeURIComponent(userId)}&provider=eq.${encodeURIComponent(provider)}&status=eq.active&select=*`
  )
  return result.ok && Array.isArray(result.body) ? result.body[0] || null : null
}

function sharedProviderCredential(provider){
  if(provider === "google-gemini") return {credential:envValue("GEMINI_API_KEY") || envValue("GOOGLE_GEMINI_API_KEY"), project:""}
  if(provider === "openai") return {credential:envValue("OPENAI_API_KEY"), project:""}
  if(provider === "anthropic") return {credential:envValue("ANTHROPIC_API_KEY"), project:""}
  if(provider === "microsoft-foundry"){
    const config = normalizeFoundryConfig(
      envValue("AZURE_AI_FOUNDRY_ENDPOINT"),
      envValue("AZURE_AI_FOUNDRY_DEPLOYMENT")
    )
    return {
      credential:envValue("AZURE_AI_FOUNDRY_API_KEY"),
      project:config ? JSON.stringify(config) : ""
    }
  }
  return {credential:"", project:""}
}

function paidProviderReadiness(){
  const providers = [...PROVIDERS]
    .filter((provider) => provider !== "openclaw")
    .map((provider) => {
      const shared = sharedProviderCredential(provider)
      const model = configuredProviderModel(provider, shared.project)
      return {
        provider,
        credentialConfigured:Boolean(shared.credential),
        modelConfigured:Boolean(model),
        pricingConfigured:Boolean(model && providerPricingRule(provider, model))
      }
    })
  return {
    providers,
    readyProviders:providers.filter((item) =>
      item.credentialConfigured && item.modelConfigured && item.pricingConfigured
    ).map((item) => item.provider)
  }
}

function paidReactionPrice(provider){
  const specific = Number(envValue(`AI_REACTION_PRICE_${provider.replace(/-/g, "_").toUpperCase()}_MILLI_CREDITS`))
  const fallback = Number(envValue("AI_REACTION_PRICE_MILLI_CREDITS"))
  return Number.isInteger(specific) && specific > 0
    ? specific
    : Number.isInteger(fallback) && fallback > 0
      ? fallback
      : 1000
}

function configuredProviderModel(provider, project){
  if(provider === "google-gemini") return envValue("GEMINI_CONNECTED_MODEL") || "gemini-2.5-flash-lite"
  if(provider === "openai") return envValue("OPENAI_REACTION_MODEL") || "gpt-5-mini"
  if(provider === "anthropic") return envValue("ANTHROPIC_REACTION_MODEL") || "claude-3-5-haiku-latest"
  if(provider === "microsoft-foundry") return normalizeFoundryConfig(project)?.deployment || ""
  return ""
}

function providerPricingRule(provider, model){
  try {
    const parsed = JSON.parse(envValue("AI_PROVIDER_PRICE_USD_PER_MILLION_TOKENS_JSON") || "{}")
    const rule = parsed?.[`${provider}:${model}`] || parsed?.[provider]
    const input = Number(rule?.inputUsdPerMillion)
    const output = Number(rule?.outputUsdPerMillion)
    if(!Number.isFinite(input) || input < 0 || !Number.isFinite(output) || output < 0) return null
    return {
      inputUsdPerMillion:input,
      outputUsdPerMillion:output,
      currency:"USD",
      provider,
      model,
      configuredAt:safeText(rule?.configuredAt, 80) || null
    }
  } catch { return null }
}

function providerCostReceipt(rule, inputTokens, outputTokens){
  if(!rule) return {priced:false, costUsdMicros:0, snapshot:{}}
  const inputCostMicros = Math.ceil((Number(inputTokens || 0) * rule.inputUsdPerMillion))
  const outputCostMicros = Math.ceil((Number(outputTokens || 0) * rule.outputUsdPerMillion))
  return {
    priced:true,
    costUsdMicros:inputCostMicros + outputCostMicros,
    snapshot:{...rule, inputTokens:Number(inputTokens || 0), outputTokens:Number(outputTokens || 0)}
  }
}

function reactionReservationReference(userId, sessionId, eventId, provider){
  const digest = crypto.createHash("sha256")
    .update(`${userId}|${sessionId}|${eventId}|${provider}`)
    .digest("hex")
  return `reaction:${userId}:${digest}`
}

async function finalizeCreditReservation(userId, reserveId, success, accounting = {}){
  const result = await supabaseRpc("digitalhut_ai_finalize_reservation", {
    p_user_id:userId,
    p_reserve_entry_id:reserveId,
    p_success:Boolean(success),
    p_provider_cost_usd_micros:Number(accounting.providerCostUsdMicros || 0),
    p_input_tokens:Number(accounting.inputTokens || 0),
    p_output_tokens:Number(accounting.outputTokens || 0),
    p_price_snapshot:accounting.priceSnapshot || {},
    p_request_receipt:accounting.receipt || {}
  })
  const row = Array.isArray(result.body) ? result.body[0] : result.body
  return result.ok && row?.id ? {ok:true, row} : {ok:false, reason:"credit-finalization-failed"}
}

async function paidSharedReaction(user, provider, evidence, sourceEvent, eventId, sessionId){
  const price = paidReactionPrice(provider)
  const shared = sharedProviderCredential(provider)
  const model = configuredProviderModel(provider, shared.project)
  const pricing = providerPricingRule(provider, model)
  if(!user || !price || !shared.credential || !model) return {ok:false, reason:"paid-model-not-configured"}
  if(!pricing) return {ok:false, reason:"provider-cost-pricing-not-configured"}
  const reservation = await supabaseRpc("digitalhut_ai_reserve_credits", {
    p_user_id:user.id,
    p_milli_credits:price,
    p_provider:provider,
    p_model:model,
    p_external_reference:reactionReservationReference(user.id, sessionId, eventId, provider),
    p_request_receipt:{sourceEvent, sessionId, eventId}
  })
  const reserveRow = Array.isArray(reservation.body) ? reservation.body[0] : reservation.body
  if(!reservation.ok || !reserveRow?.id){
    const reason = String(reservation.body?.message || reservation.body?.hint || "")
    return {ok:false, reason:/insufficient/i.test(reason) ? "credits-exhausted" : "credit-reservation-failed"}
  }
  const live = await connectedReaction(provider, shared.credential, shared.project, evidence, sourceEvent)
  if(!live.ok){
    await finalizeCreditReservation(user.id, reserveRow.id, false, {
      receipt:{sourceEvent, reason:live.reason || "provider-unavailable"}
    })
    return {ok:false, reason:"provider-unavailable"}
  }
  const cost = providerCostReceipt(pricing, live.inputTokens, live.outputTokens)
  const finalized = await finalizeCreditReservation(user.id, reserveRow.id, true, {
    providerCostUsdMicros:cost.costUsdMicros,
    inputTokens:live.inputTokens,
    outputTokens:live.outputTokens,
    priceSnapshot:cost.snapshot,
    receipt:{sourceEvent, sessionId, eventId, responseHash:responseHash(live.text)}
  })
  if(!finalized.ok){
    return {
      ok:false,
      reason:"credit-finalization-pending",
      reservationId:reserveRow.id,
    }
  }
  return {
    ...live,
    ledgerId:finalized.row.id,
    chargedMilliCredits:price,
    providerCostUsdMicros:cost.costUsdMicros,
    accountingStatus:"finalized"
  }
}

function creditPacks(){
  try {
    const parsed = JSON.parse(envValue("AI_CREDIT_PACKS_JSON") || "{}")
    const configured = Object.fromEntries(Object.entries(parsed).filter(([key, pack]) =>
      /^[a-z0-9-]{2,40}$/.test(key)
      && Number.isInteger(pack?.usdCents) && pack.usdCents > 0
      && Number.isInteger(pack?.milliCredits) && pack.milliCredits > 0
    ))
    return {...DEFAULT_CREDIT_PACKS, ...configured}
  } catch { return DEFAULT_CREDIT_PACKS }
}

function paypalAiSettings(){
  const sandbox = envValue("PAYPAL_ENV").toLowerCase() === "sandbox"
  return {
    base:sandbox ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com",
    clientId:envValue("PAYPAL_CLIENT_ID"),
    secret:envValue("PAYPAL_CLIENT_SECRET"),
    environment:sandbox ? "sandbox" : "live"
  }
}

async function paypalAiToken(){
  const settings = paypalAiSettings()
  if(!settings.clientId || !settings.secret) return {ok:false, reason:"paypal-not-configured"}
  try {
    const response = await fetch(`${settings.base}/v1/oauth2/token`, {
      method:"POST",
      headers:{authorization:`Basic ${Buffer.from(`${settings.clientId}:${settings.secret}`).toString("base64")}`,"content-type":"application/x-www-form-urlencoded"},
      body:"grant_type=client_credentials",
      signal:AbortSignal.timeout(8000)
    })
    const body = await response.json().catch(() => ({}))
    return response.ok && body.access_token ? {ok:true, token:body.access_token, settings} : {ok:false, reason:"paypal-token-failed"}
  } catch { return {ok:false, reason:"paypal-token-failed"} }
}

async function createCreditOrder(req, payload){
  const user = await authenticatedUser(req)
  if(!user) return {status:401, body:{ok:false, reason:"sign-in-required"}}
  const providerReadiness = paidProviderReadiness()
  if(providerReadiness.readyProviders.length === 0){
    return {status:503, body:{ok:false, reason:"paid-ai-provider-pricing-not-configured"}}
  }
  const packs = creditPacks()
  const packKey = safeText(payload?.packKey, 40)
  const pack = packs[packKey]
  if(!pack) return {status:400, body:{ok:false, reason:"credit-pack-not-configured"}}
  const paypal = await paypalAiToken()
  if(!paypal.ok) return {status:503, body:{ok:false, reason:paypal.reason}}
  const amount = (pack.usdCents / 100).toFixed(2)
  const forwardedHost = safeText(req.headers?.["x-forwarded-host"] || req.headers?.host, 180)
  const forwardedProto = safeText(req.headers?.["x-forwarded-proto"], 12) === "http" ? "http" : "https"
  const allowedHost = /(^|\.)digitalhut\.app$/i.test(forwardedHost.split(":")[0]) || /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(forwardedHost)
  const returnBase = allowedHost ? `${forwardedProto}://${forwardedHost}` : "https://www.digitalhut.app"
  const returnUrl = `${returnBase}/?digitalhut_ai_checkout=return`
  const cancelUrl = `${returnBase}/?digitalhut_ai_checkout=cancelled`
  try {
    const response = await fetch(`${paypal.settings.base}/v2/checkout/orders`, {
      method:"POST",
      headers:{authorization:`Bearer ${paypal.token}`,"content-type":"application/json","paypal-request-id":crypto.randomUUID()},
      body:JSON.stringify({
        intent:"CAPTURE",
        application_context:{return_url:returnUrl,cancel_url:cancelUrl,user_action:"PAY_NOW"},
        purchase_units:[{custom_id:`digitalhut-ai:${user.id}:${packKey}`,amount:{currency_code:"USD",value:amount}}]
      }),
      signal:AbortSignal.timeout(10000)
    })
    const order = await response.json().catch(() => ({}))
    if(!response.ok || !order.id) return {status:502, body:{ok:false, reason:"paypal-order-create-failed"}}
    const saved = await supabaseRest("digitalhut_ai_credit_orders", {
      method:"POST", headers:{Prefer:"return=minimal"},
      body:JSON.stringify({user_id:user.id,paypal_order_id:order.id,pack_key:packKey,amount_usd_micros:pack.usdCents*10000,milli_credits:pack.milliCredits})
    })
    const approvalUrl = order.links?.find?.((link) => link.rel === "approve")?.href || ""
    return saved.ok
      ? {
        status:200,
        body:{
          ok:true,
          orderId:order.id,
          packKey,
          amountUsd:amount,
          milliCredits:pack.milliCredits,
          estimatedHours:pack.estimatedHours,
          estimateNotice:"Mixed-session estimate; actual duration varies by model, event frequency, and provider pricing.",
          approvalUrl,
          links:order.links || []
        }
      }
      : {status:503,body:{ok:false,reason:"credit-order-record-failed"}}
  } catch { return {status:502, body:{ok:false, reason:"paypal-order-create-failed"}} }
}

function paypalCaptureFromOrder(order){
  for(const unit of Array.isArray(order?.purchase_units) ? order.purchase_units : []){
    for(const payment of Array.isArray(unit?.payments?.captures) ? unit.payments.captures : []){
      if(payment?.status === "COMPLETED") return {unit, payment}
    }
  }
  return {unit:null, payment:null}
}

async function fetchPayPalOrder(paypal, orderId){
  try {
    const response = await fetch(`${paypal.settings.base}/v2/checkout/orders/${encodeURIComponent(orderId)}`, {
      headers:{authorization:`Bearer ${paypal.token}`},
      signal:AbortSignal.timeout(10000)
    })
    const body = await response.json().catch(() => ({}))
    return response.ok ? {ok:true, body} : {ok:false, body}
  } catch { return {ok:false, body:{}} }
}

function revenueAllocation(grossMicros, feeMicros){
  const safeFee = Math.max(0, Math.min(Number(grossMicros), Number(feeMicros || 0)))
  const net = Number(grossMicros) - safeFee
  const providerBudget = Math.floor(net * 55 / 100)
  const operatingReserve = Math.floor(net * 25 / 100)
  const ownerProfit = net - providerBudget - operatingReserve
  return {
    providerBudget,
    paymentFee:safeFee,
    operatingReserve,
    ownerProfit
  }
}

async function captureCreditOrder(req, payload){
  const user = await authenticatedUser(req)
  if(!user) return {status:401, body:{ok:false, reason:"sign-in-required"}}
  const orderId = safeText(payload?.orderId, 160)
  if(!/^[A-Z0-9-]{8,160}$/i.test(orderId)) return {status:400, body:{ok:false, reason:"invalid-paypal-order"}}
  const known = await supabaseRest(`digitalhut_ai_credit_orders?paypal_order_id=eq.${encodeURIComponent(orderId)}&user_id=eq.${encodeURIComponent(user.id)}&select=*`)
  const row = known.ok && Array.isArray(known.body) ? known.body[0] : null
  if(!row) return {status:404, body:{ok:false, reason:"credit-order-not-found"}}
  if(row.status === "captured") return {status:200, body:{ok:true,duplicate:true,milliCredits:row.milli_credits}}
  const paypal = await paypalAiToken()
  if(!paypal.ok) return {status:503, body:{ok:false, reason:paypal.reason}}
  try {
    const response = await fetch(`${paypal.settings.base}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
      method:"POST", headers:{authorization:`Bearer ${paypal.token}`,"content-type":"application/json","paypal-request-id":`digitalhut-ai-${orderId}`},
      signal:AbortSignal.timeout(12000)
    })
    let capture = await response.json().catch(() => ({}))
    if(!response.ok){
      const alreadyCaptured = Array.isArray(capture?.details)
        && capture.details.some((detail) => detail?.issue === "ORDER_ALREADY_CAPTURED")
      if(!alreadyCaptured) return {status:400, body:{ok:false, reason:"paypal-capture-verification-failed"}}
      const fetched = await fetchPayPalOrder(paypal, orderId)
      if(!fetched.ok) return {status:502, body:{ok:false, reason:"paypal-capture-reconciliation-failed"}}
      capture = fetched.body
    }
    const {unit, payment} = paypalCaptureFromOrder(capture)
    const receivedMicros = Math.round(Number(payment?.amount?.value || 0) * 1000000)
    const expectedCustomId = `digitalhut-ai:${user.id}:${row.pack_key}`
    if(
      capture.status !== "COMPLETED"
      || payment?.status !== "COMPLETED"
      || payment?.amount?.currency_code !== "USD"
      || receivedMicros !== Number(row.amount_usd_micros)
      || unit?.custom_id !== expectedCustomId
    ){
      return {status:400, body:{ok:false, reason:"paypal-capture-verification-failed"}}
    }
    const feeMicros = Math.round(Number(payment?.seller_receivable_breakdown?.paypal_fee?.value || 0) * 1000000)
    const allocation = revenueAllocation(receivedMicros, feeMicros)
    const receipt = {
      paypalOrderId:orderId,
      paypalCaptureId:payment.id,
      environment:paypal.settings.environment,
      currency:"USD",
      amountUsdMicros:receivedMicros
    }
    const committed = await supabaseRpc("digitalhut_ai_capture_credit_order", {
      p_user_id:user.id,
      p_paypal_order_id:orderId,
      p_paypal_capture_id:payment.id,
      p_provider_budget_usd_micros:allocation.providerBudget,
      p_payment_fee_usd_micros:allocation.paymentFee,
      p_operating_reserve_usd_micros:allocation.operatingReserve,
      p_owner_profit_usd_micros:allocation.ownerProfit,
      p_capture_receipt:receipt
    })
    const committedRow = Array.isArray(committed.body) ? committed.body[0] : committed.body
    if(!committed.ok || committedRow?.status !== "captured"){
      return {status:503, body:{ok:false, reason:"credit-order-atomic-commit-failed"}}
    }
    return {
      status:200,
      body:{
        ok:true,
        duplicate:Boolean(row.status === "captured"),
        milliCredits:row.milli_credits,
        accounting:{
          providerBudgetUsdMicros:allocation.providerBudget,
          paymentFeeUsdMicros:allocation.paymentFee,
          operatingReserveUsdMicros:allocation.operatingReserve,
          ownerProfitUsdMicros:allocation.ownerProfit
        }
      }
    }
  } catch { return {status:502, body:{ok:false, reason:"paypal-capture-failed"}} }
}

async function connectProvider(req, payload){
  const user = await authenticatedUser(req)
  if(!user) return {status:401, body:{ok:false, reason:"sign-in-required"}}
  const provider = safeText(payload?.provider, 60)
  const credential = String(payload?.credential || "").trim()
  const project = safeText(payload?.project, 500)
  const deployment = safeText(payload?.deployment, 100)
  if(!PROVIDERS.has(provider) || credential.length < 12 || credential.length > 1000) return {status:400, body:{ok:false, reason:"invalid-provider-connection"}}
  const foundryConfig = provider === "microsoft-foundry"
    ? normalizeFoundryConfig(project, deployment)
    : null
  if(provider === "microsoft-foundry" && !foundryConfig){
    return {status:400, body:{ok:false, reason:"foundry-endpoint-not-allowed"}}
  }
  const valid = await validateProviderCredential(provider, credential, project, deployment)
  if(!valid) return {status:400, body:{ok:false, reason:"provider-credential-validation-failed"}}
  let encrypted
  try { encrypted = encryptCredential(credential, user.id, provider, 1) }
  catch { return {status:503, body:{ok:false, reason:"connection-encryption-not-configured"}} }
  const hint = `****${credential.slice(-4)}`
  const accountHint = foundryConfig ? JSON.stringify(foundryConfig) : project || null
  const saved = await supabaseRest("digitalhut_ai_provider_connections?on_conflict=user_id,provider", {
    method:"POST",
    headers:{Prefer:"return=representation,resolution=merge-duplicates"},
    body:JSON.stringify({
      user_id:user.id,
      provider,
      connection_kind:"api-key",
      ...encrypted,
      credential_hint:hint,
      provider_account_hint:accountHint,
      status:"active",
      verified_at:new Date().toISOString(),
      updated_at:new Date().toISOString()
    })
  })
  return saved.ok
    ? {status:200, body:{ok:true, provider, status:"active", credentialHint:hint}}
    : {status:503, body:{ok:false, reason:saved.reason}}
}

async function disconnectProvider(req, payload){
  const user = await authenticatedUser(req)
  if(!user) return {status:401, body:{ok:false, reason:"sign-in-required"}}
  const provider = safeText(payload?.provider, 60)
  if(!PROVIDERS.has(provider)) return {status:400, body:{ok:false, reason:"invalid-provider"}}
  const result = await supabaseRest(
    `digitalhut_ai_provider_connections?user_id=eq.${encodeURIComponent(user.id)}&provider=eq.${encodeURIComponent(provider)}`,
    {method:"DELETE"}
  )
  return result.ok ? {status:200, body:{ok:true, provider, status:"disconnected"}} : {status:503, body:{ok:false, reason:result.reason}}
}

async function publicStatus(req){
  const user = await authenticatedUser(req)
  let connections = []
  let milliCredits = 0
  if(user){
    const [connectionResult, balanceResult] = await Promise.all([
      supabaseRest(`digitalhut_ai_provider_connections?user_id=eq.${encodeURIComponent(user.id)}&select=provider,status,credential_hint,provider_account_hint,verified_at`),
      supabaseRest(`digitalhut_ai_credit_balances?user_id=eq.${encodeURIComponent(user.id)}&select=milli_credits`)
    ])
    connections = connectionResult.ok && Array.isArray(connectionResult.body) ? connectionResult.body : []
    milliCredits = balanceResult.ok && Array.isArray(balanceResult.body) ? Number(balanceResult.body[0]?.milli_credits || 0) : 0
  }
  const providerReadiness = paidProviderReadiness()
  const paypalSettings = paypalAiSettings()
  const paidAiPurchaseReady = Boolean(
    paypalSettings.clientId
    && paypalSettings.secret
    && providerReadiness.readyProviders.length > 0
  )
  return {
    ok:true,
    curatedReady:true,
    sharedGeminiReady:Boolean(envValue("GEMINI_API_KEY") || envValue("GOOGLE_GEMINI_API_KEY")),
    sharedGeminiPolicy:{maxLiveReactions:3, durationMinutes:120, windows:3, curatedBetweenLive:true},
    creditPacks:Object.entries(creditPacks()).map(([key, pack]) => ({
      key,
      label:pack.label || key,
      usdCents:pack.usdCents,
      milliCredits:pack.milliCredits,
      estimatedHours:Number(pack.estimatedHours || 0),
      estimatedLiveReactions:Number(pack.estimatedLiveReactions || 0),
      savingsPercent:Number(pack.savingsPercent || 0)
    })),
    paidReactionPrices:Object.fromEntries([...PROVIDERS].map((provider) => [provider, paidReactionPrice(provider)]).filter(([, price]) => price > 0)),
    signedIn:Boolean(user),
    milliCredits,
    connections,
    accounting:{
      creditReservation:"atomic-before-provider-call",
      paidCapture:"atomic-paypal-receipt-and-ledger",
      revenueAllocation:{providerBudgetPercentOfNet:55, operatingReservePercentOfNet:25, ownerProfit:"remaining-net-after-fee"},
      providerPricingConfigured:Boolean(envValue("AI_PROVIDER_PRICE_USD_PER_MILLION_TOKENS_JSON"))
    },
    paidAiPurchaseReady,
    paidAiPurchaseBlocker:paidAiPurchaseReady
      ? null
      : providerReadiness.readyProviders.length === 0
        ? "provider-key-and-cost-pricing-required"
        : "paypal-server-configuration-required",
    readyPaidProviders:providerReadiness.readyProviders,
    providerLinks:{
      "google-gemini":"https://aistudio.google.com/app/apikey",
      openai:"https://platform.openai.com/settings/organization/api-keys",
      anthropic:"https://console.anthropic.com/settings/keys",
      "microsoft-foundry":"https://ai.azure.com/",
      openclaw:"https://openclaw.ai/"
    },
    usageEstimateNotice:"Pack hours estimate a mixed session with curated reactions between live provider calls. Actual duration varies by model, event frequency, and provider pricing.",
    consumerSubscriptionNotice:"Consumer ChatGPT, Claude, Gemini, or Copilot subscriptions do not transfer API usage to DigitalHut. Connect a developer API key or project where supported."
  }
}

async function react(req, payload){
  const sessionId = safeText(payload?.sessionId, 120)
  const eventId = safeText(payload?.eventId, 160)
  const sourceEvent = safeText(payload?.sourceEvent, 80)
  const profile = safeText(payload?.profile || "google-gemini", 60)
  if(!sessionId || !eventId || !ALLOWED_EVENTS.has(sourceEvent)) return {status:400, body:{ok:false, reason:"invalid-reaction-event"}}
  const evidence = safeEvidence(payload)
  const user = await authenticatedUser(req)
  const connection = await activeConnection(user?.id, profile)
  if(connection){
    try {
      const live = await connectedReaction(
        profile,
        decryptCredential(connection),
        connection.provider_account_hint,
        evidence,
        sourceEvent
      )
      if(live.ok){
        await recordReaction({
          userId:user.id, sessionId, eventId, mode:"user-connected", provider:profile,
          model:live.model, evidence, sourceEvent, text:live.text,
          inputTokens:live.inputTokens, outputTokens:live.outputTokens,
          metadata:{credentialOwner:"visitor"}
        })
        return {status:200, body:{ok:true,mode:"user-connected",provider:profile,model:live.model,text:live.text}}
      }
    } catch {}
  }
  if(payload?.liveMode === "digitalhut-paid" && user){
    const paid = await paidSharedReaction(user, profile, evidence, sourceEvent, eventId, sessionId)
    if(paid.ok){
      await recordReaction({
        userId:user.id, sessionId, eventId, mode:"digitalhut-paid", provider:profile,
        model:paid.model, evidence, sourceEvent, text:paid.text,
        inputTokens:paid.inputTokens, outputTokens:paid.outputTokens,
        providerCostUsdMicros:paid.providerCostUsdMicros,
        creditLedgerEntryId:paid.ledgerId,
        metadata:{
          chargedMilliCredits:paid.chargedMilliCredits,
          creditLedgerEntryId:paid.ledgerId,
          providerCostUsdMicros:paid.providerCostUsdMicros,
          accountingStatus:paid.accountingStatus
        }
      })
      return {
        status:200,
        body:{
          ok:true,
          mode:"digitalhut-paid",
          provider:profile,
          model:paid.model,
          text:paid.text,
          chargedMilliCredits:paid.chargedMilliCredits,
          accountingStatus:paid.accountingStatus
        }
      }
    }
    payload._paidFallbackReason = paid.reason
  }
  if(profile === "google-gemini"){
    const candidate = await eligibleTrialWindow(req, sessionId, eventId, sourceEvent, user?.id)
    if(candidate.eligible){
      const live = await geminiReaction(evidence, sourceEvent)
      if(live.ok){
        const trial = await commitTrialWindow(candidate)
        if(!trial.eligible) return {status:200, body:{ok:true,mode:"curated",provider:profile,text:curatedReaction(profile,eventId,evidence.subject || evidence.videoTitle)}}
        await recordReaction({
          userId:user?.id,
          sessionId,
          eventId,
          mode:"shared-free",
          provider:live.provider,
          model:live.model,
          evidence,
          sourceEvent,
          liveWindow:trial.window,
          text:live.text,
          inputTokens:live.inputTokens,
          outputTokens:live.outputTokens,
          metadata:{trialRemaining:trial.remaining}
        })
        return {status:200, body:{ok:true, mode:"live", provider:live.provider, model:live.model, text:live.text, trialRemaining:trial.remaining, liveWindow:trial.window}}
      }
    }
  }
  const text = curatedReaction(profile, eventId, evidence.subject || evidence.videoTitle)
  await recordReaction({
    userId:user?.id,
    sessionId,
    eventId,
    mode:"curated",
    provider:profile,
    evidence,
    sourceEvent,
    text,
    metadata:{fallback:true}
  })
  return {
    status:200,
    body:{
      ok:true,
      mode:"curated",
      provider:profile,
      text,
      fallbackReason:payload._paidFallbackReason || null,
      fallbackLabel:payload._paidFallbackReason === "credits-exhausted"
        ? "Credits exhausted - DigitalHut curated mode"
        : "DigitalHut curated mode"
    }
  }
}

export async function handleAiLayer(req){
  const contentLength = Number(req.headers?.["content-length"] || 0)
  if(contentLength > MAX_REQUEST_BYTES){
    return {status:413, body:{ok:false, reason:"request-too-large"}}
  }
  const payload = req.body && typeof req.body === "object"
    ? req.body
    : (() => { try { return JSON.parse(String(req.body || "{}")) } catch { return {} } })()
  if(Buffer.byteLength(JSON.stringify(payload || {}), "utf8") > MAX_REQUEST_BYTES){
    return {status:413, body:{ok:false, reason:"request-too-large"}}
  }
  const action = safeText(payload?.action || req.query?.action, 60)
  if(req.method === "GET") return {status:200, body:await publicStatus(req)}
  if(req.method !== "POST") return {status:405, body:{ok:false, reason:"method-not-allowed"}}
  const user = await authenticatedUser(req)
  const rate = await takeRateLimit(req, user?.id, action)
  if(!rate.ok){
    const status = rate.reason === "rate-limit-exceeded" ? 429 : 503
    return {status, body:{ok:false, reason:rate.reason}}
  }
  if(action === "react") return react(req, payload)
  if(action === "connect-provider") return connectProvider(req, payload)
  if(action === "disconnect-provider") return disconnectProvider(req, payload)
  if(action === "create-credit-order") return createCreditOrder(req, payload)
  if(action === "capture-credit-order") return captureCreditOrder(req, payload)
  return {status:400, body:{ok:false, reason:"unsupported-ai-action"}}
}

export const __aiLayerTest = Object.freeze({
  creditPacks,
  normalizeFoundryConfig,
  providerCostReceipt,
  revenueAllocation
})
