const USD_MICROS_PER_USD = 1_000_000n;
const RATE_PPM_SCALE = 1_000_000n;
const MIN_DISPLAY_SAVINGS_PPM = 100n;

export const AI_CREDIT_QUOTE_CONTRACT_VERSION = "flow4-ai-credit-quote-v1";
export const PROPOSED_PACKAGE_AMOUNTS_USD_MICROS = Object.freeze([
  20n * USD_MICROS_PER_USD,
  40n * USD_MICROS_PER_USD,
  80n * USD_MICROS_PER_USD,
]);

const REVERSAL_STATUSES = new Map([
  ["refunded", "payment-refunded"],
  ["reversed", "payment-reversed"],
  ["disputed", "payment-disputed"],
  ["chargeback", "payment-chargeback"],
]);

const CURATED_LABELS = Object.freeze({
  "credit-grant-unverified": "Curated fallback — paid credit grant is not server verified",
  "credits-exhausted": "Curated fallback — paid AI credits are exhausted",
  "fee-invariant-failed": "Curated fallback — payment fee policy is invalid",
  "gross-allocation-failed": "Curated fallback — credit allocation cannot be reconciled",
  "invalid-authenticated-user": "Curated fallback — authenticated user is required",
  "invalid-credit-request": "Curated fallback — requested credit debit is invalid",
  "invalid-gross-amount": "Curated fallback — payment amount is invalid",
  "invalid-usage-assumptions": "Curated fallback — usage assumptions are invalid",
  "payment-amount-mismatch": "Curated fallback — verified payment amount does not match",
  "payment-chargeback": "Curated fallback — payment has a chargeback",
  "payment-currency-mismatch": "Curated fallback — verified payment currency does not match",
  "payment-disputed": "Curated fallback — payment is disputed",
  "payment-not-captured": "Curated fallback — payment is not captured",
  "payment-not-server-verified": "Curated fallback — payment is not server verified",
  "payment-receipt-missing": "Curated fallback — verified payment receipt is missing",
  "payment-refunded": "Curated fallback — payment was refunded",
  "payment-reversed": "Curated fallback — payment was reversed",
  "payment-user-mismatch": "Curated fallback — verified payment user does not match",
  "policy-invariant-failed": "Curated fallback — reserve or profit policy is invalid",
  "provider-price-absent": "Curated fallback — provider price is unavailable",
  "provider-price-invalid": "Curated fallback — provider price is invalid",
  "provider-price-mismatch": "Curated fallback — provider or model price does not match",
  "provider-price-not-yet-effective": "Curated fallback — provider price is not yet effective",
  "provider-price-stale": "Curated fallback — provider price is stale",
  "provider-price-unsupported": "Curated fallback — provider or model is unsupported",
  "unsupported-package": "Curated fallback — AI credit package is unsupported",
  "zero-credit-yield": "Curated fallback — verified payment would yield no paid credits",
});

class ContractFailure extends Error {
  constructor(reason, details = undefined) {
    super(reason);
    this.name = "ContractFailure";
    this.reason = reason;
    this.details = details;
  }
}

function fail(reason, details) {
  throw new ContractFailure(reason, details);
}

function isIntegerNumber(value) {
  return typeof value === "number" && Number.isSafeInteger(value);
}

function requireNonnegativeBigInt(value, reason) {
  if (typeof value !== "bigint" || value < 0n) {
    fail(reason);
  }
  return value;
}

function requirePositiveBigInt(value, reason) {
  if (typeof value !== "bigint" || value <= 0n) {
    fail(reason);
  }
  return value;
}

function requireRatePpm(value, reason) {
  if (typeof value !== "bigint" || value < 0n || value > RATE_PPM_SCALE) {
    fail(reason);
  }
  return value;
}

function ceilDiv(numerator, denominator) {
  if (denominator <= 0n || numerator < 0n) {
    fail("gross-allocation-failed");
  }
  return numerator === 0n ? 0n : ((numerator - 1n) / denominator) + 1n;
}

function roundUp(value, increment) {
  return ceilDiv(value, increment) * increment;
}

function zeroAllocations(grossUsdMicros = 0n) {
  return {
    grossUsdMicros:
      typeof grossUsdMicros === "bigint" && grossUsdMicros >= 0n
        ? grossUsdMicros
        : 0n,
    paymentFeeUsdMicros: 0n,
    operatingReserveUsdMicros: 0n,
    ownerProfitUsdMicros: 0n,
    providerBudgetUsdMicros: 0n,
  };
}

