export const walletTiers = {
  free: { rank: 0, label: "Free", downloads: false },
  standard: { rank: 1, label: "Standard", downloads: true },
  premium: { rank: 2, label: "Premium", downloads: true },
  pro: { rank: 3, label: "Pro", downloads: true }
}

export function normalizeTier(tier) {
  const key = String(tier || "free").toLowerCase()
  return walletTiers[key] ? key : "free"
}

export function canAccessTier(currentTier, requiredTier = "free") {
  const current = walletTiers[normalizeTier(currentTier)]
  const required = walletTiers[normalizeTier(requiredTier)]
  return current.rank >= required.rank
}

export function getWalletPermissionState({ wallet = "", tier = "free", requiredTier = "free", action = "unlock-glb-download" } = {}) {
  const normalizedTier = normalizeTier(tier)
  const allowed = canAccessTier(normalizedTier, requiredTier)
  return {
    walletConnected: Boolean(wallet),
    tier: normalizedTier,
    requiredTier: normalizeTier(requiredTier),
    action,
    allowed,
    status: allowed ? "permission-granted" : "tier-upgrade-required",
    message: allowed
      ? `${walletTiers[normalizedTier].label} access can run this action.`
      : `${walletTiers[normalizeTier(requiredTier)].label} access is required for this action.`
  }
}
