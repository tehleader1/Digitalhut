"use client"

export default function Home(){

return (

<div style={{
background:"#020617",
minHeight:"100vh",
color:"white",
fontFamily:"Arial",
padding:"20px"
}}>

<h1 style={{
fontSize:"58px",
lineHeight:".9",
marginBottom:"20px"
}}>
DigitalHut Observatory
</h1>

<p style={{
fontSize:"20px",
lineHeight:"1.6",
color:"#cbd5e1",
marginBottom:"30px"
}}>
Live immersive observatory runtime.
</p>

<div style={{
borderRadius:"28px",
overflow:"hidden",
background:"#000",
marginBottom:"30px"
}}>

<iframe
src="https://sketchfab.com/models/2d9f810a6dbd4e7db24f0a2f4e2e9b6d/embed"
style={{
width:"100%",
height:"55vh",
border:"0"
}}
allow="autoplay; fullscreen; xr-spatial-tracking"
allowFullScreen
/>

</div>

<div style={{
display:"grid",
gap:"20px"
}}>

{[
"planetary terrain",
"historic architecture",
"space environments",
"industrial worlds"
].map(x=>

<div
key={x}
style={{
background:"#0f172a",
padding:"24px",
borderRadius:"24px",
fontSize:"28px",
fontWeight:"900",
border:"1px solid #334155"
}}
>
{x}
</div>

)}

</div>

</div>

)

}
