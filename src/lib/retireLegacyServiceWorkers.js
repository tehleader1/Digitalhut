const retirementReloadKey = "digitalhut:service-worker-retirement-reload"

export async function retireLegacyServiceWorkers(){
  if(typeof window === "undefined" || !("serviceWorker" in navigator)) return

  navigator.serviceWorker.addEventListener("message", (event) => {
    if(event.data?.type !== "DIGITALHUT_SERVICE_WORKER_RETIRED") return
    if(window.sessionStorage.getItem(retirementReloadKey) === "done") return
    window.sessionStorage.setItem(retirementReloadKey, "done")
    window.location.reload()
  })

  try {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations
      .filter((registration) => new URL(registration.scope).origin === window.location.origin)
      .map(async (registration) => {
        await registration.update()
        registration.waiting?.postMessage({type: "SKIP_WAITING"})
      }))
  } catch {
    // Service-worker cleanup must never block the live application.
  }
}

