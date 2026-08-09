# Stable Form Controller and Predictable React Subscriptions

Status: ready-for-agent

## Problem Statement

The library has a valuable central property: a form is created once as a stable mutable controller, so consumers can safely keep it in dependency arrays and pass it through the application without its identity changing whenever values change. React rendering is opt-in through watchers rather than being driven by replacement of the form object.

The current implementation does not make that model reliable enough for production use. A single update can emit duplicate events, no-op updates can corrupt the previous snapshot, reentrant listeners can receive snapshots belonging to another transaction, some valid field names break the subscription registry, and equality rules differ between update methods. Public snapshots also appear writable even though direct mutation bypasses notifications and validation.

The React adapter reads an external mutable store with state and effects rather than with an external-store subscription contract. It can therefore display a snapshot from an old form or old field, miss an update between render and subscription, and retain validation subscriptions after unmount. Validation is also created and changed during render, can remain attached to the first form forever, may expose `undefined` errors despite its type, and mutates objects returned by user code.

Tests, examples, package checks, and documentation currently cover happy paths but do not protect the stable-controller identity, exact render isolation, subscription lifecycle, transaction semantics, or the published consumer experience. As a result, passing tests and builds do not guarantee that the main feature of the library remains intact.

## Solution

Keep the existing product model and make it explicit: `Form` remains one stable mutable controller for its lifetime, while `values`, `prevValues`, validation errors, and React-visible values are replaceable readonly snapshots.

All core updates will pass through one atomic commit pipeline with one equality policy, immutable event snapshots, deterministic notification ordering, prototype-safe listener registries, and queued reentrant commits. A successful commit will notify each affected field subscription once and the form subscription once. A no-op will not modify any snapshot or notify anyone.

The React package will become an adapter over the core store's `subscribe` and `getSnapshot` interfaces. Whole-form and per-field watchers will use React's external-store mechanism, preserving selective rendering and supporting source or selector changes without stale state or tearing. `useForm` will continue to return the same controller and will not subscribe its owner to value changes.

Validation will remain a derived controller with explicit subscription lifecycle, readonly snapshots, deterministic recalculation, and disposal. React validation hooks will not subscribe, mutate shared controllers, or execute user validation as an external side effect during render. Selective validation readers will allow a field error or validity indicator to update without forcing the entire form owner to render.

The public contract will be documented first-class and protected by behavioral, render-count, lifecycle, type-level, example, and packed-consumer tests. Existing method names will remain available where compatibility is practical; new disposer-returning subscription methods will become the preferred interface.

## User Stories

