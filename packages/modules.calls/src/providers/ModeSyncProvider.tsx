import { ReactNode, useEffect } from 'react';
import { useModeSync } from '../hooks';
import { useRoom } from './RoomProvider';
import { useCallStore } from '../store/callStore';

type ModeSyncProviderProps = {
  children: ReactNode;
};

export const ModeSyncProvider = ({ children }: ModeSyncProviderProps) => {
  const { room } = useRoom();
  const connect = useCallStore((state) => state.connect);

  // Инициализируем хук для синхронизации режима
  // Это автоматически подпишет нас на сообщения о смене режима
  useModeSync();

  useEffect(() => {
    if (room && connect) {
      // console.log('🔗 ModeSyncProvider: Room is connected and ready for data channel');
    } else {
      // console.log('⏳ ModeSyncProvider: Waiting for room connection...', {
      //   hasRoom: !!room,
      //   connect,
      // });
    }
  }, [room, connect]);

  return <>{children}</>;
};
