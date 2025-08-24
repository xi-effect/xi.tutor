import { z } from 'zod';

export const paymentFormSchema = z.object({
  typePayment: z.enum(['cash', 'transfer'], {
    required_error: 'Выберите тип оплаты',
  }),
});

export type PaymentFormData = z.infer<typeof paymentFormSchema>;
