import { ReactNode } from 'react';
import { useModeSync } from '../hooks';

type ModeSyncProviderProps = {
  children: ReactNode;
};

export const ModeSyncProvider = ({ children }: ModeSyncProviderProps) => {
  // Инициализируем хук для синхронизации режима
  // Это автоматически подпишет нас на сообщения о смене режима
  useModeSync();

  return <>{children}</>;
};
