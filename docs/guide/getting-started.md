# Getting started

## Install

```sh
npm install @avinlab/form @avinlab/react-form
```

`@avinlab/react-form` requires React 18 or newer. Install only `@avinlab/form` if you do not
need the React bindings.

## A first React form

```tsx
import { useCallback } from 'react';
import { useForm, useFormValidation, useFormWatch } from '@avinlab/react-form';

type Values = { name: string };
type Errors = { name?: string };

export function ProfileForm() {
  const form = useForm<Values>({ name: '' });
  const name = useFormWatch(form, 'name');
  const validate = useCallback(
    (values: Readonly<Values>): Errors => ({
      name: values.name ? undefined : 'Name is required',
    }),
    [],
  );
  const validation = useFormValidation<Errors, Values>(form, validate);

  return (
    <form>
      <label>
        Name
        <input
          value={name}
          onChange={(event) => form.setValue('name', event.currentTarget.value)}
        />
      </label>
      {validation.errors.name && <span>{validation.errors.name}</span>}
      <button disabled={validation.status !== 'valid'}>Save</button>
    </form>
  );
}
```

What happens here:

- `useForm` returns the same controller for the component's lifetime. The initial values are read
  once.
- `useFormWatch(form, 'name')` rerenders the component only when `name` changes.
- `useFormValidation` returns a readonly `{ status, errors }` result. Only `status === 'valid'`
  means validation completed successfully.

## Without React

```ts
import { createForm } from '@avinlab/form';

const form = createForm({ name: 'Bob', age: 20 });
const unsubscribe = form.subscribeField('age', (age, previousAge) => {
  console.log({ age, previousAge });
});

form.setValue('age', 21);
unsubscribe();
```

## Where to go next

- [Core controller](/guide/core): snapshots, updates, subscriptions, commit semantics.
- [React](/guide/react): synchronization, watchers, SSR.
- [Validation](/guide/validation): core and React validation.
- Runnable recipes live in
  [`examples/react/src/examples`](https://github.com/avin/avinlab-form/tree/master/examples/react/src/examples).
