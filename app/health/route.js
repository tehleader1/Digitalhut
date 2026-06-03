import { providerStatus } from "../lib/digitalhutStore"

export const dynamic = "force-dynamic"

function hasEnv(name) {
  return Boolean(process.env[name])
}

export async function GET() {
  const legacy = providerStatus()
  const selected = {
    alphaVantage: hasEnv("ALPHA_VANTAGE_API_KEY"),
    cesium: hasEnv("CESIUM_ION_TOKEN"),
    fmp: hasEnv("FMP_API_KEY"),
    polygon: hasEnv("POLYGON_API_KEY"),
    sketchfab: hasEnv("SKETCHFAB_ACCESS_TOKEN"),
    paymentWalletConfigured: Boolean(process.env.DIGITALHUT_PAYMENT_WALLET),
    paymentWallet: process.env.DIGITALHUT_PAYMENT_WALLET || null
  }

  return Response.json({
    status: "ok",
    service: "digitalhut-observatory",
    deployment: "render-selected-api-provider-map",
    providers: {
      ...legacy,
      ...selected,
      selectedApiKeys: {
        ALPHA_VANTAGE_API_KEY: selected.alphaVantage,
        CESIUM_ION_TOKEN: selected.cesium,
        FMP_API_KEY: selected.fmp,
        POLYGON_API_KEY: selected.polygon,
        SKETCHFAB_ACCESS_TOKEN: selected.sketchfab
      }
    },
    time: Date.now()
  })
}
