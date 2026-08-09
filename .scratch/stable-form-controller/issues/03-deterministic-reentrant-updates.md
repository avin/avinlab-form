# 03 — Deterministic reentrant updates

**What to build:** Make updates triggered by user listeners deterministic and lossless. Every callback should receive snapshots belonging to its own transaction, nested updates should run in FIFO order after the current notification cycle, and one failing integration should not prevent others from observing committed state.

**Blocked by:** 02 — Lifecycle-safe subscriptions.

**Status:** ready-for-agent

- [ ] Every notification carries immutable local current and previous snapshots from the commit that produced it.
- [ ] An update requested during a listener is queued until the current notification cycle completes.
- [ ] Queued updates execute FIFO and calculate their transition from the latest committed snapshot when they begin.
- [ ] Reentrant field and whole-form listeners observe every distinct transition exactly once and in documented order.
- [ ] All listeners registered for the current event are attempted even when one throws.
- [ ] One listener failure is surfaced after dispatch; multiple failures are surfaced as an `AggregateError` after dispatch.
- [ ] Listener failures do not roll back an already committed values snapshot.
- [ ] Public-interface tests assert complete event sequences, queue ordering, nested no-ops, and single and multiple listener failures without inspecting queue internals.

