import crypto from "node:crypto"
import net from "node:net"

const DEFAULT_MAX_PAYLOAD_BYTES = 20 * 1024
const DEFAULT_RATE_POLICY = Object.freeze({limit:36, windowMs:60_000})
const FOUNDRY_HOSTS = Object.freeze([
  /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.services\.ai\.azure\.com$/i,
  /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.openai\.azure\.com$/i,
  /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.cognitiveservices\.azure\.com$/i
])
const FALLBACK_LABELS = Object.freeze({
  "sign-in-required":"Sign in to use paid AI credits. Curated reactions remain available.",
  "credits-exhausted":"Paid credits are exhausted. Curated reactions remain available.",
  "provider-unavailable":"The live provider is unavailable. Curated reactions remain available.",
  "settlement-pending":"A prior paid request is awaiting reconciliation. Curated reactions remain available.",
  "rate-limit-exceeded":"The live request limit was reached. Curated reactions remain available.",
  "request-too-large":"The live request was too large. Curated reactions remain available.",
  "entitlement-unknown":"Paid AI entitlement is unknown. Curated reactions remain available.",
  unknown:"Paid AI is unavailable. Curated reactions remain available."
})

export class Flow4ContractError extends Error {
  constructor(code, message = code){
    super(message)
    this.name = "Flow4ContractError"
    this.code = code
  }
}

function bigint(value, name){
  if(typeof value === "bigint") return value
  if(typeof value === "number" && Number.isSafeInteger(value)) return BigInt(value)
  if(typeof value === "string" && /^-?\d+$/.test(value)) return BigInt(value)
  throw new Flow4ContractError("invalid-integer", `${name} must be an exact integer`)
}

function jsonValue(value){
  if(typeof value === "bigint") return value.toString()
  if(Array.isArray(value)) return value.map(jsonValue)
  if(value && typeof value === "object"){
    return Object.fromEntries(
      Object.keys(value).sort().map((key) => [key, jsonValue(value[key])])
    )
  }
  return value
}

function fingerprint(value){
  return crypto.createHash("sha256").update(JSON.stringify(jsonValue(value))).digest("hex")
}

function opaqueReference(userId, action, idempotencyKey){
  return `${action}:${fingerprint({userId, action, idempotencyKey})}`
}

function stripIpv6Brackets(value){
  return value.startsWith("[") && value.endsWith("]") ? value.slice(1, -1) : value
}

function ipv4Parts(value){
  const parts = value.split(".")
  if(parts.length !== 4) return null
  const numbers = parts.map(Number)
  return numbers.every((part) => Number.isInteger(part) && part >= 0 && part <= 255)
    ? numbers
    : null
}

export function isPrivateOrReservedAddress(value){
  const address = stripIpv6Brackets(String(value || "").trim().toLowerCase())
  const version = net.isIP(address)
  if(version === 4){
    const [a, b] = ipv4Parts(address)
    return a === 0
      || a === 10
      || a === 127
      || (a === 100 && b >= 64 && b <= 127)
      || (a === 169 && b === 254)
      || (a === 172 && b >= 16 && b <= 31)
      || (a === 192 && (b === 0 || b === 168))
      || (a === 198 && (b === 18 || b === 19))
      || a >= 224
  }
  if(version === 6){
    if(address === "::" || address === "::1") return true
    if(address.startsWith("::ffff:")){
      const mapped = address.slice("::ffff:".length)
      return net.isIP(mapped) !== 4 || isPrivateOrReservedAddress(mapped)
    }
    const first = Number.parseInt(address.split(":")[0] || "0", 16)
    return (first & 0xfe00) === 0xfc00
      || (first & 0xffc0) === 0xfe80
      || (first & 0xff00) === 0xff00
      || address.startsWith("2001:db8:")
  }
  return true
}

