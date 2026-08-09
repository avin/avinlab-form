# 01 — Remove legacy core API

Status: ready-for-agent

Blocked by: None — can start immediately.

**What to build:** Reduce the core form controller to the single disposer-returning subscription
contract while preserving its stable identity and deterministic commit behavior.

- [ ] Remove whole-form paired `on` and `off` lifecycle methods from runtime objects and public types.
- [ ] Remove field-level paired `on` and `off` lifecycle methods from runtime objects and public types.
- [ ] Keep only idempotent disposer-returning whole-form and field subscriptions.
- [ ] Migrate preserved behavioral tests to the clean subscription methods.
- [ ] Delete tests whose only purpose is legacy compatibility.
- [ ] Preserve atomic commits, `Object.is` equality, no-op behavior, notification order, listener error handling, unusual field keys, and FIFO reentrancy.
- [ ] Add compile-time assertions that removed lifecycle methods are unavailable.

