import fs from "node:fs"
import path from "node:path"

const repoRoot = process.cwd()
const args = new Set(process.argv.slice(2))
const rawArgs = process.argv.slice(2)
const baseArg = rawArgs.find((arg) => arg.startsWith("--base="))
const baseIndex = rawArgs.indexOf("--base")
const baseUrl = (baseArg ? baseArg.slice("--base=".length) : baseIndex >= 0 ? rawArgs[baseIndex + 1] || "" : "").replace(/\/+$/, "")
const shouldFetch = Boolean(baseUrl)
const failFast = args.has("--fail-fast")

const categories = [
  "Mainstream Streaming",
  "Planetary",
  "Gamer",
  "Real Estate",
  "Researcher",
  "Science",
  "Continent",
  "Developer",
  "Businesses",
  "History",
  "Orbital Compute"
]

const requiredFiles = [
  "package.json",
  "vite.config.js",
  "vercel.json",
  "src/components/FullscreenObservatoryV2.jsx",
  "src/lib/firecudaLibraryManifest.js",
  "src/lib/assetVectorMath.js",
  "src/lib/dailySituationDiscovery.js",
  "api/observatory-feed.js",
  "api/sketchfab.js",
  "api/provider-status.js",
  "api/asset-conversion.js",
  "supabase/migrations/202606190001_digitalhut_assets_and_feed.sql",
  "docs/current-api-renderer-map.md",
  "docs/supabase-firecuda-production.md"
]

function record(name, ok, detail = ""){
  const item = {name, ok, detail}
  results.push(item)
  const mark = ok ? "PASS" : "FAIL"
  console.log(`${mark} ${name}${detail ? ` - ${detail}` : ""}`)
  if(!ok && failFast) process.exit(1)
}

function fileExists(relativePath){
  return fs.existsSync(path.join(repoRoot, relativePath))
}

function read(relativePath){
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8")
}

function listGlbs(){
  const dir = path.join(repoRoot, "public", "models", "firecuda-library")
  if(!fs.existsSync(dir)) return []
  return fs.readdirSync(dir)
    .filter((file) => file.toLowerCase().endsWith(".glb"))
    .sort((a, b) => a.localeCompare(b))
}

function validGlbMagic(file){
  const full = path.join(repoRoot, "public", "models", "firecuda-library", file)
  const fd = fs.openSync(full, "r")
  const buffer = Buffer.alloc(4)
  fs.readSync(fd, buffer, 0, 4, 0)
  fs.closeSync(fd)
  return buffer.toString("utf8") === "glTF"
}

function namesFromManifest(){
  const source = read("src/lib/firecudaLibraryManifest.js")
  const files = new Set()
  const regex = /file:\s*"([^"]+\.glb)"/g
  let match
  while((match = regex.exec(source))) files.add(match[1])
  return {source, files}
}

function namesFromApiCatalog(){
  const source = read("api/observatory-feed.js")
  const files = new Set()
  const regex = /"([^"]+\.glb)"/g
  let match
  while((match = regex.exec(source))) files.add(match[1])
  return {source, files}
}

async function fetchJson(url){
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 12000)
  try {
    const response = await fetch(url, {signal: controller.signal})
    const text = await response.text()
    let payload = null
    try {
      payload = JSON.parse(text)
    } catch {
      payload = {raw: text.slice(0, 300)}
    }
    return {ok: response.ok, status: response.status, payload}
  } catch (error) {
    return {ok: false, status: "network-error", payload: {error: error?.message || "request failed"}}
  } finally {
    clearTimeout(timer)
  }
}

