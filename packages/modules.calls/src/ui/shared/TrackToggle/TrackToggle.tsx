import { TrackToggleProps, useTrackToggle } from '@livekit/components-react';
import { Track } from 'livekit-client';
import {
  MicrophoneOff,
  Microphone,
  VideoCamera,
  VideoCameraOff,
  ScreenShare,
  StopScreenShare,
} from '@xipkg/icons';

interface ExtendedTrackToggleProps extends TrackToggleProps<Track.Source> {
  showIcon?: boolean;
}

export const TrackToggle = ({ source, showIcon = true, ...props }: ExtendedTrackToggleProps) => {
  const { enabled, toggle } = useTrackToggle(source);

  let icon;
  switch (source) {
    case Track.Source.Microphone:
      icon = enabled ? (
        <Microphone className="fill-gray-100" />
      ) : (
        <MicrophoneOff className="fill-gray-100" />
      );
      break;
    case Track.Source.Camera:
      icon = enabled ? (
        <VideoCamera className="fill-gray-100" />
      ) : (
        <VideoCameraOff className="fill-gray-100" />
      );
      break;
    case Track.Source.ScreenShare:
      icon = enabled ? (
        <StopScreenShare className="fill-gray-100" />
      ) : (
        <ScreenShare className="fill-gray-100" />
      );
      break;
    default:
      icon = null;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="bg-gray-0 flex h-10 w-10 items-center justify-center rounded-full transition-colors"
      {...props}
    >
      {showIcon && icon}
      {props.children}
    </button>
  );
};
