import React, { useEffect, useState } from "react"

const launchDate = new Date("2026-05-30T12:00:00")

export default function LaunchCountdown() {
  const [timeLeft, setTimeLeft] = useState({})

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const diff = launchDate - now

      setTimeLeft({
        days: Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24))),
        hours: Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24)),
        minutes: Math.max(0, Math.floor((diff / 1000 / 60) % 60)),
        seconds: Math.max(0, Math.floor((diff / 1000) % 60)),
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <section style={{
      padding: "28px",
      borderRadius: "24px",
      background: "linear-gradient(180deg,#10182f,#050816)",
      color: "white",
      border: "1px solid #26334f",
      margin: "20px"
    }}>
      <h1>DigitalHut AI Observatory Launch</h1>
      <p>Subscriptions, NFT ads, AI observatory scans, and creator GLB marketplace coming live.</p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        gap: "12px",
        marginTop: "20px"
      }}>
        {["days","hours","minutes","seconds"].map((k) => (
          <div key={k} style={{
            background: "#050816",
            padding: "18px",
            borderRadius: "18px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "34px", fontWeight: "900", color: "#00e5ff" }}>
              {timeLeft[k] ?? 0}
            </div>
            <div>{k.toUpperCase()}</div>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: "28px" }}>Launch Subscriptions</h2>
      <p>Normal — $35/month • Premium — $50/month • Pro — $100/month</p>

      <h2>Decentralized Ad Slots</h2>
      <p>Sponsored observatory scan points, featured GLB listings, homepage launch ads, and NFT sponsor badges.</p>

      <button style={{
        marginTop: "20px",
        padding: "14px 18px",
        borderRadius: "14px",
        border: "none",
        background: "#00e5ff",
        color: "black",
        fontWeight: "900"
      }}>
        Join Launch Waitlist
      </button>
    </section>
  )
}
