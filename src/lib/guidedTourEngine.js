const DEFAULT_CATEGORY = "Continent"

export const guideStages = [
  {
    id: "establish",
    label: "Establish Scene",
    verb: "frame",
    focus: "Identify what the user is looking at, why it matters, and which category lens is active."
  },
  {
    id: "inspect",
    label: "Inspect Model",
    verb: "inspect",
    focus: "Read shape, layout, scale, material, access points, and useful visual clues."
  },
  {
    id: "orbit",
    label: "Camera Pass",
    verb: "orbit",
    focus: "Move around the asset with deliberate angle changes and call out what each angle reveals."
  },
  {
    id: "category",
    label: "Category Analysis",
    verb: "analyze",
    focus: "Apply the selected DigitalHut category and explain the scene through that user intent."
  },
  {
    id: "data",
    label: "Data Layer",
    verb: "connect",
    focus: "Attach provider data, market symbols, terrain context, metadata, and confidence."
  },
  {
    id: "compare",
    label: "Related Asset",
    verb: "compare",
    focus: "Choose the next similar model or feed card and explain why it should follow."
  },
  {
    id: "conclude",
    label: "Decision Brief",
    verb: "brief",
    focus: "Summarize the finding, next action, and premium value path."
  }
]

export const categoryProfiles = {
  Continent: {
    user: "traveler, student, researcher, public explorer",
    inspection: "terrain, coastlines, streets, landmarks, route logic, culture, and regional contrast",
    data: "maps, terrain, related cities, weather-risk notes, public landmarks, and travel context",
    premium: "guided route planning, regional comparison, saved observatory collections, and voice walkthroughs",
    next: "move to a nearby landmark, terrain model, city model, or cultural scene"
  },
  Planetary: {
    user: "space learner, science researcher, classroom, mission planner",
    inspection: "scale, orbit, surface texture, lighting, mission targets, and research uncertainty",
    data: "Cesium terrain, NASA-style context, orbital notes, surface hazards, and mission glossary",
    premium: "mission-style narration, surface passes, evidence notes, and comparison between bodies",
    next: "move from orbit to surface, then to station, rover, crater, or data visualization"
  },
  Gamer: {
    user: "creator, gamer, designer, developer, prototype tester",
    inspection: "spawn points, paths, sightlines, playable loops, hazards, props, and asset modularity",
    data: "asset metadata, engine fit, performance notes, animation readiness, and world-building tags",
    premium: "playable route breakdown, quest design, asset pack comparison, and creator workspace export",
    next: "move to a character, arena, environment, prop pack, or prototype scene"
  },
  "Real Estate": {
    user: "buyer, builder, agent, investor, household planner",
    inspection: "layout, entry, rooms, circulation, lot context, structure, curb appeal, and renovation signals",
    data: "property-style notes, neighborhood context, housing symbols, comparable model cues, and risk questions",
    premium: "camera walkthrough, value/risk brief, renovation checklist, market context, and downloadable inspection packet",
    next: "move to a comparable home, floor plan, street context, neighborhood model, or market statistics view"
  },
  Workforce: {
    user: "trainer, operator, safety lead, builder, field manager",
    inspection: "workflow zones, access, staging, hazard points, team movement, and operational bottlenecks",
    data: "training notes, safety checklist, sector symbols, procedure tags, and audit history",
    premium: "training narration, hazard walk, procedure export, and team onboarding paths",
    next: "move to a facility, equipment, safety scenario, or workflow diagram"
  },
  "Home Project": {
    user: "homeowner, DIY builder, planner, family buyer",
    inspection: "room layout, furniture, materials, yard flow, repair scope, and project sequence",
    data: "budget notes, shopping symbols, material choices, saved project state, and practical checklist",
    premium: "step-by-step planning, before/after comparison, download access, and project memory",
    next: "move to a room model, material model, garden layout, repair scene, or cost brief"
  },
  Political: {
    user: "citizen, analyst, journalist, public-sector builder",
    inspection: "public access, boundaries, routes, infrastructure, civic services, and community impact",
    data: "maps, public buildings, infrastructure context, district notes, and policy tradeoffs",
    premium: "civic explainer, route comparison, public works brief, and evidence-linked narrative",
    next: "move to a city hall, public square, transport model, district map, or policy data card"
  },
  Programmer: {
    user: "developer, AI agent, builder, systems operator",
    inspection: "provider source, payload shape, runtime state, fallback state, asset route, and UI handoff",
    data: "API health, feed payloads, logs, model source, agent actions, and deployment status",
    premium: "debug narration, integration checklist, API workspace, and reusable client handoff",
    next: "move to provider diagnostics, code route, API payload, agent log, or integration sample"
  },
  Researcher: {
    user: "researcher, student, analyst, AI investigator",
    inspection: "source quality, visual evidence, uncertainty, method, terms, and possible bias",
    data: "metadata, citations, comparable assets, scientific context, archive notes, and confidence labels",
    premium: "evidence review, hypothesis builder, comparison matrix, and saved research notebook",
    next: "move to a source card, related study model, dataset visual, or hypothesis test"
  },
  "Stock Options Market": {
    user: "trader, analyst, investor, market researcher",
    inspection: "symbol context, price structure, sector relation, liquidity, risk, and market regime",
    data: "quotes, profiles, candles, technicals, options context, crypto context, and watchlists",
    premium: "AI market walkthrough, technical scenario tree, risk briefing, and saved watchlist observatory",
    next: "move to a heatmap, candlestick model, related symbol, sector context, or trade scenario card"
  },
  "Social Media Trends": {
    user: "creator, casual visitor, marketer, culture scout",
    inspection: "trend hook, audience, visual style, replay value, timing, and shareability",
    data: "trend category, engagement signal, related topics, creator context, and freshness",
    premium: "trend narration, content planning, collection building, and social discovery workspace",
    next: "move to a related clip, cultural object, creator lane, or trending category"
  }
}

