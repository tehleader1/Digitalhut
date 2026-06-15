import {vectorMatchScore} from "./assetVectorMath"

const fallbackAssets = [
  {
    id: "environment-best-known-airport",
    name: "Best known airport environment read",
    type: "Generated Airport Environment",
    url: "/models/environments/airport-delay.glb",
    thumbnail: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=80",
    tags: ["airport", "flight", "runway", "terminal", "delay", "weather", "diversion", "travel", "environment"],
    permission: "generated-scene-plan",
    genericDemo: false,
    createdAt: "2026-06-15T09:40:00.000Z",
    views: 820
  },
  {
    id: "environment-orlando-traffic",
    name: "Best known Orlando traffic environment read",
    type: "Generated Orlando Traffic Environment",
    url: "/models/environments/orlando-traffic.glb",
    thumbnail: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=900&q=80",
    tags: ["orlando", "florida", "traffic", "theme", "park", "hotel", "road", "congestion", "tourist", "environment"],
    permission: "generated-scene-plan",
    genericDemo: false,
    createdAt: "2026-06-15T09:38:00.000Z",
    views: 760
  },
  {
    id: "environment-south-america-research",
    name: "Best known South American research environment read",
    type: "Generated Science Environment",
    url: "/models/environments/science-voyage.glb",
    thumbnail: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=80",
    tags: ["south", "america", "science", "experiment", "research", "environment", "monitoring", "public", "health", "data"],
    permission: "generated-scene-plan",
    genericDemo: false,
    createdAt: "2026-06-15T09:36:00.000Z",
    views: 610
  },
  {
    id: "environment-food-market",
    name: "Local food market environment read",
    type: "Generated Market Environment",
    url: "/models/environments/continent-city.glb",
    thumbnail: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=900&q=80",
    tags: ["food", "market", "local", "tourist", "travel", "japan", "public", "environment"],
    permission: "generated-scene-plan",
    genericDemo: false,
    createdAt: "2026-06-15T09:34:00.000Z",
    views: 540
  },
  {
    id: "asset-road-grid",
    name: "Generated city road congestion scene",
    type: "Generated Traffic Scene",
    url: "/models/environments/orlando-traffic.glb",
    thumbnail: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=900&q=80",
    tags: ["traffic", "road", "city", "congestion", "travel"],
    permission: "generated-scene-plan",
    genericDemo: false,
    createdAt: "2026-06-15T08:00:00.000Z",
    views: 420
  },
  {
    id: "generated-indore-airport-storm-scene",
    name: "Generated Indore airport storm diversion scene",
    type: "Generated Airport Scene",
    url: "/models/environments/airport-delay.glb",
    thumbnail: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=80",
    tags: ["indore", "india", "airport", "storm", "weather", "flight", "diversion", "visibility", "runway", "terminal", "travel", "delay"],
    permission: "generated-scene-plan",
    genericDemo: false,
    createdAt: "2026-06-15T09:00:00.000Z",
    views: 600
  },
  {
    id: "asset-weather-zone",
    name: "Generated weather disruption zone",
    type: "Generated Weather Scene",
    url: "/models/environments/airport-delay.glb",
    thumbnail: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    tags: ["weather", "storm", "travel", "safety", "airport"],
    permission: "generated-scene-plan",
    genericDemo: false,
    createdAt: "2026-06-15T07:15:00.000Z",
    views: 388
  },
  {
    id: "asset-workforce-project",
    name: "Generated workforce project site",
    type: "Generated Workforce Scene",
    url: "/models/environments/workforce-site.glb",
    thumbnail: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80",
    tags: ["construction", "workforce", "public works", "project", "delay"],
    permission: "generated-scene-plan",
    genericDemo: false,
    createdAt: "2026-06-14T19:30:00.000Z",
    views: 210
  },
  {
    id: "asset-research-lab",
    name: "Generated research lab evidence scene",
    type: "Generated Research Scene",
    url: "/models/environments/research-lab.glb",
    thumbnail: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=80",
    tags: ["science", "research", "project", "verification", "lab"],
    permission: "generated-scene-plan",
    genericDemo: false,
    createdAt: "2026-06-13T16:20:00.000Z",
    views: 165
  },
  {
    id: "firecuda-museum-ice-cream-singapore",
    name: "FireCuda library - Museum of Ice Cream Singapore welcome environment",
    type: "Personal GLB Library",
    url: "/models/firecuda-library/museum_of_ice_cream_singapore_-_welcome.glb",
    thumbnail: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=900&q=80",
    tags: ["singapore", "museum", "mainstream", "continent", "business", "real estate", "tourism", "indoor environment"],
    permission: "owner-personal-library",
    genericDemo: false,
    createdAt: "2026-06-15T20:17:56.000Z",
    views: 1
  },
  {
    id: "firecuda-international-space-elevator",
    name: "FireCuda library - International space elevator",
    type: "Personal GLB Library",
    url: "/models/firecuda-library/international_space_elevator.glb",
    thumbnail: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=900&q=80",
    tags: ["space", "planetary", "science", "engineering", "research", "international", "observatory"],
    permission: "owner-personal-library",
    genericDemo: false,
    createdAt: "2026-06-15T20:17:56.000Z",
    views: 1
  },
  {
    id: "firecuda-glaceon-christmas",
    name: "FireCuda library - Glaceon's Christmas Miracle scene",
    type: "Personal GLB Library",
    url: "/models/firecuda-library/glaceons_christmas_miracle.glb",
    thumbnail: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=900&q=80",
    tags: ["gaming", "viral", "mainstream", "winter", "character scene", "presentation"],
    permission: "owner-personal-library",
    genericDemo: false,
    createdAt: "2026-06-15T20:17:56.000Z",
    views: 1
  },
  {
    id: "firecuda-transformers-bumblebee",
    name: "FireCuda library - Transformers Prime game Bumblebee",
    type: "Personal GLB Library",
    url: "/models/firecuda-library/transformers_prime_game_bumblebee.glb",
    thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80",
    tags: ["gaming", "viral", "mainstream", "game model", "robot", "character scene"],
    permission: "owner-personal-library",
    genericDemo: false,
    createdAt: "2026-06-15T20:17:56.000Z",
    views: 1
  }
]

