"use client"
import {useState} from "react"

const tiers = {
  FREE:{price:0, downloads:3, history:3},
  STANDARD:{price:35, downloads:12, history:12},
  PREMIUM:{price:50, downloads:40, history:40},
  PRO:{price:100, downloads:999, history:999}
}

const glbs = {
  Terrain:["Canada Terrain GLB","Europe Heightmap","Florida Beachfront"],
  Planetary:["Moon Scan","Mars Surface","Earth Orbit"],
  Geographical:["New York Manhattan","Rio Brazil","Vancouver Canada"],
  Structures:["European Buildings","City Pack","Morgantown WV"],
  Maps:["World Map Layer","Regional Atlas","Survey Grid"]
}

export default function Home(){
  const [wallet,setWallet]=useState("")
  const [tier,setTier]=useState("FREE")
  const [query,setQuery]=useState("")
  const [feed,setFeed]=useState("Search terrain, maps, structures, countries, planets, or cities.")
  const [history,setHistory]=useState([])
  const [voice,setVoice]=useState("")

  async function connectWallet(){
    if(window.ethereum){
      const acc=await window.ethereum.request({method:"eth_requestAccounts"})
      setWallet(acc[0])
      localStorage.setItem("wallet",acc[0])
    } else alert("Install MetaMask or wallet browser.")
  }

  function speak(text){
    const u=new SpeechSynthesisUtterance(text)
    speechSynthesis.speak(u)
  }

  function runSearch(q=query){
    const result = `DigitalHut Observatory AI: ${q || "global"} signal found. Pulling structure, terrain, geographic, planetary, and map intelligence from observatory feed. Sketchfab/NASA/map-style source routing ready.`
    setFeed(result)
    setHistory(h=>[q || "global observatory",...h].slice(0,tiers[tier].history))
    speak(result)
  }

  function voiceSearch(){
    const R=window.SpeechRecognition||window.webkitSpeechRecognition
    if(!R) return alert("Voice recognition not supported in this browser.")
    const r=new R()
    r.onresult=e=>{
      const text=e.results[0][0].transcript
      setQuery(text); setVoice(text); runSearch(text)
    }
    r.start()
  }

  function unlock(t){
    setTier(t)
    localStorage.setItem("tier",t)
    alert(`${t} active for ${wallet || "local test wallet"}`)
  }

  return <main style={wrap}>
    <section style={card}>
      <h1>DigitalHut Observatory</h1>
      <p>Wallet-gated AI observatory feed for terrain, planetary, geographical, structural, infrastructure and map intelligence.</p>
      <button style={btn} onClick={connectWallet}>{wallet?wallet.slice(0,8)+"..."+wallet.slice(-4):"Connect Wallet"}</button>
      <h2>Current Tier: <span style={{color:"#58d26a"}}>{tier}</span></h2>
    </section>

    <section style={card}>
      <h2>Live Observatory Feed</h2>
      <textarea value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search Canada, Japan tunnel, Florida terrain, moon, airport, stadium..." style={input}/>
      <button style={btn} onClick={()=>runSearch()}>Search Observatory</button>
      <button style={btn} onClick={voiceSearch}>Voice Search</button>
      <p>{voice && `Voice heard: ${voice}`}</p>
      <div style={result}>{feed}</div>
    </section>

    <section style={card}>
      <h2>Observatory Library</h2>
      {Object.entries(glbs).map(([cat,items])=>
        <div key={cat} style={mini}>
          <h3>{cat}</h3>
          {items.map((x,i)=><p key={i}>• {x} {i < tiers[tier].downloads ? <b>Download Ready</b> : <b>Locked</b>}</p>)}
        </div>
      )}
    </section>

    <section style={card}>
      <h2>Wallet Subscription Access</h2>
      {Object.entries(tiers).map(([name,t])=>
        <div key={name} style={tierBox}>
          <h3>{name}</h3>
          <h2>${t.price}</h2>
          <p>{t.history} saved observatory signals · {t.downloads} GLB downloads</p>
          <button style={btn} onClick={()=>unlock(name)}>Unlock {name}</button>
        </div>
      )}
    </section>

    <section style={card}>
      <h2>Saved Observatory History</h2>
      {history.map((h,i)=><p key={i}>• {h}</p>)}
      <p>Subscription status: {tier}</p>
      <p>Wallet: {wallet || "not connected"}</p>
    </section>

    <a href="/market" style={btn}>Open Observatory Intelligence Market</a>
  </main>
}

const wrap={background:"#050816",color:"white",minHeight:"100vh",padding:"30px",fontFamily:"Arial"}
const card={background:"#111827",border:"1px solid #26334f",borderRadius:"28px",padding:"28px",margin:"22px 0"}
const btn={display:"inline-block",background:"#6d3df2",color:"white",padding:"14px 22px",borderRadius:"18px",border:"0",fontWeight:"900",margin:"8px",textDecoration:"none"}
const input={width:"100%",minHeight:"90px",background:"#050816",color:"white",border:"1px solid #26334f",borderRadius:"18px",padding:"16px",fontSize:"18px"}
const result={background:"#050816",padding:"18px",borderRadius:"18px",marginTop:"15px"}
const mini={background:"#050816",padding:"15px",borderRadius:"18px",margin:"12px 0"}
const tierBox={background:"#050816",padding:"18px",borderRadius:"18px",margin:"15px 0"}
