import type { UserRoleT } from './types';

export const PAYMENT_STATUSES = [
  'wf_sender_confirmation',
  'wf_receiver_confirmation',
  'complete',
] as const;

export const PAYMENT_TYPES = ['transfer', 'cash'] as const;

export const INVOICE_FILTER_MAX_STATUSES = PAYMENT_STATUSES.length;
export const INVOICE_FILTER_MAX_PAYMENT_TYPES = PAYMENT_TYPES.length + 1;
export const INVOICE_FILTER_MAX_COUNTERPARTIES = 20;
export const INVOICES_SEARCH_DEFAULT_LIMIT = 15;
export const INVOICES_SEARCH_MAX_LIMIT = 99;

export type InvoicePaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type InvoicePaymentType = (typeof PAYMENT_TYPES)[number];
export type InvoicePaymentTypeFilter = InvoicePaymentType | null;

export type RecipientInvoiceCursor = {
  created_at: string;
  recipient_invoice_id: number;
};

export type InvoiceSearchFilters = {
  statuses?: readonly InvoicePaymentStatus[] | null;
  paymentTypes?: readonly InvoicePaymentTypeFilter[] | null;
  /** Нижняя граница created_at, включительно. */
  createdAtFrom?: string | null;
  /** Верхняя граница created_at, исключительно. */
  createdAtTo?: string | null;
  /** Нижняя граница суммы, включительно. */
  totalFrom?: string | number | null;
  /** Верхняя граница суммы, включительно. Одинаковые границы ищут точную сумму. */
  totalTo?: string | number | null;
  /** id учеников для репетитора и id репетиторов для ученика. */
  counterpartyIds?: readonly number[] | null;
};

export type InvoiceFiltersBody = {
  status__in?: InvoicePaymentStatus[];
  payment_type__in?: InvoicePaymentTypeFilter[];
  created_at__ge?: string;
  created_at__lt?: string;
  total__ge?: string;
  total__le?: string;
  student_id__in?: number[];
  tutor_id__in?: number[];
};

export type InvoiceSearchRequest = {
  cursor: RecipientInvoiceCursor | null;
  limit: number;
  filters: InvoiceFiltersBody;
};

const isPaymentStatus = (value: string): value is InvoicePaymentStatus =>
  (PAYMENT_STATUSES as readonly string[]).includes(value);

const isPaymentType = (value: string): value is InvoicePaymentType =>
  (PAYMENT_TYPES as readonly string[]).includes(value);

export function normalizeInvoicesSearchLimit(limit?: number): number {
  const value = limit ?? INVOICES_SEARCH_DEFAULT_LIMIT;
  if (!Number.isFinite(value)) {
    return INVOICES_SEARCH_DEFAULT_LIMIT;
  }

  return Math.min(Math.max(Math.trunc(value), 1), INVOICES_SEARCH_MAX_LIMIT);
}

export function normalizeInvoiceStatuses(
  statuses?: readonly InvoicePaymentStatus[] | null,
): InvoicePaymentStatus[] | undefined {
  if (!statuses?.length) {
    return undefined;
  }

  const selected = new Set(statuses.filter((status) => isPaymentStatus(status)));
  const next = PAYMENT_STATUSES.filter((status) => selected.has(status));
  return next.length > 0 ? [...next] : undefined;
}

export function normalizeInvoicePaymentTypes(
  paymentTypes?: readonly InvoicePaymentTypeFilter[] | null,
): InvoicePaymentTypeFilter[] | undefined {
  if (!paymentTypes?.length) {
    return undefined;
  }

  const includeUnpaid = paymentTypes.includes(null);
  const selected = new Set(
    paymentTypes.filter((paymentType): paymentType is InvoicePaymentType =>
      paymentType == null ? false : isPaymentType(paymentType),
    ),
  );
  const next: InvoicePaymentTypeFilter[] = PAYMENT_TYPES.filter((paymentType) =>
    selected.has(paymentType),
  );
  if (includeUnpaid) {
    next.push(null);
  }

  return next.length > 0 ? next.slice(0, INVOICE_FILTER_MAX_PAYMENT_TYPES) : undefined;
}

export function normalizeInvoiceCounterpartyIds(
  ids?: readonly number[] | null,
): number[] | undefined {
  if (!ids?.length) {
    return undefined;
  }

  const unique = [...new Set(ids.filter((id) => Number.isInteger(id) && id > 0))].sort(
    (left, right) => left - right,
  );
  return unique.length > 0 ? unique.slice(0, INVOICE_FILTER_MAX_COUNTERPARTIES) : undefined;
}

