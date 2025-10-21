import { PaymentStatusT } from '../types';

export const statusColorMap: Record<PaymentStatusT, string> = {
  complete: 'text-green-100',
  wf_receiver_confirmation: 'text-brand-100',
  wf_sender_confirmation: 'text-red-100',
};
