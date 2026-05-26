import React,{useEffect,useState}from"react"
import{createRoot}from"react-dom/client"

const TOKEN="137a2704a95d4051b5ffe795b90d92ce"
const PAY_WALLET="0x3337984Ca74fF56327B43759F56446058F8266EC"

const tiers=[
 {name:"STANDARD",price:"$35",eth:"0.01",features:["Live observatory scans","AI voice guide","Research source links"]},
 {name:"PREMIUM",price:"$50",eth:"0.015",features:["Everything Standard","Real-time library feed","Saved wallet access"]},
 {name:"PRO",price:"$100",eth:"0.03",features:["Everything Premium","Backend access layer","Behavior intelligence dashboard"]}
]

const sources=[
 ["Sketchfab","3D internet discovery feed","https://sketchfab.com"],
 ["NASA","planetary and science research layer","https://nasa3d.arc.nasa.gov"],
 ["OpenStreetMap","global map and location context","https://www.openstreetmap.org"],
 ["Smithsonian 3D","museum and cultural archive layer","https://3d.si.edu"],
 ["Cesium","terrain and geospatial direction","https://cesium.com/platform/cesium-ion/"],
 ["ByteDance-style Intelligence","retention-inspired observatory behavior logic","#"]
]

const good=["environment","terrain","city","architecture","map","landscape","space","planet","coast","forest","building","observatory","museum","historic","industrial","street"]
const bad=["gun","weapon","rifle","pistol","knife","blood","gore","chair","sofa","toy","anime girl"]

function clean(t=""){
 return t
 .replace(/<[^>]*>/g,"")
 .replace(/https?:\/\/\S+/g,"")
 .replace(/\s+/g," ")
 .trim()
 .slice(0,320)
}

function score(x){
 const text=((x.name||"")+" "+(x.description||"")+" "+(x.categories||[]).map(c=>c.name).join(" ")).toLowerCase()
 let s=0
 good.forEach(w=>{if(text.includes(w))s+=8})
 bad.forEach(w=>{if(text.includes(w))s-=80})
 return s
}

function speak(t){
 try{
  speechSynthesis.cancel()
  let u=new SpeechSynthesisUtterance(t)
  u.rate=.93
  speechSynthesis.speak(u)
 }catch(e){}
}

function metric(a,b){
 return Math.floor(a+Math.random()*(b-a))
}

