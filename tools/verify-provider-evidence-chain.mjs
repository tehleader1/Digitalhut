import assert from "node:assert/strict"
import {
  evaluateProviderEvidenceChain,
  providerEvidenceChainVersion,
  providerEvidenceUnits
} from "../src/lib/providerEvidenceChain.js"

let checked = 0
const check = (condition, message) => {
  checked += 1
  assert.ok(condition, message)
}

const clone = value => structuredClone(value)
const hasMissing = (result, value) => result.missingLinks.includes(value)
const compatibility = (result, id) => result.unitCompatibility.checks.find((check) => check.id === id)?.compatible

const completeChain = {
  evaluatedAt: "2026-07-24T12:00:00.000Z",
  claimType: "rank-effect",
  policy: {maxReceiptAgeDays: 3, maxDataLagDays: 14},
  deployment: {
    unit: providerEvidenceUnits.deployment,
    sha: "a".repeat(40),
    immutable: true,
    environment: "production",
    deployedAt: "2026-07-15T00:00:00.000Z",
    test: false,
    internal: false
  },
  providerReceipt: {
    unit: providerEvidenceUnits.searchPerformance,
    receiptId: "gsc-window-20260716-20260723",
    providerFamily: "google-search-console",
    external: true,
    providerVerified: true,
    finalized: true,
    test: false,
    internal: false,
    retrievedAt: "2026-07-24T10:00:00.000Z",
    dataThrough: "2026-07-23T00:00:00.000Z",
    window: {
      start: "2026-07-16T00:00:00.000Z",
      end: "2026-07-23T00:00:00.000Z"
    },
    metrics: {impressions: 1200, clicks: 24}
  },
  landingEvidence: {
    unit: providerEvidenceUnits.landing,
    providerReceiptId: "gsc-window-20260716-20260723",
    source: "google",
    medium: "organic",
    landingPath: "/watch/provider-evidence-chain",
    sessionJoinKey: "session_join_0123456789",
    observedAt: "2026-07-18T10:00:00.000Z",
    test: false,
    internal: false,
    automated: false
  },
  qualifiedAction: {
    unit: providerEvidenceUnits.qualifiedAction,
    actionId: "action-proof-open-1",
    qualified: true,
    deduplicated: true,
    dedupeKey: "action_dedupe_0123456789",
    sessionJoinKey: "session_join_0123456789",
    occurredAt: "2026-07-18T10:05:00.000Z",
    test: false,
    internal: false,
    automated: false
  },
  conversion: {
    unit: providerEvidenceUnits.conversion,
    conversionId: "provider-conversion-1",
    providerFamily: "paypal",
    externalProvider: true,
    providerVerified: true,
    finalized: true,
    status: "settled",
    deduplicated: true,
    dedupeKey: "conversion_dedupe_0123456789",
    sessionJoinKey: "session_join_0123456789",
    occurredAt: "2026-07-18T10:10:00.000Z",
    refunded: false,
    reversed: false,
    test: false,
    internal: false,
    automated: false
  },
  comparison: {
    mode: "before-after",
    before: {
      start: "2026-07-07T00:00:00.000Z",
      end: "2026-07-14T00:00:00.000Z"
    },
    after: {
      start: "2026-07-16T00:00:00.000Z",
      end: "2026-07-24T00:00:00.000Z"
    },
    testTrafficExcluded: true,
    automationExcluded: true,
    internalJobsExcluded: true,
    test: false,
    internal: false,
    automated: false
  }
}

function boundaryChecks(result, label){
  check(result.contractVersion === providerEvidenceChainVersion, `${label}: contract version mismatch`)
  check(["Unknown", "Probable", "Confirmed"].includes(result.evidenceGrade), `${label}: unsupported evidence grade`)
  check(result.provesCausation === false, `${label}: evidence chain must not prove causation`)
  check(result.verifiesHumanIdentity === false, `${label}: evidence chain must not verify a human`)
  check(result.provesRevenue === false && result.countsAsRevenue === false, `${label}: conversion must not become revenue`)
  check(result.pseudonymousIdsArePeople === false, `${label}: pseudonymous IDs must not become people`)
  check(result.userAgentClaimsSatisfyAcquisitionOrConversion === false, `${label}: UA claim boundary missing`)
  check(result.searchImpressionsWithoutClicksSatisfyAcquisitionOrConversion === false, `${label}: impression boundary missing`)
  check(result.ga4InternalEventsSatisfyAcquisitionOrConversion === false, `${label}: GA4 internal boundary missing`)
  check(result.socialDeliveryAloneSatisfiesAcquisitionOrConversion === false, `${label}: social delivery boundary missing`)
  check(result.internalReportingJobsSatisfyAcquisitionOrConversion === false, `${label}: internal job boundary missing`)
  check(result.sameSessionJoin.createsIdentity === false, `${label}: same-session join must not create identity`)
}

