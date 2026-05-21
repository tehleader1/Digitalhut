import React, {useEffect, useRef, useState} from "react"
import { createRoot } from "react-dom/client"

const BUY_LINK = "https://digitalhut.app"

function Home(){
  return (
    <div style={{width:"100vw",height:"100vh",background:"#020617",overflow:"hidden"}}>
      <iframe src="/simulator.html" title="DigitalHut 3D Simulator" style={{width:"100%",height:"100%",border:0}}/>
      <button onClick={()=>location.href="/?game=1"} style={floatBtn}>NFT GAME</button>
    </div>
  )
}

function Game(){
  const [screen,setScreen]=useState("lobby")
  const [name,setName]=useState(localStorage.getItem("dh_user") || "Player"+Math.floor(Math.random()*9999))
  const [mode,setMode]=useState("online")
  const [count,setCount]=useState(5)
  const [status,setStatus]=useState("Create or join an exclusive online lobby.")
  const [complete,setComplete]=useState(false)

  function createLobby(){
    localStorage.setItem("dh_user",name)
    setStatus("Lobby created. $75 crypto blockchain creation fee required for online exclusive room.")
    setScreen("countdown")
    setCount(5)
  }

  function joinLobby(){
    localStorage.setItem("dh_user",name)
    const open = Math.random() > .35
    setStatus(open ? "Open match found. Entering 54321 countdown lobby." : "Queued for farm outskirts break.")
    setScreen("countdown")
    setCount(open ? 5 : 10)
  }

  useEffect(()=>{
    if(screen!=="countdown") return
    if(count<=0){setScreen("play"); return}
    const t=setTimeout(()=>setCount(c=>c-1),1000)
    return()=>clearTimeout(t)
  },[screen,count])

  if(screen==="lobby") return (
    <div style={gameShell}>
      <h1>DigitalHut NFT Zombie Escort</h1>
      <p>Username</p>
      <input value={name} onChange={e=>setName(e.target.value)} style={input}/>
      <div style={{display:"flex",gap:10,margin:"18px 0"}}>
        <button onClick={()=>setMode("online")} style={mode==="online"?primary:secondary}>Online Exclusive</button>
        <button onClick={()=>setMode("lan")} style={mode==="lan"?primary:secondary}>Offline LAN Free</button>
      </div>
      <button onClick={createLobby} style={primary}>Create Lobby — $75 Crypto Fee</button>
      <button onClick={joinLobby} style={secondary}>Join Open Match</button>
      <p style={{color:"#facc15"}}>{status}</p>
      <p style={{color:"#94a3b8"}}>Online creation requires blockchain fee. Offline LAN friend play is free.</p>
    </div>
  )

  if(screen==="countdown") return (
    <div style={gameShell}>
      <h1>{count}</h1>
      <h2>{status}</h2>
      <p>Players loading: 4-8</p>
    </div>
  )

  if(complete) return <Complete/>

  return <Play name={name} onComplete={()=>setComplete(true)} onDead={()=>setScreen("lobby")}/>
}

function Play({name,onComplete,onDead}){
  const ref=useRef(null)

  useEffect(()=>{
    const c=ref.current, x=c.getContext("2d")
    let w,h,raf
    const R=()=>{w=c.width=innerWidth;h=c.height=innerHeight}
    R(); addEventListener("resize",R)

    const player={x:w/2,y:h-140,hp:100,level:1,checkpoint:"START"}
    const zones=["CITY OUTSKIRTS","FARM BREAK","BOAT CHECKPOINT","FINAL BOSS"]
    const team=Array.from({length:7},(_,i)=>({x:80+i*42,y:h-90,color:["#22c55e","#38bdf8","#a855f7","#facc15","#fb7185","#f97316","#14b8a6"][i]}))
    let enemies=[], shots=[], boss=null, tick=0

    function spawn(){
      for(let i=0;i<6+player.level*2;i++) enemies.push({x:Math.random()*w,y:-20,hp:30+player.level*10})
    }
    spawn()

    function loop(){
      tick++
      x.fillStyle="#06111f";x.fillRect(0,0,w,h)

      x.fillStyle="#111827"
      for(let i=0;i<9;i++) x.fillRect((i*97+tick)%w,80+(i%5)*115,130,80)
      x.fillStyle="#334155"
      for(let y=130;y<h;y+=160) x.fillRect(0,y,w,18)

      x.fillStyle="#fff";x.font="16px Arial"
      x.fillText(`${name} | HP ${player.hp} | LEVEL ${player.level} | ${zones[player.level-1]}`,18,28)
      x.fillText(`CHECKPOINT: ${player.checkpoint}`,18,52)

      if(tick%60===0) shots.push({x:player.x,y:player.y,vx:0,vy:-8})

      shots.forEach(s=>{s.y+=s.vy;x.fillStyle="#facc15";x.fillRect(s.x,s.y,5,14)})
      enemies.forEach(e=>{
        e.y+=1+player.level*.35
        x.fillStyle="#ef4444";x.fillRect(e.x,e.y,20,20)
        if(Math.hypot(e.x-player.x,e.y-player.y)<28){player.hp-=1;e.hp=0}
      })

      shots.forEach(s=>enemies.forEach(e=>{if(Math.hypot(s.x-e.x,s.y-e.y)<26)e.hp-=40}))
      enemies=enemies.filter(e=>e.hp>0 && e.y<h+30)
      shots=shots.filter(s=>s.y>-30)

      if(enemies.length===0){
        player.level++
        if(player.level===2) player.checkpoint="END LEVEL 2"
        if(player.level===3) player.checkpoint="FARM LEVEL CHECKPOINT"
        if(player.level===4){player.checkpoint="BOAT CHECKPOINT"; boss={x:w/2,y:120,hp:900}}
        if(player.level>4 && !boss) onComplete()
        else spawn()
      }

      if(boss){
        boss.y+=Math.sin(tick/25)*.8
        x.fillStyle="#a855f7";x.beginPath();x.arc(boss.x,boss.y,48,0,7);x.fill()
        x.fillStyle="#ef4444";x.fillRect(40,70,(w-80)*(boss.hp/900),18)
        shots.forEach(s=>{if(Math.hypot(s.x-boss.x,s.y-boss.y)<60)boss.hp-=10})
        if(boss.hp<=0){player.checkpoint="FINAL BOSS CHECKPOINT";boss=null;onComplete()}
      }

      team.forEach((p,i)=>{x.fillStyle=p.color;x.beginPath();x.arc(p.x,p.y,13,0,7);x.fill()})
      // removed old square;x.fillRect(player.x-14,player.y-14,28,28)

      if(player.hp<=0){
        if(player.level<2) onDead()
        else {player.hp=100; enemies=[]; spawn()}
      }

      raf=requestAnimationFrame(loop)
    }

    c.onclick=e=>{player.x=e.clientX;player.y=e.clientY}
    c.ontouchmove=e=>{const t=e.touches[0];player.x=t.clientX;player.y=t.clientY}
    loop()

    return()=>{cancelAnimationFrame(raf);removeEventListener("resize",R)}
  },[])

  return <canvas ref={ref} style={{width:"100vw",height:"100vh",display:"block",background:"#020617"}}/>
}

