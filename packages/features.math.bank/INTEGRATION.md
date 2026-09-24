# Интеграция в frontend sovlium

Ниже — рекомендуемый вариант для pnpm/Turborepo. Названия директорий можно адаптировать под текущую структуру.

## 1. Код feature

Перенести:

```text
src/features/math-bank/*
```

в существующий frontend-пакет математических фич, например:

```text
packages/features.math/src/math-bank/
```

Публичный API оставить через `index.ts`.

## 2. Контент

Канонический source лучше держать вне импортируемого frontend graph:

```text
content/math-bank/tasks.source.json.gz
```

Не импортировать 21 000 задач в Vite как TS/JSON module — это ухудшит dev startup, HMR и память.

## 3. Runtime assets

Build-скрипт должен складывать runtime-файлы в public приложения:

```text
apps/web/public/math-bank/
```

В standalone-архиве это `public/math-bank/`.

Для production реально нужны:

```text
search_documents.json.gz
by_grade/grade-5.json.gz
...
by_grade/grade-11.json.gz
catalog.json
exam_index_2026.json
```

`tasks.json`, `tasks.jsonl` и полный `tasks.json.gz` можно оставить только CI/artifact output и не публиковать на CDN.

## 4. Поиск

Пример инициализации:

```ts
const documents = await loadMathSearchDocuments('/math-bank');
const mathSearch = createMathTaskSearch(documents);

const results = mathSearch.search('квадратные уравнения', {
  grades: [8, 9],
  difficulty: [3, 4],
});
```

После клика по результату:

```ts
const task = await loadMathTaskById(result.id, result.grade, '/math-bank');
```

Таким образом полный банк не попадает ни в JS bundle, ни в память вкладки.

## 5. Zustand

В persist-store хранить только пользовательское состояние:

```ts
type MathBankUserState = {
  favoriteTaskIds: string[];
  recentTaskIds: string[];
};
```

Сами задания в Zustand/localStorage не дублировать.

## 6. tldraw

Не передавать `figure` напрямую в tldraw. Сделать отдельный адаптер:

```ts
mathTaskFigureToTldrawRecords(figure);
```

`MathTaskFigure` остаётся стабильным semantic contract банка, а адаптер знает текущую версию shapes sovlium.

## 7. CI

Минимальный check перед merge изменения контента:

```bash
pnpm math-bank:build
pnpm math-bank:qa
git diff --exit-code public/math-bank/catalog.json public/math-bank/exam_index_2026.json
```

Если generated runtime assets решите не коммитить, последний `git diff` не нужен: их можно создавать в CI/build приложения.

## 8. Новые задания

Новые генераторы писать только в TypeScript через `MathTaskFamily`. После генерации:

1. проверить family-specific математические инварианты;
2. проверить Zod;
3. проверить fingerprint/дубли;
4. провести редакторскую выборку;
5. добавить прошедшие задачи в canonical `tasks.source.json.gz`;
6. пересобрать runtime assets.

Генерацию случайных заданий при каждом production build делать не стоит — контент должен быть детерминированным и ревьюируемым.
