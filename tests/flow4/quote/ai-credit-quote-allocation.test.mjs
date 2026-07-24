import assert from "node:assert/strict";
import test from "node:test";

import {
  PROPOSED_PACKAGE_AMOUNTS_USD_MICROS,
  authorizeAiCreditDebit,
  quoteAiCreditPackage,
  settleVerifiedAiCreditPurchase,
} from "./ai-credit-quote-allocation.contract.mjs";

const NOW_MS = Date.UTC(2026, 6, 24, 12, 0, 0);
const USD_MICROS = 1_000_000n;

function baseInput(overrides = {}) {
  return {
    authenticatedUserId: "user-flow4-001",
    grossUsdMicros: 20n * USD_MICROS,
    requestedProvider: "microsoft-foundry",
    requestedModel: "permitted-model-small",
    nowMs: NOW_MS,
    paymentFeeSchedule: {
      fixedUsdMicros: 300_000n,
      variableRatePpm: 29_000n,
      roundingIncrementUsdMicros: 10_000n,
    },
    operatingReservePolicy: {
      ratePpm: 100_000n,
      base: "net-after-payment-fee",
      rounding: "floor",
    },
    ownerProfitPolicy: {
      ratePpm: 150_000n,
      base: "net-after-payment-fee",
      rounding: "floor",
    },
    providerPriceSnapshot: {
      snapshotId: "price-2026-07-24T12:00:00Z",
      provider: "microsoft-foundry",
      model: "permitted-model-small",
      currency: "USD",
      supported: true,
      effectiveAtMs: NOW_MS - 60_000,
      validUntilMs: NOW_MS + 3_600_000,
      inputUsdMicrosPerMillionTokens: 250_000n,
      outputUsdMicrosPerMillionTokens: 1_000_000n,
    },
    usageAssumptions: {
      inputTokensPerReaction: { min: 300, max: 900 },
      outputTokensPerReaction: { min: 40, max: 160 },
      liveReactionsPerHour: { min: 8, max: 20 },
      usdMicrosPerMilliCredit: 10n,
    },
    ...overrides,
  };
}

function capturedPayment(input, overrides = {}) {
  return {
    verified: true,
    source: "server-webhook",
    status: "captured",
    receiptId: "provider-receipt-001",
    authenticatedUserId: input.authenticatedUserId,
    currency: "USD",
    grossUsdMicros: input.grossUsdMicros,
    ...overrides,
  };
}

function allocationSum(allocations) {
  return (
    allocations.paymentFeeUsdMicros +
    allocations.operatingReserveUsdMicros +
    allocations.ownerProfitUsdMicros +
    allocations.providerBudgetUsdMicros
  );
}

test("proposed packages are inputs to non-guaranteed quotes and never mint", () => {
  assert.deepEqual(PROPOSED_PACKAGE_AMOUNTS_USD_MICROS, [
    20n * USD_MICROS,
    40n * USD_MICROS,
    80n * USD_MICROS,
  ]);

  for (const grossUsdMicros of PROPOSED_PACKAGE_AMOUNTS_USD_MICROS) {
    const quote = quoteAiCreditPackage(baseInput({ grossUsdMicros }));

    assert.equal(quote.ok, true);
    assert.equal(quote.mode, "quote");
    assert.equal(quote.allocations.grossUsdMicros, grossUsdMicros);
    assert.equal(quote.estimate.guaranteed, false);
    assert.match(quote.estimate.label, /Non-guaranteed/);
    assert.equal("guaranteedHours" in quote.estimate, false);
    assert.equal(quote.mintAuthorized, false);
    assert.equal(quote.mintedMilliCredits, 0n);
    assert.equal(quote.consumerSubscriptionPortable, false);
  }

  const unsupported = quoteAiCreditPackage(
    baseInput({ grossUsdMicros: 10n * USD_MICROS }),
  );
  assert.equal(unsupported.ok, false);
  assert.equal(unsupported.mode, "curated");
  assert.equal(unsupported.reason, "unsupported-package");
  assert.equal(unsupported.mintedMilliCredits, 0n);
});

