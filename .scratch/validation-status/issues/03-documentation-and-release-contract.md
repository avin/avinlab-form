# 03 — Validation status documentation and release contract

Status: wontfix

Superseded by: `../../clean-slate-public-api/issues/05-rewrite-public-contract.md`

Blocked by: 01 — Core validation status contract; 02 — Render-safe React validation status.

**What to build:** Document the status model, protect it in published declarations and artifacts,
and make the compatibility implications explicit before release.

- [ ] Document unvalidated, valid, and invalid as freshness states for the current form and validator.
- [ ] Show status as the authoritative gate for submission and validation-message visibility.
- [ ] Explain that initial React and server renders are deliberately unvalidated.
- [ ] Explain that errors and validity may retain the last successful diagnostic snapshot after a validator exception while status is unvalidated.
- [ ] Document status-only subscriber notifications and their effect on callback counts.
- [ ] Add migration guidance for consumers currently treating `isValid: true` as proof that validation ran.
- [ ] Add compile-time contracts for the readonly union and public package exports.
- [ ] Extend packed ESM, CommonJS, and TypeScript consumers to exercise core and React status imports.
- [ ] Record an explicit semantic-versioning decision before publishing the change.
