export const TOPIC_AFFINITY_EVIDENCE_STATES = Object.freeze({
  PROVIDER_CONFIRMED: "provider-confirmed",
  CURATED_FALLBACK: "curated-fallback",
  UNAVAILABLE: "unavailable",
})

export const DEFAULT_TOPIC_AFFINITY_PACING = Object.freeze({
  initialMs: 900,
  nodeMs: 800,
  edgeMs: 650,
  holdMs: 1800,
})

const SUPPRESSED_CLAIM_TYPES = Object.freeze([
  "audience",
  "geography",
  "transcript",
  "popularity",
  "causation",
])

const EVENT_STATES = new Set(["playing", "paused", "waiting", "ended", "unknown"])

function cleanText(value, max = 180){
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max)
}

function stableToken(value){
  const source = cleanText(value, 500) || "unavailable"
  let hash = 2166136261
  for(let index = 0; index < source.length; index += 1){
    hash ^= source.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(36)
}

function safeHttpUrl(value){
  const source = cleanText(value, 1000)
  if(!source) return ""
  try {
    const parsed = new URL(source)
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : ""
  } catch {
    return ""
  }
}

function validReceiptTime(value){
  const parsed = Date.parse(cleanText(value, 80))
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : ""
}

function uniqueTextValues(values, limit = 4){
  const seen = new Set()
  const output = []
  for(const value of values){
    const label = cleanText(value, 80)
    const key = label.toLowerCase()
    if(!label || seen.has(key)) continue
    seen.add(key)
    output.push(label)
    if(output.length >= limit) break
  }
  return output
}

function duration(value, fallback, minimum){
  const parsed = Math.round(Number(value))
  if(!Number.isFinite(parsed)) return fallback
  return Math.max(minimum, Math.min(10000, parsed))
}

function pacingFor(value = {}){
  return {
    initialMs: duration(value.initialMs, DEFAULT_TOPIC_AFFINITY_PACING.initialMs, 700),
    nodeMs: duration(value.nodeMs, DEFAULT_TOPIC_AFFINITY_PACING.nodeMs, 650),
    edgeMs: duration(value.edgeMs, DEFAULT_TOPIC_AFFINITY_PACING.edgeMs, 500),
    holdMs: duration(value.holdMs, DEFAULT_TOPIC_AFFINITY_PACING.holdMs, 1200),
  }
}

function normalizedInput(input = {}){
  const activeVideo = input.activeVideo && typeof input.activeVideo === "object"
    ? input.activeVideo
    : input.video && typeof input.video === "object"
      ? input.video
      : {}
  const providerReceipt = input.providerReceipt && typeof input.providerReceipt === "object"
    ? input.providerReceipt
    : {}
  const eventInput = input.event && typeof input.event === "object" ? input.event : {}
  const videoId = cleanText(activeVideo.videoId || activeVideo.id, 120)
  const title = cleanText(activeVideo.title, 180)
  const channel = cleanText(activeVideo.channelTitle || activeVideo.channel, 120)
  const provider = cleanText(providerReceipt.provider || activeVideo.provider || input.provider, 120)
  const sourceUrl = safeHttpUrl(activeVideo.sourceUrl || activeVideo.url)
  const receiptVideoId = cleanText(providerReceipt.videoId, 120)
  const fetchedAt = validReceiptTime(providerReceipt.fetchedAt)
  const category = cleanText(input.category || activeVideo.category, 80)
  const queryUsed = cleanText(input.queryUsed || providerReceipt.queryUsed || activeVideo.queryUsed, 120)
  const tags = uniqueTextValues([
    ...(Array.isArray(activeVideo.tags) ? activeVideo.tags : []),
    ...(Array.isArray(input.tags) ? input.tags : []),
  ])
  const statusText = [
    providerReceipt.status,
    activeVideo.apiStatus,
    activeVideo.truthLabel,
    input.status,
    input.truthLabel,
    provider,
  ].map((value) => cleanText(value, 120)).join(" ")
  const hasIdentity = Boolean(videoId || title || sourceUrl)
  const providerConfirmed = providerReceipt.confirmed === true
    && Boolean(videoId)
    && receiptVideoId === videoId
    && Boolean(provider)
    && Boolean(fetchedAt)
  const curated = hasIdentity && (
    providerReceipt.curated === true
    || input.curated === true
    || activeVideo.curated === true
    || /curated|seeded|prefilled|fallback|quota/i.test(statusText)
  )
  const evidenceState = providerConfirmed
    ? TOPIC_AFFINITY_EVIDENCE_STATES.PROVIDER_CONFIRMED
    : curated
      ? TOPIC_AFFINITY_EVIDENCE_STATES.CURATED_FALLBACK
      : TOPIC_AFFINITY_EVIDENCE_STATES.UNAVAILABLE
  const identityBasis = videoId
    ? "video-id"
    : sourceUrl
      ? "source-url"
      : title
        ? "title"
        : "unavailable"
  const identityValue = videoId || sourceUrl || title || "unavailable"
  const activeVideoKey = `topic-video-${stableToken(`${identityBasis}:${identityValue}`)}`
  const requestedEventName = cleanText(eventInput.name || input.eventName, 80)
  const eventName = /^[a-z][a-z0-9_.:-]*$/i.test(requestedEventName)
    ? requestedEventName
    : "topic_affinity_reproduction"
  const requestedEventState = cleanText(eventInput.state || input.playbackState, 20).toLowerCase()
  const eventState = EVENT_STATES.has(requestedEventState) ? requestedEventState : "unknown"

  return {
    activeVideo,
    providerReceipt,
    videoId,
    title,
    channel,
    provider,
    sourceUrl,
    fetchedAt,
    category,
    queryUsed,
    tags,
    evidenceState,
    identityBasis,
    activeVideoKey,
    eventName,
    eventState,
  }
}

function evidenceFor(metadata){
  const label = metadata.evidenceState === TOPIC_AFFINITY_EVIDENCE_STATES.PROVIDER_CONFIRMED
    ? "Confirmed provider metadata"
    : metadata.evidenceState === TOPIC_AFFINITY_EVIDENCE_STATES.CURATED_FALLBACK
      ? "Curated fallback metadata"
      : "Evidence unavailable"
  return {
    key: `evidence:${metadata.activeVideoKey}:${metadata.evidenceState}`,
    state: metadata.evidenceState,
    label,
    confirmed: metadata.evidenceState === TOPIC_AFFINITY_EVIDENCE_STATES.PROVIDER_CONFIRMED,
    curated: metadata.evidenceState === TOPIC_AFFINITY_EVIDENCE_STATES.CURATED_FALLBACK,
    provider: metadata.evidenceState === TOPIC_AFFINITY_EVIDENCE_STATES.PROVIDER_CONFIRMED ? metadata.provider : "",
    fetchedAt: metadata.evidenceState === TOPIC_AFFINITY_EVIDENCE_STATES.PROVIDER_CONFIRMED ? metadata.fetchedAt : "",
  }
}

function contractFor(metadata, evidence){
  const source = evidence.confirmed
    ? metadata.provider
    : evidence.curated
      ? "DigitalHut curated fallback"
      : "Unavailable"
  const channel = evidence.state === TOPIC_AFFINITY_EVIDENCE_STATES.UNAVAILABLE
    ? "Unavailable"
    : metadata.channel || "Unavailable"
  const key = `topic-contract:${metadata.activeVideoKey}`
  const statusLabel = evidence.label
  const fields = [
    {name: "source", label: "Source", value: source},
    {name: "channel", label: "Channel", value: channel},
    {name: "event", label: "Event", value: metadata.eventName},
    {name: "status", label: "Status", value: statusLabel},
  ].map((field) => ({
    ...field,
    key: `${key}:${field.name}`,
    activeVideoKey: metadata.activeVideoKey,
  }))

  return {
    key,
    activeVideoKey: metadata.activeVideoKey,
    videoId: metadata.videoId,
    source,
    channel,
    event: metadata.eventName,
    eventState: metadata.eventState,
    status: evidence.state,
    statusLabel,
    fields,
  }
}

function graphFor(metadata, evidence, contract){
  const nodes = []
  const edges = []
  const nodeKeys = new Set()

  function addNode(kind, label, sourceField, evidenceState = evidence.state){
    const cleanLabel = cleanText(label, 140)
    if(!cleanLabel) return null
    const nodeIdentity = kind === "tag" ? `${kind}:${stableToken(cleanLabel)}` : kind
    const key = `affinity-node:${metadata.activeVideoKey}:${nodeIdentity}`
    if(nodeKeys.has(key)) return nodes.find((node) => node.key === key) || null
    const node = {
      key,
      kind,
      label: cleanLabel,
      sourceField,
      evidenceState,
      activeVideoKey: metadata.activeVideoKey,
      ariaLabel: `${kind === "video" ? "Active video" : kind}: ${cleanLabel}. ${evidence.label}.`,
    }
    nodeKeys.add(key)
    nodes.push(node)
    return node
  }

  const videoNode = metadata.videoId || metadata.title
    ? addNode("video", metadata.title || "Active video metadata", metadata.videoId ? "videoId" : "title")
    : null
  const rootNode = videoNode || addNode(
    "status",
    "Evidence unavailable",
    "status",
    TOPIC_AFFINITY_EVIDENCE_STATES.UNAVAILABLE,
  )

  if(evidence.state === TOPIC_AFFINITY_EVIDENCE_STATES.UNAVAILABLE && videoNode){
    addNode("status", "Evidence unavailable", "status", TOPIC_AFFINITY_EVIDENCE_STATES.UNAVAILABLE)
  }

  if(evidence.state !== TOPIC_AFFINITY_EVIDENCE_STATES.UNAVAILABLE){
    addNode("source", contract.source, evidence.confirmed ? "providerReceipt.provider" : "curated")
    if(contract.channel !== "Unavailable") addNode("channel", contract.channel, "activeVideo.channelTitle")
    if(metadata.category) addNode("category", metadata.category, "category")
    if(metadata.queryUsed) addNode("query", metadata.queryUsed, "providerReceipt.queryUsed")
    metadata.tags.forEach((tag) => addNode("tag", tag, "activeVideo.tags"))
  }

  const relationFor = {
    source: evidence.confirmed ? "provider-metadata" : "curated-source",
    channel: "channel-metadata",
    category: "category-metadata",
    query: "query-metadata",
    tag: "tag-metadata",
    status: "evidence-status",
  }

  nodes.forEach((node) => {
    if(!rootNode || node.key === rootNode.key) return
    const relation = relationFor[node.kind] || "metadata-context"
    edges.push({
      key: `affinity-edge:${metadata.activeVideoKey}:${stableToken(`${rootNode.key}:${node.key}:${relation}`)}`,
      from: rootNode.key,
      to: node.key,
      relation,
      evidenceState: node.evidenceState,
      activeVideoKey: metadata.activeVideoKey,
      ariaLabel: `${rootNode.label}; ${relation.replace(/-/g, " ")}; ${node.label}.`,
    })
  })

  return {
    key: `topic-affinity-graph:${metadata.activeVideoKey}`,
    activeVideoKey: metadata.activeVideoKey,
    rootNodeKey: rootNode?.key || "",
    ariaLabel: metadata.title
      ? `Topic Affinity for ${metadata.title}. ${evidence.label}.`
      : `Topic Affinity. ${evidence.label}.`,
    nodes,
    edges,
  }
}

function stagedTimelineFor(graph, evidence, pacing, reducedMotion){
  if(reducedMotion){
    const stage = {
      key: `affinity-stage:${graph.activeVideoKey}:reduced`,
      index: 0,
      phase: "complete",
      label: "Topic Affinity available without motion",
      announcement: `${graph.ariaLabel} All available metadata relationships are visible without animation.`,
      startMs: 0,
      durationMs: 0,
      endMs: 0,
      visibleNodeKeys: graph.nodes.map((node) => node.key),
      visibleEdgeKeys: graph.edges.map((edge) => edge.key),
      complete: true,
    }
    return {
      motion: "reduced",
      loop: false,
      cycleDurationMs: 0,
      pacing,
      stages: [stage],
    }
  }

  const stages = []
  const visibleNodeKeys = []
  const visibleEdgeKeys = []
  let cursor = 0

  function addStage(phase, label, announcement, durationMs, complete = false){
    const index = stages.length
    const stage = {
      key: `affinity-stage:${graph.activeVideoKey}:${index}:${stableToken(`${phase}:${label}`)}`,
      index,
      phase,
      label,
      announcement,
      startMs: cursor,
      durationMs,
      endMs: cursor + durationMs,
      visibleNodeKeys: [...visibleNodeKeys],
      visibleEdgeKeys: [...visibleEdgeKeys],
      complete,
    }
    stages.push(stage)
    cursor += durationMs
  }

  graph.nodes.forEach((node, nodeIndex) => {
    visibleNodeKeys.push(node.key)
    addStage(
      "node",
      node.label,
      `${node.ariaLabel} Added to Topic Affinity.`,
      nodeIndex === 0 ? pacing.initialMs : pacing.nodeMs,
    )
    graph.edges.filter((edge) => edge.to === node.key).forEach((edge) => {
      visibleEdgeKeys.push(edge.key)
      addStage(
        "edge",
        edge.relation.replace(/-/g, " "),
        `${edge.ariaLabel} Relationship added from supplied metadata.`,
        pacing.edgeMs,
      )
    })
  })

  addStage(
    "complete",
    evidence.state === TOPIC_AFFINITY_EVIDENCE_STATES.UNAVAILABLE
      ? "Evidence unavailable"
      : "Topic Affinity complete",
    `${graph.ariaLabel} The deterministic replay will restart after this hold.`,
    pacing.holdMs,
    true,
  )

  return {
    motion: "staged",
    loop: true,
    cycleDurationMs: cursor,
    pacing,
    stages,
  }
}

export function createTopicAffinityReproduction(input = {}, options = {}){
  const metadata = normalizedInput(input)
  const evidence = evidenceFor(metadata)
  const contract = contractFor(metadata, evidence)
  const graph = graphFor(metadata, evidence, contract)
  const reducedMotion = options.reducedMotion === true
  const pacing = pacingFor(options.pacing)
  const timeline = stagedTimelineFor(graph, evidence, pacing, reducedMotion)

  return {
    key: `topic-affinity-reproduction:${metadata.activeVideoKey}`,
    activeVideoKey: metadata.activeVideoKey,
    resetKey: metadata.activeVideoKey,
    identityBasis: metadata.identityBasis,
    evidence,
    contract,
    graph,
    timeline,
    claimPolicy: {
      derivedOnlyFrom: "active-video-and-provider-metadata",
      suppressed: [...SUPPRESSED_CLAIM_TYPES],
    },
  }
}

export function topicAffinityFrameAt(model, elapsedMs = 0){
  const stages = Array.isArray(model?.timeline?.stages) ? model.timeline.stages : []
  if(!stages.length){
    return {
      stageKey: "",
      iteration: 0,
      cycleElapsedMs: 0,
      stageElapsedMs: 0,
      stageProgress: 1,
      looped: false,
      complete: true,
      visibleNodes: [],
      visibleEdges: [],
      announcement: "Topic Affinity evidence unavailable.",
    }
  }

  const graphNodes = Array.isArray(model?.graph?.nodes) ? model.graph.nodes : []
  const graphEdges = Array.isArray(model?.graph?.edges) ? model.graph.edges : []
  const cycleDurationMs = Math.max(0, Number(model?.timeline?.cycleDurationMs) || 0)
  const safeElapsedMs = Math.max(0, Number(elapsedMs) || 0)
  const staticTimeline = model?.timeline?.motion === "reduced" || cycleDurationMs === 0
  const iteration = staticTimeline ? 0 : Math.floor(safeElapsedMs / cycleDurationMs)
  const cycleElapsedMs = staticTimeline ? 0 : safeElapsedMs % cycleDurationMs
  const stage = staticTimeline
    ? stages[0]
    : stages.find((candidate) => cycleElapsedMs < candidate.endMs) || stages[stages.length - 1]
  const stageElapsedMs = staticTimeline ? 0 : Math.max(0, cycleElapsedMs - stage.startMs)
  const stageProgress = staticTimeline || stage.durationMs === 0
    ? 1
    : Math.max(0, Math.min(1, stageElapsedMs / stage.durationMs))
  const visibleNodeKeys = new Set(stage.visibleNodeKeys)
  const visibleEdgeKeys = new Set(stage.visibleEdgeKeys)

  return {
    stageKey: stage.key,
    stageIndex: stage.index,
    phase: stage.phase,
    label: stage.label,
    iteration,
    cycleElapsedMs,
    stageElapsedMs,
    stageProgress,
    looped: iteration > 0,
    complete: stage.complete,
    visibleNodes: graphNodes.filter((node) => visibleNodeKeys.has(node.key)),
    visibleEdges: graphEdges.filter((edge) => visibleEdgeKeys.has(edge.key)),
    announcement: stage.announcement,
  }
}

export function replayTopicAffinity(model, iteration = 1){
  const cycleDurationMs = Math.max(0, Number(model?.timeline?.cycleDurationMs) || 0)
  const replayIteration = Math.max(1, Math.round(Number(iteration) || 1))
  return topicAffinityFrameAt(model, cycleDurationMs * replayIteration)
}

export function topicAffinityResetRequired(previous, next){
  const previousKey = cleanText(
    typeof previous === "string" ? previous : previous?.resetKey || previous?.activeVideoKey,
    160,
  )
  const nextKey = cleanText(
    typeof next === "string" ? next : next?.resetKey || next?.activeVideoKey,
    160,
  )
  return previousKey !== nextKey
}