export function canonicalInvoiceTotal(value?: string | number | null): string | undefined {
  if (value == null) {
    return undefined;
  }

  const raw = (typeof value === 'number' ? String(value) : value).trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(raw)) {
    return undefined;
  }

  const [whole = '', fraction = ''] = raw.split('.');
  const trimmedFraction = fraction.replace(/0+$/, '');
  const normalizedWhole = whole.replace(/^0+(?=\d)/, '') || '0';
  return trimmedFraction ? `${normalizedWhole}.${trimmedFraction}` : normalizedWhole;
}

export function startOfLocalCalendarDayIso(date: string): string | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) {
    return undefined;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const value = new Date(year, month - 1, day);
  if (value.getFullYear() !== year || value.getMonth() !== month - 1 || value.getDate() !== day) {
    return undefined;
  }

  return value.toISOString();
}

export function startOfNextLocalCalendarDayIso(date: string): string | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) {
    return undefined;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const start = new Date(year, month - 1, day);
  if (start.getFullYear() !== year || start.getMonth() !== month - 1 || start.getDate() !== day) {
    return undefined;
  }

  return new Date(year, month - 1, day + 1).toISOString();
}

function normalizeInvoiceDate(value?: string | null): string | undefined {
  if (!value) {
    return undefined;
  }

  const calendarDay = startOfLocalCalendarDayIso(value);
  if (calendarDay) {
    return calendarDay;
  }

  const time = Date.parse(value);
  if (Number.isNaN(time)) {
    return undefined;
  }

  return new Date(time).toISOString();
}

export function normalizeInvoiceFilters(
  role: UserRoleT,
  filters?: InvoiceSearchFilters | null,
): InvoiceFiltersBody {
  const statuses = normalizeInvoiceStatuses(filters?.statuses);
  const paymentTypes = normalizeInvoicePaymentTypes(filters?.paymentTypes);
  const createdFrom = normalizeInvoiceDate(filters?.createdAtFrom);
  const createdTo = normalizeInvoiceDate(filters?.createdAtTo);
  const totalFrom = canonicalInvoiceTotal(filters?.totalFrom);
  const totalTo = canonicalInvoiceTotal(filters?.totalTo);
  const counterpartyIds = normalizeInvoiceCounterpartyIds(filters?.counterpartyIds);
  const dates =
    createdFrom && createdTo && createdFrom >= createdTo
      ? {}
      : {
          ...(createdFrom ? { created_at__ge: createdFrom } : {}),
          ...(createdTo ? { created_at__lt: createdTo } : {}),
        };
  const totals =
    totalFrom && totalTo && Number(totalFrom) > Number(totalTo)
      ? {}
      : {
          ...(totalFrom ? { total__ge: totalFrom } : {}),
          ...(totalTo ? { total__le: totalTo } : {}),
        };

  return {
    ...(statuses ? { status__in: statuses } : {}),
    ...(paymentTypes ? { payment_type__in: paymentTypes } : {}),
    ...dates,
    ...totals,
    ...(counterpartyIds
      ? role === 'tutor'
        ? { student_id__in: counterpartyIds }
        : { tutor_id__in: counterpartyIds }
      : {}),
  };
}

export function serializeInvoiceFilters(
  role: UserRoleT,
  filters?: InvoiceSearchFilters | null,
): string {
  return JSON.stringify(normalizeInvoiceFilters(role, filters));
}

export function buildInvoiceSearchRequest(
  role: UserRoleT,
  cursor: RecipientInvoiceCursor | null,
  limit?: number,
  filters?: InvoiceSearchFilters | null,
): InvoiceSearchRequest {
  return {
    cursor,
    limit: normalizeInvoicesSearchLimit(limit),
    filters: normalizeInvoiceFilters(role, filters),
  };
}

export function getNextRecipientInvoicesCursor(
  lastPage: ReadonlyArray<{ created_at?: string; id?: number }>,
  limit: number,
): RecipientInvoiceCursor | undefined {
  if (!lastPage.length || lastPage.length < limit) {
    return undefined;
  }

  const lastItem = lastPage[lastPage.length - 1];
  if (!lastItem?.created_at || lastItem.id == null) {
    return undefined;
  }

  return {
    created_at: lastItem.created_at,
    recipient_invoice_id: lastItem.id,
  };
}
