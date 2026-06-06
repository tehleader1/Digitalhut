# DigitalHut Advanced Code Structure Audit

Date: June 6, 2026
Focus: Unified App Shell + Guided Tour Intelligence

## Finding

The current homepage already has an `activeFeed` spine. It controls title, query, selected feed, renderer handoff, market link, runner console, blog feature, wallet panel, and history writes.

The issue is not that DigitalHut lacks pieces. The issue is that the pieces still feel like scroll sections instead of one app stage.

## Correct Next Structure

```text
activeFeed
-> tourState
-> userModeProfile
-> runnerContext
-> renderer stage
-> persistent library
-> quick actions
-> wallet/subscription authority
```

## New Domain Layer

```text
lib/domain/tourState.js
lib/domain/userModeProfile.js
lib/domain/authorityNudges.js
lib/domain/runnerContext.js
lib/domain/subscriptionGate.js
lib/domain/walletOnboarding.js
lib/domain/activeFeedFactory.js
```

## Rule

Do not start by adding more routes. The page should feel alive first from a stronger in-app state model.

## Next Integration

1. Add `UnifiedAppShell` around the current homepage renderer zone.
2. Keep `activeFeed` as the only discovery brain.
3. Feed renderer, library, quick actions, wallet, subscription, and runner from the same object.
4. Add wallet verification as an authority pulse: extension detected, locked, confirmation pending, chain readable, gas ready.
5. Keep GLB editing behind Pro tier.
