export const GAP_RECEIPT_VERSION = "RANK-GAP-ORCHESTRATION-001";

export const baselineReceipt = Object.freeze({
  window: "all recorded history through 2026-07-27",
  source: "durable first-party audience rollup",
  pageViews: 2735,
  qualifiedPageViews: 1779,
  pseudonymousBrowserIds: 376,
  sessions: 645,
  events: 5570,
  secondActions: 20,
  commerceIntent: 120,
  routeCheckoutIntents: 0,
  storedAccessPassReceipts: 3,
  paypalReceipts: 0,
  durableEntitlements: 0,
  verifiedConversions: 0,
  repeatSessionBrowserIds: 31,
  multiDayBrowserIds: 15,
  unknownClassifications: 1182,
  previewTest: 469,
  knownAutomatic: 487,
});

export const externalEvidence = Object.freeze({
  googleSearchConsole: { impressions: 1, clicks: 0, status: "saved_receipt", generated: "2026-07-10" },
  bing: { events: 12, pseudonymousBrowserIds: 4, status: "ua_only_no_provider_window" },
  externalReferrer: { events: 61, pageViews: 33, secondActions: 0, verifiedConversions: 0 },
  namedLlmModelRows: { rows: 0, status: "no_provider_evidence" },
  longtail: { internalVariations: 200572944, materializedSitemapUrls: 229, status: "internal_capacity_not_audience_or_rank" },
  platformAudienceProxies: [
    { provider: "Mastodon", numerator: 732000, unit: "monthly active users", window: "snapshot 2026-06-14", source: "Mastodon server directory" },
    { provider: "NASA", numerator: 43000000, unit: "average monthly public visitors", window: "FY2024 report", source: "NASA IT Annual Report" },
    { provider: "Reddit", numerator: 126800000, unit: "daily active uniques", window: "Q1 2026", source: "Reddit investor receipt" },
  ],
});

export const orchestrationOrder = Object.freeze([
  { order: 1, flow: "F1", objective: "qualified external acquisition", gate: "provider window plus qualified first-party continuation" },
  { order: 2, flow: "F2", objective: "useful second action and repeat use", gate: "continuation and retention receipts" },
  { order: 3, flow: "F3", objective: "checkout to signed provider receipt to entitlement to verified conversion", gate: "atomic durable chain; fail closed" },
  { order: 4, flow: "F4", objective: "AI usefulness, provider, cost and settlement receipts", gate: "named provider and durable cost evidence" },
  { order: 5, flow: "F5", objective: "attribution, provider windows and Unknown reduction", gate: "dated finalized provider series" },
  { order: 6, flow: "SCALE", objective: "infrastructure capacity", gate: "only after funnel and reliability gates" },
]);

const gap = (dimension, evidenceClass, numerator, denominator, unit, source, confidence, ownerFlow, severity, mechanism, acceptanceTest, stopRollbackState) => ({
  dimension, evidenceClass, numerator, denominator, unit, window: baselineReceipt.window, source,
  confidence, ownerFlow, severity, mechanism, acceptanceTest, stopRollbackState,
  status: numerator === 0 ? "OPEN" : "MEASURED",
});