async function runEndpointChecks(){
  if(!shouldFetch) return
  const provider = await fetchJson(`${baseUrl}/api/provider-status`)
  record("provider status endpoint", provider.ok, `${provider.status}`)
  if(provider.ok){
    const configured = (provider.payload?.status || []).filter((item) => item.configured).map((item) => item.id)
    record("provider status configured list", configured.length > 0, configured.join(", ") || "no configured providers reported")
  }

  for(const category of categories){
    const url = `${baseUrl}/api/observatory-feed?category=${encodeURIComponent(category)}&query=${encodeURIComponent(category)}`
    const response = await fetchJson(url)
    const assets = response.payload?.assets || []
    const validAssetCount = assets.filter((asset) => asset.modelUrl || asset.embedUrl || asset.viewerUrl).length
    const disabledByPolicy = response.payload?.assetBase?.disabled === true || String(response.payload?.policy || "").toLowerCase().includes("disabled")
    record(
      `observatory feed ${category}`,
      response.ok && (validAssetCount > 0 || disabledByPolicy),
      `${response.status}; assets=${assets.length}; renderable=${validAssetCount}${disabledByPolicy ? "; disabled-api-first" : ""}`
    )
  }

  const sketchfab = await fetchJson(`${baseUrl}/api/sketchfab?category=Planetary&query=planetary%20environment`)
  const results = sketchfab.payload?.results || []
  record("sketchfab environment feed", sketchfab.ok, `${sketchfab.status}; results=${results.length}; authenticated=${Boolean(sketchfab.payload?.authenticated)}`)
}

const results = []

console.log("DigitalHut preservation runner")
console.log(`repo=${repoRoot}`)
if(baseUrl) console.log(`base=${baseUrl}`)

for(const relativePath of requiredFiles){
  record(`required file ${relativePath}`, fileExists(relativePath))
}

const packageJson = JSON.parse(read("package.json"))
record("vite script present", packageJson.scripts?.build === "vite build")
record("preservation scripts present", Boolean(packageJson.scripts?.preserve && packageJson.scripts?.["preserve:live"]))

const vercel = JSON.parse(read("vercel.json"))
record("vercel framework is vite", vercel.framework === "vite", `framework=${vercel.framework || "missing"}`)
record("vercel output directory is dist", vercel.outputDirectory === "dist", `output=${vercel.outputDirectory || "missing"}`)

const {source: manifestSource, files: manifestFiles} = namesFromManifest()
const {files: apiFiles} = namesFromApiCatalog()
const localGlbs = listGlbs()
record("local GLB folder present", localGlbs.length > 0, `${localGlbs.length} files`)

const badMagic = localGlbs.filter((file) => !validGlbMagic(file))
record("local GLB magic valid", badMagic.length === 0, badMagic.length ? badMagic.join(", ") : "all local GLBs start with glTF")

const missingLocalFromManifest = [...manifestFiles].filter((file) => !localGlbs.includes(file))
record("manifest local exact-name coverage", missingLocalFromManifest.length === 0, missingLocalFromManifest.length ? `missing locally: ${missingLocalFromManifest.join(", ")}` : `${manifestFiles.size} manifest GLBs found locally`)

const apiNotInManifest = [...apiFiles].filter((file) => !manifestFiles.has(file))
record("observatory-feed exact-name coverage", apiNotInManifest.length === 0, apiNotInManifest.length ? `not in manifest: ${apiNotInManifest.join(", ")}` : `${apiFiles.size} API catalog GLBs covered`)

record("FireCuda disabled state explicit", /const firecudaDisabled = true|const firecudaDisabled = false/.test(manifestSource), manifestSource.match(/const firecudaDisabled = (true|false)/)?.[0] || "missing")
record("single-object blocklist present", manifestSource.includes("defaultBlockedSingleObjectFiles"), "characters blocked from default reels")
record("environment signal filter present", manifestSource.includes("environmentSignals"), "environment-first filter active")

await runEndpointChecks()

const failed = results.filter((item) => !item.ok)
console.log("")
console.log(`Preservation result: ${results.length - failed.length}/${results.length} checks passed`)
if(failed.length){
  console.log("Failed checks:")
  failed.forEach((item) => console.log(`- ${item.name}${item.detail ? `: ${item.detail}` : ""}`))
  process.exitCode = 1
}
