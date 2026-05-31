import { createRenderJob, addHistory } from "../../lib/digitalhutStore"

export async function POST(req) {
  const body = await req.json()
  const job = await createRenderJob(body)
  await addHistory({
    wallet: job.wallet,
    event_type: "render-job-created",
    result: job
  })
  return Response.json({ ok: true, job })
}
