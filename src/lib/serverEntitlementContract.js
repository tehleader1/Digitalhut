export const SERVER_ENTITLEMENT_AUTHORITY =
  'digitalhut-server-entitlement-read-model-v1'

export const SERVER_ENTITLEMENT_STATES = Object.freeze({
  ACTIVE: 'active',
  GRACE: 'grace',
  SUSPENDED: 'suspended',
  CANCELED: 'canceled',
  EXPIRED: 'expired',
  REFUNDED: 'refunded',
  DISPUTED: 'disputed',
  CHARGEBACK: 'chargeback',
  MISSING: 'missing',
  STALE: 'stale',
  PROVIDER_ERROR: 'provider-error',
  OFFLINE: 'offline',
  UNKNOWN: 'unknown',
  SIGNED_OUT: 'signed-out',
})

export const SERVER_ENTITLEMENT_TIERS = Object.freeze({
  STANDARD: 'tier-standard',
  PREMIUM: 'tier-premium',
  PRO: 'tier-pro',
  NONE: 'tier-none',
})

const PLAN_LABELS = Object.freeze({
  [SERVER_ENTITLEMENT_TIERS.STANDARD]: 'Standard',
  [SERVER_ENTITLEMENT_TIERS.PREMIUM]: 'Premium',
  [SERVER_ENTITLEMENT_TIERS.PRO]: 'Pro',
})

const READ_MODEL_STATES = new Set([
  SERVER_ENTITLEMENT_STATES.ACTIVE,
  SERVER_ENTITLEMENT_STATES.GRACE,
  SERVER_ENTITLEMENT_STATES.SUSPENDED,
  SERVER_ENTITLEMENT_STATES.CANCELED,
  SERVER_ENTITLEMENT_STATES.EXPIRED,
  SERVER_ENTITLEMENT_STATES.REFUNDED,
  SERVER_ENTITLEMENT_STATES.DISPUTED,
  SERVER_ENTITLEMENT_STATES.CHARGEBACK,
  SERVER_ENTITLEMENT_STATES.MISSING,
  SERVER_ENTITLEMENT_STATES.STALE,
  SERVER_ENTITLEMENT_STATES.PROVIDER_ERROR,
])

const NEGATIVE_TIER_STATES = new Set([
  SERVER_ENTITLEMENT_STATES.MISSING,
  SERVER_ENTITLEMENT_STATES.STALE,
  SERVER_ENTITLEMENT_STATES.PROVIDER_ERROR,
])

const MAX_FRESHNESS_WINDOW_MS = 15 * 60 * 1000
const MAX_CLOCK_SKEW_MS = 60 * 1000
const UTC_TIMESTAMP_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
const OPAQUE_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,199}$/

function isOpaqueId(value) {
  return typeof value === 'string' && OPAQUE_ID_PATTERN.test(value)
}

function parseUtcTimestamp(value) {
  if (typeof value !== 'string' || !UTC_TIMESTAMP_PATTERN.test(value)) {
    return null
  }

  const milliseconds = Date.parse(value)
  if (
    !Number.isFinite(milliseconds)
    || new Date(milliseconds).toISOString() !== value
  ) {
    return null
  }

  return milliseconds
}

function issueDecision({
  state,
  reason,
  message,
  action,
  accessAllowed = false,
  tierId = null,
  source = 'none',
  accountSurface = 'signed-in-recoverable',
  entitlementVersion = null,
  freshnessEndsAt = null,
  accessEndsAt = null,
}) {
  const threePlan = Object.freeze({
    selectedTierId: tierId,
    status: state,
    message,
    action,
  })

  return Object.freeze({
    state,
    reason,
    accessAllowed,
    accessBasis: accessAllowed ? 'fresh-server-entitlement' : 'none',
    tierId,
    source,
    accountSurface,
    threePlan,
    entitlementVersion,
    freshnessEndsAt,
    accessEndsAt,
    clientGrantAllowed: false,
    serverEnforcementRequired: true,
    entitlementAction: 'none',
  })
}

function signedInFailure({
  state = SERVER_ENTITLEMENT_STATES.UNKNOWN,
  reason,
  message = 'Access could not be verified. Your signed-in account remains available; retry the server check.',
  action = 'retry-verification',
  source = 'none',
  entitlementVersion = null,
  freshnessEndsAt = null,
}) {
  return issueDecision({
    state,
    reason,
    message,
    action,
    source,
    entitlementVersion,
    freshnessEndsAt,
  })
}

