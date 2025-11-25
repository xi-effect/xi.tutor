import { Button } from '@xipkg/button';
import { MediaDeviceMenu } from './MediaDeviceMenu';
import { usePersistentUserChoices } from '../../../../hooks/usePersistentUserChoices';
import { useMemo } from 'react';
import { LocalAudioTrack, LocalVideoTrack } from 'livekit-client';
import { useCallStore } from '../../../../store/callStore';
import { useRoom } from '../../../../providers/RoomProvider';
import { Alert, AlertIcon, AlertContainer, AlertDescription } from '@xipkg/alert';
import { InfoCircle } from '@xipkg/icons';
import { Label } from '@xipkg/label';
import { Switch } from '@xipkg/switcher';

interface MediaDevicesProps {
  audioTrack?: LocalAudioTrack;
  videoTrack?: LocalVideoTrack;
}

export const MediaDevices = ({ audioTrack, videoTrack }: MediaDevicesProps) => {
  const {
    userChoices: { audioDeviceId, audioOutputDeviceId, videoDeviceId, blurEnabled },
    saveAudioInputDeviceId,
    saveAudioOutputDeviceId,
    saveVideoInputDeviceId,
    saveAudioInputEnabled,
    saveVideoInputEnabled,
    saveBlurEnabled,
  } = usePersistentUserChoices();

  const { updateStore, token, isConnecting } = useCallStore();
  const { room } = useRoom();

  const handleJoin = async () => {
    if (!token) {
      console.error('No token available for joining the call');
      return;
    }

    // Проверяем, не подключены ли уже
    if (room.state === 'connected') {
      console.log('Already connected to room, just updating store...');
      // Если уже подключены, просто обновляем store
      updateStore('connect', true);
      updateStore('isStarted', true);
      updateStore('isConnecting', false);
      return;
    }

    if (isConnecting) {
      console.log('Already connecting to room...');
      return;
    }

    // Устанавливаем флаг подключения
    updateStore('isConnecting', true);

    try {
      // Сохраняем текущие настройки устройств в store
      updateStore('audioDeviceId', audioDeviceId);
      updateStore('audioOutputDeviceId', audioOutputDeviceId);
      updateStore('videoDeviceId', videoDeviceId);

      // Сохраняем состояние аудио и видео
      updateStore('audioEnabled', audioTrack ? !audioTrack.isMuted : false);
      updateStore('videoEnabled', videoTrack ? !videoTrack.isMuted : false);

      console.log('Preparing to join room...');

      // LiveKitRoom автоматически управляет подключением
      // Нам нужно только установить флаг подключения
      updateStore('connect', true);
      updateStore('isStarted', true);
      updateStore('isConnecting', false);

      console.log('Successfully joined room with devices:', {
        audioDeviceId,
        audioOutputDeviceId,
        videoDeviceId,
        audioEnabled: audioTrack ? !audioTrack.isMuted : false,
        videoEnabled: videoTrack ? !videoTrack.isMuted : false,
      });
    } catch (error) {
      console.error('Failed to join room:', error);

      // Сбрасываем состояние при ошибке
      updateStore('connect', false);
      updateStore('isStarted', false);
      updateStore('isConnecting', false);

      // Если это ошибка отключения клиента, не показываем пользователю
      if (error instanceof Error && error.message.includes('Client initiated disconnect')) {
        console.log('Connection was cancelled by client - this is normal during navigation');
        return;
      }

      // Для других ошибок можно показать уведомление пользователю
      console.warn('Connection failed, please try again');
    }
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
          // console.log('MediaDevices: audio device changed, syncing state', {
          //   deviceId,
          //   trackMuted: audioTrack.isMuted,
          //   shouldBeEnabled: isActuallyEnabled,
          // });
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
          // console.log('MediaDevices: video device changed, syncing state', {
          //   deviceId,
          //   trackMuted: videoTrack.isMuted,
          //   shouldBeEnabled: isActuallyEnabled,
          // });
          saveVideoInputEnabled(isActuallyEnabled);
        }
      } catch (err) {
        console.error('Failed to switch camera device', err);
      }
    },
    [videoTrack, saveVideoInputDeviceId, saveVideoInputEnabled],
  );

  return (
    <div className="flex flex-col gap-4">
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
          <div className="my-4">
            <div className="flex items-center justify-between">
              <Label className="font-medium text-gray-100">Размытие фона</Label>
              <Switch checked={blurEnabled} onCheckedChange={saveBlurEnabled} />
            </div>
          </div>
        </div>
        <Button onClick={() => handleJoin()} className="w-full" disabled={isConnecting}>
          {isConnecting ? 'Подключение...' : 'Присоединиться'}
        </Button>
      </div>
      <Alert className="h-full w-full max-w-[1720px]" variant="brand">
        <AlertIcon>
          <InfoCircle className="fill-brand-100" />
        </AlertIcon>
        <AlertContainer className="h-full">
          <AlertDescription>
            Перед началом занятия рекомендуется выбрать устройства для видео и звука. Если
            устройства не доступны, проверьте настройки браузера. Необходимое разрешение на
            использование микрофона и камеры будет запрошено автоматически.
          </AlertDescription>
        </AlertContainer>
      </Alert>
    </div>
  );
};
