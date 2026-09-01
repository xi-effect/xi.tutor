import type { AnalyticsAttentionItemT, AnalyticsDashboardT, AnalyticsPeriodKind } from './types';

const lesson = (name: string, price: string, quantity = 1) => ({ name, price, quantity });

const attention: AnalyticsAttentionItemT[] = [
  {
    recipientInvoiceId: 184,
    studentId: 21,
    studentName: 'Мария Соколова',
    total: 6000,
    status: 'wf_receiver_confirmation',
    paymentType: 'transfer',
    createdAt: '2026-07-22T11:00:00.000Z',
    comment: 'Оплатила переводом, жду подтверждения.',
    items: [lesson('Индивидуальное занятие', '3000', 2)],
  },
  {
    recipientInvoiceId: 191,
    studentId: 18,
    studentName: 'Дмитрий Орлов',
    total: 3500,
    status: 'wf_receiver_confirmation',
    paymentType: 'cash',
    createdAt: '2026-08-03T09:30:00.000Z',
    comment: null,
    items: [lesson('Индивидуальное занятие', '3500')],
  },
  {
    recipientInvoiceId: 176,
    studentId: 12,
    studentName: 'Анна Козлова',
    total: 4500,
    status: 'wf_sender_confirmation',
    paymentType: 'transfer',
    createdAt: '2026-07-11T16:20:00.000Z',
    comment: 'Занятия за июль.',
    items: [lesson('Индивидуальное занятие', '1500', 3)],
  },
  {
    recipientInvoiceId: 188,
    studentId: 27,
    studentName: 'Илья Новиков',
    total: 2500,
    status: 'wf_sender_confirmation',
    paymentType: 'transfer',
    createdAt: '2026-07-29T14:10:00.000Z',
    comment: null,
    items: [lesson('Индивидуальное занятие', '2500')],
  },
  {
    recipientInvoiceId: 195,
    studentId: 9,
    studentName: 'Елена Васильева',
    total: 2000,
    status: 'wf_sender_confirmation',
    paymentType: 'cash',
    createdAt: '2026-08-09T18:45:00.000Z',
    comment: null,
    items: [lesson('Консультация', '2000')],
  },
];

const outstanding = {
  awaitingPayment: { amount: 9000, count: 3 },
  awaitingConfirmation: { amount: 9500, count: 2 },
  studentsWithOpenInvoices: 5,
  attention,
};

const withPrevious = <T extends { revenue: number }>(series: T[], previousValues: number[]) =>
  series.map((point, index) => ({
    ...point,
    previousRevenue: previousValues[index] ?? 0,
  }));

const monthSeries = withPrevious(
  [
    { bucket: '2026-08-01', label: '1', revenue: 0 },
    { bucket: '2026-08-02', label: '2', revenue: 4500, approximate: 4500 },
    { bucket: '2026-08-03', label: '3', revenue: 0 },
    { bucket: '2026-08-04', label: '4', revenue: 6000 },
    { bucket: '2026-08-05', label: '5', revenue: 3500 },
    { bucket: '2026-08-06', label: '6', revenue: 0 },
    { bucket: '2026-08-07', label: '7', revenue: 8000 },
    { bucket: '2026-08-08', label: '8', revenue: 2500 },
    { bucket: '2026-08-09', label: '9', revenue: 0 },
    { bucket: '2026-08-10', label: '10', revenue: 7000 },
    { bucket: '2026-08-11', label: '11', revenue: 4500 },
    { bucket: '2026-08-12', label: '12', revenue: 0 },
    { bucket: '2026-08-13', label: '13', revenue: 9200 },
    { bucket: '2026-08-14', label: '14', revenue: 3000 },
  ],
  [2000, 0, 5000, 3500, 0, 4000, 6000, 0, 4500, 3000, 0, 7000, 4000, 4000],
);

