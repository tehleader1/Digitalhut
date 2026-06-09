import {buildGuideSession} from "../src/lib/guidedTourEngine.js"

export default async function handler(req, res){
  const query = req.query || {}
  const providerMix = String(query.providers || query.providerMix || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)

  const session = buildGuideSession({
    title: query.title,
    category: query.category,
    mode: query.mode,
    status: query.status,
    note: query.note,
    tier: query.tier,
    providerMix
  })

  res.status(200).json({
    ok: true,
    provider: "digitalhut-guided-tour",
    session,
    contract: {
      containment: "closed-until-clicked",
      hoverPreview: "fullscreen-system-preview",
      stages: session.stages.map((stage) => stage.id)
    }
  })
}
