import { setAccountTier } from "../../lib/digitalhutStore"

export async function POST(req) {
  const { wallet = "demo-wallet", tier = "free" } = await req.json()
  const account = await setAccountTier(wallet, tier)
  return Response.json(account)
}
