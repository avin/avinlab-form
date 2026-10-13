# Миграция с V4 на V5

V5 сохраняет центральную модель — изменяемый контроллер формы, — но делает снимки неизменяемыми,
подписки основанными на функциях отписки, а валидацию атомарной. Этот документ содержит историю
релиза; [основной README](https://github.com/avin/avinlab-form#readme) описывает только итоговый
интерфейс.

## Карта изменений

### Контроллер формы

| V4 | V5 | Миграция |
| --- | --- | --- |
| `form.onUpdate(listener)` | `form.subscribe(listener)` | Сохраните возвращённую функцию отписки. |
| `form.offUpdate(listener)` | функция отписки из `subscribe` | Вызовите её; хранить слушателя больше не нужно. |
| `form.onUpdateField(name, listener)` | `form.subscribeField(name, listener)` | Сохраните возвращённую функцию отписки. |
| `form.offUpdateField(name, listener)` | функция отписки из `subscribeField` | Вызовите её. |
| изменяемые типы `form.values` / `form.prevValues` | неизменяемые снимки | Используйте `setValue` или `setValues`; вложенные значения заменяйте, а не мутируйте. |

`createForm`, `setValue` и полная замена через `setValues` сохранили имена. Обе функции отписки
идемпотентны.

```ts
const unsubscribeForm = form.subscribe((values, previousValues) => {
  console.log(values, previousValues);
});
const unsubscribeName = form.subscribeField('name', (name, previousName) => {
  console.log(name, previousName);
});

unsubscribeName();
unsubscribeForm();
```

### Валидация в ядре

| V4 или промежуточный член | V5 | Миграция |
| --- | --- | --- |
| `validation.errors` | `validation.result.errors` | Читайте ошибки из полного результата. |
| `validation.isValid` | `validation.result.status === 'valid'` | Не считайте `unvalidated` валидным. |
| промежуточное `validation.state` | `validation.result.status` | Читайте статус из полного результата. |
| промежуточный тип `ValidationState` | `ValidationStatus` | Переименуйте импортируемое исчерпывающее объединение из трёх значений. |
| `validation.setValidation(validator)` | `validation.setValidator(validator)` | Замена теперь синхронно пересчитывает текущие значения. |
| `validation.onValidate(listener)` | `validation.subscribe(listener)` | Слушатель получает полный результат, а не только ошибки. |
| `validation.offValidate(listener)` | функция отписки из `subscribe` | Вызовите её. |
| нет очистки жизненного цикла | `validation.dispose()` | Уничтожайте долгоживущую производную валидацию, когда её владелец завершает работу. |

Новые типы — `ValidationResult<Errors>` и `ValidationStatus`, где статус строго
`'unvalidated' | 'valid' | 'invalid'`.

```ts
const validation = createFormValidation(form, validateProfile);
const unsubscribe = validation.subscribe((result) => {
  console.log(result.status, result.errors);
});

validation.setValidator(nextValidator);
validation.validate();

unsubscribe();
validation.dispose();
```

### Валидация в React

| V4 или промежуточный член | V5 | Миграция |
| --- | --- | --- |
| контроллер, возвращаемый `useFormValidation` | неизменяемый `ValidationResult` | Читайте `result.status` и `result.errors`; методы жизненного цикла больше не открыты. |
| `useFormValidationError` | замены в библиотеке нет | Вызовите `useFormValidation` один раз и передайте полный результат через пропсы или свой контекст. |
| `useFormValidationState` | замены в библиотеке нет | Читайте `result.status` из того же полного результата. |
| `useFormValidationStatus` | замены в библиотеке нет | Читайте `result.status`; этот промежуточный алиас не экспортируется. |

Минимальная версия React теперь 18. `useForm` и обе перегрузки `useFormWatch` сохранили имена.

```tsx
function Validation({ form }: { form: Form<ProfileValues> }) {
  const result = useFormValidation<ProfileErrors, ProfileValues>(form, validateProfile);
  return <ProfileFields result={result} />;
}
```

Объявляйте валидаторы вне компонентов или мемоизируйте замыкания через `useCallback`. Идентичность
валидатора входит в запрос: смена формы или валидатора рендерит пустой результат `unvalidated`, пока
именно этот запрос не закоммитится и не пройдёт валидацию. Первый и серверный рендеры тоже
`unvalidated`. Исключение валидатора возвращает пустой результат `unvalidated` до своего проброса.
Размонтирование или смена источника освобождает контроллер валидации, которым владеет хук, и все
подписки; приложению не нужно уничтожать результат, принадлежащий React.

### Генерируемые контролы

| V4 | V5 | Миграция |
| --- | --- | --- |
| `createFormComponent` | `createFormComponent` | Продолжайте использовать единственный публичный помощник. |
| `useFormControlProps` | внутренний | Привязывайте напрямую через `useFormWatch` + `setValue` или используйте `createFormComponent`. |
| экспортируемый `FormComponentProps` | выводится | Позвольте сгенерированному компоненту вывести свои пропсы. |
| экспортируемый `FormInputControlOptions` | выводится | Передайте объект опций прямо в `createFormComponent`. |

`createFormComponent` остаётся необязательным. `valueAttrName`, `onChangeAttrName` и `getValue`
по-прежнему поддерживают контролы вроде чекбоксов и кастомные, а несовместимые привязки полей
теперь не проходят проверку типов.

## Изменения поведения, которые нужно учесть

### Начальная валидация

Валидация в ядре, созданная без валидатора, стартует как `{ status: 'unvalidated', errors: {} }`.
React всегда стартует с тем же результатом, включая SSR, а затем валидирует после коммита
запрошенной формы и валидатора. Только `status === 'valid'` означает, что валидатор завершился без
ошибок.

### Замена форм и валидаторов

`useForm(initialValues)` по-прежнему читает начальные значения один раз. Чтобы применить внешние
данные, явно вызовите `form.setValues(nextValues)`. В React смена `form` или валидатора в
`useFormValidation` временно даёт пустой результат `unvalidated`. В ядре `setValidator`
перевалидирует синхронно до возврата.

### Исключения валидатора

Когда валидатор бросает исключение, текущий результат становится пустым и `unvalidated` до
проброса того же исключения. Не продолжайте показывать прежний успешный результат после перехвата
ошибки.

### Нормализация ошибок и эквивалентные результаты

V5 копирует объект, возвращённый валидатором, удаляет свойства верхнего уровня со значением
`undefined` и замораживает нормализованный снимок ошибок. Объект самого валидатора никогда не
мутируется. Возвращайте новый объект как обычно; не полагайтесь на то, что валидация удалит
`undefined`-свойства из объекта, который хранит ваше приложение.

Если завершённая валидация даёт тот же статус и глубоко структурно равные нормализованные ошибки,
ссылка на полный `result` сохраняется, а подписчики не уведомляются. Независимо созданные вложенные
объекты и массивы с одинаковым содержимым эквивалентны; структуры ошибок должны быть ациклическими.
Поэтому коммит формы может запустить валидацию без уведомления, если нормализованный результат
эквивалентен.

### Подписки на полный результат и очистка

Подписчики валидации теперь получают `{ status, errors }` атомарно. Каждый вызов `subscribe` и
`subscribeField` возвращает функцию очистки. Вызывайте отписки формы и валидации на границе
жизненного цикла владельца и `validation.dispose()` для контроллеров валидации в ядре. React сам
владеет контроллерами, созданными `useFormValidation`, и очищает их.

## Проверяемые примеры

Итоговый API покрыт небольшими строго компилируемыми рецептами в
[`examples/react/src/examples`](https://github.com/avin/avinlab-form/tree/master/examples/react/src/examples).
Поведение наблюдателей, переключения источников, исключений, подписок и очистки в React, чувствительное
к миграции, остаётся покрыто публичными тестами пакетов.
