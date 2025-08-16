import { env } from 'common.env';
import { HttpMethod } from './config';

enum TelegramConnectionQueryKey {
  CreateConnection = 'CreateTgConnection',
  RemoveConnection = 'RemoveTgConnection',
}

const telegramConnectionApiConfig = {
  [TelegramConnectionQueryKey.CreateConnection]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/notification-service/users/current/telegram-connection-requests/`,
    method: HttpMethod.POST,
  },
  [TelegramConnectionQueryKey.RemoveConnection]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/notification-service/users/current/telegram-connection/`,
    method: HttpMethod.DELETE,
  },
};

export { telegramConnectionApiConfig, TelegramConnectionQueryKey };
