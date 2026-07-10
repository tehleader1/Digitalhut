let modelViewerLoadPromise = null

export function loadModelViewer(){
  if(typeof window === "undefined") return Promise.resolve(false)
  if(customElements.get("model-viewer")) return Promise.resolve(true)
  if(modelViewerLoadPromise) return modelViewerLoadPromise

  modelViewerLoadPromise = import("@google/model-viewer")
    .then(() => Boolean(customElements.get("model-viewer")))
    .catch(() => {
      modelViewerLoadPromise = null
      return false
    })

  return modelViewerLoadPromise
}
