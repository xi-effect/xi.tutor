import { createContext, useContext, ReactNode, useMemo } from 'react';
import { Room } from 'livekit-client';

type RoomContextType = {
  room: Room;
};

const RoomContext = createContext<RoomContextType | null>(null);

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
};

type RoomProviderProps = {
  children: ReactNode;
};

export const RoomProvider = ({ children }: RoomProviderProps) => {
  // Создаем комнату только один раз при монтировании компонента
  const room = useMemo(() => new Room(), []);

  return <RoomContext.Provider value={{ room }}>{children}</RoomContext.Provider>;
};