function curatedFailure(reason, options = {}) {
  return {
    contractVersion: AI_CREDIT_QUOTE_CONTRACT_VERSION,
    ok: false,
    mode: "curated",
    reason,
    details: options.details,
    fallback: {
      active: true,
      reason,
      label: CURATED_LABELS[reason] ?? "Curated fallback — paid AI is unavailable",
    },
    allocations: options.allocations ?? zeroAllocations(options.grossUsdMicros),
    estimate: null,
    savings: null,
    displaySavings: false,
    mintAuthorized: false,
    mintedMilliCredits: 0n,
    authorizedDebitMilliCredits: 0n,
    reversalRequired: options.reversalRequired === true,
    consumerSubscriptionPortable: false,
    creditAuthority: "server-only",
  };
}

function packageIsSupported(grossUsdMicros) {
  return PROPOSED_PACKAGE_AMOUNTS_USD_MICROS.some(
    (candidate) => candidate === grossUsdMicros,
  );
}

function validateUser(authenticatedUserId) {
  if (
    typeof authenticatedUserId !== "string" ||
    authenticatedUserId.trim().length === 0
  ) {
    fail("invalid-authenticated-user");
  }
  return authenticatedUserId;
}

function computePaymentFee(grossUsdMicros, schedule) {
  if (!schedule || typeof schedule !== "object") {
    fail("fee-invariant-failed");
  }

  const fixedUsdMicros = requireNonnegativeBigInt(
    schedule.fixedUsdMicros,
    "fee-invariant-failed",
  );
  const variableRatePpm = requireRatePpm(
    schedule.variableRatePpm,
    "fee-invariant-failed",
  );
  const roundingIncrementUsdMicros = requirePositiveBigInt(
    schedule.roundingIncrementUsdMicros,
    "fee-invariant-failed",
  );

  const variableFeeUsdMicros = ceilDiv(
    grossUsdMicros * variableRatePpm,
    RATE_PPM_SCALE,
  );
  const paymentFeeUsdMicros = roundUp(
    fixedUsdMicros + variableFeeUsdMicros,
    roundingIncrementUsdMicros,
  );

  if (paymentFeeUsdMicros >= grossUsdMicros) {
    fail("fee-invariant-failed");
  }

  return {
    fixedUsdMicros,
    variableRatePpm,
    roundingIncrementUsdMicros,
    paymentFeeUsdMicros,
  };
}

function validateAllocationPolicy(policy) {
  if (
    !policy ||
    typeof policy !== "object" ||
    policy.base !== "net-after-payment-fee" ||
    policy.rounding !== "floor"
  ) {
    fail("policy-invariant-failed");
  }

  return {
    ratePpm: requireRatePpm(policy.ratePpm, "policy-invariant-failed"),
    base: policy.base,
    rounding: policy.rounding,
  };
}

function allocateGross({
  grossUsdMicros,
  paymentFeeSchedule,
  operatingReservePolicy,
  ownerProfitPolicy,
}) {
  requirePositiveBigInt(grossUsdMicros, "invalid-gross-amount");
  const paymentFee = computePaymentFee(grossUsdMicros, paymentFeeSchedule);
  const reservePolicy = validateAllocationPolicy(operatingReservePolicy);
  const profitPolicy = validateAllocationPolicy(ownerProfitPolicy);

  if (reservePolicy.ratePpm + profitPolicy.ratePpm >= RATE_PPM_SCALE) {
    fail("policy-invariant-failed");
  }

  const distributableUsdMicros =
    grossUsdMicros - paymentFee.paymentFeeUsdMicros;
  const operatingReserveUsdMicros =
    (distributableUsdMicros * reservePolicy.ratePpm) / RATE_PPM_SCALE;
  const ownerProfitUsdMicros =
    (distributableUsdMicros * profitPolicy.ratePpm) / RATE_PPM_SCALE;
  const providerBudgetUsdMicros =
    distributableUsdMicros -
    operatingReserveUsdMicros -
    ownerProfitUsdMicros;

  const allocations = {
    grossUsdMicros,
    paymentFeeUsdMicros: paymentFee.paymentFeeUsdMicros,
    operatingReserveUsdMicros,
    ownerProfitUsdMicros,
    providerBudgetUsdMicros,
  };

  const allocationValues = Object.values(allocations);
  const allocationSum =
    allocations.paymentFeeUsdMicros +
    allocations.operatingReserveUsdMicros +
    allocations.ownerProfitUsdMicros +
    allocations.providerBudgetUsdMicros;

  if (
    allocationValues.some(
      (value) => typeof value !== "bigint" || value < 0n,
    ) ||
    providerBudgetUsdMicros <= 0n ||
    allocationSum !== grossUsdMicros
  ) {
    fail("gross-allocation-failed");
  }

  return {
    allocations,
    normalizedFeeSchedule: {
      fixedUsdMicros: paymentFee.fixedUsdMicros,
      variableRatePpm: paymentFee.variableRatePpm,
      roundingIncrementUsdMicros: paymentFee.roundingIncrementUsdMicros,
    },
    normalizedReservePolicy: reservePolicy,
    normalizedProfitPolicy: profitPolicy,
  };
}

