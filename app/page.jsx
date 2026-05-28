"use client"

import {useEffect,useState} from "react"

const TOKEN="137a2704a95d4051b5ffe795b90d92ce"

const PAY_WALLET=
"0x3337984Ca74fF56327B43759F56446058F8266EC"

const TIERS=[

 {
  name:"FREE",
  price:"$0",
  level:0,
  history:"3 saved observatory signals",
  features:[
   "Basic GLB history",
   "Basic description",
   "Basic mapping",
   "Viewer access"
  ]
 },

 {
  name:"STANDARD",
  price:"$35",
  level:1,
  history:"12 saved observatory signals",
  features:[
   "Saved GLB history",
   "Basic observatory routing",
   "Basic environment mapping",
   "Basic structure intelligence"
  ]
 },

 {
  name:"PREMIUM",
  price:"$50",
  level:2,
  history:"40 saved observatory signals",
  features:[
   "Extended observatory history",
   "Highlighted GLB signals",
   "Grid-point mapping",
   "Enhanced environment detail",
   "Advanced observatory overlays"
  ]
 },

 {
  name:"PRO",
  price:"$100",
  level:3,
  history:"Unlimited observatory signals",
  features:[
   "Unlimited history",
   "Perfect detailed mapping",
   "Texture detail layers",
   "Download history",
   "Advanced grid mapping",
   "Business meeting usage",
   "School project usage",
   "Real estate project usage",
   "DigitalHut personal AI project use"
  ]
 }

]

export default function Home(){

 const [wallet,setWallet]=useState("")

 const [tier,setTier]=useState(
  TIERS[0]
 )

 const [saved,setSaved]=useState([])

 async function connectWallet(){

  if(!window.ethereum){

   alert(
    "Open with MetaMask browser"
   )

   return
  }

  const acc=
   await window.ethereum.request({
    method:"eth_requestAccounts"
   })

  setWallet(acc[0])

 }

 async function unlockTier(t){

  if(t.name !== "FREE" && !wallet){

   alert(
    "Connect wallet first"
   )

   return
  }

  setTier(t)

  alert(
   `${t.name} observatory access enabled`
  )

 }

 useEffect(()=>{

  const fakeHistory=[
   "Terrain Observatory",
   "Planetary Scan",
   "Industrial Mapping"
  ]

  setSaved(fakeHistory)

 },[])

 return (

 <main style={{
  minHeight:"100vh",
  background:"#020617",
  color:"white",
  padding:"24px",
  fontFamily:"Arial"
 }}>

 <style>{`

 h1{
  font-size:clamp(
   60px,
   11vw,
   140px
  );

  line-height:.88;

  letter-spacing:-5px;

  margin:0 0 24px;
 }

 p{
  color:#cbd5e1;
  font-size:22px;
  line-height:1.6;
 }

 .hero,
 .glass{
  background:#0f172a;
  border:1px solid #334155;
  border-radius:34px;
  padding:30px;
  margin-bottom:24px;
 }

 button{
  background:
   linear-gradient(
    135deg,
    #2563eb,
    #7c3aed
   );

  color:white;

  border:0;

  border-radius:20px;

  padding:16px 22px;

  font-weight:900;

  margin-top:12px;
 }

 .tierGrid{
  display:grid;

  grid-template-columns:
   repeat(auto-fit,minmax(280px,1fr));

  gap:20px;
 }

 .tier{
  background:#020617;
  border:1px solid #334155;
  border-radius:28px;
  padding:24px;
 }

 .tier h2{
  font-size:42px;
  margin:0;
 }

 .tier h3{
  font-size:34px;
  color:#22c55e;
 }

 .tier li{
  color:#cbd5e1;
  margin-bottom:10px;
 }

 .active{
  border:2px solid #22c55e;
  box-shadow:0 0 30px rgba(34,197,94,.3);
 }

 .history{
  background:#020617;
  border:1px solid #334155;
  border-radius:24px;
  padding:20px;
  margin-top:18px;
 }

 .green{
  color:#22c55e;
  font-weight:900;
 }

 `}</style>

 <section className="hero">

  <h1>
   DigitalHut
   <br/>
   Observatory
  </h1>

  <p>
   Terrain,
   planetary,
   geographical,
   structural,
   industrial,
   and infrastructure observatory runtime
   with wallet access,
   observatory history,
   GLB intelligence,
   SearchAtlas integration,
   and AI observatory systems.
  </p>

  

  <p className="green">

   Current Tier:
   {" "}
   {tier.name}

  </p>

 </section>

 
<section className="glass">

  <h2>
   Observatory Subscription Access
  </h2>

  <div className="tierGrid">

   {TIERS.map(t=>

    <div
     key={t.name}
     className={
      tier.name===t.name
      ?"tier active"
      :"tier"
     }
    >

     <h2>{t.name}</h2>

     <h3>{t.price}</h3>

     <p>{t.history}</p>

     <ul>

      {t.features.map(f=>

       <li key={f}>
        {f}
       </li>

      )}

     </ul>

     {
      t.name==="FREE"
      ?
      <div className="green">
       FREE ACTIVE
      </div>
      :
      <button
       onClick={()=>unlockTier(t)}
      >
       Unlock {t.name}
      </button>
     }

    </div>

   )}

  </div>

 </section>


 <section className="glass">

  <h2>
   Saved Observatory History
  </h2>

  <div className="history">

   {saved
    .slice(
      0,
      tier.level===0
      ?3
      :tier.level===1
      ?12
      :tier.level===2
      ?40
      :9999
    )
    .map(x=>

     <p key={x}>
      • {x}
     </p>

   )}

  </div>

 </section>

 </main>

 )

}
// force rebuild Thu May 28 10:33:04 EDT 2026
