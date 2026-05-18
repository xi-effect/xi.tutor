import { createLocalVideoTrack, LocalAudioTrack, LocalVideoTrack } from 'livekit-client';
import { MediaDeviceMenu } from '../../../modules.calls/src/ui/MediaDevices/MediaDeviceMenu';
import { useEffect, useMemo, useState } from 'react';
import { UserTile } from '../../../modules.calls/src/ui/UserTile/UserTile';
import { usePersistentUserChoices } from '../../../modules.calls/src/hooks/usePersistentUserChoices';
import { usePermissionsStore } from '../../../modules.calls/src/store/permissions';

interface CameraPreviewProps {
  audioTrack?: LocalAudioTrack;
  videoTrack?: LocalVideoTrack;
}

export const CameraPreview = ({ audioTrack }: CameraPreviewProps) => {
  const [videoTrack, setVideoTrack] = useState<LocalVideoTrack | undefined>();
  const {
    userChoices: { videoDeviceId },
    saveVideoInputEnabled,
    saveVideoInputDeviceId,
  } = usePersistentUserChoices();
  const cameraPermission = usePermissionsStore((s) => s.cameraPermission);

  const videoMenuKey = `videoinput-${cameraPermission}`;

  useEffect(() => {
    const initCamera = async () => {
      try {
        const track = await createLocalVideoTrack({
          deviceId: { exact: videoDeviceId },
        });
        setVideoTrack(track);
      } catch (error) {
        console.error('Failed to start camera:', error);
      }
    };

    initCamera();
  }, []);

  const handleVideoDeviceChange = useMemo(
    () => async (_kind: MediaDeviceKind, deviceId: string) => {
      try {
        saveVideoInputDeviceId(deviceId);
        if (videoTrack) {
          await videoTrack.setDeviceId({ exact: deviceId });
          // Синхронизируем состояние после смены устройства
          const isActuallyEnabled = !videoTrack.isMuted;
          saveVideoInputEnabled(isActuallyEnabled);
        }
      } catch (err) {
        console.error('Failed to switch camera device', err);
      }
    },
    [videoTrack, saveVideoInputDeviceId, saveVideoInputEnabled],
  );

  return (
    <>
      <UserTile audioTrack={audioTrack} videoTrack={videoTrack} />
      <div className="mt-8">
        <h2 className="mb-1 font-sans">Камера</h2>
        <MediaDeviceMenu
          key={videoMenuKey}
          initialSelection={videoDeviceId}
          kind="videoinput"
          onActiveDeviceChange={handleVideoDeviceChange}
          disabled={cameraPermission !== 'granted'}
        />
      </div>
    </>
  );
};
