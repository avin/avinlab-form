# Core controller

Use `@avinlab/form` for framework-independent state, imperative reads, subscriptions, and core validation.

## Mental model

- `createForm(initialValues)` creates one controller identity for its lifetime.
- `form.values` is the current readonly snapshot; `form.prevValues` is the snapshot immediately before the latest real commit.
- `setValue(name, value)` replaces one top-level field. `setValues(values)` replaces the complete snapshot; it is not a partial patch.
- Updates compare top-level fields with `Object.is`. A no-op preserves snapshot references and emits no notification.
- Snapshots are shallow. Replace nested objects or arrays instead of mutating them in place.

```ts
import { createForm } from '@avinlab/form';

type Profile = { name: string; preferences: { theme: string } };

const form = createForm<Profile>({
  name: '',
  preferences: { theme: 'light' },
});

form.setValue('name', 'Ada');
form.setValue('preferences', {
  ...form.values.preferences,
  theme: 'dark',
});
```

## Choose a read path

- Read `form.values` directly for event handlers, commands, and other imperative work.
- Use `subscribeField(name, listener)` when an external consumer needs one field.
- Use `subscribe(listener)` when an external consumer needs each complete committed snapshot.
- In React rendering, use `useFormWatch`; a direct `form.values` read does not subscribe the component.

Both subscription methods return idempotent cleanup functions. Store and call them when the subscriber's owner ends.

```ts
const unsubscribe = form.subscribeField('name', (name, previousName) => {
  console.log({ name, previousName });
});

unsubscribe();
```

## Commit semantics

- Changed-field listeners run before whole-form listeners.
- Reentrant updates requested by listeners are queued FIFO until the current notification cycle finishes.
- Listener failures do not roll back an already committed snapshot. All captured listeners are attempted; one failure is rethrown and multiple failures become an `AggregateError`.
- Subscription membership is captured at the start of a commit, so changes made during dispatch apply to the next commit.

Rely on these details only when the application genuinely needs them; keep ordinary integrations at the controller-method and disposer level.