export function normalizeFoundryEndpoint(endpoint, deployment){
  try {
    const url = new URL(String(endpoint || ""))
    const hostname = stripIpv6Brackets(url.hostname.toLowerCase())
    const normalizedDeployment = String(deployment || "").trim()
    if(
      url.protocol !== "https:"
      || (url.port && url.port !== "443")
      || url.username
      || url.password
      || url.search
      || url.hash
      || (url.pathname && url.pathname !== "/")
      || net.isIP(hostname)
      || !FOUNDRY_HOSTS.some((pattern) => pattern.test(hostname))
      || !/^[a-z0-9][a-z0-9._-]{0,99}$/i.test(normalizedDeployment)
    ) return null
    return Object.freeze({
      endpoint:url.origin,
      hostname,
      deployment:normalizedDeployment
    })
  } catch {
    return null
  }
}

export function allocatePurchaseMicros(grossValue, feeValue){
  const gross = bigint(grossValue, "grossUsdMicros")
  const paymentFee = bigint(feeValue, "paymentFeeUsdMicros")
  if(gross <= 0n || paymentFee < 0n || paymentFee > gross){
    throw new Flow4ContractError("invalid-purchase-allocation")
  }
  const net = gross - paymentFee
  const providerBudget = net * 55n / 100n
  const operatingReserve = net * 25n / 100n
  const ownerProfit = net - providerBudget - operatingReserve
  return Object.freeze({
    providerBudgetUsdMicros:providerBudget,
    paymentFeeUsdMicros:paymentFee,
    operatingReserveUsdMicros:operatingReserve,
    ownerProfitUsdMicros:ownerProfit
  })
}

export function assertFlow4LedgerRecord(record){
  const milliCredits = bigint(record.milliCredits, "milliCredits")
  const gross = bigint(record.grossUsdMicros ?? 0n, "grossUsdMicros")
  const providerBudget = bigint(record.providerBudgetUsdMicros ?? 0n, "providerBudgetUsdMicros")
  const providerCost = bigint(record.providerCostUsdMicros ?? 0n, "providerCostUsdMicros")
  const paymentFee = bigint(record.paymentFeeUsdMicros ?? 0n, "paymentFeeUsdMicros")
  const operatingReserve = bigint(record.operatingReserveUsdMicros ?? 0n, "operatingReserveUsdMicros")
  const ownerProfit = bigint(record.ownerProfitUsdMicros ?? 0n, "ownerProfitUsdMicros")
  const money = [gross, providerBudget, providerCost, paymentFee, operatingReserve, ownerProfit]
  if(money.some((value) => value < 0n)) throw new Flow4ContractError("negative-money")

  if(record.entryType === "purchase"){
    if(
      milliCredits <= 0n
      || gross <= 0n
      || providerCost !== 0n
      || providerBudget + paymentFee + operatingReserve + ownerProfit !== gross
      || record.reserveEntryId
    ) throw new Flow4ContractError("invalid-purchase-ledger-shape")
    return true
  }
  if(record.entryType === "reserve"){
    if(
      milliCredits >= 0n
      || money.some((value) => value !== 0n)
      || record.reserveEntryId
      || !record.provider
      || !record.model
      || !record.providerPriceSnapshot?.catalogVersion
    ) throw new Flow4ContractError("invalid-reserve-ledger-shape")
    return true
  }
  if(record.entryType === "consume"){
    if(
      milliCredits !== 0n
      || gross !== 0n
      || providerBudget !== 0n
      || paymentFee !== 0n
      || operatingReserve !== 0n
      || ownerProfit !== 0n
      || !record.reserveEntryId
      || !record.provider
      || !record.model
      || !record.providerPriceSnapshot?.catalogVersion
    ) throw new Flow4ContractError("invalid-consume-ledger-shape")
    return true
  }
  if(record.entryType === "release"){
    if(
      milliCredits <= 0n
      || money.some((value) => value !== 0n)
      || !record.reserveEntryId
    ) throw new Flow4ContractError("invalid-release-ledger-shape")
    return true
  }
  throw new Flow4ContractError("unsupported-ledger-entry-type")
}

class KeyedMutex {
  constructor(){
    this.tails = new Map()
  }

