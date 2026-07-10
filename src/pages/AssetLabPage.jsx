import {useEffect, useState} from "react"
import {Link} from "react-router-dom"
import {loadModelViewer} from "../lib/modelViewerRuntime"
import "./AssetLab.css"

const storageKey = "digitalhut:assetLab"
const demoModels = [
  {
    name: "3D model of Saturn",
    type: "GLB",
    source: "DigitalHut demo source",
    url: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
    relatedUrl: "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb",
    description: "Planetary presentation asset with AI camera control, spoken facts, metadata, related-model transfer, and public share packaging."
  },
  {
    name: "Fossil research pass",
    type: "GLB",
    source: "Researcher demo source",
    url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb",
    relatedUrl: "https://modelviewer.dev/shared-assets/models/NeilArmstrong.glb",
    description: "Research asset prepared for slow inspection, evidence notes, source editing, spoken dialogue, and comparison movement."
  }
]

const languageLines = [
  ["English", "I am opening the model, rotating slowly, reading visible details, and preparing the related asset."],
  ["Spanish", "Estoy abriendo el modelo, rotando despacio, leyendo detalles visibles y preparando el recurso relacionado."],
  ["French", "J'ouvre le modele, je le fais tourner lentement, je lis les details visibles et je prepare l'actif lie."],
  ["German", "Ich offne das Modell, drehe es langsam, lese sichtbare Details und bereite das verwandte Asset vor."],
  ["Portuguese", "Estou abrindo o modelo, girando devagar, lendo detalhes visiveis e preparando o ativo relacionado."],
  ["Italian", "Sto aprendo il modello, ruotando lentamente, leggendo i dettagli visibili e preparando l'asset collegato."],
  ["Arabic", "افتح النموذج واديره ببطء واقرا التفاصيل المرئية ثم اجهز الاصل المرتبط."],
  ["Hindi", "मैं मॉडल खोल रहा हूं, धीरे घुमा रहा हूं, दिखने वाले विवरण पढ़ रहा हूं और संबंधित एसेट तैयार कर रहा हूं."],
  ["Chinese", "我正在打开模型, 慢慢旋转, 读取可见细节, 并准备相关资产."],
  ["Japanese", "モデルを開き、ゆっくり回転し、見える詳細を読み取り、関連アセットを準備します."],
  ["Korean", "모델을 열고 천천히 회전하며 보이는 세부 정보를 읽고 관련 에셋을 준비합니다."]
]

const blinkReader = {
  completed: ["Renderer Proof", "Session Notes", "Voice Spark", "Source Check"],
  pending: "75%",
  headline: "DigitalHut Backend Blink System",
  detail: "The top strip reads completed talent nodes, pending progress, and the next triangle feed needed before a major unlock."
}

const blinkTriangles = [
  {
    id: "stellar",
    title: "Stellar",
    center: "Orbital compute, cosmic color GLBs, satellite internet, and verified space feeds.",
    progress: 75,
    workingAssets: ["Starcloud tracker", "Starlink access", "TRAPPIST route", "ISS environment"],
    requirements: ["5 active days minimum", "4+ hours/day", "15 renderer proofs", "6 voice reactions", "8 source notes", "3 backlinks"],
    reward: "Permanent Stellar Auto Play Demo"
  },
  {
    id: "researcher",
    title: "Pure Researcher",
    center: "Evidence lanes, careful notes, science reports, and source confidence before publishing.",
    progress: 52,
    workingAssets: ["Perovskite lab", "Field study", "Weather disruption", "Fossil pass"],
    requirements: ["5 active days minimum", "10 verified notes", "4 published reports", "2 corrections accepted", "1 long-form source pack"],
    reward: "Research Authority Node"
  },
  {
    id: "avionics",
    title: "Amazing Avionics",
    center: "Aerospace-style public display, airport delay feeds, signal routes, and advisory source status.",
    progress: 44,
    workingAssets: ["Airport delay", "Free-space optics", "Route awareness", "Weather layer"],
    requirements: ["5 active days minimum", "12 public-feed sessions", "5 assistance notes", "5 verified route contexts", "No unsupported instrument claims"],
    reward: "Aerospace Observatory Demo"
  },
  {
    id: "world-cup",
    title: "World Cup",
    center: "Global event environments, city routes, stadium context, travel pressure, and viral public reaction loops.",
    progress: 36,
    workingAssets: ["Host city", "Transit pressure", "Fan zone", "Sponsor lane"],
    requirements: ["5 active days minimum", "10 mainstream sessions", "250 public reactions", "4 share links", "2 sponsor-ready reports"],
    reward: "Global Event Auto Feed"
  }
]

