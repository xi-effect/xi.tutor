import { paymentTemplatesApiConfig, PaymentTemplatesQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { UpdateTemplateDataT, TemplateT } from 'common.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError } from 'common.services';
import { AxiosResponse } from 'axios';

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();

  const updateTemplateMutation = useMutation<
    AxiosResponse,
    unknown,
    UpdateTemplateDataT,
    { previousTemplates?: TemplateT[] }
  >({
    mutationFn: async ({ template_id, templateData }: UpdateTemplateDataT) => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: paymentTemplatesApiConfig[PaymentTemplatesQueryKey.UpdateTemplate].method,
          url: paymentTemplatesApiConfig[PaymentTemplatesQueryKey.UpdateTemplate].getUrl(
            template_id,
          ),
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
    onMutate: async ({ template_id, templateData }) => {
      await queryClient.cancelQueries({ queryKey: [PaymentTemplatesQueryKey.AllTemplates] });

      const previousTemplates = queryClient.getQueryData<TemplateT[]>([
        PaymentTemplatesQueryKey.AllTemplates,
      ]);

      queryClient.setQueryData<TemplateT[]>(
        [PaymentTemplatesQueryKey.AllTemplates],
        (old: TemplateT[] | undefined) => {
          if (!old) return old;
          return old?.map((template) =>
            template.id === template_id ? { ...template, ...templateData } : template,
          );
        },
      );

      return { previousTemplates };
    },
    onError: (err, _variables, context) => {
      if (context?.previousTemplates) {
        queryClient.setQueryData<TemplateT[]>(
          [PaymentTemplatesQueryKey.AllTemplates],
          context.previousTemplates,
        );
      }
      handleError(err, 'updateInvoiceTemplate');
    },
    onSuccess: (response) => {
      if (response?.data) {
        queryClient.setQueryData<TemplateT[]>(
          [PaymentTemplatesQueryKey.AllTemplates],
          (old: TemplateT[] | undefined) => {
            if (!old) return [response.data];
            return old.map((template: TemplateT) =>
              template.id === response.data.id ? response.data : template,
            );
          },
        );
      }
    },
  });

  return { ...updateTemplateMutation };
};
