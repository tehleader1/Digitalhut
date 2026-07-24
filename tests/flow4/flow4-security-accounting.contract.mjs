import assert from "node:assert/strict"
import {test} from "node:test"

import {
  allocatePurchaseMicros,
  assertFlow4LedgerRecord,
  measurePayloadBytes
} from "./fixtures/mock-flow4-system.mjs"

export const FLOW4_ACCEPTANCE_CONTRACT = Object.freeze({
  version:"flow4-security-accounting-v1",
  execution:"mock-or-isolated-fixture-only",
  consumerSubscriptionPortable:false,
  requiredAdapterMethods:Object.freeze([
    "connectFoundry",
    "reserveCredits",
    "finalizeReservation",
    "seedCreditOrder",
    "captureCreditOrder",
    "routePaidReaction",
    "takeRateLimit",
    "creditBalance",
    "snapshot",
    "injectCaptureCommitFailureOnce",
    "advanceTime"
  ]),
  factoryOptions:Object.freeze([
    "initialCredits",
    "dnsRecords",
    "foundryResponder",
    "providerBehavior",
    "maxPayloadBytes",
    "now"
  ]),
  snapshotCollections:Object.freeze([
    "ledger",
    "orders",
    "foundryRequests",
    "providerCalls"
  ]),
  forbiddenEffects:Object.freeze([
    "live-provider-call",
    "real-secret-read",
    "real-payment",
    "database-mutation",
    "deployment"
  ])
})

function contractError(code){
  return (error) => error?.code === code
}

function exactPayload(targetBytes){
  const overhead = measurePayloadBytes({pad:""})
  if(targetBytes < overhead) throw new Error("target payload is smaller than JSON framing")
  const payload = {pad:"x".repeat(targetBytes - overhead)}
  assert.equal(measurePayloadBytes(payload), targetBytes)
  return payload
}

function completedCapture({
  userId,
  orderId,
  packKey = "fixture-pack",
  captureId = "CAPTURE-FLOW4-0001",
  amountUsdMicros = 20_000_000n,
  paymentFeeUsdMicros = 880_000n
}){
  return {
    orderId,
    captureId,
    orderStatus:"COMPLETED",
    captureStatus:"COMPLETED",
    currency:"USD",
    amountUsdMicros,
    paymentFeeUsdMicros,
    customId:`digitalhut-ai:${userId}:${packKey}`
  }
}

