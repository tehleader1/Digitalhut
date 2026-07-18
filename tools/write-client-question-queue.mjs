import {mkdirSync, writeFileSync} from "node:fs"
import {dirname} from "node:path"

const site = "https://www.digitalhut.app"
const publicPath = "public/digitalhut-client-question-queue.json"
const docsPath = "docs/digitalhut-client-question-queue.md"

async function fetchJson(url, fallback = {}){
  try {
    const response = await fetch(url, {headers: {"cache-control": "no-cache"}})
    if(!response.ok) return {...fallback, fetchStatus: response.status}
    return await response.json()
  } catch (error) {
    return {...fallback, fetchError: error?.message || "fetch failed"}
  }
}

function fallbackQuestions(pixel = {}){
  const hints = pixel.topKeywordHints || []
  return hints.map((item) => ({
    question: item.value,
    helpLane: /glb|3d|game|horror|city/i.test(item.value) ? "3D Model View / GLB help" : /market|nvda|stock/i.test(item.value) ? "market observatory help" : "full entertainment observatory help",
    origin: "keyword-hint-rollup",
    path: "/",
    eventName: "keyword_hint",
    count: Number(item.count || 0),
    visitors: null,
    latest: "",
    status: "needs-helpful-answer",
    nextHelpfulAction: "Turn this hint into a useful answer that connects video, 3D Model View, podcast/source moment, and the next route."
  }))
}

const insight = await fetchJson(`${site}/api/insight-map?client-questions=${Date.now()}`)
const pixel = insight.pixel || {}
const liveQuestions = Array.isArray(pixel.liveClientQuestions) && pixel.liveClientQuestions.length
  ? pixel.liveClientQuestions
  : fallbackQuestions(pixel)

const report = {
  generatedAt: new Date().toISOString(),
  status: "client-question-queue-ready",
  site,
  purpose: "Track live client questions and searches so DigitalHut helps the audience instead of only counting page views.",
  guardrail: "This queue contains observed searches, keyword hints, and question-like events. It does not invent client questions.",
  currentRead: {
    pageViews: Number(pixel.totalPageViews || 0),
    uniqueVisitors: Number(pixel.uniqueVisitors || 0),
    totalEvents: Number(pixel.totalEvents || 0),
    searches: Number(pixel.totalSearchRuns || 0),
    proofRouteOpens: Number(pixel.totalProofRouteOpens || 0),
    sourceOpens: Number(pixel.totalSourceOpens || 0)
  },
  liveQuestions,
  unansweredCount: liveQuestions.filter((item) => item.status === "needs-helpful-answer").length,
  nextAction: liveQuestions.length
    ? "Use the first live question as the next helpful answer target; connect the answer to the video, GLB, podcast/source moment, and proof/source route."
    : "No live client question yet. Keep tracking search, keyword, proof, and source events."
}

const md = `# DigitalHut Client Question Queue

Generated: ${report.generatedAt}

Current read: ${report.currentRead.pageViews} page views, ${report.currentRead.uniqueVisitors} participating browser IDs, ${report.currentRead.searches} searches.

Unanswered questions: ${report.unansweredCount}

## Live Questions

${liveQuestions.length ? liveQuestions.map((item) => `- ${item.question}: ${item.helpLane}; ${item.status}; ${item.nextHelpfulAction}`).join("\n") : "- No live client question yet."}
`

mkdirSync(dirname(publicPath), {recursive: true})
mkdirSync(dirname(docsPath), {recursive: true})
writeFileSync(publicPath, `${JSON.stringify(report, null, 2)}\n`, "utf8")
writeFileSync(docsPath, md, "utf8")

console.log(JSON.stringify({
  ok: true,
  publicPath,
  docsPath,
  questions: liveQuestions.length,
  unansweredCount: report.unansweredCount,
  currentRead: report.currentRead,
  firstQuestion: liveQuestions[0] || null
}, null, 2))
