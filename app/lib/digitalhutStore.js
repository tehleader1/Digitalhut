const memory = globalThis.digitalhutDb ||= {
  users: {},
  customers: {},
  history: [],
  subscriptions: [],
  downloads: [],
  liveEdits: [],
  renderJobs: []
}

function supabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
  return { url: url?.replace(/\/$/, ""), key }
}

function hasSupabase() {
  const { url, key } = supabaseConfig()
  return Boolean(url && key)
}

async function supabaseFetch(path, options = {}) {
  const { url, key } = supabaseConfig()
  if (!url || !key) throw new Error("Supabase environment variables are missing")

  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation,resolution=merge-duplicates",
      ...(options.headers || {})
    }
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`Supabase request failed: ${response.status} ${detail}`)
  }

  if (response.status === 204) return null
  return response.json()
}

function tierLimit(tier) {
  return ({ free: 3, standard: 12, premium: 40, pro: 999 })[tier] || 3
}

function cleanProfile(profile = {}) {
  return {
    wallet: profile.wallet || "demo-wallet",
    email: profile.email || "",
    sms_phone: profile.sms_phone || "",
    sms_market_updates: Boolean(profile.sms_market_updates),
    sms_observatory_updates: Boolean(profile.sms_observatory_updates),
    home_address: profile.home_address || "",
    updated_at: new Date().toISOString()
  }
}

export function providerStatus() {
  return {
    supabase: hasSupabase(),
    sketchfab: Boolean(process.env.SKETCHFAB_ACCESS_TOKEN || process.env.SKETCHFAB_API_TOKEN),
    alpaca: Boolean(process.env.ALPACA_API_KEY && process.env.ALPACA_SECRET_KEY),
    payment: Boolean(process.env.STRIPE_SECRET_KEY || process.env.COINBASE_COMMERCE_API_KEY)
  }
}

export async function getOrCreateAccount(wallet = "demo-wallet") {
  if (!hasSupabase()) {
    memory.users[wallet] ||= { wallet, tier: "free", downloads: 3, status: "local-memory" }
    return memory.users[wallet]
  }

  const existing = await supabaseFetch(`digitalhut_users?wallet=eq.${encodeURIComponent(wallet)}&limit=1`)
  if (existing?.[0]) return existing[0]

  const created = await supabaseFetch("digitalhut_users", {
    method: "POST",
    body: JSON.stringify({ wallet, tier: "free", downloads: 3, status: "active" })
  })
  return created[0]
}

export async function setAccountTier(wallet = "demo-wallet", tier = "free") {
  const row = { wallet, tier, downloads: tierLimit(tier), status: "active", updated_at: new Date().toISOString() }

  if (!hasSupabase()) {
    memory.users[wallet] = row
    return row
  }

  const saved = await supabaseFetch("digitalhut_users?on_conflict=wallet", {
    method: "POST",
    body: JSON.stringify(row)
  })
  return saved[0]
}

export async function saveCustomerProfile(profile) {
  const row = cleanProfile(profile)
  if (!hasSupabase()) {
    memory.customers[row.wallet] = { ...(memory.customers[row.wallet] || {}), ...row }
    return memory.customers[row.wallet]
  }
  const saved = await supabaseFetch("digitalhut_customers?on_conflict=wallet", {
    method: "POST",
    body: JSON.stringify(row)
  })
  return saved[0]
}

export async function createSubscriptionIntent(input = {}) {
  const row = {
    wallet: input.wallet || "demo-wallet",
    tier: input.tier || "free",
    currency: input.currency || "USD",
    amount: Number(input.amount || 0),
    status: providerStatus().payment ? "payment-provider-ready" : "payment-provider-needed",
    provider: process.env.STRIPE_SECRET_KEY ? "stripe" : process.env.COINBASE_COMMERCE_API_KEY ? "coinbase-commerce" : "manual-intent",
    created_at: new Date().toISOString()
  }
  if (!hasSupabase()) {
    memory.subscriptions.unshift(row)
    return row
  }
  const saved = await supabaseFetch("digitalhut_subscriptions", { method: "POST", body: JSON.stringify(row) })
  return saved[0]
}

export async function addHistory(item) {
  const row = { ...item, created_at: new Date().toISOString() }

  if (!hasSupabase()) {
    memory.history.unshift({ ...row, time: Date.now() })
    return memory.history.slice(0, 20)
  }

  await supabaseFetch("digitalhut_history", {
    method: "POST",
    body: JSON.stringify(row)
  })
  return getHistory()
}

export async function getHistory() {
  if (!hasSupabase()) return memory.history || []
  return supabaseFetch("digitalhut_history?select=*&order=created_at.desc&limit=20")
}

export async function logDownload(item = {}) {
  const row = { ...item, created_at: new Date().toISOString() }
  if (!hasSupabase()) {
    memory.downloads.unshift(row)
    return row
  }
  const saved = await supabaseFetch("digitalhut_downloads", { method: "POST", body: JSON.stringify(row) })
  return saved[0]
}

export async function logLiveEdit(item = {}) {
  const row = { ...item, created_at: new Date().toISOString() }
  if (!hasSupabase()) {
    memory.liveEdits.unshift(row)
    return row
  }
  const saved = await supabaseFetch("digitalhut_live_edits", { method: "POST", body: JSON.stringify(row) })
  return saved[0]
}

export async function createRenderJob(item = {}) {
  const row = {
    wallet: item.wallet || "demo-wallet",
    source_model: item.source_model || item.asset || "",
    scene_name: item.scene_name || "DigitalHut Observatory",
    render_status: item.render_status || "queued",
    output_path: item.output_path || "",
    metadata: item.metadata || {},
    created_at: new Date().toISOString()
  }
  if (!hasSupabase()) {
    memory.renderJobs.unshift(row)
    return row
  }
  const saved = await supabaseFetch("digitalhut_render_jobs", { method: "POST", body: JSON.stringify(row) })
  return saved[0]
}
