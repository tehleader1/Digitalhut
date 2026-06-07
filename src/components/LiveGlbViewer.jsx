export default function LiveGlbViewer({ model }) {
  const modelUrl =
    typeof model === "string"
      ? model
      : model?.url || model?.model || model?.src || model?.glb || ""

  if (!modelUrl) {
    return (
      <div style={{
        width: "100%",
        height: "72vh",
        minHeight: "640px",
        background: "#000",
        borderRadius: "28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#94a3b8",
        boxShadow: "0 0 40px rgba(0,0,0,.45)"
      }}>
        No Observatory Signal Loaded
      </div>
    )
  }

  return (
    <iframe
      src={`/viewer.html?model=${encodeURIComponent(modelUrl)}`}
      style={{
        width: "100%",
        height: "72vh",
        minHeight: "640px",
        border: "none",
        borderRadius: "28px",
        background: "#000",
        boxShadow: "0 0 40px rgba(0,0,0,.45)"
      }}
      allow="camera;gyroscope;accelerometer;xr-spatial-tracking"
    />
  )
}
