"use client"

import { useEffect, useMemo, useState } from "react"
import SystemIntroOverlay from "./SystemIntroOverlay"
import GuidedTourControls from "./GuidedTourControls"
import QuickActionRail from "./QuickActionRail"
import AuthorityNudge from "./AuthorityNudge"
import PersistentLibraryRail from "./PersistentLibraryRail"
import UserModeSwitcher from "./UserModeSwitcher"
import WalletOnboardingPulse from "./WalletOnboardingPulse"

import {
  advanceTour,
  createInitialTourState,
  pauseTour,
  resumeTour,
  scrubTour,
  switchTourMode
} from "../lib/domain/tourState"

import { detectUserModeProfile, getModeNarrationStyle } from "../lib/domain/userModeProfile"
import { getAuthorityNudges } from "../lib/domain/authorityNudges"
import { buildRunnerContext } from "../lib/domain/runnerContext"

export default function UnifiedAppShell({
  activeFeed,
  subscription,
  events = [],
  libraryFeeds = [],
  onSelectFeed,
  onQuickAction,
  onWallet,
  children
}) {
  const [introDone, setIntroDone] = useState(true)
  const [tourState, setTourState] = useState(() => createInitialTourState(activeFeed))
  const [nudge, setNudge] = useState(null)
  const [internalEvents, setInternalEvents] = useState([])
  const combinedEvents = useMemo(() => [...events, ...internalEvents].slice(-40), [events, internalEvents])
  const userProfile = useMemo(() => detectUserModeProfile(combinedEvents), [combinedEvents])

  useEffect(() => {
    setTourState((state) => ({
      ...state,
      activeFeedId: activeFeed?.id || "",
      currentTourId: activeFeed?.id || state.currentTourId,
      currentNarration: activeFeed?.agentNarration || "",
      currentHighlight: activeFeed?.title || "",
      currentGlbUrl: activeFeed?.modelUrl || "",
      totalSeconds: activeFeed?.tourDuration || state.totalSeconds || 60
    }))
  }, [activeFeed])

  useEffect(() => {
    const timer = setInterval(() => setTourState((state) => advanceTour(state, 1)), 1000)
    return () => clearInterval(timer)
  }, [])

  const runnerContext = useMemo(() => {
    return buildRunnerContext({ activeFeed, tourState, userProfile, subscription })
  }, [activeFeed, tourState, userProfile, subscription])

  const nudges = useMemo(() => {
    return getAuthorityNudges({ activeFeed, userProfile, subscription })
  }, [activeFeed, userProfile, subscription])

  function recordEvent(type, detail = {}) {
    setInternalEvents((current) => [...current, { type, ...detail, at: Date.now() }].slice(-40))
  }

  function triggerInteraction(reason) {
    recordEvent(reason)
    setTourState((state) => pauseTour(state, reason))
  }

  function showFirstNudge() {
    if (nudges?.[0]) setNudge(nudges[0])
  }

  function handleAction(action, feed) {
    const eventType = action === "download" ? "download-click" : `${action}-click`
    recordEvent(eventType)
    if (action === "edit-glb") showFirstNudge()
    onQuickAction?.(action, feed, runnerContext)
  }

  function handleLibrarySelect(feed, options) {
    recordEvent("library-click", { feedId: feed?.id || feed?.query })
    onSelectFeed?.(feed, options)
  }

  function handleWallet(wallet) {
    recordEvent("wallet-check", { walletPresent: Boolean(wallet) })
    onWallet?.(wallet)
  }

  return (
    <main style={styles.shell}>
      {!introDone && <SystemIntroOverlay activeFeed={activeFeed} onComplete={() => { recordEvent("tour-start"); setIntroDone(true) }} />}

      <header style={styles.topbar}>
        <div>
          <b>DigitalHut Observatory</b>
          <span style={styles.sub}> {userProfile.label} / {tourState.mode}</span>
        </div>
        <div style={styles.status}>
          <span>Runner Active</span>
          <span>{subscription?.tier || "free"}</span>
          <span>{runnerContext.proEditingAllowed ? "Pro GLB" : "View Mode"}</span>
        </div>
      </header>

      <UserModeSwitcher mode={tourState.mode} onChange={(mode) => { recordEvent(`mode-${mode}`); setTourState((state) => switchTourMode(state, mode)) }} />

      <section style={styles.stage}>
        <div style={styles.rendererColumn}>
          <div style={styles.rendererWrap} onPointerDown={() => triggerInteraction("renderer-manual-control")}>
            {children}
          </div>
          <QuickActionRail activeFeed={activeFeed} subscription={subscription} onAction={handleAction} onNudge={setNudge} />
          <GuidedTourControls
            tourState={tourState}
            onPause={() => { recordEvent("tour-pause"); setTourState((state) => pauseTour(state, "user-pause")) }}
            onResume={() => { recordEvent("tour-resume"); setTourState((state) => resumeTour(state)) }}
            onRewind={() => { recordEvent("timeline-scrub"); setTourState((state) => scrubTour(state, (state.progressSeconds || 0) - 10)) }}
            onForward={() => { recordEvent("timeline-scrub"); setTourState((state) => scrubTour(state, (state.progressSeconds || 0) + 10)) }}
            onScrub={(seconds) => { recordEvent("timeline-scrub"); setTourState((state) => scrubTour(state, seconds)) }}
            onManual={() => { recordEvent("renderer-manual-control"); setTourState((state) => switchTourMode(state, "manual")) }}
            onSwitchTour={() => { recordEvent("tour-start"); setTourState((state) => switchTourMode(state, userProfile.preferredMode || "guided")) }}
          />
        </div>

        <aside style={styles.side}>
          <p style={styles.eyebrow}>Active Guidance</p>
          <h2 style={styles.title}>{activeFeed?.title || "Current Discovery"}</h2>
          <p style={styles.copy}>{getModeNarrationStyle(userProfile, activeFeed)}</p>
          <p style={styles.runner}>{runnerContext.runnerInstruction}</p>
          <WalletOnboardingPulse onWallet={handleWallet} />
          <PersistentLibraryRail activeFeed={activeFeed} feeds={libraryFeeds} onSelect={handleLibrarySelect} />
        </aside>
      </section>

      <AuthorityNudge nudge={nudge} onClose={() => setNudge(null)} onAction={() => setNudge(null)} />
    </main>
  )
}

