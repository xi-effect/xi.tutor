import { paymentTemplatesApiConfig, PaymentTemplatesQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { PaymentTemplateDataT } from 'common.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError } from 'common.services';

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();

  const deleteTemplateMutation = useMutation({
    mutationFn: async (template_id: PaymentTemplateDataT['id']) => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: paymentTemplatesApiConfig[PaymentTemplatesQueryKey.DeleteTemplate].method,
          url: paymentTemplatesApiConfig[PaymentTemplatesQueryKey.DeleteTemplate].getUrl(template_id),
          data: {
            template_id,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        });
        return response;
      } catch (err) {
        console.error('Ошибка:', err);
        throw err;
      }
    },
    onMutate: async (invitation_id) => {
      await queryClient.cancelQueries({ queryKey: [PaymentTemplatesQueryKey.AllTemplates] });

      const previousTemplates = queryClient.getQueryData<PaymentTemplateDataT[]>([
        PaymentTemplatesQueryKey.AllTemplates,
      ]);

      queryClient.setQueryData<PaymentTemplateDataT[]>(
        [PaymentTemplatesQueryKey.AllTemplates],
        (old: PaymentTemplateDataT[] | undefined) => {
          if (!old) return old;
          return old.filter((invitation: PaymentTemplateDataT) => invitation.id !== invitation_id);
        },
      );

      return { previousTemplates };
    },
    onError: (err, _invitation_id, context) => {
      if (context?.previousTemplates) {
        queryClient.setQueryData<PaymentTemplateDataT[]>(
          [PaymentTemplatesQueryKey.AllTemplates],
          context.previousTemplates,
        );
      }

      handleError(err, 'deleteInvitation');
    },
    onSuccess: (response) => {
      if (response?.data) {
        queryClient.setQueryData<PaymentTemplateDataT[]>(
          [PaymentTemplatesQueryKey.AllTemplates],
          response.data,
        );
      }
    },
  });

  return { ...deleteTemplateMutation };
};