const complete = evaluateProviderEvidenceChain(completeChain)
check(complete.evidenceGrade === "Confirmed", "complete chain should be Confirmed eligible")
check(complete.chainGrade === "Confirmed", "complete chain grade mismatch")
check(complete.missingLinks.length === 0, "complete chain must have no missing links")
check(complete.gradeEligibility.Probable.eligible === true, "complete chain should retain Probable eligibility")
check(complete.gradeEligibility.Confirmed.eligible === true, "complete chain should be Confirmed eligible")
check(complete.unitCompatibility.compatible === true, "complete chain units must be compatible")
check(complete.rankEffectEligibility.eligible === true, "complete comparison should be rank-effect eligible")
check(complete.windowEvaluation.comparisonValid === true, "complete comparison window should be valid")
check(complete.automationTestExclusions.applied === false, "complete chain should not contain excluded evidence")
boundaryChecks(complete, "complete")

const conversionOnlyClaim = clone(completeChain)
conversionOnlyClaim.claimType = "conversion-chain"
delete conversionOnlyClaim.comparison
const conversionOnly = evaluateProviderEvidenceChain(conversionOnlyClaim)
check(conversionOnly.evidenceGrade === "Confirmed", "non-rank complete chain should not require comparison")
check(conversionOnly.links.comparison.satisfied === true, "non-rank comparison should be not-required")
check(conversionOnly.rankEffectEligibility.requested === false, "non-rank chain must not claim rank effect")
boundaryChecks(conversionOnly, "conversion-only")

const impressionsOnlyInput = clone(completeChain)
impressionsOnlyInput.providerReceipt.metrics = {impressions: 1200, clicks: 0}
const impressionsOnly = evaluateProviderEvidenceChain(impressionsOnlyInput)
check(impressionsOnly.evidenceGrade === "Unknown", "Search Console impressions without clicks must remain Unknown")
check(hasMissing(impressionsOnly, "providerReceipt.search-impressions-without-clicks"), "impressions-only missing link absent")
check(hasMissing(impressionsOnly, "providerReceipt.positive-acquisition-signal"), "impressions-only acquisition gate absent")
check(compatibility(impressionsOnly, "provider-receipt-to-attributed-landing") === false, "impressions must not link to landing")
boundaryChecks(impressionsOnly, "impressions-only")

for(const [label, unit, metrics, missing] of [
  ["ga4-internal", "ga4-internal-events", {events: 99}, "providerReceipt.ga4-internal-events-not-acquisition"],
  ["user-agent-claim", "user-agent-claim", {events: 1}, "providerReceipt.user-agent-claim-not-acquisition"],
  ["social-delivery", "social-delivery", {deliveries: 500}, "providerReceipt.social-delivery-alone-not-acquisition"],
  ["pseudonymous-id", "pseudonymous-browser-id", {ids: 20}, "providerReceipt.pseudonymous-id-not-acquisition"],
  ["internal-report", "internal-reporting-job", {runs: 2}, "providerReceipt.internal-reporting-job-not-acquisition"]
]){
  const input = clone(completeChain)
  input.providerReceipt.unit = unit
  input.providerReceipt.metrics = metrics
  const result = evaluateProviderEvidenceChain(input)
  check(result.evidenceGrade === "Unknown", `${label}: non-qualifying signal must remain Unknown`)
  check(hasMissing(result, missing), `${label}: exact missing link absent`)
  check(result.gradeEligibility.Probable.eligible === false, `${label}: non-qualifying signal must not reach Probable`)
  check(result.gradeEligibility.Confirmed.eligible === false, `${label}: non-qualifying signal must not reach Confirmed`)
  boundaryChecks(result, label)
}

const mixedUnitsInput = clone(completeChain)
mixedUnitsInput.providerReceipt.unit = "search-impressions"
mixedUnitsInput.landingEvidence.unit = "page-view"
mixedUnitsInput.qualifiedAction.unit = "session"
mixedUnitsInput.conversion.unit = "client-conversion-event"
const mixedUnits = evaluateProviderEvidenceChain(mixedUnitsInput)
check(mixedUnits.evidenceGrade === "Unknown", "mixed units must remain Unknown")
check(mixedUnits.unitCompatibility.compatible === false, "mixed units must be incompatible")
for(const id of [
  "deployment-to-provider-window",
  "provider-receipt-to-attributed-landing",
  "attributed-landing-to-qualified-action",
  "qualified-action-to-provider-conversion"
]){
  check(mixedUnits.unitCompatibility.incompatible.includes(id), `mixed units missing incompatibility: ${id}`)
}
boundaryChecks(mixedUnits, "mixed-units")

