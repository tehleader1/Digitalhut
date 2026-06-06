"use client"

import {useEffect, useMemo, useRef, useState} from "react"
import DiscoveryRunnerConsole from "../components/DiscoveryRunnerConsole"
import ModelRotationChooser from "../components/ModelRotationChooser"
import library from "../data/platform-libraries.json"
import {getPersonaFeature, getPersonaMarket, getPersonaSignal} from "../lib/personaFeature"
import {getWalletPermissionState} from "../lib/walletPermissions"

const tiers = {free: 0, standard: 35, premium: 50, pro: 100}

function cleanSearchQuery(value) {
  return String(value || "")
    .replace(/\b(project\s*)?glb\b/gi, "")
    .replace(/\b3d\s*model\b/gi, "")
    .replace(/\b3d\b/gi, "")
    .replace(/\bobservatory\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()
}

function defaultAdaptiveState() {
  const feature = getPersonaFeature("home-project")
  return {
    intent: feature.intent,
    confidence: 0.45,
    reason: "Waiting for visitor signal",
    hero: {
      eyebrow: "DigitalHut Observatory",
      title: "Adaptive market, model, blog, and agent console.",
      primaryAction: "Run Observatory Scan"
    },
    observatory: {preloadQuery: feature.mainGLBSearch, category: feature.observatory?.category || feature.intent},
    market: feature.market,
    premium: {
      trigger: "first-scan",
      message: "Explore model libraries and agent research before unlocking premium depth.",
      active: false
    }
  }
}

function signalFromAdaptive(state) {
  const personaSignal = getPersonaSignal(state.intent)
  return {
    ...personaSignal,
    tone: `${personaSignal.tone} ${state.reason || ""}`.trim(),
    priority: personaSignal.priority || "Adaptive"
  }
}

function normalizeFeed(feed = {}, options = {}) {
  const query = cleanSearchQuery(feed.query || feed.mainGLBSearch || feed.title || "wall street new york financial district")
  const title = feed.title || feed.mainFeatureTitle || query
  return {
    id: feed.id || `${feed.intent || feed.category || "feed"}:${query}`,
    intent: feed.intent || "home-project",
    title,
    query,
    category: feed.category || feed.mood || feed.marketProfile || "observatory",
    source: feed.source || "curated-feed",
    marketSymbols: feed.marketSymbols || feed.market?.symbols || [],
    modelUrl: feed.modelUrl || feed.glbUrl || feed.downloadUrl || "",
    terrainUrl: feed.terrainUrl || query,
    previewImage: feed.previewImage || feed.image || "",
    feedUrl: feed.feedUrl || feed.url || "",
    agentNarration: feed.agentNarration || feed.ai || `${title}. ${query}`,
    context: feed.context || feed.contextGLBSearch || "",
    speakOnSelect: Boolean(options.speak)
  }
}

function feedFromFeature(feature, options = {}) {
  return normalizeFeed({
    id: `feature:${feature.intent}`,
    intent: feature.intent,
    title: feature.mainFeatureTitle,
    query: feature.mainGLBSearch,
    category: feature.observatory?.category || feature.marketProfile || feature.intent,
    source: "feature",
    marketSymbols: feature.market?.symbols || [],
    agentNarration: `${feature.mainFeatureTitle}. ${feature.blogAngle}`,
    context: feature.contextGLBSearch
  }, options)
}

function feedFromChoice(choice, index) {
  const query = cleanSearchQuery(choice.query || choice.title)
  return normalizeFeed({
    id: `live-library:${index}:${query}`,
    title: choice.title,
    category: choice.mood || "library",
    intent: choice.intent || "observatory-guest",
    source: "live-library-pulse",
    previewImage: choice.previewImage,
    query,
    terrainUrl: query,
    agentNarration: `${choice.title}. ${choice.mood || "Public observatory feed"}`
  })
}

function pulseCadenceMs(engagement) {
  const fastFromHover = Math.min(engagement.hoverPreview, 10) * 650
  const fastFromRenderer = Math.min(engagement.rendererFocus, 10) * 550
  const slowFromSettled = Math.min(engagement.settledCycles, 8) * 900
  return Math.max(7000, Math.min(42000, 16000 - fastFromHover - fastFromRenderer + slowFromSettled))
}

export default function Home() {
  const initialFeature = useMemo(() => getPersonaFeature("home-project"), [])
  const adaptiveFeeds = useMemo(() => {
    const choices = Array.isArray(library.modelChoices) ? library.modelChoices.map(feedFromChoice) : []
    return [feedFromFeature(initialFeature), ...choices]
  }, [initialFeature])

  const [wallet, setWallet] = useState("")
  const [tier, setTier] = useState("free")
  const [currency, setCurrency] = useState("ETH")
  const [query, setQuery] = useState(initialFeature.mainGLBSearch)
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const [signal, setSignal] = useState(getPersonaSignal("home-project"))
  const [health, setHealth] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [adaptive, setAdaptive] = useState(defaultAdaptiveState())
  const [activeFeed, setActiveFeed] = useState(() => feedFromFeature(initialFeature))
  const [toast, setToast] = useState("Live observatory app stage ready")
  const [drawer, setDrawer] = useState("runner")
  const [engagement, setEngagement] = useState({hoverPreview: 0, rendererFocus: 0, manualSelect: 0, settledCycles: 0})

  const spokenFeedRef = useRef("")
  const pulseRef = useRef(0)
  const lastEngagementRef = useRef(0)
  const cadenceMs = pulseCadenceMs(engagement)
  const personaFeature = useMemo(() => getPersonaFeature(activeFeed.intent || adaptive.intent), [activeFeed.intent, adaptive.intent])
  const personaMarket = useMemo(() => getPersonaMarket(activeFeed.intent || adaptive.intent), [activeFeed.intent, adaptive.intent])
  const marketSymbols = activeFeed.marketSymbols?.length ? activeFeed.marketSymbols : personaMarket?.symbols || adaptive?.market?.symbols || ["BTC", "ETH", "AAPL", "TSLA"]
  const defaultMarketSymbol = marketSymbols[0] || "BTC"
  const marketHref = `/market-intelligence?symbol=${encodeURIComponent(defaultMarketSymbol)}&entry=${encodeURIComponent(activeFeed.intent || adaptive.intent)}`
  const walletPermission = useMemo(() => {
    return getWalletPermissionState({wallet, tier, requiredTier: personaFeature.downloadTier, action: personaFeature.walletAction})
  }, [wallet, tier, personaFeature])
  const providers = health?.providers || {}
  const providerStatus = providers.alpacaDetected ? "alpaca-ready" : "fallback-market"
  const subscriptionState = subscription || {tier}

  useEffect(() => {
    refreshHealth()
    refreshAdaptive()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      if (busy || adaptiveFeeds.length === 0) return
      pulseRef.current = (pulseRef.current + 1) % adaptiveFeeds.length
      const nextFeed = normalizeFeed(adaptiveFeeds[pulseRef.current], {speak: false})
      const nextSignal = signalFromAdaptive(adaptive)
      setSignal(nextSignal)
      setActiveFeed(nextFeed)
      setQuery(nextFeed.query)
      setToast(`Adaptive pulse: ${nextFeed.title}. Cadence ${Math.round(cadenceMs / 1000)}s from renderer engagement.`)
      setEngagement((current) => ({...current, settledCycles: current.settledCycles + 1}))
    }, cadenceMs)
    return () => clearInterval(timer)
  }, [adaptive, adaptiveFeeds, busy, cadenceMs])

  useEffect(() => {
    if (!activeFeed?.speakOnSelect || !activeFeed.agentNarration || spokenFeedRef.current === activeFeed.id) return
    spokenFeedRef.current = activeFeed.id
    speak(activeFeed.agentNarration)
  }, [activeFeed])

  function speak(text) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text))
  }

  function recordEngagement(type) {
    const now = Date.now()
    if (now - lastEngagementRef.current < 1200) return
    lastEngagementRef.current = now
    setEngagement((current) => ({...current, [type]: current[type] + 1}))
  }

  function selectFeed(feed, options = {speak: true, scan: true}) {
    const nextFeed = feed.mainFeatureTitle ? feedFromFeature(feed, {speak: options.speak}) : normalizeFeed(feed, {speak: options.speak})
    setActiveFeed(nextFeed)
    setQuery(nextFeed.query)
    setToast(`Active feed: ${nextFeed.title}`)
    recordEngagement(options.scan ? "manualSelect" : "hoverPreview")
    if (options.scan) scan(nextFeed)
  }

  async function refreshHealth() {
    try {
      const res = await fetch("/health", {cache: "no-store"})
      setHealth(await res.json())
    } catch {
      setHealth({providers: {status: "offline"}})
    }
  }

  async function refreshAdaptive(overrides = {}) {
    if (typeof window === "undefined") return
    try {
      const params = new URLSearchParams(window.location.search)
      const savedMarket = window.localStorage.getItem("digitalhut:lastMarketSymbol") || ""
      const savedObservatory = window.localStorage.getItem("digitalhut:lastObservatoryQuery") || ""
      if (savedMarket && !params.get("query") && !params.get("symbol")) params.set("lastMarketSymbol", savedMarket)
      if (savedObservatory && !params.get("lastObservatoryQuery")) params.set("lastObservatoryQuery", savedObservatory)
      if (wallet || overrides.wallet) params.set("wallet", overrides.wallet || wallet)
      if (tier || overrides.tier) params.set("tier", overrides.tier || tier)
      const res = await fetch(`/api/adaptive-home?${params.toString()}`, {cache: "no-store"})
      const state = await res.json()
      const nextSignal = signalFromAdaptive(state)
      setAdaptive(state)
      setSignal(nextSignal)
      setToast(`Adaptive entry loaded: ${state.intent}. ${state.premium?.message || ""}`)
    } catch {
      setToast("Adaptive route waiting. Local app stage remains active.")
    }
  }

  async function syncWallet(nextWallet) {
    if (!nextWallet) return
    setWallet(nextWallet)
    setToast("Blockchain verification synced to the app stage")
    await fetch("/api/account", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({wallet: nextWallet})
    }).catch(() => null)
    await refreshAdaptive({wallet: nextWallet})
  }

  async function connect() {
    if (typeof window !== "undefined" && window.ethereum) {
      setToast("Confirm in your digital wallet extension to continue")
      try {
        const accounts = await window.ethereum.request({method: "eth_requestAccounts"})
        await syncWallet(accounts?.[0])
        return
      } catch (error) {
        const message = String(error?.message || "")
        setToast(message.toLowerCase().includes("locked") ? "Your wallet is currently locked. Unlock it and try again." : "Wallet confirmation was not completed.")
        return
      }
    }

    const demoWallet = `0xDEMO${Math.random().toString(16).slice(2, 8)}`
    await syncWallet(demoWallet)
  }

  async function activate(nextTier) {
    setTier(nextTier)
    setToast(`${nextTier.toUpperCase()} tier staged`)
    await fetch("/api/set-tier", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({wallet, tier: nextTier})
    }).catch(() => null)
    await refreshAdaptive({tier: nextTier})
  }

  async function subscribe(nextTier = tier) {
    const amount = tiers[nextTier] || 0
    const res = await fetch("/api/subscription", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({wallet, tier: nextTier, currency, amount})
    })
    const json = await res.json()
    setSubscription(json.subscription)
    setToast(json.subscription?.payment_wallet ? "Crypto payment route ready" : "Payment wallet not configured in Render")
  }

  async function scan(feedOrQuery = activeFeed) {
    const requestedFeed = typeof feedOrQuery === "string" ? normalizeFeed({title: feedOrQuery, query: feedOrQuery, intent: activeFeed.intent}) : normalizeFeed(feedOrQuery)
    setBusy(true)
    setToast("Observatory scan running")
    try {
      if (typeof window !== "undefined") window.localStorage.setItem("digitalhut:lastObservatoryQuery", requestedFeed.query)
      const res = await fetch("/api/sketchfab", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({query: requestedFeed.query})
      })
      const json = await res.json()
      const model = json.result || {}
      const nextFeed = normalizeFeed({
        ...requestedFeed,
        id: `scan:${model.uid || requestedFeed.query}`,
        title: model.title || requestedFeed.title,
        source: json.providerLabel || json.searchStatusLabel || json.provider,
        modelUrl: model.glbUrl || model.downloadUrl || requestedFeed.modelUrl,
        previewImage: model.image || requestedFeed.previewImage,
        feedUrl: model.url || requestedFeed.feedUrl,
        agentNarration: `${model.title || requestedFeed.title}. ${json.ai || requestedFeed.agentNarration}`
      }, {speak: true})
      setResult(json)
      setActiveFeed(nextFeed)
      setQuery(nextFeed.query)
      setToast(json.providerLabel || json.searchStatusLabel || "Model feed found; renderer using metadata or fallback mode")
      await fetch("/api/history", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          query: nextFeed.query,
          result: model,
          tier,
          provider: json.provider,
          type: "active-glb-snapshot",
          snapshot: {title: nextFeed.title, previewImage: nextFeed.previewImage, modelUrl: nextFeed.modelUrl},
          surfaces: ["home-app-stage", "library", "observatory-renderer", "runner"]
        })
      }).catch(() => null)
      await refreshAdaptive({tier})
    } finally {
      setBusy(false)
    }
  }

  async function requestDownload() {
    if (!result) {
      setToast(walletPermission.message)
      return
    }
    const res = await fetch("/api/download", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({wallet, tier, asset: activeFeed.modelUrl || activeFeed.feedUrl, modelUid: result.result?.uid})
    })
    const json = await res.json()
    setToast(json.message)
  }

  function voice() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!Recognition) {
      setToast("Voice input is not supported in this browser")
      return
    }
    const recorder = new Recognition()
    recorder.onresult = (event) => setQuery(event.results[0][0].transcript)
    recorder.start()
  }

  return <main style={styles.page}>
    <section style={styles.appFrame}>
      <header style={styles.commandBar}>
        <div style={styles.identityBlock}>
          <p style={styles.eyebrow}>DigitalHut live desk</p>
          <h1 style={styles.title}>Unified Observatory App</h1>
          <p style={styles.copy}>{activeFeed.agentNarration || signal.tone}</p>
        </div>
        <div style={styles.statusGrid}>
          <StatusChip label="Feed" value={activeFeed.category} />
          <StatusChip label="Cadence" value={`${Math.round(cadenceMs / 1000)}s`} />
          <StatusChip label="Market" value={providerStatus} />
          <StatusChip label="Tier" value={tier} />
        </div>
      </header>

      <section style={styles.controlDock} aria-label="DigitalHut command dock">
        <div style={styles.searchDock}>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Wall Street, Tokyo towers, BTC, terrain, markets..." style={styles.input} />
          <button onClick={() => selectFeed({...activeFeed, query, title: query}, {speak: true, scan: true})} style={styles.primary}>{busy ? "Scanning" : "Scan"}</button>
          <button onClick={voice} style={styles.secondary}>Voice</button>
          <a href={marketHref} style={styles.linkButton}>Market</a>
        </div>
        <div style={styles.walletDock}>
          <button onClick={connect} style={styles.walletButton}>{wallet || "Verify Wallet"}</button>
          <select value={currency} onChange={(event) => setCurrency(event.target.value)} style={styles.select}>
            <option>ETH</option>
            <option>USDC</option>
            <option>MATIC</option>
            <option>BNB</option>
          </select>
          <button onClick={() => subscribe(tier)} style={styles.secondary}>Gas Route</button>
        </div>
      </section>

      <nav style={styles.tierDock} aria-label="Subscription tiers">
        {Object.entries(tiers).map(([nextTier, price]) => <button key={nextTier} onClick={() => activate(nextTier)} style={tier === nextTier ? styles.activeTier : styles.tierButton}>
          <b>{nextTier.toUpperCase()}</b>
          <span>${price}</span>
        </button>)}
      </nav>

      <div id="observatory-renderer" style={styles.rendererStage} onPointerMove={() => recordEngagement("rendererFocus")} onPointerDown={() => recordEngagement("manualSelect")}>
        <ModelRotationChooser
          activeFeed={{...activeFeed, subscriptionTier: tier}}
          result={result}
          busy={busy}
          onSelectFeed={selectFeed}
          subscription={subscriptionState}
          onWallet={syncWallet}
        />
      </div>

      <section style={styles.bottomDock} aria-label="Operational console">
        <aside style={styles.signalPanel}>
          <p style={styles.eyebrow}>Live state</p>
          <h2 style={styles.panelTitle}>{activeFeed.title}</h2>
          <p style={styles.copy}>{toast}</p>
          <p style={styles.small}>{walletPermission.message}</p>
          <div style={styles.quickActions}>
            <button onClick={() => setDrawer(drawer === "runner" ? "feed" : "runner")} style={styles.secondary}>{drawer === "runner" ? "Feed State" : "Runner"}</button>
            <button onClick={requestDownload} style={styles.secondary}>Authorize Asset</button>
            <a href="/library" style={styles.secondaryLink}>Library</a>
          </div>
        </aside>
        <div style={styles.runnerPanel}>
          {drawer === "runner" ? <DiscoveryRunnerConsole activeFeed={activeFeed} result={result} marketSymbols={marketSymbols} /> : <FeedState activeFeed={activeFeed} signal={signal} engagement={engagement} />}
        </div>
      </section>
    </section>
  </main>
}

