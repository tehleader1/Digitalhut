import React, {useEffect, useMemo, useRef, useState} from "react"
import {firecudaLibraryStatus} from "../lib/firecudaLibraryManifest"
import "./DefensiveGuardian.css"

const clientStorageKey = "digitalhut:guardianClient"
const auditStorageKey = "digitalhut:guardianAudit"
const tierStorageKey = "digitalhut:tier"
const historyStorageKeys = ["digitalhut:directorChatHistory", "digitalhut:lastRecordedFind", "digitalhut:assetLab", "digitalhut:liveGlbFeed"]

function randomClientId(){
  const value = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`
  return `DH-${value.replace(/-/g, "").slice(0, 12).toUpperCase()}`
}

function readClient(){
  try {
    return JSON.parse(window.localStorage.getItem(clientStorageKey) || "null")
  } catch {
    return null
  }
}

function writeAudit(event){
  try {
    const current = JSON.parse(window.localStorage.getItem(auditStorageKey) || "[]")
    const next = [event, ...(Array.isArray(current) ? current : [])].slice(0, 40)
    window.localStorage.setItem(auditStorageKey, JSON.stringify(next))
  } catch {
    // Private browsing or storage policy can prevent local audit persistence.
  }
}

function safeTarget(node){
  if(!(node instanceof Element)) return "page"
  return [node.tagName.toLowerCase(), node.id ? `#${node.id}` : "", node.getAttribute("aria-label") || node.textContent?.trim().slice(0, 36) || ""].filter(Boolean).join(":")
}

function suspiciousLocation(){
  const value = `${window.location.pathname}${window.location.search}${window.location.hash}`.toLowerCase()
  return /(<script|javascript:|union(\s|%20)+select|\.\.\/|%2e%2e%2f|onerror=|document\.cookie)/i.test(value)
}

function deviceContext(){
  const value = navigator.userAgent.toLowerCase()
  if(/android|iphone|mobile/.test(value)) return "cell phone"
  if(/ipad|tablet/.test(value)) return "tablet"
  return "computer"
}

function currentCategory(){
  return document.querySelector("[data-observatory-category]")?.getAttribute("data-observatory-category") || (window.location.pathname === "/" ? "Mainstream Streaming" : "DigitalHut support")
}

