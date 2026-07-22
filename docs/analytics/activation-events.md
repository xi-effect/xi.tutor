# События активации (Umami)

Документация продуктовой аналитики пути репетитора от регистрации до первого полноценного занятия.

Сводный реестр всех событий UI: [`docs/umami-events-svodnoe-opisanie.md`](../umami-events-svodnoe-opisanie.md).

Детальная семантика онбординга: [`onboarding-events.md`](./onboarding-events.md).

## Как читать контракт события

Для каждого события фиксируем:

| Поле                             | Смысл                                                          |
| -------------------------------- | -------------------------------------------------------------- |
| Тип                              | `UI` (действие/показ) или `Outcome` (подтверждённый результат) |
| Когда                            | Точный момент отправки                                         |
| Роль                             | `tutor` / `student` / обе / anonymous                          |
| Дедуп                            | Один раз за экран / запрос / пользователя / занятие / порог    |
| Reload / reconnect / Strict Mode | Повторяется ли                                                 |
| В воронке активации              | Можно ли включать как ступень                                  |
| Обязательные свойства            | Список                                                         |
| Enum                             | Допустимые значения                                            |
| Ограничения                      | PII, известные дыры                                            |

**UI и Outcome нельзя смешивать в одной метрике.** Пример: `auth-signup-button` (UI) ≠ `auth_signup_succeeded` (Outcome).

## Определение активации

**Основная активация репетитора:** репетитор успешно подключился к занятию, присоединился хотя бы один ученик, длительность занятия ≥ 15 минут.

Событие `tutor_activated` **не** отправляется с фронтенда — активация считается по исходным событиям.

## Инфраструктура

| Модуль               | Путь                                                                        |
| -------------------- | --------------------------------------------------------------------------- |
| Helper               | `packages/common.utils/src/productAnalytics/umami.ts` → `trackProductEvent` |
| Типы / EventMap      | `eventMap.ts`, `types.ts`, `events.ts`                                      |
| `activation_flow_id` | `activationFlowId.ts` (localStorage, TTL 30 дней)                           |
| `attempt_id`         | `attemptId.ts` → `createAttemptId()`                                        |
| Error mappers        | `errorMappers.ts`                                                           |
| Защита от дублей     | `once.ts` → `trackOnce`                                                     |

### Общие свойства

`trackProductEvent` автоматически добавляет:

- `event_version: 1`
- `activation_flow_id` — если уже создан

`user_id` передаётся через `umami.identify` / session properties, **не** в каждом event payload.

### Окружения

- `MODE === 'test'` — аналитика выключена, пока не задано `VITE_ENABLE_PRODUCT_ANALYTICS=true`
- `VITE_ENABLE_PRODUCT_ANALYTICS=false` — явный opt-out

### Именование

Новые события — `snake_case`. Существующие kebab-case declarative (`data-umami-event`) пока сохраняются параллельно.

**Deprecated:** `auth-signup-button` — после внедрения новых signup-событий считать устаревшим, удалять пока не нужно.

---

## P0 — обязательные события

### Регистрация

| Событие                         | Тип                 | Когда                                 | Дедуп                | В воронке        |
| ------------------------------- | ------------------- | ------------------------------------- | -------------------- | ---------------- |
| `auth_signup_viewed`            | UI                  | Форма впервые показана                | 1× вкладка           | Да               |
| `auth_signup_validation_failed` | UI                  | Submit не прошёл клиентскую валидацию | 1× попытка submit    | Да (диагностика) |
| `auth_signup_submit`            | Outcome-intent      | После валидации, перед API            | 1× API-запрос        | Да               |
| `auth_signup_succeeded`         | Outcome             | Backend создал аккаунт                | 1× успешный ответ    | Да               |
| `auth_signup_failed`            | Outcome             | Backend/сеть вернули ошибку           | 1× неуспешный запрос | Да               |
| `auth-signup-button`            | UI (**deprecated**) | Клик по кнопке                        | каждый клик          | Нет              |

**Источник:** `packages/pages.signup`  
**Связь попытки:** одинаковый `attempt_id` в `submit` → `succeeded` / `failed`.

#### `auth_signup_viewed`

```json
{
  "activation_flow_id": "uuid",
  "entry_point": "landing | invite | login | direct | unknown",
  "has_invite": false,
  "event_version": 1
}
```

