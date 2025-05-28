import { LiveKitRoom } from '@livekit/components-react';
import { serverUrl, serverUrlDev, isDevMode, devToken } from '../utils/config';
import { useCallStore } from '../store/callStore';
import { useRoom } from './RoomProvider';

type LiveKitProviderProps = {
  token: string;
  children: React.ReactNode;
};

export const LiveKitProvider = ({ token, children }: LiveKitProviderProps) => {
  const { room } = useRoom();
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
      {children}
    </LiveKitRoom>
  );
};
