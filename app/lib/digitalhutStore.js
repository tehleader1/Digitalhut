const memory = globalThis.digitalhutDb ||= { users: {}, history: [] }

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

export function providerStatus() {
  return {
    supabase: hasSupabase(),
    sketchfab: Boolean(process.env.SKETCHFAB_ACCESS_TOKEN || process.env.SKETCHFAB_API_TOKEN),
    alpaca: Boolean(process.env.ALPACA_API_KEY && process.env.ALPACA_SECRET_KEY)
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
  const limits = { free: 3, standard: 12, premium: 40, pro: 999 }
  const row = { wallet, tier, downloads: limits[tier] || 3, status: "active" }

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
