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
    source: input.source || "Manual researcher upload",
    url: input.url || demoModels[0].url,
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
  const selected = assets.find((item) => item.id === selectedId) || assets[0]
  const shareUrl = selected ? `${window.location.origin}/${selected.slug}` : ""
  const orbit = ["25deg 62deg auto", "80deg 66deg auto", "-40deg 58deg auto", "18deg 44deg auto"][demoStep % 4]
  const fov = ["36deg", "28deg", "42deg", "30deg"][demoStep % 4]
  const spokenLine = selected?.translations?.[language] || selected?.dialogue?.[demoStep % selected.dialogue.length] || ""

  useEffect(() => writeAssets(assets), [assets])

  function queueAsset(){
    const queued = createAsset({...form, status: "Queued: building metadata and AI dialogue"}, assets.length)
    queued.progress = 35
    queued.dialogue[0] = `Open 3D model view. ${queued.name} is in the DigitalHut backend queue.`
    setAssets((current) => [queued, ...current])
    setSelectedId(queued.id)
    window.setTimeout(() => {
      setAssets((current) => current.map((item) => item.id === queued.id ? {...item, status: "AI dialogue ready", progress: 100} : item))
    }, 900)
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

  if(!unlocked){
    return <main className="dh-backend-page">
      <section className="dh-public-asset dh-owner-gate">
        <p>Protected DigitalHut Backend</p>
        <h1>Asset Lab is private</h1>
        <p>This backend stays hidden while the public system warms up. Public users only see the AI presenting one current model. Full demo editing unlocks later after the subscriber base is ready.</p>
        <div className="dh-backend-panel">
          <label>Owner key<input value={ownerKey} onChange={(event) => setOwnerKey(event.target.value)} onKeyDown={(event) => {if(event.key === "Enter") unlockOwner()}} placeholder="Owner access" /></label>
          <button className="dh-backend-btn hot" type="button" onClick={unlockOwner}>Unlock Owner Backend</button>
        </div>
        <Link className="dh-backend-btn" to="/">Return to Main System</Link>
      </section>
    </main>
  }

  return <main className="dh-backend-page">
    <header className="dh-backend-header">
      <div>
        <p>DigitalHut Backend</p>
        <h1>Asset Lab</h1>
        <p>Private researcher queue, AI metadata, spoken one-model demo dialogue, translated narration, sponsor attachment, comments, edits, and profile library control.</p>
      </div>
      <nav className="dh-backend-nav">
        <Link to="/">Main System</Link>
        <Link to="/library">Profile Library</Link>
        {selected && <Link to={`/asset/${selected.slug}`}>Public Asset</Link>}
      </nav>
    </header>

    <section className="dh-backend-grid">
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
        <h2>AI One-Model Conductor</h2>
        {selected && <model-viewer className="dh-asset-viewer" src={selected.url} camera-controls auto-rotate auto-rotate-delay="0" rotation-per-second={demoStep === 1 ? "18deg" : "9deg"} camera-orbit={orbit} field-of-view={fov} exposure="1" reveal="auto" />}
        <div className="dh-asset-actions">
          <button type="button" onClick={() => setDemoStep(0)}>Open View</button>
          <button type="button" onClick={conductNext}>Conduct Next</button>
          <button type="button" onClick={() => setDemoStep(1)}>Rotate</button>
          <button type="button" onClick={() => setDemoStep(3)}>Zoom</button>
        </div>
        <div className="dh-asset-meta">
          <b>{selected?.name}</b>
          <span>{selected?.status}</span>
          <span>{spokenLine}</span>
          {selected?.sponsor?.name && <span>Sponsored by {selected.sponsor.name}: {selected.sponsor.placement}</span>}
          <a className="dh-share-link" href={shareUrl}>{shareUrl}</a>
        </div>
      </div>

      <div className="dh-backend-panel">
        <h2>Queue</h2>
        {assets.map((item) => <button key={item.id} className={`dh-queue-card ${item.id === selected?.id ? "active" : ""}`} type="button" onClick={() => setSelectedId(item.id)}>
          <b>{item.name}</b>
          <span>{item.status}</span>
          <div className="dh-progress"><span style={{width: `${item.progress}%`}} /></div>
          <small>{item.type} / {item.visibility}</small>
        </button>)}
      </div>

      <div className="dh-backend-panel">
        <h2>Profile Library Edit</h2>
        {selected && <>
          <label>Description<textarea value={selected.description} onChange={(event) => updateSelected({description: event.target.value})} /></label>
          <label>Visibility<select value={selected.visibility} onChange={(event) => updateSelected({visibility: event.target.value})}><option>Private until published</option><option>Share link live</option><option>Public profile</option></select></label>
          <label>Comment<input onKeyDown={(event) => {if(event.key === "Enter" && event.currentTarget.value.trim()){updateSelected({comments: [...selected.comments, event.currentTarget.value.trim()]}); event.currentTarget.value = ""}}} placeholder="Add comment and press Enter" /></label>
          <div className="dh-comment-row">{selected.comments.map((item) => <span key={item}>{item}</span>)}</div>
        </>}
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
        <h2>Future Demo Editor</h2>
        <p>Coming soon after 10,000 subscribers: public demo editing, multi-model scene cutting, deeper camera choreography, download queue expansion, and creator-controlled demo publishing.</p>
        <div className="dh-progress"><span style={{width: "7%"}} /></div>
        <small>Current public max: AI speaks and presents one current model.</small>
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
    </section>
  </main>
}
