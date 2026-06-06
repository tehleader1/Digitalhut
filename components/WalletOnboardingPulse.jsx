"use client"

import { useEffect, useState } from "react"
import { WALLET_PHASES, walletErrorMessage, walletMessageForPhase } from "../lib/domain/walletOnboarding"

function weiToEth(value = "0x0") {
  try {
    const wei = BigInt(value)
    const base = 10n ** 18n
    const whole = wei / base
    const fraction = (wei % base).toString().padStart(18, "0").slice(0, 6)
    return `${whole}.${fraction}`
  } catch {
    return "0.000000"
  }
}

function mask(wallet = "") {
  if (!wallet) return "not connected"
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
}

export default function WalletOnboardingPulse({ onWallet }) {
  const [state, setState] = useState({
    phase: WALLET_PHASES.CHECKING_EXTENSION,
    wallet: "",
    chainId: "",
    blockNumber: "",
    gasPriceEth: "",
    onboardingGasEth: "",
    message: walletMessageForPhase(WALLET_PHASES.CHECKING_EXTENSION)
  })

  useEffect(() => {
    checkExtension()
  }, [])

  async function checkExtension() {
    if (typeof window === "undefined" || !window.ethereum) {
      setState((current) => ({ ...current, phase: WALLET_PHASES.EXTENSION_MISSING, message: walletMessageForPhase(WALLET_PHASES.EXTENSION_MISSING) }))
      return
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" })
      if (accounts?.[0]) {
        await hydrateWallet(accounts[0], WALLET_PHASES.CHAIN_READABLE)
      } else {
        setState((current) => ({ ...current, phase: WALLET_PHASES.LOCKED, message: walletMessageForPhase(WALLET_PHASES.LOCKED) }))
      }
    } catch (error) {
      setState((current) => ({ ...current, phase: WALLET_PHASES.ERROR, message: walletErrorMessage(error) }))
    }
  }

  async function connect() {
    if (typeof window === "undefined" || !window.ethereum) {
      setState((current) => ({ ...current, phase: WALLET_PHASES.EXTENSION_MISSING, message: walletMessageForPhase(WALLET_PHASES.EXTENSION_MISSING) }))
      return
    }

    setState((current) => ({ ...current, phase: WALLET_PHASES.CONFIRMING, message: walletMessageForPhase(WALLET_PHASES.CONFIRMING) }))
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
      await hydrateWallet(accounts?.[0], WALLET_PHASES.GAS_READY)
    } catch (error) {
      setState((current) => ({ ...current, phase: WALLET_PHASES.ERROR, message: walletErrorMessage(error) }))
    }
  }

  async function hydrateWallet(wallet, phase) {
    if (!wallet) {
      setState((current) => ({ ...current, phase: WALLET_PHASES.LOCKED, message: walletMessageForPhase(WALLET_PHASES.LOCKED) }))
      return
    }

    const [chainId, blockNumber, gasPrice] = await Promise.all([
      window.ethereum.request({ method: "eth_chainId" }).catch(() => "unknown"),
      window.ethereum.request({ method: "eth_blockNumber" }).catch(() => "0x0"),
      window.ethereum.request({ method: "eth_gasPrice" }).catch(() => "0x0")
    ])

    const gasWei = BigInt(gasPrice || "0x0") * 21000n
    onWallet?.(wallet)
    setState({
      phase,
      wallet,
      chainId,
      blockNumber: String(Number.parseInt(blockNumber || "0x0", 16)),
      gasPriceEth: weiToEth(gasPrice),
      onboardingGasEth: weiToEth(`0x${gasWei.toString(16)}`),
      message: walletMessageForPhase(phase)
    })
  }

  return (
    <section style={styles.wrap} aria-label="Wallet onboarding pulse">
      <div style={styles.topRow}>
        <span style={styles.eyebrow}>Blockchain Verification</span>
        <span style={styles.phase}>{state.phase}</span>
      </div>
      <h2 style={styles.title}>{state.message}</h2>
      <div style={styles.grid}>
        <Info label="Wallet" value={mask(state.wallet)} />
        <Info label="Chain" value={state.chainId || "waiting"} />
        <Info label="Block" value={state.blockNumber || "waiting"} />
        <Info label="Gas price ETH" value={state.gasPriceEth || "waiting"} />
        <Info label="Onboard gas est." value={state.onboardingGasEth || "waiting"} />
      </div>
      <button onClick={connect} style={styles.button}>Verify Wallet</button>
    </section>
  )
}

function Info({ label, value }) {
  return <div style={styles.info}><span>{label}</span><b>{value}</b></div>
}

const styles = {
  wrap: { border: "1px solid rgba(251,191,36,.34)", borderRadius: 8, background: "rgba(2,6,23,.55)", color: "white", padding: 14, display: "grid", gap: 10 },
  topRow: { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" },
  eyebrow: { fontSize: 12, textTransform: "uppercase", letterSpacing: 0, fontWeight: 900, color: "#fde68a" },
  phase: { fontSize: 12, fontWeight: 900, padding: "7px 10px", borderRadius: 8, background: "rgba(251,191,36,.14)", color: "#fef3c7" },
  title: { fontSize: 20, lineHeight: 1.15, margin: 0, letterSpacing: 0 },
  grid: { display: "grid", gap: 7 },
  info: { display: "flex", justifyContent: "space-between", gap: 10, color: "#cbd5e1", fontSize: 13, overflowWrap: "anywhere" },
  button: { padding: "11px 12px", borderRadius: 8, border: 0, background: "#fbbf24", color: "#1f1300", fontWeight: 900, cursor: "pointer" }
}
