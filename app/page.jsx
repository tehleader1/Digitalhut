"use client"

import {useEffect,useState} from "react"

const TOKEN="137a2704a95d4051b5ffe795b90d92ce"
const PAY_WALLET="0x3337984Ca74fF56327B43759F56446058F8266EC"

const good=["environment","terrain","city","architecture","map","landscape","space","planet","coast","forest","building","observatory","museum","historic","industrial","street","structure","plane","planetary"]
const bad=["gun","weapon","rifle","pistol","knife","blood","gore","chair","sofa","toy","anime girl"]

function clean(t=""){return t.replace(/<[^>]*>/g,"").replace(/https?:\/\/\S+/g,"").replace(/\s+/g," ").trim().slice(0,260)}
function score(x){
  const text=((x.name||"")+" "+(x.description||"")+" "+(x.categories||[]).map(c=>c.name).join(" ")).toLowerCase()
  let s=0
  good.forEach(w=>{if(text.includes(w))s+=8})
  bad.forEach(w=>{if(text.includes(w))s-=80})
  return s
}
function speak(t){try{speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(t);u.rate=.93;speechSynthesis.speak(u)}catch(e){}}

export default function Home(){
  const[q,setQ]=useState("structure environment map planetary")
  const[wallet,setWallet]=useState("")
  const[active,setActive]=useState(null)
  const[items,setItems]=useState([])
  const[log,setLog]=useState("Observatory ready")

  async function connectWallet(){
    if(!window.ethereum)return alert("Open with MetaMask or wallet browser")
    const acc=await window.ethereum.request({method:"eth_requestAccounts"})
    setWallet(acc[0])
  }

  async function scan(seed=q){
    setLog("Scanning Sketchfab for structures, environments, maps, planes, and planetary worlds...")
    const query=seed+" structure environment map terrain planet architecture"
    const r=await fetch(`https://api.sketchfab.com/v3/search?type=models&q=${encodeURIComponent(query)}&sort_by=-likeCount`,{
      headers:{Authorization:`Token ${TOKEN}`}
    })
    const d=await r.json()
    const list=(d.results||[]).sort((a,b)=>score(b)-score(a)).filter(x=>score(x)>-30).slice(0,12)
    setItems(list)
    setActive(list[0]||null)
    setLog("Loaded "+list.length+" observatory signals")
    if(list[0])speak("Observatory signal detected. "+list[0].name)
  }

  function voice(){
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition
    if(!SR)return alert("Voice search unsupported")
    const rec=new SR()
    rec.lang="en-US"
    rec.onresult=e=>{let heard=e.results[0][0].transcript;setQ(heard);setTimeout(()=>scan(heard),300)}
    rec.start()
  }

  useEffect(()=>{scan("global architecture environment map planetary")},[])

  return <main>
    <style>{`
      body{margin:0;background:radial-gradient(circle at top,#172554,#020617 48%,#000);color:white;font-family:Arial,sans-serif}
      main{max-width:1200px;margin:auto;padding:18px}
      nav{position:sticky;top:0;z-index:50;display:flex;gap:10px;align-items:center;overflow:auto;background:rgba(2,6,23,.86);backdrop-filter:blur(18px);border:1px solid #334155;border-radius:20px;padding:12px}
      button{background:linear-gradient(135deg,#2563eb,#7c3aed);color:white;border:0;border-radius:14px;padding:13px 16px;font-weight:900;margin:5px}
      .hero,.glass{background:linear-gradient(145deg,rgba(15,23,42,.94),rgba(2,6,23,.98));border:1px solid rgba(148,163,184,.22);box-shadow:0 28px 90px rgba(0,0,0,.38);border-radius:30px;padding:24px;margin:18px 0}
      h1{font-size:54px;line-height:.95;margin:0 0 16px;letter-spacing:-2px}
      p{color:#cbd5e1;line-height:1.6}
      textarea{width:100%;min-height:90px;background:#020617;color:white;border:1px solid #334155;border-radius:18px;padding:15px;font-size:17px}
      iframe{width:100%;height:560px;border:0;border-radius:24px;background:#000}
      .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px}
      .card{background:#0f172a;text-align:left;border:1px solid #334155;border-radius:22px;overflow:hidden;padding:0}
      .card img{width:100%;height:170px;object-fit:cover}
      .card b{display:block;padding:15px;font-size:20px}
      .green{color:#22c55e}.ghost{background:#111827;border:1px solid #334155}
      a{color:#38bdf8;display:block;margin:9px 0}
      @media(max-width:750px){h1{font-size:40px}iframe{height:420px}}
    `}</style>

    <nav>
      <b>DigitalHut.app</b>
      <button onClick={()=>scan("structure environment")}>Structures</button>
      <button onClick={()=>scan("planetary terrain map")}>Planetary</button>
      <button onClick={()=>scan("city architecture environment")}>Cities</button>
      <button onClick={connectWallet}>{wallet?wallet.slice(0,6)+"..."+wallet.slice(-4):"Connect Wallet"}</button>
    </nav>

    <section className="hero">
      <h1>DigitalHut Observatory</h1>
      <p>Explore live 3D structures, environments, planes, maps, terrain, and planetary worlds through an internet-fed Sketchfab observatory.</p>
    </section>

    <section className="glass">
      <h2>Run Observatory Search</h2>
      <textarea value={q} onChange={e=>setQ(e.target.value)} />
      <button onClick={()=>scan(q)}>Run Scan</button>
      <button className="ghost" onClick={voice}>Speak Search</button>
      <p className="green">{log}</p>
    </section>

    {active&&<section className="glass">
      <h2>{active.name}</h2>
      <iframe src={`https://sketchfab.com/models/${active.uid}/embed`} allow="autoplay; fullscreen; xr-spatial-tracking" />
      <p>{clean(active.description)||"Internet-fed observatory signal."}</p>
      <a href={active.viewerUrl} target="_blank">Open Source Asset</a>
      <a href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(q)}`} target="_blank">Open Map Layer</a>
      <a href="https://trek.nasa.gov/" target="_blank">Open NASA Trek</a>
    </section>}

    <section className="cards">
      {items.map(x=><button className="card" key={x.uid} onClick={()=>{setActive(x);speak("Switching observatory signal to "+x.name)}}>
        <img src={x.thumbnails?.images?.at(-1)?.url}/>
        <b>{x.name}</b>
      </button>)}
    </section>
  </main>
}
