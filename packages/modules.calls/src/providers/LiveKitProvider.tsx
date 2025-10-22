import { LiveKitRoom } from '@livekit/components-react';
import { serverUrl, serverUrlDev, isDevMode, devToken } from '../utils/config';
import { useCallStore } from '../store/callStore';
import { useRoom } from './RoomProvider';
import { useParams, useLocation, useNavigate, useSearch } from '@tanstack/react-router';
import { useEffect } from 'react';

type LiveKitProviderProps = {
  children: React.ReactNode;
};

export const LiveKitProvider = ({ children }: LiveKitProviderProps) => {
  const { room } = useRoom();
  const { audioEnabled, videoEnabled, connect, token, updateStore } = useCallStore();

  const handleConnect = () => {
    updateStore('connect', true);
    console.log('Connected to LiveKit room');
  };

  const handleDisconnect = () => {
    updateStore('connect', false);
    updateStore('isStarted', false);
    updateStore('mode', 'full');

    // Удаляем параметр call из URL при отключении
    if (search.call) {
      const searchWithoutCall = { ...search };
      delete searchWithoutCall.call;
      navigate({
        to: location.pathname,
        search: searchWithoutCall,
        replace: true,
      });
    }

    console.log('Disconnected from LiveKit room');
  };

  const location = useLocation();
  const { callId } = useParams({ strict: false });
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { call?: string };

  useEffect(() => {
    if (!token && callId && location.pathname.includes('/call/')) {
      navigate({
        to: '/classrooms/$classroomId',
        params: { classroomId: callId },
        search: { call: callId },
      });
    }
  }, [location, token, callId, navigate]);

  if (!token) {
    console.warn('No token available for LiveKit connection');
    return <>{children}</>;
  }

  // console.log('LiveKitProvider state:', {
  //   connect,
  //   audioEnabled,
  //   videoEnabled,
  //   hasToken: !!token,
  // });

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
