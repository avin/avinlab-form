# 01 — Core validation status contract

Status: wontfix

Superseded by: `../../clean-slate-public-api/issues/02-redesign-validation-snapshot.md`

Blocked by: None — can start immediately.

**What to build:** Add the public three-state validation status to the synchronous core controller
and make every status transition observable without weakening the existing errors, validity,
exception, or disposal contracts.

- [ ] Export the closed `unvalidated` / `valid` / `invalid` status type from the core package.
- [ ] Expose status as a readonly property of the public validation controller.
- [ ] Initialize controllers without a validator as unvalidated.
- [ ] Derive valid or invalid from the normalized error snapshot after every successful validation.
- [ ] Keep construction with a configured validator and `setValidation` synchronous.
- [ ] Mark the current validation inputs unvalidated when their validator throws while retaining the last successful errors and validity as stale diagnostic state.
- [ ] Notify subscribers for status-only transitions and preserve no-op behavior when both status and normalized errors are equivalent.
- [ ] Preserve disposal idempotence and the last readable validation snapshot after disposal.
- [ ] Cover transitions, exceptions, exact notifications, readonly types, and public exports through public-interface tests.
