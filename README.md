# avinlab-form

Small form controllers for TypeScript and React. A form keeps one stable controller identity while
its readonly value snapshots are replaced by explicit updates.

## Install

```sh
npm install @avinlab/form @avinlab/react-form
```

`@avinlab/react-form` requires React 18 or newer. Install only `@avinlab/form` when React bindings
are not needed.

## Quick start

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

`useForm` returns the same controller for the component's lifetime. Mutate it explicitly with
`setValue` or `setValues`; do not assign into `form.values`. Reading `form.values` is synchronous.
Use `useFormWatch(form, field)` for one field or `useFormWatch(form)` for the whole snapshot.
Validation is one atomic readonly `{ status, errors }` snapshot, so the status and errors always
describe the same validation run.

The same primitives are exercised by the focused examples in
[`examples/react/src/examples`](./examples/react/src/examples). See the
[`@avinlab/react-form` guide](./packages/react-form/README.md) for synchronization, watchers,
validation, SSR, and lifecycle details, or the [`@avinlab/form` guide](./packages/form/README.md)
for framework-independent usage and the advanced controller contract.

## Optional generated controls

`createFormComponent` can remove repeated controlled-input binding in a component library. It is
an optional convenience; ordinary inputs work directly with `useFormWatch` and `form.setValue`, as
shown above.

## Upgrading

The [V5 migration guide](./MIGRATION.md) maps every removed or renamed form, validation, React, and
generated-control member to the final interface. Migration history stays there rather than in the
primary workflow.

The documented performance contract is limited to verified behavior: one notification cycle per
real commit, no notification for a no-op, one whole-form watcher update per commit, one validation
call per mounted validation hook per form commit, and no selected-field render for unrelated
fields. No broader timing, memory, or bundle-performance claim is made.
