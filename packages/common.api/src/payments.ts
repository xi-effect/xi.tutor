import { env } from 'common.env';
import { HttpMethod } from './config';
import { type UserRoleT } from './types';

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
    getUrl: (role: UserRoleT) => {
      return `${env.VITE_SERVER_URL_BACKEND}/api/protected/invoice-service/roles/${role}/recipient-invoices/searches/`;
    },
    method: HttpMethod.POST,
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
