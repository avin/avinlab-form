# 04 — Publish ESM-only packages

Status: ready-for-agent

Blocked by: 03 — Clean React API.

**What to build:** Remove dual-package compatibility and verify one declared ESM entry point for
each packed package.

- [ ] Remove CommonJS export conditions, entry metadata, build formats, declarations, maps, and artifacts.
- [ ] Remove CommonJS smoke consumers and CommonJS-specific release assertions.
- [ ] Keep modern Node and bundler TypeScript declaration checks against ESM tarballs.
- [ ] Keep package-root ESM runtime checks and rejection of undeclared deep imports.
- [ ] Assert the exact packed artifact manifest so stale CommonJS files cannot survive a prior build.
- [ ] Verify React 18 peer installation against the packed React package.
- [ ] Publish only supported, release-tested peer environments.
- [ ] Release both packages as `0.5.0` and align the React package to the `0.5.x` core line.
- [ ] Run artifact checks from a clean checkout and after build-order variations.
