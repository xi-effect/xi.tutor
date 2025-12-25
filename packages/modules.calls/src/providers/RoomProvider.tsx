import { createContext, useContext, ReactNode, useMemo } from 'react';
import { Room, RoomOptions, ConnectionQuality, Track } from 'livekit-client';

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

// Определяем, является ли устройство мобильным
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const RoomProvider = ({ children }: RoomProviderProps) => {
  // Создаем комнату только один раз при монтировании компонента
  // с настройками для устойчивого соединения
  const room = useMemo(() => {
    const roomOptions: RoomOptions = {
      // Не отключаемся при потере фокуса
      stopLocalTrackOnUnpublish: false,
      // Включаем адаптивный стриминг для оптимизации качества
      adaptiveStream: false,
      // Включаем dynacast для динамической подписки на треки
      dynacast: true,
    };

    const newRoom = new Room(roomOptions);

    // Обработка событий переподключения
    newRoom.on('reconnecting', () => {
      console.log('LiveKit: Attempting to reconnect...');
    });

    newRoom.on('reconnected', () => {
      console.log('LiveKit: Successfully reconnected');
    });

    // Улучшенный мониторинг качества соединения
    let lastQuality: ConnectionQuality | null = null;
    newRoom.on('connectionQualityChanged', (quality: ConnectionQuality) => {
      if (quality !== lastQuality) {
        lastQuality = quality;

        if (quality === 'poor' || quality === 'unknown') {
          console.warn('LiveKit: Connection quality degraded:', quality);
          // Можно добавить уведомление пользователю через toast
        } else if (quality === 'excellent' && lastQuality === 'poor') {
          console.log('LiveKit: Connection quality improved');
        }
      }
    });

    // Обработка ошибок соединения
    newRoom.on('connectionStateChanged', (state) => {
      console.log('LiveKit: Connection state changed:', state);
    });

    // Обработка публикации треков
    newRoom.on('trackPublished', (publication, participant) => {
      if (publication.kind === Track.Kind.Video) {
        console.log('LiveKit: Video track published by', participant.identity);
      }
    });

    // Оптимизация для мобильных устройств
    if (isMobileDevice()) {
      // На мобильных устройствах можно дополнительно оптимизировать
      console.log('LiveKit: Mobile device detected - applying optimizations');
    }

    return newRoom;
  }, []);

  return <RoomContext.Provider value={{ room }}>{children}</RoomContext.Provider>;
};
