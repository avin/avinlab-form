# Validation

Validation is synchronous and produces one atomic readonly `{ status, errors }` result. Treat `status` as the authority:

- `unvalidated`: no validator has completed for this request.
- `valid`: validation completed with no normalized errors.
- `invalid`: validation completed with one or more errors.

Only `status === 'valid'` means validation succeeded. Keep status and errors from the same result snapshot.

## Core validation

Use `createFormValidation` for framework-independent or manually owned validation.

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

const nextValidator = (values: Readonly<Values>): Errors => ({
  email: values.email.endsWith('.test') ? undefined : 'Use a .test address',
});
validation.setValidator(nextValidator); // recalculates current values synchronously
validation.validate(); // repeats the current validator

unsubscribe();
validation.dispose();
```

The validator receives current and previous form snapshots. Top-level `undefined` error entries are omitted. Deeply equivalent error objects preserve the existing result reference and emit no notification; error structures must be acyclic. A thrown validator publishes the empty unvalidated result before rethrowing.

Core validation owns a form subscription. Call its idempotent `dispose()` when its owner ends. A disposed controller keeps its final result and ignores later requests.

## React validation

Use `useFormValidation(form, validator)` during rendering. It returns only a `ValidationResult`; the hook owns and disposes the underlying controller.

```tsx
const validateProfile = (values: Readonly<Values>): Errors => ({
  email: values.email.includes('@') ? undefined : 'Invalid email',
});

function Profile({ form }: { form: Form<Values> }) {
  const result = useFormValidation<Errors, Values>(form, validateProfile);
  return <button disabled={result.status !== 'valid'}>Save</button>;
}
```

Validator identity defines the request. Declare a static validator outside the component or memoize a closure-based validator with `useCallback`. A new validator function or form produces an unvalidated render until that exact request commits and validates. Initial and server renders are also unvalidated.

Call `useFormValidation` once for a validation subtree, then pass its complete result through props or application-owned context. This keeps status and errors atomic and avoids duplicate validation controllers and work.
