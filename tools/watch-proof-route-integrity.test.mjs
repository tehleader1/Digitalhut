import assert from "node:assert/strict"
import {readFileSync} from "node:fs"
import test from "node:test"
import {canonicalWatchProofUrl, resolveWatchProofRoute} from "../src/lib/watchProofRouteIntegrity.js"

const posts = [
  {slug: "first-published-proof", title: "First published proof"},
  {slug: "search-intent-radar-visual-experience", title: "Search intent radar"}
]

test("watch canonicals preserve the resolved slug without arrival parameters", () => {
  const arrival = new URL("https://www.digitalhut.app/watch/search-intent-radar-visual-experience?dh_query=visual+search&dh_rank=12&utm_source=search&gclid=click-id")
  const routeSlug = decodeURIComponent(arrival.pathname.split("/").pop())
  const route = resolveWatchProofRoute(posts, routeSlug)

  assert.equal(route.status, "found")
  assert.equal(route.post, posts[1])
  assert.equal(route.canonicalUrl, "https://www.digitalhut.app/watch/search-intent-radar-visual-experience")
  assert.equal(new URL(route.canonicalUrl).search, "")
})

test("watch canonical encoding preserves the requested slug as a path segment", () => {
  assert.equal(
    canonicalWatchProofUrl("proof with spaces"),
    "https://www.digitalhut.app/watch/proof%20with%20spaces"
  )
})

test("an unknown watch slug fails closed instead of selecting the first post", () => {
  const route = resolveWatchProofRoute(posts, "not-a-published-proof")

  assert.equal(route.status, "not-found")
  assert.equal(route.post, null)
  assert.notEqual(route.post, posts[0])
  assert.equal(route.canonicalUrl, "https://www.digitalhut.app/watch/not-a-published-proof")
})

test("the watch page exposes a truthful noindex not-found state", () => {
  const pageSource = readFileSync(new URL("../src/pages/WatchProofPage.jsx", import.meta.url), "utf8")

  assert.match(pageSource, /data-route-state="not-found"/)
  assert.match(pageSource, /No other episode was substituted\./)
  assert.match(pageSource, /robots\.content = "noindex,follow"/)
  assert.match(pageSource, /canonical\.href = routeState\.canonicalUrl/)
  assert.doesNotMatch(pageSource, /\|\|\s*posts\[0\]/)
})
