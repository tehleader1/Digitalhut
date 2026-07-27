import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { evaluateGapOrchestration } from "../config/gap-orchestration.mjs";
import handler from "../api/insight-map.js";

const receipt = evaluateGapOrchestration();
const requiredDimensions = [
  "discovery/source-quality", "continuation", "retention", "checkout-attribution",
  "provider-payment", "durable-entitlement", "verified-conversion", "AI/model-evidence",
  "platform-audience-proxy", "infrastructure/capability",
];
assert.deepEqual(receipt.gaps.map((item) => item.dimension), requiredDimensions);
for (const item of receipt.gaps) {
  for (const field of ["evidenceClass", "numerator", "denominator", "unit", "window", "source", "confidence", "ownerFlow", "severity", "mechanism", "acceptanceTest", "stopRollbackState"])
    assert.notEqual(item[field], undefined, `${item.dimension}.${field} missing`);
}
assert.equal(receipt.conversionTruth.instrumentation, "PASS");
assert.equal(receipt.conversionTruth.verifiedConversions, 0);
assert.equal(receipt.conversionTruth.businessVerification, "NOT_READY");
assert.equal(receipt.baseline.paypalReceipts, 0);
assert.equal(receipt.baseline.durableEntitlements, 0);
assert.equal(receipt.baseline.unknownClassifications, 1182);
assert.equal(receipt.claimsPolicy.browserIdsArePeople, false);
assert.equal(receipt.claimsPolicy.platformProxySetsCapacity, false);
assert.equal(receipt.claimsPolicy.codeGuaranteesAudienceGrowth, false);
assert.equal(receipt.externalEvidence.longtail.status, "internal_capacity_not_audience_or_rank");
assert.deepEqual(receipt.orchestrationOrder.map((item) => item.flow), ["F1", "F2", "F3", "F4", "F5", "SCALE"]);
assert.equal(receipt.gate, "HOLD");
const invoke = async (method, scope = "gap-orchestration") => {
  const response = { statusCode: 0, headers: {}, body: null };
  const res = {
    setHeader: (key, value) => { response.headers[key] = value; },
    status: (code) => { response.statusCode = code; return res; },
    json: (body) => { response.body = body; return response; },
  };
  return handler({ method, query: { scope }, url: `/api/insight-map?scope=${scope}`, headers: {} }, res);
};
const get = await invoke("GET");
assert.equal(get.statusCode, 200);
assert.equal(get.body.conversionTruth.instrumentation, "PASS");
assert.equal(get.body.baseline.paypalReceipts, 0);
assert.equal(get.body.baseline.durableEntitlements, 0);
assert.equal(get.body.conversionTruth.verifiedConversions, 0);
assert.equal(get.body.conversionTruth.businessVerification, "NOT_READY");
assert.equal(get.body.baseline.unknownClassifications, 1182);
const post = await invoke("POST");
assert.equal(post.statusCode, 405);
assert.equal(post.body.error, "method_not_allowed");
assert.equal(get.headers["Cache-Control"], "no-store");

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const insightSource = fs.readFileSync(path.join(repoRoot, "api", "insight-map.js"), "utf8");
const gapIndex = insightSource.indexOf('requestedScope === "gap-orchestration"');
const audienceIndex = insightSource.indexOf('requestedScope === "audience-live"');
const postIndex = insightSource.indexOf('if(req.method === "POST")', gapIndex);
assert.ok(gapIndex > 0 && audienceIndex > gapIndex && postIndex > audienceIndex, "dispatcher order changed");
assert.ok(insightSource.includes("if(audienceScope) return handleAudienceLive(req, res)"), "audience-live contract changed");
assert.ok(insightSource.includes("const result = await saveSearchPixelEvent(req, payload)"), "default POST ingestion changed");
assert.ok(insightSource.includes("return res.status(200).json(payload)"), "default/unknown GET response changed");

const apiFiles = fs.readdirSync(path.join(repoRoot, "api"))
  .filter((name) => name.endsWith(".js") && !name.startsWith("_"));
assert.ok(apiFiles.length <= 12, `serverless function budget exceeded: ${apiFiles.length}`);
assert.ok(!apiFiles.includes("gap-orchestration-status.js"), "standalone gap function still present");
console.log(`PASS ${receipt.receiptVersion}: ${receipt.gaps.length} dimensioned gaps; conversion remains ${receipt.conversionTruth.verifiedConversions}.`);