const blinkUnlockPods = [
  ["Sizzle Scientist", "Turns science findings into vivid, source-checked 3D reports.", 61],
  ["360 Guru", "Unlocks slow orbit, camera-memory, and always-available 360 demos.", 72],
  ["Genius Real Estate", "Keeps high-end international property opportunity feeds ready.", 48],
  ["Exotic Environment", "Saves beautiful environment sessions as mood-reset builds.", 58],
  ["Interstellar Node", "Pins the best cosmic GLBs and orbital compute reports.", 75],
  ["Audience Magnet", "Uses reactions, comments, backlinks, and shares to rank unlocks.", 39]
]

const nodePurchaseOffers = [
  {
    id: "stellar",
    title: "Stellar Node",
    priceYear: "$250/year",
    priceMonth: "$20/month",
    term: "1 year access window",
    funding: "Funds fresh 2026 planetary, orbital compute, cosmic-color GLBs, public APIs, and saved Stellar Auto Play demos.",
    includes: ["Fresh planetary GLB lanes", "Orbital compute tracker", "Best-found cosmic views", "Node progress memory", "Auto Play demo slot"]
  },
  {
    id: "real-estate-genius",
    title: "Genius Real Estate Node",
    priceYear: "$250/year",
    priceMonth: "$20/month",
    term: "1 year access window",
    funding: "Funds international property feeds, luxury and opportunity scouting, market context, and saved presentation routes.",
    includes: ["Million/billion dollar opportunity feeds", "International housing context", "Property GLB matching", "Agent-ready presentation memory"]
  },
  {
    id: "research-authority",
    title: "Pure Researcher Node",
    priceYear: "$250/year",
    priceMonth: "$20/month",
    term: "1 year access window",
    funding: "Funds science reports, source verification, research GLB matching, and source-backed publishing workflows.",
    includes: ["Research queue priority", "Source notes", "Science report packaging", "Verified GLB evidence lane"]
  },
  {
    id: "sizzle-scientist",
    title: "Sizzle Scientist Node",
    priceYear: "$250/year",
    priceMonth: "$20/month",
    term: "1 year access window",
    funding: "Funds vivid science storytelling, experiment visuals, and source-backed 3D report packaging.",
    includes: ["Science story templates", "Experiment GLB matching", "Voice-ready scripts", "Publishable report lane"]
  },
  {
    id: "guru-360",
    title: "360 Guru Node",
    priceYear: "$250/year",
    priceMonth: "$20/month",
    term: "1 year access window",
    funding: "Funds 360-style orbit sessions, camera memory, scene pacing, and saved auto-tour demos.",
    includes: ["Orbit camera presets", "Saved 360 demos", "Scene pacing memory", "Environment replay lane"]
  },
  {
    id: "exotic-environment",
    title: "Exotic Environment Node",
    priceYear: "$250/year",
    priceMonth: "$20/month",
    term: "1 year access window",
    funding: "Funds jungle, island, city, terrain, and rare environment discovery from verified feeds and owner storage.",
    includes: ["Exotic feed priority", "Mood reset builds", "Saved environment vault", "Auto Play demo memory"]
  },
  {
    id: "amazing-avionics",
    title: "Amazing Avionics Node",
    priceYear: "$250/year",
    priceMonth: "$20/month",
    term: "1 year access window",
    funding: "Funds aerospace-style public displays, airport reports, route context, and non-instrument advisory feeds.",
    includes: ["Airport delay views", "Signal route stories", "Weather context", "Aerospace display themes"]
  },
  {
    id: "world-cup",
    title: "World Cup Node",
    priceYear: "$250/year",
    priceMonth: "$20/month",
    term: "1 year access window",
    funding: "Funds global event feeds, city/stadium environments, sponsor lanes, and viral public reaction loops.",
    includes: ["Host city GLBs", "Fan-zone reports", "Sponsor placements", "Global event auto feed"]
  },
  {
    id: "audience-magnet",
    title: "Audience Magnet Node",
    priceYear: "$250/year",
    priceMonth: "$20/month",
    term: "1 year access window",
    funding: "Funds backlinks, reaction tracking, share links, comment loops, and popularity-based demo ranking.",
    includes: ["Reaction scoring", "Backlink memory", "Share prompts", "Popular demo boosts"]
  },
  {
    id: "backend-builder",
    title: "Backend Builder Node",
    priceYear: "$250/year",
    priceMonth: "$20/month",
    term: "1 year access window",
    funding: "Funds upload queues, metadata cleanup, conversion workflows, and protected owner demo tooling.",
    includes: ["Queue priority", "Metadata tools", "Conversion status", "Owner demo staging"]
  },
  {
    id: "mainstream-pulse",
    title: "Mainstream Pulse Node",
    priceYear: "$250/year",
    priceMonth: "$20/month",
    term: "1 year access window",
    funding: "Funds viral public feeds, podcast matches, trend summaries, and entertainment environment pairings.",
    includes: ["Trend lanes", "Podcast matching", "Viral environment pairing", "Auto stream pacing"]
  }
]

