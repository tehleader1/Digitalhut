export const providerEvidenceChainVersion = "provider-evidence-chain-v1"

export const providerEvidenceUnits = Object.freeze({
  deployment: "immutable-production-deployment",
  searchPerformance: "search-performance",
  providerClicks: "provider-clicks",
  referralClicks: "referral-clicks",
  socialReferralClicks: "social-referral-clicks",
  attributedLandings: "attributed-landings",
  landing: "attributed-landing",
  qualifiedAction: "qualified-action",
  conversion: "provider-verified-conversion"
})

const dayMs = 24 * 60 * 60 * 1000
const acquisitionReceiptUnits = new Set([
  providerEvidenceUnits.searchPerformance,
  providerEvidenceUnits.providerClicks,
  providerEvidenceUnits.referralClicks,
  providerEvidenceUnits.socialReferralClicks,
  providerEvidenceUnits.attributedLandings
])
const settledConversionStates = new Set(["completed", "settled", "captured"])
const missingAttributionValues = new Set([
  "",
  "(direct)",
  "(none)",
  "(not set)",
  "direct",
  "none",
  "unknown",
  "unattributed"
])
const automatedActorClasses = new Set([
  "bot",
  "crawler",
  "generic-automation",
  "claimed-ai-llm-agent",
  "claimed-ai-llm-agent-signature"
])
const testActorClasses = new Set(["test", "preview", "synthetic"])

function objectValue(value){
  return value && typeof value === "object" && !Array.isArray(value) ? value : {}
}

function text(value){
  return typeof value === "string" ? value.trim() : ""
}

function lowerText(value){
  return text(value).toLowerCase()
}

function timestamp(value){
  if(typeof value !== "string" || !value.trim()) return null
  const result = Date.parse(value)
  return Number.isFinite(result) ? result : null
}

function numeric(value){
  const result = Number(value)
  return Number.isFinite(result) ? result : 0
}

function positivePolicyNumber(value, fallback){
  const result = Number(value)
  return Number.isFinite(result) && result > 0 ? result : fallback
}

function windowValue(value){
  const input = objectValue(value)
  const start = timestamp(input.start)
  const end = timestamp(input.end)
  return {start, end, valid: start !== null && end !== null && start < end}
}

function containsTime(window, value){
  return window.valid && value !== null && value >= window.start && value < window.end
}

function containsWindow(container, candidate){
  return container.valid && candidate.valid && candidate.start >= container.start && candidate.end <= container.end
}

function opaqueKey(value){
  const candidate = text(value)
  return candidate.length >= 8 && candidate.length <= 200
}

function validPath(value){
  const candidate = text(value)
  return candidate.startsWith("/")
    && candidate.length <= 700
    && !candidate.includes("\\")
    && !/(?:^|\/)\.\.?(?:\/|$)/.test(candidate)
}

function meaningfulAttribution(value){
  return !missingAttributionValues.has(lowerText(value))
}

function unique(values){
  return [...new Set(values.filter(Boolean))]
}

function exclusionReasons(value){
  const input = objectValue(value)
  const actorClass = lowerText(input.actorClass)
  const reasons = []
  if(input.test === true || input.preview === true || input.synthetic === true || testActorClasses.has(actorClass)){
    reasons.push("test-preview-or-synthetic")
  }
  if(input.internal === true || input.internalReportingJob === true || actorClass === "internal-reporting-job"){
    reasons.push("internal-reporting-job")
  }
  if(input.automated === true || automatedActorClasses.has(actorClass)){
    reasons.push("automation-or-bot")
  }
  return unique(reasons)
}

function linkResult(name, unit, missing, exclusions = []){
  const excludedMissing = exclusions.map((reason) => `${name}.excluded.${reason}`)
  const exactMissing = unique([...missing, ...excludedMissing])
  return {
    name,
    unit: text(unit) || "missing",
    satisfied: exactMissing.length === 0,
    missing: exactMissing,
    exclusions
  }
}

