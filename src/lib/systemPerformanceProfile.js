const profileStorageKey = "digitalhut:systemPerformanceProfile"

function readStoredProfile(){
  try {
    return window.localStorage.getItem(profileStorageKey) || ""
  } catch {
    return ""
  }
}

function webglRenderer(){
  try {
    const canvas = document.createElement("canvas")
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
    if(!gl) return ""
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info")
    return debugInfo ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "") : String(gl.getParameter(gl.RENDERER) || "")
  } catch {
    return ""
  }
}

export function getSystemPerformanceProfile(){
  if(typeof window === "undefined") {
    return {
      id: "balanced",
      className: "balanced-power",
      label: "Balanced renderer",
      motionScale: 1,
      reason: "Server fallback"
    }
  }

  const stored = readStoredProfile()
  const nav = window.navigator || {}
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection || {}
  const cores = Number(nav.hardwareConcurrency || 4)
  const memory = Number(nav.deviceMemory || 4)
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
  const mobile = window.matchMedia?.("(max-width: 760px)")?.matches
  const renderer = webglRenderer().toLowerCase()
  const softwareRenderer = renderer.includes("swiftshader") || renderer.includes("basic render") || renderer.includes("software")
  const saveData = Boolean(connection.saveData)
  const slowNetwork = ["slow-2g", "2g"].includes(connection.effectiveType)

  if(stored === "firecuda-max" || stored === "max") {
    return {
      id: "firecuda-max",
      className: "max-power firecuda-max",
      label: "FireCuda Max",
      motionScale: 1.35,
      reason: "Local max profile override"
    }
  }

  if(reducedMotion || saveData || slowNetwork || mobile || softwareRenderer || cores < 6 || memory < 6) {
    return {
      id: "low",
      className: "low-power",
      label: "Efficient renderer",
      motionScale: .72,
      reason: reducedMotion ? "Reduced motion" : saveData ? "Data saver" : slowNetwork ? "Slow network" : mobile ? "Mobile viewport" : softwareRenderer ? "Software renderer" : "Limited CPU/RAM"
    }
  }

  return {
    id: "firecuda-max",
    className: "max-power firecuda-max",
    label: "FireCuda Max",
    motionScale: 1.25,
    reason: `${cores} threads / ${memory}GB browser profile`
  }
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
