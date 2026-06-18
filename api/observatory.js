export default function handler(req, res){
  const category = String(req.query?.category || "Mainstream Streaming")
  const query = String(req.query?.query || category).replace(/\s+/g, " ").trim().slice(0, 160)
  res.setHeader("Cache-Control", "public, s-maxage=120, stale-while-revalidate=600")
  return res.status(200).json({
    category,
    query,
    provider: "DigitalHut Observatory Status API",
    status: "ready",
    policy: "environment-first",
    supportedReads: ["structure", "mapping", "terrain", "environment", "planetary", "city", "facility", "route"],
    assets: []
  })
}
