import React,{
  useEffect,
  useState
} from "react"

import { ConnectButton }
from "@rainbow-me/rainbowkit"

import { useAccount }
from "wagmi"

const tiers = [

  {
    name:"Free",
    level:"free",
    price:"$0"
  },

  {
    name:"Premium",
    level:"premium",
    price:"$50"
  },

  {
    name:"Pro",
    level:"pro",
    price:"$100"
  }

]

export default function PremiumWalletGate(){

  const {
    address,
    isConnected
  } = useAccount()

  const [user,setUser] =
    useState(null)

  const [status,setStatus] =
    useState("Waiting")

  async function connectWallet(){

    if(!address) return

    const res =
      await fetch(
        "http://localhost:8787/api/connect-wallet",
        {
          method:"POST",
          headers:{
            "Content-Type":
              "application/json"
          },
          body:JSON.stringify({
            wallet:address
          })
        }
      )

    const json =
      await res.json()

    setUser(json)

    setStatus(
      "Observatory passport active."
    )

  }

  async function activateTier(tier){

    if(!address){

      setStatus(
        "Connect wallet first."
      )

      return

    }

    const res =
      await fetch(
        "http://localhost:8787/api/set-tier",
        {
          method:"POST",
          headers:{
            "Content-Type":
              "application/json"
          },
          body:JSON.stringify({
            wallet:address,
            tier:tier.level
          })
        }
      )

    const json =
      await res.json()

    setUser(json.user)

    setStatus(
      `${tier.name} observatory unlocked.`
    )

  }

  useEffect(()=>{

    if(isConnected){

      connectWallet()

    }

  },[isConnected,address])

  return(

    <section
      style={{
        margin:"20px",
        padding:"28px",
        borderRadius:"28px",
        background:
          "linear-gradient(180deg,#111827,#050816)",
        border:"1px solid #7c3aed",
        color:"white"
      }}
    >

      <div
        style={{
          color:"#a855f7",
          fontWeight:"900",
          letterSpacing:"2px"
        }}
      >
        OBSERVATORY PASSPORT
      </div>

      <h2>
        Premium Observatory Access
      </h2>

      <ConnectButton />

      <div
        style={{
          marginTop:"20px",
          background:"#0b1020",
          border:"1px solid #26334f",
          borderRadius:"20px",
          padding:"18px"
        }}
      >

        <div>
          Wallet:
          {" "}
          {address || "Not Connected"}
        </div>

        <div>
          Tier:
          {" "}
          {user?.tier || "free"}
        </div>

        <div>
          Status:
          {" "}
          {status}
        </div>

      </div>

      <div
        style={{
          display:"grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
          gap:"14px",
          marginTop:"20px"
        }}
      >

        {tiers.map((tier)=>(

          <div
            key={tier.level}
            style={{
              background:"#0b1020",
              border:
                user?.tier===tier.level
                  ? "1px solid #22c55e"
                  : "1px solid #26334f",
              borderRadius:"20px",
              padding:"20px"
            }}
          >

            <div
              style={{
                color:"#00e5ff",
                fontWeight:"900"
              }}
            >
              {tier.name}
            </div>

            <div
              style={{
                fontSize:"42px",
                fontWeight:"900",
                marginTop:"10px"
              }}
            >
              {tier.price}
            </div>

            <button
              onClick={()=>
                activateTier(tier)
              }
              style={{
                width:"100%",
                marginTop:"16px",
                background:"#7c3aed",
                border:"none",
                borderRadius:"14px",
                padding:"14px",
                color:"white",
                fontWeight:"900"
              }}
            >
              Activate {tier.name}
            </button>

          </div>

        ))}

      </div>

    </section>

  )

}
