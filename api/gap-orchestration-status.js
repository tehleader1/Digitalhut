import { evaluateGapOrchestration } from "../config/gap-orchestration.mjs";

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "method_not_allowed" });
  }
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=60, stale-while-revalidate=300");
  return res.status(200).json(evaluateGapOrchestration());
}