function validateProviderPriceSnapshot({
  providerPriceSnapshot,
  requestedProvider,
  requestedModel,
  nowMs,
}) {
  if (!providerPriceSnapshot || typeof providerPriceSnapshot !== "object") {
    fail("provider-price-absent");
  }
  if (
    typeof requestedProvider !== "string" ||
    requestedProvider.length === 0 ||
    typeof requestedModel !== "string" ||
    requestedModel.length === 0
  ) {
    fail("provider-price-mismatch");
  }
  if (
    providerPriceSnapshot.provider !== requestedProvider ||
    providerPriceSnapshot.model !== requestedModel
  ) {
    fail("provider-price-mismatch");
  }
  if (providerPriceSnapshot.supported !== true) {
    fail("provider-price-unsupported");
  }
  if (
    providerPriceSnapshot.currency !== "USD" ||
    typeof providerPriceSnapshot.snapshotId !== "string" ||
    providerPriceSnapshot.snapshotId.length === 0 ||
    !isIntegerNumber(providerPriceSnapshot.effectiveAtMs) ||
    !isIntegerNumber(providerPriceSnapshot.validUntilMs) ||
    providerPriceSnapshot.validUntilMs < providerPriceSnapshot.effectiveAtMs ||
    !isIntegerNumber(nowMs)
  ) {
    fail("provider-price-invalid");
  }
  if (nowMs < providerPriceSnapshot.effectiveAtMs) {
    fail("provider-price-not-yet-effective");
  }
  if (nowMs > providerPriceSnapshot.validUntilMs) {
    fail("provider-price-stale");
  }

  const inputUsdMicrosPerMillionTokens = requireNonnegativeBigInt(
    providerPriceSnapshot.inputUsdMicrosPerMillionTokens,
    "provider-price-invalid",
  );
  const outputUsdMicrosPerMillionTokens = requireNonnegativeBigInt(
    providerPriceSnapshot.outputUsdMicrosPerMillionTokens,
    "provider-price-invalid",
  );
  if (
    inputUsdMicrosPerMillionTokens + outputUsdMicrosPerMillionTokens ===
    0n
  ) {
    fail("provider-price-invalid");
  }

  return {
    snapshotId: providerPriceSnapshot.snapshotId,
    provider: requestedProvider,
    model: requestedModel,
    currency: "USD",
    supported: true,
    effectiveAtMs: providerPriceSnapshot.effectiveAtMs,
    validUntilMs: providerPriceSnapshot.validUntilMs,
    inputUsdMicrosPerMillionTokens,
    outputUsdMicrosPerMillionTokens,
  };
}

function validateIntegerRange(range, reason) {
  if (
    !range ||
    typeof range !== "object" ||
    !isIntegerNumber(range.min) ||
    !isIntegerNumber(range.max) ||
    range.min <= 0 ||
    range.max < range.min
  ) {
    fail(reason);
  }
  return { min: BigInt(range.min), max: BigInt(range.max) };
}

