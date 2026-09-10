# Банк заданий: outcome-события (`math_bank_*` / `math_task_*`)

Документация продуктовой воронки банка заданий. Клики чипов и карточек (`data-umami-event="math-bank-*"`) остаются clickstream и **не** заменяют эти события.

Сводный реестр UI-событий: [`docs/umami-events-svodnoe-opisanie.md`](../umami-events-svodnoe-opisanie.md).

Код: `packages/common.utils/src/productAnalytics/mathBank.ts`.

## Зачем

Понять:

- сколько репетиторов открывают банк (страница `/bank`, пикер на доске, пикер в заметке);
- ищут ли они задания (длина запроса и активные фильтры, **без текста запроса**);
- открывают ли карточку, ответ, решение, подсказки, другой вариант;
- оставляют ли репорт по заданию;
- добавляют ли в избранное;
- вставляют ли условие на доску или в заметку и как быстро.

**Главная метрика:** доля сессий `math_bank_open` с последующим `math_task_insert_board` или `math_task_insert_note` по `session_id`, плюс медиана `time_to_insert_ms`.

## Воронка одной сессии

```
math_bank_open (source=page | board | editor)
        │
        ├── math_bank_search (query_length + фильтры, без текста)
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

Текст условия, названия тем, полный поисковый запрос **не отправляются**. Тема — только `topic_id`.

### `math_bank_open`

Открытие страницы банка (роль репетитора) или пикера на доске / в заметке.

### `math_bank_search`

После debounce, если есть запрос или хотя бы один фильтр. Не шлётся на пустой стартовый экран.

| Поле                                                                                    | Смысл                                       |
| --------------------------------------------------------------------------------------- | ------------------------------------------- |
| `query_length`                                                                          | Длина trim-запроса                          |
| `has_query` / `has_filters`                                                             | Флаги                                       |
| `grades_count`, `topics_count`, `difficulty_count`, `types_count`, `exam_numbers_count` | Сколько значений выбрано                    |
| `exam`                                                                                  | `OGE` / `EGE_BASE` / `EGE_PROFILE` / `none` |
| `favorites_only`                                                                        | Чип «Только избранное»                      |

### `math_task_open`

Открытие модалки задания на странице банка (`task_id`, `grade`, `topic_id`, `task_type`, `difficulty`).

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
| Ищут ли с фильтрами?             | `math_bank_search` с `has_filters=true`                                                                          |

Не смешивать `math-bank-task-open` (клик по карточке) с `math_task_open` (outcome открытия модалки).
