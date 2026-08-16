# ТЗ: бэкенд финансовой аналитики репетитора

Документ для `xi.back-2`. Фронт вкладки **Контроль оплат → Аналитика** уже собран на моках. Этот текст — что нужно на API, какие поля и инварианты поменять и зачем.

Продуктовый смысл плиток — в `user-docs/docs-draft/06-payments/payments-analytics.mdx`. Здесь только данные и контракт.

Репозиторий: `/Users/igor.b/Desktop/Work/xi.effect/xi.back-2`.  
Модуль счетов: `app/invoices`. Пустой stub `app/payments` **не использовать**.

---

## 1. Зачем это бэкенду

Сейчас аналитику нельзя честно посчитать на существующих эндпоинтах.

| Что есть                                | Почему недостаточно                                                                  |
| --------------------------------------- | ------------------------------------------------------------------------------------ |
| `POST .../recipient-invoices/searches/` | Постраничный журнал. Нет агрегатов, нет фильтра по дате оплаты, нет previous-периода |
| `GET .../recipient-invoices/{id}/`      | Карточка одного счёта. Для дашборда не годится                                       |
| `RecipientInvoice.total` + `status`     | Сумма и статус есть                                                                  |
| `Invoice.created_at`                    | Есть дата выставления                                                                |
| Даты оплаты **нет**                     | Нельзя отличить «получили в августе» от «выставили в августе»                        |

Без даты оплаты плитка **Получено** и график будут врать: закрытый в сентябре июльский счёт попадёт в июль.

Клиент **не** должен:

- скачивать все счета и суммировать у себя;
- считать previous-период (MTD/YTD легко разъедутся между web и будущими клиентами).

---

## 2. Границы

**Делаем**

1. Фундамент: `paid_at` и атомарный переход в `COMPLETE`.
2. Один read-эндпоинт дашборда под уже свёрстанные плитки.

**Не делаем**

- аналитику ученика;
- разбивку по предметам, кабинетам, ученикам (это следующий этап, и `subject_id` кабинета для истории не годится);
- аналитику занятий / нагрузки (расписание 2.0 ещё не канон на main);
- новый микросервис `analytics-service`;
- отдельную таблицу снимок-метрик (пока объёмы позволяют считать online).

Единица учёта везде — **`RecipientInvoice`**, не `Invoice`. Групповой счёт — это N оплат с своими `total` и статусами.

Канон суммы — **`RecipientInvoice.total`**. Расхождение с `sum(price * quantity)` позиций — известный долг, в этом этапе не чиним.

---

## 3. Этап 0. Дата оплаты

Без этого этапа дашборд запускать нельзя.

### 3.1. Колонка

Таблица `recipient_invoices`:

```text
paid_at  DateTime(timezone=True)  NULL
```

- `NULL` у открытых счетов и у **legacy** `COMPLETE`, которые закрыли до миграции.
- Новые `COMPLETE` всегда с `paid_at`.
- В `PATCH` поле **не принимать**. Иначе кассу можно переписать задним числом.

Миграция: следующая ревизия после `056` (сейчас latest). Без бэкфилла. Без CHECK `COMPLETE ⇒ paid_at NOT NULL` — он сломает legacy.

### 3.2. Зачем write-path, а не только колонка

Сейчас unilateral и receiver делают только `status = COMPLETE`. Если добавить колонку и забыть проставить её в двух местах, все новые оплаты станут «приблизительными» навсегда.

Нужен один helper, оба поля в одном update до commit:

```text
status = COMPLETE
if paid_at is None:
    paid_at = now_utc()
```

Вызывать из:

- `POST .../payment-confirmations/unilateral/` (тьютор закрыл сам);
- `POST .../payment-confirmations/receiver/` (тьютор подтвердил оплату ученика).

`POST .../payment-confirmations/sender/` (ученик) ставит `WF_RECEIVER_CONFIRMATION` и **`paid_at` не трогает**. Деньги ещё не получены.

