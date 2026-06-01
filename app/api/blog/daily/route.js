import { buildDailyBriefing } from "../../../lib/blog/dailyPosts"

export const dynamic = "force-dynamic"

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const briefing = buildDailyBriefing({
    intent: searchParams.get("intent") || "public-observatory"
  })

  return Response.json(briefing)
}
