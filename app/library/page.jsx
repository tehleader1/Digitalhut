const cats=["Terrain","Planetary","Geographical","Structures","Infrastructure","Maps"]
export default function Library(){
 return <main style={{padding:24}}>
  <a href="/" style={{color:"#8b5cf6"}}>← Home</a>
  <h1>Observatory Library</h1>
  <p>Sketchfab-powered category routing for GLB discovery.</p>
  <div style={{display:"grid",gap:16}}>
   {cats.map(c=><div key={c} style={{padding:24,border:"1px solid #334155",borderRadius:20,background:"#0f172a"}}>
    <h2>{c}</h2><p>{c} observatory signals, GLB history, maps, terrain, and tiered downloads.</p>
   </div>)}
  </div>
 </main>
}
