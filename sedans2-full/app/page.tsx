"use client"

import React,{useEffect,useState}from"react"

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

function score(x:any){

 const text=((x.name||"")+" "+(x.description||"")+" "+(x.categories||[]).map((c:any)=>c.name).join(" ")).toLowerCase()

 let s=0

 good.forEach(w=>{
  if(text.includes(w))s+=8
 })

 bad.forEach(w=>{
  if(text.includes(w))s-=80
 })

 return s
}

function speak(t:string){

 try{

  speechSynthesis.cancel()

  let u=new SpeechSynthesisUtterance(t)

  u.rate=.93

  speechSynthesis.speak(u)

 }catch(e){}
}

function metric(a:number,b:number){
 return Math.floor(a+Math.random()*(b-a))
}

function App(){

 const[q,setQ]=useState("japan city environment")

 const[wallet,setWallet]=useState("")

 const[chain,setChain]=useState("Disconnected")

 const[active,setActive]=useState<any>(null)

 const[items,setItems]=useState<any[]>([])

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

  if(!(window as any).ethereum){
   return alert("Open with MetaMask or wallet browser")
  }

  const acc=await (window as any).ethereum.request({
   method:"eth_requestAccounts"
  })

  const cid=await (window as any).ethereum.request({
   method:"eth_chainId"
  })

  setWallet(acc[0])

  setChain(cid==="0x89"?"Polygon":"Ethereum")
 }

 async function buy(tier:any){

  if(!wallet){
   return alert("Connect wallet first")
  }

  try{

   await (window as any).ethereum.request({
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
   .sort((a:any,b:any)=>score(b)-score(a))
   .filter((x:any)=>score(x)>-30)
   .slice(0,12)

  setItems(list)

  setActive(list[0]||null)

  setFeed((f:any)=>[seed,...f].slice(0,8))

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

  const SR=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition

  if(!SR){
   return alert("Voice search unsupported")
  }

  const rec=new SR()

  rec.lang="en-US"

  rec.onresult=(e:any)=>{

   let heard=e.results[0][0].transcript

   setQ(heard)

   setTimeout(()=>scan(heard),300)
  }

  rec.start()
 }

 useEffect(()=>{
  scan("global research observatory")
 },[])

 useEffect(()=>{

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
`

  document.head.appendChild(style)

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
     and behavior intelligence.
    </p>

    <button onClick={()=>scan("NASA lunar observatory")}>
     Launch Live Scan
    </button>

   </div>

   <div className="status">

    <b>{chain}</b>

    <p>Backend: {backend}</p>

    <p>Wallet: {wallet||"not connected"}</p>

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

   <button onClick={voice}>
    Speak Observatory Search
   </button>

   <p>{log}</p>

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

  </section>

  }

  <section className="cards">

   {items.map((x:any)=>

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

export default App