const customFeedComingSoon = [
  {
    id: "stellar-feed",
    title: "Stellar Feed",
    status: "Coming soon",
    purpose: "Randomized planetary, orbital compute, satellite internet, cosmic-color GLB, and space research presentations.",
    inputs: ["Planetary searches", "Saved cosmic GLBs", "Orbital compute reports", "Voice reactions"],
    unlock: "Unlocks after renderer proof, source notes, public reactions, and sustained Stellar node activity."
  },
  {
    id: "genius-real-estate",
    title: "Genius Real Estate",
    status: "Coming soon",
    purpose: "International housing, luxury property, middle-class opportunity, relocation, and market-stat presentation feeds.",
    inputs: ["Property GLBs", "Location searches", "Housing statistics", "Saved buyer notes"],
    unlock: "Unlocks after real estate sessions prove location, market context, and usable presentation history."
  },
  {
    id: "pro-gamer",
    title: "Pro Gamer",
    status: "Coming soon",
    purpose: "Game-world environments, 360 gaming visuals, creator-safe official links, and playable presentation concepts.",
    inputs: ["Game searches", "Environment GLBs", "Creator-safe sources", "Viewer reactions"],
    unlock: "Unlocks after repeated game presentations, saved notes, and strong reaction signals."
  },
  {
    id: "pure-researcher",
    title: "Pure Researcher",
    status: "Coming soon",
    purpose: "Science, field-study, lab, evidence, and source-confidence feeds for careful 3D research reports.",
    inputs: ["Research notes", "Source links", "Science GLBs", "Correction history"],
    unlock: "Unlocks after verified notes, source packs, report drafts, and safe publishing behavior."
  },
  {
    id: "mainstream-pulse",
    title: "Mainstream Pulse",
    status: "Coming soon",
    purpose: "Viral public feeds, creator trends, funny moments, music/culture lanes, and fast GLB-backed presentations.",
    inputs: ["Trend searches", "Podcast matches", "Share links", "Audience reactions"],
    unlock: "Unlocks after posts, reactions, backlinks, and strong mainstream session history."
  }
]

const ownerPayoutWallet = "0x3121FbFB683B9147913f336b05eF419b875a7590"

function blinkProgressForNode(id){
  const triangle = blinkTriangles.find((item) => item.id === id)
  if(triangle) return triangle
  const offer = nodePurchaseOffers.find((item) => item.id === id) || nodePurchaseOffers[0]
  return {
    id: offer.id,
    title: offer.title.replace(" Node", ""),
    center: offer.funding,
    progress: 25,
    workingAssets: offer.includes,
    requirements: ["5 active days minimum", "4+ hours/day", "Renderer proof", "Voice or note reactions", "Backend contribution", "Public reaction or backlink"],
    reward: `${offer.title} access path`
  }
}

function slugify(value){
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "asset"
}

function isImageUrl(value = ""){
  return /\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(value) || value.includes("images.unsplash.com")
}

function readAssets(){
  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey) || "[]")
    return Array.isArray(parsed) && parsed.length ? parsed : demoModels.map((item, index) => createAsset(item, index))
  } catch {
    return demoModels.map((item, index) => createAsset(item, index))
  }
}

function writeAssets(items){
  window.localStorage.setItem(storageKey, JSON.stringify(items))
}

