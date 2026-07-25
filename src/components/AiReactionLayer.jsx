import React, {useCallback, useEffect, useMemo, useRef, useState} from "react"
import "./AiReactionLayer.css"

const PROVIDERS = [
  {id:"google-gemini", name:"Gemini", company:"Google", accent:"#7aa7ff"},
  {id:"openai", name:"GPT / Codex", company:"OpenAI", accent:"#73e7c0"},
  {id:"anthropic", name:"Claude", company:"Anthropic", accent:"#e6a777"},
  {id:"microsoft-foundry", name:"Copilot / Foundry", company:"Microsoft", accent:"#7cc7ff"},
  {id:"openclaw", name:"OpenClaw", company:"OpenClaw", accent:"#ff806b"},
]

const LOCAL_CURATED = {
  "google-gemini":[
    "The video and analytics just changed together. Compare the visible evidence before treating the new subject as settled.",
    "Google Search moved toward AI Mode; DigitalHut keeps the source trail visible while the scene changes.",
    "A multimodal read is strongest when the narration, image, measurement, and source all agree.",
    "New subject detected. The useful question is whether the evidence changed with the headline."
  ],
  openai:[
    "The subject changed. DigitalHut is rebuilding the evidence scene before drawing a conclusion.",
    "One model can summarize this moment. Synchronizing video, analytics, audio, and 3D evidence is the harder part.",
    "The analytics moved before the narration caught up. That deserves a second look.",
    "A strong answer still needs receipts. The source trail remains attached to this reaction."
  ],
  anthropic:[
    "The conclusion sounds strong; the source boundary should be equally strong.",
    "A careful read separates what the speaker claimed from what the current evidence demonstrates.",
    "The new subject deserves context, not only a faster summary.",
    "This is the part where caution becomes useful instead of decorative."
  ],
  "microsoft-foundry":[
    "The subject changed. It looks like you are analyzing something complicated.",
    "From Clippy to Copilot, the interface changed; the useful test is whether the evidence improved.",
    "This evidence could become a document, spreadsheet, presentation, and, somehow, a meeting.",
    "The useful next step is connecting this moment to an operational decision.",
    "New evidence arrived. Somewhere, a progress bar has become emotionally invested."
  ],
  openclaw:[
    "The subject changed; the automation noticed before reorganizing your Tuesday.",
    "Automation is useful when permissions arrive before enthusiasm.",
    "Autonomy needs receipts, boundaries, and a very visible stop control.",
    "The provider shifted. I will observe the workflow without volunteering to manage your bank account."
  ],
}

function safe(value, fallback = ""){
  return String(value || "").replace(/\s+/g, " ").trim() || fallback
}

function sessionId(){
  const key = "digitalhut:ai-reaction-session"
  try {
    const stored = window.localStorage.getItem(key)
    if(stored) return stored
    const created = globalThis.crypto?.randomUUID?.() || `dh-${Date.now()}-${Math.random().toString(36).slice(2)}`
    window.localStorage.setItem(key, created)
    return created
  } catch {
    return `dh-${Date.now()}-${Math.random().toString(36).slice(2)}`
  }
}

function curatedText(profile, eventKey, subject){
  const pack = LOCAL_CURATED[profile] || LOCAL_CURATED["google-gemini"]
  const seed = `${eventKey}:${subject}`.split("").reduce((total, character) => total + character.charCodeAt(0), 0)
  return pack[seed % pack.length]
}

function creditLabel(milliCredits){
  const credits = Math.max(0, Number(milliCredits || 0)) / 1000
  return credits >= 100 ? credits.toLocaleString(undefined, {maximumFractionDigits:0}) : credits.toLocaleString(undefined, {maximumFractionDigits:2})
}

function safeSlot(value){
  const seed = String(value || "").split("").reduce((total, character) => total + character.charCodeAt(0), 0)
  return seed % 6
}

