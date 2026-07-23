# Онбординг — семантика событий

Полный контракт событий онбординга. Outcome-события нельзя смешивать с UI-кликами.

Связанный документ: [`activation-events.md`](./activation-events.md).

## Шаги (стабильные имена)

| `step`               | Backend `onboarding_stage` | UI                                 |
| -------------------- | -------------------------- | ---------------------------------- |
| `email_confirmation` | `email-confirmation`       | `/welcome/email`                   |
| `profile`            | `user-information`         | `/welcome/user`                    |
| `role_selection`     | `default-layout`           | `/welcome/role`                    |
| `notifications`      | `notifications`            | `/welcome/socials`                 |
| `training`           | `training`                 | тур на главной (`OnboardingPopup`) |
| `completed`          | `completed`                | онбординг завершён                 |

`step_index` — 1-based позиция в `ONBOARDING_STEPS` (всего 6).

---

## Карта событий

### `onboarding_started`

| Поле                | Значение                                                                 |
| ------------------- | ------------------------------------------------------------------------ |
| Тип                 | Outcome / lifecycle                                                      |
| Когда               | Первый вход в онбординг (обычно wait-экран email или первый welcome-шаг) |
| Роль                | `tutor` \| `student` \| `unknown`                                        |
| Дедуп               | Один раз на вкладку (`trackOnce('onboarding_started')`)                  |
| Reload              | Не повторяется в той же вкладке                                          |
| Strict Mode         | Защищён `trackOnce`                                                      |
| В воронке активации | Да — старт онбординга                                                    |

**Обязательные свойства:** `user_role`, `event_version`  
**Опциональные:** `activation_flow_id`, `onboarding_stage`

Параллельно в `sessionStorage` пишется `onboarding_started_at_ms` для `duration_ms` на complete.

---

### `onboarding_step_viewed`

| Поле      | Значение                                                                               |
| --------- | -------------------------------------------------------------------------------------- |
| Тип       | UI (показ экрана)                                                                      |
| Когда     | Фактическое открытие шага, не ререндер                                                 |
| Роль      | обе / unknown                                                                          |
| Дедуп     | Один раз на шаг (`trackOnce('onboarding_step_viewed:{step}')`)                         |
| Reload    | Повторится (новый ключ once в новой сессии вкладки — нет; once живёт в памяти вкладки) |
| В воронке | Да — для drop-off по шагам                                                             |

**Обязательные:** `step`, `step_index`, `total_steps`, `user_role`, `event_version`

---

### `onboarding_step_completed`

| Поле      | Значение                                                       |
| --------- | -------------------------------------------------------------- |
| Тип       | Outcome                                                        |
| Когда     | Backend подтвердил переход вперёд с шага (или email confirmed) |
| Роль      | обе / unknown                                                  |
| Дедуп     | Один раз на шаг                                                |
| Не слать  | При навигации «Назад»; при skip тура                           |
| В воронке | Да                                                             |

**Обязательные:** `step`, `step_index`, `total_steps`, `user_role`, `event_version`

---

### `onboarding_step_skipped`

| Поле      | Значение                                                                                      |
| --------- | --------------------------------------------------------------------------------------------- |
| Тип       | Outcome (осознанный пропуск контента шага)                                                    |
| Когда     | Пользователь пропускает тур (`training`): «Позже», закрытие тура до конца, нет валидных шагов |
| Роль      | обе / unknown                                                                                 |
| Дедуп     | Может повториться при повторных действиях — допустимо                                         |
| В воронке | Да — как альтернатива `step_completed` на `training`                                          |

**Обязательные:** `step`, `step_index`, `total_steps`, `user_role`, `event_version`  
**Опциональные:** `skip_reason`: `later` \| `dismiss` \| `no_steps` \| `unknown`

| `skip_reason` | Смысл                                        |
| ------------- | -------------------------------------------- |
| `later`       | Кнопка «Позже» / «Вернуться позже»           |
| `dismiss`     | Закрыл тур до последнего шага                |
| `no_steps`    | Нет валидных DOM-шагов тура — автозавершение |

---

### `onboarding_step_failed`

