export async function POST(req){
  const {tier="free",asset="/demo.glb"} = await req.json()
  const allowed = tier !== "free"
  return Response.json({allowed, asset, message: allowed ? "Download unlocked for paid tier." : "Free tier preview only. Upgrade for GLB downloads."})
}
