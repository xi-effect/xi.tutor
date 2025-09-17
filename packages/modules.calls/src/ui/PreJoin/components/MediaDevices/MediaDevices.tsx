import { Button } from '@xipkg/button';
import { MediaDeviceMenu } from './MediaDeviceMenu';
import { usePersistentUserChoices } from '../../../../hooks/usePersistentUserChoices';
import { useMemo } from 'react';
import { LocalAudioTrack, LocalVideoTrack } from 'livekit-client';

interface MediaDevicesProps {
  audioTrack?: LocalAudioTrack;
  videoTrack?: LocalVideoTrack;
}

export const MediaDevices = ({ audioTrack, videoTrack }: MediaDevicesProps) => {
  const {
    userChoices: { audioDeviceId, audioOutputDeviceId, videoDeviceId },
    saveAudioInputDeviceId,
    saveAudioOutputDeviceId,
    saveVideoInputDeviceId,
    saveAudioInputEnabled,
    saveVideoInputEnabled,
  } = usePersistentUserChoices();

  const handleJoin = () => {
    // Здесь будет логика присоединения к комнате
    console.log('Joining room with devices:', {
      audioDeviceId,
      audioOutputDeviceId,
      videoDeviceId,
    });
  };

  // Обработчики переключения устройств с обработкой ошибок
  const handleAudioDeviceChange = useMemo(
    () => async (_kind: MediaDeviceKind, deviceId: string) => {
      try {
        saveAudioInputDeviceId(deviceId);
        if (audioTrack) {
          await audioTrack.setDeviceId({ exact: deviceId });
          // Синхронизируем состояние после смены устройства
          const isActuallyEnabled = !audioTrack.isMuted;
          console.log('MediaDevices: audio device changed, syncing state', {
            deviceId,
            trackMuted: audioTrack.isMuted,
            shouldBeEnabled: isActuallyEnabled,
          });
          saveAudioInputEnabled(isActuallyEnabled);
        }
      } catch (err) {
        console.error('Failed to switch microphone device', err);
      }
    },
    [audioTrack, saveAudioInputDeviceId, saveAudioInputEnabled],
  );

  const handleVideoDeviceChange = useMemo(
    () => async (_kind: MediaDeviceKind, deviceId: string) => {
      try {
        saveVideoInputDeviceId(deviceId);
        if (videoTrack) {
          await videoTrack.setDeviceId({ exact: deviceId });
          // Синхронизируем состояние после смены устройства
          const isActuallyEnabled = !videoTrack.isMuted;
          console.log('MediaDevices: video device changed, syncing state', {
            deviceId,
            trackMuted: videoTrack.isMuted,
            shouldBeEnabled: isActuallyEnabled,
          });
          saveVideoInputEnabled(isActuallyEnabled);
        }
      } catch (err) {
        console.error('Failed to switch camera device', err);
      }
    },
    [videoTrack, saveVideoInputDeviceId, saveVideoInputEnabled],
  );

  return (
    <div className="border-gray-30 flex flex-col justify-between rounded-[16px] border p-5">
      <div>
        <div className="mb-8">
          <h2 className="mb-1 font-sans">Камера</h2>
          <MediaDeviceMenu
            initialSelection={videoDeviceId}
            kind="videoinput"
            onActiveDeviceChange={handleVideoDeviceChange}
          />
        </div>
        <div className="my-4">
          <h2 className="mb-1 font-sans">Звук</h2>
          <div className="flex flex-col gap-2">
            <MediaDeviceMenu
              initialSelection={audioDeviceId}
              kind="audioinput"
              onActiveDeviceChange={handleAudioDeviceChange}
            />
            <MediaDeviceMenu
              initialSelection={audioOutputDeviceId}
              kind="audiooutput"
              onActiveDeviceChange={(_, id) => saveAudioOutputDeviceId(id)}
            />
          </div>
        </div>
      </div>
      <Button onClick={() => handleJoin()} className="w-full">
        Присоединиться
      </Button>
    </div>
  );
};
