# 02 — Render-safe React validation status

Status: wontfix

Superseded by: `../../clean-slate-public-api/issues/03-clean-react-api.md`

Blocked by: 01 — Core validation status contract.

**What to build:** Expose source-aware validation status in React without executing validation or
mutating shared controller state during render, and provide a selective reader for readiness UI.

- [ ] Report unvalidated on the initial render and server render without executing the validator.
- [ ] Transition to valid or invalid after the exact form and validator pair is committed and checked.
- [ ] Report unvalidated for a newly requested form source before presenting its completed result.
- [ ] Report unvalidated for a newly requested validator before presenting its completed result.
- [ ] Keep abandoned renders from changing the previously committed controller or status.
- [ ] Add a public selective status reader that rerenders only when status changes.
- [ ] Make the complete validation hook rerender for status-only transitions even when errors remain empty.
- [ ] Preserve cleanup, Strict Mode balance, disposal, source switching, and the existing error and validity selectors.
- [ ] Cover first render, SSR/hydration, source and validator switches, exceptions, abandoned renders, Strict Mode, and exact render isolation through public React tests.
