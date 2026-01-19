import { useEffect, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { RoomEvent, RemoteParticipant } from 'livekit-client';
import { useRoom } from '../providers/RoomProvider';
import { useCallStore } from '../store/callStore';
import { useLiveKitDataChannel, useLiveKitDataChannelListener } from './useLiveKitDataChannel';
import { useCurrentUser } from 'common.services';

const STATE_REQUEST_MESSAGE_TYPE = 'state_request';
const STATE_RESPONSE_MESSAGE_TYPE = 'state_response';

type StateRequestPayload = {
  participantId: string;
};

type StateResponsePayload = {
  mode: 'compact' | 'full';
  boardId?: string;
  classroom?: string;
};

/**
 * Хук для синхронизации состояния при подключении новых участников
 * - Репетитор отправляет текущее состояние новым участникам, если он в compact mode на доске
 * - Новые участники могут запросить текущее состояние у репетитора
 */
export const useParticipantJoinSync = () => {
  const { room } = useRoom();
  const navigate = useNavigate();
  const { sendMessageToParticipant } = useLiveKitDataChannel();
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const mode = useCallStore((state) => state.mode);
  const activeBoardId = useCallStore((state) => state.activeBoardId);
  const activeClassroom = useCallStore((state) => state.activeClassroom);
  const updateStore = useCallStore((state) => state.updateStore);

  // Обработка запроса состояния от нового участника
  const handleStateRequest = useCallback(
    (message: { type: string; payload: unknown }) => {
      try {
        if (message.type === STATE_REQUEST_MESSAGE_TYPE && isTutor) {
          const payload = message.payload as StateRequestPayload;

          // Валидируем payload
          if (!payload || typeof payload !== 'object' || !payload.participantId) {
            console.error('❌ Invalid state request payload:', payload);
            return;
          }

          // Если репетитор в compact mode на доске, отправляем состояние новому участнику
          if (mode === 'compact' && activeBoardId) {
            const responsePayload: StateResponsePayload = {
              mode: 'compact',
              boardId: activeBoardId,
              classroom: activeClassroom,
            };

            sendMessageToParticipant(
              payload.participantId,
              STATE_RESPONSE_MESSAGE_TYPE,
              responsePayload,
            );
          }
        }
      } catch (error) {
        console.error('❌ Error handling state request:', error);
      }
    },
    [isTutor, mode, activeBoardId, activeClassroom, sendMessageToParticipant],
  );

  // Обработка ответа на запрос состояния (для новых участников)
  const handleStateResponse = useCallback(
    (message: { type: string; payload: unknown }) => {
      try {
        if (message.type === STATE_RESPONSE_MESSAGE_TYPE && !isTutor) {
          const payload = message.payload as StateResponsePayload;

          // Валидируем payload
          if (!payload || typeof payload !== 'object') {
            console.error('❌ Student: Invalid state response payload:', payload);
            return;
          }

          if (!payload.mode || !['compact', 'full'].includes(payload.mode)) {
            console.error('❌ Student: Invalid mode value in state response:', payload.mode);
            return;
          }

          // Получаем текущий режим и состояние доски
          const currentMode = useCallStore.getState().mode;
          const currentActiveBoardId = useCallStore.getState().activeBoardId;
          const isOnBoardPage = window.location.pathname.includes('/board');

          // Если студент уже в full mode и НЕ на доске, проверяем, был ли он на доске ранее
          // Если был activeBoardId (студент был на доске и переключился на full),
          // то НЕ переключаем его обратно на доску
          // Если НЕТ activeBoardId (студент только что подключился), то переключаемся на доску
          const wasOnBoard = currentActiveBoardId !== undefined;

          if (currentMode === 'full' && !isOnBoardPage && wasOnBoard) {
            // Студент сам переключился на full mode с доски - игнорируем ответ о compact mode
            return;
          }

          // Если репетитор в compact mode на доске, переключаемся на эту доску
          if (payload.mode === 'compact' && payload.boardId) {
            // Обновляем режим в store
            updateStore('mode', 'compact');
            updateStore('activeBoardId', payload.boardId);
            updateStore('activeClassroom', payload.classroom);

            // Переходим на доску с обязательным параметром call для сохранения ВКС
            const classroomId = payload.classroom || activeClassroom;

            if (payload.classroom) {
              navigate({
                to: '/classrooms/$classroomId/boards/$boardId',
                params: { classroomId: payload.classroom, boardId: payload.boardId },
                search: { call: payload.classroom },
                replace: false,
              });
            } else if (payload.boardId && classroomId) {
              navigate({
                to: '/board/$boardId',
                params: { boardId: payload.boardId },
                search: { call: classroomId },
                replace: false,
              });
            } else if (payload.boardId) {
              navigate({
                to: '/board/$boardId',
                params: { boardId: payload.boardId },
                replace: false,
              });
            }
          }
        }
      } catch (error) {
        console.error('❌ Student: Error handling state response:', error);
      }
    },
    [isTutor, updateStore, navigate, activeClassroom],
  );

  // Объединенный обработчик для всех сообщений состояния
  const handleDataMessage = useCallback(
    (message: { type: string; payload: unknown }) => {
      if (message.type === STATE_REQUEST_MESSAGE_TYPE) {
        handleStateRequest(message);
      } else if (message.type === STATE_RESPONSE_MESSAGE_TYPE) {
        handleStateResponse(message);
      }
    },
    [handleStateRequest, handleStateResponse],
  );

  // Слушаем сообщения о запросе и ответе состояния
  useLiveKitDataChannelListener(handleDataMessage);

  // Отслеживание подключения новых участников (для репетитора)
  useEffect(() => {
    if (!room || !isTutor) {
      return;
    }

    const handleParticipantConnected = (participant: RemoteParticipant) => {
      // Пропускаем локального участника
      if (participant.identity === room.localParticipant?.identity) {
        return;
      }

      // Если репетитор в compact mode на доске, отправляем состояние новому участнику
      if (mode === 'compact' && activeBoardId) {
        // Небольшая задержка, чтобы убедиться, что участник полностью подключен
        setTimeout(() => {
          const responsePayload: StateResponsePayload = {
            mode: 'compact',
            boardId: activeBoardId,
            classroom: activeClassroom,
          };

          sendMessageToParticipant(
            participant.identity,
            STATE_RESPONSE_MESSAGE_TYPE,
            responsePayload,
          );
        }, 1500);
      }
    };

    room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);

    // Функция для отправки состояния всем подключенным участникам
    const sendStateToAllParticipants = () => {
      if (room.state !== 'connected' || mode !== 'compact' || !activeBoardId) {
        return;
      }

      const existingParticipants = Array.from(room.remoteParticipants.values());

      existingParticipants.forEach((participant) => {
        if (participant.identity !== room.localParticipant?.identity) {
          const responsePayload: StateResponsePayload = {
            mode: 'compact',
            boardId: activeBoardId,
            classroom: activeClassroom,
          };

          sendMessageToParticipant(
            participant.identity,
            STATE_RESPONSE_MESSAGE_TYPE,
            responsePayload,
          );
        }
      });
    };

    // Проверяем уже подключенных участников при монтировании хука
    if (room.state === 'connected') {
      const existingParticipants = Array.from(room.remoteParticipants.values());
      existingParticipants.forEach((participant) => {
        if (participant.identity !== room.localParticipant?.identity) {
          handleParticipantConnected(participant);
        }
      });
    }

    // Также отправляем состояние при изменении mode или activeBoardId
    // (на случай, если репетитор переключился на доску после подключения студентов)
    if (room.state === 'connected' && mode === 'compact' && activeBoardId) {
      // Небольшая задержка для стабильности
      const timeoutId = setTimeout(() => {
        sendStateToAllParticipants();
      }, 500);

      return () => {
        room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
        clearTimeout(timeoutId);
      };
    }

    return () => {
      room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
    };
  }, [room, isTutor, mode, activeBoardId, activeClassroom, sendMessageToParticipant]);

  // Запрос состояния при подключении (для новых участников, не репетиторов)
  useEffect(() => {
    if (!room || isTutor) return;

    const requestState = () => {
      if (room.state !== 'connected') {
        return;
      }

      // Всегда запрашиваем состояние при подключении
      // Защита от автоматического переключения обратно на доску реализована в handleStateResponse
      const localParticipant = room.localParticipant;
      if (!localParticipant) {
        return;
      }

      // Находим репетитора среди участников
      const participants = Array.from(room.remoteParticipants.values());

      if (participants.length === 0) {
        return;
      }

      const tutor = participants.find((p) => {
        try {
          if (!p.metadata || p.metadata.trim() === '') {
            return false;
          }
          const metadata = JSON.parse(p.metadata);
          return metadata?.default_layout === 'tutor';
        } catch {
          return false;
        }
      });

      // Если репетитор не найден по метаданным, отправляем запрос всем участникам
      if (!tutor && participants.length > 0) {
        const requestPayload: StateRequestPayload = {
          participantId: localParticipant.identity,
        };

        participants.forEach((participant) => {
          sendMessageToParticipant(
            participant.identity,
            STATE_REQUEST_MESSAGE_TYPE,
            requestPayload,
          );
        });
        return;
      }

      if (tutor) {
        const requestPayload: StateRequestPayload = {
          participantId: localParticipant.identity,
        };

        sendMessageToParticipant(tutor.identity, STATE_REQUEST_MESSAGE_TYPE, requestPayload);
      }
    };

    // Если комната уже подключена, запрашиваем сразу
    if (room.state === 'connected') {
      const timeoutId = setTimeout(() => {
        requestState();
      }, 2000); // Задержка 2 секунды после подключения

      return () => {
        clearTimeout(timeoutId);
      };
    }

    // Подписываемся на событие изменения состояния подключения
    const handleConnectionStateChanged = (state: string) => {
      if (state === 'connected') {
        setTimeout(() => {
          requestState();
        }, 2000);
      }
    };

    room.on(RoomEvent.ConnectionStateChanged, handleConnectionStateChanged);

    return () => {
      room.off(RoomEvent.ConnectionStateChanged, handleConnectionStateChanged);
    };
  }, [room, isTutor, sendMessageToParticipant, mode]);
};
