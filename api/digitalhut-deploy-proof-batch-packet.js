import {baseArtifact, sendJson} from "./_proof-artifact-data.js"

export default function handler(req, res){
  return sendJson(res, {
    ...baseArtifact("DigitalHut Deploy Proof Batch Packet"),
    deployedSurface: {sitemapUrls: 72, llmsTxt: true, searchConsoleReceiptJson: true},
    nextVerification: ["Search Console sitemap downloaded", "Search Console query rows", "Supabase proof route opens", "source/backlink opens", "GLB/podcast second actions"]
  })
}
