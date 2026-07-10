import fs from "node:fs"

const required = [
  "dist/index.html",
  "dist/digitalhut-route-crawl-shells.json",
  "public/sitemap.xml",
  "public/sitemap-index.xml",
  "public/sitemap-master-keyword-50000.xml",
  "public/digitalhut-search-console-row-push.json"
]

const missing = required.filter((file) => !fs.existsSync(file))
if(missing.length) throw new Error(`Missing release artifacts: ${missing.join(", ")}`)

const sitemapReceipt = JSON.parse(fs.readFileSync("public/digitalhut-search-console-row-push.json", "utf8"))
const routeReceipt = JSON.parse(fs.readFileSync("dist/digitalhut-route-crawl-shells.json", "utf8"))
const expectedRows = Number(process.env._SITEMAP_WINDOW || 50000)
const expectedUniverse = Number(process.env._MASTER_KEYWORD_UNIVERSE || 200572944)
const masterRows = Number(sitemapReceipt.producedMasterKeywordUrlRows || sitemapReceipt.masterKeywordRows || 0)
const universe = Number(sitemapReceipt.verifiedMasterKeywordUniverse || sitemapReceipt.masterKeywordUniverse || 0)
const crawlShells = Number(routeReceipt.routeCount || 0)

if(masterRows !== expectedRows){
  throw new Error(`Expected ${expectedRows} master keyword rows; received ${masterRows}`)
}
if(universe !== expectedUniverse){
  throw new Error(`Expected universe ${expectedUniverse}; received ${universe}`)
}
if(crawlShells < 180){
  throw new Error(`Expected at least 180 crawl shells; received ${crawlShells}`)
}

const receipt = {
  status: "digitalhut-cloud-build-verified",
  buildId: process.env.BUILD_ID || "local-verification",
  commitSha: process.env.COMMIT_SHA || "local-workspace",
  branchName: process.env.BRANCH_NAME || "local-workspace",
  masterKeywordUniverse: universe,
  sitemapWindow: masterRows,
  totalSitemapRows: Number(sitemapReceipt.producedTotalSitemapUrlRows || 0),
  crawlShells,
  generatedAt: new Date().toISOString()
}

fs.writeFileSync("dist/digitalhut-cloud-build-receipt.json", `${JSON.stringify(receipt, null, 2)}\n`)
console.log(JSON.stringify(receipt, null, 2))
