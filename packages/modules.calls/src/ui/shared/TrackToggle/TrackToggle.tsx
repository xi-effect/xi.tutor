/* eslint-disable @typescript-eslint/no-explicit-any */
import { TrackToggleProps, useTrackVolume } from '@livekit/components-react';
import { Track, LocalAudioTrack, LocalVideoTrack } from 'livekit-client';
import { motion } from 'framer-motion';
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
import { cn } from '@xipkg/utils';

interface ExtendedTrackToggleProps extends TrackToggleProps<any> {
  microTrack?: LocalAudioTrack;
  videoTrack?: LocalVideoTrack;
  showIcon?: boolean;
}

export const TrackToggle = ({
  microTrack,
  videoTrack,
  source,
  showIcon = true,
  onChange,
  ...props
}: ExtendedTrackToggleProps) => {
  // Для PreJoin используем состояние из store, а не состояние трека
  const enabled =
    source === Track.Source.Microphone
      ? microTrack
        ? !microTrack.isMuted
        : false
      : videoTrack
        ? !videoTrack.isMuted
        : false;

  const toggle = () => {
    console.log('handleClick', source);

    // Просто вызываем onChange, который обновит store
    // Store обновление приведет к изменению состояния трека через useEffect в UserTile
    onChange?.(!enabled, true);
  };

  const trackVol = useTrackVolume(microTrack);

  const volume = Math.round(trackVol * 100);

  const icon = useMemo(() => {
    switch (source) {
      case Track.Source.Microphone:
        return enabled ? (
          <Microphone className="fill-green-100" />
        ) : (
          <div className="flex items-center justify-center">
            <MicrophoneOff className="absolute" />
            <RedLine className="fill-red-80 absolute" />
          </div>
        );
      case Track.Source.Camera:
        return enabled ? (
          <Conference className="fill-green-100" />
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

  const handleClick = () => {
    console.log('handleClick', source);
    toggle();

    // if (source === Track.Source.ScreenShare) {
    //   console.log('room.localParticipant', room.localParticipant);

    //   room.localParticipant.setScreenShareEnabled(
    //     !room.localParticipant.isScreenShareEnabled,
    //     { audio: true, selfBrowserSurface: 'include' },
    //     {
    //       name: 'screen-share',
    //     },
    //   );
    // }
  };

  if (source === Track.Source.Microphone) {
    return (
      <motion.button
        type="button"
        onClick={handleClick}
        className="bg-gray-0 hover:bg-gray-10 flex h-10 w-10 items-center justify-center rounded-[12px] transition-colors"
        style={{
          background: enabled
            ? `linear-gradient(to top, var(--xi-green-20) 0%, transparent ${volume}%)`
            : '',
        }}
        animate={{
          background: enabled
            ? `linear-gradient(to top, var(--xi-green-20) 0%, transparent ${volume}%)`
            : '',
        }}
        transition={{ duration: 0.5 }}
        {...(props as unknown as any)}
      >
        {showIcon && icon}
        {props.children}
      </motion.button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'bg-gray-0 hover:bg-gray-10 flex h-10 w-10 items-center justify-center rounded-[12px] transition-colors',
        enabled && 'bg-green-0 hover:bg-green-20',
      )}
      {...props}
    >
      {showIcon && icon}
      {props.children}
    </button>
  );
};
