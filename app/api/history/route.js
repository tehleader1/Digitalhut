import { addHistory, getHistory } from "../../lib/digitalhutStore"

export async function POST(req) {
  const item = await req.json()
  const history = await addHistory(item)
  return Response.json({ ok: true, history })
}

export async function GET() {
  const history = await getHistory()
  return Response.json({ history })
}
