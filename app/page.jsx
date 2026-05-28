"use client"

import {useEffect,useMemo,useState} from "react"

const TOKEN="137a2704a95d4051b5ffe795b90d92ce"
const PAY_WALLET="0x3337984Ca74fF56327B43759F56446058F8266EC"

const TIERS={
 FREE:{name:"FREE",price:"$0",cap:3,level:0,glb:false},
 STANDARD:{name:"STANDARD",price:"$35",eth:"0.01",cap:12,level:1,glb:false},
 PREMIUM:{name:"PREMIUM",price:"$50",eth:"0.015",cap:35,level:2,glb:true},
 PRO:{name:"PRO",price:"$100",eth:"0.03",cap:9999,level:3,glb:true}
}

const CATS=[
 ["Terrain","terrain landscape environment"],
 ["Planetary","planet moon mars planetary terrain space"],
 ["Geographical","geography map coastline mountain valley"],
 ["Structures","architecture building structure city"],
 ["Maps","map terrain city environment site plan"]
]

function clean(t=""){
 return t.replace(/<[^>]*>/g,"").replace(/\s+/g," ").trim().slice(0,380)
}

function detailFor(item,tier){
 const base=[
  `Location layer: ${item?.categories?.[0]?.name || "global / unspecified"}`,
  `Brief history: ${clean(item?.description || "This observatory signal is pulled from Sketchfab as a public 3D environment or structure.")}`,
  `Featured uploader: ${item?.user?.displayName || item?.user?.username || "Sketchfab creator"}`
 ]
 if(tier.level>=2){
  base.push("Second level detail: includes structure/architecture estimate, model stats, planetary/grid-style coordinates when available.")
  base.push(`Model UID / grid key: ${item?.uid}`)
 }
 if(tier.level>=3){
  base.push("Third level detail: water-system / plumbing / infrastructure notes unlock here when source metadata or uploaded plans are available.")
  base.push("Future API keys layer: Sketchfab, mapping, terrain, and observatory behavior intelligence integrations.")
 }
 return base
}