test("payment fee rounds upward in integer micros without losing gross", () => {
  const quote = quoteAiCreditPackage(
    baseInput({
      paymentFeeSchedule: {
        fixedUsdMicros: 123_457n,
        variableRatePpm: 33_333n,
        roundingIncrementUsdMicros: 10_000n,
      },
    }),
  );

  assert.equal(quote.ok, true);
  assert.equal(quote.allocations.paymentFeeUsdMicros, 800_000n);
  assert.equal(allocationSum(quote.allocations), quote.allocations.grossUsdMicros);
});

test("every allocation is nonnegative and sums exactly to gross", () => {
  for (const grossUsdMicros of PROPOSED_PACKAGE_AMOUNTS_USD_MICROS) {
    const quote = quoteAiCreditPackage(baseInput({ grossUsdMicros }));
    const allocationValues = Object.values(quote.allocations);

    assert.equal(quote.ok, true);
    assert.equal(
      allocationValues.every(
        (value) => typeof value === "bigint" && value >= 0n,
      ),
      true,
    );
    assert.equal(allocationSum(quote.allocations), grossUsdMicros);
    assert.ok(quote.allocations.providerBudgetUsdMicros > 0n);
  }
});

test("high-cost models yield smaller estimates than low-cost models", () => {
  const lowCost = quoteAiCreditPackage(baseInput());
  const highCost = quoteAiCreditPackage(
    baseInput({
      requestedModel: "permitted-model-large",
      providerPriceSnapshot: {
        ...baseInput().providerPriceSnapshot,
        snapshotId: "large-price-2026-07-24T12:00:00Z",
        model: "permitted-model-large",
        inputUsdMicrosPerMillionTokens: 5_000_000n,
        outputUsdMicrosPerMillionTokens: 20_000_000n,
      },
    }),
  );

  assert.equal(lowCost.ok, true);
  assert.equal(highCost.ok, true);
  assert.ok(
    lowCost.estimate.liveReactionRange.min >
      highCost.estimate.liveReactionRange.min,
  );
  assert.ok(
    lowCost.estimate.sessionMinutesRange.max >
      highCost.estimate.sessionMinutesRange.max,
  );
  assert.equal(lowCost.estimate.guaranteed, false);
  assert.equal(highCost.estimate.guaranteed, false);
});

test("missing, stale, future, mismatched, and unsupported prices fail closed", () => {
  const cases = [
    {
      input: baseInput({ providerPriceSnapshot: undefined }),
      reason: "provider-price-absent",
    },
    {
      input: baseInput({
        providerPriceSnapshot: {
          ...baseInput().providerPriceSnapshot,
          validUntilMs: NOW_MS - 1,
        },
      }),
      reason: "provider-price-stale",
    },
    {
      input: baseInput({
        providerPriceSnapshot: {
          ...baseInput().providerPriceSnapshot,
          effectiveAtMs: NOW_MS + 1,
          validUntilMs: NOW_MS + 60_000,
        },
      }),
      reason: "provider-price-not-yet-effective",
    },
    {
      input: baseInput({ requestedModel: "different-model" }),
      reason: "provider-price-mismatch",
    },
    {
      input: baseInput({
        providerPriceSnapshot: {
          ...baseInput().providerPriceSnapshot,
          supported: false,
        },
      }),
      reason: "provider-price-unsupported",
    },
  ];

  for (const { input, reason } of cases) {
    const quote = quoteAiCreditPackage(input);
    assert.equal(quote.ok, false);
    assert.equal(quote.mode, "curated");
    assert.equal(quote.reason, reason);
    assert.equal(quote.mintedMilliCredits, 0n);
    assert.equal(quote.fallback.active, true);
  }
});

test("fee, reserve, and profit invariant failures authorize no credits", () => {
  const cases = [
    baseInput({
      paymentFeeSchedule: {
        fixedUsdMicros: 20n * USD_MICROS,
        variableRatePpm: 0n,
        roundingIncrementUsdMicros: 1n,
      },
    }),
    baseInput({
      operatingReservePolicy: {
        ratePpm: 900_000n,
        base: "net-after-payment-fee",
        rounding: "floor",
      },
      ownerProfitPolicy: {
        ratePpm: 100_000n,
        base: "net-after-payment-fee",
        rounding: "floor",
      },
    }),
    baseInput({
      ownerProfitPolicy: {
        ratePpm: -1n,
        base: "net-after-payment-fee",
        rounding: "floor",
      },
    }),
  ];

  for (const input of cases) {
    const result = settleVerifiedAiCreditPurchase({
      ...input,
      verifiedPayment: capturedPayment(input),
    });
    assert.equal(result.ok, false);
    assert.equal(result.mode, "curated");
    assert.equal(result.mintAuthorized, false);
    assert.equal(result.mintedMilliCredits, 0n);
  }
});

