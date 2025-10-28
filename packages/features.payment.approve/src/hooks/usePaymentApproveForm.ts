import { useForm } from '@xipkg/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { paymentFormSchema, PaymentFormData } from '../model';
import { usePaymentSenderConfirmation } from 'common.services';
import { usePaymentUnilateralConfirmation } from 'common.services';

export const usePaymentApproveForm = (recipientInvoiceId: number, isTutor: boolean = false) => {
  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      typePayment: 'transfer',
    },
  });

  // Инициализируем мутации
  const senderConfirmationMutation = usePaymentSenderConfirmation();
  const unilateralConfirmationMutation = usePaymentUnilateralConfirmation();

  const handleClearForm = () => {
    form.reset();
  };

  const onSubmit = async (data: PaymentFormData) => {
    console.log('recipientInvoiceId', recipientInvoiceId);
    console.log('isTutor', isTutor);
    console.log('data', data);

    try {
      if (isTutor) {
        // Для студента используем одностороннее подтверждение
        await unilateralConfirmationMutation.mutateAsync({
          invoice_id: String(recipientInvoiceId),
          paymentType: data.typePayment,
        });
      } else {
        // Для преподавателя используем подтверждение отправителя
        await senderConfirmationMutation.mutateAsync({
          invoice_id: String(recipientInvoiceId),
          paymentType: data.typePayment,
        });
      }
    } catch (error) {
      console.error('Ошибка при подтверждении платежа:', error);
      throw error;
    }
  };

  return {
    form,
    handleSubmit: form.handleSubmit,
    handleClearForm,
    onSubmit,
    isLoading: isTutor
      ? unilateralConfirmationMutation.isPending
      : senderConfirmationMutation.isPending,
  };
};
