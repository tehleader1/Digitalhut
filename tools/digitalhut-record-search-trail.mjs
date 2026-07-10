import {appendFileSync, mkdirSync, writeFileSync} from "node:fs"
import {dirname, join} from "node:path"
import {fileURLToPath} from "node:url"
import {seoOperatorSearchTrailForRun} from "../src/lib/seoSearchClaimEngine.js"

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const docsTrail = join(root, "docs", "digitalhut-operator-search-trail.jsonl")
const publicLatest = join(root, "public", "digitalhut-operator-search-trail-latest.json")
const args = process.argv.slice(2)

function argValue(name, fallback = ""){
  const prefix = `--${name}=`
  const found = args.find((item) => item.startsWith(prefix))
  return found ? found.slice(prefix.length) : fallback
}

const rawQueries = argValue("queries", "")
const queries = rawQueries
  ? rawQueries.split("||").map((item) => item.trim()).filter(Boolean)
  : [
    "full entertainment system dapp alternative to youtube with 3d model view podcast live analytics",
    "youtube session tool with 3d model view and podcast source moments",
    "game world glb presentation with live analytics",
    "research summary video with source backlinks and podcast moment"
  ]

const batch = {
  batchId: argValue("batch", `dh_operator_batch_${Date.now()}`),
  createdAt: new Date().toISOString(),
  purpose: argValue("purpose", "leave DigitalHut-owned return trail for Codex search cycle"),
  audience: argValue("audience", "full entertainment observatory"),
  source: argValue("source", "codex-search-cycle"),
  decision: argValue("decision", "trail-planted-watch-for-receipts"),
  receipts: queries.map((query, index) => seoOperatorSearchTrailForRun({
    runId: `${argValue("batch", "dh_operator_batch")}_${index + 1}`,
    query,
    audience: argValue("audience", "full entertainment observatory"),
    source: argValue("source", "codex-search-cycle"),
    decision: argValue("decision", "trail-planted-watch-for-receipts"),
    movement: {
      pageViewsDelta: Number(argValue("pageViewsDelta", "0")),
      uniqueVisitorsDelta: Number(argValue("uniqueVisitorsDelta", "0")),
      proofRouteOpens: Number(argValue("proofRouteOpens", "0")),
      sourceBacklinkOpens: Number(argValue("sourceBacklinkOpens", "0"))
    },
    nextAction: argValue("nextAction", "Compare the planted trail against Supabase and Search Console receipts before promoting or expanding the lane.")
  }))
}

mkdirSync(dirname(docsTrail), {recursive: true})
mkdirSync(dirname(publicLatest), {recursive: true})
appendFileSync(docsTrail, `${JSON.stringify(batch)}\n`, "utf8")
writeFileSync(publicLatest, `${JSON.stringify(batch, null, 2)}\n`, "utf8")
console.log(JSON.stringify({
  status: "operator-search-trail-recorded",
  batchId: batch.batchId,
  receipts: batch.receipts.length,
  lanes: [...new Set(batch.receipts.map((receipt) => receipt.claim.lane))],
  backlinkPlacements: batch.receipts.reduce((total, receipt) => total + (receipt.trail.regeneratedBacklinks?.placements?.length || 0), 0),
  docsTrail: "docs/digitalhut-operator-search-trail.jsonl",
  publicLatest: "public/digitalhut-operator-search-trail-latest.json"
}, null, 2))

