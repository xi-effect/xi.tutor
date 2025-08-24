import { Avatar, AvatarFallback, AvatarImage } from '@xipkg/avatar';
import { useMemo, useRef, useEffect, useCallback } from 'react';
import { facingModeFromLocalTrack, Track, LocalVideoTrack } from 'livekit-client';
import { usePreviewTracks } from '@livekit/components-react';
import { useCallStore } from '../../../../store/callStore';
import { Controls } from './Controls';
import { useCurrentUser } from 'common.services';

export const UserTile = () => {
  console.log('UserTile');
  const { data: user } = useCurrentUser();
  const { userId } = user;

  // const audioDeviceId = useCallStore((state) => state.audioDeviceId);
  // const audioEnabled = useCallStore((state) => state.audioEnabled);
  const videoDeviceId = useCallStore((state) => state.videoDeviceId);
  const videoEnabled = useCallStore((state) => state.videoEnabled);

  const videoEl = useRef<HTMLVideoElement>(null);

  const onError = useCallback(() => {
    console.error('Error accessing media devices');
  }, []);

  // const audioTracks = usePreviewTracks(
  //   {
  //     audio: audioEnabled ? { deviceId: audioDeviceId } : false,
  //     video: false,
  //   },
  //   onError,
  // );

  const videoTracks = usePreviewTracks(
    {
      audio: false,
      video: videoEnabled ? { deviceId: videoDeviceId } : false,
    },
    onError,
  );

  const videoTrack = useMemo(
    () => videoTracks?.filter((track) => track.kind === Track.Kind.Video)[0] as LocalVideoTrack,
    [videoTracks],
  );

  console.log('videoTrack', videoTrack);

  const facingMode = useMemo(() => {
    if (videoTrack) {
      const { facingMode } = facingModeFromLocalTrack(videoTrack);
      return facingMode;
    }
    return 'undefined';
  }, [videoTrack]);

  useEffect(() => {
    const currentVideoEl = videoEl.current;
    const currentVideoTrack = videoTrack;

    if (currentVideoEl && currentVideoTrack) {
      currentVideoTrack.unmute();
      currentVideoTrack.attach(currentVideoEl);
    }

    return () => {
      if (currentVideoTrack) {
        currentVideoTrack.detach();
      }
    };
  }, [videoTrack]);

  const renderVideo = useMemo(() => {
    if (!videoTrack || !videoEnabled) return null;

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
  }, [videoTrack, videoEnabled, facingMode]);

  const renderAvatar = useMemo(() => {
    if (videoTrack && videoEnabled) return null;

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
        <Controls />
      </div>
    </div>
  );
};