Повторный confirm — по-прежнему 409, `paid_at` не менять.

Предлагаемый файл: `app/invoices/services/payment_completion_svc.py`. Роуты только вызывают helper.

### 3.3. `effective_paid_at` и approximate

После cutover:

```text
COMPLETE  ⇒  paid_at IS NOT NULL     # новые строки
```

Для аналитики:

```text
если paid_at is not None:
    effective_paid_at = paid_at
    approximate = false

иначе если status == COMPLETE:          # только legacy на момент миграции
    effective_paid_at = invoice.created_at
    approximate = true

иначе:
    счёт не в «Получено»
```

`COALESCE(paid_at, created_at)` **нельзя** применять ко всем подряд. Иначе баг write-path («забыли проставить paid_at») будет выглядеть как нормальные данные.

Cutover: константа `PAID_AT_CUTOVER_AT` = UTC-момент миграции, рядом с ревизией.

`approximate_revenue` в дашборде — сумма legacy-оплат, попавших в **текущий** период. Фронт уже показывает сноску: _«Часть суммы отнесена к дате выставления — точной даты оплаты нет»_.

### 3.4. Индексы

Дашборд будет фильтровать по тьютору, статусу и двум осям времени.

| Индекс                                                           | Зачем                                                         |
| ---------------------------------------------------------------- | ------------------------------------------------------------- |
| `invoices (tutor_id, created_at)`                                | когорта «выставлено за период», empty-state, outstanding join |
| `recipient_invoices (invoice_id, status)`                        | outstanding и join к invoice                                  |
| partial `recipient_invoices (paid_at) WHERE paid_at IS NOT NULL` | «Получено» и график без скана всех открытых счетов            |

Точные имена — как принято в alembic-ревизиях проекта.

---

## 4. Этап 1. Эндпоинт дашборда

### 4.1. Куда класть

Не новый сервис. Роут в `invoice-service`, рядом с журналом тьютора.

```text
GET /api/protected/invoice-service/roles/tutor/analytics/dashboard/
```

Почему GET: чтение, параметры периода помещаются в query.  
Почему не searches: другой контракт, другие индексы, не страница журнала.

Авторизация как у `list_tutor_recipient_invoices`: `Invoice.tutor_id = current user`. Отдельная проверка `default_layout` не нужна — вкладку и так прячет фронт.

Ученику 403 или пустой ответ не отдаём этим путём: роут только `roles/tutor`.

### 4.2. Вход

Клиент считает **только текущий** интервал (то, что видно в пресете / date picker) и присылает его целиком. Previous считает сервер.

| Поле     | Тип                                             | Смысл                                                                   |
| -------- | ----------------------------------------------- | ----------------------------------------------------------------------- |
| `period` | `month` \| `last_30_days` \| `year` \| `custom` | какой алгоритм previous                                                 |
| `from`   | aware datetime                                  | начало текущего, включительно                                           |
| `to`     | aware datetime                                  | конец текущего, **исключительно** `[from, to)`                          |
| `tz`     | IANA, например `Europe/Moscow`                  | границы календарного месяца/года. У пользователя в профиле таймзоны нет |

Полуинтервал `[from, to)` везде: и для кассы, и для выставленных, и для бакетов графика.

Валидация:

- `from < to`;
- `tz` — валидная IANA;
- для `custom` ограничить длину (предложение: не больше 2 лет), иначе график и seq-scan раздуются;
- жёстко пересчитывать `now` на сервере **не нужно**: иначе разъедется с часами на экране. Можно мягко проверить, что для `month` `from` — 1-е число в `tz`.

### 4.3. Previous — только сервер

**`period=month`** (месяц ещё идёт) — календарная проекция даты, не `elapsed = now - start`.

