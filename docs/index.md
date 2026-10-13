---
layout: home

hero:
  name: avinlab-form
  text: Small form controllers for TypeScript and React
  tagline: One stable controller per form, readonly value snapshots, and subscriptions as narrow as you need.
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: Introduction
      link: /guide/introduction
    - theme: alt
      text: GitHub
      link: https://github.com/avin/avinlab-form

features:
  - title: Stable controller
    details: The form keeps one identity for its whole lifetime, so it is safe in dependency arrays, props, and context.
  - title: Readonly snapshots
    details: Values change only through `setValue` and `setValues`. Every commit replaces the snapshot and exposes the previous one.
  - title: Selective rendering
    details: Watch one field or the whole form. Unrelated fields and no-op updates never rerender anything.
  - title: Synchronous validation
    details: One atomic `{ status, errors }` result that distinguishes `unvalidated` from `valid`.
---

## The idea in 30 seconds

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
      <input value={name} onChange={(e) => form.setValue('name', e.currentTarget.value)} />
      {validation.errors.name && <span>{validation.errors.name}</span>}
      <button disabled={validation.status !== 'valid'}>Save</button>
    </form>
  );
}
```

Ready? Start with the [introduction](/guide/introduction), or jump to
[Getting started](/guide/getting-started).
