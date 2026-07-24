const digitalhutPublicOrigin = "https://www.digitalhut.app"

export function canonicalWatchProofUrl(slug){
  const routeSlug = String(slug || "").trim().replace(/^\/+|\/+$/g, "")
  return new URL(`/watch/${encodeURIComponent(routeSlug)}`, digitalhutPublicOrigin).href
}

export function resolveWatchProofRoute(posts, requestedSlug){
  const routeSlug = String(requestedSlug || "")
  const post = Array.isArray(posts)
    ? posts.find((item) => String(item?.slug || "") === routeSlug)
    : null

  return {
    status: post ? "found" : "not-found",
    post: post || null,
    canonicalUrl: canonicalWatchProofUrl(post?.slug || routeSlug)
  }
}
