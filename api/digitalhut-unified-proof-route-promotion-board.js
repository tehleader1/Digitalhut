import {baseArtifact, priorityRoutes, sendJson} from "./_proof-artifact-data.js"

export default function handler(req, res){
  return sendJson(res, {
    ...baseArtifact("DigitalHut Unified Proof Route Promotion Board"),
    promotionRule: "Promote only after proof/source, GLB, podcast, autoplay, search, market, page, or visitor movement appears above the current floor.",
    nextBestLane: "AI video / podcast / source explainer",
    priorityRoutes
  })
}
