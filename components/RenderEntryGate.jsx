"use client"

import { useMemo, useState } from "react"

const categories = ["Continent", "Planetary", "Structure", "Animated Character", "Animated Environment"]

function categoryForFeed(feed = {}) {
  const text = `${feed.title || ""} ${feed.query || ""} ${feed.category || ""}`.toLowerCase()
  if (/mars|moon|planet|space|lunar|solar|terrain/.test(text)) return "Planetary"
  if (/character|avatar|person|human|animated/.test(text)) return "Animated Character"
  if (/environment|forest|room|scene|world|landscape|garden/.test(text)) return "Animated Environment"
  if (/building|house|tower|street|bridge|city|structure|wall|architecture/.test(text)) return "Structure"
  return "Continent"
}

export default function RenderEntryGate({ feeds = [], activeFeed, mode, username, loading, onMode, onUsername, onSelectFeed, onLoad }) {
  const [category, setCategory] = useState("Structure")
  const [visibleCount, setVisibleCount] = useState(4)
  const taggedFeeds = useMemo(() => feeds.map((feed) => ({ ...feed, gateCategory: feed.tourCategory || categoryForFeed(feed) })), [feeds])
  const categoryFeeds = taggedFeeds.filter((feed) => feed.gateCategory === category)
  const shownFeeds = (categoryFeeds.length ? categoryFeeds : taggedFeeds).slice(0, visibleCount)
  const previewTitle = activeFeed?.title || "DigitalHut Observatory"

  function selectCategory(nextCategory) {
    setCategory(nextCategory)
    setVisibleCount(4)
  }

  return <main style={styles.page}>
    <style>{`@keyframes dhOrbit{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}@keyframes dhPulse{0%,100%{opacity:.55;transform:scale(.96)}50%{opacity:1;transform:scale(1.04)}}@keyframes dhLine{0%{transform:translateX(-70%);opacity:.3}55%{opacity:1}100%{transform:translateX(170%);opacity:.25}}@keyframes dhFade{from{opacity:0}to{opacity:1}}`}</style>
    {loading && <div style={styles.loadingOverlay}>
      <div style={styles.loadingPanel}>
        <div style={styles.logo}>DigitalHut</div>
        <div style={styles.loadingLine}><span style={styles.loadingLineFill} /></div>
        <p style={styles.loadingText}>Loading render system</p>
      </div>
    </div>}

    <section style={styles.shell}>
      <div style={styles.previewPane}>
        <div style={styles.motionPreview} aria-label="Live motion preview">
          <div style={styles.orbitRing} />
          <div style={styles.innerOrbit} />
          <div style={styles.previewCore}>{String(previewTitle).slice(0, 2).toUpperCase()}</div>
          <div style={styles.gridPlane} />
        </div>
        <div style={styles.previewCopy}>
          <p style={styles.eyebrow}>Live motion preview</p>
          <h1 style={styles.title}>{previewTitle}</h1>
          <p style={styles.copy}>The full renderer starts after an active account or guest entry. Until then, DigitalHut keeps a motion preview and related options ready.</p>
        </div>
      </div>

      <aside style={styles.entryPanel}>
        <p style={styles.eyebrow}>Username Account</p>
        <input value={username} onChange={(event) => onUsername(event.target.value)} placeholder="Enter name or continue as guest" style={styles.input} />
        <h2 style={styles.welcome}>Welcome{username ? `, ${username}` : ""}</h2>
        <div style={styles.modeGrid}>
          {["Manual", "Guided Tour", "Ambient"].map((nextMode) => <button key={nextMode} type="button" onClick={() => onMode(nextMode)} style={mode === nextMode ? styles.activeMode : styles.modeButton}>{nextMode}</button>)}
        </div>
        <button type="button" onClick={onLoad} style={styles.loadButton}>Load Render</button>
        <p style={styles.small}>Mode: {mode}. The renderer opens with guided slider, selectable layers, orbit controls, compass, grid coordinates, and premium GLB download when eligible.</p>
      </aside>

      <section style={styles.cardsPanel}>
        <div style={styles.categoryTabs}>
          {categories.map((nextCategory) => <button key={nextCategory} type="button" onClick={() => selectCategory(nextCategory)} style={category === nextCategory ? styles.activeTab : styles.tab}>{nextCategory}</button>)}
        </div>
        <div style={styles.cardsGrid}>
          {shownFeeds.map((feed) => <button key={`${feed.id}:${feed.gateCategory}`} type="button" onPointerEnter={() => onSelectFeed(feed)} onFocus={() => onSelectFeed(feed)} onClick={() => onSelectFeed(feed)} style={activeFeed?.id === feed.id ? styles.activeCard : styles.card}>
            <span>{feed.gateCategory}</span>
            <b>{feed.title}</b>
            <small>{feed.query}</small>
          </button>)}
        </div>
        <button type="button" onClick={() => setVisibleCount((count) => count + 4)} style={styles.moreButton}>Load 4 More</button>
      </section>
    </section>
  </main>
}

