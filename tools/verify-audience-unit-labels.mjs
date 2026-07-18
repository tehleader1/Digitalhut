import assert from "node:assert/strict"
import {readFileSync} from "node:fs"

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")
const insights = read("src/pages/InsightsPage.jsx")
const systemProof = read("src/pages/SystemProofPage.jsx")
const standby = read("src/pages/StandbyRunnerPage.jsx")
const trust = read("src/pages/TrustPage.jsx")
const sourceBridge = read("src/pages/SourceBridgePage.jsx")
const library = read("src/pages/LibraryPage.jsx")
const watchProof = read("src/pages/WatchProofPage.jsx")
const platformBenchmarks = read("src/lib/platformStructureBenchmarks.js")
const crawlShellGenerator = read("tools/generate-route-crawl-shells.mjs")
const standbyRunner = read("tools/codex-standby-runner.mjs")
const llmsText = read("public/llms.txt")
const analyticsTerminal = read("src/lib/analyticsTerminal.js")
const audienceSnapshotApi = read("api/_audience-snapshot.js")
const historicalAudienceReceipts = JSON.parse(read("config/historical-audience-receipts.json"))
const pkg = JSON.parse(read("package.json"))
const cloud = read("cloudbuild.yaml")
const productionAcquisition = read("tools/verify-acquisition-landing-production.mjs")