const styles = {
  shell: { maxWidth: 1540, minHeight: "calc(100vh - 24px)", margin: "0 auto", padding: 14, color: "white", border: "1px solid rgba(103,232,249,.22)", borderRadius: 8, background: "rgba(2,6,23,.62)", display: "grid", gap: 12, boxSizing: "border-box" },
  topbar: { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", padding: "4px 0", flexWrap: "wrap" },
  sub: { color: "#94a3b8", fontSize: 13 },
  status: { display: "flex", gap: 8, flexWrap: "wrap", color: "#a5f3fc", fontSize: 12, fontWeight: 900 },
  stage: { display: "grid", gridTemplateColumns: "minmax(0,1.35fr) minmax(min(100%,320px),.65fr)", gap: 14, alignItems: "stretch", marginTop: 2 },
  rendererColumn: { minWidth: 0, display: "grid", gap: 10 },
  rendererWrap: { minHeight: "min(70vh,760px)", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(103,232,249,.25)", background: "rgba(2,6,23,.8)" },
  side: { minWidth: 0, borderRadius: 8, padding: 14, border: "1px solid rgba(148,163,184,.25)", background: "rgba(15,23,42,.72)", display: "grid", gap: 10, alignContent: "start" },
  eyebrow: { color: "#67e8f9", fontWeight: 900, fontSize: 12, textTransform: "uppercase", letterSpacing: 0, margin: 0 },
  title: { fontSize: 26, margin: "0 0 4px", letterSpacing: 0, overflowWrap: "anywhere" },
  copy: { color: "#e2e8f0", lineHeight: 1.45, margin: 0 },
  runner: { color: "#94a3b8", fontSize: 13, lineHeight: 1.45, margin: 0 }
}
