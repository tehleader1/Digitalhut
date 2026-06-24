export const seoKeywordClusters = {
  core: ["DigitalHut", "3D observatory", "GLB renderer", "3D assets", "automatic system presentation", "AI Director"],
  categories: ["Mainstream Feed", "Planetary Views", "Researcher Hub", "Gamer Hub", "Programmer Hub", "Real Estate Hub"],
  growth: ["backlinks", "comments", "ratings", "GLB uploads", "asset reviews", "public feed signals"],
  research: ["state of the art research", "3D imagery", "community visualization", "environment scans", "evidence notes"],
  markets: ["untapped markets", "unusual trends", "niche discovery", "renderer opportunities", "creator economy"]
}

export function seoTermsForCategory(category = "Mainstream Streaming"){
  const lower = category.toLowerCase()
  if(lower.includes("planetary") || lower.includes("orbital")) return ["Planetary Views", "orbital compute", "space GLB", "3D observatory", "satellite infrastructure"]
  if(lower.includes("research") || lower.includes("science")) return ["Researcher Hub", "state of the art research", "3D imagery", "evidence notes", "scientific visualization"]
  if(lower.includes("gamer")) return ["Gamer Hub", "game-world GLB", "360 environment", "interactive renderer", "creator-safe feed"]
  if(lower.includes("programmer")) return ["Programmer Hub", "API feed", "backend renderer", "3D system DApp", "developer observatory"]
  if(lower.includes("real estate")) return ["Real Estate Hub", "property GLB", "international housing", "3D walkthrough", "market context"]
  return ["Mainstream Feed", "viral 3D", "automatic system presentation", "GLB preview", "public observatory"]
}

export function seoNarrationLine({category, feed, stageLabel = "Current view"} = {}){
  const terms = seoTermsForCategory(category)
  const title = feed?.title || "this DigitalHut asset"
  const source = feed?.apiSource || feed?.apiStatus || "verified public feed"
  return `${stageLabel}. ${title}. DigitalHut is reading this ${terms[0]} through a ${terms[1]} lane, using the ${terms[2]} signal, ${terms[3]} context, and ${terms[4]} source notes from ${source}.`
}

export function seoBacklinkBrief({category, feed} = {}){
  const terms = seoTermsForCategory(category)
  const title = feed?.title || "DigitalHut GLB"
  return `${title} supports ${terms.join(", ")} with backlinks, comments, ratings, GLB uploads, and AI-readable asset details.`
}

export const seoBlogPosts = [
  {
    slug: "automatic-3d-autoplay-system",
    title: "Automatic 3D Autoplay Systems Are Becoming A New Way To Read Digital Environments",
    category: "Automatic System Presentation",
    description: "How DigitalHut combines AI narration, GLB rendering, public feeds, and staged autoplay into a searchable 3D observatory.",
    keywords: ["automatic 3D autoplay system", "GLB renderer", "AI Director", "3D system DApp", "DigitalHut observatory"]
  },
  {
    slug: "3d-imagery-helping-research-communities",
    title: "How 3D Imagery Helps Research Communities Explain Complex Situations Faster",
    category: "Researcher Hub",
    description: "Researcher workflows improve when field data, source notes, environment scans, and 3D models are viewed together.",
    keywords: ["3D imagery", "Researcher Hub", "state of the art research", "evidence notes", "scientific visualization"]
  },
  {
    slug: "mainstream-feed-to-3d-assets",
    title: "Turning Mainstream Feeds Into 3D Asset Presentations",
    category: "Mainstream Feed",
    description: "DigitalHut can connect viral topics, creator trends, public scenes, and Sketchfab-style environment assets into a presentation feed.",
    keywords: ["Mainstream Feed", "3D assets", "viral 3D", "Sketchfab GLB", "creator economy"]
  },
  {
    slug: "planetary-views-and-orbital-compute",
    title: "Planetary Views, Orbital Compute, And The Future Of Observatory Interfaces",
    category: "Planetary Views",
    description: "Orbital infrastructure, free-space links, planetary models, and GLB scenes can help people understand space technology visually.",
    keywords: ["Planetary Views", "orbital compute", "space GLB", "satellite infrastructure", "3D observatory"]
  },
  {
    slug: "gamer-programmer-renderer-hubs",
    title: "Gamer Hub And Programmer Hub: Why Interactive GLB Feeds Need Better Backend Detail",
    category: "Gamer Hub / Programmer Hub",
    description: "Game environments and developer systems both need better asset metadata, renderer testing, backlinks, ratings, and API source checks.",
    keywords: ["Gamer Hub", "Programmer Hub", "interactive renderer", "API feed", "GLB uploads"]
  }
]

export const seoTrendSignals = [
  "unusual GLB rendering niches",
  "untapped markets between public feeds and 3D environments",
  "creator-safe 360 game-world assets",
  "research visualization demand for field and science data",
  "international real estate walkthrough opportunities",
  "orbital compute and satellite infrastructure explainers",
  "community ratings for useful 3D asset presentations"
]
