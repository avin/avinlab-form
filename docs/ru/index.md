---
layout: home

hero:
  name: avinlab-form
  text: Небольшие контроллеры форм для TypeScript и React
  tagline: Один стабильный контроллер на форму, неизменяемые снимки значений и подписки ровно той ширины, которая нужна.
  actions:
    - theme: brand
      text: Быстрый старт
      link: /ru/guide/getting-started
    - theme: alt
      text: Введение
      link: /ru/guide/introduction
    - theme: alt
      text: GitHub
      link: https://github.com/avin/avinlab-form

features:
  - title: Стабильный контроллер
    details: Форма сохраняет одну и ту же идентичность всё время жизни, поэтому её безопасно передавать в зависимости хуков, пропсы и контекст.
  - title: Неизменяемые снимки
    details: Значения меняются только через `setValue` и `setValues`. Каждый коммит заменяет снимок и сохраняет предыдущий.
  - title: Точечный рендер
    details: Следите за одним полем или за всей формой. Посторонние поля и no-op обновления ничего не перерисовывают.
  - title: Синхронная валидация
    details: Один атомарный результат `{ status, errors }`, который отличает `unvalidated` от `valid`.
---

## Идея за 30 секунд

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
      <input value={name} onChange={(e) => form.setValue('name', e.currentTarget.value)} />
      {validation.errors.name && <span>{validation.errors.name}</span>}
      <button disabled={validation.status !== 'valid'}>Save</button>
    </form>
  );
}
```

Готовы? Начните с [введения](/ru/guide/introduction) или сразу переходите к
[быстрому старту](/ru/guide/getting-started).