test("only an exact server-verified capture can authorize a mint", () => {
  const input = baseInput({
    consumerSubscription: { active: true },
    refreshedClientEntitlements: { aiCredits: 999_999_999n },
    browserGrossUsdMicros: 80n * USD_MICROS,
    browserMintedMilliCredits: 999_999_999n,
  });

  const quoteOnly = quoteAiCreditPackage({
    ...input,
    verifiedPayment: capturedPayment(input),
  });
  assert.equal(quoteOnly.mintAuthorized, false);
  assert.equal(quoteOnly.mintedMilliCredits, 0n);

  const unverified = settleVerifiedAiCreditPurchase(input);
  assert.equal(unverified.reason, "payment-not-server-verified");
  assert.equal(unverified.mintedMilliCredits, 0n);

  const browserSpoof = settleVerifiedAiCreditPurchase({
    ...input,
    verifiedPayment: capturedPayment(input, {
      verified: true,
      source: "browser",
    }),
  });
  assert.equal(browserSpoof.reason, "payment-not-server-verified");
  assert.equal(browserSpoof.mintedMilliCredits, 0n);

  const settled = settleVerifiedAiCreditPurchase({
    ...input,
    verifiedPayment: capturedPayment(input),
  });
  assert.equal(settled.ok, true);
  assert.equal(settled.mode, "paid-ai");
  assert.equal(settled.mintAuthorized, true);
  assert.equal(
    settled.mintedMilliCredits,
    settled.estimate.estimatedMilliCredits,
  );
  assert.ok(settled.mintedMilliCredits > 0n);
});

test("payment identity, amount, currency, source, and capture status bind settlement", () => {
  const input = baseInput();
  const cases = [
    {
      payment: capturedPayment(input, {
        authenticatedUserId: "different-user",
      }),
      reason: "payment-user-mismatch",
    },
    {
      payment: capturedPayment(input, {
        grossUsdMicros: 40n * USD_MICROS,
      }),
      reason: "payment-amount-mismatch",
    },
    {
      payment: capturedPayment(input, { currency: "EUR" }),
      reason: "payment-currency-mismatch",
    },
    {
      payment: capturedPayment(input, { source: "browser" }),
      reason: "payment-not-server-verified",
    },
    {
      payment: capturedPayment(input, { status: "authorized" }),
      reason: "payment-not-captured",
    },
  ];

  for (const { payment, reason } of cases) {
    const result = settleVerifiedAiCreditPurchase({
      ...input,
      verifiedPayment: payment,
    });
    assert.equal(result.ok, false);
    assert.equal(result.mode, "curated");
    assert.equal(result.reason, reason);
    assert.equal(result.mintAuthorized, false);
    assert.equal(result.mintedMilliCredits, 0n);
  }
});

test("refund, reversal, dispute, and chargeback fail closed and flag reconciliation", () => {
  const input = baseInput();
  const statuses = ["refunded", "reversed", "disputed", "chargeback"];

  for (const status of statuses) {
    const result = settleVerifiedAiCreditPurchase({
      ...input,
      verifiedPayment: capturedPayment(input, { status }),
    });
    assert.equal(result.ok, false);
    assert.equal(result.mode, "curated");
    assert.equal(result.reason, `payment-${status}`);
    assert.equal(result.reversalRequired, true);
    assert.equal(result.mintAuthorized, false);
    assert.equal(result.mintedMilliCredits, 0n);
    assert.match(result.fallback.label, /Curated fallback/);
  }
});

