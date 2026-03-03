import { useCallback } from 'react';
import {
  useLocalParticipant,
  usePersistentUserChoices,
  useTrackToggle,
} from '@livekit/components-react';
import { Track, LocalAudioTrack, LocalVideoTrack } from 'livekit-client';
import { Maximize } from '@xipkg/icons';
import { useCompactNavigation } from '../../hooks/useCompactNavigation';
import { ParticipantTile } from '../Participant';
import { DevicesBar } from '../shared';
import { DisconnectButton } from '../Bottom/DisconnectButton';
import { CompactNavigationControls } from './CompactNavigationControls';

type PiPCompactCallProps = {
  onReturnToTab: () => void;
};

export function PiPCompactCall({ onReturnToTab }: PiPCompactCallProps) {
  const { saveAudioInputEnabled, saveVideoInputEnabled } = usePersistentUserChoices();
  const { isMicrophoneEnabled, isCameraEnabled, microphoneTrack, cameraTrack } =
    useLocalParticipant();

  const microphoneToggle = useTrackToggle({
    source: Track.Source.Microphone,
    onChange: (enabled: boolean, isUserInitiated: boolean) => {
      if (isUserInitiated) saveAudioInputEnabled(enabled);
    },
  });
  const cameraToggle = useTrackToggle({
    source: Track.Source.Camera,
    onChange: (enabled: boolean, isUserInitiated: boolean) => {
      if (isUserInitiated) saveVideoInputEnabled(enabled);
    },
  });

  const handleMicrophoneToggle = useCallback(() => microphoneToggle.toggle(), [microphoneToggle]);
  const handleCameraToggle = useCallback(() => cameraToggle.toggle(), [cameraToggle]);

  const {
    currentParticipant,
    currentIndex,
    totalParticipants,
    canGoNext,
    canGoPrev,
    goToNext,
    goToPrev,
  } = useCompactNavigation();

  const handleReturnToTab = useCallback(() => {
    window.opener?.focus();
    onReturnToTab();
  }, [onReturnToTab]);

  return (
    <div className="flex h-full flex-col gap-1 p-1">
      <div className="group relative min-h-0 flex-1 overflow-hidden rounded-2xl">
        {currentParticipant ? (
          <ParticipantTile
            trackRef={currentParticipant}
            participant={currentParticipant.participant}
            className="h-full w-full"
            isFocusToggleDisable
          />
        ) : (
          <div className="bg-gray-40 flex h-full w-full items-center justify-center rounded-2xl text-gray-100">
            <span className="text-sm">Нет участников</span>
          </div>
        )}

        {totalParticipants > 1 && (
          <CompactNavigationControls
            canPrev={canGoPrev}
            canNext={canGoNext}
            onPrev={goToPrev}
            onNext={goToNext}
            currentIndex={currentIndex}
            totalParticipants={totalParticipants}
          />
        )}
      </div>

      <div className="flex h-[36px] shrink-0 items-center justify-between">
        <div className="bg-gray-0 border-gray-20 flex items-center rounded-2xl border p-0.5">
          <DevicesBar
            className="h-[28px] w-[28px]"
            microTrack={microphoneTrack?.track as LocalAudioTrack}
            microEnabled={isMicrophoneEnabled}
            microTrackToggle={{
              showIcon: true,
              source: Track.Source.Microphone,
              onChange: handleMicrophoneToggle,
            }}
            videoTrack={cameraTrack?.track as unknown as LocalVideoTrack}
            videoEnabled={isCameraEnabled}
            videoTrackToggle={{
              showIcon: true,
              source: Track.Source.Camera,
              onChange: handleCameraToggle,
            }}
          />
        </div>

        <div className="bg-gray-0 border-gray-20 flex items-center gap-0.5 rounded-2xl border p-0.5">
          <button
            type="button"
            onClick={handleReturnToTab}
            className="hover:bg-gray-5 flex h-[28px] w-[28px] items-center justify-center rounded-xl transition-colors"
            aria-label="Вернуться на вкладку"
          >
            <Maximize className="h-4 w-4 fill-gray-100" />
          </button>
          <DisconnectButton className="h-[28px] w-[28px] rounded-xl" />
        </div>
      </div>
    </div>
  );
}
