import { env } from 'common.env';
import { HttpMethod } from './config';

enum PaymentsQueryKey {
  StudentPayments = 'StudentPayments',
  TutorPayments = 'TutorPayments',
  SearchPayments = 'SearchPayments',
  AddPayment = 'AddPayment',
  DeleteRecipientInvoice = 'DeleteRecipientInvoice',
  GetPayment = 'GetPayment',
  UpdatePayment = 'UpdatePayment',
  PaymentUnilateralConfirmation = 'PaymentUnilateralConfirmation',
  PaymentReceiverConfirmation = 'PaymentReceiverConfirmation',
  PaymentSenderConfirmation = 'PaymentSenderConfirmation',
}

const paymentsApiConfig = {
  [PaymentsQueryKey.StudentPayments]: {
    getUrl: () => {
      return `${env.VITE_SERVER_URL_BACKEND}/api/protected/invoice-service/roles/student/recipient-invoices/searches/`;
    },
    method: HttpMethod.POST,
  },

  [PaymentsQueryKey.TutorPayments]: {
    getUrl: () => {
      return `${env.VITE_SERVER_URL_BACKEND}/api/protected/invoice-service/roles/tutor/recipient-invoices/searches/`;
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

  [PaymentsQueryKey.DeleteRecipientInvoice]: {
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
  [PaymentsQueryKey.PaymentUnilateralConfirmation]: {
    getUrl: (recipient_invoice_id: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/invoice-service/roles/tutor/${recipient_invoice_id}/payment-confirmations/unilateral/`,
    method: HttpMethod.POST,
  },
  [PaymentsQueryKey.PaymentReceiverConfirmation]: {
    getUrl: (recipient_invoice_id: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/invoice-service/roles/tutor/${recipient_invoice_id}/payment-confirmations/receiver/`,
    method: HttpMethod.POST,
  },
  [PaymentsQueryKey.PaymentSenderConfirmation]: {
    getUrl: (recipient_invoice_id: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/invoice-service/roles/student/${recipient_invoice_id}/payment-confirmations/sender/`,
    method: HttpMethod.POST,
  },
};

export { paymentsApiConfig, PaymentsQueryKey };
