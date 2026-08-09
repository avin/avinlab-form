# Clean-Slate Public API

Status: ready-for-agent

## Problem Statement

The library currently carries two public designs at once. New disposer-returning subscriptions sit
beside legacy paired `on` and `off` methods, validation status is being added while the ambiguous
`isValid` boolean remains, React uses a compatibility shim for React 17, and published packages
produce CommonJS artifacts alongside the modern ESM entry point.

This compatibility surface makes the library larger and harder to explain, test, and evolve. It
also allows consumers to start new code on APIs that are already considered legacy. Because the
library is still pre-1.0, the desired product is a single deliberate contract designed as if no
previous public API had to be preserved.

## Solution

Publish one clean, breaking public API with no deprecation period and no migration aliases. Keep the
stable form controller, atomic readonly snapshots, deterministic updates, selective subscriptions,
render-safe validation, and explicit disposal because they are product properties. Remove API and
packaging choices whose only purpose is compatibility with the previous contract or older runtime
ecosystems.

Core forms will expose only disposer-returning subscriptions. Validation will expose one atomic
snapshot containing `status` and `errors`; it will not expose `isValid` or legacy validation event
methods. React will require React 18, use its built-in external-store API, and return render-facing
validation snapshots rather than a lifecycle controller. Packages will be ESM-only and will publish
only declared root entry points. The release will include `MIGRATE_TO_V5.md`, an exhaustive manual
upgrade guide covering every source, runtime, React, and package-configuration change consumers must
make when moving from the previous API.

## User Stories

1. As a new form consumer, I want one obvious subscription API, so that I do not have to choose between modern and legacy lifecycle styles.
2. As a new form consumer, I want every subscription call to return its cleanup function, so that ownership is explicit at the call site.
3. As a new form consumer, I want no deprecated methods in declarations or autocomplete, so that I cannot accidentally build new code on obsolete APIs.
4. As a maintainer, I want to remove compatibility wrappers rather than test them forever, so that the implementation has one lifecycle path.
5. As a validation consumer, I want one atomic validation snapshot, so that status and errors always describe the same validation result.
6. As a validation consumer, I want `unvalidated`, `valid`, and `invalid` to be the only readiness states, so that the contract is exhaustive.
7. As a validation consumer, I want no separate `isValid` boolean, so that an unvalidated form cannot be mistaken for a valid one.
8. As a validation consumer, I want the unvalidated snapshot to contain no stale errors, so that old results are never presented as current data.
9. As a validation consumer, I want a successful validation with no normalized errors to produce `valid`, so that readiness is explicit.
10. As a validation consumer, I want a successful validation with normalized errors to produce `invalid`, so that error display and readiness agree.
11. As a validation consumer, I want a validator exception to reset the public result to `unvalidated` and propagate, so that failure is visible without exposing stale validation data.
12. As a subscription consumer, I want validation listeners to receive the complete validation snapshot, so that callbacks do not need to re-read related controller properties.
13. As a subscription consumer, I want equivalent validation snapshots to be no-ops, so that deterministic render and notification guarantees remain intact.
14. As a core consumer, I want changing the validator to use a clearly named validator operation, so that the API speaks in current domain terms.
15. As a React developer, I want the validation hook to return render data rather than an imperative lifecycle controller, so that component code cannot dispose shared machinery accidentally.
16. As a React developer, I want the first render and server render to return an unvalidated snapshot without running user code, so that render remains pure.
17. As a React developer, I want validation to become valid or invalid only after the requested form and validator commit, so that abandoned renders have no side effects.
18. As a React developer, I want changing the form or validator to synchronously render an unvalidated snapshot for the new request, so that prior results are not displayed as current.
19. As a React developer, I want selective status and field-error readers, so that components subscribe only to the validation data they render.
20. As a React developer, I want no validity helper that hides the unvalidated state, so that submission logic explicitly checks for `valid`.
21. As a React 18 developer, I want the package to use React's built-in external-store API, so that an extra compatibility dependency is unnecessary.
22. As a package consumer, I want a clear React 18 minimum peer requirement, so that unsupported React versions fail during installation rather than at runtime.
23. As a modern JavaScript consumer, I want one ESM package format, so that package resolution and generated artifacts are predictable.
24. As a maintainer, I want to remove CommonJS build and smoke-test branches, so that the release pipeline verifies only the supported format.
25. As a TypeScript consumer, I want declarations for the clean API under modern Node and bundler resolution, so that removed APIs cannot leak through stale declaration files.
26. As a package consumer, I want undeclared deep imports to remain unavailable, so that internal modules can evolve freely.
27. As a documentation reader, I want examples to teach only the clean API, so that migration history does not obscure the product model.
28. As an upgrading consumer, I want one dedicated `MIGRATE_TO_V5.md` guide, so that I can update every affected call site without reconstructing the breaking changes from git history.
29. As a maintainer, I want tests for removed APIs deleted rather than rewritten as implementation tests, so that the suite protects the intended contract only.
30. As a maintainer, I want compile-time assertions that removed exports are unavailable, so that compatibility surface cannot accidentally return.
31. As a maintainer, I want the breaking release version chosen before publication, so that consumers receive an honest compatibility signal.
32. As a maintainer, I want both packages released on the same clean-slate version line, so that the React adapter cannot install an incompatible core package.
33. As a performance-sensitive consumer, I want stable controller identity and selective subscriptions preserved, so that deleting legacy APIs does not change the product's render model.
34. As a correctness-sensitive consumer, I want atomic commits, `Object.is` equality, deterministic notification order, and queued reentrant updates preserved, so that clean slate does not mean losing established guarantees.
35. As a server-rendering consumer, I want hydration-safe form watchers preserved, so that removing runtime compatibility does not weaken React correctness.
36. As a maintainer, I want only explicitly supported environments represented in peer metadata and release tests, so that package claims match evidence.
37. As an upgrading core consumer, I want an explicit old-to-new mapping for every removed subscription method, so that cleanup ownership remains correct after migration.
38. As an upgrading validation consumer, I want an explicit mapping from separate errors and `isValid` reads to the atomic snapshot, so that I handle unvalidated, valid, and invalid states correctly.
39. As an upgrading React consumer, I want an explicit mapping for changed and removed hooks, so that render behavior and submission gating remain correct.
40. As an upgrading CommonJS consumer, I want exact ESM conversion instructions, so that imports, package configuration, and TypeScript settings work with the new packages.
41. As an upgrading React 17 consumer, I want the React 18 prerequisite called out before API edits, so that the platform upgrade is not discovered halfway through migration.
42. As an upgrading SSR consumer, I want the initial unvalidated behavior documented, so that server output and hydration expectations are updated deliberately.
43. As an upgrading consumer, I want copyable before-and-after examples and a final checklist, so that I can verify that no legacy usage remains.
44. As a maintainer, I want every after-migration example type-checked against packed V5 artifacts, so that the guide cannot recommend code the release does not support.