function providerAcquisitionSignal(receipt){
  const unit = lowerText(receipt.unit)
  const metrics = objectValue(receipt.metrics)
  if([
    providerEvidenceUnits.searchPerformance,
    providerEvidenceUnits.providerClicks,
    providerEvidenceUnits.referralClicks,
    providerEvidenceUnits.socialReferralClicks
  ].includes(unit)){
    return numeric(metrics.clicks) > 0
  }
  if(unit === providerEvidenceUnits.attributedLandings){
    return numeric(metrics.landings) > 0
  }
  return false
}

function providerUnitMissing(receipt){
  const unit = lowerText(receipt.unit)
  const metrics = objectValue(receipt.metrics)
  const missing = []
  if(!acquisitionReceiptUnits.has(unit)) missing.push("providerReceipt.compatible-acquisition-unit")
  if(unit === providerEvidenceUnits.searchPerformance && numeric(metrics.clicks) <= 0 && numeric(metrics.impressions) > 0){
    missing.push("providerReceipt.search-impressions-without-clicks")
  }
  const disallowedUnits = {
    "ga4-internal-events": "providerReceipt.ga4-internal-events-not-acquisition",
    "user-agent-claim": "providerReceipt.user-agent-claim-not-acquisition",
    "social-delivery": "providerReceipt.social-delivery-alone-not-acquisition",
    "pseudonymous-browser-id": "providerReceipt.pseudonymous-id-not-acquisition",
    "internal-reporting-job": "providerReceipt.internal-reporting-job-not-acquisition",
    "search-impressions": "providerReceipt.search-impressions-without-clicks"
  }
  if(disallowedUnits[unit]) missing.push(disallowedUnits[unit])
  if(!providerAcquisitionSignal(receipt)) missing.push("providerReceipt.positive-acquisition-signal")
  return unique(missing)
}

function exactMissing(links){
  return unique(links.flatMap((link) => link.missing))
}

function comparisonEvaluation({claimType, comparison, deployedAt, providerWindow}){
  if(claimType !== "rank-effect"){
    return linkResult("comparison", "not-required", [])
  }

  const input = objectValue(comparison)
  const mode = lowerText(input.mode)
  const missing = []
  if(input.testTrafficExcluded !== true) missing.push("comparison.test-traffic-excluded")
  if(input.automationExcluded !== true) missing.push("comparison.automation-excluded")
  if(input.internalJobsExcluded !== true) missing.push("comparison.internal-jobs-excluded")

  if(mode === "before-after"){
    const before = windowValue(input.before)
    const after = windowValue(input.after)
    if(!before.valid) missing.push("comparison.before-window")
    if(!after.valid) missing.push("comparison.after-window")
    if(before.valid && after.valid && before.end > after.start){
      missing.push("comparison.non-overlapping-before-after-windows")
    }
    if(before.valid && deployedAt !== null && before.end > deployedAt){
      missing.push("comparison.before-window-ends-before-deployment")
    }
    if(after.valid && deployedAt !== null && after.start < deployedAt){
      missing.push("comparison.after-window-starts-at-or-after-deployment")
    }
    if(after.valid && providerWindow.valid && !containsWindow(after, providerWindow)){
      missing.push("comparison.after-window-contains-provider-window")
    }
    return linkResult("comparison", "before-after", missing, exclusionReasons(input))
  }

  if(mode === "holdout"){
    const treatment = windowValue(input.treatment)
    const holdout = windowValue(input.holdout)
    if(!treatment.valid) missing.push("comparison.treatment-window")
    if(!holdout.valid) missing.push("comparison.holdout-window")
    if(treatment.valid && holdout.valid && (treatment.start !== holdout.start || treatment.end !== holdout.end)){
      missing.push("comparison.aligned-holdout-windows")
    }
    if(input.cohortsDisjoint !== true) missing.push("comparison.non-overlapping-holdout-cohorts")
    if(input.assignmentFinalized !== true) missing.push("comparison.finalized-holdout-assignment")
    if(!text(input.treatmentCohort) || !text(input.holdoutCohort) || text(input.treatmentCohort) === text(input.holdoutCohort)){
      missing.push("comparison.distinct-holdout-cohort-ids")
    }
    if(treatment.valid && providerWindow.valid && !containsWindow(treatment, providerWindow)){
      missing.push("comparison.treatment-window-contains-provider-window")
    }
    return linkResult("comparison", "holdout", missing, exclusionReasons(input))
  }

  missing.push("comparison.before-after-or-holdout-mode")
  return linkResult("comparison", mode || "missing", missing, exclusionReasons(input))
}

