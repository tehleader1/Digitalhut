let db = globalThis.digitalhutDb ||= { users:{}, history:[] }
const limits={free:3,standard:12,premium:40,pro:999}
export async function POST(req){
  const {wallet="demo-wallet",tier="free"} = await req.json()
  db.users[wallet] = { wallet, tier, downloads:limits[tier]||3, status:"active" }
  return Response.json(db.users[wallet])
}
