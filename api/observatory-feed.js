const environmentPools = {
  "Mainstream Streaming": ["mainstream-feed.glb", "undersea-media.glb", "continent-city.glb"],
  Mobility: ["orlando-traffic.glb", "airport-delay.glb", "public-works.glb"],
  Planetary: ["planetary-hub.glb", "science-voyage.glb", "continent-city.glb"],
  "Real Estate": ["real-estate-island.glb", "business-district.glb", "continent-city.glb"],
  Science: ["science-voyage.glb", "research-lab.glb", "planetary-hub.glb"],
  Researcher: ["research-lab.glb", "science-voyage.glb", "history-district.glb"],
  Continent: ["continent-city.glb", "history-district.glb", "science-voyage.glb"],
  Gamer: ["gaming-world.glb", "mainstream-feed.glb", "presentation-stage.glb"],
  Workforce: ["workforce-site.glb", "public-works.glb", "airport-delay.glb"],
  Businesses: ["business-district.glb", "presentation-stage.glb", "public-works.glb"],
  History: ["history-district.glb", "continent-city.glb", "public-works.glb"],
  Programmer: ["business-district.glb", "research-lab.glb", "presentation-stage.glb"],
  Political: ["public-works.glb", "business-district.glb", "continent-city.glb"],
  "DigitalHut Presentation": ["presentation-stage.glb", "mainstream-feed.glb", "business-district.glb"]
}

export default function handler(req, res){
  const category = String(req.query?.category || "Mainstream Streaming")
  const query = String(req.query?.query || category).replace(/\s+/g, " ").trim().slice(0, 160)
  const pool = environmentPools[category] || environmentPools["Mainstream Streaming"]
  const assets = pool.map((file, index) => ({
    id: `digitalhut-environment-${category}-${index}`,
    title: `${query} environment ${index + 1}`,
    description: `DigitalHut environment-first renderer match for ${category}: structure, mapping, terrain, routes, facilities, and surrounding context.`,
    modelUrl: `/models/environments/${file}`,
    viewerUrl: "",
    apiSource: "DigitalHut Observatory Environment API",
    apiStatus: "verified-environment-default",
    tags: [category, "environment", "structure", "mapping", "terrain", "scene"]
  }))
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=900")
  return res.status(200).json({category, query, assets})
}
