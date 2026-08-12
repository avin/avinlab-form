# React integration

Use `@avinlab/react-form` with React 18 or newer. It provides `useForm`, `useFormWatch`, `useFormValidation`, and `createFormComponent`; core types and controllers remain available from `@avinlab/form`.

## Create and synchronize

`useForm(initialValues)` reads its argument only when it creates the controller. Parent rerenders preserve the controller and user edits.

Synchronize external data explicitly when it should replace the current snapshot:

```tsx
const form = useForm(initialProfile);

useEffect(() => {
  form.setValues(profileFromServer);
}, [form, profileFromServer]);
```

Remember that `setValues` is full replacement. Merge with `form.values` first only when partial-patch behavior is intentionally required.

## Choose the narrowest render subscription

```tsx
const name = useFormWatch(form, 'name'); // rerenders for name commits
const values = useFormWatch(form); // rerenders once per real form commit
```

- Use a field watcher beside output that needs one field.
- Use a whole-form watcher for summaries or rendering that genuinely depends on the complete snapshot.
- Read `form.values` imperatively inside handlers or commands that do not need to rerender.
- An uncontrolled input can use `defaultValue={form.values.name}` and write with `form.setValue`; its owner needs no watcher unless it renders the changed value elsewhere.

```tsx
const age = useFormWatch(form, 'age');

<input
  type="number"
  value={age}
  onChange={(event) => form.setValue('age', Number(event.currentTarget.value))}
/>;
```

DOM input values are strings by default. Convert them to the field's domain type at the update boundary.

## Source switching and SSR

When a render supplies a different form or field name, `useFormWatch` immediately reads the new source and React releases the old subscription during commit.

Watchers use the current controller snapshot as their server snapshot. Supply equivalent initial values on the server and first client render for hydration-compatible output.

`useFormValidation` performs subscription and validation work only after a render commits. Its initial and server result is unvalidated. Read [validation.md](validation.md) for validator identity and result-sharing rules.

## Performance contract

Base performance-sensitive decisions on the verified notification contract:

- one whole-form watcher update per real commit;
- one selected-field watcher update when that field changes;
- no selected-field update for unrelated fields;
- no watcher update for a no-op;
- one validation run per mounted validation hook per real form commit.

Treat broader timing, memory, and bundle claims as unverified unless current measurements establish them.