Дубли: защита через `trackOnce('auth_signup_viewed')`.

#### `auth_signup_submit`

```json
{
  "activation_flow_id": "uuid",
  "attempt_id": "uuid",
  "entry_point": "landing",
  "attempt_number": 1,
  "has_invite": false,
  "event_version": 1
}
```

#### `auth_signup_validation_failed`

```json
{
  "activation_flow_id": "uuid",
  "reason": "required_field | invalid_email | weak_password | terms_not_accepted | multiple_fields",
  "field": "name | email | password | terms | multiple",
  "entry_point": "landing",
  "has_invite": false,
  "event_version": 1
}
```

#### `auth_signup_succeeded`

```json
{
  "activation_flow_id": "uuid",
  "attempt_id": "uuid",
  "entry_point": "landing",
  "duration_ms": 1240,
  "confirmation_required": true,
  "attempt_number": 1,
  "has_invite": false,
  "event_version": 1
}
```

#### `auth_signup_failed`

```json
{
  "activation_flow_id": "uuid",
  "attempt_id": "uuid",
  "reason": "email_exists | username_exists | network_error | timeout | rate_limited | server_error | unknown",
  "duration_ms": 800,
  "http_status_group": "4xx | 5xx | none",
  "entry_point": "landing",
  "attempt_number": 2,
  "has_invite": false,
  "event_version": 1
}
```

Ограничения: не передавать текст backend-ошибки, email, пароль.

На экране регистрации также: `activation_help_opened` / `activation_support_contacted` (через Support).

---

### Подтверждение email

| Событие                                                                | Статус | Когда                                 |
| ---------------------------------------------------------------------- | ------ | ------------------------------------- |
| `email_confirmation_viewed`                                            | новый  | Экран ожидания подтверждения          |
| `onboarding_started` / `onboarding_step_viewed` (`email_confirmation`) | новый  | Параллельно с viewed на wait-экране   |
| `email_confirmation_resend_submit\|succeeded\|failed`                  | новый  | Повторная отправка письма             |
| `email_confirmation_resend_blocked`                                    | новый  | Клик resend во время cooldown         |
| `email_confirmation_succeeded`                                         | новый  | Email подтверждён (или уже был — 409) |
| `email_confirmation_failed`                                            | новый  | Невалидный / просроченный токен и др. |
| `onboarding_step_completed` (`email_confirmation`)                     | новый  | После succeeded                       |
| `email_confirmation_continue_clicked`                                  | новый  | Клик «Продолжить» после успеха        |

**Источник:** `packages/pages.email`, `packages/common.services/src/auth/useEmailConfirmation*.tsx`

Свойства: `source` (`signup` \| `session_restore` \| `email_link`), `already_confirmed`, `attempt_number` (resend), `cooldown_seconds_left` (blocked).

Не передавать email, токен, ссылку.

---

### Первый авторизованный вход

| Событие                            | Статус | Когда                                        |
| ---------------------------------- | ------ | -------------------------------------------- |
| `auth_first_authenticated_session` | новый  | После первой успешной регистрации (identify) |

```json
{
  "activation_flow_id": "uuid",
  "user_role": "tutor | student",
  "source": "signup | login | invite",
  "event_version": 1
}
```

**Ограничение:** once на пользователя через `localStorage` + `trackOnce`. Backend-флага «первая сессия» пока нет — на другом устройстве событие может отправиться повторно.

**Источник:** `packages/common.auth/src/auth/provider.tsx`

---

### Онбординг

Полный контракт: [`onboarding-events.md`](./onboarding-events.md).

| Событие                     | Тип     | Когда                                           | Дедуп                 |
| --------------------------- | ------- | ----------------------------------------------- | --------------------- |
| `onboarding_started`        | Outcome | Первый вход в онбординг                         | 1× вкладка            |
| `onboarding_step_viewed`    | UI      | Показан шаг                                     | 1× шаг / вкладка      |
| `onboarding_step_completed` | Outcome | Backend подтвердил переход вперёд               | 1× шаг / вкладка      |
| `onboarding_step_skipped`   | Outcome | Пропуск тура (`later` / `dismiss` / `no_steps`) | каждый skip           |
| `onboarding_step_failed`    | Outcome | Ошибка API на шаге                              | каждый failed request |
| `onboarding_step_back`      | UI      | Успешный переход назад                          | каждый back           |
| `onboarding_completed`      | Outcome | Backend stage `completed`                       | 1× вкладка            |

