# Determinism & reading build failures (reference)

## Why determinism

The platform compiles `product/product.config.ts` to a Manifest IR and computes
a hash. It builds **twice** and rejects the push if the hashes differ. This
guarantees the same source always yields the same product. A non-deterministic
module cannot be published.

## Sources of non-determinism (remove these from the product module)

- `Date.now()`, `new Date()`, any time-based value
- `Math.random()` or any RNG
- Network calls / `fetch`
- File or environment reads (`process.env`, reading files at module load)
- Iteration over unordered structures whose order isn't fixed
- Any value that changes between two runs of the same code

If a value must vary per environment, express it through the product's
environment configuration in the manifest — never by reading ambient state at
build time.

## Debugging a hash mismatch

1. Run `farthershore build` twice locally and diff the two `product-build.json`
   outputs (or the `irHash`). The differing fields point at the offending
   declaration.
2. Trace those fields back to the decorator/value that produced them.
3. Replace the dynamic value with a static one (or move it to env config).

## Reading other build failures

`farthershore build` exits non-zero with a diagnostic, and the
`farthershore/build` GitHub check posts the same reason as a comment. Map the
message to the fix:

| Symptom | Fix |
| --- | --- |
| hash mismatch / "non-deterministic" | remove the dynamic value (above) |
| duplicate plan/meter key | rename so keys are unique |
| capacity decreased / limit removed | not allowed — keep capacity ≥ current, or add a new plan instead |
| plan has no revenue | add a price/meter/grant, or mark the plan `free` |
| exceeds caps | consolidate — see the product's `AGENTS.md` for the limits |
| schema/validation error | fix the field the validator names |

Always fix locally and re-run `farthershore build` to green before pushing
again.
