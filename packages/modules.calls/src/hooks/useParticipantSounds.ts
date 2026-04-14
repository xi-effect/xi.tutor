import { useEffect, useRef } from 'react';
import { RoomEvent } from 'livekit-client';
import { useSoundEffectsStore } from 'common.ui';
import { useRoom } from '../providers/RoomProvider';
import { playSound } from '../utils/sounds';

/**
 * Воспроизводит звуки при подключении / отключении удалённых участников.
 * Первая «пачка» уже присутствующих участников при монтировании игнорируется,
 * чтобы звук не срабатывал при собственном входе в комнату.
 */
export const useParticipantSounds = () => {
  const { room } = useRoom();
  const readyRef = useRef(false);

  useEffect(() => {
    if (!room) return;

    // Пропускаем события, возникающие при начальном подключении:
    // ставим флаг ready после небольшой задержки, когда все уже-подключённые
    // участники «прилетели».
    const readyTimeout = setTimeout(() => {
      readyRef.current = true;
    }, 3000);

    const handleConnected = () => {
      if (!readyRef.current) return;
      const vol = useSoundEffectsStore.getState().userJoinVolume;
      if (vol > 0) playSound('userJoin', vol);
    };

    const handleDisconnected = () => {
      if (!readyRef.current) return;
      const vol = useSoundEffectsStore.getState().userLeftVolume;
      if (vol > 0) playSound('userLeft', vol);
    };

    room.on(RoomEvent.ParticipantConnected, handleConnected);
    room.on(RoomEvent.ParticipantDisconnected, handleDisconnected);

    return () => {
      clearTimeout(readyTimeout);
      readyRef.current = false;
      room.off(RoomEvent.ParticipantConnected, handleConnected);
      room.off(RoomEvent.ParticipantDisconnected, handleDisconnected);
    };
  }, [room]);
};