export const discoveryTabs = [
  "Morning Live Report",
  "Suggested Today",
  "High Priority",
  "International Incidents",
  "Researcher Science",
  "Tourist Alerts",
  "Weather",
  "Traffic",
  "Scams",
  "Overpromising Websites",
  "Scientific/Workforce",
  "Local",
  "Selected for Render",
  "Published",
  "Archived"
]

export const discoveryCategories = [
  "international real-world incidents",
  "researcher science data problems",
  "public health scenarios",
  "environmental monitoring issues",
  "tourist alerts",
  "weather disruptions",
  "traffic congestion",
  "accidents",
  "airport delays",
  "sailing/boating issues",
  "scam complaints",
  "website/service complaints",
  "construction delays",
  "workforce projects",
  "scientific projects",
  "animal migration/access blocks",
  "dangerous weather patterns",
  "regional/global travel concerns",
  "local public safety patterns"
]

export function readRecentAssets(){
  if(typeof window === "undefined") return fallbackAssets
  try {
    const stored = JSON.parse(window.localStorage.getItem("digitalhut:assetLab") || "[]")
    const mapped = Array.isArray(stored) ? stored.map((item) => ({
      id: item.id || item.slug,
      name: item.name,
      type: item.type || item.sourceType || "GLB",
      url: item.convertedUrl || item.optimizedGlbUrl || item.convertedGlbUrl || item.url,
      thumbnail: item.thumbnailUrl || item.oldFileUrl || item.originalFileUrl || "",
      tags: [item.type, item.sourceType, item.source, item.description].filter(Boolean).join(" ").toLowerCase().split(/\W+/).filter(Boolean),
      permission: item.visibility || "private-owner",
      createdAt: item.createdAt || new Date().toISOString(),
      views: item.views || item.likes || 0
    })).filter((item) => item.url) : []
    return mapped.length ? [...mapped, ...fallbackAssets] : fallbackAssets
  } catch {
    return fallbackAssets
  }
}