  async run(key, operation){
    const previous = this.tails.get(key) || Promise.resolve()
    let release
    const current = new Promise((resolve) => { release = resolve })
    const tail = previous.then(() => current)
    this.tails.set(key, tail)
    await previous
    try {
      return await operation()
    } finally {
      release()
      if(this.tails.get(key) === tail) this.tails.delete(key)
    }
  }
}

function curatedFallback(reason){
  const publicReason = Object.hasOwn(FALLBACK_LABELS, reason) ? reason : "unknown"
  return Object.freeze({
    ok:true,
    mode:"curated",
    fallbackReason:publicReason,
    fallbackLabel:FALLBACK_LABELS[publicReason],
    consumerSubscriptionPortable:false
  })
}

export function measurePayloadBytes(payload){
  return Buffer.byteLength(JSON.stringify(payload ?? {}), "utf8")
}

export function createMockFlow4System(options = {}){
  const mutex = new KeyedMutex()
  const ledger = []
  const reservationsByScope = new Map()
  const terminalByReserve = new Map()
  const orders = new Map()
  const captureOwners = new Map()
  const rateWindows = new Map()
  const foundryRequests = []
  const providerCalls = []
  const dnsRecords = new Map(
    Object.entries(options.dnsRecords || {}).map(([host, addresses]) => [
      host.toLowerCase(),
      Array.isArray(addresses) ? addresses : [addresses]
    ])
  )
  let providerBehavior = options.providerBehavior || (async () => ({
    ok:true,
    inputTokens:80n,
    outputTokens:20n,
    providerCostUsdMicros:250n,
    responseHash:"fixture-response"
  }))
  let foundryResponder = options.foundryResponder || (async () => ({ok:true, status:200}))
  let now = Number(options.now ?? 1_785_000_000_000)
  let sequence = 0
  let failNextCaptureCommit = false

  function nextId(prefix){
    sequence += 1
    return `${prefix}-${String(sequence).padStart(6, "0")}`
  }

  function appendLedger(record){
    const complete = Object.freeze({
      id:nextId("ledger"),
      grossUsdMicros:0n,
      providerBudgetUsdMicros:0n,
      providerCostUsdMicros:0n,
      paymentFeeUsdMicros:0n,
      operatingReserveUsdMicros:0n,
      ownerProfitUsdMicros:0n,
      reserveEntryId:null,
      provider:null,
      model:null,
      providerPriceSnapshot:Object.freeze({}),
      ...record
    })
    assertFlow4LedgerRecord(complete)
    ledger.push(complete)
    return complete
  }

  function creditBalance(userId){
    return ledger
      .filter((entry) => entry.userId === userId)
      .reduce((sum, entry) => sum + entry.milliCredits, 0n)
  }

  for(const initial of options.initialCredits || []){
    const milliCredits = bigint(initial.milliCredits, "initialCredits.milliCredits")
    const gross = bigint(initial.grossUsdMicros ?? milliCredits, "initialCredits.grossUsdMicros")
    appendLedger({
      userId:String(initial.userId),
      entryType:"purchase",
      milliCredits,
      grossUsdMicros:gross,
      providerBudgetUsdMicros:gross,
      externalReference:String(initial.externalReference || `fixture:${initial.userId}`)
    })
  }

  async function connectFoundry({authUserId, endpoint, deployment, credential}){
    if(!authUserId) return {ok:false, reason:"sign-in-required"}
    const config = normalizeFoundryEndpoint(endpoint, deployment)
    if(!config) return {ok:false, reason:"foundry-endpoint-rejected"}
    const addresses = dnsRecords.get(config.hostname) || ["20.50.1.10"]
    if(
      addresses.length === 0
      || addresses.some((address) => isPrivateOrReservedAddress(address))
    ) return {ok:false, reason:"foundry-private-address-rejected"}

    const request = Object.freeze({
      url:`${config.endpoint}/models`,
      redirect:"error",
      credentialForwarded:true,
      credentialFingerprint:fingerprint({credential}),
      hostname:config.hostname
    })
    foundryRequests.push(request)
    const response = await foundryResponder(request)
    if(
      response?.redirected
      || (Number(response?.status) >= 300 && Number(response?.status) < 400)
      || response?.location
    ) return {ok:false, reason:"foundry-redirect-rejected"}
    return response?.ok
      ? {ok:true, endpoint:config.endpoint, deployment:config.deployment}
      : {ok:false, reason:"foundry-credential-rejected"}
  }

  async function reserveCredits({
    authUserId,
    idempotencyKey,
    milliCredits,
    provider,
    model,
    providerPriceSnapshot
  }){
    if(!authUserId) throw new Flow4ContractError("sign-in-required")
    const amount = bigint(milliCredits, "milliCredits")
    if(amount <= 0n || !idempotencyKey || !provider || !model){
      throw new Flow4ContractError("invalid-reservation")
    }
    const snapshot = Object.freeze({
      catalogVersion:"fixture-catalog-v1",
      provider,
      model,
      inputUsdMicrosPerMillionTokens:"1000000",
      outputUsdMicrosPerMillionTokens:"2000000",
      ...(providerPriceSnapshot || {})
    })
    const scope = `${authUserId}|reserve|${idempotencyKey}`
    const requestFingerprint = fingerprint({amount, provider, model, snapshot})
    return mutex.run(`credits:${authUserId}`, async () => {
      const existing = reservationsByScope.get(scope)
      if(existing){
        if(existing.requestFingerprint !== requestFingerprint){
          throw new Flow4ContractError("idempotency-conflict")
        }
        return {ok:true, duplicate:true, row:existing.row}
      }
      if(creditBalance(authUserId) < amount){
        throw new Flow4ContractError("insufficient-credits")
      }
      const row = appendLedger({
        userId:authUserId,
        entryType:"reserve",
        milliCredits:-amount,
        provider,
        model,
        providerPriceSnapshot:snapshot,
        externalReference:opaqueReference(authUserId, "reserve", idempotencyKey),
        requestFingerprint
      })
      reservationsByScope.set(scope, {requestFingerprint, row})
      return {ok:true, duplicate:false, row}
    })
  }

  async function finalizeReservation({
    authUserId,
    reserveEntryId,
    success,
    providerCostUsdMicros = 0n,
    inputTokens = 0n,
    outputTokens = 0n,
    receiptHash = ""
  }){
    if(!authUserId) throw new Flow4ContractError("sign-in-required")
    return mutex.run(`credits:${authUserId}`, async () => {
      const reserve = ledger.find((entry) =>
        entry.id === reserveEntryId
        && entry.userId === authUserId
        && entry.entryType === "reserve"
      )
      if(!reserve) throw new Flow4ContractError("reservation-not-found")
      const desiredType = success ? "consume" : "release"
      const requestFingerprint = fingerprint({
        desiredType,
        providerCostUsdMicros:bigint(providerCostUsdMicros, "providerCostUsdMicros"),
        inputTokens:bigint(inputTokens, "inputTokens"),
        outputTokens:bigint(outputTokens, "outputTokens"),
        receiptHash
      })
      const existing = terminalByReserve.get(reserve.id)
      if(existing){
        if(
          existing.row.entryType !== desiredType
          || existing.requestFingerprint !== requestFingerprint
        ) throw new Flow4ContractError("terminal-idempotency-conflict")
        return {ok:true, duplicate:true, row:existing.row}
      }
      const row = success
        ? appendLedger({
            userId:authUserId,
            entryType:"consume",
            milliCredits:0n,
            providerCostUsdMicros:bigint(providerCostUsdMicros, "providerCostUsdMicros"),
            provider:reserve.provider,
            model:reserve.model,
            providerPriceSnapshot:reserve.providerPriceSnapshot,
            reserveEntryId:reserve.id,
            externalReference:`consume:${reserve.id}`,
            requestFingerprint
          })
        : appendLedger({
            userId:authUserId,
            entryType:"release",
            milliCredits:-reserve.milliCredits,
            reserveEntryId:reserve.id,
            externalReference:`release:${reserve.id}`,
            requestFingerprint
          })
      terminalByReserve.set(reserve.id, {requestFingerprint, row})
      return {ok:true, duplicate:false, row}
    })
  }

  function seedCreditOrder({
    userId,
    orderId,
    packKey = "fixture-pack",
    amountUsdMicros,
    milliCredits
  }){
    if(orders.has(orderId)) throw new Flow4ContractError("duplicate-order")
    const order = {
      userId,
      orderId,
      packKey,
      amountUsdMicros:bigint(amountUsdMicros, "amountUsdMicros"),
      milliCredits:bigint(milliCredits, "milliCredits"),
      status:"created",
      captureId:null,
      captureFingerprint:null,
      ledgerEntryId:null
    }
    orders.set(orderId, order)
    return structuredClone(order)
  }

  async function captureCreditOrder({authUserId, orderId, receipt}){
    if(!authUserId) throw new Flow4ContractError("sign-in-required")
    return mutex.run(`order:${orderId}`, async () => {
      const order = orders.get(orderId)
      if(!order || order.userId !== authUserId){
        throw new Flow4ContractError("credit-order-not-found")
      }
      const normalized = {
        orderId:String(receipt?.orderId || ""),
        captureId:String(receipt?.captureId || ""),
        orderStatus:String(receipt?.orderStatus || ""),
        captureStatus:String(receipt?.captureStatus || ""),
        currency:String(receipt?.currency || ""),
        amountUsdMicros:bigint(receipt?.amountUsdMicros ?? -1n, "receipt.amountUsdMicros"),
        paymentFeeUsdMicros:bigint(receipt?.paymentFeeUsdMicros ?? 0n, "receipt.paymentFeeUsdMicros"),
        customId:String(receipt?.customId || "")
      }
      const expectedCustomId = `digitalhut-ai:${authUserId}:${order.packKey}`
      if(
        normalized.orderId !== order.orderId
        || normalized.captureId.length < 8
        || normalized.orderStatus !== "COMPLETED"
        || normalized.captureStatus !== "COMPLETED"
        || normalized.currency !== "USD"
        || normalized.amountUsdMicros !== order.amountUsdMicros
        || normalized.customId !== expectedCustomId
      ) throw new Flow4ContractError("capture-verification-failed")

      const captureFingerprint = fingerprint(normalized)
      if(order.status === "captured"){
        if(
          order.captureId !== normalized.captureId
          || order.captureFingerprint !== captureFingerprint
        ) throw new Flow4ContractError("capture-idempotency-conflict")
        return {ok:true, duplicate:true, order:structuredClone(order)}
      }
      const captureOwner = captureOwners.get(normalized.captureId)
      if(captureOwner && captureOwner !== order.orderId){
        throw new Flow4ContractError("capture-already-reconciled")
      }
      const allocation = allocatePurchaseMicros(
        normalized.amountUsdMicros,
        normalized.paymentFeeUsdMicros
      )
      if(failNextCaptureCommit){
        failNextCaptureCommit = false
        throw new Flow4ContractError("capture-commit-failed")
      }
      const ledgerRow = appendLedger({
        userId:authUserId,
        entryType:"purchase",
        milliCredits:order.milliCredits,
        grossUsdMicros:order.amountUsdMicros,
        ...allocation,
        externalReference:`paypal:${fingerprint({authUserId, orderId})}`,
        requestFingerprint:captureFingerprint
      })
      captureOwners.set(normalized.captureId, order.orderId)
      Object.assign(order, {
        status:"captured",
        captureId:normalized.captureId,
        captureFingerprint,
        ledgerEntryId:ledgerRow.id,
        allocation
      })
      return {ok:true, duplicate:false, order:structuredClone(order)}
    })
  }

  function takeRateLimit({
    userId,
    action,
    limit = DEFAULT_RATE_POLICY.limit,
    windowMs = DEFAULT_RATE_POLICY.windowMs
  }){
    const window = Math.floor(now / windowMs)
    const key = `${userId}|${action}|${window}`
    const count = (rateWindows.get(key) || 0) + 1
    rateWindows.set(key, count)
    return count <= limit
  }

  async function routePaidReaction({
    authUserId,
    idempotencyKey,
    request,
    provider = "openai",
    model = "fixture-model",
    milliCredits = 100n,
    ratePolicy = DEFAULT_RATE_POLICY,
    clientCreditBalance,
    claimedUserId,
    consumerSubscription
  }){
    void clientCreditBalance
    void claimedUserId
    void consumerSubscription
    if(!authUserId) return curatedFallback("sign-in-required")
    if(measurePayloadBytes(request) > (options.maxPayloadBytes || DEFAULT_MAX_PAYLOAD_BYTES)){
      return curatedFallback("request-too-large")
    }
    if(!takeRateLimit({
      userId:authUserId,
      action:"react",
      limit:ratePolicy.limit,
      windowMs:ratePolicy.windowMs
    })) return curatedFallback("rate-limit-exceeded")

    let reservation
    try {
      reservation = await reserveCredits({
        authUserId,
        idempotencyKey,
        milliCredits,
        provider,
        model
      })
    } catch (error) {
      if(error?.code === "insufficient-credits") return curatedFallback("credits-exhausted")
      if(error?.code === "sign-in-required") return curatedFallback("sign-in-required")
      throw error
    }

    if(reservation.duplicate){
      const terminal = terminalByReserve.get(reservation.row.id)?.row
      if(!terminal) return curatedFallback("settlement-pending")
      if(terminal.entryType === "release") return curatedFallback("provider-unavailable")
      return Object.freeze({
        ok:true,
        mode:"digitalhut-paid",
        duplicate:true,
        accountingStatus:"finalized",
        reserveEntryId:reservation.row.id,
        ledgerEntryId:terminal.id,
        consumerSubscriptionPortable:false
      })
    }

    providerCalls.push(Object.freeze({
      userId:authUserId,
      provider,
      model,
      reserveEntryId:reservation.row.id
    }))
    const live = await providerBehavior({
      userId:authUserId,
      provider,
      model,
      request,
      reserveEntryId:reservation.row.id
    })
    if(!live?.ok){
      await finalizeReservation({
        authUserId,
        reserveEntryId:reservation.row.id,
        success:false,
        receiptHash:String(live?.reason || "provider-unavailable")
      })
      return curatedFallback("provider-unavailable")
    }
    const finalized = await finalizeReservation({
      authUserId,
      reserveEntryId:reservation.row.id,
      success:true,
      providerCostUsdMicros:live.providerCostUsdMicros,
      inputTokens:live.inputTokens,
      outputTokens:live.outputTokens,
      receiptHash:live.responseHash
    })
    return Object.freeze({
      ok:true,
      mode:"digitalhut-paid",
      accountingStatus:"finalized",
      reserveEntryId:reservation.row.id,
      ledgerEntryId:finalized.row.id,
      consumerSubscriptionPortable:false
    })
  }

  return Object.freeze({
    connectFoundry,
    reserveCredits,
    finalizeReservation,
    seedCreditOrder,
    captureCreditOrder,
    routePaidReaction,
    takeRateLimit,
    creditBalance,
    setProviderBehavior(value){ providerBehavior = value },
    setFoundryResponder(value){ foundryResponder = value },
    injectCaptureCommitFailureOnce(){ failNextCaptureCommit = true },
    setNow(value){ now = Number(value) },
    advanceTime(milliseconds){ now += Number(milliseconds) },
    snapshot(){
      return {
        ledger:structuredClone(ledger),
        orders:structuredClone([...orders.values()]),
        foundryRequests:structuredClone(foundryRequests),
        providerCalls:structuredClone(providerCalls),
        consumerSubscriptionPortable:false
      }
    }
  })
}
