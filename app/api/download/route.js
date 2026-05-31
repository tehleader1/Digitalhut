import { logDownload, addHistory } from "../../lib/digitalhutStore"

export async function POST(req) {
  const { wallet = "demo-wallet", tier = "free", asset = "/demo.glb", modelUid = "" } = await req.json()
  const allowed = tier !== "free"
  const event = await logDownload({
    wallet,
    tier,
    asset,
    model_uid: modelUid,
    allowed,
    provider: asset.includes("sketchfab") || modelUid ? "sketchfab" : "local"
  })
  await addHistory({ wallet, tier, event_type: "glb-download-request", result: event })
  return Response.json({
    allowed,
    asset,
    event,
    message: allowed ? "Download unlocked for paid tier." : "Free tier preview only. Upgrade for GLB downloads."
  })
}