function Complete(){
  return (
    <div style={gameShell}>
      <h1>GAME COMPLETE</h1>
      <p>Everyone still on screen now has a chance at limited edition and epic rewards.</p>
      <h2>Recommended Buys</h2>
      <p>Limited edition character outfits: $10-$100</p>
      <p>Weapons: $10-$500</p>
      <p>Bonus companions: $300 each</p>
      <p>SupAndroid722 • Ancient Gryphon</p>
      <button onClick={()=>location.href=BUY_LINK} style={primary}>Open Shopify Limited Edition Shop</button>
    </div>
  )
}

const gameShell={minHeight:"100vh",background:"#020617",color:"white",padding:24,fontFamily:"Arial"}
const input={width:"100%",padding:16,borderRadius:12,border:"1px solid #7c3aed",background:"#111827",color:"white",fontSize:18}
const primary={width:"100%",padding:18,margin:"8px 0",border:0,borderRadius:14,background:"#7c3aed",color:"white",fontWeight:"bold"}
const secondary={...primary,background:"#111827",border:"1px solid #334155"}
const floatBtn={position:"fixed",top:18,right:18,zIndex:9999,background:"#7c3aed",color:"white",border:0,borderRadius:14,padding:"14px 18px",fontWeight:"bold"}

const params=new URLSearchParams(location.search)
createRoot(document.getElementById("root")).render(params.get("game")?<Game/>:<Home/>)
async function dojjResponse(){

  const r=await fetch("/dojj-response.json")

  const data=await r.json()

  console.log("DOJJ RESPONSE",data)

  return data
}

dojjResponse().then(data=>{

  console.log(
    "DOJJ RECOMMENDATION:",
    data.recommendation
  )

  Object.entries(data.analysis).forEach(([k,v])=>{

    console.log(
      "PACK:",
      k,
      "STATUS:",
      v.status,
      "FEATURES:",
      v.features
    )
  })
})
const DOJJ_STATUS = [
  "CITY PACK READY",
  "FARM PACK READY",
  "BOAT PACK READY",
  "MADAGASCAR PACK READY",
  "CHARACTER PACK MISSING",
  "AUDIO PACK MISSING"
]
async function loadRenderManifest(){

  const r=await fetch(
    "/assets/dojj/render-manifest.json"
  )

  const data=await r.json()

  console.log(
    "DOJJ RENDER MANIFEST",
    data
  )

  return data
}

loadRenderManifest()
const SURVIVOR_IMG = new Image()

SURVIVOR_IMG.src =
"/assets/dojj/imports/survivors/Top_Down_Survivor/feet/idle/survivor-idle_0.png"
function renderSurvivorSprite(x,player){

  if(!SURVIVOR_IMG.complete)return

  x.save()

  x.translate(player.x,player.y)

  x.rotate(player.angle)

  x.drawImage(
    SURVIVOR_IMG,
    -32,
    -32,
    64,
    64
  )

  x.restore()
}
const CITY_TEXTURE = new Image()

CITY_TEXTURE.src =
"/assets/dojj/imports/city/PNG/Tiles/tile_0000.png"

const ROAD_TEXTURE = new Image()

ROAD_TEXTURE.src =
"/assets/dojj/imports/city/PNG/Tiles/tile_0001.png"
function renderEnvironmentTextures(x,w,h){

  if(CITY_TEXTURE.complete){

    for(let i=0;i<w;i+=128){

      for(let j=0;j<h;j+=128){

        x.drawImage(
          CITY_TEXTURE,
          i,
          j,
          128,
          128
        )
      }
    }
  }

  if(ROAD_TEXTURE.complete){

    for(let y=120;y<h;y+=220){

      x.drawImage(
        ROAD_TEXTURE,
        0,
        y,
        w,
        80
      )
    }
  }
}
