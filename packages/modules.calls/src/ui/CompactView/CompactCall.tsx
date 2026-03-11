import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  useLocalParticipant,
  usePersistentUserChoices,
  useTrackToggle,
} from '@livekit/components-react';
import { LocalAudioTrack, LocalVideoTrack, Track } from 'livekit-client';
import { useNavigate, useParams, useRouter, useSearch } from '@tanstack/react-router';
import { useCallStore } from '../../store/callStore';
import { useCompactNavigation } from '../../hooks/useCompactNavigation';
import { useCompactAvailableHeight, useVideoBlur, useModeSync } from '../../hooks';
import { useRoom } from '../../providers/RoomProvider';
import { useCurrentUser } from 'common.services';
import { useMedia } from 'common.utils';
import { CompactCallVideoArea } from './CompactCallVideoArea';
import { CompactCallBottomBar } from './CompactCallBottomBar';
import {
  COMPACT_BOTTOM_BAR_PX,
  COMPACT_VIDEO_AREA_MARGIN_PX,
  EXPANDED_VIDEO_PADDING_VERTICAL_PX,
  TILE_GAP_PX,
  TILE_HEIGHT_16_9_PX,
} from './constants';

export const CompactCall = ({ saveUserChoices = true, withOutShadows = false }) => {
  const isMobile = useMedia('(max-width: 720px)');
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: 'draggable-call',
    disabled: isMobile,
  });
  const style = isMobile ? undefined : { transform: CSS.Translate.toString(transform) };

  const { saveAudioInputEnabled, saveVideoInputEnabled } = usePersistentUserChoices({
    preventSave: !saveUserChoices,
  });
  const { isMicrophoneEnabled, isCameraEnabled, microphoneTrack, cameraTrack } =
    useLocalParticipant();
  const videoTrack = cameraTrack?.track as LocalVideoTrack | undefined;

  const mode = useCallStore((state) => state.mode);
  useVideoBlur(mode === 'compact' ? videoTrack : null);

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

  const navigation = useCompactNavigation();
  const {
    currentParticipant,
    participants,
    currentIndex,
    totalParticipants,
    canGoNext,
    canGoPrev,
    goToNext,
    goToPrev,
  } = navigation;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const compactViewMode = useCallStore((state) => state.compactViewMode);
  const updateStore = useCallStore((state) => state.updateStore);
  const setCompactViewMode = useCallback(
    (mode: 'basic' | 'expanded') => updateStore('compactViewMode', mode),
    [updateStore],
  );
  const [multiScrollIndex, setMultiScrollIndex] = useState(0);

  const currentAudioTrack = currentParticipant?.participant?.getTrackPublication(
    Track.Source.Microphone,
  )?.track as
    | import('livekit-client').RemoteAudioTrack
    | import('livekit-client').LocalAudioTrack
    | undefined;

  const params = useParams({ strict: false }) as {
    callId?: string;
    classroomId?: string;
    boardId?: string;
  };
  const search = useSearch({ strict: false }) as { call?: string };
  const { call } = search;
  const navigate = useNavigate();
  const { syncModeToOthers } = useModeSync();
  const activeBoardId = useCallStore((state) => state.activeBoardId);
  const activeClassroom = useCallStore((state) => state.activeClassroom);
  const { room } = useRoom();
  const token = useCallStore((state) => state.token);
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const router = useRouter();
  const isBoardPage = router.state.location.pathname.includes('/board');
  const isOnBoardPage = params.classroomId === activeClassroom && params.boardId === activeBoardId;
  const showBackToBoardButton =
    mode === 'compact' && !!activeBoardId && !!activeClassroom && !isOnBoardPage;

  const availableHeight = useCompactAvailableHeight(isBoardPage);

  const multiViewLayout = useMemo(() => {
    const heightForTiles = Math.max(
      0,
      availableHeight -
        COMPACT_BOTTOM_BAR_PX -
        EXPANDED_VIDEO_PADDING_VERTICAL_PX -
        COMPACT_VIDEO_AREA_MARGIN_PX,
    );
    // Плитки имеют aspect-video (16:9), их высота фиксирована шириной контейнера
    const visibleCount = Math.min(
      totalParticipants,
      Math.max(1, Math.floor((heightForTiles + TILE_GAP_PX) / (TILE_HEIGHT_16_9_PX + TILE_GAP_PX))),
    );
    return { visibleCount, tileHeightPx: TILE_HEIGHT_16_9_PX };
  }, [availableHeight, totalParticipants]);

  const { visibleCount: multiVisibleCount, tileHeightPx: multiTileHeightPx } = multiViewLayout;
  const multiCanPrev = multiScrollIndex > 0;
  const multiCanNext = multiScrollIndex + multiVisibleCount < totalParticipants;
  const multiVisibleParticipants = participants.slice(
    multiScrollIndex,
    multiScrollIndex + multiVisibleCount,
  );

  useEffect(() => {
    if (multiScrollIndex + multiVisibleCount > totalParticipants && totalParticipants > 0) {
      setMultiScrollIndex(Math.max(0, totalParticipants - multiVisibleCount));
    }
  }, [totalParticipants, multiVisibleCount, multiScrollIndex]);

  const handleBackToBoard = useCallback(() => {
    if (!activeBoardId || !activeClassroom) return;
    navigate({
      to: '/classrooms/$classroomId/boards/$boardId',
      params: { classroomId: activeClassroom, boardId: activeBoardId },
      search: { call: activeClassroom },
    });
  }, [activeBoardId, activeClassroom, navigate]);

  const handleMaximize = useCallback(
    (syncToAll: boolean = false) => {
      if (!room || !token || room.state !== 'connected') return;
      const targetCallId =
        (typeof call === 'string' ? call.replace(/^"|"$/g, '').trim() : '') ||
        activeClassroom ||
        params.classroomId ||
        params.callId ||
        '';
      if (syncToAll && isTutor && activeBoardId && targetCallId) {
        updateStore('localFullView', false);
        updateStore('mode', 'full');
        updateStore('activeBoardId', undefined);
        updateStore('activeClassroom', undefined);
        syncModeToOthers('full', undefined, targetCallId);
      } else {
        updateStore('localFullView', true);
        updateStore('mode', 'full');
      }
      navigate({
        to: '/call/$callId',
        params: { callId: targetCallId },
        ...(targetCallId ? { search: { call: targetCallId } } : {}),
        replace: true,
      });
    },
    [
      room,
      token,
      call,
      activeClassroom,
      params.classroomId,
      params.callId,
      isTutor,
      activeBoardId,
      updateStore,
      syncModeToOthers,
      navigate,
    ],
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`compact-call-container flex flex-col ${isMobile ? 'w-full' : 'w-[360px]'}`}
    >
      <CompactCallVideoArea
        isMobile={isMobile}
        isCollapsed={isCollapsed}
        onCollapsedChange={setIsCollapsed}
        withOutShadows={withOutShadows}
        dragAttributes={attributes as object}
        dragListeners={listeners as object}
        compactViewMode={compactViewMode}
        currentParticipant={currentParticipant}
        currentAudioTrack={currentAudioTrack ?? null}
        totalParticipants={totalParticipants}
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
        onPrev={goToPrev}
        onNext={goToNext}
        currentIndex={currentIndex}
        multiVisibleParticipants={multiVisibleParticipants}
        multiTileHeightPx={multiTileHeightPx}
        multiCanPrev={multiCanPrev}
        multiCanNext={multiCanNext}
        onMultiPrev={() => setMultiScrollIndex((i) => Math.max(0, i - 1))}
        onMultiNext={() =>
          setMultiScrollIndex((i) => Math.min(totalParticipants - multiVisibleCount, i + 1))
        }
      />
      <CompactCallBottomBar
        withOutShadows={withOutShadows}
        devices={{
          microTrack: microphoneTrack?.track as LocalAudioTrack,
          microEnabled: isMicrophoneEnabled,
          microTrackToggle: {
            showIcon: true,
            source: Track.Source.Microphone,
            onChange: handleMicrophoneToggle,
          },
          videoTrack: cameraTrack?.track as unknown as LocalVideoTrack,
          videoEnabled: isCameraEnabled,
          videoTrackToggle: {
            showIcon: true,
            source: Track.Source.Camera,
            onChange: handleCameraToggle,
          },
        }}
        isMobile={isMobile}
        compactViewMode={compactViewMode}
        onViewModeToggle={() =>
          setCompactViewMode(compactViewMode === 'basic' ? 'expanded' : 'basic')
        }
        showBackToBoardButton={!!showBackToBoardButton}
        onBackToBoard={handleBackToBoard}
        onMaximize={handleMaximize}
        isTutor={!!isTutor}
      />
    </div>
  );
};
