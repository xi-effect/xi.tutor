import { createContext, useContext, ReactNode } from 'react';
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
  const room = new Room();
  return <RoomContext.Provider value={{ room }}>{children}</RoomContext.Provider>;
};
