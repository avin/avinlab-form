# 01 — Atomic form commits

**What to build:** Make every form update an atomic, observable transition while preserving the form controller's stable identity. Consumers should see consistent current and previous readonly snapshots, one equality policy, and exactly one deterministic notification cycle for each real change.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] The same form controller object is retained across every update and React rerender.
- [ ] `setValue` and full-replacement `setValues` compare each top-level field with `Object.is`.
- [ ] A no-op changes neither `values` nor `prevValues` and emits no field or form notification.
- [ ] A successful commit replaces `values` and records the immediately preceding committed snapshot in `prevValues`.
- [ ] Changed field listeners run once per changed field before one whole-form notification.
- [ ] `setValues` never emits the duplicate whole-form notification present in the current implementation.
- [ ] Current and previous snapshots are readonly in the public type surface and shallow-frozen in development builds.
- [ ] Nested values are treated as immutable field values and must be replaced to produce a change.
- [ ] Public-interface tests cover primitives, `NaN`, `-0`, same and different object references, dates, maps, sets, arrays, no-ops, event counts, and notification order.

