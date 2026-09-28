import { useEffect } from 'react';
import { useConnectionState } from '@livekit/components-react';
import { isElectronShell, setDisplaySleepBlocked } from 'common.platform';

export function ElectronCallKeepAwake() {
  const connectionState = useConnectionState();

  useEffect(() => {
    if (!isElectronShell()) return;

    const keepAwake =
      connectionState === 'connecting' ||
      connectionState === 'connected' ||
      connectionState === 'reconnecting';

    void setDisplaySleepBlocked(keepAwake);
    return () => {
      void setDisplaySleepBlocked(false);
    };
  }, [connectionState]);

  return null;
}