Стабильные имена шагов: `email_confirmation` → `profile` → `role_selection` → `notifications` → `training` → `completed`.

```json
{
  "activation_flow_id": "uuid",
  "step": "profile",
  "step_index": 2,
  "total_steps": 6,
  "user_role": "tutor",
  "event_version": 1
}
```

`onboarding_completed` дополнительно: `duration_ms`, `completion_path` (`tour_done` \| `skipped` \| `auto_no_steps`).

**Источник:** `pages.welcome`, `pages.email`, `common.ui/OnboardingPopup`, `common.utils/.../onboardingTracking.ts`.

---

### Приглашение ученика (репетитор)

| Событие                   | Статус                  | Когда                          |
| ------------------------- | ----------------------- | ------------------------------ |
| `student_invite_viewed`   | новый                   | Открыта модалка приглашений    |
| `student_invite_submit`   | новый                   | Перед API создания приглашения |
| `student_invited_success` | существующий (расширен) | Приглашение создано            |
| `student_invite_failed`   | новый                   | Ошибка создания                |

```json
{
  "activation_flow_id": "uuid",
  "attempt_id": "uuid",
  "invite_id": "123",
  "source": "main | classrooms | classroom | students | unknown",
  "is_first_invite": true,
  "duration_ms": 400,
  "event_version": 1
}
```

`is_first_invite` — по данным кэша списка приглашений (не localStorage).

**Источник:** `packages/features.invites`, `packages/common.services/src/invitations/useAddInvitation.ts`

---

### Приглашение (ученик)

| Событие                        | Статус                  | Когда                             |
| ------------------------------ | ----------------------- | --------------------------------- |
| `student_invite_opened`        | новый                   | Ученик открыл `/invite/$inviteId` |
| `student_invite_accept_submit` | новый                   | Перед API принятия                |
| `invite_accepted_success`      | существующий (расширен) | Приглашение принято               |
| `student_invite_accept_failed` | новый                   | Ошибка принятия                   |

```json
{
  "invite_id": "code-from-url",
  "tutor_id": "42",
  "attempt_id": "uuid",
  "student_authenticated": true,
  "event_version": 1
}
```

Не передавать имя ученика, email, текст приглашения, полную ссылку.

**Источник:** `packages/pages.invites`

---

### Создание занятия

| Событие                  | Статус                  | Когда                    |
| ------------------------ | ----------------------- | ------------------------ |
| `lesson_create_viewed`   | новый                   | Открыта модалка создания |
| `lesson_create_submit`   | новый                   | Перед API                |
| `lesson_created_success` | существующий (расширен) | Занятие создано          |
| `lesson_create_failed`   | новый                   | Ошибка создания          |

```json
{
  "activation_flow_id": "uuid",
  "attempt_id": "uuid",
  "lesson_id": "event-id",
  "source": "schedule | classroom | main | unknown",
  "lesson_type": "individual | group",
  "students_count": 1,
  "is_recurring": false,
  "duration_ms": 500,
  "event_version": 1
}
```

Не передавать название, комментарий, имя ученика.

**Источник:** `packages/features.lesson.add`, `packages/common.services/src/scheduler/model/queries.ts`

---

### Запуск занятия и ВКС

| Событие                    | Статус                  | Когда                                      |
| -------------------------- | ----------------------- | ------------------------------------------ |
| `prejoin_viewed`           | новый                   | Есть токен, ещё не `connected`             |
| `lesson_started`           | существующий            | Репетитор инициировал старт (после токена) |
| `lesson_joined`            | существующий            | Ученик вошёл                               |
| `media_permission_granted` | новый                   | Камера/мик включены                        |
| `media_permission_denied`  | новый                   | `MediaDevicesError`                        |
| `call_connect_attempted`   | новый                   | `connectionState === connecting`           |
| `call_connected`           | существующий (расширен) | Успешное подключение                       |
| `call_connection_failed`   | существующий (расширен) | Ошибка токена / permissions / др.          |

Общий `attempt_id` на одну попытку подключения. Reconnect → новый `attempt_id`, тот же `lesson_id` (сейчас = `classroom_id`).

#### `call_connect_attempted`

```json
{
  "lesson_id": "123",
  "attempt_id": "uuid",
  "actor_role": "tutor",
  "attempt_number": 1,
  "event_version": 1
}
```

