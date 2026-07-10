import {mkdir, readFile, writeFile} from "node:fs/promises"
import path from "node:path"
import {fileURLToPath} from "node:url"
import {seoBlogPosts, seoRunnerProofPosts} from "../src/lib/seoContentEngine.js"

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const distDir = path.join(repoRoot, "dist")
const manifestPath = path.join(repoRoot, "public", "digitalhut-route-metadata-manifest.json")
const coveragePath = path.join(repoRoot, "public", "digitalhut-master-keyword-coverage.json")
const indexPath = path.join(distDir, "index.html")
const domain = "https://www.digitalhut.app"

function escapeHtml(value = ""){
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function stripTags(value = ""){
  return String(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}

function slugify(value = ""){
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function routeToDistIndex(route){
  const cleanRoute = route.replace(/^\/+|\/+$/g, "")
  return path.join(distDir, cleanRoute, "index.html")
}

function replaceOrInsertMeta(headHtml, selector, tagHtml){
  const [kind, name] = selector
  const pattern = kind === "property"
    ? new RegExp(`<meta\\s+property=["']${name}["'][^>]*>`, "i")
    : new RegExp(`<meta\\s+name=["']${name}["'][^>]*>`, "i")
  if(pattern.test(headHtml)) return headHtml.replace(pattern, tagHtml)
  return headHtml.replace("</head>", `    ${tagHtml}\n  </head>`)
}

function buildShell(baseHtml, route){
  const title = escapeHtml(route.title || "DigitalHut Observatory Proof")
  const description = escapeHtml(stripTags(route.description || route.proofAngle || "DigitalHut proof route for video watching, 3D Model View, podcast/source moments, live analytics, GLB rendering, and source-backed observatory search."))
  const canonical = escapeHtml(route.canonical || `${domain}${route.route}`)
  const keywords = escapeHtml((route.keywords || []).slice(0, 18).join(", "))
  const routeTrail = [
    "/system-proof",
    "/master-keyword-coverage",
    `/source-bridge?route=${encodeURIComponent(route.route)}&source=crawl-shell`
  ]
  const relatedLinks = [...new Set([...(route.relatedRoutes || []), ...routeTrail])]
    .slice(0, 8)
    .map((related) => `<a href="${escapeHtml(related)}">${escapeHtml(related)}</a>`)
    .join(" ")
  const proofText = [
    route.launchLane,
    route.demandClass,
    route.proofAngle,
    ...(route.keywords || []).slice(0, 10)
  ].filter(Boolean).join(" | ")
  const crawlProof = `<main class="dh-crawl-proof" data-digitalhut-route="${escapeHtml(route.route)}">
      <h1>${title}</h1>
      <p>${description}</p>
      <p>${escapeHtml(proofText)}</p>
      <nav>${relatedLinks}</nav>
    </main>`
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: stripTags(route.title || "DigitalHut Observatory Proof"),
    description: stripTags(route.description || route.proofAngle || ""),
    url: route.canonical || `${domain}${route.route}`,
    isPartOf: {
      "@type": "WebSite",
      name: "DigitalHut",
      url: domain
    },
    keywords: (route.keywords || []).slice(0, 18)
  }

  let html = baseHtml
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`)
  html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${canonical}" />`)
  html = replaceOrInsertMeta(html, ["name", "description"], `<meta name="description" content="${description}" />`)
  html = replaceOrInsertMeta(html, ["name", "keywords"], `<meta name="keywords" content="${keywords}" />`)
  html = replaceOrInsertMeta(html, ["property", "og:title"], `<meta property="og:title" content="${title}" />`)
  html = replaceOrInsertMeta(html, ["property", "og:description"], `<meta property="og:description" content="${description}" />`)
  html = replaceOrInsertMeta(html, ["property", "og:url"], `<meta property="og:url" content="${canonical}" />`)
  html = html.replace("</head>", `    <script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>\n  </head>`)
  html = html.replace(/<div id=["']root["']><\/div>/i, `<div id="root">${crawlProof}</div>`)
  return html
}

async function readJson(filePath, fallback){
  try {
    return JSON.parse(await readFile(filePath, "utf8"))
  } catch {
    return fallback
  }
}

async function main(){
  const baseHtml = await readFile(indexPath, "utf8")
  const manifest = await readJson(manifestPath, {routes: []})
  const coverage = await readJson(coveragePath, {lanes: []})
  const introZones = await readJson(path.join(repoRoot, "public", "digitalhut-intro-entertainment-zones.json"), {zones: []})
  const postRoutes = []
  const seenPostSlugs = new Set()
  for(const post of [...seoRunnerProofPosts, ...seoBlogPosts]){
    const slug = post.slug || post.id
    if(!slug || seenPostSlugs.has(slug)) continue
    seenPostSlugs.add(slug)
    const category = post.category || "DigitalHut"
    const keywords = post.keywords || []
    const description = post.description || post.proofFocus || `${post.title || slug} proof route for DigitalHut.`
    postRoutes.push(
      {
        route: `/blog/${slug}`,
        type: "blog-proof",
        canonical: `${domain}/blog/${slug}`,
        title: `${post.title || slug}: DigitalHut Proof`,
        description,
        keywords,
        launchLane: category,
        demandClass: post.featuredSlot || "blog proof",
        proofAngle: post.proofFocus || description,
        relatedRoutes: [`/watch/${slug}`, `/category/${slugify(category)}`, "/system-proof", "/master-keyword-coverage"]
      },
      {
        route: post.watchPageRoute || `/watch/${slug}`,
        type: "watch-proof",
        canonical: `${domain}${post.watchPageRoute || `/watch/${slug}`}`,
        title: `${post.title || slug}: DigitalHut Watch Proof`,
        description,
        keywords,
        launchLane: category,
        demandClass: post.featuredSlot || "watch proof",
        proofAngle: post.proofFocus || description,
        relatedRoutes: [`/blog/${slug}`, `/category/${slugify(category)}`, "/system-proof", "/master-keyword-coverage"]
      }
    )
  }
  const extraRoutes = [
    {
      route: "/system-proof",
      type: "system-proof",
      canonical: `${domain}/system-proof`,
      title: "DigitalHut System Proof: 2026 Dapp Entertainment Observatory",
      description: "DigitalHut system proof for video watching, 3D Model View, podcast/source moments, live analytics, GLB rendering, Supabase metrics, Google crawl proof, Vercel deployment, and FireCuda SEO mapping.",
      keywords: ["DigitalHut system proof", "2026 dapp entertainment observatory", "3D Model View", "podcast source moments", "live analytics"],
      proofAngle: "full stack proof route connecting frontend behavior, backend APIs, sitemap rows, Search Console state, Supabase metrics, and GLB/podcast/source features",
      relatedRoutes: ["/", "/master-keyword-coverage", "/watch/full-view-episode-alternative", "/blog"]
    },
    {
      route: "/master-keyword-coverage",
      type: "master-keyword-coverage",
      canonical: `${domain}/master-keyword-coverage`,
      title: "DigitalHut Master Keyword Coverage: 200,572,944 Search-Route Variations",
      description: "DigitalHut master keyword coverage maps 200,572,944 internal longtail search-route variations into crawlable watch, blog, category, source, GLB, podcast, and analytics proof lanes.",
      keywords: ["DigitalHut master keyword coverage", "200572944 longtail search route variations", "full entertainment dapp alternative", "3D model view search", "video podcast analytics observatory"],
      proofAngle: "FireCuda-sized keyword universe represented through proof routes, 50,000 sitemap rows, and measured Search Console/Supabase behavior",
      relatedRoutes: ["/system-proof", "/watch/full-view-episode-alternative", "/blog/full-view-episode-alternative"]
    },
    {
      route: "/source-bridge",
      type: "human-source-bridge",
      canonical: `${domain}/source-bridge`,
      title: "DigitalHut Source Bridge: Door Events To Proof And Source Actions",
      description: "DigitalHut connects 200M master-list door events to human-readable system proof, source evidence, GLB, podcast, autoplay, search, and Search Console measurement.",
      keywords: ["DigitalHut source bridge", "200M SEO master list proof path", "door event proof source conversion", "entertainment dapp source evidence"],
      proofAngle: "turns real entry and second-action behavior into a measurable proof/source continuation without manufacturing visits or ranking claims",
      relatedRoutes: ["/system-proof", "/master-keyword-coverage", "/digitalhut-proof-source-conversion-bridge.json", "/watch/full-view-episode-alternative"]
    },
    {
      route: "/watch/full-system-capture-post",
      type: "pass-by-discovery-watch-proof",
      canonical: `${domain}/watch/full-system-capture-post`,
      title: "DigitalHut Presents: A 2026 Entertainment Observatory",
      description: "A pass-by discovery proof route for DigitalHut's full entertainment dapp system: subscription preview, Auto Play YouTube statistics, 3D Model View, GLB/podcast feed, zoom/rotate model controls, Next Model, search, AI system reads, podcast/source moments, and live analytics in one non-scrollable interface.",
      keywords: ["2026 entertainment dapp system", "subscription preview entertainment dapp", "Auto Play YouTube statistics", "GLB podcast feed", "interactive zoom rotate 3D Model View", "Next Model GLB renderer", "AI system feature live analytics"],
      launchLane: "DigitalHut Presentation",
      demandClass: "pass-by full-system visibility",
      proofAngle: "measures public-candidate visitors who naturally see the subscription-ready entertainment dapp system and continue into Auto Play, YouTube statistics, GLB/podcast feed, zoom/rotate, Next Model, search, AI system, proof route, or source actions",
      relatedRoutes: ["/blog/full-system-capture-post", "/watch/full-view-episode-alternative", "/system-proof", "/master-keyword-coverage"]
    },
    {
      route: "/blog/full-system-capture-post",
      type: "pass-by-discovery-blog-proof",
      canonical: `${domain}/blog/full-system-capture-post`,
      title: "DigitalHut Pass-By Discovery Track: Entertainment Dapp, 3D Model View, Podcast Feed, And Live Analytics",
      description: "A public proof article for people who naturally see DigitalHut as a 2026 entertainment dapp system while moving through normal video, 3D, podcast, research, subscription preview, and entertainment paths.",
      keywords: ["DigitalHut pass-by discovery track", "2026 entertainment dapp system", "subscription preview entertainment dapp", "YouTube alternative with 3D model view", "Auto Play YouTube statistics", "GLB podcast feed", "live analytics media session"],
      launchLane: "DigitalHut Presentation",
      demandClass: "pass-by full-system visibility",
      proofAngle: "captures whether people who naturally see the full entertainment dapp message continue into subscription preview, Auto Play, GLB/podcast feed, search, AI system, proof, or source behavior without forcing traffic or promoting individual GLB names",
      relatedRoutes: ["/watch/full-system-capture-post", "/watch/full-view-episode-alternative", "/system-proof", "/master-keyword-coverage"]
    },
    ...postRoutes,
    ...(introZones.zones || []).map((zone) => ({
      route: zone.zonePath,
      type: "intro-entertainment-zone",
      canonical: `${domain}${zone.zonePath}`,
      title: `${zone.lane}: DigitalHut Introductory Entertainment Zone`,
      description: zone.introLine,
      keywords: zone.keywords || [],
      launchLane: zone.category,
      demandClass: "200M keyword universe checkpoint",
      proofAngle: zone.promotionRule,
      relatedRoutes: [zone.proofRoute, "/master-keyword-coverage", "/system-proof", "/digitalhut-intro-entertainment-zones.json"]
    })),
    ...(coverage.lanes || []).slice(0, 24).map((lane) => ({
      route: lane.proofRoute,
      type: "master-lane-proof",
      canonical: `${domain}${lane.proofRoute}`,
      title: `${lane.lane}: DigitalHut Full-System Proof`,
      description: `${lane.lane} is mapped into DigitalHut's video watching, 3D Model View, podcast/source moments, live analytics, GLB rendering, and source-backed proof system.`,
      keywords: lane.queryFamilies || [lane.lane],
      launchLane: lane.category || lane.lane,
      demandClass: "master keyword lane",
      proofAngle: `Global rank span ${lane.globalRankStart} to ${lane.globalRankEnd}; variation capacity ${lane.variationCapacity}.`,
      relatedRoutes: ["/master-keyword-coverage", "/system-proof", "/blog"]
    }))
  ].filter((route) => route.route)

  const routes = Array.from(new Map([...extraRoutes, ...(manifest.routes || [])].map((route) => [route.route, route])).values())
  for(const route of routes){
    const target = routeToDistIndex(route.route)
    await mkdir(path.dirname(target), {recursive: true})
    await writeFile(target, buildShell(baseHtml, route), "utf8")
  }

  const receipt = {
    generatedAt: new Date().toISOString(),
    status: "route-crawl-shells-produced",
    routeCount: routes.length,
    sourceManifestRoutes: manifest.routes?.length || 0,
    extraRoutes: extraRoutes.length,
    purpose: "Give crawlers route-specific DigitalHut proof HTML while preserving the same React dapp for users."
  }
  await writeFile(path.join(distDir, "digitalhut-route-crawl-shells.json"), `${JSON.stringify(receipt, null, 2)}\n`, "utf8")
  console.log(JSON.stringify(receipt, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
