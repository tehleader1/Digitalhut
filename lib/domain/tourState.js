export const TOUR_MODES = {
  MANUAL: "manual",
  GUIDED: "guided",
  AMBIENT: "ambient",
  RESEARCHER: "researcher",
  FAMILY: "family",
  GAMER: "gamer",
  REAL_ESTATE: "real-estate",
  DEVELOPER: "developer"
}

export function createInitialTourState(activeFeed = {}) {
  return {
    mode: TOUR_MODES.MANUAL,
    currentTourId: activeFeed.id || "digitalhut-main",
    currentStepIndex: 0,
    progressSeconds: 0,
    totalSeconds: activeFeed.tourDuration || 60,
    paused: false,
    interrupted: false,
    activeFeedId: activeFeed.id || "",
    currentCameraPose: activeFeed.cameraPose || null,
    currentNarration: activeFeed.agentNarration || "",
    currentHighlight: activeFeed.title || "",
    currentGlbUrl: activeFeed.modelUrl || "",
    libraryExpanded: false,
    userInteracting: false,
    lastInteractionAt: Date.now(),
    resumePromptVisible: false,
    pauseReason: ""
  }
}

export function pauseTour(state, reason = "user-interaction") {
  return {
    ...state,
    paused: true,
    interrupted: true,
    userInteracting: true,
    resumePromptVisible: true,
    pauseReason: reason,
    lastInteractionAt: Date.now()
  }
}

export function resumeTour(state) {
  return {
    ...state,
    paused: false,
    interrupted: false,
    userInteracting: false,
    resumePromptVisible: false,
    pauseReason: "",
    lastInteractionAt: Date.now()
  }
}

export function switchTourMode(state, mode) {
  return {
    ...state,
    mode,
    paused: mode === TOUR_MODES.MANUAL ? true : state.paused,
    resumePromptVisible: false,
    lastInteractionAt: Date.now()
  }
}

export function scrubTour(state, seconds) {
  const nextSeconds = Math.max(0, Math.min(seconds, state.totalSeconds || 60))

  return {
    ...state,
    progressSeconds: nextSeconds,
    paused: true,
    resumePromptVisible: true,
    pauseReason: "timeline-scrub",
    lastInteractionAt: Date.now()
  }
}

export function advanceTour(state, deltaSeconds = 1) {
  if (state.paused) return state
  const progressSeconds = Math.min((state.progressSeconds || 0) + deltaSeconds, state.totalSeconds || 60)
  return {
    ...state,
    progressSeconds,
    currentStepIndex: Math.floor(progressSeconds / 12)
  }
}
