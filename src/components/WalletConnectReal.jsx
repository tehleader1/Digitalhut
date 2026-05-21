import React from "react"

export default function WalletConnectReal(){

  const wallets = [
    "MetaMask",
    "WalletConnect",
    "Coinbase",
    "Rainbow"
  ]

  return(

    <section
      style={{
        margin:"20px",
        padding:"24px",
        borderRadius:"24px",
        background:
          "linear-gradient(180deg,#111827,#050816)",
        border:"1px solid #7c3aed",
        color:"white"
      }}
    >

      <h2>
        Observatory Wallet Access
      </h2>

      <p
        style={{
          color:"#94a3b8"
        }}
      >
        Connect wallet to unlock
        subscriptions,
        observatory uploads,
        premium scans,
        and discover mode.
      </p>

      <div
        style={{
          display:"grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(180px,1fr))",
          gap:"14px",
          marginTop:"20px"
        }}
      >

        {wallets.map((wallet)=>(

          <button
            key={wallet}
            style={{
              background:"#7c3aed",
              border:"none",
              borderRadius:"16px",
              padding:"16px",
              color:"white",
              fontWeight:"900",
              cursor:"pointer"
            }}
          >
            Connect {wallet}
          </button>

        ))}

      </div>

    </section>

  )

}
