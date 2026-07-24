import { ColumnDef } from '@tanstack/react-table';
import type {
  RoleT,
  PaymentStatusT,
  PaymentTypeT,
  PaymentDataT,
  StudentPaymentT,
  TutorPaymentT,
  RolePaymentT,
} from 'common.types';
import i18n from 'i18next';

// Реэкспортируем типы из common.types для обратной совместимости
export type {
  RoleT,
  PaymentStatusT,
  PaymentTypeT,
  PaymentDataT,
  StudentPaymentT,
  TutorPaymentT,
  RolePaymentT,
};

export type StudentT = {
  id: number;
  name: string;
  description?: string | '';
  avatarUrl?: string;
  status: PaymentStatusT;
};

export type SubjectT = {
  id: number;
  name: string;
};

export interface TableMetaI {
  students: StudentT[];
  subjects: SubjectT[];
}

export type DataTableProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData>[];
  students?: StudentT[];
  subjects?: SubjectT[];
};

export type PaymentT = {
  id: number;
  idStudent: number;
  idSubject: number;
  datePayment: string;
  amountPayment: number;
  typePayment: 'card' | 'cash';
  statusPayment: 'paid' | 'unpaid' | 'processing';
};

export const getPaymentTypeLabels = (): Record<PaymentTypeT, string> => ({
  cash: i18n.t('paymentType.cash', { ns: 'paymentsTable' }),
  transfer: i18n.t('paymentType.transfer', { ns: 'paymentsTable' }),
});

export const getPaymentStatusLabels = (): Record<PaymentStatusT, string> => ({
  complete: i18n.t('status.complete', { ns: 'paymentsTable' }),
  wf_receiver_confirmation: i18n.t('status.wf_receiver_confirmation', { ns: 'paymentsTable' }),
  wf_sender_confirmation: i18n.t('status.wf_sender_confirmation', { ns: 'paymentsTable' }),
});

export const mapPaymentType: Record<PaymentTypeT, string> = {
  get cash() {
    return i18n.t('paymentType.cash', { ns: 'paymentsTable' });
  },
  get transfer() {
    return i18n.t('paymentType.transfer', { ns: 'paymentsTable' });
  },
};

export const FILTER_KEYS = ['created_at', 'total', 'status', 'payment_type'] as const;

export type FilterColumnId = (typeof FILTER_KEYS)[number];

export type UserT = {
  tutorship: {
    student_id: number;
    created_at: string;
    active_classroom_count: number;
  };
  user: {
    username: string;
    display_name: string;
  };
};
