import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useLocalParticipant,
  usePersistentUserChoices,
  useTrackToggle,
} from '@livekit/components-react';
import { Track, LocalAudioTrack, LocalVideoTrack } from 'livekit-client';
import { Account, Users } from '@xipkg/icons';
import { Button } from '@xipkg/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { cn } from '@xipkg/utils';
import { useCompactNavigation } from '../../hooks/useCompactNavigation';
import { ParticipantTile } from '../Participant';
import { DevicesBar } from '../shared';
import { DisconnectButton } from '../Bottom/DisconnectButton';
import { RaiseHandButton } from '../Bottom/RaiseHandButton';
import { CompactNavigationControls } from './CompactNavigationControls';
import { CompactMultiViewControls } from './CompactMultiViewControls';
import { TILE_GAP_PX } from './constants';

const PIP_EXPANDED_VISIBLE_COUNT = 2;
const PIP_VIDEO_HEIGHT_PX = 200;

export function PiPCompactCall() {
  const [viewMode, setViewMode] = useState<'basic' | 'expanded'>('basic');
  const [multiScrollIndex, setMultiScrollIndex] = useState(0);

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
    participants,
    currentIndex,
    totalParticipants,
    canGoNext,
    canGoPrev,
    goToNext,
    goToPrev,
  } = useCompactNavigation();

  const multiVisibleParticipants = useMemo(
    () => participants.slice(multiScrollIndex, multiScrollIndex + PIP_EXPANDED_VISIBLE_COUNT),
    [participants, multiScrollIndex],
  );
  const multiCanPrev = multiScrollIndex > 0;
  const multiCanNext = multiScrollIndex + PIP_EXPANDED_VISIBLE_COUNT < totalParticipants;

  useEffect(() => {
    if (
      multiScrollIndex + PIP_EXPANDED_VISIBLE_COUNT > totalParticipants &&
      totalParticipants > 0
    ) {
      setMultiScrollIndex(Math.max(0, totalParticipants - PIP_EXPANDED_VISIBLE_COUNT));
    }
  }, [totalParticipants, multiScrollIndex]);

  const emptyState = (
    <div className="bg-gray-40 flex h-full w-full items-center justify-center rounded-2xl text-gray-100">
      <span className="text-sm">Нет участников</span>
    </div>
  );

  const barCn = cn(
    'bg-gray-0 border-gray-20 flex items-center justify-center rounded-2xl border p-0.5',
  );

  return (
    <div className="flex h-full flex-col gap-1 p-1">
      <div className="group relative min-h-0 flex-1 overflow-hidden rounded-2xl">
        {viewMode === 'expanded' ? (
          <div
            className="relative flex h-full flex-col overflow-hidden rounded-2xl p-0.5"
            style={{ gap: TILE_GAP_PX }}
          >
            {multiVisibleParticipants.length === 0
              ? emptyState
              : multiVisibleParticipants.map((trackRef) => (
                  <div
                    key={`${trackRef.participant.identity}-${trackRef.source}`}
                    className="aspect-video w-full shrink-0 overflow-hidden rounded-xl"
                    style={{
                      minHeight: PIP_VIDEO_HEIGHT_PX / PIP_EXPANDED_VISIBLE_COUNT - TILE_GAP_PX / 2,
                    }}
                  >
                    <ParticipantTile
                      trackRef={trackRef}
                      participant={trackRef.participant}
                      className="h-full w-full [&_video]:object-cover"
                      isFocusToggleDisable
                    />
                  </div>
                ))}
            <CompactMultiViewControls
              canPrev={multiCanPrev}
              canNext={multiCanNext}
              onPrev={() => setMultiScrollIndex((i) => Math.max(0, i - 1))}
              onNext={() =>
                setMultiScrollIndex((i) =>
                  Math.min(totalParticipants - PIP_EXPANDED_VISIBLE_COUNT, i + 1),
                )
              }
            />
          </div>
        ) : currentParticipant ? (
          <>
            <ParticipantTile
              trackRef={currentParticipant}
              participant={currentParticipant.participant}
              className="h-full w-full"
              isFocusToggleDisable
            />
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
          </>
        ) : (
          emptyState
        )}
      </div>

      <div className="flex h-[36px] shrink-0 items-center gap-0.5">
        <div className={barCn}>
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

        <div className={barCn}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="none"
                onClick={() => setViewMode(viewMode === 'basic' ? 'expanded' : 'basic')}
                className="hover:bg-gray-5 h-[28px] w-[28px] rounded-xl p-0 text-gray-100"
                aria-label={viewMode === 'basic' ? 'Развёрнутый вид' : 'Один участник'}
              >
                {viewMode === 'basic' ? (
                  <Users className="h-4 w-4" />
                ) : (
                  <Account className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {viewMode === 'basic' ? 'Развёрнутый вид (несколько участников)' : 'Один участник'}
            </TooltipContent>
          </Tooltip>
        </div>

        <div className={cn(barCn, 'ml-auto')}>
          <RaiseHandButton className="h-[28px] w-[28px]" />
        </div>

        <div className={barCn}>
          <DisconnectButton className="h-[28px] w-[28px] rounded-xl" />
        </div>
      </div>
    </div>
  );
}