export function evaluateGapOrchestration(input = baselineReceipt) {
  const b = { ...baselineReceipt, ...input };
  const gaps = [
    gap("discovery/source-quality", "first_party_plus_provider_saved", b.qualifiedPageViews, b.pageViews, "qualified views / recorded views", b.source, "medium", "F1", "high",
      "Finalize dated GSC/Bing/provider windows and route qualified acquisition to useful landing paths.",
      "Provider-native dated window maps to qualified first-party sessions without redistributing Unknown.", "Stop claims; retain last immutable receipt."),
    gap("continuation", "durable_first_party", b.secondActions, b.sessions, "second actions / sessions", b.source, "high", "F2", "critical",
      "Instrument one useful route-specific continuation and remove dead-end paths.", "Second-action numerator is durable, route-attributed, and repeatable.", "Kill changed route; restore prior navigation."),
    gap("retention", "pseudonymous_first_party", b.repeatSessionBrowserIds, b.pseudonymousBrowserIds, "repeat-session browser IDs / browser IDs", b.source, "medium", "F2", "high",
      "Measure repeat and multi-day use by pseudonymous identifier without calling identifiers people.", "Repeat and multi-day cohorts reproduce for a finalized window.", "Disable cohort claim; retain raw aggregate."),
    gap("checkout-attribution", "first_party_intent", b.routeCheckoutIntents, b.commerceIntent, "route checkout intents / commerce-intent events", b.source, "high", "F3", "critical",
      "Bind authenticated checkout intent to route, user and idempotency key.", "One owner-authorized checkout has a durable route and authenticated-user binding.", "Fail closed before provider create."),
    gap("provider-payment", "provider_qualified", b.paypalReceipts, 1, "qualified PayPal receipts / required proof", "PayPal provider receipt store", "high", "F3", "critical",
      "Verify signed PayPal lifecycle receipt, idempotency and authenticated user binding.", "One owner-authorized transaction has a provider-qualified signed receipt.", "Disable PayPal upgrade; preserve prior entitlement state."),
    gap("durable-entitlement", "database_durable", b.durableEntitlements, 1, "durable entitlements / required proof", "entitlement database", "high", "F3", "critical",
      "Atomically transition qualified provider receipt to durable entitlement.", "Receipt and entitlement survive reload and protect access server-side.", "Fail closed; revoke candidate entitlement transition."),
    gap("verified-conversion", "provider_plus_database", b.verifiedConversions, 1, "verified conversions / required proof", "provider receipt plus entitlement database", "high", "F3", "critical",
      "Count conversion only after provider receipt, user binding and durable entitlement.", "Instrumentation PASS and exactly one owner-authorized verified conversion receipt exists.", "Keep verified conversions at zero."),
    gap("AI/model-evidence", "provider_named", externalEvidence.namedLlmModelRows.rows, 1, "named model/provider rows / required proof", "AI provider and settlement receipts", "high", "F4", "medium",
      "Record named model, supported price, budget, terminal settlement and kill-switch state.", "One real authorized call has provider, cost and terminal durable receipt.", "Disable paid inference and claims."),
    gap("platform-audience-proxy", "mismatched_public_proxy", b.pseudonymousBrowserIds, externalEvidence.platformAudienceProxies[1].numerator, "DigitalHut browser IDs / NASA monthly visitor proxy", "separate dated public and first-party receipts", "low", "F1", "informational",
      "Display ratios only with mismatched-unit warning; never derive capacity, people or conversion.", "Every ratio retains provider, unit, date and mismatch disclosure.", "Remove ratio if source becomes stale."),
    gap("infrastructure/capability", "code_readiness_not_live_capacity", 0, 1, "accepted reliability gates / required gate", "immutable build, rollback and provider capability receipts", "low", "SCALE", "deferred",
      "Prepare additive capacity controls after funnel, reliability and rollback gates pass.", "No live capacity or SLA claim; immutable rollback and capability truth pass.", "Do not promote or purchase plans."),
  ];

  return {
    receiptVersion: GAP_RECEIPT_VERSION,
    generatedFromFixedReceipt: true,
    baseline: b,
    externalEvidence,
    gaps,
    orchestrationOrder,
    conversionTruth: { instrumentation: "PASS", verifiedConversions: b.verifiedConversions, businessVerification: "NOT_READY" },
    claimsPolicy: {
      browserIdsArePeople: false,
      platformProxySetsCapacity: false,
      codeGuaranteesAudienceGrowth: false,
      longtailIsAudienceOrRank: false,
    },
    gate: "HOLD",
    rollback: "Read-only evaluator: remove endpoint/artifact and return to production SHA 80411fb944de2d33530c558f9577448bd0c5ab22.",
  };
}


