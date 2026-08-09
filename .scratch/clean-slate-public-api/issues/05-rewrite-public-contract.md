# 05 — Rewrite the public contract

Status: ready-for-agent

Blocked by: 01 — Remove legacy core API; 02 — Redesign the validation snapshot; 03 — Clean React API; 04 — Publish ESM-only packages.

**What to build:** Make product documentation, examples, type contracts, and release metadata
describe only the clean API, and publish one exhaustive `MIGRATE_TO_V5.md` upgrade guide without
adding compatibility code.

- [ ] Rewrite core and React documentation around the single clean subscription and validation snapshot contracts.
- [ ] Remove deprecated API recipes and compatibility notes from the product documentation.
- [ ] Remove the old general migration document and replace it with `MIGRATE_TO_V5.md`.
- [ ] Start the V5 guide with package-version, React 18, ESM, peer, TypeScript-resolution, and root-import prerequisites.
- [ ] Add an exhaustive old-to-new matrix for form subscriptions, validation subscriptions, `setValidator`, the atomic validation snapshot, removed `isValid`, changed React validation results, removed `useFormIsValid`, and the status reader.
- [ ] Explain initial and SSR unvalidated state, source and validator switching, validator exceptions, empty unvalidated errors, complete-snapshot callbacks, and disposer cleanup.
- [ ] Add CommonJS-to-ESM import, package metadata, and TypeScript configuration instructions.
- [ ] Add concise before-and-after examples for every migration topic.
- [ ] Compile every after example against packed V5 declarations and execute examples that demonstrate runtime behavior.
- [ ] Add a final consumer checklist with type-check, test, and removed-name search commands.
- [ ] Verify that every removed or renamed public member, export, package condition, peer requirement, and behavioral contract appears in the guide.
- [ ] Update executable examples to use status as the validation readiness gate.
- [ ] Remove examples and tests for the boolean validity hook and paired lifecycle methods.
- [ ] Add compile-time negative contracts for every removed public member and export.
- [ ] Document React 18 and ESM as explicit minimum platform requirements.
- [ ] Document that consumers requiring the old API, React 17, or CommonJS stay on the previous release line.
- [ ] Link release notes and package documentation to `MIGRATE_TO_V5.md` without reintroducing legacy API recipes into the main documentation.
- [ ] Record and apply the coordinated breaking pre-1.0 minor version for both packages.
- [ ] Run the complete release gate against only the clean public package surface.