function readModelDecision({
  readModel,
  nowMilliseconds,
  accessEndsAt,
}) {
  const tierId = readModel.tierId === SERVER_ENTITLEMENT_TIERS.NONE
    ? null
    : readModel.tierId
  const planLabel = PLAN_LABELS[readModel.tierId] || 'Paid plan'
  const common = {
    tierId,
    source: 'server-entitlement-read-model',
    entitlementVersion: readModel.version,
    freshnessEndsAt: readModel.freshUntil,
    accessEndsAt,
  }

  switch (readModel.state) {
    case SERVER_ENTITLEMENT_STATES.ACTIVE:
      if (
        accessEndsAt
        && nowMilliseconds >= parseUtcTimestamp(accessEndsAt)
      ) {
        return signedInFailure({
          state: SERVER_ENTITLEMENT_STATES.STALE,
          reason: 'active-access-window-ended',
          message: `${planLabel} was marked active after its authoritative access end time, so access remains locked until refreshed.`,
          source: common.source,
          entitlementVersion: common.entitlementVersion,
          freshnessEndsAt: common.freshnessEndsAt,
        })
      }
      return issueDecision({
        ...common,
        state: readModel.state,
        reason: 'active-server-entitlement',
        message: `${planLabel} access is active and confirmed by the entitlement server.`,
        action: 'manage-plan',
        accessAllowed: true,
        accountSurface: 'signed-in',
      })

    case SERVER_ENTITLEMENT_STATES.GRACE:
      if (!accessEndsAt) {
        return signedInFailure({
          reason: 'missing-grace-end',
          message: 'Grace access has no authoritative end time, so paid access remains locked until the server record is repaired.',
          source: common.source,
          entitlementVersion: common.entitlementVersion,
          freshnessEndsAt: common.freshnessEndsAt,
        })
      }
      if (nowMilliseconds >= parseUtcTimestamp(accessEndsAt)) {
        return issueDecision({
          ...common,
          state: readModel.state,
          reason: 'grace-window-ended',
          message: `${planLabel} grace access has ended. Choose a plan or resolve billing to restore access.`,
          action: 'resolve-billing',
        })
      }
      return issueDecision({
        ...common,
        state: readModel.state,
        reason: 'grace-window-active',
        message: `${planLabel} is in a server-confirmed grace period. Access remains available only until the stated end time.`,
        action: 'resolve-billing',
        accessAllowed: true,
        accountSurface: 'signed-in',
      })

    case SERVER_ENTITLEMENT_STATES.CANCELED:
      if (!accessEndsAt) {
        return signedInFailure({
          reason: 'missing-cancellation-end',
          message: 'The cancellation has no authoritative access end time, so paid access remains locked until refreshed.',
          source: common.source,
          entitlementVersion: common.entitlementVersion,
          freshnessEndsAt: common.freshnessEndsAt,
        })
      }
      if (nowMilliseconds < parseUtcTimestamp(accessEndsAt)) {
        return issueDecision({
          ...common,
          state: readModel.state,
          reason: 'canceled-access-through-period',
          message: `${planLabel} is canceled, but server-confirmed access remains available until the stated end time.`,
          action: 'manage-cancellation',
          accessAllowed: true,
          accountSurface: 'signed-in',
        })
      }
      return issueDecision({
        ...common,
        state: readModel.state,
        reason: 'canceled-access-ended',
        message: `${planLabel} has ended. Standard, Premium, and Pro remain available.`,
        action: 'choose-plan',
      })

    case SERVER_ENTITLEMENT_STATES.SUSPENDED:
      return issueDecision({
        ...common,
        state: readModel.state,
        reason: 'server-entitlement-suspended',
        message: `${planLabel} access is suspended. Your account remains available while billing or support resolves it.`,
        action: 'resolve-billing',
      })

    case SERVER_ENTITLEMENT_STATES.EXPIRED:
      return issueDecision({
        ...common,
        state: readModel.state,
        reason: 'server-entitlement-expired',
        message: `${planLabel} access has expired. Choose a plan to restore paid access.`,
        action: 'choose-plan',
      })

    case SERVER_ENTITLEMENT_STATES.REFUNDED:
      return issueDecision({
        ...common,
        state: readModel.state,
        reason: 'server-entitlement-refunded',
        message: `${planLabel} was refunded, so paid access is revoked while the signed-in account remains available.`,
        action: 'choose-plan',
      })

    case SERVER_ENTITLEMENT_STATES.DISPUTED:
      return issueDecision({
        ...common,
        state: readModel.state,
        reason: 'server-entitlement-disputed',
        message: `${planLabel} payment is disputed, so paid access is paused while the account remains available.`,
        action: 'contact-support',
      })

    case SERVER_ENTITLEMENT_STATES.CHARGEBACK:
      return issueDecision({
        ...common,
        state: readModel.state,
        reason: 'server-entitlement-chargeback',
        message: `${planLabel} payment was charged back, so paid access is revoked while the account remains available.`,
        action: 'contact-support',
      })

    case SERVER_ENTITLEMENT_STATES.MISSING:
      return issueDecision({
        ...common,
        state: readModel.state,
        reason: 'server-entitlement-missing',
        message: 'No server-confirmed plan is active. Standard, Premium, and Pro remain available.',
        action: 'choose-plan',
      })

    case SERVER_ENTITLEMENT_STATES.STALE:
      return issueDecision({
        ...common,
        state: readModel.state,
        reason: 'server-entitlement-stale',
        message: 'The server reported stale entitlement evidence. Paid access stays locked until a fresh record is available.',
        action: 'retry-verification',
      })

    case SERVER_ENTITLEMENT_STATES.PROVIDER_ERROR:
      return issueDecision({
        ...common,
        state: readModel.state,
        reason: 'server-reported-provider-error',
        message: 'The provider result could not be verified. Paid access stays locked while the signed-in account remains available.',
        action: 'retry-verification',
      })

    default:
      return signedInFailure({
        reason: 'unknown-entitlement-state',
      })
  }
}

