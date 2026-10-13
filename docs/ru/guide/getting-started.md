# Быстрый старт

## Установка

```sh
npm install @avinlab/form @avinlab/react-form
```

`@avinlab/react-form` требует React 18 или новее. Если React-обвязка не нужна, ставьте только
`@avinlab/form`.

## Первая форма на React

```tsx
import { useCallback } from 'react';
import { useForm, useFormValidation, useFormWatch } from '@avinlab/react-form';

type Values = { name: string };
type Errors = { name?: string };

export function ProfileForm() {
  const form = useForm<Values>({ name: '' });
  const name = useFormWatch(form, 'name');
  const validate = useCallback(
    (values: Readonly<Values>): Errors => ({
      name: values.name ? undefined : 'Name is required',
    }),
    [],
  );
  const validation = useFormValidation<Errors, Values>(form, validate);

  return (
    <form>
      <label>
        Name
        <input
          value={name}
          onChange={(event) => form.setValue('name', event.currentTarget.value)}
        />
      </label>
      {validation.errors.name && <span>{validation.errors.name}</span>}
      <button disabled={validation.status !== 'valid'}>Save</button>
    </form>
  );
}
```

Что здесь происходит:

- `useForm` возвращает один и тот же контроллер всё время жизни компонента. Начальные значения
  читаются один раз.
- `useFormWatch(form, 'name')` перерисовывает компонент только при изменении `name`.
- `useFormValidation` возвращает неизменяемый результат `{ status, errors }`. Только
  `status === 'valid'` означает, что валидация завершилась успешно.

## Без React

```ts
import { createForm } from '@avinlab/form';

const form = createForm({ name: 'Bob', age: 20 });
const unsubscribe = form.subscribeField('age', (age, previousAge) => {
  console.log({ age, previousAge });
});

form.setValue('age', 21);
unsubscribe();
```

## Что дальше

- [Ядро](/ru/guide/core): снимки, обновления, подписки, семантика коммита.
- [React](/ru/guide/react): синхронизация, наблюдатели, SSR.
- [Валидация](/ru/guide/validation): валидация в ядре и в React.
- Работающие рецепты лежат в
  [`examples/react/src/examples`](https://github.com/avin/avinlab-form/tree/master/examples/react/src/examples).
