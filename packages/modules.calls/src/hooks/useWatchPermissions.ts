import { useEffect } from 'react';
import { usePermissionsStore } from '../store/permissions';
import { isSafari } from '../utils/livekit';

const POLLING_TIME = 500;

export const useWatchPermissions = () => {
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let intervalId: number | undefined;
    let isCancelled = false;

    const checkPermissions = async () => {
      try {
        if (!navigator.permissions) {
          if (!isCancelled) {
            usePermissionsStore.setState({
              cameraPermission: 'unavailable',
              microphonePermission: 'unavailable',
            });
          }
          return;
        }

        const [cameraPermission, microphonePermission] = await Promise.all([
          navigator.permissions.query({ name: 'camera' }),
          navigator.permissions.query({ name: 'microphone' }),
        ]);

        if (isCancelled) return;

        if (isSafari()) {
          if (cameraPermission.state === 'prompt' || microphonePermission.state === 'prompt') {
            intervalId = setInterval(async () => {
              if (isCancelled) return;

              const [cameraPermission, microphonePermission] = await Promise.all([
                navigator.permissions.query({ name: 'camera' }),
                navigator.permissions.query({ name: 'microphone' }),
              ]);

              if (isCancelled) return;

              usePermissionsStore.setState({
                cameraPermission: cameraPermission.state,
                microphonePermission: microphonePermission.state,
              });

              if (cameraPermission.state !== 'prompt' && microphonePermission.state !== 'prompt') {
                if (intervalId) {
                  clearInterval(intervalId);
                  intervalId = undefined;
                }
              }
            }, POLLING_TIME);
          }
        }

        usePermissionsStore.setState({
          cameraPermission: cameraPermission.state,
          microphonePermission: microphonePermission.state,
        });

        const handleCameraChange = (e: Event) => {
          const target = e.target as PermissionStatus;
          usePermissionsStore.setState({ cameraPermission: target.state });

          if (intervalId && target.state !== 'prompt' && microphonePermission.state !== 'prompt') {
            clearInterval(intervalId);
            intervalId = undefined;
          }
        };

        const handleMicrophoneChange = (e: Event) => {
          const target = e.target as PermissionStatus;
          usePermissionsStore.setState({ microphonePermission: target.state });

          if (intervalId && target.state !== 'prompt' && microphonePermission.state !== 'prompt') {
            clearInterval(intervalId);
            intervalId = undefined;
          }
        };

        cameraPermission.addEventListener('change', handleCameraChange);
        microphonePermission.addEventListener('change', handleMicrophoneChange);

        cleanup = () => {
          cameraPermission.removeEventListener('change', handleCameraChange);
          microphonePermission.removeEventListener('change', handleMicrophoneChange);
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = undefined;
          }
        };
      } catch (error) {
        if (!isCancelled) {
          console.error('Error checking permissions:', error);
        }
      } finally {
        if (!isCancelled) {
          usePermissionsStore.setState({ isLoading: false });
        }
      }
    };
    checkPermissions();

    return () => {
      isCancelled = true;
      cleanup?.();
    };
  }, []);
};
