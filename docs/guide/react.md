# React

`@avinlab/react-form` needs React 18 or newer. It provides `useForm`, `useFormWatch`,
`useFormValidation`, and `createFormComponent`. Core types and controllers stay available from
`@avinlab/form`.

## Creating and synchronizing a form

`useForm(initialValues)` reads its argument only when it creates the controller. Parent renders do
not reset user input, and the returned `form` is safe in dependency arrays, context, and props.

To replace the values with external data, synchronize explicitly:

```tsx
const form = useForm(initialProfile);

useEffect(() => {
  form.setValues(profileFromServer);
}, [form, profileFromServer]);
```

`setValues` is a full replacement. Merge with `form.values` first if you want a partial patch.

## Watchers

```tsx
const name = useFormWatch(form, 'name'); // rerenders for `name` commits
const values = useFormWatch(form); // rerenders once per real commit
```

Keep watchers next to the output that needs them:

```tsx
function Name({ form }: { form: Form<ProfileValues> }) {
  const name = useFormWatch(form, 'name');
  return <output>{name}</output>;
}
```

- A field watcher ignores unrelated commits; a whole-form watcher updates once per commit; neither
  updates for a no-op.
- If a render supplies another field or form, the hook reads the new source immediately and React
  releases the old subscription on commit.

## Uncontrolled inputs

An uncontrolled input reads its initial value once and writes through the controller. The owner
does not subscribe, so it does not rerender for edits.

```tsx
const form = useForm({ name: 'Bob', age: 20 });

<input
  defaultValue={form.values.name}
  onChange={(event) => form.setValue('name', event.currentTarget.value)}
/>;
<input
  type="number"
  defaultValue={form.values.age}
  onChange={(event) => form.setValue('age', Number(event.currentTarget.value))}
/>;
```

DOM values are strings: convert them to the field's type when you update.

## Server rendering

Watchers use the current controller snapshot as their server snapshot. Use the same initial values
on the server and on the first client render to get hydration-compatible output. Rendering does not
depend on effects or browser APIs.
