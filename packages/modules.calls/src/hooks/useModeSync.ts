import { useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCallStore } from '../store/callStore';
import { useLiveKitDataChannel, useLiveKitDataChannelListener } from './useLiveKitDataChannel';

const MODE_SYNC_MESSAGE_TYPE = 'mode_sync';

type ModeSyncPayload = {
  mode: 'compact' | 'full';
  boardId?: string;
  classroom?: string;
};

export const useModeSync = () => {
  const navigate = useNavigate();
  const updateStore = useCallStore((state) => state.updateStore);
  const { sendMessage } = useLiveKitDataChannel();

  const handleModeSyncMessage = useCallback(
    (message: { type: string; payload: unknown }) => {
      try {
        if (message.type === MODE_SYNC_MESSAGE_TYPE) {
          const payload = message.payload as ModeSyncPayload;

          // Валидируем payload
          if (!payload || typeof payload !== 'object') {
            console.error('❌ Invalid mode sync payload:', payload);
            return;
          }

          if (!payload.mode || !['compact', 'full'].includes(payload.mode)) {
            console.error('❌ Invalid mode value:', payload.mode);
            return;
          }

          // Получаем текущее состояние доски
          const currentActiveBoardId = useCallStore.getState().activeBoardId;

          // Если пользователь находится на доске (есть activeBoardId),
          // проверяем, есть ли boardId в сообщении
          // Если boardId отсутствует в сообщении о full mode - это означает,
          // что репетитор хочет переключить всех на full (завершить работу с доской)
          if (payload.mode === 'full' && currentActiveBoardId && payload.boardId) {
            // Пользователь на доске, но в сообщении есть boardId - игнорируем
            // (это сообщение от другого участника, который переключился сам)
            return;
          }

          // Обновляем режим в store
          updateStore('mode', payload.mode);

          // Сохраняем информацию о доске в store
          if (payload.mode === 'compact' && payload.boardId) {
            updateStore('activeBoardId', payload.boardId);
            updateStore('activeClassroom', payload.classroom);
          } else if (payload.mode === 'full' && !payload.boardId) {
            // Если получаем full mode без boardId - это означает завершение работы с доской для всех
            // Сохраняем activeClassroom перед очисткой для навигации
            const currentActiveClassroom = useCallStore.getState().activeClassroom;
            const classroomId = payload.classroom || currentActiveClassroom;

            // Очищаем информацию о доске
            updateStore('activeBoardId', undefined);
            updateStore('activeClassroom', undefined);

            // Переходим на страницу конференции, если есть classroomId
            if (classroomId) {
              navigate({
                to: '/call/$callId',
                params: { callId: classroomId },
              });
            }
          }
          // Если получаем full mode с boardId (не должно происходить) или compact mode без boardId,
          // не изменяем activeBoardId и activeClassroom

          // Если есть boardId, переходим на доску
          if (payload.boardId && typeof payload.boardId === 'string') {
            if (payload.classroom) {
              navigate({
                to: '/classrooms/$classroomId/boards/$boardId',
                params: { classroomId: payload.classroom, boardId: payload.boardId },
                search: { call: payload.classroom },
              });
            } else {
              navigate({
                to: '/board/$boardId',
                params: { boardId: payload.boardId },
                search: { call: payload.classroom },
              });
            }
          }
        }
      } catch (error) {
        console.error('❌ Error handling mode sync message:', error);
        // Не выбрасываем ошибку, чтобы не нарушить соединение
      }
    },
    [updateStore, navigate],
  );

  // Слушаем сообщения о синхронизации режима
  useLiveKitDataChannelListener(handleModeSyncMessage);

  const syncModeToOthers = useCallback(
    (mode: 'compact' | 'full', boardId?: string, classroom?: string) => {
      try {
        // Валидируем входные параметры
        if (!mode || !['compact', 'full'].includes(mode)) {
          console.error('❌ Invalid mode for sync:', mode);
          return;
        }

        if (boardId && typeof boardId !== 'string') {
          console.error('❌ Invalid boardId for sync:', boardId);
          return;
        }

        const payload: ModeSyncPayload = {
          mode,
          boardId,
          classroom,
        };

        // Сохраняем информацию о доске в store при отправке сообщения
        if (mode === 'compact' && boardId) {
          updateStore('activeBoardId', boardId);
          updateStore('activeClassroom', classroom);
        }
        // Не очищаем activeBoardId и activeClassroom при переключении на full mode,
        // чтобы пользователь мог вернуться на доску

        sendMessage(MODE_SYNC_MESSAGE_TYPE, payload);
      } catch (error) {
        console.error('❌ Error sending mode sync message:', error);
        // Не выбрасываем ошибку, чтобы не нарушить соединение
      }
    },
    [sendMessage, updateStore],
  );

  return {
    syncModeToOthers,
  };
};
