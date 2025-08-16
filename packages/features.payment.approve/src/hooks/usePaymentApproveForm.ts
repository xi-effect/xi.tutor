import { useForm } from '@xipkg/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { paymentFormSchema, PaymentFormData } from '../model';
import { PaymentT } from '../types';

export const usePaymentApproveForm = () => {
  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      typePayment: 'cash',
    },
  });

  const handleClearForm = () => {
    form.reset();
  };

  const onSubmit = (data: PaymentT) => {
    return Promise.resolve(data);
  };

  return {
    form,
    handleSubmit: form.handleSubmit,
    handleClearForm,
    onSubmit,
  };
};
