import readline from "node:readline/promises"
import {stdin as input, stdout as output} from "node:process"

const defaultBaseUrl = "https://www.digitalhut.app"

function getArg(name){
  const prefix = `--${name}=`
  const item = process.argv.find((value) => value.startsWith(prefix))
  return item ? item.slice(prefix.length) : ""
}

function requireSecret(){
  const secret = getArg("secret") || process.env.DIGITALHUT_RUNNER_SECRET || process.env.DIGITALHUT_RUNNER_CRON_SECRET || ""
  if(!secret.trim()){
    console.error("Missing runner secret. Use --secret=YOUR_SECRET or set DIGITALHUT_RUNNER_SECRET.")
    process.exit(1)
  }
  return secret.trim()
}

async function askRunner({baseUrl, secret, message}){
  const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/api/overnight-runner`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "x-digitalhut-runner-secret": secret
    },
    body: JSON.stringify({
      action: "chat",
      secret,
      message
    })
  })
  const data = await response.json().catch(() => ({}))
  if(!response.ok || !data.ok){
    throw new Error(data.error || data.detail || `Runner request failed with ${response.status}`)
  }
  return {
    reply: data.runnerChat?.reply || data.report?.anthonyBrief?.directSummary || data.report?.summary || "Runner returned no reply.",
    report: data.report,
    reasoning: data.runnerChat?.reasoning
  }
}

function printWrapped(label, text, width = 96){
  const words = String(text || "").split(/\s+/).filter(Boolean)
  const lines = []
  let current = ""
  words.forEach((word) => {
    if(`${current} ${word}`.trim().length > width){
      lines.push(current)
      current = word
    } else {
      current = `${current} ${word}`.trim()
    }
  })
  if(current) lines.push(current)
  console.log(`${label} ${lines.shift() || ""}`)
  lines.forEach((line) => console.log(`${" ".repeat(label.length + 1)}${line}`))
}

function printHeader(baseUrl){
  console.log("")
  console.log("DigitalHut Runner Chat")
  console.log(`Target: ${baseUrl}`)
  console.log("Type a message and press Enter. Type /status for a system read. Type /exit to quit.")
  console.log("")
}

async function main(){
  const baseUrl = getArg("base") || process.env.DIGITALHUT_RUNNER_BASE_URL || defaultBaseUrl
  const secret = requireSecret()
  const rl = readline.createInterface({input, output})
  printHeader(baseUrl)
  try {
    while(true){
      const raw = await rl.question("Anthony > ")
      const text = raw.trim()
      if(!text) continue
      if(text === "/exit" || text === "/quit"){
        break
      }
      const message = text === "/status"
        ? "Give me a direct human status summary. What are you looking at, what statistics did you compare, what SEO words are improving, what does FireCuda need to map next, and what should Anthony do next?"
        : text
      try {
        const result = await askRunner({baseUrl, secret, message})
        console.log("")
        printWrapped("Runner >", result.reply)
        console.log("")
      } catch (error) {
        console.error("")
        console.error(`Runner error: ${error.message}`)
        console.error("")
      }
    }
  } finally {
    rl.close()
  }
}

main().catch((error) => {
  console.error(error?.message || String(error))
  process.exit(1)
})