export function defineFlow4AcceptanceSuite({createSystem}){
  if(typeof createSystem !== "function") throw new TypeError("createSystem is required")

  test("Flow 4 / Foundry rejects endpoint smuggling before credential forwarding", async () => {
    const credential = "fixture-credential-must-never-leak"
    const rejected = [
      "http://flow4.services.ai.azure.com",
      "https://attacker.example",
      "https://flow4.services.ai.azure.com.attacker.example",
      "https://flow4.services.ai.azure.com.",
      "https://user:secret@flow4.services.ai.azure.com",
      "https://flow4.services.ai.azure.com/path",
      "https://flow4.services.ai.azure.com?next=https://attacker.example",
      "https://flow4.services.ai.azure.com/#fragment",
      "https://flow4.services.ai.azure.com:444",
      "https://127.0.0.1",
      "https://2130706433",
      "https://[::1]",
      "https://localhost",
      "https://metadata.google.internal"
    ]

    for(const endpoint of rejected){
      const system = createSystem()
      const result = await system.connectFoundry({
        authUserId:"user-foundry",
        endpoint,
        deployment:"reaction",
        credential
      })
      assert.equal(result.ok, false, endpoint)
      assert.equal(system.snapshot().foundryRequests.length, 0, endpoint)
      assert.doesNotMatch(JSON.stringify(system.snapshot()), new RegExp(credential))
    }

    const unauthenticated = createSystem()
    const unauthenticatedResult = await unauthenticated.connectFoundry({
      authUserId:"",
      endpoint:"https://flow4.services.ai.azure.com",
      deployment:"reaction",
      credential
    })
    assert.deepEqual(unauthenticatedResult, {ok:false, reason:"sign-in-required"})
    assert.equal(unauthenticated.snapshot().foundryRequests.length, 0)

    const invalidDeployment = createSystem()
    const invalidDeploymentResult = await invalidDeployment.connectFoundry({
      authUserId:"user-foundry",
      endpoint:"https://flow4.services.ai.azure.com",
      deployment:"../reaction",
      credential
    })
    assert.equal(invalidDeploymentResult.ok, false)
    assert.equal(invalidDeployment.snapshot().foundryRequests.length, 0)

    const system = createSystem()
    const result = await system.connectFoundry({
      authUserId:"user-foundry",
      endpoint:"https://flow4.services.ai.azure.com:443",
      deployment:"reaction_v2",
      credential
    })
    assert.equal(result.ok, true)
    assert.equal(system.snapshot().foundryRequests.length, 1)
    assert.equal(system.snapshot().foundryRequests[0].redirect, "error")
    assert.doesNotMatch(JSON.stringify(system.snapshot()), new RegExp(credential))
  })

  test("Flow 4 / Foundry rejects private DNS and never follows credential-bearing redirects", async () => {
    for(const address of [
      "127.0.0.1",
      "10.0.0.8",
      "169.254.169.254",
      "192.168.1.2",
      "::1",
      "fc00::10",
      "fe80::1"
    ]){
      const system = createSystem({
        dnsRecords:{"flow4.services.ai.azure.com":[address]}
      })
      const result = await system.connectFoundry({
        authUserId:"user-foundry",
        endpoint:"https://flow4.services.ai.azure.com",
        deployment:"reaction",
        credential:"fixture-private-dns-credential"
      })
      assert.equal(result.ok, false, address)
      assert.equal(result.reason, "foundry-private-address-rejected")
      assert.equal(system.snapshot().foundryRequests.length, 0)
    }

    const system = createSystem({
      foundryResponder:async () => ({
        ok:false,
        status:307,
        location:"http://169.254.169.254/latest/meta-data"
      })
    })
    const result = await system.connectFoundry({
      authUserId:"user-foundry",
      endpoint:"https://flow4.services.ai.azure.com",
      deployment:"reaction",
      credential:"fixture-redirect-credential"
    })
    assert.deepEqual(result, {ok:false, reason:"foundry-redirect-rejected"})
    assert.equal(system.snapshot().foundryRequests.length, 1)
    assert.equal(
      system.snapshot().foundryRequests.some(({url}) => url.includes("169.254.169.254")),
      false
    )
  })

  test("Flow 4 / reserve and terminal settlement stay atomic under concurrency", async () => {
    const userId = "user-concurrency"
    const system = createSystem({
      initialCredits:[{userId, milliCredits:1_000n, grossUsdMicros:1_000n}]
    })
    const reservations = await Promise.allSettled(
      Array.from({length:20}, (_, index) => system.reserveCredits({
        authUserId:userId,
        idempotencyKey:`parallel-${index}`,
        milliCredits:100n,
        provider:"openai",
        model:"fixture-model"
      }))
    )
    assert.equal(reservations.filter(({status}) => status === "fulfilled").length, 10)
    assert.equal(
      reservations.filter(({status, reason}) =>
        status === "rejected" && reason?.code === "insufficient-credits"
      ).length,
      10
    )
    assert.equal(system.creditBalance(userId), 0n)
    assert.equal(
      system.snapshot().ledger.filter(({entryType}) => entryType === "reserve").length,
      10
    )

    const terminalSystem = createSystem({
      initialCredits:[{userId, milliCredits:100n, grossUsdMicros:100n}]
    })
    const reservation = await terminalSystem.reserveCredits({
      authUserId:userId,
      idempotencyKey:"one-terminal",
      milliCredits:100n,
      provider:"openai",
      model:"fixture-model"
    })
    const terminalResults = await Promise.allSettled([
      terminalSystem.finalizeReservation({
        authUserId:userId,
        reserveEntryId:reservation.row.id,
        success:true,
        providerCostUsdMicros:12n,
        inputTokens:8n,
        outputTokens:2n,
        receiptHash:"success"
      }),
      terminalSystem.finalizeReservation({
        authUserId:userId,
        reserveEntryId:reservation.row.id,
        success:false,
        receiptHash:"failure"
      })
    ])
    assert.equal(terminalResults.filter(({status}) => status === "fulfilled").length, 1)
    assert.equal(
      terminalResults.filter(({status, reason}) =>
        status === "rejected" && reason?.code === "terminal-idempotency-conflict"
      ).length,
      1
    )
    assert.equal(
      terminalSystem.snapshot().ledger.filter(({reserveEntryId}) =>
        reserveEntryId === reservation.row.id
      ).length,
      1
    )
  })

  test("Flow 4 / idempotency is per-user and rejects changed replay payloads", async () => {
    const system = createSystem({
      initialCredits:[
        {userId:"user-a", milliCredits:200n, grossUsdMicros:200n},
        {userId:"user-b", milliCredits:200n, grossUsdMicros:200n}
      ]
    })
    const [firstA, firstB] = await Promise.all([
      system.reserveCredits({
        authUserId:"user-a",
        idempotencyKey:"shared-client-key",
        milliCredits:50n,
        provider:"openai",
        model:"fixture-model"
      }),
      system.reserveCredits({
        authUserId:"user-b",
        idempotencyKey:"shared-client-key",
        milliCredits:50n,
        provider:"openai",
        model:"fixture-model"
      })
    ])
    assert.notEqual(firstA.row.id, firstB.row.id)
    assert.notEqual(firstA.row.externalReference, firstB.row.externalReference)

    const duplicateA = await system.reserveCredits({
      authUserId:"user-a",
      idempotencyKey:"shared-client-key",
      milliCredits:50n,
      provider:"openai",
      model:"fixture-model"
    })
    assert.equal(duplicateA.duplicate, true)
    assert.equal(duplicateA.row.id, firstA.row.id)
    assert.equal(
      system.snapshot().ledger.filter(({entryType}) => entryType === "reserve").length,
      2
    )

    await assert.rejects(
      system.reserveCredits({
        authUserId:"user-a",
        idempotencyKey:"shared-client-key",
        milliCredits:51n,
        provider:"openai",
        model:"fixture-model"
      }),
      contractError("idempotency-conflict")
    )
  })

  test("Flow 4 / end-to-end replay never repeats paid provider inference", async () => {
    const userId = "user-route-replay"
    let finishProvider
    let signalProviderStarted
    const providerGate = new Promise((resolve) => { finishProvider = resolve })
    const providerStarted = new Promise((resolve) => { signalProviderStarted = resolve })
    const system = createSystem({
      initialCredits:[{userId, milliCredits:500n, grossUsdMicros:500n}],
      providerBehavior:async () => {
        signalProviderStarted()
        await providerGate
        return {
          ok:true,
          inputTokens:20n,
          outputTokens:5n,
          providerCostUsdMicros:40n,
          responseHash:"fixture-replay-response"
        }
      }
    })
    const firstPromise = system.routePaidReaction({
      authUserId:userId,
      idempotencyKey:"route-replay",
      request:{subject:"one provider call"},
      milliCredits:100n
    })
    await providerStarted
    const concurrentReplay = await system.routePaidReaction({
      authUserId:userId,
      idempotencyKey:"route-replay",
      request:{subject:"one provider call"},
      milliCredits:100n
    })
    assert.equal(concurrentReplay.mode, "curated")
    assert.equal(concurrentReplay.fallbackReason, "settlement-pending")
    assert.equal(system.snapshot().providerCalls.length, 1)

    finishProvider()
    const first = await firstPromise
    assert.equal(first.mode, "digitalhut-paid")
    const ledgerCount = system.snapshot().ledger.length
    const completedReplay = await system.routePaidReaction({
      authUserId:userId,
      idempotencyKey:"route-replay",
      request:{subject:"one provider call"},
      milliCredits:100n
    })
    assert.equal(completedReplay.mode, "digitalhut-paid")
    assert.equal(completedReplay.duplicate, true)
    assert.equal(system.snapshot().providerCalls.length, 1)
    assert.equal(system.snapshot().ledger.length, ledgerCount)
  })

  test("Flow 4 / purchase capture reconciliation mints once or not at all", async () => {
    const userId = "user-capture"
    const orderId = "ORDER-FLOW4-0001"
    const receipt = completedCapture({userId, orderId})
    const system = createSystem()
    system.seedCreditOrder({
      userId,
      orderId,
      amountUsdMicros:20_000_000n,
      milliCredits:48_000n
    })

    await assert.rejects(
      system.captureCreditOrder({
        authUserId:"different-user",
        orderId,
        receipt:{...receipt, customId:"digitalhut-ai:different-user:fixture-pack"}
      }),
      contractError("credit-order-not-found")
    )
    assert.equal(system.snapshot().ledger.length, 0)

    for(const invalidReceipt of [
      {...receipt, orderStatus:"APPROVED"},
      {...receipt, captureStatus:"PENDING"},
      {...receipt, currency:"EUR"},
      {...receipt, amountUsdMicros:19_999_999n},
      {...receipt, customId:`digitalhut-ai:${userId}:different-pack`}
    ]){
      await assert.rejects(
        system.captureCreditOrder({authUserId:userId, orderId, receipt:invalidReceipt}),
        contractError("capture-verification-failed")
      )
      assert.equal(system.snapshot().ledger.length, 0)
      assert.equal(system.snapshot().orders[0].status, "created")
    }

    system.injectCaptureCommitFailureOnce()
    await assert.rejects(
      system.captureCreditOrder({authUserId:userId, orderId, receipt}),
      contractError("capture-commit-failed")
    )
    assert.equal(system.snapshot().ledger.length, 0)
    assert.equal(system.snapshot().orders[0].status, "created")

    const captures = await Promise.all(
      Array.from({length:12}, () =>
        system.captureCreditOrder({authUserId:userId, orderId, receipt})
      )
    )
    assert.equal(captures.filter(({duplicate}) => duplicate === false).length, 1)
    assert.equal(captures.filter(({duplicate}) => duplicate === true).length, 11)
    const purchases = system.snapshot().ledger.filter(({entryType}) => entryType === "purchase")
    assert.equal(purchases.length, 1)
    assert.equal(purchases[0].milliCredits, 48_000n)
    assert.equal(system.creditBalance(userId), 48_000n)

    await assert.rejects(
      system.captureCreditOrder({
        authUserId:userId,
        orderId,
        receipt:{...receipt, paymentFeeUsdMicros:880_001n}
      }),
      contractError("capture-idempotency-conflict")
    )
    assert.equal(system.snapshot().ledger.filter(({entryType}) => entryType === "purchase").length, 1)
  })

  test("Flow 4 / ledger signs and four-way integer allocation are lossless", async () => {
    const gross = 9_007_199_254_740_993n
    const fee = 345_678_901n
    const allocation = allocatePurchaseMicros(gross, fee)
    assert.ok(Object.values(allocation).every((value) => typeof value === "bigint" && value >= 0n))
    assert.equal(
      allocation.providerBudgetUsdMicros
        + allocation.paymentFeeUsdMicros
        + allocation.operatingReserveUsdMicros
        + allocation.ownerProfitUsdMicros,
      gross
    )

    const userId = "user-ledger"
    const system = createSystem({
      initialCredits:[{userId, milliCredits:500n, grossUsdMicros:500n}]
    })
    const releasedReserve = await system.reserveCredits({
      authUserId:userId,
      idempotencyKey:"release-shape",
      milliCredits:100n,
      provider:"openai",
      model:"fixture-model"
    })
    await system.finalizeReservation({
      authUserId:userId,
      reserveEntryId:releasedReserve.row.id,
      success:false,
      receiptHash:"provider-failed"
    })
    const consumedReserve = await system.reserveCredits({
      authUserId:userId,
      idempotencyKey:"consume-shape",
      milliCredits:100n,
      provider:"openai",
      model:"fixture-model"
    })
    await system.finalizeReservation({
      authUserId:userId,
      reserveEntryId:consumedReserve.row.id,
      success:true,
      providerCostUsdMicros:27n,
      inputTokens:20n,
      outputTokens:5n,
      receiptHash:"provider-succeeded"
    })
    for(const entry of system.snapshot().ledger) assert.equal(assertFlow4LedgerRecord(entry), true)
    assert.equal(system.creditBalance(userId), 400n)
  })

  test("Flow 4 / rate and payload limits fail closed before extra debit or inference", async () => {
    const userId = "user-limits"
    const maxPayloadBytes = 20 * 1024
    const system = createSystem({
      maxPayloadBytes,
      initialCredits:[{userId, milliCredits:1_000n, grossUsdMicros:1_000n}]
    })
    const first = await system.routePaidReaction({
      authUserId:userId,
      idempotencyKey:"rate-1",
      request:{subject:"one"},
      milliCredits:10n,
      ratePolicy:{limit:2, windowMs:60_000}
    })
    const second = await system.routePaidReaction({
      authUserId:userId,
      idempotencyKey:"rate-2",
      request:{subject:"two"},
      milliCredits:10n,
      ratePolicy:{limit:2, windowMs:60_000}
    })
    const ledgerCountBeforeLimit = system.snapshot().ledger.length
    const third = await system.routePaidReaction({
      authUserId:userId,
      idempotencyKey:"rate-3",
      request:{subject:"three"},
      milliCredits:10n,
      ratePolicy:{limit:2, windowMs:60_000}
    })
    assert.equal(first.mode, "digitalhut-paid")
    assert.equal(second.mode, "digitalhut-paid")
    assert.equal(third.mode, "curated")
    assert.equal(third.fallbackReason, "rate-limit-exceeded")
    assert.equal(system.snapshot().ledger.length, ledgerCountBeforeLimit)
    assert.equal(system.snapshot().providerCalls.length, 2)

    const payloadSystem = createSystem({
      maxPayloadBytes,
      initialCredits:[{userId, milliCredits:1_000n, grossUsdMicros:1_000n}]
    })
    const accepted = await payloadSystem.routePaidReaction({
      authUserId:userId,
      idempotencyKey:"payload-exact",
      request:exactPayload(maxPayloadBytes),
      milliCredits:10n
    })
    assert.equal(accepted.mode, "digitalhut-paid")
    const beforeOversize = payloadSystem.snapshot()
    const rejected = await payloadSystem.routePaidReaction({
      authUserId:userId,
      idempotencyKey:"payload-over",
      request:exactPayload(maxPayloadBytes + 1),
      milliCredits:10n
    })
    assert.equal(rejected.mode, "curated")
    assert.equal(rejected.fallbackReason, "request-too-large")
    assert.equal(payloadSystem.snapshot().ledger.length, beforeOversize.ledger.length)
    assert.equal(payloadSystem.snapshot().providerCalls.length, beforeOversize.providerCalls.length)

    const namespaceSystem = createSystem({now:1_785_000_000_000})
    assert.equal(namespaceSystem.takeRateLimit({
      userId:"user-a",
      action:"react",
      limit:1,
      windowMs:60_000
    }), true)
    assert.equal(namespaceSystem.takeRateLimit({
      userId:"user-a",
      action:"react",
      limit:1,
      windowMs:60_000
    }), false)
    assert.equal(namespaceSystem.takeRateLimit({
      userId:"user-a",
      action:"connect-provider",
      limit:1,
      windowMs:60_000
    }), true)
    assert.equal(namespaceSystem.takeRateLimit({
      userId:"user-b",
      action:"react",
      limit:1,
      windowMs:60_000
    }), true)
    namespaceSystem.advanceTime(60_000)
    assert.equal(namespaceSystem.takeRateLimit({
      userId:"user-a",
      action:"react",
      limit:1,
      windowMs:60_000
    }), true)
  })

  test("Flow 4 / server authority ignores claimed credits and consumer subscriptions", async () => {
    assert.equal(FLOW4_ACCEPTANCE_CONTRACT.consumerSubscriptionPortable, false)
    const system = createSystem({
      initialCredits:[{userId:"victim", milliCredits:500n, grossUsdMicros:500n}]
    })
    const before = system.snapshot()
    const spoofed = await system.routePaidReaction({
      authUserId:"attacker",
      claimedUserId:"victim",
      clientCreditBalance:9_999_999n,
      consumerSubscription:{provider:"consumer-chat", status:"active"},
      idempotencyKey:"spoofed-credit",
      request:{subject:"server authority"},
      milliCredits:100n
    })
    assert.equal(spoofed.mode, "curated")
    assert.equal(spoofed.fallbackReason, "credits-exhausted")
    assert.equal(spoofed.consumerSubscriptionPortable, false)
    assert.equal(system.snapshot().ledger.length, before.ledger.length)
    assert.equal(system.snapshot().providerCalls.length, 0)
    assert.equal(system.creditBalance("victim"), 500n)
    assert.equal(system.creditBalance("attacker"), 0n)

    const unauthenticated = await system.routePaidReaction({
      authUserId:"",
      clientCreditBalance:9_999_999n,
      idempotencyKey:"unauthenticated",
      request:{subject:"no auth"},
      milliCredits:100n
    })
    assert.equal(unauthenticated.mode, "curated")
    assert.equal(unauthenticated.fallbackReason, "sign-in-required")
    assert.equal(system.snapshot().ledger.length, before.ledger.length)
  })

  test("Flow 4 / provider failure is explicitly curated and releases the full reserve", async () => {
    const userId = "user-fallback"
    const system = createSystem({
      initialCredits:[{userId, milliCredits:250n, grossUsdMicros:250n}],
      providerBehavior:async () => ({ok:false, reason:"fixture-provider-down"})
    })
    const beforeBalance = system.creditBalance(userId)
    const result = await system.routePaidReaction({
      authUserId:userId,
      idempotencyKey:"provider-failure",
      request:{subject:"graceful fallback"},
      milliCredits:100n
    })
    assert.equal(result.mode, "curated")
    assert.equal(result.fallbackReason, "provider-unavailable")
    assert.match(result.fallbackLabel, /curated reactions remain available/i)
    assert.equal(system.creditBalance(userId), beforeBalance)
    const reserve = system.snapshot().ledger.find(({entryType}) => entryType === "reserve")
    const terminals = system.snapshot().ledger.filter(({reserveEntryId}) =>
      reserveEntryId === reserve.id
    )
    assert.equal(terminals.length, 1)
    assert.equal(terminals[0].entryType, "release")
    assert.equal(terminals[0].milliCredits, -reserve.milliCredits)
  })
}
