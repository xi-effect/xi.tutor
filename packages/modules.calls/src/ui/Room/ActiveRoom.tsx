import { LiveKitRoom } from '@livekit/components-react';
import { Room } from 'livekit-client';
import { BottomBar } from '../Bottom';
import { VideoGrid } from '../VideoGrid';
import { serverUrl, serverUrlDev, isDevMode, devToken } from '../../utils/config';
import { useCallStore } from '../../store/callStore';
import { UpBar } from '../Up';

type ActiveRoomPropsT = {
  token: string;
  room: Room;
};

export const ActiveRoom = ({ token, room }: ActiveRoomPropsT) => {
  const audioEnabled = useCallStore((state) => state.audioEnabled);
  const videoEnabled = useCallStore((state) => state.videoEnabled);
  const connect = useCallStore((state) => state.connect);

  const updateStore = useCallStore((state) => state.updateStore);

  const handleConnect = () => {
    updateStore('connect', true);
  };

  const handleDisconnect = () => {
    updateStore('connect', false);
  };

  console.log('room', room);
  console.log('connect', connect);

  return (
    <LiveKitRoom
      room={room}
      token={isDevMode ? devToken : token}
      serverUrl={isDevMode ? serverUrlDev : serverUrl}
      connect={connect}
      onConnected={handleConnect}
      onDisconnected={handleDisconnect}
      audio={audioEnabled || false}
      video={videoEnabled || false}
    >
      <div className="flex h-full flex-col justify-stretch">
        <UpBar />
        <div className="flex h-full items-center justify-center px-4">
          <div className="h-full w-full text-center text-gray-100">
            <VideoGrid />
          </div>
        </div>
        <BottomBar />
      </div>
    </LiveKitRoom>
  );
};
