import assert from "node:assert/strict"
import test from "node:test"
import {
  buildObservatoryQuickFeedItems,
  isQuickFeedPlayableYoutubeVideo,
  normalizeQuickFeedGroupIndex,
  quickFeedGroupAt,
  quickFeedGroupCount,
  quickFeedReceiptFor,
} from "./observatoryQuickFeedModel.js"

const liveContext = {
  status: "youtube-api-live",
  provider: "YouTube Data API v3",
  fetchedAt: "2026-07-24T12:00:00.000Z",
  queryUsed: "planetary observatory",
}

function liveVideo(index, videoId = `video-${index}`){
  return {
    videoId,
    title: `Provider result ${index}`,
    channelTitle: `Channel ${index}`,
    source: "YouTube Data API v3",
    providerRank: index,
    viewCount: index * 1000,
    embeddable: true,
    privacyStatus: "public",
    uploadStatus: "processed",
    liveBroadcastContent: "none",
    durationSeconds: 180,
  }
}

test("builds only complete, deduplicated groups of three", () => {
  const videos = [
    liveVideo(1),
    liveVideo(2),
    liveVideo(3),
    liveVideo(4),
    liveVideo(5),
    liveVideo(6),
    liveVideo(7),
    liveVideo(8, "video-7"),
  ]
  const items = buildObservatoryQuickFeedItems({videos, ...liveContext})

  assert.equal(items.length, 6)
  assert.equal(quickFeedGroupCount(items), 2)
  assert.deepEqual(quickFeedGroupAt(items, 0).map((item) => item.videoId), ["video-1", "video-2", "video-3"])
  assert.deepEqual(quickFeedGroupAt(items, 1).map((item) => item.videoId), ["video-4", "video-5", "video-6"])
})

test("requires a complete live YouTube receipt before exposing provider rank", () => {
  const video = liveVideo(2)
  assert.equal(quickFeedReceiptFor(video, liveContext).confirmed, true)
  assert.equal(quickFeedReceiptFor(video, {...liveContext, status: "youtube-prefilled-category-panels"}).confirmed, false)
  assert.equal(quickFeedReceiptFor({...video, source: "DigitalHut seeded panel"}, liveContext).confirmed, false)
  assert.equal(quickFeedReceiptFor({...video, providerRank: 0}, liveContext).confirmed, false)
})

test("rejects private, unavailable, live, short, and duplicate choices", () => {
  const playable = liveVideo(1)
  assert.equal(isQuickFeedPlayableYoutubeVideo(playable), true)
  assert.equal(isQuickFeedPlayableYoutubeVideo({...playable, privacyStatus: "private"}), false)
  assert.equal(isQuickFeedPlayableYoutubeVideo({...playable, embeddable: false}), false)
  assert.equal(isQuickFeedPlayableYoutubeVideo({...playable, uploadStatus: "rejected"}), false)
  assert.equal(isQuickFeedPlayableYoutubeVideo({...playable, liveBroadcastContent: "live"}), false)
  assert.equal(isQuickFeedPlayableYoutubeVideo({...playable, durationSeconds: 30}), false)
})

test("never exposes seeded popularity as provider evidence", () => {
  const seeded = Array.from({length: 3}, (_, index) => ({
    videoId: `seed-${index}`,
    title: `Curated ${index}`,
    channelTitle: "DigitalHut seeded YouTube panel",
    apiStatus: "prefilled-youtube-panel",
    viewCount: 999999,
    embeddable: true,
    privacyStatus: "public",
    uploadStatus: "processed",
    liveBroadcastContent: "none",
    durationSeconds: 180,
  }))
  const [item] = buildObservatoryQuickFeedItems({
    videos: seeded,
    status: "youtube-prefilled-category-panels",
    provider: "DigitalHut seeded YouTube panel",
    fetchedAt: "2026-07-24T12:00:00.000Z",
    queryUsed: "science",
  })

  assert.equal(item.truthLabel, "DigitalHut curated")
  assert.equal(item.popularityLabel, "")
  assert.equal(item.providerReceiptConfirmed, false)
})

test("wraps next and previous group indices without selecting a video", () => {
  assert.equal(normalizeQuickFeedGroupIndex(2, 2), 0)
  assert.equal(normalizeQuickFeedGroupIndex(-1, 2), 1)
  assert.equal(normalizeQuickFeedGroupIndex(4, 0), 0)
})
