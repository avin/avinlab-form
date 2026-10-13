# React

`@avinlab/react-form` требует React 18 или новее. Он предоставляет `useForm`, `useFormWatch`,
`useFormValidation` и `createFormComponent`. Типы и контроллеры ядра по-прежнему доступны из
`@avinlab/form`.

## Создание и синхронизация формы

`useForm(initialValues)` читает аргумент только при создании контроллера. Рендеры родителя не
сбрасывают ввод пользователя, а возвращаемый `form` безопасно использовать в зависимостях хуков,
контексте и пропсах.

Чтобы заменить значения внешними данными, синхронизируйте явно:

```tsx
const form = useForm(initialProfile);

useEffect(() => {
  form.setValues(profileFromServer);
}, [form, profileFromServer]);
```

`setValues` — полная замена. Если нужен частичный патч, сначала объедините данные с `form.values`.

## Наблюдатели

```tsx
const name = useFormWatch(form, 'name'); // перерисовка при изменении `name`
const values = useFormWatch(form); // один рендер на реальный коммит
```

Держите наблюдателей рядом с выводом, которому нужны данные:

```tsx
function Name({ form }: { form: Form<ProfileValues> }) {
  const name = useFormWatch(form, 'name');
  return <output>{name}</output>;
}
```

- Наблюдатель поля игнорирует чужие коммиты; наблюдатель всей формы обновляется один раз на
  коммит; ни один не обновляется при no-op.
- Если рендер передаёт другое поле или форму, хук сразу читает новый источник, а React освобождает
  старую подписку при коммите.

## Неконтролируемые инпуты

Неконтролируемый инпут читает начальное значение один раз и пишет изменения через контроллер.
Владелец не подписан, поэтому не перерисовывается при правках.

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

Значения DOM — строки: приводите их к типу поля при обновлении.

## Серверный рендеринг

Наблюдатели используют текущий снимок контроллера как серверный снимок. Используйте одинаковые
начальные значения на сервере и при первом клиентском рендере, чтобы получить совместимый с
гидратацией результат. Рендеринг не зависит от эффектов и API браузера.
