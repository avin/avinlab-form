# Шпаргалка по API

## `@avinlab/form`

| Экспорт | Назначение |
| --- | --- |
| `createForm(initialValues)` | Создаёт стабильный контроллер формы. |
| `form.values` / `form.prevValues` | Текущий и предыдущий неизменяемые снимки. |
| `form.setValue(name, value)` | Заменяет одно поле верхнего уровня. |
| `form.setValues(values)` | Заменяет весь снимок (не патч). |
| `form.subscribe(listener)` | Слушает каждый коммит; возвращает идемпотентную функцию отписки. |
| `form.subscribeField(name, listener)` | Слушает одно поле; возвращает идемпотентную функцию отписки. |
| `createFormValidation(form, validator)` | Создаёт производный синхронный контроллер валидации. |
| `validation.result` | Неизменяемый `{ status, errors }`. |
| `validation.setValidator(validator)` | Заменяет валидатор и синхронно перевалидирует. |
| `validation.validate()` | Повторяет текущий валидатор. |
| `validation.subscribe(listener)` | Получает полные результаты; возвращает функцию отписки. |
| `validation.dispose()` | Освобождает подписку на форму и слушателей. |

Типы: `Form`, `UpdateHandler`, `FormValues`, `FormValidation`, `ValidationFunction`,
`FormErrors`, `ValidationResult`, `ValidationStatus`.

## `@avinlab/react-form`

| Экспорт | Назначение |
| --- | --- |
| `useForm(initialValues)` | Стабильный контроллер; начальные значения читаются один раз. |
| `useFormWatch(form, name)` | Перерисовка при изменении одного поля. |
| `useFormWatch(form)` | Один рендер на каждый реальный коммит. |
| `useFormValidation(form, validator)` | Возвращает неизменяемый `ValidationResult`; сам владеет контроллером. |
| `createFormComponent(Component, options?)` | Генерирует контролируемый компонент, привязанный к полю формы. |

Опции `createFormComponent`: `valueAttrName` (по умолчанию `value`), `onChangeAttrName` (по
умолчанию `onChange`), `getValue` (по умолчанию первый аргумент обработчика).
