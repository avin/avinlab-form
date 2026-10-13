---
layout: home

hero:
  name: "@avinlab/form"
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
import {
  createFormComponent,
  useForm,
  useFormValidation,
  useFormWatch,
} from '@avinlab/react-form';

type Values = { email: string; password: string; repeat: string; newsletter: boolean };
type Errors = Partial<Record<keyof Values, string>>;

// Синхронный валидатор. Объявлен вне компонента, поэтому его идентичность стабильна.
const validate = (values: Readonly<Values>): Errors => ({
  email: values.email.includes('@') ? undefined : 'Введите корректный email',
  password: values.password.length >= 8 ? undefined : 'Минимум 8 символов',
  repeat: values.repeat === values.password ? undefined : 'Пароли не совпадают',
});

// Необязательно: превращаем любой контролируемый компонент в привязанный к форме.
const FormInput = createFormComponent(TextInput); // value / onChange(value)
const FormCheckbox = createFormComponent(Checkbox, {
  valueAttrName: 'checked',
  getValue: (event: React.ChangeEvent<HTMLInputElement>) => event.currentTarget.checked,
});

// Следит только за одним полем: перерисовывается при изменении `password`, но не других полей.
function PasswordStrength({ form }: { form: Form<Values> }) {
  const password = useFormWatch(form, 'password');
  return <output>Надёжность: {password.length >= 12 ? 'высокая' : 'низкая'}</output>;
}

export function SignupForm() {
  const form = useForm<Values>({ email: '', password: '', repeat: '', newsletter: false });
  const { status, errors } = useFormValidation<Errors, Values>(form, validate);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        signUp(form.values); // императивное чтение: без подписки и без перерисовки
      }}
    >
      <FormInput form={form} name="email" label="Email" error={errors.email} />
      <FormInput form={form} name="password" label="Пароль" error={errors.password} />
      <FormInput form={form} name="repeat" label="Повтор пароля" error={errors.repeat} />
      <PasswordStrength form={form} />
      <FormCheckbox form={form} name="newsletter" label="Присылать новости" />

      {/* setValues заменяет весь снимок: для патча разверните текущие значения */}
      <button
        type="button"
        onClick={() => form.setValues({ ...form.values, password: '', repeat: '' })}
      >
        Очистить пароли
      </button>
      <button disabled={status !== 'valid'}>Зарегистрироваться</button>
    </form>
  );
}
```

Что дают эти несколько строк:

- `form` — один стабильный контроллер. Поля привязываются один раз через `createFormComponent`, и
  каждое следит только за своим значением.
- Валидация — один атомарный результат `{ status, errors }`, и она может смотреть сразу на
  несколько полей (проверка *повтора*). Кнопка отправки активна только при `status === 'valid'`, а
  не просто «ошибок пока нет».
- `createFormComponent` привязывает готовые контролируемые компоненты с полной проверкой типов:
  тип поля должен совпадать с типом пропа значения.
- Запись идёт через `setValue` / `setValues`; чтение в обработчиках — обычный `form.values`.

Готовы? Начните с [введения](/ru/guide/introduction) или сразу переходите к
[быстрому старту](/ru/guide/getting-started).