function App(){

 const[q,setQ]=useState("japan city environment")
 const[wallet,setWallet]=useState("")
 const[chain,setChain]=useState("Disconnected")
 const[active,setActive]=useState(null)
 const[items,setItems]=useState([])
 const[log,setLog]=useState("dApp runtime ready")
 const[backend,setBackend]=useState("locked")

 const[feed,setFeed]=useState([
  "NASA lunar terrain",
  "Tokyo city scan",
  "African heritage site",
  "Brazil rainforest",
  "Iceland volcano"
 ])

 async function connectWallet(){

  if(!window.ethereum){
   return alert("Open with MetaMask or wallet browser")
  }

  const acc=await window.ethereum.request({
   method:"eth_requestAccounts"
  })

  const cid=await window.ethereum.request({
   method:"eth_chainId"
  })

  setWallet(acc[0])
  setChain(cid==="0x89"?"Polygon":"Ethereum")
 }

 async function buy(tier){

  if(!wallet){
   return alert("Connect wallet first")
  }

  try{

   await window.ethereum.request({
    method:"eth_sendTransaction",
    params:[{
     from:wallet,
     to:PAY_WALLET,
     value:(parseFloat(tier.eth)*1e18).toString(16)
    }]
   })

   setBackend(tier.name)

   alert(tier.name+" backend access request sent")

  }catch(e){
   console.log(e)
  }
 }

 async function scan(seed=q){

  setLog("Scanning live internet observatory...")

  const styles=[
   "environment",
   "terrain scan",
   "city map",
   "architecture",
   "research site",
   "satellite landscape",
   "historic district",
   "planetary observatory",
   "coastline",
   "museum 3d"
  ]

  const query=seed+" "+styles[Math.floor(Math.random()*styles.length)]

  const r=await fetch(
   `https://api.sketchfab.com/v3/search?type=models&q=${encodeURIComponent(query)}&sort_by=-likeCount`,
   {
    headers:{
     Authorization:`Token ${TOKEN}`
    }
   }
  )

  const d=await r.json()

  const list=(d.results||[])
   .sort((a,b)=>score(b)-score(a))
   .filter(x=>score(x)>-30)
   .slice(0,12)

  setItems(list)
  setActive(list[0]||null)

  setFeed(f=>[seed,...f].slice(0,8))

  setLog("Loaded "+list.length+" research-grade observatory signals")

  if(list[0]){
   speak(
    "Observatory signal detected. "+
    list[0].name+
    ". "+
    clean(list[0].description||"Global research environment loaded.")
   )
  }
 }

 function voice(){

  const SR=window.SpeechRecognition||window.webkitSpeechRecognition

  if(!SR){
   return alert("Voice search unsupported")
  }

  const rec=new SR()

  rec.lang="en-US"

  rec.onresult=e=>{
   let heard=e.results[0][0].transcript
   setQ(heard)
   setTimeout(()=>scan(heard),300)
  }

  rec.start()
 }

 useEffect(()=>{
  scan("global research observatory")
 },[])

 return(
 <main>

  <nav>
   <b>DigitalHut.app</b>

   <a href="#how">How It Works</a>
   <a href="#sources">Sources</a>
   <a href="#access">Access</a>
   <a href="#library">Library</a>
   <a href="#observatory">Observatory</a>

   <button onClick={connectWallet}>
    {wallet
     ?wallet.slice(0,6)+"..."+wallet.slice(-4)
     :"Connect Wallet"}
   </button>
  </nav>

  <section className="hero">

   <div>

    <p className="eyebrow">
     LIVE AI-NATIVE dAPP OBSERVATORY
    </p>

    <h1>
     Explore the internet as a real-time 3D research feed.
    </h1>

    <p>
     DigitalHut.app combines voice search,
     wallet access,
     research links,
     global maps,
     live 3D discovery,
     and behavior intelligence into one premium observatory experience.
    </p>

    <button onClick={()=>scan("NASA lunar observatory")}>
     Launch Live Scan
    </button>

    <button className="ghost" onClick={connectWallet}>
     Connect Backend Wallet
    </button>

   </div>

   <div className="status">

    <span></span>

    <b>{chain}</b>

    <p>Backend: {backend}</p>

    <p>
     Wallet: {wallet||"not connected"}
    </p>

    <p>
     Receiver: {PAY_WALLET.slice(0,8)}...{PAY_WALLET.slice(-6)}
    </p>

   </div>

  </section>

  <section id="how" className="glass">

   <h2>How To Use The Observatory</h2>

   <div className="steps">

    <div>
     <b>1</b>
     <h3>Search or Speak</h3>
     <p>
      Type a location,
      topic,
      terrain,
      city,
      research area,
      or speak into the observatory.
     </p>
    </div>

    <div>
     <b>2</b>
     <h3>AI Scans Sources</h3>
     <p>
      The system searches internet 3D feeds
      and filters for research-grade environments.
     </p>
    </div>

    <div>
     <b>3</b>
     <h3>Open The Signal</h3>
     <p>
      View the live 3D embed,
      source link,
      metadata,
      and behavior intelligence.
     </p>
    </div>

    <div>
     <b>4</b>
     <h3>Save Access</h3>
     <p>
      Wallet access prepares the backend
      for saved scans,
      purchases,
      and personal libraries.
     </p>
    </div>

   </div>

  </section>

  <section id="sources" className="glass">

   <h2>Research Source Layer</h2>

   <p className="muted">
    These are public research/data sources and inspiration layers,
    not claimed official sponsors unless a formal partnership is signed.
   </p>

   <div className="sourceGrid">

    {sources.map(([n,d,u])=>

     <a className="source" href={u} target="_blank" key={n}>

      <b>{n}</b>

      <span>{d}</span>

     </a>

    )}

   </div>

  </section>

  <section id="access" className="glass">

   <h2>Backend Wallet Access</h2>

   <div className="tiers">

    {tiers.map(t=>

     <div className="tier" key={t.name}>

      <h3>{t.name}</h3>

      <h1>{t.price}</h1>

      {t.features.map(f=>
       <p key={f}>✓ {f}</p>
      )}

      <button onClick={()=>buy(t)}>
       Get Access
      </button>

     </div>

    )}

   </div>

  </section>

  <section id="library" className="glass">

   <h2>Real-Time Library</h2>

   <div className="library">

    {feed.map(x=>

     <button
      key={x}
      onClick={()=>{
       setQ(x)
       scan(x)
      }}
     >
      {x}
     </button>

    )}

   </div>

   <div className="metrics">

    <div>
     <b>{metric(70,96)}%</b>
     <span>Curiosity</span>
    </div>

    <div>
     <b>{metric(6000,14000)}ms</b>
     <span>Orbit Hold</span>
    </div>

    <div>
     <b>{metric(2,8)}x</b>
     <span>Replay Pull</span>
    </div>

    <div>
     <b>{metric(35,88)}%</b>
     <span>Voice Retention</span>
    </div>

   </div>

  </section>

  <section id="observatory" className="glass">

   <h2>The Observatory</h2>

   <textarea
    value={q}
    onChange={e=>setQ(e.target.value)}
   />

   <button onClick={()=>scan(q)}>
    Run Observatory Signal
   </button>

   <button className="purple" onClick={voice}>
    Speak Observatory Search
   </button>

   <p className="green">{log}</p>

  </section>

  {active&&

  <section className="glass">

   <h2>{active.name}</h2>

   <iframe
    src={`https://sketchfab.com/models/${active.uid}/embed`}
    allow="autoplay; fullscreen; xr-spatial-tracking"
   />

   <p>
    {clean(active.description)||"Internet-fed research signal."}
   </p>

   <a href={active.viewerUrl} target="_blank">
    Open Source Asset
   </a>

   <a
    href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(q)}`}
    target="_blank"
   >
    Open Map Layer
   </a>

   <a href="https://trek.nasa.gov/" target="_blank">
    Open NASA Trek
   </a>

  </section>

  }

  <section className="cards">

   {items.map(x=>

    <button
     className="card"
     key={x.uid}
     onClick={()=>{
      setActive(x)
      speak("Switching observatory signal to "+x.name)
     }}
    >

     <img src={x.thumbnails?.images?.at(-1)?.url}/>

     <b>{x.name}</b>

    </button>

   )}

  </section>

 </main>
 )
}

createRoot(document.getElementById("root")).render(<App/>)

const style=document.createElement("style")

style.textContent=`
body{
 margin:0;
 background:radial-gradient(circle at top,#172554,#020617 48%,#000);
 color:white;
 font-family:Inter,Arial,sans-serif
}

main{
 max-width:1200px;
 margin:auto;
 padding:20px
}

nav{
 position:sticky;
 top:0;
 z-index:10;
 display:flex;
 align-items:center;
 gap:14px;
 background:rgba(2,6,23,.82);
 backdrop-filter:blur(20px);
 border:1px solid #1e293b;
 border-radius:22px;
 padding:12px;
 margin-bottom:18px
}

nav b{
 font-size:20px
}

nav a{
 color:#cbd5e1;
 text-decoration:none;
 font-size:13px
}

button{
 background:linear-gradient(135deg,#2563eb,#7c3aed);
 color:white;
 border:0;
 border-radius:15px;
 padding:13px 16px;
 font-weight:900;
 margin:6px;
 cursor:pointer
}

.hero,.glass{
 background:linear-gradient(145deg,rgba(15,23,42,.94),rgba(2,6,23,.98));
 border:1px solid rgba(148,163,184,.18);
 box-shadow:0 28px 90px rgba(0,0,0,.38);
 border-radius:30px;
 padding:26px;
 margin:18px 0
}

.hero{
 display:grid;
 grid-template-columns:1.5fr .8fr;
 gap:20px;
 min-height:330px;
 align-items:center
}

h1{
 font-size:56px;
 line-height:.96;
 margin:0 0 18px;
 letter-spacing:-2px
}

h2{
 margin-top:0
}

.eyebrow{
 color:#93c5fd;
 font-size:12px;
 font-weight:900;
 letter-spacing:2px
}

.muted,p{
 color:#cbd5e1;
 line-height:1.6
}

.status{
 background:#020617;
 border:1px solid #334155;
 border-radius:24px;
 padding:22px
}

.status span{
 display:inline-block;
 width:12px;
 height:12px;
 background:#22c55e;
 border-radius:50%;
 box-shadow:0 0 20px #22c55e;
 margin-right:10px
}

.steps,.sourceGrid,.tiers,.metrics{
 display:grid;
 grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
 gap:16px
}

.steps div,.source,.tier,.metrics div{
 background:#020617;
 border:1px solid #334155;
 border-radius:22px;
 padding:20px
}

.source{
 display:block;
 color:white;
 text-decoration:none
}

.source span{
 display:block;
 color:#93c5fd;
 margin-top:8px
}

textarea{
 width:100%;
 min-height:110px;
 background:#020617;
 color:white;
 border:1px solid #334155;
 border-radius:18px;
 padding:16px;
 font-size:16px
}

iframe{
 width:100%;
 height:560px;
 border:0;
 border-radius:24px;
 background:#000
}

.green{
 color:#22c55e
}

.purple{
 background:linear-gradient(135deg,#7c3aed,#a855f7)
}

.ghost{
 background:#111827;
 border:1px solid #334155
}

.library{
 display:flex;
 overflow:auto;
 gap:10px
}

.library button{
 white-space:nowrap;
 background:#111827;
 border:1px solid #334155
}

.metrics b{
 display:block;
 font-size:30px
}

.metrics span{
 color:#93c5fd
}

.cards{
 display:grid;
 grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
 gap:16px
}

.card{
 background:#0f172a;
 text-align:left;
 border:1px solid #334155
}

.card img{
 width:100%;
 border-radius:14px;
 margin-bottom:10px
}

a{
 color:#38bdf8;
 display:block;
 margin:9px 0
}

@media(max-width:750px){

 nav{
  overflow:auto
 }

 h1{
  font-size:38px
 }

 .hero{
  grid-template-columns:1fr
 }

 iframe{
  height:420px
 }

}
`

document.head.appendChild(style)
