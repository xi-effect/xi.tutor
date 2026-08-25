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
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    console.log(`🎧 Подписка на событие ${event}:`, { isConnected, socketId: socket?.id });

    if (!socket) {
      return;
    }

    socket.on(event, handler);
    console.log(`✅ Подписка на событие ${event} установлена`);

    return () => {
      socket.off(event, handler);
      console.log(`🔌 Отписка от события ${event}`);
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
  const { socket, isConnected } = useSocket();

  return (data?: T) => {
    console.log(`📡 Попытка отправить событие ${event}:`, {
      data,
      isConnected,
      socketId: socket?.id,
    });

    if (socket && isConnected) {
      socket.emit(event, data);
      console.log(`✅ Событие ${event} отправлено успешно`);
    } else {
      console.warn(`❌ Не удалось отправить событие ${event}: сокет не подключен`, {
        hasSocket: !!socket,
        isConnected,
      });
    }
  };
}