const julyTailSeries = [
  { bucket: '2026-07-16', label: '16.07', revenue: 0 },
  { bucket: '2026-07-17', label: '17.07', revenue: 0 },
  { bucket: '2026-07-18', label: '18.07', revenue: 1500 },
  { bucket: '2026-07-19', label: '19.07', revenue: 0 },
  { bucket: '2026-07-20', label: '20.07', revenue: 0 },
  { bucket: '2026-07-21', label: '21.07', revenue: 0 },
  { bucket: '2026-07-22', label: '22.07', revenue: 0 },
  { bucket: '2026-07-23', label: '23.07', revenue: 0 },
  { bucket: '2026-07-24', label: '24.07', revenue: 0 },
  { bucket: '2026-07-25', label: '25.07', revenue: 1500 },
  { bucket: '2026-07-26', label: '26.07', revenue: 0 },
  { bucket: '2026-07-27', label: '27.07', revenue: 0 },
  { bucket: '2026-07-28', label: '28.07', revenue: 0 },
  { bucket: '2026-07-29', label: '29.07', revenue: 0 },
  { bucket: '2026-07-30', label: '30.07', revenue: 0 },
  { bucket: '2026-07-31', label: '31.07', revenue: 0 },
];

const last30Series = withPrevious(
  [
    ...julyTailSeries,
    ...monthSeries.map((point) => ({
      bucket: point.bucket,
      label: `${point.label}.08`,
      revenue: point.revenue,
      approximate: point.approximate,
    })),
  ],
  [
    2500, 0, 0, 4000, 0, 3500, 0, 0, 5000, 0, 4500, 0, 3000, 0, 0, 6500, 0, 4000, 0, 2800, 0, 7200,
    0, 0, 5500, 0, 4200, 0, 4000, 0,
  ],
);

const yearSeries = [
  { bucket: '2026-01', label: 'янв', revenue: 28000 },
  { bucket: '2026-02', label: 'фев', revenue: 31500 },
  { bucket: '2026-03', label: 'мар', revenue: 40200 },
  { bucket: '2026-04', label: 'апр', revenue: 36800 },
  { bucket: '2026-05', label: 'май', revenue: 44100 },
  { bucket: '2026-06', label: 'июн', revenue: 39000 },
  { bucket: '2026-07', label: 'июл', revenue: 43000 },
  { bucket: '2026-08', label: 'авг', revenue: 48200, approximate: 4500 },
];

const customSeries = withPrevious(monthSeries.slice(0, 8), [0, 4000, 0, 5000, 3000, 0, 5800, 2000]);

const dashboards: Record<AnalyticsPeriodKind, AnalyticsDashboardT> = {
  month: {
    hasAnyInvoices: true,
    periodLabel: '1–14 августа',
    previousPeriodLabel: '1–14 июля',
    received: {
      current: 48200,
      previous: 43000,
      deltaAbs: 5200,
      deltaRatio: 0.121,
      deltaKind: 'change',
    },
    invoiced: 62000,
    paidCount: 8,
    invoicedCount: 11,
    paidRatio: 8 / 11,
    averageCheck: 6025,
    approximateRevenue: 4500,
    series: monthSeries,
    ...outstanding,
  },
  last_30_days: {
    hasAnyInvoices: true,
    periodLabel: '16 июля — 14 августа',
    previousPeriodLabel: '16 июня — 15 июля',
    received: {
      current: 51200,
      previous: 56700,
      deltaAbs: -5500,
      deltaRatio: -0.097,
      deltaKind: 'change',
    },
    invoiced: 71000,
    paidCount: 12,
    invoicedCount: 16,
    paidRatio: 12 / 16,
    averageCheck: 4267,
    approximateRevenue: 4500,
    series: last30Series,
    ...outstanding,
  },
  year: {
    hasAnyInvoices: true,
    periodLabel: '1 января — 14 августа 2026',
    previousPeriodLabel: '1 января — 14 августа 2025',
    received: {
      current: 310800,
      previous: 0,
      deltaAbs: 310800,
      deltaRatio: null,
      deltaKind: 'new',
    },
    invoiced: 348000,
    paidCount: 64,
    invoicedCount: 78,
    paidRatio: 64 / 78,
    averageCheck: 4856,
    approximateRevenue: 18200,
    series: yearSeries,
    ...outstanding,
  },
  custom: {
    hasAnyInvoices: true,
    periodLabel: 'Выбранный период',
    previousPeriodLabel: 'Предыдущий интервал той же длины',
    received: {
      current: 22100,
      previous: 19800,
      deltaAbs: 2300,
      deltaRatio: 0.116,
      deltaKind: 'change',
    },
    invoiced: 28000,
    paidCount: 5,
    invoicedCount: 7,
    paidRatio: 5 / 7,
    averageCheck: 4420,
    approximateRevenue: 0,
    series: customSeries,
    ...outstanding,
  },
};

export const getMockAnalyticsDashboard = (period: AnalyticsPeriodKind): AnalyticsDashboardT =>
  dashboards[period];
