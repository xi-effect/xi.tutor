/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';
import { useSocket } from './socket.provider';

/**
 * Хук для подписки на события сокета
 *
 * @param event Имя события
 * @param handler Обработчик события
 * @param deps Зависимости эффекта
 */
export function useSocketEvent<T = any>(
  event: string,
  handler: (data: T) => void,
  deps: React.DependencyList = [],
): void {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on(event, handler);

    return () => {
      socket.off(event, handler);
    };
  }, [socket, event, ...deps]);
}

/**
 * Хук для отправки события через сокет
 *
 * @param event Имя события
 * @returns Функция для отправки данных
 */
export function useSocketEmit<T = any>(event: string): (data?: T) => void {
  const { socket } = useSocket();

  return (data?: T) => {
    if (socket) {
      socket.emit(event, data);
    } else {
      console.warn(`Cannot emit event ${event}: socket is not connected`);
    }
  };
}
