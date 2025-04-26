import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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
}

/**
 * Провайдер для работы с Socket.IO
 */
export const SocketProvider = ({ children, autoConnect = true }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(socketClient.getSocket());
  const [isConnected, setIsConnected] = useState<boolean>(socketClient.isConnected());

  // Подключение к сокету
  const connect = () => {
    const socketInstance = socketClient.connect();
    setSocket(socketInstance);
  };

  // Отключение от сокета
  const disconnect = () => {
    socketClient.disconnect();
    setSocket(null);
  };

  useEffect(() => {
    // Автоматическое подключение при монтировании, если нужно
    if (autoConnect) {
      connect();
    }

    // Слушатели состояния подключения
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    // Регистрация слушателей
    const unsubscribeConnect = socketClient.on('connect', onConnect);
    const unsubscribeDisconnect = socketClient.on('disconnect', onDisconnect);

    // Отписка при размонтировании
    return () => {
      unsubscribeConnect();
      unsubscribeDisconnect();

      // Отключение при размонтировании, если было подключено
      if (socketClient.isConnected()) {
        disconnect();
      }
    };
  }, [autoConnect]);
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