export default function Home(){
 const [wallet,setWallet]=useState("")
 const [tier,setTier]=useState("FREE")
 const [items,setItems]=useState([])
 const [active,setActive]=useState(null)
 const [saved,setSaved]=useState([])
 const [loading,setLoading]=useState(false)

 const tierObj=TIERS[tier]

 useEffect(()=>{
  const s=localStorage.getItem("dh_saved")
  const t=localStorage.getItem("dh_tier")
  if(s) setSaved(JSON.parse(s))
  if(t && TIERS[t]) setTier(t)
  scan("terrain landscape environment")
 },[])

 useEffect(()=>{
  localStorage.setItem("dh_saved",JSON.stringify(saved))
 },[saved])

 async function scan(q){
  setLoading(true)
  const r=await fetch(`https://api.sketchfab.com/v3/search?type=models&q=${encodeURIComponent(q)}&sort_by=-likeCount`,{
   headers:{Authorization:`Token ${TOKEN}`}
  })
  const d=await r.json()
  const list=(d.results||[]).filter(x=>x.uid&&x.name).slice(0,18)
  setItems(list)
  setActive(list[0]||null)
  setLoading(false)
 }

 async function connect(){
  if(!window.ethereum){alert("Open in MetaMask or wallet browser");return}
  const a=await window.ethereum.request({method:"eth_requestAccounts"})
  setWallet(a[0])
 }

 async function buy(k){
  if(k==="FREE"){setTier("FREE");localStorage.setItem("dh_tier","FREE");return}
  if(!wallet){await connect();return}
  const plan=TIERS[k]
  try{
   await window.ethereum.request({
    method:"eth_sendTransaction",
    params:[{
     from:wallet,
     to:PAY_WALLET,
     value:"0x"+Math.floor(parseFloat(plan.eth)*1e18).toString(16)
    }]
   })
   setTier(k)
   localStorage.setItem("dh_tier",k)
   alert(`${plan.name} unlocked`)
  }catch(e){alert("Payment not completed")}
 }

 function saveItem(){
  if(!active)return
  if(saved.length>=tierObj.cap){alert(`${tierObj.name} history cap reached. Upgrade to save more.`);return}
  if(saved.find(x=>x.uid===active.uid)){alert("Already saved");return}
  setSaved([{uid:active.uid,name:active.name,thumb:active.thumbnails?.images?.at(-1)?.url,creator:active.user?.displayName||active.user?.username||"Sketchfab creator"},...saved])
 }

 const details=useMemo(()=>detailFor(active,tierObj),[active,tier])

 return <main>
  <style>{`
   body{margin:0;background:#020617;color:white;font-family:Arial,sans-serif}
   main{min-height:100vh}
   .wrap{max-width:1300px;margin:auto;padding:24px}
   h1{font-size:clamp(58px,11vw,130px);line-height:.86;margin:0 0 24px;letter-spacing:-5px}
   p,li{color:#cbd5e1;font-size:18px;line-height:1.6}
   .hero,.panel,.viewer,.tier,.card{background:#0f172a;border:1px solid #334155;border-radius:30px}
   .hero,.panel{padding:28px;margin-bottom:22px}
   .cats,.tiers,.cards,.saved{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px}
   button{background:linear-gradient(135deg,#2563eb,#7c3aed);color:white;border:0;border-radius:16px;padding:14px 18px;font-weight:900;font-size:15px}
   .viewer{overflow:hidden;margin-bottom:22px}
   iframe{width:100%;height:64vh;border:0;background:#000}
   .info{padding:22px}
   .tier,.card{overflow:hidden;padding:20px}
   .card{padding:0;text-align:left}
   .card img,.saved img{width:100%;height:190px;object-fit:cover}
   .card b,.saved b{display:block;padding:18px;font-size:24px}
   .active{outline:4px solid #2563eb}
   .locked{opacity:.55}
   .green{color:#22c55e;font-weight:900}
   .savedItem{background:#111827;border:1px solid #334155;border-radius:24px;overflow:hidden}
   a{color:#38bdf8}
  `}</style>

  <div className="wrap">
   <section className="hero">
    <h1>DigitalHut Observatory</h1>
    <p>Terrain, planetary, geographical, structure, and map-based 3D observatory library powered by Sketchfab, wallet access, saved history, GLB access tiers, and SearchAtlas intelligence.</p>
    <button onClick={connect}>{wallet?wallet.slice(0,6)+"..."+wallet.slice(-4):"Connect MetaMask"}</button>
    <p className="green">Current tier: {tierObj.name} | Saved cap: {tierObj.cap}</p>
   </section>

   <section className="panel">
    <h2>Observatory Library</h2>
    <div className="cats">{CATS.map(([n,q])=><button key={n} onClick={()=>scan(q)}>{n}</button>)}</div>
   </section>

   {active&&<section className="viewer">
    <iframe src={`https://sketchfab.com/models/${active.uid}/embed?autostart=1&ui_infos=0`} allow="autoplay; fullscreen; xr-spatial-tracking" allowFullScreen />
    <div className="info">
     <h2>{active.name}</h2>
     <button onClick={saveItem}>Save Observatory Signal</button>
     <a href={active.viewerUrl} target="_blank">Open Sketchfab Source</a>
     {tierObj.glb&&<a href={`https://sketchfab.com/3d-models/${active.uid}`} target="_blank">Premium/Pro GLB source access</a>}
     <ul>{details.map((d,i)=><li key={i}>{d}</li>)}</ul>
    </div>
   </section>}

   <section className="panel">
    <h2>Subscription Access</h2>
    <div className="tiers">{Object.entries(TIERS).map(([k,t])=>
     <div className="tier" key={k}>
      <h2>{t.name}</h2>
      <h3>{t.price}</h3>
      <p>Saved history cap: {t.cap===9999?"Unlimited":t.cap}</p>
      <p>{t.glb?"GLB/download access unlocked":"GLB downloads locked"}</p>
      <p>Detail level: {t.level}</p>
      <button onClick={()=>buy(k)}>Unlock {t.name}</button>
     </div>
    )}</div>
   </section>

   <section className="cards">
    {items.map(x=><button key={x.uid} onClick={()=>setActive(x)} className={`card ${active?.uid===x.uid?"active":""}`}>
     <img src={x.thumbnails?.images?.at(-1)?.url}/>
     <b>{x.name}</b>
    </button>)}
   </section>

   <section className="panel">
    <h2>Saved Observatory History</h2>
    <div className="saved">{saved.map(x=><div className="savedItem" key={x.uid}>
     <img src={x.thumb}/>
     <b>{x.name}</b>
     <p style={{padding:"0 18px 18px"}}>Featured uploader: {x.creator}</p>
    </div>)}</div>
   </section>
  </div>
 </main>
}
