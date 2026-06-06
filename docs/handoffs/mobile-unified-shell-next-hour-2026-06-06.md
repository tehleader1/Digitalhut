# DigitalHut Mobile Codex Handoff

Date: June 6, 2026
Mission: Unified App Shell + Guided Tour Intelligence
Branch: `codex/unified-app-shell-tour-intelligence`
Base: `main` commit `8180ecaaaf6b8775cf29e31b5ba5c3a0690a0908`

## Goal

Make DigitalHut feel like one premium app, not a stack of scroll sections.

## Core Principle

Keep `activeFeed` as the brain.

```text
activeFeed
-> tourState
-> userModeProfile
-> runnerContext
-> renderer
-> library
-> quickActions
-> wallet/subscription authority
```

## Added This Pass

Domain layer:

```text
lib/domain/tourState.js
lib/domain/userModeProfile.js
lib/domain/authorityNudges.js
lib/domain/runnerContext.js
lib/domain/subscriptionGate.js
lib/domain/walletOnboarding.js
lib/domain/activeFeedFactory.js
```

Shell components:

```text
components/UnifiedAppShell.jsx
components/SystemIntroOverlay.jsx
components/GuidedTourControls.jsx
components/QuickActionRail.jsx
components/PersistentLibraryRail.jsx
components/UserModeSwitcher.jsx
components/AuthorityNudge.jsx
components/WalletOnboardingPulse.jsx
```

Integration:

```text
components/ModelRotationChooser.jsx
```

`ModelRotationChooser` now wraps its existing renderer in `UnifiedAppShell`. This avoids a full homepage rewrite while making the renderer the compact app stage.

## What The Shell Does

- Shows a memorable DigitalHut entry overlay.
- Keeps the main renderer as the stage.
- Keeps quick actions pinned under the renderer.
- Keeps library options visible in the side rail.
- Makes hover/focus over library items immediately hand the next feed to `activeFeed`.
- Adds guided tour pause, resume, rewind, forward, scrub, manual mode, and mode switching.
- Detects behavior from shell events: renderer moves, tour starts, timeline scrubs, quick actions, library clicks, wallet checks.
- Builds `runnerContext` from active feed, tour state, user profile, and subscription tier.
- Gates GLB editing behind Professional tier.
- Adds wallet onboarding authority states: extension missing, locked, confirm request, chain readable, gas ready.

## Mobile Verification

1. Open homepage and scroll to the observatory renderer.
2. Confirm intro overlay appears once and clears.
3. Confirm renderer sits inside `DigitalHut Observatory` shell.
4. Confirm quick actions are visible under renderer.
5. Confirm library rail remains visible on the right.
6. Hover or focus library choices and confirm the view changes quickly.
7. Use tour controls: pause, resume, back 10s, forward 10s, scrub, manual mode.
8. Click `Edit GLB` and confirm Pro upgrade nudge appears.
9. Check wallet box:
   - no extension: extension missing message
   - locked wallet: locked message
   - connect attempt: confirm in wallet extension
   - unlocked wallet: chain/block/gas reads
10. Confirm manual behavior does not force a presentation flow.

## Wallet Copy To Preserve

```text
Confirm in your digital wallet extension to continue.
Your wallet is currently locked. To continue, please unlock your wallet and try again.
Wallet, chain, and gas estimate are ready.
```

## Current Status

This is a next-hour audit branch. It has not been merged to `main` in this pass. The branch is cleanly ahead of `main` and ready for local/mobile verification before deployment.
