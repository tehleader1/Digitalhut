import { getBlockchainStatus } from "../../lib/wallet/blockchainStatus"

export const dynamic = "force-dynamic"

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const wallet = searchParams.get("wallet") || ""
  const status = await getBlockchainStatus(wallet)
  return Response.json(status)
}
