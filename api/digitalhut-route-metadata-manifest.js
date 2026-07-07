import {baseArtifact, priorityRoutes, sendJson} from "./_proof-artifact-data.js"

export default function handler(req, res){
  return sendJson(res, {
    ...baseArtifact("DigitalHut Route Metadata Manifest"),
    routeCount: 72,
    watchProofRoutes: 29,
    blogProofRoutes: 18,
    categoryProofRoutes: 13,
    priorityRoutes
  })
}
