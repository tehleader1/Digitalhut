"use client"

import { canUseFeature, getUpgradeMessage } from "../lib/domain/subscriptionGate"

export default function QuickActionRail({ activeFeed, subscription, onAction, onNudge }) {
  function handleAction(action, feature) {
    if (feature && !canUseFeature(subscription, feature)) {
      onNudge?.({
        title: "Upgrade required",
        message: getUpgradeMessage(feature),
        actionLabel: "View plans",
        action: "open-wallet"
      })
      return
    }

    onAction?.(action, activeFeed)
  }

  return (
    <div style={styles.wrap}>
      <button style={styles.action} onClick={() => handleAction("save", "saveDiscovery")}>Save</button>
      <button style={styles.action} onClick={() => handleAction("share")}>Share</button>
      <button style={styles.action} onClick={() => handleAction("embed")}>Embed</button>
      <button style={styles.action} onClick={() => handleAction("download", "downloadModel")}>Download</button>
      <button style={styles.action} onClick={() => handleAction("comment")}>Comment</button>
      <button style={styles.action} onClick={() => handleAction("related")}>Related</button>
      <button style={styles.pro} onClick={() => handleAction("edit-glb", "glbEditing")}>Edit GLB</button>
    </div>
  )
}

const styles = {
  wrap: { display: "flex", gap: 8, flexWrap: "wrap", padding: "12px 0" },
  action: { border: "1px solid rgba(148,163,184,.28)", background: "rgba(15,23,42,.75)", color: "white", borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontWeight: 800 },
  pro: { border: "1px solid rgba(250,204,21,.45)", background: "rgba(250,204,21,.12)", color: "#fde68a", borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontWeight: 900 }
}
