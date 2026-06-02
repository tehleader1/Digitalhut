"use client"

import {useEffect, useState} from "react"

const statusLabel = {
  live: "Live",
  queued: "Queued",
  degraded: "Fallback",
  offline: "Offline"
}

function formatTime(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(undefined, {hour: "numeric", minute: "2-digit"}).format(date)
}

function RunnerCard({runner}) {
  return <article style={{...styles.card, borderLeftColor: styles.statusColors[runner.status] || styles.statusColors.live}}>
    <div style={styles.cardTopline}>
      <span style={styles.domain}>{runner.domain}</span>
      <span style={{...styles.pill, background: styles.statusBackdrops[runner.status] || styles.statusBackdrops.live}}>{statusLabel[runner.status] || runner.status}</span>
    </div>
    <h3 style={styles.cardTitle}>{runner.label}</h3>
    <p style={styles.phase}>{runner.phase.replaceAll("-", " ")}</p>
    <p style={styles.message}>{runner.message}</p>
    {runner.market ? <div style={styles.marketGrid}>
      <Meta label="Symbol" value={runner.market.symbol}/>
      <Meta label="Bias" value={`${runner.market.bias} ${runner.market.confidence}%`}/>
      <Meta label="Volume" value={runner.market.volume}/>
      <Meta label="Levels" value={`${runner.market.support} / ${runner.market.resistance}`}/>
    </div> : null}
    <div style={styles.metaGrid}>
      <Meta label="Source" value={runner.source}/>
      <Meta label="Tier" value={runner.tierGate}/>
      <Meta label="Audit" value={runner.audit}/>
      <Meta label="Next" value={formatTime(runner.nextRun)}/>
    </div>
  </article>
}

function Meta({label, value}) {
  return <div style={styles.metaItem}>
    <span style={styles.metaLabel}>{label}</span>
    <b style={styles.metaValue}>{value}</b>
  </div>
}

export default function RunnerStatusAliveLayer({initialStatus}) {
  const [status, setStatus] = useState(initialStatus)

  useEffect(() => {
    if (initialStatus) return
    let active = true
    async function load() {
      const res = await fetch("/api/runner-status", {cache: "no-store"})
      const json = await res.json()
      if (active) setStatus(json)
    }
    load()
    const timer = setInterval(load, 60000)
    return () => { active = false; clearInterval(timer) }
  }, [initialStatus])

  if (!status) return <section style={styles.layer}><p style={styles.message}>Loading runner status...</p></section>

  const {system, runners} = status

  return <section style={styles.layer} aria-labelledby="runner-status-title">
    <div style={styles.header}>
      <div>
        <p style={styles.eyebrow}>Autonomous runner status</p>
        <h2 id="runner-status-title" style={styles.title}>{system.label}</h2>
      </div>
      <div style={styles.heartbeat}><span style={styles.dot}/><span>{system.status}</span></div>
    </div>

    <div style={styles.summary}>
      <Summary value={system.activeRunners} label="active runners"/>
      <Summary value={formatTime(system.lastHourlyUpdate)} label="last update"/>
      <Summary value={formatTime(system.nextHourlyUpdate)} label="next update"/>
      <Summary value={system.fallbacks} label="fallbacks"/>
    </div>

    <div style={styles.grid}>
      {runners.map((runner) => <RunnerCard key={runner.id} runner={runner}/>) }
    </div>
  </section>
}

function Summary({value, label}) {
  return <div style={styles.summaryCard}><b style={styles.summaryValue}>{value}</b><span style={styles.summaryLabel}>{label}</span></div>
}

const styles = {
  layer: {
    width: "min(100%, 1180px)",
    margin: "0 auto",
    padding: 24,
    color: "#f7fbff",
    background: "#101827",
    border: "1px solid rgba(158,181,209,.24)",
    borderRadius: 8,
    boxSizing: "border-box"
  },
  header: {display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap"},
  eyebrow: {margin: "0 0 6px", color: "#74d7e3", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0},
  title: {margin: 0, fontSize: "clamp(28px,4vw,42px)", lineHeight: 1.05, letterSpacing: 0},
  heartbeat: {display: "inline-flex", alignItems: "center", gap: 8, minHeight: 36, padding: "8px 12px", color: "#d9f9ef", background: "rgba(74,222,128,.12)", border: "1px solid rgba(74,222,128,.35)", borderRadius: 999, fontSize: 13, fontWeight: 900, textTransform: "capitalize"},
  dot: {width: 9, height: 9, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 18px rgba(74,222,128,.7)"},
  summary: {display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10, margin: "22px 0"},
  summaryCard: {minWidth: 0, padding: 12, background: "rgba(255,255,255,.055)", border: "1px solid rgba(158,181,209,.18)", borderRadius: 8},
  summaryValue: {display: "block", marginBottom: 4, fontSize: 19},
  summaryLabel: {color: "#a7b6cc", fontSize: 12},
  grid: {display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 12},
  card: {minWidth: 0, padding: 16, background: "#131f31", border: "1px solid rgba(158,181,209,.2)", borderLeft: "4px solid #74d7e3", borderRadius: 8, boxSizing: "border-box"},
  cardTopline: {display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 10},
  domain: {color: "#74d7e3", fontSize: 11, fontWeight: 900, textTransform: "uppercase"},
  pill: {padding: "5px 9px", borderRadius: 999, fontSize: 11, fontWeight: 900, color: "#f7fbff"},
  cardTitle: {margin: "0 0 6px", fontSize: 18, lineHeight: 1.2},
  phase: {margin: "0 0 10px", color: "#d9f9ef", fontSize: 14, fontWeight: 900, textTransform: "capitalize"},
  message: {margin: "0 0 14px", color: "#d5dfed", fontSize: 14, lineHeight: 1.45},
  marketGrid: {display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 10, marginBottom: 14},
  metaGrid: {display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 10},
  metaItem: {minWidth: 0},
  metaLabel: {display: "block", marginBottom: 3, color: "#a7b6cc", fontSize: 12},
  metaValue: {display: "block", color: "#f7fbff", fontSize: 13, overflowWrap: "anywhere", textTransform: "capitalize"},
  statusColors: {live: "#74d7e3", degraded: "#fbbf24", queued: "#60a5fa", offline: "#f87171"},
  statusBackdrops: {live: "rgba(34,197,94,.16)", degraded: "rgba(251,191,36,.18)", queued: "rgba(96,165,250,.18)", offline: "rgba(248,113,113,.18)"}
}