1. As a form library consumer, I want `form` to keep the same identity for its entire lifetime, so that I can safely pass it through props, contexts, memoized values, and dependency arrays.
2. As a React developer, I want changing a form value not to rerender the component that only created the form, so that large forms do not rerender from the root on every keystroke.
3. As a React developer, I want a field watcher to rerender only when its selected field changes, so that unrelated controls remain isolated.
4. As a React developer, I want a whole-form watcher to rerender exactly once per successful form commit, so that summaries and debugging views stay current without duplicate work.
5. As a React developer, I want switching a watcher from one field to another to return the new field's current value immediately, so that recycled components never display stale data.
6. As a React developer, I want switching a watcher to another form to return that form's current snapshot immediately, so that reusable screens can change their data source safely.
7. As a React developer, I want updates occurring around render and commit to be observed consistently, so that concurrent rendering does not produce tearing or missed changes.
8. As a server-rendering consumer, I want watchers to expose a defined server snapshot contract, so that rendering and hydration have predictable behavior.
9. As a consumer, I want `form.values` to always expose the latest committed snapshot, so that event handlers can read current state without waiting for React.
10. As a consumer, I want `form.prevValues` to represent the snapshot immediately before the latest successful commit, so that comparisons and transition logic remain meaningful.
11. As a consumer, I want a no-op `setValue` or `setValues` call to leave both current and previous snapshots unchanged, so that reads do not imply a transition that never happened.
12. As a consumer, I want `setValues` to emit one form update rather than two, so that autosave, analytics, validation, and network effects execute once.
13. As a consumer, I want field listeners to be called only for fields whose values changed, so that field-level work remains selective.
14. As a consumer, I want form and field notifications to have a documented deterministic order, so that dependent side effects are repeatable.
15. As a consumer, I want every listener callback to receive snapshots belonging to the transaction that triggered it, so that reentrant updates cannot rewrite the meaning of an earlier event.
16. As a consumer, I want an update triggered inside a listener to be queued deterministically, so that nested changes do not interleave two notification cycles.
17. As a consumer, I want one failing listener not to prevent the remaining listeners from seeing a committed update, so that independent integrations cannot silently desynchronize one another.
18. As a consumer, I want subscriptions to return an idempotent unsubscribe function, so that cleanup is colocated with subscription and cannot depend on preserving a callback reference elsewhere.
19. As an existing consumer, I want the current `on` and `off` methods to continue working during migration, so that correctness fixes do not require an immediate rewrite of every integration.
20. As a consumer, I want subscribing the same callback twice to have defined behavior, so that duplicate work is not an accidental implementation detail.
21. As a consumer, I want fields named `toString`, `constructor`, `__proto__`, an empty string, or numeric keys to work like other supported keys, so that JavaScript object prototype names do not crash the form.
22. As a consumer, I want `setValue` and `setValues` to use the same field equality policy, so that the chosen update method does not change whether an event is emitted.
23. As a consumer, I want equality to handle `NaN`, `-0`, object references, dates, maps, sets, and other field values predictably, so that legitimate changes are not silently discarded.
24. As a TypeScript consumer, I want values and previous values to be typed as readonly snapshots, so that direct mutation that bypasses the controller is caught at compile time.
25. As a JavaScript consumer, I want development builds to warn or fail early on direct top-level snapshot mutation, so that invalid usage is diagnosed near its source.
26. As a consumer of nested values, I want the immutable nested-value convention documented, so that I know to replace a field value rather than mutate an object behind the controller's back.
27. As a React developer, I want `useForm` to read initial values only when creating its controller, so that parent rerenders do not reset user input unexpectedly.
28. As a React developer, I want the one-time initial-value behavior documented with a clear synchronization recipe, so that changing props is not mistaken for resetting a form.
29. As a validation consumer, I want validation errors always to be a readonly object, so that runtime behavior matches the public type even before a validator is configured.
30. As a validation consumer, I want changing the validation function to recalculate the current snapshot deterministically, so that errors never remain based on an obsolete rule.
31. As a validation consumer, I want the library not to mutate the object returned by my validator, so that frozen, shared, or memoized error objects remain safe.
32. As a validation consumer, I want validation notifications only when the normalized error snapshot changes, so that equivalent results do not cause unnecessary work.
33. As a validation consumer, I want a validation controller to expose explicit disposal, so that long-lived forms do not retain validators that are no longer used.
34. As a React developer, I want mounting and unmounting a validation hook to attach and detach every underlying subscription, so that Strict Mode and repeated navigation do not accumulate work.
35. As a React developer, I want changing the form passed to a validation hook to disconnect the old source and validate the new source, so that reusable components do not remain bound to stale state.
36. As a React developer, I want validation setup to avoid externally visible side effects during render, so that abandoned or repeated renders cannot leak subscriptions or execute application logic unexpectedly.
37. As a React developer, I want to observe one field's validation error independently, so that an error label can update without rerendering the whole form owner.
38. As a React developer, I want to observe overall validity independently, so that submit controls can update without subscribing to the complete error object.
39. As a component-library author, I want the form component helper to relate the selected field type to the configured value and change props, so that invalid bindings fail during type checking.
40. As a component-library author, I want custom value and change attribute names reflected in the helper's public types, so that checkbox and non-DOM controls do not expose conflicting props.
41. As a component-library author, I want falsy but valid field keys to update correctly, so that runtime behavior matches the generic key type.
42. As a new user, I want the README to explain the stable-controller mental model before showing examples, so that I understand which reads are reactive and which are imperative.
43. As a new user, I want distinct recipes for uncontrolled controls, controlled form components, field watchers, whole-form watchers, and validation selectors, so that I can choose the smallest subscription needed.
44. As a new user, I want all documentation examples to be executable and type-checked, so that copy-and-paste code changes the intended field with the intended type.
45. As a maintainer, I want tests to assert render counts and controller identity, so that refactoring cannot accidentally replace the stable form with React state.
46. As a maintainer, I want tests to cover no-ops, event counts, notification order, reentrancy, listener errors, prototype-like keys, and cleanup, so that core transition semantics remain stable.
47. As a maintainer, I want Strict Mode and source-switching tests, so that React lifecycle regressions are detected before release.
48. As a maintainer, I want compile-time tests for the public generic interface, so that generated declarations cannot become less safe while runtime tests still pass.
49. As a package consumer, I want ESM, CommonJS, and TypeScript smoke projects to install the packed artifacts, so that release checks exercise what is actually published.
50. As a maintainer, I want examples to be included in type-checking and generated artifacts excluded from linting, so that the default quality commands are deterministic after any build order.
51. As a package consumer, I want package descriptions, repository links, license information, and migration notes, so that package purpose, ownership, and upgrade effects are clear.
52. As a performance-sensitive consumer, I want the cost model and render guarantees documented, so that I can choose whole-form or field-level subscriptions deliberately.

