import { BottomBar } from '../Bottom';
import { VideoGrid } from '../VideoGrid';
import { UpBar } from '../Up';
import { Chat } from '../Chat/Chat';
import { useHandFocus } from '../../hooks/useHandFocus';
import { CallsOnboarding } from '../Onboarding/CallsOnboarding';
import { useLocalParticipant } from '@livekit/components-react';
import { LocalVideoTrack } from 'livekit-client';
import { useVideoBlur, useParticipantJoinSync, useParticipantSounds } from '../../hooks';
import { useCallStore } from '../../store/callStore';

export const ActiveRoom = () => {
  // Автоматический фокус на участниках с поднятыми руками
  useHandFocus();
  // Синхронизация состояния при подключении новых участников
  useParticipantJoinSync();
  useParticipantSounds();
  // Получаем видео трек для применения блюра
  const { cameraTrack } = useLocalParticipant();
  const videoTrack = cameraTrack?.track as LocalVideoTrack | undefined;

  // Применяем блюр только в полном режиме
  const mode = useCallStore((state) => state.mode);
  const videoTrackForBlur = mode === 'full' ? videoTrack : null;
  useVideoBlur(videoTrackForBlur);

  return (
    <div className="flex h-full min-h-0 flex-col justify-stretch">
      <CallsOnboarding />
      <UpBar />
      <div className="flex h-full min-h-0 flex-1 items-center justify-center gap-4 overflow-hidden sm:px-4">
        <div className="flex h-full min-h-0 w-full min-w-0 justify-center text-center text-gray-100">
          <VideoGrid />
        </div>
        <Chat />
      </div>
      <BottomBar />
    </div>
  );
};
