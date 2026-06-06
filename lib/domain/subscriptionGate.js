export function canUseFeature(subscription, feature) {
  const tier = subscription?.tier || "free"

  const rules = {
    viewRenderer: ["free", "standard", "premium", "pro"],
    saveDiscovery: ["standard", "premium", "pro"],
    downloadModel: ["standard", "premium", "pro"],
    guidedTours: ["free", "standard", "premium", "pro"],
    advancedResearch: ["premium", "pro"],
    glbEditing: ["pro"],
    cameraPaths: ["pro"],
    props: ["pro"],
    annotations: ["premium", "pro"],
    seoExport: ["premium", "pro"]
  }

  return (rules[feature] || []).includes(tier)
}

export function getUpgradeMessage(feature) {
  const messages = {
    glbEditing: "Editing GLB lighting, tone, props, camera paths, and advanced scene controls requires Professional tier.",
    cameraPaths: "Camera path editing is available in Professional tier.",
    props: "Scene props and advanced environment controls are available in Professional tier.",
    advancedResearch: "Researcher measurements, evidence mode, and deeper data require Premium or Professional tier.",
    downloadModel: "Downloads require Standard, Premium, or Professional access.",
    saveDiscovery: "Saving discoveries requires Standard, Premium, or Professional access."
  }

  return messages[feature] || "Upgrade to unlock this feature."
}
