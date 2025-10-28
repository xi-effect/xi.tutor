import { paymentTemplatesApiConfig, PaymentTemplatesQueryKey } from 'common.api';
import { useFetching } from 'common.config';

export const useTemplatesList = () => {
  const { method, getUrl } = paymentTemplatesApiConfig[PaymentTemplatesQueryKey.AllTemplates];

  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method,
      getUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    },
    queryKey: [PaymentTemplatesQueryKey.AllTemplates],
  });

  return {
    data,
    isError,
    isLoading,
    ...rest,
  };
};
