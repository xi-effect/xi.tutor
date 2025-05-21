import { TrackToggleProps, useTrackToggle } from '@livekit/components-react';
import { Track } from 'livekit-client';
import {
  MicrophoneOff,
  Microphone,
  Conference,
  CameraOff,
  Screenshare,
  RedLine,
  // Screenshare,
} from '@xipkg/icons';
import { useMemo } from 'react';

interface ExtendedTrackToggleProps extends TrackToggleProps<Track.Source> {
  showIcon?: boolean;
}

export const TrackToggle = ({
  source,
  showIcon = true,
  onChange,
  ...props
}: ExtendedTrackToggleProps) => {
  const { enabled, toggle } = useTrackToggle({ source, onChange });

  // console.log('TrackToggle debug:', { source, enabled, showIcon });

  const icon = useMemo(() => {
    switch (source) {
      case Track.Source.Microphone:
        return enabled ? (
          <Microphone className="fill-gray-100" />
        ) : (
          <div className="flex items-center justify-center">
            <MicrophoneOff className="absolute" />
            <RedLine className="fill-red-80 absolute" />
          </div>
        );
      case Track.Source.Camera:
        return enabled ? (
          <Conference className="fill-gray-100" />
        ) : (
          <div className="flex items-center justify-center">
            <CameraOff className="absolute" />
            <RedLine className="fill-red-80 absolute" />
          </div>
        );
      case Track.Source.ScreenShare:
        return enabled ? (
          <Screenshare className="fill-gray-100" />
        ) : (
          <Screenshare className="fill-gray-100" />
        );
      default:
        return null;
    }
  }, [source, enabled]);

  const handleClick = useMemo(() => {
    return () => toggle();
  }, [toggle]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className="bg-gray-0 hover:bg-gray-10 flex h-10 w-10 items-center justify-center rounded-[12px] transition-colors"
      {...props}
    >
      {showIcon && icon}
      {props.children}
    </button>
  );
};
