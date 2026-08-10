Status: ready-for-agent

## Problem Statement

`createFormComponent` creates a generated controlled component that binds one form field to a
wrapped React control. The generated component currently has no ref-forwarding contract. A caller
cannot reliably obtain the wrapped control's DOM node, class instance, or imperative handle through
the generated component, even when the wrapped control itself supports refs. This blocks common
component-library operations such as focusing an invalid field, measuring a control, selecting its
text, and invoking an intentionally exposed imperative API.

The runtime gap is small, but the public TypeScript contract is the important part of the problem.
The generated component must expose exactly the ref type supported by the wrapped component without
weakening the existing field/value/change compatibility checks or falsely claiming that an ordinary
function component accepts refs under React 18.

## Solution

`createFormComponent` will return a ref-forwarding generated component. When the wrapped component
supports a React ref, passing a ref to the generated component will attach that ref to the wrapped
component and preserve React's normal mount, replacement, and unmount behavior. The generated
component will infer and expose the wrapped component's precise ref target while retaining all
existing form binding inference.

Components that do not support refs will continue to work exactly as they do today, and their
generated components will not advertise ref support. Existing callers that do not pass refs require
no migration.

## User Stories

1. As a form author, I want to focus a generated input through a DOM ref, so that I can move focus
   to the first invalid field.
2. As a form author, I want to select text through a generated input's ref, so that corrective input
   workflows remain possible after adopting generated controls.
3. As a component-library consumer, I want a generated control to preserve the wrapped component's
   imperative handle, so that wrapping it does not remove supported imperative behavior.
4. As a component-library consumer, I want object refs to reach the wrapped component, so that I can
   read the current target through the standard React ref API.
5. As a component-library consumer, I want callback refs to reach the wrapped component, so that I
   can integrate with callback-based ownership and cleanup code.
6. As a component-library consumer, I want the callback ref to receive `null` when the generated
   control unmounts, so that React's normal ref cleanup contract is preserved.
7. As a TypeScript user, I want the generated component to infer the wrapped DOM element type, so
   that DOM-specific methods are available without casts.
8. As a TypeScript user, I want the generated component to infer a custom imperative-handle type,
   so that only the methods intentionally exposed by the wrapped control are callable.
9. As a TypeScript user, I want an incompatible ref target to fail compilation, so that ref mistakes
   are caught before runtime.
10. As a TypeScript user, I want a generated component wrapping an ordinary React 18 function
    component to reject a ref, so that the public types do not promise unsupported behavior.
11. As a TypeScript user, I want class-component instance refs to remain correctly typed, so that
    supported legacy or third-party controls can still be wrapped.
12. As a TypeScript user, I want ref inference to work without explicitly supplying form-value or
    ref generics, so that the convenience API remains convenient.
13. As a form author, I want field-name compatibility checks to remain unchanged when refs are
    introduced, so that a ref cannot accidentally weaken value safety.
14. As a form author, I want the generated component to continue owning its configured value and
    change props, so that forwarding a ref does not permit callers to bypass the form binding.
15. As a form author, I want custom value attributes, custom change attributes, and multi-argument
    extractors to keep their current inference, so that ref support composes with every existing
    generated-control mode.
16. As a performance-sensitive consumer, I want ref forwarding to add no form subscription and no
    additional form-driven render, so that selective field watching retains its current behavior.
17. As an SSR consumer, I want generated controls with refs to render without imperative work during
    render, so that server rendering remains free of ref side effects.
18. As a package consumer, I want the same ref contract from ESM, CommonJS, and published TypeScript
    declarations, so that behavior does not depend on module resolution mode.
19. As a maintainer, I want the generated wrapper to have a useful React display name, so that the
    extra forward-ref layer remains understandable in React DevTools and warnings.
20. As an existing consumer, I want generated controls without refs to remain source-compatible, so
    that this addition does not require a migration.

## Implementation Decisions

- Ref forwarding is an additive capability of the existing `createFormComponent` public function;
  no second factory, hook, public props type, or public options type will be introduced.
- The returned generated component will use React's ref-forwarding mechanism and pass the received
  ref directly to the wrapped component.
- The generated component will infer its ref target from the wrapped component's public React type.
  Forward-ref components expose their declared DOM node or imperative handle, and class components
  expose their instance type.
