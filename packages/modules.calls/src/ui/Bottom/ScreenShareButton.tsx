import { Track, LocalVideoTrack } from 'livekit-client';
import { supportsScreenSharing } from '@livekit/components-core';
import { useRoomContext, useTrackToggle } from '@livekit/components-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { useCallback, useState } from 'react';
import { TrackToggle } from '../shared';

export const ScreenShareButton = ({ className }: { className?: string }) => {
  const [isScreenShareEnabled, setIsScreenShareEnabled] = useState(false);

  const browserSupportsScreenSharing = supportsScreenSharing();
  const room = useRoomContext();

  const { toggle, track, enabled } = useTrackToggle({
    source: Track.Source.ScreenShare,
    captureOptions: { audio: true, selfBrowserSurface: 'include' },
  });

  const closeAllScreenShareTracks = useCallback(() => {
    const pubs = room.localParticipant.getTrackPublications();

    pubs.forEach((pub) => {
      if (pub.source === Track.Source.ScreenShare || pub.source === Track.Source.ScreenShareAudio) {
        const mediaStreamTrack = pub.track?.mediaStreamTrack;
        mediaStreamTrack?.stop();
      }
    });
  }, [room.localParticipant]);

  const toggleScreenShare = useCallback(() => {
    closeAllScreenShareTracks();
    if (!isScreenShareEnabled) {
      setIsScreenShareEnabled(true);
      toggle();
    } else {
      setIsScreenShareEnabled(false);

      toggle();
    }
  }, [closeAllScreenShareTracks, isScreenShareEnabled, toggle]);

  return (
    <>
      {browserSupportsScreenSharing && (
        <Tooltip delayDuration={1000}>
          <TooltipTrigger className="bg-transparent" asChild>
            <div>
              <TrackToggle
                className={className}
                source={Track.Source.ScreenShare}
                screenShareTrack={track?.track as LocalVideoTrack}
                screenShareEnabled={enabled}
                onChange={toggleScreenShare}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" align="center">
            {isScreenShareEnabled ? 'Остановить показ экрана' : 'Поделиться экраном'}
          </TooltipContent>
        </Tooltip>
      )}
    </>
  );
};
