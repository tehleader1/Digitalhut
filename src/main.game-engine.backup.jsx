import React from "react"
import {createRoot} from "react-dom/client"

import GameApp from "./game/GameApp"
import CGIVideoTool from "./tools/CGIVideoTool"

function Home(){

  return (
    <main style={{
      minHeight:"100vh",
      background:"#020617",
      color:"white",
      padding:24,
      fontFamily:"Arial"
    }}>

      <h1>DigitalHut.app</h1>

      <button
        onClick={()=>location.href="/?game=play"}
        style={btn}
      >
        Launch Campaign
      </button>

      <button
        onClick={()=>location.href="/?cgi=1"}
        style={btn}
      >
        CGI Video Studio
      </button>

    </main>
  )
}

const params =
  new URLSearchParams(location.search)

createRoot(
  document.getElementById("root")
).render(

  params.get("cgi")
    ? <CGIVideoTool/>

    : params.get("game")
      ? <GameApp/>

      : <Home/>
)

const btn={
  width:"100%",
  padding:18,
  marginTop:14,
  border:0,
  borderRadius:14,
  background:"#7c3aed",
  color:"white",
  fontWeight:"bold"
}
