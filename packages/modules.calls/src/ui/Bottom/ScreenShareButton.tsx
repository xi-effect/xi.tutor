import { Track, LocalVideoTrack } from 'livekit-client';
import { supportsScreenSharing } from '@livekit/components-core';
import { useTrackToggle } from '@livekit/components-react';
import { TrackToggle } from '../shared/TrackToggle/TrackToggle';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';

export const ScreenShareButton = () => {
  const visibleControls = { leave: true, screenShare: true };
  const browserSupportsScreenSharing = supportsScreenSharing();

  const { toggle, enabled, track } = useTrackToggle({
    source: Track.Source.ScreenShare,
    captureOptions: { audio: true, selfBrowserSurface: 'include' },
  });

  const handleScreenShareToggle = (_enabled: boolean, isUserInitiated: boolean) => {
    if (isUserInitiated) {
      toggle();
    }
  };

  return (
    <>
      {visibleControls.screenShare && browserSupportsScreenSharing && (
        <Tooltip delayDuration={1000}>
          <TooltipTrigger className="bg-transparent" asChild>
            <div>
              <TrackToggle
                source={Track.Source.ScreenShare}
                screenShareTrack={track?.track as LocalVideoTrack}
                screenShareEnabled={enabled}
                onChange={handleScreenShareToggle}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" align="center">
            {enabled ? 'Остановить показ экрана' : 'Поделиться экраном'}
          </TooltipContent>
        </Tooltip>
      )}
    </>
  );
};
