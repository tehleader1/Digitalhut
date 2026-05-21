import React,{useState}from"react"
import {Canvas} from "@react-three/fiber"
import {OrbitControls,Stage,useGLTF,Environment} from "@react-three/drei"

function GLBModel({url}){
  const {scene}=useGLTF(url)
  return <primitive object={scene} scale={1.4}/>
}

const categories=[

{
title:"Canada Observatory",
glb:"/glb/panorama_residence_schonblick_-_latschinig.glb",
desc:"Luxury Canadian mountain observatory architecture with premium modern environmental design."
},

{
title:"Japan Tatami Origin",
glb:"/glb/japanese_tatami_room.glb",
desc:"Traditional Japanese tatami spacing logic and minimalist architecture."
},

{
title:"Japan Residential",
glb:"/glb/japanese_residential_home_03(1).glb",
desc:"Modern Japanese residential smart-home architecture."
},

{
title:"Thailand Tropical Living",
glb:"/glb/traditional_thai_house.glb",
desc:"Thailand-inspired tropical airflow engineering and warm-climate architecture."
},

{
title:"African Architecture",
glb:"/glb/africa_house(1).glb",
desc:"African environmental architecture and climate-adaptive structures."
},

{
title:"Brick House Origins",
glb:"/glb/two-story_brick_family_house.(1).glb",
desc:"Western suburban structural geometry and brick-family architecture."
},

{
title:"India Urban Homes",
glb:"/glb/india_house.glb",
desc:"Indian multi-story urban housing and regional architecture."
},

{
title:"Executive Office",
glb:"/glb/ai_office-room.glb",
desc:"Enterprise AI office observatory and business workflow environment."
}

]

export default function Simulator(){

const[current,setCurrent]=useState(categories[0])

return(
<main style={page}>

<div style={hero}>

<h1>DigitalHut Observatory</h1>

<p>
Living architecture intelligence archive powered by AI contextual analysis.
</p>

<p style={{opacity:.8}}>
Guest Preview Active
<br/>
Connect wallet + subscription for uploads and full observatory access.
</p>

</div>

<div style={swipeRow}>

{categories.map(cat=>(

<div
key={cat.title}
style={{
...categoryCard,
border:
current.title===cat.title
?"1px solid #7c3aed"
:"1px solid #334155"
}}
onClick={()=>setCurrent(cat)}
>

<div style={miniGlow}/>

<h3>{cat.title}</h3>

<p>{cat.desc}</p>

</div>

))}

</div>

<div style={viewer}>

<Canvas camera={{position:[4,3,6],fov:45}}>

<ambientLight intensity={1}/>

<Stage environment="city" intensity={0.7}>

<GLBModel url={current.glb}/>

</Stage>

<Environment preset="city"/>

<OrbitControls
enableZoom
enablePan
autoRotate
autoRotateSpeed={1.1}
/>

</Canvas>

<div style={overlay}>

<h1>{current.title}</h1>

<p>
{current.desc}
</p>

</div>

</div>

<div style={grid}>

<div style={panel}>

<h2>Observatory Intelligence</h2>

<ul>
<li>Historical architecture analysis</li>
<li>Scientific observations</li>
<li>Mathematical structures</li>
<li>Religious/cultural significance</li>
<li>2026 architecture trends</li>
<li>Regional observatory intelligence</li>
</ul>

</div>

<div style={panel}>

<h2>Subscription Access</h2>

<div style={tier}>
<h3>Normal — $35</h3>
<p>5 daily observatory scans</p>
</div>

<div style={tier}>
<h3>Premium — $50</h3>
<p>20 daily scans</p>
</div>

<div style={tier}>
<h3>Pro — $100</h3>
<p>Unlimited observatory access</p>
</div>

<button style={walletBtn}>
Connect Wallet To Unlock
</button>

</div>

</div>

</main>
)
}

const page={
background:"#020617",
minHeight:"100vh",
padding:20,
color:"white",
fontFamily:"Arial"
}

const hero={
padding:28,
borderRadius:24,
background:"linear-gradient(135deg,#111827,#020617)",
border:"1px solid #7c3aed"
}

const swipeRow={
display:"flex",
gap:14,
overflowX:"auto",
marginTop:20,
paddingBottom:10
}

const categoryCard={
minWidth:260,
background:"#111827",
borderRadius:18,
padding:16,
position:"relative",
overflow:"hidden"
}

const miniGlow={
position:"absolute",
width:160,
height:160,
borderRadius:"50%",
background:"radial-gradient(circle,#7c3aed,transparent)",
right:-40,
top:-40,
opacity:.45
}

const viewer={
height:"72vh",
marginTop:20,
borderRadius:24,
overflow:"hidden",
position:"relative",
border:"1px solid #334155"
}

const overlay={
position:"absolute",
left:20,
bottom:20,
background:"rgba(0,0,0,.45)",
padding:18,
borderRadius:18,
maxWidth:420
}

const grid={
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",
gap:18,
marginTop:20
}

const panel={
padding:20,
borderRadius:20,
background:"#111827",
border:"1px solid #334155"
}

const tier={
padding:16,
borderRadius:16,
background:"#020617",
marginTop:12
}

const walletBtn={
width:"100%",
padding:18,
marginTop:20,
borderRadius:18,
background:"#7c3aed",
border:0,
color:"white",
fontWeight:"bold",
fontSize:16
}
