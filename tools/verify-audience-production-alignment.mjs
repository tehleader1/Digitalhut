import assert from "node:assert/strict"
import {execFileSync} from "node:child_process"
import {existsSync, readFileSync} from "node:fs"

const requiredFiles = [
  "api/audience-live.js",
  "api/_audience-snapshot.js",
  "api/insight-map.js",
  "supabase/migrations/20260714220000_digitalhut_pixel_event_idempotency.sql",
  "supabase/migrations/20260714224500_digitalhut_recorded_event_taxonomy.sql",
  "supabase/migrations/20260715012500_digitalhut_acquisition_landing_rollup.sql",
  "supabase/migrations/20260715022500_digitalhut_page_view_quality_rollup.sql",
  "supabase/migrations/20260715023500_digitalhut_page_view_quality_atomic_hotfix.sql",
  "supabase/migrations/20260715033000_digitalhut_preview_test_audience_split.sql"
]

for(const file of requiredFiles) assert.equal(existsSync(file), true, `missing audience alignment source: ${file}`)

const audience = readFileSync("api/audience-live.js", "utf8")
const insight = readFileSync("api/insight-map.js", "utf8")
const vercel = JSON.parse(readFileSync("vercel.json", "utf8"))

assert.match(audience, /res\.setHeader\("Cache-Control", "private, no-store, max-age=0"\)/)
assert.match(audience, /res\.setHeader\("CDN-Cache-Control", "no-store"\)/)
assert.match(audience, /res\.status\(200\)\.json\(\{ok: true/)
assert.match(audience, /readAudienceSnapshot\(\)/)
assert.match(insight, /digitalhut_search_pixel_acquisition_read/)
assert.match(insight, /acquisitionLandingRollup:/)
assert.match(insight, /res\.setHeader\("CDN-Cache-Control", "no-store"\)/)

const rewrites = Array.isArray(vercel.rewrites) ? vercel.rewrites : []
assert.equal(
  rewrites.some(rule => rule.source === "/api/audience-live" && rule.destination === "/index.html"),
  false,
  "audience-live must never rewrite to the SPA"
)
assert.ok(
  rewrites.some(rule => rule.source === "/api/(.*)" && rule.destination === "/api/$1"),
  "API passthrough rewrite is required"
)

const deployedSha = process.env.DIGITALHUT_DEPLOYED_SHA?.trim() || ""
let deployedSourceAligned = null
let deployedMissing = []
if(deployedSha){
  const git = process.env.DIGITALHUT_GIT || "git"
  deployedMissing = requiredFiles.filter(file => {
    try {
      execFileSync(git, ["cat-file", "-e", `${deployedSha}:${file}`], {stdio:"ignore", windowsHide:true})
      return false
    } catch {
      return true
    }
  })
  deployedSourceAligned = deployedMissing.length === 0
  assert.equal(deployedSourceAligned, true, `deployed source is missing: ${deployedMissing.join(", ")}`)
}

console.log(JSON.stringify({
  ok:true,
  checks:requiredFiles.length + 9,
  requiredFiles:requiredFiles.length,
  sourceReady:true,
  deployedSha:deployedSha || null,
  deployedSourceAligned,
  deployedMissing,
  productionDatabaseProofRequired:true,
  productionTransportProofRequired:true,
  truthBoundary:"Source readiness cannot promote audience ranks; production must expose JSON, exact no-store transport, live acquisition partitions, and the matching deployed source hash."
}, null, 2))