export function createDailyCandidates(date = new Date()){
  const stamp = date.toISOString().slice(0, 10)
  return [
    {
      id: `daily-morning-indore-airport-storm-${stamp}`,
      title: "Morning International Report: Indore Airport Storm Diversion",
      problem: "A severe storm and poor visibility forced a passenger flight diversion at Indore airport, creating a travel-safety and airport-delay situation that needs a clear visual explanation.",
      location: "Indore, India",
      category: "International Incidents",
      whyItMatters: "International travel reports become more useful when DigitalHut can show the airport, storm layer, visibility problem, diverted flight path, and passenger decision points in 3D.",
      sourceNotes: ["Current source: Times of India report on severe storm and poor visibility at Indore airport", "Verification lane: airport notices, airline status, weather radar, local public safety updates"],
      confidence: 84,
      renderIdea: "Airport terminal block, runway visibility layer, storm cell, diverted flight arrow, ground transport delay markers, traveler safety notes.",
      glbSceneType: "airport-storm-diversion-live-report",
      solutions: ["Check airline status before leaving", "Track local weather and airport notices", "Delay pickup until flight path is stable", "Keep alternate route and hotel timing ready"],
      voiceDraft: "Open 3D model view. This morning international report shows an airport storm diversion in Indore. I am highlighting the runway visibility issue, the diverted flight path, and what travelers should verify before moving.",
      status: "Suggested Today",
      priority: "High Priority",
      tags: ["morning", "international", "airport", "storm", "weather", "flight", "diversion", "visibility", "travel", "delay"]
    },
    {
      id: `daily-orlando-traffic-${stamp}`,
      title: "5 PM Orlando Theme Park Exit Congestion",
      problem: "After-work traffic and tourist traffic are overlapping near major hotel, park entrance, and shuttle routes.",
      location: "Orlando, Florida",
      category: "Traffic",
      whyItMatters: "Family travel reports are stronger when traffic pressure, hotel movement, and tourism timing can be visualized in 3D.",
      sourceNotes: ["Live provider lane: traffic APIs, tourism alerts, local public safety notes", "Needs verification before publish"],
      confidence: 82,
      renderIdea: "Road grid, cars, hotel blocks, park entrance, congestion heat zone, alternate route arrows.",
      glbSceneType: "road-grid-congestion",
      solutions: ["Leave earlier", "Use alternate entrance", "Check live route before departure"],
      voiceDraft: "Open 3D model view. This report shows Orlando theme park exit congestion around 5 PM. I am highlighting the hotel blocks, route pressure, and safer alternate movement.",
      status: "Suggested Today",
      priority: "High Priority",
      tags: ["orlando", "traffic", "tourist", "hotel", "road", "congestion", "travel"]
    },
    {
      id: `daily-airport-weather-${stamp}`,
      title: "Airport Delay Risk From Afternoon Storm Cells",
      problem: "Afternoon weather can stack delays across departures, ground transport, and hotel check-ins.",
      location: "Southeast travel corridor",
      category: "Weather",
      whyItMatters: "Travelers need a quick visual of weather disruption zones before committing to airport or hotel timing.",
      sourceNotes: ["Live provider lane: weather APIs, airport delay feeds, travel advisories"],
      confidence: 74,
      renderIdea: "Airport terminal block, storm layer, delayed aircraft markers, ride-share congestion lane.",
      glbSceneType: "airport-weather-delay",
      solutions: ["Check airline app", "Track storm timing", "Delay ground pickup until gate status is stable"],
      voiceDraft: "Open 3D model view. This report shows how storm timing can delay airport movement and ground transport.",
      status: "Suggested Today",
      priority: "High Priority",
      tags: ["airport", "weather", "storm", "travel", "delay", "safety"]
    },
    {
      id: `daily-scam-complaints-${stamp}`,
      title: "Travel Booking Scam Complaint Pattern",
      problem: "Visitors report confusing booking pages, duplicate listings, and support problems around urgent travel purchases.",
      location: "Regional/global travel concern",
      category: "Scams",
      whyItMatters: "A 3D report can explain the decision path, risk points, and safer verification steps without making it feel like a plain warning.",
      sourceNotes: ["Live provider lane: complaint boards, consumer protection notes, service-status pages"],
      confidence: 68,
      renderIdea: "Website flow model, warning flags, payment checkpoint, verification path.",
      glbSceneType: "digital-service-complaint",
      solutions: ["Verify official domain", "Avoid rushed payment links", "Save screenshots and support case numbers"],
      voiceDraft: "Open 3D model view. This report maps where travel booking confusion can turn into a scam risk.",
      status: "Suggested Today",
      priority: "Needs Verification",
      tags: ["scam", "website", "complaint", "travel", "service", "payment"]
    },
    {
      id: `daily-workforce-project-${stamp}`,
      title: "Construction Delay Around Public Works Zone",
      problem: "A public works zone may slow commuting, deliveries, and nearby business access.",
      location: "Local workforce route",
      category: "Scientific/Workforce",
      whyItMatters: "Workforce reports are useful when drivers, workers, and local businesses can see the project zone in a 3D layout.",
      sourceNotes: ["Live provider lane: DOT feeds, city project pages, workforce notices"],
      confidence: 71,
      renderIdea: "Work zone model, lane closures, equipment markers, business access arrows.",
      glbSceneType: "workforce-project-zone",
      solutions: ["Plan delivery windows", "Mark alternate access points", "Check city project updates"],
      voiceDraft: "Open 3D model view. This report explains a public works zone and where access may slow down.",
      status: "Suggested Today",
      priority: "Local",
      tags: ["construction", "workforce", "project", "road", "delay", "public works"]
    },
    {
      id: `daily-research-public-health-${stamp}`,
      title: "Public Health Contact Tracing Data Gap",
      problem: "A disease-monitoring situation can become dangerous when case counts, contact tracing, local movement, and public trust do not line up fast enough for responders.",
      location: "International public health watch",
      category: "Researcher Science",
      whyItMatters: "Researcher reports can turn confusing outbreak data into a practical 3D view of case zones, movement paths, testing gaps, and safer response steps.",
      sourceNotes: ["Verification lane: WHO, national health ministry, Africa CDC, CDC, local public health bulletins", "Publish only after Anthony checks current source links and dates"],
      confidence: 76,
      renderIdea: "Regional map blocks, case clusters, contact-tracing rings, clinic markers, movement arrows, supply shortage flags.",
      glbSceneType: "public-health-data-gap",
      solutions: ["Verify official health authority updates", "Track dates and case definitions", "Separate confirmed data from suspected data", "Show uncertainty clearly"],
      voiceDraft: "Open 3D model view. This researcher report shows a public health data gap where case clusters, movement paths, and response timing need careful verification.",
      status: "Suggested Today",
      priority: "Needs Verification",
      tags: ["science", "public", "health", "outbreak", "data", "research", "verification", "contact", "tracing"]
    },
    {
      id: `daily-research-weather-pattern-${stamp}`,
      title: "Dangerous Weather Pattern Data Conflict",
      problem: "Forecast models, local alerts, road impacts, and public behavior can disagree during rapidly changing weather.",
      location: "Regional weather watch",
      category: "Researcher Science",
      whyItMatters: "A 3D report can help people see the difference between forecast risk, observed impacts, evacuation timing, and transportation disruption.",
      sourceNotes: ["Verification lane: NOAA/NWS, local emergency management, airport delay feeds, road closure feeds", "Use timestamps because weather data changes fast"],
      confidence: 73,
      renderIdea: "Storm bands, flood-prone roads, airport delay markers, shelter nodes, route arrows, uncertainty layer.",
      glbSceneType: "weather-data-conflict",
      solutions: ["Compare forecast time with observed reports", "Check official alerts", "Avoid routes under active warnings", "Publish uncertainty layer"],
      voiceDraft: "Open 3D model view. This researcher report compares forecast risk, observed disruption, and safer route decisions during a dangerous weather pattern.",
      status: "Suggested Today",
      priority: "High Priority",
      tags: ["science", "weather", "forecast", "data", "storm", "flood", "airport", "road", "risk"]
    },
    {
      id: `daily-research-environment-monitoring-${stamp}`,
      title: "Environmental Monitoring Blind Spot",
      problem: "Air quality, water quality, wildfire smoke, algal bloom, or pollution data can be hard to interpret when sensors, maps, and public reports disagree.",
      location: "Environmental monitoring watch",
      category: "Researcher Science",
      whyItMatters: "Researcher mode can make invisible environmental risk visible by showing sensor points, affected areas, uncertainty, and public guidance.",
      sourceNotes: ["Verification lane: EPA, NASA Earth data, NOAA, local environmental agencies, public sensor networks", "Label sensor data as preliminary when needed"],
      confidence: 69,
      renderIdea: "Sensor grid, plume or water zone, affected neighborhoods, confidence rings, safety-note panels.",
      glbSceneType: "environmental-monitoring-blind-spot",
      solutions: ["Check official sensor networks", "Compare satellite and ground observations", "Warn users when data is preliminary", "Show affected area boundaries"],
      voiceDraft: "Open 3D model view. This researcher report visualizes an environmental monitoring blind spot and explains what data is confirmed versus uncertain.",
      status: "Suggested Today",
      priority: "Needs Verification",
      tags: ["science", "environment", "monitoring", "sensor", "air", "water", "wildfire", "smoke", "pollution"]
    },
    {
      id: `daily-overpromising-website-${stamp}`,
      title: "Overpromising Website Service Complaint Pattern",
      problem: "A website or service may promise fast travel help, emergency booking, repair support, or refund handling while user complaints suggest delays or confusing support.",
      location: "International consumer web watch",
      category: "Overpromising Websites",
      whyItMatters: "DigitalHut can turn complaint patterns into a visual decision map that helps users avoid rushed payments and misleading promises.",
      sourceNotes: ["Verification lane: consumer complaint boards, official regulator notices, service status pages, archived screenshots", "Avoid naming a company until sources are verified"],
      confidence: 64,
      renderIdea: "Website promise funnel, payment checkpoint, support-delay branch, safer verification route, evidence cards.",
      glbSceneType: "overpromising-website-risk-map",
      solutions: ["Verify official domain", "Check recent complaints", "Avoid urgency-only payment pages", "Save receipts and screenshots"],
      voiceDraft: "Open 3D model view. This report maps an overpromising website pattern and shows where users should pause before payment.",
      status: "Suggested Today",
      priority: "Needs Verification",
      tags: ["website", "service", "complaint", "scam", "overpromising", "payment", "support", "consumer"]
    }
  ]
}