```text
current_from = 1-е текущего месяца 00:00 в tz
current_to   = now в tz          # приходит от клиента

previous_from = 1-е предыдущего месяца 00:00 в tz
previous_to.day  = min(current_to.day, days_in(previous month))
previous_to.time = current_to.time
```

| Сейчас         | previous_to                    |
| -------------- | ------------------------------ |
| 14 авг 15:00   | 14 июля 15:00                  |
| 31 марта 12:00 | 28 фев 12:00 (29 в високосный) |
| 31 мая 10:00   | 30 апреля 10:00                |

Почему не elapsed: 31 марта + «сколько прошло с 1 марта» даёт не 28/29 февраля.

**`period=year`**

```text
current_from = 1 янв 00:00 года current_to в tz
previous_from = 1 янв 00:00 предыдущего года
previous_to = та же локальная дата год назад;
  если дня нет (29 фев) → 28 фев, то же время
```

**`last_30_days` / `custom`**

```text
duration = to - from
previous = [from - duration, from)
```

В ответе всегда вернуть `period: {from, to}` и `previous_period: {from, to}`. Локализованные подписи («1–14 августа») рисует фронт.

---

## 5. Семантика метрик

Две оси, которые фронт уже подписывает как **За период** и **Сейчас**.

### 5.1. За период — зависят от `from`/`to`

**Получено (`received`)**

```text
status = COMPLETE
AND effective_paid_at ∈ [from, to)
SUM(total)
```

Счёт, выставленный в июле и закрытый в августе, живёт в августе.

Дельта только для этой метрики:

| previous | current | `delta_kind` | `delta_abs`        | `delta_ratio`                   |
| -------- | ------- | ------------ | ------------------ | ------------------------------- |
| 0        | > 0     | `new`        | current            | `null` (не +∞%)                 |
| 0        | 0       | `none`       | `null`             | `null`                          |
| > 0      | любое   | `change`     | current − previous | (current − previous) / previous |

Фронт: `new` → бейдж «Новый»; `change` → ₽ и %; `none` → ничего.

**Выставлено (`invoiced`)**

```text
invoice.created_at ∈ [from, to)
SUM(total), COUNT(*)
```

Это номинал выставленного, не касса. На UI отдельная плитка.

**N из M оплачено (`paid_count` / `invoiced_count`)**

Когорта по **дате выставления**. N = сколько из них `COMPLETE` **на сейчас**, не «оплачены внутри периода».

Пример: выставлен 1 августа, закрыт 2 сентября.

- 14 августа: `0 из 1`;
- после 2 сентября: `1 из 1` даже если смотрите август.

Историческое «август» меняется. Так задумано: доля выставленного, которое уже дошло.

Если `invoiced_count = 0` → `paid_ratio = null`.

**Средний чек (`average_check`)**

```text
AVG(total) WHERE COMPLETE AND effective_paid_at ∈ [from, to)
```

Средний размер **полученной** оплаты за период, не средний выставленный счёт. Нет ни одной такой оплаты → `null`, на UI **—**, не `0`.

**График (`series`)**

Те же COMPLETE, что в «Получено», в бакетах:

| `period`                                   | бакет                          |
| ------------------------------------------ | ------------------------------ |
| `month`, `last_30_days`, короткий `custom` | календарный день в `tz`        |
| `year`                                     | календарный месяц в `tz`       |
| длинный `custom` (> 32 точек)              | день; фронт сам уйдёт на линию |

Точка:

```text
bucket            # ISO: YYYY-MM-DD или YYYY-MM
revenue           # текущий период
previous_revenue  # тот же индекс бакета прошлого периода; 0 если пусто
approximate       # сумма legacy в этом бакете текущего периода, если > 0
```

Бакеты без оплат тоже отдавать (нули), иначе график «дырявый». Для года — с января по месяц `to`, не 12 пустых месяцев вперёд.

Тумблер «Сравнение» фронт прячет, если все `previous_revenue` = 0. Серверу отдельный флаг не обязателен.

