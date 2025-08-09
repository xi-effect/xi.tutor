import { paymentTemplatesApiConfig, PaymentTemplatesQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { PaymentTemplateDataT } from 'common.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { handleError } from 'common.services';

export const useAddTemplate = () => {
  const queryClient = useQueryClient();

  const addTemplateMutation = useMutation({
    mutationFn: async (templateData: PaymentTemplateDataT) => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: paymentTemplatesApiConfig[PaymentTemplatesQueryKey.AddTemplate].method,
          url: paymentTemplatesApiConfig[PaymentTemplatesQueryKey.AddTemplate].getUrl(),
          data: {
            name: templateData.name,
            price: templateData.price,
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
    // onMutate: async (templateData: TemplateDataT) => {
    //     console.log('onMutate', templateData);
    //     await queryClient.cancelQueries({ queryKey: [PaymentTemplatesQueryKey.AllTemplates] });

    //     const previousTemplates = queryClient.getQueryData<PaymentTemplateDataT[]>([
    //     PaymentTemplatesQueryKey.AllTemplates,
    //     ]);

    //     queryClient.setQueryData<PaymentTemplateDataT[]>(
    //     [PaymentTemplatesQueryKey.AllTemplates],
    //     (old: PaymentTemplateDataT[] | undefined) => {
    //         if (!old) return old;
    //         return [...old, invitation];
    //     },
    //     );

    //     return { previousTemplates };
    // },
    onError: (err) => {
      const previousTemplates = queryClient.getQueryData<PaymentTemplateDataT[]>([
        PaymentTemplatesQueryKey.AllTemplates,
      ]);
      if (previousTemplates) {
        queryClient.setQueryData<PaymentTemplateDataT[]>(
          [PaymentTemplatesQueryKey.AllTemplates],
          previousTemplates,
        );
      }

      // ОБРАБОТАТЬ ОШИБКИ
      // handleError(err, 'addInvitation');
      console.log(err);
    },
    onSuccess: (response) => {
      if (response?.data) {
        queryClient.setQueryData<PaymentTemplateDataT[]>(
          [PaymentTemplatesQueryKey.AllTemplates],
          (old: PaymentTemplateDataT[] | undefined) => {
            if (!old) return old;
            return [...old, response.data];
          },
        );
      }
    },
  });

  return { ...addTemplateMutation };
};
