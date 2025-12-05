import { BottomBar } from '../Bottom';
import { VideoGrid } from '../VideoGrid';
import { UpBar } from '../Up';
import { Chat } from '../Chat/Chat';
import { useHandFocus } from '../../hooks/useHandFocus';
import { CallsOnboarding } from '../Onboarding/CallsOnboarding';
import { useLocalParticipant } from '@livekit/components-react';
import { LocalVideoTrack } from 'livekit-client';
import { useVideoBlur } from '../../hooks';
import { useCallStore } from '../../store/callStore';

export const ActiveRoom = () => {
  // Автоматический фокус на участниках с поднятыми руками
  useHandFocus();

  // Получаем видео трек для применения блюра
  const { cameraTrack } = useLocalParticipant();
  const videoTrack = cameraTrack?.track as LocalVideoTrack | undefined;

  // Применяем блюр только в полном режиме
  const mode = useCallStore((state) => state.mode);
  const videoTrackForBlur = mode === 'full' ? videoTrack : null;
  useVideoBlur(videoTrackForBlur);

  return (
    <div className="flex h-full flex-col justify-stretch">
      <CallsOnboarding />
      <UpBar />
      <div className="flex h-full items-center justify-center gap-4 overflow-hidden px-4">
        <div className="h-full w-full text-center text-gray-100">
          <VideoGrid />
        </div>
        <Chat />
      </div>
      <BottomBar />
    </div>
  );
};
