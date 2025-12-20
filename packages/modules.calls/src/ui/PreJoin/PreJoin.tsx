import { ScrollArea } from '@xipkg/scrollarea';
import { Header, UserTile, MediaDevices } from './components';
import { PermissionsDialog } from '../shared/PermissionsDialog';
import { useMemo, useRef, useEffect, useCallback, useState } from 'react';
import {
  Track,
  LocalVideoTrack,
  LocalAudioTrack,
  createLocalVideoTrack,
  createLocalAudioTrack,
} from 'livekit-client';
import { usePreviewTracks } from '@livekit/components-react';
import { usePersistentUserChoices } from '../../hooks/usePersistentUserChoices';
import { useResolveInitiallyDefaultDeviceId } from '../../hooks/useResolveInitiallyDefaultDeviceId';
import { useVideoBlur } from '../../hooks';

export const PreJoin = () => {
  const {
    userChoices: { audioEnabled, videoEnabled, audioDeviceId, videoDeviceId },
    saveAudioInputDeviceId,
    saveVideoInputDeviceId,
  } = usePersistentUserChoices();

  const initialUserChoices = useRef<{
    audioEnabled: boolean;
    videoEnabled: boolean;
    audioDeviceId: string;
    videoDeviceId: string;
  } | null>(null);

  // Сохраняем начальные настройки пользователя
  if (initialUserChoices.current === null) {
    initialUserChoices.current = {
      audioEnabled,
      videoEnabled,
      audioDeviceId,
      videoDeviceId,
    };
  }

  const onError = useCallback((e: Error) => {
    console.error('PreJoin ERROR:', e);
  }, []);

  // Автоматически запрашиваем разрешения при загрузке
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        // Проверяем, есть ли уже разрешения
        const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName });
        if (permissions.state === 'prompt') {
          // Запрашиваем разрешения
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          // Останавливаем поток, нам нужны только разрешения
          stream.getTracks().forEach((track) => track.stop());
        }
      } catch (error) {
        console.log('Permission request failed:', error);
      }
    };

    requestPermissions();
  }, []);

  // Preview треки - создаются только если пользователь изначально включил их
  const tracks = usePreviewTracks(
    {
      audio: !!initialUserChoices.current &&
        initialUserChoices.current?.audioEnabled && {
          deviceId: initialUserChoices.current.audioDeviceId,
        },
      video: !!initialUserChoices.current &&
        initialUserChoices.current?.videoEnabled && {
          deviceId: initialUserChoices.current.videoDeviceId,
        },
    },
    onError,
  );

  // Динамические треки - создаются "just-in-time" когда пользователь включает их
  const [dynamicVideoTrack, setDynamicVideoTrack] = useState<LocalVideoTrack | null>(null);
  const [dynamicAudioTrack, setDynamicAudioTrack] = useState<LocalAudioTrack | null>(null);

  const previewVideoTrack = useMemo(
    () => tracks?.filter((track) => track.kind === Track.Kind.Video)[0] as LocalVideoTrack,
    [tracks],
  );

  const previewAudioTrack = useMemo(
    () => tracks?.filter((track) => track.kind === Track.Kind.Audio)[0] as LocalAudioTrack,
    [tracks],
  );

  // Создаем динамический видео трек если пользователь включил камеру после загрузки
  useEffect(() => {
    const createVideoTrack = async () => {
      try {
        const track = await createLocalVideoTrack({
          deviceId: { exact: videoDeviceId },
        });
        setDynamicVideoTrack(track);
      } catch (error) {
        onError(error as Error);
      }
    };

    if (
      videoEnabled &&
      !initialUserChoices.current?.videoEnabled &&
      !previewVideoTrack &&
      !dynamicVideoTrack
    ) {
      createVideoTrack();
    }
  }, [videoEnabled, videoDeviceId, previewVideoTrack, dynamicVideoTrack, onError]);

  // Создаем динамический аудио трек если пользователь включил микрофон после загрузки
  useEffect(() => {
    const createAudioTrack = async () => {
      try {
        const track = await createLocalAudioTrack({
          deviceId: { exact: audioDeviceId },
        });
        setDynamicAudioTrack(track);
      } catch (error) {
        onError(error as Error);
      }
    };

    if (
      audioEnabled &&
      !initialUserChoices.current?.audioEnabled &&
      !previewAudioTrack &&
      !dynamicAudioTrack
    ) {
      createAudioTrack();
    }
  }, [audioEnabled, audioDeviceId, previewAudioTrack, dynamicAudioTrack, onError]);

  // Очистка динамических треков
  useEffect(() => {
    return () => {
      dynamicVideoTrack?.stop();
    };
  }, [dynamicVideoTrack]);

  useEffect(() => {
    return () => {
      dynamicAudioTrack?.stop();
    };
  }, [dynamicAudioTrack]);

  // Финальные треки (динамические имеют приоритет над preview)
  const videoTrack = dynamicVideoTrack || previewVideoTrack;
  const audioTrack = dynamicAudioTrack || previewAudioTrack;

  // Отладочная информация
  useEffect(() => {
    console.log('PreJoin tracks debug:', {
      initialUserChoices: initialUserChoices.current,
      videoEnabled,
      audioEnabled,
      videoDeviceId,
      audioDeviceId,
      tracks: tracks?.map((t) => ({ kind: t.kind, enabled: !t.isMuted })),
      previewVideoTrack: previewVideoTrack ? { enabled: !previewVideoTrack.isMuted } : null,
      previewAudioTrack: previewAudioTrack ? { enabled: !previewAudioTrack.isMuted } : null,
      dynamicVideoTrack: dynamicVideoTrack ? { enabled: !dynamicVideoTrack.isMuted } : null,
      dynamicAudioTrack: dynamicAudioTrack ? { enabled: !dynamicAudioTrack.isMuted } : null,
      finalVideoTrack: videoTrack ? { enabled: !videoTrack.isMuted } : null,
      finalAudioTrack: audioTrack ? { enabled: !audioTrack.isMuted } : null,
    });
  }, [
    tracks,
    previewVideoTrack,
    previewAudioTrack,
    dynamicVideoTrack,
    dynamicAudioTrack,
    videoTrack,
    audioTrack,
    videoEnabled,
    audioEnabled,
    videoDeviceId,
    audioDeviceId,
  ]);

  // Разрешаем device ID для треков
  useResolveInitiallyDefaultDeviceId(audioDeviceId, audioTrack, saveAudioInputDeviceId);
  useResolveInitiallyDefaultDeviceId(videoDeviceId, videoTrack, saveVideoInputDeviceId);

  // Передаем видеотрек для использования блюра
  useVideoBlur(videoTrack);

  return (
    <>
      <ScrollArea className="h-full w-full">
        <div className="max-xs:p-4 p-4 pt-1">
          <Header />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <UserTile audioTrack={audioTrack} videoTrack={videoTrack} />
            <MediaDevices audioTrack={audioTrack} videoTrack={videoTrack} />
          </div>
        </div>
      </ScrollArea>
      <PermissionsDialog />
    </>
  );
};
