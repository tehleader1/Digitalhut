import {mkdirSync, readFileSync, writeFileSync} from "node:fs"
import {dirname, resolve} from "node:path"
import {seoSectorExpansionCandidates} from "../src/lib/seoSectorExpansion.js"

const repoRoot = resolve(import.meta.dirname, "..")
const coveragePath = resolve(repoRoot, "public", "digitalhut-master-keyword-coverage.json")
const evidencePath = resolve(repoRoot, "public", "digitalhut-master-list-evidence-latest.json")
const outputs = [
  resolve(repoRoot, "public", "digitalhut-sector-expansion-cycle.json"),
  resolve(repoRoot, "docs", "digitalhut-sector-expansion-cycle.json")
]

function readJson(path){
  try {
    return JSON.parse(readFileSync(path, "utf8"))
  } catch {
    return {}
  }
}

const coverage = readJson(coveragePath)
const evidence = readJson(evidencePath)
const production = evidence.production || {}
const measuredBehavior = {
  pageViews: Number(production.pageViews || 0),
  uniqueVisitors: Number(production.uniqueVisitors || 0),
  secondActions: Number(production.secondActions || 0),
  proofOpens: Number(production.proofOpens || 0),
  sourceOpens: Number(production.sourceOpens || 0)
}
const candidates = seoSectorExpansionCandidates.map((candidate) => ({
  ...candidate,
  status: "gated-candidate",
  publicSitemapEligible: false,
  promotionRule: "Require a verified source, usable 3D context, and a measured second action before creating a dedicated public proof route."
}))
const sourceReferenceCount = candidates.reduce((total, candidate) => total + candidate.sourceReferences.length, 0)
const queryFamilyCount = candidates.reduce((total, candidate) => total + candidate.queryFamilies.length, 0)
const systemFitCount = candidates.reduce((total, candidate) => total + candidate.requiredSystemFit.length, 0)

const receipt = {
  generatedAt: new Date().toISOString(),
  status: "sector-expansion-cycle-ready",
  truthBoundary: "This is a measured sector-mapping feed. Internal variation coverage does not equal Google ranking, and no candidate is public until its proof gate is met.",
  wholeSystemFacet: "video session + 3D Model View + podcast/source moment + live analytics",
  currentMasterList: {
    internalVariationCapacity: Number(coverage.totalIndividualRanks || 0),
    selectedPublicRows: Number(coverage.materializedSitemapUrlRows || 0),
    canonicalProofRoutes: Number(coverage.publicCanonicalMasterSitemapUrlRows || 0)
  },
  measuredBehavior,
  mapping: {
    candidateCount: candidates.length,
    sourceReferenceCount,
    queryFamilyCount,
    systemFitCount,
    publicSitemapCandidates: 0,
    promotionReadyCandidates: 0
  },
  nextDecision: measuredBehavior.proofOpens > 0 || measuredBehavior.sourceOpens > 0
    ? "Review the sector whose proof/source behavior moved and prepare one dedicated route."
    : "Keep candidates internal; improve source and second-action evidence before expanding public surfaces.",
  candidates
}

for(const output of outputs){
  mkdirSync(dirname(output), {recursive: true})
  writeFileSync(output, `${JSON.stringify(receipt, null, 2)}\n`, "utf8")
}

console.log(JSON.stringify({
  status: receipt.status,
  internalVariationCapacity: receipt.currentMasterList.internalVariationCapacity,
  candidates: receipt.mapping.candidateCount,
  sourceReferences: receipt.mapping.sourceReferenceCount,
  queryFamilies: receipt.mapping.queryFamilyCount,
  nextDecision: receipt.nextDecision
}, null, 2))
