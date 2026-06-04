export function buildVisualTranscript(feed = {}) {
  const title = feed.title || "DigitalHut active feed"
  const category = feed.category || "observatory"
  const sourceApi = feed.sourceApi || feed.source || "DigitalHut"
  const symbols = Array.isArray(feed.marketSymbols) ? feed.marketSymbols : []
  const terrainUrl = feed.terrainUrl || "none selected"
  const visualDetail =
    feed.visualDescription ||
    feed.description ||
    feed.agentNarration ||
    "A live visual is available for this observation."

  return [
    `${title}.`,
    `Category ${category}.`,
    `Source ${sourceApi}.`,
    symbols.length ? `Market context ${symbols.join(", ")}.` : "",
    `Current terrain query ${terrainUrl}.`,
    `Visual detail: ${visualDetail}.`,
    feed.modelUrl ? "A 3D model is attached to this feed." : "",
    feed.previewImage ? "A preview image is available." : ""
  ].filter(Boolean).join(" ")
}

export function enrichActiveFeed(feed = {}) {
  const visualTranscript = buildVisualTranscript(feed)

  return {
    ...feed,
    visualTranscript,
    faqContext: feed.faqContext || visualTranscript,
    agentNarration: visualTranscript
  }
}