const overlappingInput = clone(completeChain)
overlappingInput.comparison.before.end = "2026-07-18T00:00:00.000Z"
overlappingInput.comparison.after.start = "2026-07-17T00:00:00.000Z"
const overlapping = evaluateProviderEvidenceChain(overlappingInput)
check(overlapping.chainGrade === "Confirmed", "overlapping comparison must not erase complete chain")
check(overlapping.evidenceGrade === "Unknown", "overlapping rank windows must block rank-effect grade")
check(hasMissing(overlapping, "comparison.non-overlapping-before-after-windows"), "overlap missing link absent")
check(overlapping.rankEffectEligibility.eligible === false, "overlapping windows must block rank effect")
boundaryChecks(overlapping, "overlapping-windows")

const validHoldoutInput = clone(completeChain)
validHoldoutInput.comparison = {
  mode: "holdout",
  treatment: {
    start: "2026-07-16T00:00:00.000Z",
    end: "2026-07-24T00:00:00.000Z"
  },
  holdout: {
    start: "2026-07-16T00:00:00.000Z",
    end: "2026-07-24T00:00:00.000Z"
  },
  treatmentCohort: "treatment-a",
  holdoutCohort: "holdout-b",
  cohortsDisjoint: true,
  assignmentFinalized: true,
  testTrafficExcluded: true,
  automationExcluded: true,
  internalJobsExcluded: true,
  test: false,
  internal: false,
  automated: false
}
const validHoldout = evaluateProviderEvidenceChain(validHoldoutInput)
check(validHoldout.evidenceGrade === "Confirmed", "valid disjoint holdout should retain Confirmed eligibility")
check(validHoldout.links.comparison.unit === "holdout", "holdout mode missing")
check(validHoldout.rankEffectEligibility.eligible === true, "valid holdout should support rank-effect eligibility")
boundaryChecks(validHoldout, "valid-holdout")

const invalidHoldoutInput = clone(validHoldoutInput)
invalidHoldoutInput.comparison.cohortsDisjoint = false
invalidHoldoutInput.comparison.holdoutCohort = "treatment-a"
const invalidHoldout = evaluateProviderEvidenceChain(invalidHoldoutInput)
check(invalidHoldout.evidenceGrade === "Unknown", "overlapping holdout cohorts must block rank effect")
check(hasMissing(invalidHoldout, "comparison.non-overlapping-holdout-cohorts"), "holdout overlap missing link absent")
check(hasMissing(invalidHoldout, "comparison.distinct-holdout-cohort-ids"), "holdout cohort ID missing link absent")
boundaryChecks(invalidHoldout, "invalid-holdout")

const staleInput = clone(completeChain)
staleInput.providerReceipt.retrievedAt = "2026-07-18T00:00:00.000Z"
staleInput.providerReceipt.dataThrough = "2026-07-01T00:00:00.000Z"
const stale = evaluateProviderEvidenceChain(staleInput)
check(stale.evidenceGrade === "Unknown", "stale receipt must remain Unknown")
check(hasMissing(stale, "providerReceipt.fresh-retrieval"), "stale retrieval missing link absent")
check(hasMissing(stale, "providerReceipt.fresh-data-through"), "stale data-through missing link absent")
check(hasMissing(stale, "providerReceipt.data-finalized-through-window"), "unfinalized receipt window missing link absent")
boundaryChecks(stale, "stale")

for(const [label, source, medium, missing] of [
  ["missing-source", "", "organic", "landingEvidence.source"],
  ["unknown-source", "unknown", "organic", "landingEvidence.source"],
  ["missing-medium", "google", "", "landingEvidence.medium"],
  ["none-medium", "google", "(none)", "landingEvidence.medium"]
]){
  const input = clone(completeChain)
  input.landingEvidence.source = source
  input.landingEvidence.medium = medium
  const result = evaluateProviderEvidenceChain(input)
  check(result.evidenceGrade === "Unknown", `${label}: missing attribution must remain Unknown`)
  check(hasMissing(result, missing), `${label}: exact attribution link missing`)
  check(compatibility(result, "provider-receipt-to-attributed-landing") === false, `${label}: source unit must be incompatible`)
  boundaryChecks(result, label)
}

const botInput = clone(completeChain)
botInput.qualifiedAction.automated = true
botInput.qualifiedAction.actorClass = "crawler"
const bot = evaluateProviderEvidenceChain(botInput)
check(bot.evidenceGrade === "Unknown", "bot action must not satisfy chain")
check(hasMissing(bot, "qualifiedAction.excluded.automation-or-bot"), "bot exclusion missing")
check(bot.automationTestExclusions.applied === true, "bot exclusion receipt missing")
boundaryChecks(bot, "bot")

