import React,{useEffect,useRef} from "react"

import {bootEngine} from "./engine"

export default function GameApp(){

  const ref=useRef(null)

  useEffect(()=>{

    if(ref.current){

      bootEngine(ref.current)
    }

  },[])

  return (
    <canvas
      ref={ref}
      style={{
        width:"100vw",
        height:"100vh",
        display:"block",
        background:"#020617"
      }}
    />
  )
}
