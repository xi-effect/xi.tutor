import type { RoleT } from './user';
import { UserRoleT } from 'common.api';

export type TemplateT = {
  id: number;
  name: string;
  price: number;
  created_at?: string;
  updated_at?: string;
};

export type PaymentTemplateDataT = {
  name: string;
  price: number;
};

export type UpdateTemplateDataT = {
  template_id: number;
  templateData: PaymentTemplateDataT;
};

export type PaymentStatusT = 'wf_sender_confirmation' | 'wf_receiver_confirmation' | 'complete';

export type PaymentTypeT = 'cash' | 'transfer';

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
  classroom_id: number;
} & RoleIdField<Role>;

export type StudentPaymentT = PaymentDataT<'tutor'>;

export type TutorPaymentT = PaymentDataT<'student'>;

export type RolePaymentT<Role extends RoleT> = Role extends 'tutor'
  ? TutorPaymentT
  : StudentPaymentT;

export type PaymentApprovalFunctionT = {
  onApprovePayment: (payment: RolePaymentT<UserRoleT>) => void;
};

export const mapPaymentStatus = {
  complete: 'оплачен',
  wf_receiver_confirmation: 'ожидает подтверждения',
  wf_sender_confirmation: 'ждет оплаты',
} as const;
