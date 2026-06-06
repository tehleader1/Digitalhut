"use client"

export default function GuidedTourControls({
  tourState,
  onPause,
  onResume,
  onRewind,
  onForward,
  onScrub,
  onManual,
  onSwitchTour
}) {
  const progress = tourState?.progressSeconds || 0
  const total = tourState?.totalSeconds || 60

  return (
    <div style={styles.wrap}>
      <div style={styles.row}>
        {tourState?.paused ? (
          <button style={styles.primary} onClick={onResume}>Resume</button>
        ) : (
          <button style={styles.button} onClick={onPause}>Pause</button>
        )}
        <button style={styles.button} onClick={onRewind}>Back 10s</button>
        <button style={styles.button} onClick={onForward}>Forward 10s</button>
        <button style={styles.button} onClick={onSwitchTour}>Switch Tour</button>
        <button style={styles.button} onClick={onManual}>Manual Mode</button>
      </div>

      <input
        style={styles.slider}
        type="range"
        min="0"
        max={total}
        value={progress}
        onChange={(event) => onScrub?.(Number(event.target.value))}
      />

      <div style={styles.meta}>
        <span>{formatTime(progress)}</span>
        <span>{tourState?.mode || "manual"}</span>
        <span>{formatTime(total)}</span>
      </div>

      {tourState?.resumePromptVisible && (
        <div style={styles.prompt}>
          <b>Tour paused while you explore.</b>
          <span>Resume, continue manually, or switch tours anytime.</span>
        </div>
      )}
    </div>
  )
}

function formatTime(seconds) {
  const safe = Math.max(0, Math.floor(seconds || 0))
  const minutes = Math.floor(safe / 60)
  const rest = safe % 60
  return `${minutes}:${String(rest).padStart(2, "0")}`
}

const styles = {
  wrap: { padding: 14, borderRadius: 8, border: "1px solid rgba(148,163,184,.25)", background: "rgba(2,6,23,.7)", color: "white" },
  row: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" },
  button: { border: "1px solid rgba(148,163,184,.3)", background: "rgba(15,23,42,.9)", color: "white", borderRadius: 8, padding: "9px 12px", cursor: "pointer", fontWeight: 800 },
  primary: { border: "1px solid rgba(45,212,191,.55)", background: "rgba(20,184,166,.2)", color: "white", borderRadius: 8, padding: "9px 12px", cursor: "pointer", fontWeight: 900 },
  slider: { width: "100%", marginTop: 12 },
  meta: { display: "flex", justifyContent: "space-between", color: "#94a3b8", fontSize: 12 },
  prompt: { display: "grid", gap: 4, marginTop: 10, color: "#cbd5e1", fontSize: 13 }
}