function createAsset(input, index = 0){
  const name = input.name || "Untitled GLB asset"
  const slug = `asset_${slugify(name)}`
  const dialogue = [
    `Open 3D model view. ${name} is ready for a conducted DigitalHut demo.`,
    "I am rotating the model slowly so the viewer can study the shape before I speak too much.",
    `Source type is ${input.type || "GLB"}. I am attaching metadata, description, and share packaging now.`,
    "Next I will zoom in, pause for notes, then move to a related model so the session feels directed."
  ]
  return {
    id: `${Date.now()}-${index}`,
    slug,
    name,
    type: input.type || "GLB",
    sourceType: String(input.sourceType || input.type || "GLB").toLowerCase(),
    source: input.source || "Manual researcher upload",
    url: input.url || demoModels[0].url,
    originalFileUrl: input.originalFileUrl || input.oldFileUrl || input.url || "",
    convertedGlbUrl: input.convertedGlbUrl || input.convertedUrl || input.url || demoModels[0].url,
    optimizedGlbUrl: input.optimizedGlbUrl || input.convertedUrl || input.url || demoModels[0].url,
    relatedUrl: input.relatedUrl || demoModels[1].url,
    description: input.description || "DigitalHut asset prepared for AI-guided 3D presentation.",
    status: "AI dialogue ready",
    progress: 100,
    visibility: "Private until published",
    comments: ["Researcher note: verify metadata, then publish the share link."],
    dialogue,
    translations: Object.fromEntries(languageLines),
    createdAt: new Date().toISOString()
  }
}

