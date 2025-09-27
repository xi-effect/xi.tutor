import { LocalAudioTrack, LocalVideoTrack, Track } from 'livekit-client';
import { TrackToggle } from '../TrackToggle';

type TrackToggleType = {
  source: Track.Source;
  onChange?: (enabled: boolean, isUserInitiated: boolean) => void;
  showIcon?: boolean;
};

type DevicesBarPropsT = {
  microTrack?: LocalAudioTrack;
  microEnabled?: boolean;
  microTrackToggle?: TrackToggleType;
  videoTrack?: LocalVideoTrack;
  videoEnabled?: boolean;
  videoTrackToggle?: TrackToggleType;
};

export const DevicesBar = ({
  microTrack,
  microEnabled,
  microTrackToggle,
  videoTrack,
  videoEnabled,
  videoTrackToggle,
}: DevicesBarPropsT) => {
  // console.log('DevicesBar props:', {
  //   microTrack: !!microTrack,
  //   microEnabled,
  //   microTrackToggle: !!microTrackToggle,
  //   videoTrack: !!videoTrack,
  //   videoEnabled,
  //   videoTrackToggle: !!videoTrackToggle,
  // });

  return (
    <>
      {microTrackToggle && (
        <TrackToggle
          microTrack={microTrack}
          microEnabled={microEnabled}
          source={microTrackToggle.source}
          onChange={microTrackToggle.onChange}
          showIcon={microTrackToggle.showIcon}
        />
      )}
      {videoTrackToggle && (
        <TrackToggle
          videoTrack={videoTrack}
          videoEnabled={videoEnabled}
          source={videoTrackToggle.source}
          onChange={videoTrackToggle.onChange}
          showIcon={videoTrackToggle.showIcon}
        />
      )}
    </>
  );
};
