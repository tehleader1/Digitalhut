import React,{useRef,useState,useEffect}
from "react"

import {startComposite}
from "./cgi/videoCompositor"

export default function CGIVideoTool(){

  const [src,setSrc]=useState(null)

  const videoRef=useRef(null)

  const canvasRef=useRef(null)

  useEffect(()=>{

    if(
      src &&
      videoRef.current &&
      canvasRef.current
    ){

      const v=videoRef.current

      v.onplay=()=>{

        startComposite(
          v,
          canvasRef.current
        )
      }
    }

  },[src])

  function upload(e){

    const file=e.target.files[0]

    if(!file)return

    setSrc(
      URL.createObjectURL(file)
    )
  }

  return (
    <main style={{
      minHeight:"100vh",
      background:"#020617",
      color:"white",
      padding:20,
      fontFamily:"Arial"
    }}>

      <h1>
        DigitalHut CGI Composer
      </h1>

      <input
        type="file"
        accept="video/*"
        onChange={upload}
      />

      {src && (

        <div style={{
          position:"relative",
          marginTop:20
        }}>

          <video
            ref={videoRef}
            src={src}
            controls
            style={{
              width:"100%",
              borderRadius:18
            }}
          />

          <canvas
            ref={canvasRef}
            width={1280}
            height={720}
            style={{
              position:"absolute",
              inset:0,
              width:"100%",
              height:"100%",
              pointerEvents:"none",
              borderRadius:18
            }}
          />

        </div>
      )}

    </main>
  )
}
