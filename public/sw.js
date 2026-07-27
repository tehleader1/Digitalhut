/*
 * DigitalHut service-worker retirement shim.
 *
 * This file intentionally does not install a fetch handler. Existing/PWA
 * clients update to it, release retired caches, and return to normal network
 * loading without leaving an obsolete worker in control.
 */
const DIGITALHUT_CACHE_PREFIXES = [
  "digitalhut",
  "workbox-precache",
  "workbox-runtime",
  "vite-pwa",
]

self.addEventListener("install", () => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys()
    await Promise.all(cacheNames
      .filter((name) => DIGITALHUT_CACHE_PREFIXES.some((prefix) => name.toLowerCase().startsWith(prefix)))
      .map((name) => caches.delete(name)))

    await self.clients.claim()
    const clients = await self.clients.matchAll({type: "window", includeUncontrolled: true})
    clients.forEach((client) => client.postMessage({type: "DIGITALHUT_SERVICE_WORKER_RETIRED"}))
    await self.registration.unregister()
  })())
})

self.addEventListener("message", (event) => {
  if(event.data?.type === "SKIP_WAITING") self.skipWaiting()
})

