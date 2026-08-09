# 02 — Redesign the validation snapshot

Status: ready-for-agent

Blocked by: None — can start immediately.

**What to build:** Replace the compatibility-shaped validation surface with one atomic status-and-
errors snapshot and one disposer-returning observation contract.

- [ ] Export the closed unvalidated, valid, and invalid status type and the complete readonly validation snapshot type.
- [ ] Expose the complete current result through the readonly `snapshot` property.
- [ ] Replace separate current errors and boolean validity reads with the complete snapshot.
- [ ] Remove `isValid` from runtime objects, public types, declarations, tests, and documentation.
- [ ] Make unvalidated snapshots contain empty readonly errors rather than stale prior results.
- [ ] Derive valid and invalid from normalized errors after successful synchronous validation.
- [ ] On validator failure, expose an unvalidated empty snapshot and propagate the exception.
- [ ] Make subscriptions receive and compare complete validation snapshots.
- [ ] Remove paired validation `on` and `off` methods without aliases.
- [ ] Rename the validator-changing operation to `setValidator` and do not retain `setValidation` as an alias.
- [ ] Preserve explicit validation, idempotent disposal, normalization, and synchronous core behavior.
- [ ] Cover exact snapshot transitions, notifications, exceptions, disposal, public exports, and absence of removed members.
