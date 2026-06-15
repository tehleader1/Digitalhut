import {useEffect, useState} from "react"
import {Link} from "react-router-dom"
import "@google/model-viewer"
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
  const [tab, setTab] = useState("studio")
  const [editTools, setEditTools] = useState({stretch: 100, lighting: 55, layer: "Base", objects: "None", zoomRate: 1})
  const selected = assets.find((item) => item.id === selectedId) || assets[0]
  const shareUrl = selected ? `${window.location.origin}/${selected.slug}` : ""
  const orbit = ["25deg 62deg auto", "80deg 66deg auto", "-40deg 58deg auto", "18deg 44deg auto"][demoStep % 4]
  const fov = ["36deg", "28deg", "42deg", "30deg"][demoStep % 4]
  const spokenLine = selected?.translations?.[language] || selected?.dialogue?.[demoStep % selected.dialogue.length] || ""

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
        <Link to="/library">Profile Library</Link>
        {selected && <Link to={`/asset/${selected.slug}`}>Public Asset</Link>}
      </nav>
    </header>

    <div className="dh-backend-tabs">
      <button className={tab === "studio" ? "active" : ""} type="button" onClick={() => setTab("studio")}>Backend Studio</button>
      <button className={tab === "queue" ? "active" : ""} type="button" onClick={() => setTab("queue")}>Upload Queue</button>
      <button className={tab === "profile" ? "active" : ""} type="button" onClick={() => setTab("profile")}>Profile / GLBs</button>
    </div>

    <section className="dh-system-map">
      {["Website / DApp", "Wallet + tiers", "APIs", "Backend queue", "Profiles", "Comments", "Files", "360 recommendation", "Protected AI demo"].map((item) => <span key={item}>{item}</span>)}
    </section>

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
