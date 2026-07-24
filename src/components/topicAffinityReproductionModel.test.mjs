import assert from "node:assert/strict"
import test from "node:test"
import {
  DEFAULT_TOPIC_AFFINITY_PACING,
  TOPIC_AFFINITY_EVIDENCE_STATES,
  createTopicAffinityReproduction,
  replayTopicAffinity,
  topicAffinityFrameAt,
  topicAffinityResetRequired,
} from "./topicAffinityReproductionModel.js"

function confirmedInput(videoId = "provider-video-1"){
  return {
    activeVideo: {
      videoId,
      title: "Planetary telescope calibration",
      channelTitle: "Orbital Research Lab",
      provider: "Example Video Provider",
      tags: ["Telescope", "Calibration", "Planetary science"],
      category: "Planetary",
    },
    providerReceipt: {
      confirmed: true,
      videoId,
      provider: "Example Video Provider",
      fetchedAt: "2026-07-24T12:00:00.000Z",
      queryUsed: "planetary telescope",
      status: "provider-live",
    },
    event: {
      name: "video_topic_shift",
      state: "playing",
    },
  }
}

test("sparse metadata remains unavailable and produces stable accessible keys", () => {
  const input = {
    activeVideo: {
      videoId: "sparse-video",
      title: "Sparse source title",
    },
  }
  const first = createTopicAffinityReproduction(input)
  const second = createTopicAffinityReproduction(input)

  assert.equal(first.evidence.state, TOPIC_AFFINITY_EVIDENCE_STATES.UNAVAILABLE)
  assert.equal(first.contract.source, "Unavailable")
  assert.equal(first.contract.channel, "Unavailable")
  assert.equal(first.graph.nodes.some((node) => node.kind === "video" && node.label === "Sparse source title"), true)
  assert.equal(first.graph.nodes.some((node) => node.kind === "status" && node.label === "Evidence unavailable"), true)
  assert.deepEqual(first.graph.nodes.map((node) => node.key), second.graph.nodes.map((node) => node.key))
  assert.deepEqual(first.graph.edges.map((edge) => edge.key), second.graph.edges.map((edge) => edge.key))
  assert.equal(first.graph.nodes.every((node) => node.ariaLabel.includes(first.evidence.label)), true)
})

test("provider-confirmed metadata builds a meaningful video-specific graph and contract", () => {
  const model = createTopicAffinityReproduction(confirmedInput())
  const nodeKinds = new Set(model.graph.nodes.map((node) => node.kind))
  const nodeKeys = new Set(model.graph.nodes.map((node) => node.key))

  assert.equal(model.evidence.state, TOPIC_AFFINITY_EVIDENCE_STATES.PROVIDER_CONFIRMED)
  assert.equal(model.evidence.confirmed, true)
  assert.equal(model.contract.videoId, "provider-video-1")
  assert.equal(model.contract.source, "Example Video Provider")
  assert.equal(model.contract.channel, "Orbital Research Lab")
  assert.equal(model.contract.event, "video_topic_shift")
  assert.equal(model.contract.eventState, "playing")
  assert.equal(model.contract.status, TOPIC_AFFINITY_EVIDENCE_STATES.PROVIDER_CONFIRMED)
  assert.equal(model.contract.activeVideoKey, model.activeVideoKey)
  assert.equal(model.contract.fields.every((field) => field.activeVideoKey === model.activeVideoKey), true)
  assert.deepEqual([...nodeKinds].sort(), ["category", "channel", "query", "source", "tag", "video"])
  assert.equal(model.graph.edges.length, model.graph.nodes.length - 1)
  assert.equal(model.graph.edges.every((edge) => nodeKeys.has(edge.from) && nodeKeys.has(edge.to)), true)
  assert.equal(model.timeline.stages.every((stage) => stage.key.includes(model.activeVideoKey)), true)
  assert.equal(model.timeline.pacing.initialMs >= DEFAULT_TOPIC_AFFINITY_PACING.initialMs, true)
  assert.equal(model.timeline.pacing.nodeMs >= 650, true)
  assert.equal(model.timeline.pacing.edgeMs >= 500, true)
  assert.equal(model.timeline.pacing.holdMs >= 1200, true)
})

