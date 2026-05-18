import { createLocalVideoTrack, LocalVideoTrack } from 'livekit-client';
import { Camera } from '@xipkg/icons';
import { ScrollArea } from '@xipkg/scrollarea';
import { Category } from './Category';
import { useMediaQuery } from '@xipkg/utils';
import { MediaDeviceMenu } from '../../../modules.calls/src/ui/PreJoin/components/MediaDevices/MediaDeviceMenu';
import { UserTile } from '../../../modules.calls/src/ui/PreJoin/components/UserTile';
import { useEffect, useMemo, useState } from 'react';
import { usePersistentUserChoices } from '../../../modules.calls/src/hooks/usePersistentUserChoices';
import { usePermissionsStore } from '../../../modules.calls/src/store/permissions';

export const CameraSettings = () => {
  const isMobile = useMediaQuery('(max-width: 719px)');
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
  }, [videoDeviceId]);

  const handleVideoDeviceChange = useMemo(
    () => async (_kind: MediaDeviceKind, deviceId: string) => {
      try {
        saveVideoInputDeviceId(deviceId);
        if (videoTrack) {
          await videoTrack.setDeviceId({ exact: deviceId });

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
      {!isMobile && (
        <h1 className="mb-4 text-3xl font-semibold dark:text-gray-100">Настройки видео</h1>
      )}
      <ScrollArea className="h-[calc(100vh-220px)] w-full">
        <div className="flex flex-col gap-4">
          <Category icon={<Camera className="fill-brand-80 h-6 w-6" />} title="Камера">
            <UserTile videoTrack={videoTrack} disableMicroToggle />
            <div className="mt-8">
              <MediaDeviceMenu
                key={videoMenuKey}
                initialSelection={videoDeviceId}
                kind="videoinput"
                onActiveDeviceChange={handleVideoDeviceChange}
                disabled={cameraPermission !== 'granted'}
              />
            </div>
          </Category>
        </div>
      </ScrollArea>
    </>
  );
};
