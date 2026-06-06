# DigitalHut Mobile Codex Handoff

Date: June 6, 2026
Mission: Unified App Shell + Guided Tour Intelligence

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

- `lib/domain/tourState.js`
- `lib/domain/userModeProfile.js`
- `lib/domain/authorityNudges.js`
- `lib/domain/runnerContext.js`
- `lib/domain/subscriptionGate.js`
- `lib/domain/walletOnboarding.js`
- `lib/domain/activeFeedFactory.js`

## Next Mobile Verification

After components are wired:

1. Homepage should open like a compact app shell.
2. Intro overlay should make the visitor feel they entered DigitalHut.
3. Main renderer should be the stage.
4. Library should remain visible.
5. Quick actions should remain available.
6. Guided tour can pause, resume, rewind, forward, and scrub.
7. Manual users should not be forced into presentation.
8. Researchers should get source/data tone.
9. GLB editing should nudge Professional tier.
10. Wallet should feel live: extension, locked state, confirmation, chain, gas.

## Wallet Copy To Preserve

```text
Confirm in your digital wallet extension to continue.
Your wallet is currently locked. To continue, please unlock your wallet and try again.
Wallet, chain, and gas estimate are ready.
```
