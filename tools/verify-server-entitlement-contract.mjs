import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import {
  SERVER_ENTITLEMENT_AUTHORITY,
  SERVER_ENTITLEMENT_STATES,
  SERVER_ENTITLEMENT_TIERS,
  interpretServerEntitlement,
} from '../src/lib/serverEntitlementContract.js'

const USER_ID = 'user-flow3-001'
const NOW = '2026-07-24T12:02:00.000Z'
const CHECKED_AT = '2026-07-24T12:00:00.000Z'
const FRESH_UNTIL = '2026-07-24T12:05:00.000Z'
const ACCESS_ENDS_AT = '2026-08-24T12:00:00.000Z'

const baseReadModel = Object.freeze({
  authority: SERVER_ENTITLEMENT_AUTHORITY,
  signatureVerified: true,
  signatureKeyId: 'entitlement-key-2026-07',
  signatureId: 'signature-flow3-001',
  userId: USER_ID,
  tierId: SERVER_ENTITLEMENT_TIERS.PREMIUM,
  receiptId: 'receipt-flow3-001',
  receiptTierId: SERVER_ENTITLEMENT_TIERS.PREMIUM,
  version: 12,
  receiptVersion: 12,
  checkedAt: CHECKED_AT,
  freshUntil: FRESH_UNTIL,
  state: SERVER_ENTITLEMENT_STATES.ACTIVE,
})

const baseInput = Object.freeze({
  authenticatedUserId: USER_ID,
  transportState: 'ok',
  now: NOW,
  minimumAcceptedVersion: 10,
})

let scenarioCount = 0

function scenario(name, verify) {
  verify()
  scenarioCount += 1
  assert.equal(typeof name, 'string')
}

function readModel(overrides = {}) {
  return {...baseReadModel, ...overrides}
}

function interpret({
  modelOverrides = {},
  inputOverrides = {},
  readModelValue,
} = {}) {
  return interpretServerEntitlement({
    ...baseInput,
    ...inputOverrides,
    readModel: readModelValue === undefined
      ? readModel(modelOverrides)
      : readModelValue,
  })
}

function expectLocked(decision, {
  state,
  reason,
  accountSurface = 'signed-in-recoverable',
} = {}) {
  assert.equal(decision.accessAllowed, false)
  assert.equal(decision.accessBasis, 'none')
  assert.equal(decision.clientGrantAllowed, false)
  assert.equal(decision.serverEnforcementRequired, true)
  assert.equal(decision.entitlementAction, 'none')
  assert.equal(decision.accountSurface, accountSurface)
  if (state) assert.equal(decision.state, state)
  if (reason) assert.equal(decision.reason, reason)
}

scenario('active user-bound receipt grants display access', () => {
  const decision = interpret()
  assert.equal(decision.state, SERVER_ENTITLEMENT_STATES.ACTIVE)
  assert.equal(decision.reason, 'active-server-entitlement')
  assert.equal(decision.accessAllowed, true)
  assert.equal(decision.accessBasis, 'fresh-server-entitlement')
  assert.equal(decision.tierId, SERVER_ENTITLEMENT_TIERS.PREMIUM)
  assert.equal(decision.source, 'server-entitlement-read-model')
  assert.equal(decision.accountSurface, 'signed-in')
  assert.equal(decision.threePlan.selectedTierId, SERVER_ENTITLEMENT_TIERS.PREMIUM)
  assert.match(decision.threePlan.message, /Premium access is active/)
  assert.equal(decision.clientGrantAllowed, false)
  assert.equal(decision.serverEnforcementRequired, true)
  assert.equal(decision.entitlementAction, 'none')
  assert.equal(Object.isFrozen(decision), true)
  assert.equal(Object.isFrozen(decision.threePlan), true)
})

scenario('all three canonical tiers can be read from authority', () => {
  for (const tierId of [
    SERVER_ENTITLEMENT_TIERS.STANDARD,
    SERVER_ENTITLEMENT_TIERS.PREMIUM,
    SERVER_ENTITLEMENT_TIERS.PRO,
  ]) {
    const decision = interpret({
      modelOverrides: {tierId, receiptTierId: tierId},
    })
    assert.equal(decision.accessAllowed, true)
    assert.equal(decision.tierId, tierId)
  }
})

