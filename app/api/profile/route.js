import { saveCustomerProfile, addHistory } from "../../lib/digitalhutStore"

export async function POST(req) {
  const profile = await req.json()
  const saved = await saveCustomerProfile(profile)
  await addHistory({
    wallet: saved.wallet,
    event_type: "profile-updated",
    target: "customer-profile",
    result: { email: saved.email, sms_phone: saved.sms_phone, home_address: saved.home_address }
  })
  return Response.json({ ok: true, profile: saved })
}
