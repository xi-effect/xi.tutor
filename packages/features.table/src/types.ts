import { ColumnDef } from '@tanstack/react-table';

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

export type PaymentStatusT = 'wf_sender_confirmation' | 'wf_receiver_confirmation' | 'complete';

export const mapPaymentStatus: Record<PaymentStatusT, string> = {
  complete: 'оплачен',
  wf_receiver_confirmation: 'ожидает подтверждения',
  wf_sender_confirmation: 'ждет оплаты',
};

export type RoleT = 'tutor' | 'student';

export type PaymentTypeT = 'cash' | 'transfer';

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

type RoleIdField<Role extends RoleT> = Role extends 'tutor'
  ? { student_id: number }
  : Role extends 'student'
    ? { tutor_id: number }
    : never;

export type PaymentDataT<Role extends RoleT> = {
  id: number;
  created_at: string;
  total: string;
  payment_type: PaymentTypeT;
  status: PaymentStatusT;
} & RoleIdField<Role>;

export type StudentPaymentT = PaymentDataT<'tutor'>;

export type TutorPaymentT = PaymentDataT<'student'>;

export type RolePaymentT<Role extends RoleT> = Role extends 'tutor'
  ? TutorPaymentT
  : StudentPaymentT;

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
