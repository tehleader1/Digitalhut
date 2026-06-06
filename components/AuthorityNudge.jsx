"use client"

export default function AuthorityNudge({ nudge, onAction, onClose }) {
  if (!nudge) return null

  return (
    <div style={styles.wrap}>
      <button style={styles.close} onClick={onClose}>x</button>
      <b>{nudge.title}</b>
      <p style={styles.copy}>{nudge.message}</p>
      <button style={styles.button} onClick={() => onAction?.(nudge.action)}>{nudge.actionLabel || "Continue"}</button>
    </div>
  )
}

const styles = {
  wrap: {
    position: "fixed",
    right: 16,
    bottom: 16,
    zIndex: 1000,
    maxWidth: 360,
    padding: 16,
    borderRadius: 8,
    background: "rgba(15,23,42,.96)",
    border: "1px solid rgba(103,232,249,.28)",
    color: "white",
    boxShadow: "0 20px 60px rgba(0,0,0,.35)"
  },
  close: { position: "absolute", top: 8, right: 10, background: "transparent", color: "white", border: 0, fontSize: 20, cursor: "pointer" },
  copy: { color: "#dbeafe", lineHeight: 1.45, paddingRight: 12 },
  button: { marginTop: 8, border: 0, background: "#22d3ee", color: "#082f49", borderRadius: 8, padding: "9px 12px", fontWeight: 900, cursor: "pointer" }
}
