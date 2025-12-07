import { createContext, useContext, ReactNode, useMemo } from 'react';
import { Room, RoomOptions } from 'livekit-client';

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
  // с настройками для устойчивого соединения
  const room = useMemo(() => {
    const roomOptions: RoomOptions = {
      // Не отключаемся при потере фокуса
      stopLocalTrackOnUnpublish: false,
    };

    const newRoom = new Room(roomOptions);

    // Обработка событий переподключения
    newRoom.on('reconnecting', () => {
      console.log('LiveKit: Attempting to reconnect...');
    });

    newRoom.on('reconnected', () => {
      console.log('LiveKit: Successfully reconnected');
    });

    newRoom.on('connectionQualityChanged', (quality) => {
      if (quality === 'poor' || quality === 'unknown') {
        console.warn('LiveKit: Connection quality degraded:', quality);
      }
    });

    return newRoom;
  }, []);

  return <RoomContext.Provider value={{ room }}>{children}</RoomContext.Provider>;
};
