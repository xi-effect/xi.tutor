import { useEffect } from 'react';
import { useRoom } from '@xipkg/calls-providers';
import { useCallStore } from '@xipkg/calls-store';

function isDeadLiveKitRoomError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('requested room does not exist') || message.includes('room does not exist')
  );
}

/**
 * @xipkg/calls-providers retries `room.connect` after any disconnect while
 * `connect` stays true. A 404 from LiveKit ("requested room does not exist")
 * is terminal, but the grace window treats an in-flight `connecting` attempt
 * as a recovered session — so the client loops forever and floods the console.
 */
export function LiveKitDeadRoomGuard() {
  const { room } = useRoom();

  useEffect(() => {
    const originalConnect = room.connect.bind(room);

    room.connect = (async (...args: Parameters<typeof room.connect>) => {
      try {
        return await originalConnect(...args);
      } catch (error) {
        if (isDeadLiveKitRoomError(error)) {
          useCallStore.getState().updateStore('connect', false);
        }
        throw error;
      }
    }) as typeof room.connect;

    return () => {
      room.connect = originalConnect;
    };
  }, [room]);

  return null;
}