const styles = {
  page: { minHeight: "100dvh", height: "100dvh", overflow: "hidden", background: "radial-gradient(circle at 20% 12%,rgba(229,9,20,.22),transparent 28%),linear-gradient(135deg,#030303,#05070d 48%,#101827)", color: "white", fontFamily: "Arial, sans-serif", padding: 12, boxSizing: "border-box" },
  shell: { height: "100%", maxWidth: 1480, margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(300px,.36fr)", gridTemplateRows: "minmax(0,1fr) auto", gap: 12, overflow: "hidden" },
  previewPane: { minHeight: 0, position: "relative", gridRow: "1 / span 2", border: "1px solid rgba(255,255,255,.12)", borderRadius: 8, overflow: "hidden", background: "linear-gradient(145deg,rgba(2,6,23,.72),rgba(15,23,42,.5))" },
  motionPreview: { position: "absolute", inset: 0, display: "grid", placeItems: "center", overflow: "hidden" },
  orbitRing: { width: "min(62vw,720px)", aspectRatio: "1", borderRadius: "50%", border: "1px solid rgba(103,232,249,.3)", boxShadow: "0 0 90px rgba(103,232,249,.14)", animation: "dhOrbit 18s linear infinite" },
  innerOrbit: { position: "absolute", width: "min(38vw,420px)", aspectRatio: "1", borderRadius: "50%", border: "2px solid rgba(229,9,20,.62)", animation: "dhOrbit 9s linear infinite reverse" },
  previewCore: { position: "absolute", width: 112, height: 112, borderRadius: 8, background: "rgba(2,6,23,.74)", border: "1px solid rgba(255,255,255,.2)", display: "grid", placeItems: "center", fontSize: 42, fontWeight: 900, animation: "dhPulse 3.4s ease-in-out infinite" },
  gridPlane: { position: "absolute", left: "-16%", right: "-16%", bottom: "-9%", height: "46%", backgroundImage: "linear-gradient(rgba(103,232,249,.14) 1px, transparent 1px), linear-gradient(90deg, rgba(103,232,249,.14) 1px, transparent 1px)", backgroundSize: "42px 28px", transform: "perspective(460px) rotateX(62deg)", transformOrigin: "50% 100%" },
  previewCopy: { position: "absolute", left: 20, bottom: 20, right: 20, maxWidth: 760 },
  eyebrow: { margin: 0, color: "#67e8f9", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0 },
  title: { margin: "8px 0 10px", fontSize: "clamp(38px,7vw,78px)", lineHeight: .96, letterSpacing: 0, overflowWrap: "anywhere" },
  copy: { margin: 0, color: "#dbeafe", fontSize: 17, lineHeight: 1.45, maxWidth: 720 },
  entryPanel: { minWidth: 0, border: "1px solid rgba(255,255,255,.12)", borderRadius: 8, background: "rgba(2,6,23,.72)", padding: 16, display: "grid", gap: 11, alignContent: "start" },
  input: { width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,.18)", background: "rgba(0,0,0,.46)", color: "white", fontSize: 15 },
  welcome: { margin: 0, fontSize: 26, lineHeight: 1.1, letterSpacing: 0 },
  modeGrid: { display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 8 },
  modeButton: { minHeight: 46, borderRadius: 8, border: "1px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.06)", color: "white", fontWeight: 900, cursor: "pointer" },
  activeMode: { minHeight: 46, borderRadius: 8, border: "1px solid rgba(229,9,20,.72)", background: "rgba(229,9,20,.22)", color: "white", fontWeight: 900, cursor: "pointer" },
  loadButton: { minHeight: 50, border: 0, borderRadius: 8, background: "#e50914", color: "white", fontWeight: 900, cursor: "pointer" },
  small: { margin: 0, color: "#9fb3c8", fontSize: 13, lineHeight: 1.42 },
  cardsPanel: { minHeight: 0, border: "1px solid rgba(255,255,255,.12)", borderRadius: 8, background: "rgba(2,6,23,.62)", padding: 12, display: "grid", gridTemplateRows: "auto minmax(0,1fr) auto", gap: 10, overflow: "hidden" },
  categoryTabs: { display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 7 },
  tab: { minHeight: 34, borderRadius: 8, border: "1px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.06)", color: "white", fontSize: 11, fontWeight: 900, cursor: "pointer" },
  activeTab: { minHeight: 34, borderRadius: 8, border: "1px solid rgba(103,232,249,.44)", background: "rgba(103,232,249,.13)", color: "white", fontSize: 11, fontWeight: 900, cursor: "pointer" },
  cardsGrid: { minHeight: 0, overflow: "auto", display: "grid", gap: 8, alignContent: "start" },
  card: { textAlign: "left", borderRadius: 8, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.06)", color: "white", padding: 10, display: "grid", gap: 4, cursor: "pointer" },
  activeCard: { textAlign: "left", borderRadius: 8, border: "1px solid rgba(103,232,249,.46)", background: "rgba(103,232,249,.14)", color: "white", padding: 10, display: "grid", gap: 4, cursor: "pointer" },
  moreButton: { padding: "11px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,.16)", background: "rgba(255,255,255,.08)", color: "white", fontWeight: 900, cursor: "pointer" },
  loadingOverlay: { position: "fixed", inset: 0, zIndex: 9999, display: "grid", placeItems: "center", background: "rgba(0,0,0,.82)", backdropFilter: "blur(10px)", animation: "dhFade .18s ease-out" },
  loadingPanel: { width: "min(460px,86vw)", display: "grid", gap: 15, justifyItems: "center", textAlign: "center", padding: 26 },
  logo: { fontSize: "clamp(34px,7vw,62px)", fontWeight: 900, lineHeight: 1 },
  loadingLine: { width: "min(320px,70vw)", height: 3, borderRadius: 999, background: "rgba(255,255,255,.12)", overflow: "hidden" },
  loadingLineFill: { display: "block", width: "42%", height: "100%", borderRadius: 999, background: "#e50914", animation: "dhLine 1.25s ease-in-out infinite" },
  loadingText: { margin: 0, color: "#f8fafc", fontSize: 16, fontWeight: 900 }
}
