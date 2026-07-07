import fs from "node:fs"

const checks = []

function read(path){
  return fs.readFileSync(path, "utf8")
}

function requireText(name, text, needle){
  const ok = text.includes(needle)
  checks.push({name, needle, ok})
  if(!ok) throw new Error(`${name} is missing ${needle}`)
}

const pixel = read("src/lib/digitalhutSearchPixel.js")
const insightMap = read("api/insight-map.js")
const vercelConfig = JSON.parse(read("vercel.json"))
const vercelIgnore = read(".vercelignore")
const contract = JSON.parse(read("public/digitalhut-supabase-measurement-contract.json"))

for(const eventName of ["watch_route_open", "blog_route_open", "category_proof_open"]){
  requireText("digitalhutSearchPixel.js", pixel, eventName)
  requireText("insight-map.js", insightMap, eventName)
}

for(const eventName of ["backlink_source_open", "glb_source_click", "podcast_source_open"]){
  requireText("digitalhutSearchPixel.js", pixel, eventName)
}

for(const eventName of ["backlink_source_open", "glb_source_click", "podcast_source_open", "viral_source_backlink_open"]){
  requireText("insight-map.js", insightMap, eventName)
}

for(const frontendGuard of ["function linkContext(href)", "const proofEvent = routeProofEventForPath(link.path)", "const sourceIntent =", "!proofEvent && !sourceIntent", "isPodcastControl"]){
  requireText("digitalhutSearchPixel.js", pixel, frontendGuard)
}

requireText("vercel.json", vercelConfig.buildCommand || "", "tools/verify-metric-contract.mjs")

for(const ignoredPath of vercelIgnore.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)){
  if(ignoredPath === "tools/" || ignoredPath === "tools" || ignoredPath === "tools/verify-metric-contract.mjs"){
    throw new Error(`.vercelignore excludes the metric verifier with ${ignoredPath}`)
  }
}

const proofContract = contract.events.find((event) => event.canonicalEvent === "proof_route_open")
const sourceContract = contract.events.find((event) => event.canonicalEvent === "backlink_source_open")

if(!proofContract) throw new Error("measurement contract is missing proof_route_open")
if(!sourceContract) throw new Error("measurement contract is missing backlink_source_open")

for(const eventName of ["watch_route_open", "blog_route_open", "category_proof_open"]){
  if(!proofContract.emittedNames?.includes(eventName) && !proofContract.aliases?.includes(eventName)){
    throw new Error(`proof_route_open contract is missing ${eventName}`)
  }
}

for(const eventName of ["glb_source_click", "podcast_source_open", "viral_source_backlink_open"]){
  if(!sourceContract.apiReadNames?.includes(eventName) && !sourceContract.aliases?.includes(eventName)){
    throw new Error(`backlink_source_open contract is missing ${eventName}`)
  }
}

console.log(JSON.stringify({
  ok: true,
  checked: checks.length,
  vercelBuildGate: vercelConfig.buildCommand,
  proofRouteNames: ["watch_route_open", "blog_route_open", "category_proof_open"],
  sourceNames: ["backlink_source_open", "glb_source_click", "podcast_source_open", "viral_source_backlink_open"],
  frontendPriorityGuards: ["linkContext", "proofEvent", "sourceIntent", "podcastControl", "genericPreviewGuard"]
}, null, 2))
