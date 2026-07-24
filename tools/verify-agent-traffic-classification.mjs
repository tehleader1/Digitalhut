import assert from "node:assert/strict"
import {
  agentTrafficHeaderLimit,
  claimedAiAgentSignatures,
  classifyAgentCrawlerTraffic,
  internalReportingJobSignatures
} from "../src/lib/agentTrafficClassification.js"

let checked = 0
const check = (condition, message) => {
  checked += 1
  assert.ok(condition, message)
}

const boundaryCheck = (result, label) => {
  check(["Unknown", "Probable"].includes(result.evidenceGrade), `${label}: unsupported evidence grade`)
  check(result.authenticatesModel === false, `${label}: user-agent must not authenticate a model`)
  check(result.verifiesHumanIdentity === false, `${label}: user-agent must not verify a human`)
  check(result.eligibleForHumanAudience === false, `${label}: classifier must not create human audience`)
  check(result.countsAsConversion === false, `${label}: classifier must not create a conversion`)
  check(result.provesCausation === false, `${label}: classifier must not prove causation`)
  check(result.provesAcquisitionSource === false, `${label}: classifier must preserve unattributed arrival`)
  check(result.attributionClass === "Unknown/Unattributed", `${label}: attribution class must remain unknown`)
  check(result.jsPixelObservesStaticFetches === false, `${label}: JS pixel static-fetch blindness missing`)
  check(result.staticFetchRequiresServerOrEdgeReceipt === true, `${label}: static-fetch receipt boundary missing`)
  check(!Object.hasOwn(result, "userAgent"), `${label}: raw user-agent must not be returned`)
  check(Array.isArray(result.signatureClaims), `${label}: signature claim audit list missing`)
}

const alternatingCase = (value) => [...value]
  .map((character, index) => index % 2 ? character.toUpperCase() : character.toLowerCase())
  .join("")

for(const definition of claimedAiAgentSignatures){
  const result = classifyAgentCrawlerTraffic({
    userAgent: `Mozilla/5.0 (compatible; ${alternatingCase(definition.signature)}/1.0; +https://example.invalid/bot)`
  })
  check(result.classification === "claimed-ai-llm-agent-signature", `${definition.signature}: agent signature not separated`)
  check(result.claimedSignature === definition.signature, `${definition.signature}: claimed signature missing`)
  check(result.providerFamily === definition.providerFamily, `${definition.signature}: provider family mismatch`)
  check(result.signatureClaims[0]?.kind === "ai-llm-agent", `${definition.signature}: claim kind mismatch`)
  check(result.evidenceGrade === "Unknown", `${definition.signature}: user-agent-only evidence must remain Unknown`)
  boundaryCheck(result, definition.signature)
}

const spoofed = classifyAgentCrawlerTraffic({userAgent: "Mozilla/5.0 GPTBot/1.0"})
check(spoofed.classification === "claimed-ai-llm-agent-signature", "spoofed signature should be recorded as a claim")
check(spoofed.evidenceGrade === "Unknown", "spoofed signature must remain Unknown")
check(spoofed.userAgentIsClaimOnly === true, "spoofed signature truth boundary missing")
boundaryCheck(spoofed, "spoofed-gptbot")

const signatureUrl = classifyAgentCrawlerTraffic({
  userAgent: "Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)"
})
check(signatureUrl.classification === "claimed-ai-llm-agent-signature", "signature documentation URL must not create a second bot claim")
check(signatureUrl.claimedSignatures.length === 1, "signature documentation URL must be ignored during token matching")

const probable = classifyAgentCrawlerTraffic({
  userAgent: "GPTBot/1.0",
  evidence: {
    observationSource: "server-or-edge-log",
    immutableDeployment: true,
    providerIdentityCorroborated: true
  }
})
check(probable.evidenceGrade === "Probable", "corroborated immutable server receipt should be Probable")
boundaryCheck(probable, "probable-gptbot")

for(const incompleteEvidence of [
  {observationSource: "js-pixel", immutableDeployment: true, providerIdentityCorroborated: true},
  {observationSource: "server-or-edge-log", immutableDeployment: false, providerIdentityCorroborated: true},
  {observationSource: "server-or-edge-log", immutableDeployment: true, providerIdentityCorroborated: false},
  {observationSource: "provider-receipt", immutableDeployment: true, providerIdentityCorroborated: true, internalOrSynthetic: true}
]){
  const result = classifyAgentCrawlerTraffic({userAgent: "GPTBot/1.0", evidence: incompleteEvidence})
  check(result.evidenceGrade === "Unknown", `incomplete evidence must remain Unknown: ${JSON.stringify(incompleteEvidence)}`)
}

