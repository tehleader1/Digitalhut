import { providerStatus } from "../digitalhutStore"
import { classifyIntent } from "./intentClassifier"
import { selectFeeds } from "./feedSelector"

export function buildHomepageState(input = {}) {
  const classification = classifyIntent(input)
  const feeds = selectFeeds(classification.intent)
  const providers = providerStatus()
  const premium = input.tier === "premium" || input.tier === "pro"

  return {
    intent: classification.intent,
    confidence: classification.confidence,
    reason: classification.reason,
    providers: {
      alpaca: providers.alpaca,
      sketchfab: providers.sketchfab,
      supabase: providers.supabase,
      payment: providers.payment
    },
    hero: {
      eyebrow: classification.intent === "crypto-trader" ? "Market Intelligence" : "DigitalHut Observatory",
      title: classification.intent === "crypto-trader"
        ? "BTC structure and Wall Street observatory are ready."
        : "Adaptive observatory, market, wallet, and agent console.",
      primaryAction: classification.intent.includes("trader") ? "Run Market Scan" : "Run Observatory Scan"
    },
    observatory: feeds.observatory,
    market: feeds.market,
    premium: premium
      ? { trigger: "premium-active", message: "Premium workspace active.", active: true }
      : { ...feeds.premium, active: false }
  }
}
