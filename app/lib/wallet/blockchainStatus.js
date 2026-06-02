function isAddress(wallet = "") {
  return /^0x[a-fA-F0-9]{40}$/.test(wallet)
}

function hexToInt(hex = "0x0") {
  try { return Number.parseInt(hex, 16) } catch { return 0 }
}

function weiToEthString(hex = "0x0") {
  try {
    const wei = BigInt(hex)
    const base = 10n ** 18n
    const whole = wei / base
    const fraction = (wei % base).toString().padStart(18, "0").slice(0, 5)
    return `${whole}.${fraction}`
  } catch {
    return "0.00000"
  }
}

async function rpc(method, params = []) {
  const url = process.env.ETH_RPC_URL || process.env.NEXT_SERVER_ETH_RPC_URL || "https://cloudflare-eth.com"
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method, params }),
    cache: "no-store"
  })
  if (!response.ok) throw new Error(`RPC returned ${response.status}`)
  const json = await response.json()
  if (json.error) throw new Error(json.error.message || "RPC error")
  return json.result
}

export async function getBlockchainStatus(wallet = "") {
  const cleanWallet = String(wallet || "").trim()
  const connected = isAddress(cleanWallet)

  if (!connected) {
    return {
      generatedAt: new Date().toISOString(),
      connected: false,
      mode: cleanWallet ? "demo-or-invalid-wallet" : "wallet-needed",
      wallet: cleanWallet || null,
      chain: "ethereum",
      status: "connect-wallet",
      message: "Connect a browser wallet to read live chain status."
    }
  }

  try {
    const [blockHex, balanceHex] = await Promise.all([
      rpc("eth_blockNumber"),
      rpc("eth_getBalance", [cleanWallet, "latest"])
    ])

    return {
      generatedAt: new Date().toISOString(),
      connected: true,
      mode: "live-chain",
      wallet: `${cleanWallet.slice(0, 6)}...${cleanWallet.slice(-4)}`,
      chain: "ethereum",
      blockNumber: hexToInt(blockHex),
      balanceEth: weiToEthString(balanceHex),
      status: "chain-readable",
      message: "Ethereum status is live."
    }
  } catch (error) {
    return {
      generatedAt: new Date().toISOString(),
      connected: true,
      mode: "chain-rpc-unavailable",
      wallet: `${cleanWallet.slice(0, 6)}...${cleanWallet.slice(-4)}`,
      chain: "ethereum",
      status: "rpc-check-needed",
      error: error.message,
      message: "Wallet is connected, but the chain status provider did not answer."
    }
  }
}
