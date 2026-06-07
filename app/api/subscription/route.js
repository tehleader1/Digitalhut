import { createSubscriptionIntent, setAccountTier, addHistory } from '../../lib/digitalhutStore'

const TERMS_VERSION = 'architect-layer-2026-06'

export async function POST(req) {
  const input = await req.json()

  if (!input.termsAccepted || input.termsVersion !== TERMS_VERSION) {
    return Response.json({
      ok: false,
      error: 'terms-required',
      termsVersion: TERMS_VERSION,
      message: 'Accept DigitalHut Architect Layer terms before subscription registration.'
    }, {status: 428})
  }

  const subscription = await createSubscriptionIntent({
    ...input,
    termsAccepted: true,
    termsVersion: TERMS_VERSION,
    termsAcceptedAt: new Date().toISOString()
  })
  if (input.tier && input.wallet) await setAccountTier(input.wallet, input.tier)
  await addHistory({
    wallet: subscription.wallet,
    tier: subscription.tier,
    event_type: 'subscription-intent-created',
    result: {
      ...subscription,
      termsVersion: TERMS_VERSION
    }
  })
  return Response.json({ ok: true, subscription })
}
