# xi.tutor

> Это репозиторий основного приложения, который делает команда xi.team
> Продукт направлен на цифровизацию работы репетиторов – [app.xieffect.ru](https://app.xieffect.ru/)

## Начало работы

Выполните установку зависимостей, запустив команду в корне репозитория:

```bash
npm i
```

> Если зависимости не устанавливаются, возможно, потребуется использовать флаг --legacy-peer-deps.

Запустите следующую команду в корне репозитория для начала локальной разработки:

```bash
npm run dev
```

> Запустится xi.web на http://localhost:5173/, а также все пакеты перейдут в режим HMR.

## Вспомогательные команды

Запуск eslint во всех пакетах и приложениях, выполнить из корня:

```bash
npm run lint
```

Запуск prettier во всех пакетах и приложениях, выполнить из корня:

```bash
npm run format
```

Prettier без перезаписи, просто проверка на форматирование:

```bash
npm run format-check
```

## Технологии

Репозиторий:

- Turborepo – инструмент для создания и управления монорепозиториями
- Prettier – форматирование кода
- Eslint – линтер с правилами написания кода
- Husky - инструмент вызова прекоммит хуков в git, позволяет прогонять eslint и prettier перед созданием коммита в репозитории
- CommilLint – линтер наименования коммитов

Приложения (apps/xi.web):

- TypeScript v5 ([рекомендации по использованию](https://docs.xieffect.ru/docs/frontend/tech/typescript))
- React v19 ([рекомендации по использованию](https://docs.xieffect.ru/docs/frontend/tech/react))
- Tailwind v3 ([рекомендации по использованию](https://docs.xieffect.ru/docs/frontend/tech/tailwind))
- Vite – сборка проекта
- Zustand – управление состоянием в приложении
- axios (?) – работа с RestAPI
- SocketIO – взаимодействие с WebSockets
- Tanstack/router – организация роутинга на основе файловой системе и управление навигацией
- Tanstack/query – организация кеширования и управления данными, полученными с сервера

Пакеты (packages/\*):

- TypeScript v5 ([рекомендации по использованию](https://docs.xieffect.ru/docs/frontend/tech/typescript))
- React v19 ([рекомендации по использованию](https://docs.xieffect.ru/docs/frontend/tech/react))
- Tailwind v3 ([рекомендации по использованию](https://docs.xieffect.ru/docs/frontend/tech/tailwind))
- Zustand – управление состоянием в приложении
- axios (?) – работа с RestAPI
- SocketIO – взаимодействие с WebSockets
- Tanstack/router – организация роутинга на основе файловой системе и управление навигацией
- Tanstack/query – организация кеширования и управления данными, полученными с сервера

## UIkit

Мы используем собственную библиотеку компонент:

- [Storebook](https://xi-storybook.vercel.app/)
- [npm registry](https://www.npmjs.com/~xi.effect)
- [тестовая среда](https://xi-playground.vercel.app/)

Базовые элементы интерфейса мы выносим в эту библиотеку, созданную на основе дизайн-системы и макетов от команды Дизайна

## Архитектура