## Implementation Decisions

- The `Form` module remains a stable mutable controller. No successful value change replaces the controller object, and the React owner of the controller is not automatically subscribed to its values.
- Current values and previous values are readonly snapshots exposed through getters. A successful commit replaces the current snapshot and records the prior current snapshot as the previous snapshot.
- Direct writes to snapshots are not part of the interface. Top-level snapshots are shallow-frozen in development builds; nested field values follow an immutable replacement convention.
- `setValues` continues to mean full snapshot replacement rather than partial merge.
- `setValue` and `setValues` use `Object.is` as the default equality rule for each top-level field. New object references are changes even when deeply equal; nested mutation without replacement is unsupported.
- Every update method delegates to one internal atomic commit implementation. Equality is determined before any internal state is changed.
- A no-op commit changes neither current values nor previous values and emits no notification.
- A successful commit creates immutable local event snapshots before invoking user code.
- Changed field listeners run before the one whole-form notification. Multiple changed fields are dispatched in the stable key order of the committed next snapshot.
- Reentrant commits are queued FIFO until the current notification cycle has completed. Each queued commit observes the latest committed snapshot when its turn begins.
- Every listener registered for an event is attempted even if another listener throws. Listener failures are surfaced after dispatch as one error, using `AggregateError` when more than one listener failed.
- Listener registries use prototype-safe keyed collections and set semantics. Registering the same callback more than once for the same subscription target does not create duplicate calls.
- Preferred subscription interfaces return an idempotent unsubscribe function. Existing paired `on` and `off` interfaces remain as compatibility wrappers and are documented as legacy.
- The public type surface marks current values, previous values, validation errors, and validity as readonly properties while keeping controller mutation methods available.
- `useForm` creates its controller once per committed component lifetime and ignores later changes to its initial-values argument. Synchronizing new external data is performed through controller methods, not controller replacement.
- The core controller exposes stable subscribe and snapshot-read capabilities suitable for an external-store adapter without exposing internal registries.
- Whole-form and per-field React watchers use `useSyncExternalStore`. React 17 compatibility is retained with the supported shim rather than by keeping the effect-based implementation.
- Whole-form snapshots remain referentially stable between commits. Per-field snapshots use the same `Object.is` semantics as core commits.
- Watchers support changes to both the form source and selected field. They unsubscribe from the old target and synchronously return the new target's current snapshot.
- React watchers define a server snapshot path so that server rendering does not depend on browser-only effects.
- Validation remains synchronous in this specification. A validator receives the current and previous form snapshots and returns an error object.
- Validation normalization creates a new readonly snapshot and never mutates the validator's returned object. Top-level `undefined` entries are omitted from the normalized snapshot.
- A validation controller without a configured validator exposes an empty error snapshot and `isValid: true`.
- Changing a validation function invalidates the prior derived result and recalculates against the current form snapshot according to documented timing.
- Validation controllers expose explicit disposal, and disposal is idempotent. A disposed controller no longer responds to form commits or retains callbacks.
- React validation integration performs subscriptions only through React's committed lifecycle and cleans up both the React-facing listener and the underlying form subscription.
- A validation hook changing to another form releases the old validation controller before observing the new source.
- Add selective public React readers for one field error and overall validity. The existing complete validation result remains available for consumers that intentionally subscribe at form scope.
- The form component helper binds only the selected field and therefore rerenders only when that field changes.
- Form component helper generics connect the selected field value type, configured value attribute, change attribute, event type, and extraction result. The configured binding props are omitted from consumer-supplied props.
- Valid falsy field keys are not rejected by truthiness checks.
- Public behavior is documented at package entry points. Internal comparators, queues, and registries remain implementation details rather than new external seams.
- The documentation defines controller identity, snapshot immutability, equality, no-op behavior, previous-value semantics, notification order, reentrancy, listener failures, validation timing, initial-values behavior, and React render guarantees.
- Documentation examples are sourced from or checked by executable TypeScript examples to prevent drift.
- Release checks lint only source and configuration files, type-check all examples, build both packages, run behavioral tests, and install packed artifacts into representative consumers.
- Package builds publish only declared entry points unless a subpath is deliberately added to the export map.
- Runtime correctness changes that preserve interface shape may ship in a compatible release. New readonly errors or stricter helper generics that reject previously accepted invalid code require migration notes and an explicit semantic-versioning decision.

## Testing Decisions

