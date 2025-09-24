import { LiveKitRoom } from '@livekit/components-react';
import { serverUrl, serverUrlDev, isDevMode, devToken } from '../utils/config';
import { useCallStore } from '../store/callStore';
import { useRoom } from './RoomProvider';
import { useParams, useLocation, useNavigate } from '@tanstack/react-router';
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
    console.log('Disconnected from LiveKit room');
  };

  const location = useLocation();
  const { callId, classroomId } = useParams({ strict: false });
  const navigate = useNavigate();

  console.log('token', token);
  console.log('location', location);
  console.log('callId', callId);
  console.log('classroomId', classroomId);

  useEffect(() => {
    if (!token && callId && location.pathname.includes('/call/')) {
      navigate({ to: '/classrooms/$classroomId', params: { classroomId: callId } });
    }
  }, [location]);

  if (!token) {
    return <>{children}</>;
  }

  // Если нет токена, не рендерим LiveKitRoom
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