function validateUsageAssumptions(usageAssumptions) {
  if (!usageAssumptions || typeof usageAssumptions !== "object") {
    fail("invalid-usage-assumptions");
  }

  return {
    inputTokensPerReaction: validateIntegerRange(
      usageAssumptions.inputTokensPerReaction,
      "invalid-usage-assumptions",
    ),
    outputTokensPerReaction: validateIntegerRange(
      usageAssumptions.outputTokensPerReaction,
      "invalid-usage-assumptions",
    ),
    liveReactionsPerHour: validateIntegerRange(
      usageAssumptions.liveReactionsPerHour,
      "invalid-usage-assumptions",
    ),
    usdMicrosPerMilliCredit: requirePositiveBigInt(
      usageAssumptions.usdMicrosPerMilliCredit,
      "invalid-usage-assumptions",
    ),
  };
}

function costPerReactionUsdMicros({
  inputTokens,
  outputTokens,
  providerPrice,
}) {
  const pricedTokenMicros =
    inputTokens * providerPrice.inputUsdMicrosPerMillionTokens +
    outputTokens * providerPrice.outputUsdMicrosPerMillionTokens;
  return ceilDiv(pricedTokenMicros, 1_000_000n);
}

function estimateUsage({ providerBudgetUsdMicros, providerPrice, usage }) {
  const lowCostPerReactionUsdMicros = costPerReactionUsdMicros({
    inputTokens: usage.inputTokensPerReaction.min,
    outputTokens: usage.outputTokensPerReaction.min,
    providerPrice,
  });
  const highCostPerReactionUsdMicros = costPerReactionUsdMicros({
    inputTokens: usage.inputTokensPerReaction.max,
    outputTokens: usage.outputTokensPerReaction.max,
    providerPrice,
  });

  if (
    lowCostPerReactionUsdMicros <= 0n ||
    highCostPerReactionUsdMicros < lowCostPerReactionUsdMicros
  ) {
    fail("provider-price-invalid");
  }

  const minLiveReactions =
    providerBudgetUsdMicros / highCostPerReactionUsdMicros;
  const maxLiveReactions =
    providerBudgetUsdMicros / lowCostPerReactionUsdMicros;
  const minSessionMinutes =
    (minLiveReactions * 60n) / usage.liveReactionsPerHour.max;
  const maxSessionMinutes =
    (maxLiveReactions * 60n) / usage.liveReactionsPerHour.min;
  const estimatedMilliCredits =
    providerBudgetUsdMicros / usage.usdMicrosPerMilliCredit;

  if (estimatedMilliCredits <= 0n) {
    fail("zero-credit-yield");
  }

  return {
    guaranteed: false,
    label:
      "Non-guaranteed estimate based on the stated price snapshot and usage assumptions",
    estimatedMilliCredits,
    liveReactionRange: {
      min: minLiveReactions,
      max: maxLiveReactions,
    },
    sessionMinutesRange: {
      min: minSessionMinutes,
      max: maxSessionMinutes,
    },
    reactionCostUsdMicrosRange: {
      min: lowCostPerReactionUsdMicros,
      max: highCostPerReactionUsdMicros,
    },
    assumptions: {
      inputTokensPerReaction: usage.inputTokensPerReaction,
      outputTokensPerReaction: usage.outputTokensPerReaction,
      liveReactionsPerHour: usage.liveReactionsPerHour,
      usdMicrosPerMilliCredit: usage.usdMicrosPerMilliCredit,
    },
  };
}

function comparisonKey({
  normalizedFeeSchedule,
  normalizedReservePolicy,
  normalizedProfitPolicy,
  providerPrice,
  usage,
}) {
  return [
    AI_CREDIT_QUOTE_CONTRACT_VERSION,
    normalizedFeeSchedule.fixedUsdMicros,
    normalizedFeeSchedule.variableRatePpm,
    normalizedFeeSchedule.roundingIncrementUsdMicros,
    normalizedReservePolicy.ratePpm,
    normalizedReservePolicy.base,
    normalizedReservePolicy.rounding,
    normalizedProfitPolicy.ratePpm,
    normalizedProfitPolicy.base,
    normalizedProfitPolicy.rounding,
    providerPrice.snapshotId,
    providerPrice.provider,
    providerPrice.model,
    providerPrice.currency,
    providerPrice.effectiveAtMs,
    providerPrice.validUntilMs,
    providerPrice.inputUsdMicrosPerMillionTokens,
    providerPrice.outputUsdMicrosPerMillionTokens,
    usage.inputTokensPerReaction.min,
    usage.inputTokensPerReaction.max,
    usage.outputTokensPerReaction.min,
    usage.outputTokensPerReaction.max,
    usage.liveReactionsPerHour.min,
    usage.liveReactionsPerHour.max,
    usage.usdMicrosPerMilliCredit,
  ].join("|");
}

