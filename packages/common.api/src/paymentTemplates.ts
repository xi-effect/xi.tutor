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
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/invoice-service/invoice-item-templates/`,
    method: HttpMethod.GET,
  },
  [PaymentTemplatesQueryKey.AddTemplate]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/invoice-service/invoice-item-templates/`,
    method: HttpMethod.POST,
  },
  [PaymentTemplatesQueryKey.DeleteTemplate]: {
    getUrl: (invoice_item_template_id: number) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/invoice-service/invoice-item-templates/${invoice_item_template_id}/`,
    method: HttpMethod.DELETE,
  },
  [PaymentTemplatesQueryKey.GetTemplate]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/invoice-service/invoice-item-templates/{invoice_item_template_id}/`,
    method: HttpMethod.GET,
  },
  [PaymentTemplatesQueryKey.UpdateTemplate]: {
    getUrl: (invoice_item_template_id: number) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/invoice-service/invoice-item-templates/${invoice_item_template_id}/`,
    method: HttpMethod.PATCH,
  },
};

export { paymentTemplatesApiConfig, PaymentTemplatesQueryKey };
