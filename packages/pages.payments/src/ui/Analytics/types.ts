import type { PaymentStatusT, PaymentTypeT } from 'common.types';

export type AnalyticsPeriodKind = 'month' | 'last_30_days' | 'year' | 'custom';

export type AnalyticsDeltaKind = 'change' | 'new' | 'none';

export type AnalyticsDeltaT = {
  current: number | null;
  previous: number | null;
  deltaAbs: number | null;
  deltaRatio: number | null;
  deltaKind: AnalyticsDeltaKind;
};

export type AnalyticsInvoiceItemT = {
  name: string;
  price: string;
  quantity: number;
};

export type AnalyticsAttentionItemT = {
  recipientInvoiceId: number;
  studentId: number;
  studentName: string;
  total: number;
  status: Extract<PaymentStatusT, 'wf_sender_confirmation' | 'wf_receiver_confirmation'>;
  paymentType: PaymentTypeT;
  createdAt: string;
  comment: string | null;
  items: AnalyticsInvoiceItemT[];
};

export type AnalyticsSummaryT = {
  hasAnyInvoices: boolean;
  periodLabel: string;
  previousPeriodLabel: string;
  received: AnalyticsDeltaT;
  invoiced: number;
  paidCount: number;
  invoicedCount: number;
  paidRatio: number | null;
  averageCheck: number | null;
  awaitingPayment: { amount: number; count: number };
  awaitingConfirmation: { amount: number; count: number };
  studentsWithOpenInvoices: number;
  approximateRevenue: number;
  attention: AnalyticsAttentionItemT[];
};

export type AnalyticsDashboardT = AnalyticsSummaryT & {
  series: Array<{
    bucket: string;
    label: string;
    revenue: number;
    previousRevenue?: number;
    approximate?: number;
  }>;
};
