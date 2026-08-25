# Приглашение ученика v2 (`invite_flow_version: 2`)

Документация **фактического** frontend-flow приглашения ученика после
registration-first. Backend-контракт API (URL, методы, тела) не менялся.

Сводный реестр событий воронки активации: [`activation-events.md`](./activation-events.md).

## Финальный flow

```
Tutor:
  invite modal
  → copy message / copy link
Student:
  invite opened
  → registration primary
  → login secondary
Auth:
  signup / signin
  → invite context preserved
Invite:
  accept
  → backend transaction
  → tutorship + classroom
  → success
```

Устаревший login-first (неавторизованный `/invite` сразу редиректил на `/signin`)
**больше не действует**. Сравнивать гипотезу registration-first по дате
**2026-08-21**, не по полю `invite_flow_version` (оно остаётся `2`).

## Дата и время релиза

| Версия                   | Действует с                                                                                  | Комментарий                                                                                                               |
| ------------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `invite_flow_version: 1` | до релиза v2 (включительно)                                                                  | Старая модалка со списком ссылок (`ModalInvitationLegacy`), старые тексты страницы ученика                                |
| `invite_flow_version: 2` | **2026-07-27** (дата реализации; проставить фактическую дату/время деплоя в прод при релизе) | Новый сценарий: `ModalInvitationV2`, обновлённые тексты `/invite/$inviteId`                                               |
| registration-first       | **2026-08-21** (дата реализации; проставить фактическую дату/время деплоя в прод при релизе) | Неавторизованный ученик видит `/invite` с primary signup, а не редирект на `/signin`. `invite_flow_version` остаётся `2`. |

Старые события (`student_invite_viewed`, `student_invite_submit`, `student_invited_success`,
`student_invite_failed`, `student_invite_opened`, `student_invite_accept_submit`,
`invite_accepted_success`, `student_invite_accept_failed`) не содержат поле
`invite_flow_version` до релиза v2 — по соглашению все события **без** этого поля
считаются версией 1, если они отправлены до даты релиза из таблицы выше. После релиза
эти же имена событий продолжают отправляться (для обратной совместимости воронки), но
там, где технически доступно (см. `eventMap.ts`), уже проставляется
`invite_flow_version: 2`.

Временный откат к старому UI возможен через `VITE_LEGACY_INVITES_MODAL_ENABLED=true`
(см. `packages/common.env`) — в этом случае модалка репетитора продолжит отправлять
только v1-события (`ModalInvitationLegacy` не изменялась).

## Шаги flow

### Репетитор

1. Открывает модалку приглашения (`ModalInvitationV2`).
2. Если активных individual-ссылок нет — frontend создаёт одну
   (`POST .../tutor/individual-invitations/`). Если ссылка уже есть — **новую
   не создаёт**, показывает последнюю.
3. Primary: «Скопировать сообщение». Secondary: «Скопировать ссылку».
4. После копирования: подтверждение + «отправьте ученику в мессенджере».
5. «Обновить ссылку» — не обязательный шаг: `DELETE` текущего + `POST` нового.
   Нужен только если старую ссылку нужно отозвать.

Individual invite **многоразовый**: одну ссылку могут принять несколько учеников,
`usage_count` увеличивается. Frontend не создаёт новую ссылку после каждого
принятия и не описывает ссылку как одноразовую.

Лимит backend — до 10 **одновременно существующих** individual-ссылок
(`409 Quantity exceeded`). Это не лимит учеников. При лимите UI показывает
toast и ведёт к уже существующей ссылке, а не предлагает бессмысленный retry
создания.

### Ученик — три трека

UI-прогресс и аналитика режутся по `invite_progress_track`. Обычный `/signin` /
`/signup` без invite в URL **не** входит в воронку (старый `invite.pending_code`
не считается входом).

#### Signup (7 шагов)

Регистрация с нуля — основной путь registration-first.

