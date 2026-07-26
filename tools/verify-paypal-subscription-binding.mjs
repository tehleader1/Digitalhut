import assert from "node:assert/strict"
import {
  mintPaypalSubscriptionBinding,
  verifyPaypalSubscriptionBinding
} from "../api/provider-status.js"

const now = Date.parse("2026-07-26T15:00:00.000Z")
const rootSecret = "test-only-paypal-binding-secret"
const userId = "35d5fe7c-3479-4d7c-b521-f9e73a66e1a3"
const otherUserId = "9f0b121a-187d-49a4-a202-15016d6b9821"
const binding = mintPaypalSubscriptionBinding({
  userId,
  tierId:"tier-premium",
  rootSecret,
  now,
  nonce:"testNonce123"
})

assert.ok(binding.token.length <= 127, "PayPal custom_id must stay within the provider limit")
assert.equal(
  verifyPaypalSubscriptionBinding({
    token:binding.token,
    userId,
    tierId:"tier-premium",
    rootSecret,
    now:now + 1_000
  }).valid,
  true,
  "valid account and tier binding must verify"
)
assert.equal(
  verifyPaypalSubscriptionBinding({
    token:binding.token,
    userId:otherUserId,
    tierId:"tier-premium",
    rootSecret,
    now:now + 1_000
  }).reason,
  "paypal-account-binding-user-mismatch",
  "a different signed-in user must not claim the subscription"
)
assert.equal(
  verifyPaypalSubscriptionBinding({
    token:binding.token,
    userId,
    tierId:"tier-pro",
    rootSecret,
    now:now + 1_000
  }).reason,
  "paypal-account-binding-tier-mismatch",
  "a subscription must not unlock a different tier"
)
assert.equal(
  verifyPaypalSubscriptionBinding({
    token:binding.token,
    userId,
    tierId:"tier-premium",
    rootSecret,
    now:now + 60 * 60 * 1_000 + 1
  }).reason,
  "paypal-account-binding-expired",
  "expired bindings must fail closed"
)

const tamperedToken = `${binding.token.slice(0, -1)}${binding.token.endsWith("A") ? "B" : "A"}`
assert.equal(
  verifyPaypalSubscriptionBinding({
    token:tamperedToken,
    userId,
    tierId:"tier-premium",
    rootSecret,
    now:now + 1_000
  }).reason,
  "paypal-account-binding-invalid",
  "tampered bindings must fail closed"
)
assert.equal(
  verifyPaypalSubscriptionBinding({
    token:"",
    userId,
    tierId:"tier-premium",
    rootSecret,
    now
  }).reason,
  "paypal-account-binding-missing",
  "subscriptions without a DigitalHut binding must not grant access"
)

console.log("PayPal subscription account binding: 6 PASS")
