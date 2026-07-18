import {execFileSync} from "node:child_process"
import fs from "node:fs"
import https from "node:https"
import path from "node:path"
import process from "node:process"

const root = path.resolve(new URL("..", import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, value => value.slice(1)))
const statePath = path.join(root, ".cache", "digitalhut-social-autopublisher.json")
const git = process.env.DIGITALHUT_GIT || "git"
const maxDaily = 6
const maxHalfHour = 2
const expectedSha = process.argv.find(value => value.startsWith("--expected-sha="))?.split("=")[1]
const eligible = /^(deploy|release|publish|launch|complete|promote|add|update|fix)\b/i
const forbidden = /\b(password|secret|token|credential|private key|seed phrase|customer|email|phone|address|lawsuit|guarantee|million|revenue|hack|exploit)\b/i
const nicheRules = [
  {match:/social|mixpost|campaign|share/i,audience:"creators and small teams",problem:"publishing across disconnected tools makes it difficult to keep releases consistent and verifiable",solution:"connects approved production releases to a bounded social workflow with duplicate protection, speed limits, pause control, and delivery receipts"},
  {match:/glb|3d|asset|renderer/i,audience:"3D creators and visual researchers",problem:"interactive models are often separated from the sources and explanations that make them useful",solution:"places interactive 3D models beside watch, podcast, source, and proof paths in one free-first observatory"},
  {match:/podcast|video|watch|media/i,audience:"viewers, researchers, and podcast teams",problem:"important media moments get scattered across tabs without a useful continuation path",solution:"connects video and podcast moments to related visuals, sources, and stable routes"},
  {match:/seo|search|sitemap|canonical|crawl/i,audience:"independent publishers and site owners",problem:"valuable work can remain invisible when search routes lack clear structure and source-backed answers",solution:"builds crawlable, canonical discovery routes around specific audience questions without inventing ranking claims"},
  {match:/market|stock|finance/i,audience:"market learners and research teams",problem:"market information is hard to follow when charts, media context, and sources live in separate places",solution:"organizes source-aware market observations with visual and media context without presenting financial advice"},
  {match:/accessibility|mobile|keyboard|motion/i,audience:"mobile and accessibility-conscious visitors",problem:"complex visual experiences often become difficult to operate across touch, keyboard, and reduced-motion settings",solution:"keeps the observatory navigable across device and accessibility preferences"},
]

function run(command, args){
  return execFileSync(command, args, {cwd:root, encoding:"utf8", windowsHide:true}).trim()
}

function readState(){
  try { return JSON.parse(fs.readFileSync(statePath, "utf8")) } catch { return {receipts:[], paused:false} }
}

function siteIsHealthy(){
  return new Promise(resolve => {
    const request = https.get("https://www.digitalhut.app/updates", {timeout:15000}, response => {
      response.resume()
      resolve(response.statusCode === 200)
    })
    request.on("timeout", () => {request.destroy(); resolve(false)})
    request.on("error", () => resolve(false))
  })
}

const state = readState()
const controlOutput = run("docker", ["exec", "-e", "DIGITALHUT_CONTROL_STATUS=1", "digitalhut-social", "php", "/var/www/html/digitalhut-auto-enqueue.php"])
const control = JSON.parse(controlOutput.split(/\r?\n/).at(-1))
if(state.paused || control.paused){ console.log(JSON.stringify({ok:false,reason:"emergency-pause"})); process.exit(0) }

run(git, ["fetch", "origin", "main", "--quiet"])
const sha = run(git, ["rev-parse", "origin/main"])
const shortSha = sha.slice(0, 12)
const subject = run(git, ["log", "-1", "--format=%s", sha]).replace(/\s+/g, " ").trim()
const changedPaths = run(git, ["diff-tree", "--no-commit-id", "--name-only", "-r", sha])
const niche = nicheRules.find(rule => rule.match.test(`${subject}\n${changedPaths}`))
const authoredAt = Number(run(git, ["log", "-1", "--format=%ct", sha])) * 1000
const now = Date.now()
const today = new Date(now).toISOString().slice(0, 10)
const todaysReceipts = state.receipts.filter(item => item.day === today)
const recentReceipts = state.receipts.filter(item => now - item.queuedAt < 30 * 60 * 1000)

let reason = null
if(expectedSha && sha !== expectedSha) reason = "release-not-visible-on-main"
else if(state.receipts.some(item => item.sha === sha)) reason = "already-received"
else if(!eligible.test(subject)) reason = "not-release-shaped"
else if(forbidden.test(subject)) reason = "sensitive-or-unsupported-claim"
else if(!niche) reason = "client-problem-not-proven"
else if(now - authoredAt < 10 * 60 * 1000) reason = "deployment-settlement-window"
else if(todaysReceipts.length >= maxDaily) reason = "daily-frequency-cap"
else if(recentReceipts.length >= maxHalfHour) reason = "adaptive-speed-limit"
else if(!(await siteIsHealthy())) reason = "production-health-check-failed"

if(reason){ console.log(JSON.stringify({ok:false,reason,sha:shortSha,subject})); process.exit(0) }

const body = `For ${niche.audience}: ${niche.problem}. DigitalHut ${niche.solution}. Explore the verified working experience at https://www.digitalhut.app/updates\n\n#DigitalHut #BuildInPublic`
const evidence = `git:${shortSha}`
const output = run("docker", ["exec", "-e", `DIGITALHUT_POST_BODY=${body}`, "-e", `DIGITALHUT_EVIDENCE_ID=${evidence}`, "-e", "DIGITALHUT_SCHEDULE_DELAY_MINUTES=5", "digitalhut-social", "php", "/var/www/html/digitalhut-auto-enqueue.php"])
const receipt = JSON.parse(output.split(/\r?\n/).at(-1))
state.receipts.push({sha, day:today, subject, queuedAt:now, mixpost:receipt})
state.receipts = state.receipts.slice(-200)
fs.mkdirSync(path.dirname(statePath), {recursive:true})
fs.writeFileSync(statePath, JSON.stringify(state, null, 2)+"\n")
console.log(JSON.stringify({ok:true,sha:shortSha,subject,mixpost:receipt}, null, 2))
