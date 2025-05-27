import { LiveKitRoom } from '@livekit/components-react';
import { Room } from 'livekit-client';
import { serverUrl, serverUrlDev, isDevMode, devToken } from '../utils/config';
import { useCallStore } from '../store/callStore';

type LiveKitProviderProps = {
  token: string;
  room: Room;
  children: React.ReactNode;
};

export const LiveKitProvider = ({ token, room, children }: LiveKitProviderProps) => {
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
      {children}
    </LiveKitRoom>
  );
};
