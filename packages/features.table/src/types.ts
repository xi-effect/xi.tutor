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

export const mapPaymentStatus: Record<PaymentStatusT, string> = {
  complete: 'оплачен',
  wf_receiver_confirmation: 'ожидает подтверждения',
  wf_sender_confirmation: 'ждет оплаты',
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

export const mapPaymentType: Record<PaymentTypeT, string> = {
  cash: 'наличные',
  transfer: 'перевод',
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
