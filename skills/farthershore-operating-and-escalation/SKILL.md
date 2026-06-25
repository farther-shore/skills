---
name: farthershore-operating-and-escalation
description: Use when monitoring a live FartherShore product, checking its health, investigating a problem, or deciding whether something is yours to fix versus a platform-side issue to escalate. Defines the recurring operate loop, the builder-observable health signals, and the hard line on what an agent must NOT try to fix.
metadata:
  version: 1.0.0
---

# Operating a live product & knowing when to escalate

Day-2 operation: keep a live product healthy through the public surface, and —
critically — recognize the failures you **cannot** fix and escalate them instead
of flailing. Read [farthershore-overview](../farthershore-overview/SKILL.md) first.

## What you can inspect (the only signals you have)

You operate a product through the public CLI/MCP. Your health picture comes from:

```bash
farthershore product status <product> --format json   # lifecycle, release, is-it-live
farthershore product list --format json                # all products + status
farthershore usage summary <product> --format json     # recent usage / metering
farthershore frontend status <product> --format json   # current release, builds
farthershore backend list <product> --format json      # backend health, last-seen
```

(Run each with `--help` for scoping flags like `--env`.)

## Healthy vs degraded

- **Healthy**: product `live`/ACTIVE, a recent successful frontend release, the
  default backend healthy and recently seen, usage flowing in line with traffic.
- **Investigate**: usage flat/zero despite known traffic; a frontend build stuck
  for a long time; a backend unhealthy or not seen recently; `product status`
  showing the latest pushed change hasn't taken effect well past the normal
  propagation window.

## The recurring operate loop

- **Routinely**: check `product status`, `usage summary`, `frontend status`, and
  `backend list` for each product. Confirm metering is flowing and the live
  release is the intended one.
- **On a planned change**: drive it through the build/operate loops in the other
  skills (preview → confirm → production release).
- **On an anomaly**: triage with the decision tree below.

## What is yours to fix vs escalate

This is the most important judgment in this skill. You operate through the
public surface only. Use [references/escalation.md](references/escalation.md) for
the full decision tree. The short version:

**You can fix (auto / confirm):**
- A bad frontend release → roll back (auto).
- A compromised/expired runtime token → rotate (auto; see backends skill).
- A bad product/contract change you pushed → revert the manifest + release
  (confirm).
- A misconfigured plan you authored → correct in code + release (confirm).

**You must NOT try to fix — escalate (report and stop):**
- Subscribers not activating after a successful payment; webhooks clearly not
  being processed.
- Valid API keys being rejected platform-wide; usage not recording despite
  traffic; widespread errors across products.
- Anything pointing at FartherShore's own infrastructure or billing pipeline.

These are **platform-side**. You have no public surface to repair them, and
poking at them does harm. Capture the evidence and escalate.

## How to escalate

Gather and hand to the human / FartherShore support:
- the affected product (and environment),
- what you observed (the exact CLI/MCP output, error `code`s),
- when it started and how you noticed,
- what you already tried (read-only checks only).

Then **stop**. Do not retry destructive or speculative actions on a live product
while waiting.

## Autonomy

- **auto**: all the read/status checks; frontend rollback; token rotation.
- **confirm**: reverting a contract change, correcting a plan, anything that
  re-publishes to production.
- **escalate**: platform-side failures (above) — never attempt these.
