import { LiveKitRoom } from '@livekit/components-react';
import { serverUrl, serverUrlDev, isDevMode, devToken } from '../utils/config';
import { useCallStore } from '../store/callStore';
import { useRoom } from './RoomProvider';
import { useParams, useLocation, useNavigate, useSearch } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { Track } from 'livekit-client';

type LiveKitProviderProps = {
  children: React.ReactNode;
};

export const LiveKitProvider = ({ children }: LiveKitProviderProps) => {
  const { room } = useRoom();
  const { audioEnabled, videoEnabled, connect, token, updateStore } = useCallStore();
  const { callId } = useParams({ strict: false });

  const { isStarted } = useCallStore();
  const wasConnectedRef = useRef(false);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { call?: string };

  const handleConnect = () => {
    wasConnectedRef.current = true;
    updateStore('connect', true);

    // При подключении проверяем, соответствует ли activeClassroom текущему callId
    // Если нет - очищаем информацию о доске (возможно, подключились к другой ВКС)
    const { activeClassroom } = useCallStore.getState();

    if (activeClassroom && callId && activeClassroom !== callId) {
      // Подключились к другой ВКС - очищаем информацию о доске
      updateStore('activeBoardId', undefined);
      updateStore('activeClassroom', undefined);
    }
  };

  const handleDisconnect = () => {
    // Не очищаем состояние, если это временное отключение из-за сворачивания окна
    // Проверяем, была ли страница скрыта в момент отключения
    if (document.hidden && wasConnectedRef.current) {
      console.log('Page hidden - will attempt to reconnect when visible');
      // Не очищаем состояние, чтобы можно было переподключиться
      return;
    }

    wasConnectedRef.current = false;
    updateStore('connect', false);
    updateStore('isStarted', false);
    updateStore('mode', 'full');

    // Очищаем все состояния интерфейса при отключении
    const { clearAllRaisedHands, updateStore: updateCallStore } = useCallStore.getState();

    // Очищаем поднятые руки
    clearAllRaisedHands();

    // Очищаем чат
    updateCallStore('isChatOpen', false);
    updateCallStore('chatMessages', []);
    updateCallStore('unreadMessagesCount', 0);

    // Очищаем информацию о доске при отключении
    updateCallStore('activeBoardId', undefined);
    updateCallStore('activeClassroom', undefined);

    // Удаляем параметр call из URL при отключении
    if (search.call) {
      const searchWithoutCall = { ...search };
      delete searchWithoutCall.call;
      navigate({
        to: location.pathname,
        search: searchWithoutCall,
        replace: true,
      });
    }

    console.log('Disconnected from LiveKit room - all interface states cleared');
  };

  useEffect(() => {
    if (!token && callId && location.pathname.includes('/call/')) {
      navigate({
        to: '/classrooms/$classroomId',
        params: { classroomId: callId },
        search: { call: callId },
      });
    }
  }, [location, token, callId, navigate]);

  // Обработка событий видимости страницы для переподключения
  useEffect(() => {
    if (!isStarted || !connect) {
      return;
    }

    // Функция для восстановления подписок на видеотреки
    const restoreVideoSubscriptions = () => {
      if (room.state !== 'connected') {
        return;
      }

      console.log('Restoring video subscriptions for all participants...');
      let restoredCount = 0;

      // Проходим по всем удаленным участникам
      room.remoteParticipants.forEach((participant) => {
        // Проходим по всем видеотрекам участника
        participant.videoTrackPublications.forEach((publication) => {
          // Подписываемся только на треки камеры и демонстрации экрана
          if (
            (publication.source === Track.Source.Camera ||
              publication.source === Track.Source.ScreenShare) &&
            !publication.isSubscribed &&
            publication.isEnabled
          ) {
            try {
              // Используем setSubscribed - метод существует в runtime
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const pub = publication as any;
              if (typeof pub.setSubscribed === 'function') {
                pub.setSubscribed(true);
                restoredCount++;
                console.log(
                  `Restored subscription for ${participant.identity} - ${publication.source}`,
                );
              } else {
                console.warn(
                  `setSubscribed method not available for ${participant.identity} - ${publication.source}`,
                );
              }
            } catch (error) {
              console.error(`Failed to restore subscription for ${participant.identity}:`, error);
            }
          }
        });
      });

      if (restoredCount > 0) {
        console.log(`Successfully restored ${restoredCount} video subscription(s)`);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Страница скрыта - очищаем таймаут переподключения
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
        console.log('Page hidden - connection may be paused');
      } else {
        // Страница снова видна - проверяем соединение и переподключаемся при необходимости
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        reconnectTimeoutRef.current = window.setTimeout(() => {
          const currentIsStarted = useCallStore.getState().isStarted;

          // Если мы были подключены, но соединение разорвалось, переподключаемся
          if (currentIsStarted && room.state !== 'connected' && wasConnectedRef.current) {
            console.log('Page visible - attempting to reconnect...');
            updateStore('connect', true);
          }

          // Восстанавливаем подписки на видеотреки при возврате фокуса
          if (room.state === 'connected') {
            restoreVideoSubscriptions();
          }
        }, 1000); // Задержка для стабилизации после возврата на страницу
      }
    };

    // Обработка событий переподключения комнаты
    const handleReconnecting = () => {
      console.log('LiveKit: Room is reconnecting...');
    };

    const handleReconnected = () => {
      console.log('LiveKit: Room reconnected successfully');
      wasConnectedRef.current = true;
      updateStore('connect', true);
    };

    // Обработка ошибок соединения
    const handleConnectionStateChanged = (state: string) => {
      console.log('LiveKit: Connection state changed:', state);
    };

    // Мониторинг качества соединения
    let lastQuality: string | null = null;
    const handleConnectionQualityChanged = (quality: string) => {
      if (quality !== lastQuality) {
        lastQuality = quality;
        if (quality === 'poor' || quality === 'unknown') {
          console.warn('LiveKit: Connection quality is poor');
          // Здесь можно добавить уведомление пользователю
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    room.on('reconnecting', handleReconnecting);
    room.on('reconnected', handleReconnected);
    room.on('connectionStateChanged', handleConnectionStateChanged);
    room.on('connectionQualityChanged', handleConnectionQualityChanged);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      room.off('reconnecting', handleReconnecting);
      room.off('reconnected', handleReconnected);
      room.off('connectionStateChanged', handleConnectionStateChanged);
      room.off('connectionQualityChanged', handleConnectionQualityChanged);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [isStarted, connect, room, updateStore]);

  if (!token || !room) {
    if (isStarted) console.warn('No token available for LiveKit connection');

    return <>{children}</>;
  }

  return (
    <LiveKitRoom
      room={room}
      token={isDevMode ? devToken : token}
      serverUrl={isDevMode ? serverUrlDev : serverUrl}
      connect={connect}
      onConnected={handleConnect}
      onDisconnected={handleDisconnect}
      audio={audioEnabled || false}
      video={videoEnabled || false}
    >
      {children}
    </LiveKitRoom>
  );
};
