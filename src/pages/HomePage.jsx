import React from "react"

import {
  ConnectButton
} from "../wallet"

import PWAInstall
from "../components/PWAInstall"

export default function HomePage(){

  return(

    <main
      style={{
        background:"#050816",
        minHeight:"100vh",
        color:"white",
        fontFamily:"Arial,sans-serif"
      }}
    >

      <section
        style={{
          position:"relative",
          minHeight:"100vh",
          display:"flex",
          alignItems:"center",
          justifyContent:"center",
          textAlign:"center",
          padding:"40px"
        }}
      >

        <img
          src="https://upload.wikimedia.org/wikipedia/commons/6/6d/Griffith_Observatory_%2811851997813%29.jpg"
          style={{
            position:"absolute",
            inset:0,
            width:"100%",
            height:"100%",
            objectFit:"cover",
            filter:"brightness(0.35)"
          }}
        />

        <div
          style={{
            position:"absolute",
            inset:0,
            background:
              "linear-gradient(180deg,rgba(5,8,22,0.2),rgba(5,8,22,0.95))"
          }}
        />

        <div
          style={{
            position:"relative",
            zIndex:2,
            maxWidth:"900px"
          }}
        >

          <div
            style={{
              color:"#00e5ff",
              fontWeight:"900",
              letterSpacing:"4px"
            }}
          >
            DIGITALHUT OBSERVATORY
          </div>

          <h1
            style={{
              fontSize:"clamp(42px,8vw,90px)"
            }}
          >
            Planetary Observatory Intelligence
          </h1>

          <p
            style={{
              color:"#cbd5e1",
              lineHeight:1.8,
              fontSize:"18px"
            }}
          >
            Persistent observatory discovery,
            evolving planetary environments,
            environmental intelligence,
            AI-assisted exploration,
            and observatory archive systems.
          </p>

          <div
            style={{
              marginTop:"30px",
              display:"flex",
              gap:"16px",
              justifyContent:"center",
              flexWrap:"wrap"
            }}
          >

            <a
              href="/scanner"
              style={btn}
            >
              Open Observatory
            </a>

            <a
              href="/library"
              style={btn}
            >
              Observatory Library
            </a>

          </div>

          <div
            style={{
              marginTop:"28px",
              display:"flex",
              justifyContent:"center"
            }}
          >

            <ConnectButton />

          </div>

          <div
            style={{
              marginTop:"30px"
            }}
          >

            <PWAInstall />

          </div>

          <div
            style={{
              marginTop:"28px",
              color:"#22c55e",
              fontWeight:"900"
            }}
          >
            Observatory operator client ready for installation.
          </div>

        </div>

      </section>

    </main>

  )

}

const btn = {

  background:"#7c3aed",

  padding:"18px 28px",

  borderRadius:"16px",

  color:"white",

  textDecoration:"none",

  fontWeight:"900"

}