test("volume savings display only when identical-input integer math supports it", () => {
  const discounted = quoteAiCreditPackage(
    baseInput({
      grossUsdMicros: 40n * USD_MICROS,
      comparisonGrossUsdMicros: 20n * USD_MICROS,
    }),
  );
  assert.equal(discounted.ok, true);
  assert.equal(discounted.displaySavings, true);
  assert.equal(discounted.savings.derived, true);
  assert.equal(discounted.savings.guaranteed, false);
  assert.ok(discounted.savings.savingsPpm > 0n);
  assert.match(discounted.savings.label, /Derived non-guaranteed/);

  const proportional = quoteAiCreditPackage(
    baseInput({
      grossUsdMicros: 80n * USD_MICROS,
      comparisonGrossUsdMicros: 20n * USD_MICROS,
      paymentFeeSchedule: {
        fixedUsdMicros: 0n,
        variableRatePpm: 30_000n,
        roundingIncrementUsdMicros: 1n,
      },
      operatingReservePolicy: {
        ratePpm: 100_000n,
        base: "net-after-payment-fee",
        rounding: "floor",
      },
      ownerProfitPolicy: {
        ratePpm: 100_000n,
        base: "net-after-payment-fee",
        rounding: "floor",
      },
      usageAssumptions: {
        ...baseInput().usageAssumptions,
        usdMicrosPerMilliCredit: 10n,
      },
    }),
  );
  assert.equal(proportional.ok, true);
  assert.equal(proportional.displaySavings, false);
  assert.equal(proportional.savings, null);

  const reversedComparison = quoteAiCreditPackage(
    baseInput({
      grossUsdMicros: 20n * USD_MICROS,
      comparisonGrossUsdMicros: 40n * USD_MICROS,
    }),
  );
  assert.equal(reversedComparison.ok, true);
  assert.equal(reversedComparison.displaySavings, false);
  assert.equal(reversedComparison.savings, null);
});

test("exhaustion uses only server balance and cuts over explicitly to curated mode", () => {
  const input = baseInput();
  const creditGrant = settleVerifiedAiCreditPurchase({
    ...input,
    verifiedPayment: capturedPayment(input),
  });
  assert.equal(creditGrant.ok, true);

  const exhausted = authorizeAiCreditDebit({
    authenticatedUserId: input.authenticatedUserId,
    creditGrant,
    nowMs: NOW_MS,
    serverBalanceMilliCredits: 99n,
    requestedDebitMilliCredits: 100n,
    browserBalanceMilliCredits: 999_999_999n,
    consumerSubscription: { active: true },
    refreshedClientEntitlements: { aiCredits: 999_999_999n },
  });
  assert.equal(exhausted.ok, false);
  assert.equal(exhausted.mode, "curated");
  assert.equal(exhausted.reason, "credits-exhausted");
  assert.equal(exhausted.authorizedDebitMilliCredits, 0n);
  assert.equal(exhausted.mintedMilliCredits, 0n);
  assert.match(exhausted.fallback.label, /exhausted/);

  const exact = authorizeAiCreditDebit({
    authenticatedUserId: input.authenticatedUserId,
    creditGrant,
    nowMs: NOW_MS,
    serverBalanceMilliCredits: 100n,
    requestedDebitMilliCredits: 100n,
  });
  assert.equal(exact.ok, true);
  assert.equal(exact.mode, "paid-ai");
  assert.equal(exact.authorizedDebitMilliCredits, 100n);
  assert.equal(exact.remainingServerBalanceMilliCredits, 0n);
  assert.equal(exact.mintedMilliCredits, 0n);
});

test("an unverified grant or stale debit price cannot authorize spend", () => {
  const input = baseInput();
  const quote = quoteAiCreditPackage(input);
  const fromQuoteOnly = authorizeAiCreditDebit({
    authenticatedUserId: input.authenticatedUserId,
    creditGrant: quote,
    nowMs: NOW_MS,
    serverBalanceMilliCredits: 100n,
    requestedDebitMilliCredits: 1n,
  });
  assert.equal(fromQuoteOnly.reason, "credit-grant-unverified");
  assert.equal(fromQuoteOnly.authorizedDebitMilliCredits, 0n);

  const creditGrant = settleVerifiedAiCreditPurchase({
    ...input,
    verifiedPayment: capturedPayment(input),
  });
  const stale = authorizeAiCreditDebit({
    authenticatedUserId: input.authenticatedUserId,
    creditGrant,
    nowMs: input.providerPriceSnapshot.validUntilMs + 1,
    serverBalanceMilliCredits: 100n,
    requestedDebitMilliCredits: 1n,
  });
  assert.equal(stale.reason, "provider-price-stale");
  assert.equal(stale.mode, "curated");
  assert.equal(stale.authorizedDebitMilliCredits, 0n);
});
