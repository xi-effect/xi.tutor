import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { socketClient } from './socket.client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
  autoConnect?: boolean;
  isAuthenticated?: boolean;
}

/**
 * Провайдер для работы с Socket.IO
 */
export const SocketProvider = ({
  children,
  autoConnect = true,
  isAuthenticated = false,
}: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(socketClient.getSocket());
  const [isConnected, setIsConnected] = useState<boolean>(socketClient.isConnected());
  const hasConnectedRef = useRef(false); // Используем ref для отслеживания попытки подключения

  // Подключение к сокету
  const connect = () => {
    // Проверяем, не пытаемся ли мы подключиться повторно
    if (socketClient.isConnected() || hasConnectedRef.current) {
      return;
    }

    console.log('⚪ Попытка подключения к websocket...');
    hasConnectedRef.current = true;
    const socketInstance = socketClient.connect();
    setSocket(socketInstance);
  };

  // Отключение от сокета
  const disconnect = () => {
    if (!socketClient.isConnected()) {
      return;
    }

    console.log('⚪ Отключение от websocket...');
    socketClient.disconnect();
    setSocket(null);
    hasConnectedRef.current = false;
  };

  // Эффект для подключения/отключения при изменении статуса авторизации
  useEffect(() => {
    // Подключаемся только если пользователь авторизован
    if (autoConnect && isAuthenticated && !socketClient.isConnected()) {
      console.log('👤 Пользователь авторизован, подключаемся к websocket...');
      connect();
    } else if (!isAuthenticated && socketClient.isConnected()) {
      console.log('👤 Пользователь не авторизован, отключаемся от websocket...');
      disconnect();
    }
  }, [autoConnect, isAuthenticated]);

  // Отдельный эффект для обработчиков событий
  useEffect(() => {
    // Слушатели состояния подключения
    const onConnect = () => {
      console.log('🟢 Websocket подключен');
      console.log(`🆔 ID соединения: ${socketClient.getSocket()?.id}`);
      setIsConnected(true);
    };

    const onDisconnect = () => {
      console.log('🔴 Websocket отключен');
      setIsConnected(false);
      hasConnectedRef.current = false;
    };

    // Регистрация слушателей
    const unsubscribeConnect = socketClient.on('connect', onConnect);
    const unsubscribeDisconnect = socketClient.on('disconnect', onDisconnect);

    // Отписка при размонтировании
    return () => {
      unsubscribeConnect();
      unsubscribeDisconnect();
    };
  }, []);

  // Отключение при размонтировании компонента
  useEffect(() => {
    return () => {
      if (socketClient.isConnected()) {
        disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        connect,
        disconnect,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

/**
 * Хук для использования контекста сокетов
 */
export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);

  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }

  return context;
};