| #   | Шаг (`invite_progress_step`) | Экран                   | События                                                                                |
| --- | ---------------------------- | ----------------------- | -------------------------------------------------------------------------------------- |
| 1   | `invite_open`                | `/invite/{code}` unauth | `student_invite_page_viewed`, `student_invite_opened` (`student_authenticated: false`) |
| 2   | `auth`                       | `/signup`               | `student_invite_signup_clicked`, `auth_signup_viewed` / `submit` / `succeeded`         |
| 3   | `email`                      | `/welcome/email`        | `email_confirmation_viewed`, `onboarding_step_viewed` (`email_confirmation`)           |
| 4   | `welcome_user`               | `/welcome/user`         | `onboarding_step_viewed` (`profile`)                                                   |
| 5   | `welcome_role`               | `/welcome/role`         | `onboarding_step_viewed` (`role_selection`)                                            |
| 6   | `welcome_socials`            | `/welcome/socials`      | `onboarding_step_viewed` (`notifications`)                                             |
| 7   | `accept`                     | `/invite/{code}` auth   | `student_invite_accept_submit` → `invite_accepted_success`                             |

На шаге 7 полоска в UI **скрыта** (остался один клик), но в событиях accept
остаются `invite_progress_track: signup`, `invite_progress_step: accept`,
`invite_progress_current: 7`, `invite_progress_total: 7`.

#### Signin (3 шага)

Ученик уже с аккаунтом, secondary CTA «Войти».

| #   | Шаг           | Экран                   | События                                                            |
| --- | ------------- | ----------------------- | ------------------------------------------------------------------ |
| 1   | `invite_open` | `/invite/{code}` unauth | те же open-события                                                 |
| 2   | `auth`        | `/signin`               | `student_invite_login_clicked`, `auth_signin_submit` / `succeeded` |
| 3   | `accept`      | `/invite/{code}` auth   | accept-события, `invite_progress_total: 3`                         |

#### Already auth (1 шаг)

Ученик открыл ссылку уже авторизованным — без signup/signin в этой сессии.
`invite_progress_track: already_auth`, `invite_progress_step: accept_direct`,
`total: 1`. Полоски нет. Funnel: open (`student_authenticated: true`) → accept.

Код приглашения сохраняется (`localStorage['invite.pending_code']`,
`search.invite` / `search.redirect`) и **не очищается**, пока accept не
завершится успехом.

Preview (`GET .../preview/`) — protected; для unauth не вызывается. Имя
преподавателя на unauth landing недоступно.

### Accept

1. Авторизованный preview.
2. `POST .../student/invitations/{code}/usages/` (`student_invite_accept_submit`).
3. Успех — только если в ответе есть `id` кабинета → `invite_accepted_success`.
4. UI: «Готово! Приглашение принято. Кабинет создан» → «Перейти в кабинет».

Double-click: кнопка disabled, пока mutation pending; повторный запрос из
одного UI-действия не отправляется. Этого недостаточно для гарантии
целостности — см. unique constraint ниже.

## `invite_accepted_success` — финальная точка funnel

Backend создаёт accept + tutorship + classroom в **одной SQLAlchemy-транзакции**.
Если запрос успешно завершился, кабинет тоже создан.

Поэтому:

```
invite_accepted_success
=
invite успешно принят
+ tutor/student relationship создана
+ tutorship создан
+ classroom создан
```

Отдельное frontend-событие `classroom_created_from_invite` **не добавляется**:
frontend не получает независимого подтверждения кабинета, кроме `id` в ответе
accept.

Funnel (три трека ученика):

```
copy
→ open (invite_open)
   ├ signup:  auth → email → welcome_user → welcome_role → welcome_socials → accept
   ├ signin:  auth → accept
   └ already_auth: accept_direct
→ classroom created
```

Последняя ступень всегда = `invite_accepted_success` (`classroom_created: true`).
Сегментировать по `invite_progress_track`. Не смешивать signup (7) и signin (3)
в одной воронке без фильтра.

## Список событий

