# Валидация

Валидация синхронная и выдаёт один атомарный неизменяемый результат `{ status, errors }`.
Ориентируйтесь на `status`:

- `unvalidated`: ни один валидатор ещё не завершился для этого запроса.
- `valid`: валидация завершилась без ошибок после нормализации.
- `invalid`: валидация завершилась с одной или несколькими ошибками.

Только `status === 'valid'` означает, что валидация прошла успешно.

## Валидация в ядре

```ts
import { createForm, createFormValidation } from '@avinlab/form';

type Values = { email: string };
type Errors = { email?: string };

const form = createForm<Values>({ email: '' });
const validation = createFormValidation<Errors, Values>(form, (values, previousValues) => ({
  email: values.email.includes('@') ? undefined : 'Invalid email',
}));

const unsubscribe = validation.subscribe((result) => {
  console.log(result.status, result.errors);
});

validation.setValidator(nextValidator); // синхронно пересчитывает текущие значения
validation.validate(); // повторяет текущий валидатор

unsubscribe();
validation.dispose(); // идемпотентно
```

- Валидатор запускается при настройке, после каждого успешного коммита, при замене и при
  `validate()`. Он получает закоммиченные `values` и `prevValues`.
- Возвращённый объект копируется, записи верхнего уровня со значением `undefined` удаляются, а ваш
  объект никогда не мутируется.
- Глубоко равные результаты сохраняют прежнюю ссылку и не рассылают уведомлений. Структуры ошибок
  должны быть ациклическими.
- Без валидатора `result` равен `{ status: 'unvalidated', errors: {} }`.
- Если валидатор бросает исключение, до его проброса публикуется пустой результат `unvalidated`.
- Валидация в ядре владеет подпиской на форму: вызовите `dispose()`, когда владелец завершает
  работу. Уничтоженный контроллер хранит последний результат и игнорирует новые запросы.

## Валидация в React

```tsx
const validateProfile = (values: Readonly<Values>): Errors => ({
  email: values.email.includes('@') ? undefined : 'Invalid email',
});

function Profile({ form }: { form: Form<Values> }) {
  const result = useFormValidation<Errors, Values>(form, validateProfile);
  return <button disabled={result.status !== 'valid'}>Save</button>;
}
```

- Хук возвращает только неизменяемый результат, а контроллер создаёт и уничтожает сам.
- **Идентичность валидатора — это и есть запрос.** Объявляйте валидаторы вне компонента или
  мемоизируйте через `useCallback`; новая функция запрашивает новую валидацию.
- Первый и серверный рендеры имеют статус `unvalidated`. После смены формы или валидатора также
  рендерится пустой результат `unvalidated`, пока именно этот запрос не закоммитится и не пройдёт
  валидацию.
- Один смонтированный хук выполняет одну валидацию на каждый реальный коммит формы.

Вызывайте `useFormValidation` один раз на поддерево валидации и передавайте полный результат
дочерним компонентам через пропсы или свой контекст:

```tsx
function Validation({ form }: { form: Form<ProfileValues> }) {
  const result = useFormValidation<ProfileErrors, ProfileValues>(form, validateProfile);
  return (
    <>
      <AgeError result={result} />
      <Submit result={result} />
    </>
  );
}
```
