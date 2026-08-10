# @avinlab/form

A form is one stable mutable controller for its lifetime. `values` and `prevValues` are replaceable
readonly snapshots; calling a mutation method changes snapshots without replacing the controller.
Read snapshots imperatively and mutate only through the controller.

## Install

```sh
npm install @avinlab/form
```

## Controller contract

- `setValue` and full-replacement `setValues` compare every top-level field with `Object.is`.
  `NaN` is therefore equal to `NaN`, while `0` and `-0` are different. Objects, arrays, dates,
  maps, and sets change only when their field reference changes.
- A no-op preserves both snapshot references and sends no notification. After a successful commit,
  `values` is the new snapshot and `prevValues` is the snapshot immediately before that commit.
- Changed-field listeners run once each before whole-form listeners. Changed fields follow the key
  order of the next snapshot; removed fields follow their previous key order.
- An update requested by a listener is queued until the current notification cycle finishes.
  Reentrant updates run FIFO and every callback receives the current and previous snapshots for its
  own commit.
- Every listener captured for a notification is attempted. One failure is rethrown after dispatch;
  multiple failures are reported in one `AggregateError`. A listener failure does not roll back the
  committed snapshot.
- `subscribe` and `subscribeField` use set semantics and return idempotent cleanup functions.
  Adding or removing listeners during dispatch affects the next commit, not the captured current
  cycle.
- Snapshots are shallow-frozen in development and readonly in TypeScript. Nested field values are
  not cloned or deeply frozen: replace a nested value through `setValue` instead of mutating it.

## Controller recipe

```ts
import { createForm } from '@avinlab/form';

const form = createForm({ name: 'Bob', age: 20 });
const unsubscribeAge = form.subscribeField('age', (age, previousAge) => {
  console.log({ age, previousAge });
});
const unsubscribeForm = form.subscribe((values, previousValues) => {
  console.log({ values, previousValues });
});

form.setValue('age', 21);
form.setValues({ name: 'Ada', age: 36 }); // full snapshot replacement

unsubscribeAge();
unsubscribeForm();
```

Keeping `form` in a dependency list or passing it through application layers is safe: successful
commits retain the exact same controller object.

## Synchronous validation

`createFormValidation` derives one readonly validation result from the form. A validator runs
synchronously when configured, after each successful form commit, when replaced with a different
validator, or when `validate()` is called. It receives the committed `values` and `prevValues`.
The returned object is copied, top-level `undefined` entries are omitted, and the caller's object is
never mutated. `status` is `unvalidated` before any validator completes, `valid` for an empty
normalized result, and `invalid` otherwise. Subscribers receive the complete `{ status, errors }`
result. Equivalent complete results preserve their reference and do not notify.

```ts
import { createForm, createFormValidation } from '@avinlab/form';

interface Values {
  name: string;
  age: number;
}

type Errors = Partial<Record<keyof Values, string>>;
const form = createForm<Values>({ name: 'Bob', age: 20 });
const validation = createFormValidation<Errors, Values>(form, (values) => ({
  name: values.name ? undefined : 'Name is required',
  age: values.age >= 18 ? undefined : 'Must be at least 18',
}));

const unsubscribe = validation.subscribe((result) => console.log(result));
form.setValue('age', 15); // validation completes before setValue returns

validation.setValidator((values) => ({
  age: values.age >= 21 ? undefined : 'Must be at least 21',
})); // recalculates the current snapshot synchronously

unsubscribe();
validation.dispose(); // idempotent; releases the form subscription and listeners
```

Without a validator, `result` is `{ status: 'unvalidated', errors: {} }`; both the result and its
empty errors object are readonly. Only `result.status === 'valid'` means validation completed
successfully. If a validator throws, the controller publishes that empty unvalidated result before
propagating the exception. Disposal is explicit and idempotent; a disposed validation controller
retains its final result and no longer reacts to form commits.

The complete, strictly compiled controller and validation recipe lives in
[`examples/react/src/documentationRecipes.tsx`](../../examples/react/src/documentationRecipes.tsx).