scenario('cross-user response fails closed without leaking tier', () => {
  const decision = interpret({
    modelOverrides: {userId: 'different-user-002'},
  })
  expectLocked(decision, {reason: 'user-binding-mismatch'})
  assert.equal(decision.tierId, null)
  assert.equal(decision.source, 'none')
})

scenario('unverified signature fails closed', () => {
  const decision = interpret({
    modelOverrides: {signatureVerified: false},
  })
  expectLocked(decision, {reason: 'untrusted-read-model'})
})

scenario('wrong read-model authority fails closed', () => {
  const decision = interpret({
    modelOverrides: {authority: 'client-asserted-entitlement'},
  })
  expectLocked(decision, {reason: 'untrusted-read-model'})
})

scenario('replayed version below the accepted floor is stale', () => {
  const decision = interpret({
    modelOverrides: {version: 9, receiptVersion: 9},
  })
  expectLocked(decision, {
    state: SERVER_ENTITLEMENT_STATES.STALE,
    reason: 'replayed-or-stale-version',
  })
})

scenario('receipt version mismatch fails closed', () => {
  const decision = interpret({
    modelOverrides: {receiptVersion: 11},
  })
  expectLocked(decision, {
    state: SERVER_ENTITLEMENT_STATES.STALE,
    reason: 'receipt-version-mismatch',
  })
})

scenario('receipt tier mismatch fails closed', () => {
  const decision = interpret({
    modelOverrides: {receiptTierId: SERVER_ENTITLEMENT_TIERS.PRO},
  })
  expectLocked(decision, {reason: 'tier-receipt-mismatch'})
})

scenario('future cancellation honors the authoritative paid-through time', () => {
  const decision = interpret({
    modelOverrides: {
      state: SERVER_ENTITLEMENT_STATES.CANCELED,
      accessEndsAt: ACCESS_ENDS_AT,
    },
  })
  assert.equal(decision.state, SERVER_ENTITLEMENT_STATES.CANCELED)
  assert.equal(decision.reason, 'canceled-access-through-period')
  assert.equal(decision.accessAllowed, true)
  assert.equal(decision.accessEndsAt, ACCESS_ENDS_AT)
  assert.match(decision.threePlan.message, /is canceled/)
})

scenario('cancellation at or after its end time revokes access', () => {
  const decision = interpret({
    modelOverrides: {
      state: SERVER_ENTITLEMENT_STATES.CANCELED,
      accessEndsAt: '2026-07-24T12:02:00.000Z',
    },
  })
  expectLocked(decision, {
    state: SERVER_ENTITLEMENT_STATES.CANCELED,
    reason: 'canceled-access-ended',
  })
})

scenario('cancellation without an authoritative end fails closed', () => {
  const decision = interpret({
    modelOverrides: {state: SERVER_ENTITLEMENT_STATES.CANCELED},
  })
  expectLocked(decision, {reason: 'missing-cancellation-end'})
})

scenario('grace access lasts only through its authoritative window', () => {
  const activeGrace = interpret({
    modelOverrides: {
      state: SERVER_ENTITLEMENT_STATES.GRACE,
      accessEndsAt: ACCESS_ENDS_AT,
    },
  })
  assert.equal(activeGrace.accessAllowed, true)
  assert.equal(activeGrace.reason, 'grace-window-active')

  const endedGrace = interpret({
    modelOverrides: {
      state: SERVER_ENTITLEMENT_STATES.GRACE,
      accessEndsAt: '2026-07-24T12:02:00.000Z',
    },
  })
  expectLocked(endedGrace, {
    state: SERVER_ENTITLEMENT_STATES.GRACE,
    reason: 'grace-window-ended',
  })
})

scenario('suspension preserves account but locks paid access', () => {
  const decision = interpret({
    modelOverrides: {state: SERVER_ENTITLEMENT_STATES.SUSPENDED},
  })
  expectLocked(decision, {
    state: SERVER_ENTITLEMENT_STATES.SUSPENDED,
    reason: 'server-entitlement-suspended',
  })
  assert.match(decision.threePlan.message, /account remains available/)
})

