import { getPersonaFeature, listPersonaFeatures } from "../../../lib/personaFeature"

export const dynamic = "force-dynamic"

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const intent = searchParams.get("intent") || ""

  if (intent) {
    return Response.json({ feature: getPersonaFeature(intent) })
  }

  return Response.json({ features: listPersonaFeatures() })
}
