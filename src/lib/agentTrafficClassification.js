export const agentTrafficClassificationVersion = "agent-traffic-classification-v1"
export const agentTrafficHeaderLimit = 500

function freezeDefinitions(definitions){
  return Object.freeze(definitions.map((definition) => Object.freeze({...definition})))
}

export const claimedAiAgentSignatures = freezeDefinitions([
  {signature: "gptbot", providerFamily: "openai"},
  {signature: "chatgpt-user", providerFamily: "openai"},
  {signature: "oai-searchbot", providerFamily: "openai"},
  {signature: "claudebot", providerFamily: "anthropic"},
  {signature: "claude-web", providerFamily: "anthropic"},
  {signature: "anthropic-ai", providerFamily: "anthropic"},
  {signature: "perplexitybot", providerFamily: "perplexity"},
  {signature: "perplexity-user", providerFamily: "perplexity"},
  {signature: "google-extended", providerFamily: "google"},
  {signature: "gemini-deep-research", providerFamily: "google"},
  {signature: "bytespider", providerFamily: "bytedance"},
  {signature: "cohere-ai", providerFamily: "cohere"},
  {signature: "meta-externalagent", providerFamily: "meta"},
  {signature: "amazonbot", providerFamily: "amazon"},
  {signature: "duckassistbot", providerFamily: "duckduckgo"},
  {signature: "youbot", providerFamily: "you.com"}
])

export const genericSearchCrawlerSignatures = freezeDefinitions([
  {signature: "googlebot", providerFamily: "google"},
  {signature: "google-inspectiontool", providerFamily: "google"},
  {signature: "bingbot", providerFamily: "microsoft"},
  {signature: "bingpreview", providerFamily: "microsoft"},
  {signature: "duckduckbot", providerFamily: "duckduckgo"},
  {signature: "yandexbot", providerFamily: "yandex"},
  {signature: "baiduspider", providerFamily: "baidu"},
  {signature: "slurp", providerFamily: "yahoo"},
  {signature: "applebot", providerFamily: "apple"},
  {signature: "ccbot", providerFamily: "common-crawl"},
  {signature: "petalbot", providerFamily: "huawei"}
])

export const internalReportingJobSignatures = freezeDefinitions([
  {signature: "digitalhut-seo-standby", jobFamily: "digitalhut-internal"},
  {signature: "digitalhut-firecuda-map", jobFamily: "digitalhut-internal"},
  {signature: "digitalhut-master-list-evidence", jobFamily: "digitalhut-internal"},
  {signature: "digitalhut-crawl-trail-verifier", jobFamily: "digitalhut-internal"},
  {signature: "codex-overseer", jobFamily: "digitalhut-internal"},
  {signature: "codex-test", jobFamily: "digitalhut-internal"}
])

const genericAutomationTokens = new Set([
  "headlesschrome",
  "lighthouse",
  "pagespeed",
  "pingdom",
  "uptimerobot"
])

const probableObservationSources = new Set([
  "server-or-edge-log",
  "provider-receipt"
])

function inspectText(value, limit){
  if(value === undefined || value === null) return {status: "missing", normalized: "", length: 0}
  if(typeof value !== "string") return {status: "malformed", normalized: "", length: 0}
  if(!value.trim()) return {status: "missing", normalized: "", length: value.length}
  if(value.length > limit || /[\u0000-\u001f\u007f]/.test(value)){
    return {status: "malformed", normalized: "", length: value.length}
  }
  return {
    status: "present",
    normalized: value.toLowerCase().replace(/\s+/g, " ").trim(),
    length: value.length
  }
}

function tokensFor(value){
  const withoutUrls = value.replace(/\+?https?:\/\/[^\s;)]+/g, " ")
  return withoutUrls.match(/[a-z0-9]+(?:[._-][a-z0-9]+)*/g) || []
}

function matchesFor(tokens, definitions){
  const tokenSet = new Set(tokens)
  return definitions.filter((definition) => tokenSet.has(definition.signature))
}

function unique(values){
  return [...new Set(values.filter(Boolean))]
}

function genericFallback(tokens, excludedSignatures = new Set()){
  return tokens.find((token) => (
    !excludedSignatures.has(token)
    && (
      genericAutomationTokens.has(token)
      || token === "crawl"
      || token === "crawler"
      || token === "spider"
      || /(?:bot|crawler|spider)$/.test(token)
    )
  )) || ""
}

function evidenceContract(value = {}){
  const input = value && typeof value === "object" && !Array.isArray(value) ? value : {}
  const observationSource = ["unknown", "js-pixel", "server-or-edge-log", "provider-receipt"].includes(input.observationSource)
    ? input.observationSource
    : "unknown"
  return {
    observationSource,
    immutableDeployment: input.immutableDeployment === true,
    providerIdentityCorroborated: input.providerIdentityCorroborated === true,
    internalOrSynthetic: input.internalOrSynthetic === true
  }
}