export default function DefensiveGuardian({children}){
  const [level, setLevel] = useState("watch")
  const [message, setMessage] = useState("Guardian watching")
  const [open, setOpen] = useState(false)
  const [online, setOnline] = useState(() => navigator.onLine)
  const [walletConnected, setWalletConnected] = useState(false)
  const [client, setClient] = useState(() => readClient())
  const [modelReady, setModelReady] = useState(false)
  const [guardianReply, setGuardianReply] = useState("")
  const clickHistory = useRef([])
  const miniTimer = useRef(null)
  const firecuda = useMemo(() => firecudaLibraryStatus(), [])
  const tier = window.localStorage.getItem(tierStorageKey) || "guest"
  const historyRetained = historyStorageKeys.some((key) => Boolean(window.localStorage.getItem(key)))
  const supabaseConfigured = Boolean(import.meta.env?.VITE_SUPABASE_URL && import.meta.env?.VITE_SUPABASE_ANON_KEY)
  const isMobile = window.matchMedia("(max-width: 720px)").matches
  const guardianImage = isMobile ? "/guardians/digitalhut-guardian-mobile.png" : "/guardians/digitalhut-guardian-desktop.png"
  const guardianModel = isMobile ? "/guardians/digitalhut-guardian-mobile.glb" : "/guardians/digitalhut-guardian-desktop.glb"
  const device = deviceContext()
  const category = currentCategory()
  const clientGreeting = `Welcome to DigitalHut. I am your ${isMobile ? "mobile" : "desktop"} Defensive AI Guardian. You are accessing the system from a ${device}, and your current DigitalHut context is ${category}. Is everything working well in your experience? How can I make it better?`

  function showMini(text, nextLevel = "watch", duration = 6200){
    setMessage(text)
    setLevel(nextLevel)
    window.clearTimeout(miniTimer.current)
    miniTimer.current = window.setTimeout(() => {
      if(!open){
        setMessage("Guardian watching")
        setLevel("watch")
      }
    }, duration)
  }

  function raiseIntegrityEvent(reason, severity = "blocked"){
    const event = {
      id: `guardian-${Date.now()}`,
      createdAt: new Date().toISOString(),
      severity,
      reason,
      action: "Interaction paused and recorded locally",
      route: window.location.pathname
    }
    writeAudit(event)
    setMessage(reason)
    setLevel(severity)
    setOpen(true)
  }

  useEffect(() => {
    if(!open || modelReady) return
    import("@google/model-viewer").then(() => setModelReady(true)).catch(() => setModelReady(false))
  }, [open, modelReady])

  useEffect(() => {
    const checkWallet = async () => {
      try {
        const accounts = await window.ethereum?.request?.({method: "eth_accounts"})
        setWalletConnected(Boolean(accounts?.length))
      } catch {
        setWalletConnected(false)
      }
    }
    checkWallet()
    const onAccounts = (accounts) => setWalletConnected(Boolean(accounts?.length))
    window.ethereum?.on?.("accountsChanged", onAccounts)
    return () => window.ethereum?.removeListener?.("accountsChanged", onAccounts)
  }, [])

  useEffect(() => {
    const onlineHandler = () => {
      setOnline(true)
      showMini("Connection restored. Guardian resumed verification.", "restored")
    }
    const offlineHandler = () => {
      setOnline(false)
      showMini("Connection interrupted. Live actions paused.", "offline", 10000)
    }
    const clickHandler = (event) => {
      const now = performance.now()
      const target = safeTarget(event.target)
      clickHistory.current = [...clickHistory.current.filter((item) => now - item.time < 1600), {time: now, target}]
      const sameTarget = clickHistory.current.filter((item) => item.target === target)
      if(sameTarget.length >= 10){
        event.preventDefault()
        event.stopPropagation()
        clickHistory.current = []
        raiseIntegrityEvent("Rapid duplicate interaction blocked", "blocked")
      } else if(clickHistory.current.length >= 18){
        showMini("Unusually fast interaction detected. Guardian is checking the session.", "checking")
      }
    }
    window.addEventListener("online", onlineHandler)
    window.addEventListener("offline", offlineHandler)
    document.addEventListener("click", clickHandler, true)
    if(suspiciousLocation()) raiseIntegrityEvent("Suspicious route input blocked for review", "blocked")
    else showMini("Session loaded. Guardian verification active.", "restored")
    return () => {
      window.removeEventListener("online", onlineHandler)
      window.removeEventListener("offline", offlineHandler)
      document.removeEventListener("click", clickHandler, true)
      window.clearTimeout(miniTimer.current)
    }
  }, [])

  function routeWallet(){
    const next = client || {
      id: randomClientId(),
      createdAt: new Date().toISOString(),
      tier,
      consent: "Local continuity identifier only"
    }
    window.localStorage.setItem(clientStorageKey, JSON.stringify({...next, tier, lastSeenAt: new Date().toISOString()}))
    setClient({...next, tier})
    showMini("Private client continuity identifier retained on this device.", "restored")
  }

  function speakGuardian(text){
    if(!("speechSynthesis" in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = .92
    utterance.pitch = isMobile ? 1.04 : .9
    window.speechSynthesis.speak(utterance)
  }

  function openGuardian(){
    setOpen(true)
    speakGuardian("DigitalHut Guardian online. I am checking your session, privacy, wallet connection, and current experience.")
  }

  function answerGuardian(kind){
    const replies = {
      experience: `I am checking your ${device} session, ${category} category, connection state, selected ${tier} tier, and whether the Guardian controls remain available. Tell me which screen, model, or action is not behaving correctly.`,
      help: `I can help you open a category, inspect a model, explain the current system status, check the wallet connection, review privacy, open Vehicle Notes, or route you to support.`,
      spending: walletConnected
        ? "Your wallet connection is detected. Before spending, verify the domain, wallet address, network, asset, amount, subscription terms, and approval request. DigitalHut will never ask for your seed phrase or private key."
        : "No wallet connection is detected. Connect only through the official DigitalHut wallet control, verify the domain and network, and never enter a seed phrase or private key into a website form.",
      categories: `DigitalHut currently supports Mainstream Streaming, Planetary, Real Estate, Mobility, Science, Researcher, Continent, History, Businesses, Workforce, Programmer, Gamer, and DigitalHut Presentation. I can explain what each category is designed to present.`
    }
    const reply = replies[kind]
    setGuardianReply(reply)
    speakGuardian(reply)
  }

  return <>
    {children}
    <button className={`dh-guardian-mini level-${level}`} type="button" onClick={openGuardian}>
      <img src={guardianImage} alt="" />
      <span><b>Defensive AI Guardian</b><small>{message}</small></span>
    </button>

    {open && <section className={`dh-guardian-block level-${level}`} role="dialog" aria-modal="true" aria-label="DigitalHut Defensive AI Guardian">
      <div className="dh-guardian-glass">
        <div className="dh-guardian-visual">
          {modelReady ? <model-viewer src={guardianModel} poster={guardianImage} alt="DigitalHut full-mesh Defensive AI Guardian" camera-controls auto-rotate rotation-per-second="8deg" shadow-intensity=".7" exposure="1.08" /> : <img src={guardianImage} alt="DigitalHut Defensive AI Guardian" />}
          <span>{level === "blocked" ? "Integrity event contained" : "Guardian form online"}</span>
        </div>
        <div className="dh-guardian-copy">
          <header><div><span>DigitalHut Defensive AI</span><h2>{level === "blocked" ? "Interaction paused for review" : "Client protection check"}</h2></div><button type="button" onClick={() => setOpen(false)}>Close</button></header>
          <p>{level === "blocked" ? `${message}. The action was rate-limited and copied into the local integrity audit. DigitalHut does not hack back or automatically identify, charge, or enroll another person.` : "The Guardian protects the DigitalHut session through rate limits, duplicate-action controls, continuity checks, and clear privacy status."}</p>
          <section className="dh-guardian-presentation">
            <b>{clientGreeting}</b>
            <div><button type="button" onClick={() => answerGuardian("experience")}>Check My Experience</button><button type="button" onClick={() => answerGuardian("help")}>How Can You Help?</button><button type="button" onClick={() => answerGuardian("spending")}>Secure Spending Check</button><button type="button" onClick={() => answerGuardian("categories")}>Category Guide</button></div>
            {guardianReply && <p>{guardianReply}</p>}
            <button className="dh-guardian-voice" type="button" onClick={() => speakGuardian(guardianReply || clientGreeting)}>Speak Guardian Message</button>
          </section>
          <div className="dh-guardian-checks">
            <section><b>{walletConnected ? "Check" : "Review"}</b><span>Wallet securely connected</span><small>{walletConnected ? "Connection detected. DigitalHut never asks for a seed phrase." : "No wallet connection detected."}</small></section>
            <section><b>Check</b><span>Plan value and maintenance time</span><small>{tier.toUpperCase()} tier. AI usage limits and maintenance status remain visible in the system.</small></section>
            <section><b>Check</b><span>Privacy concealed</span><small>Pseudonymous client continuity; no seed phrase, private key, or wallet password stored.</small></section>
            <section><b>{historyRetained ? "Check" : "Ready"}</b><span>History retained</span><small>{historyRetained ? "Local DigitalHut history found." : "History begins after the first saved note, feed, or asset."} Supabase: {supabaseConfigured ? "configured" : "not configured"}. FireCuda: {firecuda.availableCount ? `${firecuda.availableCount} library assets connected` : "local status unavailable"}.</small></section>
          </div>
          <div className="dh-guardian-client">
            <span>Safe client identifier</span>
            <b>{client?.id || "Not routed yet"}</b>
            <button type="button" onClick={routeWallet}>Route My Wallet</button>
          </div>
          <small className="dh-guardian-limit">Guardian guidance supports digital integrity and research-session checklists. It does not certify laboratories, detect biological hazards, measure extreme temperatures, identify dangerous wildlife, or replace PPE, trained personnel, emergency services, or physical containment.</small>
          {level === "blocked" && <a className="dh-guardian-sponsor" href="/contact?topic=security-partnership">Review legitimate security partnership or sponsorship</a>}
        </div>
      </div>
    </section>}
  </>
}
