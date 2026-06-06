export function buildRunnerContext({ activeFeed, tourState, userProfile, subscription }) {
  return {
    activeFeedId: activeFeed?.id,
    activeFeedTitle: activeFeed?.title,
    activeFeedCategory: activeFeed?.category,
    visualMode: activeFeed?.visualMode,
    modelUrlPresent: Boolean(activeFeed?.modelUrl),
    previewImagePresent: Boolean(activeFeed?.previewImage),
    tourMode: tourState?.mode,
    tourProgressSeconds: tourState?.progressSeconds,
    userProfileType: userProfile?.type,
    userIntent: userProfile?.intent,
    subscriptionTier: subscription?.tier || "free",
    proEditingAllowed: subscription?.tier === "pro",
    runnerInstruction: createRunnerInstruction(activeFeed, tourState, userProfile, subscription)
  }
}

function createRunnerInstruction(activeFeed, tourState, userProfile, subscription) {
  const title = activeFeed?.title || "current discovery"

  if (userProfile?.type === "manual-builder") {
    return `User is in manual builder mode. Prioritize fast discovery, downloads, related assets, and project utility for ${title}. Avoid forcing presentation.`
  }

  if (userProfile?.type === "family-presentation") {
    return `User prefers ambient guided presentation. Keep narration family-friendly, simple, and engaging for ${title}. Pause politely when user interacts.`
  }

  if (userProfile?.type === "researcher") {
    return `User prefers researcher mode. Provide details, source context, measurements, coordinates, and evidence for ${title}.`
  }

  if (userProfile?.type === "journalist-reviewer") {
    return `User may be reviewing DigitalHut. Explain how renderer, runner, library, wallet, and activeFeed work together using ${title} as evidence.`
  }

  if (userProfile?.type === "authority-shopper") {
    return `User is checking authority. Keep wallet, gas, subscription tier, and Pro editing gates clear for ${title}.`
  }

  if (subscription?.tier === "pro" && tourState?.mode === "developer") {
    return `Professional developer mode active. Surface GLB editing, camera paths, props, annotations, runner context, and export controls for ${title}.`
  }

  return `Guide the user through ${title} with balanced observatory narration and relevant quick actions.`
}
