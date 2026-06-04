import { enrichFeedWithResolvedVisual, resolveActiveFeedVisual } from "./visualResolver"

export function buildVisualTranscript(feed = {}) {
  const resolvedVisual = feed.resolvedVisual || resolveActiveFeedVisual(feed)
  const title = feed.title || "DigitalHut active feed"
  const category = feed.category || "observatory"
  const sourceApi = feed.sourceApi || feed.source || "DigitalHut"
  const symbols = Array.isArray(feed.marketSymbols) ? feed.marketSymbols : []
  const terrainUrl = feed.terrainUrl || "none selected"
  const visualDetail =
    feed.visualDescription ||
    resolvedVisual.transcript ||
    feed.description ||
    feed.agentNarration ||
    "A live visual is available for this observation."

  return [
    `${title}.`,
    `Category ${category}.`,
    `Source ${sourceApi}.`,
    `Visual source ${resolvedVisual.source}: ${resolvedVisual.label}.`,
    symbols.length ? `Market context ${symbols.join(", ")}.` : "",
    `Current terrain query ${terrainUrl}.`,
    `Visual detail: ${visualDetail}.`,
    feed.modelUrl ? "A 3D model is attached to this feed." : "",
    feed.previewImage ? "A preview image is available." : ""
  ].filter(Boolean).join(" ")
}

export function enrichActiveFeed(feed = {}) {
  const feedWithVisual = enrichFeedWithResolvedVisual(feed)
  const visualTranscript = buildVisualTranscript(feedWithVisual)

  return {
    ...feedWithVisual,
    visualTranscript,
    faqContext: feed.faqContext || visualTranscript,
    agentNarration: visualTranscript
  }
}
