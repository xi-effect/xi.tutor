import { paymentTemplatesApiConfig, PaymentTemplatesQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { TemplateT } from 'common.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { handleError } from 'common.services';

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();

  const deleteTemplateMutation = useMutation({
    mutationFn: async (template_id: number) => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: paymentTemplatesApiConfig[PaymentTemplatesQueryKey.DeleteTemplate].method,
          url: paymentTemplatesApiConfig[PaymentTemplatesQueryKey.DeleteTemplate].getUrl(
            template_id,
          ),
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
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [PaymentTemplatesQueryKey.AllTemplates] });

      const previousTemplates = queryClient.getQueryData<TemplateT[]>([
        PaymentTemplatesQueryKey.AllTemplates,
      ]);

      queryClient.setQueryData<TemplateT[]>(
        [PaymentTemplatesQueryKey.AllTemplates],
        (old: TemplateT[] | undefined) => {
          if (!old) return old;
          return old.filter((template: TemplateT) => template.id !== id);
        },
      );

      return { previousTemplates };
    },
    onError: (err, _id, context) => {
      if (context?.previousTemplates) {
        queryClient.setQueryData<TemplateT[]>(
          [PaymentTemplatesQueryKey.AllTemplates],
          context.previousTemplates,
        );
      }

      // ОБРАБОТАТЬ ОШИБКИ
      // handleError(err, 'deleteTemplate');
      console.log(err);
    },
    onSuccess: (response) => {
      if (response?.data) {
        queryClient.setQueryData<TemplateT[]>(
          [PaymentTemplatesQueryKey.AllTemplates],
          response.data,
        );
      }
    },
  });

  return { ...deleteTemplateMutation };
};
