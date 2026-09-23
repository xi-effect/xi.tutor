import { useEffect } from 'react';
import { usePermissionsStore } from '@xipkg/calls-store';
import { isElectronShell } from 'common.platform';

/**
 * CompactView watches permissions only while PermissionsDialog is mounted
 * (it is), but Chromium in Electron often reports `prompt`/`denied` until
 * we hydrate from the native shim. Keep the calls-ui store in sync so
 * DeviceSelector / TrackToggle are not stuck disabled.
 */
export function ElectronPermissionsHydrate() {
  useEffect(() => {
    if (!isElectronShell()) return;

    let cancelled = false;

    const apply = async () => {
      try {
        const [camera, microphone] = await Promise.all([
          navigator.permissions.query({ name: 'camera' as PermissionName }),
          navigator.permissions.query({ name: 'microphone' as PermissionName }),
        ]);
        if (cancelled) return;
        usePermissionsStore.setState({
          cameraPermission: camera.state,
          microphonePermission: microphone.state,
          isLoading: false,
        });
      } catch {
        if (!cancelled) {
          usePermissionsStore.setState({ isLoading: false });
        }
      }
    };

    void apply();
    const persistApi = usePermissionsStore.persist;
    const unsub = persistApi.onFinishHydration(() => {
      void apply();
    });

    return () => {
      cancelled = true;
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  return null;
}
