# 02 — Lifecycle-safe subscriptions

**What to build:** Give core consumers a safe subscription lifecycle that works for every supported field key, cleans up idempotently, avoids accidental duplicate callbacks, and lets existing consumers migrate without an immediate rewrite.

**Blocked by:** 01 — Atomic form commits.

**Status:** ready-for-agent

- [ ] Preferred whole-form and per-field subscription interfaces return idempotent unsubscribe functions.
- [ ] Listener storage is prototype-safe and supports keys such as `toString`, `constructor`, `__proto__`, an empty string, and supported numeric keys.
- [ ] Registering the same callback more than once for the same target does not create duplicate notifications.
- [ ] Unsubscribing an absent or already removed callback is safe.
- [ ] Existing paired `on` and `off` methods remain available as compatibility wrappers over the new subscription behavior.
- [ ] Removing or adding a listener during dispatch has documented snapshot semantics and does not corrupt the current cycle.
- [ ] The public subscription interface does not expose the internal listener registry.
- [ ] Public-interface tests cover subscription, duplicate registration, cleanup, legacy compatibility, unusual field keys, and listener changes during dispatch.

