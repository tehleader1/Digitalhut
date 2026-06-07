export default function LiveGlbViewer({ model }) {
  const modelUrl =
    typeof model === "string"
      ? model
      : model?.url || model?.model || model?.src || model?.glb || model?.path || ""

  if (!modelUrl) {
    return <div className="dh-renderer-empty">Loading main renderer...</div>
  }

  return (
    <iframe
      className="dh-renderer-frame"
      src={`/viewer.html?model=${encodeURIComponent(modelUrl)}`}
      allow="camera;gyroscope;accelerometer;xr-spatial-tracking;fullscreen"
      allowFullScreen
    />
  )
}