#### `call_connected`

```json
{
  "lesson_id": "123",
  "attempt_id": "uuid",
  "actor_role": "tutor",
  "attempt_number": 1,
  "duration_ms": 1800,
  "recovered_after_failure": false,
  "event_version": 1
}
```

#### `call_connection_failed`

```json
{
  "lesson_id": "123",
  "attempt_id": "uuid",
  "actor_role": "tutor",
  "attempt_number": 1,
  "reason": "token_error | permission_error | network_error | timeout | ice_failed | server_unavailable | unsupported_browser | unknown",
  "duration_ms": 2000,
  "retry_available": true,
  "event_version": 1
}
```

Не передавать LiveKit token, URL комнаты, stack trace, полный текст ошибки.

**Источник:** `packages/modules.calls/src/productAnalytics/*`, `useCallsDeps.ts`

**Ограничение PreJoin/media:** UI PreJoin живёт в `@xipkg/calls-*`. В этом репозитории `prejoin_viewed` эвристически = токен есть и ещё не connected; media — через LocalParticipant / `MediaDevicesError`.

---

### Длительность и завершение занятия

| Событие                   | Статус                          | Когда                             |
| ------------------------- | ------------------------------- | --------------------------------- |
| `lesson_duration_reached` | существующий (стандартизирован) | Пороги 5 / 15 / 30 / 45 / 60 мин  |
| `lesson_finished`         | существующий (стандартизирован) | Disconnect / unmount после ≥5 мин |

#### `lesson_duration_reached`

```json
{
  "lesson_id": "123",
  "actor_role": "tutor | student",
  "duration_threshold": 15,
  "students_count": 1,
  "student_joined": true,
  "board_used": false,
  "screen_share_used": false,
  "event_version": 1
}
```

Каждый порог — один раз на сессию звонка (`sentDurationThresholds`). Отправляется для **обеих** ролей с обязательным `actor_role` (раньше — только tutor).

Совместимость: сохранены `duration_min`, `used_board`, `used_screenshare`, `role`.

#### `lesson_finished`

```json
{
  "lesson_id": "123",
  "actor_role": "tutor",
  "total_duration_seconds": 920,
  "finish_reason": "user_left | connection_lost | unknown",
  "students_joined_count": 1,
  "event_version": 1
}
```

`browser_closed` не гарантируется браузером.

---

## P1 — дополнительные (частично / запланировано)

| Событие                                                                                    | Статус                                     |
| ------------------------------------------------------------------------------------------ | ------------------------------------------ |
| `email_confirmation_resend_*`                                                              | реализовано                                |
| `student_invite_link_copied`                                                               | реализовано                                |
| `onboarding_step_skipped` / `failed` / `back`                                              | реализовано                                |
| `activation_help_opened` / `activation_support_contacted`                                  | реализовано на auth/support                |
| `activation_tutorial_started` / `completed`                                                | реализовано в OnboardingPopup              |
| `media_device_unavailable` / `media_permission_help_opened` / `media_permission_requested` | константы есть                             |
| `lesson_opened`                                                                            | константа есть, точка вызова не подключена |
| `student_invite_shared`                                                                    | константа есть                             |

---

## Воронка активации

```
auth_signup_viewed
→ auth_signup_submit
→ auth_signup_succeeded
→ email_confirmation_succeeded
→ onboarding_started
→ onboarding_completed
→ student_invite_submit / student_invited_success
→ student_invite_opened
→ invite_accepted_success
→ lesson_create_submit / lesson_created_success
→ prejoin_viewed
→ media_permission_granted
→ call_connect_attempted
→ call_connected
→ lesson_duration_reached (5)
→ lesson_duration_reached (15) + student_joined
```

Ключи склейки:

| Ключ                 | Назначение                       |
| -------------------- | -------------------------------- |
| `activation_flow_id` | До и после регистрации           |
| `attempt_id`         | Одна сетевая попытка             |
| `invite_id`          | Создание ↔ принятие приглашения  |
| `lesson_id`          | Создание ↔ звонок ↔ длительность |

---

## Что не трекаем

- ввод каждого символа / `field_changed`
- email, пароль, ФИО, телефон
- названия занятий / кабинетов, комментарии
- токены, invite URL, stack trace, произвольный текст ошибки
- содержимое доски и чатов
- отдельное событие `tutor_activated`