export default function AssetLabPage(){
  const [assets, setAssets] = useState(readAssets)
  const [selectedId, setSelectedId] = useState(assets[0]?.id || "")
  const [form, setForm] = useState({name: "3D model of Saturn", type: "GLB", source: "Researcher upload", url: demoModels[0].url, relatedUrl: demoModels[1].url, description: ""})
  const [demoStep, setDemoStep] = useState(0)
  const [language, setLanguage] = useState("English")
  const [ownerKey, setOwnerKey] = useState("")
  const [unlocked, setUnlocked] = useState(() => window.localStorage.getItem("digitalhut:assetLabOwner") === "yes")
  const [sponsor, setSponsor] = useState({name: "", link: "", placement: "Subtle sponsor tag", note: ""})
  const [tab, setTab] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get("tab") === "blink" ? "blink" : "studio"
  })
  const [activeBlinkId, setActiveBlinkId] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get("node") || window.localStorage.getItem("digitalhut:blinkPulse") || "stellar"
  })
  const [nodeApiFeeds] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem("digitalhut:nodeApiFeeds") || "[]")
    } catch {
      return []
    }
  })
  const [editTools, setEditTools] = useState({stretch: 100, lighting: 55, layer: "Base", objects: "None", zoomRate: 1})
  const selected = assets.find((item) => item.id === selectedId) || assets[0]
  const activeBlink = blinkProgressForNode(activeBlinkId)
  const nodeApiFeedFor = (item) => {
    const category = item.id.includes("stellar") ? "Planetary" : item.id.includes("real-estate") ? "Real Estate" : item.id.includes("gamer") ? "Gamer" : item.id.includes("research") ? "Researcher" : "Mainstream Streaming"
    return nodeApiFeeds.find((feed) => feed.category === category)
  }
  const shareUrl = selected ? `${window.location.origin}/${selected.slug}` : ""
  const orbit = ["25deg 62deg auto", "80deg 66deg auto", "-40deg 58deg auto", "18deg 44deg auto"][demoStep % 4]
  const fov = ["36deg", "28deg", "42deg", "30deg"][demoStep % 4]
  const spokenLine = selected?.translations?.[language] || selected?.dialogue?.[demoStep % selected.dialogue.length] || ""

  useEffect(() => {
    loadModelViewer()
  }, [])

  useEffect(() => writeAssets(assets), [assets])

  async function queueAsset(){
    const queued = createAsset({...form, status: "Queued: building metadata and AI dialogue"}, assets.length)
    queued.progress = 35
    queued.oldFileUrl = form.url
    queued.convertedUrl = form.url
    queued.likes = 0
    queued.shares = 0
    queued.zoomRate = 1
    queued.dialogue[0] = `Open 3D model view. ${queued.name} is in the DigitalHut backend queue.`
    setAssets((current) => [queued, ...current])
    setSelectedId(queued.id)
    try {
      const response = await fetch("/api/asset-conversion", {
        method: "POST",
        headers: {"content-type": "application/json"},
        body: JSON.stringify({
          name: form.name,
          sourceType: form.type,
          source: form.source,
          sourceUrl: form.url,
          description: form.description,
          relatedUrl: form.relatedUrl,
          createdBy: "owner"
        })
      })
      const payload = await response.json()
      if(!payload.ok) throw new Error(payload.error || "conversion failed")
      const record = payload.record
      setAssets((current) => current.map((item) => item.id === queued.id ? {
        ...item,
        id: record.id || item.id,
        slug: record.slug || item.slug,
        sourceType: record.sourceType || item.sourceType,
        originalFileUrl: record.originalFileUrl || item.oldFileUrl,
        oldFileUrl: record.originalFileUrl || item.oldFileUrl,
        convertedGlbUrl: record.convertedGlbUrl || record.optimizedGlbUrl || item.convertedGlbUrl,
        convertedUrl: record.optimizedGlbUrl || record.convertedGlbUrl || item.convertedUrl,
        url: record.optimizedGlbUrl || record.convertedGlbUrl || item.url,
        status: payload.conversionWorkerConnected ? "Converted GLB ready with AI narration" : record.status,
        progress: record.progress || 100,
        description: record.metadata?.description || item.description,
        dialogue: record.aiNarration || item.dialogue
      } : item))
    } catch (error) {
      setAssets((current) => current.map((item) => item.id === queued.id ? {
        ...item,
        status: `Queued locally. Backend worker pending: ${error.message}`,
        progress: 55
      } : item))
    }
  }

  function updateSelected(patch){
    setAssets((current) => current.map((item) => item.id === selected.id ? {...item, ...patch} : item))
  }

  function conductNext(){
    setDemoStep((current) => (current + 1) % 4)
    updateSelected({status: "AI presenting one protected model"})
  }

  function unlockOwner(){
    if(ownerKey.trim().toLowerCase() !== "digitalhut"){
      setOwnerKey("")
      return
    }
    window.localStorage.setItem("digitalhut:assetLabOwner", "yes")
    setUnlocked(true)
  }

  function attachSponsor(){
    if(!selected) return
    updateSelected({sponsor: {...sponsor}, status: "Sponsor lane attached"})
    setSponsor({name: "", link: "", placement: "Subtle sponsor tag", note: ""})
  }

  function applyEditTool(){
    if(!selected) return
    updateSelected({
      editTools: {...editTools},
      zoomRate: editTools.zoomRate,
      status: "Professional edit settings staged"
    })
  }

  function reactToAsset(kind){
    if(!selected) return
    const field = kind === "share" ? "shares" : "likes"
    updateSelected({[field]: (selected[field] || 0) + 1})
  }

  return <main className="dh-backend-page">
    <header className="dh-backend-header">
      <div>
        <p>DigitalHut Backend</p>
        <h1>Asset Lab</h1>
        <p>Private control center for library storage, source-file conversion, profile GLBs, comments, likes, shares, sponsor lanes, wallet-tier access, and the protected AI demo system.</p>
      </div>
      <nav className="dh-backend-nav">
        <Link to="/">Main System</Link>
        <Link to="/daily-situations">Daily Queue</Link>
        <Link to="/library">Profile Library</Link>
        {selected && <Link to={`/asset/${selected.slug}`}>Public Asset</Link>}
      </nav>
    </header>

    <div className="dh-backend-tabs">
      <button className={tab === "blink" ? "active" : ""} type="button" onClick={() => setTab("blink")}>Blink System</button>
      <button className={tab === "studio" ? "active" : ""} type="button" onClick={() => setTab("studio")}>Backend Studio</button>
      <button className={tab === "queue" ? "active" : ""} type="button" onClick={() => setTab("queue")}>Upload Queue</button>
      <button className={tab === "profile" ? "active" : ""} type="button" onClick={() => setTab("profile")}>Profile / GLBs</button>
    </div>

    <section className="dh-system-map">
      {["Website / DApp", "Wallet + tiers", "APIs", "Backend queue", "Profiles", "Comments", "Files", "Blink talent tree", "360 recommendation", "Protected AI demo"].map((item) => <span key={item}>{item}</span>)}
    </section>

    {tab === "blink" && <section className="dh-blink-system">
      <div className="dh-blink-reader">
        <div>
          <span>Top reader</span>
          <h2>{blinkReader.headline}</h2>
          <p>{blinkReader.detail}</p>
        </div>
        <div className="dh-blink-completed">
          {blinkReader.completed.map((item) => <span key={item}>{item}</span>)}
        </div>
        <div className="dh-blink-pending">
          <b>{activeBlink.progress}%</b>
          <span>pending to {activeBlink.title}</span>
        </div>
      </div>

      <div className="dh-blink-layout">
        <section className="dh-triangle-board" aria-label="Interactive triangle feed board">
          {blinkTriangles.map((item) => <button key={item.id} className={`dh-blink-triangle ${item.id === activeBlink.id ? "active pulse" : ""}`} type="button" onClick={() => {setActiveBlinkId(item.id); window.localStorage.setItem("digitalhut:blinkPulse", item.id)}}>
            <span>{item.title}</span>
            <b>{item.center}</b>
            <i>{item.progress}%</i>
          </button>)}
          <div className="dh-triangle-core">
            <span>Feature talent tree</span>
            <b>DigitalHut Backend Blink System</b>
            <small>Working assets in the center. Current examples on the outside.</small>
          </div>
        </section>

        <section className="dh-blink-detail">
          <header>
            <span>Active triangle</span>
            <h2>{activeBlink.title}</h2>
            <button type="button" title="Sensitive GLB account rule">?</button>
          </header>
          <p className="dh-sensitive-rule">DigitalHut does not register sensitive GLB power to accounts that have not earned it. Major nodes require at least 5 active days, 4+ hours per day, renderer proof, source notes, voice sessions, public reaction, backend contribution, backlinks, and safe publishing behavior.</p>
          <div className="dh-progress"><span style={{width: `${activeBlink.progress}%`}} /></div>
          <div className="dh-blink-columns">
            <div>
              <b>Working assets</b>
              {activeBlink.workingAssets.map((item) => <span key={item}>{item}</span>)}
            </div>
            <div>
              <b>Minimum grind</b>
              {activeBlink.requirements.map((item) => <span key={item}>{item}</span>)}
            </div>
          </div>
          <strong>{activeBlink.reward}</strong>
        </section>

        <section className="dh-unlock-lenses" aria-label="Contained unlock nodes">
          {blinkUnlockPods.map(([name, detail, progress]) => <button key={name} className="dh-unlock-lens" type="button">
            <span>{name}</span>
            <b>{progress}%</b>
            <small>{detail}</small>
          </button>)}
        </section>
      </div>

      <section className="dh-custom-feed-preview">
        <header>
          <div>
            <span>Custom Feed Nodes</span>
            <h2>Coming soon personalized feeds</h2>
            <p>Search and presentations stay as the main product. These nodes are staged as future personalized feeds that learn from saved GLBs, notes, voice reactions, backlinks, source checks, and public interest.</p>
          </div>
          <button type="button" onClick={() => setTab("studio")}>Build Presentation First</button>
        </header>
        <div className="dh-custom-feed-grid">
          {customFeedComingSoon.map((item) => {
            const apiFeed = nodeApiFeedFor(item)
            return <article key={item.id} className={item.id.includes(activeBlink.id) ? "active" : ""}>
              <span>{item.status}</span>
              <h3>{item.title}</h3>
              <p>{item.purpose}</p>
              {apiFeed && <p className="dh-node-api-feed">Current API signal: {apiFeed.title} / {apiFeed.apiSource || apiFeed.apiStatus}</p>}
              <div>{item.inputs.map((input) => <small key={input}>{input}</small>)}</div>
              <b>{item.unlock}</b>
            </article>
          })}
        </div>
      </section>

      <section className="dh-node-purchases">
        <header>
          <div>
            <span>Node Purchases</span>
            <h2>Fund the experience</h2>
            <p>Each node purchase stages one year of access. Checkout integration must confirm chain, amount, wallet, and subscription status before any real entitlement is granted.</p>
          </div>
          <code>{ownerPayoutWallet}</code>
        </header>
        <div className="dh-node-purchase-grid">
          {nodePurchaseOffers.map((offer) => <article key={offer.id} className={`dh-node-purchase-card ${offer.id === activeBlink.id ? "active" : ""}`}>
            <span>{offer.term}</span>
            <h3>{offer.title}</h3>
            <b>{offer.priceYear}</b>
            <em>{offer.priceMonth}</em>
            <p>{offer.funding}</p>
            <div>{offer.includes.map((item) => <small key={item}>{item}</small>)}</div>
            <button type="button" onClick={() => {setActiveBlinkId(offer.id); window.localStorage.setItem("digitalhut:blinkPulse", offer.id)}}>Stage Purchase</button>
          </article>)}
        </div>
      </section>

      <div className="dh-mood-support">
        <b>Reset builds</b>
        <span>Users can save beautiful renderer sessions, notes, and voice reactions as creative reset builds. This is wellness support and entertainment, not medical treatment or crisis care.</span>
      </div>
    </section>}

    {tab === "studio" && <section className="dh-backend-grid studio">
      <div className="dh-backend-panel">
        <h2>Researcher Intake</h2>
        <label>Name<input value={form.name} onChange={(event) => setForm({...form, name: event.target.value})} /></label>
        <label>File Type<select value={form.type} onChange={(event) => setForm({...form, type: event.target.value})}><option>GLB</option><option>GLTF</option><option>OBJ</option><option>Video</option><option>Image Set</option><option>Research Source</option></select></label>
        <label>Source<input value={form.source} onChange={(event) => setForm({...form, source: event.target.value})} /></label>
        <label>Model URL<input value={form.url} onChange={(event) => setForm({...form, url: event.target.value})} /></label>
        <label>Related Model URL<input value={form.relatedUrl} onChange={(event) => setForm({...form, relatedUrl: event.target.value})} /></label>
        <label>Description<textarea value={form.description} onChange={(event) => setForm({...form, description: event.target.value})} /></label>
        <div className="dh-form-actions">
          <button type="button" onClick={queueAsset}>Queue Build</button>
          <button type="button" onClick={() => setForm({...form, ...demoModels[1]})}>Load Research Demo</button>
        </div>
      </div>

      <div className="dh-backend-panel dh-conductor-panel">
        <h2>Old File / Converted 3D File</h2>
        <div className="dh-compare-viewers">
          <div>
            <b>Old File</b>
            {isImageUrl(selected?.oldFileUrl) ? <img src={selected.oldFileUrl} alt="" /> : <div className="dh-file-preview"><span>{selected?.oldFileUrl || "Original source waiting"}</span></div>}
          </div>
          <div>
            <b>Converted 3D</b>
            {selected && <model-viewer className="dh-asset-viewer compact" src={selected.convertedUrl || selected.url} camera-controls auto-rotate auto-rotate-delay="0" rotation-per-second={demoStep === 1 ? "18deg" : "9deg"} camera-orbit={orbit} field-of-view={fov} exposure="1" reveal="auto" style={{filter: `brightness(${.75 + editTools.lighting / 100})`, transform: `scaleX(${editTools.stretch / 100})`}} />}
          </div>
        </div>
        <h2>AI One-Model Conductor</h2>
        <div className="dh-asset-actions">
          <button type="button" onClick={() => setDemoStep(0)}>Open View</button>
          <button type="button" disabled={!unlocked} onClick={conductNext}>Conduct Next</button>
          <button type="button" disabled={!unlocked} onClick={() => setDemoStep(1)}>Rotate</button>
          <button type="button" disabled={!unlocked} onClick={() => setDemoStep(3)}>Zoom</button>
        </div>
        <div className="dh-asset-meta">
          <b>{selected?.name}</b>
          <span>{selected?.status}</span>
          <span>{spokenLine}</span>
          {!unlocked && <span>AI control demo is protected. Backend queue, profile GLBs, comments, likes, shares, and sponsors stay visible.</span>}
          {selected?.sponsor?.name && <span>Sponsored by {selected.sponsor.name}: {selected.sponsor.placement}</span>}
          <a className="dh-share-link" href={shareUrl}>{shareUrl}</a>
        </div>
      </div>

      <div className="dh-backend-panel">
        <h2>Professional Edit Tools</h2>
        <label>Stretch<input type="range" min="70" max="130" value={editTools.stretch} onChange={(event) => setEditTools({...editTools, stretch: Number(event.target.value)})} /></label>
        <label>Lighting<input type="range" min="10" max="100" value={editTools.lighting} onChange={(event) => setEditTools({...editTools, lighting: Number(event.target.value)})} /></label>
        <label>Layer<select value={editTools.layer} onChange={(event) => setEditTools({...editTools, layer: event.target.value})}><option>Base</option><option>Architect</option><option>Lighting</option><option>Props</option><option>Grid</option><option>Coordinates</option></select></label>
        <label>Add Object<select value={editTools.objects} onChange={(event) => setEditTools({...editTools, objects: event.target.value})}><option>None</option><option>Label Pins</option><option>Measurement Lines</option><option>Sponsor Plate</option><option>Research Markers</option></select></label>
        <label>Zoom Rate<input type="range" min=".5" max="2" step=".1" value={editTools.zoomRate} onChange={(event) => setEditTools({...editTools, zoomRate: Number(event.target.value)})} /></label>
        <button className="dh-backend-btn hot" type="button" onClick={applyEditTool}>Stage Edit Settings</button>
      </div>
    </section>}

    {tab === "queue" && <section className="dh-backend-grid queue">
      <div className="dh-backend-panel">
        <h2>Downloaded / Created Files Queue</h2>
        {assets.map((item) => <button key={item.id} className={`dh-queue-card ${item.id === selected?.id ? "active" : ""}`} type="button" onClick={() => setSelectedId(item.id)}>
          <b>{item.name}</b>
          <span>{item.status}</span>
          <div className="dh-progress"><span style={{width: `${item.progress}%`}} /></div>
          <small>{item.type} / {item.visibility}</small>
        </button>)}
      </div>

      <div className="dh-backend-panel">
        <h2>Sponsor Attachment</h2>
        <label>Sponsor Name<input value={sponsor.name} onChange={(event) => setSponsor({...sponsor, name: event.target.value})} /></label>
        <label>Sponsor Link<input value={sponsor.link} onChange={(event) => setSponsor({...sponsor, link: event.target.value})} /></label>
        <label>Placement<select value={sponsor.placement} onChange={(event) => setSponsor({...sponsor, placement: event.target.value})}><option>Subtle sponsor tag</option><option>Opening voice mention</option><option>End card only</option><option>Contest sponsor lane</option></select></label>
        <label>Note<textarea value={sponsor.note} onChange={(event) => setSponsor({...sponsor, note: event.target.value})} /></label>
        <button className="dh-backend-btn hot" type="button" onClick={attachSponsor}>Attach Sponsor</button>
      </div>

      <div className="dh-backend-panel">
        <h2>Protected AI Control Demo</h2>
        {unlocked ? <>
          <p>Owner AI control is unlocked for internal testing: conduct next, rotate, zoom, and prepare the future related-GLB shuffle without exposing public demo editing.</p>
          <div className="dh-progress"><span style={{width: "22%"}} /></div>
          <small>Public unlock target remains 10,000 subscribers.</small>
        </> : <>
          <p>Only this AI control demo is locked. The backend system remains visible so the community can warm up around uploads, profile GLBs, likes, comments, shares, and sponsors.</p>
          <label>Owner key<input value={ownerKey} onChange={(event) => setOwnerKey(event.target.value)} onKeyDown={(event) => {if(event.key === "Enter") unlockOwner()}} placeholder="Owner access" /></label>
          <button className="dh-backend-btn hot" type="button" onClick={unlockOwner}>Unlock AI Control Demo</button>
        </>}
      </div>
    </section>}

    {tab === "profile" && <section className="dh-backend-grid profile">
      <div className="dh-backend-panel dh-profile-list">
        <h2>Profile / GLBs</h2>
        {assets.map((item) => <button key={item.id} className={`dh-library-card ${item.id === selected?.id ? "active" : ""}`} type="button" onClick={() => setSelectedId(item.id)}>
          <b>{item.name}</b>
          <span>{item.description}</span>
          <small>{item.likes || 0} likes / {item.comments?.length || 0} comments / {item.shares || 0} shares</small>
        </button>)}
      </div>

      <div className="dh-backend-panel">
        <h2>Featured GLB Edit</h2>
        {selected && <>
          <label>Name<input value={selected.name} onChange={(event) => updateSelected({name: event.target.value, slug: `asset_${slugify(event.target.value)}`})} /></label>
          <label>Description<textarea value={selected.description} onChange={(event) => updateSelected({description: event.target.value})} /></label>
          <label>Zoom In / Out Rate<input type="range" min=".5" max="2" step=".1" value={selected.zoomRate || 1} onChange={(event) => updateSelected({zoomRate: Number(event.target.value)})} /></label>
          <label>Visibility<select value={selected.visibility} onChange={(event) => updateSelected({visibility: event.target.value})}><option>Private until published</option><option>Share link live</option><option>Public profile</option></select></label>
          <a className="dh-share-link" href={`${window.location.origin}/${selected.slug}`}>{window.location.origin}/{selected.slug}</a>
          <div className="dh-asset-actions">
            <button type="button" onClick={() => reactToAsset("like")}>Like {selected.likes || 0}</button>
            <button type="button" onClick={() => reactToAsset("share")}>Share Count {selected.shares || 0}</button>
          </div>
          <label>Comment<input onKeyDown={(event) => {if(event.key === "Enter" && event.currentTarget.value.trim()){updateSelected({comments: [...(selected.comments || []), event.currentTarget.value.trim()]}); event.currentTarget.value = ""}}} placeholder="Add comment and press Enter" /></label>
          <div className="dh-comment-row">{(selected.comments || []).map((item) => <span key={item}>{item}</span>)}</div>
        </>}
      </div>

      <div className="dh-backend-panel">
        <h2>Spoken Dialogue</h2>
        {selected?.dialogue.map((line, index) => <div className="dh-library-card" key={line}><b>Beat {index + 1}</b><span>{line}</span></div>)}
      </div>

      <div className="dh-backend-panel">
        <h2>Major Language Pack</h2>
        <div className="dh-language-grid">{languageLines.map(([name]) => <button key={name} className={language === name ? "active" : ""} type="button" onClick={() => setLanguage(name)}>{name}</button>)}</div>
        <p>{spokenLine}</p>
        <p>Public user demo creation is coming soon. Owner system demos are active here first.</p>
      </div>
    </section>}
  </main>
}