См. `PRODUCT_ANALYTICS_EVENTS` в
[`packages/common.utils/src/productAnalytics/events.ts`](../../packages/common.utils/src/productAnalytics/events.ts)
и контракт свойств в
[`eventMap.ts`](../../packages/common.utils/src/productAnalytics/eventMap.ts).

Репетитор: `student_invite_modal_viewed`, `student_invite_message_copied`,
`student_invite_link_copied`, `student_invite_new_link_created`.
Основное действие в модалке — «Скопировать сообщение»; дополнительное —
«Скопировать ссылку». Фактической попыткой отправки считается copy message
или copy link, а не само создание приглашения.

«Обновить ссылку» — не аддитивное создание, а замена: текущее (последнее)
приглашение удаляется (`DELETE`, существующий метод API) и сразу создаётся
новое. Повторные обновления не увеличивают общее число приглашений.
`student_invite_new_link_created` содержит `previous_invite_id` — id удалённого
приглашения.

Ученик: `student_invite_page_viewed` (`student_authenticated`),
`student_invite_signup_clicked`, `student_invite_login_clicked`, плюс auth /
onboarding / accept. На событиях воронки: `invite_progress_track`
(`signup` | `signin` | `already_auth`), `invite_progress_step`,
`invite_progress_current`, `invite_progress_total`, `has_invite`.
Неавторизованный пользователь остаётся на `/invite/$inviteId`
(registration-first): primary CTA ведёт на signup, secondary — на signin.
`invite-context` сохраняется до успешного accept.

Подробные таблицы «когда отправляется» — в
[`activation-events.md`](./activation-events.md#приглашение-ученика-репетитор) (разделы
«Новая форма приглашения v2»).

## `student_invite_accept_failed` — только реальные состояния

Raw backend message в Umami не отправляется. `reason`:

```ts
type InviteAcceptFailureReason =
  | 'invite_not_found' // 404 Invitation not found
  | 'already_connected' // 409 Already joined — пара tutor↔student уже связана
  | 'self_invite' // 409 Target is the source
  | 'authentication_required' // 401
  | 'network_error'
  | 'server_error'
  | 'unknown';
```

Не используются:

- `invite_expired` — backend expiry не поддерживает;
- `already_accepted` — нет достоверного состояния «именно этот invite уже принят».
  `409 Already joined` означает связь пары, а не повторное принятие конкретного кода.

## `invite_tracking_id` — связывание без backend

Backend не возвращает общий идентификатор, по которому можно было бы напрямую
связать «репетитор скопировал ссылку» → «ученик открыл ссылку» → «ученик принял
приглашение». Токен приглашения (`code`) есть на обеих сторонах:

- у репетитора — `InvitationDataT.code` (список приглашений);
- у ученика — параметр маршрута `/invite/$inviteId` (`inviteId` в URL).

Чтобы не отправлять сырой токен в Umami, обе стороны хешируют **одну и ту же**
нормализованную строку (без домена и query-параметров) через SHA-256 и передают
только хеш:

```ts
async function createInviteTrackingId(token: string): Promise<string> {
  const normalizedToken = token.trim();
  const data = new TextEncoder().encode(normalizedToken);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}
```

Реализация: `createInviteTrackingId` / `getInviteTrackingId` в
[`packages/common.utils/src/productAnalytics/inviteTracking.ts`](../../packages/common.utils/src/productAnalytics/inviteTracking.ts).

Правила:

- хешируется именно `code` (тот же токен, что и в пути `/invite/{code}`), без домена и без query-параметров — одинаковая строка на обеих сторонах;
- сырой токен никогда не передаётся в свойства события и не логируется (`token` также в списке `FORBIDDEN_ANALYTICS_FIELDS`);
- если токена нет — поле `invite_tracking_id` не включается в payload, а не отправляется как `null`/`undefined`;
- поле проходит через цепочку: copy (`student_invite_message_copied` / `student_invite_link_copied`) → open (`student_invite_page_viewed`, `student_invite_opened`) → signup/login click → auth submit/success (`auth_signup_*` / `auth_signin_*`) → onboarding (`email_confirmation_viewed`, `onboarding_step_viewed`) → `student_invite_accept_submit` → `invite_accepted_success` / `student_invite_accept_failed`;
- события воронки ученика дополнительно несут `invite_progress_track`, `invite_progress_step`, `invite_progress_current`, `invite_progress_total` (и `has_invite: true`, если шаг внутри invite-flow). Вне invite-flow эти поля **не** отправляются;
- в Umami **нельзя** отправлять: email, пароль, username, имена, raw invite token, classroom ID, user/tutor ID, raw backend error, stack, полный URL приглашения.

