import { notificationsApiConfig } from './notifications';

/** @deprecated Используйте notificationsApiConfig.CreateTgConnection / DeleteDeliveryMethod */
enum TelegramConnectionQueryKey {
  CreateConnection = 'CreateTgConnection',
  RemoveConnection = 'RemoveTgConnection',
}

/** @deprecated Используйте notificationsApiConfig */
const telegramConnectionApiConfig = {
  [TelegramConnectionQueryKey.CreateConnection]: notificationsApiConfig.CreateTgConnection,
  [TelegramConnectionQueryKey.RemoveConnection]: notificationsApiConfig.DeleteDeliveryMethod,
};

export { telegramConnectionApiConfig, TelegramConnectionQueryKey };