| Поле      | Значение                                                                |
| --------- | ----------------------------------------------------------------------- |
| Тип       | Outcome (ошибка)                                                        |
| Когда     | Ошибка API на шаге (profile / role / notifications / training complete) |
| Роль      | обе / unknown                                                           |
| Дедуп     | Один раз на неуспешный запрос (каждый failed request = событие)         |
| В воронке | Да — диагностика drop-off                                               |

**Обязательные:** `step`, `step_index`, `total_steps`, `user_role`, `reason`, `event_version`

| `reason`           | Смысл             |
| ------------------ | ----------------- |
| `validation_error` | 400 / 422         |
| `network_error`    | Нет ответа / сеть |
| `server_error`     | 5xx               |
| `unknown`          | Прочее            |

Не передавать `error.message`.

---

### `onboarding_step_back`

| Поле      | Значение                                     |
| --------- | -------------------------------------------- |
| Тип       | UI / navigation                              |
| Когда     | Успешный backend-переход назад (`backwards`) |
| Роль      | обе / unknown                                |
| Дедуп     | Каждый успешный back = событие               |
| В воронке | Да — для понимания возвратов                 |

**Обязательные:** `from_step`, `to_step`, `step_index`, `total_steps`, `user_role`, `event_version`

Примеры:

- `role_selection` → `profile`
- `notifications` → `role_selection`

---

### `onboarding_completed`

| Поле      | Значение                             |
| --------- | ------------------------------------ |
| Тип       | Outcome                              |
| Когда     | Backend подтвердил stage `completed` |
| Роль      | обе / unknown                        |
| Дедуп     | Один раз на вкладку                  |
| В воронке | Да — завершение онбординга           |

**Обязательные:** `user_role`, `event_version`  
**Опциональные:**

| Свойство          | Значения                                                 | Смысл                                               |
| ----------------- | -------------------------------------------------------- | --------------------------------------------------- |
| `duration_ms`     | number                                                   | От `onboarding_started` (Date.now в sessionStorage) |
| `completion_path` | `tour_done` \| `skipped` \| `auto_no_steps` \| `unknown` | Как завершили training                              |

| `completion_path` | Смысл                          |
| ----------------- | ------------------------------ |
| `tour_done`       | Прошёл тур до последнего шага  |
| `skipped`         | «Позже» или закрыл тур         |
| `auto_no_steps`   | Тур недоступен (нет элементов) |

Legacy declarative: `onboarding-complete` (kebab) всё ещё шлётся при `tour_done` — не удалять.

Параллельно: `activation_tutorial_started` / `activation_tutorial_completed` при старте/успехе тура.

---

## Правила дедупликации (сводка)

| Событие                     | Правило                |
| --------------------------- | ---------------------- |
| `onboarding_started`        | 1× вкладка             |
| `onboarding_step_viewed`    | 1× шаг / вкладка       |
| `onboarding_step_completed` | 1× шаг / вкладка       |
| `onboarding_step_skipped`   | каждый skip-action     |
| `onboarding_step_failed`    | каждый failed request  |
| `onboarding_step_back`      | каждый successful back |
| `onboarding_completed`      | 1× вкладка             |

React Strict Mode: once-ключи в памяти модуля защищают от двойной отправки viewed/started/completed.

---

## Что можно / нельзя считать результатом

| Можно как outcome           | Нельзя как outcome                            |
| --------------------------- | --------------------------------------------- |
| `onboarding_step_completed` | `onboarding_step_viewed`                      |
| `onboarding_completed`      | клики `welcome-next-button` (declarative)     |
| `onboarding_step_failed`    | сырой `onboarding-complete` без product props |

`onboarding_stage` в session identify — snapshot, не история. Для воронки использовать цепочку step-событий.

---

## Источники в коде

| Место                                    | События                                                             |
| ---------------------------------------- | ------------------------------------------------------------------- |
| `pages.email` / EmailPageConfirm         | started, step_viewed (email)                                        |
| `useEmailConfirmation`                   | step_completed (email)                                              |
| `pages.welcome` hooks                    | completed / failed / back по шагам                                  |
| `useOnboardingAnalytics`                 | started, step_viewed                                                |
| `common.ui/OnboardingPopup`              | training viewed/skipped/completed, onboarding_completed, tutorial_* |
| `common.utils/.../onboardingTracking.ts` | общие хелперы                                                       |