scenario('expiration revokes paid access', () => {
  const decision = interpret({
    modelOverrides: {state: SERVER_ENTITLEMENT_STATES.EXPIRED},
  })
  expectLocked(decision, {
    state: SERVER_ENTITLEMENT_STATES.EXPIRED,
    reason: 'server-entitlement-expired',
  })
})

scenario('refund revokes paid access', () => {
  const decision = interpret({
    modelOverrides: {
      state: SERVER_ENTITLEMENT_STATES.REFUNDED,
      accessEndsAt: ACCESS_ENDS_AT,
    },
  })
  expectLocked(decision, {
    state: SERVER_ENTITLEMENT_STATES.REFUNDED,
    reason: 'server-entitlement-refunded',
  })
})

scenario('dispute pauses paid access', () => {
  const decision = interpret({
    modelOverrides: {
      state: SERVER_ENTITLEMENT_STATES.DISPUTED,
      accessEndsAt: ACCESS_ENDS_AT,
    },
  })
  expectLocked(decision, {
    state: SERVER_ENTITLEMENT_STATES.DISPUTED,
    reason: 'server-entitlement-disputed',
  })
})

scenario('chargeback revokes paid access', () => {
  const decision = interpret({
    modelOverrides: {
      state: SERVER_ENTITLEMENT_STATES.CHARGEBACK,
      accessEndsAt: ACCESS_ENDS_AT,
    },
  })
  expectLocked(decision, {
    state: SERVER_ENTITLEMENT_STATES.CHARGEBACK,
    reason: 'server-entitlement-chargeback',
  })
})

scenario('authoritative missing state offers all three plans', () => {
  const decision = interpret({
    modelOverrides: {
      state: SERVER_ENTITLEMENT_STATES.MISSING,
      tierId: SERVER_ENTITLEMENT_TIERS.NONE,
      receiptTierId: SERVER_ENTITLEMENT_TIERS.NONE,
    },
  })
  expectLocked(decision, {
    state: SERVER_ENTITLEMENT_STATES.MISSING,
    reason: 'server-entitlement-missing',
  })
  assert.equal(decision.tierId, null)
  assert.match(decision.threePlan.message, /Standard, Premium, and Pro/)
})

scenario('expired freshness fails closed', () => {
  const decision = interpret({
    modelOverrides: {freshUntil: '2026-07-24T12:02:00.000Z'},
  })
  expectLocked(decision, {
    state: SERVER_ENTITLEMENT_STATES.STALE,
    reason: 'stale-read-model',
  })
})

scenario('signed stale state fails closed with fresh-plan messaging', () => {
  const decision = interpret({
    modelOverrides: {
      state: SERVER_ENTITLEMENT_STATES.STALE,
      tierId: SERVER_ENTITLEMENT_TIERS.NONE,
      receiptTierId: SERVER_ENTITLEMENT_TIERS.NONE,
    },
  })
  expectLocked(decision, {
    state: SERVER_ENTITLEMENT_STATES.STALE,
    reason: 'server-entitlement-stale',
  })
  assert.equal(decision.threePlan.action, 'retry-verification')
})

scenario('malformed authoritative timestamps fail closed', () => {
  for (const modelOverrides of [
    {checkedAt: 'not-a-time'},
    {freshUntil: '2026-02-30T12:05:00.000Z'},
    {
      state: SERVER_ENTITLEMENT_STATES.CANCELED,
      accessEndsAt: 'tomorrow',
    },
  ]) {
    const decision = interpret({modelOverrides})
    expectLocked(decision)
  }
})

scenario('future and excessive freshness windows fail closed', () => {
  const future = interpret({
    modelOverrides: {
      checkedAt: '2026-07-24T12:04:00.000Z',
      freshUntil: '2026-07-24T12:08:00.000Z',
    },
  })
  expectLocked(future, {
    state: SERVER_ENTITLEMENT_STATES.STALE,
    reason: 'invalid-freshness-window',
  })

  const excessive = interpret({
    modelOverrides: {
      freshUntil: '2026-07-24T12:30:00.000Z',
    },
  })
  expectLocked(excessive, {
    state: SERVER_ENTITLEMENT_STATES.STALE,
    reason: 'invalid-freshness-window',
  })
})