function scoreAsset(candidate, asset){
  const vectorScore = Math.round(vectorMatchScore(candidate, asset) * 100)
  const assetWords = new Set([...(asset.tags || []), asset.name, asset.type].join(" ").toLowerCase().split(/\W+/).filter(Boolean))
  let boost = 0
  if(candidate.glbSceneType.includes("airport") && assetWords.has("airport")) boost += 16
  if(candidate.location.toLowerCase().includes("indore") && assetWords.has("indore")) boost += 12
  return Math.min(99, vectorScore + boost)
}

export function attachBestAsset(candidate, assets = readRecentAssets()){
  const ranked = assets.map((asset) => ({asset, score: scoreAsset(candidate, asset)})).sort((a, b) => b.score - a.score)
  const best = ranked[0]
  if(!best || best.score < 18 || best.asset.genericDemo){
    return {
      ...candidate,
      assetMatchStatus: "Environment read ready",
      relatedAsset: {
        closestGlb: `Generated ${candidate.glbSceneType} environment read`,
        assetId: `generated-${candidate.id}`,
        fileType: "Generated Environment Scene",
        previewThumbnail: "",
        matchConfidence: 0,
        reasonMatched: best?.asset?.genericDemo ? "A sample demo GLB was blocked. DigitalHut will render a situation-specific environment instead of showing a robot, astronaut, or generic character." : "No perfect uploaded environment GLB was found yet, so DigitalHut is rendering the best-known generated environment for this situation.",
        freshness: "generated environment now",
        url: ""
      }
    }
  }
  return {
    ...candidate,
    assetMatchStatus: best.asset.url ? "Preview ready" : "Environment read ready",
    relatedAsset: {
      closestGlb: best.asset.name,
      assetId: best.asset.id,
      fileType: best.asset.type,
      previewThumbnail: best.asset.thumbnail,
      matchConfidence: best.score,
      reasonMatched: best.asset.type?.toLowerCase().includes("generated") ? "No verified airport GLB was found in uploads/APIs, so DigitalHut generated an environment-specific airport storm scene plan." : "Matched by category, scenario tags, file type, freshness, and permission.",
      freshness: best.asset.createdAt,
      url: best.asset.url
    }
  }
}

export function createDiscoveryQueue(){
  const assets = readRecentAssets()
  return createDailyCandidates().map((candidate) => attachBestAsset(candidate, assets))
}
