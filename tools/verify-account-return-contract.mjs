import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import {
  ACCOUNT_RETURN_STATES,
  ACCOUNT_RETURN_UI_INTENT,
  clearResolvedAccountReturnFromHistory,
  resolveAccountReturnContract,
} from '../src/lib/accountReturnContract.js'

const recoveredSession = Object.freeze({
  sessionRecoveryComplete: true,
  sessionConfirmed: true,
})

const pendingRootReturn = resolveAccountReturnContract({
  url: '/?account_return=1',
})
assert.equal(pendingRootReturn.recognized, true)
assert.equal(pendingRootReturn.routeIntent, 'root-account-return')
assert.equal(pendingRootReturn.state, ACCOUNT_RETURN_STATES.PENDING_SESSION)
assert.equal(pendingRootReturn.historyReplacement, null)
assert.equal(pendingRootReturn.uiIntent, null)
assert.equal(pendingRootReturn.entitlementAction, 'none')

const confirmedRootReturn = resolveAccountReturnContract({
  url: 'https://www.digitalhut.app/?account_return=confirmed',
  ...recoveredSession,
})
assert.equal(confirmedRootReturn.state, ACCOUNT_RETURN_STATES.CONFIRMED)
assert.equal(confirmedRootReturn.historyReplacement, '/')
assert.equal(confirmedRootReturn.uiIntent, ACCOUNT_RETURN_UI_INTENT)
assert.deepEqual(confirmedRootReturn.uiIntent, {
  type: 'reopen-account-and-three-plan-view',
  reopenAccount: true,
  reopenThreePlanView: true,
})
assert.equal(Object.isFrozen(confirmedRootReturn), true)
assert.equal(Object.isFrozen(confirmedRootReturn.uiIntent), true)
assert.equal(confirmedRootReturn.entitlementAction, 'none')

const fakeCode = 'FLOW3_FAKE_AUTH_CODE_DO_NOT_LOG'
const fakeAccessToken = 'FLOW3_FAKE_ACCESS_TOKEN_DO_NOT_LOG'
const fakeRefreshToken = 'FLOW3_FAKE_REFRESH_TOKEN_DO_NOT_LOG'
const confirmedCallback = resolveAccountReturnContract({
  url: `/auth/callback?code=${fakeCode}#access_token=${fakeAccessToken}&refresh_token=${fakeRefreshToken}`,
  ...recoveredSession,
})
assert.equal(confirmedCallback.routeIntent, 'auth-callback')
assert.equal(confirmedCallback.state, ACCOUNT_RETURN_STATES.CONFIRMED)
assert.deepEqual(Object.keys(confirmedCallback), [
  'recognized',
  'routeIntent',
  'state',
  'historyReplacement',
  'uiIntent',
  'entitlementAction',
])
const serializedCallback = JSON.stringify(confirmedCallback)
for (const secretValue of [fakeCode, fakeAccessToken, fakeRefreshToken]) {
  assert.equal(serializedCallback.includes(secretValue), false)
}

const missingSession = resolveAccountReturnContract({
  url: '/auth/callback',
  sessionRecoveryComplete: true,
  sessionConfirmed: false,
})
assert.equal(missingSession.state, ACCOUNT_RETURN_STATES.MISSING_SESSION)
assert.equal(missingSession.uiIntent, null)
assert.equal(missingSession.historyReplacement, '/')

const truthyStringSession = resolveAccountReturnContract({
  url: '/auth/callback',
  sessionRecoveryComplete: 'true',
  sessionConfirmed: 'true',
})
assert.equal(truthyStringSession.state, ACCOUNT_RETURN_STATES.PENDING_SESSION)
assert.equal(truthyStringSession.uiIntent, null)

const terminalCases = [
  ['/?account_return=cancelled', ACCOUNT_RETURN_STATES.CANCELED],
  ['/auth/callback?error=access_denied', ACCOUNT_RETURN_STATES.CANCELED],
  ['/auth/callback#error_code=oauth-canceled', ACCOUNT_RETURN_STATES.CANCELED],
  ['/?account_return=expired', ACCOUNT_RETURN_STATES.EXPIRED],
  ['/auth/callback?error_code=otp_expired', ACCOUNT_RETURN_STATES.EXPIRED],
  ['/?account_return=provider-disabled', ACCOUNT_RETURN_STATES.PROVIDER_DISABLED],
  [
    '/auth/callback#error_code=provider_not_enabled',
    ACCOUNT_RETURN_STATES.PROVIDER_DISABLED,
  ],
]

for (const [url, expectedState] of terminalCases) {
  const contract = resolveAccountReturnContract({
    url,
    ...recoveredSession,
  })
  assert.equal(contract.state, expectedState)
  assert.equal(contract.uiIntent, null)
  assert.equal(contract.historyReplacement, '/')
  assert.equal(contract.entitlementAction, 'none')
}

const unknownProviderError = resolveAccountReturnContract({
  url: '/auth/callback?error=unexpected_provider_failure',
  ...recoveredSession,
})
assert.equal(
  unknownProviderError.state,
  ACCOUNT_RETURN_STATES.MISSING_SESSION,
)
assert.equal(unknownProviderError.uiIntent, null)

const ambiguousRootError = resolveAccountReturnContract({
  url: '/?account_return=1&error=1',
  ...recoveredSession,
})
assert.equal(
  ambiguousRootError.state,
  ACCOUNT_RETURN_STATES.MISSING_SESSION,
)
assert.equal(ambiguousRootError.uiIntent, null)

const trailingSlashCallback = resolveAccountReturnContract({
  url: 'https://digitalhut.app/auth/callback/?code=fake',
  ...recoveredSession,
})
assert.equal(trailingSlashCallback.state, ACCOUNT_RETURN_STATES.CONFIRMED)

const ignoredUrls = [
  '/',
  '/?account_return=unknown',
  '/?account_return=1&account_return=confirmed',
  '/unrelated?account_return=1',
  'https://attacker.example/auth/callback',
  'javascript:alert(1)',
  'https://user:password@www.digitalhut.app/auth/callback',
]

for (const url of ignoredUrls) {
  const contract = resolveAccountReturnContract({
    url,
    ...recoveredSession,
  })
  assert.equal(contract.recognized, false)
  assert.equal(contract.state, ACCOUNT_RETURN_STATES.IGNORED)
  assert.equal(contract.uiIntent, null)
  assert.equal(contract.historyReplacement, null)
  assert.equal(contract.entitlementAction, 'none')
}

const historyCalls = []
const historyHarness = {
  replaceState(...args) {
    historyCalls.push(args)
  },
}
assert.equal(
  clearResolvedAccountReturnFromHistory(historyHarness, pendingRootReturn),
  false,
)
assert.equal(
  clearResolvedAccountReturnFromHistory(historyHarness, {
    ...confirmedRootReturn,
  }),
  false,
)
assert.equal(
  clearResolvedAccountReturnFromHistory(historyHarness, confirmedRootReturn),
  true,
)
assert.deepEqual(historyCalls, [[null, '', '/']])

const helperSource = readFileSync(
  new URL('../src/lib/accountReturnContract.js', import.meta.url),
  'utf8',
)
for (const forbiddenPersistenceOrLoggingApi of [
  'console.',
  'localStorage',
  'sessionStorage',
  'document.cookie',
  'indexedDB',
]) {
  assert.equal(
    helperSource.includes(forbiddenPersistenceOrLoggingApi),
    false,
    `helper must not use ${forbiddenPersistenceOrLoggingApi}`,
  )
}

console.log(JSON.stringify({
  verifier: 'account-return-contract',
  cases: 21,
  status: 'passed',
}))
