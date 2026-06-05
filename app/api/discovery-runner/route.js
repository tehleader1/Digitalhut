import { addHistory } from "../../lib/digitalhutStore"

export const dynamic = "force-dynamic"

const questionTypes = [
  { id: "basic-math", label: "basic math", tests: [/\b\d+\s*[+\-*/x]\s*\d+\b/i, /math|calculate|total|percent|ratio/i] },
  { id: "real-world-speech", label: "real-world speech", tests: [/how do i|what should|explain|tell me|client|customer|visitor/i] },
  { id: "coding", label: "developer coding", tests: [/code|function|component|api|route|bug|build|deploy|server/i] },
  { id: "advanced-structure", label: "advanced code structure", tests: [/architecture|structure|refactor|pipeline|system|runner|backend|database|supabase/i] },
  { id: "multi-glb-client", label: "multi-GLB client integration", tests: [/glb|3d model|multi.?glb|client project|connect.*digitalhut/i] },
  { id: "market-render", label: "market rendering", tests: [/market|ticker|candlestick|technical|profile|stock|crypto|btc|eth|spy|nvda|tsla/i] },
  { id: "snapshot-distribution", label: "snapshot distribution", tests: [/snapshot|blog|library|examples|recent activity|visual/i] }
]

function classifyQuestion(question = "") {
  const matches = questionTypes.filter((type) => type.tests.some((test) => test.test(question)))
  return matches.length ? matches.map((match) => match.id) : ["real-world-speech"]
}

function tryMath(question = "") {
  const match = question.replace(/x/gi, "*").match(/(-?\d+(?:\.\d+)?)\s*([+\-*/])\s*(-?\d+(?:\.\d+)?)/)
  if (!match) return null
  const left = Number(match[1])
  const op = match[2]
  const right = Number(match[3])
  const value = op === "+" ? left + right : op === "-" ? left - right : op === "*" ? left * right : right === 0 ? null : left / right
  return value === null ? "Cannot divide by zero." : `${left} ${op} ${right} = ${Number(value.toFixed(6)).toLocaleString("en-US")}`
}

function snapshotFromFeed(activeFeed = {}, result = {}) {
  const model = result?.result || {}
  return {
    title: activeFeed.title || model.title || "Active discovery",
    query: activeFeed.query || "",
    modelUrl: activeFeed.modelUrl || model.glbUrl || model.downloadUrl || "",
    previewImage: activeFeed.previewImage || model.image || "",
    source: activeFeed.source || activeFeed.sourceApi || result?.provider || "activeFeed",
    ready: Boolean(activeFeed.previewImage || model.image || activeFeed.modelUrl || model.glbUrl || model.downloadUrl)
  }
}

function buildSurfaces(activeFeed = {}, snapshot = {}, classifications = []) {
  const isMarket = classifications.includes("market-render") || activeFeed.category === "market"
  return [
    { name: "main blog feature", status: snapshot.ready ? "ready for feature visual" : "needs snapshot", action: `Feature ${snapshot.title} with activeFeed narration.` },
    { name: "library", status: snapshot.ready ? "visual identity ready" : "needs preview image", action: `Save ${activeFeed.category || "discovery"} under the matching library lane.` },
    { name: "examples", status: "ready for integration brief", action: "Generate a client-facing example that shows connect -> activeFeed -> renderer -> snapshot." },
    { name: "observatory renderer", status: activeFeed.modelUrl || snapshot.modelUrl ? "GLB route ready" : "metadata/fallback render", action: "Open the active discovery in the renderer and keep narration tied to activeFeed." },
    { name: "quick recent activity", status: "recording", action: "Show this question, answer, and snapshot as the newest discovery event." },
    { name: "market profile", status: isMarket ? "candles and technicals requested" : "available when symbol is active", action: "Preload candlestick chart, trend, EMA, previous high/low, gap, and liquidity sweep summary." }
  ]
}

function buildAnswer({ question, activeFeed = {}, result = {}, classifications, snapshot, mathAnswer }) {
  const title = activeFeed.title || snapshot.title || "this discovery"
  const codeStructure = "activeFeed stays the source of truth. The website should route discovery through Visual Resolver, Renderer, Snapshot, Blog, Library, Examples, Recent Activity, Backend Record, then Runner Answers."
  const glbFlow = "For a client multi-GLB project: connect or upload the GLBs, normalize each asset into activeFeed entries, render the selected GLB, create a reusable snapshot, then publish the same discovery into blog, library, examples, observatory recent activity, and backend history."
  const marketFlow = "For market rendering: request the symbol through activeFeed, load the live or fallback market profile, render candlestick bars, preload technicals, save the scan to history, and let runners answer follow-up questions from that packet."
  const excitement = `New discovery detected: ${title}. This is not just a search result; it is a reusable platform object.`
  const mathLine = mathAnswer ? `Math result: ${mathAnswer}` : ""

  const parts = [excitement]
  if (classifications.includes("basic-math")) parts.push(mathLine)
  if (classifications.includes("coding")) parts.push(`Developer answer: ${codeStructure}`)
  if (classifications.includes("advanced-structure")) parts.push("Advanced structure answer: keep route growth controlled and add shared discovery services only when they strengthen activeFeed, snapshots, history, or runner answers.")
  if (classifications.includes("multi-glb-client")) parts.push(glbFlow)
  if (classifications.includes("market-render")) parts.push(marketFlow)
  if (classifications.includes("snapshot-distribution")) parts.push("Snapshot answer: the active GLB snapshot should feed the main blog feature, library visual, examples preview, observatory renderer, quick recent activity, and share/SEO previews.")
  if (parts.length === 1) parts.push("Plain-language answer: ask naturally. DigitalHut should translate the question into the next discovery action and tell the user what code, content, or renderer surface should update.")

  return parts.filter(Boolean).join(" ")
}

export async function POST(req) {
  const body = await req.json()
  const question = String(body.question || "What should DigitalHut do with this discovery?").trim()
  const activeFeed = body.activeFeed || {}
  const result = body.result || null
  const classifications = classifyQuestion(question)
  const mathAnswer = tryMath(question)
  const snapshot = snapshotFromFeed(activeFeed, result)
  const surfaces = buildSurfaces(activeFeed, snapshot, classifications)
  const answer = buildAnswer({ question, activeFeed, result, classifications, snapshot, mathAnswer })
  const event = {
    type: "runner-discovery-answer",
    question,
    answer,
    classifications,
    activeFeed: {
      id: activeFeed.id || "",
      intent: activeFeed.intent || "",
      title: activeFeed.title || "",
      query: activeFeed.query || "",
      category: activeFeed.category || "",
      marketSymbols: activeFeed.marketSymbols || []
    },
    snapshot,
    surfaces,
    runner: "activeFeed-discovery-runner"
  }

  const history = await addHistory(event)
  return Response.json({ ok: true, answer, classifications, mathAnswer, snapshot, surfaces, history: history?.slice?.(0, 6) || [] })
}
