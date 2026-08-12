# Migrating from V4 to V5

V5 keeps the same central model—a mutable form controller—but makes snapshots readonly,
subscriptions disposer-based, and validation atomic. This guide contains the release history; the
[primary README](./README.md) teaches only the final interface.

## Member map

### Form controller

| V4                                               | V5                                    | Migration                                                                      |
| ------------------------------------------------ | ------------------------------------- | ------------------------------------------------------------------------------ |
| `form.onUpdate(listener)`                        | `form.subscribe(listener)`            | Store the returned disposer.                                                   |
| `form.offUpdate(listener)`                       | disposer returned by `subscribe`      | Call the disposer; retaining the listener is no longer necessary.              |
| `form.onUpdateField(name, listener)`             | `form.subscribeField(name, listener)` | Store the returned disposer.                                                   |
| `form.offUpdateField(name, listener)`            | disposer returned by `subscribeField` | Call the disposer.                                                             |
| writable `form.values` / `form.prevValues` types | readonly snapshots                    | Use `setValue` or `setValues`; replace nested values instead of mutating them. |

`createForm`, `setValue`, and full-snapshot `setValues` keep their names. Both subscription
disposers are idempotent.

```ts
const unsubscribeForm = form.subscribe((values, previousValues) => {
  console.log(values, previousValues);
});
const unsubscribeName = form.subscribeField('name', (name, previousName) => {
  console.log(name, previousName);
});

unsubscribeName();
unsubscribeForm();
```

### Core validation

| V4 or transitional member             | V5                                     | Migration                                                   |
| ------------------------------------- | -------------------------------------- | ----------------------------------------------------------- |
| `validation.errors`                   | `validation.result.errors`             | Read errors from the complete result.                       |
| `validation.isValid`                  | `validation.result.status === 'valid'` | Do not treat `unvalidated` as valid.                        |
| transitional `validation.state`       | `validation.result.status`             | Read status from the complete result.                       |
| transitional `ValidationState` type   | `ValidationStatus`                     | Rename the imported exhaustive three-value union.           |
| `validation.setValidation(validator)` | `validation.setValidator(validator)`   | Replacement now recalculates current values synchronously.  |
| `validation.onValidate(listener)`     | `validation.subscribe(listener)`       | The listener receives the complete result, not only errors. |
| `validation.offValidate(listener)`    | disposer returned by `subscribe`       | Call the disposer.                                          |
| no lifecycle cleanup                  | `validation.dispose()`                 | Dispose long-lived derived validation when its owner ends.  |

The new types are `ValidationResult<Errors>` and `ValidationStatus`, where status is exactly
`'unvalidated' | 'valid' | 'invalid'`.

```ts
const validation = createFormValidation(form, validateProfile);
const unsubscribe = validation.subscribe((result) => {
  console.log(result.status, result.errors);
});

validation.setValidator(nextValidator);
validation.validate();

unsubscribe();
validation.dispose();
```

### React validation

| V4 or transitional member                  | V5                          | Migration                                                                                        |
| ------------------------------------------ | --------------------------- | ------------------------------------------------------------------------------------------------ |
| controller returned by `useFormValidation` | readonly `ValidationResult` | Read `result.status` and `result.errors`; lifecycle methods are no longer exposed.               |
| `useFormValidationError`                   | no library replacement      | Call `useFormValidation` once and pass the complete result through props or application context. |
| `useFormValidationState`                   | no library replacement      | Read `result.status` from that same complete result.                                             |
| `useFormValidationStatus`                  | no library replacement      | Read `result.status`; this transitional alias is not exported.                                   |

React 18 is now the minimum. `useForm` and both overloads of `useFormWatch` keep their names.

```tsx
function Validation({ form }: { form: Form<ProfileValues> }) {
  const result = useFormValidation<ProfileErrors, ProfileValues>(form, validateProfile);
  return <ProfileFields result={result} />;
}
```

Declare validators outside components or memoize closure-based validators with `useCallback`.
Validator identity is part of the request: changing either the form or validator renders an empty
unvalidated result until that exact request commits and validates. Initial and server renders are
also unvalidated. A validator exception restores the empty unvalidated result before propagating.
Unmounting or switching sources releases the hook-owned validation controller and all underlying
subscriptions; application code does not dispose a React-owned result.

### Generated controls

| V4 member                          | V5                    | Migration                                                                     |
| ---------------------------------- | --------------------- | ----------------------------------------------------------------------------- |
| `createFormComponent`              | `createFormComponent` | Keep using the single public convenience helper.                              |
| `useFormControlProps`              | internal              | Bind directly with `useFormWatch` + `setValue`, or use `createFormComponent`. |
| exported `FormComponentProps`      | inferred              | Let the generated component infer its props.                                  |
| exported `FormInputControlOptions` | inferred              | Pass the options object directly to `createFormComponent`.                    |

`createFormComponent` remains optional. `valueAttrName`, `onChangeAttrName`, and `getValue` still
support checkbox-style and custom controls, while incompatible field bindings now fail type
checking.

## Changed behavior to account for

### Initial validation

A core validation created without a validator starts as
`{ status: 'unvalidated', errors: {} }`. React always starts with the same result, including SSR,
then validates after the requested form and validator commit. Only `status === 'valid'` means a
validator completed with no errors.

### Replacing forms and validators

`useForm(initialValues)` still reads its initial values only once. To apply external data, call
`form.setValues(nextValues)` explicitly. In React, changing the `form` or validator passed to
`useFormValidation` temporarily yields the empty unvalidated result. In core, `setValidator`
revalidates synchronously before returning.

### Validator exceptions

When a validator throws, the current result becomes empty and unvalidated before the same exception
propagates. Do not keep displaying a prior successful result after catching the error.

### Error normalization and equivalent results

V5 copies the object returned by a validator, removes top-level properties whose value is
`undefined`, and freezes the normalized error snapshot. The validator's own object is never
mutated. Return a new object as usual; do not rely on validation deleting `undefined` properties
from an object retained by application code.

If a completed validation has the same status and deeply structurally equal normalized errors, the
complete `result` reference is preserved and subscribers are not notified. Independently created
nested objects and arrays with the same contents are equivalent; error structures must be acyclic.
A form commit can therefore run validation without producing a validation notification when its
normalized result is equivalent.

### Complete-result subscriptions and cleanup

Validation subscribers now receive `{ status, errors }` atomically. Every `subscribe` and
`subscribeField` call returns its cleanup function. Call form and validation subscription disposers
at the owning lifecycle boundary, and call `validation.dispose()` for core validation controllers.
React owns and cleans up controllers created by `useFormValidation`.

## Checked examples

The final API is exercised by the small, strictly compiled recipes in
[`examples/react/src/examples`](./examples/react/src/examples). Migration-sensitive watcher,
switching, exception, subscription, and React cleanup behavior remains covered by the packages'
public test suites.
