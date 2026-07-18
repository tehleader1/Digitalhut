import assert from "node:assert/strict"
import fs from "node:fs"

const contract = JSON.parse(fs.readFileSync(new URL("../config/digitalhut-social-operations.json", import.meta.url), "utf8"))
let checks = 0
const ok = (value, message) => { assert.ok(value, message); checks += 1 }

ok(contract.defaultMode === "bounded-automatic", "owner-authorized automation is bounded")
ok(contract.standingOwnerApproval.enabled === true, "standing owner approval recorded")
ok(contract.standingOwnerApproval.privateBrowsingOrConversationSurveillanceForbidden === true, "private surveillance forbidden")
ok(contract.standingOwnerApproval.unfinishedWorkIsNotPublishable === true, "unfinished work excluded")
ok(contract.audienceProblemGate.requiredForAutomaticPublishing === true, "automatic posts require an audience problem")
ok(contract.audienceProblemGate["developer-centered-releaseNoteAloneIsPublishable"] === false, "developer-only updates are quarantined")
ok(contract.audienceProblemGate.requiredFields.includes("concrete-digitalhut-solution"), "posts require a concrete solution")
ok(contract.economicValueGate.financialOutcomeRequiresIndependentReceipt === true, "financial outcomes require receipts")
ok(contract.economicValueGate.unprovenFinancialOutcomeMustNotBeClaimed === true, "unproven ROI is forbidden")
ok(contract.publicDrawerRequiresLogin === false, "public drawer remains free")
ok(contract.operatorConsoleRequiresServerSession === true, "operator console requires server session")
ok(contract.googleProfileAloneAuthorizesPublishing === false, "Google profile is not publishing authority")
ok(contract.platformOAuthRequiredPerAccount === true, "each social account requires OAuth")
ok(contract.organization.organizationId === "digitalhut-app", "single DigitalHut organization")
ok(contract.organization.primaryOwnerEmail === "developer-anthony@digitalhut.app", "owner identity pinned")
ok(contract.organization.ownerEmailIsPublishingAuthorityByItself === false, "owner email still needs server authorization")
ok(contract.organization.accountOwnershipModel === "organization-owned-integrations", "main accounts belong to organization")
ok(contract.organization.collaboratorModel === "scoped-role-membership", "collaborators receive scoped roles")
ok(contract.organization.sharedMasterCredentialAllowed === false, "shared master credential forbidden")
for(const integrationClass of ["social", "database", "cloudAndRelease"]){
  ok(Boolean(contract.integrationClasses[integrationClass]), `${integrationClass} integration class exists`)
  ok(contract.integrationClasses[integrationClass].credentialStorage.includes("server"), `${integrationClass} credentials remain server-side`)
}
ok(contract.accessRoles.length === 6, "six explicit roles")
ok(new Set(contract.accessRoles.map((role) => role.id)).size === contract.accessRoles.length, "roles unique")
ok(contract.automationStages[0] === "off", "first stage off")
ok(contract.automationStages.includes("approval-required"), "approval stage exists")
ok(contract.automationStages.includes("bounded-automatic"), "bounded automation exists")
ok(contract.automationStages.includes("paused"), "pause stage exists")
ok(contract.publishingFeatures.length >= 15, "complete publishing feature inventory")
ok(contract.communityFeatures.length >= 7, "community operations represented")
for(const family of ["account", "distribution", "engagement", "traffic", "continuation", "commercial", "operations"]){
  ok(Array.isArray(contract.metricFamilies[family]) && contract.metricFamilies[family].length > 0, `${family} metrics exist`)
}
ok(contract.metricFamilies.traffic.includes("recorded-page-views"), "recorded views explicit")
ok(contract.metricFamilies.traffic.includes("participating-browser-ids"), "browser IDs explicit")
ok(contract.metricFamilies.traffic.includes("page-sessions"), "page sessions explicit")
ok(contract.security.tokensStoredInBrowser === false, "no browser social tokens")
ok(contract.security.tokensReturnedToDigitalhutFrontend === false, "no frontend token exposure")
ok(contract.security.webhookSignatureVerification === true, "webhooks verified")
ok(contract.security.automaticPublishingDefault === true, "owner-authorized publishing active")
ok(contract.security.automaticPublishingRequiresVerifiedReleaseEvidence === true, "release evidence required")
ok(contract.security.automaticPublishingEmergencyPause === true, "emergency pause required")
ok(contract.contributionAccounting.actorReference === "pseudonymous-membership-id", "contributor metrics are pseudonymous")
ok(contract.contributionAccounting.rawEmailInMetricRows === false, "metric rows exclude raw email")
for(const boundary of ["contributionIsNotAudienceIdentity", "contributionIsNotFollower", "contributionIsNotPageView", "contributionIsNotPurchase", "contributionIsNotProviderRankingSignal"]){
  ok(contract.contributionAccounting[boundary] === true, `contribution boundary ${boundary}`)
}
ok(contract.contributionAccounting.externalOutcomeRequiresIndependentProviderOrAudienceReceipt === true, "external outcomes require independent receipts")
for(const boundary of ["impression-is-not-click", "click-is-not-attributed-landing", "browser-id-is-not-verified-person", "dwell-is-not-emotion", "missing-provider-metric-is-unknown-not-zero"]){
  ok(contract.truthBoundaries.includes(boundary), `truth boundary ${boundary}`)
}

console.log(JSON.stringify({ok: true, checks, roles: contract.accessRoles.length, automationStages: contract.automationStages, metricFamilies: Object.keys(contract.metricFamilies), automaticPublishingDefault: true}, null, 2))
