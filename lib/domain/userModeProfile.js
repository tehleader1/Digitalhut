export function detectUserModeProfile(events = []) {
  const recent = events.slice(-20)

  const downloadClicks = recent.filter((event) => event.type === "download-click").length
  const libraryClicks = recent.filter((event) => event.type === "library-click").length
  const tourStarts = recent.filter((event) => event.type === "tour-start").length
  const manualMoves = recent.filter((event) => event.type === "renderer-manual-control").length
  const researchClicks = recent.filter((event) => event.type === "source-open" || event.type === "detail-expand").length
  const shareClicks = recent.filter((event) => event.type === "share-click" || event.type === "embed-click").length
  const walletChecks = recent.filter((event) => event.type === "wallet-check" || event.type === "gas-check").length

  if (downloadClicks >= 2 || manualMoves >= 4) {
    return {
      type: "manual-builder",
      label: "Manual Builder",
      intent: "discovery-download-project",
      preferredMode: "manual",
      narrationStyle: "short",
      guidance: "User wants control, downloads, and quick project utility."
    }
  }

  if (tourStarts >= 2 && manualMoves <= 1) {
    return {
      type: "family-presentation",
      label: "Family Explorer",
      intent: "guided-learning-entertainment",
      preferredMode: "ambient",
      narrationStyle: "friendly",
      guidance: "User likes guided discovery and passive viewing."
    }
  }

  if (researchClicks >= 3) {
    return {
      type: "researcher",
      label: "Researcher",
      intent: "source-detail-measurement",
      preferredMode: "researcher",
      narrationStyle: "detailed",
      guidance: "User wants facts, sources, coordinates, and measurement context."
    }
  }

  if (shareClicks >= 2) {
    return {
      type: "journalist-reviewer",
      label: "Reviewer / Journalist",
      intent: "platform-explanation-share",
      preferredMode: "guided",
      narrationStyle: "platform-story",
      guidance: "User may be evaluating DigitalHut as a product."
    }
  }

  if (walletChecks >= 2 || libraryClicks >= 4) {
    return {
      type: "authority-shopper",
      label: "Authority Shopper",
      intent: "wallet-subscription-verification",
      preferredMode: "manual",
      narrationStyle: "trust-first",
      guidance: "User is checking wallet, subscription, gas, and access authority."
    }
  }

  return {
    type: "general-explorer",
    label: "Explorer",
    intent: "general-discovery",
    preferredMode: "guided",
    narrationStyle: "balanced",
    guidance: "User is exploring without strong intent yet."
  }
}

export function getModeNarrationStyle(profile, activeFeed) {
  const title = activeFeed?.title || "this discovery"

  const styles = {
    "manual-builder": `Quick scan: ${title}. Use orbit, download, save, or open related project assets.`,
    "family-presentation": `Welcome to ${title}. DigitalHut can keep this discovery moving in a simple guided way.`,
    researcher: `Research view for ${title}. Review source, structure, measurements, context, and related evidence.`,
    "journalist-reviewer": `DigitalHut is presenting ${title} as part of its observatory system: render, runner, library, wallet, and memory.`,
    "authority-shopper": `Authority view for ${title}. Verify wallet status, subscription tier, gas readiness, and premium controls before taking action.`,
    "general-explorer": `Now observing ${title}. You can follow the tour, browse the library, or switch to manual mode.`
  }

  return styles[profile?.type] || styles["general-explorer"]
}