### 5.2. Сейчас — период **не фильтрует**

Иначе тьютор переключит «этот месяц» и «потеряет» июльский незакрытый счёт.

**Ожидает оплаты**

```text
status = WF_SENDER_CONFIRMATION
SUM(total), COUNT(*)
```

На UI бейдж журнала: «Ждет оплаты».

**На подтверждении**

```text
status = WF_RECEIVER_CONFIRMATION
SUM(total), COUNT(*)
```

На UI: «Ожидает подтверждения». Два статуса **не складывать** в одну «задолженность»: разное следующее действие.

**С незакрытыми счетами**

```text
COUNT DISTINCT student_id
WHERE status IN (WF_SENDER_CONFIRMATION, WF_RECEIVER_CONFIRMATION)
```

Это люди, не счета и не рубли. Один ученик с двумя открытыми счетами = 1.

**Требуют внимания**

Те же открытые счета, не срез периода.

Сортировка под действие:

1. сначала `WF_RECEIVER_CONFIRMATION`;
2. затем `WF_SENDER_CONFIRMATION`;
3. внутри статуса `Invoice.created_at ASC` (старые выше).

Лимит: **20**. Остальное — журнал. В дашборд не тащить позиции счёта и комментарий: они уже есть в `GET .../recipient-invoices/{id}/`.

Имя ученика резолвить на сервере через `users_internal_bridge.retrieve_multiple_users` (уже есть, пачки до 100 id). Иначе фронт сделает N запросов профилей. Поле: `student_name` = `display_name`, fallback `username`.

Элемент списка:

```text
recipient_invoice_id
student_id
student_name
total
status            # только два открытых
payment_type      # может быть null, пока ученик не отметил оплату
created_at
```

`has_any_invoices`: есть ли у тьютора хотя бы один `RecipientInvoice` вообще. Если false — фронт показывает пустой экран, дашборд можно не считать.

---

## 6. Контракт ответа

Черновик JSON. Деньги — как в существующих invoice-схемах (`Decimal`, 2 знака). Даты — aware ISO-8601.

```json
{
  "has_any_invoices": true,
  "timezone": "Europe/Moscow",
  "period": { "from": "...", "to": "..." },
  "previous_period": { "from": "...", "to": "..." },

  "received": {
    "current": "48200.00",
    "previous": "43000.00",
    "delta_abs": "5200.00",
    "delta_ratio": 0.121,
    "delta_kind": "change"
  },

  "invoiced": "62000.00",
  "invoiced_count": 11,
  "paid_count": 8,
  "paid_ratio": 0.727,
  "average_check": "6025.00",

  "awaiting_payment": { "amount": "9000.00", "count": 3 },
  "awaiting_confirmation": { "amount": "9500.00", "count": 2 },
  "students_with_open_invoices": 5,

  "approximate_revenue": "4500.00",

  "series": [
    {
      "bucket": "2026-08-02",
      "revenue": "4500.00",
      "previous_revenue": "0.00",
      "approximate": "4500.00"
    }
  ],

  "attention": [
    {
      "recipient_invoice_id": 184,
      "student_id": 21,
      "student_name": "Мария Соколова",
      "total": "6000.00",
      "status": "wf_receiver_confirmation",
      "payment_type": "transfer",
      "created_at": "2026-07-22T11:00:00+00:00"
    }
  ]
}
```

Nullable:

- `average_check`, `paid_ratio` — нет базы для дроби/среднего;
- `received.delta_abs` / `delta_ratio` — при `delta_kind = none` или `new` (ratio);
- `approximate` на точке — можно опускать, если 0;
- `payment_type` — null, пока тип не выбран.

`received.current` при отсутствии оплат — `"0.00"`, не null. Прочерк на UI только у среднего чека.

---

## 7. Предлагаемая раскладка файлов

Всё в модуле `invoices`, без нового префикса сервиса.

