let db = globalThis.digitalhutDb ||= { users:{}, history:[] }
export async function POST(req){
  const body = await req.json()
  const wallet = body.wallet || "demo-wallet"
  db.users[wallet] ||= { wallet, tier:"free", downloads:3, history:[] }
  return Response.json(db.users[wallet])
}
