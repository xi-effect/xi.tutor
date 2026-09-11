# Банк заданий: outcome-события (`math_bank_*` / `math_task_*`)

Документация продуктовой воронки банка заданий. Клики чипов и карточек (`data-umami-event="math-bank-*"`) остаются clickstream и **не** заменяют эти события.

Сводный реестр UI-событий: [`docs/umami-events-svodnoe-opisanie.md`](../umami-events-svodnoe-opisanie.md).

Код: `packages/common.utils/src/productAnalytics/mathBank.ts`.

## Зачем

Понять:

- сколько репетиторов открывают банк (страница `/bank`, пикер на доске, пикер в заметке);
- ищут ли они задания (длина запроса и **выбранные** фильтры, **без текста запроса**);
- открывают ли карточку, ответ, решение, подсказки, другой вариант;
- оставляют ли репорт по заданию;
- добавляют ли в избранное;
- вставляют ли условие на доску или в заметку и как быстро.

**Главная метрика:** доля сессий `math_bank_open` с последующим `math_task_insert_board` или `math_task_insert_note` по `session_id`, плюс медиана `time_to_insert_ms`.

## Воронка одной сессии

```
math_bank_open (source=page | board | editor)
        │
        ├── math_bank_search (query_length + выбранные фильтры, без текста)
        ├── math_task_open
        │         ├── math_task_answer_open / solution_open / hint_open
        │         ├── math_task_copy
        │         ├── math_task_report
        │         ├── math_task_next_variant
        │         └── math_task_favorite_toggle
        └── math_task_insert_board  или  math_task_insert_note
```

`session_id` создаётся заново на каждом `math_bank_open`. `time_to_insert_ms` — миллисекунды от этого открытия до успешной вставки.

## События

Общие поля: `event_version`, `source` (`page` / `board` / `editor`), `session_id` (если sessionStorage доступен).

Текст условия, названия тем, полный поисковый запрос, заметки, содержимое доски и данные ученика **не отправляются**. Тема — идентификатор `topic` / `topic_id`, не человекочитаемое название.

### `math_bank_open`

Открытие страницы банка (роль репетитора) или пикера на доске / в заметке.

### `math_bank_search`

После debounce, если есть запрос или хотя бы один фильтр. Не шлётся на пустой стартовый экран. Пустые массивы, `undefined` и `exam: none` не добавляются.

| Поле                | Смысл                                           |
| ------------------- | ----------------------------------------------- |
| `query_length`      | Длина trim-запроса, только если > 0             |
| `grade`             | Выбранные классы (через запятую)                |
| `topic`             | Выбранные `topic_id`                            |
| `difficulty`        | Выбранные группы сложности                      |
| `exam`              | `OGE` / `EGE_BASE` / `EGE_PROFILE`, если выбран |
| `exam_task_numbers` | Номера КИМ, если выбраны                        |
| `task_type`         | Выбранные типы                                  |
| `favorites_only`    | Только если включён чип «Только избранное»      |

### `math_task_open`

Открытие модалки задания (`task_id`, `subject=mathematics`, `grade`, `topic_id`, `task_type`, `difficulty`).

### `math_task_insert_board` / `math_task_insert_note`

Успешная вставка из пикера. `time_to_insert_ms` от последнего `math_bank_open`.

### `math_task_copy`

Успешное копирование условия в буфер.

### `math_task_solution_open` / `math_task_answer_open` / `math_task_hint_open`

Раскрытие секции (закрытие не трекается).

### `math_task_favorite_toggle`

`action`: `add` или `remove`.

### `math_task_next_variant`

Нашли другой вариант той же группы и переключились.

### `math_task_report`

Репетитор отправил комментарий о проблеме в задании. Поля: `task_id`, `grade`, `topic_id`, `comment`.

`comment` — свободный текст до 500 символов, email и телефон маскируются. Пустой комментарий не уходит. Текст условия задания **не** отправляется.

## Что смотреть в Umami

| Вопрос                           | Как                                                                                                              |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Сколько открытий банка?          | Count `math_bank_open`                                                                                           |
| Откуда чаще открывают?           | То же, breakdown по `source`                                                                                     |
| Доля сессий со вставкой на доску | unique `session_id` в `math_task_insert_board` / unique `session_id` в `math_bank_open` (`source=board` или все) |
| Скорость до вставки              | медиана `time_to_insert_ms`                                                                                      |
| Ищут ли с фильтрами?             | `math_bank_search` с полями `grade` / `topic` / `exam` / …                                                       |

Не смешивать `math-bank-task-open` (клик по карточке) с `math_task_open` (outcome открытия модалки).

## Уведомление об обновлении Terms

В приложении нет готового механизма announcements / what’s new / баннера юридических изменений. Новую модалку ради одного сообщения не делали: пользователи видят актуальные условия по ссылке из дисклеймера банка (`https://sovlium.ru/legal/terms#prava-na-servis`).
