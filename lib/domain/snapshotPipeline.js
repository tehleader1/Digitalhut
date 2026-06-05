import { resolveActiveFeedVisual } from "./visualResolver"

function slugify(value) {
  return String(value || "digitalhut-feed")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "digitalhut-feed"
}

function snapshotUseCases(visual = {}) {
  const base = ["active-feed", "history-receipt"]
  if (visual.kind === "model" || visual.kind === "image") return [...base, "main-feature", "blog-hero", "social-preview"]
  if (visual.kind === "market") return [...base, "market-card", "library-card", "blog-context"]
  if (visual.kind === "terrain") return [...base, "library-card", "environment-card", "seo-preview"]
  return [...base, "library-card", "fallback-visual"]
}

export function buildSnapshotDescriptor(feed = {}, options = {}) {
  const resolvedVisual = feed.resolvedVisual || resolveActiveFeedVisual(feed, options)
  const title = feed.title || "DigitalHut active feed"
  const slug = slugify(`${feed.category || feed.intent || "feed"}-${title}`)
  const sourceUrl = resolvedVisual.src || feed.previewImage || feed.modelUrl || feed.feedUrl || ""
  const query = feed.terrainUrl || feed.query || feed.title || ""

  return {
    id: `snapshot:${slug}`,
    slug,
    title,
    category: feed.category || "observatory",
    clientType: feed.clientType || feed.intent || "public",
    visualKind: resolvedVisual.kind,
    visualSource: resolvedVisual.source,
    visualLabel: resolvedVisual.label,
    sourceUrl,
    query,
    altText: `${title} ${resolvedVisual.label} visual for DigitalHut discovery context.`,
    reusableFor: snapshotUseCases(resolvedVisual),
    status: sourceUrl ? "source-ready" : "needs-render-capture",
    captureMode: resolvedVisual.kind === "model" ? "renderer-frame" : resolvedVisual.kind === "image" ? "source-image" : "synthetic-card",
    createdFrom: "activeFeed"
  }
}

export function enrichFeedWithSnapshot(feed = {}, options = {}) {
  return {
    ...feed,
    snapshotDescriptor: feed.snapshotDescriptor || buildSnapshotDescriptor(feed, options)
  }
}