export function evaluateProviderEvidenceChain(value = {}){
  const input = objectValue(value)
  const policy = objectValue(input.policy)
  const maxReceiptAgeDays = positivePolicyNumber(policy.maxReceiptAgeDays, 3)
  const maxDataLagDays = positivePolicyNumber(policy.maxDataLagDays, 14)
  const evaluatedAt = timestamp(input.evaluatedAt)
  const claimType = ["acquisition-chain", "conversion-chain", "rank-effect"].includes(lowerText(input.claimType))
    ? lowerText(input.claimType)
    : "conversion-chain"

  const deployment = objectValue(input.deployment)
  const deployedAt = timestamp(deployment.deployedAt)
  const deploymentMissing = []
  if(lowerText(deployment.unit) !== providerEvidenceUnits.deployment) deploymentMissing.push("deployment.immutable-production-unit")
  if(!/^[a-f0-9]{40,64}$/i.test(text(deployment.sha))) deploymentMissing.push("deployment.immutable-sha")
  if(deployment.immutable !== true) deploymentMissing.push("deployment.immutable-attestation")
  if(lowerText(deployment.environment) !== "production") deploymentMissing.push("deployment.production-environment")
  if(deployedAt === null) deploymentMissing.push("deployment.deployed-at")
  if(deployment.test !== false) deploymentMissing.push("deployment.non-test-attestation")
  const deploymentLink = linkResult(
    "deployment",
    deployment.unit,
    deploymentMissing,
    exclusionReasons(deployment)
  )

  const providerReceipt = objectValue(input.providerReceipt)
  const providerWindow = windowValue(providerReceipt.window)
  const retrievedAt = timestamp(providerReceipt.retrievedAt)
  const dataThrough = timestamp(providerReceipt.dataThrough)
  const receiptAgeDays = evaluatedAt !== null && retrievedAt !== null ? (evaluatedAt - retrievedAt) / dayMs : null
  const dataLagDays = evaluatedAt !== null && dataThrough !== null ? (evaluatedAt - dataThrough) / dayMs : null
  const providerMissing = providerUnitMissing(providerReceipt)
  if(!text(providerReceipt.receiptId)) providerMissing.push("providerReceipt.receipt-id")
  if(!text(providerReceipt.providerFamily)) providerMissing.push("providerReceipt.provider-family")
  if(providerReceipt.external !== true) providerMissing.push("providerReceipt.external-provider")
  if(providerReceipt.providerVerified !== true) providerMissing.push("providerReceipt.provider-verified")
  if(providerReceipt.finalized !== true) providerMissing.push("providerReceipt.finalized")
  if(providerReceipt.test !== false) providerMissing.push("providerReceipt.non-test-attestation")
  if(providerReceipt.internal !== false) providerMissing.push("providerReceipt.non-internal-attestation")
  if(!providerWindow.valid) providerMissing.push("providerReceipt.finalized-window")
  if(evaluatedAt === null) providerMissing.push("evaluation.evaluated-at")
  if(retrievedAt === null || receiptAgeDays < 0 || receiptAgeDays > maxReceiptAgeDays){
    providerMissing.push("providerReceipt.fresh-retrieval")
  }
  if(dataThrough === null || dataLagDays < 0 || dataLagDays > maxDataLagDays){
    providerMissing.push("providerReceipt.fresh-data-through")
  }
  if(providerWindow.valid && dataThrough !== null && dataThrough < providerWindow.end){
    providerMissing.push("providerReceipt.data-finalized-through-window")
  }
  if(providerWindow.valid && deployedAt !== null && providerWindow.start < deployedAt){
    providerMissing.push("providerReceipt.post-deployment-window")
  }
  const providerReceiptLink = linkResult(
    "providerReceipt",
    providerReceipt.unit,
    providerMissing,
    exclusionReasons(providerReceipt)
  )

  const landing = objectValue(input.landingEvidence)
  const landingAt = timestamp(landing.observedAt)
  const landingMissing = []
  if(lowerText(landing.unit) !== providerEvidenceUnits.landing) landingMissing.push("landingEvidence.attributed-landing-unit")
  if(!meaningfulAttribution(landing.source)) landingMissing.push("landingEvidence.source")
  if(!meaningfulAttribution(landing.medium)) landingMissing.push("landingEvidence.medium")
  if(!validPath(landing.landingPath)) landingMissing.push("landingEvidence.landing-path")
  if(!text(providerReceipt.receiptId) || text(landing.providerReceiptId) !== text(providerReceipt.receiptId)){
    landingMissing.push("landingEvidence.provider-receipt-link")
  }
  if(!opaqueKey(landing.sessionJoinKey)) landingMissing.push("landingEvidence.same-session-join-key")
  if(landingAt === null) landingMissing.push("landingEvidence.observed-at")
  if(providerWindow.valid && !containsTime(providerWindow, landingAt)) landingMissing.push("landingEvidence.within-provider-window")
  if(deployedAt !== null && landingAt !== null && landingAt < deployedAt) landingMissing.push("landingEvidence.after-deployment")
  if(landing.test !== false) landingMissing.push("landingEvidence.non-test-attestation")
  if(landing.internal !== false) landingMissing.push("landingEvidence.non-internal-attestation")
  if(landing.automated !== false) landingMissing.push("landingEvidence.non-automated-attestation")
  const landingLink = linkResult(
    "landingEvidence",
    landing.unit,
    landingMissing,
    exclusionReasons(landing)
  )

  const action = objectValue(input.qualifiedAction)
  const actionAt = timestamp(action.occurredAt)
  const actionMissing = []
  if(lowerText(action.unit) !== providerEvidenceUnits.qualifiedAction) actionMissing.push("qualifiedAction.qualified-action-unit")
  if(!text(action.actionId)) actionMissing.push("qualifiedAction.action-id")
  if(action.qualified !== true) actionMissing.push("qualifiedAction.qualified-attestation")
  if(action.deduplicated !== true || !opaqueKey(action.dedupeKey)) actionMissing.push("qualifiedAction.deduplicated")
  if(!opaqueKey(action.sessionJoinKey) || text(action.sessionJoinKey) !== text(landing.sessionJoinKey)){
    actionMissing.push("qualifiedAction.same-session-landing-join")
  }
  if(actionAt === null) actionMissing.push("qualifiedAction.occurred-at")
  if(landingAt !== null && actionAt !== null && actionAt < landingAt) actionMissing.push("qualifiedAction.after-landing")
  if(providerWindow.valid && !containsTime(providerWindow, actionAt)) actionMissing.push("qualifiedAction.within-provider-window")
  if(action.test !== false) actionMissing.push("qualifiedAction.non-test-attestation")
  if(action.internal !== false) actionMissing.push("qualifiedAction.non-internal-attestation")
  if(action.automated !== false) actionMissing.push("qualifiedAction.non-automated-attestation")
  const actionLink = linkResult(
    "qualifiedAction",
    action.unit,
    actionMissing,
    exclusionReasons(action)
  )

  const conversion = objectValue(input.conversion)
  const conversionAt = timestamp(conversion.occurredAt)
  const conversionMissing = []
  if(lowerText(conversion.unit) !== providerEvidenceUnits.conversion) conversionMissing.push("conversion.provider-verified-conversion-unit")
  if(!text(conversion.conversionId)) conversionMissing.push("conversion.conversion-id")
  if(!text(conversion.providerFamily)) conversionMissing.push("conversion.provider-family")
  if(conversion.externalProvider !== true) conversionMissing.push("conversion.external-provider")
  if(conversion.providerVerified !== true) conversionMissing.push("conversion.provider-verified")
  if(conversion.finalized !== true) conversionMissing.push("conversion.finalized")
  if(!settledConversionStates.has(lowerText(conversion.status))) conversionMissing.push("conversion.settled-status")
  if(conversion.deduplicated !== true || !opaqueKey(conversion.dedupeKey)) conversionMissing.push("conversion.deduplicated")
  if(!opaqueKey(conversion.sessionJoinKey) || text(conversion.sessionJoinKey) !== text(action.sessionJoinKey)){
    conversionMissing.push("conversion.same-session-action-join")
  }
  if(conversionAt === null) conversionMissing.push("conversion.occurred-at")
  if(actionAt !== null && conversionAt !== null && conversionAt < actionAt) conversionMissing.push("conversion.after-qualified-action")
  if(evaluatedAt !== null && conversionAt !== null && conversionAt > evaluatedAt) conversionMissing.push("conversion.not-in-future")
  if(conversion.refunded === true) conversionMissing.push("conversion.not-refunded")
  if(conversion.reversed === true) conversionMissing.push("conversion.not-reversed")
  if(conversion.test !== false) conversionMissing.push("conversion.non-test-attestation")
  if(conversion.internal !== false) conversionMissing.push("conversion.non-internal-attestation")
  if(conversion.automated !== false) conversionMissing.push("conversion.non-automated-attestation")
  const conversionLink = linkResult(
    "conversion",
    conversion.unit,
    conversionMissing,
    exclusionReasons(conversion)
  )

  const comparisonLink = comparisonEvaluation({
    claimType,
    comparison: input.comparison,
    deployedAt,
    providerWindow
  })

  const links = {
    deployment: deploymentLink,
    providerReceipt: providerReceiptLink,
    landingEvidence: landingLink,
    qualifiedAction: actionLink,
    conversion: conversionLink,
    comparison: comparisonLink
  }
  const probableLinks = [deploymentLink, providerReceiptLink, landingLink, actionLink]
  const confirmedLinks = [...probableLinks, conversionLink]
  const chainProbable = probableLinks.every((link) => link.satisfied)
  const chainConfirmed = confirmedLinks.every((link) => link.satisfied)
  const comparisonRequired = claimType === "rank-effect"
  const comparisonSatisfied = !comparisonRequired || comparisonLink.satisfied
  const probableEligible = chainProbable && comparisonSatisfied
  const confirmedEligible = chainConfirmed && comparisonSatisfied
  const chainGrade = chainConfirmed ? "Confirmed" : chainProbable ? "Probable" : "Unknown"
  const evidenceGrade = confirmedEligible ? "Confirmed" : probableEligible ? "Probable" : "Unknown"
  const probableRequired = comparisonRequired ? [...probableLinks, comparisonLink] : probableLinks
  const confirmedRequired = comparisonRequired ? [...confirmedLinks, comparisonLink] : confirmedLinks

  const unitChecks = [
    {
      id: "deployment-to-provider-window",
      compatible: lowerText(deployment.unit) === providerEvidenceUnits.deployment
        && acquisitionReceiptUnits.has(lowerText(providerReceipt.unit))
        && providerWindow.valid
        && deployedAt !== null
        && providerWindow.start >= deployedAt
    },
    {
      id: "provider-receipt-to-attributed-landing",
      compatible: providerAcquisitionSignal(providerReceipt)
        && lowerText(landing.unit) === providerEvidenceUnits.landing
        && text(landing.providerReceiptId) === text(providerReceipt.receiptId)
        && meaningfulAttribution(landing.source)
        && meaningfulAttribution(landing.medium)
        && containsTime(providerWindow, landingAt)
    },
    {
      id: "attributed-landing-to-qualified-action",
      compatible: lowerText(landing.unit) === providerEvidenceUnits.landing
        && lowerText(action.unit) === providerEvidenceUnits.qualifiedAction
        && opaqueKey(landing.sessionJoinKey)
        && text(landing.sessionJoinKey) === text(action.sessionJoinKey)
        && landingAt !== null
        && actionAt !== null
        && actionAt >= landingAt
        && action.qualified === true
        && action.deduplicated === true
    },
    {
      id: "qualified-action-to-provider-conversion",
      compatible: lowerText(action.unit) === providerEvidenceUnits.qualifiedAction
        && lowerText(conversion.unit) === providerEvidenceUnits.conversion
        && opaqueKey(action.sessionJoinKey)
        && text(action.sessionJoinKey) === text(conversion.sessionJoinKey)
        && actionAt !== null
        && conversionAt !== null
        && conversionAt >= actionAt
        && conversion.providerVerified === true
        && conversion.deduplicated === true
    },
    {
      id: "rank-comparison-window",
      compatible: !comparisonRequired || comparisonLink.satisfied
    }
  ]

  const excluded = Object.values(links)
    .filter((link) => link.exclusions.length)
    .map((link) => ({link: link.name, reasons: link.exclusions}))

  return {
    contractVersion: providerEvidenceChainVersion,
    claimType,
    evidenceGrade,
    chainGrade,
    gradeScope: "evidence-chain-completeness-not-causation-human-identity-or-revenue",
    links,
    missingLinks: exactMissing(confirmedRequired),
    gradeEligibility: {
      Unknown: {eligible: true, missingLinks: []},
      Probable: {eligible: probableEligible, missingLinks: exactMissing(probableRequired)},
      Confirmed: {eligible: confirmedEligible, missingLinks: exactMissing(confirmedRequired)}
    },
    unitCompatibility: {
      compatible: unitChecks.every((check) => check.compatible),
      checks: unitChecks,
      incompatible: unitChecks.filter((check) => !check.compatible).map((check) => check.id)
    },
    automationTestExclusions: {
      required: true,
      applied: excluded.length > 0,
      excluded
    },
    sameSessionJoin: {
      landingToAction: opaqueKey(landing.sessionJoinKey) && text(landing.sessionJoinKey) === text(action.sessionJoinKey),
      actionToConversion: opaqueKey(action.sessionJoinKey) && text(action.sessionJoinKey) === text(conversion.sessionJoinKey),
      createsIdentity: false
    },
    windowEvaluation: {
      maxReceiptAgeDays,
      maxDataLagDays,
      receiptAgeDays: receiptAgeDays === null ? null : Number(receiptAgeDays.toFixed(3)),
      dataLagDays: dataLagDays === null ? null : Number(dataLagDays.toFixed(3)),
      providerWindowValid: providerWindow.valid,
      comparisonRequired,
      comparisonValid: comparisonSatisfied
    },
    rankEffectEligibility: {
      requested: comparisonRequired,
      eligible: comparisonRequired && probableEligible,
      comparisonMode: comparisonLink.unit
    },
    provesCausation: false,
    verifiesHumanIdentity: false,
    provesRevenue: false,
    countsAsRevenue: false,
    pseudonymousIdsArePeople: false,
    userAgentClaimsSatisfyAcquisitionOrConversion: false,
    searchImpressionsWithoutClicksSatisfyAcquisitionOrConversion: false,
    ga4InternalEventsSatisfyAcquisitionOrConversion: false,
    socialDeliveryAloneSatisfiesAcquisitionOrConversion: false,
    internalReportingJobsSatisfyAcquisitionOrConversion: false
  }
}
