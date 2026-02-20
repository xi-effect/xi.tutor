import { useCallback, useEffect, useRef } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { RoomEvent } from 'livekit-client';
import type { Room } from 'livekit-client';
import { useCallStore } from '../store/callStore';
import { useUpdateConferenceMetadata } from 'common.services';
import { useRoom } from '../providers/RoomProvider';

/** Один раз за сессию комнаты применяем начальные метаданные (чтобы при монтировании второго CompactCall в DragOverlay не редиректило) */
const initialMetadataAppliedForRoomRef = { current: null as Room | null };

/** Метаданные комнаты с бэкенда (обновляются через PUT .../metadata/) */
type RoomMetadataPayload = {
  active_material_id?: number;
  active_classroom_id?: string;
};

const parseRoomMetadata = (metadata: string | undefined): RoomMetadataPayload | null => {
  if (!metadata || metadata.trim() === '') return null;
  try {
    const parsed = JSON.parse(metadata) as RoomMetadataPayload;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

export const useModeSync = () => {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const { room } = useRoom();
  const updateStore = useCallStore((state) => state.updateStore);
  const { updateConferenceMetadata } = useUpdateConferenceMetadata();

  // На странице конференции callId === classroomId; на странице доски — classroomId
  const routeParams = params as { callId?: string; classroomId?: string };
  const classroomIdFromRoute = routeParams.callId ?? routeParams.classroomId;

  const applyRoomMetadata = useCallback(
    (metadata: string | undefined) => {
      const payload = parseRoomMetadata(metadata);
      if (!payload) return;

      const activeMaterialId =
        payload.active_material_id !== undefined ? payload.active_material_id : null;
      const metadataClassroomId = payload.active_classroom_id;

      const currentActiveClassroom = useCallStore.getState().activeClassroom;
      // Кабинет: из метаданных, из store или из текущего URL
      const targetClassroom = metadataClassroomId ?? currentActiveClassroom ?? classroomIdFromRoute;

      if (activeMaterialId === 0 || activeMaterialId === null) {
        // Режим "полная ВКС для всех" — сервер сбросил доску
        updateStore('localFullView', false);
        updateStore('mode', 'full');
        updateStore('activeBoardId', undefined);
        updateStore('activeClassroom', undefined);

        if (targetClassroom) {
          navigate({
            to: '/call/$callId',
            params: { callId: targetClassroom },
          });
        }
      } else {
        // Режим "компакт" на сервере — активна доска
        const boardId = String(activeMaterialId);
        updateStore('activeBoardId', boardId);
        updateStore(
          'activeClassroom',
          targetClassroom ?? metadataClassroomId ?? currentActiveClassroom,
        );

        const localFullView = useCallStore.getState().localFullView;
        if (localFullView) return; // Пользователь сам в полной ВКС («Только меня») — не меняем mode и не навигируем

        // Проверяем, не находимся ли мы уже на нужной странице доски (чтобы не редиректить при drag)
        const currentParams = params as { classroomId?: string; boardId?: string };
        const isAlreadyOnTargetBoard =
          targetClassroom &&
          currentParams.classroomId === targetClassroom &&
          currentParams.boardId === boardId;

        updateStore('mode', 'compact');
        if (targetClassroom && !isAlreadyOnTargetBoard) {
          navigate({
            to: '/classrooms/$classroomId/boards/$boardId',
            params: { classroomId: targetClassroom, boardId },
            search: { call: targetClassroom },
          });
        } else if (!targetClassroom && currentParams.boardId !== boardId) {
          navigate({
            to: '/board/$boardId',
            params: { boardId },
            search: {},
          });
        }
      }
    },
    [updateStore, navigate, classroomIdFromRoute],
  );

  const applyRoomMetadataRef = useRef(applyRoomMetadata);
  applyRoomMetadataRef.current = applyRoomMetadata;

  // Прослушка изменения метаданных комнаты. Эффект зависит только от room, чтобы при навигации
  // по платформе (смена маршрута → новый applyRoomMetadata) не перезапускаться и не редиректить обратно на доску.
  useEffect(() => {
    if (!room) return;

    const handleRoomMetadataChanged = (metadata: string | undefined) => {
      applyRoomMetadataRef.current(metadata);
    };

    room.on(RoomEvent.RoomMetadataChanged, handleRoomMetadataChanged);

    // Начальное состояние — только один раз за сессию этой комнаты (при первом подключении).
    // При монтировании второго CompactCall (напр. в DragOverlay) не вызываем apply снова.
    if (room.metadata && initialMetadataAppliedForRoomRef.current !== room) {
      initialMetadataAppliedForRoomRef.current = room;
      applyRoomMetadataRef.current(room.metadata);
    }

    return () => {
      room.off(RoomEvent.RoomMetadataChanged, handleRoomMetadataChanged);
    };
  }, [room]);

  const syncModeToOthers = useCallback(
    (mode: 'compact' | 'full', boardId?: string, classroom?: string) => {
      try {
        if (!mode || !['compact', 'full'].includes(mode)) {
          console.error('❌ Invalid mode for sync:', mode);
          return;
        }

        if (boardId && typeof boardId !== 'string') {
          console.error('❌ Invalid boardId for sync:', boardId);
          return;
        }

        const classroomId = classroom ?? useCallStore.getState().activeClassroom;
        if (!classroomId) {
          console.error('❌ classroom_id required to update conference metadata');
          return;
        }

        const active_material_id = mode === 'full' ? 0 : Number(boardId);

        if (mode === 'compact' && boardId) {
          updateStore('activeBoardId', boardId);
          updateStore('activeClassroom', classroom);
        }

        updateConferenceMetadata.mutate({
          classroom_id: classroomId,
          active_material_id,
        });
      } catch (error) {
        console.error('❌ Error syncing mode via API:', error);
      }
    },
    [updateConferenceMetadata, updateStore],
  );

  return {
    syncModeToOthers,
  };
};