### Ограничение точности связывания

Если у репетитора и ученика доступны **разные** значения токена (например, ссылка
была скопирована из истории/пересланное сообщение с другим форматированием, либо
backend в будущем изменит формат `code`), точное связывание по `invite_tracking_id`
не работает. В этом случае аналитику нужно сравнивать на уровне репетитора,
пользователя и временных окон (см. метрики ниже — они не требуют точного
связывания, только окна дат).

## Метрики

Все метрики считаются по `invite_flow_version: 2` отдельно от v1 (для сравнения
до/после релиза — см. дату в таблице выше). Студенческие конверсии **резать
по `invite_progress_track`**, иначе signup (7 шагов) смешается с signin (3) и
already_auth (1).

### Репетитор

| Метрика                 | Формула                                                                                          | Источник                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| **Message Copy Rate**   | `student_invite_message_copied` / `student_invite_modal_viewed`                                  | репетитор                                                     |
| **Link Copy Rate**      | `student_invite_link_copied` / `student_invite_modal_viewed`                                     | репетитор                                                     |
| **Send attempt**        | (`student_invite_message_copied` ∪ `student_invite_link_copied`) / `student_invite_modal_viewed` | репетитор                                                     |
| **Invite Open Rate D7** | `student_invite_page_viewed` (тот же `invite_tracking_id`, ≤7 дней) / send attempt               | связка через `invite_tracking_id`, иначе репетитор + окно дат |

### Выбор пути (unauth open)

Знаменатель: `student_invite_page_viewed` с `student_authenticated: false`.

| Метрика                     | Формула                                                |
| --------------------------- | ------------------------------------------------------ |
| **Invite → Signup started** | `student_invite_signup_clicked` / unauth `page_viewed` |
| **Invite → Login started**  | `student_invite_login_clicked` / unauth `page_viewed`  |

### Signup-трек (`invite_progress_track: signup`)

| Метрика                        | Формула                                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------- |
| **Signup started → succeeded** | `auth_signup_succeeded` (has_invite) / `student_invite_signup_clicked`                      |
| **Signup → Email**             | `email_confirmation_viewed` (has_invite) / `auth_signup_succeeded` (has_invite)             |
| **Email → Profile**            | `onboarding_step_viewed` (`profile`, has_invite) / `email_confirmation_viewed` (has_invite) |
| **Profile → Role**             | `onboarding_step_viewed` (`role_selection`) / `onboarding_step_viewed` (`profile`)          |
| **Role → Socials**             | `onboarding_step_viewed` (`notifications`) / `onboarding_step_viewed` (`role_selection`)    |
| **Socials → Accept submit**    | `student_invite_accept_submit` (track=signup) / `onboarding_step_viewed` (`notifications`)  |
| **Signup started → Classroom** | `invite_accepted_success` (track=signup) / `student_invite_signup_clicked`                  |
| **Invite → Signup Classroom**  | `invite_accepted_success` (track=signup) / unauth `page_viewed`                             |

Drop-off по шагу: доля сессий, у которых `invite_progress_step` остановился на N
и нет следующего события с большим `invite_progress_current`.

### Signin-трек (`invite_progress_track: signin`)