const embeddedSubstring = classifyAgentCrawlerTraffic({userAgent: "Mozilla/5.0 AgentGptbotHelper/1.0"})
check(embeddedSubstring.classification === "browser-or-other-client", "embedded substring must not become a claimed agent")
boundaryCheck(embeddedSubstring, "embedded-substring")

const multiple = classifyAgentCrawlerTraffic({
  userAgent: "GPTBot/1.0 ClaudeBot/1.0",
  evidence: {
    observationSource: "provider-receipt",
    immutableDeployment: true,
    providerIdentityCorroborated: true
  }
})
check(multiple.classification === "ambiguous-multiple-external-signatures", "multiple signatures must be ambiguous")
check(multiple.claimedSignature === null, "ambiguous signatures must not select one claim")
check(multiple.claimedSignatures.includes("gptbot") && multiple.claimedSignatures.includes("claudebot"), "multiple signatures must be retained")
check(multiple.providerFamilies.includes("openai") && multiple.providerFamilies.includes("anthropic"), "multiple provider families must be retained")
check(multiple.evidenceGrade === "Unknown", "ambiguous signatures must never promote to Probable")
boundaryCheck(multiple, "multiple-signatures")

for(const [label, userAgent, expectedSignatures, expectedFamilies] of [
  ["agent-plus-crawler", "GPTBot/1.0 Googlebot/2.1", ["gptbot", "googlebot"], ["openai", "google"]],
  ["agent-plus-generic", "ClaudeBot/1.0 ExampleCrawler/1.0", ["claudebot", "examplecrawler"], ["anthropic"]],
  ["two-generic-crawlers", "Googlebot/2.1 bingbot/2.0", ["googlebot", "bingbot"], ["google", "microsoft"]]
]){
  const result = classifyAgentCrawlerTraffic({
    userAgent,
    evidence: {
      observationSource: "provider-receipt",
      immutableDeployment: true,
      providerIdentityCorroborated: true
    }
  })
  check(result.classification === "ambiguous-multiple-external-signatures", `${label}: conflicting signatures must be ambiguous`)
  check(result.claimedSignature === null, `${label}: conflicting signatures must not select one claim`)
  check(expectedSignatures.every((signature) => result.claimedSignatures.includes(signature)), `${label}: signature audit list incomplete`)
  check(expectedFamilies.every((family) => result.providerFamilies.includes(family)), `${label}: provider-family audit list incomplete`)
  check(result.evidenceGrade === "Unknown", `${label}: conflicting signatures must remain Unknown`)
  boundaryCheck(result, label)
}

const genericCrawlers = [
  ["Googlebot/2.1", "googlebot", "google"],
  ["bingbot/2.0", "bingbot", "microsoft"],
  ["Baiduspider/2.0", "baiduspider", "baidu"],
  ["DuckDuckBot/1.0", "duckduckbot", "duckduckgo"],
  ["CCBot/2.0", "ccbot", "common-crawl"],
  ["ExampleCrawler/1.0", "examplecrawler", null],
  ["CustomSpider/1.0", "customspider", null]
]

for(const [userAgent, signature, providerFamily] of genericCrawlers){
  const result = classifyAgentCrawlerTraffic({userAgent})
  check(result.classification === "generic-search-crawler-signature", `${userAgent}: generic crawler not separated`)
  check(result.claimedSignature === signature, `${userAgent}: crawler signature mismatch`)
  check(result.providerFamily === providerFamily, `${userAgent}: crawler provider family mismatch`)
  check(result.evidenceGrade === "Unknown", `${userAgent}: user-agent-only crawler must remain Unknown`)
  boundaryCheck(result, userAgent)
}

const probableGeneric = classifyAgentCrawlerTraffic({
  userAgent: "Googlebot/2.1",
  evidence: {
    observationSource: "provider-receipt",
    immutableDeployment: true,
    providerIdentityCorroborated: true
  }
})
check(probableGeneric.evidenceGrade === "Probable", "corroborated known crawler receipt should be Probable")
boundaryCheck(probableGeneric, "probable-googlebot")

