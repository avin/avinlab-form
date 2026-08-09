# 05 — Disposable validation controller

**What to build:** Make synchronous validation a predictable derived controller with readonly snapshots and an explicit lifecycle. It should never expose impossible state, mutate user-owned errors, retain itself after disposal, or leave errors calculated by an obsolete validator.

**Blocked by:** 02 — Lifecycle-safe subscriptions.

**Status:** ready-for-agent

- [ ] A validation controller without a configured validator exposes an empty readonly error snapshot and `isValid: true`.
- [ ] A validator receives the current and previous form snapshots and remains synchronous for this feature.
- [ ] Validation normalizes into a new readonly snapshot, omits top-level `undefined` entries, and never mutates the returned user object.
- [ ] Equivalent normalized errors retain observable stability and emit no validation notification.
- [ ] Changing the validator invalidates the old result and recalculates the current form snapshot at documented timing.
- [ ] Validation subscriptions return idempotent unsubscribe functions.
- [ ] The controller exposes idempotent disposal and stops responding to form commits after disposal.
- [ ] Validation listener types preserve the consumer's concrete error shape.
- [ ] Public-interface tests cover missing and changed validators, frozen and shared error objects, unchanged errors, exact event counts, disposal, and validation exceptions.

