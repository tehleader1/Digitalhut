import { providerStatus } from "../lib/digitalhutStore"

export const dynamic = "force-dynamic"

export async function GET() {
  const providers = providerStatus()
  const alpacaKeyEnv = providers.env?.alpacaKey || null
  const alpacaSecretEnv = providers.env?.alpacaSecret || null
  const alpacaDetected = Boolean(alpacaKeyEnv && alpacaSecretEnv)

  return Response.json({
    status: "ok",
    service: "digitalhut-observatory",
    deployment: "render-hourly-2026-06-01-alpaca-diagnostics",
    providers: {
      ...providers,
      alpaca: alpacaDetected,
      alpacaDetected,
      alpacaKeyEnv,
      alpacaSecretEnv
    },
    time: Date.now()
  })
}
