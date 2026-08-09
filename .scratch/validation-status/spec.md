# Explicit Validation Status

Status: wontfix

Superseded by: `../clean-slate-public-api/spec.md`

The clean-slate public API keeps the three-state status model but deliberately rejects this spec's
compatibility decisions. Implementation should follow the superseding specification.

## Problem Statement

React validation is intentionally connected only after a render commits, so the initial render and
server render expose an empty error snapshot before the synchronous validator has run. The current
pair of `errors: {}` and `isValid: true` cannot distinguish that unvalidated state from a completed
validation that found no errors.

Consumers therefore cannot reliably decide whether to show success UI, enable submission, or hide
validation messages. The same ambiguity can appear when a React consumer changes its form source or
validator, and when a validator throws before producing a result for the latest committed values.

## Solution

Expose one readonly validation status with three states: `unvalidated`, `valid`, and `invalid`.
The status describes whether the public validation snapshot is current for the active form and
validator, rather than whether validation happened at some point in the past.

Keep `errors` and `isValid` available for compatibility. Consumers that need validation readiness
will use status as the authoritative state: submission is ready only in the `valid` state, errors are
current only in the `invalid` state, and `unvalidated` means no successful result exists for the
current validation inputs. React will also expose a selective status reader so consumers do not need
to subscribe to the complete error object.

## User Stories

1. As a form user, I want the UI to distinguish an untouched validation lifecycle from a valid form, so that it does not show premature success.
2. As a form user, I want submission controls to wait for a completed validation, so that an unvalidated form is not treated as valid.
3. As a React developer, I want the first render to report `unvalidated`, so that render remains free of subscriptions and validator execution.
4. As a server-rendering developer, I want validation status to be deterministic on the server, so that SSR does not pretend validation has run.
5. As a React developer, I want a committed synchronous validation to move status to `valid` or `invalid`, so that the next render reflects the result.
6. As a React developer, I want changing the form source to make the requested validation state unvalidated until the new source is checked, so that errors from the previous form are not presented as current.
7. As a React developer, I want changing the validator to make the requested validation state unvalidated until the new rule runs, so that results from an obsolete rule are not presented as current.
8. As a React developer, I want an abandoned render not to change validation status or execute a validator, so that concurrent rendering remains side-effect free.
9. As a Strict Mode user, I want repeated render and effect lifecycles to produce the same observable status sequence, so that development behavior is predictable.
10. As a core-package consumer, I want validation created without a validator to report `unvalidated`, so that the empty error object has an explicit meaning.
11. As a core-package consumer, I want validation created with a successful validator to report `valid` or `invalid` immediately, so that synchronous core usage remains synchronous.
12. As a core-package consumer, I want configuring a validator to recalculate status synchronously, so that reads after `setValidation` are current.
13. As a consumer, I want an empty normalized error snapshot to produce `valid`, so that validity follows the same normalization rules as errors.
14. As a consumer, I want a non-empty normalized error snapshot to produce `invalid`, so that status and errors cannot disagree after a successful validation.
15. As a consumer, I want a thrown validator to leave the current inputs `unvalidated`, so that the last successful result is not mistaken for a result for the latest values.
16. As a consumer, I want the last successful errors and validity to remain available after a validation exception, so that adding status does not erase diagnostic state or silently change the existing exception contract.
17. As a subscription consumer, I want status-only changes to be observable, so that readiness UI updates even when the error object is still empty.
18. As a selective React consumer, I want to subscribe only to validation status, so that error changes within the same status do not rerender readiness UI.
19. As an existing consumer, I want `errors`, `isValid`, validation methods, and legacy subscription methods to remain available, so that adopting status can be incremental.
20. As a TypeScript consumer, I want the status type exported as a closed union, so that exhaustive handling detects future lifecycle additions.
21. As a maintainer, I want status transitions covered through public package exports, so that internal controller refactoring does not weaken the contract.
22. As a package consumer, I want compiled declarations and packed artifacts to expose identical status behavior, so that workspace tests match the published library.

## Implementation Decisions

- The public validation controller gains a readonly status property and the core package exports its
  closed status union.
