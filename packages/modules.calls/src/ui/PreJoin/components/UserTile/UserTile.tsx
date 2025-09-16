import { Avatar, AvatarFallback, AvatarImage } from '@xipkg/avatar';
import { useMemo, useRef, useEffect, useCallback } from 'react';
import { facingModeFromLocalTrack, Track, LocalVideoTrack, LocalAudioTrack } from 'livekit-client';
import { usePreviewTracks } from '@livekit/components-react';
import { useCallStore } from '../../../../store/callStore';
import { Controls } from './Controls';
import { useCurrentUser } from 'common.services';

const UserTileUI = ({
  audioTrack,
  videoTrack,
  videoEnabled,
  facingMode,
  videoEl,
  userId,
}: {
  audioTrack?: LocalAudioTrack;
  videoTrack: LocalVideoTrack;
  videoEnabled: boolean;
  facingMode: string;
  videoEl: React.RefObject<HTMLVideoElement | null>;
  userId: string;
}) => {
  console.log('videoTrack', videoTrack);
  console.log('videoEnabled', videoEnabled);
  console.log('facingMode', facingMode);
  console.log('videoEl', videoEl);
  console.log('userId', userId);

  const renderVideo = useMemo(() => {
    console.log('renderVideo - videoTrack:', videoTrack);
    console.log('renderVideo - videoTrack.isMuted:', videoTrack?.isMuted);

    if (!videoTrack || videoTrack.isMuted) {
      console.log('renderVideo - returning null');
      return null;
    }

    console.log('renderVideo - rendering video');
    return (
      <div className="aspect-video h-full w-full [transform:rotateY(180deg)]">
        <video
          ref={videoEl}
          data-lk-facing-mode={facingMode}
          className="h-full w-full object-cover"
          playsInline
          muted
        />
      </div>
    );
  }, [videoTrack, facingMode, videoEl]);

  const renderAvatar = useMemo(() => {
    if (videoTrack && !videoTrack.isMuted) return null;

    return (
      <div className="bg-gray-40 flex items-center justify-center rounded-[16px]">
        <Avatar size="xxl">
          <AvatarImage
            src={`https://api.sovlium.ru/files/users/${userId}/avatar.webp`}
            alt="user avatar"
          />
          <AvatarFallback size="xxl" loading />
        </Avatar>
      </div>
    );
  }, [videoTrack, videoEnabled, userId]);

  return (
    <div className="bg-gray-40 relative flex aspect-video h-full w-full items-center justify-center overflow-hidden rounded-[16px]">
      <div className="relative">
        {renderVideo}
        {renderAvatar}
      </div>
      <div className="absolute bottom-5 left-5">
        <Controls audioTrack={audioTrack} videoTrack={videoTrack} />
      </div>
    </div>
  );
};

export const UserTile = () => {
  const { data: user } = useCurrentUser();
  const { userId } = user;

  const audioDeviceId = useCallStore((state) => state.audioDeviceId);
  const audioEnabled = useCallStore((state) => state.audioEnabled);
  const videoDeviceId = useCallStore((state) => state.videoDeviceId);
  const videoEnabled = useCallStore((state) => state.videoEnabled);

  console.log('videoDeviceId', videoDeviceId);
  console.log('videoEnabled', videoEnabled);

  const videoEl = useRef<HTMLVideoElement>(null);

  const onError = useCallback(() => {
    console.error('Error accessing media devices');
  }, []);

  const audioTracks = usePreviewTracks(
    {
      audio: { deviceId: audioDeviceId },
      video: false,
    },
    onError,
  );

  const videoTracks = usePreviewTracks(
    {
      audio: false,
      video: { deviceId: videoDeviceId },
    },
    onError,
  );

  const audioTrack = useMemo(
    () => audioTracks?.filter((track) => track.kind === Track.Kind.Audio)[0] as LocalAudioTrack,
    [audioTracks],
  );

  const videoTrack = useMemo(
    () => videoTracks?.filter((track) => track.kind === Track.Kind.Video)[0] as LocalVideoTrack,
    [videoTracks],
  );

  console.log('audioTrack', audioTrack);
  console.log('videoTrack', videoTrack);

  const facingMode = useMemo(() => {
    if (videoTrack) {
      const { facingMode } = facingModeFromLocalTrack(videoTrack);
      return facingMode;
    }
    return 'undefined';
  }, [videoTrack]);

  // Управляем состоянием треков в зависимости от store
  useEffect(() => {
    if (audioTrack) {
      console.log('Audio track state sync - audioEnabled:', audioEnabled);
      if (audioEnabled) {
        audioTrack.unmute();
      } else {
        audioTrack.mute();
      }
    }
  }, [audioTrack, audioEnabled]);

  useEffect(() => {
    if (videoTrack) {
      console.log('Video track state sync - videoEnabled:', videoEnabled);
      if (videoEnabled) {
        videoTrack.unmute();
      } else {
        videoTrack.mute();
      }
    }
  }, [videoTrack, videoEnabled]);

  useEffect(() => {
    const currentVideoEl = videoEl.current;
    const currentVideoTrack = videoTrack;

    console.log('useEffect attach - currentVideoEl:', currentVideoEl);
    console.log('useEffect attach - currentVideoTrack:', currentVideoTrack);

    if (currentVideoEl && currentVideoTrack) {
      console.log('Attaching video track to element');
      currentVideoTrack.attach(currentVideoEl);
    }

    return () => {
      if (currentVideoTrack) {
        console.log('Detaching video track');
        currentVideoTrack.detach();
      }
    };
  }, [videoTrack]);

  return (
    <UserTileUI
      audioTrack={audioTrack}
      videoTrack={videoTrack}
      videoEnabled={videoEnabled}
      facingMode={facingMode}
      videoEl={videoEl}
      userId={userId}
    />
  );
};