function StatusChip({label, value}) {
  return <span style={styles.statusChip}><b>{label}</b>{value || "waiting"}</span>
}

function FeedState({activeFeed, signal, engagement}) {
  return <section style={styles.feedState}>
    <p style={styles.eyebrow}>Adaptive feed memory</p>
    <h2 style={styles.panelTitle}>{activeFeed.title}</h2>
    <p style={styles.copy}>{signal.tone}</p>
    <p style={styles.small}>Query: {activeFeed.query}</p>
    <p style={styles.small}>Renderer focus: {engagement.rendererFocus} / Hover previews: {engagement.hoverPreview} / Manual selects: {engagement.manualSelect}</p>
  </section>
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(circle at 20% 0%,rgba(20,184,166,.24),transparent 30%),linear-gradient(135deg,#030712,#08111f 45%,#111827)",
    color: "white",
    fontFamily: "Arial, sans-serif",
    padding: 14,
    boxSizing: "border-box",
    overflowX: "hidden"
  },
  appFrame: {maxWidth: 1540, margin: "0 auto", display: "grid", gap: 12},
  commandBar: {display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(min(100%,520px),.72fr)", gap: 12, alignItems: "end"},
  identityBlock: {minWidth: 0},
  eyebrow: {margin: 0, color: "#67e8f9", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0},
  title: {margin: "3px 0 5px", fontSize: "clamp(30px,5vw,58px)", lineHeight: 1, letterSpacing: 0, overflowWrap: "anywhere"},
  copy: {margin: 0, color: "#d8e4ee", lineHeight: 1.45, overflowWrap: "anywhere"},
  statusGrid: {display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(118px,1fr))", gap: 8},
  statusChip: {minHeight: 50, border: "1px solid rgba(103,232,249,.26)", borderRadius: 8, background: "rgba(2,6,23,.55)", color: "#dff8ff", padding: "8px 10px", display: "grid", gap: 2, alignContent: "center", fontSize: 12, fontWeight: 800, textTransform: "capitalize", overflowWrap: "anywhere"},
  controlDock: {display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(min(100%,440px),.55fr)", gap: 10, alignItems: "stretch"},
  searchDock: {display: "grid", gridTemplateColumns: "minmax(0,1fr) auto auto auto", gap: 8, minWidth: 0},
  walletDock: {display: "grid", gridTemplateColumns: "minmax(0,1fr) auto auto", gap: 8, minWidth: 0},
  input: {width: "100%", minWidth: 0, boxSizing: "border-box", padding: "13px 14px", borderRadius: 8, fontSize: 16, border: "1px solid rgba(226,232,240,.2)", background: "rgba(2,6,23,.86)", color: "white"},
  primary: {padding: "12px 16px", borderRadius: 8, background: "#14b8a6", color: "#021014", border: 0, fontWeight: 900, cursor: "pointer"},
  secondary: {padding: "12px 14px", borderRadius: 8, background: "rgba(226,232,240,.1)", color: "white", border: "1px solid rgba(226,232,240,.24)", fontWeight: 800, cursor: "pointer", textDecoration: "none"},
  linkButton: {display: "inline-grid", placeItems: "center", padding: "12px 14px", borderRadius: 8, background: "#38bdf8", color: "#06111a", fontWeight: 900, textDecoration: "none"},
  walletButton: {minWidth: 0, padding: "12px 14px", borderRadius: 8, border: "1px solid rgba(251,191,36,.42)", background: "rgba(113,63,18,.7)", color: "#fef3c7", fontWeight: 900, cursor: "pointer", overflowWrap: "anywhere"},
  select: {padding: "12px 10px", borderRadius: 8, border: "1px solid rgba(226,232,240,.24)", background: "#020617", color: "white", fontWeight: 900},
  tierDock: {display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 8},
  tierButton: {minHeight: 48, borderRadius: 8, border: "1px solid rgba(226,232,240,.16)", background: "rgba(2,6,23,.42)", color: "white", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "8px 12px", cursor: "pointer"},
  activeTier: {minHeight: 48, borderRadius: 8, border: "1px solid #facc15", background: "rgba(250,204,21,.16)", color: "white", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "8px 12px", cursor: "pointer"},
  rendererStage: {minWidth: 0},
  bottomDock: {display: "grid", gridTemplateColumns: "minmax(min(100%,320px),.42fr) minmax(0,1fr)", gap: 12, alignItems: "start"},
  signalPanel: {minWidth: 0, border: "1px solid rgba(148,163,184,.25)", borderRadius: 8, background: "rgba(15,23,42,.72)", padding: 14, display: "grid", gap: 10},
  runnerPanel: {minWidth: 0, border: "1px solid rgba(148,163,184,.2)", borderRadius: 8, background: "rgba(2,6,23,.32)", overflow: "hidden"},
  panelTitle: {margin: 0, fontSize: 22, lineHeight: 1.15, letterSpacing: 0, overflowWrap: "anywhere"},
  small: {margin: 0, color: "#a8b8c8", fontSize: 13, lineHeight: 1.45, overflowWrap: "anywhere"},
  quickActions: {display: "flex", gap: 8, flexWrap: "wrap"},
  secondaryLink: {padding: "12px 14px", borderRadius: 8, background: "rgba(226,232,240,.1)", color: "white", border: "1px solid rgba(226,232,240,.24)", fontWeight: 800, cursor: "pointer", textDecoration: "none"},
  feedState: {padding: 16, display: "grid", gap: 10}
}
