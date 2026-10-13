# API cheat sheet

## `@avinlab/form`

| Export | Purpose |
| --- | --- |
| `createForm(initialValues)` | Creates the stable form controller. |
| `form.values` / `form.prevValues` | Current and previous readonly snapshots. |
| `form.setValue(name, value)` | Replaces one top-level field. |
| `form.setValues(values)` | Replaces the whole snapshot (not a patch). |
| `form.subscribe(listener)` | Listens to every commit; returns an idempotent disposer. |
| `form.subscribeField(name, listener)` | Listens to one field; returns an idempotent disposer. |
| `createFormValidation(form, validator)` | Derives a synchronous validation controller. |
| `validation.result` | Readonly `{ status, errors }`. |
| `validation.setValidator(validator)` | Replaces the validator and revalidates synchronously. |
| `validation.validate()` | Repeats the current validator. |
| `validation.subscribe(listener)` | Receives complete results; returns a disposer. |
| `validation.dispose()` | Releases the form subscription and listeners. |

Types: `Form`, `UpdateHandler`, `FormValues`, `FormValidation`, `ValidationFunction`,
`FormErrors`, `ValidationResult`, `ValidationStatus`.

## `@avinlab/react-form`

| Export | Purpose |
| --- | --- |
| `useForm(initialValues)` | Stable controller; reads initial values once. |
| `useFormWatch(form, name)` | Re-renders when one field changes. |
| `useFormWatch(form)` | Re-renders once per real commit. |
| `useFormValidation(form, validator)` | Returns a readonly `ValidationResult`; owns the controller. |
| `createFormComponent(Component, options?)` | Generates a controlled component bound to a form field. |

`createFormComponent` options: `valueAttrName` (default `value`), `onChangeAttrName` (default
`onChange`), `getValue` (default: first handler argument).
