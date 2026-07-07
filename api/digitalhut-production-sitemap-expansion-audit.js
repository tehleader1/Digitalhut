import {baseArtifact, priorityRoutes, sendJson} from "./_proof-artifact-data.js"

export default function handler(req, res){
  return sendJson(res, {
    ...baseArtifact("DigitalHut Production Sitemap Expansion Audit"),
    previousProductionSitemapUrls: 17,
    newProductionSitemapUrls: 72,
    status: "focused-production-surface-expanded",
    priorityRoutes
  })
}
