# DigitalHut social-layer reaction evidence — 2026-07-17

## Decision

The Social and External Distribution System advances to **provisional Rank 4**. The pressured bridge is deployed, the authenticated Cloudflare tunnel is live, Mastodon OAuth and two provider deliveries are receipted, bounded release-event publishing is active, and application, Redis, MySQL, and tunnel restart reactions preserved the same provider receipt. Rank 5 is withheld because Cloudflare Access enforcement, a source-driven full container recreation, five independent automatic release receipts, and attributed external-return reactions remain incomplete.

## Public proof statement

DigitalHut established its first authenticated private-to-public infrastructure route: Cloudflare accepts HTTPS for `social.digitalhut.app` and carries it through an authenticated outbound tunnel to the local Mixpost service without opening an inbound router port. This is legitimate Rank 3 runtime evidence. It is not evidence of higher rank, business impact, audience identity, or protection against unnamed threats; promotion still requires repeated restart, access-control, recovery, and attributed reaction tests.

## Reaction receipts

| Receipt | Result | Rank meaning |
| --- | --- | --- |
| Docker Desktop cold start | Existing `digitalhut-social`, MySQL, and Redis containers returned under `unless-stopped` policies | Local restart survival evidence only |
| Database persistence | Existing database returned with 19 Mixpost tables and user records after restart | Local durable-state evidence |
| Queue runtime | Laravel Horizon, the default worker, and the `publish-post` worker were running | Queue-capability evidence; no post was queued or published |
| Redis persistence | A bounded probe survived a Redis container restart and was deleted afterward | Local queue-store recovery evidence |
| Upload storage | A bounded media probe survived an application-container restart and was deleted afterward | Local media-volume recovery evidence |
| Login behavior | `/mixpost/login` rendered and authenticated locally | Local login-path evidence only |
| Default credential guard | The image-created `admin@example.com` default password was replaced with a strong random value after the default credential was confirmed to work | Required security correction before exposure |
| OAuth route | Mixpost exposes `GET|HEAD mixpost/callback/{provider}` | Route-existence evidence only; callback origin and provider exchange remain unverified |
| Application URL | Recreated application container reports `https://social.digitalhut.app` | Production URL configuration evidence |
| Cloudflare connector | Named `DigitalHut`; healthy with one Docker replica and four registered QUIC connections | Authenticated tunnel runtime evidence |
| Public route and DNS | `social.digitalhut.app` routes to `http://host.docker.internal:9000`; Cloudflare and Google resolvers returned the hostname | Public routing evidence |
| HTTPS behavior | Public `/` returned `302` to `https://social.digitalhut.app/mixpost` with secure cookies; the HTTPS login form rendered | HTTPS and canonical-redirect evidence |
| Default credential rejection | `admin@example.com` with the image default password was rejected over the public HTTPS login | Security reaction receipt |
| Automatic publishing | Owner-authorized bounded mode; verified production-release events only, without browsing-history or private-conversation surveillance | Rank 4 control evidence |
| Mastodon delivery receipt | Approved post published through `@zzzanthony123@mastodon.social`; provider post ID `116937841979484875`; no per-post errors | First controlled provider-delivery reaction; does not enable automatic publishing |
| Automatic Mastodon receipt | Release-evidence post published through `@zzzanthony123@mastodon.social`; provider post ID `116938228592904325`; no per-post errors | First automatic provider-delivery reaction |
| Application restart | Published post UUID `c4bfc6f0-2d26-48c5-a13e-3e9474bb9a78` and provider receipt survived application restart | Runtime survival reaction |
| Redis restart | The identical published provider receipt remained readable after Redis restart | Queue/cache recovery reaction |
| MySQL restart | MySQL returned healthy and the identical receipt remained durable | Database recovery reaction |
| Tunnel restart | Cloudflared restarted and public `/mixpost/login` returned HTTPS 200 | Route recovery reaction |
| Duplicate rejection | Re-enqueue using evidence `git:db4b9a886864` returned `duplicate` and created no new post | Dedupe safety reaction |
| Emergency pause | Runtime pause caused the event publisher to return `emergency-pause`; resume restored bounded mode | Owner control reaction |

## Rollback boundary

- Existing named volumes remain unchanged: `digitalhut-social-mysql`, `digitalhut-social-redis`, and `digitalhut-social-media`.
- The current application container remains bound only to `127.0.0.1:9000`; Cloudflare Tunnel is the only public route.
- The stopped `digitalhut-social-rollback-20260717` container preserves the prior `APP_URL=http://localhost:9000` definition.
- The active container uses the same MySQL, Redis, and media data stores and reports `APP_URL=https://social.digitalhut.app`.
- Do not connect provider accounts until Cloudflare Access, HTTPS, exact callback URLs, and owner login recovery are verified.

## Next ceremony

1. Put `social.digitalhut.app` behind Cloudflare Access and verify an unauthenticated browser cannot reach the Mixpost login directly.
2. Verify the real owner login and recovery path without exposing credentials in receipts.
3. Connect one provider through its real OAuth screen and verify the exact HTTPS callback exchange without publishing.
4. Recheck database, Redis, media, Horizon, tunnel, DNS, HTTPS, and login behavior after a full Docker Desktop restart.
5. Run five separately timestamped survival reactions before considering Rank 5 eligibility.

## Pressured drawer and branded-interface gaps

- The drawer still labels Mixpost as “Staged” and says the server follows Docker setup even though the local runtime now exists.
- The public `/updates` page is a deliberate human-share surface, not an operator connection to Mixpost.
- No authenticated DigitalHut operator bridge, account inventory, draft handoff, approval receipt, queue status, failure quarantine, or emergency-pause control is implemented in the frontend.
- Provider-specific OAuth adapters and exact production callback tests are absent.
- The source contains visible mojibake in the drawer arrow and updates loading text; this should be corrected before production UI verification.
- Mobile pressure/drag, keyboard, reduced-motion, focus, screen-reader, and production console checks still need browser receipts.
