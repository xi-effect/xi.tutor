import { ActiveRoom } from './Room/ActiveRoom';
import { PreJoin } from './PreJoin';
import { PermissionsDialog } from './shared/PermissionsDialog';
import { useCallStore } from '../store/callStore';
import { useInitUserDevices, useVideoSecurity } from '../hooks';
import './shared/VideoTrack/video-security.css';
import { useEffect } from 'react';
import { useLocation } from '@tanstack/react-router';

export const Call = () => {
  const isStarted = useCallStore((state) => state.isStarted);

  useInitUserDevices();
  useVideoSecurity();

  const pathname = useLocation().pathname;
  const mode = useCallStore((state) => state.mode);
  const updateStore = useCallStore((state) => state.updateStore);

  useEffect(() => {
    // Проверяем, что мы находимся на странице /call/<callId> (точное совпадение)
    const isOnCallPage = /^\/call\/[^/]+$/.test(pathname);

    // Если мы на странице звонка и режим compact, переключаем на full
    if (isOnCallPage && mode === 'compact') {
      updateStore('mode', 'full');
    }
  }, [pathname, mode, updateStore]);

  return (
    <div className="h-[calc(100vh-64px)]">
      <div className="flex h-full w-full flex-col">
        {isStarted ? (
          <div id="videoConferenceContainer" className="bg-gray-0 h-full">
            <ActiveRoom />
          </div>
        ) : (
          <PreJoin />
        )}
      </div>
      <PermissionsDialog />
    </div>
  );
};
