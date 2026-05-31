import { logLiveEdit } from "../../lib/digitalhutStore"

export async function POST(req) {
  const body = await req.json()
  const event = await logLiveEdit({
    agent: body.agent || "Digitalhut Agent",
    change_summary: body.change_summary || body.summary || "Live edit logged",
    files: body.files || [],
    status: body.status || "applied"
  })
  return Response.json({ ok: true, event })
}
