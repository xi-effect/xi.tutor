import { useForm } from '@xipkg/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { paymentFormSchema, PaymentFormData } from '../model';

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

  const onSubmit = (typePayment: PaymentFormData) => {
    return Promise.resolve(typePayment);
  };

  return {
    form,
    handleSubmit: form.handleSubmit,
    handleClearForm,
    onSubmit,
  };
};
