import {mkdir, readFile, writeFile} from "node:fs/promises"
import path from "node:path"
import {fileURLToPath} from "node:url"

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const docsDir = path.join(repoRoot, "docs")
const publicDir = path.join(repoRoot, "public")
const generatedAt = new Date().toISOString()

const defaults = {
  topic: "new viral video",
  category: "Mainstream Streaming",
  platform: "YouTube",
  source: "first source feed",
  market: "United States",
  urgency: "ready"
}

function parseArgs(argv){
  const parsed = {...defaults}
  for(let index = 0; index < argv.length; index += 1){
    const value = argv[index]
    if(!value.startsWith("--")) continue
    const key = value.slice(2)
    const next = argv[index + 1]
    if(next && !next.startsWith("--")){
      parsed[key] = next
      index += 1
    } else {
      parsed[key] = "true"
    }
  }
  return parsed
}

function slugFor(value){
  return String(value || "digitalhut")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 88) || "digitalhut"
}

function sourceHost(source){
  try {
    return new URL(source).hostname.replace(/^www\./, "")
  } catch {
    return String(source || "first source feed").replace(/^https?:\/\//, "").split("/")[0] || "first source feed"
  }
}

function keywordSet({topic, category, platform, source, market}){
  const host = sourceHost(source)
  const cleanTopic = String(topic).trim()
  const cleanCategory = String(category).trim()
  const cleanPlatform = String(platform).trim()
  const cleanMarket = String(market).trim()
  const analyticsPhrase = cleanTopic.toLowerCase().includes("viral")
    ? `${cleanTopic} analytics 2026`
    : `${cleanTopic} viral video analytics 2026`
  return Array.from(new Set([
    `${cleanTopic} first source feed`,
    analyticsPhrase,
    `${cleanTopic} DigitalHut observatory`,
    `${cleanTopic} GLB renderer proof`,
    `${cleanTopic} Apple Podcasts source moment`,
    `${cleanTopic} backlink source route`,
    `${cleanTopic} watch route proof`,
    `${cleanTopic} ${cleanPlatform} source verification`,
    `${cleanCategory} viral first source observatory`,
    `${cleanMarket} ${cleanTopic} visual research`,
    `${host} viral source verification`,
    `breaking ${cleanTopic} 3D evidence map`
  ]))
}

async function readJson(file, fallback){
  try {
    return JSON.parse(await readFile(file, "utf8"))
  } catch {
    return fallback
  }
}

function buildPacket(input, standby){
  const slug = slugFor(input.topic)
  const keywords = keywordSet(input)
  const metrics = standby.lastKnownMetrics || {}
  const proof = standby.seoProof || {}
  const readyAlerts = standby.readyAlerts?.alerts || []
  const glbReady = readyAlerts.find((item) => item.id === "glb-proof-winner")?.level === "ready"
  const proofReady = readyAlerts.find((item) => item.id === "proof-depth-ready")?.level === "ready"
  const deployReady = readyAlerts.find((item) => item.id === "product-marker-gate")?.level === "ready"
  return {
    generatedAt,
    mode: "DigitalHut Viral First-Source System Capability",
    frontendLock: "No live observatory UI changes. This packet prepares backend SEO analytics, source proof, GLB proof, podcast/source moments, and compare/refine movement.",
    input,
    slug,
    stackFlow: [
      {layer: "FireCuda", status: "ready", action: `Stage "${input.topic}" with first-source, international, backlink, category, and creator/research phrase variants.`},
      {layer: "SEO Master List", status: "ready", action: `Queue ${keywords.length} long-tail phrases for proof-route evaluation before publishing new pages.`},
      {layer: "Supabase", status: "ready", action: "Measure source opens, watch opens, search intent, autoplay, GLB plays, podcast starts, backlink opens, and proof route use."},
      {layer: "Google Cloud", status: "ready", action: "Use YouTube metadata, allowed transcripts/user-provided transcripts, Speech/TTS readiness, and quota-safe discovery for the content read."},
      {layer: "Vercel", status: deployReady ? "ready" : "watch", action: deployReady ? "Deploy only after a stable batch needs this packet public." : "Hold deploy until product markers and proof routes justify it."},
      {layer: "Compare & Contrast", status: "ready", action: "Compare the viral packet against last-known GLB, podcast, search, blog, watch, source, and market behavior."}
    ],
    keywords,
    eventSignals: [
      {event: "viral_source_packet_ready", purpose: "System capability exists and can be attached to the next backend SEO analysis cycle."},
      {event: "viral_source_route_open", purpose: "Visitor opens the first-source route."},
      {event: "viral_source_backlink_open", purpose: "Visitor opens a related backlink/source reference."},
      {event: "viral_glb_proof_play", purpose: "Visitor plays the topic-linked 3D proof view."},
      {event: "viral_podcast_source_start", purpose: "Visitor starts the related podcast/source moment."},
      {event: "viral_watch_route_open", purpose: "Visitor opens the crawlable watch proof route."}
    ],
    proofGates: [
      {gate: "source", status: input.source && input.source !== defaults.source ? "ready" : "watch", action: "Attach a verified source URL before calling this a first-source feed."},
      {gate: "glb", status: glbReady ? "ready" : "watch", action: "Use the GLB renderer as topic proof only when the model/source matches the topic."},
      {gate: "podcast", status: (metrics.podcastInterrupts || 0) > 0 ? "ready" : "watch", action: "Use podcast/source moment as support, not as a fake video replacement."},
      {gate: "seo-proof", status: proofReady ? "ready" : "watch", action: "Promote to blog/watch/sitemap only when the angle is useful and not filler."},
      {gate: "deploy", status: deployReady ? "ready" : "watch", action: "Deploy only as part of a stable backend SEO/proof batch."}
    ],
    compareSignals: [
      {signal: "search", lastKnown: metrics.searchInteractions ?? 0, read: "If search stays quiet, use source/watch/backlink behavior to validate the topic first."},
      {signal: "glb", lastKnown: metrics.glbPreviewPlays ?? 0, read: "GLB is the credibility winner; attach it to the topic only when it adds research value."},
      {signal: "podcast", lastKnown: metrics.podcastInterrupts ?? 0, read: "Podcast/source moment should support the viral topic and return users to the video story."},
      {signal: "blog", lastKnown: metrics.blogViews ?? 0, read: "Blog proof should display the system thinking after behavior proves the topic has value."},
      {signal: "sitemap", lastKnown: proof.sitemapUrls ?? 0, read: "Crawlable depth is ready; avoid adding new routes until the topic earns a public proof angle."}
    ],
    readyAlert: {
      id: "viral-first-source-packet-latest",
      level: "ready",
      lane: "New Viral Video",
      trigger: input.topic,
      read: `Backend packet generated for ${input.platform}/${input.category}; ${keywords.length} keywords, ${6} event signals, and ${5} proof gates staged.`,
      nextAction: "Use this system capability during backend SEO analysis, then promote only the phrases that earn source/watch/GLB/podcast/backlink behavior."
    }
  }
}

function markdownFor(packet){
  return `# DigitalHut Viral First-Source System Capability

Generated: ${packet.generatedAt}

Topic: ${packet.input.topic}

Category: ${packet.input.category}

Platform: ${packet.input.platform}

Source: ${packet.input.source}

Frontend lock: ${packet.frontendLock}

## Stack Flow

${packet.stackFlow.map((item) => `- **${item.layer}** (${item.status}): ${item.action}`).join("\n")}

## Keyword Packet

${packet.keywords.map((item) => `- ${item}`).join("\n")}

## Supabase Event Signals

${packet.eventSignals.map((item) => `- **${item.event}**: ${item.purpose}`).join("\n")}

## Proof Gates

${packet.proofGates.map((item) => `- **${item.gate}** (${item.status}): ${item.action}`).join("\n")}

## Compare Signals

${packet.compareSignals.map((item) => `- **${item.signal}** (${item.lastKnown}): ${item.read}`).join("\n")}

## Ready Alert

**${packet.readyAlert.lane}** (${packet.readyAlert.level.toUpperCase()}): ${packet.readyAlert.read}

Next: ${packet.readyAlert.nextAction}
`
}

async function main(){
  await mkdir(docsDir, {recursive: true})
  await mkdir(publicDir, {recursive: true})
  const input = parseArgs(process.argv.slice(2))
  const standby = await readJson(path.join(publicDir, "digitalhut-standby-status.json"), {})
  const packet = buildPacket(input, standby)
  await writeFile(path.join(publicDir, "digitalhut-viral-source-packet.json"), `${JSON.stringify(packet, null, 2)}\n`, "utf8")
  await writeFile(path.join(docsDir, "digitalhut-viral-source-packet.md"), markdownFor(packet), "utf8")
  console.log(JSON.stringify({
    generatedAt: packet.generatedAt,
    topic: packet.input.topic,
    keywords: packet.keywords.length,
    eventSignals: packet.eventSignals.length,
    proofGates: packet.proofGates.length,
    frontendLocked: true
  }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