const testInput = clone(completeChain)
testInput.conversion.test = true
testInput.conversion.actorClass = "test"
const testConversion = evaluateProviderEvidenceChain(testInput)
check(testConversion.evidenceGrade === "Probable", "test conversion must leave only the pre-conversion chain Probable")
check(testConversion.gradeEligibility.Confirmed.eligible === false, "test conversion must not confirm chain")
check(hasMissing(testConversion, "conversion.excluded.test-preview-or-synthetic"), "test conversion exclusion missing")
boundaryChecks(testConversion, "test-conversion")

const internalJobInput = clone(completeChain)
internalJobInput.landingEvidence.internal = true
internalJobInput.landingEvidence.internalReportingJob = true
internalJobInput.landingEvidence.actorClass = "internal-reporting-job"
const internalJob = evaluateProviderEvidenceChain(internalJobInput)
check(internalJob.evidenceGrade === "Unknown", "internal reporting job must not satisfy acquisition")
check(hasMissing(internalJob, "landingEvidence.excluded.internal-reporting-job"), "internal job exclusion missing")
boundaryChecks(internalJob, "internal-job")

const joinMismatchInput = clone(completeChain)
joinMismatchInput.qualifiedAction.sessionJoinKey = "different_session_join_1"
const joinMismatch = evaluateProviderEvidenceChain(joinMismatchInput)
check(joinMismatch.evidenceGrade === "Unknown", "same-session mismatch must remain Unknown")
check(hasMissing(joinMismatch, "qualifiedAction.same-session-landing-join"), "landing/action join missing link absent")
check(compatibility(joinMismatch, "attributed-landing-to-qualified-action") === false, "landing/action mismatch must be incompatible")
check(joinMismatch.sameSessionJoin.landingToAction === false, "landing/action mismatch should be explicit")
boundaryChecks(joinMismatch, "join-mismatch")

const duplicateActionInput = clone(completeChain)
duplicateActionInput.qualifiedAction.deduplicated = false
const duplicateAction = evaluateProviderEvidenceChain(duplicateActionInput)
check(duplicateAction.evidenceGrade === "Unknown", "non-deduplicated action must remain Unknown")
check(hasMissing(duplicateAction, "qualifiedAction.deduplicated"), "action dedupe missing link absent")
boundaryChecks(duplicateAction, "duplicate-action")

for(const state of ["refunded", "reversed"]){
  const input = clone(completeChain)
  input.conversion[state] = true
  const result = evaluateProviderEvidenceChain(input)
  check(result.chainGrade === "Probable", `${state}: reversed conversion must leave Probable chain`)
  check(result.evidenceGrade === "Probable", `${state}: reversed conversion must not be Confirmed`)
  check(hasMissing(result, `conversion.not-${state}`), `${state}: exact reversal missing link absent`)
  check(result.gradeEligibility.Confirmed.eligible === false, `${state}: Confirmed eligibility must be false`)
  boundaryChecks(result, `conversion-${state}`)
}

const pendingConversionInput = clone(completeChain)
pendingConversionInput.conversion.status = "pending"
pendingConversionInput.conversion.finalized = false
const pendingConversion = evaluateProviderEvidenceChain(pendingConversionInput)
check(pendingConversion.evidenceGrade === "Probable", "pending conversion should leave Probable chain")
check(hasMissing(pendingConversion, "conversion.finalized"), "pending conversion finalized link missing")
check(hasMissing(pendingConversion, "conversion.settled-status"), "pending conversion status link missing")
boundaryChecks(pendingConversion, "pending-conversion")

const missingEvaluatedAtInput = clone(completeChain)
delete missingEvaluatedAtInput.evaluatedAt
const missingEvaluatedAt = evaluateProviderEvidenceChain(missingEvaluatedAtInput)
check(missingEvaluatedAt.evidenceGrade === "Unknown", "missing deterministic evaluation time must remain Unknown")
check(hasMissing(missingEvaluatedAt, "evaluation.evaluated-at"), "evaluation timestamp missing link absent")
boundaryChecks(missingEvaluatedAt, "missing-evaluated-at")

const empty = evaluateProviderEvidenceChain()
check(empty.evidenceGrade === "Unknown", "empty chain must remain Unknown")
check(empty.gradeEligibility.Probable.eligible === false, "empty chain must not be Probable")
check(empty.gradeEligibility.Confirmed.eligible === false, "empty chain must not be Confirmed")
check(empty.missingLinks.length >= 20, "empty chain should expose exact missing links")
boundaryChecks(empty, "empty")

console.log(JSON.stringify({
  ok: true,
  checked,
  contractVersion: providerEvidenceChainVersion,
  completeGrade: complete.evidenceGrade,
  supportedGrades: ["Unknown", "Probable", "Confirmed"],
  completeMissingLinks: complete.missingLinks.length,
  provesCausation: false,
  verifiesHumanIdentity: false,
  provesRevenue: false
}, null, 2))
