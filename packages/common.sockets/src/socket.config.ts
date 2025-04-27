import { env } from 'common.env';

/**
 * Настройки подключения к веб-сокетам
 */
export const SOCKET_ENDPOINT = env.VITE_SERVER_URL_BACKEND;

export const SOCKET_OPTIONS = {
  reconnectionAttempts: 100,
  reconnectionDelay: 2000,
  autoConnect: false,
  transports: ['websocket'],
  withCredentials: true,
};
