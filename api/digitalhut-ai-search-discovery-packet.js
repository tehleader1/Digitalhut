import {baseArtifact, priorityRoutes, sendJson} from "./_proof-artifact-data.js"

export default function handler(req, res){
  return sendJson(res, {
    ...baseArtifact("DigitalHut AI Search Discovery Packet"),
    purpose: "Give search and AI readers a concise, crawlable map of the DigitalHut full-system entertainment observatory.",
    primaryAudiencePools: ["lunch / food near me", "rideshare / Uber / commute", "flights / travel booking", "wiki / quick research", "funny reels / mainstream videos", "grocery / product reviews", "gaming world builds", "AI video/podcast/source explainers"],
    priorityRoutes
  })
}
