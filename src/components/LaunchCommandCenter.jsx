import React, { useEffect, useState } from "react"

export default function LaunchCommandCenter() {
  const [health, setHealth] = useState(null)
  const [capsule, setCapsule] = useState(null)

  async function loadChecks() {
    try {
      const h = await fetch("http://localhost:8787/api/health").then(r => r.json())
      const c = await fetch("http://localhost:8787/api/time-capsule").then(r => r.json())
      setHealth(h)
      setCapsule(c)
    } catch {
      setHealth(null)
      setCapsule(null)
    }
  }

  useEffect(() => {
    loadChecks()
    const timer = setInterval(loadChecks, 1000)
    return () => clearInterval(timer)
  }, [])

  const ok = health && capsule

  return (
    <section style={{
      margin: "20px",
      padding: "24px",
      borderRadius: "24px",
      background: "linear-gradient(180deg,#111827,#050816)",
      border: "1px solid #7c3aed",
      color: "white"
    }}>
      <h2>DigitalHut Launch Command Center</h2>
      <p>Real-time frontend, backend, and Time Capsule Observatory math checks.</p>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"12px"}}>
        <div style={card}>
          <b>Frontend Check</b>
          <p style={{color:"#22c55e"}}>ONLINE</p>
        </div>

        <div style={card}>
          <b>Backend Check</b>
          <p style={{color: ok ? "#22c55e" : "#ef4444"}}>
            {health ? "ONLINE" : "OFFLINE"}
          </p>
        </div>

        <div style={card}>
          <b>Math Check</b>
          <p style={{color: capsule ? "#22c55e" : "#ef4444"}}>
            {capsule ? "ACTIVE" : "WAITING"}
          </p>
        </div>
      </div>

      {capsule && (
        <>
          <h3 style={{marginTop:"22px"}}>Time Capsule Launch Countdown</h3>

          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"10px"}}>
            {["days","hours","minutes","seconds"].map(k => (
              <div key={k} style={box}>
                <div style={{fontSize:"30px",fontWeight:"900",color:"#a855f7"}}>
                  {capsule[k]}
                </div>
                <small>{k.toUpperCase()}</small>
              </div>
            ))}
          </div>

          <p style={{marginTop:"18px"}}>
            Observatory Readiness Score: <b>{capsule.readinessScore}/100</b>
          </p>

          <p>Launch Status: {capsule.status}</p>
        </>
      )}
    </section>
  )
}

const card = {
  background:"#0b1020",
  padding:"16px",
  borderRadius:"16px",
  border:"1px solid #26334f"
}

const box = {
  background:"#050816",
  padding:"14px",
  borderRadius:"14px",
  textAlign:"center"
}