- Tests assert observable behavior through public package interfaces. Internal equality helpers, listener containers, queues, and React adapter implementation details are not independent test seams.
- The highest core seam is a form created through the public core package entry point. Tests exercise updates, snapshots, subscriptions, reentrancy, and errors through that controller.
- The highest validation seam is a validation controller created through the public core package entry point and connected to a public form controller.
- The highest React seam is a consumer component or rendered hook importing from the public React package entry point. Tests measure rendered output, render counts, subscription cleanup, and source changes.
- The highest publication seam is a temporary consumer project that installs the produced tarball and imports only declared package exports.
- Existing Vitest form tests provide prior art for core behavioral assertions. Existing Testing Library `renderHook` tests provide prior art for React integration tests, but assertions will be expanded from returned values to identity, render counts, and lifecycle.
- Core commit tests cover `setValue`, full `setValues`, no-ops, exact notification counts, changed-field selection, deterministic order, current and previous snapshots, and callback arguments.
- Equality tests are expressed through form updates and cover `NaN`, `-0`, primitives, same and different object references, arrays, `Date`, `Map`, `Set`, and nested reference replacement.
- Subscription tests cover duplicate registration, idempotent unsubscribe, legacy `on/off` compatibility, prototype-like and falsy field keys, listener removal during dispatch, listener addition during dispatch, and multiple listener failures.
- Reentrancy tests assert complete ordered transaction events rather than internal queue state.
- React identity tests assert that form mutation does not rerender the component that only owns `useForm`, that `form` remains safe in dependency arrays, and that the same controller is returned after unrelated rerenders.
- Field watcher tests assert no render for another field, exactly one render for the selected field, immediate correctness after switching field or form, and cleanup after unmount.
- Whole-form watcher tests assert exactly one render per successful commit and no render for no-op updates.
- React lifecycle tests run under Strict Mode and cover repeated mount/unmount, abandoned-source replacement where practical, updates near effect timing, and absence of retained callbacks after cleanup.
- Server-rendering tests verify the documented server snapshot and hydration-compatible initial result.
- Validation tests cover initial empty state, initial configured validation, unchanged normalized errors, changed validators, switched forms, disposal, exceptions, frozen returned objects, and exact notification counts.
- Selective validation tests measure that changing one error does not rerender unrelated error consumers and that overall validity readers update only when validity changes.
- Form component helper runtime tests cover text controls, checkbox-style value props, custom change prop names, custom extractors, falsy field keys, and selective rerendering.
- Compile-time tests cover readonly snapshots, field-key inference, mismatched component field values, custom value/change attributes, validator error types, and package declaration imports.
- Documentation examples are compiled as part of CI and checked for the intended field names and value conversions.
- Packed-consumer tests cover ESM import, CommonJS require, TypeScript declarations under modern Node and bundler resolution, React peer resolution, and rejection of undeclared deep imports.
- Quality commands are tested in a clean checkout and after a build to ensure generated output does not change lint results.
- Performance protection is based initially on deterministic notification and render-count assertions rather than timing benchmarks.

## Out of Scope

- Replacing the stable mutable `Form` controller with React state, reducers, immutable controller objects, or a context value that changes on every update.
- Recreating the form when values change or when the component owning `useForm` rerenders.
- Async validation, server validation, cancellation, debounce, and race resolution.
- Submission orchestration, touched/dirty/visited state, field arrays, nested path syntax, schema-library adapters, and persistence.
- A new reset interface or a public multi-update transaction/batch interface. The internal commit queue must not prevent those capabilities from being added later.
- Deep cloning or deep freezing arbitrary field values.
- Automatically synchronizing changed `initialValues` after the form has been created.
- Ref forwarding, static property hoisting, or additional component-framework features in the form component helper beyond the correctness and typing of current bindings.
- Framework adapters other than React.
- A general benchmark suite or performance claims not expressible as deterministic notification and render guarantees.
- Redesigning package names or merging the core and React packages.

## Further Notes

- The stable controller identity is a non-negotiable compatibility invariant. Any implementation that places the complete values snapshot in the state of `useForm`, returns a new wrapper after a commit, or changes dependency-array behavior does not satisfy this specification.
- Readonly snapshots do not make the controller immutable. The controller intentionally remains the mutation interface; readonly applies only to state snapshots exposed to consumers.
- Selective subscriptions are the source of React performance. Consumers opt into the narrowest snapshot they need: one field, overall validity, one validation error, or the whole form.
- Equality changes affect observable notification behavior. Migration notes must explicitly call out `Object.is`, object-reference replacement, `NaN`, `-0`, and the unsupported nature of direct nested mutation.
- Existing public methods should be preserved wherever they can delegate to the new implementation without weakening the new contract. Deprecation is preferable to immediate removal for subscription methods.
- Documentation should avoid describing the controller itself as reactive. The controller is imperative and stable; adapters and watchers provide reactivity.
- This specification is intentionally broad enough to make the current packages reliable before adding higher-level form features.
