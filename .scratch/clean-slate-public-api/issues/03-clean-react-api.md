# 03 — Clean React API

Status: ready-for-agent

Blocked by: 01 — Remove legacy core API; 02 — Redesign the validation snapshot.

**What to build:** Make the React adapter expose only render-facing snapshots and selective readers
on the React 18 external-store contract.

- [ ] Require React 18 and use React's built-in external-store API.
- [ ] Remove the React 17 compatibility shim and its runtime and type dependencies.
- [ ] Make the complete validation hook return the readonly validation snapshot rather than a lifecycle controller.
- [ ] Add `useFormValidationStatus` as the selective validation-status reader.
- [ ] Preserve the selective field-error reader against the new snapshot.
- [ ] Remove `useFormIsValid` from exports, declarations, tests, examples, and documentation.
- [ ] Return unvalidated empty data on initial render, SSR, and newly requested form or validator renders.
- [ ] Validate only after the exact request commits and preserve abandoned-render purity.
- [ ] Preserve form-watcher source switching, Strict Mode cleanup, SSR/hydration behavior, and selective render guarantees.
- [ ] Require React 18+, retain the tested optional React DOM 18+ peer, and remove the untested React Native peer claim.
- [ ] Cover the clean hooks through public React exports and exact render-count tests.
