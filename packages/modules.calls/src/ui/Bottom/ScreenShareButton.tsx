import { Track } from 'livekit-client';
import { supportsScreenSharing } from '@livekit/components-core';
import { TrackToggle } from '../shared/TrackToggle/TrackToggle';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';

export const ScreenShareButton = () => {
  const visibleControls = { leave: true, screenShare: true };

  const browserSupportsScreenSharing = supportsScreenSharing();

  return (
    <>
      {visibleControls.screenShare && browserSupportsScreenSharing && (
        <Tooltip delayDuration={1000}>
          <TooltipTrigger className="bg-transparent">
            <TrackToggle
              source={Track.Source.ScreenShare}
              captureOptions={{ audio: true, selfBrowserSurface: 'include' }}
              onChange={() => {}}
            />
          </TooltipTrigger>
          <TooltipContent side="top" align="center">
            Поделиться экраном
          </TooltipContent>
        </Tooltip>
      )}
    </>
  );
};