| Файл                                                | Зачем                            |
| --------------------------------------------------- | -------------------------------- |
| `alembic/versions/057_recipient_invoice_paid_at.py` | колонка + индексы                |
| `app/invoices/models/recipient_invoices_db.py`      | поле `paid_at`                   |
| `app/invoices/services/payment_completion_svc.py`   | `mark_complete`                  |
| `app/invoices/services/paid_at.py`                  | резолвер + `PAID_AT_CUTOVER_AT`  |
| `app/invoices/services/periods.py`                  | previous от `period/from/to/tz`  |
| `app/invoices/services/analytics_dashboard_svc.py`  | агрегаты одним-двумя SQL, не N+1 |
| `app/invoices/routes/invoices_tutor_rst.py`         | helper на confirm + новый GET    |
| `app/invoices/schemas/analytics_sch.py`             | request/response                 |

Агрегацию считать в SQL (`SUM`/`COUNT`/`AVG`/`date_trunc` в `tz`), не выгружать все счета в Python. Имена учеников — один batch после выборки attention.

---

## 8. Тесты

### Write-path (`tests/invoices/functional/`)

- unilateral → `COMPLETE` и `paid_at` not null;
- receiver → то же;
- повторный confirm → 409, `paid_at` тот же;
- PATCH `total` не меняет `paid_at`;
- sender → `WF_RECEIVER_CONFIRMATION`, `paid_at` остаётся null.

### Периоды (`tests/invoices/unit/test_periods.py`)

- 14 августа → previous_to 14 июля;
- 31 марта → 28/29 февраля;
- 31 мая → 30 апреля;
- 31 января → 31 декабря;
- YTD 29 февраля → 28 февраля прошлого года;
- `last_30_days` / `custom` — равная длина, previous стыкуется вплотную.

### Резолвер (`tests/invoices/unit/test_paid_at.py`)

- есть `paid_at` → не approximate;
- legacy COMPLETE без `paid_at` → `created_at` + approximate;
- post-cutover COMPLETE без `paid_at` → не маскировать COALESCE.

### Дашборд (`tests/invoices/functional/test_analytics_dashboard.py`)

- outstanding не зависит от `from`/`to`;
- received фильтруется по `paid_at`, invoiced — по `created_at`;
- когорта N из M: закрытие после периода увеличивает N;
- `average_check is None`, если в периоде нет COMPLETE;
- `delta_kind=new`, если previous = 0 и current > 0;
- attention: receiver выше sender, внутри `created_at` ASC;
- пустой тьютор → `has_any_invoices=false`;
- чужой тьютор не видит чужие счета.

---

## 9. Дополнительные предложения (не блокер дашборда)

**Заморозить `total` после COMPLETE.** Сейчас PATCH может поменять сумму уже закрытого счёта и переписать кассу задним числом. Для аналитики это дыра. Минимум этапа 0 — не принимать `paid_at`. Следующим шагом — 409 на смену `total`, если статус уже `COMPLETE`.

**Не класть позиции в дашборд.** Фронтовый мок открывает локальную карточку из payload. В проде лучше тот же `GET` карточки, что журнал. Иначе два источника правды.

**Не считать previous на клиенте.** Даже «очевидный» last_30 легко разъедется с сервером из‑за DST и полуинтервалов.

**Не бэкфиллить `paid_at = created_at`.** Это навсегда спрячет, какие оплаты приблизительные. Approximate-ветка как раз для честной сноски.

---

## 10. Порядок поставки

1. Миграция `paid_at` + helper + тесты write-path. С этого момента новые оплаты пригодны для кассы.
2. Period utils + резолвер `effective_paid_at`.
3. GET дашборда + SQL-агрегаты + attention с именами.
4. Фронт меняет мок на хук; карточку из attention переводит на существующий GET.

Пункт 1 можно выкатить раньше UI: журнал не сломается, колонка nullable.
