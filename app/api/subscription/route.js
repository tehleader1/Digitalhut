import { createSubscriptionIntent, setAccountTier, addHistory } from "../../lib/digitalhutStore"

export async function POST(req) {
  const input = await req.json()
  const subscription = await createSubscriptionIntent(input)
  if (input.tier && input.wallet) await setAccountTier(input.wallet, input.tier)
  await addHistory({
    wallet: subscription.wallet,
    tier: subscription.tier,
    event_type: "subscription-intent-created",
    result: subscription
  })
  return Response.json({ ok: true, subscription })
}
