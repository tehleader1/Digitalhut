const axes = [
  ["airport", ["airport", "flight", "terminal", "runway", "airline", "diversion", "visibility"]],
  ["weather", ["weather", "storm", "rain", "wind", "flood", "forecast", "hazard", "visibility"]],
  ["traffic", ["traffic", "road", "route", "congestion", "cars", "parking", "delay"]],
  ["building", ["building", "hotel", "house", "property", "terminal", "block", "structure"]],
  ["map", ["map", "region", "route", "city", "country", "global", "international", "location"]],
  ["website", ["website", "service", "payment", "support", "domain", "complaint", "scam"]],
  ["health", ["health", "outbreak", "case", "clinic", "tracing", "disease", "public"]],
  ["environment", ["environment", "sensor", "air", "water", "smoke", "pollution", "algal", "monitoring"]],
  ["workforce", ["workforce", "construction", "project", "jobsite", "equipment", "public", "works"]],
  ["game", ["game", "character", "level", "avatar", "boss", "quest", "play"]],
  ["research", ["research", "science", "verify", "data", "evidence", "lab", "analysis"]],
  ["stream", ["viral", "stream", "creator", "video", "trend", "meme", "funny"]]
]

const topologyAxes = [
  ["linearFlow", ["road", "route", "runway", "path", "arrow", "flight", "lane"]],
  ["enclosure", ["building", "hotel", "terminal", "house", "room", "block"]],
  ["network", ["website", "payment", "support", "service", "api", "database", "traffic"]],
  ["hazardField", ["storm", "weather", "risk", "dangerous", "warning", "flood", "smoke"]],
  ["cluster", ["case", "complaint", "sensor", "crowd", "congestion", "cluster"]],
  ["terrain", ["region", "map", "environment", "water", "mountain", "country"]],
  ["objectModel", ["glb", "model", "mesh", "scan", "asset", "3d"]]
]

function tokenize(value = ""){
  return String(value).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
}

function axisVector(text, groups){
  const tokens = tokenize(text)
  return groups.map(([, words]) => {
    const hits = words.reduce((sum, word) => sum + (tokens.includes(word) ? 1 : 0), 0)
    return hits / Math.max(1, words.length)
  })
}

function normalize(vector){
  const length = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1
  return vector.map((value) => value / length)
}

export function cosineSimilarity(a, b){
  const left = normalize(a)
  const right = normalize(b)
  return left.reduce((sum, value, index) => sum + value * (right[index] || 0), 0)
}

export function assetEmbedding(input = {}){
  const text = [
    input.title,
    input.name,
    input.category,
    input.location,
    input.type,
    input.fileType,
    input.glbSceneType,
    input.renderIdea,
    input.problem,
    input.description,
    input.reasonMatched,
    ...(input.tags || [])
  ].filter(Boolean).join(" ")

  const semantic = axisVector(text, axes)
  const topology = axisVector(text, topologyAxes)
  const scale = text.includes("city") || text.includes("airport") || text.includes("region") ? .8 : .35
  const volume = text.includes("building") || text.includes("terminal") || text.includes("house") ? .72 : .42
  const flow = text.includes("route") || text.includes("flight") || text.includes("traffic") ? .9 : .28
  return normalize([...semantic, ...topology, scale, volume, flow])
}

export function vectorMatchScore(candidate, asset){
  const queryVector = assetEmbedding(candidate)
  const assetVector = assetEmbedding(asset)
  const semanticShape = cosineSimilarity(queryVector, assetVector)
  const freshness = asset.createdAt && Date.now() - new Date(asset.createdAt).getTime() < 1000 * 60 * 60 * 72 ? .08 : 0
  const permission = asset.permission?.toLowerCase().includes("public") ? .06 : asset.permission?.toLowerCase().includes("private") ? .03 : 0
  const viewerInterest = Math.min(.08, (asset.views || 0) / 5000)
  const specificPenalty = asset.genericDemo ? -.22 : 0
  return Math.max(0, Math.min(1, semanticShape * .78 + freshness + permission + viewerInterest + specificPenalty))
}

export function inferCategoryByVector(query, categories){
  const queryVector = assetEmbedding({description: query})
  const ranked = categories.map((category) => ({
    id: category.id,
    score: cosineSimilarity(queryVector, assetEmbedding({name: category.id, description: category.context}))
  })).sort((a, b) => b.score - a.score)
  return ranked[0]?.score > .18 ? ranked[0].id : ""
}