scenario('offline mode ignores an otherwise active response', () => {
  const decision = interpret({
    inputOverrides: {transportState: 'offline'},
  })
  expectLocked(decision, {
    state: SERVER_ENTITLEMENT_STATES.OFFLINE,
    reason: 'offline',
  })
})

scenario('provider read error ignores an otherwise active response', () => {
  const decision = interpret({
    inputOverrides: {transportState: 'provider-error'},
  })
  expectLocked(decision, {
    state: SERVER_ENTITLEMENT_STATES.PROVIDER_ERROR,
    reason: 'provider-read-failed',
  })
})

scenario('signed provider-error read model also fails closed', () => {
  const decision = interpret({
    modelOverrides: {
      state: SERVER_ENTITLEMENT_STATES.PROVIDER_ERROR,
      tierId: SERVER_ENTITLEMENT_TIERS.NONE,
      receiptTierId: SERVER_ENTITLEMENT_TIERS.NONE,
    },
  })
  expectLocked(decision, {
    state: SERVER_ENTITLEMENT_STATES.PROVIDER_ERROR,
    reason: 'server-reported-provider-error',
  })
})

scenario('signed-out state ignores an otherwise active response', () => {
  const decision = interpret({
    inputOverrides: {authenticatedUserId: null},
  })
  expectLocked(decision, {
    state: SERVER_ENTITLEMENT_STATES.SIGNED_OUT,
    reason: 'signed-out',
    accountSurface: 'sign-in',
  })
  assert.equal(decision.threePlan.action, 'sign-in')
})

scenario('unknown lifecycle state fails closed', () => {
  const decision = interpret({
    modelOverrides: {state: 'future-unrecognized-state'},
  })
  expectLocked(decision, {reason: 'unknown-entitlement-state'})
})

scenario('client-only completion signals cannot grant access', () => {
  const decision = interpretServerEntitlement({
    ...baseInput,
    readModel: null,
    clientTier: SERVER_ENTITLEMENT_TIERS.PRO,
    paypalButtonCompleted: true,
    emailConfirmationComplete: true,
    urlParameters: {tier: SERVER_ENTITLEMENT_TIERS.PRO},
    localStorageTier: SERVER_ENTITLEMENT_TIERS.PRO,
  })
  expectLocked(decision, {reason: 'missing-read-model'})
})

scenario('active status cannot outlive its authoritative access end', () => {
  const decision = interpret({
    modelOverrides: {
      accessEndsAt: '2026-07-24T12:01:00.000Z',
    },
  })
  expectLocked(decision, {
    state: SERVER_ENTITLEMENT_STATES.STALE,
    reason: 'active-access-window-ended',
  })
})

scenario('missing state cannot smuggle a paid tier', () => {
  const decision = interpret({
    modelOverrides: {state: SERVER_ENTITLEMENT_STATES.MISSING},
  })
  expectLocked(decision, {reason: 'tier-receipt-mismatch'})
})

scenario('invalid evaluation context fails closed', () => {
  const invalidTime = interpret({
    inputOverrides: {now: '2026-07-24'},
  })
  expectLocked(invalidTime, {reason: 'invalid-evaluation-time'})

  const invalidFloor = interpret({
    inputOverrides: {minimumAcceptedVersion: 0},
  })
  expectLocked(invalidFloor, {reason: 'invalid-version-floor'})
})

const helperSource = readFileSync(
  new URL('../src/lib/serverEntitlementContract.js', import.meta.url),
  'utf8',
)
for (const forbiddenClientAuthority of [
  'console.',
  'localStorage',
  'sessionStorage',
  'document.',
  'window.',
  'fetch(',
]) {
  assert.equal(
    helperSource.includes(forbiddenClientAuthority),
    false,
    `pure helper must not use ${forbiddenClientAuthority}`,
  )
}

console.log(JSON.stringify({
  verifier: 'server-entitlement-contract',
  scenarios: scenarioCount,
  status: 'passed',
}))
