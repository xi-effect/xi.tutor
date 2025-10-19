import { useCallback } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { DevicesBar } from '../shared';
import { useLocalParticipant, usePersistentUserChoices } from '@livekit/components-react';
import { LocalAudioTrack, LocalVideoTrack, Track } from 'livekit-client';
import { ScreenShareButton } from '../Bottom/ScreenShareButton';
import { DisconnectButton } from '../Bottom/DisconnectButton';
import { useCompactNavigation } from '../../hooks/useCompactNavigation';
import { isTrackReference } from '@livekit/components-core';
import { Maximize } from '@xipkg/icons';
import { Button } from '@xipkg/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useCallStore } from '../../store/callStore';
import { CompactNavigationControls } from './CompactNavigationControls';
import { ParticipantTile } from '../Participant';

export const CompactCall = ({ saveUserChoices = true }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: 'draggable-call',
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    cursor: 'move',
  };

  const { saveAudioInputEnabled, saveVideoInputEnabled } = usePersistentUserChoices({
    preventSave: !saveUserChoices,
  });

  const microphoneOnChange = useCallback(
    (enabled: boolean, isUserInitiated: boolean) =>
      isUserInitiated ? saveAudioInputEnabled(enabled) : null,
    [saveAudioInputEnabled],
  );

  const cameraOnChange = useCallback(
    (enabled: boolean, isUserInitiated: boolean) =>
      isUserInitiated ? saveVideoInputEnabled(enabled) : null,
    [saveVideoInputEnabled],
  );

  const { isMicrophoneEnabled, isCameraEnabled, microphoneTrack, cameraTrack } =
    useLocalParticipant();

  // Навигация по участникам (только если есть комната)
  const navigation = useCompactNavigation();
  const {
    currentParticipant,
    currentIndex,
    totalParticipants,
    canGoNext,
    canGoPrev,
    goToNext,
    goToPrev,
  } = navigation;

  const search = useSearch({ from: '/(app)/_layout/classrooms/$classroomId' }) as { call?: string };
  const { call } = search;

  const navigate = useNavigate();
  const updateStore = useCallStore((state) => state.updateStore);

  const handleMaximize = () => {
    navigate({ to: '/call/$callId', params: { callId: call ?? '' } });
    updateStore('mode', 'full');
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex w-[320px] flex-col"
    >
      {/* Видео текущего участника */}
      <div className="bg-gray-0 border-gray-20 relative mb-2 flex max-h-[180px] max-w-[320px] items-center justify-center overflow-hidden rounded-2xl border-1 shadow-lg">
        {currentParticipant && isTrackReference(currentParticipant) ? (
          <ParticipantTile
            trackRef={currentParticipant}
            participant={currentParticipant.participant}
            className="h-full w-full"
            isFocusToggleDisable={true}
          />
        ) : (
          <div className="bg-gray-40 flex h-full w-full items-center justify-center text-gray-100">
            <span className="text-sm">Нет участников</span>
          </div>
        )}

        {/* Элементы управления навигацией - только если есть участники */}
        {totalParticipants > 0 && (
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
      <div className="flex h-[40px] flex-row">
        <div className="bg-gray-0 border-gray-20 flex items-center justify-center rounded-2xl border p-1 shadow-lg">
          <DevicesBar
            className="h-[32px] w-[32px]"
            microTrack={microphoneTrack?.track as LocalAudioTrack}
            microEnabled={isMicrophoneEnabled}
            microTrackToggle={{
              showIcon: true,
              source: Track.Source.Microphone,
              onChange: microphoneOnChange,
            }}
            videoTrack={cameraTrack?.track as unknown as LocalVideoTrack}
            videoEnabled={isCameraEnabled}
            videoTrackToggle={{
              showIcon: true,
              source: Track.Source.Camera,
              onChange: cameraOnChange,
            }}
          />
        </div>
        <div className="bg-gray-0 border-gray-20 ml-auto flex items-center justify-center rounded-2xl border p-1 shadow-lg">
          <ScreenShareButton className="h-[32px] w-[32px]" />
          {/* <ChatButton /> */}
          {/* <RaiseHandButton /> */}
        </div>
        <div className="bg-gray-0 border-gray-20 ml-1 flex items-center justify-center rounded-2xl border p-1 shadow-lg">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleMaximize}
                className="hover:bg-gray-5 relative m-0 h-8 w-8 rounded-xl p-0 text-gray-100"
              >
                <Maximize className="fill-gray-100" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Вернуться в конференцию</TooltipContent>
          </Tooltip>
          <DisconnectButton className="h-[32px] w-[32px] rounded-xl" />
        </div>
      </div>
    </div>
  );
};
