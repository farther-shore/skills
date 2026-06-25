# Escalation decision tree (reference)

You operate a FartherShore product through the **public CLI/MCP and its repo**
only. Many failures live in platform infrastructure or the billing pipeline,
which you cannot see or touch from there. This tree keeps you from making things
worse.

## Step 1 — classify the symptom

| Symptom | Likely owner | Action |
| --- | --- | --- |
| Bad/broken frontend release | you | roll back (frontend skill) — **auto** |
| Runtime token leaked/expired; backend auth failing because of it | you | rotate (backends skill) — **auto** |
| A change you pushed is wrong / a plan is misconfigured | you | revert manifest + release, or correct plan in code + release — **confirm** |
| Build/checks failing on your push | you | fix per the product-as-code skill — **auto** |
| Subscribers not activating after paying; checkout completes but nothing happens | platform | **escalate** |
| Valid API keys rejected across the board; auth failing platform-wide | platform | **escalate** |
| Usage/metering not recording despite real traffic | platform | **escalate** |
| Errors across *multiple* products at once | platform | **escalate** |
| Stripe connection shows revoked/restricted | human (re-onboard) | **escalate** to the user |

## Step 2 — if it's yours

Apply the relevant skill. Prefer the **reversible** action (rollback, token
rotation) before the heavier one (re-release). Verify with the read-only status
commands afterward.

## Step 3 — if it's platform-side, escalate cleanly

1. Stop touching live state. Do **not** retry destructive/speculative actions.
2. Collect: product + environment, exact CLI/MCP output and error `code`s,
   timeline (first symptom → detection), and the read-only checks you ran.
3. Hand it to the human / FartherShore support with that evidence.
4. Wait. Resume only when told the platform-side issue is resolved.

## Hard rules

- Never attempt to operate FartherShore's internal infrastructure — you have no
  authorized surface for it, and there is none in the public CLI/MCP.
- If you've auto-remediated the *same* issue twice and it recurs, stop and
  escalate — the root cause is deeper than your fix.
- When unsure whether something is yours or the platform's: **escalate**. A
  false escalation costs a message; a wrong fix on a live product costs
  subscribers.
