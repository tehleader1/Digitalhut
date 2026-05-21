import React from "react"

export default function UpdatesPage(){

  return(

    <main style={{
      background:"#050816",
      minHeight:"100vh",
      color:"white",
      padding:"20px",
      fontFamily:"Arial,sans-serif"
    }}>

      <h1>
        Observatory Updates
      </h1>

      <p style={{
        color:"#94a3b8"
      }}>
        Receive SMS updates for:
        latest observatory signals,
        new environmental maps,
        premium observatory releases,
        and scientific discovery updates.
      </p>

      <input
        placeholder="Phone Number"
        style={{
          width:"100%",
          marginTop:"20px",
          padding:"16px",
          borderRadius:"14px",
          background:"#0b1020",
          border:"1px solid #26334f",
          color:"white"
        }}
      />

      <button style={{
        marginTop:"20px",
        width:"100%",
        padding:"18px",
        borderRadius:"14px",
        background:"#7c3aed",
        color:"white",
        border:"none",
        fontWeight:"900"
      }}>
        Join Observatory Updates
      </button>

    </main>

  )

}
