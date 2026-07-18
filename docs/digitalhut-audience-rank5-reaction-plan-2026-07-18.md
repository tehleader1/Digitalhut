# DigitalHut audience compact-read Rank 5 reaction plan

## Scope and truth boundary

Component: `audience-compact-read-and-attribution`

This ceremony verifies transport, aggregate correctness, privacy, classification, and recovery. It does not prove unique people, provider-verified traffic, revenue, customer retention, or Cultural Value. Browser IDs, sessions, page views, events, returns, and conversions remain separate units.

The deployment source hash, Vercel deployment ID, Supabase migration state, before snapshot, after snapshot, operator, timestamps, and rollback target must be attached to every receipt.

## Deployment lock and rollback

Before release:

1. Confirm the combined commit contains the reviewed API route, snapshot allowlist, handler verifier, social truth correction, and audience-terminology gate.
2. Confirm no overlapping task is preparing a different API, Vercel, Supabase, or publishing change.
3. Archive the current production deployment ID and source hash as the rollback target.
4. Run the complete local verifier chain and record exact output.
5. Apply no destructive database change. Existing events and rollups are append-only evidence.

Rollback immediately if the endpoint returns HTML, exposes an identifier, loses `no-store`, reports broken arithmetic, regresses the legacy totals, or causes the main site to fail. Restore the prior Vercel deployment. Database evidence remains intact; do not truncate or rewrite history.

## Reaction A — compact production read

- Trigger: request `GET /api/audience-live` after the combined deployment is ready.
- Expected: HTTP 200 JSON; `Cache-Control: private, no-store, max-age=0`; `CDN-Cache-Control: no-store`; stable ETag; legacy totals and preferred browser-ID fields present.
- Forbidden: SPA HTML, cached public response, identifiers/hashes, missing truth flags, negative/non-integer counts.
- Pass evidence: response headers, sanitized payload, deployment/source IDs, latency, and matching Supabase aggregate read.

## Reaction B — exact-once duplicate and retry

- Trigger: controlled same-origin test submits the same synthetic `clientEventId` twice through the approved test path.
- Expected: one durable event and one applicable rollup movement; the duplicate is rejected or acknowledged without a second insert.
- Forbidden: two durable rows, two page-view increments, leaking test activity into a non-test source bucket.
- Pass evidence: before/after event and rollup counts plus duplicate response receipt.

## Reaction C — preview/test isolation

- Trigger: one clearly labeled preview/test page receipt through the controlled preview source.
- Expected: gross page views and preview/test views advance by one; non-preview page views do not advance; arithmetic remains exact.
- Forbidden: counting the receipt as public acquisition, a new verified person, or provider traffic.
- Pass evidence: before/after preview, non-preview, page-session, and source-bucket aggregates.

## Reaction D — malformed/cross-site privacy refusal

- Trigger: controlled synthetic requests exercise an invalid ID, oversized body, cross-site origin, and a privileged upstream row containing fake forbidden properties.
- Expected: writes are refused without durable movement; public reads discard every non-allowlisted property and continue returning aggregates only.
- Forbidden: saved malformed event, public identifier/hash, credential disclosure, endpoint crash, or changed audience totals.
- Pass evidence: response codes/reasons, unchanged durable counts, sanitized public payload, and verifier output. Never use real customer identifiers.

## Reaction E — first touch, continuation, and recovery

- Trigger: controlled labeled session enters through a known test acquisition source, records one page arrival, performs one deliberate approved continuation, then exercises a temporary delivery failure followed by retry recovery.
- Expected: one pinned first touch, one page session, one first landing, one deliberate continuation receipt, eventual exact-once recovery, and no unrelated source movement.
- Forbidden: source reassignment after first touch, double insert after retry, treating automatic events as deliberate continuation, or claiming Cultural Value from the controlled test.
- Pass evidence: ordered timestamps, source/landing row, session-safe aggregates, retry state, final event ID receipt, and unrelated-unit comparison.

## Rank decision

All five reactions must pass on the same reviewed component version with no unresolved forbidden reaction. Source tests remain source evidence; only the production receipts support Rank 4 or Rank 5. Rank 5 makes the component ceremony-ready for Mid-tier review but does not itself grant Rank 6. Rank 6 requires at least one additional valid reaction across another condition or independent day.

The four-dimension card is reported separately:

- Reliability: transport, exact arithmetic, retry, and rollback.
- Security: same-origin refusal, allowlisting, private service access, and no identifier leakage.
- Outcome: accurate first touch and deliberate continuation without attribution borrowing.
- Cultural Value: remains unproven by these controlled tests; it requires voluntary, privacy-safe return or useful continuation evidence outside preview/test activity.

Official rank remains the lowest required dimension. Anthony's two-agent orchestration assessment is recorded separately and never averaged into the software rank.
