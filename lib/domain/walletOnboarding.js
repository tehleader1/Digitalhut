export const WALLET_PHASES = {
  CHECKING_EXTENSION: "checking-extension",
  EXTENSION_MISSING: "extension-missing",
  LOCKED: "locked",
  CONFIRMING: "confirming",
  CHAIN_READABLE: "chain-readable",
  GAS_READY: "gas-ready",
  ERROR: "error"
}

export function walletMessageForPhase(phase) {
  const messages = {
    [WALLET_PHASES.CHECKING_EXTENSION]: "Checking for a digital wallet extension.",
    [WALLET_PHASES.EXTENSION_MISSING]: "Install or enable a wallet extension to continue.",
    [WALLET_PHASES.LOCKED]: "Your wallet is currently locked. To continue, please unlock your wallet and try again.",
    [WALLET_PHASES.CONFIRMING]: "Confirm in your digital wallet extension to continue.",
    [WALLET_PHASES.CHAIN_READABLE]: "Wallet verified. Chain status is readable.",
    [WALLET_PHASES.GAS_READY]: "Wallet, chain, and gas estimate are ready.",
    [WALLET_PHASES.ERROR]: "Wallet verification needs another attempt. Unlock your wallet and retry."
  }
  return messages[phase] || messages[WALLET_PHASES.ERROR]
}

export function walletErrorMessage(error) {
  const code = error?.code
  const text = String(error?.message || "").toLowerCase()
  if (code === 4001) return "Wallet confirmation was cancelled. Try again when ready."
  if (code === -32002) return "Confirm in your digital wallet extension to continue. A request is already open."
  if (code === 4100 || text.includes("locked")) return walletMessageForPhase(WALLET_PHASES.LOCKED)
  return walletMessageForPhase(WALLET_PHASES.ERROR)
}