| Метрика                       | Формула                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------- |
| **Login started → succeeded** | `auth_signin_succeeded` (source=invite) / `student_invite_login_clicked`                    |
| **Signin → Accept submit**    | `student_invite_accept_submit` (track=signin) / `auth_signin_succeeded` (source=invite)     |
| **Login started → Classroom** | `invite_accepted_success` (track=signin) / `student_invite_login_clicked`                   |
| **Invite → Signin Classroom** | `invite_accepted_success` (track=signin) / unauth `page_viewed`                             |
| **Invite → user_not_found**   | `auth_signin_failed.reason=user_not_found` (source=invite) / `student_invite_login_clicked` |

### Already auth (`invite_progress_track: already_auth`)

| Метрика                           | Формула                                                                                                       |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Already-auth Open → Classroom** | `invite_accepted_success` (track=already_auth) / `student_invite_page_viewed` (`student_authenticated: true`) |

Не включать already_auth в знаменатель signup/signin conversion.

### Сквозные

| Метрика                           | Формула                                                                                           | Источник                                                  |
| --------------------------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| **Invite → Classroom Conversion** | `invite_accepted_success` / `student_invite_page_viewed`                                          | все треки вместе; для сравнения путей — отдельно по track |
| **Copy → Classroom**              | `invite_accepted_success` / send attempt (тот же `invite_tracking_id`)                            | связка через `invite_tracking_id`                         |
| **Invite Acceptance Rate D7**     | `invite_accepted_success` (≤7 дней) / `student_invite_modal_viewed`                               | репетиторский знаменатель                                 |
| **Переход к первому занятию D14** | `lesson_created_success` или `lesson_joined` (≤14 дней после success) / `invite_accepted_success` | сравнение v1 vs v2                                        |

Медианное время (timestamps Umami + `invite_tracking_id`), **внутри одного track**:
copy → open; open → auth; для signup ещё auth → email → profile → role → socials → accept;
для signin auth → accept; copy → classroom.

Для гипотезы registration-first сравнивать **до/после 2026-08-21**:
unauth `page_viewed` → `student_invite_signup_clicked` vs `login_clicked` →
успешная auth → `invite_accepted_success`. После **2026-08-22** смотреть
drop-off по семи шагам signup и already_auth отдельно.

Message Copy Rate и Invite Acceptance Rate D7 используют знаменатель на стороне
репетитора (`student_invite_modal_viewed`), поэтому не требуют `invite_tracking_id`.
Invite Open Rate D7 — единственная метрика, которой связывание реально помогает
избежать двойного счёта при нескольких приглашениях от одного репетитора в одном
окне.

## Контракт backend (classroom-service)

Реализация в соседнем репозитории `xi.back-2`. Для frontend важно:

- Individual invite **многоразовый**: один `code` могут принять разные ученики, `usage_count` — счётчик, не флаг «использовано». Поэтому не создаём новую ссылку автоматически, пока текущая жива.
- Срока действия нет.
- `POST .../usages/` в одной request-scoped транзакции создаёт classroom (или enrollment), tutorship, инкремент `usage_count` и возвращает кабинет с `id`. Поэтому `invite_accepted_success` с `classroom_created: true` = кабинет создан; отдельное событие не нужно.
- Повторный accept той же пары tutor↔student → `409 Already joined` → frontend `already_connected`.
- Self-invite → `409 Target is the source` → frontend `self_invite` («Нельзя принять собственное приглашение.»).
- Unique constraint на пару individual classroom `(tutor_id, student_id)` **в текущей схеме нет**. Table-level `UNIQUE (tutor_id, student_id)` на всю `classrooms` ставить нельзя: это STI (individual + group в одной таблице), у group `student_id` NULL. Concurrent double-submit теоретически может создать два кабинета. Frontend защищает от double-click (`disabled` + lock), но это не гарантия целостности. Закрытие race — отдельная задача в `xi.back-2`, не в этом репозитории.

## Что не входит

Не логируем сырой токен, email, имя, текст сообщения целиком (только факт
копирования), classroom ID, user/tutor ID, raw backend error. Фактическую
доставку сообщения в мессенджере не фиксируем — событие копирования в буфер
обмена, не открытие/прочтение адресатом.
