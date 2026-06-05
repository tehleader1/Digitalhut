import { buildSnapshotDescriptor } from "./snapshotPipeline"

function nowIso() {
  return new Date().toISOString()
}

export function buildDiscoveryRecord(input = {}) {
  const feed = input.activeFeed || input.result || input.feed || input
  const snapshotDescriptor = input.snapshotDescriptor || feed.snapshotDescriptor || buildSnapshotDescriptor(feed)
  const title = feed.title || input.query || "DigitalHut discovery"
  const category = feed.category || input.category || "observatory"

  return {
    event_type: input.event_type || "discovery-vault-save",
    savedAt: input.savedAt || nowIso(),
    wallet: input.wallet || feed.wallet || "public",
    tier: input.tier || feed.tier || "free",
    title,
    query: input.query || feed.query || feed.terrainUrl || title,
    category,
    provider: input.provider || feed.sourceApi || feed.source || "DigitalHut",
    activeFeedId: feed.id || `${category}:${title}`,
    snapshotDescriptor,
    agentReadable: {
      canSummarize: true,
      canRecommendNext: true,
      canAttachReceipt: true,
      source: "activeFeed"
    },
    result: input.result || feed
  }
}

export function summarizeDiscoveryVault(history = []) {
  const saved = Array.isArray(history) ? history.filter((item) => item.event_type?.includes("discovery") || item.snapshotDescriptor) : []
  const categories = [...new Set(saved.map((item) => item.category).filter(Boolean))]
  return {
    count: saved.length,
    categories,
    latest: saved.slice(0, 6).map((item) => ({
      title: item.title || item.query,
      category: item.category,
      provider: item.provider,
      snapshot: item.snapshotDescriptor?.status || "pending"
    }))
  }
}
