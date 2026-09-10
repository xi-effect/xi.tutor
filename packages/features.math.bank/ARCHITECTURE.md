# Архитектура Math Bank

## 1. Канонический контент

`content/tasks.source.json.gz` — единственный source-of-truth для утверждённых 21 000 задач.

Почему не `.ts` на 36 МБ:

- контент не является программным кодом;
- огромный TS-модуль ухудшит IDE, typecheck и сборку;
- JSON легко валидировать и версионировать;
- runtime всё равно получает JSON/gzip;
- изменения контента хорошо видны отдельными экспортами/QA.

## 2. Сборка

`scripts/build-bank.ts` пересчитывает derived-поля и строит runtime-ассеты. Скрипт не меняет ID, математическое содержание или решения.

## 3. Клиент

`load.ts` загружает лёгкий поисковый корпус и grade shard. `search.ts` строит MiniSearch index локально. Это позволяет держать поиск полностью frontend-only для текущего масштаба.

## 4. Схема

Zod — runtime validation contract, а TS-типы выводятся из неё. При интеграции в monorepo желательно импортировать `MathTask` только из `model/schema.ts`, а не дублировать interface.

## 5. Генерация новых задач

Новые семейства — TS-модули с `MathTaskFamily` или исторические архетипы в `src/generation/historical/catalog.ts` (скрипт `scripts/append-historical-tasks.ts`). Генерация должна быть детерминированной по seed. Сгенерированный контент после QA добавляется в canonical source, а не генерируется заново при каждом production build.

Это принципиально разделяет:

- **authoring/generation** — создание контента;
- **content build** — индексы, gzip, каталоги;
- **runtime** — поиск, просмотр, вставка на tldraw.
