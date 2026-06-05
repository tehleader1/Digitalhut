import { getDigitalHutAgentManifest } from "../../../lib/domain/agentCapabilities"

export async function GET() {
  return Response.json(getDigitalHutAgentManifest(), {
    headers: {
      "Cache-Control": "public, max-age=300"
    }
  })
}
