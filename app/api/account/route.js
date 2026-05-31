import { getOrCreateAccount } from "../../lib/digitalhutStore"

export async function POST(req) {
  const body = await req.json()
  const wallet = body.wallet || "demo-wallet"
  const account = await getOrCreateAccount(wallet)
  return Response.json(account)
}