assert.match(insights, /Participating client IDs/)
assert.match(insights, /<span>Recorded page views<\/span>[\s\S]{0,300}<span>Participating client IDs<\/span>[\s\S]{0,500}<span>Page sessions<\/span>/)
assert.match(insights, /human or autonomous-system classification is not established/)
assert.match(insights, /Page sessions/)
assert.match(insights, /const pageSessions = pageSessionValue\(acquisitionCoverage\.pageSessions\)/)
assert.match(insights, /pageSessionsReady \? pageSessions\.toLocaleString\(\) : "Unavailable"/)
assert.match(insights, /non-additive with participating client IDs/)
assert.match(insights, /freshDelta\.uniqueVisitors\)\.toLocaleString\(\)} participating client IDs/)
assert.doesNotMatch(insights, /freshDelta\.uniqueVisitors[\s\S]{0,120}people/)
assert.doesNotMatch(insights, /\["Unique visitors", pixel\.uniqueVisitors/)
assert.match(insights, /\/api\/insight-map\?client-demand=\$\{Date\.now\(\)\}/)
assert.doesNotMatch(insights, /\/api\/insight-map\?human-demand=/)
assert.match(insights, /conversion_source=client-demand-map/)
assert.doesNotMatch(insights, /conversion_source=human-demand-map/)
assert.match(systemProof, /Page sessions are unavailable in this compact proof response; these units are never added together/)
assert.match(systemProof, /aria-label="Three separate non-additive audience measurements"/)
assert.match(systemProof, /<span>Recorded page views<\/span>[\s\S]{0,300}<span>Participating client IDs<\/span>[\s\S]{0,400}<span>Page sessions<\/span><b>Unavailable<\/b>/)
assert.match(systemProof, /never inferred from client IDs/)
assert.doesNotMatch(systemProof, /totals\.uniqueVisitors[\s\S]{0,100} unique visitors currently support/)
assert.match(standby, /\["Participating client IDs", participatingClientIds \?\? "Unavailable"\]/)
assert.match(standby, /\["Recorded page views", recordedPageViews \?\? "Unavailable"\][\s\S]{0,180}\["Participating client IDs", participatingClientIds \?\? "Unavailable"\][\s\S]{0,180}\["Page sessions", pageSessions \?\? "Unavailable"\]/)
assert.match(standby, /\["Page sessions", pageSessions \?\? "Unavailable"\]/)
assert.doesNotMatch(standby, /\["Unique visitors", metrics\.uniqueVisitors\]/)
assert.match(standby, /pageViews: null,[\s\S]{0,80}uniqueVisitors: null,[\s\S]{0,80}pageSessions: null/)
assert.match(standby, /Audience totals are unavailable in this fallback packet/)
assert.doesNotMatch(standby, /pageViews: 225|uniqueVisitors: 72/)
assert.match(standby, /hasCurrentAudienceContract = metrics\.audienceContract\?\.nonAdditive === true && metrics\.audienceContract\?\.pageSessionsSource === "durable-acquisition-coverage"/)
assert.match(standby, /Historical standby snapshot excluded from current audience reporting/)
assert.doesNotMatch(standby, /const recordedPageViews = Number\.isInteger/)
assert.match(trust, /separate, non-additive units/)
assert.match(trust, /human-operated or autonomous-system clients; classification is not established/)
assert.match(trust, /same service and fairness protections/)
assert.match(sourceBridge, /new recorded page views and useful depth/)
assert.match(sourceBridge, /A participating client enters through a route/)
assert.match(library, /Participating Client Demand Map/)
assert.doesNotMatch(library, /Human Demand Map/)
assert.match(watchProof, /recorded page views/)
assert.match(watchProof, /Participating Client Demand Map/)
assert.doesNotMatch(watchProof, /Human Demand Map|Open human demand map/)
assert.match(platformBenchmarks, /recorded page views, participating client IDs, and page sessions separate and non-additive/)
assert.match(crawlShellGenerator, /DigitalHut Participating Client Demand Map: Interactive 3D Analytics/)
assert.match(crawlShellGenerator, /keeps recorded page views, participating client IDs, and page sessions separate/)
assert.doesNotMatch(crawlShellGenerator, /DigitalHut Human Demand Map|Open the Human Demand Map|what visitors notice/)
assert.match(crawlShellGenerator, /launchLane: "Participating Client Demand Analytics"/)
assert.doesNotMatch(crawlShellGenerator, /launchLane: "Human Demand Analytics"/)
assert.match(standbyRunner, /Page sessions: Unavailable in this last-known packet; never inferred from client IDs/)
assert.match(llmsText, /Recorded page views:[\s\S]{0,300}Participating client IDs:[\s\S]{0,400}Page sessions:/)
assert.doesNotMatch(llmsText, /Unique visitors:|Participating client IDs:\s*\d+/)
assert.match(analyticsTerminal, /recorded_page_views=.*participating_client_ids=.*page_sessions=/)
assert.match(analyticsTerminal, /page_sessions=\$\{audience\.pageSessions === null \|\| audience\.pageSessions === undefined \? "not-reported"/)
assert.doesNotMatch(analyticsTerminal, /site_page_views=.*pseudonymous_browser_ids=/)
assert.match(audienceSnapshotApi, /pageSessions: acquisitionReady \? pageSessions : null,[\s\S]{0,120}pageSessionUnit: "page-receipt-sessions",[\s\S]{0,120}pageSessionsReady: acquisitionReady/)
assert.match(audienceSnapshotApi, /nonPageOnlyPinnedSessions: acquisitionReady \? pinnedSessions - pageSessions : null/)
assert.doesNotMatch(audienceSnapshotApi, /pageSessions:\s*0/)
assert.equal(historicalAudienceReceipts.historicalSnapshot, true)
assert.equal(historicalAudienceReceipts.excludeFromCurrentAudienceAggregation, true)
assert.equal(historicalAudienceReceipts.currentAudienceContract.nonAdditive, true)
assert.match(historicalAudienceReceipts.currentAudienceContract.pageSessionsUnavailablePolicy, /Unavailable/)
assert.match(historicalAudienceReceipts.truthBoundary, /Only explicitly listed files are classified as historical/)
assert.deepEqual(historicalAudienceReceipts.coveredFiles.map((entry) => entry.path), ["public/digitalhut-standby-status.json"])
for(const entry of historicalAudienceReceipts.coveredFiles){
  const receipt = JSON.parse(read(entry.path))
  assert.equal(receipt.generatedAt, entry.capturedAt)
  assert.equal(entry.status, "historical-snapshot")
  assert.equal(entry.consumerGuard, "src/pages/StandbyRunnerPage.jsx")
}
assert.doesNotMatch(JSON.stringify(historicalAudienceReceipts), /digitalhut-\*\.json/)
assert.match(sourceBridge, /participating client session opening proof or source/)
assert.doesNotMatch(sourceBridge, /a visitor opening proof or source/)
assert.match(insights, /Non-preview recorded page views/)
assert.match(insights, /Preview\/test recorded page views/)
for(const legacy of [
  /DigitalHut Human Demand Map/,
  /See What People/,
  /human read/i,
  /People are reaching checkout/,
  /People are opening subscription details/,
  />Human Database</,
  /What human-candidate visitors selected or played/,
]) assert.doesNotMatch(insights, legacy)
assert.doesNotMatch(systemProof, />Human Demand</)
assert.doesNotMatch(systemProof, /Read human demand/)

const pageSessionValue = (value) => {
  if(value === null || value === undefined || value === "") return null
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null
}
for(const [input, expected] of [[{}, null], [null, null], ["", null], ["421", 421], [421, 421]]){
  const raw = typeof input === "object" && input !== null ? input.pageSessions : input
  assert.equal(pageSessionValue(raw), expected)
}
for(const source of [insights, systemProof, standby, trust, sourceBridge, library, watchProof, platformBenchmarks]){
  assert.doesNotMatch(source, /IDs\s*\+\s*sessions/i)
  assert.doesNotMatch(source, /unique people/i)
  assert.doesNotMatch(source, /verified systems/i)
}

for(const script of ["verify:predeploy", "verify:cloud", "verify:release"]){
  const command = pkg.scripts?.[script] || ""
  const acquisition = command.indexOf("verify-acquisition-landing-rollup.mjs")
  const quality = command.indexOf("verify-page-view-quality-rollup.mjs")
  assert.ok(acquisition >= 0 && quality > acquisition, `${script} must run page quality after acquisition`)
}
assert.match(cloud, /verify-acquisition-landing-rollup\.mjs\s+node tools\/verify-page-view-quality-rollup\.mjs/)

for(const field of [
  "recordedBrowserIds", "pageBearingBrowserIds", "pinnedSessions", "pageSessions",
  "firstLandingViews", "laterNavigationViews", "repeatedSameRouteViews",
  "viewsPerPinnedSession", "viewsPerPageSession"
]) assert.match(productionAcquisition, new RegExp(`coverage\\.${field}`), `production gate must verify coverage.${field}`)
assert.match(productionAcquisition, /firstLandingViews \+ laterNavigationViews \+ repeatedSameRouteViews, durablePageViews/)
assert.match(productionAcquisition, /rowFirstLandingViews \+ rowLaterNavigationViews \+ rowRepeatedSameRouteViews, rowPageViews/)
assert.match(productionAcquisition, /exactTwoDecimalRatio\(coverage\.viewsPerPinnedSession/)
assert.match(productionAcquisition, /exactTwoDecimalRatio\(coverage\.viewsPerPageSession/)

console.log(JSON.stringify({ok: true, checks: 108, explicitlyClassifiedHistoricalReceipts: historicalAudienceReceipts.coveredFiles.length, historicalStandbyConsumerGuarded: true, visibleAlias: "participating-client-ids", technicalUnit: "pseudonymous-browser-ids", pageSessionsAdditive: false, humanCountVerified: false, systemCountVerified: false}, null, 2))
