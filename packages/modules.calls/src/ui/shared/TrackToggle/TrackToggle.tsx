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
  microEnabled?: boolean;
  videoEnabled?: boolean;
  showIcon?: boolean;
}

export const TrackToggle = ({
  microTrack,
  videoTrack,
  microEnabled,
  videoEnabled,
  source,
  showIcon = true,
  onChange,
  ...props
}: ExtendedTrackToggleProps) => {
  // Для PreJoin используем собственную логику, так как useTrackToggle работает с треками в комнате
  const track = source === Track.Source.Microphone ? microTrack : videoTrack;
  const enabled = source === Track.Source.Microphone ? microEnabled : videoEnabled;

  const toggle = () => {
    console.log('handleClick', source);
    console.log('track:', track);
    if (track) {
      const wasMuted = track.isMuted;
      const newEnabled = wasMuted; // Если был замучен, то включаем (true), если не был замучен, то выключаем (false)

      console.log('TrackToggle: changing state', { wasMuted, newEnabled });

      if (wasMuted) {
        console.log('unmuting track');
        track.unmute();
      } else {
        console.log('muting track');
        track.mute();
      }

      // Передаем новое состояние enabled (true = включен, false = выключен)
      onChange?.(newEnabled, true);
    } else {
      console.log('track is null/undefined');
    }
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
            : 'var(--xi-gray-0)',
        }}
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