function quoteCore(input, grossUsdMicros) {
  if (!packageIsSupported(grossUsdMicros)) {
    fail("unsupported-package");
  }

  const allocation = allocateGross({
    grossUsdMicros,
    paymentFeeSchedule: input.paymentFeeSchedule,
    operatingReservePolicy: input.operatingReservePolicy,
    ownerProfitPolicy: input.ownerProfitPolicy,
  });
  const providerPrice = validateProviderPriceSnapshot({
    providerPriceSnapshot: input.providerPriceSnapshot,
    requestedProvider: input.requestedProvider,
    requestedModel: input.requestedModel,
    nowMs: input.nowMs,
  });
  const usage = validateUsageAssumptions(input.usageAssumptions);
  const estimate = estimateUsage({
    providerBudgetUsdMicros: allocation.allocations.providerBudgetUsdMicros,
    providerPrice,
    usage,
  });

  return {
    ...allocation,
    providerPrice,
    usage,
    estimate,
    comparisonKey: comparisonKey({
      ...allocation,
      providerPrice,
      usage,
    }),
  };
}

function deriveSavings(candidateCore, referenceCore) {
  if (
    candidateCore.comparisonKey !== referenceCore.comparisonKey ||
    candidateCore.allocations.grossUsdMicros <=
      referenceCore.allocations.grossUsdMicros
  ) {
    return null;
  }

  const candidateCredits = candidateCore.estimate.estimatedMilliCredits;
  const referenceCredits = referenceCore.estimate.estimatedMilliCredits;
  if (candidateCredits <= 0n || referenceCredits <= 0n) {
    return null;
  }

  const candidateUnitCostNumerator =
    candidateCore.allocations.grossUsdMicros * referenceCredits;
  const referenceUnitCostNumerator =
    referenceCore.allocations.grossUsdMicros * candidateCredits;

  if (candidateUnitCostNumerator >= referenceUnitCostNumerator) {
    return null;
  }

  const savingsPpm =
    ((referenceUnitCostNumerator - candidateUnitCostNumerator) *
      RATE_PPM_SCALE) /
    referenceUnitCostNumerator;
  if (savingsPpm < MIN_DISPLAY_SAVINGS_PPM) {
    return null;
  }

  return {
    derived: true,
    guaranteed: false,
    savingsPpm,
    label:
      "Derived non-guaranteed unit-cost savings versus the smaller package under identical policies, price snapshot, and assumptions",
    referenceGrossUsdMicros: referenceCore.allocations.grossUsdMicros,
  };
}

function buildQuote(input) {
  const authenticatedUserId = validateUser(input?.authenticatedUserId);
  const grossUsdMicros = requirePositiveBigInt(
    input?.grossUsdMicros,
    "invalid-gross-amount",
  );
  const core = quoteCore(input, grossUsdMicros);

  let savings = null;
  if (input.comparisonGrossUsdMicros !== undefined) {
    const comparisonGrossUsdMicros = requirePositiveBigInt(
      input.comparisonGrossUsdMicros,
      "invalid-gross-amount",
    );
    const referenceCore = quoteCore(input, comparisonGrossUsdMicros);
    savings = deriveSavings(core, referenceCore);
  }

  return {
    contractVersion: AI_CREDIT_QUOTE_CONTRACT_VERSION,
    ok: true,
    mode: "quote",
    reason: null,
    authenticatedUserId,
    allocations: core.allocations,
    providerPrice: core.providerPrice,
    estimate: core.estimate,
    comparisonKey: core.comparisonKey,
    savings,
    displaySavings: savings !== null,
    fallback: {
      active: false,
      reason: null,
      label: null,
    },
    mintAuthorized: false,
    mintedMilliCredits: 0n,
    authorizedDebitMilliCredits: 0n,
    reversalRequired: false,
    consumerSubscriptionPortable: false,
    creditAuthority: "server-only",
  };
}

export function quoteAiCreditPackage(input) {
  try {
    return buildQuote(input);
  } catch (error) {
    if (error instanceof ContractFailure) {
      return curatedFailure(error.reason, {
        details: error.details,
        grossUsdMicros: input?.grossUsdMicros,
      });
    }
    throw error;
  }
}