test("provider confirmation must be tied to the active video receipt", () => {
  const mismatched = confirmedInput("active-video")
  mismatched.providerReceipt.videoId = "different-video"
  const model = createTopicAffinityReproduction(mismatched)

  assert.equal(model.evidence.state, TOPIC_AFFINITY_EVIDENCE_STATES.UNAVAILABLE)
  assert.equal(model.evidence.confirmed, false)
  assert.equal(model.contract.source, "Unavailable")
  assert.equal(model.graph.nodes.some((node) => node.kind === "source"), false)
})

test("curated fallback is explicit and never presented as provider-confirmed", () => {
  const model = createTopicAffinityReproduction({
    activeVideo: {
      videoId: "curated-video",
      title: "Curated observatory explainer",
      channelTitle: "DigitalHut seeded panel",
      apiStatus: "prefilled-youtube-panel",
      tags: ["Observatory"],
    },
    providerReceipt: {
      confirmed: false,
      curated: true,
      provider: "DigitalHut seeded panel",
      status: "curated-fallback",
    },
    category: "Science",
  })

  assert.equal(model.evidence.state, TOPIC_AFFINITY_EVIDENCE_STATES.CURATED_FALLBACK)
  assert.equal(model.evidence.confirmed, false)
  assert.equal(model.evidence.curated, true)
  assert.equal(model.contract.source, "DigitalHut curated fallback")
  assert.equal(model.contract.channel, "DigitalHut seeded panel")
  assert.equal(model.contract.statusLabel, "Curated fallback metadata")
  assert.equal(model.graph.nodes.find((node) => node.kind === "source")?.evidenceState, TOPIC_AFFINITY_EVIDENCE_STATES.CURATED_FALLBACK)
})

test("active-video changes require reset while stable video identity does not", () => {
  const first = createTopicAffinityReproduction(confirmedInput("video-a"))
  const sameVideo = createTopicAffinityReproduction({
    ...confirmedInput("video-a"),
    activeVideo: {
      ...confirmedInput("video-a").activeVideo,
      title: "Updated title from the same active video",
    },
  })
  const nextVideo = createTopicAffinityReproduction(confirmedInput("video-b"))

  assert.equal(topicAffinityResetRequired(first, sameVideo), false)
  assert.equal(topicAffinityResetRequired(first, nextVideo), true)
  assert.equal(topicAffinityResetRequired(first.resetKey, nextVideo.resetKey), true)
  assert.equal(first.graph.rootNodeKey, sameVideo.graph.rootNodeKey)
  assert.deepEqual(
    first.contract.fields.map((field) => field.key),
    sameVideo.contract.fields.map((field) => field.key),
  )
  assert.equal(topicAffinityFrameAt(nextVideo, 0).stageIndex, 0)
})

test("completed staged playback replays deterministically from the first stage", () => {
  const model = createTopicAffinityReproduction(confirmedInput())
  const first = topicAffinityFrameAt(model, 0)
  const last = topicAffinityFrameAt(model, model.timeline.cycleDurationMs - 1)
  const replay = replayTopicAffinity(model)
  const thirdLoop = replayTopicAffinity(model, 3)

  assert.equal(model.timeline.loop, true)
  assert.equal(last.complete, true)
  assert.equal(replay.stageKey, first.stageKey)
  assert.deepEqual(replay.visibleNodes.map((node) => node.key), first.visibleNodes.map((node) => node.key))
  assert.deepEqual(replay.visibleEdges.map((edge) => edge.key), first.visibleEdges.map((edge) => edge.key))
  assert.equal(replay.iteration, 1)
  assert.equal(replay.looped, true)
  assert.equal(thirdLoop.iteration, 3)
  assert.equal(thirdLoop.stageKey, first.stageKey)
})

