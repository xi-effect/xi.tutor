import { useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { RemoteParticipant } from 'livekit-client';
import { useCallStore } from '../store/callStore';
import { useLiveKitDataChannel, useLiveKitDataChannelListener } from './useLiveKitDataChannel';

const MODE_SYNC_MESSAGE_TYPE = 'mode_sync';

type ModeSyncPayload = {
  mode: 'compact' | 'full';
  boardId?: string;
};

export const useModeSync = () => {
  const navigate = useNavigate();
  const updateStore = useCallStore((state) => state.updateStore);
  const { sendMessage } = useLiveKitDataChannel();

  const handleModeSyncMessage = useCallback(
    (message: { type: string; payload: unknown }, participant?: RemoteParticipant) => {
      if (message.type === MODE_SYNC_MESSAGE_TYPE) {
        const payload = message.payload as ModeSyncPayload;

        console.log(
          '🔄 Received mode sync message:',
          payload,
          'from participant:',
          participant?.identity,
        );

        // Обновляем режим в store
        updateStore('mode', payload.mode);
        console.log('✅ Mode updated in store to:', payload.mode);

        // Если есть boardId, переходим на доску
        if (payload.boardId) {
          console.log('🎯 Navigating to board:', payload.boardId);
          navigate({ to: '/board/$boardId', params: { boardId: payload.boardId } });
        }
      }
    },
    [updateStore, navigate],
  );

  // Слушаем сообщения о синхронизации режима
  useLiveKitDataChannelListener(handleModeSyncMessage);

  const syncModeToOthers = useCallback(
    (mode: 'compact' | 'full', boardId?: string) => {
      const payload: ModeSyncPayload = {
        mode,
        boardId,
      };

      console.log('📤 Sending mode sync message to all participants:', payload);
      sendMessage(MODE_SYNC_MESSAGE_TYPE, payload);
    },
    [sendMessage],
  );

  return {
    syncModeToOthers,
  };
};
