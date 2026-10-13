# Core controller

`@avinlab/form` is framework-independent: state, imperative reads, subscriptions, and validation.

## Creating and updating

```ts
import { createForm } from '@avinlab/form';

type Profile = { name: string; preferences: { theme: string } };

const form = createForm<Profile>({
  name: '',
  preferences: { theme: 'light' },
});

form.setValue('name', 'Ada');
form.setValue('preferences', { ...form.values.preferences, theme: 'dark' });
form.setValues({ name: 'Grace', preferences: { theme: 'light' } }); // full replacement
```

- `form.values` is the current readonly snapshot; `form.prevValues` is the snapshot right before
  the latest real commit.
- `setValues` replaces the whole snapshot. It is **not** a partial patch.
- Snapshots are shallow-frozen in development and readonly in TypeScript. Nested values are not
  cloned: replace them through `setValue`.

## Choosing a read path

- Read `form.values` for event handlers and commands.
- Use `subscribeField(name, listener)` for one field and `subscribe(listener)` for every committed
  snapshot.
- In React rendering use `useFormWatch`: reading `form.values` does not subscribe a component.

```ts
const unsubscribeAge = form.subscribeField('age', (age, previousAge) => {
  console.log({ age, previousAge });
});
const unsubscribeForm = form.subscribe((values, previousValues) => {
  console.log({ values, previousValues });
});

unsubscribeAge();
unsubscribeForm();
```

Both methods return idempotent cleanup functions. Call them when the subscriber's owner ends.

## Commit semantics

- `setValue` and `setValues` compare every top-level field with `Object.is`. `NaN` equals `NaN`,
  while `0` and `-0` differ. Objects change only when their reference changes.
- A no-op preserves both snapshot references and sends no notification.
- Changed-field listeners run once each, before whole-form listeners. Changed fields follow the
  key order of the next snapshot; removed fields follow their previous order.
- An update requested by a listener is queued until the current notification cycle finishes.
  Reentrant updates run FIFO.
- Every captured listener is attempted. One failure is rethrown after dispatch; several failures
  are reported in one `AggregateError`. A failure does not roll back the committed snapshot.
- Adding or removing listeners during dispatch affects the next commit, not the current cycle.