## Implementation Decisions

- This specification supersedes compatibility decisions in the stable-controller and validation-status
  efforts. Where those documents preserve an old method, field, runtime, or package format, this
  clean-slate contract wins.
- The stable mutable form controller and its readonly replaceable snapshots remain the central
  product model.
- The form controller exposes only `subscribe` and `subscribeField` for observation. Both return
  idempotent cleanup functions.
- Paired form lifecycle methods named `onUpdate`, `offUpdate`, `onUpdateField`, and
  `offUpdateField` are removed from runtime objects, public interfaces, declarations, tests, and
  documentation. They are not retained as deprecated aliases.
- Existing deterministic commit semantics remain: `Object.is` equality, no notifications for
  no-ops, changed-field notifications before one form notification, FIFO reentrant updates, and
  post-dispatch listener error reporting.
- The core validation controller exposes its one readonly current result as `snapshot`. Its status
  is `unvalidated`, `valid`, or `invalid`, and its errors belong to that same result.
- The separate `isValid` property is removed. Consumers determine readiness by comparing status with
  `valid`.
- An unvalidated snapshot contains an empty readonly error object. Last successful errors are not
  retained in the public current snapshot after the form, validator, or validation attempt becomes
  unvalidated.
- Validation errors are normalized into a new readonly snapshot. Empty normalized errors produce
  `valid`; non-empty normalized errors produce `invalid`.
- A validator exception publishes or leaves an unvalidated empty snapshot for the affected inputs
  and then propagates through the existing listener-error contract. Stale successful results are not
  exposed as current validation data.
- Validation subscriptions receive the complete validation snapshot. Notifications occur when
  status or normalized errors change, and equivalent complete snapshots are no-ops.
- Paired validation methods named `onValidate` and `offValidate` are removed without aliases.
- The validator-changing operation is named `setValidator`. The old `setValidation` name is not
  retained as an alias.
- Explicit validation, subscription, and idempotent disposal remain available on the core validation
  controller.
- The React validation hook returns a readonly render snapshot, not the core lifecycle controller.
  Components do not receive `dispose`, subscription, or validator-mutation methods from that hook.
- React exposes `useFormValidationError` for one field error and `useFormValidationStatus` for status.
  The old `useFormIsValid` boolean reader is removed rather than redefined.
- React renders an unvalidated empty snapshot for a newly requested form or validator until that
  exact request commits and validates. No validator or subscription side effect occurs during
  render.
- React 18 is the minimum supported React version. The adapter imports the built-in external-store
  API from React and removes the compatibility shim and its type dependency.
- Peer metadata requires React 18 or newer, retains an optional React DOM 18-or-newer peer for tested
  DOM consumers, and removes the untested React Native peer claim rather than advertising it
  speculatively.
- Both packages are ESM-only. CommonJS exports, `require` conditions, `.cjs` artifacts, CommonJS
  smoke consumers, and CommonJS-specific declarations are removed.
- Packages publish only their declared root entry point and package metadata. Deep source or build
  imports remain unsupported.
