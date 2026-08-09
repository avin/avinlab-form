# Migration to 0.5

The controller remains mutable and retains its identity. The changes below make snapshot and
subscription behavior explicit; TypeScript consumers should treat the readonly and stricter
component-binding changes as source-level compatibility changes when choosing a release version.

## Readonly snapshots

`form.values`, `form.prevValues`, and validation `errors` are readonly in the public types. Replace
state through `setValue` or `setValues` instead of assigning to a snapshot. Development builds
shallow-freeze snapshots to diagnose direct top-level writes.

The freeze is intentionally shallow. Direct nested mutation remains unsupported because it bypasses
equality, notifications, validation, and React watchers:

```ts
// Unsupported: form.values.address.city = 'Ankara'
form.setValue('address', { ...form.values.address, city: 'Ankara' });
```

## `Object.is` equality

Both update methods now compare top-level fields with `Object.is`:

- `NaN` followed by `NaN` is a no-op.
- `0` and `-0` are different values and produce a commit.
- Reusing the same object, array, date, map, or set reference is a no-op.
- Replacing a field with a new reference produces a commit, even if its contents are deeply equal.

A no-op preserves both `values` and `prevValues`. A real commit replaces `values`, moves the prior
current snapshot to `prevValues`, and runs one deterministic notification cycle.

## Subscription cleanup

Prefer the disposer-returning interfaces so ownership and cleanup stay together:

```ts
const unsubscribe = form.subscribe(listener);
const unsubscribeField = form.subscribeField('name', fieldListener);

unsubscribe();
unsubscribeField();
```

The returned functions are idempotent. Existing `onUpdate`/`offUpdate`, `onUpdateField`/
`offUpdateField`, and `onValidate`/`offValidate` pairs remain available for migration, but require
retaining the original callback. Dispose validation controllers when their owning lifecycle ends.

## Explicit validation state

Boolean validity has been replaced by the explicit `ValidationState` union: `unvalidated`, `valid`,
or `invalid`. Replace `validation.isValid` with `validation.state === 'valid'`, or use an exhaustive
switch when all lifecycle outcomes matter. An empty error object while `unvalidated` does not mean
the form passed validation.

The React `useFormIsValid(form, validator)` hook was removed. Replace it with
`useFormValidationState(form, validator)` and compare its result with `valid`. The complete
`useFormValidation` facade exposes the same `state` property as the core controller.
