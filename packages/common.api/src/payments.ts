import { env } from 'common.env';
import { HttpMethod } from './config';

enum PaymentsQueryKey {
  Payments = 'Payments',
  SearchPayments = 'SearchPayments',
  AddPayment = 'AddPayment',
  DeletePayment = 'DeletePayment',
  GetPayment = 'GetPayment',
  UpdatePayment = 'UpdatePayment',
}

const paymentsApiConfig = {
  [PaymentsQueryKey.Payments]: {
    getUrl: (limit: number, lastOpenedBefore?: string) => {
      const params = new URLSearchParams({
        limit: limit.toString(),
      });

      if (lastOpenedBefore) {
        params.append('last_opened_before', lastOpenedBefore);
      }

      return `${env.VITE_SERVER_URL_BACKEND}/api/protected/invoice-service/roles/tutor/recipient-invoices/?${params.toString()}`;
    },
    method: HttpMethod.GET,
  },

  [PaymentsQueryKey.SearchPayments]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/invoice-service/roles/tutor/recipient-invoices/searches/`,
    method: HttpMethod.POST,
  },

  [PaymentsQueryKey.AddPayment]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/invoice-service/roles/tutor/invoices/`,
    method: HttpMethod.POST,
  },

  [PaymentsQueryKey.DeletePayment]: {
    getUrl: (id: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/invoice-service/roles/tutor/recipient-invoices/${id}/`,
    method: HttpMethod.DELETE,
  },

  [PaymentsQueryKey.GetPayment]: {
    getUrl: (id: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/invoice-service/roles/tutor/recipient-invoices/${id}/`,
    method: HttpMethod.GET,
  },

  [PaymentsQueryKey.UpdatePayment]: {
    getUrl: (id: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/invoice-service/roles/tutor/recipient-invoices/${id}/`,
    method: HttpMethod.PATCH,
  },
};

export { paymentsApiConfig, PaymentsQueryKey };
