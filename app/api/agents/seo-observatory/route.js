import { buildSeoObservatoryPlan } from "../../../lib/agents/seoObservatoryAgent"

export const dynamic = "force-dynamic"

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  return Response.json(buildSeoObservatoryPlan({ intent: searchParams.get("intent") || "public-observatory" }))
}