function clean(value, fallback = ""){
  if(value === null || value === undefined) return fallback
  return String(value).replace(/\s+/g, " ").trim() || fallback
}

export function normalizeCategory(value){
  const raw = clean(value, DEFAULT_CATEGORY)
  const direct = Object.keys(categoryProfiles).find((category) => category.toLowerCase() === raw.toLowerCase())
  if(direct) return direct
  const lower = raw.toLowerCase()
  if(lower.includes("real")) return "Real Estate"
  if(lower.includes("home")) return "Home Project"
  if(lower.includes("market") || lower.includes("stock") || lower.includes("crypto")) return "Stock Options Market"
  if(lower.includes("trend") || lower.includes("social")) return "Social Media Trends"
  if(lower.includes("research")) return "Researcher"
  if(lower.includes("program")) return "Programmer"
  return DEFAULT_CATEGORY
}

export function buildGuideSession(input = {}){
  const category = normalizeCategory(input.category)
  const profile = categoryProfiles[category] || categoryProfiles[DEFAULT_CATEGORY]
  const title = clean(input.title, `${category} observatory feed`)
  const mode = clean(input.mode, "regular")
  const status = clean(input.status, "feed-ready")
  const note = clean(input.note, "The renderer has a feed selected and is ready for guided analysis.")
  const providerMix = Array.isArray(input.providerMix) && input.providerMix.length ? input.providerMix : [status]
  const tier = clean(input.tier, mode === "premium" ? "premium" : "guest")

  const stages = guideStages.map((stage, index) => {
    const shared = {id: stage.id, label: stage.label, index, verb: stage.verb, focus: stage.focus}
    if(stage.id === "establish"){
      return {...shared, script: `We are looking at ${title}. The active lens is ${category}, built for a ${profile.user}. The first job is to understand the scene before opening or comparing any raw asset.`}
    }
    if(stage.id === "inspect"){
      return {...shared, script: `Inspect ${profile.inspection}. The guide should name visible structure first, then explain what a user should check with the contained renderer.`}
    }
    if(stage.id === "orbit"){
      return {...shared, script: `Use a controlled camera pass: front read, side read, overhead read, then detail read. Each angle should answer a different question instead of repeating the intro.`}
    }
    if(stage.id === "category"){
      return {...shared, script: `${category} analysis should translate the model into user decisions: who uses it, what matters, what is missing, and what the next inspection should prove.`}
    }
    if(stage.id === "data"){
      return {...shared, script: `Connect the data layer. Provider mix: ${providerMix.join(" / ")}. Current status: ${status}. The guide should separate confirmed data from fallback or visual-only context.`}
    }
    if(stage.id === "compare"){
      return {...shared, script: `Choose the next related asset because it helps compare ${profile.next}. The transition should explain why the next model belongs in the same tour.`}
    }
    return {...shared, script: `Decision brief: summarize the scene, the best next action, and the premium value path: ${profile.premium}. Current note: ${note}`}
  })

  return {category, title, mode, status, tier, note, providerMix, profile, stages}
}

export function stageAt(session, index){
  if(!session?.stages?.length) return null
  const safeIndex = ((index % session.stages.length) + session.stages.length) % session.stages.length
  return session.stages[safeIndex]
}

export function guideQuestion(session, stage){
  const category = session?.category || DEFAULT_CATEGORY
  if(!stage) return `What should DigitalHut inspect next for ${category}?`
  if(stage.id === "inspect") return `What visual evidence proves this ${category} model is useful?`
  if(stage.id === "data") return `Which provider data is confirmed and which part is still fallback?`
  if(stage.id === "compare") return `Which related model should continue the tour and why?`
  return `What is the next best guided-tour step for ${category}?`
}
