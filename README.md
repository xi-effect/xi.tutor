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
- Tailwind v4 ([рекомендации по использованию](https://docs.xieffect.ru/docs/frontend/tech/tailwind))
- Vite – сборка проекта
- Zustand – управление состоянием в приложении
- axios (?) – работа с RestAPI
- SocketIO – взаимодействие с WebSockets
- Tanstack/router – организация роутинга на основе файловой системы и управление навигацией
- Tanstack/query – организация кеширования и управления данными, полученными с сервера

Пакеты (packages/\*):

- TypeScript v5 ([рекомендации по использованию](https://docs.xieffect.ru/docs/frontend/tech/typescript))
- React v19 ([рекомендации по использованию](https://docs.xieffect.ru/docs/frontend/tech/react))
- Tailwind v4 ([рекомендации по использованию](https://docs.xieffect.ru/docs/frontend/tech/tailwind))
- Zustand – управление состоянием в приложении
- axios (?) – работа с RestAPI
- SocketIO – взаимодействие с WebSockets
- Tanstack/router – организация роутинга на основе файловой системы и управление навигацией
- Tanstack/query – организация кеширования и управления данными, полученными с сервера

## UIkit

Мы используем собственную библиотеку компонент:

- [Storebook](https://xi-storybook.vercel.app/)
- [npm registry](https://www.npmjs.com/~xi.effect)
- [тестовая среда](https://xi-playground.vercel.app/)

Базовые элементы интерфейса мы выносим в эту библиотеку, созданную на основе дизайн-системы и макетов от команды Дизайна

## Архитектура

Проект построен по принципу монорепозитория с использованием Turborepo, что позволяет организовать код в модули и приложения.

### Структура проекта

```
xi.tutor/
├── apps/                       # Приложения
│   └── xi.web/                 # Основное фронтенд-приложение
├── packages/                   # Переиспользуемые пакеты
│   ├── common.*                # Общие компоненты и утилиты
│   │   ├── common.api/         # API клиенты и интеграции
│   │   ├── common.config/      # Конфигурация
│   │   ├── common.entities/    # Общие сущности и типы
│   │   ├── common.eslint/      # Конфигурация ESLint
│   │   ├── common.env/         # Переменные окружения
│   │   ├── common.services/    # Общие сервисы
│   │   ├── common.typescript/  # Конфигурация TypeScript и утилитные типы
│   │   └── common.ui/          # Базовые UI компоненты
│   ├── modules.*               # Функциональные модули
│   │   ├── modules.board/      # Модуль для работы с доской
│   │   ├── modules.calls/      # Модуль для работы с видеозвонками
│   │   └── modules.navigation/ # Модуль навигации
│   └── pages.*                 # Отдельные страницы
│       ├── pages.signin/       # Страница входа
│       └── pages.signup/       # Страница регистрации
```

### Архитектурные принципы

1. **Модульность** - код организован в переиспользуемые пакеты, что обеспечивает высокую связность внутри модулей и низкую сцепленность между ними.

2. **Feature-based структура** - функциональность разделена на модули (`modules.*`), которые инкапсулируют связанную логику.

3. **Разделение ответственности** - общий код выделен в пакеты `common.*`, модули в `modules.*`, а полные страницы в `pages.*`.

4. **Монорепозиторий** - использование Turborepo для управления зависимостями между пакетами, обеспечивая согласованную разработку.

### Технологический стек

- **Фронтенд**: React, TypeScript, Tailwind CSS, Vite
- **Состояние**: Zustand для локального состояния, Tanstack/query для серверного состояния
- **Маршрутизация**: Tanstack/router с файловой структурой
- **API**: Axios для HTTP запросов, SocketIO для веб-сокетов
- **Стилизация**: Tailwind с кастомными UI компонентами

### Потоки данных

1. **API запросы** - управляются через `common.api` с кешированием через Tanstack/query
2. **Состояние приложения** - хранится в Zustand-сторах, разделенных по функциональным областям
3. **Модули** - инкапсулируют бизнес-логику и взаимодействуют через экспортируемые API

### Разработка и расширение

При разработке новых функций следует:

1. Определить, к какому модулю относится функциональность
2. Использовать существующие компоненты из UIkit
3. Следовать архитектурным принципам проекта
4. Использовать типизацию для всего кода

### Организация кода в пакетах

Внутри пакетов с префиксами `modules.*` и `pages.*` используется локальная организация кода по принципам Feature-Sliced Design (FSD):

```
пакет (modules.* или pages.*)/
├── src/                 # Исходный код модуля/страницы
│   ├── ui/              # Презентационные компоненты
│   ├── model/           # Бизнес-логика, типы, схемы валидации
│   ├── api/             # API клиенты и запросы
│   ├── hooks/           # React-хуки
│   ├── lib/             # Вспомогательные утилиты
│   ├── config/          # Конфигурация
│   ├── types/           # Типы TypeScript
│   └── locales/         # Локализация
└── index.ts             # Публичное API пакета
```

Такая структура обеспечивает:

- Чёткое разделение ответственности между слоями
- Изолированность и переиспользуемость компонентов
- Упрощение тестирования за счёт чёткого разделения бизнес-логики и представления
- Консистентность кодовой базы

При разработке внутри пакетов следует придерживаться этой структуры и принципов FSD для обеспечения единообразия кода во всем проекте.

### Пакет common.typescript

Пакет `common.typescript` занимает особое место в архитектуре проекта:

1. **Текущее использование**: В настоящее время пакет используется преимущественно для хранения общей конфигурации TypeScript (`tsconfig.json`), которая наследуется другими пакетами.

2. **Планируемое расширение**: В дальнейшем этот пакет будет также использоваться для хранения общих утилитных типов TypeScript, которые могут быть переиспользованы в различных частях приложения:

   - Общие типы данных
   - Служебные типы-утилиты
   - Типы для работы с API
   - Вспомогательные типы для улучшения типизации

3. **Рекомендации по использованию**:
   - При создании новых общих типов, которые будут использоваться в нескольких пакетах, следует размещать их в `common.typescript`
   - Специфичные для конкретного функционала типы должны оставаться в соответствующих пакетах

## Структура xi.web

Основное приложение `xi.web` реализовано с использованием Vite и построено на современных принципах разработки React-приложений.

### Файловая структура

```
apps/xi.web/
├── src/                          # Исходный код
│   ├── pages/                    # Страницы и маршруты
│   │   ├── __root.tsx            # Корневой маршрут и обертка приложения
│   │   ├── (app)/                # Группа маршрутов для авторизованных пользователей
│   │   │   ├── _layout.tsx       # Общий layout для авторизованной части
│   │   │   └── _layout/          # Компоненты layout'а
│   │   │       ├── calendar/     # Страница календаря
│   │   │       ├── classrooms/   # Страница для работы с учениками
│   │   │       ├── materials/    # Страница материалов
│   │   │       ├── payments/     # Страница платежей
│   │   │       └── welcome/      # Страницы онбординга
│   │   │           ├── about/    # Информация о пользователе
│   │   │           ├── role/     # Выбор роли
│   │   │           ├── socials/  # Связка с социальными сетями
│   │   │           └── user/     # Настройка профиля пользователя
│   │   ├── (auth)/               # Группа маршрутов аутентификации
│   │   │   ├── signin/           # Страница входа
│   │   │   └── signup/           # Страница регистрации
│   │   └── welcome/              # Публичные страницы
│   ├── config/                   # Конфигурация приложения
│   ├── routeTree.gen.ts          # Автоматически генерируемое дерево маршрутов
│   └── main.tsx                  # Точка входа в приложение
├── public/                       # Статические файлы
├── index.html                    # Шаблон HTML
└── vite.config.ts                # Конфигурация Vite
```

### Система маршрутизации

Проект использует `@tanstack/react-router` для организации навигации по принципу файловой системы:

1. **Файловая навигация** - структура директорий в `src/pages/` автоматически формирует маршруты
2. **Соглашения именования:**

   - `__root.tsx` - корневой маршрут и контекст
   - `_layout.tsx` - шаблоны для вложенных маршрутов
   - `(папка)` - группировка маршрутов (не влияет на URL)
   - `-имя.tsx` - файлы, исключенные из маршрутизации (служебные компоненты)

3. **Группы маршрутов:**

   - `(app)/*` - защищенные маршруты для авторизованных пользователей
   - `(app)/_layout/welcome/*` - страницы онбординга для новых пользователей
   - `(auth)/*` - страницы аутентификации

4. **Особенности:**
   - Автоматическая генерация типизированных маршрутов
   - Защищенные маршруты с редиректом на страницу входа
   - Загрузка данных на уровне маршрута с использованием Tanstack Query
   - Полная типизация параметров маршрутов
   - Многоязычность с использованием i18next

### Процесс онбординга

После успешной аутентификации новые пользователи проходят процесс онбординга, реализованный через последовательность страниц:

1. `/welcome/user/` - настройка профиля (имя, фото)
2. `/welcome/role/` - выбор роли в системе (преподаватель, ученик)
3. `/welcome/socials/` - связка с социальными сетями и мессенджерами
4. `/welcome/about/` - дополнительная информация о пользователе

Этот процесс помогает настроить персонализированную среду для каждого пользователя.

### Процесс аутентификации

Аутентификация обрабатывается в корневом маршруте (`__root.tsx`), который проверяет авторизацию пользователя и перенаправляет на страницу входа при необходимости. Контекст аутентификации предоставляется всем маршрутам:

```tsx
// Фрагмент из __root.tsx
beforeLoad: ({ context, location }) => {
  if (!context.auth.isAuthenticated && location.pathname !== '/signin') {
    throw redirect({
      to: '/signin',
      search: {
        redirect: location.href,
      },
    });
  }
};
```

### Расширение приложения

Для добавления нового маршрута:

1. Создайте новый файл или директорию в соответствующей группе маршрутов
2. Для защищенных маршрутов используйте группу `(app)`
3. Для страниц аутентификации используйте группу `(auth)`
4. Используйте `_layout.tsx` для создания шаблонов с общими элементами интерфейса

Система автоматически сгенерирует соответствующие маршруты и типы для нового компонента.

## Локализация

Проект использует многоязычность с помощью библиотеки `i18next` и реализует модульный подход к хранению переводов.

### Структура локализации

Переводы организованы по принципу модульности и распределены по соответствующим пакетам:

```
packages/
├── modules.*/
│   └── src/
│       └── locales/
│           ├── index.ts      # Экспорт переводов
│           ├── ru.json       # Переводы на русский
│           └── en.json       # Переводы на английский
├── pages.*/
│   └── src/
│       └── locales/
│           ├── index.ts      # Экспорт переводов
│           ├── ru.json       # Переводы на русский
│           └── en.json       # Переводы на английский
```

### Принцип работы

1. **Модульность**: Каждый пакет содержит только свои переводы, что облегчает поддержку и масштабирование
2. **Пространства имен**: Переводы разделены по пространствам имен (namespaces), которые соответствуют имени пакета
3. **Экспорт**: Переводы экспортируются из каждого пакета и собираются в центральном конфигурационном файле

### Конфигурация

Конфигурация i18next находится в файле `apps/xi.web/src/config/i18n.ts`:

```typescript
// Импортируем переводы из всех пакетов
import { signinEn, signinRu } from 'pages.signin';
import { navigationEn, navigationRu } from 'modules.navigation';

// Собираем переводы
const resources = {
  en: {
    signin: signinEn,
    navigation: navigationEn,
  },
  ru: {
    signin: signinRu,
    navigation: navigationRu,
  },
};

i18n.use(initReactI18next).init({
  resources,
  fallbackLng: 'ru',
  // другие настройки...
});
```

### Использование в компонентах

Для использования переводов в компонентах применяется хук `useTranslation`:

```tsx
import { useTranslation } from 'react-i18next';

export const SignInPage = () => {
  // Указываем namespace, соответствующий имени пакета
  const { t } = useTranslation('signin');

  return <Button>{t('sign_in_button')}</Button>;
};
```

### Добавление новых переводов

Для добавления новых переводов в проект необходимо:

1. Создать файлы локализации в пакете (`ru.json`, `en.json`)
2. Экспортировать их в файле `index.ts`
3. Экспортировать из корня пакета
4. Добавить импорт и регистрацию в конфигурационном файле `i18n.ts`

### Поддерживаемые языки

В настоящий момент проект поддерживает следующие языки:

- Русский (ru) - основной язык
- Английский (en) - дополнительный язык

## Переменные окружения

Проект использует переменные окружения для конфигурации различных аспектов приложения. Они доступны внутри кода через модуль `common.env` и используются с префиксом `VITE_`, что позволяет Vite экспортировать их в клиентский код.

### Основные переменные окружения

| Переменная                | Назначение                                                       | Значение по умолчанию         |
| ------------------------- | ---------------------------------------------------------------- | ----------------------------- |
| `VITE_SERVER_URL_BACKEND` | URL API бэкенда                                                  | https://api.xieffect.ru       |
| `VITE_SERVER_URL_AUTH`    | URL сервиса аутентификации                                       | https://auth.xieffect.ru      |
| `VITE_SERVER_URL_LIVE`    | URL сервиса для онлайн-взаимодействия                            | https://live-test.xieffect.ru |
| `VITE_DEVTOOLS_ENABLED`   | Включение инструментов разработчика                              | false                         |
| `VITE_ENABLE_X_TESTING`   | Нужен для корректной работы авторизации при локальной разработке | false                         |

### Конфигурация окружений

В проекте используются следующие файлы конфигурации:

1. `.env` - базовый файл с переменными окружения для всех сред
2. `.env.local` - локальные переопределения для разработки (не включается в Git)
3. `.env.production` - переменные для продакшн-окружения

### Использование переменных окружения

Для доступа к переменным окружения в коде следует использовать модуль `common.env`:

```typescript
import { env } from 'common.env';

// Теперь можно использовать переменные
const backendUrl = env.VITE_SERVER_URL_BACKEND;
const isDevtoolsEnabled = env.VITE_DEVTOOLS_ENABLED;
```

Модуль `common.env` предоставляет типизированный доступ к переменным окружения и выполняет валидацию их значений.

### Добавление новых переменных окружения

При добавлении новых переменных окружения необходимо:

1. Добавить переменную в соответствующие `.env` файлы
2. Добавить переменную в модуль `common.env/src/env/config.ts`
3. Обновить типы и валидацию в модуле
4. Обновить документацию (этот раздел)