const unknownFamilyCrawler = classifyAgentCrawlerTraffic({
  userAgent: "ExampleCrawler/1.0",
  evidence: {
    observationSource: "server-or-edge-log",
    immutableDeployment: true,
    providerIdentityCorroborated: true
  }
})
check(unknownFamilyCrawler.evidenceGrade === "Unknown", "unknown crawler family must remain Unknown")

for(const userAgent of ["HeadlessChrome/140.0", "Lighthouse/12.0", "PageSpeed/1.0"]){
  const result = classifyAgentCrawlerTraffic({userAgent})
  check(result.classification === "generic-automation-signature", `${userAgent}: automation classification missing`)
  check(result.evidenceGrade === "Unknown", `${userAgent}: generic automation must remain Unknown`)
  boundaryCheck(result, userAgent)
}

const browser = classifyAgentCrawlerTraffic({
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0 Safari/537.36",
  evidence: {
    observationSource: "server-or-edge-log",
    immutableDeployment: true,
    providerIdentityCorroborated: true
  }
})
check(browser.classification === "browser-or-other-client", "ordinary browser classification missing")
check(browser.evidenceGrade === "Unknown", "browser user-agent must not become verified human")
boundaryCheck(browser, "ordinary-browser")

for(const definition of internalReportingJobSignatures){
  const result = classifyAgentCrawlerTraffic({userAgent: `${definition.signature}/1.0`})
  check(result.classification === "internal-reporting-job", `${definition.signature}: internal reporting job not separated`)
  check(result.internalJobSignature === definition.signature, `${definition.signature}: internal job signature missing`)
  check(result.evidenceGrade === "Unknown", `${definition.signature}: internal job must remain Unknown external traffic`)
  boundaryCheck(result, definition.signature)
}

const namedInternalJob = classifyAgentCrawlerTraffic({
  userAgent: "Mozilla/5.0",
  internalJobName: "Codex-Overseer"
})
check(namedInternalJob.classification === "internal-reporting-job", "explicit internal job name not classified")
check(namedInternalJob.internalJobSignature === "codex-overseer", "explicit internal job signature mismatch")

const internalPrecedence = classifyAgentCrawlerTraffic({
  userAgent: "DigitalHut-Crawl-Trail-Verifier/1.0 GPTBot/1.0",
  evidence: {
    observationSource: "provider-receipt",
    immutableDeployment: true,
    providerIdentityCorroborated: true
  }
})
check(internalPrecedence.classification === "internal-reporting-job", "internal reporting job must precede agent claim")
check(internalPrecedence.claimedSignatures.includes("gptbot"), "internal mixed signature should retain claimed token for audit")
check(internalPrecedence.evidenceGrade === "Unknown", "internal mixed signature must remain Unknown")
boundaryCheck(internalPrecedence, "internal-precedence")

for(const [label, userAgent, expectedStatus] of [
  ["undefined", undefined, "missing"],
  ["null", null, "missing"],
  ["empty", "", "missing"],
  ["whitespace", "   ", "missing"],
  ["object", {value: "GPTBot/1.0"}, "malformed"],
  ["array", ["GPTBot/1.0"], "malformed"],
  ["control", "GPTBot/1.0\r\nInjected: value", "malformed"],
  ["over-limit", `GPTBot/1.0 ${"x".repeat(agentTrafficHeaderLimit)}`, "malformed"]
]){
  const result = classifyAgentCrawlerTraffic({userAgent})
  check(result.headerStatus === expectedStatus, `${label}: header status mismatch`)
  check(result.classification === "unknown-or-unattributed", `${label}: invalid header must fail closed`)
  check(result.evidenceGrade === "Unknown", `${label}: invalid header must remain Unknown`)
  boundaryCheck(result, `invalid-${label}`)
}

const malformedInput = classifyAgentCrawlerTraffic("GPTBot/1.0")
check(malformedInput.classification === "unknown-or-unattributed", "non-object classifier input must fail closed")
check(malformedInput.evidenceGrade === "Unknown", "non-object classifier input must remain Unknown")

console.log(JSON.stringify({
  ok: true,
  checked,
  contractVersion: probable.contractVersion,
  claimedAgentSignatures: claimedAiAgentSignatures.length,
  internalReportingJobs: internalReportingJobSignatures.length,
  evidenceGrades: ["Unknown", "Probable"],
  staticFetchVisibleToJsPixel: false,
  conversionsCreated: false,
  causationProved: false
}, null, 2))
