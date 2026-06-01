import { providerStatus } from "../lib/digitalhutStore"

export const dynamic = "force-dynamic"

export async function GET() {
  return Response.json({
    status: "ok",
    service: "digitalhut-observatory",
    deployment: "render-hourly-2026-06-01-provider-status",
    providers: providerStatus(),
    time: Date.now()
  })
}
