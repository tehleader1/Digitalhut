"use client"

import { useEffect, useMemo, useState } from "react"
import SystemIntroOverlay from "./SystemIntroOverlay"
import GuidedTourControls from "./GuidedTourControls"
import QuickActionRail from "./QuickActionRail"
import UserModeSwitcher from "./UserModeSwitcher"
import AuthorityNudge from "./AuthorityNudge"
import WalletOnboardingPulse from "./WalletOnboardingPulse"

import {
  advanceTour,
  createInitialTourState,
  pauseTour,
  resumeTour,
  scrubTour,
  switchTourMode
} from "../lib/domain/tourState"

import { detectUserModeProfile } from "../lib/domain/userModeProfile"
import { getAuthorityNudges } from "../lib/domain/authorityNudges"
import { buildRunnerContext } from "../lib/domain/runnerContext"

export default function UnifiedAppShell({
  activeFeed,
  subscription,
  events = [],
  onQuickAction,
  onWallet,
  children
}) {
  const [introDone, setIntroDone] = useState(true)
  const [tourState, setTourState] = useState(() => createInitialTourState(activeFeed))
  const [nudge, setNudge] = useState(null)
  const [internalEvents, setInternalEvents] = useState([])
  const [sideOpen, setSideOpen] = useState(false)
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

  function handleWallet(wallet) {
    recordEvent("wallet-check", { walletPresent: Boolean(wallet) })
    onWallet?.(wallet)
  }

  return (
    <main style={styles.shell}>
      {!introDone && <SystemIntroOverlay activeFeed={activeFeed} onComplete={() => { recordEvent("tour-start"); setIntroDone(true) }} />}

      <header style={styles.topbar}>
        <div style={styles.identity}>
          <b>DigitalHut Observatory</b>
          <span style={styles.sub}>{activeFeed?.title || "Current Discovery"}</span>
        </div>
        <div style={styles.status}>
          <span>{subscription?.tier || "free"}</span>
          <span>{tourState.mode}</span>
          <button type="button" onClick={() => setSideOpen((value) => !value)} style={styles.sideToggle}>{sideOpen ? "Hide" : "System"}</button>
        </div>
      </header>

      <section style={sideOpen ? styles.stageWithSide : styles.stageSolo}>
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

        {sideOpen && <aside style={styles.side}>
          <p style={styles.eyebrow}>System</p>
          <h2 style={styles.title}>{activeFeed?.title || "Current Discovery"}</h2>
          <p style={styles.copy}>{runnerContext.runnerInstruction}</p>
          <UserModeSwitcher mode={tourState.mode} onChange={(mode) => { recordEvent(`mode-${mode}`); setTourState((state) => switchTourMode(state, mode)) }} />
          <WalletOnboardingPulse onWallet={handleWallet} />
        </aside>}
      </section>

      <AuthorityNudge nudge={nudge} onClose={() => setNudge(null)} onAction={() => setNudge(null)} />
    </main>
  )
}

const styles = {
  shell: { width: "100%", height: "100%", minHeight: 0, maxWidth: 1640, margin: "0 auto", padding: 8, color: "white", border: "1px solid rgba(103,232,249,.18)", borderRadius: 8, background: "rgba(2,6,23,.5)", display: "grid", gridTemplateRows: "auto minmax(0,1fr)", gap: 8, boxSizing: "border-box", overflow: "hidden" },
  topbar: { display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", padding: "2px 0", flexWrap: "wrap", minHeight: 30 },
  identity: { minWidth: 0, display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" },
  sub: { color: "#94a3b8", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 520 },
  status: { display: "flex", gap: 7, flexWrap: "wrap", color: "#a5f3fc", fontSize: 12, fontWeight: 900, alignItems: "center" },
  sideToggle: { padding: "7px 9px", borderRadius: 8, border: "1px solid rgba(226,232,240,.2)", background: "rgba(226,232,240,.08)", color: "white", fontWeight: 900, cursor: "pointer" },
  stageSolo: { minHeight: 0, display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 8, alignItems: "stretch", overflow: "hidden" },
  stageWithSide: { minHeight: 0, display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(min(100%,280px),.28fr)", gap: 10, alignItems: "stretch", overflow: "hidden" },
  rendererColumn: { minWidth: 0, minHeight: 0, display: "grid", gridTemplateRows: "minmax(0,1fr) auto auto", gap: 7, overflow: "hidden" },
  rendererWrap: { minHeight: 0, height: "100%", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(103,232,249,.2)", background: "rgba(2,6,23,.8)" },
  side: { minWidth: 0, maxHeight: "100%", borderRadius: 8, padding: 11, border: "1px solid rgba(148,163,184,.2)", background: "rgba(15,23,42,.72)", display: "grid", gap: 9, alignContent: "start", overflow: "auto" },
  eyebrow: { color: "#67e8f9", fontWeight: 900, fontSize: 12, textTransform: "uppercase", letterSpacing: 0, margin: 0 },
  title: { fontSize: 22, margin: "0 0 3px", letterSpacing: 0, overflowWrap: "anywhere" },
  copy: { color: "#e2e8f0", lineHeight: 1.38, margin: 0 }
}