- TypeScript support remains for modern Node and bundler module resolution against the ESM entry
  point.
- Product documentation describes only the clean-slate contract. The old general migration document
  and deprecated-call recipes are removed, but the release includes one purpose-built
  `MIGRATE_TO_V5.md` guide for consumers crossing the breaking version boundary.
- `MIGRATE_TO_V5.md` is a finite upgrade document, not a compatibility promise. It explains how to
  rewrite consumer code but does not add aliases, fallbacks, runtime warnings, or transitional APIs
  to the library.
- The guide begins with platform and package prerequisites: coordinated package versions, React 18,
  ESM-only consumption, removal of the React Native peer claim, supported TypeScript resolution, and
  root-entry imports only.
- The guide contains an exhaustive old-to-new API matrix covering removed form subscription pairs,
  removed validation subscription pairs, `setValidation` to `setValidator`, separate validation
  fields to the atomic `snapshot`, removed `isValid`, the changed React validation return value,
  `useFormIsValid` replacement through status, and the new selective status reader.
- The guide explains behavioral changes that require more than a rename: unvalidated initial and SSR
  snapshots, source and validator switches, empty errors while unvalidated, validator exceptions,
  complete-snapshot subscription payloads, and cleanup through returned disposers.
- The guide includes CommonJS-to-ESM package and TypeScript configuration instructions, replacement
  of `require` with ESM imports, and removal of undeclared deep imports.
- Every migration topic includes concise before-and-after consumer examples. After examples are
  executable or extracted into checked examples and compile against the packed V5 declarations.
- The guide ends with a mechanical migration checklist and commands consumers can use to type-check,
  test, and search their codebase for removed names.
- Both packages move together from `0.4.x` to `0.5.0` because the change is deliberately breaking in
  the current pre-1.0 version line. The React package depends on the `0.5.x` core line.
- No runtime warnings, compatibility adapters, fallback exports, or temporary feature flags are
  added. Consumers either use the clean API or remain on the previous release line.

## Testing Decisions

- Tests exercise only public package root exports and rendered public hooks. Removed compatibility
  wrappers do not get replacement unit seams.
- The highest core form seam is a form created through the public core package. Existing atomic
  commit, equality, ordering, reentrancy, error, unusual-key, and cleanup behavior remains covered
  through `subscribe` and `subscribeField` only.
- The highest core validation seam is a public validation controller observed through its complete
  snapshot subscription. Tests cover unvalidated, valid, invalid, equivalent no-op, validator
  replacement, exception, explicit validation, and disposal behavior.
- The highest React seam is a consumer rendered with the public watcher, validation snapshot hook,
  status reader, or field-error reader. Tests cover first render, commit, source and validator
  changes, abandoned render, Strict Mode, unmount, SSR, hydration, and selective render counts.
- Compile-time contract tests assert the clean exported names and assert that legacy lifecycle
  methods, `isValid`, the boolean validity hook, and the old validator-changing name are absent.
- Package declaration tests run under modern Node and bundler ESM resolution.
- Packed-consumer tests install produced tarballs and exercise ESM runtime imports, React 18 peer
  resolution, declarations, root exports, and rejection of undeclared deep imports.
- The artifact manifest asserts that no CommonJS bundle, CommonJS declaration, compatibility shim,
  or undeclared entry point is published.
- Documentation examples are compiled against only the clean public API.
- Every after example published in `MIGRATE_TO_V5.md` is compiled against packed V5 declarations;
  examples covering runtime behavior also execute against the packed packages.
- A migration coverage check accounts for every removed or renamed public runtime member, type,
  export, package condition, peer requirement, and documented behavior in the V5 guide.
- Release checks run from a clean checkout and after builds so deleted legacy artifacts cannot survive
  from an earlier build and make tests pass accidentally.
- Existing public behavioral and render-count tests are prior art. Tests whose sole purpose is legacy
  compatibility are deleted; tests for preserved product guarantees are migrated to the clean seams.

## Out of Scope

- A deprecation period, compatibility release, codemod, runtime alias, or automatic migration layer.
- Supporting React 17 or older React versions.
- Supporting CommonJS `require` or publishing dual package formats.
- Async validation, cancellation, debounce, races, or a `validating` status.
- Submission orchestration, touched, dirty, visited, or field-array state.
- Replacing the stable form controller with React state or immutable controller instances.
- Removing SSR or hydration correctness.
- Restoring deep imports or adding new package subpaths.
- Preserving the previous package version or pretending the change is patch-compatible.

## Further Notes

- "Clean slate" applies to public compatibility baggage, not to established correctness invariants.
- `valid` is the only validation status that permits submission. `unvalidated` is not a successful
  empty validation result.
- Removing stale errors on an unvalidated transition is intentional: the current snapshot contains
  only current truth, not diagnostic history.
- Consumers that require the previous API, React 17, or CommonJS remain on the previous release line.
- Release notes link directly to `MIGRATE_TO_V5.md`; the guide describes consumer rewrites without
  offering aliases that prolong the old contract.
