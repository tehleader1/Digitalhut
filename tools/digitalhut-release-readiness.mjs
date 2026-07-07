import fs from "node:fs"
import path from "node:path"
import process from "node:process"

function exists(file){
  try { return fs.existsSync(file) } catch { return false }
}

function readJson(file, fallback = null){
  try { return JSON.parse(fs.readFileSync(file, "utf8")) } catch { return fallback }
}

function statAgeSeconds(file){
  try { return Math.round((Date.now() - fs.statSync(file).mtimeMs) / 1000) } catch { return null }
}

const root = process.cwd()
const home = process.env.USERPROFILE || process.env.HOME || ""
const vercelProject = readJson(path.join(root, ".vercel", "project.json"), {})
const commandCenter = readJson(path.join(root, "public", "digitalhut-release-command-center.json"), {})
const metricReceipt = readJson(path.join(root, "public", "digitalhut-metric-contract-verifier-019.json"), {})
const packageJson = readJson(path.join(root, "package.json"), {})

const possibleVercelCli = [
  path.join(root, "node_modules", ".bin", process.platform === "win32" ? "vercel.cmd" : "vercel"),
  path.join(root, "node_modules", "vercel", "dist", "index.js")
]

const userVercelAuth = home ? path.join(home, ".vercel", "auth.json") : ""
const distIndex = path.join(root, "dist", "index.html")

const checks = [
  {id: "vercel-project-linked", ok: Boolean(vercelProject.projectId && vercelProject.orgId), detail: vercelProject.projectName || "missing .vercel/project.json"},
  {id: "vercel-auth-visible", ok: Boolean(process.env.VERCEL_TOKEN || (userVercelAuth && exists(userVercelAuth))), detail: process.env.VERCEL_TOKEN ? "VERCEL_TOKEN present" : userVercelAuth || "no home folder"},
  {id: "vercel-cli-visible", ok: possibleVercelCli.some(exists), detail: possibleVercelCli.filter(exists)[0] || "no local Vercel CLI found"},
  {id: "metric-receipt-present", ok: metricReceipt.status === "frontend-priority-guard-added", detail: metricReceipt.status || "missing metric receipt"},
  {id: "command-center-current", ok: commandCenter.currentBuildGate === "local-vite-build-passed", detail: commandCenter.currentBuildGate || "missing command center"},
  {id: "dist-built", ok: exists(distIndex), detail: exists(distIndex) ? `dist/index.html age ${statAgeSeconds(distIndex)}s` : "dist/index.html missing"},
  {id: "cloud-build-command-guarded", ok: String(readJson(path.join(root, "vercel.json"), {}).buildCommand || "").includes("tools/verify-metric-contract.mjs"), detail: readJson(path.join(root, "vercel.json"), {}).buildCommand || "missing build command"},
  {id: "package-release-script", ok: Boolean(packageJson.scripts?.["verify:release"]), detail: packageJson.scripts?.["verify:release"] || "missing verify:release"}
]

const failed = checks.filter((check) => !check.ok)
const deployStatus = failed.some((check) => ["vercel-auth-visible", "vercel-cli-visible"].includes(check.id))
  ? "deploy-auth-or-cli-needed"
  : failed.length
    ? "release-checks-incomplete"
    : "release-ready"

console.log(JSON.stringify({
  ok: failed.length === 0,
  deployStatus,
  project: {
    name: vercelProject.projectName || "unknown",
    projectId: vercelProject.projectId || "",
    orgId: vercelProject.orgId || ""
  },
  currentFloor: commandCenter.lastKnownMetrics || metricReceipt.currentLiveFloor || {},
  checks,
  failed: failed.map((check) => check.id),
  nextAction: deployStatus === "deploy-auth-or-cli-needed"
    ? "Restore Vercel CLI/auth or VERCEL_TOKEN, then deploy the verified analytics-priority batch."
    : "Run metric verifier, build, deploy, then compare proof/source hit markers first."
}, null, 2))