/**
 * Interprets a read model that a trusted server adapter has already bound to
 * the authenticated session and signature-verified. This display contract is
 * not an authorization boundary; protected server operations must enforce the
 * entitlement again.
 */
export function interpretServerEntitlement({
  authenticatedUserId,
  readModel,
  transportState = 'provider-error',
  now,
  minimumAcceptedVersion = 1,
} = {}) {
  if (
    authenticatedUserId === null
    || authenticatedUserId === undefined
    || authenticatedUserId === ''
  ) {
    return issueDecision({
      state: SERVER_ENTITLEMENT_STATES.SIGNED_OUT,
      reason: 'signed-out',
      message: 'Sign in to verify access and view Standard, Premium, and Pro.',
      action: 'sign-in',
      accountSurface: 'sign-in',
    })
  }

  if (!isOpaqueId(authenticatedUserId)) {
    return signedInFailure({
      reason: 'invalid-authenticated-user',
    })
  }

  const nowMilliseconds = parseUtcTimestamp(now)
  if (nowMilliseconds === null) {
    return signedInFailure({
      reason: 'invalid-evaluation-time',
    })
  }

  if (transportState === 'offline') {
    return signedInFailure({
      state: SERVER_ENTITLEMENT_STATES.OFFLINE,
      reason: 'offline',
      message: 'Access cannot be freshly verified while offline. Your signed-in account remains available.',
    })
  }

  if (transportState !== 'ok') {
    return signedInFailure({
      state: SERVER_ENTITLEMENT_STATES.PROVIDER_ERROR,
      reason: 'provider-read-failed',
      message: 'The entitlement provider could not be verified. Paid access stays locked while your account remains available.',
    })
  }

  if (!readModel || typeof readModel !== 'object' || Array.isArray(readModel)) {
    return signedInFailure({
      reason: 'missing-read-model',
    })
  }

  if (
    readModel.authority !== SERVER_ENTITLEMENT_AUTHORITY
    || readModel.signatureVerified !== true
    || !isOpaqueId(readModel.signatureKeyId)
    || !isOpaqueId(readModel.signatureId)
  ) {
    return signedInFailure({
      reason: 'untrusted-read-model',
    })
  }

  if (
    !isOpaqueId(readModel.userId)
    || readModel.userId !== authenticatedUserId
  ) {
    return signedInFailure({
      reason: 'user-binding-mismatch',
    })
  }

  if (
    !Number.isSafeInteger(minimumAcceptedVersion)
    || minimumAcceptedVersion < 1
  ) {
    return signedInFailure({
      reason: 'invalid-version-floor',
    })
  }

  if (
    !Number.isSafeInteger(readModel.version)
    || readModel.version < 1
    || !Number.isSafeInteger(readModel.receiptVersion)
    || readModel.receiptVersion < 1
    || !isOpaqueId(readModel.receiptId)
  ) {
    return signedInFailure({
      state: SERVER_ENTITLEMENT_STATES.STALE,
      reason: 'invalid-receipt-version',
      source: 'server-entitlement-read-model',
    })
  }

  if (readModel.receiptVersion !== readModel.version) {
    return signedInFailure({
      state: SERVER_ENTITLEMENT_STATES.STALE,
      reason: 'receipt-version-mismatch',
      source: 'server-entitlement-read-model',
      entitlementVersion: readModel.version,
    })
  }

  if (readModel.version < minimumAcceptedVersion) {
    return signedInFailure({
      state: SERVER_ENTITLEMENT_STATES.STALE,
      reason: 'replayed-or-stale-version',
      source: 'server-entitlement-read-model',
      entitlementVersion: readModel.version,
    })
  }

  const checkedAtMilliseconds = parseUtcTimestamp(readModel.checkedAt)
  const freshUntilMilliseconds = parseUtcTimestamp(readModel.freshUntil)
  if (
    checkedAtMilliseconds === null
    || freshUntilMilliseconds === null
    || freshUntilMilliseconds <= checkedAtMilliseconds
    || checkedAtMilliseconds > nowMilliseconds + MAX_CLOCK_SKEW_MS
    || freshUntilMilliseconds - checkedAtMilliseconds
      > MAX_FRESHNESS_WINDOW_MS
  ) {
    return signedInFailure({
      state: SERVER_ENTITLEMENT_STATES.STALE,
      reason: 'invalid-freshness-window',
      source: 'server-entitlement-read-model',
      entitlementVersion: readModel.version,
    })
  }

  if (nowMilliseconds >= freshUntilMilliseconds) {
    return signedInFailure({
      state: SERVER_ENTITLEMENT_STATES.STALE,
      reason: 'stale-read-model',
      source: 'server-entitlement-read-model',
      entitlementVersion: readModel.version,
      freshnessEndsAt: readModel.freshUntil,
    })
  }

  if (!READ_MODEL_STATES.has(readModel.state)) {
    return signedInFailure({
      reason: 'unknown-entitlement-state',
      source: 'server-entitlement-read-model',
      entitlementVersion: readModel.version,
      freshnessEndsAt: readModel.freshUntil,
    })
  }

  const stateRequiresNoTier = NEGATIVE_TIER_STATES.has(readModel.state)
  const tierIsValid = stateRequiresNoTier
    ? readModel.tierId === SERVER_ENTITLEMENT_TIERS.NONE
    : Object.hasOwn(PLAN_LABELS, readModel.tierId)
  if (
    !tierIsValid
    || readModel.receiptTierId !== readModel.tierId
  ) {
    return signedInFailure({
      reason: 'tier-receipt-mismatch',
      source: 'server-entitlement-read-model',
      entitlementVersion: readModel.version,
      freshnessEndsAt: readModel.freshUntil,
    })
  }

  let accessEndsAt = null
  if (readModel.accessEndsAt !== null && readModel.accessEndsAt !== undefined) {
    const accessEndsAtMilliseconds = parseUtcTimestamp(readModel.accessEndsAt)
    if (
      accessEndsAtMilliseconds === null
      || accessEndsAtMilliseconds <= checkedAtMilliseconds
    ) {
      return signedInFailure({
        reason: 'invalid-access-end',
        source: 'server-entitlement-read-model',
        entitlementVersion: readModel.version,
        freshnessEndsAt: readModel.freshUntil,
      })
    }
    accessEndsAt = readModel.accessEndsAt
  }

  return readModelDecision({
    readModel,
    nowMilliseconds,
    accessEndsAt,
  })
}
