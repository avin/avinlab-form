# Генерируемые контролы

`createFormComponent` — необязательный адаптер для библиотек компонентов. Для одиночных DOM-инпутов
обычно понятнее связка `useFormWatch` и `form.setValue`.

Сгенерированный компонент принимает `form` и совместимое имя поля `name`, следит только за этим
полем, подставляет обёрнутому компоненту пропсы значения и изменения и убирает эти пропсы из
своего внешнего типа. Несовместимые привязки полей не проходят проверку типов.

## Привязка по умолчанию

Проп значения по умолчанию — `value`, проп изменения — `onChange`, а извлекаемое значение —
первый аргумент обработчика.

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

## DOM-события и свои имена пропсов

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

`getValue` получает все аргументы обработчика, поэтому может взять и более поздний — для
обработчиков вида `onChange(event, selectedValue)`.

## Ref-ы и композиция

Сгенерированные компоненты сохраняют точный тип ref для обёрнутых `forwardRef` и классовых
компонентов. В React 18 обычный функциональный компонент не получает поддержку ref оттого, что его
обернули.

Адаптер передаёт имя выбранного поля обёрнутому компоненту как `name`; убедитесь, что это
соответствует семантике вашего компонента.