- A wrapped component that has no legal React 18 ref target will continue to be accepted for ordinary
  generated-control use, but its generated component will not expose a ref prop.
- The ref prop will be removed from the ordinary rest-props calculation and reintroduced exactly
  once with the inferred target type. Callers cannot replace it through an untyped props spread in
  the implementation contract.
- The existing generic relationship among form field type, configured value prop, change-handler
  arguments, and extractor result remains authoritative. Adding a ref must not widen any of these
  types to `any`, `unknown`, or a broad union.
- The generated binding continues to own `form`, `name`, the configured value prop, and the
  configured change prop. Ref forwarding does not change prop precedence or ownership.
- The wrapped component continues to receive the selected form field as its `name` prop under the
  current generated-control contract.
- The implementation will not create, merge, or retain an internal ref. It forwards the caller's ref
  and leaves ref identity and callback timing to React.
- Ref changes must not affect the `useFormWatch` subscription source and must not introduce another
  external-store subscription.
- The wrapper will receive a stable, descriptive display name derived from the wrapped component's
  display name or function/class name, with a generic fallback when neither is available.
- React 18 remains the minimum supported version. The design must work with React 18's special ref
  handling and must not depend on React 19's ref-as-prop behavior.
- The package-root export list remains unchanged. Any supporting types stay private and are emitted
  only as necessary to describe the `createFormComponent` return type.
- Existing generated controls that do not use refs retain their runtime behavior and compile-time
  call sites without modification.

## Testing Decisions

- Tests will exercise only the public generated component returned by `createFormComponent`; private
  helper hooks and internal conditional types will not become testing seams or public exports.
- The primary runtime seam is the existing generated-control React test suite. A wrapped forward-ref
  control will bind a real form field and expose its DOM element through the generated component.
- The runtime test will prove both behaviors together: the ref reaches the wrapped element and the
  controlled value/change binding still updates the form.
- A custom imperative-handle case will verify that the generated component preserves the declared
  handle rather than merely supporting DOM refs accidentally.
- Unmount behavior will verify that an object ref is cleared or a callback ref receives `null` under
  React's normal lifecycle.
- Existing render-isolation coverage remains the performance regression seam. Ref forwarding must
  not change the number of renders caused by unrelated and selected-field updates.
- Compile-time assertions will cover a valid DOM ref, a valid custom imperative handle, an invalid
  target type, a component without ref support, and preservation of incompatible-field failures.
- Compile-time coverage will follow the repository's existing `@ts-expect-error` pattern so every
  rejected case fails the test if the public contract becomes too permissive.
- The package-level public-contract fixture will exercise ref inference through the package root so
  packed declarations, rather than only source aliases, are verified.
- Existing NodeNext, bundler, documentation, ESM, and CommonJS packed-consumer checks remain the
  release seam for module-format compatibility. No module-specific ref behavior is expected.
- Tests should assert observable ref targets, callable imperative methods, form updates, render
  counts, and compile-time acceptance or rejection. They should not assert the private helper names,
  the exact conditional-type decomposition, or the internal shape returned by React's forwarding
  API.

## Out of Scope

- Adding refs to ordinary function components that do not support them under React 18.
- Converting wrapped controls to `forwardRef` on behalf of their authors.
- Adding a form-level field registry, focus manager, `focusFirstError` API, or imperative form API.
- Storing refs inside the form controller or form snapshots.
- Composing a library-owned internal ref with the caller's ref; the generated component has no
  internal ref requirement.
- Expanding `createFormComponent` to accept intrinsic element strings such as `"input"`; callers can
  continue to wrap an intrinsic element in a typed component when needed.
- Changing value extraction, validation, subscription, snapshot, SSR, or hydration semantics.
- Dropping React 18 support or designing a separate React 19-only ref-as-prop API.
- Exporting internal generated-component props or options types.

## Further Notes

The runtime implementation is expected to be small. Most implementation risk is in preserving the
generic generated-control call signature after React's ref-forwarding type is introduced. The
existing source-level type assertions and packed public-contract compilation are therefore required
parts of acceptance, not optional type-polish work.

The feature should be treated as backward-compatible only if all existing generated-control call
sites and rejection tests continue to compile unchanged. Any need to widen the wrapped component or
generated component to `any` indicates that the type design is incomplete rather than an acceptable
implementation shortcut.
