import { ColumnDef } from '@tanstack/react-table';

export type StudentT = {
  id: number;
  name: string;
  description?: string | '';
  avatarUrl?: string;
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

export type PaymentStatusT = 'paid' | 'processing' | 'unpaid';

export const mapPaymentStatus: Record<PaymentStatusT, string> = {
  paid: 'оплачен',
  processing: 'ожидает подтверждения',
  unpaid: 'ждет оплаты',
};

export type PaymentTypeT = 'cash' | 'card';

export const mapPaymentType: Record<PaymentTypeT, string> = {
  cash: 'наличные',
  card: 'перевод',
};

export type PaymentT = {
  id: number;
  idStudent: number;
  idSubject: number;
  datePayment: string;
  amountPayment: number;
  typePayment: PaymentTypeT;
  statusPayment: PaymentStatusT;
};

export const FILTER_KEYS = [
  'datePayment',
  'amountPayment',
  'idStudent',
  'idSubject',
  'statusPayment',
  'typePayment',
] as const;

export type FilterColumnId = (typeof FILTER_KEYS)[number];
