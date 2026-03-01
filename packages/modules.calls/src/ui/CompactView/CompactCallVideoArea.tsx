import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { Button } from '@xipkg/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { ChevronUp } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { CompactCallCollapsedBar } from './CompactCallCollapsedBar';
import { CompactNavigationControls } from './CompactNavigationControls';
import { CompactMultiViewControls } from './CompactMultiViewControls';
import { ParticipantTile } from '../Participant';
import { TILE_GAP_PX, TILE_HEIGHT_16_9_PX } from './constants';

type CompactCallVideoAreaProps = {
  isMobile: boolean;
  isCollapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  withOutShadows: boolean;
  dragAttributes?: object;
  dragListeners?: object;
  /** Режим вида на десктопе */
  compactViewMode: 'basic' | 'expanded';
  currentParticipant: TrackReferenceOrPlaceholder | null;
  currentAudioTrack:
    | import('livekit-client').RemoteAudioTrack
    | import('livekit-client').LocalAudioTrack
    | null;
  totalParticipants: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  currentIndex: number;
  multiVisibleParticipants: TrackReferenceOrPlaceholder[];
  multiTileHeightPx: number;
  multiCanPrev: boolean;
  multiCanNext: boolean;
  onMultiPrev: () => void;
  onMultiNext: () => void;
};

export function CompactCallVideoArea({
  isMobile,
  isCollapsed,
  onCollapsedChange,
  withOutShadows,
  dragAttributes = {},
  dragListeners = {},
  compactViewMode,
  currentParticipant,
  currentAudioTrack,
  totalParticipants,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
  currentIndex,
  multiVisibleParticipants,
  multiTileHeightPx,
  multiCanPrev,
  multiCanNext,
  onMultiPrev,
  onMultiNext,
}: CompactCallVideoAreaProps) {
  const emptyState = (
    <div className="bg-gray-40 flex h-full w-full items-center justify-center text-gray-100">
      <span className="text-sm">Нет участников</span>
    </div>
  );

  if (isMobile && isCollapsed) {
    return (
      <CompactCallCollapsedBar
        participant={currentParticipant?.participant ?? null}
        audioTrack={currentAudioTrack ?? null}
        onExpand={() => onCollapsedChange(false)}
        className={cn('mb-2', withOutShadows ? '' : 'shadow-lg')}
      />
    );
  }

  return (
    <div
      {...(isMobile ? {} : { ...dragAttributes, ...dragListeners })}
      className={cn(
        'group relative mb-2 flex overflow-hidden rounded-2xl',
        withOutShadows ? '' : 'shadow-lg',
        isMobile ? 'h-auto w-full items-center justify-center' : 'w-[360px] cursor-move flex-col',
        !isMobile && compactViewMode === 'basic' && 'shrink-0',
        !isMobile && compactViewMode === 'expanded' && 'h-auto',
      )}
      style={!isMobile && compactViewMode === 'basic' ? { height: TILE_HEIGHT_16_9_PX } : undefined}
    >
      {isMobile ? (
        currentParticipant ? (
          <ParticipantTile
            trackRef={currentParticipant}
            participant={currentParticipant.participant}
            className="h-full w-full"
            isFocusToggleDisable
          />
        ) : (
          emptyState
        )
      ) : compactViewMode === 'expanded' ? (
        <div
          className="relative flex flex-col gap-2 overflow-hidden rounded-2xl p-1"
          style={{ gap: TILE_GAP_PX }}
        >
          {multiVisibleParticipants.length === 0
            ? emptyState
            : multiVisibleParticipants.map((trackRef) => (
                <div
                  key={`${trackRef.participant.identity}-${trackRef.source}`}
                  className="aspect-video w-full shrink-0 overflow-hidden rounded-xl"
                  style={{ minHeight: multiTileHeightPx }}
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
            onPrev={onMultiPrev}
            onNext={onMultiNext}
          />
        </div>
      ) : currentParticipant ? (
        <ParticipantTile
          trackRef={currentParticipant}
          participant={currentParticipant.participant}
          className="h-full w-full"
          isFocusToggleDisable
        />
      ) : (
        emptyState
      )}

      {isMobile && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="none"
              onClick={() => onCollapsedChange(true)}
              className="bg-brand-100 hover:bg-gray-20 absolute top-2 right-2 z-10 h-8 w-8 rounded-xl p-0 text-gray-100"
              aria-label="Свернуть"
            >
              <ChevronUp className="fill-gray-0 h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Свернуть</TooltipContent>
        </Tooltip>
      )}

      {totalParticipants > 0 && (isMobile || compactViewMode === 'basic') && (
        <CompactNavigationControls
          canPrev={canGoPrev}
          canNext={canGoNext}
          onPrev={onPrev}
          onNext={onNext}
          currentIndex={currentIndex}
          totalParticipants={totalParticipants}
        />
      )}
    </div>
  );
}