function probableEvidence({classification, providerFamily, evidence}){
  return ["claimed-ai-llm-agent-signature", "generic-search-crawler-signature"].includes(classification)
    && Boolean(providerFamily)
    && probableObservationSources.has(evidence.observationSource)
    && evidence.immutableDeployment
    && evidence.providerIdentityCorroborated
    && !evidence.internalOrSynthetic
}

export function classifyAgentCrawlerTraffic(input = {}){
  const request = input && typeof input === "object" && !Array.isArray(input) ? input : {}
  const header = inspectText(request.userAgent, agentTrafficHeaderLimit)
  const internalName = inspectText(request.internalJobName, 160)
  const headerTokens = header.status === "present" ? tokensFor(header.normalized) : []
  const internalTokens = internalName.status === "present" ? tokensFor(internalName.normalized) : []
  const internalMatches = matchesFor([...headerTokens, ...internalTokens], internalReportingJobSignatures)
  const agentMatches = matchesFor(headerTokens, claimedAiAgentSignatures)
  const crawlerMatches = matchesFor(headerTokens, genericSearchCrawlerSignatures)
  const knownExternalSignatures = new Set([
    ...agentMatches.map((match) => match.signature),
    ...crawlerMatches.map((match) => match.signature)
  ])
  const fallback = genericFallback(headerTokens, knownExternalSignatures)
  const externalClaims = [
    ...agentMatches.map((match) => ({...match, kind: "ai-llm-agent"})),
    ...crawlerMatches.map((match) => ({...match, kind: "generic-search-crawler"})),
    ...(fallback ? [{signature: fallback, providerFamily: null, kind: genericAutomationTokens.has(fallback) ? "generic-automation" : "generic-search-crawler"}] : [])
  ]
  const evidence = evidenceContract(request.evidence)

  let classification = "unknown-or-unattributed"
  let claimedSignature = null
  let claimedSignatures = []
  let providerFamily = null
  let providerFamilies = []
  let internalJobSignature = null

  if(internalMatches.length){
    classification = "internal-reporting-job"
    internalJobSignature = internalMatches[0].signature
    claimedSignatures = externalClaims.map((claim) => claim.signature)
    providerFamilies = unique(externalClaims.map((claim) => claim.providerFamily))
  }else if(externalClaims.length > 1){
    classification = "ambiguous-multiple-external-signatures"
    claimedSignatures = externalClaims.map((claim) => claim.signature)
    providerFamilies = unique(externalClaims.map((claim) => claim.providerFamily))
  }else if(agentMatches.length === 1){
    classification = "claimed-ai-llm-agent-signature"
    claimedSignature = agentMatches[0].signature
    claimedSignatures = [claimedSignature]
    providerFamily = agentMatches[0].providerFamily
    providerFamilies = [providerFamily]
  }else if(crawlerMatches.length){
    classification = "generic-search-crawler-signature"
    claimedSignature = crawlerMatches[0].signature
    claimedSignatures = crawlerMatches.map((match) => match.signature)
    providerFamily = crawlerMatches[0].providerFamily
    providerFamilies = unique(crawlerMatches.map((match) => match.providerFamily))
  }else if(fallback){
    classification = genericAutomationTokens.has(fallback)
      ? "generic-automation-signature"
      : "generic-search-crawler-signature"
    claimedSignature = fallback
    claimedSignatures = [fallback]
  }else if(header.status === "present"){
    classification = "browser-or-other-client"
  }

  const evidenceGrade = probableEvidence({classification, providerFamily, evidence})
    ? "Probable"
    : "Unknown"

  return {
    contractVersion: agentTrafficClassificationVersion,
    classification,
    headerStatus: header.status,
    headerLength: header.length,
    internalJobNameStatus: internalName.status,
    claimedSignature,
    claimedSignatures,
    providerFamily,
    providerFamilies,
    signatureClaims: externalClaims.map(({signature, providerFamily: family, kind}) => ({
      signature,
      providerFamily: family,
      kind
    })),
    internalJobSignature,
    evidenceGrade,
    evidence,
    attributionClass: "Unknown/Unattributed",
    userAgentIsClaimOnly: true,
    authenticatesModel: false,
    verifiesHumanIdentity: false,
    eligibleForHumanAudience: false,
    countsAsConversion: false,
    provesCausation: false,
    provesAcquisitionSource: false,
    jsPixelObservesStaticFetches: false,
    staticFetchRequiresServerOrEdgeReceipt: true
  }
}
