import { env } from 'common.env';
import { HttpMethod } from './config';

enum PaymentTemplatesQueryKey {
  AllTemplates = 'AllTemplates',
  AddTemplate = 'AddTemplate',
  DeleteTemplate = 'DeleteTemplate',
  GetTemplate = 'GetTemplate',
  UpdateTemplate = 'UpdateTemplate',
}

const paymentTemplatesApiConfig = {
  [PaymentTemplatesQueryKey.AllTemplates]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/invoice-service/roles/tutor/invoice-item-templates/`,
    method: HttpMethod.GET,
  },
  [PaymentTemplatesQueryKey.AddTemplate]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/invoice-service/roles/tutor/invoice-item-templates/`,
    method: HttpMethod.POST,
  },
  [PaymentTemplatesQueryKey.DeleteTemplate]: {
    getUrl: (invoiceItemTemplateId: number) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/invoice-service/roles/tutor/invoice-item-templates/${invoiceItemTemplateId}/`,
    method: HttpMethod.DELETE,
  },
  [PaymentTemplatesQueryKey.GetTemplate]: {
    getUrl: (invoiceItemTemplateId: number) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/invoice-service/roles/tutor/invoice-item-templates/${invoiceItemTemplateId}/`,
    method: HttpMethod.GET,
  },
  [PaymentTemplatesQueryKey.UpdateTemplate]: {
    getUrl: (invoiceItemTemplateId: number) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/invoice-service/roles/tutor/invoice-item-templates/${invoiceItemTemplateId}/`,
    method: HttpMethod.PATCH,
  },
};

export { paymentTemplatesApiConfig, PaymentTemplatesQueryKey };
