# Generated controlled components

Use `createFormComponent` as an optional component-library adapter. For one-off DOM inputs, direct `useFormWatch` plus `form.setValue` is usually clearer.

The generated component:

- accepts `form` and a compatible field `name`;
- watches only that field;
- supplies the wrapped component's value and change props;
- removes binding-owned props from its caller-facing type;
- checks that the selected field, value prop, and extracted change value are type-compatible.

## Default binding

The default value prop is `value`, the default change prop is `onChange`, and the default extracted value is the handler's first argument.

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

Configure extraction when a handler receives an event or multiple arguments.

```tsx
interface DomTextInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const DomTextInput = (props: DomTextInputProps) => <input {...props} />;

const FormDomTextInput = createFormComponent(DomTextInput, {
  getValue: (event: React.ChangeEvent<HTMLInputElement>) => event.currentTarget.value,
});

const FormToggle = createFormComponent(Toggle, {
  valueAttrName: 'checked',
  onChangeAttrName: 'onToggle',
  getValue: (event: React.ChangeEvent<HTMLInputElement>) => event.currentTarget.checked,
});
```

`getValue` receives every change-handler argument, so it can extract a later argument when a component calls a handler such as `onChange(event, selectedValue)`.

## Refs and composition

Generated components preserve the precise ref type for wrapped `forwardRef` components and class components. Under React 18, wrapping an ordinary function component does not make it ref-capable.

The adapter passes the selected field name to the wrapped component as `name`. Confirm that this matches the wrapped component's semantics when composing custom controls.

Infer generated-component props from the wrapped component and binding options.
