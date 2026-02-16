import * as React from 'react';
import { useCallback, useMemo } from 'react';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@xipkg/sheet';
import { Close, Conference, Microphone, SoundTwo } from '@xipkg/icons';
import { Label } from '@xipkg/label';
import { Switch } from '@xipkg/switcher';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@xipkg/select';
import {
  useLocalParticipant,
  usePersistentUserChoices,
  useTrackToggle,
} from '@livekit/components-react';
import { useMediaDeviceSelect } from '@livekit/components-react';
import { Track, LocalAudioTrack, LocalVideoTrack } from 'livekit-client';
import { supportsBackgroundProcessors } from '@livekit/track-processors';

import { useUserChoicesStore } from '../../store/userChoices';
import { usePermissionsStore, openPermissionsDialog } from '../../store/permissions';
import { Button } from '@xipkg/button';

type SettingsPropsT = {
  children: React.ReactNode;
};

const placeholders = {
  audioinput: 'Встроенный микрофон',
  audiooutput: 'Встроенные динамики',
  videoinput: 'Встроенная камера',
};

// Компонент для выбора устройства (перемонтируется по key при смене разрешения, чтобы обновить список)
const DeviceSelector = ({
  kind,
  currentDeviceId,
  onDeviceChange,
  icon,
  disabled,
}: {
  kind: 'videoinput' | 'audioinput' | 'audiooutput';
  currentDeviceId?: string;
  onDeviceChange: (deviceId: string) => void;
  icon: React.ReactNode;
  disabled?: boolean;
}) => {
  const { devices } = useMediaDeviceSelect({ kind });

  const currentDevice = devices?.find((device) => device.deviceId === currentDeviceId);
  const displayValue = currentDevice?.label || placeholders[kind];
  const hasDevices = devices && devices.length > 0 && devices[0].deviceId !== '';

  return (
    <Select
      onValueChange={onDeviceChange}
      value={currentDeviceId || undefined}
      disabled={disabled || !hasDevices}
    >
      <SelectTrigger className="w-full">
        <div className="flex items-center gap-2">
          {icon}
          <SelectValue placeholder={placeholders[kind]}>{displayValue}</SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent className="w-[352px]">
        {devices?.map((device) => (
          <SelectItem key={device.deviceId} className="h-auto" value={device.deviceId}>
            {device.label || `Устройство ${device.deviceId.slice(0, 8)}`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export const Settings = ({ children }: SettingsPropsT) => {
  const { microphoneTrack, cameraTrack, isMicrophoneEnabled, isCameraEnabled } =
    useLocalParticipant();
  const {
    userChoices: { audioDeviceId, videoDeviceId },
    saveAudioInputDeviceId,
    saveVideoInputDeviceId,
    saveAudioInputEnabled,
    saveVideoInputEnabled,
  } = usePersistentUserChoices();

  // Получаем audioOutputDeviceId и blurEnabled из store напрямую
  const audioOutputDeviceId = useUserChoicesStore((state) => state.audioOutputDeviceId);
  const blurEnabled = useUserChoicesStore((state) => state.blurEnabled);

  const saveAudioOutputDeviceId = useCallback((deviceId: string) => {
    useUserChoicesStore.setState({ audioOutputDeviceId: deviceId });
  }, []);

  const handleBlurToggle = useCallback((checked: boolean) => {
    useUserChoicesStore.setState({ blurEnabled: checked });
  }, []);

  const cameraPermission = usePermissionsStore((s) => s.cameraPermission);
  const microphonePermission = usePermissionsStore((s) => s.microphonePermission);

  const isCameraGranted = cameraPermission === 'granted';
  const isMicrophoneGranted = microphonePermission === 'granted';

  // Ключи для перемонтирования селекторов при смене разрешения (обновление списка устройств)
  const videoSelectorKey = `videoinput-${cameraPermission}`;
  const audioInputSelectorKey = `audioinput-${microphonePermission}`;
  const audioOutputSelectorKey = `audiooutput-${microphonePermission}`;

  // Мемоизируем проверку поддержки, чтобы не создавать WebGL контекст при каждом рендере
  const isBlurSupported = useMemo(() => supportsBackgroundProcessors(), []);

  // Получаем треки из публикаций и приводим к правильному типу
  const audioTrack = microphoneTrack?.track as LocalAudioTrack | undefined;
  const videoTrack = cameraTrack?.track as LocalVideoTrack | undefined;

  // Используем useTrackToggle для правильного управления треками
  const microphoneToggle = useTrackToggle({
    source: Track.Source.Microphone,
    onChange: (enabled: boolean, isUserInitiated: boolean) => {
      if (isUserInitiated) {
        saveAudioInputEnabled(enabled);
      }
    },
  });

  const cameraToggle = useTrackToggle({
    source: Track.Source.Camera,
    onChange: (enabled: boolean, isUserInitiated: boolean) => {
      if (isUserInitiated) {
        saveVideoInputEnabled(enabled);
      }
    },
  });

  // Обработчики смены устройств с применением к трекам
  const handleAudioDeviceChange = useCallback(
    async (deviceId: string) => {
      try {
        saveAudioInputDeviceId(deviceId);
        if (audioTrack) {
          await audioTrack.setDeviceId({ exact: deviceId });
          const isActuallyEnabled = !audioTrack.isMuted;
          saveAudioInputEnabled(isActuallyEnabled);
          console.log('Audio device changed to:', deviceId);
        }
      } catch (err) {
        console.error('Failed to switch microphone device', err);
      }
    },
    [audioTrack, saveAudioInputDeviceId, saveAudioInputEnabled],
  );

  const handleVideoDeviceChange = useCallback(
    async (deviceId: string) => {
      try {
        saveVideoInputDeviceId(deviceId);
        if (videoTrack) {
          await videoTrack.setDeviceId({ exact: deviceId });
          const isActuallyEnabled = !videoTrack.isMuted;
          saveVideoInputEnabled(isActuallyEnabled);
          console.log('Video device changed to:', deviceId);
        }
      } catch (err) {
        console.error('Failed to switch camera device', err);
      }
    },
    [videoTrack, saveVideoInputDeviceId, saveVideoInputEnabled],
  );

  const handleAudioOutputDeviceChange = useCallback(
    async (deviceId: string) => {
      try {
        saveAudioOutputDeviceId(deviceId);
        console.log('Audio output device changed to:', deviceId);
      } catch (err) {
        console.error('Failed to switch audio output device', err);
      }
    },
    [saveAudioOutputDeviceId],
  );

  // Обработчики включения/выключения
  const handleMicrophoneToggle = useCallback(async () => {
    microphoneToggle.toggle();
  }, [microphoneToggle]);

  const handleCameraToggle = useCallback(async () => {
    cameraToggle.toggle();
  }, [cameraToggle]);

  return (
    <Sheet>
      <SheetTrigger className="ml-2" asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="bg-gray-0 w-[400px] rounded-tl-2xl rounded-bl-2xl border-none p-4 shadow-2xl">
        <SheetHeader className="mb-6 flex h-10 flex-row items-center justify-between space-y-0">
          <SheetTitle className="text-gray-100">Настройки</SheetTitle>
          <SheetClose className="hover:bg-gray-5 mt-0 rounded-md bg-transparent p-1">
            <Close className="fill-gray-100" />
          </SheetClose>
        </SheetHeader>

        <div className="space-y-6">
          {/* Камера */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-medium text-gray-100">Камера</Label>
              <Switch
                checked={isCameraEnabled}
                onCheckedChange={handleCameraToggle}
                disabled={!isCameraGranted}
              />
            </div>
            <DeviceSelector
              key={videoSelectorKey}
              kind="videoinput"
              currentDeviceId={videoDeviceId}
              onDeviceChange={handleVideoDeviceChange}
              icon={<Conference className="h-4 w-4" />}
              disabled={!isCameraGranted}
            />
            {!isCameraGranted && (
              <Button type="button" size="s" variant="ghost" onClick={openPermissionsDialog}>
                Как разрешить камеру
              </Button>
            )}
          </div>

          {/* Микрофон */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-medium text-gray-100">Микрофон</Label>
              <Switch
                checked={isMicrophoneEnabled}
                onCheckedChange={handleMicrophoneToggle}
                disabled={!isMicrophoneGranted}
              />
            </div>
            <DeviceSelector
              key={audioInputSelectorKey}
              kind="audioinput"
              currentDeviceId={audioDeviceId}
              onDeviceChange={handleAudioDeviceChange}
              icon={<Microphone className="h-4 w-4" />}
              disabled={!isMicrophoneGranted}
            />
            {!isMicrophoneGranted && (
              <Button type="button" size="s" variant="ghost" onClick={openPermissionsDialog}>
                Как разрешить микрофон
              </Button>
            )}
          </div>

          {/* Динамики (список устройств вывода может зависеть от разрешения микрофона в части браузеров) */}
          <div className="space-y-3">
            <Label className="font-medium text-gray-100">Динамики</Label>
            <DeviceSelector
              key={audioOutputSelectorKey}
              kind="audiooutput"
              currentDeviceId={audioOutputDeviceId}
              onDeviceChange={handleAudioOutputDeviceChange}
              icon={<SoundTwo className="h-4 w-4" />}
              disabled={!isMicrophoneGranted}
            />
          </div>

          {/* Размытие фона */}
          {isBlurSupported && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-medium text-gray-100">Размытие фона</Label>
                <Switch checked={blurEnabled} onCheckedChange={handleBlurToggle} />
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
