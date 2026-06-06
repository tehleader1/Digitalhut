"use client"

import { TOUR_MODES } from "../lib/domain/tourState"

const modes = [
  { label: "Manual", value: TOUR_MODES.MANUAL },
  { label: "Guided", value: TOUR_MODES.GUIDED },
  { label: "Ambient", value: TOUR_MODES.AMBIENT },
  { label: "Research", value: TOUR_MODES.RESEARCHER },
  { label: "Family", value: TOUR_MODES.FAMILY },
  { label: "Real Estate", value: TOUR_MODES.REAL_ESTATE },
  { label: "Developer", value: TOUR_MODES.DEVELOPER }
]

export default function UserModeSwitcher({ mode, onChange }) {
  return (
    <div style={styles.wrap}>
      {modes.map((item) => (
        <button
          key={item.value}
          style={mode === item.value ? styles.active : styles.button}
          onClick={() => onChange?.(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

const buttonBase = { borderRadius: 8, padding: "8px 10px", cursor: "pointer", fontWeight: 900, fontSize: 12 }
const styles = {
  wrap: { display: "flex", gap: 8, flexWrap: "wrap" },
  button: { ...buttonBase, border: "1px solid rgba(148,163,184,.25)", background: "rgba(15,23,42,.72)", color: "white" },
  active: { ...buttonBase, border: "1px solid rgba(45,212,191,.65)", background: "rgba(20,184,166,.22)", color: "#ccfbf1" }
}
