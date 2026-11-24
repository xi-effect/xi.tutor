import { describe, expect, it } from 'vitest';
import {
  INVOICES_SEARCH_MAX_LIMIT,
  buildInvoiceSearchRequest,
  getNextRecipientInvoicesCursor,
  normalizeInvoiceFilters,
  serializeInvoiceFilters,
  startOfLocalCalendarDayIso,
  startOfNextLocalCalendarDayIso,
} from 'common.api';

describe('поиск выставленных счетов', () => {
  it('собирает пустые фильтры и курсор первой страницы', () => {
    expect(buildInvoiceSearchRequest('tutor', null, 15)).toEqual({
      cursor: null,
      limit: 15,
      filters: {},
    });
  });

  it('ограничивает размер страницы', () => {
    expect(buildInvoiceSearchRequest('student', null, 500).limit).toBe(INVOICES_SEARCH_MAX_LIMIT);
    expect(buildInvoiceSearchRequest('student', null, 0).limit).toBe(1);
  });

  it('собирает выбранные статусы без повторов', () => {
    expect(
      normalizeInvoiceFilters('tutor', {
        statuses: ['complete', 'wf_sender_confirmation', 'wf_sender_confirmation'],
      }),
    ).toEqual({
      status__in: ['wf_sender_confirmation', 'complete'],
    });
  });

  it('включает null в типы оплаты и отбрасывает неизвестные значения', () => {
    expect(
      normalizeInvoiceFilters('student', {
        paymentTypes: ['cash', null, 'cash', 'card' as 'cash'],
      }),
    ).toEqual({
      payment_type__in: ['cash', null],
    });
  });

  it('оставляет границы даты как есть и выкидывает перевёрнутый диапазон', () => {
    const from = '2026-03-01T00:00:00.000Z';
    const to = '2026-04-01T00:00:00.000Z';

    expect(normalizeInvoiceFilters('tutor', { createdAtFrom: from, createdAtTo: to })).toEqual({
      created_at__ge: from,
      created_at__lt: to,
    });
    expect(normalizeInvoiceFilters('tutor', { createdAtFrom: to, createdAtTo: from })).toEqual({});
  });

  it('календарный день «по» превращается в исключительную границу следующих суток', () => {
    const from = startOfLocalCalendarDayIso('2026-03-15');
    const to = startOfNextLocalCalendarDayIso('2026-03-15');

    expect(from).toEqual(expect.any(String));
    expect(to).toEqual(expect.any(String));
    expect(Date.parse(String(to)) - Date.parse(String(from))).toBe(24 * 60 * 60 * 1000);
    expect(startOfLocalCalendarDayIso('2026-02-31')).toBeUndefined();
  });

  it('одинаковые границы суммы ищут конкретную сумму', () => {
    expect(normalizeInvoiceFilters('tutor', { totalFrom: '1500', totalTo: '1500.00' })).toEqual({
      total__ge: '1500',
      total__le: '1500',
    });
    expect(normalizeInvoiceFilters('tutor', { totalFrom: '10,5', totalTo: '20' })).toEqual({
      total__ge: '10.5',
      total__le: '20',
    });
    expect(normalizeInvoiceFilters('tutor', { totalFrom: '30', totalTo: '10' })).toEqual({});
  });

  it('подставляет id учеников репетитору и id репетиторов ученику', () => {
    expect(normalizeInvoiceFilters('tutor', { counterpartyIds: [4, 2, 4, 0] })).toEqual({
      student_id__in: [2, 4],
    });
    expect(normalizeInvoiceFilters('student', { counterpartyIds: [9, 3] })).toEqual({
      tutor_id__in: [3, 9],
    });
    const ids = Array.from({ length: 25 }, (_, index) => index + 1);
    expect(normalizeInvoiceFilters('tutor', { counterpartyIds: ids }).student_id__in).toHaveLength(
      20,
    );
  });

  it('держит стабильный ключ запроса и курсор следующей страницы', () => {
    const filters = {
      statuses: ['wf_receiver_confirmation', 'wf_sender_confirmation'] as const,
    };
    expect(serializeInvoiceFilters('tutor', filters)).toBe(
      JSON.stringify({
        status__in: ['wf_sender_confirmation', 'wf_receiver_confirmation'],
      }),
    );
    expect(
      getNextRecipientInvoicesCursor(
        [
          { id: 1, created_at: '2026-03-02T00:00:00.000Z' },
          { id: 2, created_at: '2026-03-01T00:00:00.000Z' },
        ],
        2,
      ),
    ).toEqual({
      created_at: '2026-03-01T00:00:00.000Z',
      recipient_invoice_id: 2,
    });
    expect(
      getNextRecipientInvoicesCursor([{ id: 2, created_at: '2026-03-01T00:00:00.000Z' }], 2),
    ).toBeUndefined();

    const cursor = { created_at: '2026-03-01T00:00:00.000Z', recipient_invoice_id: 2 };
    expect(buildInvoiceSearchRequest('student', cursor, 15, filters)).toMatchObject({
      cursor,
      limit: 15,
      filters: {
        status__in: ['wf_sender_confirmation', 'wf_receiver_confirmation'],
      },
    });
  });
});
