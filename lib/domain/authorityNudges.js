export function getAuthorityNudges({ activeFeed, userProfile, subscription }) {
  const nudges = []

  if (subscription?.daysRemaining && subscription.daysRemaining <= 5) {
    nudges.push({
      id: "subscription-expiring",
      tone: "important",
      title: "Your subscription is running out soon",
      message: `Your ${subscription.tier || "Pro"} access renews in ${subscription.daysRemaining} days. Renew now to keep downloads, guided tours, and premium controls active.`,
      actionLabel: "Renew now",
      action: "renew-subscription"
    })
  }

  if (activeFeed?.modelUrl && subscription?.tier !== "pro") {
    nudges.push({
      id: "pro-glb-editing",
      tone: "premium",
      title: "GLB editing is a Pro feature",
      message: "Lighting, tone, props, annotations, camera paths, and advanced GLB editing are available in Professional tier.",
      actionLabel: "Upgrade to Pro",
      action: "upgrade-pro"
    })
  }

  if (userProfile?.type === "manual-builder") {
    nudges.push({
      id: "manual-builder-tools",
      tone: "helpful",
      title: "Project tools are ready",
      message: "You seem to prefer manual discovery. Quick download, save, embed, and related asset actions are available under the renderer.",
      actionLabel: "Show tools",
      action: "show-quick-tools"
    })
  }

  if (userProfile?.type === "family-presentation") {
    nudges.push({
      id: "ambient-tour-ready",
      tone: "friendly",
      title: "Still there?",
      message: "DigitalHut can keep the tour moving softly while you multitask. Pause or switch to manual anytime.",
      actionLabel: "Continue tour",
      action: "resume-tour"
    })
  }

  if (userProfile?.type === "researcher") {
    nudges.push({
      id: "research-mode-ready",
      tone: "helpful",
      title: "Research Mode is ready",
      message: "DigitalHut noticed you are exploring this like a researcher. Switch to Research Mode for source details and measurements.",
      actionLabel: "Research Mode",
      action: "switch-researcher"
    })
  }

  return nudges
}
