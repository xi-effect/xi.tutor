import { cn } from '@xipkg/utils';
import {
  startOfLocalCalendarDayIso,
  startOfNextLocalCalendarDayIso,
  type InvoicePaymentStatus,
  type InvoicePaymentType,
  type InvoiceSearchFilters,
} from 'common.api';

export const paymentsFilterPopoverClass = cn(
  'bg-background-surface text-text-primary z-50 flex w-[min(280px,calc(100vw-32px))] min-w-0 max-w-[min(280px,calc(100vw-32px))] flex-col gap-4 overflow-hidden rounded-2xl border border-border-default p-4 shadow-[0px_4px_16px_rgba(0,0,0,0.08)] outline-none',
);

export const paymentsFilterPopoverProps = {
  align: 'start' as const,
  side: 'bottom' as const,
  sideOffset: 8,
  collisionPadding: 16,
};

export type InvoicePaymentTypeChoice = InvoicePaymentType | 'unpaid';

export type PaymentsFiltersState = {
  statuses: InvoicePaymentStatus[];
  paymentTypes: InvoicePaymentTypeChoice[];
  createdFrom: string;
  createdTo: string;
  totalFrom: string;
  totalTo: string;
  counterpartyIds: number[];
};

export const emptyPaymentsFilters = (): PaymentsFiltersState => ({
  statuses: [],
  paymentTypes: [],
  createdFrom: '',
  createdTo: '',
  totalFrom: '',
  totalTo: '',
  counterpartyIds: [],
});

export const hasPaymentsFilters = (filters: PaymentsFiltersState) =>
  filters.statuses.length > 0 ||
  filters.paymentTypes.length > 0 ||
  Boolean(filters.createdFrom || filters.createdTo || filters.totalFrom || filters.totalTo) ||
  filters.counterpartyIds.length > 0;

const boundCount = (from: string, to: string) => Number(Boolean(from)) + Number(Boolean(to));

export const paymentsDateFilterCount = (filters: PaymentsFiltersState) =>
  boundCount(filters.createdFrom, filters.createdTo);

export const paymentsAmountFilterCount = (filters: PaymentsFiltersState) =>
  boundCount(filters.totalFrom, filters.totalTo);

export const toInvoiceSearchFilters = (filters: PaymentsFiltersState): InvoiceSearchFilters => ({
  statuses: filters.statuses,
  paymentTypes: filters.paymentTypes.map((paymentType) =>
    paymentType === 'unpaid' ? null : paymentType,
  ),
  createdAtFrom: filters.createdFrom ? startOfLocalCalendarDayIso(filters.createdFrom) : undefined,
  createdAtTo: filters.createdTo ? startOfNextLocalCalendarDayIso(filters.createdTo) : undefined,
  totalFrom: filters.totalFrom || undefined,
  totalTo: filters.totalTo || undefined,
  counterpartyIds: filters.counterpartyIds,
});
