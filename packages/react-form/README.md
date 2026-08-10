# @avinlab/react-form

A form is one stable mutable controller for its lifetime. `values` and `prevValues` are replaceable
readonly snapshots, so mutating the form does **not** by itself rerender React. Reactivity is opt-in:
use the narrowest field watcher, whole-form watcher, or validation reader that renders the data.

## Install

```sh
npm install @avinlab/react-form
```

## Creating and synchronizing a form

`useForm(initialValues)` reads `initialValues` only when it creates the controller. Parent renders
do not reset user input. The returned `form` identity is safe in dependency arrays, context values,
memoized values, and props.

When external data should replace the current values, synchronize it explicitly:

```tsx
const form = useForm(initialProfile);

useEffect(() => {
  form.setValues(profileFromServer);
}, [form, profileFromServer]);
```

`form.values` is an imperative read. Choose `useFormWatch(form, 'field')` for one field or
`useFormWatch(form)` for the complete snapshot. A field watcher ignores unrelated commits; a
whole-form watcher updates exactly once for each successful commit. Neither updates for a no-op.
If a render supplies another field or another form, the hook immediately reads that source's
current snapshot and React releases the old subscription during commit.

Watchers provide the current controller snapshot as their server snapshot. Use the same initial
data on the server and first client render to produce hydration-compatible output; server rendering
does not depend on effects or browser APIs.

## Uncontrolled input

An uncontrolled DOM input reads its initial value once and writes changes through the controller.
The owner does not subscribe and therefore does not rerender for the edit.

```tsx
function ProfileForm() {
  const form = useForm({ name: 'Bob', age: 20 });

  return (
    <form>
      <input
        name="name"
        defaultValue={form.values.name}
        onChange={(event) => form.setValue('name', event.currentTarget.value)}
      />
      <input
        name="age"
        type="number"
        defaultValue={form.values.age}
        onChange={(event) => form.setValue('age', Number(event.currentTarget.value))}
      />
    </form>
  );
}
```

The age recipe intentionally updates `age`, converts the DOM string to a number, and displays an
`age` error in the validation example below.

## Generated controlled components

`createFormComponent` builds a controlled component that watches only its selected field. Its types
connect the field value to the configured value prop, change prop, event, and extractor result. The
binding-owned props are not accepted from the caller.

```tsx
const FormTextInput = createFormComponent(TextInput, {
  getValue: (event: React.ChangeEvent<HTMLInputElement>) => event.currentTarget.value,
});

interface ToggleProps {
  checked: boolean;
  label: string;
  onToggle: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Toggle = ({ checked, label, onToggle }: ToggleProps) => (
  <label>
    <input type="checkbox" checked={checked} onChange={onToggle} />
    {label}
  </label>
);

const FormToggle = createFormComponent(Toggle, {
  valueAttrName: 'checked',
  onChangeAttrName: 'onToggle',
  getValue: (event: React.ChangeEvent<HTMLInputElement>) => event.currentTarget.checked,
});

function ControlledProfileForm() {
  const form = useForm({ name: '', accepted: false });
  return (
    <>
      <FormTextInput form={form} name="name" label="Name" />
      <FormToggle form={form} name="accepted" label="Accept terms" />
    </>
  );
}
```

`valueAttrName` defaults to `value`, `onChangeAttrName` defaults to `onChange`, and `getValue`
defaults to the first change-handler argument.

## Field and whole-form watchers

Keep subscriptions next to the output that needs them:

```tsx
function Name({ form }: { form: Form<ProfileValues> }) {
  const name = useFormWatch(form, 'name');
  return <output>{name}</output>;
}

function Summary({ form }: { form: Form<ProfileValues> }) {
  const values = useFormWatch(form);
  return <output>{JSON.stringify(values)}</output>;
}
```

The deterministic render guarantee is selective notification, not a general performance claim:
one whole-form watcher update per real commit, one selected-field update when that field changes,
and no watcher update for unrelated fields or no-ops.

## Validation result

Validation remains synchronous. React attaches it only after a render commits; once connected, a
validator runs against the current snapshot. A different validator function recalculates current
values during the committed effect. Switching `form` disposes the old derived controller, and
unmounting releases both validation and form subscriptions.

Validator identity defines the validation request. Declare validators outside the component or
memoize closure-based validators with `useCallback`; a new function requests a new validation.

`useFormValidation` returns only the readonly `{ status, errors }` render snapshot. It does not
expose the hook-owned controller, mutation methods, subscriptions, or disposal. Initial and server
renders are unvalidated. A changed form or validator also renders an empty unvalidated result until
that exact request commits and validates. Only `valid` means validation completed successfully.

`useFormValidationError` reads one error, while `useFormValidationStatus` reads the status using the
same terminology as the complete result.

```tsx
type ProfileErrors = Partial<Record<keyof ProfileValues, string>>;

const validateProfile = (values: Readonly<ProfileValues>): ProfileErrors => ({
  name: values.name ? undefined : 'Name is required',
  age: values.age >= 18 ? undefined : 'Must be at least 18',
});

function Validation({ form }: { form: Form<ProfileValues> }) {
  const result = useFormValidation<ProfileErrors, ProfileValues>(form, validateProfile);
  return <output>{JSON.stringify(result)}</output>;
}

function AgeError({ form }: { form: Form<ProfileValues> }) {
  const error = useFormValidationError<ProfileErrors, ProfileValues, 'age'>(
    form,
    validateProfile,
    'age',
  );
  return <output>{error}</output>;
}

function Submit({ form }: { form: Form<ProfileValues> }) {
  const status = useFormValidationStatus<ProfileErrors, ProfileValues>(form, validateProfile);
  return <button disabled={status !== 'valid'}>Save</button>;
}
```

The full versions of every recipe above are strictly compiled in
[`examples/react/src/documentationRecipes.tsx`](../../examples/react/src/documentationRecipes.tsx).
Run `npm run typecheck --workspace example-react` from the repository root to check them. See the
[core controller contract](../form/README.md) for update, equality, subscription, and
readonly-snapshot semantics.