- The initial status is `unvalidated` when no validator has successfully produced a result for the
  active form and validator.
- A successful synchronous validation derives status after error normalization: an empty normalized
  snapshot is `valid`, and a non-empty normalized snapshot is `invalid`.
- Status refers to freshness for the current form values and validator identity. It is not an
  historical "ever validated" flag.
- `errors` and `isValid` remain available with their existing shapes for source compatibility.
  Consumers use status when readiness matters; `isValid` alone continues to preserve its existing
  compatibility semantics while status is `unvalidated`.
- Before invoking a validator for inputs that have no successful current result, the controller
  treats those inputs as unvalidated. If the validator throws, status remains `unvalidated`, the
  exception continues to propagate, and the last successful errors and validity remain available as
  stale diagnostic state.
- Validation subscribers are notified when any public validation snapshot dimension changes,
  including a status-only transition. Equivalent errors with an unchanged status remain a no-op.
- Core validation with a configured validator remains synchronous. The core constructor and
  `setValidation` expose the completed `valid` or `invalid` status before returning when validation
  succeeds.
- React render does not execute validators, attach subscriptions, or mutate a shared validation
  controller. The render-facing status for a newly requested form or validator is `unvalidated`
  until that exact pair is connected and successfully checked after commit.
- An abandoned React render does not alter the status of the previously committed validation source.
- React exposes a selective status reader alongside the complete validation result and the existing
  error and validity readers.
- The selective status reader rerenders only when the three-state status changes. A change from one
  invalid error snapshot to another does not rerender a status-only consumer.
- `unvalidated` is not named `validating`: synchronous validation has no observable in-flight state.
  Async validation and a future `validating` state require a separate design.
- Disposal is lifecycle state, not validation result state. Disposing a controller stops future
  work but retains its last readable snapshot and status.
- Documentation presents status as the submission/readiness gate and explains that initial React
  and server rendering are deliberately unvalidated.
- The change requires an explicit semantic-versioning decision because subscriber notification
  counts can increase for status-only transitions even though the public surface is additive.

## Testing Decisions

- Tests exercise public package entry points and rendered public hooks rather than internal state
  containers or effect ordering.
- The primary core seam is a validation controller created from a public form controller. Tests cover
  construction with and without a validator, valid and invalid results, normalization, validator
  replacement, form commits, exceptions, disposal, and exact subscription counts.
- The primary React seam is a consumer rendered with the complete validation hook or the selective
  status reader. Tests assert initial, committed, source-switching, validator-switching, exception,
  Strict Mode, abandoned-render, unmount, and render-isolation behavior.
- Server-rendering tests assert `unvalidated` without validator execution and hydration-compatible
  transition to the client result.
- Status-only notification tests cover `unvalidated` to `valid` with an empty error snapshot and
  verify that unchanged status plus equivalent errors emits no event.
- Selector render-count tests verify that invalid-to-invalid error changes do not rerender a
  status-only consumer, while valid-to-invalid and invalid-to-valid transitions rerender once.
- Compile-time contract tests verify the exported closed union, readonly status property, exhaustive
  handling, and availability from packed declarations.
- Packed-consumer tests cover status from both core and React package root exports in ESM, CommonJS,
  and supported TypeScript module-resolution modes.
- Existing validation-controller and validation-hook tests are prior art and should be extended at
  the same public seams rather than adding tests for private adapters.

## Out of Scope

- Async validation, promises, cancellation, debounce, race handling, or a `validating` state.
- Touched, dirty, visited, submitted, or submission-in-progress state.
- Running React validators during render or server rendering.
- Replacing the stable form controller model.
- Removing or changing the type of `errors`, `isValid`, or legacy validation subscription methods.
- Clearing the last successful error snapshot solely because a later validator throws.
- General redesign of validation error schemas or normalization.

## Further Notes

- The intended readiness check is status equality with `valid`, not `isValid` by itself.
- A status-only change is observable state even when `errors` retains the same reference.
- Documentation and migration notes should explicitly distinguish "no errors were found" from "no
  current validation result exists".
- If async validation is designed later, the closed union can be deliberately expanded with states
  whose concurrency and cancellation semantics are specified at that time.
