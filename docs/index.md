---
layout: home

hero:
  name: "@avinlab/form"
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
import {
  createFormComponent,
  useForm,
  useFormValidation,
  useFormWatch,
} from '@avinlab/react-form';

type Values = { email: string; password: string; repeat: string; newsletter: boolean };
type Errors = Partial<Record<keyof Values, string>>;

// A synchronous validator. Declared outside the component, so its identity is stable.
const validate = (values: Readonly<Values>): Errors => ({
  email: values.email.includes('@') ? undefined : 'Enter a valid email',
  password: values.password.length >= 8 ? undefined : 'At least 8 characters',
  repeat: values.repeat === values.password ? undefined : 'Passwords do not match',
});

// Optional: turn any controlled component into a form-bound one.
const FormInput = createFormComponent(TextInput); // value / onChange(value)
const FormCheckbox = createFormComponent(Checkbox, {
  valueAttrName: 'checked',
  getValue: (event: React.ChangeEvent<HTMLInputElement>) => event.currentTarget.checked,
});

// Watches one field only: re-renders when `password` changes, never for other fields.
function PasswordStrength({ form }: { form: Form<Values> }) {
  const password = useFormWatch(form, 'password');
  return <output>Strength: {password.length >= 12 ? 'strong' : 'weak'}</output>;
}

export function SignupForm() {
  const form = useForm<Values>({ email: '', password: '', repeat: '', newsletter: false });
  const { status, errors } = useFormValidation<Errors, Values>(form, validate);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        signUp(form.values); // imperative read: no subscription, no re-render
      }}
    >
      <FormInput form={form} name="email" label="Email" error={errors.email} />
      <FormInput form={form} name="password" label="Password" error={errors.password} />
      <FormInput form={form} name="repeat" label="Repeat password" error={errors.repeat} />
      <PasswordStrength form={form} />
      <FormCheckbox form={form} name="newsletter" label="Send me news" />

      {/* setValues replaces the whole snapshot: spread the current values to patch */}
      <button
        type="button"
        onClick={() => form.setValues({ ...form.values, password: '', repeat: '' })}
      >
        Clear passwords
      </button>
      <button disabled={status !== 'valid'}>Sign up</button>
    </form>
  );
}
```

What you get from these few lines:

- `form` is one stable controller. Fields are bound once through `createFormComponent`; each one
  watches only its own value.
- Validation is one atomic `{ status, errors }` result, and it can look across fields (the
  *repeat* check). The submit button is enabled only for `status === 'valid'`, not merely
  "no errors yet".
- `createFormComponent` binds existing controlled components with full type checking: the field
  type must match the component's value prop.
- Writes go through `setValue` / `setValues`; reads in handlers are plain `form.values`.

Ready? Start with the [introduction](/guide/introduction), or jump to
[Getting started](/guide/getting-started).
