# Банк заданий по математике

Версия контента: `mvp-hard-v3-2026-09-10` + `historical-archetypes-v1-2026-09-10`  
Контент: **21 000** заданий по математике, 5–11 классы, РФ.

Пакет `features.math.bank` — схема, поиск MiniSearch и клиентская загрузка gzip-шардов. Интерфейс раздела живёт в `pages.math-bank`.

Первые 9 000 задач (`math-ru-00001` … `math-ru-09000`) сохранены. Ещё 12 000 (`math-ru-09001` … `math-ru-21000`) построены по историческим архетипам (Киселёв, Рыбкин, Шапошников–Вальцов), без копирования текстов источников. Подробности — в `HISTORICAL_EXPANSION.md`.

## Команды

```bash
pnpm --filter features.math.bank math-bank:build
pnpm --filter features.math.bank math-bank:qa
```

`math-bank:build` читает только `content/tasks.source.json.gz` и воспроизводимо создаёт runtime-файлы в `public/math-bank/`.

Повторно дописать исторические задачи в source (уже включены в этот релиз):

```bash
pnpm --filter features.math.bank math-bank:append-historical
```

Приложению в production нужны:

- `search_documents.json.gz`
- `by_grade/grade-5.json.gz` … `grade-11.json.gz`
- `catalog.json`
- `exam_index_2026.json`

`tasks.json` / `tasks.jsonl` в CDN не публикуются.

## Поиск

На старте загружается `search_documents.json.gz`. После открытия карточки догружается gzip-шард класса и кешируется в памяти.

## Ограничение

Автоматический QA проверяет структуру и консистентность, но не заменяет педагогическую редактуру.
