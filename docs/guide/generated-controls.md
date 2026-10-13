# Generated controls

`createFormComponent` is an optional adapter for component libraries. For one-off DOM inputs,
`useFormWatch` plus `form.setValue` is usually clearer.

The generated component accepts `form` and a compatible field `name`, watches only that field,
supplies the wrapped component's value and change props, and removes those binding-owned props from
its caller-facing type. Incompatible field bindings fail type checking.

## Default binding

The value prop defaults to `value`, the change prop to `onChange`, and the extracted value to the
handler's first argument.

```tsx
interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

const TextInput = ({ value, onChange, label }: TextInputProps) => (
  <label>
    {label}
    <input value={value} onChange={(event) => onChange(event.currentTarget.value)} />
  </label>
);
const FormTextInput = createFormComponent(TextInput);

<FormTextInput form={form} name="email" label="Email" />;
```

## DOM events and custom prop names

```tsx
const FormDomTextInput = createFormComponent(DomTextInput, {
  getValue: (event: React.ChangeEvent<HTMLInputElement>) => event.currentTarget.value,
});

const FormToggle = createFormComponent(Toggle, {
  valueAttrName: 'checked',
  onChangeAttrName: 'onToggle',
  getValue: (event: React.ChangeEvent<HTMLInputElement>) => event.currentTarget.checked,
});
```

`getValue` receives every change-handler argument, so it can extract a later one for handlers like
`onChange(event, selectedValue)`.

## Refs and composition

Generated components keep the precise ref type of wrapped `forwardRef` and class components. In
React 18, an ordinary function component does not become ref-capable by being wrapped.

The adapter passes the selected field name to the wrapped component as `name`; check that this
matches your component's semantics.
