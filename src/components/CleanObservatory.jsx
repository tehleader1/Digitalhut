import { useState } from "react"

import LiveGlbViewer from "./LiveGlbViewer"

import {
  getRandomObservatory
} from "../lib/observatoryLibrary"

export default function CleanObservatory(){

  const [region,setRegion] =
    useState("north america")

  const [activeModel,setActiveModel] =
    useState(null)

  function runScanner(){

    const model =
      getRandomObservatory(region)

    console.log(model)

    setActiveModel(model)

  }

  return (

    <main
      style={{
        padding:"24px",
        background:"#020617",
        minHeight:"100vh",
        color:"white"
      }}
    >

      <h1
        style={{
          fontSize:"42px",
          fontWeight:"900"
        }}
      >
        Planetary Observatory Discovery
      </h1>

      <textarea
        value={region}
        onChange={(e)=>
          setRegion(e.target.value)
        }
        style={{
          width:"100%",
          marginTop:"20px",
          minHeight:"120px",
          background:"#020617",
          color:"white",
          border:"1px solid #26334f",
          borderRadius:"18px",
          padding:"18px"
        }}
      />

      <button
        onClick={runScanner}
        style={{
          width:"100%",
          marginTop:"20px",
          background:"#7c3aed",
          color:"white",
          border:"none",
          borderRadius:"18px",
          padding:"18px",
          fontWeight:"900",
          fontSize:"18px"
        }}
      >
        Run Observatory Signal
      </button>

      <div
        style={{
          marginTop:"28px"
        }}
      >
        <LiveGlbViewer model={activeModel} />
      </div>

    </main>

  )

}