export default function AiReactionLayer({
  endpoint = "/api/provider-status?scope=ai",
  accessToken = "",
  signedIn = false,
  eventKey = "",
  sourceEvent = "subject_changed",
  subject = "",
  evidence = {},
  active = true,
}){
  const [profile, setProfile] = useState(() => {
    try { return window.localStorage.getItem("digitalhut:ai-profile") || "google-gemini" } catch { return "google-gemini" }
  })
  const [status, setStatus] = useState({curatedReady:true, sharedGeminiReady:false, sharedGeminiPolicy:{maxLiveReactions:3,durationMinutes:120,windows:3}, milliCredits:0, connections:[], creditPacks:[], paidAiPurchaseReady:false})
  const [reaction, setReaction] = useState(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [credential, setCredential] = useState("")
  const [project, setProject] = useState("")
  const [deployment, setDeployment] = useState("")
  const [connectionMessage, setConnectionMessage] = useState("")
  const [expanded, setExpanded] = useState(true)
  const [reactionCycle, setReactionCycle] = useState(0)
  const [bubbleSlot, setBubbleSlot] = useState(0)
  const latestRequest = useRef(0)
  const latestContext = useRef({evidence, sourceEvent, subject})
  const stableSessionId = useMemo(() => sessionId(), [])
  const selected = PROVIDERS.find((item) => item.id === profile) || PROVIDERS[0]
  const connected = status.connections?.find((item) => item.provider === profile && item.status === "active")

  const headers = useCallback(() => {
    return {"content-type":"application/json", ...(accessToken ? {authorization:`Bearer ${accessToken}`} : {})}
  }, [accessToken])

  const refreshStatus = useCallback(async () => {
    try {
      const response = await fetch(endpoint, {headers:accessToken ? {authorization:`Bearer ${accessToken}`} : {}})
      const payload = await response.json()
      if(response.ok && payload?.ok) setStatus((current) => ({...current, ...payload}))
    } catch {
      setStatus((current) => ({...current, curatedReady:true}))
    }
  }, [accessToken, endpoint])

  useEffect(() => { refreshStatus() }, [refreshStatus])

  useEffect(() => {
    const query = new URLSearchParams(window.location.search)
    const checkout = query.get("digitalhut_ai_checkout")
    const orderId = query.get("token")
    if(checkout !== "return" || !orderId || !signedIn) return
    let activeRequest = true
    setConnectionMessage("Verifying your PayPal payment and adding credits...")
    fetch(endpoint, {
      method:"POST",
      headers:headers(),
      body:JSON.stringify({scope:"ai", action:"capture-credit-order", orderId})
    }).then(async (response) => ({response,payload:await response.json()}))
      .then(async ({response,payload}) => {
        if(!activeRequest) return
        if(!response.ok || !payload?.ok) throw new Error(payload?.reason || "capture-verification-failed")
        setConnectionMessage(`${creditLabel(payload.milliCredits)} paid credits added.`)
        await refreshStatus()
        query.delete("digitalhut_ai_checkout")
        query.delete("token")
        query.delete("PayerID")
        window.history.replaceState({}, "", `${window.location.pathname}${query.toString() ? `?${query}` : ""}${window.location.hash}`)
      })
      .catch((error) => activeRequest && setConnectionMessage(`Payment not credited: ${safe(error?.message, "verification pending")}.`))
    return () => { activeRequest = false }
  }, [endpoint, headers, refreshStatus, signedIn])

  useEffect(() => {
    try { window.localStorage.setItem("digitalhut:ai-profile", profile) } catch {}
    setConnectionMessage("")
    setReaction(null)
    setReactionCycle(0)
  }, [profile])

  useEffect(() => {
    latestContext.current = {evidence, sourceEvent, subject}
  }, [evidence, sourceEvent, subject])

  useEffect(() => {
    if(!active || !eventKey) return undefined
    let timer = 0
    let cancelled = false
    const schedule = (cycle) => {
      const wait = 18000 + safeSlot(`${eventKey}:${profile}:${cycle}`) * 2800
      timer = window.setTimeout(() => {
        if(cancelled) return
        setReactionCycle((value) => value + 1)
        schedule(cycle + 1)
      }, wait)
    }
    schedule(1)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [active, eventKey, profile])

  useEffect(() => {
    if(!active || !eventKey) return undefined
    const requestId = ++latestRequest.current
    const requestEventId = `${eventKey}:${profile}:${reactionCycle}`
    const currentContext = latestContext.current
    const requestSourceEvent = reactionCycle === 0 ? currentContext.sourceEvent : "important_moment"
    const delay = reactionCycle === 0
      ? 2800 + (eventKey.length * 307 % 2400)
      : 2400 + (safeSlot(requestEventId) * 600)
    const timer = window.setTimeout(async () => {
      const fallback = {
        ok:true,
        mode:"curated",
        provider:profile,
        text:curatedText(profile, requestEventId, currentContext.subject),
        localFallback:true,
      }
      if(requestId === latestRequest.current){
        setReaction(fallback)
        setBubbleSlot(safeSlot(`${requestEventId}:${fallback.text}`))
      }
      const controller = new AbortController()
      const requestTimeout = window.setTimeout(() => controller.abort(), 5000)
      try {
        const response = await fetch(endpoint, {
          method:"POST",
          headers:headers(),
          signal:controller.signal,
          body:JSON.stringify({
            scope:"ai",
            action:"react",
            sessionId:stableSessionId,
            eventId:requestEventId,
            sourceEvent:requestSourceEvent,
            profile,
            liveMode:status.milliCredits > 0 ? "digitalhut-paid" : "automatic",
            evidence:{
              ...currentContext.evidence,
              subject:safe(currentContext.subject, currentContext.evidence?.subject)
            }
          })
        })
        const payload = await response.json()
        if(requestId === latestRequest.current){
          const nextReaction = response.ok && payload?.ok ? payload : fallback
          setReaction(nextReaction)
          setBubbleSlot(safeSlot(`${requestEventId}:${nextReaction.mode}:${nextReaction.text}`))
        }
      } catch {
        if(requestId === latestRequest.current){
          setReaction(fallback)
          setBubbleSlot(safeSlot(`${requestEventId}:${fallback.text}`))
        }
      } finally {
        window.clearTimeout(requestTimeout)
      }
    }, delay)
    return () => window.clearTimeout(timer)
  }, [active, endpoint, eventKey, headers, profile, reactionCycle, stableSessionId, status.milliCredits])

  async function updateConnection(action){
    if(!signedIn){
      setConnectionMessage("Sign in to connect a developer API project.")
      return
    }
    setConnectionMessage(action === "connect-provider" ? "Verifying developer credentials..." : "Disconnecting...")
    try {
      const response = await fetch(endpoint, {
        method:"POST",
        headers:headers(),
        body:JSON.stringify({scope:"ai", action, provider:profile, credential, project, deployment})
      })
      const payload = await response.json()
      if(!response.ok || !payload?.ok) throw new Error(payload?.reason || "request-failed")
      setCredential("")
      setDeployment("")
      setConnectionMessage(action === "connect-provider" ? "Developer project connected." : "Developer project disconnected.")
      await refreshStatus()
    } catch (error) {
      setConnectionMessage(`Connection not changed: ${safe(error?.message, "provider verification failed")}.`)
    }
  }

  async function beginCreditOrder(packKey){
    if(!signedIn){
      setConnectionMessage("Sign in before purchasing live-inference credits.")
      setSettingsOpen(true)
      return
    }
    if(!status.paidAiPurchaseReady){
      setConnectionMessage("Live-credit checkout is waiting for a verified model API price and provider key. Curated DigitalHut mode remains free.")
      setSettingsOpen(true)
      return
    }
    setConnectionMessage("Opening secure PayPal checkout...")
    try {
      const response = await fetch(endpoint, {
        method:"POST",
        headers:headers(),
        body:JSON.stringify({scope:"ai", action:"create-credit-order", packKey})
      })
      const payload = await response.json()
      if(!response.ok || !payload?.ok) throw new Error(payload?.reason || "checkout-unavailable")
      const approval = payload.approvalUrl || payload.links?.find?.((link) => link.rel === "approve")?.href
      if(!approval) throw new Error("approval-link-missing")
      window.location.assign(approval)
    } catch (error) {
      setConnectionMessage(`Credit checkout unavailable: ${safe(error?.message, "configuration pending")}.`)
      setSettingsOpen(true)
    }
  }

  const modeLabel = reaction?.mode === "live"
    ? `Live ${reaction.model || selected.name}`
    : reaction?.mode === "user-connected"
      ? `Your ${reaction.model || selected.name} project`
      : reaction?.mode === "digitalhut-paid"
        ? `DigitalHut credits / ${reaction.model || selected.name}`
        : reaction?.fallbackLabel || "Curated DigitalHut reaction"

  return <aside className={`dh-ai-reaction-layer ${expanded ? "expanded" : "collapsed"} ${reaction?.mode === "live" || reaction?.mode === "user-connected" || reaction?.mode === "digitalhut-paid" ? "is-live" : "is-curated"}`} style={{"--ai-accent":selected.accent}} aria-label="Powered by AI reaction layer">
    <header>
      <button type="button" className="dh-ai-powered-mark" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>
        <span className="dh-ai-wordmark">{selected.company}</span>
        <span>Powered by AI</span>
        <small>{expanded ? "Hide" : selected.name}</small>
      </button>
      {expanded && <label>
        <span>Reaction model</span>
        <select value={profile} onChange={(event) => setProfile(event.target.value)}>
          {PROVIDERS.map((provider) => <option key={provider.id} value={provider.id}>{provider.name} / {provider.company}</option>)}
        </select>
      </label>}
      {expanded && <button type="button" className="dh-ai-settings-button" onClick={() => setSettingsOpen((value) => !value)}>{settingsOpen ? "Close" : "Credits + connection"}</button>}
    </header>

    {expanded && <div className="dh-ai-reaction-body">
      <div className="dh-ai-model-identity"><span className="dh-ai-wordmark">{selected.company}</span><div><b>{selected.name}</b><span>{selected.company} profile</span></div></div>
      <div className="dh-ai-reaction-sky" aria-label="Reserved AI reaction space">
        <div key={reaction ? `${profile}:${reactionCycle}:${reaction.text}` : `${profile}:waiting`} className={`dh-ai-bubble slot-${bubbleSlot}`} role="status" aria-live="polite">
          <span>{reaction?.text || "Watching for a meaningful video, analytics, podcast, market, or 3D subject change."}</span>
          <small>{reaction ? modeLabel : "Curated system ready"}</small>
        </div>
      </div>
      <div className="dh-ai-truth-strip">
        <span className={reaction?.mode === "live" ? "live" : ""}>{reaction?.mode === "live" ? `Shared-free live ${reaction.liveWindow || ""}/3` : "Free curated"}</span>
        <span>{connected ? "Developer project connected" : "No developer project connected"}</span>
        <span>{creditLabel(status.milliCredits)} credits</span>
      </div>
    </div>}

    {expanded && settingsOpen && <section className="dh-ai-settings">
      <div className="dh-ai-session-policy">
        <b>Gemini first-visitor live trial</b>
        <span>Up to 3 genuine live bubbles, spread across one continuous 2-hour session and blended between free curated reactions.</span>
        <small>Refreshing does not restart the session. Curated reactions continue when a live window, quota, connection, or credit balance is unavailable.</small>
      </div>
      <div className="dh-ai-connect">
        <b>Use your developer project</b>
        <span>Consumer chat subscriptions do not normally include API use here. Connect a provider developer key; it is sent to the server for encrypted storage and never displayed again.</span>
        {connected ? <div className="dh-ai-connected"><strong>Connected</strong><span>{connected.credential_hint || "Verified credential"}</span><button type="button" onClick={() => updateConnection("disconnect-provider")}>Disconnect</button></div> : <>
          <input type="password" autoComplete="off" value={credential} onChange={(event) => setCredential(event.target.value)} placeholder={`${selected.name} developer API key`} />
          {profile === "microsoft-foundry" && <input value={project} onChange={(event) => setProject(event.target.value)} placeholder="Microsoft Foundry project endpoint" />}
          {profile === "microsoft-foundry" && <input value={deployment} onChange={(event) => setDeployment(event.target.value)} placeholder="Microsoft Foundry deployment name" />}
          <button type="button" disabled={!credential} onClick={() => updateConnection("connect-provider")}>Verify + connect</button>
        </>}
        {status.providerLinks?.[profile] && <a href={status.providerLinks[profile]} target="_blank" rel="noreferrer">Open {selected.company} developer setup</a>}
      </div>
      <div className="dh-ai-credit-packs">
        <b>DigitalHut live-inference credits</b>
        <span>Purchased credits pay the selected model's API usage, transaction/operating costs, and DigitalHut's disclosed service margin. There are no promotional credit grants.</span>
        <div>{(status.creditPacks || []).map((pack) => <button key={pack.key} type="button" disabled={!status.paidAiPurchaseReady} onClick={() => beginCreditOrder(pack.key)}>
          <b>${(Number(pack.usdCents || 0) / 100).toFixed(2)}</b>
          <span>about {Number(pack.estimatedHours || 0)} mixed-session hours</span>
          <small>{creditLabel(pack.milliCredits)} credits{Number(pack.savingsPercent || 0) > 0 ? ` / ${pack.savingsPercent}% more session value` : ""}</small>
        </button>)}</div>
        <small>Estimates assume curated DigitalHut reactions between live model calls. Actual time varies by model, event density, and provider pricing. When credits run out, paid calls stop and the system switches to labeled curated mode.</small>
        {!status.paidAiPurchaseReady && <small>Checkout is locked until a paid model provider key and current cost pricing are verified server-side. No DigitalHut credits can be sold prematurely.</small>}
        {!status.creditPacks?.length && <small>Credit packs are waiting for owner pricing and PayPal configuration. No charge can start yet.</small>}
      </div>
      {connectionMessage && <p role="status">{connectionMessage}</p>}
    </section>}
  </aside>
}
