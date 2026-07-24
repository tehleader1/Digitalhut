const CANONICAL_ORIGIN = 'https://www.digitalhut.app'
const ALLOWED_ORIGINS = new Set([
  CANONICAL_ORIGIN,
  'https://digitalhut.app',
])
const MAX_RETURN_URL_LENGTH = 8192

export const ACCOUNT_RETURN_STATES = Object.freeze({
  IGNORED: 'ignored',
  PENDING_SESSION: 'pending-session',
  CONFIRMED: 'confirmed',
  CANCELED: 'canceled',
  EXPIRED: 'expired',
  PROVIDER_DISABLED: 'provider-disabled',
  MISSING_SESSION: 'missing-session',
})

export const ACCOUNT_RETURN_UI_INTENT = Object.freeze({
  type: 'reopen-account-and-three-plan-view',
  reopenAccount: true,
  reopenThreePlanView: true,
})

const SUCCESS_RETURN_VALUES = new Set([
  '1',
  'account',
  'account_subscription',
  'subscription',
  'confirmed',
  'email',
  'oauth',
])

const CANCELED_CODES = new Set([
  'access_denied',
  'canceled',
  'cancelled',
  'oauth_canceled',
  'oauth_cancelled',
  'user_canceled',
  'user_cancelled',
])

const EXPIRED_CODES = new Set([
  'expired',
  'otp_expired',
  'token_expired',
  'link_expired',
  'expired_token',
])

const PROVIDER_DISABLED_CODES = new Set([
  'provider_disabled',
  'provider_not_enabled',
  'oauth_provider_disabled',
  'unsupported_provider',
])

const issuedContracts = new WeakSet()

function normalizeCode(value) {
  if (typeof value !== 'string') return null

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[\s.-]+/g, '_')

  if (!/^[a-z0-9_]{1,80}$/.test(normalized)) return null
  return normalized
}

function parseSafeUrl(value) {
  if (
    typeof value !== 'string'
    || value.length === 0
    || value.length > MAX_RETURN_URL_LENGTH
  ) {
    return null
  }

  try {
    const url = new URL(value, CANONICAL_ORIGIN)
    if (
      !ALLOWED_ORIGINS.has(url.origin)
      || url.username
      || url.password
    ) {
      return null
    }
    return url
  } catch {
    return null
  }
}

function normalizePathname(pathname) {
  if (pathname === '/') return pathname
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
}

function readFragmentParams(url) {
  const fragment = url.hash.startsWith('#') ? url.hash.slice(1) : url.hash
  return new URLSearchParams(fragment)
}

function classifyFailure(searchParams, fragmentParams, rootReturnValue) {
  const errorValues = [
    ...searchParams.getAll('error'),
    ...searchParams.getAll('error_code'),
    ...fragmentParams.getAll('error'),
    ...fragmentParams.getAll('error_code'),
  ]
  const values = [...errorValues]

  if (rootReturnValue) values.push(rootReturnValue)

  for (const value of values) {
    const code = normalizeCode(value)
    if (!code) continue

    if (CANCELED_CODES.has(code)) return ACCOUNT_RETURN_STATES.CANCELED
    if (EXPIRED_CODES.has(code)) return ACCOUNT_RETURN_STATES.EXPIRED
    if (PROVIDER_DISABLED_CODES.has(code)) {
      return ACCOUNT_RETURN_STATES.PROVIDER_DISABLED
    }
  }

  return errorValues.length > 0
    ? ACCOUNT_RETURN_STATES.MISSING_SESSION
    : null
}

function issueContract({
  recognized,
  routeIntent = null,
  state,
  historyReplacement = null,
  uiIntent = null,
}) {
  const contract = Object.freeze({
    recognized,
    routeIntent,
    state,
    historyReplacement,
    uiIntent,
    entitlementAction: 'none',
  })
  issuedContracts.add(contract)
  return contract
}

function ignoredContract() {
  return issueContract({
    recognized: false,
    state: ACCOUNT_RETURN_STATES.IGNORED,
  })
}

/**
 * Classifies an account-return URL after the application's auth client reports
 * whether session recovery is complete. The contract intentionally carries no
 * URL, auth credential, provider payload, or entitlement-grant instruction.
 */
export function resolveAccountReturnContract({
  url: returnUrl,
  sessionRecoveryComplete = false,
  sessionConfirmed = false,
} = {}) {
  const url = parseSafeUrl(returnUrl)
  if (!url) return ignoredContract()

  const pathname = normalizePathname(url.pathname)
  let routeIntent = null
  let rootReturnValue = null

  if (pathname === '/') {
    const accountReturnValues = url.searchParams.getAll('account_return')
    if (accountReturnValues.length !== 1) return ignoredContract()

    rootReturnValue = normalizeCode(accountReturnValues[0])
    if (
      !rootReturnValue
      || (
        !SUCCESS_RETURN_VALUES.has(rootReturnValue)
        && !CANCELED_CODES.has(rootReturnValue)
        && !EXPIRED_CODES.has(rootReturnValue)
        && !PROVIDER_DISABLED_CODES.has(rootReturnValue)
      )
    ) {
      return ignoredContract()
    }
    routeIntent = 'root-account-return'
  } else if (pathname === '/auth/callback') {
    routeIntent = 'auth-callback'
  } else {
    return ignoredContract()
  }

  if (sessionRecoveryComplete !== true) {
    return issueContract({
      recognized: true,
      routeIntent,
      state: ACCOUNT_RETURN_STATES.PENDING_SESSION,
    })
  }

  const failureState = classifyFailure(
    url.searchParams,
    readFragmentParams(url),
    rootReturnValue,
  )
  if (failureState) {
    return issueContract({
      recognized: true,
      routeIntent,
      state: failureState,
      historyReplacement: '/',
    })
  }

  if (sessionConfirmed !== true) {
    return issueContract({
      recognized: true,
      routeIntent,
      state: ACCOUNT_RETURN_STATES.MISSING_SESSION,
      historyReplacement: '/',
    })
  }

  return issueContract({
    recognized: true,
    routeIntent,
    state: ACCOUNT_RETURN_STATES.CONFIRMED,
    historyReplacement: '/',
    uiIntent: ACCOUNT_RETURN_UI_INTENT,
  })
}

/**
 * Clears account-return parameters only for a terminal contract produced by
 * resolveAccountReturnContract. Callers cannot supply a replacement target.
 */
export function clearResolvedAccountReturnFromHistory(historyLike, contract) {
  if (
    !contract
    || !issuedContracts.has(contract)
    || contract.historyReplacement !== '/'
    || typeof historyLike?.replaceState !== 'function'
  ) {
    return false
  }

  historyLike.replaceState(null, '', '/')
  return true
}
