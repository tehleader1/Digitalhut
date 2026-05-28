"use client"

import {useState} from "react"

const LIBRARIES=[
 ["Terrain"],
 ["Planetary"],
 ["Geographical"],
 ["Structures"],
 ["Infrastructure"],
 ["Maps"],
 ["Observatory Market Intelligence"]
]

const TIERS=[
 {
  name:"FREE",
  price:"$0",
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
  history:"12 saved observatory signals",
  features:[
   "Saved GLB history",
   "Basic observatory routing",
   "Basic environment mapping"
  ]
 },
 {
  name:"PREMIUM",
  price:"$50",
  history:"40 saved observatory signals",
  features:[
   "Extended history",
   "Highlighted GLB signals",
   "Grid-point mapping"
  ]
 },
 {
  name:"PRO",
  price:"$100",
  history:"Unlimited observatory signals",
  features:[
   "Unlimited history",
   "Texture detail",
   "Download history",
   "AI project usage"
  ]
 }
]

export default function Home(){

 const [tier]=useState("FREE")

 return (

 <main
  style={{
   minHeight:"100vh",
   background:"#020617",
   color:"white",
   padding:"24px",
   fontFamily:"Arial"
  }}
 >

 <style>{`

  h1{
   font-size:clamp(60px,11vw,140px);
   line-height:.88;
   letter-spacing:-5px;
   margin:0 0 24px;
  }

  p{
   color:#cbd5e1;
   line-height:1.6;
   font-size:22px;
  }

  .hero,.glass{
   background:#0f172a;
   border:1px solid #334155;
   border-radius:34px;
   padding:30px;
   margin-bottom:24px;
  }

  .libs{
   display:grid;
   grid-template-columns:
    repeat(auto-fit,minmax(240px,1fr));
   gap:18px;
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

  .active{
   border:2px solid #22c55e;
   box-shadow:0 0 30px rgba(34,197,94,.3);
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
   padding:16px 20px;
   font-weight:900;
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
   powered by Sketchfab,
   observatory intelligence,
   and SearchAtlas systems.
  </p>

  <p className="green">
   Current Tier: FREE
  </p>

 </section>

 <section className="glass">

  <h2>
   Observatory Library
  </h2>

  <div className="libs">

   {LIBRARIES.map(([name])=>

    <button key={name}>
     {name}
    </button>

   )}

  </div>

 </section>

 <section className="glass">

  <h2>
   Live Observatory Runtime
  </h2>

  <p>
   GLB observatory runtime active.
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
      t.name==="FREE"
      ?"tier active"
      :"tier"
     }
    >

     <h2>{t.name}</h2>

     <h2>{t.price}</h2>

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
      <button>
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

  <p>
   • Terrain Observatory
  </p>

  <p>
   • Planetary Scan
  </p>

  <p>
   • Industrial Mapping
  </p>

 </section>

 </main>

 )

}
