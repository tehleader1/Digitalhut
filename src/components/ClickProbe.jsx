import { useState } from "react"

export default function ClickProbe() {
  const [count, setCount] = useState(0)

  return (
    <button
      onClick={() => setCount(count + 1)}
      style={{
        position: "fixed",
        right: "12px",
        bottom: "96px",
        zIndex: 99999,
        padding: "12px 14px",
        borderRadius: "999px",
        border: "1px solid rgba(103,232,249,.65)",
        background: "rgba(15,23,42,.95)",
        color: "#67e8f9",
        fontWeight: 900
      }}
    >
      Click Test {count}
    </button>
  )
}
