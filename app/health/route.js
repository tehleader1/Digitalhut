import { providerStatus } from "../lib/digitalhutStore"

export async function GET() {
  return Response.json({
    status: "ok",
    service: "digitalhut-observatory",
    providers: providerStatus(),
    time: Date.now()
  })
}
