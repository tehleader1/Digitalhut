import {execFileSync} from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import process from "node:process"
import {randomUUID} from "node:crypto"

const root = path.resolve(new URL("..", import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, value => value.slice(1)))
const outputPath = path.join(root, ".cache", "digitalhut-codex-session-summary.json")
const git = process.env.DIGITALHUT_GIT || "git"
const args = Object.fromEntries(process.argv.slice(2).map(item => {
  const [key, ...value] = item.replace(/^--/, "").split("=")
  return [key, value.join("=").trim()]
}))
const required = ["audience", "problem", "solution", "value", "proof", "destination"]
for(const field of required){
  if(!args[field] || args[field].length < 8 || args[field].length > 500) throw new Error(`invalid-${field}`)
}
const destination = new URL(args.destination)
if(!["digitalhut.app", "www.digitalhut.app"].includes(destination.hostname)) throw new Error("destination-must-be-digitalhut")
const forbidden = /\b(password|secret|token|credential|private key|seed phrase|guaranteed|millions?)\b/i
if(forbidden.test(Object.values(args).join(" "))) throw new Error("summary-contains-forbidden-content")
const now = Date.now()
const ttl = Math.max(15, Math.min(240, Number(args["ttl-minutes"] || 120)))
const targetRef = args["release-ref"] || "HEAD"
const repoHeadAtCapture = execFileSync(git, ["rev-parse", targetRef], {cwd:root, encoding:"utf8", windowsHide:true}).trim()
const summary = {
  schemaVersion:1,
  id:randomUUID(),
  createdAt:new Date(now).toISOString(),
  expiresAt:new Date(now + ttl * 60 * 1000).toISOString(),
  repoHeadAtCapture,
  source:"active-codex-anthony-session",
  audience:args.audience,
  problem:args.problem,
  solution:args.solution,
  value:args.value,
  proof:args.proof,
  destination:destination.href,
  tone:"Anthony-DigitalHut-welcoming-direct-honest-family-respect"
}
fs.mkdirSync(path.dirname(outputPath), {recursive:true})
fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2)+"\n")
console.log(JSON.stringify({ok:true,id:summary.id,expiresAt:summary.expiresAt,repoHeadAtCapture:summary.repoHeadAtCapture}, null, 2))