test("no-evidence input yields only an unavailable status without relationships", () => {
  const model = createTopicAffinityReproduction({})
  const frame = topicAffinityFrameAt(model, 0)

  assert.equal(model.identityBasis, "unavailable")
  assert.equal(model.evidence.state, TOPIC_AFFINITY_EVIDENCE_STATES.UNAVAILABLE)
  assert.equal(model.contract.videoId, "")
  assert.equal(model.contract.source, "Unavailable")
  assert.equal(model.contract.channel, "Unavailable")
  assert.equal(model.graph.nodes.length, 1)
  assert.equal(model.graph.nodes[0].kind, "status")
  assert.equal(model.graph.edges.length, 0)
  assert.equal(frame.visibleNodes.length, 1)
  assert.equal(frame.visibleEdges.length, 0)
})

test("reduced motion exposes the complete graph once without looping animation", () => {
  const model = createTopicAffinityReproduction(confirmedInput(), {
    reducedMotion: true,
    pacing: {
      initialMs: 1,
      nodeMs: 1,
      edgeMs: 1,
      holdMs: 1,
    },
  })
  const first = topicAffinityFrameAt(model, 0)
  const later = topicAffinityFrameAt(model, 999999)

  assert.equal(model.timeline.motion, "reduced")
  assert.equal(model.timeline.loop, false)
  assert.equal(model.timeline.cycleDurationMs, 0)
  assert.equal(model.timeline.stages.length, 1)
  assert.equal(first.complete, true)
  assert.equal(first.stageProgress, 1)
  assert.equal(first.visibleNodes.length, model.graph.nodes.length)
  assert.equal(first.visibleEdges.length, model.graph.edges.length)
  assert.equal(later.stageKey, first.stageKey)
  assert.equal(later.iteration, 0)
})

test("forbidden audience, geography, transcript, popularity, and causation claims are suppressed", () => {
  const input = confirmedInput()
  Object.assign(input.activeVideo, {
    audience: "AUDIENCE_SENTINEL",
    geography: "GEOGRAPHY_SENTINEL",
    country: "COUNTRY_SENTINEL",
    transcript: "TRANSCRIPT_SENTINEL",
    viewCount: "POPULARITY_SENTINEL",
    likeCount: "LIKES_SENTINEL",
    popularity: "POPULARITY_SCORE_SENTINEL",
    causedBy: "CAUSATION_SENTINEL",
  })
  Object.assign(input, {
    audience: "TOP_LEVEL_AUDIENCE_SENTINEL",
    geography: "TOP_LEVEL_GEOGRAPHY_SENTINEL",
    transcript: "TOP_LEVEL_TRANSCRIPT_SENTINEL",
    popularity: "TOP_LEVEL_POPULARITY_SENTINEL",
    causation: "TOP_LEVEL_CAUSATION_SENTINEL",
  })
  const model = createTopicAffinityReproduction(input)
  const serialized = JSON.stringify(model)
  const forbiddenValues = [
    "AUDIENCE_SENTINEL",
    "GEOGRAPHY_SENTINEL",
    "COUNTRY_SENTINEL",
    "TRANSCRIPT_SENTINEL",
    "POPULARITY_SENTINEL",
    "LIKES_SENTINEL",
    "POPULARITY_SCORE_SENTINEL",
    "CAUSATION_SENTINEL",
    "TOP_LEVEL_AUDIENCE_SENTINEL",
    "TOP_LEVEL_GEOGRAPHY_SENTINEL",
    "TOP_LEVEL_TRANSCRIPT_SENTINEL",
    "TOP_LEVEL_POPULARITY_SENTINEL",
    "TOP_LEVEL_CAUSATION_SENTINEL",
  ]
  const allowedRelations = new Set([
    "provider-metadata",
    "curated-source",
    "channel-metadata",
    "category-metadata",
    "query-metadata",
    "tag-metadata",
    "evidence-status",
    "metadata-context",
  ])

  forbiddenValues.forEach((value) => assert.equal(serialized.includes(value), false))
  assert.deepEqual(
    model.claimPolicy.suppressed,
    ["audience", "geography", "transcript", "popularity", "causation"],
  )
  assert.equal(model.graph.edges.every((edge) => allowedRelations.has(edge.relation)), true)
  assert.equal(model.graph.nodes.some((node) => ["audience", "geography", "transcript", "popularity", "causation"].includes(node.kind)), false)
})
