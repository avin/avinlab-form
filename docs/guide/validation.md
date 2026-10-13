# Validation

Validation is synchronous and produces one atomic readonly `{ status, errors }` result. Trust
`status`:

- `unvalidated`: no validator has completed for this request.
- `valid`: validation completed with no normalized errors.
- `invalid`: validation completed with one or more errors.

Only `status === 'valid'` means validation succeeded.

## Core validation

```ts
import { createForm, createFormValidation } from '@avinlab/form';

type Values = { email: string };
type Errors = { email?: string };

const form = createForm<Values>({ email: '' });
const validation = createFormValidation<Errors, Values>(form, (values, previousValues) => ({
  email: values.email.includes('@') ? undefined : 'Invalid email',
}));

const unsubscribe = validation.subscribe((result) => {
  console.log(result.status, result.errors);
});

validation.setValidator(nextValidator); // recalculates current values synchronously
validation.validate(); // repeats the current validator

unsubscribe();
validation.dispose(); // idempotent
```

- A validator runs when configured, after each successful commit, when replaced, and on
  `validate()`. It receives the committed `values` and `prevValues`.
- The returned object is copied, top-level `undefined` entries are removed, and your object is
  never mutated.
- Deeply equal results keep the existing reference and do not notify. Error structures must be
  acyclic.
- Without a validator, `result` is `{ status: 'unvalidated', errors: {} }`.
- If a validator throws, the empty unvalidated result is published before the exception
  propagates.
- Core validation owns a form subscription: call `dispose()` when its owner ends. A disposed
  controller keeps its final result and ignores later requests.

## React validation

```tsx
const validateProfile = (values: Readonly<Values>): Errors => ({
  email: values.email.includes('@') ? undefined : 'Invalid email',
});

function Profile({ form }: { form: Form<Values> }) {
  const result = useFormValidation<Errors, Values>(form, validateProfile);
  return <button disabled={result.status !== 'valid'}>Save</button>;
}
```

- The hook returns only the readonly result and owns and disposes the controller itself.
- **Validator identity is the request.** Declare validators outside the component or memoize them
  with `useCallback`; a new function requests a new validation.
- Initial and server renders are `unvalidated`. A changed form or validator also renders an empty
  unvalidated result until that exact request commits and validates.
- One mounted hook performs one validation per real form commit.

Call `useFormValidation` once per validation subtree and pass the complete result to children via
props or your own context:

```tsx
function Validation({ form }: { form: Form<ProfileValues> }) {
  const result = useFormValidation<ProfileErrors, ProfileValues>(form, validateProfile);
  return (
    <>
      <AgeError result={result} />
      <Submit result={result} />
    </>
  );
}
```