function verifyPayment({ verifiedPayment, quote }) {
  if (!verifiedPayment || typeof verifiedPayment !== "object") {
    fail("payment-not-server-verified");
  }

  const reversalReason = REVERSAL_STATUSES.get(verifiedPayment.status);
  if (reversalReason) {
    fail(reversalReason, { reversalRequired: true });
  }
  if (
    verifiedPayment.verified !== true ||
    !["server-provider-api", "server-webhook"].includes(verifiedPayment.source)
  ) {
    fail("payment-not-server-verified");
  }
  if (verifiedPayment.status !== "captured") {
    fail("payment-not-captured");
  }
  if (
    typeof verifiedPayment.receiptId !== "string" ||
    verifiedPayment.receiptId.length === 0
  ) {
    fail("payment-receipt-missing");
  }
  if (verifiedPayment.authenticatedUserId !== quote.authenticatedUserId) {
    fail("payment-user-mismatch");
  }
  if (verifiedPayment.currency !== "USD") {
    fail("payment-currency-mismatch");
  }
  if (
    verifiedPayment.grossUsdMicros !== quote.allocations.grossUsdMicros
  ) {
    fail("payment-amount-mismatch");
  }

  return {
    receiptId: verifiedPayment.receiptId,
    source: verifiedPayment.source,
    status: verifiedPayment.status,
    authenticatedUserId: verifiedPayment.authenticatedUserId,
    currency: verifiedPayment.currency,
    grossUsdMicros: verifiedPayment.grossUsdMicros,
  };
}

export function settleVerifiedAiCreditPurchase(input) {
  const quote = quoteAiCreditPackage(input);
  if (!quote.ok) {
    return quote;
  }

  try {
    const paymentReceipt = verifyPayment({
      verifiedPayment: input?.verifiedPayment,
      quote,
    });

    return {
      ...quote,
      mode: "paid-ai",
      paymentReceipt,
      mintAuthorized: true,
      mintedMilliCredits: quote.estimate.estimatedMilliCredits,
    };
  } catch (error) {
    if (error instanceof ContractFailure) {
      return curatedFailure(error.reason, {
        details: error.details,
        allocations: quote.allocations,
        reversalRequired: error.details?.reversalRequired === true,
      });
    }
    throw error;
  }
}

export function authorizeAiCreditDebit(input) {
  const creditGrant = input?.creditGrant;
  const grossUsdMicros = creditGrant?.allocations?.grossUsdMicros;

  try {
    const authenticatedUserId = validateUser(input?.authenticatedUserId);
    if (
      !creditGrant ||
      creditGrant.ok !== true ||
      creditGrant.mode !== "paid-ai" ||
      creditGrant.mintAuthorized !== true ||
      creditGrant.creditAuthority !== "server-only"
    ) {
      fail("credit-grant-unverified");
    }
    if (creditGrant.authenticatedUserId !== authenticatedUserId) {
      fail("payment-user-mismatch");
    }
    if (
      !isIntegerNumber(input?.nowMs) ||
      !isIntegerNumber(creditGrant.providerPrice?.validUntilMs)
    ) {
      fail("provider-price-invalid");
    }
    if (input.nowMs > creditGrant.providerPrice.validUntilMs) {
      fail("provider-price-stale");
    }

    const serverBalanceMilliCredits = requireNonnegativeBigInt(
      input?.serverBalanceMilliCredits,
      "invalid-credit-request",
    );
    const requestedDebitMilliCredits = requirePositiveBigInt(
      input?.requestedDebitMilliCredits,
      "invalid-credit-request",
    );
    if (serverBalanceMilliCredits < requestedDebitMilliCredits) {
      fail("credits-exhausted");
    }

    return {
      contractVersion: AI_CREDIT_QUOTE_CONTRACT_VERSION,
      ok: true,
      mode: "paid-ai",
      reason: null,
      fallback: {
        active: false,
        reason: null,
        label: null,
      },
      mintAuthorized: false,
      mintedMilliCredits: 0n,
      authorizedDebitMilliCredits: requestedDebitMilliCredits,
      remainingServerBalanceMilliCredits:
        serverBalanceMilliCredits - requestedDebitMilliCredits,
      consumerSubscriptionPortable: false,
      creditAuthority: "server-only",
    };
  } catch (error) {
    if (error instanceof ContractFailure) {
      return curatedFailure(error.reason, {
        grossUsdMicros,
      });
    }
    throw error;
  }
}
