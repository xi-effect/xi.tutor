# Приглашение ученика v2 (`invite_flow_version: 2`)

Документация нового сценария приглашения ученика («одна актуальная ссылка + готовое
сообщение» вместо технического списка ссылок) — frontend-only изменение, backend и
модель приглашений не менялись.

Сводный реестр событий воронки активации: [`activation-events.md`](./activation-events.md).

## Дата и время релиза

| Версия                   | Действует с                                                                                  | Комментарий                                                                                |
| ------------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `invite_flow_version: 1` | до релиза v2 (включительно)                                                                  | Старая модалка со списком ссылок (`ModalInvitationLegacy`), старые тексты страницы ученика |
| `invite_flow_version: 2` | **2026-07-27** (дата реализации; проставить фактическую дату/время деплоя в прод при релизе) | Новый сценарий: `ModalInvitationV2`, обновлённые тексты `/invite/$inviteId`                |

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

## Список новых событий

См. `PRODUCT_ANALYTICS_EVENTS` в
[`packages/common.utils/src/productAnalytics/events.ts`](../../packages/common.utils/src/productAnalytics/events.ts)
и контракт свойств в
[`eventMap.ts`](../../packages/common.utils/src/productAnalytics/eventMap.ts).

Репетитор: `student_invite_modal_viewed`, `student_invite_message_copied`,
`student_invite_new_link_created`. Единственное основное действие в модалке —
«Скопировать сообщение»; кнопки «Скопировать только ссылку» и блока истории
ранее созданных ссылок в UI нет, поэтому `student_invite_link_copied` в
v2-потоке не отправляется (событие остаётся только в `ModalInvitationLegacy`,
см. `VITE_LEGACY_INVITES_MODAL_ENABLED`).

«Обновить ссылку» — не аддитивное создание, а замена: текущее (последнее)
приглашение удаляется (`DELETE`, существующий метод API) и сразу создаётся
новое. Повторные обновления не увеличивают общее число приглашений.
`student_invite_new_link_created` содержит `previous_invite_id` — id удалённого
приглашения. В форме показывается последнее созданное приглашение, в том числе
если по нему уже принимали ученика.

Ученик: `student_invite_page_viewed`, `student_invite_signup_clicked`,
`student_invite_login_clicked`.

Подробные таблицы «когда отправляется» — в
[`activation-events.md`](./activation-events.md#приглашение-ученика-репетитор) (разделы
«Новая форма приглашения v2»).

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
- если токена нет (например, `invite_tracking_id` для событий на `SignInPage`, где код приглашения технически недоступен) — поле `invite_tracking_id` не включается в payload, а не отправляется как `null`/`undefined`;
- поле передаётся только в событиях, формирующих цепочку: `student_invite_message_copied` (репетитор) и `student_invite_page_viewed`, `student_invite_opened`, `student_invite_accept_submit`, `invite_accepted_success`, `student_invite_accept_failed` (ученик).

### Ограничение точности связывания

Если у репетитора и ученика доступны **разные** значения токена (например, ссылка
была скопирована из истории/пересланное сообщение с другим форматированием, либо
backend в будущем изменит формат `code`), точное связывание по `invite_tracking_id`
не работает. В этом случае аналитику нужно сравнивать на уровне репетитора,
пользователя и временных окон (см. метрики ниже — они не требуют точного
связывания, только окна дат).

## Метрики

Все метрики считаются по `invite_flow_version: 2` отдельно от v1 (для сравнения
до/после релиза — см. дату в таблице выше).

| Метрика                                  | Формула                                                                                                                                    | Источник событий                                                       |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| **Message Copy Rate**                    | `student_invite_message_copied` / `student_invite_modal_viewed`                                                                            | репетитор                                                              |
| **Invite Open Rate D7**                  | `student_invite_page_viewed` (тот же `invite_tracking_id`, ≤7 дней) / `student_invite_message_copied`                                      | связка через `invite_tracking_id`, при отсутствии — репетитор+окно дат |
| **Invite Acceptance Rate D7**            | `invite_accepted_success` (≤7 дней) / `student_invite_modal_viewed`                                                                        | ученик / репетитор                                                     |
| **Переход к первому занятию D14** (доп.) | `lesson_created_success` или `lesson_joined` для принявшего ученика (≤14 дней после `invite_accepted_success`) / `invite_accepted_success` | сравнение v1 vs v2                                                     |

Message Copy Rate и Invite Acceptance Rate D7 используют знаменатель на стороне
репетитора (`student_invite_modal_viewed`), поэтому не требуют `invite_tracking_id`.
Invite Open Rate D7 — единственная метрика, которой связывание реально помогает
избежать двойного счёта при нескольких приглашениях от одного репетитора в одном
окне.

## Что не входит

Не логируем сырой токен, email, имя, текст сообщения целиком (только факт
копирования), фактическую доставку сообщения в мессенджере (событие фиксирует
только копирование в буфер обмена, не открытие/прочтение адресатом). Кнопка
«Отправить» (Web Share API) в UI не используется — единственное действие с
сообщением — «Скопировать сообщение».
