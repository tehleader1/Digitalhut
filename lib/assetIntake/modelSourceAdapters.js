function sketchfabToken() {
  return process.env.SKETCHFAB_ACCESS_TOKEN || process.env.SKETCHFAB_API_TOKEN || process.env.SKETCHFAB_TOKEN || process.env.SKETCHFAB_API_KEY
}

async function fetchSketchfabDownload(uid, token) {
  if (!uid) return { url: null, status: "missing-uid", error: "Sketchfab model UID was not returned." }
  if (!token) return { url: null, status: "missing-token", error: "Set SKETCHFAB_ACCESS_TOKEN to request downloadable GLB URLs." }

  try {
    const response = await fetch(`https://api.sketchfab.com/v3/models/${uid}/download`, {
      headers: { Authorization: `Token ${token}` }
    })
    if (!response.ok) {
      const detail = await response.text()
      return { url: null, status: response.status, error: detail || `Sketchfab download failed with status ${response.status}.` }
    }
    const data = await response.json()
    const url = data.glb?.url || data.gltf?.url || null
    return { url, status: url ? "ok" : "missing-download-url", error: url ? null : "Sketchfab did not include a GLB or glTF URL." }
  } catch (error) {
    return { url: null, status: "request-error", error: error?.message || "Sketchfab download request failed." }
  }
}

export async function testSketchfabModelSource(query) {
  const token = sketchfabToken()
  const url = new URL("https://api.sketchfab.com/v3/search")
  url.searchParams.set("type", "models")
  url.searchParams.set("downloadable", "true")
  url.searchParams.set("sort_by", "-likeCount")
  url.searchParams.set("q", query || "two story house real estate glb")

  try {
    const response = await fetch(url, {
      headers: token ? { Authorization: `Token ${token}` } : {}
    })
    if (!response.ok) {
      return {
        provider: "sketchfab",
        category: "3d-model",
        keyPresent: Boolean(token),
        status: response.status === 401 ? "permission-failed" : "request-failed",
        query,
        canRender: false,
        fallbackReason: `Sketchfab search returned ${response.status}.`
      }
    }

    const data = await response.json()
    const model = data.results?.[0]
    if (!model) {
      return {
        provider: "sketchfab",
        category: "3d-model",
        keyPresent: Boolean(token),
        status: "no-result",
        query,
        canRender: false,
        fallbackReason: "Sketchfab returned no downloadable model candidates."
      }
    }

    const download = await fetchSketchfabDownload(model.uid, token)
    return {
      provider: "sketchfab",
      category: "3d-model",
      keyPresent: Boolean(token),
      status: download.url ? "live" : "metadata-only",
      query,
      sampleTitle: model.name,
      sampleImage: model.thumbnails?.images?.[0]?.url || null,
      sampleModelUrl: download.url,
      samplePageUrl: model.viewerUrl || model.url,
      author: model.user?.displayName || model.user?.username || null,
      canRender: Boolean(download.url || model.thumbnails?.images?.[0]?.url),
      fallbackReason: download.error
    }
  } catch (error) {
    return {
      provider: "sketchfab",
      category: "3d-model",
      keyPresent: Boolean(token),
      status: "request-error",
      query,
      canRender: false,
      fallbackReason: error?.message || "Sketchfab request failed."
    }
  }
}
