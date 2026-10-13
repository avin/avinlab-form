# Ядро

`@avinlab/form` не зависит от фреймворка: состояние, императивное чтение, подписки и валидация.

## Создание и обновление

```ts
import { createForm } from '@avinlab/form';

type Profile = { name: string; preferences: { theme: string } };

const form = createForm<Profile>({
  name: '',
  preferences: { theme: 'light' },
});

form.setValue('name', 'Ada');
form.setValue('preferences', { ...form.values.preferences, theme: 'dark' });
form.setValues({ name: 'Grace', preferences: { theme: 'light' } }); // полная замена
```

- `form.values` — текущий неизменяемый снимок; `form.prevValues` — снимок непосредственно перед
  последним реальным коммитом.
- `setValues` заменяет снимок целиком. Это **не** частичный патч.
- Снимки неглубоко замораживаются в development и помечены readonly в TypeScript. Вложенные
  значения не клонируются: заменяйте их через `setValue`.

## Выбор способа чтения

- Читайте `form.values` в обработчиках событий и командах.
- Используйте `subscribeField(name, listener)` для одного поля и `subscribe(listener)` для каждого
  закоммиченного снимка.
- В рендере React используйте `useFormWatch`: чтение `form.values` не подписывает компонент.

```ts
const unsubscribeAge = form.subscribeField('age', (age, previousAge) => {
  console.log({ age, previousAge });
});
const unsubscribeForm = form.subscribe((values, previousValues) => {
  console.log({ values, previousValues });
});

unsubscribeAge();
unsubscribeForm();
```

Оба метода возвращают идемпотентные функции отписки. Вызывайте их, когда заканчивается жизнь
владельца подписки.

## Семантика коммита

- `setValue` и `setValues` сравнивают каждое поле верхнего уровня через `Object.is`. `NaN` равен
  `NaN`, а `0` и `-0` различаются. Объекты меняются только при смене ссылки.
- No-op сохраняет обе ссылки на снимки и не отправляет уведомлений.
- Слушатели изменённых полей вызываются по одному разу и раньше слушателей всей формы. Изменённые
  поля идут в порядке ключей нового снимка; удалённые — в прежнем порядке.
- Обновление, запрошенное из слушателя, ставится в очередь до конца текущего цикла уведомлений.
  Вложенные обновления выполняются FIFO.
- Вызываются все захваченные слушатели. Одна ошибка пробрасывается после рассылки; несколько
  ошибок собираются в один `AggregateError`. Ошибка не откатывает закоммиченный снимок.
- Добавление или удаление слушателей во время рассылки влияет на следующий коммит, а не на текущий
  цикл.
