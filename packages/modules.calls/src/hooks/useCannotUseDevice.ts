import { useMemo } from 'react';
import { usePermissionsStore } from '../store/permissions';

/** Возвращает true, если устройство нельзя использовать: нет прав (denied / prompt / unavailable / ещё не выданы). */
export const useCannotUseDevice = (kind: MediaDeviceKind) => {
  const { isLoading, cameraPermission, microphonePermission } = usePermissionsStore();

  return useMemo(() => {
    if (isLoading) return true;
    // Показываем «нет прав», если разрешение не выдано (любое состояние кроме 'granted')
    const cameraBlocked = cameraPermission !== 'granted';
    const microphoneBlocked = microphonePermission !== 'granted';
    switch (kind) {
      case 'audioinput':
      case 'audiooutput':
        return microphoneBlocked;
      case 'videoinput':
        return cameraBlocked;
      default:
        return false;
    }
  }, [kind, isLoading, cameraPermission, microphonePermission]);
};
