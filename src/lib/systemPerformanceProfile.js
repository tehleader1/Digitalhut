const profileStorageKey = "digitalhut:systemPerformanceProfile"

function readStoredProfile(){
  try {
    return window.localStorage.getItem(profileStorageKey) || ""
  } catch {
    return ""
  }
}

export function getSystemPerformanceProfile(){
  if(typeof window === "undefined") {
    return {id: "balanced", className: "balanced-power", label: "Balanced renderer", motionScale: 1, reason: "Server fallback"}
  }

  const stored = readStoredProfile()
  const nav = window.navigator || {}
  const cores = Number(nav.hardwareConcurrency || 4)
  const memory = Number(nav.deviceMemory || 4)
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
  const mobile = window.matchMedia?.("(max-width: 760px)")?.matches

  if(stored === "firecuda-max" || stored === "max") {
    return {id: "firecuda-max", className: "max-power firecuda-max", label: "FireCuda Max", motionScale: 1.35, reason: "Local max profile override"}
  }

  if(reducedMotion || mobile || cores < 6 || memory < 6) {
    return {id: "low", className: "low-power", label: "Efficient renderer", motionScale: .72, reason: reducedMotion ? "Reduced motion" : mobile ? "Mobile viewport" : "Limited CPU/RAM"}
  }

  return {id: "firecuda-max", className: "max-power firecuda-max", label: "FireCuda Max", motionScale: 1.25, reason: `${cores} threads / ${memory}GB browser profile`}
}

export function applySystemPerformanceProfile(profile){
  if(typeof document === "undefined" || !profile) return
  document.documentElement.dataset.digitalhutPerformance = profile.id
  document.documentElement.dataset.digitalhutPerformanceReason = profile.reason
  document.documentElement.style.setProperty("--dh-motion-scale", String(profile.motionScale || 1))
}

export function forceFirecudaMaxProfile(){
  if(typeof window === "undefined") return
  window.localStorage.setItem(profileStorageKey, "firecuda-max")
}
